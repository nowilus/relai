// RelAI core / panel: measure — one record per model request, summed without counting twice.
//
// The schema is shared with the Codex panel (decision of 2026-10-08, E3 of plan PANEL_CLAUDE:
// this plan sets it, PANEL_CODEX takes it over): nothing in a record is specific to Claude Code
// but `tool`, which names the tool that measured it. A record holds counts and identifiers only,
// never the text of a prompt or an answer.
//
// A request is identified by session + turn + index + agent (plan, section 5): the collector may
// see one twice (a reload re-reading its file, a resumed session), the sums never do.
// A missing measurement stays missing: null counts and a reason in words, never zeros (R2).
//
// Since E4 a record also says where the work belonged when it was measured: `stage` is the stage
// in progress of the active plan ("PLAN/EN"), `task` the /relai-crew run and task ("run/task"),
// each null when there was none (decision of 2026-10-09, E4: a tag written by the collector, not
// a window of dates, which carry no hours). A record written before E4 has neither field; it reads
// back as it was and is never given a stage it did not have.
//
// ESM without engine or Node API, for the same reason as cache-timer.mjs; the plugin carries a
// byte-identical copy written by core/tools/sync-panel-core.js.

export const SCHEMA = 1;
export const TOOL = 'claude-code';

/** Every field of a record, and nothing else: the test holds records to this list. */
export const RECORD_FIELDS = Object.freeze([
  'v', 'tool', 'session', 'turn', 'index', 'agent', 'kind', 'model', 'at',
  'input', 'cacheRead', 'cacheWrite', 'output', 'missing', 'stage', 'task',
]);

export const MAIN_LABEL = 'wątek główny';

/**
 * @typedef {{
 *   v: 1, tool: string, session: string, turn: string, index: number,
 *   agent: string | null, kind: 'step' | 'compact', model: string | null, at: number,
 *   input: number | null, cacheRead: number | null, cacheWrite: number | null, output: number | null,
 *   missing: string | null, stage?: string | null, task?: string | null
 * }} MeasureRecord
 * @typedef {{ stage?: string | null, task?: string | null }} Tag  where the work belonged
 * @typedef {{
 *   input_tokens?: number, output_tokens?: number,
 *   cache_read_input_tokens?: number, cache_creation_input_tokens?: number, model?: string
 * }} ApiUsage
 * @typedef {{ input: number, cacheRead: number, cacheWrite: number, output: number }} Parts  dollars per category
 * @typedef {{ usd: number | null, missing: string | null, parts?: Parts | null }} PriceOf
 * @typedef {{
 *   label: string, input: number, cacheRead: number, cacheWrite: number, output: number,
 *   usd: number | null, parts: Parts, records: number, isPartial: boolean
 * }} Group
 * @typedef {{ turn: string, agent: string | null, at: number, usd: number | null, records: number, isPartial: boolean }} TurnCost
 * @typedef {{
 *   total: Group, byAgent: Group[], byModel: Group[], records: number,
 *   unmeasured: number, unpriced: string[], isPartial: boolean
 * }} Report
 */

const count = (/** @type {unknown} */ n) => (typeof n === 'number' && Number.isFinite(n) ? n : 0);

/**
 * @param {{ session: string, turn: string, index: number, agent: string | null, kind: 'step' | 'compact', model: string | null, at: number } & Tag} id
 * @param {ApiUsage | null | undefined} usage
 * @param {string} reason  what a record without usage says
 * @returns {MeasureRecord}
 */
function record(id, usage, reason) {
  const base = {
    v: /** @type {1} */ (SCHEMA), tool: TOOL, session: id.session, turn: id.turn, index: id.index,
    agent: id.agent ?? null, kind: id.kind, model: (usage && usage.model) || id.model || null, at: id.at,
  };
  const tag = { stage: id.stage ?? null, task: id.task ?? null };
  if (!usage) return { ...base, input: null, cacheRead: null, cacheWrite: null, output: null, missing: reason, ...tag };
  return {
    ...base,
    input: count(usage.input_tokens), cacheRead: count(usage.cache_read_input_tokens),
    cacheWrite: count(usage.cache_creation_input_tokens), output: count(usage.output_tokens), missing: null, ...tag,
  };
}

/**
 * One request of a loop (turn.step): the main loop's when agent is null, else a subagent's.
 * @param {{ session: string, turn: string, index: number, agent: string | null, model: string | null, at: number, usage: ApiUsage | null | undefined } & Tag} a
 * @returns {MeasureRecord}
 */
export function stepRecord(a) {
  return record({ ...a, kind: 'step' }, a.usage, 'odpowiedź bez usage');
}

/**
 * A compaction's own request (session.compact), which no turn.step carries; model: the loop's.
 * @param {{ session: string, agent: string | null, model: string | null, at: number, usage: ApiUsage | null | undefined } & Tag} a
 * @returns {MeasureRecord}
 */
export function compactRecord(a) {
  return record({ ...a, turn: `compact-${a.at}`, index: 0, kind: 'compact' }, a.usage, 'kompakcja bez usage');
}

