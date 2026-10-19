# PROMPT_ETAP_5 — Film: kinowy przelot w języku filmu 3.0.0, ekran ładowania i bramka „Biurko czy Film”

Plan: STRONA_RELAI • Etap: **E5 z E8** (Aneks C) • Wygenerowano: 2026-10-16 (autor: Opus 5.5, w rytuale „Na koniec” E4) • Wykonawca: **Opus 5.5 (D-85), w etapie do 3 subagentów Sonnet 5.5 wyłącznie do zadań deterministycznych · w Claude Code**, `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz (L-0220: ocena smaku na słabszym
> modelu kosztowała w E2 dwie rundy). Zalecany poziom `/effort`: `high` (drugi prototyp od zera:
> gramatyka, choreografia przewijania, ekran ładowania i bramka wyboru, a ocena wyglądu należy do
> Łukasza).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, linia aktywnego planu, sekcja niemutowalna |
| `docs/LEKCJE.md` | wyłącznie „Zasady aktywne” (są też przepisane niżej) |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk” (T1, T2, T3) + wpis 2026-10-16 „STRONA_RELAI E4…” (werdykt Łukasza, cytaty o świetle i o ładowaniu strony) |
| `docs/plany/STRONA_RELAI/PLAN.html` | sekcja 4 (wariant 4 „Film” — definicja, za i przeciw), 5 (akapit „Prototyp Film” i „Wspólne dla obu”), 6 (wiersz dawnego E3 „Film” — zakres i efekt), 8 (przypadki brzegowe), 10 (**Aneks C pkt 2, 4, 5** i **Aneks A pkt 2** — wiążą) |
| `docs/zasoby/STRONA/builds/biurko/BRIEF.md` | ta sama historia i krzywa odczuć (cisza, jeden szczyt, spokój), zdanie „to strona, na której…”, siedem przystanków; akapit o „Filmic one-shot” — Film jest tą odrzuconą tam gramatyką, celowo |
| `docs/zasoby/film/README.md`, potem `docs/zasoby/film/zrodla/src/tokeny.ts`, `scenariusz.ts`, `sceny/Pamiec.tsx`, `Pytania.tsx`, `Karteczka.tsx`, `Okno.tsx`, `Paski.tsx`, `Final.tsx` i klatki `docs/zasoby/film/kalibracja/E1-klatka.png`, `E3-scena1.png`, `E5-komendy-1.png`, `E4-scena6.png` | język filmu 3.0.0: paleta i miary „Warsztat z wigorem”, kroje, rytm, karteczki, okno w przechyle, paski, finał — miara wyglądu Filmu |
| skill `nateherk-design:scroll-craft` (narzędzie Skill) | `SKILL.md`, potem `references/taste.md`, `feel.md`, `uniqueness.md`, `template.html` i nagłówek `engine/scrollcraft.js` (akty `data-sc-*`, `pin`/`scrub`, `dwell`) |
| `site/README.md`, potem `site/narzedzia/zbuduj.mjs`, `szablon.html`, `site/tresc/pl.json`, `site/biurko/start.js`, `site/css/strona.css` | generator stron, wspólna treść, wejście bez WebGL, tokeny w CSS — Film korzysta z nich, nie kopiuje |
| `core/panel/theme.mjs` (i moduły, które wołają paski: `progress.mjs`, `cache-timer.mjs`, `plan-state.mjs`) | paleta i kod pasków — źródło makiet; `docs/zasoby/PANEL_RELAI/DESIGN.md` przed pierwszą makietą (zasada 15) |

## Decyzje już podjęte — nie otwierasz ich ponownie

- **Aneks C (2026-10-16), pkt 2:** E5 to prototyp Film w kształcie z sekcji 4 i 6 — ciągły kinowy
  przelot w języku filmu 3.0.0 na silniku scroll-craft, **bez zmian w silniku**; grafika z kodu
  (HTML, CSS 3D, SVG), **bez zdjęć i bez WebGL** (sekcja 4B: „Sam CSS 3D — tylko w Filmie”). Akty
  z sekcji 5: hero z nagłówkiem składanym linia po linii, przenikające się zdania, szczyt
  z karteczkami lecącymi na swoje miejsca, okno w przechyle 3D prostujące się do pasków, taśma
  fiszek, zamknięcie z reflektorem i konfiguratorem. Do tego zaprojektowany ekran ładowania, który
  zasłania stany pośrednie. Etap kończy się bramką „Biurko czy Film”.
- **Aneks A pkt 2 obowiązuje:** obrazy z GPT image wyłącznie jako wzorzec w `referencje/`, nigdy na
  stronie; klipy wideo i Kie.ai poza planem — dlatego tryb `worldflight` silnika (zbudowany na
  klipach) odpada, akty idą przez `pin`/`scrub` na HTML.
- **Wspólne moduły, budowane raz (sekcja 5):** treść PL/EN z `site/tresc/`, fakty z
  `site/dane/fakty.json`, konfigurator (`site/js/konfigurator.js` z testami), wersja, przełącznik
  języka, tokeny z `core/panel/theme.mjs`, logo z `site/grafika/`, fonty z `site/fonty/`. Film
  dokłada swoje słowa tylko tam, gdzie forma aktu ich wymaga — w tych samych plikach treści,
  w osobnym kluczu.
- **Kryterium jakości (Aneks C pkt 5, L-0226):** kadry ocenia się po detalu i wykonaniu (krój,
  rytm, krawędzie, ziarno papieru, cienie z CSS), nie po efekcie; ruch znaczy coś w historii albo
  go nie ma. Gust Łukasza: pamięć `gust-designowy-lukasza` i `realizm-to-detal-nie-swiatlo`.
- **Pułap pierwszego wejścia ok. 10 MB, liczony w MiB** (L-0223, `site/README.md`); Film ma być
  lżejszy od Biurka (sekcja 4: „lżejsza od biurka”); FAKT Biurka po E4: 9,49 MiB.
- **Biurko po E4 przyjęte przez Łukasza („Tak, przyjmuję”)** — `site/biurko/`, `site/index.html`,
  `site/pl/index.html`, `site/zasoby/` i `site/vendor/three/` zostają nietknięte; obie wersje mają
  być do obejrzenia obok siebie aż do bramki.
- **Telefon w etapie porównania** (sekcja 8): prototypy ogląda się na desktopie; telefon,
  reduced motion w pełni, plakat bez WebGL i ekran ładowania Biurka to **E7** (Aneks C pkt 4).
  Treść, komendy instalacji i odnośniki stoją w HTML od początku (sekcja 8, „JavaScript wyłączony”).
- **Granica zakresu:** pełna droga Biurka, szczyt w 3D i szuflady — **E6** (tylko przy wyborze
  Biurka); dopieszczenie wybranej — **E7**; Pages, deep linki na żywo, wiersz w `FINGERPRINTS.md`
  po wysyłce — **E8**. Nie włączasz Pages, nie pushujesz, przegranego prototypu w E5 nie kasujesz.

## Stan wyjściowy — co realnie zastajesz

E4 zrealizowany 2026-10-16 w treści Aneksu C (commit E4 — sprawdź `git log --oneline -3`; gdy
Łukasz nie zatwierdził go przed startem, zmiany E4 leżą w drzewie i ich nie ruszasz). Path tracing
zbudowany, zmierzony i usunięty; Biurko ma blat `wood_table_worn`, druk na dokumentach, cienki
lakier i przygaszoną lampę. Filmu na stronie nie ma w żadnej postaci.

```
site/index.html, site/pl/index.html  # generowane: Biurko EN i PL (nie edytujesz ręcznie)
site/narzedzia/zbuduj.mjs (+test)    # mini-Mustache: szablon + treść + fakty → OUTPUT_FILES { en, pl }; jeden szablon
site/narzedzia/szablon.html          # szablon Biurka: mapa importów three.js, warstwa przystanków, konfigurator
site/narzedzia/fakty.mjs (+test)     # fakty z repo (komendy z NAMES w core/panel/theme.mjs, wersje, adaptery) → site/dane/fakty.json
site/tresc/pl.json, en.json          # klucze: meta, nawigacja, hero, przystanki, instalacja, konfigurator, scena, brakSceny, stopka
site/js/                             # jezyk.js, konfigurator.js, wersja.js — czysta logika z testami, wspólna
site/biurko/start.js                 # wejście: język, konfigurator, wersja; scena tylko przy WebGL2 (wzór „treść bez sceny”)
site/css/strona.css                  # wygląd Biurka, tokeny palety „Warsztat”
site/fonty/, site/grafika/logo.svg   # Fraunces, Hanken Grotesk, JetBrains Mono, Kalam; logo
docs/zasoby/film/zrodla/             # Remotion filmu 3.0.0 — źródło języka wizualnego (tylko do czytania)
docs/zasoby/STRONA/FINGERPRINTS.md   # rejestr scroll-craft, pusty
```

Silnik scroll-craft leży poza repo, w pluginie `nateherk-design` 0.3.1
(`C:/Users/Lukasz/.claude/plugins/cache/nateherk/nateherk-design/0.3.1/skills/scroll-craft/engine/`:
`scrollcraft.js` 63 459 B, `scrollcraft.css` 20 201 B, FAKT); licencja MIT według `plugin.json`,
pliku `LICENSE` w kopii pluginu nie ma.

**Warunki pracy:** testy `node --test "site/**/*.test.mjs"` (162 pass po E4, FAKT); strony buduje
`node site/narzedzia/zbuduj.mjs`. Podgląd: serwer
`node C:/Users/Lukasz/.claude/plugins/cache/nateherk/nateherk-design/0.3.1/skills/scroll-craft/scripts/serve.mjs --root site --port 4520`
w tle przez Bash (port bywa zajęty serwerem z poprzedniej sesji — wtedy `curl` na 4520 i korzystasz
z niego). Kadry o stałym rozmiarze w osobnej stronie Chrome DevTools z `emulate viewport`
(`1366x768x1`); przed każdym pomiarem ruchu `select_page` z `bringToFront` i liczba
`requestAnimationFrame` na sekundę (L-0222); język EN wymaga `localStorage.relai-jezyk = "en"`
w `initScript`. Pomiar ładowania „zimnego” — nowa strona z wyłączoną pamięcią podręczną
(L-0227). W drzewie roboczym leżą cudze zmiany planu PANEL_CODEX (`docs/plany/PANEL_CODEX/*`,
`docs/zasoby/PANEL_RELAI/makiety/`) i `.claude/launch.json` — nie ruszasz ich i nie commitujesz.

**Czego jeszcze nie ma (to jest zakres tego etapu):** briefu Filmu, kopii silnika w `site/vendor/`,
strony Filmu (EN i PL), aktów, makiet pasków z kodu pluginów, ekranu ładowania, kadrów porównania
obu prototypów i rozstrzygniętej bramki „Biurko czy Film”.

**Zasady aktywne z `docs/LEKCJE.md` (przepisane w całości, stan 2026-10-16):**

1. **Specyfikacja dokumentu jest kompletna albo martwa:** kończy się realnym przykładem, wypisuje
   wymaganą strukturę w treści (odesłanie nie wystarcza) i ma ścieżkę „pytam zamiast zmyślać"
   z formą zapisu luki. **Wzorzec powtarzalny sprawdzasz na całej rodzinie dokumentów** — „stare
   brzmienie nie zwraca nic" puszczasz na katalogu specyfikacji; trafienie poza zakresem etapu to
   sygnał odchylenia, nie usterka weryfikacji. **Pierwszy realny przebieg reguły jest częścią jej
   pisania** — rozjazd to defekt reguły, nie wyjątek do obejścia. **Reguła produkująca tekst opisuje
   początek wiersza i to, czego w nim nie ma** — model domyka lukę formatem materiału pod ręką;
   materiał sprzed poprawki reguły zostaje obok materiału po niej.
   **Linia raportu poświadczająca krok bierze treść z wyniku polecenia tego kroku** („Zmiana:
   <pliki z git status>”) — bez kotwicy powstaje bez uruchomienia polecenia. **Komenda
   w sekcji Weryfikacja ma za sobą jeden realny przebieg autora promptu** (testy Node wzorcem
   plików, nie katalogiem) (L-0212).
   (L-0001, L-0011, L-0026, L-0089, L-0100, L-0108, L-0129, L-0212)
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — fraza i forma wywołania
   w wersji uruchomionej dosłownie, z tej samej powłoki, którą zobaczy czytelnik; znak
   interpretowany przez powłokę zapisujesz tak, żeby go nie tknęła. (L-0002, L-0022, L-0059)
3. **Test „czegoś nie wolno" wymaga dowodu negatywnego:** chroniony fragment ma nadal pierwotne
   brzmienie, nie tylko nowy wpis powstał. (L-0007)
4. **Dowodzisz efektem, nie zdarzeniem** — stanem pliku, sumą, treścią odpowiedzi; kryterium na
   stanie, który kontrolujesz, i na źródle, które artefakt produkuje. Zmianę zachowania pokazujesz
   **obiema wersjami w jednym przebiegu**, instrumentem wiernym obu, na materiale, który stara
   wersja psuje (L-0191).
   - **Kryterium:** na poprawności wyniku, nie na kierunku liczby, której nie kontrolujesz;
     sprawdzone na materiale **przed** pracą (także przez autora promptu) — arytmetycznie
     nieosiągalne wraca do człowieka jako aneks. Etap przenoszący treść liczy metrykę na całym
     pakiecie. Liczenie wywołań narzędzia zaczynasz od listy narzędzi w `init`. Wyszukiwanie
     wzorca omija pliki, które go cytują. Tekst tłumaczący liczbę ma warunek prawdziwości i test
     stanu docelowego (L-0144).
   - **Materiał:** test na realnym pliku zmienianym przez proces sam ustawia stan wyjściowy,
     licznik do dziennika z przebiegu po ostatniej zmianie (L-0150); plik śledzony albo własna
     fixtura, nigdy z `.gitignore` (L-0156); przed pytaniem o zasięg sprawdzasz, czy plik nie jest
     generowany (L-0154); zmianę dowodzisz na widoku, który obejmuje jej rekordy (L-0155); test
     wydanego artefaktu czyta stan wydania (tag, worktree), nie drzewo robocze (L-0186); element
     „pomiędzy” ma warunek na rodzaju sąsiada i test z sąsiadem własnym i obcym (L-0195).
   - **Na żywo:** widok z danych projektu mierzysz w najgorszym stanie i ograniczasz w kodzie
     (L-0158); diagnoza zaczyna się od znacznika wersji w logu (L-0159); „przed” w dwóch
     przebiegach — stary kod i stary kod z nową czystą logiką (L-0165); animacja z danych procesu
     na stanie pośrednim z lukami (L-0175); chwila z przeszłości liczona kodem z jej commitu (L-0177);
     artefakt weryfikacji renderowany od nowa, wszystkie warianty razem (L-0182); parser pola
     opisanego prozą — na każdym zapisie rodziny i przykładzie specyfikacji, stary i nowy kod
     obok siebie (L-0184); po zmianie kodu z trybem zastępczym pierwsza asercja to tryb, potem
     zrzut (L-0213); ruch i czas klatki tylko w widocznej stronie, kadry o stałym rozmiarze
     w osobnej stronie DevTools (L-0214); po zmianie modułu ES `reload` z `ignoreCache` i asercja
     nowego kodu przed kadrem (L-0218); przed diagnozą ruchu liczba `requestAnimationFrame` na
     sekundę — poniżej 30 najpierw `bringToFront`, schowek systemu tylko w prawdziwym Chrome
     (L-0222); kod przewijający sam zapisuje cel w stanie odbiornika przed `scrollTo` (L-0224);
     koszt pierwszej wizyty z solą w definicjach shadera, kompilacja i pierwsze rysowanie osobno,
     licznikiem przerw głównego wątku — przeładowanie mierzy ciepłą pamięć (L-0227).
   (L-0017, L-0018, L-0040, L-0051, L-0052, L-0063, L-0069, L-0082, L-0115, L-0117, L-0123, L-0134,
   L-0144, L-0150, L-0154, L-0155, L-0156, L-0158, L-0159, L-0165, L-0175, L-0177, L-0182, L-0184,
   L-0186, L-0191, L-0195, L-0213, L-0214, L-0218, L-0222, L-0224, L-0227)
5. **Instrument pomiarowy sam bywa źródłem fałszu.**
   - **Backslash:** wyrażenia regularne i ścieżki Windows tylko w pliku pisanym Write/Edit albo
     z `/`; skrypt edycji niosący `\n`, backtick lub ścieżkę — Write, heredok bez wyjątku, także
     jednolinijkowa podmiana przez `node -e`; dokumenty — tylko Edit; napis z `\n` w kodzie albo
     teście — tylko Edit, także obok podmian bez ucieczek; dotyczy każdego pliku, także roboczego
     poza repo (`dev-mods`, `%TEMP%`); „dokumenty — tylko Edit” obejmuje dopisanie na końcu
     (`cat >>` z heredokiem) i `sed -i` na wierszu tabeli; seria podmian w kodzie — kilka Edit albo
     skrypt Write, także gdy „to tylko liczby” (L-0116, L-0119, L-0135, L-0148, L-0188,
     L-0192, L-0198, L-0210, L-0215);
     tekst zastępczy `replace` nie jest dosłowny (`` $` ``, `$&`) — cudzą treść podstawiasz funkcją,
     po wstawce porównanie ze źródłem i licznik nagłówków całego pliku (L-0211);
     znaki łączące — `\p{M}` z flagą `u`; wynik sprawdzasz grepem stałego ciągu.
   - **Kontrola pozytywna:** zero trafień przy niepustych zbiorach to defekt instrumentu do czasu
     dowodu, a trafienie na materiale dotąd zdrowym sprawdzasz najpierw na instrumencie; scenariusz
     „konfiguracji nie ma” mierzysz z podstawionym katalogiem domowym; dokładasz przypadek, który **musi** trafić, na **tym samym wejściu**, którego mechanizm
     naprawdę pilnuje (nie z jego listy wyłączeń); przebieg „oczekuję ciszy" ważny tylko z kontrolą
     pozytywną w tym samym przebiegu; obok wzorca licznik „ile odrzucono” i „ile bez pary”;
     generator identyfikatorów sprawdzasz na wszystkich kandydatach; wartość podkładaną — wobec
     zbioru dozwolonego (L-0173); kontrola negatywna zmienia mierzoną wielkość, nie jej obraz (L-0181);
     tło pod tekstem fotografujesz z `opacity: 0` na rodzicu (`visibility` dzieci wygrywa), wynik
     1,00 : 1 na całej linii to najpierw instrument (L-0213).
   - **Parsowanie:** separator niepoprzedzony znakiem ucieczki i liczba pól po podmianie; zbiór
     znaków zachowywanych wypisany raz; filtr „to nie przypadek” ma wyjątek dla linii o rzeczy
     sprawdzanej; każdy przypadek graniczny ma własną kontrolę; nazwy narzędzi w cudzym
     transkrypcie wypisujesz, zanim orzekniesz brak.
   - **Porównania:** instrument dwóch drzew odtwarza materiał przed każdym wariantem i dowodzi
     nietkniętości; wynik wynosisz od razu, z sumą; porównanie najpierw sprawdza istnienie obu
     wejść, a oba pliki kasuje przed przebiegiem (L-0143); stan „przed” w `git worktree` HEAD-a, nie
     po `stash` (L-0151); bez `append` — plik na proces (L-0141).
   - **Cudze usługi i dane:** niedostępność sprawdzasz jednym tanim wywołaniem, zanim odpiszesz
     pomiar; „działało wczoraj” też jest hipotezą; wniosek z czasu zepsutego artefaktu datujesz jego
     wersją; wyczerpany limit konta zatrzymuje pomiar i idzie do odnogi, nie do adnotacji
     „sprawdzone inaczej”.
   - **Liczenie treści:** dwa liczniki — wąski (własny wzorzec, przez wykluczenie znaku
     otwierającego) i szeroki z kontrolą przeciw zawyżeniu; najpierw kształt odpowiedzi, potem
     jakość, z mianownikiem; różnica przebiegów tylko ponad zmierzony szum; agregat odsiewa elementy
     innej klasy jawnym progiem; czytelność klatek — tylko klatki ustalone, oba kontrasty, korpus =
     materiał źródłowy.
   - **Przebieg:** scenariusz „czegoś nie ma” z listą mechanizmów, które to tworzą (inaczej
     fixtura); limit tur na cały łańcuch i kod wyjścia każdej sesji; podłożony hook — `node --check`
     i licznik wstrzykniętego zdania (L-0127); nowa kontrola spójności najpierw na zastanym
     materiale, cisza podejrzana do pokazu na podłożonym defekcie; po historii commitów trafienia
     dzielisz na „naprawione później” i „nigdy” (L-0131); skrypt cięcia sprawdza cały blok i idzie
     kompilator (L-0160); wklejka dowodzona licznikiem nagłówków i porównaniem ze źródłem (L-0164);
     operacja na zakresie normalizuje tylko styk, reszta nietknięta (L-0169); fixtura ewaluacji
     niesie środowisko czytane przez hooki (L-0170).
   (L-0032, L-0037, L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086,
   L-0087, L-0088, L-0090, L-0091, L-0095, L-0096, L-0097, L-0101, L-0102, L-0105, L-0106, L-0107,
   L-0110, L-0111, L-0113, L-0124, L-0125, L-0127, L-0130, L-0131, L-0135, L-0141, L-0143, L-0151,
   L-0160, L-0164, L-0169, L-0170, L-0173, L-0181, L-0211, L-0213, L-0215)
6. **Próg jest liczbą, którą ktoś liczy:** kalibrujesz na realnych plikach, zapisujesz w jednostce
   mechanizmu z komendą sprawdzającą, z **jednym** wyzwalaczem. Porównujesz do wielkości, którą
   mechanizm kontroluje (część usuwalna); zatkanie sygnalizuje **różnica możliwego i wykonanego**,
   nie zero wykonanego; reguła „najstarszy element” w mechanizmie od najstarszego zatyka go
   z definicji. Liczba zbioru liczona także w komunikacie sukcesu. Odejmowana stała to hipoteza —
   nierzetelne odjęcie oznaczasz. Próg wspólny sprawdzasz na każdej wielkości z osobna (L-0167).
   Karta zgody na zależność podaje wielkość na dysku (L-0172). Liczba budżetu niesie jednostkę
   zdefiniowaną w instrumencie, a różnicę wobec poprzedniego etapu liczysz tym samym instrumentem na
   drzewie poprzedniego commitu (L-0223).
   (L-0034, L-0049, L-0053, L-0060, L-0065, L-0099, L-0104, L-0167, L-0172, L-0223)
7. **Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień:** od początku komórki, wybór
   linii po wartości, nierozpoznane = cisza. Rdzeń z diakrytykami łapiesz klasą znaków języka, nie
   `\w`, i tylko w brzmieniu wartości, nie w całej komórce. Koszt zamkniętej listy (pozycje, które
   człowiekowi wyglądają na rozpoznane) mierzysz; poszerzenie to decyzja człowieka.
   (L-0025, L-0035, L-0048, L-0066, L-0070, L-0074)
8. **Zachowanie, które ma działać zawsze, mieszka w warstwie obecnej w każdej sesji** (`CLAUDE.md`
   albo hook); skill wyzwala się zawodnie. Sygnał jednorazowy ma jednego właściciela. Stan pisany
   przez model: plik na zapisującego, bez scalania. Zapis w warstwie niższej niż plik tej sesji
   kasuje ten plik i mówi, która warstwa rozstrzyga po zapisie (L-0187). Fakt rozstrzygnięty idzie
   do subagenta jako rozstrzygnięty. Zmiana formatu trwałej kopii ma drogę migracji. Plik
   doczytywany dla klasy `balanced` ma drogowskaz z wyzwalaczem w warstwie stałej — działa przy
   frazie z promptu; krok wyzwalany kształtem zadania stoi w warstwie stałej w skrócie.
   (L-0015, L-0030, L-0036, L-0112, L-0120, L-0121, L-0126, L-0128, L-0187)
9. **Skill nie zakłada dostępu poza katalogiem roboczym**; opis ≤ 1 024 znaki, trzecia osoba, co
   i kiedy, marker projektu i płaska lista fraz, bez `MUST BE USED`; krok sięgający dalej ma
   wyjście po odmowie. (L-0009, L-0010, L-0012, L-0023, L-0114)
10. **Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI**; zachowanie — świeżą
    sesją; po podbiciu `grep -r` po starym numerze i każde trafienie rozstrzygasz (historyczne vs
    deklaracja stanu, także w komendach i skillach). Niewydane mierzysz artefaktem podłożonym
    lokalnie pod **inną nazwą**; cały plugin — `--plugin-dir` z wyłączoną instalacją i ścieżką
    w `init`. Wydanie zestawia zmiany artefaktów z `ARTEFAKTY.md` i `git ls-files` z listą
    generowanych (L-0161). (L-0004, L-0008, L-0020, L-0061, L-0085, L-0118, L-0161)
11. **Końce linii, kolejność wpisów, numeracja nagłówków i stan dokumentu wobec specyfikacji to
    warianty.** Sumy po CRLF → LF, bez kotwicy końca w regexie linii, oba warianty w jednym
    przebiegu; kierunek z danych; nagłówek z tolerancją na `## 2.`, `**…**`, liczbę `#`, a kształt,
    który przewrócił wzorzec, wchodzi do kontroli dosłownie. Przeniesienie katalogu z cudzego
    manifestu — najpierw na kopii, walidatorem. Regułę dostawcy przepisujesz po ponownym odczycie
    źródła, z jej zakresem. (L-0033, L-0038, L-0057, L-0062, L-0067, L-0103, L-0122)
12. **Guardrail zatrzymujący nie-sekret to defekt rdzenia** — poprawka z dowodem, nie obejście;
    wołany przez opakowanie powłoki (brak interpretera = blokada); próbki sekretów składane
    w czasie wykonania; cudzysłów (także backtick) należy do grupy cudzysłowu, nie do wartości.
    (L-0043, L-0045, L-0046, L-0072)
13. **Cudze narzędzie poznajesz z wydanego builda i z próby**, nie z dokumentacji: payload po
    zdjęciu BOM, bez założeń o nazwach pól; CLI z powłoki natywnej; brak sygnału konfrontujesz
    z warunkiem milczenia; nieprzyjęty artefakt — najpierw jego walidator albo widok statusu.
    - **Mody:** zielone `validate`, typy i testy nie dowodzą zachowania w łańcuchu — mierzysz na
      żywo, ciszę sondą (licznik hooka, wynik `next`) (P-017); `$` i `on` tylko w pliku modułu
      hooków, na zewnątrz czysta logika; typy mówią, co powierzchnia przyjmie, nie co niesie —
      gałąź po polu powierzchni z wejścia, test na obecność odpowiednika; każde drzewo przez
      `plugin test` z montażem i kliknięciem przed pokazem na żywo; korzeń projektu w górę od
      zmiennego cwd, test w podfolderze (L-0146).
    - **Sesje:** sonda działania niszczącego w sesji bez wartości, stan w pliku przed krokiem
      (L-0153); funkcja czekająca na `$.ui.ask` zapamiętuje id sesji i porzuca odpowiedź po zmianie,
      zegar i próg czyta po każdym `await` (L-0166); test wielu rozmów — atrapy per rozmowa (L-0168);
      narzędzie wołane w komendzie nie pisze plików tymczasowych pod `.claude/` (ścieżka wrażliwa
      harnessu) — tekst na stdin heredokiem, jedno polecenie (L-0185); stan „na turę” liczy się od
      nowego polecenia człowieka, nie od zdarzenia promptu („tak”, powiadomienie i raport subagenta
      też nim są), a stan współdzielony przez równoległe hooki powstaje atomowo (L-0189); hook
      wyzwalany narzędziem mierzysz listą narzędzi z transkryptu i licznikiem wstrzykniętego
      kontekstu — model pisze też powłoką (L-0190).
    (L-0041, L-0042, L-0044, L-0047, L-0092, L-0133, L-0136, L-0138, L-0139, L-0146, L-0153, L-0166,
    L-0168, L-0185, L-0189, L-0190)
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Weryfikację planujesz tam,
    gdzie wykonalna; po pytaniu sprzątasz sam; jednostką inwentarza jest sprawa, nie linia; wstawkę
    kotwiczysz do elementu, który przeżyje operację, i dowodzisz **obecności** nowej treści. Gdy
    prompt etapu przeczy regule dokumentu docelowego — wygrywa dokument, rozjazd do dziennika.
    Opcja pytania, która odwołuje się do wariantu planu, cytuje jego definicję z planu (L-0228).
    (L-0005, L-0013, L-0014, L-0050, L-0058, L-0109, L-0228)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    Zadanie wizualne: najpierw cechy pozytywne, jeden wariant do kalibracji, zrzut przed
    dokończeniem etapu.
    - **Układ:** kompozycja z tekstem w warstwie, która liczy układ (HTML `grid`/`flex`, `overflow`),
      ręczne współrzędne tylko dla dekoracji; dziecko poza kontenerem blokuje, a instrument
      prostokątów ma kontrolę na podłożonym przepełnieniu; rysunek do człowieka po renderze
      w Chromium z pomiarem (L-0142); kryterium w warunkach odbiorcy (szerokość, wysokość glifów);
      uwaga „za niski / krzywo” najpierw pomiarem zrzutu, równe piksele przy powtórzonej uwadze to
      kontrast — pomiar i wybór zamiast kolejnej rundy (L-0196); tekst ucinany w modzie stoi
      w pudełku o bazie zerowej (`width={0}` + `flexGrow`), próba wyglądu startuje na
      najdłuższych realnych danych (L-0197).
    - **Nośnik:** na ograniczonym zestawie elementów sonda ustala pułap przed projektem, warianty
      w tym samym nośniku, różne już w stanie domyślnym (L-0197), ograniczenie mówione wprost;
      animacja znaczy trwającą czynność i ma źródło w sygnale narzędzia, wskaźnik postępu rośnie
      od lewej (L-0199); nowy element zbioru różnisz kształtem,
      porównanie na całym zbiorze w skali docelowej; plan z interfejsem wskazuje źródło motywu
      w pierwszym etapie, który rysuje więcej niż linię. Ostrzeżenie `plugin validate` o root
      `CLAUDE.md` jest skutkiem dogfoodingu — nie naprawiasz. Z zaakceptowanego wariantu
      przenosisz kształt, nie same barwy, i porównujesz wynik z jego zrzutem (L-0200); walidator,
      `plugin test` z montażem i zrzut to trzy osobne dowody, `Svg` zawsze z `alt` (L-0201);
      mechanizm mnożący drzewo — najpierw test budżetu na najgorszych danych (L-0202); przejście
      po drzewie testujesz na węźle w kształcie silnika, nie z ręki (L-0204, P-045); poprawka
      zielona w teście, a martwa na żywo — najpierw diagnostyka z działającego modu (L-0205);
      zrzut przez `PrintWindow` z `SetProcessDPIAware` (L-0206); element chwilowy (dymek,
      najechanie) nie zmienia geometrii spoczynku — test wysokości spoczynku obok testu nowego
      zachowania, pełne słowa w natywnym `<title>` (L-0209). Wygląd
      panelu i pasków: `docs/zasoby/PANEL_RELAI/DESIGN.md` przed każdą zmianą.
    - **Liczby i słowa:** procenty i kwoty z dwoma miejscami (L-0145); etykieta stanu słowem
      i znakiem, „x/y” tylko gdy y jest celem (L-0147); słowo o przeszłości ma warunek prawdziwości
      i test (L-0149); komórka liczby `flexShrink={0}` (L-0152); karta decyzji w całości tylko dla
      pozycji, które zmienia (L-0157); adnotacja mówi wartość wyliczoną (L-0176).
    - **Film:** element trwały po ruchu kamery bez 3D i filtra, przegląd klatki największego
      zbliżenia (L-0171); przejście przez wspólne tło, krój rozróżniający „1” i „I” (L-0174);
      „tego nie pokazujemy” szukasz we wszystkich tekstach kadru (L-0178); dźwięk z gotowych źródeł,
      próbki do wyboru (L-0179); licencję czytasz na stronie utworu, plik z kartą źródła i testem
      (L-0180); drugi język zaczyna się od jednej klatki i pytania, dla kogo (L-0183).
    - **Scena 3D:** kandydaci zasobów na karcie zgody po miniaturach obok wzorca, cecha wzorca
      widoczna już na miniaturze (L-0216); obiekt za płaszczyzną sprawdzasz kadrem, w którym jest
      największy, i wobec `near`/`far` kamery (L-0217); powtarzalne bryły jako jedna geometria,
      wywołania rysowania mierzone opakowaniem kontekstu (L-0219); uwaga „nie jak wzorzec” — rozbiór
      kadru na światło, materiał, obiektyw i kompozycję z jedną przyczyną i granicą techniki przed
      kolejną rundą (L-0220); urządzenie w scenie budujesz warstwami prawdziwej konstrukcji i przed
      pierwszym zrzutem oglądasz wycinek ×2 każdego narożnika i krawędzi obok wzorca — nic nie wystaje
      poza obrys, warstwa leży na powierzchni, równe marginesy są równe w liczbach (L-0221); cudzy
      generator sceny sprawdzasz pudełkami wypieczonej geometrii obok `Box3.setFromObject` i klasą
      referencyjną biblioteki (L-0225); dystans do wzorca najpierw detal, tekstury i kompozycja,
      technika światła na końcu, a hipotezę „X zrobi różnicę” — tanim testem na jednym kadrze
      z werdyktem człowieka przed etapem (L-0226).
    (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094, L-0098, L-0137, L-0140, L-0142, L-0145, L-0147,
    L-0149, L-0152, L-0157, L-0171, L-0174, L-0176, L-0178, L-0179, L-0180, L-0183, L-0196, L-0197,
    L-0199, L-0216, L-0217, L-0219, L-0220, L-0221, L-0225, L-0226)

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/STRONA_RELAI/E5/`.** Wszystko tymczasowe —
> skrypty pomiarowe, kadry robocze, strony porównań, licencja pobrana do sprawdzenia — powstaje tam.
> Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy), wpisujesz do
> wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od `relai-`.

Podział pracy: brief, choreografia, wygląd, ekran ładowania i ocena — Ty (Opus). Do trzech
subagentów Sonnet 5.5 (`Agent` z `model: "sonnet"`) dostaje wyłącznie testy z punktu 8 i pomiar
budżetu — deterministyczne, sprawdzane przez Ciebie przed przyjęciem.

1. **Brief** — `docs/zasoby/STRONA/builds/film/BRIEF.md` wg procesu scroll-craft: zdanie „to strona,
   na której…” i krzywa odczuć wspólne z Biurkiem, gramatyka „Filmic one-shot” z uzasadnieniem
   dryfu (sekcja 4: „skill traktuje filmowy przelot jako domyślny dryf; trzeba uzasadnić”), lista
   aktów z czasem przewijania i przystankiem historii, któremu odpowiadają, ruch-podpis, czego Film
   świadomie nie robi. Brief przed pierwszą linią kodu.
2. **Silnik bez zmian** — `site/vendor/scrollcraft/` (`scrollcraft.js`, `scrollcraft.css`,
   `VERSION` ze źródłem, wersją 0.3.1, sumą sha256 każdego pliku, `LICENSE`): pliki skopiowane bajt
   w bajt z kopii pluginu. Tekst licencji MIT z repozytorium `nateherkai/scroll-craft` pobierasz
   dopiero po karcie zgody (adres, rozmiar), do katalogu roboczego; nie da się go pobrać → pytasz
   Łukasza, zanim silnik trafi do `site/`.
3. **Strona Filmu** — `site/narzedzia/szablon-film.html`, rozszerzony `zbuduj.mjs` (drugi zestaw
   wyjść: `site/film/index.html` i `site/pl/film/index.html`, ten sam mini-Mustache, te same
   fakty), `site/film/` (moduły Filmu, np. `start.js`, `akty.js`), `site/css/film.css`. Wspólne
   moduły z `site/js/` importowane, nie kopiowane; przełącznik języka prowadzi między `/film/`
   i `/pl/film/`; `hreflang` jak w Biurku. Strona Biurka po przebudowie identyczna bajtowo z HEAD
   (dowód negatywny).
4. **Akty** — w kolejności z sekcji 5: hero z nagłówkiem składanym linia po linii; przenikające się
   zdania („o czym rozmawialiśmy?”); **szczyt** — karteczki z pytaniami lecą na swoje miejsca
   i składają się w cztery dokumenty (stan, dziennik, lekcje, decyzje) — najdłuższy odcinek, nie do
   przeskoczenia jednym ruchem (sekcja 8); plan; okno w przechyle 3D prostujące się do pasków; taśma
   fiszek komend (liczba z `fakty.json`, nie wpisana ręcznie); zamknięcie z reflektorem
   i konfiguratorem. Tekst każdego aktu w HTML od początku, ruch dokłada silnik.
5. **Makiety pasków i panelu** — moduł wspólny (np. `site/js/makiety.js` albo generowany przy
   budowie do `site/dane/`), rysowany kodem `core/panel/*.mjs` na danych przykładowych z widocznym
   oznaczeniem „dane przykładowe” (sekcja 5); bez barw i miar przepisanych ręcznie. Ten sam moduł
   wykorzysta Biurko w E6.
6. **Ekran ładowania** — `site/film/` + `site/css/film.css`: zaprojektowany w języku Filmu (nie
   kręciołek), zasłania stany pośrednie (fonty, pierwsze ułożenie, silnik) i schodzi jednym
   przejściem dopiero, gdy hero jest gotowe; bez JS i przy błędzie silnika treść jest widoczna od
   razu, ekran nigdy nie zostaje na stałe (limit czasu).
7. **Kalibracja hero przed resztą drogi** — jeden wariant hero Filmu na zrzucie PL 1366 × 768 obok
   `docs/zasoby/film/kalibracja/E1-klatka.png` i hero Biurka; dalsze akty dopiero po werdykcie
   Łukasza (zasada 15). Klatki przyjęte → `docs/zasoby/STRONA/builds/film/kalibracja/` (JPEG).
8. **Testy** — `site/film/*.test.mjs` i `site/narzedzia/zbuduj.test.mjs`: generator daje cztery
   strony (Biurko i Film × EN i PL) z poprawnym `lang`, `hreflang` i ścieżkami względnymi do
   `vendor/`; liczba fiszek w Filmie równa liczbie komend z faktów; makiety: barwy z
   `core/panel/theme.mjs` (test wierności jak w filmie 3.0.0); stany ekranu ładowania (gotowe /
   błąd / limit czasu). *(subagent)*
9. **Bramka „Biurko czy Film”** — kadry obu prototypów w tych samych punktach historii (hero,
   szczyt, panel / paski, instalacja), PL 1366 × 768, obok siebie w
   `docs/zasoby/STRONA/builds/film/kalibracja/porownanie-*.jpeg`, plus liczby obu (MiB, p95 klatki,
   czas do zejścia ekranu ładowania / pierwszego kadru). Pytanie AskUserQuestion, w którym każda
   opcja cytuje definicję wariantu z sekcji 4 planu i skutek z Aneksu C pkt 3–4 (L-0228).
10. **`site/README.md`** — Film w tabeli „Co gdzie leży”, budowa czterech stron, silnik
    w `vendor/scrollcraft/`, ekran ładowania, pomiar budżetu Filmu.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_5.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [x] `node --test "site/**/*.test.mjs"` kończy się bez błędów, liczba testów ≥ 162 (E4, `FAKT`)
      plus nowe testy Filmu; kontrola pozytywna: generator z podmienioną ścieżką `vendor/` albo
      liczba fiszek o jeden mniejsza musi wywrócić test.
