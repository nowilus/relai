# PROMPT_ETAP_4 — Mapa przepływu i koszt etapu w panelu RelAI

Plan: PANEL_CLAUDE • Etap: **E4 z E9** (kolejność wykonania E1, E2, E8, E3, E9, E4, E5, E6, E7 — Aneksy A i B; Aneksy C i D w sekcji 10) • Wygenerowano: 2026-10-09 (autor: Opus 5.5, w rytuale „Na koniec" etapu E9) • Wykonawca: **Opus** (STATUS: „model wykonawczy: Opus, w Claude Code"), `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`; D-85). Jeśli sesja działa na innym modelu —
> zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom
> `/effort`: `high` (przypisanie kosztu do etapu nie ma dziś klucza w rekordzie pomiaru — reguła
> przypisania jest decyzją z przypadkami brzegowymi, a błąd zawyży albo zaniży koszt etapu bez śladu).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sekcja niemutowalna, rytuał „Na koniec" |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (C1, C3, C8, C10, C11) + wpis „2026-10-09 — E9 planu PANEL_CLAUDE" (rodzina trzech pluginów, kalibracje, „Świadomie odłożone") |
| `docs/LEKCJE.md` | wyłącznie „Zasady aktywne" — przepisane też niżej (zwłaszcza 4, 5, 13, 15) |
| `docs/PULAPKI.md` | **P-017**, **P-018**, **P-020**, **P-021** (silnik modów 2.1.293: łańcuch `next`, co rysuje desktop, pomiar tokenów i wykresy, katalog sesji idzie za `cd`, klucze na `Box`, interaktywne Svg) |
| `docs/plany/PANEL_CLAUDE/PLAN.html` | sekcja 3 (cel „Mapa przepływu" i jego kryterium), sekcja 6 (wiersz E4), sekcja 8 (przypadki brzegowe: dwie sesje, zmiana modelu, zadanie w Codeksie/Cursorze), sekcja 10 (Aneksy B i C — granica E9/E4) |
| `docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md` | styl elementów nad promptem, gdyby E4 cokolwiek tam dokładało |
| `core/panel/plan-state.mjs`, `core/panel/progress.mjs` | `parseStatus` (etapy, statusy), `stageProgress`, `crewProgress` (format przebiegu `/relai-crew`: `zadania.json` + manifest) |
| `core/panel/measure.mjs`, `core/panel/pricing.mjs` | rekord pomiaru (14 pól, bez pola etapu i zadania), `aggregate`, `projectSummary`, `priceRecord` |
| `panel/hooks/register.tsx` | panel boczny: zakładki `Komendy`, `Ściąga`, `Frazy`, `Koszty`; kolektor; `section`, `heading`, karty w motywie |
| `.claude/relai/templates/SPEC_ODNOGA.md`, `SPEC_STATUS.md` | gdzie mieszkają odnogi i jak wygląda ich linia w `STATUS.md` |

Typy API modów: wczytaj skill `plugin-authoring` i przeszukaj `claude-code.d.ts` tego builda
(`grep`), zanim użyjesz elementu, którego panel jeszcze nie używa.

## Decyzje już podjęte — nie otwierasz ich ponownie

- Wariant A planu: **mod rysuje i wywołuje, rdzeń liczy** — model mapy, przypisanie kosztu
  i scalanie w `core/panel/*.mjs`, kopia do pluginów wyłącznie przez
  `node core/tools/sync-panel-core.js`; wszystko, co dostaje `$` albo `on`, w pliku modułu hooków
  (L-0136).
- Aneks C (2026-10-09): rodzina pluginów w repo — `relai-panel` (`panel/`, plan i panel boczny),
  `relai-progress` (`progress/`, pasek postępu i panel `/relai-agents`), `relai-cache-keeper`
  (`cache-keeper/`, timer cache). Mapa i koszt etapu należą do **panelu bocznego `relai-panel`**
  (plan, sekcja 6); `relai-progress` tylko pokazuje postęp i agentów — nie dubluj mapy w nim.
- R7: `relai-panel` i `relai-progress` **nie wołają modelu**, nie dopisują nic do promptu
  systemowego, nie używają sieci. Postęp i mapa wyłącznie z deterministycznych źródeł — pliki
  `STATUS.md`, prompty etapów, karty odnóg, pliki przebiegów `/relai-crew`, kolektor E3; bez
  `$.tool.register` (Aneks C).
- Koszt bierzesz z kolektora E3 (`.claude/relai/pomiary/<data>-<sesja>.jsonl`), nie liczysz drugi
  raz; brak pomiaru i brak ceny to **dwa różne komunikaty** słowem, nigdy zero (L-0147); kwoty
  i procenty z dwoma miejscami po przecinku (L-0145). Cennik zna dziś tylko Opus 5.5 — model spoza
  listy daje „brak ceny dla <model>" i sumę częściową (odświeżenie cennika to E6).
- Wygląd panelu bocznego z E8: motyw RelAI (`THEME`), nagłówki Kalamem w `Svg` z `HEADINGS`
  (`build-panel-headings.js`), karty zaokrąglone, natywne przyciski; terminal — ten sam tekst w tych
  samych kolorach. Każde nowe `Svg` przechodzi Chromium (900 / 560 / 360 px, kontrola na
  podłożonym defekcie) przed pokazaniem na żywo (L-0142).
- Etykieta stanu nazywa stan słowem i znakiem; „x/y" tylko tam, gdzie y jest celem (L-0147).
- **Granica zakresu:** E4 = mapa (plany, etapy, odnogi, przebiegi załogi z zależnościami
  i równoległością), **przypisanie pomiarów do etapu i zadania**, ręczne scalanie zadań. Karta
  potwierdzenia `/relai-stage`, edycja załogi i listy wyboru — **E5**; podgląd dokumentów
  i odświeżanie cennika z sieci — **E6**, w tym przypomnienie o modelu bez ceny i pobranie cennika
  po karcie potwierdzenia (**Aneks D**, 2026-10-09 — w E4 brak ceny zostaje słowem, bez pytania
  o aktualizację); README, wpisy `relai-progress` i `relai-cache-keeper`
  w `marketplace.json`, wydanie — **E7**. Doradca „wysłać / compact / nowa sesja" w
  `relai-cache-keeper` czeka na materiały człowieka — **poza zakresem E4**.

## Stan wyjściowy (co realnie zastajesz po E9)

RelAI 2.7.1 w repo i publicznie. Trzy pluginy modów w repo, **niewydane, niezainstalowane,
bez wpisów w `marketplace.json`**: `relai-panel` 0.5.0, `relai-progress` 0.1.0, `relai-cache-keeper`
0.2.0; mierzone przez hot reload modów sesji (kopie w `~/.claude/dev-mods/<id-sesji>/<plugin>/`,
zgoda człowieka w oknie „Enable hot reloading"). Oryginały `savvy-progress@claude-kit`
i `cache-keeper-pl@lukasz-mods` są **wyłączone** w `~/.claude/settings.json`. Binarka silnika:
`%APPDATA%/Claude/claude-code/2.1.293/83cb0bd7fed4/claude.exe` z wnętrza sesji; w zwykłym
PowerShellu ścieżka MSIX (P-019). TypeScript: `npx -y -p typescript@5 tsc -p <tsconfig>` —
tsconfig odtwarzasz w katalogu roboczym (strict, `noUncheckedIndexedAccess`, `allowJs` +
`checkJs`, `jsx: react`, `jsxFactory: h`; `include`: plik typów silnika ze skilla, `panel/hooks`,
`panel/types`, `progress/hooks`, `progress/types`, `cache-keeper/hooks`, `core/panel/*.mjs`;
`exclude`: `*.test.ts`). Nagłówki Kalamem wymagają fontTools — w venv w katalogu roboczym:
`python -m venv <katalog>/venv`, `<katalog>/venv/Scripts/python -m pip install fonttools brotli`,
potem `PYTHON=<katalog>/venv/Scripts/python node core/tools/build-panel-headings.js`.

```
core/panel/plan-state.mjs         # parseActivePlan, parseStatus (etapy i statusy), ancestors (korzeń w górę, P-021)
core/panel/progress.mjs           # checklistItems, stageProgress, crewProgress (.claude/relai/work/CREW/<run>/), pick
core/panel/agents.mjs             # spawned, stepped, finished, agentCost, counts, agentsLabel (MIT savvy-progress)
core/panel/measure.mjs            # rekord pomiaru (bez etapu i zadania), aggregate, turnSeries, projectSummary
core/panel/pricing.mjs            # cennik 2026-10-08 (tylko Opus 5.5), priceRecord
core/panel/charts.mjs             # stackBar, hoverColumns, segments, segmentText, hoverSegments
core/panel/theme.mjs              # ROOT, THEME, HEADINGS (w tym progress, agents), BAND, BAR
core/panel/headings.mjs           # GENEROWANY: nagłówki Kalamem + NUMERALS
core/panel/tests/*.test.js        # testy rdzenia
core/tools/sync-panel-core.js     # kopia rdzenia do panel/hooks/core, progress/hooks/core, cache-keeper/hooks/relai (+ --check)
panel/hooks/register.tsx          # pasek planu, kolektor pomiarów, panel boczny (Komendy, Ściąga, Frazy, Koszty)
panel/hooks/*.test.ts             # 32 testy relai-panel
progress/hooks/register.tsx       # pasek postępu (segmenty z podpowiedzią), panel /relai-agents
progress/hooks/progress.test.ts   # 16 testów relai-progress
cache-keeper/hooks/register.tsx   # timer cache, podtrzymanie i przekazanie na żądanie
cache-keeper/hooks/band.test.ts   # 19 testów relai-cache-keeper (z testami oryginału)
docs/archiwum/plany/PROWADZENIE_END_TO_END/STATUS.md   # materiał kryterium: 7 etapów, wszystkie ZREALIZOWANY
```

Testy repo: `node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js adapters/codex/tests/*.test.js core/panel/tests/*.test.js`
(201/201 po E9, FAKT). Testy modów: `claude plugin test .` binarką 2.1.293 w `panel/` (32/32),
`progress/` (16/16) i `cache-keeper/` (19/19) — FAKT.

Rekord pomiaru ma pola `v, tool, session, turn, index, agent, kind, model, at, input, cacheRead,
cacheWrite, output, missing` — **nie ma pola etapu ani zadania**. Znacznik czasu `at` i identyfikator
sesji są w każdym rekordzie; daty etapów są w `STATUS.md` (dzień, bez godziny) i w dzienniku
wdrożenia. Plików przebiegów `/relai-crew` w tym repo dziś nie ma (`.claude/relai/work/CREW/`
nie istnieje) — materiał testowy podkładasz sam.

**Czego jeszcze nie ma (to jest zakres tego etapu):** mapy przepływu (plany, etapy, odnogi,
przebiegi załogi z zależnościami i równoległością, rozwijane), przypisania pomiarów do etapu
i zadania, kosztu etapu w panelu, ręcznego scalania zadań.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie** (przepisane w całości):

1. **Specyfikacja dokumentu jest kompletna albo martwa:** kończy się realnym przykładem, wypisuje
   wymaganą strukturę w treści (odesłanie nie wystarcza) i ma zapisaną ścieżkę „pytam zamiast
   zmyślać" wraz z formą zapisu luki. **Wzorzec powtarzalny sprawdzasz na całej rodzinie
   dokumentów** — punkt „stare brzmienie nie zwraca nic" uruchamiaj na katalogu specyfikacji, bo
   jego wartością jest trafienie **poza** zakresem etapu; takie trafienie jest sygnałem odchylenia,
   nie usterką weryfikacji. **Pierwszy realny przebieg reguły jest częścią jej pisania**, nie
   kontrolą po fakcie: planuj go przed zamknięciem pliku, a rozjazd traktuj jako defekt reguły,
   nie jako wyjątek do obejścia w wykonaniu. **Reguła produkująca tekst opisuje początek wiersza
   i to, czego w nim nie ma**, nie tylko jego zawartość — model domyka lukę formatem materiału,
   który ma pod ręką; materiał sprzed poprawki reguły zostaje obok materiału po niej. **Linia
   raportu, która ma poświadczać krok, bierze treść z wyniku polecenia tego kroku** („Zmiana:
   <pliki z git status>", „brak po przeglądzie git diff") — linia bez takiej kotwicy powstaje bez
   uruchomienia polecenia.
   (L-0001, L-0011, L-0026, L-0089, L-0100, L-0108, L-0129)
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
   wraca do człowieka jako aneks, a nie kończy etap jako niedowieziony punkt. **Autor promptu
   etapu robi to samo przy pisaniu kryterium** — na materiale i wobec reguł specyfikacji, którą
   etap wykona. **Etap przenoszący treść liczy metrykę treści na całym pakiecie** (plik źródłowy
   + pliki docelowe), bo sam plik źródłowy pokazuje przeprowadzkę, nie zmianę. **Kryterium liczące
   wywołania narzędzia zaczynasz od listy narzędzi w `init` trybu pomiaru** — narzędzia nieobecnego
   (AskUserQuestion w `claude -p`) nie da się policzyć, a zero wygląda jak sukces. **Kryterium
   wyszukujące wzorzec nie przeszukuje plików, które ten wzorzec cytują** — prompt etapu łapie sam
   siebie. **Tekst, który tłumaczy liczbę, ma warunek prawdziwości i test dla stanu docelowego**,
   nie tylko dla sesji pomiarowej, w której powstał (L-0144). (L-0017, L-0018,
   L-0040, L-0051, L-0052, L-0063, L-0069, L-0082, L-0115, L-0117, L-0123, L-0134, L-0144)
5. **Instrument pomiarowy sam bywa źródłem fałszu:** wyrażenia regularne trzymaj w pliku zapisanym
   narzędziem zapisu, nie w `node -e` ani w heredoku, a tekst z backslashem (także ścieżkę
   Windows) wstawiasz Edit/Write albo piszesz z `/` (L-0116, L-0119); **skrypt edycji kodu, który
   niesie `\n` albo ścieżkę Windows, powstaje narzędziem Write — heredok bez wyjątku „tylko ten
   jeden raz"** (L-0148); scenariusz „konfiguracji nie ma" mierz z podstawionym katalogiem domowym; dokładaj
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
   **Instrument porównujący dwa drzewa odtwarza materiał przed każdym wariantem** i dowodzi na
   końcu, że materiał wyszedł nietknięty — a **wynik wariantu, który ma przeżyć pomiar, wynosisz
   z katalogu odtwarzanego od razu**; plik brany z katalogu kontrolnego przenosisz z porównaniem
   sumy, nie samym `cp`. Wyczerpany limit konta zatrzymuje pomiar i idzie do
   odnogi, nie do adnotacji „sprawdzone inaczej" — ale **niedostępność cudzej usługi sprawdzasz
   ponownie jednym najtańszym wywołaniem**, zanim odpiszesz pomiar jako niewykonalny: lekcja o niej
   niesie datę i jest hipotezą, nie werdyktem. **Datowanie działa w obie strony** — „usługa działała
   wczoraj" też jest hipotezą, więc etap opierający punkt weryfikacji na cudzej usłudze sprawdza ją
   przed rozpoczęciem pracy. **Przebieg, w którym oczekujesz ciszy, jest ważny wyłącznie razem
   z kontrolą pozytywną w tym samym przebiegu** — awaria ładowania modułu wygląda dokładnie jak
   zachowanie domyślne mechanizmu, więc na kontrolę pozytywną patrzysz pierwszą. **Cisza zmierzona
   złym wejściem jest fałszem, nie ciszą** — narzędzie wołane z podstawionym payloadem dostaje
   kontrolę pozytywną **na tym samym wejściu** (odbite pole, nazwa projektu), bo „0 znaków" wygląda
   tak samo przy poprawnej ścieżce i przy rozjechanej. **Kontrolę pozytywną stawiasz na wejściu,
   którego mechanizm naprawdę pilnuje** — wejście z jego własnej listy wyłączeń (ścieżka objęta
   `.gitignore`, rozszerzenie pomijane, tryb wyciszony) daje przebieg zielony niezależnie od tego,
   czy mechanizm żyje; listę wyłączeń czytasz w kodzie, zanim postawisz kontrolę. **Wniosek
   o własności cudzego narzędzia, wyprowadzony w czasie, gdy własny artefakt był zepsuty, wygasa
   razem z jego naprawą** — datuj go wersją artefaktu, nie tylko dniem, i sprawdź ponownie, zanim
   oprzesz na nim zakres etapu. **Porównanie dwóch nieistniejących wejść jest zgodnością** —
   instrument porównujący dwa źródła sprawdza najpierw, czy oba istnieją, i zgłasza brak jako osobny
   stan, bo suma pustego strumienia jest po obu stronach ta sama; kontrola pozytywna wobec **innej
   wersji** musi zwrócić różnicę. **Agregat po wykrytych elementach bierze też elementy innej klasy
   niż mierzona** — `min()` po pasmach ciemnych pikseli zwraca kreskę, nie wiersz tekstu; próg
   odsiewu podajesz jawnie i pokazujesz cały zbiór obok wyniku. **Metrykę „czy X jest w tekście"
   stawiasz na dwóch licznikach naraz** — wąskim, ze słownika własnego wzorca, i szerokim, z brzmień,
   którymi to samo mówi ktoś, kto Twojego wzorca nie zna; szeroki dostaje kontrolę **przeciw
   zawyżeniu** na materiale, który tej rzeczy na pewno nie ma, a rozjazd między licznikami jest
   wynikiem, nie usterką. **Najpierw klasyfikujesz kształt odpowiedzi, potem liczysz jakość** — i
   liczysz ją wyłącznie tam, gdzie mierzona rzecz miała powstać; liczba przypadków stoi w raporcie
   obok procentu, bo procent bez mianownika kłamie najciszej, a sam rozkład kształtów bywa
   ważniejszy od jakości. **Różnica dwóch przebiegów mierzy tylko to, co przekracza szum** — zmierz
   szum między dwiema bazami, a sygnał od niego mniejszy wzmocnij powieleniem materiału i podaj
   pasmo błędu razem z kontrolą na połowie materiału. **Scenariusz „czegoś nie ma" planuj razem
   z listą mechanizmów, które to coś tworzą same**; czego nie da się odciąć, tam pomiar schodzi na
   fixturę i mówi to wprost. **Licznik wąski buduj przez wykluczenie znaku otwierającego przypadek,
   który ma odpaść** — alternatywa ogólna znosi zamkniętą listę brzmień, a kontrola oczekująca tego
   samego od licznika wąskiego i szerokiego nie sprawdza niczego. **Zero trafień w cudzym
   transkrypcie jest najpierw zdaniem o instrumencie** — nazwa narzędzia w cudzym protokole jest
   takim samym wariantem jak nazwa pola, więc wypisz zbiór nazw, które w materiale wystąpiły, zanim
   orzekniesz, że tej jednej nie ma. **Nową kontrolę spójności uruchamiasz na zastanym materiale,
   zanim nazwiesz ją profilaktyką**: jej pierwsze trafienia są wynikiem etapu, a cisza od pierwszego
   uruchomienia jest podejrzana do czasu pokazania drugiej strony na podłożonym defekcie; fałszywe
   trafienie zawężasz **z powodem**, nie wyciszeniem kontroli.
   **Pomiar czytelności klatek bierze wyłącznie klatki ustalone i oba kierunki kontrastu** — szczeliny
   między jasnymi literami na ciemnym panelu i klatki przenikania nie są tekstem; **korpus kontroli
   pokrycia to sam materiał źródłowy**, bez dokumentacji poprzedniego pomiaru, która niesie jego
   cytat kontrolny.
   **Limit tur w pomiarze ustawiasz na cały łańcuch, który mechanizm uruchamia przed mierzonym
   krokiem**, i czytasz kod wyjścia każdej sesji — wyjście limitem obok „nie wywołano" znaczy
   „nie zmierzono"; instrument poprawiony w trakcie idzie od nowa dla obu wariantów. **Podłożony
   hook sprawdzasz `node --check` i liczysz w transkrypcie zdanie, które ma wstrzyknąć** — zero
   trafień unieważnia przebieg (L-0127). **Kontrola spójności puszczona po historii commitów mierzy
   inną semantykę niż na drzewie roboczym** — trafienia dzielisz na „naprawione później" i „nigdy",
   zanim nazwiesz je defektem (L-0131). **Wiersz z backslashem w kodzie wstawiasz tylko Edit/Write,
   także przy edycji zbiorczej** — skrypt Pythona z heredoku zgubił poziom ucieczki dwa razy w jednym
   etapie (L-0135); w E3 trzeci raz, `node -` z heredoku — sprawdzaj wynik grepem stałego ciągu.
   **Instrument w środowisku bez `append` pisze plik na proces** — dwóch pisarzy jednego pliku
   kasuje sobie wiersze (L-0141). **Porównanie dwóch plików kasuje oba przed przebiegiem** i
   sprawdza, że oba powstały teraz — nieudany zapis wygląda jak zgodność ze starym wynikiem (L-0143).
   (L-0032, L-0037, L-0095, L-0096, L-0105, L-0106, L-0107, L-0110, L-0111, L-0113,
   L-0097, L-0101, L-0102,
   L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086, L-0087, L-0088,
   L-0090, L-0091, L-0124, L-0125, L-0130, L-0131, L-0135, L-0141, L-0143)
6. **Próg jest liczbą, którą ktoś liczy:** kalibruj go na zmierzonych plikach realnych projektów,
   zapisuj w jednostce mechanizmu kontrolnego wraz z komendą sprawdzającą i daj mu **jeden**
   wyzwalacz — wielkości pomocnicze wskazują przyczynę wewnątrz komunikatu, nie wywołują go.
   **Blokadę przeniesioną pod nowy adres mierzysz tak samo:** licz na realnym pliku, ile pozycji
   przechodzi po zmianie — reguła wskazująca „najstarszy element" w mechanizmie idącym od
   najstarszego zatyka go z definicji. **Próg porównuj do wielkości, którą mechanizm kontroluje**
   (część usuwalna), a sygnał o zatkaniu wyzwalaj **różnicą między możliwym a wykonanym**, nie
   zerem wykonanego — warunek „nic nie przeszło" milczy przy „przeszło 2 z 87". **Liczbę zbioru
   liczysz także w komunikacie sukcesu**, nie tylko w asercji: literał w tekście czytanym przez
   człowieka jest zapisem stanu z dnia napisania i przy pierwszej zmianie zakresu staje się cichym
   fałszem. **Wielkość odejmowaną od pomiaru traktujesz jako hipotezę o stałej i sprawdzasz ją,
   zanim na niej oprzesz liczbę** — różnica ujemna albo rozjeżdżająca się znaczy, że nie ma czego
   odejmować; zostaje liczba surowa i różnica między wariantami mierzonymi w tych samych warunkach,
   gdzie narzut skraca się sam. Wynik oparty na nierzetelnym odjęciu **oznaczasz** jako nierzetelny,
   a nie usuwasz. (L-0034, L-0049, L-0053, L-0060, L-0065, L-0099, L-0104)
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
   właściciela znaczy „sprawdzone i zgodne". **Stan zapisywany przez model ma kształt, w którym nie ma czego
   scalać** — osobny plik na zapisującego, nie wspólny plik z regułą scalania opisaną prozą.
   **Fakt rozstrzygnięty przez wywołującego idzie do subagenta jako rozstrzygnięty** — agent
   widzi węższy materiał, więc go nie sprawdza i nie komentuje. **Zmiana formatu pliku, którego
   kopia w projekcie jest trwała, ma od razu drogę migracji kopii** (uzupełnienie brakującego pola
   po kluczu, reszta nietknięta). **Plik doczytywany, który ma działać na klasie `balanced`, ma
   drogowskaz w warstwie zawsze obecnej** — zdanie z wyzwalaczem i nazwą pliku; ogólne „wywołaj
   skill" Sonnet 5 pomija. **Drogowskaz działa tylko przy wyzwalaczu frazą z promptu** („coś nie
   działa"); krok wyzwalany kształtem zadania (każde zadanie z kodem) stoi w warstwie zawsze obecnej
   **sam, w skrócie**, a plik doczytywany niesie pełną procedurę.
   (L-0015, L-0030, L-0036, L-0112, L-0120, L-0121, L-0126, L-0128)
9. **Skill nie zakłada dostępu do niczego poza katalogiem roboczym** — ani do katalogu pluginu, ani
   do domowego. Opis mieści się w **1 024 znakach** i mówi w trzeciej osobie, co skill robi i kiedy
   go użyć, z markerem projektu i płaską listą fraz — bez `MUST BE USED` (zmierzone 2026-09-24:
   opus i sonnet bez spadku; haiku nie jest kryterium). Każdy krok sięgający dalej ma zapisane
   wyjście po odmowie dostępu. (L-0009, L-0010, L-0012, L-0023, L-0114)
10. **Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI**, zachowania mierzysz
    świeżą sesją, a po podbiciu numeru przepuszczasz repo `grep`-em po starym (zwykłym `grep -r`,
    nie `git grep`, który nie widzi plików nowych w etapie) i rozstrzygasz każde
    trafienie — **także w treści komend, skilli i specyfikacji**, dzieląc je na wzmianki
    historyczne i deklaracje stanu docelowego. Kontrola patrząca tylko na manifesty tej różnicy nie
    widzi. **Zachowanie zmienione, ale jeszcze niewydane, mierzysz artefaktem podłożonym lokalnie
    w projekcie kontrolnym** — hook przez `.claude/settings.json`, skill przez `.claude/skills/`
    pod **inną nazwą** niż wersja z pluginu; kolizja nazw znaczy, że nie wiesz, którą treść
    zmierzyłeś. Cały plugin podkładasz `claude -p --plugin-dir <kopia>` z wyłączoną instalacją
    (`--settings` z `enabledPlugins` na `false`) i sprawdzasz ścieżkę pluginu w zdarzeniu `init`.
    (L-0004, L-0008, L-0020, L-0061, L-0085, L-0118)
11. **Końce linii są wariantem, nie szczegółem.** Sumy kontrolne porównuj po normalizacji
    CRLF → LF; w regexie nad pojedynczą linią nie zakotwiczaj końca, bo kropka nie obejmuje `\r`
    i wzorzec przestaje trafiać na repozytorium z `core.autocrlf=true`; mechanizm czytający
    strukturę pliku sprawdzaj na **obu** wariantach w jednym przebiegu. Przeniesienie katalogu
    wskazywanego przez cudzy manifest sprawdzaj najpierw **na kopii**, walidatorem tego manifestu.
    **Kolejność wpisów w dokumencie jest takim samym wariantem** — kierunek ustalaj z danych (daty
    w nagłówkach), nie z nawyku wziętego z projektu, w którym mechanizm powstał. **Wariantem jest
    też stan dokumentu wobec własnej specyfikacji** — realny projekt trzyma pozycje, które reguła
    każe usunąć; mechanizm sprawdzaj na dokumencie realnego projektu i odsiewaj takie stany tą samą
    zamkniętą listą brzmień, której używa reszta rdzenia. **Numeracja i wytłuszczenie nagłówka są
    takim samym wariantem** — nagłówek w cudzej odpowiedzi rozpoznawaj z tolerancją na `## 2.`,
    `**…**` i poziom znaków `#`, a kształt, który raz przewrócił wzorzec, dokładaj do kontroli
    dosłownie w tym brzmieniu, w jakim go spotkałeś. **Regułę dostawcy przepisujesz po ponownym
    odczycie źródła, z zakresem, który źródło jej nadaje** — streszczenie w rejestrze gubi, dla
    którego modelu reguła powstała. (L-0033, L-0038, L-0057, L-0062, L-0067, L-0103, L-0122)
12. **Guardrail zatrzymujący treść, która sekretem nie jest, to defekt rdzenia** — poprawka wraca
    z dowodem, nigdy jako obejście. Wołaj go przez opakowanie powłoki, żeby brak interpretera
    zamieniał się w blokadę, a nie w ciszę; próbki sekretów składaj w czasie wykonania.
    **Znak cudzysłowu — także backtick — należy do grupy cudzysłowu, nigdy do klasy wartości**,
    inaczej guardrail zatrzymuje zdanie opisujące jego samego. (L-0043, L-0045, L-0046, L-0072)
13. **Cudze narzędzie poznajesz z wydanego builda i z próby**, nie z dokumentacji: payload parsuj
    po zdjęciu BOM i bez założeń o nazwach pól, sesję CLI uruchamiaj z powłoki natywnej, a brak
    sygnału konfrontuj najpierw z **warunkiem milczenia** mechanizmu. Gdy narzędzie nie przyjmuje
    Twojego artefaktu, **najpierw sięgnij po jego własny walidator albo widok statusu**
    (`<narzędzie> validate`, `<narzędzie> list`, okno ustawień) — zna schemat, którego nie
    odtworzysz z obserwacji, a cisza w logu nie jest dowodem poprawności. **Zielony walidator, typy
    i testy modu nie dowodzą zachowania w łańcuchu wtyczek** — to mierzysz na żywo, a ciszę na żywo
    najpierw sondą (licznik wywołań hooka, wynik `next`) (P-017). **Wszystko, co dostaje `$` albo
    `on`, mieszka w pliku modułu hooków** — walidator modów nie śledzi `$` przez import; na zewnątrz
    wynosisz tylko czystą logikę, a `plugin validate` puszczasz zaraz po podziale pliku.
    **Typy silnika mówią, co powierzchnia przyjmie, nie co tabela elementów niesie w czasie
    wykonania** — gałąź „desktop / terminal" rozstrzygasz polem powierzchni z wejścia, a test
    sprawdza **obecność odpowiednika** na drugiej powierzchni, nie tylko brak grafiki. Każde
    drzewo trafia do `plugin test` z montażem i kliknięciem, **zanim** człowiek zobaczy je na
    żywo — błąd czasu wykonania (nazwa fabryki JSX przesłonięta zmienną) przechodzi `validate`.
    **Kontekst sesji, który zmienia się w jej trakcie (katalog bieżący), nie jest stałą** — mod
    wyznacza korzeń projektu wejściem w górę od niego, a test ma przypadek sesji w podfolderze (L-0146).
    (L-0041, L-0042, L-0044, L-0047, L-0092, L-0133, L-0136, L-0138, L-0139, L-0146)
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Weryfikację planuj tam,
    gdzie jest wykonalna; po pytaniu sprzątasz sam (martwy link nie jest poprawną wartością
    tymczasową); przy wyprowadzaniu pozycji jednostką inwentarza jest **sprawa**, nie linia.
    Wstawkę kotwicz do elementu, który przeżyje operację, i dowódź **obecności** nowej treści —
    „nic nie zginęło" nie znaczy „wszystko powstało". **Gdy prompt etapowy przeczy regule zapisanej
    w dokumencie docelowym, wygrywa dokument**, a rozjazd idzie do dziennika jako odstępstwo
    z powodem; z prompta wiążąca jest intencja, nie nazwa pliku.
    (L-0005, L-0013, L-0014, L-0050, L-0058, L-0109)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    Przy zadaniu wizualnym zbierasz najpierw cechy pozytywne i pokazujesz jeden wariant do
    kalibracji. **Kompozycję z tekstem budujesz w warstwie, która liczy układ** — HTML
    z `grid`/`flex`, wymiary w jednostkach kontenera, karty domknięte `overflow`; ręczne
    współrzędne zostają dla geometrii dekoracyjnej, nigdy dla treści, bo szerokość napisu jest
    wtedy szacunkiem metryki fontu. Dziecko wychodzące poza kontener to defekt blokujący,
    a instrument mierzący prostokąty ma kontrolę pozytywną na podłożonym przepełnieniu.
    **Kryterium materiału wizualnego wyrażasz w warunkach odbiorcy, nie autora** — szerokość, na
    jakiej realnie się wyświetli, i minimalna wysokość glifów przy tej szerokości; kontrola
    geometrii w skali renderu jest dodatkiem, nie zamiennikiem, i przechodzi zielono na materiale,
    którego nikt nie przeczyta. Ostrzeżenie `claude plugin validate` o root `CLAUDE.md` jest
    świadomym skutkiem dogfoodingu — nie „naprawiaj" go. **Nowy element zbioru wizualnego różnisz
    kształtem, nie detalem** — dwie ikony złożone z tych samych brył (trzy linie plus znaczek
    w rogu) czyta się jako jedną; porównanie robisz na podglądzie **całego zbioru** i w skali,
    w której element realnie się wyświetli. **Plan z interfejsem dla człowieka wskazuje źródło
    motywu i kryterium wyglądu w pierwszym etapie, który rysuje więcej niż linię tekstu**, a zrzut
    do kalibracji smaku pada przed dokończeniem etapu, nie przy pomiarze na żywo.
    **Na nośniku z ograniczonym zestawem elementów sonda ustala pułap, zanim powstanie projekt**,
    a warianty do kalibracji rysujesz **w tym samym nośniku** (mod z przełącznikiem wariantów),
    nie w makiecie, która obiecuje typografię i ruch, których silnik nie narysuje; ograniczenie
    nośnika mówisz człowiekowi wprost razem z opcjami, które realnie są.
    **Rysunek idzie do człowieka po renderze w Chromium z pomiarem prostokątów** (każdy w osobnym
    `iframe`, kontrola na podłożonym defekcie) — test montażu widzi element, nie obraz (L-0142).
    **W raporcie liczb procenty i kwoty mają dwa miejsca po przecinku**; zaokrąglenie zmieniające
    odczyt jest błędem (L-0145). **Etykieta stanu nazywa stan słowem i znakiem** — zapis „x/y" tylko
    tam, gdzie y jest celem; brak danych i brak ceny to dwa różne komunikaty (L-0147).
    (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094, L-0098, L-0137, L-0140, L-0142, L-0145, L-0147)

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/PANEL_CLAUDE/E4/`.** Wszystko tymczasowe —
tsconfig, venv z fontTools, materiał testowy przebiegów załogi, strony do kontroli w Chromium,
wyjścia `plugin validate` — powstaje tam. Artefakt, który z natury musi leżeć **poza** projektem
(kopie pluginów w `~/.claude/dev-mods/`), wpisujesz do wpisu dziennika **z nazwy**. Skrypt edycji
kodu z backslashem albo `\n` powstaje narzędziem Write, nie heredokiem (L-0148).

1. **Pytanie przed pracą** — jedno AskUserQuestion, wszystko naraz, rekomendacja z powodem,
   odpowiedzi do wpisu dziennika:
   (a) **reguła przypisania kosztu do etapu**: okno czasu etapu z dziennika i `STATUS.md` (dzień,
   bez godziny — sesje na przełomie dni i dwa etapy jednego dnia rozjadą się) czy znacznik
   zapisywany przez kolektor w chwili pomiaru (aktywny plan i etap `W TOKU` w rekordzie — zmiana
   schematu wspólnego z panelem Codeksa, pole opcjonalne, stare rekordy bez niego) — rekomendacja
   po sprawdzeniu, co da się odtworzyć z plików tej sesji;
   (b) **co znaczy „ręczne scalanie zadań"** w praktyce człowieka — połączenie dwóch zadań załogi
   w jedno w mapie (tylko widok), czy zapis w pliku przebiegu;
   (c) gdzie mapa w panelu — nowa zakładka „Mapa" czy sekcja zakładki „Koszty".
2. **`core/panel/flow.mjs`** (+ `core/panel/tests/flow.test.js`) — model mapy: plany (aktywny
   z `CLAUDE.md`, pozostałe z `docs/plany/` i `docs/archiwum/plany/`), etapy ze statusami
   z `parseStatus`, odnogi z sekcji „Odnogi" `STATUS.md`, przebiegi `/relai-crew` z zadaniami,
   zależnościami i równoległością. Kryterium planu: dla archiwalnego
   `PROWADZENIE_END_TO_END` model daje **7 etapów ze statusami zgodnymi ze `STATUS.md`** — test na
   prawdziwym pliku z repo i kontrola mutacyjna (zmieniony status w kopii → test oblewa).
3. **Przypisanie pomiarów** (`core/panel/measure.mjs` albo nowy moduł rdzenia, + test) — koszt
   etapu i zadania według reguły z punktu 1(a); rekord bez przypisania idzie do pozycji „poza
   etapem" **słowem**, nie znika i nie trafia do najbliższego etapu po cichu. Suma kosztów etapów
   plus „poza etapem" równa się sumie sesji co do centa — test z kontrolą na podłożonym rekordzie.
4. **Scalanie zadań** — według odpowiedzi 1(b); pierwotne zadania zostają odczytywalne (dowód
   negatywny: plik przebiegu bez zmian, gdy scalanie jest tylko widokiem).
5. **`panel/hooks/register.tsx`** — mapa w panelu bocznym w motywie E8: rozwijane plany i etapy,
   odnogi przy etapie-źródle, przebiegi załogi z zależnościami; koszt etapu przy etapie. Terminal
   tekstem. Nowe nagłówki w `HEADINGS` i `build-panel-headings.js`. Jeden wariant do zrzutu
   człowieka **przed** dokończeniem etapu (zasada 15).
6. **Testy modu** (`panel/hooks/*.test.ts`) — mapa planu archiwalnego, odnoga, przebieg załogi
   z równoległymi zadaniami, koszt etapu, „poza etapem" słowem, zero przepełnień przy 40 kolumnach
   (instrument `minWidth`); testy E1–E3, E8 i E9 zielone bez osłabiania asercji, w tym
   `progress/` i `cache-keeper/`.
7. **`panel/.claude-plugin/plugin.json`** — 0.5.0 → 0.6.0 (niewydana); `panel/types/index.d.ts`
   dla nowych wartości `$.state`.
8. **`docs/STATE.md`** — obszar panelu: mapa, koszt etapu, scalanie.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] Odpowiedzi z punktu 1 zapisane w dzienniku z datą.
- [ ] Testy repo — komenda ze „Stanu wyjściowego" kończy się bez błędu; liczba przed (201, FAKT)
      i po w dzienniku.
- [ ] `node core/tools/sync-panel-core.js --check` — zgodne dla trzech pluginów.
- [ ] `claude plugin validate` (binarka 2.1.293) dla `panel`, `progress` i `cache-keeper` —
      zaliczone; w `panel/` i `progress/` zero wywołań `$.net`, `fetch`, `$.model`,
      `prompt.compose`, `session.append`, `$.tool.register` (kontrola pozytywna wzorca na
      podłożonym tekście).
- [ ] `tsc` strict na typach silnika — 0 błędów, z kontrolą pozytywną (podłożony błąd złapany);
      `claude plugin test` w trzech pluginach zielone (32 + 16 + 19 przed etapem, FAKT).
- [ ] `node core/tools/validate-adapters.js` — zaliczone.
- [ ] **Kryterium planu:** mapa dla `docs/archiwum/plany/PROWADZENIE_END_TO_END/` pokazuje 7 etapów
      ze statusami zgodnymi ze `STATUS.md` — w teście rdzenia i na żywo w panelu (zrzut człowieka).
- [ ] **Koszt etapu na żywo:** w sesji tego etapu panel pokazuje koszt E4; suma etapów i „poza
      etapem" równa sumie sesji z zakładki „Koszty" co do centa (odczyt obu liczb do dziennika).
- [ ] Panel na desktopie i w terminalu: mapa widoczna, zero szarych linii `refused` / `threw`;
      zrzut zaakceptowany przez człowieka. Sesja terminalowa startowana z podfolderu projektu
      (P-021).
- [ ] Każde nowe Svg sprawdzone w Chromium na szerokościach 900 / 560 / 360 px, z kontrolą na
      podłożonym defekcie (P-020, L-0142).
- [ ] Bezpieczeństwo: `grep -rnE "sk-ant-|ANTHROPIC_API_KEY="` po plikach zmienionych w tym etapie
      (lista z `git status --short`) nie zwraca nic poza dokumentami, które ten wzorzec cytują
      (L-0134); kontrola pozytywna na podłożonej próbce.
- [ ] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy", z podpisem.
- [ ] Katalog roboczy `.claude/relai/work/PANEL_CLAUDE/E4/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak"; liczby przed i po
      w sekcji „Zweryfikowane" wpisu. Artefakty poza tym katalogiem (kopie pluginów w folderze
      modów sesji) wypisane z nazwy, z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/PANEL_CLAUDE/STATUS.md`: E4 → ZREALIZOWANY (data), E5 → GOTOWY DO STARTU, link do
   `PROMPT_ETAP_5.md` w kolumnie `Prompt`, linia w dzienniku wdrożenia.
2. Katalog roboczy etapu — raport `clean-work.js`, kasowanie po „tak", liczby przed i po do wpisu.
3. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy". Przegląd ryzyk C1, C3, C8,
   C10, C11; lekcje z etapu do `docs/LEKCJE.md` i odświeżone „Zasady aktywne"; pułapki silnika do
   `docs/PULAPKI.md`. Pozycje „Do zrobienia przez człowieka" → sekcja „Bramki manualne" `STATUS.md`.
4. `docs/STATE.md` — obszar panelu.
5. **Wygeneruj `PROMPT_ETAP_5.md`** w tym folderze, ze specyfikacji promptu etapowego
   (`.claude/relai/templates/SPEC_PROMPT_ETAPU.md`): na bazie `PLAN.html` sekcja 6 (E5 — decyzje
   w panelu: karta potwierdzenia `/relai-stage` i dostosowanie procedury w pluginie `relai`, edycja
   załogi, listy wyboru, „świeży czat" po potwierdzeniu), sekcja 7 (R4), sekcja 10 (Aneks D —
   karta potwierdzenia z E5 ma obsłużyć też pytanie o aktualizację cennika z E6: treść, „tak" /
   „nie", drugie potwierdzenie zapisu), realnego stanu po tym etapie i lekcji z tego etapu.
6. Commit — propozycja conventional message, po zgodzie człowieka.
