# KOMENDY — RelAI

RelAI 3.6.0

Nic z tej listy nie jest obowiązkowe. RelAI działa w zwykłej rozmowie — piszesz normalnie,
a struktura projektu nadąża. Komendy są skrótem do rzadszych operacji.

## Komendy

| Komenda | Co robi | Kiedy użyć |
|---|---|---|
| `/relai-stage` | znajduje aktywny plan i pierwszy etap gotowy do startu, pokazuje, co się wydarzy, i czeka na Twoje „zaczynamy" | na początku świeżej sesji, w której chcesz zrobić kolejny etap planu |
| `/relai-stage E5` · `/relai-stage PLATNOSCI E2` | to samo, ale dla wskazanego etapu (i planu) | gdy chcesz wrócić do etapu innego niż następny w kolejce |
| `/relai-backup` | pakuje cały projekt do jednego pliku ZIP w Twoim folderze backupów; hasła i klucze zostają poza archiwum | przed większą zmianą, przed aktualizacją, albo po prostu raz na jakiś czas |
| `/relai-audit` | przegląda dokumenty i mówi, co się rozjechało: co jest nieaktualne, czego brakuje, co czeka od miesięcy — i proponuje, co z tym zrobić | gdy wracasz po przerwie albo przed pokazaniem projektu komuś |
| `/relai-changelog` · `/relai-changelog od 2026-08-01` | zamienia dziennik w listę zmian po ludzku: co nowego, co poprawione | gdy ktoś pyta „co się zmieniło od ostatniego razu" |
| `/relai-handover` | składa pakiet przekazania: jeden plik HTML ze stanem, mapą dokumentów, planami, ryzykami i pierwszymi krokami | gdy oddajesz projekt komuś innemu — na stałe albo na czas urlopu |
| `/relai-tour` | oprowadza po projekcie: co to jest, gdzie jesteśmy, czego nie ruszać, od czego zacząć | gdy otwierasz cudzy projekt albo wracasz do własnego po długiej przerwie |
| `/relai-help` | pokazuje tę ściągę | gdy nie pamiętasz, co można wpisać |
| `/relai-adopt` | przenosi istniejący projekt na RelAI: najpierw pełny backup, potem analiza i dokumenty wygenerowane z tego, co w projekcie naprawdę jest; kończy raportem z instrukcją pełnego cofnięcia | w folderze innego projektu, który chcesz objąć RelAI — ten projekt już jest objęty |
| `/relai-update` | podnosi projekt do wersji zainstalowanego RelAI: pokazuje, co się zmieni, czeka na Twoje „tak" i nie rusza niczego, co sam zmieniłeś | gdy RelAI mówi na starcie sesji, że projekt jest starszy niż plugin |
| `/relai-branch` · `/relai-branch OPIS_REPO` | odkłada boczny wątek na bok: spisuje, o co chodzi i po czym poznać, że zrobione, i przygotowuje gotowy prompt do wklejenia w nowej sesji | gdy w trakcie etapu wypływa coś ważnego, ale nie na teraz — zamiast robić to przy okazji albo zapomnieć |
| `/relai-models` | odświeża listę modeli Twojego narzędzia: pyta o zgodę na wejście do internetu, czyta dokumentację dostawcy albo pyta Ciebie o nazwy, pokazuje różnicę stara–nowa i zapisuje dopiero po Twoim „tak" | gdy przy pytaniu o model widzisz starą datę listy albo pozycję „do uzupełnienia" |
| `/relai-crew` · `/relai-crew <cel>` · `/relai-crew review` · `/relai-crew rescue <zadanie>` · `/relai-crew setup` · `/relai-crew status` | robi z Twojej sesji orkiestratora celu: pyta o podział ról, liczbę subagentów, tryb pracy i zakres modeli, układa zadania w fale tak, żeby dwa nie pisały naraz do tego samego pliku, deleguje je subagentom w Twoim narzędziu albo do drugiego zalogowanego narzędzia (Claude Code, Codex, Cursor), a na końcu zleca przegląd krzyżowy innemu modelowi i domyka dokumenty; bez drugiego narzędzia mówi o tym jednym zdaniem i pracuje w trybie basic w obrębie Twojego; `review` to sam przegląd krzyżowy bieżących zmian, `rescue` — jedno zadanie oddane drugiemu narzędziu, `setup` — raport gotowości z poleceniami dla Ciebie, `status` — stan przebiegów. Od 2.7.0 członek załogi, który kończy samym meldunkiem bez dowodu, dostaje najwyżej dwie automatyczne kontynuacje, potem sprawa wraca do Ciebie; zadania trafiają do subagentów tylko wtedy, gdy są duże i niezależne | gdy cel jest za duży na jedną parę rąk, albo gdy chcesz, żeby kod napisany w jednym narzędziu przejrzało drugie |
| `/relai-clean` · `/relai-clean raport` | pokazuje, co realnie zostało po zamkniętych etapach — w katalogu roboczym projektu, w folderze plików tymczasowych systemu i wśród plików nieśledzonych — grupuje to i pyta partiami po cztery; kasuje wyłącznie grupy, na które powiesz „tak". Z argumentem `raport` sam raport: żadnych pytań, żadnego kasowania | gdy plików roboczych zrobiło się dużo albo gdy RelAI powie o tym na starcie sesji |
| `/relai-security` | sprawdza **kod i zależności, nie dokumenty**: skanuje biblioteki projektu Trivy, podaje liczby według wagi i plan aktualizacji „jest → cel”, a nowe podatności krytyczne i wysokie wpisuje do ryzyk w dzienniku (ta sama podatność nigdy dwa razy). Paczki aktualizuje dopiero po Twoim „tak”, potem testy i ponowny skan. Bez Trivy proponuje instalację i do tego czasu używa komendy audytu Twojego ekosystemu (`npm audit`, `pip-audit`…). `/relai-security --full` robi pełny audyt bezpieczeństwa kodu skillem Cloudflare `security-audit` — wielu agentów, więc najpierw mówi o koszcie i czeka na „tak”, a raport zostawia w `.security/security-audit/` | przed wydaniem, po dodaniu albo podbiciu bibliotek, albo gdy chcesz wiedzieć, czy zależności są bezpieczne |
| `/relai-prompt <tekst>` | bierze zdanie podyktowane w biegu i oddaje z niego prompt gotowy do wykonania: dokłada format wyjścia, kryterium odbioru i granicę zakresu, oznacza każde swoje dopowiedzenie, usuwa wartości kluczy i haseł. Do promptu przenosi **pamięć projektu** — kilka decyzji, zasad i pozycji stanu związanych z zadaniem, każdą z numeru albo nazwy, żebyś widział, co doleciało. Odpowiada w **języku Twojego zdania**. Rusztowanie promptu bierze z bazy reguł, którą projekt RelAI dostaje u siebie przy starcie sesji — więc komenda pracuje tak samo w każdym projekcie, nie tylko w repozytorium RelAI. **Model, który przerabia prompt, wybierasz Ty** (od 2.3.1): pierwsze wywołanie pyta o model i zasięg wyboru — ten prompt / ta sesja / ten projekt / wszystkie projekty; `/relai-prompt --model opus <tekst>` wybiera jednorazowo, bez pytania. **Prompt jest skrojony pod
model, który go wykona** (od 2.6.0): domyślnie model tej sesji, przy etapie planu — model etapu,
a `--dla gpt-6-astra` wskazuje go jednorazowo; reguły dostawcy dla rodziny tego modelu (Claude,
OpenAI) biorą się z listy modeli, a pod propozycją stoi linia `target:` z modelem i nakładką. Pokazuje Twój oryginał obok propozycji i zatrzymuje się — niczego nie wykonuje | gdy dyktujesz polecenie szybko i wolisz zobaczyć poprawioną wersję, zanim agent zacznie pracować |
| `/relai-humanize <tekst>` · `/relai-humanize docs/notka.md` · `/relai-humanize on` · `/relai-humanize off` · `/relai-humanize ustawienia` | usuwa z tekstu albo pliku nawyki pisarskie AI bez zmiany treści: pokazuje oryginał obok wersji poprawionej, wypisuje usunięte wzorce i sprawdza, czy liczby, daty, linki i kod przetrwały; plik zmienia dopiero po Twoim „tak". Pierwsze wywołanie pyta krótko o ton i zakresy. `on` / `off` przełączają tryb ciągły, który w **Claude Code** poprawia na bieżąco wybrane zakresy (dokumenty, czat, teksty na zewnątrz); w Cursorze i Codeksie komenda działa na żądanie. `ustawienia` powtarza wywiad | gdy tekst do wysłania albo dokument brzmi jak napisany przez AI |

