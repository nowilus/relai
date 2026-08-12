# PROMPT_ETAP_6 — Pilotaż Cursora w firmie: scenariusz akceptacyjny na cudzym projekcie

Plan: ROZWOJ_PO_WYDANIU • Etap: **E6 z E8** • Wygenerowano: 2026-08-12 (autor: Opus, w rytuale
„Na koniec" etapu E5) • Wykonawca: **Opus** (linia metryczna `STATUS.md`: „Opus — z ustawień
projektu")

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus** (D-85, ustawienie projektu
> „Model wykonawczy etapów"). Jeśli sesja działa na innym modelu — zatrzymaj się i poproś
> użytkownika o przełączenie, zanim cokolwiek zrobisz.

> **Bramka manualna — sprawdź ją jako pierwszą rzecz.** Ten etap wymaga **osoby z zespołu**, która
> poprowadzi swój realny projekt w Cursorze, oraz **jej zgody** na to, żeby tarcia z tej pracy
> wróciły tu jako poprawki. Bez tej osoby etapu nie da się dowieźć w całości. Gdy jej nie ma:
> zatrzymaj się, powiedz o tym wprost i zapytaj użytkownika, czy (a) czekamy, (b) robimy pilotaż
> na projekcie zastępczym prowadzonym przez samego autora — z jawną adnotacją, że to **nie jest**
> scenariusz „ktoś inny niż autor", więc kryterium akceptacyjne planu pozostaje niespełnione,
> czy (c) etap zostaje `POMINIĘTY — <powód>` i przechodzimy do E7. Nie wybieraj sam.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna, rytuał „Na koniec" |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (P1 i P2 zamykają się albo nie zamykają w tym etapie) + wpis z 2026-08-12 o E5: co zmierzono, a czego **nie** |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" (44 pozycje) |
| `docs/PRZENOSNOSC.md` | sekcja 1 (Cursor — rozpoznanie zmierzone) i sekcja 3 (tabela gwarancji): to jest lista obietnic, którą pilotaż ma zweryfikować |
| `adapters/cursor/README.md` | instrukcja instalacji dla człowieka — pilotaż jest jej pierwszym testem na kimś, kto jej nie pisał |
| `adapters/cursor/rules/*.mdc` | trzy reguły zawsze-w-kontekście: to one niosą proces w Cursorze |
| `docs/plany/ROZWOJ_PO_WYDANIU/PLAN.html` | sekcja 6 (zakres E6), sekcja 7 (P1, P2), sekcja 8 (praca naprzemienna, zespół bez Node.js) |
| `docs/USTAWIENIA.md` | preferencje projektu (język warstw, model wykonawczy, rotacja) |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Kryterium akceptacyjne E6 pochodzi z planu i brzmi: „ktoś inny niż autor prowadzi projekt RelAI
  w Cursorze od początku do etapu".** Nie zamieniaj go na łatwiejsze (demo, przejście komend przez
  autora, test na projekcie-atrapie) bez zgody człowieka i bez zapisania, że kryterium zostało
  obniżone.
- **Tabela gwarancji jest uczciwa** (sekcja 5 planu). Tarcie zgłoszone przez osobę z pilotażu jest
  faktem, nie skargą — trafia do dziennika dosłownie, zanim zdecydujesz, czy je naprawiać.
- **Adapter konsumuje rdzeń, nie kopiuje go.** Poprawki z pilotażu wchodzą do `core/` albo do
  `adapters/cursor/`; kopiowanie logiki między adapterami jest zakazane (P4).
- **Warstwą nośną reguł jest reguła zawsze-w-kontekście** (L-0030). Jeśli pilotaż pokaże, że
  zachowanie nie działa, przenosisz je do reguły — nie do skilla i nie do komendy.
- **Zakres poprawek jest ograniczony do tego, co zgłosił pilotaż.** Pomysły własne z tej sesji idą
  do dziennika jako „świadomie odłożone" albo do odnogi — nigdy „przy okazji".
- **Adapter Codexa to E7.** W tym etapie nie powstaje ani jeden jego plik (L-0002).
- Wersja po tym etapie: **1.5.x** (poprawki) albo bez zmiany numeru, jeśli pilotaż nie wymusił
  żadnej zmiany kodu. Numeru nie podbijasz „dla porządku"; podbity numer żyje w miejscach z L-0008.

## Stan wyjściowy — co realnie zastajesz

RelAI **1.5.0** w repozytorium (E5 zamknięty 2026-08-12). Dwa adaptery, wspólny rdzeń.

```
core/                              # rdzen: templates, guardrails, process/, tools/, MANIFEST
adapters/claude-code/              # skille, dziesiec komend, dziesiec hookow
adapters/cursor/                   # rules/*.mdc, hooks/ (secret-scanner + opakowania, session-context),
                                   #   install.js (z --uninstall i --bez-skanu), README.md (PL)
docs/PRZENOSNOSC.md                # sekcja 1 zmierzona, sekcja 3 = tabela gwarancji
```

**Co o adapterze Cursora wiadomo z pomiaru (E5):** reguła `alwaysApply: true` działa w świeżej
sesji bez wyzwalacza; `sessionStart` + `additional_context` dociera do modelu; `preToolUse` niesie
`tool_input.content`, a `permission: deny` realnie blokuje zapis sekretu (z dowodem negatywnym);
komendy `.cursor/commands/*.md` i skille `.cursor/skills/<nazwa>/SKILL.md` wywołują się z nazwy;
`/relai-help` przeszła całą swoją procedurę.

**Czego NIE wiadomo — i po to jest ten etap:**

- wszystkie pomiary E5 przeszły przez **CLI** `cursor-agent`; aplikacja z interfejsem nie była
  sprawdzona ani razu,
- żadna z dziesięciu komend poza `/relai-help` nie przeszła **całej** procedury na żywym projekcie,
- nie wiadomo, czy instrukcja instalacji jest zrozumiała dla kogoś, kto nie zna tego repozytorium,
- nie wiadomo, jak zachowuje się model **inny niż użyty w pomiarze** wobec reguł zawsze-w-kontekście
  (P2), ani czy zapis sekretu zostanie zablokowany w realnej pracy (P1),
- nie wiadomo, czy praca naprzemienna Cursor ↔ Claude Code na jednym projekcie nie rozjeżdża
  dokumentów.

**Bramki manualne planu (do rozstrzygnięcia przez człowieka, nie przez Ciebie):** sekwencja wydania
1.5.0, `claude /login` na konto z limitem, `/relai-update` dla JiraManagera i PolyFlow, instalacja
pre-commita, **osoba z zespołu do pilotażu**. Dwie odnogi (`OPIS_REPO`, `POMIAR_ODNOG`) pozostają
otwarte i nie należą do tego etapu.

## Zakres etapu

1. **Uzgodnienie pilotażu z człowiekiem** — kto prowadzi, jaki projekt, jakim modelem, w aplikacji
   czy w CLI, w jakim terminie. Zapisz to w dzienniku **przed** startem pilotażu; bez tego nie
   wiadomo później, co właściwie zmierzono.
2. **Instalacja u osoby z zespołu wykonana wg `adapters/cursor/README.md`** — instrukcję wykonuje
   ta osoba, nie Ty. Twoja rola: zebrać każde miejsce, w którym instrukcja okazała się niejasna,
   niekompletna albo nieprawdziwa. Każde takie miejsce jest **defektem dokumentu**, nie „pytaniem
   użytkownika".
3. **Scenariusz akceptacyjny na jej realnym projekcie** — minimum:
   a) start sesji i akapit „gdzie jesteśmy",
   b) inicjalizacja albo dołączenie struktury (zależnie od tego, czy projekt ją ma),
   c) **plan** — poproszenie o plan i sprawdzenie, że powstał jako dokument, nie jako odpowiedź
      w czacie,
   d) **etap** — uruchomienie etapu i domknięcie go rytuałem „Na koniec",
   e) **próba zapisu sekretu** (ryzyko P1) — wynik zapisz dosłownie,
   f) **zamknięcie sesji** — wpis do dziennika z podpisem, aktualizacja STATE.
