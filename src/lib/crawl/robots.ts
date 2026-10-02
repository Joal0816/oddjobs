/**
 * robots.ts — robots.txt fetching, status handling and caching.
 *
 * We do NOT reimplement rule precedence (longest match wins, Allow beats
 * Disallow on ties, `*` / `$` support) — robots-parser does that per RFC 9309.
 * This module owns the *fetch* status handling table:
 *
 *  - 2xx            -> parse the body
 *  - 3xx            -> follow <= 5 hops (crawlFetch), then treat as 404
 *  - 404 / missing  -> no restrictions (allow-all)
 *  - 4xx except 429 -> no restrictions (incl. 401/403)
 *  - 429            -> assume disallowed (do not crawl)
 *  - 5xx / DNS fail -> stop crawling that origin entirely
 *  - result cached for 24 h per origin
 *
 * Also honors Crawl-delay: effective delay = max(N, 1.5 s), capped at 15 s;
 * Crawl-delay > 30 s means we do not crawl programmatically.
 */

import robotsParser from 'robots-parser';
import type { CrawlFailureReason } from '@/types';
import {
  MAX_CRAWL_DELAY_MS,
  MIN_ORIGIN_DELAY_MS,
  REJECT_CRAWL_DELAY_SEC,
  ROBOTS_CACHE_TTL_MS,
  USER_AGENT,
} from './config';
import { CrawlError, crawlFetch, haltOrigin } from './fetchPage';

type RobotsInstance = ReturnType<typeof robotsParser>;

export type RobotsBlockReason = Extract<
  CrawlFailureReason,
  'blocked_by_robots' | 'robots_unavailable' | 'crawl_delay_too_long' | 'rate_limited'
>;

export interface RobotsAllowDecision {
  allowed: true;
  /** Effective per-origin delay to apply before the next request (ms). */
  crawlDelayMs: number;
  notes: string;
}

export interface RobotsBlockDecision {
  allowed: false;
  reason: RobotsBlockReason;
  notes: string;
}

export type RobotsDecision = RobotsAllowDecision | RobotsBlockDecision;

interface RobotsCacheEntry {
  fetchedAt: number;
  kind: 'ok' | 'allow_all' | 'rate_limited' | 'unavailable';
  robots?: RobotsInstance;
}

const robotsCache = new Map<string, RobotsCacheEntry>();

/**
 * Fetch (or reuse a <= 24 h old cached copy of) robots.txt for the origin of
 * `targetUrl` and apply the status-handling table above.
 */
export async function checkRobots(targetUrl: string): Promise<RobotsDecision> {
  const origin = new URL(targetUrl).origin;

  const cached = robotsCache.get(origin);
  if (cached && Date.now() - cached.fetchedAt < ROBOTS_CACHE_TTL_MS) {
    return evaluate(targetUrl, cached);
  }

  const entry = await loadRobots(origin);
  robotsCache.set(origin, entry);
  return evaluate(targetUrl, entry);
}

async function loadRobots(origin: string): Promise<RobotsCacheEntry> {
  const robotsUrl = `${origin}/robots.txt`;
  const fetchedAt = Date.now();

  try {
    const res = await crawlFetch(robotsUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/plain,*/*;q=0.5',
      },
    });
    const status = res.status;

    if (status >= 200 && status < 300) {
      return { fetchedAt, kind: 'ok', robots: robotsParser(robotsUrl, res.body) };
    }
    if (status === 404) return { fetchedAt, kind: 'allow_all' };
    if (status === 429) {
      // 429 on robots.txt => assume disallowed and stop probing this origin.
      haltOrigin(origin, 'robots.txt returned HTTP 429 (rate limited).');
      return { fetchedAt, kind: 'rate_limited' };
    }
    if (status >= 400 && status < 500) return { fetchedAt, kind: 'allow_all' }; // incl. 401/403
    if (status >= 500) {
      haltOrigin(origin, `robots.txt returned HTTP ${status}.`);
      return { fetchedAt, kind: 'unavailable' };
    }
    // 3xx without a Location header (or after the redirect limit) => 404 => allow-all.
    return { fetchedAt, kind: 'allow_all' };
  } catch (err) {
    if (err instanceof CrawlError) {
      // > 5 redirect hops on robots.txt is treated as 404 per the table.
      if (err.kind === 'too_many_redirects') return { fetchedAt, kind: 'allow_all' };
      if (err.kind === 'timeout' || err.kind === 'unreachable' || err.kind === 'origin_halted') {
        // 5xx / DNS failure => stop crawling this origin.
        haltOrigin(origin, `robots.txt could not be retrieved (${err.kind}).`);
        return { fetchedAt, kind: 'unavailable' };
      }
      if (err.kind === 'invalid_url') return { fetchedAt, kind: 'allow_all' };
    }
    throw err;
  }
}

function evaluate(targetUrl: string, entry: RobotsCacheEntry): RobotsDecision {
  if (entry.kind === 'unavailable') {
    return {
      allowed: false,
      reason: 'robots_unavailable',
      notes:
        'robots.txt could not be retrieved (5xx or DNS failure), so we stopped crawling this origin.',
    };
  }
  if (entry.kind === 'rate_limited') {
    return {
      allowed: false,
      reason: 'rate_limited',
      notes: 'robots.txt returned HTTP 429; we assume disallowed and will not crawl.',
    };
  }
  if (entry.kind === 'allow_all') {
    return {
      allowed: true,
      crawlDelayMs: MIN_ORIGIN_DELAY_MS,
      notes: 'No robots.txt restrictions apply (missing robots.txt or a 4xx status = allow-all).',
    };
  }

  const robots = entry.robots;
  if (!robots) {
    return {
      allowed: true,
      crawlDelayMs: MIN_ORIGIN_DELAY_MS,
      notes: 'No robots.txt restrictions apply.',
    };
  }

  const allowed = robots.isAllowed(targetUrl, USER_AGENT);
  if (allowed === false) {
    return {
      allowed: false,
      reason: 'blocked_by_robots',
      notes: 'robots.txt disallows this URL for our user-agent.',
    };
  }
  if (allowed === undefined) {
    // Out of scope for this robots.txt (e.g. foreign origin) => do not crawl.
    return {
      allowed: false,
      reason: 'blocked_by_robots',
      notes: 'This URL is out of scope for the site robots.txt, so we will not crawl it.',
    };
  }

  const delaySec = robots.getCrawlDelay(USER_AGENT);
  if (typeof delaySec === 'number' && Number.isFinite(delaySec) && delaySec > 0) {
    if (delaySec > REJECT_CRAWL_DELAY_SEC) {
      return {
        allowed: false,
        reason: 'crawl_delay_too_long',
        notes: `robots.txt asks for a ${delaySec}s Crawl-delay (> ${REJECT_CRAWL_DELAY_SEC}s); not crawling programmatically.`,
      };
    }
    const clampedSec = Math.min(
      Math.max(delaySec, MIN_ORIGIN_DELAY_MS / 1000),
      MAX_CRAWL_DELAY_MS / 1000
    );
    return {
      allowed: true,
      crawlDelayMs: Math.round(clampedSec * 1000),
      notes: `Allowed by robots.txt; honoring Crawl-delay: ${delaySec}s.`,
    };
  }

  return { allowed: true, crawlDelayMs: MIN_ORIGIN_DELAY_MS, notes: 'Allowed by robots.txt.' };
}
