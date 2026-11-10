# PROMPT_ETAP_2 — Pomiary na żywo: werdykty C9 i A6 oraz liczby do wyboru dystrybucji

Plan: OPTYMALIZACJA_PO_AUDYCIE • Etap: **E2 z E14** • Wygenerowano: 2026-11-10 (autor: Opus 5.5, w rytuale „Na koniec” etapu E1) • Wykonawca: **Opus 5.5 na effort medium, świeże sesje (wybór użytkownika, ustalony w Claude Code)** — `/effort medium`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (lista modeli z dnia `2026-10-08`). Jeśli sesja działa na innym modelu — zatrzymaj
> się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom `/effort`:
> `medium` (etap mierzy według kart z gotową procedurą i regułą werdyktu; nic nie projektuje).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| wyjście `node .claude/relai/tools/start-digest.js` | rytuał startu: stan, ryzyka, sprawy człowieka, indeks „Zasad aktywnych”; `CLAUDE.md` ładuje harness — nie czytasz go drugi raz |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/00_KONWENCJE.md` — całość | reguły wspólne: kolejność pracy na karcie, „kotwica nie pasuje → stop”, gałąź, granice, niespodzianki repozytorium (sekcja 6) |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/karty/E02_POMIARY_NA_ZYWO.md` — całość | **to jest zakres etapu**: pięć kart, budżet sesji, zamknięta lista werdyktów, warunki zatrzymania |
| `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/PLAN.html` — wyłącznie wiersz E2 w sekcji 6 (Grep `E02_POMIARY_NA_ZYWO` z kontekstem 3 linii; pliku nie otwierasz w całości — 232 KB z osadzonymi fontami) | cel etapu słowami planu |
| `core/tools/eval-triggers.js` — funkcje `sesja()` i `gitFixtury()` (od kotwicy `const args = ['-p', '--model'`) | wzór instrumentu K-P0: argumenty `claude -p`, `spawn` na Windows, fikstura z gitem |
| `docs/LEKCJE.md` — pełne brzmienie zasad 4, 5, 7 i 13 (sekcja „Pełne brzmienie”) oraz wpis L-0273 | 4: dowodzisz efektem, kontrola pozytywna; 5: instrument bywa źródłem fałszu; 7: werdykt czytany maszynowo; 13: cudze CLI poznajesz z próby; L-0273: `-p` bez `--allowedTools` nie wykona Bash |
| `docs/PULAPKI.md` — P-062 | `claude plugin update`/`install` a zakres `--scope` przy K-G1m |
| `.claude/relai/templates/SPEC_DZIENNIK.md` — format wpisu i linia autora | wpis etapu |
| `docs/DZIENNIK.md` — ostatni wpis (E1) | punkt wyjścia, stan gałęzi, sprawy odroczone |

## Decyzje już podjęte — nie otwierasz ich ponownie

- Plan i karty są **zamrożone** od akceptacji 2026-11-09 (D-33). Rozjazd karty z repozytorium →
  zatrzymujesz się i pytasz; karty nie poprawiasz, zmianę niesie datowany aneks.
- E2 **niczego nie naprawia** — mierzy. Poprawki należą do karty K-C9 (etap E5, czyta werdykt
  `C9:`) i K-A6 (etap E7, czyta werdykt `A6:`). Wariant dystrybucji G1 wybiera właściciel; plan
  go **nie wdraża** (`00_KONWENCJE.md`, sekcja 7).
- Budżet: najwyżej **10** sesji `claude -p` w etapie (1 próbna + 3 dla K-C9m + 6 dla K-A6m), każda
  z `--max-turns 8` i limitem 300 s. Zgoda właściciela z akceptacji planu 2026-11-09; dalsze sesje
  tylko po nowej zgodzie. E2 i E14 to jedyne etapy, w których wolno uruchamiać `claude -p`.
- Ruch sieciowy: jedno pobranie strony `https://code.claude.com/docs/en/plugin-marketplaces`
  w K-G1m (wariant C) — zgoda w akceptacji planu. Próba instalacji wariantu B **wyłącznie po
  osobnym „Tak”** człowieka (bramka w K-G1m, krok 3), w zakresie `local` projektu tymczasowego,
  z marketplace o nazwie `relai-pomiar` i sprzątaniem w tej samej turze.
