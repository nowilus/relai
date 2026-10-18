// Tiny static page generator: minimal Mustache subset -> the film (site/index.html, site/pl/index.html)
// and the desk (site/biurko/index.html, site/pl/biurko/index.html), one template per version.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(HERE, "..", "..");

const RESERVED_KEYS = ["fakty", "jezyk", "baza", "sciezkaStrony", "adresy", "komendyDomyslne", "makiety", "fiszki"];
const DEFAULT_COMMAND_CHOICE = { tryb: "instaluje", narzedzie: "claude", skladniki: ["relai", "panel", "cache"] };
const OUTPUT_FILES = { en: "site/biurko/index.html", pl: "site/pl/biurko/index.html" };
const OUTPUT_FILES_FILM = { en: "site/index.html", pl: "site/pl/index.html" };

// The one public address of the site (GitHub Pages); hreflang and canonical are built from it.
export const ADRES_PUBLICZNY = "https://nowilus.github.io/relai/";

// Per version: where each language's page lies, as the relative way back to site/ and its own path.
// E8: the film at the root, the desk under biurko/ (Lukasz, 2026-10-18).
const VERSIONS = Object.freeze({
  biurko: { nazwa: "biurko", outputs: OUTPUT_FILES, baza: { en: "../", pl: "../../" }, sciezka: { en: "biurko/", pl: "pl/biurko/" }, druga: "film" },
  film: { nazwa: "film", outputs: OUTPUT_FILES_FILM, baza: { en: "./", pl: "../" }, sciezka: { en: "", pl: "pl/" }, druga: "biurko" },
});

// The survey link: the form address from the content plus which page the visitor came from
// (Tally fills its hidden fields from these query parameters).
export function adresAnkiety(ankietaAdres, wersja, jezyk) {
  if (typeof ankietaAdres !== "string") return undefined;
  return `${ankietaAdres}?wersja=${wersja.nazwa}&jezyk=${jezyk}`;
}

// Absolute hreflang/canonical addresses and the relative links to the other language and version.
export function zbudujAdresy(wersja, jezyk) {
  const inny = jezyk === "en" ? "pl" : "en";
  const baza = wersja.baza[jezyk];
  return {
    en: ADRES_PUBLICZNY + wersja.sciezka.en,
    pl: ADRES_PUBLICZNY + wersja.sciezka.pl,
    xDefault: ADRES_PUBLICZNY + wersja.sciezka.en,
    kanoniczny: ADRES_PUBLICZNY + wersja.sciezka[jezyk],
    jezyk: baza + wersja.sciezka[inny],
    drugaWersja: baza + VERSIONS[wersja.druga].sciezka[jezyk],
  };
}

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

function fail(message) {
  return new Error(message);
}

// ---- tokenizer -------------------------------------------------------------

const BLANK = /^[ \t\r]*$/;

function tokenize(tpl) {
  const tokens = [];
  const lineAt = (index) => {
    let n = 1;
    for (let k = tpl.indexOf("\n"); k !== -1 && k < index; k = tpl.indexOf("\n", k + 1)) n++;
    return n;
  };

  let pos = 0;
  let from = 0;
  for (;;) {
    const start = tpl.indexOf("{{", from);
    if (start === -1) break;
    const line = lineAt(start);
    const close = tpl.indexOf("}}", start + 2);
    if (close === -1) throw fail(`Template error: tag opened with "{{" is never closed, line ${line}`);
    const end = close + 2;
    const raw = tpl.slice(start + 2, close);

    const sigil = raw[0];
    if (sigil === "{" || sigil === "&" || sigil === ">" || sigil === "=") {
      throw fail(`Template error: unsupported tag "{{${raw}}}", line ${line}`);
    }
    const isBlock = sigil === "#" || sigil === "^" || sigil === "/" || sigil === "!";
    const type = { "#": "open", "^": "openInverted", "/": "close", "!": "comment" }[sigil] ?? "var";
    const key = type === "comment" ? "" : (isBlock ? raw.slice(1) : raw).trim();
    if (type !== "comment" && !/^\S+$/.test(key)) {
      throw fail(`Template error: empty or invalid key in "{{${raw}}}", line ${line}`);
    }

    let standalone = false;
    let lineStart = 0;
    let lineEnd = -1;
    if (isBlock) {
      lineStart = tpl.lastIndexOf("\n", start - 1) + 1;
      lineEnd = tpl.indexOf("\n", end);
      const restEnd = lineEnd === -1 ? tpl.length : lineEnd;
      standalone = lineStart >= pos && BLANK.test(tpl.slice(lineStart, start)) && BLANK.test(tpl.slice(end, restEnd));
    }

    if (standalone) {
      if (lineStart > pos) tokens.push({ type: "text", text: tpl.slice(pos, lineStart) });
      pos = lineEnd === -1 ? tpl.length : lineEnd + 1;
    } else {
      if (start > pos) tokens.push({ type: "text", text: tpl.slice(pos, start) });
      pos = end;
    }
    if (type !== "comment") tokens.push({ type, key, line });
    from = pos;
  }
  if (pos < tpl.length) tokens.push({ type: "text", text: tpl.slice(pos) });
  return tokens;
}