- [x] Silnik bez zmian: `sha256sum` plików w `site/vendor/scrollcraft/` równy sumom kopii pluginu
      i wpisowi w `VERSION`; `LICENSE` to tekst MIT; karta zgody na pobranie licencji pokazana,
      odpowiedź Łukasza zacytowana we wpisie.
- [x] Biurko nietknięte (dowód negatywny): sumy `sha256sum` plików `site/biurko/*`,
      `site/zasoby/**`, `site/vendor/three/**`, `site/css/strona.css`, `site/index.html`
      i `site/pl/index.html` zapisane w katalogu roboczym **na starcie etapu** (przed pierwszą
      zmianą, niezależnie od tego, czy E4 jest już w commicie) i porównane na końcu, po
      `node site/narzedzia/zbuduj.mjs` — zero różnic; kontrola pozytywna: plik z dopisaną spacją
      daje jedną różnicę.
- [x] Bez WebGL i bez zdjęć: w `site/film/`, `site/css/film.css` i `szablon-film.html`
      `grep -rn "webgl\|getContext\|three\|\.jpe\?g\|\.png\|\.webp\|\.mp4"` nie trafia nic poza
      odnośnikami do `site/grafika/` (kontrola pozytywna: ten sam grep na `site/biurko/` trafia).
- [x] Kalibracja hero: zrzut hero Filmu PL 1366 × 768 pokazany Łukaszowi obok `E1-klatka.png`
      i hero Biurka, z rozbiorem (krój, rytm, detal, ruch — L-0220/L-0226); werdykt zacytowany we
      wpisie; uwagi wdrożone przed resztą aktów.
