// The room and its furniture, from the CC0 sets plus code. Metres; the desk top is at y = 0.75.
import * as THREE from "three";
import * as T from "./tekstury.js";
import { BLAT, plyta, skrzynka, cien } from "./geometria.js";
import { SKALA_BLATU, drewno, nowyRejestr, uzupelnijMaterialy } from "./materialy.js";
import { powtorz } from "./zasoby.js";
import { laptop, kubek, pudelko, teczka, karteczki, dokumenty } from "./przedmioty.js";
import { kable, ksiazki, tablicaSzczegoly, oknoSzczegoly, modeleWyposazenia } from "./wyposazenie.js";
import { miasto } from "./miasto.js";

export { BLAT };

const SCIANA_Z = -0.62;

/** The desk: a worn walnut top, a frame, and one drawer left a hand's width open. */
function biurko(A) {
  const grupa = new THREE.Group();
  const W = 1.8, D = 0.9, G = 0.036, faza = 0.005;
  const blat = new THREE.Mesh(plyta(W, D, G, 0.014, faza), drewno(A, W / SKALA_BLATU, D / SKALA_BLATU, { color: "#f0e8e0", roughness: 0.55, normalScale: new THREE.Vector2(1.1, 1.1) }));
  blat.position.y = BLAT - G - faza;
  grupa.add(cien(blat));

  const rama = (w, h, d, x, y, z) => {
    const m = new THREE.Mesh(skrzynka(w, h, d, SKALA_BLATU), drewno(A, 1, 1, { color: "#cdb9a6" }));
    m.position.set(x, y, z);
    grupa.add(cien(m));
    return m;
  };
  const wysNogi = BLAT - G - faza;
  for (const [x, z] of [[-0.82, -0.38], [0.82, -0.38], [-0.82, 0.38], [0.82, 0.38]]) rama(0.07, wysNogi, 0.07, x, wysNogi / 2, z);
  const yPasa = BLAT - G - faza - 0.05;
  rama(1.58, 0.1, 0.024, 0, yPasa, -0.38);
  rama(0.024, 0.1, 0.72, -0.82, yPasa, 0);
  rama(0.024, 0.1, 0.72, 0.82, yPasa, 0);
  // the front rail leaves a gap for the drawer: right of it and left of it
  const x0 = -0.62, x1 = -0.06; // the drawer opening
  rama(x0 + 0.82 - 0.035, 0.1, 0.024, (-0.82 + 0.035 + x0) / 2, yPasa, 0.38);
  rama(0.82 - x1 - 0.035, 0.1, 0.024, (x1 + 0.82 - 0.035) / 2, yPasa, 0.38);

  // the drawer: front board, two sides, a bottom, a brass pull; pulled out 9 cm
  const wysun = 0.09;
  const dw = x1 - x0 - 0.004;
  const dx = (x0 + x1) / 2;
  const front = new THREE.Mesh(skrzynka(dw, 0.088, 0.022, SKALA_BLATU), drewno(A, 1, 1, { color: "#e0cdbc" }));
  front.position.set(dx, yPasa, 0.38 + wysun);
  grupa.add(cien(front));
  const mosiadz = new THREE.MeshStandardMaterial({ color: "#a98a52", metalness: 1, roughness: 0.38 });
  const uchwyt = new THREE.Mesh(new THREE.CapsuleGeometry(0.006, 0.07, 6, 14), mosiadz);
  uchwyt.rotation.z = Math.PI / 2;
  uchwyt.position.set(dx, yPasa + 0.008, 0.38 + wysun + 0.026);
  grupa.add(cien(uchwyt));
  for (const s of [-1, 1]) {
    const bok = rama(0.012, 0.072, 0.34, dx + s * (dw / 2 - 0.012), yPasa - 0.006, 0.38 + wysun - 0.17);
    bok.material = drewno(A, 1, 1, { color: "#7f6a58" });
  }
  const dno = rama(dw - 0.02, 0.008, 0.34, dx, yPasa - 0.038, 0.38 + wysun - 0.17);
  dno.material = drewno(A, 1, 1, { color: "#4f4034" });

  const podloga = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshStandardMaterial({ color: "#1b1712", roughness: 0.9 }));
  podloga.rotation.x = -Math.PI / 2;
  podloga.position.z = 4 + SCIANA_Z; // ends at the wall, so the window shows the street, not the floor
  podloga.receiveShadow = true;
  grupa.add(podloga);
  grupa.userData.szuflada = { front, uchwyt };
  return grupa;
}