4. **Praca naprzemienna** — ten sam projekt otwarty raz w Cursorze, raz w Claude Code: sprawdź, czy
   dokumenty się nie rozjeżdżają i czy żadne narzędzie nie podbija wersji struktury samo.
5. **Rejestr tarć** — lista wszystkiego, co przeszkadzało, w kolejności zgłoszenia, z jednym
   zdaniem opisu i oceną: defekt adaptera / defekt dokumentu / brak funkcji / świadoma różnica
   narzędzi (wtedy → tabela gwarancji).
6. **Poprawki** — wyłącznie te z rejestru, w kolejności od najbardziej blokujących. Każda poprawka
   ma swój dowód (pomiar albo scenariusz), tak jak wszystko inne w tym projekcie.
7. **Aktualizacja tabeli gwarancji** — pilotaż jest pierwszym miejscem, w którym obietnice z E5
   spotykają rzeczywistość. Wiersz, który się nie potwierdził, poprawiasz; nie tłumaczysz.
8. **Ryzyka P1 i P2** — rozstrzygnij wprost, czy pilotaż je zamyka, obniża, czy zostawia bez
   zmiany. Zamknięcie wymaga dowodu z pilotażu, nie z pomiaru autora.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] W dzienniku jest **zapis uzgodnienia pilotażu** (kto, jaki projekt, model, narzędzie, termin)
      sprzed jego rozpoczęcia oraz **rejestr tarć** z oceną każdej pozycji.
