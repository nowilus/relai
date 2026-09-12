# PROMPT_ETAP_2 — Zaproszenie, odnoga OPIS_REPO i zapis prób spoza autora

Plan: PIERWSI_UZYTKOWNICY • Etap: **E2 z E3** • Wygenerowano: 2026-09-12 (autor: Opus 5, w rytuale „Na koniec" etapu E1) • Wykonawca: **Opus** (linia metryczna `STATUS.md`, D-85)

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **najsilniejszy**, w tym narzędziu:
> **Opus 5** (lista modeli z dnia `2026-09-04`). Jeśli sesja działa na innym modelu — zatrzymaj się
> i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia etapu, sekcja niemutowalna |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |
| `docs/plany/PIERWSI_UZYTKOWNICY/PLAN.html` | sekcja **5** (pilotaż: co zapisujemy, jak decydujemy, granica publikacji), sekcja **6** (zakres i odbiór E2), sekcja **8** (przypadki brzegowe — połowa dotyczy tego etapu), sekcja **9** (decyzje właściciela), sekcja **10** (Aneks A) |
| `docs/plany/PIERWSI_UZYTKOWNICY/STATUS.md` | tabela etapów, bramki manualne, sekcja „Odnogi", dziennik wdrożenia |
| `docs/plany/PIERWSI_UZYTKOWNICY/DEMO.md` | co materiał pokazuje i **czego nie dowodzi** — tekst zaproszenia nie ma prawa obiecać więcej |
| `docs/plany/PIERWSI_UZYTKOWNICY/ZRODLA.md` | stan odczytu `odpalone.pl/p/relai` z 2026-09-12 i treść tamtego wpisu |
| `docs/archiwum/plany/ROZWOJ_PO_WYDANIU/odnogi/OPIS_REPO/ODNOGA.md` | karta odnogi do odświeżenia — jej zakres opisuje RelAI 1.5.x |
| `README.md` | pierwsze pięćdziesiąt linii: co widzi obcy człowiek po wejściu, razem z osadzonym GIF-em |
| `docs/STATE.md` | sekcje „Co dalej" i „Co blokuje" — granica tego, co wolno obiecać |
| `docs/DZIENNIK.md` | wpis z 2026-09-12 o E1 (co zmierzono, co zostało NOT TESTED) + sekcja „Stan otwartych ryzyk" |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Nikogo nie zapraszamy przed wydaniem 2.1.4.** Publiczna instalacja serwuje 2.1.3 z wadą P-013
  (zdublowany kontekst startu, błąd schematu `SessionEnd`). Naprawa jest w repozytorium i czeka na
  tag, push i release — to pozycja „Do zrobienia przez człowieka" z wpisu z 2026-09-12.
- **Granica publikacji** (sekcje 5 i 9 planu): wolno **przygotować** materiały; wysyłka, publikacja,
  zmiana opisu repozytorium na GitHubie i `git push` wymagają **osobnej, konkretnej dyspozycji**
  Łukasza dotyczącej gotowego materiału. Akceptacja planu nią nie jest, zamknięcie E1 też nie.
- **Kanały są zamknięte:** istniejący wpis na Odpalone i własna sieć Łukasza; dodatkowa społeczność
  tylko wtedy, gdy Łukasz już ma do niej dostęp. Bez masowego wysyłania i bez płatnych reklam.
- **Jedna odnoga, nie druga:** E2 korzysta z istniejącej `OPIS_REPO` — odświeżasz jej kartę
  i kryterium, z jawnym śladem zmiany. Nowej odnogi na ten sam temat nie tworzysz.
- **Co zapisujemy o uczestniku** (sekcja 5 planu): anonimowy identyfikator, narzędzie/model/wersja,
  daty prób, etap dotarcia, czas instalacji i wznowienia, potrzebna pomoc, wynik odnalezienia
  decyzji ze źródłem, konkretne korzyści i przeszkody. **Nie zbieramy kodu, sekretów ani pełnych
  rozmów.** Używamy istniejącego kanału feedbacku — bez formularza i bez telemetrii.
- **Pomoc po utknięciu jest dozwolona i zawsze odnotowana**; próby wspomaganej nie liczysz jako
  samodzielnej. Uprzejmość znajomych nie jest aktywacją (ryzyko z sekcji 7).
- **Progi z sekcji 2 są propozycją zaakceptowaną razem z planem:** 3–5 uczestników spoza autora,
  sygnał pozytywny to co najmniej 3 aktywacje i 2 udokumentowane powroty (SZACUNEK). Nie zmieniasz
  ich w trakcie — zmiana progu po zobaczeniu wyników to nowy aneks, nie korekta.
- **Materiał demo jest zamknięty.** Kierunek wizualny, długości cięć i treść napisów są
  rozstrzygnięte w E1 (Aneks A + `DEMO.md`). W tym etapie nie renderujesz nowych wersji; drobna
  korekta napisów mieści się w rezerwie planu i wymaga zdania w dzienniku.
- **Zakres etapu następnego:** obserwacje po przerwie, `WYNIKI.md`, rekomendacja kierunku i decyzja
  o trwałym miejscu źródeł renderu to **E3**. Tu ich nie dotykasz.

## Stan wyjściowy — co realnie zastajesz

E1 zamknięty 2026-09-12. Repozytorium ma **2.1.4** z naprawą P-013 (odnoga HOOKI_KORZEN zamknięta
tego samego dnia), ale **publicznie instalowalne jest 2.1.3** — marketplace serwuje `main`, a nie
obiekt release, więc do wydania 2.1.4 pozostaje tag, push i release (FAKT, 2026-09-12).

Materiał demo istnieje i leży w repozytorium:

```
docs/zasoby/demo/demo-relai-25s-pl.gif   # 4,83 MB, 960x540, 25 s, 10 kl./s — osadzony w README
docs/zasoby/demo/demo-relai-25s-en.gif   # 4,77 MB, ta sama kompozycja z napisami EN
docs/zasoby/demo/demo-relai-60s-pl.mp4   # 7,17 MB, 1920x1080, 60 s, 30 kl./s — na kanały
docs/zasoby/demo/demo-relai-60s-en.mp4   # 7,10 MB, wersja EN
docs/zasoby/demo/README.md               # co tu wchodzi, jakie progi, czego tu nie ma
docs/plany/PIERWSI_UZYTKOWNICY/DEMO.md   # wersje z pomiaru, oba przebiegi, tabela pokrycia, ograniczenia
README.md                                # sekcja „Zobacz, jak to działa" z osadzonym GIF-em PL
docs/plany/PIERWSI_UZYTKOWNICY/ZRODLA.md # datowany odczyt wpisu na Odpalone (udany w E1)
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** tekstu zaproszenia dla Odpalone i dla sieci
Łukasza; rzeczowej odpowiedzi na krytykę; odświeżonej karty odnogi `OPIS_REPO` z kryterium
aktualnego opisu i tematów; pliku, w którym mieszkają zapisy prób uczestników; **weryfikacji, że
osadzony GIF renderuje się na żywym GitHubie** (w E1 jawnie NOT TESTED — wymaga pusha).

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie** (przepisane w całości):

1. **Specyfikacja dokumentu jest kompletna albo martwa:** realny przykład, struktura wypisana
   w treści, zapisana ścieżka „pytam zamiast zmyślać"; wzorzec powtarzalny sprawdzasz na całej
   rodzinie dokumentów. (L-0001, L-0011, L-0026, L-0089)
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — fraza w brzmieniu, które
   realnie działa; komendę wklejaną do dokumentu odpalasz z tej samej powłoki, którą zobaczy
   czytelnik. Dotyczy to również tekstu zaproszenia. (L-0002, L-0022, L-0059)
3. **Test „czegoś nie wolno" wymaga dowodu negatywnego:** pokaż, że chroniony fragment ma nadal
   pierwotne brzmienie. (L-0007)
4. **Dowodzisz efektem, nie zdarzeniem:** stanem pliku, sumą kontrolną, treścią odpowiedzi. Zmianę
   pokazujesz obiema wersjami w jednym przebiegu. Kryterium sukcesu sprawdzasz na materiale, zanim
   zaczniesz pracę; kryterium nieosiągalne wraca do człowieka jako aneks. (L-0017, L-0018, L-0040,
   L-0051, L-0052, L-0063, L-0069, L-0082)
5. **Instrument pomiarowy sam bywa źródłem fałszu:** przebieg, w którym oczekujesz ciszy, jest ważny
   wyłącznie razem z kontrolą pozytywną w tym samym przebiegu. Cisza zmierzona złym wejściem jest
   fałszem. Kontrolę pozytywną stawiasz na wejściu, którego mechanizm naprawdę pilnuje.
   Niedostępność cudzej usługi sprawdzasz ponownie jednym najtańszym wywołaniem — datowanie działa
   w obie strony. **Wniosek o własności cudzego narzędzia, wyprowadzony w czasie, gdy własny
   artefakt był zepsuty, wygasa razem z jego naprawą.** (L-0032, L-0037, L-0054, L-0055, L-0056,
   L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086, L-0087, L-0088, L-0090, L-0091, L-0095)
6. **Próg jest liczbą, którą ktoś liczy:** kalibruj na realnych plikach, zapisuj w jednostce
   mechanizmu kontrolnego, jeden wyzwalacz. (L-0034, L-0049, L-0053, L-0060, L-0065)
7. **Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień**; rdzeń słowa w języku
   z diakrytykami łapiesz klasą znaków tego języka, nie `\w`. Zamknięta lista ma koszt po drugiej
   stronie i ten koszt mierzysz. (L-0025, L-0035, L-0048, L-0066, L-0070, L-0074)
8. **Zachowanie, które ma działać zawsze, mieszka w warstwie obecnej w każdej sesji.** Sygnał, który
   ma paść raz, ma jednego właściciela. (L-0015, L-0030, L-0036)
9. **Skill nie zakłada dostępu do niczego poza katalogiem roboczym.** (L-0009, L-0010, L-0012,
   L-0023)
10. **Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI**; po podbiciu numeru
    przepuszczasz repo `grep`-em po starym i rozstrzygasz każde trafienie. Zachowanie niewydane
    mierzysz artefaktem podłożonym lokalnie pod inną nazwą. (L-0004, L-0008, L-0020, L-0061, L-0085)
11. **Końce linii są wariantem, nie szczegółem** — sumy po normalizacji CRLF → LF; mechanizm
    czytający strukturę pliku sprawdzaj na obu wariantach. (L-0033, L-0038, L-0057, L-0062, L-0067)
12. **Guardrail zatrzymujący treść, która sekretem nie jest, to defekt rdzenia** — poprawka wraca
    z dowodem, nigdy jako obejście. (L-0043, L-0045, L-0046, L-0072)
13. **Cudze narzędzie poznajesz z wydanego builda i z próby**, nie z dokumentacji; gdy nie przyjmuje
    Twojego artefaktu, sięgnij po jego własny walidator albo widok statusu. (L-0041, L-0042, L-0044,
    L-0047, L-0092)
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Weryfikację planuj tam, gdzie
    jest wykonalna; jednostką inwentarza jest **sprawa**, nie linia; dowódź **obecności** nowej
    treści. (L-0005, L-0013, L-0014, L-0050, L-0058)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    Przy zadaniu wizualnym zbierasz najpierw cechy pozytywne i pokazujesz jeden wariant do
    kalibracji. **Kompozycję z tekstem budujesz w warstwie, która liczy układ** — HTML z `grid`/
    `flex`, jednostki kontenera, karty domknięte `overflow`; dziecko wychodzące poza kontener to
    defekt blokujący, a instrument mierzący prostokąty ma kontrolę pozytywną na podłożonym
    przepełnieniu. Ostrzeżenie `claude plugin validate` o root `CLAUDE.md` jest świadomym skutkiem
    dogfoodingu. (L-0003, L-0006, L-0016, L-0019, L-0029, L-0094)

Do tego dwie pułapki, które ten etap dotyczą wprost: **grafikę ocenia się na stronie, która ją
pokazuje** (L-0075) — więc GIF w README sprawdzasz na github.com, nie w lokalnym podglądzie; oraz
**P-005** — wersję pluginu po wydaniu potwierdzasz treścią plików z cache'u po `claude plugin update`
i restarcie aplikacji, nie komunikatem CLI.

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/PIERWSI_UZYTKOWNICY/E2/`.** Wszystko tymczasowe —
warianty tekstów, zrzuty stron, notatki z kontaktów — powstaje tam. Artefakt, który z natury musi
leżeć **poza** projektem (`%TEMP%`, katalog domowy, cudze repozytorium), wpisujesz do wpisu dziennika
**z nazwy**, a jego nazwę zaczynasz od slugu projektu. Projekt kontrolny dla jakiegokolwiek pomiaru
z drugą sesją zakładasz **poza** `.claude/` (P-014).

1. **`docs/plany/PIERWSI_UZYTKOWNICY/ZAPROSZENIE.md`** — komplet materiałów do oceny przez Łukasza,
   w jednym pliku, każdy blok gotowy do wklejenia bez przeredagowania: (a) krótki tekst dla
   **Odpalone** — aktualizacja istniejącego wpisu, z linkiem do materiału demo; (b) tekst dla
   **własnej sieci** Łukasza — krótszy, bezpośredni, z jawnym „szukam 3–5 osób"; (c) **rzeczowa
   odpowiedź na krytykę** z sekcji 3 planu, bez polemiki ad personam; (d) **instrukcja dla
   uczestnika** — dwie komendy instalacji, jedno zadanie do wykonania, jedno pytanie na koniec.
   Każda teza w tekstach ma pokrycie w `docs/STATE.md` albo w `DEMO.md`; obietnicy twardej ochrony
   konfiguracji nie stawiasz (werdykt `ask`, nie `deny`).
2. **`docs/plany/PIERWSI_UZYTKOWNICY/PROBY.md`** — plik na zapisy prób: tabela z kolumnami
   dokładnie z sekcji 5 planu (identyfikator anonimowy, narzędzie/model/wersja, daty prób, etap
   dotarcia, czas instalacji, czas wznowienia, potrzebna pomoc, wynik odnalezienia decyzji ze
   źródłem, korzyści, przeszkody) plus wiersz „odmowa / brak odpowiedzi" jako pełnoprawny wynik.
   Plik powstaje **pusty, z nagłówkiem i regułą wypełniania** — dane wchodzą dopiero z prób.
3. **Odświeżenie odnogi `OPIS_REPO`** —
   `docs/archiwum/plany/ROZWOJ_PO_WYDANIU/odnogi/OPIS_REPO/ODNOGA.md`: zakres i kryteria przepisane
   na stan produktu (2.1.4, trzy adaptery, trzynaście procedur, materiał demo), z **jawnym śladem
   zmiany** — datowana linia „zakres odświeżony w E2 planu PIERWSI_UZYTKOWNICY, poprzednie brzmienie
   dotyczyło 1.5.x". Kryterium domknięcia odnogi: opis i tematy widoczne **na stronie
   repozytorium**, nie w pliku lokalnym. Odnogi **nie zamykasz** — zamknięcie wymaga zmiany na
   GitHubie, czyli dyspozycji.
4. **Weryfikacja materiału na żywym GitHubie** — po pushu (jeśli dyspozycja padnie): GIF renderuje
   się w `README.md` na github.com, nie jest ucięty i nie przekracza rozsądnego czasu wczytania.
   Bez dyspozycji punkt zostaje **jawnie niewykonany**, z zapisanym warunkiem wykonalności.
5. **Zapis wyników kontaktów** — każda wysłana wiadomość i każda odmowa trafia do `PROBY.md`
   w tej samej turze, w której się zdarzyła. Brak odpowiedzi po tygodniu jest wynikiem, nie luką.
6. **Git** — commit lokalny. **Push, publikacja i kontakt z odbiorcami wyłącznie po jawnej
   dyspozycji Łukasza.**

**Świadomie odłożone do wpisu w dzienniku:** rotacja dziennika (ponad progiem) i ryzyk zamkniętych,
odświeżenie listy modeli (`/relai-models`), aktualizacja `docs/PRZENOSNOSC.md` sekcji 2.3, decyzja
o trwałym miejscu źródeł renderu (E3), ewentualne przeniesienie plików MP4 z repozytorium do
zasobów wydania.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `ZAPROSZENIE.md` ma wszystkie cztery bloki (a–d), a **każda teza** w nich wskazuje źródło
      w `docs/STATE.md` albo `DEMO.md` — sprawdzone przejściem tezy po tezie, nie na oko.
- [ ] **Żadna obietnica nie przekracza dowodów:** `git grep -niE "gwarant|nie pozwoli|uniemożliwia"`
      w `ZAPROSZENIE.md` nie zwraca nic, a zdanie o ochronie konfiguracji mówi o pytaniu, nie
      o blokadzie. **Dowód negatywny:** nazwa, tagline i ścieżki grafik w `README.md` mają nadal
      pierwotne brzmienie (`git diff README.md`).
- [ ] **Instrukcja dla uczestnika uruchomiona dosłownie** z powłoki, którą zobaczy czytelnik —
      obie komendy instalacji, w izolowanym `CLAUDE_CONFIG_DIR`, z wynikiem zapisanym. Kontrola
      pozytywna: `claude plugin list` pokazuje wersję **po wydaniu 2.1.4**; jeśli wydania jeszcze
      nie ma, punkt zapisujesz jako niewykonany razem z powodem.
- [ ] `PROBY.md` istnieje, ma komplet kolumn z sekcji 5 planu i wiersz-wzór wypełniony **danymi
      przykładowymi oznaczonymi jako przykład** — żeby kolumny były czytelne przed pierwszą próbą.
- [ ] Karta odnogi `OPIS_REPO` ma datowaną linię o odświeżeniu zakresu, a `git diff` pokazuje, że
      historia karty nie została nadpisana (poprzednie brzmienie zachowane w treści albo w historii
      gita). Status odnogi nadal `OTWARTA`.
- [ ] **Sekcja „Odnogi" w `STATUS.md` planu** wskazuje odnogę `OPIS_REPO` jako zależność E2 —
      albo, jeśli jej tam nie ma, dopisujesz jedną linię; tabeli etapów nie ruszasz.
- [ ] `git grep -nE "sk_(test|live)_|AKIA[0-9A-Z]{16}"` nie zwraca nic w plikach śledzonych poza
      udokumentowanymi wartościami przykładowymi.
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy", w układzie Zrobione / Zweryfikowane — jak
      dokładnie / Świadomie odłożone / Do zrobienia przez człowieka, z podpisem niosącym człon
      użytkownika; `docs/STATE.md` nadpisany w obszarze planu.
- [ ] **Katalog roboczy:** `.claude/relai/work/PIERWSI_UZYTKOWNICY/E2/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak", z **liczbami przed
      i po** we wpisie dziennika. Artefakty poza tym katalogiem wypisane z nazwy razem z tym, co się
      z nimi stało.

**Punkty, których w tym etapie zweryfikować się może nie dać** — nazwij je wprost, nie udawaj:
weryfikacja GIF-a na github.com i jakikolwiek wynik prób uczestników zależą od dyspozycji
właściciela i od tego, czy ktoś się zgłosi. Brak uczestników jest **wynikiem rekrutacji**, nie
dowodem braku wartości (sekcja 5 planu) — i tak wchodzi do raportu.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/PIERWSI_UZYTKOWNICY/STATUS.md`: E2 → `ZREALIZOWANY <data>`, E3 → `GOTOWY DO STARTU`,
   link do `PROMPT_ETAP_3.md` w kolumnie `Prompt`, linia w dzienniku wdrożenia, aktualizacja statusu
   bramek manualnych („Dyspozycja publikacji i kontaktów", „Uczestnicy").
2. `docs/DZIENNIK.md`: wpis wg `SPEC_DZIENNIK.md` na końcu sekcji „Wpisy". Przejrzyj tabelę ryzyk —
   ryzyko „brak kandydatów albo odpowiedzi" z sekcji 7 planu dostaje stan faktyczny. Lekcje z etapu
   dopisz do `docs/LEKCJE.md` i odśwież „Zasady aktywne" (limit 15 — nowa zasada wchodzi przez
   scalenie).
3. `docs/STATE.md` — obszar planu i stan materiału demo (czy jest już publiczny).
4. **Wygeneruj `PROMPT_ETAP_3.md`** ze specyfikacji promptu etapowego
   (`.claude/relai/templates/SPEC_PROMPT_ETAPU.md` — otwórz i przeczytaj), na bazie sekcji 5 i 6
   `PLAN.html` opisujących E3 (powrót po przerwie, `WYNIKI.md`, rekomendacja kierunku), realnego
   stanu po tym etapie i lekcji z tego etapu.
5. Commit. Push wyłącznie po dyspozycji Łukasza.

RelAI (Opus 5) + Lukasz
