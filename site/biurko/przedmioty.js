// The small things on the desk, built in code on the CC0 material sets: laptop, mug, card box,
// folder, documents, sticky notes. Metres; every object stands on y = BLAT.
import * as THREE from "three";
import * as T from "./tekstury.js";
import { BLAT, plyta, cien, arkusz, skrzynka } from "./geometria.js";
import { SKALA_BLATU, drewno, papier, kraft, aluminium } from "./materialy.js";

const WIERSZE_KLAWIATURY = [
  { wys: 0.6, klawisze: Array(14).fill(1) },
  { wys: 1, klawisze: [...Array(13).fill(1), 1.5] },
  { wys: 1, klawisze: [1.5, ...Array(12).fill(1), 1.5] },
  { wys: 1, klawisze: [1.75, ...Array(11).fill(1), 2.25] },
  { wys: 1, klawisze: [2.25, ...Array(10).fill(1), 2.75] },
  { wys: 1, klawisze: [1.25, 1.25, 1.25, 6.2, 1.25, 1.25, 1.25] },
];

// Legends per row, in the order of WIERSZE_KLAWIATURY; a label longer than two characters is a modifier.
const ETYKIETY = [
  ["esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "⏻"],
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "delete"],
  ["tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
  ["caps lock", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "return"],
  ["shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "shift"],
  ["fn", "control", "option", "", "command", "option", "◀ ▶"],
];
const RZAD_KLAWISZY = 0.0188; // key pitch along the depth
const PX_NA_METR = 7600;

/** Printed legends of the keyboard on a transparent sheet: the QWERTY layout, letters centred, modifiers in a corner. */
function napisyKlawiatury(szer) {
  const jednostka = szer / 14.6;
  const glebokosc = WIERSZE_KLAWIATURY.reduce((s, w) => s + w.wys, 0) * RZAD_KLAWISZY;
  const c = document.createElement("canvas");
  c.width = Math.round(szer * PX_NA_METR);
  c.height = Math.round(glebokosc * PX_NA_METR);
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#c9c7cc";
  let z = 0;
  WIERSZE_KLAWIATURY.forEach((w, r) => {
    const wys = w.wys * RZAD_KLAWISZY;
    let x = -w.klawisze.reduce((a, b) => a + b, 0) * jednostka / 2;
    w.klawisze.forEach((u, k) => {
      const tekst = ETYKIETY[r][k];
      const sz = u * jednostka;
      const px = (x + szer / 2) * PX_NA_METR, py = z * PX_NA_METR;
      const pw = sz * PX_NA_METR, ph = wys * PX_NA_METR;
      if (tekst.length <= 2 && r > 0) {
        ctx.font = `500 ${Math.round(ph * 0.36)}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, px + pw / 2, py + ph / 2);
      } else if (tekst) {
        ctx.font = `500 ${Math.round(ph * (r === 0 ? 0.42 : 0.22))}px system-ui, sans-serif`;
        ctx.textAlign = r === 0 ? "center" : "left";
        ctx.textBaseline = r === 0 ? "middle" : "bottom";
        ctx.fillText(tekst, r === 0 ? px + pw / 2 : px + ph * 0.18, r === 0 ? py + ph / 2 : py + ph * 0.82);
      }
      x += sz;
    });
    z += wys;
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  const arkusz = new THREE.Mesh(
    new THREE.PlaneGeometry(szer, glebokosc),
    new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.5, depthWrite: false }),
  );
  arkusz.rotation.x = -Math.PI / 2;
  arkusz.position.set(0, 0.0037, glebokosc / 2);
  arkusz.receiveShadow = true;
  return arkusz;
}

/** Instanced keys: rows of 14.6 key units across `szer`, laid from the hinge side toward the user. */
function klawiatura(szer) {
  const jednostka = szer / 14.6;
  const rzad = RZAD_KLAWISZY;
  const liczba = WIERSZE_KLAWIATURY.reduce((s, w) => s + w.klawisze.length, 0);
  const klawisze = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: "#1b1a1c", roughness: 0.55, metalness: 0.1 }),
    liczba,
  );
  const m = new THREE.Matrix4();
  const obrot = new THREE.Quaternion();
  let n = 0;
  let z = 0;
  for (const w of WIERSZE_KLAWIATURY) {
    const wysokosc = w.wys * rzad;
    const dlugosc = w.klawisze.reduce((a, b) => a + b, 0) * jednostka;
    let x = -dlugosc / 2;
    for (const u of w.klawisze) {
      const szerKlawisza = u * jednostka;
      m.compose(
        new THREE.Vector3(x + szerKlawisza / 2, 0.0018, z + wysokosc / 2),
        obrot,
        new THREE.Vector3(szerKlawisza - 0.0028, 0.0036, wysokosc - 0.0028),
      );
      klawisze.setMatrixAt(n++, m);
      x += szerKlawisza;
    }
    z += wysokosc;
  }
  klawisze.castShadow = true;
  klawisze.receiveShadow = true;
  const grupa = new THREE.Group();
  grupa.add(klawisze, napisyKlawiatury(szer));
  return grupa;
}

/** Laptop: aluminium base and lid, keys, trackpad; the display is a named mesh the scene swaps content on. */
export function laptop(rej) {
  const grupa = new THREE.Group();
  const alu = aluminium(rej);
  const W = 0.304, D = 0.212;
  const baza = new THREE.Mesh(plyta(W, D, 0.0125, 0.012, 0.0015), alu);
  grupa.add(cien(baza));

  const studnia = new THREE.Mesh(
    new THREE.BoxGeometry(W - 0.026, 0.003, 0.104),
    new THREE.MeshStandardMaterial({ color: "#0b0a0c", roughness: 1 }),
  );
  studnia.position.set(0, 0.0152, -0.046);
  grupa.add(studnia);
  const keys = klawiatura(W - 0.034);
  keys.position.set(0, 0.0152, -0.046 - 0.052 + 0.002);
  grupa.add(keys);

  const gladzik = new THREE.Mesh(new THREE.PlaneGeometry(0.114, 0.074), aluminium(rej, { color: "#9a989b", roughness: 0.36 }));
  gladzik.rotation.x = -Math.PI / 2;
  gladzik.position.set(0, 0.0152, 0.058);
  grupa.add(gladzik);
  const krawedz = new THREE.MeshBasicMaterial({ color: "#2b2a2c" });
  for (const [w, d, x, z] of [[0.116, 0.0012, 0, 0.0205], [0.116, 0.0012, 0, 0.0955], [0.0012, 0.074, -0.058, 0.058], [0.0012, 0.074, 0.058, 0.058]]) {
    const k = new THREE.Mesh(new THREE.PlaneGeometry(w, d), krawedz);
    k.rotation.x = -Math.PI / 2;
    k.position.set(x, 0.0154, z);
    grupa.add(k);
  }

  const klapa = new THREE.Group();
  const tyl = new THREE.Mesh(plyta(W, D, 0.0034, 0.012, 0.0014), alu);
  tyl.rotation.x = Math.PI / 2;
  tyl.position.set(0, D / 2, -0.004);
  klapa.add(cien(tyl));
  const ramka = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.004, D - 0.004), new THREE.MeshStandardMaterial({ color: "#0e0d0e", roughness: 0.28 }));
  ramka.position.set(0, D / 2, 0.0036);
  klapa.add(ramka);
  const ekran = new THREE.Mesh(
    new THREE.PlaneGeometry(0.284, 0.1775),
    new THREE.MeshStandardMaterial({ color: "#000000", emissive: "#ffffff", emissiveMap: T.ekranPanelu(), emissiveIntensity: 0.85, roughness: 0.18 }),
  );
  ekran.position.set(0, D / 2 + 0.006, 0.0038);
  ekran.name = "ekran";
  klapa.add(ekran);
  const zawias = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0042, W - 0.05, 20), new THREE.MeshStandardMaterial({ color: "#2a292b", roughness: 0.4, metalness: 0.8 }));
  zawias.rotation.z = Math.PI / 2;
  zawias.position.set(0, 0.002, -0.001);
  klapa.add(zawias);
  klapa.position.set(0, 0.0128, -D / 2 + 0.002);
  klapa.rotation.x = -0.26;
  grupa.add(klapa);
  grupa.position.set(0.55, BLAT, 0.17);
  grupa.rotation.y = -0.32;
  grupa.userData.ekran = ekran;
  return grupa;
}

/**
 * Half-section of a stoneware mug for a lathe: a slightly bellied outer wall, a thick lip rolled
 * round in a half circle, the inner wall and a well. Metres; y = 0 is where the glaze starts.
 */
function profilKubka() {
  const p = [[0.0, 0.0045], [0.0368, 0.0045], [0.0392, 0.012], [0.0408, 0.03], [0.0418, 0.055], [0.0421, 0.08], [0.0419, 0.089]];
  const GRUB = 0.0048; // wall thickness at the lip
  const sr = [0.0419 - GRUB / 2, 0.089];
  for (let i = 1; i < 12; i++) {
    const a = (Math.PI * i) / 12;
    p.push([sr[0] + Math.cos(a) * GRUB / 2, sr[1] + Math.sin(a) * GRUB / 2 * 1.2]);
  }
  p.push([0.0371, 0.089], [0.0369, 0.06], [0.0358, 0.024], [0.032, 0.0135], [0.02, 0.0118], [0.0, 0.0115]);
  return p.map(([r, y]) => new THREE.Vector2(r, y));
}

export function kubek() {
  const grupa = new THREE.Group();
  const szkliwo = new THREE.MeshPhysicalMaterial({
    map: T.szkliwo(), roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 2.4,
    sheen: 0.15, sheenColor: new THREE.Color("#ffb080"), side: THREE.DoubleSide,
  });
  const cialo = new THREE.Mesh(new THREE.LatheGeometry(profilKubka(), 96), szkliwo);
  // the foot is bare clay where the glaze stops short of the table
  const glina = new THREE.MeshStandardMaterial({ color: "#b98a62", roughness: 0.9 });
  const stopka = new THREE.Mesh(new THREE.LatheGeometry([[0.0305, 0], [0.0352, 0.0012], [0.0368, 0.0045]].map(([r, y]) => new THREE.Vector2(r, y)), 96), glina);
  const sciezka = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.039, 0.081, 0), new THREE.Vector3(0.058, 0.087, 0), new THREE.Vector3(0.0715, 0.072, 0),
    new THREE.Vector3(0.0712, 0.046, 0), new THREE.Vector3(0.0575, 0.031, 0), new THREE.Vector3(0.0378, 0.028, 0),
  ]);
  const ucho = new THREE.Mesh(new THREE.TubeGeometry(sciezka, 48, 0.0082, 18), szkliwo);
  ucho.scale.z = 0.72; // an oval grip, flatter across than along
  const kawa = new THREE.Mesh(
    new THREE.CircleGeometry(0.0375, 48),
    new THREE.MeshPhysicalMaterial({ color: "#1b100a", roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05 }),
  );
  kawa.rotation.x = -Math.PI / 2;
  kawa.position.y = 0.0785;
  // a square felt coaster with rounded corners, as in the reference
  const podkladka = new THREE.Mesh(
    plyta(0.104, 0.104, 0.0022, 0.01, 0.0008),
    new THREE.MeshStandardMaterial({ color: "#8a7458", roughness: 0.98 }),
  );
  podkladka.rotation.y = 0.35;
  const Y = 0.003; // the clay foot stands on the coaster top; the glaze starts 4.5 mm up
  cialo.position.y = Y;
  stopka.position.y = Y;
  ucho.position.y = Y;
  kawa.position.y += Y;
  grupa.add(podkladka, stopka, cialo, ucho, kawa);
  cien(grupa);
  kawa.castShadow = false;
  grupa.position.set(0.42, BLAT, 0.3);
  grupa.rotation.y = 2.6;
  return grupa;
}

/** The index-card box: walnut walls, open lid on a hinge, standing cards with colour tabs, one pulled halfway out. */
export function pudelko(A, rej) {
  const grupa = new THREE.Group();
  const W = 0.2, D = 0.108, H = 0.096, g = 0.006;
  const sciany = (w, h, d) => new THREE.Mesh(skrzynka(w, h, d, SKALA_BLATU), drewno(A, 1, 1));
  const czesci = [[W, g, D, 0, g / 2, 0], [W, H, g, 0, H / 2, -D / 2 + g / 2], [W, H, g, 0, H / 2, D / 2 - g / 2], [g, H, D, -W / 2 + g / 2, H / 2, 0], [g, H, D, W / 2 - g / 2, H / 2, 0]];
  for (const [w, h, d, x, y, z] of czesci) {
    const s = sciany(w, h, d);
    s.position.set(x, y, z);
    grupa.add(cien(s));
  }
  const pokrywa = new THREE.Group();
  const wieko = sciany(W, 0.008, D);
  wieko.position.set(0, 0, D / 2);
  pokrywa.add(cien(wieko));
  pokrywa.position.set(0, H, -D / 2);
  pokrywa.rotation.x = -1.78;
  grupa.add(pokrywa);

  const karta = papier(rej, { color: "#e8dcc4" });
  const barwy = [T.KOLOR.glina, T.KOLOR.musztarda, T.KOLOR.szalwia];
  const los = T.losowanie(43);
  const liczba = 26;
  for (let i = 0; i < liczba; i++) {
    const z = -D / 2 + g + 0.004 + i * ((D - 2 * g - 0.01) / liczba);
    const wysuniecie = i === 17 ? 0.042 : 0;
    const f = new THREE.Mesh(new THREE.BoxGeometry(W - 2 * g - 0.006, 0.086, 0.0007), karta);
    f.position.set(0, 0.048 + wysuniecie, z);
    f.rotation.x = -0.05 + (los() - 0.5) * 0.05;
    grupa.add(cien(f));
    if (i % 5 === 2) {
      const t = new THREE.Mesh(new THREE.BoxGeometry(0.034, 0.012, 0.0009), new THREE.MeshStandardMaterial({ color: barwy[((i / 5) | 0) % 3], roughness: 0.85 }));
      t.position.set(-0.06 + ((i * 37) % 9) * 0.014, f.position.y + 0.048, z);
      t.rotation.x = f.rotation.x;
      grupa.add(cien(t));
    }
  }
  grupa.position.set(0.25, BLAT, -0.38);
  grupa.rotation.y = 0.12;
  return grupa;
}

const TABY = [T.KOLOR.glina, T.KOLOR.musztarda, T.KOLOR.szalwia, "#e2d6bd", "#3f5a47"];

/** The plan folder: kraft board, five coloured dividers sticking out of the right edge, a paper stack inside. */
export function teczka(etykieta, rej) {
  const grupa = new THREE.Group();
  const W = 0.235, D = 0.31;
  const karton = kraft(rej, 1, 1);
  const spod = new THREE.Mesh(plyta(W, D, 0.0026, 0.006, 0.0012), karton);
  grupa.add(cien(spod));
  const stos = new THREE.Mesh(new THREE.BoxGeometry(W - 0.014, 0.0145, D - 0.016), papier(rej, { color: "#ece4d2" }));
  stos.position.set(0, 0.0072 + 0.0026, 0);
  grupa.add(cien(stos));
  const gora = new THREE.Mesh(plyta(W, D, 0.0026, 0.006, 0.0012), karton);
  gora.position.y = 0.0042 + 0.0145 + 0.002;
  grupa.add(cien(gora));
  TABY.forEach((k, i) => {
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.0016, 0.044), new THREE.MeshStandardMaterial({ color: k, roughness: 0.85 }));
    t.position.set(W / 2 + 0.008, 0.0072 + 0.0026 + i * 0.0026, -D / 2 + 0.05 + i * 0.056);
    grupa.add(cien(t));
  });
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.06), new THREE.MeshStandardMaterial({ map: T.etykietaTeczki(etykieta), roughness: 0.9 }));
  lab.rotation.x = -Math.PI / 2;
  lab.position.set(0, gora.position.y + 0.0043, -0.075);
  grupa.add(lab);
  grupa.position.set(0.37, BLAT, -0.17);
  grupa.rotation.y = 0.12;
  return grupa;
}

export const BARWY_KARTECZEK = ["#f3d77f", "#f6e8bd", "#cddbbc", "#f2bfa1", "#f3d77f", "#f6e8bd", "#cddbbc"];

/** Sticky notes with questions to the agent, scattered, each with a curled corner. */
export function karteczki(pytania, rej) {
  const grupa = new THREE.Group();
  const los = T.losowanie(53);
  const miejsca = [[-0.08, 0.12], [0.04, 0.26], [0.15, 0.14], [-0.03, 0.33], [0.25, 0.28], [0.09, 0.03], [0.31, 0.12]];
  pytania.forEach((p, i) => {
    const [x, z] = miejsca[i % miejsca.length];
    const mat = papier(rej, { map: T.karteczka(p, BARWY_KARTECZEK[i % BARWY_KARTECZEK.length], 60 + i) });
    const k = arkusz(0.076, 0.076, mat, { zgiecie: 0.003, zawiniecie: 0.012, ziarno: 70 + i });
    k.position.set(x, BLAT + 0.0012 + i * 0.0005, z);
    k.rotation.y = (los() - 0.5) * 1.1;
    grupa.add(k);
  });
  return grupa;
}

/** Four project documents, loosely stacked and fanned. */
export function dokumenty(nazwy, rej) {
  const grupa = new THREE.Group();
  nazwy.forEach(([tytul, plik], i) => {
    const mat = papier(rej, { map: T.dokument(tytul, plik, 80 + i) });
    const d = arkusz(0.21, 0.297, mat, { zgiecie: 0.0035, zawiniecie: 0.006, ziarno: 90 + i });
    d.position.set(0.0 + i * 0.065, BLAT + 0.001 + i * 0.0009, -0.12 + i * 0.018);
    d.rotation.y = 0.12 - i * 0.07;
    grupa.add(d);
  });
  return grupa;
}
