// Generator scen demo pod telefon (E5 PROWADZENIE_END_TO_END, S04).
// Kierunek wizualny zaakceptowany 2026-09-12 (DEMO.md): cieply papier, zaokraglone karty
// w lekkim szkle, Fraunces w tytulach, Caveat jako akcent odreczny, chipy etapow.
// Uklad liczy silnik (L-0094): grid/flex, wymiary w cqw, karty z overflow:hidden,
// jeden modul tokenow. Zadna scena nie uzywa wartosci doslownej poza tokenami.
//
// Kazdy cytat z pliku albo odpowiedzi agenta pochodzi z zapisu realnego przebiegu
// (docs/archiwum/plany/PIERWSI_UZYTKOWNICY/zapis/) — sprawdza to pokrycie.py.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
// Wynik (HTML scen, tresc.json, klatki) idzie do katalogu roboczego — .claude/relai/ jest poza gitem.
const OUT = process.env.RELAI_DEMO_OUT || path.join(ROOT, '.claude', 'relai', 'work', 'demo');
fs.mkdirSync(OUT, { recursive: true });
const FONTS = path.join(ROOT, 'docs', 'zasoby', 'fonts');
const f64 = (n) => fs.readFileSync(path.join(FONTS, n)).toString('base64');

const FONT_CSS = [
  ['Fraunces', 'fraunces-latin-wonk.woff2', 'fraunces-latin-ext-wonk.woff2', '400 700'],
  ['Hanken', 'hanken-grotesk-latin.woff2', 'hanken-grotesk-latin-ext.woff2', '400 700'],
  ['Caveat', 'caveat-latin.woff2', 'caveat-latin-ext.woff2', '400 700'],
  ['Mono', 'jetbrains-mono-latin.woff2', 'jetbrains-mono-latin-ext.woff2', '400 700'],
].map(([rodz, a, b, w]) => [a, b].map((plik) =>
  `@font-face{font-family:'${rodz}';src:url(data:font/woff2;base64,${f64(plik)}) format('woff2');font-weight:${w};font-display:block}`
).join('\n')).join('\n');

// Tokeny — jedyne zrodlo wartosci. Rozmiary w cqw (kontener = plotno 720 px szerokosci).
// Minimum tekstu 4.3cqw = 31 px na plotnie = 16 px przy 375 px szerokosci ekranu.
const T = {
  papier: '#f7f1e8', tusz: '#2a221c', tuszMiekki: '#4a3f36', akcent: '#b5562f',
  ok: '#2f6b45', okTlo: '#e3efe4', czeka: '#5c5249', czekaTlo: '#efe8dd',
  karta: 'rgba(255,253,249,.82)', ramka: 'rgba(120,96,70,.18)', kod: '#efe7da',
  r: '3.4cqw', rMaly: '2cqw', pad: '5cqw', gap: '3cqw',
  txt: '4.3cqw', txtDuzy: '5.4cqw', tytul: '8cqw', marka: '13cqw', reka: '6.4cqw', kodTxt: '4cqw',
};

