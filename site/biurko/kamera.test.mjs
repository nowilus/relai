import { test } from "node:test";
import assert from "node:assert/strict";
import { KLUCZE, LICZBA_TEKSTOW, zbudujTor, poza, postepPrzystanku, aktualnyPrzystanek } from "./kamera.js";

const tor = zbudujTor();

test("track covers 0..1 with keys in order", () => {
  const o = tor.odcinki;
  assert.equal(o[0].lotOd, 0);
  assert.ok(Math.abs(o.at(-1).postojDo - 1) < 1e-12);
  for (let i = 1; i < o.length; i++) assert.ok(o[i].lotOd >= o[i - 1].postojDo - 1e-12);
});

test("the peak has the largest span of any stop", () => {
  const span = (k) => k.wejscie + k.postoj;
  const peak = KLUCZE.find((k) => k.poza === "porzadek");
  for (const k of KLUCZE) if (k !== peak && k.tekst !== null) assert.ok(span(peak) > span(k) * 1.8, k.poza);
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

test("pose is a pure function of progress and clamps outside 0..1", () => {
  assert.deepEqual(poza(tor, -1).poz, poza(tor, 0).poz);
  assert.deepEqual(poza(tor, 2).poz, poza(tor, 1).poz);
});
