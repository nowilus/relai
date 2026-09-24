# relai-core — reguły warunkowe profilu

Plik doczytywany skilla `relai-core`. Otwierasz go, gdy zachodzi zdarzenie profilu (pierwszy plik źródłowy lub interfejsu, pierwsze wdrożenie, zmiana konfiguracji produkcyjnej, pierwszy artefakt), gdy człowiek zmienia profil albo przy inicjalizacji, zanim zapiszesz sekcję reguł profilu w `CLAUDE.md`.

## Reguły warunkowe profilu (D-50…D-53)

Profil projektu stoi w `docs/USTAWIENIA.md` w wierszu „Profil projektu" — to jedyne miejsce, z
którego go czytasz. Cztery wartości, lista zamknięta: `app`, `agent-voice`, `flow`, `prompty`.

Profil **nie zmienia rdzenia dokumentacyjnego**. Dokłada do niego dokumenty warunkowe, które
powstają **przy zdarzeniu**, oraz zachowania pilnowane tylko w tym typie projektu. Szczegóły
i przykłady: `.claude/relai/templates/SPEC_PROFILE.md`.

**Zasada nadrzędna: warunkowe znaczy warunkowe.** Dokument warunkowy nie powstaje przy
inicjalizacji ani „na zapas" (D-10). Pusty dokument z nagłówkami i zdaniem „do uzupełnienia" jest
**zakazany**. Świeżo zainicjowany projekt `app` ma dokładnie te same osiem dokumentów co projekt
`prompty` — różnica pojawia się dopiero przy pierwszym zdarzeniu.

### Co robi który profil

| Profil | Zdarzenie | Co powstaje | Specyfikacja |
|---|---|---|---|
| `app` | pierwszy plik źródłowy | `docs/ARCHITEKTURA.md` + jedno pytanie o testy | `SPEC_ARCHITEKTURA.md` |
| `app` | pierwszy plik interfejsu | `docs/DESIGN.md` + jedno pytanie o kierunek | `SPEC_DESIGN.md` |
| `app` | **przed** pierwszym wdrożeniem środowiska | nic w `docs/` — lista kontrolna w rozmowie i we wpisie dziennika | `first-deploy.md` |
| `app` | pierwsze wdrożenie środowiska (po nim) | `docs/srodowiska/<NAZWA>.md` z sekcją obserwacji | `SPEC_SRODOWISKA.md` |
| `agent-voice`, `flow` | **przed** zmianą konfiguracji produkcyjnej | `docs/snapshoty/<data>/` | `SPEC_SNAPSHOT.md` |
| `prompty` | pierwszy artefakt | `docs/ARTEFAKTY.md` | `SPEC_PROFILE.md` |

Zdarzenie rozpoznajesz też z rozmowy, nie tylko z zapisu pliku: „wdrożyliśmy to na testowe" jest
pierwszym wdrożeniem tak samo jak pojawienie się `Dockerfile`. Zapowiedź („wdrażamy jutro",
pierwsza konfiguracja wdrożeniowa przed wdrożeniem) otwiera `first-deploy.md` **przed** faktem.

### Jedno pytanie towarzyszące — jak brzmi

Profil dokłada najwyżej **jedno** pytanie na zdarzenie i tylko w profilu `app`. Nigdy w tej samej
turze co inicjalizacja: **limit trzech pytań startowych jest twardy** (D-20, D-80).

Zanim zapytasz, sprawdź `docs/USTAWIENIA.md`, potem warstwę globalną (L-0006). Odpowiedź już tam
jest → nie pytasz, tylko mówisz pół zdaniem, co przyjąłeś i skąd.

- **Testy (przy pierwszym kodzie, D-25):** trzy opcje — pełny TDD / testy krytycznych ścieżek /
  bez testów. Rekomendację (pierwsza opcja, dopisek „(Rekomendowane)") uzasadniasz jednym zdaniem
  wziętym z charakteru tego projektu, nie z ogólnej prawdy o testach. Odpowiedź → wiersz
  `Podejście do testów` w `USTAWIENIA.md`, z datą. Sekcja „Weryfikacja" w prompcie etapowym jest
  obowiązkowa **zawsze**, niezależnie od odpowiedzi.
- **Kierunek wizualny (przy pierwszym UI, D-51):** pytasz o **cechy pozytywne** — nastrój,
  skojarzenie, co użytkownik ma poczuć. Lista zakazów jest filtrem końcowym, nie briefem (L-0019).
  Odpowiedź → sekcja „Kierunek" w `DESIGN.md`, dosłownie.

### Snapshot jako bramka (`agent-voice`, `flow` — D-52)

Najpierw kopia, potem zmiana. To jedyna reguła profilu, która **zatrzymuje** operację, a nie
ostrzega — pilnuje jej hook `config-protection`, więc zadziała także wtedy, gdy ten skill się nie
wyzwolił.

Twoja część procedury, gdy zmieniasz konfigurację produkcyjną (eksport workflow, konfiguracja
agenta, baza wiedzy):

1. Skopiuj plik sprzed zmiany do `docs/snapshoty/<RRRR-MM-DD>/` pod nazwą
   `<nazwa>__przed-<co-zmieniamy>.<rozszerzenie>` — **bajt w bajt**, bez przeformatowania.
2. Dopisz `OPIS.md` w tym katalogu: co zmieniamy, dlaczego, który plik jest stanem sprzed zmiany.
3. Dopiero teraz zmieniaj — **skryptem migracyjnym z asercjami**, nie ręczną edycją JSON-a.
   Asercje przed zmianą (element istnieje i wygląda jak zakładasz) i po niej (zmiana weszła, nic
   poza nią się nie ruszyło, wynik daje się wczytać). Asercja, która nie przeszła, przerywa skrypt
   bez zapisu.
4. Wpis w dzienniku mówi, który snapshot jest stanem sprzed i co sprawdziły asercje.

Baza wiedzy profilu `agent-voice` ma dwie własne zasady: **numeracja sekcji jest nietykalna**
(numer to identyfikator routingu — sekcję wycofaną oznaczasz, numer zostaje, nowa bierze kolejny
wolny) oraz **split PL treść / EN routing** (treść w języku rozmowy, nazwy sekcji i tagi routingu
po angielsku).

### Reguły profilu w `CLAUDE.md` projektu

Przy inicjalizacji `CLAUDE.md` dostaje sekcję `## Reguły profilu (<nazwa>)` zaraz po „Regułach
procesu": 3–6 punktów w trybie rozkazującym, bez odsyłaczy do plików spoza projektu (L-0012).
Gotowe brzmienie dla każdego z czterech profili jest w `SPEC_PROFILE.md`, sekcja „Przykład".

To jest **warstwa nośna reguły**: `CLAUDE.md` siedzi w kontekście każdej sesji, więc reguła działa
bez wyzwalania czegokolwiek. Hook wykrywa zdarzenie, ten skill niesie procedurę, a `CLAUDE.md` —
samą regułę. Gdy hook zgłosił już zdarzenie w kontekście, nie powtarzaj zgłoszenia — od razu rób
to, co reguła nakazuje.

### Zmiana profilu

Wyłącznie na prośbę człowieka: nowy wiersz w `USTAWIENIA.md` (stary do „Ustawień wycofanych"),
podmiana sekcji w `CLAUDE.md`. **Dokumentów starego profilu nie kasujesz** — ten, który stracił
sens, dostaje adnotację „NIEAKTUALNE" i idzie do `docs/archiwum/` (D-18).
