# Ustalenia robocze do kart — fakty sprawdzone przy pisaniu planu (2026-11-09)

Materiał wejściowy dla kart etapów E10–E13. Każda pozycja to FAKT odtworzony uruchomieniem na
`main @ 5aeab39`. Karty cytują te liczby zamiast mierzyć je od nowa.

## 1. Testy modów uruchamiają się poza hostem (koryguje raport audytu)

Raport audytu w pierwszej wersji mówił, że testów modów nie da się uruchomić poza hostem. To było
błędne: działa polecenie silnika.

```bash
"$CLAUDE_CODE_EXECPATH" plugin test <katalog modu>
"$CLAUDE_CODE_EXECPATH" plugin validate <katalog modu>
```

- `claude plugin test [dir]` uruchamia każdy `*.test.ts` i `*.test.tsx` pod `dir`, każdy plik
  w procesie potomnym binarki, w środowisku jak dla hooków modu; test importuje zestaw
  z `'claude-code/testing'`; kod 1 przy porażce (tekst pomocy polecenia, Claude Code 2.1.317).
- `$CLAUDE_CODE_EXECPATH` wskazuje binarkę bieżącej sesji; `claude` z `PATH` bywa inną wersją
  (zmierzone: 2.1.317 w sesji, 2.1.321 w `PATH`). Karty używają `$CLAUDE_CODE_EXECPATH`.
- Zwykłe `node --test` na plikach modów kończy się `Cannot find package 'claude-code'` — stąd
  wcześniejsza pomyłka.

Stan wyjściowy, zmierzony na kopiach katalogów w katalogu tymczasowym:

| Mod | Katalog | Testy | Pliki testów | Czas |
|---|---|---|---|---|
| relai-mods | `mods/` | 87 zielonych, 0 czerwonych | 4 | ok. 5 s |
| relai-panel | `panel/` | 216 zielonych, 0 czerwonych | 18 | ok. 15 s |
| relai-progress | `progress/` | 50 zielonych, 0 czerwonych | 2 | ok. 6 s |
| relai-cache-keeper | `cache-keeper/` | 206 zielonych, 0 czerwonych | 15 | ok. 9 s |

- Razem 559 testów modów. Lista plików w katalogu przed i po przebiegu jest identyczna — testy
  niczego nie zapisują w katalogu modu.
- `plugin validate` na `mods/` zgłasza brak `README.md` w katalogu pluginu (`README_MISSING`) —
  stan zastany, poza zakresem planu.
- Czego silnik testów nie ma (z `docs/PULAPKI.md`): `$.plugin.register` i `$.state` w testowym `$`;
  stanu `hover`; prefiksu `refused:` w werdyktach. Zachowanie na żywo po przeładowaniu modu
  sprawdza człowiek.

## 2. K-E6 — skrócenie `docs/ARTEFAKTY.md` jest policzone i ma gotowe narzędzia

Załączniki: [`zalaczniki/skroc-rejestr.js`](zalaczniki/skroc-rejestr.js) i
[`zalaczniki/sprawdz-rejestr.js`](zalaczniki/sprawdz-rejestr.js).

- Reguła skracania: w komórce kolumny „Co się zmieniło” zostaje wpis **bieżącej wersji** — tekst
  do pierwszego wystąpienia wzorca „data, spacja, `(wersja N`” na pozycji większej niż zero;
  resztę zastępuje odsyłacz „Starsze wersje: [plik archiwum](archiwum/artefakty/…)”.
- Jeden wiersz rejestru (linia 52) ma nieucieczkowany znak `|` w treści komórki — dzieli się na
  9 części przy 8 w nagłówku. Naprawa (`\|`) idzie **przed** skróceniem: bez niej 5,5 KB starej
  historii zostaje w osobnej komórce, której skrypt nie widzi.
- Wynik na obecnym rejestrze z naprawą wiersza 52 przed skróceniem (pomiar powtórzony przy pisaniu
  karty K-E6): 145 241 B → 79 466 B; 38 wierszy skróconych ze 118; 127 kluczy `plik|wersja|data`
  (te same reguły co `wierszeRejestru()` w `core/tools/release-checks.js`) identycznych przed i po;
  zero błędów kontroli. Pierwszy pomiar bez naprawy dawał 85 010 B — liczba nieaktualna.
- Liczby dotyczą stanu `main`. Etapy E3–E10 dopisują wiersze do rejestru, więc w etapie E11
  rozmiary będą inne; wiążąca jest kontrola `sprawdz-rejestr.js` (zero błędów, klucze identyczne).
- Skrypt zachowuje końce linii pliku wejściowego.

## 3. K-C7 — po poprawce dopasowania hook zgłosi 142 artefakty zamiast 70

Załącznik: [`zalaczniki/c7-count.js`](zalaczniki/c7-count.js) (uruchamiany z korzenia repozytorium;
`--lista` wypisuje ścieżki).

- Artefaktów śledzonych wg reguły hooka: 232. Zgłaszane dziś (dopasowanie po nazwie pliku): 70.
  Zgłaszane po przejściu na pełną ścieżkę w kolumnie „Plik”: 142.
- Rozkład 142: `adapters/codex/skills` 59 (kopia generowana), `core/process` 42 (fikstury testów
  w `core/process/tests/fixtures/`), `adapters/claude-code/skills` 35 (21 plików
  `trivy-scan/evals` i 14 plików skilla `security-audit` — kopia cudzego skilla na licencji MIT),
  `core/evals` 3 (fikstury), `AGENTS.md` 1, `site/` 2 (noty licencyjne).
- Pomiar pętlą po samym hooku przy pisaniu karty K-C7: po poprawce z wyłączeniami zostaje 14
  ostrzeżeń, a po wpisaniu ścieżek `security-audit` do rejestru — 0 ze 103.
- Wniosek dla karty: sama zmiana dopasowania podwoi liczbę ostrzeżeń. Karta musi razem z nią
  rozstrzygnąć wyłączenia — kopie generowane, fikstury testów i skill przyjęty z zewnątrz nie są
  artefaktami prowadzonymi w rejestrze — albo wpisy zbiorcze w rejestrze. Rejestr nie ma dziś
  ani jednego wpisu z gwiazdką (100 ścieżek w kolumnie „Plik”).

## 4. Testy hooków Claude Code — gdzie są i jak wyglądają

- Hooki testuje się **na hooku**, nie na funkcjach rdzenia: wzór w
  `core/process/tests/prompt-gate.test.js` — `spawnSync` na pliku z
  `adapters/claude-code/hooks/`, payload na stdin, fikstura projektu w `os.tmpdir()`.
- Pliki testów, które odwołują się do hooków Claude Code: `humanize-continuous.test.js`,
  `prompt-gate.test.js`, `resume.test.js`, `ritual-copies.test.js`, `release-check.test.js`,
  `release-pre-push.test.js`.
- Hooki `secret-scanner`, `config-protection`, `console-log-warn`, `doc-sync-reminder`
  i `journal-signature` nie mają dziś testu uruchamiającego sam hook — karty etapów E4 i E5 dodają
  je wg tego wzoru.