/** A wall plane `w` x `d` (centred) with a rectangular opening at (ox, oy), UVs running 0..1 over the whole wall. */
function scianaZOtworem(w, d, ox, oy, ow, oh) {
  const ksztalt = new THREE.Shape();
  ksztalt.moveTo(-w / 2, -d / 2);
  ksztalt.lineTo(w / 2, -d / 2);
  ksztalt.lineTo(w / 2, d / 2);
  ksztalt.lineTo(-w / 2, d / 2);
  const otwor = new THREE.Path();
  otwor.moveTo(ox - ow / 2, oy - oh / 2);
  otwor.lineTo(ox - ow / 2, oy + oh / 2);
  otwor.lineTo(ox + ow / 2, oy + oh / 2);
  otwor.lineTo(ox + ow / 2, oy - oh / 2);
  ksztalt.holes.push(otwor);
  const g = new THREE.ShapeGeometry(ksztalt);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / d + 0.5);
  return g;
}

/** The wall and the window with the night city. The wall mesh is children[0], the window group children[1]. */
function sciana(A) {
  const grupa = new THREE.Group();
  const W = 1.22, H = 0.8; // the window opening
  const OKNO_X = 1.4, OKNO_Y = 1.36;
  const s = new THREE.Mesh(
    scianaZOtworem(6, 3.2, OKNO_X, OKNO_Y - 1.6, W, H),
    new THREE.MeshStandardMaterial({
      map: powtorz(A.sciana.map, 3.4, 1.8), normalMap: powtorz(A.sciana.normalMap, 3.4, 1.8),
      roughnessMap: powtorz(A.sciana.roughnessMap, 3.4, 1.8), roughness: 1, color: "#756c62", normalScale: new THREE.Vector2(1.6, 1.6),
    }),
  );
  s.position.set(0, 1.6, SCIANA_Z);
  s.receiveShadow = true;
  grupa.add(s);

  const okno = new THREE.Group();
  const ramaMat = drewno(A, 1, 1, { color: "#7d6a5a" });
  const belka = (w, h, x, y, d = 0.06) => {
    const b = new THREE.Mesh(skrzynka(w, h, d, SKALA_BLATU), ramaMat);
    b.position.set(x, y, 0);
    okno.add(cien(b));
  };
  belka(W + 0.1, 0.055, 0, H / 2 + 0.02);
  belka(W + 0.1, 0.055, 0, -H / 2 - 0.02);
  belka(0.055, H + 0.1, -W / 2 - 0.02, 0);
  belka(0.055, H + 0.1, W / 2 + 0.02, 0);
  belka(0.028, H, 0, 0, 0.035);
  belka(W, 0.028, 0, 0.1, 0.035);
  const parapet = new THREE.Mesh(skrzynka(W + 0.22, 0.03, 0.14, SKALA_BLATU), ramaMat);
  parapet.position.set(0, -H / 2 - 0.058, 0.05);
  okno.add(cien(parapet));
  okno.add(oknoSzczegoly(W, H));
  okno.position.set(OKNO_X, OKNO_Y, SCIANA_Z + 0.02);
  grupa.add(okno);
  grupa.add(miasto());
  return grupa;
}

/**
 * A moulded walnut frame round a `w` x `h` opening: one extruded ring with rounded, bevelled edges,
 * so the corners are mitred and the light rolls over the profile.
 */
function ramaTablicy(A, w, h) {
  const F = 0.05, GLEB = 0.022, FAZA = 0.007;
  const zew = new THREE.Shape();
  const x0 = -w / 2 - F, x1 = w / 2 + F, y0 = -h / 2 - F, y1 = h / 2 + F;
  zew.moveTo(x0, y0);
  zew.lineTo(x1, y0);
  zew.lineTo(x1, y1);
  zew.lineTo(x0, y1);
  const wew = new THREE.Path();
  const m = 0.004; // the frame laps over the cork a little
  wew.moveTo(-w / 2 + m, -h / 2 + m);
  wew.lineTo(-w / 2 + m, h / 2 - m);
  wew.lineTo(w / 2 - m, h / 2 - m);
  wew.lineTo(w / 2 - m, -h / 2 + m);
  zew.holes.push(wew);
  const g = new THREE.ExtrudeGeometry(zew, {
    depth: GLEB, bevelEnabled: true, bevelThickness: FAZA, bevelSize: FAZA * 0.9, bevelSegments: 4, curveSegments: 1,
  });
  // extrude UVs are in metres; the wood maps count tiles of SKALA_BLATU
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / SKALA_BLATU, uv.getY(i) / SKALA_BLATU);
  const rama = new THREE.Mesh(g, drewno(A, 1, 1, { color: "#b49a80", roughness: 0.5, normalScale: new THREE.Vector2(1.2, 1.2) }));
  rama.position.z = -0.006;
  return rama;
}

