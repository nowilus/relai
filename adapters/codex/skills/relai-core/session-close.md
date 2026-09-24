# relai-core — rytuał zamknięcia sesji

Plik doczytywany skilla `relai-core`. Otwierasz go, gdy użytkownik kończy sesję („kończymy na dziś", „wrapping up") albo gdy sam domykasz większą porcję pracy. Krok 2 (rotacja) ma własny plik: `document-rotation.md`.

## Zamknięcie sesji

Rytuał zamknięcia wykonujesz, gdy użytkownik powie, że kończycie (sekcja „Frazy naturalne" w `SKILL.md`), albo
gdy sam kończysz większą porcję pracy. Kolejność:

1. **Sync dokumentów** — przejrzyj, co się w tej sesji zmieniło, i domknij: `STATE.md`,
   `USTAWIENIA.md` (jeśli padły nowe preferencje), `LEKCJE.md` / `DECYZJE.md` (jeśli coś zostało
   niezapisane), `README.md` (jeśli zmienił się sposób uruchomienia). Tu też **policz pozycje
   sekcji „Zasady aktywne"** — sekcja niżej.
2. **Rotacja dokumentów** (od 1.2.0) — procedura w pliku `document-rotation.md`; otwórz go w tym
   kroku. Wykonujesz ją **przed** wpisem do dziennika,
   żeby wpis tej sesji opisał rotację i wylądował już w przyciętym pliku.
2a. **Sprzątanie artefaktów roboczych** (od 1.8.0) — sekcja niżej. Stoi **po** rotacji i **przed**
   wpisem, z tego samego powodu: wpis tej sesji ma opisać także sprzątanie. Numer `2a`, a nie `3`,
   jest świadomy — „krok 2" jest cytowany jako adres rotacji w kilku dokumentach i numeracji kroków
   1–6 nie ruszamy.
3. **Wpis do dziennika** — jeden wpis zbiorczy za sesję, na końcu sekcji „Wpisy". Sekcja
   „Zweryfikowane — jak dokładnie" musi mówić, czym i z jakim wynikiem sprawdzałeś; „nie
   weryfikowano" jest dopuszczalną treścią, brak sekcji nie jest.
4. **Ryzyka** — zaktualizuj tabelę „Stan otwartych ryzyk", jeśli któreś zamknięto, otwarto albo
   zmienił się jego poziom.
5. **Commit** — jeśli projekt ma gita i są niezacommitowane zmiany, zaproponuj commit
   z conventional message. Nie commituj bez zgody, poza commitem inicjalizacyjnym.
6. **Podsumowanie** — 3–5 zdań: co zrobione, co zweryfikowane, co czeka na człowieka, od czego
   zacząć następnym razem. Bez list zadań i bez obietnic terminów.

### Limit „Zasad aktywnych" — jedyny adres egzekwowania (krok 1, od 1.6.0)

Sekcja „Zasady aktywne" w `LEKCJE.md` ma twardy limit **15 pozycji** (`SPEC_LEKCJE.md`). Reguła
istniała od 0.2.0 i była łamana wszędzie, bo **nikt jej nie mierzył**: 46 pozycji tutaj, 930 linii
w projekcie po adopcji `FAKT` (2026-08-20). Ten krok jest jej **jedynym** adresem egzekwowania.

W kroku 1 rytuału zamknięcia policz pozycje **komendą, nie okiem** — sekcja bywa długa:

```
node -e "const s=require('fs').readFileSync('docs/LEKCJE.md','utf8').split(/^## /m).find(x=>/^Zasady aktywne|^Active rules/.test(x));console.log((s.match(/^\d+\.\s/gm)||[]).length)"
```

Wynik **powyżej limitu** → **jedno** zdanie w podsumowaniu sesji: ile pozycji, jaki limit i co z tym
zrobić (kompresja tematyczna albo graduacja do `CLAUDE.md` — obie za zgodą człowieka,
`SPEC_LEKCJE.md`). Wynik **w limicie** → **cisza**, ani jednego znaku.

**Drugiego adresu nie dokładasz** (L-0036, L-0049). W szczególności **nie** wchodzi to do raportu
budżetu startu sesji: raport odzywa się wyłącznie przy przekroczeniu **sumy** warstwy startowej,
więc projekt z 46 pozycjami mieszczący się w budżecie nie usłyszałby o limicie ani razu — a to jest
dokładnie ten przypadek, dla którego ten krok powstał. Jeden problem, jeden komunikat.


### Sprzątanie artefaktów roboczych (krok 2a rytuału zamknięcia, od 1.8.0)

Katalogi robocze etapów (`.claude/relai/work/<TEMAT>/E<N>/`) i pliki tymczasowe projektu rosną
**poza Gitem**. Ten krok jest ich adresem w rytuale zamknięcia — obok komendy `/relai-clean`,
zdania na starcie sesji i punktu weryfikacji etapu.

**Wyłącznik i próg:** wiersz `Artefakty robocze` w `docs/USTAWIENIA.md` (`SPEC_USTAWIENIA.md`).
Wiersz `wyłączone`, wartość nierozpoznana albo brak wiersza → tego kroku **nie wykonujesz** i nie
mówisz o nim ani słowa.

Przebieg — zawsze w tej kolejności:

1. **Zmierz** — `node .claude/relai/tools/clean-work.js raport`. Narzędzia nie ma → jedno zdanie,
   że wymaga restartu sesji (podkłada je hook startu), i przechodzisz do kroku 3 rytuału. **Nigdy**
   nie kopiujesz go ręcznie z katalogu pluginu.
2. **Pytaj wyłącznie o dwie rzeczy:** katalogi etapów i odnóg o statusie **zamkniętym**
   (`ZREALIZOWANY`, `POMINIĘTY`, `ZAMKNIĘTA`) oraz — gdy suma kandydatów przekracza próg — o całość
   ponad progiem. Katalog etapu **w toku**, pozycja chroniona bramką i wszystko poniżej progu bez
   zamkniętych etapów → **cisza**: ani pytania, ani zdania.
3. **Pytanie idzie partiami po cztery grupy**, tak jak w komendzie, i kasujesz **wyłącznie** po
   „tak" na daną grupę. Lista ścieżek pochodzi z pliku raportu, nie z przepisywania ręką.
4. **Zmierz ponownie** po operacji i weź obie liczby — przed i po — do wpisu tej sesji (krok 3).

**Ten krok nie produkuje własnego komunikatu.** Jedynym śladem jest wpis dziennika: jeden problem,
jeden komunikat (L-0036, L-0049). Zdanie na starcie sesji ma swojego właściciela — hook — i tutaj
się go nie powtarza.

**To jest krok 2a rytuału zamknięcia.** Pozostałe trzy momenty sprzątania: punkt weryfikacji przy
zamknięciu etapu, zdanie hooka na starcie sesji i komenda `/relai-clean` wywołana wprost. Wszystkie
cztery używają **tego samego** narzędzia i tego samego trybu: raport w grupach, jedno „tak" na
grupę, bramka dokumentacyjna.
---

## Pliki lokalne, których nie sprzątamy (od 1.8.0)

Sprzątanie artefaktów roboczych (`/relai-clean`) patrzy także na pliki **nieśledzone i ignorowane**
w repozytorium, a wśród nich stoją lokalne notatki i materiały właściciela, które nie są artefaktem
żadnego etapu. Chroni je flaga: linia-marker **`# relai: zachowaj`** (albo `# relai: keep`) w
`.gitignore` **nad** wzorcem — marker dotyczy następnej linii niebędącej komentarzem. Cały
`.git/info/exclude` jest chroniony bez markera, bo wykluczenie lokalne jest z definicji świadomym
wyborem właściciela; projekt bez gita trzyma listę w `.claude/relai/keep`, jedna ścieżka na linię.

**Reguła zachowania:** gdy dopisujesz do `.gitignore` wzorzec dla pliku, który jest lokalną notatką
albo materiałem właściciela — a nie artefaktem etapu ani plikiem regenerowalnym — stawiasz
linię-marker nad nim **w tej samej edycji**. Nie wiesz, którą rzeczą jest dany plik → pytasz jednym
zdaniem, zamiast zgadywać: marker dołożony za dużo tylko wycisza pytanie, brakujący marker prowadzi
do pytania o skasowanie czyjejś pracy.
