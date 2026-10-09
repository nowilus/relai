// RelAI core / panel: pricing — the dated price list the panel prices its measurements with.
//
// What a figure here is: a hypothetical API cost at the list prices below, never the bill of a
// subscription (plan PANEL_CLAUDE, section 3). Each record is priced with the model that
// answered it; a model missing from the list is "brak ceny dla <model>", never zero (plan,
// section 8).
//
// E6 (Aneks D): the list grows from the Anthropic pricing page, read only after "tak" on a card
// and written only after a second "tak". Each saved read is a version of its own in the
// project's .claude/relai/panel/cennik.json, laid over PRICING below (decision of 2026-10-09).
// R6: a record is priced with the newest version in force when it was measured that knows its
// model, so a new rate never changes a cost already counted; a model no version in force knew
// had no cost to keep, and takes the first later version that knows it.
// The page gives each model its own cache rates (probe relai-probe-e6, 2026-10-09: a cache read
// is 0.1x the input price, 0.05x on Opus and Sonnet 5.5, 0.025x on Fable and Mythos 5.1), so a
// model read from it carries them; PRICING's multipliers stay for a model that does not.
//
// ESM without engine or Node API, for the same reason as cache-timer.mjs; the plugin carries a
// byte-identical copy written by core/tools/sync-panel-core.js.

import { count, daysBetween, makeCard, withSecond } from './decisions.mjs';

/**
 * @typedef {{ input: number, output: number, read?: number, write5m?: number, write1h?: number }} Rates
 *   US dollars per million tokens; read and the writes absent when the list's multipliers apply
 * @typedef {Rates & { over?: Rates & { above: number } }} ModelPrice
 *   over: the rates of a prompt longer than `above` tokens (Claude Haiku 5.5: 100 000)
 * @typedef {{
 *   date: string,
 *   source: string,
 *   readMult: number,
 *   writeMult: Readonly<Record<'1h' | '5m', number>>,
 *   models: Readonly<Record<string, ModelPrice>>
 * }} PriceList
 * @typedef {PriceList & { from: number }} Version  from: when it was saved (ms); PRICING's is 0
 * @typedef {import('./measure.mjs').MeasureRecord} MeasureRecord
 * @typedef {import('./measure.mjs').Parts} Parts
 * @typedef {import('./decisions.mjs').Card} Card
 * @typedef {import('./decisions.mjs').CardResult} CardResult
 * @typedef {import('./decisions.mjs').Fact} Fact
 * @typedef {{ usd: number, missing: null, parts: Parts } | { usd: null, missing: string, parts: null }} Priced
 * @typedef {{ models: number, tiers: number, headers: number, sections: number, rejected: number }} RowCounts
 * @typedef {{ models: Record<string, ModelPrice> | null, counts: RowCounts, reason: string }} PageRead
 * @typedef {{ model: string, kind: 'nowy' | 'zmieniony', changes: { category: string, from: number | null, to: number }[] }} ModelDiff
 */

/** @type {Readonly<PriceList>} */
export const PRICING = Object.freeze({
  date: '2026-10-08',
  source: 'cennik API Anthropic, odczyt 2026-10-08 (plan PANEL_CLAUDE, sekcja 5)',
  // A cache read costs this share of the input price; a cache write this multiple of it
  readMult: 0.05,
  writeMult: Object.freeze({ '1h': 2, '5m': 1.25 }),
  models: Object.freeze({
    'claude-opus-5-5': Object.freeze({ input: 4, output: 20 }),
  }),
});

/** The one page the panel may read (Aneks D): the pricing page of Anthropic's documentation. */
export const PRICING_PAGE = 'https://platform.claude.com/docs/en/about-claude/pricing';

/** The page in words the pane can wrap: the full address is one 56-character word (40 columns, E6). */
export const PRICING_SOURCE = 'strona cennika Anthropic (platform.claude.com)';

/** The project's saved versions, outside git like every file of .claude/relai/ (C11). */
export const PRICE_FILE = '.claude/relai/panel/cennik.json';