- [ ] Sześć kroków scenariusza akceptacyjnego ma **zapisany wynik każdego**, także tych, które nie
      przeszły. Krok „próba zapisu sekretu" ma wynik dosłowny (zablokowane / przeszło) i informację,
      czy zadziałał hook, czy sama reguła.
- [ ] Praca naprzemienna sprawdzona na jednym projekcie: po sesji w każdym narzędziu `git status`
      i zawartość `docs/` nie pokazują rozjazdu, a marker wersji jest nietknięty przez samo otwarcie.
- [ ] Każda poprawka z pilotażu ma dowód: pomiar realnym procesem (L-0017) albo powtórzony
      scenariusz z tym samym wynikiem.
- [ ] `node core/tools/validate-adapters.js` → kod 0 przy dwóch adapterach; `claude plugin validate
      .claude-plugin/plugin.json` → „Validation passed" z jedynym znanym ostrzeżeniem (L-0003).
- [ ] Adapter Claude Code niezmieniony w zachowaniu — instrument porównawczy z E5 (dwa drzewa,
      jeden przebieg, różnice zamierzone znormalizowane jawnie, L-0040) daje komplet zgodnych
      porównań; przy zmianie w rdzeniu ten punkt jest obowiązkowy, nie opcjonalny.
- [ ] Tabela gwarancji w `docs/PRZENOSNOSC.md` odzwierciedla **wynik pilotażu**, nie plan sprzed
      niego; każdy zmieniony wiersz ma datę.
- [ ] Wpis w `docs/DZIENNIK.md` (komplet czterech sekcji, podpis z członem użytkownika),
      `docs/STATE.md` nadpisany, ryzyka P1 i P2 rozstrzygnięte wprost; `git status --short` bez
      śmieci po testach.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/ROZWOJ_PO_WYDANIU/STATUS.md`: E6 → ZREALIZOWANY (data), E7 → GOTOWY DO STARTU, link
   do `PROMPT_ETAP_7.md` w kolumnie `Prompt`, linia w dzienniku wdrożenia. Sekcję „Bramki manualne"
   odśwież: bramka „osoba z zespołu do pilotażu" powinna zostać **rozstrzygnięta** w tym etapie.
   Sekcji „Odnogi" nie ruszasz, chyba że któraś została domknięta.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), podpis `Autor: RelAI (<model>) + <git config>`.
   Lekcje z pilotażu → `docs/LEKCJE.md` + odświeżone „Zasady aktywne". Tarcia zgłoszone przez osobę
   z zespołu, których nie naprawiono, muszą zostać w dzienniku **z powodem**.
3. `docs/STATE.md` — nadpisz sekcje „Co działa", „Nad czym pracujemy teraz" i liczby.
4. **Wygeneruj `PROMPT_ETAP_7.md`** (adapter Codexa) ze specyfikacji promptu etapowego: na bazie
   sekcji 6 planu (E7), sekcji 2 `docs/PRZENOSNOSC.md`, wniosków z pilotażu i realnego stanu repo.
5. Commit (conventional, EN) — zaproponuj, nie wykonuj bez zgody. Przypomnij człowiekowi sekwencję
   wydania: push → `claude plugin marketplace update relai` → `claude plugin update relai@relai` →
   restart aplikacji (L-0031); dla Cursora — ponowne uruchomienie `adapters/cursor/install.js`
   w projektach, które mają adapter.
