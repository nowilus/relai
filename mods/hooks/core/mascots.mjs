// RelAI core / panel: mascots — the character of each subagent in the RelAI Agents pane, and the
// bar under its card (odnoga AGENTS_KRABY, 2026-10-23).
//
// Inspired by Helper Desk by Ben AI (benai-mods, no license): one animated pixel character per
// subagent and a lively bar on its card. Nothing is copied — Helper Desk carries no license, so the
// characters, frames, palette and bar are drawn here from scratch (review in docs/DZIENNIK.md,
// 2026-10-23). Łukasz chose (2026-10-23): no crab; every role a different animal picked by how
// people see it, dressed for the role, with one piece in the agent's own colour (X/x) so two agents
// of one role tell apart, and a name from the role's pool.
//
// A character stands, crouches, stands and blinks; all frames sit in one drawing and CSS steps
// through them, so a running agent moves with no clock in the plugin and no redraw of the pane. A
// finished one is a still frame. Both looks of the app live in the drawing: a mod cannot read the
// app's look (P-042), so the outline is light under the dark look and dark under the light one, by
// `prefers-color-scheme` (twoTone() leaves such a drawing as it is). Pure functions; same ESM rule
// and same copy as plan-state.mjs.

import { ROOT, mix } from './theme.mjs';

/** The grid of every character, the cell size, one cell of outline round it and a row to crouch. */
export const MASCOT = Object.freeze({
  cols: 20,
  rows: 16,
  scale: 3, // CSS pixels a cell
  width: (20 + 2) * 3,
  height: (16 + 3) * 3,
  frames: 4,
  cycleMs: 2400,
  terminalWidth: 4,
});

/** Eight agent colours told apart at a glance in both looks; `name` is what the `alt` says. */
export const AGENT_HUES = Object.freeze([
  Object.freeze({ name: 'gliniany', color: ROOT.glina }),
  Object.freeze({ name: 'musztardowy', color: ROOT.musztarda }),
  Object.freeze({ name: 'szałwiowy', color: ROOT.szalwia }),
  Object.freeze({ name: 'morski', color: '#2f8f83' }),
  Object.freeze({ name: 'niebieski', color: '#4b78b8' }),
  Object.freeze({ name: 'śliwkowy', color: '#8a5aa8' }),
  Object.freeze({ name: 'różany', color: '#c4577e' }),
  Object.freeze({ name: 'oliwkowy', color: '#7d8f2e' }),
]);

const EYE = ROOT.kartka;
const PUPIL = '#241f19';
/** The outline: a soft rim on the dark sheet, a firm line on paper (both ≥ 3:1, mascots.test.js). */
export const OUTLINE = Object.freeze({ dark: '#8f887d', light: '#2a241d' });

/**
 * @typedef {'reviewer' | 'auditor' | 'developer' | 'manager' | 'architect' | 'analyst' | 'tester' | 'writer' | 'worker'} RoleKey
 * @typedef {{ role: string, animal: string, outfit: string, names: readonly string[], lid: string,
 *   paint: Readonly<Record<string, string>>, grid: readonly string[] }} Role
 */

/**
 * The nine roles. Shared marks: `w` eye white, `p` pupil, `X` the agent's colour, `x` its shade,
 * `f` feet (they stay put when the character crouches); the rest from the role's own paint.
 * @type {Readonly<Record<RoleKey, Role>>}
 */