- [x] Siedem punktów historii obecnych w Filmie: dla każdego aktu zrzut PL 1366 × 768 z ustalonego
      kadru (L-0182) i lista „tekst aktu w DOM przed startem silnika” (pobranie strony bez JS —
      `curl` — zawiera nagłówek, zdania szczytu, komendę instalacji i konfigurator).
- [x] Ekran ładowania: przy zimnym wejściu (nowa strona, pamięć podręczna wyłączona) kadr przed
      jego zejściem nie pokazuje stanów pośrednich (zrzuty co 100 ms do zejścia); z silnikiem
      podmienionym na plik z błędem w `initScript` ekran schodzi w ≤ limitu, treść widoczna,
      `console.error` tylko z podłożonego błędu (pierwsza asercja to tryb — L-0213).
- [x] Szczyt nie do przeskoczenia: przewinięcie jednym ruchem kółka (`deltaY` 1000) zatrzymuje się
      wewnątrz aktu szczytu, nie za nim (pozycja z silnika przed i po).
- [x] Budżet i płynność (`FAKT`): pierwsze wejście Filmu w MiB tym samym instrumentem co Biurko
      (`site/README.md`), obok 9,49 MiB Biurka; przy CPU ×4 p95 klatki w ruchu ≤ 26 ms przez całą
      drogę; czas do zejścia ekranu ładowania przy zimnym wejściu.
