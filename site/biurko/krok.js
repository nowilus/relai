// The desk under a finger: one swipe is one step to the next stop, and further swipes wait until the
// camera stands there (Łukasz, 2026-10-19, iPhone: one flick ran through every stop to the end). A
// wheel and a trackpad keep the plain scrolling of E6. Pure: no DOM; warstwa.js wires it to touches.

/** A vertical move shorter than this (px) is a tap or a wobble, not a swipe. */
export const PROG_GESTU_PX = 40;
/** Within this many px of a stop the page counts as standing on it. */
const TOLERANCJA_PX = 4;
/** The camera counts as arrived within this much of the target's track progress (0..1). */
export const DOJAZD_EPS = 0.004;
/** After this long a step is released whatever the camera reports, so the page is never stuck. */
export const ZAPAS_MS = 5000;

/**
 * Which way a finished swipe goes: 1 = down the page (finger moved up), -1 = back up, 0 = no step.
 * @param {number} dx sideways travel, px
 * @param {number} dy upward travel of the finger (start y - end y), px
 */
export function kierunekGestu(dx, dy, prog = PROG_GESTU_PX) {
  if (Math.abs(dy) < prog || Math.abs(dy) <= Math.abs(dx)) return 0;
  return Math.sign(dy);
}

/**
 * The stop one step from the page's place, or null past either end.
 * @param {number[]} punkty every stop's scroll offset, ascending
 * @param {number} y the page's scroll offset now
 * @param {number} kierunek 1 down, -1 up
 */
export function celKroku(punkty, y, kierunek) {
  if (kierunek > 0) {
    const i = punkty.findIndex((p) => p > y + TOLERANCJA_PX);
    return i < 0 ? null : i;
  }
  if (kierunek < 0) {
    for (let i = punkty.length - 1; i >= 0; i--) if (punkty[i] < y - TOLERANCJA_PX) return i;
  }
  return null;
}

/**
 * Whether a held step can let go: the camera stands at the target and the peak is not mid-play, or
 * the safety margin has run out.
 * @param {{ postep: number, cel: number, szczyt: string, od: number, teraz: number }} s
 */
export function czyZwolnic({ postep, cel, szczyt, od, teraz }) {
  if (teraz - od > ZAPAS_MS) return true;
  return Math.abs(postep - cel) < DOJAZD_EPS && szczyt !== "gra";
}
