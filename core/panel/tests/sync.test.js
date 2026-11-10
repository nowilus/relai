'use strict';

// Kopia rdzenia panelu w pluginie relai-panel jest zgodna ze zrodlem (plan PANEL_CLAUDE, E1).
// Druga strona kontroli: rozjazd podlozony w katalogu tymczasowym musi zostac zgloszony.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const TOOL = path.join(ROOT, 'core', 'tools', 'sync-panel-core.js');

// A temporary repo with the tool, the given folders and files; removed after the test
function fixture(t, prefix, dirs, files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const d of [['core', 'tools'], ['core', 'panel'], ...dirs]) fs.mkdirSync(path.join(root, ...d), { recursive: true });
  fs.copyFileSync(TOOL, path.join(root, 'core', 'tools', 'sync-panel-core.js'));
  for (const [rel, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), text);
  }
  const tool = path.join(root, 'core', 'tools', 'sync-panel-core.js');
  return { root, run: (...args) => spawnSync(process.execPath, [tool, ...args], { encoding: 'utf8' }) };
}

const uses = (...names) => names.map((n) => `import { x as ${n.replace(/\W/g, '_')} } from './core/${n}';\n`).join('');

test('panel/hooks/core matches core/panel', () => {
  const r = require(TOOL).check();
  assert.deepEqual(r.problems, []);
  assert.ok(r.files >= 2, 'files: ' + r.files);
});

test('a changed copy, a missing copy and an orphan copy are reported (planted defect)', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-panel-sync-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'core', 'tools'), { recursive: true });
  fs.mkdirSync(path.join(root, 'core', 'panel'), { recursive: true });
  fs.mkdirSync(path.join(root, 'panel', 'hooks', 'core'), { recursive: true });
  fs.writeFileSync(path.join(root, 'panel', 'hooks', 'register.tsx'), uses('a.mjs', 'b.mjs'));
  fs.copyFileSync(TOOL, path.join(root, 'core', 'tools', 'sync-panel-core.js'));
  fs.writeFileSync(path.join(root, 'core', 'panel', 'a.mjs'), 'export const a = 1;\n');
  fs.writeFileSync(path.join(root, 'core', 'panel', 'b.mjs'), 'export const b = 1;\n');
  fs.writeFileSync(path.join(root, 'panel', 'hooks', 'core', 'a.mjs'), 'export const a = 2;\n');
  fs.writeFileSync(path.join(root, 'panel', 'hooks', 'core', 'old.mjs'), 'export const old = 1;\n');
  const tool = path.join(root, 'core', 'tools', 'sync-panel-core.js');

  const bad = spawnSync(process.execPath, [tool, '--check'], { encoding: 'utf8' });
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /a\.mjs rozni sie/);
  assert.match(bad.stderr, /brak kopii panel\/hooks\/core\/b\.mjs/);
  assert.match(bad.stderr, /old\.mjs nie ma zrodla/);

  // CRLF in the copy alone is not a difference
  fs.unlinkSync(path.join(root, 'panel', 'hooks', 'core', 'old.mjs'));
  const fixed = spawnSync(process.execPath, [tool], { encoding: 'utf8' });
  assert.equal(fixed.status, 0, fixed.stderr);
  fs.writeFileSync(path.join(root, 'panel', 'hooks', 'core', 'a.mjs'), 'export const a = 1;\r\n');
  assert.equal(spawnSync(process.execPath, [tool, '--check'], { encoding: 'utf8' }).status, 0);
});

test('the icons module follows the icon files: a changed icon is reported (planted defect)', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-panel-icons-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const d of [['core', 'tools'], ['core', 'panel'], ['panel', 'hooks', 'core'], ['docs', 'zasoby', 'branding', 'ikony']]) {
    fs.mkdirSync(path.join(root, ...d), { recursive: true });
  }
  fs.copyFileSync(TOOL, path.join(root, 'core', 'tools', 'sync-panel-core.js'));
  fs.writeFileSync(path.join(root, 'core', 'panel', 'a.mjs'), 'export const a = 1;\n');
  fs.writeFileSync(path.join(root, 'panel', 'hooks', 'register.tsx'), uses('a.mjs', 'icons.mjs'));
  const ikony = path.join(root, 'docs', 'zasoby', 'branding', 'ikony');
  fs.writeFileSync(path.join(ikony, 'stage.svg'), '<?xml version="1.0"?>\r\n<svg id="s"/>\r\n');
  fs.writeFileSync(path.join(ikony, 'tour.svg'), '<svg id="t"/>\n');
  const tool = path.join(root, 'core', 'tools', 'sync-panel-core.js');

  const made = spawnSync(process.execPath, [tool], { encoding: 'utf8' });
  assert.equal(made.status, 0, made.stderr);
  assert.match(made.stdout, /1 plikow core\/panel i 2 ikon/);
  const mod = fs.readFileSync(path.join(root, 'panel', 'hooks', 'core', 'icons.mjs'), 'utf8');
  assert.match(mod, /"stage": "<svg id=\\"s\\"\/>"/); // XML declaration dropped, CRLF gone
  assert.match(mod, /"tour": "<svg id=\\"t\\"\/>"/);

  fs.writeFileSync(path.join(ikony, 'tour.svg'), '<svg id="t2"/>\n');
  const bad = spawnSync(process.execPath, [tool, '--check'], { encoding: 'utf8' });
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /icons\.mjs rozni sie od docs\/zasoby\/branding\/ikony/);

  fs.unlinkSync(path.join(root, 'panel', 'hooks', 'core', 'icons.mjs'));
  const gone = spawnSync(process.execPath, [tool, '--check'], { encoding: 'utf8' });
  assert.match(gone.stderr, /brak panel\/hooks\/core\/icons\.mjs/);
});

