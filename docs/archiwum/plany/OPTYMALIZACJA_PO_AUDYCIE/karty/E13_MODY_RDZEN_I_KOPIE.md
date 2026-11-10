# E13 — Mody: rdzeń i kopie

Konwencje wspólne: [00_KONWENCJE.md](00_KONWENCJE.md). Etap zmienia narzędzie kopiujące rdzeń
(`core/tools/sync-panel-core.js`) i kopie rdzenia w czterech modach. Wersji modów nie podbijasz —
robi to etap E14 z listy z pola „Gotowe, gdy” każdej karty.

- **Karty w kolejności wykonania:** K-G2 → K-F4 → K-F5. Kod zmienia wyłącznie K-G2. Karty K-F4
  i K-F5 są rozstrzygnięte decyzją właściciela z 2026-11-09 i kończą się jednym zdaniem w dzienniku
  każda: `cache-timer.mjs` zostaje do decyzji o planie PANEL_CODEX, a podział plików `register.tsx`
  jest wyjęty z planu.
- **Efekt widoczny:** kopie rdzenia w czterech modach ważą 1 458 334 B zamiast 2 280 852 B
  (−822 518 B, FAKT z prototypu 2026-11-09); `relai-cache-keeper` niesie 8 plików rdzenia zamiast 21,
  `relai-mods` 2 zamiast 21.
- **Szacunek:** SZACUNEK 1 sesja.
- **Warunki zatrzymania:** kotwica nie pasuje; `sync-panel-core.js --check` po K-G2 zgłasza
  cokolwiek; którykolwiek `plugin test` lub `plugin validate` czerwony po usunięciu kopii; bramka
  manualna pokazuje brak paska albo komendy.
- **Weryfikacja etapu:** `node core/tools/sync-panel-core.js --check` → kod 0 i linia
  `[sync-panel-core] zgodne: 20 plikow core/panel i 16 ikon -> panel/hooks/core, progress/hooks/core, cache-keeper/hooks/relai, mods/hooks/core`;
  `node --test "core/panel/tests/*.test.*"` → 227 zielonych (225 + 2 z K-G2);
  cztery `plugin test` → 91 + 217 + 51 + 206 (stan po E12, etap nie dokłada testów modów);
  cztery `plugin validate` → „✔ Validation passed”; bramka manualna przeszła.

---

## Jak testować mody

Z korzenia repozytorium, binarką bieżącej sesji:

```bash
"$CLAUDE_CODE_EXECPATH" plugin test mods
"$CLAUDE_CODE_EXECPATH" plugin test panel
"$CLAUDE_CODE_EXECPATH" plugin test progress
"$CLAUDE_CODE_EXECPATH" plugin test cache-keeper
"$CLAUDE_CODE_EXECPATH" plugin validate cache-keeper   # tak samo dla mods, panel, progress
node --test "core/panel/tests/*.test.*"
```

- Stan `main @ 5aeab39` (FAKT): mods 87, panel 216, progress 50, cache-keeper 206; `core/panel/tests`
  225. Etap E12 dokłada 4 + 1 + 1 testy modów, więc na starcie E13 oczekujesz mods 91, panel 217,
  progress 51, cache-keeper 206 — liczby bierzesz z wpisu dziennika E12, a rozjazd w dół zatrzymuje
  pracę. Wyjście `plugin test` kończy się liniami ` 91 pass`, ` 0 fail`; kod 1 przy porażce.
- `node --test` na plikach modów kończy się `Cannot find package 'claude-code'`; `claude` z `PATH`
  bywa inną wersją niż binarka sesji (P-024 pkt 4, P-052) — zawsze `$CLAUDE_CODE_EXECPATH`. Testy
  `core/panel/tests` to zwykły `node --test` z globem w cudzysłowie (P-036).
- **Czego silnik testów nie widzi** (P-017 pkt 2, P-022 pkt 6, P-023 pkt 7, P-053, P-045): brak
  `$.plugin.register`, prawdziwego `$.state` i stanu `hover`; nie zna limitu drzewa desktopu.
  **Brak pliku rdzenia widzi** — import pliku, którego nie ma w folderze modu, kończy test błędem
  ładowania, a `plugin validate` odrzuca moduł. Dlatego K-G2 sprawdzasz testami wszystkich modów.
