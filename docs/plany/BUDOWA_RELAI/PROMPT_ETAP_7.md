# PROMPT_ETAP_7 — Komendy operacyjne: backup, audit, changelog, handover, tour, help

Plan: BUDOWA_RELAI • Etap: **E7 z E10** • Wygenerowano: 2026-08-08 (autor: Opus, w rytuale „Na koniec" E6) • Wykonawca: **Opus** (D-85, linia metryczna `STATUS.md`)

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus**. Jeśli sesja działa na innym
> modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sekcja niemutowalna, definicja ukończenia etapu |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk" + wpis z 2026-08-08 o E6 — co powstało, co zmierzono i czego **nie** zmierzono |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" — dwadzieścia zasad; szczególnie 2 (nie obiecuj), 9 (opis skilla), 15 (komenda nie ładuje skilla), 20 (którą wersję pluginu naprawdę mierzysz) |
| `docs/DECYZJE.md` | grupy „Tożsamość i dystrybucja" (D-05, D-07), „Dokumenty rdzeniowe" (D-17, D-27), „Hooki, bezpieczeństwo, backup" (D-42…D-45) |
| `docs/plany/BUDOWA_RELAI/PLAN.html` | sekcja 8, wiersz E7 — zakres sześciu komend i zdanie o widocznym efekcie |
| `commands/relai-stage.md` | **jedyny działający wzorzec komendy** — układ pliku, front matter, sposób jawnego wczytania skilla (L-0015) |
| `templates/SPEC_KOMENDY.md` | co wolno wpisać do `KOMENDY.md` użytkownika i sekcja „Zakres wersji" do podbicia |
| `skills/relai-core/SKILL.md` | rytuały sesji i rozpoznanie stanu folderu — `/relai-tour` i automatyczna propozycja wycieczki doczepiają się tutaj |
| `templates/SPEC_DZIENNIK.md` | struktura wpisów — `/relai-changelog` destyluje dziennik, więc musi znać jego format |
| `hooks/hooks.json` | rejestracja hooków — jeśli propozycja wycieczki ma działać bez wyzwolenia skilla, wchodzi tą drogą |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Nazwy komend są angielskie i ustalone** (D-05): `/relai-backup`, `/relai-audit`,
  `/relai-changelog`, `/relai-handover`, `/relai-tour`, `/relai-help`. Nie skracasz, nie tłumaczysz,
  nie dodajesz aliasów.
- **`/relai-help` niczego nie duplikuje** (D-07, Aneks A): jedynym źródłem prawdy jest `KOMENDY.md`
  projektu — help go prezentuje, a nie utrzymuje własnej listy.
- **`/relai-backup`** (D-43): centralny folder backupów (pytanie o lokalizację **raz**, warstwa
  globalna), archiwum ZIP `NAZWA_RRRR-MM-DD_GGMM.zip`, wykluczenia (`node_modules`, pliki runtime),
  wpis w `DZIENNIK.md` po wykonaniu.
- **Sekrety są wykluczone z backupu zawsze** (D-42) — to nie jest opcja do konfiguracji.
- **`/relai-audit`** (D-45): jedna komenda łącząca porządki (przestarzałe pliki, kandydaci do
  archiwum) i zdrowie (świeżość dokumentów, spójność `STATE` z kodem, zaległe ryzyka). Wynikiem jest
  **raport z propozycjami**; zmiany wykonuje człowiek przez zatwierdzenie, nie komenda sama.
- **CHANGELOG nie jest prowadzony osobno** (D-17) — powstaje na żądanie z destylacji `DZIENNIK.md`.
- **Wycieczka po cudzym projekcie** (D-27): nieznany autor w dzienniku → propozycja tour (STATE,
  mapa dokumentów, aktywne plany, ryzyka, od czego zacząć). Propozycja, nigdy automatyczne odpalenie.
- **Komenda wywołana wprost nie ładuje skilla** (L-0015) — procedurę albo wpisujesz do pliku komendy,
  albo każesz jej jawnie wczytać skill. Wzorzec jest w `commands/relai-stage.md`.
- **Dokument użytkownika opisuje wyłącznie to, co działa** (L-0002): wiersz w `KOMENDY.md` powstaje
  w tej samej wersji, w której komenda realnie działa.
- **Granica zakresu:** profile projektów to **E8**, `/relai-adopt` i `/relai-update` to **E9** (D-70:
  obszar szczególnej staranności), pilotaż i scenariusze akceptacyjne to **E10**. W tym etapie ich
  nie budujesz, nawet jeśli komenda operacyjna wydaje się o krok od nich. `/relai-handover` wytwarza
  pakiet dla człowieka — nie migruje ani nie adoptuje niczego.

## Stan wyjściowy (co realnie zastajesz po E6)

Plugin **RelAI 0.6.0** w repo `github.com/nowilus/relai`, **zainstalowany** (scope `user`).
Po każdej zmianie obowiązuje sekwencja: push → `claude plugin marketplace update relai` →
**`claude plugin update relai@relai`**. Samo `plugin install` na zainstalowanym pluginie **nic nie
robi**, a `claude plugin details` pokazuje wersję z marketplace'u, nie zainstalowaną — wersję
potwierdzasz wpisem w `~/.claude/plugins/installed_plugins.json` (L-0020). Zachowania mierzysz
świeżą sesją `claude -p …`; dowodem działania jest efekt na dysku i treść odpowiedzi, nie zdarzenie
w transkrypcie (L-0017). `AskUserQuestion` w trybie `-p` nie działa — pomiar interakcji wymaga sesji
interaktywnej.

```
.claude-plugin/plugin.json          # 0.6.0, pola skills/commands/hooks
.claude-plugin/marketplace.json     # 0.6.0
hooks/hooks.json                    # rejestracja 8 hooków (4 zdarzenia)
hooks/*.js                          # 8 hooków; session-context kopiuje CAŁE drzewo templates/
                                    #   (.md/.html/.js/.css/.woff2) do .claude/relai/templates/
skills/relai-core/SKILL.md          # rytuały sesji, inicjalizacja, tryb gościa, rejestry
skills/relai-planning/SKILL.md      # plany w Markdown i HTML, nadpisanie lokalne D-62,
                                    #   prompty etapowe, rytuał „Na koniec", zamknięcie planu
commands/relai-stage.md             # jedyna działająca komenda — wzorzec dla nowych
templates/SPEC_*.md                 # 12 specyfikacji + templates/README.md
templates/HTML_PLAN/                # szablon planu HTML: szablon.html, komponenty.html,
                                    #   zbuduj.js (osadza fonty, kod 1 przy niewypełnionym
                                    #   znaczniku), fonty/ (6 × WOFF2, SIL OFL)
docs/plany/BUDOWA_RELAI/            # ten plan; STATUS.md z E7 GOTOWY DO STARTU
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** żadnej komendy poza `/relai-stage`; backupu;
audytu; changeloga; pakietu przekazania; wycieczki po projekcie ani propozycji wycieczki dla nieznanego
autora; komendy `/relai-help`. `KOMENDY.md` generowany u użytkownika ma **jedną** pozycję w tabeli komend.

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
    w `stream-json`; payloady testowe buduj Nodem, nie echem w shellu (L-0017).
18. Kryterium weryfikacji formułuj na stanie, który kontrolujesz, nie na przewidywanym formacie
    wyjścia cudzego narzędzia (L-0018).
19. Lista zakazów to filtr końcowy, nie brief — przy zadaniu wizualnym najpierw jeden wariant
    do kalibracji (L-0019).
20. Zainstalowaną wersję pluginu potwierdzasz `installed_plugins.json` albo treścią skilla w cache'u;
    `plugin install` na zainstalowanym pluginie to no-op (L-0020).

## Zakres etapu

1. **`commands/relai-backup.md`** (D-43): pyta o lokalizację centralnego folderu **raz** (najpierw
   `docs/USTAWIENIA.md`, potem warstwa globalna `~/.claude/relai/` — L-0006), tworzy
   `NAZWA_RRRR-MM-DD_GGMM.zip`, wyklucza sekrety i `node_modules`, kończy wpisem w `DZIENNIK.md`.
   Rozstrzygnij i **zapisz w komendzie**, czym pakujesz na Windows bez zależności npm (np. `tar`
   z systemu albo `Compress-Archive`) — komenda ma działać na maszynie użytkownika, nie w teorii.
2. **`commands/relai-audit.md`** (D-45): raport w dwóch częściach — porządki i zdrowie — zakończony
   listą **propozycji do zatwierdzenia**. Komenda niczego nie kasuje i nie przenosi sama.
3. **`commands/relai-changelog.md`** (D-17): destylacja `docs/DZIENNIK.md` do listy zmian; zakres
   (od daty / od wersji) jako argument; wynik na ekran, zapis do pliku dopiero na życzenie.
4. **`commands/relai-handover.md`**: pakiet przekazania projektu dla człowieka. Format HTML —
   **korzystasz z `templates/HTML_PLAN/`**, nie piszesz drugiego szablonu (tokeny w `:root`,
   `zbuduj.js` do fontów). Zawartość: stan, mapa dokumentów, aktywne plany i etapy, otwarte ryzyka,
   od czego zacząć.
5. **`commands/relai-tour.md`** (D-27) **+ propozycja wycieczki** dla nieznanego autora w dzienniku:
   rozstrzygnij, czy propozycja idzie przez `relai-core` (rytuał startu), czy przez hook
   `session-context` — i uzasadnij wybór w dzienniku. Propozycja, nigdy automatyczne odpalenie.
6. **`commands/relai-help.md`** (D-07): prezentuje `KOMENDY.md` projektu; brak pliku → mówi o tym
   i proponuje wygenerowanie. Zero własnej listy komend.
7. **`.claude-plugin/plugin.json`** — pole `commands` obejmuje wszystkie nowe pliki komend.
8. **`templates/SPEC_KOMENDY.md`**: sekcja „Zakres wersji 0.7.0 (E7)", tabela komend rozrasta się
   z jednej pozycji do siedmiu, przykład wygenerowanego `KOMENDY.md` zaktualizowany (L-0001).
9. **Wersja 0.7.0** w obu manifestach, README pluginu, `SPEC_KOMENDY.md`, `SPEC_USTAWIENIA.md`,
   obu skillach i markerze `docs/USTAWIENIA.md` tego repo; po podbiciu `grep` po `0.6.0`
   i rozstrzygnięcie **każdego** trafienia (L-0008).
10. **Git**: commity conventional EN, push na `origin main`; przed pomiarami sekwencja
    push → `marketplace update` → `plugin update` (L-0004, L-0020).

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `claude plugin validate .claude-plugin/plugin.json` przechodzi (znane ostrzeżenie L-0003);
      `~/.claude/plugins/installed_plugins.json` po aktualizacji pokazuje `0.7.0`.
- [ ] Każda z sześciu komend uruchomiona w świeżej sesji w projekcie testowym na ścieżce ze spacją
      i polskim znakiem **robi to, co obiecuje**, a nie tylko odpowiada tekstem: `/relai-backup`
      zostawia plik ZIP o właściwej nazwie, `/relai-audit` wypisuje raport z propozycjami,
      `/relai-changelog` zwraca listę zmian z dziennika, `/relai-handover` zostawia plik HTML,
      `/relai-tour` opisuje projekt z jego dokumentów, `/relai-help` wypisuje zawartość `KOMENDY.md`.
- [ ] **Dowód negatywny do D-42 (L-0007):** projekt testowy z plikiem `.env`, w którym siedzi
      przypisanie zmiennej o nazwie zaczynającej się od `SECRET`, po `/relai-backup` daje archiwum,
      w którym `.env` **nie istnieje** — sprawdź listą zawartości archiwum, nie deklaracją komendy.
- [ ] **Dowód negatywny do D-45:** po `/relai-audit` żaden plik nie został przeniesiony ani usunięty —
      suma kontrolna katalogu `docs/` identyczna przed i po.
- [ ] `/relai-help` nie zawiera własnej listy komend — `grep` po nazwach komend w
      `commands/relai-help.md` zwraca wyłącznie ich wywołania w opisie mechaniki, a treść dla
      użytkownika pochodzi z `KOMENDY.md` (D-07).
- [ ] Propozycja wycieczki pojawia się w projekcie z **nieznanym autorem** w dzienniku i **nie
      pojawia się** w projekcie, którego autorem jest bieżący użytkownik (dwa przebiegi, dowód
      z treści odpowiedzi).
- [ ] `grep` po `0.6.0` rozstrzygnięty: historyczne wystąpienia zostają, aktualne podbite.
- [ ] Wpis w `DZIENNIK.md` na końcu sekcji „Wpisy" z autorem; lekcje z etapu dopisane wraz
      z odświeżonym destylatem; foldery testowe usunięte.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/BUDOWA_RELAI/STATUS.md`: E7 → `ZREALIZOWANY <data>`, E8 → `GOTOWY DO STARTU`
   z linkiem w kolumnie `Prompt`, jedna linia w dzienniku wdrożenia.
2. `docs/DZIENNIK.md`: wpis wg `SPEC_DZIENNIK.md` (Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka) na końcu sekcji „Wpisy". Przejrzyj tabelę
   ryzyk — szczególnie **R3** (adopcja: backup i recovery są jej fundamentem) i **R5** (waga
   pakietu `/relai-handover`). Lekcje → `docs/LEKCJE.md` + odświeżony destylat „Zasady aktywne".
3. `CLAUDE.md` (repo): tabela „Stan prac" — aktualizacja wiersza E7.
4. **Wygeneruj `PROMPT_ETAP_8.md`** wg `templates/SPEC_PROMPT_ETAPU.md` (dziewięć elementów):
   na bazie PLAN sekcja 8 (E8 — profile app / agent-voice / flow / prompty, D-50…D-53) + realny
   stan repo po E7 + lekcje z tego etapu. Wykonawca wg D-85 (Opus), chyba że `STATUS.md` mówi inaczej.
5. Commit + push.
