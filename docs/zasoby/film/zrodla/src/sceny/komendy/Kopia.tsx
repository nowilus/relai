// Prop of "Kopia zapasowa" (relai-backup), from its icon — a box with the clay arrow into it. The
// project's sheets drop into the box along the arrow; the padlock tagged ".env" hops after them,
// knocks on the box and bounces back: secrets stay out (relai-backup.md, step 3). The zip runs
// shut and the box is stamped "ZIP".
import type { CSSProperties, ReactNode } from 'react';
import { PROP } from '../../tokeny';
import { PL } from '../../teksty';
import { Cien, H, Kartka, NapisNaRekwizycie, STROKE, W, arc, ease, glide, kreska, lerp, wobble } from './rysunek';

const R = PL.komendy.rekwizyty;

/** The beats, in frames of the command's window (75 frames). */
const T = Object.freeze({
  arrow: [2, 12],
  sheets: [8, 15, 22], // each drops in over DROP frames
  lockHop: 28,
  lockHit: 36, // over the box's mouth: a clay cross, and it falls back
  zip: [44, 57],
  stamp: 56,
  arrowOut: [34, 44],
});
const DROP = 13;

// the box, in prop coordinates
const BOX = Object.freeze({ x: 225, y: 180, w: 310, h: 190 });
const SEAM = BOX.y + 56;
const MID = BOX.x + BOX.w / 2;
// the padlock: body, then the tag hanging under it
const LOCK = Object.freeze({ x: 575, y: 250, w: 86, h: 70 });

const layer = (style: CSSProperties, children: ReactNode) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, ...style }}>{children}</div>
);

// where each sheet waits on the desk, and its angle
const SHEETS: readonly { at: [number, number], rot: number }[] = [
  { at: [110, 75], rot: -9 },
  { at: [190, 40], rot: 5 },
  { at: [85, 170], rot: -3 },
];

