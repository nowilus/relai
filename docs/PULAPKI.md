# PUŁAPKI — budowa RelAI

Rzeczy, które zaskoczyły i zaskoczą znowu: zachowania narzędzi, kolejności kroków, wymogi
środowiska. Czytaj **na żądanie** — zanim uznasz, że coś jest zepsute. Najnowsze u góry.

Ten plik **nie jest czytany przy starcie sesji** i nie liczy się do budżetu warstwy startowej.
Specyfikacja: `SPEC_PULAPKI.md`.

## Pułapki

### P-043 — Aplikacja desktopowa: układ modu liczy się jak CSS, nie jak Ink — tekst nie zwęża się poniżej najdłuższego słowa · 2026-10-14 · AKTYWNA

- **Objaw:** w wąskim panelu podziału okna przycisk „Otwórz” wypada za prawą krawędź kafla, choć
  dostał `flexShrink={0}`, a test układu (model Yoga: wszystko kurczy się do zera) jest zielony;
  „przekazania /relai-handover” stoi w jednej linii szerszej niż wiersz; nagłówek Kalam obok
  „Rozwiń” wypycha przycisk z karty, a w innym miejscu ten sam nagłówek rysuje się pomniejszony.
- **Przyczyna (odnoga PANEL_WASKI, aplikacja 2.37337.1.0, Claude Code 2.1.295, Windows; zrzuty
  `docs/zasoby/PANEL_RELAI/zrzuty/PANEL_WASKI_*`):** typy nazywają propsy `Box` „Ink's Box”, ale
  desktop układa je jak CSS flex:
  1. element flex nie zwęża się poniżej swojej treści minimalnej (`min-width: auto`): tekst —
     poniżej najdłuższego słowa (łamanie także po łączniku: „/relai-” „changelog”), przycisk —
     poniżej etykiety; wiersz bez `flexWrap`, który się nie mieści, wychodzi poza rodzica i jest
     przycinany na jego krawędzi;
  2. spacja na **początku** zagnieżdżonego `Text` (`' /relai-handover'`) nie jest miejscem
     łamania — skleja kawałek z poprzednim słowem, także przez łącznik;
  3. `Svg` o stałej szerokości postawione wprost w wierszu trzyma swoją szerokość; we własnym
     `Box` skaluje się do szerokości tego pudełka (przycięcie do 100% rodzica);
  4. tekst proporcjonalny: ~6,8 px CSS na znak przy komórce 8,2 px (P-024 pkt 3) — znak to mniej
     niż komórka; natywny przycisk dokłada ~3 komórki do etykiety;
  5. zawinięte linie przycisków bez `rowGap` stykają się (natywny przycisk 28 px, P-021 pkt 6).
- **Obejście:** przycisk i ikona w `Box flexShrink={0}`; tekst obok przycisku w wierszu, który
  przy wąskim panelu przenosi przycisk pod tekst (jedna decyzja dla całego panelu wg
  `bodyColumns`, nie wiersz po wierszu); kawałki tekstu w osobnych elementach zawijanego wiersza
  z `columnGap`, nigdy ze spacją na początku; rysunek obok przycisku we własnym `Box`;
  `rowGap` w zawijanym rzędzie przycisków. Instrument: `panel/hooks/narrow.test.ts` (model CSS
  skalibrowany na zrzutach, kontrola pozytywna na każdym objawie).
- **Zasięg:** aplikacja desktopowa 2.37337.1.0, zakładka Code; terminal (Ink) niezmierzony —
  testy terminalowe panelu zielone.

### P-042 — Aplikacja desktopowa: motyw jasny/ciemny widzą klucze motywu i ramka `Svg`, mod go nie widzi · 2026-10-14 · AKTYWNA

- **Objaw:** po przełączeniu aplikacji na wygląd jasny paski RelAI zostają ciemne (kolory
  szesnastkowe), a mod, który chciałby wybrać paletę, nie ma skąd wiedzieć, że wygląd się zmienił:
  wiersz `theme` z `$.config.list()` dalej mówi `dark`, `config.set` nie przychodzi.
- **Przyczyna (sonda `relai-motyw-sonda` 0.1.0–0.2.0, plan WYGLAD_PANELU E1; aplikacja
  2.37337.1.0, Claude Code 2.1.295, Windows):**

  | Co mierzone | Wygląd ciemny | Wygląd jasny | Wynik |
  |---|---|---|---|
  | 23 klucze `ThemeKey` jako `color`, `backgroundColor`, `borderColor` w `AbovePrompt` | kolory motywu ciemnego | kolory motywu jasnego, bez przeładowania | **działa** |
  | to samo w `Pane` | jak wyżej | jak wyżej | **działa** |
  | `inverseText` | prawie czarny | biały na białym tle — niewidoczny | **nie używać** |
  | klucz nieznany (`relaiNieMa`) | kolor tekstu domyślnego, tła brak | jak wyżej | cisza zamiast błędu |
  | surowy `#ff00ff` (kontrola pozytywna) | różowy | różowy | działa |
  | wiersz `theme` z `$.config.list()` po zmianie wyglądu aplikacji | `dark` | `dark` | **nie odzwierciedla** |
  | `config.set` przy zmianie wyglądu aplikacji | — | 0 zdarzeń | **nie przychodzi** |
  | `$.config.set({ key: 'theme', value: 'light' })` przy wyglądzie ciemnym | zapisuje (`value: light`) | — | kolory bez zmian: na desktopie wiersz `theme` nie rządzi kolorami |
  | odczyt `$.config.list()` tuż po własnym `$.config.set` | — | — | zwraca jeszcze wartość poprzednią |
  | `e.props.view` w `ui.render` | `{}` | `{}` | żadnej wskazówki |
  | `@media (prefers-color-scheme)` w `Svg` z `isInteractive` | „widzi CIEMNY” | „widzi JASNY” | **działa** |
  | to samo w `Svg` jako obrazie (z niepustym `alt`) | „widzi CIEMNY” | „widzi JASNY” | **działa** |
  | SMIL (`animateTransform`, `animate`) i animacja CSS w `Svg` z `isInteractive` w paśmie | ruch | ruch | działa |
  | `Button` w paśmie: zmiana stanu w `$.state` i przerysowanie | tak | tak | działa |
  | `Button` z dziećmi `Text` w kolorze / z podkreśleniem (także `plain`) — sonda `relai-przyciski-sonda` 0.1.0 | etykieta domyślna | etykieta domyślna | **ignorowane**: desktop rysuje natywną etykietę |
  | `Button` `variant` primary / secondary, `dimColor`, `plain` | rysowane | rysowane | `plain` na desktopie to przycisk-duch bez obudowy |
  | `primary` obok `secondary` w paśmie | ta sama wysokość (25 px na zrzucie, y 221–245) | — | `secondary` w ciemnym wyglądzie tonie w pasku i **wygląda** na niższy — w paskach RelAI wszystkie przyciski `primary` |
  | `Box` z ramką lub tłem w kluczu i `hover` (`borderColor`, `backgroundColor`) wokół `plain` — sonda 0.2.0 | działa | działa | ale pod kursorem i tak widać osobny natywny przycisk w środku; „przycisk, który jest tylko wrapowany jakimś borderem” (Łukasz) |

- **Obejście:** `Box`/`Text` pasków malujesz kluczami motywu (`text`, `subtle`, `inactive`,
  `success`, `warning`, `error`, `promptBorder`, `claude`, `suggestion`, `permission`) — desktop
  przemalowuje je sam. Znacznik w `Svg` niesie obie palety w CSS: wartość ciemna domyślnie,
  jasna w `@media (prefers-color-scheme: light)` — przełącza się z wyglądem aplikacji, bez kodu
  w modzie. Kolor surowy w `Box`/`Text` (np. paleta panelu RelAI) nie ma drogi do wyglądu
  aplikacji: wybór szaty wymaga przełącznika albo kluczy. Przycisk projektujesz wyłącznie
  natywnym `variant` i `plain` — kolor etykiety i ramka wokół nie dają innego przycisku.
- **Zasięg:** aplikacja desktopowa 2.37337.1.0, zakładka Code, Windows; terminal niezmierzony
  (tam klucze działają natywnie, `Svg` nie ma). Zrzuty:
  `docs/zasoby/PANEL_RELAI/zrzuty/WYGLAD_PANELU_E1_sonda_1…6_*.png`.

### P-041 — Aplikacja desktopowa: pole „następny krok” z przyciskami zasłania paski modów · 2026-10-14 · AKTYWNA

- **Objaw:** sesja kończy turę polem „następny krok” z pytaniem i przyciskami (narzędzie `wrap_up`
  z `ask`/`actions`), a człowiek ma właśnie zrobić zrzut pasków nad promptem — paski RelAI znikają
  z widoku, dopóki pole stoi (Łukasz, odnoga KOMUNIKAT_ZWROTU, 2026-10-14: „jak dajesz te swoje nowe
  okno z możliwością kliknięcia w przyciski … to znikają moje panele z podglądu”).
- **Przyczyna:** pole i paski modów (`AbovePrompt`) zajmują to samo miejsce nad polem wpisywania.
- **Obejście:** przy pomiarze na żywo pasków turę kończysz zwykłym tekstem, bez pola z pytaniem;
  pytanie zadajesz w treści odpowiedzi albo dopiero po zrzucie.
- **Zasięg:** aplikacja desktopowa 2.37337.1.0, zakładka Code.

### P-040 — Aplikacja desktopowa: w podziale okna paski modów rysuje tylko lewy panel · 2026-10-13 · ROZWIĄZANA 2026-10-14

- **Rozwiązanie (odnoga SPLIT_VIEW, pomiar Łukasza 2026-10-14):** aplikacja 2.37337.1.0, Claude
  Code 2.1.295 — te same wersje, przy których błąd jeszcze występował. Poprawka przyszła więc po stronie
  strony zakładki Code (claude.ai), po zamknięciu anthropics/claude-code#99265 (2026-10-14).
  Zmierzone: dwa panele obok siebie, dwa jeden nad drugim, trzy obok siebie — w każdym panelu
  paski (`relai-cache-keeper` także w sesjach spoza RelAI); sesja RelAI w **prawym** panelu ma
  plan, postęp i cache, a `/relai-panel` otwiera tam `Pane`. Zrzuty:
  `docs/zasoby/PANEL_RELAI/zrzuty/SPLIT_VIEW_1…4`. Linia w stopce wycofana (`relai-cache-keeper`
  0.9.0 czyści ją raz — pkt 6 sondy niżej; `relai-panel` 0.17.0). Pkt 3 sondy (`SessionMode`,
  `PromptHint`) niezmierzony ponownie — zostaje jako stan z 2026-10-13.

