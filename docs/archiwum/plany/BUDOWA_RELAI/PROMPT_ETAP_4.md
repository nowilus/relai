# PROMPT_ETAP_4 — Prompty etapowe, `/relai-stage`, lazy-generacja i zamknięcie planu

Plan: BUDOWA_RELAI • Etap: **E4 z E10** • Wygenerowano: 2026-08-07 (autor: Opus, w rytuale „Na koniec" E3) • Wykonawca: **Opus**

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus** (decyzja D-85). Jeśli sesja działa na innym modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sekcja niemutowalna, definicja ukończenia |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" + wpis z 2026-08-07 o E3 (co powstało i czego NIE zweryfikowano) |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" — osiem zasad obowiązujących w tym etapie |
| `docs/DECYZJE.md` | grupy: Plany i wykonanie (D-30…D-39), Tożsamość i dystrybucja (D-05, D-07), Interakcja (D-20…D-27) |
| `docs/plany/BUDOWA_RELAI/PLAN.html` | sekcje 3.2 (cykl planowania i wykonania), 5.3 (komendy i frazy), 8 (opis E4), 13 (Aneks A) |
| `skills/relai-planning/SKILL.md` | to jest dokument, który ten etap rozszerza — zamknięcie planu, `STATUS.md`, aneksy |
| `skills/relai-core/SKILL.md` | rytuał startu sesji — tu dochodzi siatka dogenerowująca brakujący prompt |
| `templates/SPEC_STATUS.md` | kolumna `Prompt` czeka na realne linki; `templates/SPEC_KOMENDY.md` — zakres wersji |
| `docs/plany/BUDOWA_RELAI/PROMPT_ETAP_3.md` | **wzorzec formatu** promptu etapowego, który masz sformalizować |
| `docs/USTAWIENIA.md` | preferencje projektu |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- Prompty etapowe są **samowystarczalne**: co przeczytać / decyzje podjęte (nie otwieraj) / zakres / weryfikacja / „Na koniec" (D-34).
- Generacja **LAZY**: `PROMPT_ETAP_1` przy akceptacji planu, `N+1` w rytuale „Na koniec" etapu N. Siatka bezpieczeństwa dogenerowuje brakujący prompt na starcie sesji (D-34).
- `/relai-stage` **bez argumentów**: auto-wykrycie aktywnego planu i następnego etapu, **zawsze** potwierdzenie przed startem; więcej niż jeden aktywny plan → pytanie (D-35).
- Małe mechaniczne etapy: **propozycja subagenta**, nie automatyczne odpalenie (D-35).
- Zamknięcie planu automatyczne wg D-36 — sekwencja jest już opisana w `relai-planning`; ten etap ma ją **wywoływać**, a nie definiować od nowa.
- Komendy po angielsku (D-05); jedynym źródłem prawdy o komendach jest `KOMENDY.md` (D-07).
- Filozofia: wykryj intencję → zapytaj RAZ → zapisz → respektuj (D-22). Komendy są dla rzadkich operacji, nie dla codziennej pracy.
- Hooki (w tym `session-context` pilnujący siatki promptów) to **E5** — w E4 siatka działa wyłącznie jako krok rytuału startu sesji. Szablon HTML planów: E6. Komendy operacyjne: E7. Nie wychodź poza zakres E4.

## Stan wyjściowy (co realnie zastajesz po E3)

Plugin **RelAI 0.3.0** w repo `github.com/nowilus/relai`. **Plugin jest odinstalowany na tej maszynie** i taki zostaje do końca budowy (L-0004) — testy wykonujesz, odtwarzając procedurę ręcznie, i piszesz wprost, czego przez to nie zmierzono.

```
.claude-plugin/{plugin,marketplace}.json   # wersja 0.3.0, zwalidowane
skills/relai-core/SKILL.md                 # stany folderu, init (8 dokumentów), tryb gościa,
                                           #   rytuał startu sesji, definicja ukończenia,
                                           #   reakcja na korektę, zamknięcie sesji, 3 frazy,
                                           #   ustawienia globalne, podział ról z relai-planning
skills/relai-planning/SKILL.md             # wykrycie intencji planowania, próg PLAN/MINIPLAN,
                                           #   jedno pytanie (rodzaj/format/model), generacja planu,
                                           #   zamrożenie + aneksy, odchylenie fundamentalne,
                                           #   zamknięcie planu (7 kroków), wiele planów naraz
templates/README.md                        # indeks: 8 specyfikacji init + SPEC_PLAN + SPEC_STATUS
templates/SPEC_PLAN.md                     # 10 sekcji, warianty z powodem odrzucenia, FAKT/SZACUNEK
templates/SPEC_STATUS.md                   # statusy planu i etapu, kolumna Prompt = „—", dziennik wdrożenia
templates/SPEC_DZIENNIK.md                 # + sekcja „Wpis typu MINIPLAN"
templates/SPEC_CLAUDE_MD.md                # linia „Aktywny plan: [<TEMAT>](…/STATUS.md)" albo „brak"
templates/SPEC_KOMENDY.md                  # zakres 0.3.0: komend nadal nie ma, cztery frazy działają
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** sformalizowanego formatu `PROMPT_ETAP_N` jako specyfikacji (istnieje tylko jako wzorzec w plikach tego planu), jakiejkolwiek komendy `/relai-*` — folder `commands/` w pluginie **nie istnieje**, lazy-generacji promptu N+1 opisanej w rytuale „Na koniec", siatki dogenerowującej brakujący prompt na starcie sesji, rekomendacji subagenta, automatycznego wywołania zamknięcia planu po ostatnim etapie.

**Lekcje z E1–E3, które obowiązują w tym etapie** (pełna lista: `docs/LEKCJE.md`, sekcja „Zasady aktywne"):
1. Każda specyfikacja kończy się realnym, kompletnym przykładem (L-0001).
2. Nie obiecuj w dokumentach użytkownika tego, co jeszcze nie działa — `KOMENDY.md` rośnie dopiero wtedy, gdy fraza lub komenda realnie działa (L-0002).
3. Ostrzeżenie walidatora o root `CLAUDE.md` jest świadome — nie „naprawiaj" go (L-0003).
4. Plugin zostaje odinstalowany do końca budowy; testy ręczne, z jawnym zapisem, czego nie zmierzono (L-0004).
5. Przenosząc weryfikację do późniejszego etapu, zapisz warunek jej wykonalności tam, gdzie zostanie odczytany (L-0005).
6. Pytanie o preferencję pada raz na projekt — najpierw `USTAWIENIA.md` i warstwa globalna, dopiero potem pytanie (L-0006).
7. Test zakazu wymaga dowodu negatywnego: pokaż, że chroniony fragment ma nadal pierwotne brzmienie (L-0007).
8. Po podbiciu wersji przepuść repo `grep`-em po starym numerze i rozstrzygnij każde trafienie (L-0008).

## Zakres etapu

1. **Specyfikacja `templates/SPEC_PROMPT_ETAPU.md`** — format `PROMPT_ETAP_N.md` jako dokument agentowy (Markdown, D-32): nagłówek z planem, numerem etapu, datą, autorem i **wykonawcą** (model z `STATUS.md`), kontrola modelu, „co przeczytać na start" jako tabela, „decyzje już podjęte — nie otwieraj", „stan wyjściowy" opisujący **realny** stan repo po poprzednim etapie, zakres, sekcja **Weryfikacja** (obowiązkowa zawsze — D-25) i rytuał „Na koniec". Kompletny przykład (L-0001). Wzorzec masz w `PROMPT_ETAP_3.md` — sformalizuj to, co już działa, zamiast wymyślać nowy układ.
2. **Komenda `/relai-stage`** — pierwszy plik w nowym folderze `commands/` pluginu. Zachowanie:
   - bez argumentów: wykryj aktywny plan z `CLAUDE.md`, następny etap ze `STATUS.md` (`GOTOWY DO STARTU`), pokaż **potwierdzenie** (plan, etap, model wykonawczy, czego dotyczy) i czekaj — start bez potwierdzenia jest zakazany (D-35);
   - z argumentem (`/relai-stage E5`, `/relai-stage PLATNOSCI E2`): wariant jawny, ta sama ścieżka potwierdzenia;
   - więcej niż jeden plan nierozstrzygnięty → jedno pytanie, który;
   - brak promptu dla etapu → **dogeneruj go** (punkt 4) i dopiero wtedy potwierdź;
   - etap w statusie `W TOKU` → powiedz, co zostało, i zapytaj: dokończyć czy zacząć od nowa.
3. **Lazy-generacja N+1 w rytuale „Na koniec"** — dopisz do `relai-planning` (albo do specyfikacji promptu, wybierz jedno i uzasadnij w DZIENNIKU) sekwencję zamykającą etap: `STATUS.md` → wpis w `DZIENNIK.md` → **wygenerowanie `PROMPT_ETAP_N+1`** → propozycja commita. Etap bez wygenerowanego następnego promptu **nie jest ukończony** (D-34).
4. **Siatka dogenerowująca** — krok w rytuale startu sesji (`relai-core`): jest aktywny plan, jest etap `GOTOWY DO STARTU`, a jego promptu brak → zaproponuj wygenerowanie i wygeneruj po zgodzie. W tej wersji siatka jest **wyłącznie** krokiem rytuału; hook `session-context` dochodzi w E5 — nie obiecuj go.
5. **Rekomendacja subagenta** (D-35) — kryteria, kiedy etap jest na tyle mechaniczny, że warto go oddać subagentowi: podaj je liczbowo i oznacz jako SZACUNEK. Rekomendacja to zdanie w potwierdzeniu `/relai-stage`, nigdy automatyczne odpalenie.
6. **Automatyczne zamknięcie planu** — po zamknięciu ostatniego etapu `/relai-stage` (i rytuał „Na koniec") uruchamia sekwencję zamknięcia planu z `relai-planning` (D-36). Nie definiuj jej drugi raz — wywołaj istniejącą i sprawdź, czy jest kompletna.
7. **`SPEC_STATUS.md`:** kolumna `Prompt` przestaje być `—` — od tej wersji zawiera link do `PROMPT_ETAP_N.md`. Zaktualizuj zapis i przykład.
8. **`SPEC_KOMENDY.md` (zakres 0.4.0):** pojawia się **pierwsza działająca komenda** — `KOMENDY.md` dostaje wreszcie tabelę komend z jedną pozycją. Sekcja „Komend jeszcze nie ma" znika. Wpisujesz wyłącznie to, co realnie działa (L-0002).
9. **Podbicie wersji do `0.4.0`** w `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, README pluginu, `SPEC_KOMENDY.md`, `SPEC_USTAWIENIA.md` i markerze `docs/USTAWIENIA.md` tego repo. Po podbiciu — `grep` po `0.3.0` i rozstrzygnięcie każdego trafienia (L-0008).
10. **Dogfooding (D-82):** prompty etapowe tego planu powstawały ręcznie. Porównaj `PROMPT_ETAP_1…4` ze świeżą `SPEC_PROMPT_ETAPU.md` i opisz różnice w DZIENNIKU. Nie przepisuj istniejących promptów.
11. **Git:** commity conventional EN (bez stopek atrybucji), push na `origin main`.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `claude plugin validate .claude-plugin/plugin.json` przechodzi (znane ostrzeżenie o root `CLAUDE.md` dopuszczalne); komenda widoczna w strukturze pluginu; wersja `0.4.0` spójna wszędzie, `grep` po `0.3.0` rozstrzygnięty.
- [ ] Test na czystym folderze o ścieżce ze spacją i polskim znakiem: projekt zainicjowany, plan wygenerowany i zaakceptowany → istnieje `PROMPT_ETAP_1.md` wygenerowany **ze specyfikacji**, nie ręcznie.
- [ ] Test potwierdzenia: `/relai-stage` bez argumentów pokazuje plan, etap, model i czeka; **nie** zaczyna pracy bez odpowiedzi. Dowód negatywny (L-0007): w folderze projektu nie przybył żaden plik przed potwierdzeniem.
- [ ] Test lazy-generacji: zamknięcie etapu N tworzy `PROMPT_ETAP_N+1.md`, a `STATUS.md` dostaje link w kolumnie `Prompt` i etap N+1 w statusie `GOTOWY DO STARTU`.
- [ ] Test siatki: usuń `PROMPT_ETAP_N+1.md` i odegraj start sesji → RelAI zauważa brak i proponuje dogenerowanie (bez hooka, samym rytuałem).
- [ ] Test przerwanej sesji: etap ustawiony na `W TOKU` → `/relai-stage` pyta „dokończyć czy od nowa" zamiast startować od zera.
- [ ] Test zamknięcia planu: zamknięcie ostatniego etapu uruchamia sekwencję D-36 — `STATE`, wpis „dowiezione vs plan", status `ZREALIZOWANY`, przeniesienie folderu planu do `docs/archiwum/plany/`, linia „Aktywny plan: brak" w `CLAUDE.md`.
- [ ] Wpis w DZIENNIKU dopisany na **końcu** sekcji „Wpisy", z autorem w nagłówku; sekcja ryzyk pozostaje na górze; `LEKCJE.md` uzupełnione o lekcje z tego etapu i odświeżony destylat.
- [ ] Foldery testowe posprzątane; jeśli test utworzył `~/.claude/relai/`, usuń go (L-0004).

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/BUDOWA_RELAI/STATUS.md`: E4 → ZREALIZOWANY (data), E5 → GOTOWY DO STARTU, wpis w dzienniku wdrożenia. Kolumny `Prompt` uzupełnij linkami, skoro od tej wersji mają je zawierać.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy", autor: RelAI (Opus). Zaktualizuj tabelę ryzyk (R2 nadal otwarte i niemierzone — sprawdź, czy warunek pomiaru w wierszu E10 `STATUS.md` jest nadal aktualny). Dopisz lekcje z etapu do `docs/LEKCJE.md` i odśwież „Zasady aktywne".
3. `CLAUDE.md` (repo): tabela „Stan prac" — aktualizacja.
4. **Wygeneruj `PROMPT_ETAP_5.md`** w tym folderze — tym razem **ze świeżej `SPEC_PROMPT_ETAPU.md`**, jako pierwszy dogfooding własnej specyfikacji. Treść na bazie PLAN sekcja 5.2 i 8 (E5 — osiem hooków Node.js, twardość wg D-41: blokują tylko `secret-scanner` i `config-protection`, konwencja hook-guard z README pluginu, testy na Windows ze ścieżkami ze spacjami i polskimi znakami, sekrety w formatach `sk-`, `ghp-`, `AKIA…`, JWT) + realny stan po E4 + lekcje z tego etapu.
5. Commit + push.
