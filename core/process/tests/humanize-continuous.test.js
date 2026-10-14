'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { spawnSync } = require('node:child_process');

const tryb = require('../humanize-continuous.js');

const HOOKI = path.join(__dirname, '..', '..', '..', 'adapters', 'claude-code', 'hooks');
const HOOK = path.join(HOOKI, 'humanize-continuous.js');
const HOOK_OPTYMALIZATORA = path.join(HOOKI, 'prompt-mode.js');
const SESJA = 'sesja-e3-test';

// Projekt RelAI w katalogu tymczasowym z wlasnym katalogiem domowym: profil i ustawienia
// globalne czlowieka nie moga wplynac na wynik (zasada 5: "konfiguracji nie ma" tylko
// z podstawionym katalogiem domowym).
function projekt(t, wiersz, dodatkowe) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-humanize-continuous-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const cwd = path.join(root, 'projekt');
  const home = path.join(root, 'home');
  fs.mkdirSync(path.join(cwd, 'docs'), { recursive: true });
  fs.mkdirSync(home, { recursive: true });
  const linia = wiersz === null ? '' : '| 2026-10-14 | Humanizacja | ' + wiersz + ' |\n';
  fs.writeFileSync(path.join(cwd, 'docs', 'USTAWIENIA.md'), '# USTAWIENIA\n\nWersja RelAI: 3.0.0\n\n' +
    '| Data | Czego dotyczy | Decyzja |\n|---|---|---|\n| 2026-10-01 | Język projektu | polski |\n' + linia +
    (dodatkowe || ''));
  return { cwd, home };
}

function hook(skrypt, p, zdarzenie) {
  const r = spawnSync(process.execPath, [skrypt], {
    input: JSON.stringify({ cwd: p.cwd, session_id: SESJA, ...zdarzenie }),
    encoding: 'utf8',
    env: { ...process.env, HOME: p.home, USERPROFILE: p.home },
  });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
}

const prompt = (p, tekst) => hook(HOOK, p, { hook_event_name: 'UserPromptSubmit', prompt: tekst || 'napisz podsumowanie' });
const zapis = (p, plik, narzedzie) => hook(HOOK, p, {
  hook_event_name: 'PostToolUse', tool_name: narzedzie || 'Write', tool_input: { file_path: path.join(p.cwd, ...plik.split('/')) },
});
const kontekst = (wyjscie) => (wyjscie ? JSON.parse(wyjscie).hookSpecificOutput.additionalContext : '');

function plikWProjekcie(p, rel, tresc) {
  const pelna = path.join(p.cwd, ...rel.split('/'));
  fs.mkdirSync(path.dirname(pelna), { recursive: true });
  fs.writeFileSync(pelna, tresc || 'Akapit.\n');
}

const WLACZONA_WSZYSTKO = 'włączona · zakresy: dokumenty, czat, zewnętrzne · pokaz: dwie wersje · profil: nie';

// --- koszt reguly (H5) --------------------------------------------------------------------

test('rule before the reply stays within 600 bytes and ASCII in the longest variant', () => {
  // najdluzszy ton to "wg odbiorcy", najdluzsza sciezka profilu — projektowa albo globalna
  const w = { stan: 'włączona', zakresy: ['czat', 'zewnętrzne'], pokaz: 'notka', ton: { czat: 'wg odbiorcy' }, profil: true, profilW: ['czat', 'wiadomości'] };
  const dlugosci = ['~/.claude/relai/STYL.md', 'docs/zasoby/STYL.md'].map((profil) => {
    const r = tryb.regulaPrzedOdpowiedzia(w, { profil });
    assert.match(r, /^[\x20-\x7e]+$/);
    return Buffer.byteLength(r, 'utf8');
  });
  assert.ok(Math.max(...dlugosci) <= 600, 'regula ma ' + dlugosci.join(' / ') + ' B');
  const r = tryb.regulaPrzedOdpowiedzia({ ...w, ton: { czat: 'rzeczowy', 'zewnętrzne': 'staranny' } }, { profil: null });
  assert.ok(r.includes(tryb.SKROT));
  assert.ok(r.includes('ton rzeczowy') && r.includes('ton staranny'), 'ton z ustawien, nie wbudowany');
  assert.ok(r.includes('/relai-prompt'), 'propozycja optymalizatora wylaczona (H6)');
});

