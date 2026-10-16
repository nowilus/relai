// The camera's road over the desk: one track, stops with a hold, one authored silence before the peak.
// Pure: no DOM, no three.js. Units: metres in the scene, "track units" for scroll length.

/** Camera poses. Index = the stop number on the map; "cisza" is the silence, not a stop. */
export const POZY = Object.freeze({
  biurko:     { poz: [-0.3, 1.14, 1.2], cel: [-0.02, 0.98, -0.45], fov: 40 },
  amnezja:    { poz: [0.02, 1.22, 0.66], cel: [0.12, 0.75, 0.17], fov: 40 },
  cisza:      { poz: [0.06, 1.42, 0.58], cel: [0.13, 0.75, 0.1], fov: 40 },
  porzadek:   { poz: [0.14, 1.28, 0.44], cel: [0.16, 0.75, -0.12], fov: 40 },
  plan:       { poz: [0.31, 1.26, 0.36], cel: [0.35, 0.76, -0.15], fov: 40 },
  panel:      { poz: [0.1, 1.06, 0.88], cel: [0.4, 0.9, 0.1], fov: 40 },
  komendy:    { poz: [0.18, 1.1, 0.02], cel: [0.25, 0.8, -0.44], fov: 40 },
  instalacja: { poz: [0.4, 0.96, 0.6], cel: [0.54, 0.9, 0.14], fov: 40 },
});

/**
 * The track in order. `wejscie` = flight in from the previous key, `postoj` = hold at the key.
 * `tekst` = index of the copy block shown during the hold, or null for authored silence.
 * The peak (porzadek) gets the longest span: its flight plus hold is 2.2 against 1.0 elsewhere.
 */
export const KLUCZE = Object.freeze([
  { poza: "biurko", tekst: 0, wejscie: 0, postoj: 0.5 },
  { poza: "amnezja", tekst: 1, wejscie: 0.55, postoj: 0.45 },
  { poza: "cisza", tekst: null, wejscie: 0.25, postoj: 0.35 },
  { poza: "porzadek", tekst: 2, wejscie: 0.9, postoj: 1.3 },
  { poza: "plan", tekst: 3, wejscie: 0.55, postoj: 0.45 },
  { poza: "panel", tekst: 4, wejscie: 0.55, postoj: 0.45 },
  { poza: "komendy", tekst: 5, wejscie: 0.55, postoj: 0.45 },
  { poza: "instalacja", tekst: 6, wejscie: 0.55, postoj: 0.65 },
]);

export const LICZBA_TEKSTOW = 7;
const RAMPA = 0.3; // share of the neighbouring flight used to fade copy in or out
const UNIES = 0.07; // how much the camera rises mid-flight, metres

const gladko = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const mieszaj = (a, b, t) => a + (b - a) * t;
const mieszajWektor = (a, b, t) => a.map((v, i) => mieszaj(v, b[i], t));
const ogranicz = (t) => Math.min(1, Math.max(0, t));

/** Lays the keys on a 0..1 track: start/end of each flight and hold. */
export function zbudujTor(klucze = KLUCZE) {
  const suma = klucze.reduce((s, k) => s + k.wejscie + k.postoj, 0);
  let t = 0;
  const odcinki = klucze.map((k) => {
    const lotOd = t / suma;
    t += k.wejscie;
    const postojOd = t / suma;
    t += k.postoj;
    return Object.freeze({ ...k, lotOd, postojOd, postojDo: t / suma });
  });
  return Object.freeze({ odcinki: Object.freeze(odcinki), suma });
}

function widocznosc(tor, p) {
  const wynik = new Array(LICZBA_TEKSTOW).fill(0);
  const { odcinki } = tor;
  odcinki.forEach((o, i) => {
    if (o.tekst === null) return;
    const lotDo = o.postojOd - o.lotOd;
    const nastepny = odcinki[i + 1];
    const wyjscie = nastepny ? nastepny.postojOd - nastepny.lotOd : 0;
    let w;
    if (i === 0) {
      // the hero is there from the first pixel and gone by 0.62 of the first flight
      const koniec = nastepny ? o.postojDo + wyjscie * 0.62 : 1;
      w = p <= o.postojDo ? 1 : 1 - ogranicz((p - o.postojDo) / (koniec - o.postojDo));
    } else if (!nastepny) {
      // the close fades in from 0.4 of the last flight and holds to the end
      const start = o.lotOd + lotDo * 0.4;
      w = ogranicz((p - start) / (o.postojOd - start));
    } else {
      const wejscieOd = o.postojOd - lotDo * RAMPA;
      const wyjscieDo = o.postojDo + wyjscie * RAMPA;
      if (p < wejscieOd || p > wyjscieDo) w = 0;
      else if (p < o.postojOd) w = (p - wejscieOd) / (o.postojOd - wejscieOd);
      else if (p <= o.postojDo) w = 1;
      else w = 1 - (p - o.postojDo) / (wyjscieDo - o.postojDo);
    }
    wynik[o.tekst] = gladko(ogranicz(w));
  });
  return wynik;
}

/** Camera pose and copy visibility for track progress p (0..1). */
export function poza(tor, p, pozy = POZY) {
  const q = ogranicz(p);
  const { odcinki } = tor;
  let i = odcinki.length - 1;
  while (i > 0 && q < odcinki[i].lotOd) i--;
  const o = odcinki[i];
  const tu = pozy[o.poza];
  let poz = tu.poz;
  let cel = tu.cel;
  let fov = tu.fov;
  if (i > 0 && q < o.postojOd) {
    const skad = pozy[odcinki[i - 1].poza];
    const t = gladko((q - o.lotOd) / (o.postojOd - o.lotOd));
    poz = mieszajWektor(skad.poz, tu.poz, t);
    poz[1] += Math.sin(Math.PI * t) * UNIES;
    cel = mieszajWektor(skad.cel, tu.cel, t);
    fov = mieszaj(skad.fov, tu.fov, t);
  }
  const w = widocznosc(tor, q);
  return { poz: [...poz], cel: [...cel], fov, widocznosc: w, przystanek: aktualnyPrzystanek(tor, q) };
}

/** The map stop the camera is at or flying to (silence counts as the way to the peak). */
export function aktualnyPrzystanek(tor, p) {
  let wynik = 0;
  for (const o of tor.odcinki) {
    if (o.tekst === null) continue;
    if (p >= o.lotOd + (o.postojOd - o.lotOd) * 0.5) wynik = o.tekst;
  }
  return wynik;
}

/** Track progress at the middle of a stop's hold: where a map click scrolls to. */
export function postepPrzystanku(tor, nr) {
  const o = tor.odcinki.find((x) => x.tekst === nr);
  if (!o) throw new RangeError(`no stop ${nr}`);
  return nr === 0 ? 0 : (o.postojOd + o.postojDo) / 2;
}
