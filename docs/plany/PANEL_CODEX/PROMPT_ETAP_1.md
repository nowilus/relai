# PROMPT_ETAP_1 — Przejęcie rdzenia i natywny panel przy czacie Codeksa

Plan: PANEL_CODEX • Etap: **E1 z E8** • Wygenerowano: 2026-10-10 (autor: gpt-6.1-sol, przy akceptacji planu w sesji startowej) • Wykonawca: **gpt-6.1-sol w Codeksie**, `effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na **gpt-6.1-sol w Codeksie** (wyjątek D-84/D-85 dla PANEL_CODEX, 2026-10-08); inny model lub narzędzie → zatrzymaj się przed zapisem i poproś o przełączenie. Model jest spoza listy `.claude/relai/MODELE-codex.md` z `2026-09-05`, co nie blokuje pracy na modelu wybranym przez człowieka; nie wymyślaj jego klasy z nieaktualnej listy. Zalecany wysiłek: `high`, bo trzeba potwierdzić rzeczywiste możliwości gospodarza i kontrakt dwóch konsumentów rdzenia.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `AGENTS.md`, potem `CLAUDE.md` | router procesu Codeksa, źródło reguł projektu, sekcja niemutowalna i granica świeżej sesji |
| `docs/STATE.md`, `docs/USTAWIENIA.md` | aktualny stan 2.8.0, aktywny plan i preferencje; nie pytaj o zapisane wybory |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk” (C1/C10/C11 dotyczą poprzednika) i ostatni wpis PANEL_CODEX o przejęciu i akceptacji |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne”; pełna kopia poniżej |
| `docs/plany/PANEL_CODEX/PLAN.html` | sekcje 2, 4–9: cele, wybrany wariant, istniejący kontrakt, zakres i dowody E1, ryzyka oraz bramki |
| `docs/plany/PANEL_CODEX/STATUS.md`, `PRZEJECIE.md` w tym folderze | ZAAKCEPTOWANY, E1 GOTOWY DO STARTU, dowody przejęcia; nie uruchamiaj kolejnych etapów |
| `docs/DECYZJE.md` | tylko D-80 z aneksem 2026-10-10 oraz wyjątek D-84/D-85 PANEL_CODEX; nie otwieraj rozstrzygnięć ponownie |
| `docs/archiwum/plany/PANEL_CLAUDE/STATUS.md` | zamknięty poprzednik, 9/9 etapów, Aneksy A–E, pominięty pomiar E5 i rozstrzygnięte bramki |
| `docs/zasoby/PANEL_RELAI/WYWIAD.md`, `core/panel/theme.mjs` | uzgodnione działania człowieka i istniejący motyw RelAI; E1 nie projektuje nowego stylu |
| `core/panel/measure.mjs`, `pricing.mjs`, `cache-timer.mjs`, `plan-state.mjs`, `decisions.mjs` | wszystkie ścieżki pod `core/panel/`: schemat pomiarów, semantyka input, cennik Anthropic, profil Claude i odczyt stanu; adapter ma je przejąć |
| `core/tools/sync-panel-core.js`, `adapters/codex/AGENTS.md`, `.agents/plugins/marketplace.json` | jedno źródło kopii i istniejąca dystrybucja; nie importuj hooków Mods |
| `docs/PULAPKI.md` | P-008 i P-019–P-023: native PowerShell/Node, fizyczna binarka Claude i granice silnika Mods, których Codeks nie dziedziczy |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan **ZAAKCEPTOWANY 2026-10-10**. Człowiek osobno zaakceptował aneks D-80 dla GUI i lokalnych pomiarów adaptera Codeksa; pozostałe wykluczenia bez zmian (D-80 → aneks 2026-10-10, dziennik sesji startowej).
- Autor i wykonawca wszystkich etapów: **gpt-6.1-sol w Codeksie**, świeże sesje (wyjątek D-84/D-85, 2026-10-08). Sesja startowa nie uruchomiła E1 (decyzja człowieka 2026-10-10).
- Wybrany wariant **A**: pakiet gospodarza w `adapters/codex/panel/`, lokalny MCP App/server i wspólny `core/panel/`. B, C i D odrzucone (PLAN, sekcja 4); brak funkcji gospodarza wraca jako dowód i pytanie o aneks, bez cichej zmiany workflow.
- PANEL_CLAUDE jest zamknięty i zarchiwizowany: jego plan oraz logika gospodarza w `panel/`, `progress/`, `cache-keeper/` pozostają poza zakresem przebudowy (PLAN, nie-cele). Czysty rdzeń ma jednego właściciela; konieczne rozszerzenie przechodzi testy obu konsumentów i synchronizację kopii narzędziem, nigdy ręczną edycję kopii.
- Rekord `SCHEMA = 1` i pole `tool` już istnieją. Jego `input` nie obejmuje cache. Mapowanie źródła OpenAI ustalasz na realnym materiale; cache nie wolno policzyć drugi raz, reasoning zawarty w output nie jest dodatkowym wyjściem (PLAN, sekcje 5–6).
- Każda zmiana stanu wymaga właściwej karty/potwierdzenia. E1 daje odczyt statusu i dowód mostka; nowy czat/projekt kontrolny wyłącznie jako jawna próba zgodnie z wybraną ścieżką. Nie używaj `/clear` w roboczej rozmowie (PLAN, sekcje 5 i 8; L-0153).
- Motyw: istniejący „Warsztat”, `core/panel/theme.mjs` i tokeny planów; typografia Kalam/Hanken i ikony z `docs/zasoby/branding/ikony/`. Pierwszy natywny widok pokazujesz do kalibracji przed domknięciem E1 (Zasady aktywne, pkt 15).
- **Granica E1:** przejęcie i opis kontraktu, minimalny natywny panel, powiązanie projektu, przycisk statusu oraz dowód bieżącego/świeżego czatu. Kolektor i implementacja normalizacji to **E2**, ceny OpenAI i profil cache **E3**, strażnik `--zgoda-panelu` i formularze **E4**, załoga/mapa **E5**, reszta komend/dokumenty **E6**, alerty **E7**, marketplace/wydanie **E8**. Publikacja wymaga osobnej zgody; niczego nie wydawaj w E1.

## Stan wyjściowy — co realnie zastajesz

**FAKT 2026-10-10:** RelAI 2.8.0 publicznie (Latest, tag `v2.8.0`, wydanie 2026-10-09), zamknięty PANEL_CLAUDE i zaakceptowany PANEL_CODEX. Sesja startowa zmieniła wyłącznie dokumenty, nie kod. Punkt przejęcia HEAD: `6b502fea5135541bd50ef564a96b6a4898f1b6c5`, tag: `32851152598eebe0e15d0f831fb7642a7d03f0cb`; po dokumentach może istnieć nowszy commit — sprawdź `git status` przed pracą i zachowaj zastane edycje.

- `core/panel/` — **15 modułów ESM i 15 plików testów (FAKT)**: agents, attribution, cache-timer, charts, commands, decisions, documents, flow, headings, measure, phrases, plan-state, pricing, progress, theme; czyste rachunki i odczyt procesu, bez API gospodarza.
- `core/panel/measure.mjs` — `SCHEMA = 1`, **17 pól (FAKT)**: `v, tool, session, turn, index, agent, kind, model, at, input, cacheRead, cacheWrite, output, missing, stage, task`; klucz session/turn/index/agent; fabryki dziś ustawiają `tool = claude-code`. Rekord bez treści rozmowy.
- `.claude/relai/pomiary/<data>-<sesja>.jsonl` — lokalne metryki poza gitem, plik na sesję; stage/task przypisują koszt do etapu/zadania, każdy rekord w jednej pozycji. Nie kasuj historii jako odtwarzalnego cache.
- `core/panel/pricing.mjs` — datowane stawki **tylko Anthropic**, cache-write według profilu Claude; `.claude/relai/panel/cennik.json` przechowuje wersje, rekord liczony stawką obowiązującą przy pomiarze. OpenAI nie jest obsługiwane.
- `core/panel/cache-timer.mjs` — założenia Claude o 5/60 min (FAKT), nie profil sesji Codeksa; nieznany TTL pozostaje prognozą.
- `core/panel/attribution.mjs`, `flow.mjs`, `documents.mjs` — przypisanie kosztów, plany/etapy/odnogi/załoga i podgląd dokumentów; scalenia są widokiem, diff używa zamkniętego argv git dla pliku z listy. Limity renderu Claude nie stanowią dowodu limitu Codeksa.
- `core/tools/sync-panel-core.js` — kopiuje rdzeń i ikony do trzech pluginów Claude; `--check` exit 0 (FAKT). Adapter panelu Codeksa nie jest jeszcze celem kopii.
- `.agents/plugins/marketplace.json` — tylko `relai` 2.8.0; `.claude-plugin/marketplace.json` — relai plus relai-panel 0.9.0, relai-progress 0.2.0, relai-cache-keeper 0.3.0 (FAKT). Walidator 5a porównuje własne wersje paneli tylko w marketplace Claude.
- `adapters/codex/skills/relai-stage/SKILL.md` — wygenerowany z komendy Claude, przyjmuje `--zgoda-panelu <id>`; strażnika tego znacznika w Codeksie nie ma. Nie zmieniaj ręcznie generowanego skilla.
- Lokalny JSONL sesji Codeksa z 2026-10-10 zawiera `token_count.info.total_token_usage` i `last_token_usage`, pola `input_tokens`, `cached_input_tokens`, `cache_write_input_tokens`, `output_tokens`, `reasoning_output_tokens` (FAKT). To dowód kształtu jednego źródła, nie stabilności kontraktu ani kompletnego pokrycia subagentów; E1 dokumentuje pochodzenie i mapowanie, E2 wykonuje import.

**Punkt porównania testów (FAKT 2026-10-10):**

- `node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js adapters/codex/tests/*.test.js core/panel/tests/*.test.js` → **263/263**, exit 0, ponownie po uzgodnieniu dokumentów.
- `node core/tools/validate-adapters.js` → exit 0; `node core/tools/sync-panel-core.js --check` → exit 0.
- `claude plugin test .` z każdego folderu `panel/`, `progress/`, `cache-keeper/` → **70/70, 16/16, 19/19**, exit 0 na binarce Claude Code **2.1.293** z `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1`. CLI w PATH było 2.1.280; binarkę desktopową wybierz według P-019 z fizycznego folderu MSIX, nie zakładaj wersji ani hash w nowej sesji.

**Czego jeszcze nie ma:** `adapters/codex/panel/`, natywnego widoku RelAI/MCP App i jego mostka. Nie potwierdzono własnym pluginem powiązania z bieżącym czatem, wywołania statusu, utworzenia świeżego czatu ani wersji SDK/czasu życia procesu. To bramka E1, nie fakt wynikający z dokumentacji. Kolektor Codeksa, ceny OpenAI, profil cache, strażnik zgody i wpis panelu w marketplace także nie istnieją, lecz należą do późniejszych etapów.

### Zasady aktywne — dosłowny odpis z LEKCJE.md

<!-- relai:active-rules:start -->
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
   pliki nieśledzone i daje drzewo mieszane (L-0151). **Skrypt usuwający zakres linii sprawdza
   cały blok, nie jego brzegi**, a po każdym cięciu idzie kompilator (L-0160). (L-0032, L-0037, L-0095, L-0096, L-0105, L-0106, L-0107, L-0110, L-0111, L-0113,
   L-0097, L-0101, L-0102,
   L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086, L-0087, L-0088,
   L-0090, L-0091, L-0124, L-0125, L-0130, L-0131, L-0135, L-0141, L-0143, L-0151, L-0160)
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
<!-- relai:active-rules:end -->

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/PANEL_CODEX/E1/`.** Wszystko tymczasowe — skrypty pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam. Artefakt, który z natury musi leżeć poza projektem (`%TEMP%`, katalog domowy, klon cudzego repozytorium), wpisz do dziennika z nazwy i zacznij nazwę od slugu `relai-`.

1. `docs/plany/PANEL_CODEX/STATUS.md` i dokumenty stanu — przy bezpośrednim wykonaniu tego pliku uruchom E1 przez procedurę `relai-stage` z kartą i potwierdzeniem człowieka, ustaw W TOKU i wpis startu; akceptacja planu w poprzedniej sesji nie poświadcza wykonania etapu. Jeśli procedura już uzyskała zgodę i rozpoczęła E1, kontynuuj bez ponownego wywołania skilla i bez drugiego pytania o ten sam start.
2. `PRZEJECIE.md` oraz dokumentacja kontraktu w nowym `adapters/codex/panel/README.md` — potwierdź wynik przejęcia, opisz źródła Codeksa, mapowanie do SCHEMA=1, tożsamość wywołań/uczestników, brakujące pola i granice pokrycia. Rozdziel kumulacyjne snapshoty od nowych wywołań. Dokumentuj normalizację OpenAI bez doliczenia cache i reasoning; bez implementacji kolektora E2. Ewentualny konflikt rzeczywistego źródła z kontraktem wraca jako dowód, nie ukryta zmiana.
3. `adapters/codex/panel/` — najpierw sonda gospodarza z lokalnym MCP App/server i widokiem przy czacie. Wersję SDK i format manifestu ustal z rzeczywistego gospodarza oraz aktualnych źródeł pierwotnych, przypnij zależności i lockfile. W README zapisz minimalny sprawdzony runtime GUI, build i drogę instalacji/cofnięcia lokalnej sondy; nie podnoś globalnego wymogu runtime tekstowego RelAI bez rozstrzygnięcia.
4. `adapters/codex/panel/` — po udanej sondzie minimalny panel: widoczny projekt/korzeń, aktywny plan i status z `core/panel/plan-state.mjs`, odczyt przyciskiem „sprawdź status”. Zależności i build izolowane od rdzenia tekstowego. Wspólne moduły pakowane przez kopię/bundle z kontrolą zgodności źródła; nie importuj register.tsx, `$`, `on` ani hooków Mods. Pierwszy natywny widok pokazujesz do kalibracji człowiekowi w motywie RelAI, zanim domkniesz etap.
5. `adapters/codex/panel/README.md` i dowody w katalogu E1 — zmierz właściwy projekt i bieżący czat, faktyczną wysyłkę statusu oraz próbę świeżego czatu w projekcie kontrolnym. Nowy app-server nie jest automatycznie mostkiem do już otwartej rozmowy. Ustal czas życia lokalnego procesu i zakres dostępu. Brak wymaganej funkcji zatrzymuje implementację na dowodzie i pytaniu o aneks; nie zastępuj świeżego czatu forkiem, `/clear` ani stroną zewnętrzną bez decyzji.
6. Testy adaptera w jego własnym pakiecie oraz testy repo — sprawdź montaż, powiązanie, odczyt stanu, puste/brakujące dokumenty, odmowę obcego korzenia i poprawny wynik mostka. Konieczna zmiana rdzenia: minimalna, kompatybilna, testy obu konsumentów; bez zmian logiki gospodarza Claude. Wydanie i wpis marketplace dopiero E8.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] Model gpt-6.1-sol w Codeksie potwierdzony; E1 uruchomiony właściwą procedurą, zakres i model z karty zapisane; plan ZAAKCEPTOWANY 2026-10-10 i aneks D-80 istnieją.
- [ ] PRZEJECIE i README pakietu mają faktyczny kontrakt: 17 pól SCHEMA=1 (FAKT punktu przejęcia), tool, tożsamości i źródła liczników, mapowanie OpenAI, ceny/przypisanie oraz jawne braki; nie przepisano planowanego stanu jako faktu.
- [ ] Pakiet w adapters/codex/panel/ ma manifest zgodny z walidacją gospodarza, przypięty SDK/lockfile, odtwarzalny build i sprawdzony runtime; czyste moduły zgodne ze źródłem, bez importów hooków Mods.
- [ ] W rzeczywistym Codeksie widać własny natywny panel, właściwy projekt i stan planu; „sprawdź status” trafia do wskazanego bieżącego czatu. Dowód: polecenie/kliknięcie, wynik i odwołanie do sesji kontrolnej w dzienniku, bez samego „UI działa”.
- [ ] Próba świeżego czatu ma dowód w rzeczywistym gospodarzu, z właściwym projektem i osobnym kontekstem; brak wsparcia = bramka wymagająca decyzji o aneksie, nie zaliczenie kopiowaniem ani `/clear`.
- [ ] Granice mostka i czas życia lokalnego procesu opisane na podstawie sondy; brak pokrycia lub uprawnień nazwany. Nie twierdź, że kolektor/alerty E2/E7 już działają.
- [ ] Widok skalibrowany z człowiekiem; motyw zgodny z theme; render w Chromium przy szerokości rzeczywistego panelu i w najgorszym stanie danych nie przepełnia kontenera. Instrument geometrii ma kontrolę pozytywną na podłożonym defekcie.
- [ ] Testy adaptera i build kończą się exit 0; `node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js adapters/codex/tests/*.test.js core/panel/tests/*.test.js` bez regresji, liczba z ostatniego przebiegu do dziennika; punkt porównania 263/263 (FAKT).
- [ ] `node core/tools/validate-adapters.js` i `node core/tools/sync-panel-core.js --check` — exit 0. Każda zmiana core/panel: dodatkowo `claude plugin test .` w panel/, progress/, cache-keeper/ na buildzie Mods według P-019; punkt porównania 70/16/19 (FAKT). W E1 bez zmiany core: git diff dowodzi niezmienionych plików rdzenia i pluginów Claude.
- [ ] Audyt zależności własnego pakietu: `npm audit --omit=dev` (albo odpowiadający przypiętemu menedżerowi) — zero nowych wysokich/krytycznych podatności. Niedostępny audyt ma zapisany powód i warunek wykonalności, zastane podatności wpisane jako ryzyko.
- [ ] Podstawy bezpieczeństwa z dowodami: walidacja wejścia/kanonicznych korzeni, uprawnienia po stronie serwera, sekrety wyłącznie w środowisku, brak sekretów w metrykach/UI i diffie; zamknięte argv bez sklejania polecenia. Jeśli pakiet nie ma bazy, punkt o parametryzacji zapytań oznaczony jako niedotyczący z dowodem braku takiej ścieżki.
- [ ] Przegląd git diff: zmiany mapują się wyłącznie na E1; brak kolektora, stawek OpenAI, timera Codeksa, strażnika zgody, reszty formularzy i publikacji. Brak zmiany zamrożonych sekcji planu oraz logiki gospodarza Claude dowiedziony diffem.
- [ ] STATUS, wpis w DZIENNIKU z realnymi wynikami, STATE/CLAUDE/AGENTS i świeży prompt E2 istnieją zgodnie z rytuałem poniżej; brak linków do plików nieistniejących.
- [ ] Katalog `.claude/relai/work/PANEL_CODEX/E1/` przejrzany raportem `node .claude/relai/tools/clean-work.js raport` i skasowany po „tak”, liczby przed/po w dzienniku; artefakty poza katalogiem wymienione z nazwy i wynikiem sprzątania albo decyzją pozostawienia. Przy blokadzie technicznej materiał dowodowy pozostaje do decyzji, etap nie dostaje ZREALIZOWANY.

## Na koniec (bez tego rytuału etap nie jest ukończony)

1. `STATUS.md`: E1 → ZREALIZOWANY z datą, E2 → GOTOWY DO STARTU; linię „E1 rozpoczęty” zastąp krótkim wynikiem. Jeśli bramka mostka nie przeszła, nie zamykaj E1 i nie ustawiaj E2 jako gotowego; zapisz realny stan i potrzebną decyzję.
2. `docs/DZIENNIK.md`: na końcu „Wpisów” Zrobione / Zweryfikowane — komendy i wyniki / Świadomie odłożone / Do zrobienia przez człowieka, podpis `Autor: RelAI (gpt-6.1-sol) + Lukasz`; lekcje i ryzyka aktualizuj z faktów.
3. `docs/STATE.md`, `CLAUDE.md` i `AGENTS.md`: synchronizacja stanu w tej samej turze; CLAUDE pozostaje źródłem prawdy. README pakietu z realną instalacją, uruchomieniem i ograniczeniami; użytkownikowi pokaż wynik testów i przeglądu diffu.
4. Wygeneruj **PROMPT_ETAP_2.md** wg `.claude/relai/templates/SPEC_PROMPT_ETAPU.md`: materiałem są sekcje 5–8 PLAN opisujące E2, rzeczywisty mostek/kontrakt/pakiet po E1 oraz lekcje E1; pełna kopia aktywnych zasad i katalog `.claude/relai/work/PANEL_CODEX/E2/`. Link w STATUS dopiero po powstaniu pliku, bez generacji kolejnych promptów.
5. Przejrzyj i po zgodzie usuń artefakty robocze; zaproponuj conventional commit po angielsku, wykonaj po zgodzie człowieka. Bez pushu ani publikacji. Na końcu podaj start E2 w świeżej sesji Codeksa na gpt-6.1-sol, `effort high`, przez skill relai-stage albo zdanie „uruchom etap E2 planu PANEL_CODEX”.
