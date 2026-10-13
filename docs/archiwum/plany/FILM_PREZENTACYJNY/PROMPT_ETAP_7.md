# PROMPT_ETAP_7 — Wydanie RelAI 3.0.0 z filmem prezentacyjnym

Plan: FILM_PREZENTACYJNY • Etap: **E7 z E7** • Wygenerowano: 2026-10-13 (autor: Opus 5.5, w rytuale „Na koniec” E6) • Wykonawca: **Opus 5.5 w Claude Code** (ustawienia projektu, D-85), `/effort medium`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `medium` (etap powtarza procedurę wydania 2.9.0 i renderuje gotowy film; decyzje smaku są
> zamknięte, decyzje publikacji należą do Łukasza).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, linia „Aktywny plan”, sekcja niemutowalna |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk” (C1 — „early access”) + wpis „FILM_PREZENTACYJNY E6” z 2026-10-13 (stan filmu, Aneks E, „Do zrobienia przez człowieka”) + wpis „wydanie RelAI 2.9.0” z 2026-10-11 (procedura krok po kroku, linia „Checks:” notatek) |
| `docs/plany/FILM_PREZENTACYJNY/STATUS.md` | bramki manualne — dwie `OTWARTA` (start E7, odnoga parsera modelu przed wydaniem) |
| `docs/plany/FILM_PREZENTACYJNY/PLAN.html` | sekcje 2 (cel 5), 6 (dawny E6 — po Aneksie A to ten etap), 8 (przypadek „MP4 za duży do gita”), 9 (numery pluginów panelu w 3.0.0, zgoda na publikację), 10 (Aneks C — kredyt muzyki; Aneks E — MP4 EN jako dodatek) |
| `adapters/claude-code/skills/relai-core/history.md` | akapit „Zmiany po 2.9.0, do wydania 3.0.0” na górze — materiał historii zmian |
| `docs/ARTEFAKTY.md` | rejestr artefaktów — zestawienie ze zmianami od tagu `v2.9.0` (L-0161) |
| `core/tools/validate-adapters.js` (linie ok. 288–364) | siedem źródeł wersji, które walidator porównuje |
| `docs/zasoby/film/README.md` i `docs/zasoby/film/muzyka/ZRODLO.md` | komendy renderu, tekst kredytu muzyki słowo w słowo |
| `docs/PULAPKI.md` | P-005, P-019, P-024, P-025, P-036 — binarka aplikacji, restart po `plugin update`, CRLF w porównaniu cache |
| `README.md` | baner wersji (linia 6), sekcja „Zobacz, jak to działa”, sekcja „Panel w Claude Code (early access)” |

## Decyzje już podjęte — nie otwierasz ich ponownie

- **Jedno wydanie 3.0.0** zbiera wszystko od `v2.9.0`: mody i panel Claude Code, start etapu
  w nowej sesji (NOWA_SESJA), audyt skilli (AUDYT_SKILLI), `/relai-stage` v6 i film (decyzja
  Łukasza 2026-10-12, `docs/STATE.md`). Od tagu `v2.9.0` jest 16 commitów + commit E6 (FAKT,
  2026-10-13).
- **Procedura wydania 2.9.0 jest wzorem** (plan, sekcja 5): siedem źródeł wersji, walidator,
  testy rdzenia i pluginów, `plugin validate`, `grep -r` po starych numerach z rozstrzygnięciem
  każdego trafienia, zestawienie `ARTEFAKTY.md`, skan sekretów, tagi adnotowane, wydania GitHub
  z notatkami po angielsku, po publikacji `marketplace update` + `plugin update` + porównanie cache
  po CRLF → LF.
- **Film:** PL przyjęty (E5, runda 3), EN i obie pętle przyjęte (E6, runda 2: „Przyjmuję”);
  kadrów nie przerysowujesz. **Aneks E:** MP4 PL to film główny, MP4 EN idzie do wydania jako
  **dodatek**; `README.md` osadza tylko pętlę PL. Koszty sceny „Panel” zostają ze zrzutów
  2026-10-12 (decyzja Łukasza, E6: „Zostaje”).
