import { Composition } from 'remotion';
import { Pamiec } from './sceny/Pamiec';
import { Paski } from './sceny/Paski';
import { PaskiDalej } from './sceny/PaskiDalej';
import { Panel } from './sceny/Panel';
import { NowaSesja } from './sceny/NowaSesja';
import { PracaWraca } from './sceny/PracaWraca';
import { Final } from './sceny/Final';
import { Animatik } from './sceny/Animatik';
import { SCENY, dlugosc } from './scenariusz';
import type { IdSceny } from './scenariusz';
import { FILM } from './tokeny';

const klatki = (id: IdSceny) => Math.round((SCENY.find((s) => s.id === id)?.sekundy ?? 0) * FILM.fps);
const common = { width: FILM.width, height: FILM.height, fps: FILM.fps } as const;

export const Root = () => (
  <>
    {/* the scenes one by one, for stills while they are made; the film is Animatik */}
    <Composition id="Pamiec" component={Pamiec} {...common} durationInFrames={klatki('pamiec')} />
    <Composition id="Paski" component={Paski} {...common} durationInFrames={FILM.paskiFrames} />
    <Composition id="PaskiDalej" component={PaskiDalej} {...common} durationInFrames={klatki('paski') - FILM.paskiFrames} />
    <Composition id="Panel" component={Panel} {...common} durationInFrames={klatki('panel')} />
    <Composition id="NowaSesja" component={NowaSesja} {...common} durationInFrames={klatki('nowaSesja')} />
    <Composition id="PracaWraca" component={PracaWraca} {...common} durationInFrames={klatki('pracaWraca')} />
    <Composition id="Final" component={Final} {...common} durationInFrames={klatki('final')} />
    <Composition id="Animatik" component={Animatik} {...common} durationInFrames={dlugosc(FILM.fps)} />
  </>
);
