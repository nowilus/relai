// The mock-ups of the bars above the prompt and of a plan sheet, computed by the panel's own code
// (core/panel) on labelled sample data -> site/dane/makiety.json. The pages render it at build
// time, so the mock-ups are in the HTML without JavaScript. No colour is written here by hand:
// every one comes from core/panel/theme.mjs (BAND, INK, leftColor, inkOf, ROOT, mix).
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(HERE, "..", "..");
export const OUTPUT = "site/dane/makiety.json";

// ---- sample data (what a session of an example shop project would show) ------------------------

// The STATUS.md of the example plan, read by the same parser the panel uses.
export const SAMPLE_STATUS = [
  "# STATUS — plan PLATNOSCI",
  "",
  "[PLAN.html](PLAN.html) · utworzony 2026-10-02 · **ZAAKCEPTOWANY 2026-10-02**",
  "",
  "| Etap | Nazwa | Status |",
  "|---|---|---|",
  "| E1 | Koszyk | ZREALIZOWANY 2026-10-05 |",
  "| E2 | Faktury | ZREALIZOWANY 2026-10-09 |",
  "| E3 | Płatności kartą | W TOKU |",
  "| E4 | Zwroty | OCZEKUJE |",
  "| E5 | Wdrożenie | OCZEKUJE |",
].join("\n");

// English names of the same stages, by id (the statuses stay the plan's own words, translated below).
const STAGE_NAMES_EN = Object.freeze({ E1: "Cart", E2: "Invoices", E3: "Card payments", E4: "Refunds", E5: "Release" });
const STATUS_WORDS_EN = Object.freeze({ ZREALIZOWANY: "done", "W TOKU": "in progress", OCZEKUJE: "waiting", "GOTOWY DO STARTU": "ready", "POMINIĘTY": "skipped" });

// The verification boxes of the stage in progress; the third box is the one being worked on.
export const SAMPLE_PROMPT = [
  "- [x] Bramka płatności w trybie testowym",
  "- [x] Formularz karty: walidacja",
  "- [ ] Testy płatności odrzuconych",
  "- [ ] Zwrot środków po anulowaniu",
  "- [ ] Raport dzienny w CSV",
].join("\n");
const RUNNING_BOX = 3;

// The cache bar as relai-cache-keeper 0.11.0 draws it (screenshot of the app, 2026-10-16): four
// batteries in a grid, each showing what is LEFT, and the context row with the auto-compact mark.
export const SAMPLE_CACHE = Object.freeze([
  { etykieta: "cache", wartosc: "52 min", zostalo: 87, dopisek: "" },
  { etykieta: "limit 5 h", wartosc: "19 %", zostalo: 81, dopisek: "" },
  { etykieta: "reset za", wartosc: "3 h 12 min", zostalo: 64, dopisek: "" },
  { etykieta: "limit tygodnia", wartosc: "74 %", zostalo: 26, dopisek: "próg 98 % · domyślny" },
]);
export const SAMPLE_CONTEXT = Object.freeze({ etykieta: "kontekst", uzyte: 48, prog: 64, tekst: "480k / 1M · 48 %" });
const SAMPLE_COST = "$1.84";

// The app's own surfaces around the bars, sampled from the same screenshot (not RelAI colours:
// the desktop draws them): the card under the bars, the window, the prompt field.
export const APP_SURFACES = Object.freeze({ karta: "#212121", okno: "#151515", prompt: "#20201f" });

// ---- computed with core/panel ------------------------------------------------------------------

async function loadCore(repoRoot) {
  const mod = (name) => import(pathToFileURL(join(repoRoot, "core", "panel", name)).href);
  const [theme, planState, progress] = await Promise.all([mod("theme.mjs"), mod("plan-state.mjs"), mod("progress.mjs")]);
  return { ...theme, ...planState, ...progress };
}

const STEP_STATES = Object.freeze({ done: "done", running: "running", pending: "track" });
const LIGHT_OF_ITEM = Object.freeze({ done: "done", running: "running", pending: "muted", unknown: "muted" });

