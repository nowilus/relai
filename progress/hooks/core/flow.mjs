// RelAI core / panel: flow — the map of the work (plan PANEL_CLAUDE, E4): plans, their stages and
// branches, /relai-crew runs with their waves, and the tasks the person merged on the map.
//
// Everything from text: STATUS.md of each plan, zadania.json and manifest.json of a crew run, and
// the panel's own merge file. Reading the files belongs to the caller; same ESM rule and same copy
// as plan-state.mjs (source here, synced copies in the plugins). Values are matched against closed
// lists; anything else stays visible as words, never a guess.
//
// Merging is a view (decision of 2026-10-09, E4): the merge file (.claude/relai/panel/scalenia.json)
// is the panel's own; the files of a crew run are never written.

import { cells, parseStatus, PLAN_STATUSES } from './plan-state.mjs';

/** Statuses of a branch (SPEC_STATUS, section "Odnogi"), longest first. */
export const BRANCH_STATUSES = Object.freeze(['PRZENIESIONA', 'ZAMKNIĘTA', 'OTWARTA']);

export const MERGE_FILE = '.claude/relai/panel/scalenia.json';

/**
 * @typedef {import('./plan-state.mjs').Stage} Stage
 * @typedef {{ name: string, about: string, source: string | null, sourceWords: string,
 *   status: string | null, statusWords: string }} Branch
 * @typedef {'active' | 'open' | 'archive'} Place
 * @typedef {Stage & { date: string | null }} MapStage  a stage with the date of its status cell
 * @typedef {{ name: string, place: Place, planStatus: string | null, closedOn: string | null,
 *   stages: MapStage[], branches: Branch[] }} PlanNode
 * @typedef {{ id: string, title?: unknown, files?: unknown, dependsOn?: unknown }} CrewTask
 * @typedef {'done' | 'running' | 'failed' | 'pending'} TaskStatus
 * @typedef {{ id: string, name: string, deps: string[], status: TaskStatus, stage: string | null,
 *   members: { id: string, name: string, status: TaskStatus }[], isGroup: boolean }} MapTask
 * @typedef {{ n: number, isParallel: boolean, tasks: MapTask[] }} Wave
 * @typedef {{ run: string, error: string, waves: Wave[], conflicts: { first: string, second: string, files: string[] }[] }} CrewRun
 * @typedef {{ id: string, run: string, tasks: string[], name: string | null, stage: string | null }} MergeGroup
 * @typedef {{ v: 1, groups: MergeGroup[], rejected: number }} Merges
 */

const lines = (/** @type {string} */ text) => String(text).split(/\r?\n/);
const unbold = (/** @type {string} */ s) => s.replace(/\*\*/g, '').trim();

/** @param {string} text @param {readonly string[]} list */
function leading(text, list) {
  const value = unbold(text);
  return list.find((s) => value.startsWith(s)) ?? null;
}

/**
 * The plan status and the date that follows it in the metric line ("ZREALIZOWANY 2026-09-24").
 * @param {string} statusMd
 * @returns {string | null}
 */
function closedOn(statusMd) {
  const metric = lines(statusMd).find((l) => l.includes('PLAN.html')) ?? '';
  for (const bold of metric.split('**').filter((_, i) => i % 2 === 1)) {
    const status = leading(bold, PLAN_STATUSES);
    if (status === null) continue;
    const m = unbold(bold).slice(status.length).match(/^\s*(\d{4}-\d{2}-\d{2})/);
    return m && m[1] ? m[1] : null;
  }
  return null;
}

/**
 * The lines of a "## <title>" section, up to the next "## " heading.
 * @param {string} md @param {string} title
 * @returns {string[]}
 */
function section(md, title) {
  const all = lines(md);
  const start = all.findIndex((l) => l.startsWith('## ' + title));
  if (start < 0) return [];
  const rest = all.slice(start + 1);
  const end = rest.findIndex((l) => l.startsWith('## '));
  return end < 0 ? rest : rest.slice(0, end);
}

/**
 * Where a branch came from: a stage of this plan ("E1", "E1, zakres rozszerzony w E2"), or words
 * only when it names a stage of another plan ("E1 planu ROZWOJ_PO_WYDANIU").
 * @param {string} words
 */