- **Jak wyglądają istniejące testy:** atrapa świata hookami `on(...)` i montaż panelu; wzór
  z `mods/hooks/mods.test.tsx:109-119` (stan `main`):

  ```tsx
  on('env.get', ($, e) => ({ value: e.name === 'USERPROFILE' ? HOME : '' }))
  on('settings.read', ($, e) => ({ value: e.source === 'policy' ? { enabledPlugins: { 'pol@corp': true } } : {} }))
  on('fs.exists', ($, e) => ({ value: key(e.path) in disk || Object.keys(disk).some((p) => p.startsWith(`${key(e.path)}/`)) }))
  on('fs.read', ($, e) => (disk[key(e.path)] === UNREADABLE ? { deny: `EACCES ${e.path}` } : key(e.path) in disk ? { value: disk[key(e.path)] ?? '' } : { deny: `ENOENT ${e.path}` }))
  on('fs.list', ($, e) => {
    const dir = `${key(e.path)}/`
    const below = Object.keys(disk).filter((p) => p.startsWith(dir)).map((p) => p.slice(dir.length))
    const names = [...new Set(below.map((r) => r.split('/')[0] ?? ''))]
    return { value: names.map((n) => ({ name: n, kind: below.includes(n) ? 'file' as const : 'dir' as const, size: 1, mtimeMs: 0, isLink: false })) }
  })
  on('process.run', ($, e) => {
  ```

  (Po E12 hooki `fs.*` w tym pliku liczą wywołania, a `fs.stat` podaje czas z treści — karta K-F1.)

### Bramka manualna (człowiek, po K-G2)

Zainstalowane mody są stare (wersje podbija E14), więc kod z gałęzi ładujesz w osobnej sesji
terminala z wyłączonymi zainstalowanymi kopiami. Usunięty plik rdzenia, którego mod jednak
potrzebuje, objawia się na żywo tak: moduł się nie ładuje, znikają jego paski nad promptem
i komendy („Unknown command”). Terminal pokazuje to tak samo jak desktop, więc wystarcza.

1. Zwykłe okno PowerShell (nie terminal aplikacji Claude), szerokość co najmniej 110 kolumn (P-053).
2. Wpisz:

   ```powershell
   $s = Join-Path $env:TEMP 'relai-e13-settings.json'
   '{"enabledPlugins":{"relai-panel@relai":false,"relai-progress@relai":false,"relai-mods@relai":false,"relai-cache-keeper@relai":false}}' | Out-File -Encoding ascii $s
   cd C:\Users\Lukasz\Desktop\RelAI
   claude --settings $s --plugin-dir .\panel --plugin-dir .\progress --plugin-dir .\mods --plugin-dir .\cache-keeper
   ```

3. Wyślij prompt `ok` i poczekaj na odpowiedź. Oczekiwane nad promptem: pasek cache
   (`relai-cache-keeper`, wiersz z „cache”, „limit 5 h”, „limit tygodnia”, kontekstem i kosztem
   sesji po prawej) oraz pasek planu RelAI (`relai-panel`) z nazwą aktywnego planu albo przyciskiem
   „Wybierz pracę…”.
4. Wpisz `/cache`. Oczekiwane: odpowiedź zaczyna się od „relai-cache-keeper: kontekst”.
5. Wpisz `/relai-panel`, naciśnij dwa razy `ctrl+x tab` i przejdź po zakładkach „Komendy”, „Koszty”,
   „Dokumenty”, „Mapa”, „Pomoc”. Oczekiwane: każda rysuje treść; żadna nie pokazuje
   „⚠ Panel nie narysował tej zakładki”.
6. Wpisz `/relai-agents`: otwiera się panel agentów. Wpisz `/relai-mods`: lista z grupami „Mody”,
   „Pluginy”, „Hooki” i nagłówkiem „N/M włączone · …”.
7. Zakończ `/exit` i usuń plik: `Remove-Item $s`. Wynik kroków 3–6 wpisz do dziennika etapu.

---

## K-G2 — każdy mod niesie tylko pliki rdzenia, które importuje

