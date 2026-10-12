# PROMPT_ETAP_5 — Wersja EN, pętla 25 s do README i cztery kontrole jakości

Plan: FILM_PREZENTACYJNY • Etap: **E5 z E6** • Wygenerowano: 2026-10-12 (autor: Opus 5.5, w rytuale „Na koniec” E4) • Wykonawca: **Opus 5.5 w Claude Code** (ustawienia projektu, D-85), `/effort medium`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `medium` (sceny i kierunek są przyjęte; etap tłumaczy, przycina i mierzy — smak wraca tylko
> przy pętli i przy zestawieniu ze zrzutami).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, linia „Aktywny plan”, sekcja niemutowalna |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk” + wpis „FILM_PREZENTACYJNY E4” z 2026-10-12 (co powstało, decyzje Łukasza o scenach 4–5, „Świadomie odłożone”) |
| `docs/plany/FILM_PREZENTACYJNY/STATUS.md` | bramki manualne — dwie `OTWARTA` (start E5, odnoga parsera modelu przed E6) |
| `docs/plany/FILM_PREZENTACYJNY/PLAN.html` | sekcje 2 (cele 1, 2 i 4), 5 (zdanie o pętli pod tabelą scen, schemat „Cztery kontrole”), 6 (E5), 7 (ryzyka 2 i 4), 8 (przypadki „Tekst EN dłuższy niż PL”, „Dawne demo”, „MP4 za duży do gita”, „README w ciemnym i jasnym motywie”, „Muzyka nie dotrze przed E5”), 9 (muzyka — do rozstrzygnięcia przed E5) |
| `docs/zasoby/film/README.md` | komendy renderu (`npm run film`), skąd słowa i liczby każdej sceny, wierność panelu |
| `docs/zasoby/film/zrodla/src/teksty.ts`, `src/fakty.ts`, `src/scenariusz.ts` | słownik PL do przetłumaczenia (bez cyfr, znaczniki faktów), `wstaw()`, czasy scen |
| `docs/zasoby/film/zrodla/src/Root.tsx`, `src/sceny/Animatik.tsx` | kompozycje: jak sceny wchodzą do filmu i gdzie wpiąć język oraz pętlę |
| `docs/zasoby/film/zrodla/testy/fakty.test.mjs`, `testy/wiernosc.test.mjs` | testy, które mają objąć oba języki |
| `docs/zasoby/demo/README.md`, `docs/zasoby/demo/zrodla/glify.py`, `gif.py` | dawne demo do archiwum; instrument czytelności na telefonie i jego próg |
| `README.md` | sekcja „Zobacz, jak to działa” — tu wchodzi nowa pętla |
| `docs/USTAWIENIA.md` | wiersze „Kierunek filmu”, „Poziom animacji” |

## Decyzje już podjęte — nie otwierasz ich ponownie

- **Remotion, interfejs odtworzony z prawdziwych danych**; PL i EN z jednego źródła — **różni je
  tylko słownik** (plan, sekcja 4, wariant A). Słowa produktu w kadrze (karty, panel, przyciski
  z `sceny.json` i `panel.json`) zostają takie, jak rysuje je produkt — po polsku także w filmie EN;
  tłumaczysz wyłącznie słowa filmu (`teksty.ts`). Gdy to zdanie okaże się dla Łukasza problemem,
  to jest aneks do planu, nie poprawka w tym etapie.
- **Kierunek „Warsztat z wigorem”** (E1; wzorce `docs/zasoby/film/kalibracja/E1-klatka.png`,
  `E3-scena1.png`, `E3-scena3.png`, `E4-scena4.png`, `E4-scena5.png`, `E4-scena6.png`). Cztery
  kierunki odrzucone na stałe — terminal / monospace-konsola, panel administracyjny, blueprint,
  plakat brutalistyczno-szwajcarski — ani jako wariant, ani jako inspiracja (D-61a).
