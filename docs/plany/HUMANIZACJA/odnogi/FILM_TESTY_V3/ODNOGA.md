# ODNOGA — testy faktów i pasków filmu 3.0.0 przypięte do commitu wydania

Plan: [HUMANIZACJA](../../STATUS.md) · Etap-źródło: E1 — Komenda na żądanie · Utworzona: 2026-10-14 ·
Status: **OTWARTA** · Wykonawca: Opus 5.5 w świeżej sesji

## Cel

`node --test docs/zasoby/film/zrodla/testy/*.test.mjs` przechodzi 36/36 na bieżącym repozytorium
i dalej przechodzi po dowolnej zmianie repo niezwiązanej z filmem, bo testy faktów i pasków liczą
dane filmu z drzewa commitu wydania `v3.0.0` (git worktree), a nie z drzewa roboczego.

## Skąd się wzięła

2026-10-14, pomiar bazowy E1 planu HUMANIZACJA: pięć testów filmu padało już przed etapem. Testy
porównują `manifest.json`, `panel.json` i `paski.json` z danymi przeliczonymi na bieżącym repo,
a repo poszło dalej po wydaniu 3.0.0 (więcej testów rdzenia, plan FILM_PREZENTACYJNY w archiwum,
`docs/plany/FILM_PREZENTACYJNY/STATUS.md` nie istnieje). Łukasz wybrał przypięcie do `v3.0.0`
zamiast regeneracji danych filmu albo ignorowania czerwieni.

## Zakres

1. `docs/zasoby/film/zrodla/testy/fakty.test.mjs` — testy „manifest.json equals the manifest
   computed again”, „positive control: a changed copy of a source gives a changed fact”,
   „panel.json equals the data computed again” liczą dane z worktree `v3.0.0`.
2. `docs/zasoby/film/zrodla/testy/paski.test.mjs` — „the plan and progress bars of paski.json equal
   core/panel” i jego kontrola pozytywna czytają `STATUS.md` i `core/panel` z worktree `v3.0.0`.
3. Wspólny pomocnik worktree (np. w `docs/zasoby/film/zrodla/testy/` albo `skrypty/`): zakłada
   worktree `v3.0.0` w katalogu tymczasowym ze slugiem `relai-`, sprząta go po przebiegu; brak tagu
   → test mówi to wprost, nie przechodzi po cichu.

## Poza zakresem

- Dane filmu (`src/dane/*.json`, `public/`), sceny, render — nietknięte; żadnego `npm run przygotuj`.
- `wiernosc.test.mjs` — scena 4 już przypięta do komend wydania 3.0.0 (E1 HUMANIZACJA, decyzja
  2026-10-14).
- Plan HUMANIZACJA i jego etapy.

## Weryfikacja

- [ ] `node --test docs/zasoby/film/zrodla/testy/*.test.mjs` → 36/36 na bieżącym repo.
- [ ] Ten sam przebieg po podłożonej zmianie w drzewie roboczym, która przewracała test przed
      odnogą (np. dopisany plik testu rdzenia), nadal 36/36; kontrola pozytywna każdego testu nadal
      wykrywa podłożony defekt w kopii z `v3.0.0`.
- [ ] Po przebiegu `git worktree list` nie ma worktree założonego przez testy.
- [ ] `git diff --stat` dotyka wyłącznie plików testów filmu (i pomocnika).
- [ ] Katalog roboczy `.claude/relai/work/HUMANIZACJA/FILM_TESTY_V3/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po we
      wpisie dziennika, artefakty spoza niego (worktree w `%TEMP%`) wypisane z nazwy.

## Wynik

—
