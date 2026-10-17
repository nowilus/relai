// The fixed copy layer and the desk map. Scroll sets the camera's target; the camera's actual
// position (after damping) drives the copy, so text never arrives mid-flight.
import { postepPrzystanku, ulamekMapy } from "./kamera.js";
import { przejscie } from "./przyblizenie.js";

const PRZESUW_VH = 1.6; // copy rises at most this much while it fades, well under the 4vh cap
const PRZYSTANEK_EKRANU = 6; // the install stop: the laptop display carries the configurator
const WSTECZ_PX = 2; // a scroll back by more than this leaves the close-up
// one track unit is this share of the window's height: a stop is three or four wheel notches, not seven
// (Łukasz, E6: "not ten scrolls for the notes to turn into documents")
const SKALA_DROGI = 0.45;

export function zamontujWarstwe({ tor, przekladka, scena, ekran, ograniczRuch }) {
  const przystanki = [...document.querySelectorAll("[data-przystanek]")]
    .sort((a, b) => Number(a.dataset.przystanek) - Number(b.dataset.przystanek));
  const linkiMapy = [...document.querySelectorAll(".mapa [data-cel]")];
  const osMapy = document.querySelector(".mapa__lista");
  let ulamekOsi = -1;
  const korzen = document.documentElement;
  const sygnal = new AbortController();
  const nasluch = { signal: sygnal.signal };
  let droga = 1;
  let zblizenie = "przystanek";
  let naPrzystanku = false;
  let ostatnieY = window.scrollY;

  function zmierz() {
    droga = tor.suma * window.innerHeight * SKALA_DROGI;
    przekladka.style.height = `${Math.round(droga + window.innerHeight)}px`;
  }

  /** Every stop's scroll offset (the middle of its hold). The silence is not a stop: the camera flies over it. */
  const punkty = () => przystanki.map((_, nr) => Math.round(postepPrzystanku(tor, nr) * droga));

  const postep = () => (droga > 0 ? window.scrollY / droga : 0);

  /** Runs one close-up event; returns true when the state changed. */
  function zdarzenie(nazwa) {
    const nowy = przejscie(zblizenie, nazwa, { naPrzystanku });
    if (nowy === zblizenie) return false;
    zblizenie = nowy;
    korzen.classList.toggle("przyblizony", nowy === "przyblizony");
    scena.ustawPrzyblizenie(nowy === "przyblizony" ? 1 : 0);
    return true;
  }

  function przyKlatce(stan) {
    stan.widocznosc.forEach((w, i) => {
      const el = przystanki[i];
      if (!el) return;
      el.style.opacity = String(w);
      // the install stop holds the 3D display layer: moving it would slide the screen off the laptop
      if (i !== PRZYSTANEK_EKRANU) el.style.transform = w < 1 ? `translateY(${((1 - w) * PRZESUW_VH).toFixed(3)}vh)` : "";
      el.style.visibility = w > 0.01 ? "visible" : "hidden";
      el.classList.toggle("jest", w > 0.5);
    });
    korzen.style.setProperty("--scrim", String(stan.widocznosc[0]));
    const wEkranu = stan.widocznosc[PRZYSTANEK_EKRANU];
    ekran.style.visibility = wEkranu > 0.01 ? "visible" : "hidden";
    naPrzystanku = wEkranu > 0.5;
    ekran.classList.toggle("w-scenie", naPrzystanku);
    if (!naPrzystanku) zdarzenie("opuszczony");
    linkiMapy.forEach((a) => {
      const nr = Number(a.dataset.cel);
      if (nr === stan.przystanek) a.setAttribute("aria-current", "step");
      else a.removeAttribute("aria-current");
      a.classList.toggle("byl", nr < stan.przystanek);
    });
    // the axis fill follows the camera, not the scroll, so it meets a dot when the camera holds there
    const u = Math.round(ulamekMapy(tor, stan.postep) * 1000) / 1000;
    if (osMapy && u !== ulamekOsi) {
      ulamekOsi = u;
      osMapy.style.setProperty("--postep-osi", String(u));
    }
  }

  // Plain scrolling, nothing held (Łukasz, E6: "we do not block until the animation ends", after four
  // rounds of stepped, held moves). The camera follows the scroll with a slow damping; the peak plays
  // once, in time, when the camera reaches it, and the visitor may scroll on while it plays.
  function idzDo(nr, { natychmiast = false } = {}) {
    scena.skok(postepPrzystanku(tor, nr));
    const top = postepPrzystanku(tor, nr) * droga;
    window.scrollTo({ top, behavior: natychmiast || ograniczRuch ? "auto" : "smooth" });
    if (natychmiast) scena.ustawPostep(postepPrzystanku(tor, nr), true);
    const naglowek = document.getElementById(`t-${nr}`);
    const skupienie = () => naglowek?.focus({ preventScroll: true });
    if (natychmiast || ograniczRuch) skupienie();
    else window.addEventListener("scrollend", skupienie, { once: true, signal: sygnal.signal });
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest?.("a[data-cel]");
    if (!a) return;
    e.preventDefault();
    const nr = Number(a.dataset.cel);
    history.replaceState(null, "", a.getAttribute("href"));
    idzDo(nr);
  }, nasluch);

  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (y < ostatnieY - WSTECZ_PX) zdarzenie("wstecz");
    ostatnieY = y;
    scena.ustawPostep(postep());
  }, { passive: true, signal: sygnal.signal });
  window.addEventListener("resize", () => {
    const p = postep();
    zmierz();
    // our own scroll keeps the place on the track; it is not the visitor scrolling back
    ostatnieY = Math.round(p * droga);
    window.scrollTo({ top: p * droga, behavior: "auto" });
  }, nasluch);

  // the display: a click or Enter brings the camera close; a control taking focus does the same, so
  // a keyboard user always sees what they are changing
  ekran.setAttribute("tabindex", "0");
  ekran.setAttribute("role", "group");
  if (ekran.dataset.etykieta) ekran.setAttribute("aria-label", ekran.dataset.etykieta);
  ekran.addEventListener("click", (e) => {
    if (zblizenie === "przyblizony") return;
    if (zdarzenie("klik")) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, { capture: true, signal: sygnal.signal });
  ekran.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target === ekran) zdarzenie("enter");
  }, nasluch);
  ekran.addEventListener("focusin", (e) => {
    if (e.target !== ekran) zdarzenie("fokus");
  }, nasluch);
  const oddal = (nazwa) => {
    if (!zdarzenie(nazwa)) return;
    if (ekran.contains(document.activeElement)) ekran.focus({ preventScroll: true });
  };
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") oddal("esc");
  }, nasluch);
  ekran.querySelector("[data-wroc]")?.addEventListener("click", () => oddal("wroc"), nasluch);

  zmierz();
  return {
    przyKlatce,
    start() {
      const id = decodeURIComponent(location.hash.slice(1));
      const cel = id ? document.getElementById(id) : null;
      const nr = cel?.dataset.przystanek;
      if (nr !== undefined) idzDo(Number(nr), { natychmiast: true });
      else scena.ustawPostep(postep(), true);
    },
    /** Close-up state, for verification. */
    przyblizenie: () => zblizenie,
    /** The scene is gone: listeners off, the display attributes and the close-up class removed. */
    odmontuj() {
      sygnal.abort();
      korzen.classList.remove("przyblizony");
      for (const a of ["tabindex", "role", "aria-label"]) ekran.removeAttribute(a);
      for (const el of przystanki) for (const w of ["opacity", "transform", "visibility"]) el.style.removeProperty(w);
      osMapy?.style.removeProperty("--postep-osi");
      przekladka.style.removeProperty("height");
    },
  };
}