- **Cel:** `sync-panel-core.js` kopiuje do modu wyłącznie pliki `core/panel/*.mjs` (i `icons.mjs`)
  osiągalne z jego własnego kodu, usuwa kopie już nieosiągalne, a `--check` zgłasza różnicę treści,
  kopię brakującą, kopię nadmiarową i plik obcy (raport G2).
- **Pliki:** `core/tools/sync-panel-core.js`, `core/panel/tests/sync.test.js`; usunięcia kopii
  wykonane przez narzędzie w `panel/hooks/core/`, `progress/hooks/core/`,
  `cache-keeper/hooks/relai/`, `mods/hooks/core/` (sekcja 5 konwencji — kopie generowane).
- **Stan dziś:** `core/tools/sync-panel-core.js:92` w funkcji `sync()` —
  `for (const n of sources()) fs.copyFileSync(path.join(SRC, n), path.join(DST, n));` (każdy plik
  do każdego modu); `:59` — `function checkOne(rel, want, icons) {`, `:73` —
  `const own = icons === null ? want : [...want, ICONS_MODULE];`; `:33` — `const dests = () => …`.
  Każdy katalog kopii ma dziś 21 plików (20 z `core/panel/` + `icons.mjs`), po 570 213 B.
  `release-checks.js:685-686` uruchamia `--check` i liczy pozycje wyrażeniem
  `/(\d+) plikow core\/panel/` — linia wyjścia musi zachować ten kształt i liczbę **źródeł**.
- **Rozstrzygnięcie — graf liczony przy każdym uruchomieniu, nie jawna lista per mod.** Lista
  w skrypcie dezaktualizuje się po cichu w jedną stronę: nowy import w modzie bez dopisania pliku
  wyjdzie dopiero w teście, a plik, którego mod przestał używać, zostanie na liście na zawsze i nic
  tego nie zgłosi. Graf idzie za kodem: nowy import bez ponownej synchronizacji `--check` zgłasza
  jako „brak kopii”, import usunięty — jako „kopia nadmiarowa”. Korzenie grafu: **wszystkie własne
  pliki `.ts`/`.tsx` modu pod `hooks/`** poza katalogiem kopii (`register.tsx`, widoki, testy) —
  test liczy się jako korzeń, inaczej plik importowany tylko przez test zniknąłby, a test padłby.
  Na dziś daje to ten sam wynik co korzenie `register.tsx` + testy (prototyp: trzy warianty
  korzeni, identyczne listy). Krawędzie: `import … from './…'`, `export … from './…'`,
  `import './…'` i `import('./…')` — także w JSDoc rdzenia (`@typedef {import('./measure.mjs')…}`),
  co jest ostrożne: plik z typem zostaje skopiowany.
