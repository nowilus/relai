// A loop drawn by hand around a measured box, the way scene 2 rings its battery: it starts at the
// top, goes round once and overshoots a little, like a pen does. The ellipse is sized to pass
// outside the box's corners (a long line of text would be crossed at its ends otherwise).
// Decorative geometry sized from the box; the words it rings are laid out by the browser.
import { INK, SCALE } from '../tokeny';
import type { Punkt } from '../kamera';

const S = SCALE;
const MARGIN = 18 * S;

type Box = { at: Punkt, w: number, h: number };

/** The radii of the loop around a w × h box: wider than the box, tall enough to clear its corners. */
function radii(w: number, h: number): { rx: number, ry: number } {
  const rx = (w / 2) * 1.04 + MARGIN;
  const share = Math.min(0.96, w / 2 / rx);
  const ry = Math.max(h / 2 + MARGIN * 0.7, ((h / 2) / Math.sqrt(1 - share * share)) * 1.05);
  return { rx, ry };
}

/** The box the loop takes on the stage: what a camera must frame to show the whole loop. */
export function ringBox(b: Box): Box {
  const { rx, ry } = radii(b.w, b.h);
  return { at: { x: b.at.x + b.w / 2 - rx, y: b.at.y + b.h / 2 - ry }, w: 2 * rx, h: 2 * ry };
}

function loopPath(rx: number, ry: number): string {
  const points: string[] = [];
  const steps = 96;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 1.08 * Math.PI * 2 - Math.PI / 2 - 0.25;
    // a pen's wobble, small: on a long ellipse a few per cent of the radius is a letter's width
    const wobble = 1 + 0.012 * Math.sin(i * 0.5) - 0.012 * (i / steps);
    points.push(`${i === 0 ? 'M' : 'L'} ${(rx + Math.cos(t) * rx * wobble).toFixed(2)} ${(ry + Math.sin(t) * ry * wobble).toFixed(2)}`);
  }
  return points.join(' ');
}

interface PetlaProps extends Box { drawn: number } // drawn 0..1

export const Petla = ({ at, w, h, drawn }: PetlaProps) => {
  const { rx, ry } = radii(w, h);
  return (
    <svg width={2 * rx} height={2 * ry} style={{ position: 'absolute', left: at.x + w / 2 - rx, top: at.y + h / 2 - ry, overflow: 'visible', pointerEvents: 'none' }}>
      <path d={loopPath(rx, ry)} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - drawn} strokeWidth={2.4 * S} fill="none" stroke={INK.note} strokeLinecap="round" strokeLinejoin="round" opacity={drawn > 0 ? 1 : 0} />
    </svg>
  );
};
