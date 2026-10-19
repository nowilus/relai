// The film's own choreography on top of the engine. Sections scrolled downwards play their
// animation once, by themselves, when they come into view, and reset only after they have left the
// screen completely (Łukasz, E7: one animation per section, not a small action per wheel notch).
// Act 5 keeps the engine's horizontal pan with a wheel and scrolls natively under a finger; its card
// in the middle of the frame lifts.
// Pure timing and shape functions are exported for the tests; the engine is never edited.

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (x) => { const t = clamp01(x); return t * t * (3 - 2 * t); };
const easeInOut = (x) => { const t = clamp01(x); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

/* ------------------------------------------------------------- play once -- */

/**
 * The state of a once-section after an observation. It starts playing when its top has come far
 * enough into the frame (`wejscie`), and resets only when no part of it is on screen (`widac`).
 * @param {"czeka"|"gra"} stan @param {boolean} wejscie @param {boolean} widac
 * @returns {"czeka"|"gra"}
 */
export function nastepnyStan(stan, wejscie, widac) {
  if (stan === "czeka") return wejscie ? "gra" : "czeka";
  return widac ? "gra" : "czeka";
}

/** How far the section's top has to come into the frame before it plays (share of the viewport). */
export const PROG_WEJSCIA = 0.35;

/**
 * A section counts as off screen only when it is at least this far out (px). A section that merely
 * touches the frame's edge (act 2a at the very top of the page) is not on screen, so it resets.
 */
export const MARGINES_RESETU = 12;

/** How long each section's animation lasts (ms); scrolling down is held this long once it plays. */
export const CZAS_SEKCJI = Object.freeze({ amnezja: 1900, pamiec: 3500, plan: 2050, panel: 1750, instalacja: 1600 });

/** Extra hold for the smooth scroll that brings the section to the top of the frame (ms). */
export const DOSUNIECIE_MS = 450;

/**
 * Whether a scroll step is held back: only downwards, and only while a section is still playing.
 * @param {number} teraz @param {number} blokadaDo @param {number} kierunek >0 down, <0 up
 */
export function czyTrzymac(teraz, blokadaDo, kierunek) {
  return kierunek > 0 && teraz < blokadaDo;
}

/**
 * Watches every `[data-raz]` section: adds the class `gra` when it plays and removes it when the
 * section has left the screen. `naGranie[name]` / `naReset[name]` run page code for that section,
 * `naKazde(section)` runs whenever any section starts playing. Returns a stop function.
 */
export function zamontujRaz(naGranie = {}, naReset = {}, naKazde = () => {}, doc = document, win = window) {
  const sekcje = [...doc.querySelectorAll("[data-raz]")];
  if (!sekcje.length || !("IntersectionObserver" in win)) return () => {};
  const stan = new Map(sekcje.map((s) => [s, { stan: "czeka", wejscie: false, widac: false }]));
  const odswiez = (s) => {
    const z = stan.get(s);
    const nowy = nastepnyStan(z.stan, z.wejscie, z.widac);
    if (nowy === z.stan) return;
    z.stan = nowy;
    const nazwa = s.dataset.raz;
    s.classList.toggle("gra", nowy === "gra");
    (nowy === "gra" ? naGranie : naReset)[nazwa]?.(s);
    if (nowy === "gra") naKazde(s);
  };
  const obserwuj = (klucz, opcje) =>
    new win.IntersectionObserver((wpisy) => {
      for (const w of wpisy) {
        stan.get(w.target)[klucz] = w.isIntersecting;
        odswiez(w.target);
      }
    }, opcje);
  const wejscie = obserwuj("wejscie", { rootMargin: `0px 0px -${PROG_WEJSCIA * 100}% 0px`, threshold: 0 });
  const widac = obserwuj("widac", { rootMargin: `-${MARGINES_RESETU}px 0px`, threshold: 0 });
  for (const s of sekcje) { wejscie.observe(s); widac.observe(s); }
  return () => { wejscie.disconnect(); widac.disconnect(); };
}

/**
 * Holds scrolling down while a section plays (Łukasz: "it holds me a moment until the animation
 * ends, then I can scroll on"). The first held step brings the section to the top of the frame, so
 * the whole animation is in view. Scrolling up is never held. Returns { trzymaj(sekcja), stop }.
 */
export function zamontujPrzytrzymanie(win = window) {
  let blokadaDo = 0;
  let cel = 0;
  let ostatnieY = win.scrollY;
  let kierunek = 0; // of the last real scroll: >0 down, <0 up
  const teraz = () => win.performance.now();
  // Brings the section's top to the frame's top once. Called again only when the page has run past
  // it (momentum of the wheel), never on every held event, so two smooth scrolls never fight.
  const dosun = () => {
    if (win.scrollY > cel + 2 || win.scrollY < cel - 2) win.scrollTo({ top: cel, behavior: "smooth" });
  };
  const naPrzewiniecie = () => {
    const y = win.scrollY;
    if (y !== ostatnieY) kierunek = Math.sign(y - ostatnieY);
    ostatnieY = y;
    // Wheel momentum carried the page past the section while it plays: bring it back.
    if (teraz() < blokadaDo && y > cel + 2 && kierunek > 0) dosun();
  };
  const trzymaj = (sekcja) => {
    // Only on the way down. Coming back up into a section is never held, and a section reached by
    // the wheel's momentum while another one is held does not take the hold over.
    if (kierunek < 0 || teraz() < blokadaDo) return;
    const nazwa = sekcja.dataset.raz;
    cel = Math.round(sekcja.getBoundingClientRect().top + win.scrollY);
    blokadaDo = teraz() + DOSUNIECIE_MS + (CZAS_SEKCJI[nazwa] ?? 0);
    dosun();
  };
  const naKolko = (e) => {
    if (!czyTrzymac(teraz(), blokadaDo, e.deltaY)) return;
    e.preventDefault();
  };
  const KLAWISZE_W_DOL = new Set(["ArrowDown", "PageDown", " ", "End"]);
  const naKlawisz = (e) => {
    if (!KLAWISZE_W_DOL.has(e.key) || e.target?.closest?.("input, textarea, select, [contenteditable]")) return;
    if (!czyTrzymac(teraz(), blokadaDo, 1)) return;
    e.preventDefault();
  };
  let dotykY = 0;
  const naDotykStart = (e) => { dotykY = e.touches[0]?.clientY ?? 0; };
  const naDotyk = (e) => {
    const y = e.touches[0]?.clientY ?? dotykY;
    if (!czyTrzymac(teraz(), blokadaDo, dotykY - y)) return; // finger up = page down
    e.preventDefault();
  };
  win.addEventListener("scroll", naPrzewiniecie, { passive: true });
  win.addEventListener("wheel", naKolko, { passive: false });
  win.addEventListener("keydown", naKlawisz);
  win.addEventListener("touchstart", naDotykStart, { passive: true });
  win.addEventListener("touchmove", naDotyk, { passive: false });
  const stop = () => {
    win.removeEventListener("scroll", naPrzewiniecie);
    win.removeEventListener("wheel", naKolko);
    win.removeEventListener("keydown", naKlawisz);
    win.removeEventListener("touchstart", naDotykStart);
    win.removeEventListener("touchmove", naDotyk);
  };
  return { trzymaj, stop };
}

/* ------------------------------------------------------ act 2a: amnesia -- */

/** Where the notes lie on the desk: fractions of the section and a turn in degrees. */
// In template order (two notes per document: State, Journal, Lessons, Decisions), clear of the
// heading at the top left. Within the first lines and within the second lines the notes stand left
// to right in the order of their documents, so in act 2b two notes in the air never cross paths.
export const ROZSYPKA = Object.freeze([
  [0.035, 0.6, -6], [0.2, 0.7, 4], [0.47, 0.34, -3], [0.44, 0.56, 7],
  [0.62, 0.2, 3], [0.55, 0.66, -4], [0.76, 0.4, -5], [0.8, 0.16, 6],
]);

/** The order the notes drop onto the desk in (indices in template order), scattered on purpose. */
export const KOLEJNOSC_UPADKU = Object.freeze([4, 0, 6, 2, 7, 1, 5, 3]);

/** Act 2a timing in ms: the notes drop one after another, the sentences stack under the heading. */
export const AMNEZJA = Object.freeze({ start: 200, krokKarteczki: 140, upadek: 700, startZdan: 350, krokZdania: 450 });

/** Places the notes and gives each its turn in the drop. */
export function zamontujAmnezje(doc = document) {
  const karteczki = [...doc.querySelectorAll(".amnezja [data-karteczka]")];
  karteczki.forEach((k, i) => {
    const [x, y, r] = ROZSYPKA[i % ROZSYPKA.length];
    // fractions, not pixels: film.css places the note (and recomposes the desk on a phone)
    k.style.setProperty("--x", String(x));
    k.style.setProperty("--y", String(y));
    k.style.rotate = `${r}deg`;
    const kolej = KOLEJNOSC_UPADKU.indexOf(i);
    k.style.setProperty("--opoznienie", `${AMNEZJA.start + (kolej < 0 ? i : kolej) * AMNEZJA.krokKarteczki}ms`);
  });
  doc.querySelectorAll(".amnezja__zdanie").forEach((z, i) => {
    z.style.setProperty("--opoznienie", `${AMNEZJA.startZdan + i * AMNEZJA.krokZdania}ms`);
  });
}

/* --------------------------------------------- act 2b: memory, the peak -- */

/** How high a note rises on its way (px) and how much it grows at the top of the arc. */
export const LUK = Object.freeze({ wysokosc: 140, wzrost: 0.1 });

/**
 * Act 2b timing in ms: a flight lasts `czas`, the next starts `krok` later, so at most two notes
 * are in the air at once. The longest animation on the page (the peak).
 */
export const LOT = Object.freeze({ start: 350, krok: 350, czas: 700 });

/** When note n (in flight order) starts and lands, in ms. */
export function oknoLotu(n, l = LOT) {
  const od = l.start + n * l.krok;
  return [od, od + l.czas];
}

/** The whole flight of `n` notes, in ms. */
export function czasSzczytu(n, l = LOT) {
  return oknoLotu(n - 1, l)[1];
}

/**
 * A note t (0..1) of the way to its line: offset (x, y in px), turn, scale, lift, and the
 * opacities of the note and of the printed line that takes its place.
 * @param {number} t @param {{ dx: number, dy: number, r: number, s: number }} cel
 */
export function ksztaltLotu(t, cel) {
  const e = easeInOut(t);
  const uniesienie = Math.sin(Math.PI * e); // 0 on the desk, 1 at the top of the arc
  return {
    x: cel.dx * e,
    y: cel.dy * e - uniesienie * LUK.wysokosc,
    r: cel.r * (1 - e),
    s: 1 - (1 - cel.s) * e + uniesienie * LUK.wzrost,
    uniesienie,
    karteczka: 1 - smooth((t - 0.78) / 0.22),
    wpis: smooth((t - 0.7) / 0.3),
  };
}

/**
 * The note's shadow at a given lift: on the desk it is the note's own shadow (--cien-notki), in the
 * air it grows longer and softer, as a card lifted off the table.
 * @param {number} u lift, 0..1
 */
export function cienLotu(u) {
  const y = (14 + u * 26).toFixed(1);
  const blur = (30 + u * 30).toFixed(1);
  const a = (0.18 - u * 0.06).toFixed(3);
  return `0 2px 4px rgba(49, 44, 37, .1), 0 ${y}px ${blur}px rgba(49, 44, 37, ${a})`;
}

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
 * In act 2b the same scatter is squeezed into the band between the heading and the documents
 * (about 36 %–59 % of the section), so no note covers a document before it flies.
 */
export function yPamieci(y) {
  return 0.36 + (y - 0.16) * 0.42;
}

/** Keyframes of one flight, sampled from ksztaltLotu. */
export function klatkiLotu(cel, kroki = 16) {
  return Array.from({ length: kroki + 1 }, (_, k) => {
    const l = ksztaltLotu(k / kroki, cel);
    return {
      offset: k / kroki,
      opacity: +l.karteczka.toFixed(3),
      transform: `translate3d(${l.x.toFixed(1)}px, ${l.y.toFixed(1)}px, 0) rotate(${l.r.toFixed(2)}deg) scale(${l.s.toFixed(3)})`,
      boxShadow: cienLotu(l.uniesienie),
    };
  });
}

/**
 * Act 2b: copies the desk's notes into the flight layer (decoration, hidden from assistive tech)
 * and returns { graj, resetuj } for the once-section. Each note flies to its line and its
 * handwriting becomes the printed entry.
 */
export function zamontujPamiec(doc = document) {
  const sekcja = doc.querySelector('[data-raz="pamiec"]');
  const warstwa = sekcja?.querySelector("[data-lot]");
  const zrodla = [...doc.querySelectorAll(".amnezja [data-karteczka]")];
  const wpisy = sekcja ? [...sekcja.querySelectorAll("[data-wpis]")] : [];
  if (!sekcja || !warstwa || zrodla.length !== wpisy.length) return { graj() {}, resetuj() {} };
  const karteczki = zrodla.map((z, i) => {
    const k = z.cloneNode(true);
    k.removeAttribute("data-karteczka");
    k.style.removeProperty("--opoznienie");
    k.style.removeProperty("rotate"); // the turn is part of the flight's own transform
    const [x, y] = ROZSYPKA[i % ROZSYPKA.length];
    k.style.setProperty("--x", String(x));
    k.style.setProperty("--y", String(+yPamieci(y).toFixed(4)));
    warstwa.append(k);
    return k;
  });
  const docs = [...sekcja.querySelectorAll("[data-dokument]")];
  const kolejka = kolejnoscLotu(wpisy.map((w) => docs.indexOf(w.closest("[data-dokument]"))));
  let animacje = [];

  const graj = () => {
    resetuj();
    kolejka.forEach((i, n) => {
      const k = karteczki[i];
      const w = wpisy[i].getBoundingClientRect();
      const kr = k.getBoundingClientRect();
      const cel = {
        dx: w.left + Math.min(kr.width * 0.62, w.width) / 2 - (kr.left + kr.width / 2),
        dy: w.top + w.height / 2 - (kr.top + kr.height / 2),
        r: ROZSYPKA[i % ROZSYPKA.length][2],
        s: 0.62,
      };
      const [od] = oknoLotu(n);
      animacje.push(k.animate(klatkiLotu(cel), { duration: LOT.czas, delay: od, fill: "both", easing: "linear" }));
      animacje.push(wpisy[i].animate(
        [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }],
        { duration: LOT.czas * 0.3, delay: od + LOT.czas * 0.7, fill: "both", easing: "ease-out" },
      ));
    });
  };
  const resetuj = () => {
    for (const a of animacje) a.cancel();
    animacje = [];
  };
  return { graj, resetuj };
}