test('rule before the reply names only the chosen scopes; documents alone give no rule', () => {
  const baza = { stan: 'włączona', pokaz: 'notka', ton: {}, profil: false, profilW: ['czat'] };
  const czat = tryb.regulaPrzedOdpowiedzia({ ...baza, zakresy: ['czat'] });
  assert.ok(czat.includes('odpowiedz w czacie (ton swobodny)'));
  assert.ok(!czat.includes('commit'));
  const zewn = tryb.regulaPrzedOdpowiedzia({ ...baza, zakresy: ['zewnętrzne'] });
  assert.ok(zewn.includes('commit') && !zewn.includes('odpowiedz w czacie'));
  assert.equal(tryb.regulaPrzedOdpowiedzia({ ...baza, zakresy: ['dokumenty'] }), '');
});

test('profile appears only when the file exists and the kind is listed in profil w', () => {
  const w = { stan: 'włączona', zakresy: ['czat', 'zewnętrzne'], pokaz: 'notka', ton: {}, profil: true, profilW: ['czat'] };
  assert.ok(tryb.regulaPrzedOdpowiedzia(w, { profil: '~/.claude/relai/STYL.md' }).includes('Profil stylu ~/.claude/relai/STYL.md tylko w: czat.'));
  assert.ok(!tryb.regulaPrzedOdpowiedzia(w, { profil: null }).includes('Profil'));
  assert.ok(!tryb.regulaPrzedOdpowiedzia({ ...w, profil: false }, { profil: '~/.claude/relai/STYL.md' }).includes('Profil'));
  // dokument formalny przy profilu tylko w czacie: bez profilu (commit, PR, README nigdy)
  assert.ok(!tryb.regulaPoZapisie('docs/PRZEWODNIK.md', w, { profil: 'x' }).includes('Profil'));
  assert.ok(tryb.regulaPoZapisie('docs/DZIENNIK.md', { ...w, profilW: ['robocze'] }, { profil: 'x' }).includes('Profil stylu x'));
});

test('rule after a document write keeps dictated text verbatim in both display modes (annex B)', () => {
  const w = { stan: 'włączona', zakresy: ['dokumenty'], pokaz: 'notka', ton: {}, profil: false, profilW: [] };
  for (const pokaz of ['notka', 'dwie wersje']) {
    const regula = tryb.regulaPoZapisie('docs/PRZEWODNIK.md', { ...w, pokaz });
    assert.ok(regula.includes('Tekst, ktory polecenie kazalo wpisac doslownie'), 'pokaz: ' + pokaz);
    assert.ok(regula.indexOf('doslownie') < regula.indexOf('Przed zapisem straznik'), 'pokaz: ' + pokaz);
  }
});

// --- hook przed odpowiedzia: cisza z kontrola pozytywna -----------------------------------

test('UserPromptSubmit: zero bytes without the row, when off and when unrecognized; rule when on', (t) => {
  for (const wiersz of [null, 'wyłączona · zakresy: czat · pokaz: notka · profil: nie', 'czasami · zakresy: czat']) {
    assert.equal(prompt(projekt(t, wiersz)), '', 'wiersz: ' + wiersz);
  }
  // kontrola pozytywna na tym samym ukladzie
  const r = kontekst(prompt(projekt(t, 'włączona · zakresy: czat · pokaz: notka · profil: nie')));
  assert.ok(r.startsWith('[RelAI humanizacja] Tryb ciagly: odpowiedz w czacie'));
});

