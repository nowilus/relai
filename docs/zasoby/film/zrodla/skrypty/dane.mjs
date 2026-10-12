// RelAI film: the data of the "Paski" scene (plan FILM_PREZENTACYJNY, E1).
//
// The plan bar and the progress bar are computed from this repository by the same code as the
// real panel (core/panel/plan-state.mjs and progress.mjs, imported read-only, never copied). The
// cache bar's figures do not live in the repository (case b2 of the plan): they are transcribed
// from the screenshot of the real bars named in CACHE_SOURCE and carry that source. Every leaf of
// the output is { wartosc, zrodlo }: a figure without a source does not reach the frame.
//
// Run before every render (npm run dane); writes src/dane/paski.json.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { planState } from '../../../../../core/panel/plan-state.mjs';
import { stageProgress, promptLink } from '../../../../../core/panel/progress.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const REPO = resolve(HERE, '../../../../..');
export const OUT = join(HERE, '../src/dane/paski.json');

export const CACHE_SOURCE = 'docs/fixy/AUDYT_MODOW/zrzuty/2026-10-11-z1-trzy-paski-0.12.0.png';

/** What the screenshot shows, verbatim, and the share each battery holds (brief v3.6, 10.4). */
const CACHE = Object.freeze([
  { key: 'cache', etykieta: 'cache', wartosc: '~56 min', zostalo: (56 / 60) * 100, jak: 'TTL 60 min założony (tylda na zrzucie); 56 z 60 min' },
  { key: 'limit5h', etykieta: 'limit 5 h', wartosc: '19 %', zostalo: 100 - 19, jak: 'zostało = 100 − zużycie' },
  { key: 'reset', etykieta: 'reset za', wartosc: '4 h 01 min', zostalo: (241 / 300) * 100, jak: '241 z 300 min okna 5 h' },
  { key: 'tydzien', etykieta: 'limit tygodnia', wartosc: '45 %', zostalo: 100 - 45, jak: 'zostało = 100 − zużycie' },
  { key: 'kontekst', etykieta: 'kontekst', wartosc: '268k', zostalo: (1 - 268 / 1000) * 100, jak: 'okno 1M: wypełnienie baterii zmierzone z pikseli zrzutu = 0,730 (kontrola na czterech pozostałych bateriach, rozjazd ≤ 0,01)' },
]);
const COST = Object.freeze({ wartosc: '$22.95', jednostka: 'sesja' });

/** @param {unknown} wartosc @param {string} zrodlo */
const fact = (wartosc, zrodlo) => ({ wartosc, zrodlo });

/**
 * The scene's data from the texts of CLAUDE.md, the active plan's STATUS.md and its stage prompt.
 * Pure: the caller reads the files (the test feeds a changed STATUS.md through the same function).
 * @param {{ claudeMd: string, readText: (repoPath: string) => string | null }} input
 */
export async function paski({ claudeMd, readText }) {
  const plan = await planState(claudeMd, (p) => readText('docs/' + p.replace(/^docs\//, '')));
  if (plan.kind !== 'ok' || !plan.stage) throw new Error(`no active stage to film: ${JSON.stringify(plan)}`);
  const statusPath = 'docs/' + plan.statusPath.replace(/^docs\//, '');
  const statusMd = readText(statusPath);
  const prompt = statusMd === null ? null : promptLink(statusMd, plan.stage.id, statusPath);
  const promptMd = prompt === null ? null : readText(prompt);
  const progress = stageProgress(plan, promptMd, prompt ?? 'prompt');
  if (progress === null) throw new Error('core/panel gave no progress for the stage');

  const fromPlan = `CLAUDE.md + ${statusPath} przez core/panel/plan-state.mjs`;
  const fromPrompt = `${prompt} przez core/panel/progress.mjs`;
  return {
    plan: {
      plan: fact(plan.plan, fromPlan),
      etap: fact(plan.stage.id, fromPlan),
      status: fact(plan.stage.status, fromPlan),
      nazwa: fact(plan.stage.name, fromPlan),
      zamkniete: fact(plan.closed, fromPlan),
      etapy: fact(plan.stages, fromPlan),
    },
    postep: {
      zrobione: fact(progress.done, fromPrompt),
      razem: fact(progress.total, fromPrompt),
      // what the real bar says in words when there is nothing to count (stage not in progress)
      slowa: fact(progress.words, fromPrompt),
      punkty: fact(progress.items.map((it) => ({ status: it.status, nazwa: it.name })), fromPrompt),
    },
    cache: {
      miary: CACHE.map((m) => ({
        etykieta: fact(m.etykieta, CACHE_SOURCE),
        wartosc: fact(m.wartosc, CACHE_SOURCE),
        zostalo: fact(Math.round(m.zostalo * 100) / 100, `${CACHE_SOURCE}; ${m.jak}`),
        klucz: m.key,
      })),
      koszt: fact(COST.wartosc, CACHE_SOURCE),
      kosztJednostka: fact(COST.jednostka, CACHE_SOURCE),
    },
  };
}

/** The files as they are in the working tree, read relative to the repository root. */
export function repoReader(root = REPO) {
  return (/** @type {string} */ repoPath) => {
    try {
      return readFileSync(join(root, repoPath), 'utf8');
    } catch {
      return null;
    }
  };
}

export async function fromRepo(root = REPO) {
  const readText = repoReader(root);
  const claudeMd = readText('CLAUDE.md');
  if (claudeMd === null) throw new Error('cannot read CLAUDE.md');
  return paski({ claudeMd, readText });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const data = await fromRepo();
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');
  process.stdout.write(`paski.json: ${data.plan.plan.wartosc} ${data.plan.etap.wartosc} ${data.plan.status.wartosc}, ${data.postep.zrobione.wartosc}/${data.postep.razem.wartosc} punktów\n`);
}
