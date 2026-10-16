// The small facts of a lived-in room, built in code: cables and a wall socket, a stack of books, push pins
// and twine on the cork board, a glass pane in the window. Nothing here moves.
import * as THREE from "three";
import * as T from "./tekstury.js";
import { BLAT, cien } from "./geometria.js";
import { papier } from "./materialy.js";

const guma = () => new THREE.MeshStandardMaterial({ color: "#17151a", roughness: 0.55 });

/** A cable that follows `punkty` (metres), lying on the desk, over its back edge and down to the socket. */
function kabel(punkty, promien = 0.0024) {
  const krzywa = new THREE.CatmullRomCurve3(punkty.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.3);
  const m = new THREE.Mesh(new THREE.TubeGeometry(krzywa, 90, promien, 8), guma());
  return cien(m, true, false);
}

/** A wall socket plate with two sockets; the plug of a cable ends near it. */
function gniazdko(x, y, z) {
  const grupa = new THREE.Group();
  const bialy = new THREE.MeshStandardMaterial({ color: "#cfc8ba", roughness: 0.45 });
  const plyta = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.085, 0.012), bialy);
  grupa.add(cien(plyta, false, true));
  for (const s of [-1, 1]) {
    const otwor = new THREE.Mesh(new THREE.CircleGeometry(0.0125, 24), new THREE.MeshBasicMaterial({ color: "#2a2723" }));
    otwor.position.set(s * 0.02, 0, 0.0065);
    grupa.add(otwor);
    for (const k of [-1, 1]) {
      const bolec = new THREE.Mesh(new THREE.CircleGeometry(0.0016, 10), new THREE.MeshBasicMaterial({ color: "#070606" }));
      bolec.position.set(s * 0.02 + k * 0.0045, 0, 0.0068);
      grupa.add(bolec);
    }
  }
  grupa.position.set(x, y, z);
  return grupa;
}

/** Cables for the lamp and the laptop; both end at the socket on the wall behind the desk. */
export function kable() {
  const grupa = new THREE.Group();
  const gz = 0.0125 - 0.62 + 0.012;
  grupa.add(gniazdko(0.97, 0.42, -0.62 + 0.01));
  const y = BLAT + 0.003;
  grupa.add(kabel([[0.66, y, -0.31], [0.72, y, -0.36], [0.8, y, -0.42], [0.88, y, -0.5], [0.92, y - 0.02, -0.53], [0.94, 0.62, -0.58], [0.96, 0.48, gz]]));
  grupa.add(kabel([[0.7, y + 0.004, 0.2], [0.8, y, 0.15], [0.9, y, 0.0], [0.93, y, -0.25], [0.95, y - 0.015, -0.5], [0.97, 0.6, -0.585], [0.98, 0.47, gz]]));
  return grupa;
}

