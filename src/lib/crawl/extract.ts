/**
 * extract.ts — career-page extraction ladder.
 *
 * Runs in order and stops at the first rung that yields candidates:
 *   1. JSON-LD  <script type="application/ld+json"> JobPosting
 *   2. Microdata  [itemtype*="schema.org/JobPosting"]
 *   3. ATS URL patterns (greenhouse / lever / ashby / workable / smartrecruiters / workday)
 *   4. Generic selectors (.job-card, [class*="job-listing"] article, li.job,
 *      a[href*="/careers/"], a[href*="/jobs/"])
 *
 * Mapping rules (documented choices):
 *  - Postings WITHOUT a title, or whose text does not match any of the six
 *    OddJobs categories, are skipped and counted in `skipped` (no category
 *    fallback — mislabeling a job is worse than omitting it).
 *  - budget: PHP salaries are used as-is; USD/EUR/... are converted with a
 *    STATIC indicative rate table (MVP only — swap for a live FX source);
 *    missing/unknown-currency salaries import as budget 0 and are reported
 *    in `notes` rather than dropped.
 *  - employmentType: PART_TIME => 'Part-time', FULL_TIME => 'Recurring'
 *    (OddJobs has no full-time concept), TEMPORARY/CONTRACT => 'One-time',
 *    everything else (INTERN/VOLUNTEER/PER_DIEM/SHIFT/seasonal/unspecified)
 *    => 'Gig'.
 *  - budgetUnit: HOUR => 'hour', DAY => 'day', WEEK/MONTH/YEAR or missing
 *    => 'job' (treated as a per-engagement figure).
 *  - Jobs are keyed by a stable hash of identifier/URL so re-crawling the
 *    same page produces the same ids (and the UI can dedupe).
 */

import { load, type CheerioAPI } from 'cheerio';
import type { CrawlSource, Job } from '@/types';

export interface ExtractionResult {
  jobs: Job[];
  skipped: number;
  source: CrawlSource | null;
  notes: string;
}

/** Normalised posting shared by every rung of the ladder. */
interface RawPosting {
  title?: string;
  description?: string;
  datePosted?: string;
  validThrough?: string;
  employmentType?: string;
  organization?: string;
  location?: string;
  remote?: boolean;
  salary?: { min?: number; max?: number; unit?: string; currency?: string };
  skills?: string[];
  identifier?: string;
  url?: string;
}

type MapOutcome =
  | { job: Job; noSalary: boolean; converted: boolean }
  | { skip: 'missing_title' | 'unknown_category' };

/* Placeholder art for imported postings (local assets render in next/image). */
const IMPORTED_IMAGE = '/logo-clean.png';
const IMPORTED_AVATAR = '/logo-circle.png';

/* ------------------------------------------------------------------ */
/* Small text / value helpers                                          */
/* ------------------------------------------------------------------ */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function strOf(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function numOf(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[,\s]/g, '');
    if (/^\d+(\.\d+)?$/.test(cleaned)) {
      const parsed = Number(cleaned);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}

/** Strip HTML tags, decode the common entities, collapse whitespace, cap length. */
function cleanText(value: string | undefined, max: number): string {
  if (!value) return '';
  const stripped = value.replace(/<[^>]*>/g, ' ');
  const decoded = stripped
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&amp;/gi, '&');
  return decoded.replace(/\s+/g, ' ').trim().slice(0, max);
}

/** Human-readable date matching the app convention (e.g. "Oct 15, 2026"). */
function formatDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function safeOrigin(pageUrl: string): string {
  try {
    return new URL(pageUrl).origin;
  } catch {
    return 'unknown source';
  }
}

