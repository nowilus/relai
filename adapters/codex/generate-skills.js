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
  if (commands.length !== 14) throw new Error('Oczekiwano 14 komend RelAI, znaleziono: ' + commands.length);
  // Core skills ship SKILL.md plus reference files read on demand (E3 PROWADZENIE_END_TO_END):
  // every .md file of the skill directory is copied, so none of them can drift or go missing.
  for (const name of CORE_SKILL_NAMES) {
    for (const file of coreSkillFiles(name)) {
      const source = path.join(CORE_SKILLS, name, file);
      commands.push({ name, file, source, content: read(source) });
    }
  }
  return commands;
}

const CORE_SKILL_NAMES = ['relai-core', 'relai-planning'];

function coreSkillFiles(name) {
  const files = fs.readdirSync(path.join(CORE_SKILLS, name)).filter((file) => file.endsWith('.md')).sort();
  if (!files.includes('SKILL.md')) throw new Error('Brak SKILL.md w skillu: ' + name);
  return files;
}

function entries(output) {
  return sourceFiles().map((item) => ({
    file: path.join(output, item.name, item.file || 'SKILL.md'),
    content: item.content,
    command: /^relai-(?!core$|planning$)/.test(item.name),
  }));
}

// Files in a generated core skill directory that no source file produces any more.
function orphans(output) {
  const expected = new Set(entries(output).map((entry) => entry.file));
  const found = [];
  for (const name of CORE_SKILL_NAMES) {
    let files = [];
    try { files = fs.readdirSync(path.join(output, name)); } catch (_) { continue; }
    for (const file of files) {
      const full = path.join(output, name, file);
      if (!expected.has(full)) found.push(full);
    }
  }
  return found;
}

function generate({ output = path.join(ROOT, 'adapters', 'codex', 'skills') } = {}) {
  const files = [];
  let commandSkills = 0;
  for (const orphan of orphans(output)) fs.rmSync(orphan, { force: true });
  for (const entry of entries(output)) {
    fs.mkdirSync(path.dirname(entry.file), { recursive: true });
    fs.writeFileSync(entry.file, entry.content, 'utf8');
    files.push(entry.file);
    if (entry.command) commandSkills++;
  }
  return { commandSkills, files };
}

function verify({ output = path.join(ROOT, 'adapters', 'codex', 'skills') } = {}) {
  const mismatches = [];
  for (const entry of entries(output)) {
    let actual = '';
    try { actual = read(entry.file); } catch (_) { mismatches.push(entry.file); continue; }
    if (actual !== entry.content) mismatches.push(entry.file);
  }
  return mismatches.concat(orphans(output));
}

if (require.main === module) {
  const mismatches = process.argv.includes('--verify') ? verify() : (generate(), verify());
  if (mismatches.length) {
    process.stderr.write('RelAI Codex skills: rozjazd ' + mismatches.length + ' plikow\n');
    for (const file of mismatches) process.stderr.write('  - ' + path.relative(ROOT, file) + '\n');
    process.exit(1);
  }
  const wszystkie = entries(path.join(ROOT, 'adapters', 'codex', 'skills'));
  const procedury = wszystkie.filter((e) => e.command).length;
  const rdzen = wszystkie.length - procedury;
  process.stdout.write('RelAI Codex skills: ' + procedury + ' procedur + 2 skille rdzeniowe (' + rdzen + ' plikow), spojne.\n');
}

// Every file the generated tree must contain, for the parity line of validate-adapters.js.
function expected({ output = path.join(ROOT, 'adapters', 'codex', 'skills') } = {}) {
  return entries(output).map((entry) => entry.file);
}

module.exports = { generate, verify, expected };
