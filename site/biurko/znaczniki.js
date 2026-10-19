// Click markers on the 3D desk: a small pulsing dot with a word next to each object that opens a drawer,
// and next to the laptop's display at the install stop, so a first visit knows what can be clicked
// (Łukasz, 2026-10-19: "nie domyśliłbym się w żaden sposób, że ja mogę coś klikać"). A marker shows only
// at its object's stop and goes for good once that object was opened. The markers repeat what the map's
// drawer links already offer, so they stay out of the accessibility tree.

/** The stop each marker belongs to (the map's numbers; drawers as in start.js, the display at install). */
export const PRZYSTANEK_ZNACZNIKA = Object.freeze({ dokumenty: 2, teczka: 3, laptop: 4, pudelko: 5, ekran: 6 });
const PROG_WIDOCZNOSCI = 0.5; // the stop's copy is up: the camera holds there, not passing by
const KLUCZ = "relai-biurko-zajrzane";
const NAD_EKRANEM_PX = 14;

/**
 * Names of the markers to show now.
 * @param {{ przystanek: number, widocznosc: number[], zajrzane: Set<string>, otwarta: string|null, przyblizony: boolean }} s
 */
export function ktoreZnaczniki({ przystanek, widocznosc, zajrzane, otwarta, przyblizony }) {
  if (otwarta || przyblizony || !(widocznosc[przystanek] > PROG_WIDOCZNOSCI)) return [];
  return Object.entries(PRZYSTANEK_ZNACZNIKA)
    .filter(([nazwa, nr]) => nr === przystanek && !zajrzane.has(nazwa))
    .map(([nazwa]) => nazwa);
}

function wczytaj() {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(KLUCZ) ?? "[]"));
  } catch {
    return new Set(); // storage off (private mode): the markers just come back next visit
  }
}

/**
 * @param {{ warstwa: HTMLElement|null, scena: { srodekNaEkranie(n: string): number[]|null },
 *   ekran: HTMLElement, szuflady: { otworz(n: string, skad?: Element): void, otwarta(): string|null },
 *   przyblizenie: () => string }} o
 */
export function zamontujZnaczniki({ warstwa, scena, ekran, szuflady, przyblizenie }) {
  if (!warstwa) return { przyKlatce() {}, odmontuj() {} };
  const zajrzane = wczytaj();
  const sygnal = new AbortController();
  const znaczniki = new Map();
  for (const nazwa of Object.keys(PRZYSTANEK_ZNACZNIKA)) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "znacznik";
    b.tabIndex = -1;
    b.dataset.znacznik = nazwa;
    const kropka = document.createElement("span");
    kropka.className = "znacznik__kropka";
    const tekst = document.createElement("span");
    tekst.className = "znacznik__tekst";
    tekst.textContent = nazwa === "ekran" ? warstwa.dataset.przybliz : warstwa.dataset.zajrzyj;
    b.append(kropka, tekst);
    // the display zooms in on its own click; a drawer marker opens its drawer. The click stops here: the
    // drawers' document listener would hit-test the object under the dot and open a drawer a second time
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      if (nazwa === "ekran") ekran.click();
      else szuflady.otworz(nazwa, b);
    }, { signal: sygnal.signal });
    warstwa.append(b);
    znaczniki.set(nazwa, b);
  }
  warstwa.hidden = false;

  const zapamietaj = (nazwa) => {
    if (zajrzane.has(nazwa)) return;
    zajrzane.add(nazwa);
    try { sessionStorage.setItem(KLUCZ, JSON.stringify([...zajrzane])); } catch { /* storage off */ }
  };

  const gdzie = (nazwa) => {
    if (nazwa !== "ekran") return scena.srodekNaEkranie(nazwa);
    // on the lid just above the display, so it never covers the commands on it
    const r = ekran.getBoundingClientRect();
    return r.width ? [r.left + r.width / 2, r.top - NAD_EKRANEM_PX] : null;
  };

  return {
    /** Each drawn frame: which markers show, and where. */
    przyKlatce(stan) {
      const otwarta = szuflady.otwarta();
      if (otwarta) zapamietaj(otwarta);
      const przyblizony = przyblizenie() === "przyblizony";
      if (przyblizony) zapamietaj("ekran");
      const pokaz = new Set(ktoreZnaczniki({ przystanek: stan.przystanek, widocznosc: stan.widocznosc, zajrzane, otwarta, przyblizony }));
      for (const [nazwa, b] of znaczniki) {
        const xy = pokaz.has(nazwa) ? gdzie(nazwa) : null;
        const jest = Boolean(xy) && xy[0] > 0 && xy[0] < window.innerWidth && xy[1] > 0 && xy[1] < window.innerHeight;
        b.classList.toggle("jest", jest);
        if (jest) b.style.translate = `${Math.round(xy[0])}px ${Math.round(xy[1])}px`;
      }
    },
    odmontuj() {
      sygnal.abort();
      for (const b of znaczniki.values()) b.remove();
      warstwa.hidden = true;
    },
  };
}
