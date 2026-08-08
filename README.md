# RelAI

**Twój projekt pamięta wszystko.** *(Your project remembers everything.)*

Plugin do Claude Code, który zamienia rozmowę z agentem w prowadzony projekt: ustalenia, decyzje,
stan prac i historia zostają w plikach, a nie w kontekście sesji, który za chwilę zniknie.

> Wersja 0.8.0 — rdzeń dokumentacyjny, planowanie, wykonywanie etapów, dziewięć hooków, interaktywny
> plan HTML, **siedem komend** i **cztery profile projektów**. Działa inicjalizacja projektu,
> wykrywanie struktury, rytuały sesji, rejestry lekcji i decyzji, cztery frazy rytualne, plany
> (PLAN z etapami / miniplan w dzienniku, zamrożenie i aneksy) w Markdown **albo** w jednym
> samowystarczalnym pliku HTML z własnym szablonem projektu, pełny cykl etapów (prompty
> `PROMPT_ETAP_N`, komenda `/relai-stage`, automatyczne zamknięcie planu), komendy operacyjne
> (backup, audyt, changelog, pakiet przekazania, wycieczka, ściąga), reguły warunkowe zależne od
> profilu oraz hooki: blokada sekretów, ochrona konfiguracji, przypomnienia o synchronizacji
> dokumentów i `session-context` wymuszający rytuał startu niezależnie od skilli.
> Adopcja istniejących projektów dochodzi w kolejnej wersji.
> Aktualny zakres: [docs/plany/BUDOWA_RELAI/STATUS.md](docs/plany/BUDOWA_RELAI/STATUS.md).

## Instalacja

```bash
/plugin marketplace add nowilus/relai
```

```bash
/plugin install relai
```

Po instalacji otwórz Claude Code w folderze projektu i napisz cokolwiek — RelAI zapyta o zgodę na
utworzenie struktury.

## Co robi wersja 0.8.0

| Sytuacja | Zachowanie |
|---|---|
| Pusty folder | zgoda → dokładnie trzy pytania (język, git, profil) → `CLAUDE.md`, `README.md`, `docs/{STATE,DZIENNIK,LEKCJE,DECYZJE,USTAWIENIA,KOMENDY}.md` w języku projektu |
| Folder z zawartością | propozycja **niedestrukcyjnego** dołączenia brakujących plików; nic istniejącego nie jest ruszane |
| Odmowa | tryb gościa + marker `.claude/relai.json`; RelAI nie pyta ponownie w tym folderze |
| Folder, który już jest projektem RelAI | rozpoznanie po markerze `Wersja RelAI:` w `docs/USTAWIENIA.md` → rytuał startu sesji i akapit „gdzie jesteśmy" |

Rytuały, które od tej wersji działają bez proszenia:

- **Definicja ukończenia** — zmiana funkcjonalna oznacza aktualizację `STATE.md` i wpis
  w `DZIENNIK.md` w tej samej turze. Zadanie z działającym kodem i nieaktualnym STATE jest w toku.
- **Lekcje** — każda korekta użytkownika zostaje zapisana jako `L-NNNN` bez pytania; przy
  powtórzeniu tej samej uwagi RelAI proponuje wpisać zasadę na stałe do `CLAUDE.md`.
- **Decyzje** — temat rozstrzygany drugi raz tak samo daje propozycję zamrożenia jako `D-NN`;
  frazy w rodzaju „nie rób tego więcej" trafiają do rejestru od razu.
- **Frazy** — „kończymy na dziś" / „wrapping up", „kontynuujemy pracę" / „let's continue",
  „sprawdź status" / „status check".
- **Ustawienia globalne** — `~/.claude/relai/USTAWIENIA.md` dziedziczone przez nowe projekty; wpis
  projektowy ma pierwszeństwo.
