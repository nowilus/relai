'use strict';

// Dokumenty w panelu RelAI (plan PANEL_CLAUDE, E6, Aneks E): polka kafli z grupami, znacznik
// "zmieniony w tej turze" z toolUses, liczby linii i diff od ostatniego commita przez dwa zamkniete
// argv git, podglad w granicy jednego rysunku silnika.

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');

const doc = require('../documents.mjs');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const git = (argv) => spawnSync(argv[0], argv.slice(1), { cwd: ROOT, encoding: 'utf8' });
// Real material that is in git (L-0156): the tracked documents of this repo
const TRACKED = git(['git', 'ls-files', '--', 'CLAUDE.md', 'AGENTS.md', 'docs']).stdout.split(/\r?\n/).filter((p) => /\.(md|html)$/.test(p));
const files = (paths) => paths.map((p, i) => ({ path: p, bytes: 1000 + i, mtimeMs: 0 }));

test('the shelf: closed groups, the active plan apart, resources and archive folded', () => {
  const s = doc.shelf(files(TRACKED), { planDir: 'docs/plany/PANEL_CLAUDE', changed: [], counts: new Map() });
  const keys = s.groups.map((g) => g.key);
  assert.deepEqual(keys.slice(0, 3), ['core', 'knowledge', 'plan']);
  const core = s.groups.find((g) => g.key === 'core').docs.map((d) => d.path);
  assert.ok(core.includes('CLAUDE.md') && core.includes('docs/STATE.md') && core.includes('docs/USTAWIENIA.md'));
  assert.ok(s.groups.find((g) => g.key === 'knowledge').docs.some((d) => d.path === 'docs/DZIENNIK.md'));
  assert.ok(s.groups.find((g) => g.key === 'plan').docs.some((d) => d.name === 'PLAN.html' && d.ext === 'html'));
  assert.equal(s.groups.find((g) => g.key === 'archive').isFolded, true);
  assert.equal(s.groups.find((g) => g.key === 'core').isFolded, false);
  // Every tracked document is on the shelf exactly once
  assert.equal(s.groups.reduce((n, g) => n + g.docs.length, 0), TRACKED.length);
  assert.deepEqual(s.changed, []);
});

test('changed in the turn and changed since the commit: marked, counted, first in their group', () => {
  const counts = doc.parseNumstat('94\t2\tdocs/DZIENNIK.md\n-\t-\tdocs/zasoby/obraz.html\n1\t0\tdocs/USTAWIENIA.md\nśmieci\n');
  const s = doc.shelf(files(['CLAUDE.md', 'docs/STATE.md', 'docs/USTAWIENIA.md', 'docs/DZIENNIK.md', 'docs/LEKCJE.md']),
    { planDir: null, changed: ['docs/lekcje.md'], counts })
  assert.deepEqual(s.changed.map((d) => d.path), ['docs/LEKCJE.md']);
  const knowledge = s.groups.find((g) => g.key === 'knowledge').docs;
  assert.deepEqual(knowledge.map((d) => d.path), ['docs/LEKCJE.md', 'docs/DZIENNIK.md'], 'the turn first, then uncommitted');
  assert.deepEqual([knowledge[1].added, knowledge[1].removed], [94, 2]);
  assert.equal(knowledge[0].added, null, 'not in numstat: no count, not zero');
  const core = s.groups.find((g) => g.key === 'core').docs;
  assert.deepEqual(core.map((d) => d.path), ['docs/USTAWIENIA.md', 'CLAUDE.md', 'docs/STATE.md']);
  assert.equal(counts.get('docs/zasoby/obraz.html').added, 0, 'a binary counts no lines');
  assert.equal(counts.size, 3, 'a line of another shape is not a file');
});

