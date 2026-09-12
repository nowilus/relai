# DEMO — materiał demonstracyjny RelAI (E1 planu PIERWSI_UZYTKOWNICY)

Dokumentacja materiału wyrenderowanego w E1 zgodnie z **Aneksem A** planu: materiał produkuje agent,
nie nagrywa go człowiek. Wszystko poniżej opisuje **realny przebieg**, nie scenariusz.

Pliki wynikowe: [`docs/zasoby/demo/`](../../zasoby/demo/).

---

## a) Wersje, na których zmierzono przebieg

| Co | Wartość | Skąd |
|---|---|---|
| Narzędzie | **Claude Code 2.1.227** | `claude --version`, 2026-09-12 (FAKT) |
| Model | **Opus 5** (`--model opus`) | lista modeli `.claude/relai/MODELE-claude-code.md`, `list-date: 2026-09-04` |
| RelAI w projekcie kontrolnym | **2.1.3** | marker `Wersja RelAI:` w `docs/USTAWIENIA.md` projektu kontrolnego (FAKT) |
| RelAI w repozytorium podczas renderu | **2.1.4** | naprawa P-013 z odnogi HOOKI_KORZEN, niewydana |
| Publiczna instalacja | **2.1.3** | marketplace `nowilus/relai` serwuje `main`, nie obiekt release (FAKT, 2026-09-12) |
| Projekt kontrolny | `%TEMP%/relai-pierwsi-uzytkownicy-sklep-demo` | neutralny sklep: `README.md`, `package.json`, `src/koszyk.js` |

**Dlaczego projekt kontrolny leży w `%TEMP%`, a nie w katalogu roboczym etapu:** zagnieżdżona sesja
Claude Code odrzuca **każdy** zapis pod `.claude/` jako plik chroniony, a sesja nieinteraktywna nie
ma jak tego zatwierdzić. Pierwsza próba inicjalizacji w `.claude/relai/work/.../sklep-demo`
zakończyła się odmową zapisu ośmiu plików; projekt przeniesiono poza `.claude/` i przebieg poszedł
bez zmian w prompcie.

## b) Przebiegi — krok po kroku, z promptami i liczbą prób

Zapis każdego kroku: `.claude/relai/work/PIERWSI_UZYTKOWNICY/E1/zapis/` (katalog roboczy, kasowany
przy zamknięciu etapu; liczby przed i po są we wpisie dziennika z 2026-09-12).

### Przebieg bohatera — „plan, etapy, świeża sesja etapu"

| # | Prompt wklejony dosłownie | Wynik | Próby |
|---|---|---|---|
| 1 | „Zacznijmy projekt RelAI w tym folderze. Zgadzam się na utworzenie struktury. Jeśli masz pytania startowe, przyjmij odpowiedzi: język polski, profil aplikacja, testy tylko krytycznych ścieżek. Nie pytaj o nic więcej i wykonaj inicjalizację." | `CLAUDE.md` + sześć dokumentów w `docs/`; `README.md` nietknięty (dołączenie niedestrukcyjne) | 2 (pierwsza odbita ochroną `.claude/`) |
| 2 | „Przygotuj plan wdrożenia płatności w tym sklepie. Jeśli będziesz pytać o rodzaj, format albo model: pełny PLAN z etapami, format Markdown, jeden model Opus do wszystkich etapów. Nie pytaj o nic więcej." | `docs/plany/PLATNOSCI/PLAN.md` + `STATUS.md`, pięć etapów, cztery bramki manualne | 1 |
| 3 | „Akceptuję plan." | status `ZAAKCEPTOWANY 2026-09-12`, E1 → `GOTOWY DO STARTU`, `PROMPT_ETAP_1.md` wygenerowany | 1 |
| 4 | „Kontynuujemy pracę." — **świeża sesja, bez `--continue`** | akapit „gdzie jesteśmy" + wskazanie E1 i pliku promptu + propozycja następnego kroku | 1 |
| 5 | „/relai-stage" — **świeża sesja** | karta potwierdzenia: plan, etap `E1 z E5`, model, katalog roboczy, 11 punktów weryfikacji, pytanie „Zaczynamy?" | 1 |

Kroki 1–3 to jedna sesja (`claude -p --continue`), kroki 4 i 5 to **osobne, świeże sesje** bez
przekazywania treści rozmowy.

### Przebieg zapasowy — „decyzja przeżywa sesję" (sekcja 5 planu)

