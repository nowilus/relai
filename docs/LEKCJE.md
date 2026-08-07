# LEKCJE — budowa RelAI

Rejestr korekt i wniosków zamienionych w zasady pracy. Start sesji czyta wyłącznie „Zasady aktywne".

## Zasady aktywne

1. Każda specyfikacja dokumentu kończy się realnym, kompletnym przykładem — bez niego jest martwa.
   (L-0001)
2. Nie obiecuj w dokumentach użytkownika tego, co jeszcze nie działa; nowa fraza wchodzi do
   `KOMENDY.md` dopiero w wersji, w której realnie działa. (L-0002)
3. Ostrzeżenie `claude plugin validate` o root `CLAUDE.md` jest świadomym skutkiem dogfoodingu —
   nie „naprawiaj" go przenoszeniem pliku. (L-0003)
4. Plugin RelAI pozostaje odinstalowany przez cały czas budowy; instalacja docelowa dopiero po
   ostatnim etapie. Testy zachowań skilla wykonuj ręcznie i pisz wprost, że mechanizm
   auto-wyzwalania nie był mierzony. (L-0004)
5. Zanim opiszesz zachowanie agenta w skillu, sprawdź, czy da się je zweryfikować z wnętrza sesji
   wykonującej etap; jeśli nie — zaplanuj weryfikację tam, gdzie jest możliwa, zamiast deklarować
   ją jako wykonaną. (L-0005)
6. „Pytanie przy każdym planie" znaczy „pytanie raz na projekt": zanim zapytasz, sprawdź
   `USTAWIENIA.md` i warstwę globalną, a gdy próg rozstrzyga jednoznacznie — nie pytaj wcale,
   tylko powiedz, co przyjąłeś. (L-0006)