/** Days after which the list's date is called old, when docs/USTAWIENIA.md does not say. */
export const STALE_DAYS = 30;

const PER_TOKEN = 1 / 1_000_000;

/**
 * How long a request's cache write lives. Usage does not say: measured on 2026-10-08
 * (relai-probe-e3, Claude Code 2.1.293, against the engine's ledger) — the main loop writes for
 * an hour, a subagent and a compaction for five minutes.
 * @param {Pick<MeasureRecord, 'agent' | 'kind'>} r
 * @returns {'1h' | '5m'}
 */
export function writeTtl(r) {
  return r.kind === 'step' && r.agent === null ? '1h' : '5m';
}

/**
 * The price of a model, matched without a context-window suffix ("[1m]") and without a date
 * suffix ("-20251001"); null when unlisted.
 * @param {string | null} model
 * @param {Readonly<PriceList>} list
 * @returns {ModelPrice | null}
 */
export function modelPrice(model, list) {
  if (!model) return null;
  const bare = model.replace(/\[[^\]]*\]$/, '');
  return list.models[model] ?? list.models[bare] ?? list.models[bare.replace(/-\d{8}$/, '')] ?? null;
}

/**
 * The rates a record pays: the model's tier for its prompt length, the cache rates the model
 * carries or the list's multipliers of its input price.
 * @param {ModelPrice} price @param {Readonly<PriceList>} list @param {MeasureRecord} r
 */
function ratesFor(price, list, r) {
  const prompt = (r.input ?? 0) + (r.cacheRead ?? 0) + (r.cacheWrite ?? 0);
  /** @type {Rates} */
  const t = price.over && prompt > price.over.above ? price.over : price;
  const ttl = writeTtl(r);
  const write = ttl === '1h' ? t.write1h : t.write5m;
  return { input: t.input, output: t.output, read: t.read ?? t.input * list.readMult, write: write ?? t.input * list.writeMult[ttl] };
}

/**
 * One record in dollars, or the words saying why there is no figure.
 * @param {MeasureRecord} r
 * @param {Readonly<PriceList>} [list]
 * @returns {Priced}
 */
export function priceRecord(r, list = PRICING) {
  if (r.missing !== null || r.input === null || r.cacheRead === null || r.cacheWrite === null || r.output === null) {
    return { usd: null, missing: r.missing ?? 'odpowiedź bez usage', parts: null };
  }
  const price = modelPrice(r.model, list);
  if (!price) return { usd: null, missing: `brak ceny dla ${r.model ?? 'nieznanego modelu'}`, parts: null };
  const k = ratesFor(price, list, r);
  const parts = {
    input: r.input * k.input * PER_TOKEN,
    cacheRead: r.cacheRead * k.read * PER_TOKEN,
    cacheWrite: r.cacheWrite * k.write * PER_TOKEN,
    output: r.output * k.output * PER_TOKEN,
  };
  return { usd: parts.input + parts.cacheRead + parts.cacheWrite + parts.output, missing: null, parts };
}

/**
 * What the cache did for the priced records: the share of input tokens it served, the input as
 * paid, and the same input at the plain input price, as if there were no cache at all.
 * @param {readonly MeasureRecord[]} records
 * @param {Readonly<PriceList> | ((r: MeasureRecord) => Readonly<PriceList> | null)} [list]  one list, or the list of each record
 * @returns {{ inputTokens: number, fromCache: number, paidUsd: number, noCacheUsd: number, writeUsd: number }}
 */
export function cacheEffect(records, list = PRICING) {
  let inputTokens = 0, cached = 0, paidUsd = 0, noCacheUsd = 0, writeUsd = 0;
  for (const r of records) {
    const l = typeof list === 'function' ? list(r) : list;
    if (!l) continue;
    const p = priceRecord(r, l);
    const price = modelPrice(r.model, l);
    if (!p.parts || !price || r.input === null || r.cacheRead === null || r.cacheWrite === null) continue;
    const tokens = r.input + r.cacheRead + r.cacheWrite;
    inputTokens += tokens;
    cached += r.cacheRead;
    paidUsd += p.parts.input + p.parts.cacheRead + p.parts.cacheWrite;
    noCacheUsd += tokens * ratesFor(price, l, r).input * PER_TOKEN;
    writeUsd += p.parts.cacheWrite;
  }
  return { inputTokens, fromCache: inputTokens ? cached / inputTokens : 0, paidUsd, noCacheUsd, writeUsd };
}

