# E3 — Skaner sekretów i pre-commit

Konwencje wspólne: [00_KONWENCJE.md](00_KONWENCJE.md). Ten etap zmienia wyłącznie
`core/guardrails/` (skaner, pre-commit, instalator) i ich testy. Hooki adapterów Claude Code,
Cursora i Codeksa wołają ten sam `scanText`, więc poprawka skanera działa we wszystkich trzech —
po wydaniu, nie w Twojej sesji (sekcja 6 konwencji).

- **Karty w kolejności wykonania:** K-D1 → K-D4 → K-D3 → K-D2. Najpierw skaner (K-D1 dokłada
  wykrycia i nowy układ grup, na którym stoi K-D4), potem pre-commit, który skaner woła, a na końcu
  instalator, bo jego test dymny uruchamia gotowy pre-commit z gotowym skanerem.
- **Efekt widoczny:** `node core/guardrails/secret-scan.js <plik>` mówi `SEKRET` dla pliku JSON
  z hasłem w cudzysłowie i `BRAK` dla odczytu `System.getenv` w Javie; instalator pre-commita
  w repozytorium z husky odmawia z instrukcją zamiast meldować ochronę, której git nie wywoła.
- **Szacunek:** SZACUNEK 1–2 sesje (K-D1 i K-D4 to ok. 60% pracy).
- **Warunki zatrzymania:** kotwica z karty nie pasuje do pliku; test z „Test najpierw” jest zielony
  przed zmianą albo czerwony z innego powodu niż asercja; skrypt porównania z weryfikacji K-D4
  pokazuje choć jedną nową blokadę na plikach repozytorium; `git --version` starszy niż 2.36
  (brak `git hook run`, potrzebnego w K-D2).
- **Weryfikacja etapu:**

  ```bash
  node --test "core/guardrails/tests/*.test.js"
  node core/tools/validate-adapters.js
  ```

  Stan wyjściowy: 19 testów zielonych. Po etapie: **33** (14 + 9 w `secret-scan.test.js`,
  5 + 5 w `install-precommit.test.js`), 0 czerwonych; `validate-adapters.js` kod 0 z jednym
  ostrzeżeniem o `security-audit/SKILL.md`, jak przed etapem.

Wszystkie wzorce i funkcje z tego pliku zostały uruchomione na prototypie przed zapisaniem karty
(2026-11-09): 14 istniejących testów skanera zielonych na nowym kodzie, 0 nowych i 0 znikniętych
blokad linia po linii na 1193 plikach śledzonych repozytorium (350 832 linie), nowe testy
czerwone na kodzie z `main` z właściwego powodu.

---

## K-D1 — skaner łapie najczęstsze nośniki sekretów

- **Cel:** `scanText` blokuje: nazwę w cudzysłowie przed separatorem (JSON, słownik), nazwy małymi
  literami z przedrostkiem w kształcie pliku konfiguracyjnego (YAML, ini, klucz JSON), nazwy
  zakończone na `_KEY` z rdzeniem sekretu, blok klucza prywatnego PGP, tokeny z prefiksami
  `sk_live_`, `github_pat_`, `gho_`, `xoxb-`, `AIza` oraz hasło w części userinfo adresu URL —
  bez nowych blokad na kodzie repozytorium i z liniowym czasem skanu.
