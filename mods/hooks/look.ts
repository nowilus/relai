// relai-mods: the cockpit's drawings and theme keys — pure, no $ (P-017). Every color of a Box or
// Text is a theme key (P-042, P-044); every drawing carries both palettes of the core's INK and
// switches by prefers-color-scheme, with the rules of only the inks it paints (DESIGN.md §8).

import { INK, KEY, RULE } from './core/theme.mjs'
import type { PluginState } from './inventory'

export { KEY, RULE }

/** The kind labels' keys (plan, section 5): mod in clay, hook in suggestion, plugin muted, project in mustard. */
export const KIND_KEY = { mod: 'claude', hook: 'suggestion', plugin: 'inactive', project: 'warning' } as const

type Ink = keyof typeof INK.dark

// fill and stroke rules of the given inks, dark by default, light under the media query
function inkRules(fills: Ink[], strokes: Ink[]): string {
  const rules = (p: Record<string, string>) =>
    fills.map((k) => `.f-${k}{fill:${p[k]}}`).join('') + strokes.map((k) => `.s-${k}{stroke:${p[k]}}`).join('')
  return `<style>${rules(INK.dark)}@media (prefers-color-scheme: light){${rules(INK.light)}}</style>`
}

export const SWITCH = { width: 30, height: 16 } as const

/** The switch's look: a track and a knob, green and right when on, grey and left when off. Not pressable (Annex C). */
export function switchSvg(state: PluginState): string {
  const isOn = state === 'on'
  const track = isOn ? 'done' : 'track'
  const knob = isOn ? 'card' : 'muted'
  return `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="16" viewBox="0 0 30 16">${inkRules([track, knob], [])}`
    + `<rect x="1" y="1" width="28" height="14" rx="7" class="f-${track}"/>`
    + `<circle cx="${isOn ? 22 : 8}" cy="8" r="5" class="f-${knob}"/></svg>`
}

export const switchAlt = (state: PluginState): string => (state === 'on' ? 'przełącznik: włączony' : 'przełącznik: wyłączony')

export const LOCK = { width: 12, height: 14 } as const

/** The lock in place of a switch: a shackle and a body in outline, the muted ink. */
export function lockSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 12 14">${inkRules([], ['muted'])}`
    + '<path d="M3.5 6V4.2a2.5 2.5 0 0 1 5 0V6" fill="none" stroke-width="1.4" class="s-muted"/>'
    + '<rect x="1.5" y="6" width="9" height="7" rx="1.5" fill="none" stroke-width="1.4" class="s-muted"/></svg>'
}

export const lockAlt = (reason: string): string => `kłódka: ${reason}`