- **MP4 do gita nie wchodzi** (plan, sekcja 8): oba pliki idą jako zasoby wydania `v3.0.0`,
  a README linkuje do nich dopiero wtedy, gdy wydanie istnieje (bez martwego linku — zasada 14).
- **Kredyt muzyki** (Aneks C, CC BY 4.0) idzie do opisu wydania słowo w słowo z `ZRODLO.md`:
  „🎵(free) lofi type beat "daylight hour" by snoozy beats”.
- **Ostatni render ze świeżym manifestem** (plan, ryzyko 3): film PL i EN renderowane w tym etapie,
  po podbiciu numerów — finał pokazuje wersję i liczby z dnia wydania; pętla PL i EN też.
- **Bramka przed wydaniem:** odnoga z poprawką parsera `requiredModel()` (cztery identyczne kopie:
  `core/panel/decisions.mjs`, `panel/hooks/core/decisions.mjs`, `progress/hooks/core/decisions.mjs`,
  `cache-keeper/hooks/relai/decisions.mjs`) — decyzja Łukasza z E3: „przed wydaniem 3.0.0”. Karta
  odnogi **nie istnieje** (FAKT, 2026-10-13). Ten etap jej **nie wykonuje** — patrz punkt 1 zakresu.
- **Publikacja** (push, tagi, wydania GitHub) wyłącznie po wyraźnej zgodzie Łukasza w tej sesji
  (plan, sekcja 9). Bez niej etap kończy się lokalnym commitem.
- **`core/panel/*.mjs`, `panel/hooks/*`, `progress/hooks/*`, `cache-keeper/hooks/*`** — w tym
  etapie tylko numery wersji i opisy; logika należy do odnogi parsera.
- **Granica zakresu:** to ostatni etap planu. Wersja pionowa 9:16, klipy, wysyłka filmu ludziom,
  pełna wersja angielska interfejsu — poza planem (sekcja 2 „Czego nie robimy”, Aneks E). Panel
  Codeksa to plan PANEL_CODEX — jego plików nie dotykasz i nie dodajesz do commita.

## Stan wyjściowy (co realnie zastajesz po E6)

RelAI 2.9.0 w repo i publicznie (tag `v2.9.0`, wydanie „Latest”); pluginy panelu relai-panel
0.14.0 (wydanie `relai-panel-v0.14.0`), relai-progress 0.4.0, relai-cache-keeper 0.6.0 jako
„early access” (FAKT). E6 zamknięty 2026-10-13: film PL i EN po 5070 klatek / 169 s z muzyką
(`docs/zasoby/film/zrodla/out/film.mp4` z 2026-10-12, `film-en.mp4` z 2026-10-13, poza gitem —
do ponownego renderu), pętle `docs/zasoby/film/relai-petla-25s-{pl,en}.gif` (2,55 / 2,58 MB,
w gicie), dawne demo w `docs/archiwum/demo/`. Node 24.13.1; Python z PIL i numpy (bez `-I`).
Binarka do `plugin test` / `plugin validate`: aplikacji 2.1.295 pod
`%APPDATA%\Claude\claude-code\2.1.295\<hash>\claude.exe`, szukana `find` (P-024). PANEL_CODEX
(Codex) trwa obok — jego pliki bywają niezacommitowane.

Komendy (FAKT, 2026-10-13):

- rdzeń: `node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js core/panel/tests/*.test.js adapters/codex/tests/*.test.js` → 331/331;
- `node core/tools/validate-adapters.js` → exit 0 (raport „numery wersji: 7 zrodel”);
  `node adapters/codex/generate-skills.js --verify`, `node core/tools/sync-panel-core.js --check`;
- pluginy: `claude plugin test .` binarką aplikacji z katalogu `panel/`, `progress/`,
  `cache-keeper/` (przy 2.9.0: 148 / 31 / 174; po NOWA_SESJA panel 177 — FAKT z dziennika;
  liczby do wpisu bierzesz z dzisiejszego przebiegu);
- skan sekretów: `node core/guardrails/secret-scan.js <plik...>` na plikach diffu
  `origin/main..HEAD`;
