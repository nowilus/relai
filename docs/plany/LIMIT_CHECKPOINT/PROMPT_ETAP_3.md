# PROMPT_ETAP_3 — procedura „zapisz pracę” w rdzeniu i faza „czeka” na pasku

Plan: LIMIT_CHECKPOINT • Etap: **E3 z 4** • Wygenerowano: 2026-10-11 (autor: Opus 5.5, w rytuale
„Na koniec” E2) • Wykonawca: **Opus 5.5 w świeżych sesjach** (D-85; STATUS planu), `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **najsilniejszy**, w tym narzędziu:
> **Opus 5.5** (lista modeli Claude Code z dnia `2026-10-08`). Jeśli sesja działa na innym modelu —
> zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom
> `/effort`: `high` (procedura w trzech narzędziach, kolejność kroków odporna na urwany zapis
> i znacznik łapany przez mod — przypadki brzegowe nie wychodzą w szczęśliwej ścieżce).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna, reguła backslasha |
| `docs/plany/LIMIT_CHECKPOINT/PLAN.html` — sekcje 5 (akapity „Zapis pracy”, „Oczekiwanie”, „Punkty styku”), 6 (wiersz E3), 7 (L2, L5, L6), 8 („Zapis urwany”, „Sesja w projekcie bez struktury RelAI”, „/clear po zapisie”), 10 (**Aneks A**) | co robi procedura, w jakiej kolejności, co pasek mówi w fazie „czeka”, co dochodzi z aneksu |
| `docs/plany/LIMIT_CHECKPOINT/STATUS.md` | bramki; jedna otwarta (aneks Codeksa) — rozstrzygana **po** E3, nie w nim |
| `docs/DZIENNIK.md` — wpis „LIMIT_CHECKPOINT E2: karta po turze…” | co E2 dowiózł, co świadomie odłożono (stan karty per rozmowa, `/clear`) |
| `adapters/claude-code/skills/relai-core/SKILL.md` — tabela „Plik / Otwierasz go, gdy” (ok. linii 53) | gdzie dopisać wiersz `limit-checkpoint.md` |
| `adapters/claude-code/skills/relai-core/session-close.md` i `done-check.md` | budulec procedury zapisu: synchronizacja dokumentów, testy, przegląd diffu |
| `cache-keeper/hooks/handoff.ts` i `cache-keeper/hooks/register.tsx` — `limitCheckpoint`, `startHandoff`, `captureHandoff`, `secondRow` | dzisiejsze „Zapisz” = `/handoff`; wzór łapania znacznika `PRZEKAZANIE GOTOWE` i drugiego wiersza paska |
| `adapters/claude-code/commands/relai-stage.md` (Krok 5) i `core/templates/SPEC_PROMPT_ETAPU.md` (element 8) | miejsca zmiany z Aneksu A |
| `adapters/codex/generate-skills.js`, `adapters/cursor/rules/relai-core.mdc` | jak zmiana komendy i skilla trafia do Codeksa i Cursora |
| `docs/PULAPKI.md` — P-017, P-022, P-024 | ścieżki w formie systemu; `prompt.submit` z `/` odrzucany; binarka testów 2.1.295 poza PATH |

## Decyzje już podjęte — nie otwierasz ich ponownie

- „Zapisz pracę teraz” na karcie **jest zgodą na commit lokalny** — bez osobnego pytania w czacie,
  bez pusha (bramka sekcji 9, rozstrzygnięta 2026-10-11). Fraza „zapisz pracę” wpisana ręcznie
  (Cursor, Codex, Claude Code bez karty) — commit z pytaniem jak dziś (D-35).
- Kolejność procedury przy urwanym zapisie (L2, sekcja 8): **commit tego, co przechodzi testy →
  dokumenty (STATE, wpis, STATUS) → plik wznowienia → znacznik `ZAPIS GOTOWY`**. Kod rozgrzebany,
  który nie przechodzi testów: wycofany do ostatniego działającego punktu z notatką w pliku
  wznowienia, nigdy commitowany jako „działa”.
- Plik wznowienia: `.claude/relai/wznowienie/<slug-projektu>.md` (per projekt, nie per sesja — L7),
  szablon `core/templates/SPEC_WZNOWIENIE.md`; niesie hash HEAD z chwili zapisu (L5) — porównanie
  i przycisk „Wznów” to **E4**.
- Poza projektem RelAI „Zapisz” wysyła wariant ogólny jak dzisiejszy `/handoff` (plik przekazania
  w `~/.claude/mods-data/relai-cache-keeper/handoffs/`) i karta mówi, który wariant pójdzie (L6).
- E2: karta, warunek „praca trwa”, „dalej” +5 pkt, „Nie pytaj” — gotowe, nie przebudowujesz.
  „Zapisz” dziś woła `startHandoff`; E3 zamienia to na frazę zapisu.
- **Aneks A (2026-10-11):** każdy punkt Weryfikacji, który przeszedł, wykonawca odhacza w
  `PROMPT_ETAP_N.md` (`- [ ]` → `- [x]`) zaraz po sprawdzeniu — pasek „postęp” liczy te pola.
  Dotyczy też **tego** promptu: odhaczasz na bieżąco.
- Granica zakresu: przycisk „Wznów pracę”, kasowanie pliku wznowienia, porównanie HEAD, brief
  v3.3, README, PULAPKI, wydania `relai-cache-keeper` 0.6.0 i `relai` 2.9.0 to **E4**. Rdzeń
  panelu `core/panel/` poza zakresem (kontrakt PANEL_CODEX). Aneks dla panelu Codeksa — decyzja
  człowieka **po** E3, nie zakres.

## Stan wyjściowy — co realnie zastajesz po E2

RelAI 2.8.0; `relai-cache-keeper` 0.5.0 w repo z kodem E1 + E2 (bez podbicia wersji). Zainstalowana
kopia `~/.claude/plugins/cache/relai/relai-cache-keeper/0.5.0/hooks/` ma wgrane ręcznie `limit.ts`
i `register.tsx` z E2 — pomiar na żywo robisz tą samą drogą (kopia + **przeładowanie aplikacji**;
bez przeładowania działa stary kod, sprawdzone w E2). Testy pluginu:
`"$APPDATA/Claude/claude-code/2.1.295/d2e29494ec83/claude.exe" plugin test cache-keeper` →
**128/128 w 13 plikach** (FAKT, 2026-10-11). Rdzeń: `node --test core/process/tests/*.test.js
core/guardrails/tests/*.test.js core/panel/tests/*.test.js adapters/codex/tests/*.test.js` →
**283/283** (FAKT).

```
cache-keeper/hooks/limit.ts          # E1+E2: próg, fokus, isWorkGoing, cardDue, CARD_OPTIONS (SAVE = „Zapisz pracę teraz”)
cache-keeper/hooks/register.tsx      # limitCheckpoint: SAVE → startHandoff po zwolnieniu karty; Handoff.phase idle|running|ready|continuing
cache-keeper/hooks/handoff.ts        # RELAI_HANDOFF_PROMPT, RELAI_DONE = 'PRZEKAZANIE GOTOWE', relaiDone, PLAIN_HANDOFF_PROMPT
cache-keeper/hooks/checkpoint.test.ts  # 21 testów karty (w tym „Zapisz” → prompt przekazania)
adapters/claude-code/skills/relai-core/  # SKILL.md (tabela plików doczytywanych), session-close.md, done-check.md, …
adapters/claude-code/commands/relai-stage.md  # Krok 5 bez zdania o odhaczaniu (Aneks A)
adapters/claude-code/hooks/session-context.js # hook startu sesji (306 linii)
adapters/codex/generate-skills.js    # komendy Claude Code → skille Codeksa; verify() = rozjazd blokuje wydanie
adapters/cursor/rules/relai-core.mdc # reguła Cursora
core/templates/SPEC_KOMENDY.md, SPEC_PROMPT_ETAPU.md  # specyfikacje; SPEC_WZNOWIENIE.md jeszcze nie istnieje
docs/KOMENDY.md                      # frazy: „kończymy na dziś”, „kontynuujemy pracę”; „zapisz pracę” jeszcze nie
```

**Czego jeszcze nie ma (zakres E3):** procedury `limit-checkpoint.md` i jej wiersza w `SKILL.md`;
frazy „zapisz pracę” w `KOMENDY.md` / `SPEC_KOMENDY.md`; szablonu `SPEC_WZNOWIENIE.md` i pliku
wznowienia; zdania hooka startu o istniejącym pliku wznowienia; w cache-keeperze: „Zapisz” jako
fraza zapisu, łapanie `ZAPIS GOTOWY`, faz `czeka` / `przerwany` z drugim wierszem paska; zdania
o odhaczaniu (Aneks A) w `relai-stage.md` i `SPEC_PROMPT_ETAPU.md`; kopii dla Codeksa i Cursora.

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
   zostawić starą wersję i każdy wniosek z niej jest fałszywy (L-0159). **Kontrola „przed” idzie
   w dwóch przebiegach** — stary kod w całości i stary kod z podłożoną tylko nową czystą logiką;
   „plik testów się nie wczytał” nie dowodzi żadnego testu z osobna (L-0165).
   (L-0017, L-0018, L-0040, L-0051, L-0052, L-0063, L-0069, L-0082, L-0115, L-0117, L-0123, L-0134,
   L-0144, L-0150, L-0154, L-0155, L-0156, L-0158, L-0159, L-0165)
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
   pliki nieśledzone i daje drzewo mieszane (L-0151). **Skrypt usuwający zakres linii sprawdza
   cały blok, nie jego brzegi**, a po każdym cięciu idzie kompilator (L-0160). **Skrypt wklejający
   blok do dokumentu dowodzi wyniku licznikiem nagłówków** — każda sekcja dokładnie raz — i
   porównaniem wklejonego bloku ze źródłem; „marker zniknął” nie znaczy, że treść powstała raz
   (L-0164). (L-0032, L-0037, L-0095, L-0096, L-0105, L-0106, L-0107, L-0110, L-0111, L-0113,
   L-0097, L-0101, L-0102,
   L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086, L-0087, L-0088,
   L-0090, L-0091, L-0124, L-0125, L-0130, L-0131, L-0135, L-0141, L-0143, L-0151, L-0160, L-0164)
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
    **Wydanie zestawia zmiany artefaktów od poprzedniego tagu z rejestrem `ARTEFAKTY.md`
    i `git ls-files` pakietu z listą plików generowanych** — luka etapu wychodzi wtedy przy
    wydaniu, nie po nim (L-0161).
    (L-0004, L-0008, L-0020, L-0061, L-0085, L-0118, L-0161)
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
    przed każdym takim krokiem (L-0153). **Funkcja moda czekająca na człowieka (`$.ui.ask`)
    zapamiętuje identyfikator sesji przed pytaniem i porzuca odpowiedź, gdy po powrocie jest inny**;
    zegar i próg czyta ponownie po każdym takim `await` (L-0166).
    (L-0041, L-0042, L-0044, L-0047, L-0092, L-0133, L-0136, L-0138, L-0139, L-0146, L-0153, L-0166)
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

**Katalog roboczy tego etapu: `.claude/relai/work/LIMIT_CHECKPOINT/E3/`.** Wszystko tymczasowe —
skrypty pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam. Artefakt,
który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego repozytorium),
wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

1. **`adapters/claude-code/skills/relai-core/limit-checkpoint.md`** (nowy) — procedura „zapisz
   pracę” w kolejności z „Decyzji”: (a) done-check (testy projektu, przegląd diffu); (b) kod
   do stanu „testy przechodzą” albo wycofanie rozgrzebanego fragmentu z notatką; (c) commit
   lokalny — bez pytania, gdy prompt niesie znacznik zgody z karty, z pytaniem w każdym innym
   wypadku; (d) STATE, wpis dziennika, STATUS planu; (e) plik wznowienia; (f) linia
   `ZAPIS GOTOWY` na końcu odpowiedzi. Plus wiersz w tabeli plików doczytywanych `SKILL.md`.
2. **`core/templates/SPEC_WZNOWIENIE.md`** (nowy) — plik wznowienia: co było robione, co zrobione,
   lista „co dalej”, komenda pierwszego kroku, pliki w toku, hash HEAD, data; realny przykład na
   końcu (zasada 1). Rejestr `docs/ARTEFAKTY.md` — nowa pozycja.
3. **`docs/KOMENDY.md`** i **`core/templates/SPEC_KOMENDY.md`** — fraza „zapisz pracę” / „save my
   work” w wersji, która realnie działa (zasada 2).
4. **`adapters/claude-code/hooks/session-context.js`** — jedno zdanie na starcie, gdy plik
   wznowienia projektu istnieje (nazwa pliku i data); test na brak i obecność pliku.
5. **`cache-keeper/hooks/`** — „Zapisz” wysyła frazę zapisu ze znacznikiem zgody na commit (RelAI)
   albo wariant ogólny (poza RelAI); `turn.complete` łapie `ZAPIS GOTOWY` → faza `czeka`, brak
   znacznika → `przerwany`; drugi wiersz paska „zapis gotowy · reset HH:MM” / „zapis niepełny”;
   faza w snapshocie (przeżywa przeładowanie). Testy w `checkpoint.test.ts` (albo nowym pliku),
   każdy nowy test pada na kodzie E2 — kontrola w dwóch przebiegach (zasada 4, L-0165).
6. **Aneks A** — `adapters/claude-code/commands/relai-stage.md`, Krok 5 pkt 2: zdanie o odhaczaniu
   pól Weryfikacji zaraz po sprawdzeniu; `core/templates/SPEC_PROMPT_ETAPU.md`, element 8: to samo.
7. **Codex i Cursor** — `node adapters/codex/generate-skills.js` (i jego `verify`) dla komendy;
   `limit-checkpoint.md` w skillu Codeksa — **najpierw sprawdź, czy skill `relai-core` Codeksa jest
   generowany czy utrzymywany ręcznie** (zasada 4, L-0154); wiersz w `adapters/cursor/rules/relai-core.mdc`.
8. **Ślady:** wpis w dzienniku; STATUS; ryzyka L2, L5, L6 w tabeli — stan po E3; **bez wydania
   i bez podbicia wersji** — to E4.

## Weryfikacja — wszystkie punkty muszą przejść

Odhaczasz każde pole zaraz po sprawdzeniu (Aneks A) — punkt, który nie przeszedł, zostaje pusty.

- [ ] `claude plugin test cache-keeper` binarką 2.1.295: wszystkie zielone; liczba ≥ 128 + 6 nowych
      (SZACUNEK); kontrola „przed” w dwóch przebiegach (kod E2 w całości; kod E2 z nową czystą
      logiką) i „po” we wpisie.
- [ ] `node --test` rdzenia (komenda ze „Stanu wyjściowego”) zielony; liczba przed i po we wpisie;
      nowy test hooka startu pada bez zmiany w `session-context.js`.
- [ ] Kolejność procedury dowiedziona na treści `limit-checkpoint.md`: commit przed dokumentami,
      plik wznowienia przed znacznikiem (grep numerów kroków); znacznik `ZAPIS GOTOWY` w procedurze
      i w `handoff.ts`/stałej moda — ten sam ciąg (grep stałego ciągu w obu).
- [ ] Mod: odpowiedź ze znacznikiem → faza `czeka` i wiersz „zapis gotowy · reset HH:MM”; bez
      znacznika → `przerwany` i „zapis niepełny”; poza RelAI → wariant ogólny (testy).
- [ ] Dowód negatywny: `keepWarmStep`, strażnik `prompt.submit` i warunek karty E2 (`cardDue`,
      `isWorkGoing`) bez zmian — `git diff` bez hunków w tych funkcjach; testy E2 zielone.
- [ ] Na żywo (Łukasz, desktop 2.1.295, kopia plików do zainstalowanej 0.5.0 i przeładowanie):
      `/cache limit-warn 1` → karta → „Zapisz pracę teraz” → procedura w czacie → commit lokalny,
      plik `.claude/relai/wznowienie/relai.md`, pasek „zapis gotowy · reset …”; zrzut paska do
      `docs/zasoby/PANEL_RELAI/zrzuty/`; na końcu `/cache limit-warn 90`. Commit pomiarowy
      opisany we wpisie (zostaje albo cofnięty — decyzja Łukasza).
- [ ] Aneks A: zdanie o odhaczaniu w `relai-stage.md`, `SPEC_PROMPT_ETAPU.md` i kopii Codeksa
      (grep stałego ciągu w trzech plikach); pola tego promptu odhaczone na bieżąco.
- [ ] `node core/tools/validate-adapters.js` exit 0; `node adapters/codex/generate-skills.js` z
      weryfikacją bez rozjazdu; `node core/tools/sync-panel-core.js --check` zgodny;
      `claude plugin validate cache-keeper` exit 0.
- [ ] Podstawy bezpieczeństwa na zmianie etapu: slug pliku wznowienia z nazwy katalogu walidowany
      `[A-Za-z0-9_-]` (test na `../`); treść odpowiedzi modelu nie trafia do ścieżki; `grep -nE
      "sk-|api_key"` (zwykły `grep`, nie `git grep` — nowe pliki) w zmienionych plikach nic nie
      zwraca; `cache-keeper/package.json` nie istnieje — sprawdź `ls`; nadal brak → audyt
      zależności nie dotyczy, zapisz to we wpisie.
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy”, podpis `Autor: RelAI (Opus 5.5) + Lukasz`.
- [ ] Katalog roboczy `.claude/relai/work/LIMIT_CHECKPOINT/E3/`: **(a)** przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”, liczby przed i po we
      wpisie; **(b)** artefakty spoza katalogu wypisane z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez tego rytuału etap nie jest ukończony)

1. **`docs/plany/LIMIT_CHECKPOINT/STATUS.md`** — E3 → `ZREALIZOWANY 2026-MM-DD`; E4 →
   `GOTOWY DO STARTU` z linkiem do `PROMPT_ETAP_4.md`; linia w dzienniku wdrożenia.
1a. **Katalog roboczy** `.claude/relai/work/LIMIT_CHECKPOINT/E3/` — raport, „tak”, kasowanie;
   liczby przed i po do wpisu.
2. **`docs/DZIENNIK.md`** — wpis wg `SPEC_DZIENNIK.md` (Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka); tabela ryzyk (L2, L5, L6); lekcje z etapu →
   `docs/LEKCJE.md` + „Zasady aktywne”.
3. **Bramki manualne** w `STATUS.md` z sekcji „Do zrobienia przez człowieka” wpisu; bramka „aneks
   dla panelu Codeksa” — zapytaj Łukasza teraz (termin „po E3”).
4. **`docs/STATE.md`** (pozycja LIMIT_CHECKPOINT: E3 zamknięty, E4 gotowy), `CLAUDE.md` (tabela
   „Stan prac”, linia „Aktywny plan”), `docs/ARTEFAKTY.md` (nowe artefakty).
5. **Wygeneruj `PROMPT_ETAP_4.md`** wg `.claude/relai/templates/SPEC_PROMPT_ETAPU.md` — z sekcji 5
   (akapit „Wznowienie”), 6 (wiersz E4), 7 (L5, L7) i 8 („Plik wznowienia istnieje…”, „/clear po
   zapisie”) planu, z realnego stanu repo po E3 i lekcji z E3. Po wklejeniu zasad aktywnych policz
   każdy nagłówek sekcji (dokładnie raz) i porównaj wklejony blok z rejestrem (L-0164).
6. **Commit** — propozycja, conventional (EN), bez wydania.
