# SPEC — profile projektów

Specyfikacja dla LLM (D-60). Ten plik **nie generuje jednego dokumentu** — jest źródłem prawdy
o czterech profilach RelAI: czym są, po czym się je poznaje, jakie dokumenty warunkowe dokładają,
jakie zdarzenie każdy z nich wyzwala i jak brzmi sekcja reguł profilu w `CLAUDE.md` projektu.

Skill `relai-core` i hook `profile-rules` odwołują się do tego pliku, ale wymaganą strukturę mają
wypisaną u siebie — odsyłacz to życzenie, nie instrukcja (L-0011).

## Rola

Jeden rdzeń dokumentacyjny obsługuje wszystkie projekty (D-50). Profil nie zmienia rdzenia — **dokłada
do niego reguły warunkowe**: dokumenty, które powstają przy konkretnym zdarzeniu, oraz zachowania,
których RelAI pilnuje tylko w tym typie projektu. Projekt agenta głosowego dostaje inne rytuały niż
aplikacja webowa, a oba mają ten sam `STATE.md`, `DZIENNIK.md` i `LEKCJE.md`.

## Cztery profile

Lista jest **zamknięta** (D-50). Nie dokładasz piątego profilu i nie łączysz istniejących.

| Profil | Co to za projekt | Charakterystyczne ryzyko |
|---|---|---|
| `app` | aplikacja: web, mobile, backend, biblioteka, narzędzie CLI, plugin | kod rośnie szybciej niż jego opis; deploy bez procedury cofnięcia |
| `agent-voice` | agent głosowy lub konwersacyjny (ElevenLabs, Vapi, Retell) z bazą wiedzy | zmiana produkcyjnej konfiguracji bez możliwości powrotu do stanu sprzed |
| `flow` | automatyzacje n8n / Make / Zapier — eksporty workflow w JSON | ręczna edycja JSON-a psuje działający przepływ po cichu |
| `prompty` | projekt czysto tekstowy: prompty, instrukcje, szablony, artefakty dla LLM | brak śladu, która wersja artefaktu dała jaki wynik |

## Auto-detekcja

Profil jest **trzecim pytaniem paczki startowej** (D-20). Wykryta wartość idzie jako pierwsza opcja
z dopiskiem „(Rekomendowane)"; wybiera człowiek. Detekcja jest podpowiedzią, nie wyrokiem.