export const ROLES = Object.freeze({
  reviewer: {
    role: 'Code Reviewer', animal: 'sowa', outfit: 'okrągłe okulary, muszka',
    names: ['Sowa Zofia', 'Sowa Sabina', 'Sowa Stefania', 'Sowa Serafin', 'Sowa Sylwester'],
    lid: '#8a6a4f',
    paint: { b: '#8a6a4f', d: '#5e4634', l: '#ecdcc0', m: '#c9ad85', k: '#e0a030', f: '#e0a030', G: '#241f19' },
    grid: [
      '....................',
      '..dd............dd..',
      '..bdd..........ddb..',
      '..bbbbbbbbbbbbbbbb..',
      '.bbGGGGGGbbGGGGGGbb.',
      '.bbGwwwwGGGGwwwwGbb.',
      '.bbGwppwGbbGwppwGbb.',
      '.bbGwppwGbbGwppwGbb.',
      '.bbGGGGGGkkGGGGGGbb.',
      '.bbblllllkklllllbbb.',
      '.dbllllllllllllllbd.',
      '.dbllllXXxxXXllllbd.',
      '.dbllmllmllmllmllbd.',
      '..dbllllllllllllbd..',
      '...ddbbbbbbbbbbdd...',
      '.....ff......ff.....',
    ],
  },
  auditor: {
    role: 'Audytor bezpieczeństwa', animal: 'pies stróż', outfit: 'czapka ochrony z odznaką, obroża',
    names: ['Pies Piotr', 'Pies Pola', 'Pies Patryk', 'Pies Pamela', 'Pies Prot'],
    lid: '#c89a6a',
    paint: { b: '#c89a6a', e: '#7a5232', l: '#f1dcc0', n: '#241f19', N: '#27365a', o: '#1b2640', A: '#e2b73d', f: '#7a5232' },
    grid: [
      '......NNNNNNNN......',
      '.....NNNNAANNNN.....',
      '.....NNNAAAANNN.....',
      '...oooooooooooooo...',
      '.ee.bbbbbbbbbbbb.ee.',
      '.eeebbwwbbbbwwbbeee.',
      '.eeebbwpbbbbpwbbeee.',
      '.eee.bbbllllbbb.eee.',
      '.ee..bbllnnllbb..ee.',
      '.....bbllllllbb.....',
      '......bbbbbbbb......',
      '.....bXXXXXXXXb.....',
      '....bbbbbAAbbbbb....',
      '....bbbbbbbbbbbb....',
      '....bbbbbbbbbbbb....',
      '.....ff......ff.....',
    ],
  },
  developer: {
    role: 'Developer', animal: 'bóbr', outfit: 'czapka z daszkiem, laptop',
    names: ['Bóbr Bartek', 'Bóbr Bogna', 'Bóbr Borys', 'Bóbr Beata', 'Bóbr Bruno'],
    lid: '#8b5e3c',
    paint: { b: '#8b5e3c', d: '#5a3a24', l: '#d9b48f', n: '#241f19', t: '#fffdf7', L: '#a7b0ba', o: '#eef3f7', M: '#6c747d', f: '#5a3a24' },
    grid: [
      '....................',
      '.......XXXXXX.......',
      '......XXXXXXXX......',
      '.....XXXXXXXXXX.....',
      '...bxxxxxxxxxxxxb...',
      '..bbbbbbbbbbbbbbbb..',
      '..bbbwwbbbbbbwwbbb..',
      '..bbbwpbbbbbbpwbbb..',
      '..bbbbbbllllbbbbbb..',
      '..dbbbblnnnnlbbbbd..',
      '...dbbbllttllbbbd...',
      '....dbbbbbbbbbbd....',
      '...LLLLLLLLLLLLLL...',
      '...LLLLLLooLLLLLL...',
      '...LLLLLLLLLLLLLL...',
      '..ffMMMMMMMMMMMMff..',
    ],
  },
  manager: {
    role: 'Manager', animal: 'pingwin', outfit: 'frak, kołnierzyk, krawat',
    names: ['Pingwin Paweł', 'Pingwin Patrycja', 'Pingwin Prosper', 'Pingwin Pia', 'Pingwin Placyd'],
    lid: '#34303c',
    paint: { b: '#34303c', h: '#5d5868', l: '#f4f1ea', S: '#ffffff', k: '#e8952e', f: '#e8952e' },
    grid: [
      '....................',
      '......bbbhhbbb......',
      '.....bbbhhbbbbb.....',
      '....bbbbbbbbbbbb....',
      '....bbwwbbbbwwbb....',
      '....bbwpbbbbpwbb....',
      '...bbbbbkkkkbbbbb...',
      '...bbbbbbkkbbbbbb...',
      '..bbbSSllXXllSSbbb..',
      '..bbbllllXXllllbbb..',
      '.bbbbllllXXllllbbbb.',
      '.bbbbllllXXllllbbbb.',
      '.bbbbllllxxllllbbbb.',
      '..bbbllllllllllbbb..',
      '...bbbllllllllbbb...',
      '.....ff......ff.....',
    ],
  },
  architect: {
    role: 'Architekt', animal: 'słoń', outfit: 'kask budowlany, rulon planów',
    names: ['Słoń Stanisław', 'Słoń Sylwia', 'Słoń Szczepan', 'Słoń Sonia', 'Słoń Saturnin'],
    lid: '#9aa0a8',
    paint: { g: '#9aa0a8', d: '#6e747c', e: '#8a9098', E: '#d9a0a6', Y: '#f2c230', y: '#c99a16', o: '#e3edf6', f: '#6e747c' },
    grid: [
      '.......YYYYYY.......',
      '......YYYYyYYY......',
      '.....YYYYYYYYYY.....',
      '...yyyyyyyyyyyyyy...',
      '.eeeggggggggggggeee.',
      'eEEeggwwggggwwggeEEe',
      'eEEeggwpggggpwggeEEe',
      'eEEeggggggggggggeEEe',
      '.eEeggggggggggggeEe.',
      '..eeggggdddgggggee..',
      '....gggggddggggg....',
      '....gggggddggggg....',
      '..oXXXXXXXXXXXXXXo..',
      '..oxxxxxxxxxxxxxxo..',
      '...gggggggggggggg...',
      '....ffff....ffff....',
    ],
  },
  analyst: {
    role: 'Analityk', animal: 'lis', outfit: 'kapelusz odkrywcy',
    names: ['Lis Leon', 'Lis Lena', 'Lis Lucjan', 'Lis Laura', 'Lis Lambert'],
    lid: '#d0703a',
    paint: { b: '#d0703a', d: '#9c4e24', l: '#fbefe0', n: '#241f19', K: '#c7b48a', f: '#3a2a20' },
    grid: [
      '....................',
      '.b....KKKKKKKK....b.',
      '.bb...KXXXXXXK...bb.',
      '.bbKKKKKKKKKKKKKKbb.',
      '..bbbbbbbbbbbbbbbb..',
      '.bbbbbbbbbbbbbbbbbb.',
      '.bbbwwbbbbbbbbwwbbb.',
      '.bbbwpbbbbbbbbpwbbb.',
      '.lbbbbbbbbbbbbbbbbl.',
      '.llllllbbnnbbllllll.',
      '..llllllllllllllll..',
      '....llllllllllll....',
      '...bbbllllllllbbbdd.',
      '...bbbllllllllbbbddl',
      '...bbbbbbbbbbbbbbdl.',
      '....ff......ff......',
    ],
  },
  tester: {
    role: 'Tester', animal: 'szop', outfit: 'gogle ochronne, maska szopa',
    names: ['Szop Szymek', 'Szop Sara', 'Szop Seweryn', 'Szop Stella', 'Szop Sambor'],
    lid: '#3b3836',
    paint: { b: '#8d8a86', m: '#3b3836', l: '#e9e4dc', n: '#241f19', Q: '#9fd3e6', q: '#e9f7fc', t: '#3b3836', T: '#c9c4bc', f: '#3b3836' },
    grid: [
      '...bb..........bb...',
      '..bmbb........bbmb..',
      '..bbbbbbbbbbbbbbbb..',
      '.XXQQQQXXXXXXQQQQXX.',
      '.bbQqqQbbbbbbQqqQbb.',
      '.bmmmmmmbbbbmmmmmmb.',
      '.bmmwwmmmllmmmwwmmb.',
      '.bmmwpmllllllmpwmmb.',
      '.bbmmmllllllllmmmbb.',
      '..bblllllnnlllllbb..',
      '...bbllllllllllbb...',
      '....bbbbbbbbbbbb....',
      '...bbbllllllllbbbtT.',
      '...bbbllllllllbbbTt.',
      '...bbbbbbbbbbbbbtT..',
      '....ff......ff......',
    ],
  },
  writer: {
    role: 'Redaktor dokumentacji', animal: 'kot', outfit: 'beret, szalik',
    names: ['Kot Konrad', 'Kot Klara', 'Kot Kajetan', 'Kot Kalina', 'Kot Kornel'],
    lid: '#8c8580',
    paint: { b: '#8c8580', s: '#6c6560', n: '#d98f9a', k: '#e9e4dc', R: '#7a2e3a', r: '#4f1d26', f: '#6c6560' },
    grid: [
      '...........r........',
      '........RRRRRRR.....',
      '..b...RRRRRRRRRR....',
      '..bb..RRRRRRRRRRR...',
      '..bbbbbbbbbbbbbbb...',
      '..bbbsbbbbbbbbsbbb..',
      '..bbbwwbbbbbbwwbbb..',
      '..bbbwpbbbbbbpwbbb..',
      '..bbbbbbbnnbbbbbbb..',
      '.kbbbbbbsbbsbbbbbbk.',
      '..bbbbbbbbbbbbbbbb..',
      '...XXXXXXXXXXXXXX...',
      '...xXXXXXXXXXXXXxXX.',
      '....bbsbbbbbbsbb.XX.',
      '....bbbbbbbbbbbb.xX.',
      '.....ff......ff.....',
    ],
  },
  worker: {
    role: 'Worker', animal: 'chomik', outfit: 'apaszka',
    names: ['Chomik Czesio', 'Chomik Celina', 'Chomik Cyryl', 'Chomik Cecylia', 'Chomik Cezary'],
    lid: '#d9a25e',
    paint: { b: '#d9a25e', d: '#a8743a', l: '#f6e6cc', n: '#c4577e', c: '#efa3a3', o: '#fffdf7', f: '#a8743a' },
    grid: [
      '....................',
      '....bb........bb....',
      '...bXXXXXXXXXXXXb...',
      '..bXXXoXXXXXXoXXXb..',
      '..bxxxxxxxxxxxxxxbXX',
      '.bbbbwwbbbbbbwwbbbbX',
      '.bbbbwpbbbbbbpwbbbb.',
      '.bcclllllnnlllllccb.',
      '.bllllllllllllllllb.',
      '.bllllllllllllllllb.',
      '..llllllllllllllll..',
      '...bbllllllllllbb...',
      '....bbbbbbbbbbbb....',
      '....................',
      '....................',
      '.....ff......ff.....',
    ],
  },
});

