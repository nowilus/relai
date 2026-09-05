#!/usr/bin/env node
'use strict';

// Project integration for Codex. The plugin supplies skills and hooks globally;
// this script only performs D-86's reversible instruction-file migration.

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ADAPTER = __dirname;
const ROOT = path.resolve(ADAPTER, '..', '..');
const STATE = ['.agents', 'relai', 'codex-install.json'];

function digest(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function router(backups) {
  const links = backups.map((name) => '- Preserve and follow project guidance in `.agents/relai/original-' + name.toLowerCase() + '`.').join('\n');
  return '# RelAI project router\n\n' +
    'Follow the RelAI process before making repository changes. Read `docs/STATE.md` and the active plan first.\n' +
    'Keep code and identifiers in English; keep project documentation in its configured language.\n' +
    'Do not work outside the active stage without asking whether to create a branch, an addendum, or a deferred item.\n' +
    (links ? '\n## Preserved project guidance\n' + links + '\n' : '');
}

function claudePointer() {
  return '# Claude Code compatibility\n\nRead AGENTS.md for the active project instructions.\n';
}

function install(project) {
  const stateFile = path.join(project, ...STATE);
  if (fs.existsSync(stateFile)) return 0;
  const backupDir = path.dirname(stateFile);
  const originals = [];
  for (const name of ['AGENTS.md', 'CLAUDE.md']) {
    const file = path.join(project, name);
    if (!fs.existsSync(file)) continue;
    fs.mkdirSync(backupDir, { recursive: true });
    fs.writeFileSync(path.join(backupDir, 'original-' + name.toLowerCase()), read(file), 'utf8');
    originals.push(name);
  }
  const agents = router(originals);
  const claude = claudePointer();
  fs.writeFileSync(path.join(project, 'AGENTS.md'), agents, 'utf8');
  fs.writeFileSync(path.join(project, 'CLAUDE.md'), claude, 'utf8');
  fs.mkdirSync(backupDir, { recursive: true });
  fs.writeFileSync(stateFile, JSON.stringify({
    adapter: 'codex',
    source: ROOT.split(path.sep).join('/'),
    originals,
    managed: { 'AGENTS.md': digest(agents), 'CLAUDE.md': digest(claude) },
  }, null, 2) + '\n', 'utf8');
  return 0;
}

function uninstall(project) {
  const stateFile = path.join(project, ...STATE);
  let state;
  try { state = JSON.parse(read(stateFile)); } catch (_) { return 1; }
  for (const [name, expected] of Object.entries(state.managed || {})) {
    const file = path.join(project, name);
    let actual = '';
    try { actual = digest(read(file)); } catch (_) { return 1; }
    if (actual !== expected) return 1;
  }
  const backupDir = path.dirname(stateFile);
  for (const name of ['AGENTS.md', 'CLAUDE.md']) {
    const backup = path.join(backupDir, 'original-' + name.toLowerCase());
    const destination = path.join(project, name);
    if (fs.existsSync(backup)) fs.renameSync(backup, destination);
    else fs.unlinkSync(destination);
  }
  fs.unlinkSync(stateFile);
  try { fs.rmdirSync(backupDir); fs.rmdirSync(path.dirname(backupDir)); } catch (_) { /* preserve non-empty user directories */ }
  return 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const target = args.find((arg) => !arg.startsWith('--'));
  if (!target || args.some((arg) => !['--uninstall', target].includes(arg))) {
    process.stderr.write('Usage: node adapters/codex/install.js <project> [--uninstall]\n');
    process.exit(2);
  }
  const project = path.resolve(target);
  if (!fs.existsSync(project) || !fs.statSync(project).isDirectory()) {
    process.stderr.write('RelAI Codex: project directory does not exist.\n');
    process.exit(2);
  }
  process.exit(args.includes('--uninstall') ? uninstall(project) : install(project));
}

module.exports = { install, uninstall };
