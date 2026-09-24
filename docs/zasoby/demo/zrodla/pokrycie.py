# Pokrycie klatek: kazdy cytat z pliku albo odpowiedzi agenta w scenach PL musi wystapic
# w zapisie realnego przebiegu (docs/archiwum/plany/PIERWSI_UZYTKOWNICY/zapis/ + tabela
# promptow w DEMO.md). Normalizacja zdejmuje ozdoby markdown (`, **) i biale znaki.
# Kontrola pozytywna: cytat podlozony, ktorego w zapisie nie ma, MUSI wypasc.
# Napisy angielskie sa tlumaczeniem tych samych zdan — nie sa sprawdzane instrumentem.
import json, re, glob, os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
TU = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(TU, *(['..'] * 4)))
OUT = os.environ.get('RELAI_DEMO_OUT') or os.path.join(ROOT, '.claude', 'relai', 'work', 'demo')
ARCH = os.path.join(ROOT, 'docs', 'archiwum', 'plany', 'PIERWSI_UZYTKOWNICY')

def norm(s):
    s = s.replace('`', '').replace('**', '').replace(' ', ' ')
    return re.sub(r'\s+', ' ', s).strip()

# Z DEMO.md bierzemy WYLACZNIE sekcje b) — tabele promptow wklejonych doslownie. Reszta
# pliku opisuje stary instrument i niesie jego podlozony cytat, ktory przewracal kontrole.
demo = open(os.path.join(ARCH, 'DEMO.md'), encoding='utf-8').read()
demo_b = demo[demo.index('## b)'):demo.index('## c)')]
zapis = norm('\n'.join(open(p, encoding='utf-8').read()
                       for p in glob.glob(os.path.join(ARCH, 'zapis', '*'))) + '\n' + demo_b)

t = json.load(open(os.path.join(OUT, 'tresc.json'), encoding='utf-8'))['pl']
s = t['sceny']
CYTATY = [  # (element na klatce, scena)
    (s['promptPlan'], 'plan'),
    *[(e, 'plan') for e in t['etapy']],
    (s['gotowy'], 'plan'),
    # Sciezka na klatce jest zlozona z dwoch czlonow jednego zdania zapisu 02-plan.txt:
    # „docs/plany/PLATNOSCI/PLAN.md + STATUS.md" — kazdy czlon sprawdzany osobno.
    ('docs/plany/PLATNOSCI/', 'plan'),
    ('STATUS.md', 'plan'),
    (s['kontynuujemy'], 'sesja'),
    (s['gdzieJestesmy'], 'sesja'),
    (s['propozycja'], 'sesja'),
    ('/relai-stage', 'karta'),
    (s['etapZ'], 'karta'),
    (s['weryfikacja'], 'karta'),
    ('PROMPT_ETAP_1.md', 'karta'),
    (s['zaczynamy'], 'karta'),
]
PODLOZONY = ('Etap E3 „Webhook i potwierdzanie zapłaty" jest GOTOWY DO STARTU', 'kontrola')

bez = 0
for c, sc in CYTATY + [PODLOZONY]:
    ok = norm(c) in zapis
    if not ok and (c, sc) != PODLOZONY:
        bez += 1
    print(f'{"POKRYTY    " if ok else "BEZ POKRYCIA"} | {sc:8} | {c}')
print(f'WYNIK: {len(CYTATY) - bez}/{len(CYTATY)} pokrytych, {bez} bez pokrycia; '
      f'kontrola pozytywna wypadla: {norm(PODLOZONY[0]) not in zapis}')
