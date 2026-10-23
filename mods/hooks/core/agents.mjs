// RelAI core / panel: agents — the subagents of the session, live (plan PANEL_CLAUDE, E9, Aneks C).
//
// Modeled on savvy-progress by johnnyvizz (github.com/johnnyvizz/claude-kit, MIT): its agents
// panel follows agent.spawn, the subagent's turn.step and its turn.complete. Here the list is
// pure data, kept by relai-progress; the engine's $.agent.list() forgets an agent the moment its
// run ends (relai-probe-e9, 2026-10-09), so the plugin holds the history itself.
// The cost of an agent is never counted here: it is the sum of the collector's records with the
// agent's id (relai-panel, E3), priced with the dated list; no records means no measurement,
// said in words by the caller, never zero. Same ESM rule and same copy as plan-state.mjs.

// RelAI Agents (odnoga AGENTS_KRABY, P3, 2026-10-23): each agent also carries its role, its name
// and its colour (mascots.mjs) and the tool calls it made, for the card's live line and its list
// of steps; the idea of a live card per subagent follows Helper Desk by Ben AI, nothing copied.

import { aggregate } from './measure.mjs';
import { nameFor, pickHue, roleOf } from './mascots.mjs';

/**
 * @typedef {import('./measure.mjs').MeasureRecord} MeasureRecord
 * @typedef {import('./measure.mjs').PriceOf} PriceOf
 * @typedef {import('./measure.mjs').ApiUsage} ApiUsage
 * @typedef {import('./mascots.mjs').RoleKey} RoleKey
 * @typedef {'running' | 'done' | 'stopped' | 'failed'} AgentStatus
 * @typedef {'command' | 'connector' | 'read' | 'write' | 'search' | 'web' | 'skill' | 'agent' | 'tool'} ToolKind
 * @typedef {{ kind: ToolKind, label: string, dim: string, live: string }} ToolStep
 * @typedef {{ id: string, type: string, description: string, model: string, at: number,
 *   status: AgentStatus, endedAt: number | null, steps: number, context: number,
 *   role: RoleKey, name: string, hue: number, calls: number, tools: ToolStep[] }} AgentRun
 */

/** How many runs the list keeps, newest last. */
export const MAX_AGENTS = 50;
/** How many tool steps an agent keeps, newest last; `calls` counts them all. */
export const MAX_TOOL_STEPS = 40;

/**
 * A subagent started: running, at the end of the list (the same id replaced, never twice). A new
 * agent gets its role from its type and task, the first free name of that role and the next
 * colour no running agent wears; the same id again keeps who it was.
 * @param {readonly AgentRun[]} list
 * @param {{ id: string, type: string, description: string, model: string, at: number }} s
 * @returns {AgentRun[]}
 */
export function spawned(list, s) {
  const was = list.find((x) => x.id === s.id);
  const others = list.filter((x) => x.id !== s.id);
  const role = was?.role ?? roleOf(s);
  const last = others[others.length - 1];
  const hue = was?.hue ?? pickHue(others.filter((x) => x.status === 'running').map((x) => x.hue), last ? last.hue + 1 : 0);
  /** @type {AgentRun} */
  const run = {
    ...s, status: 'running', endedAt: null, steps: 0, context: 0,
    role, name: was?.name ?? nameFor(role, others.map((x) => x.name)), hue, calls: 0, tools: [],
  };
  return [...others, run].slice(-MAX_AGENTS);
}

/**
 * A list kept before roles, names and tool steps (relai-progress 0.5.0 in `$.state`): each run
 * gets them, in the order the list holds, so names and colours come out as if spawned now.
 * @param {readonly Partial<AgentRun>[]} list @returns {AgentRun[]}
 */
export function upgraded(list) {
  /** @type {AgentRun[]} */
  const out = [];
  for (const x of list) {
    const role = x.role ?? roleOf({ type: x.type, description: x.description });
    const last = out[out.length - 1];
    out.push(/** @type {AgentRun} */ ({
      ...x,
      role,
      name: x.name ?? nameFor(role, out.map((y) => y.name)),
      hue: typeof x.hue === 'number' ? x.hue : pickHue([], last ? last.hue + 1 : 0),
      calls: x.calls ?? 0,
      tools: Array.isArray(x.tools) ? x.tools : [],
    }));
  }
  return out;
}

