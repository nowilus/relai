// Renders the poster for the page without a live scene (reduced motion, no WebGL, software rendering,
// no JavaScript): the hero frame and one frame per stop drawn by the scene itself, with the copy, header
// and map hidden, into site/grafika/plakat/ — landscape 1366 x 768 (a stop: 1920 x 1080) at 1x and
// portrait 390 x 844 at 2x, JPEG.
// Needs the preview server (see site/README.md) and Chrome; no packages, the DevTools protocol over
// Node's global WebSocket (Node 22+).
// node site/narzedzia/plakat.mjs [--url http://localhost:4520/pl/biurko/] [--jakosc 78] [--tylko hero,amnezja]
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i < 0 ? d : process.argv[i + 1]; };
const ADRES = arg("url", "http://localhost:4520/pl/biurko/"); // the desk moved under biurko/ in E8
const JAKOSC = Number(arg("jakosc", "78"));
const CHROME = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9360;
const WYJSCIE = join(dirname(fileURLToPath(import.meta.url)), "..", "grafika", "plakat");
// opacity, not visibility: a visible stop sets visibility on itself and would win over its parent;
// the vignette and grain stay out of the JPEG (they cost bytes), the page lays them over it in CSS
const UKRYJ = ".przystanek, .pasek, .mapa, .przekladka { opacity: 0 !important; } .tryb-3d .scena::before { display: none !important; }";
const UKLADY = [
  { nazwa: "poziomy", szer: 1366, wys: 768, dpr: 1, mobile: false },
  { nazwa: "pionowy", szer: 390, wys: 844, dpr: 2, mobile: true },
];
// the hero, then one frame per stop for the flow without the scene (BIURKO_PLAKAT): the page jumps
// to a stop from its address (#id), the same way a shared link lands there; the install stop reuses
// the hero poster, the laptop close-up behind the configurator was too dark (Łukasz)
const PRZYSTANKI = ["amnezja", "porzadek", "plan", "panel", "komendy"];
// --tylko hero,amnezja renders just those: a render is not byte-identical, so an accepted frame stays
const TYLKO = arg("tylko", "").split(",").filter(Boolean);
// a stop's landscape frame is a print as wide as a 1920 screen's column, so it renders at 1920 x 1080
// (same 16:9, same framing); the hero poster stays 1366 x 768 as accepted in E6
const SZEROKI = { szer: 1920, wys: 1080 };
const KADRY = [null, ...PRZYSTANKI]
  .filter((id) => !TYLKO.length || TYLKO.includes(id ?? "hero"))
  .flatMap((id) => UKLADY.map((u) => ({
    ...u, ...(id && u.nazwa === "poziomy" ? SZEROKI : {}), id,
    plik: id ? `biurko-${id}-${u.nazwa}.jpg` : `biurko-${u.nazwa}.jpg`,
  })));

const profil = mkdtempSync(join(tmpdir(), "relai-plakat-"));
const chrome = spawn(CHROME, [
  "--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profil}`, "--no-first-run",
  "--hide-scrollbars", "--enable-gpu", "--ignore-gpu-blocklist", "about:blank",
], { stdio: "ignore" });

async function polacz() {
  for (let i = 0; i < 60; i++) {
    try {
      const lista = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const strona = lista.find((t) => t.type === "page");
      if (strona) {
        const ws = new WebSocket(strona.webSocketDebuggerUrl);
        await new Promise((ok, zle) => { ws.onopen = ok; ws.onerror = zle; });
        return ws;
      }
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("Chrome did not start (set CHROME to its path)");
}

let ws;
try {
  ws = await polacz();
} catch (e) {
  chrome.kill();
  throw e;
}
let nr = 0;
const czeka = new Map();
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (!czeka.has(d.id)) return;
  const { ok, zle } = czeka.get(d.id);
  czeka.delete(d.id);
  if (d.error) zle(new Error(d.error.message));
  else ok(d.result);
};
const wyslij = (method, params = {}) => new Promise((ok, zle) => {
  nr += 1;
  czeka.set(nr, { ok, zle });
  ws.send(JSON.stringify({ id: nr, method, params }));
});
const ocen = async (expression) => {
  const r = await wyslij("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  return r.result.value;
};

try {
  mkdirSync(WYJSCIE, { recursive: true });
  await wyslij("Page.enable");
  await wyslij("Page.addScriptToEvaluateOnNewDocument", { source: "try { localStorage.setItem('relai-jezyk', 'pl'); } catch {}" });
  for (const k of KADRY) {
    await wyslij("Emulation.setDeviceMetricsOverride", { width: k.szer, height: k.wys, deviceScaleFactor: k.dpr, mobile: k.mobile });
    await wyslij("Page.navigate", { url: `${ADRES}?k=${Date.now()}${k.id ? `#${k.id}` : ""}` });
    const gotowe = await ocen(`new Promise((r) => { const t = Date.now(); const f = () => { const h = document.documentElement;
      if (window.__biurko?.obiekty?.dodatki && !h.classList.contains('laduje') && !h.classList.contains('laduje-koniec')) r(h.classList.contains('tryb-3d'));
      else if (Date.now() - t > 60000) r(false); else setTimeout(f, 200); }; f(); })`);
    if (!gotowe) throw new Error(`${k.plik}: the scene did not start (no GPU in this Chrome?)`);
    await ocen(`(() => { const s = document.createElement('style'); s.textContent = ${JSON.stringify(UKRYJ)}; document.head.append(s); })()`);
    // a stop waits longer: the camera's damping and the peak's 3 s play have to settle first
    await new Promise((r) => setTimeout(r, k.id ? 6000 : 2500));
    const { data } = await wyslij("Page.captureScreenshot", { format: "jpeg", quality: JAKOSC });
    const bufor = Buffer.from(data, "base64");
    writeFileSync(join(WYJSCIE, k.plik), bufor);
    process.stdout.write(`${k.plik}: ${k.szer * k.dpr} x ${k.wys * k.dpr}, ${(bufor.length / 1024).toFixed(1)} KiB\n`);
  }
} finally {
  ws.close();
  chrome.kill();
  await new Promise((r) => setTimeout(r, 1000));
  try {
    rmSync(profil, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
  } catch {
    process.stderr.write(`the Chrome profile stays in ${profil}\n`);
  }
}
