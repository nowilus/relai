# PROMPT_ODNOGA — rejestr artefaktów, którego wymaga profil `prompty`

Odnoga: REJESTR_ARTEFAKTOW • Plan-rodzic: HIGIENA_DOKUMENTOW, etap E1 • Wygenerowano: 2026-09-01
(autor: Opus) • Wykonawca: **Opus**

> **Kontrola modelu:** ten wątek wykonuj wyłącznie na modelu **Opus**. Jeśli sesja działa na innym
> modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sekcja „Reguły profilu (prompty)", definicja ukończenia |
| `docs/plany/HIGIENA_DOKUMENTOW/odnogi/REJESTR_ARTEFAKTOW/ODNOGA.md` | cel, zakres i weryfikacja — **karta jest źródłem**, ten prompt tylko ją wykonuje |
| `.claude/relai/templates/SPEC_PROFILE.md` | sekcja „Profil prompty" — wymagany układ rejestru; otwierasz i czytasz, nie generujesz z pamięci |
| `docs/USTAWIENIA.md` | wiersz `Profil projektu` — wartość `prompty` jest warunkiem tej odnogi |
| `docs/LEKCJE.md` | wyłącznie sekcja „Zasady aktywne" (przepisana niżej, ale plik mógł urosnąć) |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- **Profil projektu to `prompty`** (`USTAWIENIA.md`, 2026-08-21) — wartości nie zmieniasz i nie
  dyskutujesz. Rejestr powstaje, bo tego wymaga profil.
- **Rejestr zaczyna liczyć od dziś.** Historii wersji artefaktów sprzed rejestru nie odtwarzasz —
  piszesz o tym jedno zdanie w samym rejestrze zamiast zgadywać.
- **Rejestr odpowiada na pytanie „po co", dziennik na „co się działo"** (`CLAUDE.md`) — nie mieszasz
  ich i nie przepisujesz treści wpisów do rejestru.
- **Nic nie kasujesz i nie nadpisujesz po cichu** (D-18): poprzednia wersja artefaktu zostaje
  w historii gita albo jako datowana kopia w `docs/archiwum/artefaktow/`.
- **Nie ruszasz planu głównego.** `PLAN.html` planu HIGIENA_DOKUMENTOW jest zamrożony (D-33): nie
  edytujesz jego sekcji, nie dopisujesz aneksu, nie zmieniasz tabeli etapów w `STATUS.md`. Jedyne,
  co ta odnoga zmienia w dokumentach planu, to własna linia w sekcji „Odnogi" `STATUS.md`.

## Stan wyjściowy — co realnie zastajesz

Repozytorium na **1.6.1**. Profil `prompty` jest w `USTAWIENIA.md` od 2026-08-21 i od tej daty jest
czytany maszynowo, ale reguła „pierwszy artefakt → rejestr" nie zadziałała ani razu: hook
`profile-rules` ostrzega przy każdej zmianie artefaktu i na tym się kończy. W E1 planu
HIGIENA_DOKUMENTOW (2026-09-01) odezwał się kilkanaście razy w jednej sesji.

```
core/templates/*.md                      # 31 specyfikacji dokumentów — trzon artefaktów
core/templates/HTML_PLAN/                # szablon planu HTML + komponenty + builder
adapters/claude-code/commands/*.md       # 10 komend
adapters/claude-code/skills/*/SKILL.md   # 2 skille (relai-core, relai-planning)
adapters/cursor/rules/*.mdc              # 3 reguły Cursora
adapters/claude-code/hooks/              # hooki — nośnik, nie artefakt; do rejestru NIE wchodzą
docs/ARTEFAKTY.md                        # NIE ISTNIEJE — to jest przedmiot tej odnogi
```

**Czego jeszcze NIE ma:** dokumentu `docs/ARTEFAKTY.md` w żadnej postaci. Liczby wyżej sprawdź
komendą przed wpisaniem do rejestru — pochodzą z 2026-09-01 i mogły się zmienić.

**Zasady aktywne z `docs/LEKCJE.md`, obowiązujące w tym wątku** (przepisane w całości — plik może
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

## Zakres

1. **`docs/ARTEFAKTY.md`** — nowy dokument wg `.claude/relai/templates/SPEC_PROFILE.md`, sekcja
   „Profil prompty": artefakt, plik, wersja, data, co się zmieniło, po co.
2. **Inwentarz skryptem, nie okiem** — `core/templates/*.md`, `core/templates/HTML_PLAN/`,
   `adapters/claude-code/commands/*.md`, `adapters/claude-code/skills/*/SKILL.md`,
   `adapters/cursor/rules/*.mdc`. Liczby w rejestrze zgadzają się z liczbami z dysku.
3. **Wersja i data startowa z historii gita** (`git log --diff-filter=A`), nie z domysłu. Artefakt
   bez wiarygodnej daty dostaje jawny dopisek zamiast zgadywanej wartości.
4. **`docs/STATE.md`** — jedno zdanie, że rejestr istnieje. `CLAUDE.md` bez zmian.

Poza zakresem, choć kusi: zmiana jakiegokolwiek artefaktu, progi i rotacja rejestru (E4 planu),
odtwarzanie historii wersji sprzed rejestru, zakładanie `docs/archiwum/artefaktow/` na zapas.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `docs/ARTEFAKTY.md` istnieje i ma wszystkie kolumny wymagane przez `SPEC_PROFILE.md`,
      sekcja „Profil prompty" — sprawdzone **czytaniem specyfikacji w tej sesji**, nie z pamięci.
- [ ] Liczba pozycji rejestru zgadza się z liczbą plików na dysku, **wypisaną komendą**;
      rozbieżność jest wypisana jawnie razem z powodem, a nie ukryta.
- [ ] Zmiana dowolnego artefaktu w tej sesji (choćby dopisanie spacji i jej cofnięcie) **nie**
      wywołuje już ostrzeżenia hooka `profile-rules` o braku rejestru — dowód z wyjścia hooka.
- [ ] `node core/tools/validate-adapters.js` kończy się kodem **0**.
- [ ] `git status --short` nie pokazuje plików spoza zakresu tej odnogi.

## Na koniec (rytuał obowiązkowy — bez niego odnoga NIE jest zamknięta)

1. **`ODNOGA.md`** — status → `ZAMKNIĘTA <data>`, sekcja „Wynik" wypełniona (co powstało, czego nie
   i dlaczego).
2. **`docs/plany/HIGIENA_DOKUMENTOW/STATUS.md`** — linia tej odnogi w sekcji „Odnogi" →
   `ZAMKNIĘTA <data>`. Tabeli etapów i dziennika wdrożenia **nie ruszasz**.
3. **`docs/DZIENNIK.md`** — wpis wg `SPEC_DZIENNIK.md` (Zrobione / Zweryfikowane — jak dokładnie /
   Świadomie odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy", z linią autora
   `RelAI (<model>) + <git config user.name>`.
4. **`docs/STATE.md`** — jedno zdanie o rejestrze.
5. **Commit** — conventional message po angielsku; propozycja, nie wykonanie bez zgody.