| Sygnał w folderze | Profil |
|---|---|
| `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `pom.xml`, `src/`, pliki źródłowe | `app` |
| konfiguracje agentów głosowych (ElevenLabs, Vapi, Retell), katalog bazy wiedzy (`kb/`, `knowledge/`, `baza-wiedzy/`) | `agent-voice` |
| eksporty workflow n8n / Make (JSON z tablicą `nodes` i obiektem `connections`), katalog `workflows/` | `flow` |
| wyłącznie dokumenty, prompty i szablony tekstowe | `prompty` |
| pusto — brak sygnałów | `app` jako domyślny, z jawnym zaznaczeniem, że to zgadywanka |

Sygnały mogą się mieszać (projekt `flow` z jednym skryptem w Pythonie). Wygrywa sygnał **najbardziej
specyficzny**: eksport n8n przebija `package.json`, konfiguracja agenta głosowego przebija oba.

Wynik trafia do `docs/USTAWIENIA.md` jako wiersz `Profil projektu`. To jedyne miejsce, z którego
skill i hook czytają profil.

## Zasada nadrzędna: warunkowe znaczy warunkowe

Dokument warunkowy powstaje **przy zdarzeniu**, nigdy na zapas przy inicjalizacji (D-10). Pusty
`ARCHITEKTURA.md` z nagłówkami i zdaniem „do uzupełnienia" jest **zakazany** — nie niesie informacji,
a udaje, że projekt ma opis architektury.

Konsekwencja praktyczna: świeżo zainicjowany projekt `app` ma dokładnie osiem dokumentów rdzenia,
tak samo jak projekt `prompty`. Różnica między profilami staje się widoczna dopiero przy pierwszym
zdarzeniu.

## Co dokłada każdy profil

| Profil | Dokument warunkowy | Zdarzenie wyzwalające | Specyfikacja |
|---|---|---|---|
| `app` | `docs/ARCHITEKTURA.md` | pierwszy plik źródłowy w projekcie | [SPEC_ARCHITEKTURA.md](SPEC_ARCHITEKTURA.md) |
| `app` | `docs/DESIGN.md` | pierwszy plik interfejsu (komponent, widok, arkusz stylów) | [SPEC_DESIGN.md](SPEC_DESIGN.md) |
| `app` | `docs/srodowiska/<nazwa>.md` | pierwsze wdrożenie danego środowiska | [SPEC_SRODOWISKA.md](SPEC_SRODOWISKA.md) |
| `agent-voice` | `docs/snapshoty/<data>/` | zmiana produkcyjnej konfiguracji — **przed** zmianą | [SPEC_SNAPSHOT.md](SPEC_SNAPSHOT.md) |
| `flow` | `docs/snapshoty/<data>/` | zmiana eksportu workflow — **przed** zmianą | [SPEC_SNAPSHOT.md](SPEC_SNAPSHOT.md) |
| `prompty` | `docs/ARTEFAKTY.md` | pierwszy artefakt (prompt, instrukcja, szablon) | sekcja „Profil `prompty`" niżej |

Poza dokumentem profil dokłada **jedno pytanie**, i to najwyżej raz na projekt:

| Profil | Pytanie | Kiedy pada | Gdzie ląduje odpowiedź |
|---|---|---|---|
| `app` | podejście do testów (D-25) | przy pierwszym kodzie, razem z `ARCHITEKTURA.md` | `docs/USTAWIENIA.md` |
| `app` | kierunek wizualny (D-51) | przy pierwszym UI, razem z `DESIGN.md` | `docs/DESIGN.md` |

Profile `agent-voice`, `flow` i `prompty` **nie zadają żadnego pytania** — snapshot i rejestr wersji
nie mają wariantów do wyboru.

**Limit trzech pytań startowych jest twardy** (D-20, D-80). Reguły profilu nie mają prawa dołożyć
czwartego pytania do paczki inicjalizacyjnej — oba pytania wyżej padają później, przy zdarzeniu,
i nigdy w tej samej turze co inicjalizacja.

Zanim zapytasz, sprawdź `docs/USTAWIENIA.md`, potem warstwę globalną (L-0006). Odpowiedź już
zapisana → nie pytasz, tylko mówisz pół zdaniem, co przyjąłeś i skąd.

## Trzy warstwy nośne reguły warunkowej

Reguła „przy pierwszym kodzie powstaje `ARCHITEKTURA.md`" musi zadziałać także wtedy, gdy skill się
nie wyzwolił (R2). Dlatego każda reguła profilu żyje w trzech miejscach naraz, a każde z nich
odpowiada za co innego:

| Warstwa | Za co odpowiada | Czego nie potrafi |
|---|---|---|
| `CLAUDE.md` projektu — sekcja „Reguły profilu" | **niesie regułę**; jest w kontekście każdej sesji, bez żadnego wyzwalania | nie wykrywa zdarzeń — to statyczny tekst |
| hook `profile-rules` (PostToolUse) | **wykrywa zdarzenie** i wstrzykuje przypomnienie w tej samej turze, w której zdarzenie zaszło | nie tworzy dokumentów; ostrzega (D-41) |
| skill `relai-core` | **niesie procedurę**: co dokładnie napisać, o co zapytać, gdzie zapisać odpowiedź | wyzwala się zawodnie (R2) |

Snapshot profili `agent-voice` i `flow` jest wyjątkiem: to jedyna reguła profilu, która **zatrzymuje**
operację, i dlatego mieszka w hooku `config-protection` — tym, któremu D-41 pozwala blokować.

## Profil `app` (D-51)

### Pierwszy kod

Zdarzenie: w projekcie pojawia się pierwszy plik źródłowy (nie dokument, nie konfiguracja narzędzi).

Co się dzieje w tej samej turze:

1. Powstaje `docs/ARCHITEKTURA.md` wg [SPEC_ARCHITEKTURA.md](SPEC_ARCHITEKTURA.md) — opisujący to,
   co **właśnie powstało**, a nie docelową architekturę wymarzoną.
2. Pada pytanie o podejście do testów (D-25) z rekomendacją: pełny TDD / testy krytycznych ścieżek /
   bez testów. Rekomendację uzasadniasz jednym zdaniem wziętym z charakteru projektu, nie z ogólnej
   prawdy o testach.
3. Odpowiedź trafia do `docs/USTAWIENIA.md` jako wiersz `Podejście do testów`, z datą.

Sekcja „Weryfikacja" w prompcie etapowym jest obowiązkowa **zawsze**, niezależnie od odpowiedzi
(D-25). „Bez testów" znaczy „bez testów automatycznych", nie „bez sprawdzania".

### Pierwszy interfejs

Zdarzenie: pojawia się pierwszy plik interfejsu — komponent, widok, szablon, arkusz stylów.

1. Pada **jedno** krótkie pytanie o kierunek wizualny. Jedno, nie wywiad: nastrój i skojarzenie
   wystarczą, żeby napisać `DESIGN.md`, a lista zakazów jest filtrem końcowym, nie briefem (L-0019).
2. Powstaje `docs/DESIGN.md` wg [SPEC_DESIGN.md](SPEC_DESIGN.md), z odpowiedzią wpisaną w sekcję
   „Kierunek".

Od tej chwili hook `design-quality-check` ma się do czego odwołać — dopóki `DESIGN.md` nie istnieje,
milczy.

### Pierwsze wdrożenie

Zdarzenie: projekt trafia na jakiekolwiek środowisko — pojawia się konfiguracja wdrożeniowa
(`Dockerfile`, `docker-compose.yml`, workflow CI, `vercel.json`, `fly.toml`, manifest Kubernetes,
`Procfile`, pliki Terraform) albo użytkownik mówi, że coś zostało wdrożone.

Powstaje `docs/srodowiska/<nazwa>.md` wg [SPEC_SRODOWISKA.md](SPEC_SRODOWISKA.md) — jeden plik na
środowisko, nie jeden zbiorczy. Zawiera URL, **wskazanie** dostępów, procedurę wdrożenia
i procedurę cofnięcia.

**Wartości sekretów nie trafiają tam nigdy** (D-42). Plik mówi, jak nazywa się zmienna i gdzie
mieszka jej wartość — nigdy jaka ona jest. To jest twardy zakaz, nie zalecenie.

Dokument bez procedury cofnięcia jest niekompletny: sekcja „Jak cofnąć" nie może brzmieć „przywróć
poprzednią wersję" — ma podawać polecenia albo kroki, które ktoś wykona pod presją, nie czytając
reszty pliku.

## Profile `agent-voice` i `flow` (D-52)

Wspólny mechanizm: **snapshot jest bramką**. Najpierw kopia stanu sprzed zmiany, potem zmiana. Bez
kopii operacja się nie wykonuje — to jedyna reguła profilu, która zatrzymuje, a nie ostrzega.

Pełna procedura, definicja „konfiguracji produkcyjnej", nazewnictwo z sufiksem stanu i zasada
zmiany skryptem migracyjnym: [SPEC_SNAPSHOT.md](SPEC_SNAPSHOT.md).

### Konwencje bazy wiedzy (profil `agent-voice`)

Baza wiedzy agenta głosowego rządzi się dwiema zasadami, których złamanie psuje routing rozmowy
przy poprawnie brzmiącej treści:

1. **Numeracja sekcji jest nietykalna.** Numer sekcji to identyfikator, do którego odwołuje się
   konfiguracja agenta i logika routingu — nie porządkowy element formatowania. Sekcję wycofaną
   oznaczasz jako nieaktualną i **zostawiasz jej numer**; nowa sekcja bierze kolejny wolny numer.
   Przenumerowanie bazy wiedzy jest zmianą produkcyjną najwyższego ryzyka i wymaga snapshotu oraz
   przejścia po wszystkich odwołaniach.
2. **Split PL treść / EN routing.** Treść, którą agent wypowiada, jest w języku rozmowy (polskim);
   nazwy sekcji, intencji, tagów routingu i warunków przejścia są po angielsku. Mieszanie tych dwóch
   warstw kończy się tym, że tłumaczenie treści zmienia routing.

Obie zasady trafiają do sekcji „Reguły profilu" w `CLAUDE.md` projektu — tam są w kontekście każdej
sesji, także tej, w której skill się nie wyzwolił.

## Profil `prompty`

Najmniejszy z czterech. Jedyne, co dokłada, to **rejestr wersji artefaktów**: `docs/ARTEFAKTY.md`.

Powstaje przy pierwszym artefakcie — prompcie, instrukcji systemowej, szablonie. Nie przy
inicjalizacji.

**Co zawiera wpis:**

| Pole | Treść |
|---|---|
| Artefakt | nazwa robocza, po ludzku |
| Plik | ścieżka do aktualnej wersji |
| Wersja | liczba całkowita, rosnąca; `1` przy pierwszym zapisie |
| Data | z kontekstu sesji |
| Co się zmieniło | jedno zdanie o różnicy wobec poprzedniej wersji |
| Po co | jaki problem miała naprawić ta wersja — bez tego porównanie wersji nic nie mówi |

**Jak wygląda porównanie wersji:** projekt z gitem porównuje treść (`git log -p <plik>`), a rejestr
odpowiada na pytanie, którego git nie zna — **po co** ta zmiana zaszła i czy zadziałała. Projekt bez
gita trzyma poprzednie wersje jako datowane kopie w `docs/archiwum/artefakty/` (D-18: nigdy ciche
kasowanie), a rejestr linkuje do nich z kolumny `Plik`.

Rejestru nie mieszasz z `DZIENNIK.md`: dziennik mówi, co się działo w sesji, rejestr — jak wygląda
historia jednego artefaktu.

## Reguły profilu w `CLAUDE.md` projektu

Profil dokłada do `CLAUDE.md` **jedną sekcję** o stałym tytule `## Reguły profilu (<nazwa>)`,
umieszczoną zaraz po „Regułach procesu". Szczegóły miejsca i limitów: `SPEC_CLAUDE_MD.md`.