function sourceStage(words) {
  const m = words.match(/^E\d+/);
  if (!m) return null;
  return /^E\d+\s+planu\s/.test(words) ? null : m[0];
}

/**
 * One branch from its pieces; the status from the closed list or null, its words kept.
 * @param {string} name @param {string} about @param {string} sourceWords @param {string} statusWords
 * @returns {Branch}
 */
function branch(name, about, sourceWords, statusWords) {
  const words = unbold(sourceWords);
  return { name, about, source: sourceStage(words), sourceWords: words, status: leading(statusWords, BRANCH_STATUSES), statusWords: unbold(statusWords) };
}

/**
 * The branches of a plan from the "Odnogi" section of its STATUS.md, in the two shapes the repo
 * holds: a list of bold names (lines wrapped and indented under a bullet) and a table.
 * @param {string} statusMd
 * @returns {Branch[]}
 */
export function parseBranches(statusMd) {
  const body = section(statusMd, 'Odnogi');
  const header = body.find((l) => l.trim().startsWith('|') && cells(l).includes('Odnoga'));
  if (header) {
    const h = cells(header);
    const col = (/** @type {string} */ name) => h.findIndex((c) => c.toLowerCase().startsWith(name));
    const [name, about, source, status] = [col('odnoga'), col('o co'), col('etap'), col('status')];
    return body
      .filter((l) => l.trim().startsWith('|') && l !== header && !/^\|[\s|:-]+\|?\s*$/.test(l.trim()))
      .map((l) => cells(l))
      .map((c) => branch(unbold(c[name] ?? ''), c[about] ?? '', c[source] ?? '', c[status] ?? ''));
  }
  /** @type {string[]} */
  const items = [];
  for (const line of body) {
    if (line.startsWith('- **')) items.push(line.slice(2).trim());
    else if (items.length && /^\s+\S/.test(line)) items[items.length - 1] += ' ' + line.trim();
  }
  return items.map((item) => {
    const bold = item.split('**').filter((_, i) => i % 2 === 1);
    const name = (bold[0] ?? '').trim();
    const rest = item.slice(item.indexOf('**', 2) + 2);
    const about = (rest.match(/^\s*—\s*([^·]*)/)?.[1] ?? '').trim();
    // "zrodlo:" without diacritics stands in the archive too (GUARD_PO_SCIEZCE, ROZWOJ_PO_WYDANIU)
    const source = rest.match(/(?:etap-)?(?:źródło|zrodlo):\s*([^·]*)/)?.[1] ?? '';
    // A status outside the closed list (ANULOWANA in the archive) keeps its words, unrecognised
    const status = bold.slice(1).find((b) => leading(b, BRANCH_STATUSES) !== null)
      ?? bold.slice(1).find((b) => /^[A-ZĄĆĘŁŃÓŚŹŻ]{4,}/.test(b.trim())) ?? '';
    return branch(name, about, source, status);
  });
}

/**
 * One plan of the map.
 * @param {string} name @param {Place} place @param {string} statusMd
 * @returns {PlanNode}
 */
export function planNode(name, place, statusMd) {
  const { planStatus, stages } = parseStatus(statusMd);
  const dates = stageDates(statusMd);
  return { name, place, planStatus, closedOn: closedOn(statusMd), stages: stages.map((s) => ({ ...s, date: dates.get(s.id) ?? null })), branches: parseBranches(statusMd) };
}

/**
 * The date in each stage's status cell ("ZREALIZOWANY 2026-09-24"), by stage id; a cell without
 * one is absent. The map tells a stage closed before the collector existed from one closed while
 * it measured without a tag (calibration 2026-10-09).
 * @param {string} statusMd
 * @returns {Map<string, string>}
 */
