// Every surface of the desk, drawn in code on a canvas: wood, paper, cork, plaster, the evening sky,
// sticky notes, documents and the logo card. No images are fetched.
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

/** Walnut desk top: long wandering grain, pores, a little wear toward the front edge. */
export function drewno() {
  const W = 2048, H = 1024;
  const [c, ctx] = plotno(W, H);
  const los = losowanie(7);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#7b5233");
  g.addColorStop(0.5, "#8a5d3b");
  g.addColorStop(1, "#7a5132");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // broad colour bands
  for (let i = 0; i < 26; i++) {
    const y = los() * H;
    const h = 20 + los() * 90;
    ctx.fillStyle = `rgba(${los() < 0.5 ? "60,36,20" : "168,118,76"},${0.05 + los() * 0.08})`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= W; x += 64) ctx.lineTo(x, y + Math.sin(x * 0.002 + i) * 18);
    for (let x = W; x >= 0; x -= 64) ctx.lineTo(x, y + h + Math.sin(x * 0.0025 + i * 1.7) * 14);
    ctx.fill();
  }
  // fine grain lines
  for (let i = 0; i < 900; i++) {
    const y0 = los() * H;
    const amp = 2 + los() * 10;
    const f = 0.001 + los() * 0.003;
    const ph = los() * 6.28;
    ctx.strokeStyle = `rgba(${los() < 0.7 ? "52,30,16" : "190,140,94"},${0.04 + los() * 0.1})`;
    ctx.lineWidth = 0.6 + los() * 1.4;
    ctx.beginPath();
    for (let x = -20; x <= W + 20; x += 24) {
      const y = y0 + Math.sin(x * f + ph) * amp + Math.sin(x * f * 3.1 + ph) * amp * 0.25;
      if (x < 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // pores
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = `rgba(40,22,10,${0.08 + los() * 0.18})`;
    ctx.fillRect(los() * W, los() * H, 1 + los() * 5, 0.8);
  }
  szum(ctx, W, H, 10, los);
  return tekstura(c);
}

/** Roughness for the desk: lacquer with a satin sheen, slightly duller along the grain. */
export function drewnoChropowatosc() {
  const W = 512, H = 256;
  const [c, ctx] = plotno(W, H);
  const los = losowanie(11);
  ctx.fillStyle = "rgb(120,120,120)";
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 260; i++) {
    ctx.strokeStyle = `rgba(${los() < 0.5 ? "170,170,170" : "90,90,90"},${0.15 + los() * 0.2})`;
    ctx.lineWidth = 0.5 + los() * 2;
    const y = los() * H;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(W * 0.3, y + (los() - 0.5) * 8, W * 0.6, y + (los() - 0.5) * 8, W, y + (los() - 0.5) * 6);
    ctx.stroke();
  }
  return tekstura(c, { kolor: false });
}

