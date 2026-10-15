// RelAI core / panel: theme — the look of the relai-panel pane (plan PANEL_CLAUDE, E8).
//
// Source of the motif: the `:root` block of core/templates/HTML_PLAN/szablon.html, direction
// "Warsztat" (RelAI, chosen 2026-08-08). ROOT copies its colors verbatim; theme.test.js holds
// each one to the template, so a color changed there and not here is reported. The pane sits on
// the app's own surface (dark in the measured desktop, 2026-10-08), so the card colors are not
// new picks but mixes of ROOT colors, computed here. Every text drawn on a card names its color:
// a card that sets its own background must not borrow the text color of the person's theme.
//
// Also here: which commands the pane groups and recommends, and the Polish name and one-line
// purpose each card shows. Same ESM rule and same copy as plan-state.mjs.

/** The colors of szablon.html `:root`, verbatim, keyed by their CSS names without `--`. */
export const ROOT = Object.freeze({
  tlo: '#f2e9d8',
  kartka: '#fffdf7',
  'kartka-2': '#f8f1e2',
  txt: '#312c25',
  'txt-2': '#61594c',
  'txt-3': '#8f8574',
  linia: '#e0d3ba',
  'linia-2': '#cdbc9c',
  glina: '#c4643c',
  'glina-2': '#a8502e',
  musztarda: '#d9a134',
  szalwia: '#5f8a68',
});

const hex = (/** @type {string} */ c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));

/**
 * The color `t` of the way from `a` to `b` (0 = a, 1 = b), both `#rrggbb`.
 * @param {string} a @param {string} b @param {number} t
 */
export function mix(a, b, t) {
  const x = hex(a);
  const y = hex(b);
  return '#' + x.map((v, i) => Math.round(v + ((y[i] ?? 0) - v) * t).toString(16).padStart(2, '0')).join('');
}

/** What the pane draws with: every value a ROOT color or a mix of two. */
export const THEME = Object.freeze({
  accent: ROOT.glina, // the selected card's border, the hero
  accentText: mix(ROOT.glina, ROOT.kartka, 0.25), // clay readable on a dark card
  mark: ROOT.musztarda, // section headings, recommended cards
  ok: mix(ROOT.szalwia, ROOT.kartka, 0.3), // sent
  title: ROOT.tlo, // a card's name
  body: mix(ROOT['txt-3'], ROOT.kartka, 0.25), // a card's purpose line
  line: mix(ROOT.txt, ROOT['linia-2'], 0.18), // a card's border at rest
  lineOff: mix(ROOT.txt, ROOT['linia-2'], 0.08), // a command this session cannot run
  card: mix(ROOT.txt, '#000000', 0.25),
  cardOn: ROOT.txt, // the selected card
  cardFeatured: mix(ROOT.txt, ROOT['glina-2'], 0.12),
  pressed: ROOT.musztarda, // the border of a card whose control was just pressed
});

/**
 * A document's diff in the documents tab (E6, Aneks E), drawn row by row as code review draws it:
 * an added line on sage, a removed one on clay, the line numbers in a quiet gutter. Text on its
 * background reads at 4.5:1 or more (theme.test.js).
 */
export const DIFF = Object.freeze({
  addBg: mix(ROOT.txt, ROOT.szalwia, 0.35),
  delBg: mix(ROOT.txt, ROOT.glina, 0.32),
  addText: mix(ROOT.szalwia, ROOT.kartka, 0.7),
  delText: mix(ROOT.glina, ROOT.kartka, 0.65),
  ctxText: THEME.body,
  gutter: mix(ROOT['txt-3'], ROOT.kartka, 0.5),
  hunk: THEME.mark,
});