/** @type {readonly RoleKey[]} */
export const ROLE_KEYS = Object.freeze(/** @type {RoleKey[]} */ (Object.keys(ROLES)));

/**
 * What the agent does, from its subagent type first and the words of its task second; the first
 * rule that matches wins, so the narrow roles stand before the broad ones. Nothing matches: worker.
 * @type {readonly [RoleKey, RegExp][]}
 */
const RULES = Object.freeze([
  ['auditor', /secur|audit|audyt|bezpiecz|vulnerab|podatno|trivy|owasp|pentest/i],
  ['reviewer', /review|recenz|przegl[aą]d kodu|code-?check|lint/i],
  ['tester', /\btest|tdd|e2e|\bqa\b|pr-test|coverage|pokryci/i],
  ['architect', /architect|architekt|\bplan|design|projektuj|blueprint|system-design/i],
  ['analyst', /explore|research|investigat|analy|analiz|zbadaj|szukaj|znajd[zź]|search|lookup|locat|find|discover|introspect/i],
  ['writer', /\bdoc|readme|dokument|changelog|codemap|redag|humaniz|article|opis/i],
  ['manager', /orchestr|coordinat|koordyn|manager|crew|workflow|loop-operator|chief/i],
  ['developer', /coder|\bbuild|resolver|\bfix|implement|refactor|simplif|napraw|zaimplement|dopisz|kod|code|migrat|cleaner/i],
]);

