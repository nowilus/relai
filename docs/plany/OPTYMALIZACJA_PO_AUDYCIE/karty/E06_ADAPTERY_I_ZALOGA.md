# E6 — Adaptery i załoga

Konwencje wspólne: [00_KONWENCJE.md](00_KONWENCJE.md). Ten etap zmienia deinstalator adaptera
Cursora, hook skanu sekretów Codeksa i `core/process/crew.js` (delegacja zadań do innych narzędzi)
oraz ich testy. Kopii `.claude/relai/tools/crew.js` **nie edytujesz** — nadpisuje ją hook startu.

- **Karty w kolejności wykonania:** K-D5 → K-D9 → K-D6 → K-D7. K-D5 jest niezależna i najkrótsza;
  K-D9 eksportuje `wykonaj` i dokłada mu opcję środowiska, na której stoją testy K-D6; K-D6
  zmienia `wykonaj` i polecenie przeglądu; K-D7 idzie ostatnia, bo jako jedyna zmienia oczekiwanie
  istniejącego testu.
- **Efekt widoczny:** `crew.js review --runtime codex` dostaje cały, wieloliniowy prompt
  recenzenta (dziś cmd.exe ucina go na pierwszej nowej linii); deinstalator Cursora z manifestem
  wskazującym `../plik` odmawia i niczego nie kasuje; podproces Codeksa uruchomiony z sesji Claude
  Code nie dziedziczy `CLAUDECODE`, więc jego skaner sekretów nie milknie.
- **Szacunek:** SZACUNEK 1 sesja.
- **Warunki zatrzymania:** kotwica z karty nie pasuje do pliku; test z „Test najpierw” jest
  zielony przed zmianą albo czerwony z błędu innego niż asercja (np. `TypeError` przy braku
  eksportu — wtedy najpierw krok eksportu z karty); `git --version` niedostępny (fikstury K-D9).
- **Weryfikacja etapu:**

  ```bash
  node --test "adapters/cursor/tests/*.test.js"
  node --test "adapters/codex/tests/*.test.js"
  node --test "core/process/tests/*.test.*"
  node core/tools/validate-adapters.js
  ```

  Stan wyjściowy: cursor 4, codex 24, core/process — stan z wpisu dziennika etapu E5. Po etapie:
  cursor **10**, codex **28**, core/process — stan z wpisu dziennika etapu E5 plus 7 (narastająco:
  388 → 395, albo 389 → 396 przy ścieżce K-C9 z dodatkowym testem; od samego `main` byłoby 364),
  0 czerwonych; `validate-adapters.js` kod 0 z jednym
  ostrzeżeniem o `security-audit/SKILL.md`. `core/process` trwa ok. 110 s, codex ok. 40 s —
  uruchamiaj w tle albo z limitem 10 minut.

Każda funkcja i każdy test z tego pliku zostały uruchomione na prototypie przed zapisaniem karty
(2026-11-09): nowe testy zielone na prototypie, czerwone na kodzie z `main` z powodu asercji;
istniejące testy (cursor 4, `crew.test.js` 17) zielone na prototypie.

---

## K-D5 — deinstalator Cursora kasuje tylko pliki pod `.cursor/` projektu

- **Cel:** `install.js <projekt> --uninstall` z manifestem zawierającym choć jedną pozycję spoza
  `<projekt>/.cursor/` (z `..`, bezwzględną, plik projektu poza `.cursor/`, ścieżkę przez
  dowiązanie wychodzące z `.cursor/`) kończy się kodem 1 i **nie usuwa niczego** — ani plików,
  ani wskazówek `AGENTS.md`/`CLAUDE.md`, ani manifestu.
- **Pliki:** `adapters/cursor/install.js`, `adapters/cursor/tests/install.test.js`.
- **Decyzja projektowa:** cała lista jest sprawdzana przed pierwszym usunięciem i jedna zła
  pozycja zatrzymuje deinstalację, bo manifest leży w projekcie i może przyjść cudzym commitem —
  pomijanie złych pozycji po cichu ukryłoby podróbkę.
- **Stan dziś** (linie 322–341):

  ```js
  function uninstall(projekt) {
    const manifestPath = path.join(projekt, '.cursor', MANIFEST_NAME);
  ```

  ```js
    let usuniete = 0;
    for (const rel of (manifest.files || [])) {
      const p = path.join(projekt, ...rel.split('/'));
      try { fs.unlinkSync(p); usuniete++; } catch (_) { /* juz go nie ma */ }
  ```

  Instalator zapisuje do manifestu wyłącznie ścieżki pod `.cursor/` (reguły, komendy, agenci,
  skille, `hooks.json`) — sprawdzone uruchomieniem instalacji na pustym projekcie.
