// Materials built on the CC0 sets. The first stage brings wood, plaster and cork; paper, kraft and
// aluminium arrive later, so each of those materials starts plain and registers itself in `rej`
// to be upgraded by `uzupelnijMaterialy` when its textures are in.
import * as THREE from "three";
import { powtorz } from "./zasoby.js";

export const SKALA_BLATU = 0.55; // the table scan covers 0.55 m

/** A fresh registry of materials waiting for stage two. */
export const nowyRejestr = () => ({ papier: [], kraft: [], aluminium: [] });

// The wood scan is 1.0 m across the boards and 0.5 m along them; it is turned a quarter so the boards
// run along u (the long side of the desk). `ax`, `ay` count tiles of SKALA_BLATU over the mesh's UVs.
const DLUGOSC_SKANU = 0.5;
const SZEROKOSC_SKANU = 1.0;

/** A wood map turned so the boards run along u, tiled `ax` x `ay` (in SKALA_BLATU units). */
function deska(t, ax, ay) {
  // three scales after turning: repeat.x runs over the scan's width (mesh v), repeat.y over its length (mesh u)
  const k = powtorz(t, (ay * SKALA_BLATU) / SZEROKOSC_SKANU, (ax * SKALA_BLATU) / DLUGOSC_SKANU);
  k.center.set(0.5, 0.5);
  k.rotation = Math.PI / 2;
  return k;
}

/** Worn walnut boards. `ax`, `ay` are the repeats over the UVs of the mesh it is put on. */
export function drewno(A, ax, ay, opcje = {}) {
  return new THREE.MeshStandardMaterial({
    map: deska(A.blat.map, ax, ay),
    normalMap: deska(A.blat.normalMap, ax, ay),
    roughnessMap: deska(A.blat.roughnessMap, ax, ay),
    roughness: 1,
    normalScale: new THREE.Vector2(0.9, 0.9),
    ...opcje,
  });
}

export function papier(rej, opcje = {}) {
  const m = new THREE.MeshStandardMaterial({ color: "#c2b8a4", roughness: 0.9, side: THREE.DoubleSide, ...opcje });
  rej.papier.push(m);
  return m;
}

export function kraft(rej, ax, ay, opcje = {}) {
  const m = new THREE.MeshStandardMaterial({ color: "#c9a77a", roughness: 0.88, ...opcje });
  m.userData.powtorz = [ax, ay];
  rej.kraft.push(m);
  return m;
}

export function aluminium(rej, opcje = {}) {
  const m = new THREE.MeshStandardMaterial({ color: "#8e8c8f", metalness: 1, roughness: 0.42, ...opcje });
  rej.aluminium.push(m);
  return m;
}

/** Stage two arrived: give the waiting materials their maps. */
export function uzupelnijMaterialy(rej, B) {
  for (const m of rej.papier) {
    m.normalMap = powtorz(B.papier.normalMap, 1, 1);
    m.roughnessMap = powtorz(B.papier.roughnessMap, 1, 1);
    m.roughness = 1;
    m.normalScale = new THREE.Vector2(0.5, 0.5);
    m.needsUpdate = true;
  }
  for (const m of rej.kraft) {
    const [ax, ay] = m.userData.powtorz;
    m.map = powtorz(B.kraft.map, ax, ay);
    m.normalMap = powtorz(B.kraft.normalMap, ax, ay);
    m.roughnessMap = powtorz(B.kraft.roughnessMap, ax, ay);
    m.color.set("#e3d2bb");
    m.roughness = 1;
    m.needsUpdate = true;
  }
  for (const m of rej.aluminium) {
    m.normalMap = powtorz(B.aluminium.normalMap, 2, 2);
    m.roughnessMap = powtorz(B.aluminium.roughnessMap, 2, 2);
    m.roughness = 1;
    m.normalScale = new THREE.Vector2(0.35, 0.35);
    m.needsUpdate = true;
  }
}
