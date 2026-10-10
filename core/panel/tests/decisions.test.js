'use strict';

// Karta potwierdzenia panelu i to, co wolno jej wyslac (plan PANEL_CLAUDE, E5; R4, D-35, Aneks D).
// Kontrola pozytywna na realnym materiale: STATUS.md i PROMPT_ETAP_5.md tego planu; stan etapu
// w tabeli test ustawia sam (L-0150), bo proces zmienia go w trakcie etapu — i wskazuje etap wprost:
// po zamknieciu E5 etap GOTOWY DO STARTU to E6, a wybor bez wskazania wzialby jego.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const d = require('../decisions.mjs');

const ROOT = path.resolve(__dirname, '..', '..', '..');
// The plan is closed and archived (2026-10-10): the archive path no longer moves
const STATUS_PATH = 'docs/archiwum/plany/PANEL_CLAUDE/STATUS.md';
const REAL_STATUS = fs.readFileSync(path.join(ROOT, STATUS_PATH), 'utf8');
const REAL_PROMPT = fs.readFileSync(path.join(ROOT, 'docs/archiwum/plany/PANEL_CLAUDE/PROMPT_ETAP_5.md'), 'utf8');

/** Real STATUS.md with E5 set to the given status (whatever it says today). */
function statusWithE5(status) {
  const out = REAL_STATUS.replace(/^(\| E5 \| [^|]+\| )[^|]+(\|)/m, `$1${status} $2`);
  assert.notEqual(out.indexOf(`| E5 | Decyzje w panelu | ${status} |`), -1, 'wiersz E5 nie zostal ustawiony');
  return out;
}

const ID = 'karta-e5-0001';

function card(extra = {}) {
  return d.makeCard({ id: ID, title: 't', facts: [], question: 'q?', actions: [{ kind: 'command', command: 'relai-stage', args: 'X E1' }], ...extra });
}

test('karta: "nie" niczego nie wysyla, w zadnym stanie', () => {
  const second = { question: 'na pewno?', facts: [] };
  for (const c of [card(), card({ second })]) {
    const no = d.answer(c, 'nie');
    assert.equal(no.state, 'cancelled');
    assert.deepEqual(d.stepsToRun(no), []);
  }
  const mid = d.answer(card({ second }), 'tak');
  assert.equal(mid.state, 'second');
  assert.deepEqual(d.stepsToRun(d.answer(mid, 'nie')), []);
});

test('karta: bez "tak" nic do uruchomienia, po "tak" dokladnie dzialania karty', () => {
  const c = card();
  assert.deepEqual(d.stepsToRun(c), [], 'karta otwarta nie wysyla');
  const yes = d.answer(c, 'tak');
  assert.equal(yes.state, 'confirmed');
  assert.deepEqual(d.stepsToRun(yes), [{ kind: 'command', command: 'relai-stage', args: 'X E1' }]);
  assert.equal(c.state, 'open', 'karta wejsciowa nietknieta');
});

test('karta z drugim krokiem (Aneks D): jedno "tak" nie wystarcza', () => {
  const second = { question: 'Zapisac nowy cennik?', facts: [{ label: 'Opus 5.5', value: '5,00 → 6,00' }] };
  const c = card({ second });
  const one = d.answer(c, 'tak');
  assert.deepEqual(d.stepsToRun(one), []);
  assert.equal(d.shown(one).question, 'Zapisac nowy cennik?');
  const two = d.answer(one, 'tak');
  assert.equal(two.state, 'confirmed');
  assert.equal(d.stepsToRun(two).length, 1);
  assert.equal(d.answer(two, 'nie').state, 'confirmed', 'karta zamknieta nie cofa sie');
  assert.equal(d.answer(d.answer(c, 'nie'), 'tak').state, 'cancelled', 'anulowana nie wraca');
});

test('karta: zle id i brak dzialan to blad, nie karta', () => {
  assert.throws(() => d.makeCard({ id: 'X', title: '', facts: [], question: '', actions: [{ kind: 'clear' }] }));
  assert.throws(() => d.makeCard({ id: ID, title: '', facts: [], question: '', actions: [] }));
});

