import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildMakiety, SAMPLE_STATUS, SAMPLE_PROMPT, SAMPLE_CACHE, SAMPLE_CONTEXT, APP_SURFACES, OUTPUT } from "./makiety.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(HERE, "..", "..");

// The same core the generator loads (theme + plan-state + progress, merged).
const load = (name) => import(pathToFileURL(join(ROOT_DIR, "core", "panel", name)).href);
const core = Object.assign({}, ...(await Promise.all(["theme.mjs", "plan-state.mjs", "progress.mjs"].map(load))));
const { BAND, INK, ROOT, FLOW, leftColor, inkOf, parseStatus, checklistItems } = core;

const makiety = buildMakiety(core);
const LANGUAGES = ["pl", "en"];
const barOf = (lang, klucz) => makiety[lang].paski.find((p) => p.klucz === klucz);

describe("makiety: both languages", () => {
  test("pl and en entries are both present with the same shape", () => {
    assert.deepEqual(Object.keys(makiety).sort(), ["en", "pl"]);
    assert.deepEqual(Object.keys(makiety.pl).sort(), Object.keys(makiety.en).sort());
    for (const lang of LANGUAGES) assert.ok(makiety[lang].opis.length > 0);
  });
});

describe("makiety: colours come from core", () => {
  for (const lang of LANGUAGES) {
    test(`${lang}: shared colours equal the dark ink`, () => {
      const { kolory } = makiety[lang];
      assert.equal(kolory.tekst, INK.dark.text);
      assert.equal(kolory.wyciszony, INK.dark.muted);
      assert.equal(kolory.linia, INK.dark.rule);
      assert.equal(kolory.tor, INK.dark.track);
      assert.equal(kolory.w_toku, INK.dark.running);
      assert.deepEqual(
        { karta: kolory.karta, okno: kolory.okno, prompt: kolory.prompt },
        { karta: APP_SURFACES.karta, okno: APP_SURFACES.okno, prompt: APP_SURFACES.prompt },
      );
    });

    test(`${lang}: each battery colour follows what is left`, () => {
      const { baterie } = barOf(lang, "cache").cache;
      assert.equal(baterie.length, SAMPLE_CACHE.length);
      baterie.forEach((b, i) => {
        assert.equal(b.etykieta, SAMPLE_CACHE[i].etykieta);
        assert.equal(b.zostalo, SAMPLE_CACHE[i].zostalo);
        assert.equal(b.kolor, INK.dark[inkOf(leftColor(SAMPLE_CACHE[i].zostalo))], `battery ${b.etykieta}`);
      });
    });

    test(`${lang}: context colour follows the share left before auto-compact`, () => {
      const { kontekst } = barOf(lang, "cache").cache;
      const left = (100 * (SAMPLE_CONTEXT.prog - SAMPLE_CONTEXT.uzyte)) / SAMPLE_CONTEXT.prog;
      assert.equal(kontekst.kolor, INK.dark[inkOf(leftColor(left))]);
      assert.equal(kontekst.uzyte, SAMPLE_CONTEXT.uzyte);
      assert.equal(kontekst.prog, SAMPLE_CONTEXT.prog);
    });

    test(`${lang}: progress segments are painted by item state`, () => {
      const { segmenty } = barOf(lang, "postep").postep;
      const states = checklistItems(SAMPLE_PROMPT, "przyklad").map((it, i) => (i + 1 === 3 ? "running" : it.status));
      const ink = { done: INK.dark.done, running: INK.dark.running, pending: INK.dark.track };
      assert.equal(segmenty.length, states.length);
      assert.deepEqual(segmenty.map((s) => s.kolor), states.map((s) => ink[s]));
      assert.equal(states.filter((s) => s === "running").length, 1, "exactly one box is being worked on");
    });

    test(`${lang}: plan sheet stage colours come from the light ink by the map's item kind`, () => {
      const { stages } = parseStatus(SAMPLE_STATUS);
      const { etapy } = makiety[lang].plan;
      const lightOf = { done: INK.light.done, running: INK.light.running };
      assert.equal(etapy.length, stages.length);
      etapy.forEach((row, i) => {
        const look = FLOW.stage[stages[i].status];
        assert.equal(row.id, stages[i].id);
        assert.equal(row.znak, look.mark);
        assert.equal(row.kolor, lightOf[look.item] ?? INK.light.muted, `stage ${row.id}`);
      });
    });

    test(`${lang}: every hex colour in the output is a core colour`, () => {
      const allowed = new Set([...Object.values(INK.dark), ...Object.values(INK.light), ...Object.values(APP_SURFACES)]);
      const found = JSON.stringify(makiety[lang]).match(/#[0-9a-fA-F]{6}\b/g) ?? [];
      assert.ok(found.length > 0);
      for (const hex of found) assert.ok(allowed.has(hex), `${hex} is not in INK or APP_SURFACES`);
    });
  }
});

describe("makiety: bars", () => {
  for (const lang of LANGUAGES) {
    test(`${lang}: labels are the bands' own words, in the order plan, progress, cache`, () => {
      const bars = makiety[lang].paski;
      assert.deepEqual(bars.map((p) => p.klucz), ["plan", "postep", "cache"]);
      assert.deepEqual(bars.map((p) => p.etykieta), [BAND.panel.label, BAND.progress.label, BAND.cache.label]);
    });

    test(`${lang}: plan figure is closed/total from the parsed status`, () => {
      const { stages } = parseStatus(SAMPLE_STATUS);
      const closed = stages.filter((s) => s.status === "ZREALIZOWANY").length;
      assert.equal(barOf(lang, "plan").liczba, `${closed}/${stages.length}`);
    });

    test(`${lang}: progress figure is done/total from the checklist`, () => {
      const items = checklistItems(SAMPLE_PROMPT, "przyklad");
      const done = items.filter((it) => it.status === "done").length;
      assert.equal(barOf(lang, "postep").liczba, `${done}/${items.length}`);
    });

    test(`${lang}: every bar carries every section key, the undrawn ones false`, () => {
      for (const bar of makiety[lang].paski) {
        for (const key of ["plan", "postep", "cache"]) {
          assert.ok(Object.hasOwn(bar, key), `${bar.klucz} lacks ${key}`);
          assert.equal(Boolean(bar[key]), key === bar.klucz, `${bar.klucz}.${key}`);
        }
      }
    });
  }
});

describe("makiety: files in the repo", () => {
  test("the committed site/dane/makiety.json is up to date with the generator", () => {
    const onDisk = readFileSync(join(ROOT_DIR, OUTPUT), "utf8");
    assert.equal(onDisk, JSON.stringify(makiety, null, 2) + "\n", `${OUTPUT} is stale; run node site/narzedzia/makiety.mjs`);
  });

  test("the ROOT block of site/css/film.css equals core ROOT exactly", () => {
    const css = readFileSync(join(ROOT_DIR, "site", "css", "film.css"), "utf8");
    const block = css.match(/:root\s*\{([^}]*)\}/)?.[1];
    assert.ok(block, ":root block not found in film.css");
    const keys = Object.keys(ROOT);
    assert.equal(keys.length, 12);
    for (const key of keys) {
      const hex = block.match(new RegExp(`(?:^|[\\s;{])--${key}:\\s*(#[0-9a-fA-F]{6})\\b`))?.[1];
      assert.equal(hex?.toLowerCase(), ROOT[key].toLowerCase(), `--${key}`);
    }
  });
});
