# PROMPT_ETAP_1 — Szybkie poprawki spójności i wydanie 2.3.1

Plan: PROWADZENIE_END_TO_END • Etap: **E1 z E7** • Wygenerowano: 2026-09-24 (autor: Opus 5.5, przy akceptacji planu) • Wykonawca: **Opus** (preferencja z USTAWIENIA.md, D-85) — dziś Opus 5.5, `/effort medium`

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu klasy **strong**, w tym narzędziu:
> **Opus 5.5** (alias `opus`, lista modeli z dnia `2026-09-24`) — D-85. Jeśli sesja działa na innym
> modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz. Zalecany poziom
> `/effort`: `medium` (etap mechaniczny; dostawca zaleca podnosić poziom tylko przy zmierzonym zysku).

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu i rytuał „Na koniec” |
| `docs/plany/PROWADZENIE_END_TO_END/STATUS.md` | status planu i etapu, bramki manualne |
| `docs/plany/PROWADZENIE_END_TO_END/REJESTR.md` | pozycje z przypisaniem **E1** (9 sztuk) — każda z dowodem; to jest zakres tego etapu |
| `docs/PULAPKI.md` — P-005 | sekwencja wydania: `claude plugin validate` → tag → push → release → `claude plugin update relai@relai` → świeża sesja i sprawdzenie treścią plików z cache'u |
| `docs/DZIENNIK.md` — wpis „2026-09-15 — Zgłoszenie testera … wydanie 2.3.0” | wzorzec ostatniej pełnej sekwencji wydania w tym repo |
| `docs/DZIENNIK.md` — dwa wpisy z 2026-09-24 | co zmieniono w `/relai-prompt` (commit `36991a9`, niewydane) i jak powstał plan |
| `core/process/prompt-mode.js` + `core/process/tests/prompt-mode.test.js` | zapis i odczyt zgody na tryb ciągły (pozycja S01) |
| `core/tools/validate-adapters.js` | kontrola „numery wersji: 5 źródeł” — tu dochodzi baner README |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- Plan zaakceptowany i zamrożony 2026-09-24 (D-33); zmiany zakresu wyłącznie aneksem.
- Rytm wydań: **2.3.1 kończy E1**, potem wydanie po każdym etapie zmieniającym plugin — decyzja człowieka z wywiadu 2026-09-24.
- Wybór modelu optymalizatora w `/relai-prompt` (pytanie o model i zasięg, flaga `--model`, zasięg „ta sesja” bez pliku stanu) jest zaprojektowany i scommitowany (`36991a9`) — w E1 tylko go wydajesz i opisujesz w `SPEC_KOMENDY.md`, bez przeprojektowania.
- Źródłem prawdy specyfikacji jest `core/templates/`, nie kopia w `.claude/relai/templates/` (pierwsza z dwóch pozycji D-87 w `DECYZJE.md`).
- Decyzje zamrożone poprawiasz **datowanym aneksem** w sekcji „Decyzje zmienione” albo przy pozycji — nie przepisujesz ich treści (D-33 w duchu rejestru, D-18).
- Nowa pozycja **D-88** (rotacja wg wagi całkowitej) już istnieje — przy przenumerowaniu zdublowanego D-87 bierzesz pierwszy wolny numer po D-88.
- Guardrail sekretów (D-42) i podział hooków blokujące / ostrzegające (D-41) bez zmian.
- **Granica zakresu:** budżet startu, rotacja, ryzyka i długość STATE to **E2**; podział treści skilli i parytet w walidatorze to **E3** (w E1 zmieniasz wyłącznie frontmatter `description`); nakładki per model, `pasted_content`, meldunki i `/effort` w specyfikacji promptu to **E4**; README poza banerem wersji to **E5**.

## Stan wyjściowy — co realnie zastajesz

RelAI **2.3.0** jest wydany publicznie; `HEAD` na `main` zawiera niewydany commit `36991a9` (wybór
modelu w `/relai-prompt`) i zamknięcie planu PIERWSI_UZYTKOWNICY. Plugin jest zainstalowany na stałe
(scope `user`), więc każda zmiana dociera do sesji dopiero przez sekwencję P-005. Testy:
`node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js adapters/codex/tests/*.test.js`
— **50 z 50** (FAKT, 2026-09-24); `node core/tools/validate-adapters.js` — kod 0. Katalog-argument
w `node --test` nie działa na Node 24 — podawaj pliki (FAKT).

Pliki istotne dla etapu:

