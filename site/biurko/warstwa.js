// The fixed copy layer and the desk map. Scroll sets the camera's target; the camera's actual
// position (after damping) drives the copy, so text never arrives mid-flight.
import { postepPrzystanku } from "./kamera.js";

const PRZESUW_VH = 1.6; // copy rises at most this much while it fades, well under the 4vh cap

export function zamontujWarstwe({ tor, przekladka, scena, ekran, ograniczRuch }) {
  const przystanki = [...document.querySelectorAll("[data-przystanek]")]
    .sort((a, b) => Number(a.dataset.przystanek) - Number(b.dataset.przystanek));
  const linkiMapy = [...document.querySelectorAll(".mapa [data-cel]")];
  const korzen = document.documentElement;
  let droga = 1;

  function zmierz() {
    droga = tor.suma * window.innerHeight;
    przekladka.style.height = `${Math.round(droga + window.innerHeight)}px`;
  }

  const postep = () => (droga > 0 ? window.scrollY / droga : 0);

  function przyKlatce(stan) {
    stan.widocznosc.forEach((w, i) => {
      const el = przystanki[i];
      if (!el) return;
      el.style.opacity = String(w);
      el.style.transform = w < 1 ? `translateY(${((1 - w) * PRZESUW_VH).toFixed(3)}vh)` : "";
      el.style.visibility = w > 0.01 ? "visible" : "hidden";
      el.classList.toggle("jest", w > 0.5);
    });
    korzen.style.setProperty("--scrim", String(stan.widocznosc[0]));
    const wEkranu = stan.widocznosc[6];
    ekran.style.opacity = String(wEkranu);
    ekran.style.visibility = wEkranu > 0.01 ? "visible" : "hidden";
    ekran.classList.toggle("w-scenie", wEkranu > 0.5);
    linkiMapy.forEach((a) => {
      const nr = Number(a.dataset.cel);
      if (nr === stan.przystanek) a.setAttribute("aria-current", "step");
      else a.removeAttribute("aria-current");
      a.classList.toggle("byl", nr < stan.przystanek);
    });
  }

  function idzDo(nr, { natychmiast = false } = {}) {
    const top = postepPrzystanku(tor, nr) * droga;
    window.scrollTo({ top, behavior: natychmiast || ograniczRuch ? "auto" : "smooth" });
    if (natychmiast) scena.ustawPostep(postepPrzystanku(tor, nr), true);
    const naglowek = document.getElementById(`t-${nr}`);
    const skupienie = () => naglowek?.focus({ preventScroll: true });
    if (natychmiast || ograniczRuch) skupienie();
    else window.addEventListener("scrollend", skupienie, { once: true });
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest?.("a[data-cel]");
    if (!a) return;
    e.preventDefault();
    const nr = Number(a.dataset.cel);
    history.replaceState(null, "", a.getAttribute("href"));
    idzDo(nr);
  });

  window.addEventListener("scroll", () => scena.ustawPostep(postep()), { passive: true });
  window.addEventListener("resize", () => {
    const p = postep();
    zmierz();
    window.scrollTo({ top: p * droga, behavior: "auto" });
  });

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
  };
}
