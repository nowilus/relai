# SPEC — `docs/plany/<TEMAT>/STATUS.md`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Wygeneruj `STATUS.md` **w języku projektu**
(nazwa pliku stała: `STATUS.md`, obok `PLAN.md` w folderze planu).

## Rola

Jedyne miejsce, w którym widać **postęp** planu. `PLAN.md` mówi, co ma powstać, i jest zamrożony;
`STATUS.md` mówi, co już powstało, i zmienia się przy każdym etapie. Rozdzielenie tych dwóch rzeczy
jest tym, co pozwala zamrozić plan bez blokowania pracy.

Drugie zadanie: `STATUS.md` jest **celem linku „Aktywny plan"** z `CLAUDE.md` (D-30) i punktem,
od którego zaczyna czytanie agent wchodzący w plan w świeżej sesji.

## Odbiorca

Agent w kolejnej sesji (pierwszy) i człowiek sprawdzający „gdzie jesteśmy z tym planem".

## Struktura pliku

1. **Nagłówek** — `# STATUS — plan <TEMAT>`.
2. **Linia metryczna** — w jednej linii, oddzielone `·`:
   - link do `PLAN.md`,
   - data utworzenia planu,
   - **status planu** (lista niżej),
   - **model wykonawczy etapów** — dosłownie tak, jak odpowiedział użytkownik przy pytaniu
     startowym (D-39); „Opus" albo „złożone etapy: Opus, mechaniczne: Haiku" — nie normalizujesz.
3. **Tabela etapów** — `Etap | Nazwa | Status | Prompt | Uwagi`.
4. **Odnogi** — sekcja opcjonalna, patrz niżej. Nie ma odnóg → nie ma sekcji.
5. **Dziennik wdrożenia** — lista dopisywana **na końcu**, jedna linia na zdarzenie:
   `- RRRR-MM-DD — <co się stało>`. Kształt i jedyny wyjątek od append-only: sekcja niżej.

## Statusy

**Statusy planu** (linia metryczna):

| Status | Kiedy |
|---|---|
| `DO AKCEPTACJI` | plan wygenerowany, czeka na człowieka |
| `ZAAKCEPTOWANY <data>` | zgoda padła — plan zamrożony, etapy mogą ruszać |
| `WSTRZYMANY <data> — <powód>` | praca przerwana, plan nadal obowiązuje |
| `ZREALIZOWANY <data>` | wszystkie etapy domknięte, plan zamknięty i zarchiwizowany |
| `CZĘŚCIOWO ZREALIZOWANY <data> — <powód>` | odchylenie fundamentalne; obok istnieje nowy plan z linkiem do tego (D-33) |

**Statusy etapu** (kolumna `Status`):

| Status | Znaczenie |
|---|---|
| `OCZEKUJE` | etap przed kolejką |
| `GOTOWY DO STARTU` | poprzedni etap zamknięty; ten można uruchomić w świeżej sesji |
| `W TOKU` | etap zaczęty i nieukończony (sesja przerwana) |
| `ZREALIZOWANY <data>` | etap zamknięty rytuałem „Na koniec" |
| `POMINIĘTY — <powód>` | etap świadomie porzucony; powód obowiązkowy |

Dokładnie **jeden** etap może mieć status `GOTOWY DO STARTU`. Jeśli po zamknięciu etapu nie ustawisz
następnego, plan wygląda na skończony, choć nie jest.

## Kolumna `Prompt`

Zawiera **link do `PROMPT_ETAP_N.md`** — samowystarczalnego promptu etapowego, wg
`SPEC_PROMPT_ETAPU.md` (D-34). Link pojawia się w chwili, w której prompt realnie powstaje, bo
generacja jest lazy:

| Etap | Zawartość kolumny |
|---|---|
| Etap z gotowym promptem (`GOTOWY DO STARTU`, `W TOKU`, `ZREALIZOWANY`) | link `[PROMPT_ETAP_N.md](PROMPT_ETAP_N.md)` |
| Etap `OCZEKUJE` — prompt jeszcze nie istnieje | `—` |

**Nie wstawiasz linku do pliku, którego nie ma.** Link do nieistniejącego promptu jest gorszy niż
`—`: siatka bezpieczeństwa z `relai-core` rozpoznaje po nim lukę i zaproponuje dogenerowanie, więc
fałszywy link wyłącza jedyny mechanizm, który tę lukę wyłapuje.

