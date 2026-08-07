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
5. **Czego RelAI pilnuje bez proszenia** — 3–6 punktów o zachowaniach automatycznych działających
   w tej wersji (np. aktualizacja dokumentów w ramach ukończenia zadania). Punkt o zachowaniu,
   którego jeszcze nie ma, nie istnieje.
6. **Stopka** — jedno zdanie o rosnącej liście + odsyłacz do `docs/USTAWIENIA.md` po numer wersji.

## Polityka aktualizacji

| Kiedy | Co robisz |
|---|---|
| Aktualizacja pluginu do wyższej wersji | regenerujesz plik ze stanu faktycznego nowej wersji, zmieniasz numer w nagłówku |
| Lokalne nadpisanie zachowania w projekcie | dopisujesz wiersz z jawnym oznaczeniem „lokalne" |
| Cokolwiek innego | plik zostaje bez zmian — nie jest miejscem na notatki |

Plik jest **regenerowany**, nie edytowany ręcznie. Wyjątkiem są wiersze oznaczone jako lokalne —
te przeżywają regenerację (D-62: lokalne nadpisania mają pierwszeństwo).

## Zakres wersji 0.3.1 (E3) — co realnie działa

Komend `/relai-*` w tej wersji **nadal nie ma** — dochodzą w kolejnych. Działa:

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
- **planowanie (nowe w 0.3.1):** prośba o plan w zwykłej rozmowie → `docs/plany/<TEMAT>/PLAN.md`
  + `STATUS.md` + linia „Aktywny plan" w `CLAUDE.md`; drobne zadanie → miniplan w dzienniku;
  jedno pytanie o rodzaj, format i model wykonawczy etapów (potem brane z ustawień); zamrożenie
  planu po akceptacji i zmiany wyłącznie datowanymi aneksami; zamknięcie planu z archiwizacją.

Czego w 0.3.1 **nie** ma po stronie planowania: promptów etapowych `PROMPT_ETAP_N`, komendy
`/relai-stage` i interaktywnego szablonu HTML planów — plany powstają w Markdown.

Wygenerowany `KOMENDY.md` w wersji 0.3.1 **nadal nie zawiera tabeli komend** — zawiera sekcję
„Komend jeszcze nie ma" oraz **tabelę fraz naturalnych**:

| Fraza (PL / EN) | Co się stanie |
|---|---|
| „kończymy na dziś" / „wrapping up" | rytuał zamknięcia: sync dokumentów, wpis w dzienniku, aktualizacja ryzyk, propozycja commita, podsumowanie |
| „kontynuujemy pracę" / „let's continue" | odtworzenie kontekstu z dokumentów + akapit „gdzie jesteśmy" + propozycja najbliższego kroku |
| „sprawdź status" / „status check" | raport: stan, plany i etapy, otwarte ryzyka, zaległości dokumentacyjne |
| „przygotuj plan …" / „zaplanuj …" / „rozpisz to na etapy" / „make a plan" | plan w strukturze projektu: pełny PLAN z etapami albo miniplan w dzienniku — po jednym pytaniu o rodzaj, format i model |

## Zakazy

- Nie wpisujesz `/relai-stage`, `/relai-backup`, `/relai-audit`, `/relai-handover`, `/relai-adopt`,
  `/relai-update`, `/relai-tour`, `/relai-changelog`, `/relai-help`, dopóki nie działają
  w zainstalowanej wersji.
- Nie dopisujesz fraz spoza listy działających w danej wersji.
- Nie opisujesz mechaniki wewnętrznej (skille, hooki) — użytkownika interesuje efekt.

## Przykład dla wersji 0.3.1 (projekt polski)

```markdown
# KOMENDY — Parkly

RelAI 0.3.1

Nic z tej listy nie jest obowiązkowe. RelAI działa w zwykłej rozmowie — piszesz normalnie,
a struktura projektu nadąża. Komendy są skrótem do rzadszych operacji.

## Komend jeszcze nie ma

Wersja 0.3.1 to rdzeń dokumentacyjny i planowanie. Komendy `/relai-*` dochodzą w kolejnych wersjach.

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
- Zaakceptowanego planu nie przepisuje: zmiana wchodzi jako datowany aneks, żeby było widać, co
  uzgodniliście pierwotnie.
- Nie nadpisuje i nie kasuje plików, których sam nie utworzył.
- Nie zapisuje kluczy ani haseł w plikach trafiających do repozytorium.
- Nie zakłada repozytorium gita wewnątrz innego repozytorium.

Lista rośnie z kolejnymi wersjami RelAI. Numer wersji tego projektu znajdziesz
w [USTAWIENIA.md](USTAWIENIA.md).
```
