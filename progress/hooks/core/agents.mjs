// RelAI core / panel: agents — the subagents of the session, live (plan PANEL_CLAUDE, E9, Aneks C).
//
// Modeled on savvy-progress by johnnyvizz (github.com/johnnyvizz/claude-kit, MIT): its agents
// panel follows agent.spawn, the subagent's turn.step and its turn.complete. Here the list is
// pure data, kept by relai-progress; the engine's $.agent.list() forgets an agent the moment its
// run ends (relai-probe-e9, 2026-10-09), so the plugin holds the history itself.
// The cost of an agent is never counted here: it is the sum of the collector's records with the
// agent's id (relai-panel, E3), priced with the dated list; no records means no measurement,
// said in words by the caller, never zero. Same ESM rule and same copy as plan-state.mjs.

import { aggregate } from './measure.mjs';

/**
 * @typedef {import('./measure.mjs').MeasureRecord} MeasureRecord
 * @typedef {import('./measure.mjs').PriceOf} PriceOf
 * @typedef {import('./measure.mjs').ApiUsage} ApiUsage
 * @typedef {'running' | 'done' | 'stopped' | 'failed'} AgentStatus
 * @typedef {{ id: string, type: string, description: string, model: string, at: number,
 *   status: AgentStatus, endedAt: number | null, steps: number, context: number }} AgentRun
 */

/** How many runs the list keeps, newest last. */
export const MAX_AGENTS = 50;

/**
 * A subagent started: running, at the end of the list (the same id replaced, never twice).
 * @param {readonly AgentRun[]} list
 * @param {{ id: string, type: string, description: string, model: string, at: number }} s
 * @returns {AgentRun[]}
 */
export function spawned(list, s) {
  /** @type {AgentRun} */
  const run = { ...s, status: 'running', endedAt: null, steps: 0, context: 0 };
  return [...list.filter((x) => x.id !== s.id), run].slice(-MAX_AGENTS);
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
