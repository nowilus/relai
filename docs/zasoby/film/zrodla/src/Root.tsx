import { Composition } from 'remotion';
import { Paski } from './sceny/Paski';
import { Animatik } from './sceny/Animatik';
import { dlugosc } from './scenariusz';
import { FILM } from './tokeny';

export const Root = () => (
  <>
    <Composition
      id="Paski"
      component={Paski}
      width={FILM.width}
      height={FILM.height}
      fps={FILM.fps}
      durationInFrames={FILM.paskiFrames}
    />
    <Composition
      id="Animatik"
      component={Animatik}
      width={FILM.width}
      height={FILM.height}
      fps={FILM.fps}
      durationInFrames={dlugosc(FILM.fps)}
    />
  </>
);
