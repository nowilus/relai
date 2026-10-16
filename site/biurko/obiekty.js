// The desk and everything on it, built from code. Metres; the desk top is at y = 0.75.
import * as THREE from "three";
import * as T from "./tekstury.js";

export const BLAT = 0.75;

function zaokraglonyProstokat(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** A rounded slab lying flat: top face at y = depth (+ bevel). UVs of the top run 0..1. */
function plyta(w, d, grubosc, r, faza = 0.004) {
  const g = new THREE.ExtrudeGeometry(zaokraglonyProstokat(w, d, r), {
    depth: grubosc, bevelEnabled: true, bevelThickness: faza, bevelSize: faza, bevelSegments: 4, curveSegments: 10,
  });
  g.rotateX(-Math.PI / 2);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / w + 0.5, uv.getY(i) / d + 0.5);
  return g;
}

function cien(o, rzuca = true, odbiera = true) {
  o.traverse((m) => {
    if (m.isMesh) {
      m.castShadow = rzuca;
      m.receiveShadow = odbiera;
    }
  });
  return o;
}

/** A sheet lying on the desk, gently not quite flat. */
function arkusz(w, h, mapa, { zgiecie = 0.004, ziarno = 1 } = {}) {
  const g = new THREE.PlaneGeometry(w, h, 10, 14);
  const los = T.losowanie(ziarno);
  const fala = los() * 6.28;
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / w, y = p.getY(i) / h;
    // never below zero: a sheet that dips under the desk shows the wood through a hole
    p.setZ(i, ((Math.sin(x * 3 + fala) + 1) * 0.2 + y * y) * zgiecie);
  }
  g.computeVertexNormals();
  g.rotateX(-Math.PI / 2);
  const m = new THREE.MeshStandardMaterial({ map: mapa, roughness: 0.92, side: THREE.DoubleSide });
  return cien(new THREE.Mesh(g, m));
}

function biurko() {
  const grupa = new THREE.Group();
  const mapa = T.drewno();
  const top = new THREE.Mesh(
    plyta(1.8, 0.9, 0.032, 0.035, 0.006),
    new THREE.MeshStandardMaterial({ map: mapa, roughnessMap: T.drewnoChropowatosc(), roughness: 0.72, metalness: 0 }),
  );
  top.position.y = BLAT - 0.032 - 0.006;
  grupa.add(cien(top, true, true));
  const nogi = new THREE.MeshStandardMaterial({ color: "#2b2019", roughness: 0.7 });
  for (const [x, z] of [[-0.84, -0.38], [0.84, -0.38], [-0.84, 0.38], [0.84, 0.38]]) {
    const n = new THREE.Mesh(new THREE.BoxGeometry(0.05, BLAT - 0.04, 0.05), nogi);
    n.position.set(x, (BLAT - 0.04) / 2, z);
    grupa.add(cien(n));
  }
  const podloga = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.MeshStandardMaterial({ color: "#1b1712", roughness: 0.9 }),
  );
  podloga.rotation.x = -Math.PI / 2;
  podloga.receiveShadow = true;
  grupa.add(podloga);
  return grupa;
}

function sciana() {
  const grupa = new THREE.Group();
  const s = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 3.2),
    new THREE.MeshStandardMaterial({ map: T.tynk(), roughness: 0.96 }),
  );
  s.position.set(0, 1.6, -0.62);
  s.receiveShadow = true;
  grupa.add(s);

  // window: sky behind a deep wooden frame
  const okno = new THREE.Group();
  const W = 0.86, H = 0.98;
  const niebo = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: T.niebo() }));
  niebo.position.z = -0.03;
  okno.add(niebo);
  const rama = new THREE.MeshStandardMaterial({ color: "#3a2a1e", roughness: 0.6 });
  const belka = (w, h, x, y, d = 0.06) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), rama);
    b.position.set(x, y, 0);
    okno.add(cien(b));
  };
  belka(W + 0.08, 0.05, 0, H / 2 + 0.015);
  belka(W + 0.08, 0.05, 0, -H / 2 - 0.015);
  belka(0.05, H + 0.08, -W / 2 - 0.015, 0);
  belka(0.05, H + 0.08, W / 2 + 0.015, 0);
  belka(0.025, H, 0, 0, 0.035);
  belka(W, 0.025, 0, 0.08, 0.035);
  const parapet = new THREE.Mesh(new THREE.BoxGeometry(W + 0.2, 0.025, 0.12), rama);
  parapet.position.set(0, -H / 2 - 0.05, 0.04);
  okno.add(cien(parapet));
  okno.position.set(1.12, 1.55, -0.6);
  grupa.add(okno);
  return grupa;
}

