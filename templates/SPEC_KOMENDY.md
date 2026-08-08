# SPEC — `docs/KOMENDY.md`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Wygeneruj `docs/KOMENDY.md` **w języku
projektu** (`docs/COMMANDS.md` dla projektu angielskiego).

## Rola

Ściąga: co użytkownik może powiedzieć albo wpisać, żeby coś się stało. Jedyne źródło prawdy o
komendach i frazach RelAI w tym projekcie — przyszła komenda `/relai-help` będzie ten plik
prezentować, a nie duplikować (D-07).

## Odbiorca

Użytkownik (człowiek). Język prosty, opisy przez efekt, nie przez mechanikę.

## Zasada nadrzędna: generowany ze stanu faktycznego

Plik zawiera **wyłącznie to, co w zainstalowanej wersji pluginu naprawdę działa**. Nie wpisujesz
komend zapowiedzianych, planowanych ani „wkrótce". Obietnica w ściądze jest gorsza niż jej brak:
użytkownik traci zaufanie do całego zestawu.

Na końcu pliku dopisujesz jedno zdanie: lista rośnie z kolejnymi wersjami RelAI, aktualna wersja
projektu jest w `docs/USTAWIENIA.md`.

## Struktura sekcji

1. **Nagłówek** — `# KOMENDY — <nazwa projektu>` + linia `RelAI <wersja>`.
2. **Zdanie wstępne** — że nic z tej listy nie jest obowiązkowe: RelAI działa w zwykłej rozmowie,
   a komendy są skrótem dla rzadszych operacji (D-22).
3. **Komendy** — tabela `Komenda | Co robi | Kiedy użyć`. Tylko działające.
4. **Frazy naturalne** — tabela `Powiesz | Co się stanie`. Frazy w języku projektu. Tylko działające.
5. **Czego RelAI pilnuje bez proszenia** — punkty o zachowaniach automatycznych działających w tej
   wersji (np. aktualizacja dokumentów w ramach ukończenia zadania). Lista rośnie z wersjami;
   typowo 5–10 pozycji. Punkt o zachowaniu, którego jeszcze nie ma, nie istnieje.
6. **Stopka** — jedno zdanie o rosnącej liście + odsyłacz do `docs/USTAWIENIA.md` po numer wersji.

## Polityka aktualizacji

| Kiedy | Co robisz |
|---|---|
| Aktualizacja pluginu do wyższej wersji | regenerujesz plik ze stanu faktycznego nowej wersji, zmieniasz numer w nagłówku |
| Lokalne nadpisanie zachowania w projekcie | dopisujesz wiersz z jawnym oznaczeniem „lokalne" |
| Cokolwiek innego | plik zostaje bez zmian — nie jest miejscem na notatki |

Plik jest **regenerowany**, nie edytowany ręcznie. Wyjątkiem są wiersze oznaczone jako lokalne —
te przeżywają regenerację (D-62: lokalne nadpisania mają pierwszeństwo).

## Zakres wersji 0.6.0 (E6) — co realnie działa

Od 0.4.0 działa **pierwsza komenda** — `/relai-stage` — i wygenerowany `KOMENDY.md` ma tabelę
komend. W 0.5.0 doszło **osiem hooków**: sekcja „Czego RelAI pilnuje bez proszenia" urosła
o zachowania hooków (lista niżej). W 0.6.0 dochodzi **interaktywny plan HTML** i **nadpisanie
lokalne szablonu**. Działa:

- inicjalizacja struktury projektu (zgoda → trzy pytania → osiem dokumentów),
- rozpoznanie folderu, który już jest projektem RelAI,
- tryb gościa po odmowie (bez ponownego pytania),
- niedestrukcyjne dołączenie struktury do folderu z zawartością,
- rytuał startu sesji (ustalona kolejność czytania + akapit „gdzie jesteśmy"),
- definicja ukończenia: `STATE.md` i wpis w `DZIENNIK.md` w tej samej turze co zmiana, bez proszenia,
- rejestr lekcji: wpis po każdej korekcie bez pytania, propozycja graduacji przy powtórzeniu,
- rejestr decyzji: propozycja zamrożenia powracającego tematu, przechwytywanie fraz zamykających,
- dziedziczenie preferencji globalnych między projektami,
- trzy frazy rytualne (poniżej) w wariancie polskim i angielskim,
- naturalne prośby: „dodaj RelAI", „dołącz strukturę RelAI",
- **planowanie (od 0.3.1):** prośba o plan w zwykłej rozmowie → `docs/plany/<TEMAT>/PLAN.md`
  + `STATUS.md` + linia „Aktywny plan" w `CLAUDE.md`; drobne zadanie → miniplan w dzienniku;
  jedno pytanie o rodzaj, format i model wykonawczy etapów (potem brane z ustawień); zamrożenie
  planu po akceptacji i zmiany wyłącznie datowanymi aneksami; zamknięcie planu z archiwizacją,
- **etapy (od 0.4.0):** akceptacja planu tworzy `PROMPT_ETAP_1.md`; komenda `/relai-stage`
  wykrywa plan i następny etap, pokazuje potwierdzenie i czeka; zamknięcie etapu aktualizuje
  `STATUS.md`, dopisuje wpis do dziennika i **generuje prompt następnego etapu**; brakujący prompt
  jest wyłapywany na starcie sesji; po ostatnim etapie plan zamyka się sam,
- **hooki (nowe w 0.5.0), do sekcji „Czego RelAI pilnuje bez proszenia":** blokada zapisu sekretu
  (klucz API, token, JWT, klucz prywatny, `PASSWORD=`/`SECRET=` z wartością) do pliku śledzonego —
  sekret może trafić wyłącznie do `.env` objętego `.gitignore`; zmiana sekcji niemutowalnej
  `CLAUDE.md` albo `USTAWIENIA.md` wymaga jawnego zatwierdzenia; przypomnienie, gdy zmiana kodu
  zostaje bez aktualizacji `STATE`/`DZIENNIK`; ostrzeżenie o `console.log`/`debugger` w kodzie
  produkcyjnym; ostrzeżenie tsc/eslint, gdy projekt ma te narzędzia; przypomnienie o spójności
  z `DESIGN.md`, gdy plik istnieje; ciche formatowanie Prettierem, gdy projekt go ma; na starcie
  sesji: data dnia, kontrola wersji projekt↔plugin, wymuszenie rytuału startu i siatka brakujących
  promptów etapowych — nawet bez wyzwolenia skilla,
- **plan główny w HTML (nowe w 0.6.0):** gdy preferencja formatu mówi „HTML", plan powstaje jako
  jeden samowystarczalny plik `PLAN.html` — zwijane sekcje, diagram, wykres, symulator wyliczeń,
  zero połączeń z internetem; `STATUS.md`, prompty etapowe i miniplany zostają w Markdown,
- **własny styl planów (nowe w 0.6.0):** przy pierwszym planie HTML pada pytanie o zmianę wyglądu;
  zgoda tworzy kopię szablonu w `docs/zasoby/HTML_PLAN/`, która **ma pierwszeństwo** przed wersją
  z pluginu i przeżywa jego aktualizacje.

Czego w 0.6.0 **nie** ma: pozostałych komend `/relai-*` — nie wpisujesz ich do `KOMENDY.md`.

Wygenerowany `KOMENDY.md` w wersji 0.6.0 zawiera **tabelę komend z jedną pozycją** oraz tabelę
fraz naturalnych:

| Komenda | Co robi |
|---|---|
| `/relai-stage [TEMAT] [EN]` | uruchamia etap planu: wykrywa aktywny plan i następny etap, pokazuje potwierdzenie i czeka na zgodę; bez argumentów bierze etap `GOTOWY DO STARTU` |

| Fraza (PL / EN) | Co się stanie |
|---|---|
| „kończymy na dziś" / „wrapping up" | rytuał zamknięcia: sync dokumentów, wpis w dzienniku, aktualizacja ryzyk, propozycja commita, podsumowanie |
| „kontynuujemy pracę" / „let's continue" | odtworzenie kontekstu z dokumentów + akapit „gdzie jesteśmy" + propozycja najbliższego kroku |
| „sprawdź status" / „status check" | raport: stan, plany i etapy, otwarte ryzyka, zaległości dokumentacyjne |
| „przygotuj plan …" / „zaplanuj …" / „rozpisz to na etapy" / „make a plan" | plan w strukturze projektu: pełny PLAN z etapami albo miniplan w dzienniku — po jednym pytaniu o rodzaj, format i model |

## Zakazy

- Nie wpisujesz `/relai-backup`, `/relai-audit`, `/relai-handover`, `/relai-adopt`,
  `/relai-update`, `/relai-tour`, `/relai-changelog`, `/relai-help`, dopóki nie działają
  w zainstalowanej wersji.
- Nie dopisujesz fraz spoza listy działających w danej wersji.
- Nie opisujesz mechaniki wewnętrznej (skille, hooki) — użytkownika interesuje efekt.

## Przykład dla wersji 0.6.0 (projekt polski)

```markdown
# KOMENDY — Parkly

RelAI 0.6.0

Nic z tej listy nie jest obowiązkowe. RelAI działa w zwykłej rozmowie — piszesz normalnie,
a struktura projektu nadąża. Komendy są skrótem do rzadszych operacji.

## Komendy

| Komenda | Co robi | Kiedy użyć |
|---|---|---|
| `/relai-stage` | znajduje aktywny plan i pierwszy etap gotowy do startu, pokazuje, co się wydarzy, i czeka na Twoje „zaczynamy" | na początku świeżej sesji, w której chcesz zrobić kolejny etap planu |
| `/relai-stage E5` · `/relai-stage PLATNOSCI E2` | to samo, ale dla wskazanego etapu (i planu) | gdy chcesz wrócić do etapu innego niż następny w kolejce |

## Frazy, które działają

| Powiesz | Co się stanie |
|---|---|
| „kończymy na dziś" / „wrapping up" | RelAI domyka dokumenty, zapisuje wpis w dzienniku, aktualizuje ryzyka, proponuje commit i podsumowuje sesję |
| „kontynuujemy pracę" / „let's continue" | RelAI odtwarza kontekst z dokumentów, mówi, gdzie jesteśmy, i proponuje najbliższy krok |
| „sprawdź status" / „status check" | krótki raport: stan projektu, plany i etapy, otwarte ryzyka, zaległości w dokumentach |
| „przygotuj plan…" / „zaplanuj…" / „rozpisz to na etapy" | powstaje plan w `docs/plany/` z wariantami, ryzykami i etapami — albo krótki miniplan w dzienniku, jeśli zadanie jest drobne |
| „dodaj RelAI" / „dołącz strukturę RelAI" | RelAI dołoży brakujące dokumenty, nie ruszając niczego, co już jest |

## Czego RelAI pilnuje bez proszenia

- Po każdej zmianie funkcjonalnej aktualizuje `STATE.md` i dopisuje wpis do `DZIENNIK.md` — w tej
  samej turze, bez przypominania.
- Po każdej Twojej korekcie zapisuje lekcję w `LEKCJE.md`; gdy ta sama uwaga wraca, proponuje wpisać
  ją na stałe do reguł projektu.
- Gdy ten sam temat rozstrzygasz drugi raz tak samo, proponuje zamrozić to jako decyzję.
- O format planów i model wykonawczy etapów pyta raz — potem bierze odpowiedź z ustawień.
- Plan główny składa w jednym pliku HTML, który otwierasz dwuklikiem i wysyłasz dalej — działa bez
  internetu. Przy pierwszym takim planie pyta raz, czy chcesz inny styl; Twoja wersja szablonu
  zostaje w projekcie i wygrywa z domyślną także po aktualizacji RelAI.
- Zaakceptowanego planu nie przepisuje: zmiana wchodzi jako datowany aneks, żeby było widać, co
  uzgodniliście pierwotnie.
- Po zaakceptowaniu planu przygotowuje prompt pierwszego etapu, a po zamknięciu każdego etapu —
  prompt następnego. Kolejną sesję zaczynasz od `/relai-stage`, nie od tłumaczenia, co dalej.
- Gdy poprzednia sesja urwała się w połowie zamykania etapu, mówi o tym na starcie następnej
  i proponuje uzupełnić brakujący prompt.
- Po ostatnim etapie zamyka plan sam: aktualizuje stan, pisze wpis „co dowieziono vs plan"
  i przenosi plan do archiwum.
- Nie nadpisuje i nie kasuje plików, których sam nie utworzył.
- **Blokuje** zapis klucza, tokenu albo hasła do pliku trafiającego do repozytorium — sekret może
  wylądować wyłącznie w `.env`, którego git nie śledzi.
- Zmiana zamrożonych reguł projektu (`CLAUDE.md` — sekcja niemutowalna, `USTAWIENIA.md`) wymaga
  Twojego zatwierdzenia — RelAI zapyta, zanim cokolwiek zmieni.
- Przypomina, gdy zmiana kodu została bez wpisu w dzienniku i aktualizacji stanu.
- Ostrzega przed `console.log` zostawionym w kodzie produkcyjnym; gdy projekt ma TypeScript albo
  ESLint — pokazuje ich błędy zaraz po edycji pliku.
- Na starcie każdej sesji sam podaje dzisiejszą datę, sprawdza wersję projektu i przypomina
  o niedokończonym etapie planu — nawet jeśli nic nie napiszesz.
- Nie zakłada repozytorium gita wewnątrz innego repozytorium.

Lista rośnie z kolejnymi wersjami RelAI. Numer wersji tego projektu znajdziesz
w [USTAWIENIA.md](USTAWIENIA.md).
```