Pełna nazwa każdej z nich to `/relai:relai-…` (np. `/relai:relai-backup`) — wpisz `/relai` i wybierz
z podpowiedzi; skrócona forma działa tam, gdzie podpowiadacz ją rozwinie.

## Narzędzie `relai-scope` — RelAI tylko w projektach (Claude Code, od 3.6.0)

Przełącza maszynę w tryb, w którym RelAI i trzy dodatki (`relai-panel`, `relai-progress`,
`relai-cache-keeper`) są wyłączone w ustawieniach użytkownika, a włączone lokalnie w każdym
projekcie z RelAI (`.claude/settings.local.json`). Nie jest komendą czatu — uruchamiasz je
w PowerShellu, po ustaleniu ścieżki pluginu:

```powershell
$relai = ((claude plugin list --json | ConvertFrom-Json) | Where-Object id -eq 'relai@relai').installPath
```

| Polecenie | Co robi | Kod wyjścia |
|---|---|---|
| `node "$relai\core\tools\relai-scope.js" status` | podgląd: projekty z markerem z historii sesji (i z argumentów), stan teraz, planowane zmiany; nic nie zapisuje | 0 |
| `node "$relai\core\tools\relai-scope.js" apply` | lokalne włączenie w każdym projekcie i linia w `.worktreeinclude`, na końcu globalne wyłączenie; dziennik `~/.claude/relai/zasieg-pluginu.json` | 0 — wykonane; 1 — przerwane (globalne wyłączenie nie zaszło) |
| `node "$relai\core\tools\relai-scope.js" undo` | cofa wszystko z dziennika: najpierw poziom użytkownika, potem projekty | 0 — cofnięte albo brak dziennika (wtedy polecenia ręczne); 1 — przerwane |
| `node "$relai\core\tools\relai-scope.js" on` | włącza RelAI w bieżącym folderze (albo w folderze podanym argumentem), bez ruszania ustawień użytkownika | 0; 1 — błąd albo folder domowy |
| `node "$relai\core\tools\relai-scope.js" off` | to samo, wyłączenie | 0; 1 — błąd albo folder domowy |