- **Zmiana:**
  1. Nagłówek pliku: po akapicie „Po co: …” dopisz akapit o regule (tekst w ASCII, jak reszta
     komunikatów narzędzia):

     ```js
     // Kazdy mod dostaje tylko pliki, ktore importuje (audyt 2026-11-09, G2; plan
     // OPTYMALIZACJA_PO_AUDYCIE, K-G2): korzeniami grafu sa wszystkie wlasne pliki .ts/.tsx modu pod
     // hooks/ (register.tsx, widoki i testy), poza katalogiem kopii; krawedzie to `import ... from`,
     // `export ... from`, `import '...'` i `import('...')` ze sciezka zaczynajaca sie od ./ albo ../.
     // Plik rdzenia wnosi swoje importy. Graf liczy sie przy kazdym uruchomieniu, wiec nowy import
     // w modzie bez ponownej synchronizacji wychodzi w --check jako "brak kopii".
     // Kasowane sa wylacznie pliki o nazwie z core/panel/ (albo icons.mjs), ktorych mod juz nie
     // importuje; obcy plik .mjs w katalogu kopii nie jest kasowany, --check go zglasza.
     ```

     W linii użycia `# zapisuje kopie` zmień na `# zapisuje kopie i usuwa nadmiarowe`, a zdanie
     o ikonach: `modul panel/hooks/core/icons.mjs` → `modul icons.mjs w katalogu kopii modu, ktory go importuje`.
  2. `const dests = () => …` zastąp `const present = () => PLUGINS.filter(([p]) => fs.existsSync(path.join(ROOT, p)));`
     i pod `ICONS_MODULE` dopisz wyrażenie (plik piszesz narzędziem Write/Edit, nie przez powłokę —
     zawiera backslashe, L-0116):

     ```js
     // A relative specifier of a static import or re-export, a bare import, or a dynamic import()
     const SPEC = /(?:\bimport|\bexport)\s[^'"]*?\bfrom\s*['"](\.{1,2}\/[^'"]+)['"]|\bimport\s*['"](\.{1,2}\/[^'"]+)['"]|\bimport\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g;
     ```

  3. Pod `const lf = …` dopisz funkcje grafu:

     ```js
     const toDir = (rel) => path.join(ROOT, ...rel.split('/'));

     function specsOf(file) {
       return [...fs.readFileSync(file, 'utf8').matchAll(SPEC)].map((m) => m[1] || m[2] || m[3]);
     }

     // The core file a specifier names, by its name, when it points into `dir`; null otherwise
     function coreName(fromDir, spec, dir, known) {
       const target = path.resolve(fromDir, spec);
       if (path.dirname(target) !== dir) return null;
       const name = path.basename(target).endsWith('.mjs') ? path.basename(target) : path.basename(target) + '.mjs';
       return known.has(name) ? name : null;
     }

     // The mod's own code: every .ts/.tsx under hooks/, the copy folder left out
     function ownFiles(plugin, copyDir) {
       const hooks = path.join(ROOT, plugin, 'hooks');
       if (!fs.existsSync(hooks)) return [];
       return fs.readdirSync(hooks, { recursive: true }).map((n) => path.join(hooks, n))
         .filter((f) => /\.tsx?$/.test(f) && !f.startsWith(copyDir + path.sep) && !f.includes(path.sep + 'node_modules' + path.sep) && fs.statSync(f).isFile());
     }

     // The core files one mod reaches, sorted: from its own files, then what each core file imports
     function wanted(plugin, rel, names, icons) {
       const dir = toDir(rel);
       const known = new Set(icons === null ? names : [...names, ICONS_MODULE]);
       const stack = ownFiles(plugin, dir).flatMap((f) => specsOf(f).map((s) => coreName(path.dirname(f), s, dir, known))).filter(Boolean);
       const want = new Set();
       while (stack.length) {
         const n = stack.pop();
         if (want.has(n)) continue;
         want.add(n);
         if (n === ICONS_MODULE) continue;
         for (const s of specsOf(path.join(SRC, n))) {
           const next = coreName(SRC, s, SRC, known);
           if (next) stack.push(next);
         }
       }
       return [...want].sort();
     }
     ```

     Krawędzie rdzenia czytasz ze **źródła** (`core/panel/`), nie z kopii — wynik nie zależy od tego,
     co dziś leży w katalogu kopii.
  4. `checkOne`, `check` i `sync` zastąp:

     ```js
     function checkOne(rel, want, names, icons) {
       const DST = toDir(rel);
       const have = fs.existsSync(DST) ? fs.readdirSync(DST).filter((n) => n.endsWith('.mjs')).sort() : [];
       const problems = [];
       for (const n of want) {
         const dst = path.join(DST, n);
         if (n === ICONS_MODULE) {
           if (!fs.existsSync(dst)) problems.push('brak ' + rel + '/' + ICONS_MODULE + ' (ikony komend)');
           else if (lf(fs.readFileSync(dst)) !== icons) problems.push(rel + '/' + ICONS_MODULE + ' rozni sie od docs/zasoby/branding/ikony/');
         } else if (!fs.existsSync(dst)) problems.push('brak kopii ' + rel + '/' + n);
         else if (lf(fs.readFileSync(dst)) !== lf(fs.readFileSync(path.join(SRC, n)))) problems.push('kopia ' + rel + '/' + n + ' rozni sie od core/panel/' + n);
       }
       const known = new Set(icons === null ? names : [...names, ICONS_MODULE]);
       for (const n of have) {
         if (want.includes(n)) continue;
         problems.push(known.has(n) ? 'kopia nadmiarowa ' + rel + '/' + n + ' - zaden plik modu jej nie importuje' : rel + '/' + n + ' nie ma zrodla w core/panel/');
       }
       return problems;
     }

     function check() {
       const names = sources();
       const icons = iconsModule();
       const to = present();
       const copies = Object.fromEntries(to.map(([p, rel]) => [rel, wanted(p, rel, names, icons)]));
       const problems = to.flatMap(([, rel]) => checkOne(rel, copies[rel], names, icons));
       const iconCount = icons === null ? 0 : fs.readdirSync(ICONS).filter((n) => n.endsWith('.svg')).length;
       return { files: names.length, icons: iconCount, dests: to.map(([, rel]) => rel), copies, problems };
     }

     function sync() {
       const names = sources();
       const icons = iconsModule();
       const known = new Set(icons === null ? names : [...names, ICONS_MODULE]);
       for (const [p, rel] of present()) {
         const DST = toDir(rel);
         const want = wanted(p, rel, names, icons);
         if (want.length) fs.mkdirSync(DST, { recursive: true });
         for (const n of want) {
           if (n === ICONS_MODULE) fs.writeFileSync(path.join(DST, n), icons);
           else fs.copyFileSync(path.join(SRC, n), path.join(DST, n));
         }
         // Only a copy this tool wrote is removed: a name from core/panel/ (or icons.mjs) no file imports
         const have = fs.existsSync(DST) ? fs.readdirSync(DST).filter((n) => n.endsWith('.mjs')) : [];
         for (const n of have) if (known.has(n) && !want.includes(n)) fs.unlinkSync(path.join(DST, n));
       }
     }
     ```

     Reguła kasowania: tylko plik `.mjs` o nazwie istniejącej w `core/panel/` albo `icons.mjs`.
     Plik o innej nazwie (obcy) zostaje i `--check` zgłasza go jako „nie ma zrodla”. Blok
     `if (require.main === module)` i linia „zgodne: …” **bez zmian** (`release-checks.js` liczy z niej
     `N plikow core/panel`; tu N = liczba źródeł).
  5. Uruchom `node core/tools/sync-panel-core.js`. Narzędzie usuwa 45 kopii: panel 5 (`agentcard`,
     `agents`, `cache-timer`, `hanken`, `mascots`), progress 8 (`attribution`, `cache-timer`,
     `commands`, `documents`, `icons`, `limit-threshold`, `phrases`, `session-title`),
     cache-keeper 13, mods 19.
