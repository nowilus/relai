# SPEC — `docs/plany/<TEMAT>/PLAN.md`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Wygeneruj `PLAN.md` **w języku projektu**
(nazwa pliku stała: `PLAN.md`, folder `<TEMAT>` w języku projektu — CAPS_SNAKE, bez dat i wersji).

W tej wersji RelAI plany powstają w **Markdown**. Interaktywny szablon HTML (D-32) dochodzi
w kolejnej wersji pluginu — do tego czasu preferencję „HTML" zapisujesz w `USTAWIENIA.md`, ale plan
generujesz w Markdown i mówisz o tym wprost.

## Rola

Dokument, na podstawie którego człowiek podejmuje decyzję „robimy / nie robimy / robimy inaczej",
a agent w kolejnych sesjach wie, co i w jakiej kolejności ma powstać. Plan **nie jest** dokumentacją
rozwiązania — opisuje zamiar, nie stan. Stan jest w `STATE.md`, historia w `DZIENNIK.md`.

## Odbiorca

Człowiek (pierwszy — to on akceptuje) oraz agent wykonujący etapy w kolejnych sesjach. Pisz tak, by
osoba nietechniczna zrozumiała sekcje 1–3 i 6–8 bez dopytywania.

## Zasady nadrzędne

- **Warianty muszą być realne.** Wariant odrzucony bez podanego powodu jest ozdobnikiem —
  usuń go albo napisz, dlaczego przegrał. Zawsze co najmniej dwa warianty; jeden wybrany, oznaczony.
- **Każda liczba ma etykietę** `FAKT` albo `SZACUNEK` (D-63). Bez etykiety liczba jest zgadywanką
  udającą pomiar.
- **Etapy układasz MVP-first** — pierwszy etap ma dać efekt widoczny dla użytkownika, nie „fundament,
  z którego nic jeszcze nie wynika" (D-81).
- **Przypadki brzegowe rozstrzygnięte, nie wymienione.** „Co, jeśli plik nie istnieje?" bez
  odpowiedzi to nie jest przypadek brzegowy, tylko otwarte pytanie — przenieś je do sekcji 8.
- **Podpis neutralny** — RelAI + model + autor z git config, bez persony (D-63).
- Plan po akceptacji jest **zamrożony**; zmiany wyłącznie datowanymi aneksami w sekcji 9 (D-33).

## Struktura sekcji (kolejność obowiązkowa)