- **Zmiana:**
  1. Nad `function uninstall` dodaj:

     ```js
     // Pozycja manifestu -> sciezka bezwzgledna do usuniecia albo null. Manifest lezy w projekcie
     // i moze przyjsc cudzym commitem, wiec jest dana niezaufana: usuwamy wylacznie pliki pod
     // <projekt>/.cursor/ — bez "..", bez sciezki bezwzglednej i bez wyjscia przez dowiazanie
     // (junction na Windows) w katalogu nadrzednym pliku. Instalator zapisuje tylko takie pozycje.
     function sciezkaZManifestu(projekt, rel) {
       if (typeof rel !== 'string' || !rel) return null;
       const czesci = rel.split(/[\\/]/);
       if (path.isAbsolute(rel) || /^[A-Za-z]:/.test(rel) || czesci.includes('..')) return null;
       const korzen = fs.realpathSync(projekt);
       const baza = path.join(korzen, '.cursor');
       const p = path.join(korzen, ...czesci);
       const wzgledna = path.relative(baza, p);
       if (!wzgledna || wzgledna.startsWith('..') || path.isAbsolute(wzgledna)) return null;
       let rodzic = null;
       try { rodzic = fs.realpathSync(path.dirname(p)); } catch (_) { return p; } // brak katalogu = brak pliku
       const wzglednyRodzic = path.relative(baza, rodzic);
       return wzglednyRodzic.startsWith('..') || path.isAbsolute(wzglednyRodzic) ? null : p;
     }
     ```

  2. W `uninstall`, **między** blokiem `if (!manifest) {…}` a `if (!guidanceUninstall(projekt))`,
     wstaw:

     ```js
       // Cala lista sprawdzona PRZED pierwszym usunieciem: jedna podejrzana pozycja = nic nie ruszamy.
       const wpisy = Array.isArray(manifest.files) ? manifest.files : [];
       const odrzucone = wpisy.filter((rel) => !sciezkaZManifestu(projekt, rel));
       if (odrzucone.length) {
         process.stderr.write('RelAI install: manifest ' + manifestPath + ' wskazuje pliki spoza .cursor/ projektu:\n' +
           odrzucone.map((rel) => '  - ' + String(rel)).join('\n') + '\n' +
           'Nie usunieto niczego. Sprawdz, skad pochodzi manifest, popraw go albo skasuj pliki recznie.\n');
         return 1;
       }
     ```

  3. Pętlę usuwania zastąp:

     ```js
       for (const rel of wpisy) {
         try { fs.unlinkSync(sciezkaZManifestu(projekt, rel)); usuniete++; } catch (_) { /* juz go nie ma */ }
       }
     ```

- **Test najpierw:** dopisz na końcu `adapters/cursor/tests/install.test.js` (helpery `projekt`,
  `uruchom`, stała `INSTALL` już są w pliku):

  ```js
  // --- K-D5 (etap E06 planu OPTYMALIZACJA_PO_AUDYCIE) -----------------------------------------
  // Manifest jest dana z dysku projektu: deinstalacja nie moze usunac niczego spoza .cursor/.
  function deinstalacjaZManifestem(t, wpis) {
    const root = projekt(t);
    const dir = path.join(root, 'proj');
    fs.mkdirSync(path.join(dir, '.cursor', 'rules'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'docs'));
    const ofiaraPoza = path.join(root, 'ofiara.txt');
    const ofiaraWProjekcie = path.join(dir, 'docs', 'plan.md');
    const nasz = path.join(dir, '.cursor', 'rules', 'relai-core.mdc');
    for (const p of [ofiaraPoza, ofiaraWProjekcie, nasz]) fs.writeFileSync(p, 'x\n');
    const files = ['.cursor/rules/relai-core.mdc', typeof wpis === 'function' ? wpis(root, dir) : wpis];
    fs.writeFileSync(path.join(dir, '.cursor', 'relai-install.json'), JSON.stringify({ adapter: 'cursor', files }));
    const r = spawnSync(process.execPath, [INSTALL, dir, '--uninstall'], { encoding: 'utf8', timeout: 120000 });
    return { r, dir, ofiaraPoza, ofiaraWProjekcie, nasz };
  }

  const zle = [
    ['wyjscie przez ..', '../ofiara.txt'],
    ['wyjscie przez .. pod .cursor', '.cursor/../../ofiara.txt'],
    ['sciezka bezwzgledna', (root) => path.join(root, 'ofiara.txt').split(path.sep).join('/')],
    ['plik projektu spoza .cursor', 'docs/plan.md'],
    ['dowiazanie w .cursor wskazujace na zewnatrz', (root, dir) => {
      fs.symlinkSync(root, path.join(dir, '.cursor', 'link'), 'junction');
      return '.cursor/link/ofiara.txt';
    }],
  ];

  for (const [opis, wpis] of zle) {
    test('deinstalacja odmawia, gdy manifest wskazuje plik poza .cursor/: ' + opis, (t) => {
      const { r, dir, ofiaraPoza, ofiaraWProjekcie, nasz } = deinstalacjaZManifestem(t, wpis);
      assert.equal(r.status, 1, r.stdout + r.stderr);
      assert.match(r.stderr, /spoza \.cursor\//);
      for (const p of [ofiaraPoza, ofiaraWProjekcie, nasz]) assert.ok(fs.existsSync(p), p);
      assert.ok(fs.existsSync(path.join(dir, '.cursor', 'relai-install.json')), 'manifest zostaje');
    });
  }

  test('deinstalacja usuwa pozycje manifestu pod .cursor/ zapisane z ukosnikami', (t) => {
    const dir = projekt(t);
    uruchom(dir);
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, '.cursor', 'relai-install.json'), 'utf8'));
    assert.ok(manifest.files.length > 0);
    assert.ok(manifest.files.every((rel) => rel.startsWith('.cursor/')), 'instalator zapisuje tylko .cursor/');
    uruchom(dir, '--uninstall');
    for (const rel of manifest.files) assert.equal(fs.existsSync(path.join(dir, ...rel.split('/'))), false, rel);
  });
  ```

  Przed zmianą (zmierzone): pięć testów odmowy czerwonych (kod 0, plik skasowany), ostatni zielony.