function hostOf(href: string): string | undefined {
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

/** FNV-1a + djb2 => 16 hex chars; stable across processes for the same key. */
function stableHash(key: string): string {
  let fnv = 0x811c9dc5;
  for (let i = 0; i < key.length; i += 1) {
    fnv ^= key.charCodeAt(i);
    fnv = Math.imul(fnv, 0x01000193) >>> 0;
  }
  let djb = 5381;
  for (let i = 0; i < key.length; i += 1) {
    djb = (Math.imul(djb, 33) ^ key.charCodeAt(i)) >>> 0;
  }
  return fnv.toString(16).padStart(8, '0') + djb.toString(16).padStart(8, '0');
}

function dedupeKey(raw: RawPosting): string {
  if (raw.identifier) return `id:${raw.identifier}`;
  if (raw.url) return `url:${raw.url}`;
  return `t:${(raw.title || '').toLowerCase()}|${(raw.organization || '').toLowerCase()}|${raw.datePosted || ''}`;
}

/* ------------------------------------------------------------------ */
/* Field mapping                                                       */
/* ------------------------------------------------------------------ */

const CATEGORY_RULES: Array<{ category: Job['category']; pattern: RegExp }> = [
  {
    category: 'Photography',
    pattern: /photograph|\bcamera\b|dslr|mirrorless|videograph|lightroom|\bphoto\b|video edit/i,
  },
  {
    category: 'Graphic Design',
    pattern: /graphic|design|figma|photoshop|illustrator|canva|logo|poster|typograph|brand(ing)?|\bui.?ux\b|layout/i,
  },
  {
    category: 'Academic Tutoring',
    pattern: /tutor|teach|instructor|mentor|academic|lesson|homework|tutorial|student coach/i,
  },
  {
    category: 'Web Development',
    pattern: /web\s*dev|front[-\s]?end|back[-\s]?end|full[-\s]?stack|programm|develop|engineer|coding|coder|javascript|typescript|\breact\b|next\.?js|node\.?js|\bphp\b|laravel|python|wordpress|flutter|software|devops|\bsql\b|\bapi\b|\bhtml\b|\bcss\b|database/i,
  },
  {
    category: 'Event Support',
    pattern: /event|usher|registration|marshal|stage|conference|seminar|festival|banquet|waiter|bartend|service crew|promo(tional)? (girl|boy|staff)|\bhost(ing)?\b|organis(er|ing)|organiz(er|ing)|talent/i,
  },
  {
    category: 'Errands & Logistics',
    pattern: /deliver|driver|riders?\b|courier|errand|logistic|warehouse|clerical|clerk|data entry|assistant|\badmin\b|translator|transcri|research|survey|cleaner|pickup|supply|inventor(y|t)|stock|\bmail\b/i,
  },
];

function inferCategory(text: string): Job['category'] | null {
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(text)) return rule.category;
  }
  return null;
}

/** Static indicative FX table (approximate; MVP only — not live rates). */
const STATIC_FX_TO_PHP: Record<string, number> = {
  USD: 57,
  EUR: 62,
  GBP: 73,
  SGD: 42,
  AUD: 37,
  CAD: 42,
  JPY: 0.38,
  INR: 0.67,
  CNY: 7.9,
  AED: 15.5,
  HKD: 7.3,
  KRW: 0.041,
};

interface BudgetOutcome {
  amount: number;
  converted: boolean;
  unspecified: boolean;
}

function toPhpBudget(salary: RawPosting['salary']): BudgetOutcome {
  if (!salary) return { amount: 0, converted: false, unspecified: true };
  const { min, max } = salary;
  let value: number | undefined;
  if (min !== undefined && max !== undefined) value = Math.round((min + max) / 2);
  else value = max ?? min;
  if (value === undefined || !Number.isFinite(value) || value <= 0) {
    return { amount: 0, converted: false, unspecified: true };
  }
  const currency = (salary.currency || 'PHP').toUpperCase();
  if (currency === 'PHP' || currency === '₱') {
    return { amount: Math.round(value), converted: false, unspecified: false };
  }
  const rate = STATIC_FX_TO_PHP[currency];
  if (rate === undefined) return { amount: 0, converted: false, unspecified: true };
  return { amount: Math.round(value * rate), converted: true, unspecified: false };
}

function mapJobType(employmentType: string | undefined): Job['jobType'] {
  const normalized = (employmentType || '').toUpperCase().replace(/[\s-]+/g, '_');
  if (normalized.includes('PART_TIME')) return 'Part-time';
  if (normalized.includes('FULL_TIME')) return 'Recurring';
  if (normalized.includes('TEMPORARY') || normalized.includes('CONTRACT')) return 'One-time';
  return 'Gig'; // INTERN / VOLUNTEER / PER_DIEM / SHIFT / SEASONAL / unspecified
}

function mapBudgetUnit(unit: string | undefined): Job['budgetUnit'] {
  const normalized = (unit || '').toUpperCase();
  if (normalized.includes('HOUR')) return 'hour';
  if (normalized.includes('DAY')) return 'day';
  return 'job'; // WEEK / MONTH / YEAR / missing => per-engagement figure
}