- **Sceny 1–6 i cały film PL przyjęte przez Łukasza** (E3 runda 2, E4 runda 1: „Przyjmuję sceny
  4–6 i cały film”). Kadrów scen nie przerysowujesz; zmiana kadru sceny wymaga pokazania klatki
  sprzed i po.
- **Scena 4:** wiersz Model w stanie zgodnym, linia metryczna z dopisaną etykietą w `sceny.mjs`
  (decyzja Łukasza, E4). Poprawka parsera `requiredModel()` to **odnoga przed E6**, nie ten etap.
- **Scena 5 bez liczb sesji** (decyzja Łukasza, E4): próg domyślny 90 %, wiersz zapisu z jedynego
  zrzutu prawdziwego zapisu. Liczb nie dokładasz.
- **Zasada filmu:** na ekranie nie ma liczby, której nie da się wskazać w repozytorium albo
  w zapisie prawdziwej sesji. Słownik EN — tak jak PL — nie ma ani jednej cyfry; liczba wchodzi
  znacznikiem przez `wstaw()`.
- **Pętla do README to skrót scen 2 i 3 w pionie 720×900**, bez napisów dłuższych niż jedna linia
  (plan, sekcja 5); próg czytelności: mediana wysokości glifów ≥ 7 px po przeskalowaniu do 375 px,
  instrument `docs/zasoby/demo/zrodla/glify.py` (plan, cel 2). Budżet GIF 3 MB to SZACUNEK
  z planu — parametry dobierasz pomiarem.
- **Przejścia:** przenikanie przez papier biurka albo odsłona, bez błysków częstszych niż 3/s.
- **`core/panel/*.mjs`, `panel/hooks/*`, `cache-keeper/hooks/*` tylko do odczytu.** Film importuje
  wyłącznie `core/panel` (przez `src/rdzen.ts`), `core/process/resume.js` i teksty plików
  pluginów czytane w skryptach danych. Fonty i znak wyłącznie z `docs/zasoby/`; zero adresów
  sieciowych w `src/`.
- **Dawne demo nie znika** (D-18): przenosisz je do `docs/archiwum/demo/` razem ze źródłami
  renderu i README z adnotacją (plan, sekcja 8).
- **Granica zakresu:** E5 to słownik EN, film EN, pętla PL i EN, cztery kontrole, zestawienie
  klatek ze zrzutami, archiwum dawnego demo i README. Numery wersji, historia zmian, ostatni
  render ze świeżym manifestem, skan sekretów, tag i wydanie GitHub z MP4 to **E6**. Odnoga
  parsera modelu — osobna sesja. Plik MP4 do gita nie wchodzi (plan: MP4 tylko w zasobach
  wydania).

## Stan wyjściowy (co realnie zastajesz po E4)

RelAI 2.9.0 w repo i publicznie; pluginy panelu relai-panel 0.14.0, relai-progress 0.4.0,
relai-cache-keeper 0.6.0 (FAKT). E4 zamknięty 2026-10-12: **cały film PL** — 3600 klatek,
120,000 s, 1920×1080, 30 kl./s (FAKT z `ffprobe`), przyjęty w pierwszej rundzie. Zależności
w `docs/zasoby/film/zrodla/node_modules/` (poza gitem), bez nowych pakietów w E2–E4. Python
z PIL i numpy jest na maszynie (FAKT, sprawdzone 2026-10-12) — `glify.py` da się uruchomić.
PANEL_CODEX (Codex, `gpt-6.1-sol`) trwa obok — jego pliki (`docs/plany/PANEL_CODEX/`,
`docs/zasoby/PANEL_RELAI/makiety/`) mogą być niezacommitowane: **nie dotykasz ich i nie dodajesz
do commita**. Node 24.13.1 (FAKT).

Komendy (FAKT, 2026-10-12):

- testy rdzenia
  `node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js core/panel/tests/*.test.js adapters/codex/tests/*.test.js`
  → 331/331;