Opcje: `--cli <pełna ścieżka>` gdy `claude` jest z npm (`claude.cmd`), `--home <folder>` — inny
katalog domowy. Zmiana działa po `/reload-plugins` albo w nowej sesji; sesję otwierasz w korzeniu
projektu. Bez terminala: wiersz „RelAI w tym projekcie” w `/relai-mods`.

## Frazy, które działają

| Powiesz | Co się stanie |
|---|---|
| „kończymy na dziś" / „wrapping up" | RelAI domyka dokumenty, zapisuje wpis w dzienniku, aktualizuje ryzyka, proponuje commit i podsumowuje sesję |
| „kontynuujemy pracę" / „let's continue" | RelAI odtwarza kontekst z dokumentów, mówi, gdzie jesteśmy, i proponuje najbliższy krok. Gdy w projekcie czeka plik wznowienia (po „zapisz pracę”), zaczyna od niego: mówi, ile commitów doszło od zapisu, proponuje pierwszy krok z jego listy „co dalej” i raz pyta, czy plik skasować. W Claude Code nowa sesja zaczęta tą frazą (także „tak”, „kontynuuj”, komenda etapu z karty) dostaje tytuł planu i etapu, np. „E4 · ZGLOSZENIA — Tytuł nowej sesji (#1)”, zamiast samej frazy |
| „sprawdź status" / „status check" | krótki raport: stan projektu, plany i etapy, otwarte ryzyka, zaległości w dokumentach |
| „zapisz pracę" / „save my work" | gdy limit planu się kończy: RelAI uruchamia testy, robi commit lokalny tego, co działa (bez pusha), domyka dokumenty i zostawia plik wznowienia z listą „co dalej” — następna sesja zaczyna od niego. W Claude Code to samo robi przycisk „Zapisz pracę teraz” na karcie limitu, a kliknięcie jest zgodą na commit; wpisana ręcznie fraza pyta o commit. Na pasku zostaje „zapis gotowy · reset GG:MM” albo „zapis niepełny”; po resecie limitu — „Wznów pracę” (czysty czat, który zaczyna od pliku wznowienia) i „Odrzuć” (prośba do Claude o skasowanie pliku) |
| „coś nie działa — …" (np. „coś nie działa — npm test pada przy sumie koszyka, napraw to") | zanim RelAI dotknie kodu, odtwarza błąd komendą i pokazuje jej wynik, sprawdza po jednej hipotezie z dowodem, robi najmniejszą poprawkę i uruchamia tę samą komendę jeszcze raz; kończy raportem: odtworzenie, przyczyna, poprawka, dowód. Przyczyna, która jest dziwactwem narzędzia, trafia do `docs/PULAPKI.md`. Po trzech odrzuconych hipotezach zatrzymuje się i mówi, czego potrzebuje od Ciebie (od 2.7.0) |
| „jutro wdrażamy … na produkcję" / „wdrażamy …" | **przed** pierwszym wdrożeniem środowiska: lista kontrolna w sześciu punktach — zmienne i sekrety, kopia danych, droga cofnięcia, kto ma dostęp, audyt zależności (`npm audit` i odpowiedniki), jak sprawdzić, że działa — każdy ze stanem OK / BRAK / NIE DOTYCZY; o wdrożeniu mimo braków decydujesz Ty. Opis środowiska z sekcją „co obserwować po wdrożeniu" powstaje dopiero po wdrożeniu (od 2.7.0) |
| „przygotuj plan…" / „zaplanuj…" / „rozpisz to na etapy" | powstaje plan w `docs/plany/` z wariantami, ryzykami i etapami — albo krótki miniplan w dzienniku, jeśli zadanie jest drobne |