export const Kopia = ({ t }: { t: number }) => {
  const boxTilt = wobble(t, T.lockHit, 14) * 1.6;
  const boxStyle: CSSProperties = boxTilt !== 0 ? { transform: `rotate(${boxTilt}deg)`, transformOrigin: `${MID}px ${BOX.y + BOX.h}px` } : {};

  // the padlock: a hop up over the box's mouth, after the sheets; it is turned away there and
  // falls back to where it stood, with a little bounce
  const hop = glide(t, T.lockHop, T.lockHit);
  const back = glide(t, T.lockHit + 2, T.lockHit + 12);
  const [hx, hy] = arc([0, 0], [-40, -190], [-150, -150], hop);
  const [bx, by] = arc([-150, -150], [-60, -170], [0, 0], back);
  // stopped at the mouth, it shakes for a moment
  const shake = t >= T.lockHit - 2 && t <= T.lockHit + 2 ? Math.sin(t * 2.6) * 7 : 0;
  const lockDx = (t < T.lockHit + 2 ? hx : bx) + shake;
  const lockDy = (t < T.lockHit + 2 ? hy : by) - Math.abs(wobble(t, T.lockHit + 12, 10)) * 14;
  const lockRot = t < T.lockHit + 2 ? -14 * hop : -14 * (1 - back) + wobble(t, T.lockHit + 12, 12) * 6;
  // the blocker (calibration round 1, Łukasz): a no-entry sign over the mouth and one soft pulse
  // of clay behind the whole prop — one pulse, so far under three flashes a second (case b7)
  const sign = ease(t, T.lockHit - 2, T.lockHit + 3) * (1 - ease(t, T.lockHit + 18, T.lockHit + 26));
  const alarm = ease(t, T.lockHit - 3, T.lockHit + 1) * (1 - glide(t, T.lockHit + 4, T.lockHit + 20));
  const lockStyle: CSSProperties = lockDx !== 0 || lockDy !== 0 || lockRot !== 0
    ? { transform: `translate(${lockDx}px, ${lockDy}px) rotate(${lockRot}deg)`, transformOrigin: `${LOCK.x + LOCK.w / 2}px ${LOCK.y + LOCK.h}px` }
    : {};

  const arrowIn = ease(t, T.arrow[0] ?? 0, T.arrow[1] ?? 0);
  const arrowOut = ease(t, T.arrowOut[0] ?? 0, T.arrowOut[1] ?? 0);
  const zip = glide(t, T.zip[0] ?? 0, T.zip[1] ?? 0);
  const stamp = ease(t, T.stamp, T.stamp + 8);
  const pullX = lerp(BOX.x + 24, BOX.x + BOX.w - 24, zip);

  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      {/* the alarm behind everything: the desk glows clay for a moment while .env is stopped */}
      {alarm > 0 ? (
        <div style={{ position: 'absolute', left: -560, top: -360, width: W + 1120, height: H + 720, opacity: alarm, background: `radial-gradient(ellipse at ${560 + MID}px ${360 + BOX.y}px, ${PROP.alarm}, ${PROP.alarmEdge} 62%)` }} />
      ) : null}
      {/* shadows and the box's back wall: the sheets sink behind its front */}
      {layer(boxStyle, (
        <svg width={W} height={H} style={{ overflow: 'visible' }}>
          <Cien cx={MID} cy={BOX.y + BOX.h + 6} rx={BOX.w * 0.56} />
          <rect x={BOX.x + 14} y={BOX.y - 20} width={BOX.w - 28} height={40} rx={10} fill={PROP.line} stroke={PROP.ink} strokeWidth={STROKE * 0.8} />
        </svg>
      ))}
      {layer({}, (
        <svg width={W} height={H} style={{ overflow: 'visible' }}>
          {/* the arrow of the icon, into the box */}
          <g opacity={arrowIn * (1 - arrowOut)}>
            <path d={`M ${MID} 0 V ${lerp(0, 145, arrowIn)}`} {...kreska(PROP.clay, STROKE * 1.2)} />
            <path d={`M ${MID - 22} 123 L ${MID} 145 L ${MID + 22} 123`} {...kreska(PROP.clay, STROKE * 1.2)} opacity={arrowIn >= 1 ? 1 : 0} />
          </g>
          {SHEETS.map((s, i) => {
            const k = glide(t, T.sheets[i] ?? 0, (T.sheets[i] ?? 0) + DROP);
            const [x, y] = arc(s.at, [MID, -30], [MID, BOX.y + 110], k);
            return <Kartka key={i} x={x} y={y} rot={lerp(s.rot, 0, k)} scale={lerp(1, 0.86, k)} opacity={k >= 1 ? 0 : 1} />;
          })}
        </svg>
      ))}
      {/* the box's front, its zip and its stamp */}
      {layer(boxStyle, (
        <>
          <svg width={W} height={H} style={{ overflow: 'visible' }}>
            <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={26} fill={PROP.paper2} stroke={PROP.ink} strokeWidth={STROKE} />
            <path d={`M ${BOX.x} ${SEAM} H ${BOX.x + BOX.w}`} {...kreska(PROP.ink, STROKE * 0.8)} />
            <path d={`M ${MID - 34} ${BOX.y + BOX.h - 40} h 68`} {...kreska(PROP.inkSoft, STROKE * 0.8)} />
            {/* the zip's teeth, closed up to the pull */}
            <path d={`M ${BOX.x + 24} ${SEAM} H ${pullX}`} stroke={PROP.ink} strokeWidth={12} strokeDasharray="4 5" opacity={zip > 0 ? 1 : 0} />
            <g transform={`translate(${pullX} ${SEAM})`}>
              <rect x={-11} y={-4} width={22} height={36} rx={8} fill={PROP.clay} stroke={PROP.clayDark} strokeWidth={2.5} />
              <circle cx={0} cy={22} r={5} fill={PROP.paper2} />
            </g>
          </svg>
          <NapisNaRekwizycie
            x={BOX.x}
            y={SEAM + 18}
            w={BOX.w}
            h={BOX.y + BOX.h - SEAM - 60}
            size={58}
            color={PROP.clay}
            style={{ letterSpacing: 8, opacity: stamp, transform: stamp < 1 ? `scale(${1.4 - 0.4 * stamp}) rotate(${-4 * stamp}deg)` : 'rotate(-4deg)' }}
          >
            {R.zip}
          </NapisNaRekwizycie>
        </>
      ))}
      {/* the padlock with the secrets' tag */}
      {layer(lockStyle, (
        <>
          <svg width={W} height={H} style={{ overflow: 'visible' }}>
            <Cien cx={LOCK.x + LOCK.w / 2} cy={LOCK.y + LOCK.h + 66} rx={56} ry={10} opacity={1 - Math.min(1, -lockDy / 60)} />
            <path d={`M ${LOCK.x + 18} ${LOCK.y + 2} V ${LOCK.y - 18} a ${LOCK.w / 2 - 18} ${LOCK.w / 2 - 18} 0 0 1 ${LOCK.w - 36} 0 V ${LOCK.y + 2}`} {...kreska(PROP.ink, STROKE * 1.3)} />
            <rect x={LOCK.x} y={LOCK.y} width={LOCK.w} height={LOCK.h} rx={14} fill={PROP.mustard} stroke={PROP.ink} strokeWidth={STROKE} />
            <circle cx={LOCK.x + LOCK.w / 2} cy={LOCK.y + 28} r={7} fill={PROP.ink} />
            <path d={`M ${LOCK.x + LOCK.w / 2} ${LOCK.y + 32} v 16`} {...kreska(PROP.ink, STROKE)} />
            {/* the tag on its string */}
            <path d={`M ${LOCK.x + LOCK.w / 2} ${LOCK.y + LOCK.h} v 14`} {...kreska(PROP.inkSoft, 3)} />
            <rect x={LOCK.x - 12} y={LOCK.y + LOCK.h + 14} width={LOCK.w + 24} height={46} rx={10} fill={PROP.paper} stroke={PROP.ink} strokeWidth={STROKE * 0.7} />
          </svg>
          <NapisNaRekwizycie x={LOCK.x - 12} y={LOCK.y + LOCK.h + 14} w={LOCK.w + 24} h={46} size={30} color={PROP.ink}>
            {R.env}
          </NapisNaRekwizycie>
        </>
      ))}
      {/* the no-entry sign over the box's mouth, beside the stopped padlock */}
      {sign > 0 ? layer({}, (
        <svg width={W} height={H} style={{ overflow: 'visible' }}>
          <g transform={`translate(${MID - 18} ${BOX.y - 72}) scale(${0.6 + 0.4 * Math.min(1, sign * 1.2)})`} opacity={sign}>
            <circle r={40} fill={PROP.clay} stroke={PROP.clayDark} strokeWidth={4} />
            <rect x={-24} y={-7} width={48} height={14} rx={7} fill={PROP.paper} />
          </g>
        </svg>
      )) : null}
    </div>
  );
};