test('zgoda: token z panelu dochodzi, wpisany z klawiatury jest wycinany', () => {
  const args = d.withConsent('PANEL_CLAUDE E5', ID);
  assert.equal(args, `PANEL_CLAUDE E5 ${d.CONSENT_FLAG} ${ID}`);
  assert.equal(d.hasConsent(args), true);
  assert.equal(d.stripConsent(args), 'PANEL_CLAUDE E5');
  assert.equal(d.stripConsent(`${d.CONSENT_FLAG}=abc E5`), 'E5');
  assert.equal(d.stripConsent(`E5 ${d.CONSENT_FLAG}`), 'E5', 'flaga bez wartosci tez znika');
  assert.equal(d.stripConsent('PANEL_CLAUDE E5'), 'PANEL_CLAUDE E5', 'bez tokenu nic nie ginie');
  assert.equal(d.hasConsent('PANEL_CLAUDE E5'), false);
  assert.equal(d.withConsent(`E5 ${d.CONSENT_FLAG} stary-token-01`, ID), `E5 ${d.CONSENT_FLAG} ${ID}`, 'stary token nie zostaje obok nowego');
});

test('model: zgodny, inny, nieznany', () => {
  assert.equal(d.requiredModel(REAL_STATUS), 'Opus');
  assert.equal(d.modelMatch('Opus', 'Opus 5.5'), 'match');
  assert.equal(d.modelMatch('Opus', 'claude-opus-5-5'), 'match');
  assert.equal(d.modelMatch('Opus 5.5', 'claude-opus-5-5'), 'match');
  assert.equal(d.modelMatch('Opus', 'claude-opus-5-5[1m]'), 'match', 'sufiks okna kontekstu z /model (terminal, 2026-10-09)');
  assert.equal(d.modelMatch('Opus 5.5', 'Opus 6'), 'mismatch');
  assert.equal(d.modelMatch('Opus', 'Sonnet 5.5'), 'mismatch');
  assert.equal(d.modelMatch(null, 'Opus 5.5'), 'unknown');
  assert.equal(d.modelMatch('Opus', ''), 'unknown');
});

