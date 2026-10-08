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

/** @type {Readonly<Record<string, readonly [string, string]>>} Polish name and one-line purpose, in the order of FORMS. */
export const NAMES = Object.freeze({
  'relai-stage': ['Etap planu', 'Uruchom następny etap aktywnego planu'],
  'relai-prompt': ['Optymalizator promptu', 'Zamień zdanie w precyzyjny prompt'],
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
  { id: 'work', title: 'Prowadzenie pracy', commands: ['relai-crew', 'relai-branch'] },
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
  ...Object.entries(NAMES).map(([c, [name]]) => ({ key: 'name-' + c, text: name, size: 26, color: mix(ROOT.glina, ROOT.kartka, 0.25) })),
]);

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
