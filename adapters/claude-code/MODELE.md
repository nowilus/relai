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
- fields inside a line are separated by ` | ` and named: `id`, `source`;
- `list-date` is the date of the whole list, in `YYYY-MM-DD`; an unreadable date means the reader
  treats the list as undated and stays silent about its age.

```
list-date: 2026-09-03
tool: claude-code

strong: Opus 5 | id: claude-opus-5 | source: Claude Code session environment, 2026-09-03
strong: Fable 5.1 | id: claude-fable-5-1 | source: Claude Code session environment, 2026-09-03
balanced: Sonnet 5 | id: claude-sonnet-5 | source: Claude Code session environment, 2026-09-03
cheap: Haiku 4.5 | id: claude-haiku-4-5-20251001 | source: Claude Code session environment, 2026-09-03
```

## Notes for the reader

- Both `strong` entries are real and the difference between them matters in practice: this
  repository executes plan stages on Opus (decision D-85) and writes architecture and plans on
  Fable. A project that wants one strong model picks either - the list does not rank them.
- The class of a model is a RelAI judgement about its weight, not a vendor label. When a new model
  appears and its class is unclear, it goes in as `<TO BE FILLED IN: ...>` rather than into a class
  picked by guesswork.