- **Objaw:** dwie sesje Code w podziale okna (split view). Paski RelAI (plan, postęp, cache) widać
  tylko w lewym panelu; w prawym nie ma żadnego, także paska cache, który działa w każdym folderze.
  Przeniesienie sesji na lewą stronę przenosi paski razem z nią; aktywny (focused) prawy panel też
  jest pusty.
- **Przyczyna:** mody działają w każdej sesji osobno — `relai-panel` pisał pomiar kosztów sesji
  z prawego panelu co turę (`.claude/relai/pomiary/<data>-<sesja>.jsonl`). Proces aplikacji
  (`app.asar` 2.31226.1.0) obsługuje każdą sesję (`servesUiSurface`, zdolność `ui_surface_v1`)
  i rysuje jej paski na prośbę strony: `EngineSurface.uiRender(sessionId, …)` przez IPC. Stronę
  zakładki Code aplikacja wczytuje z claude.ai i to ona prosi o paski tylko dla pierwszego panelu
  podziału. API modów nie mówi modowi, w którym panelu stoi jego sesja — mod nie ma czym tego
  obejść.
- **Obejście:** równoległe projekty trzymaj w **osobnych oknach** (pop-out z menu sesji
  w pasku bocznym) — każde okno rysuje paski swojej sesji (zmierzone: trzy paski w oknie
  pop-out). W podziale okna sesja z paskami RelAI stoi w lewym panelu. Poprawka należy do
  Anthropic: zgłoszenie anthropics/claude-code#99265 (otwarte od 2026-10-11; warunek strony
  `isPanelActive`, prawdziwy tylko dla lewego panelu; nasz pomiar 2.31226.1.0 dopisany w komentarzu
  2026-10-13). `Pane` z `$.ui.open` gaśnie tak samo.
- **Sonda Windows (odnoga `PASKI_W_STOPCE`, 2026-10-13, mod `relai-paski-sonda` z licznikami):**
  1. Paski rysuje tylko **pierwszy** panel podziału — przy trzech panelach środkowy jest pusty jak
     prawy.
  2. **`$.ui.status` rysuje się wszędzie:** w pierwszym i prawym panelu, w oknie pop-out; odświeża
     się w prawym panelu (licznik `#2` → `#3`). To jedyna powierzchnia RelAI w prawym panelu.
  3. `SessionMode`: hook wołany (2–5 razy na turę), dopisana etykieta **nie rysuje się nigdzie**;
     `PromptHint`: hook ani razu nie wołany. Wbrew zgłoszeniu #99265 obie odpadają na Windows.
  4. Prośby o `AbovePrompt` przychodzą w każdym położeniu (pierwszy panel 12, prawy 6, pop-out
     z prawym naraz 9 na turę) — mod **nie odróżni** panelu po prośbach o paski.
  5. Stopka pokazuje linie statusu kilku pluginów w kolejności wczytania, każdą z szarą nazwą
     pluginu przed tekstem (silnik, nie do zmiany); nadmiar ponad szerokość panelu ucina albo
     chowa pod „+N” (okienko „Plugin status lines” po najechaniu).
  6. Linia statusu przeżywa przeładowanie moda: mod, który ją ustawił i przestał, zostawia starą
     — trzeba ją wyczyścić `$.ui.status(undefined)`. `session.start` nie odpalił przy hot reload.
- **Rozwiązanie RelAI (`relai-cache-keeper` 0.7.0 / `relai-panel` 0.15.0):** jedna linia
  statusu w stopce każdej sesji — `<praca sesji a/b etapów> · cache … · 5 h … % · tydz. … % ·
  kontekst …`. Składa ją `relai-cache-keeper` (jeden plugin, bo widać jedną linię), plan bierze
  z pliku `.claude/relai/stopka/<sesja>.txt`, który pisze `relai-panel`; tekst w `core/panel/footer.mjs`.
  W pierwszym panelu i w pop-oucie linia powtarza część pasków — świadoma decyzja Łukasza.
- **Zasięg:** aplikacja desktopowa 2.31226.1.0, Claude Code 2.1.295, Windows 11; pomiar Łukasza
  2026-10-13 (zamiana paneli, okno pop-out, trzy panele). Terminal i VS Code niezmierzone.

### P-039 — `String.replace(wzorzec, napis)` czyta `$`` i `$'` w napisie zastępczym · 2026-10-12 · AKTYWNA

- **Objaw:** skrypt wklejał „Zasady aktywne” z `docs/LEKCJE.md` w miejsce znacznika promptu etapu
  przez `prompt.replace(MARKER, blok)`. Znacznik zniknął, ale nagłówki promptu wystąpiły po trzy
  razy, a wklejonego bloku nie dało się znaleźć w pliku.
- **Przyczyna:** w napisie zastępczym `replace` traktuje `` $` `` jako „tekst przed dopasowaniem”,
  `$'` jako „tekst po”, `$&` jako „dopasowanie”. Zasada 13 rejestru lekcji zawiera `` `$` `` —
  w miejscu każdego wystąpienia wkleił się cały początek pliku.
- **Obejście:** wklejaj cudzy tekst sklejaniem (`pre + blok + post`) albo funkcją
  (`replace(MARKER, () => blok)`), nigdy napisem. Dowód wyniku: każdy nagłówek dokładnie raz
  i blok obecny dokładnie raz, porównany ze źródłem (zasada 5, L-0164).
- **Zasięg:** JavaScript (`String.prototype.replace` i `replaceAll`); ten sam mechanizm ma `sed`
  (`&`, `\1`) i `re.sub` w Pythonie (`\g<0>`). Źródło: FILM_PREZENTACYJNY E5, generacja
  `PROMPT_ETAP_6.md`.

### P-038 — SVG: `pathLength` z `vector-effect="non-scaling-stroke"` tnie kreskę na kawałki · 2026-10-12 · AKTYWNA

- **Objaw:** podkreślenie rysowane animacją `strokeDasharray="1 1"` i `strokeDashoffset` na ścieżce
  z `pathLength={1}` i `vectorEffect="non-scaling-stroke"` w SVG rozciągniętym `preserveAspectRatio="none"`
  wychodzi jako rząd kresek pod słowami, nie jedna linia rysowana od lewej.
- **Przyczyna:** `non-scaling-stroke` liczy kreskę w przestrzeni ekranu, a `pathLength` normalizuje
  długość w przestrzeni użytkownika; po rozciągnięciu SVG wzór kreskowania przestaje odpowiadać
  długości ścieżki.
- **Obejście:** linię w rozciąganym SVG odsłaniasz przycięciem (`clipPath: inset(-50% <reszta>% -50% 0)`),
  jak pytania sceny 2 (`Pytania.tsx`); `pathLength` z kreskowaniem zostawiasz dla SVG bez
  `non-scaling-stroke` (pętle, strzałki).
- **Źródło:** FILM_PREZENTACYJNY E3, 2026-10-12 (scena 1 i nagłówek panelu w scenie 3).

### P-037 — `node --test` uruchomiony z wnętrza `node --test` nie drukuje podsumowania · 2026-10-12 · AKTYWNA

- **Objaw:** test filmu, który odpala zestaw testów rdzenia przez `spawnSync`, czytał z wyjścia
  liczby `ℹ pass` i `ℹ fail` i dostawał `NaN`. Proces potomny kończył się kodem 0.
- **Przyczyna:** proces potomny dziedziczy zmienną `NODE_TEST_CONTEXT` rodzica i raportuje do jego
  runnera protokołem wewnętrznym, zamiast drukować własne podsumowanie.
- **Obejście:** potomka uruchamiasz ze środowiskiem bez `NODE_TEST_CONTEXT` i z jawnym
  `--test-reporter=spec` (`skrypty/manifest.mjs` filmu, `runCoreTests`). Liczby czytasz
  z podsumowania i zatrzymujesz się na `NaN`, nie na samym kodzie wyjścia.
- **Źródło:** FILM_PREZENTACYJNY E2, 2026-10-12.

### P-036 — `node --test <katalog>/` w Node 24 i `python -` w Git Bash · 2026-10-12 · AKTYWNA

- **Objaw:** `node --test testy/` kończy się `MODULE_NOT_FOUND` i raportem „tests 1, fail 1” bez
  żadnego testu z pliku; `python - <<'EOF'` w Bashu sesji wisi do limitu czasu narzędzia.
- **Przyczyna:** Node 24.13.1 bierze katalog podany wprost jako moduł do uruchomienia, nie jako
  miejsce wyszukiwania testów. `python` na tej maszynie to alias sklepu Windows, który czeka na
  wejście zamiast uruchomić interpreter.
- **Obejście:** testy wskazuj wzorcem pliku (`node --test testy/*.test.mjs`) i patrz na liczbę
  testów w raporcie, nie na sam kod wyjścia. Skrypty piszesz w Node narzędziem Write; Pythona nie
  wołasz z heredoku.
- **Źródło:** FILM_PREZENTACYJNY E1, 2026-10-12.

### P-035 — Remotion / Chromium: tekst rozmyty przy najeździe kamery · 2026-10-12 · AKTYWNA

- **Objaw:** w klatce zbliżenia (`scale` 2–3 na warstwie sceny) tekst pasków jest miękki jak
  powiększone zdjęcie, choć klatka bez zbliżenia jest ostra.
- **Przyczyna:** element w środku powiększanej warstwy z transformacją 3D (`perspective`,
  `rotateX`) albo z `backdrop-filter` dostaje własną warstwę kompozycji, rasteryzowaną w skali 1;
  kamera powiększa jej bitmapę, a nie przelicza tekstu. Zwykła transformacja 2D na warstwie
  kamery (`translate` + `scale`, bez `will-change`) jest rasteryzowana w skali docelowej.
- **Obejście:** po zakończeniu ruchu element nie niesie żadnej transformacji (`transform: 'none'`,
  także po sprężynie z przeregulowaniem — warunek na `|1 − k| < 0,001`, nie na `k < 1`); szkło bez
  `backdrop-filter`. Ostrość sprawdzasz na klatce największego zbliżenia (`remotion still --frame`).
- **Źródło:** FILM_PREZENTACYJNY E1, 2026-10-12 (klatka 165, zoom 2,8); lekcja L-0171.

### P-034 — Skill się nie wyzwolił albo wyzwala się za często · 2026-10-12 · AKTYWNA

- **Objaw:** sesja nie zrobiła rytuału, nie otworzyła planu albo nie zaproponowała procedury, choć
  fraza pasuje do opisu skilla; albo odwrotnie — skill planów rusza przy „zaplanuj mi spotkanie”.
  Wniosek „opis jest zły” pada zwykle za wcześnie, bo wyzwolenie zależy od kilku warstw naraz.
