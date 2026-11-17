# POMIAR NA ŻYWO — E3 planu MODY_OSZCZEDZANIA (2026-11-11)

Sesja 6defc1f3, Claude Code 2.1.321, desktop, Windows, tryb auto. Kopia `input-router/` jako
`relai-input-router` w `~/.claude/dev-mods/6defc1f3…/` (skill `plugin-authoring` przed zapisem,
L-0322). Bramka: `input-router@token-saving-mods` wyłączony (`claude plugin disable`, user) za
zgodą Łukasza; wyłączenie zadziałało w sesji dopiero po `/reload-plugins` (pierwszy odczyt po
`disable` dał jeszcze notatki BenAI). Materiał: `nightly.log` (1500 linii, 127 754 zn.),
`small.log` (120 linii, 10 099 zn.), `umowa.pdf` (8 stron, reportlab), kopie w scratchpadzie sesji.

## Odczyty

| Odczyt | Wynik | Tokeny przed → po | Haiku in / out |
|---|---|---|---|
| `Read` pliku pod `.claude/relai/work/…` (1500 linii) | dosłownie (plik procesu), silnik uciął do 468 linii | — | 0 wywołań |
| `Read` `PROMPT_ETAP_3.md` (146 linii, > 2000 tok.) | dosłownie | — | 0 wywołań |
| `Read` `docs/DZIENNIK.md` (259,8 KB) | błąd silnika „exceeds 256KB” przepuszczony, bez rekordu | — | 0 wywołań |
| `Read` `small.log` | notatki z nagłówkiem RelAI, L61 = ERROR, ścieżka kopii | 2525 → 661 | 5 948 / 1 418 (7,8 s) |
| ten sam `Read` drugi raz | z pamięci (`notes-memory`), ta sama treść | 2525 → 661 | 0 wywołań |
| `Read` `umowa.pdf` | notatki z `pdftotext` bez `pdfinfo` (FAKT: brak `pdfinfo` na natywnym PATH), klauzula 6.20 trafiona | 9718 → 551 | 6 049 / 1 200 |
| `cat small.log` (po prośbie Łukasza „sprawdź, czy nocne zadanie się powiodło”) | notatki odpowiadają na prośbę („Bottom line: … does not show whether …succeeded”) | 2525 → 587 | 5 947 / 1 482 |
| `cat nightly.log`, przed poprawką | notatki z **uciętego** stdout (355 linii); silnik i tak dał modelowi 2 KB podglądu i ścieżkę | 7500 → 585 (**zawyżone**) | 16 956 / 1 508 |
| `cat nightly.log`, po poprawce | przepuszczone (`persistedOutputPath`) | — | 0 wywołań |

## Rejestr i zakładka „Oszczędności”

Skrypt `suma.mjs` (katalog roboczy): surowe linie rejestru sesji vs `savingsView` (funkcja
zakładki, filtr „ten czat”) — **zgodne co do tokena**: 5 rekordów, oszczędność 21 748 tokenów,
Haiku 4 wywołania, in 34 900 / out 5 608. Zakładki w panelu nie klikano (wariant „a” wybrany przez
Łukasza: zainstalowany `relai-panel` 0.22.2 nie ma jeszcze zakładki z E2).

## Wnioski

- **Bash ponad ~30 tys. znaków** (pole `persistedOutputPath`): model dostaje 2 KB podglądu
  niezależnie od modu, a hook widzi stdout ucięty — notatki nic nie oszczędzają i kosztują
  Haiku. Poprawka w `bashRoute` (`isPersisted` → przepuść), test w `route.test.ts`. Rekord
  `Bash 7500 → 585` z przebiegu sprzed poprawki zostaje w rejestrze (zawyża sumę o ~6,9 tys.
  tokenów; rejestr wygasa po 14 dniach).
- **Cięcie linii 2000 znaków (spec 1:1) w PDF:** `pdftotext` sklejał wiersze strony w jedną linię,
  więc końcówki klauzul nie dotarły do Haiku; notatki to zgłosiły (`[line cut]`). Do decyzji
  w E10 (pomiar): `-layout` albo cięcie z zawijaniem.
- **Bilans:** 21 748 tokenów modelu głównego mniej za 34 900 / 5 608 tokenów Haiku (zawyżony
  rekord wliczony). Bez niego: ~14 850 mniej za 17 944 / 4 100.
