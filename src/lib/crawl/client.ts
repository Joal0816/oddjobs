/**
 * client.ts — browser-side helper for POST /api/crawl.
 *
 * Safe to import from client components (it pulls in none of the server-only
 * crawler modules). No UI is built here; callers render whatever they need.
 */

import type { CrawlResult } from '@/types';

const CRAWL_ENDPOINT = '/api/crawl';

function emptyResult(notes: string): CrawlResult {
  return {
    ok: false,
    origin: '',
    robotsAllowed: false,
    unchanged: false,
    jobs: [],
    skipped: 0,
    source: null,
    crawledAt: new Date().toISOString(),
    reason: 'internal',
    notes,
  };
}

/**
 * Ask the server to crawl a career page (robots.txt-checked, rate-limited).
 * Resolves with the API's CrawlResult — check `ok` / `reason` / `notes`
 * rather than throwing for expected failures (robots refusals, 429s, ...).
 */
export async function crawlCareerPage(url: string): Promise<CrawlResult> {
  let response: Response;
  try {
    response = await fetch(CRAWL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
  } catch {
    return emptyResult('Could not reach the crawler service.');
  }

  try {
    const data: unknown = await response.json();
    if (data && typeof data === 'object' && 'ok' in data) {
      return data as CrawlResult;
    }
  } catch {
    // fall through to the generic message below
  }
  return emptyResult(`Crawler responded with HTTP ${response.status}.`);
}
