// The animatic of the whole film (plan FILM_PREZENTACYJNY, E2): the six scenes of scenariusz.ts in
// their order and length — scenes 1–3 built in full since E3 ("Pamiec", "Paski" + "PaskiDalej",
// "Panel"), scenes 4–6 since E4 ("NowaSesja", "PracaWraca", "Final"); the composition keeps its
// name. Each scene comes in over the end of the one before it, by a crossfade or a reveal from the
// left, so the film's length stays the sum of its scenes.
// Opacity and clip only: no flash, no jump of brightness (case b7 of the plan).
import type { ReactNode } from 'react';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { FILM } from '../tokeny';
import { odcinki } from '../scenariusz';
import type { IdSceny, Odcinek } from '../scenariusz';
import { Paski } from './Paski';
import { PaskiDalej } from './PaskiDalej';
import { Pamiec } from './Pamiec';
import { Panel } from './Panel';
import { NowaSesja } from './NowaSesja';
import { PracaWraca } from './PracaWraca';
import { Final } from './Final';
import { Biurko } from './Biurko';

const OVERLAP = 18; // frames a scene comes in over the one before it
type Wejscie = 'przenikanie' | 'odslona';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const smooth = (t: number) => t * t * (3 - 2 * t);
const HALF = OVERLAP / 2;

/**
 * A scene's way in and out. A reveal wipes the new scene over the old one. A crossfade goes through
 * the desk: the old scene fades to paper over the first half of the overlap (`wyjscie`: the frame
 * of the scene where its successor starts, when the successor comes by crossfade), the new one
 * rises from it over the second — two pictures are never on top of each other.
 */
const Wejdz = ({ jak, wyjscie = null, children }: { jak: Wejscie | null, wyjscie?: number | null, children: ReactNode }) => {
  const frame = useCurrentFrame();
  const k = jak === null ? 1 : jak === 'przenikanie'
    ? interpolate(frame, [HALF, OVERLAP], [0, 1], { ...clamp, easing: smooth })
    : interpolate(frame, [0, OVERLAP], [0, 1], { ...clamp, easing: smooth });
  const out = wyjscie === null ? 0 : interpolate(frame, [wyjscie, wyjscie + HALF], [0, 1], { ...clamp, easing: smooth });
  const done = k >= 1;
  const opacity = (jak === 'przenikanie' && !done ? k : 1) * (1 - out);
  return (
    <AbsoluteFill
      style={{
        opacity: opacity < 1 ? opacity : undefined,
        clipPath: jak === 'odslona' && !done ? `inset(0 ${(1 - k) * 100}% 0 0)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** What a scene shows: each of the six is built in full (scenes 1–3 in E3, 4–6 in E4). */
function scena(id: IdSceny): ReactNode {
  switch (id) {
    // the boards of the animatic are gone: scenes 1–3 since E3, 4–6 since E4
    case 'pamiec':
      return <Pamiec />;
    case 'paski':
      return <PaskiDalej />;
    case 'panel':
      return <Panel />;
    case 'nowaSesja':
      return <NowaSesja />;
    case 'pracaWraca':
      return <PracaWraca />;
    case 'final':
      return <Final />;
  }
}

/** How scene `i` comes in: the first cuts in, then crossfade and reveal by turns. */
const wejscie = (i: number): Wejscie | null => (i === 0 ? null : i % 2 === 1 ? 'przenikanie' : 'odslona');

/**
 * Scene 2: the bars of E1 for their ten seconds, then "PaskiDalej" for the rest of the scene. The
 * second starts on the very shot the first ends on, so they meet by a plain cut: no overlap.
 */
function scenaPaskow(o: Odcinek, jak: Wejscie | null, dalej: Wejscie | null): ReactNode {
  const gotowe = Math.min(FILM.paskiFrames, o.klatki);
  const reszta = o.klatki - gotowe;
  const ostatnia = dalej === null;
  return (
    <>
      <Sequence from={o.od} durationInFrames={gotowe + (reszta > 0 || ostatnia ? 0 : OVERLAP)} name="paski (E1)">
        <Wejdz jak={jak} wyjscie={reszta === 0 && dalej === 'przenikanie' ? gotowe : null}><Paski /></Wejdz>
      </Sequence>
      {reszta > 0 ? (
        <Sequence from={o.od + gotowe} durationInFrames={reszta + (ostatnia ? 0 : OVERLAP)} name="paski (dalej)">
          <Wejdz jak={null} wyjscie={dalej === 'przenikanie' ? reszta : null}>{scena('paski')}</Wejdz>
        </Sequence>
      ) : null}
    </>
  );
}

export const Animatik = () => {
  const lista = odcinki(FILM.fps);
  return (
    <AbsoluteFill>
      {/* the paper under every scene: a crossfade goes through it, never through black */}
      <Biurko />
      {lista.map((o, i) => {
        const jak = wejscie(i);
        const dalej = i === lista.length - 1 ? null : wejscie(i + 1);
        if (o.scena.id === 'paski') return <AbsoluteFill key={o.scena.id}>{scenaPaskow(o, jak, dalej)}</AbsoluteFill>;
        return (
          <Sequence key={o.scena.id} from={o.od} durationInFrames={o.klatki + (dalej === null ? 0 : OVERLAP)} name={o.scena.tytul}>
            <Wejdz jak={jak} wyjscie={dalej === 'przenikanie' ? o.klatki : null}>{scena(o.scena.id)}</Wejdz>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