test('UserPromptSubmit: silent outside a RelAI project and in guest mode', (t) => {
  const p = projekt(t, WLACZONA_WSZYSTKO);
  assert.notEqual(prompt(p), '');
  fs.mkdirSync(path.join(p.cwd, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(p.cwd, '.claude', 'relai.json'), JSON.stringify({ mode: 'guest' }));
  assert.equal(prompt(p), '');
  const bez = projekt(t, WLACZONA_WSZYSTKO);
  fs.writeFileSync(path.join(bez.cwd, 'docs', 'USTAWIENIA.md'), '| 2026-10-14 | Humanizacja | ' + WLACZONA_WSZYSTKO + ' |\n');
  assert.equal(prompt(bez), '');
});

test('session file decides over the project row in both directions', (t) => {
  const p = projekt(t, 'wyłączona · zakresy: czat · pokaz: notka · profil: nie');
  assert.equal(prompt(p), '');
  const plik = path.join(p.cwd, '.claude', 'relai', 'humanizacja', SESJA + '.json');
  fs.mkdirSync(path.dirname(plik), { recursive: true });
  fs.writeFileSync(plik, JSON.stringify({ wartosc: 'włączona · zakresy: czat · pokaz: notka · profil: nie' }));
  assert.notEqual(prompt(p), '');
});

// --- hook po zapisie: wylaczenia (H3) -----------------------------------------------------

test('PostToolUse: excluded paths stay silent, an ordinary document speaks', (t) => {
  const p = projekt(t, WLACZONA_WSZYSTKO);
  plikWProjekcie(p, 'docs/plany/STARY/STATUS.md', '# STATUS\n\n[PLAN.md](PLAN.md) · utworzony 2026-10-01 · **ZAAKCEPTOWANY 2026-10-02**\n');
  plikWProjekcie(p, 'docs/plany/NOWY/STATUS.md', '# STATUS\n\n[PLAN.md](PLAN.md) · utworzony 2026-10-14 · **DO AKCEPTACJI**\n');
  const cisza = [
    'docs/archiwum/DZIENNIK-2026-08.md', 'docs/plany/STARY/PLAN.html', 'docs/plany/STARY/PLAN.md',
    'docs/plany/BEZ_STATUSU/PLAN.md', 'docs/DECYZJE.md', 'docs/plany/STARY/PROMPT_ETAP_3.md',
    'docs/fixy/X/PROMPT_ODNOGA.md', 'docs/SPEC_COS.md', 'docs/CLAUDE.md', 'docs/zasoby/raport.html',
    'README.md', 'core/humanize/SKROT.md', "docs/it's.md",
  ];
  for (const plik of cisza) assert.equal(zapis(p, plik), '', plik);
  // kontrola pozytywna w tym samym przebiegu: zwykly dokument i plan do akceptacji
  for (const plik of ['docs/PRZEWODNIK.md', 'docs/plany/NOWY/PLAN.md', 'docs/notatka.txt']) {
    assert.ok(kontekst(zapis(p, plik)).startsWith('[RelAI humanizacja] Zapisales ' + plik), plik);
  }
});

test('PostToolUse: zero bytes without the row, when off, unrecognized, in guest mode and outside RelAI; rule when on', (t) => {
  for (const wiersz of [null, 'wyłączona · zakresy: dokumenty · pokaz: notka · profil: nie', 'czasami · zakresy: dokumenty']) {
    assert.equal(zapis(projekt(t, wiersz), 'docs/STATE.md'), '', 'wiersz: ' + wiersz);
  }
  const gosc = projekt(t, WLACZONA_WSZYSTKO);
  fs.mkdirSync(path.join(gosc.cwd, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(gosc.cwd, '.claude', 'relai.json'), JSON.stringify({ mode: 'guest' }));
  assert.equal(zapis(gosc, 'docs/STATE.md'), '');
  const bez = projekt(t, WLACZONA_WSZYSTKO);
  fs.writeFileSync(path.join(bez.cwd, 'docs', 'USTAWIENIA.md'), '| 2026-10-14 | Humanizacja | ' + WLACZONA_WSZYSTKO + ' |\n');
  assert.equal(zapis(bez, 'docs/STATE.md'), '');
  // kontrola pozytywna: ten sam uklad z wierszem wlaczonym
  assert.ok(kontekst(zapis(projekt(t, WLACZONA_WSZYSTKO), 'docs/STATE.md')).startsWith('[RelAI humanizacja] Zapisales docs/STATE.md'));
});

test('path filter: traversal, other drive, case variants, odd characters and aliases stay silent', (t) => {
  const p = projekt(t, null);
  const cwd = p.cwd;
  assert.equal(tryb.sciezkaWzgledna(cwd, path.join(cwd, 'docs', '..', 'README.md')), 'README.md');
  assert.equal(tryb.sciezkaWzgledna(cwd, path.join(cwd, '..', 'docs', 'x.md')), null);
  assert.equal(tryb.sciezkaWzgledna(cwd, 'docs/STATE.md'), 'docs/STATE.md', 'sciezka wzgledna wobec cwd');
  assert.equal(tryb.sciezkaWzgledna(cwd, ''), null);
  if (process.platform === 'win32') assert.equal(tryb.sciezkaWzgledna('C:\\proj', 'D:\\proj\\docs\\x.md'), null);
  const cisza = {
    'Docs/ARCHIWUM/x.md': 'archiwum', 'docs/decyzje.md': 'rejestr decyzji', 'docs/PLAN.txt': 'zamrozony plan',
    'docs/a\nb.md': 'znaki spoza listy w sciezce', 'docs/Zażółć.md': 'znaki spoza listy w sciezce',
    'docs/DECYZJ~1.MD': 'znaki spoza listy w sciezce', "docs/it's.md": 'znaki spoza listy w sciezce',
    'docs/plany/X/prompt_etap_2.md': 'prompt dla modelu', 'docs/x.html': 'nie dokument tekstowy (.md, .txt)',
  };
  for (const [rel, powod] of Object.entries(cisza)) assert.equal(tryb.powodPominieciaPliku(rel, cwd), powod, rel);
  assert.equal(tryb.powodPominieciaPliku('Docs/Notatki (stare).md', cwd), null, 'kontrola pozytywna: wielkie litery i nawiasy');
});

test('plan status: only the bold status on the metric line unfreezes PLAN.*', (t) => {
  const p = projekt(t, null);
  const status = (folder, tresc) => plikWProjekcie(p, 'docs/plany/' + folder + '/STATUS.md', tresc);
  status('OK', '# STATUS\r\n\r\n[PLAN.md](PLAN.md) · utworzony 2026-10-14 · **DO AKCEPTACJI** · model: Opus\r\n');
  status('PROZA', '# STATUS\n\n[PLAN.md](PLAN.md) · utworzony 2026-10-01 · **ZAAKCEPTOWANY 2026-10-02** (wczesniej **DO AKCEPTACJI**)\n');
  status('TABELA', '# STATUS\n\nPlan przyjety.\n\n| E1 · **DO AKCEPTACJI** |\n');
  status('BEZ_POGRUBIENIA', '# STATUS\n\n[PLAN.md](PLAN.md) · utworzony 2026-10-14 · DO AKCEPTACJI\n');
  assert.equal(tryb.powodPominieciaPliku('docs/plany/OK/PLAN.md', p.cwd), null, 'CRLF i status pogrubiony');
  for (const f of ['PROZA', 'TABELA', 'BEZ_POGRUBIENIA', 'BRAK']) {
    assert.equal(tryb.powodPominieciaPliku('docs/plany/' + f + '/PLAN.md', p.cwd), 'zamrozony plan', f);
  }
});

test('hook survives malformed events with exit 0 and zero bytes', (t) => {
  const p = projekt(t, WLACZONA_WSZYSTKO);
  const env = { ...process.env, HOME: p.home, USERPROFILE: p.home };
  const wejscia = ['', '{nie json', JSON.stringify({ hook_event_name: 'PostToolUse', cwd: p.cwd, session_id: SESJA, tool_name: 'Write' }),
    JSON.stringify({ hook_event_name: 'PostToolUse', cwd: p.cwd, session_id: SESJA, tool_name: 'Write', tool_input: { file_path: { x: 1 } } }),
    JSON.stringify({ hook_event_name: 'Stop', cwd: p.cwd, session_id: SESJA })];
  for (const input of wejscia) {
    const r = spawnSync(process.execPath, [HOOK], { input, encoding: 'utf8', env });
    assert.equal(r.status, 0, input);
    assert.equal(r.stdout, '', input);
  }
});

test('parallel writes of one file in one session give exactly one rule', async (t) => {
  const p = projekt(t, WLACZONA_WSZYSTKO);
  const { spawn } = require('node:child_process');
  const jeden = () => new Promise((resolve) => {
    const c = spawn(process.execPath, [HOOK], { env: { ...process.env, HOME: p.home, USERPROFILE: p.home } });
    let out = '';
    c.stdout.on('data', (d) => { out += d; });
    c.on('close', () => resolve(out));
    c.stdin.end(JSON.stringify({ cwd: p.cwd, session_id: SESJA, hook_event_name: 'PostToolUse', tool_name: 'Edit', tool_input: { file_path: path.join(p.cwd, 'docs', 'STATE.md') } }));
  });
  const wyniki = await Promise.all([jeden(), jeden(), jeden(), jeden(), jeden(), jeden()]);
  assert.equal(wyniki.filter(Boolean).length, 1);
});

test('PostToolUse: silent without the documents scope, for read tools and without a session id', (t) => {
  const czat = projekt(t, 'włączona · zakresy: czat · pokaz: notka · profil: nie');
  assert.equal(zapis(czat, 'docs/STATE.md'), '');
  const p = projekt(t, WLACZONA_WSZYSTKO);
  assert.equal(zapis(p, 'docs/STATE.md', 'Read'), '');
  const r = spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify({ cwd: p.cwd, hook_event_name: 'PostToolUse', tool_name: 'Edit', tool_input: { file_path: path.join(p.cwd, 'docs', 'STATE.md') } }),
    encoding: 'utf8', env: { ...process.env, HOME: p.home, USERPROFILE: p.home },
  });
  assert.equal(r.stdout, '');
  assert.notEqual(zapis(p, 'docs/STATE.md', 'Edit'), '', 'kontrola pozytywna z identyfikatorem sesji');
});

