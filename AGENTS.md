# AGENTS.md

Guidance for AI agents (and humans) working in this repository.

**Read this before changing anything.** Several conventions here are intentional
and look like bugs until you know why they exist.

---

## 1. What this is

`oddJobs` (also written `addJobs`) is a hyperlocal student workforce marketplace
for MSU-IIT, built as the MVP for **BCA172 – Technopreneurship**.

- **Production:** https://oddjobs.joalvergs.tech
- **Repo:** https://github.com/oddjobs-org/oddjobs (branch `main`)
- **Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) · Tailwind 3.4

### There is no backend

This is the single most important fact about the repo.

- **No database. No auth server. No ORM.** Only one API route exists (§5).
- All app data lives in `src/data/mockData.ts` as static, synchronous `const`
  exports and is hydrated into React state at startup.
- User changes persist to **`localStorage`** (keys prefixed `oddjobs_`), which
  means state is per-browser and **survives reload but is never shared**.
- There is no server-side rendering of data — `src/app/page.tsx` is a client
  component wrapping `<AppProvider>`.

Do not introduce a database, an auth flow, or server state without an explicit
decision to change the architecture. If you find yourself wanting one, stop and
ask.

---

## 2. Commands

```bash
npm run dev     # next dev --turbopack  (http://localhost:3000)
npm run build   # next build
npm run start   # next start (production)
npm run lint    # eslint src public/sw.js
```

| Command | Notes |
| --- | --- |
| `npm run lint` | **Scoped on purpose.** It runs `eslint src public/sw.js`, **not** `eslint .` — the flat config in `eslint.config.mjs` has no `ignores`, so `eslint .` also sweeps in `.next/` build output plus the vendored `cli/` and `public/oddjobs-cli.js`, producing thousands of bogus errors. |
| `npm run lint` | **Never** change this back to `next lint` — Next 16 removed the subcommand, and the CLI then treats `lint` as a project directory and fails with `Invalid project directory provided`. |
| — | **There is no test script.** Verify with `npx tsc --noEmit` + `npm run lint` + `npm run build`. |

Type checking: `npx tsc --noEmit` (strict mode is on; `noEmit: true`).

Path alias: `@/*` → `./src/*`.

---

## 3. Architecture map

```
src/
  app/
    page.tsx              'use client' → <AppProvider><MainApp /></AppProvider>
    layout.tsx            metadata + `export const viewport` (NOT inside metadata)
    manifest.ts           PWA manifest (file-convention; auto-emits <link rel=manifest>)
    globals.css           CSS vars, .glass-*, .amber-glow-btn, keyframes
    api/crawl/route.ts    the only API route (§5)
  context/AppContext.tsx  ALL application state (§4)
  data/mockData.ts        seed data (INITIAL_JOBS, etc.)
  types/index.ts          every shared interface
  lib/crawl/              crawler library (§5)
  components/             view components, dispatched by MainApp (not by the router)
```

**Navigation is state, not routing.** `src/components/MainApp.tsx` is a plain
`activeTab === '...'` dispatcher across `landing | home | jobs | connect | post |
agreement | profile | admin`. There is no App Router folder per view, and the
landing page contains **no `id`, `anchor`, or `href`** — navigation is
`setActiveTab(...)` buttons only. Do not add routes or anchors for views.

---

## 4. State conventions

`src/context/AppContext.tsx` owns everything. Relevant surface:

- `jobs` — `useState<Job[]>(INITIAL_JOBS)`, hydrated from `localStorage['oddjobs_jobs']`
- `postJob(...)` — adds one job, generates id `job_${Date.now()}`, persists, toasts, switches to the jobs tab
- `addJobs(jobs: Job[])` — **bulk merge used by the crawler.** Dedupes by `id`, prepends, persists to the same key. Prefer this over `postJob` for imports.
- `setJobs` is **deliberately not exposed** on `AppContextType`.

**Type conventions in `src/types/index.ts`:**

- Ids are strings: `job_${Date.now()}` for user-created records, `job_imp_<hash>`
  for crawler imports (stable across re-crawls so re-importing dedupes).