```
adapters/claude-code/skills/relai-core/SKILL.md      frontmatter description: linie 3-23, ~1 770 znaków, zaczyna się od „MUST BE USED”
adapters/claude-code/skills/relai-planning/SKILL.md  frontmatter description: linie 3-24, ~1 830 znaków, „MUST BE USED” + dwa „ALSO USE”
adapters/codex/skills/                               generowane: node adapters/codex/generate-skills.js (sprawdzenie: --verify)
adapters/claude-code/agents/relai-reviewer.md:9-10   „Report only findings you are confident about”
adapters/claude-code/MODELE.md                       lista pluginu, list-date 2026-09-04, strong: Opus 5
.claude/relai/MODELE-claude-code.md                  kopia projektu, list-date 2026-09-24, strong: Opus 5.5 (wzorzec linii)
core/process/prompt-mode.js                          zgoda sesyjna w .claude/relai/zgoda-promptu.json — jeden rekord {sesja,decyzja,data}
core/process/session-signals.js:494-527              stateDrift(): porównuje link aktywnego planu, nie wersję
core/tools/validate-adapters.js                      „numery wersji: 5 źródeł” (manifesty), bez README i STATE
docs/STATE.md:3-24                                    „Stan na” i „Gdzie jesteśmy” mówią 2.2.0; linia 22-24: niewydane 2.3.1
README.md:6                                           baner „Wersja 2.1.4”
docs/DECYZJE.md                                       D-87 dwa razy (sekcje „Tożsamość…” i „Zakres v1…”), D-40 (8 hooków), D-80 (Cursor/Codex poza v1)
CLAUDE.md:14, AGENTS.md:17                            krok 7 rytuału wymienia z nazwy plan zamknięty 2026-09-05
core/templates/SPEC_KOMENDY.md:87-92                  opis optymalizatora z 2.2.0, bez wyboru modelu
.claude-plugin/marketplace.json, .claude-plugin/plugin.json, .codex-plugin/plugin.json, adapters/claude-code/commands/relai-update.md   wersja 2.3.0
```

Odwołania do drugiego D-87 (adapter Cursora) poza rejestrem: `docs/STATE.md:236`. Odwołania do
pierwszego D-87 (źródło prawdy specyfikacji): `core/prompt/SZABLONY.md`, `docs/fixy/ORKIESTRACJA/ODNOGA.md`,
wpisy dziennika (dziennika nie edytujesz wstecz — append-only).

**Czego jeszcze NIE ma:** opisów skilli w limicie 1 024 znaków; recenzenta, który zgłasza wszystko
z poziomem pewności; kontroli wersji w README i STATE; unikalnych numerów decyzji i aneksów do D-40
i D-80; zgody zapisywanej per sesja; listy modeli pluginu z Opus 5.5; wydania 2.3.1.

### Zasady aktywne (przepisane w całości z `docs/LEKCJE.md`)

1. **Specyfikacja dokumentu jest kompletna albo martwa:** kończy się realnym przykładem, wypisuje
   wymaganą strukturę w treści (odesłanie nie wystarcza) i ma zapisaną ścieżkę „pytam zamiast
   zmyślać" wraz z formą zapisu luki. **Wzorzec powtarzalny sprawdzasz na całej rodzinie
   dokumentów** — punkt „stare brzmienie nie zwraca nic" uruchamiaj na katalogu specyfikacji, bo
   jego wartością jest trafienie **poza** zakresem etapu; takie trafienie jest sygnałem odchylenia,
   nie usterką weryfikacji. **Pierwszy realny przebieg reguły jest częścią jej pisania**, nie
   kontrolą po fakcie: planuj go przed zamknięciem pliku, a rozjazd traktuj jako defekt reguły,
   nie jako wyjątek do obejścia w wykonaniu. **Reguła produkująca tekst opisuje początek wiersza
   i to, czego w nim nie ma**, nie tylko jego zawartość — model domyka lukę formatem materiału,
   który ma pod ręką; materiał sprzed poprawki reguły zostaje obok materiału po niej.
   (L-0001, L-0011, L-0026, L-0089, L-0100, L-0108)
2. **W dokumencie użytkownika stoi tylko to, co działa i co zmierzyłeś** — fraza wchodzi do
   `KOMENDY.md` w wersji, w której realnie działa, a forma wywołania jest tą, którą uruchomiłeś
   dosłownie. Komendę wklejaną do dokumentu odpalasz z tej samej powłoki, którą zobaczy czytelnik:
   znak interpretowany przez powłokę zapisujesz tak, żeby nie musiała go tknąć. (L-0002, L-0022,
   L-0059)