// --- zapis powloka (Aneks C): pomiar E5 — model dopisywal dokumenty przez Bash -----------

test('shell write targets: redirections, tee and cd; quotes, heredoc bodies and stderr ignored (annex C)', () => {
  const cwd = path.resolve(os.tmpdir(), 'relai-c');
  const cele = (polecenie) => tryb.celeZapisuPowloki(polecenie, cwd).map((p) => path.relative(cwd, p).split(path.sep).join('/'));
  // przypadki z pomiaru E5, doslownie w ksztalcie
  assert.deepEqual(cele("printf '\\nWarto podkreslic.\\n' >> docs/NOTATKI.md"), ['docs/NOTATKI.md']);
  assert.deepEqual(cele('cd "' + cwd + '" && cat >> docs/NOTATKI.md <<\'EOF\'\n\n> cytat > docs/X.md\nEOF'), ['docs/NOTATKI.md']);
  assert.deepEqual(cele('echo x > out.txt; cd docs && echo y >> C.md'), ['out.txt', 'docs/C.md']);
  assert.deepEqual(cele('echo a | tee -a docs/B.md docs/D.md'), ['docs/B.md', 'docs/D.md']);
  assert.deepEqual(cele('echo a>docs/E.md'), ['docs/E.md']);
  assert.deepEqual(cele("cat <<-EOF > 'docs/F G.md'\n\tx\n\tEOF"), ['docs/F G.md']);
  // kontrola negatywna: znak ">" w cudzyslowie, w strumieniu bledow, w porownaniu i /dev/null
  for (const cicho of ['echo "a > b"', "printf 'x >> docs/A.md'", 'node x.js 2> err.log', 'node x.js 2>&1', 'ls > /dev/null',
    'node x.js &> log.txt', 'git diff --stat docs/A.md', 'node -e "1"', 'cat docs/A.md', 'echo x >&2']) {
    assert.deepEqual(cele(cicho), [], cicho);
  }
  // poprawki po recenzji: here-string, \" w cudzyslowie, komentarz, >|
  assert.deepEqual(cele('cat <<< "tekst"\necho y > docs/X.md'), ['docs/X.md']);
  assert.deepEqual(cele('echo "it is <<EOF"\necho y > docs/X.md'), ['docs/X.md']);
  assert.deepEqual(cele('printf "He said \\"hi\\"\\n" >> docs/X.md'), ['docs/X.md']);
  assert.deepEqual(cele("echo a > docs/X.md; # it's done\necho b > docs/Y.md"), ['docs/X.md', 'docs/Y.md']);
  assert.deepEqual(cele('echo hi # > docs/X.md'), []);
  assert.deepEqual(cele('echo a#b > docs/Z.md'), ['docs/Z.md'], '# w srodku slowa to nie komentarz');
  assert.deepEqual(cele('echo a >| docs/X.md'), ['docs/X.md']);
  if (process.platform === 'win32') assert.deepEqual(cele('echo x >> /c/proj/docs/H.md').map((p) => p.toLowerCase()), [path.relative(cwd, 'C:/proj/docs/H.md').split(path.sep).join('/').toLowerCase()]);
});

