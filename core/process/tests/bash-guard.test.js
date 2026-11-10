'use strict';

// K-E3 (plan OPTYMALIZACJA_PO_AUDYCIE, E5): bash-guard ostrzega - nie blokuje - przed czterema
// nawykami powloki: gole cd, sed -i na pliku .md, backslash w heredoku albo node -e / python -c,
// /tmp/ w poleceniu z node. Tabela 26 przypadkow z karty E05; kazdy przypadek "cisza" ma w tym
// samym tescie kontrole pozytywna (zasada 3). Backslash skladany przez String.fromCharCode(92).

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const HOOKS = path.join(ROOT, 'adapters', 'claude-code', 'hooks');
const HOOK = path.join(HOOKS, 'bash-guard.js');
const BS = String.fromCharCode(92);

const REGULY = {
  cd: 'golego cd',
  sed: 'sed -i zmienia plik .md',
  backslash: 'z backslashem',
  tmp: '/tmp/ w poleceniu z node',
};

function fikstura(t, opcje) {
  const o = opcje || {};
  const baza = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-e3-'));
  t.after(() => fs.rmSync(baza, { recursive: true, force: true }));
  const root = path.join(baza, 'projekt');
  const home = path.join(baza, 'home');
  fs.mkdirSync(root, { recursive: true });
  fs.mkdirSync(home, { recursive: true });
  if (o.marker !== false) {
    fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
    fs.writeFileSync(path.join(root, 'docs', 'USTAWIENIA.md'),
      '# USTAWIENIA\n\nWersja RelAI: 3.7.0 · zainicjowano: 2026-11-10\n');
  }
  if (o.gosc) {
    fs.mkdirSync(path.join(root, '.claude'), { recursive: true });
    fs.writeFileSync(path.join(root, '.claude', 'relai.json'), '{"mode":"guest"}');
  }
  return { root, home };
}

function uruchom(f, wejscie) {
  const r = spawnSync(process.execPath, [HOOK], {
    cwd: f.root,
    input: wejscie,
    encoding: 'utf8',
    env: { ...process.env, HOME: f.home, USERPROFILE: f.home },
  });
  assert.equal(r.status, 0, 'hook konczy sie kodem 0');
  return r;
}

// null = stdout pusty; inaczej hookSpecificOutput.
function wyjscie(f, polecenie, tool) {
  const r = uruchom(f, JSON.stringify({
    hook_event_name: 'PreToolUse', cwd: f.root, tool_name: tool || 'Bash', tool_input: { command: polecenie },
  }));
  if (!r.stdout.trim()) return null;
  return JSON.parse(r.stdout).hookSpecificOutput;
}

// Lista regul rozpoznanych po zdaniach ostrzezenia.
function reguly(f, polecenie, tool) {
  const out = wyjscie(f, polecenie, tool);
  if (!out) return [];
  const tekst = out.additionalContext || '';
  return Object.keys(REGULY).filter((k) => tekst.includes(REGULY[k]));
}

function sprawdz(f, przypadki) {
  for (const [nr, polecenie, oczekiwane] of przypadki) {
    assert.deepEqual(reguly(f, polecenie), oczekiwane, '#' + nr + ' ' + JSON.stringify(polecenie));
  }
}

test('bash-guard: bare cd warns, subshell and cd inside words do not', (t) => {
  const f = fikstura(t);
  sprawdz(f, [
    [1, 'cd docs && ls', ['cd']],
    [2, '( cd docs && ls )', []],
    [3, 'git log --format=%cd -1', []],
    [4, 'cd', ['cd']],
    [5, '  cd ..', ['cd']],
    [6, 'cdk deploy', []],
    [7, 'echo cd x', []],
  ]);
});

