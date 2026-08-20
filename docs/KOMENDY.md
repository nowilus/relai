# KOMENDY — RelAI

RelAI 1.5.0

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

Pełna nazwa każdej z nich to `/relai:relai-…` (np. `/relai:relai-backup`) — wpisz `/relai` i wybierz
z podpowiedzi; skrócona forma działa tam, gdzie podpowiadacz ją rozwinie.

## Frazy, które działają

| Powiesz | Co się stanie |
|---|---|
| „kończymy na dziś" / „wrapping up" | RelAI domyka dokumenty, zapisuje wpis w dzienniku, aktualizuje ryzyka, proponuje commit i podsumowuje sesję |
| „kontynuujemy pracę" / „let's continue" | RelAI odtwarza kontekst z dokumentów, mówi, gdzie jesteśmy, i proponuje najbliższy krok |
| „sprawdź status" / „status check" | krótki raport: stan projektu, plany i etapy, otwarte ryzyka, zaległości w dokumentach |
| „przygotuj plan…" / „zaplanuj…" / „rozpisz to na etapy" | powstaje plan w `docs/plany/` z wariantami, ryzykami i etapami — albo krótki miniplan w dzienniku, jeśli zadanie jest drobne |

## Czego RelAI pilnuje bez proszenia

- **Dokumenty nadążają za pracą.** Zmiana funkcjonalna oznacza aktualizację `STATE.md` i wpis do
  `DZIENNIK.md` w tej samej turze — bez pytania o zgodę. Zadanie z działającym kodem i nieaktualnym
  stanem jest w toku, nie skończone.
- **Twoja korekta zostaje zapisana.** Każda uwaga o sposobie pracy trafia do `LEKCJE.md`. Gdy ta
  sama uwaga wraca drugi raz, RelAI proponuje wpisać ją na stałe do `CLAUDE.md`.
- **Dokumenty nie puchną bez końca.** Gdy dziennik albo rejestr lekcji urośnie ponad próg, przy
  zamykaniu sesji najstarsza historia przenosi się do `docs/archiwum/` — w całości, bez skracania —
  a w żywym pliku zostaje linia z linkiem do niej. Wpis czekający na Twoją decyzję zostaje na
  miejscu, choćby był najstarszy. Poniżej progu nie dzieje się nic; progi i wyłącznik masz
  w `docs/USTAWIENIA.md`.
- **Koszt startu sesji jest widoczny, zanim urośnie.** Dokumenty czytane na starcie mają wspólny
  budżet. Gdy go przekroczą, RelAI mówi o tym pierwszym zdaniem sesji, wskazuje trzy najgrubsze
  pozycje i proponuje odchudzenie — niczego nie blokuje i niczego nie zmienia sam. Poniżej budżetu
  milczy. Budżet, progi i wyłącznik: wiersz „Budżet startu sesji" w `docs/USTAWIENIA.md`.
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
Claude. W tym projekcie **nie jest zainstalowany**; instalacja i cofnięcie to po jednym poleceniu
opisanym w [core/README.md](../core/README.md).

Lista rośnie z kolejnymi wersjami RelAI. Numer wersji tego projektu jest w
[USTAWIENIA.md](USTAWIENIA.md).