test('PostToolUse after Bash: a shell write to a document speaks once per file, other commands stay silent (annex C)', (t) => {
  const p = projekt(t, 'włączona · zakresy: dokumenty · pokaz: notka · profil: nie');
  const bash = (polecenie) => kontekst(hook(HOOK, p, { hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: { command: polecenie } }));
  assert.equal(bash('git status --short'), '');
  assert.equal(bash("printf 'x' >> docs/archiwum/STARY.md"), '', 'filtr H3 obowiazuje takze dla powloki');
  const r = bash('cd "' + p.cwd + '" && cat >> docs/NOTATKI.md <<\'EOF\'\nAkapit.\nEOF');
  assert.ok(r.includes('Zapisales docs/NOTATKI.md'), r);
  assert.equal(bash("printf 'y' >> docs/NOTATKI.md"), '', 'raz na plik w turze');
  assert.equal(kontekst(zapis(p, 'docs/NOTATKI.md', 'Edit')), '', 'Edit tego samego pliku w tej turze tez milczy');
  const wyl = projekt(t, 'wyłączona · zakresy: dokumenty · pokaz: notka · profil: nie');
  assert.equal(hook(HOOK, wyl, { hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: { command: "printf 'x' >> docs/N.md" } }), '');
});

test('hooks.json registers humanize-continuous alone on PostToolUse Bash (annex C)', () => {
  const h = JSON.parse(fs.readFileSync(path.join(HOOKI, 'hooks.json'), 'utf8')).hooks.PostToolUse;
  const grupa = h.find((g) => new RegExp(g.matcher).test('Bash'));
  assert.ok(grupa, 'grupa PostToolUse dla Bash');
  assert.deepEqual(grupa.hooks.map((x) => path.basename(x.command.replace(/"$/, ''))), ['humanize-continuous.js']);
  assert.ok(!new RegExp(grupa.matcher).test('Write'), 'grupa Bash nie dubluje grupy zapisu');
});

// --- raz na plik w turze ------------------------------------------------------------------

test('two versions: several writes of one file in a turn give one comparison; yes does not re-trigger', (t) => {
  const p = projekt(t, WLACZONA_WSZYSTKO);
  const pierwszy = kontekst(zapis(p, 'docs/STATE.md'));
  assert.ok(pierwszy.includes('Tryb dwie wersje: pokaz zmienione akapity obok oryginalu i zapytaj raz o "tak"'));
  assert.equal(zapis(p, 'docs/STATE.md', 'Edit'), '');
  assert.equal(zapis(p, 'docs/STATE.md', 'MultiEdit'), '');
  assert.notEqual(zapis(p, 'docs/DZIENNIK.md', 'Edit'), '', 'inny plik w tej samej turze mowi');
  // "tak" po pokazie dwoch wersji i powiadomienie w tle nie zaczynaja tury: zapis wersji
  // zaakceptowanej przechodzi bez kolejnej reguly
  assert.notEqual(prompt(p, 'tak'), '', 'odpowiedz na "tak" to wciaz czat: regula przed odpowiedzia jest');
  assert.equal(zapis(p, 'docs/STATE.md', 'Edit'), '');
  assert.equal(prompt(p, '<task-notification>\n<status>completed</status>\n</task-notification>'), '');
  assert.equal(zapis(p, 'docs/STATE.md', 'Edit'), '');
  // nowe polecenie czlowieka zaczyna ture
  assert.notEqual(prompt(p, 'dopisz do STATE.md zdanie o testach'), '');
  assert.notEqual(zapis(p, 'docs/STATE.md', 'Edit'), '', 'nowa tura');
});

test('note mode asks for one line with the pattern count, and the rule carries the fact guard', (t) => {
  const p = projekt(t, 'włączona · zakresy: dokumenty · pokaz: notka · profil: nie');
  const r = kontekst(zapis(p, 'docs/DZIENNIK.md'));
  assert.ok(r.includes('Tryb notka: zapisz poprawke od razu i dopisz w odpowiedzi jedna linie z liczba usunietych wzorcow.'));
  assert.ok(r.includes("node .claude/relai/tools/humanize-facts.js 'docs/DZIENNIK.md' -"));
  assert.ok(r.includes('rodzaj robocze, ton rzeczowy'));
  assert.match(r, /^[\x20-\x7e]+$/);
  assert.ok(kontekst(zapis(p, 'docs/PRZEWODNIK.md')).includes('rodzaj formalne, ton staranny'));
});

test('turn state: one folder per session, old folders cleaned, others untouched', (t) => {
  const p = projekt(t, null);
  assert.equal(tryb.pierwszyZapisWTurze(p.cwd, SESJA, 'docs/A.md'), true);
  assert.equal(tryb.pierwszyZapisWTurze(p.cwd, SESJA, 'docs/a.md'), false, 'Windows: wielkosc liter');
  assert.equal(tryb.pierwszyZapisWTurze(p.cwd, 'inna', 'docs/A.md'), true, 'inna sesja ma wlasny katalog');
  const stary = tryb.katalogTury(p.cwd, 'stara');
  fs.mkdirSync(stary, { recursive: true });
  const tydzienTemu = (Date.now() - 8 * 24 * 3600 * 1000) / 1000;
  fs.utimesSync(stary, tydzienTemu, tydzienTemu);
  tryb.nowaTura(p.cwd, SESJA);
  assert.equal(fs.existsSync(tryb.katalogTury(p.cwd, SESJA)), false);
  assert.equal(fs.existsSync(tryb.katalogTury(p.cwd, 'inna')), true);
  assert.equal(fs.existsSync(stary), false);
  assert.equal(tryb.katalogTury(p.cwd, '../x'), null);
  assert.equal(tryb.pierwszyZapisWTurze(p.cwd, '', 'docs/A.md'), false, 'bez identyfikatora sesji: cisza');
});

test('which prompts start a turn and which get the rule', () => {
  assert.equal(tryb.zaczynaTure('tak'), false);
  assert.equal(tryb.zaczynaTure('Tak.'), false);
  assert.equal(tryb.zaczynaTure('<task-notification><status>completed</status></task-notification>'), false);
  assert.equal(tryb.zaczynaTure('tak, ale zmien drugi akapit'), true);
  assert.equal(tryb.zaczynaTure('/relai-humanize docs/STATE.md'), true);
  assert.equal(tryb.wymagaReguly(''), false);
  assert.equal(tryb.wymagaReguly('<task-notification>x</task-notification>'), false);
  assert.equal(tryb.wymagaReguly('tak'), true, 'odpowiedz na "tak" tez jest czatem');
});

// --- optymalizator i humanizacja razem (H6) -----------------------------------------------

test('both continuous modes on: each hook adds its own rule, humanization excludes the optimizer proposal', (t) => {
  const p = projekt(t, 'włączona · zakresy: czat · pokaz: notka · profil: nie', '| 2026-10-01 | Tryb ciągły | włączony |\n');
  fs.mkdirSync(path.join(p.cwd, '.claude', 'relai', 'zgoda-promptu'), { recursive: true });
  fs.writeFileSync(path.join(p.cwd, '.claude', 'relai', 'zgoda-promptu', SESJA + '.json'), JSON.stringify({ decyzja: 'tak' }));
  const zdarzenie = { hook_event_name: 'UserPromptSubmit', prompt: 'dopisz test do modulu ustawien' };
  const opt = kontekst(hook(HOOK_OPTYMALIZATORA, p, zdarzenie));
  const hum = kontekst(hook(HOOK, p, zdarzenie));
  assert.ok(opt.startsWith('[RelAI tryb ciagly]'));
  assert.ok(hum.startsWith('[RelAI humanizacja]') && hum.includes('propozycji i oryginalu z /relai-prompt'));
  // kolejnosc w hooks.json: optymalizator przed humanizacja
  const konfig = JSON.parse(fs.readFileSync(path.join(HOOKI, 'hooks.json'), 'utf8'));
  const polecenia = konfig.hooks.UserPromptSubmit.flatMap((g) => g.hooks.map((h) => h.command));
  const iOpt = polecenia.findIndex((c) => c.includes('prompt-mode.js'));
  const iHum = polecenia.findIndex((c) => c.includes('humanize-continuous.js'));
  assert.ok(iOpt >= 0 && iHum > iOpt, polecenia.join(' | '));
  const poZapisie = konfig.hooks.PostToolUse.find((g) => g.matcher === '^(Write|Edit|MultiEdit)$');
  assert.ok(poZapisie.hooks.some((h) => h.command.includes('humanize-continuous.js')));
});
