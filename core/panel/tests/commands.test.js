'use strict';

// Formularze 15 komend RelAI w panelu (plan PANEL_CLAUDE, E2).
// Kontrola na realnym materiale: naglowki YAML wszystkich komend w adapters/claude-code/commands/
// paruja sie z formularzami jeden do jednego; liczby w komunikatach sa liczone, nie wpisane.
// Druga strona: podlozony rozjazd argument-hint i komenda bez formularza sa odrzucane.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const c = require('../commands.mjs');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const COMMANDS = path.join(ROOT, 'adapters', 'claude-code', 'commands');

function repoHeaders() {
  const files = fs.readdirSync(COMMANDS).filter((n) => n.endsWith('.md')).sort();
  const headers = files.map((n) => c.parseHeader(fs.readFileSync(path.join(COMMANDS, n), 'utf8'), n.replace(/\.md$/, '')));
  return { files, headers };
}

test('every command header of the repo has its form and every form its header', () => {
  const { files, headers } = repoHeaders();
  const unreadable = files.filter((_, i) => headers[i] === null);
  assert.deepEqual(unreadable, [], 'headers without YAML: ' + unreadable.join(', '));
  const r = c.checkForms(/** @type {any} */ (headers));
  assert.deepEqual(r.rejected, [], `rejected ${r.rejected.length} of ${r.headers} headers`);
  assert.equal(r.paired, files.length, `paired ${r.paired} of ${files.length} command files`);
  assert.equal(c.FORMS.length, files.length, `forms ${c.FORMS.length}, command files ${files.length}`);
  assert.ok(files.length > 0, 'the command folder is empty: the check would pass on nothing');
});

test('a changed argument-hint, a command without a form and a form without a command are rejected (planted)', () => {
  const { headers } = repoHeaders();
  const real = /** @type {any[]} */ (headers);
  const changed = real.map((h) => (h.command === 'relai-tour' ? { ...h, argumentHint: '[krotko|dlugo] — inna podpowiedź' } : h));
  const extra = [...real, { command: 'relai-new', description: 'x', argumentHint: '' }];
  const missing = real.filter((h) => h.command !== 'relai-models');
  assert.deepEqual(c.checkForms(changed).rejected.map((x) => x.command), ['relai-tour']);
  assert.deepEqual(c.checkForms(extra).rejected.map((x) => x.command), ['relai-new']);
  assert.deepEqual(c.checkForms(missing).rejected.map((x) => x.command), ['relai-models']);
});

test('header parsing: quotes stripped, empty hint, CRLF, no header', () => {
  const h = c.parseHeader('---\r\ndescription: "Opis: z dwukropkiem"\r\nargument-hint: ""\r\n---\r\n# x', 'relai-x');
  assert.deepEqual(h, { command: 'relai-x', description: 'Opis: z dwukropkiem', argumentHint: '' });
  assert.equal(c.parseHeader('# bez nagłówka', 'relai-x'), null);
});

test('the exact command text: options, bare command, the session name', () => {
  const tour = c.formOf('relai-tour');
  assert.ok(tour);
  assert.equal(c.buildCommand(tour, { length: 'krotko' }).text, '/relai-tour krotko');
  assert.equal(c.buildCommand(tour, {}, 'relai:relai-tour').text, '/relai:relai-tour');
  assert.equal(c.buildCommand(tour, { length: 'krotko' }, 'relai:relai-tour').text, '/relai:relai-tour krotko');
  const stage = /** @type {any} */ (c.formOf('relai-stage'));
  assert.equal(c.buildCommand(stage, { topic: 'PANEL_CLAUDE', stage: 'E3' }).text, '/relai-stage PANEL_CLAUDE E3');
  assert.equal(c.buildCommand(stage, { stage: ' E5 ' }).text, '/relai-stage E5');
  assert.equal(c.buildCommand(/** @type {any} */ (c.formOf('relai-audit')), { part: 'porzadki' }).text, '/relai-audit porzadki');
  assert.equal(c.buildCommand(/** @type {any} */ (c.formOf('relai-models')), {}).text, '/relai-models');
});

