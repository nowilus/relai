---
description: Oprowadza po projekcie wyłącznie na podstawie jego dokumentów — stan, mapa, plany, ryzyka, od czego zacząć
argument-hint: "[krotko] — opcjonalnie skrócona wersja, sam stan i pierwszy krok"
---

# /relai-tour — wycieczka po projekcie

Argument (opcjonalny): `$ARGUMENTS`

Ta komenda jest dla kogoś, kto **właśnie otworzył cudzy projekt** (D-27). Twoje zadanie: opowiedzieć,
co to jest i od czego zacząć — **wyłącznie z dokumentów**, na ekran, bez tworzenia jakiegokolwiek
pliku.

Różnica wobec `/relai-handover`: tam powstaje plik HTML do wysłania dalej; tutaj jest rozmowa
tu i teraz.

---

## Krok 0 — czy to projekt RelAI

Marker `Wersja RelAI:` w `docs/USTAWIENIA.md` (albo odpowiedniku). Brak → powiedz jednym zdaniem,
że ten folder nie ma dokumentacji RelAI, więc nie ma po czym oprowadzać, i zaproponuj zwykłe
rozejrzenie się po repo. Niczego nie inicjalizujesz.

## Krok 1 — co czytasz

Ta sama kolejność co w rytuale startu sesji, powiększona o dwie pozycje. Nic poza tym — zakaz
pełnotekstowego skanowania repo obowiązuje tak samo.

| # | Plik | Co z niego bierzesz |
|---|---|---|
| 1 | `CLAUDE.md` | reguły procesu, linia „Aktywny plan" |
| 2 | `docs/STATE.md` | cały — jest krótki |
| 3 | `docs/DZIENNIK.md` | tabela „Stan otwartych ryzyk" + **trzy ostatnie** wpisy |
| 4 | `docs/LEKCJE.md` | wyłącznie „Zasady aktywne" |
| 5 | `docs/DECYZJE.md` | wyłącznie zamrożone zakazy — rzeczy, których nowy nie ma proponować |
| 6 | `docs/USTAWIENIA.md` | preferencje, które ma respektować |
| 7 | `docs/plany/*/STATUS.md` | plany otwarte i ich etapy |
| 8 | `README.md` | jak to uruchomić |

Pliku, którego nie ma, po prostu nie czytasz — nie zgłaszasz tego jako błędu. Brak `STATE.md`
w starszym projekcie odnotowujesz jednym zdaniem w sekcji „Czego dokumenty nie mówią".

## Krok 2 — co mówisz (kolejność stała)

1. **Co to jest** — dwa–trzy zdania: po co ten projekt istnieje i komu służy. Bez żargonu z kodu.
2. **Gdzie jesteśmy** — co działa, co jest w toku, kiedy był ostatni ruch (data ostatniego wpisu
   dziennika i ostatniego commita).
3. **Mapa dokumentów** — krótka tabela: plik · po co jest · kiedy zajrzeć. Tylko pliki, które
   naprawdę istnieją.
4. **Plany i etapy** — aktywny plan, etap ostatnio zamknięty, etap następny, model wykonawczy.
   Brak planów → jedno zdanie.
5. **Otwarte ryzyka** — każde w jednej linii, z poziomem. Bez skracania mitygacji do zera.
6. **Czego tu nie wolno** — zamrożone decyzje i zasady aktywne, które najczęściej ktoś nowy
   narusza (np. „plan po akceptacji jest zamrożony", „sekrety wyłącznie w `.env`").
7. **Od czego zacząć** — 3–5 ponumerowanych kroków, pierwszy wykonalny w pierwszej godzinie.
   Komendy wymieniasz **wyłącznie te, które są w `docs/KOMENDY.md` tego projektu**, w zapisanej tam
   formie. Nie ma tam nazwy, której chcesz użyć → opisz krok słowami („poproś o plan"), zamiast
   wymyślać komendę; nazwa brzmiąca sensownie, ale nieistniejąca, kosztuje nowego człowieka
   pierwszy błąd (L-0002, L-0022).
8. **Czego dokumenty nie mówią** — jawna lista luk: brakujące pliki, `STATE.md` starszy niż
   ostatni wpis, ryzyka bez ruchu od miesięcy. To jest uczciwsze niż zgadywanie i chroni nowego
   przed zaufaniem nieaktualnym zdaniom.

Argument `krotko` → zostają wyłącznie punkty 1, 2 i 7.

## Krok 3 — czym wycieczka się kończy

Jednym pytaniem: od czego zaczynamy. Nic więcej — żadnego pliku, żadnego wpisu w dzienniku,
żadnej zmiany w repo. Wycieczka jest czytaniem.

---

## Propozycja wycieczki dla nieznanego autora (D-27)

Wycieczka **proponuje się sama**, gdy dziennik projektu ma wyłącznie wpisy podpisane przez kogoś
innego niż bieżący użytkownik — czyli gdy ktoś otwiera cudzy projekt.

Sygnał dostarcza hook `session-context` na starcie sesji: porównuje `user.name` z konfiguracji gita
z autorami wpisów w dzienniku i, gdy nie ma ani jednego trafienia, wstrzykuje do kontekstu jedno
zdanie o nieznanym autorze. Reakcję opisuje skill `relai-core` (sekcja „Propozycja wycieczki").

Zasady są takie same jak przy siatce brakujących promptów etapowych:

- **Propozycja, nigdy automatyczne odpalenie.** Jedno zdanie i pytanie; wycieczka rusza po „tak".
- Odmowa zamyka temat **na tę sesję**; nie wracasz do niego przy kolejnych promptach.
- Sygnał gaśnie sam, gdy nowa osoba dopisze pierwszy wpis do dziennika — od tego momentu jest
  autorem znanym i propozycja nie wraca.
- Brak `user.name` w gicie → hook milczy. Nie da się rozstrzygnąć, kto pracuje, więc nie zgadujesz.

---

## Zakazy tej komendy

- Nie tworzysz i nie modyfikujesz żadnego pliku — także wpisu w dzienniku.
- Nie czytasz kodu w poszukiwaniu architektury i nie opowiadasz o modułach, których dokumenty nie
  opisują. Luka jest informacją, nie miejscem na domysł.
- Nie cytujesz sekretów ani ścieżek z danymi logowania, nawet jeśli znajdziesz je w dokumentach —
  zgłaszasz to jako znalezisko dla `/relai-audit`.
- Nie oceniasz projektu ani cudzych decyzji; opisujesz stan.
- Nie odpalasz wycieczki samodzielnie po sygnale hooka — czekasz na zgodę.
