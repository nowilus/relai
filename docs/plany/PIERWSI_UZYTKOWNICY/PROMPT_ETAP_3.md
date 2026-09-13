# PROMPT_ETAP_3 — Powrót po przerwie, WYNIKI.md i rekomendacja kierunku

Plan: PIERWSI_UZYTKOWNICY • Etap: **E3 z E3** • Wygenerowano: 2026-09-13 (autor: Opus 5, w rytuale „Na koniec" etapu E2) • Wykonawca: **Opus** (linia metryczna `STATUS.md`, D-85)

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **najsilniejszy**, w tym narzędziu:
> **Opus 5** (lista modeli z dnia `2026-09-04`). Jeśli sesja działa na innym modelu — zatrzymaj się
> i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

**To jest ostatni etap planu.** Rytuał „Na koniec" nie generuje kolejnego promptu — zastępuje go
sekwencja zamknięcia planu (D-36), opisana w sekcji „Na koniec".

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia etapu, sekcja niemutowalna |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |
| `docs/plany/PIERWSI_UZYTKOWNICY/PROBY.md` | **stan faktyczny pilotażu** — kto został poproszony, kto próbował, kto milczy; to jest materiał tego etapu |
| `docs/plany/PIERWSI_UZYTKOWNICY/PLAN.html` | sekcja **2** (cele i progi decyzyjne), sekcja **5** (jak podejmujemy decyzję — cztery werdykty), sekcja **6** (zakres i odbiór E3), sekcja **8** (przypadki brzegowe — sześć z dziewięciu dotyczy tego etapu) |
| `docs/plany/PIERWSI_UZYTKOWNICY/STATUS.md` | tabela etapów, **bramki manualne** (dwie otwarte), sekcja „Odnogi" (`OPIS_REPO` otwarta) |
| `docs/plany/PIERWSI_UZYTKOWNICY/ZAPROSZENIE.md` | co dokładnie obiecano uczestnikom — raport nie może mierzyć czegoś innego niż to, o co proszono |
| `docs/plany/PIERWSI_UZYTKOWNICY/DEMO.md` | sekcja d) — czego materiał nie dowodzi; granica wniosków raportu |
| `docs/DZIENNIK.md` | wpis z 2026-09-13 o E2 (co dowieziono, czego nie dało się zmierzyć) + sekcja „Stan otwartych ryzyk" |
| `docs/STATE.md` | sekcje „Nad czym pracujemy teraz", „Co dalej" i „Co blokuje" — granica tego, co wolno napisać w rekomendacji |
| `docs/archiwum/plany/ROZWOJ_PO_WYDANIU/odnogi/OPIS_REPO/ODNOGA.md` | odnoga otwarta; zamknięcie planu wymaga decyzji o niej (D-36, punkt 2) |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Progi są zamrożone razem z planem** (sekcja 2): 3–5 uczestników spoza autora, sygnał pozytywny
  to co najmniej **3 aktywacje i 2 udokumentowane powroty** (SZACUNEK). Zmiana progu po zobaczeniu
  wyników jest **nowym aneksem**, nie korektą raportu. Nie „dopasowujesz" progu do tego, co wyszło.
- **Cztery werdykty są zamknięte** (sekcja 5 planu, przepisane w `PROBY.md`): rozwijamy / poprawiamy
  wejście / wstrzymujemy inwestycję / wynik nierozstrzygający. Piątego nie wymyślasz.
- **Brak uczestników jest wynikiem rekrutacji, nie dowodem braku wartości.** Raport w terminie
  powstaje także przy próbie zerowej i mówi to wprost — to jest zapisane w planie, nie pociecha.
- **Uprzejmość nie jest aktywacją** (ryzyko z sekcji 7). Deklaracja „na pewno użyję" bez wykonanego
  zadania nie podnosi żadnego licznika.
- **Powrót spontaniczny odróżnia się od wywołanego prośbą badacza** (sekcja 5). Dwa różne wyniki,
  dwie różne kolumny.
