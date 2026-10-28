# PROMPT_ETAP_5 — Pomiar końcowy lżejszego startu, nowe progi budżetu i wydanie

Plan: KONTEKST_STARTU • Etap: **E5 z E5** • Wygenerowano: 2026-10-28 (autor: Opus 5.5, w rytuale „Na koniec” E4) • Wykonawca: **Opus 5.5, świeże sesje (D-85, `docs/USTAWIENIA.md`), w Claude Code**, `/effort high`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `high` (cel planu rozstrzyga pomiar na żywo, a każdy z czterech etapów pokazał, że instrument
> bywa źródłem fałszu — L-0296, L-0299, L-0301, L-0303).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu; rytuał startu to `node .claude/relai/tools/start-digest.js` + zdanie o wyzwalaczach indeksu |
| `docs/plany/KONTEKST_STARTU/PLAN.html` | sekcje 2 (cel 1: ≤ 25 tys. tokenów po pierwszej turze, „trzy świeże sesje, z trybem ciągłym i bez”; cel parytetu), 6 (wiersz E5), 7 (ryzyka 1 i 4), 9 (decyzje człowieka: nowe progi budżetu) |
| `docs/plany/KONTEKST_STARTU/ANALIZA.md` | §3.1 — jak liczono „przed” (ok. 72 tys. tokenów RelAI po pierwszej turze, udział RelAI w kontekście) |
| `docs/plany/KONTEKST_STARTU/STATUS.md` | Aneksy A–D, bramki manualne (dwie OTWARTE), dziennik wdrożenia |
| `docs/DZIENNIK.md` | wyłącznie wpisy „KONTEKST_STARTU E1” (tabela „Pomiar przed”), „E2” („Pomiar po E2”), „E3” (metoda pomiaru na żywo, L-0299–L-0301) i „E4” (ewaluacja wyzwalania, skrót 29 056 B) |
| `docs/LEKCJE.md` | indeks „Zasad aktywnych” (podsekcja „Indeks”); pełne brzmienie zasad z wyzwalaczami tego etapu — niżej, w „Stanie wyjściowym” |
| `core/tools/start-context.js` | instrument pomiaru tury — poprawka L-0299 (lokalne komendy) przed pomiarem |
| `core/process/session-signals.js` | `PROGI_DOMYSLNE` (l. ok. 918: `start 100`, `zasady 30` itd.) — kopia wykonawcza progów |
| `core/templates/SPEC_USTAWIENIA.md` | wiersz `Budżet startu sesji`: jedyne źródło prawdy o wartościach domyślnych progów i katalog progów |
| `docs/KOMENDY.md`, `README.md` | co człowiek widzi o starcie sesji i budżecie — zdania do przepisania na stan po planie |

## Decyzje już podjęte — nie otwierasz ich ponownie

- **D-15, Aneks A (2026-10-28):** start czyta indeks „Zasad aktywnych”, pełne brzmienie przy
  wyzwalaczu; zasada obowiązująca zawsze stoi w indeksie w pełnym brzmieniu.
- **Aneks C planu:** indeks zaraz po STATE, ostatni wpis dziennika skracany przy skrócie ponad
  28 tys. znaków (`LIMIT_ZNAKOW` w `start-digest.js`). **Aneks D:** zdanie „zanim pierwszy raz
  zmienisz plik, porównaj zadanie z wyzwalaczami” w nagłówku indeksu i w rytuale `CLAUDE.md`
  i `AGENTS.md`. Nie przeprojektowujesz tego — mierzysz.
- E1–E4 zrobione i nie ruszasz ich mechaniki: parser aktywnego planu, rotacja tylko z zyskiem,
  nakładki rodzin, `start-digest.js` (poza poprawką wymuszoną pomiarem — wtedy aneks), bramka
  trybu ciągłego w dwóch krokach.
- **Nowe progi budżetu startu to decyzja Łukasza** (PLAN §9): proponujesz wartości z pomiaru
  z komendą sprawdzającą (zasada 6), zapisujesz dopiero po jego „tak”.
- Wydanie wyłącznie frazą „gotowi do wydania?” (`/relai-release`): raport, naprawy po jednej
  zgodzie, każdy krok zewnętrzny (tag, push, wydanie GitHub, marketplace) po osobnym „tak”.
