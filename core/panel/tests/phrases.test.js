'use strict';

// Frazy sesji i sciaga w panelu (plan PANEL_CLAUDE, E2). Zrodlo to docs/KOMENDY.md projektu.
// Kontrola na calej rodzinie dokumentow z ta tabela: KOMENDY.md repo, przyklad w specyfikacji
// i jej kopia lokalna; liczba wierszy tabeli liczona osobno, odrzuconych 0.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const p = require('../phrases.mjs');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const FAMILY = ['docs/KOMENDY.md', 'core/templates/SPEC_KOMENDY.md', '.claude/relai/templates/SPEC_KOMENDY.md'];

// Table rows under a heading, counted independently of the parser: from the heading to the next "## "
function countRows(text, heading) {
  const all = text.split(/\r?\n/);
  const start = all.findIndex((l) => l.trim() === heading);
  if (start < 0) return 0;
  let n = 0;
  for (const l of all.slice(start + 1)) {
    if (l.startsWith('## ')) break;
    if (l.trim().startsWith('|')) n += 1;
  }
  return Math.max(0, n - 2);
}

test('the whole family of KOMENDY documents parses: every phrase and command row, none rejected', () => {
  const seen = FAMILY.filter((f) => fs.existsSync(path.join(ROOT, f)));
  assert.ok(seen.includes('docs/KOMENDY.md'), 'docs/KOMENDY.md missing: nothing to check');
  for (const f of seen) {
    const text = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const s = p.parseSheet(text);
    const phraseRows = countRows(text, '## Frazy, które działają');
    const commandRows = countRows(text, '## Komendy');
    assert.equal(s.reason, null, f);
    assert.equal(s.rejected, 0, `${f}: rejected ${s.rejected}`);
    assert.equal(s.phrases.length, phraseRows, `${f}: ${s.phrases.length} phrases of ${phraseRows} rows`);
    assert.equal(s.commands.length, commandRows, `${f}: ${s.commands.length} commands of ${commandRows} rows`);
    assert.ok(phraseRows > 0 && commandRows > 0, `${f}: an empty table would pass on nothing`);
  }
});

test('the repo sheet: the four session actions with their exact phrases, templates marked', () => {
  const s = p.parseSheet(fs.readFileSync(path.join(ROOT, 'docs/KOMENDY.md'), 'utf8'));
  const first = s.phrases.map((x) => x.phrase);
  for (const want of ['kończymy na dziś', 'kontynuujemy pracę', 'sprawdź status']) assert.ok(first.includes(want), want);
  assert.deepEqual(s.phrases.find((x) => x.phrase === 'sprawdź status')?.phrases, ['sprawdź status', 'status check']);
  const broken = s.phrases.find((x) => x.phrase.startsWith('coś nie działa'));
  assert.equal(broken?.isTemplate, true);
  assert.deepEqual(broken?.phrases, ['coś nie działa — …'], 'the example in parentheses is not a phrase');
  assert.equal(s.phrases.find((x) => x.phrase === 'sprawdź status')?.isTemplate, false);
  assert.ok(s.commands.some((r) => r.command === 'relai-stage' && r.forms.includes('/relai-stage E5')));
});

test('a template is sent only completed, the ellipsis replaced in place', () => {
  const t = (/** @type {string} */ phrase) => ({ phrases: [phrase], phrase, isTemplate: phrase.includes('…'), effect: '' });
  assert.deepEqual(p.buildPhrase(t('sprawdź status'), ''), { isOk: true, text: 'sprawdź status', error: null });
  assert.equal(p.buildPhrase(t('coś nie działa — …'), 'npm test pada').text, 'coś nie działa — npm test pada');
  assert.equal(p.buildPhrase(t('przygotuj plan…'), 'migracji bazy').text, 'przygotuj plan migracji bazy');
  assert.equal(p.buildPhrase(t('jutro wdrażamy … na produkcję'), 'sklep').text, 'jutro wdrażamy sklep na produkcję');
  assert.equal(p.buildPhrase(t('przygotuj plan…'), '  ').isOk, false);
  assert.equal(p.buildPhrase(t('przygotuj plan…'), 'a\nb').isOk, false);
});

test('search, an unreadable file and a file without the sections', () => {
  const s = p.parseSheet(fs.readFileSync(path.join(ROOT, 'docs/KOMENDY.md'), 'utf8'));
  const hit = p.searchSheet(s, 'ZIP');
  assert.deepEqual(hit.commands.map((r) => r.command), ['relai-backup']);
  assert.equal(p.searchSheet(s, '').commands.length, s.commands.length);
  assert.equal(p.searchSheet(s, 'nie-ma-takiego-tekstu').phrases.length, 0);
  assert.match(p.parseSheet(null).reason ?? '', /nie można odczytać/);
  assert.match(p.parseSheet('# KOMENDY\n\n## Inne\n').reason ?? '', /bez sekcji/);
  assert.equal(p.parseSheet('## Frazy, które działają\n\n| a | b |\n|---|---|\n| bez cudzysłowu | x |\n').rejected, 1);
});
