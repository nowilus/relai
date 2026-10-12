// RelAI film: the manifest of facts (plan FILM_PREZENTACYJNY, E2) — every figure scenes 1 and 3–6
// show, counted from its source by this script, never copied from STATE.md. Each fact is
// { wartosc, zrodlo }, the same shape as paski.json. A fact that does not live in the repository
// (the 5 h window of the plan limit) is taken from the screenshot paski.json was transcribed from.
//
// Run before every render, after skrypty/dane.mjs (npm run przygotuj): writes src/dane/manifest.json.
// It runs the core test suite to count its tests (~46 s).

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FORMS } from '../../../../../core/panel/commands.mjs';
import { DEFAULT_THRESHOLD } from '../../../../../core/panel/limit-threshold.mjs';
import { BAND } from '../../../../../core/panel/theme.mjs';
import { REPO, repoReader, OUT as PASKI } from './dane.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const OUT = join(HERE, '../src/dane/manifest.json');

/** The core suite of the repository, as in the stage prompts ("Testy rdzenia"). */
export const CORE_TEST_GLOBS = Object.freeze([
  'core/process/tests', 'core/guardrails/tests', 'core/panel/tests', 'adapters/codex/tests',
]);

/** The tools RelAI has an adapter for, by the adapter's folder; an unknown folder stops the script. */
const TOOL_NAMES = Object.freeze({ 'claude-code': 'Claude Code', codex: 'Codex', cursor: 'Cursor' });

/** The words a closed plan's STATUS.md carries in its first lines (SPEC_STATUS, closed list). */
const CLOSED = /\*\*(?:ZREALIZOWANY|CZĘŚCIOWO ZREALIZOWANY|ZAMKNIĘTY)\b/;

/** @param {unknown} wartosc @param {string} zrodlo */
const fact = (wartosc, zrodlo) => ({ wartosc, zrodlo });

/**
 * The manifest from the texts and folders of the repository. Pure: the caller reads the files and
 * runs the tests (the test of facts feeds changed copies through the same function).
 * @param {{
 *   readText: (repoPath: string) => string | null,
 *   listDirs: (repoPath: string) => string[],
 *   listFiles: (repoPath: string) => string[],
 *   coreTests: () => number,
 * }} input
 */
