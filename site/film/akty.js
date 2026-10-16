// The film's own choreography on top of the engine: the cue windows set before mounting, and the
// signature move of act 2 (each question note flies to a document and its handwriting becomes a
// printed line). Pure timing functions are exported for the tests; the engine is never edited.

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (x) => { const t = clamp01(x); return t * t * (3 - 2 * t); };
const easeInOut = (x) => { const t = clamp01(x); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

/** Act 2 in fractions of its pinned travel: amnesia, the authored silence, the peak, the heading. */
export const PAMIEC = Object.freeze({
  zdania: Object.freeze({ od: 0.08, krok: 0.075, dlugosc: 0.11 }),
  cisza: Object.freeze([0.34, 0.4]),
  dokumenty: Object.freeze([0.38, 0.45]),
  lot: Object.freeze({ od: 0.44, krok: 0.064, dlugosc: 0.12 }),
});

/** Act 4: the window straightens by p≈0.42, then the bars wipe in from the left, one by one. */
export const PASKI = Object.freeze({ od: 0.44, krok: 0.07, dlugosc: 0.12 });

const okno = (od, dlugosc) => `${(+od.toFixed(3))} ${(+(od + dlugosc).toFixed(3))}`;

/** Cue windows of the amnesia sentences ("from to"), crossfading one into the next. */
export function oknaZdan(n, z = PAMIEC.zdania) {
  return Array.from({ length: n }, (_, i) => okno(z.od + i * z.krok, z.dlugosc));
}

/** Reveal windows of the bars ("from to"), one after another. */
export function oknaPaskow(n, p = PASKI) {
  return Array.from({ length: n }, (_, i) => okno(p.od + i * p.krok, p.dlugosc));
}

/** The flight window of note i: [start, end] in the act's progress. */
export function oknoLotu(i, l = PAMIEC.lot) {
  const od = l.od + i * l.krok;
  return [od, od + l.dlugosc];
}

/**
 * Where note i is at progress p: offset towards its line (dx, dy, px), turn, scale, and the
 * opacities of the note and of the printed line that takes its place.
 * @param {number} p @param {number} i @param {{ dx: number, dy: number, r: number, s: number }} cel
 */
export function lotKarteczki(p, i, cel) {
  const [od, doo] = oknoLotu(i);
  const t = clamp01((p - od) / (doo - od));
  const e = easeInOut(t);
  const luk = Math.sin(Math.PI * e) * -70; // a lift on the way, the note leaves the desk
  return {
    t,
    x: cel.dx * e,
    y: cel.dy * e + luk,
    r: cel.r * (1 - e),
    s: 1 - (1 - cel.s) * e,
    karteczka: 1 - smooth((t - 0.78) / 0.22),
    wpis: smooth((t - 0.7) / 0.3),
  };
}

/** Where the notes lie before they fly: fractions of the stage and a turn in degrees. */
// All above the documents (they stand from ~63 % of the stage down) and clear of the heading.
export const ROZSYPKA = Object.freeze([
  [0.55, 0.17, -7], [0.79, 0.12, 5], [0.65, 0.32, -3], [0.86, 0.35, 8],
  [0.5, 0.47, 4], [0.1, 0.52, -6], [0.73, 0.5, -2],
]);

/**
 * The order the notes fly in: the first line of every document, then the second ones, so the four
 * files fill side by side instead of one after another. `dokumentWpisu[i]` is the document of line i.
 * @param {number[]} dokumentWpisu
 */
export function kolejnoscLotu(dokumentWpisu) {
  const ktory = dokumentWpisu.map((d, i) => dokumentWpisu.slice(0, i).filter((x) => x === d).length);
  return dokumentWpisu
    .map((d, i) => ({ i, d, k: ktory[i] }))
    .sort((a, b) => a.k - b.k || a.d - b.d)
    .map((x) => x.i);
}

/**
 * Act 4: once the window has straightened it carries no transform at all, so its text is drawn
 * sharp rather than as a picture of a 3D layer (film 3.0.0, P-035). Returns a stop function.
 * @param {{ acts: { el: Element, p: number }[] }} api
 */
export function zamontujPanel(api, doc = document, win = window) {
  const el = doc.querySelector('[data-akt="panel"]');
  const akt = api.acts.find((a) => a.el === el);
  if (!el || !akt) return () => {};
  let ramka = 0;
  const rysuj = () => {
    ramka = win.requestAnimationFrame(rysuj);
    el.classList.toggle("prosto", akt.p >= PROSTO);
  };
  ramka = win.requestAnimationFrame(rysuj);
  return () => win.cancelAnimationFrame(ramka);
}

/** The progress of act 4 at which the window is straight (the CSS tilt reaches 0 at 1 / 2.4). */
export const PROSTO = 1 / 2.4;

/** Sets the cue and reveal windows the template leaves to the film; call before mounting. */
export function ustawOkna(doc = document) {
  const zdania = [...doc.querySelectorAll(".pamiec__zdanie")];
  oknaZdan(zdania.length).forEach((w, i) => zdania[i].setAttribute("data-sc-cue", `${w} 0.3 0.3`));
  const paski = [...doc.querySelectorAll(".pasek-makieta[data-sc-reveal]")];
  oknaPaskow(paski.length).forEach((w, i) => paski[i].setAttribute("data-sc-reveal-at", w));
}

/**
 * Drives act 2 from the engine's own progress of that act. Returns a stop function.
 * @param {{ acts: { el: Element, p: number }[] }} api  the instance ScrollCraft.mount returned
 */
export function zamontujPamiec(api, doc = document, win = window) {
  const el = doc.querySelector('[data-akt="pamiec"]');
  const akt = api.acts.find((a) => a.el === el);
  if (!el || !akt) return () => {};
  const scena = el.querySelector("[data-sc-stage]");
  const karteczki = [...el.querySelectorAll("[data-karteczka]")];
  const wpisy = [...el.querySelectorAll("[data-wpis]")];
  const dokumenty = el.querySelector(".dokumenty");
  if (karteczki.length !== wpisy.length) return () => {};
  const docs = [...el.querySelectorAll("[data-dokument]")];
  const kolejka = kolejnoscLotu(wpisy.map((w) => docs.indexOf(w.closest("[data-dokument]"))));
  const miejsce = kolejka.reduce((m, i, n) => { m[i] = n; return m; }, []);

  karteczki.forEach((k, i) => {
    const [x, y] = ROZSYPKA[i % ROZSYPKA.length];
    k.style.left = `${(x * 100).toFixed(1)}%`;
    k.style.top = `${(y * 100).toFixed(1)}%`;
  });

  let cele = [];
  const zmierz = () => {
    const s = scena.getBoundingClientRect();
    cele = karteczki.map((k, i) => {
      const w = wpisy[i].getBoundingClientRect();
      const kx = k.offsetLeft + k.offsetWidth / 2;
      const ky = k.offsetTop + k.offsetHeight / 2;
      const wx = w.left - s.left + Math.min(k.offsetWidth * 0.62, w.width) / 2;
      const wy = w.top - s.top + w.height / 2;
      return { dx: wx - kx, dy: wy - ky, r: ROZSYPKA[i % ROZSYPKA.length][2], s: 0.62 };
    });
    ostatnie = -1;
  };

  let ostatnie = -1;
  let ramka = 0;
  const rysuj = () => {
    ramka = win.requestAnimationFrame(rysuj);
    const p = akt.p;
    if (p === ostatnie) return;
    ostatnie = p;
    dokumenty.style.opacity = smooth((p - PAMIEC.dokumenty[0]) / (PAMIEC.dokumenty[1] - PAMIEC.dokumenty[0])).toFixed(3);
    karteczki.forEach((k, i) => {
      const l = lotKarteczki(p, miejsce[i], cele[i]);
      const wejscie = smooth((p - i * 0.012) / 0.06); // the notes are already there when the act arrives
      k.style.opacity = (l.karteczka * wejscie).toFixed(3);
      k.style.transform = `translate3d(${l.x.toFixed(1)}px, ${l.y.toFixed(1)}px, 0) rotate(${l.r.toFixed(2)}deg) scale(${l.s.toFixed(3)})`;
      wpisy[i].style.opacity = l.wpis.toFixed(3);
      wpisy[i].style.transform = `translateY(${((1 - l.wpis) * 6).toFixed(1)}px)`;
    });
  };

  const poZmianie = () => zmierz();
  zmierz();
  win.addEventListener("resize", poZmianie, { passive: true });
  ramka = win.requestAnimationFrame(rysuj);
  return () => {
    win.cancelAnimationFrame(ramka);
    win.removeEventListener("resize", poZmianie);
  };
}
