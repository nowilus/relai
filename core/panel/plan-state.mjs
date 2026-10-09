// RelAI core / panel: plan-state — the active plan and its current stage, read from text.
//
// Input is the text of CLAUDE.md and of the plan's STATUS.md; reading the files belongs to the
// caller (the mod reads them through $.fs, a Node tool through fs). Same ESM rule and same copy
// as cache-timer.mjs: this file is the source, panel/hooks/core/ holds the synced copy.
//
// Values are matched against closed lists, anchored at the start of the cell (or of the bold
// segment of the metric line); anything else is "not recognised" and stays silent, never a
// guess. Lines are split on CRLF or LF and no pattern anchors the end of a line.

/** Stage statuses of SPEC_STATUS, longest first so a prefix never wins. */
export const STAGE_STATUSES = Object.freeze(['GOTOWY DO STARTU', 'ZREALIZOWANY', 'POMINIĘTY', 'OCZEKUJE', 'W TOKU']);

/** Plan statuses as the metric line carries them, longest first. */
export const PLAN_STATUSES = Object.freeze(['CZĘŚCIOWO ZREALIZOWANY', 'DO AKCEPTACJI', 'ZAAKCEPTOWANY', 'ZREALIZOWANY', 'W TOKU']);

/**
 * @typedef {{ id: string, name: string, status: string }} Stage
 * @typedef {{ kind: 'none' }
 *   | { kind: 'unknown', reason: string }
 *   | { kind: 'ok', plan: string, statusPath: string, planStatus: string | null,
 *       stage: Stage | null, stages: number, closed: number }} PlanState
 */

/**
 * @param {string} text
 * @returns {string[]}
 */
function lines(text) {
  return String(text).split(/\r?\n/);
}

/**
 * The value from the list the text starts with, or null.
 * @param {string} text
 * @param {readonly string[]} list
 * @returns {string | null}
 */
function leading(text, list) {
  const value = text.replace(/\*\*/g, '').trim();
  return list.find((s) => value.startsWith(s)) ?? null;
}

/**
 * Cells of one table row, split on pipes not escaped with a backslash.
 * @param {string} row
 * @returns {string[]}
 */
export function cells(row) {
  const parts = row.trim().split(/(?<!\\)\|/);
  return parts.slice(1, parts.length - 1).map((c) => c.trim());
}

/**
 * The folder and each of its parents, nearest first, with forward slashes. The session's cwd
 * follows every cd the model's shell makes (2.1.293, E9), so a mod looks for the RelAI marker
 * upwards from it, as git looks for .git, instead of in the cwd alone.
 * @param {string} dir
 * @returns {string[]}
 */
export function ancestors(dir) {
  const parts = String(dir).split(/[\\/]+/).filter((x, i) => x !== '' || i === 0);
  /** @type {string[]} */
  const out = [];
  for (let n = parts.length; n > 0; n--) {
    const path = parts.slice(0, n).join('/');
    if (path !== '') out.push(path);
  }
  return out;
}

/**
 * The "Aktywny plan" line of CLAUDE.md: a plan link, "brak", or something unreadable.
 * @param {string} claudeMd
 * @returns {{ kind: 'none' } | { kind: 'unknown', reason: string } | { kind: 'plan', plan: string, statusPath: string }}
 */
export function parseActivePlan(claudeMd) {
  const line = lines(claudeMd).find((l) => l.startsWith('Aktywny plan:'));
  if (line === undefined) return { kind: 'none' };
  const rest = line.slice('Aktywny plan:'.length).trim();
  if (rest.startsWith('brak')) return { kind: 'none' };
  const m = rest.match(/^\[([^\]]+)\]\(([^)\s]+STATUS\.md)\)/);
  if (!m || !m[1] || !m[2]) return { kind: 'unknown', reason: 'linia „Aktywny plan” bez linku do STATUS.md' };
  return { kind: 'plan', plan: m[1], statusPath: m[2] };
}

/**
 * Plan status from the metric line (the first line that links PLAN.html), stage table rows.
 * @param {string} statusMd
 * @returns {{ planStatus: string | null, stages: Stage[] }}
 */
export function parseStatus(statusMd) {
  const all = lines(statusMd);
  const metric = all.find((l) => l.includes('PLAN.html')) ?? '';
  // Bold segments are the odd pieces between "**"; a bold run left open at the end of the line
  // (archived HIGIENA_DOKUMENTOW wraps it onto the next line) still counts.
  const bold = metric.split('**').filter((_, i) => i % 2 === 1);
  const planStatus = bold.map((b) => leading(b, PLAN_STATUSES)).find((s) => s !== null) ?? null;

  const header = all.find((l) => l.trim().startsWith('|') && cells(l).includes('Status') && cells(l).includes('Etap'));
  const headerCells = header ? cells(header) : [];
  const idCol = headerCells.indexOf('Etap');
  const nameCol = headerCells.indexOf('Nazwa');
  const statusCol = headerCells.indexOf('Status');
  if (idCol < 0 || statusCol < 0) return { planStatus, stages: [] };

  /** @type {Stage[]} */
  const stages = [];
  for (const row of all) {
    const c = cells(row);
    const id = (c[idCol] ?? '').replace(/\*\*/g, '');
    if (!/^E\d+/.test(id)) continue;
    const status = leading(c[statusCol] ?? '', STAGE_STATUSES);
    if (status === null) continue;
    stages.push({ id, name: nameCol >= 0 ? (c[nameCol] ?? '').replace(/\*\*/g, '') : '', status });
  }
  return { planStatus, stages };
}

/**
 * What the panel shows: none, unknown (with a reason), or the plan and its current stage.
 * readStatus answers the text of STATUS.md for the linked path, or null when it cannot be read;
 * it may be async (the mod reads through $.fs).
 * @param {string | null} claudeMd
 * @param {(statusPath: string) => string | null | Promise<string | null>} readStatus
 * @returns {Promise<PlanState>}
 */
export async function planState(claudeMd, readStatus) {
  if (claudeMd === null) return { kind: 'unknown', reason: 'nie można odczytać CLAUDE.md' };
  const active = parseActivePlan(claudeMd);
  if (active.kind !== 'plan') return active;
  const statusMd = await readStatus(active.statusPath);
  if (statusMd === null) return { kind: 'unknown', reason: `nie można odczytać ${active.statusPath}` };
  const { planStatus, stages } = parseStatus(statusMd);
  const stage = stages.find((s) => s.status === 'W TOKU') ?? stages.find((s) => s.status === 'GOTOWY DO STARTU') ?? null;
  const closed = stages.filter((s) => s.status === 'ZREALIZOWANY' || s.status === 'POMINIĘTY').length;
  return { kind: 'ok', plan: active.plan, statusPath: active.statusPath, planStatus, stage, stages: stages.length, closed };
}
