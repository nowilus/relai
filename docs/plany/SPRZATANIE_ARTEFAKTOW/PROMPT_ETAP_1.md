# PROMPT_ETAP_1 — Komenda `/relai-clean` i narzędzie rdzenia do sprzątania artefaktów roboczych

Plan: SPRZATANIE_ARTEFAKTOW • Etap: **E1 z E4** • Wygenerowano: 2026-09-03 (autor: Fable, przy
akceptacji planu) • Wykonawca: **Opus** (D-85 — model wykonawczy etapów w tym projekcie)

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus**. Jeśli sesja działa na innym
> modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

> **Warunek startu — materiał pomiarowy.** Część punktów weryfikacji wymaga cudzego projektu
> (PolyFlow) wyłącznie **do odczytu raportu**, nie do kasowania. Uruchom sesję z
> `--add-dir "C:\Users\Lukasz\Desktop\PolyFlow"` albo wykonaj te punkty w osobnej sesji w tamtym
> folderze po zakończeniu etapu — ale **nie zamykaj etapu „na oko"**: punkt bez pomiaru zostaje
> w prompcie jako niewykonany z warunkiem wykonalności.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, reguły profilu `prompty` (rejestr artefaktów), definicja ukończenia, sekcja niemutowalna |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk", sekcja „Czeka na człowieka" + wpis z 2026-09-03 o planie SPRZATANIE_ARTEFAKTOW (rozstrzygnięcia z wywiadu i akceptacji) |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |
| `docs/plany/SPRZATANIE_ARTEFAKTOW/PLAN.html` | sekcje 5 (jak działa: katalog roboczy, narzędzie, lista chronionych, grupy), 6 (zakres E1), 7 (ryzyka 1, 2, 7), 8 (przypadki brzegowe — wszystkie piętnaście), 9 (rozstrzygnięte sprawy) |
| `adapters/claude-code/commands/relai-backup.md` | **wzorzec konwencji komendy**: krok 0 marker, pytanie raz, weryfikacja na wyniku, wpis w dzienniku wg D-43, sekcja zakazów — `/relai-clean` ma ten sam układ |
| `core/guardrails/secret-scan.js` | wzorzec pliku rdzenia „biblioteka + CLI": `module.exports` + blok `if (require.main === module)`, komunikaty ASCII, zero zależności; stamtąd też bierzesz wzorce grupy „Sekrety" |
| `core/process/session-signals.js` | funkcje `copyTree` i `provisionTemplates` (ok. linie 95–135) — tam dokładasz prowizjonowanie narzędzia; `module.exports` na końcu pliku |
| `core/MANIFEST.json` | sekcje `process` i `adapters[].uses` — nowy plik rdzenia musi tam stanąć, walidator to sprawdza |
| `adapters/claude-code/skills/relai-core/SKILL.md` | sekcje „Zamknięcie sesji" i „Twarde zakazy tego skilla" — między nimi dokładasz sekcję o plikach lokalnych; kroku 2a **nie** dokładasz (E2) |
| `docs/ARTEFAKTY.md` | zasady prowadzenia rejestru — nowa komenda i zmieniony skill dostają wiersze |
| `docs/PULAPKI.md` | P-001 (`tar` na `PATH`), P-003 (PowerShell 5.1 i UTF-8), P-004 (`acceptEdits` a Bash) — wszystkie trzy dotyczą testów tego etapu |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Mechanizm to narzędzie w rdzeniu (wariant A):** jeden plik Node bez zależności, biblioteka
  i CLI, prowizjonowany do projektu; komenda i rytuały mówią, kiedy go uruchomić i o co zapytać;
  narzędzie **nigdy nie decyduje samo**, co skasować — kasuje listę, którą dostało (plan, sekcja 4;
  D-40).
- **Katalog roboczy etapu jest w projekcie:** `.claude/relai/work/<TEMAT>/E<N>/`; odnoga
  `.claude/relai/work/<TEMAT>/<NAZWA_ODNOGI>/`, wątek samodzielny `.claude/relai/work/_fixy/<NAZWA>/`,
  sesja bez planu `.claude/relai/work/_sesja/<RRRR-MM-DD>/` (decyzja właściciela 2026-09-03; plan,
  sekcja 5). Lokalizacji nie negocjujesz i nie dokładasz czwartego kształtu ścieżki.
- **Pliki nieśledzone i ignorowane w repo są w zakresie**, ale **pliki śledzone przez gita nigdy
  nie są kandydatami** — ich usunięcie to zmiana produktu (nie-cel). Lokalne notatki właściciela
  chroni flaga: linia-marker **`# relai: zachowaj`** (EN `# relai: keep`) w `.gitignore` nad
  wzorcem — marker dotyczy **następnej linii niebędącej komentarzem**; cały `.git/info/exclude`
  jest chroniony; projekt bez gita: `.claude/relai/keep`, jedna ścieżka na linię. **Brzmienie
  zaakceptowane 2026-09-03** — lista zamknięta, bez wariantów (L-0025, L-0035).
- **Lista powodów ochrony jest zamknięta** (plan, sekcja 5): `śledzone`, `zachowaj`, `opisane`
  (ścieżka w `ARCHITEKTURA.md`, `CLAUDE.md`, `README.md` — z plikiem i linią), `wiązane testami`
  (`test_*.py`, `*_test.py`, `*.test.*`, `*.spec.*`, katalog `tests/`), `zależności / narzędzia`
  (`node_modules`, `venv`, `.venv`, `vendor`, `.git`, `.claude` poza `relai/work`, `.cursor`,
  `.vscode`, `.idea`), `sekret` (wzorce z `/relai-backup`, ścieżka bez treści — D-42), `etap trwa`
  (status inny niż `ZREALIZOWANY` / `POMINIĘTY`, odnoga `OTWARTA`, sesja z dzisiejszą datą).
  Niepewność rozstrzygasz **na korzyść ochrony**.