| # | Prompt | Wynik | Próby |
|---|---|---|---|
| 6 | „Zapisz decyzję: używamy lokalnych plików zamiast zewnętrznej bazy danych, ponieważ projekt ma działać offline. Zapisz ją tam, gdzie należy, i pokaż mi powstały zapis." | decyzja **D-01** w `docs/DECYZJE.md` + wpis w dzienniku + podsekcja w `STATE.md` | 1 |
| 7 | „Dlaczego trzymamy dane w plikach lokalnych, a nie w bazie? Podaj powód i plik źródłowy." — **świeża sesja** | powód (praca offline) + źródło wskazane jako `docs/DECYZJE.md:8`, decyzja D-01 | 1 |

Wynik pozytywny. Gdyby był negatywny, stałby tutaj w tym samym kształcie — brak wyniku jest wynikiem
próby, nie powodem do ustawienia odpowiedzi.

## c) Tabela pokrycia klatek

Każda klatka pokazująca plik albo odpowiedź agenta ma wskazane miejsce w zapisie. Instrument:
`render/pokrycie.js` (katalog roboczy), uruchamiany komendą `node pokrycie.js`.

| Element na klatce | Scena | Zapis źródłowy | Stan |
|---|---|---|---|
| „Etap E1 „Zamówienie po stronie serwera" jest GOTOWY DO STARTU, prompt PROMPT_ETAP_1.md istnieje i nic go nie blokuje" | `sesja` | `zapis/04-swieza-sesja.txt` | POKRYTY |
| „Propozycja: uruchamiamy etap E1 komendą /relai-stage" | `sesja` | `zapis/04-swieza-sesja.txt` | POKRYTY |
| „Zamówienie po stronie serwera z kwotą liczoną na serwerze" | `plan` | `zapis/05-karta-etapu.txt` | POKRYTY |
| „Weryfikacja — 11 punktów" | `plan` | `zapis/05-karta-etapu.txt` | POKRYTY |
| `docs/plany/PLATNOSCI/PROMPT_ETAP_1.md` | `plan`, `sesja`, `zamrozenie` | `zapis/plan-status.md` | POKRYTY |
| `docs/plany/PLATNOSCI/STATUS.md` | `plan`, `zamrozenie` | `zapis/plan-status.md` | POKRYTY |
| Nazwy etapów E1–E5 i ich statusy | `plan` | `zapis/plan-status.md` | POKRYTE (5/5) |

**Wynik pomiaru: 11/11 pokrytych, 0 bez pokrycia.** Kontrola pozytywna instrumentu: podłożony cytat
„Etap E9 „Integracja z bankiem centralnym" jest ZREALIZOWANY", którego w zapisie nie ma, został
zgłoszony jako `BEZ POKRYCIA` — bez tej kontroli zielony wynik nie znaczyłby nic.

Dwie rzeczy, które instrument musiał się nauczyć po drodze (oba trafienia były fałszywe, nie
treściowe): zapis terminala niesie ozdoby markdown (`` `GOTOWY DO STARTU` ``, `**Weryfikacja**`),
których scena nie ma, więc normalizacja je zdejmuje. Jedno trafienie było **prawdziwe**: scena
kończyła zdanie kropką tam, gdzie w zapisie biegło dalej — kropka wypadła, cytat jest dosłowny.

**Napisy angielskie nie są sprawdzane instrumentem** — to tłumaczenie tych samych zdań, nie nowa
teza; zgodność treści sprawdzona odczytem, nie pomiarem.

## d) Ograniczenia materiału — co pokazuje, a czego nie dowodzi

- **To odtworzenie zmierzonego przebiegu, nie nagranie ekranu.** Klatki są renderowane z zapisu
  prawdziwych sesji; żadna wypowiedź modelu nie została dopisana ani przeredagowana poza zdjęciem
  ozdób markdown.
- **Nie jest dowodem niezawodności.** Pokazuje przebieg, który się udał, z liczbą prób wypisaną
  w tabeli wyżej. Inicjalizacja wymagała drugiej próby po odmowie zapisu pod `.claude/`.
- **Nie dowodzi niższego całkowitego kosztu kontekstu** ani przewagi nad pamięcią natywną narzędzia.
  Materiał pokazuje ciągłość procesu: plan jako dokument, etapy, świeżą sesję wracającą do pracy.
- **Ochrona konfiguracji jest doradcza, nie twarda.** `config-protection` zwraca werdykt `ask`, więc
  zatrzymuje zapis tylko wtedy, gdy tryb uprawnień sesji ten werdykt egzekwuje — w sesji
  z automatyczną akceptacją edycja cudzej sekcji niemutowalnej przeszła bez pytania (pomiar
  2026-09-04). Materiał **nie** obiecuje twardej blokady. Skan sekretów tego problemu nie ma —
  używa `deny`.
