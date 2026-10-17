import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { zamontujSzuflady, nastepnaZakladka, OPOZNIENIE_MS } from "./szuflady.js";

// A minimal stand-in for the DOM: elements are EventTargets that know which selectors they match.
class El extends EventTarget {
  constructor({ pasuje = [], dataset = {}, rodzic = null, dzieci = [] } = {}) {
    super();
    this.pasuje = pasuje;
    this.dataset = dataset;
    this.parent = rodzic;
    this.dzieci = dzieci;
    this.atrybuty = new Map([["hidden", ""]]);
    this.skupiony = 0;
  }
  closest(sel) {
    const lista = sel.split(",").map((s) => s.trim());
    for (let e = this; e; e = e.parent) if (lista.some((s) => e.pasuje.includes(s))) return e;
    return null;
  }
  querySelector(sel) { return this.dzieci.find((d) => d.pasuje.includes(sel)) ?? null; }
  querySelectorAll(sel) { return this.dzieci.filter((d) => d.pasuje.includes(sel)); }
  removeAttribute(n) { this.atrybuty.delete(n); }
  setAttribute(n, v) { this.atrybuty.set(n, String(v)); }
  getAttribute(n) { return this.atrybuty.get(n) ?? null; }
  focus() { this.skupiony++; }
}

class Dialog extends El {
  constructor(nazwa) {
    const zamknij = new El({ pasuje: ["[data-zamknij]"] });
    super({ pasuje: ["dialog", "dialog[data-szuflada]"], dataset: { szuflada: nazwa }, dzieci: [zamknij] });
    this.zamknij = zamknij;
    this.open = false;
    this.pokazan = 0;
  }
  showModal() { this.open = true; this.pokazan++; }
  close() { this.open = false; this.dispatchEvent(new Event("close")); }
}

function srodowisko({ ograniczRuch = false, trafienie = null } = {}) {
  const dialogi = ["dokumenty", "teczka", "laptop", "pudelko"].map((n) => new Dialog(n));
  const klasy = new Set();
  const dokument = new El({ dzieci: dialogi });
  dokument.documentElement = { classList: { add: (k) => klasy.add(k), remove: (k) => klasy.delete(k), toggle: (k, w) => (w ? klasy.add(k) : klasy.delete(k)) } };
  dokument.activeElement = null;
  const zegar = [];
  const okno = {
    scrollY: 1200,
    przewiniecia: [],
    setTimeout: (f, ms) => { zegar.push({ f, ms }); return zegar.length; },
    clearTimeout: (id) => { if (zegar[id - 1]) zegar[id - 1].f = null; },
    scrollTo({ top }) { this.przewiniecia.push(top); this.scrollY = top; },
    requestAnimationFrame: (f) => f(),
  };
  const uniesienia = [];
  const scena = { unies: (n) => uniesienia.push(n), trafienie: () => trafienie };
  const api = zamontujSzuflady({ dokument, okno, scena, ograniczRuch });
  const uplyw = () => { for (const t of zegar.splice(0)) t.f?.(); };
  const klik = (cel, x = 10, y = 20) => {
    const e = new Event("click", { bubbles: true, cancelable: true });
    Object.assign(e, { clientX: x, clientY: y });
    Object.defineProperty(e, "target", { value: cel });
    dokument.dispatchEvent(e);
    return e;
  };
  return { dialogi, dokument, okno, uniesienia, klasy, api, uplyw, zegar, klik };
}

const link = (nazwa) => new El({ pasuje: ["a", "a[data-szuflada-cel]"], dataset: { szufladaCel: nazwa } });

