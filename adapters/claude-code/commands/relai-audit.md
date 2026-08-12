---
description: Raport o stanie dokumentacji projektu — porządki i zdrowie — zakończony listą propozycji do zatwierdzenia; niczego nie zmienia sam
argument-hint: "[porzadki|zdrowie] — opcjonalne zawężenie do jednej części raportu"
---

# /relai-audit — przegląd porządków i zdrowia projektu

Argument (opcjonalny): `$ARGUMENTS`

Twoje zadanie: **napisać raport**. Nie posprzątać. Komenda kończy się listą propozycji, a każda
zmiana czeka na „tak" od człowieka (D-45).

---

## Krok 0 — czy to projekt RelAI

Marker `Wersja RelAI:` w `docs/USTAWIENIA.md` (albo odpowiedniku). Brak → jedno zdanie i koniec.

## Krok 1 — co czytasz

Audyt jest **przeglądem stanu faktycznego**, nie streszczeniem dokumentów. Zbierz:

| Źródło | Co z niego bierzesz |
|---|---|
| `docs/` (lista plików + daty modyfikacji) | co istnieje i kiedy było ruszane |
| `docs/STATE.md` | co projekt twierdzi o sobie dzisiaj |
| `docs/DZIENNIK.md` | data ostatniego wpisu, tabela ryzyk, otwarte „Do zrobienia przez człowieka" |
| `docs/USTAWIENIA.md` | wersja RelAI projektu, preferencje |
| `docs/plany/*/STATUS.md` | plany otwarte, etapy `W TOKU`, brakujące prompty etapowe |
| `CLAUDE.md` | linia „Aktywny plan" — czy wskazuje na istniejący plik |
| `git status`, `git log -1` | niezacommitowane zmiany, data ostatniego commita |
| rozmiary plików `docs/*.md` | kandydaci do rotacji (D-14: dziennik > 50 KB) |

Projekt bez gita → pomijasz wiersze o gicie i mówisz o tym jednym zdaniem, zamiast zgłaszać błąd.

## Krok 2 — część pierwsza raportu: PORZĄDKI

Szukasz rzeczy, które zaśmiecają, nie rzeczy, które bolą. Każde znalezisko z **konkretną ścieżką**.

| Co sprawdzasz | Sygnał |
|---|---|
| Pliki nieaktualne | dokument z blockquote „NIEAKTUALNE" poza `docs/archiwum/` (D-18) |
| Plany zamknięte | folder w `docs/plany/` ze statusem `ZREALIZOWANY` — należy do `docs/archiwum/plany/` (D-36) |
| Dziennik ponad próg | `docs/DZIENNIK.md` > 50 KB albo obejmuje więcej niż kwartał → propozycja rotacji (D-14) |
| Lekcje bez destylatu | wpisy `L-NNNN`, których nie ma w sekcji „Zasady aktywne" (D-15) |
| Martwe odsyłacze | linki Markdown w `CLAUDE.md` i `docs/*.md` prowadzące do nieistniejących plików |
| Pliki poza konwencją | dokumenty w korzeniu projektu poza `CLAUDE.md` i `README.md` (D-11); nazwy z datą lub wersją poza snapshotami i backupami (D-12) |
| Osierocone zasoby | pliki w `docs/zasoby/`, do których nic nie linkuje |

Nic nie znalezione → napisz to jednym zdaniem. Pusta sekcja jest dobrą wiadomością, nie luką
w raporcie.

## Krok 3 — część druga raportu: ZDROWIE

Tu szukasz rozjazdów między tym, co projekt **mówi**, a tym, co **jest**.