- **Przyczyna:** wyzwolenie skilla jest decyzją modelu na podstawie opisu (do 1 024 znaków, trzecia
  osoba, L-0114) — warstwą zawodną; to, co ma działać zawsze, niesie hook albo `CLAUDE.md` (L-0030).
  Pomiar sam bywa źródłem fałszu: zła wersja pluginu (P-005), prompt obcięty powłoką (P-002), limit
  tur kończący sesję przed mierzonym krokiem (L-0113), brak logowania CLI w procesie potomnym
  aplikacji (P-032), siatka hooka odpowiadająca na tożsamość gita mierzącego zamiast na prompt
  (L-0170 — narzędzie zakłada w kopii fixtury repozytorium z `user.name = tester`).
- **Obejście — w tej kolejności:**
  1. **Wersja:** którą treść skilla sesja wykonała — ścieżka pluginu w zdarzeniu `init`
     (`--output-format stream-json --verbose`), nie komunikat CLI (P-005, L-0085).
  2. **Logowanie:** `claude -p` z Basha sesji aplikacji kończy się „Failed to authenticate” —
     przebieg wymaga `claude auth login` w zwykłym terminalu (P-032). Kod wyjścia każdej sesji
     czytasz, zanim policzysz wynik.
  3. **Warstwa:** zachowanie, które ma działać zawsze, sprawdzasz w hooku i `CLAUDE.md`, nie w opisie
     skilla (L-0030); cisza hooka bez kontroli pozytywnej w tym samym przebiegu nic nie dowodzi.
  4. **Pomiar:** `node core/tools/eval-triggers.js --model <alias>` na zestawie
     `core/evals/triggers.json` (prompt przez stdin — P-002; ustawienia i pluginy użytkownika
     wyłączone; limit tur na cały łańcuch — L-0113); `--baseline` daje zachowanie bez pluginu,
     `--plugin-dir <worktree>` — starą wersję opisu do porównania w jednym przebiegu.
  5. **Poprawka opisu:** fraza pozytywna, której brakuje, albo zawężenie frazy ogólnej do projektu
     RelAI; opis ≤ 800 znaków, bez `<` `>` (walidator); po zmianie — ten sam zestaw na modelach
     `strong` i `balanced` z listy (D-90), wynik do `docs/archiwum/pomiary/`.
- **Zasięg:** Claude Code (skille `relai-core`, `relai-planning`); Codex czyta te same opisy przez
  generator. Źródło: odnoga AUDYT_SKILLI (S5), lekcje L-0030, L-0085, L-0113, L-0114.

### P-033 — Deep link `claude://code/new` wpisuje prompt, a `/` na jego początku zamienia na `／` · 2026-10-12 · AKTYWNA

- **Objaw:** karta panelu otwiera nową sesję linkiem `claude://code/new?folder=…&q=/relai:relai-stage
  TEMAT EN`; w polu stoi komenda, Enter ją wysyła, ale hook `command.run` jej nie widzi, znacznik
  zgody nie powstaje, a model sam woła skill `relai-stage` i procedura pyta „Zaczynamy?”.
- **Przyczyna (aplikacja 2.31226.1.0, Claude Code 2.1.295, Windows 11; pomiar odnogi NOWA_SESJA
  2026-10-11 i 2026-10-12):**
  1. Link tworzy nową sesję **w tym samym oknie** (pozycja w sidebarze) z promptem **wpisanym, nie
     wysłanym**; aplikacja przejmuje fokus. Stara rozmowa zostaje nietknięta.
  2. **Początkowe `/` w `q` aplikacja zamienia na ukośnik pełnej szerokości U+FF0F (`／`).** Na ekranie
     wygląda tak samo; pierwsza wiadomość nowej sesji w transkrypcie zaczyna się od U+FF0F. Enter
     wysyła więc tekst (hook `prompt.submit`, `origin` `composer`), nie komendę. Pomiar B2
     z 2026-10-11 („`/relai-stage` wpisane”) tego nie wychwycił — patrzył na ekran, nie na kod znaku.
  3. Przy każdym otwarciu linku aplikacja pyta o zaufanie do folderu (dwa pomiary 2026-10-12,
     folder dawno zaufany).
  4. Sesja nie istnieje do pierwszego Entera: nie ma jej w `list_sessions` ani pliku transkryptu,
     a `session.start` moda w nowej sesji przychodzi dopiero z Enterem.
  5. Nowa sesja startuje na modelu wybranym w aplikacji, nie na modelu sesji, z której kliknięto.
- **Obejście:** hook `prompt.submit` panelu rozpoznaje tekst `／relai-stage TEMAT EN` (albo z `/`
  i z `relai:`) wpisany z klawiatury i — przy ważnym pliku zgody karty — uruchamia komendę własną
  wysyłką `$.command.run` ze znacznikiem, a prompt odrzuca (`drop`); bez pliku tekst idzie dalej
  i procedura pyta. Pytanie o zaufanie i Enter to jedyne ruchy człowieka. Niezmierzone: czy
  `rundll32 url.dll,FileProtocolHandler` zwraca błąd, gdy schemat `claude://` nie ma obsługi
  (przegląd kodu sugeruje kod 0 — wtedy panel mówi „Otwarto…”, a zgoda wygasa po 10 min).
- **Zasięg:** aplikacja desktopowa 2.31226.1.0, Claude Code 2.1.295, Windows 11; macOS i Linux
  (`open`, `xdg-open`) tylko w testach. `claude.exe` w katalogu aplikacji to aplikacja — P-025.

### P-032 — `claude -p` uruchomione z sesji aplikacji desktopowej nie jest zalogowane · 2026-10-12 · AKTYWNA

- **Objaw:** `claude -p --session-id U "/relai-stage NIEMA E1"` binarką 2.1.295 z Basha sesji
  w aplikacji kończy się kodem 1 po 7 s z odpowiedzią „Failed to authenticate: OAuth session expired
  and could not be refreshed”; plik sesji U powstaje (prompt i ta odpowiedź), tura modelu nie rusza.
  Łańcuch `-p` → `claude --desktop --resume U` / `claude://resume?session=U` nie ma więc czego
  przenieść do aplikacji.
- **Przyczyna:** sesję aplikacji uwierzytelnia host (`CLAUDE_CODE_SDK_HAS_HOST_AUTH_REFRESH=1`,
  `CLAUDE_CODE_ENTRYPOINT=claude-desktop`), a proces potomny tego logowania nie dziedziczy:
  `claude auth status` daje `"loggedIn": false` zarówno dla `claude` na PATH (2.1.280), jak i dla
  binarki aplikacji 2.1.295 (`%APPDATA%\Claude\claude-code\2.1.295\<hash>\claude.exe`).
- **Obejście:** nowej sesji z gotową rozmową bez Entera ten łańcuch nie daje — **nie działa, bo
  CLI wołane z wnętrza aplikacji (Bash sesji, `$.process.run` moda) nie ma logowania aplikacji**,
  a osobne `claude auth login` musiałby zrobić każdy użytkownik. Panel startuje etap w nowej sesji
  deep linkiem `claude://code/new` (jeden Enter człowieka), a bez Entera — dopiero narzędziem
  `start_session`, gdy aplikacja je odda (odnoga NOWA_SESJA, N1 i N3). Import samej sesji
  (`--desktop --resume`) nie był mierzony: decyzja Łukasza 2026-10-12 — liczy się desktop.
- **Zasięg:** Claude Code 2.1.295 i 2.1.280, aplikacja desktopowa 2.31226.1.0, Windows 11; pomiar
  N0 odnogi NOWA_SESJA, 2026-10-12. Numer P-032, bo gałąź `codex/panel-codex` zajęła P-024…P-031.

### P-026 — Silnik modów Claude Code 2.1.295: nagłówek karty 12 znaków, brak kasowania plików, id sesji po `/clear` · 2026-10-11 · AKTYWNA

- **Objaw:** karta `$.ui.ask` z nagłówkiem „Próg limitu tygodnia” odpowiada pod nagłówkiem
  „Próg limitu ” i atrapa testu nie rozpoznaje karty; przycisk „Odrzuć” nie ma czym skasować
  pliku wznowienia; odpowiedź na kartę po `/clear` zapisuje plik sesji poprzedniej rozmowy.
- **Przyczyna (2.1.295, LIMIT_CHECKPOINT E4, `claude plugin test` i typy silnika):**
  1. **Nagłówek karty (`header`) jest ucinany do 12 znaków** — ten sam limit co w AskUserQuestion.
     Dłuższy nagłówek nie daje błędu, tylko cicho traci koniec.
  2. **`$.fs` ma `read`, `write`, `list`, `exists`, `stat` — nie ma `delete` ani `rename`.** Mod nie
     skasuje pliku sam.
  3. **Stan sesji w module (`S.id`) zmienia się dopiero w hooku**, który ją zauważy
     (`session.end`, `followSession`); `$.session.id()` zwraca nowe id od razu po `/clear`.
- **Obejście:** (1) nagłówki kart ≤ 12 znaków (`Próg 5 h`, `Próg tydzień`), w kodzie stała
  z komentarzem; (2) kasowanie robi model na prośbę z karty („Odrzuć”) albo z linią zgody we
  frazie („Wznów pracę”) — decyzja Łukasza 2026-10-11; (3) funkcja czekająca na kartę bierze id
  z `$.session.id()` przed pytaniem i pyta o nie ponownie po każdej odpowiedzi (L-0166), a miejsce
  zapisu (plik sesji) liczy z id sprzed pytania.
- **Zasięg:** Claude Code 2.1.295, mody „early access”; punkt 1 zmierzony w `plugin test`,
  punkt 2 z typów silnika (`cache-keeper/.claude-plugin/types/claude-code/index.d.ts`).

### P-025 — Git Bash zamienia argument od `/` na ścieżkę, a `claude.exe` w katalogu aplikacji to aplikacja · 2026-10-11 · AKTYWNA

- **Objaw:** (1) `node skrypt.mjs "/relai-stage"` w Git Bashu dostaje argument
  `C:/Program Files/Git/relai-stage` — deep link `claude://code/new?q=…` poszedł z komendą zamienioną
  na ścieżkę. (2) `"C:\Program Files\WindowsApps\Claude_…\app\claude.exe" -p …` kończy się kodem 0,
  wypisuje tylko błędy GPU i nie tworzy sesji; `--version` zwraca `2.31226.1`, czyli wersję aplikacji.
- **Przyczyna:** (1) MSYS konwertuje argumenty wyglądające na ścieżki POSIX na ścieżki Windows,
  zanim trafią do programu. (2) Plik `claude.exe` obok `Claude.exe` w pakiecie MSIX to alias
  aplikacji desktopowej, nie CLI Claude Code; CLI na PATH (`~/.local/bin/claude.exe`) ma własną
  wersję (2.1.280 w dniu pomiaru), a binarkę 2.1.295 trzeba wskazać pełną ścieżką (P-024).
