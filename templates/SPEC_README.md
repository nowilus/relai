# SPEC — `README.md` projektu

Specyfikacja dla LLM (D-60). Nie kopiuj tego pliku. Wygeneruj `README.md` **w języku projektu**.

## Rola

Wizytówka. Jedyny dokument w repo pisany dla kogoś, kto o projekcie nie wie nic — łącznie z tym,
czy w ogóle chce go uruchamiać. Odpowiada na trzy pytania: **co to jest**, **jak to uruchomić**,
**gdzie szukać reszty**.

`README.md` nie jest miejscem na stan prac (to `STATE.md`), historię (to `DZIENNIK.md`) ani reguły
pracy agenta (to `CLAUDE.md`).

## Odbiorca

Świat zewnętrzny: nowa osoba w zespole, współpracownik, przyszły Ty za pół roku.

## Struktura sekcji

1. **Nazwa + jedno zdanie** — co to jest i czyj problem rozwiązuje. Bez marketingu, bez „nowoczesne
   rozwiązanie klasy enterprise".
2. **Do czego to służy** — 3–6 zdań albo lista punktów: konkretne możliwości, nie obietnice.
3. **Jak uruchomić** — kroki, które da się wykonać wklejając je po kolei: wymagania (wersje),
   instalacja zależności, konfiguracja (`.env` — **wyłącznie nazwy zmiennych, nigdy wartości**),
   uruchomienie, sprawdzenie, że działa. Przy projekcie bez kodu ta sekcja mówi, jak korzystać
   z zawartości repo.
4. **Mapa dokumentacji** — tabela `Dokument | Co znajdziesz` z linkami do `docs/`. Kolumna druga to
   pół zdania. To jest sekcja, dla której RelAI generuje ten plik: nowa osoba ma stąd trafić
   wszędzie w jednym kliknięciu.
5. **Status i kontakt** *(opcjonalnie)* — jedno zdanie o dojrzałości projektu i do kogo pisać.

Przy pierwszej generacji sekcje 2 i 3 mogą być szkieletem z jawnym znacznikiem `DO UZUPEŁNIENIA` —
lepiej pusty slot niż zmyślona instrukcja uruchomienia.

## Polityka aktualizacji

| Kiedy | Co robisz |
|---|---|
| Zmiana sposobu uruchomienia, nowa zmienna w `.env`, nowa zależność | aktualizujesz sekcję „Jak uruchomić" w tej samej turze |
| Nowy dokument w `docs/` | dopisujesz wiersz do mapy dokumentacji |
| Zmiana tego, czym projekt jest | aktualizujesz nagłówek i sekcję „Do czego to służy" |
| Postęp prac, zamknięty etap, nowa decyzja | **nie tutaj** — `STATE.md` / `DZIENNIK.md` / `DECYZJE.md` |

## Zakazy

- Żadnych wartości sekretów, tokenów, haseł ani prywatnych URL-i (D-42).
- Żadnych zrzutów ekranu i binariów w treści — te idą do `docs/zasoby/` i są linkowane.
- Żadnych list „co zrobiono" — README opisuje stan teraźniejszy, nie drogę do niego.

## Przykład (projekt polski, profil `app`)

```markdown
# Parkly

Rezerwacja firmowych miejsc parkingowych — pracownik rezerwuje miejsce na konkretny dzień,
biuro widzi obłożenie.

## Do czego to służy

- Rezerwacja miejsca na wybrany dzień, z listą oczekujących, gdy brak wolnych.
- Podgląd obłożenia parkingu dla administracji biura.
- Powiadomienia mailowe o przyznaniu miejsca z listy oczekujących.

## Jak uruchomić

Wymagania: Node.js 20+, PostgreSQL 15+.

1. `npm install`
2. Skopiuj `.env.example` do `.env` i uzupełnij: `DATABASE_URL`, `SMTP_HOST`, `SMTP_USER`,
   `SMTP_PASSWORD`.
3. `npm run db:migrate`
4. `npm run dev` — aplikacja startuje na `http://localhost:3000`.
5. Sprawdzenie: strona `/health` zwraca `{"status":"ok"}`.

## Mapa dokumentacji

| Dokument | Co znajdziesz |
|---|---|
| [docs/STATE.md](docs/STATE.md) | stan projektu na dziś — dla nietechnicznych i technicznych |
| [docs/DZIENNIK.md](docs/DZIENNIK.md) | historia sesji i otwarte ryzyka |
| [docs/USTAWIENIA.md](docs/USTAWIENIA.md) | ustalenia i preferencje projektu |
| [docs/KOMENDY.md](docs/KOMENDY.md) | komendy i frazy RelAI dostępne w tym projekcie |
| [CLAUDE.md](CLAUDE.md) | reguły pracy agenta |
```
