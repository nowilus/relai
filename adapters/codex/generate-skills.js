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

function sourceFiles() {
  const commands = fs.readdirSync(COMMANDS)
    .filter((name) => /^relai-[a-z-]+\.md$/.test(name))
    .sort()
    .map((name) => ({ name: path.basename(name, '.md'), source: path.join(COMMANDS, name), content: commandSkill(path.join(COMMANDS, name)) }));
  if (commands.length !== 14) throw new Error('Oczekiwano 14 komend RelAI, znaleziono: ' + commands.length);
  for (const command of commands.slice()) {
    if (commandParts(command.source).explicitOnly) {
      commands.push({ name: command.name, file: path.join('agents', 'openai.yaml'), source: command.source, content: EXPLICIT_ONLY_POLICY, policy: true });
    }
  }
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
    name: item.name,
    file: path.join(output, item.name, item.file || 'SKILL.md'),
    content: item.content,
    command: /^relai-(?!core$|planning$)/.test(item.name) && !item.policy,
  }));
}

// Files in a generated skill directory (and its agents/ folder) that no source file produces any
// more: a removed reference file, or an openai.yaml left after a command lost its explicit-only flag.
function orphans(output) {
  const all = entries(output);
  const expected = new Set(all.map((entry) => entry.file));
  const found = [];
  const names = new Set(all.map((entry) => entry.name));
  // A relai-* directory no source produces any more (a renamed command) is orphaned as a whole.
  let dirs = [];
  try { dirs = fs.readdirSync(output, { withFileTypes: true }).filter((d) => d.isDirectory() && /^relai-/.test(d.name)); } catch (_) { dirs = []; }
  for (const d of dirs) {
    if (names.has(d.name)) continue;
    const walk = (dir) => {
      for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, f.name);
        if (f.isDirectory()) walk(full); else found.push(full);
      }
    };
    walk(path.join(output, d.name));
  }
  for (const name of names) {
    for (const dir of [path.join(output, name), path.join(output, name, 'agents')]) {
      let files = [];
      try { files = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { continue; }
      for (const file of files) {
        if (file.isDirectory()) continue;
        const full = path.join(dir, file.name);
        if (!expected.has(full)) found.push(full);
      }
    }
  }
  return found;
}

function generate({ output = path.join(ROOT, 'adapters', 'codex', 'skills') } = {}) {
  const files = [];
  let commandSkills = 0;
  const names = new Set(entries(output).map((entry) => entry.name));
  for (const orphan of orphans(output)) {
    fs.rmSync(orphan, { force: true });
    const top = path.relative(output, orphan).split(path.sep)[0];
    if (!names.has(top)) fs.rmSync(path.join(output, top), { recursive: true, force: true });
  }
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
  const polityki = wszystkie.filter((e) => e.file.endsWith('openai.yaml')).length;
  const rdzen = wszystkie.length - procedury - polityki;
  process.stdout.write('RelAI Codex skills: ' + procedury + ' procedur (' + polityki + ' tylko na jawne wywolanie) + 2 skille rdzeniowe ('
    + rdzen + ' plikow), spojne.\n');
}

// Every file the generated tree must contain, for the parity line of validate-adapters.js.
function expected({ output = path.join(ROOT, 'adapters', 'codex', 'skills') } = {}) {
  return entries(output).map((entry) => entry.file);
}

module.exports = { generate, verify, expected };
