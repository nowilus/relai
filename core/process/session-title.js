'use strict';
// RelAI core / process: session-title — the title of a new session from its focus (plan ZGLOSZENIA,
// E4, issue #1). "Nowa sesja" on the cache bar, a stage card's new session and a resume all start
// with a phrase; the app named the chat after that phrase ("kontynuujemy pracę", "tak"). The
// plugin's UserPromptSubmit hook returns hookSpecificOutput.sessionTitle instead (measured
// 2026-10-26 on 2.1.308: desktop, CLI and after /clear; the app's own title gives way).
//
// Only the FIRST prompt of a session that is a phrase of the closed list below, or a stage command
// from a card. A prompt with content of its own keeps the app's title (a non-goal of the plan).
// Sources in order: the focus handoff, the session's focus file, the first item of
// "Nad czym pracujemy" in docs/STATE.md; none — no title. The shape is one rule shared with
// relai-panel's start_session: core/panel/session-title.mjs, loaded with import().

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const PANEL_CORE = path.join(__dirname, '..', 'panel');

// Closed list (rule 7): the whole prompt, case and trailing punctuation aside
const PHRASES = new Set(['kontynuujemy pracę', 'kontynuuj', 'tak', "let's continue", 'continue', 'yes']);
// The resume prompt of relai-cache-keeper (handoff.ts, relaiResumePrompt) and its consent line
const RESUME_LINE = /^kontynuujemy pracę — plik wznowienia: \S.*$/;
const RESUME_CONSENT = /^Zgoda na skasowanie pliku wznowienia po wznowieniu: tak\b/;
// A stage command as a card sends or links it (either solidus, launch.ts LINKED_STAGE), with the
// card's consent marker allowed
const STAGE_COMMAND = /^[/／](?:relai:)?relai-stage\s+([A-Za-z0-9_-]+)\s+(E\d+)(?:\s+--zgoda-panelu\s+\S+)?\s*$/;

// The panel's handoff lives ten minutes (panel/hooks/launch.ts, HANDOFF_TTL_MS)
const HANDOFF_TTL_MS = 10 * 60_000;

const STATE_HEADING = /^##\s+Nad czym pracujemy\b/;
const STATE_PLAN = /^([A-Z][A-Z0-9_]*),\s*(E\d+)\s+[—–-]\s+(.+)$/;

function bare(text) {
  return String(text || '').trim().toLocaleLowerCase('pl').replace(/[.!…]+$/u, '').trim();
}

/** @param {string} prompt */
function isContinuation(prompt) {
  const text = String(prompt || '').trim();
  if (PHRASES.has(bare(text))) return true;
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0 || !RESUME_LINE.test(lines[0])) return false;
  return lines.slice(1).every((l) => RESUME_CONSENT.test(l));
}

/** @param {string} prompt */
function stageCommandOf(prompt) {
  const m = STAGE_COMMAND.exec(String(prompt || '').trim());
  return m ? { kind: 'plan', plan: m[1], stage: m[2] } : null;
}

function samePath(a, b) {
  const norm = (p) => path.resolve(String(p)).replace(/\\/g, '/').replace(/\/+$/, '');
  return process.platform === 'win32' ? norm(a).toLowerCase() === norm(b).toLowerCase() : norm(a) === norm(b);
}

function targetOf(v) {
  if (!v || typeof v !== 'object') return null;
  if (v.kind === 'plan' && typeof v.plan === 'string' && v.plan && /^E\d+$/.test(String(v.stage))) return { kind: 'plan', plan: v.plan, stage: v.stage };
  if (v.kind === 'branch' && typeof v.card === 'string' && v.card) return { kind: 'branch', card: v.card };
  return null;
}

function parse(text) {
  try { return JSON.parse(String(text)); } catch (_) { return null; }
}

// The handoff a stage card left for the session it opened: not from this session, for
// this folder, ten minutes old at most. Its use by the panel (usedAt) does not matter here: the
// panel takes it at session.start of the very session this prompt opens.
function targetOfHandoff(text, w) {
  const v = text === null || text === undefined ? null : parse(text);
  if (!v || typeof v !== 'object') return null;
  const from = Array.isArray(v.from) ? v.from : [v.from];
  if (from.includes(w.session) || typeof v.cwd !== 'string' || !samePath(v.cwd, w.cwd)) return null;
  const age = w.now - (typeof v.at === 'number' ? v.at : Number.NaN);
  if (!(age >= 0 && age <= HANDOFF_TTL_MS)) return null;
  return targetOf(v.focus);
}

