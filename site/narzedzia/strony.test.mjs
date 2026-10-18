// The four built pages as they will be published (read from disk, the files the Pages workflow uploads):
// baked versions equal .claude-plugin/marketplace.json, and the footer carries the other version,
// the survey and issues (E8).
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const STRONY = {
  "site/index.html": { jezyk: "en", druga: "./biurko/", wersja: "film" },
  "site/pl/index.html": { jezyk: "pl", druga: "../pl/biurko/", wersja: "film" },
  "site/biurko/index.html": { jezyk: "en", druga: "../", wersja: "biurko" },
  "site/pl/biurko/index.html": { jezyk: "pl", druga: "../../pl/", wersja: "biurko" },
};
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
const tresc = { en: JSON.parse(read("site/tresc/en.json")), pl: JSON.parse(read("site/tresc/pl.json")) };

/** Versions of relai and relai-panel from the marketplace manifest. */
export function wersjeRynku(marketplace) {
  const wersja = (nazwa) => marketplace.plugins.find((p) => p.name === nazwa)?.version;
  return { relai: wersja("relai"), panel: wersja("relai-panel") };
}

/** Every place a page bakes a version in: the html attributes and the visible spans. */
export function wersjeStrony(html) {
  const atrybut = (n) => html.match(new RegExp(`<html[^>]* data-wersja-${n}="([^"]+)"`))?.[1];
  const spany = (n) => [...html.matchAll(new RegExp(`data-wersja="${n}">([^<]+)<`, "g"))].map((m) => m[1]);
  return { relai: [atrybut("relai"), ...spany("relai")], panel: [atrybut("panel"), ...spany("panel")] };
}

/** Throws when a page bakes a version other than the marketplace's (or none at all). */
export function sprawdzWersje(html, rynek, etykieta) {
  const strona = wersjeStrony(html);
  for (const klucz of ["relai", "panel"]) {
    assert.ok(strona[klucz].length >= 2, `${etykieta}: ${klucz} version baked in fewer than two places`);
    for (const w of strona[klucz]) assert.equal(w, rynek[klucz], `${etykieta}: ${klucz} ${w} vs marketplace ${rynek[klucz]}`);
  }
}

const rynek = wersjeRynku(JSON.parse(read(".claude-plugin/marketplace.json")));

describe("published pages: baked versions equal the marketplace", () => {
  test("marketplace lists both versions", () => {
    assert.match(rynek.relai ?? "", /^\d+\.\d+\.\d+$/);
    assert.match(rynek.panel ?? "", /^\d+\.\d+\.\d+$/);
  });

  for (const rel of Object.keys(STRONY)) {
    test(`${rel}: relai and panel versions equal marketplace.json`, () => sprawdzWersje(read(rel), rynek, rel));
  }

  test("positive control: a page with a swapped baked version fails the check", () => {
    const html = read("site/index.html");
    const podmieniona = html.replace(`data-wersja="relai">${rynek.relai}<`, `data-wersja="relai">0.0.1<`);
    assert.notEqual(podmieniona, html, "the control must actually change the page");
    assert.throws(() => sprawdzWersje(podmieniona, rynek, "control"), /relai 0\.0\.1 vs marketplace/);
    const bezWersji = html.replace(/data-wersja(-relai)?="?relai"?[^>]*>/g, "");
    assert.throws(() => sprawdzWersje(bezWersji, rynek, "control"));
  });
});

describe("published pages: footer with the other version, the survey and issues", () => {
  const stopka = (html) => html.match(/<footer class="stopka[^"]*">([\s\S]*?)<\/footer>/)?.[1] ?? "";
  // href of the one link carrying the marker attribute, whatever the attribute order
  const hrefLinku = (html, znacznik) => {
    const linki = [...html.matchAll(new RegExp(`<a\\b[^>]*\\b${znacznik}\\b[^>]*>`, "g"))];
    assert.equal(linki.length, 1, `exactly one link with ${znacznik}`);
    return linki[0][0].match(/href="([^"]+)"/)?.[1];
  };

  for (const [rel, s] of Object.entries(STRONY)) {
    test(`${rel}: links to the other version, the survey with its origin, and issues`, () => {
      const f = stopka(read(rel));
      assert.equal(hrefLinku(f, "data-druga-wersja"), s.druga);
      const ankieta = f.match(/<a\b[^>]*\bdata-ankieta\b[^>]*>/)?.[0] ?? "";
      assert.match(ankieta, /target="_blank"/);
      assert.match(ankieta, /rel="noopener"/);
      assert.equal(hrefLinku(f, "data-ankieta"), `${tresc[s.jezyk].publikacja.ankietaAdres}?wersja=${s.wersja}&amp;jezyk=${s.jezyk}`);
      assert.match(f, /<a\b[^>]*href="https:\/\/github\.com\/nowilus\/relai\/issues"/);
    });
  }

  test("every target=_blank link on the pages has rel=noopener", () => {
    for (const rel of Object.keys(STRONY)) {
      for (const m of read(rel).matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert.match(m[0], /rel="[^"]*noopener/, rel);
    }
  });

  test("the survey address is a real Tally form, not a placeholder", () => {
    for (const j of ["en", "pl"]) assert.match(tresc[j].publikacja.ankietaAdres, /^https:\/\/tally\.so\/r\/[A-Za-z0-9]+$/, j);
  });
});