- Wykonawca etapów Opus (D-85); filtr potwierdzeń trybu ciągłego („Tak, zaczynamy”) świadomie
  odłożony decyzją Łukasza 2026-10-28 — nie należy do E5. To ostatni etap planu: po nim
  sekwencja zamknięcia planu (`plan-closing.md`), żadnych etapów dalej.

## Stan wyjściowy (co realnie zastajesz po E4)

RelAI 3.6.0 wydany; na `main` niewydane E1–E4 KONTEKST_STARTU (E4 — po commicie z rytuału
„Na koniec” E4, jeśli Łukasz go zatwierdził; sprawdź `git log -1` i `git status`). Plugin
z marketplace (3.6.0) nadpisuje kopię `.claude/relai/` w projekcie przy starcie (L-0294), więc hook
startu liczy budżet **starym** skrótem (zasady 32,7 KB) — zachowanie repo mierzysz w sesji
`--plugin-dir` repozytorium z instalacją wyłączoną `--settings`
(`{"enabledPlugins":{"relai@relai":false}}`), z `--setting-sources project,local` i
`--strict-mcp-config`. Testy (FAKT po E4): `node --test core/process/tests/*.test.js` 353/353,
`node --test core/panel/tests/*.test.js` 225/225, `node --test adapters/codex/tests/*.test.js`
24/24, `node core/tools/validate-adapters.js` kod 0, `node adapters/codex/generate-skills.js`
„spojne”.

```
core/process/start-digest.js       # skrot startu: STATE, indeks zasad, ryzyka + ostatni wpis (skracany > 28 tys. znakow), ustawienia, STATUS
core/process/session-signals.js    # startCost: budzet z wyjscia skrotu; PROGI_DOMYSLNE start 100, zasady 30 (stare wartosci)
core/tools/start-context.js        # instrument tury; liczy lokalne komendy (/model) jako polecenie czlowieka (L-0299) — do poprawki
core/templates/SPEC_USTAWIENIA.md  # wiersz Budzet startu sesji, katalog progow (wartosci domyslne)
docs/USTAWIENIA.md                 # wiersz "Budzet startu sesji": start 100 KB, zasady 30 KB, STATE 12, ryzyka 12, ustawienia 6, status 10
docs/LEKCJE.md                     # Zasady aktywne: Indeks (3 443 B) + Pelne brzmienie (15 pozycji)
docs/KOMENDY.md, README.md         # opis startu sesji i budzetu sprzed planu
```

Liczby (FAKT, 2026-10-28): skrót startu na tym repo 29 056 B / 27 946 znaków (przed planem
60 489 B / 58 094 znaki); „przed” planem w ANALIZIE ok. 72 tys. tokenów RelAI po pierwszej
turze; „po E2” `claude -p` 52 492 → 75 848 tokenów (cała tura, nie sam RelAI). Ewaluacja
wyzwalania E4: 3/3 i 0/3 na Opus 5.5, jeden przebieg po poprawce.

**Czego jeszcze nie ma (to jest zakres tego etapu):** poprawki `start-context.js` o lokalne
komendy, pomiaru końcowego na trzech świeżych sesjach tego repo i w jednym projekcie
użytkownika, nowych progów budżetu startu, opisu stanu po planie w `KOMENDY.md` i `README.md`,
wydania.

**Zasady aktywne z `docs/LEKCJE.md`** — indeks w całości (stan po E4), a pod nim pełne
brzmienie zasad, w których wyzwalacz ten etap trafia na pewno. Zasady 4, 5 i 13 (pomiar,
instrument, sesje `claude -p`) też trafiają — ich pełne brzmienie doczytujesz z `docs/LEKCJE.md`
przed pierwszym pomiarem, nie z pamięci.

- **1 · Specyfikacja dokumentu jest kompletna albo martwa** — piszesz albo zmieniasz specyfikację
  (`SPEC_*`), prompt etapu, regułę produkującą tekst, punkt Weryfikacji albo FAKT do sprawdzenia.
- **2 · W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — wpisujesz komendę,
  frazę albo polecenie do README, `KOMENDY.md`, skilla albo do czatu dla człowieka.
- **3 · Test „czegoś nie wolno” wymaga dowodu negatywnego** — piszesz test nieobecności, kontrolę
  „stary tekst nie może zostać” albo chronisz fragment przed zmianą.
