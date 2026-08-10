# PROMPT_ETAP_9 — Adopcja zastanego projektu i aktualizacja: `/relai-adopt`, `/relai-update`

Plan: BUDOWA_RELAI • Etap: **E9 z E10** • Wygenerowano: 2026-08-08 (autor: Opus, w rytuale „Na koniec" E8) • Wykonawca: **Opus** (D-85, linia metryczna `STATUS.md`)

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus**. Jeśli sesja działa na innym
> modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

> **Ostrzeżenie o wadze etapu.** To jedyny etap, w którym RelAI **dotyka cudzego, żywego projektu**.
> Wszystkie poprzednie tworzyły pliki tam, gdzie ich nie było. Ryzyko R3 (adopcja uszkodzi projekt
> użytkownika) jest otwarte i wysokie od pierwszego dnia. D-70 nazywa ten obszar „priorytetem
> zaufania": lepiej etap niedokończony niż adopcja z luką.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sekcja niemutowalna, definicja ukończenia etapu |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" — zwłaszcza **R3** i **R6** — oraz wpis z 2026-08-08 o E8 |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" — dwadzieścia siedem zasad; szczególnie 7 (dowód negatywny), 13 (poprawna wartość tymczasowa), 18 (kryterium na stanie, który kontrolujesz), 20 (wersja z `installed_plugins.json`), 24 (warunki sesji pomiarowej), 25 (wartość czytana maszynowo), 27 (PowerShell psuje polskie znaki) |
| `docs/DECYZJE.md` | grupy „Adopcja i aktualizacje" (D-70, D-71, D-72), „Hooki, bezpieczeństwo, backup" (D-42, D-43), „Dokumenty rdzeniowe" (D-10, D-11, D-18) |
| `docs/plany/BUDOWA_RELAI/PLAN.html` | sekcja 8, wiersz E9 — zakres i zdanie o widocznym efekcie |
| `commands/relai-backup.md` | pierwszy filar D-70 — backup już działa; adopcja ma go **wywołać**, nie napisać drugi raz |
| `commands/relai-audit.md` | wzorzec komendy, która czyta stan i **kończy listą propozycji** zamiast zmieniać |
| `skills/relai-core/SKILL.md` | stan „Z ZAWARTOŚCIĄ" — dziś proponuje dołączenie niedestrukcyjne i mówi wprost, że adopcji jeszcze nie ma; to zdanie przestaje być prawdą |
| `templates/SPEC_PROFILE.md` | adoptowany projekt też dostaje profil i sekcję reguł profilu w `CLAUDE.md` |
| `templates/SPEC_CLAUDE_MD.md` | struktura pliku, do którego adopcja **wstrzykuje** cudze reguły (D-71) |
| `templates/SPEC_USTAWIENIA.md` | marker `Wersja RelAI:` — nośnik różnicy wersji, po której liczy `/relai-update` |
| `hooks/session-context.js` | funkcja `provisionTemplates` i kontrola wersji projekt↔plugin: sygnał „wersja projektu ≠ wersja pluginu" już istnieje i dziś odsyła do nieistniejącej komendy |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **`/relai-adopt` wyłącznie na jawną komendę** (D-70). Nigdy automatycznie, nigdy jako propozycja
  w rytuale startu. Sekwencja obowiązkowa i **bez luk**: pełny backup → analiza (kod, zastane
  dokumenty, `git log`) → wygenerowanie struktury z zastanego stanu → raport zmian (co, skąd,
  dokąd) → **przetestowana** ścieżka pełnego recovery.
- **Istniejący `CLAUDE.md` się scala, nie nadpisuje** (D-71): backup całości, zastane reguły trafiają
  do sekcji „Zasady projektu (odziedziczone)", powstaje raport, a konflikty rozstrzygasz **pytaniami**,
  nie własnym osądem.
- **`/relai-update`** (D-72): porównuje wersję projektu z wersją pluginu, pokazuje **diff** zasad
  i szablonów, aktualizuje **za zgodą**, szanuje lokalne nadpisania, kończy wpisem w dzienniku.
- **Backup już istnieje** (D-43, E7): `/relai-backup` pakuje prawdziwy ZIP z twardym wykluczeniem
  sekretów i weryfikacją listy wpisów archiwum. Adopcja go **wywołuje**. Nie piszesz drugiego
  mechanizmu kopii zapasowej.
- **Sekrety** (D-42): analiza zastanego projektu **nie cytuje** znalezionych sekretów — plik, linia,
  rodzaj. Wygenerowane dokumenty zawierają nazwy zmiennych i wskazania miejsc, nigdy wartości.
- **Nic nie ginie po cichu** (D-18): zastany dokument zastąpiony przez strukturę RelAI dostaje
  adnotację „NIEAKTUALNE — zastąpione przez X, dnia Y, powód Z" i trafia do `docs/archiwum/`.
  Kasowanie jest zakazane, także wtedy, gdy dokument jest ewidentnie śmieciem.
- **Podprojekty zakazane bezwzględnie** (D-53) — adopcja nie zakłada repo w repo i nie rozbija
  zastanego projektu na kilka.
- **Granica zakresu:** pilotaż i cztery scenariusze akceptacyjne to **E10** (D-83). W tym etapie
  budujesz mechanizm i sprawdzasz go na projektach testowych; adopcji JiraManagera **nie**
  wykonujesz. Nie dokładasz też nowych profili ani komend spoza tych dwóch.

## Stan wyjściowy (co realnie zastajesz po E8)

Plugin **RelAI 0.8.0** w repo `github.com/nowilus/relai`, **zainstalowany** (scope `user`).
Po każdej zmianie obowiązuje sekwencja: push → `claude plugin marketplace update relai` →
**`claude plugin update relai@relai`**; wersję potwierdzasz wpisem w
`~/.claude/plugins/installed_plugins.json` (`version` **i** `gitCommitSha`), nie `plugin details`
(L-0020). Poprawka bez podbicia wersji nie dotrze inaczej niż przez `uninstall` + `install`.

Zachowania mierzysz świeżą sesją `claude -p`; **prompt przekazujesz przez stdin**, a zapis włączasz
`--permission-mode acceptEdits` — bez tego przebieg wygląda na udany i mierzy co innego (L-0024).
Komendy wywołujesz pełną nazwą `/relai:relai-<nazwa>` (L-0022). Dowodem działania jest efekt na
dysku i treść odpowiedzi, nie zdarzenie w transkrypcie (L-0017). `AskUserQuestion` w trybie `-p`
nie działa. Zapis poza katalogiem roboczym wymaga `--add-dir` (L-0023).

```
.claude-plugin/plugin.json          # 0.8.0
.claude-plugin/marketplace.json     # 0.8.0
hooks/hooks.json                    # rejestracja 9 hooków (4 zdarzenia)
hooks/profile-rules.js              # NOWY w 0.8.0 — zdarzenia profilu, OSTRZEGA
hooks/config-protection.js          # + bramka snapshotu (D-52), porównanie po sumie kontrolnej
hooks/session-context.js            # rytuał startu, siatka D-34, sygnał D-27, provisioning templates
hooks/*.js                          # pozostałe 6 hooków
skills/relai-core/SKILL.md          # + sekcja „Reguły warunkowe profilu"; stan Z ZAWARTOŚCIĄ
                                    #   nadal mówi, że adopcji NIE MA — to zdanie zmieniasz
skills/relai-planning/SKILL.md      # plany MD/HTML, prompty etapowe, rytuał „Na koniec"
commands/relai-{stage,backup,audit,changelog,handover,tour,help}.md   # siedem komend
templates/SPEC_PROFILE.md           # źródło prawdy o czterech profilach
templates/SPEC_{ARCHITEKTURA,DESIGN,SRODOWISKA,SNAPSHOT}.md           # dokumenty warunkowe
templates/SPEC_*.md                 # łącznie 17 specyfikacji + templates/README.md
templates/HTML_PLAN/                # szablon planu HTML + fonty WOFF2
docs/plany/BUDOWA_RELAI/            # ten plan; STATUS.md z E9 GOTOWY DO STARTU
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):**

- Komendy `/relai-adopt` i `/relai-update` — **żadnej z nich**. `SPEC_KOMENDY.md` wprost zakazuje
  wpisywania ich do `KOMENDY.md`, dopóki nie działają.
- Odtworzenia z backupu. `/relai-backup` tworzy archiwum i sprawdza jego zawartość, ale
  **rozpakowanie i test „projekt wstaje" nie są opisane ani zmierzone** — to brakujący drugi filar
  R3 i warunek, bez którego D-70 nie jest spełnione.
- Scalania `CLAUDE.md` (D-71). Dziś skill mówi wprost: „Jeśli istnieje `CLAUDE.md` — zostaje bez
  zmian; scalanie reguł jest częścią adopcji".
- Migracji projektu sprzed 0.8.0. Projekt zainicjowany na 0.7.0 nie ma sekcji „Reguły profilu"
  w `CLAUDE.md` i **nie dostanie jej sam** — hook `session-context` zgłasza różnicę wersji i odsyła
  do `/relai-update`, której nie ma. To jest pierwszy realny przypadek testowy tej komendy.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie:** wszystkie dwadzieścia siedem.
Krytyczne tutaj:

1. Każda specyfikacja kończy się realnym, kompletnym przykładem (L-0001).
2. Nie obiecuj w dokumentach użytkownika tego, co jeszcze nie działa (L-0002).
3. Ostrzeżenie walidatora o root `CLAUDE.md` jest świadome (L-0003).
4. Sekwencja publikacji: push → `marketplace update` → `plugin update` (L-0004, L-0020).
7. Test zakazu wymaga dowodu negatywnego (L-0007).
8. Po podbiciu wersji `grep` po starym numerze i rozstrzygnięcie każdego trafienia (L-0008).
11. Wymaganą strukturę wypisz w treści skilla albo komendy; odsyłacz to życzenie (L-0011).
12. Katalog pluginu jest dla sesji niedostępny (L-0012).
13. Zawsze istnieje poprawna wartość tymczasowa — pytanie nie usprawiedliwia stanu niespójnego (L-0013).
14. Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje (L-0014).
15. Komenda wywołana wprost nie ładuje skilla — wczytanie musi być jawne (L-0015).
16. Komunikaty hooków celowo ASCII (L-0016).
17. Działanie dowodzisz efektem na dysku i treścią odpowiedzi (L-0017).
18. Kryterium weryfikacji formułuj na stanie, który kontrolujesz (L-0018).
21. Narzędzie rozstrzygające o formacie artefaktu wywołuj pełną ścieżką i sprawdzaj wynik (L-0021).
24. Sesja pomiarowa: prompt przez stdin + `--permission-mode acceptEdits` (L-0024).
25. Wartość czytana maszynowo — kotwica, nie „gdziekolwiek"; nierozpoznana znaczy cisza (L-0025).
26. Dokument wyzwalany zdarzeniem potrzebuje ścieżki „pytam zamiast zmyślać" (L-0026).
27. Dokumentów z polskimi znakami nie przepuszczasz przez PowerShell 5.1 (L-0027).

## Zakres etapu

1. **Rozstrzygnięcie kształtu recovery — i uzasadnienie go w dzienniku.** D-70 wymaga ścieżki
   **przetestowanej**, a dziś nie ma nawet opisanej. Masz do wyboru: osobna komenda cofająca,
   sekcja procedury w raporcie adopcji, albo skrypt odtwarzający zapisywany w projekcie w chwili
   adopcji. **Wybierz jedno, zapisz powód** — to jest decyzja tego etapu. Kryterium wyboru:
   ścieżka ma działać, gdy sesja, która adoptowała, dawno się skończyła, a człowiek ma tylko
   archiwum i raport.
2. **`templates/SPEC_RAPORT_ADOPCJI.md`** — specyfikacja raportu zmian (co, skąd, dokąd): co
   zostało utworzone, co przeniesione do archiwum, co scalone, czego **nie** ruszono i dlaczego,
   gdzie leży backup i jak wygląda pełne cofnięcie. Raport jest jedynym artefaktem, który przeżywa
   sesję adopcji — bez niego cofnięcie zależy od pamięci człowieka.
3. **`commands/relai-adopt.md`** (D-70) — komenda o sekwencji **bez luk**. Wymagania twarde:
   - Krok 0 (marker) jak w pozostałych komendach; projekt **już** będący RelAI → jedno zdanie i koniec.
   - **Backup przed czymkolwiek innym**, przez procedurę `/relai-backup`; nieudany albo
     niezweryfikowany backup **przerywa** adopcję. To jest bramka, nie zalecenie.
   - Analiza: kod, zastane dokumenty, `git log`, wykryty profil (D-50). Projekt bez gita — powiedz
     wprost, czego przez to nie wiadomo, i idź dalej.
   - Generacja struktury **z zastanego stanu**, nie z pustki: `STATE.md` opisuje projekt, który
     istnieje, a `DZIENNIK.md` dostaje wpis zerowy streszczający to, co było przed adopcją.
   - Pokazanie planu zmian i **czekanie na zgodę** przed pierwszym zapisem.
   - Raport wg punktu 2 + wpis w dzienniku.
4. **Scalanie `CLAUDE.md`** (D-71) — w tym samym pliku komendy albo w osobnej specyfikacji, byle
   w jednym miejscu: kopia całości do archiwum, zastane reguły do sekcji „Zasady projektu
   (odziedziczone)", sekcja niemutowalna dokładana bez ruszania cudzej treści, konflikt (zastana
   reguła sprzeczna z regułą RelAI) → **pytanie**, nigdy cicha wygrana którejkolwiek strony.
5. **`commands/relai-update.md`** (D-72) — różnica wersji z markera `Wersja RelAI:`, diff zasad
   i szablonów, aktualizacja za zgodą, **pierwszeństwo nadpisań lokalnych** (`docs/zasoby/HTML_PLAN/`
   — R6), wpis w dzienniku. Pierwszy realny przypadek: projekt 0.7.0 bez sekcji „Reguły profilu"
   dostaje ją, nie tracąc niczego innego.
6. **`skills/relai-core/SKILL.md`** — stan „Z ZAWARTOŚCIĄ" przestaje mówić, że adopcji nie ma:
   trzy możliwości zamieniają się w cztery (adopcja / dołączenie niedestrukcyjne / tryb gościa /
   nic), a zdanie „przyjdzie w kolejnej wersji jako `/relai-adopt`" znika. Komenda nie ładuje
   skilla (L-0015) — procedurę wpisz do komendy albo każ jej jawnie wczytać skill.
7. **`hooks/session-context.js`** — komunikat o różnicy wersji przestaje odsyłać do komendy, której
   nie ma; od 0.9.0 mówi, jak się nazywa i co robi.
8. **`templates/SPEC_KOMENDY.md`** — sekcja „Zakres wersji 0.9.0 (E9)", tabela komend rośnie
   z siedmiu do dziewięciu pozycji, zakaz z końca pliku znika (nie ma już czego zakazywać),
   a w „Czego RelAI pilnuje bez proszenia" lądują **wyłącznie** zachowania działające w 0.9.0.
9. **Wersja 0.9.0** w obu manifestach, README pluginu, `SPEC_KOMENDY.md`, `SPEC_USTAWIENIA.md`,
   obu skillach i markerze `docs/USTAWIENIA.md` tego repo; po podbiciu `grep` po `0.8.0`
   i rozstrzygnięcie **każdego** trafienia (L-0008).
10. **Git**: commity conventional EN, push na `origin main`; przed pomiarami sekwencja
    push → `marketplace update` → `plugin update` (L-0004, L-0020).

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `claude plugin validate .claude-plugin/plugin.json` przechodzi (znane ostrzeżenie L-0003);
      `~/.claude/plugins/installed_plugins.json` po aktualizacji pokazuje `0.9.0`.
- [ ] **Adopcja realnego projektu testowego** na ścieżce ze spacją i polskim znakiem: folder z kodem,
      własnym `CLAUDE.md`, `README.md`, kilkoma dokumentami i historią gita. Po adopcji projekt ma
      strukturę RelAI, a **suma kontrolna każdego zastanego pliku kodu jest identyczna** jak przed.
- [ ] **Dowód negatywny do D-70:** żaden zastany dokument nie zniknął — każdy, którego RelAI nie
      zostawił na miejscu, leży w `docs/archiwum/` z adnotacją „NIEAKTUALNE"; lista plików przed
      i po pokrywa się co do jednego.
- [ ] **Backup jest bramką:** adopcja uruchomiona tam, gdzie backup nie może powstać (brak
      lokalizacji, odmowa dostępu), **przerywa się** i nie tworzy ani jednego pliku struktury
      (dowód: lista plików po nieudanej próbie identyczna jak przed).
- [ ] **Recovery przetestowane naprawdę** (D-70, R3): po adopcji wykonujesz pełne cofnięcie wg
      ścieżki z punktu 1 zakresu i pokazujesz, że projekt wrócił do stanu sprzed — porównanie
      **sumy kontrolnej całego drzewa plików** (poza `.git/`) przed adopcją i po cofnięciu.
      To jest najważniejszy punkt tego etapu; bez niego etap nie jest ukończony.
- [ ] **Scalanie `CLAUDE.md` (D-71):** zastany `CLAUDE.md` z własnymi regułami po adopcji ma te
      reguły w sekcji „Zasady projektu (odziedziczone)" **w niezmienionym brzmieniu** (dowód
      negatywny: cytat zastanej reguły przed i po jest identyczny), kopia oryginału leży
      w archiwum, a konflikt został zgłoszony pytaniem, nie rozstrzygnięty po cichu.
- [ ] **`/relai-update` na projekcie 0.7.0:** projekt zainicjowany starszą wersją dostaje sekcję
      „Reguły profilu" i podbity marker, a **lokalne nadpisanie** w `docs/zasoby/HTML_PLAN/`
      przeżywa aktualizację (dowód: sumy kontrolne plików nadpisania identyczne przed i po — R6).
- [ ] **Bez zgody nic się nie zmienia:** `/relai-adopt` i `/relai-update` uruchomione i przerwane
      przed odpowiedzią zostawiają projekt nietknięty (suma kontrolna `docs/` i korzenia identyczna).
- [ ] `grep` po `0.8.0` rozstrzygnięty: historyczne wystąpienia zostają, aktualne podbite.
- [ ] Wpis w `DZIENNIK.md` na końcu sekcji „Wpisy" z autorem; lekcje z etapu dopisane wraz
      z odświeżonym destylatem; foldery testowe usunięte.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/BUDOWA_RELAI/STATUS.md`: E9 → `ZREALIZOWANY <data>`, E10 → `GOTOWY DO STARTU`
   z linkiem w kolumnie `Prompt`, jedna linia w dzienniku wdrożenia.
2. `docs/DZIENNIK.md`: wpis wg `SPEC_DZIENNIK.md` (Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka) na końcu sekcji „Wpisy". Przejrzyj tabelę
   ryzyk — **R3** (adopcja uszkodzi żywy projekt) powinno po tym etapie zmienić poziom albo
   zostać zamknięte z dowodem, a **R6** (aktualizacja nadpisze lokalne zmiany) domknięte przez
   `/relai-update`. Lekcje → `docs/LEKCJE.md` + odświeżony destylat „Zasady aktywne".
3. `CLAUDE.md` (repo): tabela „Stan prac" — aktualizacja wiersza E9.
4. **Wygeneruj `PROMPT_ETAP_10.md`** wg `templates/SPEC_PROMPT_ETAPU.md` (dziewięć elementów):
   na bazie PLAN sekcja 8 (E10 — pilotaż, cztery scenariusze akceptacyjne D-83, kontrola R2
   w **sesji interaktywnej**, adopcja JiraManagera, wydanie v1.0) + realny stan repo po E9 +
   lekcje z tego etapu. Do promptu E10 przenieś **wprost** listę pomiarów, których tryb `-p`
   nie pozwolił wykonać (interakcja `AskUserQuestion`, skrócona forma wywołania komend, pytania
   profilu z opcjami) — L-0005: warunek wykonalności zapisz tam, gdzie zostanie odczytany.
   Wykonawca wg D-85 (Opus), chyba że `STATUS.md` mówi inaczej.
5. Commit + push.
