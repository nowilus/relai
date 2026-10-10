# PROMPT_ETAP_9 — Postęp pracy i agenci na żywo

> **Aneks C (2026-10-09) zmienia ten prompt:** postęp i agenci w nowym pluginie `relai-progress`
> (`progress/`, fork `savvy-progress`), `cache-keeper-pl` → `relai-cache-keeper` (`cache-keeper/`),
> timer cache usunięty z paska `relai-panel`; oba pluginy w tym repozytorium, wpisy w marketplace
> w E7; `lukasz-mods` porzucony. Tam, gdzie treść niżej mówi inaczej, wygrywa Aneks C
> (`PLAN.html`, sekcja 10).

Plan: PANEL_CLAUDE • Etap: **E9 z E9** (po E3, przed E4 — Aneks B) • Wygenerowano: 2026-10-08 (autor: Opus 5.5, w rytuale „Na koniec" etapu E3) • Wykonawca: **Opus** (STATUS: „model wykonawczy: Opus, w Claude Code"), `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-09-24`; D-85). Jeśli sesja działa na innym modelu —
> zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom
> `/effort`: `high` (etap dotyka trzech modów w trzech miejscach — repo, prywatne repo człowieka,
> fork cudzego pluginu — a pasek nad promptem jest współdzielony; ryzyko C8 ma poziom średni).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sekcja niemutowalna, rytuał „Na koniec" |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (C1, C3, C8, C10, C11) + wpis „2026-10-08 — E3 planu PANEL_CLAUDE" (decyzje człowieka o pasku i postępie, „Świadomie odłożone") |
| `docs/LEKCJE.md` | wyłącznie „Zasady aktywne" — przepisane też niżej (zwłaszcza 4, 5, 13, 15) |
| `docs/PULAPKI.md` | **P-017**, **P-018** i **P-020** (zachowania silnika modów 2.1.293, pomiar tokenów, wykresy) |
| `docs/plany/PANEL_CLAUDE/PLAN.html` | sekcja 10 — **Aneks B** (zakres E9); sekcje 6–8 tylko dla granicy z E4 i przypadków brzegowych |
| `~/.claude/plugins/marketplaces/claude-kit/plugins/savvy-progress/` | wzorzec: `README.md` (licencja MIT, autor), `hooks/register.tsx` — `agent.spawn` (~l. 760), `turn.step` (~l. 793), `AbovePrompt` (~l. 1025), rejestracja narzędzi `progress` / `step` |
| `C:/Users/Lukasz/Desktop/cache-keeper-pl/` | `.claude-plugin/marketplace.json` (marketplace `lukasz-mods`, dziś jeden plugin ze `source: "./"`), `hooks/register.tsx` — `AbovePrompt` (~l. 474) |
| `panel/hooks/register.tsx` | pasek w ramce (`relai-band-frame`), kolektor E3 (`collect`, `costData`), zakładki panelu |
| `core/panel/measure.mjs`, `core/panel/plan-state.mjs` | rekord pomiaru i agregacja (`agentLabel`, `aggregate`); aktywny plan i etap |

Typy API modów: wczytaj skill `plugin-authoring` i przeszukaj `claude-code.d.ts` tego builda
(`grep`): `'agent.spawn'`, `agent.complete` (albo odpowiednik), `$.agent`, `$.tool.register`,
`AbovePrompt`, `$.fs.list`.

## Decyzje już podjęte — nie otwierasz ich ponownie

- Aneks B (decyzje człowieka 2026-10-08, AskUserQuestion w E3): postęp i panel agentów to
  **własna implementacja w `relai-panel`**, wzorowana na `savvy-progress`, z atrybucją MIT; pasek
  nad promptem — **jednolite karty modów**; `savvy-progress` dostaje **fork do marketplace
  `lukasz-mods`**; przebudowa paska trzech modów należy do **tego** etapu.
- Zasada człowieka (2026-10-08): **każdy element nad promptem jest jawnie i widocznie
  oddzielony** — dotyczy każdego przyszłego elementu paska, nie tylko trzech dzisiejszych modów.
- Wariant A planu: **mod rysuje i wywołuje, rdzeń liczy** — logika postępu i agentów w
  `core/panel/*.mjs` bez API modów, kopia do `panel/hooks/core/` wyłącznie przez
  `node core/tools/sync-panel-core.js`; wszystko, co dostaje `$` albo `on`, w
  `panel/hooks/register.tsx` (L-0136).
- Koszt agenta bierzesz z kolektora E3 (`.claude/relai/pomiary/`, schemat z polem `tool`), nie
  liczysz go drugi raz; brak pomiaru słowem, nigdy zerem; kwoty i procenty z dwoma miejscami po
  przecinku (L-0145).
- Wygląd z E8 i E3: motyw RelAI, nagłówki Kalamem w `Svg`, natywne przyciski z sygnałem kliknięcia,
  legenda „tokeny · $"; wykres `Svg` z atrybutem `width`, interakcja w `isInteractive`, kontrola
  w Chromium przed pokazaniem na żywo (P-020, L-0142). Terminal dostaje tekstowy odpowiednik.
- Panel nie woła modelu, nie dopisuje nic do promptu systemowego, nie używa sieci (R7, D-80 aneks).
- Reset timera cache po `/clear` (`classic.SessionStart` z matcherem nie odpala) — „świadomie
  odłożone" w E3, **poza zakresem E9**.
- **Granica zakresu:** przypisanie kosztów do etapu i zadania oraz mapa przepływu — **E4**; E9
  pokazuje postęp i agentów, nie liczy kosztu etapu. Decyzje w panelu — E5; dokumenty i cennik
  z sieci — E6; README i wydanie `relai-panel` — E7.

## Stan wyjściowy (co realnie zastajesz po E3)

RelAI 2.7.1 w repo i publicznie. `relai-panel` **0.4.0, niewydany, niezainstalowany**; mierzony
przez hot reload modów sesji (kopia `panel/` w `~/.claude/dev-mods/<id-sesji>/relai-panel/`, zgoda
człowieka w oknie „Enable hot reloading"). Binarka silnika:
`%APPDATA%/Claude/claude-code/2.1.293/83cb0bd7fed4/claude.exe` z wnętrza sesji (`claude` w `PATH`
to 2.1.280; P-019). TypeScript: `npx --offline -y -p typescript@5 tsc -p <tsconfig>` — tsconfig
odtwarzasz w katalogu roboczym (strict, `noUncheckedIndexedAccess`, `allowJs` + `checkJs`,
`jsx: react`, `jsxFactory: h`, `include`: plik typów silnika ze skilla, `panel/hooks`,
`panel/types`, `core/panel/*.mjs`; `exclude`: `panel/hooks/*.test.ts`). Nagłówki Kalamem wymagają
fontTools: `python -m pip install --target .claude/relai/work/PANEL_CLAUDE/E9/pylib fonttools brotli`,
potem `PYTHONPATH=.claude/relai/work/PANEL_CLAUDE/E9/pylib node core/tools/build-panel-headings.js`.

```
core/panel/cache-timer.mjs        # timer cache; Usage, totalInput, judgeStep (E1)
core/panel/plan-state.mjs         # aktywny plan i etap (E1)
core/panel/commands.mjs           # FORMS: 14 formularzy, buildCommand (E2)
core/panel/phrases.mjs            # frazy i ściąga z docs/KOMENDY.md (E2)
core/panel/theme.mjs              # THEME, HEADINGS, NUMERAL_GLYPHS, COST_COLORS (E8, E3)
core/panel/headings.mjs           # GENEROWANY: nagłówki Kalamem + NUMERALS (cyfry) jako Svg
core/panel/measure.mjs            # rekord pomiaru, klucz bez podwójnego liczenia, aggregate, agentLabel (E3)
core/panel/pricing.mjs            # cennik z datą 2026-10-08 i źródłem, priceRecord, cacheEffect (E3)
core/panel/charts.mjs             # stackBar, hoverColumns (oś Y w marginesie, podpowiedzi), spark (E3)
core/panel/tests/*.test.js        # testy rdzenia panelu (w tym measure, pricing, charts)
core/tools/sync-panel-core.js     # kopia core/panel/*.mjs + icons.mjs (+ --check)
core/tools/build-panel-headings.js, core/tools/panel-headings.py  # nagłówki i cyfry Kalamem
panel/.claude-plugin/plugin.json  # relai-panel 0.4.0
panel/types/index.d.ts            # $.state: view (w tym 'costs'), selected, values, query, fills, sent, pressed
panel/hooks/register.tsx          # pasek w ramce + kolektor pomiarów + Pane (zakładki, w tym „Koszty")
panel/hooks/fmt.ts                # usd, pct — dwa miejsca po przecinku
panel/hooks/{register,pane,theme,costs}.test.ts   # 33 testy modu
```

Testy repo: `node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js adapters/codex/tests/*.test.js core/panel/tests/*.test.js`
(167/167 po E3, FAKT). Testy modu: `claude plugin test panel` binarką 2.1.293 (33/33, FAKT).

Poza repo: `cache-keeper-pl` w `C:/Users/Lukasz/Desktop/cache-keeper-pl/` (prywatny, marketplace
`lukasz-mods` z jednym pluginem w korzeniu repo); `savvy-progress` 1.2.0 zainstalowany
z `johnnyvizz/claude-kit` (MIT), rysuje własny pasek i rejestruje narzędzia modelu `progress`
i `step`. Dziś trzy mody rysują nad promptem; ramkę ma tylko pasek RelAI (E3).

**Czego jeszcze nie ma (to jest zakres tego etapu):** paska postępu pracy RelAI, panelu agentów na
żywo, jednolitych kart trzech modów nad promptem, forka `savvy-progress` w `lukasz-mods`.

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
    (L-0041, L-0042, L-0044, L-0047, L-0092, L-0133, L-0136, L-0138, L-0139)
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
    odczyt jest błędem (L-0145).
    (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094, L-0098, L-0137, L-0140, L-0142, L-0145)

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/PANEL_CLAUDE/E9/`.** Wszystko tymczasowe —
tsconfig, `pylib` z fontTools, sondy, strony do kontroli w Chromium, wyjścia `plugin validate` —
powstaje tam. Artefakt, który z natury musi leżeć **poza** projektem (folder modów sesji
w `~/.claude/dev-mods/`, zmiany w `cache-keeper-pl` i w forku), wpisujesz do wpisu dziennika
**z nazwy**, a nazwę tymczasowego zaczynasz od slugu projektu (`relai-…`). Sonda, która ma się
wyłączyć, **znika razem z folderem**, nie przełącznikiem w kodzie — w E3 wyłączona przełącznikiem
sonda zapisywała dalej po przeładowaniu.

1. **Pytanie przed pracą** — jedno AskUserQuestion, wszystko naraz, rekomendacja z powodem,
   odpowiedzi do wpisu dziennika:
   (a) źródło postępu: wyłącznie deterministyczne (punkty zakresu i weryfikacji z promptu etapu,
   `STATUS.md`, zdarzenia agentów, kolektor) — **rekomendowane**, bo R7 zabrania dopisywania do
   promptu, a narzędzie modelu w stylu `savvy-progress` dokłada definicję do każdego zapytania —
   czy także narzędzie `$.tool.register`, którym model zgłasza krok;
   (b) układ marketplace `lukasz-mods` dla dwóch pluginów — `plugins/<nazwa>/` w repo
   `cache-keeper-pl` czy osobne repo marketplace; (c) gdzie leży fork (ścieżka, nazwa, czy zostawia
   oryginał zainstalowany do porównania).
2. **Sonda (przed kodem)** — mod `relai-probe-e9` w folderze modów sesji: zdarzenia agentów
   (`agent.spawn`, zakończenie, `e.agentId` w `turn.step`), kolejność i pola; kolejność rysowania
   `AbovePrompt` przy trzech modach i to, czy karta jednego moda może oddzielić się od sąsiada bez
   ruszania jego kodu. Kontrola pozytywna w tym samym przebiegu. Po pomiarze folder sondy kasujesz.
3. **`core/panel/progress.mjs`** (+ `core/panel/tests/progress.test.js`) — model postępu: źródła
   (etap planu: punkty z `PROMPT_ETAP_N.md` i `STATUS.md`; `/relai-crew`; praca poza planem),
   procent z liczby punktów, stan słowem, gdy źródła nie ma; brak „100%" przed odhaczeniem
   ostatniego punktu (L-0145).
4. **`core/panel/agents.mjs`** (+ test) — lista agentów na żywo: uruchomieni, zakończeni, model,
   kontekst, koszt z rekordów kolektora (`agentLabel`, `aggregate` z `measure.mjs`), bez drugiego
   liczenia.
5. **`panel/hooks/register.tsx`** — pasek postępu RelAI w karcie paska i panel agentów (zakładka
   albo sekcja — rozstrzygasz z kalibracją smaku, jeden wariant do zrzutu przed dokończeniem);
   terminal tekstem. Plik nagłówków: nowe pozycje w `HEADINGS` i `build-panel-headings.js`.
   Atrybucja MIT `savvy-progress` w pliku, który tę logikę niesie, i w `panel/`.
6. **Jednolite karty nad promptem** — karta moda: etykieta, treść, odstęp, jawna granica;
   `relai-panel` (repo), `cache-keeper-pl` (`C:/Users/Lukasz/Desktop/cache-keeper-pl/`) i fork
   `savvy-progress` w `lukasz-mods` według odpowiedzi z punktu 1. Zmiany poza repo z własnym
   `plugin validate`, `plugin test` i commitem w ich repo — po zgodzie człowieka.
7. **Testy modu** (`panel/hooks/*.test.ts`) — postęp z podłożonego promptu etapu, agent uruchomiony
   i zakończony, koszt agenta z rekordów, karta paska z granicą, zero przepełnień przy 40 kolumnach
   (instrument `minWidth` z `theme.test.ts`); testy E1, E2, E8 i E3 zielone bez osłabiania asercji.
8. **`panel/.claude-plugin/plugin.json`** — 0.4.0 → 0.5.0 (niewydana); `panel/types/index.d.ts`
   dla nowych wartości `$.state`.
9. **`docs/STATE.md`** — obszar panelu: postęp, agenci, karty paska, fork w `lukasz-mods`.

## Weryfikacja (wszystkie punkty muszą przejść)

- [x] Odpowiedzi z punktu 1 zapisane w dzienniku z datą.
- [x] Testy repo — komenda ze „Stanu wyjściowego" kończy się bez błędu; liczba przed (167, FAKT)
      i po w dzienniku.
- [x] `node core/tools/sync-panel-core.js --check` — zgodne.
- [x] `claude plugin validate panel` (binarka 2.1.293) — zaliczone; lista wywołań `$` bez `$.net`,
      `fetch`, `$.model`, `prompt.compose`, `session.append` (kontrola pozytywna wzorca na
      podłożonym tekście); `$.tool.register` tylko wtedy, gdy punkt 1(a) go wybrał.
      `claude plugin validate .` — wynik identyczny jak przed etapem.
- [x] `tsc` strict na typach silnika — 0 błędów, z kontrolą pozytywną (podłożony błąd złapany);
      `claude plugin test panel` — wszystkie zielone, w tym 33 z E1, E2, E8 i E3.
- [x] `node core/tools/validate-adapters.js` — zaliczone.
- [x] `cache-keeper-pl` i fork: `claude plugin validate` i `claude plugin test` zielone w ich
      folderach; licencja MIT i autor `savvy-progress` obecne w forku i w `panel/`.
- [x] **Postęp na żywo:** w sesji desktopowej wykonującej punkty z podłożonego promptu pasek
      postępu rośnie z liczbą odhaczonych punktów, a przy braku źródła mówi słowem; kontrola
      pozytywna — punkt odhaczony ręcznie w podłożonym pliku zmienia procent.
- [x] **Agenci na żywo:** jeden subagent uruchomiony z sesji pojawia się w panelu jako działający,
      potem zakończony, z modelem i kosztem równym sumie jego rekordów w pliku pomiaru.
- [x] **Pasek nad promptem na desktopie i w terminalu:** trzy karty, każda z etykietą moda
      i widoczną granicą, zero szarej linii `refused` / `threw`; zrzut zaakceptowany przez
      człowieka.
- [x] Każde nowe `Svg` sprawdzone w Chromium na szerokościach 900 / 560 / 360 px, z kontrolą na
      podłożonym defekcie (P-020, L-0142).
- [x] Bezpieczeństwo: `grep -rnE "sk-ant-|ANTHROPIC_API_KEY="` po plikach zmienionych w tym etapie
      (lista z `git status --short` oraz zmiany w `cache-keeper-pl` i forku) nie zwraca nic poza
      dokumentami, które ten wzorzec cytują (L-0134); kontrola pozytywna na podłożonej próbce.
- [x] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy", z podpisem.
- [x] Katalog roboczy `.claude/relai/work/PANEL_CLAUDE/E9/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak"; liczby przed i po
      w sekcji „Zweryfikowane" wpisu. Artefakty poza tym katalogiem (folder modów sesji, sonda
      `relai-probe-e9`, zmiany w `cache-keeper-pl` i forku) wypisane z nazwy, z tym, co się z nimi
      stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/PANEL_CLAUDE/STATUS.md`: E9 → ZREALIZOWANY (data), E4 → GOTOWY DO STARTU, link do
   `PROMPT_ETAP_4.md`, linia w dzienniku wdrożenia.
2. `docs/DZIENNIK.md`: wpis (Zrobione / Zweryfikowane — jak dokładnie / Świadomie odłożone /
   Do zrobienia przez człowieka), przegląd tabeli ryzyk (C1, C3, C8, C10), lekcje z etapu do
   `docs/LEKCJE.md` z odświeżeniem „Zasad aktywnych".
3. Bramki manualne w `STATUS.md` dla nierozstrzygniętych pozycji „Do zrobienia przez człowieka".
4. `docs/STATE.md` i inne dotknięte dokumenty (`docs/PULAPKI.md` przy nowym zachowaniu silnika).
5. **Wygeneruj `PROMPT_ETAP_4.md`** wg `.claude/relai/templates/SPEC_PROMPT_ETAPU.md`: z sekcji 5
   i 6 planu (E4 — mapa przepływu i przypisanie pracy), realnego stanu repo po E9 (rekord pomiaru,
   model postępu, lista agentów) i lekcji z E3 i E9.
6. Commit (conventional, po angielsku) — zapytaj o zgodę.
