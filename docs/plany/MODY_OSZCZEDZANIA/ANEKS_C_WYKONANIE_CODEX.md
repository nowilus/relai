# Aneks C — etapy E7–E10 wykonuje Codex, Claude weryfikuje (plan MODY_OSZCZEDZANIA)

Data: 2026-11-12 · Po etapie: E6 · Status: **ZAAKCEPTOWANY 2026-11-12** (Łukasz, wywiad po E6:
„Terra + Sol do poprawek”, „Wszystkie na żywo w E10”, „Codex, Claude sprawdza”, „Testy + diff,
przegląd Sol”) · Zmienia: model wykonawczy etapów (`STATUS.md`, D-85 dla tego planu), miejsce
sond i pomiarów na żywo E7–E9, autora dokumentów rytuału. Wzór: Aneks A planu
[OPTYMALIZACJA_PO_AUDYCIE](../../archiwum/plany/OPTYMALIZACJA_PO_AUDYCIE/ANEKS_A_WYKONANIE_CODEX.md)
(E9–E13 wykonane przez Codeksa).

## 1. Powód

Limit Claude na planie Team nie starcza na etapy w Opusie (E5 i E6: sonda, kod, przegląd, pomiar,
rytuał — po kilkaset tysięcy tokenów na etap, SZACUNEK). Łukasz 2026-11-12: „kolejne etapy … codex
i gpt 6.1 sol albo terra wykonują pracę, a claude tylko to weryfikuje i wykonuje minimum
wymaganych kroków”.

## 2. Podział pracy

| Kto | Co robi | Czego nie robi |
|---|---|---|
| **Codex `gpt-6.1-terra`** (lista codex z dnia 2026-11-10, effort `high` z `~/.codex/config.toml`) | czyta prompt etapu, pisze kod i testy (test najpierw), uruchamia testy, które może; **pisze dokumenty rytuału** „Na koniec” punkty 1–5 (`STATUS.md`, `DZIENNIK.md`, `LEKCJE.md`, `PULAPKI.md`, `STATE.md`, `CLAUDE.md` — linia „Aktywny plan”, `ARTEFAKTY.md`, `PROMPT_ETAP_N+1.md`); raport `## Report` | nie commituje, nie robi `git push`, nie wyłącza ani nie włącza pluginów, nie kasuje katalogu roboczego bez zgody (punkt 1a robi Claude po „tak”) |
| **Codex `gpt-6.1-sol`** (ta sama lista, effort `high`) | przegląd kodu (`crew.js review`), poprawki po bramce, gdy usterka jest większa niż kilka edycji | — |
| **Claude** (Opus 5.5 w Claude Code, `/effort medium`) | karta startu i zgoda; plik zadania; `crew.js run` w tle; **bramka**: raport, `git status`, `git diff --stat`, testy i walidatory (także `claude plugin test` — wymaga binarki Claude Code), diff logiki wybiórczo; drobne poprawki (≤ 3 edycje); kasowanie katalogu roboczego po „tak”; propozycja commita | nie pisze kodu etapu, nie pisze dokumentów rytuału od zera, nie uruchamia własnego subagenta przeglądu |

## 3. Sondy i pomiary na żywo — wszystkie w E10

Sonda przed kodem i pomiar na żywo w Claude Code (mod w dev-mods, bramka BenAI, kliknięcia
człowieka) nie da się zrobić w Codeksie. Decyzja: **E7–E9 bez sond i pomiarów na żywo**; kod
dowodzą testy w środowisku testowym silnika (`claude plugin test`) i mutacje. Pomiar na żywo
każdego modu z E7–E9 (oraz ponowny E6 po poprawkach z przeglądu i kliknięcie karty E4) robi
Claude raz, w E10, który i tak planuje pomiar wszystkich modów.

Punkty Weryfikacji promptów E7–E9 o sondzie i pomiarze na żywo zamieniają się w punkt
„przeniesione do E10 (Aneks C)” — nie zostają puste i nie są udawane.

## 4. Przebieg etapu

```
 Claude                                Codex (w tle)                       Łukasz
 1. /relai-stage → karta startu  ─────────────────────────────────────▶  zgoda
 2. STATUS: W TOKU; plik zadania
    = PROMPT_ETAP_N + nakładka (4.1)
 3. node core/process/crew.js run --runtime codex --model gpt-6.1-terra --write … (run_in_background)
                                       ─▶ kod, testy, rytuał 1–5, ## Report
 4. powiadomienie o końcu  ◀────────── koniec procesu
 5. node core/process/crew.js review --runtime codex --model gpt-6.1-sol (w tle)
 6. bramka: raport + przegląd Sol, testy, walidatory, git status/diff
    6a. OK → kasowanie katalogu roboczego (pytanie) → propozycja commita ──▶  zgoda
    6b. drobna usterka → poprawka Claude
    6c. większa → zadanie poprawki dla gpt-6.1-sol z listą znalezisk
    6d. PYTANIE: w raporcie → jedno AskUserQuestion ──────────────────────▶  odpowiedź → kolejny przebieg
```

### 4.1 Nakładka na prompt etapu (Claude dopisuje do pliku zadania)

