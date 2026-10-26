// Scene 2 of the film, "Komendy" (plan FILM_PREZENTACYJNY, Annexes A and B): the sixteen commands (fourteen before PIPELINE_WYDAN E4)
// as props lying side by side on one long desk, in the order of a project's life (CYKL), right
// after "Pamięć" as the film's introduction. The camera pans along the desk and springs from prop
// to prop, one every 3.5 s — no cut, no flash. In each window
// the command's name comes up large at the top, the prop plays its little story and the slogan
// rises under it; the words stand still for over two seconds and leave before the camera moves
// on. Its own file name: Komendy.tsx is the panel's tab in panel/.
import type { ReactNode } from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import '../fonty'; // the words are drawn in the film's fonts, loaded before the first frame
import { camera } from '../kamera';
import { FILM } from '../tokeny';
import { CYKL, SEKUNDY_NA_KOMENDE } from '../komendy';
import type { IdKomendy } from '../komendy';
import { Biurko, ZIARNO } from './Biurko';
import { H, W } from './komendy/rysunek';
import { Nazwa, Slogan } from './komendy/Podpis';
import { Adopcja } from './komendy/Adopcja';
import { Optymalizator } from './komendy/Optymalizator';
import { Etap } from './komendy/Etap';
import { Zaloga } from './komendy/Zaloga';
import { Odnoga } from './komendy/Odnoga';
import { Przeglad } from './komendy/Przeglad';
import { Sprzatanie } from './komendy/Sprzatanie';
import { Kopia } from './komendy/Kopia';
import { ListaZmian } from './komendy/ListaZmian';
import { Aktualizacja } from './komendy/Aktualizacja';
import { Modele } from './komendy/Modele';
import { Sciaga } from './komendy/Sciaga';
import { Wycieczka } from './komendy/Wycieczka';
import { Pakiet } from './komendy/Pakiet';
import { Humanizacja } from './komendy/Humanizacja';
import { Bezpieczenstwo } from './komendy/Bezpieczenstwo';

/** Frames of one command's window: 3.5 s (Annex B; 2.5 s in Annex A was too fast). */
export const OKNO = Math.round(SEKUNDY_NA_KOMENDE * FILM.fps);
/**
 * The props' stories were timed on a 75-frame window (calibration, Annex A); in the longer window
 * they play this much slower, so the motion calms down with the words (round 1: "lekko za szybko").
 */
const TEMPO = 75 / OKNO;
/** The distance between two props on the desk: wide enough that a neighbour stays out of the still frame. */
const PITCH = 1560;
/** Frames the camera's spring takes to land; from here on it stands exactly still. */
export const LADUJE = 22;
/** The props are drawn in a W × H box and shown this much larger. */
const SKALA = 1.38;
const GAP = 22; // between the name, the prop and the slogan
/** The heights the words take, kept when they are absent so the prop never jumps. */
const NAZWA_H = 106;
const SLOGAN_H = 80;

/** The story of each command's prop, `t` frames into its window (negative before, past 75 after). */
const REKWIZYTY: Readonly<Record<IdKomendy, (p: { t: number }) => ReactNode>> = Object.freeze({
  'relai-adopt': Adopcja,
  'relai-prompt': Optymalizator,
  'relai-stage': Etap,
  'relai-crew': Zaloga,
  'relai-branch': Odnoga,
  'relai-humanize': Humanizacja,
  'relai-audit': Przeglad,
  'relai-clean': Sprzatanie,
  'relai-backup': Kopia,
  'relai-security': Bezpieczenstwo,
  'relai-changelog': ListaZmian,
  'relai-update': Aktualizacja,
  'relai-models': Modele,
  'relai-help': Sciaga,
  'relai-tour': Wycieczka,
  'relai-handover': Pakiet,
});

/** Where the camera stands at frame f: the index of the prop, fractional while it moves. */
export function polozenie(f: number, fps: number): number {
  const i = Math.min(CYKL.length - 1, Math.max(0, Math.floor(f / OKNO)));
  const t = f - i * OKNO;
  if (i === 0 || t >= LADUJE) return i;
  return i - 1 + spring({ frame: t, fps, config: { damping: 16, mass: 0.8, stiffness: 140 } });
}

export const ScenaKomend = ({ napisy = true }: { napisy?: boolean }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const at = polozenie(f, fps);
  const focus = { x: FILM.width / 2 + at * PITCH, y: FILM.height / 2 };
  return (
    <AbsoluteFill>
      <Biurko ziarno={false} />
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: camera(focus, { x: FILM.width / 2, y: FILM.height / 2 }, 1, 1) }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: FILM.width + CYKL.length * PITCH, height: FILM.height, ...ZIARNO }} />
        {CYKL.map((id, n) => {
          const t = f - n * OKNO;
          const Rekwizyt = REKWIZYTY[id];
          const ostatni = n === CYKL.length - 1;
          const widac = napisy && t >= 0 && (t < OKNO || ostatni);
          return (
            <div
              key={id}
              style={{ position: 'absolute', left: n * PITCH, top: 0, width: FILM.width, height: FILM.height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: GAP }}
            >
              <div style={{ height: NAZWA_H, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                {widac ? <Nazwa id={id} t={t} ostatni={ostatni} /> : null}
              </div>
              <div style={{ width: W * SKALA, height: H * SKALA, flexShrink: 0 }}>
                <div style={{ width: W, height: H, transform: `scale(${SKALA})`, transformOrigin: '0 0' }}><Rekwizyt t={t * TEMPO} /></div>
              </div>
              <div style={{ height: SLOGAN_H, flexShrink: 0 }}>
                {widac ? <Slogan id={id} t={t} ostatni={ostatni} /> : null}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