- **Plany (od 0.3.1)** — „przygotuj plan…" w zwykłej rozmowie tworzy `docs/plany/<TEMAT>/PLAN.md`
  (warianty z powodami odrzucenia, ryzyka, etapy z widocznym efektem, przypadki brzegowe) razem
  ze `STATUS.md` i linią „Aktywny plan" w `CLAUDE.md`. Drobne zadanie dostaje miniplan w dzienniku.
  O rodzaj, format i model wykonawczy etapów RelAI pyta **raz** — potem bierze odpowiedź z ustawień.
  Po akceptacji plan jest zamrożony: zmiany wchodzą jako datowane aneksy, nie jako przepisanie
  sekcji.
- **Plan HTML (nowy w 0.6.0)** — preferencja formatu „HTML" daje `PLAN.html`: jeden plik do
  otwarcia dwuklikiem i wysłania dalej, ze zwijanymi sekcjami, diagramem przepływu, wykresem
  i działającym symulatorem wyliczeń. **Zero połączeń z internetem** — fonty i grafiki są osadzone,
  więc plan wygląda tak samo u każdego odbiorcy i działa offline. Przy pierwszym planie HTML RelAI
  pyta raz o zmianę stylu; zgoda tworzy kopię szablonu w `docs/zasoby/HTML_PLAN/`, która ma
  pierwszeństwo przed wersją z pluginu i przeżywa jego aktualizacje. `STATUS.md`, prompty etapowe
  i miniplany zostają w Markdown — HTML jest dla ludzi, Markdown dla agentów.
- **Etapy (nowe w 0.4.0)** — akceptacja planu tworzy `PROMPT_ETAP_1.md`: samowystarczalny prompt
  dla świeżej sesji (co przeczytać, decyzje, których nie otwierać, realny stan repo, zakres,
  weryfikacja, rytuał zamknięcia). Komenda **`/relai-stage`** znajduje aktywny plan i następny etap,
  pokazuje potwierdzenie i **czeka** — nigdy nie startuje sama. Zamknięcie etapu generuje prompt
  etapu następnego; przerwana sesja zostawia etap w statusie `W TOKU`, a brakujący prompt jest
  wyłapywany na starcie kolejnej sesji. Po ostatnim etapie plan zamyka się sam i trafia do archiwum.
- **Komendy operacyjne (nowe w 0.7.0)** — sześć komend obok `/relai-stage`. **`/relai-backup`**
  pakuje projekt do ZIP-a w centralnym folderze backupów (lokalizacja: pytanie raz, zapisywane
  globalnie), z twardym wykluczeniem sekretów (D-42) i weryfikacją na gotowym archiwum — nie na
  deklaracji. **`/relai-audit`** daje raport w dwóch częściach (porządki + zdrowie) zakończony listą
  propozycji; sam niczego nie kasuje ani nie przenosi. **`/relai-changelog`** destyluje dziennik do
  listy zmian — na ekran, do pliku dopiero na życzenie. **`/relai-handover`** składa pakiet
  przekazania w jednym pliku HTML (ten sam szablon co plany, więc respektuje nadpisanie lokalne).
  **`/relai-tour`** oprowadza po projekcie wyłącznie z jego dokumentów i niczego nie zapisuje;
  gdy wszystkie wpisy dziennika podpisał kto inny niż bieżący użytkownik gita, wycieczka **proponuje
  się sama** (D-27) — propozycja, nigdy automatyczne odpalenie. **`/relai-help`** pokazuje
  `docs/KOMENDY.md` projektu i nie utrzymuje własnej listy niczego (D-07).
