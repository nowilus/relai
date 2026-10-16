// The city behind the window: an evening sky, blocks of flats with scattered lit windows, street lights
// far below. Real geometry a few metres to twenty metres behind the wall, so the view shifts with the
// camera and the depth of field softens it like a lens would. Unlit materials: the room's lamp never
// reaches it. Seen only through the window opening; the wall hides the rest.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { losowanie } from "./tekstury.js";

const ZIARNO = 71;

/** Evening sky: deep navy above, a dusty blue glow toward the horizon where the city lights scatter. */
function niebo() {
  const c = document.createElement("canvas");
  c.width = 16;
  c.height = 512;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  // the plane spans y = -10 … 16 m; the city's horizon (y ≈ -1.5) sits at 0.67 of the height
  g.addColorStop(0, "#060a16");
  g.addColorStop(0.4, "#0a1124");
  g.addColorStop(0.62, "#16203a");
  g.addColorStop(0.68, "#232c45");
  g.addColorStop(1, "#141824");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 16, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const ATLAS = 2048; // every facade of the city shares one texture, so the whole city is one draw call
const PX = 6; // one window bay in the atlas

/** Shelf packing into one canvas; the top-left corner stays dark for the roofs. */
function noweAtlas() {
  const c = document.createElement("canvas");
  c.width = c.height = ATLAS;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#07080c";
  ctx.fillRect(0, 0, 8, 8);
  let x = 8, y = 0, wysPolki = 8;
  return {
    c, ctx,
    dach: [1 / ATLAS, 1 - 7 / ATLAS, 7 / ATLAS, 1 - 1 / ATLAS],
    miejsce(w, h) {
      if (x + w > ATLAS) { x = 0; y += wysPolki + 1; wysPolki = 0; }
      if (y + h > ATLAS) throw new Error("city atlas is full");
      const m = { x, y };
      x += w + 1;
      wysPolki = Math.max(wysPolki, h);
      return m;
    },
  };
}

/** One facade drawn into the atlas: a dark wall, a grid of windows, a few lit. Returns its UV rectangle. */
function fasada(los, atlas, kolumny, pietra) {
  const w = kolumny * PX, h = pietra * PX;
  const { x: x0, y: y0 } = atlas.miejsce(w, h);
  const ctx = atlas.ctx;
  ctx.fillStyle = "#0a0c12";
  ctx.fillRect(x0, y0, w, h);
  const zapalone = 0.04 + los() * 0.12;
  for (let p = 0; p < pietra; p++) {
    // lights come on in runs along a floor (one flat, two or three windows), not as single dots
    let seria = 0;
    for (let k = 0; k < kolumny; k++) {
      if (seria === 0 && los() < zapalone / 2.2) seria = 1 + Math.floor(los() * 3);
      if (seria > 0) {
        seria--;
        const cieple = los() < 0.8;
        const jasnosc = 0.55 + los() * 0.45;
        ctx.fillStyle = cieple
          ? `rgba(255,${170 + los() * 50},${90 + los() * 50},${jasnosc})`
          : `rgba(205,220,255,${jasnosc * 0.8})`;
      } else {
        ctx.fillStyle = "#12151d";
      }
      ctx.fillRect(x0 + k * PX + 1, y0 + p * PX + 1, PX - 3, PX - 2);
    }
  }
  // canvas y runs down, texture v runs up (flipY)
  return [x0 / ATLAS, 1 - (y0 + h) / ATLAS, (x0 + w) / ATLAS, 1 - y0 / ATLAS];
}

/** A soft round dot, for the street lights that the lens turns into bokeh. */
function kropka() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.55)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/** One block: a box whose four sides carry the facade; roof dark. */
function blok(los, atlas, szer, wys, gleb) {
  // a miniature city: at 7–17 m a 6 cm storey reads like a real one a few hundred metres away
  const pietro = 0.06, przeslo = 0.055;
  const pietra = Math.max(4, Math.round(wys / pietro));
  const okna = fasada(los, atlas, Math.max(3, Math.round(szer / przeslo)), pietra);
  const bok = fasada(los, atlas, Math.max(2, Math.round(gleb / przeslo)), pietra);
  const g = new THREE.BoxGeometry(szer, wys, gleb);
  // BoxGeometry faces in order +x, -x, +y, -y, +z, -z; four vertices each with UVs at the corners
  const prostokaty = [bok, bok, atlas.dach, atlas.dach, okna, okna];
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    const [u0, v0, u1, v1] = prostokaty[Math.floor(i / 4)];
    uv.setXY(i, u0 + uv.getX(i) * (u1 - u0), v0 + uv.getY(i) * (v1 - v0));
  }
  g.clearGroups();
  g.translate(0, wys / 2, 0);
  return g;
}

