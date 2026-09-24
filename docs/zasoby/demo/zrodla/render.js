// Render klatek przez Chrome DevTools Protocol — lokalny Chromium, globalny WebSocket Node,
// zero pakietow npm. Uzycie:
//   node render.js <pl|en> klatki            -> klatki/<jezyk>/NNNN.png, 10 kl./s, 25 s
//   node render.js <pl|en> kadr <t> <plik>   -> jedna klatka w chwili t (kalibracja)
//   node render.js <pl|en> uklad             -> kontrola ukladu i tekstu w DOM w stanach ustalonych
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const CHROME = process.env.RELAI_CHROME || path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright', 'chromium-1234', 'chrome-win64', 'chrome.exe');
const PORT = 9333;
const OUT = process.env.RELAI_DEMO_OUT || path.join(__dirname, '..', '..', '..', '..', '.claude', 'relai', 'work', 'demo');
// Chromium z instalacji Playwrighta (bez pakietu npm); inna sciezka: zmienna RELAI_CHROME.
const FPS = 10, CZAS = 25;
const [jezyk, tryb, ...reszta] = process.argv.slice(2);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function polacz() {
  const profil = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-e5-chrome-'));
  const proc = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + PORT, '--user-data-dir=' + profil,
    '--hide-scrollbars', '--force-device-scale-factor=1', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  let lista;
  for (let i = 0; i < 50; i++) {
    try { lista = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); break; } catch (_) { await sleep(200); }
  }
  const strona = lista.find((x) => x.type === 'page');
  const ws = new WebSocket(strona.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let id = 0; const czeka = new Map();
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && czeka.has(m.id)) { const c = czeka.get(m.id); czeka.delete(m.id); m.error ? c.rej(new Error(JSON.stringify(m.error))) : c.res(m.result); }
  });
  const cdp = (method, params = {}) => new Promise((res, rej) => { const n = ++id; czeka.set(n, { res, rej }); ws.send(JSON.stringify({ id: n, method, params })); });
  const koniec = () => { ws.close(); proc.kill(); setTimeout(() => fs.rmSync(profil, { recursive: true, force: true }), 800); };
  return { cdp, koniec };
}

async function main() {
  const { cdp, koniec } = await polacz();
  try {
    await cdp('Emulation.setDeviceMetricsOverride', { width: 720, height: 900, deviceScaleFactor: 1, mobile: false });
    const url = 'file:///' + path.join(OUT, `scena-${jezyk}.html`).split(path.sep).join('/');
    await cdp('Page.navigate', { url });
    await sleep(800);
    const ev = async (expr) => (await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result.value;
    const fonty = await ev('document.fonts.ready.then(() => [...document.fonts].filter(f => f.status === "loaded").length)');
    console.log('fonty zaladowane:', fonty);
    const klatka = async (t, plik) => {
      await ev(`window.ustawCzas(${t})`);
      const { data } = await cdp('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(plik, Buffer.from(data, 'base64'));
    };
    if (tryb === 'kadr') {
      await klatka(+reszta[0], reszta[1]);
    } else if (tryb === 'klatki') {
      const dir = path.join(OUT, 'klatki', jezyk);
      fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
      for (let i = 0; i < FPS * CZAS; i++) await klatka(i / FPS, path.join(dir, String(i).padStart(4, '0') + '.png'));
      console.log('klatek:', FPS * CZAS);
    } else if (tryb === 'uklad') {
      // Stany ustalone: srodek kazdej sceny po wejsciu wszystkich elementow.
      const chwile = [1.6, 9.2, 12.2, 19.0, 24.5];
      for (const t of chwile) {
        await ev(`window.ustawCzas(${t})`);
        const w = await ev(`(() => {
          const lum = (c) => { const m = c.match(/[\\d.]+/g).map(Number); const f = (v) => { v/=255; return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4); }; return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2]); };
          const out = { przepelnienia: [], minFont: 1e9, minFontEl: '', maxLumTekstu: 0, maxLumEl: '' };
          const plotno = document.getElementById('plotno').getBoundingClientRect();
          for (const el of document.querySelectorAll('.scena *, .stopka *, .stopka')) {
            const sc = el.closest('.scena'); if (sc && +sc.style.opacity < 0.99) continue;
            const r = el.getBoundingClientRect(); if (!r.width) continue;
            const rodzic = el.parentElement.getBoundingClientRect();
            const tol = 0.5;
            if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) out.przepelnienia.push('scroll: ' + el.className + ' ' + el.textContent.slice(0, 30));
            if (r.left < rodzic.left - tol || r.right > rodzic.right + tol || r.top < rodzic.top - tol || r.bottom > rodzic.bottom + tol) out.przepelnienia.push('rodzic: ' + el.tagName + '.' + el.className + ' ' + el.textContent.slice(0, 30));
            if (r.left < plotno.left || r.right > plotno.right || r.top < plotno.top || r.bottom > plotno.bottom) out.przepelnienia.push('plotno: ' + el.className);
            const maTekst = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
            if (maTekst) {
              const cs = getComputedStyle(el); const fs = parseFloat(cs.fontSize);
              if (fs < out.minFont) { out.minFont = fs; out.minFontEl = el.className + ' ' + el.textContent.trim().slice(0, 30); }
              const bg = el.closest('.dymek') ? null : 1; // tekst na jasnym tle: kolor musi byc ciemny
              if (bg) { const L = lum(cs.color); if (L > out.maxLumTekstu) { out.maxLumTekstu = L; out.maxLumEl = el.className + ' ' + el.textContent.trim().slice(0, 30); } }
            }
          }
          return out;
        })()`);
        console.log(`t=${t}s przepelnien ${w.przepelnienia.length}${w.przepelnienia.length ? ' ' + JSON.stringify(w.przepelnienia) : ''} | min font ${w.minFont}px na plotnie = ${(w.minFont * 375 / 720).toFixed(1)}px przy 375 (${w.minFontEl}) | max luminancja tekstu ${w.maxLumTekstu.toFixed(3)} (${w.maxLumEl})`);
      }
      // Kontrola pozytywna: podlozone przepelnienie musi zostac wykryte.
      await ev(`window.ustawCzas(19.0); document.querySelectorAll('.scena')[3].querySelector('.cytat').style.width = '120cqw'`);
      const podl = await ev(`(() => { const el = document.querySelectorAll('.scena')[3].querySelector('.cytat'); const r = el.getBoundingClientRect(), p = el.parentElement.getBoundingClientRect(); return r.right > p.right + 0.5; })()`);
      console.log('kontrola pozytywna (podlozone przepelnienie wykryte):', podl);
    }
  } finally { koniec(); }
}
main().catch((e) => { console.error(e); process.exit(1); });