function targetOfFocus(text) {
  return text === null || text === undefined ? null : targetOf(parse(text));
}

// The first item of "Nad czym pracujemy": its bold text, "PLAN, EN — name" read as a plan
function targetOfState(stateMd) {
  const lines = String(stateMd || '').split(/\r?\n/);
  const start = lines.findIndex((l) => STATE_HEADING.test(l));
  if (start < 0) return null;
  for (const line of lines.slice(start + 1)) {
    if (/^##\s/.test(line)) return null;
    const m = /^\s*[-*]\s+\*\*(.+?)\*\*/.exec(line);
    if (!m) continue;
    const bold = m[1].trim();
    const p = STATE_PLAN.exec(bold);
    return p ? { kind: 'plan', plan: p[1], stage: p[2], name: p[3].trim() } : { kind: 'text', text: bold };
  }
  return null;
}

async function panelCore(name) {
  return import(pathToFileURL(path.join(PANEL_CORE, name)).href);
}

/**
 * The title for this prompt, or null.
 * @param {{ prompt: string, isFirst: boolean, handoffText: string|null, focusText: string|null,
 *   stateMd: string|null, statusOf: (plan: string) => string|null, now: number, cwd: string, session: string }} a
 */
async function sessionTitle(a) {
  if (!a.isFirst) return null;
  const command = stageCommandOf(a.prompt);
  if (!command && !isContinuation(a.prompt)) return null;
  const target = targetOfHandoff(a.handoffText, a) || targetOfFocus(a.focusText) || command || targetOfState(a.stateMd);
  if (!target) return null;
  const { titleOf } = await panelCore('session-title.mjs');
  if (target.kind !== 'plan' || target.name) return titleOf(target);
  const { parseStatus } = await panelCore('plan-state.mjs');
  let statusMd = null;
  try { statusMd = a.statusOf(target.plan); } catch (_) { statusMd = null; }
  const stage = statusMd ? parseStatus(statusMd).stages.find((s) => s.id === target.stage) : null;
  return titleOf({ ...target, name: stage ? stage.name : '' });
}

// The system's wrappers in a transcript, never a person's prompt: the caveat and output of a local
// command, a command's message, a reminder, and the /clear command itself
const SYSTEM_LINE = /^<(?:local-command-[\w-]+|command-message|command-stdout|system-reminder)>|^<command-name>\/clear<\/command-name>/;
const MEDIA_BLOCKS = new Set(['image', 'document']);

// The person's prompts a session transcript holds before this one. Not counted: the system's
// wrappers above, meta lines, tool results, compact summaries. Counted: any other text (pasted HTML
// and a slash command other than /clear too) and a prompt of an image or document alone. After
// /clear the app carries the old conversation's title into the new transcript (measured 2026-10-27,
// its first line), so a title alone says nothing about the first prompt; the transcript does. The
// current prompt may already stand in it: its last line, equal to it, is not counted.
function priorPrompts(transcript, prompt) {
  const texts = [];
  for (const raw of String(transcript || '').split(/\r?\n/)) {
    if (!raw.trim()) continue;
    const v = parse(raw);
    if (!v || v.type !== 'user' || v.isMeta || v.isCompactSummary || !v.message) continue;
    const c = v.message.content;
    const blocks = Array.isArray(c) ? c.filter((b) => b && typeof b === 'object') : [];
    const parts = typeof c === 'string' ? [c] : blocks.filter((b) => b.type === 'text').map((b) => String(b.text || ''));
    const text = parts.join('\n').trim();
    if (text && !SYSTEM_LINE.test(text)) texts.push(text);
    else if (!text && blocks.some((b) => MEDIA_BLOCKS.has(b.type))) texts.push('');
  }
  const own = texts.lastIndexOf(String(prompt || '').trim());
  return own >= 0 && own === texts.length - 1 ? texts.length - 1 : texts.length;
}

// The hook's own "first prompt" state: one empty file a session, made atomically, so two prompts
// (or two hooks) never both count as the first (rule 8: a one-time signal has one owner)
function claimFirst(dir, session) {
  const name = String(session || '').replace(/[^\w.-]/g, '_');
  if (!name) return false;
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), '', { flag: 'wx' });
    return true;
  } catch (_) {
    return false;
  }
}

module.exports = {
  HANDOFF_TTL_MS,
  isContinuation,
  stageCommandOf,
  targetOfHandoff,
  targetOfFocus,
  targetOfState,
  sessionTitle,
  priorPrompts,
  claimFirst,
};