- **Oczekiwany wynik (FAKT, prototyp na kopii repozytorium 2026-11-09):**

  | Katalog kopii | Pliki | Rozmiar | Lista |
  |---|---|---|---|
  | `panel/hooks/core` | 16 | 501 326 B | attribution, charts, commands, decisions, documents, flow, headings, icons, limit-threshold, measure, phrases, plan-state, pricing, progress, session-title, theme |
  | `progress/hooks/core` | 13 | 499 604 B | agentcard, agents, charts, decisions, flow, hanken, headings, mascots, measure, plan-state, pricing, progress, theme |
  | `cache-keeper/hooks/relai` | 8 | 143 755 B | decisions, flow, limit-threshold, measure, plan-state, pricing, progress, theme |
  | `mods/hooks/core` | 2 | 313 649 B | headings, theme |

  Razem 1 458 334 B (było 4 × 570 213 = 2 280 852 B). Na tak okrojonych kopiach prototyp przeszedł
  `plugin test` (87 / 216 / 50 / 206) i `plugin validate` wszystkich czterech modów.
- **Świadomie poza kartą — podział `headings.mjs`** (282 006 B, 44 nagłówki SVG z fontem w base64):
  wymaga zmiany generatora `core/tools/build-panel-headings.js` i importów `HEADING_ART` w
  `panel/hooks/pane-parts.tsx`, `progress/hooks/pane-agents.tsx`, `mods/hooks/views.tsx`, więc
  nie wchodzi. Dałby SZACUNEK ok. 558 000 B: progress −271 401 B (używa tylko `agents` i `NUMERALS`),
  mods −269 787 B (tylko trzy nagłówki `mods-*`), panel −16 830 B; cache-keeper po tej karcie
  `headings.mjs` już nie niesie. Wpisz to do dziennika jako „świadomie odłożone”.
  Poza kartą jest też jedna kopia skilli dla trzech narzędzi — dotyka zamrożonej D-89.