3. **Test „czegoś nie wolno" wymaga dowodu negatywnego:** pokaż, że chroniony fragment ma nadal
   pierwotne brzmienie, nie tylko że nowy wpis powstał. (L-0007)
4. **Dowodzisz efektem, nie zdarzeniem:** stanem pliku, sumą kontrolną, treścią odpowiedzi.
   Kryterium stawiasz na stanie, który kontrolujesz, i na źródle, które artefakt produkuje — nie na
   cudzym strumieniu. Zmianę zachowania pokazujesz **obiema wersjami w jednym przebiegu**,
   a instrument porównawczy implementuje wiernie każdą z nich. **Kryterium stawiasz na poprawności
   wyniku, nie na kierunku liczby, której nie kontrolujesz** — „wartość maleje" wolno napisać
   wyłącznie wtedy, gdy zmiana z definicji ją zmniejsza. **Kryterium sukcesu sprawdzasz na
   materiale, zanim zaczniesz pracę** — policz na wskazanym pliku liczbę, którą ma osiągnąć,
   i porównaj ją z tym, co mechanizm w ogóle kontroluje; kryterium arytmetycznie nieosiągalne
   wraca do człowieka jako aneks, a nie kończy etap jako niedowieziony punkt. (L-0017, L-0018,
   L-0040, L-0051, L-0052, L-0063, L-0069, L-0082)