const SKILL_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: 'JavaScript', pattern: /\bjavascript\b/i },
  { label: 'TypeScript', pattern: /\btypescript\b/i },
  { label: 'React', pattern: /\breact\b|next\.?js/i },
  { label: 'Node.js', pattern: /\bnode\.?js\b/i },
  { label: 'PHP', pattern: /\bphp\b/i },
  { label: 'Laravel', pattern: /laravel/i },
  { label: 'Python', pattern: /python/i },
  { label: 'Java', pattern: /\bjava\b(?!script)/i },
  { label: 'HTML/CSS', pattern: /\bhtml\b|\bcss\b/i },
  { label: 'WordPress', pattern: /wordpress/i },
  { label: 'Flutter', pattern: /flutter/i },
  { label: 'SQL', pattern: /\bsql\b/i },
  { label: 'Git', pattern: /\bgit\b/i },
  { label: 'Figma', pattern: /figma/i },
  { label: 'Photoshop', pattern: /photoshop/i },
  { label: 'Canva', pattern: /canva/i },
  { label: 'Graphic Design', pattern: /graphic design/i },
  { label: 'UI/UX', pattern: /\bui.?ux\b/i },
  { label: 'Photography', pattern: /photograph|dslr/i },
  { label: 'Videography', pattern: /videograph|video edit/i },
  { label: 'Data Entry', pattern: /data entry/i },
  { label: 'Microsoft Excel', pattern: /\bexcel\b/i },
  { label: 'Research', pattern: /research/i },
  { label: 'Copywriting', pattern: /copywrit|content writ/i },
  { label: 'Social Media', pattern: /social media/i },
  { label: 'Event Coordination', pattern: /event coord|event manag/i },
  { label: 'Customer Service', pattern: /customer service|client relation/i },
  { label: 'Tutoring', pattern: /tutor/i },
  { label: 'Translation', pattern: /translat/i },
  { label: 'Communication', pattern: /communicat/i },
];

function pickSkills(explicit: string[] | undefined, text: string): string[] {
  const out: string[] = [];
  for (const item of explicit ?? []) {
    const label = cleanText(item, 40);
    if (label && !out.some((existing) => existing.toLowerCase() === label.toLowerCase())) {
      out.push(label);
    }
    if (out.length >= 6) break;
  }
  if (out.length > 0) return out;
  for (const rule of SKILL_PATTERNS) {
    if (rule.pattern.test(text)) out.push(rule.label);
    if (out.length >= 6) break;
  }
  return out;
}

function mapRawPosting(raw: RawPosting, pageUrl: string): MapOutcome {
  const title = cleanText(raw.title, 140);
  if (!title) return { skip: 'missing_title' };

  const bodyText = cleanText(raw.description, 2000);
  const category = inferCategory(`${title} ${bodyText}`);
  if (!category) return { skip: 'unknown_category' };

  const budget = toPhpBudget(raw.salary);
  const origin = safeOrigin(pageUrl);
  const source = raw.url || pageUrl;
  const description = bodyText ? `${bodyText}\n\nSource: ${source}` : `Source: ${source}`;
  const organization = cleanText(raw.organization, 80);

  const job: Job = {
    id: `job_imp_${stableHash(dedupeKey(raw))}`,
    title,
    category,
    jobType: mapJobType(raw.employmentType),
    budget: budget.amount,
    budgetUnit: mapBudgetUnit(raw.salary?.unit),
    location: raw.remote ? 'Remote' : cleanText(raw.location, 80) || 'Remote',
    schedule: 'Flexible',
    description,
    skills: pickSkills(raw.skills, `${title} ${bodyText}`),
    image: IMPORTED_IMAGE,
    postedAt: formatDate(raw.datePosted) ?? 'Just now',
    deadline: formatDate(raw.validThrough) ?? 'Flexible',
    requesterId: `crawl_${stableHash(origin)}`,
    requesterName: organization || origin,
    requesterAvatar: IMPORTED_AVATAR,
    requesterOrg: organization || undefined,
    status: 'open',
    applicantCount: 0,
  };

  return { job, noSalary: budget.unspecified, converted: budget.converted };
}

/* ------------------------------------------------------------------ */
/* Rung 1: JSON-LD JobPosting                                          */
/* ------------------------------------------------------------------ */

const JSON_LD_SCRIPT_RE = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