- [x] Konsola bez błędów i nieudanych żądań przy wejściu, pełnym przewinięciu i konfiguratorze
      (PL i EN, obie wersje); żądania tylko `localhost` i `api.github.com`.
- [x] Podstawy bezpieczeństwa:
      `grep -rn --exclude="*.test.mjs" "innerHTML\|outerHTML\|insertAdjacentHTML\|document.write" site/js site/biurko site/film`
      kończy się kodem 1, a bez `--exclude` trafia `site/js/wersja.test.mjs` (kontrola pozytywna);
      kod z `site/vendor/` ładowany wyłącznie ze ścieżek względnych, bez CDN; formularz bez
      `action`/`method`; silnik skopiowany — jedyne `fetch` w `scrollcraft.js` (FAKT 0.3.1, wiersz
      ok. 660) dociąga klip z `data-sc-src`; Film klipów nie ma: `grep -rn "data-sc-src" site/film site/narzedzia/szablon-film.html`
      nie trafia nic, a ten sam grep na kopii silnika trafia (kontrola pozytywna).
- [x] **Bramka „Biurko czy Film”:** kadry porównania i liczby obu wersji pokazane Łukaszowi
      w otwartym oknie; odpowiedź zacytowana we wpisie i w `STATUS.md` (bramka ROZSTRZYGNIĘTA);
      opcje pytania cytowały definicje wariantów z sekcji 4 (L-0228).
