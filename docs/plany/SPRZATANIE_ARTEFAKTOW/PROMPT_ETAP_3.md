# PROMPT_ETAP_3 — Prewencja: katalog roboczy nazwany z góry w etapach i odnogach

Plan: SPRZATANIE_ARTEFAKTOW • Etap: **E3 z E4** • Wygenerowano: 2026-09-03 (autor: Opus, w rytuale
„Na koniec" E2) • Wykonawca: **Opus** (D-85 — model wykonawczy etapów w tym projekcie)

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus**. Jeśli sesja działa na innym
> modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, reguły profilu `prompty` (rejestr artefaktów), definicja ukończenia, sekcja niemutowalna; linia fraz sesji **jest już zmieniona w E2** — nie ruszasz jej |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (**S1** i **S2** z wynikiem dwóch etapów) + wpis z 2026-09-03 „E2: jedno zdanie na starcie sesji i krok 2a rytuału zamknięcia" — stamtąd bierzesz zmierzone czasy, kształt linii raportu i to, czego E2 **nie** zweryfikował |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |
| `docs/plany/SPRZATANIE_ARTEFAKTOW/PLAN.html` | sekcja 6 (zakres E3 — jedyne źródło zakresu), sekcja 5 („Cztery momenty" — wiersz „zamknięcie etapu"), sekcja 7 (ryzyka 1, 4, 8), sekcja 8 (przypadki brzegowe dotyczące etapu w toku) |
| `.claude/relai/templates/SPEC_PROMPT_ETAPU.md` | **plik, który zmieniasz**: sekcja „7. Zakres etapu" (linia otwierająca), sekcja „8. Weryfikacja" (**linia 129** — „brak plików tymczasowych") i przykład na końcu (**linia 255** — ten sam martwy punkt w postaci checkboxa) |
| `.claude/relai/templates/SPEC_ODNOGA.md` | **plik, który zmieniasz**: sekcje „7. Zakres i weryfikacja" oraz „8. Na koniec — rytuał zamknięcia odnogi" w części `PROMPT_ODNOGA.md`, plus przykład na końcu |
| `adapters/claude-code/skills/relai-planning/SKILL.md` | sekcja „Rytuał »Na koniec« etapu" (sześć punktów) i „Prompty etapowe (D-34)" — lista dziewięciu elementów układu |
| `adapters/cursor/rules/relai-planning.mdc` | ten sam rytuał w regule zawsze-w-kontekście adaptera Cursora (91 linii — całość jest krótka) |
| `adapters/claude-code/commands/relai-stage.md` | Krok 4 — karta potwierdzenia; tam dochodzi ścieżka katalogu roboczego |
| `adapters/claude-code/commands/relai-branch.md` | odpowiednik karty w komendzie odnogi |
| `adapters/claude-code/skills/relai-core/SKILL.md` | sekcja „Sprzątanie artefaktów roboczych (krok 2a…)" — **wzorzec brzmienia**, którego nie powtarzasz, tylko cytujesz jako adres |
| `docs/PULAPKI.md` | P-003 (PowerShell 5.1 i UTF-8), P-004 (`acceptEdits` a Bash) |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Katalog roboczy etapu ma jeden kształt:** `.claude/relai/work/<TEMAT>/E<N>/`, odnogi —
  `.claude/relai/work/<TEMAT>/<NAZWA_ODNOGI>/`, sesja bez etapu — `.claude/relai/work/_sesja/<data>/`.
  To jest zaimplementowane w `core/process/work-artifacts.js` (E1) i **rozpoznawane po ścieżce**.
  Nie wymyślasz nowego układu i nie dokładasz drugiego korzenia.
- **Krok rytuału zamknięcia sesji ma numer `2a`** (E2). Numeracji kroków 1–6 **nie ruszasz**:
  „krok 2" jest cytowany jako adres rotacji w jedenastu miejscach, co E2 udowodnił dowodem
  negatywnym. Rytuał „Na koniec" **etapu** ma sześć punktów i tej numeracji też nie zmieniasz —
  sprzątanie wchodzi tam jako część punktu istniejącego albo jako punkt oznaczony literą.
- **Marker `# relai: zachowaj`** i **próg 100 MB** są rozstrzygnięte (bramki `ROZSTRZYGNIĘTE`
  2026-09-03). Nie negocjujesz brzmień ani wartości.
- **Wyłącznik nie dotyczy weryfikacji etapu.** Wiersz `Artefakty robocze: wyłączone` wycisza start
  sesji i krok 2a, ale punkt „katalog roboczy przejrzany i sprzątnięty" jest częścią **definicji
  ukończenia etapu** i działa zawsze (przypadek brzegowy 13 planu).
- **Prompty etapów już zrealizowanych zostają bez zmian** (D-34). Nie wracasz do
  `PROMPT_ETAP_1.md` ani `PROMPT_ETAP_2.md`, choć oba mają już katalog roboczy wpisany ręcznie.
- **Granica zakresu:** `SPEC_KOMENDY.md`, `docs/KOMENDY.md`, README z ikoną `clean.svg`,
  `relai-update.md`, podbicie wersji do **1.8.0**, sekwencja P-005, pomiar na PolyFlow —
  **E4**. W tym etapie **nie podbijasz wersji** i **nie dopisujesz `/relai-clean` do dokumentu
  użytkownika**.
- **Ten etap nie dotyka kodu.** `session-signals.js`, `work-artifacts.js` i hooki są gotowe
  i zmierzone. E3 to **same specyfikacje, skille, reguły i dwie komendy** — jeśli sięgasz po plik
  `.js`, to znaczy, że wyszedłeś poza zakres.

## Stan wyjściowy (co realnie zastajesz po E2)

Repozytorium na **1.7.0** (`MANIFEST.json`, `plugin.json`, `marketplace.json` — walidator melduje
„3 zrodel, wartosc 1.7.0"); plugin zainstalowany globalnie w tej samej wersji, więc **komendy,
skille i specyfikacje testujesz z plików repo, nie z cache'u pluginu** (P-005). Uwaga praktyczna:
hook startu **nadpisuje** `.claude/relai/templates/` treścią **zainstalowanego pluginu 1.7.0**, więc
lokalna kopia specyfikacji potrafi być starsza niż `core/templates/` w repozytorium — źródłem prawdy
jest `core/templates/`, a `.claude/relai/templates/` jest cache'em.

Plan SPRZATANIE_ARTEFAKTOW: E1 i E2 `ZREALIZOWANE 2026-09-03`, ten etap jest trzeci, E4 ostatni.
**Katalog roboczy tego etapu: `.claude/relai/work/SPRZATANIE_ARTEFAKTOW/E3/`** — wszystko tymczasowe
powstaje tam, a artefakt, który z natury musi leżeć poza projektem, wpisujesz do wpisu dziennika
z nazwy. Katalog roboczy E2 został sprzątnięty (141,2 MB → 0), `work/` jest puste.

```
core/
  process/work-artifacts.js       # E1: pomiar, grupy, bramka, kasowanie. BEZ ZMIAN w tym etapie.
  process/session-signals.js      # E2: +artefaktyRobocze / artefaktyRoboczeReport (zrodla work+temp,
                                  #   wlasna para wzorcow ARTEFAKTY_WLACZONE / _WYLACZONE).
                                  #   BEZ ZMIAN w tym etapie.
  templates/SPEC_PROMPT_ETAPU.md  # 269 linii. DO ZMIANY: sekcja 7 (linia otwierajaca zakresu),
                                  #   sekcja 8 linia 129 ("brak plikow tymczasowych") i przyklad
                                  #   linia 255 (checkbox z tym samym brzmieniem).
  templates/SPEC_ODNOGA.md        # 271 linii. DO ZMIANY: PROMPT_ODNOGA.md sekcje 7 i 8 + przyklad.
  templates/SPEC_USTAWIENIA.md    # E2: wiersz "Artefakty robocze", katalog progow 18 wierszy,
                                  #   lista nietykalnych 6 pozycji. BEZ ZMIAN.
  templates/SPEC_CLAUDE_MD.md     # E2: linia fraz sesji ze sprzataniem. BEZ ZMIAN.
adapters/claude-code/
  skills/relai-planning/SKILL.md  # 560 linii. DO ZMIANY: rytual "Na koniec" etapu (6 punktow),
                                  #   lista dziewieciu elementow promptu etapowego.
  skills/relai-core/SKILL.md      # E2: krok 2a + sekcja o markerze. BEZ ZMIAN — wzorzec brzmienia.
  commands/relai-stage.md         # 148 linii. DO ZMIANY: Krok 4, karta potwierdzenia.
  commands/relai-branch.md        # 120 linii. DO ZMIANY: karta potwierdzenia odnogi.
  commands/relai-clean.md         # E1. BEZ ZMIAN.
adapters/cursor/
  rules/relai-planning.mdc        # 91 linii. DO ZMIANY: ten sam rytual po angielsku.
  rules/relai-core.mdc            # E2: krok 2a, szosty wiersz nietykalny. BEZ ZMIAN.
docs/
  USTAWIENIA.md                   # 6 wierszy maszynowych (od E2)
  ARTEFAKTY.md                    # 39 pozycji; SPEC_USTAWIENIA 2, SPEC_CLAUDE_MD 2,
                                  #   relai-core/SKILL.md 3, relai-core.mdc 2
  LEKCJE.md                       # 27 lekcji aktywnych, ostatnia L-0081;
                                  #   "Zasady aktywne" 15 przy limicie 15
.claude/relai/
  work/                           # PUSTY po sprzataniu E2
  tools/clean-work.js             # kopia narzedzia podkladana przez hook startu
```

**Zmierzone w E2 — liczby, które wchodzą do treści, jaką piszesz (FAKT, 2026-09-03):**

- `artefaktyRobocze` (źródła `work` + `temp`): projekt bez katalogu roboczego **35 ms**, katalog
  **30 MB / 3 000 plików — 116 ms**, katalog **20 500 plików — 720 ms** z `niepelne: true`.
- To samo ze źródłem `repo`: **77 ms** na czystym repozytorium, ale **2 152–2 335 ms** na materiale
  z E1 — dlatego hook startu tego źródła nie woła, a komenda woła.
- Sprzątanie po E2: **141,2 MB / 1 pozycja przed, 0,0 MB po**, 5 pozycji chronionych.
- Raport startu przy pełnym zestawie przekroczeń: **14 linii**, z czego `[RelAI artefakty robocze]`
  **1**. Limit sześciu linii jest własnością raportu budżetu (tam 5 z 6), nie sumy bloków —
  rozstrzygnięte przez właściciela 2026-09-03.

**Warunki pracy:** Node **24.13.1** na `PATH` (FAKT). PowerShell 5.1 psuje polskie znaki przy
odczycie — dokumentów przez niego nie przepuszczaj (P-003). Polecenia Bash nie wchodzą
w `acceptEdits` (P-004). Ścieżkę Windows w payloadzie hooka podawaj **z ukośnikami zwykłymi**,
inaczej `JSON.parse` rzuca, a hook milczy tak samo jak przy braku markera — czyli instrument
produkuje fałszywy dowód na korzyść tezy (**L-0081**).

**Czego jeszcze NIE ma (to jest zakres tego etapu):** linii o katalogu roboczym w sekcji „7. Zakres
etapu" `SPEC_PROMPT_ETAPU.md`; punktu weryfikacji o katalogu roboczym w miejscu martwego „brak
plików tymczasowych" (linie 129 i 255); tego samego w `SPEC_ODNOGA.md` dla `PROMPT_ODNOGA.md`;
wzmianki o katalogu roboczym w rytuale „Na koniec" etapu w skillu `relai-planning` i w regule
`relai-planning.mdc`; ścieżki katalogu roboczego w kartach potwierdzenia `/relai-stage`
i `/relai-branch`.

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

**Lekcje z E1 i E2 bez pozycji w destylacie** („Zasady aktywne" mają 15 przy limicie 15; nowa
pozycja wchodzi wyłącznie przez kompresję tematyczną za zgodą człowieka). Obowiązują w tym etapie:

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
  którego poprawnym wynikiem jest cisza, sprawdzaj **parą przebiegów**.

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/SPRZATANIE_ARTEFAKTOW/E3/`.** Wszystko
tymczasowe powstaje tam. Katalog powstaje przy pierwszym zapisie i jest sprzątany w punkcie 7.

1. **`core/templates/SPEC_PROMPT_ETAPU.md`, sekcja „7. Zakres etapu"** — sekcja zakresu **otwiera
   się linią z katalogiem roboczym etapu** i regułą: wszystko tymczasowe powstaje w
   `.claude/relai/work/<TEMAT>/E<N>/`, a artefakt, który z natury musi leżeć poza projektem
   (`%TEMP%`, katalog domowy, klon cudzego repozytorium), jest wpisywany do wpisu dziennika
   **z nazwy**. Podajesz kształt ścieżki dosłownie — świeża sesja ma go przepisać, nie wymyślić.
2. **`core/templates/SPEC_PROMPT_ETAPU.md`, sekcja „8. Weryfikacja", linia 129** — martwy punkt
   „uprzątnięte foldery testowe, brak plików tymczasowych" (mówi wyłącznie o repozytorium)
   zastępujesz punktem o dwóch częściach: **(a)** katalog roboczy etapu przejrzany raportem
   i skasowany po „tak", z liczbami przed i po do wpisu dziennika; **(b)** artefakty **poza** tym
   katalogiem wypisane z nazwy. Brzmienie ma być takie, żeby dało się je przepisać do promptu
   etapowego jako gotowy checkbox.
3. **`core/templates/SPEC_PROMPT_ETAPU.md`, przykład, linia 255** — checkbox „Dane testowe usunięte
   z bazy deweloperskiej; brak plików tymczasowych w repo" dostaje ten sam nowy kształt. Przykład
   jest częścią specyfikacji, nie ozdobą (zasada 1) — punkt przepisany tylko w części normatywnej
   nie trafi do promptów. **Numeracji sekcji 1–9 nie ruszasz.**
4. **`core/templates/SPEC_ODNOGA.md`** — to samo dla `PROMPT_ODNOGA.md`: sekcja „7. Zakres
   i weryfikacja" otwiera się katalogiem roboczym odnogi
   (`.claude/relai/work/<TEMAT>/<NAZWA_ODNOGI>/`), a sekcja „8. Na koniec — rytuał zamknięcia
   odnogi" dostaje punkt o sprzątnięciu tego katalogu. Przykład na końcu pliku — tak samo.
   **Odnoga nie ma promptu następnej odnogi**, więc niczego w tej sprawie nie dopisujesz.
5. **Skill `adapters/claude-code/skills/relai-planning/SKILL.md`** — dwa miejsca: (a) w rytuale
   „Na koniec" etapu sprzątanie katalogu roboczego staje się częścią kroku istniejącego
   (rekomendacja: krok 4, razem z dokumentami projektu) albo krokiem **oznaczonym literą** —
   sześciu numerów nie zmieniasz; (b) w opisie dziewięciu elementów promptu etapowego elementy 7
   i 8 wspominają o katalogu roboczym, żeby generacja promptu nie zależała od pamięci modelu.
6. **Reguła `adapters/cursor/rules/relai-planning.mdc`** — ten sam rytuał, po angielsku, w tym
   samym miejscu. To jedyny nośnik rytuału w Cursorze (P2).
7. **Komendy `relai-stage.md` i `relai-branch.md`** — karta potwierdzenia pokazuje **ścieżkę
   katalogu roboczego** tego etapu (odnogi) jako osobną pozycję. Karta jest miejscem, w którym
   człowiek widzi, gdzie powstaną pliki, **zanim** cokolwiek powstanie. `/relai-stage` — Krok 4;
   `/relai-branch` — jego odpowiednik. **Zakazów obu komend nie ruszasz.**
8. **`docs/ARTEFAKTY.md`** — podbicie wersji artefaktów zmienionych w tym etapie:
   `SPEC_PROMPT_ETAPU.md`, `SPEC_ODNOGA.md`, skill `relai-planning`, reguła `relai-planning.mdc`,
   komendy `relai-stage.md` i `relai-branch.md`.
9. **Bez podbicia wersji** (E4) i **bez dopisywania `/relai-clean` do `docs/KOMENDY.md`** (E4).
   Sprawdź `git grep -n --untracked "1\.8\.0"`: dozwolone trafienia to plan, prompty, skille,
   komendy, reguły, rdzeń, specyfikacje i dokumenty procesu; żadne w `MANIFEST.json`,
   `plugin.json`, `marketplace.json`.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `node core/tools/validate-adapters.js` kończy się kodem 0.
- [ ] **Martwy punkt zniknął, nowy jest w obu miejscach:**
      `git grep -n --untracked "brak plików tymczasowych"` w `core/templates/` zwraca **zero**
      trafień, a punkt o katalogu roboczym stoi **i w części normatywnej, i w przykładzie**
      `SPEC_PROMPT_ETAPU.md` (wypisz obie linie).
- [ ] **Dowód obecności, nie tylko braku** (zasada 14): w każdym z sześciu zmienionych plików
      wypisz linię, która niesie ścieżkę `.claude/relai/work/` — sześć trafień, każde z nazwą pliku.
- [ ] **Numeracja nietknięta** (dowód negatywny): sekcje `SPEC_PROMPT_ETAPU.md` mają nadal
      dziewięć elementów w tej samej kolejności, a rytuał „Na koniec" etapu w skillu
      `relai-planning` — sześć numerowanych punktów. Wypisz nagłówki przed i po.
- [ ] **Krok 2 rytuału zamknięcia sesji nadal ma 11 odwołań** (`git grep` po
      `krok 2 | kroku 2 | step 2` w skillach, regułach i specyfikacjach) — E3 nie dotyka tej
      numeracji ani razu.
- [ ] **Prompt wygenerowany po zmianie naprawdę niesie katalog roboczy:** `PROMPT_ETAP_4.md`,
      który wygenerujesz w rytuale „Na koniec" tego etapu, ma linię z
      `.claude/relai/work/SPRZATANIE_ARTEFAKTOW/E4/` w sekcji „Zakres etapu" **i** punkt
      weryfikacji o sprzątnięciu tego katalogu. To jest pierwszy realny test tej zmiany.
- [ ] Katalog roboczy etapu `.claude/relai/work/SPRZATANIE_ARTEFAKTOW/E3/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po potwierdzeniu; liczby przed
      i po we wpisie; `%TEMP%` bez pozycji `relai-*` i bez pozycji z nazwą projektu.
- [ ] `docs/ARTEFAKTY.md` ma podbite wersje sześciu artefaktów tego etapu; hook `profile-rules`
      nie ostrzega po zapisie (sprawdź wywołaniem hooka, nie założeniem).
- [ ] Wersja **nie** podbita: `MANIFEST.json`, `plugin.json`, `marketplace.json` mają `1.7.0`.
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy", z autorem `RelAI (Opus) + Lukasz`;
      `docs/STATE.md` nadpisany; `git status --short` pokazuje wyłącznie zamierzone zmiany.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/SPRZATANIE_ARTEFAKTOW/STATUS.md`: E3 → **ZREALIZOWANY 2026-…** (data z kontekstu
   sesji), E4 → **GOTOWY DO STARTU** z linkiem do `PROMPT_ETAP_4.md`; jedna linia wynikowa
   w dzienniku wdrożenia; nierozstrzygnięte pozycje „Do zrobienia przez człowieka" jako bramki
   `OTWARTA`. Trzy bramki są otwarte i wchodzą do E4: **ikona `clean.svg`**, **markery w PolyFlow**
   i **raport `/relai-clean` na PolyFlow** — jeśli któraś zostanie rozstrzygnięta w tym etapie,
   zamknij ją z wynikiem.
2. `docs/DZIENNIK.md`: wpis wg `SPEC_DZIENNIK.md` (Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka) na końcu sekcji „Wpisy". Przejrzyj ryzyka
   **S1** i **S2**. Lekcje → `docs/LEKCJE.md`; „Zasady aktywne" mają **15 pozycji przy limicie 15** —
   nowa zasada wchodzi wyłącznie przez kompresję tematyczną za zgodą człowieka.
3. `docs/STATE.md` — nadpisz: „Co działa" dostaje zdanie o prewencji w promptach etapowych
   i odnogach; „Nad czym pracujemy teraz" — E4 gotowy; liczby (artefakty w rejestrze, etapy planu,
   lekcje).
4. **Wygeneruj `PROMPT_ETAP_4.md`** w tym folderze ze specyfikacji
   `.claude/relai/templates/SPEC_PROMPT_ETAPU.md` — **w wersji, którą właśnie zmieniłeś**: na bazie
   `PLAN.html` sekcja 6 (E4 — pomiar na realnych projektach i wydanie 1.8.0), realnego stanu repo
   po tym etapie i lekcji z tego etapu. Katalog roboczy E4:
   `.claude/relai/work/SPRZATANIE_ARTEFAKTOW/E4/`. **E4 jest ostatnim etapem planu** — jego prompt
   ma to powiedzieć wprost i wskazać sekwencję zamknięcia planu.
5. Commit + push: `docs(clean): name the stage work directory in stage and branch prompts`
   (zakres w treści commita: dwie specyfikacje, skill i reguła planowania, dwie komendy, rejestr).
   Commit wyłącznie za zgodą.
