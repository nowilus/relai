// RelAI film: the data of scenes 4 and 5, "Etap w nowej sesji" and "Praca wraca" (plan
// FILM_PREZENTACYJNY, E4).
//
// Scene 4's card is computed by the real panel's own function, stageCard() of core/panel/
// decisions.mjs, on STATUS.md and PROMPT_ETAP_4.md as they stood when E4 started (commit START):
// the card Łukasz said "tak" to, unchanged. The plan's metric line carries its model without a
// label; until Aneks F (E7, 2026-10-13) requiredModel() could not read it and the script added the
// label "model wykonawczy:" — the parser reads the line as written now, so the card is the live one.
//
// Scene 5 carries no figure of a session (Łukasz, 2026-10-12): the card's words and buttons are
// read from relai-cache-keeper's code, the threshold is core/panel's default, the save row is the
// one real save on a screenshot (LIMIT_CHECKPOINT E3). Every leaf is { wartosc, zrodlo }.
//
// Run before every render (npm run sceny); writes src/dane/sceny.json.

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stageCard } from '../../../../../core/panel/decisions.mjs';
import { parseStatus } from '../../../../../core/panel/plan-state.mjs';
import { HEADINGS } from '../../../../../core/panel/theme.mjs';
import { DEFAULT_THRESHOLD } from '../../../../../core/panel/limit-threshold.mjs';
import { REPO, repoReader } from './dane.mjs';

const require = createRequire(import.meta.url);
const { sciezkaWznowienia } = require('../../../../../core/process/resume.js');

const HERE = dirname(fileURLToPath(import.meta.url));
export const OUT = join(HERE, '../src/dane/sceny.json');

/** The commit E4 started from: STATUS.md with E4 GOTOWY DO STARTU, its prompt with 16 points. */
export const START = '0dcadef';
const TOPIC = 'FILM_PREZENTACYJNY';
const STAGE = 'E4';
const STATUS = `docs/plany/${TOPIC}/STATUS.md`;
const PROMPT = `docs/plany/${TOPIC}/PROMPT_ETAP_4.md`;
const SESSION_MODEL = 'Opus 5.5'; // the model of the session that started E4, as /model names it
const CARD_ID = 'film-scena-cztery'; // any id the card accepts; the frame never shows it
// the model member of the metric line as the plan writes it: the card's Model row comes from it
const MODEL_AS_WRITTEN = '· Opus 5.5 w Claude Code';

const SAVE_SHOT = 'docs/zasoby/PANEL_RELAI/zrzuty/LIMIT_CHECKPOINT_E3_zapis.png';
const SAVE_ROW = 'zapis gotowy · reset 18.10 12:00';

const PANE_PARTS = 'panel/hooks/pane-parts.tsx';
const LAUNCH = 'panel/hooks/launch.ts';
const LIMIT = 'cache-keeper/hooks/limit.ts';
const HANDOFF = 'cache-keeper/hooks/handoff.ts';
const REGISTER = 'cache-keeper/hooks/register.tsx';
const CHECKPOINT = 'adapters/claude-code/skills/relai-core/limit-checkpoint.md';

/** @param {unknown} wartosc @param {string} zrodlo */
const fact = (wartosc, zrodlo) => ({ wartosc, zrodlo });

/** The text of a repository file at a commit. @param {string} commit @param {string} path */
export const atCommit = (commit, path, root = REPO) =>
  execFileSync('git', ['show', `${commit}:${path}`], { cwd: root, encoding: 'utf8' });

/** One match of `re` in `text` (its first group), or an error naming the file. */
function one(text, re, file) {
  const m = String(text ?? '').match(re);
  if (!m || m[1] === undefined) throw new Error(`${file} has no ${re}`);
  return m[1];
}

/** `export const NAME = '…'` of a TS file, read as text (a plugin's .ts is not the film's code). */
const constOf = (text, name, file) => one(text, new RegExp(`export const ${name} = '([^']+)'`), file);

/**
 * The scenes' data. Pure but for its inputs: the caller reads the files.
 * @param {{ readText: (repoPath: string) => string | null, statusAtStart: string, promptAtStart: string, repoRoot: string }} x
 */