- Werdykty mają **zamkniętą listę brzmień**: `C9: WIDZI`, `C9: NIE WIDZI`, `A6: POWTARZA`,
  `A6: NIE POWTARZA` — samodzielne linie od początku wiersza w `POMIARY.md` (zasada 7).
- Instrument (`pomiar-sesji.js`, `pomiar-kontrola.js`) mieszka w katalogu roboczym etapu, nie
  w repozytorium; liczba testów repozytorium się nie zmienia.
- Gałąź `optymalizacja/po-audycie` do wydania; bez `git push`, bez tagów i bez zmiany numerów
  wersji aż do E14.
- Granica zakresu: w E2 jedynym nowym plikiem śledzonym jest
  `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/POMIARY.md`, plus dokumenty rytuału „Na koniec”. Nie
  zmieniasz `journal-signature.js` (E5), `session-context.js` ani `hooks.json` (E7),
  `.claude-plugin/marketplace.json` ani `plugin.json` (wybór G1 należy do właściciela), żadnego
  pliku pod `core/`, `adapters/`, `hooks/`, `panel/`, `progress/`, `mods/`, `cache-keeper/`.

## Stan wyjściowy (co realnie zastajesz)

RelAI 3.7.0; w sesji działają hooki **zainstalowanego** pluginu 3.7.0, a sesje `claude -p`
z `--plugin-dir <repo>` uruchamiają plugin **z gałęzi**. Gałąź `optymalizacja/po-audycie` wychodzi
z `main @ 5aeab39`: commit `f3c5fbe` (dokumenty planu) i commit etapu E1 (jeśli człowiek go
zaakceptował — sprawdź `git log --oneline -3`; brak commita E1 → zmiany E1 leżą w drzewie
roboczym, zostawiasz je i pytasz, zanim zaczniesz).

Etap E1 (2026-11-10) zmienił wyłącznie dokumenty: wiersz „Tryb ciągły” w `docs/USTAWIENIA.md` jest
**`wyłączony`** (sesja startuje bez bramki zgody optymalizatora), `STATE.md` mówi prawdę o zasięgu
pluginu, kolejność frazy „kończymy na dziś” w `CLAUDE.md`/`AGENTS.md` zgodna z procedurą, aneks
D-14 w `DECYZJE.md`. Pięć spraw przeterminowanych odroczono 2026-11-10 — nie wrócą przed
2026-12-10.

`CLAUDE_CODE_EXECPATH` wskazuje binarkę bieżącej sesji (Claude Code 2.1.321 w dniu generacji);
`claude --version` odczytaj na starcie i wpisz do `POMIARY.md`.

```
core/tools/eval-triggers.js                 wzór sesja() — kotwica w linii 127
core/evals/fixtures/relai/                  fikstura: CLAUDE.md, docs/{DZIENNIK,STATE,USTAWIENIA}.md;
                                            ostatnia linia dziennika: Autor: RelAI (Opus 5.5) + tester
adapters/claude-code/hooks/journal-signature.js   systemMessage w liniach 127 i 143 (K-C9m — mierzysz)
adapters/claude-code/hooks/session-context.js     if (input.source === 'compact') w linii 201 (K-A6m — mierzysz)
.claude-plugin/marketplace.json             "source": "./" (relai) i ./panel, ./progress, ./cache-keeper, ./mods
docs/plany/OPTYMALIZACJA_PO_AUDYCIE/        PLAN.html, STATUS.md (E1 ZREALIZOWANY, E2 GOTOWY DO STARTU),
                                            PROMPT_ETAP_1.md (12/12), ten plik, karty/
adapters/*/skills/relai-planning/*-closing.md   cztery pliki M z pustym git diff (końce linii) — nie ruszasz
.claude/launch.json                         nieśledzony, spoza planu — nie dodajesz do commita
```