- film: `cd docs/zasoby/film/zrodla && npm run film` (PL) i `npm run film:en` (EN), oba robią
  `przygotuj`; pętla `node skrypty/petla.mjs pl|en` po `npm run przygotuj`; testy filmu
  `npm run przygotuj && npm test` → 36/36; kontrole wg `docs/zasoby/film/README.md`.

```
.claude-plugin/plugin.json, .codex-plugin/plugin.json, core/MANIFEST.json   # "version": "2.9.0"
.claude-plugin/marketplace.json   # relai 2.9.0 + panel 0.14.0, progress 0.4.0, cache-keeper 0.6.0; opisy „Early access — …”
.agents/plugins/marketplace.json  # Codex, jeden wpis relai 2.9.0
README.md                         # baner <em>Wersja 2.9.0; „Zobacz, jak to działa” z pętlą PL; „Panel w Claude Code (early access)”
docs/STATE.md                     # pierwsza wersja w „Gdzie jesteśmy”; liczby testów pluginów 148/31/174 (nieaktualne)
panel|progress|cache-keeper/.claude-plugin/plugin.json   # 0.14.0 / 0.4.0 / 0.6.0
adapters/claude-code/skills/relai-core/history.md (+ kopia Codeksa)   # akapit „Zmiany po 2.9.0, do wydania 3.0.0”
docs/ARTEFAKTY.md                 # rejestr wersji artefaktów
docs/zasoby/film/                 # README, pętle, kalibracja, muzyka/ZRODLO.md, zrodla/ (Remotion)
```

Inne miejsca, które wydanie 2.9.0 podbijało (FAKT, `grep -l 2.9.0`): `adapters/claude-code/commands/relai-update.md`,
`adapters/codex/skills/relai-update/SKILL.md`, `relai-core/{history,new-project,session-close,document-rotation}.md`
(i kopie Codeksa z `generate-skills.js`), `adapters/cursor/README.md`, `docs/USTAWIENIA.md`,
`docs/KOMENDY.md`, `core/templates/SPEC_USTAWIENIA.md`, `core/templates/SPEC_KOMENDY.md`,
`core/tools/count-rules.js`, `core/tools/rotate.js`, `core/evals/fixtures/relai/docs/USTAWIENIA.md`.

**Czego jeszcze nie ma (to jest zakres tego etapu):** rozstrzygnięcia bramki odnogi parsera;
decyzji Łukasza o numerach i statusie „early access” pluginów panelu; numeru 3.0.0 w źródłach
wersji; historii zmian 3.0.0; renderu filmów i pętli ze świeżym manifestem; tagu `v3.0.0`
i wydania GitHub z dwoma MP4 i kredytem muzyki; linku do filmu w `README.md`.

