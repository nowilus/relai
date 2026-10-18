import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, mkdtempSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render, escapeHtml, buildPages, buildPagesFrom, readInputs, writeIfChanged, zbudujFiszki, ADRES_PUBLICZNY } from "./zbuduj.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const FIX = join(HERE, "fixtury");

describe("render", () => {
  test("escapes all five characters", () => {
    assert.equal(render("{{x}}", { x: `&<>"'` }), "&amp;&lt;&gt;&quot;&#39;");
    assert.equal(escapeHtml(`&<>"'`), "&amp;&lt;&gt;&quot;&#39;");
  });

  test("converts numbers with String()", () => {
    assert.equal(render("{{n}}|{{z}}", { n: 4.5, z: 0 }), "4.5|0");
  });

  test("resolves dotted paths", () => {
    assert.equal(render("{{a.b.c}}", { a: { b: { c: "deep" } } }), "deep");
  });

  test("looks up parent contexts inside a section", () => {
    const out = render("{{#items}}{{.}}-{{prefix}};{{/items}}", { prefix: "P", items: ["a", "b"] });
    assert.equal(out, "a-P;b-P;");
  });

  test("renders an array of objects", () => {
    const out = render("{{#xs}}[{{n}}]{{/xs}}", { xs: [{ n: 1 }, { n: 2 }, { n: 3 }] });
    assert.equal(out, "[1][2][3]");
  });

  test("renders an array of primitives with {{.}} and escapes them", () => {
    assert.equal(render("{{#xs}}<{{.}}>{{/xs}}", { xs: ["a&b", "c"] }), "<a&amp;b><c>");
  });

  test("provides @index and @numer", () => {
    assert.equal(render("{{#xs}}{{@index}}/{{@numer}} {{/xs}}", { xs: ["a", "b"] }), "0/1 1/2 ");
  });

  test("@index of the outer array is visible inside an object section", () => {
    const out = render("{{#xs}}{{#o}}{{@numer}}{{k}}{{/o}}{{/xs}}", { xs: [{ o: { k: "x" } }, { o: { k: "y" } }] });
    assert.equal(out, "1x2y");
  });

  test("boolean sections", () => {
    const tpl = "{{#on}}yes{{/on}}{{#off}}no{{/off}}";
    assert.equal(render(tpl, { on: true, off: false }), "yes");
  });

  test("object section uses the object as context", () => {
    assert.equal(render("{{#o}}{{k}}{{/o}}", { o: { k: "v" } }), "v");
  });

  test("empty array renders nothing", () => {
    assert.equal(render("a{{#xs}}x{{/xs}}b", { xs: [] }), "ab");
  });

  test("inverted section renders for false and empty array only", () => {
    const tpl = "{{^v}}none{{/v}}";
    assert.equal(render(tpl, { v: false }), "none");
    assert.equal(render(tpl, { v: [] }), "none");
    assert.equal(render(tpl, { v: [1] }), "");
    assert.equal(render(tpl, { v: true }), "");
  });

  test("nested sections", () => {
    const data = { rows: [{ cells: ["a", "b"] }, { cells: ["c"] }] };
    assert.equal(render("{{#rows}}({{#cells}}{{.}}{{/cells}}){{/rows}}", data), "(ab)(c)");
  });

  test("comments are removed", () => {
    assert.equal(render("a{{! note }}b", {}), "ab");
  });

  test("standalone tag lines leave no blank lines", () => {
    const tpl = "start\n{{#xs}}\n  - {{.}}\n{{/xs}}\n{{! c }}\n{{^xs}}\nnone\n{{/xs}}\nend\n";
    assert.equal(render(tpl, { xs: ["a", "b"] }), "start\n  - a\n  - b\nend\n");
  });

  test("indented standalone tags are removed with their indentation", () => {
    assert.equal(render("<ul>\n  {{#xs}}\n  <li>{{.}}</li>\n  {{/xs}}\n</ul>", { xs: [1, 2] }), "<ul>\n  <li>1</li>\n  <li>2</li>\n</ul>");
  });

  test("inline section tags keep surrounding text", () => {
    assert.equal(render("a {{#on}}b{{/on}} c\n", { on: true }), "a b c\n");
  });

  test("missing key throws with key and line number", () => {
    assert.throws(() => render("ok\nok\n{{a.missing}}", { a: {} }), /a\.missing.*line 3/);
  });

  test("missing section key throws with key and line number", () => {
    assert.throws(() => render("\n{{#nope}}x{{/nope}}", {}), /nope.*line 2/);
  });

  test("undefined, null, object and array in a variable slot throw", () => {
    assert.throws(() => render("{{v}}", { v: undefined }), /"v".*line 1/);
    assert.throws(() => render("{{v}}", { v: null }), /"v".*line 1/);
    assert.throws(() => render("{{v}}", { v: {} }), /"v".*object/);
    assert.throws(() => render("{{v}}", { v: [] }), /"v".*array/);
  });

  test("unclosed section throws with line number", () => {
    assert.throws(() => render("a\n{{#x}}\nb", { x: true }), /"x".*line 2.*never closed/);
  });

  test("mismatched and stray closing tags throw", () => {
    assert.throws(() => render("{{#a}}\n{{/b}}", { a: true, b: true }), /\{\{\/b\}\}.*line 2/);
    assert.throws(() => render("x\n{{/a}}", { a: true }), /line 2/);
  });

  test("unterminated tag throws", () => {
    assert.throws(() => render("x {{oops", {}), /line 1/);
  });

  test("substitution is single-pass: values containing {{x}} are escaped text, not re-rendered", () => {
    const out = render("{{a}}", { a: "{{x}}", x: "BOOM" });
    assert.equal(out, "{{x}}");
    assert.equal(render("{{a}}{{b}}", { a: "{{", b: "b}}" }), "{{b}}");
  });

  test("no raw form: triple mustache and ampersand are rejected", () => {
    assert.throws(() => render("{{{x}}}", { x: "<b>" }), /unsupported/);
    assert.throws(() => render("{{& x}}", { x: "<b>" }), /unsupported/);
  });
});

