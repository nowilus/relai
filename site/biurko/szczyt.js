// The peak, "mess into order": the seven sticky notes lift off the desk, fly to where the four project
// documents will lie, and each document grows out of the notes that landed on it. One timed animation
// (Łukasz, E6: the same rule as the Film after E7), played when the camera arrives at the peak's hold.
// Pure: no DOM, no three.js. Poses are plain arrays, metres and radians; time is 0..1 of CZAS_MS.

/**
 * Length of the whole animation, ms. The scroll down is held for this long. Calibrated with Łukasz in
 * E6: 3.2 s with scroll-bound flights was ten scrolls too long, 1.75 s with fast flights too quick;
 * with the slow 2.8 s camera the notes fly "also slower, about 3 s".
 */
export const CZAS_MS = 3000;

/** Which document each note lands on: notes 0-1 STATE, 2-3 JOURNAL, 4-5 LESSONS, 6 DECISIONS. */
export const DOKUMENT_KARTECZKI = Object.freeze([0, 0, 1, 1, 2, 2, 3]);

/**
 * Timeline in ms: note i lifts at START + i * KROK and flies for LOT; a document grows for WZROST after
 * its last note lands. START is the silence before the peak: the camera has arrived, nothing moves yet.
 */
export const RYTM = Object.freeze({ start: 300, krok: 120, lot: 1100, wzrost: 650 });

const LUK = 0.13; // how high a note rises mid-flight, metres
const PRZECHYL = 0.55; // how far a note tips while it flies, radians
// a landed note rests just under its document, so the sheet unfolding over the little pile covers it
const POD_DOKUMENTEM = 0.0004;
const KROK_STOSU = 0.0003;
/** The size a document starts at, as a share of its own: the size of a sticky note (7.6 cm on 21 x 29.7 cm). */
export const ROZMIAR_KARTECZKI = Object.freeze([0.076 / 0.21, 0.076 / 0.297]);

const ogranicz = (t) => Math.min(1, Math.max(0, t));
const gladko = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const mieszaj = (a, b, t) => a + (b - a) * t;

/** Start and end of note i's flight, as shares of the whole animation. */
export function oknoLotu(i, r = RYTM) {
  const od = r.start + i * r.krok;
  return [od / CZAS_MS, (od + r.lot) / CZAS_MS];
}

/** Start and end of document j's growth: from the landing of the last note that belongs to it. */
export function oknoWzrostu(j, r = RYTM) {
  const ostatnia = DOKUMENT_KARTECZKI.lastIndexOf(j);
  const od = oknoLotu(ostatnia, r)[1] * CZAS_MS;
  return [od / CZAS_MS, (od + r.wzrost) / CZAS_MS];
}

/**
 * The scene at time t (0 = the mess as built, 1 = four documents, no notes).
 * @param {number} t
 * @param {{ poz: number[], rotY: number }[]} poczatek  the seven notes where they lie
 * @param {{ poz: number[], rotY: number }[]} cele      the four documents where they end
 * @returns {{ karteczki: { poz: number[], obrot: number[], skala: number }[], dokumenty: number[] }}
 *   `dokumenty` = scale of each document, 0 (not there yet) to 1.
 */
export function ulozenie(t, poczatek, cele) {
  const q = ogranicz(t);
  const dokumenty = cele.map((_, j) => {
    const [od, ko] = oknoWzrostu(j);
    return gladko(ogranicz((q - od) / (ko - od)));
  });
  const karteczki = poczatek.map((k, i) => {
    const cel = cele[DOKUMENT_KARTECZKI[i]];
    const [od, ko] = oknoLotu(i);
    const u = ogranicz((q - od) / (ko - od));
    const e = gladko(u);
    const wStosie = DOKUMENT_KARTECZKI.slice(0, i).filter((d) => d === DOKUMENT_KARTECZKI[i]).length;
    const docelowa = [cel.poz[0], cel.poz[1] - POD_DOKUMENTEM - wStosie * KROK_STOSU, cel.poz[2]];
    const poz = k.poz.map((v, n) => mieszaj(v, docelowa[n], e));
    poz[1] += 4 * u * (1 - u) * LUK;
    const obrot = [Math.sin(Math.PI * u) * PRZECHYL, mieszaj(k.rotY, cel.rotY, e), 0];
    // the sheet takes over from the little pile the moment it starts to unfold: it starts at a note's
    // size and turn, right over the pile, so the swap does not show (a note left under it poked its
    // curled corner through the sheet)
    const skala = dokumenty[DOKUMENT_KARTECZKI[i]] > 0 ? 0 : 1;
    return { poz, obrot, skala };
  });
  return { karteczki, dokumenty };
}

/**
 * The phase of the peak, from where the camera is on the track (`p`, damped) and the clock.
 *  - "balagan": the notes lie scattered, no documents;
 *  - "gra": the animation runs since `start`;
 *  - "porzadek": four documents, notes gone.
 * The animation plays only when the camera reaches the peak's hold from above. A page opened or
 * jumped past the peak shows it ordered; it resets only when the camera goes back above the silence.
 * @param {{ faza: string, start: number }} stan
 * @param {{ p: number, teraz: number, granice: { reset: number, start: number, koniec: number } }} we
 */
export function nastepnaFaza(stan, { p, teraz, granice }) {
  if (p < granice.reset) return stan.faza === "balagan" ? stan : { faza: "balagan", start: 0 };
  if (stan.faza === "balagan") {
    if (p > granice.koniec) return { faza: "porzadek", start: 0 };
    if (p >= granice.start) return { faza: "gra", start: teraz };
    return stan;
  }
  if (stan.faza === "gra" && teraz - stan.start >= CZAS_MS) return { faza: "porzadek", start: 0 };
  return stan;
}

/** Animation time 0..1 for a phase. */
export function czasFazy(stan, teraz) {
  if (stan.faza === "balagan") return 0;
  if (stan.faza === "porzadek") return 1;
  return ogranicz((teraz - stan.start) / CZAS_MS);
}

/**
 * Track borders of the peak: reset above the silence (back at the Amnesia hold), start when the camera
 * reaches the peak's hold, "jumped past" after the next stop's flight began.
 * @param {{ odcinki: { poza: string, lotOd: number, postojOd: number, postojDo: number }[] }} tor
 */
export function graniceSzczytu(tor) {
  const i = tor.odcinki.findIndex((o) => o.poza === "porzadek");
  if (i < 1) throw new RangeError("the track has no peak");
  const cisza = tor.odcinki[i - 1];
  const o = tor.odcinki[i];
  const nast = tor.odcinki[i + 1];
  return { reset: cisza.lotOd, start: o.postojOd, koniec: nast ? nast.lotOd + (nast.postojOd - nast.lotOd) * 0.5 : 1 };
}
