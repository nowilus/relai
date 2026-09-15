# PROMPT_ETAP_5 — Wydanie: testy, walidacja, prowizjonowanie i czternasta komenda publicznie

Plan: OPTYMALIZATOR_PROMPTOW • Etap: **E5 z E5 — OSTATNI** • Wygenerowano: 2026-09-15 (autor: Opus 5, w rytuale „Na koniec" E4) • Wykonawca: **Opus** (STATUS.md planu, D-85)

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **najsilniejszy**, w tym
> narzędziu: **Opus 5** (lista modeli z dnia `2026-09-04`; lista jest starsza niż próg 7 dni —
> `/relai-models` odświeży ją po Twoim „tak"). Jeśli sesja działa na innym modelu — zatrzymaj się
> i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

> **Ten etap zamyka plan.** Jego rytuał „Na koniec" uruchamia **sekwencję zamknięcia planu (D-36)**,
> nie tylko rytuał etapu. Zamknięcie bez wydania potwierdzonego **treścią plików z cache'u** jest
> zamknięciem na słowo — a P-005 mówi wprost, że komunikat CLI o aktualizacji nie jest dowodem.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna, linia aktywnego planu |
| `docs/STATE.md` | stan na dziś — obszar optymalizatora jest na górze sekcji „Nad czym pracujemy teraz"; plik stoi na **299 liniach przy progu 300** |
| `docs/DZIENNIK.md` | **wyłącznie** sekcja „Stan otwartych ryzyk" (**O4**, **O6**, **O8**, **W1** — wszystkie Twoje) i wpis z 2026-09-15 o **E4**: co zostało zmierzone i co świadomie odłożone do tego etapu |
| `docs/LEKCJE.md` | **wyłącznie** sekcja „Zasady aktywne" (limit 15, zajęte 15) |
| `docs/plany/OPTYMALIZATOR_PROMPTOW/PLAN.html` | sekcje **6** (opis E5), **7** (ryzyka **O6** i **O8**), **10** (**Aneks A** z 2026-09-15 — założenie b7 obalone) |
| `docs/plany/OPTYMALIZATOR_PROMPTOW/STATUS.md` | tabela etapów, **cztery bramki**: dwie otwarte (kolizja z ECC, licznik kosztu), jedna o powrocie pilotażu i jedna rozstrzygnięta o prowizjonowaniu — z **punktem zakresu, którego plan nie przewidział** |
| `docs/PULAPKI.md` | **P-005** (sekwencja wydania — update → restart → dowód treścią), **P-010**, **P-011**, **P-012**, **P-013** (korzeniowy `hooks/`) |
| `core/process/prompt-mode.js` | rdzeń trybu ciągłego z E4 — przełącznik, filtr pomijania, treść reguły |
| `adapters/claude-code/hooks/prompt-mode.js` | hook `UserPromptSubmit` z E4 i jego cztery warunki ciszy |
| `core/process/tests/crew.test.js` | **jedyny** dziś test rdzenia — wzorzec, wg którego piszesz testy trybu |
| `core/tools/validate-adapters.js` | co walidator sprawdza dziś; kontrola trybu ciągłego jest do dołożenia |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Nośnik trybu ciągłego jest zmierzony i rozstrzygnięty** (E4): hook `UserPromptSubmit`
  **dokłada kontekst**, promptu nie podmienia. Nie wracasz do wariantu z podmianą i nie przerabiasz
  reguły na `exit 2` — ten nośnik jest zapisany jako materiał dla **osobnego planu po E5**.
- **Tryb ciągły istnieje wyłącznie w Claude Code** (Aneks A). Cursor i Codex dostają **jedno zdanie**
  przy pierwszym wywołaniu komendy w sesji, o braku wsparcia w tej wersji. Nie rozszerzasz zakresu.
- **Hooki, guardraile i moduły rdzenia nie wchodzą do `docs/ARTEFAKTY.md`** — rejestr wyklucza kod
  wykonawczy własną sekcją „Poza rejestrem — świadomie". Do rejestru idą wyłącznie artefakty
  czytane przez model (komendy, agenci, szablony, reguły).
- **Wartość wiersza `Tryb ciągły` w tym projekcie to `włączony`** — wpisana przez właściciela
  2026-09-15. Nie zmieniasz jej „na czas testów".
- **Prowizjonowanie `core/prompt/` należy do tego etapu** (bramka rozstrzygnięta 2026-09-14) —
  kopia idzie do projektu tą samą drogą co specyfikacje, przez `provisionTemplates()`.

## Stan wyjściowy (co realnie zastajesz po E4)

RelAI **2.1.4** w repozytorium i publicznie. W repozytorium — i **nadal niewydane** — są:

```
adapters/claude-code/
  commands/relai-prompt.md          # wersja 4: 11 krokow + sekcja "Tryb ciagly", 16 zakazow
  agents/relai-prompt-optimizer.md  # wersja 2
  hooks/hooks.json                  # UserPromptSubmit dopisany obok czterech zdarzen
  hooks/prompt-mode.js              # hook trybu ciaglego, cztery warunki ciszy
  hooks/session-context.js          # + zdanie o wlaczonym trybie na starcie sesji
core/prompt/{REGULY,SZABLONY}.md    # baza regul i rusztowania
core/process/prompt-mode.js         # przelacznik, filtr pomijania, tresc reguly
core/MANIFEST.json                  # pozycje `prompt` i `prompt-mode`
docs/USTAWIENIA.md                  # `Model optymalizatora` = Sonnet 5, `Jezyk promptu`, `Tryb ciagly` = wlaczony
```

**Zmierzone w E4, przydatne tutaj:** reguła trybu ma **245 znaków** i kosztuje **+110 tokenów**
wejścia na turę; przelicznik **2,2–2,6 znaku na token**; filtr pomijania przechodzi **12 punktów
kontroli**; zdanie o trybie na starcie waży **245 znaków wobec 0** przy wyłączonym przełączniku.

**Czego jeszcze NIE ma (to jest zakres tego etapu):** testów regresyjnych trybu, kontroli w
walidatorze, kopii `core/prompt/` w cudzym projekcie, podbitej wersji pluginu, wydania i dowodu
z cache'u.

**Pułapki, które tu wrócą:** `claude plugin update` nie działa do restartu aplikacji, a kontrola
wbudowana w starą wersję porównuje X z X i milczy (**P-005**) — sekwencja to
**update → restart → dowód treścią plików z cache'u**. Korzeniowy `hooks/` jest katalogiem
konwencyjnym i ładuje się **obok** manifestu (**P-013**) — nowy hook trybu jest w manifeście
adaptera, więc sprawdź, że w korzeniu nie powstał jego duplikat. `claude plugin validate` zna
schemat narzędzia, którego własny walidator nie zna (**W1**).

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/OPTYMALIZATOR_PROMPTOW/E5/`.**

1. **Aneks B — zanim cokolwiek napiszesz.** Plan w sekcji 6 opisuje E5 bez **prowizjonowania
   `core/prompt/`**; bramka dopisała ten punkt 2026-09-14. Zamrożonego planu nie poprawia się
   w miejscu: napisz **datowany Aneks B** w sekcji 10 `PLAN.html` (powód, treść, skutek) i dopiero
   potem pracuj. Jedno zdanie do właściciela, nie pytanie na cztery opcje.
2. **Testy regresyjne w `core/process/tests/`** — wzorzec z `crew.test.js`. Pokrycie minimalne, ale
   każde z **obiema stronami**: przełącznik (`włączony` / `wyłączony` / wartość spoza listy / brak
   wiersza), filtr pomijania (przypadek pomijany **i** przypadek, który musi trafić), treść reguły
   niepusta. Test ma paść, gdy ktoś rozszerzy filtr tak, że połknie zdanie merytoryczne.
3. **Kontrola w `core/tools/validate-adapters.js`** — hook zadeklarowany w `hooks.json` istnieje
   (to już działa) **oraz** rdzeń, który wołają hooki adaptera, jest wymieniony w `MANIFEST.json`.
   Kontrola ma wykryć sytuację odwrotną do dzisiejszej: moduł rdzenia dodany bez wpisu w manifeście.
4. **Prowizjonowanie `core/prompt/` do projektu** (Aneks B) — tą samą drogą co specyfikacje
   (`provisionTemplates()` w `core/process/session-signals.js`), do `.claude/relai/prompt/`.
   Rozstrzygnij wprost, czy kopia **nadpisuje się** przy każdym starcie jak specyfikacje, czy
   **powstaje raz** jak lista modeli — i zapisz powód. Komenda przestaje wtedy zależeć od ścieżki
   awaryjnej; popraw w niej zdanie o „projekcie bez kopii `core/prompt/`", jeśli przestaje być prawdą.
5. **`docs/KOMENDY.md` i `README.md`** — czternasta komenda i tryb ciągły opisane tym, co po wydaniu
   działa. `README.md` **tylko** jeśli zmienia się sposób uruchomienia albo lista komend widoczna
   dla użytkownika.
6. **Wydanie.** Podbicie wersji we **wszystkich pięciu źródłach** (walidator je wylicza), wpis
   w `CHANGELOG` jeśli projekt go prowadzi, `node core/tools/validate-adapters.js` na kodzie 0,
   `node adapters/codex/generate-skills.js --verify` bez rozjazdu, **`claude plugin validate`**
   (W1 — krok obowiązkowy przed tagiem), commit, tag, push, `claude plugin update`, **restart
   aplikacji**, a potem **dowód treścią plików z cache'u**: czternasta komenda, agent, hook trybu
   i moduł rdzenia w katalogu wydanej wersji.
7. **Pomiar na wydanej wersji — to jest sens tego etapu.** W świeżej sesji ze **zainstalowanego**
   pluginu, w projekcie kontrolnym poza repozytorium: komenda `/relai-prompt` działa, delegacja idzie
   na model z wiersza ustawień (**O11 daje się wreszcie zmierzyć** — opóźnienie delegacji w trybie
   ciągłym), tryb ciągły przerabia zdanie i milczy przy wyłączonym przełączniku. **Wszystko treścią
   odpowiedzi, nie komunikatem narzędzia.**

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] **Aneks B napisany przed pracą** — sekcja 10 `PLAN.html`, z powodem i skutkiem; sekcje 1–9
      nietknięte.
- [ ] **Testy rdzenia przechodzą i pilnują obu stron** — uruchomienie pokazane z kodem wyjścia,
      a przynajmniej jeden test **udowodniony negatywnie**: celowo zepsuty filtr wywala test.
- [ ] **Walidator wykrywa brak wpisu w manifeście** — pokazane obiema stronami: manifest pełny →
      kod 0, manifest z usuniętym wpisem `prompt-mode` → błąd z nazwą pliku.
- [ ] **Kopia `core/prompt/` ląduje w projekcie kontrolnym** — liczba plików i suma zgodna ze
      źródłem; zachowanie przy drugim starcie sesji **zmierzone**, nie założone.
- [ ] **`claude plugin validate` → `Validation passed`**, wynik wklejony dosłownie.
- [ ] **Wydanie potwierdzone treścią plików z cache'u**, nie komunikatem CLI (P-005): ścieżka
      katalogu wydanej wersji, obecność czternastej komendy, agenta, hooka trybu i modułu rdzenia.
- [ ] **Świeża sesja z wydanego pluginu ma jeden blok kontekstu startu i zero komunikatów o błędzie
      hooka** (P-013), a przy włączonym trybie — **jedno** zdanie o nim.
- [ ] **Tryb ciągły zmierzony na wydanej wersji** — zdanie merytoryczne wraca z propozycją
      i oryginałem obok; ten sam prompt przy przełączniku `wyłączony` przechodzi nietknięty.
      Obie strony w jednym przebiegu.
- [ ] **O11 dostaje pierwszą liczbę albo jawny powód, dlaczego nadal nie** — opóźnienie delegacji
      mierzone na tym samym zdaniu z delegacją i bez niej.
- [ ] **`docs/USTAWIENIA.md` i sekcja niemutowalna `CLAUDE.md` zmieniane wyłącznie za zgodą
      człowieka** — plik jest chroniony hookiem `config-protection`.
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy", z autorem w nagłówku; `docs/STATE.md`
      nadpisany (**299 linii przy progu 300 — skracaj, nie dokładaj**); `docs/ARTEFAKTY.md`
      i `docs/KOMENDY.md` zaktualizowane.
- [ ] **Katalog roboczy** `.claude/relai/work/OPTYMALIZATOR_PROMPTOW/E5/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak"; **liczby przed i po**
      we wpisie. Artefakty spoza tego katalogu wypisane z nazwy.

**Czego w tym etapie zweryfikować się nie da:** zachowania trybu ciągłego w **cudzym** projekcie
z realną pracą (tylko projekt kontrolny) i tego, jak tryb znosi długą sesję. Nie udajesz, że tych
punktów nie ma — wpisujesz je do dziennika jako świadomie odłożone.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `STATUS.md`: E5 → ZREALIZOWANY (data), **jedna** linia w dzienniku wdrożenia. Potem
   **sekwencja zamknięcia planu (D-36)**: status planu → ZAMKNIĘTY, przegląd **wszystkich** bramek
   manualnych z człowiekiem (kolizja z ECC, licznik kosztu, powrót pilotażu), wyliczenie odnóg
   otwartych w trakcie planu, przeniesienie planu do `docs/archiwum/plany/OPTYMALIZATOR_PROMPTOW/`
   zgodnie ze `SPEC_ARCHIWUM.md`, aktualizacja linii aktywnego planu w `CLAUDE.md` **i w `AGENTS.md`**
   (od 2026-09-15 jest śledzoną kopią `CLAUDE.md`).
2. `docs/DZIENNIK.md`: wpis wg `SPEC_DZIENNIK.md`, podpis `RelAI (<model>) + <git config user.name>`.
   Przegląd „Stanu otwartych ryzyk": **O4 dostaje liczbę ze skutku, nie z nośnika**, **O8** zamykasz
   albo przepisujesz, **W1** dostaje wynik `claude plugin validate`, **O11** pierwszą liczbę.
   Lekcje → `docs/LEKCJE.md` (**limit 15, zajęte 15** — nowa zasada wchodzi przez scalenie).
3. `docs/STATE.md` — nadpisz obszar optymalizatora i sekcję „Liczby"; plan zamknięty przestaje być
   aktywny, więc linia „Aktywny plan" wskazuje **następny albo brak**.
4. **Nie generujesz `PROMPT_ETAP_6.md`** — E5 jest ostatni. Zamiast tego zaproponuj właścicielowi
   **następny plan**: tryb ciągły poza Claude Code (materiał: pomiar Codeksa z 2026-09-15 i nośnik
   `exit 2`) albo powrót planu PIERWSI_UZYTKOWNICY. Propozycja, nie rozpoczęcie.
5. Commit — conventional message, po angielsku. Bez pytania o zgodę tylko wtedy, gdy użytkownik
   wcześniej jej udzielił; w przeciwnym razie propozycja.