- [x] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy”, podpis
      `Autor: RelAI (Opus 5.5) + Lukasz`; ryzyka T1, T2, T3 zaktualizowane; `docs/STATE.md`
      zaktualizowany.
- [x] Katalog roboczy `.claude/relai/work/STRONA_RELAI/E5/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po
      w sekcji „Zweryfikowane” wpisu. Artefakty poza katalogiem (serwer podglądu w tle, strony
      DevTools, pobrana licencja, jeśli trafiła do `%TEMP%`) wypisane z nazwy razem z tym, co się
      z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/STRONA_RELAI/STATUS.md`: E5 → ZREALIZOWANY (data); bramka „Wybór wersji”
   ROZSTRZYGNIĘTA z cytatem; przy wyborze **Biurka** E6 → GOTOWY DO STARTU, przy wyborze **Filmu**
   E6 → `POMINIĘTY — wybrany Film (Aneks C pkt 3)` i E7 → GOTOWY DO STARTU; linia w dzienniku
   wdrożenia; link do nowego promptu w kolumnie `Prompt` po kroku 5.
1a. Katalog roboczy `.claude/relai/work/STRONA_RELAI/E5/` — raport, „tak”, kasowanie; liczby przed
   i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”, podpis
   `Autor: RelAI (Opus 5.5) + Lukasz`. Zaktualizuj tabelę ryzyk (T1 po pomiarze płynności Filmu,
   T2 po kalibracji, T3 po budżecie); dopisz lekcje z etapu do `docs/LEKCJE.md` i odśwież
   „Zasady aktywne”.
