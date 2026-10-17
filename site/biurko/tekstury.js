// Surfaces that carry words or a picture, drawn in code on a canvas: sticky notes, documents, the logo
// card, labels, the laptop screen, the night view and the mug glaze. Wood, plaster, cork, paper and
// metal come from the CC0 sets in site/zasoby/ (see zasoby.js).
import * as THREE from "three";

export const KOLOR = Object.freeze({
  tlo: "#f2e9d8", kartka: "#fffdf7", kartka2: "#f8f1e2", txt: "#312c25", txt2: "#61594c", txt3: "#8f8574",
  linia: "#e0d3ba", linia2: "#cdbc9c", glina: "#c4643c", glina2: "#a8502e", musztarda: "#d9a134", szalwia: "#5f8a68",
});

// Deterministic randomness, so every visit sees the same desk.
export function losowanie(ziarno) {
  let s = ziarno >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function plotno(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")];
}

function szum(ctx, w, h, sila, los) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (los() - 0.5) * sila;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
}

function tekstura(c, { kolor = true, powtorz = null, aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (kolor) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  if (powtorz) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(...powtorz);
  }
  return t;
}

/** Terracotta glaze with dark speckles, for the mug. */
export function szkliwo() {
  const S = 512;
  const [c, ctx] = plotno(S, S);
  const los = losowanie(61);
  ctx.fillStyle = "#a9461c";
  ctx.fillRect(0, 0, S, S);
  // the glaze pools darker in streaks running down the wall and thins to orange on the high spots
  for (let i = 0; i < 90; i++) {
    const x = los() * S, y = los() * S, r = 20 + los() * 70;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const jasne = los() < 0.5;
    g.addColorStop(0, jasne ? "rgba(214,120,62,.2)" : "rgba(96,32,12,.2)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(0.45, 1.6);
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.restore();
  }
  // iron speckles of stoneware: small, dark, some with a pale halo
  for (let i = 0; i < 900; i++) {
    const x = los() * S, y = los() * S, r = 0.4 + los() * los() * 1.8;
    if (los() < 0.25) {
      ctx.fillStyle = "rgba(230,170,120,.35)";
      ctx.beginPath();
      ctx.arc(x, y, r * 2.2, 0, 6.28);
      ctx.fill();
    }
    ctx.fillStyle = `rgba(${los() < 0.7 ? "42,22,14" : "24,13,9"},${0.6 + los() * 0.35})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 6.28);
    ctx.fill();
  }
  const t = tekstura(c, { powtorz: [2, 1] });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** A small print for the cork board: a pale border and a dusk landscape, no readable detail. */
export function zdjecie(ziarno) {
  const W = 384, H = 480;
  const [c, ctx] = plotno(W, H);
  const los = losowanie(ziarno);
  ctx.fillStyle = "#efe7d8";
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 24, 0, 380);
  g.addColorStop(0, "#38526e");
  g.addColorStop(0.6, "#b48a62");
  g.addColorStop(1, "#5b4533");
  ctx.fillStyle = g;
  ctx.fillRect(24, 24, W - 48, 360);
  ctx.fillStyle = "#1c1a18";
  ctx.beginPath();
  ctx.moveTo(24, 384);
  for (let x = 24; x <= W - 24; x += 24) ctx.lineTo(x, 300 + los() * 70);
  ctx.lineTo(W - 24, 384);
  ctx.fill();
  szum(ctx, W, H, 10, los);
  return tekstura(c);
}

function zawijaj(ctx, tekst, szer) {
  const slowa = tekst.split(/\s+/);
  const linie = [];
  let linia = "";
  for (const s of slowa) {
    const proba = linia ? `${linia} ${s}` : s;
    if (ctx.measureText(proba).width > szer && linia) {
      linie.push(linia);
      linia = s;
    } else linia = proba;
  }
  if (linia) linie.push(linia);
  return linie;
}

/** A sticky note with a question to the agent, in Kalam. */
export function karteczka(tekst, kolor, ziarno) {
  const S = 512;
  const [c, ctx] = plotno(S, S);
  const los = losowanie(ziarno);
  ctx.fillStyle = kolor;
  ctx.fillRect(0, 0, S, S);
  const g = ctx.createLinearGradient(0, 0, 0, S);
  g.addColorStop(0, "rgba(0,0,0,.06)");
  g.addColorStop(0.18, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(80,60,20,.08)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  ctx.fillStyle = "#3b3229";
  ctx.font = "400 58px Kalam, cursive";
  ctx.textBaseline = "top";
  const linie = zawijaj(ctx, tekst, S - 90);
  const start = Math.max(70, (S - linie.length * 70) / 2 - 10);
  linie.forEach((l, i) => {
    ctx.save();
    ctx.translate(46, start + i * 70);
    ctx.rotate((los() - 0.5) * 0.04);
    ctx.fillText(l, 0, 0);
    ctx.restore();
  });
  szum(ctx, S, S, 8, los);
  return tekstura(c);
}

// Printed body text for the documents: never read up close, but real words make real texture.
const SLOWA = ("sesja zaczyna od stanu projektu plik pamięta decyzję etap plan ryzyko zamknięty " +
  "otwarte dziennik lekcja wpis zmiana kod test przegląd agent kontekst przystanek wersja " +
  "wydanie notatka pytanie odpowiedź zasada próg model narzędzie dokument rejestr status").split(" ");
const DOPISKI = ["sprawdzić!", "to zostaje", "zapytać Łukasza", "OK", "ważne", "po E5", "?", "tak"];

function drukowanyAkapit(ctx, x, y, szer, linii, los) {
  ctx.font = "500 25px 'Hanken Grotesk', sans-serif";
  ctx.fillStyle = "rgba(49,44,37,.82)";
  for (let l = 0; l < linii; l++) {
    const koniec = l === linii - 1 ? szer * (0.35 + los() * 0.4) : szer;
    let px = x;
    while (px < x + koniec - 40) {
      const s = SLOWA[Math.floor(los() * SLOWA.length)];
      const w = ctx.measureText(s).width;
      if (px + w > x + koniec) break;
      ctx.fillText(s, px, y);
      px += w + 9;
    }
    y += 37;
  }
  return y;
}

/** Pencil notes in the margin: a word in Kalam, an underline, a tick or an arrow. */
function dopiski(ctx, W, los) {
  ctx.strokeStyle = "rgba(70,66,62,.75)";
  ctx.fillStyle = "rgba(70,66,62,.82)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  for (let i = 0; i < 2 + Math.floor(los() * 2); i++) {
    const y = 470 + los() * 760;
    ctx.save();
    ctx.translate(W - 250 + los() * 40, y);
    ctx.rotate((los() - 0.5) * 0.2);
    ctx.font = "400 42px Kalam, cursive";
    ctx.fillText(DOPISKI[Math.floor(los() * DOPISKI.length)], 0, 0);
    ctx.restore();
    ctx.beginPath(); // the line it refers to, underlined by hand
    ctx.moveTo(96, y + 8);
    ctx.bezierCurveTo(300, y + 12 + los() * 6, 500, y + 4, 560 + los() * 120, y + 10);
    ctx.stroke();
  }
  ctx.beginPath(); // a tick at the top
  ctx.moveTo(W - 160, 150);
  ctx.lineTo(W - 140, 175);
  ctx.lineTo(W - 100, 110);
  ctx.stroke();
}

/** Age of a sheet that has lain on a desk: a warmer edge, a faint mug ring on some. */
function zuzycie(ctx, W, H, los) {
  const brzeg = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.75);
  brzeg.addColorStop(0, "rgba(200,170,110,0)");
  brzeg.addColorStop(1, "rgba(200,170,110,.16)");
  ctx.fillStyle = brzeg;
  ctx.fillRect(0, 0, W, H);
  if (los() < 0.5) return;
  const x = 200 + los() * 600, y = 900 + los() * 400, r = 118;
  ctx.strokeStyle = "rgba(120,80,40,.16)";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(x, y, r, 0.3, Math.PI * 1.8);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x + 4, y - 3, r - 9, 0, Math.PI * 2);
  ctx.stroke();
}

/** A project document: file name, title in Fraunces, printed paragraphs, pencil notes in Kalam. */
export function dokument(tytul, plik, ziarno) {
  const W = 1024, H = 1448;
  const [c, ctx] = plotno(W, H);
  const los = losowanie(ziarno);
  ctx.fillStyle = KOLOR.kartka;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = KOLOR.txt3;
  ctx.font = "500 34px 'JetBrains Mono', monospace";
  ctx.fillText(plik, 96, 130);
  ctx.fillStyle = KOLOR.txt;
  ctx.font = "500 92px Fraunces, serif";
  ctx.fillText(tytul, 92, 250);
  ctx.fillStyle = KOLOR.glina;
  ctx.fillRect(96, 290, 120, 8);
  let y = 390;
  while (y < H - 180) {
    ctx.font = "600 30px 'Hanken Grotesk', sans-serif";
    ctx.fillStyle = KOLOR.txt;
    if (los() < 0.35) {
      ctx.fillText(SLOWA[Math.floor(los() * SLOWA.length)].replace(/^./, (z) => z.toUpperCase()), 96, y);
      y += 50;
    }
    y = drukowanyAkapit(ctx, 96, y, W - 192 - 180, 3 + Math.floor(los() * 4), los) + 30;
  }
  dopiski(ctx, W, los);
  zuzycie(ctx, W, H, los);
  szum(ctx, W, H, 6, los);
  return tekstura(c);
}

/** The logo card: the same kartka as logo.svg, drawn on paper that light can fall on. */
export function kartkaLogo() {
  const W = 1024, H = 768;
  const [c, ctx] = plotno(W, H);
  const los = losowanie(31);
  ctx.fillStyle = KOLOR.kartka;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(143,133,116,.28)";
  for (let y = 26; y < H; y += 38) for (let x = 26; x < W; x += 38) ctx.fillRect(x, y, 2.4, 2.4);
  ctx.textBaseline = "alphabetic";
  ctx.font = "700 250px Kalam, cursive";
  const rel = ctx.measureText("Rel").width;
  const ai = ctx.measureText("AI").width;
  const x0 = (W - rel - ai) / 2;
  ctx.fillStyle = KOLOR.txt;
  ctx.fillText("Rel", x0, 450);
  ctx.fillStyle = KOLOR.glina2;
  ctx.fillText("AI", x0 + rel, 450);
  ctx.strokeStyle = KOLOR.musztarda;
  ctx.lineWidth = 16;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x0 - 10, 500);
  ctx.quadraticCurveTo(W / 2, 470, x0 + rel + ai + 14, 488);
  ctx.stroke();
  [KOLOR.glina, KOLOR.musztarda, KOLOR.szalwia].forEach((k, i) => {
    ctx.fillStyle = k;
    ctx.beginPath();
    ctx.arc(W / 2 + (i - 1) * 92, 616, 20, 0, 6.28);
    ctx.fill();
  });
  szum(ctx, W, H, 6, los);
  return tekstura(c);
}

/** A label for the plan folder, handwritten. */
export function etykietaTeczki(tekst) {
  const W = 512, H = 256;
  const [c, ctx] = plotno(W, H);
  ctx.fillStyle = KOLOR.kartka;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = KOLOR.linia2;
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, W - 20, H - 20);
  ctx.fillStyle = KOLOR.txt;
  ctx.font = "700 92px Kalam, cursive";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(tekst, W / 2, H / 2 + 6);
  return tekstura(c);
}

/**
 * An index card pulled up out of the box: its tab colour along the top, the command's name by hand and
 * the way to call it in mono. Only the upper part shows above the cards in front of it.
 */
export function fiszkaKomendy(tytul, komenda, kolor) {
  const W = 1024, H = 484;
  const [c, ctx] = plotno(W, H);
  const los = losowanie(151);
  ctx.fillStyle = "#efe6d3";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = kolor;
  ctx.fillRect(0, 0, W, 26);
  // only the top 43 % shows above the box wall (3.7 cm of 8.6): both lines sit there
  ctx.fillStyle = KOLOR.txt;
  ctx.font = "700 80px Kalam, cursive";
  ctx.fillText(tytul, 60, 108);
  ctx.fillStyle = KOLOR.glina2;
  ctx.font = "500 46px 'JetBrains Mono', monospace";
  ctx.fillText(`/${komenda}`, 64, 182);
  ctx.strokeStyle = "rgba(143,133,116,.35)";
  ctx.lineWidth = 3;
  for (let y = 300; y < H - 20; y += 52) {
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(W - 60, y);
    ctx.stroke();
  }
  szum(ctx, W, H, 6, los);
  return tekstura(c);
}

/**
 * The top sheet in the open plan folder: a handwritten title and the stages as a checklist, the done
 * ones ticked and struck through, the current one marked. `etapy`: [{ nazwa, stan }] from scena.etapy,
 * stan "zrobiony" | "biezacy" | "czeka" (the drawer reads the same list).
 */
export function kartaPlanu(tytul, etapy) {
  const W = 1024, H = 1364;
  const [c, ctx] = plotno(W, H);
  const los = losowanie(127);
  ctx.fillStyle = KOLOR.kartka;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = KOLOR.txt;
  ctx.font = "700 120px Kalam, cursive";
  ctx.fillText(tytul, 96, 200);
  ctx.fillStyle = KOLOR.glina;
  ctx.fillRect(100, 236, 150, 9);
  etapy.forEach(({ nazwa: etap, stan }, i) => {
    const y = 380 + i * 132;
    const zrobiony = stan === "zrobiony";
    ctx.strokeStyle = KOLOR.txt2;
    ctx.lineWidth = 5;
    ctx.strokeRect(100, y - 52, 58, 58);
    if (zrobiony) {
      ctx.strokeStyle = KOLOR.szalwia;
      ctx.lineWidth = 11;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(110, y - 24);
      ctx.lineTo(128, y - 4);
      ctx.lineTo(170, y - 64);
      ctx.stroke();
    } else if (stan === "biezacy") {
      ctx.fillStyle = KOLOR.musztarda;
      ctx.beginPath();
      ctx.arc(129, y - 23, 15, 0, 6.28);
      ctx.fill();
    }
    ctx.fillStyle = zrobiony ? KOLOR.txt2 : KOLOR.txt;
    ctx.font = "600 56px 'Hanken Grotesk', sans-serif";
    ctx.fillText(etap, 200, y);
    if (zrobiony) {
      const szer = ctx.measureText(etap).width;
      ctx.fillStyle = "rgba(97,89,76,.55)";
      ctx.fillRect(196, y - 18, szer + 8, 4);
    }
  });
  zuzycie(ctx, W, H, los);
  szum(ctx, W, H, 6, los);
  return tekstura(c);
}

/**
 * The laptop screen: the Claude Code window with the three RelAI bars above the prompt, drawn from the
 * mock-up in site/dane/makiety.json (built from the plugins' code and a capture of the app, E5), on
 * sample data marked as such. Type is set large: at the Panel stop the screen is a third of the frame.
 * @param {{ kolory: object, paski: object[] }} m  read from the page's [data-makieta] (swiat.js)
 */
export function ekranPanelu(m) {
  const W = 1280, H = 800;
  const [c, ctx] = plotno(W, H);
  const k = m.kolory;
  const czcionka = (waga, px) => `${waga} ${px}px 'Hanken Grotesk', sans-serif`;
  ctx.fillStyle = k.okno;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#232220";
  ctx.fillRect(0, 0, W, 54);
  [KOLOR.glina, KOLOR.musztarda, KOLOR.szalwia].forEach((kolor, i) => {
    ctx.fillStyle = kolor;
    ctx.beginPath();
    ctx.arc(32 + i * 28, 27, 8, 0, 6.28);
    ctx.fill();
  });
  // next to the window's dots: the right corner sits under the desk map at the Panel stop
  ctx.fillStyle = k.wyciszony;
  ctx.font = czcionka(500, 22);
  ctx.fillText(k.przyklad, 130, 35);
  // the conversation above, quiet: what the bars sit under
  ctx.fillStyle = "rgba(240,239,236,.1)";
  ctx.fillRect(W - 520, 90, 460, 46);
  ctx.fillStyle = "rgba(240,239,236,.14)";
  for (let i = 0; i < 4; i++) ctx.fillRect(60, 170 + i * 30, 540 + ((i * 173) % 380), 12);
  ctx.fillStyle = k.linia;
  ctx.fillRect(40, 312, W - 80, 1);

  const RZAD = 118, X_TRESC = 210, X_LICZBA = W - 40;
  m.paski.forEach((p, n) => {
    const y = 336 + n * RZAD;
    ctx.fillStyle = k.wyciszony;
    ctx.font = czcionka(500, 26);
    ctx.fillText(p.etykieta, 60, y + 40);
    ctx.textAlign = "right";
    ctx.fillStyle = k.tekst;
    ctx.font = czcionka(700, 30);
    const jedn = ` ${p.jednostka}`;
    ctx.fillText(p.liczba, X_LICZBA - ctx.measureText(jedn).width - 4, y + 40);
    ctx.fillStyle = k.wyciszony;
    ctx.font = czcionka(500, 24);
    ctx.fillText(jedn, X_LICZBA, y + 40);
    ctx.textAlign = "left";
    if (p.plan) {
      ctx.fillStyle = k.tekst;
      ctx.font = czcionka(700, 32);
      ctx.fillText(p.plan.nazwa, X_TRESC, y + 40);
      let x = X_TRESC + ctx.measureText(p.plan.nazwa).width + 20;
      ctx.font = czcionka(700, 22);
      const sz = ctx.measureText(p.plan.status).width + 24;
      ctx.strokeStyle = k.wToku;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y + 14, sz, 36);
      ctx.fillStyle = k.wToku;
      ctx.fillText(p.plan.status, x + 12, y + 40);
      x += sz + 20;
      ctx.fillStyle = k.wyciszony;
      ctx.font = czcionka(500, 28);
      ctx.fillText(p.plan.etapNazwa, x, y + 40);
    }
    if (p.postep) {
      p.segmenty.forEach((kolor, i) => {
        ctx.fillStyle = kolor;
        ctx.fillRect(X_TRESC + i * 70, y + 4, 62, 12);
      });
      ctx.fillStyle = k.wToku;
      ctx.beginPath();
      ctx.arc(X_TRESC + 9, y + 54, 9, 0, 6.28);
      ctx.fill();
      ctx.fillStyle = k.tekst;
      ctx.font = czcionka(700, 28);
      ctx.fillText(p.postep.biezacy, X_TRESC + 30, y + 64);
      const x = X_TRESC + 30 + ctx.measureText(p.postep.biezacy).width + 18;
      ctx.fillStyle = k.wyciszony;
      ctx.font = czcionka(500, 24);
      ctx.fillText(p.postep.nastepny, x, y + 64);
    }
    if (p.baterie.length) {
      p.baterie.forEach((b, i) => {
        const x = X_TRESC + i * 190;
        ctx.strokeStyle = k.wyciszony;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y + 14, 40, 20);
        ctx.fillRect(x + 40, y + 19, 4, 10);
        ctx.fillStyle = b.kolor;
        ctx.fillRect(x + 3, y + 17, 34 * Number(b.zostalo) / 100, 14);
        ctx.fillStyle = k.wyciszony;
        ctx.font = czcionka(500, 20);
        ctx.fillText(b.etykieta, x + 52, y + 31);
        ctx.fillStyle = k.tekst;
        ctx.font = czcionka(700, 26);
        ctx.fillText(b.wartosc, x, y + 66);
      });
      if (p.kontekst) {
        const y2 = y + 92, sz = 380;
        ctx.fillStyle = k.tor;
        ctx.fillRect(X_TRESC, y2, sz, 10);
        ctx.fillStyle = p.kontekst.kolor;
        ctx.fillRect(X_TRESC, y2, sz * Number(p.kontekst.uzyte) / 100, 10);
        ctx.fillStyle = k.tekst;
        ctx.fillRect(X_TRESC + sz * Number(p.kontekst.prog) / 100, y2 - 5, 3, 20);
        ctx.fillStyle = k.wyciszony;
        ctx.font = czcionka(500, 22);
        ctx.fillText(`${p.kontekst.etykieta}  ${p.kontekst.tekst}`, X_TRESC + sz + 20, y2 + 10);
      }
    }
    if (n < m.paski.length - 1) {
      ctx.fillStyle = k.linia;
      ctx.fillRect(40, y + RZAD - 8, W - 80, 1);
    }
  });
  ctx.fillStyle = k.prompt;
  ctx.fillRect(40, 718, W - 80, 58);
  ctx.strokeStyle = k.linia;
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 718, W - 80, 58);
  ctx.fillStyle = k.tekst;
  ctx.fillRect(64, 732, 3, 30);
  return tekstura(c, { aniso: 16 });
}
