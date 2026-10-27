---
description: "Gotowość wydania RelAI (komenda projektowa tego repo): raport release-check.js z propozycjami numerów, naprawy bezpieczne po jednej zgodzie, lista dla człowieka i publikacja krok po kroku, każdy krok zewnętrzny po osobnym „tak”."
argument-hint: "[--rev <rewizja>]"
---

# /relai-release — gotowość wydania RelAI

Komenda **projektowa** repozytorium RelAI (`.claude/commands/`, plan PIPELINE_WYDAN). Nie trafia do
użytkowników pluginu. Fraza „gotowi do wydania?” w `CLAUDE.md` prowadzi tutaj.

Argumenty: `$ARGUMENTS` (opcjonalnie `--rev <rewizja>` — raport dla drzewa tej rewizji, bez napraw
i bez publikacji). Argument inny niż `--rev` z nazwą rewizji (litery, cyfry, `.`, `-`, `_`, `/`) →
nie wstawiasz go do polecenia, mówisz jednym zdaniem, co komenda przyjmuje.

**Źródło prawdy to raport skryptu.** Nie liczysz kontroli od nowa i nie oceniasz „na oko”, co jest
gotowe. Zmiana kontroli = zmiana w `core/tools/release-checks.js` z testem, nie w tej komendzie.

## Krok 1 — raport

Uruchom (Bash, `timeout: 600000` — pełny przebieg z testami trwa ~2 minuty):

```bash
node core/tools/release-check.js --json $ARGUMENTS
```

- Kod 2 albo pole `blad` → pokaż błąd jednym zdaniem i zakończ (brak bazy, mapy, rewizji).
- Kod 0 albo 1 → JSON jest raportem. **Kod 1 to „są czerwone kontrole”, nie awaria:** narzędzie
  oznaczy wynik jako błąd („Exit code 1”), ale cały JSON (~10–15 KB) stoi w tym samym wyniku —
  czytasz go stamtąd. Nie uruchamiasz skryptu drugi raz, nie dopisujesz `echo`/`|| true` i nie
  zapisujesz raportu do pliku (`.claude/` to ścieżka wrażliwa harnessu, `/tmp` jest poza
  katalogiem roboczym — pierwszy przebieg frazy 2026-10-25 stracił na tym cztery wywołania). Czytasz z niego: `bazy`, `propozycje`, `zmiany`
  (`typy`, `osobne`), `kontrole` (`id`, `bledy`, `ostrzezenia`, `info`, `licznik`), `pominiete`,
  `czerwone`.

## Krok 2 — raport po polsku

Pokaż w tej kolejności, zwięźle:

1. **Werdykt** — „gotowe” albo „N czerwonych”; rewizja, baza rdzenia (tag i numer), bazy modów
   ze zmianami. Pominięte zestawy nie są zielenią: gdy `pominiete` niesie coś innego niż „diff nie
   dotyka obszaru” albo „żaden mod nie zmienił się”, werdykt mówi „bez N pozycji”.
2. **Propozycje numerów** — tabela: komponent | baza | propozycja | poziom | stan | powód
   (pierwszy z `powody`). Pusta lista → jedno zdanie „żadna zmiana nie wymaga wydania”.
3. **Czerwone** — każda kontrola z `bledy`: identyfikator i błędy własnymi słowami, krótko.
4. **Ostrzeżenia** — `podbicie`, `stary-numer` i inne z `ostrzezenia`, po jednym wierszu.
5. **Pominięte** — z powodem.
6. **Grupa osobna PANEL_CODEX** (`zmiany.osobne`) — jeśli jest: liczba plików i zdanie, że to
   pliki innego planu, poza każdym commitem tego wydania.

## Krok 3 — podział braków

Każdą czerwień i ostrzeżenie przypisz do jednej z dwóch list według tabeli. Czego tabela nie zna
— trafia do listy **dla człowieka**.

