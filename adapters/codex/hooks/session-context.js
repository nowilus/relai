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
    // KONTEKST_STARTU E2: one command instead of a file list, the same in all three adapters.
    'This is a RelAI project. Before substantive work, run ' + core.POLECENIE_SKROTU + ' and read its output (the start digest); AGENTS.md is already in context.',
    'Use the project instruction router for process rules; skills add procedures but do not replace always-on guidance.',
  ];
  if (copied) lines.push('RelAI templates were provisioned in .claude/relai/templates (' + copied + ' files).');
  // Model list (2.6.0): the same core function as in the Cursor adapter — copied only when the
  // project has none, so a refresh made by /relai-models survives the next start. Without it the
  // prompt optimizer finds no `family` and the openai overlay never applies in its own tool.
  const list = core.provisionModelList(cwd, {
    zrodlo: path.join(ROOT, 'adapters', 'codex', 'MODELE.md'),
    nazwa: 'MODELE-codex.md',
    destRel: '.claude/relai',
  });
  if (list) {
    lines.push('Model list for this tool: .claude/relai/' + list.nazwa +
      (list.data ? ' (dated ' + list.data + ')' : ' (no readable date)') +
      '. When asking which model runs plan stages, name models from this list together with its date.');
  }
  for (const line of core.wiekListyModeliReport(
    core.wiekListyModeli(cwd, { nazwa: 'MODELE-codex.md', markeryGoscia: markers }),
    { interaktywna: true })) {
    lines.push(line);
  }
  for (const line of core.startCostReport(core.startCost(cwd, { markeryGoscia: markers }))) lines.push(line);
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: lines.join('\n') } }));
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', () => { try { main(JSON.parse(raw || '{}')); } catch (_) { /* non-blocking context hook */ } });
