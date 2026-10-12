// Scene 1 of the film, "Pamięć" (plan FILM_PREZENTACYJNY, section 5): a fresh session is an empty
// chat; a note pinned on its corner asks "what if the project remembered?"; the window goes and the
// RelAI mark — the card on a pin from docs/zasoby/branding/logo.svg — lands with the line under it.
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { BAR } from '../rdzen';
import { FONT, INK } from '../tokeny';
import { PL } from '../teksty';
import { Biurko } from './Biurko';
import { Napis } from './Napis';
import { Karteczka } from './Karteczka';
import { Okno, Prompt } from './Okno';

/** The beats of the scene in frames (30 fps, 360 frames). */
const T = Object.freeze({
  window: 4,
  note: 62,
  underline: 92,
  leave: 168, // the window and its note go down to the desk
  leaveFrames: 34,
  mark: 186,
  line: 226,
  drift: 250,
  caption1: [22, 160],
  caption2: [208, 352],
});
const WIN = Object.freeze({ left: 340, top: 128, width: 1240, height: 660 });
const MARK = 400;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

export const Pamiec = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sp = (from: number, damping = 200) => spring({ frame: frame - from, fps, config: { damping, mass: 0.9 } });

  const leave = interpolate(frame, [T.leave, T.leave + T.leaveFrames], [0, 1], { ...clamp, easing: (t) => t * t });
  const markIn = sp(T.mark, 13);
  const markSettled = Math.abs(1 - markIn) < 0.001;
  const drift = 1 + 0.025 * ease(frame, T.drift, durationInFrames);
  const underline = ease(frame, T.underline, T.underline + 22);
  const words = PL.pamiec.haslo.split(' ');

  return (
    <AbsoluteFill>
      <Biurko />
      {leave < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - leave, transform: leave > 0 ? `translateY(${leave * 120}px)` : undefined }}>
          <Okno left={WIN.left} top={WIN.top} width={WIN.width} height={WIN.height} entry={sp(T.window, 18)} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div style={{ fontFamily: FONT.ui, fontWeight: 600, fontSize: 28, color: BAR.muted, letterSpacing: 0.2 }}>{PL.pamiec.okno}</div>
            <div style={{ flex: 1, minHeight: 0 }} />
            <Prompt />
          </Okno>
          <Karteczka land={sp(T.note, 13)} angle={2.5} size={50} style={{ right: 150, top: 86 }}>
            <div style={{ position: 'relative' }}>
              {PL.pamiec.notatka}
              {/* drawn by a clip, as the questions of scene 2: a dash would break on a non-scaling stroke */}
              <svg viewBox="0 0 100 10" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -10, width: '100%', height: 12, overflow: 'visible', clipPath: `inset(-50% ${(1 - underline) * 100}% -50% 0)` }}>
                <path d="M 1 6 C 22 2.5, 48 8.5, 70 4.5 S 92 5, 99 3.5" fill="none" stroke={INK.note} strokeWidth={4.5} strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={underline > 0 ? 1 : 0} />
              </svg>
            </div>
          </Karteczka>
        </AbsoluteFill>
      ) : null}

      {frame >= T.mark ? (
        <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 96, gap: 26, transform: `scale(${drift})`, transformOrigin: '50% 40%' }}>
          <Img
            src={staticFile('znak/logo.svg')}
            style={{
              width: MARK,
              height: MARK,
              opacity: Math.min(1, markIn * 2.5),
              // the mark's own square of desk paper and its two soft patches stay out: the card on
              // its pin and the tape lie on the film's desk
              clipPath: 'inset(15% 10% 19% 10% round 3%)',
              // a spring from above with a turn, then no transform at all (P-035)
              transform: markSettled ? undefined : `translateY(${(1 - markIn) * -360}px) rotate(${(1 - markIn) * -12}deg)`,
            }}
          />
          <div style={{ display: 'flex', gap: '0.26em', fontFamily: FONT.serif, fontWeight: 600, fontSize: 92, lineHeight: 1.05, letterSpacing: -1.2, color: INK.title }}>
            {words.map((w, i) => {
              const k = ease(frame, T.line + i * 5, T.line + 18 + i * 5);
              return <span key={i} style={{ display: 'inline-block', opacity: k, transform: `translateY(${(1 - k) * 30}px)` }}>{w}</span>;
            })}
          </div>
        </AbsoluteFill>
      ) : null}

      <Napis text={PL.pamiec.napisy[0] ?? ''} from={T.caption1[0] ?? 0} to={T.caption1[1] ?? 0} />
      <Napis text={PL.pamiec.napisy[1] ?? ''} from={T.caption2[0] ?? 0} to={T.caption2[1] ?? 0} />
    </AbsoluteFill>
  );
};