Odwrotnie też: etap `GOTOWY DO STARTU` z `—` w tej kolumnie to sygnał, że rytuał „Na koniec"
poprzedniego etapu został przerwany.

## Sekcja „Odnogi"

Odnoga to boczny wątek, który urodził się w trakcie etapu i nie mieści się w jego zakresie
(`SPEC_ODNOGA.md`). Mieszka we własnym folderze `odnogi/<NAZWA>/`; w `STATUS.md` zostawia **jedną
linię** — tyle, żeby nie zginęła, i nie więcej, bo cel i zakres są w jej karcie.

Miejsce: **zaraz po tabeli etapów, przed dziennikiem wdrożenia**. Sekcja powstaje razem z pierwszą
odnogą — pustego nagłówka „Odnogi" nie zakładasz na zapas (L-0029).

Format linii:

```
- **<NAZWA>** — <jedno zdanie, czego dotyczy> · źródło: E<N> · [karta](odnogi/<NAZWA>/ODNOGA.md) · **<STATUS>**
```

Statusy odnogi: `OTWARTA` · `ZAMKNIĘTA <data>` · `PRZENIESIONA <data> → docs/fixy/<NAZWA>/`.
Linii odnogi **nie kasujesz** (D-18) — także wtedy, gdy wątek odpuszczono.

Odnoga **nie jest etapem**: nie dostaje wiersza w tabeli etapów, nie ma numeru `EN`, nie wpływa na
to, który etap jest `GOTOWY DO STARTU`.

**Zamknięcie planu wylicza otwarte odnogi i pyta.** Plan z linią `OTWARTA` w tej sekcji nie zamyka
się sam: przed krokiem archiwizacji wypisujesz otwarte odnogi i pytasz o każdą — zamknąć teraz czy
przenieść do `docs/fixy/<NAZWA>/` jako wątek samodzielny. Bez decyzji człowieka plan zostaje
otwarty; folder planu wędrujący do archiwum z żywym wątkiem w środku znaczy, że wątek przepadł.

## Sekcja „Bramki manualne" (od 1.3.0)

Bramka manualna to nierozstrzygnięta pozycja z sekcji **„Do zrobienia przez człowieka"** wpisu
w `docs/DZIENNIK.md` — rzecz, której agent zrobić nie może: decyzja biznesowa, dostęp, zakup,
akceptacja. Dziennik ją zapisuje, ale nikt jej stamtąd nie wyławia: plan potrafi wyglądać na
skończony przy kilkunastu pozycjach czekających w historii (PolyFlow, retrospektywa 2026-08-12,
`FAKT`).

Miejsce: **po sekcji „Odnogi", przed dziennikiem wdrożenia**. Sekcja powstaje z pierwszą bramką —
pustego nagłówka nie zakładasz (L-0029). Ostatnia bramka rozstrzygnięta → sekcja zostaje
z pozycjami oznaczonymi jako rozstrzygnięte; nie kasujesz jej (D-18).

Format linii:

```
- **<krótka treść>** · źródło: wpis dziennika RRRR-MM-DD (E<N>) · **OTWARTA**
- **<krótka treść>** · źródło: wpis dziennika RRRR-MM-DD (E<N>) · ROZSTRZYGNIĘTA RRRR-MM-DD — <jak>
```

Zasady:

