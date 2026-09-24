# STATUS — plan PIERWSI_UZYTKOWNICY

Plan: [PLAN.html](PLAN.html) · Utworzony: 2026-09-12 · Status: **CZĘŚCIOWO ZREALIZOWANY 2026-09-24 — pilotaż nie wystartował (zero wysłanych zaproszeń), a pierwszeństwo dostaje plan [PROWADZENIE_END_TO_END](../../../plany/PROWADZENIE_END_TO_END/STATUS.md); E1 i E2 dowiezione, E3 pominięty** (zamrożony 2026-09-12, D-33) · Model wykonawczy etapów: **Opus** (preferencja z USTAWIENIA.md, D-85)

> **Wstrzymanie nie unieważnia planu.** E3 zostaje `GOTOWY DO STARTU` z gotowym promptem, trzy
> bramki manualne zostają otwarte, a materiały E1 i E2 są kompletne. **Termin graniczny raportu
> 2026-10-03 traci moc** — zegar 21 dni ruszy dopiero przy wznowieniu, bo nie sposób liczyć czasu
> pilotażu, który nie wysłał ani jednego zaproszenia.

Cel: sprawdzić aktywne użycie RelAI przez samodzielnych twórców pracujących z AI w Polsce.
Uzgodniony limit: 2–4 sesje, bez płatnej promocji (FAKT — wywiad 2026-09-12).
Plan proponuje 3 sesje podstawowe i najwyżej 1 rezerwową, około 5–8 h pracy oraz 14–21 dni
kalendarzowych (SZACUNEK). Progi pilotażu są propozycją do akceptacji, nie wynikiem pomiaru.

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Pokaz i wiarygodne wejście | ZREALIZOWANY 2026-09-12 | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | Sprawdzona instalacja, **materiał demo renderowany przez agenta** (Aneks A: 25 s GIF + 60 s MP4, PL/EN), aktualny początek README; bez publikacji |
| E2 | Zaproszenie i próby | ZREALIZOWANY 2026-09-13 | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | Cztery bloki `ZAPROSZENIE.md` z tabelą pokrycia 27 tez, pusty `PROBY.md`, odświeżona karta OPIS_REPO, publiczna instalacja 2.1.4 zmierzona; **nic nie wysłano** — publikacja czeka na dyspozycję |
| E3 | Powrót i decyzja | POMINIĘTY — plan zamknięty 2026-09-24 przed wysyłką zaproszeń; bez uczestników nie ma czego obserwować | [PROMPT_ETAP_3.md](PROMPT_ETAP_3.md) | Obserwacje po przerwie, WYNIKI.md, rekomendacja dalszego kierunku; jawnie także wynik nierozstrzygający. **Ostatni etap** — kończy go sekwencja zamknięcia planu (D-36) |

## Odnogi

