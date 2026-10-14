# Polish overlay for the humanization rules

```
overlay: pl · for: core/humanize/REGULY.md · written 2026-10-14
```

Read together with `REGULY.md` whenever the text is in Polish. Where this file overrides a pattern,
this file wins. Rules are in English; equivalents and examples are in Polish, because they are
Polish text. Pattern names shown to the human are the Polish names from `REGULY.md`.

---

## Overrides

### 8. Dashes — overridden

Polish typography uses the dash correctly: the spaced en dash ( – ) or em dash ( — ) marks an
insertion, an apposition or a pause, and the en dash joins ranges ("1–2 sesje", "E1–E5"). The
English rule "no dashes in the final text" **does not apply to Polish**. Never replace a correct
Polish dash with a comma by rule, and never turn it into a hyphen.

What is still a tell: a dash in place of a connector the sentence needs ("Plik jest gotowy — można
commitować" where "więc" or a period says it better), or a dash in most sentences of a paragraph.
Act on that only together with other tells; one dash is never a reason to edit.

### 10. Hyphenated pairs — overridden

The English hyphen rule does not apply. Polish hyphenation of compounds ("biało-czerwony",
"naukowo-techniczny", "Kowalska-Nowak") follows its own spelling rules; leave it alone.

### 18. Avoiding is and has — overridden

Polish has the same habit in a different shape: "stanowi", "pełni funkcję", "służy jako", "jawi się
jako", "charakteryzuje się", "cechuje się", "posiada" (in place of "ma"), "dokonać" + noun
("dokonać analizy" instead of "przeanalizować"). Use "jest", "to", "ma" and the plain verb.

Exception: in formal and legal text "stanowi" in a definition is ordinary Polish ("Załącznik stanowi
integralną część umowy"). Act only when such phrases stack or replace a simple "jest" or "ma".

> Przed: Moduł stanowi kluczowy element systemu i posiada rozbudowane możliwości konfiguracji.
> Po: Moduł ma wiele ustawień; bez niego system nie działa.

### 20. Decorative headings — overridden

Polish never title-cases headings, so the capitalization half of the rule does not apply; a Polish
heading in Title Case is a translation leftover and is a tell. Emojis, arrows, a horizontal rule
between every section and headings written for effect remain tells. Headings in a file stay
protected: report the tell, do not change the heading.

### 21. Quotation marks — overridden

The Polish quotation mark „…” (low opening, high closing) is correct, and »…« is correct for a
quotation inside a quotation. **Never change them to straight quotes.** Straight quotes "…" in
Polish prose are a small inconsistency, not an AI tell: leave them alone too.

### 11. Passive voice — adapted (not overridden)

Impersonal forms ending in -no and -to ("ustalono", "zrobiono", "przyjęto") are normal in Polish
formal and working text and are not a tell by themselves. The tell is the same as in English: a
sentence whose actor matters and is hidden. *Weak alone*.

---

## Polish equivalents of the patterns

Watch-lists for Polish text, by pattern number. They add to the English lists; they do not replace
the rule or its exceptions.

| # | Polish forms to watch for |
|---|---|
| 1 | nie tylko…, ale (także/również); to nie X, to Y; nie chodzi o X, lecz o Y; nie X, tylko Y (gdy nikt nie twierdził X); zamiast X – Y; ogon „…, bez zgadywania”, „…, bez wyjątków” |
| 2 | I to jest prawdziwa wygrana. To robi różnicę. Przeczytaj to jeszcze raz. Właśnie o to chodzi. To pokazuje, jak ważne jest… Wniosek był jasny: |
| 3 | prawdziwe pytanie brzmi; w gruncie rzeczy; u podstaw; sedno sprawy; tak naprawdę chodzi o; X to język Y; X staje się pułapką |
| 4 | Przyjrzyjmy się; Zanurzmy się w; Rozłóżmy to na czynniki pierwsze; Oto, co musisz wiedzieć; Bez zbędnych wstępów; Szczerze?; Spójrzmy prawdzie w oczy; Powiem wprost |
| 5 | Nie chodzi o to, że…; Żeby było jasne; Nie zrozum mnie źle; Nie twierdzę, że…; Można by pomyśleć, że…, ale; Kusząca byłaby opcja… |
| 6 | trzy rzeczowniki odświętne naraz („innowacyjność, elastyczność i skalowalność”); trzy równoległe zdania i morał |
| 9 | potencjalnie mogłoby; w pewnym sensie; do pewnego stopnia; wydaje się, że może; warto byłoby rozważyć ewentualne |
| 12 | kluczowy; kompleksowy; holistyczny; dynamiczny; innowacyjny; wyjątkowy; niezwykle; solidny (w przenośni); bogaty (w przenośni); ponadto; dodatkowo; warto podkreślić / zauważyć / zaznaczyć; nie bez znaczenia; płynnie; bezproblemowo; synergia; krajobraz (w przenośni); przełomowy |
| 13 | odgrywa istotną / kluczową rolę; stanowi kamień milowy; wyznacza nowe standardy; w dzisiejszym dynamicznym świecie; w erze cyfrowej; przyszłość rysuje się w jasnych barwach; to dopiero początek; krok we właściwym kierunku |
| 14 | związany z; w powiązaniu z; w kontekście (bez podania, jaki to związek) |
| 15 | imiesłów doczepiony do faktu: podkreślając; odzwierciedlając; zapewniając; wpisując się w; przyczyniając się do; umożliwiając |
| 16 | bogata oferta; unikalny; w sercu (miasta); zapierający dech; najwyższej jakości; kompleksowa obsługa; wyjątkowa atmosfera; szyty na miarę |
| 17 | eksperci podkreślają; jak wskazują badania (bez badania); według specjalistów; coraz więcej osób uważa |
| 18 | stanowi; pełni funkcję; służy jako; jawi się jako; charakteryzuje się; cechuje się; posiada; dokonać + rzeczownik (patrz nadpisanie wyżej) |
| 22 | Mam nadzieję, że to pomoże; Świetne pytanie!; Oczywiście!; Jasne!; Masz całkowitą rację; Daj znać, jeśli…; Czy chcesz, żebym…?; Oto… |
| 23 | według mojej najlepszej wiedzy; na dzień ostatniej aktualizacji; brak publicznie dostępnych informacji; prawdopodobnie (dorastał, studiował) — jako domysł w miejsce źródła |
| 25 | poniższa tabela przedstawia; w tej sekcji omówimy; niniejszy dokument; dokument został przygotowany na podstawie |

---

## Polish examples

> Przed: Nowy panel to nie tylko wygodniejszy interfejs, ale także zupełnie nowa jakość pracy z projektem.
> Po: Nowy panel pokazuje plany i etapy na jednym ekranie.

(1 kontrast z nikim. The "after" keeps only what the source says; if the source does not say what
is new, the sentence gets simpler, not more detailed.)

> Przed: Warto podkreślić, że kopia zapasowa odgrywa kluczową rolę w procesie. Dzięki niej dane są bezpieczne. To robi różnicę.
> Po: Kopia zapasowa chroni dane przed utratą.

(12 słowa-wytrychy AI, 13 nadmuchane znaczenie, 2 puenta na końcu akapitu.)

> Przed: Przyjrzyjmy się, jak działa rotacja dziennika. Rotacja przenosi stare wpisy do archiwum, zachowując sumę kontrolną, zapewniając spójność i umożliwiając szybki odczyt.
> Po: Rotacja przenosi stare wpisy dziennika do archiwum i zapisuje ich sumę kontrolną.

(4 rozbieg przed tezą, 15 doczepka imiesłowowa, 6 wyliczanka po trzy. "Szybki odczyt" is cut only
because the source sentence gave no fact behind it; a rider that carries a fact stays.)

> Przed: Mam nadzieję, że to pomoże! Daj znać, jeśli chcesz, żebym rozwinął któryś punkt.
> Po: (cut: nothing remains)

(22 resztki czatu.)

---

## Tone by kind of text (Aneks A1)

Humanization always removes the tells, but the tone depends on the kind of text. Recognize the kind
from the path first, then from the content; when neither settles it, use **working** and say so in
the result.

| Kind | Typical paths and shapes | Tone |
|---|---|---|
| formal | architecture and design documents, plans, summaries, guides (`PRZEWODNIK`, `INSTALACJA`), handover packages, material for other people | careful and neutral, full sentences, no spoken language |
| working | `docs/DZIENNIK.md`, `docs/STATE.md`, `STATUS.md`, notes, branch cards | matter-of-fact and short |
| chat | a reply in the conversation, a message pasted from chat | freer, closer to conversation |
| external | commit message, pull request description, release note, `README.md`, message to the team | by the reader: commit and PR technical; a message to the team closer to the author's style |

Commit messages keep their conventional type (`feat:`, `fix:`…) and stay in English; only the
description is humanized.