// ---- parser ----------------------------------------------------------------

function parse(tpl) {
  const root = { children: [] };
  const open = [];
  let current = root;
  for (const tok of tokenize(tpl)) {
    if (tok.type === "text") {
      current.children.push(tok);
    } else if (tok.type === "var") {
      current.children.push(tok);
    } else if (tok.type === "open" || tok.type === "openInverted") {
      const node = { type: "section", inverted: tok.type === "openInverted", key: tok.key, line: tok.line, children: [] };
      current.children.push(node);
      open.push(node);
      current = node;
    } else {
      const node = open.pop();
      if (!node) throw fail(`Template error: unexpected {{/${tok.key}}} with no open section, line ${tok.line}`);
      if (node.key !== tok.key) {
        throw fail(`Template error: {{/${tok.key}}} at line ${tok.line} does not match {{#${node.key}}} opened at line ${node.line}`);
      }
      current = open.length ? open[open.length - 1] : root;
    }
  }
  const dangling = open[open.length - 1];
  if (dangling) throw fail(`Template error: section "${dangling.key}" opened at line ${dangling.line} is never closed`);
  return root.children;
}

// ---- renderer --------------------------------------------------------------

const isObject = (v) => v !== null && typeof v === "object";

function lookup(path, stack) {
  if (path === ".") return { found: true, value: stack[stack.length - 1].value };
  if (path === "@index" || path === "@numer") {
    const name = path.slice(1);
    for (let i = stack.length - 1; i >= 0; i--) {
      if (stack[i][name] !== undefined) return { found: true, value: stack[i][name] };
    }
    return { found: false };
  }
  const [head, ...rest] = path.split(".");
  for (let i = stack.length - 1; i >= 0; i--) {
    const ctx = stack[i].value;
    if (!isObject(ctx) || !Object.hasOwn(ctx, head)) continue;
    let value = ctx[head];
    for (const seg of rest) {
      if (!isObject(value) || !Object.hasOwn(value, seg)) return { found: false };
      value = value[seg];
    }
    return { found: true, value };
  }
  return { found: false };
}

function resolveStrict(node, stack) {
  const hit = lookup(node.key, stack);
  if (!hit.found || hit.value === undefined || hit.value === null) {
    throw fail(`Template error: missing key "${node.key}" at line ${node.line}`);
  }
  return hit.value;
}

function renderVar(node, stack) {
  const value = resolveStrict(node, stack);
  if (typeof value === "string") return escapeHtml(value);
  if (typeof value === "number") return escapeHtml(String(value));
  const kind = Array.isArray(value) ? "an array" : typeof value === "object" ? "an object" : `a ${typeof value}`;
  throw fail(`Template error: key "${node.key}" at line ${node.line} is ${kind}, not text or a number`);
}

// "list" | "once" | "object" | "empty"
function classify(node, value) {
  if (Array.isArray(value)) return value.length ? "list" : "empty";
  if (value === true) return "once";
  if (value === false) return "empty";
  if (isObject(value)) return Object.keys(value).length ? "object" : "empty";
  throw fail(`Template error: section "${node.key}" at line ${node.line} needs an array, boolean or object, got ${typeof value}`);
}