**Czego jeszcze nie ma:** instrumentu `pomiar-sesji.js` z kontrolą; werdyktów `C9:` i `A6:`;
tabeli trzech wariantów dystrybucji z liczbami; pliku `POMIARY.md`; bramki manualnej „wybór
wariantu G1” w `STATUS.md`.

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

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E2/`.** Wszystko
> tymczasowe — skrypty pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam.
> Artefakt, który z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego
> repozytorium), wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

Karta K-P0 każe trzymać instrument w „katalogu scratchpad sesji”; w tym etapie tym miejscem jest
katalog roboczy powyżej (przeżywa przerwanie sesji i ma raport sprzątania). Fikstury sesji
i katalogi wariantu B powstają w `os.tmpdir()` z przedrostkiem `relai-pomiar-`, jak każe karta.

Wykonujesz karty z `karty/E02_POMIARY_NA_ZYWO.md` w podanej kolejności, każdą według sekcji 2
konwencji. Kart nie łączysz.

1. **K-P0 — instrument.** `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E2/pomiar-sesji.js`
   i `pomiar-kontrola.js` (narzędziem Write); kontrola z atrapą `RELAI_CLAUDE` — cztery przypadki
   z karty, najpierw czerwona z właściwego powodu; potem **jedna sesja próbna** (1/10). Kształt
   zdarzeń strumienia inny niż w karcie → stop.
2. **K-C9m — kanał `systemMessage`.** Trzy sesje na świeżych fiksturach, prompt z karty dosłownie;
   kontrola pozytywna po każdej; reguła werdyktu z karty (`C9: WIDZI` tylko przy ≥2 ważnych
   i wszystkich widzących).
3. **K-A6m — wznowienie.** Trzy pary sesji (`--resume` w tym samym katalogu); kontrola pozytywna
   pary; reguła werdyktu z karty; liczba tokenów wejścia z jednej pary jako informacja.
4. **K-G1m — warianty dystrybucji.** Wariant A — liczenie skryptem w katalogu roboczym; wariant B —
   katalog kontrolny w `os.tmpdir()`, `plugin validate`, liczba miejsc ze ścieżkami, potem
   **pytanie bramki z karty** (AskUserQuestion) i próba instalacji tylko po „Tak”, ze sprzątaniem
   w tej samej turze; wariant C — jedno pobranie strony dokumentacji, ocena na papierze.
5. **K-P9 — `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/POMIARY.md`.** Struktura dokładnie z karty;
   linie `C9:` i `A6:` z zamkniętej listy.
6. **Git.** Bez `push`. Jeden commit etapu, proponowany w rytuale „Na koniec”.

Licznik sesji prowadzisz jawnie (np. `sesja 4/10`) w notatkach i we wpisie dziennika. Błąd
logowania albo limitu `claude -p` → zapisujesz komunikat, najwyżej jedno ponowienie, potem stop
i pytanie. Wątek spoza kart → zatrzymujesz się i pytasz: odnoga, aneks czy „świadomie odłożone”.

## Weryfikacja (wszystkie punkty muszą przejść)

Każdy punkt, który przeszedł, odhaczasz w tym pliku (`- [ ]` → `- [x]`) zaraz po jego sprawdzeniu,
nie na końcu etapu; punkt, który nie przeszedł, zostaje pusty.

- [ ] K-0 (konwencje, sekcja 3): `git branch --show-current` → `optymalizacja/po-audycie`.
- [ ] K-P0: `node .claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E2/pomiar-kontrola.js` → cztery
      asercje przechodzą, kod 0 (a przed implementacją instrumentu była czerwona z asercji).
- [ ] K-P0: sesja próbna → `kod: 0`, niepuste `sesjaId`, `tekstKoncowy` zawiera `OK`; zdarzenia
      w pliku strumienia mają kształt z karty.
- [ ] K-C9m: tabela trzech przebiegów (ważny, początek odpowiedzi, widzi) i werdykt zgodny z regułą
      karty.
- [ ] K-A6m: tabela trzech par (ważna, liczba `start-digest.js` w sesji 1 i 2) i werdykt zgodny
      z regułą karty.
- [ ] Budżet: łączna liczba sesji `claude -p` ≤ 10, zapisana we wpisie dziennika i w linii
      „Wykonano” `POMIARY.md`.
- [ ] K-G1m: tabela trzech wariantów wypełniona liczbami; odpowiedź człowieka z bramki instalacji
      zapisana we wpisie dziennika.
- [ ] K-G1m sprzątanie: `"$CLAUDE_CODE_EXECPATH" plugin marketplace list` nie zawiera
      `relai-pomiar`; `ls ~/.claude/plugins/cache/` nie zawiera `relai-pomiar`; w `os.tmpdir()`
      nie ma katalogów `relai-pomiar-*`.
- [ ] K-P9: narzędziem Grep (tryb `count`) w `POMIARY.md`: `^C9: (WIDZI|NIE WIDZI)$` → `1`,
      `^A6: (POWTARZA|NIE POWTARZA)$` → `1`.
- [ ] Granica: `git status --short` pokazuje z tego etapu wyłącznie `POMIARY.md` i dokumenty
      rytuału (`STATUS.md`, `PROMPT_ETAP_2.md`, `PROMPT_ETAP_3.md`, `DZIENNIK.md`, `STATE.md`);
      pod `adapters/` wyłącznie cztery zastane `*-closing.md`.
- [ ] Bramka manualna „wybór wariantu dystrybucji G1” stoi w sekcji „Bramki manualne”
      `STATUS.md` ze statusem `OTWARTA`.
- [ ] Wpis etapu jest na końcu sekcji „Wpisy” w `docs/DZIENNIK.md`, z podpisem
      `Autor: RelAI (Opus 5.5) + Lukasz`.
- [ ] Katalog roboczy: (a) `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E2/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”, liczby przed i po we
      wpisie dziennika; (b) artefakty spoza katalogu (fikstury `relai-pomiar-*` w `%TEMP%`,
      wpisy konfiguracji Claude Code) wypisane z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap nie jest ukończony)