Zasady tej sekcji:

- **3–6 punktów, każdy w trybie rozkazującym.** Punkt mówi, co ma się stać i kiedy — nie tłumaczy
  filozofii profilu.
- **Bez odsyłaczy do specyfikacji z pluginu.** Katalog pluginu jest dla sesji niedostępny (L-0012),
  więc reguła musi być czytelna bez niego.
- **Wyłącznie reguły tego profilu.** Sekcja nie jest miejscem na ogólne dobre praktyki.
- **Limit 10 KB całego `CLAUDE.md` obowiązuje dalej.** Jeśli sekcja go przekracza, skracasz
  punkty, nie limit.

## Zmiana profilu

Profil zmienia się rzadko i wyłącznie na prośbę człowieka. Procedura:

1. Nowy wiersz w `docs/USTAWIENIA.md` z datą, starą i nową wartością — stary wiersz przenosisz do
   sekcji „Ustawienia wycofane" (nigdy nie kasujesz).
2. Podmieniasz sekcję „Reguły profilu" w `CLAUDE.md`.
3. **Dokumentów starego profilu nie kasujesz.** `ARCHITEKTURA.md` napisany, gdy projekt był `app`,
   zostaje — opisuje kod, który nadal istnieje. Dokument, który stracił sens, dostaje adnotację
   „NIEAKTUALNE" i trafia do `docs/archiwum/` (D-18).