## Tylko w tym repozytorium (budowa RelAI)

Komenda projektowa z `.claude/commands/`, hook gita i reguła `CLAUDE.md` tego repo — nie należą
do pluginu i nie trafiają do użytkowników RelAI; szesnaście komend pluginu wyżej zostaje bez zmian.

| Komenda albo fraza | Co się stanie |
|---|---|
| `/relai-release` · „gotowi do wydania?” | uruchamia raport gotowości `node core/tools/release-check.js --json`: werdykt, propozycje numerów (patch / minor z commitów od ostatniego tagu, osobno rdzeń i każdy mod), czerwone kontrole. Braki dzieli na bezpieczne (regeneracje, numery, szkice wpisów i wierszy README) — wykonuje je po jednej zgodzie i pokazuje raport po naprawie — i na listę dla Ciebie. Tag, push, wydanie GitHub, marketplace i aktualizacja pluginów idą wyłącznie po osobnym „tak” na każdy krok. W Codeksie i Cursorze fraza daje sam raport (plan PIPELINE_WYDAN E2). Po publikacji i restarcie komenda uruchamia weryfikację `node core/tools/release-verify.js --plugin <plugin> --wersja <N.N.N> --sesja` (cache równy tagowi, świeża sesja ładuje tę wersję), a przy wydaniu modu pyta o `/reload-plugins` i rzut oka na panel — wydanie zamknięte dopiero po Twoim „ok” (E3) |
| bramka `pre-push` (hook gita) | push tagu `v*` albo `relai-<mod>-v*` przechodzi tylko przy zielonym raporcie `release-check.js --rev <tag> --wydanie` (tag modu: `--komponent relai-<mod>` — kontrole z wierszy mapy tego modu, bez filmu i numeru rdzenia). Push zwykłego commitu i usunięcie tagu — bez kontroli. Działa w każdym narzędziu, które pushuje gitem. Instalacja raz na klon (zmiana konfiguracji maszyny): `node core/tools/install-prepush.js`, cofnięcie z `--uninstall`; brak hooka raport pokazuje jako ostrzeżenie, z `--wydanie` jako czerwień |
| obejście bramki | `RELAI_RELEASE_OBEJSCIE="<powód>" git push origin <tag>` — pusty powód nie obchodzi; hook dopisuje do `docs/DZIENNIK.md` linię z datą, tagiem, czerwonymi kontrolami i powodem. Każde obejście to sygnał do poprawki kontroli |
| podpowiedź gotowości | przy „kontynuujemy pracę” i przy zamknięciu planu sesja uruchamia `node core/tools/release-hint.js` (~1 s) i mówi jedno zdanie „od v<baza>: N plików w <komponenty>; sprawdzić gotowość?”; gdy od tagu zmieniły się tylko pliki bez wydania (np. `docs/`) — milczy |

## Panel w Claude Code (early access, od 2.8.0)

Trzy osobne pluginy z marketplace RelAI, na modach Claude Code („early access”, zmierzone na 2.1.293),
instalowane każdy własną komendą: `claude plugin install relai-panel@relai`,
`claude plugin install relai-progress@relai`, `claude plugin install relai-cache-keeper@relai`,
potem ponowne uruchomienie aplikacji. Czwarty plugin, kokpit pluginów i hooków (bez etykiety
„early access”, od `relai-mods` 0.1.0, zmierzony na 2.1.308): `claude plugin install relai-mods@relai`.