- testy filmu `cd docs/zasoby/film/zrodla && npm run przygotuj && npm test` → 22/22 (5 pasków,
  10 faktów, 7 wierności). `przygotuj` = dane → panel → sceny → manifest (manifest sam uruchamia
  testy rdzenia, ok. 35–45 s) → fonty → znak; `npm test` danych nie odświeża (P-036);
- `npm run film` → `out/film.mp4` (cały film PL, ok. 4 min renderu, 12,6 MB — FAKT z E4);
  `npm run minuta` → sceny 1–3; `npm run animatik` → cały film w skali 0,5;
- klatki w trakcie pracy: `npx remotion bundle --out-dir=<katalog roboczy>/bundle`, potem
  `npx remotion still <bundle> <Kompozycja> <plik>.png --frame=<n> --scale=0.5`;
- klatki z gotowego MP4: `npx remotion ffmpeg -v error -ss <n/30> -i <mp4> -frames:v 1 <plik>.png`;
  ostatnia klatka: `-sseof -0.05`; liczba klatek: `npx remotion ffprobe -v error -count_frames
  -select_streams v:0 -show_entries stream=nb_read_frames …`;
- binarka do `plugin validate`: aplikacji 2.1.295 pod `%APPDATA%\Claude\claude-code\2.1.295\<hash>\claude.exe`,
  szukana `find`, nie `ls` (P-024).

```
docs/zasoby/film/zrodla/
  src/scenariusz.ts        # SCENY: 12/23/30/20/20/15 s; dlugosc(fps) = 3600
  src/teksty.ts            # PL (jedyny słownik): pamiec, paski, panel, nowaSesja, pracaWraca, final — bez cyfr
  src/fakty.ts             # wstaw(tekst, fakty): {komendy}, {progLimitu}, {oknoLimitu}, {narzedziaNazwy}, {wersja}
  src/rdzen.ts             # jedyne drzwi do core/panel (ROOT, BAND, BAR, BATTERY, THEME, CHIP, …)
  src/dane/manifest.json   # 10 faktów { wartosc, zrodlo }
  src/dane/paski.json      # plan i postęp z bieżącego STATUS/promptu (żywe) + bateria ze zrzutu z1
  src/dane/panel.json      # sceny 3: etapy z STATUS.md, liczby ze zrzutów 03–07, cytat diffu
  src/dane/sceny.json      # scen 4–5: karta E4 z stageCard() na commicie 0dcadef, słowa kart limitu, zapisu, wznowienia
  src/Root.tsx             # kompozycje robocze Pamiec, Paski, PaskiDalej, Panel, NowaSesja, PracaWraca, Final + Animatik (3600 kl.)
  src/sceny/Animatik.tsx   # sześć scen w kolejności; Wejdz (przenikanie / odsłona); nazwa kompozycji „Animatik”
  src/sceny/Pamiec.tsx, Paski.tsx + PaskiDalej.tsx, Panel.tsx + panel/*.tsx, NowaSesja.tsx, PracaWraca.tsx, Final.tsx
  src/sceny/Okno.tsx, Karteczka.tsx, Petla.tsx, Strzalka.tsx, Napis.tsx, Biurko.tsx, Kursor.tsx   # klocki
  skrypty/                 # dane.mjs, panel.mjs, sceny.mjs, manifest.mjs, fonty.mjs, znak.mjs
  testy/                   # paski.test.mjs (5), fakty.test.mjs (10), wiernosc.test.mjs (7)
docs/zasoby/film/kalibracja/      # E1-klatka, E3-scena1, E3-scena3, E4-scena4, E4-scena5, E4-scena6 (.png)
docs/zasoby/demo/                 # dawne demo 2.1.3: dwa GIF-y 720×900 (PL 1,56 MB, EN 1,46 MB), dwa MP4 60 s, zrodla/ (Playwright + ffmpeg, glify.py, pokrycie.py)
README.md                         # „Zobacz, jak to działa” osadza docs/zasoby/demo/demo-relai-25s-pl.gif
```

