// RelAI core / panel: limit-threshold — reading the two plan-limit thresholds (LIMIT_CHECKPOINT E1,
// two of them since Aneks C): from what percent used the 5-hour window (90 by default, the main
// use) and the week (98: it matters only near the end) warn. Each is read in the order of the
// optimizer's consent (core/process/prompt-mode.js): this session's file → its row in the
// project's docs/USTAWIENIA.md → the same row in ~/.claude/relai/USTAWIENIA.md → its default.
// A value outside 1–99, or no number at all, is skipped and the next level decides.
//
// One reader for two mods: relai-cache-keeper (the battery's colour, the card after a turn, its
// limit.ts writes the files) and relai-panel (the Koszty tab shows both thresholds). This file is
// the source; the mods hold byte copies made by core/tools/sync-panel-core.js. The relai plugin's
// hooks read the same files through core/process/threshold.js; a parity test holds the two together.
//
// No `$` and no imports: the files come through `io`, so tests pass a fake and Node loads it as is.

/** @typedef {'five' | 'week'} LimitWindow */
/** @typedef {'sesja' | 'projekt' | 'globalnie' | 'domyślny'} ThresholdSource */
/** @typedef {{ value: number, source: ThresholdSource }} Threshold */
/** @typedef {Readonly<Record<LimitWindow, Threshold>>} Thresholds */
/** @typedef {{ read: (path: string) => Promise<string | null> }} ThresholdReader */
/** @typedef {{ root: string, home: string, sessionId: string }} Where */

export const DEFAULT_THRESHOLD = 90;
export const DEFAULT_WEEK_THRESHOLD = 98;
/** @type {Readonly<Record<LimitWindow, number>>} */
export const DEFAULTS = Object.freeze({ five: DEFAULT_THRESHOLD, week: DEFAULT_WEEK_THRESHOLD });
/** @type {readonly LimitWindow[]} */
export const WINDOWS = Object.freeze(['five', 'week']);
export const SESSION_DIR = '.claude/relai/limit';

// The session id becomes a path: anything outside [A-Za-z0-9_-] means no session file
const SESSION_ID = /^[A-Za-z0-9_-]{1,128}$/;
/** The session file's key per window: {"prog": 90, "progTydzien": 98, …} */
export const SESSION_KEY = Object.freeze({ five: 'prog', week: 'progTydzien' });
// The whole "Czego dotyczy" cell, a closed list of names per window (L-0025): "Próg limitu dla API"
// is neither, and the week's row is never read as the 5-hour one
const ROW_NAMES = Object.freeze({
  five: /^(?:Próg limitu|Prog limitu|Limit threshold)$/i,
  week: /^(?:Próg limitu tygodnia|Prog limitu tygodnia|Weekly limit threshold)$/i,
});
/** The row's name when it is written */
export const ROW_LABEL = Object.freeze({ five: 'Próg limitu', week: 'Próg limitu tygodnia' });
// The value cell starts with a whole number; a percent sign and words after `·` are for people
const ROW_VALUE = /^(\d{1,3})\s*%?(?=\s|·|$)/;
// Rows under this heading are withdrawn and never decide
const WITHDRAWN = /^#+\s.*(?:wycofane|withdrawn)/i;

/**
 * @param {unknown} n
 * @returns {n is number}
 */
export const isThreshold = (n) => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 99;

/** @param {string} p */
const slash = (p) => p.replace(/\\/g, '/');

/**
 * @param {string} root
 * @param {string} sessionId
 * @returns {string | null}
 */
export function sessionPath(root, sessionId) {
  if (!SESSION_ID.test(String(sessionId || ''))) return null;
  return slash(`${root || '.'}/${SESSION_DIR}/${sessionId}.json`);
}

/** @param {string} root */
export const projectPath = (root) => slash(`${root || '.'}/docs/USTAWIENIA.md`);
/** @param {string} home */
export const globalPath = (home) => slash(`${home || '.'}/.claude/relai/USTAWIENIA.md`);

/**
 * The session file as an object, or null: not JSON, or no object
 * @param {string | null} text
 * @returns {Record<string, unknown> | null}
 */
export function sessionObject(text) {
  if (!text) return null;
  try {
    const j = JSON.parse(text);
    return j && typeof j === 'object' && !Array.isArray(j) ? j : null;
  } catch {
    return null;
  }
}

/**
 * A session file's threshold for the window, or null: not JSON, no key, or one outside 1–99
 * @param {string | null} text
 * @param {LimitWindow} [window]
 * @returns {number | null}
 */
export function sessionValue(text, window = 'five') {
  const v = sessionObject(text)?.[SESSION_KEY[window]];
  return isThreshold(v) ? v : null;
}

/**
 * The window's first row above the withdrawn section: its line and value (null when no number in 1–99)
 * @param {readonly string[]} lines
 * @param {LimitWindow} window
 * @returns {{ line: number, value: number | null } | null}
 */
export function findRow(lines, window) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    if (WITHDRAWN.test(line)) return null;
    if (!line.trim().startsWith('|')) continue;
    const cells = line.split('|').map((c) => c.trim());
    if (cells.length < 5) continue;
    if (!ROW_NAMES[window].test((cells[2] ?? '').replace(/\*\*/g, '').trim())) continue;
    const m = (cells[3] ?? '').replace(/\*\*/g, '').trim().match(ROW_VALUE);
    const n = m ? Number(m[1]) : NaN;
    return { line: i, value: isThreshold(n) ? n : null };
  }
  return null;
}

/**
 * A settings file's threshold for the window, or null: no row, or a value that is no number in 1–99
 * @param {string | null} text
 * @param {LimitWindow} [window]
 * @returns {number | null}
 */
export function rowValue(text, window = 'five') {
  return text ? findRow(text.split('\n'), window)?.value ?? null : null;
}

/**
 * Both thresholds and where each came from; each file is read once
 * @param {ThresholdReader} io
 * @param {Where} where
 * @returns {Promise<Thresholds>}
 */
export async function thresholdsOf(io, where) {
  const file = sessionPath(where.root, where.sessionId);
  const session = file ? await io.read(file) : null;
  const project = await io.read(projectPath(where.root));
  const global = await io.read(globalPath(where.home));
  /** @param {LimitWindow} w @returns {Threshold} */
  const one = (w) => {
    const fromSession = sessionValue(session, w);
    if (fromSession !== null) return { value: fromSession, source: 'sesja' };
    const fromProject = rowValue(project, w);
    if (fromProject !== null) return { value: fromProject, source: 'projekt' };
    const fromGlobal = rowValue(global, w);
    if (fromGlobal !== null) return { value: fromGlobal, source: 'globalnie' };
    return { value: DEFAULTS[w], source: 'domyślny' };
  };
  return { five: one('five'), week: one('week') };
}

/**
 * One window's threshold and where it came from
 * @param {ThresholdReader} io
 * @param {Where} where
 * @param {LimitWindow} [window]
 * @returns {Promise<Threshold>}
 */
export async function thresholdOf(io, where, window = 'five') {
  // An unknown window is the caller's mistake, never a silent 5-hour threshold (as threshold.js)
  if (!WINDOWS.includes(window)) throw new Error('próg limitu: nieznane okno ' + window);
  return (await thresholdsOf(io, where))[window];
}

/** The source in the words a person reads: "ta sesja", "ten projekt", "wszystkie projekty", "domyślny" */
export const SOURCE_WORDS = Object.freeze({ sesja: 'ta sesja', projekt: 'ten projekt', globalnie: 'wszystkie projekty', 'domyślny': 'domyślny' });
