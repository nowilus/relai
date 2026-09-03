# PROMPT_ETAP_2 — Start sesji mówi o zaległościach, rytuał zamknięcia je sprząta

Plan: SPRZATANIE_ARTEFAKTOW • Etap: **E2 z E4** • Wygenerowano: 2026-09-03 (autor: Opus, w rytuale
„Na koniec" E1) • Wykonawca: **Opus** (D-85 — model wykonawczy etapów w tym projekcie)

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus**. Jeśli sesja działa na innym
> modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, reguły profilu `prompty` (rejestr artefaktów), definicja ukończenia, sekcja niemutowalna; **linia fraz sesji** — będziesz ją zmieniał |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (ryzyka **S1** i **S2** dopisane w E1) + wpis z 2026-09-03 „E1: narzędzie rdzenia `work-artifacts.js` i komenda `/relai-clean`" — stamtąd bierzesz zmierzone czasy i to, czego E1 **nie** zweryfikował |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |
| `docs/plany/SPRZATANIE_ARTEFAKTOW/PLAN.html` | sekcje 5 („Cztery momenty" — wiersze „start sesji" i „kończymy na dziś"; „Ustawienia i próg"), 6 (zakres E2), 7 (ryzyka 3, 5, 6, 8), 8 (przypadki brzegowe 2, 10, 13, 15) |
| `core/process/work-artifacts.js` | eksporty i kształt wyniku `artefaktyRobocze` — E2 **nie przepisuje** pomiaru, tylko go woła |
| `core/process/session-signals.js` | wzorce do naśladowania: `startCost` / `startCostReport` (miara osobno, raport osobno, opcja `interaktywna`), `komorkaDecyzji`, `progiRotacjiZKomorki`, `przegladSprawCzlowieka` — czytanie wiersza ustawień z kotwicą i zamkniętą listą brzmień |
| `adapters/claude-code/hooks/session-context.js` | miejsce wywołania (linie z `core.startCostReport` i `core.sprawyPrzeterminowaneReport`) — nowa linia staje obok nich |
| `adapters/cursor/hooks/session-context.js` | ten sam układ + `interaktywna: input.is_background_agent !== true` — jedyne miejsce, w którym rozróżnienie sesji nieinteraktywnej jest zmierzone |
| `.claude/relai/templates/SPEC_USTAWIENIA.md` | sekcja wiersza maszynowego, katalog progów, lista wierszy nietykalnych w rotacji ustawień |
| `adapters/claude-code/skills/relai-core/SKILL.md` | rytuał zamknięcia sesji, kroki 1–6 — **krok 2** jest cytowany jako adres w wielu miejscach i numeracji nie ruszasz |
| `adapters/cursor/rules/relai-core.mdc` | ten sam rytuał w regule zawsze-w-kontekście adaptera Cursora |
| `docs/PULAPKI.md` | P-003 (PowerShell 5.1 i UTF-8), P-004 (`acceptEdits` a Bash) |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Próg domyślny wiersza `Artefakty robocze` to 100 MB** — zaakceptowany 2026-09-03, bramka
  manualna `ROZSTRZYGNIĘTA` w `STATUS.md`. Nie negocjujesz wartości i nie dodajesz drugiego progu.
- **Kotwica wiersza:** `włączone` / `wyłączone` (EN `on` / `off`) na **początku komórki**, próg w MB
  jako drugi człon; wartość nierozpoznana znaczy **linia raportu o nierozpoznanej wartości**, nie
  cisza (ryzyko 6 planu, L-0025, L-0035). Wiersz dołącza do listy nietykalnych w rotacji ustawień —
  było pięć, ma być sześć.
- **Nowy krok rytuału zamknięcia ma numer `2a`, nie `3`** (przypadek brzegowy 15 planu): „krok 2"
  jest cytowany jako adres rotacji w skillu, regułach Cursora, `SPEC_ARCHIWUM.md`,
  `SPEC_USTAWIENIA.md` i lekcjach. Krok 2a stoi **po rotacji, przed wpisem dziennika**, żeby wpis
  sesji opisał także sprzątanie.
- **Start sesji kończy się na zdaniu.** Dokładnie **jedna** linia `[RelAI artefakty robocze]`,
  najwyżej **trzy** najcięższe pozycje z pochodzeniem, reszta jako liczba, propozycja
  `/relai-clean` — i nic więcej. Hook niczego nie kasuje i nie zostawia śladu (ryzyko 8, L-0036,
  L-0049: jeden komunikat, jeden właściciel).
- **Wyłączony wiersz wycisza wyłącznie start sesji i krok 2a.** Komenda `/relai-clean` i punkt
  weryfikacji etapu działają zawsze — pierwsza jest jawnym wywołaniem, drugi częścią definicji
  ukończenia etapu (przypadek brzegowy 13).
- **Pomiar jest już napisany.** `core/process/work-artifacts.js` powstał w E1 i jest jedynym
  miejscem, które liczy artefakty. E2 dokłada do `session-signals.js` **cienką warstwę**:
  wywołanie pomiaru z zawężonymi źródłami i formatowanie jednej linii. Drugiej implementacji pomiaru
  nie piszesz (P4 — dryf rdzenia i adapterów).
- **Skan repo nie wchodzi na start sesji.** Hook mierzy `work` i `temp`; `git status --ignored`
  należy do komendy (plan, sekcja 5, wiersz „start sesji"; ryzyko 3).
- **Kopia narzędzia w projekcie jest samowystarczalna** — `.claude/relai/tools/clean-work.js` nie
  woła `require` na rdzeń (L-0012, zweryfikowane w E1). Rdzeń wołający rdzeń to co innego:
  `session-signals.js` **może** wołać `work-artifacts.js`, bo oba żyją w katalogu pluginu.
- **Granica zakresu:** `SPEC_KOMENDY.md`, `docs/KOMENDY.md`, README z ikoną `clean.svg`,
  `relai-update.md`, podbicie wersji do **1.8.0**, sekwencja P-005, `/relai-update` na PolyFlow —
  **E4**. Katalog roboczy w `SPEC_PROMPT_ETAPU.md` i `SPEC_ODNOGA.md`, `/relai-stage`,
  `/relai-branch` — **E3**. W tym etapie **nie podbijasz wersji** i nie dopisujesz `/relai-clean`
  do dokumentu użytkownika.

## Stan wyjściowy (co realnie zastajesz po E1)

Repozytorium na **1.7.0** (`MANIFEST.json`, `plugin.json`, `marketplace.json` — sprawdzone w E1);
plugin zainstalowany globalnie w tej samej wersji, więc **komendy i skille testujesz z plików repo,
nie z cache'u pluginu** (P-005). Plan SPRZATANIE_ARTEFAKTOW: E1 `ZREALIZOWANY 2026-09-03`, ten etap
jest drugi. Katalog roboczy tego etapu: **`.claude/relai/work/SPRZATANIE_ARTEFAKTOW/E2/`** —
wszystko tymczasowe powstaje tam, a artefakt, który z natury musi leżeć poza projektem, wpisujesz
do wpisu dziennika **z nazwy**.

```
core/
  process/work-artifacts.js        # NOWY w E1: biblioteka+CLI, zero zaleznosci, zero require na rdzen.
                                   #   Eksporty: slugProjektu, czytajMarkery, artefaktyRobocze, bramka,
                                   #   grupy, raport, raportTekst, kasuj, dopiszMarker, kontekstBramki,
                                   #   LIMIT_WPISOW (20000).
                                   #   artefaktyRobocze(cwd, {zrodla:['work','temp','repo'], limitWpisow})
                                   #   -> {cwd, slug, pozycje[], kandydaci[], chronione[], suma, bezGita,
                                   #       repo, czas, kontekst}
                                   #   pozycja: {sciezka, wzgledna, bajty, pliki, mtime, data, niepelne,
                                   #       dowiazanie, pochodzenie, zrodlo, chronione:{powod,zrodlo}|null}
                                   #   pochodzenie: etap | odnoga | fixy | sesja | nieznane |
                                   #       temp-projekt | temp-relai | niesledzone | ignorowane
  process/session-signals.js       # +provisionTools i NARZEDZIA (E1); provisionTemplates zwraca teraz
                                   #   liczbe specyfikacji + narzedzi (31 -> 32). Sygnatura bez zmian.
  MANIFEST.json                    # process[2]: session-signals, work-artifacts; uses[] obu adapterow
  tools/validate-adapters.js       # wypisuje NAZWY plikow rdzenia w odwolaniach adaptera (zmiana z E1)
adapters/claude-code/
  commands/relai-clean.md          # NOWA komenda (11. w repo, 10 w wydaniu): raport, pytania partiami
                                   #   po cztery, kasowanie po "tak", wpis w dzienniku, zakazy
  hooks/session-context.js         # bez zmian w E1 — dostaje nowa linie w TYM etapie
  skills/relai-core/SKILL.md       # +sekcja "Pliki lokalne, ktorych nie sprzatamy (od 1.8.0)";
                                   #   krok 2a jeszcze NIE istnieje
adapters/cursor/
  hooks/session-context.js         # bez zmian; wola te sama funkcje rdzenia co Claude Code
  rules/relai-core.mdc             # krok 2a jeszcze NIE istnieje
docs/
  USTAWIENIA.md                    # 5 wierszy maszynowych; wiersza "Artefakty robocze" NIE MA
  ARTEFAKTY.md                     # 39 pozycji; relai-clean.md wersja 1, relai-core/SKILL.md wersja 2
  LEKCJE.md                        # 24 lekcje aktywne, ostatnia L-0078; "Zasady aktywne" 15 przy limicie 15
.claude/relai/
  tools/clean-work.js              # kopia narzedzia podlozona przez hook startu (SHA zgodne ze zrodlem)
  work/                            # PUSTY po sprzataniu E1
```

**Warunki pracy:** Node **24.13.1** na `PATH` (FAKT). PowerShell 5.1 psuje polskie znaki przy
odczycie — dokumentów przez niego nie przepuszczaj (P-003). Polecenia Bash nie wchodzą w
`acceptEdits` (P-004). Hook startu uruchamiasz z payloadem `SessionStart` przez **stdin**, nie
echem z powłoki (L-0017; w E1 sprawdziło się `spawnSync('node',[HOOK],{input: JSON.stringify(...)})`).

**Zmierzone w E1 — punkty odniesienia dla limitu czasu hooka (FAKT, 2026-09-03):**

- `artefaktyRobocze` na **czystym repozytorium**, źródła `work` + `temp` + `repo`: **86 ms**.
- To samo z materiałem testowym (8 grup, 9 pozycji chronionych): **2 152–2 335 ms** — koszt niosą
  źródło `repo` (`git status --ignored`) i bramki `opisane` / `wiązane testami`, nie chodzenie po
  katalogu roboczym.
- Katalog **25 000 plików**, samo źródło `work`: **1 324 ms**, wynik z `niepelne: true` przy
  `LIMIT_WPISOW = 20000`.
- Cel planu dla hooka: **poniżej 300 ms** na katalogu 30 MB / 3 000 plików (SZACUNEK, ryzyko 3).
  Liczby wyżej mówią, gdzie szukać: hook ma **nie** wołać źródła `repo`.

**Wynik pomiaru bramki hooka (ryzyko 7 planu, FAKT, 2026-09-03):** `node
.claude/relai/tools/clean-work.js kasuj <lista>` uruchomione narzędziem `Bash` z katalogu projektu,
z pozycją w `os.tmpdir()`, **przeszło** — pozycja skasowana, kod wyjścia 0, żaden komunikat bramki
nie padł. Ścieżka „narzędzie wypisuje listę do ręcznego skasowania" jest zaimplementowana, ale
**nie została wywołana przez realną blokadę**.

**Czego jeszcze NIE ma (to jest zakres tego etapu):** funkcji `artefaktyRobocze` /
`artefaktyRoboczeReport` w `session-signals.js`; wywołania w żadnym z dwóch hooków `session-context`;
wiersza `Artefakty robocze` w `SPEC_USTAWIENIA.md` ani w `docs/USTAWIENIA.md`; wiersza 18 w katalogu
progów; szóstego wiersza nietykalnego w rotacji ustawień; kroku **2a** w skillu `relai-core` ani
w `relai-core.mdc`; wzmianki o sprzątaniu w linii fraz sesji `SPEC_CLAUDE_MD.md` i `CLAUDE.md`.

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

**Lekcje z E1 bez pozycji w destylacie** („Zasady aktywne" mają 15 przy limicie 15; nowa pozycja
wchodzi wyłącznie przez kompresję tematyczną za zgodą człowieka). Obowiązują w tym etapie:

- **L-0076** — `git grep` przeszukuje **indeks**, nie drzewo robocze: kryterium oparte na nim dla
  treści wprowadzanej przez ten sam etap stawiasz z `--untracked` albo po `git add`.
- **L-0077** — „na korzyść ochrony" rozstrzygasz **niepewność**, nie pustkę; regułę ochronną
  sprawdzasz także na stanie **po** własnym działaniu.
- **L-0078** — nowy, niezacommitowany plik produktu wygląda dla sprzątacza jak śmieć; granicą jest
  indeks gita, więc przy sprzątaniu w trakcie etapu nazywasz wprost, które grupy są dorobkiem sesji.

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/SPRZATANIE_ARTEFAKTOW/E2/`.** Wszystko
tymczasowe — skrypty pomiarowe, materiał kontrolowany, kopie projektów — powstaje tam. Katalog
powstaje przy pierwszym zapisie i jest sprzątany w punkcie 8.

1. **`core/process/session-signals.js` — `artefaktyRobocze(cwd, opcje)`**: cienka warstwa nad
   rdzeniem. `require` na `./work-artifacts.js` (oba pliki żyją w katalogu pluginu, więc to
   dozwolone — inaczej niż w kopii projektowej). Funkcja: czyta wiersz `Artefakty robocze`
   z `docs/USTAWIENIA.md` (kotwica + próg), woła pomiar **wyłącznie ze źródeł `work` i `temp`**
   (`git status` na starcie nie wchodzi — ryzyko 3), zwraca `{wlaczone, progMB, sumaMB, pozycji,
   najciezsze[3], nierozpoznana}`. Wzorzec do naśladowania: `startCost` / `sprawyPrzeterminowane`
   — miara osobno, formatowanie osobno. Wiersza nie ma → `{wlaczone:false, brakWiersza:true}`.
2. **`artefaktyRoboczeReport(miara, opcje)`** w tym samym pliku: zwraca **tablicę linii** (pustą,
   gdy cisza), z opcją `interaktywna` jak `startCostReport`. **Dokładnie jedna** linia
   `[RelAI artefakty robocze]`: waga, liczba pozycji, najwyżej trzy najcięższe z pochodzeniem,
   reszta jako liczba, na końcu propozycja `/relai-clean`. Sesja nieinteraktywna → ta sama linia
   **bez** propozycji. Wartość kotwicy nierozpoznana → jedna linia o nierozpoznanej wartości
   z dozwolonymi brzmieniami (`włączone` / `wyłączone` / `on` / `off`) — nigdy cisza (ryzyko 6).
   Poniżej progu, przy `wyłączone`, przy braku wiersza i w projekcie starszym niż 1.8.0 → **zero
   linii**.
3. **Oba hooki `session-context`** — `adapters/claude-code/hooks/session-context.js`
   i `adapters/cursor/hooks/session-context.js`: wywołanie obok istniejących raportów, w Cursorze
   z `{ interaktywna: input.is_background_agent !== true }`. Kolejność linii w raporcie startu
   ustalasz świadomie i zapisujesz ją we wpisie dziennika.
4. **`core/templates/SPEC_USTAWIENIA.md`** — trzy miejsca: (a) sekcja opisująca wiersz
   `| <data> | Artefakty robocze | włączone · 100 MB |` z kotwicą, zamkniętą listą brzmień
   i zachowaniem przy wartości nierozpoznanej; (b) **wiersz 18** katalogu progów: próg, kto czyta
   (hook startu i krok 2a rytuału), adres egzekwowania; (c) wiersz dołączony do listy nietykalnych
   w rotacji ustawień — **było pięć, ma być sześć**.
5. **`docs/USTAWIENIA.md` tego repozytorium** — wiersz `| 2026-… | Artefakty robocze | włączone ·
   100 MB |`. Zapis przechodzi przez hook `config-protection`, który poprosi o potwierdzenie —
   to jest w porządku, nie obchodzisz go.
6. **Krok 2a rytuału zamknięcia** w `adapters/claude-code/skills/relai-core/SKILL.md`
   i `adapters/cursor/rules/relai-core.mdc`: **po** rotacji (krok 2), **przed** wpisem dziennika.
   Numeracji kroków 1–6 **nie ruszasz**. Treść: raport artefaktów; pytania **wyłącznie** o katalogi
   etapów zamkniętych i o całość ponad progiem; poniżej progu i bez zamkniętych etapów — cisza;
   kasowanie po „tak", liczby do wpisu sesji; krok **nie** produkuje własnego komunikatu poza
   wpisem (ryzyko 8).
7. **Linia fraz sesji** — `core/templates/SPEC_CLAUDE_MD.md` i `CLAUDE.md` tego repozytorium:
   „kończymy na dziś" → … przegląd ryzyk, **sprzątanie artefaktów**, propozycja commita.
8. **Pomiar czasu hooka** — skrypt w katalogu roboczym etapu (wyrażenia regularne w pliku, nie
   w `node -e`): czas `artefaktyRobocze` na (a) czystym repozytorium, (b) katalogu **30 MB /
   3 000 plików** utworzonym przez skrypt, (c) katalogu ponad `LIMIT_WPISOW`. Liczby idą do wpisu
   dziennika i do ryzyka 3. Cel: **poniżej 300 ms** dla (b) — SZACUNEK z planu. Przekroczenie →
   próg wpisów w dół, **nigdy** wyłączenie mechanizmu. Materiał sprzątasz `/relai-clean`.
9. **`docs/ARTEFAKTY.md`** — podbicie wersji artefaktów zmienionych w tym etapie: skill
   `relai-core` (krok 2a), reguła `relai-core.mdc`, `SPEC_USTAWIENIA.md`, `SPEC_CLAUDE_MD.md`.
   `session-signals.js` i hooki są **nośnikiem** — do rejestru nie wchodzą.
10. **Bez podbicia wersji** (E4) i **bez dopisywania `/relai-clean` do `docs/KOMENDY.md`** (E4).
    Sprawdź `git grep -n --untracked "1\.8\.0"`: dozwolone trafienia to plan, prompty, skill,
    komenda i dokumenty procesu; żadne w `MANIFEST.json`, `plugin.json`, `marketplace.json`.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `node core/tools/validate-adapters.js` kończy się kodem 0.
- [ ] **Cisza poniżej progu jest nienaruszalna:** hook startu uruchomiony na tym repozytorium
      (payload `SessionStart` przez stdin) daje **zero** linii `[RelAI artefakty robocze]` —
      przy pustym `work/` i `%TEMP%` bez pozycji projektu. Dowód: pełne wyjście hooka wklejone
      do wpisu, nie samo zdanie „cisza".
- [ ] **Powyżej progu pada dokładnie jedna linia.** Materiał kontrolowany ponad 100 MB w katalogu
      roboczym → wyjście hooka ma **jedno** wystąpienie `[RelAI artefakty robocze]`, najwyżej
      **trzy** pozycje wypisane z nazwy, resztę jako liczbę i propozycję `/relai-clean`.
- [ ] **Oba warianty w jednym przebiegu** (zasada 4): ten sam materiał, wiersz `włączone` →
      linia jest; wiersz `wyłączone` → linii nie ma, a pozostałe raporty startu są **identyczne**
      (porównanie wyjścia bajt w bajt poza tą linią).
- [ ] **Wartość nierozpoznana nie milczy:** wiersz z wartością spoza listy (np. `tak · 100 MB`) →
      linia o nierozpoznanej wartości z wypisanymi dozwolonymi brzmieniami. Brak wiersza → cisza,
      bez komunikatu o błędzie.
- [ ] **Sesja nieinteraktywna** (Cursor, `is_background_agent: true`) → ta sama linia **bez**
      propozycji `/relai-clean`; oba warianty w jednym przebiegu.
- [ ] **Limit sześciu linii raportu startu** (ryzyko 8): projekt z pełnym zestawem przekroczeń
      (budżet startu + progi dokumentów + sprawy przeterminowane + artefakty robocze) mieści się
      w **6 liniach** — policzone na materiale, nie oszacowane.
- [ ] **Czas**: `artefaktyRobocze` na katalogu 30 MB / 3 000 plików **poniżej 300 ms**; liczba
      zanotowana. Punkt niespełniony → obniżasz `LIMIT_WPISOW`, notujesz obie wartości i mierzysz
      ponownie; wyłączenie mechanizmu nie jest rozwiązaniem.
- [ ] **Krok 2a nie przenumerował rytuału** (dowód negatywny): `git grep -n "krok 2\b\|kroku 2\b"`
      w skillu, regułach Cursora i specyfikacjach zwraca te same odwołania co przed zmianą —
      wypisz je przed i po.
- [ ] `docs/USTAWIENIA.md` ma wiersz `Artefakty robocze`, a `progiZKomorki` / odpowiednik czyta
      z niego **100** — sprawdzone wywołaniem funkcji na treści pliku, nie odczytem wzrokowym.
- [ ] `SPEC_USTAWIENIA.md`: katalog progów ma **18 wierszy**, lista nietykalnych w rotacji
      ustawień ma **sześć** pozycji.
- [ ] `CLAUDE.md` i `SPEC_CLAUDE_MD.md` wymieniają sprzątanie artefaktów w linii frazy
      „kończymy na dziś".
- [ ] `docs/ARTEFAKTY.md` ma podbite wersje czterech artefaktów tego etapu; hook `profile-rules`
      nie ostrzega po zapisie.
- [ ] Wersja **nie** podbita: `MANIFEST.json`, `plugin.json`, `marketplace.json` mają `1.7.0`.
- [ ] Katalog roboczy etapu `.claude/relai/work/SPRZATANIE_ARTEFAKTOW/E2/` sprzątnięty
      `/relai-clean` po potwierdzeniu; liczby przed i po we wpisie; `%TEMP%` bez pozycji `relai-*`.
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy", z autorem `RelAI (Opus) + Lukasz`;
      `docs/STATE.md` nadpisany; `git status --short` pokazuje wyłącznie zamierzone zmiany.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/SPRZATANIE_ARTEFAKTOW/STATUS.md`: E2 → **ZREALIZOWANY 2026-…** (data z kontekstu
   sesji), E3 → **GOTOWY DO STARTU** z linkiem do `PROMPT_ETAP_3.md`; jedna linia wynikowa
   w dzienniku wdrożenia; nierozstrzygnięte pozycje „Do zrobienia przez człowieka" jako bramki
   `OTWARTA`. Bramka **„Raport `/relai-clean` na PolyFlow"** zostaje otwarta, dopóki ktoś nie
   uruchomi raportu w tamtym folderze — jeśli zrobisz to w tym etapie, zamknij ją z wynikiem.
2. `docs/DZIENNIK.md`: wpis wg `SPEC_DZIENNIK.md` (Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka) na końcu sekcji „Wpisy". W tabeli „Stan
   otwartych ryzyk" **zaktualizuj ryzyko 3 planu** (czas hooka) zmierzonymi liczbami oraz ryzyka
   **S1** i **S2** o wynik z tego etapu. Lekcje → `docs/LEKCJE.md`; „Zasady aktywne" mają **15
   pozycji przy limicie 15** — nowa zasada wchodzi wyłącznie przez kompresję tematyczną za zgodą
   człowieka.
3. `docs/STATE.md` — nadpisz: „Co działa" dostaje zdanie na starcie sesji i krok 2a; „Nad czym
   pracujemy teraz" — E3 gotowy; liczby (progi w katalogu, artefakty w rejestrze, etapy planu).
4. **Wygeneruj `PROMPT_ETAP_3.md`** w tym folderze ze specyfikacji
   `.claude/relai/templates/SPEC_PROMPT_ETAPU.md`: na bazie `PLAN.html` sekcja 6 (E3 — prewencja
   w etapach i odnogach), **realnego stanu po tym etapie** (nazwy funkcji w `session-signals.js`,
   kształt linii raportu, zmierzone czasy, numeracja kroku 2a) i lekcji z tego etapu. Katalog
   roboczy E3: `.claude/relai/work/SPRZATANIE_ARTEFAKTOW/E3/`.
5. Commit + push: `feat(clean): report work artifacts on session start and clean them on close`
   (zakres w treści commita: funkcje rdzenia, oba hooki, wiersz ustawień, krok 2a, linia fraz,
   rejestr). Commit wyłącznie za zgodą.
