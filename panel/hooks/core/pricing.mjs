// RelAI core / panel: pricing — the dated price list the panel prices its measurements with.
//
// What a figure here is: a hypothetical API cost at the list prices below, never the bill of a
// subscription (plan PANEL_CLAUDE, section 3). Each record is priced with the model that
// answered it; a model missing from the list is "brak ceny dla <model>", never zero (plan,
// section 8). The list changes by hand in E3; refreshing it from the network is E6.
//
// ESM without engine or Node API, for the same reason as cache-timer.mjs; the plugin carries a
// byte-identical copy written by core/tools/sync-panel-core.js.

/**
 * @typedef {{ input: number, output: number }} ModelPrice  US dollars per million tokens
 * @typedef {{
 *   date: string,
 *   source: string,
 *   readMult: number,
 *   writeMult: Readonly<Record<'1h' | '5m', number>>,
 *   models: Readonly<Record<string, ModelPrice>>
 * }} PriceList
 * @typedef {import('./measure.mjs').MeasureRecord} MeasureRecord
 * @typedef {import('./measure.mjs').Parts} Parts
 * @typedef {{ usd: number, missing: null, parts: Parts } | { usd: null, missing: string, parts: null }} Priced
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
 * The price of a model, matched without a context-window suffix ("[1m]"); null when unlisted.
 * @param {string | null} model
 * @param {Readonly<PriceList>} list
 * @returns {ModelPrice | null}
 */
export function modelPrice(model, list) {
  if (!model) return null;
  return list.models[model] ?? list.models[model.replace(/\[[^\]]*\]$/, '')] ?? null;
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
  const parts = {
    input: r.input * price.input * PER_TOKEN,
    cacheRead: r.cacheRead * list.readMult * price.input * PER_TOKEN,
    cacheWrite: r.cacheWrite * list.writeMult[writeTtl(r)] * price.input * PER_TOKEN,
    output: r.output * price.output * PER_TOKEN,
  };
  return { usd: parts.input + parts.cacheRead + parts.cacheWrite + parts.output, missing: null, parts };
}

/**
 * What the cache did for the priced records: the share of input tokens it served, the input as
 * paid, and the same input at the plain input price, as if there were no cache at all.
 * @param {readonly MeasureRecord[]} records
 * @param {Readonly<PriceList>} [list]
 * @returns {{ inputTokens: number, fromCache: number, paidUsd: number, noCacheUsd: number, writeUsd: number }}
 */
export function cacheEffect(records, list = PRICING) {
  let inputTokens = 0, cached = 0, paidUsd = 0, noCacheUsd = 0, writeUsd = 0;
  for (const r of records) {
    const p = priceRecord(r, list);
    const price = modelPrice(r.model, list);
    if (!p.parts || !price || r.input === null || r.cacheRead === null || r.cacheWrite === null) continue;
    const tokens = r.input + r.cacheRead + r.cacheWrite;
    inputTokens += tokens;
    cached += r.cacheRead;
    paidUsd += p.parts.input + p.parts.cacheRead + p.parts.cacheWrite;
    noCacheUsd += tokens * price.input * PER_TOKEN;
    writeUsd += p.parts.cacheWrite;
  }
  return { inputTokens, fromCache: inputTokens ? cached / inputTokens : 0, paidUsd, noCacheUsd, writeUsd };
}