test('bash-guard: sed -i on a .md file warns, other sed calls do not', (t) => {
  const f = fikstura(t);
  sprawdz(f, [
    [8, "sed -i 's/a/b/' docs/STATE.md", ['sed']],
    [9, 'sed -i s/a/b/ plik.js', []],
    [10, "sed -n '1,5p' docs/STATE.md", []],
    [11, "sed -i.bak 's/x/y/' README.md", ['sed']],
    [12, "sed --in-place 's/x/y/' a.md", ['sed']],
    [13, "sed -i 's/a.md/b/' x.js", []],
    [14, "git status && sed -i 's/x/y/' CLAUDE.md", ['sed']],
  ]);
});

test('bash-guard: backslash in a heredoc, node -e or python -c warns', (t) => {
  const f = fikstura(t);
  sprawdz(f, [
    [15, 'node -e "console.log(\'a' + BS + 'nb\')"', ['backslash']],
    [16, 'node -e "console.log(1)"', []],
    [17, 'python -c "print(\'' + BS + 'd\')"', ['backslash']],
    [18, "cat <<'EOF' > x.js\nconst re = /" + BS + 'd+/;\nEOF', ['backslash']],
    [19, "cat <<'EOF' > x.md\ntekst bez ukosnika\nEOF", []],
    [20, 'grep -n "a' + BS + 'sb" plik.txt', []],
  ]);
});

test('bash-guard: /tmp/ in a command running node warns', (t) => {
  const f = fikstura(t);
  sprawdz(f, [
    [21, 'node /tmp/x.js', ['tmp']],
    [22, 'node skrypt.js > /tmp/out.txt', ['tmp']],
    [23, 'ls /tmp/', []],
    [24, 'node C:/Users/a/AppData/Local/Temp/x.js', []],
    [25, 'npm run build -- --out /tmp/x', []],
    [26, 'cd /tmp/x && node a.js', ['cd', 'tmp']],
  ]);
});

test('bash-guard: warnings never block, are ASCII and stay silent outside RelAI, in guest mode and for other tools', (t) => {
  const f = fikstura(t);
  const POLECENIE = 'cd /tmp/x && node a.js';
  const out = wyjscie(f, POLECENIE);
  assert.ok(out, 'przypadek 26 daje wyjscie');
  assert.equal(out.hookEventName, 'PreToolUse');
  assert.ok(!('permissionDecision' in out), 'ostrzezenie nie ma permissionDecision');
  assert.match(out.additionalContext, /^[\x20-\x7e]+$/, 'komunikat ASCII');

  assert.deepEqual(reguly(fikstura(t, { marker: false }), POLECENIE), [], 'bez markera');
  assert.deepEqual(reguly(fikstura(t, { gosc: true }), POLECENIE), [], 'tryb goscia');
  assert.deepEqual(reguly(f, POLECENIE, 'Write'), [], 'inne narzedzie');
});

test('bash-guard: malformed stdin leaves one trace line and exit 0; a BOM is accepted', (t) => {
  const f = fikstura(t);
  const r = uruchom(f, '{nie json');
  assert.equal(r.stdout, '', 'stdout pusty');
  assert.equal(r.stderr.trim(), '[RelAI bash-guard] blad: SyntaxError');

  const bom = String.fromCharCode(0xfeff);
  const z = uruchom(f, bom + JSON.stringify({
    hook_event_name: 'PreToolUse', cwd: f.root, tool_name: 'Bash', tool_input: { command: 'cd x' },
  }));
  assert.ok(z.stdout.trim(), 'payload z BOM daje wyjscie');
  assert.match(JSON.parse(z.stdout).hookSpecificOutput.additionalContext, /golego cd/);
});

test('hooks.json: the PreToolUse Bash group runs secret-scanner, then bash-guard', () => {
  const pre = JSON.parse(fs.readFileSync(path.join(HOOKS, 'hooks.json'), 'utf8')).hooks.PreToolUse;
  const grupa = pre.find((g) => new RegExp(g.matcher).test('Bash'));
  assert.ok(grupa, 'grupa PreToolUse dla Bash');
  assert.deepEqual(grupa.hooks.map((x) => path.basename(x.command.replace(/"$/, ''))),
    ['secret-scanner.js', 'bash-guard.js']);
});
