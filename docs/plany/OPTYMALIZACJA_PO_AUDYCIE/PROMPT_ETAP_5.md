# PROMPT_ETAP_5 — Hook poleceń powłoki i siatka Stop: sekret w `Bash` blokowany, `bash-guard` ostrzega, przypomnienia trafiają do modelu

Plan: OPTYMALIZACJA_PO_AUDYCIE • Etap: **E5 z E14** • Wygenerowano: 2026-11-10 (autor: Opus 5.5, w rytuale „Na koniec” etapu E4) • Wykonawca: **Opus 5.5 na effort medium, świeże sesje (wybór użytkownika, ustalony w Claude Code)** — `/effort medium`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-11-10`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `medium` (karty niosą kod docelowy `bash-guard.js`, tabelę 26 przypadków i przypadki testowe
> sprawdzone na prototypie; praca jest wierną realizacją, nie projektowaniem).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wyjście `node .claude/relai/tools/start-digest.js` | rytuał startu: stan, ryzyka, sprawy człowieka, indeks „Zasad aktywnych”; `CLAUDE.md` ładuje harness — nie czytasz go drugi raz |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/00_KONWENCJE.md` — całość | kolejność pracy na karcie (test najpierw, czerwony z asercji), „kotwica nie pasuje → stop”, komendy testów, tabela narastająca, sekcja 6 (hooki sesji 3.7.0, backslash, ASCII, `cd`) |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/E05_HOOK_POLECEN_I_STOP.md` — całość | **to jest zakres etapu**: trzy karty, rozstrzygnięcie D-41, pytanie startowe (a)/(b), kod `bash-guard.js`, tabela przypadków, miejsca dla piętnastego hooka |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/PLAN.html` — wyłącznie wiersz E5 w sekcji 6 (Grep `E05_HOOK_POLECEN_I_STOP` z kontekstem 3 linii; pliku nie otwierasz w całości — 232 KB) | cel etapu słowami planu |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/POMIARY.md` — linia `C9:` (Grep `^C9:`) | werdykt dla karty K-C9; dziś `C9: NIE WIDZI` |
| `adapters/claude-code/hooks/secret-scanner.js`, `hooks.json`, `doc-sync-reminder.js`, `journal-signature.js` | pliki trzech kart; kotwice z pól „Stan dziś” |
| `core/process/tests/prompt-gate.test.js`, `hook-project-scope.test.js` (E4) i `humanize-continuous.test.js:281-287` | wzór fikstury, wywołania hooka, składania sekretu w czasie działania i odczytu grup `hooks.json` |
| `docs/LEKCJE.md` — pełne brzmienie zasad 3, 5, 12 i 13 (sekcja „Pełne brzmienie”) | 3: dowód negatywny; 5: backslash tylko Write/Edit, kontrola pozytywna, `cd` w Bash; 12: guardrail nie zatrzymuje nie-sekretu; 13: payload hooka po zdjęciu BOM, schemat wyjścia |
| `docs/DZIENNIK.md` — ostatni wpis (E4) | punkt wyjścia: liczba testów `core/process` (372), ścieżka K-C10, sprawy odłożone (komentarz linii 6 `secret-scanner.js`) |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan i karty są **zamrożone** od akceptacji 2026-11-09 (D-33). Kotwica nie pasuje, test „najpierw”
  jest czerwony z innego powodu niż asercja albo `POMIARY.md` nie ma linii `C9:` z wartością
  `WIDZI` / `NIE WIDZI` → zatrzymujesz się i pytasz; karty nie poprawiasz.
- **D-41 bez zmian:** blokują wyłącznie `secret-scanner` i `config-protection`. Skan sekretu
  w poleceniu `Bash` trafia do `secret-scanner.js` (rejestracja na `^Bash$`), a `bash-guard.js`
  wyłącznie ostrzega (rozstrzygnięcie karty E05). Aneksów wolno w planie tylko do D-14, D-40, D-88,
  D-93 — D-41 do nich nie należy.
- **Pytanie startowe etapu** (jedno AskUserQuestion, dwie części, przed pierwszą zmianą — karta E05):
  (a) skan sekretu w `secret-scanner`, `bash-guard` tylko ostrzega — „Tak (Rekomendowane)” / „Nie —
  chcę decyzji zmieniającej D-41”; (b) ponieważ `POMIARY.md` mówi `C9: NIE WIDZI`: przenieść
  przypomnienie hooka Stop na `additionalContext` — „Przenieść (Rekomendowane)” / „Zostawić
  komunikat dla człowieka”. Odpowiedź „Nie” na (a) → kart K-D8 i K-E3 nie wykonujesz. Odpowiedzi
  do wpisu dziennika.
- Kolejność kart: **K-D8 → K-E3 → K-C9**. Kart nie łączysz; commit jest jeden na etap.
- E4 dał wszystkim czternastu hookom `HOOK` / `nazwaBledu` / `slad` przed pierwszym `require`,
  guardom `pytajPoAwarii` i zdejmowanie BOM, `secret-scanner` — `wKatalogu` i `stanGita`.
  `bash-guard.js` z karty niesie ten sam blok; `doc-sync-reminder.js` ma już `slad` (karta K-E3
  na nim polega). Testy E4 (`hook-failures`, `hook-project-scope`, `config-protection-crlf`) nie
  mogą się zaczerwienić.
- Kontrola `readme-hooki` w `release-check.js` jest **czerwona od E5 do K-E9 w E14** — stan
  oczekiwany. Liczebników słownych o liczbie hooków nie ruszasz (lista miejsc w karcie K-E3, pole
  „Nie ruszasz”).
- Gałąź `optymalizacja/po-audycie` do wydania; bez `git push`, bez tagów i bez zmiany numerów
  wersji aż do E14. W sesji działają hooki **zainstalowanego** pluginu 3.7.0 — sesja nie blokuje
  sekretu w `Bash` i nie ma `bash-guard`; dowodem są wyłącznie testy.
- Granica zakresu: `secret-scanner.js`, `hooks.json`, nowy `bash-guard.js`, `doc-sync-reminder.js`,
  `journal-signature.js`, wiersze w `README.md` i `docs/PRZEWODNIK.md` wskazane kartami, cztery nowe
  testy w `core/process/tests/`. Reguł `core/guardrails/secret-scan.js` (E3), hooków Cursora
  i Codeksa (E6), kosztu startu (E7), trybu ciągłego (E9), liczebników (E14), C5/C8/C11/C12, D10,
  D11 — nie ruszasz.

## Stan wyjściowy (co realnie zastajesz)

RelAI 3.7.0; w sesji działają hooki zainstalowanego pluginu 3.7.0. Gałąź `optymalizacja/po-audycie`
ma commity `f3c5fbe` (plan), `86358ef` (E1), `d129566` (E2), `2ee8cb3` (E3) i — jeśli człowiek go
przyjął — commit etapu E4 (`git log --oneline -6`; brak commita E4 → zmiany E4 w hookach leżą
w drzewie roboczym, zostawiasz je i pytasz, zanim zaczniesz).

```
adapters/claude-code/hooks/
  hooks.json                PreToolUse: jedna grupa ^(Write|Edit|MultiEdit|NotebookEdit)$
                            (secret-scanner, config-protection); grupy ^Bash$ nie ma
  secret-scanner.js         po E4: slad + pytajPoAwarii, BOM, wKatalogu(root, abs), stanGita
                            trojstanowa; nadal "const filePath = ti.file_path || ti.notebook_path"
                            i "const finding = scanText(payload);" (kotwice K-D8); linia 3
                            naglowka "PreToolUse (Write/Edit)"
  doc-sync-reminder.js      po E4: slad przed require; kotwica K-E3 "const files = out.split"
                            (l. 71), komunikat systemMessage (l. 81)
  journal-signature.js      po E4: slad; wlasna funkcja ostatniWpis (l. 98, ostatni naglowek
                            "### " w pliku); dwa systemMessage (l. 133, 149)
  bash-guard.js             NIE ISTNIEJE
