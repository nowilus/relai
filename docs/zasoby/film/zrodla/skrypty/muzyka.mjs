// RelAI film: writes the film's music to public/muzyka/relai.wav (plan FILM_PREZENTACYJNY, Annex
// C). The track is "daylight hour" by snoozy beats, CC BY 4.0, chosen by Łukasz and kept in
// docs/zasoby/film/muzyka/ with its source and credit (ZRODLO.md). The track is 107 s, the film
// longer: it plays from its start to the start of its fade (CUT_OUT), then goes on — at the same
// place in the bar — from the start of its beat section (CUT_IN), and fades out over the film's
// last seconds. The two cut points were measured on the track (onset analysis, 91.6 BPM: both on
// the beat that opens a section). Decoding goes through Remotion's own ffmpeg; the rest is plain
// sample arithmetic, so the same track gives the same bytes. The file lives outside git.

import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dlugosc } from '../src/scenariusz.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
export const SOURCE = resolve(HERE, '../../muzyka/daylight-hour.mp3');
export const SOURCE_SHA256 = '6b56533f810958b52e58466584e5d80b8c645d15f5358c140cb305067c3ac412';
export const OUT = resolve(HERE, '../public/muzyka/relai.wav');
export const RATE = 44100;
const FPS = 30;

/** Where the first pass of the track ends and where the second begins, in seconds of the track. */
export const CUT_OUT = 93.738;
export const CUT_IN = 9.895;
const CROSS = 0.04; // seconds of equal-power crossfade at the cut
const FADE_OUT = 4; // seconds at the film's end
const FADE_IN = 0.2;
export const GAIN = 0.42; // the track is mastered loud (about -10 dBFS RMS); 0.6 lowered by 30 % (Łukasz, round 3)

/** The track decoded to 16-bit stereo PCM at RATE, as two channels of floats. */
export function decode(source = SOURCE) {
  const sha = createHash('sha256').update(readFileSync(source)).digest('hex');
  if (sha !== SOURCE_SHA256) throw new Error(`the film's track differs from the one in ZRODLO.md: ${sha}`);
  const tmp = resolve(dirname(OUT), 'zrodlo.wav');
  mkdirSync(dirname(OUT), { recursive: true });
  // one command line through the shell (npx is a .cmd on Windows); both paths are the project's own
  const q = (p) => JSON.stringify(p);
  execSync(`npx remotion ffmpeg -v error -y -i ${q(source)} -ar ${RATE} -ac 2 -c:a pcm_s16le -fflags +bitexact -map_metadata -1 ${q(tmp)}`, { cwd: resolve(HERE, '..'), stdio: 'pipe' });
  const buf = readFileSync(tmp);
  rmSync(tmp);
  const at = buf.indexOf('data') + 8;
  const size = buf.readUInt32LE(at - 4);
  const n = Math.floor(size / 4);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    L[i] = buf.readInt16LE(at + i * 4) / 32768;
    R[i] = buf.readInt16LE(at + i * 4 + 2) / 32768;
  }
  return { L, R };
}

/** The film's music: the track cut to the film's length, levelled and faded. */
export function muzyka(track, sekundy = dlugosc(FPS) / FPS) {
  const total = Math.round(sekundy * RATE);
  const out = Math.round(CUT_OUT * RATE);
  const into = Math.round(CUT_IN * RATE);
  const cross = Math.round(CROSS * RATE);
  if (into + (total - out) > track.L.length) throw new Error('the film is longer than the track can cover with one cut');
  const L = new Float32Array(total);
  const R = new Float32Array(total);
  for (let i = 0; i < total; i++) {
    // before the cut the first pass, after it the second; around it an equal-power crossfade
    const k = Math.min(1, Math.max(0, (i - (out - cross)) / cross));
    const a = Math.cos((k * Math.PI) / 2);
    const b = Math.sin((k * Math.PI) / 2);
    const j = into + (i - out);
    const l = (k < 1 ? a * (track.L[i] ?? 0) : 0) + (k > 0 ? b * (track.L[j] ?? 0) : 0);
    const r = (k < 1 ? a * (track.R[i] ?? 0) : 0) + (k > 0 ? b * (track.R[j] ?? 0) : 0);
    const t = i / RATE;
    const fade = Math.min(1, t / FADE_IN) * Math.min(1, Math.max(0, (sekundy - t) / FADE_OUT));
    const g = GAIN * Math.sin((fade * Math.PI) / 2);
    L[i] = l * g;
    R[i] = r * g;
  }
  return { L, R };
}

/** A 16-bit stereo PCM WAV file of the two channels. */
export function wav({ L, R }) {
  const n = L.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0, 'ascii');
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write('WAVEfmt ', 8, 'ascii');
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(RATE, 24);
  buf.writeUInt32LE(RATE * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36, 'ascii');
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] ?? 0)) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] ?? 0)) * 32767), 46 + i * 4);
  }
  return buf;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const m = muzyka(decode());
  writeFileSync(OUT, wav(m));
  process.stdout.write(`muzyka: ${(m.L.length / RATE).toFixed(3)} s, cięcie ${CUT_OUT} s -> ${CUT_IN} s, "daylight hour" (snoozy beats, CC BY 4.0)\n`);
}
