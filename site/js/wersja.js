// Version check: page ships baked versions; the browser only looks for a NEWER release and otherwise keeps them.

export const PREFIKSY = Object.freeze({ relai: "v", panel: "relai-panel-v" });
export const URL_API = "https://api.github.com/repos/nowilus/relai/releases?per_page=30";

const KLUCZ_CACHE = "relai-wersje";
const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;

function rozbij(wersja) {
  const m = SEMVER.exec(String(wersja));
  if (!m) throw new TypeError(`not a x.y.z version: ${String(wersja)}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/** Numeric semver compare: -1, 0 or 1. */
export function porownaj(a, b) {
  const x = rozbij(a);
  const y = rozbij(b);
  for (let i = 0; i < 3; i++) {
    if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
  }
  return 0;
}

/** Highest stable version for a tag prefix, or null. Ignores drafts, prereleases and the "latest" flag. */
export function najnowsza(releases, prefiks) {
  if (!Array.isArray(releases)) return null;
  let najlepsza = null;
  for (const r of releases) {
    if (!r || r.draft === true || r.prerelease === true || typeof r.tag_name !== "string") continue;
    if (!r.tag_name.startsWith(prefiks)) continue;
    const wersja = r.tag_name.slice(prefiks.length);
    if (!SEMVER.test(wersja)) continue;
    if (najlepsza === null || porownaj(wersja, najlepsza) > 0) najlepsza = wersja;
  }
  return najlepsza;
}

function poprawneWersje(w) {
  return Boolean(w) && typeof w === "object"
    && SEMVER.test(String(w.relai)) && SEMVER.test(String(w.panel))
    && typeof w.relai === "string" && typeof w.panel === "string";
}

function czytajCache(storage) {
  try {
    const surowe = storage?.getItem(KLUCZ_CACHE);
    if (!surowe) return null;
    const w = JSON.parse(surowe);
    return poprawneWersje(w) ? { relai: w.relai, panel: w.panel } : null;
  } catch {
    return null;
  }
}

function nowszaZ(wpieczona, inna) {
  return inna && porownaj(inna, wpieczona) > 0 ? inna : wpieczona;
}

function polacz(wpieczone, zrodlo) {
  return Object.freeze({
    relai: nowszaZ(wpieczone.relai, zrodlo.relai),
    panel: nowszaZ(wpieczone.panel, zrodlo.panel),
  });
}

async function pobierzRelease(fetchFn, timeoutMs) {
  const kontroler = new AbortController();
  let timer = null;
  const limit = new Promise((_, odrzuc) => {
    timer = setTimeout(() => {
      kontroler.abort();
      odrzuc(new Error("timeout"));
    }, timeoutMs);
  });
  const zapytanie = (async () => {
    const odp = await fetchFn(URL_API, {
      headers: { Accept: "application/vnd.github+json" },
      signal: kontroler.signal,
    });
    if (!odp || !odp.ok) throw new Error("bad status");
    return odp.json();
  })();
  zapytanie.catch(() => {});
  try {
    return await Promise.race([zapytanie, limit]);
  } finally {
    clearTimeout(timer);
  }
}

/** Returns the frozen {relai, panel} versions to show; never throws. */
export async function sprawdz({ wpieczone, fetchFn, storage, timeoutMs = 4000 }) {
  const zCache = czytajCache(storage);
  if (zCache) {
    try {
      return polacz(wpieczone, zCache);
    } catch {
      return Object.freeze({ ...wpieczone });
    }
  }
  try {
    const releases = await pobierzRelease(fetchFn, timeoutMs);
    if (!Array.isArray(releases)) return Object.freeze({ ...wpieczone });
    const wynik = polacz(wpieczone, {
      relai: najnowsza(releases, PREFIKSY.relai),
      panel: najnowsza(releases, PREFIKSY.panel),
    });
    try {
      storage?.setItem(KLUCZ_CACHE, JSON.stringify(wynik));
    } catch {
      // storage may be full or blocked; the result is still valid
    }
    return wynik;
  } catch {
    return Object.freeze({ ...wpieczone });
  }
}

/** Writes versions into [data-wersja="relai|panel"] elements. Nothing else. */
export function wstaw(root, wersje) {
  for (const el of root.querySelectorAll("[data-wersja]")) {
    const klucz = el.getAttribute("data-wersja");
    if (klucz !== "relai" && klucz !== "panel") continue;
    if (typeof wersje[klucz] === "string") el.textContent = wersje[klucz];
  }
}

/** Browser entry point; silent on any failure. */
export async function zamontujWersje(doc = document) {
  try {
    const { wersjaRelai, wersjaPanel } = doc.documentElement.dataset;
    if (!wersjaRelai || !wersjaPanel) return;
    const wersje = await sprawdz({
      wpieczone: { relai: wersjaRelai, panel: wersjaPanel },
      fetchFn: (...args) => fetch(...args),
      storage: sessionStorage,
    });
    wstaw(doc, wersje);
  } catch {
    // keep the baked versions
  }
}
