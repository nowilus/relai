# PROMPT_ETAP_1 — Lista modeli per narzędzie i pytanie o model pokazujące nazwy

Plan: REKOMENDACJA_MODELU • Etap: **E1 z E4** • Wygenerowano: 2026-09-03 (autor: Opus 5, przy
akceptacji planu) • Wykonawca: **Opus** (z linii metrycznej `STATUS.md`: „Opus, z ustawień
projektu, D-85")

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus** (D-85). Jeśli sesja działa na
> innym modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna |
| `docs/plany/REKOMENDACJA_MODELU/PLAN.html` | sekcje 2 (cele), 5 (przebieg), 6 (zakres E1), 7 (ryzyka 1 i 2) i **10 (Aneks A — nazwa pliku zamiast katalogu)** |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |
| `core/process/session-signals.js` | `provisionTemplates()` (linia 198), `provisionTools()` (l. 120) i stała `NARZEDZIA` (l. 118) — tędy pliki rdzenia trafiają do projektu; tu dokładasz listę modeli |
| `adapters/claude-code/hooks/session-context.js` | linie 50–53 (wywołanie prowizjonowania) i 143–147 oraz 167–170 (dwa miejsca, w których hook mówi o skopiowanych plikach) |
| `adapters/cursor/hooks/session-context.js` | linia 134 — bliźniacze wywołanie w protokole Cursora, **z tym samym** `destRel: '.claude/relai'` |
| `adapters/claude-code/skills/relai-planning/SKILL.md` | Krok 3, tabela pytania startowego — wiersz **3** (linia 139) to pytanie o model wykonawczy |
| `core/MANIFEST.json` | sekcje `process` i `adapters[].uses` — wzór, jak rdzeń deklaruje swoje pliki |
| `docs/USTAWIENIA.md` | preferencje projektu; wiersz „Model wykonawczy etapów budowy" (D-85) zostaje nietknięty |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Klasy modeli zostają trzy** (mocny / wyważony / tani). Ten etap nie wymyśla nowej taksonomii —
  daje klasom nazwy modeli danego narzędzia. Sekcja 4 planu, wariant A.
- **Nazwy modeli nie wchodzą do rdzenia.** Rdzeń zna klasy i mechanizm dostarczania; nazwy mieszkają
  w adapterze, bo zmieniają się w tempie cudzego narzędzia (P4: adapter konsumuje rdzeń).
- **Listy rozróżnia NAZWA PLIKU, nie katalog** — `Aneks A z 2026-09-03`. Oba adaptery prowizjonują
  do `.claude/relai/` (FAKT, sprawdzone 2026-09-03), więc powstają
  `.claude/relai/MODELE-claude-code.md` i `.claude/relai/MODELE-cursor.md`. Drugiej lokalizacji
  cache'u **nie zakładasz**.
- **Skill nie rozpoznaje narzędzia samodzielnie.** Która lista obowiązuje, mówi **hook startu**
  w jednym zdaniu kontekstu — rozpoznanie zostaje w warstwie obecnej w każdej sesji (L-0030,
  zasada 8).
- **Kopia w projekcie jest trwała.** Prowizjonowanie listy kopiuje plik **tylko wtedy, gdy go nie
  ma** — inaczej niż specyfikacje, które są nadpisywane przy każdym starcie. Bez tego odświeżenie
  z E2 ginęłoby przy pierwszym starcie sesji (ryzyko 2 planu).
- **Lista jest w tym etapie utrzymywana ręcznie, z datą i źródłem każdej pozycji.** Odświeżanie
  komendą to **E2**, próg i przypomnienie to **E3**, kontrola modelu w karcie etapu i walidator to
  **E4** — w tym etapie ich nie dotykasz i nie obiecujesz.
- **Warstwa czytana przez model jest po angielsku, warstwa dla człowieka po polsku**
  (`docs/USTAWIENIA.md`, wpis z 2026-08-12) — dotyczy również nowych plików list.
- **D-85 zostaje**: ten projekt wykonuje etapy na Opusie. Etap zmienia mechanizm rekomendacji, nie
  decyzję tego projektu.

## Stan wyjściowy — co realnie zastajesz (FAKT, 2026-09-03)

RelAI **1.8.1**, wydane, wypchnięte i zainstalowane globalnie (potwierdzone plikiem instalacji
i `gitCommitSha`); dwa adaptery na wspólnym rdzeniu. Plan zaakceptowany dziś, ten etap jest
pierwszy — poprzedniego etapu nie ma, więc stan wyjściowy to stan wydania 1.8.1.

```
core/process/session-signals.js       # provisionTemplates (l.198) kopiuje core/templates/ do
                                      #   <projekt>/.claude/relai/templates/ przy KAZDYM starcie;
                                      #   provisionTools (l.120) kopiuje NARZEDZIA (l.118) do
                                      #   .claude/relai/tools/ — dzis jedna pozycja, clean-work.js
adapters/claude-code/hooks/session-context.js  # l.50-53 wywolanie, l.143 i l.167 dwa wyjscia hooka
adapters/cursor/hooks/session-context.js       # l.134 to samo wywolanie, destRel '.claude/relai'
adapters/cursor/install.js            # l.172 prowizjonowanie przy instalacji, ten sam destRel
adapters/claude-code/skills/relai-planning/SKILL.md  # l.139: wiersz 3 tabeli — pytanie o model,
                                      #   dzis brzmienie klasowe ("model najsilniejszy / najtanszy")
adapters/cursor/rules/relai-planning.mdc       # l.42: model wspomniany TYLKO w karcie etapu;
                                      #   pytania startowego w regule NIE MA
core/MANIFEST.json                    # sekcje process/tools/adapters; wersja 1.8.1
core/templates/SPEC_CLAUDE_MD.md      # l.111-112 i l.290-291: trzy klasy modeli (E4, nie ten etap)
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** żadnego pliku z listą modeli w żadnym
adapterze; żadnej ścieżki, którą taka lista trafia do projektu; żadnego zdania w kontekście startu
mówiącego, która lista obowiązuje; żadnego miejsca, w którym klasa „mocny" zamienia się na nazwę
modelu.

**Dwa fakty, które łatwo przyjąć odwrotnie** (oba sprawdzone 2026-09-03, oba przewróciły założenia
karty odnogi, z której powstał ten plan):

1. **Adapter Cursora kopiuje komendy i skille z adaptera Claude Code** (`install.js`, l. 157 i 166)
   — pytanie o model jest **jedno** dla obu narzędzi. Rozgałęzienie treści skilla nie wchodzi w grę.
2. **Cursor prowizjonuje do `.claude/relai/`, nie do `.cursor/relai/`** — własne `.cursor/` ma na
   reguły, komendy, skille, `hooks.json` i manifest instalacji, ale cache rdzenia jest jeden.

### Zasady aktywne z rejestru lekcji (przepisane w całości, stan na 2026-09-03)

1. **Specyfikacja dokumentu jest kompletna albo martwa:** kończy się realnym przykładem, wypisuje
   wymaganą strukturę w treści (odesłanie nie wystarcza) i ma zapisaną ścieżkę „pytam zamiast
   zmyślać" wraz z formą zapisu luki. (L-0001, L-0011, L-0026)
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — fraza wchodzi do
   `KOMENDY.md` w wersji, w której realnie działa, a forma wywołania jest tą, którą uruchomiłeś
   dosłownie. Komendę wklejaną do dokumentu odpalasz z tej samej powłoki, którą zobaczy czytelnik.
   (L-0002, L-0022, L-0059)
3. **Test „czegoś nie wolno" wymaga dowodu negatywnego:** pokaż, że chroniony fragment ma nadal
   pierwotne brzmienie, nie tylko że nowy wpis powstał. (L-0007)
4. **Dowodzisz efektem, nie zdarzeniem:** stanem pliku, sumą kontrolną, treścią odpowiedzi.
   Kryterium stawiasz na stanie, który kontrolujesz, i na źródle, które artefakt produkuje — nie na
   cudzym strumieniu. Zmianę zachowania pokazujesz **obiema wersjami w jednym przebiegu**,
   a instrument porównawczy implementuje wiernie każdą z nich. **Kryterium stawiasz na poprawności
   wyniku, nie na kierunku liczby, której nie kontrolujesz.** **Kryterium sukcesu sprawdzasz na
   materiale, zanim zaczniesz pracę** — kryterium arytmetycznie nieosiągalne wraca do człowieka
   jako aneks, a nie kończy etap jako niedowieziony punkt. (L-0017, L-0018, L-0040, L-0051, L-0052,
   L-0063, L-0069, L-0082)
5. **Instrument pomiarowy sam bywa źródłem fałszu:** wyrażenia regularne trzymaj w pliku, nie
   w `node -e`; scenariusz „konfiguracji nie ma" mierz z podstawionym katalogiem domowym; dokładaj
   przypadek, który **musi** trafić. Zero trafień przy niepustych zbiorach to defekt instrumentu,
   dopóki nie udowodnisz inaczej; każdy przypadek graniczny ma własną kontrolę na wyjściu.
   **Instrument porównujący dwa drzewa odtwarza materiał przed każdym wariantem** i dowodzi na
   końcu, że materiał wyszedł nietknięty (L-0083). Wyczerpany limit konta zatrzymuje pomiar i idzie
   do odnogi. (L-0032, L-0037, L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083)
6. **Próg jest liczbą, którą ktoś liczy:** kalibruj go na zmierzonych plikach realnych projektów,
   zapisuj w jednostce mechanizmu kontrolnego wraz z komendą sprawdzającą i daj mu **jeden**
   wyzwalacz. **Próg porównuj do wielkości, którą mechanizm kontroluje**, a sygnał o zatkaniu
   wyzwalaj **różnicą między możliwym a wykonanym**, nie zerem wykonanego. (L-0034, L-0049, L-0053,
   L-0060, L-0065)
7. **Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień:** dopasowanie od początku
   komórki, wybór linii po niesionej wartości (nie po kolejności), wartość nierozpoznana znaczy
   cisza. **Rdzeń słowa w języku z diakrytykami łapiesz klasą znaków tego języka, nie `\w`.**
   **Rdzenia szukasz w samym brzmieniu wartości, nie w całej komórce.** **Zamknięta lista ma koszt
   po drugiej stronie i ten koszt mierzysz.** (L-0025, L-0035, L-0048, L-0066, L-0070, L-0074)
8. **Zachowanie, które ma działać zawsze, mieszka w warstwie obecnej w każdej sesji** —
   `CLAUDE.md` projektu albo hook; skill dokłada procedurę i wyzwala się zawodnie, a komenda
   wywołana wprost go nie ładuje. Sygnał, który ma paść raz, ma jednego właściciela; cisza
   właściciela znaczy „sprawdzone i zgodne". (L-0015, L-0030, L-0036)
9. **Skill nie zakłada dostępu do niczego poza katalogiem roboczym** — ani do katalogu pluginu, ani
   do domowego. Opis zaczynaj od `MUST BE USED`, markera projektu i płaskiej listy fraz; każdy krok
   sięgający dalej ma zapisane wyjście po odmowie dostępu. (L-0009, L-0010, L-0012, L-0023)
10. **Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI**, zachowania mierzysz
    świeżą sesją, a po podbiciu numeru przepuszczasz repo `grep`-em po starym i rozstrzygasz każde
    trafienie — także w treści komend, skilli i specyfikacji, dzieląc je na wzmianki historyczne
    i deklaracje stanu docelowego. (L-0004, L-0008, L-0020, L-0061)
11. **Końce linii są wariantem, nie szczegółem.** Sumy kontrolne porównuj po normalizacji
    CRLF → LF; w regexie nad pojedynczą linią nie zakotwiczaj końca. **Kolejność wpisów
    w dokumencie jest takim samym wariantem.** **Wariantem jest też stan dokumentu wobec własnej
    specyfikacji** — mechanizm sprawdzaj na dokumencie realnego projektu. (L-0033, L-0038, L-0057,
    L-0062, L-0067)
12. **Guardrail zatrzymujący treść, która sekretem nie jest, to defekt rdzenia** — poprawka wraca
    z dowodem, nigdy jako obejście. Znak cudzysłowu — także backtick — należy do grupy cudzysłowu,
    nigdy do klasy wartości. (L-0043, L-0045, L-0046, L-0072)
13. **Cudze narzędzie poznajesz z wydanego builda i z próby**, nie z dokumentacji: payload parsuj
    po zdjęciu BOM i bez założeń o nazwach pól, sesję CLI uruchamiaj z powłoki natywnej, a brak
    sygnału konfrontuj najpierw z **warunkiem milczenia** mechanizmu. (L-0041, L-0042, L-0044,
    L-0047)
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Weryfikację planuj tam,
    gdzie jest wykonalna; po pytaniu sprzątasz sam; przy wyprowadzaniu pozycji jednostką inwentarza
    jest **sprawa**, nie linia. Wstawkę kotwicz do elementu, który przeżyje operację, i dowódź
    **obecności** nowej treści. (L-0005, L-0013, L-0014, L-0050, L-0058)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    Przy zadaniu wizualnym zbierasz najpierw cechy pozytywne i pokazujesz jeden wariant do
    kalibracji. Ostrzeżenie `claude plugin validate` o root `CLAUDE.md` jest świadomym skutkiem
    dogfoodingu — nie „naprawiaj" go. (L-0003, L-0006, L-0016, L-0019, L-0029)

W tym etapie centralne są zasady **8** (rozpoznanie narzędzia należy do hooka, nie do skilla),
**15** (komunikat hooka jest ASCII) i **4** (zmianę zachowania skilla pokazujesz obiema wersjami
w jednym przebiegu).

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/REKOMENDACJA_MODELU/E1/`.** Wszystko tymczasowe —
projekty kontrolne, payloady hooków, wyjścia narzędzi, instrumenty porównawcze — powstaje tam.
Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego
repozytorium), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.
Katalog powstaje przy pierwszym zapisie, nie na zapas.

