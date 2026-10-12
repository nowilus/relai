// RelAI film: the data of the "Panel" scene (plan FILM_PREZENTACYJNY, E3).
//
// Two kinds of value. The stages of the active plan are read from this repository by the same code
// as the real panel (core/panel/plan-state.mjs, read-only). The figures of a session — costs,
// calls, documents changed, the price list — do not live in the repository (case b2 of the plan):
// they are transcribed, word for word, from the screenshots of relai-panel 0.14 taken by Łukasz on
// 2026-10-12 and carry the screenshot as their source. Every leaf is { wartosc, zrodlo }.
// `cytat` holds lines of a file quoted by the diff view: a quotation, not facts the film may reuse.
//
// Run before every render (npm run panel); writes src/dane/panel.json.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseActivePlan, parseStatus } from '../../../../../core/panel/plan-state.mjs';
import { REPO } from './dane.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const OUT = join(HERE, '../src/dane/panel.json');

const SHOTS = 'docs/zasoby/PANEL_RELAI/zrzuty';
export const SHOT = Object.freeze({
  komendy: `${SHOTS}/01-komendy-teraz.png`,
  mapa: `${SHOTS}/03-mapa.png`,
  kafle: `${SHOTS}/04-dokumenty-kafle.png`,
  podglad: `${SHOTS}/05-dokumenty-podglad.png`,
  koszty: `${SHOTS}/06-koszty.png`,
  cennik: `${SHOTS}/07-koszty-cennik.png`,
});
const DAY = 'relai-panel 0.14.0, zrzut Łukasza z 2026-10-12';
const PANE_COSTS = 'panel/hooks/pane-costs.tsx';

/** @param {unknown} wartosc @param {string} zrodlo */
const fact = (wartosc, zrodlo) => ({ wartosc, zrodlo });
/** A value read off a screenshot. @param {unknown} wartosc @param {keyof typeof SHOT} shot */
const shot = (wartosc, shot) => fact(wartosc, `${SHOT[shot]} (${DAY})`);

/** The costs of the map, by stage id, as the screenshot shows them; a stage not listed: none. */
const STAGE_COSTS = Object.freeze({ E1: '$10.95', E2: '$4.96', E3: '$1.41' });

/**
 * The scene's data. Pure: the caller reads the files.
 * @param {{ claudeMd: string, readText: (repoPath: string) => string | null }} input
 */