/** @type {Readonly<Record<string, readonly [string, string]>>} Polish name and one-line purpose, in the order of FORMS. */
export const NAMES = Object.freeze({
  'relai-stage': ['Etap planu', 'Uruchom następny etap aktywnego planu'],
  'relai-prompt': ['Optymalizator promptu', 'Zamień zdanie w precyzyjny prompt'],
  'relai-humanize': ['Humanizacja tekstu', 'Usuń z tekstu nawyki pisarskie AI'],
  'relai-crew': ['Załoga agentów', 'Rozdziel cel między kilku agentów'],
  'relai-branch': ['Odnoga planu', 'Odłóż boczny wątek na osobną kartę'],
  'relai-backup': ['Kopia zapasowa', 'Spakuj projekt do archiwum ZIP'],
  'relai-audit': ['Przegląd projektu', 'Raport o zdrowiu dokumentacji'],
  'relai-changelog': ['Lista zmian', 'Zmiany wydestylowane z dziennika'],
  'relai-handover': ['Pakiet przekazania', 'Cały projekt w jednym pliku HTML'],
  'relai-tour': ['Wycieczka po projekcie', 'Opowieść o projekcie z jego dokumentów'],
  'relai-help': ['Ściąga projektu', 'Komendy, frazy i zachowania automatyczne'],
  'relai-adopt': ['Adopcja projektu', 'Wprowadź RelAI do zastanego repo'],
  'relai-update': ['Aktualizacja', 'Podnieś projekt do wersji pluginu'],
  'relai-models': ['Lista modeli', 'Odśwież modele narzędzia'],
  'relai-clean': ['Sprzątanie', 'Usuń artefakty robocze po zgodzie'],
});

/** Recommended at the top of the pane (calibration 2026-10-08: variant A with C's "Polecane"). */
export const FEATURED = Object.freeze(['relai-stage', 'relai-prompt', 'relai-tour']);

/** The rest, in groups under a heading each; a featured command is not repeated here. */
export const GROUPS = Object.freeze([
  { id: 'work', title: 'Prowadzenie pracy', commands: ['relai-crew', 'relai-branch', 'relai-humanize'] },
  { id: 'know', title: 'Wiedza o projekcie', commands: ['relai-help', 'relai-audit', 'relai-changelog', 'relai-handover'] },
  { id: 'care', title: 'Porządek i bezpieczeństwo', commands: ['relai-backup', 'relai-clean', 'relai-update', 'relai-models', 'relai-adopt'] },
]);

/**
 * Every heading the pane draws in Kalam, with its size and color: the input of
 * core/tools/build-panel-headings.js, which writes headings.mjs. Text drawn in Kalam is fixed
 * here and measured there; text that changes at run time stays in the surface's own font.
 */
export const HEADINGS = Object.freeze([
  { key: 'hero', text: 'Panel RelAI', size: 34, color: ROOT.glina, swash: ROOT.musztarda },
  { key: 'featured', text: 'Polecane teraz', size: 22, color: ROOT.musztarda },
  ...GROUPS.map((g) => ({ key: 'group-' + g.id, text: g.title, size: 22, color: ROOT.musztarda })),
  { key: 'sheet', text: 'Ściąga', size: 22, color: ROOT.musztarda },
  { key: 'phrases', text: 'Frazy sesji', size: 22, color: ROOT.musztarda },
  { key: 'phrases-ready', text: 'Jednym kliknięciem', size: 20, color: mix(ROOT.glina, ROOT.kartka, 0.25) },
  { key: 'phrases-fill', text: 'Do uzupełnienia', size: 20, color: mix(ROOT.glina, ROOT.kartka, 0.25) },
  { key: 'costs', text: 'Koszty sesji', size: 22, color: ROOT.musztarda },
  { key: 'costs-turns', text: 'Wywołania w czasie', size: 20, color: mix(ROOT.glina, ROOT.kartka, 0.25) },
  { key: 'costs-agents', text: 'Agenci', size: 20, color: mix(ROOT.glina, ROOT.kartka, 0.25) },
  { key: 'costs-models', text: 'Modele', size: 20, color: mix(ROOT.glina, ROOT.kartka, 0.25) },
  // The map tab (E4): one main heading, the rest a size down, as in the costs tab
  { key: 'map-active', text: 'Aktywny plan', size: 20, color: mix(ROOT.glina, ROOT.kartka, 0.25) },
  { key: 'map-open', text: 'Inne plany', size: 20, color: mix(ROOT.glina, ROOT.kartka, 0.25) },
  { key: 'map-crew', text: 'Przebiegi załogi', size: 20, color: mix(ROOT.glina, ROOT.kartka, 0.25) },
  { key: 'map-outside', text: 'Poza etapem', size: 20, color: mix(ROOT.glina, ROOT.kartka, 0.25) },
  { key: 'map-archive', text: 'Archiwum planów', size: 20, color: mix(ROOT.glina, ROOT.kartka, 0.25) },
  // The session's own work on top of the map (AUDYT_MODOW Z14, Aneks B)
  { key: 'map-session', text: 'Ta sesja', size: 20, color: mix(ROOT.glina, ROOT.kartka, 0.25) },
  { key: 'costs-stages', text: 'Etapy', size: 20, color: mix(ROOT.glina, ROOT.kartka, 0.25) },
  // The confirmation card (E5): above every tab while it waits for "Tak"
  { key: 'confirm', text: 'Do potwierdzenia', size: 22, color: ROOT.musztarda },
  // The documents tab and the price list in the costs tab (E6)
  { key: 'docs', text: 'Dokumenty projektu', size: 22, color: ROOT.musztarda },
  { key: 'costs-pricing', text: 'Cennik', size: 20, color: mix(ROOT.glina, ROOT.kartka, 0.25) },
  // relai-progress's pane (E9, calibration 2026-10-09: the same motif as relai-panel's)
  { key: 'progress', text: 'Postęp etapu', size: 22, color: ROOT.musztarda },
  { key: 'agents', text: 'Agenci sesji', size: 22, color: ROOT.musztarda },
  ...Object.entries(NAMES).map(([c, [name]]) => ({ key: 'name-' + c, text: name, size: 26, color: mix(ROOT.glina, ROOT.kartka, 0.25) })),
]);