1. **`adapters/claude-code/MODELE.md`** — lista modeli Claude Code. Trzy klasy (mocny / wyważony /
   tani) z przypisanymi nazwami, **data aktualizacji** i **źródło każdej pozycji**. Warstwa modelowa
   po angielsku. Format czytany zarówno przez człowieka, jak i przez skill — kotwica na początku
   linii, zamknięta lista brzmień klas (zasada 7), żeby E2 miał co parsować.
2. **`adapters/cursor/MODELE.md`** — to samo dla Cursora. Nazwy bierzesz **z pilotażu E6
   (2026-08-17)** i oznaczasz źródłem; pozycji, których nie masz z pomiaru, nie zmyślasz — wpisujesz
   `<DO UZUPEŁNIENIA: …>` zgodnie z zasadą 1.
3. **`core/process/session-signals.js`** — prowizjonowanie listy do projektu:
   `.claude/relai/MODELE-claude-code.md` i `.claude/relai/MODELE-cursor.md`, **kopiowane tylko wtedy,
   gdy pliku nie ma** (inaczej niż `templates/`). Który plik trafia do projektu, decyduje adapter,
   który woła funkcję — rdzeń przyjmuje to parametrem i nie zna nazw narzędzi.
4. **`adapters/claude-code/hooks/session-context.js`** i **`adapters/cursor/hooks/session-context.js`**
   — każdy kładzie swoją listę i dokłada do kontekstu startu **jedno zdanie ASCII** (zasada 15)
   mówiące, **która lista obowiązuje w tej sesji**, wraz z datą listy. Zdanie pada tylko wtedy, gdy
   plik listy realnie jest; brak pliku znaczy cisza.