5. **Instrument pomiarowy sam bywa źródłem fałszu:** wyrażenia regularne trzymaj w pliku, nie
   w `node -e`; scenariusz „konfiguracji nie ma" mierz z podstawionym katalogiem domowym; dokładaj
   przypadek, który **musi** trafić. Zero trafień przy niepustych zbiorach to defekt instrumentu,
   dopóki nie udowodnisz inaczej — porównanie identyfikatora wygenerowanego z zastanym ma obok
   siebie kontrolę „ile zastanych nie znalazło pary". Dzieląc wiersz po separatorze, który da się
   wyescapować, dziel po separatorze **niepoprzedzonym znakiem ucieczki** i sprawdzaj liczbę pól po
   podmianie. **Trafienie zgłoszone na materiale, który dotąd był zdrowy, sprawdzasz najpierw na
   instrumencie**; w łańcuchu podmian zbiór znaków zachowywanych wypisujesz raz, bo znak usunięty
   wcześniej nie wróci później. **Filtr odsiewający „to nie jest przypadek do sprawdzenia" ma
   wyjątek dla linii mówiącej wprost o rzeczy sprawdzanej**, a każdy przypadek graniczny ma własną
   kontrolę na wyjściu — jedna kontrola przechodzi zielono, gdy zniknął przypadek, którego nie
   sprawdza. **Wzorzec identyfikatora pozycji ma obok siebie kontrolę „ile wierszy odrzucono"** —
   realny rejestr trzyma numery, których wzorzec nie przewidział, a odrzucenie jest ciche.
   **Generator identyfikatorów ma kontrolę pozytywną na wszystkich kandydatach, nie na
   pierwszym** — sprawdzasz, czy wygenerowana wartość występuje w tym samym pliku; pierwszy
   element bywa jedynym nielinkowanym i przewraca kontrolę na poprawnym generatorze.
   **Instrument porównujący dwa drzewa odtwarza materiał przed każdym wariantem** i dowodzi na
   końcu, że materiał wyszedł nietknięty — a **wynik wariantu, który ma przeżyć pomiar, wynosisz
   z katalogu odtwarzanego od razu**; plik brany z katalogu kontrolnego przenosisz z porównaniem
   sumy, nie samym `cp`. Wyczerpany limit konta zatrzymuje pomiar i idzie do
   odnogi, nie do adnotacji „sprawdzone inaczej" — ale **niedostępność cudzej usługi sprawdzasz
   ponownie jednym najtańszym wywołaniem**, zanim odpiszesz pomiar jako niewykonalny: lekcja o niej
   niesie datę i jest hipotezą, nie werdyktem. **Datowanie działa w obie strony** — „usługa działała
   wczoraj" też jest hipotezą, więc etap opierający punkt weryfikacji na cudzej usłudze sprawdza ją
   przed rozpoczęciem pracy. **Przebieg, w którym oczekujesz ciszy, jest ważny wyłącznie razem
   z kontrolą pozytywną w tym samym przebiegu** — awaria ładowania modułu wygląda dokładnie jak
   zachowanie domyślne mechanizmu, więc na kontrolę pozytywną patrzysz pierwszą. **Cisza zmierzona
   złym wejściem jest fałszem, nie ciszą** — narzędzie wołane z podstawionym payloadem dostaje
   kontrolę pozytywną **na tym samym wejściu** (odbite pole, nazwa projektu), bo „0 znaków" wygląda
   tak samo przy poprawnej ścieżce i przy rozjechanej. **Kontrolę pozytywną stawiasz na wejściu,
   którego mechanizm naprawdę pilnuje** — wejście z jego własnej listy wyłączeń (ścieżka objęta
   `.gitignore`, rozszerzenie pomijane, tryb wyciszony) daje przebieg zielony niezależnie od tego,
   czy mechanizm żyje; listę wyłączeń czytasz w kodzie, zanim postawisz kontrolę. **Wniosek
   o własności cudzego narzędzia, wyprowadzony w czasie, gdy własny artefakt był zepsuty, wygasa
   razem z jego naprawą** — datuj go wersją artefaktu, nie tylko dniem, i sprawdź ponownie, zanim
   oprzesz na nim zakres etapu. **Porównanie dwóch nieistniejących wejść jest zgodnością** —
   instrument porównujący dwa źródła sprawdza najpierw, czy oba istnieją, i zgłasza brak jako osobny
   stan, bo suma pustego strumienia jest po obu stronach ta sama; kontrola pozytywna wobec **innej
   wersji** musi zwrócić różnicę. **Agregat po wykrytych elementach bierze też elementy innej klasy
   niż mierzona** — `min()` po pasmach ciemnych pikseli zwraca kreskę, nie wiersz tekstu; próg
   odsiewu podajesz jawnie i pokazujesz cały zbiór obok wyniku. **Metrykę „czy X jest w tekście"
   stawiasz na dwóch licznikach naraz** — wąskim, ze słownika własnego wzorca, i szerokim, z brzmień,
   którymi to samo mówi ktoś, kto Twojego wzorca nie zna; szeroki dostaje kontrolę **przeciw
   zawyżeniu** na materiale, który tej rzeczy na pewno nie ma, a rozjazd między licznikami jest
   wynikiem, nie usterką. **Najpierw klasyfikujesz kształt odpowiedzi, potem liczysz jakość** — i
   liczysz ją wyłącznie tam, gdzie mierzona rzecz miała powstać; liczba przypadków stoi w raporcie
   obok procentu, bo procent bez mianownika kłamie najciszej, a sam rozkład kształtów bywa
   ważniejszy od jakości. **Różnica dwóch przebiegów mierzy tylko to, co przekracza szum** — zmierz
   szum między dwiema bazami, a sygnał od niego mniejszy wzmocnij powieleniem materiału i podaj
   pasmo błędu razem z kontrolą na połowie materiału. **Scenariusz „czegoś nie ma" planuj razem
   z listą mechanizmów, które to coś tworzą same**; czego nie da się odciąć, tam pomiar schodzi na
   fixturę i mówi to wprost. **Licznik wąski buduj przez wykluczenie znaku otwierającego przypadek,
   który ma odpaść** — alternatywa ogólna znosi zamkniętą listę brzmień, a kontrola oczekująca tego
   samego od licznika wąskiego i szerokiego nie sprawdza niczego. **Zero trafień w cudzym
   transkrypcie jest najpierw zdaniem o instrumencie** — nazwa narzędzia w cudzym protokole jest
   takim samym wariantem jak nazwa pola, więc wypisz zbiór nazw, które w materiale wystąpiły, zanim
   orzekniesz, że tej jednej nie ma. **Nową kontrolę spójności uruchamiasz na zastanym materiale,
   zanim nazwiesz ją profilaktyką**: jej pierwsze trafienia są wynikiem etapu, a cisza od pierwszego
   uruchomienia jest podejrzana do czasu pokazania drugiej strony na podłożonym defekcie; fałszywe
   trafienie zawężasz **z powodem**, nie wyciszeniem kontroli.
   (L-0032, L-0037, L-0095, L-0096, L-0105, L-0106, L-0107, L-0110, L-0111,
   L-0097, L-0101, L-0102,
   L-0054, L-0055, L-0056, L-0064, L-0068, L-0071, L-0073, L-0083, L-0084, L-0086, L-0087, L-0088,
   L-0090, L-0091)
