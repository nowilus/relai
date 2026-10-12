import { Composition } from 'remotion';
import { Pamiec } from './sceny/Pamiec';
import { Paski } from './sceny/Paski';
import { PaskiDalej } from './sceny/PaskiDalej';
import { Panel } from './sceny/Panel';
import { ScenaKomend } from './sceny/ScenaKomend';
import { NowaSesja } from './sceny/NowaSesja';
import { PracaWraca } from './sceny/PracaWraca';
import { Final } from './sceny/Final';
import { Animatik } from './sceny/Animatik';
import { PETLA, PetlaReadme } from './sceny/PetlaReadme';
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
    <Composition id="Komendy" component={ScenaKomend} {...common} durationInFrames={klatki('komendy')} defaultProps={{ napisy: true }} />
    <Composition id="NowaSesja" component={NowaSesja} {...common} durationInFrames={klatki('nowaSesja')} />
    <Composition id="PracaWraca" component={PracaWraca} {...common} durationInFrames={klatki('pracaWraca')} />
    <Composition id="Final" component={Final} {...common} durationInFrames={klatki('final')} />
    <Composition id="Animatik" component={Animatik} {...common} durationInFrames={dlugosc(FILM.fps)} />
    {/* the English film (E6): the same scenes, the dictionary EN */}
    <Composition id="FilmEN" component={Animatik} {...common} durationInFrames={dlugosc(FILM.fps)} defaultProps={{ jezyk: 'en' as const }} />
    {/* the README loop (E6): 720×900, 25 s, Polish and English */}
    <Composition id="PetlaPL" component={PetlaReadme} width={PETLA.width} height={PETLA.height} fps={PETLA.fps} durationInFrames={PETLA.frames} defaultProps={{ jezyk: 'pl' as const }} />
    <Composition id="PetlaEN" component={PetlaReadme} width={PETLA.width} height={PETLA.height} fps={PETLA.fps} durationInFrames={PETLA.frames} defaultProps={{ jezyk: 'en' as const }} />
  </>
);