5. **`adapters/claude-code/skills/relai-planning/SKILL.md`** — Krok 3, wiersz 3 tabeli pytania
   startowego: opcje wymieniają **nazwy z listy wskazanej przez hook** razem z datą listy, zamiast
   samych klas. Zachowanie bez listy zostaje dzisiejsze: pytanie klasami, bez ani jednego
   dodatkowego komunikatu.
6. **`core/MANIFEST.json`** — deklaracja obu plików list w sekcji odpowiedniego adaptera, wzorem
   pozostałych pozycji. Samo **sprawdzenie** tej deklaracji przez walidator należy do **E4** — tutaj
   tylko deklarujesz.
7. **Nie ruszasz**: `SPEC_CLAUDE_MD.md`, `SPEC_STATUS.md`, `SPEC_PROMPT_ETAPU.md`,
   `relai-stage.md`, `validate-adapters.js`, wiersza w `docs/USTAWIENIA.md` ani numeru wersji —
   to zakres E3 i E4.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] Oba pliki `MODELE.md` istnieją, każdy ma **trzy klasy**, nazwy modeli, datę aktualizacji
      i źródło każdej pozycji; plik Cursora oznacza pozycje niepochodzące z pomiaru jako
      `<DO UZUPEŁNIENIA: …>`.
