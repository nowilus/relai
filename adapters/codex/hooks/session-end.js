#!/usr/bin/env node
'use strict';

// SessionEnd is intentionally advisory: it reminds the model to finish RelAI's
// documented closeout without modifying the project after the user leaves.
process.stdout.write(JSON.stringify({ hookSpecificOutput: {
  hookEventName: 'SessionEnd', additionalContext: 'If this session changed RelAI behavior, ensure STATE and the journal are synchronized before closeout.',
} }));