core/process/session-signals.js   eksport ostatniWpis (l. 1032) - wpis o najpozniejszej dacie, tekst
docs/plany/OPTYMALIZACJA_PO_AUDYCIE/POMIARY.md   linia 7: "C9: NIE WIDZI"
README.md:199               wiersz | `secret-scanner` | blokuje zapis klucza do pliku sledzonego przez gita | hook | hook |
docs/PRZEWODNIK.md          wiersze | **sekretow** | (l. 126) i | **smieci diagnostycznych** | (l. 130)
core/process/tests/         372 testy (FAKT, wpis E4); brak secret-scanner-d8, bash-guard,
                            doc-sync-reminder, journal-signature
core/guardrails/tests/      33 testy (stan po E3)
adapters/*/skills/relai-planning/*-closing.md   cztery pliki M z pustym git diff (konce linii) - nie ruszasz
.claude/launch.json         niesledzony, spoza planu - nie dodajesz do commita
```

Testy: `node --test "core/process/tests/*.test.*"` trwa ok. 110 s (SZACUNEK z konwencji) —
uruchamiaj w tle albo z limitem 10 minut, **z katalogu repozytorium ścieżką względną w podpowłoce**:
glob ze ścieżką `/c/...` daje w Node na Windows 0 testów (L-0311). Po etapie według karty:
`core/process` **389** (372 + 5 K-D8 + 9 K-E3 + 3 K-C9 przy `NIE WIDZI`; FAKT dla bazy, SZACUNEK
dla sumy — wiążąca jest suma od wpisu E4), `core/guardrails` 33 bez zmian. `validate-adapters.js`:
kod 0, linie `wywolania z hooks.json: 20` i `odwolania z kodu adapterow do rdzenia: 29` (dziś 18
i 26, FAKT z E4).

**Czego jeszcze nie ma:** skanu sekretu w poleceniu `Bash` i w treści pliku złożonej z edycji;
grupy `^Bash$` w `PreToolUse`; hooka `bash-guard.js` (cztery nawyki powłoki: gołe `cd`, `sed -i` na
`.md`, backslash w heredoku albo `node -e` / `python -c`, `/tmp/` z Node); przypomnienia Stop
o commitach kodu od daty ostatniego wpisu dziennika; wyboru najnowszego wpisu w
`journal-signature` dla dziennika malejącego; kanału `additionalContext` dla przypomnień
(`C9: NIE WIDZI`).

**Zasady aktywne — indeks z rejestru lekcji** (stan 2026-11-10; D-15 Aneks A: start czyta indeks,
pełne brzmienie doczytujesz z `docs/LEKCJE.md` przy trafieniu w wyzwalacz):

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
  zadaniu: weryfikację planujesz tam, gdzie wykonalna; po pytaniu sprzątasz sam; jednostką
  inwentarza jest sprawa, nie linia; wstawkę kotwiczysz do elementu, który przeżyje operację,
  i dowodzisz **obecności** nowej treści. Gdy prompt etapu przeczy regule dokumentu docelowego —
  wygrywa dokument, rozjazd do dziennika. Opcja pytania, która odwołuje się do wariantu planu,
  cytuje jego definicję z planu.
- **15 · Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są
  ASCII** — dodajesz pytanie do człowieka, komponent opcjonalny albo komunikat hooka; każda praca
  nad wyglądem (mod, panel, strona, film, scena 3D, makieta).

Z etapu E4 (lekcja L-0311): polecenie Bash nie zawiera `cd` poza podpowłoką `( cd … && … )` — także
`cd` do korzenia repo na początku łańcucha; drugi `cd` w łańcuchu przestawił katalog sesji. Seria
mechanicznych podmian w kilku hookach poszła skryptem pisanym Write z kontrolą „kotwica dokładnie
raz” i `grep` po bajtach wstawionego backslasha — ten wzorzec pasuje do K-D8/K-C9, gdy podmian jest
więcej. Pomocnik testu, który parsuje stdout hooka, najpierw asertuje „stdout niepusty” — inaczej
test jest czerwony z `JSON.parse`, nie z asercji.

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E5/`.** Wszystko
> tymczasowe — skrypty pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam.
> Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego
> repozytorium), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

Fikstury testów powstają w `os.tmpdir()` (`relai-d8-`, `relai-e3-` itd.) i sprząta je `t.after`.

0. **Pytanie startowe** (karta E05, dwie części) — przed pierwszą zmianą; odpowiedzi do wpisu.
1. **K-D8 — `adapters/claude-code/hooks/secret-scanner.js`, `hooks.json`, `README.md`,
   `docs/PRZEWODNIK.md`**: grupa `^Bash$` w `PreToolUse` z `secret-scanner`; import
   `relaiMarkerFile`; `odmow(msg)`, `skanujPolecenie(cwd, ti)` przed `const filePath`;
   `zastosuj`, `sekretZlozony` z `LIMIT_PELNEGO_SKANU` i `bezCR`; `scanText(payload) ||
   sekretZlozony(...)`; nagłówek linii 3; wiersze README i PRZEWODNIK. Test
   `core/process/tests/secret-scanner-d8.test.js` (nowy, 5 przypadków).
2. **K-E3 — nowy `adapters/claude-code/hooks/bash-guard.js`** (kod z karty), dopięty w grupie
   `^Bash$` **po** `secret-scanner`; `doc-sync-reminder.js`: `ostatniWpis` z rdzenia,
   `commityBezWpisu` (jedno `git log --since="<data> 00:00:00"`, limit 5 s, `--max-count=200`),
   nowy blok w `main`, zdanie w komentarzu nagłówka; wiersze `bash-guard` w README i „nawyków
   powłoki” w PRZEWODNIK. Testy `core/process/tests/bash-guard.test.js` (7 przypadków, tabela 26
   poleceń) i `core/process/tests/doc-sync-reminder.test.js` (2 przypadki).
3. **K-C9 — `adapters/claude-code/hooks/journal-signature.js`**: `ostatniWpis` z rdzenia (krok 1
   karty, zawsze); przy `C9: NIE WIDZI` oba `systemMessage` → `hookSpecificOutput` z
   `hookEventName: 'PostToolUse'`; `doc-sync-reminder.js` → `hookEventName: 'Stop'` tylko przy
   odpowiedzi „Przenieść” na (b), `stop_hook_active` zostaje. Test
   `core/process/tests/journal-signature.test.js` (nowy, 3 przypadki przy `NIE WIDZI`).
4. **Git.** Bez `push`. Jeden commit etapu (`feat:` albo `fix:` po angielsku, conventional),
   proponowany w rytuale „Na koniec”.

Wszystkie komunikaty i ślady **tylko ASCII** (`bash-guard` — łącznik `-`, nie półpauza). Kod
z backslashem przenosisz z karty narzędziem Write/Edit (nigdy powłoką ani `node -e`); polecenia
z backslashem w testach składasz przez `String.fromCharCode(92)`; testy nie zawierają gotowego
przypisania sekretu ani w kodzie, ani w nazwie przypadku. Wątek spoza kart → zatrzymujesz się
i pytasz: odnoga, aneks czy „świadomie odłożone”.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt Weryfikacji, który przeszedł, odhaczasz w `PROMPT_ETAP_5.md` (`- [ ]` → `- [x]`)
zaraz po jego sprawdzeniu, nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [ ] K-0 (konwencje, sekcja 3): `git branch --show-current` → `optymalizacja/po-audycie`;
      `grep -c "function slad" adapters/claude-code/hooks/doc-sync-reminder.js` → 1 (E4 zamknięty).
- [ ] Pytanie startowe zadane przed pierwszą zmianą; odpowiedzi (a) i (b) zapisane we wpisie
      dziennika; `grep -n "^C9:" docs/plany/OPTYMALIZACJA_PO_AUDYCIE/POMIARY.md` → `C9: NIE WIDZI`.
- [ ] Testy przed zmianą: każda karta ma zapisany w katalogu roboczym przebieg czerwony z właściwego
      powodu (K-D8: 1, 3, 4, 5 czerwone z asercji, 2 czerwony z asercji grupy; K-E3: 7 czerwonych
      — brak hooka daje kod 1 na asercji kodu 0 — oraz przypadki główne obu testów
      `doc-sync-reminder`; K-C9: przypadki dziennika malejącego czerwone z asercji).
- [ ] `node --test core/process/tests/secret-scanner-d8.test.js` → 5 pass;
      `bash-guard.test.js` → 7 pass; `doc-sync-reminder.test.js` → 2 pass;
      `journal-signature.test.js` → 3 pass.
- [ ] `node --test "core/process/tests/*.test.*"` → **389 pass** (albo suma od wpisu E4 plus delta
      kart, opisana), 0 fail; `node --test "core/guardrails/tests/*.test.js"` → 33 pass. Żaden
      istniejący test nie zmieniony (`git status --short core/process/tests` pokazuje wyłącznie
      cztery nowe pliki).
- [ ] `hooks.json`: grupa `PreToolUse` pasująca do `Bash` ma polecenia dokładnie
      `secret-scanner.js`, `bash-guard.js` w tej kolejności; grupa `Write` nie pasuje do `Bash`.
- [ ] Efekt widoczny z karty (fikstura w katalogu roboczym, hooki z repozytorium): polecenie
      `export` z sekretem składanym w czasie działania → `deny` z `w poleceniu powloki`; polecenie
      `cd x && y` → `additionalContext` z `golego cd`, bez `permissionDecision`; hook Stop po
      commicie kodu bez wpisu dziennika → jedno zdanie `Od ostatniego wpisu dziennika`.
- [ ] `node core/tools/validate-adapters.js` → kod 0, jedno ostrzeżenie (`security-audit/SKILL.md`),
      `wywolania z hooks.json: 20`, `odwolania z kodu adapterow do rdzenia: 29`.
- [ ] `node core/tools/release-check.js --tylko readme-hooki` → dokładnie jeden błąd (proza
      „czternaście”, hooków 15) — stan oczekiwany do K-E9 w E14; README ma wiersz `bash-guard`,
      a wiersz `secret-scanner` kończy się „i polecenie powłoki z kluczem”.
- [ ] Bezpieczeństwo (D-91): `/relai-security` (skan Trivy) — zero nowych CRITICAL i HIGH
      wprowadzonych w tym etapie, liczby według wagi do wpisu (etap nie dodaje zależności; zastane —
      fikstury ewaluacji `trivy-scan` — nie blokują; po E4: 0 CRITICAL, 42 HIGH). Trivy brak → zapis
      „brak pliku zależności w `adapters/claude-code/hooks/` i `core/`” z wynikiem
      `git ls-files adapters/claude-code/hooks core | grep package.json` (pusty).
- [ ] Podstawy na zmianie etapu: polecenie i treść pliku nie trafiają do komunikatu ani śladu
      (komunikaty `deny` mówią „Wartosc nie zostala zacytowana celowo”, `grep -n "e.message"` w
      diffie hooków — żadne nowe trafienie w kodzie); `git grep -nE
      "sk_live_[A-Za-z0-9]{16}|github_pat_[A-Za-z0-9_]{22}"` → 0; Grep po `PASSWORD=` i `TOKEN=`
      w czterech nowych testach → 0 gotowych przypisań.
- [ ] Granica: `git status --short` pokazuje z tego etapu wyłącznie pliki z pól „Pliki” trzech kart
      (`secret-scanner.js`, `hooks.json`, `bash-guard.js`, `doc-sync-reminder.js`,
      `journal-signature.js`, `README.md`, `docs/PRZEWODNIK.md`, cztery nowe testy) i dokumenty
      rytuału (`STATUS.md`, `PROMPT_ETAP_5.md`, `PROMPT_ETAP_6.md`, `DZIENNIK.md`, `STATE.md`,
      ewentualnie `LEKCJE.md`); pod `adapters/*/skills/relai-planning/` wyłącznie cztery zastane
      `*-closing.md`.
- [ ] Wpis etapu jest na końcu sekcji „Wpisy” w `docs/DZIENNIK.md`, z liczbą testów `core/process`
      389 (albo zgodną z sumą, opisaną), z odpowiedziami (a) i (b), z wynikiem K-C9 i podpisem
      `Autor: RelAI (Opus 5.5) + Lukasz`.
- [ ] Katalog roboczy: (a) `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E5/` przejrzany
      (`node .claude/relai/tools/clean-work.js raport`; katalog otwartego etapu raport pomija —
      wtedy liczby z `find`/`du`) i skasowany po „tak”, liczby przed i po we wpisie dziennika;
      (b) artefakty spoza katalogu (fikstury `%TEMP%/relai-d8-*`, `relai-e3-*` i pozostałe z testów)
      wypisane z nazwy razem z tym, co się z nimi stało.

Najtwardszy punkt to pełny zestaw `core/process` (389): K-E3 dokłada piętnasty hook i zmienia
`doc-sync-reminder`, który ma już test E4 (`hook-failures`, przypadek 5 — zepsute wejście daje
jedną linię śladu). Spadek albo czerwony istniejący test → zatrzymujesz się i opisujesz test i hook,
zamiast zmieniać test.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/STATUS.md` — E5 → `ZREALIZOWANY <data>`, E6 →
   `GOTOWY DO STARTU`, jedna linia w dzienniku wdrożenia (zastępuje linię „E5 rozpoczęty”); link
   w kolumnie `Prompt` przy E6 zaraz po kroku 5.
