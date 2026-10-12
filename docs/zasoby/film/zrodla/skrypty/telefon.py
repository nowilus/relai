# The phone check of the film's README loop (E6; plan FILM_PREZENTACYJNY, goal 2): the median glyph
# height of every line of text >= 7 px once a frame is scaled to 375 px wide — the threshold and the
# method of glify.py, the instrument of the 2.1.3 demo (docs/archiwum/demo/zrodla/glify.py), which
# this file runs first and then corrects in three places. Each correction answers a case the demo's
# material never had and the loop has; each was found on the loop (E6) by dumping the components of
# a line the original measured too low:
#
#  1. grey text on a dark window (the bars' muted words, lum ~140) is invisible to the original: for
#     the dark mask it merges with the window, the light mask starts at a fixed 200. Here the light
#     mask inside a dark panel starts KONTRAST above the panel's own background.
#  2. dark text on a light note lying on a dark window was thrown away as "a gap inside the panel",
#     because the note lies within the window's bounding box. Here a dark glyph inside a light panel
#     (a large light component, mostly filled: paper, not a ring) is text.
#  3. a "line" whose tallest glyph is <= NIE_TEKST px is not text: the desk's grain dots and the
#     progress bar's dashes form rows of 2 px marks. Such rows are listed as the sieve, not dropped
#     silently.
#
# Positive controls (--kontrola): a loop frame with light text on a dark window must give lines
# >= 7 px there; the same frame drawn at a third of its size must fail.
#
# Usage: python telefon.py <glify.py> <file.gif> [--kontrola <frame>]
import sys

import importlib.util
import numpy as np
from PIL import Image, ImageChops

spec = importlib.util.spec_from_file_location('glify', sys.argv[1])
g = importlib.util.module_from_spec(spec)
spec.loader.exec_module(g)  # glify.py sets stdout to UTF-8 itself

KONTRAST = 60     # correction 1: light ink starts this far above the panel's background
WYPELNIENIE = 0.6  # correction 2: a light panel is mostly filled (paper), a ring is not
NIE_TEKST = 3     # correction 3: a row whose tallest mark is this low is not text


def linie(klatka):
    im = klatka.convert('RGB')
    im = im.resize((g.SZER, round(im.height * g.SZER / im.width)), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)
    lum = 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
    ok = lambda s: g.MIN_H <= s[3] <= g.MAX_H and s[2] / s[3] <= g.MAX_PROP
    ciemne = g.skladowe(lum < g.TUSZ)
    panele = [(x, y, w, h) for (x, y, w, h) in ciemne if h > g.MAX_H or w > 100]
    # correction 2: the light panels (notes, cards of paper) and the dark glyphs that lie on them
    jasne = [s for s in g.skladowe(lum >= g.TUSZ) if s[3] > g.MAX_H or s[2] > 100]
    jasne = [s for s in jasne if (lum[s[1]:s[1] + s[3], s[0]:s[0] + s[2]] >= g.TUSZ).mean() >= WYPELNIENIE]
    w = lambda s, p: p[0] < s[0] and p[1] < s[1] and s[0] + s[2] < p[0] + p[2] and s[1] + s[3] < p[1] + p[3]
    glify = [s for s in ciemne if ok(s) and (not any(w(s, p) for p in panele) or any(w(s, p) for p in jasne))]
    # correction 1: light ink inside each dark panel, from the panel's own background up
    for (x, y, pw, ph) in panele:
        wyc = lum[y:y + ph, x:x + pw]
        tlo = float(np.median(wyc[wyc < g.TUSZ])) if (wyc < g.TUSZ).any() else 0.0
        for (gx, gy, gw, gh) in g.skladowe(wyc > tlo + KONTRAST):
            if gx == 0 or gy == 0 or gx + gw >= pw or gy + gh >= ph:
                continue
            s = (x + gx, y + gy, gw, gh)
            # ink of a light panel lying on the window is measured by the dark mask
            if ok(s) and not any(w(s, p) for p in jasne):
                glify.append(s)
    glify.sort(key=lambda s: s[1])
    grupy = []
    for q in glify:
        g1, g2 = q[1], q[1] + q[3] - 1
        for gr in grupy:
            if g1 <= gr[1] and g2 >= gr[0]:
                gr[0] = min(gr[0], g1); gr[1] = max(gr[1], g2); gr[2].append(q)
                break
        else:
            grupy.append([g1, g2, [q]])
    out, sito = [], []
    for _, _, gr in grupy:
        if len(gr) < g.MIN_GLIFOW:
            continue
        l = {'y': int(min(q[1] for q in gr)), 'n': len(gr), 'mediana': float(np.median([q[3] for q in gr])),
             'max': int(max(q[3] for q in gr))}
        (sito if l['max'] <= NIE_TEKST else out).append(l)
    return out, sito