function tablica() {
  const grupa = new THREE.Group();
  const W = 0.7, H = 0.5;
  const kork = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.012), new THREE.MeshStandardMaterial({ map: T.korek(), roughness: 1 }));
  grupa.add(cien(kork, false, true));
  const rama = new THREE.MeshStandardMaterial({ color: "#a37c55", roughness: 0.55 });
  for (const [w, h, x, y] of [[W + 0.04, 0.02, 0, H / 2 + 0.01], [W + 0.04, 0.02, 0, -H / 2 - 0.01], [0.02, H, -W / 2 - 0.01, 0], [0.02, H, W / 2 + 0.01, 0]]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.026), rama);
    b.position.set(x, y, 0.004);
    grupa.add(cien(b));
  }

  // the logo card: paper you can light, with a real pin and a strip of tape
  const karta = new THREE.Group();
  const papier = new THREE.MeshStandardMaterial({ color: T.KOLOR.kartka, roughness: 0.9 });
  const front = new THREE.MeshStandardMaterial({ map: T.kartkaLogo(), roughness: 0.88 });
  const plat = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.195, 0.0015), [papier, papier, papier, papier, front, papier]);
  karta.add(cien(plat));
  const pinezka = new THREE.Group();
  const glowka = new THREE.Mesh(new THREE.SphereGeometry(0.011, 24, 16), new THREE.MeshStandardMaterial({ color: T.KOLOR.glina, roughness: 0.25 }));
  glowka.scale.z = 0.8;
  glowka.position.z = 0.012;
  const nozka = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0055, 0.01, 16), new THREE.MeshStandardMaterial({ color: "#d9cbb0", roughness: 0.3, metalness: 0.4 }));
  nozka.rotation.x = Math.PI / 2;
  nozka.position.z = 0.005;
  pinezka.add(glowka, nozka);
  pinezka.position.set(0, 0.075, 0.001);
  karta.add(cien(pinezka));
  const tasma = new THREE.Mesh(
    new THREE.PlaneGeometry(0.075, 0.022),
    new THREE.MeshStandardMaterial({ color: "#e8d6b0", roughness: 0.6, transparent: true, opacity: 0.78 }),
  );
  tasma.position.set(-0.11, 0.092, 0.0012);
  tasma.rotation.z = 0.5;
  karta.add(tasma);
  karta.position.set(-0.04, 0.02, 0.008);
  karta.rotation.z = -0.035;
  grupa.add(karta);

  // a second, quieter note on the board
  const notka = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.001), [papier, papier, papier, papier,
    new THREE.MeshStandardMaterial({ map: T.karteczka("E1 · E2 · E3", "#f2dc9a", 41), roughness: 0.9 }), papier]);
  notka.position.set(0.22, -0.1, 0.008);
  notka.rotation.z = 0.06;
  grupa.add(cien(notka));

  grupa.position.set(0.2, 1.31, -0.6);
  grupa.userData.karta = karta;
  return grupa;
}

function lampa() {
  const grupa = new THREE.Group();
  const lakier = new THREE.MeshStandardMaterial({ color: "#c08a2e", roughness: 0.38, metalness: 0.25 });
  const ciemny = new THREE.MeshStandardMaterial({ color: "#2a241e", roughness: 0.5, metalness: 0.4 });
  const podstawa = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.085, 0.022, 48), lakier);
  podstawa.position.y = 0.011;
  grupa.add(podstawa);
  const ramie = (a, b, r = 0.0075) => {
    const v = new THREE.Vector3().subVectors(b, a);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, v.length(), 16), lakier);
    m.position.copy(a).addScaledVector(v, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.clone().normalize());
    grupa.add(m);
  };
  const p0 = new THREE.Vector3(0, 0.022, 0);
  const lokiec = new THREE.Vector3(0.05, 0.4, 0.07);
  const glowa = new THREE.Vector3(0.23, 0.44, 0.24);
  ramie(p0, lokiec);
  ramie(lokiec, glowa, 0.0065);
  for (const p of [p0, lokiec]) {
    const z = new THREE.Mesh(new THREE.SphereGeometry(0.013, 16, 12), ciemny);
    z.position.copy(p);
    grupa.add(z);
  }
  // the shade points down and forward
  const klosz = new THREE.Group();
  const zewn = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.085, 0.13, 48, 1, true), lakier);
  const wewn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.023, 0.084, 0.129, 48, 1, true),
    new THREE.MeshStandardMaterial({ color: "#f3e3c2", roughness: 0.6, emissive: "#ffcf8a", emissiveIntensity: 0.35, side: THREE.BackSide }),
  );
  const zarowka = new THREE.Mesh(new THREE.SphereGeometry(0.022, 24, 16), new THREE.MeshBasicMaterial({ color: "#fff1d6" }));
  zarowka.position.y = -0.03;
  klosz.add(zewn, wewn, zarowka);
  klosz.position.copy(glowa);
  klosz.rotation.set(0.62, 0, -0.48);
  grupa.add(klosz);
  cien(grupa, true, true);
  wewn.castShadow = false;
  zarowka.castShadow = false;
  grupa.position.set(0.62, BLAT, -0.38);
  grupa.rotation.y = -1.6;
  grupa.userData.zrodlo = klosz;
  return grupa;
}

