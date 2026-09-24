# relai-core — folder bez struktury RelAI: inicjalizacja albo cztery drogi

Plik doczytywany skilla `relai-core`. Otwierasz go, gdy Krok 0 skilla rozpoznał stan PUSTY albo Z ZAWARTOŚCIĄ i propozycja nie jest wyciszona globalnie, albo gdy użytkownik sam prosi o RelAI („dodaj RelAI", „zainicjuj projekt").

## Stan PUSTY — zgoda, trzy pytania, generacja

### 1. Zgoda (D-20)

Zapytaj **zwykłym tekstem**, krótko: czym jest RelAI (framework dokumentacyjno-procesowy: projekt
pamięta ustalenia, decyzje i stan między sesjami), co konkretnie powstanie (`CLAUDE.md`, `README.md`
i `docs/` z sześcioma dokumentami) i że nic poza tym nie zostanie utworzone. Poproś o zgodę.

- **Zgoda** → punkt 2.
- **Odmowa** → utwórz `.claude/relai.json` o treści `{"mode":"guest"}`, potwierdź jednym zdaniem
  („Tryb gościa — nie wrócę do tego tematu w tym folderze; wystarczy powiedzieć »dodaj RelAI«,
  gdy zmienisz zdanie"), zadaj **pytanie o zasięg odmowy** (niżej) i zamknij temat. Żadnych plików
  poza markerem.

### 1a. Zasięg odmowy — pytanie raz na maszynę (od 2.3.0)

Plugin jest zainstalowany w zakresie **użytkownika**, więc ten skill widzi każdy folder na tej
maszynie i w każdym zaproponuje strukturę. Marker trybu gościa zamyka temat w **jednym** folderze —
człowiek, który nie chce tej propozycji nigdzie, musiałby odmawiać w kółko.

Po odmowie zadaj **jedno** pytanie (AskUserQuestion, dwie opcje):

| Opcja | Co robisz |
|---|---|
| Tylko ten folder (Rekomendowane) | nic ponad marker gościa, który właśnie powstał |
| Nigdy poza projektami RelAI | dopisz do `~/.claude/relai/USTAWIENIA.md` wiersz `\| <dzisiejsza data> \| Propozycja RelAI poza projektem \| nie proponuj \|` i potwierdź jednym zdaniem, że w projektach z markerem RelAI wszystko działa jak dotąd |

Wiersz `nie proponuj` jest **wyciszeniem tego skilla poza projektami**, a nie wyłączeniem RelAI:
w folderze z markerem `Wersja RelAI` rytuał startu sesji obowiązuje bez zmian. Wycofanie wiersza to
zmiana jego wartości na `proponuj` albo skasowanie linijki — powiedz o tym w tym samym zdaniu.

Widzisz w kontekście startu sesji linię `[RelAI]` mówiącą, że propozycja poza projektami jest
wyłączona → **nie proponujesz niczego i nie pytasz o zasięg**; pracujesz jak zwykły Claude Code,
dopóki człowiek sam nie poprosi o RelAI.

### 2. Paczka dokładnie trzech pytań (D-20)

Jedno wywołanie **AskUserQuestion**, trzy pytania naraz. Wykryte wartości (a dla preferencji
ponadprojektowych — wartości z ustawień globalnych) idą jako **pierwsza opcja z dopiskiem
„(Rekomendowane)"**. Nie dokładaj czwartego pytania — limit jest twardy (D-80).

| Pytanie | Skąd default | Opcje |
|---|---|---|
| Język projektu | ustawienia globalne → język promptów użytkownika → język systemu | wykryty (Rekomendowane) / polski / English |
| Git | stan folderu (`.git/` obecne?) | repo lokalne + propozycja GitHub (Rekomendowane) / tylko lokalnie / bez gita |
| Profil projektu | auto-detekcja (niżej) | wykryty (Rekomendowane) + trzy pozostałe, każda z objaśnieniem niżej |

**Opcje profilu niosą objaśnienie w samym pytaniu** — pole `description` każdej opcji to jedno
zdanie z tabeli poniżej, w języku projektu. Sama nazwa (`agent-voice`, `flow`) nic nie mówi
człowiekowi, który widzi ją pierwszy raz.

| Profil | Objaśnienie w opcji |
|---|---|
| `app` | aplikacja albo biblioteka z kodem — dokument architektury przy pierwszym pliku kodu, designu przy pierwszym ekranie, opis wdrożenia przy pierwszym deployu |
| `agent-voice` | agent głosowy (np. ElevenLabs, Vapi, Retell) — przed każdą zmianą konfiguracji produkcyjnej kopia stanu sprzed zmiany |
| `flow` | automatyzacja w n8n albo Make — przed zmianą produkcyjnego workflow kopia stanu sprzed zmiany |
| `prompty` | same prompty, instrukcje i szablony — rejestr wersji artefaktów od pierwszego z nich |

**Auto-detekcja profilu:**

| Sygnał w folderze | Profil |
|---|---|
| `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `src/`, pliki źródłowe | `app` |
| konfiguracje agentów głosowych (ElevenLabs, Vapi, Retell), katalog bazy wiedzy (`kb/`, `knowledge/`, `baza-wiedzy/`) | `agent-voice` |
| eksporty workflow n8n / Make (JSON z tablicą `nodes` i obiektem `connections`), katalog `workflows/` | `flow` |
| wyłącznie dokumenty, prompty i szablony tekstowe | `prompty` |
| pusto — brak sygnałów | `app` jako default, ale zaznacz, że to zgadywanka |

Sygnały mogą się mieszać — wygrywa **najbardziej specyficzny**: eksport n8n przebija `package.json`,
konfiguracja agenta głosowego przebija oba. Wybrana wartość jest jedynym źródłem reguł warunkowych
(`profiles.md`), więc trafia do `USTAWIENIA.md` dosłownie: `app`, `agent-voice`,
`flow` albo `prompty`.

**Git — konsekwencje do pokazania przy opcjach:**
- *repo lokalne + GitHub* — `git init` teraz, propozycja utworzenia repo zdalnego osobno (RelAI go
  nie zakłada za użytkownika).
- *tylko lokalnie* — `git init`, bez zdalnego.
- *bez gita* — dozwolone, ale powiedz wprost: znika siatka bezpieczeństwa historii zmian (D-53).

**Zawsze i bez wyjątku:** zagnieżdżone repo są zakazane (D-53). Jeśli folder nadrzędny jest już repo
gitem, nie rób `git init` — powiedz o tym i pracuj w repo nadrzędnym.

### 3. Generacja plików

Ze specyfikacji w `.claude/relai/templates/` (lokalna kopia; dostarcza ją hook `session-context`
przy wywołaniu tego skilla) wygeneruj komplet **w języku projektu** (D-60 — specyfikacje to
instrukcje dla Ciebie, nie pliki do skopiowania):

| Plik | Specyfikacja |
|---|---|
| `CLAUDE.md` | `SPEC_CLAUDE_MD.md` |
| `README.md` | `SPEC_README.md` |
| `docs/STATE.md` | `SPEC_STATE.md` |
| `docs/DZIENNIK.md` | `SPEC_DZIENNIK.md` |
| `docs/LEKCJE.md` | `SPEC_LEKCJE.md` |
| `docs/DECYZJE.md` | `SPEC_DECYZJE.md` |
| `docs/USTAWIENIA.md` | `SPEC_USTAWIENIA.md` |
| `docs/KOMENDY.md` | `SPEC_KOMENDY.md` |

Zasady generacji:

- **Nazwy plików podążają za językiem projektu** (D-12). Powyższa tabela pokazuje wariant polski.
  Dla projektu angielskiego: `docs/STATE.md`, `docs/JOURNAL.md`, `docs/LESSONS.md`,
  `docs/DECISIONS.md`, `docs/SETTINGS.md`, `docs/COMMANDS.md`. Konwencja stała: CAPS_SNAKE, bez dat
  i numerów wersji w nazwie.
- `docs/USTAWIENIA.md` **musi** zawierać linię `Wersja RelAI: 2.7.0` — to marker, po którym RelAI
  rozpoznaje projekt i po którym przyszły `/relai-update` policzy różnicę wersji.
- `CLAUDE.md` **musi** zawierać sekcję `## Reguły profilu (<wybrany profil>)` zaraz po „Regułach
  procesu" — 3–6 punktów wg `SPEC_PROFILE.md`. To jedyna warstwa reguł profilu działająca bez
  wyzwolenia skilla i bez zdarzenia, więc jej brak wycisza cały profil.
- `CLAUDE.md` **musi** zawierać **linię fraz sesji** zaraz pod listą rytuału startu, wg
  `SPEC_CLAUDE_MD.md` (sekcja „Linia fraz sesji"). Z tego samego powodu co wyżej: bez niej trzy
  frazy naturalne działają tylko wtedy, gdy skill się wyzwoli — a to jest zawodne (R2).
- `CLAUDE.md` **musi** zawierać w „Regułach procesu" **regułę sygnału odchylenia**, wg
  `SPEC_CLAUDE_MD.md` (sekcja „Reguła sygnału odchylenia"): wątek spoza zakresu etapu → zatrzymaj
  się i zapytaj — odnoga (`/relai-branch`), aneks do planu czy „świadomie odłożone" do dziennika;
  nigdy „przy okazji". Punkt wchodzi także do projektu, który nie ma jeszcze żadnego planu.
- **Żadnego dokumentu warunkowego przy inicjalizacji.** `ARCHITEKTURA.md`, `DESIGN.md`,
  `docs/srodowiska/`, `docs/snapshoty/` i `ARTEFAKTY.md` powstają przy zdarzeniu (D-10) — także
  wtedy, gdy profil jest już znany.
- `docs/LEKCJE.md` i `docs/DECYZJE.md` powstają **puste, ale kompletne strukturalnie**: nagłówek,
  zdanie o roli, sekcja „Zasady aktywne" (LEKCJE) z informacją, że jest jeszcze pusta, i pusta
  sekcja na wpisy. Pusty rejestr z gotową strukturą zapełnia się sam; brakujący plik nie.
- Do tabeli ustawień wpisz trzy odpowiedzi z paczki startowej, każda z dzisiejszą datą, oraz
  **czwarty wiersz `Rotacja dokumentów` z wartością `włączona`** — bez pytania o niego (limit trzech
  pytań jest twardy, D-80). Wiersz jest wyłącznikiem: użytkownik, któremu rotacja przeszkadza,
  wpisuje tam `wyłączona`.
- Zapisz ponadprojektowe odpowiedzi do warstwy globalnej (sekcja „Warstwa ustawień globalnych" w `SKILL.md`).
- Podfolderów `docs/plany/`, `docs/fixy/`, `docs/archiwum/`, `docs/zasoby/` **nie** twórz na zapas —
  powstają, gdy pojawia się pierwsza zawartość (D-11).
- Datę bierz z kontekstu sesji, nigdy z pamięci modelu.
- Po zapisie: gdy wybrano git, wykonaj `git init` (jeśli trzeba) i **jeden** commit
  `chore: initialize RelAI project structure`. Bez pytania o commit — to część inicjalizacji.

### 4. Podsumowanie dla użytkownika

Trzy–pięć zdań: co powstało, co robi każdy dokument, co się dzieje dalej („od teraz mówisz normalnie
— dokumenty aktualizują się w ramach pracy"), plus zdanie o zapamiętanej preferencji globalnej.
Bez ozdobników i bez listy komend, których jeszcze nie ma.

---

## Stan Z ZAWARTOŚCIĄ — cztery drogi, wybiera użytkownik

Folder ma już swoje życie. **Niczego istniejącego nie ruszasz** — ani jednego pliku, ani jednej linii.

Przedstaw dokładnie cztery możliwości i zapytaj (AskUserQuestion, jedno pytanie):

1. **Pełna adopcja (Rekomendowane)** — `/relai-adopt`: backup jako bramka, analiza kodu
   i historii, struktura wygenerowana z zastanego stanu, scalenie istniejącego `CLAUDE.md`
   z zachowaniem reguł, raport zmian z przetestowaną ścieżką pełnego cofnięcia. Po wyborze tej
   opcji wykonujesz procedurę komendy `/relai-adopt` (jej krok 0 masz już za sobą) — świadomy
   wybór użytkownika jest jawnym wywołaniem w rozumieniu D-70.
2. **Dołączenie niedestrukcyjne** — dokładasz wyłącznie brakujące pliki RelAI. Istniejące pliki
   o tych samych nazwach zostają nietknięte: nie nadpisujesz, nie scalasz, nie dopisujesz —
   wymieniasz je w podsumowaniu jako pominięte i mówisz, co RelAI by tam trzymał. Istniejący
   `CLAUDE.md` zostaje bez zmian; scalanie reguł to domena adopcji.
3. **Tryb gościa** — marker `.claude/relai.json` = `{"mode":"guest"}`, koniec tematu. Po tym wyborze
   zadajesz pytanie o **zasięg odmowy** (sekcja „1a" w stanie PUSTY): tylko ten folder czy nigdy
   poza projektami RelAI.
4. **Nic teraz** — użytkownik decyduje później; nie wracasz do tematu w tej sesji. O zasięg nie
   pytasz: „później" nie jest odmową.

Po dołączeniu niedestrukcyjnym obowiązuje ta sama generacja co w stanie PUSTY (paczka trzech pytań
włącznie), z jedną różnicą: pliki już obecne w folderze są pomijane.