function renderSection(node, stack) {
  const value = resolveStrict(node, stack);
  const kind = classify(node, value);
  if (node.inverted) return kind === "empty" ? renderNodes(node.children, stack) : "";
  if (kind === "empty") return "";
  if (kind === "once") return renderNodes(node.children, stack);
  if (kind === "object") return renderNodes(node.children, [...stack, { value }]);
  return value
    .map((item, index) => renderNodes(node.children, [...stack, { value: item, index, numer: index + 1 }]))
    .join("");
}

function renderNodes(nodes, stack) {
  let out = "";
  for (const node of nodes) {
    if (node.type === "text") out += node.text;
    else if (node.type === "var") out += renderVar(node, stack);
    else out += renderSection(node, stack);
  }
  return out;
}

export function render(template, data) {
  return renderNodes(parse(String(template)), [{ value: data }]);
}

// ---- build -----------------------------------------------------------------

function readInput(path, repoRoot) {
  const label = relative(repoRoot, path).replaceAll("\\", "/");
  if (!existsSync(path)) throw fail(`Missing input file: ${label}`);
  return { label, text: readFileSync(path, "utf8") };
}

function readJson(path, repoRoot) {
  const { label, text } = readInput(path, repoRoot);
  try {
    return JSON.parse(text);
  } catch (err) {
    throw fail(`Invalid JSON in ${label}: ${err.message}`);
  }
}

function normalizeOutput(html) {
  return html.replace(/\r\n/g, "\n").replace(/\s+$/, "") + "\n";
}

function assertNoLeftovers(html, label) {
  const lines = html.split("\n");
  const index = lines.findIndex((l) => l.includes("{{") || l.includes("}}"));
  if (index !== -1) throw fail(`Unrendered braces in ${label}, line ${index + 1}: ${lines[index].trim()}`);
}

function buildContext(tresc, fakty, jezyk, komendyDomyslne, wersja = VERSIONS.biurko) {
  if (!isObject(tresc) || Array.isArray(tresc)) throw fail(`Content for "${jezyk}" must be a JSON object`);
  const clash = RESERVED_KEYS.filter((k) => Object.hasOwn(tresc, k));
  if (clash.length) throw fail(`Content for "${jezyk}" uses reserved keys: ${clash.join(", ")}`);
  return {
    ...tresc,
    fakty,
    jezyk,
    baza: wersja.baza[jezyk],
    sciezkaStrony: wersja.sciezka[jezyk],
    adresy: { ...zbudujAdresy(wersja, jezyk), ankieta: adresAnkiety(tresc.publikacja?.ankietaAdres, wersja, jezyk) },
    komendyDomyslne,
  };
}

// The film's command cards: one per command in the facts, in their order. Polish words come from
// the facts (core/panel NAMES), English ones from the content's film.fiszki, keyed by command.
export function zbudujFiszki(fakty, tresc, jezyk) {
  const komendy = Array.isArray(fakty?.komendy) ? fakty.komendy : [];
  if (komendy.length !== fakty?.liczbaKomend) {
    throw fail(`Facts list ${komendy.length} commands but liczbaKomend is ${fakty?.liczbaKomend}`);
  }
  return komendy.map((k) => {
    const ikona = String(k.nazwa).replace(/^relai-/, "");
    if (jezyk === "pl") return { nazwa: k.nazwa, ikona, tytul: k.nazwaPl, opis: k.opisPl };
    const en = tresc?.film?.fiszki?.[k.nazwa];
    if (!en?.tytul || !en?.opis) throw fail(`Content for "${jezyk}" has no film.fiszki entry for ${k.nazwa}`);
    return { nazwa: k.nazwa, ikona, tytul: en.tytul, opis: en.opis };
  });
}

// The bar mock-ups and the command cards, built once for both versions (E6: the desk renders them too).
function makietyIFiszki(tresc, fakty, jezyk, makiety) {
  if (!isObject(makiety?.[jezyk])) throw fail(`Mock-ups (site/dane/makiety.json) have no "${jezyk}" entry`);
  return { makiety: makiety[jezyk], fiszki: zbudujFiszki(fakty, tresc, jezyk) };
}