/**
 * The agent called a tool: one call more, the step at the end of its list. An agent that had
 * finished and works again (a teammate picking up a message) is running again.
 * @param {readonly AgentRun[]} list @param {string} id @param {ToolStep} step
 * @returns {readonly AgentRun[]}
 */
export function toolStep(list, id, step) {
  if (!list.some((x) => x.id === id)) return list;
  return list.map((x) => (x.id === id
    ? { ...x, calls: x.calls + 1, tools: [...x.tools, step].slice(-MAX_TOOL_STEPS), status: 'running', endedAt: null }
    : x));
}

/** The kind of a step in words, for the list of all steps. @type {Readonly<Record<ToolKind, string>>} */
export const TOOL_KIND_WORD = Object.freeze({
  command: 'polecenie', connector: 'konektor', read: 'odczyt', write: 'zapis', search: 'szukanie',
  web: 'sieć', skill: 'skill', agent: 'subagent', tool: 'narzędzie',
});

const LABEL_MAX = 80;
const LIVE_MAX = 60;
/** @param {string} t @param {number} n */
const cut = (t, n) => (t.length > n ? `${t.slice(0, n - 1)}…` : t);
/** @param {unknown} v */
const oneLine = (v) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '');

/**
 * A path as its file name and its folder; the folder relative to `root` when inside it.
 * @param {string} path @param {string} root @returns {[string, string]}
 */
function fileAndFolder(path, root) {
  const p = path.replace(/\\/g, '/');
  const r = root.replace(/\\/g, '/').replace(/\/+$/, '');
  const at = p.lastIndexOf('/');
  const name = p.slice(at + 1) || p;
  const dir = at > 0 ? p.slice(0, at) : '';
  // Windows paths compare without case; the project root itself is shown as nothing
  const inside = r !== '' && (dir.toLowerCase() === r.toLowerCase() || dir.toLowerCase().startsWith(`${r.toLowerCase()}/`));
  return [name, inside ? dir.slice(r.length + 1) : dir];
}

/**
 * One tool call of an agent in words: its kind, a short label for the list, the folder in dim, and
 * the live line ("co robi teraz"). Arguments are read, never trusted: anything missing says less.
 * @param {string} tool @param {Readonly<Record<string, unknown>>} args @param {string} [root]
 * @returns {ToolStep}
 */
export function describeTool(tool, args, root = '') {
  const s = (/** @type {string} */ k) => oneLine(args[k]);
  /** @param {string} verb @param {ToolKind} kind @param {string} [key] @returns {ToolStep} */
  const file = (verb, kind, key = 'file_path') => {
    const path = s(key);
    if (!path) return { kind, label: 'plik', dim: '', live: `${verb} plik` };
    const [name, folder] = fileAndFolder(path, root);
    return { kind, label: cut(name, LABEL_MAX), dim: folder, live: cut(`${verb} ${name}`, LIVE_MAX) };
  };
  if (tool.startsWith('mcp__')) {
    const [, server = '', ...rest] = tool.split('__');
    const what = rest.join(' ').replace(/[_-]+/g, ' ').trim();
    const label = cut(`${server.replace(/[_-]+/g, ' ')} · ${what}`, LABEL_MAX);
    return { kind: 'connector', label, dim: '', live: cut(`Konektor ${label}`, LIVE_MAX) };
  }
  switch (tool) {
    case 'Read': return file('Czyta', 'read');
    case 'NotebookRead': return file('Czyta', 'read', 'notebook_path');
    case 'Write': return file('Zapisuje', 'write');
    case 'Edit':
    case 'MultiEdit': return file('Edytuje', 'write');
    case 'NotebookEdit': return file('Edytuje', 'write', 'notebook_path');
    case 'Grep':
    case 'Glob': {
      const pattern = s('pattern');
      const [, folder] = s('path') ? fileAndFolder(`${s('path')}/x`, root) : ['', ''];
      return pattern
        ? { kind: 'search', label: cut(`„${pattern}”`, LABEL_MAX), dim: folder, live: cut(`Szuka „${pattern}”`, LIVE_MAX) }
        : { kind: 'search', label: 'pliki', dim: folder, live: 'Szuka w plikach' };
    }
    case 'Bash':
    case 'PowerShell': {
      const label = cut(s('description') || s('command') || 'polecenie', LABEL_MAX);
      return { kind: 'command', label, dim: '', live: cut(`Uruchamia: ${label}`, LIVE_MAX) };
    }
    case 'WebSearch': {
      const q = s('query');
      return { kind: 'web', label: cut(q || 'wyszukiwanie', LABEL_MAX), dim: '', live: cut(q ? `Szuka w sieci: ${q}` : 'Szuka w sieci', LIVE_MAX) };
    }
    case 'WebFetch': {
      let host = 'strona';
      try { host = new URL(s('url')).host || host; } catch { /* not a URL: say less */ }
      return { kind: 'web', label: host, dim: '', live: cut(`Otwiera ${host}`, LIVE_MAX) };
    }
    case 'Skill': {
      const name = s('skill') || 'skill';
      return { kind: 'skill', label: name, dim: '', live: cut(`Używa skilla ${name}`, LIVE_MAX) };
    }
    case 'Agent':
    case 'Task': {
      const d = s('description');
      return { kind: 'agent', label: cut(d || 'subagent', LABEL_MAX), dim: '', live: cut(d ? `Uruchamia subagenta: ${d}` : 'Uruchamia subagenta', LIVE_MAX) };
    }
    case 'SendMessage': return { kind: 'agent', label: 'wiadomość', dim: '', live: 'Wysyła wiadomość' };
    case 'TodoWrite':
    case 'TaskCreate':
    case 'TaskUpdate': return { kind: 'tool', label: 'lista zadań', dim: '', live: 'Aktualizuje listę zadań' };
    case 'ToolSearch': return { kind: 'tool', label: 'ładowanie narzędzi', dim: '', live: 'Ładuje narzędzia' };
    default: return { kind: 'tool', label: cut(tool, LABEL_MAX), dim: '', live: cut(`Używa ${tool}`, LIVE_MAX) };
  }
}

