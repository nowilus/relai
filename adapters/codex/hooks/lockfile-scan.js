#!/usr/bin/env node
'use strict';
// RelAI hook for Codex: lockfile-scan - PostToolUse (Bash), OSTRZEGA (D-41)
// (plan BEZPIECZENSTWO, E5).
//
// Measured 2026-10-24 on Codex 0.155.1: PostToolUse fires after Bash and apply_patch, and the
// Bash payload carries tool_input.command like Claude Code, so the Claude Code hook runs as is:
// after a package manager install it runs a quick Trivy scan and speaks only about new
// CRITICAL/HIGH. Host gate: in Claude Code the plugin's own hook already runs (P-013).

if (process.env.CLAUDECODE) process.exit(0);

require('../../claude-code/hooks/lockfile-scan.js');