| Co sprawdzasz | Sygnał |
|---|---|
| Świeżość `STATE.md` | starszy niż ostatni wpis dziennika albo niż ostatni commit → stan opisuje przeszłość (D-44) |
| Dług dokumentacyjny | commity zmieniające kod bez wpisu w dzienniku z tego samego dnia |
| Spójność `STATE` z repo | `STATE` mówi o module, katalogu albo środowisku, którego nie ma; albo milczy o czymś dużym, co jest |
| Ryzyka | pozycje `OTWARTE` bez ruchu od ponad miesiąca; ryzyka bez mitygacji; ryzyka „zmierzone" bez daty pomiaru |
| Zaległości człowieka | „Do zrobienia przez człowieka" z wpisów starszych niż dwa tygodnie, wciąż bez adnotacji o rozstrzygnięciu |
| Plany | etap `W TOKU` bez ruchu; etap `GOTOWY DO STARTU` bez pliku promptu (D-34); linia „Aktywny plan" wskazująca plan zamknięty |
| Wersja | `Wersja RelAI:` projektu różna od wersji zainstalowanego pluginu → wzmianka, że migracją zajmie się `/relai-update`, gdy powstanie |
| Sekrety | ślad sekretu w pliku śledzonym przez gita (D-42) — to jest **jedyna pozycja krytyczna** raportu |

Znalezisko o sekrecie raportujesz **na samej górze**, przed wszystkim innym, i nazywasz je wprost
sprawą do natychmiastowego rozstrzygnięcia. Wartości sekretu **nie cytujesz** — podajesz plik,
linię i rodzaj.

## Krok 4 — układ raportu na ekranie

Piszesz na ekran (nie do pliku). Kolejność stała:

1. **Jedno zdanie werdyktu** — np. „Projekt jest zdrowy; do posprzątania trzy drobiazgi."
2. **Porządki** — lista, każda pozycja: *co* · *gdzie* · *dlaczego to zaśmieca*.
3. **Zdrowie** — lista, każda pozycja: *rozjazd* · *dowód* (ścieżka, data, liczba) · *skutek*.
4. **Propozycje do zatwierdzenia** — numerowana lista **działań**, nie obserwacji. Każda w formie
   „przenieść X do Y", „dopisać Z do W", „zamknąć ryzyko R3". Przy każdej — czy jest odwracalna.
5. **Pytanie** — „Które mam wykonać? (numery, »wszystkie«, albo »żadne«)".

Raport bez sekcji propozycji jest niedokończony. Obserwacja bez proponowanego działania nie
zasługuje na miejsce w raporcie — albo wiesz, co z tym zrobić, albo to nie jest znalezisko.

## Krok 5 — po odpowiedzi użytkownika

Dopiero teraz wolno Ci cokolwiek zmienić, i **wyłącznie** to, co wskazał.

- Przeniesienia i archiwizacja: wg D-18 — blockquote „NIEAKTUALNE — zastąpione przez X, dnia Y,
  powód Z" **plus** przeniesienie. Nigdy ciche kasowanie.
- Zmiany w `CLAUDE.md` (sekcja niemutowalna) i `docs/USTAWIENIA.md` są chronione hookiem
  `config-protection` — potwierdzenie jest wymagane osobno. Blokada nie zwalnia z zapisu: jeśli
  zmiany nie da się wykonać, powiedz to wprost.
- Wykonane zmiany → wpis w `docs/DZIENNIK.md` w tej samej turze (D-44).
- Nic nie wybrano → kończysz bez zmian i bez wpisu. Sam raport nie jest zmianą funkcjonalną.

---

## Zakazy tej komendy

- **Nie kasujesz, nie przenosisz i nie edytujesz niczego przed zgodą** — także rzeczy oczywistych.
  To jest dowód negatywny D-45: po samym `/relai-audit` katalog `docs/` musi mieć identyczną sumę
  kontrolną jak przed.
- Nie proponujesz zmian w kodzie — audyt dotyczy dokumentacji i porządku, nie architektury.
- Nie cytujesz znalezionych sekretów.
- Nie zgłaszasz braku pliku, którego dana wersja RelAI jeszcze nie tworzy.
- Nie zamieniasz raportu w listę życzeń: pozycja bez ścieżki, daty albo liczby nie jest
  znaleziskiem.