**Zasady aktywne z `docs/LEKCJE.md` (przepisane w całości, stan 2026-10-13):**

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
   „plik testów się nie wczytał” nie dowodzi żadnego testu z osobna (L-0165). **Element animowany
   z danych procesu sprawdzasz na stanie pośrednim z lukami**, nie tylko na stanie z chwili pisania
   — punkty odhacza się w kolejności pracy, nie numeracji (L-0175). **Chwilę z przeszłości liczysz
   kodem produktu z plików przypiętych do jej commitu** (`git show`), nie z danych żywych, które
   do dnia wydania pokażą inny stan (L-0177). **Artefakt, na którym stawiasz punkt weryfikacji,
   renderujesz od nowa z bieżącego kodu** — wszystkie warianty w jednym przebiegu; plik zastany po
   przerwanej sesji bywa sprzed ostatniej zmiany (L-0182).
   (L-0017, L-0018, L-0040, L-0051, L-0052, L-0063, L-0069, L-0082, L-0115, L-0117, L-0123, L-0134,
   L-0144, L-0150, L-0154, L-0155, L-0156, L-0158, L-0159, L-0165, L-0175, L-0177, L-0182)
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
   (L-0164). **Operacja na zakresie dokumentu normalizuje tylko styk zakresu**, a test dowodzi, że
   fragment poza zakresem wyszedł nietknięty (L-0169). **Fixtura ewaluacji niesie środowisko,
   które czytają hooki** (tożsamość gita, pliki domowe) — inaczej siatka hooka odpowiada na
   maszynę mierzącego, nie na prompt (L-0170). **Wartość podkładaną w kontroli pozytywnej
   sprawdzasz wobec zbioru dozwolonego, zanim na niej oprzesz kontrolę**, a tekst cytowany
   dosłownie wyłączasz z tego zbioru jawnie (L-0173). **Kontrola negatywna zmienia mierzoną
   wielkość, nie jej obraz** — materiał zmniejszony i powiększony z powrotem ma te same wysokości;
   wynik kontroli porównujesz z liczbą, którą defekt musi dać, na dwóch klatkach różnej treści
   (L-0181). (L-0032, L-0037, L-0095, L-0096, L-0105, L-0106, L-0107, L-0110, L-0111, L-0113,
   L-0097, L-0101, L-0102,
   L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086, L-0087, L-0088,
   L-0090, L-0091, L-0124, L-0125, L-0130, L-0131, L-0135, L-0141, L-0143, L-0151, L-0160, L-0164,
   L-0169, L-0170, L-0173, L-0181)
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
   a nie usuwasz. **Próg wspólny dla kilku wielkości sprawdzasz na każdej z osobna** — 90 % okna
   5 h i 90 % tygodnia to różne sytuacje; pomiar z progiem testowym mówi, które gałęzie uruchomi
   (L-0167). **Karta zgody na zależność podaje wielkość na dysku**, nie pobrania. Składnik
   niezmierzony ma mnożnik rozpakowania, a rozjazd po instalacji idzie do człowieka od razu
   (L-0172). (L-0034, L-0049, L-0053, L-0060, L-0065, L-0099, L-0104, L-0167, L-0172)
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
    zegar i próg czyta ponownie po każdym takim `await` (L-0166). **Test wielu rozmów ustawia
    odpowiedzi atrap per rozmowa**, a wydruk diagnostyczny zbiera stan po sprawdzanym kroku (L-0168).
    (L-0041, L-0042, L-0044, L-0047, L-0092, L-0133, L-0136, L-0138, L-0139, L-0146, L-0153, L-0166,
    L-0168)
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
    miejsc, ile ma źródło (L-0157). **W nośniku z kamerą element trwały nie niesie po ruchu
    transformacji 3D ani filtra warstwowego**: kamera powiększa wtedy bitmapę, nie tekst. Przegląd
    klatek obejmuje klatkę największego zbliżenia (L-0171). **Przejście między ekranami tej samej
    siatki idzie przez wspólne tło, nie przez nałożenie**, a liczby w kadrze piszesz krojem
    rozróżniającym „1” i „I” (L-0174). **Adnotacja przy liczbie mówi wartość wyliczoną**, nie
    pytanie, na które liczba odpowiada (L-0176). **Decyzja „tego nie pokazujemy” dotyczy treści,
    nie elementu** — jej brzmienia szukasz we wszystkich tekstach kadru, także w cytatach
    wyłączonych z testu faktów (L-0178). **Materiał, którego nie umiesz odebrać zmysłem (dźwięk),
    bierzesz z gotowych źródeł i dajesz człowiekowi próbki do wyboru przed integracją** — liczby
    mówią o poziomie, nie o smaku (L-0179). **Licencję cudzego materiału czytasz na stronie
    utworu** i mówisz jej skutki dla wydania (NC, SA, kredyt); plik wchodzi z kartą źródła i testem
    sumy i kredytu (L-0180). **Drugi język materiału o produkcie w jednym języku zaczyna się od
    jednej klatki z interfejsem i pytania, dla kogo jest** — reguła tłumaczenia jest drugim
    pytaniem (L-0183).
    (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094, L-0098, L-0137, L-0140, L-0142, L-0145, L-0147,
    L-0149, L-0152, L-0157, L-0171, L-0174, L-0176, L-0178, L-0179, L-0180, L-0183)