describe("build with fixtures", () => {
  const paths = {
    szablon: join(FIX, "szablon.html"),
    en: join(FIX, "en.json"),
    pl: join(FIX, "pl.json"),
    fakty: join(FIX, "fakty.json"),
  };
  const zbudujKomendy = (wybor, jezyk) => ({ linie: [`install ${wybor.skladniki.join(",")}`, `lang=${jezyk}`] });

  test("renders both languages from explicit paths", () => {
    const pages = buildPagesFrom({ ...readInputs(paths, ROOT), zbudujKomendy });
    assert.match(pages.en, /<html lang="en">/);
    assert.match(pages.pl, /<html lang="pl">/);
    assert.match(pages.en, /<title>Fixture &lt;EN&gt; v1\.2\.3<\/title>/);
    assert.match(pages.en, /<li>1\. one &amp; two \(1\.2\.3\)<\/li>\n    <li>2\. three/);
    // the default version is the desk, under biurko/ since E8
    assert.match(pages.en, /href="\.\.\/pl\/"/);
    assert.match(pages.pl, /href="\.\.\/\.\.\/pl\/"/);
    assert.match(pages.en, /data-path="biurko\/"/);
    assert.match(pages.pl, /data-path="pl\/biurko\/"/);
    assert.match(pages.en, /<pre>install relai,panel,cache\nlang=en<\/pre>/);
  });

  test("output has LF endings, one trailing newline and no blank lines from tags", () => {
    const pages = buildPagesFrom({ ...readInputs(paths, ROOT), zbudujKomendy });
    for (const html of Object.values(pages)) {
      assert.ok(!html.includes("\r"));
      assert.ok(html.endsWith("</html>\n") && !html.endsWith("\n\n"));
      assert.ok(!/\n\s*\n/.test(html));
      assert.ok(!html.includes("{{") && !html.includes("}}"));
    }
  });

  test("content keys colliding with reserved keys throw", () => {
    const inputs = readInputs(paths, ROOT);
    inputs.tresc.en = { ...inputs.tresc.en, baza: "x" };
    assert.throws(() => buildPagesFrom({ ...inputs, zbudujKomendy }), /reserved.*baza/);
  });

  test("a missing input file names the file", () => {
    assert.throws(() => readInputs({ ...paths, pl: join(FIX, "nie-ma.json") }, ROOT), /Missing input file: .*nie-ma\.json/);
  });

  test("leftover braces in output are rejected", () => {
    const inputs = readInputs(paths, ROOT);
    inputs.tresc.en = { ...inputs.tresc.en, tytul: "{{x}}" };
    assert.throws(() => buildPagesFrom({ ...inputs, zbudujKomendy }), /Unrendered braces.*line 4/);
  });

  test("writeIfChanged leaves an identical file untouched", async () => {
    const dir = mkdtempSync(join(tmpdir(), "zbuduj-"));
    const file = join(dir, "sub", "a.html");
    assert.equal(writeIfChanged(file, "x\n"), "zapisano");
    const before = statSync(file).mtimeMs;
    await new Promise((r) => setTimeout(r, 20));
    assert.equal(writeIfChanged(file, "x\n"), "bez zmian");
    assert.equal(statSync(file).mtimeMs, before);
    assert.equal(writeIfChanged(file, "y\n"), "zapisano");
    assert.equal(readFileSync(file, "utf8"), "y\n");
  });
});

