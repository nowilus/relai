import { Composition } from 'remotion';
import { Paski } from './sceny/Paski';
import { FILM } from './tokeny';

export const Root = () => (
  <Composition
    id="Paski"
    component={Paski}
    width={FILM.width}
    height={FILM.height}
    fps={FILM.fps}
    durationInFrames={FILM.paskiFrames}
  />
);
