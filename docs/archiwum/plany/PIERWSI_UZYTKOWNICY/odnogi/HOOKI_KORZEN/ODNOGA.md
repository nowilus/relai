# ODNOGA — korzeniowy `hooks/` ładowany przez Claude Code obok hooków adaptera

Plan: [PIERWSI_UZYTKOWNICY](../../STATUS.md) · Etap-źródło: E1 — Pokaz i wiarygodne wejście ·
Utworzona: 2026-09-12 · Status: **ZAMKNIĘTA 2026-09-12** · Wykonawca: Opus

## Cel

Świeża sesja Claude Code na publicznie zainstalowanym RelAI dostaje **jeden** blok kontekstu startu
(polski, z adaptera Claude Code) i **nie widzi żadnego komunikatu o błędzie hooka** przy zamknięciu
sesji — przy zachowanym działaniu hooków Codeksa w Codeksie.

## Skąd się wzięła

E1 sprawdzał ścieżkę obcego użytkownika: świeża instalacja z `nowilus/relai` w izolowanej
konfiguracji (`CLAUDE_CONFIG_DIR`). Instalacja przeszła (2.1.3, `✔ enabled`), ale sesja wypisała
`SessionEnd hook [node "${CLAUDE_PLUGIN_ROOT}/adapters/codex/hooks/session-end.js"] failed: Hook
JSON output validation failed — (root): Invalid input`. Ta ścieżka występuje wyłącznie
w korzeniowym `hooks/hooks.json` — pliku hooków **Codeksa**, którego `plugin.json` Claude Code nie
deklaruje (deklaruje `./adapters/claude-code/hooks/hooks.json`). Korzeniowy `hooks/` jest katalogiem
konwencyjnym Claude Code, więc ładuje się **dodatkowo**. Drugim objawem tej samej przyczyny jest
zdublowany kontekst startu: obok polskiego bloku adaptera stoi angielski, dosłownie z linii 18
`adapters/codex/hooks/session-context.js`. To czwarta wada dystrybucji tej klasy — po P-010
(korzeniowy `skills/`), P-011 (`agents` wskazujące katalog) i P-012 (niecytowany `description`).
Naprawa kodu jest spoza zakresu E1 (sekcja 7 planu: „błąd kodu wraca jako osobny zakres"), ale stoi
przed materiałem demo — nagranie świeżej sesji pokazałoby oba objawy.

## Zakres

1. **`adapters/codex/hooks/session-context.js`, `session-end.js` i `secret-scanner.js`** (oraz
   `secret-scanner.sh` / `.cmd`, jeśli wołają logikę bezpośrednio) — **bramka hosta**: uruchomienie
   pod Claude Code (zmienna `CLAUDECODE`, zmierzona jako obecna 2026-09-12) kończy się cicho kodem
   0, bez wypisania czegokolwiek na stdout. Sygnał bierzesz z istniejącej konwencji projektu
   (`core/process/crew.js`, linie 40–41), nie z własnego rozpoznania.
2. **`hooks/hooks.json`** — zostaje w korzeniu, bo tam go szuka Codex (`adapters/codex/README.md`
   linia 33); zmienia się wyłącznie to, co robią wołane skrypty. Pole `hooks` w
   `.codex-plugin/plugin.json` **nie istnieje** — jeśli sprawdzisz, że Codex je przyjmuje, to jest
   wariant lepszy: przenosisz plik do `adapters/codex/hooks/` i korzeń zostaje pusty.
3. **`core/tools/validate-adapters.js`** — kontrola wykrywająca tę klasę wady: każdy skrypt wołany
   z korzeniowego `hooks/hooks.json` musi mieć bramkę hosta. Kontrola ma dawać **niezerowy kod**,
   gdy bramki brakuje.
4. **`docs/PULAPKI.md`** — pozycja P-013 z rozpoznaniem, objawami i sposobem sprawdzenia.
5. **Wydanie 2.1.4** — podbicie wersji w źródłach prawdy, `claude plugin validate` przed tagiem
   (bramka z ryzyka W1), tag i release; potwierdzenie wersji plikiem instalacji, nie komunikatem CLI.

## Poza zakresem

- Zmiana treści komunikatów startu sesji obu adapterów — brzmienia nie ruszamy, tylko liczbę bloków.
- Reszta zakresu E1: materiał demo, README, `docs/zasoby/demo/` — wraca do etapu po tej naprawie.
- Rewizja pozostałych hooków adaptera Claude Code (dziesięć plików) — nie mają tego problemu.
- Sprawdzanie, czy Codex akceptuje `additionalContext` w `SessionEnd`; tu liczy się tylko to, że
  Claude Code go odrzuca.

## Weryfikacja

- [ ] **Kontekst startu bez duplikatu:** świeża sesja Claude Code w tym projekcie pokazuje dokładnie
      jeden blok `[RelAI session-context]`; zdanie „This is a RelAI project. Before substantive work,
      read AGENTS.md…" nie występuje. Dowód z kontekstu sesji, nie z kodu.
- [ ] **Brak komunikatu o błędzie hooka** przy zamknięciu sesji Claude Code — sprawdzone na świeżej
      instalacji w izolowanym `CLAUDE_CONFIG_DIR`, tak jak przy rozpoznaniu.
- [ ] **Kontrola pozytywna bramki:** ten sam skrypt wołany **bez** `CLAUDECODE` w środowisku
      wypisuje swój kontekst normalnie (dowód, że bramka nie wyłączyła hooka na zawsze).
- [ ] `node core/tools/validate-adapters.js` kończy się kodem 0; ten sam walidator na podłożonym
      skrypcie bez bramki kończy się kodem niezerowym i wskazuje plik.
- [ ] `docs/PULAPKI.md` ma pozycję P-013; `git grep -n "P-013"` zwraca ją także z `docs/STATE.md`.
- [ ] `claude plugin validate <ścieżka instalacji>` → `Validation passed`; wersja 2.1.4 potwierdzona
      treścią plików z cache'u (sumy po normalizacji CRLF → LF), nie komunikatem CLI.
- [ ] Katalog roboczy `.claude/relai/work/PIERWSI_UZYTKOWNICY/HOOKI_KORZEN/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak"; liczby przed i po we
      wpisie dziennika, artefakty spoza niego (izolowany `CLAUDE_CONFIG_DIR`, cache pluginu)
      wypisane z nazwy.

## Wynik

Bramka hosta na `CLAUDECODE` weszła do czterech skryptów wołanych z korzeniowego `hooks/hooks.json`
(`session-context.js`, `session-end.js`, `secret-scanner.js` oraz opakowania `.sh`/`.cmd`);
korzeniowy plik został na miejscu, bo `.codex-plugin/plugin.json` pola `hooks` nie ma. Walidator
adapterów dostał kontrolę tej klasy wady, a rejestr pułapek pozycję **P-013**. Wersja podniesiona do
**2.1.4** w pięciu źródłach prawdy plus dziewięciu deklaracjach stanu docelowego; skille Codeksa
przegenerowane (15 plików).

Dowód rozstrzygający — oba warianty w **identycznej** izolowanej konfiguracji (`CLAUDE_CONFIG_DIR`),
ten sam projekt kontrolny, ta sama komenda: instalacja **2.1.3** z `nowilus/relai` → **1 trafienie**
`Hook JSON output validation failed`; instalacja **2.1.4** z lokalnego marketplace → **0 trafień**
tego komunikatu i **0 trafień** zdania Codeksa „read AGENTS.md". Na poziomie skryptów 3/3 hooki
milczą pod `CLAUDECODE` i odzywają się bez niej w tym samym przebiegu (893, 178 i 218 znaków,
ostatni z werdyktem `deny` — guardrail Codeksa żyje dalej). Walidator: kod 0 i „bramki hosta
w hookach Codeksa: 4/4", a na podłożonym skrypcie bez bramki kod 1 ze wskazaniem pliku.

Czego **nie** zweryfikowano: **zdublowanego bloku kontekstu w aplikacji desktopowej** — to wymaga
`claude plugin update relai@relai` i restartu aplikacji (P-005), czyli działania człowieka. Pomiar
przez `claude -p --plugin-dir` okazał się bezwartościowy: zero trafień po **obu** stronach, bo ta
ścieżka nie podłącza hooków pluginu (potwierdzenie L-0093 i P-002). Wydanie 2.1.4 — tag, release
i `git push` — czeka na dyspozycję właściciela.

Wpis w dzienniku: [DZIENNIK.md](../../../../DZIENNIK.md), wpis z 2026-09-12 o odnodze HOOKI_KORZEN.
