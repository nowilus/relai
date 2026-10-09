'use strict';

// Odczyt aktywnego planu i etapu dla paska panelu RelAI (plan PANEL_CLAUDE, E1).
// Kontrola pozytywna na realnym materiale: CLAUDE.md tego repo i kazdy STATUS.md planow
// (aktywnego i archiwalnych) — z licznikiem wierszy etapow odrzuconych przez zamknieta liste.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const p = require('../plan-state.mjs');

const ROOT = path.resolve(__dirname, '..', '..', '..');

const STATUS = [
  '# STATUS — plan PLATNOSCI',
  '',
  '[PLAN.html](PLAN.html) · utworzony 2026-10-01 · **ZAAKCEPTOWANY 2026-10-02** · model wykonawczy: Opus',
  '',
  '| Etap | Nazwa | Status | Prompt | Uwagi |',
  '|---|---|---|---|---|',
  '| E1 | Szkielet | ZREALIZOWANY 2026-10-03 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | |',
  '| E2 | Formularze \\| komendy | **W TOKU** | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | |',
  '| E3 | Raport | OCZEKUJE | — | |',
  '| E4 | Stary | POMINIĘTY — poza zakresem | — | |',
].join('\n');

test('active plan line: link, "brak", missing, unreadable', () => {
  assert.deepEqual(p.parseActivePlan('x\nAktywny plan: [PLATNOSCI](docs/plany/PLATNOSCI/STATUS.md) — opis\n'),
    { kind: 'plan', plan: 'PLATNOSCI', statusPath: 'docs/plany/PLATNOSCI/STATUS.md' });
  assert.deepEqual(p.parseActivePlan('Aktywny plan: brak'), { kind: 'none' });
  assert.deepEqual(p.parseActivePlan('# CLAUDE.md bez linii'), { kind: 'none' });
  assert.equal(p.parseActivePlan('Aktywny plan: PLATNOSCI, zobacz STATE').kind, 'unknown');
  assert.equal(p.parseActivePlan('  Aktywny plan: [X](docs/plany/X/STATUS.md)').kind, 'none', 'anchored at line start');
});

test('status: plan status from the bold metric segment, stages with escaped pipes, closed list', () => {
  const s = p.parseStatus(STATUS);
  assert.equal(s.planStatus, 'ZAAKCEPTOWANY');
  assert.deepEqual(s.stages.map((x) => [x.id, x.status]), [
    ['E1', 'ZREALIZOWANY'], ['E2', 'W TOKU'], ['E3', 'OCZEKUJE'], ['E4', 'POMINIĘTY'],
  ]);
  assert.equal(s.stages[1] && s.stages[1].name, 'Formularze \\| komendy');
});

test('status: CRLF and LF give the same result', () => {
  assert.deepEqual(p.parseStatus(STATUS.replace(/\n/g, '\r\n')), p.parseStatus(STATUS));
});

test('status: an unknown status value is dropped, not guessed', () => {
  const s = p.parseStatus(STATUS.replace('OCZEKUJE', 'CZEKA'));
  assert.deepEqual(s.stages.map((x) => x.id), ['E1', 'E2', 'E4']);
});

test('plan state: W TOKU wins over GOTOWY DO STARTU; unreadable files are "unknown", never a throw', async () => {
  const claude = 'Aktywny plan: [PLATNOSCI](docs/plany/PLATNOSCI/STATUS.md)';
  const ok = await p.planState(claude, async () => STATUS.replace('OCZEKUJE', 'GOTOWY DO STARTU'));
  assert.equal(ok.kind, 'ok');
  assert.ok(ok.kind === 'ok' && ok.stage && ok.stage.id === 'E2' && ok.stages === 4 && ok.closed === 2);

  const ready = await p.planState(claude, () => STATUS.replace('**W TOKU**', 'ZREALIZOWANY 2026-10-04').replace('OCZEKUJE', 'GOTOWY DO STARTU'));
  assert.ok(ready.kind === 'ok' && ready.stage && ready.stage.id === 'E3');

  assert.equal((await p.planState(null, () => STATUS)).kind, 'unknown');
  assert.equal((await p.planState(claude, () => null)).kind, 'unknown');
  assert.deepEqual(await p.planState('Aktywny plan: brak', () => STATUS), { kind: 'none' });
});

test('real material: this repo shows its active plan with one current stage', async () => {
  const claude = fs.readFileSync(path.join(ROOT, 'CLAUDE.md'), 'utf8');
  const read = (rel) => { try { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch (_) { return null; } };
  const s = await p.planState(claude, read);
  // Between plans the line says "brak"; the real-material check then has nothing to read.
  if (s.kind === 'none') return;
  assert.equal(s.kind, 'ok', JSON.stringify(s));
  assert.ok(s.kind === 'ok' && s.planStatus !== null, 'plan status recognised');
  assert.ok(s.kind === 'ok' && s.stages > 0, 'stages read');
});

test('real material: every STATUS.md of the repo parses, and no stage row is rejected silently', () => {
  const dirs = [path.join(ROOT, 'docs', 'plany'), path.join(ROOT, 'docs', 'archiwum', 'plany')];
  const files = dirs.flatMap((d) => (fs.existsSync(d) ? fs.readdirSync(d) : [])
    .map((n) => path.join(d, n, 'STATUS.md'))
    .concat([]).filter((f) => fs.existsSync(f)));
  assert.ok(files.length >= 10, 'found ' + files.length + ' STATUS.md files');
  const report = [];
  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    const rows = text.split(/\r?\n/).filter((l) => /^\|\s*\**E\d+/.test(l)).length;
    const s = p.parseStatus(text);
    report.push(path.basename(path.dirname(f)) + ': ' + s.stages.length + '/' + rows + ', plan ' + s.planStatus);
    assert.equal(s.stages.length, rows, 'rejected stage rows in ' + f + ' — ' + report.join('; '));
    assert.notEqual(s.planStatus, null, 'plan status not recognised in ' + f);
  }
});

test('ancestors: the folder itself, then each parent up to the root, in either slash (E9: a cd must not hide the panel)', () => {
  assert.deepEqual(p.ancestors('C:/proj/.claude/relai/work'), ['C:/proj/.claude/relai/work', 'C:/proj/.claude/relai', 'C:/proj/.claude', 'C:/proj', 'C:']);
  assert.deepEqual(p.ancestors('C:\\proj\\docs\\'), ['C:/proj/docs', 'C:/proj', 'C:']);
  assert.deepEqual(p.ancestors('/home/u/proj'), ['/home/u/proj', '/home/u', '/home']);
  assert.deepEqual(p.ancestors(''), []);
});
