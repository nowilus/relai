# DECYZJE — rejestr decyzji zamrożonych

Zasada: decyzji z tego rejestru **nie proponuje się ponownie**. Zmiana wymaga jawnej prośby Łukasza i wpisu z datą oraz powodem. Wszystkie poniższe: wywiad 2026-08-07.

## Tożsamość i dystrybucja

- **D-01** Nazwa: **RelAI** (fonetycznie „Relay", z wplecionym AI). Tagline: „Twój projekt pamięta wszystko" / „Your project remembers everything".
- **D-02** Forma: **plugin Claude Code** (marketplace + install), NIE repo-szablon do kopiowania. v1 wyłącznie pod Claude Code.
- **D-03** Repo: prywatne na koncie GitHub Łukasza; architektura od początku pisana pod przyszłe upublicznienie (open-source po dojrzeniu). `marketplace.json` w tym samym repo.
- **D-04** Plugin w pełni samowystarczalny — zero zależności od ECC/superpowers/caveman; wykryte u użytkownika → współistnieje, nie dubluje.
- **D-05** Komendy po angielsku od razu: `/relai-stage`, `/relai-backup`, `/relai-audit`, `/relai-handover`, `/relai-adopt`, `/relai-update`, `/relai-tour`, `/relai-changelog`. Obok komend — naturalne frazy (PL: „kończymy na dziś", „kontynuujemy pracę", „sprawdź status"), wszystkie opisane w KOMENDY.md.
- **D-06** Feedback od współpracowników: nieformalny (bez infrastruktury zgłoszeń w v1).
- **D-07** *(Aneks A, 2026-08-07)* Komenda `/relai-help`: listuje wszystkie komendy i frazy z opisami; jedynym źródłem prawdy jest KOMENDY.md (help niczego nie duplikuje, tylko prezentuje).

## Dokumenty rdzeniowe projektu użytkownika

- **D-10** Rdzeń: `CLAUDE.md` (krótki router procesowy) + `docs/`: `STATE`, `DZIENNIK`, `LEKCJE`, `DECYZJE`, `USTAWIENIA`, `KOMENDY` + `README.md` projektu (lekki, generowany: co to, jak uruchomić, mapa docs). Warunkowo przy pierwszym kodzie/UI/deployu: `ARCHITEKTURA`, `DESIGN`, `docs/srodowiska/`.
- **D-11** Root projektu: tylko `CLAUDE.md` + `README.md`; cała reszta w `docs/` z podfolderami (`plany/`, `fixy/`, `srodowiska/`, `archiwum/`, `zasoby/`, `snapshoty/`).
- **D-12** Nazewnictwo: CAPS_SNAKE, po polsku, **bez dat i wersji w nazwie pliku** (data/wersja w treści). Daty w nazwach tylko dla snapshotów/backupów. Nazwy plików i folderów podążają za językiem projektu.
- **D-13** STATE: dwuwarstwowy (góra w pełni nietechniczna dla PM/szefa; dół krótka faktografia: środowiska, linki, wersje). Polityka: NADPISYWANY — zawsze stan na dziś, zero historii.
- **D-14** DZIENNIK: wpisy wg szablonu z JiraManagera (Data/Temat/Zrobione/Zweryfikowane/Świadomie odłożone/Do zrobienia przez człowieka) + podpis „RelAI + model + autor z git config". Stała sekcja „Stan otwartych ryzyk" (R-numeracja ciągła) na górze pliku. Rotacja: >50 KB lub kwartał → archiwum z 1-akapitowym streszczeniem.
- **D-15** LEKCJE (L-NNNN: trigger/przyczyna/zasada, dopisywane bez pytania po każdej korekcie) i DECYZJE (D-NN) jako **dwa osobne rejestry**. Graduacja: powtarzająca się lekcja awansuje do reguły w CLAUDE.md; okresowa kompresja lekcji do sekcji „Zasady aktywne" (start sesji czyta tylko destylat).
- **D-16** DECYZJE: agent wykrywa powracający temat i proponuje zamrożenie; zatwierdza człowiek. Frazy „nie rób tego więcej" lądują automatycznie.
- **D-17** CHANGELOG: NIE jest osobno prowadzony — generowany na żądanie destylacją DZIENNIKA (`/relai-changelog`).
- **D-18** Archiwizacja na bieżąco przez agenta: blockquote „NIEAKTUALNE — zastąpione przez X, dnia Y, powód Z" + przeniesienie do `docs/archiwum/`. Nigdy ciche kasowanie.
- **D-19** Linkowanie: standardowe linki Markdown (kompatybilne z GitHub/Obsidian/IDE). Bez wikilinków.

## Interakcja i konfiguracja

- **D-20** Start w nowym folderze: **pytanie o zgodę** na inicjalizację + paczka dokładnie 3 pytań: język (auto-wykryty jako default), git (załóż lokalnie + propozycja GitHub / tylko lokalnie / bez — z ostrzeżeniem), profil projektu (auto-wykryty do potwierdzenia). Folder z istniejącą zawartością → propozycja adopcji zamiast inicjalizacji.
- **D-21** Odmowa inicjalizacji: tryb gościa (czysty Claude Code) + marker odmowy; nie pytamy ponownie w tym folderze; dołączenie możliwe komendą w każdej chwili.
- **D-22** Filozofia: **wykryj intencję → zapytaj o preferencję RAZ w naturalnym momencie → zapisz → respektuj**. Bez wywoływania skilli ręcznie — „przygotuj plan" w zwykłym prompcie uruchamia zasady RelAI. Komendy tylko dla rzadkich operacji.
- **D-23** Ustawienia dwuwarstwowe: globalne preferencje użytkownika (`~/.claude/relai/`) dziedziczone przez nowe projekty; projektowe `docs/USTAWIENIA.md` nadpisuje. Każdy wpis: data + pytanie + decyzja.
- **D-24** Dokumentacja w repo domyślnie w całości; gitignore na życzenie użytkownika po rundzie ostrzeżeń o ryzykach.
- **D-25** Testy/TDD: zależne od profilu; przy pierwszym kodzie pytanie z rekomendacją LLM (pełny TDD / testy krytycznych ścieżek / bez testów) zapisywane w USTAWIENIA. Sekcja „Weryfikacja" w każdym prompcie etapowym — obowiązkowa zawsze.
- **D-26** Reguły językowe (default): dokumentacja PL, kod+komentarze EN, commity conventional EN; konfigurowalne w paczce startowej.
- **D-27** Współpracownik otwiera cudzy projekt (nieznany autor w DZIENNIKU) → propozycja „wycieczki" (tour): STATE, mapa, aktywne plany, ryzyka, od czego zacząć.

## Plany i wykonanie

- **D-30** Folder-per-plan: `docs/plany/<TEMAT>/` z `PLAN.{html,md}` + `STATUS.md` + `PROMPT_ETAP_N.md`. CLAUDE.md wskazuje tylko aktywny plan (1 linia).
- **D-31** Dwa poziomy: PLAN (pełna struktura: warianty z powodami odrzucenia, ryzyka z poziomem i mitygacją, etapy z szacunkiem i wczesnym efektem, przypadki brzegowe, lista dla człowieka) i MINIPLAN (cel/kroki/weryfikacja, w DZIENNIKU). Przy każdym planie pytanie o rodzaj i sposób dostarczenia — chyba że użytkownik utrwalił preferencję.
- **D-32** Format planu: interaktywny HTML domyślnie; Markdown dla dokumentów czysto agentowych (prompty etapowe, specyfikacje) i gdy użytkownik tak woli.
- **D-33** Plan po akceptacji ZAMROŻONY; zmiany datowanymi aneksami (A, B, C…). Odchylenie fundamentalne → zamknięcie ze statusem CZĘŚCIOWO + nowy plan z linkiem.
- **D-34** Prompty etapowe: standard domyślny (samowystarczalne: co przeczytać, decyzje podjęte — nie otwieraj, zakres, weryfikacja, „Na koniec"). Generacja LAZY: PROMPT_ETAP_1 przy akceptacji planu; N+1 w rytuale „Na koniec" etapu N; siatka: hook + kontrola na starcie sesji dogenerowuje brakujący.
- **D-35** Wykonanie etapu: świeża sesja + `/relai-stage` (bez argumentów: auto-wykrycie aktywnego planu i następnego etapu, ZAWSZE potwierdzenie przed startem; >1 aktywny plan → pytanie). Małe mechaniczne etapy: propozycja subagenta.
- **D-36** Zamknięcie planu automatyczne: aktualizacja STATE, wpis zamykający (dowiezione vs plan), status ZREALIZOWANY, przeniesienie do archiwum, aktualizacja ryzyk.
- **D-37** Fixy: drobne = wpis w DZIENNIKU; duże = pełna triada w `docs/fixy/<TEMAT>/`.
- **D-38** *(zmienione Aneksem A)* Dobór modelu w CLAUDE.md projektu jako REKOMENDACJA-default (analiza/plany → najsilniejszy; wykonanie → tańszy; mechaniczne → najtańszy) — nie twarda reguła.
- **D-39** *(Aneks A, 2026-08-07)* Przed powstaniem każdego planu RelAI pyta użytkownika, jakim modelem Claude mają być realizowane etapy; odpowiedź swobodna (może różnicować per etap), nic nie jest narzucane pod spodem. Pytanie zawiera REKOMENDACJĘ RelAI z uzasadnieniem (np. „złożone etapy: Opus, mechaniczne: Haiku") jako opcję domyślną. Preferencja utrwalana globalnie/projektowo (D-23). Wybrany model zapisany w STATUS planu i w treści promptów etapowych.

## Hooki, bezpieczeństwo, backup

- **D-40** 8 hooków w **Node.js** (jeden plik cross-platform, bez par .ps1/.sh): secret-scanner, config-protection, quality-gate, console-log-warn, design-quality-check, doc-sync-reminder, auto-format, session-context (data dnia, kontrola wersji, siatka promptów etapowych).
- **D-41** Blokują wyłącznie secret-scanner i config-protection; pozostałe ostrzegają.
- **D-42** Sekrety: tylko `.env`/gitignore; zapis sekretu do pliku śledzonego BLOKOWANY; backupy zawsze wykluczają pliki sekretów. Poluzowanie wyłącznie świadomą decyzją zamrożoną per projekt.
- **D-43** `/relai-backup`: centralny folder (pytanie o lokalizację raz, globalnie), ZIP `NAZWA_RRRR-MM-DD_GGMM.zip`, wykluczenia (sekrety zawsze; node_modules), wpis w DZIENNIKU.
- **D-44** Aktualność docs = element definicji ukończenia zadania (STATE/DZIENNIK w tej samej „turze" co zmiana) + doc-sync-reminder jako druga siatka.
- **D-45** `/relai-audit`: jedna komenda łącząca porządki (przestarzałe pliki, archiwizacja) i zdrowie (świeżość docs, spójność STATE vs kod, zaległe ryzyka) — raport z propozycjami, człowiek zatwierdza.

## Profile projektów

- **D-50** Jeden rdzeń + profile wykrywane (app / agent-voice / flow-N8N / prompty). Wszystkie pełne profile w v1.
- **D-51** Profil app: ARCHITEKTURA.md przy pierwszym kodzie; DESIGN.md przy pierwszym UI (krótkie pytanie o kierunek); `docs/srodowiska/` per środowisko przy pierwszym deployu (URL, wskazanie dostępów — nigdy wartości, jak wdrożyć/cofnąć).
- **D-52** Profil agent/flow: przed każdą zmianą produkcyjną configu OBOWIĄZKOWY snapshot do `docs/snapshoty/<data>/` z sufiksem stanu; zmiany skryptem migracyjnym z asercjami, nie ręczną edycją JSON. Konwencje KB (numeracja sekcji nietykalna, split PL treść / EN routing) w regułach profilu.
- **D-53** Podprojekty ZAKAZANE: folder projektu = jedno repo GitHub, bez zagnieżdżonych repo. Git zalecany (nie twardo wymuszany), zakaz zagnieżdżeń bezwzględny.

## Szablony i generacja

- **D-60** Szablony dokumentów = **specyfikacje dla LLM** (struktura, zasady, przykłady) — dokumenty generowane w języku projektu. Dzięki temu projekt EN działa w v1 bez tłumaczenia zasobów; pełne EN pluginu (opisy komend, README) poza v1.
- **D-61** *(ZMIENIONA 2026-08-07 — patrz D-61a i sekcja „Decyzje zmienione")* Szablon HTML planów: nowy design od zera. Wybór przez **konkurs**: 5 skrajnie różnych propozycji na pełnych testowych HTML-ach (sekcje, tabele, ikony, diagram SVG, wykres, symulator) → wybór 1-2 → iteracja → finał. Zakazy twarde: fioletowe gradienty/glow, przesyt emoji, glassmorphism/przeanimowanie, generyczne frazy i stocki.
- **D-61a** *(2026-08-07, zastępuje listę zakazów z D-61)* Tryb konkursu bez zmian (5 propozycji → wybór 1–2 → iteracja → finał). **Zakazy złagodzone po pierwszej rundzie konkursu:** zaokrąglenia i glassmorphism są **dozwolone w lekkiej, nieprzytłaczającej formie**; animacja jest **pożądana**, o ile służy treści (przepływ, rozwijanie, przeliczanie) i respektuje `prefers-reduced-motion`; typografia ozdobna (odręczna, kursywa, monospace o charakterze) jest **pożądana**; kolorystyka ma być „luźniejsza", świadomie odsunięta od palety AGRO_HOME; dekoracyjne SVG w tle dozwolone. **Zakazy, które zostają:** fioletowe gradienty i glow, przesyt emoji, generyczne frazy i stocki. **Powód:** pierwsza runda konkursu spełniła wszystkie zakazy D-61 i nie spodobała się w żadnej z pięciu propozycji — lista zakazów okazała się filtrem, nie briefem (L-0019).
- **D-61b** *(2026-08-07)* Kierunki 2–5 z pierwszej rundy konkursu (Terminal, Panel operacyjny, Rysunek techniczny, Plakat) są **odrzucone na stałe** — nie wracają jako warianty ani inspiracje. Kierunek 1 (Redakcja) zostaje jako baza do przebudowy. **Powód:** jawne rozstrzygnięcie użytkownika po obejrzeniu propozycji.
- **D-62** Przy pierwszym wygenerowaniu z szablonu — pytanie o chęć zmiany stylu; zmiana → lokalne nadpisanie szablonu i komponentów w projekcie; lokalne ma zawsze pierwszeństwo przed wersją z pluginu.
- **D-63** Wpisy/dokumenty podpisywane neutralnie (RelAI + model + autor), bez persony z osobowością. Etykiety FAKT/SZACUNEK przy liczbach w planach.

## Adopcja i aktualizacje

- **D-70** `/relai-adopt` wyłącznie na jawną komendę (nigdy automatycznie). Sekwencja obowiązkowa: pełny backup → analiza → migracja → raport zmian (co, skąd, dokąd) → ścieżka pełnego recovery (przetestowana). Bez luk — priorytet zaufania.
- **D-71** Istniejący CLAUDE.md przy adopcji: scalanie z zachowaniem (backup całości + reguły do sekcji „Zasady projektu (odziedziczone)" + raport + konflikty rozstrzygane pytaniami).
- **D-72** `/relai-update`: po aktualizacji pluginu porównuje wersję projektu, pokazuje diff zasad/szablonów, aktualizuje za zgodą, szanuje lokalne nadpisania, wpis w DZIENNIKU.

## Zakres v1 i budowa

- **D-80** v1 = rdzeń dokumentacyjny + planowanie z promptami etapowymi + hooki + komendy operacyjne + szablon HTML + pełne profile + adopcja + update. POZA v1: telemetria kosztów, pełne tłumaczenie EN zasobów pluginu, wsparcie Cursor/Codex, infrastruktura feedbacku, **jakiekolwiek GUI** (lekcja vibe-forge — zakaz scope creepu).
- **D-81** Kolejność budowy: MVP-first — rdzeń dokumentacyjny najpierw (używalny efekt po pierwszym etapie).
- **D-82** Pełny dogfooding: repo RelAI prowadzi się wg własnych zasad od pierwszego dnia.
- **D-83** Pilotaż: nowy mały projekt → adopcja JiraManagera. 4 obowiązkowe scenariusze akceptacyjne: pełny cykl nowego projektu; przekazanie+tour; backup+restore (z testem wykluczenia sekretów); adopcja z przetestowanym recovery.
- **D-84** Budowa: architektura/plany — Fable; wykonanie etapów — w świeżych sesjach wg promptów etapowych.
- **D-85** *(Aneks A, 2026-08-07)* Wykonawcą wszystkich etapów budowy RelAI jest **Opus** — maksymalna jakość dla produktu flagowego. Prompty etapowe E2+ pisze Opus w rytuale „Na koniec"; PROMPT_ETAP_1 — architekt. Wyjątek E6: propozycje designu generuje Opus, sesję wyboru i iterację finalnego szablonu prowadzi Fable (architekt).

## Decyzje zmienione

| Decyzja | Data zmiany | Co się zmieniło | Powód |
|---|---|---|---|
| **D-61** → **D-61a** | 2026-08-07 | Lista zakazów designu złagodzona: zaokrąglenia, lekki glassmorphism, animacja służebna, typografia ozdobna i dekoracyjne SVG **dozwolone**; zostają zakazy fioletu/glow, przesytu emoji, generycznych fraz i stocków. Tryb konkursu bez zmian. | Pierwsza runda konkursu (E6 faza 1) spełniła komplet zakazów D-61 i nie spodobała się w żadnej z pięciu propozycji. Lista zakazów okazała się filtrem końcowym, nie briefem (L-0019). |
