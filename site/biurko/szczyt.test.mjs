import { test } from "node:test";
import assert from "node:assert/strict";
import { ulozenie, nastepnaFaza, czasFazy, graniceSzczytu, oknoLotu, oknoWzrostu, CZAS_MS, DOKUMENT_KARTECZKI } from "./szczyt.js";
import { zbudujTor } from "./kamera.js";

const poczatek = [[-0.08, 0.12], [0.04, 0.26], [0.15, 0.14], [-0.03, 0.33], [0.25, 0.28], [0.09, 0.03], [0.31, 0.12]]
  .map(([x, z], i) => ({ poz: [x, 0.7512 + i * 0.0005, z], rotY: (i - 3) * 0.17 }));
const cele = [0, 1, 2, 3].map((j) => ({ poz: [0.05 + j * 0.15, 0.751, -0.1], rotY: 0.06 - j * 0.03 }));
const poziomo = (a, b) => Math.hypot(a[0] - b[0], a[2] - b[2]);

test("at t = 0 it is the mess as built: notes where they lie, full size, no documents", () => {
  const s = ulozenie(0, poczatek, cele);
  s.karteczki.forEach((k, i) => {
    assert.deepEqual(k.poz, poczatek[i].poz);
    assert.equal(k.obrot[1], poczatek[i].rotY);
    assert.equal(k.skala, 1);
  });
  assert.deepEqual(s.dokumenty, [0, 0, 0, 0]);
});

test("at t = 1 there are four whole documents and no notes left", () => {
  const s = ulozenie(1, poczatek, cele);
  assert.deepEqual(s.dokumenty, [1, 1, 1, 1]);
  for (const k of s.karteczki) assert.equal(k.skala, 0);
  s.karteczki.forEach((k, i) => assert.ok(poziomo(k.poz, cele[DOKUMENT_KARTECZKI[i]].poz) < 1e-9, `note ${i} on its document`));
});

test("monotonic: documents only grow, notes only shrink and only get closer to their document", () => {
  let poprz = ulozenie(0, poczatek, cele);
  for (let n = 1; n <= 400; n++) {
    const s = ulozenie(n / 400, poczatek, cele);
    s.dokumenty.forEach((d, j) => assert.ok(d >= poprz.dokumenty[j] - 1e-12, `document ${j} at ${n}`));
    s.karteczki.forEach((k, i) => {
      const cel = cele[DOKUMENT_KARTECZKI[i]].poz;
      assert.ok(k.skala <= poprz.karteczki[i].skala + 1e-12, `note ${i} scale at ${n}`);
      assert.ok(poziomo(k.poz, cel) <= poziomo(poprz.karteczki[i].poz, cel) + 1e-12, `note ${i} distance at ${n}`);
    });
    poprz = s;
  }
});

test("deterministic: the same moment gives the same frame", () => {
  for (const t of [0.13, 0.5, 0.77]) assert.deepEqual(ulozenie(t, poczatek, cele), ulozenie(t, poczatek, cele));
});

test("every note lifts off the desk mid-flight", () => {
  poczatek.forEach((k, i) => {
    const [od, ko] = oknoLotu(i);
    const s = ulozenie((od + ko) / 2, poczatek, cele);
    assert.ok(s.karteczki[i].poz[1] > k.poz[1] + 0.05, `note ${i}`);
  });
});

test("a document grows only after all its notes have landed, and everything ends inside the animation", () => {
  for (let j = 0; j < 4; j++) {
    const [od, ko] = oknoWzrostu(j);
    DOKUMENT_KARTECZKI.forEach((d, i) => { if (d === j) assert.ok(oknoLotu(i)[1] <= od + 1e-12); });
    assert.ok(ko <= 1, `document ${j} ends by the end`);
  }
});

const granice = graniceSzczytu(zbudujTor());

test("the peak plays once on the way down, then stays ordered", () => {
  let s = { faza: "balagan", start: 0 };
  s = nastepnaFaza(s, { p: granice.start - 0.01, teraz: 0, granice });
  assert.equal(s.faza, "balagan");
  s = nastepnaFaza(s, { p: granice.start, teraz: 1000, granice });
  assert.deepEqual(s, { faza: "gra", start: 1000 });
  assert.equal(czasFazy(s, 1000 + CZAS_MS / 2), 0.5);
  s = nastepnaFaza(s, { p: granice.start + 0.2, teraz: 1000 + CZAS_MS - 1, granice });
  assert.equal(s.faza, "gra");
  s = nastepnaFaza(s, { p: granice.start, teraz: 1000 + CZAS_MS, granice });
  assert.equal(s.faza, "porzadek");
  assert.equal(czasFazy(s, 0), 1);
});

test("same end state after a reset and a second pass down", () => {
  let s = { faza: "porzadek", start: 0 };
  s = nastepnaFaza(s, { p: granice.start - 0.001, teraz: 0, granice });
  assert.equal(s.faza, "porzadek", "going back up into the silence keeps the order");
  s = nastepnaFaza(s, { p: granice.reset - 0.001, teraz: 0, granice });
  assert.equal(s.faza, "balagan", "back at the Amnesia hold: reset");
  s = nastepnaFaza(s, { p: granice.start, teraz: 5000, granice });
  s = nastepnaFaza(s, { p: granice.start, teraz: 5000 + CZAS_MS, granice });
  assert.equal(s.faza, "porzadek");
  assert.deepEqual(ulozenie(czasFazy(s, 0), poczatek, cele), ulozenie(1, poczatek, cele));
});

test("a page opened past the peak shows it ordered, without playing", () => {
  const s = nastepnaFaza({ faza: "balagan", start: 0 }, { p: granice.koniec + 0.01, teraz: 0, granice });
  assert.equal(s.faza, "porzadek");
});

test("the borders sit in order on the track: reset, start, end", () => {
  assert.ok(granice.reset < granice.start && granice.start < granice.koniec);
});
