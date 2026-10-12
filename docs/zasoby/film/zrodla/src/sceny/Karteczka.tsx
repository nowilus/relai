// The paper note pinned with tape (calibration round 2 of E1): dark Kalam on paper, legible on a
// phone. It lands from above, turning to its resting angle. The words are laid out by the browser.
import type { CSSProperties, ReactNode, Ref } from 'react';
import { FONT, NOTE } from '../tokeny';

interface KarteczkaProps {
  land: number, // 0..1 spring of the landing
  angle?: number, // resting angle in degrees
  size?: number, // the font size of the first line
  noteRef?: Ref<HTMLDivElement>,
  style?: CSSProperties,
  children: ReactNode,
}

export const Karteczka = ({ land, angle = -1.5, size = 46, noteRef, style, children }: KarteczkaProps) => (
  <div
    ref={noteRef}
    style={{
      position: 'absolute',
      whiteSpace: 'nowrap',
      padding: `${size * 0.5}px ${size * 0.7}px ${size * 0.42}px`,
      borderRadius: size * 0.3,
      background: NOTE.paper,
      border: `1px solid ${NOTE.edge}`,
      boxShadow: NOTE.shadow,
      fontFamily: FONT.handBold,
      fontWeight: 700,
      fontSize: size,
      lineHeight: 1.1,
      color: NOTE.accent,
      opacity: Math.min(1, Math.max(0, land) * 3),
      // settled: a plain 2D rotation, rasterized at the camera's scale (P-035)
      transform: `translateY(${(1 - land) * -60}px) rotate(${angle - 6.5 * (1 - land)}deg) scale(${1.1 - 0.1 * land})`,
      transformOrigin: '30% 0%',
      ...style,
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: -size * 0.28,
        left: '50%',
        width: size * 1.9,
        height: size * 0.55,
        marginLeft: -size * 0.95,
        background: NOTE.tape,
        border: `1px solid ${NOTE.tapeEdge}`,
        borderRadius: 2,
        transform: 'rotate(3deg)',
      }}
    />
    {children}
  </div>
);