6. **Próg jest liczbą, którą ktoś liczy:** kalibruj go na zmierzonych plikach realnych projektów,
   zapisuj w jednostce mechanizmu kontrolnego wraz z komendą sprawdzającą i daj mu **jeden**
   wyzwalacz — wielkości pomocnicze wskazują przyczynę wewnątrz komunikatu, nie wywołują go.
   **Blokadę przeniesioną pod nowy adres mierzysz tak samo:** licz na realnym pliku, ile pozycji
   przechodzi po zmianie — reguła wskazująca „najstarszy element" w mechanizmie idącym od
   najstarszego zatyka go z definicji. **Próg porównuj do wielkości, którą mechanizm kontroluje**
   (część usuwalna), a sygnał o zatkaniu wyzwalaj **różnicą między możliwym a wykonanym**, nie
   zerem wykonanego — warunek „nic nie przeszło" milczy przy „przeszło 2 z 87". **Liczbę zbioru
   liczysz także w komunikacie sukcesu**, nie tylko w asercji: literał w tekście czytanym przez
   człowieka jest zapisem stanu z dnia napisania i przy pierwszej zmianie zakresu staje się cichym
   fałszem. **Wielkość odejmowaną od pomiaru traktujesz jako hipotezę o stałej i sprawdzasz ją,
   zanim na niej oprzesz liczbę** — różnica ujemna albo rozjeżdżająca się znaczy, że nie ma czego
   odejmować; zostaje liczba surowa i różnica między wariantami mierzonymi w tych samych warunkach,
   gdzie narzut skraca się sam. Wynik oparty na nierzetelnym odjęciu **oznaczasz** jako nierzetelny,
   a nie usuwasz. (L-0034, L-0049, L-0053, L-0060, L-0065, L-0099, L-0104)
7. **Wartość czytana maszynowo ma kotwicę i zamkniętą listę brzmień:** dopasowanie od początku
   komórki, wybór linii po niesionej wartości (nie po kolejności), wartość nierozpoznana znaczy
   cisza. **Rdzeń słowa w języku z diakrytykami łapiesz klasą znaków tego języka, nie `\w`** —
   `\w` bez flagi `u` to `[A-Za-z0-9_]`, więc wzorzec przechodzi na formach bez ogonków i odpada
   na realnym dokumencie; wynik zawyżony jest tak samo podejrzany jak zerowy. **Rdzenia szukasz
   w samym brzmieniu wartości, nie w całej komórce** — za datą stoi proza z tymi samymi słowami,
   więc dopasowanie „gdziekolwiek" wciąga pozycje, które należą do innego mechanizmu.
   **Zamknięta lista ma koszt po drugiej stronie i ten koszt mierzysz:** ile pozycji wygląda dla
   człowieka na rozpoznane, a nie jest; poszerzenie listy jest decyzją człowieka, nie poprawką.
   (L-0025, L-0035, L-0048, L-0066, L-0070, L-0074)
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
    widzi. **Zachowanie zmienione, ale jeszcze niewydane, mierzysz artefaktem podłożonym lokalnie
    w projekcie kontrolnym** — hook przez `.claude/settings.json`, skill przez `.claude/skills/`
    pod **inną nazwą** niż wersja z pluginu; kolizja nazw znaczy, że nie wiesz, którą treść
    zmierzyłeś. (L-0004, L-0008, L-0020, L-0061, L-0085)
11. **Końce linii są wariantem, nie szczegółem.** Sumy kontrolne porównuj po normalizacji
    CRLF → LF; w regexie nad pojedynczą linią nie zakotwiczaj końca, bo kropka nie obejmuje `\r`
    i wzorzec przestaje trafiać na repozytorium z `core.autocrlf=true`; mechanizm czytający
    strukturę pliku sprawdzaj na **obu** wariantach w jednym przebiegu. Przeniesienie katalogu
    wskazywanego przez cudzy manifest sprawdzaj najpierw **na kopii**, walidatorem tego manifestu.
    **Kolejność wpisów w dokumencie jest takim samym wariantem** — kierunek ustalaj z danych (daty
    w nagłówkach), nie z nawyku wziętego z projektu, w którym mechanizm powstał. **Wariantem jest
    też stan dokumentu wobec własnej specyfikacji** — realny projekt trzyma pozycje, które reguła
    każe usunąć; mechanizm sprawdzaj na dokumencie realnego projektu i odsiewaj takie stany tą samą
    zamkniętą listą brzmień, której używa reszta rdzenia. **Numeracja i wytłuszczenie nagłówka są
    takim samym wariantem** — nagłówek w cudzej odpowiedzi rozpoznawaj z tolerancją na `## 2.`,
    `**…**` i poziom znaków `#`, a kształt, który raz przewrócił wzorzec, dokładaj do kontroli
    dosłownie w tym brzmieniu, w jakim go spotkałeś. (L-0033, L-0038, L-0057, L-0062, L-0067, L-0103)