/** The characters a figure of the cost report may hold, drawn in Kalam at run time (E3). */
export const NUMERAL_GLYPHS = '$0123456789.,<%~kM ';

/** The letters of a document's type label on its icon (E6, Aneks E), drawn as Kalam outlines. */
export const LABEL_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/** The four token categories of the cost report, each its own color of the motif (E3). */
export const COST_COLORS = Object.freeze({
  input: ROOT.szalwia,
  cacheRead: mix(ROOT.szalwia, ROOT.kartka, 0.5),
  cacheWrite: ROOT.glina,
  output: ROOT.musztarda,
});

/**
 * The bars above the prompt (E9, Aneks C; look: docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md,
 * chosen 2026-10-09): three calm bars, cache → plan → progress, set apart by a soft background of
 * their own, a gap and a shared grid — the label column on the left, the figure on the right —
 * instead of a colored frame (each element above the prompt visibly apart, rule of 2026-10-08).
 * Colors are the brief's, verbatim: the dark reference of the accepted mock-ups. relai-panel,
 * relai-progress and relai-cache-keeper read them from their synced copy of this file.
 */
// Brief v2 (2026-10-10, AUDYT_MODOW): the label is the bar's own word; the brand is in its color.
export const BAND = Object.freeze({
  cache: Object.freeze({ label: 'cache', color: '#df987a', bg: '#2c2824' }),
  panel: Object.freeze({ label: 'plan', color: '#e1b85c', bg: '#2d2a23' }),
  progress: Object.freeze({ label: 'postęp', color: '#9cbea2', bg: '#262c27' }),
});

/** What every bar shares: its text, its grid in cells, the colors of a task tile by its state. */
export const BAR = Object.freeze({
  text: '#eee8dc',
  muted: '#b8b0a3',
  labelColumn: 14, // cells, the same in all three bars (brief v2 §5; v1: 16 with "RelAI ·")
  figureColumn: 11, // cells, never shrunk at the figure's cost (brief: ~76–88 px)
  narrow: 90, // below this many columns the label goes above the content
  tile: Object.freeze({
    done: Object.freeze({ bg: mix('#262c27', '#9cbea2', 0.3), text: '#eee8dc', mark: '✓' }),
    pending: Object.freeze({ bg: mix('#262c27', '#464239', 0.6), text: '#b8b0a3', mark: '○' }),
    running: Object.freeze({ bg: mix('#262c27', '#e1b85c', 0.25), text: '#eee8dc', mark: '●' }),
    failed: Object.freeze({ bg: mix('#262c27', '#df987a', 0.25), text: '#eee8dc', mark: '!' }),
    unknown: Object.freeze({ bg: mix('#262c27', '#464239', 0.6), text: '#b8b0a3', mark: '?' }),
  }),
  // One segment of the progress bar per item, by its state (calibration 2026-10-09: "Pola
  // i segmenty", a bar cut into segments, not named tiles)
  segment: Object.freeze({
    done: mix('#9cbea2', '#262c27', 0.12),
    pending: mix('#262c27', '#b8b0a3', 0.12),
    running: mix('#e1b85c', '#262c27', 0.2),
    failed: mix('#df987a', '#262c27', 0.2),
    unknown: mix('#262c27', '#b8b0a3', 0.12),
  }),
});