/** @param {Pick<MeasureRecord, 'session' | 'turn' | 'index' | 'agent'>} r */
export function recordKey(r) {
  return `${r.session}|${r.turn}|${r.index}|${r.agent ?? 'main'}`;
}

/**
 * The records with the new ones added, each request once: the first record of a key stays.
 * @param {readonly MeasureRecord[]} list
 * @param {readonly MeasureRecord[]} more
 * @returns {MeasureRecord[]}
 */
export function mergeRecords(list, more) {
  const seen = new Set(list.map(recordKey));
  const added = [];
  for (const r of more) {
    const k = recordKey(r);
    if (seen.has(k)) continue;
    seen.add(k);
    added.push(r);
  }
  return [...list, ...added];
}

/**
 * The session file's text: the lines kept from a broken read first, then one line per record.
 * @param {readonly MeasureRecord[]} records
 * @param {readonly string[]} [bad]
 */
export function serializeRecords(records, bad = []) {
  const lines = [...bad, ...records.map((r) => JSON.stringify(r))];
  return lines.join('\n') + (lines.length ? '\n' : '');
}

/** @param {unknown} x @returns {x is MeasureRecord} */
function isRecord(x) {
  if (!x || typeof x !== 'object') return false;
  const r = /** @type {Record<string, unknown>} */ (x);
  return r.v === SCHEMA && typeof r.session === 'string' && typeof r.turn === 'string' && typeof r.index === 'number'
    && (r.kind === 'step' || r.kind === 'compact');
}

/**
 * A session file read back: the records, and the lines that were not records — counted, so a
 * broken file is visible instead of silently shorter, and kept, so a rewrite does not drop them.
 * @param {string | null} text
 * @returns {{ records: MeasureRecord[], rejected: number, bad: string[] }}
 */
export function parseRecords(text) {
  const lines = String(text ?? '').split(/\r?\n/).filter((l) => l.trim() !== '');
  /** @type {MeasureRecord[]} */
  const records = [];
  /** @type {string[]} */
  const bad = [];
  for (const line of lines) {
    let x;
    try { x = JSON.parse(line); } catch { x = null; }
    if (isRecord(x)) records.push(x); else bad.push(line);
  }
  return { records: mergeRecords([], records), rejected: bad.length, bad };
}

const pad = (/** @type {number} */ n) => String(n).padStart(2, '0');
const safeId = (/** @type {string} */ id) => String(id).replace(/[^A-Za-z0-9_-]/g, '');

/**
 * The session's file name: its local start date, then its id, which alone tells sessions apart.
 * @param {Date} date
 * @param {string} session
 */
