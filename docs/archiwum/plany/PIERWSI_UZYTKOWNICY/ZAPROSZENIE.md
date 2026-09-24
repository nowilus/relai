# ZAPROSZENIE — materiały do oceny przez Łukasza (E2 planu PIERWSI_UZYTKOWNICY)

Cztery bloki gotowe do wklejenia bez przeredagowania. **Nic z tego nie zostało wysłane ani
opublikowane** — publikacja, wysyłka i zmiana czegokolwiek na GitHubie czekają na osobną,
konkretną dyspozycję (sekcje 5 i 9 planu).

Każda teza w tekstach ma pokrycie wskazane w sekcji [Pokrycie tez](#pokrycie-tez) na końcu pliku.
Teza bez pokrycia w `docs/STATE.md` albo `DEMO.md` nie wchodzi do żadnego bloku.

---

## (a) Aktualizacja wpisu na Odpalone

> Kontekst: wpis „RelAI — Plugin do prowadzenia projektu za pomocą Claude, Codex lub Cursora"
> istnieje na `odpalone.pl/p/relai` od wydania (odczyt 2026-09-12, `ZRODLA.md`). To **aktualizacja
> istniejącego wpisu**, nie nowy post — dokłada pokaz i wprost prosi o próbę.

---

**Dorzucam pokaz — i szukam kilku osób, które to naprawdę uruchomią**

Wtedy pisałem, że szukam szczerego feedbacku. Dostałem go i część zarzutów była trafna:
nie było widać, co ten plugin właściwie robi. Nadrabiam.

![RelAI: plan jako dokument, etapy, świeża sesja wracająca do pracy](https://github.com/nowilus/relai/raw/main/docs/zasoby/demo/demo-relai-25s-pl.gif)

Dwadzieścia pięć sekund. Plan powstaje jako osobny dokument z etapami i statusami, potem sesja
się kończy, a **nowa sesja — bez przekazywania rozmowy — mówi, który etap jest gotowy do startu
i z którego pliku to wie**.

Jedna rzecz, którą powiem od razu, bo inaczej materiał byłby ściemą: **to nie jest nagranie ekranu**.
To renderowane odtworzenie przebiegu, który naprawdę się wydarzył — dwa przebiegi w neutralnym
projekcie testowym, siedem zachowanych zapisów kroków. Każda klatka pokazująca plik albo odpowiedź
agenta ma pokrycie w tym zapisie (11 elementów, 11 pokrytych) i żadnej odpowiedzi modelu nie
dopisałem.
Inicjalizacja wymagała drugiej próby i to też jest w dokumentacji materiału, razem z wersjami
narzędzia i modelu: [DEMO.md](https://github.com/nowilus/relai/blob/main/docs/plany/PIERWSI_UZYTKOWNICY/DEMO.md).

Co się zmieniło od wpisu: wyszło **2.1.4**, trzynaście procedur, trzy adaptery (Claude Code, Cursor,
natywny plugin Codeksa). Po drodze cztery wydania z rzędu naprawiały wady dystrybucji — plugin
przez chwilę w ogóle nie ładował komend w Claude Code. Wszystkie cztery są opisane w rejestrze
pułapek projektu, z przyczyną, nie z „poprawiono błędy".

**Czego szukam teraz:** trzech do pięciu osób, które mają własny mały, niekrytyczny projekt
i zechcą spróbować **bez mojego prowadzenia za rękę**. Nie chodzi o pochwały — chodzi o to, czy
po tygodniu przerwy wracacie do pracy szybciej, czy wolniej. Instrukcja to dwie komendy i jedno
zadanie; jeśli utkniecie, pomogę i to odnotuję jako próbę wspomaganą, nie samodzielną.

Instalacja i całość: **github.com/nowilus/relai** — MIT, Node.js 14+, zero zależności npm.

Napiszcie tutaj albo bezpośrednio do mnie.

---

## (b) Tekst dla własnej sieci Łukasza

> Krótszy i bezpośredni. Do wysłania pojedynczo, nie masowo.

---

Cześć — mam prośbę na 20–30 minut.

Zbudowałem **RelAI**: plugin do Claude Code (jest też Cursor i Codex), który trzyma stan projektu,
decyzje i plany w plikach obok kodu, żeby nowa sesja zaczynała od przeczytania, gdzie praca
naprawdę jest, zamiast pytać Cię o to trzeci raz.

25-sekundowy pokaz: https://github.com/nowilus/relai#zobacz-jak-to-działa

**Szukam 3–5 osób, które to uruchomią u siebie** — na własnym małym projekcie, którego nie szkoda.
Ważne: nie chcę prowadzić Cię za rękę. Chcę zobaczyć, gdzie się wywalisz sam, bo to jest jedyna
informacja, której nie umiem sobie sam wyprodukować — dotychczasowy pilotaż prowadziłem ja,
więc wynik „autor umie użyć własnego narzędzia" jest bezwartościowy.

Co to dla Ciebie znaczy: dwie komendy instalacji, jedno zadanie do zrobienia i jedno pytanie
ode mnie po tygodniu. Instrukcja jest niżej / w załączniku. Jeśli utkniesz — pisz, pomogę,
tylko zaznaczę sobie, że pomoc była potrzebna.

Jeśli po próbie powiesz „to nic nie wnosi, natywna pamięć wystarcza" — to też jest wynik i też go
zapiszę. Serio.

MIT, wymaga Node.js 14+, nie ma żadnej telemetrii ani formularza — feedback idzie normalnym
kanałem, czyli do mnie.

---

## (c) Odpowiedź na krytykę

> Cztery tezy z sekcji 3 planu. Rzeczowo, bez polemiki z osobą — trzy z czterech uznaję
> w całości albo w części.

---

**Odpowiedź na uwagi do RelAI**

Cztery zarzuty, po kolei. Trzy pierwsze zmieniły to, co robię.

**1. „Brakuje szybkiego pokazu."**

Trafne i to była największa dziura. Nadrobione: w README jest teraz 25-sekundowy GIF, a na kanały
60-sekundowy MP4, oba z napisami PL i EN, bez dźwięku.

Z jednym zastrzeżeniem, które wolę powiedzieć sam: to **nie jest nagranie ekranu**, tylko
renderowane odtworzenie zmierzonego przebiegu. Powód jest prozaiczny — nie chciałem nagrywać
z ekranu. Konsekwencję biorę na siebie: każda klatka pokazująca plik albo odpowiedź agenta musi
mieć pokrycie w zapisie prawdziwych sesji, inaczej nie wchodzi do materiału. Pokrycie jest
policzone (11/11) i sprawdzone instrumentem, który ma kontrolę pozytywną — podłożony zmyślony
cytat został zgłoszony jako niepokryty. Zapis źródłowy siedmiu sesji leży w repozytorium.
Wszystko to jest w [DEMO.md](DEMO.md), razem z listą rzeczy,
których materiał **nie** dowodzi.

**2. „Lokalne pliki i archiwizacja to zaleta."**

Zaleta — ale nie unikalna i nie chcę udawać, że jest. Claude Code ma auto memory zapisującą
korekty i preferencje oraz `CLAUDE.md` współdzielony przez repozytorium; Cursor ma reguły
projektowe i zespołowe. Sam zapis pamięci nie jest tu przewagą.

Różnica, na którą stawiam, jest węższa: **ciągłość procesu**. Nie „agent pamięta, że lubisz
TypeScript", tylko: plan jest osobnym dokumentem z etapami i statusami, decyzja ma zapisany powód
i datę, korekta staje się zasadą obowiązującą w następnych sesjach, a etap kończy się rytuałem,
który wytwarza punkt startu dla sesji, której jeszcze nie ma. To jest hipoteza wartości, nie
zmierzony fakt — i dokładnie po to jest ten pilotaż.

Czego archiwizacja **nie** dowodzi: niższego całkowitego kosztu kontekstu. Mam zmierzone, że
mechanizm rotacji działa na cudzym projekcie (dziennik 183 → 147 KB, najstarsza historia trafia
do archiwum w całości, w żywym pliku zostaje linia z linkiem). Nie mam pomiaru porównawczego
„RelAI kontra pamięć natywna" i nie będę go udawał.

**3. „Projekt bez monetyzacji umrze."**

To prognoza, nie obserwacja, i nie umiem jej ani potwierdzić, ani obalić. Mogę powiedzieć, co
mierzę zamiast tego: czy ktokolwiek poza mną uruchomi to na własnym projekcie i **wróci do niego
po przerwie**. Jeśli odpowiedź brzmi „nie", pytanie o monetyzację jest bezprzedmiotowe. Jeśli
brzmi „tak", będzie o czym rozmawiać. Projekt jest na MIT i utrzymuję go jako jedna osoba —
to jest świadomy koszt, nie przeoczenie.

**4. „Wersja zespołowa da przewagę."**

Możliwe, ale to hipoteza o cudzej potrzebie, a takie hipotezy najdrożej kosztuje się sprawdzać
budową. Cursor ma już centralnie zarządzane reguły zespołowe, więc wejście w ten obszar znaczy
konkurowanie z natywną funkcją narzędzia. Odkładam do czasu, aż ktoś nazwie konkretny problem
zespołowy, którego dziś nie da się rozwiązać — potrzeba przed budową, nie odwrotnie.

**Na koniec — czego RelAI nie robi, żeby nie było nieporozumień:**

- Skan sekretów zatrzymuje commit z kluczem i to jest twarda odmowa zapisu, zmierzona w obie
  strony. Ale **ochrona plików konfiguracyjnych jest doradcza** — zwraca „zapytaj", więc w sesji
  z automatyczną akceptacją edycji przejdzie bez pytania. Wiem o tym i piszę to wprost, bo README
  wcześniej sugerował więcej.
- Pełna świeża sesja Codeksa i praca z Cursorem jako gospodarzem załogi pozostają niezmierzone.
  Adapter Codeksa jest wydany i zainstalowany lokalnie; „wydane" nie znaczy u mnie „zmierzone
  w każdej ścieżce".
- Nikt poza mną jeszcze tego nie użył. To nie jest skromność, tylko stan faktyczny — i powód,
  dla którego szukam kilku osób do próby.

---

## (d) Instrukcja dla uczestnika

> Do wysłania razem z blokiem (b) albo jako osobny plik. Obie komendy uruchomione dosłownie
> 2026-09-13 w izolowanej konfiguracji — wynik w `pomiar-instalacji.txt` katalogu roboczego etapu.

---

**RelAI — próba na własnym projekcie (20–30 minut plus jedno pytanie po tygodniu)**

Potrzebujesz: Claude Code, Node.js 14+ i **małego projektu, którego nie szkoda**. Nie rób tego
na czymś ważnym — plugin dopisuje pliki do repozytorium.

### 1. Instalacja — dwie komendy

```bash
claude plugin marketplace add nowilus/relai
```

```bash
claude plugin install relai@relai
```

Sprawdzenie, że się udało:

```bash
claude plugin list
```

Ma pokazać `relai@relai`, `Version: 2.1.4`, `Status: ✔ enabled`. Jeśli pokazuje starszą wersję
albo `failed to load` — **napisz mi od razu, to jest wynik**, nie Twój błąd. Po instalacji
zrestartuj aplikację Claude Code, jeśli była otwarta.

### 2. Zadanie — jedno, nie pięć

W swoim projekcie otwórz Claude Code i napisz:

> Zacznijmy projekt RelAI w tym folderze.

Plugin zapyta o zgodę i zada dokładnie trzy pytania. Odpowiedz jak Ci wygodnie. Potem:

> Przygotuj plan wdrożenia \<czegoś, co i tak chcesz w tym projekcie zrobić\>.

Przejrzyj plan i go zaakceptuj, jeśli jest sensowny. **Zamknij sesję i zostaw to na kilka dni.**

Kiedy wrócisz — otwórz **nową sesję** (bez `--continue`, bez wklejania starej rozmowy) i napisz:

> Kontynuujemy pracę.

### 3. Jedno pytanie na koniec

**Czy nowa sesja powiedziała Ci, gdzie jesteś w projekcie — i czy wskazała plik, z którego to wie?**

Odpowiedź „nie" albo „owszem, ale to było bez wartości" jest tak samo przydatna jak „tak".
Jeśli utkniesz na którymkolwiek kroku — pisz. Pomogę i zanotuję, że pomoc była potrzebna;
to jest część pomiaru, nie porażka.

### Czego nie zbieram

Kodu, sekretów ani pełnych rozmów. Zapisuję: anonimowy identyfikator, narzędzie i model, daty prób,
dokąd doszedłeś, ile zajęła instalacja i powrót, czy potrzebna była pomoc, oraz co konkretnie
pomogło i przeszkodziło. Nie ma formularza ani telemetrii — piszesz normalną wiadomością.

---

## Pokrycie tez

Przejście teza po tezie. Skróty: `STATE` = `docs/STATE.md`, `DEMO` = `DEMO.md`,
`POMIAR` = `.claude/relai/work/PIERWSI_UZYTKOWNICY/E2/pomiar-instalacji.txt` (E2, 2026-09-13),
`ZRODLA` = `ZRODLA.md`.

| Blok | Teza | Źródło |
|---|---|---|
| a, b, d | Publiczna instalacja serwuje **2.1.4**, `✔ enabled` | POMIAR (`claude plugin list`, izolowany `CLAUDE_CONFIG_DIR`); STATE „Gdzie jesteśmy" |
| a | **Trzynaście procedur**, trzy adaptery | STATE „Co działa" i „Zawartość pluginu"; POMIAR (13 plików komend w cache'u) |
| a | Cztery wydania z rzędu naprawiały wady dystrybucji; plugin przez chwilę nie ładował komend | STATE „Co dalej" (P-010, P-011, P-012, P-013) |
| a, c | Materiał to **odtworzenie zmierzonego przebiegu**, nie nagranie ekranu | DEMO sekcja d), pierwszy punkt |
| a, c | Pokrycie klatek **11/11**, kontrola pozytywna na podłożonym cytacie | DEMO sekcja c) |
| a | **Dwa przebiegi**, siedem zachowanych zapisów kroków | DEMO sekcja b) — dwie tabele przebiegów; `zapis/` — 7 plików `.txt` (policzone 2026-09-13) |
| b | Anchor `#zobacz-jak-to-działa` prowadzi do sekcji demo w README | odczyt żywej strony 2026-09-13: `user-content-zobacz-jak-to-działa` obecny w HTML |
| a, c | Żadnej odpowiedzi modelu nie dopisano | DEMO sekcja d), pierwszy punkt |
| a | Inicjalizacja wymagała **drugiej próby** | DEMO sekcja b), kolumna „Próby" |
| a, c | 25 s GIF i 60 s MP4, napisy PL i EN, bez dźwięku | DEMO sekcja e) — parametry kompozycji; STATE „Nad czym pracujemy teraz" |
| a, b | MIT, **Node.js 14+**, zero zależności npm | STATE „Wymagania"; `README.md` linia 6 |
| b, c | Dotychczasowy pilotaż prowadził autor — brak próby spoza autora | STATE „Co dalej", ostatni punkt |
| b, d | Brak telemetrii i formularza; zakres zbieranych danych | Sekcja 5 planu (pilotaż), przepisana w `PROBY.md` |
| c | Claude Code ma auto memory; Cursor ma reguły projektowe i zespołowe | ZRODLA, wiersze 3 i 4 tabeli (odczyt 2026-09-12) |
| c | Rotacja zmierzona na cudzym projekcie: dziennik **183 → 147 KB** | STATE „Co działa"; ryzyko R5 w `DZIENNIK.md` (PolyFlow 183,1 → 147,3 KB) |
| c | Brak dowodu na niższy całkowity koszt kontekstu | DEMO sekcja d), punkt trzeci |
| c, d | Skan sekretów **odmawia zapisu**, zmierzony w obie strony | STATE „Co działa" — dwa pomiary w żywej sesji 2026-09-04 |
| c | Ochrona konfiguracji jest **doradcza** (`ask`), nie zatrzymuje przy automatycznej akceptacji | STATE „Co dalej", punkt drugi; DEMO sekcja d), punkt czwarty |
| c | Pełna sesja Codeksa i Cursor jako gospodarz — **niezmierzone** | STATE „Gdzie jesteśmy" i „Co działa" (NOT TESTED) |
| c | Wpis na Odpalone istnieje i deklaruje „szukam szczerego feedbacku" | ZRODLA, sekcja „Uzupełnienie — E1" |
| d | Trzy pytania startowe i zgoda przed generowaniem struktury | STATE „Co działa", punkt pierwszy |
| d | Plugin dopisuje pliki do repozytorium projektu | STATE „Co działa", punkt pierwszy (komplet dokumentów w `docs/`) |

**Tezy świadomie niepostawione**, choć kuszące: żadnej liczby użytkowników, żadnego porównania
szybkości z pamięcią natywną, żadnej obietnicy twardej ochrony plików konfiguracyjnych, żadnej
deklaracji o niezawodności wyprowadzonej z jednego udanego przebiegu.

RelAI (Opus 5) + Lukasz