export const BARWY_KARTECZEK = ["#f3d77f", "#f6e8bd", "#cddbbc", "#f2bfa1", "#f3d77f", "#f6e8bd", "#cddbbc"];

function karteczki(pytania) {
  const grupa = new THREE.Group();
  const los = T.losowanie(53);
  const miejsca = [[-0.08, 0.12], [0.04, 0.26], [0.15, 0.14], [-0.03, 0.33], [0.25, 0.28], [0.09, 0.03], [0.31, 0.12]];
  pytania.forEach((p, i) => {
    const [x, z] = miejsca[i % miejsca.length];
    const k = arkusz(0.076, 0.076, T.karteczka(p, BARWY_KARTECZEK[i % BARWY_KARTECZEK.length], 60 + i), { zgiecie: 0.006, ziarno: 70 + i });
    k.position.set(x, BLAT + 0.0012 + i * 0.0005, z);
    k.rotation.y = (los() - 0.5) * 1.1;
    grupa.add(k);
  });
  return grupa;
}

function dokumenty(nazwy) {
  const grupa = new THREE.Group();
  nazwy.forEach(([tytul, plik], i) => {
    const d = arkusz(0.21, 0.297, T.dokument(tytul, plik, 80 + i), { zgiecie: 0.003, ziarno: 90 + i });
    d.position.set(0.0 + i * 0.065, BLAT + 0.001 + i * 0.0009, -0.12 + i * 0.018);
    d.rotation.y = 0.12 - i * 0.07;
    grupa.add(d);
  });
  return grupa;
}

function teczka(etykieta) {
  const grupa = new THREE.Group();
  const karton = new THREE.MeshStandardMaterial({ map: T.karton(), roughness: 0.85 });
  const cialo = new THREE.Mesh(plyta(0.25, 0.33, 0.014, 0.006, 0.002), karton);
  grupa.add(cien(cialo));
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.06), new THREE.MeshStandardMaterial({ map: T.etykietaTeczki(etykieta), roughness: 0.9 }));
  lab.rotation.x = -Math.PI / 2;
  lab.position.set(0, 0.0182, -0.06);
  grupa.add(lab);
  const gumka = new THREE.Mesh(new THREE.BoxGeometry(0.256, 0.0035, 0.008), new THREE.MeshStandardMaterial({ color: T.KOLOR.glina2, roughness: 0.5 }));
  gumka.position.set(0, 0.018, 0.1);
  grupa.add(cien(gumka));
  grupa.position.set(0.37, BLAT, -0.17);
  grupa.rotation.y = 0.12;
  return grupa;
}

/** Laptop: aluminium base and lid, the display a named mesh the scene swaps content on. */
function laptop() {
  const grupa = new THREE.Group();
  const alu = new THREE.MeshStandardMaterial({ color: "#a9a7a3", roughness: 0.32, metalness: 0.7 });
  const W = 0.31, D = 0.215;
  const baza = new THREE.Mesh(plyta(W, D, 0.01, 0.012, 0.002), alu);
  grupa.add(cien(baza));
  const klawiatura = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.04, 0.1), new THREE.MeshStandardMaterial({ color: "#1d1b19", roughness: 0.7 }));
  klawiatura.rotation.x = -Math.PI / 2;
  klawiatura.position.set(0, 0.0122, -0.03);
  grupa.add(klawiatura);
  const gladzik = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.06), new THREE.MeshStandardMaterial({ color: "#9b9995", roughness: 0.25, metalness: 0.6 }));
  gladzik.rotation.x = -Math.PI / 2;
  gladzik.position.set(0, 0.0121, 0.065);
  grupa.add(gladzik);

  const klapa = new THREE.Group();
  const tyl = new THREE.Mesh(plyta(W, D, 0.005, 0.012, 0.0015), alu);
  tyl.rotation.x = Math.PI / 2;
  tyl.position.set(0, D / 2, -0.004);
  klapa.add(cien(tyl));
  const ramka = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.004, D - 0.004), new THREE.MeshStandardMaterial({ color: "#121110", roughness: 0.3 }));
  ramka.position.set(0, D / 2, 0.0035);
  klapa.add(ramka);
  const ekran = new THREE.Mesh(
    new THREE.PlaneGeometry(0.284, 0.1775),
    new THREE.MeshStandardMaterial({ color: "#000000", emissive: "#ffffff", emissiveMap: T.ekranPanelu(), emissiveIntensity: 0.85, roughness: 0.18 }),
  );
  ekran.position.set(0, D / 2 + 0.006, 0.0037);
  ekran.name = "ekran";
  klapa.add(ekran);
  klapa.position.set(0, 0.012, -D / 2);
  klapa.rotation.x = -0.26;
  grupa.add(klapa);
  grupa.position.set(0.55, BLAT, 0.17);
  grupa.rotation.y = -0.32;
  grupa.userData.ekran = ekran;
  return grupa;
}

