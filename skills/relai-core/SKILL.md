---
name: relai-core
description: >
  RelAI project initialization and structure detection. Use at the very beginning of work in a
  folder to check whether it is a RelAI project, and to set one up when it is not: asks for consent,
  then exactly three questions (language, git, project profile) and generates CLAUDE.md, README.md
  and docs/ (STATE, DZIENNIK, USTAWIENIA, KOMENDY) in the project language. Also handles folders
  that already contain files (non-destructive attach) and guest mode when the user declines.
  Use when the user says "zacznijmy projekt", "nowy projekt", "zainicjuj projekt", "dodaj RelAI",
  "dołącz RelAI", "ustaw strukturę projektu", "załóż dokumentację projektu", "co to za projekt",
  "start project", "init project", "set up RelAI", "add RelAI here" — or on the first prompt in a
  folder whose RelAI structure has not been checked yet in this session.
---

# relai-core — inicjalizacja projektu i wykrywanie struktury

Wersja E1 (RelAI 0.1.0). Zakres tego skilla w tej wersji: **rozpoznanie stanu folderu + inicjalizacja
nowego projektu + tryb gościa + niedestrukcyjne dołączenie struktury**. Rytuały sesji, pełne rejestry
LEKCJE/DECYZJE i pełna adopcja zastanego projektu przychodzą w kolejnych wersjach — nie udawaj, że
już działają.

`${CLAUDE_PLUGIN_ROOT}` wskazuje katalog pluginu. Specyfikacje dokumentów leżą w
`${CLAUDE_PLUGIN_ROOT}/templates/`.

---

## Krok 0 — rozpoznanie stanu folderu (zawsze pierwsze, bez pytania)

Sprawdź po kolei, ciszej niż użytkownik zauważy. Nie komentuj samego sprawdzania.

1. **Marker trybu gościa** — plik `.claude/relai.json` zawierający `"mode": "guest"`.
   → Stan: **GOŚĆ**.
2. **Marker struktury RelAI** — plik `docs/USTAWIENIA.md` zawierający tekst `Wersja RelAI`.
   → Stan: **PROJEKT RELAI**.
3. W pozostałych przypadkach ustal, czy folder ma zastaną zawartość. Za **pusty** uznaj folder,
   w którym poza metadanymi narzędzi nie ma nic: `.git/`, `.claude/`, `.vscode/`, `.idea/`,
   `.gitignore`, `.gitattributes`, `LICENSE`. Cokolwiek innego (kod, dokumenty, `package.json`,
   `README.md`) → folder ma zawartość.
   → Stan: **PUSTY** albo **Z ZAWARTOŚCIĄ**.

Dalej idź dokładnie jedną ścieżką.

---

## Stan GOŚĆ — nic nie proponuj

Użytkownik już raz odmówił w tym folderze (D-21). Pracuj jak zwykły Claude Code.