| # | Sekcja | Co zawiera |
|---|---|---|
| 1 | **Streszczenie** | 3–6 zdań: problem, proponowane rozwiązanie, koszt (z etykietą), co się zmieni dla użytkownika. Czytane samodzielnie ma wystarczyć do decyzji „czytam dalej czy nie". Plan zastępujący inny plan ma tu link do poprzedniego. |
| 2 | **Cele i nie-cele** | Cele: 3–6 punktów, każdy sprawdzalny (po czym poznamy, że osiągnięty). Nie-cele: co świadomie zostaje poza zakresem — to jest bezpiecznik przeciw rozrostowi. |
| 3 | **Stan wyjściowy** | Co istnieje dzisiaj i jest istotne dla tej pracy. Fakty z repo, nie wrażenia. |
| 4 | **Warianty** | Tabela `Wariant / Na czym polega / Plusy / Minusy / Werdykt`. Werdykt wybranego: **WYBRANY** + jedno zdanie powodu. Werdykt pozostałych: **ODRZUCONY** + jawny powód odrzucenia. |
| 5 | **Rozwiązanie — jak to działa** | Wybrany wariant rozpisany: przebieg, elementy, punkty styku z tym, co już jest. Diagram tekstowy albo ponumerowany przepływ, gdy pomaga. Bez kodu — plan nie jest implementacją. |
| 6 | **Etapy** | Tabela `Etap / Nazwa / Zakres / Szacunek / Efekt widoczny`. Numeracja `E1…EN`. Każdy etap ma **efekt widoczny** sformułowany z perspektywy użytkownika. Szacunek zawsze z etykietą `SZACUNEK`. Pod tabelą jedno zdanie o sumie i kamieniu milowym. |
| 7 | **Ryzyka** | Tabela `# / Ryzyko / Poziom / Mitygacja`. Poziomy: wysoki / średni / niski. Mitygacja konkretna („test X w etapie E3"), nie „uważać". Ryzyka przechodzące do stałego monitorowania trafiają też do tabeli ryzyk w `DZIENNIK.md`. |
| 8 | **Przypadki brzegowe — rozstrzygnięte** | Tabela `Sytuacja / Rozstrzygnięcie`. Każdy wiersz kończy się decyzją, nie pytaniem. |
| 9 | **Do rozstrzygnięcia przez człowieka** | Wyłącznie decyzje, których agent nie ma prawa podjąć: biznesowe, kosztowe, prawne, dostępowe. Każda z jednym zdaniem konsekwencji i terminem, jeśli blokuje etap. Pusto → napisz „—", nie usuwaj sekcji. |
| 10 | **Aneksy** | Do akceptacji pusta, z jednym zdaniem o polityce zamrożenia. Po akceptacji rosną tu datowane aneksy A, B, C… |

Nagłówek pliku (przed sekcją 1): nazwa planu, data utworzenia, status planu, model wykonawczy
etapów, link do `STATUS.md`. Stopka: linia podpisu.

## Polityka aktualizacji

| Kiedy | Co robisz |
|---|---|
| Plan przed akceptacją | edytujesz normalnie — to jeszcze wersja robocza |
| Plan po akceptacji, zmiana szczegółu | **aneks** w sekcji 10; sekcji 1–9 nie ruszasz (D-33) |
| Plan po akceptacji, zmiana celu lub wariantu | odchylenie fundamentalne: status `CZĘŚCIOWO ZREALIZOWANY` + nowy plan z linkiem do tego |
| Postęp etapów | **nie tutaj** — w `STATUS.md` planu |
| Co się wydarzyło i co sprawdzono | **nie tutaj** — w `DZIENNIK.md` |

## Zakazy

- Nie wpisujesz liczby bez etykiety `FAKT` / `SZACUNEK`.
- Nie zostawiasz sekcji „Warianty" z jednym wariantem ani z odrzuceniem bez powodu.
- Nie mieszasz planu ze stanem: „zrobione" nie istnieje w planie, istnieje w `STATUS.md`.
- Nie edytujesz zamrożonych sekcji — nawet „drobnej literówki merytorycznej"; poprawka to aneks.
- Nie wpisujesz sekretów, tokenów ani ścieżek z danymi logowania (D-42).
- Nie tworzysz planu bez `STATUS.md` — plan bez statusu jest ślepy.

## Przykład (projekt polski, plan średniej wielkości)

```markdown
# PLAN — Płatności online w Parkly

Utworzony: 2026-08-12 · Status planu: **DO AKCEPTACJI** · Model wykonawczy etapów: Opus (złożone),
Haiku (mechaniczne) · Status wdrożenia: [STATUS.md](STATUS.md)

## 1. Streszczenie

Firmy korzystające z Parkly rezerwują miejsca parkingowe, ale rozliczają się fakturami wystawianymi
ręcznie raz w miesiącu. Przy 40 klientach (FAKT — stan na 2026-08-12) zajmuje to około 6 godzin
miesięcznie (SZACUNEK) i generuje pomyłki. Plan wprowadza płatności kartą przy rezerwacji przez
Stripe oraz automatyczną fakturę po opłaceniu. Dla użytkownika zmienia się jedno: rezerwacja
kończy się zapłatą, a faktura przychodzi mailem. Koszt wdrożenia: 4 etapy, 6–9 sesji roboczych
(SZACUNEK).

## 2. Cele i nie-cele

**Cele:**
1. Rezerwacja opłacana kartą w tym samym kroku, w którym powstaje (sprawdzalne: rezerwacja bez
   płatności nie może przejść do statusu „potwierdzona").
2. Faktura generowana automatycznie po zaksięgowaniu płatności i wysyłana mailem (sprawdzalne:
   opłacona rezerwacja ma PDF w ciągu 5 minut).
3. Ręczne fakturowanie znika z procesu miesięcznego (sprawdzalne: raport miesięczny nie zawiera
   pozycji „do wystawienia ręcznie").
4. Pełna historia płatności widoczna dla administratora firmy.

**Nie-cele:**
- Zwroty i korekty faktur — proces zostaje ręczny w tej wersji.
- Płatności cykliczne / abonamenty.
- Inne metody płatności niż karta (BLIK, przelew) — do rozważenia po wdrożeniu.

## 3. Stan wyjściowy

- Rezerwacje działają i mają statusy `nowa / potwierdzona / anulowana` (FAKT).
- Nie ma żadnej integracji płatniczej ani modelu `Payment` w bazie (FAKT).
- Faktury powstają w arkuszu prowadzonym przez księgowość, poza systemem (FAKT).
- Aplikacja: Next.js + PostgreSQL, wdrożenie na Vercel; mail przez SMTP (FAKT).

## 4. Warianty

| Wariant | Na czym polega | Plusy | Minusy | Werdykt |
|---|---|---|---|---|
| A. Stripe Checkout | Przekierowanie na hostowaną stronę Stripe, powrót z webhookiem | Najmniej kodu; zgodność PCI po stronie Stripe; gotowe 3D Secure | Użytkownik opuszcza naszą domenę; ograniczona kontrola nad wyglądem | **WYBRANY** — najniższe ryzyko przy danych kartowych, wdrożenie o ~2 sesje krótsze (SZACUNEK) |
| B. Stripe Elements | Formularz karty osadzony w naszej aplikacji | Pełna kontrola nad UI; użytkownik zostaje u nas | Więcej kodu po naszej stronie; szerszy zakres odpowiedzialności PCI SAQ A-EP | **ODRZUCONY** — wygląd nie jest wart poszerzenia zakresu zgodności PCI przy pierwszym wdrożeniu |
| C. Przelewy24 / Tpay | Lokalny operator z BLIK-iem | BLIK popularny w PL; niższa prowizja przy niskich kwotach | Słabsza dokumentacja i biblioteki; brak gotowego wsparcia w naszym stacku | **ODRZUCONY** — brak BLIK-a jest akceptowalny w v1 (klienci to firmy płacące kartą służbową) |

## 5. Rozwiązanie — jak to działa

1. Użytkownik wybiera miejsce i termin → rezerwacja powstaje ze statusem `oczekuje na płatność`
   i czasem ważności 15 minut.
2. Aplikacja tworzy sesję Stripe Checkout i przekierowuje użytkownika.
3. Stripe potwierdza płatność webhookiem `checkout.session.completed`.
4. Webhook przestawia rezerwację na `potwierdzona`, zapisuje `Payment` i uruchamia generowanie
   faktury.
5. Faktura (PDF) trafia mailem do zamawiającego i do kopii księgowości.
6. Brak potwierdzenia w 15 minut → rezerwacja wygasa, miejsce wraca do puli.

Punkty styku z istniejącym kodem: moduł rezerwacji (nowy status), moduł mailowy (nowy szablon),
panel administratora (nowa zakładka „Płatności").

## 6. Etapy

| Etap | Nazwa | Zakres | Szacunek | Efekt widoczny |
|---|---|---|---|---|
| E1 | Model płatności i statusy | Tabela `Payment`, status `oczekuje na płatność`, wygasanie po 15 min | SZACUNEK 1–2 sesje | Rezerwacja bez płatności sama znika z systemu — miejsce nie blokuje się na zawsze |
| E2 | Stripe Checkout + webhook | Sesja płatności, obsługa webhooka, przejście statusów | SZACUNEK 2–3 sesje | Można realnie zapłacić kartą i dostać potwierdzoną rezerwację |
| E3 | Faktury PDF i wysyłka | Generowanie PDF, szablon maila, kopia do księgowości | SZACUNEK 2 sesje | Faktura przychodzi mailem bez udziału człowieka |
| E4 | Panel płatności dla administratora | Lista płatności, filtry, eksport CSV | SZACUNEK 1–2 sesje | Administrator widzi wszystkie płatności bez pytania księgowości |

Suma: SZACUNEK 6–9 sesji roboczych. Kamień milowy „można zapłacić" po E2 (SZACUNEK 3–5 sesji).

## 7. Ryzyka

| # | Ryzyko | Poziom | Mitygacja |
|---|---|---|---|
| 1 | Webhook nie dotrze albo dotrze dwa razy → rezerwacja nieopłacona lub podwójna płatność | wysoki | Idempotencja po `event.id`; test w E2 na powtórzonym webhooku; ręczna procedura pogodzenia w panelu (E4) |
| 2 | Zgodność PCI i przechowywanie danych kartowych | wysoki | Wariant A: dane kartowe nigdy nie trafiają na nasz serwer; w E2 test, że w logach nie ma numeru karty |
| 3 | Faktura z błędnym NIP-em trafi do klienta | średni | Walidacja NIP przy rezerwacji; pierwsze 20 faktur do akceptacji księgowości przed wysyłką |
| 4 | Wygasanie rezerwacji zwolni miejsce już zajęte przez kogoś innego | średni | Blokada miejsca do czasu wygaśnięcia; test współbieżności w E1 |

## 8. Przypadki brzegowe — rozstrzygnięte

| Sytuacja | Rozstrzygnięcie |
|---|---|
| Użytkownik zamyka przeglądarkę w trakcie płatności | Rezerwacja czeka 15 minut, potem wygasa; webhook przychodzący po wygaśnięciu tworzy płatność ze statusem `do zwrotu` i alert dla administratora |
| Płatność częściowo udana (Stripe: `requires_action`) | Rezerwacja zostaje w `oczekuje na płatność` do końca 15 minut; brak osobnego statusu |
| Firma chce fakturę zbiorczą na koniec miesiąca | Poza zakresem v1 — pozostaje przy fakturze per rezerwacja; wpisane jako nie-cel |
| Stripe niedostępny | Rezerwacja nie powstaje, komunikat „płatności chwilowo niedostępne"; brak trybu awaryjnego „zapłacę później" |
| Kwota 0 zł (miejsce bezpłatne dla zarządu) | Pomijamy Stripe, rezerwacja od razu `potwierdzona`, faktura nie powstaje |

## 9. Do rozstrzygnięcia przez człowieka

| Sprawa | Konsekwencja | Termin |
|---|---|---|
| Konto Stripe: firmowe czy nowe dedykowane | Blokuje E2 — bez kluczy nie ma integracji | przed startem E2 |
| Czy faktury wystawia nasz system, czy zewnętrzna księgowość przez API | Zmienia zakres E3 o ~1 sesję (SZACUNEK) | przed startem E3 |
| Prowizja: doliczana klientowi czy wliczona w cenę | Decyzja cenowa, wpływa na komunikat w koszyku | przed startem E2 |

## 10. Aneksy

Po akceptacji sekcje 1–9 są zamrożone. Zmiany wyłącznie tutaj, jako datowane aneksy. Odchylenie
fundamentalne (zmiana celu albo wybranego wariantu) → status CZĘŚCIOWO ZREALIZOWANY i nowy plan
z linkiem do tego dokumentu.

---

RelAI (Opus) + Łukasz · 2026-08-12
```