/**
 * One request of the subagent: a step more, the context its last request carried.
 * @param {readonly AgentRun[]} list @param {string} id @param {ApiUsage} usage
 * @returns {readonly AgentRun[]}
 */
export function stepped(list, id, usage) {
  if (!list.some((x) => x.id === id)) return list;
  const context = (usage.input_tokens ?? 0) + (usage.cache_read_input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0) + (usage.output_tokens ?? 0);
  return list.map((x) => (x.id === id ? { ...x, steps: x.steps + 1, context, model: usage.model || x.model } : x));
}

/**
 * The subagent's run ended, with turn.complete's reason.
 * @param {readonly AgentRun[]} list @param {string} id @param {string} reason @param {number} at
 * @returns {readonly AgentRun[]}
 */
export function finished(list, id, reason, at) {
  /** @type {AgentStatus} */
  const status = reason === 'answer' ? 'done' : reason === 'aborted' ? 'stopped' : 'failed';
  return list.map((x) => (x.id === id ? { ...x, status, endedAt: at } : x));
}

/**
 * The agent's cost from the collector's records with its id; null when there are none.
 * @param {readonly MeasureRecord[]} records @param {string} id @param {(r: MeasureRecord) => PriceOf} price
 * @returns {{ usd: number | null, isPartial: boolean, records: number } | null}
 */
export function agentCost(records, id, price) {
  const own = records.filter((r) => r.agent === id);
  if (own.length === 0) return null;
  const { total, records: n } = aggregate(own, price);
  return { usd: total.usd, isPartial: total.isPartial, records: n };
}

/** @param {readonly AgentRun[]} list */
export function counts(list) {
  const running = list.filter((x) => x.status === 'running').length;
  const done = list.filter((x) => x.status === 'done').length;
  return { running, finished: list.length - running, done, broken: list.length - running - done };
}

/**
 * The label of the agents button: each state with its mark, the empty ones left out. Never
 * "running/all" — "0/2" read as "none of two done" (calibration 2026-10-09).
 * @param {readonly AgentRun[]} list @returns {string}
 */
export function agentsLabel(list) {
  const { running, done, broken } = counts(list);
  const parts = [running ? `● ${running} działa` : '', done ? `✓ ${done}` : '', broken ? `✗ ${broken}` : ''].filter(Boolean);
  return ['Agenci', parts.join(' · ')].filter(Boolean).join(' ');
}
