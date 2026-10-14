# RelAI 3.1.0

## What's new

- **`/relai-humanize` command.** Removes common signs of AI writing from your text. The original appears next to the rewrite so you can compare them before accepting.
- **First-use interview.** The first time you run the command, a few short questions set your preferences, so later runs fit how you write.
- **Continuous mode in Claude Code.** Humanizing can run automatically in the scopes you pick: chat, documents or external texts. You choose where it applies, and nothing outside those scopes changes.
- **Fact guard.** If a rewrite would change a number, date or file path, it is blocked and your original text stays as it was.
- **Polish overlay.** Polish dashes and quotation marks („…”) are kept instead of being changed to English ones.

## How to update

```bash
claude plugin marketplace update relai
claude plugin update relai@relai
```

Restart Claude Code afterwards to load the new version.