- **Obejście:** (1) `MSYS_NO_PATHCONV=1` przed poleceniem albo argumenty podstawiane w skrypcie
  zapisanym narzędziem Write (jak w L-0116 dla backslasha). (2) Przed pomiarem CLI sprawdź
  `claude --version` tej binarki, której używasz — wersja aplikacji zamiast `2.1.x` znaczy, że to
  nie CLI.
- **Zasięg:** Git Bash na Windows; aplikacja desktopowa Claude 2.31226.1.0. Źródło: research
  NOWA_SESJA 2026-10-11 (`docs/fixy/NOWA_SESJA/RESEARCH.html`).

### P-024 — Silnik modów Claude Code 2.1.295: Svg w paśmie nad promptem, komórka 9,8 px, binarka na PATH · 2026-10-10 · AKTYWNA

- **Objaw:** pierścienie paska cache rysują się ~200 px na prawo od treści pozostałych pasków;
  mały obraz `Svg` (ikona baterii) przed tekstem nie pojawia się wcale; `claude plugin validate`
  odrzuca moduł, który aplikacja ładuje i uruchamia bez zarzutu.
- **Przyczyna (2.1.295, sonda `cache-probe` w Z11 wątku AUDYT_MODOW, aplikacja desktopowa):**
  1. **Interaktywny `Svg` o stałej szerokości markupu jest centrowany w swojej ramce.** Ramka
     bierze całą szerokość slotu (P-021 pkt 3), rysunek o `width="872"` staje w środku:
     (1271 − 872) / 2 = 200 px przesunięcia. Markup `width="100%"` (bez `viewBox`, elementy od
     `x = 0`) układa się od lewej — tak rysuje segmenty pasek postępu.
  2. **Obraz `Svg` (bez `isInteractive`) z pustym `alt=""` nie rysuje się w paśmie** — bez linii
     `refused`, tekst obok rysuje się normalnie. Ten sam element z niepustym `alt` rysuje się.
     W panelu bocznym (`tree-probe`, Z10) pusty `alt` uchodził; w paśmie nie.
  3. **Komórka siatki na desktopie to ~8,2 px CSS** — tyle, w ilu rysuje `Svg`. Na zrzucie ekranu
     16 komórek etykiety i odstępu ma 157 px (~9,8 px na komórkę), ale piksel zrzutu to ~1,2 px
     CSS: bateria kontekstu narysowana na x = 766 stoi na zrzucie 919 px od początku kolumny.
     **Sprostowanie 2026-10-11:** pierwsza wersja tego punktu (2026-10-10) podawała 9,8 px jako
     komórkę i wdrożenie Z11 przyjęło `CELL_PX = 9.8` — wiersz baterii łamał się za późno,
     piąta bateria i jej dymek ucinały się przy prawej krawędzi. Pomiar z obrazu przeliczaj na
     piksele CSS znanym punktem rysunku, zanim wpiszesz go do kodu.
  4. **`claude` na PATH (`~/.local/bin/claude`) to 2.1.280**, a aplikacja wykonuje 2.1.295.
     Walidator 2.1.280 odrzuca `read($, atom)` / `update($, atom, …)` („$ is passed to "read",
     imported from "claude-code"") — także w wydanym `relai-progress`. Walidacja i testy modów:
     binarką aplikacji `%APPDATA%\Claude\claude-code\2.1.295\<hash>\claude.exe` (z Bash sesji;
     poza aplikacją ścieżka fizyczna z P-019).
  5. **Dymek bez dymka:** karta w tym samym interaktywnym `Svg`, rysowana po wszystkich miarach
     (maluje się nad sąsiadami), odsłaniana `.iN:hover ~ .tN { display: inline }`, stawiana obok
     celu najechania, nigdy na nim — kursor zostaje na celu, karta nie miga. `filter: drop-shadow`
     w CSS ramki działa.
  6. **Zaokrąglona ramka paska (`borderStyle: 'round'`) kosztuje ~26 px wysokości** na pasek
     (wiersz tekstu ~22 px, pasek ~48 px); `Box` nie ma promienia bez ramki, więc trzy paski
     w spokoju mają ≈ 172 px — kryterium 160 px z Z1 było nieosiągalne z ramką (Aneks Z11: 175).
- **Obejście:** wiersz pierścieni/baterii jako `Svg` z `width="100%"`; każdy obraz `Svg` z opisowym
  `alt`; `CELL_PX = 8` w `cache-keeper` (~8,2 px CSS zmierzone, 8 zostawia mały zapas); walidacja i `plugin test`
  binarką 2.1.295; podpowiedzi jako karta w tym samym `Svg`.
- **Zasięg:** Claude Code 2.1.295 (mody „early access”), aplikacja desktopowa, Windows; terminal
  niezmierzony. Zrzuty i decyzje: Aneks Z11 briefu `docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md`.

### P-023 — Silnik modów i strona cennika Anthropic: `$.http.fetch`, `toolUses`, znaki ikon · 2026-10-09 · AKTYWNA

- **Objaw:** parser strony cennika odrzucał 4 z 20 wierszy modeli, choć nazwy wyglądały poprawnie;
  znacznik „zmieniony w tej turze” oparty na `tool.call` nie widział ścieżki pliku.
- **Przyczyna (2.1.293, sonda `relai-probe-e6` w E6 planu PANEL_CLAUDE, desktop):**
  1. `$.http.fetch('https://platform.claude.com/docs/en/about-claude/pricing')` z modu działa:
     status 200, `text/html`, ~940 KB, bez przekierowania; tabela „Model pricing” jest w HTML
     serwowanym (bez skryptu), 13 tabel na stronie.
  2. Strona rysuje ikony (model wycofany, wymaga weryfikacji, zwijanie sekcji) znakami z obszaru
     prywatnego Unicode (U+E02A, U+E0F0); `\s` ich nie łapie, więc „Claude Opus 4.1” kończy się
     niewidocznym znakiem. Cena stoi jako `$4<!-- --> <span>/ MTok</span>`.
  3. Stawki cache zależą od modelu: odczyt 0,1× wejścia, 0,05× na Opus i Sonnet 5.5, 0,025× na
     Fable i Mythos 5.1; Haiku 5.5 ma drugi próg ceny powyżej 100 000 tokenów promptu (`rowSpan=2`).
  4. `turn.step` zwraca `toolUses: [{ name, input }]` — wywołania, o które model **poprosił**
     (przed wykonaniem); `input.file_path` niesie pełną ścieżkę Windows. W `tool.call` pole wejścia
     nie nazywa się `input` (sonda: `file_path` pusty).
  5. `$.fs.write` sam zakłada brakujący katalog (`.claude/relai/panel/`, na żywo).
  6. Przeładowanie modu po edycji jego pliku zeruje zmienne modułu — stan „w tej turze” trzymany
     w module przepada w turze, która modyfikuje mod.
  7. **Za duże drzewo panelu znika bez słowa:** drzewo 726 węzłów / 121 Svg / 256 tys. znaków
     (zakładka „Dokumenty” z rozwiniętym archiwum) — hook skończył się poprawnie, `/relai-panel`
     odpowiada „otwarty”, a desktop nie pokazuje nic i nie ma szarej linii `refused`; `plugin test`
     takie drzewo przyjmuje. 209 / 27 / 53 tys. — widoczne. Dokładny próg nieznany. Stan zwinięcia
     w `$.state` przeżywa przeładowanie, więc każde otwarcie rysuje znowu to samo.
  7a. **Link w `Markdown` w panelu desktopu łapie co drugi klik (2.1.295, sonda `tree-probe`
     2026-10-10):** drugi klik w link (`onLinkPress` + `pressableLinks`) nie dociera do pluginu —
     dociera tylko `ui.focus` — dopóki człowiek nie kliknie w tło; póki taki link jest narysowany,
     gubią się też kliki w przyciski tego panelu (zakładki). `Button` (także `plain`) dostaje każdy
     klik, przerysowanie ~3 ms. Nowy klucz elementu po kliknięciu ani `$.ui.focus` gdzie indziej
     nie pomagają. Klikalne wiersze rysuj `Button`, nie linkiem; `Markdown` tylko do czytania.
  8. Na desktopie `Code` z `format: 'diff'` traci format (rysuje surowy tekst), a `Link` do `file:`
     rysuje się jak zwykły tekst; to samo pokazuje drzewo z `plugin test`.
  9. Klikać da się wyłącznie `Button`, `Link` i link w `Markdown` (`onLinkPress` + `pressableLinks`,
     adres `https:`); `Box` nie ma `onPress`, `Svg` (także `isInteractive`) nie przyjmuje kliknięcia.
  10. Walidator modułu odrzuca przekazanie `$` do funkcji, która nie jest zadeklarowana na górze
      pliku — moduł się wtedy **w ogóle nie ładuje** (wszystkie hooki znikają).
  11. Hot reload raz zostawił starszą wersję modułu mimo nowej kopii w folderze modów (log rysowania
      pokazał stary limit) — dopiero kolejna tura wczytała nową.
- **Obejście (7–11):** limit drzewa w kodzie (60 wierszy, 40 plików na folder, linia „… jeszcze N”),
  foldery domyślnie zwinięte; diff rysowany wierszami z tłem, HTML pokazany jako źródło; nazwa
  i chevron w drzewie jako link Markdown pod adresem `https://relai.invalid/…`; funkcje z `$` tylko na
  górze pliku albo kod wprost w hooku; przy diagnozie na żywo — znacznik wersji w logu rysowania.
  Moduł za duży na jeden plik (E7, `relai-panel` 0.9.0): widoki w osobnych plikach `.tsx` jako czyste
  funkcje, które dostają tabelę elementów (`$.ui.resolve(e)`) i gotowe wywołania zwrotne
  zamknięte nad `$` w module hooków. Silnik taki moduł ładuje, a raport `plugin validate` (hooki,
  wywołania, klucze stanu) zostaje identyczny z wersją jednoplikową.
- **Obejście (1–6):** nazwy z tekstu komórki po wycięciu `[\uE000-\uF8FF]`; parser ścisły (wiersz
  nierozpoznany → nic nie jest zapisane); stawki bezwzględne per model z tabeli; znacznik zmian
  z `turn.step` `toolUses`; pomiar znacznika na żywo w turze, która nie edytuje plików modu.
- **Zasięg:** Claude Code 2.1.293 (mody „early access”), aplikacja desktopowa, Windows; strona
  cennika w stanie z 2026-10-09 (kopia tabel: `core/panel/tests/fixtures/cennik-anthropic-2026-10-09.html`).

### P-022 — Silnik modów Claude Code: wysyłka komend z panelu i `/clear` · 2026-10-09 · AKTYWNA

- **Objaw:** hook `command.run` wtyczki, który ma rozpoznać „to wysłał mój panel" po
  `origin.kind === 'plugin'`, nigdy nie widzi tej gałęzi; przycisk „wyczyść" w panelu kasuje
  rozmowę, w której trwała praca, razem z całym kontekstem modelu.
- **Przyczyna (2.1.293, sonda `relai-probe-e5` w E5 planu PANEL_CLAUDE, desktop):**
  1. `$.command.run` wysłane przez wtyczkę **nie przechodzi przez jej własny hook `command.run`**.
     Komenda markdown innego pluginu (`/relai:relai-help`) uruchamia się w czacie z argumentami
     nietkniętymi; komenda zarejestrowana przez tę samą wtyczkę dostaje odpowiedź silnika „no
     command.run hook answered it". Tekst wpisany z klawiatury przechodzi przez hook
     z `origin = { kind: 'composer' }` i hook może zmienić argumenty, zanim komenda ruszy.
  2. `$.command.run({ command: 'clear' })` uruchamia wbudowane `/clear` (wynik `{ text: '' }`).
     `$.session.id()` od razu zwraca nowe id, moduł się nie przeładowuje (pamięć modułu ciągła,
     brak `session.start` — zgodnie z P-020 pkt 4), otwarty panel boczny zostaje i rysuje się
     z nową sesją. Kontekst modelu z poprzedniej rozmowy przepada w całości.
  3. `$.ui.copy({ text, surface })` z naciśnięcia przycisku → `{ isCopied: true }`.
  4. `$.process.run([...argv], { cwd, timeoutMs })` uruchamia `node` z katalogu projektu
     (`clean-work.js raport --json`: kod 0, pełny JSON na stdout).
  5. `$.prompt.submit` z tekstem zaczynającym się od `/` jest odrzucane („a text beginning with /
     would run a command as the user; run one with $.command.run"). Decyzja dla komendy idzie jej
     argumentem przez `$.command.run`.
  6. W `claude plugin test` testowy `$` nie ma `$.state`; stan wtyczki podkłada się hookiem
     `state.get` pod wtyczką, z odpowiedzią `{ value: { value, version } }`.
- **Obejście:** znacznik zgody z panelu wycinaj w hooku **zawsze, gdy go widzisz** — hook widzi
  wyłącznie wpisy z klawiatury i wysyłki innych wtyczek, więc wysyłka własnego panelu przechodzi
  sama; drugą blokadą jest jednorazowe id karty w `$.state`. `/clear` wyłącznie po „tak" na karcie,
  a stan potrzebny po nim trzymaj w `$.state` albo w pliku, nie w kontekście modelu. Sondy nie
  wyposażaj w przycisk `/clear` bez osobnego potwierdzenia — wynik sondy musi żyć w pliku logu.
- **Zasięg:** Claude Code 2.1.293 (mody „early access"), aplikacja desktopowa, Windows; terminal
  niezmierzony.

### P-021 — Silnik modów Claude Code: katalog sesji, klucze i interaktywne Svg · 2026-10-09 · AKTYWNA

- **Objaw:** trzy mody RelAI nad promptem zamilkły w trakcie sesji, choć `plugin test` był zielony;
  `ui.find({ key })` nie znajduje `Svg` ani `Text`, którym nadano klucz; pasek segmentów jako
  interaktywne `Svg` rysuje się na ~380 px zamiast na całą szerokość karty.
- **Przyczyna (2.1.293, E9 planu PANEL_CLAUDE, desktop i terminal):**
  1. `$.session.cwd()` idzie za każdym `cd` narzędzia Bash: po `cd .claude/relai/work/...` mod pytający
     o `docs/USTAWIENIA.md` w katalogu sesji uznał, że to nie jest projekt RelAI.
  2. `key` przeżywa wyłącznie na `Box`; na `Text` i `Svg` znika z drzewa rysowanego, więc test
     szuka go w owijającym `Box` albo chodzi po `ui.drawn()`.
  3. `Svg` z `isInteractive` w wierszu (`flexDirection="row"`) obok tekstu dostaje domyślną
     szerokość ramki (~380 px); we własnym wierszu kolumny bierze pełną szerokość.
  4. Silnik nie ma tooltipa; działa karta w samym `Svg`: segment i jego karta jako rodzeństwo,
     `.b:hover ~ .t { display: inline }`, tekst przycięty do liczby znaków liczonej z kolumn.
  5. `Box position="absolute"` z `right`/`bottom` liczy w komórkach względem rodzica — tak przycisk
     siedzi w rogu karty bez własnego wiersza.
  6. Natywny `Button` na desktopie jest wyższy niż wiersz tekstu: przycisk w wierszu nad paskiem
     dotyka paska bez `marginBottom`.
- **Obejście:** korzeń projektu szukany **w górę** od `$.session.cwd()` (`ancestors` w
  `core/panel/plan-state.mjs`), komendy szukają go ponownie, gdy `session.start` jeszcze nie skończył;
  test na sesji stojącej w podfolderze. Klucze testowe na `Box`. Interaktywne `Svg` w osobnym wierszu.
  Karty podpowiedzi w Svg (`hoverSegments` w `core/panel/charts.mjs`) mierzone w Chromium.
- **Zasięg:** Claude Code 2.1.293 (mody „early access"), aplikacja desktopowa i terminal, Windows.

### P-020 — Silnik modów Claude Code: pomiar tokenów i wykresy w panelu · 2026-10-08 · AKTYWNA

- **Objaw:** kolektor kosztów liczy „wszystko z `turn.step`", a suma i tak nie zgadza się z `/cost`;
  sonda z jednym plikiem logu gubi wiersze drugiej sesji; wykres `Svg` przechodzi testy montażu,
  a na desktopie jest pusty; wykres ze skalą wychodzi poza kartę mimo `calc()` w CSS.
- **Przyczyna (2.1.293, sonda `relai-probe-e3` i pomiar na żywo w E3 planu PANEL_CLAUDE):**
  1. `$.fs` nie ma `append` — tylko `write` całego pliku; dwa procesy piszące do jednego pliku
     nadpisują sobie wiersze (sonda zgubiła całą sesję terminalową).
  2. `$.session.usage()` nie zna kategorii tokenów: daje `cost.usd` (licznik jak `/cost`), kontekst
     i limity. Kategorie niesie `usage` wyniku `turn.step` (każde wywołanie, też subagenta, z
     `agentId`) i `turn.complete` (suma tury).
  3. Kompakcja nie przechodzi przez `turn.step`: jej usage jest wyłącznie w wyniku `session.compact`.
  4. `/clear` zmienia `$.session.id()` w tym samym procesie i **nie** odpala `session.start`; hook
     `classic.SessionStart` z matcherem `source` nie odpalił w żadnym wariancie (start, `/clear`,
     wznowienie). Wznowienie (`--continue`) zachowuje identyfikator i odpala `session.start`.
  5. Zapis cache: krok wątku głównego ×2 (cache 1 h), **subagent i kompakcja ×1,25 (cache 5 min)** —
     `usage` tego nie mówi; ustalone z licznika silnika co do $0,0003.
  6. Licznik silnika obejmuje wywołania spoza `turn.step` i kompakcji (tytuł sesji, możliwe inne
     pluginy i klasyfikator trybu auto): w sesji E3 9,16% przyrostu, $1,57 na $17,10.
  7. `Svg` bez `width` bierze szerokość **markupu**; markup bez `width` (sam `viewBox`) rysuje się
     pusto, choć `plugin test` widzi element.
  8. `isInteractive` rysuje Svg w osobnej ramce: działają `:hover` i selektor `~`, style ramek są od
     siebie izolowane. Chromium liczy CSS `width: calc(…)` na zagnieżdżonym `<svg>`, ale go **nie
     stosuje** — viewport zostaje 100%.
- **Obejście:** plik pomiarów na sesję, jeden pisarz z kolejką, odczyt pliku po przeładowaniu;
  kompakcja z `session.compact`; identyfikator sesji pytany przy każdym zapisie; kategorie
  porównywane z `turn.complete`, dolary z licznikiem silnika z resztą opisaną słowami; zapis cache
  wyceniany pętlą (`core/panel/pricing.mjs`, `writeTtl`). Wykresy: `width` w markupie; pas osi
  w pikselach i pozycja słupka jako `p%` plus przesunięcie w pikselach w zagnieżdżonym `<svg>`
  (`core/panel/charts.mjs`); obraz sprawdzany w Chromium pomiarem prostokątów, każdy wykres
  w osobnym `iframe`.
- **Zasięg:** Claude Code 2.1.293 (mody „early access"), aplikacja desktopowa i terminal, Windows.

### P-019 — Binarka Claude Code z aplikacji desktopowej niewidoczna w zwykłym PowerShellu · 2026-10-08 · AKTYWNA

- **Objaw:** `& "$env:APPDATA\Claude\claude-code\2.1.293\<hash>\claude.exe"` w oknie PowerShell
  Windows kończy się „is not recognized as the name of a cmdlet…", choć Bash sesji w aplikacji
  widzi i uruchamia ten sam plik pod `$APPDATA`.
- **Przyczyna:** aplikacja Claude jest pakietem MSIX (`Claude_pzs8sxrjxfjjc`); Windows wirtualizuje
  jej `AppData\Roaming`. Procesy uruchomione przez aplikację (sesja, jej Bash) widzą widok
  wirtualny, zwykła powłoka — folder fizyczny pakietu.
- **Obejście:** poza aplikacją ścieżka fizyczna:
  `$env:LOCALAPPDATA\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\claude-code\<wersja>\<hash>\claude.exe`.
  Instrukcję dla człowieka sprawdzasz w tej samej powłoce, którą zobaczy (zasada 2).
- **Zasięg:** aplikacja desktopowa Claude (MSIX), Windows 11; zmierzone przy pomiarze terminalowym
  E8 planu PANEL_CLAUDE.

### P-018 — Silnik modów Claude Code: co rysuje desktop, a czego nie da się zrobić · 2026-10-08 · AKTYWNA

- **Objaw:** projekt panelu zakłada typografię, rozmiary fontu, przyciski w kolorach marki i ruch;
  na żywo część elementów znika, przyciski odwracają kolory pod kursorem, a mod przechodzący
  `validate` pada albo zostaje zastąpiony przez silnik („the engine drew its own").
- **Przyczyna (2.1.293, sonda E8 planu PANEL_CLAUDE, aplikacja desktopowa, Windows):**
  1. `Text` ma tylko kolor, tło, pogrubienie, kursywę i podkreślenie, bez rozmiaru i kroju;
     odstępy liczone w komórkach. Jedyny klikalny element to `Button`.
  2. `Svg` rysuje dowolne SVG razem z fontem osadzonym w `@font-face` (`data:` woff2) — Kalam
     działa; bez `width` Svg rozciąga się do szerokości slotu. `foreignObject` jest wycinany
     (pusto). `isInteractive` daje ramkę z **białym tłem** i rozciąga się na całą szerokość.
  3. `Button` z `plain` w malowanym `Box` **odwraca kolory pod kursorem i nie da się tego
     wyłączyć**; natywny `Button` (`variant`) nie odwraca. Brak `transform`, `transition`, `onPress`
     na `Box`.
  4. Wartość właściwości obecna, ale `undefined` (`backgroundColor={undefined}`, także w `hover`)
     — drzewo odrzucone w całości.
  5. Tabela elementów terminala ma w czasie wykonania klucz `Svg` (typy go nie mają); narysowane nim
     elementy znikają po cichu — powierzchnię rozpoznaje się po `e.surface`.
  6. Zmienna `h` albo `Fragment` w module przesłania fabrykę JSX: „h is not a function" dopiero na
     żywo. `Code` przyjmuje `source`, nie `code`. `Client` działa (region modułu powierzchni), ale
     `surface.width` w pierwszym wywołaniu jest `undefined`.
  7. Na ciemnym motywie aplikacji `Text` bez koloru jest jasny: karta z własnym tłem musi podawać
     kolor każdego tekstu, inaczej na jasnym motywie tekst znika.
- **Obejście:** typografia marki w Svg z fontem przyciętym do liter napisu i szerokością z metryk
  fontu (`core/tools/build-panel-headings.js`); przyciski natywne, marka w kartach, a odpowiedź na
  kliknięcie przez stan (błysk ramki, etykieta „✓ Wysłano" na 0,9 s); właściwości opcjonalne
  rozkładane warunkowo; `tsc` i `plugin test` z montażem przed pokazaniem na żywo.
- **Zasięg:** Claude Code 2.1.293 (mody „early access"), aplikacja desktopowa, Windows. Terminal:
  testy montażu; pomiar na żywo w dzienniku E8.

### P-017 — Silnik modów Claude Code: pięć zachowań, których nie widać w czytaniu typów · 2026-10-08 · AKTYWNA

- **Objaw:** pasek `AbovePrompt` przechodzi `plugin validate`, `tsc` i `plugin test`, a na żywo
  znika — razem z paskiem innego moda. Wcześniej: import rdzenia odrzucony, testy `find({ key })`
  zwracają `undefined`, atrapy `$.fs` w teście nie trafiają.
- **Przyczyna (2.1.293, zmierzone w E1 planu PANEL_CLAUDE):**
  1. moduł importuje wyłącznie pliki **z folderu pluginu** („cannot import … outside the plugin's
     folder") i każdy plik jest ESM — CommonJS ładuje się bez eksportów;
  2. `next(e)` w `ui.render` zwraca węzeł silnika `{ type: 'engine', ref }`; pod `Box` z `width`
     silnik go odrzuca („engine node under a Box with prop "width"; the engine drew its own") i rysuje
     swoje, czyli nic — `plugin test` tego nie widzi, bo pod wtyczką w teście leży zwykły `Box`;
  3. `AbovePrompt` ma **jedną** instancję: hook, który rysuje bez `next`, zasłania paski wszystkich
     wtyczek pod nim;
  4. `key` przeżywa na `Box`, z `Text` znika; `$.fs` dostaje ścieżki w postaci systemu (`C:\…`);
  5. (E2) `$` i `on` nie przechodzą przez import: walidator odrzuca moduł, który przekazuje `$` do
     funkcji z innego pliku pluginu („$ is followed only into a function declared in this same
     file, never across an import"), choć `tsc` przechodzi. W teście atrapa `ui.open` odpowiada
     `{ value: { isPlaced: true } }`; hook modu pominięty przez błąd zostawia komendę atrapie testu,
     więc test sprawdza tekst odpowiedzi modu, a nie sam brak błędu.
- **Obejście:** rdzeń jako `.mjs` z kopią w folderze pluginu (`core/tools/sync-panel-core.js`);
  owijacz pasków bez `width`, zawsze z `next`; cały kod z `$` w pliku modułu hooków; klucze testowe na `Box`; atrapy `$.fs` normalizują
  `\` → `/`. Zasłonięcie mierzysz sondą w hot reload (licznik wywołań `ui.render`), a szarą linię
  `refused` w transkrypcie czytasz jako pierwszą — dla zainstalowanych pluginów trafia tylko do logu
  debug.
- **Zasięg:** Claude Code 2.1.293 (mody „early access"), aplikacja desktopowa, Windows.

### P-016 — `claude -p` kończy się, zanim przyjdzie powiadomienie o zadaniu w tle · 2026-09-24 · AKTYWNA

- **Objaw:** sesja `claude -p` uruchamia komendę w tle i kończy turę; hook `UserPromptSubmit`
  odpala się raz (prompt człowieka), a strumień kończy zdarzenie `task_notification` ze statusem
  `stopped`. Powiadomienia jako promptu nie da się tak przechwycić — cisza wygląda jak „nie ma
  takiego zdarzenia".
- **Przyczyna:** tryb `-p` zamyka sesję po ostatniej turze i zatrzymuje zadania w tle. Powiadomienie
  wchodzi jako nowa tura (`UserPromptSubmit` z polem `prompt` = `<task-notification>…`) tylko w sesji,
  która czeka bezczynnie — tak jak w aplikacji.
- **Obejście:** `claude -p --input-format stream-json --output-format stream-json --verbose`
  z **otwartym stdin** (pierwsza wiadomość jako JSON, `stdin.end()` dopiero po czasie dłuższym niż
  zadanie w tle); hook diagnostyczny dopisuje payload do pliku.
- **Zasięg:** Claude Code 2.1.280, Windows, Git Bash. Źródło: E6 planu PROWADZENIE_END_TO_END (Aneks H).

### P-015 — plugin jest widoczny w każdym folderze, hook nie · 2026-09-15 · AKTYWNA

- **Objaw:** tester zainstalował plugin, zaadoptował swój projekt, a potem otworzył **zupełnie inny**
  projekt — i sesja zaczęła tam dopytywać o adopcję do RelAI. Wygląda jak wyciek instalacji do
  globalnego `CLAUDE.md` albo `AGENTS.md`; nie jest nim.
- **Przyczyna:** `claude plugin install` i `codex plugin add` instalują plugin w zakresie
  **użytkownika** — inaczej nie dałoby się go wywołać w nowym folderze. Razem z nim globalne stają
  się skille, komendy, agenci i hooki. Hooki mają twardą bramkę markera (`relaiMarkerFile`, pierwszy
  warunek każdego z nich), więc poza projektem RelAI milczą. **Skill `relai-core` bramki nie ma i
  mieć nie może**: jego `description` każe wprost sprawdzić folder „in any folder" i zaproponować
  strukturę, gdy jej nie ma. To jest źródło pytania, nie żaden plik w katalogu domowym.
- **Czego NIE szukać:** zapisu poza projektem. Instalatory Cursora i Codeksa piszą wyłącznie do
  wskazanego katalogu, a katalog domowy jest **tylko czytany** (ustawienia globalne D-23, `.gitconfig`).
- **Obejście:** odmowa zakłada marker trybu gościa i zamyka temat w tym jednym folderze (D-21).
  Od 2.3.0 pytanie towarzyszące zamyka go na całej maszynie — wiersz `Propozycja RelAI poza projektem`
  w `~/.claude/relai/USTAWIENIA.md`. Adapter Cursora tej pułapki nie ma: instaluje się per projekt.
- **Do zapamiętania przy pisaniu dokumentów:** zdanie „w folderze bez struktury RelAI plugin jest
  całkowicie niewidoczny" było prawdziwe o **hookach** i nieprawdziwe o skillu. Zdanie o niewidoczności
  pisz zawsze z nazwą warstwy, której dotyczy.

### P-014 — zagnieżdżona sesja nie zapisze niczego pod `.claude/` · 2026-09-12 · AKTYWNA

- **Objaw:** pomiar wymagający **projektu kontrolnego** (świeża sesja, własna struktura, własne
  dokumenty) odbija się od ochrony plików: sesja uruchomiona z katalogu pod `.claude/` melduje
  „sensitive file" i odrzuca **każdy** zapis, także utworzenie nowego pliku. W sesji
  nieinteraktywnej nie ma czym tego zatwierdzić, więc pomiar staje w miejscu.
- **Przyczyna:** Claude Code traktuje wszystko pod `.claude/` jako pliki chronione wymagające zgody
  człowieka. Reguła RelAI mówi jednocześnie, że artefakty robocze etapu mieszkają
  w `.claude/relai/work/<TEMAT>/E<N>/` — i te dwie rzeczy zderzają się dokładnie wtedy, gdy
  artefaktem roboczym jest **cały projekt**, w którym ma pracować druga sesja.
- **Obejście:** projekt kontrolny zakładaj **poza** projektem — w `%TEMP%`, z nazwą zaczynającą się
  od slugu projektu (`relai-<temat>-<co>`), i wpisz go do wpisu dziennika **z nazwy**. Prompt etapowy
  przewiduje ten przypadek w linii o katalogu roboczym. Skrypty pomiarowe, zapisy przebiegu i stos
  renderu zostają w katalogu roboczym — blokada dotyczy zapisów **z zagnieżdżonej sesji**, nie
  zapisów sesji prowadzącej.
- **Zasięg:** każdy pomiar z drugą sesją Claude Code w roli badanego: inicjalizacja, adopcja,
  instalacja pluginu, przebieg dowodowy. Zmierzone 2026-09-12: osiem plików odrzuconych przy próbie
  inicjalizacji pod `.claude/relai/work/...`, ten sam prompt bez zmian przeszedł w `%TEMP%`.

### P-013 — korzeniowy `hooks/` ładuje się obok hooków zadeklarowanych w manifeście · 2026-09-12 · AKTYWNA

- **Objaw:** dwa bloki kontekstu startu sesji zamiast jednego — drugi w języku i brzmieniu **innego
  adaptera** — oraz komunikat przy zamknięciu sesji: `SessionEnd hook [...] failed: Hook JSON output
  validation failed — (root): Invalid input`. Manifest jest poprawny, `claude plugin validate`
  mówi `✔ Validation passed`, komendy działają, więc nic nie wskazuje na wadę pakowania.
- **Przyczyna:** `hooks/` w korzeniu repozytorium jest dla Claude Code **katalogiem konwencyjnym**,
  tak samo jak `commands/`, `skills/` i `agents/`. Pole `hooks` w `plugin.json` nie zastępuje tej
  konwencji, tylko ją **uzupełnia** — więc hooki innego adaptera, trzymane w korzeniu dla jego
  własnej konwencji (Codex szuka ich właśnie tam), uruchamiają się dodatkowo. Stąd duplikat
  `SessionStart` i błąd `SessionEnd`: schemat `SessionEnd` w Claude Code **nie przyjmuje**
  `additionalContext`, który dla Codeksa jest poprawny.
- **Obejście:** skrypt wołany z korzeniowego `hooks/hooks.json` dostaje **bramkę hosta** — pod
  Claude Code kończy się cicho kodem 0 (`if (process.env.CLAUDECODE) process.exit(0);`, w `.sh`
  i `.cmd` odpowiednik na tej samej zmiennej). Sygnał `CLAUDECODE` jest obecny w sesji Claude Code
  (zmierzone 2026-09-12) i zgodny z konwencją rozpoznania narzędzi w `core/process/crew.js`.
  Guardrail nie traci ochrony: skan sekretów w Claude Code robi hook adaptera Claude Code,
  zarejestrowany na `PreToolUse`. W RelAI pilnuje tego `core/tools/validate-adapters.js` —
  każdy skrypt z korzeniowego `hooks.json` musi nieść bramkę, inaczej walidator kończy kodem 1.
- **Zasięg:** trzeci przypadek tej samej klasy po P-010 (korzeniowy `skills/`) — **katalog
  konwencyjny hosta wygrywa z manifestem i robi to po cichu**. Zanim uznasz, że plugin
  wieloadapterowy jest poprawnie spakowany, wypisz katalogi konwencyjne narzędzia i sprawdź, czy
  któryś z nich nie należy w Twoim repozytorium do kogoś innego. Zmierzone na świeżej instalacji
  publicznej 2.1.3 w izolowanym `CLAUDE_CONFIG_DIR`. Naprawione w 2.1.4.

### P-012 — dwukropek w opisie komendy sprawia, że komenda znika bez słowa · 2026-09-06 · AKTYWNA

- **Objaw:** plugin ładuje się poprawnie, komendy działają — **poza jedną**. Nie ma jej w
  podpowiadaczu ani na liście widzianej przez model, a plik leży na miejscu i wygląda jak reszta.
  Ani sesja, ani log aplikacji, ani `claude plugin validate` nie mówią o niej ani słowa: walidator
  sprawdza **manifest**, nie nagłówki plików komend.
- **Przyczyna:** `description:` w nagłówku to **niecytowany skalar YAML**. Dwukropek ze spacją
  w środku (`…orkiestratorem celu: wywiad o role…`) czyni z niego mapę, nagłówek przestaje się
  parsować i komenda wypada. Reszta pluginu działa dalej, więc nic nie sugeruje awarii.
- **Obejście:** bierz wartość w cudzysłów, gdy zawiera `: ` — to samo dotyczy `argument-hint`.
  W RelAI pilnuje tego `core/tools/validate-adapters.js` (kontrola nagłówków wszystkich komend).
- **Zasięg:** nagłówki YAML komend i skilli. Zmierzone 2026-09-06 na wszystkich zainstalowanych
  pluginach: spośród komend **tylko** `relai-crew.md` miała `: ` w opisie i **tylko** ona się nie
  ładowała. Codex tego samego opisu nie odrzucał — parsery różnią się tolerancją, więc działanie
  w jednym narzędziu niczego nie dowodzi o drugim. Naprawione w 2.1.3.

### P-011 — katalog w polu `agents` unieważnia CAŁY manifest pluginu · 2026-09-06 · AKTYWNA

- **Objaw:** plugin nie ma ani jednej komendy, mimo że pliki komend leżą na miejscu i mają poprawny
  frontmatter. Sesja nie mówi nic. `claude plugin list` pokazuje `Status: ✘ failed to load`,
  a okno `/plugin` — `Validation errors: agents: Invalid input`.
- **Przyczyna:** pola `commands` i `skills` przyjmują **katalogi**, pole `agents` — **wyłącznie
  pliki `.md`**. Ta niesymetryczność nie rzuca się w oczy i kusi, żeby napisać
  `"agents": ["./adapters/claude-code/agents/"]` przez analogię. Manifest odpada wtedy **w całości**,
  więc przestają działać także `commands`, `skills` i `hooks` — nie tylko agenci.
- **Obejście:** wymieniaj pliki po jednym
  (`"./adapters/claude-code/agents/relai-coder.md"`, …). **Przed każdym wydaniem uruchamiaj
  `claude plugin validate <ścieżka>`** — to narzędzie mówi wprost, które pole odpadło, a bez niego
  jedynym śladem jest okno `/plugin`, do którego nikt nie zagląda. W RelAI pilnuje tego dodatkowo
  `core/tools/validate-adapters.js`.
- **Zasięg:** manifest pluginu Claude Code. W RelAI weszło z 2.1.0 (commit `6bec097`, razem
  z trzema agentami `/relai-crew`) i przez dwa wydania maskowało się nawzajem z P-010: dopóki
  korzeń miał `skills/`, plugin wyglądał na działający, bo skille odnajduje **domyślny skan**,
  bez manifestu. Naprawione w 2.1.2.

### P-010 — katalog `skills/` w korzeniu kasuje komendy pluginu Claude Code · 2026-09-06 · AKTYWNA

- **Objaw:** komendy pluginu przestają istnieć — `/relai` nie podpowiada niczego, a plugin poza tym
  działa (hooki, skille). Żaden komunikat nie trafia do sesji; ślad jest wyłącznie w logu aplikacji
  `%LOCALAPPDATA%\Claude\logs\main.log`, po jednej linii na komendę:
  `[warn] [PluginScan] Skipping legacy command "relai:relai-crew" — name collides with skills/ entry`.
- **Przyczyna:** aplikacja skanuje katalog `skills/` **w korzeniu pluginu** niezależnie od tego, co
  deklaruje `.claude-plugin/plugin.json`, i przy kolizji nazw wygrywa skill, a komenda jest
  pomijana jako „legacy". W RelAI korzeń zawiera skille wygenerowane dla **Codeksa**
  (`.codex-plugin/plugin.json` → `"skills": "./skills/"`), o nazwach identycznych z komendami — bo
  jedne i drugie powstają z tego samego źródła. Oba marketplace'y mają `"source": "./"`, więc
  artefakt jednego adaptera leży fizycznie wewnątrz pluginu drugiego.
- **Obejście:** trzymaj powierzchnie adapterów w rozłącznych katalogach; korzeń repozytorium
  wspólnego dla wielu narzędzi nie jest niczyją prywatną przestrzenią nazw. Przy sprawdzaniu, czy
  komendy się załadowały, patrz w log aplikacji — brak komendy nie zgłasza się nigdzie indziej.
- **Zasięg:** repozytorium obsługujące więcej niż jedno narzędzie z jednego korzenia. W RelAI weszło
  wydaniem **2.0.0** (commit `e36cb6e`, katalog `skills/`), pierwszy skip w logu 2026-09-05 23:26:28;
  wersje 1.8.1–1.9.2 nie miały korzeniowego `skills/` i komendy w nich działały.

### P-009 — długi opis w jednej komórce zmniejsza obrazek w sąsiedniej kolumnie · 2026-09-06 · AKTYWNA

- **Objaw:** ikony w tabeli README, wstawione jako `<img … width="24">`, renderują się mniejsze
  niż 24 px — i to bez żadnej zmiany w plikach graficznych. Zmierzone: pliki SVG nietknięte od
  1.8.0, a ikony skurczyły się po commicie, który dodał **wiersz tekstu**.
- **Przyczyna:** GitHub renderuje tabele z `table-layout: auto`, więc szerokości kolumn wynikają
  z zawartości. Jedna komórka dłuższa od reszty (u nas opis `/relai-crew`: **204** znaki wobec
  67–100 w pozostałych wierszach) zabiera szerokość dla swojej kolumny, a kolumna z samym
  obrazkiem dostaje resztki. Wtedy `.markdown-body img { max-width: 100% }` skaluje obrazek
  **poniżej** deklarowanej szerokości. Atrybut `width` jest życzeniem, nie gwarancją.
- **Obejście:** nie stawiaj obrazka w osobnej, wąskiej kolumnie. Scal go z kolumną, której
  szerokość wymusza tekst (`<img … width="24" align="absmiddle">` w jednej komórce z nazwą),
  i pilnuj, żeby żaden opis nie był dwa razy dłuższy od reszty. Grubsza kreska w SVG jest
  leczeniem objawu — obrazek nadal będzie mniejszy.
- **Zasięg:** każdy Markdown renderowany przez GitHub i przez podglądy używające jego CSS; im
  węższy widok, tym wcześniej to uderza. Źródło: naprawa README 2026-09-06.

### P-008 — sandbox Codeksa nie ma działającego Git Basha · 2026-09-05 · AKTYWNA

- **Objaw:** test uruchamiający `git commit` przez powłokę kończy się w sesji Codeksa błędem
  `CreateFileMapping … Win32 error 5`, a nie asercją. Ten sam test uruchomiony w zwykłej sesji
  przechodzi. Sprawdzone: `install-precommit.test.js`, pełny cykl B — 932 ms i zielono poza
  sandboxem, twardy błąd wewnątrz.
- **Przyczyna:** sandbox Windows Codeksa (`[windows] sandbox = "unelevated"` w `~/.codex/config.toml`)
  blokuje mapowanie pamięci, którego MSYS2 używa przy starcie. Dotyczy całej rodziny `sh`/`bash`
  z Git for Windows, nie samego gita.
- **Obejście:** nie każ Codeksowi mierzyć niczego, co przechodzi przez powłokę POSIX-ową.
  Zlecenia formułuj tak, żeby weryfikacja szła przez `node` i API, a testy powłokowe **powtórz
  sam** po jego zakończeniu. Codex sam ten błąd rozpoznaje i raportuje — jego „test nie przeszedł"
  nie znaczy „kod jest zły", dopóki nie powtórzysz przebiegu na zewnątrz.
- **Zasięg:** każde zlecenie `codex-companion.mjs task --write` na Windows. Objaw pokrewny w tej
  samej sesji: `spawnSync` z potokami nie zwracał wyjścia, więc Codex sam obszedł to pomiarem
  przez pliki (`file-stdio.cjs`).

### P-007 — o systemie modułów pliku w `.git/hooks/` rozstrzyga `package.json` projektu · 2026-09-04 · AKTYWNA

- **Objaw:** `ReferenceError: require is not defined in ES module scope` przy **każdym** commicie
  w projekcie, którego `package.json` ma `"type": "module"` — mimo że hook jest poprawnym
  CommonJS-em. Hook fails-closed, więc projekt traci możliwość commitowania czegokolwiek, a człowiek
  widzi stack trace Node'a zamiast komunikatu RelAI.
- **Przyczyna:** Node wybiera system modułów po **najbliższym `package.json` w górę drzewa**.
  Dla `.git/hooks/` tym najbliższym jest `package.json` projektu — katalog `.git/` nie jest
  granicą. Plik bezrozszerzeniowy i plik `.js` podlegają tej samej regule.
- **Obejście:** rozszerzenie `.cjs` wygrywa z każdą wartością `"type"`. Od 1.9.2 instalator
  RelAI kładzie logikę jako `relai-pre-commit.cjs` i `relai-secret-scan.cjs`, a sam
  `.git/hooks/pre-commit` jest shimem `#!/bin/sh` z `exec node`. Drugie obejście, gdyby trzeba
  było ratować cudzy hook: `.git/hooks/package.json` z `{ "type": "commonjs" }`.
- **Drugie wystąpienie (2026-09-28, 2.7.1):** ta sama reguła dotyczy kopii narzędzi w
  `.claude/relai/` — `tools/clean-work.js`, `tools/crew.js` i `templates/HTML_PLAN/zbuduj.js`.
  W projekcie Vite + React z `"type": "module"` padał raport `clean-work.js` z punktu weryfikacji
  promptu etapowego i builder planu HTML. Hook startu nie był dotknięty: ładuje rdzeń z katalogu
  pluginu, nie kopię. Tu wybrano drugie obejście, nie `.cjs`: hook startu kładzie
  `package.json` z `{ "type": "commonjs" }` w `tools/` i `templates/HTML_PLAN/`, bo ścieżka `.js`
  stoi w komendach trzech adapterów, specyfikacjach i promptach etapowych już wygenerowanych
  w cudzych projektach. Nie w całym `.claude/relai/` — `work/` trzyma skrypty robocze projektu,
  które mają zachować jego typ. Test: `core/process/tests/esm-project.test.js`.
- **Zasięg:** każdy hook gita napisany w Node w projekcie ESM — nie tylko RelAI. Sprawdzenie
  instalacji: hook uruchomiony przy pustym indeksie ma kończyć się kodem 0; od 1.9.2 robi to sam
  instalator (test dymny z cofnięciem). Źródło: zgłoszenie zewnętrzne 2026-09-04, Node 24.13.1.
- **Sprawdzenie samego skanu** — kanoniczna wartość przykładowa z dokumentacji AWS
  (`AKIAIOSFODNN7EXAMPLE`) ma **przechodzić**, a ten sam wzorzec bez markera przykładu ma być
  zatrzymany. Do 1.9.1 blokowane było jedno i drugie, więc tego zdania nie dało się zapisać:

  ```
  node <RelAI>/core/guardrails/secret-scan.js docs/PULAPKI.md
  ```

  Oczekiwany wynik dla tego pliku: `BRAK` i kod 0.

### P-006 — `git archive | tar` na Windows nie robi kopii drzewa · 2026-08-12 · AKTYWNA

- **Objaw:** `tar: Cannot connect to C: resolve failed` przy próbie zmaterializowania drzewa
  dowolnego commita.
- **Przyczyna:** GNU tar czyta ścieżkę `C:\...` jako `host:ścieżka`, czyli adres archiwum zdalnego.
  Litera dysku wygląda dla niego jak nazwa hosta.
- **Obejście:** `git worktree add --detach <katalog> <ref>`, sprzątanie
  `git worktree remove --force <katalog>`. Działa niezależnie od systemu, nie wymaga pośredniego
  archiwum i zostawia czysty stan. Rurociąg `git archive | tar` zostaw dla Uniksa.
- **Zasięg:** Git Bash na Windows, GNU tar; nie dotyczy Linuksa ani WSL. Źródło: L-0039.

### P-005 — `claude plugin update` nie działa do restartu aplikacji · 2026-08-10 · AKTYWNA

- **Objaw:** `installed_plugins.json` pokazuje nową wersję i `gitCommitSha`, CLI melduje „updated
  from X to Y", a sesje ładują starą treść skilla. Objawem jest **brak objawu**: nic nie protestuje,
  a mierzysz starą wersję.
- **Przyczyna:** `plugin update` podmienia wpis instalacji i pobiera nowy katalog cache, ale
  działająca aplikacja nadal ładuje stary — komunikat „Restart to apply changes" jest dosłowny.
  Gorzej: mechanizm kontrolny wbudowany w plugin **sam pochodzi ze starej wersji**, więc porównuje
  X z X, widzi zgodność i milczy. Kontrola wbudowana w wersję X nie wykryje, że działa X zamiast Y.
- **Obejście:** po `claude plugin update` **zrestartuj aplikację**, zanim cokolwiek zmierzysz.
  Którą wersję sesja naprawdę wykonuje, sprawdzasz po **ścieżce cache w transkrypcie** albo po
  treści pliku, który się zmienił — nie po `installed_plugins.json` i nie po komunikacie CLI.
  Warstw jest cztery: `plugin details` pokazuje wersję z marketplace, `plugin install` na
  zainstalowanym jest no-opem, `plugin update` porównuje numer wersji, a cache w pamięci aplikacji
  przeżywa je wszystkie do restartu.
- **Kolejność działa w obie strony** (2026-09-04, 1.9.1 → 1.9.2): sam restart nie ładuje niczego
  nowego, bo katalog nowej wersji pojawia się w cache'u dopiero przy `claude plugin update`.
  Po restarcie bez update `~/.claude/plugins/cache/<marketplace>/<plugin>/` kończył się na starej
  wersji, a hook startu meldował rozjazd „projekt 1.9.2 / plugin 1.9.1". Sekwencja to
  **update → restart → sprawdzenie treścią plików z cache'u**; żaden z tych kroków nie zastępuje
  pozostałych.
- **Krok obowiązkowy PRZED tagiem: `claude plugin validate <ścieżka>`** (od 2026-09-15, ryzyko W1).
  Narzędzie dostawcy zna schemat manifestu, którego własny walidator nie zna, i wskazuje pole oraz
  powód w jednym wywołaniu — trzy wydania 2.1.x wyszły z pluginem, który nie ładował ani jednej
  komendy, a wykrył to użytkownik oknem `/plugin`, nie żaden pomiar. Wynik inny niż
  `✔ Validation passed` zatrzymuje wydanie; `claude plugin update <plugin>@<marketplace>` wymaga
  **pełnej nazwy z marketplace'em** — sama nazwa pluginu kończy się `Plugin "…" not found`.
- **Zasięg:** Claude Code, aplikacja desktopowa; potwierdzone na 0.9.0 → 1.0.0 oraz 1.9.1 → 1.9.2.
  Źródło: L-0031, L-0020.

### P-004 — `acceptEdits` nie obejmuje poleceń Bash · 2026-08-09 · AKTYWNA

- **Objaw:** sesja `claude -p` z `--permission-mode acceptEdits` zatrzymuje się w połowie
  scenariusza i raportuje brak dostępu do narzędzia. Wygląda to na zadziałanie bramki logicznej,
  a jest brakiem uprawnień.
- **Przyczyna:** `acceptEdits` auto-akceptuje **wyłącznie edycje plików**. Każde polecenie systemowe
  (Bash, PowerShell) wymaga osobnej zgody, której w trybie `-p` nie ma kto wyrazić.
- **Obejście:** scenariusz wymagający narzędzia systemowego (pakowanie, git, node) uruchamiaj
  z jawnym `--allowedTools "Bash"` obok `--permission-mode acceptEdits`. Przed interpretacją wyniku
  rozstrzygnij, czy zatrzymanie wynikło z logiki komendy, czy z braku uprawnień.
- **Zasięg:** Claude Code CLI, tryb `-p`. Źródło: L-0028.

### P-003 — PowerShell 5.1 zjada polskie znaki przy **odczycie** · 2026-08-08 · AKTYWNA

- **Objaw:** treść dopisana do dokumentu ląduje w pliku jako „### 2026-08-08 Ă˘â‚¬â€ť E8: profile
  projektÄ‚Ĺ‚w…" — mimo poprawnego kodowania zapisu.
- **Przyczyna:** przekłamanie następuje przy **odczycie**, nie przy zapisie: `Get-Content -Raw` bez
  jawnego `-Encoding UTF8` interpretuje plik jako ANSI (strona kodowa systemu). `Add-Content
  -Encoding utf8` zapisuje potem poprawnie już zepsute znaki.
- **Obejście:** dokumentów z polskimi znakami **nie przepuszczaj przez PowerShell 5.1**. Dopisuj
  narzędziem Write/Edit albo Nodem (`fs.readFileSync(p, 'utf8')`). Efekt sprawdzaj odczytem pliku
  po zapisie, nie kodem wyjścia polecenia.
- **Zasięg:** Windows PowerShell 5.1 (nie PowerShell 7+). Ta sama rodzina co komunikaty hooków
  (L-0016) i payloady budowane echem (L-0017). Źródło: L-0027.

### P-002 — Sesja pomiarowa `claude -p` mierzy co innego, niż myślisz · 2026-08-08 · AKTYWNA

- **Objaw:** przebieg wygląda na udany. Sesja odpowiada sensownie — na prompt **urwany** na
  pierwszym polskim znaku; albo wiarygodnie wyjaśnia, dlaczego nie zapisała pliku, zamiast go
  zapisać.
- **Przyczyna:** dwie niezależne bariery i żadna nie zgłasza się jako błąd. Prompt przekazany
  **argumentem** zostaje przekłamany i obcięty przez powłokę Windows; tryb `-p` domyślnie nie ma
  prawa pisać po dysku.
- **Obejście:** prompt podawaj przez **stdin** (`spawn('claude', ['-p'])` + `stdin.write(prompt)`),
  zapis włączaj `--permission-mode acceptEdits`, a przed uznaniem pomiaru za ważny sprawdź
  w wyjściu, czy sesja zobaczyła **cały** prompt. Narzędzia systemowe — patrz P-004.
- **Zasięg:** Claude Code CLI na Windows, prompty z polskimi znakami. Źródło: L-0024.

### P-001 — `tar` na `PATH` nie jest tym `tar`, o którym myślisz · 2026-08-08 · AKTYWNA

- **Objaw:** `tar -a -c -f test.zip …` w Git Bashu kończy się kodem 0 bez ostrzeżenia, plik
  powstaje, `tar -tf` wypisuje zawartość — a Eksplorator Windows i `Expand-Archive` go nie otworzą.
  Pierwsze bajty to `ustar`, nie `PK`.
- **Przyczyna:** `tar` na `PATH` w Git Bash to GNU tar (1.35), który ZIP-a nie umie i po cichu
  ignoruje intencję `-a`. Systemowy `C:\Windows\System32\tar.exe` to bsdtar (libarchive) i ten sam
  zapis daje prawdziwy ZIP. Nazwa polecenia nie mówi nic o implementacji.
- **Obejście:** narzędzie systemowe rozstrzygające o **formacie** artefaktu wywołuj **pełną
  ścieżką** i weryfikuj **wynik**, nie kod wyjścia: nagłówek pliku, lista wpisów, otwarcie natywnym
  narzędziem platformy docelowej.
- **Zasięg:** Git Bash na Windows z GNU tar w `PATH`. Źródło: L-0021.
