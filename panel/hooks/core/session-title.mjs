// RelAI core: the title of a session (plan ZGLOSZENIA, E4, issue #1). One rule for two writers:
// the plugin's UserPromptSubmit hook (core/process/session-title.js, through import()) and the
// start_session of a stage card in relai-panel (panel/hooks/launch.ts, through the synced copy).
//
// Shape: "E4 · ZGLOSZENIA — stage name" or "Odnoga NAME", at most 60 characters. A longer one is cut
// at a word boundary and ends with "…"; the plan and stage id stays whole, whatever its length.

export const TITLE_MAX = 60;
const ELLIPSIS = '…';

/** @param {string} s */
const width = (s) => [...s].length;

// The longest run of whole words of `text` that fits `room` characters, or '' when none does
/** @param {string} text @param {number} room */
function wordsWithin(text, room) {
  if (room <= 0) return '';
  const cut = [...text].slice(0, room + 1).join('');
  const space = cut.lastIndexOf(' ');
  return space > 0 ? cut.slice(0, space).trimEnd() : '';
}

// "head — tail" when it fits, else the head with as many whole words of the tail as fit before "…"
/** @param {string} head @param {string} sep @param {string} tail */
function fit(head, sep, tail) {
  if (!tail) return head;
  const full = head + sep + tail;
  if (width(full) <= TITLE_MAX) return full;
  const kept = wordsWithin(tail, TITLE_MAX - width(head + sep) - width(ELLIPSIS));
  return kept ? head + sep + kept + ELLIPSIS : head;
}

/**
 * The title of the work a session runs, or null when there is nothing to name.
 * @param {{ kind: 'plan', plan: string, stage: string, name?: string }
 *   | { kind: 'branch', card: string }
 *   | { kind: 'text', text: string }
 *   | { kind: string } | null | undefined} target
 * @returns {string | null}
 */
export function titleOf(target) {
  if (!target) return null;
  if (target.kind === 'plan' && 'plan' in target) {
    const plan = String(target.plan ?? '').trim();
    const stage = String(target.stage ?? '').trim();
    if (!plan || !/^E\d+$/.test(stage)) return null;
    return fit(`${stage} · ${plan}`, ' — ', String(target.name ?? '').trim());
  }
  if (target.kind === 'branch' && 'card' in target) {
    const card = String(target.card ?? '').trim();
    return card ? `Odnoga ${card}` : null;
  }
  if (target.kind === 'text' && 'text' in target) {
    const text = String(target.text ?? '').replace(/\s+/g, ' ').trim();
    if (!text) return null;
    if (width(text) <= TITLE_MAX) return text;
    const kept = wordsWithin(text, TITLE_MAX - width(ELLIPSIS));
    return kept ? kept + ELLIPSIS : null;
  }
  return null;
}
