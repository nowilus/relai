import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, mkdtempSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { render, escapeHtml, buildPages, buildPagesFrom, readInputs, writeIfChanged } from "./zbuduj.mjs";

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
    assert.match(pages.en, /href="\.\/pl\/"/);
    assert.match(pages.pl, /href="\.\.\/pl\/"/);
    assert.match(pages.en, /data-path=""/);
    assert.match(pages.pl, /data-path="pl\/"/);
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
    assert.deepEqual(Object.keys(pages), ["site/index.html", "site/pl/index.html"]);
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
    assert.ok(pages["site/index.html"].includes('<html lang="en"'));
    assert.ok(pages["site/pl/index.html"].includes('<html lang="pl"'));
  });
});