- **Grupy raportu i pytanie** (plan, sekcja 5): etapy zamknięte (jedna grupa na katalog), cache
  regenerowalne (`__pycache__`, `.pytest_cache`, `.mypy_cache`, `.ruff_cache` — jedna grupa),
  repo per katalog najwyższego poziomu (+ grupa „korzeń"), TEMP z nazwą projektu, TEMP `relai-*`.
  Jedno pytanie na grupę, **partiami po cztery** (jak przegląd spraw przeterminowanych), opcje:
  skasować wszystko · zostawić · **zostaw na zawsze** (dopisuje marker) · odpowiedź swobodna
  z wyjątkami. **Nie czterdzieści pytań i nie kasowanie bez pytania.**
- **Kasowanie**: `fs.rmSync(recursive, force, maxRetries)` — obiekty Gita tylko do odczytu
  przechodzą bez `onerror` (FAKT, Node 24.13.1, 2026-09-03). Każda ścieżka po `realpath` musi leżeć
  pod katalogiem projektu albo pod `os.tmpdir()`, nigdy być którymkolwiek korzeniem ani `.git`;
  dowiązania i junction usuwane jako dowiązanie, bez wchodzenia. Niepowodzenie = pozycja na liście
  z kodem błędu, reszta idzie dalej; po kasowaniu pomiar raz jeszcze. **Bez `rm -rf`, bez Pythona,
  bez PowerShella** (P-003, D-40).
- **Slug projektu** liczony jak nazwa archiwum w `/relai-backup` (D-43): nazwa folderu, spacje → `_`,
  bez diakrytyków, małe litery; dopasowanie w TEMP bez rozróżniania wielkości liter, prefiksy
  `<slug>-`, `<slug>_`, `relai-`.
- **Prowizjonowanie tą samą drogą co specyfikacje** (L-0012): hook startu kopiuje narzędzie do
  `.claude/relai/tools/clean-work.js`; plik skopiowany musi być **samowystarczalny** (nie wolno mu
  wołać `require` na rdzeń — w projekcie użytkownika rdzenia nie ma).
- **Nigdy ciche kasowanie** (D-18), **nigdy sekret w raporcie** (D-42), **komunikaty CLI w ASCII**
  (L-0016), **kasowanie tylko po „tak" udzielonym w tej sesji**.
- **Granica zakresu:** wiersz `Artefakty robocze` w `USTAWIENIA.md`, próg 100 MB, funkcja raportu
  dla hooka startu, krok 2a rytuału zamknięcia, zmiany w `relai-core.mdc` i w linii fraz sesji —
  **E2**. Katalog roboczy w promptach etapowych i odnóg, `/relai-stage`, `/relai-branch` — **E3**.
  `SPEC_KOMENDY.md`, `docs/KOMENDY.md`, README i ikona, `relai-update.md`, podbicie wersji do
  1.8.0, sekwencja P-005, `/relai-update` PolyFlow — **E4**. W tym etapie **nie podbijasz wersji**
  i niczego z tej listy nie obiecujesz w dokumentach; komenda działa z repozytorium, nie
  z zainstalowanego pluginu (1.7.0 nie ma jej i mieć nie będzie).

## Stan wyjściowy (co realnie zastajesz)

Repozytorium na **1.7.0**, wypchnięte; plugin zainstalowany globalnie (scope `user`) w tej samej
wersji — komendy z repozytorium testujesz **z plików repo**, nie z cache'u pluginu. Plan
SPRZATANIE_ARTEFAKTOW zaakceptowany 2026-09-03 bez aneksów (sprawy 1 i 2 sekcji 9 rozstrzygnięte
zgodnie z rekomendacją); ten etap jest pierwszy. Drzewo robocze: plan, `STATUS.md`, wpisy
w `CLAUDE.md`/`STATE.md`/`DZIENNIK.md` — zacommitowane albo do zacommitowania na starcie (sprawdź
`git status`; niezacommitowany plan nie blokuje etapu, ale zamknięcie etapu commituje wszystko
naraz).

```
core/
  MANIFEST.json                       # rdzeń: templates, guardrails[3], process[1: session-signals], tools[1], adapters[2] z uses[]
  guardrails/secret-scan.js           # wzorzec „biblioteka + CLI": scanText, PATTERNS, blok require.main; ASCII
  process/session-signals.js          # 1045 linii; copyTree (rozszerzenia .md/.html/.js/.css/.woff2), provisionTemplates
                                      #   (pisze .gitignore "*" w .claude/relai i kopiuje templates/), startCost*, sprawy*
  tools/validate-adapters.js          # sprawdza MANIFEST ↔ pliki, require w kodzie adapterów, plugin.json, hooks.json, wersje
  templates/                          # 22 specyfikacje + HTML_PLAN/; kopiowane do .claude/relai/templates/ przy starcie
adapters/claude-code/
  commands/relai-*.md                 # 10 komend; relai-backup.md = wzorzec konwencji; frontmatter: description, argument-hint
  hooks/session-context.js            # woła core.provisionTemplates(cwd, {coreTemplates, destRel:'.claude/relai'})
  skills/relai-core/SKILL.md          # rytuał startu, definicja ukończenia, zamknięcie sesji (kroki 1–6), frazy, zakazy
adapters/cursor/
  hooks/session-context.js            # ta sama funkcja prowizjonowania — dostanie narzędzie za darmo
  install.js                          # kopiuje commands/*.md z adaptera Claude Code — nowa komenda trafia do Cursora sama
.claude/relai/                        # cache w projekcie: .gitignore "*", templates/ (31 plików); katalogów tools/ i work/ NIE ma
docs/
  ARTEFAKTY.md                        # rejestr wersji artefaktów (profil prompty): 38 pozycji od 2026-09-01, wersje całkowite
  PULAPKI.md                          # P-001…P-006
  plany/SPRZATANIE_ARTEFAKTOW/        # PLAN.html, STATUS.md, ten prompt
  archiwum/plany/HIGIENA_DOKUMENTOW/  # plan ZREALIZOWANY — jego etapy są materiałem na „katalog etapu zamkniętego"
  plany/ROZWOJ_PO_WYDANIU/            # plan ZAMROŻONY: E1–E6 ZREALIZOWANY, E7 OCZEKUJE — materiał na „etap trwa" w planie zamrożonym
```

**Warunki pracy:** Node 24.13.1 na `PATH` (FAKT); `tar` z Git Bash to GNU tar (P-001) — do testów
nie jest potrzebny; PowerShell 5.1 zjada polskie znaki (P-003) — nie mierz nim niczego; polecenia
Bash nie wchodzą w `acceptEdits` (P-004). `%LOCALAPPDATA%\Temp` **nie ma dziś ani jednej pozycji
`relai-*` ani `polyflow*`** (FAKT, 2026-09-03) — materiał testowy tworzysz sam i sprzątasz sam.
Bramka hooka blokująca `rm -rf` poza katalogiem projektu istnieje na tej maszynie (FAKT z przebiegu
2026-09-03); nie wiadomo, czy uderzy w `node …clean-work.js` uruchomione z katalogu projektu —
to jest punkt weryfikacji, nie założenie.

**Czego jeszcze NIE ma:** pliku `core/process/work-artifacts.js`; katalogu `.claude/relai/tools/`
w żadnym projekcie; komendy `/relai-clean`; sekcji o plikach lokalnych i markerze w skillu;
wiersza narzędzia w `MANIFEST.json`; żadnego wystąpienia frazy `relai: zachowaj` w repozytorium
(sprawdź `git grep -n "relai: zachowaj"` — ma zwrócić wyłącznie plan i ten prompt).

### Zasady aktywne z rejestru lekcji (przepisane w całości, stan na 2026-09-03)

1. **Specyfikacja dokumentu jest kompletna albo martwa:** kończy się realnym przykładem, wypisuje
   wymaganą strukturę w treści (odesłanie nie wystarcza) i ma zapisaną ścieżkę „pytam zamiast
   zmyślać" wraz z formą zapisu luki. (L-0001, L-0011, L-0026)
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — fraza wchodzi do
   `KOMENDY.md` w wersji, w której realnie działa, a forma wywołania jest tą, którą uruchomiłeś
   dosłownie. Komendę wklejaną do dokumentu odpalasz z tej samej powłoki, którą zobaczy czytelnik:
   znak interpretowany przez powłokę zapisujesz tak, żeby nie musiała go tknąć. (L-0002, L-0022,
   L-0059)
3. **Test „czegoś nie wolno" wymaga dowodu negatywnego:** pokaż, że chroniony fragment ma nadal
   pierwotne brzmienie, nie tylko że nowy wpis powstał. (L-0007)
4. **Dowodzisz efektem, nie zdarzeniem:** stanem pliku, sumą kontrolną, treścią odpowiedzi.
   Kryterium stawiasz na stanie, który kontrolujesz, i na źródle, które artefakt produkuje — nie na
   cudzym strumieniu. Zmianę zachowania pokazujesz **obiema wersjami w jednym przebiegu**,
   a instrument porównawczy implementuje wiernie każdą z nich. **Kryterium stawiasz na poprawności
   wyniku, nie na kierunku liczby, której nie kontrolujesz** — „wartość maleje" wolno napisać
   wyłącznie wtedy, gdy zmiana z definicji ją zmniejsza. **Kryterium sukcesu sprawdzasz na
   materiale, zanim zaczniesz pracę** — policz na wskazanym pliku liczbę, którą ma osiągnąć,
   i porównaj ją z tym, co mechanizm w ogóle kontroluje; kryterium arytmetycznie nieosiągalne
   wraca do człowieka jako aneks, a nie kończy etap jako niedowieziony punkt. (L-0017, L-0018,
   L-0040, L-0051, L-0052, L-0063, L-0069)
5. **Instrument pomiarowy sam bywa źródłem fałszu:** wyrażenia regularne trzymaj w pliku, nie
   w `node -e`; scenariusz „konfiguracji nie ma" mierz z podstawionym katalogiem domowym; dokładaj
   przypadek, który **musi** trafić. Zero trafień przy niepustych zbiorach to defekt instrumentu,
   dopóki nie udowodnisz inaczej — porównanie identyfikatora wygenerowanego z zastanym ma obok
   siebie kontrolę „ile zastanych nie znalazło pary". Dzieląc wiersz po separatorze, który da się
   wyescapować, dziel po separatorze **niepoprzedzonym znakiem ucieczki** i sprawdzaj liczbę pól po
   podmianie. **Trafienie zgłoszone na materiale, który dotąd był zdrowy, sprawdzasz najpierw na
   instrumencie**; w łańcuchu podmian zbiór znaków zachowywanych wypisujesz raz, bo znak usunięty
   wcześniej nie wróci później. **Filtr odsiewający „to nie jest przypadek do sprawdzenia" ma
   wyjątek dla linii mówiącej wprost o rzeczy sprawdzanej**, a każdy przypadek graniczny ma własną
   kontrolę na wyjściu — jedna kontrola przechodzi zielono, gdy zniknął przypadek, którego nie
   sprawdza. **Wzorzec identyfikatora pozycji ma obok siebie kontrolę „ile wierszy odrzucono"** —
   realny rejestr trzyma numery, których wzorzec nie przewidział, a odrzucenie jest ciche.
   **Generator identyfikatorów ma kontrolę pozytywną na wszystkich kandydatach, nie na
   pierwszym** — sprawdzasz, czy wygenerowana wartość występuje w tym samym pliku; pierwszy
   element bywa jedynym nielinkowanym i przewraca kontrolę na poprawnym generatorze.
   Wyczerpany limit konta zatrzymuje pomiar i idzie do odnogi, nie do adnotacji „sprawdzone
   inaczej". (L-0032, L-0037, L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073)
6. **Próg jest liczbą, którą ktoś liczy:** kalibruj go na zmierzonych plikach realnych projektów,
   zapisuj w jednostce mechanizmu kontrolnego wraz z komendą sprawdzającą i daj mu **jeden**
   wyzwalacz — wielkości pomocnicze wskazują przyczynę wewnątrz komunikatu, nie wywołują go.
   **Blokadę przeniesioną pod nowy adres mierzysz tak samo:** licz na realnym pliku, ile pozycji
   przechodzi po zmianie — reguła wskazująca „najstarszy element" w mechanizmie idącym od
   najstarszego zatyka go z definicji. **Próg porównuj do wielkości, którą mechanizm kontroluje**
   (część usuwalna), a sygnał o zatkaniu wyzwalaj **różnicą między możliwym a wykonanym**, nie
   zerem wykonanego — warunek „nic nie przeszło" milczy przy „przeszło 2 z 87". (L-0034, L-0049,
   L-0053, L-0060, L-0065)
7. **Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień:** dopasowanie od początku
   komórki, wybór linii po niesionej wartości (nie po kolejności), wartość nierozpoznana znaczy
   cisza. **Rdzeń słowa w języku z diakrytykami łapiesz klasą znaków tego języka, nie `\w`** —
   `\w` bez flagi `u` to `[A-Za-z0-9_]`, więc wzorzec przechodzi na formach bez ogonków i odpada
   na realnym dokumencie; wynik zawyżony jest tak samo podejrzany jak zerowy. **Rdzenia szukasz
   w samym brzmieniu wartości, nie w całej komórce** — za datą stoi proza z tymi samymi słowami,
   więc dopasowanie „gdziekolwiek" wciąga pozycje, które należą do innego mechanizmu.
   **Zamknięta lista ma koszt po drugiej stronie i ten koszt mierzysz:** ile pozycji wygląda dla
   człowieka na rozpoznane, a nie jest; poszerzenie listy jest decyzją człowieka, nie poprawką.
   (L-0025, L-0035, L-0048, L-0066, L-0070, L-0074)
8. **Zachowanie, które ma działać zawsze, mieszka w warstwie obecnej w każdej sesji** —
   `CLAUDE.md` projektu albo hook; skill dokłada procedurę i wyzwala się zawodnie, a komenda
   wywołana wprost go nie ładuje. Sygnał, który ma paść raz, ma jednego właściciela; cisza
   właściciela znaczy „sprawdzone i zgodne". (L-0015, L-0030, L-0036)
9. **Skill nie zakłada dostępu do niczego poza katalogiem roboczym** — ani do katalogu pluginu, ani
   do domowego. Opis zaczynaj od `MUST BE USED`, markera projektu i płaskiej listy fraz; każdy krok
   sięgający dalej ma zapisane wyjście po odmowie dostępu. (L-0009, L-0010, L-0012, L-0023)
10. **Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI**, zachowania mierzysz
    świeżą sesją, a po podbiciu numeru przepuszczasz repo `grep`-em po starym i rozstrzygasz każde
    trafienie — **także w treści komend, skilli i specyfikacji**, dzieląc je na wzmianki
    historyczne i deklaracje stanu docelowego. Kontrola patrząca tylko na manifesty tej różnicy nie
    widzi. (L-0004, L-0008, L-0020, L-0061)
11. **Końce linii są wariantem, nie szczegółem.** Sumy kontrolne porównuj po normalizacji
    CRLF → LF; w regexie nad pojedynczą linią nie zakotwiczaj końca, bo kropka nie obejmuje `\r`
    i wzorzec przestaje trafiać na repozytorium z `core.autocrlf=true`; mechanizm czytający
    strukturę pliku sprawdzaj na **obu** wariantach w jednym przebiegu. Przeniesienie katalogu
    wskazywanego przez cudzy manifest sprawdzaj najpierw **na kopii**, walidatorem tego manifestu.
    **Kolejność wpisów w dokumencie jest takim samym wariantem** — kierunek ustalaj z danych (daty
    w nagłówkach), nie z nawyku wziętego z projektu, w którym mechanizm powstał. **Wariantem jest
    też stan dokumentu wobec własnej specyfikacji** — realny projekt trzyma pozycje, które reguła
    każe usunąć; mechanizm sprawdzaj na dokumencie realnego projektu i odsiewaj takie stany tą samą
    zamkniętą listą brzmień, której używa reszta rdzenia. (L-0033, L-0038, L-0057, L-0062, L-0067)
12. **Guardrail zatrzymujący treść, która sekretem nie jest, to defekt rdzenia** — poprawka wraca
    z dowodem, nigdy jako obejście. Wołaj go przez opakowanie powłoki, żeby brak interpretera
    zamieniał się w blokadę, a nie w ciszę; próbki sekretów składaj w czasie wykonania.
    **Znak cudzysłowu — także backtick — należy do grupy cudzysłowu, nigdy do klasy wartości**,
    inaczej guardrail zatrzymuje zdanie opisujące jego samego. (L-0043, L-0045, L-0046, L-0072)
13. **Cudze narzędzie poznajesz z wydanego builda i z próby**, nie z dokumentacji: payload parsuj
    po zdjęciu BOM i bez założeń o nazwach pól, sesję CLI uruchamiaj z powłoki natywnej, a brak
    sygnału konfrontuj najpierw z **warunkiem milczenia** mechanizmu. (L-0041, L-0042, L-0044,
    L-0047)
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Weryfikację planuj tam,
    gdzie jest wykonalna; po pytaniu sprzątasz sam (martwy link nie jest poprawną wartością
    tymczasową); przy wyprowadzaniu pozycji jednostką inwentarza jest **sprawa**, nie linia.
    Wstawkę kotwicz do elementu, który przeżyje operację, i dowódź **obecności** nowej treści —
    „nic nie zginęło" nie znaczy „wszystko powstało". (L-0005, L-0013, L-0014, L-0050, L-0058)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    Przy zadaniu wizualnym zbierasz najpierw cechy pozytywne i pokazujesz jeden wariant do
    kalibracji. Ostrzeżenie `claude plugin validate` o root `CLAUDE.md` jest świadomym skutkiem
    dogfoodingu — nie „naprawiaj" go. (L-0003, L-0006, L-0016, L-0019, L-0029)

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/SPRZATANIE_ARTEFAKTOW/E1/`.** Wszystko
tymczasowe — skrypty testowe, materiał kontrolowany, klony, listy ścieżek — powstaje tam; poza nim
wyłącznie pozycje w `os.tmpdir()` tworzone **celowo** do testu heurystyki TEMP, z prefiksem
`relai-e1-` albo `relai-test-`, i sprzątane w punkcie 9. Katalog powstaje przy pierwszym zapisie.

1. **`core/process/work-artifacts.js`** — plik rdzenia, biblioteka + CLI, zero zależności,
   **żadnego `require` na inne pliki rdzenia** (kopia w projekcie użytkownika ma działać sama).
   Nagłówek komentarza jak w `secret-scan.js`: po co, gdzie używany, ASCII. Eksporty (nazwy
   polskie bez ogonków, jak w `session-signals.js`):
   - `slugProjektu(cwd)` — wg D-43;
   - `czytajMarkery(cwd)` — wzorce z `.gitignore` poprzedzone linią `# relai: zachowaj` /
     `# relai: keep` (marker dotyczy następnej linii niebędącej komentarzem; komentarz to linia
     zaczynająca się od `#` po przycięciu), cały `.git/info/exclude`, `.claude/relai/keep`;
     zwraca listę wzorców ze źródłem;
   - `artefaktyRobocze(cwd, opcje)` — pomiar trzech źródeł: `work` (podkatalogi
     `.claude/relai/work/`, pochodzenie ze ścieżki: `etap` / `odnoga` / `fixy` / `sesja` /
     `nieznane`, status z `STATUS.md` planu w `docs/plany/` **albo** `docs/archiwum/plany/`,
     z karty odnogi, z daty sesji), `temp` (wpisy najwyższego poziomu `os.tmpdir()` z prefiksem
     `<slug>-`, `<slug>_`, `relai-`, bez rozróżniania wielkości liter), `repo` (`git status
     --porcelain=v1 --ignored=matching -z`, wpisy `??` i `!!`; brak gita → `repo: null` i flaga
     `bezGita`). Każda pozycja: ścieżka bezwzględna, bajty, liczba plików, `mtime` najnowszy,
     pochodzenie, `chronione: null | {powod, zrodlo}`. Chodzenie po katalogu z limitem
     `LIMIT_WPISOW = 20000` wpisów na pozycję — po przekroczeniu `bajty` niesie wartość dotąd
     policzoną i flagę `niepelne: true` (raport pokazuje „≥"). Dowiązania liczone jako 0 B, bez
     wchodzenia. Wynik ma `suma` (bajty pozycji **niechronionych**) i `czas` w ms;
   - `bramka(pozycja, kontekst)` — zamknięta lista powodów z sekcji „Decyzje"; `opisane` szuka
     ścieżki względnej (oba style ukośników) i nazwy katalogu najwyższego poziomu ze znakiem `/`
     albo `\` po nim w `docs/ARCHITEKTURA.md`, `CLAUDE.md`, `README.md` (także `AGENTS.md`, gdy
     istnieje — D-86) i zwraca plik + numer linii; `wiązane testami` przeszukuje pliki testowe
     w repo (lista wzorców z sekcji „Decyzje"), z limitem rozmiaru pliku 2 MB; `sekret` używa
     wzorców grupy „Sekrety" z `relai-backup.md` przepisanych do stałej;
   - `grupy(miara)` — grupowanie wg sekcji 5 planu; grupa ma `id`, `nazwa`, `pozycje`, `bajty`,
     `pytanie` (gotowe brzmienie dla `AskUserQuestion`: nazwa, liczba pozycji, MB, najstarsza
     i najnowsza data, pochodzenie);
   - `raport(cwd, opcje)` — składa miarę + grupy + listę chronionych, zapisuje
     `.claude/relai/clean-raport.json` (pełne listy) i zwraca obiekt; wersja tekstowa dla człowieka:
     grupy z najwyżej **dziesięcioma** najcięższymi pozycjami i liczbą pozostałych, chronione
     z powodem, suma — po polsku, **ASCII w CLI** (L-0016), ścieżki dosłownie;
   - `kasuj(sciezki, opcje)` — asercje przed czymkolwiek: każda ścieżka po `fs.realpathSync`
     (gdy istnieje) leży pod `realpath(cwd)` albo pod `realpath(os.tmpdir())`, nie jest żadnym
     z tych korzeni, nie jest `.git` ani nie leży w `.git` (wyjątek: **wewnątrz** kandydata może
     być cudze `.git` — klon w katalogu roboczym; asercja dotyczy `.git` **projektu**); ścieżka
     niespełniająca asercji → odmowa dla **tej** ścieżki z powodem, reszta idzie. Kasowanie
     `fs.rmSync(p, {recursive:true, force:true, maxRetries:3, retryDelay:100})`; dowiązanie /
     junction → `fs.unlinkSync` / `rmdirSync` bez wchodzenia. Wynik: `skasowane[]`,
     `niepowodzenia[{sciezka, kod, komunikat}]`, `odmowy[{sciezka, powod}]`, `przed`, `po` (bajty
     zmierzone ponownie). Nigdy nie zgłasza „skasowano" bez ponownego pomiaru;
   - `dopiszMarker(cwd, sciezka)` — „zostaw na zawsze": wzorzec już w `.gitignore` → linia-marker
     nad nim (jeśli jej nie ma); nieśledzony i nieignorowany → wzorzec z markerem do
     `.git/info/exclude`; bez gita → `.claude/relai/keep`. Zwraca, gdzie dopisano. **Nie** zmienia
     żadnej innej linii.
   - CLI: `node work-artifacts.js raport [--json]`, `node work-artifacts.js kasuj <plik-listy.json>`
     (plik: tablica ścieżek — komenda zapisuje ją z raportu po odpowiedziach człowieka, **nie
     z pamięci modelu**), `node work-artifacts.js zachowaj <sciezka>`. Kody wyjścia: 0 ok,
     1 niepowodzenia w kasowaniu, 2 złe użycie. Argumenty i wyjście identyczne w Claude Code
     i w Cursorze — narzędzie nie wie, kto je woła.
2. **Prowizjonowanie** — w `core/process/session-signals.js`, w `provisionTemplates`: obok
   kopiowania `templates/` skopiuj `core/process/work-artifacts.js` do
   `<destRel>/tools/clean-work.js` (katalog tworzony `recursive`); licznik zwracany przez funkcję
   obejmuje ten plik; awaria kopiowania = cisza jak dotąd. **Nie zmieniaj** sygnatury funkcji ani
   brzmienia komunikatów hooków — oba adaptery wołają ją bez zmian i dostają narzędzie za darmo.
   Komentarz w kodzie mówi, dlaczego kopia (L-0012).
3. **`core/MANIFEST.json`** — nowy wpis w `process` (`id: work-artifacts`, `kind: biblioteka+CLI`,
   opis ASCII) i dopisanie `./process/work-artifacts.js` do `uses` **obu** adapterów;
   `node core/tools/validate-adapters.js` kończy się kodem 0.
4. **`adapters/claude-code/commands/relai-clean.md`** — konwencja `/relai-backup`: frontmatter
   (`description` jednym zdaniem: raport artefaktów roboczych pogrupowany, kasowanie wyłącznie po
   potwierdzeniu na grupę, wpis w dzienniku; `argument-hint: "[raport] — sam raport, bez pytań
   i bez kasowania"`), potem kroki: **0** marker projektu RelAI; **1** narzędzie —
   `.claude/relai/tools/clean-work.js` istnieje? brak → jedno zdanie, że hook startu go nie
   podłożył (sesja sprzed instalacji tej wersji albo bez hooka), i prośba o restart sesji;
   **nie** kopiujesz go z katalogu pluginu ręcznie (L-0012) i nie piszesz własnego; **2** raport —
   uruchom `node .claude/relai/tools/clean-work.js raport --json`, pokaż wersję dla człowieka
   (grupy, chronione z powodem, suma, czas), argument `raport` kończy tu; **3** pytania — grupy
   **partiami po cztery** w jednym `AskUserQuestion`, każda z trzema opcjami (skasować wszystko ·
   zostawić tym razem · zostaw na zawsze — dopisuje marker) i odpowiedzią swobodną z wyjątkami
   („wszystko poza X"); rekomendacji **nie** podajesz — to nie jest wybór techniczny; **4** lista —
   z odpowiedzi składasz `.claude/relai/clean-lista.json` (ścieżki do skasowania, bez wyjątków)
   i dla „na zawsze" wołasz `zachowaj`; **5** kasowanie — `kasuj clean-lista.json`, wynik
   pokazujesz w całości: skasowane, odmowy z powodem, niepowodzenia z kodem, MB przed i po;
   **6** wpis w dzienniku wg `SPEC_DZIENNIK.md` (Zrobione: grupy i MB; Zweryfikowane: pomiar po,
   lista niepowodzeń; Świadomie odłożone: zostawione tym razem; Do zrobienia przez człowieka:
   niepowodzenia wymagające ręki — otwarty uchwyt, uprawnienia); **7** podsumowanie: trzy zdania.
   Sekcja **Zakazy**: nie kasujesz bez „tak" z tej sesji; nie kasujesz plików śledzonych, nawet
   na prośbę (to zmiana produktu — zwykłą drogą pracy); nie kasujesz poza projektem i `os.tmpdir()`;
   nie ruszasz folderu backupów; nie cytujesz treści plików z powodem `sekret`; nie
   improwizujesz `rm -rf` ani skryptu w innym języku, gdy narzędzia brak — mówisz o braku.
5. **Skill `relai-core`** — nowa sekcja **„Pliki lokalne, których nie sprzątamy (od 1.8.0)"**
   między „Zamknięciem sesji" a „Frazami naturalnymi": marker `# relai: zachowaj` / `# relai: keep`
   nad wzorcem w `.gitignore`, `.git/info/exclude` chroniony w całości, `.claude/relai/keep` bez
   gita; **reguła zachowania**: gdy dopisujesz do `.gitignore` wzorzec dla pliku, który jest
   lokalną notatką albo materiałem właściciela (nie artefaktem etapu), stawiasz linię-marker nad
   nim w tej samej edycji; gdy nie wiesz — pytasz jednym zdaniem. Cztery–sześć zdań, bez opisu
   komendy (ta ma własny plik) i **bez kroku 2a** (E2). Wersja w nagłówku skilla **bez zmian**
   (podbicie numeru to E4) — dopisz do listy zakresu w pierwszym akapicie „+ pliki lokalne
   i marker »zachowaj« (od 1.8.0)".
6. **Testy narzędzia** — skrypt `.claude/relai/work/SPRZATANIE_ARTEFAKTOW/E1/test-work-artifacts.js`
   (wyrażenia regularne w pliku, nie w `node -e` — zasada 5), materiał kontrolowany tworzony
   przez skrypt w tym samym katalogu roboczym i w `os.tmpdir()` z prefiksem `relai-e1-`. Scenariusze
   **obowiązkowe**, każdy z kontrolą pozytywną i negatywną:
   - klon tego repozytorium (`git clone --quiet . <work>/klon`) → obiekty `.git/objects` tylko do
     odczytu → `kasuj` usuwa bez niepowodzeń, katalog nie istnieje po;
   - dowiązanie / junction w kandydacie wskazujące na katalog **poza** kandydatem → po `kasuj`
     dowiązanie nie istnieje, **cel istnieje i ma tę samą liczbę plików** (dowód negatywny);
   - ścieżka poza korzeniami (np. katalog domowy) i ścieżka `.git` projektu → `odmowy` z powodem,
     nic nie skasowane (dowód negatywny: pliki na miejscu);
   - plik śledzony → powód `śledzone`; plik ignorowany z markerem → `zachowaj` ze źródłem
     `.gitignore`; ten sam bez markera → kandydat; wzorzec w `.git/info/exclude` → `zachowaj`;
     `.claude/relai/keep` w katalogu bez gita → `zachowaj`;
   - katalog nieśledzony wymieniony w tymczasowo dopisanej linii `docs/ARCHITEKTURA.md`
     w **kopii** projektu (nie w tym repo — tu tego pliku nie ma, profil `prompty`) → `opisane`
     z plikiem i linią; ścieżka wymieniona w `tests/test_x.py` → `wiązane testami`;
   - `work/HIGIENA_DOKUMENTOW/E1/` (plan w archiwum) → pochodzenie `etap`, status `ZREALIZOWANY`,
     kandydat; `work/ROZWOJ_PO_WYDANIU/E7/` → `etap trwa`; `work/SPRZATANIE_ARTEFAKTOW/E1/` →
     `etap trwa` (to Twój własny katalog roboczy); `work/_sesja/<dziś>/` → chroniony,
     `work/_sesja/2026-09-01/` → kandydat; `work/NIE_MA_TAKIEGO_PLANU/` → `nieznane`;
   - TEMP: pozycje `relai-e1-a`, `relai_e1_b` (podkreślenie), `RELAI-E1-C` (wielkość liter),
     `<slug>-e1-d`, `inny-projekt-e1` → cztery pierwsze w grupach, piąta niewidoczna;
   - limit wpisów: katalog z 25 000 pustych plików (SZACUNEK: tworzenie < 30 s) → `niepelne: true`,
     raport z „≥"; czas `artefaktyRobocze` na tym materiale zanotowany (liczba, nie ocena — próg to
     E2);
   - CRLF i LF w `.gitignore` z markerem — oba warianty trafiają (zasada 11);
   - raport JSON nie zawiera treści żadnego pliku (grep po wartości z pliku `.env.test`
     utworzonego w kandydacie → 0 trafień), a pozycja `.env.test` ma powód `sekret`.
7. **Próba z żywej sesji** — `/relai-clean raport` uruchomiona **z tego repozytorium** (komenda
   z pliku repo: skopiuj `relai-clean.md` do `.claude/commands/` na czas próby albo wykonaj kroki
   ręcznie tak, jak zrobiłby to model — zapisz, którą drogą) po tym, jak w
   `.claude/relai/work/` i w TEMP stoi materiał z punktu 6: raport pokazuje grupy i chronione;
   następnie pełny przebieg na tym samym materiale: pytania partiami po cztery, „zostaw na
   zawsze" dla jednej pozycji → marker w `.gitignore` **kopii** (nie w `.gitignore` tego repo),
   kasowanie reszty, wpis w dzienniku. Zanotuj liczbę pytań i liczbę grup.
8. **Bramka hooka (ryzyko 7):** `node .claude/relai/tools/clean-work.js kasuj <lista>` z pozycją
   w `os.tmpdir()` uruchomione przez narzędzie `Bash` z katalogu projektu — przechodzi czy
   zatrzymuje się na bramce? Wynik z dosłownym komunikatem (jeśli padł) do wpisu dziennika.
   Zatrzymanie **nie** jest powodem do obejścia: narzędzie ma wtedy wypisać listę do ręcznego
   skasowania i to też sprawdzasz.
9. **Sprzątanie po etapie** — materiał testowy w TEMP i w katalogu roboczym etapu skasowany
   **narzędziem z tego etapu** (raport → potwierdzenie użytkownika → `kasuj`), z liczbami
   przed i po do wpisu dziennika. To jest pierwszy realny przebieg mechanizmu i pierwszy dowód
   na dogfooding katalogu roboczego.
10. **Rejestr artefaktów** — `docs/ARTEFAKTY.md`: nowy wiersz dla komendy `relai-clean.md`
    (wersja 1, data dzisiejsza, „po co"), podbicie wersji skilla `relai-core` z opisem zmiany
    (sekcja o plikach lokalnych). Narzędzie i `MANIFEST.json` są nośnikiem — do rejestru nie
    wchodzą.
11. **Bez podbicia wersji** (E4). Sprawdź `git grep -n "1\.8\.0"` — dozwolone trafienia to plan,
    prompty, skill (dopisek „od 1.8.0") i komenda; żadne w `MANIFEST.json`, `plugin.json`,
    `marketplace.json`.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `node core/tools/validate-adapters.js` kończy się kodem 0 i wypisuje `work-artifacts.js`
      w odwołaniach obu adapterów.
- [ ] Po uruchomieniu hooka startu na kopii dowolnego projektu RelAI (`node
      adapters/claude-code/hooks/session-context.js` z payloadem `SessionStart` i `cwd` kopii)
      istnieje `.claude/relai/tools/clean-work.js`, **identyczny bajt w bajt** z
      `core/process/work-artifacts.js` (suma SHA-256 po normalizacji LF), a licznik w komunikacie
      wzrósł o 1 wobec 1.7.0 (31 → 32).
- [ ] `node .claude/relai/tools/clean-work.js raport --json` uruchomione **w kopii projektu bez
      katalogu rdzenia** kończy się kodem 0 — dowód samowystarczalności (brak `require` na rdzeń).
- [ ] Wszystkie scenariusze z punktu 6 zakresu przechodzą; skrypt testowy wypisuje liczbę
      scenariuszy, liczbę przejść i **zero** nieprzejść; dla dowodów negatywnych wypisuje stan
      chronionego materiału po operacji.
- [ ] Klon repo z obiektami tylko do odczytu skasowany bez ani jednego niepowodzenia — `po` = 0 B,
      katalog nie istnieje.
- [ ] Ścieżka poza korzeniami i `.git` projektu: `odmowy` niepuste, pliki na miejscu (lista
      plików przed i po identyczna).
- [ ] Raport na PolyFlow (**tylko `raport`**, bez kasowania, przez `--add-dir` albo w osobnej
      sesji): `tools/` nie występuje w żadnej grupie (pliki śledzone); `benchmark/` z surowym
      materiałem stoi w chronionych z powodem `opisane` i wskazaniem `CLAUDE.md` z linią;
      `tools/cache/` jest kandydatem (brak markera — decyzja właściciela to sprawa 4 planu, nie
      Twoja); grupa `TEMP: nazwa projektu` pusta albo z pozycjami wypisanymi z nazwy. Punkt
      niewykonalny bez dostępu → zostaje w prompcie jako otwarty z warunkiem, etap **nie** jest
      zamknięty, dopóki nie przejdzie.
- [ ] `git grep -n "relai: zachowaj"` zwraca: plan, ten prompt, `work-artifacts.js`, komendę
      i skill — nic więcej; `.gitignore` tego repozytorium **nie ma** markera (dowód negatywny:
      `git diff .gitignore` pusty).
- [ ] `git grep -nE "rm -rf|shutil|Remove-Item" adapters/claude-code/commands/relai-clean.md
      core/process/work-artifacts.js` → 0 trafień.
- [ ] Raport JSON z materiału testowego: 0 wystąpień wartości z `.env.test`; pozycja z powodem
      `sekret` obecna.
- [ ] Przebieg z punktu 7: liczba pytań ≤ ⌈liczba grup / 4⌉ wywołań `AskUserQuestion`; marker
      dopisany w kopii `.gitignore` **nad** wzorcem, żadna inna linia tego pliku nie zmieniona
      (diff = 1 linia dodana).
- [ ] Punkt 8: wynik zanotowany dosłownie (przeszło / komunikat bramki); przy zatrzymaniu —
      lista do ręcznego skasowania wypisana przez narzędzie.
- [ ] `docs/ARTEFAKTY.md` ma wiersz `relai-clean.md` i podbitą wersję `relai-core/SKILL.md`; hook
      `profile-rules` nie ostrzega o niezarejestrowanym artefakcie po zapisie komendy.
- [ ] Wersja **nie** podbita: `MANIFEST.json`, `plugin.json`, `marketplace.json` mają `1.7.0`.
- [ ] Katalog roboczy etapu `.claude/relai/work/SPRZATANIE_ARTEFAKTOW/E1/` i pozycje `relai-e1-*`
      w TEMP skasowane narzędziem po potwierdzeniu; liczby przed i po we wpisie dziennika;
      `%TEMP%` bez pozycji `relai-*` po etapie (`ls` z filtrem → 0).
- [ ] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy", z autorem
      `RelAI (Opus) + Lukasz`; `docs/STATE.md` nadpisany; brak plików tymczasowych w repo
      (`git status --short` pokazuje wyłącznie zamierzone zmiany).

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/SPRZATANIE_ARTEFAKTOW/STATUS.md`: E1 → **ZREALIZOWANY 2026-…** (data z kontekstu
   sesji), E2 → **GOTOWY DO STARTU** z linkiem do `PROMPT_ETAP_2.md`; linia „E1 rozpoczęty"
   zastąpiona **jedną** linią wynikową (co powstało, stan po); sekcja „Bramki manualne" —
   nierozstrzygnięte pozycje „Do zrobienia przez człowieka" z wpisu tego etapu jako `OTWARTA`.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka) na końcu sekcji „Wpisy". W tabeli „Stan otwartych
   ryzyk" **dopisz ryzyka 1 i 2 planu** (bramka przepuszcza potrzebne; kasowanie poza korzeniami)
   ze statusem `OTWARTE` i pierwszym pomiarem z tego etapu — plan, sekcja 7, ostatnie zdanie.
   Lekcje z etapu → `docs/LEKCJE.md`; „Zasady aktywne" mają **15 pozycji przy limicie 15** —
   nowa zasada wchodzi wyłącznie przez kompresję tematyczną za zgodą człowieka, inaczej lekcja
   zostaje bez pozycji w destylacie.
3. `docs/STATE.md` — nadpisz: „Co działa" dostaje sprzątanie na żądanie (komenda w repo, jeszcze
   nie w wydaniu), „Nad czym pracujemy teraz" — E2 gotowy; liczby.
4. **Wygeneruj `PROMPT_ETAP_2.md`** w tym folderze ze specyfikacji
   `.claude/relai/templates/SPEC_PROMPT_ETAPU.md`: na bazie `PLAN.html` sekcja 6 (E2 — start
   sesji mówi, rytuał zamknięcia sprząta), **realnego stanu po tym etapie** (nazwy eksportów
   `work-artifacts.js`, kształt raportu, zmierzony czas pomiaru jako punkt odniesienia dla limitu
   hooka, wynik punktu 8 wobec bramki), rozstrzygnięć akceptacji (próg **100 MB**, kotwica
   `włączone`/`wyłączone`, wiersz `Artefakty robocze`, krok **2a**) i lekcji z tego etapu.
   Katalog roboczy E2: `.claude/relai/work/SPRZATANIE_ARTEFAKTOW/E2/`.
5. Commit + push: `feat(clean): add /relai-clean command and work-artifacts core tool` (zakres
   w treści commita: narzędzie, prowizjonowanie, manifest, komenda, sekcja skilla, rejestr).
   Commit wyłącznie za zgodą.
