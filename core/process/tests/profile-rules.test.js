'use strict';
// Hook profile-rules (K-C7): wpis w rejestrze artefaktow dopasowany po pelnej sciezce z kolumny
// "Plik"; material testowy, kopia generowana Codeksa, AGENTS.md i LICENCJE.md nie sa artefaktami.
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const HOOK = path.resolve(__dirname, '..', '..', '..', 'adapters', 'claude-code', 'hooks', 'profile-rules.js');

function projekt(wiersze) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-profile-rules-'));
  fs.mkdirSync(path.join(dir, 'docs'));
  fs.writeFileSync(path.join(dir, 'docs', 'USTAWIENIA.md'), '# USTAWIENIA\n\nWersja RelAI: 3.7.0\n\n'
    + '| Data | Ustawienie | Decyzja |\n|---|---|---|\n| 2026-11-09 | Profil projektu | prompty |\n');
  fs.writeFileSync(path.join(dir, 'docs', 'ARTEFAKTY.md'), '# ARTEFAKTY\n\n'
    + '| Artefakt | Plik | Wersja | Data | Co się zmieniło | Po co |\n|---|---|---|---|---|---|\n'
    + wiersze.join('\n') + '\n');
  return dir;
}
// Kontekst ostrzezenia albo '' przy ciszy.
function edycja(dir, rel) {
  const r = spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify({ cwd: dir, tool_name: 'Edit', tool_input: { file_path: path.join(dir, ...rel.split('/')) } }),
    encoding: 'utf8', timeout: 30000,
  });
  const out = (r.stdout || '').trim();
  return out ? JSON.parse(out).hookSpecificOutput.additionalContext : '';
}
const wpis = (plik) => '| Skill | ' + plik + ' | 1 | 2026-11-09 | nowy | test |';

test('same file name in two directories: only the registered path is silent', (t) => {
  const dir = projekt([wpis('`skills/a/SKILL.md`')]);
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  assert.equal(edycja(dir, 'skills/a/SKILL.md'), '');
  assert.match(edycja(dir, 'skills/b/SKILL.md'), /artefakt "skills\/b\/SKILL\.md" nie ma wpisu/);
});

test('test material and the generated Codex copy are not artifacts', (t) => {
  const dir = projekt([wpis('`skills/a/SKILL.md`')]);
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  for (const rel of ['core/process/tests/fixtures/humanize/01-state.md', 'skills/t/evals/case/prompt.md',
    'adapters/codex/skills/relai-core/SKILL.md']) {
    assert.equal(edycja(dir, rel), '', rel);
  }
});

test('AGENTS.md and LICENCJE.md are not artifacts', (t) => {
  const dir = projekt([wpis('`skills/a/SKILL.md`')]);
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  assert.equal(edycja(dir, 'AGENTS.md'), '');
  assert.equal(edycja(dir, 'site/fonty/LICENCJE.md'), '');
});

// Ochrona przed regresja parsera (zielony przed i po): wpis bez backtickow i cel linku.
test('a bare path and a link target in the Plik column count as entries', (t) => {
  const dir = projekt([wpis('prompts/system.md'), wpis('[prompt użytkownika](prompts/user.md)')]);
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  assert.equal(edycja(dir, 'prompts/system.md'), '');
  assert.equal(edycja(dir, 'prompts/user.md'), '');
  assert.match(edycja(dir, 'prompts/other.md'), /artefakt "prompts\/other\.md" nie ma wpisu/);
});
