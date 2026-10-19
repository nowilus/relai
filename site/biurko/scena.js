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
import { poza, POZY, pozyDlaOkna } from "./kamera.js";
import { pozaPrzyblizenia, zmieszaj } from "./przyblizenie.js";
import { ulozenie, nastepnaFaza, czasFazy, graniceSzczytu, ROZMIAR_KARTECZKI } from "./szczyt.js";

const TEKST_SZCZYTU_MS = 450; // the peak's copy fades in after the documents have settled
const NR_TEKSTU_SZCZYTU = 2;

/**
 * Drives the peak on the scene's notes and documents. `krok(p, teraz)` returns the phase and a 0..1
 * gate for the peak's copy; `skok(p)` sets the phase for a jump on the map without playing.
 */
function zbudujSzczyt(obiekty, tor) {
  const notki = obiekty.karteczki.children;
  const arkusze = obiekty.dokumenty.children;
  const poczatek = notki.map((k) => ({ poz: k.position.toArray(), rotY: k.rotation.y }));
  const cele = arkusze.map((d) => ({ poz: d.position.toArray(), rotY: d.rotation.y }));
  for (const k of notki) k.rotation.order = "YXZ"; // yaw toward the document first, then the tip of the flight
  const granice = graniceSzczytu(tor);
  let stan = { faza: "balagan", start: 0 };
  let tekstOd = -Infinity; // when the peak's copy may start fading in

  function pokaz(t) {
    const u = ulozenie(t, poczatek, cele);
    u.karteczki.forEach((k, i) => {
      notki[i].position.fromArray(k.poz);
      notki[i].rotation.set(k.obrot[0], k.obrot[1], k.obrot[2]);
      notki[i].scale.setScalar(Math.max(k.skala, 1e-4));
      notki[i].visible = k.skala > 0;
    });
    // a document unfolds from the size of the notes under it to a whole sheet
    u.dokumenty.forEach((d, j) => {
      arkusze[j].scale.set(
        ROZMIAR_KARTECZKI[0] + (1 - ROZMIAR_KARTECZKI[0]) * d, 1, ROZMIAR_KARTECZKI[1] + (1 - ROZMIAR_KARTECZKI[1]) * d,
      );
      arkusze[j].visible = d > 0;
    });
  }
  pokaz(0);

  return {
    granice,
    krok(p, teraz) {
      const nowy = nastepnaFaza(stan, { p, teraz, granice });
      if (stan.faza === "gra" && nowy.faza === "porzadek") tekstOd = teraz;
      else if (nowy.faza === "porzadek" && stan.faza !== "porzadek") tekstOd = -Infinity;
      stan = nowy;
      pokaz(czasFazy(stan, teraz));
      const tekst = stan.faza !== "porzadek" ? 0 : Math.min(1, (teraz - tekstOd) / TEKST_SZCZYTU_MS);
      return { faza: stan.faza, tekst, trwa: stan.faza === "gra" || tekst < 1 };
    },
    skok(p) {
      if (p >= granice.start) stan = { faza: "porzadek", start: 0 };
      else if (p < granice.reset) stan = { faza: "balagan", start: 0 };
      tekstOd = -Infinity;
    },
    faza: () => stan.faza,
    /** Note positions, for verification. */
    pozycje: () => notki.map((k) => k.position.toArray()),
  };
}