Napisy kadru są w `Napis.tsx` jedną linią (`whiteSpace: 'nowrap'`, `maxWidth: 1560`) —
dłuższy tekst EN wyjdzie poza pigułkę, a nie złamie się; kontrola przepełnień ma to złapać.
Odmiana „{komendy} komend” jest poprawna dla 14, nie dla każdej liczby (odłożone z E2 do E5).
Scena 3 łączy etapy planu liczone na żywo z kosztami ze zrzutów z 2026-10-12 („bez pomiaru” dla
E4–E6) — odłożone z E3 do zestawienia w E5 albo do E6.

**Czego jeszcze nie ma (to jest zakres tego etapu):** decyzji Łukasza o muzyce; słownika EN
i filmu EN; kompozycji pętli 720×900 i jej GIF-ów PL i EN; czterech kontroli (fakty, przepełnienia,
telefon, prywatność) w obu językach; zestawienia klatek filmu ze zrzutami wersji wydawanej;
dawnego demo w archiwum; nowej pętli w `README.md`.

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
   „plik testów się nie wczytał” nie dowodzi żadnego testu z osobna (L-0165). **Element animowany
   z danych procesu sprawdzasz na stanie pośrednim z lukami**, nie tylko na stanie z chwili pisania
   — punkty odhacza się w kolejności pracy, nie numeracji (L-0175). **Chwilę z przeszłości liczysz
   kodem produktu z plików przypiętych do jej commitu** (`git show`), nie z danych żywych, które
   do dnia wydania pokażą inny stan (L-0177).
   (L-0017, L-0018, L-0040, L-0051, L-0052, L-0063, L-0069, L-0082, L-0115, L-0117, L-0123, L-0134,
   L-0144, L-0150, L-0154, L-0155, L-0156, L-0158, L-0159, L-0165, L-0175, L-0177)
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
   dosłownie wyłączasz z tego zbioru jawnie (L-0173). (L-0032, L-0037, L-0095, L-0096, L-0105, L-0106, L-0107, L-0110, L-0111, L-0113,
   L-0097, L-0101, L-0102,
   L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086, L-0087, L-0088,
   L-0090, L-0091, L-0124, L-0125, L-0130, L-0131, L-0135, L-0141, L-0143, L-0151, L-0160, L-0164,
   L-0169, L-0170, L-0173)
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
    wyłączonych z testu faktów (L-0178).
    (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094, L-0098, L-0137, L-0140, L-0142, L-0145, L-0147,
    L-0149, L-0152, L-0157, L-0171, L-0174, L-0176, L-0178)

**Wyprowadzone 2026-08-20 do `docs/PULAPKI.md`:** sześć pozycji, które były pułapkami
narzędziowymi, a nie zasadami pracy — `tar` na `PATH` (L-0021), sesja pomiarowa `claude -p`
(L-0024), PowerShell 5.1 i UTF-8 (L-0027), `--allowedTools` przy `acceptEdits` (L-0028),
restart aplikacji po `plugin update` (L-0031), `git worktree` zamiast `git archive | tar`
(L-0039). Obowiązują dalej — czytasz je z rejestru pułapek, na żądanie.

