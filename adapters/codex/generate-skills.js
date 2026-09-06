#!/usr/bin/env node
'use strict';

// Generates the Codex-native skills from the single maintained Claude Code
// command source. The generated tree is committed so plugin discovery does not
// depend on a build step, while verify() makes drift a release-blocking error.

const fs = require('node:fs');
const path = require('node:path');

const ADAPTER = __dirname;
const ROOT = path.resolve(ADAPTER, '..', '..');
const COMMANDS = path.join(ROOT, 'adapters', 'claude-code', 'commands');
const CORE_SKILLS = path.join(ROOT, 'adapters', 'claude-code', 'skills');

function read(file) {
  return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
}

function commandSkill(source) {
  const text = read(source);
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error('Nieprawidlowy frontmatter komendy: ' + source);
  const description = (match[1].match(/^description:\s*(.+)$/m) || [])[1];
  if (!description) throw new Error('Brak description w komendzie: ' + source);
  const name = path.basename(source, '.md');
  return '---\nname: ' + name + '\ndescription: ' + description + '\n---\n\n' + match[2];
}

function sourceFiles() {
  const commands = fs.readdirSync(COMMANDS)
    .filter((name) => /^relai-[a-z-]+\.md$/.test(name))
    .sort()
    .map((name) => ({ name: path.basename(name, '.md'), source: path.join(COMMANDS, name), content: commandSkill(path.join(COMMANDS, name)) }));
  if (commands.length !== 13) throw new Error('Oczekiwano 13 komend RelAI, znaleziono: ' + commands.length);
  for (const name of ['relai-core', 'relai-planning']) {
    const source = path.join(CORE_SKILLS, name, 'SKILL.md');
    commands.push({ name, source, content: read(source) });
  }
  return commands;
}

function entries(output) {
  return sourceFiles().map((item) => ({
    file: path.join(output, item.name, 'SKILL.md'),
    content: item.content,
    command: /^relai-(?!core$|planning$)/.test(item.name),
  }));
}

function generate({ output = path.join(ROOT, 'skills') } = {}) {
  const files = [];
  let commandSkills = 0;
  for (const entry of entries(output)) {
    fs.mkdirSync(path.dirname(entry.file), { recursive: true });
    fs.writeFileSync(entry.file, entry.content, 'utf8');
    files.push(entry.file);
    if (entry.command) commandSkills++;
  }
  return { commandSkills, files };
}

function verify({ output = path.join(ROOT, 'skills') } = {}) {
  const mismatches = [];
  for (const entry of entries(output)) {
    let actual = '';
    try { actual = read(entry.file); } catch (_) { mismatches.push(entry.file); continue; }
    if (actual !== entry.content) mismatches.push(entry.file);
  }
  return mismatches;
}

if (require.main === module) {
  const mismatches = process.argv.includes('--verify') ? verify() : (generate(), verify());
  if (mismatches.length) {
    process.stderr.write('RelAI Codex skills: rozjazd ' + mismatches.length + ' plikow\n');
    for (const file of mismatches) process.stderr.write('  - ' + path.relative(ROOT, file) + '\n');
    process.exit(1);
  }
  process.stdout.write('RelAI Codex skills: 13 procedur + 2 skille rdzeniowe, spojne.\n');
}

module.exports = { generate, verify };
