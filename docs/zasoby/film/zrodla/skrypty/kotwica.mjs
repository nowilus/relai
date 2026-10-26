// RelAI film: the data version of the film (plan PIPELINE_WYDAN E4, branch FILM_TESTY_V3).
//
// The film's data (src/dane/paski.json, panel.json, sceny.json, manifest.json) is counted from the
// repository at ONE commit — the anchor written in src/dane/kotwica.json — never from the working
// tree as it is today. The generators run in a temporary `git worktree` of that commit; the tests
// of the film compute the data again in a worktree of the same commit. An unrelated change made
// after the anchor (a new core test, a stage status) no longer turns the tests red; a change of the
// data or of the anchor does. No anchor, or one git does not know, stops everything loudly.
//
// Run (npm run przygotuj does): `node skrypty/kotwica.mjs` regenerates the data from the anchor it
// finds; `node skrypty/kotwica.mjs --nowa [rev]` first moves the anchor to rev (default HEAD) — the
// only way it moves. The film's code (core/panel imported by the generators) is the working tree's.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REPO } from './dane.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const KOTWICA = join(HERE, '../src/dane/kotwica.json');
const SOURCE = 'git rev-parse przy node skrypty/kotwica.mjs --nowa; dane filmu liczone z git worktree tego commitu';

const git = (/** @type {string[]} */ args, cwd = REPO) =>
  execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

/**
 * The anchor's commit, checked: the file exists, holds { commit: { wartosc, zrodlo } } with a full
 * hash, and git knows that commit. Anything else throws — a missing anchor is never silence.
 * @param {string} path
 * @returns {string}
 */
export function readAnchor(path = KOTWICA) {
  let data;
  try {
    data = JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    throw new Error(`the film's data has no anchor (${path}): ${e instanceof Error ? e.message : e}; run node skrypty/kotwica.mjs --nowa`);
  }
  const commit = data?.commit?.wartosc;
  if (typeof commit !== 'string' || !/^[0-9a-f]{40}$/.test(commit)) throw new Error(`the anchor in ${path} is not a full commit hash: ${JSON.stringify(commit)}`);
  if (typeof data.commit.zrodlo !== 'string' || data.commit.zrodlo.trim() === '') throw new Error(`the anchor in ${path} has no source`);
  try {
    git(['cat-file', '-e', `${commit}^{commit}`]);
  } catch {
    throw new Error(`the anchor ${commit} of ${path} is not a commit of this repository`);
  }
  return commit;
}

/** The full hash of rev; throws when git does not know it. */
export const resolveCommit = (rev = 'HEAD') => git(['rev-parse', '--verify', `${rev}^{commit}`]);

/** Writes the anchor for rev (resolved to its full hash) and returns the hash. */
export function writeAnchor(rev = 'HEAD', path = KOTWICA) {
  const commit = resolveCommit(rev);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify({ commit: { wartosc: commit, zrodlo: SOURCE } }, null, 2) + '\n');
  return commit;
}

/**
 * A temporary worktree of the commit (named with the project's slug, outside the repository) and
 * the way to remove it. The caller removes it in finally / after().
 * @param {string} commit
 */
export function worktreeAt(commit) {
  // the worktree's folder has the repository's own name: scene 5 derives the resume file's slug
  // from it (core/process/resume.js), so a temporary name would change the data from run to run
  const parent = join(tmpdir(), `relai-film-dane-${commit.slice(0, 7)}-${process.pid}-${Date.now()}`);
  const root = join(parent, basename(REPO));
  // the commit's bytes as committed (LF): with core.autocrlf=true (Git for Windows' default) a
  // checkout gets CRLF and two parity tests of the core suite count other sums than the source's
  // cleanup is best-effort step by step: a locked file on Windows must not leave the folder, the
  // worktree entry or the caller's own error behind (review of E4)
  const cleanup = () => {
    try { git(['worktree', 'remove', '--force', root]); } catch { /* the folder goes below anyway */ }
    rmSync(parent, { recursive: true, force: true });
    try { git(['worktree', 'prune']); } catch { /* nothing registered */ }
  };
  try {
    git(['-c', 'core.autocrlf=false', 'worktree', 'add', '--detach', '--quiet', root, commit]);
  } catch (e) {
    cleanup();
    throw e;
  }
  let removed = false;
  return {
    root,
    remove() {
      if (removed) return;
      removed = true;
      cleanup();
    },
  };
}

/** Runs fn(root) in a worktree of the anchor and removes the worktree afterwards. */
export async function atAnchor(fn, commit = readAnchor()) {
  const tree = worktreeAt(commit);
  try {
    return await fn(tree.root, commit);
  } finally {
    tree.remove();
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const at = args.indexOf('--nowa');
  // a new anchor is written only after all four files are computed (review of E4): a failure on
  // the way leaves the old anchor and the old data together
  const target = at >= 0 ? resolveCommit(args[at + 1] ?? 'HEAD') : readAnchor();
  // imported here, not at the top: each module checks paths at load time against REPO
  const dane = await import('./dane.mjs');
  const panel = await import('./panel.mjs');
  const sceny = await import('./sceny.mjs');
  const manifest = await import('./manifest.mjs');
  const write = (/** @type {string} */ out, /** @type {unknown} */ data) => {
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, JSON.stringify(data, null, 2) + '\n');
  };
  await atAnchor(async (root, commit) => {
    const p = await dane.fromRepo(root);
    const pn = panel.fromRepo(root);
    const sc = sceny.fromRepo(root);
    const m = manifest.fromRepo(root);
    write(dane.OUT, p);
    write(panel.OUT, pn);
    write(sceny.OUT, sc);
    write(manifest.OUT, m);
    if (at >= 0) process.stdout.write(`kotwica: ${writeAnchor(commit)}\n`);
    process.stdout.write(`dane filmu z ${commit.slice(0, 7)}: ${p.plan.plan.wartosc} ${p.plan.etap.wartosc} ${p.plan.status.wartosc}; RelAI ${m.wersja.wartosc}, ${m.komendy.wartosc} komend, ${m.planyZamkniete.wartosc} planów, ${m.testyRdzenia.wartosc} testów\n`);
  }, target);
}
