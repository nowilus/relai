import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { utworzZaslone, KROKI, KLASA, LIMIT_MS } from "./zaslona.js";

// A fake <html>: a class set and a recorder of custom properties.
function fakeRoot(classes = [KLASA]) {
  const set = new Set(classes);
  const props = [];
  return {
    classList: {
      add: (c) => set.add(c),
      remove: (c) => set.delete(c),
      contains: (c) => set.has(c),
    },
    style: { setProperty: (name, value) => props.push([name, value]) },
    set,
    props,
  };
}

// Fake timers: the test fires the stored callback by hand; cancelled ids are recorded.
function fakeTimers() {
  const t = { scheduled: [], cancelled: [] };
  t.czas = (fn, ms) => {
    t.scheduled.push({ fn, ms, id: t.scheduled.length + 1 });
    return t.scheduled.length;
  };
  t.anuluj = (id) => t.cancelled.push(id);
  return t;
}

const utworz = (root, timers, extra = {}) => utworzZaslone(root, { czas: timers.czas, anuluj: timers.anuluj, ...extra });

describe("loading card: constants", () => {
  test("three steps, the class the head script sets, a 4 s limit", () => {
    assert.equal(KROKI, 3);
    assert.equal(KLASA, "ladowanie");
    assert.equal(LIMIT_MS, 4000);
  });
});

describe("loading card: ready path", () => {
  test("starts loading when the class is present and arms one limit timer", () => {
    const root = fakeRoot();
    const timers = fakeTimers();
    const zaslona = utworz(root, timers);
    assert.equal(zaslona.stan, "laduje");
    assert.equal(timers.scheduled.length, 1);
    assert.equal(timers.scheduled[0].ms, LIMIT_MS);
    assert.ok(root.set.has(KLASA), "the class stays while loading");
  });

  test("the limit given in the options goes to the timer", () => {
    const timers = fakeTimers();
    utworz(fakeRoot(), timers, { limitMs: 1234 });
    assert.equal(timers.scheduled[0].ms, 1234);
  });

  test("krok(1..3) sets --krok and keeps the card up", () => {
    const root = fakeRoot();
    const zaslona = utworz(root, fakeTimers());
    for (const n of [1, 2, 3]) {
      assert.equal(zaslona.krok(n), n);
      assert.deepEqual(root.props.at(-1), ["--krok", String(n)]);
    }
    assert.equal(zaslona.stan, "laduje");
    assert.ok(root.set.has(KLASA));
  });

  test("gotowe() removes the class, ends in gotowe and cancels the limit timer", () => {
    const root = fakeRoot();
    const timers = fakeTimers();
    const zaslona = utworz(root, timers);
    assert.equal(zaslona.gotowe(), "gotowe");
    assert.equal(zaslona.stan, "gotowe");
    assert.ok(!root.set.has(KLASA));
    assert.deepEqual(timers.cancelled, [timers.scheduled[0].id]);
    assert.deepEqual(root.props.at(-1), ["--krok", String(KROKI)], "the underline is drawn full on the way out");
  });

  test("a limit callback that fires after gotowe() changes nothing", () => {
    const root = fakeRoot();
    const timers = fakeTimers();
    const zaslona = utworz(root, timers);
    zaslona.gotowe();
    root.set.add(KLASA); // would be visible if the late callback removed it again
    timers.scheduled[0].fn();
    assert.equal(zaslona.stan, "gotowe");
    assert.ok(root.set.has(KLASA), "the late callback must not touch the class");
  });
});

describe("loading card: error path", () => {
  test("blad() removes the class at once and ends in blad", () => {
    const root = fakeRoot();
    const timers = fakeTimers();
    const zaslona = utworz(root, timers);
    assert.equal(zaslona.blad(), "blad");
    assert.equal(zaslona.stan, "blad");
    assert.ok(!root.set.has(KLASA));
    assert.deepEqual(timers.cancelled, [timers.scheduled[0].id]);
  });

  test("after blad() a later gotowe() does not rewrite the state", () => {
    const zaslona = utworz(fakeRoot(), fakeTimers());
    zaslona.blad();
    assert.equal(zaslona.gotowe(), "blad");
    assert.equal(zaslona.stan, "blad");
  });
});

describe("loading card: limit path", () => {
  test("firing the stored timer removes the class and ends in limit", () => {
    const root = fakeRoot();
    const timers = fakeTimers();
    const zaslona = utworz(root, timers);
    timers.scheduled[0].fn();
    assert.equal(zaslona.stan, "limit");
    assert.ok(!root.set.has(KLASA));
  });

  test("after the limit a late blad() or gotowe() keeps the state", () => {
    const timers = fakeTimers();
    const zaslona = utworz(fakeRoot(), timers);
    timers.scheduled[0].fn();
    assert.equal(zaslona.blad(), "limit");
    assert.equal(zaslona.gotowe(), "limit");
  });
});

describe("loading card: already taken off", () => {
  test("without the class the state is zdjeta and no timer is set", () => {
    const root = fakeRoot([]);
    const timers = fakeTimers();
    const zaslona = utworz(root, timers);
    assert.equal(zaslona.stan, "zdjeta");
    assert.equal(timers.scheduled.length, 0);
  });

  test("gotowe() and blad() on a taken-off card change nothing and cancel nothing", () => {
    const root = fakeRoot([]);
    const timers = fakeTimers();
    const zaslona = utworz(root, timers);
    assert.equal(zaslona.gotowe(), "zdjeta");
    assert.equal(zaslona.blad(), "zdjeta");
    assert.equal(zaslona.stan, "zdjeta");
    assert.deepEqual(timers.cancelled, []);
    assert.equal(root.set.size, 0);
  });
});

describe("loading card: krok", () => {
  test("clamps to 0..KROKI", () => {
    const zaslona = utworz(fakeRoot(), fakeTimers());
    assert.equal(zaslona.krok(-4), 0);
    assert.equal(zaslona.krok(99), KROKI);
  });

  test("never goes backwards", () => {
    const root = fakeRoot();
    const zaslona = utworz(root, fakeTimers());
    zaslona.krok(2);
    assert.equal(zaslona.krok(1), 2);
    assert.equal(zaslona.krok(0), 2);
    assert.deepEqual(root.props.at(-1), ["--krok", "2"]);
  });

  test("truncates a fractional step", () => {
    const zaslona = utworz(fakeRoot(), fakeTimers());
    assert.equal(zaslona.krok(1.9), 1);
  });
});
