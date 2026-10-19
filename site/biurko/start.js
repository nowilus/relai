// Entry point. Content, configurator and version work without WebGL; the desk is added on top.
import { zamontujJezyk } from "../js/jezyk.js";
import { zamontujWersje } from "../js/wersja.js";
import { zamontuj } from "../js/konfigurator.js";
import { zamontujTelefon } from "../film/telefon.js"; // imported as is: the film's phone card, the same keys
import { zamontujZaslone } from "./zaslona.js";
import { jestProgramowa, nazwaGrafiki } from "./grafika.js";
import { zamontujMapePrzeplywu } from "./mapa-przeplywu.js";

const zaslona = zamontujZaslone();

function tekstyKonfiguratora(form) {
  const d = form.dataset;
  const uwagi = {};
  for (const p of form.querySelector("template[data-uwagi-teksty]").content.querySelectorAll("[data-klucz]")) {
    uwagi[p.dataset.klucz] = p.textContent;
  }
  return {
    jezyk: d.jezyk, uwagi, brakWyboru: d.brakWyboru, kopiuj: d.kopiujTekst,
    skopiowano: d.skopiowano, zaznaczono: d.zaznaczono, brakSchematu: d.brakSchematu,
  };
}

/** "brak" without WebGL2, "programowa" on a software rasterizer, else "ok". */
function grafika() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return "brak";
    const programowa = jestProgramowa(nazwaGrafiki(gl));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return programowa ? "programowa" : "ok";
  } catch {
    return "brak";
  }
}

/**
 * The hero poster and each stop's frame as still pictures: every template is cloned once, so the
 * pictures are fetched only here.
 */
function pokazPlakat() {
  for (const szablon of document.querySelectorAll("template[data-plakat]")) {
    if (szablon.dataset.wstawiony) continue;
    szablon.after(szablon.content.cloneNode(true));
    szablon.dataset.wstawiony = "1";
  }
}

// in the flow each drawer stands under the stop where its object lies on the desk (BIURKO_PLAKAT);
// stop numbers, not ids, because the ids are translated. The plan folder and the laptop bars are
// already readable on their frames, so those two drawers stay for screen readers only, and the map
// sends their links to the stop instead (Łukasz: "it repeats the same thing one under the other")
const SZUFLADA_PRZY = {
  dokumenty: { nr: 2 }, teczka: { nr: 3, wKadrze: true }, laptop: { nr: 4, wKadrze: true }, pudelko: { nr: 5 },
};

/** Moves each closed drawer right after its stop, so the reading order is the order on screen. */
function szufladyPrzyPrzystankach() {
  for (const [nazwa, { nr, wKadrze }] of Object.entries(SZUFLADA_PRZY)) {
    const szuflada = document.querySelector(`[data-szuflada="${nazwa}"]`);
    const przystanek = document.querySelector(`[data-przystanek="${nr}"]`);
    if (!szuflada || !przystanek || szuflada.open) continue;
    przystanek.after(szuflada);
    if (!wKadrze) continue;
    szuflada.classList.add("szuflada--w-kadrze");
    const link = document.querySelector(`a[data-szuflada-cel="${nazwa}"]`);
    if (link && przystanek.id) link.setAttribute("href", `#${przystanek.id}`);
  }
}

const NOTATKA_ZWINIETA = "relai-brak-sceny-zwinieta";

/**
 * The scene-less note pinned in a corner. Open, it says why the desk is photos and how to turn 3D on;
 * folded (× or the first scroll, and from the start on a phone, where it would cover the cards) it is a
 * one-line tab that opens it with the steps showing. A fold by × holds for the visit.
 */
function zamontujNotatke(notatka) {
  const zakladka = notatka.querySelector("[data-rozwin]");
  const jak = notatka.querySelector("details");
  const ustaw = (zwinieta) => {
    notatka.classList.toggle("zwinieta", zwinieta);
    zakladka.setAttribute("aria-expanded", String(!zwinieta));
  };
  notatka.querySelector("[data-zwin]").addEventListener("click", () => {
    ustaw(true);
    try { sessionStorage.setItem(NOTATKA_ZWINIETA, "1"); } catch { /* storage off: no memory */ }
    zakladka.focus();
  });
  zakladka.addEventListener("click", () => {
    ustaw(false);
    if (jak) jak.open = true;
    // the tab hides as the note opens: focus goes to the steps' summary (and the open note turns opaque)
    jak?.querySelector("summary")?.focus();
    try { sessionStorage.removeItem(NOTATKA_ZWINIETA); } catch { /* storage off */ }
  });
  let zwinietaWczesniej = false;
  try { zwinietaWczesniej = sessionStorage.getItem(NOTATKA_ZWINIETA) === "1"; } catch { /* storage off */ }
  ustaw(zwinietaWczesniej || window.matchMedia("(max-width: 600px)").matches);
  // the first scroll folds an open note, so it never sits over the reading for long
  window.addEventListener("scroll", () => { if (!notatka.contains(document.activeElement)) ustaw(true); }, { once: true, passive: true });
}

/**
 * The page without the scene: the same content in the flow, with the poster behind the hero copy.
 * With reduced motion this is a choice, not a failure, so the "no 3D" note stays hidden.
 */
function bezSceny(powod, { komunikat = true } = {}) {
  zaslona.blad();
  document.documentElement.classList.remove("tryb-3d");
  pokazPlakat();
  szufladyPrzyPrzystankach();
  zamontujMapePrzeplywu(); // the header map lights its dots as the page scrolls, as over the scene
  const notatka = document.querySelector("[data-brak-sceny]");
  if (komunikat && notatka) {
    notatka.removeAttribute("hidden");
    zamontujNotatke(notatka);
  }
  if (powod) console.warn(`RelAI: the desk scene is off (${powod}); the page shows the same content without it.`);
}

zamontujJezyk();
const form = document.querySelector("[data-konfigurator]");
zamontuj(form, tekstyKonfiguratora(form));
form.querySelector("[data-kopiuj]").removeAttribute("hidden");
zamontujWersje();
zamontujTelefon();

// reduced motion gets the flow with the poster (Łukasz, E6), and the scene is not even downloaded
const ograniczonyRuch = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const karta = ograniczonyRuch ? null : grafika();
if (ograniczonyRuch) {
  bezSceny(undefined, { komunikat: false });
} else if (karta === "brak") {
  bezSceny();
} else if (karta === "programowa") {
  bezSceny("software rendering");
} else {
  try {
    const { uruchom } = await import("./swiat.js");
    await uruchom({ bezSceny, zaslona });
  } catch (e) {
    bezSceny(e instanceof Error ? e.message : String(e));
  }
}
