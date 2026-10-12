// The desk of the "Warsztat" direction: the plan template's paper with its dotted grain and two
// soft patches of the motif's warm colors. Static: no decoration moves in a loop.
import { AbsoluteFill } from 'remotion';
import { DESK } from '../tokeny';

export const Biurko = () => (
  <AbsoluteFill
    style={{
      backgroundColor: DESK.paper,
      backgroundImage: [
        `radial-gradient(circle at 22% 24%, ${DESK.grainLight} 0 1.6px, transparent 2.2px)`,
        `radial-gradient(circle at 68% 62%, ${DESK.grainDark} 0 1.6px, transparent 2.2px)`,
        `radial-gradient(1300px 700px at 50% -10%, ${DESK.warmth}, transparent 70%)`,
        `radial-gradient(900px 600px at 102% 88%, ${DESK.clay}, transparent 70%)`,
        `radial-gradient(800px 520px at -4% 70%, ${DESK.mustard}, transparent 70%)`,
      ].join(', '),
      backgroundSize: '32px 32px, 40px 40px, auto, auto, auto',
    }}
  />
);