## Zakazy

- Nie tworzysz dokumentu warunkowego przy inicjalizacji ani „na przyszłość" (D-10).
- Nie dokładasz czwartego pytania do paczki startowej (D-20, D-80).
- Nie wpisujesz wartości sekretów do `docs/srodowiska/` ani nigdzie indziej w plikach śledzonych
  (D-42).
- Nie tworzysz piątego profilu i nie łączysz czterech istniejących (D-50).
- Nie zmieniasz produkcyjnej konfiguracji w profilu `agent-voice` / `flow` przed snapshotem (D-52).
- Nie przenumerowujesz sekcji bazy wiedzy przy okazji innej zmiany.

## Przykład — sekcja „Reguły profilu" dla każdego z czterech profili

Cztery kompletne sekcje, gotowe do wklejenia w `CLAUDE.md` projektu polskiego.

**Profil `app`:**

```markdown
## Reguły profilu (app)

- Pierwszy plik źródłowy w projekcie → w tej samej turze powstaje `docs/ARCHITEKTURA.md` i pada
  jedno pytanie o podejście do testów; odpowiedź do `docs/USTAWIENIA.md`.
- Pierwszy plik interfejsu → jedno pytanie o kierunek wizualny i `docs/DESIGN.md`.
- Pierwsze wdrożenie środowiska → `docs/srodowiska/<nazwa>.md` z URL-em, wskazaniem dostępów,
  procedurą wdrożenia i procedurą cofnięcia.
- W `docs/srodowiska/` są nazwy zmiennych i miejsce przechowywania sekretu — nigdy wartości.
- Zmiana modułu opisanego w `ARCHITEKTURA.md` aktualizuje ten opis w tej samej turze.
```

