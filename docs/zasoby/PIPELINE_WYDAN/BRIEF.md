# BRIEF — pipeline wydań RelAI

Wejście do sesji planowania (wywiad AskUserQuestion → plan). Nie jest planem ani decyzją.
Spisany 2026-10-25, po wydaniu 3.3.0 i `relai-panel` 0.21.1–0.21.2. Liczby: FAKT z repozytorium
tego dnia, chyba że stoi SZACUNEK.

## Cel (słowami Łukasza, 2026-10-25)

Pełny pipeline cyklicznych wydań RelAI, który:

1. ustala, **co nowego wchodzi** do wydania (komendy, hooki, skille, mody, decyzje procesu),
2. ocenia **wpływ na istniejące komponenty** — co wymaga rozszerzenia, co zmiany,
3. ma **automatyczne zasady**, które przed wydaniem pilnują, że każdy komponent odzwierciedla
   wydawaną wersję,
4. ma **frazę albo komendę on-demand**, która sprawdza gotowość do wydania, a brakujące punkty
   wykonuje — tak automatycznie, jak się da.

Komponenty, które muszą odpowiadać wydanej wersji (co najmniej): README na GitHubie, strona
w wersjach **Film** i **Biurko** (PL i EN), **film promocyjny**. Przykład z rozmowy: nowa komenda →
wszystkie te miejsca zaktualizowane, inaczej wydania nie ma.

## Co pilnuje dziś (FAKT)

| Mechanizm | Co sprawdza | Czego nie widzi |
|---|---|---|
| `core/tools/validate-adapters.js` | 7 źródeł numeru wersji (manifesty, marketplace, baner README, „Gdzie jesteśmy” w STATE), wersje modów w marketplace, parytet skilli Codeksa, metadane 16 komend, noty licencji, rytuał „Na koniec” | liczb w prozie README (komendy, hooki), treści strony i filmu, rejestru artefaktów |
| `site/narzedzia/fakty.mjs` + `zbuduj.mjs` + testy strony (370) | `fakty.json` z repo (liczba komend, wersje), strony z faktów, fiszka EN każdej komendy | treści tekstów strony poza faktami; wdrożenie `strona.yml` dopiero po pushu |
| `adapters/codex/generate-skills.js --verify`, `core/tools/sync-panel-core.js --check` | kopie skilli Codeksa, rdzeń panelu w czterech modach | — |
| testy rdzenia / panelu / Codeksa, `claude plugin test` modów | zachowanie | zgodność dokumentów z wydaniem |
| prompt etapu wydania (ręczny, np. BEZPIECZENSTWO E6) | lista kroków: numery, `grep -r` starej wersji, `history.md`, `ARTEFAKTY.md`, kontrole, notatki, publikacja, cache po CRLF → LF, świeża sesja | — to jest lista dla modelu, nie automat |

## Luki zmierzone przy 3.3.0 (FAKT, 2026-10-24/25)

- README: tabela hooków miała 11 wierszy przy 13 hookach — żaden automat tego nie widział.
- `ARTEFAKTY.md`: trzy artefakty bez wpisu od `v3.2.0`; dwa z nich przegapione już przy 3.2.0.
  Złapała to dopiero kontrola L-0161 (skrypt roboczy, jednorazowy).
- Strona: budowa przerwana po podbiciu do 16 komend (brak fiszki EN `relai-security`) — wykryte
  lokalnie przypadkiem, push wywróciłby `strona.yml`.
- **Film stoi na 3.0.0:** finał pokazuje `RelAI 3.0.0`, dane (`src/dane/manifest.json`,
  `panel.json`, `paski.json`) z dnia wydania 3.0.0; strona gra MP4 z zasobów wydania `v3.0.0`.
  7 z 36 testów filmu czerwonych na bieżącym repo (odnoga FILM_TESTY_V3 — przypiąć testy do
  `v3.0.0`).
- Panel: dwa błędy widoczne dopiero na żywo po wydaniu (lista planów, karta etapu) — testy były
  zielone, bo opisywały stare zachowanie.
- Lista modeli w pluginie (`adapters/claude-code/MODELE.md`, 2026-09-24) starsza niż kopia
  projektu (2026-10-08).
