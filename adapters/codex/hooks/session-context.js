#!/usr/bin/env node
'use strict';

// Root hooks/ is a convention directory in Claude Code too, so these Codex hooks load
// there on top of the adapter hooks declared in plugin.json. The Claude Code adapter has
// its own session-context hook, so stay silent there instead of doubling it (P-013).
if (process.env.CLAUDECODE) process.exit(0);

const path = require('node:path');

const ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..', '..', '..');
let core;
try { core = require(path.join(ROOT, 'core', 'process', 'session-signals.js')); } catch (_) { process.exit(0); }

const markers = ['.claude/relai.json'];
function main(input) {
  const cwd = input.cwd || process.cwd();
  const marker = core.relaiMarkerFile(cwd, markers);
  // Outside a RelAI project the plugin stays invisible, with one exception since 2.3.0:
  // a user who answered "never offer this outside my RelAI projects" gets the line that
  // silences the skill. The Codex plugin is installed per user, so the skill sees every
  // folder on the machine; guest mode (D-21) only settles one folder at a time.
  if (!marker) {
    const gs = core.globalSettingsText('.claude/relai');
    const off = core.propozycjaPozaProjektemReport(core.propozycjaPozaProjektem(gs ? gs.text : ''));
    if (off.length) {
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: off.join('\n') },
      }));
    }
    return;
  }
  const copied = core.provisionTemplates(cwd, { coreTemplates: path.join(ROOT, 'core', 'templates'), destRel: '.claude/relai' });
  const lines = [
    '[RelAI session-context]',
    'This is a RelAI project. Before substantive work, read AGENTS.md, docs/STATE.md, the open risks and latest journal entry, active rules, settings, and the active-plan status.',
    'Use the project instruction router for process rules; skills add procedures but do not replace always-on guidance.',
  ];
  if (copied) lines.push('RelAI templates were provisioned in .claude/relai/templates (' + copied + ' files).');
  for (const line of core.startCostReport(core.startCost(cwd, { markeryGoscia: markers }))) lines.push(line);
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: lines.join('\n') } }));
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', () => { try { main(JSON.parse(raw || '{}')); } catch (_) { /* non-blocking context hook */ } });
