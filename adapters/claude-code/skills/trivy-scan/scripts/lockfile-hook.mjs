#!/usr/bin/env node
// trivy-scan PostToolUse hook: after Claude changes a lockfile or runs a dependency install,
// run a quick Trivy scan of the session folder and, when something serious or new shows up,
// hand Claude a short note so it can tell the user. Silent otherwise; never blocks the tool.

import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEBOUNCE_MS = 20 * 1000;
const SCAN_TIMEOUT_MS = 100 * 1000;

const LOCKFILE_NAMES = new Set([
  "package-lock.json", "npm-shrinkwrap.json", "yarn.lock", "pnpm-lock.yaml", "bun.lock",
  "Pipfile.lock", "poetry.lock", "uv.lock", "pdm.lock",
  "go.mod", "go.sum", "Cargo.lock", "Gemfile.lock", "composer.lock",
  "pom.xml", "gradle.lockfile", "packages.lock.json", "mix.lock", "pubspec.lock",
]);
const REQUIREMENTS = /^requirements.*\.txt$/i;
const INSTALL_COMMAND = /\b(npm|pnpm|yarn|bun)\s+(i|install|add|update|upgrade|up|ci)\b|\b(pip3?|uv\s+pip)\s+install\b|\b(poetry|pdm)\s+(add|update|install|lock)\b|\buv\s+(add|lock|sync)\b|\bgo\s+(get|mod\s+tidy)\b|\bcargo\s+(add|update)\b|\bbundle\s+(install|update|add)\b|\bcomposer\s+(require|update|install)\b|\bdotnet\s+add\s+package\b/;

function readStdin() {
  try {
    return JSON.parse(fs.readFileSync(0, "utf8"));
  } catch {
    return null;
  }
}

function triggerOf(input) {
  const tool = input.tool_name;
  const ti = input.tool_input || {};
  if (["Edit", "Write", "MultiEdit"].includes(tool) && ti.file_path) {
    const base = path.basename(ti.file_path);
    if (LOCKFILE_NAMES.has(base) || REQUIREMENTS.test(base)) return `${tool} ${base}`;
  }
  if (tool === "Bash" && typeof ti.command === "string") {
    const m = ti.command.match(INSTALL_COMMAND);
    if (m) return `command "${m[0]}"`;
  }
  return null;
}

// Bursts of edits (several lockfiles, install + edit) should cost one scan, not five.
function debounced(root) {
  const key = crypto.createHash("sha1").update(root.toLowerCase()).digest("hex").slice(0, 12);
  const stamp = path.join(os.tmpdir(), `trivy-scan-hook-${key}`);
  try {
    if (Date.now() - fs.statSync(stamp).mtimeMs < DEBOUNCE_MS) return true;
  } catch {
    // first run for this folder
  }
  fs.writeFileSync(stamp, "");
  return false;
}

// Entry point for a host that already read the hook payload (the RelAI plugin hook
// lockfile-scan.js reads stdin, checks the RelAI marker, then calls this).
export function run(input) {
  try {
    handle(input);
  } catch {
    // A broken scan must never break the user's tool call.
  }
}

function handle(input) {
  if (!input) return;
  const trigger = triggerOf(input);
  if (!trigger) return;
  const root = path.resolve(input.cwd || process.cwd());
  if (debounced(root)) return;

  const scanScript = path.join(path.dirname(fileURLToPath(import.meta.url)), "scan.mjs");
  const res = spawnSync(process.execPath, [scanScript, "--path", root, "--quick", "--json"], { encoding: "utf8", timeout: SCAN_TIMEOUT_MS });
  let result;
  try {
    result = JSON.parse((res.stdout || "").trim().split("\n").pop());
  } catch {
    return;
  }
  if (!result.ok) {
    if (/not found|not downloaded/.test(result.error || "")) {
      emit(`[trivy-scan] Dependency change detected (${trigger}) but no quick scan ran: ${result.error}. Mention it to the user in one line.`);
    }
    return;
  }
  const serious = result.counts.CRITICAL + result.counts.HIGH;
  const added = result.delta?.added || [];
  const addedSerious = added.filter((a) => a.severity === "CRITICAL" || a.severity === "HIGH");
  // Known findings were already reported; speak up only on the first scan or when something serious is new.
  const firstScan = !result.delta;
  if (!(firstScan && serious > 0) && addedSerious.length === 0) return;

  const fixable = result.plan.filter((p) => p.fixTo).length;
  const parts = [
    `[trivy-scan] Dependency change detected (${trigger}). Quick scan of ${root}:`,
    `CRITICAL ${result.counts.CRITICAL}, HIGH ${result.counts.HIGH}, MEDIUM ${result.counts.MEDIUM}; ${fixable} package(s) have a fix.`,
  ];
  if (result.delta) parts.push(`${added.length} new since the previous scan (${addedSerious.length} CRITICAL/HIGH): ${addedSerious.slice(0, 5).map((a) => `${a.id} in ${a.pkg}`).join(", ") || "none serious"}.`);
  parts.push(`Report: ${result.reportPath}. Tell the user briefly after your current step and offer the fix plan from the trivy-scan skill; do not update dependencies without their yes.`);
  emit(parts.join(" "));
}

function emit(text) {
  console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: text } }));
}

// Run as a script (manual entry in settings.json, troubleshooting): read stdin here.
// Imported as a module: do nothing until the importer calls run().
const self = fileURLToPath(import.meta.url);
const invoked = process.argv[1] ? path.resolve(process.argv[1]) : "";
const sameFile = process.platform === "win32" ? invoked.toLowerCase() === self.toLowerCase() : invoked === self;
if (sameFile) run(readStdin());
