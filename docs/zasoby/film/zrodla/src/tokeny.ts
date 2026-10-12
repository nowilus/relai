// The film's palette and measures, direction "Warsztat z wigorem" (USTAWIENIA.md, 2026-10-12).
// Every color is a color of the "Warsztat" motif (core/panel/theme.mjs ROOT, verbatim from the
// plan template) or a mix of two; scenes take colors from here or from core/panel, never as
// literals of their own. No purple, no glow (D-61a).
import { ROOT, BAR, mix } from './rdzen';

export const FILM = Object.freeze({ width: 1920, height: 1080, fps: 30, paskiFrames: 300 });

const BLACK = '#000000';
const WHITE = '#ffffff';
const alpha = (hex: string, a: number) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${a})`;
};

/** The desk the app window lies on: the plan template's paper with its dotted grain. */
export const DESK = Object.freeze({
  paper: ROOT.tlo,
  grainLight: alpha(WHITE, 0.34),
  grainDark: alpha(mix(ROOT['txt-3'], ROOT.tlo, 0.2), 0.16),
  warmth: alpha(ROOT.kartka, 0.9),
  clay: alpha(ROOT.glina, 0.1),
  mustard: alpha(ROOT.musztarda, 0.12),
  shadow: `0 3px 6px ${alpha(mix(ROOT.txt, ROOT['txt-2'], 0.5), 0.14)}, 0 28px 70px ${alpha(ROOT.txt, 0.28)}`,
});

/** The app window: the desktop's dark surface, warmed by the motif's ink. */
export const WINDOW = Object.freeze({
  surface: mix(ROOT.txt, BLACK, 0.48),
  edge: alpha(ROOT.kartka, 0.07),
  radius: 30,
  promptBg: mix(ROOT.txt, BLACK, 0.3),
  promptEdge: alpha(ROOT.kartka, 0.1),
  caret: BAR.muted,
});

/**
 * Light glass under the bars: a breath of paper over the dark surface, a highlight on top. No
 * backdrop-filter: it makes a composited layer the camera would enlarge as a blurred picture.
 */
export const GLASS = Object.freeze({
  fill: alpha(ROOT.kartka, 0.045),
  edge: alpha(ROOT.kartka, 0.09),
  highlight: alpha(WHITE, 0.14),
  radius: 22,
});

/** Ink of the words on the desk and of the hand-drawn note. */
export const INK = Object.freeze({
  title: ROOT.txt,
  lead: ROOT['txt-2'],
  note: ROOT.musztarda,
  noteSoft: mix(ROOT.musztarda, ROOT.kartka, 0.35),
  margin: ROOT.glina,
  captionText: ROOT.txt,
  captionBg: alpha(ROOT.kartka, 0.92),
  captionEdge: ROOT.linia,
  captionShadow: `0 2px 4px ${alpha(ROOT.txt, 0.08)}, 0 10px 24px ${alpha(ROOT.txt, 0.12)}`,
});

/** The paper note pinned on the window (blend.html's "karteczka"): dark ink, read on a phone too. */
export const NOTE = Object.freeze({
  paper: mix(ROOT.kartka, ROOT.musztarda, 0.13),
  edge: mix(ROOT.linia, ROOT.musztarda, 0.25),
  ink: ROOT.txt,
  inkSoft: ROOT['txt-2'],
  accent: ROOT['glina-2'],
  tape: alpha(mix(ROOT.kartka, ROOT.musztarda, 0.3), 0.82),
  tapeEdge: alpha(ROOT['linia-2'], 0.6),
  shadow: `0 2px 3px ${alpha(BLACK, 0.25)}, 0 18px 40px ${alpha(BLACK, 0.45)}`,
});

/** The underline drawn under each question of the subtitle, in the darker twin of its bar's color. */
export const QUESTION = Object.freeze([ROOT.musztarda, ROOT.szalwia, ROOT.glina]);

export const FONT = Object.freeze({
  serif: "'Fraunces', Georgia, serif",
  ui: "'Hanken Grotesk', 'Segoe UI', sans-serif",
  hand: "'Caveat', 'Kalam', cursive",
  handBold: "'Kalam', 'Caveat', cursive",
});

/** The bars are drawn at the panel's geometry times SCALE: a 1920 frame is read on a phone too. */
export const SCALE = 1.4;
export const CELL = 8 * SCALE; // one terminal cell of the panel grid (P-024 pkt 3: 8 px CSS)
