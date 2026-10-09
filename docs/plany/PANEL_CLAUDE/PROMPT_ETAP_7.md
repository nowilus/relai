# PROMPT_ETAP_7 — Wydanie relai-panel i rodziny pluginów: marketplace, dokumentacja, pomiar w czystej instalacji

Plan: PANEL_CLAUDE • Etap: **E7 z E9** (kolejność wykonania E1, E2, E8, E3, E9, E4, E5, E6, E7 — Aneksy A i B; Aneksy C, D i E w sekcji 10; **ostatni etap planu**) • Wygenerowano: 2026-10-09 (autor: Opus 5.5, w rytuale „Na koniec" etapu E6) • Wykonawca: **Opus** (STATUS: „model wykonawczy: Opus, w Claude Code"), `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`; D-85). Jeśli sesja działa na innym modelu —
> zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom
> `/effort`: `high` (wydanie jest publiczne i nieodwracalne w praktyce — zła wersja w
> `marketplace.json` albo plugin, który nie ładuje się w czystej instalacji, trafia do ludzi).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sekcja niemutowalna, rytuał „Na koniec" |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (C1, C3, C10, C11) + dwa wpisy „2026-10-09 — E6 planu PANEL_CLAUDE" (drugi: „Aneks E, kalibracje… i zamknięcie etapu") i wpis E5 — sekcje „Świadomie odłożone" |
| `docs/LEKCJE.md` | wyłącznie „Zasady aktywne" — przepisane też niżej (zwłaszcza 2, 4, 10, 13) |
| `docs/PULAPKI.md` | **P-005** (aktualizacja pluginu do restartu), **P-019** (ścieżka binarki), **P-020**–**P-023** (silnik modów 2.1.293, w P-023 pkt 7: za duże drzewo panelu znika bez słowa) |
| `docs/plany/PANEL_CLAUDE/PLAN.html` | sekcja 6 (wiersz E7), sekcja 7 (R1, R7), sekcja 9 (decyzja „publiczny marketplace jako eksperymentalny czy lokalnie" — termin: przed E7), sekcja 10 (Aneks C — publikacja trzech pluginów) |
| `docs/plany/PANEL_CLAUDE/STATUS.md` | sekcja „Bramki manualne" — pozycje `OTWARTA` (pomiar z E5, folder modów sesji E6) |
| `.claude-plugin/marketplace.json` | dzisiejsze wpisy: `relai` 2.7.1 i `relai-panel` **bez pola `version`**; `relai-progress` i `relai-cache-keeper` nie mają wpisów |
| `core/tools/validate-adapters.js` | punkt 5 „zgodność numeru wersji" — porównuje wersję każdego wpisu marketplace z `relai`; wpis bez wersji dziś przechodzi |
| `README.md`, `docs/KOMENDY.md` | dziś bez słowa o pluginach panelu |
| `panel/hooks/register.tsx` | 1845 linii — mapa sekcji przed podziałem (komentarze `// ----------`) |

Typy API modów: wczytaj skill `plugin-authoring` i przeszukaj `claude-code.d.ts` tego builda
(`grep`), zanim użyjesz elementu, którego panel jeszcze nie używa.

## Decyzje już podjęte — nie otwierasz ich ponownie

- Wariant A planu: **mod rysuje i wywołuje, rdzeń liczy** — logika w `core/panel/*.mjs`, kopia do
  pluginów wyłącznie przez `node core/tools/sync-panel-core.js`; wszystko, co dostaje `$` albo
  `on`, w pliku modułu hooków (L-0136). Walidator odrzuca przekazanie `$` do funkcji, która nie
  jest zadeklarowana na górze pliku — moduł się wtedy **w ogóle nie ładuje** (P-023 pkt 10); podział
  `register.tsx` musi to uszanować.
- **Aneks C:** trzy pluginy w tym repo — `relai-panel` (`panel/`), `relai-progress` (`progress/`),
  `relai-cache-keeper` (`cache-keeper/`); wpisy `relai-progress` i `relai-cache-keeper`
  w `.claude-plugin/marketplace.json` powstają **w E7**, razem z decyzją „publicznie czy lokalnie".
  Oryginały `savvy-progress` i `cache-keeper-pl` są już odinstalowane (bramki E9 rozstrzygnięte).
- **R7 z jednym wyjątkiem (Aneks D):** jedyny ruch sieciowy w rodzinie to `fetchPricingPage`
  w `panel/hooks/register.tsx` (GET strony cennika Anthropic po „Tak" w karcie); `progress/` i
  `cache-keeper/` — zero. Opis w `plugin.json` i README mówi to wprost.
- **R4 (E5):** każde działanie zmieniające stan idzie przez kartę „Do potwierdzenia"; E7 nie dodaje
  działań panelu.
- **Aneks E i kalibracje E6:** zakładka „Dokumenty" (kafle / drzewo jak VS Code, zmienione na górze,
  diff od commita, foldery domyślnie zwinięte, limit drzewa 60 wierszy / 40 plików na folder) jest
  zamknięta — E7 jej nie przeprojektowuje; podział pliku przenosi kod bez zmiany zachowania
  (testy bez osłabiania asercji).
- Procedura `/relai-stage` ze znacznikiem `--zgoda-panelu` (E5) jest w repo, **niewydana** — wydanie
  `relai` z nią jest warunkiem pomiaru z bramki E5.
- Wygląd i rytm pracy: motyw RelAI z E8, desktop ważniejszy od terminala (terminal tekstem, test
  40 kolumn), każdy nowy rysunek przez Chromium z kontrolą na podłożonym defekcie.
- **Granica zakresu:** E7 = wydanie (wersje, `marketplace.json`, walidator wersji obejmujący pluginy
  panelu, README i `KOMENDY.md`, pełne testy, pomiar w czystej instalacji z marketplace), podział
  `register.tsx`, pomiar z bramki E5, rozstrzygnięcie sprzątania starych pomiarów (C11). **Nowe
  funkcje panelu — nie** (wątek spoza zakresu → sygnał odchylenia). Po E7 plan się zamyka:
  sekwencja „Zamknięcie planu" skilla `relai-planning` (`plan-closing.md`).

## Stan wyjściowy (co realnie zastajesz po E6)

RelAI 2.7.1 w repo i publicznie (plugin `relai`, adaptery Claude Code, Codex, Cursor). W repo,
**niewydane**: procedura `/relai-stage` ze znacznikiem `--zgoda-panelu` (E5) i trzy pluginy modów —
`relai-panel` **0.8.0**, `relai-progress` 0.1.0, `relai-cache-keeper` 0.2.0. `relai-panel` ma wpis
w `marketplace.json` bez wersji (od E1); dwa pozostałe — żadnego. Pluginy mierzone dotąd wyłącznie
przez hot reload modów sesji (kopie w `~/.claude/dev-mods/<id-sesji>/<plugin>/`); w sesji, w której
kopii nie ma, paski `relai-progress` i `relai-cache-keeper` nie istnieją (człowiek zapytał o to w E6 —
odpowiedź: instalacja w E7). Binarka silnika: `%APPDATA%/Claude/claude-code/2.1.293/83cb0bd7fed4/claude.exe`
z wnętrza sesji; w zwykłym PowerShellu ścieżka MSIX z P-019. TypeScript:
`npx -y -p typescript@5 tsc -p <tsconfig>` — tsconfig odtwarzasz w katalogu roboczym (strict,
`noUncheckedIndexedAccess`, `allowJs` + `checkJs`, `jsx: react`, `jsxFactory: h`,
`allowImportingTsExtensions`, `moduleResolution: Bundler`, `lib: ["ES2022"]`, `types: []`;
`paths` dla `claude-code` na `panel/.claude-plugin/types/claude-code/index.d.ts`; `include`: ten
plik, `panel/hooks`, `panel/types`, `progress/hooks`, `progress/types`, `cache-keeper/hooks`,
`core/panel/*.mjs`; `exclude`: `*.test.ts`).

```
.claude-plugin/marketplace.json   # relai 2.7.1 + relai-panel (bez version); brak relai-progress, relai-cache-keeper
core/tools/validate-adapters.js   # pkt 5: wersje manifestów, marketplace (każdy wpis), baner README, STATE
core/tools/sync-panel-core.js     # kopia rdzenia do trzech pluginów (+ --check): 15 plików core i 14 ikon
core/panel/*.mjs                  # rdzeń: pricing (cennik, karta), documents (półka, drzewo, diff), decisions,
                                  #   measure, flow, attribution, progress, plan-state, commands, charts, theme, headings
panel/hooks/register.tsx          # 1845 linii (próg 800): pasek, kolektor, panel (Komendy, Mapa, Dokumenty,
                                  #   Ściąga, Frazy, Koszty), karta potwierdzenia, cennik
panel/hooks/*.test.ts             # 70 testów relai-panel
progress/hooks/register.tsx       # 372 linie; 16 testów
cache-keeper/hooks/register.tsx   # 545 linii; 19 testów
README.md, docs/KOMENDY.md        # bez pluginów panelu
```

Testy repo: `node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js adapters/codex/tests/*.test.js core/panel/tests/*.test.js`
(**263/263** po E6, FAKT; na czystym klonie jeden test E5 czyta `.claude/relai/MODELE-claude-code.md`
spoza gita — L-0156, odłożone do E7). Testy modów: `claude plugin test .` binarką 2.1.293 w `panel/`
(70/70), `progress/` (16/16), `cache-keeper/` (19/19) — FAKT. `node core/tools/validate-adapters.js`
— exit 0 po E6.

**Czego jeszcze nie ma (to jest zakres tego etapu):** decyzji „publicznie czy lokalnie"; wersji
`relai` z procedurą E5; wpisów `relai-progress` i `relai-cache-keeper` w `marketplace.json`
i wersji przy `relai-panel`; walidatora wersji, który pilnuje pluginów panelu; słowa o panelu
w README i `KOMENDY.md`; instalacji z marketplace zmierzonej w czystej sesji; pomiaru z bramki E5;
podziału `register.tsx`; rozstrzygnięcia sprzątania starych plików pomiarów (C11); poprawki testu E5
na pliku spoza gita.

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
   nie tylko dla sesji pomiarowej, w której powstał (L-0144). **Test na realnym pliku, którego stan
   zmienia proces (checkboxy, statusy), sam ustawia stan wyjściowy**, a licznik testów do dziennika
   pochodzi z przebiegu po ostatniej zmianie przed commitem (L-0150). **Pytanie o zasięg zmiany
   pliku stawiasz po sprawdzeniu, czy plik nie jest generowany z innego** — opcja, której kontrola
   parytetu nie przepuści, nie trafia do pytania jako wykonalna (L-0154). **Zmianę dowodzisz na
   widoku, który obejmuje zbiór z jej rekordami** — sprawdzasz, na którym ekranie liczba się zmienia,
   nie tylko że się zmienia (L-0155). **Test na realnym materiale bierze plik śledzony przez gita
   albo własną fixturę** — plik z `.gitignore` daje zielony test tylko na drzewie roboczym (L-0156).
   **Widok rysowany z danych projektu mierzysz na prawdziwych danych w najgorszym stanie** (wszystko
   rozwinięte) i ograniczasz go w kodzie — harness przyjmuje drzewo, które desktop gubi bez słowa
   (L-0158). **Diagnozę na żywo zaczynasz od znacznika wersji w logu** — przeładowanie potrafi
   zostawić starą wersję i każdy wniosek z niej jest fałszywy (L-0159).
   (L-0017, L-0018, L-0040, L-0051, L-0052, L-0063, L-0069, L-0082, L-0115, L-0117, L-0123, L-0134,
   L-0144, L-0150, L-0154, L-0155, L-0156, L-0158, L-0159)
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
   **Stan „przed" mierzysz w osobnym `git worktree` HEAD-a**, nie po `git stash` — stash zostawia
   pliki nieśledzone i daje drzewo mieszane (L-0151). (L-0032, L-0037, L-0095, L-0096, L-0105, L-0106, L-0107, L-0110, L-0111, L-0113,
   L-0097, L-0101, L-0102,
   L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086, L-0087, L-0088,
   L-0090, L-0091, L-0124, L-0125, L-0130, L-0131, L-0135, L-0141, L-0143, L-0151)
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
    **Sonda, która mierzy działanie niszczące (`/clear`, kasowanie), stoi w sesji, której utrata nic
    nie kosztuje** — albo przycisk ma osobne potwierdzenie; stan etapu i wynik sondy są w pliku
    przed każdym takim krokiem (L-0153).
    (L-0041, L-0042, L-0044, L-0047, L-0092, L-0133, L-0136, L-0138, L-0139, L-0146, L-0153)
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
    tam, gdzie y jest celem; brak danych i brak ceny to dwa różne komunikaty (L-0147). **Słowo, które
    twierdzi fakt o przeszłości („sprzed znacznika", „zmierzono"), ma warunek prawdziwości na
    danych** i test na materiale, gdzie warunek nie zachodzi (L-0149). **Komórka liczby w wierszu
    ma `flexShrink={0}`** — ustępuje nazwa; test sprawdza tę właściwość, a zrzut z terminala jest
    częścią pomiaru (L-0152). **Karta decyzji pokazuje w całości tylko pozycje, które decyzja zmienia
    dla człowieka**, resztę jednym wierszem z liczbą i nazwami; stawka nie jest kwotą — ma tyle
    miejsc, ile ma źródło (L-0157).
    (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094, L-0098, L-0137, L-0140, L-0142, L-0145, L-0147,
    L-0149, L-0152, L-0157)

**Wyprowadzone 2026-08-20 do `docs/PULAPKI.md`:** sześć pozycji, które były pułapkami
narzędziowymi, a nie zasadami pracy — `tar` na `PATH` (L-0021), sesja pomiarowa `claude -p`
(L-0024), PowerShell 5.1 i UTF-8 (L-0027), `--allowedTools` przy `acceptEdits` (L-0028),
restart aplikacji po `plugin update` (L-0031), `git worktree` zamiast `git archive | tar`
(L-0039). Obowiązują dalej — czytasz je z rejestru pułapek, na żądanie.

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/PANEL_CLAUDE/E7/`.** Wszystko tymczasowe —
tsconfig, wyjścia `plugin validate`, kopie robocze przy podziale pliku, notatki stanu — powstaje
tam. Artefakt, który z natury musi leżeć **poza** projektem (kopie pluginów w `~/.claude/dev-mods/`,
klon czystej instalacji w `%TEMP%`), wpisujesz do wpisu dziennika **z nazwy**, nazwę zaczynasz od
`relai-`. Skrypt edycji kodu z backslashem albo `\n` powstaje narzędziem Write (L-0148). Kasowanie
idzie narzędziem `node .claude/relai/tools/clean-work.js kasuj <lista.json>` (hook projektu blokuje
`rm`; narzędzie odmawia ścieżek poza projektem i `%TEMP%` — te zostają bramką).

1. **Pytanie przed pracą** — jedno AskUserQuestion, wszystko naraz, rekomendacja z powodem,
   odpowiedzi do wpisu dziennika:
   (a) **publicznie czy lokalnie** (sekcja 9 planu): wpisy trzech pluginów w publicznym
   `marketplace.json` z dopiskiem „eksperymentalny / early access" czy instalacja lokalna
   (`--plugin-dir`, bez wpisów);
   (b) **numery wersji**: `relai` (2.7.1 → ? — w repo jest zmiana procedury `/relai-stage` z E5)
   oraz pluginów panelu (wersja własna każdego czy wspólna z `relai`);
   (c) **sprzątanie starych plików pomiarów** (C11): próg wieku albo rozmiaru i droga (karta
   w panelu, `/relai-clean`, nic — „świadomie odłożone");
   (d) **podział `register.tsx`**: granice plików (np. pasek / kolektor / panel / zakładki) — tylko
   tam, gdzie walidator przyjmie `$` (P-023 pkt 10; sprawdź `plugin validate` po pierwszym cięciu,
   zanim pokroisz resztę).
2. **`panel/hooks/register.tsx`** — podział wg 1(d) na pliki poniżej 800 linii każdy (SZACUNEK
   progu z reguł projektu), bez zmiany zachowania: te same testy, te same klucze elementów,
   `plugin validate` i `plugin test` zielone po każdym cięciu.
3. **`.claude-plugin/marketplace.json`** + **`*/.claude-plugin/plugin.json`** — wersje i wpisy wg
   1(a) i 1(b); opis `relai-panel` nazywa jedyny ruch sieciowy; `relai-progress` i
   `relai-cache-keeper` z atrybucją pochodzenia (MIT `savvy-progress` — Aneks B/C).
4. **`core/tools/validate-adapters.js`** — punkt 5 obejmuje pluginy panelu: wpis marketplace bez
   wersji albo z wersją różną od `plugin.json` pluginu to **błąd**; kontrola pozytywna na
   podłożonym rozjeździe.
5. **`README.md`** i **`docs/KOMENDY.md`** — sekcja o panelu: co robi (pasek, `/relai-panel`,
   zakładki, cennik z jednym odczytem po „Tak"), wymóg (Claude Code z modami „early access",
   zmierzona wersja 2.1.293), instalacja **komendą uruchomioną dosłownie** w czystej sesji (zasada 2).
6. **Pomiar w czystej instalacji** — po wypchnięciu (albo lokalnie wg 1(a)): instalacja trzech
   pluginów komendą z README w sesji bez kopii w `dev-mods/`, restart aplikacji (P-005), paski
   i `/relai-panel` widoczne, ścieżka cache w transkrypcie zgodna z nową wersją.
7. **Bramka E5** (`STATUS.md`, `OTWARTA`): po wydaniu `relai` z nową procedurą — etap uruchomiony
   z karty w panelu startuje bez powtórnego pytania w czacie (świeży czat, `/clear` po „Tak"), a
   `/relai-stage` bez znacznika pokazuje kartę jak przed E5; cytat do dziennika.
8. **Sprzątanie pomiarów (C11)** wg 1(c) — w `core/panel/` z testem, albo wpis „świadomie odłożone".
9. **Test E5 na `.claude/relai/MODELE-claude-code.md`** — fixtura własna zamiast pliku spoza gita
   (L-0156), test zielony w czystym `git worktree`.
10. **Wersja i dokumenty stanu** — `docs/STATE.md` (wydanie, rodzina pluginów), baner README;
    `KOMENDY.md` z punktu 5.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] Odpowiedzi z punktu 1 zapisane w dzienniku z datą.
- [ ] Testy repo — komenda ze „Stanu wyjściowego" kończy się bez błędu; liczba przed (263, FAKT)
      i po w dzienniku; **ta sama komenda w osobnym `git worktree` HEAD-a po commicie** — zielona
      (dowód na punkt 9, L-0151).
- [ ] `node core/tools/sync-panel-core.js --check` — zgodne dla trzech pluginów.
- [ ] `claude plugin validate` (binarka 2.1.293) dla `panel`, `progress`, `cache-keeper` — zaliczone
      po **każdym** cięciu `register.tsx` i na końcu; każdy plik `panel/hooks/*.tsx` < 800 linii.
- [ ] `tsc` strict — 0 błędów, z kontrolą pozytywną (podłożony błąd złapany); `claude plugin test`
      w trzech pluginach zielone (70 + 16 + 19 przed etapem, FAKT) bez osłabiania asercji —
      dowód: `git diff` plików `*.test.ts` nie zmienia żadnego `expect`.
- [ ] `node core/tools/validate-adapters.js` — exit 0; podłożony rozjazd wersji pluginu panelu
      (wpis marketplace ≠ `plugin.json`) → błąd z nazwą pliku (kontrola pozytywna), przywrócony.
- [ ] **R7 z jednym wyjątkiem:** w `panel/` i `progress/` (wszystkie pliki hooków po podziale) zero
      wywołań `$.http|$.net|fetch(|$.model|prompt.compose|session.append|$.tool.register` poza
      `fetchPricingPage`; kontrola pozytywna wzorca na podłożonym tekście.
- [ ] Po podbiciu wersji `grep -rn` po starym numerze (zwykły `grep -r`, nie `git grep`) — każde
      trafienie rozstrzygnięte: wzmianka historyczna czy deklaracja stanu (zasada 10).
- [ ] **Kryterium planu:** panel instaluje się **jedną komendą z marketplace RelAI** (albo drogą
      z 1(a)) w sesji bez kopii w `dev-mods/`; po restarcie aplikacji (P-005) paski i `/relai-panel`
      widoczne na desktopie, ścieżka cache w transkrypcie wskazuje nową wersję; zrzut człowieka.
- [ ] **Bramka E5:** start etapu z karty bez drugiego pytania w czacie i `/relai-stage` bez
      znacznika z kartą jak przed E5 — cytat do dziennika; linia bramki w `STATUS.md` →
      `ROZSTRZYGNIĘTA <data> — <jak>`. Punkt niewykonalny (wydanie `relai` odłożone decyzją
      z 1(b)) opisany wprost z warunkiem wykonalności.
- [ ] Bezpieczeństwo: `grep -rnE "sk-ant-|ANTHROPIC_API_KEY="` po plikach zmienionych w tym etapie
      nie zwraca nic poza dokumentami, które wzorzec cytują (L-0134); kontrola pozytywna na próbce
      składanej w czasie wykonania. Pakiety wydania nie niosą `.claude/` ani `tsconfig.json`
      z katalogów pluginów (`git ls-files panel progress cache-keeper` — lista do wpisu).
- [ ] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy", z podpisem.
- [ ] Katalog roboczy `.claude/relai/work/PANEL_CLAUDE/E7/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak"; liczby przed i po
      w sekcji „Zweryfikowane" wpisu. Artefakty poza tym katalogiem (kopie w `~/.claude/dev-mods/`,
      klon w `%TEMP%`) wypisane z nazwy, z tym, co się z nimi stało; folder modów sesji E6
      (`a72755a2-…`: `relai-panel`, `relai-probe-e6`) sprawdzony — bramka w `STATUS.md` rozstrzygnięta.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/PANEL_CLAUDE/STATUS.md`: E7 → ZREALIZOWANY (data), linia w dzienniku wdrożenia.
2. Katalog roboczy etapu — raport `clean-work.js`, kasowanie po „tak", liczby przed i po do wpisu.
3. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy". Przegląd ryzyk C1, C3, C10,
   C11; lekcje z etapu do `docs/LEKCJE.md` i odświeżone „Zasady aktywne"; pułapki do
   `docs/PULAPKI.md`. Pozycje „Do zrobienia przez człowieka" → „Bramki manualne" `STATUS.md`.
4. `docs/STATE.md` — wydanie i rodzina pluginów.
5. **E7 jest ostatnim etapem planu — zamiast generacji następnego promptu uruchom sekwencję
   „Zamknięcie planu" (D-36)** z wczytanego skilla `relai-planning` (plik `plan-closing.md`):
   bramki manualne i odnogi rozstrzygnięte przez człowieka → `STATE.md` → wpis „dowiezione vs plan"
   → status planu `ZREALIZOWANY` → przegląd ryzyk → folder planu do `docs/archiwum/plany/` → linia
   „Aktywny plan" w `CLAUDE.md` (następny w kolejce: PANEL_CODEX, `DO AKCEPTACJI`) → podsumowanie.
6. Commit — propozycja conventional message, po zgodzie człowieka; wydanie (push, tag) — osobno,
   po drugiej zgodzie.
