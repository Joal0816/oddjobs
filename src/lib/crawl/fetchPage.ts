/**
 * fetchPage.ts — SSRF-guarded, polite HTTP fetching for the career crawler.
 *
 * Responsibilities:
 *  - assertPublicUrl(): validate user-supplied URLs, resolve DNS, and reject
 *    private/loopback/link-local/reserved addresses (SSRF guard).
 *  - per-origin state: concurrency lock (max 1 in flight), minimum delay with
 *    jitter, and a "halted" flag set by hard-ban signals (401/403/999/451,
 *    Cloudflare challenge, persistent 429, non-HTML 200, robots.txt 5xx...).
 *  - crawlFetch(): one polite GET with manual redirect handling (<= 5 hops),
 *    15 s timeout, and a 3 MB body cap.
 *  - fetchPage(): conditional requests (ETag / Last-Modified), retries with
 *    exponential backoff (5xx/network) and Retry-After (429), plus hard-ban
 *    detection that halts the origin with no further probing.
 *
 * Note: in-memory caches (validators, origin state) are per server instance.
 */

import dns from 'node:dns/promises';
import net from 'node:net';
import type { CrawlFailureReason } from '@/types';
import {
  DELAY_JITTER_RATIO,
  FETCH_TIMEOUT_MS,
  MAX_429_RETRIES,
  MAX_BODY_BYTES,
  MAX_NETWORK_RETRIES,
  MAX_REDIRECTS,
  MAX_RETRY_AFTER_MS,
  MIN_ORIGIN_DELAY_MS,
  NETWORK_RETRY_DELAYS_MS,
  USER_AGENT,
} from './config';

/* ------------------------------------------------------------------ */
/* Errors                                                              */
/* ------------------------------------------------------------------ */

/** Error type carrying an API-facing reason code (never a stack trace). */
export class CrawlError extends Error {
  readonly kind: CrawlFailureReason;

  constructor(kind: CrawlFailureReason, message: string) {
    super(message);
    this.name = 'CrawlError';
    this.kind = kind;
  }
}

/* ------------------------------------------------------------------ */
/* SSRF guard                                                          */
/* ------------------------------------------------------------------ */

function isBlockedIpv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) {
    return true; // unparseable => block
  }
  const [a, b] = parts;
  if (a === 0) return true; // 0.0.0.0/8 ("this network" — loops back locally)
  if (a === 10) return true; // 10.0.0.0/8 private
  if (a === 127) return true; // 127.0.0.0/8 loopback
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local (cloud metadata)
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12 private
  if (a === 192 && b === 168) return true; // 192.168.0.0/16 private
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
  if (ip === '255.255.255.255') return true; // broadcast
  return false;
}

function isBlockedIpv6(ip: string): boolean {
  const h = ip.replace(/^\[|\]$/g, '').toLowerCase();
  if (h === '::' || h === '::1') return true; // unspecified / loopback
  // IPv4-mapped / IPv4-compatible forms embed an IPv4 address.
  const mapped = h.match(/^::(?:ffff:|0:)(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mapped) return isBlockedIpv4(mapped[1]);
  const mappedHex = h.match(/^ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (mappedHex) {
    const hi = parseInt(mappedHex[1], 16);
    const lo = parseInt(mappedHex[2], 16);
    return isBlockedIpv4(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
  }
  if (h.startsWith('fc') || h.startsWith('fd')) return true; // fc00::/7 unique local
  if (/^fe[89ab]/.test(h)) return true; // fe80::/10 link-local
  return false;
}

/** True for any private / loopback / link-local / reserved IP literal. */
export function isBlockedIp(ip: string): boolean {
  const trimmed = ip.replace(/^\[|\]$/g, '');
  if (net.isIPv4(trimmed)) return isBlockedIpv4(trimmed);
  if (net.isIPv6(trimmed)) return isBlockedIpv6(trimmed);
  return true; // unknown address family => block
}

const BLOCKED_HOSTNAME_SUFFIXES = ['.local', '.localhost', '.internal', '.home.arpa'];

/**
 * Validate a user-supplied URL and confirm (via DNS) that it does not resolve
 * to a private/loopback/link-local/reserved address. Returns the parsed URL.
 * Throws CrawlError('invalid_url' | 'unreachable') on failure.
 */
export async function assertPublicUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new CrawlError('invalid_url', 'That is not a valid absolute URL.');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new CrawlError('invalid_url', 'Only http:// and https:// URLs are supported.');
  }
  if (url.username || url.password) {
    throw new CrawlError('invalid_url', 'URLs with embedded credentials are not allowed.');
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname === '0.0.0.0' ||
    BLOCKED_HOSTNAME_SUFFIXES.some((s) => hostname.endsWith(s))
  ) {
    throw new CrawlError('invalid_url', 'That host is not a public address.');
  }
  // Literal IPs are checked before DNS; hostnames are checked after resolving.
  if (net.isIP(hostname) && isBlockedIp(hostname)) {
    throw new CrawlError('invalid_url', 'That URL points to a private or reserved address.');
  }

  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const entry of addresses) {
      if (isBlockedIp(entry.address)) {
        throw new CrawlError(
          'invalid_url',
          'That hostname resolves to a private or reserved address.'
        );
      }
    }
  } catch (err) {
    if (err instanceof CrawlError) throw err;
    const code =
      err && typeof err === 'object' && 'code' in err ? String((err as { code: unknown }).code) : '';
    if (code === 'ENOTFOUND' || code === 'EAI_NONAME') {
      throw new CrawlError('invalid_url', 'That hostname could not be resolved.');
    }
    throw new CrawlError('unreachable', 'The hostname lookup failed.');
  }

  return url;
}