test('the turn: paths the writing tools named, relative, on Windows; a read or a shell write is not a change', () => {
  const uses = [
    { name: 'Write', input: { file_path: 'C:\\Users\\Lukasz\\Desktop\\RelAI\\docs\\STATE.md', content: 'x' } },
    { name: 'Edit', input: { file_path: 'c:/users/lukasz/desktop/relai/CLAUDE.md' } },
    { name: 'Bash', input: { command: 'printf x >> docs/DZIENNIK.md' } },
    { name: 'Read', input: { file_path: 'C:\\Users\\Lukasz\\Desktop\\RelAI\\docs\\LEKCJE.md' } },
    { name: 'NotebookEdit', input: { notebook_path: 'D:\\inne\\nb.ipynb' } },
    { name: 'Edit', input: {} },
  ];
  assert.deepEqual(doc.changedPaths(uses, 'C:\\Users\\Lukasz\\Desktop\\RelAI'), ['docs/state.md', 'claude.md', 'd:/inne/nb.ipynb']);
});

test('git gets a path only when it is a document of the shelf and a plain path', () => {
  const s = doc.shelf(files(['docs/STATE.md', 'docs/zasoby/Łódź.md']), { planDir: null, changed: [], counts: new Map() });
  const all = s.groups.flatMap((g) => g.docs);
  assert.deepEqual(doc.diffArgv('docs/STATE.md', all), ['git', '-c', 'core.quotepath=false', 'diff', '--no-color', '--no-ext-diff', 'HEAD', '--', 'docs/STATE.md']);
  assert.ok(doc.diffArgv('docs/zasoby/Łódź.md', all), 'Polish letters are a plain path');
  for (const bad of ['docs/OTHER.md', '--output=x.md', 'docs/../../etc.md', 'docs/STATE.md; rm -rf .', 'C:/x/STATE.md']) {
    assert.equal(doc.diffArgv(bad, all), null, bad);
  }
  assert.ok(doc.NUMSTAT_ARGV.every((a) => !a.includes(' ')), 'a fixed argv, no shell');
});

test('the diff of this repo as Code draws it: hunks only, whole hunks within the limit', () => {
  // The material sets itself up: a diff of two hunks, then the real one of a tracked file
  const two = ['diff --git a/x.md b/x.md', 'index 1..2 100644', '--- a/x.md', '+++ b/x.md',
    '@@ -1,2 +1,2 @@', '-stare', '+nowe', ' bez zmian', '@@ -10,1 +10,2 @@', ' a', '+b', ''].join('\n');
  const v = doc.diffView(two);
  assert.equal(v.hunks, 2);
  assert.ok(v.source.startsWith('@@ -1,2 +1,2 @@'));
  assert.ok(!v.source.includes('+++ b/x.md'), 'file headers dropped');
  const one = doc.diffView(two, 30);
  assert.deepEqual([one.hunks, one.shown], [2, 1]);
  assert.ok(one.source.endsWith(' bez zmian'), 'the first hunk whole, the second left out');
  assert.equal(doc.diffView('').isEmpty, true);
  const real = git(doc.diffArgv('docs/STATE.md', doc.shelf(files(['docs/STATE.md']), { planDir: null, changed: [], counts: new Map() }).groups[0].docs));
  assert.equal(real.status, 0);
  const rv = doc.diffView(real.stdout);
  assert.equal(rv.isEmpty, real.stdout.trim() === '', 'the real diff of STATE.md reads as it is');
});

test('diff rows as code review draws them: numbers, markers, counts; beyond the cap counted', () => {
  const src = ['@@ -10,3 +10,4 @@ ## Sekcja', ' bez zmian', '-stare', '+nowe', '+druga', '\\ No newline at end of file', ' koniec'].join('\n');
  const d = doc.diffRows(src);
  assert.deepEqual(d.rows.map((r) => [r.kind, r.old, r.new, r.text]), [
    ['hunk', null, null, '@@ -10,3 +10,4 @@ ## Sekcja'], ['ctx', 10, 10, 'bez zmian'], ['del', 11, null, 'stare'],
    ['add', null, 11, 'nowe'], ['add', null, 12, 'druga'], ['ctx', 12, 13, 'koniec'],
  ]);
  assert.deepEqual([d.added, d.removed, d.hidden], [2, 1, 0]);
  const capped = doc.diffRows(src, 3);
  assert.deepEqual([capped.rows.length, capped.hidden], [3, 3]);
});