| Kontrola | Lista | Co robisz |
|---|---|---|
| `podbicie` (i propozycja „do podbicia”) | bezpieczne | numer z propozycji (albo wskazany przez człowieka w zgodzie). **Rdzeń:** `.claude-plugin/plugin.json`, wpis `relai` w `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json`, wpis `relai` w `.agents/plugins/marketplace.json`, `core/MANIFEST.json`, baner `<em>Wersja` w `README.md`, pierwszy numer w „Gdzie jesteśmy” `docs/STATE.md`, stan docelowy w `adapters/claude-code/commands/relai-update.md`, nagłówek `docs/KOMENDY.md`. **Mod:** `<katalog>/.claude-plugin/plugin.json`, jego wpis w `.claude-plugin/marketplace.json` (i w `.agents/plugins/marketplace.json`, jeśli tam jest), numer w wierszu tabeli „Panel w Claude Code” README. Potem `node core/tools/validate-adapters.js` → „spojne” |
| `stary-numer` (po podbiciu) | bezpieczne / człowiek | każde trafienie: deklaracja stanu → podbijasz; zapis przeszłości (komentarz „po 3.2.0”, wpis historyczny) → zostaje i trafia do listy dla człowieka z jednym zdaniem dlaczego |
| `generator-codex` | bezpieczne | `node adapters/codex/generate-skills.js`, potem `--verify` |
| `sync-panel-core` | bezpieczne | `node core/tools/sync-panel-core.js`, potem `--check` |
| `strona-fakty`, `testy-strony` (budowa) | bezpieczne | `node site/narzedzia/fakty.mjs`, `node site/narzedzia/makiety.mjs`, `node site/narzedzia/zbuduj.mjs`, `node --test "site/**/*.test.mjs"` (P-005, krok „strona”) |
| `readme-mody` | bezpieczne | numer z `plugin.json` modu w nawiasie za nazwą w wierszu tabeli „Panel w Claude Code”: `` `relai-x` (N.N.N) `` |
| `readme-komendy`, `readme-hooki` | bezpieczne (szkic) | liczba w prozie i wiersz tabeli hooków równe repo |
| `historia` | bezpieczne (szkic) | wpis `Wersja X.Y.Z (…)` na górze listy w `adapters/claude-code/skills/relai-core/history.md`, układ jak wpis poprzedni (jeden akapit: temat wydania, plan, zmiany po kolei); potem generator Codeksa |
| `artefakty` | bezpieczne (szkic) | dla każdego pliku z błędu: nowy wiersz w `docs/ARTEFAKTY.md` — wersja +1, data, co się zmieniło, po co (zasady prowadzenia rejestru) |
| `strona-komendy` | bezpieczne (szkic) | fiszka EN w `site/tresc/en.json` (`film.fiszki`), nazwa PL w `NAMES` `core/panel/theme.mjs` + `sync-panel-core.js` |
| notatki wydania EN | bezpieczne (szkic) | `.claude/relai/work/WYDANIE/<wersja>/NOTATKI_EN.md` w układzie notatek `gh release view v<poprzednia>`: zdanie wstępne, lista zmian, linia „Checks:”, instrukcja aktualizacji |
| `film-komendy`, `film-rekwizyty`, `film-*`, `testy-filmu` | człowiek | rekwizyt i slogan to kalibracja z człowiekiem (plan PIPELINE_WYDAN E4); komenda nie naprawia filmu |
| `modele` | człowiek | `/relai-models`, potem przeniesienie listy do `adapters/claude-code/MODELE.md` — zmienia artefakt pluginu, osobne „tak” |
| `mapa`, `diff` | człowiek | nowy plik bez wiersza mapy: który typ zmiany — decyzja; wiersz mapy dopisany w tej samej zmianie |
| `walidator` (poza numerem), `testy-rdzenia`, `plugin-test` | człowiek | diagnoza (skill `relai-core`, `debugging.md`), nie naprawa „przy okazji” |
| propozycja w stanie „powyzej propozycji”, `powody` z BREAKING albo „poziom niepewny” (pliki bez commitu) | człowiek | czy numer zostaje; major tylko decyzją człowieka; przy plikach bez commitu poziom z propozycji to dolna granica |
| grupa PANEL_CODEX | człowiek | kolejność wydań z planem PANEL_CODEX |
| `pre-push` (hook nie zainstalowany albo inny niż źródło) | człowiek (osobne „tak”) | instalacja to zmiana konfiguracji maszyny: pytasz, potem `node core/tools/install-prepush.js` i ponowny raport |