3. Bramki manualne: pozycje „Do zrobienia przez człowieka” z wpisu → sekcja „Bramki manualne”
   `STATUS.md`, status `OTWARTA`.
4. `docs/STATE.md` — stan strony (dwa prototypy, wybór); `CLAUDE.md` — wiersz planu w tabeli
   „Stan prac” i linia „Aktywny plan”; `site/README.md`, gdy zmienił się sposób budowy albo
   weryfikacji.
5. **Wygeneruj prompt następnego etapu** w tym folderze, ze specyfikacji promptu etapowego
   (`.claude/relai/templates/SPEC_PROMPT_ETAPU.md`): przy wyborze Biurka `PROMPT_ETAP_6.md` na bazie
   `PLAN.html` sekcja 6 (dawny E2 „Biurko: pełna droga, szczyt, szuflady”, numeracja wg Aneksu C;
   materiał niewykonanego promptu w commicie `a097b35`); przy wyborze Filmu `PROMPT_ETAP_7.md` na
   bazie sekcji 6 (dawny E4 „Dopieszczenie wybranej”) i Aneksu C pkt 4 (ekran ładowania wybranej
   wersji). W obu: realny stan `site/` po tym etapie, werdykt bramki i lekcje z tego etapu.
6. Commit — propozycja, conventional message po angielsku (np. `feat: film prototype with loading screen (STRONA_RELAI E5)`); `.claude/launch.json` i cudze zmiany PANEL_CODEX poza commitem.