- **Test najpierw:** `core/panel/tests/sync.test.js`.
  1. Wspólna pomoc na górze pliku (zastępuje powtarzane `mkdtempSync` w testach):

     ```js
     // A temporary repo with the tool, the given folders and files; removed after the test
     function fixture(t, prefix, dirs, files) {
       const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
       t.after(() => fs.rmSync(root, { recursive: true, force: true }));
       for (const d of [['core', 'tools'], ['core', 'panel'], ...dirs]) fs.mkdirSync(path.join(root, ...d), { recursive: true });
       fs.copyFileSync(TOOL, path.join(root, 'core', 'tools', 'sync-panel-core.js'));
       for (const [rel, text] of Object.entries(files)) {
         fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
         fs.writeFileSync(path.join(root, rel), text);
       }
       const tool = path.join(root, 'core', 'tools', 'sync-panel-core.js');
       return { root, run: (...args) => spawnSync(process.execPath, [tool, ...args], { encoding: 'utf8' }) };
     }

     const uses = (...names) => names.map((n) => `import { x as ${n.replace(/\W/g, '_')} } from './core/${n}';\n`).join('');
     ```

  2. **Testy, które słusznie zmieniają fiksturę** (asercje bez zmian; bez pliku modu z importem
     nowe narzędzie nic nie skopiuje): „a changed copy, a missing copy and an orphan copy…” dostaje
     `panel/hooks/register.tsx` = `uses('a.mjs', 'b.mjs')`; „the icons module follows the icon
     files…” — `panel/hooks/register.tsx` = `uses('a.mjs', 'icons.mjs')`; „every plugin that carries
     the core is checked…” — `panel/hooks/register.tsx` i `progress/hooks/register.tsx` =
     `uses('a.mjs')`; „relai-mods carries the core too…” — `mods/hooks/register.tsx` = `uses('a.mjs')`.
  3. Nowy: `a mod gets only what it reaches: through a core file, from a test, never the rest (K-G2)` —
     `core/panel/a.mjs` importuje `./b.mjs`; `c.mjs`, `d.mjs` samodzielne; `progress/hooks/register.tsx`
     = `uses('a.mjs')`, `progress/hooks/bar.test.ts` = `uses('c.mjs')`. Po `run()`: kod 0,
     `progress/hooks/core` zawiera dokładnie `['a.mjs', 'b.mjs', 'c.mjs']`, stdout pasuje do
     `/4 plikow core\/panel/`.
  4. Nowy: `a copy no file imports any more is removed by sync and reported by --check; a foreign file stays (K-G2)` —
     `core/panel/a.mjs`, `b.mjs`; `mods/hooks/register.tsx` = `uses('a.mjs')`; w `mods/hooks/core/`
     leżą `a.mjs`, `b.mjs` (zgodne ze źródłem) i obcy `own.mjs`. `run('--check')`: kod 1, stderr pasuje
     do `/kopia nadmiarowa mods\/hooks\/core\/b\.mjs/` i `/mods\/hooks\/core\/own\.mjs nie ma zrodla/`;
     `run()`: kod 1 (obcy plik nadal zgłaszany), a w katalogu zostają dokładnie `['a.mjs', 'own.mjs']`.
  5. Przed zmianą narzędzia testy 3 i 4 są czerwone, a cztery z punktu 2 zielone (prototyp
     2026-11-09). Test „panel/hooks/core matches core/panel” robi się czerwony po zmianie narzędzia
     i zielony po kroku 5 „Zmiany” — to oczekiwane.
- **Weryfikacja:**
  `node core/tools/sync-panel-core.js --check` → kod 0, linia
  `[sync-panel-core] zgodne: 20 plikow core/panel i 16 ikon -> panel/hooks/core, progress/hooks/core, cache-keeper/hooks/relai, mods/hooks/core`;
  `git status --short` → 45 wierszy `D` w czterech katalogach kopii plus dwa zmienione pliki karty;
  `node --test "core/panel/tests/*.test.*"` → 227 zielonych (225 + 2);
  cztery `plugin test` → 91 / 217 / 51 / 206; cztery `plugin validate` → „✔ Validation passed”.
