# PROMPT_ETAP_3 — Blok kontekstu z pamięci projektu, język promptu i trzy adaptery

Plan: OPTYMALIZATOR_PROMPTOW • Etap: **E3 z E5** • Wygenerowano: 2026-09-14 (autor: Opus 5, w rytuale „Na koniec" E2) • Wykonawca: **Opus** (STATUS.md planu, D-85)

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **najsilniejszy**, w tym
> narzędziu: **Opus 5** (lista modeli z dnia `2026-09-04`). Jeśli sesja działa na innym modelu —
> zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna, linia aktywnego planu |
| `docs/STATE.md` | stan na dziś — cały plik, jest krótki |
| `docs/DZIENNIK.md` | **wyłącznie** sekcja „Stan otwartych ryzyk" (O1, O4, O6) i wpis z 2026-09-14 o **E2** — tabela pomiarowa, dwa defekty instrumentu i to, czego nie zweryfikowano |
| `docs/LEKCJE.md` | **wyłącznie** sekcja „Zasady aktywne" (15 pozycji, limit osiągnięty) |
| `docs/plany/OPTYMALIZATOR_PROMPTOW/PLAN.html` | sekcje **5** („Co dokładnie robi krok 4" — blok wybiórczy i jawny, tabela „Gdzie co mieszka"), **6** (opis E3), **8** (przypadki **b5** język wejścia wobec ustawienia, **b8** brak listy modeli, **b10** projekt bez struktury RelAI) |
| `docs/plany/OPTYMALIZATOR_PROMPTOW/STATUS.md` | tabela etapów i **cztery otwarte bramki manualne** — żadna nie blokuje tego etapu |
| `core/prompt/SZABLONY.md` | sekcja „Blok kontekstu projektu" — rusztowanie istnieje i **czeka na wypełnienie**; zdanie „blok wypełnia się dopiero wtedy, gdy warstwa ma dostęp do pamięci projektu" przestaje być prawdą w tym etapie |
| `adapters/claude-code/commands/relai-prompt.md` | dziesięć kroków; blok kontekstu wchodzi **po** rozpoznaniu kształtu, a język — przed wyjściem |
| `adapters/claude-code/agents/relai-prompt-optimizer.md` | preambuła wykonawcy: to ona dostaje blok kontekstu w treści zadania, nie ścieżkę do plików |
| `docs/USTAWIENIA.md` | wiersze czytane maszynowo, w tym `Model optymalizatora`; nowy wiersz języka idzie w tę samą konwencję |
| `core/templates/SPEC_USTAWIENIA.md` | format wiersza czytanego maszynowo: kotwica na początku komórki, zamknięta lista brzmień, cisza przy wartości nierozpoznanej |
| `adapters/cursor/install.js` | linie ~231 i ~238: komendy i agenci `relai-*` są kopiowane z adaptera Claude Code **automatycznie** — sprawdź, nie zakładaj |
| `adapters/codex/generate-skills.js` | generacja skilli z plików komend; **pojęcia agenta tam nie ma** i to jest rozstrzygnięcie tego etapu |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Blok kontekstu jest wybiórczy i jawny** (sekcja 5 planu): bierzesz tylko pozycje związane
  z zadaniem i wypisujesz je **z numeru albo nazwy** (`D-85`, `zasada 4`). „Dołączono kontekst
  projektu" nie jest blokiem kontekstu. Blok stoi w **pierwszej jednej trzeciej** promptu.
- **Język rozstrzyga wejście, nie ustawienie** (przypadek b5). Wiersz ustawień jest odpowiedzią
  domyślną wyłącznie dla zdania, którego języka nie da się rozstrzygnąć — na przykład złożonego
  głównie ze ścieżek i identyfikatorów.
- **Pytanie o język pada raz na projekt** i odpowiedź idzie do `docs/USTAWIENIA.md` (L-0006).
- **Optymalizację wykonuje subagent na modelu z wiersza `Model optymalizatora`**; w tym projekcie
  jest to **Sonnet 5** (pomiar E2, wskazanie człowieka). Mechanizm delegacji jest zrobiony — nie
  przebudowujesz go.
- **Zero nazw modeli w `core/prompt/`** (ryzyko O5). Nazwy mieszkają w liście narzędzia
  i w `USTAWIENIA.md`, nigdzie indziej.
- **Brak listy modeli znaczy ciszę** (b8), a **projekt bez struktury RelAI dostaje komendę bez bloku
  kontekstu** (b10) — sam optymalizator działa normalnie i nie pyta o nic.
- **Koszt bloku jest zmierzony i mały**: 701–1 485 tokenów wejścia, 0,002–0,026 USD na zdanie (E2).
  Nie optymalizujesz go ponownie i nie budujesz dla niego cache'u — ryzyko O10 jest zamknięte.
- **Granica zakresu.** W tym etapie **nie robisz**: hooka `UserPromptSubmit`, przełącznika
  i filtra pomijania trybu ciągłego (E4 — pierwszym krokiem tamtego etapu jest pomiar ryzyka O1);
  testów regresyjnych w `core/process/tests/`, kontroli w `validate-adapters.js`, podbicia wersji,
  prowizjonowania `core/prompt/` do cudzego projektu ani sekwencji wydania P-005 (E5).

## Stan wyjściowy (co realnie zastajesz po E2)

RelAI **2.1.4** w repozytorium i publicznie. **Czternasta komenda `/relai-prompt` i czwarty agent
adaptera istnieją w repozytorium i nie są wydane** — plugin w scope `user` serwuje trzynaście
komend i trzech agentów, więc ani komendy, ani agenta **nie wywołasz z pluginu**. Reguły i pliki
czytasz wprost z repozytorium; sekwencja wydania to E5.

Warunek pracy zmieniony przez E2: **delegacja działa i jest zmierzona**, a wiersz ustawień wskazuje
Sonneta 5. Pomiar wykonywał się przez `claude -p` w katalogu neutralnym — prompt podawaj **stdin-em**
(P-002), nigdy argumentem.

```
core/prompt/
  REGULY.md                        # 9 wymiarow, limit 3 pytan, sanityzacja, ochrona poswiadczen;
                                   # sekcja "Czesc zalezna od narzedzia i modelu" — bez nazw modeli
  SZABLONY.md                      # 3 rusztowania + sekcja "Blok kontekstu projektu" (PUSTA ATRAPA:
                                   # "blok wypelnia sie dopiero wtedy, gdy warstwa ma dostep do pamieci")
adapters/claude-code/
  commands/relai-prompt.md         # 10 krokow (Krok 1 = model i delegacja, b11-b14), 14 zakazow
  agents/relai-prompt-optimizer.md # wykonawca, bez pola `model`, linia `model:` na koncu odpowiedzi
  agents/relai-{coder,tester,reviewer}.md
adapters/cursor/
  install.js                       # kopiuje komendy (~231) i agentow relai-* (~238) automatycznie,
                                   # agentom przepisuje sam frontmatter
adapters/codex/
  skills/relai-prompt/SKILL.md     # wygenerowany deterministycznie z komendy; 16 katalogow skilli
  generate-skills.js               # licznik komend 14; pojecia agenta NIE MA
docs/USTAWIENIA.md                 # wiersz `Model optymalizatora | Sonnet 5 · lista claude-code z dnia 2026-09-04`
docs/ARTEFAKTY.md                  # 50 pozycji rejestru
.claude-plugin/plugin.json         # tablica `agents` z czterema plikami
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** składania bloku kontekstu z realnej pamięci
projektu (decyzje zamrożone, zasady aktywne, stan), wiersza języka w ustawieniach i pytania, które
go wypełnia, rozstrzygnięcia, co z delegacją w Codeksie (brak pojęcia agenta) oraz **dowodu**, że
komenda i agent docierają do adapterów Cursor i Codex w niezmienionej treści.

**Czego E2 nie zweryfikował i co zostaje poza tym etapem:** zachowania w cudzym projekcie (komenda
niewydana — E5) i opóźnienia delegacji w trybie ciągłym (O11 — tryb ciągły powstaje w E4).

**Sygnał z pomiaru E2, który ten etap ma unieważnić:** Sonnet bez bloku kontekstu przeczytał „E5"
jako licencję Microsoft 365 zamiast etapu planu (`bez-sonnet-01`). To jest najmocniejszy pojedynczy
argument za blokiem pamięci projektu i **materiał na kontrolę pozytywną** tego etapu.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie** (przepisane w skrócie; pełne
brzmienie czytasz z rejestru):

1. **Specyfikacja dokumentu jest kompletna albo martwa:** realny przykład, struktura w treści,
   ścieżka „pytam zamiast zmyślam"; **pierwszy realny przebieg reguły jest częścią jej pisania.**
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś.**
3. **Test „czegoś nie wolno" wymaga dowodu negatywnego.**
4. **Dowodzisz efektem, nie zdarzeniem:** stanem pliku, sumą kontrolną, treścią odpowiedzi; zmianę
   zachowania pokazujesz obiema wersjami w jednym przebiegu.
5. **Instrument pomiarowy sam bywa źródłem fałszu:** wyrażenia w pliku, nie w `node -e`; dokładaj
   przypadek, który **musi** trafić; cisza bez kontroli pozytywnej nic nie znaczy. **Metrykę
   „czy X jest w tekście" stawiasz na dwóch licznikach** — wąskim i szerokim, z kontrolą przeciw
   zawyżeniu. **Najpierw klasyfikujesz kształt odpowiedzi, potem liczysz jakość**, i tylko tam,
   gdzie mierzona rzecz miała powstać; liczba przypadków stoi obok procentu.
6. **Próg jest liczbą, którą ktoś liczy** — kalibruj na realnych plikach. **Wielkość odejmowaną od
   pomiaru traktuj jako hipotezę o stałej i sprawdź ją**, zanim na niej oprzesz liczbę.
7. **Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień:** dopasowanie od początku
   komórki, wartość nierozpoznana znaczy cisza.
8. **Zachowanie, które ma działać zawsze, mieszka w warstwie obecnej w każdej sesji**; komenda
   wywołana wprost nie ładuje skilla.
9. **Skill nie zakłada dostępu do niczego poza katalogiem roboczym.**
10. **Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI.**
11. **Końce linii są wariantem, nie szczegółem** — sumy po normalizacji CRLF → LF. **Numeracja
    i wytłuszczenie nagłówka są takim samym wariantem**: nagłówek cudzej odpowiedzi rozpoznawaj
    z tolerancją na `## 2.` i `**…**`.
12. **Guardrail zatrzymujący treść, która sekretem nie jest, to defekt rdzenia.**
13. **Cudze narzędzie poznajesz z wydanego builda i z próby**, nie z dokumentacji.
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.**
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/OPTYMALIZATOR_PROMPTOW/E3/`.** Wszystko
tymczasowe — instrument porównawczy, wyjścia przebiegów z blokiem i bez, kopie kontrolne
ustawień, projekt kontrolny bez struktury RelAI — powstaje tam. Artefakt, który z natury musi leżeć
**poza** projektem (`%TEMP%`, katalog domowy), wpisujesz do wpisu dziennika **z nazwy**, a jego
nazwę zaczynasz od `relai-optymalizator-`.

1. **`adapters/claude-code/commands/relai-prompt.md`** — krok składania **bloku kontekstu**:
   skąd bierzesz pozycje (`docs/DECYZJE.md`, sekcja „Zasady aktywne" w `docs/LEKCJE.md`,
   `docs/STATE.md`), **jak wybierasz** te związane z zadaniem, jak je wypisujesz (numer albo nazwa
   plus jedno zdanie) i gdzie blok stoi w prompcie. Zapisz wprost **limit** — blok, który przekracza
   ustaloną wagę, jest przycinany po najmniej związanych pozycjach, nigdy po środku pozycji.
2. **`adapters/claude-code/commands/relai-prompt.md`** — krok **języka**: rozstrzygnięcie po języku
   wejścia (b5), wiersz ustawień jako odpowiedź domyślna dla wejścia nierozstrzygalnego, pytanie
   raz na projekt przy braku wiersza.
3. **`core/prompt/SZABLONY.md`** — sekcja „Blok kontekstu projektu" przestaje być atrapą: zdanie
   „blok wypełnia się dopiero wtedy, gdy warstwa ma dostęp do pamięci projektu" zastąp opisem
   realnego składania, z **realnym przykładem** z tego projektu (zasada 1).
4. **`adapters/claude-code/agents/relai-prompt-optimizer.md`** — agent dostaje blok **w treści
   zadania**, nie ścieżki do plików: zapisz to wprost, razem z zakazem dopisywania do bloku pozycji,
   których w nim nie było, i z zachowaniem przy bloku pustym (sekcja **nie powstaje**, pusty
   nagłówek jest gorszy niż jego brak).
5. **Wiersz `Język promptu` w `docs/USTAWIENIA.md`** — format czytany maszynowo wg
   `SPEC_USTAWIENIA.md`: kotwica od początku komórki, zamknięta lista brzmień, wartość
   nierozpoznana znaczy cisza. Wartość wpisuje **człowiek**, po jednym pytaniu.
6. **Adaptery Cursor i Codex** — dowód propagacji, nie nowa implementacja: pokaż, że komenda
   i agent trafiają do `.cursor/commands/` i `.cursor/agents/` z **niezmienioną treścią** (suma po
   normalizacji CRLF → LF), a skill Codeksa zgadza się ze źródłem. **Rozstrzygnij, co znaczy
   delegacja w Codeksie**, gdzie pojęcia agenta nie ma: albo praca bez delegacji z rdzenia reguł,
   albo `crew.js run --model`. Wybór opisz jednym akapitem w pliku, który go niesie — i nie
   dorabiaj dla Codeksa osobnego agenta.
7. **`docs/ARTEFAKTY.md`** — podbicie wersji komendy, agenta i `SZABLONY.md` z opisem „co się
   zmieniło / po co"; przeliczenie liczby pozycji rejestru komendą, nie okiem.
8. **`docs/KOMENDY.md`** — wiersz komendy opisany wyłącznie tym, co po tym etapie działa: blok
   kontekstu i język **tak**, tryb ciągły **nie**.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] **Blok kontekstu zmienia wynik, a nie tylko rachunek** — to samo zdanie z E2
      (`prowizjonowanie do E5, razem z sekwencją wydania`) przez ten sam model **z blokiem i bez**:
      wariant bez bloku wolno mu przeczytać jako cokolwiek, wariant z blokiem **musi** trafić w E5
      jako etap tego planu. Dowód treścią obu odpowiedzi w jednym przebiegu (zasada 4).
- [ ] **Blok jest wybiórczy, nie hurtowy** — instrument liczy, ile pozycji pamięci projektu weszło
      do bloku wobec liczby pozycji dostępnych, dla **co najmniej trzech** różnych zadań. Zadanie
      o innym temacie dostaje **inny** zestaw pozycji; identyczny blok dla trzech różnych zadań
      jest defektem, nie oszczędnością.
- [ ] **Każda pozycja bloku ma numer albo nazwę** — wzorzec w pliku, nie w `node -e`; kontrola
      pozytywna na podłożonym bloku ze zdaniem „dołączono kontekst projektu", które **musi** zostać
      zgłoszone jako pozycja bez identyfikatora.
- [ ] **Waga bloku policzona, nie oszacowana:** rozmiar w znakach i tokenach dla trzech zadań,
      wobec zmierzonych w E2 701–1 485 tokenów. Przekroczenie limitu z punktu 1 zakresu → przycięcie
      pokazane na materiale.
- [ ] **Język rozstrzyga wejście (b5)** — zdanie po angielsku przy wierszu ustawień `polski` wraca
      po angielsku; zdanie złożone głównie ze ścieżek i identyfikatorów wraca w języku z ustawień.
      Obie strony w jednym przebiegu.
- [ ] **Wiersz `Język promptu` czytany maszynowo:** wartość z zamkniętej listy → rozpoznana;
      wartość spoza listy → **cisza**, nie podmiana na najbliższą. Obie strony pokazane razem.
- [ ] **Projekt bez struktury RelAI (b10)** — katalog kontrolny bez `docs/USTAWIENIA.md`: komenda
      działa, blok kontekstu **nie powstaje**, pytanie o język **nie pada**, a w wyjściu nie ma
      pustego nagłówka bloku. Dowód treścią odpowiedzi.
- [ ] **Brak listy modeli (b8)** — katalog kontrolny bez `.claude/relai/MODELE-*.md`: część reguł
      zależna od modelu milczy, reszta działa; zero nazw modeli w wyjściu.
- [ ] **Propagacja do adapterów zmierzona sumą, nie wzrokiem:** treść komendy i agenta w
      `.cursor/commands/` oraz `.cursor/agents/` zgodna ze źródłem po normalizacji CRLF → LF
      (u agenta z wyjątkiem frontmatteru, który installer przepisuje świadomie); skill Codeksa
      zgodny ze źródłem — `node core/tools/validate-adapters.js` kończy się kodem 0.
- [ ] **Zero nazw modeli w bazie reguł nadal obowiązuje:**
      `grep -niE "opus|sonnet|haiku|fable|gpt-|claude-[a-z0-9-]+"` na `core/prompt/*.md` zwraca zero
      trafień; kontrola pozytywna tego samego wzorca na `adapters/claude-code/MODELE.md` zwraca
      trafienia.
- [ ] **`docs/USTAWIENIA.md` zmieniony za zgodą człowieka** — plik jest chroniony hookiem
      `config-protection`; zapis bez potwierdzenia jest defektem, nie skrótem.
- [ ] Wpis w `docs/DZIENNIK.md` dopisany **na końcu** sekcji „Wpisy", z autorem w nagłówku;
      `docs/STATE.md` nadpisany; `docs/ARTEFAKTY.md` i `docs/KOMENDY.md` zaktualizowane.
- [ ] **Katalog roboczy** `.claude/relai/work/OPTYMALIZATOR_PROMPTOW/E3/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak"; **liczby przed i po**
      w sekcji „Zweryfikowane" wpisu. Artefakty, które musiały powstać **poza** tym katalogiem,
      wypisane z nazwy razem z tym, co się z nimi stało.

**Czego w tym etapie zweryfikować się nie da:** zachowania w cudzym projekcie z **wydanego** pluginu
(E5) oraz bloku kontekstu w trybie ciągłym (E4). Nie udajesz, że tych punktów nie ma — wpisujesz je
do wpisu dziennika jako świadomie odłożone.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/OPTYMALIZATOR_PROMPTOW/STATUS.md`: E3 → ZREALIZOWANY (data), E4 → GOTOWY DO STARTU,
   link do `PROMPT_ETAP_4.md` w kolumnie `Prompt`, **jedna** linia w dzienniku wdrożenia.
   Nierozstrzygnięte pozycje „Do zrobienia przez człowieka" z wpisu → sekcja „Bramki manualne".
   **Bramka „Czy tryb ciągły dla Cursora i Codeksa dostaje własny plan" dotyka tego etapu** —
   rozstrzygnij ją z człowiekiem albo zostaw otwartą z jawnym powodem.
2. `docs/DZIENNIK.md`: wpis wg `SPEC_DZIENNIK.md` na końcu sekcji „Wpisy" (Zrobione / Zweryfikowane
   — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka), podpis
   `RelAI (<model>) + <git config user.name>`. Przejrzyj „Stan otwartych ryzyk" — **O5 dotyka tego
   etapu** (część zależna od modelu), a **O8** (baza reguł rośnie i zjada kontekst) zyskuje w nim
   pierwszą realną liczbę. Lekcje → `docs/LEKCJE.md` + odświeżone „Zasady aktywne"
   (**limit 15, zajęte 15** — nowa zasada wchodzi przez scalenie, nie przez dopisanie szesnastej).
3. `docs/STATE.md` — nadpisz obszar optymalizatora; `README.md` **tylko** jeśli zmienił się sposób
   uruchomienia. Plik jest **319 linii przy progu 300** — skracaj przy okazji, nie dokładaj.
4. **Wygeneruj `PROMPT_ETAP_4.md`** w tym folderze, ze specyfikacji promptu etapowego: na bazie
   `PLAN.html` (sekcja 6 — opis E4, sekcja 7 — ryzyka **O1** i **O4**, sekcja 8 — przypadki b3
   i b7), **realnego stanu repozytorium po tym etapie** i lekcji z tego etapu. Pamiętaj, że
   pierwszym krokiem E4 jest **pomiar ryzyka O1**, przed napisaniem czegokolwiek.
5. Commit — conventional message, po angielsku. Bez pytania o zgodę tylko wtedy, gdy użytkownik
   wcześniej jej udzielił; w przeciwnym razie propozycja.