- **Nad promptem** — trzy spokojne paski bez przycisków: plan (aktywny plan, etap, status),
  postęp (segmenty etapu albo przebiegu załogi, pod nimi następny punkt; chip agentów z kosztem)
  i cache (pięć baterii: czas cache, limit 5 h, reset za, limit tygodnia, kontekst — bateria
  pokazuje, ile zostało, pełny opis w dymku po najechaniu na ikonę; koszt sesji po prawej).
  Bateria limitu 5 h czerwienieje od progu limitu (domyślnie 90 %), bateria tygodnia od progu
  tygodnia (domyślnie 98 %); gdy nie jest spokojna, pod nią stoi „próg N % · skąd ten próg”.
  Po turze ponad progiem, przy pracy w toku, przychodzi karta: pracuję dalej / zapisz pracę.
  Drugi wiersz pod paskiem pojawia się tylko z powodu: karta decyzji czeka, punkt właśnie
  odhaczony, cache stygnie, przekazanie gotowe albo przejście do nowej sesji się opłaca (pasek
  mówi, ile kosztuje wiadomość tu i tam, i po ilu wiadomościach odrobisz przekazanie; przycisk
  „Nowa sesja”).
- **`/relai-panel`** — panel z paskiem „Teraz” (etap i następny punkt, jedna akcja główna)
  i zakładkami: Komendy (dwie polecane, dwanaście wierszy z nazwą komendy, formularz pod
  wierszem), Koszty (sekcje zwinięte, rozwijane; karta „Próg limitu” — dla 5 h i tygodnia
  linijka: ile zużyte, kreska progu i ile do niego zostało, skąd próg; przyciski wartości
  — klik pyta o zasięg: ta sesja / ten projekt / wszystkie projekty / nie zapisuj; „Inna…”
  najpierw o liczbę), Dokumenty (zmienione na górze, diff od ostatniego
  commita, podgląd), Mapa (plany, etapy, odnogi, przebiegi załogi i koszt każdego etapu), Pomoc
  (ściąga komend i frazy sesji).
- **`/cache`** — stan cache, ustawienia i rachunek „kontynuować czy nowa sesja”; `/cache zwrot N`
  ustawia próg w wiadomościach (domyślnie 20, od 1 do 50); `/cache limit-warn [N]` i `/cache limit-warn-week [N]` to
  zapasowa droga do tych samych kart progu co przyciski w Kosztach.
- **`/relai-agents`** — subagenci sesji: model, kontekst i koszt.
- **`/relai-mods`** — kokpit modów, pluginów i hooków z `settings.json` tej maszyny, czytany
  z dysku, w zwiniętych grupach ze szczegółami pod wierszem. Przełącznik włącza albo wyłącza
  jeden plugin przez `claude plugin enable/disable` z PATH; zmiana działa po przeładowaniu.
  Przeładuj w terminalu przeładowuje pluginy od razu, na desktopie prosi o wpisanie
  `/reload-plugins`. Hooki, pluginy z polityki i sam kokpit mają kłódkę zamiast przełącznika.
  Kokpit nie pisze do `settings.json` ani `installed_plugins.json`. Wiersz „RelAI w tym projekcie”
  nad listą (od `relai-mods` 0.3.0) pokazuje stan RelAI w folderze sesji słowem i znakiem: ✓ włączony
  w tym projekcie, ● włączony z ustawień globalnych, ◐ częściowo (np. 2/4 włączone), ○ wyłączony. Włącz albo Wyłącz
  otwiera kartę „Tak / Nie” z plikiem, pluginami i linią worktree; po „Tak” `claude plugin
  enable/disable --scope local` dla RelAI i trzech dodatków, a przy włączaniu w repozytorium linia
  `.claude/settings.local.json` w `.worktreeinclude` — jedyny plik, który kokpit zapisuje sam.
  W folderze domowym wiersza nie ma.
- **Karta „Tak / Nie”** — start etapu, sprzątanie, aktualizacja, lista modeli i zmiana cennika idą
  z panelu dopiero po Twoim „Tak”. Etap potwierdzony na karcie startuje bez drugiego pytania w czacie.
- **Sieć** — jedyny odczyt to strona cennika Anthropic, po „Tak” na karcie aktualizacji cennika.