Dokumenty (`README.md`, `history.md`, `ARTEFAKTY.md`, `STATE.md`, `KOMENDY.md`, `DZIENNIK.md`,
`PULAPKI.md`, `relai-update.md`, `adapters/*/MODELE.md`) i treści strony (`site/tresc/*.json`)
zmieniasz **wyłącznie narzędziem Edit** — nigdy `sed`, `node -e` ani heredokiem (L-0198, L-0207).
JSON-y manifestów — Edit albo skrypt zapisany narzędziem Write.

## Krok 4 — jedna zgoda na naprawy bezpieczne

Raport z `--rev` → ten krok i krok 6 pomijasz: naprawy idą tylko na drzewie roboczym. Lista
bezpiecznych pusta → przejdź do kroku 5. Inaczej **jedno** pytanie (AskUserQuestion):
lista napraw (każda jednym wierszem z plikiem) i numery, które wpiszesz (propozycje z raportu;
człowiek może podać inne w odpowiedzi). Opcje: „wykonaj wszystkie” / „tylko część — wskażę” /
„nie teraz”. Milczenie nie jest zgodą.

Po zgodzie: wykonaj listę, potem **uruchom skrypt ponownie** (ten sam Krok 1) i pokaż różnicę:
które kontrole przeszły z czerwonych na zielone, które zostały, nowe czerwienie (każda nowa
czerwień zatrzymuje dalsze kroki i idzie do człowieka). Pod spodem `git status --short`
i `git diff --stat` — wszystko, co automat zmienił, jest do obejrzenia przed tagiem.

## Krok 5 — lista dla człowieka

Wypisz pozycje z listy „człowiek”: co, dlaczego nie automat, jaki jest następny krok. Gdy lista
nie jest pusta albo raport ma czerwień — **nie proponujesz tagu** i kończysz tutaj zdaniem, co
blokuje wydanie.

## Krok 6 — publikacja (tylko zielony raport w trybie wydania)

Warunek wejścia: `node core/tools/release-check.js --json --wydanie` → kod 0. Z `--rev` publikacji
nie ma. Każdy krok **zewnętrzny** (oznaczony ⚑) to **osobne pytanie i osobne „tak”**; „tak” na
jeden krok nie obejmuje następnego. Kolejność (P-005; pierwszy przebieg tą komendą w 3.4.0,
plan PIPELINE_WYDAN E5):

Wydanie niesie nowe MP4 filmu (render od poprzedniego wydania) → przed commitem tekst obu
odtwarzaczy (`site/wideo/index.html`, `site/pl/wideo/index.html`) mówi czas i rozmiar tych plików:
czas pilnuje kontrola `strona-film`, rozmiar w MB (zaokrąglony, z `ls -l` pliku w `out/`) —
nikt, więc sprawdzasz go sam. Pliki MP4 do wydania kopiujesz pod nazwami `relai-film-pl.mp4`
(z `out/film.mp4`) i `relai-film-en.mp4` (z `out/film-en.mp4`) do katalogu roboczego wydania.

1. `claude plugin validate .` i każdego modu z propozycją — binarką aplikacji
   (`$CLAUDE_CODE_EXECPATH`, nie `claude` z PATH — P-024). Wynik bez `✔ Validation passed`
   zatrzymuje wydanie; „passed with warnings” przechodzi, a każde ostrzeżenie wypisujesz
   człowiekowi (znane: `CLAUDE.md` w korzeniu — skutek dogfoodingu, brak ikony pluginu).
2. ⚑ Commit lokalny — pokazujesz listę plików i wiadomość conventional po angielsku, pytasz,
   commitujesz dopiero po „tak”; pliki PANEL_CODEX i nieśledzone `.claude/` poza commitem
   (dodajesz pliki z nazwy, nie `git add -A`; ścieżka przeniesiona `git mv` już jest w indeksie
   i nie wchodzi do `git add`).