- **Hooki (nowe w 0.5.0)** — dziewięć hooków Node.js, bez żadnych zależności npm, wszystkie zgodne
  z konwencją hook-guard (niżej). Blokują wyłącznie `secret-scanner` (sekret w pliku śledzonym —
  klucze `sk-…`, `ghp…`, `AKIA…`, JWT, klucze PEM, przypisania `PASSWORD=`/`SECRET=`; plik objęty
  `.gitignore` przechodzi) i `config-protection` (sekcja niemutowalna `CLAUDE.md`,
  `docs/USTAWIENIA.md` oraz — od 0.8.0 — produkcyjna konfiguracja projektów `agent-voice`/`flow`
  bez snapshotu; zmiana wymaga jawnego zatwierdzenia przez człowieka). Pięć hooków ostrzega, nigdy
  nie blokując: `quality-gate` (tsc/eslint, gdy projekt je ma), `console-log-warn`,
  `design-quality-check` (gdy istnieje `docs/DESIGN.md`), `doc-sync-reminder` (zmiana kodu bez
  `STATE`/`DZIENNIK` — druga siatka definicji ukończenia) i `profile-rules` (od 0.8.0 — zdarzenie,
  przy którym profil dokłada dokument warunkowy). Dwa działają cicho: `auto-format` (gdy projekt ma
  Prettiera) i `session-context` — wstrzykuje datę dnia, kontrolę wersji projekt↔plugin, wymuszenie
  rytuału startu, siatkę brakujących promptów etapowych i (od 0.7.0) sygnał o nieznanym autorze
  dziennika — niezależnie od tego, czy skill się wyzwolił — oraz kopiuje specyfikacje dokumentów do
  `.claude/relai/templates/` w projekcie i dostarcza ustawienia globalne `~/.claude/relai/`
  (rozwiązanie dostępu do zasobów spoza katalogu roboczego).
- **Profile projektów (nowe w 0.8.0)** — trzecie pytanie startowe przestaje być samym wpisem
  w ustawieniach. Cztery profile, każdy z własnymi regułami warunkowymi. **`app`:** pierwszy plik
  źródłowy tworzy `docs/ARCHITEKTURA.md` i wywołuje jedno pytanie o podejście do testów; pierwszy
  plik interfejsu — jedno pytanie o kierunek wizualny i `docs/DESIGN.md`; pierwsza konfiguracja
  wdrożeniowa — `docs/srodowiska/<NAZWA>.md` z procedurą wdrożenia **i procedurą cofnięcia**, gdzie
  są nazwy zmiennych i miejsce przechowywania sekretu, nigdy wartości. **`agent-voice` i `flow`:**
  zmiana produkcyjnej konfiguracji bez kopii stanu sprzed zmiany zostaje **zatrzymana** — snapshot
  do `docs/snapshoty/<data>/` jest bramką, a zmianę wykonuje skrypt migracyjny z asercjami, nie
  ręczna edycja JSON-a. **`prompty`:** rejestr wersji artefaktów `docs/ARTEFAKTY.md`. Żaden z tych
  dokumentów nie powstaje na zapas przy inicjalizacji — wyłącznie przy zdarzeniu. Reguła każdego
  profilu żyje w trzech warstwach: sekcja w `CLAUDE.md` projektu (zawsze w kontekście), hook
  (wykrywa zdarzenie) i skill (niesie procedurę).

Pełna adopcja istniejącego projektu — z backupem, analizą kodu i historii, raportem zmian
i przetestowaną ścieżką cofnięcia — celowo **nie** jest częścią tej wersji. Namiastka adopcji byłaby
gorsza niż jej brak.

## Struktura repo

```
relai/
├── .claude-plugin/
│   ├── plugin.json          # manifest pluginu
│   └── marketplace.json     # własny marketplace (instalacja z tego samego repo)
├── skills/
│   ├── relai-core/          # inicjalizacja, wykrywanie struktury, rytuały sesji, rejestry
│   └── relai-planning/      # plany i miniplany, STATUS, prompty etapowe, zamknięcie planu
├── commands/                # siedem komend: stage, backup, audit, changelog,
│   └── *.md                 #   handover, tour, help
├── hooks/
│   ├── hooks.json           # rejestracja dziewięciu hooków (zdarzenia i matchery)
│   └── *.js                 # dziewięć hooków Node.js, zero zależności npm
├── templates/               # SPECYFIKACJE dokumentów dla LLM (nie pliki do kopiowania)
│   └── HTML_PLAN/           # jedyny wyjątek: realny szablon planu HTML + fonty WOFF2
└── docs/                    # dokumentacja budowy samego RelAI (dogfooding)
```