- **4 · Dowodzisz efektem, nie zdarzeniem** — planujesz dowód zmiany: kryterium, materiał testu,
  porównanie przed i po, worktree, pomiar na żywo w przeglądarce albo w modzie.
- **5 · Instrument pomiarowy sam bywa źródłem fałszu** — piszesz wyrażenie regularne, ścieżkę
  Windows, skrypt edycji, parser albo licznik; porównujesz dwa drzewa; mierzysz sesją `claude -p`,
  terminalem albo cudzą usługą.
- **6 · Próg jest liczbą, którą ktoś liczy** — ustalasz albo zmieniasz próg, budżet, limit albo
  liczbę w komunikacie.
- **7 · Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień** — kod czyta komórkę,
  wiersz albo pole dokumentu (tabela, ustawienia, status).
- **8 · Zachowanie, które ma działać zawsze, mieszka w warstwie obecnej w każdej sesji** —
  decydujesz, gdzie mieszka zachowanie (`CLAUDE.md`, hook, skill, plik doczytywany) albo stan
  pisany przez model.
- **9 · Skill nie zakłada dostępu poza katalogiem roboczym** — piszesz albo zmieniasz skill: opis,
  frazy, krok sięgający poza projekt.
- **10 · Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI** — mierzysz plugin
  wydany albo niewydany, podbijasz wersję albo wydajesz.
- **11 · Końce linii, kolejność wpisów, numeracja nagłówków i stan dokumentu wobec specyfikacji to
  warianty** — liczysz sumy, dopasowujesz nagłówek albo linię, przenosisz katalog z cudzego
  manifestu, przepisujesz regułę dostawcy.
- **12 · Guardrail zatrzymujący nie-sekret to defekt rdzenia** — hook albo bramka blokuje coś, co
  nie jest sekretem, albo piszesz bramkę czytającą wejście.
- **13 · Cudze narzędzie poznajesz z wydanego builda i z próby** — pracujesz z cudzym CLI, API
  modów, payloadem hooka, sesjami harnessu albo usługą zewnętrzną.
- **14 · Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje** — obowiązuje w każdym
  zadaniu, więc stoi tu w pełnym brzmieniu: weryfikację planujesz tam, gdzie wykonalna; po pytaniu
  sprzątasz sam; jednostką inwentarza jest sprawa, nie linia; wstawkę kotwiczysz do elementu,
  który przeżyje operację, i dowodzisz **obecności** nowej treści. Gdy prompt etapu przeczy
  regule dokumentu docelowego — wygrywa dokument, rozjazd do dziennika. Opcja pytania, która
  odwołuje się do wariantu planu, cytuje jego definicję z planu.
- **15 · Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są
  ASCII** — dodajesz pytanie do człowieka, komponent opcjonalny albo komunikat hooka; każda praca
  nad wyglądem (mod, panel, strona, film, scena 3D, makieta).

Pełne brzmienie (przepisane dosłownie):

2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — fraza i forma wywołania
   w wersji uruchomionej dosłownie, z tej samej powłoki, którą zobaczy czytelnik; znak
   interpretowany przez powłokę zapisujesz tak, żeby go nie tknęła. Komenda do wklejenia przez
   człowieka w czacie: pełna ścieżka, bez zmiennych środowiska, na Windowsie w składni PowerShella
   (L-0266). Polecenie mierzysz w każdym stanie, który samo wytwarza albo na który przełącza —
   przed zmianą i po niej (L-0292). (L-0002, L-0022, L-0059, L-0266, L-0292)
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
10. **Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI**; zachowanie — świeżą
    sesją; po podbiciu `grep -r` po starym numerze i każde trafienie rozstrzygasz (historyczne vs
    deklaracja stanu, także w komendach i skillach). Niewydane mierzysz artefaktem podłożonym
    lokalnie pod **inną nazwą**; cały plugin — `--plugin-dir` z wyłączoną instalacją i ścieżką
    w `init`. Wydanie zestawia zmiany artefaktów z `ARTEFAKTY.md` i `git ls-files` z listą
    generowanych (L-0161). Pomiar „instalacji z marketplace” stoi po bramce publikacji, gdy
    `claude plugin marketplace list` pokazuje źródło GitHub; słowo z liczbą ma test form
    1 / 2–4 / 5 / 12 / 22 (L-0260). (L-0004, L-0008, L-0020, L-0061, L-0085, L-0118, L-0161, L-0260)