3. ⚑ Tag adnotowany `v<X.Y.Z>` rdzenia i `relai-<mod>-v<N.N.N>` każdego wydawanego modu.
4. ⚑ Push **tagów** z nazwy (`git push origin v<X.Y.Z>`), jeszcze bez `main`. Push tagu
   przechodzi przez hook `pre-push` (`release-check.js --rev <tag> --wydanie`, dla `relai-<mod>-v*`
   z `--komponent`; ~2 minuty dla rdzenia — Bash z `timeout: 600000`). Odmowa hooka zatrzymuje
   wydanie i wraca do Kroku 1; obejścia `RELAI_RELEASE_OBEJSCIE="<powód>"` nie proponujesz — powód
   podaje człowiek sam. Tag niewypchnięty, a poprawiony po odmowie, przenosisz lokalnie dopiero po
   osobnym „tak”.
5. ⚑ `gh release create v<X.Y.Z> --verify-tag --title "RelAI <X.Y.Z>" --notes-file <NOTATKI_EN.md>
   [relai-film-pl.mp4 relai-film-en.mp4]` — szkic notatek pokazany przed pytaniem. Z MP4: rozmiary
   i sumy z `gh release view v<X.Y.Z> --json assets` równe plikom lokalnym (`sha256sum`), a adres
   pobrania każdego odpowiada (`curl -sIL -o /dev/null -w "%{http_code}"` → 200).
6. ⚑ `git push origin main` — **po** wydaniu, nie przed: push `main` z `site/**` albo
   `marketplace.json` wdraża stronę (`strona.yml`), a odtwarzacz wskazujący zasoby wydania bez
   tego wydania gra 404 (L-0280). Potem `gh run list --workflow strona.yml --limit 1` i, przy
   zmianie odtwarzacza, adres na żywo (`curl -s` strony, grep po tagu i czasie filmu).
7. ⚑ `claude plugin marketplace update relai`.
8. ⚑ `claude plugin update relai@relai` i `<mod>@relai` każdego wydanego modu — pełna nazwa
   z marketplace'em.
9. Weryfikacja po publikacji, zaraz po `plugin update`, dla każdego wydanego pluginu osobno —
   bez czekania na restart, bo `--sesja` startuje świeży proces `claude -p`, który czyta nową
   instalację:

   ```bash
   node core/tools/release-verify.js --plugin <relai|relai-mod> --wersja <N.N.N> --sesja
   ```

   Skrypt porównuje cache `~/.claude/plugins/cache/relai/<plugin>/<numer>/` z drzewem tagu (po
   CRLF → LF; pomija `.in_use/`) i sprawdza świeżą sesją `claude -p` binarką aplikacji, że plugin
   ładuje się z katalogu tej wersji. Kod 0 = zgodne; **kod 1 to rozjazd, nie awaria** — raport
   (liczba plików, rozjazdy, brakujące, nadmiarowe, wiersz „Sesja”) stoi w tym samym wyniku, nie
   uruchamiasz go drugi raz; kod 2 = nie da się sprawdzić (brak cache — `plugin update` nie
   nastąpił). Rozjazd zatrzymuje zamknięcie wydania i idzie do człowieka. Restart aplikacji robi
   człowiek dla sesji desktopu, które już działają (P-005) — to pozycja „Do zrobienia przez
   człowieka”, nie warunek tego kroku.
10. Wydanie z modem: **pytanie** (AskUserQuestion) — „W sesji z nowym modem wpisz `/reload-plugins`
   i rzuć okiem na panel: czy wygląda i działa jak przed wydaniem?” z opcjami „ok” / „coś nie tak —
   opiszę”. Wydanie jest zamknięte dopiero po „ok”. Uwaga człowieka to diagnoza (`debugging.md`),
   nie poprawka modu w tej komendzie.

Zmiana w profilu użytkownika (`~/.claude/…`) — wyłącznie ⚑ po osobnym „tak”.

## Zakazy

- Bez „tak” nie tagujesz, nie pushujesz, nie tworzysz wydania GitHub, nie ruszasz marketplace ani
  profilu użytkownika — także w dogfoodingu i przy zielonym raporcie.
- Czerwień poza listą bezpiecznych → komenda nie proponuje tagu.
- Nie omijasz kontroli i nie poprawiasz instrumentu „na szybko”, żeby wyszło zielono: fałszywa
  czerwień to zgłoszenie do człowieka i poprawka w `release-checks.js` z testem.
- W Codeksie i Cursorze ta komenda nie istnieje: fraza „gotowi do wydania?” znaczy tam
  `node core/tools/release-check.js` i raport, bez napraw i bez publikacji.
