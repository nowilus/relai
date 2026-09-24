# KOMENDY — RelAI

RelAI 2.7.0

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
| `/relai-prompt <tekst>` | bierze zdanie podyktowane w biegu i oddaje z niego prompt gotowy do wykonania: dokłada format wyjścia, kryterium odbioru i granicę zakresu, oznacza każde swoje dopowiedzenie, usuwa wartości kluczy i haseł. Do promptu przenosi **pamięć projektu** — kilka decyzji, zasad i pozycji stanu związanych z zadaniem, każdą z numeru albo nazwy, żebyś widział, co doleciało. Odpowiada w **języku Twojego zdania**. Rusztowanie promptu bierze z bazy reguł, którą projekt RelAI dostaje u siebie przy starcie sesji — więc komenda pracuje tak samo w każdym projekcie, nie tylko w repozytorium RelAI. **Model, który przerabia prompt, wybierasz Ty** (od 2.3.1): pierwsze wywołanie pyta o model i zasięg wyboru — ten prompt / ta sesja / ten projekt / wszystkie projekty; `/relai-prompt --model opus <tekst>` wybiera jednorazowo, bez pytania. **Prompt jest skrojony pod
model, który go wykona** (od 2.6.0): domyślnie model tej sesji, przy etapie planu — model etapu,
a `--dla gpt-6-astra` wskazuje go jednorazowo; reguły dostawcy dla rodziny tego modelu (Claude,
OpenAI) biorą się z listy modeli, a pod propozycją stoi linia `target:` z modelem i nakładką. Pokazuje Twój oryginał obok propozycji i zatrzymuje się — niczego nie wykonuje | gdy dyktujesz polecenie szybko i wolisz zobaczyć poprawioną wersję, zanim agent zacznie pracować |

Pełna nazwa każdej z nich to `/relai:relai-…` (np. `/relai:relai-backup`) — wpisz `/relai` i wybierz
z podpowiedzi; skrócona forma działa tam, gdzie podpowiadacz ją rozwinie.

## Frazy, które działają

| Powiesz | Co się stanie |
|---|---|
| „kończymy na dziś" / „wrapping up" | RelAI domyka dokumenty, zapisuje wpis w dzienniku, aktualizuje ryzyka, proponuje commit i podsumowuje sesję |
| „kontynuujemy pracę" / „let's continue" | RelAI odtwarza kontekst z dokumentów, mówi, gdzie jesteśmy, i proponuje najbliższy krok |
| „sprawdź status" / „status check" | krótki raport: stan projektu, plany i etapy, otwarte ryzyka, zaległości w dokumentach |
| „coś nie działa — …" (np. „coś nie działa — npm test pada przy sumie koszyka, napraw to") | zanim RelAI dotknie kodu, odtwarza błąd komendą i pokazuje jej wynik, sprawdza po jednej hipotezie z dowodem, robi najmniejszą poprawkę i uruchamia tę samą komendę jeszcze raz; kończy raportem: odtworzenie, przyczyna, poprawka, dowód. Przyczyna, która jest dziwactwem narzędzia, trafia do `docs/PULAPKI.md`. Po trzech odrzuconych hipotezach zatrzymuje się i mówi, czego potrzebuje od Ciebie (od 2.7.0) |
| „jutro wdrażamy … na produkcję" / „wdrażamy …" | **przed** pierwszym wdrożeniem środowiska: lista kontrolna w sześciu punktach — zmienne i sekrety, kopia danych, droga cofnięcia, kto ma dostęp, audyt zależności (`npm audit` i odpowiedniki), jak sprawdzić, że działa — każdy ze stanem OK / BRAK / NIE DOTYCZY; o wdrożeniu mimo braków decydujesz Ty. Opis środowiska z sekcją „co obserwować po wdrożeniu" powstaje dopiero po wdrożeniu (od 2.7.0) |
| „przygotuj plan…" / „zaplanuj…" / „rozpisz to na etapy" | powstaje plan w `docs/plany/` z wariantami, ryzykami i etapami — albo krótki miniplan w dzienniku, jeśli zadanie jest drobne |

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