/** Cream paper with fibres; `kropki` adds the dotted grid of the Warsztat sheet. */
export function papier({ kolor = KOLOR.kartka, kropki = false, rozmiar = 1024, ziarno = 3 } = {}) {
  const [c, ctx] = plotno(rozmiar, rozmiar);
  const los = losowanie(ziarno);
  ctx.fillStyle = kolor;
  ctx.fillRect(0, 0, rozmiar, rozmiar);
  for (let i = 0; i < 500; i++) {
    ctx.strokeStyle = `rgba(120,100,70,${0.02 + los() * 0.04})`;
    ctx.lineWidth = 0.5;
    const x = los() * rozmiar, y = los() * rozmiar, a = los() * 6.28, l = 4 + los() * 16;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
  if (kropki) {
    ctx.fillStyle = "rgba(143,133,116,.42)";
    const krok = rozmiar / 28;
    for (let y = krok / 2; y < rozmiar; y += krok) for (let x = krok / 2; x < rozmiar; x += krok) {
      ctx.beginPath();
      ctx.arc(x, y, rozmiar / 700, 0, 6.28);
      ctx.fill();
    }
  }
  szum(ctx, rozmiar, rozmiar, 7, los);
  return tekstura(c);
}

/** Cork board: dense granules in several browns. */
export function korek() {
  const S = 1024;
  const [c, ctx] = plotno(S, S);
  const los = losowanie(19);
  ctx.fillStyle = "#a87a4e";
  ctx.fillRect(0, 0, S, S);
  const barwy = ["#8c6038", "#b98b5c", "#c99a68", "#74502e", "#9d6f44", "#d1a877"];
  for (let i = 0; i < 26000; i++) {
    ctx.fillStyle = barwy[(los() * barwy.length) | 0];
    ctx.globalAlpha = 0.35 + los() * 0.5;
    ctx.beginPath();
    ctx.ellipse(los() * S, los() * S, 0.8 + los() * 3.2, 0.8 + los() * 2.4, los() * 3.14, 0, 6.28);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  szum(ctx, S, S, 16, los);
  return tekstura(c);
}

/** Warm plaster of a room in the evening. */
export function tynk() {
  const S = 1024;
  const [c, ctx] = plotno(S, S);
  const los = losowanie(23);
  ctx.fillStyle = "#3a3129";
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 140; i++) {
    const x = los() * S, y = los() * S, r = 40 + los() * 160;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const jasny = los() < 0.5;
    g.addColorStop(0, jasny ? "rgba(92,78,62,.10)" : "rgba(30,24,19,.12)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  szum(ctx, S, S, 9, los);
  return tekstura(c, { powtorz: [3, 2] });
}

/** The window: an evening sky, a distant roof line with a few lit windows. Teal to amber, never violet. */
export function niebo() {
  const W = 1024, H = 1024;
  const [c, ctx] = plotno(W, H);
  const los = losowanie(29);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#1c2e38");
  g.addColorStop(0.45, "#3d5560");
  g.addColorStop(0.72, "#a9876a");
  g.addColorStop(0.86, "#d69a5c");
  g.addColorStop(1, "#d69a5c");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // far roofs
  ctx.fillStyle = "#2a2a2c";
  ctx.beginPath();
  ctx.moveTo(0, H);
  let x = 0;
  while (x < W) {
    const w = 40 + los() * 110;
    const h = H * (0.78 + los() * 0.1);
    ctx.lineTo(x, h);
    if (los() < 0.35) ctx.lineTo(x + w / 2, h - 30 - los() * 30);
    ctx.lineTo(x + w, h);
    x += w;
  }
  ctx.lineTo(W, H);
  ctx.fill();
  // near roofs, darker
  ctx.fillStyle = "#1b1b1d";
  ctx.beginPath();
  ctx.moveTo(0, H);
  x = 0;
  while (x < W) {
    const w = 90 + los() * 160;
    const h = H * (0.86 + los() * 0.06);
    ctx.lineTo(x, h);
    ctx.lineTo(x + w, h);
    x += w;
  }
  ctx.lineTo(W, H);
  ctx.fill();
  for (let i = 0; i < 26; i++) {
    ctx.fillStyle = `rgba(255,${190 + los() * 40},${110 + los() * 40},${0.55 + los() * 0.4})`;
    ctx.fillRect(los() * W, H * (0.84 + los() * 0.13), 5 + los() * 6, 7 + los() * 6);
  }
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

/** A project document: title in Fraunces, ruled text lines, a margin note in Kalam. */
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
  let y = 380;
  while (y < H - 140) {
    if (los() < 0.16) {
      y += 44;
      ctx.fillStyle = KOLOR.txt2;
      ctx.fillRect(96, y, 260 + los() * 200, 22);
      y += 64;
      continue;
    }
    ctx.fillStyle = "rgba(97,89,76,.38)";
    ctx.fillRect(96, y, (W - 192) * (0.55 + los() * 0.45), 12);
    y += 40;
  }
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

/** Kraft cardboard for the folder and the card box. */
export function karton(ziarno = 37) {
  const S = 512;
  const [c, ctx] = plotno(S, S);
  const los = losowanie(ziarno);
  ctx.fillStyle = "#b8936a";
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < 1800; i++) {
    ctx.strokeStyle = `rgba(${los() < 0.5 ? "120,88,56" : "214,184,146"},${0.08 + los() * 0.12})`;
    ctx.lineWidth = 0.6;
    const x = los() * S, y = los() * S, a = los() * 6.28, l = 3 + los() * 10;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    ctx.stroke();
  }
  szum(ctx, S, S, 12, los);
  return tekstura(c);
}

/**
 * The laptop screen before the configurator: the Claude Code window with the RelAI bars, drawn as
 * shapes (the real bars rendered from the plugins' code come in E2).
 */
export function ekranPanelu() {
  const W = 1280, H = 800;
  const [c, ctx] = plotno(W, H);
  ctx.fillStyle = "#1f1c18";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#2a2621";
  ctx.fillRect(0, 0, W, 54);
  [KOLOR.glina, KOLOR.musztarda, KOLOR.szalwia].forEach((k, i) => {
    ctx.fillStyle = k;
    ctx.beginPath();
    ctx.arc(32 + i * 28, 27, 8, 0, 6.28);
    ctx.fill();
  });
  // conversation lines
  ctx.fillStyle = "rgba(242,233,216,.16)";
  for (let i = 0; i < 9; i++) ctx.fillRect(80, 110 + i * 38, 520 + ((i * 137) % 420), 14);
  ctx.fillStyle = "rgba(242,233,216,.08)";
  ctx.fillRect(0, 486, W, 1);
  // three calm bars above the prompt
  const bar = (y, etykieta, kolor, czesc) => {
    ctx.fillStyle = "rgba(242,233,216,.55)";
    ctx.font = "500 24px 'Hanken Grotesk', sans-serif";
    ctx.fillText(etykieta, 80, y + 18);
    ctx.strokeStyle = "rgba(242,233,216,.35)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const x = 300 + i * 120;
      ctx.strokeRect(x, y, 96, 26);
      ctx.fillStyle = kolor;
      if (i < czesc) ctx.fillRect(x + 4, y + 4, 88, 18);
    }
  };
  bar(520, "cache", KOLOR.szalwia, 4);
  bar(572, "limit", KOLOR.musztarda, 3);
  bar(624, "plan", KOLOR.glina, 2);
  ctx.fillStyle = "#2a2621";
  ctx.fillRect(60, 692, W - 120, 64);
  ctx.strokeStyle = "rgba(196,100,60,.7)";
  ctx.strokeRect(60, 692, W - 120, 64);
  return tekstura(c);
}