export function buildMakiety(core) {
  const { BAND, INK, ROOT, FLOW, mix, leftColor, inkOf, parseStatus, checklistItems } = core;
  const ink = INK.dark;
  const { planStatus, stages } = parseStatus(SAMPLE_STATUS);
  const current = stages.find((s) => s.status === "W TOKU");
  const closed = stages.filter((s) => s.status === "ZREALIZOWANY").length;
  const items = checklistItems(SAMPLE_PROMPT, "przyklad").map((it, i) =>
    i + 1 === RUNNING_BOX ? { ...it, status: "running" } : it,
  );
  const done = items.filter((it) => it.status === "done").length;

  // The plan sheet is paper, so its marks take the light palette, by the map's own item kind.
  const stageRow = (s, jezyk) => {
    const look = FLOW.stage[s.status] ?? FLOW.stage.OCZEKUJE;
    return {
      id: s.id,
      nazwa: jezyk === "en" ? STAGE_NAMES_EN[s.id] ?? s.name : s.name,
      status: jezyk === "en" ? STATUS_WORDS_EN[s.status] ?? s.status : s.status.toLowerCase(),
      znak: look.mark,
      kolor: INK.light[LIGHT_OF_ITEM[look.item] ?? "muted"],
    };
  };

  const running = items.find((it) => it.status === "running");
  const next = items.find((it) => it.status === "pending");
  const kontekst = { ...SAMPLE_CONTEXT, kolor: ink[inkOf(leftColor((100 * (SAMPLE_CONTEXT.prog - SAMPLE_CONTEXT.uzyte)) / SAMPLE_CONTEXT.prog))] };

  // The three bars in the order and words the app shows them (screenshot 2026-10-16): plan,
  // progress, cache. Every bar carries every section key; the ones it does not draw are false.
  const paski = [
    {
      klucz: "plan", etykieta: BAND.panel.label,
      plan: { nazwa: `PLATNOSCI · ${current.id}`, status: current.status, etap: current.name },
      postep: false, cache: false,
      liczba: `${closed}/${stages.length}`, jednostka: "etapów",
    },
    {
      klucz: "postep", etykieta: BAND.progress.label,
      plan: false,
      postep: {
        segmenty: items.map((it) => ({ kolor: ink[STEP_STATES[it.status]] })),
        biezacy: running.name,
        nastepny: `następny: ${next.name}`,
        przycisk: "Rozwiń",
      },
      cache: false,
      liczba: `${done}/${items.length}`, jednostka: "punktów",
    },
    {
      klucz: "cache", etykieta: BAND.cache.label,
      plan: false, postep: false,
      cache: { baterie: SAMPLE_CACHE.map((b) => ({ ...b, kolor: ink[inkOf(leftColor(b.zostalo))] })), kontekst },
      liczba: SAMPLE_COST, jednostka: "sesja",
    },
  ];

  const kolory = {
    tekst: ink.text, wyciszony: ink.muted, linia: ink.rule, tor: ink.track, w_toku: ink.running,
    karta: APP_SURFACES.karta, okno: APP_SURFACES.okno, prompt: APP_SURFACES.prompt,
  };
  const opis = {
    pl: "Makieta trzech pasków RelAI nad promptem na danych przykładowych: plan, postęp etapu i cache z limitami.",
    en: "Mock-up of the RelAI bars above the prompt on sample data: plan, stage progress and cache with limits.",
  };
  const forLanguage = (jezyk) => ({
    opis: opis[jezyk],
    kolory,
    plan: { status: planStatus, etapy: stages.map((s) => stageRow(s, jezyk)) },
    paski,
  });
  return { pl: forLanguage("pl"), en: forLanguage("en") };
}

export async function main(repoRoot = DEFAULT_ROOT) {
  try {
    const makiety = buildMakiety(await loadCore(repoRoot));
    const text = JSON.stringify(makiety, null, 2) + "\n";
    const path = join(repoRoot, OUTPUT);
    const same = existsSync(path) && readFileSync(path, "utf8") === text;
    if (!same) writeFileSync(path, text);
    console.log(`${same ? "bez zmian" : "zapisano"} ${OUTPUT}`);
    return 0;
  } catch (err) {
    console.error(err.message);
    return 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main();
}