- **Wersja z przebiegu to 2.1.3**, czyli ta instalowalna publicznie w dniu pomiaru. Niesie P-013
  (zdublowany kontekst startu, błąd schematu `SessionEnd`) — wada naprawiona w 2.1.4, niewydanej.
  Objawy P-013 nie są widoczne w materiale: dotyczą kontekstu wstrzykiwanego do sesji i strumienia
  błędów, a nie treści odpowiedzi pokazywanych na klatkach.
- **Kontrola układu mierzy wyrenderowane klatki, nie kod.** Wynik: 0 elementów wychodzących poza
  kontener i 0 tekstów uciętych bez zamiaru na **wszystkich** scenach obu cięć i obu wersjach
  językowych; kontrola pozytywna na scenie z celowym przepełnieniem zgłosiła 1 trafienie
  (+1199 px).
- **Osadzenie GIF-a na żywym GitHubie pozostaje NOT TESTED** — wymaga pusha, czyli dyspozycji
  właściciela. Do tego czasu sprawdzony jest wyłącznie podgląd lokalny (L-0075: grafikę ocenia się
  na stronie, która ją pokazuje).

## e) Jak odtworzyć render od zera

Projekt renderu żyje w katalogu roboczym etapu (`.claude/relai/work/PIERWSI_UZYTKOWNICY/E1/render/`)
i **nie wchodzi do repozytorium** — decyzja o trwałym miejscu źródeł należy do E3 (Aneks A, ryzyko
A2). Odtworzenie:

1. `npm install` — `@remotion/cli` i `remotion` **4.0.393**, `react` i `react-dom` **19.0.0**
   (179 pakietów, 12 s — FAKT). Remotion nosi własny kompozytor, więc `ffmpeg` nie jest potrzebny;
   pierwsze uruchomienie dociąga Headless Shell (102 MB) do cache'u poza projektem.
2. Fonty: `public/fonty/` — osiem plików `woff2` z `docs/zasoby/fonts/` (po dwa podzbiory na rodzinę:
   `latin` i `latin-ext`). **Podzbiór `latin-ext` jest obowiązkowy** — polskie znaki diakrytyczne
   siedzą tylko tam, a bez niego tytuł renderuje się z przekręconymi glifami (zmierzone na scenie
   `plan`: „płatności" wyszło jako „płatnosći").
3. Renderowanie:
   ```
   npx remotion render src/index.js demo-25-pl out/demo-relai-25s-pl.gif --codec=gif --every-nth-frame=3
   npx remotion render src/index.js demo-60-pl out/demo-relai-60s-pl.mp4
   ```
   To samo z `-en` dla wersji angielskiej. Kompozycje: `demo-60-*` 1920×1080, 1800 klatek, 30 kl./s
   (60,00 s); `demo-25-*` 960×540, 750 klatek, 30 kl./s (25,00 s), w GIF-ie co trzecia klatka →
   10 kl./s.
4. Pomiary: `node pokrycie.js` (pokrycie cytatów) oraz kontrola układu wypisywana przy renderze
   z `--log=verbose` jako linie `KONTROLA_UKLADU scena=… przepelnienia=… uciete=…`. Kontrola
   pozytywna układu: kompozycja `kontrola-pozytywna`.

**Wagi plików wynikowych** (`ls -la`, 2026-09-12): GIF PL 4,83 MB, GIF EN 4,77 MB, MP4 PL 7,17 MB,
MP4 EN 7,10 MB. Próg dla GIF-a w README: **≤ 5 MB** (SZACUNEK — przyjęty dla czasu wczytania strony
repozytorium), sprawdzany komendą `ls -la docs/zasoby/demo/*.gif`.

## Kierunek wizualny — bramka kalibracji

Bramka „kalibracja smaku" z Aneksu A została **rozstrzygnięta 2026-09-12**: Łukasz zaakceptował
kierunek na jednej klatce kluczowej — ciepły papier, zaokrąglone karty w lekkim szkle, Caveat jako
akcent odręczny, chipy etapów, zaginana strzałka jako spoiwo między sesjami. Cztery kierunki
odrzucone na stałe (skóra terminala, panel administracyjny, blueprint, plakat brutalistyczny) nie
wróciły ani jako wariant, ani jako inspiracja.

Korekta z tej samej rozmowy weszła jako **L-0094**: klatka powstała najpierw jako SVG z ręcznie
stawianymi współrzędnymi i dwa napisy wyszły poza karty. Kompozycja została przebudowana na HTML
z `grid`/`flex` i jednostkami kontenera (`cqw`), z jednym modułem tokenów (`render/src/styl.js`)
dla wszystkich scen — scena nie ma prawa użyć wartości dosłownej.

RelAI (Opus 5) + Lukasz
