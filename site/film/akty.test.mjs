import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  nastepnyStan, PROG_WEJSCIA, MARGINES_RESETU, CZAS_SEKCJI, czyTrzymac, ROZSYPKA, KOLEJNOSC_UPADKU, AMNEZJA, LUK, LOT, oknoLotu, czasSzczytu,
  ksztaltLotu, cienLotu, kolejnoscLotu, klatkiLotu, uniesienieFiszki, yPamieci, tasmaNaDotyk, ZAPYTANIE_DOTYKU, celSrodka, naPierwszaFiszke,
} from "./akty.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = readFileSync(join(HERE, "..", "narzedzia", "szablon-film.html"), "utf8");
const PAGE = readFileSync(join(HERE, "..", "index.html"), "utf8");
const CSS = readFileSync(join(HERE, "..", "css", "film.css"), "utf8");

const NOTES = 8; // the question notes of act 2 (two per document)
const EPS = 1e-9;
const near = (actual, expected, label) => assert.ok(Math.abs(actual - expected) < EPS, `${label}: ${actual} is not ${expected}`);

// A target line for a note: down and to the right, turned and scaled when it lands.
const CEL = { dx: 120, dy: 80, r: -7, s: 0.62 };

describe("once-sections: play on entry, reset only off screen", () => {
  test("a waiting section starts when its top has come into the frame", () => {
    assert.equal(nastepnyStan("czeka", true, true), "gra");
    assert.equal(nastepnyStan("czeka", false, true), "czeka");
  });

  test("a playing section keeps playing while any part of it is on screen", () => {
    assert.equal(nastepnyStan("gra", false, true), "gra");
    assert.equal(nastepnyStan("gra", true, true), "gra");
  });

  test("it resets only when it has left the screen completely", () => {
    assert.equal(nastepnyStan("gra", false, false), "czeka");
  });

  test("scrolling down is held only while a section plays, scrolling up never", () => {
    assert.equal(czyTrzymac(1000, 2000, 120), true);
    assert.equal(czyTrzymac(1000, 2000, -120), false);
    assert.equal(czyTrzymac(2000, 2000, 120), false);
    assert.equal(czyTrzymac(2500, 2000, 120), false);
  });

  test("every once-section has a hold time, the peak the longest, none past four seconds", () => {
    for (const nazwa of ["amnezja", "pamiec", "plan", "panel", "instalacja"]) assert.ok(CZAS_SEKCJI[nazwa] > 0, nazwa);
    assert.equal(CZAS_SEKCJI.pamiec, Math.max(...Object.values(CZAS_SEKCJI)));
    assert.ok(CZAS_SEKCJI.pamiec >= czasSzczytu(NOTES), "the hold covers the whole flight");
    assert.ok(Math.max(...Object.values(CZAS_SEKCJI)) <= 4000);
  });

  test("a section touching the frame's edge does not count as on screen", () => {
    assert.ok(MARGINES_RESETU > 0);
  });

  test("the entry line sits inside the frame", () => {
    assert.ok(PROG_WEJSCIA > 0 && PROG_WEJSCIA < 0.6);
  });

  test("the template marks acts 2a, 2b, 3, 4 and 6 as once-sections and none of them is pinned", () => {
    for (const nazwa of ["amnezja", "pamiec", "plan", "panel", "instalacja"]) {
      const tag = TEMPLATE.match(new RegExp(`<section\\b[^>]*\\bdata-raz="${nazwa}"[^>]*>`))?.[0];
      assert.ok(tag, `section data-raz="${nazwa}" not found`);
      assert.match(tag, /\bdata-sc-act="flow"/);
    }
  });

  test("POSITIVE CONTROL: the commands act is still the engine's horizontal pan", () => {
    assert.match(TEMPLATE, /<section\b[^>]*class="akt komendy"[^>]*data-sc-act="pan"/);
  });

  test("the transitions live only on .gra, so a reset is instant", () => {
    const transitions = CSS.split("\n").filter((l) => /\btransition:/.test(l) && /html\.ruch \.(amnezja|plan|panel|instalacja)/.test(l));
    assert.ok(transitions.length >= 6, `${transitions.length} once-transitions found`);
    for (const l of transitions) assert.match(l, /\.gra\b/, l);
  });

  test("no cue or spotlight is left on the once-sections", () => {
    assert.doesNotMatch(TEMPLATE, /data-sc-spotlight|data-sc-cue|data-sc-reveal/);
  });
});