- **Granica publikacji obowiązuje dalej**: wysyłka, publikacja, zmiana opisu repozytorium na
  GitHubie i `git push` wymagają osobnej, konkretnej dyspozycji Łukasza. Zamknięcie planu nią nie
  jest.
- **Nie zbieramy kodu, sekretów ani pełnych rozmów**; cytat albo nazwa osoby wchodzi do dokumentów
  wyłącznie za jej zgodą (ryzyko z sekcji 7).
- **Poza zakresem planu** (sekcja 2): płatny produkt zespołowy, abonament, nowy interfejs, osobny
  landing page, pełne tłumaczenie dokumentacji, nowe adaptery, rozbudowa orkiestracji i deklaracje
  przewagi kosztowej bez pomiaru. Rekomendacja może je **wymienić jako kierunek**, nigdy zacząć.
- **Rekomendacja jest jedna.** Sekcja 6 planu mówi: „najwyżej jedna rekomendowana poprawa". Lista
  pięciu pomysłów nie jest rekomendacją.
- **Ponowny render materiału demo** (czytelność na telefonie, wejście brandowe zajmujące 3 z 25
  sekund — zmierzone w E2) jest **decyzją tego etapu**, razem z decyzją o trwałym miejscu źródeł
  renderu (Aneks A, ryzyko A2). Rozstrzygasz je, ale samego renderu w tym etapie **nie robisz** —
  to byłby nowy zakres.

## Stan wyjściowy — co realnie zastajesz

Plan ma **dwa z trzech etapów zamknięte**. E1 (2026-09-12) dowiózł materiał demo i poprawiony
początek README; E2 (2026-09-13) dowiózł komplet tekstów zaproszenia, pusty rejestr prób
i odświeżoną kartę odnogi `OPIS_REPO`.

**Publiczna instalacja serwuje 2.1.4** — zmierzone 2026-09-13 w izolowanym `CLAUDE_CONFIG_DIR`
obiema komendami z README: `✔ enabled`, 13 komend, `claude plugin validate` → `✔ Validation passed`,
**6/6** plików cache'u zgodnych sumą z tagiem `v2.1.4` po normalizacji CRLF → LF; kontrola pozytywna
na `v2.1.3` zgłosiła różnicę (FAKT). Marketplace serwuje gałąź `main`, nie obiekt release — więc
uczestnik dostaje HEAD-a, nie tag.

