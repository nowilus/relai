# PROMPT_ETAP_6 — Dokumenty i cennik: podgląd dokumentów, znacznik aktualizacji, cennik z kartą

Plan: PANEL_CLAUDE • Etap: **E6 z E9** (kolejność wykonania E1, E2, E8, E3, E9, E4, E5, E6, E7 — Aneksy A i B; Aneksy C i D w sekcji 10) • Wygenerowano: 2026-10-09 (autor: Opus 5.5, w rytuale „Na koniec" etapu E5) • Wykonawca: **Opus** (STATUS: „model wykonawczy: Opus, w Claude Code"), `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`; D-85). Jeśli sesja działa na innym modelu —
> zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom
> `/effort`: `high` (etap wprowadza jedyny ruch sieciowy w `relai-panel` i zapis stawek cennika —
> błąd w karcie albo w parserze nadpisze cennik bez zgody człowieka albo złymi liczbami).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sekcja niemutowalna, rytuał „Na koniec" |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (C1, C3, C10, C11) + wpis „2026-10-09 — E5 planu PANEL_CLAUDE" (karta, znacznik zgody, „Świadomie odłożone") |
| `docs/LEKCJE.md` | wyłącznie „Zasady aktywne" — przepisane też niżej (zwłaszcza 4, 5, 13, 15) |
| `docs/PULAPKI.md` | **P-020**, **P-021**, **P-022** (silnik modów 2.1.293: pomiar, katalog sesji, wysyłka z panelu, `/clear`, `$.prompt.submit` od „/”, `$.state` w testach) |
| `docs/plany/PANEL_CLAUDE/PLAN.html` | sekcja 5 (cennik z datą), sekcja 6 (wiersz E6), sekcja 7 (**R6**, **R7**), sekcja 8 (brak sieci przy odświeżaniu, model bez ceny), sekcja 10 (**Aneks D** w całości) |
| `docs/zasoby/PANEL_RELAI/WYWIAD.md` | linie o podglądzie dokumentów i ich aktualizacji oraz o cennikach (źródło, data, ostrzeżenie, odświeżanie wyłącznie przyciskiem) |
| `core/panel/pricing.mjs` | `PRICING` (data, źródło, mnożniki cache, dziś tylko `claude-opus-5-5`), `priceRecord` |
| `core/panel/decisions.mjs` | karta z E5: `makeCard`, `answer` (drugi krok), `stepsToRun`, `shown`, działania `clear` / `command` / `submit` / `write` |
| `core/panel/measure.mjs` | rekord pomiaru (model, kategorie), `aggregate`, `projectSummary` |
| `panel/hooks/register.tsx` | zakładki, „Koszty”, karta „Do potwierdzenia” (`confirmCard`, `decide`, `runStep`), części motywu |

Typy API modów: wczytaj skill `plugin-authoring` i przeszukaj `claude-code.d.ts` tego builda
(`grep`), zanim użyjesz elementu, którego panel jeszcze nie używa. **Sieć silnika to
`$.http.fetch(url, init)`** (nie `$.net`) — sprawdzone w typach 2.1.293 przy zamknięciu E5.

## Decyzje już podjęte — nie otwierasz ich ponownie

- Wariant A planu: **mod rysuje i wywołuje, rdzeń liczy** — parser cennika, różnica stawek,
  model bez ceny i lista dokumentów w `core/panel/*.mjs`, kopia do pluginów wyłącznie przez
  `node core/tools/sync-panel-core.js`; wszystko, co dostaje `$` albo `on`, w pliku modułu hooków
  (L-0136).
- **R4 (E5):** każde działanie panelu zmieniające stan idzie przez kartę „Do potwierdzenia”
  z `core/panel/decisions.mjs`; karta ma opcjonalny drugi krok (`second`) — E6 go używa, nie
  buduje nowego mechanizmu.
- **Aneks D (2026-10-09), w całości wiążący:** panel porównuje modele z rekordów pomiarów (sesja
  i projekt) z cennikiem i dla każdego modelu bez ceny pokazuje przypomnienie z nazwą i liczbą
  rekordów („claude-sonnet-5-5 — 4 rekordy bez ceny”) oraz pytanie o aktualizację w karcie;
  aktualizacja rusza **wyłącznie po „tak”**; po pobraniu różnica stara–nowa stawka dla każdego
  zmienionego modelu i kategorii (model dotąd nieznany — „nowy”); **zapis dopiero po drugim
  potwierdzeniu**; ostrzeżenie o starej dacie zostaje obok, niezależnie od przypomnienia.
- **Ruch sieciowy (Aneks D, sekcja 9 rozstrzygnięta):** tylko do strony cennika Anthropic, tylko
  po „tak” w karcie, bez ruchu w tle i bez odświeżania przy starcie sesji. Jedyny wyjątek od R7
  („panel nie używa sieci”), wyłącznie w `relai-panel`; kontrola zakazanych wywołań wyłącza **to
  jedno miejsce z nazwy**, reszta `panel/` i całe `progress/` zostają na zero.
- **R6:** data i źródło przy każdej kwocie; zapisane wyliczenia trzymają stawki, którymi je
  policzono — nowa stawka nie zmienia kosztu policzonego wcześniej, chyba że człowiek przeliczy go
  w karcie.
- **Przypadki brzegowe (plan, sekcja 8; Aneks D):** brak sieci albo zmieniona strona (parser nie
  przechodzi) → zostaje stary cennik z datą i komunikatem, nic nie jest nadpisane; model nieobecny
  na stronie → zostaje „brak ceny”, karta mówi to słowem; odmowa w karcie wycisza przypomnienie
  dla tego modelu do następnej zmiany daty cennika.
- E5 (2026-10-09): `$.prompt.submit` od „/” jest odrzucane przez hosta — komenda idzie
  `$.command.run`; `/clear` z panelu zmienia id sesji bez `session.start` (P-022); testowy `$`
  nie ma `$.state` — stan podkłada hook `state.get` z odpowiedzią `{ value: { value, version } }`.
- Wygląd: motyw RelAI z E8 (`THEME`, `FLOW`, nagłówki Kalamem z `HEADINGS`, karty zaokrąglone,
  natywne przyciski z błyskiem ramki), w terminalu ten sam tekst w tych samych kolorach; **każda
  nowa rzecz w panelu dokładnie wg zasad stylu, nie „raw”** — jeden wariant do zrzutu człowieka
  przed dokończeniem etapu (zasada 15); każde nowe `Svg` przechodzi Chromium (900 / 560 / 360 px,
  kontrola na podłożonym defekcie, L-0142); kwoty z dwoma miejscami (L-0145); brak danych i brak
  ceny to dwa komunikaty (L-0147); komórka liczby `flexShrink={0}` (L-0152); wiersz faktu karty
  zawija się (E5: 42 kolumny w terminalu przed poprawką).
- **Granica zakresu:** E6 = podgląd dokumentów projektu ze znacznikiem aktualizacji w turze,
  cennik (data, źródło, ostrzeżenie o starej dacie, przypomnienie o modelu bez ceny, odświeżenie
  przyciskiem przez kartę z różnicą i drugim potwierdzeniem, zapis). **E7:** wydanie `relai`
  (nowa procedura `/relai-stage` z E5) i `relai-panel`, wpisy w `marketplace.json`, README
  i `KOMENDY.md`, pomiar na żywo z bramki E5 (start z karty bez drugiego pytania), podział
  `register.tsx`, decyzja „publicznie czy lokalnie”. Sprzątanie starych plików pomiarów (C11) —
  tylko jeśli rozstrzygnie je pytanie z punktu 1; inaczej „świadomie odłożone” do E7.

## Stan wyjściowy (co realnie zastajesz po E5)

RelAI 2.7.1 w repo i publicznie (plugin `relai`, adaptery Claude Code, Codex, Cursor); procedura
`/relai-stage` w repo przyjmuje znacznik `--zgoda-panelu` (E5), **niewydana**. Trzy pluginy modów
w repo, **niewydane, niezainstalowane, bez wpisów w `marketplace.json`**: `relai-panel` 0.7.0,
`relai-progress` 0.1.0, `relai-cache-keeper` 0.2.0; mierzone przez hot reload modów sesji (kopie
w `~/.claude/dev-mods/<id-sesji>/<plugin>/`, zgoda człowieka w oknie „Enable hot reloading”;
folder modów należy do sesji, w której go założono — po `/clear` dalej działa ten sam). Binarka
silnika: `%APPDATA%/Claude/claude-code/2.1.293/83cb0bd7fed4/claude.exe` z wnętrza sesji; w zwykłym
PowerShellu ścieżka MSIX
`$env:LOCALAPPDATA\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\claude-code\2.1.293\83cb0bd7fed4\claude.exe`
(P-019), terminal startuje z podfolderu `docs\plany` z `--plugin-dir <repo>\panel`. TypeScript:
`npx -y -p typescript@5 tsc -p <tsconfig>` — tsconfig odtwarzasz w katalogu roboczym (strict,
`noUncheckedIndexedAccess`, `allowJs` + `checkJs`, `jsx: react`, `jsxFactory: h`,
`allowImportingTsExtensions`, `moduleResolution: Bundler`, **`lib: ["ES2022"]` i `types: []`** —
bez nich DOM gryzie się z typami silnika; `paths` dla `claude-code` na plik typów w
`panel/.claude-plugin/types/claude-code/index.d.ts`; `include`: ten plik, `panel/hooks`,
`panel/types`, `progress/hooks`, `progress/types`, `cache-keeper/hooks`, `core/panel/*.mjs`;
`exclude`: `*.test.ts`). Nagłówki Kalamem wymagają fontTools — w venv w katalogu roboczym:
`python -m venv <katalog>/venv`, `<katalog>/venv/Scripts/python -m pip install fonttools brotli`,
potem `PYTHON=<katalog>/venv/Scripts/python node core/tools/build-panel-headings.js`. Kontrakt
typów pluginu (`panel/types/index.d.ts`) musi być samowystarczalny: bez `import`, typy najwyższego
poziomu z `export`.

```
core/panel/decisions.mjs          # karta (open → second → confirmed / cancelled), znacznik zgody, karta etapu,
                                  #   szkic załogi, lista sprzątania (CLEAN_ARGV), karty update/models, count()
core/panel/pricing.mjs            # PRICING 2026-10-08 (tylko claude-opus-5-5), priceRecord, writeTtl — stała w kodzie
core/panel/measure.mjs            # rekord pomiaru (16 pól, stage i task), aggregate, projectSummary
core/panel/flow.mjs, attribution.mjs, progress.mjs, plan-state.mjs, commands.mjs, charts.mjs, theme.mjs
core/panel/headings.mjs           # GENEROWANY: 36 nagłówków Kalamem (E5 dodał „confirm”)
core/tools/sync-panel-core.js     # kopia rdzenia do trzech pluginów (+ --check), 14 plików
panel/hooks/register.tsx          # 1399 linii: pasek, kolektor, panel (Komendy, Mapa, Ściąga, Frazy, Koszty), karta potwierdzenia
panel/hooks/*.test.ts             # 53 testy relai-panel (decisions.test.ts: 12)
progress/hooks/progress.test.ts   # 16 testów; cache-keeper/hooks/band.test.ts — 19
```

Testy repo: `node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js adapters/codex/tests/*.test.js core/panel/tests/*.test.js`
(**236/236** po E5, FAKT). Testy modów: `claude plugin test .` binarką 2.1.293 w `panel/` (53/53),
`progress/` (16/16) i `cache-keeper/` (19/19) — FAKT. `node core/tools/validate-adapters.js` —
zaliczone po E5 (skill Codeksa generowany z komend: `node adapters/codex/generate-skills.js`).

**Czego jeszcze nie ma (to jest zakres tego etapu):** podglądu dokumentów projektu w panelu ani
znacznika „zmieniony w tej turze”; cennika poza stałą w kodzie (nie ma pliku stawek, nie ma
odświeżenia, nie ma różnicy stara–nowa); ostrzeżenia o starej dacie cennika; przypomnienia
o modelu bez ceny z liczbą rekordów; żadnego ruchu sieciowego w żadnym pluginie (`$.http`
nieużywane).

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
   parytetu nie przepuści, nie trafia do pytania jako wykonalna (L-0154). (L-0017, L-0018,
   L-0040, L-0051, L-0052, L-0063, L-0069, L-0082, L-0115, L-0117, L-0123, L-0134, L-0144, L-0150,
   L-0154)
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
    częścią pomiaru (L-0152).
    (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094, L-0098, L-0137, L-0140, L-0142, L-0145, L-0147,
    L-0149, L-0152)

**Wyprowadzone 2026-08-20 do `docs/PULAPKI.md`:** sześć pozycji, które były pułapkami
narzędziowymi, a nie zasadami pracy — `tar` na `PATH` (L-0021), sesja pomiarowa `claude -p`
(L-0024), PowerShell 5.1 i UTF-8 (L-0027), `--allowedTools` przy `acceptEdits` (L-0028),
restart aplikacji po `plugin update` (L-0031), `git worktree` zamiast `git archive | tar`
(L-0039). Obowiązują dalej — czytasz je z rejestru pułapek, na żądanie.

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/PANEL_CLAUDE/E6/`.** Wszystko tymczasowe —
tsconfig, venv z fontTools, sondy, zapisane kopie strony cennika do testów parsera, strony do
kontroli w Chromium, wyjścia `plugin validate` — powstaje tam. Artefakt, który z natury musi leżeć
**poza** projektem (kopie pluginów i sondy w `~/.claude/dev-mods/`), wpisujesz do wpisu dziennika
**z nazwy**. Skrypt edycji kodu z backslashem albo `\n` powstaje narzędziem Write, nie heredokiem
(L-0148). **Sonda nie ma przycisku działania niszczącego** (`/clear`, kasowanie, zapis cennika)
bez osobnego potwierdzenia, a stan etapu jest w `notatki.md` katalogu roboczego przed każdym
krokiem, który może skasować kontekst (L-0153).

1. **Pytanie przed pracą** — jedno AskUserQuestion, wszystko naraz, rekomendacja z powodem,
   odpowiedzi do wpisu dziennika. Zanim zadasz pytanie o zasięg zmiany pliku, sprawdź, czy plik nie
   jest generowany z innego (L-0154):
   (a) **gdzie żyje zaktualizowany cennik**: plik projektu poza gitem (np.
   `.claude/relai/panel/cennik.json`) nakładany na `PRICING` z kodu, czy zmiana `pricing.mjs`
   w repo przez komendę; i jak wyliczenie „trzyma stawki” (R6) — stawka w rekordzie, migawka
   cennika z datą przy raporcie, czy inaczej;
   (b) **próg starej daty cennika** w dniach i gdzie stoi (wiersz w `docs/USTAWIENIA.md` czy stała);
   (c) **które dokumenty w podglądzie** (warstwa startu sesji: `CLAUDE.md`, `docs/STATE.md`,
   `docs/DZIENNIK.md` — ryzyka i ostatni wpis, `docs/LEKCJE.md` — „Zasady aktywne”,
   `docs/USTAWIENIA.md`, `STATUS.md` i prompt aktywnego etapu) i w jakiej głębokości (cały plik,
   sekcje, fragment);
   (d) **skąd znacznik „zmieniony w tej turze”**: wyniki narzędzi zapisujących w zdarzeniach tury
   (`turn.step` → `toolUses`), czy porównanie czasu modyfikacji plików na początku i końcu tury;
   (e) **adres strony cennika** i zgoda na **jeden** odczyt sieciowy w sondzie (punkt 2) — sonda
   jest ruchem sieciowym, więc też potrzebuje „tak”.
2. **Sonda** (folder modów sesji, nazwa z nazwy we wpisie) — po zgodzie z 1(e): czy
   `$.http.fetch` do strony cennika działa z tej instalacji i w jakim kształcie wraca treść
   (zapisz kopię do katalogu roboczego jako materiał testów parsera); jakie pole zdarzeń tury niesie
   ścieżkę pliku zmienionego narzędziem `Edit` / `Write` (zależnie od 1(d)); kontrola pozytywna
   w tym samym przebiegu. Wynik do `docs/PULAPKI.md`.
3. **`core/panel/pricing.mjs`** (+ `core/panel/tests/pricing.test.js`) — parser strony cennika do
   listy stawek (model → wejście, wyjście; mnożniki cache) z kontrolą „ile wierszy odrzucono”;
   różnica stara–nowa dla każdego modelu i kategorii z oznaczeniem „nowy”; nałożenie zapisanego
   cennika na `PRICING` według 1(a); modele bez ceny z rekordów (sesja i projekt) z liczbą rekordów;
   ostrzeżenie o starej dacie według 1(b); wyliczenie trzymające stawki (R6). Test na zapisanej
   kopii strony z sondy i na stronie zmienionej (parser nie przechodzi → `null`, nic do zapisu)
   oraz kontrola mutacyjna.
4. **`core/panel/documents.mjs`** (+ test) — lista dokumentów z 1(c) z tytułem, ścieżką,
   fragmentem do podglądu i stanem „zmieniony w tej turze” z 1(d); dokument, którego nie ma, mówi to
   słowem. Test na realnych plikach tego repo, który sam ustawia stan wyjściowy (L-0150).
5. **`panel/hooks/register.tsx`** — zakładka „Dokumenty” (podgląd, znacznik zmiany w turze);
   w „Kosztach” data i źródło cennika przy kwotach, ostrzeżenie o starej dacie, przypomnienie
   o modelu bez ceny z liczbą rekordów i kartą „Zaktualizować cennik?” → pobranie (jedna funkcja
   z `$.http.fetch`, z nazwy) → drugi krok karty z różnicą stara–nowa → zapis po drugim „Tak”;
   odmowa wycisza przypomnienie dla modelu do zmiany daty cennika; przycisk „Odśwież cennik” tą
   samą drogą. Brak sieci i zmieniona strona — komunikat, stary cennik nietknięty. Terminal
   tekstem. Nowe nagłówki w `HEADINGS` i `build-panel-headings.js`. Jeden wariant do zrzutu
   człowieka **przed** dokończeniem etapu (zasada 15).
6. **Testy modu** (`panel/hooks/*.test.ts`) — nic nie idzie do sieci ani na dysk bez „Tak” (dowód
   negatywny na atrapie `http.fetch` i `fs.write`); drugi krok przed zapisem; brak sieci i strona
   zmieniona → zero zapisów; odmowa wycisza przypomnienie; podgląd dokumentu i znacznik zmiany;
   zero przepełnień przy 40 kolumnach (instrument `minWidth` z kontrolą na podłożonym defekcie)
   na obu powierzchniach; testy E1–E5, E8, E9 zielone bez osłabiania asercji, w tym `progress/`
   i `cache-keeper/`.
7. **`panel/.claude-plugin/plugin.json`** — 0.7.0 → 0.8.0 (niewydana), opis z jedynym ruchem
   sieciowym nazwanym wprost; `panel/types/index.d.ts` dla nowych wartości `$.state`.
8. **`docs/STATE.md`** — obszar panelu: dokumenty i cennik, wyjątek od R7.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] Odpowiedzi z punktu 1 i wynik sondy zapisane w dzienniku z datą; pułapki silnika w `docs/PULAPKI.md`.
- [ ] Testy repo — komenda ze „Stanu wyjściowego” kończy się bez błędu; liczba przed (236, FAKT —
      zmierz ją sam w osobnym `git worktree` HEAD-a **poza** `.claude/relai/work/`, L-0151) i po
      w dzienniku.
- [ ] `node core/tools/sync-panel-core.js --check` — zgodne dla trzech pluginów.
- [ ] `claude plugin validate` (binarka 2.1.293) dla `panel`, `progress` i `cache-keeper` — zaliczone.
- [ ] **R7 z jednym wyjątkiem:** w `panel/` i `progress/` zero wywołań
      `$.http|$.net|fetch(|$.model|prompt.compose|session.append|$.tool.register` **poza jedną
      funkcją pobrania cennika w `panel/hooks/register.tsx`, nazwaną we wpisie**; kontrola pozytywna
      wzorca na podłożonym tekście; adres w tej funkcji to wyłącznie strona cennika Anthropic.
- [ ] `tsc` strict na typach silnika — 0 błędów, z kontrolą pozytywną (podłożony błąd złapany);
      `claude plugin test` w trzech pluginach zielone (53 + 16 + 19 przed etapem, FAKT).
- [ ] **R4 i Aneks D (dowód negatywny):** test modu pokazuje, że bez „Tak” nie było ani odczytu
      sieci, ani zapisu cennika, a po pierwszym „Tak” bez drugiego — odczyt, ale bez zapisu.
- [ ] **Kryterium planu:** na żywo na desktopie — przypomnienie o modelu bez ceny z nazwą i liczbą
      rekordów (np. subagent na Sonnecie), karta, różnica stara–nowa, zapis po drugim „Tak”, kwota
      tego modelu już z ceną; dokument zmieniony w turze oznaczony w zakładce „Dokumenty”; zrzut
      człowieka.
- [ ] Panel na desktopie i w terminalu: nowe elementy widoczne, zero szarych linii `refused` /
      `threw`; zrzut zaakceptowany przez człowieka. Sesja terminalowa startowana z podfolderu
      projektu (P-021).
- [ ] Każde nowe Svg sprawdzone w Chromium na szerokościach 900 / 560 / 360 px, z kontrolą na
      podłożonym defekcie (P-020, L-0142).
- [ ] Bezpieczeństwo: `grep -rnE "sk-ant-|ANTHROPIC_API_KEY="` po plikach zmienionych w tym etapie
      (lista z `git status --short`) nie zwraca nic poza dokumentami, które ten wzorzec cytują
      (L-0134); kontrola pozytywna na próbce składanej w czasie wykonania. Zapytanie do strony
      cennika nie niesie niczego z projektu (dowód: test atrapy `http.fetch` — adres i brak treści).
- [ ] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy”, z podpisem.
- [ ] Katalog roboczy `.claude/relai/work/PANEL_CLAUDE/E6/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po
      w sekcji „Zweryfikowane” wpisu. Artefakty poza tym katalogiem (kopie pluginów i sondy
      w folderze modów sesji) wypisane z nazwy, z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/PANEL_CLAUDE/STATUS.md`: E6 → ZREALIZOWANY (data), E7 → GOTOWY DO STARTU, link do
   `PROMPT_ETAP_7.md` w kolumnie `Prompt`, linia w dzienniku wdrożenia.
2. Katalog roboczy etapu — raport `clean-work.js`, kasowanie po „tak”, liczby przed i po do wpisu.
3. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”. Przegląd ryzyk C1, C3, C10,
   C11; lekcje z etapu do `docs/LEKCJE.md` i odświeżone „Zasady aktywne”; pułapki silnika do
   `docs/PULAPKI.md`. Pozycje „Do zrobienia przez człowieka” → sekcja „Bramki manualne” `STATUS.md`.
4. `docs/STATE.md` — obszar panelu; linia „Aktywny plan” w `CLAUDE.md`.
5. **Wygeneruj `PROMPT_ETAP_7.md`** w tym folderze, ze specyfikacji promptu etapowego
   (`.claude/relai/templates/SPEC_PROMPT_ETAPU.md`): na bazie `PLAN.html` sekcja 6 (E7 — walidator
   wersji obejmuje pluginy, README i KOMENDY, pełne testy, wydanie wg P-005), sekcja 9 (decyzja
   „publicznie czy lokalnie” przed E7), Aneks C (wpisy `relai-progress` i `relai-cache-keeper`
   w `marketplace.json`), **bramek manualnych z `STATUS.md`** (pomiar na żywo z E5: start z karty
   bez drugiego pytania i `/relai-stage` bez znacznika — po wydaniu `relai` z nową procedurą),
   „Świadomie odłożone” z wpisów E4–E6 (podział `register.tsx`, sprzątanie starych pomiarów C11,
   procedura `/relai-clean` wobec decyzji z karty), realnego stanu po tym etapie i lekcji z tego
   etapu. E7 jest ostatnim etapem planu — jego rytuał zastępuje generację następnego promptu
   sekwencją „Zamknięcie planu” skilla `relai-planning`.
6. Commit — propozycja conventional message, po zgodzie człowieka.
