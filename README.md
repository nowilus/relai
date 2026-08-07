# RelAI

**Twój projekt pamięta wszystko.** *(Your project remembers everything.)*

Plugin do Claude Code, który zamienia rozmowę z agentem w prowadzony projekt: ustalenia, decyzje,
stan prac i historia zostają w plikach, a nie w kontekście sesji, który za chwilę zniknie.

> Wersja 0.3.1 — rdzeń dokumentacyjny i planowanie. Działa inicjalizacja projektu, wykrywanie
> struktury, rytuały sesji, rejestry lekcji i decyzji, trzy frazy rytualne oraz plany (PLAN
> z etapami / miniplan w dzienniku, zamrożenie i aneksy). Prompty etapowe, hooki, komendy
> operacyjne, szablon HTML planów i adopcja istniejących projektów dochodzą w kolejnych wersjach.
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

## Co robi wersja 0.3.1

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
- **Plany (nowe w 0.3.1)** — „przygotuj plan…" w zwykłej rozmowie tworzy `docs/plany/<TEMAT>/PLAN.md`
  (warianty z powodami odrzucenia, ryzyka, etapy z widocznym efektem, przypadki brzegowe) razem
  ze `STATUS.md` i linią „Aktywny plan" w `CLAUDE.md`. Drobne zadanie dostaje miniplan w dzienniku.
  O rodzaj, format i model wykonawczy etapów RelAI pyta **raz** — potem bierze odpowiedź z ustawień.
  Po akceptacji plan jest zamrożony: zmiany wchodzą jako datowane aneksy, nie jako przepisanie
  sekcji. Plany powstają w Markdown — interaktywny szablon HTML dochodzi w kolejnej wersji.

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
│   └── relai-planning/      # plany i miniplany, STATUS, zamrożenie i aneksy, zamknięcie planu
├── templates/               # SPECYFIKACJE dokumentów dla LLM (nie pliki do kopiowania)
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

Konwencja obowiązuje od tej wersji, mimo że hooków jeszcze nie ma — po to, by pierwszy hook powstał
już zgodny z nią, a nie doprowadzony do zgodności później.

## Zasady, na których stoi RelAI

- **Zapytaj raz, zapisz, respektuj.** Odpowiedź udzielona raz nie wraca jako pytanie.
- **Maksimum trzy pytania na starcie.** Wywiady wielopytaniowe są świadomie poza zakresem.
- **Dokumenty to część ukończenia zadania**, nie osobne zadanie na później.
- **Nic nie jest kasowane po cichu.** Dokument nieaktualny dostaje adnotację i idzie do archiwum.
- **Sekrety wyłącznie w `.env`.** Zapis klucza do pliku śledzonego będzie blokowany.
- **Żadnego GUI.** RelAI żyje w Claude Code i w plikach projektu.

## Licencja

Repo prywatne. Licencja zostanie wybrana przy ewentualnym upublicznieniu.