def ustalone(im):
    """The frames that stand still: the same rule as glify.py main()."""
    n = getattr(im, 'n_frames', 1)
    wynik = []
    for i in range(n):
        im.seek(i)
        a = im.convert('RGB'); dur = im.info.get('duration', 100)
        stoi = False
        for j in (i - 1, i + 1):
            if 0 <= j < n:
                im.seek(j); b = im.convert('RGB'); im.seek(i)
                zm = sum(ImageChops.difference(a, b).convert('L').point(lambda v: 255 if v > 30 else 0).histogram()[255:])
                if zm <= 0.002 * a.width * a.height:
                    stoi = True
        if dur >= 300 or stoi:
            wynik.append(i)
    return wynik, n


def main():
    plik = sys.argv[2]
    im = Image.open(plik)
    if '--kontrola' in sys.argv:
        i = int(sys.argv[sys.argv.index('--kontrola') + 1])
        im.seek(i)
        fr = im.convert('RGB')
        duze, _ = linie(fr)
        male, _ = linie(fr.resize((fr.width // 3, fr.height // 3), Image.LANCZOS).resize(fr.size, Image.NEAREST))
        print(f'kontrola klatka {i}: oryginal glify.py {[round(l["mediana"], 1) for l in g.linie(fr)]}')
        print(f'  ten instrument: {[(l["y"], round(l["mediana"], 1)) for l in duze]}')
        print(f'  ta sama klatka w 1/3 wielkosci: minimum {min(l["mediana"] for l in male):.1f} px' if male else '  1/3: zero linii')
        return
    st, n = ustalone(im)
    wszystkie, odsiew = [], []
    for i in st:
        im.seek(i)
        out, sito = linie(im)
        for l in out:
            l['klatka'] = i; wszystkie.append(l)
        for l in sito:
            l['klatka'] = i; odsiew.append(l)
    print(f'{plik}: klatek {n}, ustalonych {len(st)}, linii tekstu {len(wszystkie)}, odsiew (nie tekst) {len(odsiew)}')
    if not wszystkie:
        print('  ZERO linii — defekt instrumentu albo materialu, nie wynik')
        sys.exit(2)
    med = sorted(l['mediana'] for l in wszystkie)
    print('  rozklad median [px]:', ' '.join(f'{m:.1f}' for m in med))
    print('  odsiew [klatka y n max]:', ' '.join(f'{l["klatka"]}:{l["y"]}:{l["n"]}:{l["max"]}' for l in odsiew))
    najm = min(wszystkie, key=lambda l: l['mediana'])
    print(f'  minimum {najm["mediana"]:.1f} px (klatka {najm["klatka"]}, y={najm["y"]}, glifow {najm["n"]})')
    okk = najm['mediana'] >= g.PROG
    print(f'  prog {g.PROG} px -> {"PRZESZEDL" if okk else "NIE PRZESZEDL"}')
    sys.exit(0 if okk else 1)


if __name__ == '__main__':
    main()