- **Weryfikacja:** `node --test "adapters/cursor/tests/*.test.js"` → 10 pass, 0 fail.
- **Nie ruszasz:** `guardrails`/`guidanceUninstall`/`zapiszHooks`; instalacji (`install`);
  sprzątania pustych katalogów `usunPuste`.
- **Pułapki:** `fs.symlinkSync(…, 'junction')` działa na Windows bez uprawnień administratora;
  na Linuksie i macOS typ jest ignorowany i powstaje zwykłe dowiązanie — test przechodzi tak samo.
  Sprzątanie fikstury z junction przez istniejący helper `projekt` nie zostawia katalogów
  `relai-cursor-install-*` w `os.tmpdir()` (sprawdzone: 0 przed i 0 po). `os.tmpdir()` bywa krótką nazwą 8.3 —
  dlatego porównanie idzie po `fs.realpathSync`.
- **Gotowe, gdy:** 10 testów zielonych w `adapters/cursor/tests`.

---

## K-D9 — skaner Codeksa nie milknie w załodze i nie przepuszcza śledzonych `.env*`

- **Cel:** (a) `crew.js` uruchamia inne narzędzie bez zmiennych, po których rozpoznaje się
  gospodarza (`NARZEDZIA[*].env`) — poza zmiennymi samego narzędzia docelowego; (b) hook
  `adapters/codex/hooks/secret-scanner.js` przepuszcza plik `.env*` bez skanu wyłącznie wtedy, gdy
  git nie umie odpowiedzieć — tak jak adapter Claude Code (`isGitIgnored`).
- **Pliki:** `core/process/crew.js`, `core/process/tests/crew.test.js`,
  `adapters/codex/hooks/secret-scanner.js`, `adapters/codex/tests/secret-scanner.test.js` (nowy).
- **Decyzja projektowa:** zmienne usuwa załoga, a nie hook Codeksa, bo sprawdzenie `CLAUDECODE`
  w hooku (i w opakowaniach `.cmd`, `.sh`) jest potrzebne: Claude Code ładuje katalog `hooks/`
  korzenia pluginu i ma własny skaner (P-013).
- **Stan dziś:**

  `crew.js` (linie 149–158, 507, 540, 707):

  ```js
  function wykonaj(cmd, args, opcje) {
    const o = opcje || {};
    const wspolne = {
  ```

  ```js
      env: Object.assign({}, process.env, o.env || {}),
  ```

  ```js
    const w = exec(komenda.cmd, komenda.args, { cwd, stdin: komenda.stdin, timeoutS: opcje.timeoutS, env: opcje.env });
  ```

  (ta sama linia dwa razy: w `run` i w `review`)

  ```js
    run, review, status, statusReport, sciezkaCli, main,
  ```

  `adapters/codex/hooks/secret-scanner.js` (linie 21–24):

  ```js
  function ignored(cwd, file) {
    const result = spawnSync('git', ['check-ignore', '-q', '--', file], { cwd, windowsHide: true, timeout: 5000 });
    return result.status === 0 || path.basename(file).startsWith('.env');
  }
  ```

- **Zmiana:**
  1. `crew.js`: dopisz `wykonaj, zmienneInnychGospodarzy,` w nowej linii pod
     `run, review, status, statusReport, sciezkaCli, main,` w `module.exports`.
  2. `crew.js`: nad `function wykonaj` dodaj:

     ```js
     // Zmienne, po ktorych narzedzia rozpoznaja gospodarza (NARZEDZIA[*].env), poza zmiennymi
     // narzedzia docelowego. Proces innego narzedzia ich nie dziedziczy: hook skanu sekretow
     // Codeksa milknie, gdy widzi CLAUDECODE (P-013), wiec odziedziczona zmienna wylaczala guardrail.
     function zmienneInnychGospodarzy(narzedzie) {
       return Object.entries(NARZEDZIA).filter(([id]) => id !== narzedzie).flatMap(([, n]) => n.env);
     }
     ```

  3. `crew.js`, w `wykonaj`: po `const o = opcje || {};` dodaj trzy linie i zmień pole `env`:

     ```js
       const env = Object.assign({}, process.env, o.env || {});
       const usun = new Set((o.bezZmiennych || []).map((k) => k.toUpperCase()));
       for (const k of Object.keys(env)) if (usun.has(k.toUpperCase())) delete env[k];
     ```

     a w obiekcie `wspolne` linię `env: Object.assign({}, process.env, o.env || {}),` → `env,`.
  4. `crew.js`: obie linie `const w = exec(…)` w `run` i `review` (użyj Edit z `replace_all`):

     ```js
       const w = exec(komenda.cmd, komenda.args, { cwd, stdin: komenda.stdin, timeoutS: opcje.timeoutS, env: opcje.env, bezZmiennych: zmienneInnychGospodarzy(narzedzie) });
     ```

  5. `adapters/codex/hooks/secret-scanner.js`: zastąp `ignored`:

     ```js
     // Same rule as the Claude Code adapter (isGitIgnored): git decides; the .env* escape hatch
     // applies only when git cannot answer (no git, no repository, timeout). A tracked .env.example
     // is scanned like any other tracked file.
     function ignored(cwd, file) {
       const result = spawnSync('git', ['check-ignore', '-q', '--', file], { cwd, windowsHide: true, timeout: 5000 });
       if (result.status === 0) return true;
       if (result.status === 1) return false;
       return path.basename(file).startsWith('.env');
     }
     ```

