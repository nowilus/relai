import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PRZYSTANEK_ZNACZNIKA, ktoreZnaczniki } from "./znaczniki.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const SZABLON = readFileSync(join(HERE, "..", "narzedzia", "szablon.html"), "utf8");
const CSS = readFileSync(join(HERE, "..", "css", "strona.css"), "utf8");
const widocznosc = (nr) => Array.from({ length: 7 }, (_, i) => (i === nr ? 1 : 0));
const baza = { zajrzane: new Set(), otwarta: null, przyblizony: false };

describe("the click markers on the 3D desk", () => {
  test("every drawer object and the display has its stop", () => {
    assert.deepEqual(Object.keys(PRZYSTANEK_ZNACZNIKA).sort(), ["dokumenty", "ekran", "laptop", "pudelko", "teczka"]);
  });

  test("a marker shows only while the camera holds at its object's stop", () => {
    assert.deepEqual(ktoreZnaczniki({ ...baza, przystanek: 3, widocznosc: widocznosc(3) }), ["teczka"]);
    assert.deepEqual(ktoreZnaczniki({ ...baza, przystanek: 1, widocznosc: widocznosc(1) }), []);
  });

  test("not mid-flight: the stop's copy has to be up", () => {
    const w = widocznosc(3);
    w[3] = 0.3;
    assert.deepEqual(ktoreZnaczniki({ ...baza, przystanek: 3, widocznosc: w }), []);
  });

  test("gone for good once that object was opened, and while any drawer is open", () => {
    assert.deepEqual(ktoreZnaczniki({ ...baza, zajrzane: new Set(["teczka"]), przystanek: 3, widocznosc: widocznosc(3) }), []);
    assert.deepEqual(ktoreZnaczniki({ ...baza, otwarta: "pudelko", przystanek: 3, widocznosc: widocznosc(3) }), []);
  });

  test("the display's marker goes while the camera is close to it", () => {
    assert.deepEqual(ktoreZnaczniki({ ...baza, przystanek: 6, widocznosc: widocznosc(6) }), ["ekran"]);
    assert.deepEqual(ktoreZnaczniki({ ...baza, przyblizony: true, przystanek: 6, widocznosc: widocznosc(6) }), []);
  });

  test("the page carries the layer and its words; the pulse stops under reduced motion", () => {
    assert.match(SZABLON, /data-znaczniki[^>]*data-zajrzyj="\{\{znaczniki\.zajrzyj\}\}"[^>]*data-przybliz="\{\{znaczniki\.przybliz\}\}"/);
    assert.match(CSS, /@media \(prefers-reduced-motion: reduce\) \{[^}]*\.znacznik__kropka/);
  });
});
