/**
 * POST /api/crawl — on-demand, robots-safe import of a single career page.
 *
 * Shape (serverless-friendly: all work happens while the request is open):
 *   1. Validate + SSRF-check the user-supplied URL        -> 400 on bad URL
 *   2. Fetch/cache robots.txt and evaluate our UA          -> 200 ok:false if disallowed
 *   3. Politely fetch the page (retries, conditional GET)  -> 429/504 on target issues
 *   4. Run the extraction ladder and return Job[] + skipped
 *
 * Never returns stack traces; failures carry a machine-readable `reason`
 * plus a human-friendly `notes` string.
 */

import { NextResponse, type NextRequest } from 'next/server';
import type { CrawlFailureReason, CrawlResult } from '@/types';
import { extractJobs } from '@/lib/crawl/extract';
import { CrawlError, assertPublicUrl, fetchPage, setOriginDelay } from '@/lib/crawl/fetchPage';
import { checkRobots } from '@/lib/crawl/robots';

/** Route handlers only run while the request is open — no background work. */
export const maxDuration = 60;
export const runtime = 'nodejs';

/** HTTP status per failure reason (robots refusals stay 200, see below). */
const STATUS_BY_REASON: Partial<Record<CrawlFailureReason, number>> = {
  invalid_url: 400,
  origin_halted: 403,
  challenge: 403,
  not_html: 403,
  rate_limited: 429,
  not_found: 404,
  timeout: 504,
  unreachable: 504,
  server_error: 504,
  too_many_redirects: 504,
};

function makeResult(overrides: Partial<CrawlResult> & { ok: boolean }): CrawlResult {
  return {
    origin: '',
    robotsAllowed: false,
    unchanged: false,
    jobs: [],
    skipped: 0,
    source: null,
    crawledAt: new Date().toISOString(),
    reason: null,
    notes: '',
    ...overrides,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function POST(request: NextRequest) {
  try {
    /* 1. Parse and validate the request body --------------------------- */
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      payload = null;
    }
    const urlValue = isRecord(payload) ? payload.url : undefined;
    if (typeof urlValue !== 'string' || !urlValue.trim()) {
      return NextResponse.json(
        makeResult({
          ok: false,
          reason: 'invalid_url',
          notes: 'Provide a "url" string (an absolute http(s) URL) to crawl.',
        }),
        { status: 400 }
      );
    }

    /* 2. SSRF guard: scheme, credentials, DNS -> private/reserved IPs ---- */
    let target: URL;
    try {
      target = await assertPublicUrl(urlValue.trim());
    } catch (err) {
      const kind = err instanceof CrawlError ? err.kind : 'invalid_url';
      const notes = err instanceof CrawlError ? err.message : 'That URL could not be accepted.';
      const status = STATUS_BY_REASON[kind] ?? 400;
      return NextResponse.json(makeResult({ ok: false, reason: kind, notes }), { status });
    }
    const origin = target.origin;

    /* 3. robots.txt (24h cache; status-handling table in robots.ts) ----- */
    const robots = await checkRobots(target.href);
    if (!robots.allowed) {
      // Semantic 403 returned as 200 so the UI can render a friendly reason.
      return NextResponse.json(
        makeResult({
          ok: false,
          origin,
          robotsAllowed: false,
          reason: robots.reason,
          notes: robots.notes,
        })
      );
    }
    // Honor Crawl-delay: max(N, 1.5s) capped at 15s (already clamped there).
    setOriginDelay(origin, robots.crawlDelayMs);

    /* 4. Fetch the page politely (conditional GET + retries + bans) ----- */
    let page;
    try {
      page = await fetchPage(target.href);
    } catch (err) {
      if (err instanceof CrawlError) {
        const status = STATUS_BY_REASON[err.kind] ?? 504;
        return NextResponse.json(
          makeResult({ ok: false, origin, reason: err.kind, notes: err.message }),
          { status }
        );
      }
      throw err;
    }

    if (page.unchanged) {
      return NextResponse.json(
        makeResult({
          ok: true,
          origin,
          robotsAllowed: true,
          unchanged: true,
          notes: 'Page unchanged since the last fetch (HTTP 304) — nothing new to parse.',
        })
      );
    }

    /* 5. Extract ------------------------------------------------------- */
    const extraction = extractJobs(page.body, page.finalUrl);
    const notes = [robots.notes, extraction.notes]
      .concat(page.truncated ? ['Response body truncated at 3 MB.'] : [])
      .filter(Boolean)
      .join(' ')
      .slice(0, 800);

    return NextResponse.json(
      makeResult({
        ok: true,
        origin,
        robotsAllowed: true,
        unchanged: false,
        jobs: extraction.jobs,
        skipped: extraction.skipped,
        source: extraction.source,
        notes,
      })
    );
  } catch {
    // Never leak stack traces or internal errors to the client.
    return NextResponse.json(
      makeResult({
        ok: false,
        reason: 'internal',
        notes: 'Something went wrong while crawling that page. Please try again.',
      }),
      { status: 500 }
    );
  }
}
