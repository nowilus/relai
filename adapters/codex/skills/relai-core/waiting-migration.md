# relai-core — jednorazowe wyprowadzenie spraw czekających na człowieka

Plik doczytywany skilla `relai-core`. Otwierasz go, gdy projekt z wersją 1.6.0 lub nowszą nie ma w dzienniku sekcji „Czeka na człowieka" i człowiek zgodził się ją założyć (albo sam o to poprosił).

## Wyprowadzenie spraw czekających na człowieka (jednorazowo, od 1.6.0)

Do 1.5.2 sprawy człowieka mieszkały w sekcjach „Do zrobienia przez człowieka" pojedynczych wpisów.
Skutek był odwrotny do zamierzonego: sprawa sprzed czterech miesięcy była niewidoczna dla sesji,
a jej wpis blokował rotację całego dziennika, bo zakres rotacji jest ciągły od najstarszej pozycji.
Od 1.6.0 sprawy mają jeden dom — sekcję **„Czeka na człowieka"** na górze dziennika
(`SPEC_DZIENNIK.md`).

Projekt, który tej sekcji jeszcze nie ma, przechodzi **jednorazową** procedurę. Wykonujesz ją na
prośbę użytkownika albo po jego zgodzie, gdy zauważysz brak sekcji w projekcie z wersją 1.6.0 lub
nowszą. Nigdy „przy okazji" rotacji.

**Krok 1 — inwentarz.** Przejrzyj **wszystkie** wpisy dziennika, także te już zarchiwizowane
(`docs/archiwum/dziennik/`), i wypisz każdą **otwartą** pozycję sekcji „Do zrobienia przez
człowieka". Otwarta znaczy: bez adnotacji rozstrzygnięcia z zamkniętej listy brzmień
(`SPEC_ARCHIWUM.md`). Liczenie robisz **skryptem**, nie okiem — plik ma zwykle setki linii.

**Krok 2 — deduplikacja do spraw.** Jednostką sekcji jest **sprawa**, nie linia. Ta sama sprawa
powtórzona w ośmiu wpisach („pozostałe bez zmian: …") to jedna pozycja. Wypisz listę spraw
z przypisaniem, które linie źródłowe do której sprawy należą — ta lista jest **materiałem
dowodowym**, idzie do wpisu dziennika tej sesji.

**Krok 3 — rozstrzygnięcia, które już zapadły.** Sprawa, której rozstrzygnięcie **jest faktem
w repozytorium** (etap zamknięty, decyzja w `DECYZJE.md`, lekcja w rejestrze), nie jest otwarta:
dostaje we wpisie adnotację `*(rozstrzygnięte RRRR-MM-DD — <dowód>)*` i **nie wchodzi** do sekcji.
Zapisujesz przy każdej, **co** jest dowodem. Rozstrzygnięcia, które **nie** są faktem, tylko Twoim
domysłem, nie robisz — pytasz człowieka (L-0025).

**Krok 4 — sekcja.** Załóż „Czeka na człowieka" tuż pod „Stanem otwartych ryzyk" i wpisz sprawy
otwarte w formacie ze specyfikacji: treść · data pierwszego wystąpienia · link do **najnowszego**
wystąpienia sprawy (od 1.7.0 — link do najstarszego zatykał rotację z definicji, bo zakres jest
ciągły od najstarszej pozycji; data przy pozycji nadal jest datą **pierwszego** wystąpienia). **Pozycja bez daty** (wpis po adopcji, nagłówek bez daty) dostaje datę
**wyprowadzenia** i jawny dopisek `(data pierwotna nieznana)` — nie zgadujesz jej i nie pomijasz
pozycji.

**Krok 5 — adnotacje w źródłach.** Każda linia źródłowa — także powtórzona i także ta w archiwum —
dostaje w miejscu `*(wyprowadzone RRRR-MM-DD → sekcja „Czeka na człowieka")*`. Brzmienie jest
zamknięte i czytane maszynowo (L-0035).

**Krok 6 — liczenie przed i po, skryptem, na obu stanach pliku.** Trzy liczby do wpisu dziennika:

| Miara | Przed | Po |
|---|---|---|
| otwarte linie źródłowe (bez adnotacji) | N | **0** |
| sprawy otwarte (po deduplikacji) | M | **M** — tyle samo pozycji w sekcji |
| sprawy rozstrzygnięte w tej turze | — | K, każda z dowodem |

**Liczby muszą się zgadzać: `M` przed = `M` po, a `N` po = 0.** Rozjazd znaczy, że sprawa zginęła
w przenosinach — wtedy **STOP** i pytanie do człowieka, nie „pewnie tak miało być".

**Czego nie robisz:** nie kasujesz linii źródłowych (D-18), nie streszczasz treści pozycji, nie
wpisujesz do sekcji rzeczy, które agent może zrobić sam, i nie rotujesz w tej samej turze —
rotacja czyta wynik wyprowadzenia, więc idzie po nim, nie razem z nim.
