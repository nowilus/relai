import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { kierunekGestu, celKroku, czyZwolnic, PROG_GESTU_PX, DOJAZD_EPS, ZAPAS_MS } from "./krok.js";

// stop offsets on the page, px: hero, amnesia, peak, plan, panel, commands, install
const PUNKTY = [0, 400, 1100, 1500, 1900, 2300, 2800];

describe("a swipe on a touch screen is one step along the stops", () => {
  test("a finger moved up far enough is a step down the page, down is a step back", () => {
    assert.equal(kierunekGestu(0, PROG_GESTU_PX + 1), 1);
    assert.equal(kierunekGestu(0, -(PROG_GESTU_PX + 1)), -1);
  });

  test("a short touch or a sideways swipe is no step", () => {
    assert.equal(kierunekGestu(0, PROG_GESTU_PX - 1), 0);
    assert.equal(kierunekGestu(200, 120), 0);
  });

  test("from a stop, the next stop down or up", () => {
    assert.equal(celKroku(PUNKTY, 1100, 1), 3);
    assert.equal(celKroku(PUNKTY, 1100, -1), 1);
  });

  test("between two stops (the page moved by itself), down takes the one below, up the one above", () => {
    assert.equal(celKroku(PUNKTY, 1300, 1), 3);
    assert.equal(celKroku(PUNKTY, 1300, -1), 2);
  });

  test("a pixel or two off a stop still counts as standing on it", () => {
    assert.equal(celKroku(PUNKTY, 1102, 1), 3);
    assert.equal(celKroku(PUNKTY, 1098, -1), 1);
  });

  test("past the ends there is nowhere to go", () => {
    assert.equal(celKroku(PUNKTY, 2800, 1), null);
    assert.equal(celKroku(PUNKTY, 0, -1), null);
    assert.equal(celKroku(PUNKTY, 400, 0), null);
  });
});

describe("the hold lasts until the camera has arrived", () => {
  const cel = 0.5;
  test("held while the camera is still on its way", () => {
    assert.equal(czyZwolnic({ postep: 0.4, cel, szczyt: "porzadek", od: 0, teraz: 500 }), false);
  });

  test("released once the camera stands at the stop", () => {
    assert.equal(czyZwolnic({ postep: cel + DOJAZD_EPS / 2, cel, szczyt: "porzadek", od: 0, teraz: 500 }), true);
  });

  test("held while the peak plays at the stop, released when it has played", () => {
    assert.equal(czyZwolnic({ postep: cel, cel, szczyt: "gra", od: 0, teraz: 500 }), false);
    assert.equal(czyZwolnic({ postep: cel, cel, szczyt: "porzadek", od: 0, teraz: 500 }), true);
  });

  test("released after the safety margin whatever the camera reports, so a page is never stuck", () => {
    assert.equal(czyZwolnic({ postep: 0.1, cel, szczyt: "gra", od: 0, teraz: ZAPAS_MS + 1 }), true);
  });
});