/* ------------------------------------------------------------------ */
/* Per-origin politeness state                                         */
/* ------------------------------------------------------------------ */

interface OriginState {
  lastRequestAt: number;
  minDelayMs: number;
  halted?: string;
}

const originStates = new Map<string, OriginState>();
const originTails = new Map<string, Promise<void>>();

function stateFor(origin: string): OriginState {
  let state = originStates.get(origin);
  if (!state) {
    state = { lastRequestAt: 0, minDelayMs: MIN_ORIGIN_DELAY_MS };
    originStates.set(origin, state);
  }
  return state;
}

/** Stop crawling this origin permanently (for this server instance). */
export function haltOrigin(origin: string, reason: string): void {
  const state = stateFor(origin);
  if (!state.halted) state.halted = reason;
}

/** Why this origin is halted, or undefined when it is still crawlable. */
export function getOriginHalt(origin: string): string | undefined {
  return originStates.get(origin)?.halted;
}

/** Raise the per-origin minimum delay (used for robots.txt Crawl-delay). */
export function setOriginDelay(origin: string, delayMs: number): void {
  const state = stateFor(origin);
  state.minDelayMs = Math.max(state.minDelayMs, delayMs);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** +/-25% jitter around the configured minimum delay. */
function jittered(baseMs: number): number {
  const jitter = (Math.random() * 2 - 1) * DELAY_JITTER_RATIO;
  return Math.round(baseMs * (1 + jitter));
}

/** Enforce "min delay between requests to the same origin", reserving the slot. */
async function waitOriginSlot(origin: string): Promise<void> {
  const state = stateFor(origin);
  const now = Date.now();
  const readyAt = state.lastRequestAt + jittered(state.minDelayMs);
  const wait = Math.max(0, readyAt - now);
  state.lastRequestAt = now + wait; // reserve this slot so concurrent callers queue
  if (wait > 0) await sleep(wait);
}

/** Serialize tasks per origin (max concurrency 1). Tails never reject. */
async function withOriginLock<T>(origin: string, task: () => Promise<T>): Promise<T> {
  const previous = originTails.get(origin) ?? Promise.resolve();
  const run = previous.then(() => task());
  originTails.set(
    origin,
    run.then(
      () => undefined,
      () => undefined
    )
  );
  return run;
}

/* ------------------------------------------------------------------ */
/* Low-level fetch                                                     */
/* ------------------------------------------------------------------ */

export interface RawFetchResult {
  status: number;
  headers: Headers;
  body: string;
  finalUrl: string;
  truncated: boolean;
}

interface FetchOptions {
  headers?: Record<string, string>;
  maxRedirects?: number;
}

function translateFetchError(err: unknown): CrawlError {
  const name =
    err && typeof err === 'object' && 'name' in err ? String((err as { name: unknown }).name) : '';
  if (name === 'TimeoutError' || name === 'AbortError') {
    return new CrawlError('timeout', 'The request timed out after 15 seconds.');
  }
  const message = err instanceof Error ? err.message : '';
  if (/status/i.test(message) && /range|invalid|allowed/i.test(message)) {
    // e.g. LinkedIn-style HTTP 999 — outside the valid fetch status range.
    return new CrawlError(
      'origin_halted',
      'The site answered with a non-standard status (possible bot wall).'
    );
  }
  return new CrawlError('unreachable', 'Could not reach the target site.');
}

/** Read at most maxBytes from a response body, cancelling beyond the cap. */
async function readBodyCapped(response: Response, maxBytes: number): Promise<{ body: string; truncated: boolean }> {
  if (!response.body) return { body: '', truncated: false };
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let received = 0;
  let truncated = false;
  let out = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      let chunk = value;
      if (received + chunk.byteLength > maxBytes) {
        chunk = chunk.slice(0, Math.max(0, maxBytes - received));
        truncated = true;
      }
      received += chunk.byteLength;
      out += decoder.decode(chunk, { stream: true });
      if (truncated) break;
    }
    out += decoder.decode();
  } finally {
    if (truncated) await reader.cancel().catch(() => undefined);
  }
  return { body: out, truncated };
}