- **Pliki:** `core/guardrails/secret-scan.js`, `core/guardrails/tests/secret-scan.test.js`.
- **Stan dziś** (`secret-scan.js`, linie 20, 30, 43, 89–102):

  ```js
    { label: 'klucz prywatny PEM', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  ```

  ```js
  const ASSIGN_RE = /\b(PASSWORD|PASSWD|SECRET|TOKEN|API[_-]?KEY|ACCESS[_-]?KEY)\b\s*[:=]\s*(["'`]?)([^\s"',;`]{8,})/i;
  ```

  ```js
  const ASSIGN_PREFIX_RE = /(?:^|[^A-Za-z0-9_])((?:[A-Z0-9]+[_-])+(?:PASSWORD|PASSWD|SECRET|TOKEN|API[_-]?KEY|ACCESS[_-]?KEY))\s*[:=]\s*(["'`]?)([^\s"',;`]{8,})/;
  ```

  ```js
    for (const re of [ASSIGN_RE, ASSIGN_PREFIX_RE]) {
      const werdykt = kazdeTrafienie(re, text, (m) => {
        const valueStart = m.index + m[0].length - m[3].length;
        const envRead = !m[2] && ENV_READ_RE.exec(text.slice(valueStart));
  ```

  Grupa przedrostka `(?:[A-Z0-9]+[_-])+` nie ma górnej granicy: ciąg `A-A-A-…` o długości 78 KB
  skanuje się 3,5–4 s (pomiar: 3482–3973 ms; 20 KB — 205–235 ms).
- **Zmiana:**
  1. W tablicy `PATTERNS` zastąp wiersz PEM i dopisz pięć wzorców. Nad tablicą dodaj stałą
     `URL_WORD_RE` i jednolinijkowy komentarz o polu `pomin`:

     ```js
     // Samo slowo w miejscu hasla adresu URL to wzor z dokumentacji (postgres://user:password@host).
     const URL_WORD_RE = /^(?:pass(?:word)?|passwd|secret|pwd)$/i;

     // Pole "pomin" (opcjonalne): filtr trafienia poza EXAMPLE_RE, dostaje wynik exec.
     const PATTERNS = [
       // ... cztery pierwsze wiersze bez zmian ...
       { label: 'klucz prywatny PEM', re: /-----BEGIN [A-Z ]*PRIVATE KEY(?: BLOCK)?-----/ },
       { label: 'klucz Stripe (sk_live_...)', re: /\bsk_live_[A-Za-z0-9]{16,}\b/ },
       { label: 'token GitHub (github_pat_ / gho_ / ghu_ / ghs_ / ghr_)', re: /\b(?:github_pat_[A-Za-z0-9_]{22,}|gh[ousr]_[A-Za-z0-9]{20,})\b/ },
       { label: 'token Slack (xox...)', re: /\bxox[abposr]-[A-Za-z0-9-]{10,}/ },
       { label: 'klucz Google API (AIza...)', re: /\bAIza[0-9A-Za-z_-]{35}(?![0-9A-Za-z_-])/ },
       { label: 'haslo w adresie URL', re: /\b[A-Za-z][A-Za-z0-9+.-]{0,15}:\/\/[^\s:/@]{1,64}:([^\s/@]{8,128})@/,
         pomin: (m) => PLACEHOLDER_RE.test(m[1]) || URL_WORD_RE.test(m[1]) },
     ];
     ```

     `PLACEHOLDER_RE` zostaje w swoim miejscu (pod `ASSIGN_PREFIX_RE`); funkcja `pomin` jest
     wołana dopiero przy skanie, więc kolejność deklaracji nie ma znaczenia. Istniejący wzorzec
     `ghp` i jego etykieta zostają — test istniejący sprawdza etykietę `token GitHub (ghp...)`.
     Schemat URL ma limit 16 znaków, a hasło 128 — bez tych granic wzorzec byłby kwadratowy.
  2. `ASSIGN_RE` — opcjonalny cudzysłów zamykający nazwę jako nowa grupa 2:

     ```js
     const ASSIGN_RE = /\b(PASSWORD|PASSWD|SECRET|TOKEN|API[_-]?KEY|ACCESS[_-]?KEY)\b(["'`]?)\s*[:=]\s*(["'`]?)([^\s"',;`]{8,})/i;
     ```

  3. `ASSIGN_PREFIX_RE` — przedrostek ograniczony do 8 segmentów (koszt liniowy), cudzysłów po
     nazwie, druga gałąź nazwy dla `_KEY` z rdzeniem sekretu. Zastąp całą linię:

     ```js
     const ASSIGN_PREFIX_RE = /(?:^|[^A-Za-z0-9_])((?:[A-Z0-9]+[_-]){1,8}(?:PASSWORD|PASSWD|SECRET|TOKEN|API[_-]?KEY|ACCESS[_-]?KEY)|(?:[A-Z0-9]+[_-]){0,8}(?:SECRET|PRIVATE|ENCRYPTION|SIGNING|MASTER)[_-]KEY)(["'`]?)\s*[:=]\s*(["'`]?)([^\s"',;`]{8,})/;
     ```

     Rdzeń `_KEY` jest zamkniętą listą, nie dowolnym `_KEY`: wariant ogólny dał 7 nowych blokad
     na stałych kodu repozytorium (`SESSION_KEY`, `SCOPE_KEY`, `FLASH_KEY`), czyli defekt
     z zasady 12. Do komentarza nad regułą dopisz jedno zdanie o tym pomiarze.
  4. Pod `PLACEHOLDER_RE` dodaj trzecią regułę z komentarzem:

     ```js
     // Male litery z przedrostkiem (db_password, aws_secret_access_key) — wylacznie w ksztalcie
     // konfiguracji: na poczatku linii (YAML, ini) albo jako klucz obiektu JSON po { lub przecinku.
     // Wartosc bez cudzyslowu musi wtedy konczyc linie; kod OAuth (access_token = resp.get(...))
     // zostaje cichy jak dotad (pomiar 2026-09-04 w komentarzu wyzej).
     const ASSIGN_LOWER_RE = /(?:^|[{,])[ \t]*["']?((?:[a-z0-9]+[_-]){1,8}(?:password|passwd|secret|token|api[_-]?key|access[_-]?key))(["']?)[ \t]*[:=][ \t]*(["'`]?)([^\s"',;`]{8,})/m;
     ```

  5. Przed `function scanText` dodaj dwie funkcje — wydzielenie istniejącej logiki odczytu
     środowiska, bez zmiany jej zachowania:

     ```js
     // Nowa linia nie konczy wyrazenia JS: operator lub dalszy dostep moze dopisac literal.
     // Pomijamy biale znaki i komentarze liniowe, nie kod. true = wyrazenie sie tu konczy.
     function bezKontynuacji(text, koniec) {
       const rest = text.slice(koniec).replace(/^(?:\s|(?:\/\/|#)[^\r\n]*)*/, '');
       return !/^[+?&|*/%<>=!.\[(`-]/.test(rest);
     }

     // true = wartosc bez cudzyslowu jest kodem, nie literalem (tu: kompletny odczyt srodowiska).
     function wartoscJestKodem(text, m, valueStart) {
       const envRead = ENV_READ_RE.exec(text.slice(valueStart));
       return Boolean(envRead) && bezKontynuacji(text, valueStart + envRead[0].length);
     }
     ```

  6. W `scanText` zastąp filtr wzorców i całą pętlę reguł przypisania (od `for (const p of PATTERNS)`
     do końca drugiej pętli):

     ```js
       for (const p of PATTERNS) {
         const werdykt = kazdeTrafienie(p.re, text, (m) => (EXAMPLE_RE.test(m[0]) || (p.pomin && p.pomin(m)) ? null : p.label));
         if (werdykt) return werdykt;
       }
       // Grupy: 1 nazwa, 2 cudzyslow zamykajacy nazwe, 3 cudzyslow wartosci, 4 wartosc.
       for (const re of [ASSIGN_RE, ASSIGN_PREFIX_RE, ASSIGN_LOWER_RE]) {
         const werdykt = kazdeTrafienie(re, text, (m) => {
           const [, nazwa, cudzyslowNazwy, cudzyslow, wartosc] = m;
           const valueStart = m.index + m[0].length - wartosc.length;
           // Klucz w cudzyslowie (JSON, slownik): sekretem jest tylko literal w cudzyslowie.
           if (cudzyslowNazwy && !cudzyslow) return null;
           if (!cudzyslow) {
             if (wartoscJestKodem(text, m, valueStart)) return null;
             if (re === ASSIGN_LOWER_RE && !/^[ \t]*(?:#.*)?(?:\r?\n|$)/.test(text.slice(valueStart + wartosc.length))) return null;
           }
           return PLACEHOLDER_RE.test(wartosc) || TYPE_TOKEN_RE.test(wartosc)
             ? null
             : 'przypisanie ' + nazwa.toUpperCase() + '= z niepusta wartoscia';
         });
         if (werdykt) return werdykt;
       }
       return null;
     ```

     Reguła „klucz w cudzysłowie wymaga wartości w cudzysłowie” jest częścią tej karty: bez niej
     opcjonalny cudzysłów z kroku 2 blokowałby słownik Pythona z identyfikatorem jako wartością.
- **Tabela przypadków** (zmienne pomocnicze z „Test najpierw”: `literal`, `long`, `PW`, `pw`,
  `AK`, `KEY`, `tk`):

  | Wejście słowami | Kod składający wejście | Wynik |
  |---|---|---|
  | JSON, mała nazwa hasła w cudzysłowie | `'{"' + pw + '": "' + literal + '"}'` | `przypisanie PASSWORD= …` |
  | JSON, nazwa klucza API wielkimi | `'{"' + AK + '": "' + literal + '"}'` | `przypisanie API_KEY= …` |
  | słownik Pythona, klucz `secret` w apostrofach | `"cfg = {'secret': '" + literal + "'}"` | `przypisanie SECRET= …` |
  | YAML z wcięciem, `db_` + mała nazwa hasła | `'prod:\n  db_' + pw + ': ' + literal + '\n'` | `przypisanie DB_PASSWORD= …` |
  | ini, mała nazwa klucza AWS | `'aws_secret_access_' + KEY.toLowerCase() + ' = ' + literal` | `przypisanie AWS_SECRET_ACCESS_KEY= …` |
  | Django, nazwa sekretu z `_KEY` | `'SECRET_' + KEY + " = '" + literal + "'"` | `przypisanie SECRET_KEY= …` |
  | nagłówek bloku klucza PGP | `'-----BEGIN PGP PRIVATE ' + KEY + ' BLOCK-----'` | `klucz prywatny PEM` |
  | token Stripe | `['sk', 'live', long].join('_')` | `klucz Stripe (sk_live_...)` |
  | hasło w userinfo URL | `'postgres://admin:' + literal + '@db.example.com/app'` | `haslo w adresie URL` |
  | URL ze słowem zamiast hasła | `'postgres://user:' + pw + '@localhost/db'` | `null` |
  | URL ze zmienną zamiast hasła | `'postgres://user:${DB_' + PW + '}@localhost/db'` | `null` |
  | kod OAuth z małą nazwą z przedrostkiem | `'refresh_' + tk + ' = data.get("refresh_' + tk + '")'` | `null` |
  | stała kodu z `_KEY` spoza listy | `'const SESSION_' + KEY + " = 'relai.session.limit';"` | `null` |
  | 40 000 × `A-` | `'A-'.repeat(40000)` | `null` w czasie < 1000 ms (pomiar prototypu: 6–10 ms) |

- **Test najpierw:** dopisz na końcu `core/guardrails/tests/secret-scan.test.js` (plik ma już
  `literal`, `expected`, `scanText`). Wszystkie nazwy i wartości składane w czasie działania:

  ```js
  // --- K-D1 i K-D4 (etap E03 planu OPTYMALIZACJA_PO_AUDYCIE) ---------------------------------
  // Nazwy i wartosci skladane w czasie dzialania: literal przypisania zatrzymalby zapis pliku.
  const PW = ['PASS', 'WORD'].join('');
  const pw = PW.toLowerCase();
  const AK = ['API', 'KEY'].join('_');
  const ak = ['api', 'Key'].join('');
  const TK = ['TO', 'KEN'].join('');
  const tk = TK.toLowerCase();
  const KEY = ['K', 'EY'].join('');
  const long = literal + literal; // 24 znaki

  test('K-D1: quoted names, lowercase config names and secret _KEY names are blocked', () => {
    const cases = [
      ['{"' + pw + '": "' + literal + '"}', expected(PW)],
      ['{"' + AK + '": "' + literal + '"}', expected(AK)],
      ['{"DB_' + PW + '": "' + literal + '"}', expected('DB_' + PW)],
      ["cfg = {'secret': '" + literal + "'}", expected('SECRET')],
      ['db_' + pw + ': ' + literal, expected('DB_' + PW)],
      ['prod:\n  db_' + pw + ': ' + literal + '\n', expected('DB_' + PW)],
      ['{"db_' + pw + '": "' + literal + '"}', expected('DB_' + PW)],
      ['aws_secret_access_' + KEY.toLowerCase() + ' = ' + literal, expected('AWS_SECRET_ACCESS_' + KEY)],
      ['SECRET_' + KEY + " = '" + literal + "'", expected('SECRET_' + KEY)],
      ['PRIVATE_' + KEY + '=' + literal, expected('PRIVATE_' + KEY)],
      ['APP_ENCRYPTION_' + KEY + '=' + literal, expected('APP_ENCRYPTION_' + KEY)],
    ];
    for (const [text, verdict] of cases) assert.equal(scanText(text), verdict, text.replace(literal, '<literal>'));
  });

  test('K-D1: private key blocks and token prefixes are blocked', () => {
    const github = 'token GitHub (github_pat_ / gho_ / ghu_ / ghs_ / ghr_)';
    const cases = [
      ['-----BEGIN PGP PRIVATE ' + KEY + ' BLOCK-----', 'klucz prywatny PEM'],
      ['k = "' + ['sk', 'live', long].join('_') + '"', 'klucz Stripe (sk_live_...)'],
      ['t = "' + ['github', 'pat', '11AAAAAAA0' + long].join('_') + '"', github],
      ['t = "' + ['gho', long].join('_') + '"', github],
      ['t = "' + ['xoxb', '123456789012', '123456789012', long.slice(0, 20)].join('-') + '"', 'token Slack (xox...)'],
      ['k = "' + 'AIza' + 'Sy' + long + 'abcdefghi"', 'klucz Google API (AIza...)'],
    ];
    for (const [text, verdict] of cases) assert.equal(scanText(text), verdict, verdict);
  });

  test('K-D1: a password in the userinfo part of a URL is blocked, placeholders are not', () => {
    assert.equal(scanText('postgres://admin:' + literal + '@db.example.com/app'), 'haslo w adresie URL');
    assert.equal(scanText('postgres://user:' + pw + '@localhost/db'), null);
    assert.equal(scanText('postgres://user:${DB_' + PW + '}@localhost/db'), null);
    assert.equal(scanText('https://example.com:8080/path@section'), null);
  });

  test('K-D1: lowercase prefixed names in code and non-secret _KEY constants stay silent', () => {
    for (const text of [
      'refresh_' + tk + ' = data.get("refresh_' + tk + '")',
      "{'" + tk + "': access_" + tk + '}',
      'const SESSION_' + KEY + " = 'relai.session.limit';",
      'CACHE_' + KEY + " = 'user-profile-cache'",
    ]) assert.equal(scanText(text), null, text);
  });

  test('K-D1: scan time stays linear on long runs of dash-separated capitals', () => {
    const start = process.hrtime.bigint();
    assert.equal(scanText('A-'.repeat(40000)), null);
    const ms = Number((process.hrtime.bigint() - start) / 1000000n);
    assert.ok(ms < 1000, 'scan took ' + ms + ' ms');
  });
  ```

  Przed zmianą: 4 nowe testy czerwone (trzy pierwsze i test czasu, ok. 3,5 s), test „stay silent”
  zielony — pilnuje, żeby zmiana nie dołożyła fałszywych blokad. Istniejących 14 testów nie
  zmieniasz.
- **Weryfikacja:** `node --test "core/guardrails/tests/secret-scan.test.js"` → 19 pass, 0 fail.
  Cały katalog: `node --test "core/guardrails/tests/*.test.js"` → 24 pass.
- **Nie ruszasz:** etykiet istniejących wzorców; `ENV_READ_RE` (karta K-D4); reszty znaleziska D10
  (marker gościa w `session-signals.js`) — z D10 bierzesz wyłącznie granicę `{1,8}` w
  `ASSIGN_PREFIX_RE`; D11 (wielkość liter w `config-protection.js`); D12; hooków adapterów
  (`adapters/*/hooks/secret-scanner.js`) i znaleziska D8 — etapy E04/E05.
- **Pułapki:**
  - Hook `secret-scanner` sesji (wersja 3.7.0) zablokuje zapis testu z gotowym przypisaniem — także
    w komentarzu i w nazwie przypadku. Składaj wszystko jak wyżej; nie wpisuj przykładów
    w komentarzach kodu skanera.
  - Wyrażenia z backslashem wpisujesz narzędziem Edit, kopiując z tej karty; nigdy przez powłokę.
  - Po kroku 2 numeracja grup w `ASSIGN_RE` się przesuwa — stary kod czytający `m[2]`/`m[3]` musi
    zniknąć w całości (krok 6), inaczej filtr placeholderów sprawdza cudzysłów zamiast wartości.
  - Stan pośredni: po K-D1, a przed K-D4, linia Pythona przypisująca pole obiektu do zmiennej
    o małej nazwie z przedrostkiem (wzór: przypadek `access_`… w K-D4) jest blokowana. K-D4 to
    zamyka; commit jest jeden na etap.
- **Gotowe, gdy:** 19 testów w `secret-scan.test.js` zielonych, a skrypt porównania z weryfikacji
  K-D4 (uruchomiony już po tej karcie) pokazuje 0 nowych blokad.

---

## K-D4 — skaner nie blokuje kodu, odczytów środowiska ani prozy

- **Cel:** wartość bez cudzysłowu, która jest kodem (dostęp do pola, wywołanie bez literału,
  identyfikator kończący instrukcję), odczytem środowiska w Pythonie, Javie albo C#, albo prozą po
  dwukropku, nie daje werdyktu. Literały obok kodu nadal blokują (zasada 12 i D-42 naraz).
- **Pliki:** `core/guardrails/secret-scan.js`, `core/guardrails/tests/secret-scan.test.js`.
- **Stan dziś** (`secret-scan.js`, linia 49 — fragment kotwicy):

  ```js
  |(?:os\.environ\.get|Deno\.env\.get)\([ \t]*(["'])[A-Za-z_][A-Za-z0-9_]*\2[ \t]*\))
  ```

  oraz funkcja `wartoscJestKodem` dodana w K-D1 (kotwica: `// true = wartosc bez cudzyslowu jest
  kodem, nie literalem (tu: kompletny odczyt srodowiska).`).
- **Zmiana:**
  1. W `ENV_READ_RE` zastąp grupę `(?:os\.environ\.get|Deno\.env\.get)` grupą:

     ```js
     (?:os\.environ\.get|os\.getenv|Deno\.env\.get|System\.getenv|(?:System\.)?Environment\.GetEnvironmentVariable)
     ```

     Reszta wyrażenia bez zmian. `ENV["NAZWA"]` z Ruby nie wymaga wpisu: wartość urywa się na
     cudzysłowie po czterech znakach, poniżej progu ośmiu — test to przypina.
  2. Zastąp funkcję `wartoscJestKodem` z K-D1 (razem z jej komentarzem) tym blokiem:

     ```js
     // Zasada 12: guardrail zatrzymujacy nie-sekret to defekt rdzenia. Wartosc bez cudzyslowu, ktora
     // jest KODEM — lancuchem identyfikatorow z kropkami albo wywolaniem bez literalu w nawiasie — nie
     // jest sekretem. Wyjatki, ktore zostaja surowe:
     //  - ksztalt pliku .env (nazwa wielkimi literami i sam znak "=" bez spacji): tam wartosc z kropka
     //    to literal, nie dostep do pola;
     //  - lancuch zaczynajacy sie od korzenia odczytu srodowiska (process, os, import, Deno, System,
     //    Environment): przechodzi wylacznie kompletny odczyt z ENV_READ_RE, podobne nazwy nie;
     //  - goly identyfikator bez kropki i nawiasu jest kodem tylko przed ; , ) albo }, bo w YAML
     //    i .env wyglada tak samo jak haslo;
     //  - po dwukropku (YAML albo obiekt JS) lancuch z kropkami bez wywolania tez wymaga domkniecia.
     // Proza: po dwukropku slowo z samych liter, spacja i kolejne slowo — zdanie dokumentacji.
     const ENV_ROOT_RE = /^(?:process|os|import|Deno|System|Environment)\b/;
     const CODE_RE = /^[A-Za-z_$][\w$]*(?:\??\.[A-Za-z_$][\w$]*|\([^"'`\r\n()]*\))*/;
     const PROZA_RE = /^\p{L}+[ \t]+\p{L}/u;

     // true = wartosc bez cudzyslowu jest kodem albo proza, nie literalem.
     function wartoscJestKodem(text, m, valueStart) {
       const envRead = ENV_READ_RE.exec(text.slice(valueStart));
       if (envRead) return bezKontynuacji(text, valueStart + envRead[0].length);
       const poNazwie = m[0].indexOf(m[1]) + m[1].length + m[2].length;
       const sep = m[0].slice(poNazwie, m[0].length - m[4].length - m[3].length);
       if (/^[A-Z0-9_]+$/.test(m[1]) && sep === '=') return false;
       const tail = text.slice(valueStart);
       if (sep.includes(':') && PROZA_RE.test(tail)) return true;
       if (ENV_ROOT_RE.test(tail)) return false;
       const kod = CODE_RE.exec(tail);
       if (!kod) return false;
       const domkniecie = /^[ \t]*[;,)}]/.test(tail.slice(kod[0].length));
       if (/[.(]/.test(kod[0]) && (sep.includes('=') || kod[0].includes('('))) {
         return bezKontynuacji(text, valueStart + kod[0].length);
       }
       return domkniecie;
     }
     ```

     Wywołanie z literałem w nawiasie nie jest kodem (`CODE_RE` nie przechodzi przez cudzysłów),
     więc odszyfrowanie literału albo odczyt z wartością domyślną zostają zablokowane. Korzeń
     środowiska zostaje surowy, bo istniejący test `similar identifiers and expressions with literal
     fallbacks stay blocked` wymaga blokady dla nazw podobnych do odczytu środowiska.
- **Tabela przypadków:**

  | Wejście słowami | Kod składający wejście | Wynik |
  |---|---|---|
  | JS, pole żądania do zmiennej hasła | `'const ' + pw + ' = req.body.' + pw + ';'` | `null` |
  | JS, wywołanie funkcji bez argumentów | `'const ' + ak + ' = getApiKey();'` | `null` |
  | JS, identyfikator przed średnikiem | `'const ' + pw + ' = hashedPassword;'` | `null` |
  | Python, argument nazwany | `'login(' + pw + '=user_password)'` | `null` |
  | obiekt JS, pole z przecinkiem | `'  ' + pw + ': req.body.' + pw + ','` | `null` |
  | Python, `os.getenv` | `AK + ' = os.getenv("' + AK + '")'` | `null` |
  | Java, `System.getenv` | `'String ' + tk + ' = System.getenv("' + TK + '");'` | `null` |
  | C#, `Environment.GetEnvironmentVariable` | `'var ' + ak + ' = Environment.GetEnvironmentVariable("' + AK + '");'` | `null` |
  | proza po polsku po dwukropku | `TK[0] + tk.slice(1) + ': przechowywany wylacznie w pliku .env'` | `null` |
  | `.env`, wartość z kropką | `PW + '=abc1.def2ghi'` | blokada |
  | wywołanie z literałem | `pw + ' = decrypt("' + literal + '");'` | blokada |
  | `os.getenv` z wartością domyślną | `AK + ' = os.getenv("' + AK + '", "' + literal + '")'` | blokada |
  | goły identyfikator bez średnika | `pw + ' = hunter2hunter'` | blokada |
  | YAML, wartość z kropką | `pw + ': Summer2024.Fall'` | blokada |
  | pole żądania sklejone z literałem | `pw + ' = req.body.' + pw + ' + "' + literal + '"'` | blokada |

- **Test najpierw:** dopisz pod testami K-D1 (te same zmienne pomocnicze):

  ```js
  test('K-D4: field access, calls and identifiers ending a statement are not secrets', () => {
    for (const text of [
      'const ' + pw + ' = req.body.' + pw + ';',
      'const ' + ak + ' = getApiKey();',
      'this.' + tk + ' = options.' + tk + ';',
      'const ' + pw + ' = hashedPassword;',
      'login(' + pw + '=user_password)',
      AK + ' = settings.' + AK,
      'access_' + tk + ' = response.access_' + tk,
      '  ' + pw + ': req.body.' + pw + ',',
      '{ ' + pw + ': req.body.' + pw + ' }',
      '  ' + tk + ': getToken()',
    ]) assert.equal(scanText(text), null, text);
  });

  test('K-D4: environment reads in Python, Java and C# are not secrets', () => {
    for (const text of [
      AK + ' = os.getenv("' + AK + '")',
      'String ' + tk + ' = System.getenv("' + TK + '");',
      'var ' + ak + ' = Environment.GetEnvironmentVariable("' + AK + '");',
      'var ' + ak + ' = System.Environment.GetEnvironmentVariable("' + AK + '");',
      AK + ' = ENV["' + AK + '"]',
    ]) assert.equal(scanText(text), null, text);
  });

  test('K-D4: prose after a name and a colon is not a secret', () => {
    assert.equal(scanText(TK[0] + tk.slice(1) + ': przechowywany wylacznie w pliku .env'), null);
  });

  test('K-D4: literals next to code values stay blocked', () => {
    const cases = [
      [PW + '=abc1.def2ghi', PW],
      [pw + ' = decrypt("' + literal + '");', PW],
      [AK + ' = os.getenv("' + AK + '", "' + literal + '")', AK],
      [pw + ': ' + literal, PW],
      [PW + '=hunter2hunter', PW],
      [pw + ' = hunter2hunter', PW],
      [pw + ': Summer2024.Fall', PW],
      [pw + ' = req.body.' + pw + ' + "' + literal + '"', PW],
    ];
    for (const [text, name] of cases) assert.equal(scanText(text), expected(name), text.replace(literal, '<literal>'));
  });
  ```

  Przed zmianą: trzy pierwsze czerwone, czwarty zielony (straż przed poluzowaniem za daleko).
- **Weryfikacja:**
  1. `node --test "core/guardrails/tests/secret-scan.test.js"` → 23 pass, 0 fail.
  2. Porównanie na całym repozytorium. Narzędziem Write zapisz w scratchpadzie sesji plik
     `porownaj-skaner.js` i uruchom go z katalogu repozytorium (`node <scratchpad>/porownaj-skaner.js`):

     ```js
     'use strict';
     // Porownanie linia po linii: skaner z HEAD (main) vs skaner z drzewa roboczego.
     // Wypisuje plik:linia i etykiete, nigdy tresci linii.
     const fs = require('fs');
     const os = require('os');
     const path = require('path');
     const { execFileSync } = require('child_process');
     const repo = process.cwd();
     const stary = path.join(os.tmpdir(), 'relai-secret-scan-head.js');
     fs.writeFileSync(stary, execFileSync('git', ['show', 'HEAD:core/guardrails/secret-scan.js']));
     const przed = require(stary).scanText;
     const po = require(path.join(repo, 'core/guardrails/secret-scan.js')).scanText;
     const pliki = execFileSync('git', ['ls-files', '-z'], { cwd: repo, maxBuffer: 1 << 28 }).toString().split('\0').filter(Boolean);
     const nowe = []; const znikniete = [];
     for (const rel of pliki) {
       let buf; try { buf = fs.readFileSync(path.join(repo, rel)); } catch (_) { continue; }
       if (buf.includes(0)) continue;
       buf.toString('utf8').split(/\r?\n/).forEach((linia, i) => {
         const a = przed(linia); const b = po(linia);
         if (!a && b) nowe.push(rel + ':' + (i + 1) + '  ' + b);
         if (a && !b) znikniete.push(rel + ':' + (i + 1) + '  ' + a);
       });
     }
     fs.unlinkSync(stary);
     process.stdout.write('NOWE ' + nowe.length + '\n' + nowe.join('\n') + '\nZNIKNIETE ' + znikniete.length + '\n' + znikniete.join('\n') + '\n');
     ```

     Oczekiwane: `NOWE 0` i `ZNIKNIETE 0` (pomiar prototypu na 1193 plikach). Każda nowa blokada
     zatrzymuje etap — opisz plik i linię (bez treści) i zapytaj.
- **Nie ruszasz:** istniejących 14 testów (w tym `similar identifiers…`, który wymaga surowości
  korzenia środowiska); `PLACEHOLDER_RE` i `TYPE_TOKEN_RE`; hooków adapterów (E04/E05).
- **Pułapki:**
  - Hook sesji blokuje zapis **prozy** w kształcie z tej karty — także w komentarzu skanera.
    Komentarz z kroku 2 opisuje prozę słowami; nie dopisuj do niego przykładu.
  - `sep` liczysz z `m[0]` po grupach z K-D1 (1 nazwa, 2 cudzysłów nazwy, 3 cudzysłów wartości,
    4 wartość). Gdy K-D1 nie jest jeszcze w pliku, ta karta się nie składa — zatrzymaj się.
  - `\p{L}` wymaga flagi `u` w `PROZA_RE`; bez niej wyrażenie dopasuje literę `p`.
- **Gotowe, gdy:** 23 testy w `secret-scan.test.js` zielone i skrypt porównania daje `NOWE 0`.

---

## K-D3 — pre-commit skanuje pliki przemianowane i pliki UTF-16

- **Cel:** commit pliku przemianowanego z dopisanym sekretem oraz commit pliku UTF-16 (LE albo BE)
  ze znacznikiem BOM kończy się kodem 1; plik z bajtem zerowym bez BOM nadal jest pomijany jako
  binarny.
- **Pliki:** `core/guardrails/pre-commit.js`, `core/guardrails/tests/install-precommit.test.js`.
- **Stan dziś** (`pre-commit.js`, linie 45–47, 61 i 71–75):

  ```js
  function git(args) {
    return spawnSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, windowsHide: true });
  }
  ```

  ```js
    const lista = git(['diff', '--cached', '--name-only', '--diff-filter=ACM', '-z']);
  ```

  ```js
      const r = git(['show', ':' + plik]);
      if (r.status !== 0) continue; // np. plik usuniety w miedzyczasie
      const buf = r.stdout || '';
      if (buf.indexOf('\u0000') !== -1) continue; // binarny — nie skanujemy
      const werdykt = skaner.scanText(buf);
  ```

- **Zmiana:**
  1. Filtr `--diff-filter=ACM` → `--diff-filter=ACMR`. Jedna litera zamiast `--no-renames`, bo
     przy `--name-only` git podaje dla `R` nową nazwę, czyli tę, którą `git show :<plik>` czyta.
  2. Zastąp funkcję `git` i dodaj pod nią `dekoduj`:

     ```js
     function git(args, kodowanie) {
       return spawnSync('git', args, { encoding: kodowanie || 'utf8', maxBuffer: 64 * 1024 * 1024, windowsHide: true });
     }

     // Tresc pliku z indeksu jako tekst. Znacznik BOM rozstrzyga kodowanie: UTF-16 (LE i BE) jest
     // dekodowany, nie pomijany — inaczej plik zapisany przez edytor Windows w UTF-16 przechodzil bez
     // skanu. Bajt zerowy bez znacznika BOM nadal znaczy plik binarny (null = nie skanujemy).
     function dekoduj(buf) {
       if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) return buf.subarray(2).toString('utf16le');
       if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
         const kopia = Buffer.from(buf.subarray(2, 2 + ((buf.length - 2) & ~1)));
         return kopia.swap16().toString('utf16le');
       }
       if (buf.indexOf(0) !== -1) return null;
       return buf.toString('utf8');
     }
     ```

  3. W pętli zastąp cztery linie od `const r = git(['show'…` do `const werdykt = …`:

     ```js
         const r = git(['show', ':' + plik], 'buffer');
         if (r.status !== 0) continue; // np. plik usuniety w miedzyczasie
         const tekst = dekoduj(r.stdout || Buffer.alloc(0));
         if (tekst === null) continue; // binarny — nie skanujemy
         const werdykt = skaner.scanText(tekst);
     ```

  4. W `install-precommit.js` komentarz nad `testDymny` mówi o `--diff-filter=ACM`; zmienia go
     karta K-D2 (cała funkcja jest tam zastępowana) — tutaj go nie ruszasz.
- **Test najpierw:** dopisz na końcu `core/guardrails/tests/install-precommit.test.js`:

  ```js
  // --- K-D3 i K-D2 (etap E03 planu OPTYMALIZACJA_PO_AUDYCIE) ---------------------------------
  // Wartosc sekretu skladana w czasie dzialania: literal zatrzymalby zapis tego pliku.
  const secretLine = () => ['PASS', 'WORD'].join('') + '=' + ['m7Q', '9rV', '2zL', '8pN'].join('') + '\n';

  // cwdArgs = ['-C', '<podkatalog>'] dla worktree; bez -c core.hooksPath, zeby git szukal hooka
  // sam, jak u uzytkownika (konfiguracja globalna fikstury jest pusta).
  function commitFile(f, name, contents, cwdArgs = []) {
    const dir = cwdArgs.length ? path.join(f.repo, cwdArgs[1]) : f.repo;
    fs.writeFileSync(path.join(dir, name), contents);
    const base = ['-c', 'commit.gpgSign=false', '-c', 'user.name=RelAI regression',
      '-c', 'user.email=relai-regression@localhost', ...cwdArgs];
    assert.equal(f.run('git', [...base, 'add', name]).status, 0);
    return f.run('git', [...base, 'commit', '--quiet', '-m', 'probe ' + name]);
  }

  test('pre-commit scans a renamed file with an added secret', (t) => {
    const f = fixture(t);
    assert.equal(f.install().status, 0);
    const clean = Array.from({ length: 40 }, (_, i) => 'const x' + i + ' = ' + i + ';').join('\n') + '\n';
    assert.equal(commitFile(f, 'a.js', clean).status, 0);
    assert.equal(f.git(['mv', 'a.js', 'b.js']).status, 0);
    fs.appendFileSync(path.join(f.repo, 'b.js'), secretLine());
    assert.equal(f.git(['add', 'b.js']).status, 0);
    assert.match(f.git(['diff', '--cached', '--name-status']).stdout, /^R\d+/);
    const renamed = f.git(['commit', '--quiet', '-m', 'rename']);
    assert.equal(renamed.status, 1, 'rename with a secret must be blocked');
  });

  test('pre-commit decodes UTF-16 files with a BOM and still skips binary files', (t) => {
    const f = fixture(t);
    assert.equal(f.install().status, 0);
    const le = Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(secretLine(), 'utf16le')]);
    assert.equal(commitFile(f, 'le.json', le).status, 1, 'UTF-16LE with BOM');
    assert.equal(f.git(['rm', '--quiet', '--cached', 'le.json']).status, 0);
    const be = Buffer.from(Buffer.concat([Buffer.from([0xfe, 0xff]), Buffer.from(secretLine(), 'utf16le')]));
    be.subarray(2).swap16();
    assert.equal(commitFile(f, 'be.json', be).status, 1, 'UTF-16BE with BOM');
    assert.equal(f.git(['rm', '--quiet', '--cached', 'be.json']).status, 0);
    const binary = Buffer.concat([Buffer.from([0x00, 0x01]), Buffer.from(secretLine(), 'utf8')]);
    assert.equal(commitFile(f, 'blob.bin', binary).status, 0, 'binary without BOM stays unscanned');
  });
  ```

  Przed zmianą: oba czerwone na asercji (`rename with a secret must be blocked`,
  `UTF-16LE with BOM`).
- **Weryfikacja:** `node --test "core/guardrails/tests/*.test.js"` → 30 pass, 0 fail.
- **Nie ruszasz:** komunikatów hooka; listy kandydatów `wczytajSkaner`; plików UTF-16 bez BOM
  (zostają binarne — świadomie, bez zgadywania kodowania).
- **Pułapki:** fikstura testu ustawia `GIT_CONFIG_GLOBAL` na pusty plik i lokalne `user.name`,
  `user.email`, `commit.gpgSign=false` w każdym poleceniu — nie zmieniaj helpera `fixture`.
  `Buffer.swap16` wymaga parzystej długości; dlatego kopia obcina nieparzysty ostatni bajt.
  Na Windows plik testu zapisany z CRLF działa tak samo — test nie porównuje treści plików.
- **Gotowe, gdy:** 30 testów zielonych w `core/guardrails/tests`.

---

## K-D2 — instalator pre-commita instaluje tam, skąd git woła hooki, albo odmawia

- **Cel:** instalator wyznacza katalog z `git rev-parse --git-path hooks`; gdy `core.hooksPath`
  wskazuje inny katalog niż domyślny, **odmawia** (kod 1, nic nie zapisuje) z linią do wklejenia;
  w worktree instaluje we wspólnym katalogu hooków; test dymny woła hook przez gita.
- **Pliki:** `core/guardrails/install-precommit.js`, `core/guardrails/tests/install-precommit.test.js`.
- **Decyzja projektowa:** odmowa zamiast instalacji we wskazanym katalogu, bo katalogiem
  `core.hooksPath` zarządza inne narzędzie (husky, lefthook) i zapis tam nadpisywałby jego pliki
  albo ginął przy jego reinstalacji; jedna linia w jego hooku jest prostsza i trwała.
- **Stan dziś** (linie 52–60, 100, 137, 216, 244–245):

  ```js
  function katalogGita(repo) {
    const r = spawnSync('git', ['rev-parse', '--git-dir'], {
  ```

  ```js
  function testDymny(repo, celHook, celLogika, zeShimem) {
  ```

  ```js
    const hooksDir = path.join(gitDir, 'hooks');
  ```

  ```js
    const test = testDymny(repo, celHook, celLogika, !cudzyHook);
  ```

  ```js
      'Test dymny zdany: przy pustym indeksie hook konczy sie kodem 0' +
      (test.shimSprawdzony ? ' (sprawdzone przez shim i przez sama logike).' : ' (sama logika; sh poza PATH, wiec shimu nie uruchomiono).') + '\n' +
  ```

- **Zmiana:**
  1. Zastąp funkcję `katalogGita` trzema funkcjami:

     ```js
     function revParse(repo, args) {
       const r = spawnSync('git', ['rev-parse'].concat(args), { cwd: repo, encoding: 'utf8', windowsHide: true });
       if (r.status !== 0) return null;
       const wynik = String(r.stdout || '').trim();
       return wynik ? path.resolve(repo, wynik) : null;
     }

     // Dwa katalogi: ten, z ktorego git NAPRAWDE wola hooki (--git-path hooks: uwzglednia
     // core.hooksPath i worktree), i domyslny <wspolny katalog gita>/hooks, w ktorym RelAI instaluje.
     // Rozne = hooki obsluguje inne narzedzie (husky, lefthook, wlasny katalog) — instalacja do
     // domyslnego katalogu bylaby martwa, a do cudzego nadpisywalaby jego pliki.
     function katalogiHookow(repo) {
       const wspolny = revParse(repo, ['--git-common-dir']);
       const wolane = revParse(repo, ['--git-path', 'hooks']);
       if (!wspolny || !wolane) return null;
       return { domyslny: path.join(wspolny, 'hooks'), wolane };
     }

     // path.relative na win32 porownuje bez wielkosci liter — tak samo jak system plikow.
     function tenSamKatalog(a, b) {
       return path.relative(a, b) === '';
     }
     ```

  2. Usuń funkcję `doSh` (po kroku 3 nie ma wywołań) i zastąp funkcję `testDymny` razem z jej
     komentarzem:

     ```js
     // Probka sekretu do testu dymnego, skladana w czasie dzialania: literal przypisania w tym pliku
     // zatrzymalby jego zapis (hook secret-scanner) i jego commit (ten sam pre-commit).
     function probkaSekretu() {
       return ['PASS', 'WORD'].join('') + '=' + ['rel', 'Ai7', 'Smk', '9Qv'].join('') + '\n';
     }

     function blad(nazwa, r, oczekiwany) {
       if (r.error) return { ok: false, opis: nazwa + ' — nie udalo sie uruchomic: ' + r.error.message };
       if (r.status === oczekiwany) return null;
       const stderr = String(r.stderr || '').trim();
       return { ok: false, opis: nazwa + ' — kod wyjscia ' + r.status + ' (oczekiwany ' + oczekiwany + ')' + (stderr ? '\n' + stderr : '') };
     }

     // Test dymny przez gita: "git hook run pre-commit" wola hook ta sama droga co "git commit"
     // (ten sam katalog hookow, ta sama powloka), ale nie tworzy commita. Dwa przebiegi na wlasnym
     // GIT_INDEX_FILE — prawdziwy indeks uzytkownika zostaje nietkniety:
     //   1) pusty indeks -> kod 0 (hook nie blokuje czystego commita),
     //   2) indeks z jednym plikiem-probka z sekretem -> kod 1 (hook naprawde skanuje).
     // Probka trafia do bazy obiektow jako nieosiagalny blob; "git gc" usuwa go sam.
     // Cudzy hook (zeShimem = false): git zawolalby cudzy plik, wiec sprawdzamy sama logike.
     function testDymny(repo, celLogika, zeShimem) {
       const idx = path.join(os.tmpdir(), 'relai-precommit-smoke-' + process.pid + '-' + Date.now() + '.index');
       const env = Object.assign({}, process.env, { GIT_INDEX_FILE: idx });
       const opcje = { cwd: repo, env, encoding: 'utf8', windowsHide: true };
       try {
         if (!zeShimem) {
           return blad('logika hooka (node relai-pre-commit.cjs)', spawnSync('node', [celLogika], opcje), 0) || { ok: true };
         }
         const pusty = blad('git hook run pre-commit, pusty indeks', spawnSync('git', ['hook', 'run', 'pre-commit'], opcje), 0);
         if (pusty) return pusty;
         const blob = spawnSync('git', ['hash-object', '-w', '--stdin'], Object.assign({}, opcje, { input: probkaSekretu() }));
         const sha = String(blob.stdout || '').trim();
         if (blob.status !== 0 || !sha) return { ok: false, opis: 'git hash-object — nie udalo sie zapisac probki' };
         const dodaj = spawnSync('git', ['update-index', '--add', '--cacheinfo', '100644,' + sha + ',relai-smoke-probe.txt'], opcje);
         if (dodaj.status !== 0) return { ok: false, opis: 'git update-index — nie udalo sie dodac probki do indeksu testowego' };
         return blad('git hook run pre-commit, probka z sekretem', spawnSync('git', ['hook', 'run', 'pre-commit'], opcje), 1) || { ok: true };
       } finally {
         try { fs.unlinkSync(idx); } catch (_) { /* pusty przebieg go nie tworzy */ }
       }
     }
     ```

  3. W `main`: `const gitDir = katalogGita(repo); if (!gitDir) {…}` → `const katalogi =
     katalogiHookow(repo); if (!katalogi) {…}` (komunikat i kod 2 bez zmian), a
     `const hooksDir = path.join(gitDir, 'hooks');` → `const hooksDir = katalogi.domyslny;`.
     Deinstalacja zostaje na `hooksDir` (katalog domyślny — tam RelAI zawsze instalowało).
  4. W `main` między blokiem `if (!wymagaNode()) {…}` a `const istniejacy = czytaj(celHook);` wstaw:

     ```js
       // core.hooksPath wskazuje inny katalog: git nigdy nie zawolalby hooka z hooksDir. Odmowa
       // przed zapisem czegokolwiek, z linia do wklejenia w hook narzedzia, ktore tym katalogiem rzadzi.
       if (!tenSamKatalog(katalogi.wolane, hooksDir)) {
         process.stderr.write(
           'RelAI: git wola hooki z "' + katalogi.wolane + '" (core.hooksPath), nie z "' + hooksDir + '".\n' +
           'Nie instaluje niczego: tym katalogiem zarzadza inne narzedzie (np. husky) i plik w ' + hooksDir + '\n' +
           'bylby martwy. Dopisz do hooka pre-commit w "' + katalogi.wolane + '" jedna linie:\n' +
           '  node "' + path.join(__dirname, 'pre-commit.js').split(path.sep).join('/') + '" || exit 1\n' +
           'albo usun core.hooksPath (git config --unset core.hooksPath) i powtorz instalacje.\n'
         );
         return 1;
       }
     ```

  5. `testDymny(repo, celHook, celLogika, !cudzyHook)` → `testDymny(repo, celLogika, !cudzyHook)`;
     w komunikacie cofnięcia linię `'Przy pustym indeksie ma konczyc sie kodem 0, a skonczyl tak:\n'`
     zastąp `'Przy pustym indeksie ma konczyc sie kodem 0, a przy probce z sekretem kodem 1. Wynik:\n'`;
     dwie linie komunikatu sukcesu z kotwicy zastąp jedną:
     `'Test dymny zdany przez "git hook run pre-commit": pusty indeks -> kod 0, probka z sekretem -> kod 1.\n' +`.
  6. W komentarzu nagłówka (linie 29–31) zdanie o dowodzie zastąp: „dowodem jest `git hook run
     pre-commit` — kod 0 przy pustym indeksie i kod 1 przy próbce z sekretem”; w linii 14 „Do
     .git/hooks/” → „Do katalogu hooków gita (wspólnego dla worktree)”.
- **Test najpierw:** dopisz pod testami K-D3:

  ```js
  const relaiFiles = ['pre-commit', 'relai-pre-commit.cjs', 'relai-secret-scan.cjs'];

  test('install refuses core.hooksPath pointing elsewhere and writes nothing', (t) => {
    const f = fixture(t);
    fs.mkdirSync(path.join(f.repo, '.husky'));
    assert.equal(f.run('git', ['config', 'core.hooksPath', '.husky']).status, 0);
    const result = f.install();
    assert.equal(result.status, 1, result.stdout + result.stderr);
    assert.match(result.stderr, /core\.hooksPath/);
    assert.ok(result.stderr.includes('.husky'), result.stderr);
    assert.match(result.stderr, /pre-commit\.js" \|\| exit 1/);
    for (const file of relaiFiles) assert.equal(fs.existsSync(path.join(f.hooks, file)), false, file);
    assert.deepEqual(fs.readdirSync(path.join(f.repo, '.husky')), []);
  });

  test('install smoke-tests through git and leaves the real index untouched', (t) => {
    const f = fixture(t);
    fs.writeFileSync(path.join(f.repo, 'staged.txt'), 'clean fixture\n');
    assert.equal(f.git(['add', 'staged.txt']).status, 0);
    const result = f.install();
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /git hook run pre-commit/);
    assert.equal(f.git(['diff', '--cached', '--name-only']).stdout.trim(), 'staged.txt');
    const blocked = commitFile(f, 'conf.txt', secretLine());
    assert.equal(blocked.status, 1, blocked.stderr);
    assert.match(blocked.stderr, /ZATRZYMANY/);
  });

  test('install from a linked worktree lands in the common hooks directory', (t) => {
    const f = fixture(t);
    assert.equal(commitFile(f, 'base.txt', 'base\n').status, 0);
    assert.equal(f.git(['worktree', 'add', '--quiet', 'wt']).status, 0);
    const wt = path.join(f.repo, 'wt');
    const result = f.run(process.execPath, [installer, wt]);
    assert.equal(result.status, 0, result.stderr);
    for (const file of relaiFiles) assert.ok(fs.existsSync(path.join(f.hooks, file)), file);
    const blocked = commitFile(f, 'conf.txt', secretLine(), ['-C', 'wt']);
    assert.equal(blocked.status, 1, blocked.stderr);
  });
  ```

  Przed zmianą (zmierzone na `main`): pierwszy czerwony — instalator kończy kodem 0 z „pre-commit
  zainstalowany”; drugi — brak `git hook run pre-commit` w komunikacie; trzeci — brak plików
  w `.git/hooks` (trafiły do `.git/worktrees/wt/hooks`).
- **Weryfikacja:** `node --test "core/guardrails/tests/*.test.js"` → **33 pass**, 0 fail (pięć
  istniejących testów instalatora bez zmian zielonych). `node core/tools/validate-adapters.js`
  → kod 0, jedno ostrzeżenie jak przed etapem.
- **Nie ruszasz:** logiki deinstalacji i odmowy przy cudzym hooku (testy 1–5 pilnują jej
  zachowania); `SHIM`; `pre-commit.js` (K-D3).
- **Pułapki:**
  - `git hook run` istnieje od gita 2.36; na tej maszynie jest 2.49. Starszy git kończy test dymny
    błędem i instalator cofa instalację z komunikatem — to zamierzone (bez dowodu nie ma ochrony).
  - Wyjście `git rev-parse --git-path hooks` jest względne wobec `cwd` — zawsze `path.resolve(repo, …)`.
  - Fikstury repozytoriów tylko w `os.tmpdir()`; helper `f.git` wymusza `-c core.hooksPath=.git/hooks`,
    więc commit w worktree idzie przez `commitFile` z `['-C', 'wt']`, nie przez `f.git`.
  - Próbka sekretu w `probkaSekretu` musi być składana z części — hook sesji zablokuje zapis pliku
    z gotowym przypisaniem.
- **Gotowe, gdy:** 33 testy zielone w `core/guardrails/tests`.

---

## Do rozstrzygnięcia przez człowieka (nie blokuje wykonania)

- **K-D2:** odmowa przy `core.hooksPath` to wybór karty. Alternatywa — instalacja w katalogu
  wskazanym przez `core.hooksPath` — wymaga decyzji właściciela, bo zapisuje do katalogu innego
  narzędzia, często śledzonego w repozytorium.
- **K-D1:** lista rdzeni `_KEY` (`SECRET`, `PRIVATE`, `ENCRYPTION`, `SIGNING`, `MASTER`) jest
  zamknięta; nazwy dostawców (np. klucz Stripe nazwany od firmy) zostają poza skanem nazw.
- **K-D4:** świadome luki po stronie wykrywania — wartość w pliku ini z małą nazwą i separatorem
  „=”, mająca kształt kropkowanego identyfikatora, jest traktowana jak kod; świadome fałszywe
  blokady, które zostają — wywołanie z literałem w nawiasie (np. kodowanie `hex` w `toString`).