- **`postedAt` and `deadline` are human-readable `string`s, not `Date`.**
  Convention: relative phrases (`'Just now'`, `'2h ago'`) or
  `new Date().toLocaleDateString('en-US', {...})`.
- Everything on `Job` is required except `requesterOrg?`.

### The category taxonomy is intentionally closed

```ts
category: 'Web Development' | 'Photography' | 'Graphic Design'
        | 'Academic Tutoring' | 'Event Support' | 'Errands & Logistics' | 'Other';
```

- `'Other'` exists because crawled postings rarely match the six campus keyword
  rules. **`extract.ts` falls back to `'Other'` — it must not skip them.**
- Do **not** broaden the keyword regexes in `extract.ts` to force a match; that
  misclassifies postings (e.g. "lab technician" → "Errands & Logistics") and is
  worse than `'Other'`.
- If you widen this union, keep `Job['category']` and
  `VerificationItem['gigCategory']` in sync, and update the filter array in
  `JobListings.tsx` and the `<select>` in `PostJob.tsx`.

---

## 5. The crawler — safety invariants

`POST /api/crawl` fetches **public career pages owned by paying organizations**,
so those orgs never have to post manually. The library lives in `src/lib/crawl/`.

| File | Role |
| --- | --- |
| `config.ts` | Bot identity and every politeness constant |
| `robots.ts` | robots.txt fetch + status-code policy |
| `fetchPage.ts` | SSRF guard, per-origin rate limit, retries, ban detection |
| `extract.ts` | JSON-LD → microdata → ATS → selector extraction ladder |
| `client.ts` | Browser-side `crawlCareerPage()` helper (imports no server code) |

**These invariants are the product. Relaxing them is a regression, not an
optimization:**