- **Nie** pytaj ponownie o inicjalizację — ani w tej sesji, ani w żadnej następnej.
- Jedyny wyjątek: użytkownik sam prosi („dodaj RelAI", „dołącz strukturę", „add RelAI").
  Wtedy usuń marker i przejdź ścieżką odpowiednią do zawartości folderu.

---

## Stan PROJEKT RELAI — potwierdź i pracuj

Struktura już jest. Nie inicjalizuj niczego drugi raz i nie nadpisuj istniejących dokumentów.

W tej wersji (0.1.0) ogranicz się do jednej linijki potwierdzenia, np. „Projekt RelAI wykryty
(wersja z `docs/USTAWIENIA.md`)", i rób to, o co użytkownik prosił. Pełne rytuały startu sesji
(czytanie STATE / DZIENNIKA / aktywnego planu w ustalonej kolejności) dochodzą w kolejnej wersji
pluginu — jeśli użytkownik ich oczekuje, powiedz wprost, że jeszcze ich nie ma.

---

## Stan PUSTY — zgoda, trzy pytania, generacja

### 1. Zgoda (D-20)

Zapytaj **zwykłym tekstem**, krótko: czym jest RelAI (framework dokumentacyjno-procesowy: projekt
pamięta ustalenia, decyzje i stan między sesjami), co konkretnie powstanie (`CLAUDE.md`, `README.md`,
`docs/` z czterema dokumentami) i że nic poza tym nie zostanie utworzone. Poproś o zgodę.

- **Zgoda** → punkt 2.
- **Odmowa** → utwórz `.claude/relai.json` o treści `{"mode":"guest"}`, potwierdź jednym zdaniem
  („Tryb gościa — nie wrócę do tego tematu w tym folderze; wystarczy powiedzieć »dodaj RelAI«,
  gdy zmienisz zdanie") i zamknij temat. Żadnych plików poza markerem.

### 2. Paczka dokładnie trzech pytań (D-20)

Jedno wywołanie **AskUserQuestion**, trzy pytania naraz. Wykryte wartości idą jako **pierwsza opcja
z dopiskiem „(Rekomendowane)"**. Nie dokładaj czwartego pytania — limit jest twardy (D-80).

| Pytanie | Skąd default | Opcje |
|---|---|---|
| Język projektu | język promptów użytkownika; przy remisie — język systemu | wykryty (Rekomendowane) / polski / English |
| Git | stan folderu (`.git/` obecne?) | repo lokalne + propozycja GitHub (Rekomendowane) / tylko lokalnie / bez gita |
| Profil projektu | auto-detekcja (niżej) | wykryty (Rekomendowane) + trzy pozostałe |

**Auto-detekcja profilu:**

| Sygnał w folderze | Profil |
|---|---|
| `package.json`, `pyproject.toml`, `src/`, pliki źródłowe | `app` |
| konfiguracje agentów głosowych (ElevenLabs, Vapi, Retell), knowledge base | `agent-voice` |
| eksporty workflow n8n / Make (JSON z węzłami) | `flow` |
| wyłącznie dokumenty i prompty | `prompty` |
| pusto — brak sygnałów | `app` jako default, ale zaznacz, że to zgadywanka |

**Git — konsekwencje do pokazania przy opcjach:**
- *repo lokalne + GitHub* — `git init` teraz, propozycja utworzenia repo zdalnego osobno (RelAI go
  nie zakłada za użytkownika).
- *tylko lokalnie* — `git init`, bez zdalnego.
- *bez gita* — dozwolone, ale powiedz wprost: znika siatka bezpieczeństwa historii zmian (D-53).

**Zawsze i bez wyjątku:** zagnieżdżone repo są zakazane (D-53). Jeśli folder nadrzędny jest już repo
gitem, nie rób `git init` — powiedz o tym i pracuj w repo nadrzędnym.

### 3. Generacja plików

Ze specyfikacji w `${CLAUDE_PLUGIN_ROOT}/templates/` wygeneruj komplet **w języku projektu**
(D-60 — specyfikacje to instrukcje dla Ciebie, nie pliki do skopiowania):

| Plik | Specyfikacja |
|---|---|
| `CLAUDE.md` | `SPEC_CLAUDE_MD.md` |
| `README.md` | `SPEC_README.md` |
| `docs/STATE.md` | `SPEC_STATE.md` |
| `docs/DZIENNIK.md` | `SPEC_DZIENNIK.md` |
| `docs/USTAWIENIA.md` | `SPEC_USTAWIENIA.md` |
| `docs/KOMENDY.md` | `SPEC_KOMENDY.md` |

Zasady generacji:

- **Nazwy plików podążają za językiem projektu** (D-12). Powyższa tabela pokazuje wariant polski.
  Dla projektu angielskiego: `docs/STATE.md`, `docs/JOURNAL.md`, `docs/SETTINGS.md`,
  `docs/COMMANDS.md`. Konwencja stała: CAPS_SNAKE, bez dat i numerów wersji w nazwie.
- `docs/USTAWIENIA.md` **musi** zawierać linię `Wersja RelAI: 0.1.0` — to marker, po którym RelAI
  rozpoznaje projekt i po którym przyszły `/relai-update` policzy różnicę wersji.
- Do tabeli ustawień wpisz trzy odpowiedzi z paczki startowej, każda z dzisiejszą datą.
- Podfolderów `docs/plany/`, `docs/fixy/`, `docs/archiwum/`, `docs/zasoby/` **nie** twórz na zapas —
  powstają, gdy pojawia się pierwsza zawartość (D-11).
- Datę bierz z kontekstu sesji, nigdy z pamięci modelu.
- Po zapisie: gdy wybrano git, wykonaj `git init` (jeśli trzeba) i **jeden** commit
  `chore: initialize RelAI project structure`. Bez pytania o commit — to część inicjalizacji.

### 4. Podsumowanie dla użytkownika

Trzy–pięć zdań: co powstało, co robi każdy dokument, co się dzieje dalej („od teraz mówisz normalnie
— dokumenty aktualizują się w ramach pracy"). Bez ozdobników i bez listy komend, których jeszcze nie
ma.

---

## Stan Z ZAWARTOŚCIĄ — propozycja niedestrukcyjna

Folder ma już swoje życie. **Niczego istniejącego nie ruszasz** — ani jednego pliku, ani jednej linii.

Przedstaw dokładnie trzy możliwości i zapytaj (AskUserQuestion, jedno pytanie):

1. **Dołączenie niedestrukcyjne (Rekomendowane)** — dokładasz wyłącznie brakujące pliki RelAI.
   Istniejące pliki o tych samych nazwach zostają nietknięte: nie nadpisujesz, nie scalasz, nie
   dopisujesz. Zamiast tego wymieniasz je w podsumowaniu jako pominięte i mówisz, co RelAI by tam
   trzymał. Jeśli istnieje `CLAUDE.md` — zostaje bez zmian; scalanie reguł jest częścią adopcji.
2. **Tryb gościa** — marker `.claude/relai.json` = `{"mode":"guest"}`, koniec tematu.
3. **Poczekać na adopcję** — użytkownik nie robi teraz nic.

Przy każdej rozmowie o tym stanie powiedz wprost, w jednym zdaniu: **pełna adopcja zastanego
projektu — z backupem, analizą kodu i historii, raportem zmian i przetestowaną ścieżką cofnięcia —
jeszcze nie istnieje; przyjdzie w kolejnej wersji pluginu jako `/relai-adopt`** (D-70). Nie
improwizuj namiastki adopcji.

Po dołączeniu niedestrukcyjnym obowiązuje ta sama generacja co w stanie PUSTY (paczka trzech pytań
włącznie), z jedną różnicą: pliki już obecne w folderze są pomijane.

---

## Twarde zakazy tego skilla

- Nie kasujesz i nie nadpisujesz niczego, czego RelAI nie utworzył w tej sesji.
- Nie zadajesz więcej niż trzech pytań startowych. Wywiady wielopytaniowe są poza zakresem (D-80).
- Nie zapisujesz sekretów w plikach śledzonych — klucze wyłącznie w `.env` objętym `.gitignore`
  (D-42).
- Nie tworzysz repo zagnieżdżonego w innym repo (D-53).
- Nie obiecujesz komend i rytuałów, których ta wersja pluginu nie ma. Lista tego, co realnie działa,
  jest w wygenerowanym `docs/KOMENDY.md`.