function collectJobPostings(node: unknown, out: Array<Record<string, unknown>>): void {
  if (Array.isArray(node)) {
    for (const item of node) collectJobPostings(item, out);
    return;
  }
  if (!isRecord(node)) return;
  const type = node['@type'];
  const types = Array.isArray(type) ? type.map((t) => String(t)) : typeof type === 'string' ? [type] : [];
  if (types.some((t) => t === 'JobPosting' || t.endsWith('/JobPosting'))) out.push(node);
  for (const value of Object.values(node)) {
    if (value && typeof value === 'object') collectJobPostings(value, out);
  }
}

function employmentTypeToString(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const parts = value.filter((v): v is string => typeof v === 'string');
    if (parts.length > 0) return parts.join('/');
  }
  if (isRecord(value)) return strOf(value.name) ?? strOf(value['@type']);
  return undefined;
}

function parseJsonLdSalary(value: unknown): RawPosting['salary'] | undefined {
  if (typeof value === 'number') return { max: value };
  if (!isRecord(value)) return undefined;
  const currency = strOf(value.currency);
  const inner = value.value;
  if (isRecord(inner)) {
    const min = numOf(inner.minValue);
    const max = numOf(inner.maxValue);
    const single = numOf(inner.value);
    if (min === undefined && max === undefined && single === undefined) {
      return currency ? { currency } : undefined;
    }
    return { min, max: max ?? single, unit: strOf(inner.unitText), currency };
  }
  const single = numOf(inner);
  if (single !== undefined) return { max: single, currency };
  return currency ? { currency } : undefined;
}

function parseIdentifier(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const parsed = parseIdentifier(item);
      if (parsed) return parsed;
    }
    return undefined;
  }
  if (isRecord(value)) return strOf(value.value) ?? strOf(value.name);
  return undefined;
}

function parseSkillsList(value: unknown): string[] | undefined {
  if (typeof value === 'string') {
    return value.split(/[,;|/]/).map((part) => part.trim()).filter(Boolean);
  }
  if (Array.isArray(value)) {
    const out: string[] = [];
    for (const item of value) {
      if (typeof item === 'string' && item.trim()) out.push(item.trim());
      else if (isRecord(item)) {
        const name = strOf(item.name);
        if (name) out.push(name);
      }
    }
    return out.length > 0 ? out : undefined;
  }
  if (isRecord(value)) {
    const name = strOf(value.name);
    return name ? [name] : undefined;
  }
  return undefined;
}

function fromJsonLd(node: Record<string, unknown>): RawPosting {
  const hiring = node.hiringOrganization;
  const organization =
    typeof hiring === 'string' ? hiring : isRecord(hiring) ? strOf(hiring.name) : undefined;

  const locationRaw = Array.isArray(node.jobLocation) ? node.jobLocation[0] : node.jobLocation;
  const remote = (strOf(node.jobLocationType) || '').toUpperCase() === 'TELECOMMUTE';
  let location: string | undefined;
  if (isRecord(locationRaw)) {
    const address = isRecord(locationRaw.address) ? locationRaw.address : locationRaw;
    const parts = [strOf(address.addressLocality), strOf(address.addressRegion), strOf(address.addressCountry)].filter(
      (part): part is string => Boolean(part)
    );
    location = parts.length > 0 ? parts.join(', ') : strOf(locationRaw.name);
  } else if (typeof locationRaw === 'string') {
    location = locationRaw;
  }

  return {
    title: strOf(node.title),
    description: strOf(node.description),
    datePosted: strOf(node.datePosted),
    validThrough: strOf(node.validThrough),
    employmentType: employmentTypeToString(node.employmentType),
    organization,
    location,
    remote,
    salary: parseJsonLdSalary(node.baseSalary),
    skills: parseSkillsList(node.skills),
    identifier: parseIdentifier(node.identifier),
    url: strOf(node.url),
  };
}

function extractJsonLd(html: string): RawPosting[] {
  const out: RawPosting[] = [];
  const regex = new RegExp(JSON_LD_SCRIPT_RE.source, JSON_LD_SCRIPT_RE.flags);
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const script = match[1].trim();
    if (!script) continue;
    const jsonText = script.replace(/^<!--/, '').replace(/-->\s*$/, '').trim();
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      continue; // malformed JSON-LD block — skip this block only
    }
    const postings: Array<Record<string, unknown>> = [];
    collectJobPostings(parsed, postings);
    for (const posting of postings) out.push(fromJsonLd(posting));
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Rung 2: Microdata                                                   */
/* ------------------------------------------------------------------ */