- **Test najpierw:**
  1. Najpierw krok 1 zmiany (sam eksport; bez niego test kończy się `TypeError`, nie asercją).
  2. Dopisz na końcu `core/process/tests/crew.test.js`:

     ```js
     // --- K-D9, K-D6, K-D7 (etap E06 planu OPTYMALIZACJA_PO_AUDYCIE) -----------------------------

     function probe(t) {
       const dir = fixture(t);
       const plik = path.join(dir, 'probe.js');
       fs.writeFileSync(plik, 'process.stdout.write(JSON.stringify({ host: process.env.CLAUDECODE || "", args: process.argv.slice(2) }));\n');
       return plik;
     }

     test('K-D9: run and review strip the other hosts\' variables from the child environment', (t) => {
       const cwd = fixture(t);
       const exec = stubExec({ 'codex exec': { stdout: '## Report' }, 'codex review': { stdout: 'APPROVE' }, 'claude -p': { stdout: '## Report' } });
       crew.run(cwd, { runtime: 'codex', role: 'coder', prompt: 'x', runId: 'r1', taskId: 'a', exec, cli: 'codex' });
       crew.review(cwd, { runtime: 'codex', runId: 'r1', exec, cli: 'codex' });
       crew.run(cwd, { runtime: 'claude-code', role: 'coder', prompt: 'x', runId: 'r1', taskId: 'b', exec, cli: 'claude' });
       const [codexRun, codexReview, claudeRun] = exec.wywolania.map((w) => w.opcje.bezZmiennych || []);
       for (const lista of [codexRun, codexReview]) {
         for (const k of ['CLAUDECODE', 'CLAUDE_CODE_ENTRYPOINT', 'CURSOR_AGENT', 'CURSOR_TRACE_ID']) assert.ok(lista.includes(k), k);
         assert.ok(!lista.includes('CODEX_HOME'), 'wlasna zmienna narzedzia docelowego zostaje');
       }
       assert.ok(claudeRun.includes('CODEX_THREAD_ID') && !claudeRun.includes('CLAUDECODE'));
     });

     test('K-D9: wykonaj removes the listed variables before spawning', (t) => {
       const plik = probe(t);
       const stary = process.env.CLAUDECODE;
       process.env.CLAUDECODE = '1';
       try {
         const z = crew.wykonaj(process.execPath, [plik], { timeoutS: 30 });
         assert.equal(JSON.parse(z.stdout).host, '1', 'kontrola: bez listy zmienna przechodzi');
         const bez = crew.wykonaj(process.execPath, [plik], { timeoutS: 30, bezZmiennych: ['CLAUDECODE'] });
         assert.equal(JSON.parse(bez.stdout).host, '');
       } finally {
         if (stary === undefined) delete process.env.CLAUDECODE; else process.env.CLAUDECODE = stary;
       }
     });
     ```

  3. Utwórz `adapters/codex/tests/secret-scanner.test.js`:

     ```js
     'use strict';

     // Hook secret-scanner in Codex (plan OPTYMALIZACJA_PO_AUDYCIE, card K-D9). The .env* escape hatch
     // applies only when git cannot answer, as in the Claude Code adapter. The test runs the hook as a
     // process without CLAUDECODE: under Claude Code that variable silences this copy on purpose (P-013).

     const assert = require('node:assert/strict');
     const fs = require('node:fs');
     const os = require('node:os');
     const path = require('node:path');
     const test = require('node:test');
     const { spawnSync } = require('node:child_process');

     const ROOT = path.resolve(__dirname, '..', '..', '..');
     const HOOK = path.join(ROOT, 'adapters', 'codex', 'hooks', 'secret-scanner.js');
     const secret = () => ['PASS', 'WORD'].join('') + '=' + ['m7Q', '9rV', '2zL', '8pN'].join('') + '\n';

     function hookEnv() {
       const env = { ...process.env, CLAUDE_PLUGIN_ROOT: ROOT };
       for (const key of Object.keys(env)) if (/^(CLAUDECODE|GIT_)/i.test(key)) delete env[key];
       return env;
     }

     function project(t, { git }) {
       const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'relai-k-d9-codex-'));
       t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
       fs.mkdirSync(path.join(dir, 'docs'));
       fs.writeFileSync(path.join(dir, 'docs', 'USTAWIENIA.md'), '# USTAWIENIA\n\nWersja RelAI: 3.7.0\n');
       if (git) {
         assert.equal(spawnSync('git', ['init', '--quiet'], { cwd: dir, env: hookEnv() }).status, 0);
         fs.writeFileSync(path.join(dir, '.gitignore'), '.env\n');
       }
       return dir;
     }

     function write(dir, file, env = hookEnv()) {
       const payload = JSON.stringify({ cwd: dir, hook_event_name: 'PreToolUse', tool_name: 'Write',
         tool_input: { file_path: path.join(dir, file), content: secret() } });
       const r = spawnSync(process.execPath, [HOOK], { input: payload, encoding: 'utf8', env, timeout: 30000 });
       assert.equal(r.status, 0, r.stderr);
       return r.stdout;
     }

     test('tracked .env.example with a secret is denied in a git repository', (t) => {
       assert.match(write(project(t, { git: true }), '.env.example'), /"permissionDecision":"deny"/);
     });

     test('ignored .env stays writable in a git repository', (t) => {
       assert.equal(write(project(t, { git: true }), '.env'), '');
     });

     test('.env.local outside a git repository keeps the escape hatch', (t) => {
       assert.equal(write(project(t, { git: false }), '.env.local'), '');
     });

     test('control: an ordinary file outside git is still denied', (t) => {
       assert.match(write(project(t, { git: false }), 'config.txt'), /"permissionDecision":"deny"/);
     });
     ```

  Przed zmianą (zmierzone): oba testy K-D9 w `crew.test.js` czerwone na asercji (`CLAUDECODE`
  nie ma na liście; podproces widzi `'1'`); w nowym pliku czerwony tylko pierwszy test, trzy
  pozostałe zielone — pilnują furtki i kontroli.