12. **Guardrail zatrzymujący treść, która sekretem nie jest, to defekt rdzenia** — poprawka wraca
    z dowodem, nigdy jako obejście. Wołaj go przez opakowanie powłoki, żeby brak interpretera
    zamieniał się w blokadę, a nie w ciszę; próbki sekretów składaj w czasie wykonania.
    **Znak cudzysłowu — także backtick — należy do grupy cudzysłowu, nigdy do klasy wartości**,
    inaczej guardrail zatrzymuje zdanie opisujące jego samego. (L-0043, L-0045, L-0046, L-0072)
13. **Cudze narzędzie poznajesz z wydanego builda i z próby**, nie z dokumentacji: payload parsuj
    po zdjęciu BOM i bez założeń o nazwach pól, sesję CLI uruchamiaj z powłoki natywnej, a brak
    sygnału konfrontuj najpierw z **warunkiem milczenia** mechanizmu. Gdy narzędzie nie przyjmuje
    Twojego artefaktu, **najpierw sięgnij po jego własny walidator albo widok statusu**
    (`<narzędzie> validate`, `<narzędzie> list`, okno ustawień) — zna schemat, którego nie
    odtworzysz z obserwacji, a cisza w logu nie jest dowodem poprawności. (L-0041, L-0042, L-0044,
    L-0047, L-0092)
14. **Najpierw zmiana w repozytorium, potem zdanie, które ją opisuje.** Weryfikację planuj tam,
    gdzie jest wykonalna; po pytaniu sprzątasz sam (martwy link nie jest poprawną wartością
    tymczasową); przy wyprowadzaniu pozycji jednostką inwentarza jest **sprawa**, nie linia.
    Wstawkę kotwicz do elementu, który przeżyje operację, i dowódź **obecności** nowej treści —
    „nic nie zginęło" nie znaczy „wszystko powstało". **Gdy prompt etapowy przeczy regule zapisanej
    w dokumencie docelowym, wygrywa dokument**, a rozjazd idzie do dziennika jako odstępstwo
    z powodem; z prompta wiążąca jest intencja, nie nazwa pliku.
    (L-0005, L-0013, L-0014, L-0050, L-0058, L-0109)
15. **Pytasz raz na projekt, komponent opcjonalny znika bez śladu, komunikaty hooków są ASCII.**
    Przy zadaniu wizualnym zbierasz najpierw cechy pozytywne i pokazujesz jeden wariant do
    kalibracji. **Kompozycję z tekstem budujesz w warstwie, która liczy układ** — HTML
    z `grid`/`flex`, wymiary w jednostkach kontenera, karty domknięte `overflow`; ręczne
    współrzędne zostają dla geometrii dekoracyjnej, nigdy dla treści, bo szerokość napisu jest
    wtedy szacunkiem metryki fontu. Dziecko wychodzące poza kontener to defekt blokujący,
    a instrument mierzący prostokąty ma kontrolę pozytywną na podłożonym przepełnieniu.
    **Kryterium materiału wizualnego wyrażasz w warunkach odbiorcy, nie autora** — szerokość, na
    jakiej realnie się wyświetli, i minimalna wysokość glifów przy tej szerokości; kontrola
    geometrii w skali renderu jest dodatkiem, nie zamiennikiem, i przechodzi zielono na materiale,
    którego nikt nie przeczyta. Ostrzeżenie `claude plugin validate` o root `CLAUDE.md` jest
    świadomym skutkiem dogfoodingu — nie „naprawiaj" go. **Nowy element zbioru wizualnego różnisz
    kształtem, nie detalem** — dwie ikony złożone z tych samych brył (trzy linie plus znaczek
    w rogu) czyta się jako jedną; porównanie robisz na podglądzie **całego zbioru** i w skali,
    w której element realnie się wyświetli. (L-0003, L-0006, L-0016, L-0019, L-0029,
    L-0094, L-0098)

**Wyprowadzone 2026-08-20 do `docs/PULAPKI.md`:** sześć pozycji, które były pułapkami
narzędziowymi, a nie zasadami pracy — `tar` na `PATH` (L-0021), sesja pomiarowa `claude -p`
(L-0024), PowerShell 5.1 i UTF-8 (L-0027), `--allowedTools` przy `acceptEdits` (L-0028),
restart aplikacji po `plugin update` (L-0031), `git worktree` zamiast `git archive | tar`
(L-0039). Obowiązują dalej — czytasz je z rejestru pułapek, na żądanie.

