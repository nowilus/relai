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
const { BUNDLED_SKILL_NAMES, skillFiles } = require(path.join(ROOT, 'core', 'process', 'bundled-skills.js'));

function read(file) {
  return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
}

// Skill files are copied byte for byte; text files get the same CRLF -> LF as the commands, so a
// Windows checkout with autocrlf does not count as drift. A file with a NUL byte stays untouched.
function readSkillFile(file) {
  const bytes = fs.readFileSync(file);
  return bytes.includes(0) ? bytes : bytes.toString('utf8').replace(/\r\n/g, '\n');
}

function sameContent(actual, expected) {
  return Buffer.isBuffer(expected) ? Buffer.isBuffer(actual) && actual.equals(expected) : actual === expected;
}

// $ARGUMENTS is substituted only by Claude Code; Codex passes the argument inside the message
// that invoked the skill, so the generated text names that message instead (AUDYT_SKILLI S6).
const ARGUMENT_SENTENCE = 'tekst podany przez użytkownika po nazwie skilla w wiadomości, która go wywołała '
  + '(brak tekstu = brak argumentu)';

// Commands with side effects run only when the person invokes them (D-70). Claude Code reads
// disable-model-invocation; Codex reads policy.allow_implicit_invocation from agents/openai.yaml.
const EXPLICIT_ONLY_POLICY = 'policy:\n  allow_implicit_invocation: false\n';

function commandParts(source) {
  const text = read(source);
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error('Nieprawidlowy frontmatter komendy: ' + source);
  const description = (match[1].match(/^description:\s*(.+)$/m) || [])[1];
  if (!description) throw new Error('Brak description w komendzie: ' + source);
  const explicitOnly = /^disable-model-invocation:\s*true\s*$/m.test(match[1]);
  return { description, body: match[2], explicitOnly };
}

function commandSkill(source) {
  const { description, body } = commandParts(source);
  const name = path.basename(source, '.md');
  const text = body.replace(/`\$ARGUMENTS`/g, ARGUMENT_SENTENCE).replace(/\$ARGUMENTS/g, ARGUMENT_SENTENCE);
  return '---\nname: ' + name + '\ndescription: ' + description + '\n---\n\n' + text;
}

function sourceFiles(skillsSource = CORE_SKILLS) {
  const commands = fs.readdirSync(COMMANDS)
    .filter((name) => /^relai-[a-z-]+\.md$/.test(name))
    .sort()
    .map((name) => ({ name: path.basename(name, '.md'), source: path.join(COMMANDS, name), content: commandSkill(path.join(COMMANDS, name)) }));
  if (commands.length !== 16) throw new Error('Oczekiwano 16 komend RelAI, znaleziono: ' + commands.length);
  for (const command of commands.slice()) {
    if (commandParts(command.source).explicitOnly) {
      commands.push({ name: command.name, file: path.join('agents', 'openai.yaml'), source: command.source, content: EXPLICIT_ONLY_POLICY, policy: true });
    }
  }
  // Bundled skills (core/process/bundled-skills.js) ship every file with subdirectories — SKILL.md,
  // reference files, scripts, LICENSE (E3 PROWADZENIE_END_TO_END, BEZPIECZENSTWO E5), so none of
  // them can drift or go missing.
  for (const name of BUNDLED_SKILL_NAMES) {
    for (const file of skillFiles(path.join(skillsSource, name))) {
      const source = path.join(skillsSource, name, ...file.split('/'));
      commands.push({ name, file: path.join(...file.split('/')), source, content: readSkillFile(source), skill: true });
    }
  }
  return commands;
}

function entries(output, skillsSource) {
  return sourceFiles(skillsSource).map((item) => ({
    name: item.name,
    file: path.join(output, item.name, item.file || 'SKILL.md'),
    content: item.content,
    command: !item.skill && !item.policy,
  }));
}

function walkFiles(dir, found) {
  let items = [];
  try { items = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return found; }
  for (const f of items) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) walkFiles(full, found); else found.push(full);
  }
  return found;
}

// Files in the generated tree that no source file produces any more: a removed reference file or
// script (also in a subdirectory), an openai.yaml left after a command lost its explicit-only flag,
// or a whole skill directory no source produces any more (a renamed command, a skill off the list).
function orphans(output, skillsSource) {
  const all = entries(output, skillsSource);
  const expected = new Set(all.map((entry) => entry.file));
  const names = new Set(all.map((entry) => entry.name));
  let dirs = [];
  try { dirs = fs.readdirSync(output, { withFileTypes: true }).filter((d) => d.isDirectory()); } catch (_) { dirs = []; }
  const found = [];
  for (const d of dirs) {
    for (const full of walkFiles(path.join(output, d.name), [])) {
      if (!names.has(d.name) || !expected.has(full)) found.push(full);
    }
  }
  return found;
}

// skillsSource: the Claude Code skills directory; tests point it at a fixture.
function generate({ output = path.join(ROOT, 'adapters', 'codex', 'skills'), skillsSource } = {}) {
  const files = [];
  let commandSkills = 0;
  const names = new Set(entries(output, skillsSource).map((entry) => entry.name));
  for (const orphan of orphans(output, skillsSource)) {
    fs.rmSync(orphan, { force: true });
    const top = path.relative(output, orphan).split(path.sep)[0];
    if (!names.has(top)) fs.rmSync(path.join(output, top), { recursive: true, force: true });
  }
  for (const entry of entries(output, skillsSource)) {
    fs.mkdirSync(path.dirname(entry.file), { recursive: true });
    fs.writeFileSync(entry.file, entry.content, Buffer.isBuffer(entry.content) ? undefined : 'utf8');
    files.push(entry.file);
    if (entry.command) commandSkills++;
  }
  return { commandSkills, files };
}

function verify({ output = path.join(ROOT, 'adapters', 'codex', 'skills'), skillsSource } = {}) {
  const mismatches = [];
  for (const entry of entries(output, skillsSource)) {
    let actual = '';
    try { actual = Buffer.isBuffer(entry.content) ? fs.readFileSync(entry.file) : read(entry.file); } catch (_) { mismatches.push(entry.file); continue; }
    if (!sameContent(actual, entry.content)) mismatches.push(entry.file);
  }
  return mismatches.concat(orphans(output, skillsSource));
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
  const polityki = wszystkie.filter((e) => e.file.endsWith('openai.yaml')).length;
  const dolaczone = wszystkie.length - procedury - polityki;
  process.stdout.write('RelAI Codex skills: ' + procedury + ' procedur (' + polityki + ' tylko na jawne wywolanie) + '
    + BUNDLED_SKILL_NAMES.length + ' skille dolaczone (' + dolaczone + ' plikow), spojne.\n');
}

// Every file the generated tree must contain, for the parity line of validate-adapters.js.
function expected({ output = path.join(ROOT, 'adapters', 'codex', 'skills') } = {}) {
  return entries(output).map((entry) => entry.file);
}

module.exports = { generate, verify, expected };