/**
 * The rings of the cache bar (brief v2 §4): geometry in px, the track under the fill, and the
 * thresholds of the fill's color — of a limit used (5 h, week, context) in percent used, of the
 * cache in percent of its TTL left.
 */
export const RING = Object.freeze({
  diameter: 22,
  stroke: 3.2,
  hoverStroke: 4.4, // hover only thickens the ring: no tooltip, no overlay (brief v2 §4)
  track: '#1d1b18',
  warn: 70, // % used: mustard from here
  alert: 90, // % used: clay from here
  cacheWarn: 35, // % of TTL left: mustard at or below (the cache cools)
  cacheAlert: 15, // % of TTL left: clay at or below, and when cold
});

const isFigure = (/** @type {unknown} */ v) => typeof v === 'number' && Number.isFinite(v);

/**
 * The fill of a limit's ring by the percent used: sage below 70, mustard from 70, clay from 90.
 * A missing figure draws the bare track, never a pretend color (brief §4: "brak danych").
 * @param {number} percent @returns {string}
 */
export function usageColor(percent) {
  if (!isFigure(percent)) return RING.track;
  if (percent >= RING.alert) return BAND.cache.color;
  if (percent >= RING.warn) return BAND.panel.color;
  return BAR.segment.done;
}

/**
 * The fill of the cache ring, the other way round: sage while warm, mustard at 35 % of the TTL
 * left or less, clay at 15 % or less and whenever the cache is cold. A missing figure: the track.
 * @param {number} leftPercent @param {boolean} [isCold] @returns {string}
 */
export function cacheColor(leftPercent, isCold = false) {
  if (isCold) return BAND.cache.color;
  if (!isFigure(leftPercent)) return RING.track;
  if (leftPercent <= RING.cacheAlert) return BAND.cache.color;
  if (leftPercent <= RING.cacheWarn) return BAND.panel.color;
  return BAR.segment.done;
}

/**
 * The batteries of the cache bar (Aneks Z11, brief v3 §10.3, calibrated in the app 2026-10-10):
 * one row of 24 px, a 26 × 12 px icon, the label and value in 14.5 px, a card on hover. `char` is
 * a generous mean advance of the font (no layout engine in SVG: an estimate that errs wide never
 * runs into the next measure). A battery shows what is LEFT; its color comes from that share.
 */
export const BATTERY = Object.freeze({
  height: 24,
  font: 14.5,
  char: 7.9,
  textY: 17, // the text's baseline
  spanGap: 7, // px from the label to the value
  itemGap: 30, // px between measures
  icon: Object.freeze({ w: 26, h: 12, y: 6, gap: 8 }), // gap: from the icon to its label
  card: Object.freeze({ h: 22, pad: 11, gap: 6, font: 13, char: 7.1, lineGap: 9, bg: mix(BAND.cache.bg, BAR.text, 0.14) }),
  warn: 30, // % left: mustard at or below
  alert: 10, // % left: clay at or below
});

/**
 * A battery's fill by the share LEFT, one rule for every battery: sage, mustard at 30 % left or
 * less, clay at 10 % or less and whenever the cache is cold. A missing figure: the bare track.
 * @param {number} leftPercent @param {boolean} [isCold] @returns {string}
 */
export function leftColor(leftPercent, isCold = false) {
  if (isCold) return BAND.cache.color;
  if (!isFigure(leftPercent)) return RING.track;
  if (leftPercent <= BATTERY.alert) return BAND.cache.color;
  if (leftPercent <= BATTERY.warn) return BAND.panel.color;
  return BAR.segment.done;
}

/**
 * The chip that opens a bar's second row (brief v2 §1; colors of MAKIETY.html v4): `warn` for
 * what waits for the person (a card, a cooling cache), `ok` for what was just done (a ticked
 * item), `run` for what goes on, `info` for news that asks nothing yet (the Z9 event, Aneks Z11:
 * the cache bar's surface a shade lighter, its lead in the text color, the rest muted).
 */
export const CHIP = Object.freeze({
  warn: Object.freeze({ color: BAND.cache.color, bg: '#3d2f28' }),
  ok: Object.freeze({ color: BAND.progress.color, bg: '#2f3a31' }),
  run: Object.freeze({ color: BAND.panel.color, bg: '#3a342b' }),
  info: Object.freeze({ color: BAR.text, bg: mix(BAND.cache.bg, BAR.text, 0.1) }),
});

