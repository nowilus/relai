import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { STANY, ZDARZENIA, WYPELNIENIE, przejscie, pozaPrzyblizenia, rzutuj, zmieszaj } from "./przyblizenie.js";

const bliskie = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? "value"}: ${a} vs ${b} (tol ${tol})`);

describe("przejscie", () => {
  test("click, enter and focus zoom in from the stop when the camera holds there", () => {
    for (const zdarzenie of ["klik", "enter", "fokus"]) {
      assert.equal(przejscie("przystanek", zdarzenie, { naPrzystanku: true }), "przyblizony", zdarzenie);
    }
  });

  test("click, enter and focus change nothing when the camera is off the stop", () => {
    for (const zdarzenie of ["klik", "enter", "fokus"]) {
      for (const stan of STANY) {
        assert.equal(przejscie(stan, zdarzenie, { naPrzystanku: false }), stan, `${stan} + ${zdarzenie}`);
      }
    }
  });

  test("zoom-in events keep an already zoomed state on the stop", () => {
    for (const zdarzenie of ["klik", "enter", "fokus"]) {
      assert.equal(przejscie("przyblizony", zdarzenie, { naPrzystanku: true }), "przyblizony", zdarzenie);
    }
  });

  test("esc, back, scroll-back and leaving zoom out from the close-up, whatever the stop flag", () => {
    for (const zdarzenie of ["esc", "wstecz", "wroc", "opuszczony"]) {
      for (const naPrzystanku of [true, false]) {
        assert.equal(przejscie("przyblizony", zdarzenie, { naPrzystanku }), "przystanek", `${zdarzenie}, naPrzystanku=${naPrzystanku}`);
      }
    }
  });

  test("zoom-out events from the stop stay at the stop", () => {
    for (const zdarzenie of ["esc", "wstecz", "wroc", "opuszczony"]) {
      for (const naPrzystanku of [true, false]) {
        assert.equal(przejscie("przystanek", zdarzenie, { naPrzystanku }), "przystanek", `${zdarzenie}, naPrzystanku=${naPrzystanku}`);
      }
    }
  });

  test("unknown state throws RangeError", () => {
    assert.throws(() => przejscie("nieznany", "klik", { naPrzystanku: true }), RangeError);
    assert.throws(() => przejscie(undefined, "klik", { naPrzystanku: true }), RangeError);
  });

  test("unknown event throws RangeError", () => {
    assert.throws(() => przejscie("przystanek", "nieznane", { naPrzystanku: true }), RangeError);
    assert.throws(() => przejscie("przyblizony", undefined, { naPrzystanku: false }), RangeError);
  });

  test("full table: every event x state x flag lands in a known state", () => {
    for (const zdarzenie of ZDARZENIA) {
      for (const stan of STANY) {
        for (const naPrzystanku of [true, false]) {
          const wynik = przejscie(stan, zdarzenie, { naPrzystanku });
          assert.ok(STANY.includes(wynik), `${stan} + ${zdarzenie} (${naPrzystanku}) -> ${wynik}`);
        }
      }
    }
  });
});

describe("pozaPrzyblizenia + rzutuj: display in frame", () => {
  const SZER = 0.284;
  const WYS = 0.1775;
  const MIN_WYPELNIENIE = 0.85;

  const normuj = (a) => {
    const d = Math.hypot(...a);
    return a.map((v) => v / d);
  };
  const wektorowy = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

  /** Builds a display of the fixed physical size from its centre and outward normal. */
  const ekranZ = (srodek, normalna) => ({ srodek, normalna, szer: SZER, wys: WYS });

  /** The four display corners in world space: centre +/- right * w/2 +/- up * h/2. */
  const narozniki = (ekran) => {
    const prawo = normuj(wektorowy([0, 1, 0], ekran.normalna));
    const gora = wektorowy(ekran.normalna, prawo);
    const rog = (sx, sy) => ekran.srodek.map((v, i) => v + prawo[i] * (ekran.szer / 2) * sx + gora[i] * (ekran.wys / 2) * sy);
    return [rog(-1, -1), rog(1, -1), rog(1, 1), rog(-1, 1)];
  };

  /** Projects the corners; reports the NDC box and how much of each frame axis the display fills. */
  const ekranWKadrze = (poza, ekran, widok) => {
    const rzuty = narozniki(ekran).map((p) => rzutuj(poza, p, widok));
    const xs = rzuty.map((r) => r[0]);
    const ys = rzuty.map((r) => r[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return { minX, maxX, minY, maxY, wypelnienieSzer: (maxX - minX) / 2, wypelnienieWys: (maxY - minY) / 2 };
  };

  /** Throws AssertionError when a corner leaves the frame or the display fills too little of it. */
  const zalozWKadrze = (poza, ekran, widok) => {
    const k = ekranWKadrze(poza, ekran, widok);
    assert.ok(k.minX >= -1 && k.maxX <= 1 && k.minY >= -1 && k.maxY <= 1, `corner outside frame: x ${k.minX}..${k.maxX}, y ${k.minY}..${k.maxY}`);
    assert.ok(Math.max(k.wypelnienieSzer, k.wypelnienieWys) >= MIN_WYPELNIENIE, `display too small in frame: ${k.wypelnienieSzer}, ${k.wypelnienieWys}`);
    return k;
  };

  const EKRANY = {
    "flat display facing +z": ekranZ([0, 0, 0], [0, 0, 1]),
    "scene laptop, tilted": ekranZ([0.55, 0.9, 0.1], normuj([-0.3, 0.25, 0.92])),
  };
  const WIDOKI = {
    "16:9 (1920x1080)": { fov: 40, aspekt: 16 / 9 },
    "16:9 (1366x768)": { fov: 40, aspekt: 1366 / 768 },
    "16:10": { fov: 40, aspekt: 1.6 },
    "4:3 narrow": { fov: 40, aspekt: 4 / 3 },
  };

  for (const [nazwaEkranu, ekran] of Object.entries(EKRANY)) {
    for (const [nazwaWidoku, widok] of Object.entries(WIDOKI)) {
      describe(`${nazwaEkranu}, ${nazwaWidoku}`, () => {
        const poza = pozaPrzyblizenia(ekran, widok);

        test("all four corners are inside the frame and the fill is at least 0.85", () => {
          zalozWKadrze(poza, ekran, widok);
        });

        test("the tighter side fills WYPELNIENIE of the frame", () => {
          const k = ekranWKadrze(poza, ekran, widok);
          bliskie(Math.max(k.wypelnienieSzer, k.wypelnienieWys), WYPELNIENIE, 1e-6, "tighter-side fill");
          assert.ok(Math.max(k.wypelnienieSzer, k.wypelnienieWys) >= MIN_WYPELNIENIE);
        });

        test("the display centre projects to the middle of the frame", () => {
          const [x, y] = rzutuj(poza, ekran.srodek, widok);
          bliskie(x, 0, 1e-9, "ndc x");
          bliskie(y, 0, 1e-9, "ndc y");
        });

        test("the pose looks at the display centre and keeps the fov", () => {
          assert.deepEqual(poza.cel, ekran.srodek);
          assert.notEqual(poza.cel, ekran.srodek, "cel must be a copy, not the input array");
          assert.equal(poza.fov, widok.fov);
        });

        test("negative control: aiming 0.2 m sideways breaks the framing", () => {
          const prawo = normuj(wektorowy([0, 1, 0], ekran.normalna));
          const krzywa = { ...poza, cel: poza.cel.map((v, i) => v + prawo[i] * 0.2) };
          assert.throws(() => zalozWKadrze(krzywa, ekran, widok), assert.AssertionError);
        });

        test("negative control: a fill of 0.5 is too small", () => {
          const mala = pozaPrzyblizenia(ekran, widok, 0.5);
          assert.throws(() => zalozWKadrze(mala, ekran, widok), assert.AssertionError);
        });
      });
    }
  }

  test("the camera sits on the display normal, in front of the display", () => {
    const ekran = EKRANY["scene laptop, tilted"];
    const poza = pozaPrzyblizenia(ekran, WIDOKI["16:9 (1920x1080)"]);
    const przesuniecie = poza.poz.map((v, i) => v - ekran.srodek[i]);
    assert.ok(przesuniecie.reduce((s, v, i) => s + v * ekran.normalna[i], 0) > 0, "camera behind the display");
    const kierunek = normuj(przesuniecie);
    kierunek.forEach((v, i) => bliskie(v, ekran.normalna[i], 1e-12, "direction"));
  });
});

describe("zmieszaj", () => {
  const a = Object.freeze({
    poz: Object.freeze([0, 2, 10]),
    cel: Object.freeze([0, 1, 0]),
    fov: 40,
    widocznosc: Object.freeze([1, 0, 0]),
    przystanek: 3,
  });
  const b = Object.freeze({ poz: Object.freeze([4, 6, 2]), cel: Object.freeze([2, 3, 1]), fov: 20 });

  test("t=0 returns the very same object a", () => {
    assert.equal(zmieszaj(a, b, 0), a);
  });

  test("t=1 gives the pose of b", () => {
    const wynik = zmieszaj(a, b, 1);
    assert.deepEqual(wynik.poz, [4, 6, 2]);
    assert.deepEqual(wynik.cel, [2, 3, 1]);
    assert.equal(wynik.fov, 20);
  });

  test("t=0.5 gives the midpoint, since smoothstep(0.5) = 0.5", () => {
    const wynik = zmieszaj(a, b, 0.5);
    assert.deepEqual(wynik.poz, [2, 4, 6]);
    assert.deepEqual(wynik.cel, [1, 2, 0.5]);
    assert.equal(wynik.fov, 30);
  });

  test("fields other than poz, cel and fov pass through from a", () => {
    const wynik = zmieszaj(a, b, 0.5);
    assert.equal(wynik.widocznosc, a.widocznosc);
    assert.equal(wynik.przystanek, 3);
  });

  test("t outside 0..1 is clamped", () => {
    assert.equal(zmieszaj(a, b, -0.5), a);
    assert.deepEqual(zmieszaj(a, b, 2), zmieszaj(a, b, 1));
    assert.deepEqual(zmieszaj(a, b, 100), zmieszaj(a, b, 1));
  });

  test("easing is smooth: quarter step lies below the linear quarter", () => {
    const wynik = zmieszaj(a, b, 0.25);
    // smoothstep(0.25) = 0.15625
    bliskie(wynik.poz[0], 4 * 0.15625, 1e-12, "poz x");
    bliskie(wynik.fov, 40 - 20 * 0.15625, 1e-12, "fov");
  });

  test("inputs are not mutated", () => {
    const kopiaA = structuredClone(a);
    const kopiaB = structuredClone(b);
    const wynik = zmieszaj(a, b, 0.5);
    assert.deepEqual(a, kopiaA);
    assert.deepEqual(b, kopiaB);
    assert.notEqual(wynik.poz, a.poz);
    assert.notEqual(wynik.poz, b.poz);
  });
});
