#!/usr/bin/env node
'use strict';

// Root hooks/ is a convention directory in Claude Code too, so these Codex hooks load
// there on top of the adapter hooks declared in plugin.json. Claude Code ships its own
// equivalents and rejects additionalContext on SessionEnd, so stay silent there (P-013).
if (process.env.CLAUDECODE) process.exit(0);

// SessionEnd is intentionally advisory: it reminds the model to finish RelAI's
// documented closeout without modifying the project after the user leaves.
process.stdout.write(JSON.stringify({ hookSpecificOutput: {
  hookEventName: 'SessionEnd', additionalContext: 'If this session changed RelAI behavior, ensure STATE and the journal are synchronized before closeout.',
} }));