export function sceny({ readText, statusAtStart, promptAtStart, repoRoot }) {
  if (!statusAtStart.includes(MODEL_AS_WRITTEN)) throw new Error(`${STATUS}@${START}: no "${MODEL_AS_WRITTEN}" in the metric line`);
  const result = stageCard({ id: CARD_ID, statusMd: statusAtStart, statusPath: STATUS, promptText: promptAtStart, stage: STAGE, sessionModel: SESSION_MODEL, isFresh: false, isNew: true, via: 'link' });
  if (result.kind !== 'card') throw new Error(`stageCard gave no card: ${JSON.stringify(result)}`);
  const card = result.card;
  const action = card.actions[0];
  if (!action || action.kind !== 'newSession') throw new Error('the card does not open a new session');
  const command = `/${action.command} ${action.args}`;
  const fromCard = `core/panel/decisions.mjs stageCard() na ${STATUS} i ${PROMPT} z commitu ${START} (start E4), sesja ${SESSION_MODEL}, nowa sesja przez link; linia metryczna bez zmian (parser modelu po Aneksie F, 2026-10-13)`;

  const chat = card.facts.find((f) => f.label === 'Czat')?.value ?? '';
  const stays = chat.split('; ').find((p) => p.includes('rozmowa zostaje'));
  if (!stays) throw new Error('the card\'s row Czat does not say the conversation stays');

  const parts = readText(PANE_PARTS);
  const hint = one(parts, /card\.state === 'second' \? '[^']+' : '([^']+)'/, PANE_PARTS);
  const opened = one(readText(LAUNCH), /: `(Otwarto nową sesję z \$\{text\}[^`]+)`/, LAUNCH).replace('${text}', command);
  const heading = HEADINGS.find((h) => h.key === 'confirm')?.text;
  if (!heading) throw new Error('core/panel/theme.mjs HEADINGS has no confirm');

  // the stage once the new session ran the command: /relai-stage sets W TOKU (Krok 5)
  const { stages } = parseStatus(statusAtStart);
  const stage = stages.find((s) => s.id === STAGE);
  if (!stage) throw new Error(`${STATUS}@${START} has no ${STAGE}`);
  const closed = stages.filter((s) => /^(ZREALIZOWANY|POMINIĘTY)/.test(s.status)).length;
  const fromStart = `${STATUS} i ${PROMPT} z commitu ${START} przez core/panel/plan-state.mjs, status W TOKU ustawiany przez /relai-stage w Kroku 5`;

  const limit = readText(LIMIT);
  const over = one(limit, /\? `(Limit planu ponad progiem )\$\{/, LIMIT);
  const ask = one(limit, /'(Pracować dalej czy zapisać pracę teraz\?)'/, LIMIT);
  const handoff = readText(HANDOFF);
  const register = readText(REGISTER);
  const resumeFile = sciezkaWznowienia(repoRoot);
  if (!resumeFile) throw new Error('no resume path for the repository folder');
  const renewed = one(limit, /: '(limit odnowiony · [^']+)'/, LIMIT);
  // the save's steps as the procedure names them; the film shows those that leave a trace (the
  // tests, the commit, the documents, the resume file) — the marker is ZAPIS GOTOWY itself
  const steps = [...String(readText(CHECKPOINT) ?? '').matchAll(/^\d\. \*\*([^*]+)\*\*/gm)].map((m) => m[1] ?? '');
  const shown = steps.filter((s) => /^(Testy|Commit|Dokumenty|Plik wznowienia)/.test(s));
  if (shown.length !== 4) throw new Error(`${CHECKPOINT}: expected 4 steps to show, got ${JSON.stringify(steps)}`);

  return {
    nowaSesja: {
      naglowek: fact(heading, 'core/panel/theme.mjs HEADINGS, klucz confirm'),
      podpis: fact(hint, `${PANE_PARTS}, sekcja confirm`),
      tytul: fact(card.title, fromCard),
      fakty: fact(card.facts.map((f) => ({ etykieta: f.label, wartosc: f.value, ton: f.tone ?? 'zwykly' })), fromCard),
      pytanie: fact(card.question, fromCard),
      komenda: fact(command, `${fromCard}; działanie newSession`),
      otwarto: fact(opened, `${LAUNCH} openedWords(), gałąź link`),
      zostaje: fact(stays, `${fromCard}; wiersz Czat`),
      plan: fact({ plan: TOPIC, etap: stage.id, status: 'W TOKU', nazwa: stage.name, zamkniete: closed, etapy: stages.length }, fromStart),
    },
    pracaWraca: {
      pytanie: fact(`${over}${DEFAULT_THRESHOLD} %.`, `${LIMIT} cardDue(), początek pierwszego zdania; próg core/panel/limit-threshold.mjs DEFAULT_THRESHOLD; bez liczb sesji (decyzja Łukasza 2026-10-12)`),
      dalej: fact(ask, `${LIMIT} cardDue(), ostatnie zdanie karty`),
      opcje: fact([constOf(limit, 'GO_ON', LIMIT), constOf(limit, 'SAVE', LIMIT), constOf(limit, 'MUTE', LIMIT)], `${LIMIT} CARD_OPTIONS`),
      prog: fact(DEFAULT_THRESHOLD, 'core/panel/limit-threshold.mjs DEFAULT_THRESHOLD'),
      fraza: fact(one(handoff, /return \[\s*'([^']+)',/, HANDOFF), `${HANDOFF} relaiSavePrompt(), pierwsza linia`),
      kroki: fact(shown, `${CHECKPOINT}, sekcja „Kroki”`),
      plikWznowienia: fact(resumeFile, 'core/process/resume.js sciezkaWznowienia(korzeń repozytorium)'),
      gotowe: fact(constOf(handoff, 'SAVE_DONE', HANDOFF), `${HANDOFF} SAVE_DONE`),
      zapis: fact(SAVE_ROW, `${SAVE_SHOT} (zapis LIMIT_CHECKPOINT E3, 2026-10-11)`),
      odnowiony: fact(renewed, `${LIMIT} saveRowText(), po resecie z plikiem wznowienia`),
      przyciski: fact([one(register, /label="(Wznów pracę)"/, REGISTER), one(register, /label="(Odrzuć)"/, REGISTER)], `${REGISTER}, przyciski paska cache`),
      wznow: fact(`${constOf(handoff, 'RELAI_CONTINUE', HANDOFF)} — plik wznowienia: ${resumeFile}`, `${HANDOFF} relaiResumePrompt(), pierwsza linia`),
    },
  };
}

export const fromRepo = (root = REPO) =>
  sceny({ readText: repoReader(root), statusAtStart: atCommit(START, STATUS, root), promptAtStart: atCommit(START, PROMPT, root), repoRoot: root });

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const data = fromRepo();
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');
  const model = data.nowaSesja.fakty.wartosc.find((f) => f.etykieta === 'Model');
  process.stdout.write(`sceny.json: ${data.nowaSesja.tytul.wartosc}, ${data.nowaSesja.fakty.wartosc.length} wierszy karty (Model: ${model?.wartosc}), plan ${data.nowaSesja.plan.wartosc.etap} ${data.nowaSesja.plan.wartosc.status}; zapis: ${data.pracaWraca.plikWznowienia.wartosc}\n`);
}
