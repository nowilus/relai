import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { stanMapy } from "./mapa-przeplywu.js";

// seven stops, the way the flow page lays them out: the hero first, then a stop every ~900 px
const GORY = [0, 1000, 1900, 2800, 3700, 4600, 5500];

describe("stanMapy — the header map without the scene", () => {
  test("above the first stop's top: the first stop, nothing filled", () => {
    assert.deepEqual(stanMapy(GORY, 0), { przystanek: 0, ulamek: 0 });
    assert.deepEqual(stanMapy(GORY, -50), { przystanek: 0, ulamek: 0 });
  });

  test("on a stop's top edge: that stop, the fill exactly at its dot", () => {
    assert.deepEqual(stanMapy(GORY, 1900), { przystanek: 2, ulamek: 2 / 6 });
  });

  test("halfway between two stops: the earlier one, the fill halfway between their dots", () => {
    const s = stanMapy(GORY, 2350);
    assert.equal(s.przystanek, 2);
    assert.ok(Math.abs(s.ulamek - 2.5 / 6) < 1e-9);
  });

  test("past the last top or at the very bottom (Infinity): the last stop, fully filled", () => {
    assert.deepEqual(stanMapy(GORY, 6000), { przystanek: 6, ulamek: 1 });
    assert.deepEqual(stanMapy(GORY, Infinity), { przystanek: 6, ulamek: 1 });
  });

  test("the fill only grows as the line goes down the page", () => {
    let poprzedni = -1;
    for (let y = -100; y <= 6000; y += 37) {
      const { ulamek } = stanMapy(GORY, y);
      assert.ok(ulamek >= poprzedni, `fill went back at ${y}`);
      poprzedni = ulamek;
    }
  });

  test("fewer than two stops or a line that is not a number: the first stop, nothing filled", () => {
    assert.deepEqual(stanMapy([0], 500), { przystanek: 0, ulamek: 0 });
    assert.deepEqual(stanMapy(GORY, Number.NaN), { przystanek: 0, ulamek: 0 });
  });
});