export function panel({ claudeMd, readText }) {
  const active = parseActivePlan(claudeMd);
  if (active.kind !== 'plan') throw new Error(`no active plan to film: ${JSON.stringify(active)}`);
  const statusPath = 'docs/' + active.statusPath.replace(/^docs\//, '');
  const statusMd = readText(statusPath);
  if (statusMd === null) throw new Error(`cannot read ${statusPath}`);
  const { planStatus, stages } = parseStatus(statusMd);
  if (stages.length === 0) throw new Error(`${statusPath} has no stage table`);
  const fromStatus = `${statusPath} przez core/panel/plan-state.mjs`;
  const costsLine = readText(PANE_COSTS)?.split('\n').find((l) => l.includes("'pr-net'"));
  const network = costsLine?.match(/'pr-net', '([^']+)'/)?.[1];
  if (!network) throw new Error(`${PANE_COSTS} has no line 'pr-net'`);

  return {
    mapa: {
      plan: fact(active.plan, fromStatus),
      statusPlanu: fact(planStatus, fromStatus),
      etapy: fact(stages.map((s) => ({ id: s.id, nazwa: s.name, status: s.status })), fromStatus),
      kosztyEtapow: shot(STAGE_COSTS, 'mapa'),
      kosztSesji: shot('$1.41', 'mapa'),
      kosztPlanu: shot('$17.32', 'mapa'),
      zwiniete: shot([
        ['Inne plany', '1 plan · $87.23'],
        ['Przebiegi załogi', 'brak przebiegów'],
        ['Poza etapem', '$171.03 · 1446 wywołań'],
        ['Archiwum planów', '11 planów zamkniętych · $124.81 (częściowo)'],
      ], 'mapa'),
    },
    dokumenty: {
      naglowek: shot('Zmienione · 3 · 1 w tej turze', 'kafle'),
      kafle: shot([
        { nazwa: 'STATUS.md', typ: 'MD', opis: '2,4 KB · dziś 16:53', plus: '+2', minus: '−1', turaTa: true },
        { nazwa: 'PLAN.html', typ: 'HTML', opis: '230,4 KB · dziś 08:15', plus: '+1', minus: '−1', turaTa: false },
        { nazwa: 'STATUS.md', typ: 'MD', opis: '3,1 KB · dziś 08:15', plus: '+1', minus: '−0', turaTa: false },
      ], 'kafle'),
      grupy: shot([
        ['Rdzeń', '5 dokumentów'],
        ['Wiedza projektu', '5 dokumentów'],
        ['Plan aktywny', '5 dokumentów · 1 ze zmianami'],
        ['Pozostałe', '26 dokumentów'],
      ], 'kafle'),
      sciezka: shot('docs/plany/FILM_PREZENTACYJNY/STATUS.md', 'podglad'),
      opis: shot('2,4 KB · edytowany dziś 16:53 · zmieniony w tej turze', 'podglad'),
      cytat: shot([
        { rodzaj: 'hunk', a: '', b: '', tekst: '@@ -6,7 +6,7 @@' },
        { rodzaj: 'ctx', a: '8', b: '8', tekst: '| E2 | Scenariusz i animatik | ZREALIZOWANY 2026-10-12 | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | `/effort medium` |' },
        { rodzaj: 'del', a: '9', b: '', tekst: '| E3 | Sceny 1–3 | GOTOWY DO STARTU | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | `/effort high`; zrzuty referencyjne panelu 0.14 od Łukasza |' },
        { rodzaj: 'add', a: '', b: '9', tekst: '| E3 | Sceny 1–3 | W TOKU | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | `/effort high`; zrzuty referencyjne panelu 0.14 od Łukasza |' },
        { rodzaj: 'ctx', a: '10', b: '10', tekst: '| E4 | Sceny 4–6 | OCZEKUJE | — | `/effort high` |' },
        { rodzaj: 'hunk', a: '', b: '', tekst: '@@ -23,3 +23,4 @@' },
        { rodzaj: 'ctx', a: '25', b: '25', tekst: '- 2026-10-12 — E2 zrealizowany: słownik PL sześciu scen bez cyfr, `scenariusz.ts` (120 s), manifest 10 faktów ze skryptu…' },
        { rodzaj: 'add', a: '', b: '26', tekst: '- 2026-10-12 — E3 rozpoczęty' },
      ], 'podglad'),
    },
    koszty: {
      suma: shot('$2.40', 'koszty'),
      sumaOpis: shot('Suma sesji · 23 wywołania · 2 tury', 'koszty'),
      podpis: shot('hipotetyczny koszt w cenach API, nie rachunek abonamentu', 'koszty'),
      // the share bar's slices in the dollars of the legend (the screenshot's bar is drawn from them)
      udzialy: shot([
        { klucz: 'input', nazwa: 'wejście', opis: '46 · <$0.01', dolary: 0.01 },
        { klucz: 'cacheRead', nazwa: 'odczyt cache', opis: '3.8M · $0.76', dolary: 0.76 },
        { klucz: 'cacheWrite', nazwa: 'zapis cache', opis: '182k · $1.46', dolary: 1.46 },
        { klucz: 'output', nazwa: 'wyjście', opis: '9.0k · $0.18', dolary: 0.18 },
      ], 'koszty'),
      kafle: shot([
        { liczba: '$2.51', nazwa: 'licznik Claude Code' },
        { liczba: '95 %', nazwa: 'wejścia z cache' },
        { liczba: '$586.23', nazwa: 'cały projekt' },
      ], 'koszty'),
      cennik: shot('Cennik z 2026-10-09 · strona cennika Anthropic (platform.claude.com), odczyt 2026-10-09', 'cennik'),
      modele: shot([
        { id: 'claude-opus-5-5', rekordy: '4854 rekordy', koszt: '$461.70' },
        { id: 'claude-fable-5-1', rekordy: '429 rekordów', koszt: '$104.50' },
        { id: 'claude-sonnet-5-5', rekordy: '440 rekordów', koszt: '$20.04' },
      ], 'cennik'),
      siec: fact(network, `${PANE_COSTS}, linia 'pr-net'`),
    },
  };
}

/** Reads the repository's files: the argument of panel() for the render and for the tests. */
export const repoReader = (root = REPO) => (/** @type {string} */ p) => {
  try { return readFileSync(join(root, p), 'utf8'); } catch { return null; }
};

export const fromRepo = (root = REPO) => {
  const read = repoReader(root);
  const claudeMd = read('CLAUDE.md');
  if (claudeMd === null) throw new Error('cannot read CLAUDE.md');
  return panel({ claudeMd, readText: read });
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const data = fromRepo();
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');
  process.stdout.write(`panel.json: ${data.mapa.plan.wartosc}, ${data.mapa.etapy.wartosc.length} etapów, ${data.koszty.modele.wartosc.length} modele cennika\n`);
}