function extractMicrodata($: CheerioAPI, pageUrl: string): RawPosting[] {
  const out: RawPosting[] = [];

  $('[itemtype*="schema.org/JobPosting"]').each((_index, element) => {
    const root = $(element);
    const prop = (name: string): string | undefined => {
      const node = root.find(`[itemprop="${name}"]`).first();
      if (!node.length) return undefined;
      const value = node.attr('content') || node.attr('datetime') || node.attr('value') || node.text();
      return value.trim() || undefined;
    };

    const orgNode = root.find('[itemprop="hiringOrganization"]').first();
    let organization: string | undefined;
    if (orgNode.length) {
      organization =
        orgNode.find('[itemprop="name"]').first().text().trim() ||
        orgNode.attr('content')?.trim() ||
        orgNode.text().trim() ||
        undefined;
    }

    const locNode = root.find('[itemprop="jobLocation"]').first();
    let location: string | undefined;
    const jobLocationType = root.find('[itemprop="jobLocationType"]').first();
    const remote =
      (jobLocationType.attr('content') || jobLocationType.text() || '').trim().toUpperCase() ===
      'TELECOMMUTE';
    if (locNode.length) {
      const scope = locNode;
      const parts = [
        scope.find('[itemprop="addressLocality"]').first().text().trim(),
        scope.find('[itemprop="addressRegion"]').first().text().trim(),
        scope.find('[itemprop="addressCountry"]').first().text().trim(),
      ].filter(Boolean);
      location =
        parts.length > 0 ? parts.join(', ') : scope.find('[itemprop="name"]').first().text().trim() || undefined;
    }

    let salary: RawPosting['salary'];
    const base = root.find('[itemprop="baseSalary"]').first();
    if (base.length) {
      const minNode = base.find('[itemprop="minValue"]').first();
      const maxNode = base.find('[itemprop="maxValue"]').first();
      const valueNode = base.find('[itemprop="value"]').first();
      const unitNode = base.find('[itemprop="unitText"]').first();
      const currencyNode = base.find('[itemprop="currency"]').first();
      salary = {
        min: numOf(minNode.attr('content') || minNode.text()),
        max: numOf(maxNode.attr('content') || maxNode.text()) ?? numOf(valueNode.attr('content') || valueNode.text()),
        unit: unitNode.attr('content') || unitNode.text().trim() || undefined,
        currency: currencyNode.attr('content') || currencyNode.text().trim() || undefined,
      };
    }

    const idNode = root.find('[itemprop="identifier"]').first();
    const identifier = idNode.length
      ? idNode.find('[itemprop="value"]').first().text().trim() ||
        idNode.attr('content')?.trim() ||
        idNode.text().trim() ||
        undefined
      : undefined;

    const urlNode = root.find('[itemprop="url"]').first();
    const rawUrl = urlNode.attr('href') || urlNode.attr('content') || urlNode.text().trim() || undefined;
    let url: string | undefined;
    if (rawUrl) {
      try {
        url = new URL(rawUrl, pageUrl).href;
      } catch {
        url = undefined;
      }
    }

    out.push({
      title: prop('title'),
      description: prop('description'),
      datePosted: prop('datePosted'),
      validThrough: prop('validThrough'),
      employmentType: prop('employmentType'),
      organization,
      location,
      remote,
      salary,
      identifier,
      url,
    });
  });

  return out;
}

/* ------------------------------------------------------------------ */
/* Rung 3: ATS URL patterns                                            */
/* ------------------------------------------------------------------ */

const ATS_PATTERNS: RegExp[] = [
  /greenhouse\.io\//i,
  /lever\.co\//i,
  /ashbyhq\.com\//i,
  /workable\.com\//i,
  /smartrecruiters\.com\//i,
  /myworkdayjobs\.com\//i,
  /workday\.(?:com|net)\//i,
];

function extractAtsLinks($: CheerioAPI, pageUrl: string): RawPosting[] {
  const out: RawPosting[] = [];
  const seen = new Set<string>();

  $('a[href]').each((_index, element) => {
    const node = $(element);
    const href = node.attr('href');
    if (!href) return;
    let absolute: string;
    try {
      absolute = new URL(href, pageUrl).href;
    } catch {
      return;
    }
    if (!/^https?:/i.test(absolute)) return;
    if (!ATS_PATTERNS.some((pattern) => pattern.test(absolute))) return;
    if (seen.has(absolute)) return;
    seen.add(absolute);

    out.push({
      title: cleanText(node.text(), 140),
      description: 'Imported from an external careers/ATS listing.',
      url: absolute,
      organization: hostOf(absolute),
    });
  });

  return out;
}

