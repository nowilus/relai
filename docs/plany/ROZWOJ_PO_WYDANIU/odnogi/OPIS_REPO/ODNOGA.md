# ODNOGA — opis repozytorium na GitHubie

Plan: [ROZWOJ_PO_WYDANIU](../../STATUS.md) · Etap-źródło: E1 — Odnoga planu · Utworzona: 2026-08-12 ·
Status: **OTWARTA** · Wykonawca: Opus

## Cel

`gh repo view nowilus/relai --json description` zwraca jedno zdanie mówiące, czym RelAI jest i dla
kogo — dziś zwraca `""` (FAKT, sprawdzone 2026-08-12), więc na liście repozytoriów i w wynikach
wyszukiwania GitHuba projekt nie mówi o sobie nic.

## Skąd się wzięła

Aneks A do planu (2026-08-12) rozstrzygnął, że repo jest już publiczne, i zostawił pusty opis jako
zadanie etapu E8 — czyli na koniec ośmioetapowego planu. Repo jest publiczne **teraz**, więc każdy
dzień bez opisu to dzień, w którym trafiający tam człowiek nie wie, na co patrzy. Wątek nie mieści
się w zakresie E1 (odnogi) i nie zmienia planu — jest dokładnie tym, po co odnogi powstały.

## Zakres

1. **Opis repozytorium** — jedno zdanie po angielsku, spójne z `description` w
   `.claude-plugin/plugin.json` („Your project remembers everything — documentation-first process
   framework for Claude Code"). Ustawiane przez `gh repo edit`.
2. **Tematy repozytorium** (`repositoryTopics`, dziś `null`) — zestaw z listy `keywords`
   `.claude-plugin/plugin.json`, bez wymyślania nowych.

## Poza zakresem

- Sekcja README, banner, ikony — wizytówka repo jest gotowa od 2026-08-10.
- `homepageUrl` — wymaga decyzji, czy projekt ma stronę; nie ma jej dziś.
- Cokolwiek z zakresu E8 poza opisem: wydanie 2.0.0, sekcje README per narzędzie, dystrybucja.

## Weryfikacja

- [ ] `gh repo view nowilus/relai --json description` zwraca niepuste zdanie, identyczne
      z `description` z `.claude-plugin/plugin.json`.
- [ ] `gh repo view nowilus/relai --json repositoryTopics` zwraca listę zgodną z `keywords`
      manifestu (co do zestawu, nie kolejności).
- [ ] Żaden plik w repozytorium nie został zmieniony — to zmiana po stronie GitHuba
      (dowód negatywny: `git status --short` pusty poza dokumentami zamknięcia odnogi).

## Wynik

—