export function fileName(date, session) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${safeId(session)}.jsonl`;
}

/** Whether a file of the measurements folder is this session's, whatever its date. */
export function isFileOf(/** @type {string} */ name, /** @type {string} */ session) {
  const id = safeId(session);
  return id !== '' && new RegExp(`^\\d{4}-\\d{2}-\\d{2}-${id}\\.jsonl$`).test(name);
}

/** @param {string} label @returns {Group} */
const emptyGroup = (label) => ({ label, input: 0, cacheRead: 0, cacheWrite: 0, output: 0, usd: null, parts: { input: 0, cacheRead: 0, cacheWrite: 0, output: 0 }, records: 0, isPartial: false });

/** @param {Group} g @param {MeasureRecord} r @param {PriceOf} p @returns {Group} */
function addTo(g, r, p) {
  const isPartial = g.isPartial || p.usd === null;
  return {
    label: g.label,
    input: g.input + (r.input ?? 0), cacheRead: g.cacheRead + (r.cacheRead ?? 0),
    cacheWrite: g.cacheWrite + (r.cacheWrite ?? 0), output: g.output + (r.output ?? 0),
    usd: p.usd === null ? g.usd : (g.usd ?? 0) + p.usd,
    parts: p.parts ? {
      input: g.parts.input + p.parts.input, cacheRead: g.parts.cacheRead + p.parts.cacheRead,
      cacheWrite: g.parts.cacheWrite + p.parts.cacheWrite, output: g.parts.output + p.parts.output,
    } : g.parts,
    records: g.records + 1, isPartial,
  };
}

/** @param {MeasureRecord} r */
export const agentLabel = (r) => (r.agent === null ? MAIN_LABEL : `subagent ${r.agent.slice(0, 8)}`);

/**
 * Sums of the session: in total, per agent and per model, each with its dollars where every
 * record has a price; a group with a gap is partial and says so.
 * @param {readonly MeasureRecord[]} records
 * @param {(r: MeasureRecord) => PriceOf} price
 * @returns {Report}
 */
export function aggregate(records, price) {
  const unique = mergeRecords([], records);
  let total = emptyGroup('sesja');
  /** @type {Map<string, Group>} */
  const agents = new Map();
  /** @type {Map<string, Group>} */
  const models = new Map();
  let unmeasured = 0;
  /** @type {Set<string>} */
  const unpriced = new Set();
  for (const r of unique) {
    const p = price(r);
    if (r.missing !== null) unmeasured += 1;
    else if (p.usd === null) unpriced.add(r.model ?? 'nieznany model');
    total = addTo(total, r, p);
    const a = agentLabel(r);
    agents.set(a, addTo(agents.get(a) ?? emptyGroup(a), r, p));
    const m = r.model ?? 'nieznany model';
    models.set(m, addTo(models.get(m) ?? emptyGroup(m), r, p));
  }
  const byAgent = [...agents.values()].sort((x, y) => (x.label === MAIN_LABEL ? -1 : y.label === MAIN_LABEL ? 1 : x.label.localeCompare(y.label)));
  return { total, byAgent, byModel: [...models.values()], records: unique.length, unmeasured, unpriced: [...unpriced].sort(), isPartial: total.isPartial };
}

/**
 * A Polish noun after a count: 1 wywołanie, 2-4 wywołania, 5+ (and 12-14) wywołań.
 * @param {number} n @param {string} one @param {string} few @param {string} many
 */
export function plural(n, one, few, many) {
  const tens = n % 100;
  if (n === 1) return one;
  return n % 10 >= 2 && n % 10 <= 4 && (tens < 12 || tens > 14) ? few : many;
}

const calls = (/** @type {number} */ n) => plural(n, 'wywołanie', 'wywołania', 'wywołań');

/**
 * Why the session's sum is not whole, in words; empty when there is nothing to say.
 * @param {Report} rep
 * @returns {string[]}
 */
export function gapsInWords(rep) {
  if (rep.records === 0) return ['brak pomiarów w tej sesji — żadne wywołanie modelu nie zostało jeszcze zmierzone'];
  const out = [];
  if (rep.unmeasured) out.push(`${rep.unmeasured} ${calls(rep.unmeasured)} bez pomiaru — suma częściowa`);
  for (const m of rep.unpriced) out.push(`brak ceny dla ${m} — tokeny policzone, koszt pominięty`);
  return out;
}

/**
 * The session's turns in the order they began, each with its dollars: a subagent's run is a turn
 * of its own (its own turn id). A turn with a gap has the dollars it could price and says so.
 * @param {readonly MeasureRecord[]} records
 * @param {(r: MeasureRecord) => PriceOf} price
 * @returns {TurnCost[]}
 */
export function turnSeries(records, price) {
  /** @type {Map<string, TurnCost>} */
  const turns = new Map();
  for (const r of mergeRecords([], records)) {
    const k = r.turn + '|' + (r.agent ?? 'main');
    const p = price(r);
    const t = turns.get(k) ?? { turn: r.turn, agent: r.agent, at: r.at, usd: null, records: 0, isPartial: false };
    turns.set(k, {
      ...t, at: Math.min(t.at, r.at), records: t.records + 1, isPartial: t.isPartial || p.usd === null,
      usd: p.usd === null ? t.usd : (t.usd ?? 0) + p.usd,
    });
  }
  return [...turns.values()].sort((a, b) => a.at - b.at);
}

/**
 * The project's measured sessions: in all, and those that began on the given day.
 * @param {ReadonlyArray<readonly MeasureRecord[]>} sessions  one list of records per session file
 * @param {(r: MeasureRecord) => PriceOf} price
 * @param {(at: number) => boolean} isToday
 * @returns {{ sessions: number, usd: number | null, isPartial: boolean, since: number | null, todaySessions: number, todayUsd: number | null }}
 */
export function projectSummary(sessions, price, isToday) {
  let usd = null, todayUsd = null, isPartial = false, since = null, todaySessions = 0, count = 0;
  for (const records of sessions) {
    if (!records.length) continue;
    const rep = aggregate(records, price);
    const first = Math.min(...records.map((r) => r.at));
    count += 1;
    since = since === null ? first : Math.min(since, first);
    isPartial = isPartial || rep.isPartial;
    if (rep.total.usd !== null) usd = (usd ?? 0) + rep.total.usd;
    if (isToday(first)) {
      todaySessions += 1;
      if (rep.total.usd !== null) todayUsd = (todayUsd ?? 0) + rep.total.usd;
    }
  }
  return { sessions: count, usd, isPartial, since, todaySessions, todayUsd };
}

/**
 * Every request of the session in time order, priced: the columns of the report, one per call,
 * with the turn each belongs to (a long turn of an agentic answer holds many).
 * @param {readonly MeasureRecord[]} records
 * @param {(r: MeasureRecord) => PriceOf} price
 * @returns {{ at: number, usd: number | null, parts: Parts | null, turn: string, agent: string | null, kind: 'step' | 'compact', input: number | null, cacheRead: number | null, cacheWrite: number | null, output: number | null }[]}
 */
export function requestSeries(records, price) {
  return mergeRecords([], records)
    .map((r) => { const p = price(r); return { at: r.at, usd: p.usd, parts: p.parts ?? null, turn: r.turn, agent: r.agent, kind: r.kind, input: r.input, cacheRead: r.cacheRead, cacheWrite: r.cacheWrite, output: r.output }; })
    .sort((a, b) => a.at - b.at);
}
