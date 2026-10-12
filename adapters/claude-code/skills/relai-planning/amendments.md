# Aneksy i odchylenie fundamentalne (D-33)

Plik doczytywany skilla `relai-planning`. Otwierasz go, gdy człowiek prosi o zmianę
w zaakceptowanym (zamrożonym) planie albo gdy zmienia się sam cel planu.

## Aneksy

Każda zmiana zamrożonego planu to **datowany aneks** dopisywany do sekcji „Aneksy" na końcu
`PLAN.md`. Kolejno: A, B, C… Aneks zawiera datę, powód zmiany i treść zmiany — a nie „poprawiony"
tekst sekcji.

Gdy użytkownik prosi o zmianę w zaakceptowanym planie, **nie edytujesz sekcji**. Odpowiadasz
propozycją aneksu w jednym zdaniu i pokazujesz jego treść do zatwierdzenia:

> To zmiana w zamrożonym planie — proponuję **Aneks B (2026-08-14)**: rezygnacja z etapu E4 na rzecz
> gotowej biblioteki, powód: dwa dni pracy vs zależność, którą i tak mamy. Dopisać?

Sekcje 1–N planu zostają dokładnie takie, jakie były w dniu akceptacji. Czytający po pół roku ma
widzieć, co uzgodniono pierwotnie **i** co się potem zmieniło — nie wygładzoną wersję końcową.

## Odchylenie fundamentalne

Aneks obsługuje zmianę **wewnątrz** planu. Gdy zmienia się sam cel albo wybrany wariant przestaje
obowiązywać — to jest odchylenie fundamentalne, nie aneks. Sygnały: unieważniony cel z sekcji
„Cele", odrzucony wariant wraca jako wybrany, przepada więcej niż połowa nieukończonych etapów.

Wtedy:

1. `STATUS.md`: status planu → `CZĘŚCIOWO ZREALIZOWANY <data>` z jednym zdaniem powodu.
2. Wpis w `DZIENNIK.md`: co zostało dowiezione, co przepadło i dlaczego.
3. Nowy plan w nowym folderze, z **linkiem do starego** w streszczeniu.
4. Stary folder planu → `docs/archiwum/` (D-18: nigdy ciche kasowanie).
5. `CLAUDE.md`: linia aktywnego planu wskazuje nowy plan.