**Lekcje z E4** (`docs/LEKCJE.md`): L-0302 — w poleceniu Bash nigdy gołe `cd`, w żadnym
katalogu (powtórka L-0298, graduacja do `CLAUDE.md` czeka na Łukasza); L-0303 — ewaluacja
zachowania wywołanego treścią wstrzykniętą zaczyna się od asercji, że ta treść dotarła w całości
(wynik `start-digest.js` w transkrypcie niesie indeks, nie podgląd).

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/KONTEKST_STARTU/E5/`.** Wszystko tymczasowe —
skrypty pomiarowe, worktree „przed”, wyjścia sesji `claude -p`, wyjścia narzędzi — powstaje tam.
Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego
repozytorium), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

1. **`core/tools/start-context.js`** — lokalne komendy (`/model`, `/config`, `/effort` i inne
   wpisy `<command-name>` bez wywołania modelu) nie liczą się jako polecenie człowieka (L-0299);
   test w `core/process/tests/start-context.test.js` z transkryptem zawierającym `/model` przed
   pierwszym promptem — obie wersje w jednym przebiegu (HEAD i zmiana).
2. **Pomiar końcowy w tym repo** — trzy świeże sesje Opus 5.5 (`--plugin-dir` repo, instalacja
   wyłączona): „kontynuujemy pracę” z trybem ciągłym wyłączonym w sesji (zgoda „nie” podłożona
   per `--session-id`), z trybem ciągłym i odpowiedzią „nie” w bramce oraz jedno zadanie
   z wyzwalaczem zasady. Liczba: kontekst po pierwszej turze i udział RelAI tą samą metodą co
   ANALIZA §3.1 — wobec ok. 72 tys. „przed” i celu ≤ 25 tys. Przed liczbami: model każdej sesji
   z transkryptu, lista narzędzi z `init`, asercja dostarczenia skrótu w całości (L-0303).
   Wynik ponad celem → zatrzymaj się i zapytaj (aneks), nie dopasowuj instrumentu.
3. **Pomiar w projekcie użytkownika** — jeden projekt RelAI Łukasza (którego — pytasz na starcie
   tego punktu): to samo „kontynuujemy pracę”, rozmiar skrótu w bajtach i znakach i jego
   dostarczenie w całości. Projekt bez indeksu zasad (sprzed E4) → skrót wypisuje całą sekcję;
   liczysz, czy mieści się w limicie, i opisujesz wynik, niczego w tamtym projekcie nie zmieniasz.
4. **Nowe progi budżetu startu** — propozycja wartości (`start`, `zasady`, ewentualnie `ryzyka`,
   `STATE`) z pomiaru tego repo i projektu użytkownika, każda z komendą sprawdzającą
   (`startCost`); po „tak” Łukasza: `core/templates/SPEC_USTAWIENIA.md` (wartości domyślne,
   katalog progów), `core/process/session-signals.js` (`PROGI_DOMYSLNE`, komentarz), wiersz
   `Budżet startu sesji` w `docs/USTAWIENIA.md` (nowy wiersz z datą, stary do „Ustawień
   wycofanych” z powodem), testy budżetu.
5. **Dokumenty użytkownika** — `docs/KOMENDY.md` i `README.md`: start sesji to jedno polecenie
   skrótu, „Zasady aktywne” na starcie jako indeks, bramka trybu ciągłego w dwóch krokach —
   wyłącznie zdania, które realnie się zmieniły, każde zmierzone (zasada 2). `docs/ARTEFAKTY.md`
   dla każdego zmienionego artefaktu.
6. **Parytet adapterów** — testy parytetu Codeksa i walidator po zmianach; skutek w Cursorze
   i Codeksie opisany we wpisie (ryzyko 4 planu).
7. **Wydanie** — fraza „gotowi do wydania?” (`/relai-release`): raport `release-check.js`,
   propozycja numeru, naprawy po jednej zgodzie, każdy krok zewnętrzny po osobnym „tak”; po
   publikacji `release-verify.js` i świeża sesja — budżet startu z hooka liczony nową kopią
   narzędzi (koniec L-0294 dla tej zmiany).

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_5.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [ ] `node --test core/process/tests/*.test.js`, `node --test core/panel/tests/*.test.js`,
      `node --test adapters/codex/tests/*.test.js` bez błędów; `node core/tools/validate-adapters.js`
      kod 0; `node adapters/codex/generate-skills.js` kończy się „spojne”.
- [ ] **Obie wersje w jednym przebiegu:** nowy test `start-context.js` na HEAD sprzed etapu
      (worktree w katalogu roboczym, `core.autocrlf=false`) pada, na zmianie przechodzi — liczby
      do wpisu.
- [ ] Pomiar końcowy: trzy sesje tego repo z modelem, `init`, asercją dostarczenia skrótu
      i liczbą RelAI po pierwszej turze; cel ≤ 25 tys. (SZACUNEK planu) osiągnięty albo rozjazd
      rozstrzygnięty z Łukaszem aneksem.
- [ ] Pomiar w projekcie użytkownika: rozmiar skrótu (bajty, znaki) i jego dostarczenie w całości
      albo opisany rozjazd; w tamtym projekcie `git status` bez zmian po pomiarze.
- [ ] Nowe progi: wartości po „tak” Łukasza w `SPEC_USTAWIENIA.md`, `PROGI_DOMYSLNE`
      i `docs/USTAWIENIA.md` identyczne (test albo `grep` po trzech miejscach); raport budżetu tego
      repo po zmianie bez fałszywej pozycji „ponad progiem” (wynik `startCost` do wpisu).
- [ ] `KOMENDY.md` i `README.md`: każde zmienione zdanie o starcie ma za sobą przebieg, który je
      potwierdza; stare brzmienie („czyta wyłącznie »Zasady aktywne«”, lista plików rytuału) nie
      zostaje jako deklaracja stanu (`grep` z kontrolą pozytywną).
- [ ] Wydanie: `release-check.js` zielony przed tagiem; po publikacji `release-verify.js` zielony
      i świeża sesja ładuje nową wersję (plik instalacji, zasada 10); każdy krok zewnętrzny
      z osobnym „tak” w transkrypcie.
- [ ] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy”, z autorem; `docs/STATE.md`
      zaktualizowany.
- [ ] Katalog roboczy `.claude/relai/work/KONTEKST_STARTU/E5/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po
      w sekcji „Zweryfikowane” wpisu. Artefakty poza tym katalogiem (worktree „przed”, jeśli
      powstał poza nim, transkrypty sesji pomiarowych, pliki w `%TEMP%`) wypisane z nazwy razem
      z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/KONTEKST_STARTU/STATUS.md`: E5 → ZREALIZOWANY (data), linia w dzienniku wdrożenia.
   To ostatni etap — nie ma etapu N+1 ani linku w kolumnie `Prompt`.
1a. Katalog roboczy `.claude/relai/work/KONTEKST_STARTU/E5/` — raport, „tak”, kasowanie; liczby
   przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy”, podpis
   `Autor: RelAI (Opus 5.5) + Lukasz`. Tabela ryzyk; lekcje do `docs/LEKCJE.md` i odświeżony
   destylat „Zasady aktywne” — pełne brzmienie i linia indeksu z wyzwalaczem.
3. Bramki manualne: pozycje „Do zrobienia przez człowieka” z wpisu → sekcja „Bramki manualne”
   w `STATUS.md`, status `OTWARTA`; dwie otwarte z E3 i E4 (zamrożenie bramek zgody, graduacja
   L-0298/L-0302) — status bez zmian, chyba że Łukasz je rozstrzygnął.
4. `docs/STATE.md` — stan po planie, liczby końcowe startu; linia „Aktywny plan” w `CLAUDE.md`
   i `AGENTS.md` identyczna.
5. **Ostatni etap planu — zamiast generacji następnego promptu uruchom sekwencję zamknięcia planu**
   (D-36) z pliku `plan-closing.md` skilla `relai-planning`: najpierw rozstrzygnięcie otwartych
   bramek manualnych i odnóg, potem `STATE.md`, wpis „dowiezione vs plan”, status planu
   `ZREALIZOWANY`, przegląd ryzyk, przeniesienie folderu do `docs/archiwum/plany/`, linia
   „Aktywny plan” w `CLAUDE.md`, podsumowanie.
6. Commit — propozycja, conventional message po angielsku.
