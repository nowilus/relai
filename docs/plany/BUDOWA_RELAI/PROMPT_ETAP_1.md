# PROMPT_ETAP_1 — Fundament repo pluginu + inicjalizacja projektu

Plan: BUDOWA_RELAI • Etap: **E1 z E10** • Wygenerowano: 2026-08-07 (architekt: Fable) • Wykonawca: **Opus**

> **Kontrola modelu:** ten etap wykonuj wyłącznie na modelu **Opus** (decyzja D-85 — maksymalna jakość). Jeśli sesja działa na innym modelu — zatrzymaj się i poproś użytkownika o przełączenie, zanim cokolwiek zrobisz.

## Co przeczytać na start (w tej kolejności, nic więcej)

| Plik | Po co |
|---|---|
| `CLAUDE.md` | reguły procesu, sekcja niemutowalna, definicja ukończenia |
| `docs/DECYZJE.md` | decyzje zamrożone — grupy: Tożsamość (D-01…07), Dokumenty (D-10…19), Interakcja (D-20…27), Szablony (D-60…63) |
| `docs/plany/BUDOWA_RELAI/PLAN.html` | sekcje 5 (architektura pluginu), 6 (struktura projektu użytkownika), 13 (Aneks A) — czytaj jako źródło wymagań |
| `docs/plany/BUDOWA_RELAI/STATUS.md` | stan planu |
| `docs/USTAWIENIA.md` | preferencje projektu |

## Decyzje już podjęte — NIE otwieraj ich ponownie

- Nazwa: RelAI; plugin Claude Code; samowystarczalny; komendy EN z prefiksem `relai-` (D-01…D-05).
- Start projektu: zgoda → dokładnie 3 pytania (język-wykryty / git / profil-wykryty) → generacja struktury (D-20). Odmowa → tryb gościa + marker, bez ponownego pytania (D-21).
- Szablony dokumentów to SPECYFIKACJE dla LLM — dokumenty generowane w języku projektu, nie kopiowane statycznie (D-60).
- Dokumenty rdzeniowe i struktura `docs/` — dokładnie wg PLAN sekcja 6 (D-10…D-12).
- Hooki dopiero w E5; planowanie w E3; komendy operacyjne w E7; pełna adopcja w E9. Nie wychodź poza zakres E1.

## Stan wyjściowy

Repo `github.com/nowilus/relai` (prywatne) podpięte jako origin; w repo: master plan, rejestr decyzji, dziennik, dokumenty dogfoodingowe. Brak jakiegokolwiek kodu pluginu. Folder lokalny: `C:\Users\Lukasz\Desktop\RelAI`.

## Zakres etapu

1. **Manifest pluginu**: `.claude-plugin/plugin.json` (name: `relai`, version: `0.1.0`, opis EN: "Your project remembers everything — documentation-first process framework for Claude Code") + `marketplace.json` w tym samym repo, tak by działała instalacja: `/plugin marketplace add nowilus/relai` → `/plugin install relai`.
2. **Skill `relai-core` (wersja minimalna E1)** — zachowanie przy pierwszym prompcie w folderze:
   - Folder bez struktury RelAI → pytanie o zgodę na inicjalizację; po zgodzie paczka 3 pytań (AskUserQuestion, defaulty z auto-detekcji) → generacja plików z pkt 3.
   - Folder z istniejącą zawartością → propozycja NIEDESTRUKCYJNEGO dołączenia struktury (nic istniejącego nie jest ruszane) albo trybu gościa; pełna adopcja z analizą zastanego przyjdzie w E9 — powiedz to wprost użytkownikowi.
   - Odmowa → marker trybu gościa (proponowana lokalizacja: `.claude/relai.json` w projekcie, `{"mode":"guest"}`) i koniec tematu w tym folderze.
   - Wykrywanie struktury: istnienie `docs/USTAWIENIA.md` z wpisem „Wersja RelAI". Opisy skilla: po angielsku + polskie frazy wyzwalające (Aneks A pkt 4.3).
3. **Specyfikacje dokumentów E1** (w `templates/`, jako specyfikacje-instrukcje dla LLM, każda: rola, odbiorca, struktura sekcji, polityka aktualizacji, przykład): projektowy `CLAUDE.md` (krótki router + rytuał startu + definicja ukończenia + sekcja niemutowalna Karpathy + dobór modeli jako rekomendacja D-38), `README.md` projektu, `docs/STATE.md` (dwuwarstwowy, NADPISYWANY), `docs/DZIENNIK.md` (szablon wpisu + sekcja ryzyk), `docs/USTAWIENIA.md` (tabela: data/pytanie/decyzja + **wpis „Wersja RelAI: 0.1.0" przy inicjalizacji** — Aneks A pkt 4.2), `docs/KOMENDY.md` (generowany ze stanu faktycznego pluginu — w E1 zawiera to, co realnie działa, z adnotacją, że lista rośnie z wersjami).
4. **Konwencja hook-guard** (sama konwencja, bez hooków): udokumentuj w README pluginu, że każdy przyszły hook zaczyna od cichego sprawdzenia struktury RelAI i poza projektami RelAI kończy się bez efektu (Aneks A pkt 4.1).
5. **Testy ręczne**: instalacja pluginu z repo; init na czystym folderze testowym o ścieżce ze spacją i polskim znakiem (np. `C:\Users\Lukasz\Desktop\Próba RelAI`); scenariusz odmowy; scenariusz folderu z zawartością. Foldery testowe posprzątaj po testach.
6. **Git**: commity conventional EN (bez stopek atrybucji), push na `origin main`.

## Weryfikacja (wszystkie punkty muszą przejść)

- [ ] `/plugin marketplace add nowilus/relai` + `/plugin install relai` działa na tej maszynie.
- [ ] Pierwszy prompt w pustym folderze → zgoda → 3 pytania → powstaje komplet: `CLAUDE.md`, `README.md`, `docs/{STATE,DZIENNIK,USTAWIENIA,KOMENDY}.md` w języku projektu, z wpisem wersji RelAI w USTAWIENIA.
- [ ] Ścieżka ze spacją i polskimi znakami nie psuje niczego.
- [ ] Odmowa → tryb gościa, marker zapisany, brak ponownego pytania w kolejnej sesji w tym folderze.
- [ ] Folder z zawartością → propozycja niedestrukcyjna, nic istniejącego nietknięte.
- [ ] Wygenerowany projektowy CLAUDE.md zawiera sekcję niemutowalną i rytuał startu sesji.

## Na koniec (rytuał obowiązkowy — bez niego etap NIE jest ukończony)

1. `docs/plany/BUDOWA_RELAI/STATUS.md`: E1 → ZREALIZOWANY (data), dziennik wdrożenia — wpis.
2. `docs/DZIENNIK.md`: wpis wg szablonu (Zrobione / Zweryfikowane — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka), na końcu sekcji „Wpisy", autor: RelAI (Opus).
3. `CLAUDE.md` (repo): tabela „Stan prac" — aktualizacja.
4. **Wygeneruj `PROMPT_ETAP_2.md`** w tym folderze: na bazie PLAN sekcja 8 (E2 — rdzeń dokumentacyjny: pełne specyfikacje LEKCJE/DECYZJE, graduacja i kompresja, rotacja dziennika, rytuały sesji, definicja ukończenia, frazy naturalne) + realny stan po E1 + lekcje z tego etapu. Format: dokładnie jak ten prompt (kontrola modelu, co przeczytać, decyzje, zakres, weryfikacja, „Na koniec").
5. Commit + push.