// Pure: explicit inputs in, rendered pages out ({ en, pl }). `wersja`: "biurko" (default) or "film";
// the film needs `makiety` (site/dane/makiety.json); the desk gets them, and the cards, when given.
export function buildPagesFrom({ template, tresc, fakty, zbudujKomendy, wersja = "biurko", makiety }) {
  const v = VERSIONS[wersja];
  if (!v) throw fail(`Unknown page version "${wersja}"`);
  const pages = {};
  for (const jezyk of ["en", "pl"]) {
    const komendy = zbudujKomendy(DEFAULT_COMMAND_CHOICE, jezyk);
    const base = buildContext(tresc[jezyk], fakty, jezyk, komendy.linie.join("\n"), v);
    const ctx = wersja === "film" || makiety ? { ...base, ...makietyIFiszki(tresc[jezyk], fakty, jezyk, makiety) } : base;
    const html = normalizeOutput(render(template, ctx));
    assertNoLeftovers(html, v.outputs[jezyk]);
    pages[jezyk] = html;
  }
  return pages;
}

export function readInputs(paths, repoRoot = DEFAULT_ROOT) {
  return {
    template: readInput(paths.szablon, repoRoot).text,
    ...(paths.szablonFilm ? { templateFilm: readInput(paths.szablonFilm, repoRoot).text } : {}),
    ...(paths.makiety ? { makiety: readJson(paths.makiety, repoRoot) } : {}),
    tresc: { en: readJson(paths.en, repoRoot), pl: readJson(paths.pl, repoRoot) },
    fakty: readJson(paths.fakty, repoRoot),
  };
}

async function loadKomendy(repoRoot) {
  const path = join(repoRoot, "site", "js", "konfigurator.js");
  if (!existsSync(path)) throw fail(`Missing input file: site/js/konfigurator.js`);
  const mod = await import(pathToFileURL(path).href);
  if (typeof mod.zbudujKomendy !== "function") throw fail(`site/js/konfigurator.js does not export zbudujKomendy`);
  return mod.zbudujKomendy;
}

// Async because konfigurator.js is imported lazily (it may not exist yet).
export async function buildPages(repoRoot = DEFAULT_ROOT) {
  const inputs = readInputs(
    {
      szablon: join(repoRoot, "site", "narzedzia", "szablon.html"),
      szablonFilm: join(repoRoot, "site", "narzedzia", "szablon-film.html"),
      en: join(repoRoot, "site", "tresc", "en.json"),
      pl: join(repoRoot, "site", "tresc", "pl.json"),
      fakty: join(repoRoot, "site", "dane", "fakty.json"),
      makiety: join(repoRoot, "site", "dane", "makiety.json"),
    },
    repoRoot,
  );
  const zbudujKomendy = await loadKomendy(repoRoot);
  const { templateFilm, makiety, ...wspolne } = inputs;
  const pages = buildPagesFrom({ ...wspolne, zbudujKomendy, makiety });
  const film = buildPagesFrom({ ...wspolne, template: templateFilm, zbudujKomendy, wersja: "film", makiety });
  return {
    [OUTPUT_FILES_FILM.en]: film.en,
    [OUTPUT_FILES_FILM.pl]: film.pl,
    [OUTPUT_FILES.en]: pages.en,
    [OUTPUT_FILES.pl]: pages.pl,
  };
}

// Writes only when bytes differ; returns "zapisano" or "bez zmian".
export function writeIfChanged(path, content) {
  const bytes = Buffer.from(content, "utf8");
  if (existsSync(path) && readFileSync(path).equals(bytes)) return "bez zmian";
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, bytes);
  return "zapisano";
}

export async function main(repoRoot = DEFAULT_ROOT) {
  try {
    const pages = await buildPages(repoRoot);
    for (const [rel, content] of Object.entries(pages)) {
      console.log(`${writeIfChanged(join(repoRoot, rel), content)} ${rel}`);
    }
    return 0;
  } catch (err) {
    console.error(err.message);
    return 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main();
}