/* ------------------------------------------------------------ act 5: cards -- */

/** How much a card is lifted given its centre's distance from the frame's centre (px). */
export function uniesienieFiszki(odleglosc, szerokosc) {
  return 1 - smooth(Math.abs(odleglosc) / (szerokosc * 0.9));
}

/** Act 5: the card passing the middle of the frame rises and straightens. Returns a stop function. */
export function zamontujTasme(doc = document, win = window) {
  const fiszki = [...doc.querySelectorAll("[data-fiszka]")];
  if (!fiszki.length) return () => {};
  let ramka = 0;
  const rysuj = () => {
    ramka = win.requestAnimationFrame(rysuj);
    const srodek = win.innerWidth / 2;
    for (const f of fiszki) {
      const r = f.getBoundingClientRect();
      if (r.bottom < 0 || r.top > win.innerHeight) continue;
      const u = uniesienieFiszki(r.left + r.width / 2 - srodek, r.width);
      f.style.setProperty("--unies", u.toFixed(3));
      f.style.zIndex = u > 0.5 ? "2" : ""; // the exposed card lies over its neighbours
    }
  };
  ramka = win.requestAnimationFrame(rysuj);
  return () => win.cancelAnimationFrame(ramka);
}

/** A touch screen without a mouse: a finger, not a wheel, moves the page. */
export const ZAPYTANIE_DOTYKU = "(hover: none) and (pointer: coarse)";

/**
 * On a touch screen act 5 is not pinned: a vertical swipe moves the page on to the next section and a
 * sideways swipe moves the rail, which scrolls natively (Łukasz, 2026-10-19: "jeżeli horyzontalnie
 * swipe'uję ... to wtedy te komendy przewijam"). Runs before the engine mounts, which reads the
 * attributes once; the wheel's pan on a desktop is untouched. Returns whether it switched.
 * @param {Document} doc @param {boolean} dotyk
 */
export function tasmaNaDotyk(doc, dotyk) {
  const akt = doc.querySelector(".akt.komendy");
  if (!dotyk || !akt) return false;
  akt.setAttribute("data-sc-act", "flow");
  akt.removeAttribute("data-sc-span");
  akt.querySelector("[data-sc-stage]")?.removeAttribute("data-sc-stage");
  akt.querySelector("[data-sc-pan]")?.removeAttribute("data-sc-pan");
  doc.documentElement.classList.add("dotyk");
  return true;
}