test('the preview within one drawing: whole, else the journal from its end, any other from its start', () => {
  assert.deepEqual(doc.previewOf('docs/STATE.md', '# A\n\ntekst'), { text: '# A\n\ntekst', cut: 0, isTail: false });
  const long = Array.from({ length: 40 }, (_, i) => `## Sekcja ${i}\n\n${'x'.repeat(50)}`).join('\n');
  const head = doc.previewOf('docs/LEKCJE.md', long, 500);
  assert.ok(head.text.startsWith('## Sekcja 0') && head.text.length <= 500 && head.cut > 0);
  assert.ok(!head.text.trimEnd().endsWith('## Sekcja'), 'cut at a heading, not in its middle');
  const tail = doc.previewOf('docs/DZIENNIK.md', long, 500);
  assert.equal(tail.isTail, true);
  assert.ok(tail.text.startsWith('## Sekcja') && tail.text.endsWith('x'.repeat(50)));
  assert.ok(tail.text.includes('## Sekcja 39'));
});

test('sizes, last edits and the icon', () => {
  assert.equal(doc.kb(12698), '12,4 KB');
  const now = new Date(2026, 9, 9, 12, 0).getTime();
  assert.equal(doc.edited(new Date(2026, 9, 9, 11, 42).getTime(), now), 'dziś 11:42');
  assert.equal(doc.edited(new Date(2026, 9, 8, 18, 5).getTime(), now), 'wczoraj 18:05');
  assert.equal(doc.edited(new Date(2026, 9, 7, 9, 0).getTime(), now), '07.10');
  assert.equal(doc.edited(new Date(2025, 9, 7, 9, 0).getTime(), now), '07.10.2025');
  const md = doc.docIcon('md', { paper: '#111', edge: '#222', badge: '#333', ink: '#444' }, 48);
  assert.match(md, /width="40" height="48"/);
  assert.ok(!/<text|<style|font-face/.test(md), 'no text and no font in the SVG: the letters are outlines');
  assert.notEqual(md, doc.docIcon('html', { paper: '#111', edge: '#222', badge: '#333', ink: '#444' }, 48));
});