const MAX_DPR = 1.5;
// per 60 Hz frame; damps wheel judder. 0.12 in E1-E5; slowed in E6 so the camera glides after the
// scroll for about a second instead of following each notch (Łukasz: a slow, smooth camera move)
const LERP = 0.05;
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
  // toned down after E4: at 17 the pool glared on Panel and washed out Plan, Porządek and Amnezja
  const lampa = new THREE.SpotLight("#ffc080", 9, 0, 0.74, 0.95, 2);
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
  const odbicie = new THREE.PointLight("#e7b27a", 0.2, 0, 2);
  odbicie.position.set(0.2, BLAT + 0.32, 0.0);
  scena.add(odbicie);

  // the lamp also grazes the wall and the board: a weak warm light close to the wall brings the plaster and cork grain out
  // weak: in 01-hero the wall left of the board falls into darkness, the lamp is the one pool of light
  const sciana = new THREE.PointLight("#ffc890", 0.22, 3.2, 2);
  sciana.position.set(0.42, 1.38, -0.28);
  scena.add(sciana);

  // the window: a cool, weak light from behind
  const okno = new THREE.DirectionalLight("#8fa9d6", 0.4);
  okno.position.set(1.4, 2.1, -1.6);
  okno.target.position.set(0.1, BLAT, 0.1);
  scena.add(okno, okno.target);

  scena.add(new THREE.HemisphereLight("#3d4a66", "#2a2018", 0.05));
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
  scena.environmentIntensity = 0.13;
  zasoby.otoczenie.dispose();
  pmrem.dispose();

  const kamera = new THREE.PerspectiveCamera(40, 1, 0.02, 40); // far enough for the city behind the window
  const { swiat, obiekty, uzupelnij } = zbudujBiurko(slowa, zasoby);
  scena.add(swiat);
  const { lampa } = swiatlo(scena, obiekty);
  const szczyt = zbudujSzczyt(obiekty, tor);

  // the picture: scene, contact shadows (ambient occlusion), a shallow depth of field, then tone mapping
  const kompozytor = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }));
  kompozytor.addPass(new RenderPass(scena, kamera));
  const ao = new GTAOPass(scena, kamera, 1, 1);
  ao.updateGtaoMaterial({ radius: 0.14, distanceExponent: 1.4, thickness: 1, scale: 1.3, samples: 12, distanceFallOff: 1, screenSpaceRadius: false });
  ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
  // a lighter blur than in E3: the boards in front keep their wear, as in 01-hero
  const bokeh = new BokehPass(scena, kamera, { focus: 1, aperture: 0.0035, maxblur: 0.0016 });
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
  const instalacjaPozioma = { poz: pozKoncowa.toArray(), cel: celKoncowy.toArray(), fov: 40 };
  // the pose set follows the window's proportions (portrait on a phone); rozmiar() picks it again
  let pozy = POZY;
  const wybierzPozy = (w, h) => {
    const zestaw = pozyDlaOkna(w, h);
    pozy = zestaw === POZY ? { ...POZY, instalacja: instalacjaPozioma } : zestaw;
  };
  const daneEkranu = { srodek: srodek.toArray(), normalna: normalna.toArray(), szer: EKRAN_M[0], wys: EKRAN_M[1] };
  let zblizenie = null; // the close-up pose for the current viewport, set in rozmiar()

  // the drawers: the clicked object rises toward the camera while its dialog is open
  const SZUFLADY = ["dokumenty", "teczka", "laptop", "pudelko"];
  const UNIES_UDZIAL = 0.3; // this share of the way to the camera...
  const UNIES_MAX_M = 0.28; // ...but never more than this
  const UNIES_W_GORE_M = 0.03;
  const UNIES_LERP = 0.12; // per 60 Hz frame: quicker than the camera, the dialog follows at 260 ms
  const promien = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const uniesienie = Object.fromEntries(SZUFLADY.map((n) => [n, { baza: obiekty[n].position.clone(), cel: null, u: 0 }]));
  let uniesiona = null;
  const widoczny = (o) => {
    for (let x = o; x; x = x.parent) if (!x.visible) return false;
    return true;
  };

  /** The drawer object under a point of the window, or null; hidden objects (documents before the peak) never answer. */
  function trafienie(x, y) {
    ndc.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
    promien.setFromCamera(ndc, kamera);
    const traf = promien.intersectObjects(SZUFLADY.map((n) => obiekty[n]), true).find((t) => widoczny(t.object));
    if (!traf) return null;
    return SZUFLADY.find((n) => {
      for (let x = traf.object; x; x = x.parent) if (x === obiekty[n]) return true;
      return false;
    }) ?? null;
  }

  /** Moves every drawer object one step toward its target; true while any is still on its way. */
  function krokUniesienia(k) {
    let trwa = false;
    for (const n of SZUFLADY) {
      const s = uniesienie[n];
      const t = n === uniesiona ? 1 : 0;
      if (s.u === t) continue;
      s.u += (t - s.u) * k;
      if (Math.abs(t - s.u) < 1e-3) s.u = t;
      else trwa = true;
      obiekty[n].position.lerpVectors(s.baza, s.cel ?? s.baza, s.u);
    }
    return trwa;
  }

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
    wybierzPozy(w, h);
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
    const stan = { ...zmieszaj(poza(tor, biez, pozy), zblizenie, biezZ), przyblizenie: biezZ, postep: biez };
    const sz = szczyt.krok(biez, teraz);
    stan.widocznosc[NR_TEKSTU_SZCZYTU] *= sz.tekst;
    stan.szczyt = sz.faza;
    ustawKamere(stan);
    const unosi = krokUniesienia(ograniczRuch ? 1 : 1 - Math.pow(1 - UNIES_LERP, dt * 60));
    bokeh.uniforms.focus.value = kamera.position.distanceTo(new THREE.Vector3(...stan.cel));
    kompozytor.render();
    css.render(scenaCss, kamera);
    przyKlatce(stan);
    if (czasy.length >= 90 && mediana(czasy) > PROG_SPADKU_MS) obnizJakosc();
    if (biez !== cel || biezZ !== celZ || sz.trwa || unosi) zamow();
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
    /** A jump on the map: the peak is shown as it is at the target, without playing on the way. */
    skok(p) {
      szczyt.skok(p);
      zamow();
    },
    trafienie,
    /** Where a drawer object's middle is in the window, px, or null when hidden or behind the camera. */
    srodekNaEkranie(nazwa) {
      const o = obiekty[nazwa];
      if (!o || !widoczny(o)) return null;
      const v = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()).project(kamera);
      if (v.z > 1) return null;
      return [(v.x + 1) / 2 * window.innerWidth, (1 - v.y) / 2 * window.innerHeight];
    },
    /** A drawer opens (its object's name) or closes (null): the object rises toward the camera or settles back. */
    unies(nazwa) {
      if (nazwa) {
        const s = uniesienie[nazwa];
        const droga = kamera.position.clone().sub(s.baza);
        const dlugosc = Math.min(droga.length() * UNIES_UDZIAL, UNIES_MAX_M);
        s.cel = s.baza.clone().addScaledVector(droga.normalize(), dlugosc);
        s.cel.y += UNIES_W_GORE_M;
      }
      uniesiona = nazwa;
      zamow();
    },
    /** The peak: its phase and the track borders (for the scroll hold). */
    szczyt: { faza: szczyt.faza, granice: szczyt.granice },
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
      kamera: { poz: kamera.position.toArray(), kierunek: kamera.getWorldDirection(new THREE.Vector3()).toArray(), fov: kamera.fov, aspekt: kamera.aspect },
      szczyt: szczyt.faza(),
      karteczki: szczyt.pozycje(),
      medianaKlatkiMs: czasy.length ? mediana(czasy) : null,
      probki: czasy.length,
      dpr,
      jakosc: { glebia: bokeh.enabled, ao: ao.enabled, dpr },
    }),
    wyczyscPomiar: () => { czasy.length = 0; },
    /** For verification: the next quality step now, as the frame-time check would take it. */
    obnizJakosc: () => { obnizJakosc(); zamow(); },
  };
}

function mediana(a) {
  const s = [...a].sort((x, y) => x - y);
  return s[s.length >> 1];
}