const templateReady = existsSync(join(HERE, "szablon.html"));
const skip = templateReady ? false : "site/narzedzia/szablon.html does not exist yet";

describe("real site", () => {
  test("generated pages equal the files on disk", { skip }, async () => {
    const pages = await buildPages(ROOT);
    assert.deepEqual(Object.keys(pages), PAGES);
    for (const [rel, content] of Object.entries(pages)) {
      assert.equal(readFileSync(join(ROOT, rel), "utf8"), content, `${rel} is stale; run node site/narzedzia/zbuduj.mjs`);
    }
  });

  test("pages carry hreflang links and matching html lang", { skip }, async () => {
    const pages = await buildPages(ROOT);
    for (const html of Object.values(pages)) {
      assert.ok(html.includes('hreflang="en"'));
      assert.ok(html.includes('hreflang="pl"'));
    }
    for (const rel of PAGES) {
      assert.ok(pages[rel].includes(`<html lang="${SITE[rel].jezyk}"`), `${rel} has the wrong html lang`);
    }
  });
});

// ---- the four real pages: Biurko (desk) and Film (scroll film), each in EN and PL ----------------------

const PAGES = ["site/index.html", "site/pl/index.html", "site/biurko/index.html", "site/pl/biurko/index.html"];
const SITE = {
  "site/index.html": { jezyk: "en", baza: "./", film: true, przelacznik: "./pl/", sciezka: "", druga: "./biurko/" },
  "site/pl/index.html": { jezyk: "pl", baza: "../", film: true, przelacznik: "../", sciezka: "pl/", druga: "../pl/biurko/" },
  "site/biurko/index.html": { jezyk: "en", baza: "../", film: false, przelacznik: "../pl/biurko/", sciezka: "biurko/", druga: "../" },
  "site/pl/biurko/index.html": { jezyk: "pl", baza: "../../", film: false, przelacznik: "../../biurko/", sciezka: "pl/biurko/", druga: "../../pl/" },
};
const FILM_PAGES = PAGES.filter((rel) => SITE[rel].film);

const fakty = JSON.parse(readFileSync(join(ROOT, "site", "dane", "fakty.json"), "utf8"));

// The pages are built once and shared by the tests below (building is pure, the inputs are read-only).
let built;
const realPages = () => (built ??= buildPages(ROOT));

// hreflang alternates of a page as { lang: href }.
function hreflangs(html) {
  const out = {};
  for (const m of html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)) out[m[1]] = m[2];
  return out;
}

// Every href/src that points into vendor/scrollcraft/.
const vendorRefs = (html) => [...html.matchAll(/(?:href|src)="([^"]*vendor\/scrollcraft\/[^"]*)"/g)].map((m) => m[1]);

// The assertion under test of the positive control below: the engine must load from exactly
// "{baza}vendor/scrollcraft/scrollcraft.css|js", relative, no CDN.
function assertVendorPaths(html, baza) {
  assert.deepEqual(vendorRefs(html).sort(), [`${baza}vendor/scrollcraft/scrollcraft.css`, `${baza}vendor/scrollcraft/scrollcraft.js`]);
}

const countCards = (html) => (html.match(/\sdata-fiszka[\s>]/g) ?? []).length;
const shownCount = (html) => Number(html.match(/<span data-liczba-komend>(\d+)<\/span>/)?.[1]);