/** One rate-limited, timeout-bounded network round-trip to a single URL. */
async function roundTrip(url: URL, headers: Record<string, string>): Promise<Omit<RawFetchResult, 'finalUrl'>> {
  const origin = url.origin;
  const halted = getOriginHalt(origin);
  if (halted) {
    throw new CrawlError('origin_halted', `Stopped crawling this origin: ${halted}`);
  }
  return withOriginLock(origin, async () => {
    await waitOriginSlot(origin);
    let response: Response;
    try {
      response = await fetch(url.href, {
        method: 'GET',
        redirect: 'manual',
        headers,
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
    } catch (err) {
      throw translateFetchError(err);
    }
    const { body, truncated } = await readBodyCapped(response, MAX_BODY_BYTES);
    return { status: response.status, headers: response.headers, body, truncated };
  });
}

/**
 * Polite GET with manual redirect handling (<= 5 hops; more => CrawlError
 * 'too_many_redirects', which robots.ts treats as 404). Every hop is
 * re-validated by the SSRF guard.
 */
export async function crawlFetch(input: string, opts: FetchOptions = {}): Promise<RawFetchResult> {
  let current = await assertPublicUrl(input);
  const maxRedirects = opts.maxRedirects ?? MAX_REDIRECTS;
  const headers: Record<string, string> = { 'User-Agent': USER_AGENT, ...(opts.headers ?? {}) };

  for (let hop = 0; hop <= maxRedirects; hop++) {
    const res = await roundTrip(current, headers);
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) {
        return { ...res, finalUrl: current.href }; // broken redirect (or 304) — return as-is
      }
      if (hop === maxRedirects) {
        throw new CrawlError('too_many_redirects', `Exceeded ${maxRedirects} redirects.`);
      }
      current = await assertPublicUrl(new URL(location, current.href).href);
      continue;
    }
    return { ...res, finalUrl: current.href };
  }
  throw new CrawlError('too_many_redirects', 'Exceeded the redirect limit.');
}

/* ------------------------------------------------------------------ */
/* High-level page fetch with retries / conditional requests           */
/* ------------------------------------------------------------------ */

export interface PageFetchResult {
  status: number;
  finalUrl: string;
  headers: Headers;
  body: string;
  truncated: boolean;
  unchanged: boolean;
}

/**
 * Conditional-request validators, keyed by origin (per spec for this MVP).
 * Note: per-instance, in-memory only — wrong-origin validators can only cause
 * a harmless 200, never a false 304 (servers match validators per URL).
 */
const validatorCache = new Map<string, { etag?: string; lastModified?: string; fetchedAt: number }>();

function backoffMs(retryIndex: number): number {
  const index = Math.min(retryIndex, NETWORK_RETRY_DELAYS_MS.length - 1);
  return jittered(NETWORK_RETRY_DELAYS_MS[index]);
}

/** Honor Retry-After: integer = seconds, otherwise an HTTP-date. */
export function parseRetryAfterMs(value: string | null): number {
  if (!value) return MIN_ORIGIN_DELAY_MS;
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed) * 1000;
  const date = Date.parse(trimmed);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return MIN_ORIGIN_DELAY_MS;
}

const CHALLENGE_MARKERS = /cf-browser-verification|just a moment|cf-chl-/i;

function looksLikeChallengePage(body: string): boolean {
  return CHALLENGE_MARKERS.test(body.slice(0, 64 * 1024));
}

/** Hard-ban signals: halt the origin and stop probing. */
function hardBanKind(res: RawFetchResult): CrawlFailureReason | null {
  const s = res.status;
  const server = (res.headers.get('server') || '').toLowerCase();
  const cfMitigated = (res.headers.get('cf-mitigated') || '').toLowerCase();
  if (cfMitigated === 'challenge') return 'challenge';
  if (s === 401 || s === 403) return server.includes('cloudflare') ? 'challenge' : 'origin_halted';
  if (s === 999 || s === 451) return 'origin_halted';
  if (server.includes('cloudflare') && s === 503) return 'challenge';
  return null;
}