## Zakres etapu

> **Katalog roboczy tego etapu: `.claude/relai/work/PROWADZENIE_END_TO_END/E1/`.** Wszystko tymczasowe — skrypty
> pomiarowe, materiał testowy, wyjścia narzędzi, pobrane paczki — powstaje tam. Artefakt, który
> z natury musi leżeć **poza** projektem (`%TEMP%`, katalog domowy, klon cudzego repozytorium),
> wpisujesz do wpisu dziennika **z nazwy**, a jego nazwę zaczynasz od slugu projektu.

1. **Pomiar wyzwalania — przed zmianą opisów** (K1). W neutralnym projekcie testowym ze strukturą RelAI
   w katalogu roboczym uruchom świeże sesje `claude -p` na `opus`, `sonnet` i `haiku` z dwoma
   zdaniami: „kontynuujemy pracę” (oczekiwany skill `relai-core`) i „przygotuj plan dodania logowania”
   (oczekiwany `relai-planning`). Zapisz, czy padło wywołanie narzędzia `Skill` z tą nazwą. Dowód:
   wyjście `--output-format stream-json`, nie deklaracja modelu. Pamiętaj o P-004 (uprawnienia w `-p`).
2. **`adapters/claude-code/skills/relai-core/SKILL.md` i `relai-planning/SKILL.md` — `description`**
   (M02+M09): najwyżej 1 024 znaki, trzecia osoba, co skill robi i kiedy go użyć, bez „MUST BE USED”
   i „ALSO USE”; frazy wyzwalające PL i EN zostają, bo na nich stoi dopasowanie. Treść SKILL.md poniżej
   frontmattera bez zmian (to E3). Potem `node adapters/codex/generate-skills.js`.
3. **`adapters/claude-code/agents/relai-reviewer.md`** (M04+O10): recenzent zgłasza każde znalezisko
   z poziomem pewności i wagą; werdykt APPROVE / WARN / BLOCK zostaje, filtr należy do orkiestratora.
4. **Spójność wersji** (A02+A18): `README.md:6` i sekcja „Gdzie jesteśmy” w `docs/STATE.md` mówią
   o bieżącej wersji; `core/tools/validate-adapters.js` sprawdza baner README razem z manifestami,
   a `stateDrift()` w `core/process/session-signals.js` albo walidator wykrywa rozjazd wersji w STATE —
   wybierz jeden mechanizm i uzasadnij w dzienniku. Test w `core/process/tests/` albo
   `adapters/codex/tests/validate-adapters.test.js`: podmieniona wersja daje błąd.
5. **`docs/DECYZJE.md`** (A03, A04): drugi D-87 (adapter Cursora) dostaje pierwszy wolny numer po D-88,
   z adnotacją o przenumerowaniu przy nowym numerze; odwołanie w `docs/STATE.md:236` poprawione.
   D-40 i D-80 dostają datowane aneksy (11 hooków; Cursor i Codex dostarczone w 2.x) w sekcji
   „Decyzje zmienione”.
6. **`CLAUDE.md:14` i `AGENTS.md:17`** (A07): krok 7 rytuału odsyła do tabeli „Stan prac” zamiast
   nazwy konkretnego planu; `AGENTS.md` synchronizowany w tej samej turze (nagłówek z datą).
7. **`core/process/prompt-mode.js`** (S01): zgoda zapisywana i czytana **per identyfikator sesji**
   (np. mapa sesji w jednym pliku); rekord innej sesji nie nadpisuje bieżącej; stary format jednego
   rekordu czytany bez błędu. Tekst reguły bramki podawany modelowi mówi, jak zapisać nowy format.
   Testy w `core/process/tests/prompt-mode.test.js`, w tym dwie sesje zapisujące naprzemiennie.
8. **`adapters/claude-code/MODELE.md`** (M11): linia `strong: Opus 5.5 | alias: opus | id: claude-opus-5-5 | source: code.claude.com/docs/en/model-config, read 2026-09-24` zamiast Opus 5, `list-date: 2026-09-24`; pozostałe linie bez zmian (wzorzec: kopia w `.claude/relai/MODELE-claude-code.md`).
9. **`core/templates/SPEC_KOMENDY.md`** (S02): opis wyboru modelu optymalizatora (pytanie z czterema
   zasięgami, flaga `--model`) w akapicie o optymalizatorze.