```
docs/plany/PIERWSI_UZYTKOWNICY/
  PLAN.html          # zamrożony 2026-09-12, Aneks A (materiał produkuje agent)
  STATUS.md          # E1, E2 zamknięte; E3 GOTOWY DO STARTU; 2 bramki otwarte; 2 odnogi
  ZAPROSZENIE.md     # cztery bloki (a-d) + tabela pokrycia 27 tez ze źródłami
  PROBY.md           # PUSTY — kontakty 0, próby 0; wiersze PRZYKŁAD do skasowania przy pierwszym realnym wpisie
  DEMO.md            # dokumentacja materiału, sekcja d) = czego nie dowodzi
  ZRODLA.md          # datowane odczyty: Odpalone, GitHub, dokumentacja konkurencji
  zapis/             # 7 zapisów kroków z realnych sesji E1 (materiał źródłowy demo)
docs/zasoby/demo/    # 4 pliki materiału (25 s GIF PL/EN, 60 s MP4 PL/EN) + README katalogu
README.md            # sekcja „Zobacz, jak to działa" z osadzonym GIF-em, sprawdzona na żywej stronie
docs/archiwum/plany/ROZWOJ_PO_WYDANIU/odnogi/OPIS_REPO/ODNOGA.md   # OTWARTA, zakres odświeżony w E2
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** `WYNIKI.md`; obserwacji po przerwie;
rozstrzygnięcia dwóch bramek manualnych i odnogi `OPIS_REPO`; decyzji o ponownym renderze
i o trwałym miejscu źródeł renderu; zamknięcia planu.

**Stan pilotażu na dziś: zero kontaktów, zero prób, zero aktywacji.** To nie jest zaległość E2 —
wysyłka wymaga dyspozycji, której jeszcze nie było. **Pierwszą rzeczą tego etapu jest sprawdzenie,
czy dyspozycja padła i czy `PROBY.md` ma jakiekolwiek dane**; od odpowiedzi zależy kształt całej
reszty. Nie zakładaj, że dane są — i nie zakładaj, że ich nie ma.

**Termin graniczny raportu: 2026-10-03** (21 dni od akceptacji planu, SZACUNEK — sekcja 6). Raport
powstaje w tym terminie niezależnie od liczby prób.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie** (przepisane w całości):

1. **Specyfikacja dokumentu jest kompletna albo martwa:** realny przykład, struktura wypisana
   w treści, zapisana ścieżka „pytam zamiast zmyślać"; wzorzec powtarzalny sprawdzasz na całej
   rodzinie dokumentów. (L-0001, L-0011, L-0026, L-0089)
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — fraza w brzmieniu, które
   realnie działa; komendę wklejaną do dokumentu odpalasz z tej samej powłoki, którą zobaczy
   czytelnik. (L-0002, L-0022, L-0059)
3. **Test „czegoś nie wolno" wymaga dowodu negatywnego:** pokaż, że chroniony fragment ma nadal
   pierwotne brzmienie. (L-0007)
4. **Dowodzisz efektem, nie zdarzeniem:** stanem pliku, sumą kontrolną, treścią odpowiedzi. Kryterium
   sukcesu sprawdzasz na materiale, zanim zaczniesz pracę; kryterium nieosiągalne wraca do człowieka
   jako aneks. (L-0017, L-0018, L-0040, L-0051, L-0052, L-0063, L-0069, L-0082)
5. **Instrument pomiarowy sam bywa źródłem fałszu:** przebieg, w którym oczekujesz ciszy, jest ważny
   wyłącznie razem z kontrolą pozytywną w tym samym przebiegu; cisza zmierzona złym wejściem jest
   fałszem; kontrolę pozytywną stawiasz na wejściu, którego mechanizm naprawdę pilnuje.
   **Porównanie dwóch nieistniejących wejść jest zgodnością** — instrument porównujący pliki
   sprawdza najpierw, czy oba istnieją, bo suma pustego strumienia jest po obu stronach ta sama
   (L-0096). **Agregat po wykrytych elementach bierze tylko elementy tej klasy, którą mierzysz** —
   `min()` po wszystkich pasmach ciemnych pikseli zwraca kreskę, nie wiersz tekstu (L-0097).
   Niedostępność cudzej usługi sprawdzasz ponownie jednym najtańszym wywołaniem — datowanie działa
   w obie strony. (L-0032, L-0037, L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083,
   L-0084, L-0086, L-0087, L-0088, L-0090, L-0091, L-0095, L-0096, L-0097)
6. **Próg jest liczbą, którą ktoś liczy:** kalibruj na realnych plikach, zapisuj w jednostce
   mechanizmu kontrolnego, jeden wyzwalacz. (L-0034, L-0049, L-0053, L-0060, L-0065)
7. **Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień**; rdzeń słowa w języku
   z diakrytykami łapiesz klasą znaków tego języka, nie `\w`. Zamknięta lista ma koszt po drugiej
   stronie i ten koszt mierzysz. (L-0025, L-0035, L-0048, L-0066, L-0070, L-0074)
8. **Zachowanie, które ma działać zawsze, mieszka w warstwie obecnej w każdej sesji.** Sygnał, który
   ma paść raz, ma jednego właściciela. (L-0015, L-0030, L-0036)
9. **Skill nie zakłada dostępu do niczego poza katalogiem roboczym.** (L-0009, L-0010, L-0012, L-0023)
10. **Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI**; po podbiciu numeru
    przepuszczasz repo `grep`-em po starym i rozstrzygasz każde trafienie. (L-0004, L-0008, L-0020,
    L-0061, L-0085)
11. **Końce linii są wariantem, nie szczegółem** — sumy po normalizacji CRLF → LF. (L-0033, L-0038,
    L-0057, L-0062, L-0067)
12. **Guardrail zatrzymujący treść, która sekretem nie jest, to defekt rdzenia.** (L-0043, L-0045,
    L-0046, L-0072)
13. **Cudze narzędzie poznajesz z wydanego builda i z próby**, nie z dokumentacji; gdy nie przyjmuje
    Twojego artefaktu, sięgnij po jego własny walidator albo widok statusu. (L-0041, L-0042, L-0044,
    L-0047, L-0092)
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Jednostką inwentarza jest
    **sprawa**, nie linia; dowódź **obecności** nowej treści. (L-0005, L-0013, L-0014, L-0050, L-0058)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    Kompozycję z tekstem budujesz w warstwie, która liczy układ; dziecko wychodzące poza kontener to
    defekt blokujący. **Materiał wizualny oceniasz w warunkach odbiorcy, nie autora** — obraz
    czytelny na 960 px bywa nieczytelny na 375 px, które daje mu telefon (L-0098). (L-0003, L-0006,
    L-0016, L-0019, L-0029, L-0094, L-0098)

Do tego dwie pułapki dotyczące tego etapu wprost: **L-0075** — grafikę i opis ocenia się na stronie,
która je pokazuje, nie lokalnie; **P-005** — wersję pluginu potwierdzasz treścią plików z cache'u
po `claude plugin update` i restarcie aplikacji, nie komunikatem CLI. Oraz wada narzędzia
sprzątającego: `kasuj` melduje `skasowane` dla ścieżki, której nie ma — **ścieżki podawaj
ukośnikami, a po operacji sprawdzaj stan katalogu, nie komunikat**.

## Zakres etapu

**Katalog roboczy tego etapu: `.claude/relai/work/PIERWSI_UZYTKOWNICY/E3/`.** Wszystko tymczasowe —
notatki z rozmów, robocze wersje raportu, zrzuty stron — powstaje tam. Artefakt, który z natury musi
leżeć **poza** projektem (`%TEMP%`, katalog domowy, cudze repozytorium), wpisujesz do wpisu dziennika
**z nazwy**, a jego nazwę zaczynasz od slugu projektu. Projekt kontrolny dla jakiegokolwiek pomiaru
z drugą sesją zakładasz **poza** `.claude/` (P-014).

1. **Rozpoznanie stanu na wejściu** — zanim cokolwiek napiszesz: czy padła dyspozycja publikacji
   i kontaktów, czy `PROBY.md` ma dane, ilu ludzi poproszono i ile odpowiedzi wróciło. Wynik tego
   rozpoznania decyduje, czy raport opisuje próbę, czy jej brak. **Nie zgadujesz** — pytasz Łukasza
   jednym pytaniem, jeśli plik milczy, a dyspozycja mogła paść poza sesją.
2. **Uzupełnienie `PROBY.md`** o wszystko, co się wydarzyło od zamknięcia E2 — kontakty, odmowy,
   próby, ciszę po tygodniu. Wiersze `PRZYKŁAD` kasujesz przy pierwszym realnym wpisie, nie
   wcześniej. Bilanse pod obiema tabelami przeliczasz.
3. **Obserwacje po przerwie** — dla każdego uczestnika, który doszedł do aktywacji: czy wrócił, czy
   powrót był spontaniczny czy wywołany prośbą, co RelAI odtworzyło i co musiał poprawić. Najpierw
   pytasz o fakty, dopiero potem o ocenę (sekcja 5 planu).
4. **`docs/plany/PIERWSI_UZYTKOWNICY/WYNIKI.md`** — raport pilotażu. Struktura wiążąca:
   (a) **co mierzono i czego nie** — progi z sekcji 2 obok liczb faktycznych, z etykietami FAKT
   i SZACUNEK; (b) **przebieg rekrutacji** — ilu poproszono, ilu odpowiedziało, ilu odmówiło i z
   jakim powodem; (c) **wyniki prób** — per uczestnik, anonimowo, z rozdzieleniem narzędzi;
   (d) **braki danych wypisane wprost** — czego nie wiemy i dlaczego; (e) **werdykt** — jeden
   z czterech z sekcji 5, z uzasadnieniem odwołującym się do liczb, nie do wrażenia;
   (f) **jedna rekomendacja** następnego ruchu.
5. **Dwie decyzje o materiale demo** — do rozstrzygnięcia z Łukaszem, obie zapisane w `WYNIKI.md`
   albo w dzienniku: (a) czy powstaje **nowa wersja materiału pod ekran telefonu** (pomiar E2:
   czytelny tylko tytuł sceny, 12,50 px przy progu 8 px; reszta 3,52–7,42 px) i czy skrócić wejście
   brandowe zajmujące 3 z 25 sekund; (b) **trwałe miejsce źródeł renderu** (Aneks A, ryzyko A2) —
   dziś nie istnieją, odtworzenie opisuje `DEMO.md`.
6. **Git** — commit lokalny. **Push, publikacja i kontakt z odbiorcami wyłącznie po jawnej
   dyspozycji Łukasza.**

**Świadomie odłożone do wpisu w dzienniku:** rotacja dziennika (ponad progiem) i ryzyk zamkniętych,
odświeżenie listy modeli (`/relai-models`), aktualizacja `docs/PRZENOSNOSC.md` sekcji 2.3, naprawa
dwóch wad `work-artifacts.js`, ewentualne przeniesienie plików MP4 z repozytorium do zasobów wydania.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `WYNIKI.md` ma wszystkie sześć części (a–f), a **każda liczba** w częściach (a)–(c) niesie
      etykietę FAKT albo SZACUNEK i wskazuje źródło w `PROBY.md`. Sprawdzone przejściem liczby po
      liczbie, nie na oko.
- [ ] **Werdykt jest jednym z czterech z sekcji 5 planu** i jego uzasadnienie odwołuje się do
      liczb z części (a). **Dowód negatywny:** progi w `PROBY.md` i w sekcji 2 planu mają nadal
      pierwotne brzmienie (`git diff` na obu plikach nie pokazuje zmiany wartości 3–5 / ≥3 / ≥2).
- [ ] **Braki danych są wypisane, nie przemilczane** — część (d) wymienia każdą rzecz, której nie
      udało się zmierzyć, razem z powodem. Raport bez ani jednego braku przy próbie mniejszej niż
      3 uczestników jest podejrzany i wraca do przejrzenia.
- [ ] `PROBY.md` zgadza się z `WYNIKI.md` co do liczb: kontakty, próby, aktywacje, powroty.
      Rozjazd między dwoma dokumentami tego samego pilotażu jest defektem blokującym.
- [ ] Żaden cytat ani żadna nazwa osoby nie weszły do dokumentów bez zapisanej zgody
      (`git grep` po imionach z `PROBY.md`, jeśli jakiekolwiek tam trafiły — a nie powinny).
- [ ] `git grep -nE "sk_(test|live)_|AKIA[0-9A-Z]{16}"` nie zwraca nic w plikach śledzonych poza
      udokumentowanymi wartościami przykładowymi.
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy", w układzie Zrobione / Zweryfikowane — jak
      dokładnie / Świadomie odłożone / Do zrobienia przez człowieka, z podpisem niosącym człon
      użytkownika; `docs/STATE.md` nadpisany w obszarze planu.
- [ ] **Sekwencja zamknięcia planu wykonana w całości** (D-36, dziewięć kroków) — w tym dwa punkty
      blokujące: **obie bramki manualne rozstrzygnięte** i **odnoga `OPIS_REPO` rozstrzygnięta**
      (zamknięta albo przeniesiona do `docs/fixy/`). Dopóki nie są — nigdzie nie stoi zdanie, że
      plan jest zrealizowany.
- [ ] **Katalog roboczy:** `.claude/relai/work/PIERWSI_UZYTKOWNICY/E3/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak", z **liczbami przed
      i po** we wpisie dziennika. Artefakty poza tym katalogiem wypisane z nazwy razem z tym, co się
      z nimi stało.