- Kroki wydania wykonywał model wg promptu etapu; kolejność i zgody (publikacja, profil
  użytkownika) — ręcznie, dwa razy pytane.

## Pytania do wywiadu (każde zmienia pracę)

1. **Rytm i wyzwalacz:** wydanie po zamknięciu planu, w stałym rytmie czy na żądanie? Czy
   pipeline sam proponuje wydanie, gdy od tagu uzbiera się zmiana?
2. **Film:** każde wydanie aktualizuje film (render PL+EN, zasoby wydania), tylko gdy zmienia się
   to, co film pokazuje (komendy, panel), czy film jest „wizytówką wersji głównej” (3.0, 4.0) z
   adnotacją na stronie? Koszt renderu i weryfikacji — SZACUNEK do zmierzenia.
3. **Strona Film i Biurko:** wystarczą fakty z repo (dziś), czy treści opisowe też muszą mieć
   kontrolę (np. lista komend w tekście, zrzuty panelu)?
4. **Zakres „wpływu”:** mapa „typ zmiany → komponenty do ruszenia” jako deklaratywna tabela
   w repo (np. nowa komenda → README, KOMENDY, panel, Codex, Cursor, strona, film), czy wykrywana
   z diffu od ostatniego tagu?
5. **Twarda bramka czy raport:** czy komenda blokuje tag/publikację (pre-push, CI), czy daje raport
   z listą do zrobienia i wykonuje to, co bezpieczne?
6. **Co wolno automatowi zrobić samemu**, a co tylko po „tak”: regeneracje (strona, kopie),
   podbicie numerów, wpisy `history.md` / `ARTEFAKTY.md`, render filmu, tag, wydanie GitHub,
   marketplace, sprzątanie profilu.
7. **Forma wywołania:** fraza („gotowi do wydania?”), komenda `/relai-release`, oba? Tylko
   w tym repozytorium (narzędzie budowy RelAI) czy także dla projektów użytkowników RelAI?
8. **Mody:** wydawane razem z rdzeniem zawsze, czy pipeline wykrywa zmiany modu od jego tagu
   i proponuje własny numer (jak 0.21.1 dziś)?
9. **Weryfikacja na żywo:** czy świeża sesja na zainstalowanej wersji i rzut oka na panel są
   obowiązkowym krokiem pipeline'u (dziś złapały dwa błędy panelu)?
10. **CI:** GitHub Actions dla kontroli (dziś tylko `strona.yml`), czy wszystko lokalnie?

## Wstępne kierunki (do oceny w planie, nie wybrane)

- **A. Manifest wydania + kontrola zgodności:** deklaratywna mapa komponentów i ich źródeł prawdy
  (`core/MANIFEST.json`, `site/dane/fakty.json`, dane filmu), walidator rozszerzony o README,
  `ARTEFAKTY.md`, film; komenda czyta raport i prowadzi kroki.
- **B. Pipeline jako plan-szablon:** stały „plan wydania” generowany z diffu od tagu, etapy jak
  dziś (prompt etapu), bramki manualne na publikację.
- **C. CI-first:** GitHub Actions blokuje tag bez zielonej kontroli; lokalna komenda tylko
  odtwarza CI i naprawia.

## Granice

- Nie zmienia zachowania komend użytkownika; dotyczy procesu wydań repozytorium RelAI (chyba że
  pytanie 7 rozstrzygnie inaczej).
- Plan PANEL_CODEX (Codex) i jego pliki poza zakresem.
- Publikacja i zmiany w profilu użytkownika zawsze po zgodzie (dzisiejsza zasada planów).

## Materiał do przeczytania w sesji planowania

`docs/archiwum/plany/BEZPIECZENSTWO/PROMPT_ETAP_6.md` (ostatni ręczny przebieg wydania),
`docs/DZIENNIK.md` (wpisy 2026-10-25), `core/tools/validate-adapters.js`, `site/narzedzia/`,
`docs/zasoby/film/README.md`, `docs/fixy/FILM_TESTY_V3/ODNOGA.md`, `.github/workflows/strona.yml`.
