// The renderer, the light and the render loop. Renders only while the camera is still moving:
// no decorative loops, motion comes from scroll and click alone.
import * as THREE from "three";
import { CSS3DRenderer, CSS3DObject } from "three/addons/CSS3DRenderer.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
import { BokehPass } from "three/addons/postprocessing/BokehPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { zbudujBiurko, BLAT } from "./obiekty.js";
import { PROMIEN_EKRANU } from "./przedmioty.js";
import { poza, POZY } from "./kamera.js";
import { pozaPrzyblizenia, zmieszaj } from "./przyblizenie.js";

const MAX_DPR = 1.5;
const LERP = 0.12; // per 60 Hz frame; damps wheel judder
const EKRAN_PX = [1136, 710]; // CSS size of the configurator on the laptop display (16:10)
const EKRAN_M = [0.284, 0.1775]; // the display mesh in metres; the HTML is scaled onto it exactly
const PROG_SPADKU_MS = 26; // median frame time that drops quality one step

/** The display lights what is in front of it: a cool, soft rectangle on the keys and the desk. */
function poswiata(siatka) {
  RectAreaLightUniformsLib.init();
  // weak on purpose: the window on the display is dark, so the keys stay dark with a cool sheen (05-laptop)
  const swiatlo = new THREE.RectAreaLight("#bccbe8", 1.1, EKRAN_M[0], EKRAN_M[1]);
  const srodek = new THREE.Vector3();
  const przod = new THREE.Vector3(0, 0, 1).applyQuaternion(siatka.getWorldQuaternion(new THREE.Quaternion()));
  siatka.getWorldPosition(srodek);
  swiatlo.position.copy(srodek).addScaledVector(przod, 0.002);
  swiatlo.lookAt(srodek.clone().add(przod));
  return swiatlo;
}

function swiatlo(scena, obiekty) {
  const zrodlo = new THREE.Vector3();
  scena.updateMatrixWorld(true);
  obiekty.lampa.userData.zrodlo.getWorldPosition(zrodlo);
  const lampa = new THREE.SpotLight("#ffc080", 17, 0, 0.74, 0.95, 2);
  lampa.position.copy(zrodlo);
  lampa.target.position.set(0.16, BLAT, 0.06);
  lampa.castShadow = true;
  lampa.shadow.mapSize.set(2048, 2048);
  lampa.shadow.bias = -0.0002;
  lampa.shadow.normalBias = 0.012;
  lampa.shadow.radius = 6;
  lampa.shadow.camera.near = 0.05;
  lampa.shadow.camera.far = 3;
  scena.add(lampa, lampa.target);

  // light bounced off the lit desk: warm, weak, no shadow
  const odbicie = new THREE.PointLight("#e7b27a", 0.45, 0, 2);
  odbicie.position.set(0.2, BLAT + 0.32, 0.0);
  scena.add(odbicie);

  // the lamp also grazes the wall and the board: a weak warm light close to the wall brings the plaster and cork grain out
  const sciana = new THREE.PointLight("#ffc890", 0.6, 3.2, 2);
  sciana.position.set(0.42, 1.38, -0.28);
  scena.add(sciana);

  // the window: a cool, weak light from behind
  const okno = new THREE.DirectionalLight("#8fa9d6", 0.4);
  okno.position.set(1.4, 2.1, -1.6);
  okno.target.position.set(0.1, BLAT, 0.1);
  scena.add(okno, okno.target);

  scena.add(new THREE.HemisphereLight("#3d4a66", "#2a2018", 0.13));
  return { lampa };
}

/**
 * @param {{ kontener: HTMLElement, slowa: object, zasoby: object, ekran: HTMLElement, tor: object, przyKlatce: Function, ograniczRuch: boolean }} o
 *   `zasoby` = the first loading stage (see zasoby.js); the rest arrives through the returned `uzupelnij`.
 */