- **Otwarta znaczy: bez dopiska o rozstrzygnięciu.** Rozpoznajesz go po słowie `rozstrzygnięte`,
  `zrobione` albo `wykonane` z datą (`SPEC_DZIENNIK.md`, sekcja „Do zrobienia przez człowieka").
  Brak któregokolwiek z nich → pozycja jest otwarta, także gdy z treści zdaje się wynikać, że temat
  odpadł. Mechanizm nie zgaduje intencji (L-0025).
- **Źródłem jest dziennik, nie ta sekcja.** Tutaj stoi skrót i odsyłacz; treść, kontekst i data
  mieszkają we wpisie. Rozstrzygnięcie zapisujesz w **obu** miejscach: adnotacja
  „*(rozstrzygnięte RRRR-MM-DD — …)*" przy pozycji we wpisie **i** zmiana statusu tutaj.
- **Odświeżasz przy zamykaniu etapu**, w rytuale „Na koniec": wpis etapu właśnie powstał, więc
  pozycje „Do zrobienia przez człowieka" z niego trafiają tu w tej samej turze.
- **Bramka nie blokuje etapu.** Blokuje wyłącznie **zamknięcie planu**: sekwencja D-36 wylicza
  pozycje `OTWARTA` i pyta o każdą, tak jak pyta o otwarte odnogi. Bez decyzji człowieka plan
  zostaje otwarty.
- Bramka to nie ryzyko i nie odnoga: ryzyko może się nie zdarzyć, odnoga to praca dla agenta,
  a bramka czeka **konkretnie na człowieka**.

## Dziennik wdrożenia — jedna linia na etap (od 1.6.0)

Ta lista mówi **kiedy co się wydarzyło z planem**. Nie mówi, co zrobiono i jak to sprawdzono — od
tego jest wpis w `docs/DZIENNIK.md`, do którego ta linia zawsze prowadzi przez datę.

**Jedna linia na etap. Jedno zdanie w linii.** Zmierzone 2026-08-21 w tym repozytorium `FAKT`: trzy
zamknięte etapy zajmowały tu 22 linie, bo każda linia zamknięcia przepisywała sekcję „Zweryfikowane"
z wpisu dziennika. `STATUS.md` jest czytany przy każdym starcie sesji z aktywnym planem, więc
streszczenie wpisu płaci się dwa razy: raz tu, raz w dzienniku.

Co wchodzi do linii zamknięcia etapu: **co powstało** (najkrócej, jak się da) i **stan po** — nowa
wersja, jeśli się zmieniła, oraz który etap jest teraz gotowy. Co **nie** wchodzi: lista punktów
weryfikacji, liczby z pomiarów, nazwy plików, nazwy lekcji.

**Linia „E<N> rozpoczęty" scala się z linią zamknięcia** — i to jest jedyny wyjątek od zasady
append-only w tym pliku. Powód: ta linia nie jest zdarzeniem historycznym, tylko **znacznikiem
stanu** dla sesji przerwanej w połowie; gdy etap się zamyka, znacznik przestaje cokolwiek znaczyć,
a historia startu i tak stoi w dacie wpisu dziennika. Przebieg jest więc taki:

1. Start etapu → dopisujesz `- RRRR-MM-DD — E<N> rozpoczęty.`
2. Zamknięcie etapu → **zastępujesz tę linię** linią wynikową. Nie dopisujesz drugiej.
3. Sesja przerwana bez zamknięcia → linia zostaje i **to jest jej cała rola**: kolejna sesja widzi,
   że etap ruszył i nie skończył się.

Wyjątek dotyczy **wyłącznie** pary „rozpoczęty → zamknięty" tego samego etapu. Wszystkich innych
linii nie edytujesz i nie kasujesz (D-18): akceptacja planu, aneks, wstrzymanie, pominięcie etapu
i zamknięcie planu zostają na zawsze.

## Polityka aktualizacji

| Kiedy | Co się zmienia |
|---|---|
| Plan zaakceptowany | status planu + linia w dzienniku wdrożenia + pierwszy etap → `GOTOWY DO STARTU` + link do `PROMPT_ETAP_1.md` |
| Etap rozpoczęty (`/relai-stage` po potwierdzeniu) | status etapu → `W TOKU` + linia w dzienniku wdrożenia |
| Etap zamknięty | status etapu → `ZREALIZOWANY <data>`, następny → `GOTOWY DO STARTU` **z linkiem do świeżo wygenerowanego promptu**, linia „E<N> rozpoczęty" **zastąpiona** linią wynikową |
| Sesja etapu przerwana | status etapu → `W TOKU` + linia w dzienniku wdrożenia mówiąca, co zostało |
| Aneks do planu | linia w dzienniku wdrożenia z numerem aneksu; **treść aneksu jest w `PLAN.md`**, nie tutaj |
| Odnoga utworzona (`/relai-branch`) | nowa linia w sekcji „Odnogi" ze statusem `OTWARTA`; sekcja powstaje, jeśli jej nie było. Tabela etapów i dziennik wdrożenia **bez zmian** |
| Odnoga zamknięta | status w jej linii → `ZAMKNIĘTA <data>`; nic poza tym |
| Wpis etapu ma pozycje „Do zrobienia przez człowieka" | linie w sekcji „Bramki manualne" ze statusem `OTWARTA`; sekcja powstaje, jeśli jej nie było |
| Bramka rozstrzygnięta | status w jej linii → `ROZSTRZYGNIĘTA <data> — <jak>`, równolegle z adnotacją przy pozycji we wpisie dziennika |
| Plan zamknięty | status planu → `ZREALIZOWANY <data>`, plik razem z folderem idzie do `docs/archiwum/plany/` — po rozstrzygnięciu otwartych odnóg |

Dziennik wdrożenia jest **append-only z jednym wyjątkiem** — linią „E<N> rozpoczęty", którą
zamknięcie etapu zastępuje (sekcja wyżej). Poza nią dopisujesz na końcu i nie edytujesz starych
linii. Wpis w dzienniku wdrożenia jest krótki (jedna linia, jedno zdanie); szczegóły „co zrobiono
i jak zweryfikowano" mieszkają w `docs/DZIENNIK.md`, nie tutaj.

## Zakazy

- Nie duplikujesz treści planu — żadnych zakresów etapów ani ryzyk; od tego jest `PLAN.md`.
- Nie wpisujesz odnogi do tabeli etapów i nie kasujesz jej linii, gdy wątek odpuszczono.
- Nie prowadzisz tu narracji z pracy — od tego jest `DZIENNIK.md`.
- Nie kasujesz wierszy etapów; etap porzucony dostaje status `POMINIĘTY` z powodem (D-18).
- Nie zostawiasz planu bez etapu `GOTOWY DO STARTU`, jeśli plan trwa.
- Nie wpisujesz modelu wykonawczego „z rekomendacji", jeśli użytkownik odpowiedział inaczej.

## Przykład (projekt polski)

```markdown
# STATUS — plan PLATNOSCI

Plan: [PLAN.md](PLAN.md) · Utworzony: 2026-08-12 · Status planu: **ZAAKCEPTOWANY 2026-08-13
(Aneks A)** · Model wykonawczy etapów: Opus dla E2–E3, Haiku dla reszty (wybór użytkownika)

## Tabela etapów

| Etap | Nazwa | Status | Prompt | Uwagi |
|---|---|---|---|---|
| E1 | Model płatności i statusy | **ZREALIZOWANY 2026-08-14** | [PROMPT_ETAP_1.md](PROMPT_ETAP_1.md) | wygasanie 15 min; test współbieżności przeszedł |
| E2 | Stripe Checkout + webhook | **W TOKU** | [PROMPT_ETAP_2.md](PROMPT_ETAP_2.md) | wymaga kluczy Stripe (sekcja 9 planu) |
| E3 | Faktury PDF i wysyłka | OCZEKUJE | — | zakres zależny od decyzji o księgowości |
| E4 | Panel płatności dla administratora | OCZEKUJE | — | |

## Odnogi

- **PONOWIONE_ZDARZENIA** — log przy powtórzonym zdarzeniu Stripe · źródło: E2 ·
  [karta](odnogi/PONOWIONE_ZDARZENIA/ODNOGA.md) · **OTWARTA**

## Bramki manualne

- **Klucze produkcyjne Stripe od właściciela konta** · źródło: wpis dziennika 2026-08-14 (E1) ·
  **OTWARTA**
- **Zgoda księgowości na format faktury** · źródło: wpis dziennika 2026-08-14 (E1) ·
  ROZSTRZYGNIĘTA 2026-08-15 — format zaakceptowany bez zmian

## Dziennik wdrożenia

- 2026-08-12 — plan utworzony, przekazany do akceptacji.
- 2026-08-13 — plan ZAAKCEPTOWANY z Aneksem A. Wygenerowano PROMPT_ETAP_1.
- 2026-08-14 — **E1 ZREALIZOWANY**: model płatności i statusy; E2 gotowy do startu.
- 2026-08-15 — E2 rozpoczęty.
```

W przykładzie widać trzy zasady naraz. Odnoga zostawiła ślad **wyłącznie** w sekcji „Odnogi" —
dziennik wdrożenia mówi o etapach planu i o niej milczy. Zamknięty E1 ma **jedną** linię: linia
„E1 rozpoczęty" została przez nią zastąpiona, a co dokładnie powstało i jak to sprawdzono, stoi we
wpisie `docs/DZIENNIK.md` z tej samej daty. Otwarty E2 ma linię „rozpoczęty", bo jego sesja jeszcze
trwa — gdyby się urwała, ta linia jest jedynym śladem, że etap ruszył.