// ---------- the pricing page ----------

const CELL = /<t([hd])\b([^>]*)>([\s\S]*?)<\/t[hd]>/g;
const ROW = /<tr\b[\s\S]*?<\/tr>/g;
const TABLE = /<table\b[\s\S]*?<\/table>/g;
const PRICE = /^\$(\d+(?:\.\d+)?) \/ MTok(?: for prompts (?:up to|over) ([\d,]+) tokens)?$/;
const NAME = /^Claude ([A-Z][a-z]+) (\d+(?:\.\d+)?)$/;
/** The model table's columns, in order, after the name (closed list: a page that changes them is not read). */
const COLUMNS = ['Input', 'Output', '5m writes', '1h writes', 'Hits and refreshes'];

/**
 * A cell's text. The page draws its icons as private-use characters (U+E02A, U+E0F0: probe
 * relai-probe-e6), which \s does not match: they go before the spaces are folded.
 * @param {string} s
 */
function words(s) {
  return s.replace(/<[^>]*>/g, ' ').replace(/[\uE000-\uF8FF]/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;|&#160;/g, ' ').replace(/\s+/g, ' ').trim();
}

/** "Claude Opus 5.5" → "claude-opus-5-5"; null for any other shape. @param {string} name */
export function modelId(name) {
  const m = NAME.exec(name);
  return m && m[1] && m[2] ? `claude-${m[1].toLowerCase()}-${m[2].replace('.', '-')}` : null;
}

/** @param {string} cell @returns {{ usd: number, tokens: number | null } | null} */
function priceCell(cell) {
  const m = PRICE.exec(words(cell));
  return m && m[1] ? { usd: Number(m[1]), tokens: m[2] ? Number(m[2].replace(/,/g, '')) : null } : null;
}

/** @param {({ usd: number } | null)[]} cells @returns {Rates | null} */
function ratesOf(cells) {
  if (cells.length !== 5 || cells.some((c) => c === null)) return null;
  const [input, output, write5m, write1h, read] = /** @type {{ usd: number }[]} */ (cells).map((c) => c.usd);
  return { input: /** @type {number} */ (input), output: /** @type {number} */ (output), read: /** @type {number} */ (read), write5m: /** @type {number} */ (write5m), write1h: /** @type {number} */ (write1h) };
}

/**
 * The model table of the pricing page, read strictly: every row is a header, the "Additional
 * models" divider, a model with five prices, or the second tier of the model above it. A row of
 * any other shape stops the read — a page that changed is not half-applied (plan, section 8).
 * @param {string | null} html
 * @returns {PageRead}
 */
export function parsePricingPage(html) {
  /** @type {RowCounts} */
  const counts = { models: 0, tiers: 0, headers: 0, sections: 0, rejected: 0 };
  const table = [...String(html ?? '').matchAll(TABLE)].map((m) => m[0]).find((t) => {
    const head = words(t.slice(0, t.search(/<td\b/) === -1 ? t.length : t.search(/<td\b/)));
    return COLUMNS.every((c) => head.includes(c));
  });
  if (!table) return { models: null, counts, reason: 'na stronie nie ma tabeli cen modeli' };
  /** @type {Record<string, ModelPrice>} */
  const models = {};
  /** @type {string | null} */
  let tiered = null; // the model whose next row is its second tier
  for (const [row] of table.matchAll(ROW)) {
    const cells = [...row.matchAll(CELL)].map((c) => ({ isHead: c[1] === 'h', attrs: c[2] ?? '', html: c[3] ?? '' }));
    const first = cells[0];
    if (!first) { counts.rejected += 1; continue; }
    // A model spanning two rows whose second is not its tier: the page lost the tier
    if (tiered && cells.length !== 5) return { models: null, counts, reason: `strona zmieniona: brak drugiego progu ceny ${tiered}` };
    if (cells.every((c) => c.isHead)) {
      if (/colSpan="6"/i.test(first.attrs) && words(first.html) === 'Additional models') counts.sections += 1;
      else if (cells.some((c) => COLUMNS.includes(words(c.html))) || words(first.html) === 'Model') counts.headers += 1;
      else counts.rejected += 1;
      continue;
    }
    if (cells.length === 5 && tiered) {
      const prices = cells.map((c) => priceCell(c.html));
      const rates = ratesOf(prices);
      const above = prices[0]?.tokens ?? null;
      const base = models[tiered];
      if (!rates || above === null || !base) { counts.rejected += 1; continue; }
      models[tiered] = { ...base, over: { ...rates, above } };
      counts.tiers += 1;
      tiered = null;
      continue;
    }
    const anchor = /<a\b[^>]*>([\s\S]*?)<\/a>/.exec(first.html);
    const id = modelId(words(anchor ? anchor[1] ?? '' : first.html));
    const rates = cells.length === 6 ? ratesOf(cells.slice(1).map((c) => priceCell(c.html))) : null;
    if (!id || !rates) { counts.rejected += 1; continue; }
    models[id] = rates;
    counts.models += 1;
    tiered = /rowSpan="2"/i.test(first.attrs) ? id : null;
  }
  if (counts.rejected) return { models: null, counts, reason: `strona zmieniona: ${count(counts.rejected, 'wiersz nierozpoznany', 'wiersze nierozpoznane', 'wierszy nierozpoznanych')}` };
  if (tiered) return { models: null, counts, reason: `strona zmieniona: brak drugiego progu ceny ${tiered}` };
  if (!counts.models) return { models: null, counts, reason: 'tabela cen modeli bez żadnego modelu' };
  return { models, counts, reason: '' };
}

// ---------- the saved versions ----------

/** @param {unknown} x @returns {x is Rates} */
function isRates(x) {
  const r = /** @type {Record<string, unknown>} */ (x ?? {});
  const num = (/** @type {unknown} */ v) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
  return num(r.input) && num(r.output) && ['read', 'write5m', 'write1h'].every((k) => r[k] === undefined || num(r[k]));
}

/** @param {unknown} x @returns {x is ModelPrice} */
function isModelPrice(x) {
  const over = /** @type {Record<string, unknown>} */ (x ?? {}).over;
  return isRates(x) && (over === undefined || (isRates(over) && typeof (/** @type {Record<string, unknown>} */ (over)).above === 'number'));
}

/**
 * The project's price file read back: its versions laid over PRICING's multipliers, oldest first.
 * A file that is not one is an error in words and no version — PRICING alone prices.
 * @param {string | null} text
 * @returns {{ versions: Version[], error: string }}
 */
export function parsePriceFile(text) {
  if (text === null || text.trim() === '') return { versions: [], error: '' };
  let x;
  try { x = JSON.parse(text); } catch { return { versions: [], error: `${PRICE_FILE} nie jest JSON-em` }; }
  const list = x && x.v === 1 && Array.isArray(x.versions) ? x.versions : null;
  if (!list) return { versions: [], error: `${PRICE_FILE}: nieznany format` };
  /** @type {Version[]} */
  const versions = [];
  for (const v of list) {
    const models = v && typeof v.models === 'object' && v.models ? v.models : null;
    const isOk = v && /^\d{4}-\d{2}-\d{2}$/.test(String(v.date)) && typeof v.source === 'string' && typeof v.from === 'number'
      && models && Object.values(models).every(isModelPrice);
    if (!isOk) return { versions: [], error: `${PRICE_FILE}: wersja w złym kształcie` };
    versions.push({ date: v.date, source: v.source, from: v.from, readMult: PRICING.readMult, writeMult: PRICING.writeMult, models });
  }
  return { versions: versions.sort((a, b) => a.from - b.from), error: '' };
}

/** The file with one more version. @param {readonly Version[]} versions @param {Omit<Version, 'readMult' | 'writeMult'>} next */
export function serializePriceFile(versions, next) {
  const out = [...versions, next].map((v) => ({ date: v.date, source: v.source, from: v.from, models: v.models }));
  return JSON.stringify({ v: 1, versions: out }, null, 2) + '\n';
}

/** Every list the panel prices with: PRICING (in force from the start), then the saved versions. @param {readonly Version[]} versions @returns {Version[]} */
export function priceLists(versions) {
  return [{ ...PRICING, from: 0 }, ...versions];
}

/**
 * The list a record is priced with (R6): the newest in force when it was measured that knows its
 * model; when none in force knew it, the oldest later one that does — "brak ceny" was no cost to keep.
 * @param {MeasureRecord} r @param {readonly Version[]} lists  oldest first
 * @returns {Version | null}
 */
export function listFor(r, lists) {
  const knows = lists.filter((l) => modelPrice(r.model, l) !== null);
  const before = knows.filter((l) => l.from <= r.at);
  return before[before.length - 1] ?? knows[0] ?? null;
}

/** A record priced by its own list. @param {MeasureRecord} r @param {readonly Version[]} lists @returns {Priced} */
export function priceAt(r, lists) {
  return priceRecord(r, listFor(r, lists) ?? lists[lists.length - 1] ?? { ...PRICING, from: 0 });
}

/** The newest list: the date and source the panel names, and the rates a new read is compared with. @param {readonly Version[]} lists */
export function newest(lists) {
  const last = lists[lists.length - 1] ?? { ...PRICING, from: 0 };
  /** @type {Record<string, ModelPrice>} */
  const models = {};
  for (const l of lists) Object.assign(models, l.models);
  return { date: last.date, source: last.source, models };
}

/**
 * The models measured without a price in any list, each with how many measured records it has,
 * the most first (Aneks D: "claude-sonnet-5-5 — 4 rekordy bez ceny").
 * @param {readonly MeasureRecord[]} records  the session's and the project's together
 * @param {readonly Version[]} lists
 * @returns {{ model: string, records: number }[]}
 */
export function unpricedModels(records, lists) {
  /** @type {Map<string, number>} */
  const seen = new Map();
  for (const r of records) {
    if (r.missing !== null || listFor(r, lists) !== null) continue;
    const m = r.model ?? 'nieznany model';
    seen.set(m, (seen.get(m) ?? 0) + 1);
  }
  return [...seen].map(([model, n]) => ({ model, records: n })).sort((a, b) => b.records - a.records || a.model.localeCompare(b.model));
}

/** "claude-sonnet-5-5 — 4 rekordy bez ceny". @param {{ model: string, records: number }} u */
export function unpricedWords(u) {
  return `${u.model} — ${count(u.records, 'rekord', 'rekordy', 'rekordów')} bez ceny`;
}

const CATEGORIES = /** @type {const} */ ([['input', 'wejście'], ['output', 'wyjście'], ['read', 'odczyt cache'], ['write5m', 'zapis cache 5 min'], ['write1h', 'zapis cache 1 h']]);

/**
 * What a read would change, model by model: a model the panel did not know is "nowy", a known one
 * lists each category whose rate moved; a model whose rates stand is left out. The rates compared
 * are those a record pays (a list multiplier counted out), so equal prices never read as a change.
 * @param {Readonly<Record<string, ModelPrice>>} old @param {Readonly<Record<string, ModelPrice>>} next
 * @returns {ModelDiff[]}
 */
export function diffModels(old, next) {
  /** @param {Rates} r */
  const full = (r) => ({ input: r.input, output: r.output, read: r.read ?? r.input * PRICING.readMult, write5m: r.write5m ?? r.input * PRICING.writeMult['5m'], write1h: r.write1h ?? r.input * PRICING.writeMult['1h'] });
  /** @type {ModelDiff[]} */
  const out = [];
  for (const [model, price] of Object.entries(next)) {
    const now = full(price);
    const was = old[model] ? full(/** @type {ModelPrice} */ (old[model])) : null;
    const changes = CATEGORIES.filter(([k]) => !was || Math.abs(was[k] - now[k]) > 1e-9)
      .map(([k, category]) => ({ category, from: was ? was[k] : null, to: now[k] }));
    if (!was) out.push({ model, kind: 'nowy', changes });
    else if (changes.length) out.push({ model, kind: 'zmieniony', changes });
  }
  return out.sort((a, b) => a.model.localeCompare(b.model));
}

// ---------- the list's age ----------

/**
 * The threshold of an old list from docs/USTAWIENIA.md: the row "Cennik panelu" with "N dni";
 * STALE_DAYS when the row is absent or says no number.
 * @param {string | null} md
 */
export function staleDays(md) {
  const row = String(md ?? '').split(/\r?\n/).find((l) => /^\|[^|]*\|\s*Cennik panelu\s*\|/.test(l));
  const m = row ? /\|\s*Cennik panelu\s*\|[^|]*?(\d+) dni/.exec(row) : null;
  return m && m[1] ? Number(m[1]) : STALE_DAYS;
}

/**
 * The warning of an old list, in words; empty while it is younger than the threshold.
 * @param {string} date @param {string} today  YYYY-MM-DD each @param {number} days
 */
export function staleWarning(date, today, days) {
  const age = daysBetween(date, today);
  if (age === null || age <= days) return '';
  return `cennik z ${date} ma ${count(age, 'dzień', 'dni', 'dni')} (próg ${days}) — kwoty mogą nie odpowiadać dzisiejszym cenom`;
}

// ---------- the card (R4, Aneks D) ----------

/**
 * A rate per million tokens, exact: two places at least, more where the page has them ($0.125 —
 * rounding a rate to $0.13 changes what it says, L-0145; live, 2026-10-09).
 * @param {number | null} n
 */
export function rate(n) {
  if (n === null) return '—';
  const cents = Math.round(n * 100) / 100;
  return '$' + (Math.abs(cents - n) < 1e-9 ? cents.toFixed(2) : String(Number(n.toFixed(6))));
}

/**
 * The project's measured models with their records and cost, the most records first: what the
 * price list means for them (live, 2026-10-09: after a save the person looked for the model's
 * figure and the session alone did not hold its records).
 * @param {readonly MeasureRecord[]} records @param {readonly Version[]} lists
 * @returns {{ model: string, records: number, usd: number | null, isPartial: boolean }[]}
 */
export function modelCosts(records, lists) {
  /** @type {Map<string, { model: string, records: number, usd: number | null, isPartial: boolean }>} */
  const by = new Map();
  for (const r of records) {
    if (r.missing !== null) continue;
    const m = r.model ?? 'nieznany model';
    const p = priceAt(r, lists);
    const was = by.get(m) ?? { model: m, records: 0, usd: null, isPartial: false };
    by.set(m, { model: m, records: was.records + 1, usd: p.usd === null ? was.usd : (was.usd ?? 0) + p.usd, isPartial: was.isPartial || p.usd === null });
  }
  return [...by.values()].sort((a, b) => b.records - a.records || a.model.localeCompare(b.model));
}

/**
 * "Zaktualizować cennik?": nothing leaves the panel before its "tak", which reads the page and
 * turns the card to its second step (pricingSecond); the file is written only after the second.
 * @param {string} id
 * @param {{ unpriced: { model: string, records: number }[], date: string, warning: string }} x
 * @returns {CardResult}
 */
export function pricingCard(id, x) {
  /** @type {Fact[]} */
  const facts = [
    { label: 'Cennik', value: `z ${x.date}${x.warning ? ' — stary' : ''}`, ...(x.warning ? { tone: /** @type {const} */ ('warn') } : {}) },
    ...x.unpriced.map((u) => ({ label: 'Bez ceny', value: unpricedWords(u), tone: /** @type {const} */ ('warn') })),
    { label: 'Odczyt', value: `jeden, ${PRICING_SOURCE} — bez danych projektu` },
    { label: 'Zapis', value: `dopiero po drugim „Tak”, do ${PRICE_FILE}` },
  ];
  return { kind: 'card', card: makeCard({
    id, title: 'Zaktualizować cennik?', facts, question: 'Pobrać stronę cennika Anthropic i pokazać różnicę stawek?', actions: [],
    fetch: PRICING_PAGE, second: { question: 'Czytam stronę cennika…', facts: [] },
  }) };
}

/**
 * The card's second step from what the read brought: the difference old–new per model and
 * category, the models still without a price, and the file the second "tak" writes. A page that
 * could not be read, or brought no change, ends the card: the reason in words, nothing to write.
 * @param {Card} card  in its second step
 * @param {{ ok: boolean, status: number, text: string } | { error: string }} response
 * The rates in full only for the models that matter here — measured in the project, without a
 * price, or changed; the other new models in one line of names (live, 2026-10-09: nineteen rows
 * of rates buried the one model the card was for).
 * @param {{ versions: Version[], unpriced: { model: string, records: number }[], measured?: string[], now: number, today: string }} x
 * @returns {CardResult}
 */
export function pricingSecond(card, response, x) {
  if ('error' in response) return { kind: 'blocked', reason: `brak odczytu strony cennika (${response.error}) — cennik nietknięty` };
  if (!response.ok) return { kind: 'blocked', reason: `strona cennika odpowiedziała ${response.status} — cennik nietknięty` };
  const page = parsePricingPage(response.text);
  const read = page.models;
  if (!read) return { kind: 'blocked', reason: `${page.reason} — cennik nietknięty` };
  const lists = priceLists(x.versions);
  const diff = diffModels(newest(lists).models, read);
  const still = x.unpriced.filter((u) => modelPrice(u.model, { ...PRICING, models: read }) === null);
  if (!diff.length) {
    const tail = still.length ? `; nadal bez ceny: ${still.map((u) => u.model).join(', ')} — modelu nie ma na stronie` : '';
    return { kind: 'blocked', reason: `strona cennika bez zmian wobec cennika z ${newest(lists).date}${tail} — nic do zapisu` };
  }
  const bare = (/** @type {string} */ m) => m.replace(/\[[^\]]*\]$/, '').replace(/-\d{8}$/, '');
  const matters = new Set([...(x.measured ?? []), ...x.unpriced.map((u) => u.model)].map(bare));
  const shown = diff.filter((d) => d.kind === 'zmieniony' || matters.has(d.model));
  const rest = diff.filter((d) => !shown.includes(d));
  /** @type {Fact[]} */
  const facts = [
    { label: 'Odczyt', value: `${count(page.counts.models, 'model', 'modele', 'modeli')}, ${count(page.counts.tiers, 'próg', 'progi', 'progów')} ceny, 0 wierszy odrzuconych` },
    ...shown.map((d) => ({
      label: d.kind === 'nowy' ? 'Nowy' : 'Zmiana',
      value: `${d.model}: ` + (d.kind === 'nowy'
        ? d.changes.map((c) => `${c.category} ${rate(c.to)}`).join(', ')
        : d.changes.map((c) => `${c.category} ${rate(c.from)} → ${rate(c.to)}`).join(', ')) + ' / MTok',
      ...(d.kind === 'zmieniony' ? { tone: /** @type {const} */ ('warn') } : {}),
    })),
    ...(rest.length ? [{ label: 'Inne nowe', value: `${count(rest.length, 'model', 'modele', 'modeli')} spoza pomiarów: ${rest.map((d) => d.model).join(', ')}` }] : []),
    ...still.map((u) => ({ label: 'Nadal bez ceny', value: `${u.model} — modelu nie ma na stronie`, tone: /** @type {const} */ ('warn') })),
    { label: 'Wcześniejsze kwoty', value: 'zostają przy stawkach, którymi je policzono' },
  ];
  const text = serializePriceFile(x.versions, { date: x.today, source: `${PRICING_SOURCE}, odczyt ${x.today}`, from: x.now, models: read });
  const step = { question: `Zapisać cennik z ${x.today} (${count(diff.length, 'model zmieniony', 'modele zmienione', 'modeli zmienionych')})?`, facts };
  return { kind: 'card', card: withSecond(card, step, [{ kind: 'write', path: PRICE_FILE, text }]) };
}
