# PROMPT_ETAP_1 — trivy-scan w pluginie i komenda /relai-security

Plan: BEZPIECZENSTWO • Etap: **E1 z E6** • Wygenerowano: 2026-10-23 (autor: Opus 5.5, przy akceptacji planu) • Wykonawca: **Opus (D-85) w Claude Code**, `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `high` (16. komenda dotyka generatora Codeksa, panelu, testów i kilkunastu dokumentów naraz —
> pominięty licznik wychodzi dopiero w walidatorze).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, reguły profilu (artefakty), sekcja niemutowalna |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne” (przepisana też niżej) |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk” (format tabeli, numeracja R) + wpis z 2026-10-23 o planie BEZPIECZENSTWO |
| `docs/plany/BEZPIECZENSTWO/PLAN.html` | sekcje 2 (cele 1–2), 5 (punkty 1–2), 6 (wiersz E1), 7 (ryzyka 1, 3, 7, 10), 8 (przypadki b1–b6, b8, b9) |
| `C:/Users/Lukasz/.claude/skills/trivy-scan/` | skill do przeniesienia: `SKILL.md`, `scripts/scan.mjs`, `scripts/lockfile-hook.mjs`, `references/fixing.md`, `references/hook.md`, `evals/` |
| `adapters/claude-code/commands/relai-audit.md` | wzór komendy: frontmatter (`description`, `argument-hint`), układ, zasada „raport, potem tak” (D-45) |
| `core/panel/commands.mjs`, `core/panel/theme.mjs` | `FORMS`, `NAMES`, `GROUPS` — każda komenda musi mieć formularz, nazwę i grupę |
| `adapters/codex/generate-skills.js` + `adapters/codex/tests/generate-skills.test.js` | twarda liczba 15 komend (linia 51; test linie 23–24) |
| `core/tools/validate-adapters.js` | co walidator sprawdza: metadane skilli i komend, wersje, sieć w skryptach |
| `docs/ARTEFAKTY.md`, `docs/KOMENDY.md`, `core/templates/SPEC_KOMENDY.md` | rejestr artefaktów i ściąga komend do aktualizacji |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan BEZPIECZENSTWO zaakceptowany 2026-10-23: **oba skille w pluginie** (wariant A), wszystkie trzy adaptery, ryzyka do „Stan otwartych ryzyk”, akceptacja ryzyka do `DECYZJE.md`, raporty w `.security/` (PLAN, sekcje 4–5).
- Skill zachowuje nazwę **`trivy-scan`** (bez prefiksu `relai-`): generator Codeksa klasyfikuje każdą nazwę `relai-*` poza `relai-core` i `relai-planning` jako komendę (PLAN, sekcja 5, punkt 1).
- Komenda nazywa się **`/relai-security`**; jej opis odróżnia ją od `/relai-audit` (dokumenty) — ryzyko 10 planu.
- trivy-scan **proponuje, aktualizuje po „tak”**; bez `npm audit fix --force`, bez wpisu w `.trivyignore` bez decyzji człowieka (wywiad 2026-10-23; D-45).
- Zakres skanu domyślnie: **tylko zależności** (wywiad 2026-10-23).
- Ryzyko w dzienniku: tylko **nowe CRITICAL/HIGH bez decyzji**; klucz wiersza = identyfikator advisory + paczka + plik blokady; poprawione → `ZAMKNIĘTE` (PLAN, przypadki b2–b5).
- Plugin bez zależności npm (D-04): Trivy to zewnętrzny program jak `npm audit`; brak Trivy → komendy ekosystemu jako zapas i propozycja instalacji po zgodzie.
- Etapy na Opusie w świeżych sesjach (D-85).
- **Granica zakresu:** hook lockfile to E2 (nie rejestruj go w `hooks.json`, nie ruszaj `~/.claude/settings.json`); prompty etapów, `done-check`, `first-deploy`, zamknięcie sesji i planu oraz nowa decyzja w `DECYZJE.md` to E3; security-audit Cloudflare i `--full` to E4 (w E1 komenda może wspomnieć, że pełny audyt przyjdzie, ale go nie obiecuje); kopiowanie skryptów skilla do Codeksa i Cursora to E5 (w E1 generator Codeksa dostaje tylko nową komendę i nową liczbę); wydanie i wersja 3.3.0 to E6 — **nie podbijaj wersji**.

## Stan wyjściowy — co realnie zastajesz

RelAI 3.2.0 w repo i publicznie (FAKT). Od ostatniego zamkniętego planu w repo przybyły wyłącznie dokumenty planu BEZPIECZENSTWO (2026-10-23). Poza repo, w profilu użytkownika, działa skill `trivy-scan` (przetestowany: 16/16 sprawdzeń ze skillem wobec 13/16 bez, FAKT), kopia `security-audit` Cloudflare, Trivy 0.76.1 (winget) i hook lockfile w `~/.claude/settings.json`. Testy odpalasz plikami, nie katalogiem (P-036): `node --test core/panel/tests/*.test.js`, `node --test core/process/tests/*.test.js`, `node --test adapters/codex/tests/*.test.js`; walidator: `node core/tools/validate-adapters.js`.

Pliki istotne dla etapu:

```
adapters/claude-code/
  commands/            15 plików relai-*.md (FAKT) — tu powstaje relai-security.md
  skills/              relai-core/, relai-planning/ — tu powstaje trivy-scan/
adapters/codex/
  generate-skills.js   generuje skille Codeksa z komend; linia 51: twarde 15
  tests/generate-skills.test.js   linie 23–24: commandSkills === 15
  skills/              wygenerowane, commitowane (po zmianie: node adapters/codex/generate-skills.js)
core/panel/
  commands.mjs         FORMS — formularz na każdą komendę (test commands.test.js)
  theme.mjs            NAMES (nazwa + opis, w kolejności FORMS), GROUPS (grupa „Porządek i bezpieczeństwo”)
  tests/theme.test.js  ikona docs/zasoby/branding/ikony/<x>.svg i wpis NAMES na każdą komendę
  tests/phrases.test.js  wiersze komend w KOMENDY.md muszą się parsować
core/tools/
  validate-adapters.js metadane (name [a-z0-9-]{1,64}, description ≤1024 znaków, bez <>, trzecia osoba, <500 linii), sieć w skryptach (DOZWOLONE_SIEC)
  sync-panel-core.js   synchronizuje core/panel do panel/, progress/, cache-keeper/ (komentarz w linii 16 liczy komendy)
docs/zasoby/branding/ikony/   15 plików .svg (FAKT)
docs/KOMENDY.md               15 wierszy komend (FAKT)
docs/ARTEFAKTY.md             nagłówek „Komendy (15)”, sekcja skilli z liczbą plików
README.md (76, 89), adapters/cursor/README.md (32), adapters/codex/README.md (12),
docs/PRZEWODNIK.md (237, 253), docs/INSTALACJA.md (103), docs/STATE.md (203–204),
adapters/claude-code/commands/relai-update.md (63: „piętnastu”), core/templates/SPEC_KOMENDY.md
                              — miejsca, które liczą komendy (FAKT, rozpoznanie 2026-10-23)
```

**Czego jeszcze nie ma:** skilla `trivy-scan` w pluginie, komendy `/relai-security`, jej formularza, nazwy i ikony w panelu, wiersza w `KOMENDY.md` i wpisów w `ARTEFAKTY.md`; generator i testy znają 15 komend.

**Zasady aktywne z rejestru lekcji (przepisane w całości):**

1. **Specyfikacja dokumentu jest kompletna albo martwa:** kończy się realnym przykładem, wypisuje
   wymaganą strukturę w treści (odesłanie nie wystarcza) i ma ścieżkę „pytam zamiast zmyślać"
   z formą zapisu luki. **Wzorzec powtarzalny sprawdzasz na całej rodzinie dokumentów** — „stare
   brzmienie nie zwraca nic" puszczasz na katalogu specyfikacji; trafienie poza zakresem etapu to
   sygnał odchylenia, nie usterka weryfikacji. **Pierwszy realny przebieg reguły jest częścią jej
   pisania** — rozjazd to defekt reguły, nie wyjątek do obejścia. **Reguła produkująca tekst opisuje
   początek wiersza i to, czego w nim nie ma** — model domyka lukę formatem materiału pod ręką;
   materiał sprzed poprawki reguły zostaje obok materiału po niej.
   **Linia raportu poświadczająca krok bierze treść z wyniku polecenia tego kroku** („Zmiana:
   <pliki z git status>”) — bez kotwicy powstaje bez uruchomienia polecenia. **Komenda
   w sekcji Weryfikacja ma za sobą jeden realny przebieg autora promptu** (testy Node wzorcem
   plików, nie katalogiem) (L-0212).
   (L-0001, L-0011, L-0026, L-0089, L-0100, L-0108, L-0129, L-0212)
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — fraza i forma wywołania
   w wersji uruchomionej dosłownie, z tej samej powłoki, którą zobaczy czytelnik; znak
   interpretowany przez powłokę zapisujesz tak, żeby go nie tknęła. (L-0002, L-0022, L-0059)
3. **Test „czegoś nie wolno" wymaga dowodu negatywnego:** chroniony fragment ma nadal pierwotne
   brzmienie, nie tylko nowy wpis powstał. (L-0007)
4. **Dowodzisz efektem, nie zdarzeniem** — stanem pliku, sumą, treścią odpowiedzi; kryterium na
   stanie, który kontrolujesz, i na źródle, które artefakt produkuje. Zmianę zachowania pokazujesz
   **obiema wersjami w jednym przebiegu**, instrumentem wiernym obu, na materiale, który stara
   wersja psuje (L-0191).
   - **Kryterium:** na poprawności wyniku, nie na kierunku liczby, której nie kontrolujesz;
     sprawdzone na materiale **przed** pracą (także przez autora promptu) — arytmetycznie
     nieosiągalne wraca do człowieka jako aneks. Etap przenoszący treść liczy metrykę na całym
     pakiecie. Liczenie wywołań narzędzia zaczynasz od listy narzędzi w `init`. Wyszukiwanie
     wzorca omija pliki, które go cytują. Tekst tłumaczący liczbę ma warunek prawdziwości i test
     stanu docelowego (L-0144).
   - **Materiał:** test na realnym pliku zmienianym przez proces sam ustawia stan wyjściowy,
     licznik do dziennika z przebiegu po ostatniej zmianie (L-0150); plik śledzony albo własna
     fixtura, nigdy z `.gitignore` (L-0156); przed pytaniem o zasięg sprawdzasz, czy plik nie jest
     generowany (L-0154); zmianę dowodzisz na widoku, który obejmuje jej rekordy (L-0155); test
     wydanego artefaktu czyta stan wydania (tag, worktree), nie drzewo robocze (L-0186); element
     „pomiędzy” ma warunek na rodzaju sąsiada i test z sąsiadem własnym i obcym (L-0195).
   - **Na żywo:** widok z danych projektu mierzysz w najgorszym stanie i ograniczasz w kodzie
     (L-0158); diagnoza zaczyna się od znacznika wersji w logu (L-0159); „przed” w dwóch
     przebiegach — stary kod i stary kod z nową czystą logiką (L-0165); animacja z danych procesu
     na stanie pośrednim z lukami (L-0175); chwila z przeszłości liczona kodem z jej commitu (L-0177);
     artefakt weryfikacji renderowany od nowa, wszystkie warianty razem (L-0182); parser pola
     opisanego prozą — na każdym zapisie rodziny i przykładzie specyfikacji, stary i nowy kod
     obok siebie (L-0184); po zmianie kodu z trybem zastępczym pierwsza asercja to tryb, potem
     zrzut (L-0213); ruch i czas klatki tylko w widocznej stronie, kadry o stałym rozmiarze
     w osobnej stronie DevTools (L-0214); po zmianie modułu ES `reload` z `ignoreCache` i asercja
     nowego kodu przed kadrem (L-0218); przed diagnozą ruchu liczba `requestAnimationFrame` na
     sekundę — poniżej 30 najpierw `bringToFront`, schowek systemu tylko w prawdziwym Chrome
     (L-0222); kod przewijający sam zapisuje cel w stanie odbiornika przed `scrollTo` (L-0224);
     koszt pierwszej wizyty z solą w definicjach shadera, kompilacja i pierwsze rysowanie osobno,
     licznikiem przerw głównego wątku — przeładowanie mierzy ciepłą pamięć (L-0227); sonda
     `initScript` sprawdza istnienie dokumentu i pisze do `sessionStorage` (L-0232).
   (L-0017, L-0018, L-0040, L-0051, L-0052, L-0063, L-0069, L-0082, L-0115, L-0117, L-0123, L-0134,
   L-0144, L-0150, L-0154, L-0155, L-0156, L-0158, L-0159, L-0165, L-0175, L-0177, L-0182, L-0184,
   L-0186, L-0191, L-0195, L-0213, L-0214, L-0218, L-0222, L-0224, L-0227)
5. **Instrument pomiarowy sam bywa źródłem fałszu.**
   - **Backslash:** wyrażenia regularne i ścieżki Windows tylko w pliku pisanym Write/Edit albo
     z `/`; skrypt edycji niosący `\n`, backtick lub ścieżkę — Write, heredok bez wyjątku, także
     jednolinijkowa podmiana przez `node -e`; dokumenty — tylko Edit; napis z `\n` w kodzie albo
     teście — tylko Edit, także obok podmian bez ucieczek; dotyczy każdego pliku, także roboczego
     poza repo (`dev-mods`, `%TEMP%`); „dokumenty — tylko Edit” obejmuje dopisanie na końcu
     (`cat >>` z heredokiem) i `sed -i` na wierszu tabeli; seria podmian w kodzie — kilka Edit albo
     skrypt Write, także gdy „to tylko liczby” (L-0116, L-0119, L-0135, L-0148, L-0188,
     L-0192, L-0198, L-0210, L-0215, L-0242 — „przeszło testy” nie zwalnia z reguły); ścieżka w powłoce z `/`, także składana ze zmiennych
     w funkcji (L-0230);
     tekst zastępczy `replace` nie jest dosłowny (`` $` ``, `$&`) — cudzą treść podstawiasz funkcją,
     po wstawce porównanie ze źródłem i licznik nagłówków całego pliku (L-0211);
     znaki łączące — `\p{M}` z flagą `u`; wynik sprawdzasz grepem stałego ciągu.
   - **Kontrola pozytywna:** zero trafień przy niepustych zbiorach to defekt instrumentu do czasu
     dowodu, a trafienie na materiale dotąd zdrowym sprawdzasz najpierw na instrumencie; scenariusz
     „konfiguracji nie ma” mierzysz z podstawionym katalogiem domowym; dokładasz przypadek, który **musi** trafić, na **tym samym wejściu**, którego mechanizm
     naprawdę pilnuje (nie z jego listy wyłączeń); przebieg „oczekuję ciszy" ważny tylko z kontrolą
     pozytywną w tym samym przebiegu; obok wzorca licznik „ile odrzucono” i „ile bez pary”;
     generator identyfikatorów sprawdzasz na wszystkich kandydatach; wartość podkładaną — wobec
     zbioru dozwolonego (L-0173); kontrola negatywna zmienia mierzoną wielkość, nie jej obraz (L-0181);
     tło pod tekstem fotografujesz z `opacity: 0` na rodzicu (`visibility` dzieci wygrywa), wynik
     1,00 : 1 na całej linii to najpierw instrument (L-0213).
   - **Parsowanie:** separator niepoprzedzony znakiem ucieczki i liczba pól po podmianie; zbiór
     znaków zachowywanych wypisany raz; filtr „to nie przypadek” ma wyjątek dla linii o rzeczy
     sprawdzanej; każdy przypadek graniczny ma własną kontrolę; nazwy narzędzi w cudzym
     transkrypcie wypisujesz, zanim orzekniesz brak.
   - **Porównania:** instrument dwóch drzew odtwarza materiał przed każdym wariantem i dowodzi
     nietkniętości; wynik wynosisz od razu, z sumą; porównanie najpierw sprawdza istnienie obu
     wejść, a oba pliki kasuje przed przebiegiem (L-0143); stan „przed” w `git worktree` HEAD-a, nie
     po `stash` (L-0151); bez `append` — plik na proces (L-0141).
   - **Cudze usługi i dane:** niedostępność sprawdzasz jednym tanim wywołaniem, zanim odpiszesz
     pomiar; „działało wczoraj” też jest hipotezą; wniosek z czasu zepsutego artefaktu datujesz jego
     wersją; wyczerpany limit konta zatrzymuje pomiar i idzie do odnogi, nie do adnotacji
     „sprawdzone inaczej”.
   - **Liczenie treści:** dwa liczniki — wąski (własny wzorzec, przez wykluczenie znaku
     otwierającego) i szeroki z kontrolą przeciw zawyżeniu; najpierw kształt odpowiedzi, potem
     jakość, z mianownikiem; różnica przebiegów tylko ponad zmierzony szum; agregat odsiewa elementy
     innej klasy jawnym progiem; czytelność klatek — tylko klatki ustalone, oba kontrasty, korpus =
     materiał źródłowy.
   - **Przebieg:** scenariusz „czegoś nie ma” z listą mechanizmów, które to tworzą (inaczej
     fixtura); limit tur na cały łańcuch i kod wyjścia każdej sesji; podłożony hook — `node --check`
     i licznik wstrzykniętego zdania (L-0127); nowa kontrola spójności najpierw na zastanym
     materiale, cisza podejrzana do pokazu na podłożonym defekcie; po historii commitów trafienia
     dzielisz na „naprawione później” i „nigdy” (L-0131); skrypt cięcia sprawdza cały blok i idzie
     kompilator (L-0160); wklejka dowodzona licznikiem nagłówków i porównaniem ze źródłem (L-0164);
     operacja na zakresie normalizuje tylko styk, reszta nietknięta (L-0169); fixtura ewaluacji
     niesie środowisko czytane przez hooki (L-0170); widok bez JS to kopia HTML bez `<script>`
     z rozpakowanym `<noscript>`, bo wyłączone skrypty zatrzymują też sondy DevTools (L-0238);
     płynność tylko bez innej przeglądarki na GPU, co najmniej dwa przebiegi, wynik z obciążonej
     maszyny odrzucony z liczbą (L-0239); zrzut sceny bez tekstu przez `opacity: 0` na elementach
     z tekstem, nie `visibility` rodzica (L-0240); test atrybutu w szablonie kotwiczy sąsiada,
     a po Edit szablonu idzie `diff` wygenerowanej strony (L-0243); kadry układu w Chrome bez okna
     o zadanym rozmiarze, koniec strony z przypiętymi sekcjami pętlą `scrollTo`, nie
     `scrollIntoView` (L-0246); warstwę HTML w transformacji 3D sprawdzasz `elementsFromPoint`
     w siatce po całej powierzchni i w każdym stanie kamery (L-0247); układ wyśrodkowany liczbą
     (lewy i prawy odstęp w kilku szerokościach), kontrola najpierw odtwarza błąd (L-0248);
     przepełnienie telefonu: `innerWidth` wobec `visualViewport`, potem bisekcja reguł (L-0249).
   (L-0032, L-0037, L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086,
   L-0087, L-0088, L-0090, L-0091, L-0095, L-0096, L-0097, L-0101, L-0102, L-0105, L-0106, L-0107,
   L-0110, L-0111, L-0113, L-0124, L-0125, L-0127, L-0130, L-0131, L-0135, L-0141, L-0143, L-0151,
   L-0160, L-0164, L-0169, L-0170, L-0173, L-0181, L-0211, L-0213, L-0215, L-0238, L-0239, L-0240,
   L-0242, L-0243, L-0246, L-0247, L-0248, L-0249)
6. **Próg jest liczbą, którą ktoś liczy:** kalibrujesz na realnych plikach, zapisujesz w jednostce
   mechanizmu z komendą sprawdzającą, z **jednym** wyzwalaczem. Porównujesz do wielkości, którą
   mechanizm kontroluje (część usuwalna); zatkanie sygnalizuje **różnica możliwego i wykonanego**,
   nie zero wykonanego; reguła „najstarszy element” w mechanizmie od najstarszego zatyka go
   z definicji. Liczba zbioru liczona także w komunikacie sukcesu. Odejmowana stała to hipoteza —
   nierzetelne odjęcie oznaczasz. Próg wspólny sprawdzasz na każdej wielkości z osobna (L-0167).
   Karta zgody na zależność podaje wielkość na dysku (L-0172). Liczba budżetu niesie jednostkę
   zdefiniowaną w instrumencie, a różnicę wobec poprzedniego etapu liczysz tym samym instrumentem na
   drzewie poprzedniego commitu (L-0223).
   (L-0034, L-0049, L-0053, L-0060, L-0065, L-0099, L-0104, L-0167, L-0172, L-0223)
7. **Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień:** od początku komórki, wybór
   linii po wartości, nierozpoznane = cisza. Rdzeń z diakrytykami łapiesz klasą znaków języka, nie
   `\w`, i tylko w brzmieniu wartości, nie w całej komórce. Koszt zamkniętej listy (pozycje, które
   człowiekowi wyglądają na rozpoznane) mierzysz; poszerzenie to decyzja człowieka.
   (L-0025, L-0035, L-0048, L-0066, L-0070, L-0074)
8. **Zachowanie, które ma działać zawsze, mieszka w warstwie obecnej w każdej sesji** (`CLAUDE.md`
   albo hook); skill wyzwala się zawodnie. Sygnał jednorazowy ma jednego właściciela. Stan pisany
   przez model: plik na zapisującego, bez scalania. Zapis w warstwie niższej niż plik tej sesji
   kasuje ten plik i mówi, która warstwa rozstrzyga po zapisie (L-0187). Fakt rozstrzygnięty idzie
   do subagenta jako rozstrzygnięty. Zmiana formatu trwałej kopii ma drogę migracji. Plik
   doczytywany dla klasy `balanced` ma drogowskaz z wyzwalaczem w warstwie stałej — działa przy
   frazie z promptu; krok wyzwalany kształtem zadania stoi w warstwie stałej w skrócie.
   (L-0015, L-0030, L-0036, L-0112, L-0120, L-0121, L-0126, L-0128, L-0187)
9. **Skill nie zakłada dostępu poza katalogiem roboczym**; opis ≤ 1 024 znaki, trzecia osoba, co
   i kiedy, marker projektu i płaska lista fraz, bez `MUST BE USED`; krok sięgający dalej ma
   wyjście po odmowie. (L-0009, L-0010, L-0012, L-0023, L-0114)
10. **Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI**; zachowanie — świeżą
    sesją; po podbiciu `grep -r` po starym numerze i każde trafienie rozstrzygasz (historyczne vs
    deklaracja stanu, także w komendach i skillach). Niewydane mierzysz artefaktem podłożonym
    lokalnie pod **inną nazwą**; cały plugin — `--plugin-dir` z wyłączoną instalacją i ścieżką
    w `init`. Wydanie zestawia zmiany artefaktów z `ARTEFAKTY.md` i `git ls-files` z listą
    generowanych (L-0161). (L-0004, L-0008, L-0020, L-0061, L-0085, L-0118, L-0161)
11. **Końce linii, kolejność wpisów, numeracja nagłówków i stan dokumentu wobec specyfikacji to
    warianty.** Sumy po CRLF → LF, bez kotwicy końca w regexie linii, oba warianty w jednym
    przebiegu; kierunek z danych; nagłówek z tolerancją na `## 2.`, `**…**`, liczbę `#`, a kształt,
    który przewrócił wzorzec, wchodzi do kontroli dosłownie. Przeniesienie katalogu z cudzego
    manifestu — najpierw na kopii, walidatorem. Regułę dostawcy przepisujesz po ponownym odczycie
    źródła, z jej zakresem. (L-0033, L-0038, L-0057, L-0062, L-0067, L-0103, L-0122)
12. **Guardrail zatrzymujący nie-sekret to defekt rdzenia** — poprawka z dowodem, nie obejście;
    wołany przez opakowanie powłoki (brak interpretera = blokada); próbki sekretów składane
    w czasie wykonania; cudzysłów (także backtick) należy do grupy cudzysłowu, nie do wartości.
    (L-0043, L-0045, L-0046, L-0072)
13. **Cudze narzędzie poznajesz z wydanego builda i z próby**, nie z dokumentacji: payload po
    zdjęciu BOM, bez założeń o nazwach pól; CLI z powłoki natywnej; brak sygnału konfrontujesz
    z warunkiem milczenia; nieprzyjęty artefakt — najpierw jego walidator albo widok statusu.
    - **Mody:** zielone `validate`, typy i testy nie dowodzą zachowania w łańcuchu — mierzysz na
      żywo, ciszę sondą (licznik hooka, wynik `next`) (P-017); `$` i `on` tylko w pliku modułu
      hooków, na zewnątrz czysta logika; typy mówią, co powierzchnia przyjmie, nie co niesie —
      gałąź po polu powierzchni z wejścia, test na obecność odpowiednika; każde drzewo przez
      `plugin test` z montażem i kliknięciem przed pokazem na żywo; korzeń projektu w górę od
      zmiennego cwd, test w podfolderze (L-0146).
    - **Sesje:** sonda działania niszczącego w sesji bez wartości, stan w pliku przed krokiem
      (L-0153); funkcja czekająca na `$.ui.ask` zapamiętuje id sesji i porzuca odpowiedź po zmianie,
      zegar i próg czyta po każdym `await` (L-0166); test wielu rozmów — atrapy per rozmowa (L-0168);
      narzędzie wołane w komendzie nie pisze plików tymczasowych pod `.claude/` (ścieżka wrażliwa
      harnessu) — tekst na stdin heredokiem, jedno polecenie (L-0185); stan „na turę” liczy się od
      nowego polecenia człowieka, nie od zdarzenia promptu („tak”, powiadomienie i raport subagenta
      też nim są), a stan współdzielony przez równoległe hooki powstaje atomowo (L-0189); hook
      wyzwalany narzędziem mierzysz listą narzędzi z transkryptu i licznikiem wstrzykniętego
      kontekstu — model pisze też powłoką (L-0190).
    - **Usługi zewnętrzne:** stan ustawienia repozytorium czytasz z API (`gh api repos/<repo>/pages`),
      nie ze zrzutu ani słowa człowieka (L-0244); obraz dla cudzej usługi w proporcji zmierzonej na
      opublikowanym widoku, każda podmiana pod nowym adresem (L-0245).
    (L-0041, L-0042, L-0044, L-0047, L-0092, L-0133, L-0136, L-0138, L-0139, L-0146, L-0153, L-0166,
    L-0168, L-0185, L-0189, L-0190, L-0244, L-0245)
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Weryfikację planujesz tam,
    gdzie wykonalna; po pytaniu sprzątasz sam; jednostką inwentarza jest sprawa, nie linia; wstawkę
    kotwiczysz do elementu, który przeżyje operację, i dowodzisz **obecności** nowej treści. Gdy
    prompt etapu przeczy regule dokumentu docelowego — wygrywa dokument, rozjazd do dziennika.
    Opcja pytania, która odwołuje się do wariantu planu, cytuje jego definicję z planu (L-0228).
    (L-0005, L-0013, L-0014, L-0050, L-0058, L-0109, L-0228)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    Zadanie wizualne: najpierw cechy pozytywne, jeden wariant do kalibracji, zrzut przed
    dokończeniem etapu. Pytanie kalibracyjne nazywa kadr i obszar oceny, a zmianę pokazuje
    z obrysem w otwartym oknie (L-0229). Makieta istniejącego interfejsu zaczyna się od zrzutu
    jego aktualnej wersji (L-0231).
    - **Układ:** kompozycja z tekstem w warstwie, która liczy układ (HTML `grid`/`flex`, `overflow`),
      ręczne współrzędne tylko dla dekoracji; dziecko poza kontenerem blokuje, a instrument
      prostokątów ma kontrolę na podłożonym przepełnieniu; rysunek do człowieka po renderze
      w Chromium z pomiarem (L-0142); kryterium w warunkach odbiorcy (szerokość, wysokość glifów);
      uwaga „za niski / krzywo” najpierw pomiarem zrzutu, równe piksele przy powtórzonej uwadze to
      kontrast — pomiar i wybór zamiast kolejnej rundy (L-0196); tekst ucinany w modzie stoi
      w pudełku o bazie zerowej (`width={0}` + `flexGrow`), próba wyglądu startuje na
      najdłuższych realnych danych (L-0197).
    - **Nośnik:** na ograniczonym zestawie elementów sonda ustala pułap przed projektem, warianty
      w tym samym nośniku, różne już w stanie domyślnym (L-0197), ograniczenie mówione wprost;
      animacja znaczy trwającą czynność i ma źródło w sygnale narzędzia, wskaźnik postępu rośnie
      od lewej (L-0199); nowy element zbioru różnisz kształtem,
      porównanie na całym zbiorze w skali docelowej; plan z interfejsem wskazuje źródło motywu
      w pierwszym etapie, który rysuje więcej niż linię. Ostrzeżenie `plugin validate` o root
      `CLAUDE.md` jest skutkiem dogfoodingu — nie naprawiasz. Z zaakceptowanego wariantu
      przenosisz kształt, nie same barwy, i porównujesz wynik z jego zrzutem (L-0200); walidator,
      `plugin test` z montażem i zrzut to trzy osobne dowody, `Svg` zawsze z `alt` (L-0201);
      mechanizm mnożący drzewo — najpierw test budżetu na najgorszych danych (L-0202); przejście
      po drzewie testujesz na węźle w kształcie silnika, nie z ręki (L-0204, P-045); poprawka
      zielona w teście, a martwa na żywo — najpierw diagnostyka z działającego modu (L-0205);
      zrzut przez `PrintWindow` z `SetProcessDPIAware` (L-0206); element chwilowy (dymek,
      najechanie) nie zmienia geometrii spoczynku — test wysokości spoczynku obok testu nowego
      zachowania, pełne słowa w natywnym `<title>` (L-0209). Wygląd
      panelu i pasków: `docs/zasoby/PANEL_RELAI/DESIGN.md` przed każdą zmianą.
    - **Liczby i słowa:** procenty i kwoty z dwoma miejscami (L-0145); etykieta stanu słowem
      i znakiem, „x/y” tylko gdy y jest celem (L-0147); słowo o przeszłości ma warunek prawdziwości
      i test (L-0149); komórka liczby `flexShrink={0}` (L-0152); karta decyzji w całości tylko dla
      pozycji, które zmienia (L-0157); adnotacja mówi wartość wyliczoną (L-0176).
    - **Film:** element trwały po ruchu kamery bez 3D i filtra, przegląd klatki największego
      zbliżenia (L-0171); przejście przez wspólne tło, krój rozróżniający „1” i „I” (L-0174);
      „tego nie pokazujemy” szukasz we wszystkich tekstach kadru (L-0178); dźwięk z gotowych źródeł,
      próbki do wyboru (L-0179); licencję czytasz na stronie utworu, plik z kartą źródła i testem
      (L-0180); drugi język zaczyna się od jednej klatki i pytania, dla kogo (L-0183).
    - **Scena 3D:** kandydaci zasobów na karcie zgody po miniaturach obok wzorca, cecha wzorca
      widoczna już na miniaturze (L-0216); obiekt za płaszczyzną sprawdzasz kadrem, w którym jest
      największy, i wobec `near`/`far` kamery (L-0217); powtarzalne bryły jako jedna geometria,
      wywołania rysowania mierzone opakowaniem kontekstu (L-0219); uwaga „nie jak wzorzec” — rozbiór
      kadru na światło, materiał, obiektyw i kompozycję z jedną przyczyną i granicą techniki przed
      kolejną rundą (L-0220); urządzenie w scenie budujesz warstwami prawdziwej konstrukcji i przed
      pierwszym zrzutem oglądasz wycinek ×2 każdego narożnika i krawędzi obok wzorca — nic nie wystaje
      poza obrys, warstwa leży na powierzchni, równe marginesy są równe w liczbach (L-0221); cudzy
      generator sceny sprawdzasz pudełkami wypieczonej geometrii obok `Box3.setFromObject` i klasą
      referencyjną biblioteki (L-0225); dystans do wzorca najpierw detal, tekstury i kompozycja,
      technika światła na końcu, a hipotezę „X zrobi różnicę” — tanim testem na jednym kadrze
      z werdyktem człowieka przed etapem (L-0226).
    - **Strona przewijana:** ruch wiązany z każdym ruchem kółka odbierasz człowiekowi jako lekturę.
      Najpierw proponujesz jedną animację na sekcję z resetem poza ekranem (L-0233). Tryb ograniczonego
      ruchu i brak skryptu sprawdzasz wysokością sekcji i tym, co jest za krawędzią, a nie tylko
      widocznością (L-0235). Stan sprzed animacji nie przyciemnia tekstu przezroczystością, bo
      kontrast mierzysz także na pierwszej klatce (L-0236). Każdy nowy powód zejścia do trybu
      przepływu dostaje przebieg z liczeniem elementów za krawędzią sekcji i dialogów. Reguła
      rozmiaru okna obowiązuje tylko w trybie, dla którego powstała (L-0237). Klasa wyjmująca
      element z przepływu wchodzi przed zmianą jego rozmiaru; na telefonie pierwsza asercja to
      `innerWidth` i `scrollWidth` równe emulacji z `mobile: true` (L-0241).
    (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094, L-0098, L-0137, L-0140, L-0142, L-0145, L-0147,
    L-0149, L-0152, L-0157, L-0171, L-0174, L-0176, L-0178, L-0179, L-0180, L-0183, L-0196, L-0197,
    L-0199, L-0216, L-0217, L-0219, L-0220, L-0221, L-0225, L-0226, L-0233, L-0235, L-0236, L-0237,
    L-0241)

**Wyprowadzone 2026-08-20 do `docs/PULAPKI.md`:** sześć pułapek narzędziowych — `tar` na `PATH`
(L-0021), sesja `claude -p` (L-0024), PowerShell 5.1 i UTF-8 (L-0027), `--allowedTools` przy
`acceptEdits` (L-0028), restart po `plugin update` (L-0031), `git worktree` zamiast
`git archive | tar` (L-0039). Obowiązują — czytasz je z rejestru pułapek, na żądanie.

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/BEZPIECZENSTWO/E1/`.** Wszystko tymczasowe — skrypty
> pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam. Artefakt, który
> z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego repozytorium),
> wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

1. **`adapters/claude-code/skills/trivy-scan/`** — kopia skilla z profilu: `SKILL.md`, `scripts/scan.mjs`, `scripts/lockfile-hook.mjs` (plik leży, rejestracja w E2), `references/fixing.md`, `references/hook.md`, `evals/` (trzy przypadki z `files/`). Bez katalogu `trivy-scan-workspace/`. W kopii: ścieżka skryptu w `SKILL.md` wskazuje katalog skilla w pluginie, nie `~/.claude/skills/`; `references/hook.md` mówi, że rejestrację w RelAI daje E2. Wersja w profilu zawiera już poprawkę z testów (wersja docelowa sprawdzana `trivy sbom`, axios 0.33.0 → 0.34.0) — przenosisz ją, nie piszesz od nowa. Opis skilla musi przejść `core/tools/skill-metadata.js` (trzecia osoba, ≤1024 znaków).
2. **`adapters/claude-code/commands/relai-security.md`** — komenda wg wzoru `relai-audit.md`: frontmatter `description` (trzecia osoba, frazy PL i EN, wprost „kod i zależności, nie dokumenty”), `argument-hint`. Przebieg: (a) skan skryptem `scan.mjs` skilla, (b) podsumowanie i plan aktualizacji, (c) w projekcie RelAI: nowe CRITICAL/HIGH bez decyzji → wiersz w „Stan otwartych ryzyk” `docs/DZIENNIK.md` (kolejny wolny numer, klucz z decyzji wyżej), rozwiązane → `ZAMKNIĘTE` z datą, (d) pytanie o aktualizację i dalej procedura skilla. Brak Trivy → komendy ekosystemu z `first-deploy.md` jako zapas i propozycja instalacji po zgodzie. Tryb gościa → bez zapisu do dokumentów (przypadek b8).
3. **Panel:** `core/panel/commands.mjs` — wpis w `FORMS` (pole wyboru zakresu tylko wtedy, gdy komenda ma argument); `core/panel/theme.mjs` — `NAMES['relai-security']` i miejsce w grupie `care` („Porządek i bezpieczeństwo”); `docs/zasoby/branding/ikony/security.svg` w stylu pozostałych 15 ikon; `node core/tools/sync-panel-core.js`, żeby kopie w `panel/`, `progress/`, `cache-keeper/` nie rozjechały się z rdzeniem.
4. **Codex:** `adapters/codex/generate-skills.js` — 15 → 16 w kontroli liczby; `adapters/codex/tests/generate-skills.test.js` — 15 → 16; uruchom `node adapters/codex/generate-skills.js` (powstaje `adapters/codex/skills/relai-security/`). Skilla `trivy-scan` generator w E1 nie kopiuje (E5) — zapisz to w README adaptera Codeksa jednym zdaniem.
5. **Dokumenty liczące komendy** — 15 → 16 i wiersz o nowej komendzie: `docs/KOMENDY.md`, `core/templates/SPEC_KOMENDY.md`, `README.md`, `adapters/cursor/README.md`, `adapters/codex/README.md`, `docs/PRZEWODNIK.md`, `docs/INSTALACJA.md`, `docs/STATE.md`, `adapters/claude-code/commands/relai-update.md` (tabela celów) + jego kopia w Codeksie (z generatora), komentarz w `core/tools/sync-panel-core.js`. Przed zmianą `grep` po „15 komend”, „piętnast” i „Komendy (15)”, żeby nie zgubić miejsca spoza listy.
6. **`docs/ARTEFAKTY.md`** — wiersze dla `relai-security.md` i każdego pliku `.md` skilla `trivy-scan` (wersja 1.0, data, „co się zmieniło”, „po co”); nagłówek komend 16; licznik plików skilli. Skrypty `.mjs` nie są artefaktami (wykluczone jak hooki i walidatory).
7. **Dogfooding na RelAI:** `/relai-security` na tym repozytorium (lockfile w `docs/zasoby/film/zrodla/` i katalogach roboczych) — wynik do wpisu dziennika; jeśli zero CRITICAL/HIGH, tabela ryzyk się nie zmienia.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_1.md` (`- [ ]` → `- [x]`) zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [ ] `node core/tools/validate-adapters.js` kończy się bez błędów (metadane `trivy-scan` i `relai-security`, parytet Codeksa, sieć w skryptach).
- [ ] `node --test core/panel/tests/*.test.js` — zielone, w tym `commands.test.js`, `theme.test.js`, `phrases.test.js` z 16 komendami.
- [ ] `node --test core/process/tests/*.test.js` i `node --test adapters/codex/tests/*.test.js` — zielone.
- [ ] `node adapters/codex/generate-skills.js --verify` — brak różnic.
- [ ] Skrypt skilla w pluginie na projekcie testowym z podatnym `package-lock.json` (np. lodash 4.17.15, axios 0.21.0 — w katalogu roboczym) zwraca liczby według wagi, plan „jest → cel” i adnotację o podniesionej wersji docelowej axios.
- [ ] Dowód negatywny: `scan.mjs` i `lockfile-hook.mjs` nie zawierają wywołań sieciowych — `grep -nE "require\\(['\"](https?|net|tls)|from ['\"](node:)?(https?|net|tls)['\"]|fetch\\(|WebSocket"` na obu plikach nic nie zwraca; kontrola pozytywna tego wzorca na pliku z `fetch(` w katalogu roboczym trafia.
- [ ] `/relai-security` na projekcie testowym w katalogu roboczym ze strukturą RelAI dopisuje wiersz CRITICAL/HIGH do tabeli ryzyk, a drugie uruchomienie nie dubluje wiersza.
- [ ] `grep -rn "15 komend\|piętnast\|Komendy (15)"` po `docs/`, `README.md`, `adapters/`, `core/` nie zwraca miejsc mówiących o bieżącej liczbie komend (wzmianki historyczne opisane we wpisie).
- [ ] `hooks.json` i `~/.claude/settings.json` bez zmian (dowód negatywny: `git diff --stat adapters/claude-code/hooks/` pusty).
- [ ] Wersja w `.claude-plugin/plugin.json` nadal 3.2.0.
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy”, z wynikiem dogfoodingu i podpisem z członem użytkownika.
- [ ] Katalog roboczy `.claude/relai/work/BEZPIECZENSTWO/E1/` przejrzany raportem (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”, liczby przed i po we wpisie dziennika; artefakty spoza katalogu (`%TEMP%`, katalog domowy) wypisane we wpisie z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez tego rytuału etap nie jest ukończony)

1. `docs/plany/BEZPIECZENSTWO/STATUS.md` — E1 → `ZREALIZOWANY <data>`, E2 → `GOTOWY DO STARTU`, linia w dzienniku wdrożenia; link w kolumnie `Prompt` przy E2 zaraz po kroku 5.
1a. Katalog roboczy `.claude/relai/work/BEZPIECZENSTWO/E1/` — raport, „tak”, kasowanie; liczby przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. Wpis w `docs/DZIENNIK.md` (+ lekcje, jeśli coś zaskoczyło; + ryzyka, jeśli dogfooding je dał), podpis z członem użytkownika.
3. Bramki manualne w `STATUS.md` z sekcji „Do zrobienia przez człowieka” tego wpisu.
4. `docs/STATE.md`, `CLAUDE.md` (wiersz planu w „Stan prac”) i pozostałe dokumenty, których dotknął etap.
5. **Wygenerowanie `PROMPT_ETAP_2.md`** — materiał: `PLAN.html` sekcje 5 (punkt 3), 6 (wiersz E2), 7 (ryzyka 1, 4, 5), 8 (b7), realny stan po E1 (skill i komenda w pluginie, 12 hooków w `hooks.json`, wpis hooka w `~/.claude/settings.json` do usunięcia po zgodzie) i lekcje z E1.
6. Commit — propozycja.