test('the type label on the icon: MD, HTML, PDF… laid out from the font, never wider than the badge', () => {
  const c = { paper: '#111', edge: '#222', badge: '#333', ink: '#444' };
  for (const ext of Object.keys(doc.KINDS)) {
    const svg = doc.docIcon(ext, c, 48);
    const letters = [...svg.matchAll(/<path transform="translate\(([\d.]+) [\d.]+\) scale\(([\d.]+)/g)];
    assert.equal(letters.length, doc.KINDS[ext].label.length, `${ext}: one outline per letter`);
    const first = Number(letters[0][1]);
    assert.ok(first >= 6 + 3 - 1e-6, `${ext}: starts inside the badge (${first})`);
  }
  // The widest label fits: its letters' advances times the size stay within the badge less padding
  const { LABELS } = require('../headings.mjs');
  const em = [...'JSON'].reduce((s, ch) => s + LABELS[ch].advance, 0);
  const json = doc.docIcon('json', c, 48);
  const size = Number(/scale\(([\d.]+)/.exec(json)[1]);
  assert.ok(em * size <= 30 - 6 + 1e-6, `JSON ${em * size} within 24`);
  // Planted defect: a size that would overflow is caught by the same arithmetic
  assert.ok(em * 24 > 30 - 6, 'the check would see a label drawn twice too large');
});

test('kinds: documents and text on the shelf, images, fonts and media off', () => {
  assert.equal(doc.kindOf('PLAN.html'), 'html');
  assert.equal(doc.kindOf('raport.PDF'), 'pdf');
  assert.equal(doc.kindOf('01-inicjalizacja.txt'), 'txt');
  assert.equal(doc.kindOf('ikona.svg'), 'svg');
  for (const off of ['font.woff2', 'film.mp4', 'obraz.png', 'anim.gif', 'bez-rozszerzenia']) assert.equal(doc.kindOf(off), null, off);
  assert.equal(doc.KINDS.pdf.show, 'none');
  assert.equal(doc.KINDS.md.show, 'markdown');
});

test('the explorer tree: folders nested by their own names, subfolders first, edited counts upward', () => {
  const counts = doc.parseNumstat('3\t1\tdocs/plany/P/STATUS.md\n');
  const s = doc.shelf(files(['CLAUDE.md', 'AGENTS.md', 'docs/STATE.md', 'docs/plany/P/STATUS.md', 'docs/plany/P/PLAN.html', 'docs/zasoby/a.txt']),
    { planDir: null, changed: ['claude.md'], counts });
  const t = doc.docTree(s.groups.flatMap((g) => g.docs));
  assert.deepEqual(t.docs.map((d) => d.name), ['AGENTS.md', 'CLAUDE.md']);
  assert.deepEqual(t.folders.map((f) => f.name), ['docs']);
  const docs = t.folders[0];
  assert.deepEqual([docs.dir, docs.folders.map((f) => f.name), docs.docs.map((d) => d.name), docs.edited], ['docs', ['plany', 'zasoby'], ['STATE.md'], 1]);
  const plany = docs.folders[0];
  assert.deepEqual([plany.name, plany.dir, plany.folders[0].name, plany.folders[0].dir], ['plany', 'docs/plany', 'P', 'docs/plany/P']);
  assert.equal(t.edited, 2, 'the root counts CLAUDE.md and STATUS.md below it');
});

test('tree links: a path out and back, any other link is not the tree’s', () => {
  const href = doc.treeHref('doc', 'docs/zasoby/Łódź raport.md');
  assert.ok(href.startsWith('https://relai.invalid/doc/'));
  assert.deepEqual(doc.treeTarget(href), { kind: 'doc', path: 'docs/zasoby/Łódź raport.md' });
  assert.deepEqual(doc.treeTarget(doc.treeHref('dir', 'docs/plany')), { kind: 'dir', path: 'docs/plany' });
  assert.equal(doc.treeTarget('https://example.com/doc/x.md'), null);
  assert.equal(doc.treeTarget('https://relai.invalid/rm/x'), null);
  assert.equal(doc.treeTarget('https://relai.invalid/doc/%E0%A4%A'), null, 'a broken escape is no target');
  const open = doc.folderIcon(true, { fill: '#111', edge: '#222', dot: '#333' }, 20);
  const shut = doc.folderIcon(false, { fill: '#111', edge: '#222', dot: null }, 20);
  assert.notEqual(open, shut);
  assert.ok(open.includes('<circle') && !shut.includes('<circle'), 'the dot only where something is edited');
  assert.match(shut, /width="24" height="20"/);
});

test('edited on top and the tree: the turn first, then uncommitted; the shelf carries the tree', () => {
  const counts = doc.parseNumstat('3\t1\tdocs/plany/P/STATUS.md\n');
  const s = doc.shelf(files(['CLAUDE.md', 'docs/STATE.md', 'docs/plany/P/STATUS.md', 'docs/plany/P/PLAN.html', 'docs/zasoby/a.txt', 'docs/zasoby/font.woff2']),
    { planDir: 'docs/plany/P', changed: ['docs/state.md'], counts });
  assert.deepEqual(s.edited.map((d) => d.path), ['docs/STATE.md', 'docs/plany/P/STATUS.md']);
  /** @param {any} n @returns {any[]} */
  const flat = (n) => [[n.dir, n.docs.length, n.edited], ...n.folders.flatMap(flat)];
  assert.deepEqual(flat(s.tree), [['', 1, 2], ['docs', 1, 2], ['docs/plany', 0, 1], ['docs/plany/P', 2, 1], ['docs/zasoby', 1, 0]],
    'font.woff2 is no document; the counts climb to the root');
});
