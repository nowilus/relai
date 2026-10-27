# Rytuał „Na koniec" etapu

Plik doczytywany skilla `relai-planning`. Otwierasz go, gdy etap planu został skończony — w tej
samej turze — albo gdy `/relai-stage` dokańcza etap pozostawiony `W TOKU`.

Wykonujesz rytuał **sam, w tej samej turze**, w której etap został skończony — tak jak definicja
ukończenia z `relai-core`, tylko dla etapu planu. Kolejność jest wiążąca; lista niżej jest jedynym
źródłem kroków — `SPEC_PROMPT_ETAPU.md` §9 i jego przykład niosą te same numery (walidator
porównuje wszystkie trzy listy). Skopiuj ją do odpowiedzi i odhaczaj:

```
Na koniec E<N>: [ ] 1 STATUS  [ ] 1a katalog roboczy  [ ] 2 dziennik  [ ] 3 bramki
                [ ] 4 STATE i dokumenty  [ ] 5 PROMPT_ETAP_N+1  [ ] 6 commit (propozycja)
```

## Rytuał „Na koniec" etapu

1. **`STATUS.md`** — etap N → `ZREALIZOWANY <data>`; etap N+1 → `GOTOWY DO STARTU`; linia
   w dzienniku wdrożenia (jedna, zwięzła); kolumna `Prompt` przy N+1 dostaje link zaraz po
   punkcie 5.
1a. **Katalog roboczy etapu** (`.claude/relai/work/TEMAT/E<N>/`) — zmierz
   (`node .claude/relai/tools/clean-work.js raport`), pokaż pozycje, skasuj po „tak"; artefakty,
   które musiały powstać poza tym katalogiem, wypisz z nazwy. **Obie liczby, przed i po, idą do
   wpisu z punktu 2** — dlatego krok stoi tutaj, a nie przy dokumentach. Weryfikacja etapu ma ten
   sam punkt: jeśli przeszedł, ten krok jest wyłącznie przeniesieniem liczb do wpisu.
2. **`docs/DZIENNIK.md`** — wpis wg `SPEC_DZIENNIK.md` na końcu sekcji „Wpisy": Zrobione /
   Zweryfikowane — jak dokładnie / Świadomie odłożone / Do zrobienia przez człowieka. Podpis
   w formacie `Autor: RelAI (<model>) + <git config user.name>` — bez członu użytkownika wpis nie
   jest kompletny (D-63). Przejrzyj tabelę „Stan otwartych ryzyk". Lekcje z etapu →
   `docs/LEKCJE.md` + odświeżony destylat „Zasady aktywne".
3. **Bramki manualne w `STATUS.md`** — wpis, który właśnie powstał, ma sekcję „Do zrobienia przez
   człowieka"; każda jej nierozstrzygnięta pozycja dostaje linię w sekcji „Bramki manualne"
   `STATUS.md` ze statusem `OTWARTA` (`SPEC_STATUS.md`). Pozycja rozstrzygnięta w tym etapie →
   status `ROZSTRZYGNIĘTA <data> — <jak>`, równolegle z adnotacją przy pozycji we wpisie. Sekcja
   „Do zrobienia przez człowieka" z treścią „—" nie tworzy niczego i nie zostawia śladu.
4. **`docs/STATE.md`** i pozostałe dokumenty projektu, których dotknął etap (`README.md` tylko przy
   zmianie sposobu uruchomienia). Tabeli „Stan prac” w `CLAUDE.md` nie dotykasz: plan nie ma tam
   wiersza, wskazuje go linia „Aktywny plan” (D-30) — wiersz dopisywany przy każdym planie
   rozsadził limit pięciu wierszy i 10 KB.
5. **Wygeneruj `PROMPT_ETAP_N+1.md`** wg `stage-prompts.md` — z sekcji `PLAN.md` opisującej etap
   N+1, z **realnego stanu repo po tym etapie** i z lekcji, które w tym etapie powstały. To jest
   punkt, który najłatwiej pominąć i który przesądza o ciągłości pracy: **etap bez wygenerowanego
   następnego promptu nie jest ukończony** (D-34).
6. **Commit** — propozycja, conventional message. Jedyny punkt tego rytuału, o który pytasz.

Zamykany etap był **ostatnim** w planie → punkt 5 zastępujesz sekwencją z `plan-closing.md`.

Sesja przerwana w połowie rytuału zostawia etap w statusie `W TOKU`. Kolejne `/relai-stage` ma
wtedy dokończyć, nie zaczynać od zera — a siatka z `relai-core` wyłapie brakujący prompt na starcie
następnej sesji.
