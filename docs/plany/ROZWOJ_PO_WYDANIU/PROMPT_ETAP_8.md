# PROMPT_ETAP_8 — Wydanie 2.0.0 i dystrybucja RelAI

Plan: ROZWOJ_PO_WYDANIU • Etap: **E8 z E8** • Wygenerowano: 2026-09-05 (autor: gpt-5.6-terra/high, w rytuale „Na koniec" etapu E7) • Wykonawca: **gpt-5.6-terra/high**

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **balanced**, w tym narzędziu:
> **gpt-5.6-terra** (lista modeli z dnia 2026-09-05). Jeśli sesja działa na innym modelu —
> zatrzymaj się przed zapisem i poproś użytkownika o przełączenie.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| CLAUDE.md | reguły procesu, aktywny plan i definicja ukończenia |
| docs/STATE.md | faktyczny stan po wydaniu Codex 1.10.0 i otwarte ograniczenia |
| docs/DZIENNIK.md | sekcja ryzyk + „Czeka na człowieka” + ostatni wpis |
| docs/LEKCJE.md | wyłącznie „Zasady aktywne” |
| docs/USTAWIENIA.md | preferencje projektu i wersja markerów |
| docs/plany/ROZWOJ_PO_WYDANIU/STATUS.md | status E8 i bramki planu |
| docs/plany/ROZWOJ_PO_WYDANIU/PLAN.html | sekcje 6, 8, 9, 10 i Aneksy A–C |
| docs/plany/ROZWOJ_PO_WYDANIU/E7-REPORT.md | dowody E7 i jawne NOT TESTED |
| README.md + docs/PRZENOSNOSC.md | publiczna ścieżka instalacji i ograniczenia trzech adapterów |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- E7 dostarczył natywny plugin Codexa 1.10.0 z rootowym skills/, hooks/hooks.json i marketplace — Aneks B.
- Wersja E8 to 2.0.0; 1.10.0 pozostaje wydaniem kompatybilności Codexa, nie zmieniaj tej decyzji — Aneks B.
- Repozytorium github.com/nowilus/relai jest publiczne, a pełne wydanie GitHub jest wybrane przez użytkownika.
- Niedostępność Cursor/Claude nie blokuje publikacji, ale każde takie miejsce pozostaje jawnie NOT TESTED — Aneks C.
- Nie kopiuj rdzenia do drugiego drzewa; rootowy skills/ generuj deterministycznie z jednego źródła.
- Nie nadpisuj istniejącego tagu ani release; konflikt wersji zatrzymuje etap.
- Granica: E8 dotyczy wydania 2.0.0, dokumentacji dystrybucji, marketplace i zamknięcia planu; nowe funkcje procesu po wydaniu są poza zakresem.

## Stan wyjściowy — co realnie zastajesz

RelAI 1.10.0 jest opublikowany i instalowalny z publicznego marketplace Codexa. Lokalny HEAD zawiera
commit dokumentacyjny po wydaniu; pełny scenariusz świeżej sesji Codexa zatrzymał się na AuthRequired
worker'a MCP i jest jawnie NOT TESTED. Dostępne testy pluginu, validatorów i instalatorów są zielone.

    .codex-plugin/plugin.json
    .agents/plugins/marketplace.json
    skills/
    hooks/hooks.json
    adapters/codex/
    adapters/claude-code/
    adapters/cursor/
    core/
    README.md, docs/PRZENOSNOSC.md

Czego jeszcze NIE ma: wydania 2.0.0, finalnych release notes dla dystrybucji, pełnego audit trail
publikacji, finalnego zamknięcia planu i decyzji, czy pozostałe NOT TESTED wymagają osobnej odnogi pomiarowej.

Zasady aktywne z docs/LEKCJE.md, obowiązujące w tym etapie:

## Zasady aktywne

1. **Specyfikacja dokumentu jest kompletna albo martwa:** kończy się realnym przykładem, wypisuje
   wymaganą strukturę w treści (odesłanie nie wystarcza) i ma zapisaną ścieżkę „pytam zamiast
   zmyślać" wraz z formą zapisu luki. **Wzorzec powtarzalny sprawdzasz na całej rodzinie
   dokumentów** — punkt „stare brzmienie nie zwraca nic" uruchamiaj na katalogu specyfikacji, bo
   jego wartością jest trafienie **poza** zakresem etapu; takie trafienie jest sygnałem odchylenia,
   nie usterką weryfikacji. (L-0001, L-0011, L-0026, L-0089)
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — fraza wchodzi do
   `KOMENDY.md` w wersji, w której realnie działa, a forma wywołania jest tą, którą uruchomiłeś
   dosłownie. Komendę wklejaną do dokumentu odpalasz z tej samej powłoki, którą zobaczy czytelnik:
   znak interpretowany przez powłokę zapisujesz tak, żeby nie musiała go tknąć. (L-0002, L-0022,
   L-0059)
3. **Test „czegoś nie wolno" wymaga dowodu negatywnego:** pokaż, że chroniony fragment ma nadal
   pierwotne brzmienie, nie tylko że nowy wpis powstał. (L-0007)
4. **Dowodzisz efektem, nie zdarzeniem:** stanem pliku, sumą kontrolną, treścią odpowiedzi.
   Kryterium stawiasz na stanie, który kontrolujesz, i na źródle, które artefakt produkuje — nie na
   cudzym strumieniu. Zmianę zachowania pokazujesz **obiema wersjami w jednym przebiegu**,
   a instrument porównawczy implementuje wiernie każdą z nich. **Kryterium stawiasz na poprawności
   wyniku, nie na kierunku liczby, której nie kontrolujesz** — „wartość maleje" wolno napisać
   wyłącznie wtedy, gdy zmiana z definicji ją zmniejsza. **Kryterium sukcesu sprawdzasz na
   materiale, zanim zaczniesz pracę** — policz na wskazanym pliku liczbę, którą ma osiągnąć,
   i porównaj ją z tym, co mechanizm w ogóle kontroluje; kryterium arytmetycznie nieosiągalne
   wraca do człowieka jako aneks, a nie kończy etap jako niedowieziony punkt. (L-0017, L-0018,
   L-0040, L-0051, L-0052, L-0063, L-0069, L-0082)
5. **Instrument pomiarowy sam bywa źródłem fałszu:** wyrażenia regularne trzymaj w pliku, nie
   w `node -e`; scenariusz „konfiguracji nie ma" mierz z podstawionym katalogiem domowym; dokładaj
   przypadek, który **musi** trafić. Zero trafień przy niepustych zbiorach to defekt instrumentu,
   dopóki nie udowodnisz inaczej — porównanie identyfikatora wygenerowanego z zastanym ma obok
   siebie kontrolę „ile zastanych nie znalazło pary". Dzieląc wiersz po separatorze, który da się
   wyescapować, dziel po separatorze **niepoprzedzonym znakiem ucieczki** i sprawdzaj liczbę pól po
   podmianie. **Trafienie zgłoszone na materiale, który dotąd był zdrowy, sprawdzasz najpierw na
   instrumencie**; w łańcuchu podmian zbiór znaków zachowywanych wypisujesz raz, bo znak usunięty
   wcześniej nie wróci później. **Filtr odsiewający „to nie jest przypadek do sprawdzenia" ma
   wyjątek dla linii mówiącej wprost o rzeczy sprawdzanej**, a każdy przypadek graniczny ma własną
   kontrolę na wyjściu — jedna kontrola przechodzi zielono, gdy zniknął przypadek, którego nie
   sprawdza. **Wzorzec identyfikatora pozycji ma obok siebie kontrolę „ile wierszy odrzucono"** —
   realny rejestr trzyma numery, których wzorzec nie przewidział, a odrzucenie jest ciche.
   **Generator identyfikatorów ma kontrolę pozytywną na wszystkich kandydatach, nie na
   pierwszym** — sprawdzasz, czy wygenerowana wartość występuje w tym samym pliku; pierwszy
   element bywa jedynym nielinkowanym i przewraca kontrolę na poprawnym generatorze.
   **Instrument porównujący dwa drzewa odtwarza materiał przed każdym wariantem** i dowodzi na
   końcu, że materiał wyszedł nietknięty — a **wynik wariantu, który ma przeżyć pomiar, wynosisz
   z katalogu odtwarzanego od razu**; plik brany z katalogu kontrolnego przenosisz z porównaniem
   sumy, nie samym `cp`. Wyczerpany limit konta zatrzymuje pomiar i idzie do
   odnogi, nie do adnotacji „sprawdzone inaczej" — ale **niedostępność cudzej usługi sprawdzasz
   ponownie jednym najtańszym wywołaniem**, zanim odpiszesz pomiar jako niewykonalny: lekcja o niej
   niesie datę i jest hipotezą, nie werdyktem. **Datowanie działa w obie strony** — „usługa działała
   wczoraj" też jest hipotezą, więc etap opierający punkt weryfikacji na cudzej usłudze sprawdza ją
   przed rozpoczęciem pracy. **Przebieg, w którym oczekujesz ciszy, jest ważny wyłącznie razem
   z kontrolą pozytywną w tym samym przebiegu** — awaria ładowania modułu wygląda dokładnie jak
   zachowanie domyślne mechanizmu, więc na kontrolę pozytywną patrzysz pierwszą. **Cisza zmierzona
   złym wejściem jest fałszem, nie ciszą** — narzędzie wołane z podstawionym payloadem dostaje
   kontrolę pozytywną **na tym samym wejściu** (odbite pole, nazwa projektu), bo „0 znaków" wygląda
   tak samo przy poprawnej ścieżce i przy rozjechanej. **Kontrolę pozytywną stawiasz na wejściu,
   którego mechanizm naprawdę pilnuje** — wejście z jego własnej listy wyłączeń (ścieżka objęta
   `.gitignore`, rozszerzenie pomijane, tryb wyciszony) daje przebieg zielony niezależnie od tego,
   czy mechanizm żyje; listę wyłączeń czytasz w kodzie, zanim postawisz kontrolę. (L-0032, L-0037,
   L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086, L-0087, L-0088,
   L-0090, L-0091)
6. **Próg jest liczbą, którą ktoś liczy:** kalibruj go na zmierzonych plikach realnych projektów,
   zapisuj w jednostce mechanizmu kontrolnego wraz z komendą sprawdzającą i daj mu **jeden**
   wyzwalacz — wielkości pomocnicze wskazują przyczynę wewnątrz komunikatu, nie wywołują go.
   **Blokadę przeniesioną pod nowy adres mierzysz tak samo:** licz na realnym pliku, ile pozycji
   przechodzi po zmianie — reguła wskazująca „najstarszy element" w mechanizmie idącym od
   najstarszego zatyka go z definicji. **Próg porównuj do wielkości, którą mechanizm kontroluje**
   (część usuwalna), a sygnał o zatkaniu wyzwalaj **różnicą między możliwym a wykonanym**, nie
   zerem wykonanego — warunek „nic nie przeszło" milczy przy „przeszło 2 z 87". (L-0034, L-0049,
   L-0053, L-0060, L-0065)
7. **Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień:** dopasowanie od początku
   komórki, wybór linii po niesionej wartości (nie po kolejności), wartość nierozpoznana znaczy
   cisza. **Rdzeń słowa w języku z diakrytykami łapiesz klasą znaków tego języka, nie `\w`** —
   `\w` bez flagi `u` to `[A-Za-z0-9_]`, więc wzorzec przechodzi na formach bez ogonków i odpada
   na realnym dokumencie; wynik zawyżony jest tak samo podejrzany jak zerowy. **Rdzenia szukasz
   w samym brzmieniu wartości, nie w całej komórce** — za datą stoi proza z tymi samymi słowami,
   więc dopasowanie „gdziekolwiek" wciąga pozycje, które należą do innego mechanizmu.
   **Zamknięta lista ma koszt po drugiej stronie i ten koszt mierzysz:** ile pozycji wygląda dla
   człowieka na rozpoznane, a nie jest; poszerzenie listy jest decyzją człowieka, nie poprawką.
   (L-0025, L-0035, L-0048, L-0066, L-0070, L-0074)
8. **Zachowanie, które ma działać zawsze, mieszka w warstwie obecnej w każdej sesji** —
   `CLAUDE.md` projektu albo hook; skill dokłada procedurę i wyzwala się zawodnie, a komenda
   wywołana wprost go nie ładuje. Sygnał, który ma paść raz, ma jednego właściciela; cisza
   właściciela znaczy „sprawdzone i zgodne". (L-0015, L-0030, L-0036)
9. **Skill nie zakłada dostępu do niczego poza katalogiem roboczym** — ani do katalogu pluginu, ani
   do domowego. Opis zaczynaj od `MUST BE USED`, markera projektu i płaskiej listy fraz; każdy krok
   sięgający dalej ma zapisane wyjście po odmowie dostępu. (L-0009, L-0010, L-0012, L-0023)
10. **Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI**, zachowania mierzysz
    świeżą sesją, a po podbiciu numeru przepuszczasz repo `grep`-em po starym i rozstrzygasz każde
    trafienie — **także w treści komend, skilli i specyfikacji**, dzieląc je na wzmianki
    historyczne i deklaracje stanu docelowego. Kontrola patrząca tylko na manifesty tej różnicy nie
    widzi. **Zachowanie zmienione, ale jeszcze niewydane, mierzysz artefaktem podłożonym lokalnie
    w projekcie kontrolnym** — hook przez `.claude/settings.json`, skill przez `.claude/skills/`
    pod **inną nazwą** niż wersja z pluginu; kolizja nazw znaczy, że nie wiesz, którą treść
    zmierzyłeś. (L-0004, L-0008, L-0020, L-0061, L-0085)
11. **Końce linii są wariantem, nie szczegółem.** Sumy kontrolne porównuj po normalizacji
    CRLF → LF; w regexie nad pojedynczą linią nie zakotwiczaj końca, bo kropka nie obejmuje `\r`
    i wzorzec przestaje trafiać na repozytorium z `core.autocrlf=true`; mechanizm czytający
    strukturę pliku sprawdzaj na **obu** wariantach w jednym przebiegu. Przeniesienie katalogu
    wskazywanego przez cudzy manifest sprawdzaj najpierw **na kopii**, walidatorem tego manifestu.
    **Kolejność wpisów w dokumencie jest takim samym wariantem** — kierunek ustalaj z danych (daty
    w nagłówkach), nie z nawyku wziętego z projektu, w którym mechanizm powstał. **Wariantem jest
    też stan dokumentu wobec własnej specyfikacji** — realny projekt trzyma pozycje, które reguła
    każe usunąć; mechanizm sprawdzaj na dokumencie realnego projektu i odsiewaj takie stany tą samą
    zamkniętą listą brzmień, której używa reszta rdzenia. (L-0033, L-0038, L-0057, L-0062, L-0067)
12. **Guardrail zatrzymujący treść, która sekretem nie jest, to defekt rdzenia** — poprawka wraca
    z dowodem, nigdy jako obejście. Wołaj go przez opakowanie powłoki, żeby brak interpretera
    zamieniał się w blokadę, a nie w ciszę; próbki sekretów składaj w czasie wykonania.
    **Znak cudzysłowu — także backtick — należy do grupy cudzysłowu, nigdy do klasy wartości**,
    inaczej guardrail zatrzymuje zdanie opisujące jego samego. (L-0043, L-0045, L-0046, L-0072)
13. **Cudze narzędzie poznajesz z wydanego builda i z próby**, nie z dokumentacji: payload parsuj
    po zdjęciu BOM i bez założeń o nazwach pól, sesję CLI uruchamiaj z powłoki natywnej, a brak
    sygnału konfrontuj najpierw z **warunkiem milczenia** mechanizmu. (L-0041, L-0042, L-0044,
    L-0047)
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Weryfikację planuj tam,
    gdzie jest wykonalna; po pytaniu sprzątasz sam (martwy link nie jest poprawną wartością
    tymczasową); przy wyprowadzaniu pozycji jednostką inwentarza jest **sprawa**, nie linia.
    Wstawkę kotwicz do elementu, który przeżyje operację, i dowódź **obecności** nowej treści —
    „nic nie zginęło" nie znaczy „wszystko powstało". (L-0005, L-0013, L-0014, L-0050, L-0058)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    Przy zadaniu wizualnym zbierasz najpierw cechy pozytywne i pokazujesz jeden wariant do
    kalibracji. Ostrzeżenie `claude plugin validate` o root `CLAUDE.md` jest świadomym skutkiem
    dogfoodingu — nie „naprawiaj" go. (L-0003, L-0006, L-0016, L-0019, L-0029)

**Wyprowadzone 2026-08-20 do `docs/PULAPKI.md`:** sześć pozycji, które były pułapkami
narzędziowymi, a nie zasadami pracy — `tar` na `PATH` (L-0021), sesja pomiarowa `claude -p`
(L-0024), PowerShell 5.1 i UTF-8 (L-0027), `--allowedTools` przy `acceptEdits` (L-0028),
restart aplikacji po `plugin update` (L-0031), `git worktree` zamiast `git archive | tar`
(L-0039). Obowiązują dalej — czytasz je z rejestru pułapek, na żądanie.

## Zakres etapu

Katalog roboczy tego etapu: .claude/relai/work/ROZWOJ_PO_WYDANIU/E8/. Wszystkie tymczasowe raporty,
manifesty do porównań i wyniki instalacji powstają tam. Projekty lub cache poza repo zaczynają się od
relai-e8- i muszą trafić do wpisu dziennika.

1. Wersja 2.0.0 — podnieś wyłącznie deklaracje stanu docelowego w manifestach, marketplace, README i dokumentacji; wzmianki historyczne zostają historią.
2. Dystrybucja — przygotuj i zweryfikuj GitHub release/tag v2.0.0, marketplace oraz instrukcje instalacji dla Claude Code, Cursor i Codex. Nie publikuj artefaktów bez lokalnej bramki.
3. Dokumentacja — README główne, README adapterów, docs/PRZENOSNOSC.md, docs/STATE.md, docs/DZIENNIK.md, docs/ARTEFAKTY.md i release notes muszą rozdzielać PASS od NOT TESTED.
4. Audit instalacji — z publicznego źródła sprawdź widoczność wersji, manifest, root skills, hooki i integrację D-86; porównaj git status, marker wersji i treść docs/ przed/po.
5. Zamknięcie planu — zamknij E8 i cały plan dopiero po bramce; nie twórz kolejnego promptu etapowego, tylko wykonaj sekwencję zamknięcia planu.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] Manifest/plugin validator, marketplace i codex plugin add relai@relai przechodzą dla 2.0.0.
- [ ] node core/tools/validate-adapters.js, generator skilli, testy instalatorów, testy guardraili, node --check i git diff --check kończą się kodem 0.
- [ ] Każda deklaracja 2.0.0 jest spójna; wzmianki historyczne 1.10.0/1.9.x są rozpoznane i opisane.
- [ ] README i release notes podają działające komendy instalacji trzech adapterów oraz jawne ograniczenia.
- [ ] Publiczny tag/release v2.0.0 wskazuje właściwy commit, nie jest draftem/prerelease i daje się zainstalować z marketplace.
- [ ] Próba dostępnych narzędzi ma dowód negatywny dla treści chronionej i dowód zachowania plików/docs. Brak narzędzia pozostaje NOT TESTED, nie jest przemianowany na PASS.
- [ ] Repozytorium po publikacji ma czysty status; tymczasowe projekty, marketplace i cache testowe są usunięte.
- [ ] Katalog .claude/relai/work/ROZWOJ_PO_WYDANIU/E8/ przeszedł raport clean-work, a liczby przed/po i los artefaktów relai-e8-* są w dzienniku.

## Na koniec (rytuał obowiązkowy — bez tego plan NIE jest ukończony)

1. STATUS.md: E8 → ZREALIZOWANY <data>, plan → ZREALIZOWANY <data>; sekcja bramek i odnogi odświeżone zgodnie ze stanem faktycznym.
2. docs/DZIENNIK.md: wpis końcowy z dowodami, ograniczeniami, release URL i podpisem.
3. docs/STATE.md: wersja, dystrybucja, aktywne ograniczenia i następny krok po planie.
4. README.md i docs/PRZENOSNOSC.md: stan publiczny i lista NOT TESTED zgodne z release.
5. Uruchom sekwencję zamknięcia planu (D-36); nie generuj PROMPT_ETAP_9.
6. Zaproponuj commit i push po przejściu wszystkich dostępnych bramek.