test('conditional fields: crew modes, prompt on/off, changelog ranges, branch goal after a name', () => {
  const crew = /** @type {any} */ (c.formOf('relai-crew'));
  assert.equal(c.buildCommand(crew, { goal: 'popraw testy' }).text, '/relai-crew popraw testy');
  assert.equal(c.buildCommand(crew, { mode: 'review', base: 'main', goal: 'ukryte' }).text, '/relai-crew review --base main');
  assert.equal(c.buildCommand(crew, { mode: 'status' }).text, '/relai-crew status');
  assert.deepEqual(c.buildCommand(crew, { mode: 'rescue' }).errors, ['zadanie: wymagane']);
  const prompt = /** @type {any} */ (c.formOf('relai-prompt'));
  assert.equal(c.buildCommand(prompt, { model: 'opus', text: 'popraw walidację' }).text, '/relai-prompt --model opus popraw walidację');
  assert.equal(c.buildCommand(prompt, { mode: 'on', scope: '--globalnie', text: 'ukryte' }).text, '/relai-prompt on --globalnie');
  assert.equal(c.buildCommand(prompt, {}).isOk, false, 'text mode needs a text');
  const log = /** @type {any} */ (c.formOf('relai-changelog'));
  assert.equal(c.buildCommand(log, {}).text, '/relai-changelog');
  assert.equal(c.buildCommand(log, { range: 'date', date: '2026-08-01' }).text, '/relai-changelog od 2026-08-01');
  assert.equal(c.buildCommand(log, { range: 'version', version: '2.7.0' }).text, '/relai-changelog od 2.7.0');
  assert.equal(c.buildCommand(log, { range: 'last', last: '10' }).text, '/relai-changelog ostatnie 10');
  const branch = /** @type {any} */ (c.formOf('relai-branch'));
  assert.equal(c.buildCommand(branch, { goal: 'bez nazwy' }).text, '/relai-branch');
  assert.equal(c.buildCommand(branch, { name: 'OPIS_REPO', goal: 'opis repo' }).text, '/relai-branch OPIS_REPO opis repo');
});

test('humanize: text mode sends the text, each settings mode sends a word of the command Step 0a', () => {
  const form = /** @type {any} */ (c.formOf('relai-humanize'));
  assert.equal(c.buildCommand(form, { text: 'docs/notka.md' }).text, '/relai-humanize docs/notka.md');
  assert.deepEqual(c.buildCommand(form, {}).errors, ['tekst albo ścieżka pliku: wymagane']);
  const md = fs.readFileSync(path.join(COMMANDS, 'relai-humanize.md'), 'utf8');
  const step0a = md.slice(md.indexOf('## Step 0a'), md.indexOf('## Step 0 '));
  assert.ok(step0a.length > 0, 'Step 0a not found in relai-humanize.md: the check would pass on nothing');
  const modes = form.fields[0].options.map((/** @type {any} */ o) => o.value).filter(Boolean);
  assert.deepEqual(modes, ['on', 'off', 'ustawienia']);
  for (const mode of modes) {
    assert.equal(c.buildCommand(form, { mode, text: 'ukryte' }).text, `/relai-humanize ${mode}`);
    assert.ok(step0a.includes('`' + mode + '`'), `Step 0a does not name \`${mode}\``);
  }
  assert.equal(step0a.includes('`wlacz`'), false, 'positive control: a word the command does not know');
});

test('invalid values are not built: outside the list, bad format, a line break', () => {
  const r1 = c.buildCommand(/** @type {any} */ (c.formOf('relai-audit')), { part: 'wszystko' });
  assert.equal(r1.isOk, false);
  assert.match(r1.errors[0] ?? '', /spoza listy/);
  assert.equal(c.buildCommand(/** @type {any} */ (c.formOf('relai-stage')), { stage: '5' }).isOk, false);
  assert.equal(c.buildCommand(/** @type {any} */ (c.formOf('relai-changelog')), { range: 'date', date: '1.08.2026' }).isOk, false);
  assert.equal(c.buildCommand(/** @type {any} */ (c.formOf('relai-backup')), { path: 'C:/a\nrm' }).isOk, false);
});

test('session names: relai: prefix first, bare name, other prefix, missing plugin', () => {
  const list = (/** @type {string[]} */ ...n) => n.map((name) => ({ name }));
  assert.equal(c.resolveName('relai-tour', list('relai-tour', 'relai:relai-tour')), 'relai:relai-tour');
  assert.equal(c.resolveName('relai-tour', list('x:relai-tour', 'relai-tour')), 'relai-tour');
  assert.equal(c.resolveName('relai-tour', list('x:relai-tour')), 'x:relai-tour');
  assert.equal(c.resolveName('relai-tour', list('relai-tours', 'cache')), null);
});