Plugin jest **samowystarczalny**: nie wymaga żadnego innego pluginu, frameworka ani zewnętrznej
usługi. Wykryte u użytkownika inne zestawy (ECC, superpowers, caveman) współistnieją — RelAI
niczego nie dubluje i niczego nie wyłącza.

## Konwencja: hook-guard

Hooki pluginu w Claude Code działają **globalnie** — uruchamiają się w każdej sesji, także
w folderach, które nie mają z RelAI nic wspólnego. Dlatego obowiązuje twarda konwencja, wiążąca dla
każdego hooka dodanego w przyszłości:

**Każdy hook RelAI zaczyna się od cichego sprawdzenia, czy bieżący projekt jest projektem RelAI.
Jeśli nie jest — kończy działanie bez żadnego efektu i bez żadnego komunikatu.**

Szczegóły konwencji:

1. **Sprawdzenie markera.** Hook czyta `docs/USTAWIENIA.md` (albo jego odpowiednik w języku
   projektu) i szuka linii `Wersja RelAI:`. Brak pliku lub brak linii → wyjście kodem `0`, bez
   wypisywania czegokolwiek na `stdout`/`stderr`.
2. **Tryb gościa też jest „nie".** Marker `.claude/relai.json` z `"mode": "guest"` traktowany jest
   jak brak struktury — hook milknie.
3. **Cisza znaczy cisza.** Poza projektem RelAI hook nie loguje, nie ostrzega, nie tworzy plików
   i nie modyfikuje wejścia. Użytkownik pracujący nad cudzym repo nie ma prawa zauważyć, że plugin
   jest zainstalowany.
4. **Awaria guard = wyjście.** Jeśli sprawdzenie się nie powiedzie (brak uprawnień, dziwna ścieżka,
   błąd odczytu), hook wychodzi tak, jakby to nie był projekt RelAI. Guard nigdy nie „zakłada, że
   pewnie tak".
5. **Guard przed wszystkim.** Sprawdzenie jest pierwszą instrukcją hooka — przed parsowaniem
   wejścia, przed wczytaniem konfiguracji, przed jakimkolwiek `require` cięższej zależności.
6. **Twardość osobno.** To, czy hook blokuje, czy tylko ostrzega, jest jego osobną cechą; guard nie
   ma z tym związku i obowiązuje jednakowo hooki blokujące i ostrzegające.

Od wersji 0.5.0 konwencja jest zaimplementowana we wszystkich hookach — od 0.8.0 jest ich dziewięć.
Hooki reguł profilu mają **drugi warunek** obok guarda: czytają profil z wiersza „Profil projektu"
w pliku ustawień i milczą, gdy reguła nie dotyczy tego profilu. Jedno doprecyzowanie
wynikłe z praktyki: dla zdarzenia wywołania **skilla RelAI** (`relai-core`/`relai-planning`)
warunkiem guarda jest samo to wywołanie — użytkownik świadomie użył pluginu, więc hook
`session-context` może dostarczyć specyfikacje i ustawienia globalne także w folderze, który
dopiero staje się projektem RelAI (inicjalizacja). W sesjach, które skilli RelAI nie wywołują,
milczy jak każdy inny; tryb gościa pozostaje bezwzględnym „nie".

## Zasady, na których stoi RelAI

- **Zapytaj raz, zapisz, respektuj.** Odpowiedź udzielona raz nie wraca jako pytanie.
- **Maksimum trzy pytania na starcie.** Wywiady wielopytaniowe są świadomie poza zakresem.
- **Dokumenty to część ukończenia zadania**, nie osobne zadanie na później.
- **Nic nie jest kasowane po cichu.** Dokument nieaktualny dostaje adnotację i idzie do archiwum.
- **Sekrety wyłącznie w `.env`.** Zapis klucza do pliku śledzonego będzie blokowany.
- **Żadnego GUI.** RelAI żyje w Claude Code i w plikach projektu.

## Licencja

Repo prywatne. Licencja zostanie wybrana przy ewentualnym upublicznieniu.
