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

const kolory = ["#a8502e", "#c9952f", "#5f8a68", "#3b4a5c", "#d8cdb6"];

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

/** One closed book lying flat: cover boards, a spine, a page block set back from the edges. */
function ksiazka(w, d, h, kolor, rej) {
  const grupa = new THREE.Group();
  const okladka = new THREE.MeshStandardMaterial({ color: kolor, roughness: 0.62, bumpScale: 1 });
  const strony = new THREE.MeshStandardMaterial({ map: bokStron(), roughness: 0.92 });
  const gora = papier(rej, { color: "#d9cfb8" });
  const grub = 0.0032;
  const dol = new THREE.Mesh(new THREE.BoxGeometry(w, grub, d), okladka);
  dol.position.y = grub / 2;
  const wierzch = new THREE.Mesh(new THREE.BoxGeometry(w, grub, d), okladka);
  wierzch.position.y = h - grub / 2;
  const grzbiet = new THREE.Mesh(new THREE.BoxGeometry(grub * 1.4, h, d), okladka);
  grzbiet.position.set(-w / 2 + grub * 0.2, h / 2, 0);
  const blok = new THREE.Mesh(new THREE.BoxGeometry(w - grub * 3, h - grub * 2, d - 0.006), [strony, gora, gora, gora, strony, strony]);
  blok.position.set(grub * 0.4, h / 2, 0);
  const pasek = new THREE.Mesh(new THREE.BoxGeometry(0.0012, h * 0.55, d * 0.9), new THREE.MeshStandardMaterial({ color: "#e8d9b4", roughness: 0.4, metalness: 0.5 }));
  pasek.position.set(-w / 2 - grub * 0.55, h / 2, 0);
  grupa.add(dol, wierzch, grzbiet, blok, pasek);
  return cien(grupa);
}

/** A tidy-ish stack of four books in the RelAI colours. */
export function ksiazki(rej) {
  const grupa = new THREE.Group();
  const los = T.losowanie(131);
  let y = BLAT;
  [[0.2, 0.145, 0.034], [0.19, 0.14, 0.026], [0.205, 0.15, 0.031], [0.18, 0.13, 0.022]].forEach(([w, d, h], i) => {
    const k = ksiazka(w, d, h, kolory[i % kolory.length], rej);
    k.position.set((los() - 0.5) * 0.012, y, (los() - 0.5) * 0.012);
    k.rotation.y = (los() - 0.5) * 0.28;
    grupa.add(k);
    y += h;
  });
  grupa.position.set(0.9, 0, -0.15);
  grupa.rotation.y = 0.5;
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

