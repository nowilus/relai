// RelAI core / panel: savings-view — the sums of the "Oszczędności" tab (plan MODY_OSZCZEDZANIA,
// E2; spec, section 4). Pure logic over the records of `savings-ledger.parse()`; the pane reads
// the files.
//
// Two columns, never mixed (R6):
//   measured  — what the helpers cost: `helper.in/out` from the model's own `usage`, priced by
//               the helper's model in the price lists (`pricing.mjs`), each record by its own list;
//   estimated — tokens Claude did not have to read (`before − after`), priced ONCE at the plain
//               input price of the main model, with no multiplier for later cache reads.
// The helpers' cost is always subtracted from the estimate. Records that `isLeftOut()` calls
// implausible stay out of the savings and are counted on their own; their helpers' cost stays in.

import { isLeftOut } from './savings-ledger.mjs';
import { modelPrice, newest, priceAt } from './pricing.mjs';

/** The tab's filters: this chat, today (every chat), everything kept in the ledger. */
export const FILTERS = Object.freeze(['chat', 'today', 'all']);

const PER_TOKEN = 1 / 1_000_000;

/**
 * Records a filter keeps.
 * @param {readonly object[]} records  from parse()
 * @param {'chat' | 'today' | 'all'} filter
 * @param {{ session: string, isToday: (ts: string) => boolean }} at
 */
export function pick(records, filter, at) {
  if (filter === 'chat') return records.filter((r) => r.session === at.session);
  if (filter === 'today') return records.filter((r) => at.isToday(String(r.ts)));
  return [...records];
}

const sizeOf = (n) => (typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : 0);
const savedOf = (r) => sizeOf(r.before) - sizeOf(r.after);

/** A helper's usage as a measured record pricing.mjs can price (no cache: one plain call). */
function helperRecord(r) {
  const h = r.helper;
  return { model: String(h.model || ''), input: sizeOf(h.in), output: sizeOf(h.out), cacheRead: 0, cacheWrite: 0, missing: null, kind: 'helper', agent: 'helper', at: Date.parse(String(r.ts)) || 0 };
}

const hasHelper = (r) => r.helper && typeof r.helper === 'object' && (sizeOf(r.helper.in) > 0 || sizeOf(r.helper.out) > 0);

/**
 * The tab's figures for one filter.
 * @param {readonly object[]} records  from parse() (already deduplicated)
 * @param {{ filter: 'chat' | 'today' | 'all', session: string, isToday: (ts: string) => boolean, mainModel: string | null, lists: readonly object[] }} o
 */
export function savingsView(records, o) {
  const kept = pick(records, o.filter, o);
  const counted = kept.filter((r) => !isLeftOut(r));
  const left = kept.filter((r) => isLeftOut(r));

  const saved = counted.reduce((n, r) => n + savedOf(r), 0);
  const main = modelPrice(o.mainModel, newest(o.lists));
  const estimatedUsd = main ? saved * main.input * PER_TOKEN : null;

  // A helper was paid even when its record is left out: its cost stays in (spec, section 4)
  const helped = kept.filter(hasHelper);
  let helperUsd = 0;
  let unpriced = 0;
  for (const r of helped) {
    const p = priceAt(helperRecord(r), o.lists);
    if (p.usd === null) unpriced++;
    else helperUsd += p.usd;
  }
  const helper = {
    calls: helped.length,
    in: helped.reduce((n, r) => n + sizeOf(r.helper.in), 0),
    out: helped.reduce((n, r) => n + sizeOf(r.helper.out), 0),
    usd: helperUsd,
    unpriced,
  };

  /** @type {Map<string, { mod: string, action: string, count: number, saved: number }>} */
  const rows = new Map();
  for (const r of counted) {
    const k = `${r.mod}|${r.action}`;
    const row = rows.get(k) ?? { mod: String(r.mod), action: String(r.action), count: 0, saved: 0 };
    rows.set(k, { ...row, count: row.count + 1, saved: row.saved + savedOf(r) });
  }

  return {
    filter: o.filter,
    records: counted.length,
    saved,
    estimatedUsd,
    mainModel: o.mainModel,
    isMainPriced: main !== null,
    helper,
    // An unpriced helper would make the net look better than it is (R6): no net then
    netUsd: estimatedUsd === null || unpriced > 0 ? null : estimatedUsd - helper.usd,
    leftOut: { count: left.length, saved: left.reduce((n, r) => n + savedOf(r), 0) },
    byMod: [...rows.values()].sort((a, b) => b.saved - a.saved),
  };
}
