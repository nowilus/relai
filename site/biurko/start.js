// Entry point. Content, configurator and version work without WebGL; the desk is added on top.
import { zamontujJezyk } from "../js/jezyk.js";
import { zamontujWersje } from "../js/wersja.js";
import { zamontuj } from "../js/konfigurator.js";
import { zamontujTelefon } from "../film/telefon.js"; // imported as is: the film's phone card, the same keys
import { zamontujZaslone } from "./zaslona.js";

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

function maWebGL2() {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

function bezSceny(powod) {
  zaslona.blad();
  document.documentElement.classList.remove("tryb-3d");
  document.querySelector("[data-brak-sceny]")?.removeAttribute("hidden");
  if (powod) console.warn(`RelAI: the desk scene is off (${powod}); the page shows the same content without it.`);
}

zamontujJezyk();
const form = document.querySelector("[data-konfigurator]");
zamontuj(form, tekstyKonfiguratora(form));
form.querySelector("[data-kopiuj]").removeAttribute("hidden");
zamontujWersje();
zamontujTelefon();

if (!maWebGL2()) {
  bezSceny();
} else {
  try {
    const { uruchom } = await import("./swiat.js");
    await uruchom({ bezSceny, zaslona });
  } catch (e) {
    bezSceny(e instanceof Error ? e.message : String(e));
  }
}