function pudelko() {
  const grupa = new THREE.Group();
  const karton = new THREE.MeshStandardMaterial({ map: T.karton(43), roughness: 0.85 });
  const W = 0.17, D = 0.11, H = 0.075, g = 0.004;
  for (const [w, h, d, x, y, z] of [[W, g, D, 0, g / 2, 0], [W, H, g, 0, H / 2, -D / 2], [W, H, g, 0, H / 2, D / 2], [g, H, D, -W / 2, H / 2, 0], [g, H, D, W / 2, H / 2, 0]]) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), karton);
    s.position.set(x, y, z);
    grupa.add(cien(s));
  }
  const biala = new THREE.MeshStandardMaterial({ color: T.KOLOR.kartka, roughness: 0.9 });
  const zakladki = [T.KOLOR.glina, T.KOLOR.musztarda, T.KOLOR.szalwia];
  for (let i = 0; i < 15; i++) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(W - 0.014, 0.085, 0.0012), biala);
    f.position.set(0, 0.046, -D / 2 + 0.012 + i * 0.006);
    f.rotation.x = -0.18 + (i % 3) * 0.02;
    grupa.add(cien(f));
    if (i % 3 === 0) {
      const z = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, 0.0014), new THREE.MeshStandardMaterial({ color: zakladki[(i / 3) % 3], roughness: 0.8 }));
      z.position.set(-0.05 + (i % 5) * 0.02, 0.094, f.position.z);
      z.rotation.x = f.rotation.x;
      grupa.add(z);
    }
  }
  grupa.position.set(0.25, BLAT, -0.44);
  grupa.rotation.y = 0.12;
  return grupa;
}

function kubek() {
  const grupa = new THREE.Group();
  const profil = [[0, 0], [0.036, 0], [0.041, 0.004], [0.043, 0.02], [0.044, 0.094], [0.042, 0.098], [0.039, 0.096], [0.038, 0.02], [0.034, 0.013], [0, 0.013]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  const szkliwo = new THREE.MeshStandardMaterial({ color: "#8f4528", roughness: 0.34, metalness: 0 });
  const cialo = new THREE.Mesh(new THREE.LatheGeometry(profil, 64), szkliwo);
  const ucho = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.0065, 16, 32, Math.PI * 1.1), szkliwo);
  ucho.position.set(0.044, 0.052, 0);
  ucho.rotation.z = -Math.PI * 0.55;
  const kawa = new THREE.Mesh(new THREE.CircleGeometry(0.038, 48), new THREE.MeshStandardMaterial({ color: "#24160d", roughness: 0.15 }));
  kawa.rotation.x = -Math.PI / 2;
  kawa.position.y = 0.075;
  grupa.add(cialo, ucho, kawa);
  cien(grupa);
  grupa.position.set(0.33, BLAT, 0.42);
  grupa.rotation.y = 2.6;
  return grupa;
}

function olowek() {
  const grupa = new THREE.Group();
  const cialo = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0042, 0.16, 6), new THREE.MeshStandardMaterial({ color: T.KOLOR.musztarda, roughness: 0.45 }));
  const drewno = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0012, 0.02, 6), new THREE.MeshStandardMaterial({ color: "#e2c49a", roughness: 0.8 }));
  drewno.position.y = 0.09;
  const grafit = new THREE.Mesh(new THREE.ConeGeometry(0.0012, 0.004, 8), new THREE.MeshStandardMaterial({ color: "#2b2b2b", roughness: 0.4, metalness: 0.3 }));
  grafit.position.y = 0.102;
  grupa.add(cialo, drewno, grafit);
  cien(grupa);
  grupa.rotation.set(0, 0.5, Math.PI / 2);
  grupa.position.set(0.12, BLAT + 0.0042, 0.39);
  return grupa;
}

/** Builds the desk. `tresc` carries the language-dependent words drawn on objects. */
export function zbudujBiurko(tresc) {
  const swiat = new THREE.Group();
  const obiekty = {
    biurko: biurko(),
    sciana: sciana(),
    tablica: tablica(),
    lampa: lampa(),
    karteczki: karteczki(tresc.karteczki),
    dokumenty: dokumenty(tresc.dokumenty),
    teczka: teczka(tresc.teczka),
    laptop: laptop(),
    pudelko: pudelko(),
    kubek: kubek(),
    olowek: olowek(),
  };
  for (const o of Object.values(obiekty)) swiat.add(o);
  return { swiat, obiekty };
}