**Profil `agent-voice`:**

```markdown
## Reguły profilu (agent-voice)

- Przed każdą zmianą produkcyjnej konfiguracji agenta lub bazy wiedzy → snapshot do
  `docs/snapshoty/<data>/` z sufiksem stanu. Najpierw kopia, potem zmiana.
- Konfigurację zmieniasz skryptem migracyjnym z asercjami, nie ręczną edycją JSON-a.
- Numeracja sekcji bazy wiedzy jest nietykalna: sekcję wycofaną oznaczasz, numer zostaje, nowa
  bierze kolejny wolny.
- Treść wypowiadana po polsku, nazwy sekcji i tagi routingu po angielsku — te warstwy się nie
  mieszają.
- Po zmianie produkcyjnej wpis w dzienniku mówi, który snapshot jest stanem sprzed.
```

**Profil `flow`:**

```markdown
## Reguły profilu (flow)

- Przed każdą zmianą eksportu workflow → snapshot do `docs/snapshoty/<data>/` z sufiksem stanu.
  Najpierw kopia, potem zmiana.
- Eksport zmieniasz skryptem migracyjnym z asercjami (węzeł istnieje, połączenie prowadzi tam,
  gdzie ma) — nie ręczną edycją JSON-a.
- Identyfikatorów i nazw węzłów nie zmieniasz przy okazji innej zmiany: łączą je połączenia.
- Po zmianie produkcyjnej wpis w dzienniku mówi, który snapshot jest stanem sprzed i co asercje
  sprawdziły.
```

**Profil `prompty`:**

```markdown
## Reguły profilu (prompty)

- Pierwszy artefakt (prompt, instrukcja, szablon) → powstaje rejestr `docs/ARTEFAKTY.md`.
- Każda zmiana artefaktu podbija jego wersję w rejestrze: co się zmieniło i po co.
- Poprzednia wersja zostaje: w historii gita albo jako datowana kopia w
  `docs/archiwum/artefakty/`. Nigdy ciche nadpisanie.
- Rejestr odpowiada na pytanie „po co", dziennik na pytanie „co się działo" — nie mieszasz ich.
```
