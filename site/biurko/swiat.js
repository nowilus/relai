// Switches the page from document flow to the one fixed desk scene.
import { zbudujScene } from "./scena.js";
import { zamontujWarstwe } from "./warstwa.js";
import { zamontujSzuflady } from "./szuflady.js";
import { zamontujZnaczniki } from "./znaczniki.js";
import { zbudujTor } from "./kamera.js";
import { etapPierwszy, etapDrugi } from "./zasoby.js";
import { DefaultLoadingManager } from "three";
import { postepZPlikow } from "./zaslona.js";

// files both loading stages request (textures, models with their parts, the HDR; 17 in stage one),
// measured with the Performance API; the loader learns the parts of a model only while it reads it,
// so this count is the floor that keeps the curtain's line from running ahead early
const PLIKI_RAZEM = 62;

const dwieKlatki = () => new Promise((gotowe) => requestAnimationFrame(() => requestAnimationFrame(gotowe)));

const FONTY = ["400 58px Kalam", "700 250px Kalam", "500 92px Fraunces", "500 34px 'JetBrains Mono'", "500 24px 'Hanken Grotesk'"];

/** The bar mock-up (site/dane/makiety.json, built into the page) as plain data for the laptop screen. */
function makieta(el) {
  const dane = (x) => (x ? { ...x.dataset } : null);
  return {
    kolory: { ...el.dataset },
    paski: [...el.querySelectorAll("[data-pasek]")].map((p) => ({
      ...p.dataset,
      plan: dane(p.querySelector("[data-plan]")),
      postep: dane(p.querySelector("[data-postep]")),
      segmenty: [...p.querySelectorAll("[data-segment]")].map((i) => i.dataset.segment),
      baterie: [...p.querySelectorAll("[data-bateria]")].map(dane),
      kontekst: dane(p.querySelector("[data-kontekst]")),
    })),
  };
}

function slowaSceny() {
  const szablon = document.querySelector("template[data-slowa-sceny]");
  const t = szablon.content;
  return {
    karteczki: [...t.querySelectorAll("[data-karteczka]")].map((p) => p.textContent),
    dokumenty: [...t.querySelectorAll("[data-dokument]")].map((p) => [p.textContent, p.dataset.plik]),
    teczka: t.querySelector("[data-teczka]").textContent,
    etapy: [...t.querySelectorAll("[data-etap]")].map((p) => ({ nazwa: p.textContent, stan: p.dataset.stan })),
    makieta: makieta(t.querySelector("[data-makieta]")),
    fiszki: [...t.querySelectorAll("[data-fiszka]")].map((p) => [p.textContent, p.dataset.nazwa]),
  };
}

/**
 * Loads the first stage of assets (a failure here throws, and the page stays in flow mode), draws the
 * first frame, then loads the rest in the background; a failure there also drops back to flow mode.
 * @param {{ bezSceny: (powod?: string) => void }} opcje
 */
export async function uruchom({ bezSceny, zaslona }) {
  DefaultLoadingManager.onProgress = (_, gotowe, wszystkie) => {
    zaslona.postep(postepZPlikow(gotowe, wszystkie, PLIKI_RAZEM));
  };
  const [zasoby] = await Promise.all([etapPierwszy(), ...FONTY.map((f) => document.fonts.load(f))]);
  const ograniczRuch = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tor = zbudujTor();
  const kontener = document.querySelector("[data-scena]");
  const ekran = document.querySelector("[data-ekran]");
  let warstwa = null;
  let znaczniki = null;
  // 3D mode before the scene is built: building it sizes the laptop display to 1136 px, and in the
  // document flow that overflows a phone, which then zooms out and the scene measures a 1156 px window.
  // In 3D mode the display sits in the fixed layer, which never widens the page. bezSceny() undoes it.
  document.documentElement.classList.add("tryb-3d");
  const scena = zbudujScene({
    kontener, slowa: slowaSceny(), zasoby, ekran, tor, ograniczRuch,
    przyKlatce: (stan) => {
      warstwa?.przyKlatce(stan);
      znaczniki?.przyKlatce(stan);
    },
  });
  warstwa = zamontujWarstwe({ tor, przekladka: document.querySelector("[data-przekladka]"), scena, ekran, ograniczRuch });
  const szuflady = zamontujSzuflady({ scena, ograniczRuch });
  znaczniki = zamontujZnaczniki({
    warstwa: document.querySelector("[data-znaczniki]"), scena, ekran, szuflady, przyblizenie: warstwa.przyblizenie,
  });
  warstwa.start(); // after the markers: its first frame places them at a stop reached from the address
  // whatever ends the scene, the configurator goes back into the document flow first; once only, since
  // a lost context and a failed stage two can both arrive while stage two is loading
  let skonczona = false;
  const koniecSceny = (powod) => {
    if (skonczona) return;
    skonczona = true;
    DefaultLoadingManager.onProgress = () => {};
    znaczniki.odmontuj();
    szuflady.odmontuj();
    warstwa.odmontuj();
    scena.oddajEkran();
    bezSceny(powod);
  };
  scena.canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    koniecSceny();
  });
  window.__biurko = Object.freeze({
    diagnostyka: scena.diagnostyka, wyczyscPomiar: scena.wyczyscPomiar, obnizJakosc: scena.obnizJakosc, tor, obiekty: scena.obiekty, scena: scena.scena,
    przyblizenie: warstwa.przyblizenie, szuflada: szuflady.otwarta, trafienie: scena.trafienie,
  });
  // the first frame is drawn under the curtain (its shaders compile now); the curtain waits for stage
  // two as well, because stage two changes the hero (plant, frames, clock, notepads: 3.7 % of the
  // pixels on a slow phone), and the visitor should not watch the desk fill in
  await dwieKlatki();
  let B;
  try {
    B = await etapDrugi();
  } catch (e) {
    koniecSceny(e instanceof Error ? e.message : String(e));
    return;
  }
  if (skonczona) return; // the context was lost meanwhile: the page is already in the flow
  scena.uzupelnij(B);
  await dwieKlatki();
  if (skonczona) return;
  DefaultLoadingManager.onProgress = () => {};
  zaslona.gotowe();
}