/**
 * The role of a subagent.
 * @param {{ type?: string, description?: string }} a @returns {RoleKey}
 */
export function roleOf(a) {
  for (const text of [a.type ?? '', a.description ?? '']) {
    if (!text || /^(general-purpose|claude|fork|subagent)$/i.test(text)) continue;
    for (const [role, re] of RULES) if (re.test(text)) return role;
  }
  return 'worker';
}

/**
 * A name from the role's pool that no agent of this session wears yet; the pool spent, the first
 * name with the next free number.
 * @param {RoleKey} role @param {readonly string[]} taken @returns {string}
 */
export function nameFor(role, taken) {
  const pool = ROLES[role]?.names ?? ROLES.worker.names;
  const used = new Set(taken);
  const free = pool.find((n) => !used.has(n));
  if (free) return free;
  for (let i = 2; ; i += 1) {
    const n = `${pool[0]} ${i}`;
    if (!used.has(n)) return n;
  }
}

/** @param {number} hue */
const hueIndex = (hue) => ((Math.trunc(hue) % AGENT_HUES.length) + AGENT_HUES.length) % AGENT_HUES.length;

/**
 * The next agent colour: the first from `next` on that no running agent wears; all taken — `next`.
 * @param {readonly number[]} running @param {number} next @returns {number}
 */