const CSS = `
${FONT_CSS}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:720px;height:900px;overflow:hidden;background:${T.papier}}
#plotno{position:relative;width:720px;height:900px;container-type:inline-size;overflow:hidden;
  background:${T.papier};font-family:'Hanken',sans-serif;color:${T.tusz}}
.plama{position:absolute;border-radius:50%;filter:blur(8cqw);opacity:.55}
.p1{width:60cqw;height:60cqw;left:-18cqw;top:-16cqw;background:#efd9a8}
.p2{width:55cqw;height:55cqw;right:-20cqw;top:8cqw;background:#efc3ac}
.p3{width:70cqw;height:50cqw;left:10cqw;bottom:-25cqw;background:#dfe6d2}
svg.fale{position:absolute;left:0;bottom:14cqw;width:100cqw;height:30cqw;opacity:.45}
.scena{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;
  gap:${T.gap};padding:6cqw ${T.pad} 17cqw;opacity:0}
.scena>*{flex-shrink:0}
.stopka{position:absolute;left:${T.pad};right:${T.pad};bottom:5cqw;display:flex;align-items:baseline;
  gap:2.4cqw;font-size:${T.txt};color:${T.tuszMiekki}}
.stopka b{font-family:'Fraunces',serif;font-size:6.4cqw;color:${T.tusz}}
.dymek{align-self:flex-end;max-width:86cqw;background:${T.tusz};color:#fbf6ee;border-radius:${T.r} ${T.r} 0.8cqw ${T.r};
  padding:3cqw 4cqw;font-size:${T.txtDuzy};line-height:1.3;overflow:hidden}
.dymek small{display:block;font-size:${T.txt};font-weight:700;color:#fbf6ee;margin-bottom:.8cqw}
.karta{background:${T.karta};border:1px solid ${T.ramka};border-radius:${T.r};padding:${T.pad};
  display:flex;flex-direction:column;gap:2cqw;overflow:hidden;box-shadow:0 2cqw 6cqw rgba(90,60,30,.10)}
.etykieta{font-family:'Mono',monospace;font-size:${T.txt};color:${T.akcent};letter-spacing:.02em}
.plik{font-family:'Mono',monospace;font-size:${T.kodTxt};background:${T.kod};border-radius:${T.rMaly};
  padding:1.6cqw 2cqw;color:${T.tusz};line-height:1.35}
.cytat{font-size:${T.txtDuzy};line-height:1.38}
.cytat em{font-style:normal;font-weight:700}
.etap{display:grid;grid-template-columns:auto 1fr;gap:.4cqw 2.4cqw;align-items:center;font-size:${T.txt};line-height:1.3}
.chip{font-family:'Mono',monospace;font-weight:700;font-size:${T.txt};border-radius:99cqw;padding:.6cqw 2.2cqw;
  background:${T.czekaTlo};color:${T.czeka}}
.chip.ok{background:${T.okTlo};color:${T.ok}}
.status{grid-column:2;font-family:'Mono',monospace;font-size:${T.txt};color:${T.czeka}}
.status.ok{color:${T.ok};font-weight:700}
.reka{font-family:'Caveat',cursive;font-size:${T.reka};color:${T.akcent};line-height:1.35}
.marka{font-family:'Fraunces',serif;font-size:${T.marka};font-weight:600;text-align:center}
.srodek{text-align:center}
.tytul{font-family:'Fraunces',serif;font-size:${T.tytul};line-height:1.25}
svg.strzalka{width:30cqw;height:18cqw;align-self:center}
`;

function html(tresc) {
  const s = tresc.sceny;
  return `<!doctype html><html lang="${tresc.lang}"><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<div id="plotno">
  <div class="plama p1"></div><div class="plama p2"></div><div class="plama p3"></div>
  <svg class="fale" viewBox="0 0 720 200" preserveAspectRatio="none"><path d="M0 80 C180 20 360 140 720 60" fill="none" stroke="#c9a77f" stroke-width="2"/><path d="M0 140 C200 90 420 190 720 110" fill="none" stroke="#c9a77f" stroke-width="2"/></svg>

  <section class="scena" data-od="0" data-do="3.2">
    <div class="marka">RelAI</div>
    <div class="reka srodek">${s.marka}</div>
  </section>

  <section class="scena" data-od="3.2" data-do="10.4">
    <div class="dymek" data-wejscie="3.4"><small>${s.ty}</small>${s.promptPlan}</div>
    <div class="karta" data-wejscie="4.6">
      <div class="etykieta">${s.etykietaPlan}</div>
      ${tresc.etapy.map((e, i) => `<div class="etap" data-wejscie="${(5.0 + i * 0.35).toFixed(2)}">
        <span class="chip${i === 0 ? ' ok' : ''}">E${i + 1}</span><span>${e}</span>
        ${i === 0 ? `<span class="status ok">${s.gotowy}</span>` : ''}</div>`).join('\n      ')}
      <div class="plik">docs/plany/PLATNOSCI/<wbr>STATUS.md</div>
    </div>
  </section>

  <section class="scena" data-od="10.4" data-do="13">
    <div class="tytul srodek">${s.nastepnyDzien}</div>
    <svg class="strzalka" viewBox="0 0 200 120"><path d="M20 20 C 60 110, 140 110, 175 40" fill="none" stroke="${T.akcent}" stroke-width="5" stroke-linecap="round"/><path d="M150 42 L178 36 L176 66" fill="none" stroke="${T.akcent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <div class="reka srodek">${s.zeroHistorii}</div>
  </section>

  <section class="scena" data-od="13" data-do="19.8">
    <div class="dymek" data-wejscie="13.2"><small>${s.ty}</small>${s.kontynuujemy}</div>
    <div class="karta" data-wejscie="14.3">
      <div class="etykieta">${s.relaiOdpowiada}</div>
      <div class="cytat">${s.gdzieJestesmy}</div>
      <div class="cytat" data-wejscie="16.2"><em>${s.propozycja}</em></div>
    </div>
  </section>

  <section class="scena" data-od="19.8" data-do="25.2">
    <div class="dymek" data-wejscie="20"><small>${s.ty}</small>/relai-stage</div>
    <div class="karta" data-wejscie="21">
      <div class="etykieta">${s.karta}</div>
      <div class="cytat">${s.etapZ}</div>
      <div class="cytat" data-wejscie="21.8">${s.weryfikacja}</div>
      <div class="plik">docs/plany/PLATNOSCI/<wbr>PROMPT_ETAP_1.md</div>
      <div class="cytat" data-wejscie="22.8"><em>${s.zaczynamy}</em></div>
    </div>
    <div class="reka srodek" data-wejscie="23.4">${s.puenta}</div>
  </section>

  <div class="stopka"><b>RelAI</b><span>${s.marka}</span></div>
</div>
<script>
// Czas sterowany z zewnatrz: window.ustawCzas(t) ustawia kazdy element deterministycznie.
const lagodnie = (x) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3);
window.ustawCzas = function (t) {
  for (const sc of document.querySelectorAll('.scena')) {
    const od = +sc.dataset.od, doo = +sc.dataset.do;
    const a = Math.min(lagodnie((t - od) / 0.45), 1 - lagodnie((t - (doo - 0.45)) / 0.45));
    sc.style.opacity = Math.max(0, a).toFixed(3);
  }
  for (const el of document.querySelectorAll('[data-wejscie]')) {
    const x = lagodnie((t - +el.dataset.wejscie) / 0.5);
    el.style.opacity = x.toFixed(3);
    el.style.transform = 'translateY(' + ((1 - x) * 2.5).toFixed(2) + 'cqw)';
  }
  return document.fonts.status;
};
window.ustawCzas(0);
</script></body></html>`;
}

