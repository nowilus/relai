// Entry point of the film. Content and the configurator work without the engine; the engine
// (vendor/scrollcraft, loaded before this module) adds the motion, and the loading card covers the
// moments in between.
import { zamontujJezyk } from "../js/jezyk.js";
import { zamontujWersje } from "../js/wersja.js";
import { zamontuj } from "../js/konfigurator.js";
import { utworzZaslone } from "./zaslona.js";
import { ustawOkna, zamontujPamiec, zamontujPanel } from "./akty.js";

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

const klatka = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

const root = document.documentElement;
const zaslona = utworzZaslone(root);
const czcionki = document.fonts?.ready ?? Promise.resolve();
czcionki.then(() => zaslona.krok(1));

zamontujJezyk();
const form = document.querySelector("[data-konfigurator]");
zamontuj(form, tekstyKonfiguratora(form));
form.querySelector("[data-kopiuj]").removeAttribute("hidden");
zamontujWersje();

const ruch = !matchMedia("(prefers-reduced-motion: reduce)").matches;

async function uruchom() {
  const silnik = window.ScrollCraft;
  if (!silnik || typeof silnik.mount !== "function") throw new Error("the scroll engine did not load");
  if (!ruch) {
    // Without motion act 2 is an ordinary section: nothing to pin and nothing to fly.
    const pamiec = document.querySelector('[data-akt="pamiec"]');
    pamiec?.setAttribute("data-sc-act", "flow");
    pamiec?.removeAttribute("data-sc-span");
  }
  ustawOkna(document);
  const api = silnik.mount(document.body);
  zaslona.krok(2);
  await czcionki;
  if (ruch) {
    root.classList.add("ruch");
    api.layout();
    zamontujPamiec(api);
    zamontujPanel(api);
  }
  await klatka();
  zaslona.gotowe();
}

uruchom().catch((e) => {
  root.classList.remove("ruch");
  zaslona.blad();
  console.warn(`RelAI: the film's motion is off (${e instanceof Error ? e.message : String(e)}); the page shows the same content without it.`);
});