export function pickHue(running, next) {
  const used = new Set(running.map(hueIndex));
  for (let i = 0; i < AGENT_HUES.length; i += 1) {
    const h = hueIndex(next + i);
    if (!used.has(h)) return h;
  }
  return hueIndex(next);
}

/** The frame a character shows in turn: stands, crouches, stands, blinks. */
const ORDER = Object.freeze([0, 1, 0, 2]);
/** The still frame of an agent no longer working: standing when done, eyes shut otherwise. */
export const STILL_FRAME = Object.freeze({ done: 0, stopped: 2, failed: 2 });

/**
 * The cells of one frame (0 stands, 1 crouches a cell with the feet put, 2 blinks), moved by the
 * outline's cell: a Map "x,y" → colour.
 * @param {RoleKey} key @param {number} hue @param {number} frame @returns {Map<string, string>}
 */
export function mascotCells(key, hue, frame) {
  const r = ROLES[key] ?? ROLES.worker;
  const color = AGENT_HUES[hueIndex(hue)].color;
  /** @type {Record<string, string>} */
  const paint = { ...r.paint, w: EYE, p: PUPIL, X: color, x: mix(color, '#000000', 0.3) };
  const bob = frame === 1 ? 1 : 0;
  const isEye = (/** @type {number} */ x, /** @type {number} */ y) => 'wp'.includes(r.grid[y]?.[x] ?? '.');
  /** @type {Map<string, string>} */
  const cells = new Map();
  // The feet last: in a crouch the body's lowest row sinks onto them and they stay on top
  for (const isFoot of [false, true]) {
    r.grid.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch === '.' || (ch === 'f') !== isFoot) return;
      let c = paint[ch] ?? PUPIL;
      // A blink: the eye's upper rows take the lid, its last row is a line
      if (frame === 2 && (ch === 'w' || ch === 'p')) c = isEye(x, y + 1) ? r.lid : PUPIL;
      cells.set(`${x + 1},${y + 1 + (isFoot ? 0 : bob)}`, c);
    }));
  }
  return cells;
}

/**
 * Cells as one path of horizontal runs, so a drawing of four frames stays a few kilobytes
 * (DESIGN.md, section 9).
 * @param {readonly (readonly [number, number])[]} cells @returns {string}
 */
export function runsPath(cells) {
  /** @type {Map<number, number[]>} */
  const rows = new Map();
  for (const [x, y] of cells) rows.set(y, [...(rows.get(y) ?? []), x]);
  let d = '';
  for (const y of [...rows.keys()].sort((p, q) => p - q)) {
    const xs = [...new Set(rows.get(y))].sort((p, q) => p - q);
    let start = xs[0] ?? 0;
    let end = start;
    const close = () => { d += `M${start} ${y}h${end - start + 1}v1h-${end - start + 1}z`; };
    for (const x of xs.slice(1)) {
      if (x === end + 1) end = x;
      else { close(); start = x; end = x; }
    }
    if (xs.length) close();
  }
  return d;
}