const TRESC = {
  pl: {
    lang: 'pl',
    etapy: ['Zamówienie po stronie serwera', 'Sesja płatności u operatora', 'Webhook i potwierdzanie zapłaty',
      'Wygasanie i ścieżki nieszczęśliwe', 'Widok zamówień dla właściciela'],
    sceny: {
      marka: 'Twój projekt pamięta wszystko', ty: 'Ty',
      promptPlan: 'Przygotuj plan wdrożenia płatności w tym sklepie.',
      etykietaPlan: 'plan · 5 etapów', gotowy: 'GOTOWY DO STARTU', pozostale: 'E2–E5: OCZEKUJE',
      nastepnyDzien: 'Nowa sesja.', zeroHistorii: 'zero historii rozmowy — tylko pliki',
      kontynuujemy: 'Kontynuujemy pracę.', relaiOdpowiada: 'RelAI · gdzie jesteśmy',
      gdzieJestesmy: 'Etap E1 „Zamówienie po stronie serwera" jest GOTOWY DO STARTU, prompt PROMPT_ETAP_1.md istnieje i nic go nie blokuje',
      propozycja: 'Propozycja: uruchamiamy etap E1 komendą /relai-stage',
      karta: 'karta potwierdzenia', etapZ: 'Etap — E1 z E5', weryfikacja: 'Weryfikacja — 11 punktów',
      zaczynamy: 'Zaczynamy?', puenta: 'pamięć projektu mieszka w plikach',
    },
  },
  en: {
    lang: 'en',
    etapy: ['Server-side order', 'Payment session with the provider', 'Webhook and payment confirmation',
      'Expiry and unhappy paths', 'Order view for the owner'],
    sceny: {
      marka: 'Your project remembers everything', ty: 'You',
      promptPlan: 'Prepare a plan for adding payments to this shop.',
      etykietaPlan: 'plan · 5 stages', gotowy: 'READY TO START', pozostale: 'E2–E5: WAITING',
      nastepnyDzien: 'New session.', zeroHistorii: 'zero chat history — only files',
      kontynuujemy: 'Let\'s continue.', relaiOdpowiada: 'RelAI · where we are',
      gdzieJestesmy: 'Stage E1 "Server-side order" is READY TO START, the prompt PROMPT_ETAP_1.md exists and nothing blocks it',
      propozycja: 'Proposal: we start stage E1 with /relai-stage',
      karta: 'confirmation card', etapZ: 'Stage — E1 of E5', weryfikacja: 'Verification — 11 checks',
      zaczynamy: 'Shall we start?', puenta: 'project memory lives in files',
    },
  },
};

for (const [jezyk, tresc] of Object.entries(TRESC)) {
  fs.writeFileSync(path.join(OUT, `scena-${jezyk}.html`), html(tresc));
}
fs.writeFileSync(path.join(OUT, 'tresc.json'), JSON.stringify(TRESC, null, 2));
console.log('sceny: pl, en ->', OUT);
