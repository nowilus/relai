# RelAI model list - Codex

Machine-readable list of models available in this tool, grouped into the three RelAI classes.
Read by the planning skill when it asks which model should execute the stages of a plan, and by
the prompt optimizer when it picks the family overlay for the target model.
The list says what exists - never which model is better. No prices, no limits, no benchmarks.

Refreshing this list is done by `/relai-models` run in a Codex session. Every entry carries its own
source, and the whole list carries a date.

## Data block

Parsing rules for whoever reads this file:

- one entry per line, the class keyword anchored at the start of the line;
- closed class vocabulary: `strong`, `balanced`, `cheap` - any other wording means silence,
  never a guess;
- a class may carry more than one line when the tool really offers more than one model of that
  weight; `<TO BE FILLED IN: ...>` in the `name` field means the entry has not been measured yet;
- fields inside a line are separated by ` | ` and named: `alias`, `id`, `family`, `source`;
- `family` names the vendor family of the model, from a closed vocabulary: `claude`, `openai`,
  `xai`, `cursor`, or `-` when the entry is not a single model; it is read from this field, never
  guessed from the name or the alias (an alias can point to a different model on another
  provider). The prompt optimizer picks its family overlay by this field; a family without an
  overlay, `-`, or a missing field means the core rules alone;
- `alias` is the wording the user actually types to switch the model in this tool; an entry with
  no alias carries `-`;
- `list-date` is the date of the whole list, in `YYYY-MM-DD`; an unreadable date means the reader
  treats the list as undated and stays silent about its age.

```
list-date: 2026-09-05
tool: codex

strong: gpt-6-astra | alias: - | id: gpt-6-astra | family: openai | source: RelAI crew run 2026-09-05 (task --write, effort xhigh) - archived journal DZIENNIK_2026-09-03_2026-09-06
balanced: gpt-5.6-terra | alias: - | id: gpt-5.6-terra | family: openai | source: RelAI stage E7 of ROZWOJ_PO_WYDANIU executed on it, 2026-09-05 - same archived journal
cheap: gpt-5.6-luna | alias: - | id: gpt-5.6-luna | family: openai | source: named by the human, 2026-09-05 - no session recorded
```

## Notes for the reader

- The list keeps its 2026-09-05 names on purpose. On 2026-09-24 the Codex model page
  (learn.chatgpt.com/docs/models) recommended gpt-6-astra, gpt-6-sol and gpt-6-luna; replacing the
  names belongs to the human in a Codex session (`/relai-models`), not to a session in another tool.
  Until then `balanced` and `cheap` may name models Codex no longer recommends.
- Until 2.6.0 this file was a two-column table without sources; the entries above carry the
  sources recorded in the project journal for the same names.