- [ ] **Prowizjonowanie kładzie właściwy plik**: dwa projekty kontrolne w katalogu roboczym, jeden
      obsłużony hookiem Claude Code, drugi hookiem Cursora — w każdym powstaje **wyłącznie** lista
      swojego narzędzia (dowód: `ls` obu katalogów `.claude/relai/`).
- [ ] **Kopia jest trwała** (ryzyko 2 planu): plik listy zmieniony ręcznie w projekcie kontrolnym
      **przeżywa** ponowne uruchomienie hooka startu — dowód sumą kontrolną przed i po, po
      normalizacji CRLF → LF (zasada 11). Kontrola pozytywna w tym samym przebiegu: skasowany plik
      **powstaje** ponownie.
- [ ] **Zdanie o liście pada raz i jest ASCII**: uruchomienie hooka w projekcie z listą daje
      dokładnie jedno zdanie z nazwą pliku i datą listy; ten sam hook w projekcie **bez** listy daje
      **zero znaków** na ten temat (para przebiegów, L-0081).
- [ ] **Pytanie o model pokazuje nazwy**: świeża sesja poproszona o plan w projekcie z listą
      pokazuje w pytaniu 3 nazwy modeli z listy razem z jej datą — dowodem jest **zapisana treść
      pytania**, nie kod skilla. Projekt bez listy w tym samym przebiegu pokazuje dzisiejsze
      brzmienie klasowe (obie wersje w jednym przebiegu, zasada 4).
