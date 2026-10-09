// RelAI core / panel: attribution — what each stage and each crew task cost (plan PANEL_CLAUDE, E4).
//
// The rule (decision of 2026-10-09, E4): the collector tags a record when it measures it — the
// stage in progress of the active plan, the crew run and task of the agent that made the request.
// A window of dates cannot do it: STATUS.md and the journal carry days without hours, and one day
// held four stages (2026-10-08). So every record lands in exactly one row:
//   - its stage ("PLAN/EN"), or the stage the person gave its crew task on the map;
//   - "poza etapem" — tagged, but no stage was in progress;
//   - "sprzed znacznika" — written before E4, without a tag at all.
// The rows add up to the session to the cent; a record without a price stays in its row, named.
// Same ESM rule and same copy as plan-state.mjs.

import { aggregate } from './measure.mjs';

/**
 * @typedef {import('./measure.mjs').MeasureRecord} MeasureRecord
 * @typedef {import('./measure.mjs').Group} Group
 * @typedef {import('./measure.mjs').PriceOf} PriceOf
 * @typedef {import('./plan-state.mjs').PlanState} PlanState
 * @typedef {import('./flow.mjs').Merges} Merges
 * @typedef {{ group: Group, words: string }} Bucket
 * @typedef {{ rows: { tag: string, group: Group }[], outside: Bucket, untagged: Bucket, total: Group, isWhole: boolean }} StageCosts
 */

export const OUTSIDE_WORDS = 'poza etapem — praca bez etapu w toku';
export const UNTAGGED_WORDS = 'poza etapem — pomiary sprzed znacznika etapu (przed E4)';

// The last line crew.js composePrompt writes under a task, at the start of its own line
const CREW_LINE = /^RelAI crew run: ([^\s,]+), task: (\S+?)\s*$/m;

/**
 * The tag of the stage being worked on: the active plan's stage in progress, else null. A stage
 * ready to start is not being worked on, and its cost would be a guess.
 * @param {PlanState} plan
 * @returns {string | null}
 */
export function stageTag(plan) {
  if (plan.kind !== 'ok' || !plan.stage || plan.stage.status !== 'W TOKU') return null;
  return `${plan.plan}/${plan.stage.id}`;
}

/**
 * The crew run and task a prompt belongs to, from the line crew.js puts under it; null when the
 * prompt has none or names none ("-").
 * @param {string} text
 * @returns {string | null}
 */
export function crewTag(text) {
  const m = String(text ?? '').match(CREW_LINE);
  if (!m || !m[1] || !m[2] || m[1] === '-' || m[2] === '-') return null;
  return `${m[1]}/${m[2]}`;
}

/**
 * The group of the merge file that holds a record's task, if any.
 * @param {string | null | undefined} task @param {Merges | undefined} merges
 */
function groupOfTask(task, merges) {
  if (!task || !merges) return undefined;
  const cut = task.indexOf('/');
  if (cut < 0) return undefined;
  const run = task.slice(0, cut), id = task.slice(cut + 1);
  return merges.groups.find((g) => g.run === run && g.tasks.includes(id));
}

/**
 * Where a record's dollars go: a stage tag, null for "poza etapem", undefined for untagged.
 * @param {MeasureRecord} r @param {Merges | undefined} merges
 * @returns {string | null | undefined}
 */
function rowOf(r, merges) {
  const given = groupOfTask(r.task, merges)?.stage;
  if (given) return given;
  if (!('stage' in r)) return undefined;
  return r.stage ?? null;
}

const sum = (/** @type {readonly MeasureRecord[]} */ list, /** @type {(r: MeasureRecord) => PriceOf} */ price, /** @type {string} */ label) =>
  ({ ...aggregate(list, price).total, label });

/**
 * Whether the rows add up to the session, to the cent.
 * @param {Pick<StageCosts, 'rows' | 'outside' | 'untagged'>} cost @param {Group} total
 */
export function isWhole(cost, total) {
  const parts = [...cost.rows.map((r) => r.group), cost.outside.group, cost.untagged.group];
  const cents = (/** @type {number | null} */ n) => Math.round((n ?? 0) * 100);
  return parts.reduce((s, g) => s + g.records, 0) === total.records
    && cents(parts.reduce((s, g) => s + (g.usd ?? 0), 0)) === cents(total.usd);
}

/**
 * The cost of each stage, of the work outside any stage and of the records without a tag.
 * @param {readonly MeasureRecord[]} records
 * @param {(r: MeasureRecord) => PriceOf} price
 * @param {Merges} [merges]
 * @returns {StageCosts}
 */
export function stageCosts(records, price, merges) {
  /** @type {Map<string, MeasureRecord[]>} */
  const rows = new Map();
  /** @type {MeasureRecord[]} */
  const outside = [];
  /** @type {MeasureRecord[]} */
  const untagged = [];
  for (const r of records) {
    const row = rowOf(r, merges);
    if (row === undefined) untagged.push(r);
    else if (row === null) outside.push(r);
    else rows.set(row, [...(rows.get(row) ?? []), r]);
  }
  const cost = {
    rows: [...rows.entries()].sort(([x], [y]) => x.localeCompare(y, 'en', { numeric: true })).map(([tag, list]) => ({ tag, group: sum(list, price, tag) })),
    outside: { group: sum(outside, price, 'poza etapem'), words: OUTSIDE_WORDS },
    untagged: { group: sum(untagged, price, 'sprzed znacznika'), words: UNTAGGED_WORDS },
    total: sum(records, price, 'sesja'),
  };
  return { ...cost, isWhole: isWhole(cost, cost.total) };
}

/**
 * The cost of each crew task, merged tasks as one; records without a task are not listed.
 * @param {readonly MeasureRecord[]} records
 * @param {(r: MeasureRecord) => PriceOf} price
 * @param {Merges} [merges]
 * @returns {{ run: string, id: string, label: string, group: Group }[]}
 */
export function taskCosts(records, price, merges) {
  /** @type {Map<string, { run: string, id: string, label: string, list: MeasureRecord[] }>} */
  const tasks = new Map();
  for (const r of records) {
    if (!r.task || r.task.indexOf('/') < 0) continue;
    const g = groupOfTask(r.task, merges);
    const run = r.task.slice(0, r.task.indexOf('/'));
    const id = g ? g.id : r.task.slice(r.task.indexOf('/') + 1);
    const key = `${run}/${id}`;
    const t = tasks.get(key) ?? { run, id, label: g?.name ?? (g ? g.tasks.join(' + ') : id), list: [] };
    tasks.set(key, { ...t, list: [...t.list, r] });
  }
  return [...tasks.values()].map((t) => ({ run: t.run, id: t.id, label: t.label, group: sum(t.list, price, t.label) }));
}