describe("act 2a: notes drop onto the desk", () => {
  test("the drop order is a permutation of the notes", () => {
    assert.deepEqual([...KOLEJNOSC_UPADKU].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6, 7]);
  });

  test("the page has as many notes and scatter points as the test assumes", () => {
    assert.equal((PAGE.match(/\sdata-karteczka[\s>]/g) ?? []).length, NOTES);
    assert.ok(ROZSYPKA.length >= NOTES, "every note has its own place on the desk");
  });

  test("the drop is over within about two seconds", () => {
    const end = AMNEZJA.start + (NOTES - 1) * AMNEZJA.krokKarteczki + AMNEZJA.upadek;
    assert.ok(end <= 2200, `the last note lands at ${end} ms`);
  });

  test("notes of the same row stand left to right in document order, so paths never cross", () => {
    const firsts = [0, 2, 4, 6].map((i) => ROZSYPKA[i][0]);
    const seconds = [1, 3, 5, 7].map((i) => ROZSYPKA[i][0]);
    for (const row of [firsts, seconds]) {
      for (let i = 1; i < row.length; i++) assert.ok(row[i] > row[i - 1], `row ${row.join(", ")}`);
    }
  });
});

describe("act 2b: the flight, the peak", () => {
  test("flights start one after another and at most two notes are in the air at once", () => {
    const windows = Array.from({ length: NOTES }, (_, i) => oknoLotu(i));
    for (let i = 1; i < NOTES; i++) assert.ok(windows[i][0] > windows[i - 1][0]);
    for (let t = 0; t <= czasSzczytu(NOTES); t += 10) {
      const inAir = windows.filter(([od, doo]) => t > od && t < doo).length;
      assert.ok(inAir <= 2, `${inAir} notes in the air at ${t} ms`);
    }
  });

  test("the peak is the longest animation on the page (longer than the drop and the plan)", () => {
    const drop = AMNEZJA.start + (NOTES - 1) * AMNEZJA.krokKarteczki + AMNEZJA.upadek;
    const PLAN_MS = 1650 + 360; // the stamp's delay and duration in film.css
    assert.ok(CSS.includes("360ms cubic-bezier(.55, 0, 1, .45) 1650ms"), "the stamp timing in film.css changed");
    assert.ok(czasSzczytu(NOTES) > drop, `peak ${czasSzczytu(NOTES)} ms, drop ${drop} ms`);
    assert.ok(czasSzczytu(NOTES) > PLAN_MS, `peak ${czasSzczytu(NOTES)} ms, plan ${PLAN_MS} ms`);
  });

  test("a note rests before the flight and sits on its line after it", () => {
    const a = ksztaltLotu(0, CEL);
    near(a.x, 0, "x"); near(a.y, 0, "y"); assert.equal(a.r, CEL.r); near(a.s, 1, "s");
    assert.equal(a.karteczka, 1); assert.equal(a.wpis, 0);
    const b = ksztaltLotu(1, CEL);
    near(b.x, CEL.dx, "x"); near(b.y, CEL.dy, "y"); near(b.r, 0, "r"); near(b.s, CEL.s, "s");
    near(b.karteczka, 0, "karteczka"); near(b.wpis, 1, "wpis");
  });

  test("at the top of the arc the note is lifted by LUK.wysokosc and grows by LUK.wzrost", () => {
    const mid = ksztaltLotu(0.5, CEL);
    near(mid.uniesienie, 1, "uniesienie");
    near(mid.y, CEL.dy * 0.5 - LUK.wysokosc, "y");
    near(mid.s, 1 - (1 - CEL.s) * 0.5 + LUK.wzrost, "s");
  });

  test("the shadow grows with the lift and is the desk shadow on the desk", () => {
    assert.match(cienLotu(0), /0 14\.0px 30\.0px rgba\(49, 44, 37, 0\.180\)/);
    assert.match(cienLotu(1), /0 40\.0px 60\.0px rgba\(49, 44, 37, 0\.120\)/);
  });

  test("the keyframes run from offset 0 to 1 and end on the line", () => {
    const k = klatkiLotu(CEL, 8);
    assert.equal(k.length, 9);
    assert.equal(k[0].offset, 0);
    assert.equal(k.at(-1).offset, 1);
    assert.match(k.at(-1).transform, /translate3d\(120\.0px, 80\.0px, 0\)/);
    assert.equal(k.at(-1).opacity, 0);
  });

  test("the first line of every document flies first, then the second ones", () => {
    assert.deepEqual(kolejnoscLotu([0, 0, 1, 1, 2, 2, 3, 3]), [0, 2, 4, 6, 1, 3, 5, 7]);
  });

  test("each note has its printed entry in a document", () => {
    assert.equal((PAGE.match(/\sdata-wpis[\s>]/g) ?? []).length, NOTES);
    assert.match(PAGE, /data-lot\b/);
  });

  test("in act 2b the scatter stays between the heading and the documents", () => {
    for (const [, y] of ROZSYPKA) {
      assert.ok(yPamieci(y) >= 0.35 && yPamieci(y) <= 0.6, `y ${y} -> ${yPamieci(y)}`);
    }
  });

  test("LOT is a flight of the same length for every note", () => {
    for (let i = 0; i < NOTES; i++) assert.equal(oknoLotu(i)[1] - oknoLotu(i)[0], LOT.czas);
  });
});

