# SPEC — `docs/snapshoty/<data>/`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Katalog `docs/snapshoty/` powstaje w projekcie
**w języku projektu**; dla projektu angielskiego: `docs/snapshots/`.

Mechanizm **warunkowy** profili `agent-voice` i `flow` (D-52). Nie dotyczy profili `app`
i `prompty`.

## Rola

Snapshot to **kopia stanu sprzed zmiany**, robiona po to, żeby dało się do niego wrócić bez
rekonstrukcji z pamięci. W projektach, gdzie konfiguracja jest jednocześnie kodem produkcyjnym
i danymi — eksport workflow n8n, konfiguracja agenta głosowego, baza wiedzy — nieudana zmiana nie
kończy się błędem kompilacji, tylko rozmową, która poszła nie tam.

## Zasada nadrzędna: snapshot jest bramką, nie zaleceniem

**Najpierw kopia, potem zmiana.** Zmiana produkcyjnej konfiguracji bez wcześniejszego snapshotu
zostaje **zatrzymana** — to jedyna reguła profilu, która blokuje, a nie ostrzega.

Pilnuje tego hook `config-protection` (PreToolUse, D-41): w projekcie o profilu `agent-voice`
lub `flow` sprawdza, czy w `docs/snapshoty/` leży kopia o **identycznej treści** jak plik, który
ma być zmieniony. Nie ma kopii → zapis wymaga jawnej zgody, a hook mówi wprost, co zrobić najpierw.

Porównanie idzie po treści, nie po nazwie: dzięki temu bramka nie zależy od tego, czy ktoś nazwał
plik zgodnie z konwencją, a konwencja nazewnicza zostaje wymogiem dokumentacyjnym, nie warunkiem
działania.

## Co jest „konfiguracją produkcyjną"

Bramka obejmuje pliki, których zmiana zmienia zachowanie działającego agenta lub przepływu:

| Objęte | Przykłady |
|---|---|
| Eksporty workflow | `*.json` z tablicą `nodes` i obiektem `connections` (n8n), scenariusze Make |
| Konfiguracje agenta | `*.json`, `*.yaml`, `*.yml` z definicją agenta, promptem systemowym, routingiem, głosem |
| Baza wiedzy | pliki w `kb/`, `knowledge/`, `baza-wiedzy/` — także `.md` i `.txt` |

| Poza bramką | Dlaczego |
|---|---|
| `package.json`, `package-lock.json`, `tsconfig*.json`, `jsconfig.json`, `composer.json`, `.eslintrc*`, `.prettierrc*` | konfiguracja narzędzi deweloperskich, nie produktu |
| wszystko w `docs/` (razem z samymi snapshotami) | dokumentacja nie jest konfiguracją produkcyjną |
| `.claude/`, `node_modules/`, katalogi budowania (`dist/`, `build/`, `out/`, `target/`, `.next/`) | nie należą do projektu w sensie treści |
| pliki `*.schema.json`, `*.example.*`, `*.sample.*` | opisują kształt, nie stan |
| plik, który **dopiero powstaje** | nowy plik nie ma stanu sprzed zmiany |

