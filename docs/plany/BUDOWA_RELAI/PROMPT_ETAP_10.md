# PROMPT_ETAP_10 — Pilotaż: scenariusze akceptacyjne, adopcja JiraManagera, wydanie 1.0.0

Plan: BUDOWA_RELAI • Etap: **E10 z E10** • Wygenerowano: 2026-08-09 (autor: Fable, w rytuale „Na koniec" E9) • Wykonawca: **Opus** (D-85, linia metryczna `STATUS.md`)

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus**. Jeśli sesja działa na innym
> modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

> **Charakter etapu.** To etap pomiarowy, nie budowlany: plugin jest funkcjonalnie kompletny
> (D-80: rdzeń + planowanie + hooki + komendy + szablon HTML + profile + adopcja + update).
> Kod i skille zmieniasz wyłącznie wtedy, gdy scenariusz akceptacyjny ujawni defekt — a każdą
> poprawkę mierzysz ponownie. Etap kończy wydanie **1.0.0**.

> **Warunek wykonalności całego etapu:** większość pomiarów wymaga **sesji interaktywnej**
> (AskUserQuestion, potwierdzenia hooków, wybór opcji) — tryb `claude -p` ich nie obsłuży (L-0005,
> L-0024). Sesje interaktywne uruchamia i obsługuje **człowiek**; Ty przygotowujesz dokładne
> polecenia, prompty i listę rzeczy do zaobserwowania, a po każdej sesji odbierasz efekty z dysku.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sekcja niemutowalna, definicja ukończenia etapu |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" (R1, R2, R3, R5, R7 otwarte) + wpis z 2026-08-09 o E9 |
| `docs/LEKCJE.md` | wyłącznie „Zasady aktywne" — dwadzieścia osiem zasad; krytyczne: 4 (sekwencja publikacji), 17 (dowód efektem), 20 (wersja z `installed_plugins.json`), 22 (pełna nazwa komend), 24 (stdin + acceptEdits), 27 (bez PowerShella przy polskich znakach), 28 (`--allowedTools "Bash"` przy narzędziach systemowych) |
| `docs/DECYZJE.md` | grupa „Zakres v1 i budowa" (D-80…D-85) oraz D-83 — cztery scenariusze akceptacyjne |
| `docs/plany/BUDOWA_RELAI/PLAN.html` | sekcja 8, wiersz E10 — zakres i zdanie o widocznym efekcie; sekcja 9 — rola człowieka |
| `docs/plany/BUDOWA_RELAI/STATUS.md` | wiersz E10 — zapisany tam wymóg kontroli R2 w sesji interaktywnej |
| `commands/relai-adopt.md` | sekwencja adopcji, którą będzie przechodził JiraManager — scenariusz 4 |
| `commands/relai-update.md` | krok 4: ścieżka potwierdzenia `config-protection` — w E9 zmierzona tylko blokada headless |
| `templates/SPEC_RAPORT_ADOPCJI.md` | struktura raportu, którą scenariusz 4 ma zastać w adopcji JiraManagera |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Cztery scenariusze akceptacyjne są obowiązkowe** (D-83): (1) pełny cykl nowego projektu,
  (2) przekazanie + tour, (3) backup + restore z testem wykluczenia sekretów, (4) adopcja
  z przetestowanym recovery. Żadnego nie pomijasz i żadnego nie zastępujesz „równoważnym".
- **Pilotaż = nowy mały projekt, potem adopcja JiraManagera** (D-83). Folder JiraManagera wskaże
  użytkownik — nie zgaduj ścieżki i nie adoptuj niczego bez jego jawnego wywołania (D-70).
- **Kontrola R2 w sesji interaktywnej** (STATUS, wiersz E10): auto-wyzwalanie `relai-core`
  i `relai-planning` mierzysz w kilku przebiegach, osobno dla każdego skilla; tryb `-p` nie jest
  dowodem (blokuje AskUserQuestion, a wynik zależy od inwentarza skilli).
- **Zakres v1 zamknięty** (D-80): telemetria, tłumaczenie EN zasobów, wsparcie Cursor/Codex,
  infrastruktura feedbacku i jakiekolwiek GUI są poza v1 — nie dokładasz ich „przy okazji
  wydania".
- **Wersja 1.0.0 dopiero po przejściu wszystkich czterech scenariuszy** — wydanie z niedomkniętym
  scenariuszem nie istnieje; lepiej etap niedokończony (D-70 per analogiam).
- **Granica zakresu:** E10 jest ostatnim etapem planu. Po nim wykonujesz sekwencję **zamknięcia
  planu** (D-36), nie generujesz kolejnego promptu.

## Stan wyjściowy (co realnie zastajesz po E9)

Plugin **RelAI 0.9.0** w repo `github.com/nowilus/relai`, zainstalowany (scope `user`,
`installed_plugins.json`: 0.9.0, sha `720f52f`). Sekwencja publikacji zmian: push →
`claude plugin marketplace update relai` → `claude plugin update relai@relai`; wersję potwierdzasz
w `~/.claude/plugins/installed_plugins.json` (L-0004, L-0020).

Pomiary headless: prompt przez **stdin**, `--permission-mode acceptEdits`, komendy pełną nazwą
`/relai:relai-<nazwa>` (L-0022, L-0024); sesja używająca narzędzi systemowych (tar przy backupie)
potrzebuje dodatkowo `--allowedTools "Bash"` (L-0028). Dowodem jest efekt na dysku i treść
odpowiedzi (L-0017).

```
commands/relai-{stage,backup,audit,changelog,handover,tour,help,adopt,update}.md   # dziewięć komend
skills/relai-core/SKILL.md          # stan Z ZAWARTOŚCIĄ: cztery drogi (adopcja rekomendowana)
skills/relai-planning/SKILL.md      # plany, prompty etapowe, rytuał „Na koniec"
hooks/hooks.json + hooks/*.js       # dziewięć hooków; session-context wskazuje /relai-update
templates/SPEC_*.md                 # 18 specyfikacji (nowa: SPEC_RAPORT_ADOPCJI.md)
templates/HTML_PLAN/                # szablon planu HTML + fonty
docs/plany/BUDOWA_RELAI/            # ten plan; STATUS z E10 GOTOWY DO STARTU
```

**Zmierzone w E9** (nie powtarzaj, chyba że poprawka to unieważni): adopcja projektu testowego
z pełnym recovery (suma drzewa bajt w bajt), bramka backupu (dwa dowody negatywne), scalanie
`CLAUDE.md` verbatim, `/relai-update` 0.7.0→0.9.0 z nietkniętym nadpisaniem lokalnym, odmowa =
zero zmian.

**Czego jeszcze NIE ma (to jest zakres tego etapu):**

- Ani jednego przebiegu na **żywym** projekcie użytkownika — wszystkie dotychczasowe pomiary szły
  na projektach testowych zbudowanych skryptem.
- Pomiarów interaktywnych odłożonych z wcześniejszych etapów (lista niżej — sekcja „Pomiary
  przeniesione z trybu `-p`").
- Wydania 1.0.0.

**Pomiary przeniesione z trybu `-p`** — w E9 (i wcześniej) niewykonalne, tu obowiązkowe (L-0005):

1. **AskUserQuestion na żywo:** paczka trzech pytań inicjalizacji; pytanie o rodzaj/format/model
   przy pierwszym planie; pytania profilu przy zdarzeniu (testy, kierunek wizualny); cztery drogi
   stanu „Z ZAWARTOŚCIĄ".
2. **Skrócona forma komend** (`/relai-backup` zamiast `/relai:relai-backup`) — czy podpowiadacz ją
   rozwija.
3. **Potwierdzenia `config-protection` na żywo:** podbicie markera przy `/relai-update` (w E9
   dokończone ręcznie po zablokowanej sesji headless), zmiana `USTAWIENIA.md`, bramka snapshotu.
4. **Pełna adopcja z pytaniami zadawanymi w trakcie** (konflikt reguł, lokalizacja backupu) —
   zamiast zgody z góry w prompcie.
5. **Propozycja wycieczki** przy cudzym projekcie — reakcja na propozycję, nie sam sygnał.
6. **R2:** auto-wyzwalanie obu skilli na promptach naturalnych, kilka przebiegów.

**Zasady aktywne z `docs/LEKCJE.md`:** wszystkie dwadzieścia osiem; przepisz do sesji pomiarowych
te, które dotyczą pomiaru (4, 17, 20, 22, 24, 27, 28) — reszta obowiązuje przy poprawkach.

## Zakres etapu

1. **Scenariusz 1 — pełny cykl nowego projektu** (D-83). Nowy folder wskazany przez użytkownika
   (mały, realny temat): inicjalizacja z paczką trzech pytań (interaktywnie), pierwszy plan
   (HTML z szablonu „Warsztat"), akceptacja, `/relai-stage`, wykonanie etapu, rytuał „Na koniec",
   zamknięcie planu. Artefakty dowodowe: komplet ośmiu dokumentów, `PLAN.html` bez znaczników,
   `STATUS.md` z przejściami statusów, wpisy dziennika.
2. **Scenariusz 2 — przekazanie + tour** (D-83): `/relai-handover` na projekcie ze scenariusza 1
   (pakiet HTML kompletny offline) + `/relai-tour` w tym samym projekcie z **cudzym** `git config
   user.name` (sygnał D-27 i wycieczka po zgodzie).
3. **Scenariusz 3 — backup + restore** (D-83): `/relai-backup` projektu ze scenariusza 1, dowód
   negatywny sekretów na liście wpisów archiwum, restore wg procedury z `SPEC_RAPORT_ADOPCJI.md`
   (rozpakowanie + porównanie sum) — na kopii, nie na oryginale.
4. **Scenariusz 4 — adopcja JiraManagera z recovery** (D-83, D-70): jawne `/relai-adopt` w folderze
   wskazanym przez użytkownika; pełna sekwencja z pytaniami na żywo; po adopcji **test recovery na
   kopii** (nie cofasz żywego projektu bez decyzji użytkownika): rozpakuj archiwum obok, porównaj
   sumy z zanotowanym stanem sprzed. Raport adopcji zostaje w projekcie.
5. **Kontrola R2 interaktywna** — przebiegi na promptach naturalnych (bez komend): świeży folder
   („zacznijmy projekt…"), projekt RelAI („kontynuujemy pracę", „przygotuj plan…"), po kilka
   powtórzeń; wynik liczbowy do dziennika i do tabeli ryzyk.
6. **Pomiary przeniesione z `-p`** — lista ze „Stanu wyjściowego", każda pozycja z wynikiem
   zapisanym w dzienniku.
7. **Poprawki defektów** ujawnionych przez scenariusze — minimalne, każda z ponownym pomiarem
   i osobnym commitem.
8. **Wydanie 1.0.0**: podbicie w obu manifestach, README, `SPEC_KOMENDY.md`, `SPEC_USTAWIENIA.md`,
   obu skillach i markerze `docs/USTAWIENIA.md`; `grep` po `0.9.0` i rozstrzygnięcie każdego
   trafienia (L-0008); push → `marketplace update` → `plugin update`; `installed_plugins.json`
   pokazuje 1.0.0.
9. **Zamknięcie planu BUDOWA_RELAI** (D-36) — patrz „Na koniec".

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] Scenariusz 1: osiem dokumentów rdzenia istnieje, `PLAN.html` przechodzi builder bez
      niewypełnionych znaczników, plan po ostatnim etapie jest w `docs/archiwum/plany/`,
      a linia „Aktywny plan" projektu pilotażowego brzmi `brak` albo wskazuje istniejący plik.
- [ ] Scenariusz 2: pakiet handover otwiera się offline (zero żądań sieciowych), a tour przy cudzym
      `user.name` najpierw proponuje, potem oprowadza — dowód: treść odpowiedzi sesji.
- [ ] Scenariusz 3: lista wpisów archiwum bez żadnego wzorca sekretów; restore na kopii daje sumy
      identyczne z oryginałem (poza wykluczeniami).
- [ ] Scenariusz 4: sumy kontrolne wszystkich plików kodu JiraManagera identyczne przed i po
      adopcji; żaden zastany plik nie zniknął; `RAPORT_ADOPCJI.md` kompletny; recovery na kopii
      odtwarza stan sprzed (sumy drzewa); konflikty reguł rozstrzygnięte pytaniami na żywo.
- [ ] R2: wynik pomiaru (trafienia/przebiegi, osobno dla obu skilli) zapisany w dzienniku i tabeli
      ryzyk; poziom R2 zaktualizowany z datą.
- [ ] Pomiary przeniesione z `-p`: każda z sześciu pozycji ma zapisany wynik (działa / defekt +
      poprawka + ponowny pomiar).
- [ ] `installed_plugins.json` pokazuje **1.0.0** z aktualnym `gitCommitSha`; `grep` po `0.9.0`
      rozstrzygnięty (historyczne zostają).
- [ ] Wpis w `DZIENNIK.md` na końcu sekcji „Wpisy" z autorem; lekcje z etapu dopisane; foldery
      i kopie testowe usunięte (kopia recovery JiraManagera — po potwierdzeniu użytkownika).

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/BUDOWA_RELAI/STATUS.md`: E10 → `ZREALIZOWANY <data>`, linia w dzienniku wdrożenia,
   status planu → `ZREALIZOWANY <data>`.
2. `docs/DZIENNIK.md`: **wpis zamykający plan** — sekcja „Zrobione" mówi *dowiezione vs plan*
   (D-36); tabela ryzyk: R2, R3, R5, R7 rozstrzygnięte z datami i dowodami (zamknięte albo jawnie
   zostawione otwarte z powodem); lekcje → `docs/LEKCJE.md` + odświeżony destylat.
3. Dokumenty projektu: `CLAUDE.md` repo (tabela „Stan prac" — E10 i wiersz „Implementacja",
   linia aktywnego planu wg D-36: wskazuje istniejący plik albo `Aktywny plan: brak`), `README.md`
   (wersja 1.0.0 i stan faktyczny).
4. **Zamiast promptu następnego etapu — sekwencja zamknięcia planu** (D-36): archiwizacja
   `docs/plany/BUDOWA_RELAI/` do `docs/archiwum/plany/BUDOWA_RELAI/`, podsumowanie dowiezione vs
   plan dla użytkownika.
5. Commit + push; po nich `marketplace update` + `plugin update`, żeby zainstalowana wersja
   odpowiadała repo (L-0004).
