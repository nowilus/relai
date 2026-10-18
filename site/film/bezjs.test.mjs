import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const read = (...p) => readFileSync(join(HERE, ...p), "utf8");
const PAGES = { pl: read("..", "pl", "index.html"), en: read("..", "index.html") };
const CONTENT = { pl: JSON.parse(read("..", "tresc", "pl.json")), en: JSON.parse(read("..", "tresc", "en.json")) };
const CSS = read("..", "css", "film.css");
const FACTS = JSON.parse(read("..", "dane", "fakty.json"));

// What a reader without JavaScript must get from the HTML alone: the heading, the peak's sentences,
// every command card, the install command and the configurator. Returns what is missing.
function brakiBezJs(html, tresc) {
  const braki = [];
  if (!/<h1\b/.test(html)) braki.push("heading");
  const pamiec = html.match(/<section class="akt pamiec"[\s\S]*?<\/section>/)?.[0] ?? "";
  if (!pamiec.includes(tresc.przystanki[1].naglowek)) braki.push("peak heading");
  if ((pamiec.match(/\sdata-wpis[\s>]/g) ?? []).length !== 8) braki.push("peak entries");
  if ((html.match(/\sdata-fiszka[\s>]/g) ?? []).length !== FACTS.liczbaKomend) braki.push("command cards");
  if (!html.includes("claude plugin install relai --marketplace")) braki.push("install command");
  if (!/<form class="konfigurator" data-konfigurator\b/.test(html)) braki.push("configurator");
  return braki;
}

describe("the film without JavaScript", () => {
  test("both pages carry the whole story in their HTML", () => {
    for (const [jezyk, html] of Object.entries(PAGES)) assert.deepEqual(brakiBezJs(html, CONTENT[jezyk]), [], jezyk);
  });

  test("POSITIVE CONTROL: a page without one card or without the install command fails", () => {
    const bezFiszki = PAGES.pl.replace(/<li class="fiszka" data-fiszka>[\s\S]*?<\/li>/, "");
    assert.deepEqual(brakiBezJs(bezFiszki, CONTENT.pl), ["command cards"]);
    const bezKomendy = PAGES.pl.replaceAll("claude plugin install relai --marketplace", "claude plugin");
    assert.deepEqual(brakiBezJs(bezKomendy, CONTENT.pl), ["install command"]);
  });

  test("the loading card needs the page's own script to show at all", () => {
    assert.match(CSS, /html\.ladowanie \.zaslona|\.zaslona\b[^{]*\{[^}]*display: none/);
  });

  test("buttons that need JavaScript are hidden in the HTML and stay hidden by the CSS", () => {
    for (const html of Object.values(PAGES)) {
      for (const attr of ["data-kopiuj", "data-terminal", "data-aplikacja", "data-wyslij", "data-kopiuj-komendy"]) {
        assert.match(html, new RegExp(`${attr} hidden>`), attr);
      }
    }
    assert.match(CSS, /^\.konfigurator__akcje \[hidden\], \.instalacja__telefon \[hidden\] \{ display: none; \}/m);
  });

  test("without the engine the rail is a grid, so no card hides past the frame's edge", () => {
    assert.match(CSS, /html:not\(\.sc-ready\) \.akt\.komendy \.tasma__fiszki \{\s*display: grid;/);
  });
});

describe("the film under reduced motion", () => {
  test("every waiting state of a once-section needs the motion class, so without it a section stands final", () => {
    const czekaj = CSS.split("\n").filter((l) => /:not\(\.gra\)/.test(l));
    assert.ok(czekaj.length >= 5, `${czekaj.length} waiting states found`);
    for (const l of czekaj) assert.match(l, /^\s*html\.ruch /, l);
  });

  test("the rail drops its pinned travel and becomes a grid", () => {
    const blok = CSS.slice(CSS.lastIndexOf("@media (prefers-reduced-motion: reduce)"));
    assert.match(blok, /\.akt\.komendy \{ height: auto !important; \}/);
    assert.match(blok, /\.akt\.komendy \.tasma__fiszki \{\s*display: grid;/);
  });

  test("POSITIVE CONTROL: a waiting state without the motion class is caught", () => {
    const zly = ".plan:not(.gra) .arkusz { opacity: 0; }";
    assert.doesNotMatch(zly, /^\s*html\.ruch /);
  });
});
