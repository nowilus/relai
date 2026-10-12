// The three questions under the title, each underlined by hand as its bar comes in — in the
// darker twin of that bar's color, so the eye pairs the question with the bar (calibration round 2).
import { FONT, INK, QUESTION } from '../tokeny';

interface PytaniaProps {
  questions: readonly string[],
  drawn: (index: number) => number, // 0..1, how far the underline of question i is drawn
}

export const Pytania = ({ questions, drawn }: PytaniaProps) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 22, fontFamily: FONT.ui, fontSize: 36, fontWeight: 500, color: INK.lead }}>
    {questions.map((q, i) => {
      const k = drawn(i);
      return (
        <div key={q} style={{ display: 'flex', alignItems: 'baseline', gap: 22 }}>
          {i > 0 ? <span style={{ color: INK.lead, opacity: 0.6 }}>·</span> : null}
          <span style={{ position: 'relative', color: INK.title, opacity: 0.72 + 0.28 * k }}>
            {q}
            <svg
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
              style={{ position: 'absolute', left: -4, right: -4, bottom: -12, width: 'calc(100% + 8px)', height: 12, overflow: 'visible', clipPath: `inset(-50% ${(1 - k) * 100}% -50% 0)` }}
            >
              <path d="M 1 6 C 22 2.5, 48 8.5, 70 4.5 S 92 5, 99 3.5" fill="none" stroke={QUESTION[i] ?? INK.lead} strokeWidth={4.5} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={k > 0 ? 1 : 0} />
            </svg>
          </span>
        </div>
      );
    })}
  </div>
);
