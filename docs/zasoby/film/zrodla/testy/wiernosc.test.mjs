// "The interface in the film looks like the real panel" (plan FILM_PREZENTACYJNY, goal 4; E3).
// Scene 3 draws the panel's tabs from the dictionary and its commands from core/panel. This test
// holds both to the panel itself: the tabs to TABS of panel/hooks/pane-parts.tsx — read as the
// file's text, never imported (a .tsx of the plugin is not the film's code) — names and order; the
// commands of the scene to FORMS of core/panel/commands.mjs, and their layout to the rule the
// pane's own code states (two recommended, the rest in groups). Each check has its positive control.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PL } from '../src/teksty.ts';
import { POLECANE, ukladKomend, wszystkie } from '../src/komendy.ts';
import { FEATURED, GROUPS, NAMES } from '../../../../../core/panel/theme.mjs';
import { FORMS } from '../../../../../core/panel/commands.mjs';
import { REPO } from '../skrypty/dane.mjs';

const PANE_PARTS = join(REPO, 'panel/hooks/pane-parts.tsx');
const PANE_COMMANDS = join(REPO, 'panel/hooks/pane-commands.tsx');

/** The tab labels of a pane-parts.tsx text, in order; an error when the line is not there. */
export function tabsOf(text) {
  const line = text.split('\n').find((l) => /^export const TABS = \[/.test(l));
  if (!line) throw new Error('pane-parts.tsx has no line "export const TABS = ["');
  const labels = [...line.matchAll(/\['[a-z]+', '([^']+)'\]/g)].map((m) => m[1]);
  if (labels.length === 0) throw new Error('TABS without a single [id, label] pair');
  return labels;
}

/** Fails when the film's tabs differ from the panel's in a name or in the order. */
const checkTabs = (text, tabs = PL.panel.zakladki) => assert.deepEqual([...tabs], tabsOf(text));

test('the tabs of scene 3 are TABS of pane-parts.tsx, names and order', (t) => {
  const text = readFileSync(PANE_PARTS, 'utf8');
  checkTabs(text);
  t.diagnostic(`tabs: ${tabsOf(text).join(' · ')}`);
});

test('positive control: a copy of pane-parts.tsx with another order fails the check', () => {
  const text = readFileSync(PANE_PARTS, 'utf8');
  const line = text.split('\n').find((l) => l.startsWith('export const TABS = ['));
  assert.ok(line, 'the copy is made from the real line');
  // the copy swaps the first two pairs: the same names, another order
  const swapped = line.replace("['commands', 'Komendy'], ['costs', 'Koszty']", "['costs', 'Koszty'], ['commands', 'Komendy']");
  assert.notEqual(swapped, line, 'the copy really differs');
  const copy = text.replace(line, swapped);
  assert.throws(() => checkTabs(copy));
  // and a copy with a renamed tab fails too
  assert.throws(() => checkTabs(text.replace("'Mapa'", "'Plan'")));
});

test('the commands of scene 3 are FORMS of core/panel: each once, none missing', (t) => {
  const shown = wszystkie(ukladKomend(FEATURED, GROUPS));
  const forms = FORMS.map((f) => f.command);
  assert.equal(new Set(shown).size, shown.length, 'no command twice');
  assert.deepEqual([...shown].sort(), [...forms].sort());
  for (const c of shown) assert.ok(NAMES[c], `${c} has a Polish name and purpose`);
  t.diagnostic(`commands: ${shown.length} of FORMS ${forms.length}`);
  // positive control: a group missing a command, and a group with one doubled, are caught
  const missing = GROUPS.map((g, i) => (i === 1 ? { ...g, commands: g.commands.slice(1) } : g));
  assert.notDeepEqual([...wszystkie(ukladKomend(FEATURED, missing))].sort(), [...forms].sort());
  const doubled = GROUPS.map((g, i) => (i === 2 ? { ...g, commands: [...g.commands, 'relai-stage'] } : g));
  const shownDoubled = wszystkie(ukladKomend(FEATURED, doubled));
  assert.notEqual(new Set(shownDoubled).size, shownDoubled.length);
});

test('the layout rule of the scene is the one pane-commands.tsx states', () => {
  const text = readFileSync(PANE_COMMANDS, 'utf8');
  assert.match(text, new RegExp(`const featured = FEATURED\\.slice\\(0, ${POLECANE}\\)`));
  assert.match(text, new RegExp(`\\.\\.\\.FEATURED\\.slice\\(${POLECANE}\\)`));
  // positive control: another number of recommended would not match the pane's line
  assert.doesNotMatch(text, new RegExp(`const featured = FEATURED\\.slice\\(0, ${POLECANE + 1}\\)`));
});
