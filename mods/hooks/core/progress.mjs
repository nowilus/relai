// RelAI core / panel: progress — how far the work of the session is, from files alone (plan
// PANEL_CLAUDE, E9, Aneks C).
//
// Sources, deterministic only (decision of 2026-10-09: no tool the model calls, nothing added to
// the prompt): a live /relai-crew run (its zadania.json and manifest.json), else the stage in
// progress of the active plan (the boxes of its PROMPT_ETAP_N.md), else nothing — said in words,
// never as a percent. Reading the files belongs to the caller; same ESM rule and same copy as
// plan-state.mjs (source here, synced copies in the plugins' hooks/core/).

import { cells } from './plan-state.mjs';

/**
 * @typedef {import('./plan-state.mjs').PlanState} PlanState
 * @typedef {'done' | 'pending' | 'running' | 'failed' | 'unknown'} ItemStatus
 * @typedef {{ id: string, label: string, name: string, status: ItemStatus }} Item  one box or crew task
 * @typedef {{ kind: 'stage' | 'crew' | 'free', title: string, done: number, total: number,
 *   percent: number | null, words: string, items: Item[] }} Progress
 */

/** A crew run untouched this long is history, not the work at hand. */
export const CREW_WINDOW_MS = 12 * 60 * 60 * 1000;

/** The longest short label of a tile, ellipsis included (brief: tiles of ~60–120 px). */
export const LABEL_MAX = 19;

const BOX = /^\s*- \[([ xX])\]\s*(.*)$/;

/**
 * The text of a box without markdown: bold, code and links kept as their words.
 * @param {string} text
 */
function plain(text) {
  return String(text).replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\*\*|`/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * A tile's label: the first clause of the name (before " — ", ": ", " (", ", "), clipped with an
 * ellipsis; deterministic, never a model's summary.
 * @param {string} text
 */
export function shortLabel(text) {
  const full = plain(text);
  const cut = [' — ', ': ', ' (', ', '].map((sep) => full.indexOf(sep)).filter((i) => i > 0);
  const head = cut.length ? full.slice(0, Math.min(...cut)) : full;
  if (head === '') return '?';
  return head.length > LABEL_MAX ? head.slice(0, LABEL_MAX - 1) + '…' : head;
}

/**
 * The boxes of a prompt as items, in source order; the id is the source and the box's position,
 * which does not depend on its state.
 * @param {string} text @param {string} source
 * @returns {Item[]}
 */
export function checklistItems(text, source) {
  /** @type {Item[]} */
  const items = [];
  const lines = String(text).split(/\r?\n/);
  lines.forEach((line, i) => {
    const m = line.match(BOX);
    if (!m) return;
    // The name goes on over the indented lines below the box, up to the next box or a blank line
    const parts = [m[2] ?? ''];
    for (let k = i + 1; k < lines.length; k++) {
      const next = lines[k] ?? '';
      if (next.trim() === '' || BOX.test(next) || !/^\s/.test(next)) break;
      parts.push(next.trim());
    }
    items.push({ id: `${source}#${items.length + 1}`, label: shortLabel(m[2] ?? ''), name: plain(parts.join(' ')), status: m[1] === ' ' ? 'pending' : 'done' });
  });
  return items;
}

/**
 * Checkboxes at the start of a line (indented ones too); a box quoted inside a sentence is not one.
 * @param {string} text
 * @returns {{ done: number, total: number }}
 */
export function checklist(text) {
  const items = checklistItems(text, '');
  return { done: items.filter((x) => x.status === 'done').length, total: items.length };
}

/**
 * Percent with two decimals, cut and not rounded, so nothing reads 100 before the last box.
 * @param {number} done @param {number} total
 * @returns {number | null}
 */
export function percent(done, total) {
  if (total <= 0) return null;
  if (done >= total) return 100;
  return Math.floor((done * 10000) / total) / 100;
}

/**
 * The Prompt link of a stage's row in STATUS.md, as a path next to STATUS.md; null when none.
 * @param {string} statusMd @param {string} stageId @param {string} statusPath
 * @returns {string | null}
 */
export function promptLink(statusMd, stageId, statusPath) {
  const rows = String(statusMd).split(/\r?\n/).filter((l) => l.trim().startsWith('|'));
  const header = rows.find((l) => cells(l).includes('Etap') && cells(l).includes('Prompt'));
  if (!header) return null;
  const idCol = cells(header).indexOf('Etap');
  const promptCol = cells(header).indexOf('Prompt');
  const row = rows.find((l) => (cells(l)[idCol] ?? '').replace(/\*\*/g, '') === stageId);
  const m = row ? (cells(row)[promptCol] ?? '').match(/\]\(([^)\s]+\.md)\)/) : null;
  if (!m || !m[1]) return null;
  const dir = statusPath.includes('/') ? statusPath.slice(0, statusPath.lastIndexOf('/') + 1) : '';
  return dir + m[1];
}