## Czego RelAI pilnuje bez proszenia

- **Dokumenty nadążają za pracą.** Zmiana funkcjonalna oznacza aktualizację `STATE.md` i wpis do
  `DZIENNIK.md` w tej samej turze — bez pytania o zgodę. Zadanie z działającym kodem i nieaktualnym
  stanem jest w toku, nie skończone.
- **Twoja korekta zostaje zapisana.** Każda uwaga o sposobie pracy trafia do `LEKCJE.md`. Gdy ta
  sama uwaga wraca drugi raz, RelAI proponuje wpisać ją na stałe do `CLAUDE.md`.
- **Dokumenty nie puchną bez końca.** Gdy dziennik albo rejestr lekcji urośnie ponad próg, przy
  zamykaniu sesji najstarsza historia przenosi się do `docs/archiwum/` — w całości, bez skracania —
  a w żywym pliku zostaje linia z linkiem do niej. Tą samą drogą schodzą **ryzyka zamknięte** —
  do `docs/archiwum/ryzyka/`, z numerami wypisanymi w żywej tabeli, żeby żaden numer nie wrócił.
  Sprawa czekająca na Twoją decyzję nie zatrzymuje już rotacji: wpis, do którego prowadzi, jedzie
  do archiwum jak każdy inny, a link sprawy zostaje przepięty na plik archiwum. Poniżej progu nie
  dzieje się nic; progi i wyłącznik masz w `docs/USTAWIENIA.md`.
- **Koszt startu sesji jest widoczny, zanim urośnie.** Dokumenty czytane na starcie — razem
  ze skillem ładowanym na pierwszym prompcie i plikami z rytuału startu w `CLAUDE.md` — mają wspólny
  budżet (domyślnie 100 KB). Gdy go przekroczą, RelAI mówi o tym pierwszym zdaniem sesji, wskazuje
  najgrubsze pozycje, wylicza, co jest w sumie, i proponuje odchudzenie — niczego nie blokuje i niczego nie zmienia sam. Poniżej budżetu
  milczy. Budżet, progi i wyłącznik: wiersz „Budżet startu sesji" w `docs/USTAWIENIA.md`.
- **Sprawy czekające na Ciebie mają stałe miejsce.** Decyzja, dostęp, zakup, akceptacja — wszystko,
  czego RelAI nie zrobi za Ciebie — stoi w sekcji „Czeka na człowieka" na górze dziennika, jedna
  linia na sprawę z linkiem do wpisu, w którym padła. Sesja czyta ją na starcie, więc sprawa sprzed
  miesięcy przestaje ginąć; rozstrzygnięta znika z sekcji tego samego dnia.
- **Sprawa, która czeka zbyt długo, wymusza decyzję.** Pozycja z sekcji „Czeka na człowieka"
  starsza niż próg z wiersza „Przegląd spraw człowieka" w `docs/USTAWIENIA.md` (domyślnie 30 dni)
  wraca na starcie sesji jako pytanie: zamknąć, odroczyć o kolejne tyle samo dni, czy rozstrzygnąć
  teraz. Pytania padają partiami po cztery. Poniżej progu — cisza; wyłącznik jest osobny od
  wyłącznika rotacji.
  W sesji bez człowieka (`claude -p`, agent w tle) zostaje sam raport, bez pytań — ale sesję
  taką rozpoznaje model z kontekstu, a nie hook: żaden sygnał techniczny jej nie oznacza, więc
  reguła działa tak dobrze, jak to rozpoznanie.
- **Pliki robocze po zamkniętych etapach nie zostają na zawsze.** Gdy uzbierają się ponad próg
  z wiersza „Artefakty robocze" w `docs/USTAWIENIA.md` (domyślnie 100 MB), RelAI mówi o tym jednym
  zdaniem na starcie sesji — waga, ile pozycji, trzy najcięższe — i proponuje `/relai-clean`.
  Przy „kończymy na dziś" pyta o katalogi etapów już zamkniętych. Nic nie znika samo: kasowanie
  wymaga Twojego „tak" na konkretną grupę, plik śledzony przez gita nie jest kandydatem nigdy,
  a Twoją lokalną notatkę chroni linia `# relai: zachowaj` nad wzorcem w `.gitignore`. Poniżej
  progu i przy etapie w toku — cisza.
