// Loads the CC0 assets of the desk in two stages: what the first frame needs, then the rest.
// Everything is served from site/zasoby/; any failed request rejects, and the page falls back to flow mode.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";

const BAZA = new URL("../zasoby/", import.meta.url).href;
const ANISO = 8;
const tekstury = new THREE.TextureLoader();

/** One texture; colour maps are sRGB, data maps (normal, roughness) stay linear. */
function wczytajTeksture(plik, kolor) {
  return tekstury.loadAsync(`${BAZA}tekstury/${plik}`).then((t) => {
    t.colorSpace = kolor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = ANISO;
    return t;
  });
}

/** A PBR set: `<nazwa>-kolor.jpg`, `-normalna.jpg`, `-roughness.jpg`. */
async function zestaw(nazwa) {
  const [map, normalMap, roughnessMap] = await Promise.all([
    wczytajTeksture(`${nazwa}-kolor.jpg`, true),
    wczytajTeksture(`${nazwa}-normalna.jpg`, false),
    wczytajTeksture(`${nazwa}-roughness.jpg`, false),
  ]);
  return { map, normalMap, roughnessMap };
}

const model = (id) => new GLTFLoader().loadAsync(`${BAZA}modele/${id}/${id}_1k.gltf`).then((g) => g.scene);

async function hdr() {
  const t = await new HDRLoader().loadAsync(`${BAZA}hdri/comfy_cafe_512.hdr`);
  t.mapping = THREE.EquirectangularReflectionMapping;
  return t;
}

/** A copy of a texture with its own tiling (shares the image). */
export function powtorz(t, x, y) {
  const k = t.clone();
  k.repeat.set(x, y);
  k.needsUpdate = true;
  return k;
}

/** Stage one: what the opening frame shows. */
export async function etapPierwszy() {
  const [blat, sciana, korek, lampa, otoczenie] = await Promise.all([
    zestaw("blat"), zestaw("sciana"), zestaw("korek"), model("desk_lamp_arm_01"), hdr(),
  ]);
  return { blat, sciana, korek, lampa, otoczenie };
}

/** Stage two: the rest of the desk, loaded in the background after the first frame. */
export async function etapDrugi() {
  const [kraft, papier, aluminium, roslina, przybory, bloczki, ramkaStojaca, obraz, zegar] = await Promise.all([
    zestaw("kraft"), zestaw("papier"), zestaw("aluminium"),
    model("potted_plant_02"), model("stationery_supplies"), model("office_notepads"),
    model("standing_picture_frame_02"), model("hanging_picture_frame_02"), model("alarm_clock_01"),
  ]);
  return { kraft, papier, aluminium, roslina, przybory, bloczki, ramkaStojaca, obraz, zegar };
}