const BAN_MESSAGES: Record<string, string> = {
  origin_halted: 'The site rejected our crawler (401/403/451/999) — not probing further.',
  challenge: 'The site served an anti-bot challenge — not probing further.',
  not_html: 'The URL did not return an HTML page — not probing further.',
  rate_limited: 'The site is rate limiting us (HTTP 429) — not probing further.',
};

/**
 * Fetch a page for extraction:
 *  - conditional GET (ETag / Last-Modified) with 304 => unchanged
 *  - 5xx/network retries: 2s, 4s, 8s backoff (+/-25%), max 3 retries
 *  - 429 retries: honor Retry-After (capped 60s), max 2 retries
 *  - hard-ban signals halt the origin with no further probing
 */
export async function fetchPage(rawUrl: string): Promise<PageFetchResult> {
  const url = await assertPublicUrl(rawUrl);
  const origin = url.origin;

  const headers: Record<string, string> = {
    'User-Agent': USER_AGENT,
    Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.8',
  };
  const cached = validatorCache.get(origin);
  if (cached?.etag) headers['If-None-Match'] = cached.etag;
  if (cached?.lastModified) headers['If-Modified-Since'] = cached.lastModified;

  let networkRetries = 0;
  let rateRetries = 0;

  for (;;) {
    let res: RawFetchResult;
    try {
      res = await crawlFetch(url.href, { headers });
    } catch (err) {
      if (
        err instanceof CrawlError &&
        (err.kind === 'timeout' || err.kind === 'unreachable') &&
        networkRetries < MAX_NETWORK_RETRIES
      ) {
        await sleep(backoffMs(networkRetries));
        networkRetries += 1;
        continue;
      }
      throw err;
    }

    // Conditional request hit — skip body parsing entirely.
    if (res.status === 304) {
      validatorCache.set(origin, {
        etag: cached?.etag,
        lastModified: cached?.lastModified,
        fetchedAt: Date.now(),
      });
      return {
        status: 304,
        finalUrl: res.finalUrl,
        headers: res.headers,
        body: '',
        truncated: false,
        unchanged: true,
      };
    }

    if (res.status === 429) {
      if (rateRetries < MAX_429_RETRIES) {
        rateRetries += 1;
        const waitMs = Math.min(parseRetryAfterMs(res.headers.get('retry-after')), MAX_RETRY_AFTER_MS);
        await sleep(Math.max(waitMs, MIN_ORIGIN_DELAY_MS));
        continue;
      }
      haltOrigin(origin, BAN_MESSAGES.rate_limited);
      throw new CrawlError('rate_limited', BAN_MESSAGES.rate_limited);
    }

    const banKind = hardBanKind(res);
    if (banKind) {
      const message = BAN_MESSAGES[banKind] ?? BAN_MESSAGES.origin_halted;
      haltOrigin(origin, message);
      throw new CrawlError(banKind, message);
    }

    if (res.status >= 500) {
      if (networkRetries < MAX_NETWORK_RETRIES) {
        await sleep(backoffMs(networkRetries));
        networkRetries += 1;
        continue;
      }
      throw new CrawlError(
        'server_error',
        `The site returned HTTP ${res.status} after ${MAX_NETWORK_RETRIES} retries.`
      );
    }

    if (res.status >= 400) {
      if (res.status === 404 || res.status === 410) {
        throw new CrawlError('not_found', 'That page does not exist (HTTP 404/410).');
      }
      throw new CrawlError('unreachable', `The site answered with HTTP ${res.status}.`);
    }

    // 2xx — must be the HTML we expect, and not a challenge page.
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      const message = `Expected an HTML page but the server sent "${contentType || 'no content type'}".`;
      haltOrigin(origin, message);
      throw new CrawlError('not_html', message);
    }
    if (!res.body.trim()) {
      haltOrigin(origin, 'The page body was empty.');
      throw new CrawlError('not_html', 'The page body was empty.');
    }
    if (looksLikeChallengePage(res.body)) {
      haltOrigin(origin, BAN_MESSAGES.challenge);
      throw new CrawlError('challenge', BAN_MESSAGES.challenge);
    }

    const entry: { etag?: string; lastModified?: string; fetchedAt: number } = {
      fetchedAt: Date.now(),
    };
    const etag = res.headers.get('etag');
    const lastModified = res.headers.get('last-modified');
    if (etag) entry.etag = etag;
    if (lastModified) entry.lastModified = lastModified;
    validatorCache.set(origin, entry);

    return {
      status: res.status,
      finalUrl: res.finalUrl,
      headers: res.headers,
      body: res.body,
      truncated: res.truncated,
      unchanged: false,
    };
  }
}
