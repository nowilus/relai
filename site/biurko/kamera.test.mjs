import { test } from "node:test";
import assert from "node:assert/strict";
import { KLUCZE, LICZBA_TEKSTOW, zbudujTor, poza, postepPrzystanku, aktualnyPrzystanek, ulamekMapy, POZY, POZY_PIONOWE, pozyDlaOkna } from "./kamera.js";

const tor = zbudujTor();

test("track covers 0..1 with keys in order", () => {
  const o = tor.odcinki;
  assert.equal(o[0].lotOd, 0);
  assert.ok(Math.abs(o.at(-1).postojDo - 1) < 1e-12);
  for (let i = 1; i < o.length; i++) assert.ok(o[i].lotOd >= o[i - 1].postojDo - 1e-12);
});

/** The stops (with copy) that are not clearly shorter than the peak; no peak at all fails as well. */
function dorownujaSzczytowi(klucze) {
  const span = (k) => k.wejscie + k.postoj;
  const peak = klucze.find((k) => k.poza === "porzadek");
  if (!peak) return ["no peak"];
  return klucze.filter((k) => k !== peak && k.tekst !== null && !(span(peak) > span(k) * 1.8)).map((k) => k.poza);
}

test("the peak has the largest span of any stop", () => {
  assert.deepEqual(dorownujaSzczytowi(KLUCZE), []);
});

test("positive control: the peak check fails without the peak key or with a stop as long as the peak", () => {
  assert.deepEqual(dorownujaSzczytowi(KLUCZE.filter((k) => k.poza !== "porzadek")), ["no peak"]);
  const peak = KLUCZE.find((k) => k.poza === "porzadek");
  const dlugiPlan = KLUCZE.map((k) => (k.poza === "plan" ? { ...k, wejscie: peak.wejscie, postoj: peak.postoj } : k));
  assert.deepEqual(dorownujaSzczytowi(dlugiPlan), ["plan"]);
});

test("the hero pose is the one accepted before E6 (2d749de): the hero frame does not move", () => {
  assert.deepEqual(POZY.biurko, { poz: [-0.3, 1.14, 1.2], cel: [-0.02, 0.98, -0.45], fov: 40 });
});

test("every stop's copy is fully visible at the middle of its hold, and only that copy", () => {
  for (let nr = 0; nr < LICZBA_TEKSTOW; nr++) {
    const w = poza(tor, postepPrzystanku(tor, nr)).widocznosc;
    w.forEach((v, i) => assert.equal(v, i === nr ? 1 : 0, `stop ${nr}, copy ${i}`));
  }
});

test("the silence before the peak shows no copy at all", () => {
  const cisza = tor.odcinki.find((o) => o.tekst === null);
  const w = poza(tor, (cisza.postojOd + cisza.postojDo) / 2).widocznosc;
  assert.deepEqual(w, new Array(LICZBA_TEKSTOW).fill(0));
});

test("hero copy is there at the first pixel and gone within the first flight", () => {
  assert.equal(poza(tor, 0).widocznosc[0], 1);
  assert.equal(poza(tor, tor.odcinki[1].postojOd).widocznosc[0], 0);
});

test("the close holds to the end", () => {
  assert.equal(poza(tor, 1).widocznosc[6], 1);
});

test("the camera rests exactly on each key during its hold", () => {
  for (const o of tor.odcinki) {
    const a = poza(tor, o.postojOd).poz;
    const b = poza(tor, o.postojDo - 1e-9).poz;
    a.forEach((v, i) => assert.ok(Math.abs(v - b[i]) < 1e-9, o.poza));
  }
});

test("map stop follows the camera and covers 0..6", () => {
  const seen = new Set();
  for (let p = 0; p <= 1; p += 0.001) seen.add(aktualnyPrzystanek(tor, p));
  assert.deepEqual([...seen].sort(), [0, 1, 2, 3, 4, 5, 6]);
});

test("map axis share: k/6 at stop k, linear between stops, clamped, monotonic", () => {
  const ostatni = LICZBA_TEKSTOW - 1;
  for (let nr = 0; nr <= ostatni; nr++) {
    assert.ok(Math.abs(ulamekMapy(tor, postepPrzystanku(tor, nr)) - nr / ostatni) < 1e-9, `stop ${nr}`);
  }
  const srodek = (postepPrzystanku(tor, 3) + postepPrzystanku(tor, 4)) / 2;
  assert.ok(Math.abs(ulamekMapy(tor, srodek) - 3.5 / ostatni) < 1e-9);
  assert.equal(ulamekMapy(tor, -1), 0);
  assert.equal(ulamekMapy(tor, 2), 1);
  let poprzedni = 0;
  for (let p = 0; p <= 1; p += 0.001) {
    const u = ulamekMapy(tor, p);
    assert.ok(u >= poprzedni - 1e-12 && u <= 1);
    poprzedni = u;
  }
});

test("portrait poses: one per desktop pose, picked by the window's proportions", () => {
  assert.deepEqual(Object.keys(POZY_PIONOWE).sort(), Object.keys(POZY).sort());
  for (const [n, p] of Object.entries(POZY_PIONOWE)) {
    assert.equal(p.poz.length, 3, n);
    assert.equal(p.cel.length, 3, n);
    assert.ok(p.fov >= 30 && p.fov <= 70, n);
  }
  assert.equal(pozyDlaOkna(390, 844), POZY_PIONOWE);
  assert.equal(pozyDlaOkna(768, 1024), POZY_PIONOWE);
  assert.equal(pozyDlaOkna(1366, 768), POZY);
  assert.equal(pozyDlaOkna(1024, 1024), POZY);
  // the track and its stops do not depend on the pose set: the peak stays the longest span either way
  assert.deepEqual(poza(tor, 0.5, POZY_PIONOWE).widocznosc, poza(tor, 0.5).widocznosc);
});

test("pose is a pure function of progress and clamps outside 0..1", () => {
  assert.deepEqual(poza(tor, -1).poz, poza(tor, 0).poz);
  assert.deepEqual(poza(tor, 2).poz, poza(tor, 1).poz);
});