- **Weryfikacja:** `node --test "core/process/tests/crew.test.js"` → 19 pass;
  `node --test "adapters/codex/tests/*.test.js"` → 28 pass, 0 fail.
- **Nie ruszasz:** linii `if (process.env.CLAUDECODE) process.exit(0);` w hooku Codeksa ani
  warunków `CLAUDECODE` w `secret-scanner.cmd` i `secret-scanner.sh` — są potrzebne (P-013);
  listy `NARZEDZIA[*].env` (z niej korzysta też `gospodarz()`); hooków Claude Code (E04/E05).
- **Pułapki:**
  - Testy uruchamiasz w sesji Claude Code, więc `CLAUDECODE` jest ustawione w środowisku testu —
    stąd `hookEnv()` je usuwa; bez tego hook milknie i test „deny” kłamie.
  - `CLAUDE_PLUGIN_ROOT` w sesji może wskazywać zainstalowany plugin 3.7.0 — test ustawia go na
    korzeń repozytorium jawnie.
  - Test „outside git” zakłada, że `os.tmpdir()` nie leży w repozytorium gita (na tej maszynie
    nie leży). Jeśli leży, `git check-ignore` odpowie 1 i test się wyłoży — zatrzymaj się.
  - Tekst testu nie może zawierać gotowego przypisania — wartość składa `secret()`.
- **Gotowe, gdy:** `crew.test.js` 19 zielonych, `adapters/codex/tests` 28 zielonych.

---

## K-D6 — `crew.js` na Windows: prompt stdin-em, `model` i `base` z białej listy

- **Cel:** żaden tekst dowolny nie idzie przez argv do cmd.exe: przegląd Codeksa czyta prompt ze
  stdin (`codex review … -`); `--model` i `--base` spoza białej listy znaków kończą się wyjątkiem
  przed uruchomieniem; `wykonaj` na Windows odmawia argumentu z `%`, CR, LF albo NUL.
- **Pliki:** `core/process/crew.js`, `core/process/tests/crew.test.js`.
- **Decyzja projektowa:** stdin, nie plik, bo `codex review --help` (lokalnie, 2026-11-09) mówi
  wprost: „If `-` is used, read from stdin”, a pozostałe narzędzia już tak dostają prompt.
- **Stan dziś** (linie 162–164, 350–353, 382–387):

  ```js
      const cyt = (a) => '"' + String(a).replace(/"/g, '\\"') + '"';
  ```

  ```js
    const cli = opcje.cli || sciezkaCli(narzedzie, opcje.env);
    if (narzedzie === 'claude-code') {
  ```

  (pierwsze wystąpienie — w `buildCommand`)

  ```js
    if (narzedzie === 'codex') {
      const args = ['review', '--color', 'never'];
      if (opcje.base) args.push('--base', opcje.base); else args.push('--uncommitted');
      if (opcje.model) args.push('-c', 'model="' + opcje.model + '"');
      args.push(opcje.prompt || ROLE.reviewer.preambula.join('\n'));
      return { cmd: cli, args, stdin: '', cwd };
    }
  ```