**Punkty, których w tym etapie zweryfikować się może nie dać** — nazwij je wprost, nie udawaj:
wszystko, co zależy od uczestników. Przy próbie zerowej części (c) nie ma czym wypełnić, a werdykt
brzmi „wynik nierozstrzygający" — i to jest **poprawne zakończenie planu**, nie porażka etapu.
Zamknięcie odnogi `OPIS_REPO` zależy od zmiany na GitHubie, czyli od dyspozycji; jeśli jej nie ma,
odnoga idzie do `docs/fixy/` jako wątek samodzielny i to też jest rozstrzygnięcie.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

**To ostatni etap planu — zamiast generowania `PROMPT_ETAP_4.md` uruchamiasz sekwencję zamknięcia
planu.** Wczytaj skill `relai-planning` (narzędzie Skill) i wykonaj z niego sekcję „Zamknięcie
planu (D-36)", kroki 1–9, w kolejności — nie odtwarzaj jej z pamięci i nie skracaj:

1. **Otwarte bramki manualne** — „Dyspozycja publikacji i kontaktów" oraz „Uczestnicy". Zapytaj
   o każdą: rozstrzygnięta teraz czy świadomie zostawiona otwarta (wtedy przechodzi do `STATE.md`,
   żeby nie zginęła razem z folderem planu w archiwum). **Bez decyzji człowieka plan się nie zamyka.**
