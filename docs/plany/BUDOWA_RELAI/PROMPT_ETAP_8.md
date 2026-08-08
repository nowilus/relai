# PROMPT_ETAP_8 — Profile projektów: app, agent-voice, flow, prompty

Plan: BUDOWA_RELAI • Etap: **E8 z E10** • Wygenerowano: 2026-08-08 (autor: Opus, w rytuale „Na koniec" E7) • Wykonawca: **Opus** (D-85, linia metryczna `STATUS.md`)

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus**. Jeśli sesja działa na innym
> modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sekcja niemutowalna, definicja ukończenia etapu |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" + wpis z 2026-08-08 o E7 — co powstało, co zmierzono i czego **nie** zmierzono |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" — dwadzieścia trzy zasady; szczególnie 2 (nie obiecuj), 6 (pytanie raz na projekt), 11 (strukturę wypisz w treści), 15 (komenda nie ładuje skilla), 22 (zmierzona forma wywołania) |
| `docs/DECYZJE.md` | grupy „Profile projektów" (D-50…D-53), „Interakcja i konfiguracja" (D-20, D-22, D-25), „Dokumenty rdzeniowe" (D-10, D-11, D-12) |
| `docs/plany/BUDOWA_RELAI/PLAN.html` | sekcja 8, wiersz E8 — zakres profili i zdanie o widocznym efekcie |
| `skills/relai-core/SKILL.md` | tu mieszka auto-detekcja profilu (paczka trzech pytań) i rytuały — reguły warunkowe doczepiają się do tego skilla |
| `templates/SPEC_CLAUDE_MD.md` | co trafia do `CLAUDE.md` projektu — reguły profilu muszą tam znaleźć swoje miejsce |
| `templates/SPEC_STATE.md` | dwuwarstwowy STATE — profil wpływa na to, co siedzi w warstwie faktograficznej |
| `templates/README.md` | konwencja specyfikacji (D-60) i to, czym różni się `HTML_PLAN/` od reszty |
| `hooks/doc-sync-reminder.js` | wzorzec hooka wykrywającego „pierwszy raz" w projekcie — kandydat na nośnik reguł warunkowych |
| `commands/relai-audit.md` | wzorzec świeżo napisanej procedury (Krok 0 z markerem, zakazy na końcu) |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Cztery profile, wszystkie pełne w v1** (D-50): `app`, `agent-voice`, `flow`, `prompty`.
  Jeden rdzeń dokumentacyjny + reguły warunkowe zależne od profilu. Nie dokładasz piątego profilu
  i nie łączysz istniejących.
- **Profil `app`** (D-51): `ARCHITEKTURA.md` przy **pierwszym kodzie**, `DESIGN.md` przy **pierwszym
  UI** (z krótkim pytaniem o kierunek), `docs/srodowiska/` per środowisko przy **pierwszym deployu**
  — URL, **wskazanie** dostępów (nigdy wartości), jak wdrożyć i jak cofnąć.
- **Profile `agent-voice` i `flow`** (D-52): przed każdą zmianą produkcyjną konfiguracji
  **obowiązkowy snapshot** do `docs/snapshoty/<data>/` z sufiksem stanu; zmiany skryptem
  migracyjnym z asercjami, nie ręczną edycją JSON. Konwencje KB: numeracja sekcji nietykalna,
  split PL treść / EN routing.
- **Podprojekty zakazane bezwzględnie** (D-53): folder projektu = jedno repo, bez zagnieżdżeń.
- **Pytanie o testy pada przy pierwszym kodzie** (D-25), z rekomendacją LLM (pełny TDD / testy
  krytycznych ścieżek / bez testów) i zapisem do `USTAWIENIA.md`. Sekcja „Weryfikacja" w prompcie
  etapowym jest obowiązkowa zawsze i to się nie zmienia.
- **Pytanie o preferencję pada raz na projekt** (D-22, L-0006): najpierw `docs/USTAWIENIA.md`,
  potem warstwa globalna, dopiero potem pytanie. Limit trzech pytań startowych jest twardy (D-20,
  D-80) — reguły profilu **nie mają prawa** dołożyć czwartego pytania do paczki inicjalizacyjnej.
- **Dokumenty warunkowe są warunkowe** (D-10): `ARCHITEKTURA.md`, `DESIGN.md` i `docs/srodowiska/`
  powstają **przy zdarzeniu**, nie na zapas przy inicjalizacji. Pusty dokument „na przyszłość" jest
  zakazany.
- **Specyfikacje to instrukcje dla LLM, nie pliki do kopiowania** (D-60); dokumenty powstają
  w języku projektu, nazwy plików podążają za językiem (D-12).
- **Granica zakresu:** `/relai-adopt` i `/relai-update` to **E9** (D-70, D-72 — obszar szczególnej
  staranności), pilotaż i cztery scenariusze akceptacyjne to **E10**. W tym etapie ich nie budujesz.
  Nie dokładasz też nowych komend operacyjnych — komplet z E7 jest zamknięty.

## Stan wyjściowy (co realnie zastajesz po E7)

Plugin **RelAI 0.7.0** w repo `github.com/nowilus/relai`, **zainstalowany** (scope `user`),
`gitCommitSha 68c1e03`. Po każdej zmianie obowiązuje sekwencja: push →
`claude plugin marketplace update relai` → **`claude plugin update relai@relai`**; wersję
potwierdzasz wpisem w `~/.claude/plugins/installed_plugins.json`, nie `plugin details` (L-0020).
Zachowania mierzysz świeżą sesją `claude -p`; **komendy wywołujesz pełną nazwą**
`/relai:relai-<nazwa>` — forma skrócona w trybie `-p` kończy się `Unknown command` (L-0022).
Dowodem działania jest efekt na dysku i treść odpowiedzi, nie zdarzenie w transkrypcie (L-0017).
`AskUserQuestion` w trybie `-p` nie działa — pomiar interakcji wymaga sesji interaktywnej.
Zapis poza katalogiem roboczym wymaga `--add-dir` (L-0023).

```
.claude-plugin/plugin.json          # 0.7.0, pola skills/commands/hooks
.claude-plugin/marketplace.json     # 0.7.0
hooks/hooks.json                    # rejestracja 8 hooków (4 zdarzenia)
hooks/session-context.js            # + funkcja unknownAuthor: sygnał D-27 na SessionStart
hooks/*.js                          # pozostałe 7 hooków bez zmian od E5
skills/relai-core/SKILL.md          # rytuały, inicjalizacja z auto-detekcją profilu,
                                    #   sekcja „Propozycja wycieczki po cudzym projekcie"
skills/relai-planning/SKILL.md      # plany MD/HTML, prompty etapowe, rytuał „Na koniec"
commands/relai-stage.md             # uruchomienie etapu planu
commands/relai-backup.md            # ZIP + wykluczenia + weryfikacja archiwum
commands/relai-audit.md             # raport porządki/zdrowie + propozycje
commands/relai-changelog.md         # destylacja dziennika
commands/relai-handover.md          # pakiet przekazania HTML z HTML_PLAN/
commands/relai-tour.md              # wycieczka z dokumentów + zasady propozycji
commands/relai-help.md              # prezentacja KOMENDY.md, zero własnej listy
templates/SPEC_*.md                 # 12 specyfikacji + templates/README.md
templates/HTML_PLAN/                # szablon planu HTML + fonty WOFF2
docs/plany/BUDOWA_RELAI/            # ten plan; STATUS.md z E8 GOTOWY DO STARTU
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** jakiejkolwiek reguły zależnej od profilu.
Profil jest dziś **zapisywany do `USTAWIENIA.md` i na tym się kończy** — nie zmienia ani jednego
zachowania. Nie ma `SPEC_ARCHITEKTURA`, `SPEC_DESIGN` ani specyfikacji `docs/srodowiska/`; nie ma
snapshotów konfiguracji, konwencji KB ani rejestru wersji artefaktów; nie ma wykrycia „pierwszego
kodu", „pierwszego UI" i „pierwszego deployu"; nie ma pytania o testy z D-25.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie:**

1. Każda specyfikacja kończy się realnym, kompletnym przykładem (L-0001).
2. Nie obiecuj w dokumentach użytkownika tego, co jeszcze nie działa (L-0002).
3. Ostrzeżenie walidatora o root `CLAUDE.md` jest świadome — nie „naprawiaj" go (L-0003).
4. Plugin zainstalowany; mierz świeżą sesją; po zmianie: push → `marketplace update` →
   `plugin update` (L-0004, doprecyzowane L-0020).
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
    w `stream-json`; payloady testowe buduj Nodem (L-0017).
18. Kryterium weryfikacji formułuj na stanie, który kontrolujesz (L-0018).
19. Lista zakazów to filtr końcowy, nie brief (L-0019).
20. Zainstalowaną wersję potwierdzasz `installed_plugins.json`; `plugin install` na zainstalowanym
    pluginie to no-op, a `plugin update` porównuje numer wersji (L-0020).
21. Narzędzie systemowe rozstrzygające o formacie artefaktu wywołuj pełną ścieżką i sprawdzaj
    wynik, nie kod wyjścia (L-0021).
22. W dokumencie użytkownika podajesz **zmierzoną** formę wywołania — komendy pluginu żyją
    w przestrzeni nazw `/relai:relai-…` (L-0022).
23. Krok sięgający poza katalog roboczy ma mieć zapisane wyjście po odmowie dostępu (L-0023).

## Zakres etapu

1. **Rozstrzygnięcie nośnika reguł warunkowych — i uzasadnienie go w dzienniku.** Reguła „przy
   pierwszym kodzie powstaje `ARCHITEKTURA.md`" musi zadziałać także wtedy, gdy skill się nie
   wyzwolił (R2). Masz trzy drogi: sekcja w `relai-core`, nowy hook (wzorzec `doc-sync-reminder`),
   albo obie warstwy jak przy siatce D-34 i sygnale D-27. **Wybierz jedną, zapisz powód** — to jest
   decyzja tego etapu, nie rzecz do odziedziczenia z promptu.
2. **`templates/SPEC_PROFILE.md`** — jedna specyfikacja opisująca cztery profile: sygnały detekcji,
   dokumenty warunkowe każdego z nich, zdarzenia wyzwalające i reguły, które profil dokłada do
   `CLAUDE.md` projektu. To jest **źródło prawdy o profilach**; skill i hook mają się do niego
   odwoływać, ale wymaganą strukturę i tak wypisz w ich treści (L-0011).
3. **Profil `app` (D-51)** — trzy dokumenty warunkowe i trzy zdarzenia:
   - `templates/SPEC_ARCHITEKTURA.md` — powstaje przy pierwszym kodzie,
   - `templates/SPEC_DESIGN.md` — przy pierwszym UI, z **jednym** krótkim pytaniem o kierunek,
   - `templates/SPEC_SRODOWISKA.md` — `docs/srodowiska/<nazwa>.md` przy pierwszym deployu: URL,
     **wskazanie** dostępów (nigdy wartości — D-42), procedura wdrożenia i **procedura cofnięcia**,
   - pytanie o testy (D-25) z rekomendacją i zapisem do `USTAWIENIA.md`.
4. **Profile `agent-voice` i `flow` (D-52)** — `templates/SPEC_SNAPSHOT.md`: kiedy snapshot jest
   obowiązkowy, co dokładnie ląduje w `docs/snapshoty/<data>/`, jak brzmi sufiks stanu i dlaczego
   zmiana idzie skryptem migracyjnym z asercjami zamiast ręcznej edycji JSON. Konwencje KB
   (numeracja sekcji nietykalna, split PL treść / EN routing) — w tym samym pliku albo w
   `SPEC_PROFILE.md`, byle w jednym miejscu.
5. **Profil `prompty`** — rejestr wersji artefaktów: gdzie mieszka, co zawiera wpis, jak wygląda
   porównanie wersji. Najmniejszy z czterech profili; nie rozbudowuj go ponad to, co mówi PLAN.
6. **`skills/relai-core/SKILL.md`** — profil przestaje być martwym wpisem: sekcja opisująca, co
   robi każdy profil, kiedy dokłada dokument warunkowy i jak wygląda jedno pytanie towarzyszące.
   Auto-detekcja z paczki trzech pytań zostaje bez zmian.
7. **`templates/SPEC_CLAUDE_MD.md`** — miejsce na reguły profilu w `CLAUDE.md` projektu
   (sekcja, jej nazwa, co tam wolno wpisać, a czego nie).
8. **`templates/SPEC_KOMENDY.md`** — sekcja „Zakres wersji 0.8.0 (E8)" i **wyłącznie te** punkty
   w „Czego RelAI pilnuje bez proszenia", które w 0.8.0 realnie działają (L-0002).
9. **Wersja 0.8.0** w obu manifestach, README pluginu, `SPEC_KOMENDY.md`, `SPEC_USTAWIENIA.md`,
   obu skillach i markerze `docs/USTAWIENIA.md` tego repo; po podbiciu `grep` po `0.7.0`
   i rozstrzygnięcie **każdego** trafienia (L-0008).
10. **Git**: commity conventional EN, push na `origin main`; przed pomiarami sekwencja
    push → `marketplace update` → `plugin update` (L-0004, L-0020).

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `claude plugin validate .claude-plugin/plugin.json` przechodzi (znane ostrzeżenie L-0003);
      `~/.claude/plugins/installed_plugins.json` po aktualizacji pokazuje `0.8.0`.
- [ ] **Cztery projekty testowe** na ścieżce ze spacją i polskim znakiem, po jednym na profil,
      inicjalizowane w świeżych sesjach: każdy dostaje **tylko** dokumenty swojego profilu i ani
      jednego dokumentu warunkowego na zapas (dowód: lista plików w `docs/` po inicjalizacji).
- [ ] **Zdarzenie wyzwala dokument.** W projekcie `app`: dopisanie pierwszego pliku źródłowego
      w świeżej sesji kończy się powstaniem `docs/ARCHITEKTURA.md`; przed tą sesją pliku **nie ma**
      (dowód z obu stron, L-0007).
- [ ] **Dowód negatywny do D-51:** projekt `app` **bez** UI i **bez** deployu nie ma
      `docs/DESIGN.md` ani katalogu `docs/srodowiska/` — sprawdzone listą plików po trzech sesjach
      roboczych, nie deklaracją skilla.
- [ ] **Dowód negatywny do D-42 w profilu `app`:** wygenerowany `docs/srodowiska/<nazwa>.md`
      zawiera **nazwy** zmiennych i miejsce przechowywania sekretu, a `grep` po wartościach
      z `.env` projektu testowego nie zwraca nic.
- [ ] **Profil `flow`/`agent-voice`:** próba zmiany pliku konfiguracji bez wcześniejszego snapshotu
      kończy się zatrzymaniem i propozycją snapshotu; po zgodzie w `docs/snapshoty/<data>/`
      leży kopia sprzed zmiany (dowód: suma kontrolna kopii = suma kontrolna pliku sprzed zmiany).
- [ ] **Limit trzech pytań startowych nietknięty:** inicjalizacja każdego z czterech profili zadaje
      dokładnie trzy pytania (dowód z treści odpowiedzi sesji, nie z kodu).
- [ ] `grep` po `0.7.0` rozstrzygnięty: historyczne wystąpienia zostają, aktualne podbite.
- [ ] Wpis w `DZIENNIK.md` na końcu sekcji „Wpisy" z autorem; lekcje z etapu dopisane wraz
      z odświeżonym destylatem; foldery testowe usunięte.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/BUDOWA_RELAI/STATUS.md`: E8 → `ZREALIZOWANY <data>`, E9 → `GOTOWY DO STARTU`
   z linkiem w kolumnie `Prompt`, jedna linia w dzienniku wdrożenia.
2. `docs/DZIENNIK.md`: wpis wg `SPEC_DZIENNIK.md` (Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka) na końcu sekcji „Wpisy". Przejrzyj tabelę
   ryzyk — szczególnie **R1** (profile to naturalne miejsce na rozrost zakresu; D-80 jest granicą)
   i **R2** (reguła warunkowa oparta wyłącznie na skillu dziedziczy jego zawodność).
   Lekcje → `docs/LEKCJE.md` + odświeżony destylat „Zasady aktywne".
3. `CLAUDE.md` (repo): tabela „Stan prac" — aktualizacja wiersza E8.
4. **Wygeneruj `PROMPT_ETAP_9.md`** wg `templates/SPEC_PROMPT_ETAPU.md` (dziewięć elementów):
   na bazie PLAN sekcja 8 (E9 — `/relai-adopt` wg D-70, scalanie `CLAUDE.md` wg D-71,
   `/relai-update` wg D-72) + realny stan repo po E8 + lekcje z tego etapu. Wykonawca wg D-85
   (Opus), chyba że `STATUS.md` mówi inaczej.
5. Commit + push.
