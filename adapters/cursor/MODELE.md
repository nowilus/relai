# RelAI model list - Cursor

Machine-readable list of models available in this tool, grouped into the three RelAI classes.
Read by the planning skill when it asks which model should execute the stages of a plan.
The list says what exists - never which model is better. No prices, no limits, no benchmarks.

Refreshing this list is done by `/relai-models` (RelAI 1.9.x). Until then it is maintained by hand:
every entry carries its own source, and the whole list carries a date. Cursor ships models from
several vendors and changes them faster than RelAI releases, so this list starts deliberately
short: only what was actually measured in a session.

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
tool: cursor

strong: Grok 4.6 | alias: - | id: grok-4.6 | source: RelAI pilot E6 in the Cursor app, 2026-08-17 - carried a whole plan stage
balanced: Composer 2.5 | alias: - | id: composer-2.5 | source: named by the human, 2026-09-04 - listed under "Cursor Models" on cursor.com/docs/models-and-pricing, read the same day
cheap: Auto | alias: - | id: - | source: named by the human, 2026-09-04 - the tool's built-in automatic pick, not a single model
```

## Notes for the reader

- `cheap: Auto` is the tool's own mode, not a model name: Cursor picks the model behind it and the
  pick can change between sessions. It is written down because it is what the user actually selects
  in the app, and it carries `id: -` for the same reason - there is no stable identifier to record.
- Class assignment for `balanced` and `cheap` comes from the human, not from a measurement: both
  entries carry `named by the human` in their source. The `strong` entry is the only one measured
  in a real session (pilot E6).
- Cursor lists roughly forty-five models from five vendors and RelAI has three classes, so a
  refresh shows the candidates grouped by vendor and asks - it never picks a class on its own.
