// The commands of the panel's Komendy tab in the order relai-panel 0.14 lays them out
// (panel/hooks/pane-commands.tsx): two of FEATURED recommended on top; the third, the tour, goes
// down to the end of the first group. Pure and without imports: scene 3 and wiernosc.test.mjs call
// the same function with core/panel's FEATURED and GROUPS.

export type Grupa = Readonly<{ id: string, title: string, commands: readonly string[] }>;
export type UkladKomend = Readonly<{ polecane: readonly string[], grupy: readonly Grupa[] }>;

export const POLECANE = 2;

export function ukladKomend(featured: readonly string[], groups: readonly Grupa[]): UkladKomend {
  return {
    polecane: featured.slice(0, POLECANE),
    grupy: groups.map((g, i) => (i === 0 ? { ...g, commands: [...g.commands, ...featured.slice(POLECANE)] } : g)),
  };
}

/** Every command the tab shows, top to bottom. */
export const wszystkie = (u: UkladKomend): string[] => [...u.polecane, ...u.grupy.flatMap((g) => g.commands)];

/**
 * Scene 2 "Komendy" (Annexes A and B; PIPELINE_WYDAN E4): the sixteen commands in the order of a
 * project's life — come in, work, look after the project, learn it, hand it over. Each command of
 * FORMS once (wiernosc.test.mjs).
 */
export const CYKL = Object.freeze([
  'relai-adopt',
  'relai-prompt',
  'relai-stage',
  'relai-crew',
  'relai-branch',
  'relai-humanize',
  'relai-audit',
  'relai-clean',
  'relai-backup',
  'relai-security',
  'relai-changelog',
  'relai-update',
  'relai-models',
  'relai-help',
  'relai-tour',
  'relai-handover',
] as const);

export type IdKomendy = typeof CYKL[number];

/** Seconds a command stays on screen (Annex B). */
export const SEKUNDY_NA_KOMENDE = 3.5;