/** @param {Map<string, string>} cells @returns {string} */
function frameBody(cells) {
  /** @type {Map<string, [number, number][]>} */
  const byColor = new Map();
  /** @type {Map<string, [number, number]>} */
  const rim = new Map();
  for (const [k, c] of cells) {
    const [x, y] = /** @type {[number, number]} */ (k.split(',').map(Number));
    byColor.set(c, [...(byColor.get(c) ?? []), [x, y]]);
    for (const [ax, ay] of /** @type {[number, number][]} */ ([[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]])) {
      if (!cells.has(`${ax},${ay}`)) rim.set(`${ax},${ay}`, [ax, ay]);
    }
  }
  return `<path class="mascot-o" d="${runsPath([...rim.values()])}"/>`
    + [...byColor].map(([c, list]) => `<path fill="${c}" d="${runsPath(list)}"/>`).join('');
}

/**
 * The character as an SVG. `isWalking`: the four frames stepped by CSS from `phase` (0–1 of a round,
 * so two agents do not move in step); otherwise the single `still` frame.
 * @param {RoleKey} key @param {number} hue
 * @param {{ isWalking: boolean, phase?: number, still?: number }} o @returns {string}
 */
export function mascotSvg(key, hue, o) {
  const css = `.mascot-o{fill:${OUTLINE.dark}}@media (prefers-color-scheme: light){.mascot-o{fill:${OUTLINE.light}}}`;
  const head = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MASCOT.cols + 2} ${MASCOT.rows + 3}" width="${MASCOT.width}" height="${MASCOT.height}" shape-rendering="crispEdges">`;
  if (!o.isWalking) return `${head}<style>${css}</style>${frameBody(mascotCells(key, hue, o.still ?? 0))}</svg>`;
  const cycle = MASCOT.cycleMs / 1000;
  const slot = cycle / MASCOT.frames;
  const shift = (o.phase ?? 0) * cycle;
  const walk = `.mascot-f{opacity:0;animation:mascot-step ${cycle}s infinite}`
    + `@keyframes mascot-step{0%{opacity:1}${100 / MASCOT.frames}%,100%{opacity:0}}`
    + '@media (prefers-reduced-motion: reduce){.mascot-f{animation:none}.mascot-f0{opacity:1}}';
  const frames = ORDER.map((f, i) => {
    // A negative delay starts each slot mid-round, so slot i shows in the i-th quarter
    const delay = -(((MASCOT.frames - i) * slot + shift) % cycle);
    return `<g class="mascot-f mascot-f${i}" style="animation-delay:${delay.toFixed(2)}s;animation-timing-function:steps(1,end)">${frameBody(mascotCells(key, hue, f))}</g>`;
  }).join('');
  return `${head}<style>${css}${walk}</style>${frames}</svg>`;
}

/** The terminal's character: two lines of block glyphs, in the agent's colour by the caller. */
// One per kind of frame: stands, crouches, blinks
const GLYPHS = Object.freeze([['▗▆▆▖', '▝▀▀▘'], ['▗▄▄▖', '▐▆▆▌'], ['▗▬▬▖', '▝▀▀▘']]);

/** The glyph of slot `slot` of the round (0–3), as the drawing steps through them. @param {number} slot */
export function mascotGlyph(slot) {
  const kind = ORDER[((Math.trunc(slot) % ORDER.length) + ORDER.length) % ORDER.length] ?? 0;
  return /** @type {readonly [string, string]} */ (GLYPHS[kind] ?? GLYPHS[0]);
}

/** The bar under a card. */
export const CARD_BAR = Object.freeze({ height: 10, wave: 0.38, cycleMs: 2000 });

/** Small fixed bubbles, the same for a key on every redraw: x 0–1, y 0–1, radius in px. */
function bubbles(/** @type {number} */ count, /** @type {number} */ seed) {
  let s = (seed * 2654435761) >>> 0 || 1;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  return Array.from({ length: count }, () => ({ x: rnd(), y: rnd(), r: 0.8 + rnd() * 0.8 }));
}

