---
description: Adoptuje zastany projekt do struktury RelAI — pełny backup jako bramka, analiza kodu i historii, struktura wygenerowana z zastanego stanu, raport zmian z przetestowaną ścieżką pełnego cofnięcia
argument-hint: "[ŚCIEŻKA_BACKUPU] — opcjonalna, jednorazowa lokalizacja archiwum dla tego backupu"
---

# /relai-adopt — adopcja zastanego projektu

Argument (opcjonalny): `$ARGUMENTS`

Twoje zadanie: przenieść istniejący, żywy projekt na strukturę RelAI **bez utraty czegokolwiek**
i tak, żeby dało się to w całości cofnąć. To jedyna operacja RelAI, która dotyka cudzego projektu
(R3), dlatego sekwencja jest obowiązkowa i **bez luk** (D-70): backup → analiza → plan zmian →
zgoda → generacja → raport. Lepiej adopcja przerwana niż adopcja z luką.

Komenda działa **wyłącznie na jawne wywołanie** (D-70). Nie proponujesz jej sam, nie uruchamiasz
z rytuału startu, nie wykonujesz „przy okazji".

---

## Krok 0 — rozpoznanie stanu folderu

1. **Marker RelAI** — `docs/USTAWIENIA.md` (albo odpowiednik) z linią `Wersja RelAI:` → ten
   projekt już jest projektem RelAI; adopcja nie ma czego robić. Jedno zdanie (różnicę wersji
   obsługuje `/relai-update`) i koniec.
2. **Marker gościa** — `.claude/relai.json` z `"mode":"guest"` → wywołanie tej komendy jest jawną
   prośbą użytkownika, więc marker przestaje obowiązywać: usuń go i kontynuuj.
3. **Folder pusty** (poza `.git/`, `.claude/`, `.vscode/`, `.idea/`, `.gitignore`,
   `.gitattributes`, `LICENSE`) → nie ma czego adoptować; wskaż zwykłą inicjalizację RelAI
   (skill `relai-core`) i zakończ.
4. Cokolwiek innego → folder z zawartością, właściwy przypadek tej komendy.

## Krok 1 — backup: bramka, nie zalecenie

**Przed jakimkolwiek innym działaniem** wykonaj kopię zapasową **procedurą komendy
`/relai-backup`** (kroki 1–5 tamtej komendy: lokalizacja → nazwa → wykluczenia → spakowanie →
weryfikacja archiwum). Nie piszesz drugiego mechanizmu backupu (D-43) — używasz istniejącego,
z dwiema różnicami wynikającymi z tego, że projekt **nie jest jeszcze** projektem RelAI:

- krok 0 tamtej procedury (kontrola markera) pomijasz — właśnie dlatego, że markera nie ma;
- krok 6 (wpis w dzienniku) pomijasz — dziennik jeszcze nie istnieje; backup opiszą wpis zerowy
  dziennika i raport adopcji po generacji.

Argument tej komendy (`$ARGUMENTS`) przekazujesz procedurze backupu jako jednorazową lokalizację
docelową.

**Bramka.** Backup, którego nie da się utworzyć (brak lokalizacji i brak odpowiedzi, odmowa
dostępu, brak miejsca) albo który nie przechodzi weryfikacji z kroku 5 (nagłówek `PK`, lista
wpisów, dowód negatywny sekretów, rozmiar) → **przerywasz całą adopcję**: usuwasz wadliwe
archiwum, mówisz, co poszło nie tak, i **nie tworzysz ani jednego pliku struktury**. Stan
projektu po nieudanej próbie jest identyczny jak przed nią.

Po udanym backupie zanotuj do raportu: pełną ścieżkę archiwum, rozmiar, liczbę wpisów oraz stan
gita sprzed adopcji (`git log -1`: hash, data, tytuł) — albo fakt, że gita nie ma.

## Krok 2 — analiza (nic jeszcze nie zapisujesz)

Zbierz, z czego będzie generowana struktura:

| Źródło | Co z niego bierzesz |
|---|---|
| kod | języki, struktura katalogów, punkty wejścia, manifesty (`package.json`, `pyproject.toml`…) |
| zastane dokumenty | `README.md`, `CLAUDE.md`, wszystko w `docs/` i luźne `.md` — co istnieje i o czym mówi |
| `git log` | od kiedy projekt żyje, ile commitów, autorzy, ostatnia aktywność |
| kolizje nazw | które pliki rdzenia RelAI już istnieją pod tymi samymi nazwami (np. własny `docs/STATE.md`) |
| sekrety | ślady sekretów w plikach śledzonych — zapisujesz **plik, linię i rodzaj, nigdy wartość** (D-42) |

Projekt bez gita → powiedz wprost, czego przez to nie wiadomo (historia, autorzy, punkt
odniesienia dla cofnięcia poza archiwum), i idź dalej. Nie inicjalizujesz gita bez zgody; jeśli
użytkownik zgodzi się w kroku 3 — `git init` wykonujesz **po** generacji, nigdy wewnątrz repo
nadrzędnego (D-53: zagnieżdżone repo są zakazane bezwzględnie).

