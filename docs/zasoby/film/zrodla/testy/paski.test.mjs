// The film shows only figures that can be pointed at (plan FILM_PREZENTACYJNY, section 1). These
// tests hold src/dane/paski.json to its sources: the plan and progress bars to core/panel on the
// repository as it is, the cache bar to the pixels of the screenshot it was transcribed from.
// Run after `npm run dane` (npm test does not regenerate the file: that would test nothing).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fromRepo, paski, repoReader, REPO, OUT, CACHE_SOURCE } from '../skrypty/dane.mjs';
import { readPng } from './png.mjs';

const saved = JSON.parse(readFileSync(OUT, 'utf8'));

test('the plan and progress bars of paski.json equal core/panel on the current repository', async () => {
  const now = await fromRepo();
  assert.deepEqual(saved.plan, now.plan);
  assert.deepEqual(saved.postep, now.postep);
});

test('positive control: a STATUS.md copy with another stage status gives other bars, and the comparison sees it', async () => {
  const read = repoReader();
  const statusPath = 'docs/' + saved.plan.plan.zrodlo.split(' + ')[1].split(' ')[0].replace(/^docs\//, '');
  const status = read(statusPath);
  assert.ok(status, `cannot read ${statusPath}`);
  const row = status.split(/\r?\n/).find((l) => l.startsWith(`| ${saved.plan.etap.wartosc} |`));
  assert.ok(row, 'the stage row of the filmed stage is in STATUS.md');
  // the test sets its own starting state (L-0150): a status other than the one the stage has now
  const other = saved.plan.status.wartosc === 'W TOKU' ? 'GOTOWY DO STARTU' : 'W TOKU';
  const changed = status.replace(row, row.replace(`| ${saved.plan.status.wartosc} |`, `| ${other} |`));
  assert.notEqual(changed, status, 'the copy really differs');
  const claudeMd = read('CLAUDE.md');
  const recomputed = await paski({ claudeMd, readText: (p) => (p === statusPath ? changed : read(p)) });
  assert.notDeepEqual({ plan: recomputed.plan, postep: recomputed.postep }, { plan: saved.plan, postep: saved.postep });
});

/** Paths of the figures with no source: a fact without zrodlo, or a bare value outside any fact. */
function unsourced(data) {
  /** @type {string[]} */
  const missing = [];
  const walk = (node, path) => {
    // a fact is { wartosc, zrodlo } and nothing else; a measure also has a field named wartosc
    const isFact = node && typeof node === 'object' && !Array.isArray(node) && 'wartosc' in node
      && Object.keys(node).every((k) => k === 'wartosc' || k === 'zrodlo');
    if (isFact) {
      if (typeof node.zrodlo !== 'string' || node.zrodlo.trim() === '') missing.push(path);
      return;
    }
    if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) if (k !== 'klucz') walk(v, `${path}.${k}`);
      return;
    }
    missing.push(path);
  };
  walk(data, '$');
  return missing;
}

test('every figure of paski.json carries a source', () => {
  assert.deepEqual(unsourced(saved), []);
  // positive control: a copy with one source dropped and one bare figure is caught twice
  const broken = structuredClone(saved);
  delete broken.cache.miary[1].zostalo.zrodlo;
  broken.plan.extra = 7;
  assert.deepEqual(unsourced(broken), ['$.plan.extra', '$.cache.miary.1.zostalo']);
  for (const m of saved.cache.miary) {
    for (const f of ['etykieta', 'wartosc', 'zostalo']) assert.ok(m[f].zrodlo.startsWith(CACHE_SOURCE), `${m.klucz}.${f}`);
  }
  assert.ok(saved.cache.koszt.zrodlo.startsWith(CACHE_SOURCE));
});

test('the cache bar says what the screenshot says, word for word', () => {
  // read by eye from the screenshot, 2026-10-12 (E1); the pixel test below checks the batteries
  assert.deepEqual(
    saved.cache.miary.map((m) => [m.etykieta.wartosc, m.wartosc.wartosc]),
    [['cache', '~56 min'], ['limit 5 h', '19 %'], ['reset za', '4 h 01 min'], ['limit tygodnia', '45 %'], ['kontekst', '268k']],
  );
  assert.equal(saved.cache.koszt.wartosc, '$22.95');
});

// The five battery icons of the cache bar on the screenshot: their left edges on the row through
// their middle (found 2026-10-12 by dumping the pixels of that row).
const ROW = 173;
const ICONS = [195, 402, 620, 886, 1152];

/** How many pixels of the fill a battery shows, antialiased edges counted by their share. */
function fillWidth(png, sx) {
  const [bgR, bgG] = png.rgb(sx, ROW);
  const [fR, fG] = png.rgb(sx + 15, ROW);
  const span = fG - fR - (bgG - bgR);
  let sum = 0;
  for (let x = sx; x < sx + 40; x++) {
    const [r, g] = png.rgb(x, ROW);
    const t = (g - r - (bgG - bgR)) / span;
    if (t > 0.02) sum += Math.min(1, t);
  }
  return sum;
}

/** The largest gap between the drawn shares and the shares the data claims (scale-free). */
function worstGap(widths, left) {
  const w = widths.reduce((a, b) => a + b, 0);
  const l = left.reduce((a, b) => a + b, 0);
  return Math.max(...widths.map((x, i) => Math.abs(x / w - left[i] / l)));
}

test('the share left in each battery of paski.json is the share drawn on the screenshot', () => {
  const png = readPng(join(REPO, CACHE_SOURCE));
  const widths = ICONS.map((sx) => fillWidth(png, sx));
  const left = saved.cache.miary.map((m) => m.zostalo.wartosc);
  assert.ok(widths.every((x) => x > 5), `every icon has a fill: ${widths.map((x) => x.toFixed(2)).join(', ')}`);
  assert.ok(worstGap(widths, left) < 0.012, `gap ${worstGap(widths, left).toFixed(4)}; drawn ${widths.map((x) => x.toFixed(2)).join(', ')}`);
  // positive control: the context battery said 60 % left instead of 73.2 % must fail the same check
  const wrong = left.map((v, i) => (i === 4 ? 60 : v));
  assert.ok(worstGap(widths, wrong) >= 0.012, `the check must see a wrong share: gap ${worstGap(widths, wrong).toFixed(4)}`);
});
