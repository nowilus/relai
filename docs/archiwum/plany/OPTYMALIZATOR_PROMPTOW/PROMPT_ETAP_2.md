# PROMPT_ETAP_2 — Pomiar trzech modeli i wiersz `Model optymalizatora`

Plan: OPTYMALIZATOR_PROMPTOW • Etap: **E2 z E5** • Wygenerowano: 2026-09-14 (autor: Opus 5, w rytuale „Na koniec" E1) • Wykonawca: **Opus** (STATUS.md planu, D-85)

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **najsilniejszy**, w tym
> narzędziu: **Opus 5** (lista modeli z dnia `2026-09-04`). Jeśli sesja działa na innym modelu —
> zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna, linia aktywnego planu |
| `docs/STATE.md` | stan na dziś — cały plik, jest krótki |
| `docs/DZIENNIK.md` | **wyłącznie** sekcja „Stan otwartych ryzyk" (O1, O4, O6, O9) i wpis z 2026-09-14 o E1 — co powstało i czego **nie** zweryfikowano |
| `docs/LEKCJE.md` | **wyłącznie** sekcja „Zasady aktywne" (15 pozycji, limit osiągnięty) |
| `docs/plany/OPTYMALIZATOR_PROMPTOW/PLAN.html` | sekcje **5** („Kto to wykonuje — i dlaczego nie model sesji", „Skąd bierze się nazwa modelu", tabela „Gdzie co mieszka"), **6** (opis E2), **7** (ryzyka **O9, O10, O11**), **8** (przypadki b11–b14: model spoza listy, brak wiersza ustawień, awaria subagenta, prompt ponad kontekst) |
| `docs/plany/OPTYMALIZATOR_PROMPTOW/STATUS.md` | tabela etapów i **sześć otwartych bramek manualnych** — dwie dotyczą tego etapu |
| `core/prompt/REGULY.md` | dziewięć wymiarów intencji — **instrument pomiarowy liczy pokrycie dokładnie tych dziewięciu**, nie własnej listy |
| `core/prompt/SZABLONY.md` | trzy rusztowania — wejście „z blokiem kontekstu" musi je uwzględniać |
| `adapters/claude-code/commands/relai-prompt.md` | przebieg komendy, który agent optymalizatora ma odtworzyć |
| `adapters/claude-code/agents/relai-reviewer.md` | **wzorzec agenta**: nagłówek YAML, brak pola `model`, preambuła roli |
| `core/process/crew.js` | funkcja `buildCommand` — gałąź `--model` dla trzech dostawców; stąd bierze się delegacja z jawnym modelem |
| `.claude/relai/MODELE-claude-code.md` | nazwy modeli i `list-date`; **jedyne** źródło nazw — z pamięci nie uzupełniasz (L-0026) |
| `core/templates/SPEC_USTAWIENIA.md` | format wiersza czytanego maszynowo: kotwica, zamknięta lista brzmień, zachowania ciszy |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Optymalizację wykonuje subagent uruchomiony z jawnie podanym modelem**, nie model sesji —
  sekcja 5 planu. Droga domyślna to narzędzie `Agent` z `subagent_type` i `model`; `crew.js run
  --model` jest tylko dla optymalizacji biegnącej w **innym narzędziu** i leży poza zakresem planu.
- **Nazwa modelu pochodzi z `.claude/relai/MODELE-<narzędzie>.md`**, razem z datą listy. Pozycji,
  której na liście nie ma, nie zgadujesz; klasa bez wpisu znaczy cisza i wskazanie `/relai-models`.
- **Wybór modelu opiera się na pomiarze, nie na cenniku.** Cena jest jedną kolumną tabeli, nie
  kryterium. Zapisujesz **każdy** wynik, także ten, który przewraca założenie o modelu tanim.
- **Kaskady wielomodelowej nie budujesz** (nie-cel sekcji 2): jeden model na całą optymalizację.
- **Pytanie o model pada raz na projekt**, przy pierwszym użyciu komendy, a odpowiedź idzie do
  `docs/USTAWIENIA.md` i nie wraca (L-0006).
- **Dopóki nie ma pomiaru, rekomendacją jest model sesji** — nie najtańsza pozycja z listy, bo cena
  nie jest dowodem jakości (przypadek b12).
- **Zero nazw modeli w `core/prompt/`** — zakaz z E1, potwierdzony pomiarem. Nazwy mieszkają
  w liście narzędzia i w `USTAWIENIA.md`, nigdzie indziej (ryzyko O5).
- **Granica zakresu.** W tym etapie **nie robisz**: bloku kontekstu z decyzji, zasad i stanu ani
  pytania o język (E3), komendy w adapterach Cursor i Codex (E3), hooka `UserPromptSubmit` ani
  przełącznika trybu ciągłego (E4), testów regresyjnych, kontroli w `validate-adapters.js`,
  podbicia wersji i sekwencji wydania P-005 (E5).

## Stan wyjściowy (co realnie zastajesz po E1)

RelAI **2.1.4** w repozytorium i publicznie; **czternasta komenda `/relai-prompt` istnieje
w repozytorium i nie jest wydana** — plugin zainstalowany w scope `user` serwuje trzynaście komend,
więc komendy **nie wywołasz z pluginu**. Reguły czytasz i wykonujesz wprost z plików repozytorium;
sekwencja wydania P-005 to E5.

```
core/prompt/
  REGULY.md                  # 9 wymiarow, limit 3 pytan, wzorce awarii w 6 grupach,
                             # bezpieczne techniki, sanityzacja, ochrona poswiadczen,
                             # marker dopowiedzenia, kontrola przed oddaniem, przyklad przed/po
  SZABLONY.md                # 3 rusztowania: zmiana w kodzie / analiza / praca dokumentacyjna
adapters/claude-code/
  commands/relai-prompt.md   # czternasta komenda, 9 krokow, 11 zakazow
  agents/                    # relai-coder.md, relai-reviewer.md, relai-tester.md (bez pola `model`)
  MODELE.md                  # zrodlo listy modeli adaptera
adapters/codex/
  skills/relai-prompt/       # wygenerowany deterministycznie z komendy (E1, odstepstwo)
  generate-skills.js         # licznik komend: 14
core/
  MANIFEST.json              # tablica `prompt` (2 pozycje); `./prompt/` w `uses` adaptera
  process/crew.js            # buildCommand z gałęzią `--model` dla trzech dostawcow
LICENSE                      # MIT RelAI + "Third-party notices": MIT (c) 2026 Nidhin Joseph Nelson
docs/ARTEFAKTY.md            # 49 pozycji rejestru
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** agenta optymalizatora, jakiegokolwiek
wywołania z jawnym modelem, instrumentu liczącego pokrycie dziewięciu wymiarów, zestawu surowych
zdań do pomiaru, wiersza `Model optymalizatora` w `docs/USTAWIENIA.md` i pytania, które go wypełnia.

**Czego E1 nie zweryfikował i co należy do tego etapu:** czy tańszy model udźwignie te reguły
(ryzyko O9). E1 zmierzył wyłącznie **poprawność reguł na modelu sesji** — pięć przebiegów,
15 punktów, 0 niezaliczonych (FAKT).

**Luka znana z E1, nierozstrzygnięta:** w cudzym projekcie komenda nie widzi `core/prompt/`
(katalog pluginu jest poza zasięgiem sesji, L-0012) i pracuje na rdzeniu reguł niesionym w samej
komendzie. Bramka „prowizjonowanie — E3 czy E5" czeka na człowieka; **w tym etapie jej nie
rozstrzygasz i nie obchodzisz**.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie** (przepisane w skrócie; pełne
brzmienie czytasz z rejestru):

1. **Specyfikacja dokumentu jest kompletna albo martwa:** realny przykład, struktura w treści,
   ścieżka „pytam zamiast zmyślać". **Pierwszy realny przebieg reguły jest częścią jej pisania.**
   (L-0001, L-0011, L-0026, L-0089, L-0100)
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś.** (L-0002, L-0022, L-0059)
3. **Test „czegoś nie wolno" wymaga dowodu negatywnego.** (L-0007)
4. **Dowodzisz efektem, nie zdarzeniem:** stanem pliku, sumą kontrolną, treścią odpowiedzi; zmianę
   zachowania pokazujesz obiema wersjami w jednym przebiegu. (L-0017, L-0018, L-0040, L-0051,
   L-0052, L-0063, L-0069, L-0082)
5. **Instrument pomiarowy sam bywa źródłem fałszu:** wyrażenia w pliku, nie w `node -e`; dokładaj
   przypadek, który **musi** trafić; cisza bez kontroli pozytywnej w tym samym przebiegu nic nie
   znaczy. (L-0032, L-0037, L-0054…L-0056, L-0064, L-0068, L-0071, L-0073, L-0083…L-0091,
   L-0095…L-0097)
6. **Próg jest liczbą, którą ktoś liczy** — kalibruj na realnych plikach, jeden wyzwalacz na próg;
   **liczbę zbioru liczysz także w komunikacie sukcesu**, nie tylko w asercji. (L-0034, L-0049,
   L-0053, L-0060, L-0065, L-0099)
7. **Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień:** dopasowanie od początku
   komórki, wartość nierozpoznana znaczy cisza. (L-0025, L-0035, L-0048, L-0066, L-0070, L-0074)
8. **Zachowanie, które ma działać zawsze, mieszka w warstwie obecnej w każdej sesji**; komenda
   wywołana wprost nie ładuje skilla. (L-0015, L-0030, L-0036)
9. **Skill nie zakłada dostępu do niczego poza katalogiem roboczym.** (L-0009, L-0010, L-0012,
   L-0023)
10. **Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI.** (L-0004, L-0008,
    L-0020, L-0061, L-0085)
11. **Końce linii są wariantem, nie szczegółem** — sumy po normalizacji CRLF → LF. (L-0033, L-0038,
    L-0057, L-0062, L-0067)
12. **Guardrail zatrzymujący treść, która sekretem nie jest, to defekt rdzenia.** (L-0043, L-0045,
    L-0046, L-0072)
13. **Cudze narzędzie poznajesz z wydanego builda i z próby**, nie z dokumentacji. (L-0041, L-0042,
    L-0044, L-0047, L-0092)
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** (L-0005, L-0013, L-0014,
    L-0050, L-0058)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094, L-0098)

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/OPTYMALIZATOR_PROMPTOW/E2/`.** Wszystko
tymczasowe — zestaw surowych zdań, instrument pomiarowy, wyjścia trzech modeli, tabele pośrednie —
powstaje tam. Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy),
wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od `relai-optymalizator-`.

1. **`adapters/claude-code/agents/relai-prompt-optimizer.md`** — agent wykonujący optymalizację.
   Nagłówek YAML jak u trzech agentów załogi, **bez pola `model`** (nazwa przychodzi przy
   wywołaniu). Preambuła roli niesie rdzeń reguł i zakaz wykonywania przerobionego promptu.
   `description` **w cudzysłowie** (P-012).
2. **Zestaw surowych zdań — minimum 10 pozycji** (SZACUNEK), wzięty z **realnej pracy**: dziennik
   tego projektu, historia próśb, zdania podyktowane w biegu. Każde z zapisanym oczekiwaniem: które
   z dziewięciu wymiarów są w nim obecne, a których brakuje. **Kontrola pozytywna zestawu:** co
   najmniej jedno zdanie z celowo pustym formatem wyjścia i bez kryterium sukcesu, które instrument
   **musi** zgłosić jako niepokryte.
3. **Instrument pomiarowy** w katalogu roboczym: liczy **pokrycie dziewięciu wymiarów**
   (z `REGULY.md`, nie z własnej listy) i **koszt jednego przerobienia** w tokenach wejścia
   i wyjścia. Wyrażenia w pliku, nie w `node -e` (zasada 5).
4. **Trzy przebiegi po dwa warianty** — Haiku 4.5, Sonnet 5, Opus 5, każdy **z blokiem kontekstu
   i bez niego**. Różnica między wariantami jest **ceną utraconego cache'u** (ryzyko O10) i wchodzi
   do tabeli osobną kolumną. Blok kontekstu na potrzeby pomiaru składasz ręcznie — budowa bloku
   z pamięci projektu to E3.
5. **Tabela wynikowa** we wpisie dziennika: model × wariant × pokrycie wymiarów × tokeny × koszt.
   Liczby z etykietą FAKT albo SZACUNEK (D-63). Ceny bierzesz **z dokumentacji dostawcy**, nie
   z pamięci, i podajesz datę odczytu.
6. **Wiersz `Model optymalizatora` w `docs/USTAWIENIA.md`** — format czytany maszynowo wg
   `SPEC_USTAWIENIA.md`: kotwica od początku komórki, zamknięta lista brzmień, wartość
   nierozpoznana znaczy cisza. Wartość wpisuje **człowiek**, nie pomiar: komenda pyta raz na
   projekt, pokazując nazwy z listy **razem z jej datą**, a rekomendacja pochodzi z tabeli z punktu 5.
7. **`adapters/claude-code/commands/relai-prompt.md`** — krok wyboru modelu i delegacji: czytanie
   wiersza ustawień, pytanie przy jego braku, wywołanie agenta z jawnym modelem oraz **cztery
   ścieżki awaryjne** z sekcji 8 planu: model spoza listy (b11), brak wiersza (b12), awaria
   subagenta — do wykonania idzie oryginał, nigdy cisza (b13), prompt ponad kontekst modelu — bez
   cichego obcięcia (b14).
8. **`docs/ARTEFAKTY.md`** — wpis agenta (wersja 1) i podbicie wersji komendy z opisem „co się
   zmieniło / po co"; przeliczenie liczby pozycji rejestru komendą, nie okiem.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] **Delegacja biegnie na modelu z ustawień, nie na modelu sesji.** Dowód: dwa przebiegi tego
      samego zdania z różną wartością wiersza `Model optymalizatora`, a w każdym **odpowiedź
      subagenta niesie nazwę modelu, na którym powstała** — porównanie treści, nie komunikatu.
- [ ] **Tabela pomiarowa ma komplet: 3 modele × 2 warianty = 6 przebiegów**, każdy z pokryciem
      dziewięciu wymiarów i liczbą tokenów. Brak któregokolwiek przebiegu opisujesz wprost razem
      z powodem — nie zostawiasz pustej komórki.
- [ ] **Kontrola pozytywna instrumentu w tym samym przebiegu:** podłożone zdanie bez formatu
      wyjścia i bez kryterium sukcesu zostaje zgłoszone jako **niepokryte** w obu tych wymiarach.
      Bez tego punktu żaden wynik pokrycia nie znaczy nic (zasada 5).
- [ ] **Cena utraconego cache'u policzona, nie oszacowana:** różnica tokenów wejścia między
      wariantem z blokiem kontekstu i bez niego, dla każdego z trzech modeli.
- [ ] **Wiersz `Model optymalizatora` jest czytany maszynowo:** wartość z listy → rozpoznana;
      wartość spoza listy → **cisza i wskazanie `/relai-models`**, nie podmiana na najbliższą
      nazwę. Obie strony pokazane w jednym przebiegu.
- [ ] **Awaria subagenta nie jest cicha:** wymuś niepowodzenie delegacji (nieistniejąca nazwa
      modelu) → do wykonania idzie **oryginał**, a człowiek dostaje jedno zdanie o tym, że
      optymalizacja nie doszła do skutku. Dowód treścią odpowiedzi.
- [ ] **Zero nazw modeli w bazie reguł nadal obowiązuje:**
      `grep -niE "opus|sonnet|haiku|fable|gpt-|claude-[a-z0-9-]+"` na `core/prompt/*.md` zwraca
      zero trafień; kontrola pozytywna tego samego wzorca na `adapters/claude-code/MODELE.md`
      zwraca trafienia.
- [ ] **Nagłówek agenta się parsuje:** `node core/tools/validate-adapters.js` kończy się kodem 0.
- [ ] **`docs/USTAWIENIA.md` zmieniony za zgodą człowieka** — plik jest chroniony hookiem
      `config-protection`; zapis bez potwierdzenia jest defektem, nie skrótem.
- [ ] Wpis w `docs/DZIENNIK.md` dopisany **na końcu** sekcji „Wpisy", z autorem w nagłówku;
      `docs/STATE.md` nadpisany; `docs/ARTEFAKTY.md` ma wpis agenta i podbitą wersję komendy.
- [ ] **Katalog roboczy** `.claude/relai/work/OPTYMALIZATOR_PROMPTOW/E2/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak"; **liczby przed i po**
      w sekcji „Zweryfikowane" wpisu. Artefakty, które musiały powstać **poza** tym katalogiem,
      wypisane z nazwy razem z tym, co się z nimi stało.

**Czego w tym etapie zweryfikować się nie da:** zachowania w cudzym projekcie (komenda nie jest
wydana — E5) oraz opóźnienia delegacji w trybie ciągłym (ryzyko O11 — tryb ciągły powstaje w E4).
Nie udajesz, że tych punktów nie ma; wpisujesz je do wpisu dziennika jako świadomie odłożone.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/OPTYMALIZATOR_PROMPTOW/STATUS.md`: E2 → ZREALIZOWANY (data), E3 → GOTOWY DO STARTU,
   link do `PROMPT_ETAP_3.md` w kolumnie `Prompt`, **jedna** linia w dzienniku wdrożenia.
   Nierozstrzygnięte pozycje „Do zrobienia przez człowieka" z wpisu → sekcja „Bramki manualne".
   **Bramka „Który model zostaje domyślny, jeśli pomiar wyjdzie nierozstrzygający" należy do tego
   etapu** — rozstrzygnij ją z człowiekiem albo zostaw otwartą z jawnym powodem.
2. `docs/DZIENNIK.md`: wpis wg `SPEC_DZIENNIK.md` na końcu sekcji „Wpisy" (Zrobione / Zweryfikowane
   — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka), podpis
   `RelAI (<model>) + <git config user.name>`. **Tabela wynikowa pomiaru idzie do tego wpisu.**
   Przejrzyj „Stan otwartych ryzyk" — **O9 i O10 rozstrzygają się w tym etapie**. Lekcje →
   `docs/LEKCJE.md` + odświeżone „Zasady aktywne" (**limit 15, zajęte 15** — nowa zasada wchodzi
   przez scalenie, nie przez dopisanie szesnastej).
3. `docs/STATE.md` — nadpisz obszar optymalizatora; `README.md` **tylko** jeśli zmienił się sposób
   uruchomienia.
4. **Wygeneruj `PROMPT_ETAP_3.md`** w tym folderze, ze specyfikacji promptu etapowego: na bazie
   `PLAN.html` (sekcja 6 — opis E3, sekcja 5 — blok kontekstu i „Gdzie co mieszka", sekcja 8 —
   przypadki b5, b8, b10), **realnego stanu repozytorium po tym etapie** i lekcji z tego etapu.
5. Commit — conventional message, po angielsku. Bez pytania o zgodę tylko wtedy, gdy użytkownik
   wcześniej jej udzielił; w przeciwnym razie propozycja.
