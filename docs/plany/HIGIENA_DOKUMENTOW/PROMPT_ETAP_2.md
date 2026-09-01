# PROMPT_ETAP_2 — Blokada mówi, a próg nie kłamie

Plan: HIGIENA_DOKUMENTOW • Etap: **E2 z E6** • Wygenerowano: 2026-09-01 (autor: Opus 5, przy
zamknięciu E1) • Wykonawca: **Opus** (D-85 — model wykonawczy etapów w tym projekcie)

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus**. Jeśli sesja działa na innym
> modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

> **Materiał pomiarowy.** Weryfikacja wymaga dziennika, w którym rotacja **stoi mimo przekroczenia
> progu**. Dziennik tego repozytorium nadaje się od dziś: **160,4 KB przy progu 150 KB**, 28 wpisów.
> Materiał zapasowy z cudzego projektu wyciągniesz bez `--add-dir`, jednym poleceniem:
> `git -C "C:/Users/Lukasz/Desktop/PolyFlow" show 6a330c1^:docs/DZIENNIK.md > "$TEMP/polyflow-przed.md"`.
> Pomiar prowadź **na kopiach poza repozytorium** — E1 pokazał, że to wystarcza.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, definicja ukończenia, sekcja niemutowalna |
| `docs/DZIENNIK.md` | sekcja „Stan otwartych ryzyk", sekcja „Czeka na człowieka" (9 pozycji otwartych) + ostatni wpis (E1 — na jego liczbach stoi ten etap) |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" |
| `docs/plany/HIGIENA_DOKUMENTOW/PLAN.html` | sekcje 5 (opisy poprawek 2 i „Próg liczony ponad nietykalnymi"), 6 (zakres E2), 8 (przypadki „same pozycje nietykalne ważą więcej niż próg" i „dziennik ponad progiem, ale wpisów mniej niż dziesięć") |
| `core/templates/SPEC_ARCHIWUM.md` | sekcje „Kiedy powstaje" (progi), „Wybór treści — co wolno przenieść", „Przypadki brzegowe" — **po zmianach z E1** |
| `core/templates/SPEC_USTAWIENIA.md` | wiersz `Budżet startu sesji` i jego progi cząstkowe — czytasz, **nie zmieniasz** |
| `core/process/session-signals.js` | `startCost` (ok. linia 490) i `startCostReport` (ok. linia 584) — dziś liczą budżet startu, nie progi rotacji |
| `adapters/claude-code/skills/relai-core/SKILL.md` | sekcja „Rotacja dokumentów (krok 2 rytuału zamknięcia)" — tu mieszka komunikat, który ten etap ma rozbudować |
| `adapters/cursor/rules/relai-core.mdc` | punkt 2 sekcji „Session close ritual" — ta sama treść po angielsku |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Progów nie ruszasz.** 150 KB / 50 KB / 12 KB zostają; problem jest w egzekwowaniu i w tym,
  **do czego** próg się porównuje, nie w liczbach (plan, sekcja 2 — nie-cele).
- **Nietykalność zostaje liczona w sztukach** (dziesięć najnowszych wpisów, dwadzieścia najnowszych
  lekcji). Zmienia się to, **z czym** porównujemy wynik: próg dotyczy części **rotowalnej**, a raport
  podaje obok niego **dolną granicę osiągalną** — wagę pozycji nietykalnych (plan, sekcja 5).
- **Cisza poniżej progu jest nienaruszalna.** Powyżej progu milczenie jest zakazane, bo ukrywa
  zatkany mechanizm. To rozstrzygnięcie z 1.2.0 i ten etap go nie zmienia.
- **Jeden problem, jeden komunikat** (L-0036, L-0049). Rotacja ryzyk nie dokłada własnego
  komunikatu, a limit „Zasad aktywnych" zostaje przy swoim adresie — kroku 1 rytuału zamknięcia.
- **E1 zniósł blokadę wpisu linkowanego.** Wpis, na który wskazuje otwarta pozycja „Czeka na
  człowieka", **nie jest** nietykalny — jego link jest przepinany na plik archiwum w fazie 2.
  Nie przywracasz tej blokady i nie opisujesz jej jako istniejącej.
- **Granica zakresu:** wymuszone pytanie o sprawy przeterminowane i wiersz `Przegląd spraw
  człowieka` w ustawieniach — **E3**. Raport startu jako adres progów, progi sekcji i katalog
  progów — **E4**. Ryzyka i ustawienia w archiwum — **E5**. Podbicie wersji do 1.7.0
  i `/relai-update` — **E6**. W tym etapie nie dotykasz żadnej z tych rzeczy i niczego z nich nie
  obiecujesz w dokumentach.

## Stan wyjściowy (co realnie zastajesz)

Repozytorium na **1.6.1**, plugin zainstalowany globalnie w tej samej wersji. Plan
HIGIENA_DOKUMENTOW zaakceptowany 2026-09-01, **E1 zamknięty tego samego dnia**.

**Co E1 zmienił i co z tego wynika dla E2.** Zbiór wpisów blokujących rotację **skurczył się do
jednej pozycji**: dziesięciu najnowszych wpisów. Wpisy linkowane z otwartych spraw człowieka
przestały blokować, a projekt sprzed 1.6.0 (bez sekcji „Czeka na człowieka") blokuje po staremu —
własną sekcją „Do zrobienia przez człowieka" wpisu. Komunikat, który ten etap ma napisać, wymienia
więc **realne** powody stania mechanizmu, a nie ten, który E1 usunął. Sprawdź to w
`SPEC_ARCHIWUM.md`, zanim zaczniesz pisać treść komunikatu — nie zakładaj z tego akapitu.

```
core/templates/SPEC_ARCHIWUM.md          # progi, wybór treści, dwie fazy, przypadki brzegowe (po E1)
core/templates/SPEC_USTAWIENIA.md        # wiersz "Budzet startu sesji" i progi czastkowe
core/process/session-signals.js          # startCost + startCostReport; ostatniWpis czyta daty (E1)
core/tools/validate-adapters.js          # walidator spojnosci rdzen <-> adaptery
adapters/claude-code/skills/relai-core/SKILL.md    # procedura rotacji wypisana w tresci (L-0011)
adapters/cursor/rules/relai-core.mdc               # ta sama tresc po angielsku
docs/DZIENNIK.md                         # 160,4 KB przy progu 150 KB, 28 wpisow, 9 spraw otwartych
```

**Czego jeszcze NIE ma (to jest zakres tego etapu):** komunikatu, który wymienia **pary
„pozycja → wpis"** wraz z wiekiem pozycji i liczbą wpisów, które przez nią nie przeszły; progu
liczonego **ponad pozycjami nietykalnymi**; **dolnej granicy osiągalnej** w raporcie. Dziś
komunikat mówi tylko, że nie ma czego wziąć, a próg porównuje się do **całego** pliku — więc plik,
w którym same wpisy nietykalne ważą więcej niż próg, wygląda na zatkany bez powodu.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym etapie** (przepisane w całości — plik może
urosnąć, prompt nie):

1. **Specyfikacja dokumentu jest kompletna albo martwa:** kończy się realnym przykładem, wypisuje
   wymaganą strukturę w treści (odesłanie nie wystarcza) i ma zapisaną ścieżkę „pytam zamiast
   zmyślać" wraz z formą zapisu luki. (L-0001, L-0011, L-0026)
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — fraza wchodzi do
   `KOMENDY.md` w wersji, w której realnie działa, a forma wywołania jest tą, którą uruchomiłeś
   dosłownie. Komendę wklejaną do dokumentu odpalasz z tej samej powłoki, którą zobaczy czytelnik:
   znak interpretowany przez powłokę zapisujesz tak, żeby nie musiała go tknąć. (L-0002, L-0022, L-0059)
3. **Test „czegoś nie wolno" wymaga dowodu negatywnego:** pokaż, że chroniony fragment ma nadal
   pierwotne brzmienie, nie tylko że nowy wpis powstał. (L-0007)
4. **Dowodzisz efektem, nie zdarzeniem:** stanem pliku, sumą kontrolną, treścią odpowiedzi.
   Kryterium stawiasz na stanie, który kontrolujesz, i na źródle, które artefakt produkuje — nie na
   cudzym strumieniu. Zmianę zachowania pokazujesz **obiema wersjami w jednym przebiegu**,
   a instrument porównawczy implementuje wiernie każdą z nich. **Kryterium stawiasz na poprawności
   wyniku, nie na kierunku liczby, której nie kontrolujesz** — „wartość maleje" wolno napisać
   wyłącznie wtedy, gdy zmiana z definicji ją zmniejsza. (L-0017, L-0018, L-0040, L-0051, L-0052, L-0063)
5. **Instrument pomiarowy sam bywa źródłem fałszu:** wyrażenia regularne trzymaj w pliku, nie
   w `node -e`; scenariusz „konfiguracji nie ma" mierz z podstawionym katalogiem domowym; dokładaj
   przypadek, który **musi** trafić. Zero trafień przy niepustych zbiorach to defekt instrumentu,
   dopóki nie udowodnisz inaczej — porównanie identyfikatora wygenerowanego z zastanym ma obok
   siebie kontrolę „ile zastanych nie znalazło pary". Dzieląc wiersz po separatorze, który da się
   wyescapować, dziel po separatorze **niepoprzedzonym znakiem ucieczki** i sprawdzaj liczbę pól po
   podmianie. **Trafienie zgłoszone na materiale, który dotąd był zdrowy, sprawdzasz najpierw na
   instrumencie**; w łańcuchu podmian zbiór znaków zachowywanych wypisujesz raz, bo znak usunięty
   wcześniej nie wróci później. Wyczerpany limit konta zatrzymuje pomiar i idzie do odnogi, nie do
   adnotacji „sprawdzone inaczej". (L-0032, L-0037, L-0054, L-0055, L-0056, L-0064)
6. **Próg jest liczbą, którą ktoś liczy:** kalibruj go na zmierzonych plikach realnych projektów,
   zapisuj w jednostce mechanizmu kontrolnego wraz z komendą sprawdzającą i daj mu **jeden**
   wyzwalacz — wielkości pomocnicze wskazują przyczynę wewnątrz komunikatu, nie wywołują go.
   **Blokadę przeniesioną pod nowy adres mierzysz tak samo:** licz na realnym pliku, ile pozycji
   przechodzi po zmianie — reguła wskazująca „najstarszy element" w mechanizmie idącym od
   najstarszego zatyka go z definicji. (L-0034, L-0049, L-0053, L-0060)
7. **Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień:** dopasowanie od początku
   komórki, wybór linii po niesionej wartości (nie po kolejności), wartość nierozpoznana znaczy
   cisza. (L-0025, L-0035, L-0048)
8. **Zachowanie, które ma działać zawsze, mieszka w warstwie obecnej w każdej sesji** —
   `CLAUDE.md` projektu albo hook; skill dokłada procedurę i wyzwala się zawodnie, a komenda
   wywołana wprost go nie ładuje. Sygnał, który ma paść raz, ma jednego właściciela; cisza
   właściciela znaczy „sprawdzone i zgodne". (L-0015, L-0030, L-0036)
9. **Skill nie zakłada dostępu do niczego poza katalogiem roboczym** — ani do katalogu pluginu, ani
   do domowego. Opis zaczynaj od `MUST BE USED`, markera projektu i płaskiej listy fraz; każdy krok
   sięgający dalej ma zapisane wyjście po odmowie dostępu. (L-0009, L-0010, L-0012, L-0023)
10. **Wersję pluginu potwierdzasz plikiem instalacji, nie komunikatem CLI**, zachowania mierzysz
    świeżą sesją, a po podbiciu numeru przepuszczasz repo `grep`-em po starym i rozstrzygasz każde
    trafienie — **także w treści komend, skilli i specyfikacji**, dzieląc je na wzmianki
    historyczne i deklaracje stanu docelowego. Kontrola patrząca tylko na manifesty tej różnicy nie
    widzi. (L-0004, L-0008, L-0020, L-0061)
11. **Końce linii są wariantem, nie szczegółem.** Sumy kontrolne porównuj po normalizacji
    CRLF → LF; w regexie nad pojedynczą linią nie zakotwiczaj końca, bo kropka nie obejmuje `\r`
    i wzorzec przestaje trafiać na repozytorium z `core.autocrlf=true`; mechanizm czytający
    strukturę pliku sprawdzaj na **obu** wariantach w jednym przebiegu. Przeniesienie katalogu
    wskazywanego przez cudzy manifest sprawdzaj najpierw **na kopii**, walidatorem tego manifestu.
    **Kolejność wpisów w dokumencie jest takim samym wariantem** — kierunek ustalaj z danych (daty
    w nagłówkach), nie z nawyku wziętego z projektu, w którym mechanizm powstał. (L-0033, L-0038,
    L-0057, L-0062)
12. **Guardrail zatrzymujący treść, która sekretem nie jest, to defekt rdzenia** — poprawka wraca
    z dowodem, nigdy jako obejście. Wołaj go przez opakowanie powłoki, żeby brak interpretera
    zamieniał się w blokadę, a nie w ciszę; próbki sekretów składaj w czasie wykonania. (L-0043,
    L-0045, L-0046)
13. **Cudze narzędzie poznajesz z wydanego builda i z próby**, nie z dokumentacji: payload parsuj
    po zdjęciu BOM i bez założeń o nazwach pól, sesję CLI uruchamiaj z powłoki natywnej, a brak
    sygnału konfrontuj najpierw z **warunkiem milczenia** mechanizmu. (L-0041, L-0042, L-0044, L-0047)
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Weryfikację planuj tam,
    gdzie jest wykonalna; po pytaniu sprzątasz sam (martwy link nie jest poprawną wartością
    tymczasową); przy wyprowadzaniu pozycji jednostką inwentarza jest **sprawa**, nie linia.
    Wstawkę kotwicz do elementu, który przeżyje operację, i dowódź **obecności** nowej treści —
    „nic nie zginęło" nie znaczy „wszystko powstało". (L-0005, L-0013, L-0014, L-0050, L-0058)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    Przy zadaniu wizualnym zbierasz najpierw cechy pozytywne i pokazujesz jeden wariant do
    kalibracji. Ostrzeżenie `claude plugin validate` o root `CLAUDE.md` jest świadomym skutkiem
    dogfoodingu — nie „naprawiaj" go. (L-0003, L-0006, L-0016, L-0019, L-0029)

## Zakres etapu

1. **`core/templates/SPEC_ARCHIWUM.md`, komunikat zablokowanej rotacji** — dziś przypadek brzegowy
   każe powiedzieć „jednym zdaniem, z powodem". Rozpisz **kształt tego zdania**: co dokładnie ma
   wymienić, w jakiej kolejności i w jakiej postaci. Minimum: **pary „pozycja → wpis"** dla
   projektów sprzed 1.6.0 (tam blokuje własna sekcja wpisu), **wiek pozycji** w dniach i **liczba
   wpisów, które przez nią nie przeszły**. Podaj realny przykład brzmienia — specyfikacja bez
   przykładu jest martwa (zasada 1).
2. **`core/templates/SPEC_ARCHIWUM.md`, próg liczony ponad nietykalnymi** — próg dokumentu dotyczy
   części **rotowalnej**, nie całego pliku. Opisz wprost: co wchodzi do wagi rotowalnej, co jest
   **dolną granicą osiągalną** (waga pozycji nietykalnych) i jak brzmi raport, gdy sama dolna
   granica przekracza próg. Nietykalność zostaje liczona w sztukach.
3. **`core/templates/SPEC_ARCHIWUM.md`, przypadki brzegowe** — zgraj z powyższym trzy istniejące
   wiersze: „cały zakres nietykalny", „mniej niż dziesięć wpisów" oraz „pozycja `ryzyka` ponad
   progiem, ale żadne ryzyko nie jest zamknięte". Każdy ma dziś własne zdanie; po zmianie mają
   mówić **tym samym** językiem progu i dolnej granicy.
4. **Oba adaptery** — `adapters/claude-code/skills/relai-core/SKILL.md`, sekcja „Rotacja dokumentów",
   oraz punkt 2 „Session close ritual" w `adapters/cursor/rules/relai-core.mdc`: procedura rotacji
   jest wypisana w treści skilla (L-0011), więc kształt komunikatu i sposób liczenia progu muszą
   wejść **w obu nośnikach**, nie tylko w specyfikacji.
5. **Sprawdź, czy `session-signals.js` ma tu cokolwiek do zrobienia** — i **jeśli nie ma, napisz to
   wprost** zamiast dokładać kod na zapas. Raport startu jest zakresem E4; ten etap dotyczy
   komunikatu rytuału zamknięcia, który pisze model, a nie hook. Rozstrzygnięcie tej granicy jest
   punktem zakresu, nie dowolnością.

Poza zakresem tego etapu, choć kusi: wiersz `Przegląd spraw człowieka` i pytania o sprawy
przeterminowane (E3), druga linia raportu startu i progi cząstkowe dokumentów (E4), rotacja ryzyk
i ustawień (E5), podbicie wersji (E6), **rotacja dziennika tego repozytorium** — jest ponad progiem,
ale rotacja należy do rytuału zamknięcia sesji, nie do zakresu etapu.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] **Komunikat wypisany na realnym pliku, w obu wersjach, w jednym przebiegu** (zasada 4):
      dla dziennika, w którym rotacja stoi, wypisz komunikat **stary** („nie ma czego wziąć")
      i **nowy** (pary, wiek, liczba wpisów). Obie wersje mają być wygenerowane przez instrument,
      nie przepisane ręcznie.
- [ ] **Próg ponad nietykalnymi policzony na realnym pliku**: waga całego pliku, waga części
      rotowalnej, dolna granica osiągalna i próg — cztery liczby wypisane obok siebie, dla
      **dwóch** dokumentów (dziennik tego repozytorium i dziennik PolyFlow sprzed rotacji).
- [ ] **Przypadek „sama dolna granica przekracza próg"** pokazany na danych, a nie opisany
      w teorii: plik, w którym dziesięć najnowszych wpisów waży więcej niż próg, dostaje raport
      z dolną granicą — treść raportu wypisana.
- [ ] **Cisza poniżej progu nienaruszona** (zasada 3, dowód negatywny): dla pliku poniżej progu
      instrument nie produkuje **ani jednego znaku** — pokazane na wyjściu, nie deklaracją.
- [ ] `SPEC_ARCHIWUM.md` i oba adaptery mówią o komunikacie i o progu **to samo** — sprawdzone
      czytaniem wszystkich trzech w jednym przebiegu tej sesji, nie z pamięci.
- [ ] `git grep -n` po frazie nowej reguły zwraca trafienia w `core/templates/`,
      `adapters/claude-code/` i `adapters/cursor/`.
- [ ] `node core/tools/validate-adapters.js` kończy się kodem **0**.
- [ ] Wpis w `docs/DZIENNIK.md` dopisany na końcu sekcji „Wpisy", z linią autora w formacie
      `RelAI (<model>) + <git config user.name>`; `docs/STATE.md` nadpisany.
- [ ] Brak plików tymczasowych i katalogów testowych w repozytorium (`git status --short` bez
      nieoczekiwanych pozycji).

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. **`docs/plany/HIGIENA_DOKUMENTOW/STATUS.md`**: E2 → `ZREALIZOWANY <data>`, E3 →
   `GOTOWY DO STARTU` z linkiem do `PROMPT_ETAP_3.md` w kolumnie `Prompt`, jedna linia w dzienniku
   wdrożenia. Sekcja „Odnogi" — sprawdź, czy `REJESTR_ARTEFAKTOW` nadal jest `OTWARTA`.
2. **`docs/DZIENNIK.md`**: wpis wg `SPEC_DZIENNIK.md` (Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka) na końcu sekcji „Wpisy". Przejrzyj tabelę
   „Stan otwartych ryzyk" — **R5 zostaje otwarte**, a jego komórka „Mitygacja" dostaje odsyłacz do
   tego etapu (limit 800 znaków jest twardy). Lekcje z etapu → `docs/LEKCJE.md` + odświeżony
   destylat „Zasady aktywne" (limit 15 pozycji jest twardy; dziś jest dokładnie 15, więc nowa
   zasada wchodzi przez rozszerzenie istniejącej, nie przez dopisanie szesnastej).
3. **Bramki manualne** — każda nierozstrzygnięta pozycja „Do zrobienia przez człowieka" z Twojego
   wpisu dostaje linię w sekcji „Bramki manualne" `STATUS.md` ze statusem `OTWARTA`, a sprawa,
   która ma czekać dłużej niż tę sesję — również pozycję w sekcji „Czeka na człowieka" dziennika
   (link do **najnowszego** wystąpienia sprawy — reguła z E1).
4. **`docs/STATE.md`** — nadpisz stan obszaru rotacji; `README.md` tylko wtedy, gdy zmienił się
   sposób uruchomienia (w tym etapie nie powinien).
5. **Wygeneruj `PROMPT_ETAP_3.md`** w tym folderze, wg `.claude/relai/templates/SPEC_PROMPT_ETAPU.md`:
   materiałem jest sekcja 6 planu (opis E3 — wiersz `Przegląd spraw człowieka`, wykrycie
   przeterminowanych, pytania partiami po cztery, Aneks A: `N = 30 dni` i wyłącznik osobny od
   rotacji), **realny stan repozytorium po tym etapie** i lekcje, które w tym etapie powstały.
6. **Commit** — conventional message po angielsku; propozycja, nie wykonanie bez zgody.