/** The whole city in world space: four rows of blocks behind the wall, nearer ones lower, towers far back. */
export function miasto() {
  const los = losowanie(ZIARNO);
  const grupa = new THREE.Group();
  const POZIOM = -1.7; // the street level of the miniature, below the window's line of sight

  const sky = new THREE.Mesh(new THREE.PlaneGeometry(60, 26), new THREE.MeshBasicMaterial({ map: niebo(), depthWrite: false }));
  sky.position.set(6, 3, -19);
  grupa.add(sky);

  const atlas = noweAtlas();
  const bryly = [];
  const m = new THREE.Matrix4();
  const rzedy = [
    { z: -7, n: 16, wys: [0.9, 1.5], szer: [0.35, 0.7] },
    { z: -10, n: 18, wys: [1.2, 2.1], szer: [0.4, 0.8] },
    { z: -13, n: 20, wys: [1.4, 2.6], szer: [0.45, 0.9] },
    { z: -16.5, n: 22, wys: [1.6, 3.6], szer: [0.5, 1.0] },
  ];
  for (const r of rzedy) {
    let x = -3 - los() * 1.5;
    for (let i = 0; i < r.n; i++) {
      const szer = r.szer[0] + los() * (r.szer[1] - r.szer[0]);
      // every so often a tower rises well above its row
      const wys = (r.wys[0] + los() * (r.wys[1] - r.wys[0])) * (los() < 0.12 ? 1.5 : 1);
      const b = blok(los, atlas, szer, wys, 0.3 + los() * 0.5);
      m.makeRotationY((los() - 0.5) * 0.5).setPosition(x + szer / 2, POZIOM, r.z - los() * 1.2);
      bryly.push(b.applyMatrix4(m));
      x += szer + 0.08 + los() * 0.5;
    }
  }
  const tekstura = new THREE.CanvasTexture(atlas.c);
  tekstura.colorSpace = THREE.SRGBColorSpace;
  tekstura.anisotropy = 4;
  grupa.add(new THREE.Mesh(mergeGeometries(bryly), new THREE.MeshBasicMaterial({ map: tekstura })));
  bryly.forEach((b) => b.dispose());

  // street lights and windows of low buildings far below: points the depth of field turns into soft discs
  const n = 160;
  const pozycje = new Float32Array(n * 3);
  const barwy = new Float32Array(n * 3);
  const cieply = new THREE.Color("#ffb45e"), zimny = new THREE.Color("#cfe0ff");
  for (let i = 0; i < n; i++) {
    pozycje.set([-3 + los() * 18, POZIOM + 0.05 + los() * 0.7, -5 - los() * 13], i * 3);
    const k = los() < 0.85 ? cieply : zimny;
    barwy.set([k.r, k.g, k.b], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pozycje, 3));
  g.setAttribute("color", new THREE.BufferAttribute(barwy, 3));
  const swiatla = new THREE.Points(g, new THREE.PointsMaterial({
    size: 0.09, map: kropka(), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9,
  }));
  grupa.add(swiatla);
  return grupa;
}
