# RelAI model list - Claude Code

Machine-readable list of models available in this tool, grouped into the three RelAI classes.
Read by the planning skill when it asks which model should execute the stages of a plan.
The list says what exists - never which model is better. No prices, no limits, no benchmarks.

Refreshing this list is done by `/relai-models` (RelAI 1.9.x). Until then it is maintained by hand:
every entry carries its own source, and the whole list carries a date.

## Data block

Parsing rules for whoever reads this file:

- one entry per line, the class keyword anchored at the start of the line;
- closed class vocabulary: `strong`, `balanced`, `cheap` - any other wording means silence,
  never a guess;
- a class may carry more than one line when the tool really offers more than one model of that
  weight; `<TO BE FILLED IN: ...>` in the `name` field means the entry has not been measured yet;
- fields inside a line are separated by ` | ` and named: `alias`, `id`, `source`;
- `alias` is the wording the user actually types to switch the model in this tool; an entry with
  no alias carries `-`;
- `list-date` is the date of the whole list, in `YYYY-MM-DD`; an unreadable date means the reader
  treats the list as undated and stays silent about its age.

```
list-date: 2026-09-04
tool: claude-code

strong: Opus 5 | alias: opus | id: claude-opus-5 | source: code.claude.com/docs/en/model-config, read 2026-09-04
strong: Fable 5.1 | alias: fable | id: claude-fable-5-1 | source: support.claude.com/en/articles/11940350-claude-code-model-configuration, read 2026-09-04
balanced: Sonnet 5 | alias: sonnet | id: claude-sonnet-5 | source: code.claude.com/docs/en/model-config, read 2026-09-04
cheap: Haiku 4.5 | alias: haiku | id: claude-haiku-4-5-20251001 | source: support.claude.com/en/articles/11940350-claude-code-model-configuration, read 2026-09-04
```

## Notes for the reader

- Both `strong` entries are real and the difference between them matters in practice: this
  repository executes plan stages on Opus (decision D-85) and writes architecture and plans on
  Fable. A project that wants one strong model picks either - the list does not rank them.
- The class of a model is a RelAI judgement about its weight, not a vendor label. When a new model
  appears and its class is unclear, it goes in as `<TO BE FILLED IN: ...>` rather than into a class
  picked by guesswork.
- The alias resolves to the newest model of its family, so an alias outlives a version bump while
  the `id` does not. The source page for aliases carries no date of its own - `list-date` is the
  date the page was read.
