# PROMPT_ETAP_1 — Klatka wzorcowa i 10 sekund filmu: trzy paski RelAI w Remotion

Plan: FILM_PREZENTACYJNY • Etap: **E1 z E6** • Wygenerowano: 2026-10-12 (autor: Opus 5.5, przy akceptacji planu) • Wykonawca: **Opus 5.5 w Claude Code** (ustawienia projektu, D-85), `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `high` (etap rozstrzyga smak całego filmu, a ruch kamery i typografia wymagają wielu iteracji
> z oceną własnych klatek).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, linia „Aktywny plan”, sekcja niemutowalna |
| `docs/STATE.md` | stan produktu dziś: wersje pluginów, co działa w panelu |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk” + dwa ostatnie wpisy (plan FILM_PREZENTACYJNY i jego akceptacja) |
| `docs/plany/FILM_PREZENTACYJNY/PLAN.html` | sekcje 2 (cele), 4 (wariant A), 5 (scenariusz — scena 2 „Trzy paski”), 6 (E1), 7 (ryzyka 1 i 6), 8 (przypadki b1, b2, b7, b9) |
| `docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md` | sekcje 1–5: siatka etykieta / treść / liczba, pasek spokojny i mówiący, bateria — tak ma wyglądać to, co odtwarzasz |
| `docs/fixy/AUDYT_MODOW/zrzuty/2026-10-11-z1-trzy-paski-0.12.0.png` | prawdziwe trzy paski z desktopu — wzorzec układu i źródło wartości paska cache |
| `core/panel/theme.mjs`, `core/panel/plan-state.mjs`, `core/panel/progress.mjs` | kolory (`THEME`, `BAND`, `BAR`), stan planu z `CLAUDE.md` i `STATUS.md`, postęp etapu z checkboxów promptu — film liczy tym samym kodem |
| `docs/zasoby/design-konkurs/runda-3/blend.html` | wzorzec kierunku „Warsztat”: paleta, pismo odręczne, kartki, zaokrąglenia |
| `docs/zasoby/fonts/LICENCJE.md` | fonty, które wolno osadzić, i ich licencje |
| `docs/USTAWIENIA.md` | wiersze „Kierunek designu” i „Fonty w plikach HTML” |

## Decyzje już podjęte — nie otwierasz ich ponownie

- **Remotion, interfejs odtworzony z prawdziwych danych** — nie nagrania ekranu, nie własny
  renderer (plan, sekcja 4; wywiad z Łukaszem 2026-10-12).
- **Licencja:** Remotion Free License — Łukasz działa jako osoba prywatna / firma ≤ 3 osób
  (odpowiedź z 2026-10-12; warunki z remotion.dev/docs/license/faq odczytane tego dnia).
- **Kierunek „Warsztat z wigorem”** (wybór Łukasza 2026-10-12, kontynuacja D-61a): szeryfowy
  Fraunces i odręczne Kalam / Caveat jako notatki na marginesie, treść w Hanken Grotesk, lekkie
  szkło (nieprzytłaczające), zaokrąglenia zamiast ostrych rogów, przepływy rysujące się na żywo.
  Zero fioletu i poświaty (D-61a). Cztery kierunki odrzucone na stałe — nie proponujesz ich ani jako
  wariantu, ani jako inspiracji: **terminal / monospace-konsola, panel administracyjny, rysunek
  techniczny / blueprint, plakat brutalistyczno-szwajcarski**.
- **Gust Łukasza (kalibracje 2026-08 i 2026-10):** pokaż **jeden** wariant do oceny, zanim
  wyprodukujesz serię; animacja wyraźna, ale służebna — bez dekoracji w pętli; w paskach gramatyka
  minimalna (etykieta przygaszona · wartość pogrubiona); element graficzny stoi przy swoim
  napisie; bateria jak w telefonie pokazuje, **ile zostało**, i czerwienieje, gdy mało; z kilku
  stylów zwykle wybiera najprostszy i najczytelniejszy, a pyta o „efekt wow”. Sama lista zakazów
  nie wystarczy — na starcie kalibracji zbierasz cechy pozytywne (nastrój, skojarzenie, co ma
  przyciągać).
- **Film bez dźwięku, napisy PL** w tym etapie; EN dopiero w E5 (słownik), nie teraz.
- **Źródła filmu** w `docs/zasoby/film/zrodla/`, wersje pakietów przypięte dokładnie (bez `^`),
  lockfile w gicie, `node_modules/` i `out/` poza gitem. Zależność dotyczy wyłącznie narzędzia
  filmu — nie pluginu.
- **`core/panel/*.mjs` tylko do odczytu.** Import bez kopii; gdy bundler Remotion go nie przyjmie —
  kopia skryptem z kontrolą bajtową przy każdym renderze (przypadek b1 planu), nigdy ręcznie.
- **Wartości paska cache** (minuty, limit 5 h, reset, tydzień, kontekst, koszt sesji) nie leżą
  w repozytorium — bierzesz je ze zrzutu `2026-10-11-z1-trzy-paski-0.12.0.png` i zapisujesz
  w pliku danych sceny razem ze źródłem (przypadek b2). Paski plan i postęp liczysz z bieżącego
  repozytorium przez `core/panel`.
- Fonty wyłącznie z plików lokalnych w `docs/zasoby/fonts/`; zero żądań sieciowych w renderze.
- **Granica zakresu:** E1 to **wyłącznie scena 2 (trzy paski)** — klatka wzorcowa i 10 s ruchu.
  Scenariusz całości, manifest faktów z testem i animatik to E2; sceny 1 i 3–6 to E3–E4; wersja EN,
  pętla GIF, kontrola czytelności na telefonie i README to E5; numery wersji i wydanie to E6.
  Niczego z nich nie zaczynasz.

## Stan wyjściowy (co realnie zastajesz)

RelAI 2.9.0 w repo i publicznie; pluginy panelu relai-panel 0.14.0, relai-progress 0.4.0,
relai-cache-keeper 0.6.0 (FAKT). Od tagu `v2.9.0` doszły odnogi NOWA_SESJA i AUDYT_SKILLI, bez
wydania. Plan FILM_PREZENTACYJNY zaakceptowany 2026-10-12 i jest aktywnym planem; PANEL_CODEX
(Codex, `gpt-6.1-sol`) trwa obok i jego pliki — `docs/plany/PANEL_CODEX/`,
`docs/zasoby/PANEL_RELAI/makiety/` — mogą być niezacommitowane: **nie dotykasz ich i nie dodajesz
do commita**. Node 24.13.1 (FAKT); `ffmpeg` nie ma w PATH — Remotion przynosi własny. Testy rdzenia:
`node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js core/panel/tests/*.test.js adapters/codex/tests/*.test.js`
— 331/331 (FAKT, 2026-10-12). Binarka Claude Code do `plugin validate`: aplikacji 2.1.295
(`claude` na PATH to starsza wersja, P-024).

```
core/panel/theme.mjs                 # THEME, BAND, BAR, NAMES, GROUPS — kolory i nazwy panelu
core/panel/plan-state.mjs            # parseActivePlan(CLAUDE.md), parseStatus(STATUS.md), planState()
core/panel/progress.mjs              # checklist(), stageProgress() — postęp z checkboxów promptu
docs/zasoby/fonts/                   # Fraunces, Caveat, Kalam 400/700, Hanken Grotesk, Instrument Sans, JetBrains Mono (latin + latin-ext)
docs/zasoby/branding/                # logo.svg, banner.svg, ikony/ (14 ikon komend)
docs/zasoby/demo/                    # dawne demo 2.1.3 (GIF 25 s, MP4 60 s) i jego źródła — w E1 nietknięte
docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md   # styl pasków v3.6
docs/fixy/AUDYT_MODOW/zrzuty/        # zrzuty pasków i panelu 0.12–0.13 z desktopu
docs/plany/FILM_PREZENTACYJNY/       # PLAN.html, STATUS.md, ten prompt
```

**Czego jeszcze nie ma (to jest zakres tego etapu):** katalogu `docs/zasoby/film/`, projektu
Remotion, jakiejkolwiek sceny, pliku danych paska, pierwszego renderu i zapisanego kierunku
wizualnego filmu.

**Zasady aktywne z `docs/LEKCJE.md` (przepisane w całości, stan 2026-10-12):**

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
   (L-0164). **Operacja na zakresie dokumentu normalizuje tylko styk zakresu**, a test dowodzi, że
   fragment poza zakresem wyszedł nietknięty (L-0169). **Fixtura ewaluacji niesie środowisko,
   które czytają hooki** (tożsamość gita, pliki domowe) — inaczej siatka hooka odpowiada na
   maszynę mierzącego, nie na prompt (L-0170). (L-0032, L-0037, L-0095, L-0096, L-0105, L-0106, L-0107, L-0110, L-0111, L-0113,
   L-0097, L-0101, L-0102,
   L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086, L-0087, L-0088,
   L-0090, L-0091, L-0124, L-0125, L-0130, L-0131, L-0135, L-0141, L-0143, L-0151, L-0160, L-0164,
   L-0169, L-0170)
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
   (L-0167). (L-0034, L-0049, L-0053, L-0060, L-0065, L-0099, L-0104, L-0167)
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
    miejsc, ile ma źródło (L-0157).
    (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094, L-0098, L-0137, L-0140, L-0142, L-0145, L-0147,
    L-0149, L-0152, L-0157)

**Wyprowadzone 2026-08-20 do `docs/PULAPKI.md`:** sześć pozycji, które były pułapkami
narzędziowymi, a nie zasadami pracy — `tar` na `PATH` (L-0021), sesja pomiarowa `claude -p`
(L-0024), PowerShell 5.1 i UTF-8 (L-0027), `--allowedTools` przy `acceptEdits` (L-0028),
restart aplikacji po `plugin update` (L-0031), `git worktree` zamiast `git archive | tar`
(L-0039). Obowiązują dalej — czytasz je z rejestru pułapek, na żądanie.

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/FILM_PREZENTACYJNY/E1/`.** Wszystko tymczasowe —
rendery próbne, klatki do oceny, wyjścia narzędzi, skrypty pomiarowe — powstaje tam. Artefakt,
który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy — w tym przeglądarka do
renderu pobrana przez Remotion), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz
od slugu projektu, gdy ją wybierasz.

1. **Zgoda na instalację — przed jakimkolwiek `npm install`.** Wypisz Łukaszowi pakiety
   (`remotion`, `@remotion/cli`, `react`, `react-dom` i to, czego naprawdę potrzebujesz), dokładne
   wersje, rozmiar pobrania sprawdzony `npm view` (FAKT) i przeglądarkę do renderu, którą Remotion
   pobierze (nazwa, miejsce na dysku, rozmiar). Instalacja dopiero po „tak”; odmowa zatrzymuje etap
   ze wpisem w dzienniku.
2. **`docs/zasoby/film/zrodla/`** — projekt Remotion: `package.json` (wersje przypięte), lockfile,
   `tsconfig.json`, `remotion.config.ts`, `src/index.ts`, `src/Root.tsx` z kompozycją `Paski`
   1920×1080, 30 kl./s, 300 klatek; `.gitignore` z `node_modules/` i `out/`.
3. **Dane paska** — skrypt `docs/zasoby/film/zrodla/skrypty/dane.mjs` uruchamiany przed renderem:
   paski plan i postęp liczy z bieżących `CLAUDE.md`, `STATUS.md` i promptu etapu przez
   `core/panel/plan-state.mjs` i `progress.mjs`; wartości paska cache przepisuje ze zrzutu z1 ze
   źródłem; zapisuje `src/dane/paski.json`, w którym **każda wartość ma pole źródła**.
4. **`src/sceny/Paski.tsx`** (z komponentami obok) — trzy paski jak w prawdziwym panelu (kolory
   z `core/panel/theme.mjs`, siatka i gramatyka ze stylu pasków), na tle w kierunku „Warsztat”:
   wejście pasków, przejazd kamery z dociągnięciem na baterię cache, odręczna adnotacja
   rysująca się kreską („ile zostało”), lekkie szkło pod paskami. Bez błysków częstszych niż
   3/s (przypadek b7). Tokeny palety „Warsztat” w jednym pliku `src/tokeny.ts`, nie w scenie.
5. **Fonty** ładowane z `docs/zasoby/fonts/` (kopia skryptem do `public/` albo import pliku) —
   zero adresów `http(s)` w `src/`.
6. **Render:** klatka wzorcowa PNG 1920×1080 (still) i `paski-10s.mp4` (1920×1080, 30 kl./s, 10 s)
   do katalogu roboczego etapu. Przed pokazaniem Łukaszowi **obejrzyj własne klatki** (początek,
   środek ruchu, dociągnięcie, koniec) i popraw to, co sam widzisz: przepełnienie, nachodzenie,
   nieczytelny kontrast.
7. **Kalibracja z Łukaszem:** pokaż klatkę i ścieżkę do MP4, zapytaj o cechy pozytywne i o to, co
   zmienić; do trzech rund poprawek. Każda runda: co pokazane, co powiedział, co zmienione.
8. **Zapis kierunku:** zaakceptowana klatka jako `docs/zasoby/film/kalibracja/E1-klatka.png`
   (MP4 nie trafia do gita); wiersz „Kierunek filmu” w `docs/USTAWIENIA.md` z dzisiejszą datą
   i opisem tego, co Łukasz przyjął.
9. **`docs/zasoby/film/README.md`** — po co ten katalog, jak wyrenderować klatkę i 10 s (komendy),
   skąd dane (pole źródła), licencja Remotion z datą odczytu, odesłanie do planu.

Elementy zamykające etap, które łatwo pominąć: wiersz w `docs/USTAWIENIA.md` (punkt 8), sprawdzenie,
że `claude plugin validate .` dalej przechodzi z nowym katalogiem w repo, audyt zależności.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_1.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] Zgoda Łukasza na instalację padła w czacie **przed** `npm install`; lista pakietów, wersji
      i rozmiarów (FAKT z `npm view`) oraz przeglądarka do renderu — w sekcji „Zweryfikowane” wpisu.
- [x] `package.json` w `docs/zasoby/film/zrodla/` nie ma ani jednej wersji z `^` ani `~`; lockfile
      jest w gicie; `git check-ignore` potwierdza, że `node_modules/` i `out/` są poza gitem.
- [x] Render daje MP4 1920×1080, 30 kl./s, 10,0 s — odczytane `npx remotion ffprobe` (albo
      równoważnie z metadanych pliku), nie z komunikatu renderu; still PNG ma 1920×1080.
- [x] Wartości pasków plan i postęp w `src/dane/paski.json` są równe wynikowi `core/panel` na
      bieżącym repo (test node porównuje oba); **kontrola pozytywna:** ten sam test na kopii
      `STATUS.md` z podmienionym statusem etapu daje inną wartość i test ją wykrywa.
- [x] Każda wartość paska cache w `paski.json` ma źródło (`2026-10-11-z1-trzy-paski-0.12.0.png`)
      i jest równa wartości widocznej na tym zrzucie.
- [x] Kolory sceny pochodzą z `core/panel/theme.mjs` albo z `src/tokeny.ts`: `grep` literałów
      `#[0-9a-fA-F]{3,8}` w `src/sceny/` zwraca zero trafień.
- [x] Zero adresów sieciowych w źródłach filmu: `grep -rnE "https?://" docs/zasoby/film/zrodla/src`
      — pusto (kontrola pozytywna wzorca: plik z adresem podłożony w katalogu roboczym trafia).
- [x] Prywatność kadru: teksty sceny i `paski.json` bez ścieżki domowej, e-maila i identyfikatora
      sesji — `grep -E` po trzech wzorcach (katalog `Users`, adres z `@` i domeną, UUID) pusto;
      wzorzec w pliku zapisanym narzędziem Write i sprawdzony kontrolą pozytywną (L-0116).
- [x] Obejrzane własne klatki (co najmniej cztery chwile ruchu) przed pokazaniem Łukaszowi;
      poprawki z tego przeglądu wymienione we wpisie.
- [x] Łukasz zaakceptował kierunek (jego słowa we wpisie) **albo** po trzech rundach kierunek nie
      jest przyjęty — wtedy etap zostaje `W TOKU`, a wpis mówi, co zostało do rozstrzygnięcia.
- [x] `docs/zasoby/film/kalibracja/E1-klatka.png` to klatka zaakceptowana; wiersz „Kierunek filmu”
      w `docs/USTAWIENIA.md` z datą 2026-10-12 lub późniejszą.
- [x] `npm audit --omit=dev` w `docs/zasoby/film/zrodla/` — zero podatności wysokich i krytycznych
      (liczby do wpisu; zastane w narzędziach budowy idą do tabeli ryzyk z oceną, czy dotykają renderu).
- [x] Testy rdzenia 331/331 (komenda ze „Stanu wyjściowego”); `node core/tools/validate-adapters.js`
      spójne; `claude plugin validate .` binarką aplikacji — exit 0 z nowym katalogiem w repo.
- [x] Pliki PANEL_CODEX (`docs/plany/PANEL_CODEX/`, `docs/zasoby/PANEL_RELAI/makiety/`) nietknięte:
      `git diff --stat` na nich identyczny z tym sprzed etapu i poza commitem etapu.
- [x] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy”, z podpisem `Autor: RelAI (Opus 5.5) + Lukasz`.
- [x] Katalog roboczy `.claude/relai/work/FILM_PREZENTACYJNY/E1/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po
      w sekcji „Zweryfikowane” wpisu. Artefakty poza nim (przeglądarka do renderu Remotion w katalogu
      domowym, pliki `%TEMP%` renderu) wypisane z nazwy, z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/FILM_PREZENTACYJNY/STATUS.md`: E1 → ZREALIZOWANY (data), E2 → GOTOWY DO STARTU,
   link do `PROMPT_ETAP_2.md` w kolumnie `Prompt` (po punkcie 5), linia w dzienniku wdrożenia.
1a. Katalog roboczy etapu — raport, „tak”, liczby przed i po do wpisu z punktu 2.
2. `docs/DZIENNIK.md`: wpis wg `SPEC_DZIENNIK` (Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”. Przejrzyj tabelę
   ryzyk; lekcje z etapu do `docs/LEKCJE.md` i odśwież „Zasady aktywne” (limit 15,
   `node .claude/relai/tools/count-rules.js`).
3. Bramki manualne w `STATUS.md` z sekcji „Do zrobienia przez człowieka” tego wpisu (np. zrzuty
   panelu 0.14 przed E3).
4. `docs/STATE.md` — stan planu filmu; `docs/ARTEFAKTY.md` tylko wtedy, gdy etap zmienił artefakt
   z rejestru.
5. **Wygeneruj `PROMPT_ETAP_2.md`** w tym folderze, ze specyfikacji promptu etapowego
   (`.claude/relai/templates/SPEC_PROMPT_ETAPU.md`): na bazie `PLAN.html` sekcje 5 (scenariusz
   sześciu scen) i 6 (E2 — scenariusz, manifest faktów z testem, animatik), realnego stanu po tym
   etapie (projekt Remotion, kierunek zapisany w `USTAWIENIA.md`) i lekcji z tego etapu.
6. Commit (conventional, EN) i push — propozycja; wyłącznie za zgodą Łukasza, bez plików PANEL_CODEX.