describe("act 5: the card in the middle of the frame lifts", () => {
  test("the centred card is fully lifted, a card a frame away is not", () => {
    near(uniesienieFiszki(0, 250), 1, "centred");
    near(uniesienieFiszki(400, 250), 0, "far right");
    near(uniesienieFiszki(-400, 250), 0, "far left");
  });

  test("the lift falls off symmetrically", () => {
    near(uniesienieFiszki(100, 250), uniesienieFiszki(-100, 250), "symmetry");
    assert.ok(uniesienieFiszki(100, 250) > uniesienieFiszki(180, 250));
  });
});

// A stand-in for the few DOM calls tasmaNaDotyk makes: attributes and a class list.
function element(atrybuty = {}, dzieci = {}) {
  const a = new Map(Object.entries(atrybuty));
  const klasy = new Set();
  return {
    setAttribute: (k, v) => a.set(k, v), removeAttribute: (k) => a.delete(k), hasAttribute: (k) => a.has(k), getAttribute: (k) => a.get(k) ?? null,
    querySelector: (sel) => dzieci[sel] ?? null, classList: { add: (k) => klasy.add(k), contains: (k) => klasy.has(k) },
  };
}
function strona() {
  const scena = element({ "data-sc-stage": "" });
  const tasma = element({ "data-sc-pan": "0.019" });
  const akt = element({ "data-sc-act": "pan", "data-sc-span": "4" }, { "[data-sc-stage]": scena, "[data-sc-pan]": tasma });
  const html = element();
  return { akt, scena, tasma, html, doc: { documentElement: html, querySelector: (sel) => (sel === ".akt.komendy" ? akt : null) } };
}