**Operacyjnie** bramka obejmuje każdy plik `.json`, `.yaml` i `.yml` w projekcie poza listą wyjątków
powyżej, oraz **wszystko** w katalogach bazy wiedzy (`kb/`, `knowledge/`, `baza-wiedzy/`,
`knowledge-base/`) niezależnie od rozszerzenia. Reguła jest prosta celowo: rozpoznawanie po treści
(„czy ten JSON wygląda na eksport n8n") myli się w obie strony, a granica ostrożna myli się tylko
w jedną — lepiej poprosić o snapshot raz za dużo niż stracić działającą konfigurację raz.

## Struktura katalogu

```
docs/snapshoty/
└── 2026-08-09/
    ├── agent-glowny__przed-zmiana-routingu.json
    ├── baza-wiedzy-01-cennik__przed-zmiana-routingu.md
    └── OPIS.md
```

**Katalog dzienny:** `docs/snapshoty/RRRR-MM-DD/`. Data z kontekstu sesji, nigdy z pamięci modelu.
Kilka zmian tego samego dnia dzieli katalog — rozróżnia je sufiks stanu.

**Nazwa pliku:** `<nazwa-oryginału-bez-rozszerzenia>__<sufiks-stanu>.<rozszerzenie>`.

Sufiks stanu jest **obowiązkowy** i mówi, o którą zmianę chodzi:

| Sufiks | Znaczenie |
|---|---|
| `przed-<co-zmieniamy>` | stan sprzed zmiany — ten, do którego się wraca |
| `po-<co-zmienilismy>` | stan po zmianie, gdy warto mieć obie strony pod ręką |
| `dziala-<data-lub-opis>` | stan potwierdzony jako działający, punkt odniesienia |

Sufiks piszesz małymi literami z myślnikami, po polsku (albo w języku projektu). `kopia`, `backup`
i `stare` nie są sufiksami stanu — nie mówią nic o tym, czego dotyczy zmiana.

**`OPIS.md` w katalogu dziennym** — trzy linie: co zmieniamy, dlaczego i którym plikiem jest stan
sprzed zmiany. Bez tego po miesiącu snapshot jest tylko plikiem z dziwną nazwą.

## Procedura

1. **Rozpoznaj zmianę produkcyjną.** Wszystko z tabeli „Objęte" wyżej.
2. **Zrób katalog dzienny**, jeśli go nie ma.
3. **Skopiuj plik (albo pliki) sprzed zmiany** z sufiksem stanu. Kopia jest **bajt w bajt** — bez
   przeformatowania, bez sortowania kluczy, bez usuwania pustych linii. Przeformatowany JSON nie
   jest stanem sprzed zmiany, tylko jego interpretacją.
4. **Napisz `OPIS.md`.**
5. **Dopiero teraz zmieniaj** — skryptem migracyjnym (niżej).
6. **Wpis w `DZIENNIK.md`** w tej samej turze (D-44): co zmieniono, który plik jest stanem sprzed
   i co sprawdziły asercje.

Powrót do stanu sprzed zmiany to skopiowanie pliku z sufiksem `przed-…` na miejsce oryginału —
i nic więcej. Jeśli powrót wymaga czegokolwiek poza tym, opisz to w `OPIS.md`.

## Zmiana skryptem migracyjnym, nie ręczną edycją

Konfigurację zmieniasz **skryptem, który wczytuje plik, sprawdza założenia, zmienia i zapisuje** —
nie ręczną edycją JSON-a w edytorze.

Powód jest konkretny, nie estetyczny. Eksport workflow to kilka tysięcy linii, w których węzły
odwołują się do siebie identyfikatorami. Ręczna edycja:

- psuje spójność cicho — zmieniona nazwa węzła zostaje w `connections` pod starą,
- nie zostawia śladu, co dokładnie miało się zmienić,
- nie da się jej powtórzyć na drugim środowisku,
- wygląda na udaną do momentu pierwszej rozmowy użytkownika z agentem.

**Asercje są obowiązkową częścią skryptu**, przed zmianą i po niej:

| Kiedy | Co sprawdzasz |
|---|---|
| Przed zmianą | element, który zamierzasz zmienić, istnieje i wygląda tak, jak zakładasz |
| Przed zmianą | liczba węzłów / sekcji zgadza się z oczekiwaną |
| Po zmianie | zmiana faktycznie weszła (nowa wartość jest na miejscu) |
| Po zmianie | nic poza nią się nie ruszyło: liczba węzłów, identyfikatory, połączenia |
| Po zmianie | wynik jest poprawnym JSON-em i daje się wczytać z powrotem |

Asercja, która nie przechodzi, **przerywa skrypt bez zapisu**. Skrypt bez asercji jest ręczną
edycją napisaną w JavaScripcie.

Skrypty migracyjne trzymasz w projekcie (na przykład `migracje/`), a nie w `docs/` — to kod.
W dzienniku odnotowujesz, który skrypt wykonał zmianę.

## Retencja

Snapshoty nie rosną w nieskończoność, ale **nie kasuje się ich cicho** (D-18). Katalogi starsze
niż kwartał przenosisz do `docs/archiwum/snapshoty/` przy okazji rotacji dziennika, zostawiając
najnowszy stan oznaczony jako działający. Snapshot, do którego odwołuje się otwarte ryzyko albo
niezamknięty wpis dziennika, zostaje na miejscu niezależnie od wieku.

## Zakazy

- Nie zmieniasz konfiguracji produkcyjnej przed wykonaniem snapshotu (D-52).
- Nie przeformatowujesz kopii — snapshot jest kopią bajt w bajt.
- Nie nazywasz snapshotu `kopia`, `backup`, `stare` ani nazwą bez sufiksu stanu.
- Nie edytujesz eksportu workflow ręcznie, gdy da się to zrobić skryptem.
- Nie kasujesz starych snapshotów — archiwizujesz (D-18).
- Nie wkładasz sekretów do snapshotu: konfiguracja z osadzonym kluczem API idzie do kopii
  z wartością zastąpioną nazwą zmiennej, a fakt podmiany trafia do `OPIS.md` (D-42).

## Przykład — `docs/snapshoty/2026-08-09/OPIS.md` (projekt polski, profil `agent-voice`)

```markdown
# Snapshot 2026-08-09 — przed zmianą routingu reklamacji

**Co zmieniamy:** agent kierował wszystkie zgłoszenia o zwrocie do sekcji 07 (Zwroty). Dokładamy
rozgałęzienie: zwrot po terminie idzie do sekcji 12 (Reklamacje).

**Dlaczego:** trzy rozmowy z zeszłego tygodnia skończyły się odpowiedzią „zwrot niemożliwy" bez
podania ścieżki reklamacyjnej.

**Stan sprzed zmiany:**

| Plik oryginalny | Kopia w tym katalogu |
|---|---|
| `config/agent-glowny.json` | `agent-glowny__przed-zmiana-routingu.json` |
| `kb/01-cennik.md` | `baza-wiedzy-01-cennik__przed-zmiana-routingu.md` |

**Jak wrócić:** skopiować oba pliki z powrotem na miejsce oryginałów. Nic poza tym — zmiana nie
dotykała numeracji sekcji ani konfiguracji głosu.

**Skrypt wykonujący zmianę:** `migracje/2026-08-09-routing-reklamacji.js`. Asercje przed zmianą:
sekcja 07 istnieje i ma dokładnie jedno wyjście; sekcja 12 istnieje. Asercje po zmianie: sekcja 07
ma dwa wyjścia, drugie prowadzi do 12; liczba sekcji bazy wiedzy bez zmian (14); plik wczytuje się
jako poprawny JSON.
```