**Auto-detekcja profilu** (D-50) — wygrywa sygnał najbardziej specyficzny:

| Sygnał w folderze | Profil |
|---|---|
| konfiguracje agentów głosowych (ElevenLabs, Vapi, Retell), katalog bazy wiedzy (`kb/`, `knowledge/`, `baza-wiedzy/`) | `agent-voice` |
| eksporty workflow n8n / Make (JSON z `nodes` + `connections`), katalog `workflows/` | `flow` |
| `package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `src/`, pliki źródłowe | `app` |
| wyłącznie dokumenty, prompty i szablony tekstowe | `prompty` |

Język projektu wykrywasz z zastanych dokumentów i commitów; wątpliwość → pytanie w kroku 3.

## Krok 3 — plan zmian i zgoda: druga bramka

Pokaż użytkownikowi **pełny plan zmian**, zanim powstanie pierwszy plik:

1. **Co powstanie** — lista plików rdzenia (te, których nie ma): `CLAUDE.md` / `README.md` /
   `docs/STATE.md`, `DZIENNIK.md`, `LEKCJE.md`, `DECYZJE.md`, `USTAWIENIA.md`, `KOMENDY.md`
   (nazwy w języku projektu).
2. **Co zostanie scalone** — istniejący `CLAUDE.md` (procedura w kroku 5); przy każdym wykrytym
   **konflikcie reguł** zadajesz tu pytanie: zastana reguła czy reguła RelAI. Konfliktu nie
   rozstrzygasz sam — nigdy (D-71).
3. **Co pójdzie do archiwum** — zastane pliki kolidujące nazwą z rdzeniem RelAI: każdy dostanie
   adnotację „NIEAKTUALNE — zastąpione przez X, dnia Y, powód Z" i miejsce w `docs/archiwum/`
   (D-18). Kasowanie nie istnieje.
4. **Czego nie ruszamy** — kod (ani jednego bajta), zastany `README.md`, dokumenty użytkownika
   spoza kolizji, konfiguracje narzędzi.
5. **Wykryte wartości** — język, profil (z uzasadnieniem detekcji); to, czego nie dało się
   wykryć, jest tu pytaniem.
6. **Commit na koniec** — jeśli projekt ma gita: propozycja `chore: adopt RelAI project
   structure`; jeśli nie ma — propozycja `git init` (opcjonalna, z konsekwencją D-53).

**Czekasz na zgodę.** Zgoda może być częściowa (np. bez commita). Zgoda wyrażona z góry w treści
polecenia („zgadzam się na standardowy plan adopcji") jest zgodą — plan i tak pokazujesz, przed
zapisem. Odmowa albo brak odpowiedzi → **zero zmian w projekcie**; powiedz, że archiwum backupu
zostało (jest nieszkodliwe) i gdzie leży.

## Krok 4 — specyfikacje: jawne wczytanie skilla

Generacja wymaga specyfikacji dokumentów z `.claude/relai/templates/`. Komenda nie ładuje skilla
sama z siebie (L-0015), a folder przed adopcją nie jest projektem RelAI, więc hook nie dostarczył
kopii na starcie sesji. Dlatego **wywołaj teraz narzędziem `Skill` skill `relai-core`** — hook
`session-context` przy tym wywołaniu skopiuje specyfikacje do `.claude/relai/templates/`.

Kopii nadal nie ma po wywołaniu → **zatrzymaj adopcję** (struktura nie powstaje z pamięci —
D-60) i poproś o sesję z `--add-dir` na katalog pluginu (L-0023). Backup zostaje, projekt jest
nietknięty.

## Krok 5 — generacja z zastanego stanu

Kolejność wykonania (najpierw zmiana, potem zdanie, które ją opisuje — L-0014):

1. **Kolizje do archiwum** — zgodnie z planem z kroku 3: adnotacja na górze pliku + przeniesienie
   do `docs/archiwum/`.
2. **`docs/USTAWIENIA.md`** — wg `SPEC_USTAWIENIA.md`: marker `Wersja RelAI: <wersja pluginu>`
   z datą adopcji; wiersze z datą dzisiejszą: język, git, profil (wartość maszynowa na początku
   komórki: `app`, `agent-voice`, `flow` albo `prompty`), każdy z dopiskiem „wykryte przy
   adopcji" albo „wybrane przy adopcji".
3. **`docs/STATE.md`** — wg `SPEC_STATE.md`, ale **z zastanego stanu, nie z pustki**: warstwa
   nietechniczna opisuje, co ten projekt robi i na jakim jest etapie (z analizy kroku 2);
   faktografia — realne wersje, środowiska, linki. STATE świeżo po adopcji ma opisywać projekt,
   który istnieje od dawna.
4. **`docs/DZIENNIK.md`** — wg `SPEC_DZIENNIK.md`, z **wpisem zerowym** zamiast pustej sekcji:
   streszczenie tego, co było przed adopcją (od kiedy projekt żyje, ile commitów, co ostatnio —
   z `git log`; bez gita: co wynika z plików), oraz zapis samej adopcji: ścieżka i weryfikacja
   backupu, odsyłacz do raportu. Wykryte ślady sekretów → „Do zrobienia przez człowieka"
   (przenieść do `.env`), ze wskazaniem plik+linia, bez wartości.
5. **`docs/LEKCJE.md`, `docs/DECYZJE.md`** — puste, ale kompletne strukturalnie.
6. **`docs/KOMENDY.md`** — wg `SPEC_KOMENDY.md`, ze stanu faktycznego zainstalowanej wersji.
7. **`CLAUDE.md`** — scalanie (sekcja niżej) albo generacja wg `SPEC_CLAUDE_MD.md`, gdy go nie
   było. Sekcja `## Reguły profilu (<profil>)` wg `SPEC_PROFILE.md` — zawsze.