/**
 * How the map marks a state (E4): the sign and the color of the motif, so the state reads in the
 * sign and the word, never in the color alone; `item` is the progress segment it draws as (BAR),
 * the same language as the bar above the prompt. A status outside these lists is `unknown`.
 */
export const FLOW = Object.freeze({
  stage: Object.freeze({
    'ZREALIZOWANY': Object.freeze({ mark: '✓', color: THEME.ok, item: 'done' }),
    'W TOKU': Object.freeze({ mark: '●', color: THEME.mark, item: 'running' }),
    'GOTOWY DO STARTU': Object.freeze({ mark: '▶', color: THEME.accentText, item: 'pending' }),
    'OCZEKUJE': Object.freeze({ mark: '○', color: THEME.body, item: 'pending' }),
    'POMINIĘTY': Object.freeze({ mark: '–', color: THEME.body, item: 'unknown' }),
  }),
  task: Object.freeze({
    done: Object.freeze({ mark: '✓', color: THEME.ok, word: 'gotowe' }),
    running: Object.freeze({ mark: '●', color: THEME.mark, word: 'w toku' }),
    failed: Object.freeze({ mark: '!', color: THEME.accentText, word: 'nieudane' }),
    pending: Object.freeze({ mark: '○', color: THEME.body, word: 'czeka' }),
  }),
  branch: Object.freeze({
    'OTWARTA': Object.freeze({ mark: '↳', color: THEME.mark }),
    'ZAMKNIĘTA': Object.freeze({ mark: '↳', color: THEME.ok }),
    'PRZENIESIONA': Object.freeze({ mark: '↳', color: THEME.body }),
  }),
  unknown: Object.freeze({ mark: '?', color: THEME.body, item: 'unknown' }),
});

/**
 * The bars above the prompt in the tool's own colors (plan WYGLAD_PANELU, E1, Aneks B; P-042).
 * Box and Text paint with theme keys, which the desktop repaints with the app's appearance; a mod
 * cannot read that appearance, so the marks drawn in Svg carry two palettes in CSS and switch by
 * `prefers-color-scheme`. The look Łukasz accepted on 2026-10-14: variant 3b — no surface, no
 * frame, a hairline fading at both ends above each bar — the light marks of tuning A, the rule L2.
 * `inverseText` is left out: on the light appearance it is white on white.
 */
export const KEY = Object.freeze({
  text: 'text', // a value, a title
  muted: 'inactive', // a label, a unit, a calm line
  done: 'success',
  running: 'warning',
  failed: 'error',
  accent: 'claude', // what goes on (a chip of a handoff or a kept cache)
});

/**
 * The marks' raw colors by meaning: dark by default, light under the media query. Dark: what the
 * desktop draws for the keys (sampled from the probe's pane, WYGLAD_PANELU_E1_sonda_2); light:
 * tuning A (fresher green and amber than the keys' own) and the rule L2.
 */
export const INK = Object.freeze({
  dark: Object.freeze({ text: '#f0efec', muted: '#c3c2b8', rule: '#636260', track: '#484847', done: '#4ca129', running: '#ce932a', failed: '#db8080', accent: '#b76345', card: '#3a3936' }),
  light: Object.freeze({ text: '#0b0b0b', muted: '#52514e', rule: '#9a988f', track: '#d3d1cb', done: '#4d9c45', running: '#c48a2c', failed: '#c0504d', accent: '#b76345', card: '#ffffff' }),
});

/**
 * The CSS that paints a mark by its class: `f-<ink>` fills, `s-<ink>` strokes, `c-<ink>` a
 * gradient stop; the light palette under `@media (prefers-color-scheme: light)`.
 * @returns {string}
 */
export function inkCss() {
  const rules = (/** @type {Readonly<Record<string, string>>} */ p) => Object.keys(p)
    .map((k) => `.f-${k}{fill:${p[k]}}.s-${k}{stroke:${p[k]}}.c-${k}{stop-color:${p[k]}}`).join('');
  return rules(INK.dark) + `@media (prefers-color-scheme: light){${rules(INK.light)}}`;
}

/** The ink a state color of the bars (BAR.segment, BAND, RING) draws as; any other: muted. @param {string} color @returns {string} */
export function inkOf(color) {
  if (color === BAR.segment.done) return 'done';
  if (color === BAND.panel.color) return 'running';
  if (color === BAND.cache.color) return 'failed';
  if (color === RING.track) return 'track';
  return 'muted';
}