1a. Katalog roboczy `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E5/` — raport, „tak”, kasowanie;
   liczby przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. Wpis w `docs/DZIENNIK.md` wg `SPEC_DZIENNIK.md`: Zrobione / Zweryfikowane — jak dokładnie
   (liczby testów przed i po, odpowiedzi (a)/(b), wynik K-C9, wynik Trivy) / Świadomie odłożone
   (komentarz linii 6 `secret-scanner.js` z E4, jeśli K-D8 go nie objął) / Do zrobienia przez
   człowieka; podpis `Autor: RelAI (Opus 5.5) + Lukasz`. Przejrzyj tabelę „Stan otwartych ryzyk”
   (P1 — adaptery, C1 — API modów); lekcje z etapu → `docs/LEKCJE.md`.
3. Bramki manualne w `STATUS.md` — każda nierozstrzygnięta pozycja z „Do zrobienia przez
   człowieka” tego wpisu dostaje linię `OTWARTA` w sekcji „Bramki manualne” (sekcja już jest,
   z bramką G1 i trzema z E3).
4. `docs/STATE.md` — zdanie o stanie planu (E5 zrealizowany: sekret w `Bash`, `bash-guard`, siatka
   Stop po commitach, liczba testów `core/process`; E6 gotowy). Liczebników hooków (`czternastoma
   hookami`) nie zmieniasz — E14. Tabeli „Stan prac” w `CLAUDE.md` nie dotykasz.
5. **Wygeneruj `PROMPT_ETAP_6.md`** wg `stage-prompts.md` i `SPEC_PROMPT_ETAPU.md` — z wiersza E6
   w sekcji 6 `PLAN.html`, z `karty/E06_ADAPTERY_I_ZALOGA.md`, z realnego stanu repozytorium po tym
   etapie i z lekcji tego etapu. Liczby po E6 według tabeli narastającej konwencji: `core/process`
   395–396, `adapters/codex` 28, `adapters/cursor` 10 (SZACUNEK; wiążąca jest suma od wpisu E5).
6. Commit — propozycja, jeden commit etapu; bez `git push`.
