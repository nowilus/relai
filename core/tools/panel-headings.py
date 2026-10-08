# RelAI core / tool: panel-headings — Kalam headings of the relai-panel pane as self-contained SVG.
#
# Called by core/tools/build-panel-headings.js; reads the heading list (JSON) on stdin and
# writes the drawn headings (JSON) on stdout. Each SVG embeds Kalam subset to the glyphs of its
# own text (a few KB, not the 46 KB of the whole face), and its viewBox comes from the font's
# advance widths, never from a guess about the width of a word (L-0137: text in SVG has no
# layout engine). Requires fontTools with brotli: pip install fonttools brotli.
import base64
import io
import json
import sys

from fontTools import subset
from fontTools.ttLib import TTFont

FONTS = sys.argv[1]  # core/templates/HTML_PLAN/fonty
PARTS = (('latin', ''), ('latin-ext', ';unicode-range:U+0100-024F'))


def faces(weight):
    return [TTFont(f"{FONTS}/kalam-{weight}-{part}.woff2") for part, _ in PARTS]


def advance(fonts, text):
    total = 0
    for ch in text:
        for f in fonts:
            g = f.getBestCmap().get(ord(ch))
            if g:
                total += f['hmtx'][g][0]
                break
        else:
            raise SystemExit(f"Kalam has no glyph for {ch!r} in {text!r}")
    return total / fonts[0]['head'].unitsPerEm


def subset_b64(path, chars):
    font = TTFont(path, recalcTimestamp=False)  # same input, same bytes: the copy check compares them
    opts = subset.Options()
    opts.flavor = 'woff2'
    sub = subset.Subsetter(opts)
    sub.populate(text=chars)
    sub.subset(font)
    buf = io.BytesIO()
    font.flavor = 'woff2'
    font.save(buf)
    return base64.b64encode(buf.getvalue()).decode()


def draw(item):
    text, size, color = item['text'], item['size'], item['color']
    weight = item.get('weight', 700)
    text_width = advance(faces(weight), text) * size
    pad = round(size * 0.25)
    width = round(text_width + 2 * pad + size * 0.15)  # the slack covers kerning the sum ignores
    swash = item.get('swash')
    height = round(size * 1.45) + (8 if swash else 0)
    base = round(size * 1.08)
    css = ''
    for part, rng in PARTS:
        chars = ''.join(sorted(c for c in set(text) if (ord(c) >= 0x100) == (part == 'latin-ext') and c != ' '))
        if chars:
            data = subset_b64(f"{FONTS}/kalam-{weight}-{part}.woff2", chars)
            css += (f"@font-face{{font-family:K;font-weight:{weight};"
                    f"src:url(data:font/woff2;base64,{data}) format('woff2'){rng}}}")
    deco = ''
    if swash:
        y = base + round(size * 0.22)
        deco = (f'<path d="M{pad} {y} C {width * 0.3:.0f} {y + 5}, {width * 0.6:.0f} {y - 3}, {width - pad} {y + 2}" '
                f'fill="none" stroke="{swash}" stroke-width="{max(2, size / 9):.1f}" stroke-linecap="round"/>')
    safe = text.replace('&', '&amp;').replace('<', '&lt;')
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">'
           f'<style>{css}</style>{deco}<text x="{pad}" y="{base}" font-family="K" font-weight="{weight}" '
           f'font-size="{size}" fill="{color}">{safe}</text></svg>')
    return {'key': item['key'], 'text': text, 'width': width, 'height': height,
            'textWidth': round(text_width), 'x': pad, 'svg': svg}


def numerals(item):
    # Kalam cut to the characters of figures drawn at run time (the cost report, E3): the font
    # once, and each character's advance in em, so the panel sums a figure's width exactly.
    chars, weight = item['glyphs'], item.get('weight', 700)
    fonts = faces(weight)
    adv = {ch: round(advance(fonts, ch), 4) for ch in chars}
    return {'key': item['key'], 'weight': weight, 'advances': adv,
            'font': subset_b64(f"{FONTS}/kalam-{weight}-latin.woff2", ''.join(c for c in chars if c != ' '))}


json.dump([numerals(i) if 'glyphs' in i else draw(i) for i in json.load(sys.stdin)], sys.stdout, ensure_ascii=False)