test('karta etapu na realnym STATUS.md i PROMPT_ETAP_5.md', () => {
  const r = d.stageCard({ id: ID, statusMd: statusWithE5('GOTOWY DO STARTU'), statusPath: STATUS_PATH, stage: 'E5', promptText: REAL_PROMPT, sessionModel: 'claude-opus-5-5', isFresh: true });
  assert.equal(r.kind, 'card');
  const f = Object.fromEntries(r.card.facts.map((x) => [x.label, x]));
  assert.match(f.Model.value, /zgodny z planem \(Opus\)/);
  assert.equal(f.Model.tone, 'ok');
  assert.equal(f.Plan.value, 'PANEL_CLAUDE · ZREALIZOWANY');
  assert.equal(f.Etap.value, 'E5 z E9 · Decyzje w panelu · GOTOWY DO STARTU');
  assert.equal(f['Katalog roboczy'].value, '.claude/relai/work/PANEL_CLAUDE/E5/');
  // The count on the material: boxes between "## Weryfikacja" and the next "## "
  const sect = REAL_PROMPT.split('## Weryfikacja')[1].split(/\r?\n## /)[0];
  const boxes = (sect.match(/^\s*- \[[ xX]\]/gm) || []).length;
  assert.ok(boxes >= 10, 'kontrola pozytywna: sekcja Weryfikacja ma punkty');
  assert.equal(f.Weryfikacja.value, d.count(boxes, 'punkt', 'punkty', 'punktów'));
  assert.equal(f.Uwaga, undefined);
  assert.deepEqual(r.card.actions, [{ kind: 'clear' }, { kind: 'command', command: 'relai-stage', args: `PANEL_CLAUDE E5 ${d.CONSENT_FLAG} ${ID}` }]);
  assert.deepEqual(d.stepsToRun(r.card), [], 'R4: /clear nie pada bez "tak"');
});

test('karta etapu: biezacy czat bez /clear, inny model ostrzega pierwszy, etap w toku', () => {
  const r = d.stageCard({ id: ID, statusMd: statusWithE5('W TOKU'), statusPath: STATUS_PATH, stage: 'E5', promptText: REAL_PROMPT, sessionModel: 'Sonnet 5.5', isFresh: false });
  assert.equal(r.kind, 'card');
  assert.equal(r.card.actions.some((a) => a.kind === 'clear'), false);
  assert.equal(r.card.facts[0].label, 'Model');
  assert.equal(r.card.facts[0].tone, 'warn');
  assert.match(r.card.facts[0].value, /przełącz przed startem/);
  assert.match(r.card.facts.find((x) => x.label === 'Uwaga').value, /dokończyć czy od nowa/);
});

test('karta etapu: zablokowana, gdy komenda i tak by nie wystartowala', () => {
  // Whatever bold status the real metric line carries today (accepted, closed), it becomes pending
  const pending = REAL_STATUS.replace(/\*\*(ZAAKCEPTOWANY|ZREALIZOWANY) \d{4}-\d{2}-\d{2}\*\*/, '**DO AKCEPTACJI**');
  assert.notEqual(pending, REAL_STATUS, 'kontrola: linia metryczna podmieniona');
  assert.equal(d.stageCard({ id: ID, statusMd: pending, statusPath: STATUS_PATH, promptText: null, sessionModel: null, isFresh: true }).kind, 'blocked');
  assert.equal(d.stageCard({ id: ID, statusMd: REAL_STATUS, statusPath: STATUS_PATH, promptText: null, stage: 'E42', sessionModel: null, isFresh: true }).kind, 'blocked');
});

test('karta etapu: prompt bez katalogu roboczego i brak promptu mowione wprost', () => {
  const r = d.stageCard({ id: ID, statusMd: statusWithE5('GOTOWY DO STARTU'), statusPath: STATUS_PATH, stage: 'E5', promptText: '# P\n\n## Weryfikacja\n\n- [ ] a\n', sessionModel: null, isFresh: false });
  const f = Object.fromEntries(r.card.facts.map((x) => [x.label, x.value]));
  assert.match(f['Katalog roboczy'], /prompt go nie podaje/);
  assert.equal(f.Weryfikacja, '1 punkt');
  assert.match(f.Model, /modelu sesji nie odczytano/);
  const none = d.stageCard({ id: ID, statusMd: statusWithE5('GOTOWY DO STARTU'), statusPath: STATUS_PATH, stage: 'E5', promptText: null, sessionModel: null, isFresh: false });
  assert.match(none.card.facts.find((x) => x.label === 'Weryfikacja').value, /brak promptu/);
  assert.equal(d.copyText(STATUS_PATH, 'E5'), '/relai-stage PANEL_CLAUDE E5', 'kopia promptu bez zgody');
});

const TASKS = JSON.stringify([
  { id: 'a', title: 'Kod', files: ['src/a.js'], dependsOn: [], role: 'coder', runtime: 'claude-code', model: 'opus' },
  { id: 'b', title: 'Testy', files: ['src/a.js', 'test/a.test.js'], dependsOn: [], role: 'tester', runtime: 'codex', model: '' },
  { id: 'c', title: 'Przeglad', files: [], dependsOn: ['b'], role: 'reviewer', runtime: 'cursor', model: '' },
]);

test('zaloga: szkic edytowalny tylko przed startem, przebieg z manifestem nietkniety', () => {
  const live = d.crewDraft('r1', TASKS, '{"tasks":[]}');
  assert.equal(live.isEditable, false);
  const r = d.setTask(live, 'a', 'role', 'tester');
  assert.notEqual(r.error, '');
  assert.equal(r.draft, live);
  assert.equal(d.crewCard(ID, live).kind, 'blocked');
  assert.equal(d.crewDraft('r1', '{zly', null).isEditable, false);
});

test('zaloga: edycja niemutujaca, listy zamkniete, fale wg crew.js', () => {
  const draft = d.crewDraft('r1', TASKS, null);
  assert.deepEqual(d.draftWaves(draft).waves, [['a'], ['b'], ['c']], 'wspolny plik a/b rozdziela fale');
  const moved = d.setTask(draft, 'b', 'files', ['test/a.test.js']);
  assert.equal(moved.error, '');
  assert.deepEqual(d.draftWaves(moved.draft).waves, [['a', 'b'], ['c']]);
  assert.deepEqual(draft.tasks[1].files, ['src/a.js', 'test/a.test.js'], 'szkic wejsciowy nietkniety');
  assert.match(d.setTask(draft, 'a', 'role', 'admin').error, /spoza listy/);
  assert.match(d.setTask(draft, 'a', 'runtime', 'gemini').error, /spoza listy/);
  assert.match(d.setTask(draft, 'a', 'model', 'opus; rm -rf').error, /modelu/);
  assert.match(d.setTask(draft, 'a', 'files', ['../poza']).error, /poza projekt/);
  assert.match(d.setTask(draft, 'zz', 'role', 'coder').error, /nie ma zadania/);
  assert.match(d.addTask(draft, { ...draft.tasks[0] }).error, /powtórzone/);
  const gone = d.removeTask(draft, 'b').draft;
  assert.deepEqual(gone.tasks.map((t) => [t.id, t.dependsOn]), [['a', []], ['c', []]]);
  const cyc = d.setTask(d.setTask(draft, 'a', 'dependsOn', ['c']).draft, 'c', 'dependsOn', ['a']).draft;
  assert.equal(d.crewCard(ID, cyc).kind, 'blocked');
  const ok = d.crewCard(ID, moved.draft);
  assert.equal(ok.kind, 'card');
  assert.equal(ok.card.facts[0].value, 'a @claude-code/coder [opus], b @codex/tester');
  assert.deepEqual(ok.card.actions.map((a) => a.kind), ['write', 'submit'], 'najpierw plik, potem zdanie do czatu');
  assert.equal(ok.card.actions[0].path, '.claude/relai/work/CREW/r1/zadania.json');
  assert.deepEqual(JSON.parse(ok.card.actions[0].text)[1].files, ['test/a.test.js']);
  assert.match(ok.card.actions[1].text, /3 zadania, 2 fale/);
  assert.deepEqual(d.stepsToRun(ok.card), [], 'nic nie zapisane bez "tak"');
  const evil = { ...moved.draft, run: '../../docs' };
  assert.equal(d.crewCard(ID, evil).kind, 'blocked', 'nazwa przebiegu nie wyprowadza zapisu poza CREW');
  assert.deepEqual(JSON.parse(d.serializeDraft(moved.draft))[1].files, ['test/a.test.js']);
});

test('sprzatanie: nic nie jest zaznaczone na starcie, chronione osobno', () => {
  const report = JSON.stringify({
    grupy: [
      { id: 'work:E3', nazwa: 'etap zamkniety E3', bajty: 2 * 1048576, pytanie: 'q', pozycje: [{}] },
      { id: 'temp:relai', nazwa: 'temp', bajty: 1048576, pytanie: 'q', pozycje: [{}, {}] },
    ],
    chronione: [{ wzgledna: '.claude/relai/work/PANEL_CLAUDE/E5', chronione: { powod: 'etap trwa' } }],
  });
  const c = d.cleanChoices(report);
  assert.equal(c.groups.length, 2, 'kontrola pozytywna: grupy wczytane');
  assert.equal(c.groups.filter((g) => g.isPicked).length, 0);
  assert.deepEqual(c.kept, [{ path: '.claude/relai/work/PANEL_CLAUDE/E5', reason: 'etap trwa' }]);
  assert.equal(d.cleanCard(ID, c).kind, 'blocked', 'nic nie zaznaczono — nie ma czego potwierdzac');
  const one = d.togglePick(c, 'work:E3');
  assert.equal(c.groups[0].isPicked, false, 'wybor niemutujacy');
  const r = d.cleanCard(ID, one);
  assert.equal(r.kind, 'card');
  assert.equal(r.card.question, 'Skasować 1 grupę (2,00 MB)?');
  assert.equal(d.count(5, 'grupę', 'grupy', 'grup'), '5 grup');
  assert.equal(d.count(22, 'grupę', 'grupy', 'grup'), '22 grupy');
  assert.equal(d.count(12, 'grupę', 'grupy', 'grup'), '12 grup');
  assert.equal(r.card.actions[0].kind, 'command', 'host odrzuca prompt od "/" z wtyczki (P-022)');
  assert.equal(r.card.actions[0].command, 'relai-clean');
  assert.match(r.card.actions[0].args, /skasować grupy `work:E3`.*zostawić tym razem `temp:relai`/);
  assert.doesNotMatch(r.card.actions[0].args, /[\r\n]/);
  assert.deepEqual(d.stepsToRun(r.card), []);
  assert.equal(d.cleanChoices('nie json').error !== '', true);
});

test('sprzatanie: proces panelu to jedna zamknieta lista argumentow', () => {
  assert.deepEqual([...d.CLEAN_ARGV], ['node', '.claude/relai/tools/clean-work.js', 'raport', '--json']);
  assert.equal(Object.isFrozen(d.CLEAN_ARGV), true);
});

test('aktualizacja i modele: wersja i data listy z realnych plikow', () => {
  const ust = fs.readFileSync(path.join(ROOT, 'docs/USTAWIENIA.md'), 'utf8');
  assert.match(d.projectVersion(ust), /^\d+\.\d+\.\d+$/);
  assert.equal(d.projectVersion('brak'), null);
  // The list the plugin ships (tracked); the project's copy in .claude/relai/ is outside git and
  // a clean clone has none (L-0156, E7)
  const modele = fs.readFileSync(path.join(ROOT, 'adapters/claude-code/MODELE.md'), 'utf8');
  assert.match(d.listDate(modele), /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(d.listDate('list-date is described here'), null);
  assert.equal(d.daysBetween('2026-10-08', '2026-10-09'), 1);
  assert.equal(d.daysBetween(null, '2026-10-09'), null);
  const r = d.commandCard(ID, 'relai-models', [{ label: 'Lista', value: '2026-10-08' }]);
  assert.deepEqual(r.card.actions, [{ kind: 'command', command: 'relai-models', args: '' }]);
});
