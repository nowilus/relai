// RelAI core / panel: agentcard — what the RelAI Agents card draws (odnoga AGENTS_KRABY).
//
// Rebuilt on 2026-10-23 after the live review of the Pixel Art card ("nieczytelne", no padding,
// the "Szczegóły" button too big): the card's words are the mod's own Text — they wrap to any
// width of the pane and grow with the app's zoom — and only two things are drawn: the agent's name
// in Hanken Grotesk, larger than the rest (the font Łukasz picked, variant D), and the frame under
// the card with a shadow in the agent's colour. Text in a drawing cannot wrap to a width the mod
// does not know, which is what broke every drawn layout before. Pure functions; same ESM rule as
// the rest of core/panel.

import { HANKEN } from './hanken.mjs';
import { KEY_SAMPLE, ROOT, SHEET } from './theme.mjs';

/**
 * The context window of a model, from its name: the engine gives a subagent's tokens but not its
 * window (only the main session's). `[1m]` in the name is the long window, else 200K. Łukasz chose
 * this on 2026-10-23 over a bare figure.
 * @param {string} model @returns {number}
 */
export function windowOf(model) {
  return /\[1m\]|-1m\b/i.test(String(model)) ? 1_000_000 : 200_000;
}

/** A model id in words: `claude-haiku-5-5` → `Haiku 5.5`; anything else as it came. */
export function modelName(model) {
  const m = /(opus|sonnet|haiku|fable)-(\d+)-(\d+)/i.exec(String(model));
  if (!m) return String(model || 'model nieznany');
  return `${m[1][0].toUpperCase()}${m[1].slice(1).toLowerCase()} ${m[2]}.${m[3]}${windowOf(model) > 200_000 ? ' · 1M' : ''}`;
}

/** Tokens as "183K" / "1.2M". */
export function kTokens(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return String(Math.max(0, Math.round(n)));
}

/** The context an agent holds, said in full (live 2026-10-23: a bare "61% kontekstu" read as noise). */
export function contextWords(used, model) {
  const win = windowOf(model);
  return `Kontekst: ${kTokens(used)} z ${kTokens(win)} tokenów okna modelu`;
}

/** The name's size and how far the drawing reaches above the cap height (accents) and below. */
export const NAME_FONT = Object.freeze({ size: 16, top: 900, bottom: 250 });

const advanceOf = (ch) => (HANKEN[ch] ?? HANKEN['…'])[1];

/** A name's width in CSS px at `size`. */
export function nameWidth(text, size = NAME_FONT.size) {
  return Math.ceil([...String(text)].reduce((w, ch) => w + advanceOf(ch), 0) * size / 1000);
}

/**
 * The agent's name in Hanken Grotesk as an outline drawing: no font inside, each letter defined
 * once (<defs>) and placed with <use>; the colour of the app's text in each look. A name wider than
 * `maxPx` ends with an ellipsis.
 * @param {string} name @param {number} maxPx @returns {{ svg: string, width: number, height: number }}
 */
export function nameSvg(name, maxPx) {
  const { size, top, bottom } = NAME_FONT;
  let chars = [...String(name)].map((ch) => (HANKEN[ch] ? ch : '…'));
  if (nameWidth(chars.join(''), size) > maxPx) {
    while (chars.length > 1 && nameWidth(`${chars.join('')}…`, size) > maxPx) chars = chars.slice(0, -1);
    chars = [...chars.join('').trimEnd(), '…'];
  }
  const used = new Map();
  const uses = [];
  let x = 0;
  for (const ch of chars) {
    if (ch !== ' ') {
      const id = `hk${ch.codePointAt(0).toString(16)}`;
      used.set(id, HANKEN[ch][0]);
      uses.push(`<use href="#${id}" x="${x}"/>`);
    }
    x += advanceOf(ch);
  }
  const w = Math.max(1, x);
  const h = top + bottom;
  const width = Math.ceil(w * size / 1000);
  const height = Math.ceil(h * size / 1000);
  const defs = [...used].map(([id, d]) => `<path id="${id}" d="${d}"/>`).join('');
  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${-top} ${w} ${h}" width="${width}" height="${height}">`
      + `<style>.n{fill:${KEY_SAMPLE.dark.text}}@media (prefers-color-scheme: light){.n{fill:${KEY_SAMPLE.light.text}}}</style>`
      + `<defs>${defs}</defs><g class="n" transform="scale(1 -1)">${uses.join('')}</g></svg>`,
    width,
    height,
  };
}


// ── The frame under a card: its fill, a fine line, a shadow in the agent's colour ──

/** Geometry of the frame, CSS pixels. */
export const CARD_FRAME = Object.freeze({ line: 1, shadow: 3, piece: 4000, middles: 1, end: 400 });
const OVER = 40; // how far a piece runs past the edge it does not show

const frameCss = (hue, card, shadow) => {
  const { line } = CARD_FRAME;
  return '<style>'
    + `.f{fill:${SHEET.dark.sheet};stroke:${KEY_SAMPLE.dark.subtle};stroke-width:${line}px}`
    + `@media (prefers-color-scheme: light){.f{fill:${ROOT.kartka};stroke:${KEY_SAMPLE.light.subtle}}}`
    + `.h{fill:${hue}}.f{${card}}.h{${shadow}}</style>`;
};
const frameSvg = (css) => `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" shape-rendering="crispEdges">${css}<rect class="h"/><rect class="f"/></svg>`;

/** The top of a card's frame: top edge, sides, the shadow's right side; its bottom never shows. */
export function cardFrameTopSvg(hue) {
  const { line: l, shadow: s } = CARD_FRAME;
  return frameSvg(frameCss(hue,
    `x:${l / 2}px;y:${l / 2}px;width:calc(100% - ${s + l}px);height:calc(100% + ${OVER}px)`,
    `x:${s}px;y:${s}px;width:calc(100% - ${s}px);height:calc(100% + ${OVER}px)`));
}

/** A middle piece: the sides only. */
export function cardFrameMiddleSvg(hue) {
  const { line: l, shadow: s } = CARD_FRAME;
  return frameSvg(frameCss(hue,
    `x:${l / 2}px;y:-${OVER}px;width:calc(100% - ${s + l}px);height:calc(100% + ${OVER * 2}px)`,
    `x:${s}px;y:-${OVER}px;width:calc(100% - ${s}px);height:calc(100% + ${OVER * 2}px)`));
}

/** The end: bottom edge and the shadow under it; its top never shows. */
export function cardFrameEndSvg(hue) {
  const { line: l, shadow: s } = CARD_FRAME;
  return frameSvg(frameCss(hue,
    `x:${l / 2}px;y:-${OVER}px;width:calc(100% - ${s + l}px);height:calc(100% + ${OVER - s - l / 2}px)`,
    `x:${s}px;y:-${OVER}px;width:calc(100% - ${s}px);height:calc(100% + ${OVER}px)`));
}
