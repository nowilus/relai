# PROMPT_ETAP_6 — Konkurs designu, interaktywny szablon HTML planów i nadpisania lokalne

Plan: BUDOWA_RELAI • Etap: **E6 z E10** • Wygenerowano: 2026-08-07 (autor: Fable, w rytuale „Na koniec" E5) • Wykonawca: **Opus dla generacji propozycji; sesję wyboru i iterację finału prowadzi Fable** (D-85 + wiersz E6 w STATUS.md)

> **Kontrola modelu:** ten etap ma dwie fazy o różnych modelach (D-85). **Pięć propozycji designu
> generuje Opus** — jeśli sesja generująca działa na innym modelu, zatrzymaj się i poproś
> o przełączenie. **Sesję wyboru z użytkownikiem i iterację finalnego szablonu prowadzi Fable** —
> jeśli ta faza trafiła na inny model, zatrzymaj się i poproś o przełączenie. Na starcie powiedz,
> którą fazę wykonujesz i czy model sesji się zgadza.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sekcja niemutowalna, definicja ukończenia |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" + wpis z 2026-08-07 o E5 — co powstało (hooki, provisioning specyfikacji) i jakie decyzje zapadły |
| `docs/LEKCJE.md` | wyłącznie „Zasady aktywne" — osiemnaście zasad; szczególnie 11 (struktura w treści skilla), 16 (ASCII w hookach) i 18 (kryteria weryfikacji) |
| `docs/DECYZJE.md` | grupa „Szablony dokumentów i design": D-60…D-63 — D-61 (konkurs i twarde zakazy) i D-62 (nadpisania lokalne) są sercem tego etapu |
| `docs/plany/BUDOWA_RELAI/PLAN.html` | sekcja 8 (opis E6: pięć skrajnie różnych propozycji na pełnych testowych HTML-ach, wybór 1–2, iteracja, finał z design tokens) |
| `templates/SPEC_PLAN.md` | struktura planu (10 sekcji) — szablon HTML musi renderować dokładnie tę strukturę, nie własną |
| `templates/README.md` | indeks specyfikacji — dojdzie do niego szablon HTML |
| `hooks/session-context.js` | funkcja `provisionTemplates` kopiuje dziś **wyłącznie `*.md`** — szablon HTML wymaga rozszerzenia tej listy (punkt zakresu 5) |
| `docs/USTAWIENIA.md` | preferencja „Interaktywny HTML dla planów głównych" — po tym etapie ma być wreszcie honorowana |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Wybór szablonu przez konkurs** (D-61): pięć **skrajnie różnych** propozycji na pełnych
  testowych HTML-ach (sekcje, tabele, ikony, diagram SVG, wykres, symulator) → człowiek wybiera
  1–2 → iteracja → finał. Nie trzy propozycje, nie makiety-szkice.
- **Zakazy twarde** (D-61): fioletowe gradienty i glow, przesyt emoji, glassmorphism,
  przeanimowanie, generyczne frazy i stocki. Propozycja łamiąca zakaz odpada przed pokazaniem.
- **Nadpisania lokalne** (D-62): przy pierwszym wygenerowaniu planu z szablonu pada pytanie
  o chęć zmiany stylu; zmiana → lokalna kopia szablonu w projekcie; **lokalne ma zawsze
  pierwszeństwo** przed wersją z pluginu.
- **HTML jest dla ludzi, Markdown dla agentów** (D-32): plany główne w HTML (gdy preferencja tak
  mówi), prompty etapowe i `STATUS.md` pozostają w Markdown. Niczego z tego nie przenosisz.
- **Liczby z etykietą FAKT/SZACUNEK, podpisy neutralne** (D-63) — także w wygenerowanych HTML-ach.
- Specyfikacje docierają do sesji przez lokalną kopię `.claude/relai/templates/` utrzymywaną przez
  hook `session-context` (rozstrzygnięcie E5, R8) — szablon HTML dystrybuujesz **tą samą drogą**,
  nie nową.
- Komendy operacyjne (`/relai-backup` itd.) to **E7**; profile projektów — **E8**. Nie buduj ich
  przy okazji, nawet jeśli szablon by na tym zyskał.

## Stan wyjściowy (co realnie zastajesz po E5)

Plugin **RelAI 0.5.0** w repo `github.com/nowilus/relai`, **zainstalowany** (scope `user`).
Po każdej zmianie: push → `claude plugin marketplace update relai` → reinstalacja (L-0004).
Zachowania mierzysz świeżą sesją `claude -p … --output-format stream-json`; dowodem działania
hooka jest efekt na dysku i treść odpowiedzi, nie zdarzenie w transkrypcie (L-0017).

```
.claude-plugin/plugin.json          # 0.5.0, pola skills/commands/hooks
hooks/hooks.json                    # rejestracja 8 hooków (4 zdarzenia)
hooks/*.js                          # 8 hooków; session-context kopiuje templates/*.md
                                    #   do .claude/relai/templates/ projektu (R8 zamknięte)
skills/relai-core/SKILL.md          # rytuały; czyta specyfikacje z .claude/relai/templates/
skills/relai-planning/SKILL.md      # plany; STATUS; prompty etapowe; rytuał „Na koniec"
commands/relai-stage.md             # /relai-stage
templates/SPEC_*.md                 # 11 specyfikacji + templates/README.md
docs/plany/BUDOWA_RELAI/            # ten plan; STATUS.md z E6 GOTOWY DO STARTU
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** żadnego szablonu HTML planów; mechanizmu
nadpisań lokalnych; honorowania preferencji „HTML" z `USTAWIENIA.md` (plany powstają wyłącznie
w Markdown); provisioning kopiuje tylko `*.md`, więc pliki szablonu HTML nie dotarłyby do sesji.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie:**
1. Każda specyfikacja kończy się realnym, kompletnym przykładem (L-0001).
2. Nie obiecuj w dokumentach użytkownika tego, co jeszcze nie działa (L-0002).
3. Ostrzeżenie walidatora o root `CLAUDE.md` jest świadome — nie „naprawiaj" go (L-0003).
4. Plugin zainstalowany; mierz świeżą sesją; po zmianie: push → `marketplace update` → reinstalacja (L-0004).
5. Przenosząc weryfikację dalej, zapisz warunek jej wykonalności tam, gdzie zostanie odczytany (L-0005).
6. Pytanie o preferencję pada raz na projekt — najpierw `USTAWIENIA.md` i warstwa globalna (L-0006).
7. Test zakazu wymaga dowodu negatywnego (L-0007).
8. Po podbiciu wersji `grep` po starym numerze i rozstrzygnięcie każdego trafienia (L-0008).
9. Opis skilla: `MUST BE USED` + marker + płaska lista fraz (L-0009).
10. Skill nie zakłada dostępu do plików spoza katalogu roboczego (L-0010).
11. Wymaganą strukturę wypisz w treści skilla; odsyłacz to życzenie (L-0011).
12. Katalog pluginu jest dla sesji niedostępny; krok obowiązkowy nie może zależeć wyłącznie od niego (L-0012).
13. Zawsze istnieje poprawna wartość tymczasowa — pytanie nie usprawiedliwia martwego linku (L-0013).
14. Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje (L-0014).
15. Komenda wywołana wprost nie ładuje skilla — wczytanie musi być jawne (L-0015).
16. Komunikaty hooków celowo ASCII — bez polskich diakrytyków na stdout/stderr hooków (L-0016).
17. Działanie hooka dowodzisz efektem na dysku i treścią odpowiedzi modelu, nie zdarzeniem
    w `stream-json` (loguje tylko SessionStart); payloady testowe buduj Nodem, nie echem w shellu (L-0017).
18. Kryterium weryfikacji formułuj na stanie, który kontrolujesz, nie na przewidywanym formacie
    wyjścia cudzego narzędzia (L-0018).

## Zakres etapu

1. **Pięć propozycji designu** — `docs/zasoby/design-konkurs/propozycja-1.html` …
   `propozycja-5.html` (folder `docs/zasoby/` powstaje właśnie teraz, D-11). Każda to **pełny
   testowy plan** na tych samych realnych treściach (użyj planu płatności z przykładu
   `SPEC_PLAN.md`): wszystkie 10 sekcji, tabela etapów, rozwijane sekcje, diagram przepływu SVG,
   wykres, **działający symulator** na realnym przykładzie wyliczeń, etykiety FAKT/SZACUNEK.
   Samowystarczalne (zero CDN i zasobów zewnętrznych), responsywne, zgodne z dobrymi praktykami
   UI/UX na 08/2026, skrajnie różne od siebie (nie pięć wariacji jednej palety), wolne od zakazów
   D-61. Generuje **Opus**.
2. **Sesja wyboru** (prowadzi **Fable**, z użytkownikiem): prezentacja pięciu propozycji, wybór
   1–2 (AskUserQuestion), iteracja wg uwag, finał. Wynik sesji odnotowany w `USTAWIENIA.md`
   (wybrany kierunek designu) i w dzienniku wdrożenia planu.
3. **Finalny szablon** — `templates/HTML_PLAN/` : szablon z design tokens (CSS custom properties)
   i komponentami (sekcja, tabela etapów, karta wariantu z werdyktem, tabela ryzyk, diagram,
   symulator) + `templates/SPEC_PLAN_HTML.md` opisująca, jak generować plan HTML z tego szablonu
   (struktura 10 sekcji z `SPEC_PLAN.md`, zasady osadzania treści, zakazy D-61) — z kompletnym
   przykładem (L-0001). Aktualizacja `templates/README.md`.
4. **Mechanizm nadpisania lokalnego (D-62)** opisany w `skills/relai-planning/SKILL.md`: przy
   pierwszym wygenerowaniu planu HTML w projekcie pytanie o zmianę stylu; zmiana → kopia szablonu
   do `.claude/relai/local-templates/` (albo decyzja o innej lokalizacji — uzasadnij w dzienniku)
   z pierwszeństwem przed wersją z pluginu; wpis o nadpisaniu do `docs/USTAWIENIA.md` projektu.
5. **Provisioning**: rozszerz `provisionTemplates` w `hooks/session-context.js` tak, by kopiował
   też pliki szablonu HTML (dziś tylko `*.md`) — inaczej sesja w projekcie użytkownika nie ma
   z czego wygenerować planu HTML (L-0012).
6. **Honorowanie preferencji formatu** w `skills/relai-planning/SKILL.md`: preferencja „HTML"
   z `USTAWIENIA.md` → plan główny w HTML wg `SPEC_PLAN_HTML.md`; Markdown pozostaje dla
   MINIPLAN-ów, `STATUS.md` i promptów etapowych (D-32). Usuń zdania „szablon HTML dochodzi
   w wersji następnej" z obu skilli i `SPEC_KOMENDY.md`.
7. **Wersja 0.6.0** w obu manifestach, README pluginu, `SPEC_KOMENDY.md` (zakres 0.6.0),
   `SPEC_USTAWIENIA.md`, obu skillach i markerze `docs/USTAWIENIA.md` tego repo; po podbiciu
   `grep` po `0.5.0` i rozstrzygnięcie trafień (L-0008).
8. **Git**: commity conventional EN, push na `origin main`; po zmianach pluginu sekwencja
   push → `marketplace update` → reinstalacja przed pomiarami (L-0004).

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] Pięć plików `propozycja-N.html` otwiera się z dysku bez internetu (zero żądań zewnętrznych —
      sprawdź brak `http://`/`https://` w `src=`/`href=` poza kotwicami) i każdy zawiera: 10 sekcji
      planu, diagram SVG, wykres, działający symulator (zmiana wejścia zmienia wynik — sprawdź
      w przeglądarce), etykiety FAKT/SZACUNEK.
- [ ] **Zakazy D-61 (dowód negatywny, L-0007):** w CSS pięciu propozycji nie występują fioletowe
      gradienty ani glow (inspekcja `linear-gradient`/`box-shadow` z kolorami fioletu), brak
      glassmorphism (`backdrop-filter: blur`), a liczba emoji w treści ≤ progu przyjętego
      i zapisanego przed generacją.
- [ ] Wybór użytkownika odnotowany: `USTAWIENIA.md` (kierunek designu) + dziennik wdrożenia planu.
- [ ] Plan testowy wygenerowany finalnym szablonem w świeżej sesji w projekcie testowym (ścieżka
      ze spacją i polskim znakiem) — sesja czyta szablon z `.claude/relai/`, nie z katalogu
      pluginu; preferencja „Markdown" w innym projekcie testowym nadal daje plan w Markdown.
- [ ] Prompty etapowe i `STATUS.md` nadal powstają w Markdown (dowód: wygenerowany prompt
      w projekcie testowym).
- [ ] `claude plugin validate` przechodzi (znane ostrzeżenie L-0003); `details` pokazuje 0.6.0;
      `grep` po `0.5.0` rozstrzygnięty.
- [ ] Wpis w DZIENNIKU na końcu sekcji „Wpisy" z autorem; lekcje z etapu dopisane; foldery
      testowe posprzątane.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/BUDOWA_RELAI/STATUS.md`: E6 → ZREALIZOWANY (data), E7 → GOTOWY DO STARTU z linkiem
   w kolumnie `Prompt`, linie w dzienniku wdrożenia.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie
   odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy". Przejrzyj tabelę ryzyk
   (R5 — czy HTML-e nie puchną; R6 — nadpisania lokalne po D-62). Lekcje → `docs/LEKCJE.md`
   + odświeżony destylat.
3. `CLAUDE.md` (repo): tabela „Stan prac" — aktualizacja.
4. **Wygeneruj `PROMPT_ETAP_7.md`** wg `templates/SPEC_PROMPT_ETAPU.md` (układ dziewięciu
   elementów): na bazie PLAN sekcja 8 (E7 — komendy operacyjne: `/relai-backup` D-43,
   `/relai-audit` D-45, `/relai-changelog`, `/relai-handover`, `/relai-tour` D-27, `/relai-help`
   D-07/Aneks A) + realny stan po E6 + lekcje z tego etapu. Wykonawca wg D-85 (Opus), chyba że
   STATUS mówi inaczej.
5. Commit + push.