| Odnoga | O co chodzi | Etap-źródło | Karta | Status |
|---|---|---|---|---|
| HOOKI_KORZEN | Claude Code ładuje korzeniowy `hooks/` Codeksa obok hooków adaptera: zdublowany kontekst startu i błąd schematu `SessionEnd` | E1 | [karta](odnogi/HOOKI_KORZEN/ODNOGA.md) | **ZAMKNIĘTA 2026-09-12** (2.1.4, P-013; wydane tego samego dnia) |
| OPIS_REPO | Pusty opis i brak tematów na stronie repozytorium — **zależność E2**, odnoga istniejąca, nie nowa | E1 planu ROZWOJ_PO_WYDANIU | [karta](../../../fixy/OPIS_REPO/ODNOGA.md) | **PRZENIESIONA 2026-09-24 → docs/fixy/OPIS_REPO/** · wątek samodzielny; domknięcie nadal wymaga zmiany na GitHubie |

## Zależność od istniejącego wątku

E2 korzysta z otwartej [odnogi OPIS_REPO](../../../fixy/OPIS_REPO/ODNOGA.md) (od 2026-09-24 wątek samodzielny w `docs/fixy/`).
Nie utworzono drugiej odnogi. **Karta odświeżona 2026-09-13 w E2**: zakres i kryteria przepisane na
stan produktu (2.1.4, trzy adaptery), datowana linia śladu zmiany na górze karty, poprzednie
brzmienie zachowane w treści. Odczyt stanu GitHuba powtórzony tego dnia — `description`,
`homepageUrl` i `repositoryTopics` nadal puste. Odnoga **nie została zamknięta ani przeniesiona**:
jej domknięcie wymaga zmiany po stronie GitHuba, czyli dyspozycji.

## Bramki manualne

- ~~**Akceptacja planu**~~ — **ROZSTRZYGNIĘTE 2026-09-12**: Łukasz zaakceptował plan; plan zamrożony,
  PROMPT_ETAP_1.md wygenerowany, E1 gotowy do startu.
- ~~**Dyspozycja publikacji i kontaktów**~~ — **ROZSTRZYGNIĘTA 2026-09-24 — przepada razem z pilotażem** (decyzja Łukasza przy zamknięciu planu; materiały zostają w archiwum do ponownego użycia). Wcześniej: OTWARTA, przechodziła do E3. Materiały są gotowe od
  2026-09-13: cztery bloki w [ZAPROSZENIE.md](ZAPROSZENIE.md), każdy do wklejenia bez
  przeredagowania. Czeka wskazanie kanału i treści oraz zlecenie wysyłki albo publikacja przez
  Łukasza. Nic nie zostało wysłane.
- ~~**Uczestnicy**~~ — **ROZSTRZYGNIĘTA 2026-09-24 — przepada razem z pilotażem** (decyzja Łukasza; bez pilotażu nie ma kogo rekrutować). Wcześniej: OTWARTA, przechodziła do E3. Wskazanie chętnych lub wykorzystanie
  przygotowanego zaproszenia przez Łukasza. Brak kandydatów nie uruchamia bezterminowej rekrutacji;
  raport opisze brak danych. Rejestr czeka pusty: [PROBY.md](PROBY.md).
- ~~**Ponowny render materiału demo pod ekran telefonu**~~ — **ROZSTRZYGNIĘTA 2026-09-24 — przeniesiona do planu PROWADZENIE_END_TO_END** (GIF stoi w README, więc to sprawa onboardingu). Wcześniej: OTWARTA, do rozstrzygnięcia w E3.
  Pomiar E2: na 375 px czytelny jest wyłącznie tytuł sceny (12,50 px przy progu 8 px), treść scen
  schodzi do 3,52–7,42 px; wejście brandowe zajmuje 3 z 25 sekund. Naprawa wymaga nowego renderu,
  a źródła renderu nie istnieją — łączy się z decyzją o ich trwałym miejscu (Aneks A, ryzyko A2).
- ~~**Kalibracja smaku materiału demo**~~ — **ROZSTRZYGNIĘTA 2026-09-12**: Łukasz zaakceptował
  kierunek na jednej klatce kluczowej („Jest OK. Akceptuję"); szczegóły w
  [DEMO.md](DEMO.md), sekcja „Kierunek wizualny".
- ~~**Wydanie 2.1.4**~~ — **ROZSTRZYGNIĘTE 2026-09-12**: tag `v2.1.4` i push na `origin/main`,
  [release](https://github.com/nowilus/relai/releases/tag/v2.1.4) opublikowany, `claude plugin
  update` wykonany (cache 2.1.4, 5/5 plików zgodnych z tagiem). Blokada „nie zapraszamy przed
  wydaniem" zdjęta — E2 może ruszyć po dyspozycji publikacji.

## Dziennik wdrożenia

- 2026-09-12 — ocena krytyki z Odpalone na podstawie tekstu użytkownika, dokumentów repo i oficjalnych
  dokumentacji konkurencji. Wywiad: aktywni użytkownicy i feedback, Polska, samodzielni twórcy,
  mały eksperyment bez płatnej promocji. Utworzono PLAN.html i rejestr źródeł; etapy nie rozpoczęte.
- 2026-09-12 — builder i kontrola struktury PASS: sekcje, znaczniki, ID, odsyłacze, osadzone fonty,
  brak zasobów zewnętrznych, zgodne wskazanie planu. **Podgląd wizualny i interakcje NOT TESTED**:
  polityka narzędzia przeglądarkowego odrzuciła lokalny URL pliku; bez obchodzenia blokady.
- 2026-09-12 — **plan zaakceptowany i zamrożony** (D-33). Wygenerowany `PROMPT_ETAP_1.md` ze
  specyfikacji promptu etapowego, na bazie sekcji 2–9 planu, realnego stanu repozytorium
  (2.1.3 lokalnie, 2.1.2 opublikowane) i pełnej listy zasad aktywnych. E1 → GOTOWY DO STARTU.
- 2026-09-12 — **Aneks A** (sekcja 10 planu): materiał demo produkuje agent, nie nagrywa go człowiek.
  Wywiad dwiema rundami ustalił hybrydę brand + wierny replay, Remotion → 25 s GIF i 60 s MP4,
  bohatera „plan, etapy, świeża sesja etapu", neutralny projekt kontrolny, napisy PL i EN, bez
  dźwięku. Trzy nowe ryzyka (A1–A3), nowa bramka „kalibracja smaku". `PROMPT_ETAP_1.md` poprawiony
  przed startem etapu (prompt niewykonany — poprawka zamiast drugiego aneksu).
- 2026-09-12 — **E1 rozpoczęty**. Bramka „kalibracja smaku" rozstrzygnięta przed startem: kierunek
  wizualny (ciepły papier, zaokrąglone karty w lekkim szkle, Caveat jako akcent, chipy etapów,
  strzałka jako spoiwo między sesjami) zaakceptowany przez Łukasza. Korekta układu zapisana jako
  L-0094; prompt E1 dostał moduł tokenów i instrument kontroli układu.
- 2026-09-12 — **E1 ZREALIZOWANY**. Dowiezione: zmierzona publiczna instalacja (2.1.3, 13 komend,
  `validate` PASS, 6/6 plików zgodnych z tagiem), dwa realne przebiegi w neutralnym projekcie
  kontrolnym, cztery pliki materiału (25 s GIF i 60 s MP4, PL i EN), `DEMO.md` z tabelą pokrycia
  11/11, `docs/zasoby/demo/`, poprawiony początek README z osadzonym GIF-em, datowany odczyt wpisu
  na Odpalone. Po drodze odnoga HOOKI_KORZEN (P-013, 2.1.4) — zamknięta. Niedowiezione jawnie:
  weryfikacja GIF-a na żywym GitHubie (wymaga pusha) i potwierdzenie pojedynczego bloku kontekstu
  w aplikacji (wymaga `plugin update` i restartu). E2 → GOTOWY DO STARTU.
- 2026-09-13 — E2 rozpoczęty.
- 2026-09-13 — **E2 ZREALIZOWANY**. Dowiezione: `ZAPROSZENIE.md` z czterema blokami (Odpalone,
  własna sieć, odpowiedź na krytykę, instrukcja dla uczestnika) i tabelą pokrycia **27/27 tez ze
  wskazanym źródłem**; pusty `PROBY.md` z ośmioma regułami wypełniania, dwiema tabelami i wierszami
  PRZYKŁAD; karta odnogi `OPIS_REPO` przepisana na stan 2.1.4 z datowanym śladem zmiany i zachowanym
  poprzednim brzmieniem; publiczna instalacja zmierzona obiema komendami w izolowanej konfiguracji
  (2.1.4, 13 komend, `validate` PASS, 6/6 plików zgodnych z tagiem); ocena materiału po stronie
  odbiorcy. Niedowiezione, bo zależy od człowieka: żaden kontakt nie został wysłany, `PROBY.md` jest
  pusty. Znalezione po drodze: materiał demo jest **nieczytelny na telefonie** — nowa bramka.
  E3 → GOTOWY DO STARTU.
- 2026-09-14 — **plan WSTRZYMANY**. Pierwszeństwo dostaje nowy plan
  [OPTYMALIZATOR_PROMPTOW](../OPTYMALIZATOR_PROMPTOW/STATUS.md); E3 i trzy bramki manualne
  zostają otwarte, termin graniczny raportu traci moc do czasu wznowienia.
- 2026-09-24 — **plan CZĘŚCIOWO ZREALIZOWANY i zarchiwizowany**. Decyzja Łukasza: pilotaż nie wraca w tej postaci, pierwszeństwo dostaje plan PROWADZENIE_END_TO_END. Bramki publikacji i uczestników przepadają, render demo pod telefon przechodzi do nowego planu, odnoga OPIS_REPO przeniesiona do `docs/fixy/`. E3 POMINIĘTY.

RelAI (GPT-6) + Lukasz
