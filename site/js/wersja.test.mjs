import { test } from "node:test";
import assert from "node:assert/strict";
import { PREFIKSY, URL_API, porownaj, najnowsza, sprawdz, wstaw } from "./wersja.js";

const WPIECZONE = { relai: "3.2.0", panel: "0.20.0" };

const release = (tag_name, extra = {}) => ({ tag_name, draft: false, prerelease: false, ...extra });

const FIXTURE = [
  release("v3.2.0"),
  release("v3.10.0"),
  release("relai-panel-v0.20.0"),
  release("relai-panel-v0.9.0"),
  release("v9.9.9", { draft: true }),
  release("v4.0.0-rc.1", { prerelease: true }),
  release("vx"),
  release("relai-panel-v0.21.0-beta"),
];

const odpowiedz = (body, ok = true) => ({ ok, status: ok ? 200 : 403, json: async () => body });

function fakeStorage(start = {}) {
  const dane = new Map(Object.entries(start));
  return {
    getItem: (k) => (dane.has(k) ? dane.get(k) : null),
    setItem: (k, v) => dane.set(k, v),
    dane,
  };
}

test("porownaj orders versions numerically, not lexically", () => {
  assert.equal(porownaj("3.10.0", "3.2.0"), 1);
  assert.equal(porownaj("0.9.0", "0.20.0"), -1);
  assert.equal(porownaj("1.2.3", "1.2.3"), 0);
  assert.equal(porownaj("2.0.0", "1.99.99"), 1);
});

test("porownaj throws TypeError on input that is not x.y.z", () => {
  assert.throws(() => porownaj("1.2", "1.2.3"), TypeError);
  assert.throws(() => porownaj("1.2.3", "v1.2.3"), TypeError);
  assert.throws(() => porownaj("1.2.3-rc.1", "1.2.3"), TypeError);
  assert.throws(() => porownaj(undefined, "1.2.3"), TypeError);
});

test("najnowsza picks the highest stable release for each prefix", () => {
  assert.equal(najnowsza(FIXTURE, PREFIKSY.relai), "3.10.0");
  assert.equal(najnowsza(FIXTURE, PREFIKSY.panel), "0.20.0");
});

test("najnowsza keeps the v prefix from matching panel tags and vice versa", () => {
  const tylkoPanel = [release("relai-panel-v0.20.0")];
  const tylkoRdzen = [release("v3.2.0")];

  assert.equal(najnowsza(tylkoPanel, "v"), null);
  assert.equal(najnowsza(tylkoRdzen, "relai-panel-v"), null);
});

test("najnowsza returns null for empty, non-array or unmatched input", () => {
  assert.equal(najnowsza([], "v"), null);
  assert.equal(najnowsza(null, "v"), null);
  assert.equal(najnowsza([release("v1.2.3.4"), release("v1.2")], "v"), null);
});

test("sprawdz returns and stores the newer release found on GitHub", async () => {
  const storage = fakeStorage();
  const fetchFn = async () => odpowiedz(FIXTURE);

  const wynik = await sprawdz({ wpieczone: WPIECZONE, fetchFn, storage });

  assert.deepEqual({ ...wynik }, { relai: "3.10.0", panel: "0.20.0" });
  assert.ok(Object.isFrozen(wynik));
  assert.deepEqual(JSON.parse(storage.dane.get("relai-wersje")), { relai: "3.10.0", panel: "0.20.0" });
});

test("sprawdz sends the API URL and the GitHub Accept header", async () => {
  let url;
  let init;
  const fetchFn = async (u, i) => { url = u; init = i; return odpowiedz([]); };

  await sprawdz({ wpieczone: WPIECZONE, fetchFn, storage: fakeStorage() });

  assert.equal(url, URL_API);
  assert.equal(init.headers.Accept, "application/vnd.github+json");
  assert.ok(init.signal);
});

test("sprawdz keeps the baked versions when GitHub only has older ones", async () => {
  const stare = [release("v3.0.0"), release("relai-panel-v0.1.0")];

  const wynik = await sprawdz({ wpieczone: WPIECZONE, fetchFn: async () => odpowiedz(stare), storage: fakeStorage() });

  assert.deepEqual({ ...wynik }, WPIECZONE);
});

test("sprawdz keeps the baked versions on HTTP 403", async () => {
  const storage = fakeStorage();

  const wynik = await sprawdz({ wpieczone: WPIECZONE, fetchFn: async () => odpowiedz({}, false), storage });

  assert.deepEqual({ ...wynik }, WPIECZONE);
  assert.ok(Object.isFrozen(wynik));
  assert.equal(storage.dane.size, 0);
});

test("sprawdz keeps the baked versions on a network error", async () => {
  const fetchFn = async () => { throw new TypeError("network down"); };

  const wynik = await sprawdz({ wpieczone: WPIECZONE, fetchFn, storage: fakeStorage() });

  assert.deepEqual({ ...wynik }, WPIECZONE);
});

test("sprawdz gives up on a fetch that never resolves after timeoutMs", async () => {
  const fetchFn = () => new Promise(() => {});
  const start = Date.now();

  const wynik = await sprawdz({ wpieczone: WPIECZONE, fetchFn, storage: fakeStorage(), timeoutMs: 50 });

  assert.deepEqual({ ...wynik }, WPIECZONE);
  assert.ok(Date.now() - start < 2000);
});

test("sprawdz keeps the baked versions on invalid JSON and on a non-array body", async () => {
  const zepsuty = async () => ({ ok: true, json: async () => { throw new SyntaxError("bad json"); } });
  const obiekt = async () => odpowiedz({ message: "not an array" });

  const a = await sprawdz({ wpieczone: WPIECZONE, fetchFn: zepsuty, storage: fakeStorage() });
  const b = await sprawdz({ wpieczone: WPIECZONE, fetchFn: obiekt, storage: fakeStorage() });

  assert.deepEqual({ ...a }, WPIECZONE);
  assert.deepEqual({ ...b }, WPIECZONE);
});

test("sprawdz uses the cache and does not fetch on a cache hit", async () => {
  const storage = fakeStorage({ "relai-wersje": JSON.stringify({ relai: "3.5.0", panel: "0.22.0" }) });
  let wywolania = 0;
  const fetchFn = async () => { wywolania += 1; return odpowiedz(FIXTURE); };

  const wynik = await sprawdz({ wpieczone: WPIECZONE, fetchFn, storage });

  assert.equal(wywolania, 0);
  assert.deepEqual({ ...wynik }, { relai: "3.5.0", panel: "0.22.0" });
});

test("sprawdz ignores a corrupt cache entry and fetches instead", async () => {
  const storage = fakeStorage({ "relai-wersje": "{not json" });
  let wywolania = 0;
  const fetchFn = async () => { wywolania += 1; return odpowiedz(FIXTURE); };

  const wynik = await sprawdz({ wpieczone: WPIECZONE, fetchFn, storage });

  assert.equal(wywolania, 1);
  assert.equal(wynik.relai, "3.10.0");
});

test("wstaw sets textContent on data-wersja elements and never touches innerHTML", () => {
  const zapisy = [];
  const element = (klucz) => ({
    getAttribute: (n) => (n === "data-wersja" ? klucz : null),
    set textContent(v) { zapisy.push([klucz, v]); },
    set innerHTML(_) { throw new Error("innerHTML must not be used"); },
  });
  const root = { querySelectorAll: () => [element("relai"), element("panel"), element("inne")] };

  wstaw(root, { relai: "3.10.0", panel: "0.20.0" });

  assert.deepEqual(zapisy, [["relai", "3.10.0"], ["panel", "0.20.0"]]);
});
