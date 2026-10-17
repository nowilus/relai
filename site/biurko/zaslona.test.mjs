import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { ileNotek, postepZPlikow, miejscaNotek, utworzZaslone, KLASA, KLASA_KONCA, STREFA } from "./zaslona.js";

const korzen = (klasy = []) => {
  const zbior = new Set(klasy);
  const style = new Map();
  return {
    classList: { contains: (k) => zbior.has(k), add: (k) => zbior.add(k), remove: (k) => zbior.delete(k) },
    style: { setProperty: (k, v) => style.set(k, v) },
    zbior, styl: style,
  };
};
const zegar = () => {
  const zadania = [];
  return {
    czas: (f, ms) => { zadania.push({ f, ms }); return zadania.length; },
    anuluj: (id) => { if (zadania[id - 1]) zadania[id - 1].f = null; },
    uplyw: () => { for (const z of zadania.splice(0)) z.f?.(); },
    zadania,
  };
};

describe("the loading curtain: pure parts", () => {
  test("one note per seventh of the progress, none at the start, all seven at the end", () => {
    assert.equal(ileNotek(0), 0);
    assert.equal(ileNotek(0.01), 1);
    assert.equal(ileNotek(0.5), 4);
    assert.equal(ileNotek(1), 7);
    assert.equal(ileNotek(1.5), 7);
    let poprzednia = 0;
    for (let p = 0; p <= 1; p += 0.01) {
      assert.ok(ileNotek(p) >= poprzednia);
      poprzednia = ileNotek(p);
    }
  });

  test("progress from loaded files: real counts, the expected total as a floor, never above 1", () => {
    assert.equal(postepZPlikow(0, 3, 40), 0);
    assert.equal(postepZPlikow(10, 12, 40), 0.25); // the loader has queued only 12 so far: 10 of 40 expected
    assert.equal(postepZPlikow(30, 60, 40), 0.5); // more files than expected: the real total wins
    assert.equal(postepZPlikow(70, 60, 40), 1);
  });

  test("note places: inside the window with a margin, outside the logo zone, the same every time", () => {
    for (const [w, h] of [[1366, 768], [390, 844], [1920, 1080], [360, 640]]) {
      const m = miejscaNotek(7, w, h);
      assert.equal(m.length, 7);
      assert.deepEqual(m, miejscaNotek(7, w, h));
      const { szer, wys } = STREFA(w);
      for (const n of m) {
        assert.ok(n.x >= 8 && n.x + n.szer <= w - 8 && n.y >= 64 && n.y + n.wys <= h - 8, `${w}x${h} in window ${JSON.stringify(n)}`);
        const srodekX = w / 2, srodekY = h / 2;
        const naStrefe = n.x < srodekX + szer / 2 && n.x + n.szer > srodekX - szer / 2 && n.y < srodekY + wys / 2 && n.y + n.wys > srodekY - wys / 2;
        assert.equal(naStrefe, false, `${w}x${h} off the logo ${JSON.stringify(n)}`);
      }
    }
  });
});

describe("the loading curtain: states", () => {
  test("progress only grows and is written as --postep", () => {
    const k = korzen([KLASA]);
    const z = utworzZaslone(k, { ...zegar() });
    z.postep(0.4);
    z.postep(0.2);
    assert.equal(z.postep(), 0.4);
    assert.equal(k.styl.get("--postep"), "0.4");
  });

  test("ready: the notes gather first, then the curtain lifts; a second call changes nothing", () => {
    const k = korzen([KLASA]);
    const zg = zegar();
    const z = utworzZaslone(k, { czas: zg.czas, anuluj: zg.anuluj });
    assert.equal(z.gotowe(), "zbiera");
    assert.ok(k.zbior.has(KLASA_KONCA));
    assert.ok(k.zbior.has(KLASA));
    assert.equal(z.postep(), 1);
    zg.uplyw();
    assert.equal(k.zbior.has(KLASA), false);
    assert.equal(z.stan, "zdjeta");
    assert.equal(z.gotowe(), "zdjeta");
  });

  test("an error lifts it at once, with no gathering", () => {
    const k = korzen([KLASA]);
    const z = utworzZaslone(k, { ...zegar() });
    assert.equal(z.blad(), "zdjeta");
    assert.equal(k.zbior.has(KLASA), false);
    assert.equal(k.zbior.has(KLASA_KONCA), false);
  });

  test("without the class from <head> (reduced motion, or its own limit ran out) there is nothing to lift", () => {
    const z = utworzZaslone(korzen(), { ...zegar() });
    assert.equal(z.stan, "zdjeta");
    assert.equal(z.gotowe(), "zdjeta");
  });
});