- **Zmiana:**
  1. Pod `FLAGI_ZAKAZANE` dodaj:

     ```js
     // Wartosci, ktore trafiaja do wiersza polecen (na Windows przez cmd.exe): biala lista znakow.
     // Pierwszy znak nie jest myslnikiem, wiec wartosc nie udaje kolejnej flagi.
     const MODEL_RE = /^[A-Za-z0-9][A-Za-z0-9._:\/\[\]=,-]{0,119}$/;
     const BASE_RE = /^[A-Za-z0-9][A-Za-z0-9._\/-]{0,199}$/;

     function sprawdzWartosc(nazwa, wartosc, re) {
       if (wartosc === undefined || wartosc === null || wartosc === '') return wartosc;
       if (!re.test(String(wartosc))) throw new Error('niedozwolona wartosc ' + nazwa + ': ' + JSON.stringify(String(wartosc)));
       return String(wartosc);
     }
     ```

     `[ ] = ,` są na liście, bo Cursor przyjmuje modele z parametrami w nawiasie (`agent --help`:
     `claude-opus-4-8[context=1m,effort=high,fast=false]`), a Claude Code sufiks `[1m]`.
  2. Nad `function wykonaj` (pod funkcją z K-D9) dodaj:

     ```js
     // cmd.exe rozwija %ZMIENNA% takze w cudzyslowie i konczy polecenie na nowej linii, wiec takiego
     // argumentu nie da sie przekazac bezpiecznie. Tekst dowolny (prompt) idzie stdin-em.
     const ZNAK_NIEDOZWOLONY_CMD = /[%\r\n\0]/;
     ```

     a w `wykonaj`, w gałęzi `if (process.platform === 'win32') {`, **przed** linią `const cyt = …`:

     ```js
         const zly = [cmd].concat(args).find((a) => ZNAK_NIEDOZWOLONY_CMD.test(String(a)));
         if (zly !== undefined) {
           return { status: null, stdout: '', stderr: '', error: 'argument z %, CR, LF albo NUL nie przejdzie bezpiecznie przez cmd.exe', timedOut: false };
         }
     ```

  3. W `buildCommand` pod `const cli = …` dodaj `sprawdzWartosc('--model', opcje.model, MODEL_RE);`.
  4. W `buildReviewCommand` pod `const cli = …` dodaj dwie linie:
     `sprawdzWartosc('--base', opcje.base, BASE_RE);` i
     `sprawdzWartosc('--model', opcje.model, MODEL_RE);`; w gałęzi `codex` zastąp dwie ostatnie
     linie:

     ```js
         // "-" = instrukcje recenzji ze stdin (codex review --help). Jako argument prompt wieloliniowy
         // byl ucinany przez cmd.exe na pierwszej nowej linii, a cudzyslow w nim otwieral wstrzykniecie.
         args.push('-');
         return { cmd: cli, args, stdin: opcje.prompt || ROLE.reviewer.preambula.join('\n'), cwd };
     ```

  5. Zaktualizuj komentarz nad `wykonaj` („komenda idzie przez cmd.exe z jawnym cytowaniem kazdego
     argumentu”) o zdanie: „Argumenty to wylacznie flagi, sciezki i wartosci z bialej listy; tekst
     dowolny idzie stdin-em.”
- **Test najpierw:** dopisz pod testami K-D9 (helper `probe` już jest):

  ```js
  test('K-D6: codex review takes the reviewer prompt from stdin, not from argv', () => {
    const prompt = 'Line one\nLine two with "quotes" & ampersand';
    const c = crew.buildReviewCommand('codex', { cwd: '/p', cli: 'codex', prompt });
    assert.equal(c.args[c.args.length - 1], '-');
    assert.equal(c.stdin, prompt);
    assert.ok(c.args.every((a) => !String(a).includes('Line')), c.args.join(' '));
    assert.match(crew.buildReviewCommand('codex', { cwd: '/p', cli: 'codex' }).stdin, /role of REVIEWER/);
  });

  test('K-D6: model and base outside the whitelist are refused before anything runs', () => {
    for (const model of ['m1" & echo INJECTED', 'gpt-x\nrm', '--yolo', 'a%PATH%b']) {
      assert.throws(() => crew.buildCommand('codex', { cwd: '/p', cli: 'codex', model, prompt: 'x' }), /niedozwolona wartosc --model/, model);
    }
    for (const base of ['main" & echo INJECTED', '--output=x', 'main;rm', 'a b']) {
      assert.throws(() => crew.buildReviewCommand('codex', { cwd: '/p', cli: 'codex', base }), /niedozwolona wartosc --base/, base);
    }
    for (const model of ['gpt-5.6-terra', 'claude-opus-5-5[1m]', 'claude-opus-4-8[context=1m,effort=high]', 'sonnet-4.5']) {
      assert.doesNotThrow(() => crew.buildCommand('cursor', { cwd: '/p', cli: 'agent', model, prompt: 'x' }), model);
    }
    assert.doesNotThrow(() => crew.buildReviewCommand('codex', { cwd: '/p', cli: 'codex', base: 'feature/x-1.2' }));
  });

  test('K-D6: wykonaj passes cmd.exe metacharacters verbatim and refuses percent and newlines', (t) => {
    const plik = probe(t);
    const ok = crew.wykonaj(process.execPath, [plik, 'a&b|c<d>e^f', 'C:/dir with space/x'], { timeoutS: 30 });
    assert.deepEqual(JSON.parse(ok.stdout).args, ['a&b|c<d>e^f', 'C:/dir with space/x'], ok.stderr);
    if (process.platform !== 'win32') { t.skip('straznik cmd.exe dziala tylko na Windows'); return; }
    for (const zly of ['a%PATH%b', 'line\nnext']) {
      const r = crew.wykonaj(process.execPath, [plik, zly], { timeoutS: 30 });
      assert.equal(r.status, null);
      assert.match(r.error, /cmd\.exe/);
      assert.equal(r.stdout, '');
    }
  });
  ```

  Przed zmianą (zmierzone): trzy czerwone na asercji; w trzecim część z metaznakami przechodzi
  już dziś (kontrola pozytywna cytowania), a `a%PATH%b` dziś kończy się kodem 0 z rozwiniętą
  zmienną. Istniejący test `buildReviewCommand uses codex review for Codex and a read-only run
  elsewhere` zostaje zielony bez zmian.