- **Nie ruszasz:** `release-checks.js` (wyrażenie liczy dalej źródła), `release-check.test.js`
  i `release-fixture.js`; `build-panel-headings.js` i `headings.mjs`; `mods-parity.test.js`
  (porównuje `fmt.ts`, `bar-card.tsx`, `focus.ts` — nie kopie rdzenia; F6 poza planem); skilli
  adapterów (D-89); manifestów modów (K-E9, etap E14).
- **Pułapki:**
  - P-017 pkt 1: mod importuje wyłącznie pliki ze swojego folderu — brakująca kopia to moduł, który
    się nie ładuje; dlatego weryfikacja to testy **wszystkich czterech** modów.
  - L-0116, L-0119: wyrażenie `SPEC` z backslashami wpisujesz narzędziem Edit/Write i sprawdzasz
    kontrolą pozytywną — test 3 jest nią (import przez plik rdzenia i przez test).
  - Konwencje, sekcja 6: końce linii — porównanie po `lf()`, bez zmian.
  - `fs.readdirSync(…, { recursive: true })` zwraca ścieżki z separatorem systemu; filtr katalogu
    kopii porównuje z `copyDir + path.sep`.
- **Gotowe, gdy:** dwa nowe testy były czerwone i są zielone; `--check` kod 0; liczby z „Weryfikacji”
  się zgadzają. Mody zmienione tą kartą: `relai-panel`, `relai-progress`, `relai-cache-keeper`,
  `relai-mods` (usunięte kopie); poza modami plugin `relai` (`core/tools/sync-panel-core.js`).

---

## K-F4 — `cache-timer.mjs` zostaje do decyzji o PANEL_CODEX (karta zamknięta bez zmiany kodu)

- **Cel:** znalezisko F4 raportu (moduł rdzenia, którego nie importuje żaden mod) jest rozstrzygnięte
  jawnie i zapisane w dzienniku; w kodzie nic się nie zmienia.
- **Pliki:** żadne.
- **Stan dziś:** jedyny import to `core/panel/tests/cache-timer.test.js:9` —
  `const t = require('../cache-timer.mjs');`. Żywa logika jest w `cache-keeper/hooks/core.ts:36-89`
  i `cache-keeper/hooks/register.tsx:113-116`, `:1143-1150`. Porównanie funkcja po funkcji:

  | `cache-timer.mjs` | Odpowiednik w `cache-keeper` | Różnica |
  |---|---|---|
  | `MIN = 60_000` | `core.ts:6` `MIN = 60_000` | brak |
  | `DEFAULT_WARN_MIN = [10, 5]` (zamrożone) | `DEFAULT_SETTINGS.warnMin: [10, 5]`, zmienne `/cache progi` | progi są ustawieniem |
  | `ASSUMED_TTL_MIN = 60`, `effectiveTtl(ttl)` | `ttl()` = `settings.ttlMin \|\| S.ttlMeasured \|\| 60`, `ttlAssumed()` | **zachowanie:** ręczne `/cache ttl 5\|60` wygrywa z pomiarem; w module rdzenia tego nie ma |
  | `SMALL_REQUEST_TOKENS = 30_000`, `LONG_GAP_MS = 5.5 * MIN` | literały `30_000`, `5.5 * MIN` w `judgeStep` | te same wartości |
  | `SHORT_TTL_REWRITES = 2`, `UNMEASURED`, `applyVerdict` | `seen >= 2` i `set(...)` w `register.tsx:1147-1150`, pola `Session` | ta sama logika, zapis w stanie modułu |
  | `totalInput(u)` | `pricing.ts:49` | brak |
  | `msLeft(last, ttl, now)` | `core.ts:36` | brak |
  | `cacheState(last, ttl, now, warnMin = DEFAULT)` | `core.ts:40` `cacheState(last, ttl, now, keepWarm, warnMin)` | **zachowanie:** stan `kept` przy podtrzymaniu (`keepWarm`); inna kolejność parametrów |
  | `dueWarning` | `core.ts:56` | brak |
  | `judgeStep` | `core.ts:76` | kształt wyniku: `core.ts` zwraca klucz `ttlMeasured: undefined`, moduł rdzenia go pomija |

