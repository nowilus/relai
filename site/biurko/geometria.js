// Shared shapes for the desk: rounded slabs, shadow flags, sheets of paper that are never quite flat.
import * as THREE from "three";
import * as T from "./tekstury.js";

export const BLAT = 0.75; // the desk top is at y = 0.75 m

export function zaokraglonyProstokat(w, h, r) {
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

/** A rounded slab lying flat: base at y = 0, top face at y = grubosc. UVs of the top run 0..1. */
export function plyta(w, d, grubosc, r, faza = 0.004) {
  const g = new THREE.ExtrudeGeometry(zaokraglonyProstokat(w, d, r), {
    depth: grubosc, bevelEnabled: true, bevelThickness: faza, bevelSize: faza, bevelSegments: 4, curveSegments: 10,
  });
  g.rotateX(-Math.PI / 2);
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / w + 0.5, uv.getY(i) / d + 0.5);
  return g;
}

/** A box with its own UVs scaled to real size, so a tiling texture keeps its grain size on every face. */
export function skrzynka(w, h, d, skala = 0.5) {
  const g = new THREE.BoxGeometry(w, h, d);
  const uv = g.attributes.uv;
  const pos = g.attributes.position;
  const norm = g.attributes.normal;
  for (let i = 0; i < uv.count; i++) {
    const nx = Math.abs(norm.getX(i)), ny = Math.abs(norm.getY(i));
    const [a, b] = nx > 0.5 ? [pos.getZ(i), pos.getY(i)] : ny > 0.5 ? [pos.getX(i), pos.getZ(i)] : [pos.getX(i), pos.getY(i)];
    uv.setXY(i, a / skala, b / skala);
  }
  return g;
}

export function cien(o, rzuca = true, odbiera = true) {
  o.traverse((m) => {
    if (m.isMesh) {
      m.castShadow = rzuca;
      m.receiveShadow = odbiera;
    }
  });
  return o;
}

/**
 * A sheet lying on the desk: a gentle wave plus one curled corner, never below the surface
 * (a sheet that dips under the desk shows the wood through a hole).
 */
export function arkusz(w, h, material, { zgiecie = 0.004, zawiniecie = 0, ziarno = 1 } = {}) {
  const g = new THREE.PlaneGeometry(w, h, 14, 18);
  const los = T.losowanie(ziarno);
  const fala = los() * 6.28;
  const rog = los() < 0.5 ? -1 : 1;
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / w, y = p.getY(i) / h;
    const wygiecie = ((Math.sin(x * 3 + fala) + 1) * 0.2 + y * y) * zgiecie;
    // the curl: a corner lifts as the distance from the opposite diagonal grows
    const przekatna = Math.max(0, x * rog + y - 0.35) / 0.65;
    p.setZ(i, wygiecie + przekatna * przekatna * zawiniecie);
  }
  g.computeVertexNormals();
  g.rotateX(-Math.PI / 2);
  return cien(new THREE.Mesh(g, material));
}