test('every plugin that carries the core is checked: a stale copy in progress/ is reported (planted defect)', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-progress-sync-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const d of [['core', 'tools'], ['core', 'panel'], ['panel', 'hooks', 'core'], ['progress', 'hooks', 'core']]) {
    fs.mkdirSync(path.join(root, ...d), { recursive: true });
  }
  fs.copyFileSync(TOOL, path.join(root, 'core', 'tools', 'sync-panel-core.js'));
  fs.writeFileSync(path.join(root, 'core', 'panel', 'a.mjs'), 'export const a = 1;\n');
  fs.writeFileSync(path.join(root, 'panel', 'hooks', 'register.tsx'), uses('a.mjs'));
  fs.writeFileSync(path.join(root, 'progress', 'hooks', 'register.tsx'), uses('a.mjs'));
  const tool = path.join(root, 'core', 'tools', 'sync-panel-core.js');

  const made = spawnSync(process.execPath, [tool], { encoding: 'utf8' });
  assert.equal(made.status, 0, made.stderr);
  assert.match(made.stdout, /panel\/hooks\/core, progress\/hooks\/core/);
  assert.equal(fs.readFileSync(path.join(root, 'progress', 'hooks', 'core', 'a.mjs'), 'utf8'), 'export const a = 1;\n');

  fs.writeFileSync(path.join(root, 'progress', 'hooks', 'core', 'a.mjs'), 'export const a = 2;\n');
  const bad = spawnSync(process.execPath, [tool, '--check'], { encoding: 'utf8' });
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /kopia progress\/hooks\/core\/a\.mjs rozni sie/);
  assert.doesNotMatch(bad.stderr, /panel\/hooks\/core\/a\.mjs/);
});

test('relai-mods carries the core too: mods/hooks/core is written and checked (plan RELAI_MODS, Annex B)', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-mods-sync-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const d of [['core', 'tools'], ['core', 'panel'], ['panel', 'hooks', 'core'], ['mods', 'hooks']]) {
    fs.mkdirSync(path.join(root, ...d), { recursive: true });
  }
  fs.copyFileSync(TOOL, path.join(root, 'core', 'tools', 'sync-panel-core.js'));
  fs.writeFileSync(path.join(root, 'core', 'panel', 'a.mjs'), 'export const a = 1;\n');
  fs.writeFileSync(path.join(root, 'mods', 'hooks', 'register.tsx'), uses('a.mjs'));
  const tool = path.join(root, 'core', 'tools', 'sync-panel-core.js');

  const made = spawnSync(process.execPath, [tool], { encoding: 'utf8' });
  assert.equal(made.status, 0, made.stderr);
  assert.match(made.stdout, /mods\/hooks\/core/);
  assert.equal(fs.readFileSync(path.join(root, 'mods', 'hooks', 'core', 'a.mjs'), 'utf8'), 'export const a = 1;\n');

  fs.writeFileSync(path.join(root, 'mods', 'hooks', 'core', 'a.mjs'), 'export const a = 2;\n');
  const bad = spawnSync(process.execPath, [tool, '--check'], { encoding: 'utf8' });
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /kopia mods\/hooks\/core\/a\.mjs rozni sie/);
});

test('a mod gets only what it reaches: through a core file, from a test, never the rest (K-G2)', (t) => {
  const { root, run } = fixture(t, 'relai-reachable-sync-', [['progress', 'hooks', 'core']], {
    'core/panel/a.mjs': "import './b.mjs';\n",
    'core/panel/b.mjs': 'export const b = 1;\n',
    'core/panel/c.mjs': 'export const c = 1;\n',
    'core/panel/d.mjs': 'export const d = 1;\n',
    'progress/hooks/register.tsx': uses('a.mjs'),
    'progress/hooks/bar.test.ts': uses('c.mjs'),
  });

  const made = run();
  assert.equal(made.status, 0, made.stderr);
  assert.deepEqual(fs.readdirSync(path.join(root, 'progress', 'hooks', 'core')).sort(), ['a.mjs', 'b.mjs', 'c.mjs']);
  assert.match(made.stdout, /4 plikow core\/panel/);
});

test('a copy no file imports any more is removed by sync and reported by --check; a foreign file stays (K-G2)', (t) => {
  const { root, run } = fixture(t, 'relai-extra-sync-', [['mods', 'hooks', 'core']], {
    'core/panel/a.mjs': 'export const a = 1;\n',
    'core/panel/b.mjs': 'export const b = 1;\n',
    'mods/hooks/register.tsx': uses('a.mjs'),
    'mods/hooks/core/a.mjs': 'export const a = 1;\n',
    'mods/hooks/core/b.mjs': 'export const b = 1;\n',
    'mods/hooks/core/own.mjs': 'export const own = 1;\n',
  });

  const bad = run('--check');
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /kopia nadmiarowa mods\/hooks\/core\/b\.mjs/);
  assert.match(bad.stderr, /mods\/hooks\/core\/own\.mjs nie ma zrodla/);

  const made = run();
  assert.equal(made.status, 1);
  assert.deepEqual(fs.readdirSync(path.join(root, 'mods', 'hooks', 'core')).sort(), ['a.mjs', 'own.mjs']);
});