function stageDates(statusMd) {
  const all = lines(statusMd);
  const header = all.find((l) => l.trim().startsWith('|') && cells(l).includes('Status') && cells(l).includes('Etap'));
  const h = header ? cells(header) : [];
  const [idCol, statusCol] = [h.indexOf('Etap'), h.indexOf('Status')];
  /** @type {Map<string, string>} */
  const out = new Map();
  if (idCol < 0 || statusCol < 0) return out;
  for (const row of all) {
    const c = cells(row);
    const id = unbold(c[idCol] ?? '');
    const m = (c[statusCol] ?? '').match(/\d{4}-\d{2}-\d{2}/);
    if (/^E\d+/.test(id) && m) out.set(id, m[0]);
  }
  return out;
}

/**
 * The map: the active plan first, then the other open plans by name, then the archive, the most
 * recently closed first.
 * @param {string | null} active  the plan of the "Aktywny plan" line, null for none
 * @param {{ name: string, place: 'open' | 'archive', statusMd: string }[]} plans
 * @returns {PlanNode[]}
 */
export function flowMap(active, plans) {
  const nodes = plans.map((p) => planNode(p.name, p.place === 'open' && p.name === active ? 'active' : p.place, p.statusMd));
  const rank = (/** @type {PlanNode} */ n) => (n.place === 'active' ? 0 : n.place === 'open' ? 1 : 2);
  return [...nodes].sort((a, b) => rank(a) - rank(b)
    || (a.place === 'archive' ? (b.closedOn ?? '').localeCompare(a.closedOn ?? '') : 0)
    || a.name.localeCompare(b.name));
}

/**
 * A stage tag of a measurement ("PANEL_CLAUDE/E4") as plan and stage; null for anything else.
 * @param {string | null | undefined} tag
 */
export function splitStage(tag) {
  const m = String(tag ?? '').match(/^([^/\s]+)\/(E\d+)$/);
  return m && m[1] && m[2] ? { plan: m[1], stage: m[2] } : null;
}

// ---------- crew runs ----------

