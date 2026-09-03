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
- fields inside a line are separated by ` | ` and named: `id`, `source`;
- `list-date` is the date of the whole list, in `YYYY-MM-DD`; an unreadable date means the reader
  treats the list as undated and stays silent about its age.

```
list-date: 2026-09-03
tool: cursor

strong: Grok 4.6 | id: grok-4.6 | source: RelAI pilot E6 in the Cursor app, 2026-08-17 - carried a whole plan stage
balanced: <TO BE FILLED IN: run /relai-models or name the model by hand> | id: - | source: -
cheap: <TO BE FILLED IN: run /relai-models or name the model by hand> | id: - | source: -
```

## Notes for the reader

- Seen in the same pilot but without a measured class: Composer 2.5 / Auto - the session started
  on it before the model was switched to Grok 4.6. It is not written into `balanced`, because
  "was the default at session start" is not a measurement of weight.
- The two `<TO BE FILLED IN: ...>` entries are the honest state of this list, not an oversight.
  A planning question that hits them says the list is incomplete and points at `/relai-models`
  instead of inventing a name.