describe("drawers", () => {
  test("a map link opens its drawer: the object rises first, the dialog shows after the delay", () => {
    const s = srodowisko();
    const a = link("teczka");
    const e = s.klik(a);
    assert.equal(e.defaultPrevented, true);
    assert.deepEqual(s.uniesienia, ["teczka"]);
    assert.equal(s.dialogi[1].open, false);
    assert.equal(s.zegar[0].ms, OPOZNIENIE_MS);
    s.uplyw();
    assert.equal(s.dialogi[1].open, true);
    assert.ok(s.klasy.has("szuflada-otwarta"));
    assert.equal(s.api.otwarta(), "teczka");
  });

  test("close buttons are unhidden once the drawers are mounted", () => {
    const s = srodowisko();
    for (const d of s.dialogi) assert.equal(d.zamknij.getAttribute("hidden"), null);
  });

  test("with reduced motion the dialog opens at once, without a timer", () => {
    const s = srodowisko({ ograniczRuch: true });
    s.klik(link("laptop"));
    assert.equal(s.zegar.length, 0);
    assert.equal(s.dialogi[2].open, true);
  });

  test("closing gives focus back to the opener, restores the scroll and lowers the object", () => {
    const s = srodowisko({ ograniczRuch: true });
    const a = link("pudelko");
    s.klik(a);
    s.okno.scrollY = 1500; // something moved the page while the dialog was open
    s.dialogi[3].close();
    assert.equal(a.skupiony, 1);
    assert.deepEqual(s.okno.przewiniecia, [1200]);
    assert.deepEqual(s.uniesienia, ["pudelko", null]);
    assert.equal(s.klasy.has("szuflada-otwarta"), false);
    assert.equal(s.api.otwarta(), null);
  });

  test("an unchanged scroll is not touched on close", () => {
    const s = srodowisko({ ograniczRuch: true });
    s.klik(link("pudelko"));
    s.dialogi[3].close();
    assert.deepEqual(s.okno.przewiniecia, []);
  });

  test("a click on a scene object opens its drawer; focus returns to what was focused before", () => {
    const s = srodowisko({ ograniczRuch: true, trafienie: "dokumenty" });
    const przedtem = new El();
    s.dokument.activeElement = przedtem;
    s.klik(new El({ pasuje: ["canvas"] }));
    assert.equal(s.dialogi[0].open, true);
    s.dialogi[0].close();
    assert.equal(przedtem.skupiony, 1);
  });

  test("a click on a card, a link or the laptop display never reaches the scene", () => {
    for (const sel of [".karta", "a", "button", "[data-ekran]"]) {
      const s = srodowisko({ ograniczRuch: true, trafienie: "laptop" });
      s.klik(new El({ pasuje: [sel] }));
      assert.equal(s.api.otwarta(), null, sel);
    }
  });

  test("a click that misses every object opens nothing", () => {
    const s = srodowisko({ ograniczRuch: true, trafienie: null });
    s.klik(new El({ pasuje: ["canvas"] }));
    assert.equal(s.api.otwarta(), null);
    assert.deepEqual(s.uniesienia, []);
  });

  test("Escape before the dialog shows cancels the opening", () => {
    const s = srodowisko();
    s.klik(link("teczka"));
    const e = new Event("keydown");
    e.key = "Escape";
    s.dokument.dispatchEvent(e);
    s.uplyw();
    assert.equal(s.dialogi[1].open, false);
    assert.deepEqual(s.uniesienia, ["teczka", null]);
    assert.equal(s.api.otwarta(), null);
  });

  test("a click on the backdrop (the dialog itself) closes it", () => {
    const s = srodowisko({ ograniczRuch: true });
    s.klik(link("laptop"));
    const e = new Event("click");
    Object.defineProperty(e, "target", { value: s.dialogi[2] });
    s.dialogi[2].dispatchEvent(e);
    assert.equal(s.dialogi[2].open, false);
  });

  test("POSITIVE CONTROL: an unknown drawer name opens nothing", () => {
    const s = srodowisko({ ograniczRuch: true });
    assert.equal(s.api.otworz("szafa"), false);
    assert.deepEqual(s.uniesienia, []);
  });
});

describe("laptop tabs", () => {
  test("arrows move and wrap, Home and End jump, other keys stay", () => {
    assert.equal(nastepnaZakladka(0, 3, "ArrowRight"), 1);
    assert.equal(nastepnaZakladka(2, 3, "ArrowRight"), 0);
    assert.equal(nastepnaZakladka(0, 3, "ArrowLeft"), 2);
    assert.equal(nastepnaZakladka(1, 3, "Home"), 0);
    assert.equal(nastepnaZakladka(1, 3, "End"), 2);
    assert.equal(nastepnaZakladka(1, 3, "a"), null);
  });
});
