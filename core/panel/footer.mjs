// RelAI core / panel: footer — the one status line under the prompt (thread PASKI_W_STOPCE).
//
// Why a line and not the bars: in a split window the desktop app draws AbovePrompt and Pane only in
// the first panel (P-040), while a plugin's $.ui.status line stands in every panel and in a pop-out
// window (probe 2026-10-13). The footer shows ONE plugin's line, the others hide behind "+1", so one
// plugin builds the whole line: relai-cache-keeper, which holds the cache and the limits; the plan
// words come from relai-panel through a file a session (footerPath), written when its work moves.
//
// No `$` and no imports: the mods hold byte copies made by core/tools/sync-panel-core.js.

export const FOOTER_DIR = '.claude/relai/stopka';

/** @param {string} sessionId */
export function footerPath(sessionId) {
  return `${FOOTER_DIR}/${sessionId.replace(/[^\w.-]/g, '_')}.txt`;
}

/**
 * The plan words of a session: its work's label and, as the plan bar counts it, "closed/all unit";
 * a work with nothing to count (a card without packets) shows no "0/0". The question while its
 * work is not chosen.
 * @param {{ label: string, isAsking: boolean, unit: string, plan: { kind: string, closed?: number, stages?: number } } | null} work
 * @returns {string | null}
 */
export function footerPlan(work) {
  if (!work) return null;
  if (work.isAsking) return 'praca nie wybrana';
  const label = work.label.trim();
  if (!label) return null;
  const p = work.plan;
  return p.kind === 'ok' && p.stages ? `${label} ${p.closed ?? 0}/${p.stages} ${work.unit}` : label;
}

/**
 * The plan words read back from the file: its first line, trimmed; empty or missing is none.
 * @param {string | null} text
 * @returns {string | null}
 */
export function readFooterPlan(text) {
  if (!text) return null;
  return text.split(/\r?\n/)[0].trim() || null;
}

/**
 * The line: plan · cache · 5 h · week · context, each part only when known (a missing figure is
 * left out, never shown as zero). Nothing known: undefined, which removes the line.
 * @param {{ plan: string | null, cache: string | null, five: string | null, week: string | null, ctx: string | null }} p
 * @returns {string | undefined}
 */
export function footerLine(p) {
  const known = (/** @type {string | null} */ s) => (s && s.trim() ? s.trim() : null);
  const parts = [
    known(p.plan),
    known(p.cache) && `cache ${known(p.cache)}`,
    known(p.five) && `5 h ${known(p.five)}`,
    known(p.week) && `tydz. ${known(p.week)}`,
    known(p.ctx) && `kontekst ${known(p.ctx)}`,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : undefined;
}