/**
 * The bar under a card as an SVG `width` px wide. Running: a wave of the agent's colour with
 * bubbles runs along a soft track (the end of the work is not known, so no fill grows). Done: the
 * track full, still. Stopped: full and muted. Failed: full in clay. Only a running bar moves.
 * @param {'running' | 'done' | 'stopped' | 'failed'} status @param {number} hue
 * @param {number} width @param {string} key unique on the pane (the agent's id): ids and bubbles
 * @returns {string}
 */
export function cardBarSvg(status, hue, width, key, isFluid = false) {
  const W = Math.max(40, Math.round(width));
  const H = CARD_BAR.height;
  const id = `agent-bar-${String(key).replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const seed = [...String(key)].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const color = status === 'failed' ? ROOT.glina : AGENT_HUES[hueIndex(hue)].color;
  const lit = mix(color, '#ffffff', 0.45);
  // Fluid: as wide as the slot it stands in, `width` only sets the drawing's own scale (live
  // 2026-10-23: a bar of a guessed width stood centred under a wider card)
  const head = isFluid
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  const clip = `<clipPath id="${id}-c"><rect width="${W}" height="${H}" rx="${H / 2}"/></clipPath>`;
  const track = `<rect width="${W}" height="${H}" fill="${color}" opacity=".18"/>`;
  const dot = (/** @type {{ x: number, y: number, r: number }} */ b, /** @type {number} */ w) =>
    `<circle cx="${(b.x * w).toFixed(1)}" cy="${(2 + b.y * (H - 4)).toFixed(1)}" r="${b.r.toFixed(1)}"/>`;
  if (status !== 'running') {
    const isMuted = status === 'stopped';
    const fill = `<linearGradient id="${id}-g" x1="0" x2="1"><stop offset="0" stop-color="${color}" stop-opacity="${isMuted ? 0.25 : 0.55}"/><stop offset="1" stop-color="${color}" stop-opacity="${isMuted ? 0.45 : 1}"/></linearGradient>`;
    const dots = isMuted ? '' : `<g fill="#ffffff" opacity=".45">${bubbles(Math.round(W / 22), seed).map((b) => dot(b, W)).join('')}</g>`;
    return `${head}<defs>${clip}${fill}</defs><g clip-path="url(#${id}-c)">${track}<rect width="${W}" height="${H}" fill="url(#${id}-g)"/>${dots}</g></svg>`;
  }
  const piece = Math.max(30, Math.round(W * CARD_BAR.wave));
  const cycle = CARD_BAR.cycleMs / 1000;
  // The golden step spreads neighbouring keys across the round, not side by side
  const delay = -(((seed * 0.6180339887) % 1) * cycle);
  const css = `<style>.${id}-w{animation:${id}-run ${cycle}s cubic-bezier(.45,.05,.55,.95) infinite;animation-delay:${delay.toFixed(2)}s}`
    + `@keyframes ${id}-run{from{transform:translateX(-${piece}px)}to{transform:translateX(${W}px)}}`
    + `.${id}-b{animation:${id}-bob 1.1s ease-in-out infinite alternate}`
    + `@keyframes ${id}-bob{from{transform:translateY(1.2px);opacity:.35}to{transform:translateY(-1.2px);opacity:.95}}`
    + `@media (prefers-reduced-motion: reduce){.${id}-w,.${id}-b{animation:none}}</style>`;
  const wave = `<linearGradient id="${id}-g" x1="0" x2="1"><stop offset="0" stop-color="${color}" stop-opacity="0"/><stop offset=".6" stop-color="${color}"/><stop offset=".85" stop-color="${lit}"/><stop offset="1" stop-color="${color}" stop-opacity=".2"/></linearGradient>`;
  const dots = bubbles(Math.max(3, Math.round(piece / 9)), seed).map((b) => dot({ ...b, x: 0.15 + b.x * 0.8 }, piece)).join('');
  return `${head}${css}<defs>${clip}${wave}</defs><g clip-path="url(#${id}-c)">${track}`
    + `<g class="${id}-w"><rect width="${piece}" height="${H}" rx="${H / 2}" fill="url(#${id}-g)"/><g class="${id}-b" fill="#ffffff">${dots}</g></g></g></svg>`;
}
