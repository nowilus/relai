// The hand-drawn note of scene 2: a loop drawn around one battery, an arrow, and a paper note
// pinned with tape that lands on the window — dark ink on paper, legible on a phone (calibration
// round 2, 2026-10-12). The loop is decorative geometry sized from the measured box of its battery;
// the words are laid out by the browser, never placed glyph by glyph.
import type { Ref } from 'react';
import { FONT, INK, NOTE, SCALE } from '../tokeny';
import { useT } from '../jezyk';

const S = SCALE;
export const PAD_X = 20 * S;
export const PAD_Y = 14 * S;

/** A stroke not yet begun draws nothing: a round cap of a zero-length dash would show as a dot. */
const drawn = (progress: number) => (progress > 0 ? 1 : 0);

/** A loop that starts at the top, goes round once and overshoots a little, like a pen does. */
function loopPath(w: number, h: number): string {
  const cx = w / 2 + PAD_X;
  const cy = h / 2 + PAD_Y;
  const rx = w / 2 + PAD_X * 0.8;
  const ry = h / 2 + PAD_Y * 0.8;
  const points: string[] = [];
  const turns = 1.08;
  const steps = 64;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * turns * Math.PI * 2 - Math.PI / 2 - 0.25;
    const wobble = 1 + 0.035 * Math.sin(i * 0.55) - 0.04 * (i / steps);
    const x = cx + Math.cos(t) * rx * wobble;
    const y = cy + Math.sin(t) * ry * wobble * (1 + 0.06 * Math.cos(t));
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return points.join(' ');
}

interface AdnotacjaProps {
  box: { w: number, h: number },
  ring: number, // 0..1 drawn
  arrow: number,
  note: number,
  used: string, // the battery's value as the bar shows it, e.g. "19 %"
  left: number, // percent left, from the same data
  noteRef?: Ref<HTMLDivElement>, // the words' box: the camera frames the battery and the words together
}

export const Adnotacja = ({ box, ring, arrow, note, used, left, noteRef }: AdnotacjaProps) => {
  const slowa = useT();
  const w = box.w + PAD_X * 2;
  const h = box.h + PAD_Y * 2;
  const stroke = { fill: 'none', stroke: INK.note, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const head = Math.max(0, (arrow - 0.8) / 0.2);
  const arrowW = 64 * S;
  const arrowH = 58 * S;
  return (
    <>
      <svg width={w} height={h} style={{ position: 'absolute', left: -PAD_X, top: -PAD_Y, overflow: 'visible' }}>
        <path d={loopPath(box.w, box.h)} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ring} strokeWidth={2.4 * S} opacity={drawn(ring)} {...stroke} />
      </svg>
      <svg width={arrowW} height={arrowH} viewBox="0 0 64 58" style={{ position: 'absolute', left: box.w * 0.55, top: box.h + PAD_Y * 0.9, overflow: 'visible' }}>
        <path d="M 4 2 C 6 26, 24 46, 58 50" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - arrow} strokeWidth={2.2} opacity={drawn(arrow)} {...stroke} />
        <path d="M 46 41 L 59 50 L 45 57" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - head} strokeWidth={2.2} opacity={drawn(head)} {...stroke} />
      </svg>
      <div
        ref={noteRef}
        style={{
          position: 'absolute',
          left: box.w * 0.55 + arrowW + 12 * S,
          top: box.h + PAD_Y * 0.9 + arrowH * 0.15,
          whiteSpace: 'nowrap',
          padding: `${16 * S}px ${22 * S}px ${14 * S}px`,
          borderRadius: 10 * S,
          background: NOTE.paper,
          border: `1px solid ${NOTE.edge}`,
          boxShadow: NOTE.shadow,
          fontFamily: FONT.handBold,
          fontWeight: 700,
          color: NOTE.ink,
          opacity: Math.min(1, Math.max(0, note) * 3),
          transform: `translateY(${(1 - note) * -46 * S}px) rotate(${-8 + 6.5 * note}deg) scale(${1.1 - 0.1 * note})`,
          transformOrigin: '30% 0%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -9 * S,
            left: '50%',
            width: 62 * S,
            height: 18 * S,
            marginLeft: -31 * S,
            background: NOTE.tape,
            border: `1px solid ${NOTE.tapeEdge}`,
            borderRadius: 2,
            transform: 'rotate(3deg)',
          }}
        />
        <div style={{ fontSize: 28 * S, lineHeight: 1.05, color: NOTE.accent }}>{slowa.paski.notatka}</div>
        <div style={{ marginTop: 6 * S, fontSize: 17.5 * S, lineHeight: 1.3 }}>
          <span style={{ color: NOTE.inkSoft }}>{slowa.paski.zuzyte}</span> {used}
        </div>
        <div style={{ fontSize: 17.5 * S, lineHeight: 1.3 }}>
          <span style={{ color: NOTE.inkSoft }}>{slowa.paski.pelna}</span> {Math.round(left)} %
        </div>
      </div>
    </>
  );
};