- **Weryfikacja:** `node --test "core/process/tests/crew.test.js"` → 22 pass, 0 fail.
- **Nie ruszasz:** funkcji `cyt` i ścieżki `cmd.exe /d /s /c` (cytowanie metaznaków działa —
  kontrola w teście); `sciezkaCli`; `composePrompt`; trybu przeglądu Claude Code i Cursora
  (już stdin).
- **Pułapki:**
  - Wyrażenia z backslashem (`MODEL_RE`, `ZNAK_NIEDOZWOLONY_CMD`) wpisujesz narzędziem Edit.
  - `%` w ścieżce projektu na Windows zatrzyma teraz załogę komunikatem — świadome (patrz lista
    dla człowieka na końcu).
  - Na Linuksie i macOS `wykonaj` nie przechodzi przez powłokę — strażnik jest tylko w gałęzi win32
    i test pomija tę część przez `t.skip`.
- **Gotowe, gdy:** `crew.test.js` 22 zielonych.

---

## K-D7 — tryb zapisu załogi bez `-f` dla Cursora i bez gołego `Bash` dla Claude Code

- **Cel:** Cursor w trybie zapisu nie dostaje `-f` (alias `--yolo`); `-f` i `--force` są na
  liście `FLAGI_ZAKAZANE`, a sprawdzenie flag porównuje całe flagi, nie podciągi; Claude Code
  w trybie zapisu dostaje `Bash` wyłącznie przez wzorce poleceń.
- **Pliki:** `core/process/crew.js`, `core/process/tests/crew.test.js`.
- **Decyzja projektowa (minimalna i bezpieczna):** Cursor bez `-f`, bo `agent --help` (lokalnie,
  2026-11-09) mówi, że `-p` „Has access to all tools, including write and shell”, a `-f` to
  „Force allow commands unless explicitly denied” z aliasem `--yolo` — zapis plików zostaje,
  znika automatyczna zgoda na polecenia powłoki. Claude Code: stała lista wzorców odczytu gita
  i uruchomienia testów, bo członek załogi biegnie bez człowieka i nikt nie zatwierdzi polecenia.
- **Stan dziś** (linie 110–114, 354, 370, 393–394; test w `crew.test.js` linia 59):

  ```js
  const FLAGI_ZAKAZANE = [
    '--dangerously-skip-permissions', '--dangerously-bypass-approvals-and-sandbox',
    '--dangerously-bypass-hook-trust', '--allow-dangerously-skip-permissions', '--yolo',
    'bypassPermissions', 'danger-full-access',
  ];
  ```

  ```js
      if (write) args.push('--permission-mode', 'acceptEdits', '--allowedTools', 'Read', 'Glob', 'Grep', 'Edit', 'Write', 'MultiEdit', 'NotebookEdit', 'Bash');
  ```

  ```js
      if (write) args.push('-f'); else args.push('--mode', 'ask');
  ```

  ```js
  function sprawdzFlagi(komenda) {
    const zle = komenda.args.filter((a) => FLAGI_ZAKAZANE.some((f) => String(a).includes(f)));
  ```

  ```js
        if (runtime === 'cursor') assert.match(linia, write ? /(^| )-f( |$)/ : /--mode ask/);
  ```

- **Zmiana:**
  1. `FLAGI_ZAKAZANE` — po wierszu z `'--yolo',` dopisz:

     ```js
       // Cursor CLI: -f/--force to ta sama flaga co --yolo ("Alias for --force", agent --help).
       '-f', '--force',
     ```

     a pod tablicą (przed stałymi z K-D6):

     ```js
     // Claude Code w trybie zapisu: Bash wylacznie z tych wzorcow (odczyt gita i uruchomienie testow),
     // nigdy goly "Bash" — czlonek zalogi biegnie bez czlowieka, wiec nikt nie zatwierdzi polecenia.
     const BASH_ZAPISU = [
       'Bash(git status:*)', 'Bash(git diff:*)', 'Bash(git log:*)',
       'Bash(node --test:*)', 'Bash(npm test:*)', 'Bash(npm run test:*)', 'Bash(pytest:*)',
     ];
     ```

  2. Linia Claude Code: `…, 'MultiEdit', 'NotebookEdit', 'Bash');` → `…, 'MultiEdit', 'NotebookEdit', ...BASH_ZAPISU);`.
  3. Linia Cursora zastąp:

     ```js
         // Tryb zapisu bez -f/--force: -p ma dostep do zapisu plikow ("Has access to all tools",
         // agent --help), a -f to alias --yolo, czyli automatyczna zgoda na kazde polecenie powloki.
         if (!write) args.push('--mode', 'ask');
     ```

  4. `sprawdzFlagi` — nad funkcją dodaj `zakazana`, a filtr zamień na `komenda.args.filter(zakazana)`:

     ```js
     // Flaga z myslnikiem: rowna albo z "=wartosc" (sam podciag "-f" siedzi w "--output-format").
     // Wartosc bez myslnika (bypassPermissions, danger-full-access): podciag w dowolnym argumencie.
     function zakazana(arg) {
       const a = String(arg);
       return FLAGI_ZAKAZANE.some((f) => (f.startsWith('-') ? a === f || a.startsWith(f + '=') : a.includes(f)));
     }
     ```

  5. Komentarz nagłówka (linia 23) „nigdy nie dodaje flag omijajacych uprawnienia (--dangerously-*,
     --yolo, bypassPermissions)” → dopisz „, -f/--force”.