/** The ink of a progress item by its state (BAR.tile keys). */
export const SEGMENT_INK = Object.freeze({ done: 'done', pending: 'track', running: 'running', failed: 'failed', unknown: 'track' });

/**
 * The light tuning of the progress list (plan WYGLAD_PANELU, E2, round 3 "J3 miękki", Łukasz
 * 2026-10-15): laid over INK.light in the progress bar's own Svg alone — the other bars and the dark
 * palette stay as they are. Classes of the marks: `ring` a waiting item, `sptrack` the spinner's
 * track; CSS wins over their presentation attributes.
 */
export const STEP_LIGHT_CSS = '.f-track{fill:#e7e4dd}.f-done{fill:#5aa851}.f-running{fill:#d39a33}.s-running{stroke:#c98a1e}'
  + '.ring{fill:#efede8;stroke:#cdcac2;stroke-dasharray:none;stroke-width:1px;opacity:1}.sptrack{fill:#f7ecd6;stroke:#f2e3c4}';

/** The CSS of the progress list's marks and segments: inkCss() and STEP_LIGHT_CSS in the light appearance. @returns {string} */
export function stepCss() {
  return inkCss() + `@media (prefers-color-scheme: light){${STEP_LIGHT_CSS}}`;
}

/** The rule above each bar (variant 3b): 22 px of air, a 1 px line fading over its first and last 12 %. */
export const RULE = Object.freeze({
  height: 22,
  alt: 'linia oddzielająca paski RelAI',
  svg: '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="22"><style>'
    + `.c-rule{stop-color:${INK.dark.rule}}@media (prefers-color-scheme: light){.c-rule{stop-color:${INK.light.rule}}}</style>`
    + '<defs><linearGradient id="g"><stop offset="0" class="c-rule" stop-opacity="0"/><stop offset="0.12" class="c-rule"/>'
    + '<stop offset="0.88" class="c-rule"/><stop offset="1" class="c-rule" stop-opacity="0"/></linearGradient></defs>'
    + '<rect x="0" y="11" width="100%" height="1" fill="url(#g)"/></svg>',
});

/** What bar-card.tsx takes: the grid of BAR, the text in theme keys, the rule above the card. */
export const BAR_LOOK = Object.freeze({
  labelColumn: BAR.labelColumn,
  figureColumn: BAR.figureColumn,
  narrow: BAR.narrow,
  text: KEY.text,
  muted: KEY.muted,
  rule: RULE,
});

/** A chip of a second row in theme keys: its words in the state's color, no surface of its own. */
export const CHIP_KEY = Object.freeze({ warn: KEY.running, ok: KEY.done, run: KEY.accent, info: KEY.text });

/** Small line glyphs of the pane's own controls (tabs, phrase cards), 24×24, in one color. */
const GLYPH_PATHS = Object.freeze({
  commands: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="3.5"/>',
  sheet: '<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5c-3.5-.5-6.5 0-8.5 1.5z"/><path d="M12 6.5v13"/>',
  phrases: '<path d="M5 4.5h14a2.5 2.5 0 0 1 2.5 2.5v7a2.5 2.5 0 0 1-2.5 2.5h-7l-4.5 3.5v-3.5H5A2.5 2.5 0 0 1 2.5 14V7A2.5 2.5 0 0 1 5 4.5z"/>',
  fill: '<path d="M5 4.5h14a2.5 2.5 0 0 1 2.5 2.5v7a2.5 2.5 0 0 1-2.5 2.5h-7l-4.5 3.5v-3.5H5A2.5 2.5 0 0 1 2.5 14V7A2.5 2.5 0 0 1 5 4.5z"/><path d="M7.5 11h.01M12 11h.01M16.5 11h.01" stroke-width="3"/>',
});

/** A glyph as an SVG document; null for a name the pane does not know. @param {string} name @param {string} color @param {number} px */
export function glyph(name, color, px) {
  const paths = /** @type {Record<string, string>} */ (GLYPH_PATHS)[name];
  if (!paths) return null;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${px}" height="${px}"><g fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`;
}

/** The file of docs/zasoby/branding/ikony/ that draws a command: `relai-stage` -> `stage`. */
export const iconName = (/** @type {string} */ command) => command.replace(/^relai-/, '');
