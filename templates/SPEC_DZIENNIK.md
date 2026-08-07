# SPEC — `docs/DZIENNIK.md`

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Wygeneruj `docs/DZIENNIK.md` **w języku
projektu** (nazwa pliku też podąża za językiem: `JOURNAL.md` dla projektu angielskiego).

## Rola

Pamięć projektu między sesjami. Odpowiada na pytania: *co się wydarzyło*, *co zostało sprawdzone
i jak*, *czego świadomie nie zrobiliśmy i dlaczego*, *co czeka na człowieka*. Dziennik jest jedynym
dokumentem, z którego wolno odtworzyć historię — pozostałe opisują teraźniejszość.

## Odbiorca

Agent w kolejnej sesji (główny) oraz zespół.

## Polityka aktualizacji: APPEND, nigdy edycja wstecz

- Nowe wpisy dopisujesz **na końcu sekcji „Wpisy"** (Aneks A pkt 4.4). Dopisywanie na końcu, a nie
  na górze, minimalizuje konflikty gita przy pracy zespołowej.
- Wpisów historycznych **nie edytujesz**. Coś okazało się nieprawdą → nowy wpis z korektą.
- Wpis powstaje **w tej samej turze**, w której skończyła się porcja pracy — nie „na koniec dnia",
  bo koniec dnia może nie nadejść.
- Datę bierzesz z kontekstu sesji, nigdy z pamięci modelu.

## Struktura pliku

1. **Nagłówek** — nazwa projektu.
2. **Sekcja „Stan otwartych ryzyk"** — stała, zawsze na górze pliku, **nadpisywana** (jedyny
   nadpisywany fragment dziennika). Tabela: `# | Ryzyko | Poziom | Status | Mitygacja`. Numeracja
   `R1, R2, …` jest ciągła i nigdy nie jest używana ponownie — ryzyko zamknięte zostaje w tabeli ze
   statusem `ZAMKNIĘTE` i datą. Poziomy: wysoki / średni / niski.
3. **Sekcja „Wpisy"** — chronologicznie, najstarszy u góry.

## Szablon wpisu (obowiązkowy, D-14)

Nagłówek trzeciego poziomu: `### RRRR-MM-DD — Temat`, pod nim linia autora, potem cztery sekcje
o stałych nazwach. Sekcję bez treści zostawiasz z jawnym „—", zamiast ją usuwać: brak treści to
informacja.

- **Zrobione** — fakty, nie intencje. Każda pozycja to rzecz, która istnieje w repo albo w świecie.
- **Zweryfikowane — jak dokładnie** — najważniejsza sekcja i najczęściej pomijana. Nie „przetestowano",
  tylko czym, na czym i z jakim wynikiem. Jeśli czegoś nie sprawdzono — napisz to wprost.
- **Świadomie odłożone** — co świadomie zostało poza zakresem i dlaczego. To jest bezpiecznik
  przeciw rozrostowi zakresu: pomysł spoza zakresu ląduje tutaj, nie w kodzie.
- **Do zrobienia przez człowieka** — rzeczy, których agent nie może albo nie powinien zrobić sam
  (decyzje biznesowe, dostępy, zakupy, akceptacje). Pozycja rozstrzygnięta później zostaje w miejscu
  z dopiskiem w nawiasie: „*(rozstrzygnięte RRRR-MM-DD — …)*".

**Linia autora:** `Autor: RelAI (<model>) + <użytkownik z git config>`. Podpis jest neutralny —
bez persony i bez osobowości (D-63). Gdy git nie jest skonfigurowany, sam `RelAI (<model>)`.

## Rotacja (D-14)

Gdy plik przekracza **50 KB** albo kończy się kwartał (co nastąpi wcześniej):

1. Przenieś starsze wpisy do `docs/archiwum/DZIENNIK_<rok>_Q<kwartał>.md`.
2. W bieżącym dzienniku zostaw jednoakapitowe streszczenie zarchiwizowanego okresu z linkiem do
   pliku archiwum.
3. Sekcja „Stan otwartych ryzyk" **nigdy** nie jest archiwizowana — zostaje w bieżącym pliku.

Rotację proponujesz użytkownikowi, nie wykonujesz po cichu.

## Zakazy

- Nie edytujesz i nie usuwasz starych wpisów (D-18: zamiast kasowania — adnotacja).
- Nie wpisujesz sekretów, tokenów ani wklejonych fragmentów `.env` (D-42).
- Nie dublujesz stanu bieżącego — to `STATE.md`.
- Nie piszesz wpisu bez sekcji „Zweryfikowane"; „nie weryfikowano" jest dopuszczalną treścią,
  brak sekcji nie jest.

## Przykład

```markdown
# DZIENNIK — Parkly

## Stan otwartych ryzyk

| # | Ryzyko | Poziom | Status | Mitygacja |
|---|---|---|---|---|
| R1 | Dostawca płatności niewybrany — blokuje wdrożenie | wysoki | OTWARTE | decyzja Łukasza do 15.08; wariant awaryjny: faktury ręczne |
| R2 | Brak testów listy oczekujących | średni | ZAMKNIĘTE 2026-08-05 | testy dopisane, pokrycie 71% |

## Wpisy

### 2026-08-07 — Lista oczekujących i powiadomienia

Autor: RelAI (Opus) + Łukasz

**Zrobione:**
- Kolejka oczekujących na miejsce: zapis, kolejność FIFO, zwolnienie miejsca przydziela pierwszej
  osobie z listy.
- Powiadomienie mailowe o przyznaniu miejsca (szablon + wysyłka przez SMTP).

**Zweryfikowane — jak dokładnie:**
- 14 testów jednostkowych kolejki (`npm test`) — wszystkie zielone; pokrycie modułu 88%.
- Test ręczny na środowisku testowym: dwie osoby na liście, zwolnienie miejsca → mail dotarł do
  pierwszej w ciągu ~20 s, druga została na liście.
- **Nie sprawdzono:** zachowania przy 100+ osobach w kolejce — brak danych testowych.

**Świadomie odłożone:**
- Powiadomienia push (wymagałyby aplikacji mobilnej — poza zakresem v1).
- Priorytety miejsc dla zarządu — czeka na decyzję biznesową.

**Do zrobienia przez człowieka:**
- Wybrać dostawcę płatności (R1).
- Potwierdzić treść maila z działem komunikacji.
```
