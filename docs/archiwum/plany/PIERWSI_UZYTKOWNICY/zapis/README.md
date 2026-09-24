# Zapis źródłowy materiału demo (E1)

Dosłowne wyjścia sesji, z których powstał materiał demonstracyjny, oraz kopie plików, które te sesje
wytworzyły. Plan wymaga zachowania materiału źródłowego (sekcja 5), a **Aneks A** stawia warunek
twardszy: każda klatka pokazująca plik albo odpowiedź agenta ma mieć pokrycie w tym zapisie.

Zapis powstał w katalogu roboczym etapu i został tu przeniesiony przy zamykaniu E1, żeby przeżył
sprzątanie artefaktów. Tabela pokrycia i sposób pomiaru: [`../DEMO.md`](../DEMO.md).

| Plik | Co zawiera |
|---|---|
| `01-inicjalizacja.txt` | inicjalizacja RelAI w neutralnym projekcie kontrolnym (pierwsza próba odbita ochroną `.claude/` — P-014) |
| `02-plan.txt` | prośba o plan płatności; powstał `PLAN.md` + `STATUS.md` z pięcioma etapami |
| `03-akceptacja.txt` | akceptacja planu: zamrożenie, `PROMPT_ETAP_1.md`, cztery bramki manualne |
| `04-swieza-sesja.txt` | **świeża sesja**, „Kontynuujemy pracę" — źródło dwóch cytatów ze sceny `sesja` |
| `05-karta-etapu.txt` | **świeża sesja**, `/relai-stage` — źródło cytatów z karty potwierdzenia |
| `06-decyzja.txt` | zapis decyzji D-01 (lokalne pliki zamiast bazy, powód: praca offline) |
| `07-decyzja-swieza-sesja.txt` | **świeża sesja** odnajduje D-01 i wskazuje `docs/DECYZJE.md:8` jako źródło |
| `plan-status.md` | kopia `STATUS.md` planu PLATNOSCI — źródło nazw i statusów etapów na klatkach |
| `plan-plan.md` | kopia `PLAN.md` planu PLATNOSCI — kontekst, z którego wzięły się etapy |
| `projekt-state.md` | kopia `STATE.md` projektu kontrolnego po przebiegu |

**Czego tu nie ma:** kodu uczestników, sekretów ani pełnych rozmów osób trzecich. Projekt kontrolny
był neutralnym projektem założonym na potrzeby pomiaru (`%TEMP%/relai-pierwsi-uzytkownicy-sklep-demo`),
nie cudzym repozytorium. Wyjścia zawierają wyłącznie odpowiedzi agenta na prompty wypisane
w [`../DEMO.md`](../DEMO.md), sekcja b).
