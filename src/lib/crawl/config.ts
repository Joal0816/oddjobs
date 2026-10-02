/**
 * Crawler configuration — the single source of truth for bot identity and
 * politeness knobs shared by the robots checker, page fetcher and route.
 *
 * Numbers follow RFC 9309 plus the project's politeness requirements:
 *  - max 1 in-flight request per origin (mutex in fetchPage.ts)
 *  - >= 1500 ms between requests to the same origin, with +/- 25% jitter
 *  - 15 s per-attempt timeout; 3 MB response body cap
 *  - robots.txt Crawl-delay honored as max(N, 1.5 s), capped at 15 s;
 *    a Crawl-delay > 30 s means we do not crawl programmatically
 *  - robots.txt results are cached for 24 h
 */

/* ------------------------------------------------------------------ */
/* Bot identity (RFC 9309 §2.2.1 — honest User-Agent with contact info) */
/* ------------------------------------------------------------------ */

export const BOT_NAME = 'oddJobsCareerImporter';

/** Contact page advertised in the User-Agent. Env-overridable. */
export const BOT_CONTACT_URL =
  process.env.ODDJOB_CRAWLER_CONTACT_URL || 'https://oddjobs.example/bot';

/** Contact email advertised in the User-Agent. Env-overridable. */
export const BOT_CONTACT_EMAIL =
  process.env.ODDJOB_CRAWLER_CONTACT_EMAIL || 'jobs@oddjobs.example';

/** Never impersonate Googlebot (or any other named crawler). */
export const USER_AGENT = `${BOT_NAME}/1.0 (+${BOT_CONTACT_URL}; ${BOT_CONTACT_EMAIL})`;

/* ------------------------------------------------------------------ */
/* Politeness / rate limiting (per origin)                             */
/* ------------------------------------------------------------------ */

/** Minimum delay between requests to the same origin, before jitter. */
export const MIN_ORIGIN_DELAY_MS = 1500;

/** +/- jitter applied to every inter-request delay (1500 ms => 1125–1875 ms). */
export const DELAY_JITTER_RATIO = 0.25;

/** Upper bound for a robots.txt Crawl-delay once clamped (15 s). */
export const MAX_CRAWL_DELAY_MS = 15_000;

/** Crawl-delay above this many seconds => refuse to crawl programmatically. */
export const REJECT_CRAWL_DELAY_SEC = 30;

/** Per-attempt request timeout. */
export const FETCH_TIMEOUT_MS = 15_000;

/** Max redirect hops followed per request (then treated as 404 for robots). */
export const MAX_REDIRECTS = 5;

/** Hard cap on response body bytes read (3 MB). */
export const MAX_BODY_BYTES = 3 * 1024 * 1024;

/** robots.txt fetch/parse results are cached for 24 h per origin. */
export const ROBOTS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/* ------------------------------------------------------------------ */
/* Retries                                                             */
/* ------------------------------------------------------------------ */

/** Exponential backoff schedule for 5xx / network failures: 2s, 4s, 8s. */
export const NETWORK_RETRY_DELAYS_MS = [2000, 4000, 8000] as const;

/** Max retries for 5xx/network failures (i.e. up to 4 attempts total). */
export const MAX_NETWORK_RETRIES = 3;

/** Max retries for HTTP 429 responses. */
export const MAX_429_RETRIES = 2;

/** Retry-After values are honored but capped at 60 s. */
export const MAX_RETRY_AFTER_MS = 60_000;