**Wyprowadzone 2026-08-20 do `docs/PULAPKI.md`:** sześć pozycji, które były pułapkami
narzędziowymi, a nie zasadami pracy — `tar` na `PATH` (L-0021), sesja pomiarowa `claude -p`
(L-0024), PowerShell 5.1 i UTF-8 (L-0027), `--allowedTools` przy `acceptEdits` (L-0028),
restart aplikacji po `plugin update` (L-0031), `git worktree` zamiast `git archive | tar`
(L-0039). Obowiązują dalej — czytasz je z rejestru pułapek, na żądanie.

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/FILM_PREZENTACYJNY/E7/`.** Wszystko tymczasowe —
klatki kontrolne, listy plików do skanu, szkice notatek wydania, wyjścia narzędzi — powstaje tam.
Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy), wpisujesz do
wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu, gdy ją wybierasz.

1. **Na start — bramka odnogi parsera** (`STATUS.md`, bramka `OTWARTA`). Sprawdź, czy odnoga
   istnieje i jest `ZAMKNIĘTA` (`docs/plany/FILM_PREZENTACYJNY/odnogi/` albo `docs/fixy/`).
   Nie jest → **zatrzymaj się przed jakąkolwiek zmianą numerów** i zadaj jedno pytanie
   (AskUserQuestion): założyć odnogę teraz (`/relai-branch`, wykonanie w osobnej świeżej sesji,
   E7 wraca po jej zamknięciu — Rekomendowane, bo karta startu etapu pokazuje dziś „⚠ plan nie
   wskazuje modelu” na planach bez etykiety) / wydać 3.0.0 bez poprawki z wpisem w notatkach i
   przeniesieniem bramki do następnego wydania. Odpowiedź do wpisu; bramka w `STATUS.md`
   rozstrzygnięta z jego słowami.
2. **Decyzje człowieka z planu, sekcja 9** — w **jednym** wywołaniu AskUserQuestion (razem
   z pytaniem z punktu 1, jeśli pada): numery pluginów panelu w 3.0.0 i czy zdejmujemy „early
   access” (opisy w `.claude-plugin/marketplace.json`, `README.md`, `docs/KOMENDY.md`, ryzyko C1);
   zgoda na publikację (push, tagi, wydania GitHub) — pytasz teraz, wykonujesz na końcu.
3. **Numery wersji** — `3.0.0` w siedmiu źródłach (walidator) i we wszystkich miejscach z listy
   „Inne miejsca” (każde plikiem, nie z pamięci: `grep -rl "2\.9\.0"` zwykłym `grep -r`, nie
   `git grep` — zasada 10); pluginy panelu wg decyzji z punktu 2 (`plugin.json` + wpis
   marketplace). Kopie Codeksa przez `node adapters/codex/generate-skills.js`, kopie rdzenia panelu
   przez `node core/tools/sync-panel-core.js`.
4. **Historia zmian** — `adapters/claude-code/skills/relai-core/history.md` (i kopia Codeksa):
   akapit „Zmiany po 2.9.0, do wydania 3.0.0” staje się wpisem „Wersja 3.0.0 (…)” w układzie
   poprzednich; obejmuje NOWA_SESJA, AUDYT_SKILLI, film i pętlę w README. `docs/ARTEFAKTY.md` —
   każdy artefakt zmieniony od `v2.9.0` (`git diff --stat v2.9.0..HEAD` na plikach z rejestru) ma
   wpis z wersją (L-0161).
5. **Render ze świeżym manifestem** — po punktach 3–4: `npm run film`, `npm run film:en`,
   `node skrypty/petla.mjs pl` i `en` (po `npm run przygotuj`). Finał pokazuje `RelAI 3.0.0`
   i liczby z manifestu tego dnia. Testy filmu i cztery kontrole (przepełnienia, telefon,
   fakty, prywatność) na nowych plikach, PL i EN.
6. **Testy i kontrole wydania** — rdzeń, `validate-adapters.js`, `generate-skills.js --verify`,
   `sync-panel-core.js --check`, `plugin test` trzech pluginów, `plugin validate` repo i trzech
   pluginów (binarka aplikacji), `grep -r` po `2.9.0` i starych numerach pluginów — każde trafienie
   rozstrzygnięte (historyczne / do podbicia), skan sekretów na diffie `origin/main..HEAD`.
7. **Dokumenty** — `README.md`: baner 3.0.0; w sekcji „Zobacz, jak to działa” link do filmu PL
   (zasób wydania `v3.0.0`) i zdanie o wersji EN jako dodatku — **dopiero po utworzeniu wydania**,
   wcześniej zdanie bez linku; `docs/STATE.md` (wersja, liczby testów pluginów z dzisiejszego
   przebiegu); `docs/zasoby/film/README.md` (stan na E7, nazwy plików w wydaniu).
8. **Notatki wydania** (po angielsku, jak 2.9.0): zdanie wstępne, lista zmian, linia „Checks:”
   z dzisiejszymi wynikami, film PL jako główny i EN jako dodatek, kredyt muzyki słowo w słowo
   z `ZRODLO.md`, instrukcja aktualizacji (`claude plugin marketplace update relai`,
   `claude plugin update relai@relai`, restart aplikacji). Szkic w katalogu roboczym — do
   przejrzenia przez Łukasza przed publikacją.
9. **Publikacja — tylko po zgodzie z punktu 2, powtórzonej po pokazaniu szkicu notatek:** commit,
   push `main`, tag adnotowany `v3.0.0` (i tag pluginów panelu, gdy dostały numery), wydanie
   GitHub `RelAI 3.0.0` z `film.mp4` i `film-en.mp4` jako zasobami (nazwy plików w wydaniu
   rozstrzygasz i wpisujesz do README filmu), potem link w `README.md` i drugi commit. Po
   publikacji: `claude plugin marketplace update relai`, `plugin update`, porównanie cache pluginu
   z repo po CRLF → LF (P-005).
10. **Zamknięcie planu** — to ostatni etap: sekwencja D-36 z rytuału niżej.

Elementy zamykające etap, które łatwo pominąć: pakiety filmu bez zmian (`git diff` na
`package.json` i `package-lock.json`) — gdy coś dochodzi, najpierw zgoda z wielkością na dysku
(L-0172) i `npm audit --omit=dev`; skrypty edycji z `\n` albo ścieżką Windows wyłącznie narzędziem
Write (zasada 5); dłuższy wpis do dziennika też przez Write albo Edit.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_7.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] Bramka odnogi parsera rozstrzygnięta przed zmianą numerów: odnoga `ZAMKNIĘTA` albo decyzja
      Łukasza jego słowami we wpisie i w `STATUS.md`.
- [x] Decyzje z sekcji 9 planu (numery i „early access” pluginów panelu, zgoda na publikację)
      padły w jednym pytaniu; odpowiedzi we wpisie.
- [x] `node core/tools/validate-adapters.js` → exit 0 i raport „numery wersji: 7 zrodel, wartosc
      "3.0.0"”; `generate-skills.js --verify` i `sync-panel-core.js --check` zielone.
- [x] `grep -r "2\.9\.0"` (i stare numery pluginów, gdy się zmieniły) po repo poza `.git`,
      `node_modules` i `docs/archiwum/` — każde trafienie rozstrzygnięte we wpisie (historyczne /
      podbite); kontrola pozytywna: podłożony plik w katalogu roboczym trafiony.
- [x] `history.md` (obie kopie) ma wpis 3.0.0; `docs/ARTEFAKTY.md` — każdy artefakt z rejestru
      zmieniony od `v2.9.0` ma wpis (lista z `git diff --stat v2.9.0..HEAD` obok rejestru we wpisie).
- [x] Film PL i EN wyrenderowane po podbiciu: `ffprobe` z pliku — po 5070 klatek, 169 s ± 1
      klatka, audio obecne; ostatnia klatka obu pokazuje `RelAI 3.0.0` (obejrzana).
- [x] Pętle PL i EN wyrenderowane po podbiciu: 720×900, 25 000 ms, waga do wpisu wobec 3 MB
      (SZACUNEK); kontrola telefonu (tekst ≥ 7 px, linie poniżej progu obejrzane na wycinkach)
      i przepełnień (0, kontrola pozytywna trafiona) na nowych plikach.
- [x] `npm test` filmu po `npm run przygotuj` po ostatniej zmianie promptu — wszystkie (36 z E6
      + nowe, minus świadomie zmienione z powodem); `npm run typy` bez błędów.
- [x] Testy rdzenia — wszystkie zielone (331 z E6 + nowe, liczba do wpisu); `plugin test` trzech
      pluginów binarką aplikacji — liczby do wpisu; `plugin validate` repo i trzech pluginów —
      exit 0 (ostrzeżenie o root `CLAUDE.md` świadome).
- [x] Skan sekretów na plikach diffu `origin/main..HEAD` — zero trafień; kontrola pozytywna
      (próbka sekretu złożona w czasie wykonania w pliku katalogu roboczego) trafiona.
- [x] Szkic notatek wydania przejrzany przez Łukasza (jego słowa we wpisie); kredyt muzyki
      w notatkach równy `ZRODLO.md` (porównanie stałego ciągu).
- [x] Publikacja po zgodzie: `git ls-remote --tags origin v3.0.0` zwraca tag; `gh release view
      v3.0.0` pokazuje dwa zasoby MP4; `README.md` linkuje do istniejącego zasobu (adres sprawdzony
      `gh release view --json assets`) — **albo** brak zgody i etap kończy się lokalnym commitem,
      opisane we wpisie, bramka publikacji `OTWARTA` w `STATUS.md`.
- [x] Po publikacji: cache pluginu po `plugin update` równy repo po CRLF → LF (liczba plików
      i rozjazdów do wpisu) — **albo** zdanie, że publikacji nie było.
- [x] Pliki PANEL_CODEX (`docs/plany/PANEL_CODEX/`, `docs/zasoby/PANEL_RELAI/makiety/`) nietknięte:
      `git diff --stat`, `git status --short` i sha256 ich plików identyczne z zapisem sprzed
      etapu; żaden w commitach etapu.
- [x] Sekwencja zamknięcia planu (D-36) wykonana w całości: bramki i odnogi rozstrzygnięte, plan
      `ZREALIZOWANY`, folder w `docs/archiwum/plany/`, linia „Aktywny plan” w `CLAUDE.md`
      wskazuje istniejący plik albo brzmi `Aktywny plan: brak`.
- [x] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy”, z podpisem `Autor: RelAI (Opus 5.5) + Lukasz`.
- [x] Katalog roboczy `.claude/relai/work/FILM_PREZENTACYJNY/E7/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po
      w sekcji „Zweryfikowane” wpisu. Artefakty poza nim (pliki `%TEMP%` renderu, jeśli powstały)
      wypisane z nazwy, z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/FILM_PREZENTACYJNY/STATUS.md`: E7 → ZREALIZOWANY (data); linia zamknięcia E7
   w dzienniku wdrożenia (`SPEC_STATUS.md`); bramka „Start E7” → ROZSTRZYGNIĘTA.
1a. Katalog roboczy etapu — raport, „tak”, liczby przed i po do wpisu z punktu 2.
2. `docs/DZIENNIK.md`: wpis wg `SPEC_DZIENNIK` (Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”. Przejrzyj tabelę
   ryzyk (C1 „early access” wg decyzji z punktu 2 zakresu); lekcje z etapu do `docs/LEKCJE.md`
   i odśwież „Zasady aktywne” (limit 15, `node core/tools/count-rules.js docs/LEKCJE.md`).
3. Bramki manualne w `STATUS.md` z sekcji „Do zrobienia przez człowieka” tego wpisu.
4. `docs/STATE.md`, `docs/KOMENDY.md` (gdy zmienił się opis pluginów), linie planu w `CLAUDE.md`;
   `docs/ARTEFAKTY.md` zgodnie z punktem 4 zakresu.
5. **To ostatni etap planu — zamiast generacji następnego promptu uruchom sekwencję zamknięcia
   planu (D-36)** z pliku `plan-closing.md` skilla `relai-planning` (wczytaj skill narzędziem
   Skill): rozstrzygnięcie otwartych bramek manualnych → rozstrzygnięcie otwartych odnóg →
   `STATE.md` → wpis zamykający „dowiezione vs plan” → status planu `ZREALIZOWANY` → przegląd
   ryzyk → przeniesienie folderu planu do `docs/archiwum/plany/` → linia „Aktywny plan”
   w `CLAUDE.md` → podsumowanie.
6. Commit (conventional, EN) i push — wyłącznie za zgodą Łukasza, bez plików PANEL_CODEX.