- **Rozstrzygnięcie: moduł zostaje (decyzja właściciela 2026-11-09).** Wstrzymany plan PANEL_CODEX
  wymienia `cache-timer.mjs` jako moduł do przejęcia przez adapter Codeksa
  (`docs/plany/PANEL_CODEX/PROMPT_ETAP_1.md:20`), więc o jego losie rozstrzygnie tamten plan. Import
  rdzenia w cache-keeperze też odpada: wersje różnią się zachowaniem (`keepWarm` i stan `kept`,
  ręczny TTL z ustawień), a różnica nie jest błędem. Po karcie K-G2 moduł nie jest już kopiowany do
  żadnego modu, więc kosztuje tylko jeden plik źródła i jego siedem testów.
- **Zmiana:** żadna w kodzie.
  1. Nie usuwasz `core/panel/cache-timer.mjs` ani `core/panel/tests/cache-timer.test.js` i nie
     zmieniasz komentarzy, które się do nich odwołują.
  2. We wpisie dziennika etapu, w części „świadomie odłożone”, zapisujesz jedno zdanie:
     „F4 — `core/panel/cache-timer.mjs` zostaje do decyzji o planie PANEL_CODEX; po K-G2 nie jest
     kopiowany do modów.”
- **Test najpierw:** nie dotyczy.
- **Weryfikacja:** `ls core/panel/cache-timer.mjs core/panel/tests/cache-timer.test.js` → oba pliki
  istnieją; `ls panel/hooks/core/cache-timer.mjs progress/hooks/core/cache-timer.mjs cache-keeper/hooks/relai/cache-timer.mjs mods/hooks/core/cache-timer.mjs`
  → żaden nie istnieje (kopie usunęła karta K-G2);
  `node --test "core/panel/tests/*.test.*"` → 227 zielonych (bez zmiany względem K-G2).
- **Nie ruszasz:** `core/panel/cache-timer.mjs` i jego testu; `cache-keeper/hooks/core.ts`
  i `register.tsx`; dokumentów PANEL_CODEX; martwych eksportów rdzenia używanych tylko w testach (F6).
- **Pułapki:** tabela wyżej porównuje dwie wersje logiki — to materiał dla przyszłej decyzji, nie
  lista zmian. Liczba testów `core/panel` po tym etapie to 227, nie 220.
- **Gotowe, gdy:** zdanie jest we wpisie dziennika, a liczby z „Weryfikacji” się zgadzają. Mody
  zmienione tą kartą: żaden.

---

## K-F5 — wyjęta z planu (decyzja właściciela 2026-11-09)

Znalezisko F5 raportu (pliki `register.tsx` ponad 800 linii) **nie jest realizowane w tym planie**.
Niczego w `cache-keeper/hooks/register.tsx` ani w `panel/hooks/register.tsx` na tej karcie nie
zmieniasz.

- **Powód (FAKT, prototyp 2026-11-09):** samo przeniesienie bloków bez `$` i bez stanu modułu
  obniża `cache-keeper/hooks/register.tsx` z 1 284 do 1 196 linii, a `panel/hooks/register.tsx`
  z 1 110 do 1 095. Próg 800 linii wymaga przepisania stanu modułu na funkcje zapisu, czyli zmiany
  zachowania dwóch największych plików modów. Zysk 88 i 15 linii nie uzasadnia tego ryzyka.
- **Co robisz:** we wpisie dziennika etapu, w części „świadomie odłożone”, zapisujesz jedno zdanie:
  „F5 — podział `register.tsx` odłożony decyzją właściciela z 2026-11-09; wymaga osobnego planu
  z refaktorem stanu modułu.”
- **Gotowe, gdy:** zdanie jest we wpisie dziennika; `git status --short` nie pokazuje żadnego
  z dwóch plików `register.tsx` jako zmienionego tą kartą.
