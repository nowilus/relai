// The desk pages without JavaScript: everything a visitor needs is in the built HTML, outside scripts and
// templates (a <template> is never rendered; a <noscript> is, when scripts are off).
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const KOMENDY = JSON.parse(readFileSync(join(SITE, "dane", "fakty.json"), "utf8")).komendy.length;
const STRONY = { en: join(SITE, "index.html"), pl: join(SITE, "pl", "index.html") };
const SZUFLADY = ["dokumenty", "teczka", "laptop", "pudelko"];

/** What a browser without scripts renders: no <script>, no <template>. */
export function bezSkryptow(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "").replace(/<template\b[^>]*>[\s\S]*?<\/template>/g, "");
}

const ile = (html, wzorzec) => (html.match(wzorzec) ?? []).length;

/** One dialog's markup, from its opening tag to its closing tag. */
function szuflada(html, nazwa) {
  const m = html.match(new RegExp(`<dialog\\b[^>]*data-szuflada="${nazwa}"[^>]*>([\\s\\S]*?)</dialog>`));
  return m ? m[1] : null;
}

/** The list of what is missing from a no-JS page; empty = complete. */
export function brakiBezJs(html, komendy = KOMENDY) {
  const h = bezSkryptow(html);
  const braki = [];
  if (ile(h, /<h1\b/g) !== 1) braki.push(`h1: ${ile(h, /<h1\b/g)}`);
  if (ile(h, /<section\b[^>]*data-przystanek="/g) !== 7) braki.push(`stops: ${ile(h, /<section\b[^>]*data-przystanek="/g)}`);
  if (ile(h, /data-fiszka-szuflady/g) !== komendy) braki.push(`cards: ${ile(h, /data-fiszka-szuflady/g)} of ${komendy}`);
  const tresc = {
    dokumenty: /class="arkusz-pamieci"/g, teczka: /<li data-stan=/g, laptop: /class="pasek-makieta"/g, pudelko: /data-fiszka-szuflady/g,
  };
  for (const s of SZUFLADY) {
    const d = szuflada(h, s);
    if (!d) braki.push(`drawer ${s}: missing`);
    else if (!/<h2\b[^>]*>[^<]+<\/h2>/.test(d) || ile(d, tresc[s]) === 0) braki.push(`drawer ${s}: empty`);
  }
  if (!/<pre\b[^>]*data-komendy\b[^>]*>claude plugin install relai\b/.test(h)) braki.push("install command");
  if (!/<form\b[^>]*data-konfigurator/.test(h)) braki.push("configurator form");
  if (!/<noscript>\s*<picture class="plakat">[\s\S]*?<img\b[^>]*alt="[^"]+"/.test(h)) braki.push("poster");
  return braki;
}

describe("the desk without JavaScript", () => {
  for (const [jezyk, plik] of Object.entries(STRONY)) {
    test(`${jezyk}: h1, seven stops, every card, four drawers with content, install command, form, poster`, () => {
      assert.deepEqual(brakiBezJs(readFileSync(plik, "utf8")), []);
    });
  }

  test("positive control: a page short of one card, one drawer's content or the poster fails", () => {
    const html = readFileSync(STRONY.pl, "utf8");
    const bezFiszki = html.replace(/<li class="fiszka-szuflady"[\s\S]*?<\/li>/, "");
    assert.deepEqual(brakiBezJs(bezFiszki), [`cards: ${KOMENDY - 1} of ${KOMENDY}`]);
    const pustaTeczka = html.replace(/(data-szuflada="teczka"[\s\S]*?)<ol>[\s\S]*?<\/ol>/, "$1<ol></ol>");
    assert.deepEqual(brakiBezJs(pustaTeczka), ["drawer teczka: empty"]);
    const bezPlakatu = html.replace(/<noscript>[\s\S]*?<\/noscript>/, "");
    assert.deepEqual(brakiBezJs(bezPlakatu), ["poster"]);
  });

  test("templates and scripts do not count: the poster template alone is not a poster", () => {
    const html = readFileSync(STRONY.en, "utf8");
    assert.ok(/<template data-plakat>/.test(html));
    assert.deepEqual(brakiBezJs(html.replace(/<noscript>[\s\S]*?<\/noscript>/, "")), ["poster"]);
  });
});