describe("real site: the four pages", { skip }, () => {
  test("buildPages returns exactly the four pages, each a non-empty document with the right lang", async () => {
    const pages = await realPages();
    assert.deepEqual(Object.keys(pages), PAGES);
    for (const rel of PAGES) {
      assert.ok(pages[rel].startsWith("<!doctype html>"), rel);
      assert.match(pages[rel], new RegExp(`<html lang="${SITE[rel].jezyk}"`), rel);
    }
  });

  test("hreflang links are absolute, from the one public address: film at the root, desk under biurko/", async () => {
    const pages = await realPages();
    const A = ADRES_PUBLICZNY;
    for (const rel of PAGES) {
      const wersja = SITE[rel].film ? "" : "biurko/";
      assert.deepEqual(hreflangs(pages[rel]), { en: A + wersja, pl: `${A}pl/${wersja}`, "x-default": A + wersja }, rel);
    }
  });

  test("each page has exactly one canonical link, its own absolute address", async () => {
    const pages = await realPages();
    for (const rel of PAGES) {
      const kanoniczne = [...pages[rel].matchAll(/<link rel="canonical" href="([^"]+)">/g)].map((m) => m[1]);
      assert.deepEqual(kanoniczne, [ADRES_PUBLICZNY + SITE[rel].sciezka], rel);
    }
  });

  test("positive control: the hreflang reader sees a relative or missing alternate", () => {
    assert.deepEqual(hreflangs('<link rel="alternate" hreflang="en" href="./">'), { en: "./" });
    assert.notDeepEqual(hreflangs('<link rel="alternate" hreflang="en" href="./">'), { en: ADRES_PUBLICZNY });
    assert.deepEqual(hreflangs("<p>none</p>"), {});
  });

  test("the film pages load the engine from relative vendor paths", async () => {
    const pages = await realPages();
    assert.equal(SITE["site/index.html"].baza, "./");
    for (const rel of FILM_PAGES) assertVendorPaths(pages[rel], SITE[rel].baza);
    assert.ok(vendorRefs(pages["site/index.html"]).every((r) => r.startsWith("./vendor/scrollcraft/")));
    assert.ok(vendorRefs(pages["site/pl/index.html"]).every((r) => r.startsWith("../vendor/scrollcraft/")));
  });

  test("positive control: the vendor path assertion rejects a wrong or absolute path", () => {
    const template = readFileSync(join(HERE, "szablon-film.html"), "utf8");
    const vendorLines = template.split("\n").filter((l) => l.includes("vendor/scrollcraft/")).join("\n");
    assert.equal(vendorRefs(vendorLines).length, 2, "the template references the engine twice (css, js)");
    assertVendorPaths(render(vendorLines, { baza: "../" }), "../"); // right baza passes
    assert.throws(() => assertVendorPaths(render(vendorLines, { baza: "../../" }), "../")); // PL baza on the EN page
    assert.throws(() => assertVendorPaths(render(vendorLines, { baza: "./" }), "../"));
    assert.throws(() => assertVendorPaths(render(vendorLines, { baza: "https://cdn.example.com/" }), "../"));
    assert.throws(() => assertVendorPaths("<p>no engine at all</p>", "../"));
  });

  test("the Biurko pages do not reference scrollcraft", async () => {
    const pages = await realPages();
    for (const rel of PAGES.filter((r) => !SITE[r].film)) assert.ok(!/scrollcraft/i.test(pages[rel]), rel);
  });

  test("the Film pages do not reference three.js or an import map", async () => {
    const pages = await realPages();
    for (const rel of FILM_PAGES) {
      assert.ok(!/importmap/i.test(pages[rel]), `${rel} has an import map`);
      assert.ok(!/vendor\/three/i.test(pages[rel]), `${rel} loads three.js from vendor`);
      assert.ok(!/three\.(?:module\.)?(?:min\.)?js/i.test(pages[rel]), `${rel} references three.js`);
    }
  });

  test("language switch on every page goes to the other language of the same version, relatively", async () => {
    const pages = await realPages();
    for (const rel of PAGES) {
      const href = pages[rel].match(/<a class="(?:pasek__jezyk|jezyk)" href="([^"]+)" hreflang=/)?.[1];
      assert.equal(href, SITE[rel].przelacznik, rel);
    }
  });

  test("command cards: one per command, as many as the facts say, and the shown number matches", async () => {
    const pages = await realPages();
    assert.equal(fakty.komendy.length, fakty.liczbaKomend);
    for (const rel of FILM_PAGES) {
      assert.equal(countCards(pages[rel]), fakty.komendy.length, `${rel} card count`);
      assert.equal(countCards(pages[rel]), fakty.liczbaKomend, `${rel} card count vs liczbaKomend`);
      assert.equal(shownCount(pages[rel]), fakty.liczbaKomend, `${rel} number shown in the heading`);
    }
  });
});

