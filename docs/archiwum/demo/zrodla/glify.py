# Kryterium demo w warunkach odbiorcy (S04, zasada 15): wysokosc glifow przy 375 px szerokosci.
#
# PROG USTALONY PRZED RENDEREM (2026-09-24): mediana wysokosci glifow w kazdej linii tekstu
# >= 7 px po przeskalowaniu klatki do 375 px szerokosci. 7 px mediany to mniej wiecej tekst
# 13-14 px CSS na telefonie — dolna granica czytania bez powiekszania. Liczby z pomiaru E2
# planu PIERWSI_UZYTKOWNICY (3,52-7,42 px) pochodza z innego, niezachowanego instrumentu
# i nie sa wprost porownywalne; porownanie robi TEN instrument na obu materialach.
#
# Metoda: klatka -> 375 px szerokosci (LANCZOS) -> maska tuszu (luminancja < 185) ->
# skladowe spojne (8-sasiedztwo) -> filtr odsiewu podany jawnie -> grupowanie w linie
# po srodku pionowym -> mediana wysokosci skladowych w linii. Wypisuje CALY zbior linii.
#
# Uzycie: python glify.py <plik.gif> [co_ktora_klatka]
import sys, io
from PIL import Image, ImageChops
import numpy as np
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

SZER = 375
TUSZ = 185
JASNY = 200
PROG = 7.0
# Filtr odsiewu (jawny): skladowa o wysokosci < 2 px (kropki, szum), o proporcji szer/wys > 6
# (kreski, fale tla, podkreslenia) albo wysokosci > 60 px (plamy, ramki) nie jest glifem.
# Linia musi miec >= 4 glify — pojedyncze znaki (ikonki, kropki statusu) nie sa tekstem.
MIN_H, MAX_H, MAX_PROP, MIN_GLIFOW = 2, 60, 6.0, 4


def skladowe(maska):
    h, w = maska.shape
    lab = np.zeros((h, w), dtype=np.int32)
    wyn, n = [], 0
    ys, xs = np.nonzero(maska)
    for y0, x0 in zip(ys, xs):
        if lab[y0, x0]:
            continue
        n += 1
        stos = [(y0, x0)]
        lab[y0, x0] = n
        y1 = y2 = y0; x1 = x2 = x0
        while stos:
            y, x = stos.pop()
            y1 = min(y1, y); y2 = max(y2, y); x1 = min(x1, x); x2 = max(x2, x)
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < h and 0 <= xx < w and maska[yy, xx] and not lab[yy, xx]:
                        lab[yy, xx] = n
                        stos.append((yy, xx))
        wyn.append((x1, y1, x2 - x1 + 1, y2 - y1 + 1))
    return wyn