2. **Otwarte odnogi** — `OPIS_REPO` ma status `OTWARTA`. Zapytaj: zamknąć teraz czy przenieść do
   `docs/fixy/OPIS_REPO/` jako wątek samodzielny. **Bez decyzji człowieka plan się nie zamyka.**
3. `docs/STATE.md` — obszar planu przechodzi z „w toku" do stanu faktycznego.
4. Wpis zamykający w `docs/DZIENNIK.md` — sekcja „Zrobione" mówi **dowiezione vs plan**.
5. `docs/plany/PIERWSI_UZYTKOWNICY/STATUS.md` — E3 → `ZREALIZOWANY <data>`, status planu →
   `ZREALIZOWANY <data>`, linia w dzienniku wdrożenia, statusy bramek.
6. **Ryzyka** — przejrzyj „Stan otwartych ryzyk": ryzyko „brak kandydatów albo odpowiedzi"
   z sekcji 7 planu dostaje stan faktyczny; A1–A3 z Aneksu A domknij albo przenieś. Lekcje z etapu
   dopisz do `docs/LEKCJE.md` i odśwież „Zasady aktywne" (limit 15 — nowa zasada wchodzi przez
   scalenie).
7. **Archiwum** — przenieś `docs/plany/PIERWSI_UZYTKOWNICY/` do
   `docs/archiwum/plany/PIERWSI_UZYTKOWNICY/`. Przeniesienie, nie kasowanie.
8. `CLAUDE.md` — linia aktywnego planu. **Kiedy kończysz turę, wskazuje istniejący plik albo brzmi
   `Aktywny plan: brak`.** Link do przeniesionego folderu jest błędem.
9. **Podsumowanie** — 3–5 zdań: co dowieziono, czego nie i dlaczego, co czeka na człowieka.

Commit na końcu. Push wyłącznie po dyspozycji Łukasza.

RelAI (Opus 5) + Lukasz
