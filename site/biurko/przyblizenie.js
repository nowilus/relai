// The close-up of the laptop display: which state the camera is in, and the pose that squares up to
// the display. Pure: no DOM, no three.js. Units: metres, vertical field of view in degrees.

export const STANY = Object.freeze(["przystanek", "przyblizony"]);
export const ZDARZENIA = Object.freeze(["klik", "enter", "fokus", "esc", "wstecz", "wroc", "opuszczony"]);
const DO_EKRANU = new Set(["klik", "enter", "fokus"]);

/** Share of the frame the display fills along its tighter side, in the close-up. */
export const WYPELNIENIE = 0.9;

/**
 * Next state after an event. Clicking, pressing Enter on the display or focusing a control inside it
 * zooms in, but only while the camera holds at the install stop; Esc, scrolling back, the back
 * button and leaving the stop zoom out.
 * @param {"przystanek" | "przyblizony"} stan
 * @param {string} zdarzenie one of ZDARZENIA
 * @param {{ naPrzystanku: boolean }} kontekst
 */
export function przejscie(stan, zdarzenie, { naPrzystanku }) {
  if (!STANY.includes(stan)) throw new RangeError(`unknown stan: ${String(stan)}`);
  if (!ZDARZENIA.includes(zdarzenie)) throw new RangeError(`unknown zdarzenie: ${String(zdarzenie)}`);
  if (DO_EKRANU.has(zdarzenie)) return naPrzystanku ? "przyblizony" : stan;
  return "przystanek";
}

const dodaj = (a, b, s = 1) => a.map((v, i) => v + b[i] * s);
const roznica = (a, b) => a.map((v, i) => v - b[i]);
const iloczyn = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const wektorowy = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const normuj = (a) => {
  const d = Math.hypot(...a);
  return a.map((v) => v / d);
};

/**
 * Camera pose square to the display, far enough that the display fills `wypelnienie` of the frame
 * along whichever side is tighter for this viewport.
 * @param {{ srodek: number[], normalna: number[], szer: number, wys: number }} ekran
 *   centre and outward unit normal in world space; width and height in metres
 * @param {{ fov: number, aspekt: number }} widok vertical fov in degrees, width / height
 */
export function pozaPrzyblizenia(ekran, widok, wypelnienie = WYPELNIENIE) {
  const t = Math.tan((widok.fov * Math.PI) / 360);
  const odleglosc = Math.max(ekran.wys / (2 * t * wypelnienie), ekran.szer / (2 * t * widok.aspekt * wypelnienie));
  return { poz: dodaj(ekran.srodek, ekran.normalna, odleglosc), cel: [...ekran.srodek], fov: widok.fov };
}

/**
 * Projects a world point through a camera looking from `poza.poz` at `poza.cel` with world up +y,
 * the way PerspectiveCamera.lookAt does. Returns normalised device coordinates (-1..1 inside the frame).
 */
export function rzutuj(poza, punkt, widok) {
  const przod = normuj(roznica(poza.cel, poza.poz));
  const prawo = normuj(wektorowy(przod, [0, 1, 0]));
  const gora = wektorowy(prawo, przod);
  const v = roznica(punkt, poza.poz);
  const z = iloczyn(v, przod);
  const t = Math.tan((widok.fov * Math.PI) / 360);
  return [iloczyn(v, prawo) / (z * t * widok.aspekt), iloczyn(v, gora) / (z * t)];
}

const gladko = (t) => t * t * (3 - 2 * t);

/** Blends the track pose toward the close-up; `t` 0..1 is eased here. Other fields of `a` pass through. */
export function zmieszaj(a, b, t) {
  const s = gladko(Math.min(1, Math.max(0, t)));
  if (s === 0) return a;
  const mieszaj = (x, y) => x.map((v, i) => v + (y[i] - v) * s);
  return { ...a, poz: mieszaj(a.poz, b.poz), cel: mieszaj(a.cel, b.cel), fov: a.fov + (b.fov - a.fov) * s };
}
