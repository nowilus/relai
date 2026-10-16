import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PAMIEC, PASKI, PROSTO, ROZSYPKA, oknaZdan, oknaPaskow, oknoLotu, lotKarteczki, kolejnoscLotu } from "./akty.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = readFileSync(join(HERE, "..", "narzedzia", "szablon-film.html"), "utf8");
const PAGE = readFileSync(join(HERE, "index.html"), "utf8");

const NOTES = 7; // the question notes of act 2 (one flight each)
const EPS = 1e-9;
const parseWindow = (w) => w.split(" ").map(Number);
const near = (actual, expected, label) => assert.ok(Math.abs(actual - expected) < EPS, `${label}: ${actual} is not ${expected}`);

// A target line for a note: down and to the right, turned and scaled when it lands.
const CEL = { dx: 120, dy: 80, r: -7, s: 0.62 };

describe("act 2: amnesia sentences", () => {
  const windows = oknaZdan(3).map(parseWindow);

  test("each window lies inside the amnesia part (ends at or before the silence)", () => {
    for (const [from, to] of windows) {
      assert.ok(from >= 0 && from < to);
      assert.ok(to <= PAMIEC.cisza[0], `window ends at ${to}, silence starts at ${PAMIEC.cisza[0]}`);
    }
  });

  test("neighbours overlap, so the sentences crossfade", () => {
    for (let i = 1; i < windows.length; i++) {
      assert.ok(windows[i][0] < windows[i - 1][1], `window ${i} starts before window ${i - 1} ends`);
      assert.ok(windows[i][0] > windows[i - 1][0], "and still later than the previous start");
    }
  });
});

describe("act 4: bars", () => {
  test("the bars start after the window is straight", () => {
    const windows = oknaPaskow(3).map(parseWindow);
    for (const [from, to] of windows) {
      assert.ok(from > PROSTO, `bar starts at ${from}, the window is straight at ${PROSTO}`);
      assert.ok(to <= 1);
    }
    assert.equal(windows[0][0], PASKI.od);
  });
});

describe("act 2: flights", () => {
  test("every flight starts at or after the silence ends and the last ends by the act's end", () => {
    for (let i = 0; i < NOTES; i++) {
      const [from, to] = oknoLotu(i);
      assert.ok(from >= PAMIEC.cisza[1], `flight ${i} starts at ${from}`);
      assert.ok(to > from);
    }
    assert.ok(oknoLotu(NOTES - 1)[1] <= 1, `the last flight ends at ${oknoLotu(NOTES - 1)[1]}`);
  });

  test("flights start one after another", () => {
    for (let i = 1; i < NOTES; i++) assert.ok(oknoLotu(i)[0] > oknoLotu(i - 1)[0]);
  });

  test("the page has as many notes and scatter points as the test assumes", () => {
    assert.equal((PAGE.match(/\sdata-karteczka[\s>]/g) ?? []).length, NOTES);
    assert.ok(ROZSYPKA.length >= NOTES, "every note has its own place on the desk");
  });
});

describe("act 2: lotKarteczki", () => {
  const [od, doo] = oknoLotu(2);

  test("before its window the note rests: no offset, full size, visible, its line hidden", () => {
    const l = lotKarteczki(od - 0.1, 2, CEL);
    near(l.x, 0, "x");
    near(l.y, 0, "y");
    assert.equal(l.r, CEL.r);
    assert.equal(l.s, 1);
    assert.equal(l.karteczka, 1);
    assert.equal(l.wpis, 0);
  });

  test("after its window the note is on its line: offset reached, straight, scaled, swapped for the entry", () => {
    const l = lotKarteczki(doo + 0.1, 2, CEL);
    near(l.x, CEL.dx, "x");
    near(l.y, CEL.dy, "y");
    near(l.r, 0, "r");
    near(l.s, CEL.s, "s");
    near(l.karteczka, 0, "karteczka");
    near(l.wpis, 1, "wpis");
  });

  test("on the way the note lifts off the desk and moves monotonically towards the line", () => {
    let lastX = -Infinity;
    for (let k = 1; k < 10; k++) {
      const l = lotKarteczki(od + ((doo - od) * k) / 10, 2, CEL);
      assert.ok(l.x > lastX);
      lastX = l.x;
    }
    const mid = lotKarteczki((od + doo) / 2, 2, CEL);
    assert.ok(mid.y < CEL.dy * 0.5, "the arc lifts the note above the straight line");
  });
});

describe("act 2: kolejnoscLotu", () => {
  test("the first line of every document flies first, then the second ones", () => {
    assert.deepEqual(kolejnoscLotu([0, 0, 1, 1, 2, 3, 3]), [0, 2, 4, 5, 1, 3, 6]);
  });

  test("the result is a permutation of the notes", () => {
    const order = kolejnoscLotu([0, 0, 1, 1, 2, 3, 3]);
    assert.deepEqual([...order].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6]);
  });
});

describe("act 2: the peak cannot be skipped by one wheel notch", () => {
  const VIEWPORT_H = 768; // 1366x768, the common laptop
  const WHEEL_NOTCH_PX = 1000; // one big wheel notch (deltaY)

  const tag = TEMPLATE.match(/<section\b[^>]*\bdata-akt="pamiec"[^>]*>/)?.[0];
  const span = Number(tag?.match(/\bdata-sc-span="([\d.]+)"/)?.[1]);

  test("the act height is declared in the template", () => {
    assert.ok(tag, "section data-akt=pamiec not found");
    assert.ok(span > 1, `data-sc-span is ${span}`);
  });

  test("peak (first flight start .. last flight end) is longer than one 1000 px wheel notch", () => {
    const travelPx = (span - 1) * VIEWPORT_H; // pinned travel = (span - 1) viewport heights
    const peakFraction = oknoLotu(NOTES - 1)[1] - PAMIEC.lot.od;
    const peakPx = peakFraction * travelPx;
    assert.ok(peakPx > WHEEL_NOTCH_PX, `the peak is ${Math.round(peakPx)} px of scroll, a notch is ${WHEEL_NOTCH_PX} px`);
  });
});