7. Test zamrożenia (i każdy inny test „czegoś nie wolno") wymaga dowodu negatywnego: pokaż, że
   chroniony fragment ma nadal pierwotne brzmienie, nie tylko że nowy wpis powstał. (L-0007)
8. Po podbiciu wersji pluginu przepuść repo `grep`-em po starym numerze i rozstrzygnij **każde**
   trafienie: historyczne zostaje, aktualne się zmienia. (L-0008)

## Lekcje

### L-0001 — Specyfikacja bez przykładu · 2026-08-07 · AKTYWNA

- **Trigger:** pierwsze wersje `SPEC_*` w E1 opisywały strukturę dokumentu bez pokazania gotowego
  wyniku.
- **Przyczyna:** założenie, że opis sekcji wystarczy modelowi generującemu dokument.
- **Zasada:** każda specyfikacja kończy się sekcją „Przykład" z kompletnym, realnym dokumentem
  w języku projektu.
- **Źródło:** przegląd zamykający etap E1 (nie korekta użytkownika).

### L-0002 — Obietnica zamiast stanu faktycznego · 2026-08-07 · AKTYWNA

- **Trigger:** pokusa, by w `KOMENDY.md` wypisać komendy `/relai-*` zaplanowane na kolejne etapy.
- **Przyczyna:** ściąga wygląda kompletniej, gdy zawiera pełną listę docelową.
- **Zasada:** dokument użytkownika opisuje wyłącznie to, co działa w zainstalowanej wersji; rzeczy
  planowane nie istnieją w ściądze.
- **Źródło:** przegląd zamykający etap E1 (nie korekta użytkownika).

### L-0003 — „Naprawianie" świadomego ostrzeżenia · 2026-08-07 · AKTYWNA

- **Trigger:** `claude plugin validate --strict` zgłasza, że `CLAUDE.md` w korzeniu pluginu nie jest
  ładowany jako kontekst projektu.
- **Przyczyna:** to repo jest jednocześnie pluginem i projektem RelAI (dogfooding, D-82) — walidator
  nie zna tego przypadku.
- **Zasada:** ostrzeżenie zostaje; nie przenoś `CLAUDE.md` i nie zmieniaj struktury repo, by je
  uciszyć.
- **Źródło:** przegląd zamykający etap E1 (nie korekta użytkownika).

### L-0004 — Plugin odinstalowany na czas budowy · 2026-08-07 · AKTYWNA

- **Trigger:** po testach instalacji w E1 plugin został na maszynie w scope `user`; użytkownik
  polecił go odinstalować.
- **Przyczyna:** założenie, że zainstalowana wersja przyda się do testów w kolejnych etapach.
  W praktyce nieaktualna wersja pluginu mogłaby wpływać na sesje budowy.
- **Zasada:** przez cały czas budowy plugin pozostaje odinstalowany; testy zachowań wykonujesz,
  odtwarzając procedurę skilla ręcznie, i piszesz wprost, czego przez to nie zmierzono.
- **Źródło:** „odinstaluj, zainstalujemy sobie na sam koniec" (korekta użytkownika, 2026-08-07).

### L-0005 — Weryfikacja zaplanowana tam, gdzie niewykonalna · 2026-08-07 · AKTYWNA

- **Trigger:** E1 odłożył test auto-wyzwalania skilla „na start E2", a E2 nie mógł go wykonać,
  bo plugin jest odinstalowany (L-0004). Ryzyko R2 przeszło dwa etapy bez pomiaru.
- **Przyczyna:** przy planowaniu weryfikacji nie sprawdzono, czy warunki jej wykonania będą
  spełnione w etapie, do którego ją przeniesiono.
- **Zasada:** przenosząc weryfikację do późniejszego etapu, zapisz w prompcie tego etapu warunek,
  który musi być spełniony, żeby dała się wykonać; jeśli warunku nie da się zapewnić, przenieś
  weryfikację tam, gdzie się da.
- **Źródło:** przegląd zamykający etap E2 (nie korekta użytkownika).

### L-0006 — „Przy każdym planie" wzięte dosłownie · 2026-08-07 · AKTYWNA

- **Trigger:** pierwsza wersja skilla `relai-planning` zadawała pytanie o rodzaj planu zawsze,
  także wtedy, gdy próg PLAN/MINIPLAN rozstrzygał sprawę jednoznacznie, a format i model były już
  w `USTAWIENIA.md`.
- **Przyczyna:** decyzja D-39 mówi „przed powstaniem każdego planu RelAI pyta" — zapis odczytany
  dosłownie, bez zestawienia z D-22 („zapytaj RAZ, zapisz, respektuj").
- **Zasada:** pytanie startowe planu pada raz na projekt, nie raz na plan. Przed pytaniem czytasz
  `USTAWIENIA.md` i warstwę globalną; gdy nie zostaje nic do zapytania, generujesz plan i mówisz
  jednym zdaniem, co przyjąłeś i skąd.
- **Źródło:** przegląd przy teście utrwalonej preferencji, etap E3 (nie korekta użytkownika).

### L-0007 — Test zakazu bez dowodu negatywnego · 2026-08-07 · AKTYWNA

- **Trigger:** test zamrożenia planu początkowo sprawdzał tylko, czy powstał aneks — a to nie
  dowodzi, że sekcje planu pozostały nietknięte.
- **Przyczyna:** mylenie „nowy artefakt istnieje" z „stary artefakt się nie zmienił". Pierwsze jest
  łatwe do sprawdzenia i dlatego kuszące.
- **Zasada:** test zachowania typu „tego nie wolno ruszać" musi pokazać pierwotne brzmienie
  chronionego fragmentu po operacji, obok dowodu, że zmiana wylądowała tam, gdzie miała.
- **Źródło:** przegląd zamykający etap E3 (nie korekta użytkownika).

### L-0008 — Numer wersji żyjący w sześciu miejscach · 2026-08-07 · AKTYWNA

- **Trigger:** podbicie 0.2.0 → 0.3.0 objęło manifesty, README i `SPEC_KOMENDY.md`, ale numer
  w przykładzie wewnątrz `SPEC_USTAWIENIA.md` został stary — wyłapany dopiero `grep`-em.
- **Przyczyna:** wersja występuje też w przykładach i w zdaniach historycznych, więc lista „miejsc
  do zmiany" prowadzona z pamięci zawsze będzie niepełna.
- **Zasada:** po podbiciu wersji uruchamiasz `grep` po starym numerze w całym repo i rozstrzygasz
  każde trafienie osobno — historyczne zostaje (i wiesz dlaczego), aktualne się zmienia.
- **Źródło:** przegląd zamykający etap E3 (nie korekta użytkownika).