- Jesteś wykonawcą etapu; Claude w Claude Code po tobie uruchomi testy, przegląd i przeczyta diff.
- „Kontrola modelu” w prompcie jest zastąpiona Aneksem C: działasz na modelu z pliku zadania.
- Wykonujesz „Co przeczytać”, „Zakres etapu”, „Weryfikację” i „Na koniec” punkty 1, 2, 3, 4, 5;
  punkt 1a (kasowanie katalogu roboczego) i 6 (commit) zostawiasz Claude. Nie commitujesz.
- Punkty o sondzie i pomiarze na żywo — oznaczasz „przeniesione do E10 (Aneks C)”.
- Pytanie do człowieka → `PYTANIE:` z opcjami w raporcie i koniec przebiegu przed krokiem zależnym.
- Kotwica nie pasuje, test „najpierw” zielony bez powodu → `STOP:` w raporcie; nie dopasowujesz.
- `claude plugin test` uruchamiasz, gdy binarka działa w twoim sandboksie; nie działa → piszesz to
  w raporcie, bramka uruchomi je w Claude Code.
- Raport `## Report` do ~80 linii (SZACUNEK): punkty Zakresu `- [x]`/`- [ ]`, testy przed (czerwony
  z asercji) i po z komendą i liczbą, każdy punkt Weryfikacji z wynikiem, pliki zmienione,
  odchylenia, `PYTANIE:`/`STOP:`.
- Konwencje projektu obowiązują: polecenia bez `cd`, teksty z backslashem i backtickiem tylko
  edycją pliku, dokumentacja po polsku, kod po angielsku, podpis wpisu
  `Autor: RelAI (gpt-6.1-terra w Codeksie) + Lukasz`.

## 5. Warianty

| Wariant | Plusy | Minusy | Decyzja |
|---|---|---|---|
| **A. Codex pisze kod i rytuał, Claude bramka, przegląd Sol, pomiary w E10** | najmniej tokenów Claude; sprawdzony przebieg `crew.js` z Aneksu A | błędy silnika (budżet hooka, `turn.step`) wyjdą dopiero w E10 | **WYBRANY** |
| B. Claude pisze rytuał (jak Aneks A) | ciągłość stylu dokumentów | największy koszt Claude po etapie | odrzucony wywiadem — limit |
| C. Claude robi sondę i pomiar w każdym etapie | wierniej (zasada 13) | limit Claude w każdym etapie | odrzucony wywiadem — limit |
| D. Przegląd subagentem Claude | dokładniejszy (E6: 3 HIGH) | ok. 80 tys. tokenów Claude na etap (SZACUNEK) | odrzucony wywiadem — limit |

## 6. Ryzyka

| # | Ryzyko | Poziom | Mitygacja |
|---|---|---|---|
| AC1 | Mechanizm modu bez sondy (E7: nadpisanie `effort` w `turn.step` niewidoczne z modu, SONDY.md §4) nie działa na żywo — mod zbudowany na próżno | **wysoki** | E10 zaczyna od pomiaru E7; mechanizm, który nie działa → aneks (tryb tylko sugestii) zamiast łatania; kod E7 trzyma decyzję i wykonanie osobno |
| AC2 | Codex uruchomiony kopią `crew.js` z `.claude/relai/tools/` działa z wyciszonym skanerem sekretów | **wysoki** | wyłącznie `node core/process/crew.js` z repozytorium (jak AX1); punkt w karcie startu |
| AC3 | Terra osłabia test, żeby był zielony | **wysoki** | bramka czyta diff testów w całości; mutacje z raportu powtarzane przez Claude wybiórczo; osłabienie = zadanie poprawki na Sol |
| AC4 | Dokumenty rytuału pisane przez Codeksa rozjeżdżają się ze specyfikacją (`SPEC_DZIENNIK`, `SPEC_PROMPT_ETAPU`) | średni | bramka: walidator adapterów, `count-rules.js`, nagłówki promptu N+1 (dziewięć sekcji); drobne poprawki Claude |
| AC5 | Codex dotyka plików spoza zakresu | średni | `--files` z Zakresu jako granica; `git status --short` w bramce |
| AC6 | Limit Codeksa wyczerpany w trakcie etapu | niski | etap zostaje `W TOKU`, raport częściowy; zasada 5 („Cudze usługi”) |

## 7. Przypadki brzegowe — rozstrzygnięte

- **Bramka manualna BenAI** (wyłączenie bliźniaka na pomiar) — w E7–E9 nie występuje (brak
  pomiarów na żywo); w E10 robi ją Claude za zgodą Łukasza.
- **`claude plugin test` i `plugin validate`** — Codex uruchamia, jeśli może; bramka Claude
  uruchamia je zawsze.
- **`ARTEFAKTY.md`** (prompt sędziego effort w E7) — pisze Codex w rytuale; Claude sprawdza wersję.
- **E10 (migracja, pomiar, wydanie)** — część kodowa i dokumenty przez Codeksa; pomiar na żywo,
  wydanie (`/relai-release`, kroki zewnętrzne po osobnym „tak”) i odinstalowanie paczki BenAI
  (Łukasz) zostają przy Claude i człowieku. Prompt E10 rozpisze to dokładnie.
- **Dwa przebiegi poprawki bez zielonej bramki** — etap zostaje `W TOKU`, Claude pyta Łukasza:
  trzeci przebieg na Sol, przejęcie przez Claude albo odnoga.
