# Sklada klatki PNG w GIF z jedna paleta dla calego materialu (Pillow, bez ffmpeg).
# Uzycie: python gif.py <pl|en> <plik.gif>
import sys, glob, os
from PIL import Image

jezyk, wyjscie = sys.argv[1], sys.argv[2]
OUT = os.environ.get('RELAI_DEMO_OUT') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '.claude', 'relai', 'work', 'demo')
pliki = sorted(glob.glob(os.path.join(OUT, 'klatki', jezyk, '*.png')))
assert pliki, 'brak klatek w ' + OUT
klatki = [Image.open(p).convert('RGB') for p in pliki]

# Paleta z mozaiki klatek ze stanow ustalonych kazdej sceny — jedna dla calosci, bez migotania.
probki = [klatki[i] for i in (16, 60, 92, 122, 160, 190, 230, 245) if i < len(klatki)]
mozaika = Image.new('RGB', (720, 900 * len(probki)))
for i, k in enumerate(probki):
    mozaika.paste(k, (0, 900 * i))
paleta = mozaika.quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)

q = [k.quantize(palette=paleta, dither=Image.Dither.NONE) for k in klatki]
q[0].save(wyjscie, save_all=True, append_images=q[1:], duration=100, loop=0, optimize=True, disposal=1)
print(wyjscie, len(q), 'klatek', round(os.path.getsize(wyjscie) / 1024 / 1024, 2), 'MB')
