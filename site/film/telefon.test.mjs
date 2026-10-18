import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { adresInstalacji, czyAnulowane } from "./telefon.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const read = (...p) => readFileSync(join(HERE, ...p), "utf8");
const TEMPLATE = read("..", "narzedzia", "szablon-film.html");
const CSS = read("..", "css", "film.css");
const PAGES = { pl: read("..", "pl", "index.html"), en: read("..", "index.html") };
const CONTENT = { pl: JSON.parse(read("..", "tresc", "pl.json")), en: JSON.parse(read("..", "tresc", "en.json")) };

const karta = (html) => html.match(/<div class="okno okno--jasne instalacja__telefon"[\s\S]*?<\/div>\s*<footer/)?.[0] ?? "";

describe("the install card on a phone", () => {
  test("the shared link points at the install section and drops any other fragment", () => {
    assert.equal(adresInstalacji("https://relai.dev/pl/film/", "instalacja"), "https://relai.dev/pl/film/#instalacja");
    assert.equal(adresInstalacji("https://relai.dev/film/?a=1#pamiec", "instalacja"), "https://relai.dev/film/?a=1#instalacja");
  });

  test("a cancelled share sheet is not an error, anything else is", () => {
    assert.equal(czyAnulowane(Object.assign(new Error("x"), { name: "AbortError" })), true);
    assert.equal(czyAnulowane(new Error("x")), false);
    assert.equal(czyAnulowane("AbortError"), false);
  });

  test("both pages carry the card with the send and copy buttons and the commands printed for no-JS", () => {
    for (const [jezyk, html] of Object.entries(PAGES)) {
      const k = karta(html);
      assert.ok(k, `${jezyk}: card not found`);
      assert.match(k, /data-wyslij hidden>/, jezyk);
      assert.match(k, /data-kopiuj-komendy hidden>/, jezyk);
      assert.match(k, /<pre class="konfigurator__komendy" data-komendy-telefonu>claude plugin install relai /, jezyk);
      assert.match(k, new RegExp(CONTENT[jezyk].film.instalacja.telefon.wyslij), jezyk);
    }
  });

  test("POSITIVE CONTROL: the card check fails on a template without the card", () => {
    assert.equal(karta(TEMPLATE.replace("instalacja__telefon\"", "x\"")), "");
  });

  test("PL and EN have the same phone strings, none of them empty", () => {
    const pl = CONTENT.pl.film.instalacja.telefon;
    const en = CONTENT.en.film.instalacja.telefon;
    assert.deepEqual(Object.keys(pl).sort(), Object.keys(en).sort());
    for (const v of [...Object.values(pl), ...Object.values(en)]) assert.ok(String(v).trim());
  });

  test("the card is hidden on wide screens and replaces the configurator on a phone", () => {
    assert.match(CSS, /^\.instalacja__telefon \{ display: none; \}/m);
    const telefon = CSS.slice(CSS.indexOf("@media (max-width: 600px)"));
    assert.match(telefon, /\.instalacja__okno \{ display: none; \}/);
    assert.match(telefon, /\.instalacja__telefon \{ display: flex;/);
  });
});