- [ ] Adapter drugiego narzędzia niezmieniony mimochodem: `git diff --stat` nie pokazuje zmian
      w plikach spoza zakresu z sekcji „Nie ruszasz".
- [ ] `node core/tools/validate-adapters.js` → kod 0.
- [ ] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy", z podpisem; `docs/STATE.md`
      nadpisany.
- [ ] Katalog roboczy `.claude/relai/work/REKOMENDACJA_MODELU/E1/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak"; **liczby przed i po**
      we wpisie dziennika. Artefakty spoza tego katalogu wypisane **z nazwy** razem z tym, co się
      z nimi stało.

## Na koniec — rytuał obowiązkowy (bez niego etap NIE jest ukończony)

1. **`docs/plany/REKOMENDACJA_MODELU/STATUS.md`** — E1 → `ZREALIZOWANY <data>`, E2 →
   `GOTOWY DO STARTU` z linkiem do `PROMPT_ETAP_2.md` w kolumnie `Prompt`, linia w dzienniku
   wdrożenia. Sekcję „Bramki manualne" odśwież z sekcji „Do zrobienia przez człowieka" swojego wpisu.
1a. **Katalog roboczy etapu** — zmierz, pokaż pozycje, skasuj po „tak"; obie liczby idą do wpisu
   z punktu 2.
2. **`docs/DZIENNIK.md`** — wpis wg `SPEC_DZIENNIK.md` na końcu sekcji „Wpisy": Zrobione /
   Zweryfikowane — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka. Podpis
   `Autor: RelAI (<model>) + <git config user.name>`. Przejrzyj tabelę „Stan otwartych ryzyk" —
   ryzyka 1 i 2 planu wchodzą do niej przy tym etapie. Lekcje z etapu → `docs/LEKCJE.md`
   i odświeżony destylat.
3. **`docs/STATE.md`** — sekcja „Co działa" dostaje zdanie o tym, co RelAI obiecuje przy pytaniu
   o model; sekcja „Nad czym pracujemy teraz" — postęp planu.
4. **`docs/ARTEFAKTY.md`** — podbicie wersji skilla `relai-planning` (zmiana pytania startowego)
   i wpisanie obu plików list jako nowych artefaktów.
5. **Wygeneruj `PROMPT_ETAP_2.md`** w tym folderze, ze specyfikacji promptu etapowego: na bazie
   sekcji 6 planu (E2 — komenda `/relai-models`), **realnego stanu repozytorium po tym etapie**
   i lekcji, które w nim powstały. Etap bez tego promptu nie jest ukończony (D-34). Pamiętaj, że
   E2 jest zablokowany dwiema bramkami manualnymi — wypisz je w prompcie jako warunek startu.
6. **Commit** — propozycja, conventional message po angielsku. Jedyny punkt, o który pytasz.
