# PROMPT_ETAP_8 — Motyw RelAI i ikony komend w panelu

Plan: PANEL_CLAUDE • Etap: **E8 z E8** (Aneks A: wykonywany po E2, przed E3) • Wygenerowano: 2026-10-08 (autor: Opus 5.5, w rytuale „Na koniec" etapu E2) • Wykonawca: **Opus** (STATUS: „model wykonawczy: Opus, w Claude Code"), `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-09-24`; D-85). Jeśli sesja działa na innym modelu —
> zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom
> `/effort`: `high` (elementy graficzne silnika modów na desktopie są niezmierzone, a ocenę wyglądu
> wydaje człowiek — dwie pętle pomiaru na żywo).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sekcja niemutowalna, rytuał „Na koniec" |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (C1, C3, C8, C9) + wpis „2026-10-08 — E2 planu PANEL_CLAUDE" |
| `docs/LEKCJE.md` | wyłącznie „Zasady aktywne" — są też przepisane niżej (zwłaszcza 13 i 15) |
| `docs/PULAPKI.md` | **P-017** (pięć zachowań silnika modów) |
| `docs/plany/PANEL_CLAUDE/PLAN.html` | sekcja 10, **Aneks A** — zakres tego etapu; sekcje 5 i 8 (warstwy, wąski terminal) |
| `.claude/relai/templates/HTML_PLAN/szablon.html` | blok `:root` (linie ~7–30): paleta, role kolorów, promienie, fonty — źródło motywu |
| `docs/zasoby/branding/ikony/*.svg` | 14 ikon komend (48×48, kolory palety) — tak samo jak w tabeli komend `docs/PRZEWODNIK.md` |
| `docs/zasoby/branding/banner.svg`, `logo.svg` | znak i nastrój grafik GitHuba |
| `panel/hooks/register.tsx`, `panel/hooks/pane.test.ts` | stan po E2: panel (sekcja „the pane"), atrapy testów |
| `core/panel/commands.mjs`, `core/tools/sync-panel-core.js` | `FORMS` (kolejność i nazwy 14 komend), droga kopii rdzenia do pluginu |

Typy API modów: wczytaj skill `plugin-authoring` i przeszukaj `claude-code.d.ts` tego builda
(`grep`): `export type Elements`, `SvgProps`, `ClientProps`, `ImageProps`, `BoxProps`
(kolory, ramki, `borderStyle`), `TextProps`, `ButtonProps` (`variant`, `plain`, `hotkey`).

## Decyzje już podjęte — nie otwierasz ich ponownie

- **Aneks A (2026-10-08):** etap E8 „Motyw RelAI i ikony komend" po E2, przed E3; numery E3–E7 bez
  zmian. Zakres: tokeny motywu z szablonu HTML planów i brandingu w `core/panel/`, układ wg dobrych
  praktyk UI/UX, ikony 14 komend na desktopie, odpowiednik tekstowy w terminalu, jeden wariant do
  kalibracji smaku przed resztą, zero przepełnień; pierwszy krok — sonda.
- Panel to osobny plugin `relai-panel` w `panel/` (plan, sekcja 4, wariant A); GUI w zakresie RelAI —
  aneks do D-80 z 2026-10-08.
- Logika i dane w `core/panel/*.mjs` (ESM, bez API modów), kopia do `panel/hooks/core/` wyłącznie
  przez `node core/tools/sync-panel-core.js`, pilnowana testem (E1, P-017).
- **Wszystko, co dostaje `$` albo `on`, mieszka w `panel/hooks/register.tsx`** — walidator modów
  nie śledzi `$` przez import (L-0136, P-017 punkt 5).
- Plugin czyta i importuje wyłącznie pliki ze swojego folderu (P-017 punkt 1): ikony trafiają do
  pluginu tą samą drogą co rdzeń — narzędzie kopiujące, źródłem zostaje `docs/zasoby/branding/ikony/`.
- Zachowanie z E2 zostaje: panel tylko z komendy, podgląd dokładnego tekstu przed wysłaniem, „Wyślij"
  tylko przy poprawnych wartościach, frazy z `docs/KOMENDY.md`, bez pluginu `relai` nic nie idzie do
  czatu. Pasek z E1 bez zmian funkcjonalnych (owijacz z `next`, bez `width` — C8).
- Preferencja człowieka (pamięć projektu, 2026-08-07): odrzucone na stałe kierunki — konsola
  terminalowa/monospace, panel administracyjny, blueprint, plakat brutalistyczny. Oczekiwane:
  zaokrąglenia, ciepła paleta RelAI, typografia z charakterem, „wigor"; **jeden wariant do kalibracji
  przed serią**; układ liczony przez silnik, nic poza kontenerem.
- Kod i identyfikatory po angielsku, tekst dla człowieka po polsku; identyfikatory `/relai-…` zostają
  nazwami przycisków (WYWIAD.md).
- **Granica zakresu:** kolektor pomiarów i raport kosztów — E3; mapa przepływu — E4; karta
  potwierdzenia `/relai-stage`, edycja `/relai-crew`, listy wyboru i „świeży czat" — E5; podgląd
  dokumentów i cennik — E6; README, walidator wersji, wydanie — E7. W E8 nie zmieniasz tego, **co**
  panel wysyła, tylko **jak** wygląda; nie zapisujesz pomiarów i nie wydajesz wersji.

## Stan wyjściowy (co realnie zastajesz po E2)

RelAI 2.7.1 w repo i publicznie. E2 zrealizowany 2026-10-08: `/relai-panel` otwiera panel boczny
(zakładki Komendy / Ściąga / Frazy, formularze 14 komend, podgląd, „Wyślij", frazy przyciskami);
zmierzony na żywo w aplikacji desktopowej. Wygląd: domyślne elementy silnika — tekst, przyciski
`[ … ]`, brak kolorów marki i ikon; człowiek ocenił go jako wymagający remontu (Aneks A).
`relai-panel` 0.2.0, **niezainstalowany**; w E2 mierzony przez hot reload modów sesji (kopia
`panel/` w `~/.claude/dev-mods/<id-sesji>/relai-panel/`, zgoda człowieka w oknie „Enable hot
reloading"). Binarka silnika: `%APPDATA%/Claude/claude-code/2.1.293/83cb0bd7fed4/claude.exe`
(`claude` w `PATH` to 2.1.280). TypeScript: `npx --offline -y -p typescript@5 tsc -p <tsconfig>`.

```
core/panel/commands.mjs           # FORMS: 14 formularzy (kolejność z WYWIAD.md), buildCommand, checkForms
core/panel/phrases.mjs            # frazy i ściąga z docs/KOMENDY.md
core/panel/cache-timer.mjs        # timer cache (E1)
core/panel/plan-state.mjs         # aktywny plan i etap (E1); etap = pierwszy W TOKU, potem GOTOWY DO STARTU
core/panel/tests/*.test.js        # testy rdzenia panelu (27)
core/tools/sync-panel-core.js     # kopia core/panel/*.mjs -> panel/hooks/core/ (+ --check)
panel/.claude-plugin/plugin.json  # relai-panel 0.2.0, "types": "./types/index.d.ts"
panel/types/index.d.ts            # kontrakt $.state: view, selected, values, query, fills, sent
panel/hooks/register.tsx          # pasek AbovePrompt + /relai-panel + Pane (484 linie)
panel/hooks/register.test.ts      # 8 testów paska (E1)
panel/hooks/pane.test.ts          # 7 testów panelu (E2)
panel/hooks/fmt.ts                # usd, minutes, tokens, clip, join
docs/zasoby/branding/ikony/       # 14 SVG: adopt audit backup branch changelog clean crew handover help models prompt stage tour update
.claude/relai/templates/HTML_PLAN/szablon.html  # :root — --tlo #f2e9d8, --kartka #fffdf7, --txt #312c25,
                                                # --glina #c4643c, --musztarda #d9a134, --szalwia #5f8a68,
                                                # promienie --r-s..--r-xl, fonty Kalam / Hanken Grotesk
```

Testy repo: `node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js adapters/codex/tests/*.test.js core/panel/tests/*.test.js`
(126/126 po E2, FAKT). Testy modu: `claude plugin test panel` binarką 2.1.293 (15/15, FAKT).
Do sprawdzenia typów E2 użył tsconfig z `allowJs` + `checkJs`, `strict`, `noUncheckedIndexedAccess`,
`jsx: react`, `jsxFactory: h`, `include`: plik typów silnika ze skilla, `panel/hooks`, `panel/types`,
`core/panel/*.mjs` — odtwórz go w katalogu roboczym etapu.

Fakty o elementach silnika (z typów 2.1.293, **niezmierzone na żywo**): desktop ma `Svg`
(`source` do 131 072 znaków), `Client` (moduł powierzchni rysujący własny region), `Markdown`,
`Code`, `Link`; terminal nie ma `Svg`, ma `Raster` i `Image` (protokół kitty — tylko kitty/Ghostty,
gdzie indziej `alt`); `mobile` nie ma `Input` ani `Select`.

**Czego jeszcze nie ma (to jest zakres tego etapu):** tokenów motywu RelAI w `core/panel/`, ikon
komend w pluginie, układu panelu z hierarchią i grupami, kolorów marki, stanów wizualnych (wybrana,
niedostępna, błąd, wysłano), testu „zero przepełnień", pomiaru panelu w terminalu na żywo (C3).

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
   siebie. (L-0017, L-0018,
   L-0040, L-0051, L-0052, L-0063, L-0069, L-0082, L-0115, L-0117, L-0123, L-0134)
5. **Instrument pomiarowy sam bywa źródłem fałszu:** wyrażenia regularne trzymaj w pliku zapisanym
   narzędziem zapisu, nie w `node -e` ani w heredoku, a tekst z backslashem (także ścieżkę
   Windows) wstawiasz Edit/Write albo piszesz z `/` (L-0116, L-0119); scenariusz „konfiguracji nie ma" mierz z podstawionym katalogiem domowym; dokładaj
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
   etapie (L-0135).
   (L-0032, L-0037, L-0095, L-0096, L-0105, L-0106, L-0107, L-0110, L-0111, L-0113,
   L-0097, L-0101, L-0102,
   L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086, L-0087, L-0088,
   L-0090, L-0091, L-0124, L-0125, L-0130, L-0131, L-0135)
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
    (L-0041, L-0042, L-0044, L-0047, L-0092, L-0133, L-0136)
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
    (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094, L-0098, L-0137)

**Wyprowadzone 2026-08-20 do `docs/PULAPKI.md`:** sześć pozycji, które były pułapkami
narzędziowymi, a nie zasadami pracy — `tar` na `PATH` (L-0021), sesja pomiarowa `claude -p`
(L-0024), PowerShell 5.1 i UTF-8 (L-0027), `--allowedTools` przy `acceptEdits` (L-0028),
restart aplikacji po `plugin update` (L-0031), `git worktree` zamiast `git archive | tar`
(L-0039). Obowiązują dalej — czytasz je z rejestru pułapek, na żądanie.

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/PANEL_CLAUDE/E8/`.** Wszystko tymczasowe —
sondy, tsconfig, wyjścia `plugin validate`, zrzuty kalibracyjne — powstaje tam. Artefakt, który
z natury musi leżeć **poza** projektem (folder modów sesji w `~/.claude/dev-mods/`, `%TEMP%`),
wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu (`relai-…`).

1. **Sonda (pierwsza, przed projektowaniem)** — w katalogu roboczym mały mod `relai-probe-e8` w hot
   reload: na desktopie `Svg` z jedną ikoną z `docs/zasoby/branding/ikony/`, `Box` z kolorem tła
   i ramką, `Text` w kolorze `#c4643c`, a jeśli typy na to pozwalają — `Client`; w terminalu to samo
   bez `Svg`. Wynik (co się narysowało, co odrzucił silnik — szara linia `refused`) do wpisu
   dziennika, z kontrolą pozytywną (element, który na pewno się rysuje, obok badanego). Brak `Svg`
   na desktopie → ikony zastępuje odpowiednik tekstowy także tam, opisany w dzienniku (C9).
2. **`core/panel/theme.mjs`** (+ `core/panel/tests/theme.test.js`) — tokeny motywu wyprowadzone
   z `:root` szablonu HTML planów (kolory i ich role, odstępy) w postaci, którą rysują elementy
   silnika; mapa komenda → ikona dla 14 komend z `FORMS`; grupy komend, jeśli kalibracja je
   przyjmie. Test: każda komenda z `FORMS` ma ikonę i każdy plik z `ikony/` ma komendę (liczby
   liczone, odrzuconych 0), kolory tokenów są w bloku `:root` szablonu (kontrola: zmieniony kolor
   zgłoszony).
3. **Ikony w pluginie** — rozszerzenie `core/tools/sync-panel-core.js` (albo osobne narzędzie obok)
   tak, żeby `panel/hooks/core/` dostawał tekst 14 SVG jako moduł ESM; `--check` obejmuje ikony;
   test synchronizacji z podłożonym rozjazdem ikony.
4. **Kalibracja smaku — jeden wariant** — `panel/hooks/register.tsx`: zakładka Komendy w nowym
   wyglądzie na desktopie (ikony, kolory marki, hierarchia, stany), w hot reload; zrzut i ocena
   człowieka **przed** przeróbką pozostałych zakładek. Decyzja człowieka do wpisu dziennika.
5. **`panel/hooks/register.tsx`** — po akceptacji wariantu: Komendy, Ściąga i Frazy w jednym
   motywie; terminal dostaje odpowiednik tekstowy (kolory i układ, bez grafiki); stany wizualne:
   komenda wybrana, niedostępna w sesji, błąd wartości, wysłano / nie wysłano; brak pluginu
   `relai` nadal widoczny jednym zdaniem. Teksty mieszczą się w `bodyColumns`.
6. **`panel/hooks/*.test.ts`** — testy `claude plugin test`: ikony na desktopie dla 14 komend
   (liczone), w terminalu brak `Svg` i obecny odpowiednik; „zero przepełnień" — przy wąskim panelu
   (np. `bodyColumns` 40) żadna linia tekstu z `ui.drawn()` nie przekracza szerokości, z kontrolą
   pozytywną na podłożonym za długim tekście; testy E1 i E2 zielone bez osłabiania asercji.
7. **`panel/.claude-plugin/plugin.json`** — wersja 0.2.0 → 0.3.0 (zmiana wyglądu, niewydana).
8. **`docs/STATE.md`** — obszar panelu: jak wygląda po E8, skąd motyw.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] Testy repo — komenda ze „Stanu wyjściowego" kończy się bez błędu; nowe testy `core/panel/`
      w tym przebiegu; liczba przed (126, FAKT) i po w dzienniku.
- [ ] `node core/tools/sync-panel-core.js --check` — zgodne, łącznie z ikonami; test z podłożonym
      rozjazdem ikony oblewa.
- [ ] `claude plugin validate panel` (binarka 2.1.293) — zaliczone; lista wywołań `$` bez `$.net`,
      `fetch`, `$.model`, `prompt.compose`, `session.append`. `claude plugin validate .` — wynik
      identyczny jak przed etapem (dowód negatywny: lista ostrzeżeń przed i po).
- [ ] `tsc` strict na typach silnika — 0 błędów, z kontrolą pozytywną (podłożony błąd złapany);
      `claude plugin test panel` — wszystkie zielone, w tym 15 testów z E1 i E2.
- [ ] `node core/tools/validate-adapters.js` — zaliczone.
- [ ] Ikony: test z punktu 2 zakresu — komendy z `FORMS` i pliki z `ikony/` sparowane, liczby
      w komunikacie liczone (zasada 6), odrzuconych 0.
- [ ] Sonda z punktu 1 opisana w dzienniku: co desktop i terminal narysowały, co odrzucił silnik,
      z kontrolą pozytywną w tym samym przebiegu.
- [ ] Kalibracja: wariant pokazany człowiekowi przed przeróbką reszty; jego decyzja (przyjęty /
      poprawki / odrzucony) zapisana w dzienniku.
- [ ] **Na żywo w aplikacji desktopowej:** `/relai-panel` w tym repo — ikony przy 14 komendach,
      motyw RelAI, formularz `/relai-tour krotko` nadal wysyła dokładnie podgląd, fraza „sprawdź
      status" nadal idzie z przycisku; oba paski nad promptem (RelAI i `cache-keeper-pl`) widoczne;
      szarej linii `refused` / `threw` brak. **W terminalu** (`claude` 2.1.293 w repo):
      `/relai-panel` otwiera panel bez grafiki, z odpowiednikiem tekstowym (C3). Zrzuty albo
      relacja człowieka do wpisu.
- [ ] Zero przepełnień: test z punktu 6 zakresu zielony, a jego kontrola pozytywna oblewa na
      podłożonym tekście.
- [ ] Bezpieczeństwo: `grep -rnE "sk-ant-|ANTHROPIC_API_KEY="` po plikach zmienionych w tym etapie
      (lista z `git status --short`) nie zwraca nic poza dokumentami, które ten wzorzec cytują
      (L-0134 — prompty etapowe, wpisy dziennika o tym kryterium); kontrola pozytywna na podłożonej
      próbce.
- [ ] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy", z podpisem.
- [ ] Katalog roboczy `.claude/relai/work/PANEL_CLAUDE/E8/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak"; liczby przed i po
      w sekcji „Zweryfikowane" wpisu. Artefakty poza tym katalogiem (folder modów sesji, sonda
      `relai-probe-e8`) wypisane z nazwy, z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/PANEL_CLAUDE/STATUS.md`: E8 → ZREALIZOWANY (data), E3 → GOTOWY DO STARTU, link do
   `PROMPT_ETAP_3.md`, linia w dzienniku wdrożenia (zastępuje linię „E8 rozpoczęty").
2. `docs/DZIENNIK.md`: wpis (Zrobione / Zweryfikowane — jak dokładnie / Świadomie odłożone /
   Do zrobienia przez człowieka), przegląd tabeli ryzyk (C1, C3 — terminal, C8, C9), lekcje z etapu
   do `docs/LEKCJE.md` z odświeżeniem „Zasad aktywnych".
3. Bramki manualne w `STATUS.md` dla nierozstrzygniętych pozycji „Do zrobienia przez człowieka";
   bramka z E1 (sonda `relai-probe` w folderze modów sesji `ab158a41-…`) → ROZSTRZYGNIĘTA, jeśli
   człowiek ją usunął.
4. `docs/STATE.md` i inne dotknięte dokumenty (`docs/PULAPKI.md` przy nowym zachowaniu silnika).
5. **Wygeneruj `PROMPT_ETAP_3.md`** wg `.claude/relai/templates/SPEC_PROMPT_ETAPU.md`: z sekcji 5
   i 6 planu (E3 — kolektor pomiarów i raport kosztów), z decyzji człowieka „wspólny schemat pomiaru
   z panelem Codeksa — przed E3" (sekcja 9 planu; bez niej prompt E3 pyta o nią jako pierwszy krok),
   realnego stanu repo po E8 (motyw, w którym E3 rysuje raport) i lekcji z E8.
6. Commit (conventional, po angielsku) — zapytaj o zgodę.
