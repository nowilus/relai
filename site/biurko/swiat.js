// Switches the page from document flow to the one fixed desk scene.
import { zbudujScene } from "./scena.js";
import { zamontujWarstwe } from "./warstwa.js";
import { zbudujTor } from "./kamera.js";

const FONTY = ["400 58px Kalam", "700 250px Kalam", "500 92px Fraunces", "500 34px 'JetBrains Mono'", "500 24px 'Hanken Grotesk'"];

function slowaSceny() {
  const szablon = document.querySelector("template[data-slowa-sceny]");
  const t = szablon.content;
  return {
    karteczki: [...t.querySelectorAll("[data-karteczka]")].map((p) => p.textContent),
    dokumenty: [...t.querySelectorAll("[data-dokument]")].map((p) => [p.textContent, p.dataset.plik]),
    teczka: t.querySelector("[data-teczka]").textContent,
  };
}

export async function uruchom() {
  await Promise.all(FONTY.map((f) => document.fonts.load(f)));
  const ograniczRuch = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tor = zbudujTor();
  const kontener = document.querySelector("[data-scena]");
  const ekran = document.querySelector("[data-ekran]");
  let warstwa = null;
  const scena = zbudujScene({
    kontener, slowa: slowaSceny(), ekran, tor, ograniczRuch,
    przyKlatce: (stan) => warstwa?.przyKlatce(stan),
  });
  document.documentElement.classList.add("tryb-3d");
  warstwa = zamontujWarstwe({ tor, przekladka: document.querySelector("[data-przekladka]"), scena, ekran, ograniczRuch });
  warstwa.start();
  scena.canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    document.documentElement.classList.remove("tryb-3d");
    document.querySelector("[data-brak-sceny]")?.removeAttribute("hidden");
  });
  window.__biurko = Object.freeze({ diagnostyka: scena.diagnostyka, wyczyscPomiar: scena.wyczyscPomiar, tor });
}