- **Test najpierw:**
  1. **Test istniejący zmieniany z nazwy:** `buildCommand gives read-only flags without --write and
     never a bypass flag` — linię z kotwicy zastąp (nowe oczekiwanie: w trybie zapisu Cursor dostaje
     dokładnie te argumenty, bez `-f` i bez `--mode`):

     ```js
         if (runtime === 'cursor') assert.match(linia, write ? /^-p --output-format text --trust --workspace C:\/proj --model m1$/ : /--mode ask/);
     ```

     Innych istniejących testów nie dotykasz.
  2. Dopisz pod testami K-D6:

     ```js
     test('K-D7: Cursor write mode carries no -f/--force and the flag check matches whole flags', () => {
       const k = crew.buildCommand('cursor', { cwd: '/p', cli: 'agent', write: true, prompt: 'x' });
       for (const flaga of ['-f', '--force', '--yolo', '--mode']) assert.ok(!k.args.includes(flaga), flaga);
       for (const flaga of ['-f', '--force', '--force=true', '--yolo']) {
         assert.throws(() => crew.sprawdzFlagi({ cmd: 'agent', args: [flaga] }), /zakazana flaga/, flaga);
       }
       assert.doesNotThrow(() => crew.sprawdzFlagi({ cmd: 'agent', args: ['-p', '--output-format', 'text'] }));
       assert.ok(crew.FLAGI_ZAKAZANE.includes('-f') && crew.FLAGI_ZAKAZANE.includes('--force'));
     });

     test('K-D7: Claude Code write mode allows Bash only through command patterns', () => {
       const k = crew.buildCommand('claude-code', { cwd: '/p', cli: 'claude', write: true, prompt: 'x' });
       assert.ok(!k.args.includes('Bash'), 'goly Bash daje kazde polecenie bez zgody czlowieka');
       const bash = k.args.filter((a) => /^Bash/.test(a));
       assert.ok(bash.length > 0);
       for (const a of bash) assert.match(a, /^Bash\([^()]+:\*\)$/);
       assert.ok(bash.includes('Bash(node --test:*)') && bash.includes('Bash(git diff:*)'));
     });
     ```

  Przed zmianą (zmierzone): zmieniony test istniejący i oba nowe czerwone na asercji.
- **Weryfikacja:** `node --test "core/process/tests/crew.test.js"` → 24 pass, 0 fail; cały
  `node --test "core/process/tests/*.test.*"` → stan z wpisu dziennika etapu E5 plus 7 pass
  (narastająco: 388 → 395, albo 389 → 396 przy ścieżce K-C9 z dodatkowym testem; od samego `main`
  byłoby 364), 0 fail.
- **Nie ruszasz:** trybu tylko-do-odczytu żadnego narzędzia; trybu zapisu Codeksa
  (`workspace-write`, `approval_policy="never"` — piaskownica Codeksa jest jego granicą);
  komendy `/relai-crew` i jej dokumentów (nie wspominają `-f`); plików agentów.
- **Pułapki:**
  - Wzorzec `-f` jako podciąg trafiłby w `--output-format` — dlatego `zakazana` porównuje całe
    flagi; nie upraszczaj z powrotem do `includes`.
  - Zachowanie Cursora bez `-f` w trybie `-p` jest opisane w pomocy CLI, nie zmierzone na żywo
    (`claude -p`/`agent -p` nie są uruchamiane w tym etapie). Pomiar należy do człowieka.
  - Składnia `Bash(<prefiks>:*)` to forma prefiksowa uprawnień Claude Code; nie zmieniaj jej na
    gwiazdkę bez dwukropka bez pomiaru.
- **Gotowe, gdy:** `core/process/tests` wszystkie zielone, a ich liczba jest o 7 większa niż
  liczba zapisana we wpisie dziennika etapu E5.

---

## Do rozstrzygnięcia przez człowieka (nie blokuje wykonania)

- **K-D7, lista `BASH_ZAPISU`:** siedem wzorców (git status/diff/log, `node --test`, `npm test`,
  `npm run test`, `pytest`). Projekt z innym poleceniem testów (np. `cargo test`, `go test`)
  zostawi członka załogi Claude Code bez dowodu w meldunku — rozszerzenie listy to decyzja
  właściciela. Uwaga: `npm test` uruchamia skrypt z `package.json`, który koder może edytować —
  granica jest umowna, jak piaskownica zapisu Codeksa.
- **K-D7, Cursor bez `-f`:** czy koder w Cursorze uruchomi testy bez automatycznej zgody na
  powłokę — do zmierzenia na żywo przez człowieka; gdy nie, alternatywą jest jawna zgoda
  człowieka per przebieg (nowa flaga `crew.js`) — poza tą kartą.
- **K-D6, `%` w ścieżce projektu na Windows:** załoga odmawia zamiast ryzykować rozwinięcie
  zmiennej przez cmd.exe.