export function manifest({ readText, listDirs, listFiles, coreTests }) {
  const need = (/** @type {string} */ p) => {
    const t = readText(p);
    if (t === null) throw new Error(`cannot read ${p}`);
    return t;
  };

  const plugin = JSON.parse(need('.claude-plugin/plugin.json'));
  if (typeof plugin.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(plugin.version)) throw new Error(`plugin.json has no version: ${plugin.version}`);

  const commandFiles = listFiles('adapters/claude-code/commands').filter((f) => f.endsWith('.md'));
  if (commandFiles.length !== FORMS.length) throw new Error(`commands: ${commandFiles.length} files, ${FORMS.length} forms in core/panel/commands.mjs`);

  const archived = listDirs('docs/archiwum/plany');
  const closed = archived.filter((p) => {
    const status = readText(`docs/archiwum/plany/${p}/STATUS.md`);
    return status !== null && CLOSED.test(status.split(/\r?\n/).slice(0, 4).join('\n'));
  });
  if (closed.length !== archived.length) throw new Error(`archived plans without a closing status: ${archived.filter((p) => !closed.includes(p)).join(', ')}`);

  const adapters = listDirs('adapters');
  const unknown = adapters.filter((a) => !(a in TOOL_NAMES));
  if (unknown.length > 0) throw new Error(`adapters without a tool name: ${unknown.join(', ')}`);

  const readme = need('README.md').split(/\r?\n/);
  const install = ['claude plugin marketplace add ', 'claude plugin install relai@'].map((start) => {
    const line = readme.find((l) => l.startsWith(start));
    if (!line) throw new Error(`README.md has no line starting "${start}"`);
    return line.trim();
  });

  const paski = JSON.parse(need(PASKI_REPO_PATH));
  const five = paski.cache.miary.find((/** @type {{ klucz: string }} */ m) => m.klucz === 'limit5h');
  const window = /^limit (\S+ h)$/.exec(five?.etykieta?.wartosc ?? '')?.[1];
  if (!window) throw new Error('paski.json has no "limit … h" label for the 5 h window');

  return {
    wersja: fact(plugin.version, '.claude-plugin/plugin.json, pole version'),
    komendy: fact(commandFiles.length, 'adapters/claude-code/commands/*.md, liczba plików (zgodna z FORMS w core/panel/commands.mjs)'),
    planyZamkniete: fact(closed.length, 'docs/archiwum/plany/*/STATUS.md ze statusem ZREALIZOWANY, CZĘŚCIOWO ZREALIZOWANY albo ZAMKNIĘTY'),
    testyRdzenia: fact(coreTests(), `node --test ${CORE_TEST_GLOBS.map((g) => `${g}/*.test.js`).join(' ')}, liczba testów zaliczonych przy zerze niezaliczonych`),
    narzedzia: fact(adapters.length, 'adapters/*/, liczba adapterów'),
    narzedziaNazwy: fact(adapters.map((a) => TOOL_NAMES[/** @type {keyof typeof TOOL_NAMES} */ (a)]), 'adapters/*/, nazwy narzędzi adapterów'),
    paski: fact(Object.keys(BAND).length, 'core/panel/theme.mjs, liczba pasm BAND'),
    progLimitu: fact(DEFAULT_THRESHOLD, 'core/panel/limit-threshold.mjs, DEFAULT_THRESHOLD (próg domyślny okna 5 h)'),
    oknoLimitu: fact(window, `${five.etykieta.zrodlo}, etykieta „${five.etykieta.wartosc}” przez paski.json`),
    instalacja: fact(install, 'README.md, linie instalacji'),
  };
}

const PASKI_REPO_PATH = 'docs/zasoby/film/zrodla/src/dane/paski.json';
if (resolve(REPO, PASKI_REPO_PATH) !== resolve(PASKI)) throw new Error('paski.json is not where the manifest reads it');

/** Runs the core suite and returns the number of passed tests; any failure stops the script. */
export function runCoreTests(root = REPO) {
  const files = CORE_TEST_GLOBS.flatMap((dir) =>
    readdirSync(join(root, dir)).filter((f) => f.endsWith('.test.js')).map((f) => `${dir}/${f}`));
  // run from inside `node --test` (the test of facts), the child would report to the parent's
  // runner instead of printing its summary: it gets an environment without the parent's context
  const { NODE_TEST_CONTEXT: _parent, ...env } = process.env;
  const run = spawnSync(process.execPath, ['--test', '--test-reporter=spec', ...files], { cwd: root, env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const out = `${run.stdout}\n${run.stderr}`;
  const num = (/** @type {string} */ name) => Number(new RegExp(`^ℹ ${name} (\\d+)`, 'm').exec(out)?.[1] ?? NaN);
  const pass = num('pass');
  const fail = num('fail');
  if (run.status !== 0 || fail !== 0 || !Number.isInteger(pass) || pass === 0) throw new Error(`core tests: exit ${run.status}, pass ${pass}, fail ${fail}`);
  return pass;
}

/** The folders (or the files) of a folder in the working tree, relative to the repository root. */
export function dirLister(root = REPO, dirs = true) {
  return (/** @type {string} */ repoPath) => readdirSync(join(root, repoPath), { withFileTypes: true })
    .filter((e) => (dirs ? e.isDirectory() : e.isFile()))
    .map((e) => e.name)
    .sort();
}

export function fromRepo(root = REPO, coreTests = () => runCoreTests(root)) {
  return manifest({ readText: repoReader(root), listDirs: dirLister(root), listFiles: dirLister(root, false), coreTests });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const data = fromRepo();
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');
  process.stdout.write(`manifest.json: ${Object.keys(data).length} faktów (RelAI ${data.wersja.wartosc}, ${data.komendy.wartosc} komend, ${data.planyZamkniete.wartosc} planów, ${data.testyRdzenia.wartosc} testów)\n`);
}
// read once more by the test of facts: the file as written (no dates inside, so a second run equals it)
export const saved = () => JSON.parse(readFileSync(OUT, 'utf8'));
