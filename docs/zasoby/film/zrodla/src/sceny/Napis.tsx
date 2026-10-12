// A subtitle of the silent film: one line on a paper card at the bottom. The card comes up and its
// words rise one after another; it leaves as a whole, up and out. Opacity and position only — never
// a flash (case b7 of the plan).
import { interpolate, useCurrentFrame } from 'remotion';
import { FONT, INK } from '../tokeny';

const IN = 10;
const OUT = 9;
const WORD_STEP = 1.6; // frames between the words' rise

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

interface NapisProps { text: string, from: number, to: number }

export const Napis = ({ text, from, to }: NapisProps) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [from, from + IN], [0, 1], { ...clamp, easing: easeOut });
  const leave = interpolate(frame, [to - OUT, to], [0, 1], { ...clamp, easing: (t) => t * t });
  if (enter === 0 || leave === 1) return null;
  const words = text.split(' ');
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 50, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          maxWidth: 1560,
          padding: '16px 34px 18px',
          borderRadius: 999,
          background: INK.captionBg,
          border: `1px solid ${INK.captionEdge}`,
          boxShadow: INK.captionShadow,
          color: INK.captionText,
          fontFamily: FONT.ui,
          fontSize: 42,
          fontWeight: 600,
          lineHeight: 1.2,
          letterSpacing: -0.2,
          whiteSpace: 'nowrap',
          opacity: enter * (1 - leave),
          transform: `translateY(${(1 - enter) * 26 - leave * 22}px) scale(${0.97 + 0.03 * enter})`,
        }}
      >
        {words.map((w, i) => {
          const t = interpolate(frame, [from + 3 + i * WORD_STEP, from + 11 + i * WORD_STEP], [0, 1], { ...clamp, easing: easeOut });
          return (
            <span key={i} style={{ display: 'inline-block', marginRight: i < words.length - 1 ? '0.27em' : 0, opacity: t, transform: `translateY(${(1 - t) * 16}px)` }}>
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