10. **`docs/ARTEFAKTY.md`**: nowa wersja przy każdym zmienionym artefakcie z rejestru (skille,
    agent recenzenta, specyfikacja ściągi, lista modeli, jeśli jest w rejestrze) — co i po co.
11. **Wydanie 2.3.1**: wersja w `.claude-plugin/marketplace.json`, `.claude-plugin/plugin.json`,
    `.codex-plugin/plugin.json`, `adapters/claude-code/commands/relai-update.md` (i w miejscach, które
    wskaże walidator), baner README; `docs/KOMENDY.md` i `docs/USTAWIENIA.md` tego repo według wzorca
    z wydania 2.3.0. Sekwencja P-005 **po zgodzie człowieka** na tag, push i release.
12. **Pomiar wyzwalania — po wydaniu** (K1): te same sesje co w punkcie 1, na zainstalowanym 2.3.1
    (sprawdzonym treścią pliku z cache'u). Spadek na którymkolwiek modelu → opis wraca do poprzedniego
    brzmienia jako 2.3.2 w tym samym etapie; wynik z liczbami do dziennika.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `description` obu skilli ma ≤ 1 024 znaki (policzone komendą) i nie zawiera „MUST” ani „ALSO USE”; `node adapters/codex/generate-skills.js --verify` bez rozjazdu.
- [ ] Tabela wyzwalania przed i po: 3 modele × 2 skille, z liczbą wywołań `Skill` z `stream-json`; brak spadku albo cofnięty opis z drugim pomiarem.
- [ ] `relai-reviewer.md` nie zawiera już „Report only findings you are confident about” (dowód negatywny) i wymaga pewności oraz wagi przy każdym znalezisku.
- [ ] Test wersji: podmieniona wersja w README albo STATE (kopia testowa) daje błąd walidatora albo sygnał hooka; na repo po zmianach — zgodność.
- [ ] `grep -c "\*\*D-87\*\*" docs/DECYZJE.md` zwraca 1; nowy numer istnieje raz; aneksy D-40 i D-80 w sekcji „Decyzje zmienione”; treść D-40 i D-80 bez zmian (dowód negatywny).
- [ ] `CLAUDE.md` i `AGENTS.md` różnią się wyłącznie nagłówkiem kopii i nazwą narzędzia (diff).
- [ ] Test dwóch sesji w `prompt-mode.test.js` przechodzi; stary format jednego rekordu czytany bez wyjątku.
- [ ] `node --test core/process/tests/*.test.js core/guardrails/tests/*.test.js adapters/codex/tests/*.test.js` — wszystkie przechodzą (liczba testów do wpisu); `node core/tools/validate-adapters.js` — kod 0.
- [ ] `claude plugin validate .` → `✔ Validation passed` przed tagiem; po `claude plugin update relai@relai` treść zmienionego pliku w cache'u 2.3.1 zgodna z repo.
- [ ] Wpis w `docs/DZIENNIK.md` na końcu sekcji „Wpisy”, z podpisem `Autor: RelAI (<model>) + Lukasz`.
- [ ] Katalog roboczy `.claude/relai/work/PROWADZENIE_END_TO_END/E1/` przejrzany raportem (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”, z liczbami przed i po do wpisu dziennika; artefakty spoza katalogu (np. projekt testowy w `%TEMP%`) wypisane z nazwy razem z tym, co się z nimi stało.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/PROWADZENIE_END_TO_END/STATUS.md`: E1 → `ZREALIZOWANY <data>`, E2 → `GOTOWY DO STARTU`; linia „E1 rozpoczęty” zastąpiona linią wynikową.
2. Wpis w `docs/DZIENNIK.md` (Zrobione / Zweryfikowane / Świadomie odłożone / Do zrobienia przez człowieka), przegląd tabeli ryzyk; lekcje z etapu do `docs/LEKCJE.md` i destylat „Zasady aktywne”; pozycje dla człowieka jako bramki w `STATUS.md`.
3. `docs/STATE.md` (wersja 2.3.1 wydana), `docs/KOMENDY.md`, `docs/ARTEFAKTY.md`.
4. **Wygeneruj `PROMPT_ETAP_2.md`** wg `.claude/relai/templates/SPEC_PROMPT_ETAPU.md` z wiersza E2 w sekcji 6 `PLAN.html`, pozycji E2 w `REJESTR.md`, realnego stanu repo po E1 i lekcji z tego etapu; link w kolumnie `Prompt` przy E2.
5. Commit (conventional, po angielsku) — propozycja do zatwierdzenia przez człowieka.