- **Stara lista modeli przypomina się sama.** Start sesji mówi, która lista modeli obowiązuje
  w tym narzędziu, a gdy jest starsza niż próg z wiersza „Lista modeli" w `docs/USTAWIENIA.md`
  (domyślnie 7 dni) — dokłada jedno zdanie z jej wiekiem i propozycją `/relai-models`. Samo zdanie
  niczego nie pobiera: do internetu RelAI wchodzi wyłącznie po Twoim „tak" w komendzie, i pyta
  o nie za każdym razem. Poniżej progu — cisza; wyłącznik jest osobny od pozostałych. Ten sam
  wiersz wycisza drugie zdanie (od 2.6.0): o **regułach dostawców** dla rodzin modeli, gdy mają
  ponad 30 dni — świeże przychodzą z aktualizacją pluginu.
- **Podyktowane zdanie wraca poprawione, zanim ruszy w robotę.** Wiersz „Tryb ciągły"
  w `docs/USTAWIENIA.md` włącza optymalizator na stałe: każdy prompt merytoryczny wraca najpierw
  z propozycją i oryginałem obok, a wykonanie czeka na Twoją zgodę. Nietknięte przechodzą
  wywołania komend, frazy sesji, krótkie potwierdzenia i pytania — o kod pytasz normalnie. Od
  2.7.0 nietknięte przechodzi też powiadomienie o zakończonym zadaniu w tle — nie jest Twoim
  promptem, więc nie dostaje pytania o zgodę.
  Wyłącznikiem jest ten jeden wiersz; wartość spoza listy i brak wiersza znaczą wyłączony i ciszę.
  Tryb działa w **Claude Code**; w Cursorze i Codeksie komenda `/relai-prompt` działa normalnie,
  a o braku trybu pada jedno zdanie przy pierwszym wywołaniu w sesji.
  **Od 2.3.0 włączony wiersz nie wystarcza:** pierwszy prompt merytoryczny sesji wraca pytaniem
  o zgodę — **ta sesja** / **nie pytaj więcej** / **nie**. Odmowa wycisza tryb do końca sesji,
  zgoda „nie pytaj więcej" idzie do ustawień globalnych i przypomina o sobie raz na 30 dni.
  Przełączniki: `/relai-prompt on`, `/relai-prompt off` (projekt) oraz `/relai-prompt off --globalnie`
  (cofnięcie zgody na stałe).
  **Od 2.7.0 pytanie jest jedno:** gdy model optymalizatora nie jest jeszcze wybrany na stałe,
  bramka każe zadać zgodę i wybór modelu (z zasięgiem) w tym samym oknie pytań, zamiast dwóch
  pytań po kolei (sprawdzone na treści bramki; w oknie aplikacji czeka na potwierdzenie).
- **RelAI nie proponuje się w cudzym folderze dwa razy.** Plugin jest zainstalowany dla całego
  konta, więc widzi każdy katalog otwarty w Claude Code albo Codeksie i w każdym zapyta raz, czy
  założyć strukturę. Odmowa zamyka temat w tym folderze (tryb gościa), a od 2.3.0 pytanie
  towarzyszące zamyka go **na całej maszynie** — wiersz `Propozycja RelAI poza projektem`
  w ustawieniach globalnych. Projektów z markerem RelAI to nie dotyczy.
- **Pułapki mają własny dokument.** Rzecz, która raz zaskoczyła i zaskoczy znowu — nieoczywiste
  zachowanie narzędzia, kolejność kroków, wymóg środowiska — trafia do `docs/PULAPKI.md`. Ten plik
  czyta się **na żądanie**, a nie przy starcie sesji, więc nie kosztuje ani jednego tokena, dopóki
  nic nie wybucha. Powstaje przy pierwszej pułapce; projekt bez pułapek go nie ma.
- **Powracające rozstrzygnięcie idzie do zamrożenia.** Temat rozstrzygany drugi raz tak samo kończy
  się propozycją wpisu do `DECYZJE.md`. Zdania w rodzaju „nie rób tego więcej" zapisują się od razu.
- **Sekret nie wejdzie do repozytorium.** Zapis klucza API, tokenu, JWT, klucza prywatnego albo
  przypisania `SECRET=` z wartością do pliku śledzonego przez gita jest blokowany. Sekret może
  trafić wyłącznie do `.env` objętego `.gitignore`.
- **Reguły i ustawienia nie zmienią się po cichu.** Edycja sekcji niemutowalnej `CLAUDE.md` albo
  `docs/USTAWIENIA.md` wymaga Twojego jawnego zatwierdzenia w sesji.