/**
 * Polish noun after a count: 1 punkt, 2-4 punkty, 5+ punktów (12-14 too).
 * @param {number} n @param {string} one @param {string} few @param {string} many
 */
function noun(n, one, few, many) {
  if (n === 1) return one;
  const tens = n % 100;
  const last = n % 10;
  return last >= 2 && last <= 4 && (tens < 12 || tens > 14) ? few : many;
}

/**
 * The stage in progress of the active plan, from its prompt's boxes; null when there is no stage.
 * @param {PlanState} plan
 * @param {string | null} promptText  the stage prompt, null when it could not be read
 * @param {string} [source]  the prompt's path, the stem of its items' ids
 * @returns {Progress | null}
 */
export function stageProgress(plan, promptText, source = 'prompt') {
  if (plan.kind !== 'ok' || !plan.stage) return null;
  // The plan's name stands in the plan bar; this bar names the stage (STYL_PASKOW_CLAUDE.md, 6)
  const title = `${plan.stage.id}${plan.stage.name ? ' · ' + plan.stage.name : ''}`;
  const base = { kind: /** @type {const} */ ('stage'), title, done: 0, total: 0, percent: null, items: /** @type {Item[]} */ ([]) };
  if (plan.stage.status !== 'W TOKU') return { ...base, words: `etap ${plan.stage.status.toLowerCase()}` };
  if (promptText === null) return { ...base, words: 'brak promptu etapu — nie ma czego liczyć' };
  const items = checklistItems(promptText, source);
  const done = items.filter((x) => x.status === 'done').length;
  const total = items.length;
  if (total === 0) return { ...base, words: 'prompt etapu bez punktów do odhaczenia' };
  return { ...base, done, total, items, percent: percent(done, total), words: `${done} z ${total} ${noun(total, 'punktu', 'punktów', 'punktów')}` };
}

/** @param {string | null} text @returns {unknown} */
function json(text) {
  if (text === null) return null;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/**
 * A /relai-crew run: done tasks of the manifest over the tasks of zadania.json. Null when the files
 * do not parse, the run has no tasks, every task is closed, or the run is older than the window.
 * @param {string} runId @param {string | null} tasksText @param {string | null} manifestText @param {number} now
 * @returns {Progress | null}
 */
export function crewProgress(runId, tasksText, manifestText, now) {
  const tasks = json(tasksText);
  if (!Array.isArray(tasks) || tasks.length === 0) return null;
  const manifest = /** @type {{ updatedAt?: string, createdAt?: string, tasks?: { id: string, status: string }[] } | null | undefined} */ (json(manifestText));
  if (manifest === undefined) return null;
  const stamp = manifest ? Date.parse(manifest.updatedAt ?? manifest.createdAt ?? '') : NaN;
  if (Number.isFinite(stamp) && now - stamp > CREW_WINDOW_MS) return null;
  const status = new Map((manifest?.tasks ?? []).map((t) => [t.id, t.status]));
  /** @type {Item[]} */
  const items = tasks.map((t) => {
    const task = /** @type {{ id?: unknown, title?: unknown }} */ (t);
    const id = String(task.id);
    const name = typeof task.title === 'string' && task.title.trim() ? task.title.trim() : id;
    const st = status.get(id);
    /** @type {ItemStatus} */
    const s = st === 'done' ? 'done' : st === 'failed' || st === 'timeout' ? 'failed' : 'pending';
    return { id, label: shortLabel(name), name, status: s };
  });
  const done = items.filter((x) => x.status === 'done').length;
  const failed = items.filter((x) => x.status === 'failed').length;
  if (done + failed >= items.length) return null;
  const total = items.length;
  const words = `${done} z ${total} ${noun(total, 'zadania', 'zadań', 'zadań')}${failed ? `, ${failed} nieudane` : ''}`;
  return { kind: 'crew', title: `załoga ${runId}`, done, total, percent: percent(done, total), words, items };
}

/**
 * What the bar shows: a live crew run, else the stage, else free work in words.
 * @param {Progress | null} crew @param {Progress | null} stage
 * @returns {Progress}
 */
export function pick(crew, stage) {
  return crew ?? stage ?? { kind: 'free', title: 'praca poza planem', done: 0, total: 0, percent: null, words: 'praca poza planem — brak źródła postępu', items: [] };
}

