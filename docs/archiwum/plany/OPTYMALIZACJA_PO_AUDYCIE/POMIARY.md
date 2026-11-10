# POMIARY — plan OPTYMALIZACJA_PO_AUDYCIE, etap E2

Wykonano: 2026-11-10 · Claude Code 2.1.321 · sesji `claude -p`: 10 z 10

## Werdykty (czytane przez karty K-C9 i K-A6)

C9: NIE WIDZI
A6: NIE POWTARZA

## C9 — kanał systemMessage

| Przebieg | Ważny | Początek odpowiedzi modelu | Widzi |
|---|---|---|---|
| 1 | tak | KOMUNIKAT: BRAK | nie |
| 2 | tak | KOMUNIKAT: BRAK | nie |
| 3 | tak | KOMUNIKAT: BRAK | nie |

Kontrola mechanizmu (poza regułą karty): w transkrypcie każdej z trzech sesji na dysku
(`~/.claude/projects/…/<session_id>.jsonl`) stoi tekst `[RelAI journal-signature] Ostatni wpis
dziennika (…` — hook wystrzelił po zapisie, a model komunikatu nie dostał. Strumień `stream-json`
zdarzeń `PostToolUse` nie niesie (L-0263).

## A6 — wznowienie sesji

| Para | Ważna | start-digest w sesji 1 | start-digest w sesji 2 |
|---|---|---|---|
| 1 | nie | 0 | 0 |
| 2 | nie | 0 | 0 |
| 3 | nie | 0 | 0 |

Werdykt wynika z gałęzi „mniej niż dwie pary ważne” reguły karty, nie z dowodu braku powtórzenia:
na prompt „Odpowiedz jednym slowem: OK.” model w żadnej sesji pierwszej nie uruchomił rytuału
startu, więc kontrola pozytywna pary nie przeszła ani razu. Informacje z tych samych przebiegów:

- Hook startu przy `--resume` dostaje `SessionStart:resume` i wstrzykuje ten sam blok co przy
  starcie (2005 znaków, jedno wystąpienie `start-digest`) — koszt kontekstu jest, wykonanie
  rytuału zależy od modelu.
- Pierwsze wywołanie sesji drugiej (para 1): `input_tokens` 4, `cache_read_input_tokens` 48 220,
  `cache_creation_input_tokens` 142.

## G1 — warianty dystrybucji

Jednostka: MiB (jak w raporcie audytu). Stan gałęzi `optymalizacja/po-audycie` 2026-11-10: 1600
plików śledzonych, 114,5 MiB, z czego `docs/` 93,3, `site/` 14,0, warstwa wykonawcza (`core/`,
`adapters/`, `hooks/`, manifesty) 3,8. Na dysku: wersja 3.7.0 w cache 118 MiB, każda z wersji
3.5.0–3.7.0 117–118 MiB; klon marketplace `relai` 203 MiB (jeden, z historią gita).

| Wariant | Waga pluginu na wersję | Co się zmienia w repozytorium | Zmierzone czy na papierze | Ryzyko |
|---|---|---|---|---|
| Dziś | 114,0 MB (FAKT) | — | zmierzone | — |
| A. Media poza repozytorium | 36,6 MiB | 389 plików do przeniesienia (77,9 MiB); 91 linków w 27 plikach `docs/**/*.md` do przepięcia | zmierzone | `site/` (14,0 MiB) i dokumenty zostają w każdej wersji, a przepięte linki do mediów zależą od zewnętrznego miejsca. |
| B. Plugin w podkatalogu | 3,8 MiB (431 plików; 4,8 MiB zajętości w cache po instalacji) | 200 miejsc w narzędziach repozytorium: `core/MANIFEST.json` 9, `core/tools/release-map.json` 126, `core/tools/validate-adapters.js` 65; 25 ścieżek `CLAUDE_PLUGIN_ROOT` wskazuje na `adapters/` i działa bez zmiany | walidacja (`plugin validate` kod 0) i instalacja (`relai@relai-pomiar`, zakres `local`, posprzątana) | Zachowanie pluginu z podkatalogu w świeżej sesji niezmierzone (budżet sesji wyczerpany), a przeniesienie dotyka narzędzi wydania. |
| C. Gałąź albo podkatalog w źródle gitowym | ok. 3,8 MiB, SZACUNEK (warstwa wykonawcza) | skrypt wydania buduje gałąź albo tag z samą warstwą wykonawczą i wpisuje w `marketplace.json` źródło `github` z `ref` (albo `git-subdir` z `url` i `path`); mody zostają przy ścieżkach `./panel` itd. w tym samym marketplace | na papierze | Dodatkowa gałąź do utrzymania w zgodzie z tagiem i nowy krok publikacji, który może się rozjechać. |

Udokumentowane postaci pola `source` (strona `plugin-marketplaces`, odczyt 2026-11-10): ścieżka
względna od korzenia marketplace (bez `..`), `github` (`repo`), `git-subdir` (`url`, `path`),
`url`, `archive`, `npm`, `command`; źródła gitowe przypina się polem `ref` albo `sha`.

Rekomendacja techniczna: A — zmniejsza wagę trzykrotnie, ale nie usuwa dokumentów z pluginu, więc
sam nie wystarcza; B — najmniejsza waga zmierzona instalacją, koszt to 200 miejsc w narzędziach
wydania i jedna sesja kontrolna przed wdrożeniem; C — ta sama waga co B bez przenoszenia plików
w repozytorium, kosztem gałęzi wydania i zależności od sieci przy instalacji. Wybór należy do
właściciela.
