# relai-planning — plan główny w HTML i nadpisanie lokalne szablonu

Plik doczytywany skilla `relai-planning`. Otwierasz go, gdy plan główny powstaje w formacie HTML (odpowiedź z Kroku 3 albo ustawienie projektu) — przed skopiowaniem szablonu — oraz gdy człowiek chce zmienić styl planów HTML.

## Plan główny w HTML (D-32)

W HTML powstaje **wyłącznie plan główny**. `STATUS.md`, prompty etapowe i MINIPLAN-y zostają
w Markdown — HTML jest dla ludzi, Markdown dla agentów.

### Skąd bierzesz szablon — kolejność jest wiążąca

1. **`docs/zasoby/HTML_PLAN/`** — lokalne nadpisanie projektu (D-62). Istnieje → używasz go
   i nie zaglądasz dalej. **Lokalne ma zawsze pierwszeństwo.**
2. **`.claude/relai/templates/HTML_PLAN/`** — kopia z pluginu, utrzymywana przez hook
   `session-context`.
3. Nie ma ani jednego → powiedz to wprost i poproś o uruchomienie sesji z `--add-dir` na katalog
   pluginu. **Nie improwizujesz własnego HTML-a** — plan ma wyglądać tak samo w każdym projekcie.

### Procedura — sześć kroków

Pełny opis: `.claude/relai/templates/SPEC_PLAN_HTML.md`. Przebieg wypisany tutaj, bo odesłanie
do pliku bywa pomijane (L-0011):

1. **Skopiuj** `szablon.html` do `docs/plany/<TEMAT>/PLAN.html`.
2. **Wypełnij znaczniki nagłówkowe:** `{{JEZYK}}`, `{{TYTUL}}`, `{{PODTYTUL}}`, `{{DATA}}`,
   `{{STATUS}}`, `{{LICZBA_ETAPOW}}`, `{{PRACOCHLONNOSC}}`, `{{MODEL_WYKONAWCZY}}`, `{{PODPIS}}`,
   `{{TEMAT_PLANU}}`.
3. **Wypełnij `{{SEKCJA_1}}`…`{{SEKCJA_10}}`** treścią wg `SPEC_PLAN.md`, składając ją z gotowych
   fragmentów z `komponenty.html` — **bierzesz tylko te, które ten plan potrzebuje**.
   `{{SZEPT_N}}` to półzdanie na marginesie nagłówka sekcji.
4. **Symulator** — tylko gdy plan zawiera wyliczenia. Ma je: wklejasz komponent 10 (karta pól)
   i komponent 12 (skrypt) w miejsce `/*{{SKRYPT_SYMULATORA}}*/`, po czym wypełniasz znaczniki,
   które razem z nimi przyszły. Nie ma: **nie wklejasz nic i nie wypełniasz niczego** — znacznik
   zostawiasz nietknięty, builder usunie go po cichu. Żadnych wartości pustych.
5. **Uruchom builder:** `node <katalog szablonu>/zbuduj.js docs/plany/<TEMAT>/PLAN.html`. Osadza
   fonty, sprząta znacznik symulatora i **wypisuje pozostałe niewypełnione znaczniki, kończąc
   kodem 1** — to błąd, nie ostrzeżenie.
6. **Otwórz plik i sprawdź**, że symulator liczy, sekcje się zwijają i strona nie przewija się
   w poziomie. Bez tego kroku plan nie jest gotowy.

Zakazy nośnika (pełna lista w `SPEC_PLAN_HTML.md`): zero żądań sieciowych, zero fioletu i poświaty,
zero emoji, zero animacji ozdobnych — w szczególności **żadnej kropki wędrującej po diagramie**.
Obsługa `prefers-reduced-motion` jest w szablonie; nie usuwasz jej.

---

## Nadpisanie lokalne szablonu (D-62)

Projekt może mieć **własną wersję szablonu HTML**, która wygrywa z wersją z pluginu.

**Pytanie pada raz na projekt**, po pokazaniu **pierwszego** wygenerowanego planu HTML — wtedy,
gdy użytkownik ma plik przed oczami i wie, o czym decyduje. Zanim zapytasz, sprawdź w
`docs/USTAWIENIA.md` wiersz „Szablon planu HTML" i warstwę globalną; jest odpowiedź → **nie
pytasz** (L-0006). To pytanie **nie należy** do jednego wywołania z Kroku 3 i nie łamie zakazu
pytania po wygenerowaniu planu: tamten zakaz dotyczy pytań o rodzaj, format i model, bez których
planu nie da się napisać.

Odpowiedź „zostawiam domyślny" też zapisujesz — inaczej pytanie wróci przy następnym planie.

Zmiana stylu — kolejno:

1. **Skopiuj całe drzewo** `.claude/relai/templates/HTML_PLAN/` do `docs/zasoby/HTML_PLAN/`
   (szablon, komponenty, `zbuduj.js` i katalog `fonty/` — bez fontów builder nie ma czego osadzić).
2. **Zmień wygląd wyłącznie przez tokeny w `:root`** w `docs/zasoby/HTML_PLAN/szablon.html` —
   kolory, promienie, kroje. Nie dopisujesz reguł CSS pod konkretny plan; przy następnej zmianie
   szablonu nikt nie odgadnie, co było celowe.
3. **Dopisz wiersz do `docs/USTAWIENIA.md`** z dzisiejszą datą: czego dotyczy („Szablon planu
   HTML"), decyzja („nadpisanie lokalne w `docs/zasoby/HTML_PLAN/`, ma pierwszeństwo przed wersją
   z pluginu") — plus jednym półzdaniem, co zmieniono. **Ten zapis przechodzi przez hook
   `config-protection`**, który zażąda potwierdzenia — to jest w porządku, bo użytkownik przed
   chwilą zgodził się na zmianę stylu. Zapisu **nie odpuszczasz po cichu**: bez wiersza pytanie
   wróci przy następnym planie (L-0006). Blokada bez możliwości potwierdzenia (np. sesja
   nieinteraktywna) → powiedz wprost, że wiersz czeka na dopisanie, i pokaż jego treść.
4. **Przegeneruj plan** z lokalnej kopii, żeby użytkownik zobaczył efekt w tej samej turze.

Od tej chwili **każdy** plan HTML w tym projekcie powstaje z `docs/zasoby/HTML_PLAN/`, także po
aktualizacji pluginu.

### Dlaczego `docs/zasoby/`, a nie `.claude/relai/`

`.claude/relai/` jest **cache'em pluginu**: hook `session-context` nadpisuje tam pliki przy każdym
starcie sesji, a `.gitignore` z `*` trzyma cały katalog poza repozytorium. Nadpisanie schowane
w cache'u przeżyłoby aktualizację pluginu (hook pisze tylko do `.claude/relai/templates/`), ale zniknęłoby przy
klonowaniu repo, na drugiej maszynie i u współpracownika — a to jest świadoma decyzja projektu,
nie plik tymczasowy. `docs/zasoby/` jest w repo (D-11, D-24), wchodzi do backupu i jest widoczne
w diffie. Dlatego nadpisanie mieszka tam (mitygacja R6).
