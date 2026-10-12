// The app window lying on the desk, as scene 2 draws it: the desktop's dark surface, a soft edge,
// the desk's shadow. It comes in tilted in 3D and lands flat; once landed it carries no transform
// at all (P-035: a 3D layer is rasterized at scale 1 and the camera would enlarge that picture).
import type { CSSProperties, ReactNode, Ref } from 'react';
import { DESK, WINDOW } from '../tokeny';

interface OknoProps {
  left: number,
  top: number,
  width: number,
  height?: number,
  padding?: number | string,
  entry: number, // 0..1 spring of the entry; 1 = landed
  style?: CSSProperties,
  boxRef?: Ref<HTMLDivElement>,
  children: ReactNode,
}

export const Okno = ({ left, top, width, height, padding = 30, entry, style, boxRef, children }: OknoProps) => {
  const landed = Math.abs(1 - entry) < 0.001;
  return (
    <div
      ref={boxRef}
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        padding,
        borderRadius: WINDOW.radius,
        background: WINDOW.surface,
        border: `1px solid ${WINDOW.edge}`,
        boxShadow: DESK.shadow,
        opacity: Math.min(1, entry * 1.5),
        transform: landed ? 'none' : `perspective(1800px) translateY(${(1 - entry) * 150}px) rotateX(${(1 - entry) * 24}deg) scale(${0.94 + 0.06 * entry})`,
        transformOrigin: '50% 100%',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** The prompt field under a conversation: an empty field with the caret, as scene 2 has it. */
export const Prompt = ({ style }: { style?: CSSProperties }) => (
  <div
    style={{
      height: 74,
      borderRadius: 20,
      background: WINDOW.promptBg,
      border: `1px solid ${WINDOW.promptEdge}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 28px',
      ...style,
    }}
  >
    <div style={{ width: 2.5, height: 34, borderRadius: 2, background: WINDOW.caret }} />
  </div>
);
