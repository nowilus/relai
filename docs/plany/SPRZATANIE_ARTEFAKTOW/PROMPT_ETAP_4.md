# PROMPT_ETAP_4 — Pomiar na realnych projektach i wydanie 1.8.0

Plan: SPRZATANIE_ARTEFAKTOW • Etap: **E4 z E4** • Wygenerowano: 2026-09-03 (autor: Opus, w rytuale
„Na koniec" E3) • Wykonawca: **Opus** (D-85 — model wykonawczy etapów w tym projekcie)

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus**. Jeśli sesja działa na innym
> modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

> **To jest ostatni etap planu.** Rytuał „Na koniec" kończy się nie generacją kolejnego promptu,
> tylko **sekwencją zamknięcia planu (D-36)** — sekcja „Na koniec" niżej mówi, jak.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, reguły profilu `prompty` (rejestr artefaktów), definicja ukończenia, sekcja niemutowalna |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (**S1**, **S2**, **R5**) + wpis z 2026-09-03 „E3: katalog roboczy nazwany z góry" — stamtąd bierzesz, czego E3 **nie** zweryfikował i jak przeformułowano jedno kryterium |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |
| `docs/plany/SPRZATANIE_ARTEFAKTOW/PLAN.html` | sekcja 6 (zakres E4 — jedyne źródło zakresu), sekcja 5 („Cztery momenty" i „Ustawienia i próg"), sekcja 7 (ryzyka 1, 5, 8), sekcja 9 (sprawy dla człowieka) |
| `docs/plany/SPRZATANIE_ARTEFAKTOW/STATUS.md` | **trzy bramki `OTWARTA`**, które ten etap ma domknąć albo świadomie zostawić: ikona `clean.svg`, markery w PolyFlow, raport `/relai-clean` na PolyFlow |
| `docs/PULAPKI.md` | **P-005** (wersja pluginu potwierdzana treścią pliku, nie komunikatem CLI — sekwencja wydania), P-003 (PowerShell 5.1 i UTF-8), P-004 (`acceptEdits` a Bash) |
| `core/templates/SPEC_KOMENDY.md` | **plik, który zmieniasz** — układ tabeli komend i sekcji „zachowania automatyczne" |
| `docs/KOMENDY.md` | **plik, który zmieniasz** — 11 wierszy, 10 komend; `/relai-clean` nie ma tam ani jednego wystąpienia |
| `README.md` | **plik, który zmieniasz** — tabela komend, wiersze 242–251, dziesięć wierszy z ikoną 24 px |
| `adapters/claude-code/commands/relai-update.md` | **plik, który zmieniasz** — wiersze wersji, do których dochodzi 1.8.0 |
| `adapters/claude-code/commands/relai-clean.md` | komenda z E1 — brzmienia i argumenty, które opisujesz w dokumencie użytkownika **dosłownie** (zasada 2) |
| `docs/zasoby/branding/ikony/` | dziesięć istniejących ikon — styl, `viewBox`, grubość kreski dla `clean.svg` |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Marker `# relai: zachowaj`**, **próg 100 MB**, **kształt katalogu roboczego**
  (`.claude/relai/work/<TEMAT>/E<N>/`) i **numeracja kroków rytuałów** (`2a` przy zamknięciu sesji
  i odnogi, `1a` przy zamknięciu etapu) są rozstrzygnięte w E1–E3. Nie negocjujesz brzmień ani
  wartości.
- **Wersja wychodzi jako 1.8.0** w trzech źródłach: `core/MANIFEST.json`,
  `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`. Dziś wszystkie trzy mają
  `1.7.0` (FAKT, walidator: „3 zrodel, wartosc 1.7.0").
- **Sekwencja wydania jest z P-005** i jest wiążąca: podbicie wersji → `git push` →
  `claude plugin update` → **restart aplikacji** → dopiero potem pomiar. Wersję potwierdzasz
  **treścią pliku, który się zmienił**, nigdy komunikatem CLI ani `installed_plugins.json`.
- **Prompty etapów zrealizowanych zostają bez zmian** (D-34). Nie wracasz do `PROMPT_ETAP_1..3`.
- **`PLAN.html` jest zamrożony** (D-33). Rozbieżność planu ze stanem faktycznym zgłaszasz jako
  propozycję aneksu, nie poprawiasz po cichu.
- **Kryterium „`git grep` po martwej frazie zwraca zero w `core/templates/`" zostało w E3
  przeformułowane** i jest zamknięte — nie otwierasz go ponownie. Powód: wzmianka historyczna
  w `SPEC_USTAWIENIA.md` (z E2) opisuje ten punkt w czasie przeszłym i ma tam zostać.
- **Granica zakresu:** w tym etapie **nie zmieniasz** narzędzia `work-artifacts.js`, funkcji
  `artefaktyRobocze` w `session-signals.js`, hooków ani specyfikacji zmienionych w E3. Jeśli
  sięgasz po którykolwiek z nich, to znaczy, że wyszedłeś poza zakres — sygnał odchylenia,
  nie „przy okazji".

## Stan wyjściowy (co realnie zastajesz po E3)

Repozytorium na **1.7.0**; plugin zainstalowany globalnie w tej samej wersji. Mechanizm sprzątania
jest **kompletny w repozytorium i niewidoczny dla użytkownika**: narzędzie i komenda działają (E1),
start sesji i krok 2a rytuału zamknięcia dnia działają (E2), prompty etapowe i odnóg nazywają
katalog roboczy z góry (E3) — ale w `docs/KOMENDY.md`, `README.md`, `SPEC_KOMENDY.md`
i `relai-update.md` **nie ma ani jednego wystąpienia `relai-clean`** (FAKT, 2026-09-03). Ten etap
to zamyka i wydaje całość.

```
adapters/claude-code/
  commands/                       # 11 plikow komend; relai-clean.md z E1
  commands/relai-update.md        # DO ZMIANY: wiersze wersji + 1.8.0
  skills/relai-core/SKILL.md      # E2: krok 2a; E1: sekcja "Pliki lokalne..." BEZ ZMIAN
  skills/relai-planning/SKILL.md  # E3: krok 1a rytualu + elementy 7 i 8. BEZ ZMIAN.
adapters/cursor/
  rules/relai-planning.mdc        # E3: krok 1a po angielsku. BEZ ZMIAN.
core/
  process/work-artifacts.js       # E1. BEZ ZMIAN.
  process/session-signals.js      # E2. BEZ ZMIAN.
  templates/SPEC_PROMPT_ETAPU.md  # E3: sekcja 7 + punkt weryfikacji. BEZ ZMIAN.
  templates/SPEC_ODNOGA.md        # E3: sekcja 7 + krok 2a. BEZ ZMIAN.
  templates/SPEC_KOMENDY.md       # DO ZMIANY: 11 komend + punkt w zachowaniach automatycznych
  MANIFEST.json                   # DO ZMIANY: 1.7.0 -> 1.8.0
.claude-plugin/
  plugin.json                     # DO ZMIANY: 1.7.0 -> 1.8.0
  marketplace.json                # DO ZMIANY: 1.7.0 -> 1.8.0
docs/
  KOMENDY.md                      # DO ZMIANY: 11 wierszy / 10 komend, bez relai-clean
  ARTEFAKTY.md                    # 39 pozycji; szesc podbitych w E3
  zasoby/branding/ikony/          # 10 ikon; BRAKUJE clean.svg
README.md                         # DO ZMIANY: tabela komend, wiersze 242-251 (10 z ikona 24 px)
```

**Liczby zastane (FAKT, 2026-09-03):**

- Komendy: **11 plików** w `adapters/claude-code/commands/`, **10 komend w 11 wierszach**
  `docs/KOMENDY.md` (jeden wiersz to wariant `/relai-stage E5`), **10 wierszy z ikoną** w `README.md`,
  **10 plików** w `docs/zasoby/branding/ikony/`.
- Wersja: `1.7.0` w trzech źródłach; `node core/tools/validate-adapters.js` kończy się kodem **0**.
- Raport startu w tym repozytorium: **0 znaków** z obu hooków przy warstwie 37,0 KB.
- Czas `artefaktyRobocze` (źródła `work` + `temp`): **35 ms** bez katalogu roboczego, **116 ms** na
  30 MB / 3 000 plików, **720 ms** na 20 500 plikach z `niepelne: true`. Ze źródłem `repo`:
  **77 ms** na czystym repo, **2 152–2 335 ms** na materiale z E1.

**Czego jeszcze NIE ma (to jest zakres tego etapu):** wiersza `/relai-clean` w `docs/KOMENDY.md`
i w `SPEC_KOMENDY.md`; ikony `clean.svg` i jedenastego wiersza w `README.md`; wierszy 1.8.0
w `relai-update.md`; podbitej wersji w trzech źródłach; **pomiaru na cudzym projekcie** — PolyFlow
nie widział ani komendy, ani zdania na starcie sesji.

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
   L-0040, L-0051, L-0052, L-0063, L-0069, L-0082)
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

**Lekcje z E1–E3 bez własnej pozycji w destylacie** („Zasady aktywne" mają 15 przy limicie 15).
Obowiązują w tym etapie:

- **L-0076** — `git grep` przeszukuje **indeks**, nie drzewo robocze: kryterium oparte na nim dla
  treści wprowadzanej przez ten sam etap stawiasz z `--untracked` albo po `git add`.
- **L-0077** — „na korzyść ochrony" rozstrzygasz **niepewność**, nie pustkę; regułę ochronną
  sprawdzasz także na stanie **po** własnym działaniu.
- **L-0078** — nowy, niezacommitowany plik produktu wygląda dla sprzątacza jak śmieć; granicą jest
  indeks gita, więc przy sprzątaniu w trakcie etapu nazywasz wprost, które grupy są dorobkiem sesji.
- **L-0079** — zamknięta lista brzmień przełącznika jest związana z **rodzajem gramatycznym nazwy
  wiersza**; poszerzenie robisz lokalnie, dla jednego wiersza, nie na wspólnym wzorcu.
- **L-0080** — kryterium „całość mieści się w N" mierz **dwa razy w jednym przebiegu**: z wkładem
  etapu i bez niego; różnica jest wkładem etapu i to ona podlega ocenie.
- **L-0081** — ścieżka Windows w JSON-ie na stdin hooka milczy tak samo jak brak markera; punkt,
  którego poprawnym wynikiem jest cisza, sprawdzaj **parą przebiegów** z kontrolą pozytywną.
- **L-0082** — kryterium „fraza zniknęła" postawione na **katalogu** łapie także zdania, które tę
  frazę **opisują**: własne wyjaśnienie etapu i wzmiankę historyczną etapu poprzedniego. Zakres
  takiego kryterium zawężaj do **pliku, który frazę niósł**, i policz trafienia w HEAD, zanim
  zaczniesz pracę.

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/SPRZATANIE_ARTEFAKTOW/E4/`.** Wszystko tymczasowe
— skrypty pomiarowe, payloady hooków, materiał kontrolowany, wyjścia narzędzi — powstaje tam.
Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, klon repozytorium, katalog
PolyFlow), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.
Katalog powstaje przy pierwszym zapisie, nie na zapas.

1. **`core/templates/SPEC_KOMENDY.md`** — komenda `/relai-clean` wchodzi do wymaganej zawartości
   dokumentu (**11 komend**) oraz do sekcji o zachowaniach automatycznych: zdanie na starcie sesji
   przy przekroczeniu progu i krok **2a** rytuału „kończymy na dziś".
2. **`docs/KOMENDY.md`** — wiersz `/relai-clean` w tabeli komend (dziś **11 wierszy, 10 komend**;
   po zmianie **11 komend**) plus punkt w zachowaniach automatycznych. Brzmienia i argumenty
   przepisujesz **z uruchomionej komendy**, nie z pamięci (zasada 2); wariant `raport` podajesz
   w formie, którą realnie odpaliłeś.
3. **`docs/zasoby/branding/ikony/clean.svg`** — jedenasta ikona w stylu dziesięciu istniejących:
   ten sam `viewBox`, ta sama grubość kreski, ta sama paleta. **Bramka manualna `OTWARTA`** —
   z nią jedzie otwarta sprawa „ikony renderują się w 17–23 px, więc kreska schodzi poniżej
   piksela": rozstrzygnięcie należy do człowieka, więc pokazujesz wariant i pytasz, zamiast
   wybierać sam.
4. **`README.md`** — jedenasty wiersz tabeli komend z ikoną (dziś wiersze 242–251, dziesięć
   wierszy z `width="24"`).
5. **`adapters/claude-code/commands/relai-update.md`** — wiersze **1.8.0**: nowy wiersz ustawień
   `Artefakty robocze` (dopisywany, gdy go brak, **bez nadpisywania istniejącego** — ryzyko 6),
   linia fraz sesji ze sprzątaniem, jedenasta komenda.
6. **Podbicie wersji do 1.8.0** w trzech źródłach: `core/MANIFEST.json`,
   `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`. Potem **`grep` po `1.7.0`**
   w całym repozytorium i rozstrzygnięcie **każdego** trafienia na wzmianki historyczne
   (zostają) i deklaracje stanu docelowego (idą do 1.8.0) — także w komendach, skillach
   i specyfikacjach, nie tylko w manifestach (zasada 10).
7. **`docs/ARTEFAKTY.md`** — podbicie wersji artefaktów zmienionych w tym etapie:
   `SPEC_KOMENDY.md`, `relai-update.md` oraz nowa pozycja dla ikony, jeśli rejestr prowadzi ikony.
8. **Wydanie i pomiar u siebie** — sekwencja **P-005**: push → `claude plugin update` → **restart
   aplikacji** → potwierdzenie wersji **treścią pliku, który się zmienił**. Potem pomiar w tym
   repozytorium: start sesji ma dać **0 znaków** artefaktów roboczych przy czystym `work/`.
9. **Pomiar na PolyFlow** (`C:\Users\Lukasz\Desktop\PolyFlow`) — sesja w tamtym folderze albo
   `--add-dir`. Kolejno: `/relai-update` do 1.8.0 → materiał wytworzony **celowo** (katalog etapu
   zamkniętego w `work/`, pozycja `polyflow-*` w `%TEMP%`, klon repozytorium tylko do odczytu) →
   linia na starcie sesji → **pełny przebieg `/relai-clean`** → dowód negatywny na `tools/`
   i `benchmark/`. To domyka dwie bramki `OTWARTA`: **raport na PolyFlow** (punkt weryfikacji E1
   niewykonany) i **markery `zachowaj` dla `tools/cache/` i surowego materiału benchmarku** —
   ta druga jest decyzją właściciela PolyFlow, więc pytasz, a nie rozstrzygasz.
10. **Ten etap wykonujesz z własnym katalogiem roboczym wg E3 i sprzątasz go tym samym
    mechanizmem** — jest to zarazem pierwszy realny test zmiany z E3.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `node core/tools/validate-adapters.js` kończy się kodem 0 i melduje **„3 zrodel, wartosc
      1.8.0"**.
- [ ] `git grep -n --untracked "1\.7\.0"` przepuszczony przez repozytorium: **każde** trafienie
      rozstrzygnięte na piśmie jako wzmianka historyczna albo poprawione. Żadne nie zostaje
      w `MANIFEST.json`, `plugin.json`, `marketplace.json`.
- [ ] **Jedenaście komend w dokumencie użytkownika:** `docs/KOMENDY.md` ma wiersz `/relai-clean`,
      `README.md` ma jedenasty wiersz z ikoną, `docs/zasoby/branding/ikony/clean.svg` istnieje.
      Wypisz liczby przed i po (dziś: 10 komend, 10 wierszy z ikoną, 10 plików ikon).
- [ ] **Wersja potwierdzona treścią pliku, nie komunikatem** (P-005, zasada 10): po restarcie
      aplikacji wskaż plik z cache'u zainstalowanego pluginu, który różni się od wersji 1.7.0,
      i pokaż różnicę. Sam `claude plugin update` nie jest dowodem.
- [ ] **Pomiar u siebie:** start sesji w tym repozytorium przy czystym `work/` daje **0 wystąpień**
      `[RelAI artefakty robocze]` — pełne wyjście hooka w dzienniku.
- [ ] **Pomiar na PolyFlow, pełny przebieg:** linia na starcie sesji z wagą i progiem, raport
      `/relai-clean` w grupach, pozycje chronione **z powodem**, kasowanie po „tak" na grupę,
      pomiar ponowny po operacji. Liczby przed i po we wpisie dziennika **obu** projektów.
- [ ] **Dowód negatywny na PolyFlow:** `tools/` nie jest kandydatem (śledzone), `benchmark/` jest
      chronione powodem `opisane` ze wskazaniem linii. Wypisz oba powody dosłownie z raportu.
- [ ] **Trzy bramki `OTWARTA` z `STATUS.md` domknięte albo świadomie zostawione** — każda z decyzją
      człowieka zapisaną w `STATUS.md` **i** we wpisie: ikona `clean.svg`, markery w PolyFlow,
      raport `/relai-clean` na PolyFlow.
- [ ] Katalog roboczy etapu `.claude/relai/work/SPRZATANIE_ARTEFAKTOW/E4/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak"; **liczby przed i po**
      we wpisie dziennika. Artefakty, które musiały powstać poza tym katalogiem (`%TEMP%`, klon
      repozytorium, katalog PolyFlow), wypisane z nazwy razem z tym, co się z nimi stało.
- [ ] `docs/ARTEFAKTY.md` ma podbite wersje artefaktów tego etapu; hook `profile-rules` nie
      ostrzega — sprawdzone **wywołaniem hooka z kontrolą pozytywną** (L-0081), nie założeniem.
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy", z autorem `RelAI (Opus) + Lukasz`;
      `docs/STATE.md` nadpisany; `git status --short` pokazuje wyłącznie zamierzone zmiany.

## Na koniec — to jest OSTATNI etap planu (rytuał obowiązkowy)

Zamiast generowania `PROMPT_ETAP_5.md` uruchamiasz **sekwencję zamknięcia planu (D-36)**. Nie
odtwarzasz jej z pamięci: **wczytaj skill `relai-planning`** (narzędzie `Skill`) — komenda wywołana
wprost go nie ładuje (zasada 8) — i wykonaj kroki 1–9 z sekcji „Zamknięcie planu".

Kolejność jest wiążąca, a **dwa pierwsze punkty są blokujące**: dopóki bramki i odnogi nie są
rozstrzygnięte, nie piszesz nigdzie, że plan jest zrealizowany.

1. `docs/plany/SPRZATANIE_ARTEFAKTOW/STATUS.md`: E4 → **ZREALIZOWANY 2026-…** (data z kontekstu
   sesji), linia wynikowa w dzienniku wdrożenia.
2. **Otwarte bramki manualne** — trzy są `OTWARTA` i wchodzą do tego etapu (ikona `clean.svg`,
   markery w PolyFlow, raport na PolyFlow). Wypisz je i zapytaj o każdą: rozstrzygnięta teraz
   (zapisujesz jak, w obu miejscach) czy świadomie zostawiona otwarta (wtedy przechodzi do
   `docs/STATE.md`, żeby nie zginęła z folderem planu w archiwum).
3. **Otwarte odnogi** — ten plan nie ma sekcji „Odnogi"; punkt przechodzi bez pytania. Sprawdź to,
   nie zakładaj.
4. `docs/STATE.md` — obszar planu przechodzi z „w toku" do stanu faktycznego; liczby (etapy,
   komendy, artefakty w rejestrze, lekcje, wersja).
5. **Wpis zamykający w `docs/DZIENNIK.md`** — sekcja „Zrobione" mówi **dowiezione vs plan**: co
   miało powstać, co powstało, co przepadło. Przejrzyj ryzyka **S1**, **S2** i **R5**; lekcje →
   `docs/LEKCJE.md` („Zasady aktywne" mają 15 przy limicie 15 — nowa pozycja wyłącznie przez
   kompresję tematyczną za zgodą człowieka).
6. `STATUS.md` — status planu → `ZREALIZOWANY <data>`.
7. **Archiwum** — `docs/plany/SPRZATANIE_ARTEFAKTOW/` → `docs/archiwum/plany/SPRZATANIE_ARTEFAKTOW/`;
   przeniesienie, nie kasowanie (D-18).
8. `CLAUDE.md` — linia aktywnego planu. **Warunek twardy: na koniec tury linia wskazuje istniejący
   plik albo brzmi `Aktywny plan: brak`.** Plan ROZWOJ_PO_WYDANIU jest zamrożony, więc rozstrzygnij
   świadomie i zapytaj, jeśli nie masz pewności — martwy link nie jest poprawną wartością nigdy.
9. **Podsumowanie** — 3–5 zdań: co dowieziono, czego nie i dlaczego, co czeka na człowieka.
10. Commit + push: `feat(clean): release 1.8.0 with work-artifact cleanup` (w treści: dokument
    użytkownika, ikona, `relai-update`, wersja w trzech źródłach, pomiar na dwóch projektach).
    Commit wyłącznie za zgodą.