describe("act 5 under a finger: no pin, the rail scrolls sideways", () => {
  test("on a touch screen the act becomes a plain section and the rail loses the engine's pan", () => {
    const s = strona();
    assert.equal(tasmaNaDotyk(s.doc, true), true);
    assert.equal(s.akt.getAttribute("data-sc-act"), "flow");
    assert.equal(s.akt.hasAttribute("data-sc-span"), false);
    assert.equal(s.scena.hasAttribute("data-sc-stage"), false);
    assert.equal(s.tasma.hasAttribute("data-sc-pan"), false);
    assert.equal(s.html.classList.contains("dotyk"), true);
  });

  test("a swipe down stops on the act for a second, with the rail as the part to centre", () => {
    const s = strona();
    tasmaNaDotyk(s.doc, true);
    assert.equal(s.akt.getAttribute("data-raz"), "komendy");
    assert.equal(s.tasma.hasAttribute("data-raz-srodek"), true);
    assert.equal(CZAS_SEKCJI.komendy, 1000);
  });

  test("the held rail sits in the middle of the frame below the header bar", () => {
    // rail 300 px tall whose top is 500 px down the viewport, page at 1000, frame 553, bar 60
    const cel = celSrodka({ top: 500, height: 300 }, 1000, 553, 60);
    const srodekPoPrzewinieciu = 500 + 1000 - cel + 150;
    assert.ok(Math.abs(srodekPoPrzewinieciu - (60 + 553) / 2) <= 0.5, `rail middle at ${srodekPoPrzewinieciu}`);
  });

  test("with a mouse nothing changes: the wheel keeps panning the rail", () => {
    const s = strona();
    assert.equal(tasmaNaDotyk(s.doc, false), false);
    assert.equal(s.akt.getAttribute("data-sc-act"), "pan");
    assert.equal(s.tasma.getAttribute("data-sc-pan"), "0.019");
  });

  test("touch means no hover and a coarse pointer, so a touch laptop with a mouse keeps the pan", () => {
    assert.equal(ZAPYTANIE_DOTYKU, "(hover: none) and (pointer: coarse)");
  });

  test("the rail scrolls natively with a card in the middle, and the switch runs before the engine mounts", () => {
    assert.match(CSS, /html\.dotyk \.akt\.komendy \.tasma \{[^}]*overflow-x: auto;[^}]*scroll-snap-type: x mandatory/);
    assert.match(CSS, /html\.dotyk \.akt\.komendy \.fiszka \{ scroll-snap-align: center; \}/);
    const start = readFileSync(join(HERE, "start.js"), "utf8");
    assert.ok(start.indexOf("tasmaNaDotyk(") < start.indexOf("silnik.mount("), "the switch has to come before mount");
  });
});

describe("the header button on a phone", () => {
  test("carries both names; a phone shows the one that does not promise an install", () => {
    assert.match(TEMPLATE, /<span class="pasek__komputer">\{\{hero\.wezwanie\}\}<\/span><span class="pasek__telefon">\{\{hero\.wezwanieTelefon\}\}<\/span>/);
    assert.match(CSS, /@media \(max-width: 600px\) \{ \.pasek__komputer \{ display: none; \} \}/);
  });

  test("it steps aside at the install act only on a wider screen", () => {
    assert.match(CSS, /@media \(min-width: 601px\) \{\s*html\.przy-instalacji \.pasek__nav \.przycisk \{ opacity: 0; visibility: hidden;/);
  });
});

describe("the first arrival on the commands starts at the first card", () => {
  const sekcja = () => {
    const tasma = { left: 732, scrollTo({ left }) { this.left = left; } };
    return { tasma, dataset: {}, querySelector: (sel) => (sel === "[data-raz-srodek]" ? tasma : null) };
  };

  test("the rail goes back to its left end the first time the act plays", () => {
    const s = sekcja();
    naPierwszaFiszke(s);
    assert.equal(s.tasma.left, 0);
  });

  test("a later arrival keeps the card the visitor left it on", () => {
    const s = sekcja();
    naPierwszaFiszke(s);
    s.tasma.left = 488;
    naPierwszaFiszke(s);
    assert.equal(s.tasma.left, 488);
  });

  test("with a mouse (no centred rail) nothing moves", () => {
    const s = { dataset: {}, querySelector: () => null };
    assert.doesNotThrow(() => naPierwszaFiszke(s));
  });
});
