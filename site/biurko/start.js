// Entry point. Content, configurator and version work without WebGL; the desk is added on top.
import { zamontujJezyk } from "../js/jezyk.js";
import { zamontujWersje } from "../js/wersja.js";
import { zamontuj } from "../js/konfigurator.js";
import { zamontujTelefon } from "../film/telefon.js"; // imported as is: the film's phone card, the same keys
import { zamontujZaslone } from "./zaslona.js";
import { jestProgramowa, nazwaGrafiki } from "./grafika.js";

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

/** The hero frame as a still picture: the template is cloned once, so the poster is fetched only here. */
function pokazPlakat() {
  const szablon = document.querySelector("template[data-plakat]");
  if (szablon && !document.querySelector(".plakat")) szablon.after(szablon.content.cloneNode(true));
}

/**
 * The page without the scene: the same content in the flow, with the poster behind the hero copy.
 * With reduced motion this is a choice, not a failure, so the "no 3D" note stays hidden.
 */
function bezSceny(powod, { komunikat = true } = {}) {
  zaslona.blad();
  document.documentElement.classList.remove("tryb-3d");
  pokazPlakat();
  if (komunikat) document.querySelector("[data-brak-sceny]")?.removeAttribute("hidden");
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