describe("film: command cards and inputs", () => {
  const tresc = (fiszki) => ({ film: { fiszki } });
  const dwieKomendy = {
    liczbaKomend: 2,
    komendy: [
      { nazwa: "relai-aaa", nazwaPl: "Aaa", opisPl: "opis a", opisEn: "desc a" },
      { nazwa: "relai-bbb", nazwaPl: "Bbb", opisPl: "opis b", opisEn: "desc b" },
    ],
  };

  test("zbudujFiszki returns the cards in the order of the facts, Polish from facts, English from content", () => {
    const en = tresc({ "relai-aaa": { tytul: "A", opis: "a" }, "relai-bbb": { tytul: "B", opis: "b" } });
    assert.deepEqual(zbudujFiszki(dwieKomendy, en, "en"), [
      { nazwa: "relai-aaa", ikona: "aaa", tytul: "A", opis: "a" },
      { nazwa: "relai-bbb", ikona: "bbb", tytul: "B", opis: "b" },
    ]);
    assert.deepEqual(zbudujFiszki(dwieKomendy, {}, "pl"), [
      { nazwa: "relai-aaa", ikona: "aaa", tytul: "Aaa", opis: "opis a" },
      { nazwa: "relai-bbb", ikona: "bbb", tytul: "Bbb", opis: "opis b" },
    ]);
  });

  test("zbudujFiszki throws when an English entry is missing, naming the command", () => {
    const en = tresc({ "relai-aaa": { tytul: "A", opis: "a" } });
    assert.throws(() => zbudujFiszki(dwieKomendy, en, "en"), /no film\.fiszki entry for relai-bbb/);
    assert.throws(() => zbudujFiszki(dwieKomendy, tresc({ "relai-aaa": { tytul: "A", opis: "a" }, "relai-bbb": { tytul: "B" } }), "en"), /relai-bbb/);
    assert.throws(() => zbudujFiszki(dwieKomendy, {}, "en"), /relai-aaa/);
  });

  test("zbudujFiszki throws when komendy.length differs from liczbaKomend", () => {
    assert.throws(() => zbudujFiszki({ ...dwieKomendy, liczbaKomend: 3 }, {}, "pl"), /2 commands but liczbaKomend is 3/);
    assert.throws(() => zbudujFiszki({ liczbaKomend: 1 }, {}, "pl"), /0 commands but liczbaKomend is 1/);
  });

  // Inputs of the real site, with a stub for the install commands (not what these tests are about).
  const zbudujKomendy = () => ({ linie: ["install"] });
  const realInputs = () =>
    readInputs(
      {
        szablon: join(HERE, "szablon.html"),
        szablonFilm: join(HERE, "szablon-film.html"),
        en: join(ROOT, "site", "tresc", "en.json"),
        pl: join(ROOT, "site", "tresc", "pl.json"),
        fakty: join(ROOT, "site", "dane", "fakty.json"),
        makiety: join(ROOT, "site", "dane", "makiety.json"),
      },
      ROOT,
    );
  const buildFilm = ({ templateFilm, makiety, template, ...rest }, over = {}) =>
    buildPagesFrom({ ...rest, template: templateFilm, zbudujKomendy, wersja: "film", makiety, ...over });

  test("control: the unmodified real inputs build both film pages", { skip }, () => {
    const pages = buildFilm(realInputs());
    assert.equal(countCards(pages.en), fakty.liczbaKomend);
    assert.equal(countCards(pages.pl), fakty.liczbaKomend);
  });

  test("POSITIVE CONTROL: a command dropped from komendy while liczbaKomend stays makes the build throw", { skip }, () => {
    const inputs = realInputs();
    const broken = { ...inputs.fakty, komendy: inputs.fakty.komendy.slice(0, -1) };
    assert.equal(broken.komendy.length, inputs.fakty.liczbaKomend - 1);
    assert.throws(() => buildFilm({ ...inputs, fakty: broken }), /commands but liczbaKomend is/);
  });

  test("an English film.fiszki entry missing from the content makes the build throw", { skip }, () => {
    const inputs = realInputs();
    const { [inputs.fakty.komendy[0].nazwa]: _dropped, ...rest } = inputs.tresc.en.film.fiszki;
    const tresc = { ...inputs.tresc, en: { ...inputs.tresc.en, film: { ...inputs.tresc.en.film, fiszki: rest } } };
    assert.throws(() => buildFilm({ ...inputs, tresc }), new RegExp(`no film\\.fiszki entry for ${inputs.fakty.komendy[0].nazwa}`));
  });

  test("the film build without makiety throws", { skip }, () => {
    const { makiety: _unused, ...inputs } = realInputs();
    assert.throws(() => buildFilm({ ...inputs, makiety: undefined }), /Mock-ups .* have no "en" entry/);
    assert.throws(() => buildFilm({ ...inputs, makiety: { pl: {} } }), /no "en" entry/);
  });

  test("an unknown page version throws", { skip }, () => {
    const inputs = realInputs();
    assert.throws(() => buildPagesFrom({ ...inputs, zbudujKomendy, wersja: "kino" }), /Unknown page version "kino"/);
  });
});
