# ODNOGA — komunikat o nowej sesji na pasku cache jako decyzja w % limitu

Plan: brak (wątek samodzielny) · Etap-źródło: — · Utworzona: 2026-10-14 · Status: **OTWARTA** ·
Wykonawca: Opus 5.5 w świeżej sesji

## Cel

Drugi wiersz paska cache (`relai-cache-keeper`) pojawia się tylko wtedy, gdy przekazanie do nowej
sesji realnie się opłaca, i mówi jednym zdaniem w % limitu 5 h, ile kosztuje wiadomość tutaj, a ile
po przekazaniu — z kosztem samego przekazania wliczonym. Liczba nigdy nie przeczy rekomendacji,
a brzmienie Łukasz zaakceptował na zrzucie.

## Skąd się wzięła

2026-10-14 Łukasz pokazał zrzut paska: `cache zimny · nowa sesja zwróci się po 66 turach ·
≈ $4.01 → $0.06/turę` z przyciskami `Przekaż (RelAI)` i `Zostań` — i napisał, że nie rozumie ani
komunikatu, ani jego intencji. Diagnoza w sesji (kod `cache-keeper/hooks/economics.ts`, Z9 wątku
AUDYT_MODOW, commit `1faf223`):

1. **Sprzeczność liczby z rekomendacją.** Pasek pokazuje się z reguły „cache zimny i kontekst
   > 2× warstwa startu” (`reason: 'cold'`), ale niesie liczbę z reguły zwrotu — 66 tur znaczy
   „nie opłaca się”, a przycisk namawia do przekazania. Test `economics.test.ts:64` utrwala ten
   przypadek (56 tur).
2. **Nieuczciwe porównanie.** `$4.01` to jednorazowa kara zimnego cache (ponowny zapis 497k),
   `$0.06` to stały koszt tury po przekazaniu na ciepłym cache. Stały koszt tury tutaj po
   rozgrzaniu wynosi rząd $0.25, nie $4.01.
3. **„Przekaż” nie omija tej kary.** Tura przekazania idzie w tym samym zimnym czacie
   (`costs.handoff = costs.here`), więc też płaci ponowny zapis.
4. **Dolary nie są rachunkiem.** To ekwiwalent cennika API; przy subskrypcji realnym ograniczeniem
   jest limit 5 h i tygodniowy, a ten komunikat mówi o nich na końcu albo wcale.
5. **Żargon:** „zwróci się”, „tura”, „warstwa startu” nie mówią, co zrobić ani co się zyska.

Decyzje Łukasza z tej samej rozmowy: jednostka — **% limitu 5 h najpierw**, $ tylko w pełnym
rachunku `/cache`; pasek — **tylko gdy realnie się opłaca** (reguła „zimny + duży” znika jako
wyzwalacz); zimny cache — **uczciwie wliczyć koszt tury przekazania**, bez zmiany mechaniki
przekazania.

## Zakres

1. `cache-keeper/hooks/economics.ts` — jeden wyzwalacz zdarzenia (opłacalność liczona uczciwie:
   stały koszt tury tu po rozgrzaniu vs po przekazaniu, koszt przekazania z ewentualnym ponownym
   zapisem zimnego kontekstu); `barText` w % limitu 5 h, słowami decyzji, bez „zwrotu” i „tury”;
   rachunek `/cache` (`reckoning`) zostaje w $ i dostaje linie spójne z nową regułą.
2. `cache-keeper/hooks/register.tsx` — `eventText`/`eventRow` (podział wiersza na pogrubione
   słowa i wyciszone liczby: dziś po `' · ≈ '`), ewentualnie osobny, krótki komunikat
   „cache wygasł, następna wiadomość przeczyta kontekst od nowa” — tylko jeśli Łukasz go zechce
   przy kalibracji.
3. `cache-keeper/hooks/economics.test.ts`, `cache-keeper/hooks/handoff-economics.test.ts` —
   testy nowej reguły i brzmienia; przypadek ze zrzutu (497k, zimny) jako fixtura; przypadek
   „brak pomiaru tempa limitu” (`limitPace` → `null`).
4. Dokumenty: `docs/zasoby/PANEL_RELAI/STYL_PASKOW_CLAUDE.md` (wiersz 33 i okolice 237),
   `docs/KOMENDY.md` (wiersz 62), wersja `cache-keeper/.claude-plugin/plugin.json` (dziś 0.7.1)
   i jej ślady w repo; wydanie tylko po zgodzie Łukasza.

## Poza zakresem

- Mechanika przekazania (`startHandoff`, prompty przekazania, `clearAndContinue`) — bez zmian.
- „Tańsza ścieżka” przy zimnym cache (nowa sesja z dokumentów bez tury przekazania) — odrzucona
  2026-10-14, nie wraca w tej odnodze.
- Wykrywanie typu konta (subskrypcja vs klucz API) — odrzucone 2026-10-14.
- Karta limitu (LIMIT_CHECKPOINT), baterie pierwszego wiersza paska, stopka sesji (PASKI_W_STOPCE).
- Cennik (`pricing.ts`) i pomiar warstwy startu (`start-layer.ts`) — tylko odczyt.
- Pliki `docs/plany/PANEL_CODEX/` i `docs/zasoby/PANEL_RELAI/makiety/` — nie dotykasz, nie
  commitujesz.

## Weryfikacja

- [ ] Przypadek ze zrzutu (kontekst 497k, cache zimny, liczby z 2026-10-14) policzony nowym kodem:
      albo pasek milczy, albo jego liczba i rekomendacja mówią to samo — wynik w dzienniku obok
      starego brzmienia (obie wersje w jednym przebiegu).
- [ ] Żadne brzmienie paska nie zawiera „zwróci się”, „tur” ani „warstwy startu” (grep po
      `cache-keeper/hooks/*.ts*` z kontrolą pozytywną na starym kodzie).
- [ ] Brak pomiaru tempa limitu ma własne, zaakceptowane zachowanie i test.
- [ ] Brzmienie wiersza zaakceptowane przez Łukasza na zrzucie z moda na żywo, przed wydaniem —
      jego słowa we wpisie.
- [ ] `claude plugin test .` i `claude plugin validate .` w `cache-keeper/` zielone; testy rdzenia
      zielone (komendy jak w `docs/PULAPKI.md` P-024).
- [ ] `STYL_PASKOW_CLAUDE.md` i `KOMENDY.md` opisują nowe zachowanie; `grep -r` po starym numerze
      wersji rozstrzygnięty.
- [ ] Katalog roboczy `.claude/relai/work/_fixy/KOMUNIKAT_ZWROTU/` przejrzany raportem
      (`node .claude/relai/tools/clean-work.js raport`) i skasowany po „tak”; liczby przed i po we
      wpisie dziennika, artefakty spoza niego wypisane z nazwy.

## Wynik

—
