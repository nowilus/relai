// A raw board of the animatic (plan FILM_PREZENTACYJNY, E2): the desk, the scene's title, a frame
// standing for the interface the scene will show (with the words of what it will be), the scene's
// length and its subtitles in their rhythm. Layout by flex in the frame's size, never coordinates
// for text (zasada 15). E3 and E4 replace each board with the scene itself.
import type { ReactNode } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { BAR } from '../rdzen';
import { FONT, INK, WINDOW, DESK } from '../tokeny';
import { PL } from '../teksty';
import { Biurko } from './Biurko';
import { Napis } from './Napis';

const GAP = 14; // frames between two subtitles of a board
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

interface PlanszaProps {
  tytul: string,
  ekran: string,
  napisy: readonly string[],
  sekundy: number,
  children?: ReactNode,
}

export const Plansza = ({ tytul, ekran, napisy, sekundy, children }: PlanszaProps) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const lift = interpolate(frame, [0, 24], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  // the subtitles share the board's time evenly, each with a breath before the next one
  const span = napisy.length > 0 ? Math.floor(durationInFrames / napisy.length) : 0;
  return (
    <AbsoluteFill>
      <Biurko />
      <AbsoluteFill style={{ padding: '70px 130px 150px', display: 'flex', flexDirection: 'column', gap: 34 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 40, opacity: lift, transform: `translateY(${(1 - lift) * 20}px)` }}>
          <div style={{ fontFamily: FONT.serif, fontWeight: 600, fontSize: 80, lineHeight: 1.05, color: INK.title, letterSpacing: -1, minWidth: 0 }}>{tytul}</div>
          {/* Hanken, not Kalam: Kalam's "1" reads as "I" ("15 s" looked like "IS s") */}
          <div style={{ fontFamily: FONT.ui, fontWeight: 700, fontSize: 40, color: INK.margin, flexShrink: 0 }}>{`${sekundy} ${PL.plansza.sekundy}`}</div>
        </div>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            borderRadius: WINDOW.radius,
            background: WINDOW.surface,
            border: `3px dashed ${INK.margin}`,
            boxShadow: DESK.shadow,
            padding: 44,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 36,
            overflow: 'hidden',
            opacity: lift,
          }}
        >
          {children}
          <div style={{ fontFamily: FONT.ui, fontWeight: 500, fontSize: 32, color: BAR.muted, textAlign: 'center', maxWidth: '100%' }}>
            {`${PL.plansza.ekran}: ${ekran}`}
          </div>
        </div>
      </AbsoluteFill>
      {napisy.map((t, i) => (
        <Napis key={i} text={t} from={i * span + 8} to={(i + 1) * span - GAP} />
      ))}
    </AbsoluteFill>
  );
};

/** A row of paper chips on the board: the tabs, the buttons, the lines a scene will show. */
export const Kafle = ({ slowa, duze = false }: { slowa: readonly string[], duze?: boolean }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22, maxWidth: '100%' }}>
    {slowa.map((s) => (
      <div
        key={s}
        style={{
          padding: duze ? '18px 36px' : '12px 28px',
          borderRadius: 16,
          background: INK.captionBg,
          border: `1px solid ${INK.captionEdge}`,
          color: INK.captionText,
          fontFamily: FONT.ui,
          fontWeight: 600,
          fontSize: duze ? 44 : 36,
          whiteSpace: 'nowrap',
        }}
      >
        {s}
      </div>
    ))}
  </div>
);

/** A figure of the finale: the number from the manifest over its words from the dictionary. */
export const Liczba = ({ wartosc, slowa }: { wartosc: string, slowa: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0 }}>
    <div style={{ fontFamily: FONT.serif, fontWeight: 600, fontSize: 104, lineHeight: 1, color: BAR.text }}>{wartosc}</div>
    <div style={{ fontFamily: FONT.ui, fontWeight: 600, fontSize: 32, color: BAR.muted, whiteSpace: 'nowrap' }}>{slowa}</div>
  </div>
);