const normPath = (/** @type {unknown} */ p) => String(p).replace(/\\/g, '/').replace(/^\.\//, '').toLowerCase();
const list = (/** @type {unknown} */ x) => (Array.isArray(x) ? x : []);

/**
 * The waves of a run, by the rule of core/process/crew.js (planWaves), which runs them: two tasks
 * sharing a file never stand in one wave — the later one depends on the earlier; explicit
 * dependsOn too; a cycle is an error, never a guess. Ported, because the mod cannot import a
 * CommonJS tool; flow.test.js holds the two to the same waves.
 * @param {readonly CrewTask[]} tasks
 * @returns {{ waves: string[][], conflicts: { first: string, second: string, files: string[] }[], deps: Map<string, Set<string>>, error: string }}
 */
export function crewWaves(tasks) {
  const deps = new Map();
  if (!Array.isArray(tasks) || !tasks.length) return { waves: [], conflicts: [], deps, error: 'brak zadań' };
  const ids = new Set();
  for (const t of tasks) {
    if (!t || !t.id) return { waves: [], conflicts: [], deps, error: 'zadanie bez id' };
    if (ids.has(t.id)) return { waves: [], conflicts: [], deps, error: 'powtórzone id: ' + t.id };
    ids.add(t.id);
  }
  for (const t of tasks) deps.set(t.id, new Set(list(t.dependsOn).map(String).filter((d) => ids.has(d))));
  /** @type {{ first: string, second: string, files: string[] }[]} */
  const conflicts = [];
  for (let i = 0; i < tasks.length; i++) {
    const a = new Set(list(tasks[i]?.files).map(normPath));
    for (let j = i + 1; j < tasks.length; j++) {
      const shared = list(tasks[j]?.files).map(normPath).filter((x) => a.has(x));
      if (!shared.length) continue;
      const first = String(tasks[i]?.id), second = String(tasks[j]?.id);
      conflicts.push({ first, second, files: shared });
      deps.get(second)?.add(first);
    }
  }
  const done = new Set();
  /** @type {string[][]} */
  const waves = [];
  let left = tasks.map((t) => String(t.id));
  while (left.length) {
    const wave = left.filter((id) => [...(deps.get(id) ?? [])].every((d) => done.has(d)));
    if (!wave.length) return { waves, conflicts, deps, error: 'cykl zależności: ' + left.join(', ') };
    waves.push(wave);
    wave.forEach((id) => done.add(id));
    left = left.filter((id) => !done.has(id));
  }
  return { waves, conflicts, deps, error: '' };
}

/** @param {string | null} text @returns {unknown} */
function json(text) {
  if (text === null) return undefined;
  try { return JSON.parse(text); } catch { return undefined; }
}

/** @param {unknown} s @returns {TaskStatus} */
function taskStatus(s) {
  return s === 'done' ? 'done' : s === 'running' ? 'running' : s === 'failed' || s === 'timeout' ? 'failed' : 'pending';
}

/** A merged task's status: failed beats running beats pending; done only when all are. @param {TaskStatus[]} all */
function groupStatus(all) {
  for (const s of /** @type {TaskStatus[]} */ (['failed', 'running', 'pending'])) if (all.includes(s)) return s;
  return 'done';
}

/**
 * A /relai-crew run as the map draws it: its waves, each task with its dependencies (explicit and
 * from shared files) and its status from the manifest; merged tasks as one, their members kept.
 * @param {string} runId @param {string | null} tasksText @param {string | null} manifestText
 * @param {Merges} [merges]
 * @returns {CrewRun}
 */
export function crewRun(runId, tasksText, manifestText, merges) {
  const tasks = json(tasksText);
  if (!Array.isArray(tasks) || !tasks.length) return { run: runId, error: 'zadania.json nieczytelny albo pusty', waves: [], conflicts: [] };
  const plan = crewWaves(/** @type {CrewTask[]} */ (tasks));
  if (plan.error) return { run: runId, error: plan.error, waves: [], conflicts: plan.conflicts };
  const manifest = /** @type {{ tasks?: { id?: unknown, status?: unknown }[] } | undefined} */ (json(manifestText));
  const status = new Map(list(manifest?.tasks).map((t) => [String(t?.id), taskStatus(t?.status)]));
  const byId = new Map(/** @type {CrewTask[]} */ (tasks).map((t) => [String(t.id), t]));
  const nameOf = (/** @type {string} */ id) => { const t = byId.get(id)?.title; return typeof t === 'string' && t.trim() ? t.trim() : id; };
  const groups = (merges?.groups ?? []).filter((g) => g.run === runId && g.tasks.every((id) => byId.has(id)));
  const groupOf = new Map(groups.flatMap((g) => g.tasks.map((id) => [id, g])));
  const waveOf = new Map(plan.waves.flatMap((w, i) => w.map((id) => [id, i])));
  /** @type {Wave[]} */
  const waves = plan.waves.map((w, i) => ({ n: i + 1, isParallel: w.length > 1, tasks: [] }));
  const seen = new Set();
  for (const wave of plan.waves) {
    for (const id of wave) {
      const g = groupOf.get(id);
      const key = g ? 'g:' + g.id : id;
      if (seen.has(key)) continue;
      seen.add(key);
      const ids = g ? g.tasks : [id];
      const at = Math.max(...ids.map((x) => waveOf.get(x) ?? 0));
      const members = ids.map((x) => ({ id: x, name: nameOf(x), status: status.get(x) ?? /** @type {TaskStatus} */ ('pending') }));
      const deps = [...new Set(ids.flatMap((x) => [...(plan.deps.get(x) ?? [])]))].filter((d) => !ids.includes(d));
      waves[at]?.tasks.push({
        id: g ? g.id : id, name: g ? (g.name ?? members.map((x) => x.name).join(' + ')) : nameOf(id), deps,
        status: groupStatus(members.map((x) => x.status)), stage: g ? g.stage : null, members: g ? members : [], isGroup: g !== undefined,
      });
    }
  }
  return { run: runId, error: '', waves: waves.filter((w) => w.tasks.length), conflicts: plan.conflicts };
}

// ---------- the merge file ----------

/** @param {unknown} g @returns {g is MergeGroup} */
function isGroup(g) {
  if (!g || typeof g !== 'object') return false;
  const x = /** @type {Record<string, unknown>} */ (g);
  return typeof x.id === 'string' && typeof x.run === 'string' && Array.isArray(x.tasks) && x.tasks.length > 0
    && x.tasks.every((t) => typeof t === 'string') && (x.name === null || typeof x.name === 'string')
    && (x.stage === null || typeof x.stage === 'string');
}

/**
 * The merge file read back; a broken file or group is counted in `rejected`, never trusted.
 * @param {string | null} text
 * @returns {Merges}
 */
export function parseMerges(text) {
  if (text === null || text.trim() === '') return { v: 1, groups: [], rejected: 0 };
  const x = /** @type {{ groups?: unknown } | undefined} */ (json(text));
  if (!x || typeof x !== 'object' || !Array.isArray(x.groups)) return { v: 1, groups: [], rejected: 1 };
  const groups = x.groups.filter(isGroup).map((g) => ({ id: g.id, run: g.run, tasks: [...g.tasks], name: g.name, stage: g.stage }));
  return { v: 1, groups, rejected: x.groups.length - groups.length };
}

/** @param {Merges} m */
export function serializeMerges(m) {
  return JSON.stringify({ v: 1, groups: m.groups }, null, 2) + '\n';
}

/** @param {Merges} m */
function nextId(m) {
  const n = Math.max(0, ...m.groups.map((g) => Number(g.id.replace(/^g/, '')) || 0));
  return 'g' + (n + 1);
}

/**
 * Two or more tasks of one run shown as one; a task already merged elsewhere changes nothing.
 * @param {Merges} m @param {string} run @param {string[]} ids @param {string | null} name
 * @returns {Merges}
 */
export function mergeTasks(m, run, ids, name) {
  const unique = [...new Set(ids)];
  const taken = new Set(m.groups.filter((g) => g.run === run).flatMap((g) => g.tasks));
  if (unique.length < 2 || unique.some((id) => taken.has(id))) return m;
  return { ...m, groups: [...m.groups, { id: nextId(m), run, tasks: unique, name, stage: null }] };
}

/**
 * A single task given a stage: a group of one, so the map and the costs read it the same way.
 * @param {Merges} m @param {string} run @param {string} id @param {string | null} stage
 * @returns {Merges}
 */
export function assignTask(m, run, id, stage) {
  const g = m.groups.find((x) => x.run === run && x.tasks.includes(id));
  if (g) return assignStage(m, g.id, stage);
  return { ...m, groups: [...m.groups, { id: nextId(m), run, tasks: [id], name: null, stage }] };
}

/** @param {Merges} m @param {string} groupId @param {string | null} stage @returns {Merges} */
export function assignStage(m, groupId, stage) {
  return { ...m, groups: m.groups.map((g) => (g.id === groupId ? { ...g, stage } : g)) };
}

/** The tasks of a group back as they were. @param {Merges} m @param {string} groupId @returns {Merges} */
export function splitGroup(m, groupId) {
  return { ...m, groups: m.groups.filter((g) => g.id !== groupId) };
}

/**
 * What the person picked on the map, merged: a picked group gives its tasks to the new one.
 * @param {Merges} m @param {string} run @param {string[]} picked  task and group ids of the run
 * @returns {Merges}
 */
export function mergePicked(m, run, picked) {
  const groups = m.groups.filter((g) => g.run === run && picked.includes(g.id));
  const ids = [...new Set(picked.flatMap((id) => groups.find((g) => g.id === id)?.tasks ?? [id]))];
  if (ids.length < 2) return m;
  const without = groups.reduce((acc, g) => splitGroup(acc, g.id), m);
  const merged = mergeTasks(without, run, ids, null);
  return merged === without ? m : merged;
}

/**
 * What the person picked on the map, given a stage (null takes it back); a lone task left with
 * neither a stage nor a partner is no group at all.
 * @param {Merges} m @param {string} run @param {string[]} picked @param {string | null} stage
 * @returns {Merges}
 */
export function assignPicked(m, run, picked, stage) {
  let out = m;
  for (const id of picked) {
    const g = out.groups.find((x) => x.run === run && x.id === id);
    if (g) out = assignStage(out, g.id, stage);
    else if (stage !== null || out.groups.some((x) => x.run === run && x.tasks.includes(id))) out = assignTask(out, run, id, stage);
  }
  return { ...out, groups: out.groups.filter((g) => g.tasks.length > 1 || g.stage !== null) };
}