- **Start sesji ma stałą kolejność.** Data dnia, rytuał startu, kontrola wersji projekt↔plugin
  i sygnały wymagające reakcji trafiają do kontekstu niezależnie od tego, czy cokolwiek się
  „wyzwoliło".
- **Wątek spoza etapu nie ginie i nie rozdyma etapu.** Gdy w trakcie pracy wypływa coś poza
  zakresem, RelAI zatrzymuje się i pyta: odnoga, aneks do planu czy „świadomie odłożone". Przy
  zamykaniu planu wylicza odnogi, które zostały otwarte.
- **To, co czeka na Ciebie, jest widoczne.** Pozycje „Do zrobienia przez człowieka" — dostęp,
  zakup, decyzja, akceptacja — trafiają z wpisów dziennika do sekcji „Bramki manualne" w `STATUS.md`
  planu. Plan nie zamyka się, dopóki RelAI nie zapyta o każdą z nich.
- **Rozjazd stanu jest zgłaszany.** Gdy status etapu, wskazanie aktywnego planu i opis stanu mówią
  różne rzeczy, RelAI mówi o tym na starcie sesji jednym zdaniem i pyta, który zapis jest prawdziwy —
  zamiast wybrać sobie jeden i pracować na nim.
- **Wpis w dzienniku jest podpisany.** Model i Ty (z konfiguracji gita); brakujący człon
  użytkownika zostaje wyłapany zaraz po zapisie, żeby po miesiącach było wiadomo, kto przy tym był.
- **Brakujący prompt etapowy jest wyłapywany.** Sesja przerwana w połowie zamykania etapu zostawia
  lukę — RelAI mówi o niej na starcie i proponuje uzupełnienie. Nigdy nie robi tego sam.
- **Niedomknięty rytuał jest wyłapywany** (od 2.7.0). Na starcie sesji RelAI mówi jednym zdaniem,
  gdy etap ma status zrealizowany, a dziennik nie ma wpisu z tą datą albo następny etap nie ma
  promptu; gdy artefakt z `docs/ARTEFAKTY.md` jest zmieniony, a jego wersja w rejestrze nie
  urosła; gdy `AGENTS.md` będący kopią `CLAUDE.md` rozjechał się z oryginałem. Proponuje
  uzupełnienie — nigdy nie robi go sam. Gdy wszystko się zgadza, milczy.
- **„Gotowe" przychodzi z wynikiem testów** (od 2.7.0). Zadanie, które zmieniło kod, RelAI kończy
  uruchomieniem testów Twojego projektu (`npm test`, `pytest`…; gdy testów nie ma, mówi to wprost)
  i przeglądem własnego diffu, a zgłasza je trzema liniami: testy z wynikiem, zmienione pliki,
  ryzyka. Własnego narzędzia do testów nie ma — uruchamia komendę projektu.
- **Cudzy projekt dostaje propozycję wycieczki.** Gdy wszystkie wpisy w dzienniku podpisał ktoś
  inny, RelAI proponuje oprowadzenie po projekcie — propozycja, nigdy automatyczne odpalenie.
- **Różnica wersji jest sygnalizowana.** Gdy projekt jest starszy niż zainstalowany plugin, RelAI
  mówi o tym na starcie i wskazuje `/relai-update` — nie migruje projektu na własną rękę.
- **Artefakty mają rejestr.** Nowa albo niezarejestrowana wersja artefaktu kończy się
  przypomnieniem o wpisie „co się zmieniło" i „po co".
- **Ostrzeżenia bez blokowania.** `console.log` w zapisanym pliku, wynik `tsc`/eslint (gdy projekt
  ma te narzędzia), odstępstwo od `docs/DESIGN.md` (gdy plik istnieje), zmiana kodu bez wpisu do
  dziennika — każde z nich daje sygnał, żadne nie zatrzymuje pracy.

**Do włączenia ręcznie:** skan sekretów przy commicie. RelAI ma gitowy hook `pre-commit`, po
którego zainstalowaniu `git commit` z kluczem albo hasłem w plikach z indeksu kończy się błędem
i commit nie powstaje — także wtedy, gdy commituje człowiek albo inne narzędzie, bez udziału
Claude. W tym projekcie **jest zainstalowany** (od 2026-09-01); cofnięcie to jedno polecenie opisane
w [core/README.md](../core/README.md).

Lista rośnie z kolejnymi wersjami RelAI. Numer wersji tego projektu jest w
[USTAWIENIA.md](USTAWIENIA.md).