export function zbudujScene({ kontener, slowa, zasoby, ekran, tor, przyKlatce, ograniczRuch }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  let dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  kontener.append(renderer.domElement);

  const scena = new THREE.Scene();
  scena.background = new THREE.Color("#15120f");
  const pmrem = new THREE.PMREMGenerator(renderer);
  scena.environment = pmrem.fromEquirectangular(zasoby.otoczenie).texture;
  scena.environmentIntensity = 0.24;
  zasoby.otoczenie.dispose();
  pmrem.dispose();

  const kamera = new THREE.PerspectiveCamera(40, 1, 0.02, 40); // far enough for the city behind the window
  const { swiat, obiekty, uzupelnij } = zbudujBiurko(slowa, zasoby);
  scena.add(swiat);
  const { lampa } = swiatlo(scena, obiekty);

  // the picture: scene, contact shadows (ambient occlusion), a shallow depth of field, then tone mapping
  const kompozytor = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }));
  kompozytor.addPass(new RenderPass(scena, kamera));
  const ao = new GTAOPass(scena, kamera, 1, 1);
  ao.updateGtaoMaterial({ radius: 0.14, distanceExponent: 1.4, thickness: 1, scale: 1.3, samples: 12, distanceFallOff: 1, screenSpaceRadius: false });
  ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
  const bokeh = new BokehPass(scena, kamera, { focus: 1, aperture: 0.012, maxblur: 0.005 });
  kompozytor.addPass(ao);
  kompozytor.addPass(bokeh);
  kompozytor.addPass(new OutputPass());

  // the configurator lives on the laptop display as real HTML. Its layer stays where the form stood in
  // the document (inside the install stop), outside the aria-hidden scene, so the form keeps its
  // place in reading and tab order.
  const css = new CSS3DRenderer();
  css.domElement.classList.add("scena__html");
  const miejsce = document.createComment("ekran");
  ekran.before(miejsce);
  ekran.before(css.domElement);
  const scenaCss = new THREE.Scene();
  ekran.style.width = `${EKRAN_PX[0]}px`;
  ekran.style.height = `${EKRAN_PX[1]}px`;
  // the same rounded corners as the display mesh under it
  const px = (m) => `${Math.round(m * EKRAN_PX[0] / EKRAN_M[0])}px`;
  ekran.style.borderRadius = `${px(PROMIEN_EKRANU.gora)} ${px(PROMIEN_EKRANU.gora)} ${px(PROMIEN_EKRANU.dol)} ${px(PROMIEN_EKRANU.dol)}`;
  const ekranCss = new CSS3DObject(ekran);
  // the stylesheet decides when the display takes pointer input, and the commands stay selectable
  ekran.style.removeProperty("pointer-events");
  ekran.style.removeProperty("user-select");
  const siatka = obiekty.laptop.userData.ekran;
  scena.updateMatrixWorld(true);
  // exactly on the mesh: the HTML layer is drawn over the canvas anyway, so no offset toward the camera
  siatka.matrixWorld.decompose(ekranCss.position, ekranCss.quaternion, new THREE.Vector3());
  ekranCss.scale.setScalar(EKRAN_M[0] / EKRAN_PX[0]);
  scenaCss.add(ekranCss);
  scena.add(poswiata(siatka));

  // the close: the camera squares up to the laptop display, far enough to frame it whole
  const srodek = new THREE.Vector3();
  const normalna = new THREE.Vector3(0, 0, 1).applyQuaternion(ekranCss.quaternion);
  siatka.getWorldPosition(srodek);
  // shifted left along the display, so the screen sits right of centre and the copy card left of it
  const wPrawo = new THREE.Vector3(1, 0, 0).applyQuaternion(ekranCss.quaternion);
  const odleglosc = 0.56;
  const celKoncowy = srodek.clone().addScaledVector(wPrawo, -0.04);
  const pozKoncowa = celKoncowy.clone().addScaledVector(normalna, odleglosc);
  const pozy = { ...POZY, instalacja: { poz: pozKoncowa.toArray(), cel: celKoncowy.toArray(), fov: 40 } };
  const daneEkranu = { srodek: srodek.toArray(), normalna: normalna.toArray(), szer: EKRAN_M[0], wys: EKRAN_M[1] };
  let zblizenie = null; // the close-up pose for the current viewport, set in rozmiar()

  let cel = 0;
  let biez = 0;
  let celZ = 0; // close-up: 0 = the stop's pose, 1 = the display fills the frame
  let biezZ = 0;
  let ostatni = 0;
  let czeka = false;
  const czasy = [];

  function rozmiar() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);
    kompozytor.setPixelRatio(dpr);
    kompozytor.setSize(w, h);
    css.setSize(w, h);
    kamera.aspect = w / h;
    kamera.updateProjectionMatrix();
    zblizenie = pozaPrzyblizenia(daneEkranu, { fov: POZY.instalacja.fov, aspekt: w / h });
  }

  function ustawKamere(stan) {
    kamera.position.set(...stan.poz);
    kamera.lookAt(...stan.cel);
    if (kamera.fov !== stan.fov) {
      kamera.fov = stan.fov;
      kamera.updateProjectionMatrix();
    }
  }

  /** One step down per call: depth of field first, then ambient occlusion, then resolution and shadow size. */
  function obnizJakosc() {
    czasy.length = 0;
    if (bokeh.enabled) {
      bokeh.enabled = false;
      return;
    }
    if (ao.enabled) {
      ao.enabled = false;
      return;
    }
    if (dpr <= 1) return;
    dpr = 1;
    renderer.setPixelRatio(dpr);
    lampa.shadow.mapSize.set(1024, 1024);
    lampa.shadow.map?.dispose();
    lampa.shadow.map = null;
    rozmiar();
  }

  function klatka(teraz) {
    czeka = false;
    if (document.hidden) return;
    const dt = ostatni ? Math.min(0.1, (teraz - ostatni) / 1000) : 1 / 60;
    if (ostatni) {
      czasy.push(teraz - ostatni);
      if (czasy.length > 240) czasy.shift();
    }
    ostatni = teraz;
    const k = ograniczRuch ? 1 : 1 - Math.pow(1 - LERP, dt * 60);
    biez += (cel - biez) * k;
    if (Math.abs(cel - biez) < 1e-5) biez = cel;
    biezZ += (celZ - biezZ) * k;
    if (Math.abs(celZ - biezZ) < 1e-4) biezZ = celZ;
    const stan = { ...zmieszaj(poza(tor, biez, pozy), zblizenie, biezZ), przyblizenie: biezZ };
    ustawKamere(stan);
    bokeh.uniforms.focus.value = kamera.position.distanceTo(new THREE.Vector3(...stan.cel));
    kompozytor.render();
    css.render(scenaCss, kamera);
    przyKlatce(stan);
    if (czasy.length >= 90 && mediana(czasy) > PROG_SPADKU_MS) obnizJakosc();
    if (biez !== cel || biezZ !== celZ) zamow();
    else ostatni = 0;
  }

  function zamow() {
    if (!czeka) {
      czeka = true;
      requestAnimationFrame(klatka);
    }
  }

  window.addEventListener("resize", () => {
    rozmiar();
    zamow();
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      ostatni = 0;
      zamow();
    }
  });

  rozmiar();

  const ekranowe = (obiekt) => {
    const v = new THREE.Vector3();
    obiekt.getWorldPosition(v);
    v.project(kamera);
    return [Math.round((v.x + 1) / 2 * window.innerWidth), Math.round((1 - v.y) / 2 * window.innerHeight)];
  };

  return {
    canvas: renderer.domElement,
    obiekty,
    scena,
    /** Stage two of the assets arrived: upgrade the materials, add the extras, draw once more. */
    uzupelnij(B) {
      uzupelnij(B);
      zamow();
    },
    ustawPostep(p, natychmiast = false) {
      cel = p;
      if (natychmiast) biez = p;
      zamow();
    },
    /** 1 = close-up of the display, 0 = the stop's pose. */
    ustawPrzyblizenie(z, natychmiast = false) {
      celZ = z;
      if (natychmiast) biezZ = z;
      zamow();
    },
    /** The scene is going away: the form goes back where it stood in the document, without 3D styles. */
    oddajEkran() {
      scenaCss.remove(ekranCss);
      for (const w of ["position", "pointer-events", "user-select", "transform", "width", "height", "display", "opacity", "visibility", "border-radius"]) ekran.style.removeProperty(w);
      ekran.classList.remove("w-scenie");
      miejsce.replaceWith(ekran);
      css.domElement.remove();
    },
    /** For verification: screen positions of one object per depth plane, the display corners, frame times. */
    diagnostyka: () => ({
      plany: {
        daleki: ekranowe(obiekty.sciana.children[1]),
        srodkowy: ekranowe(obiekty.lampa.userData.zrodlo),
        bliski: ekranowe(obiekty.kubek),
      },
      ekran: [[-1, 1], [1, 1], [1, -1], [-1, -1]].map(([x, y]) => {
        const v = new THREE.Vector3(x * EKRAN_M[0] / 2, y * EKRAN_M[1] / 2, 0).applyMatrix4(siatka.matrixWorld).project(kamera);
        return [(v.x + 1) / 2 * window.innerWidth, (1 - v.y) / 2 * window.innerHeight];
      }),
      przyblizenie: biezZ,
      medianaKlatkiMs: czasy.length ? mediana(czasy) : null,
      probki: czasy.length,
      dpr,
    }),
    wyczyscPomiar: () => { czasy.length = 0; },
  };
}

function mediana(a) {
  const s = [...a].sort((x, y) => x - y);
  return s[s.length >> 1];
}
