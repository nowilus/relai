# SKROT — continuous humanization cheat sheet

```
for: continuous mode (hooks humanize-continuous) · from: REGULY.md + jezyki/pl.md · written 2026-10-14
```

A RelAI hook points you here when you write text in a scope the person chose (chat replies, texts
for outside readers, documents in `docs/`). Read it once per session. The full rules with examples
are in `REGULY.md` and `jezyki/pl.md` in this folder; `/relai-humanize` uses those.

## Three rules that decide

1. **Prose only.** Tables, headings, fenced and inline code, commands, paths, links, quotations,
   names, YAML front matter, `*(…)*` annotations and lines read by anchor (settings rows, status
   lines, risk tables) stay byte for byte. Only paragraphs and list items change.
2. **No new facts.** No number, date, name, example or claim that is not in the source. A sentence
   that needs a detail you do not have becomes simpler, not more detailed.
3. **Nothing to change is a result.** No tell worth acting on means no edit.

## Out of scope

The optimizer's proposal and the original next to it (`/relai-prompt`), stage prompts, `SPEC_*`
specifications, `CLAUDE.md`, `AGENTS.md`, skills, commands and any instruction for a model. In
`docs/`: the archive, frozen `PLAN.*`, `docs/DECYZJE.md` (the hook does not even speak there).

## The tells to remove first

Polish name in bold, Polish forms after the colon.

- 1 **kontrast z nikim**: nie tylko…, ale; to nie X, to Y; nie chodzi o X, lecz o Y; ogon
  „…, bez zgadywania”. State the point; keep a contrast only against a belief the reader holds.
- 2 **puenta na końcu akapitu**: To robi różnicę. Właśnie o to chodzi. To pokazuje, jak ważne…
  Cut a closer that repeats; keep one that adds a fact.
- 3 **głęboka sentencja**: w gruncie rzeczy; sedno sprawy; tak naprawdę chodzi o; X to język Y.
- 4 **rozbieg przed tezą**: Przyjrzyjmy się; Oto, co musisz wiedzieć; Szczerze?; Powiem wprost.
- 5 **polemika z nikim**: Żeby było jasne; Nie twierdzę, że…; Kusząca byłaby opcja…
- 6 **wyliczanka po trzy**: three festive nouns at once, three parallel sentences and a moral.
  Keep three only when the meaning has three.
- 12 **słowa-wytrychy AI**: kluczowy, kompleksowy, holistyczny, dynamiczny, innowacyjny, solidny
  (figurative), ponadto, dodatkowo, warto podkreślić / zauważyć, płynnie, bezproblemowo.
- 13 **nadmuchane znaczenie**: odgrywa kluczową rolę; stanowi kamień milowy; w erze cyfrowej;
  krok we właściwym kierunku. Keep the fact, drop the significance.
- 15 **doczepka imiesłowowa**: …, zapewniając / umożliwiając / podkreślając / wpisując się w.
- 18 **unikanie słów jest i ma**: stanowi, pełni funkcję, służy jako, posiada, dokonać analizy.
  Use „jest”, „to”, „ma” and the plain verb (a legal definition with „stanowi” stays).
- 22 **resztki czatu**: Mam nadzieję, że to pomoże; Świetne pytanie!; Daj znać, jeśli…; Czy chcesz,
  żebym…? Remove the wrapper, keep the content.
- 25 **tekst o sobie zamiast o temacie**: poniższa tabela przedstawia; w tej sekcji omówimy;
  niniejszy dokument.
- 26 **tłumaczenie tego, co czytelnik wie**: in a reply, lead with the decision; the diagnosis and
  the evidence go to the document, not the answer.

Weak alone (edit only with other tells nearby): a single dash, stacked qualifiers (9), passive
voice (11), one description of the page (25).

## Polish is not English

- A spaced dash ( – ) and a range dash („1–2”) are correct Polish. Never replace them by rule.
- „…” and »…« are correct quotation marks. Never change them to straight quotes.
- Impersonal „ustalono”, „przyjęto” is normal in formal and working text.
- Hyphenated compounds follow Polish spelling; leave them.

## Tone by kind of text

The hook rule names the kind and its tone from the person's settings; when it does not, use this.

| Kind | Where | Tone (built in) |
|---|---|---|
| formal | plans, architecture, guides, reports, handover | `staranny`: careful, neutral, full sentences |
| working | journal, `STATE.md`, `STATUS.md`, notes, branch cards | `rzeczowy`: matter-of-fact, short |
| chat | your reply in the conversation | `swobodny`: closer to conversation |
| external | commit, PR description, release note, `README.md`, message to people | `wg odbiorcy`: commit and PR technical, a message to people closer to the author |

A commit keeps its conventional type (`feat:`, `fix:`…) and English; only the description changes.

## Author profile

Used only when the hook rule names a profile file, and only in the kinds it lists. It adjusts word
choice, sentence length and openings inside the tone; it adds no facts and does not override these
rules. Commit messages, PR descriptions and `README.md` never get it.

## How the result is shown

- **Chat and external texts:** write them clean from the start. No acceptance, no list of patterns,
  no note about humanization.
- **Documents:** follow the hook rule: `notka` writes at once and adds one line with the pattern
  count; `dwie wersje` shows changed paragraphs next to the original and writes after a yes. The
  fact guard (`.claude/relai/tools/humanize-facts.js`) runs before the write; a difference keeps the
  file as it was.
