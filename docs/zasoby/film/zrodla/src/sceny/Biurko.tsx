// The desk of the "Warsztat" direction: the plan template's paper with its dotted grain and two
// soft patches of the motif's warm colors. Static: no decoration moves in a loop. A scene whose
// camera travels along the desk (scene 2 "Komendy") takes the paper without its grain and lays the
// grain (ZIARNO) on its moving stage, so the dots travel with the props and the light stays put.
import type { CSSProperties } from 'react';
import { AbsoluteFill } from 'remotion';
import { DESK } from '../tokeny';

const GRAIN = [
  `radial-gradient(circle at 22% 24%, ${DESK.grainLight} 0 1.6px, transparent 2.2px)`,
  `radial-gradient(circle at 68% 62%, ${DESK.grainDark} 0 1.6px, transparent 2.2px)`,
];
const GRAIN_SIZE = ['32px 32px', '40px 40px'];
const LIGHT = [
  `radial-gradient(1300px 700px at 50% -10%, ${DESK.warmth}, transparent 70%)`,
  `radial-gradient(900px 600px at 102% 88%, ${DESK.clay}, transparent 70%)`,
  `radial-gradient(800px 520px at -4% 70%, ${DESK.mustard}, transparent 70%)`,
];

/** The dotted grain alone, for a layer that moves with a camera. */
export const ZIARNO: CSSProperties = Object.freeze({
  backgroundImage: GRAIN.join(', '),
  backgroundSize: GRAIN_SIZE.join(', '),
});

export const Biurko = ({ ziarno = true }: { ziarno?: boolean }) => (
  <AbsoluteFill
    style={{
      backgroundColor: DESK.paper,
      backgroundImage: [...(ziarno ? GRAIN : []), ...LIGHT].join(', '),
      backgroundSize: [...(ziarno ? GRAIN_SIZE : []), 'auto', 'auto', 'auto'].join(', '),
    }}
  />
);