/* ------------------------------------------------------------------ */
/* Rung 4: Generic selectors                                           */
/* ------------------------------------------------------------------ */

const CARD_SELECTORS = [
  '.job-card',
  '[class*="job-listing"] article',
  'li.job',
  'a[href*="/careers/"]',
  'a[href*="/jobs/"]',
];

function extractFromSelectors($: CheerioAPI, pageUrl: string): RawPosting[] {
  const out: RawPosting[] = [];
  const seen = new Set<string>();

  for (const selector of CARD_SELECTORS) {
    $(selector).each((_index, element) => {
      const node = $(element);
      const isAnchor = node.is('a');
      const anchor = isAnchor ? node : node.find('a[href]').first();
      const href = anchor.attr('href');
      let absolute: string | undefined;
      if (href) {
        try {
          absolute = new URL(href, pageUrl).href;
        } catch {
          absolute = undefined;
        }
      }
      const heading = node.find('h1,h2,h3,h4,h5,h6').first().text();
      const title = cleanText(heading || (isAnchor ? node.text() : anchor.text()), 140);
      const key = absolute || title;
      if (!key || seen.has(key)) return;
      seen.add(key);

      out.push({
        title,
        description: cleanText(node.text(), 400),
        url: absolute,
        organization: hostOf(pageUrl),
      });
    });
  }

  return out;
}

/* ------------------------------------------------------------------ */
/* Orchestration                                                       */
/* ------------------------------------------------------------------ */

const SOURCE_LABELS: Record<CrawlSource, string> = {
  'json-ld': 'JSON-LD JobPosting',
  microdata: 'JobPosting microdata',
  ats: 'ATS job links',
  selectors: 'job-card selectors',
};

function finish(candidates: RawPosting[], source: CrawlSource, pageUrl: string): ExtractionResult {
  const seen = new Set<string>();
  const jobs: Job[] = [];
  let skipped = 0;
  let missingTitle = 0;
  let unknownCategory = 0;
  let noSalary = 0;
  let converted = 0;

  for (const candidate of candidates) {
    const key = dedupeKey(candidate);
    if (seen.has(key)) continue;
    seen.add(key);

    const outcome = mapRawPosting(candidate, pageUrl);
    if ('skip' in outcome) {
      skipped += 1;
      if (outcome.skip === 'missing_title') missingTitle += 1;
      else unknownCategory += 1;
      continue;
    }
    if (outcome.noSalary) noSalary += 1;
    if (outcome.converted) converted += 1;
    jobs.push(outcome.job);
  }

  const notes: string[] = [
    `${SOURCE_LABELS[source]}: ${candidates.length} posting(s) found, ${jobs.length} imported, ${skipped} skipped.`,
  ];
  if (skipped > 0) {
    const reasons: string[] = [];
    if (missingTitle > 0) reasons.push(`${missingTitle} without a title`);
    if (unknownCategory > 0) reasons.push(`${unknownCategory} without a recognisable category`);
    notes.push(`Skipped ${reasons.join(' and ') || 'as unmappable'}.`);
  }
  if (noSalary > 0) notes.push(`${noSalary} had no published PHP salary (budget shown as ₱0).`);
  if (converted > 0) notes.push(`${converted} salary converted to PHP at a static indicative rate.`);

  return { jobs, skipped, source, notes: notes.join(' ').slice(0, 600) };
}

/**
 * Run the extraction ladder against an HTML page. Stops at the first rung
 * that produces candidates; postings that cannot be mapped to a Job are
 * omitted and reported through `skipped`.
 */
export function extractJobs(html: string, pageUrl: string): ExtractionResult {
  const jsonLd = extractJsonLd(html);
  if (jsonLd.length > 0) return finish(jsonLd, 'json-ld', pageUrl);

  const $ = load(html);

  const microdata = extractMicrodata($, pageUrl);
  if (microdata.length > 0) return finish(microdata, 'microdata', pageUrl);

  const atsLinks = extractAtsLinks($, pageUrl);
  if (atsLinks.length > 0) return finish(atsLinks, 'ats', pageUrl);

  const cards = extractFromSelectors($, pageUrl);
  if (cards.length > 0) return finish(cards, 'selectors', pageUrl);

  return {
    jobs: [],
    skipped: 0,
    source: null,
    notes: 'No job postings were detected on this page.',
  };
}