1. `docs/plany/OPTYMALIZACJA_PO_AUDYCIE/STATUS.md` — E2 → `ZREALIZOWANY <data>`, E3 →
   `GOTOWY DO STARTU`, jedna linia w dzienniku wdrożenia; link w kolumnie `Prompt` przy E3 zaraz
   po kroku 5.
1a. Katalog roboczy `.claude/relai/work/OPTYMALIZACJA_PO_AUDYCIE/E2/` — raport, „tak”, kasowanie;
   liczby przed i po do wpisu z kroku 2, artefakty spoza katalogu z nazwy.
2. Wpis w `docs/DZIENNIK.md` wg `SPEC_DZIENNIK.md`: Zrobione / Zweryfikowane — jak dokładnie
   (tabele z `POMIARY.md` w skrócie, licznik sesji) / Świadomie odłożone / Do zrobienia przez
   człowieka (co najmniej: wybór wariantu G1); podpis `Autor: RelAI (Opus 5.5) + Lukasz`.
   Przejrzyj tabelę „Stan otwartych ryzyk” (M6 — flagi CLI — dostaje adnotację, jeśli pomiar
   pokazał zmianę flag); lekcje z etapu → `docs/LEKCJE.md`.
3. Bramki manualne w `STATUS.md` — każda nierozstrzygnięta pozycja z „Do zrobienia przez
   człowieka” tego wpisu dostaje linię `OTWARTA` w sekcji „Bramki manualne” (sekcję tworzysz wg
   `SPEC_STATUS.md`, jeśli jej nie ma).
4. `docs/STATE.md` — zdanie o stanie planu (E2 zrealizowany, werdykty C9 i A6, E3 gotowy). Tabeli
   „Stan prac” w `CLAUDE.md` nie dotykasz.
5. **Wygeneruj `PROMPT_ETAP_3.md`** wg `stage-prompts.md` i `SPEC_PROMPT_ETAPU.md` — z wiersza E3
   w sekcji 6 `PLAN.html`, z `karty/E03_SKANER_I_PRECOMMIT.md`, z realnego stanu repozytorium po
   tym etapie i z lekcji tego etapu. E3 jest pierwszym etapem z kodem: testy najpierw, liczba
   testów `core/guardrails` po E3 według tabeli narastającej konwencji.
6. Commit — propozycja, jeden commit etapu; bez `git push`.