/** The cork board, a walnut frame, the logo card on a terracotta pin, two prints. */
function tablica(A, rej) {
  const grupa = new THREE.Group();
  const W = 0.9, H = 0.6;
  const kork = new THREE.Mesh(
    new THREE.BoxGeometry(W, H, 0.014),
    new THREE.MeshStandardMaterial({
      map: powtorz(A.korek.map, 2.2, 1.5), normalMap: powtorz(A.korek.normalMap, 2.2, 1.5),
      roughnessMap: powtorz(A.korek.roughnessMap, 2.2, 1.5), roughness: 1, color: "#a08a50", normalScale: new THREE.Vector2(1.6, 1.6),
    }),
  );
  grupa.add(cien(kork, false, true));
  grupa.add(cien(ramaTablicy(A, W, H)));

  const papier = new THREE.MeshStandardMaterial({ color: T.KOLOR.kartka, roughness: 0.9 });
  const karta = new THREE.Group();
  const front = new THREE.MeshStandardMaterial({ map: T.kartkaLogo(), roughness: 0.88 });
  const plat = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.195, 0.0015), [papier, papier, papier, papier, front, papier]);
  karta.add(cien(plat));
  const pinezka = new THREE.Group();
  const glowka = new THREE.Mesh(new THREE.SphereGeometry(0.011, 24, 16), new THREE.MeshPhysicalMaterial({ color: T.KOLOR.glina, roughness: 0.3, clearcoat: 0.6 }));
  glowka.scale.z = 0.8;
  glowka.position.z = 0.012;
  const nozka = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0055, 0.01, 16), new THREE.MeshStandardMaterial({ color: "#d9cbb0", roughness: 0.3, metalness: 0.7 }));
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
  karta.position.set(-0.04, 0.02, 0.0095);
  karta.rotation.z = -0.035;
  grupa.add(karta);

  const notka = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.001), [papier, papier, papier, papier,
    new THREE.MeshStandardMaterial({ map: T.karteczka("E1 · E2 · E3", "#f2dc9a", 41), roughness: 0.9 }), papier]);
  notka.position.set(0.26, -0.12, 0.0085);
  notka.rotation.z = 0.06;
  grupa.add(cien(notka));

  [[-0.28, 0.12, 0.09, -0.07, 111], [0.3, 0.14, 0.085, 0.05, 112]].forEach(([x, y, w, r, ziarno]) => {
    const f = new THREE.Mesh(new THREE.BoxGeometry(w, w * 1.25, 0.0012), [papier, papier, papier, papier,
      new THREE.MeshStandardMaterial({ map: T.zdjecie(ziarno), roughness: 0.55 }), papier]);
    f.position.set(x, y, 0.0085);
    f.rotation.z = r;
    grupa.add(cien(f));
  });

  grupa.add(tablicaSzczegoly(rej));
  grupa.position.set(0.18, 1.34, SCIANA_Z + 0.01);
  grupa.userData.karta = karta;
  return grupa;
}

/** The lamp: the CC0 arm lamp scaled to a desk, its bulb a glowing mesh; `zrodlo` marks where the light starts. */
function lampa(A) {
  const model = A.lampa.clone(true);
  const s = 0.62;
  model.scale.setScalar(s);
  model.position.y = 0.088 * s;
  model.traverse((m) => {
    if (!m.isMesh) return;
    if (m.material.name?.endsWith("_light")) {
      m.material = new THREE.MeshBasicMaterial({ color: "#ffe9c4" });
      m.castShadow = false;
    } else {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });
  const grupa = new THREE.Group();
  grupa.add(model);
  const zrodlo = new THREE.Object3D();
  zrodlo.position.set(-0.0045 * s, 0.675 * s + 0.088 * s, -0.177 * s);
  grupa.add(zrodlo);
  grupa.position.set(0.62, BLAT, -0.36);
  grupa.rotation.y = 1.9;
  grupa.userData.zrodlo = zrodlo;
  return grupa;
}

/** A static pinch of dust in the lamp's light: no motion, only a hint that the air is lit. */
function kurz() {
  const los = T.losowanie(77);
  const n = 90;
  const poz = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    poz[i * 3] = 0.1 + los() * 0.62;
    poz[i * 3 + 1] = BLAT + 0.04 + los() * 0.42;
    poz[i * 3 + 2] = -0.25 + los() * 0.55;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(poz, 3));
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const ctx = c.getContext("2d");
  const r = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  r.addColorStop(0, "rgba(255,226,184,0.9)");
  r.addColorStop(1, "rgba(255,226,184,0)");
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, 32, 32);
  const m = new THREE.PointsMaterial({
    size: 0.0045, sizeAttenuation: true, map: new THREE.CanvasTexture(c), transparent: true, opacity: 0.4, depthWrite: false,
  });
  return new THREE.Points(g, m);
}