1. **robots.txt status policy** (RFC 9309 / Google's interpretation):
   `2xx` parse · `3xx` ≤5 hops then treat as 404 · `404`/missing → no restrictions
   · **any `4xx` except `429` (incl. `401`/`403`) → no restrictions** · **`429` →
   refuse to crawl** · **`5xx`/DNS failure → halt the origin**.
2. **Pacing:** 1 request at a time per origin, **1500 ms minimum delay with ±25%
   jitter**, `Crawl-delay` honored (refuse if >30 s), 15 s per-attempt timeout.
3. **Retries:** `5xx`/network → `2s, 4s, 8s` ±jitter, max 3 · `429` → honor
   `Retry-After` (integer seconds or HTTP-date), cap 60 s, max 2, then halt.
4. **Hard-ban signals halt the origin permanently** (no further probing):
   `401`/`403`/`999`/`451`, `server: cloudflare` with 403/503, `cf-mitigated:
   challenge`, body markers (`cf-browser-verification`, `Just a moment...`,
   `cf-chl-`), or a 200 whose body is not the expected HTML.
5. **Honest User-Agent:** `oddJobsCareerImporter/1.0 (+contact; email)` from
   `config.ts`, overridable via `ODDJOB_CRAWLER_CONTACT_URL` /
   `ODDJOB_CRAWLER_CONTACT_EMAIL`. **Never impersonate Googlebot or any brand.**
6. **SSRF guard:** non-`http(s)` schemes, credentialed URLs, `.local`/
   `localhost`/`.internal`/`home.arpa`, and **DNS-resolved** private / loopback /
   link-local / reserved addresses (incl. v4-mapped v6) are rejected with `400`.
   The check is on the resolved address, not the hostname string — keep it that way.
7. **Scope:** public, organization-owned pages only. **Never crawl Facebook,
   Instagram, or LinkedIn feeds** — that violates their ToS and requires
   defeating authentication. The landing page promises customers we don't.

Error responses must never leak stack traces.

### Serverless constraints

Route handlers run only while the request is open — no background work after the
response. The route exports `maxDuration = 60` and `runtime = 'nodejs'`. One
origin, one URL per request is the intended shape; if you need multi-page
crawling, use a Vercel Cron with a DB-backed queue rather than sleeping in-request.

---

## 6. PWA

- `src/app/manifest.ts` → `/manifest.webmanifest`. Icons at `public/icon-192.png`,
  `icon-512.png`, plus `maskable` variants (mark at 76% to clear Chrome's safe zone).
  **Never declare a `sizes` that doesn't match the real file** — it silently breaks
  installability. Verify with `identify <file>` before changing.
- `public/sw.js` — hand-written, dependency-free. Strategies: `cache-first` for
  immutable `/_next/static`, `stale-while-revalidate` for navigations, LRU cap 60.
- **`sw.js` must never cache `/api/*`, non-GET requests, or cross-origin
  responses.** This includes `/api/crawl`.
- Bump `CACHE_VERSION` when changing cached assets; old caches are purged on
  `activate`.
- `src/components/RegisterSW.tsx` unregisters stray SWs before registering `/sw.js`.

---

## 7. Landing page design system

`src/components/LandingPage.tsx` is a single inline component (no sub-components
except `CampusReviews`). Match these exactly:

- **Section shell:** `<section className="my-14 sm:my-20">`
- **Header:** eyebrow `text-xs uppercase font-extrabold tracking-wider text-amber-400 block mb-1` +
  `h2` `text-2xl sm:text-3xl font-extrabold text-white tracking-tight`
- **Grid:** `grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6`
- **Card:** `p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-lg`
- **Accent tiles cycle:** amber → sky → emerald → repeat
- **Colors:** bg `#08080a`, primary accent `amber-400`, borders `zinc-800`,
  body `text-zinc-300`, muted `text-zinc-400`
- **Primary button:** `.amber-glow-btn` (defined in `globals.css`) — never `.glass-*` here

**Copy rules:** sentence-case `font-extrabold` headlines, no exclamation marks,
**no emoji on the landing page** (it is 100% emoji-free; emoji only appear in
app-internal UI), product noun is **"gigs"**, brand is **"oddJobs"**, second-person
and campus-local.

Beware `react/no-unescaped-entities` (from `next/core-web-vitals`): apostrophes
in JSX text are a lint error — write `&apos;` or restructure the sentence.

---

## 8. Deployment

- **Git-connected.** Pushing to `main` auto-deploys to production (verified: push
  → build in ~20 s → alias updated). The Vercel GitHub App must stay installed on
  the **`oddjobs-org` organization**, not just your personal account — an
  org-owned repo cannot connect otherwise.
- Vercel project `oddjobs`, alias https://oddjobs.joalvergs.tech.
- One-off deploys also work: `vercel --prod --yes` from the project directory.
- `.vercel/` is gitignored; `.vercel/project.json` holds the local link.

**Before pushing, always run:**

```bash
npx tsc --noEmit && npm run lint && npm run build
```

---

## 9. Known quirks (do not "fix" blindly)

| Quirk | Detail |
| --- | --- |
| `eslint-config-next` pinned `15.1.0` while Next is `^16.3.8` | Version drift that predates this work. Lint passes; upgrading is its own task. |
| Pre-commit "Hermes Review" hook prints `HTTP 401: Upstream request failed` | Cosmetic — the commit still lands. Not caused by your changes. |
| `metadata.manifest` + `manifest.ts` | `layout.tsx` sets `manifest: "/manifest.webmanifest"` explicitly as insurance alongside Next's file convention. Rendered HTML confirmed to contain exactly one `<link rel="manifest">`. Leave it. |
| `images.remotePatterns` for `images.unsplash.com` | Required — `mockData.ts` has ~29 Unsplash URLs consumed by `next/image`. Removing it 500s the home page. |
| Maskable icons are 16-bit RGB, not 8-bit RGBA | Output of ImageMagick's solid-canvas composite. Valid PNGs at declared sizes; cosmetic only. |
| `skipped` in crawl responses | Counts only `missing_title` now. Category fallback no longer contributes. |

---

## 10. Checklist for agents

1. Read §5 before touching `src/lib/crawl/**`. The safety invariants are not
   negotiable.
2. Keep write scopes narrow; don't edit files you weren't asked to.
3. Verify with `tsc` + `lint` + `build` — all three must exit 0.
4. For crawler changes, exercise `extractJobs()` directly with a JSON-LD fixture
   (Node 24 runs TS via `node --experimental-strip-types`).
5. For landing changes, re-check §7 against the surrounding JSX.
6. Push to `main` only after the three gates pass — it deploys to production.
