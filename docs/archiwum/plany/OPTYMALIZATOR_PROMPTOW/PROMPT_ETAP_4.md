# PROMPT_ETAP_4 — Tryb ciągły: pomiar ryzyka O1, przełącznik, hook i filtr pomijania

Plan: OPTYMALIZATOR_PROMPTOW • Etap: **E4 z E5** • Wygenerowano: 2026-09-14 (autor: Opus 5, w rytuale „Na koniec" E3) • Wykonawca: **Opus** (STATUS.md planu, D-85)

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **najsilniejszy**, w tym
> narzędziu: **Opus 5** (lista modeli z dnia `2026-09-04`). Jeśli sesja działa na innym modelu —
> zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

> **Pierwszy krok tego etapu jest pomiarem, nie pisaniem.** Ryzyko **O1** rozstrzyga kształt całego
> etapu: hook `UserPromptSubmit` w Claude Code **dokłada kontekst do tury**, a nie podmienia treści
> promptu. Dopóki nie wiesz, co ten hook realnie potrafi w zainstalowanej wersji narzędzia, nie
> piszesz ani jednej linii produktu.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna, linia aktywnego planu |
| `docs/STATE.md` | stan na dziś — obszar optymalizatora jest na górze sekcji „Nad czym pracujemy teraz" |
| `docs/DZIENNIK.md` | **wyłącznie** sekcja „Stan otwartych ryzyk" (**O1** i **O4** — oba twoje) i wpis z 2026-09-14 o **E3**: co zostało zmierzone, czego nie dało się zmierzyć na żywo i dlaczego |
| `docs/LEKCJE.md` | **wyłącznie** sekcja „Zasady aktywne" (15 pozycji, limit osiągnięty; zasady 1 i 5 urosły w E3) |
| `docs/plany/OPTYMALIZATOR_PROMPTOW/PLAN.html` | sekcje **5** (tabela „Gdzie co mieszka" — wiersz `hook UserPromptSubmit`), **6** (opis E4), **7** (ryzyka **O1** i **O4**), **8** (przypadki **b3** komenda RelAI w trybie ciągłym i **b7** sesja w Cursorze albo Codeksie) |
| `docs/plany/OPTYMALIZATOR_PROMPTOW/STATUS.md` | tabela etapów i bramki manualne — **„Czy tryb ciągły dla Cursora i Codeksa dostaje własny plan" czeka na wynik twojego pomiaru O1** |
| `adapters/claude-code/commands/relai-prompt.md` | jedenaście kroków; tryb ciągły ma wołać **tę samą** procedurę, nie własną kopię reguł |
| `adapters/claude-code/hooks/hooks.json` | co dziś jest zadeklarowane: `SessionStart`, `PreToolUse`, `PostToolUse`, `Stop` — `UserPromptSubmit` **nie występuje** |
| `adapters/claude-code/hooks/session-context.js` | wzorzec hooka RelAI: bramka hosta, wyjście ASCII, cisza poniżej progu |
| `core/process/session-signals.js` | rdzeń wołany przez hooki adapterów; przełącznik czytany maszynowo ma trafić tutaj, nie do hooka |
| `docs/USTAWIENIA.md` | wiersze czytane maszynowo — `Model optymalizatora` i `Język promptu` z E2/E3 są wzorcem dla przełącznika trybu |
| `core/templates/SPEC_USTAWIENIA.md` | format wiersza czytanego maszynowo: kotwica na początku komórki, człony po `·`, wartość nierozpoznana znaczy cisza (wyjątek: przełącznik rotacji) |
| `docs/PULAPKI.md` | P-002 (prompt stdin-em), P-005 (sekwencja wydania), P-013 (korzeniowy `hooks/` jako katalog konwencyjny) |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Pomiar O1 idzie pierwszy.** Hook kontrolny w projekcie neutralnym, dowód **treścią odpowiedzi
  modelu**, nie komunikatem narzędzia. Dopiero wynik rozstrzyga, czy tryb ciągły podmienia prompt,
  czy degraduje do **wstrzykniętej reguły**, która każe modelowi najpierw pokazać różnicę.
  Funkcja zostaje w obu wariantach — zmienia się nośnik.
- **Filtr pomijania jest częścią etapu, nie dodatkiem** (b3, ryzyko O4): wywołania `/relai-*`, trzy
  frazy sesji („kończymy na dziś", „kontynuujemy pracę", „sprawdź status"), krótkie potwierdzenia
  i pytania o kod przechodzą **nietknięte**.
- **Cursor i Codex milczą** (b7): hooka tam nie ma, więc tryb mówi o tym **raz**, przy pierwszym
  prompcie merytorycznym w takiej sesji, i nie wraca do tematu. Komenda działa tam normalnie.
- **Przełącznik jest wierszem w `docs/USTAWIENIA.md`**, czytanym maszynowo — jedna edycja wystarcza
  do odwrotu. Wartość wpisuje **człowiek**, po jednym pytaniu.
- **Blok kontekstu i język są zrobione w E3** — tryb ciągły ich nie przebudowuje ani nie kopiuje:
  woła tę samą procedurę.
- **Delegacja w Codeksie rozstrzygnięta w E3**: praca bez delegacji z rdzenia reguł, bez osobnego
  agenta. Nie wracasz do tego.
- **Granica zakresu.** W tym etapie **nie robisz**: testów regresyjnych w `core/process/tests/`,
  kontroli w `validate-adapters.js`, podbicia wersji, prowizjonowania `core/prompt/` do cudzego
  projektu ani sekwencji wydania P-005 — to wszystko należy do **E5**.

## Stan wyjściowy (co realnie zastajesz po E3)

RelAI **2.1.4** w repozytorium i publicznie. Komenda `/relai-prompt` i agent `relai-prompt-optimizer`
istnieją w repozytorium i **nie są wydane** — plugin w scope `user` serwuje trzynaście komend i
trzech agentów, więc ani komendy, ani agenta **nie wywołasz z pluginu** (zmierzone w E3: projekt
kontrolny wszedł w ścieżkę b13, bo agenta w instalacji nie ma). Pliki czytasz wprost z repozytorium.

```
adapters/claude-code/
  commands/relai-prompt.md         # 11 krokow: 1 model i delegacja, 6 blok kontekstu,
                                   # 9 jezyk, 10 kontrola (9 punktow), 11 wyjscie; 16 zakazow
  agents/relai-prompt-optimizer.md # sekcja "Project context block" — blok w TRESCI zadania
  hooks/hooks.json                 # SessionStart, PreToolUse, PostToolUse, Stop — bez UserPromptSubmit
  hooks/*.js                       # 10 hookow Node.js bez zaleznosci npm
core/prompt/SZABLONY.md            # sekcja "Blok kontekstu projektu" z realnym przykladem
core/process/session-signals.js    # rdzen wolany przez hooki adapterow
docs/USTAWIENIA.md                 # wiersze maszynowe: `Model optymalizatora`, `Jezyk promptu`
```

**Zmierzone w E3, przydatne tutaj:** blok kontekstu waży **217–473 tokeny** na wywołanie (674–1 320
znaków), a limit to 1 300 znaków i sześć pozycji. Tryb ciągły mnoży ten koszt przez liczbę zdań
w sesji — to jest materiał do ryzyka **O4** i do sprawy „czy tryb ciągły ma licznik kosztu".

**Czego jeszcze NIE ma (to jest zakres tego etapu):** wiedzy, co potrafi `UserPromptSubmit`;
przełącznika w ustawieniach; hooka; filtru pomijania; zdania o włączonym trybie na starcie sesji.

**Pułapki zmierzone wcześniej, które tu wrócą:** prompt do `claude -p` podawaj **stdin-em** (P-002);
korzeniowy `hooks/` jest dla Claude Code katalogiem konwencyjnym, więc nowy hook deklarujesz
w manifeście adaptera, nie w korzeniu (P-013); dostępność świeżej sesji CLI bywa zmienna i **potrafi
skończyć się limitem konta w połowie pomiaru** — sprawdź ją jednym najtańszym wywołaniem, zanim
zaplanujesz serię (L-0084, L-0087; w E3 limit zatrzymał pomiar na 40 minut).

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/OPTYMALIZATOR_PROMPTOW/E4/`.** Wszystko
tymczasowe — hook kontrolny, projekty kontrolne, wyjścia przebiegów, instrument filtru — powstaje
tam. Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy), wpisujesz do
wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od `relai-optymalizator-`.

1. **Pomiar ryzyka O1 — pierwszy, przed czymkolwiek innym.** Hook kontrolny `UserPromptSubmit`
   w projekcie neutralnym: czy to, co hook wypisze, **zastępuje** prompt użytkownika, czy tylko
   **dokłada się** do tury. Dowód treścią odpowiedzi modelu w obie strony (wariant z hookiem
   i bez), nie komunikatem narzędzia ani dokumentacją. Wynik zapisz **zanim** napiszesz produkt —
   on rozstrzyga punkt 3.
2. **Wiersz `Tryb ciągły` w `docs/USTAWIENIA.md`** — format czytany maszynowo wg
   `SPEC_USTAWIENIA.md`: kotwica od początku komórki, zamknięta lista brzmień, człony po `·`.
   Wartość wpisuje **człowiek**, po jednym pytaniu. Rozstrzygnij wprost, czy wartość nierozpoznana
   znaczy ciszę (reguła domyślna), czy wyłączenie trybu z jednym zdaniem — jak przy rotacji.
3. **Hook `UserPromptSubmit` w adapterze Claude Code** — w kształcie, który wyszedł z punktu 1:
   podmiana promptu albo wstrzyknięta reguła „najpierw pokaż różnicę, potem wykonaj". Deklaracja
   w `adapters/claude-code/hooks/hooks.json` i w manifeście, bramka hosta jak w pozostałych hookach
   (P-013), wyjście ASCII, cisza przy wyłączonym przełączniku. Logika czytania przełącznika idzie
   do `core/process/session-signals.js`, nie do samego hooka.
4. **Filtr pomijania** (b3): `/relai-*`, trzy frazy sesji, krótkie potwierdzenia, pytania o kod.
   Mierzony parą przypadków w jednym przebiegu, z których jeden **musi** trafić (zasada 5).
5. **Zdanie o włączonym trybie na starcie sesji** — jedno, w hooku `SessionStart`, tylko gdy
   przełącznik jest włączony; poniżej tego warunku cisza gwarantowana.
6. **Sesja w Cursorze albo Codeksie** (b7): tryb milczy, mówi o tym raz przy pierwszym prompcie
   merytorycznym. Rozstrzygnij, **gdzie** to zdanie mieszka, skoro hooka tam nie ma.
7. **`docs/ARTEFAKTY.md`** — nowy hook jako pozycja rejestru, podbicie wersji komendy, jeśli ją
   ruszysz; przeliczenie liczby pozycji komendą, nie okiem. **`docs/KOMENDY.md`** — tryb ciągły
   w sekcji zachowań automatycznych, opisany wyłącznie tym, co po tym etapie działa.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] **Ryzyko O1 zmierzone, nie założone** — wynik hooka kontrolnego pokazany treścią odpowiedzi
      modelu w dwóch wariantach jednego przebiegu (hook aktywny / hook nieobecny). Wniosek zapisany
      jednym zdaniem: „hook podmienia prompt" albo „hook dokłada kontekst" — i to on tłumaczy
      kształt punktu 3 zakresu.
- [ ] **Tryb ciągły działa na żywym prompcie** — zdanie podyktowane w sesji z włączonym
      przełącznikiem wraca **z propozycją i oryginałem obok**, zanim cokolwiek zostanie wykonane.
      Dowód treścią odpowiedzi.
- [ ] **Wyłącznik wyłącza** — ten sam prompt przy przełączniku `wyłączony` przechodzi **nietknięty**
      i bez ani jednego znaku od trybu. Obie strony w jednym przebiegu (zasada 4).
- [ ] **Filtr pomijania mierzony parą** — `/relai-stage` i fraza „kończymy na dziś" przechodzą
      nietknięte, a zdanie merytoryczne o podobnej długości **musi** zostać przerobione. Kontrola
      przeciw zawyżeniu: filtr nie łapie zdania, które tylko wspomina nazwę komendy.
- [ ] **Wiersz `Tryb ciągły` czytany maszynowo** — wartość z zamkniętej listy → rozpoznana; wartość
      spoza listy → zachowanie ustalone w punkcie 2 zakresu, pokazane **obiema stronami**; brak
      wiersza → tryb wyłączony, cisza.
- [ ] **Zdanie o trybie na starcie sesji** — jest przy przełączniku włączonym, **nie ma go** przy
      wyłączonym; różnica zmierzona parą wariantów różniących się wyłącznie tym wierszem
      (wzorzec z E3 planu REKOMENDACJA_MODELU: 258 znaków wobec 0).
- [ ] **Koszt trybu policzony, nie oszacowany** — ile tokenów dokłada jedna tura z trybem wobec tury
      bez niego, na **tym samym** zdaniu; sygnał mniejszy od szumu wzmacniasz powieleniem materiału
      i podajesz pasmo błędu (L-0105). Liczba idzie do ryzyka **O4** i do sprawy człowieka
      „czy tryb ciągły ma licznik kosztu".
- [ ] **Cursor i Codex** (b7) — zdanie o milczeniu trybu pada **raz**; dowód z pliku albo z przebiegu,
      a jeśli żywej sesji nie da się uruchomić, **fixtura opisana wprost jako fixtura** (L-0106).
- [ ] **Hook nie psuje startu sesji** — świeża sesja w tym repozytorium ma **jeden** blok kontekstu
      startu i **zero** komunikatów o błędzie hooka (P-013). Dowód treścią wyjścia sesji.
- [ ] **`docs/USTAWIENIA.md` zmieniony za zgodą człowieka** — plik jest chroniony hookiem
      `config-protection`; zapis bez potwierdzenia jest defektem, nie skrótem.
- [ ] `node core/tools/validate-adapters.js` kończy się kodem 0, a `node adapters/codex/generate-skills.js --verify` nie zgłasza rozjazdu.
- [ ] Wpis w `docs/DZIENNIK.md` dopisany **na końcu** sekcji „Wpisy", z autorem w nagłówku;
      `docs/STATE.md` nadpisany; `docs/ARTEFAKTY.md` i `docs/KOMENDY.md` zaktualizowane.
- [ ] **Katalog roboczy** `.claude/relai/work/OPTYMALIZATOR_PROMPTOW/E4/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak"; **liczby przed i po**
      w sekcji „Zweryfikowane" wpisu. Artefakty, które musiały powstać **poza** tym katalogiem,
      wypisane z nazwy razem z tym, co się z nimi stało.

**Czego w tym etapie zweryfikować się nie da:** zachowania z **wydanego** pluginu (E5) i trybu
ciągłego w cudzym projekcie. Nie udajesz, że tych punktów nie ma — wpisujesz je do wpisu dziennika
jako świadomie odłożone.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/OPTYMALIZATOR_PROMPTOW/STATUS.md`: E4 → ZREALIZOWANY (data), E5 → GOTOWY DO STARTU,
   link do `PROMPT_ETAP_5.md` w kolumnie `Prompt`, **jedna** linia w dzienniku wdrożenia.
   **Bramka „Czy tryb ciągły dla Cursora i Codeksa dostaje własny plan" ma w tym etapie swój
   materiał** — rozstrzygnij ją z człowiekiem, pokazując wynik pomiaru O1. Sprawa „czy tryb ciągły
   ma licznik kosztu" dostaje liczbę z punktu weryfikacji o koszcie.
2. `docs/DZIENNIK.md`: wpis wg `SPEC_DZIENNIK.md` na końcu sekcji „Wpisy" (Zrobione / Zweryfikowane
   — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka), podpis
   `RelAI (<model>) + <git config user.name>`. Przegląd „Stanu otwartych ryzyk": **O1 zamykasz albo
   przepisujesz wynikiem**, **O4 dostaje liczbę**, **O11** (opóźnienie delegacji w trybie ciągłym)
   po raz pierwszy daje się zmierzyć. Lekcje → `docs/LEKCJE.md` + odświeżone „Zasady aktywne"
   (**limit 15, zajęte 15** — nowa zasada wchodzi przez scalenie, nie przez dopisanie szesnastej).
3. `docs/STATE.md` — nadpisz obszar optymalizatora; `README.md` **tylko** jeśli zmienił się sposób
   uruchomienia. Plik jest **316 linii przy progu 300** — skracaj przy okazji, nie dokładaj.
4. **Wygeneruj `PROMPT_ETAP_5.md`** w tym folderze, ze specyfikacji promptu etapowego: na bazie
   `PLAN.html` (sekcja 6 — opis E5), **realnego stanu repozytorium po tym etapie** i lekcji z tego
   etapu. E5 jest **ostatni**, więc jego rytuał „Na koniec" uruchamia sekwencję zamknięcia planu
   (D-36) — napisz to w prompcie wprost.
5. Commit — conventional message, po angielsku. Bez pytania o zgodę tylko wtedy, gdy użytkownik
   wcześniej jej udzielił; w przeciwnym razie propozycja.