/** Places an object on the desk top at (x, z): sits its lowest point on y = BLAT, optionally yawed. */
function postaw(obiekt, x, z, { skala = 1, obrot = 0, wys = 0 } = {}) {
  const w = new THREE.Group();
  obiekt.position.set(0, 0, 0);
  obiekt.rotation.set(0, 0, 0);
  obiekt.scale.setScalar(skala);
  w.add(obiekt);
  w.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obiekt);
  w.position.set(x, BLAT - box.min.y + wys, z);
  w.rotation.y = obrot;
  return w;
}

function wytnij(zrodlo, nazwa) {
  const o = zrodlo.getObjectByName(nazwa);
  if (!o) throw new Error(`model has no part ${nazwa}`);
  return o.clone(true);
}

/** Stage two: the plant, the pencils and the paper pads join the desk once their files are in. */
function dodatki(B) {
  const grupa = new THREE.Group();
  const roslina = B.roslina.clone(true);
  roslina.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  grupa.add(postaw(roslina, 0.93, -0.33, { skala: 0.34, obrot: 0.6 }));

  const kubekNaOlowki = wytnij(B.przybory, "stationery_supplies_pencilcup");
  grupa.add(postaw(kubekNaOlowki, 0.0, -0.4));
  const olowekWKubku = wytnij(B.przybory, "stationery_supplies_pencil_new_a");
  olowekWKubku.rotation.set(0, 0, Math.PI / 2 - 0.12);
  const wKubku = new THREE.Group();
  wKubku.add(olowekWKubku);
  wKubku.position.set(0.0, BLAT + 0.095, -0.4);
  grupa.add(wKubku);
  const lezacy = wytnij(B.przybory, "stationery_supplies_pencil_used");
  grupa.add(postaw(lezacy, 0.12, 0.39, { obrot: 0.5, wys: 0.0005 }));
  const dlugopis = wytnij(B.przybory, "stationery_supplies_pen_blue");
  grupa.add(postaw(dlugopis, -0.2, 0.38, { obrot: -0.35 }));

  grupa.add(postaw(wytnij(B.bloczki, "office_notepads_a4_stack"), -0.22, -0.34, { obrot: -0.12 }));
  grupa.add(postaw(wytnij(B.bloczki, "office_notepads_sticky_stack"), 0.46, 0.43, { obrot: 0.3 }));
  grupa.add(modeleWyposazenia(B, postaw));
  cien(grupa);
  // the scans are product-photo bright; the evening room is not
  grupa.traverse((m) => { if (m.isMesh && m.material?.color) { m.material = m.material.clone(); m.material.color.multiplyScalar(0.74); if (m.material.name === "office_notepads") m.material.color.multiply(new THREE.Color("#e8cfa6")); } });
  return grupa;
}

/** Builds the desk from the first-stage assets. `tresc` carries the language-dependent words drawn on objects. */
export function zbudujBiurko(tresc, A) {
  const swiat = new THREE.Group();
  const rej = nowyRejestr();
  const obiekty = {
    biurko: biurko(A),
    sciana: sciana(A),
    tablica: tablica(A, rej),
    lampa: lampa(A),
    karteczki: karteczki(tresc.karteczki, rej),
    dokumenty: dokumenty(tresc.dokumenty, rej),
    teczka: teczka(tresc.teczka, rej),
    laptop: laptop(rej),
    pudelko: pudelko(A, rej),
    kubek: kubek(),
    kable: kable(),
    ksiazki: ksiazki(),
    kurz: kurz(),
  };
  for (const o of Object.values(obiekty)) swiat.add(o);
  return {
    swiat, obiekty,
    /** Stage two arrived: textures onto the waiting materials, the extras into the scene. */
    uzupelnij(B) {
      uzupelnijMaterialy(rej, B);
      obiekty.dodatki = dodatki(B);
      swiat.add(obiekty.dodatki);
    },
  };
}