**Wyprowadzone 2026-08-20 do `docs/PULAPKI.md`:** sześć pozycji, które były pułapkami
narzędziowymi, a nie zasadami pracy — `tar` na `PATH` (L-0021), sesja pomiarowa `claude -p`
(L-0024), PowerShell 5.1 i UTF-8 (L-0027), `--allowedTools` przy `acceptEdits` (L-0028),
restart aplikacji po `plugin update` (L-0031), `git worktree` zamiast `git archive | tar`
(L-0039). Obowiązują dalej — czytasz je z rejestru pułapek, na żądanie.

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/FILM_PREZENTACYJNY/E5/`.** Wszystko tymczasowe —
paczki Remotion, klatki do oceny, wyjścia `glify.py`, skrypty pomiarowe i edycji — powstaje tam.
Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy), wpisujesz do
wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu, gdy ją wybierasz.

1. **Na start:** pytanie do Łukasza o muzykę (plan, sekcja 9: brak albo plik z licencją od niego).
   Odpowiedź do wpisu. Bez pliku film zostaje bez dźwięku — to stan domyślny, nie brak.
2. **`docs/zasoby/film/zrodla/src/teksty.ts`** — słownik `EN` o **tych samych kluczach** co `PL`
   (test parytetu kluczy z kontrolą pozytywną na kopii z brakującym kluczem); zero cyfr;
   znaczniki faktów w obu. Odmiana „{komendy} komend” (E2) rozstrzygnięta w obu językach —
   brzmienie poprawne dla wartości z manifestu i nie fałszywe dla innych (np. słowo bez liczebnika
   albo forma liczona z wartości). Lista faktów z nazwami (`narzedziaNazwy`) łączona po angielsku
   („a, b and c”) — `src/fakty.ts` dostaje język.
3. **Film EN** — sceny czytają słownik wybranego języka (props kompozycji albo kontekst), film PL
   pozostaje bajt w bajt tym samym obrazem: dowód pikselowy klatek kontrolnych PL sprzed i po
   zmianie. Skrypty w `package.json` dla filmu EN (np. `npm run film:en` → `out/film-en.mp4`).
4. **Pętla 25 s** — kompozycja pionowa 720×900 (np. `src/sceny/Petla25.tsx` albo
   `src/petla/…`) jako skrót scen 2 i 3, PL i EN, napisy w jednej linii; GIF-y renderem Remotion
   albo `ffmpeg` z palety, nieprzezroczyste tło (README w obu motywach GitHuba). Parametry
   (klatki/s, szerokość, kolory palety) dobrane pomiarem wagi wobec budżetu 3 MB (SZACUNEK)
   i czytelności. Pliki docelowe: `docs/zasoby/film/relai-petla-25s-pl.gif`,
   `docs/zasoby/film/relai-petla-25s-en.gif` (nazwy możesz poprawić, wtedy wszędzie).
5. **Cztery kontrole** w obu językach:
   - **fakty** — `testy/fakty.test.mjs` obejmuje słownik EN i teksty pętli;
   - **przepełnienia** — pomiar prostokątów w Chromium (zasada 15): żaden napis, karteczka ani
     wiersz karty nie wychodzi poza swój kontener, w filmie i w pętli, PL i EN; kontrola
     pozytywna na podłożonym przepełnieniu;
   - **telefon** — `glify.py` na obu GIF-ach pętli: każda linia tekstu z medianą ≥ 7 px przy
     375 px, wyłącznie klatki ustalone, oba kierunki kontrastu (jasny tekst na ciemnym oknie
     też — sprawdź, czy instrument go widzi, zanim uznasz wynik; zasada 5 i 15); cały zbiór linii
     do wpisu;
   - **prywatność** — test obejmuje słownik EN i teksty pętli.
6. **Zestawienie klatek ze zrzutami wersji wydawanej** — klatki scen 3–5 obok zrzutów
   `docs/zasoby/PANEL_RELAI/zrzuty/` (01–09, LIMIT_CHECKPOINT) w jednym arkuszu (HTML albo PNG
   w katalogu roboczym) dla Łukasza; jego słowa do wpisu. Rozstrzygnij z nim koszty sceny 3
   („bez pomiaru” dla E4–E6 przy renderze w E6: świeże zrzuty, koszty na żywo albo zostaje).
7. **Dawne demo do archiwum** — `git mv docs/zasoby/demo docs/archiwum/demo`, README demo
   z adnotacją (data, powód, następca: `docs/zasoby/film/`); każde łącze do starej ścieżki
   w plikach śledzonych poprawione albo świadomie zostawione (wpisy dziennika są historią —
   nie przepisujesz ich). Instrument `glify.py` przenosi się razem z demo — prompt i README filmu
   wskazują nową ścieżkę.
8. **`README.md`** — sekcja „Zobacz, jak to działa”: nowa pętla PL, `alt` opisujący, co widać,
   link do pętli EN i do filmu (MP4 będą w wydaniu v3.0.0 — do tego czasu zdanie bez martwego
   linku; zasada 14). Obejrzane w obu motywach (zrzut albo render strony w Chromium).
9. **Pokaz Łukaszowi:** film EN, obie pętle, arkusz zestawienia. Do trzech rund poprawek; każda
   runda: co pokazane, co powiedział, co zmienione. Klatki przyjęte do
   `docs/zasoby/film/kalibracja/` (`E5-petla-pl.png`, `E5-petla-en.png`, `E5-film-en.png`).
10. **`docs/zasoby/film/README.md`** — stan na E5, komendy renderu EN i pętli, cztery kontrole
    i jak je uruchomić, nowa ścieżka instrumentu czytelności.

Elementy zamykające etap, które łatwo pominąć: `npm run typy` bez błędów; gdy etap dodaje pakiet —
najpierw zgoda Łukasza z wielkością **na dysku** (L-0172) i audyt zależności; `claude plugin
validate .` dalej przechodzi; GIF-y pętli wchodzą do gita (plan), MP4 — nie.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_5.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [ ] Pytanie o muzykę padło na starcie; odpowiedź Łukasza we wpisie.
- [ ] Słownik EN: te same klucze co PL (test parytetu z kontrolą pozytywną), zero cyfr w obu
      słownikach; odmiana „{komendy}” rozstrzygnięta i opisana we wpisie.
- [ ] Film PL nietknięty: klatki kontrolne PL (co najmniej jedna z każdej sceny) sprzed i po
      zmianie — 0 różnych pikseli, porównanie z kontrolą pozytywną.
- [ ] Film EN wyrenderowany 1920×1080, 30 kl./s: `ffprobe` z pliku — 3600 klatek, 120 s ± 1
      klatka; własne klatki obejrzane (każda scena, środek każdego przejścia, ostatnia).
- [ ] Pętle PL i EN: 720×900, długość 25 s ± 1 klatka (z pliku), waga każdej do wpisu wobec
      budżetu 3 MB (SZACUNEK); nieprzezroczyste tło.
- [ ] Kontrola faktów: `npm test` — wszystkie testy (22 z E1–E4 + nowe, minus świadomie zmienione
      z powodem we wpisie), przebieg po `npm run przygotuj` po ostatniej zmianie promptu; liczniki
      wąski i szeroki dla obu języków do wpisu; wartości kontroli pozytywnych sprawdzone wobec
      zbioru dozwolonego (L-0173).
- [ ] Kontrola przepełnień: 0 elementów poza kontenerem w filmie i pętli, PL i EN; kontrola
      pozytywna na podłożonym przepełnieniu trafiona.
- [ ] Kontrola telefonu: `glify.py` na obu pętlach — każda linia tekstu z medianą ≥ 7 px przy
      375 px; cały zbiór linii i odsiew do wpisu; instrument sprawdzony na jasnym tekście na
      ciemnym tle (kontrola pozytywna na klatce, w której taki tekst na pewno jest).
- [ ] Kontrola prywatności: test obejmuje słownik EN i teksty pętli, przechodzi; trzy podłożone
      linie trafione.
- [ ] Kolory i sieć: `grep -rnE '#[0-9a-fA-F]{3,8}' src/sceny/` i `grep -rnE "https?://" src` —
      pusto, każdy z kontrolą pozytywną na podłożonym pliku w katalogu roboczym.
- [ ] Zestawienie klatek ze zrzutami przejrzane przez Łukasza (jego słowa we wpisie); decyzja
      o kosztach sceny 3 we wpisie albo jako bramka w `STATUS.md`.
- [ ] Dawne demo w `docs/archiwum/demo/` (`git mv`, historia zachowana), README demo
      z adnotacją; `grep -rn "zasoby/demo"` w plikach śledzonych poza dziennikiem i archiwum —
      każde trafienie rozstrzygnięte we wpisie.
- [ ] `README.md` osadza nową pętlę PL, link do EN; żadnego martwego linku (`git ls-files` na
      każdą ścieżkę z sekcji); obejrzane w jasnym i ciemnym motywie.
- [ ] Łukasz przyjął film EN i obie pętle (jego słowa we wpisie), klatki wzorcowe
      w `docs/zasoby/film/kalibracja/` **albo** po trzech rundach coś zostaje otwarte — wtedy etap
      zostaje `W TOKU`, a wpis mówi, co zostało do rozstrzygnięcia.
- [ ] `npm run typy` bez błędów; gdy etap dodał pakiet — `npm audit --omit=dev` zero wysokich
      i krytycznych (liczby do wpisu); gdy nie dodał — zdanie o tym we wpisie z `git diff` na
      `package.json` i `package-lock.json`.
- [ ] Testy rdzenia 331/331 (komenda ze „Stanu wyjściowego”); `node core/tools/validate-adapters.js`
      spójne; `claude plugin validate .` binarką aplikacji — exit 0.
- [ ] Pliki PANEL_CODEX (`docs/plany/PANEL_CODEX/`, `docs/zasoby/PANEL_RELAI/makiety/`) nietknięte:
      stdout `git diff --stat`, `git status --short` i sha256 ich plików identyczne z tymi sprzed
      etapu, poza commitem etapu.
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy”, z podpisem `Autor: RelAI (Opus 5.5) + Lukasz`.
- [ ] Katalog roboczy `.claude/relai/work/FILM_PREZENTACYJNY/E5/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po
      w sekcji „Zweryfikowane” wpisu. Artefakty poza nim (pliki `%TEMP%` renderu, jeśli powstały)
      wypisane z nazwy, z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/FILM_PREZENTACYJNY/STATUS.md`: E5 → ZREALIZOWANY (data), E6 → GOTOWY DO STARTU,
   link do `PROMPT_ETAP_6.md` w kolumnie `Prompt` (po punkcie 5); linia zamknięcia E5 w dzienniku
   wdrożenia (`SPEC_STATUS.md`); bramka „Start E5” → ROZSTRZYGNIĘTA.
1a. Katalog roboczy etapu — raport, „tak”, liczby przed i po do wpisu z punktu 2.
2. `docs/DZIENNIK.md`: wpis wg `SPEC_DZIENNIK` (Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”. Przejrzyj tabelę
   ryzyk; lekcje z etapu do `docs/LEKCJE.md` i odśwież „Zasady aktywne” (limit 15,
   `node core/tools/count-rules.js docs/LEKCJE.md`).
3. Bramki manualne w `STATUS.md` z sekcji „Do zrobienia przez człowieka” tego wpisu.
4. `docs/STATE.md` — stan planu filmu (dwa filmy i pętle gotowe do wydania); linie planu
   w `CLAUDE.md` („Stan prac”, „Aktywny plan”); `docs/ARTEFAKTY.md` tylko wtedy, gdy etap zmienił
   artefakt z rejestru.
5. **Wygeneruj `PROMPT_ETAP_6.md`** w tym folderze, ze specyfikacji promptu etapowego
   (`.claude/relai/templates/SPEC_PROMPT_ETAPU.md`): na bazie `PLAN.html` sekcje 2 (cel 5), 6 (E6),
   8 (MP4 w zasobach wydania), 9 (numery pluginów panelu w 3.0.0, zgoda na publikację), procedury
   wydania 2.9.0 (siedem źródeł wersji, walidator, testy pluginów, skan sekretów), realnego stanu
   po tym etapie (stan odnogi parsera modelu — bramka przed E6) i lekcji z tego etapu.
6. Commit (conventional, EN) i push — propozycja; wyłącznie za zgodą Łukasza, bez plików PANEL_CODEX.
