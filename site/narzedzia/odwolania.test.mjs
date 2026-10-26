// Every local file a built page points at exists in site/ (ZGLOSZENIA E1): a missing icon or asset
// turns this red before the Pages workflow publishes, instead of a 404 on the live site.
// Second check: every command in the facts has its icon in site/grafika/ikony/.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, "..");
const POMIJANE_KATALOGI = new Set(["narzedzia", "vendor", "node_modules"]);
const ZEWNETRZNE = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;
const STRONY_FILMU_I_BIURKA = ["index.html", "pl/index.html", "biurko/index.html", "pl/biurko/index.html"];

/** Built pages: every index.html under site/, outside tools, vendored code and dependencies. */
export function znajdzStrony(katalog = SITE, baza = katalog) {
  const wynik = [];
  for (const nazwa of readdirSync(katalog)) {
    const sciezka = join(katalog, nazwa);
    if (statSync(sciezka).isDirectory()) {
      if (!POMIJANE_KATALOGI.has(nazwa)) wynik.push(...znajdzStrony(sciezka, baza));
    } else if (nazwa === "index.html") {
      wynik.push(relative(baza, sciezka).split("\\").join("/"));
    }
  }
  return wynik.sort();
}

/** Local references of a page: src, href, poster, srcset and url() in styles; external ones skipped. */
export function zbierzOdwolania(html) {
  // Inline script bodies hold template strings, not references; the src of a script tag stays.
  const bezSkryptow = html.replace(/(<script\b[^>]*>)[\s\S]*?(<\/script>)/gi, "$1$2");
  const surowe = [];
  for (const m of bezSkryptow.matchAll(/\s(?:src|href|poster)\s*=\s*"([^"]*)"/gi)) surowe.push(m[1]);
  for (const m of bezSkryptow.matchAll(/\ssrcset\s*=\s*"([^"]*)"/gi)) {
    for (const kandydat of m[1].split(",")) surowe.push(kandydat.trim().split(/\s+/)[0]);
  }
  for (const m of bezSkryptow.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)) surowe.push(m[2]);
  const lokalne = surowe
    .map((r) => r.replace(/&amp;/g, "&").trim())
    .filter((r) => r !== "" && !ZEWNETRZNE.test(r))
    .map((r) => r.replace(/[?#].*$/, ""))
    .filter((r) => r !== "");
  return [...new Set(lokalne)];
}

/** References of a page (path relative to site/) whose file does not exist; a directory needs index.html. */
export function brakujace(stronaRel, html, site = SITE) {
  const katalogStrony = dirname(join(site, stronaRel));
  return zbierzOdwolania(html).filter((ref) => {
    const cel = resolve(katalogStrony, decodeURI(ref));
    if (!existsSync(cel)) return true;
    return statSync(cel).isDirectory() && !existsSync(join(cel, "index.html"));
  });
}

/** Icon file name of a command: the name without the relai- prefix (as zbuduj.mjs computes it). */
export const plikIkony = (nazwa) => `${String(nazwa).replace(/^relai-/, "")}.svg`;

const read = (rel) => readFileSync(join(SITE, rel), "utf8");
const strony = znajdzStrony();

describe("built pages: every local reference points at an existing file", () => {
  test("the page list covers the film, the desk and the video pages", () => {
    for (const s of [...STRONY_FILMU_I_BIURKA, "wideo/index.html", "pl/wideo/index.html"]) {
      assert.ok(strony.includes(s), `page ${s} not found under site/`);
    }
  });

  for (const strona of strony) {
    test(`${strona}: no missing local file`, () => {
      const braki = brakujace(strona, read(strona));
      assert.deepEqual(braki, [], `${strona} points at missing files: ${braki.join(", ")}`);
    });
  }

  test("positive control: each film and desk page yields references, a planted one is reported missing", () => {
    for (const strona of STRONY_FILMU_I_BIURKA) {
      const html = read(strona);
      assert.ok(zbierzOdwolania(html).length > 0, `${strona}: the collector found no references`);
      const podlozona = html.replace("</body>", '<img src="grafika/ikony/nie-ma-takiej.svg"></body>');
      assert.notEqual(podlozona, html, `${strona}: the control must change the page`);
      assert.ok(brakujace(strona, podlozona).includes("grafika/ikony/nie-ma-takiej.svg"), `${strona}: planted gap not reported`);
    }
  });

  test("collector: srcset, url(), query and fragment handled; external and inline-script text skipped", () => {
    const html = [
      '<img src="a.svg?v=1#x" srcset="b.jpg 1x, c.jpg 2x">',
      '<div style="background:url(\'d.png\')"></div>',
      '<a href="https://x.org/e.svg"></a><a href="#kotwica"></a><a href="mailto:a@b.c"></a>',
      '<img src="data:image/png;base64,AAA="><a href="javascript:void(0)"></a>',
      '<script src="f.js"></script><script>const t = `<img src="g.svg">`;</script>',
    ].join("");
    assert.deepEqual(zbierzOdwolania(html).sort(), ["a.svg", "b.jpg", "c.jpg", "d.png", "f.js"]);
  });
});

describe("command icons: every command in the facts has its icon", () => {
  const fakty = JSON.parse(read("dane/fakty.json"));

  test("the facts list commands", () => assert.ok(Array.isArray(fakty.komendy) && fakty.komendy.length > 0));

  for (const k of fakty.komendy ?? []) {
    test(`${k.nazwa}: grafika/ikony/${plikIkony(k.nazwa)} exists`, () => {
      assert.ok(existsSync(join(SITE, "grafika", "ikony", plikIkony(k.nazwa))), `missing icon for ${k.nazwa}`);
    });
  }
});