def linie(klatka):
    im = klatka.convert('RGB')
    im = im.resize((SZER, round(im.height * SZER / im.width)), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)
    lum = 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
    ok = lambda s: MIN_H <= s[3] <= MAX_H and s[2] / s[3] <= MAX_PROP
    ciemne = skladowe(lum < TUSZ)
    glify = [s for s in ciemne if ok(s)]
    # Tekst JASNY na ciemnym panelu (dymek): osobna maska w obrysie kazdego duzego ciemnego
    # panelu. Bez tego szczeliny miedzy jasnymi literami wchodzily jako "glify" 2-6 px
    # (zmierzone na pierwszym renderze E5 — agregat bral elementy innej klasy, zasada 5).
    # Skladowa dotykajaca krawedzi obrysu (jasne rogi poza zaokragleniem) nie jest glifem.
    for (x, y, w, h) in ciemne:
        if h <= MAX_H and w <= 100:
            continue
        wyc = lum[y:y + h, x:x + w] > JASNY
        for (gx, gy, gw, gh) in skladowe(wyc):
            if gx == 0 or gy == 0 or gx + gw >= w or gy + gh >= h:
                continue
            s = (x + gx, y + gy, gw, gh)
            if ok(s):
                glify.append(s)
    # Glify ciemne lezace WEWNATRZ panelu to szczeliny, nie tekst — odrzucone.
    panele = [(x, y, w, h) for (x, y, w, h) in ciemne if h > MAX_H or w > 100]
    def w_panelu(s):
        return any(px < s[0] and py < s[1] and s[0] + s[2] < px + pw and s[1] + s[3] < py + ph
                   for (px, py, pw, ph) in panele)
    glify = [s for s in glify if not (s in ciemne and w_panelu(s))]
    # Grupowanie po NAKLADANIU zakresow pionowych, nie po srodku: kropka nad "j" i ogonek
    # maja srodek daleko od srodka linii, a po grupowaniu srodkami tworzyly wlasne "linie"
    # 2 px (zmierzone na starym materiale — agregat bral elementy innej klasy, zasada 5).
    glify.sort(key=lambda s: s[1])
    grupy = []  # [y_gora, y_dol, [glify]]
    for g in glify:
        g1, g2 = g[1], g[1] + g[3] - 1
        for gr in grupy:
            if g1 <= gr[1] and g2 >= gr[0]:
                gr[0] = min(gr[0], g1); gr[1] = max(gr[1], g2); gr[2].append(g)
                break
        else:
            grupy.append([g1, g2, [g]])
    grupy = [gr[2] for gr in grupy]
    out = []
    for gr in grupy:
        if len(gr) < MIN_GLIFOW:
            continue
        out.append({'y': int(min(q[1] for q in gr)), 'n': len(gr),
                    'mediana': float(np.median([q[3] for q in gr]))})
    return out


def main():
    plik = sys.argv[1]
    krok = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    im = Image.open(plik)
    n = getattr(im, 'n_frames', 1)
    # Mierzone sa KLATKI USTALONE — takie, ktore stoja na ekranie: czas >= 300 ms (GIF
    # z polaczonymi duplikatami) albo identyczne z nastepna (GIF bez laczenia). Klatka
    # przejscia trwa 100 ms i niesie tekst w polowie przenikania; kryterium dotyczy czytania.
    wszystkie, ustalone = [], []
    for i in range(n):
        im.seek(i)
        a = im.convert('RGB'); dur = im.info.get('duration', 100)
        # Rowna z sasiadem = prawie zero zmienionych pikseli (stary material ma dryf plam tla,
        # wiec rownosc co do piksela nie zachodzi nigdy). Ostatnia klatka nie jest ustalona
        # z urzedu — konczy material w polowie wygaszania.
        stoi = False
        for j in (i - 1, i + 1):
            if 0 <= j < n:
                im.seek(j); b = im.convert('RGB'); im.seek(i)
                zm = sum(ImageChops.difference(a, b).convert('L').point(lambda v: 255 if v > 30 else 0).histogram()[255:])
                if zm <= 0.002 * a.width * a.height:
                    stoi = True
        if dur >= 300 or stoi:
            ustalone.append(i)
    for i in ustalone[::krok]:
        im.seek(i)
        for l in linie(im):
            l['klatka'] = i
            wszystkie.append(l)
    print(f'  klatek ustalonych {len(ustalone)} z {n}, mierzona co {krok}.')
    if not wszystkie:
        print(plik, ': ZERO linii — defekt instrumentu albo materialu, nie wynik')
        sys.exit(2)
    med = sorted(l['mediana'] for l in wszystkie)
    najm = min(wszystkie, key=lambda l: l['mediana'])
    print(f'{plik}: klatek {n}, linii {len(wszystkie)}')
    print('  rozklad median [px]:', ' '.join(f'{m:.1f}' for m in med))
    print(f'  minimum {najm["mediana"]:.1f} px (klatka {najm["klatka"]}, y={najm["y"]}, glifow {najm["n"]})')
    ok = najm['mediana'] >= PROG
    print(f'  prog {PROG} px -> {"PRZESZEDL" if ok else "NIE PRZESZEDL"}')
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
