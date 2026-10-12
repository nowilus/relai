# Joins the PNG frames of the README loop into one GIF with a single palette for the whole loop
# (the way docs/archiwum/demo/zrodla/gif.py did it for the 2.1.3 demo): a palette per frame would
# flicker. The palette comes from a mosaic of frames spread over the loop; no dithering, which
# would turn the desk's flat paper into noise and the file into megabytes. Opaque: no transparency.
#
# A GIF counts time in hundredths of a second: each frame's duration is rounded so that the frames
# start where they start in the loop, and the whole lasts exactly <total ms>.
#
# Usage: python gif.py <frames dir> <out.gif> <ms per frame> <total ms> <colours>
import sys
import os
import glob
from PIL import Image

src, out, ms, total, colours = sys.argv[1], sys.argv[2], float(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
files = sorted(glob.glob(os.path.join(src, '*.png')))
assert files, 'no frames in ' + src
frames = [Image.open(p).convert('RGB') for p in files]
w, h = frames[0].size

# the palette from twelve frames spread evenly over the loop
picks = [frames[round(i * (len(frames) - 1) / 11)] for i in range(12)]
mosaic = Image.new('RGB', (w, h * len(picks)))
for i, f in enumerate(picks):
    mosaic.paste(f, (0, h * i))
palette = mosaic.quantize(colors=colours, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)

q = [f.quantize(palette=palette, dither=Image.Dither.NONE) for f in frames]
cs = lambda t: round(t / 10) * 10
starts = [cs(i * ms) for i in range(len(q))] + [total]
durations = [b - a for a, b in zip(starts, starts[1:])]
assert all(d > 0 for d in durations) and sum(durations) == total, durations
q[0].save(out, save_all=True, append_images=q[1:], duration=durations, loop=0, optimize=True, disposal=1)
print(out, len(q), 'frames', w, 'x', h, round(os.path.getsize(out) / 1024 / 1024, 2), 'MB')
