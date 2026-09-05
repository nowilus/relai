#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..', '..', '..');
let scanText;
let projectForFile;
try {
  ({ scanText } = require(path.join(ROOT, 'core', 'guardrails', 'secret-scan.js')));
  ({ projektDlaPliku: projectForFile } = require(path.join(ROOT, 'core', 'process', 'session-signals.js')));
} catch (_) { process.exit(2); }

function ignored(cwd, file) {
  const result = spawnSync('git', ['check-ignore', '-q', '--', file], { cwd, windowsHide: true, timeout: 5000 });
  return result.status === 0 || path.basename(file).startsWith('.env');
}

function deny(reason) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: {
    hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason,
  } }));
}

function main(input) {
  const tool = String(input.tool_name || '');
  const body = input.tool_input || {};
  const cwd = input.cwd || process.cwd();
  const file = body.file_path || body.path || '';
  const command = String(body.command || '');
  const content = tool === 'apply_patch' || tool === 'Bash' ? command : String(body.content || body.new_string || '');
  if (!content) return;
  // Codex exposes a raw command for Bash and apply_patch. It has no stable target
  // path in those payloads, so a detected secret is denied rather than silently
  // trusting an unknown destination.
  if (!file) {
    const project = projectForFile(cwd, cwd, ['.claude/relai.json']);
    if (!project) return;
    const finding = scanText(content);
    if (finding) deny('RelAI secret scanner blocked ' + finding + ' in a command with no file target.');
    return;
  }
  const absolute = path.resolve(cwd, file);
  const project = projectForFile(cwd, absolute, ['.claude/relai.json']);
  if (!project || ignored(project.root, absolute)) return;
  const finding = scanText(content);
  if (finding) deny('RelAI secret scanner blocked ' + finding + ' in a tracked file. Put secrets only in ignored .env files.');
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', () => { try { main(JSON.parse(raw || '{}')); } catch (_) { process.exitCode = 2; } });
