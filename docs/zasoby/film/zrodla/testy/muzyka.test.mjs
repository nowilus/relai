// The film's music (plan FILM_PREZENTACYJNY, Annex C) is "daylight hour" by snoozy beats, CC BY 4.0,
// cut to the film by skrypty/muzyka.mjs. These checks hold it to the film and to its source: the
// file in the repository is the one ZRODLO.md names, its credit is written where the licence asks
// for it, the music is as long as the film to the sample, and the same track gives the same bytes.
// Run after `npm run przygotuj` (the WAV is outside git).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { CUT_IN, CUT_OUT, OUT, RATE, SOURCE, SOURCE_SHA256, decode, muzyka, wav } from '../skrypty/muzyka.mjs';
import { SCENY, dlugosc } from '../src/scenariusz.ts';
import { REPO } from '../skrypty/dane.mjs';

const FPS = 30;
const sha = (b) => createHash('sha256').update(b).digest('hex');
const CREDIT = '🎵(free) lofi type beat "daylight hour" by snoozy beats';

/** The sample rate, channels and length in frames of a WAV file's header. */
function header(buf) {
  assert.equal(buf.toString('ascii', 0, 4), 'RIFF');
  assert.equal(buf.toString('ascii', 36, 40), 'data');
  return { rate: buf.readUInt32LE(24), channels: buf.readUInt16LE(22), frames: buf.readUInt32LE(40) / 4 };
}

test('the track is the one ZRODLO.md names, and its CC BY credit is written in ZRODLO.md and the film\'s README', () => {
  const zrodlo = readFileSync(join(REPO, 'docs/zasoby/film/muzyka/ZRODLO.md'), 'utf8');
  assert.equal(sha(readFileSync(SOURCE)), SOURCE_SHA256);
  assert.ok(zrodlo.includes(SOURCE_SHA256), 'ZRODLO.md carries the sha256');
  assert.ok(zrodlo.includes('CC BY 4.0'), 'ZRODLO.md names the licence');
  for (const f of ['docs/zasoby/film/muzyka/ZRODLO.md', 'docs/zasoby/film/README.md']) {
    assert.ok(readFileSync(join(REPO, f), 'utf8').includes(CREDIT), `${f} carries the credit word for word`);
  }
  // positive control: a credit with another title is not found
  assert.ok(!zrodlo.includes(CREDIT.replace('daylight hour', 'night hour')));
});

test('the music is as long as the film, to the sample, and its cut stays inside the track', (t) => {
  const sekundy = dlugosc(FPS) / FPS;
  const h = header(readFileSync(OUT));
  assert.deepEqual(h, { rate: RATE, channels: 2, frames: Math.round(sekundy * RATE) });
  assert.ok(CUT_IN < CUT_OUT && CUT_IN + (sekundy - CUT_OUT) < 107, 'the second pass ends before the track does');
  t.diagnostic(`music: ${sekundy} s, cut ${CUT_OUT} s -> ${CUT_IN} s, ${h.frames} frames`);
  // positive control: a film a second longer asks for another length
  const longer = SCENY.map((s, i) => (i === 0 ? { ...s, sekundy: s.sekundy + 1 } : s));
  assert.notEqual(Math.round((dlugosc(FPS, longer) / FPS) * RATE), h.frames);
});

test('the file on disk is what the script writes now from the track: the same bytes', () => {
  assert.equal(sha(wav(muzyka(decode()))), sha(readFileSync(OUT)));
});