/** Page-block texture: fine horizontal lines, like the cut edge of a closed book. */
function bokStron() {
  const c = document.createElement("canvas");
  c.width = 8;
  c.height = 128;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#e4dac3";
  ctx.fillRect(0, 0, 8, 128);
  for (let y = 0; y < 128; y += 2) {
    ctx.fillStyle = `rgba(110,92,64,${0.12 + ((y * 7) % 5) * 0.03})`;
    ctx.fillRect(0, y, 8, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Book cloth: a fine linen weave in grey, used as a colour multiplier and as the bump. */
function splot() {
  const N = 128;
  const c = document.createElement("canvas");
  c.width = c.height = N;
  const ctx = c.getContext("2d");
  const los = T.losowanie(211);
  ctx.fillStyle = "#e6e6e6";
  ctx.fillRect(0, 0, N, N);
  for (let i = 0; i < N; i += 2) {
    ctx.fillStyle = `rgba(255,255,255,${0.18 + los() * 0.14})`;
    ctx.fillRect(0, i, N, 1);
    ctx.fillStyle = `rgba(0,0,0,${0.08 + los() * 0.1})`;
    ctx.fillRect(i, 0, 1, N);
  }
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(${los() < 0.5 ? "0,0,0" : "255,255,255"},${0.05 + los() * 0.06})`;
    ctx.fillRect(los() * N, los() * N, 1 + los() * 3, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/** Spine lettering: a small rule, the title and the RelAI mark, laid along the spine (canvas x = book length). */
function napisGrzbietu(tytul, kolor) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 160;
  const ctx = c.getContext("2d");
  ctx.fillStyle = kolor;
  ctx.font = "500 92px Fraunces, Georgia, serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.letterSpacing = "10px";
  ctx.fillText(tytul, 512, 84);
  ctx.font = "700 46px Kalam, cursive";
  ctx.letterSpacing = "0px";
  ctx.fillText("RelAI", 900, 86);
  ctx.fillRect(70, 74, 120, 6);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const SKALA_SPLOTU = 36; // weave tiles per metre (UVs of the cloth case are in metres)
const PRZETARCIE = "#efe3c9"; // the board shows through worn cloth at the corners

/**
 * The cloth case of a hardcover lying flat, as one extruded C-shape: bottom board, a spine bulging
 * outward, top board. Spine at x = -w/2, fore-edge at x = +w/2, length d along z, height h.
 * Corners and edges carry wear as vertex colour, the top board a slight warp.
 */
function oprawa(w, d, h, kolor, wypaczenie) {
  const t = 0.0026; // board thickness
  const garb = h * 0.2; // spine bulge
  const xs = -w / 2 + garb;
  const wektory = [];
  const linia = (x0, y0, x1, y1, n) => {
    for (let i = 0; i < n; i++) wektory.push(new THREE.Vector2(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n));
  };
  const luk = (rx, ry, odwrot, n) => {
    for (let i = 0; i <= n; i++) {
      const a = (odwrot ? i / n : 1 - i / n) * Math.PI - Math.PI / 2;
      wektory.push(new THREE.Vector2(xs - Math.cos(a) * rx, h / 2 + Math.sin(a) * ry));
    }
  };
  linia(w / 2, 0, xs, 0, 14);
  luk(garb, h / 2, true, 18);
  linia(xs, h, w / 2, h, 14);
  wektory.push(new THREE.Vector2(w / 2, h), new THREE.Vector2(w / 2, h - t));
  linia(w / 2, h - t, xs, h - t, 14);
  luk(garb - t, h / 2 - t, false, 18);
  linia(xs, t, w / 2, t, 14);
  wektory.push(new THREE.Vector2(w / 2, t));
  const ksztalt = new THREE.Shape(wektory);
  const g = new THREE.ExtrudeGeometry(ksztalt, {
    depth: d, steps: 10, curveSegments: 4,
    bevelEnabled: true, bevelThickness: 0.0005, bevelSize: 0.0004, bevelSegments: 2,
  });
  g.translate(0, 0, -d / 2);

  const baza = new THREE.Color(kolor);
  const jasny = new THREE.Color(PRZETARCIE);
  const p = g.attributes.position;
  const barwy = new Float32Array(p.count * 3);
  const k = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    // warp: the top board lifts a little toward the fore-edge, more at one corner
    if (y > h / 2) {
      const u = (x - xs) / (w / 2 - xs);
      p.setY(i, y + wypaczenie * u * u * (0.6 + 0.4 * (z / d + 0.5)));
    }
    // wear: strongest at the four fore-edge corners and the spine ends, a little along every edge
    const doRogu = Math.min(Math.hypot(w / 2 - x, d / 2 - Math.abs(z)), Math.hypot(x - (xs - garb), d / 2 - Math.abs(z)) * 1.4);
    const doKrawedzi = Math.min(w / 2 - x, d / 2 - Math.abs(z));
    const zuzycie = Math.max(0, 1 - doRogu / 0.014) * 0.75 + Math.max(0, 1 - doKrawedzi / 0.0025) * 0.22;
    k.copy(baza).lerp(jasny, Math.min(0.85, zuzycie));
    barwy.set([k.r, k.g, k.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(barwy, 3));
  g.computeVertexNormals();
  return { geometria: g, garb, t };
}

/** One closed hardcover: cloth case, page block set back under the squares, index tabs, spine title. */
function ksiazka({ w, d, h, kolor, tytul, zaklad, wypaczenie, napis }, wspolne) {
  const grupa = new THREE.Group();
  const { geometria, garb, t } = oprawa(w, d, h, kolor, wypaczenie);
  const plotno = new THREE.MeshPhysicalMaterial({
    vertexColors: true, map: wspolne.splot, bumpMap: wspolne.splot, bumpScale: 0.6, roughness: 0.86,
    sheen: 0.4, sheenRoughness: 0.7, sheenColor: new THREE.Color("#fff4e0"),
  });
  grupa.add(new THREE.Mesh(geometria, plotno));

  const kant = 0.003; // the boards stand proud of the page block by this much
  const bw = w - garb - kant - 0.0012, bd = d - 2 * kant, bh = h - 2 * t - 0.0006;
  const blok = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), [wspolne.strony, wspolne.strony, wspolne.ciemne, wspolne.ciemne, wspolne.strony, wspolne.strony]);
  blok.position.set(-w / 2 + garb + 0.0012 + bw / 2, h / 2, 0); // fore-edge sits `kant` inside the boards
  grupa.add(blok);

  // index tabs between the pages, sticking out of the fore-edge (08-wieczor)
  zaklad.forEach(([barwa, zz, yy], i) => {
    const z = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.0005, 0.016), wspolne.zakladki[barwa]);
    z.position.set(blok.position.x + bw / 2 + 0.0035, t + bh * yy, zz * bd / 2);
    z.rotation.y = (i % 2 ? 1 : -1) * 0.04;
    grupa.add(z);
  });

  // foil lettering along the book's length, bent to follow the curve of the spine half a millimetre out
  const pas = new THREE.PlaneGeometry(d * 0.82, h * 0.42, 1, 8);
  const pp = pas.attributes.position;
  for (let i = 0; i < pp.count; i++) {
    const v = pp.getY(i) / (h / 2);
    pp.setZ(i, -garb * (1 - Math.sqrt(1 - v * v)));
  }
  pas.computeVertexNormals();
  const etykieta = new THREE.Mesh(
    pas,
    new THREE.MeshStandardMaterial({ map: napisGrzbietu(tytul, napis), transparent: true, alphaTest: 0.25, metalness: 0.55, roughness: 0.38, depthWrite: false }),
  );
  etykieta.rotation.y = -Math.PI / 2;
  etykieta.position.set(-w / 2 - 0.0009, h / 2, 0); // the bevel puts the cloth apex 0.4 mm past -w/2
  grupa.add(etykieta);
  return cien(grupa);
}

// Cream and greige cloth like the reference stack, two in the RelAI clay and sage; titles are RelAI's own files.
const KSIAZKI = [
  { w: 0.158, d: 0.232, h: 0.031, kolor: "#d6cab0", tytul: "DZIENNIK", napis: "#7a5a32", wypaczenie: 0.0012, zaklad: [["glina", -0.55, 0.7], ["musztarda", -0.1, 0.45], ["szalwia", 0.35, 0.25]] },
  { w: 0.152, d: 0.224, h: 0.024, kolor: "#5f7a63", tytul: "DECYZJE", napis: "#e3cf9a", wypaczenie: 0.0008, zaklad: [["kartka", 0.2, 0.5]] },
  { w: 0.162, d: 0.236, h: 0.028, kolor: "#c9bda5", tytul: "LEKCJE", napis: "#6d5233", wypaczenie: 0.0016, zaklad: [["musztarda", -0.4, 0.6], ["glina", 0.15, 0.35]] },
  { w: 0.146, d: 0.214, h: 0.02, kolor: "#9c4e33", tytul: "PLAN", napis: "#ecd8a8", wypaczenie: 0.001, zaklad: [] },
];

/** A tidy-ish stack of four hardcovers; the spines face the camera at the panel and install stops. */
export function ksiazki() {
  const papierZakladki = (kolor) => new THREE.MeshStandardMaterial({ color: kolor, roughness: 0.8 });
  const wspolne = {
    splot: splot(),
    strony: new THREE.MeshStandardMaterial({ map: bokStron(), roughness: 0.92, color: "#f3ead6" }),
    ciemne: new THREE.MeshStandardMaterial({ color: "#d9cfb8", roughness: 0.95 }),
    zakladki: {
      glina: papierZakladki(T.KOLOR.glina), musztarda: papierZakladki(T.KOLOR.musztarda),
      szalwia: papierZakladki("#7fa486"), kartka: papierZakladki(T.KOLOR.kartka2),
    },
  };
  wspolne.splot.repeat.set(SKALA_SPLOTU, SKALA_SPLOTU);
  const grupa = new THREE.Group();
  const los = T.losowanie(131);
  let y = BLAT;
  KSIAZKI.forEach((opis) => {
    const k = ksiazka(opis, wspolne);
    k.position.set((los() - 0.5) * 0.01, y, (los() - 0.5) * 0.012);
    k.rotation.y = (los() - 0.5) * 0.2;
    grupa.add(k);
    y += opis.h + 0.0004;
  });
  grupa.position.set(0.9, 0, -0.15);
  // the spine normal (-cos r, 0, sin r) points at the cameras of the panel and install stops
  grupa.rotation.y = 0.95;
  return grupa;
}

/** Push pins on the cork board (positions are in the board's own frame, z in front of the cork). */
function pinezka(kolor) {
  const g = new THREE.Group();
  const glowka = new THREE.Mesh(new THREE.SphereGeometry(0.0085, 20, 14), new THREE.MeshPhysicalMaterial({ color: kolor, roughness: 0.28, clearcoat: 0.7 }));
  glowka.scale.z = 0.7;
  const nozka = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0045, 0.008, 12), new THREE.MeshStandardMaterial({ color: "#cfc9bd", roughness: 0.3, metalness: 0.8 }));
  nozka.rotation.x = Math.PI / 2;
  nozka.position.z = -0.004;
  g.add(glowka, nozka);
  return cien(g);
}

/** Extra notes, pins and a red twine on the board; the logo card and two prints stay as built. */
export function tablicaSzczegoly(rej) {
  const grupa = new THREE.Group();
  const zZ = 0.0095;
  const pinezki = [
    ["#c4643c", -0.28, 0.168], ["#d9a134", 0.3, 0.19], ["#5f8a68", 0.26, -0.075],
    ["#c4643c", -0.34, -0.115], ["#d9a134", 0.1, -0.165], ["#5f8a68", -0.18, -0.185],
  ];
  for (const [k, x, y] of pinezki) {
    const p = pinezka(k);
    p.position.set(x, y, zZ + 0.0035);
    grupa.add(p);
  }
  // sticky notes and an index card
  [["pytania?", "#f3d77f", -0.34, -0.15, 0.05, 150], ["plan", "#cddbbc", 0.1, -0.2, -0.08, 151], ["dziś", "#f2bfa1", -0.18, -0.22, 0.1, 152]].forEach(([tekst, kolor, x, y, r, ziarno]) => {
    const m = papier(rej, { map: T.karteczka(tekst, kolor, ziarno) });
    const n = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.075), m);
    n.position.set(x, y, zZ + 0.0006);
    n.rotation.z = r;
    grupa.add(cien(n, true, true));
  });
  // red twine hanging between two pins
  const a = new THREE.Vector3(-0.28, 0.168, zZ + 0.006);
  const b = new THREE.Vector3(0.3, 0.19, zZ + 0.006);
  const sr = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5).add(new THREE.Vector3(0, -0.075, 0.003));
  const nitka = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, sr, b), 60, 0.0011, 6),
    new THREE.MeshStandardMaterial({ color: "#b4452a", roughness: 0.9 }),
  );
  grupa.add(cien(nitka, true, false));
  return grupa;
}

/** A glass pane with a weak reflection and a catch on the window frame. */
export function oknoSzczegoly(W, H) {
  const grupa = new THREE.Group();
  const szyba = new THREE.Mesh(
    new THREE.PlaneGeometry(W, H),
    new THREE.MeshPhysicalMaterial({ color: "#a9b8d0", transparent: true, opacity: 0.08, roughness: 0.04, metalness: 0, envMapIntensity: 1.6 }),
  );
  szyba.position.z = 0.012;
  grupa.add(szyba);
  const zamek = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.07, 0.018), new THREE.MeshStandardMaterial({ color: "#a98a52", metalness: 1, roughness: 0.4 }));
  zamek.position.set(0.018, -0.05, 0.05);
  grupa.add(cien(zamek));
  return grupa;
}

/** Stage-two models: framed prints and a bedside clock. `postaw` puts a model on the desk top. */
export function modeleWyposazenia(B, postaw) {
  const grupa = new THREE.Group();
  // the glass panes of the scans read as black plates in the passes; the frames keep their prints without them
  const cienie = (o) => o.traverse((m) => {
    if (!m.isMesh) return;
    if (/glass/i.test(m.material.name)) m.visible = false;
    m.castShadow = true;
    m.receiveShadow = true;
  });
  const ramkaStojaca = B.ramkaStojaca.clone(true);
  cienie(ramkaStojaca);
  const rs = postaw(ramkaStojaca, 0.47, -0.4, { skala: 0.95, obrot: -Math.PI / 2 + 0.2 });
  grupa.add(rs);
  const zegar = B.zegar.clone(true);
  cienie(zegar);
  grupa.add(postaw(zegar, 0.8, -0.08, { skala: 0.62, obrot: 2.6 + Math.PI }));
  const obraz = B.obraz.clone(true);
  cienie(obraz);
  obraz.scale.setScalar(0.62);
  obraz.position.set(-0.6, 1.5, -0.6);
  obraz.rotation.z = -0.012;
  grupa.add(obraz);
  return grupa;
}