8. **`README.md`** — istnieje → **nie ruszasz go w ogóle**; brak → generujesz wg `SPEC_README.md`.
9. **Dokumenty warunkowe profilu** — **nie powstają** przy adopcji (D-10). Adopcja jest
   odpowiednikiem inicjalizacji: `ARCHITEKTURA.md`, `DESIGN.md`, snapshoty i `ARTEFAKTY.md`
   pojawią się przy pierwszym zdarzeniu, nie dziś — nawet jeśli kod już istnieje.

### Scalanie `CLAUDE.md` (D-71) — jedyne miejsce tej procedury

Istniejący `CLAUDE.md` **scalasz, nigdy nie nadpisujesz**:

1. **Kopia całości** do `docs/archiwum/CLAUDE_PRZED_ADOPCJA.md`: na górze blockquote z adnotacją
   (skąd, kiedy, dlaczego), pod nim pełna treść oryginału **w niezmienionym brzmieniu**.
2. **Nowy `CLAUDE.md`** wg `SPEC_CLAUDE_MD.md`, z dodatkową sekcją `## Zasady projektu
   (odziedziczone)` umieszczoną po „Regułach profilu": trafiają tam wszystkie zastane reguły
   **dosłownie** — nie parafrazujesz, nie skracasz, nie „porządkujesz". Cytat reguły przed i po
   adopcji musi być identyczny.
3. **Konflikt** (zastana reguła sprzeczna z regułą RelAI) — rozstrzygnięcie użytkownika z kroku 3
   zapisujesz przy regule; sekcja odziedziczona nosi zwycięskie brzmienie z adnotacją
   o pierwszeństwie. Konflikt niezauważony w kroku 3, a wykryty teraz → wracasz z pytaniem,
   zanim zapiszesz plik.
4. Limit 60 linii `CLAUDE.md` **ustępuje wierności** sekcji odziedziczonej: nie tniesz cudzych
   reguł, żeby zmieścić się w limicie. Przekroczenie odnotowujesz w raporcie; porządki może
   kiedyś zaproponować `/relai-audit` — nie Ty, nie dziś.

## Krok 6 — raport adopcji

Wygeneruj `docs/RAPORT_ADOPCJI.md` wg `SPEC_RAPORT_ADOPCJI.md` (z lokalnej kopii specyfikacji):
backup, co powstało, co w archiwum, co scalono, czego nie ruszono, sekrety (wskazania), **pełne
cofnięcie** — procedura z realnymi ścieżkami tego projektu. Raport jest jedynym artefaktem, który
przeżyje tę sesję; pisz go dla człowieka, który za pół roku będzie miał tylko ten plik i archiwum.

## Krok 7 — commit i podsumowanie

- Zgoda z kroku 3 obejmowała commit → wykonaj: `chore: adopt RelAI project structure`
  (+ wcześniej `git init`, jeśli na to też była zgoda). Bez zgody — bez commita.
- Podsumowanie 3–5 zdań: co powstało, gdzie leży backup i raport, czego nie ruszono, od czego
  zacząć. Plus jedno zdanie: pełne cofnięcie jest opisane w raporcie i wymaga tylko archiwum.

---

## Zakazy tej komendy

- Nie uruchamiasz się z własnej propozycji — wyłącznie jawne wywołanie przez użytkownika (D-70).
- Nie zmieniasz, nie przenosisz i nie kasujesz **żadnego pliku kodu** — adopcja dotyka wyłącznie
  dokumentów struktury.
- Nie tworzysz ani jednego pliku przed przejściem obu bramek: weryfikacji backupu i zgody na plan
  zmian.
- Nie piszesz własnego mechanizmu backupu ani „szybkiej kopii" — wyłącznie procedura
  `/relai-backup` (D-43).
- Nie kasujesz niczego — zastąpiony dokument żyje w `docs/archiwum/` z adnotacją (D-18).
- Nie cytujesz wartości sekretów — plik, linia, rodzaj (D-42).
- Nie rozstrzygasz konfliktu reguł `CLAUDE.md` własnym osądem — zawsze pytaniem (D-71).
- Nie zakładasz repo w repo (D-53) i nie rozbijasz projektu na podprojekty.
- Nie generujesz dokumentów z pamięci, gdy nie ma specyfikacji (D-60).
- Nie tworzysz dokumentów warunkowych profilu „bo kod już jest" (D-10).
