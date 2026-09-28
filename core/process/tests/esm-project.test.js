'use strict';

// Kopie narzedzi w projekcie uzytkownika (2.7.1, P-007). Node wybiera system modulow pliku .js
// po najblizszym package.json w gore drzewa, wiec kopia w .claude/relai/ dziedziczy "type"
// projektu. W projekcie z "type": "module" kazdy skrypt CommonJS padal na pierwszym `require`
// (zgloszenie z projektu Vite + React, 2026-09-28). Test prowizjonuje kopie tak jak hook startu
// i uruchamia je w trzech probkach projektu: bez pola "type", z "commonjs" i z "module".

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { spawnSync } = require('node:child_process');

const core = require('../session-signals.js');

const PROBKI = [
  ['bez pola type', null],
  ['type commonjs', 'commonjs'],
  ['type module', 'module'],
];

function projekt(typ) {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-esm-'));
  const pkg = typ ? { name: 'probka', type: typ } : { name: 'probka' };
  fs.writeFileSync(path.join(cwd, 'package.json'), JSON.stringify(pkg));
  assert.ok(core.provisionTemplates(cwd) > 0, 'provisioning copied nothing');
  return cwd;
}

function uruchom(cwd, rel, args) {
  const plik = path.join(cwd, '.claude', 'relai', ...rel.split('/'));
  return spawnSync(process.execPath, [plik, ...args], { cwd, encoding: 'utf8', timeout: 30000 });
}

function opis(r) {
  return 'exit ' + r.status + '\n' + (r.stderr || '').split('\n').slice(0, 6).join('\n');
}

test('a 2.7.0 copy in an ESM project is repaired by the next start and work/ keeps the project type', (t) => {
  const cwd = projekt('module');
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  const relai = path.join(cwd, '.claude', 'relai');
  // Stan sprzed 2.7.1: kopie sa, package.json przy nich nie ma.
  fs.rmSync(path.join(relai, 'tools', 'package.json'));
  fs.rmSync(path.join(relai, 'templates', 'HTML_PLAN', 'package.json'));
  assert.notEqual(uruchom(cwd, 'tools/clean-work.js', ['raport']).status, 0);
  // Skrypt roboczy projektu w work/ jest ESM-em i ma nim zostac.
  const roboczy = path.join(relai, 'work', 'E1', 'pomiar.js');
  fs.mkdirSync(path.dirname(roboczy), { recursive: true });
  fs.writeFileSync(roboczy, 'import fs from "node:fs";\nconsole.log(typeof fs.readFileSync);\n');

  core.provisionTemplates(cwd); // nastepny start sesji

  const r = uruchom(cwd, 'tools/clean-work.js', ['raport']);
  assert.equal(r.status, 0, opis(r));
  assert.equal(fs.existsSync(path.join(relai, 'package.json')), false);
  const w = spawnSync(process.execPath, [roboczy], { cwd, encoding: 'utf8' });
  assert.equal(w.status, 0, opis(w));
});

for (const [nazwa, typ] of PROBKI) {
  test('tools/clean-work.js raport runs in a project with ' + nazwa, (t) => {
    const cwd = projekt(typ);
    t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
    const r = uruchom(cwd, 'tools/clean-work.js', ['raport', '--json']);
    assert.equal(r.status, 0, opis(r));
    assert.equal(typeof JSON.parse(r.stdout), 'object');
  });

  test('tools/crew.js detect runs in a project with ' + nazwa, (t) => {
    const cwd = projekt(typ);
    t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
    const r = uruchom(cwd, 'tools/crew.js', ['detect', '--json']);
    assert.equal(r.status, 0, opis(r));
    assert.equal(typeof JSON.parse(r.stdout), 'object');
  });

  test('templates/HTML_PLAN/zbuduj.js embeds fonts in a project with ' + nazwa, (t) => {
    const cwd = projekt(typ);
    t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
    const plan = path.join(cwd, 'PLAN.html');
    fs.writeFileSync(plan, '<style>/*{{FONTY}}*/</style>\n');
    const r = uruchom(cwd, 'templates/HTML_PLAN/zbuduj.js', [plan]);
    assert.equal(r.status, 0, opis(r));
    assert.match(fs.readFileSync(plan, 'utf8'), /@font-face/);
  });
}
