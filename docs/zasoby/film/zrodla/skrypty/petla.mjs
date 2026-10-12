// The README loop as a GIF (E6): renders every n-th frame of PetlaPL / PetlaEN to PNG and joins
// them with one palette for the whole loop (skrypty/gif.py, Pillow) — Remotion's own GIF codec
// gave 6.7 MB for the Polish loop, over the plan's 3 MB budget (SZACUNEK). A GIF has no sound.
//
//   node skrypty/petla.mjs <pl|en> [--co=4] [--kolory=128]   (every 4th frame: 7.5 frames/s)
// writes ../relai-petla-25s-<pl|en>.gif (docs/zasoby/film/), the frames go to a temporary folder.
import { bundle } from '@remotion/bundler';
import { renderFrames, selectComposition } from '@remotion/renderer';
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const jezyk = args[0];
if (jezyk !== 'pl' && jezyk !== 'en') {
  console.error('usage: node skrypty/petla.mjs <pl|en> [--co=4] [--kolory=128]');
  process.exit(2);
}
const opt = (k, d) => {
  const a = args.find((x) => x.startsWith(`--${k}=`));
  return a ? Number(a.split('=')[1]) : d;
};
const co = opt('co', 4);
const kolory = opt('kolory', 128);
const id = jezyk === 'pl' ? 'PetlaPL' : 'PetlaEN';
const wynik = join(HERE, '..', '..', `relai-petla-25s-${jezyk}.gif`);

const serveUrl = await bundle({ entryPoint: join(HERE, '..', 'src', 'index.ts') });
const composition = await selectComposition({ serveUrl, id, inputProps: {} });
const out = mkdtempSync(join(tmpdir(), 'relai-film-petla-'));
try {
  await renderFrames({
    composition,
    serveUrl,
    inputProps: {},
    outputDir: out,
    imageFormat: 'png',
    everyNthFrame: co,
    onStart: () => undefined,
    onFrameUpdate: () => undefined,
  });
  const ms = (1000 * co) / composition.fps;
  const total = Math.round((1000 * composition.durationInFrames) / composition.fps);
  execFileSync('python', [join(HERE, 'gif.py'), out, wynik, String(ms), String(total), String(kolory)], { stdio: 'inherit' });
} finally {
  rmSync(out, { recursive: true, force: true });
}
console.log(`${wynik}: ${(statSync(wynik).size / 1024 / 1024).toFixed(2)} MB`);
