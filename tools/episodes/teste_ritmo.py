# Source of public/episodes/teste-ritmo/episode.json: a 10 s test of the new pacing concepts
# (coverage sub-cuts, whip/zoom/smash transitions, centre-safe framing for 9:16, acid narrator tone).
#   .venv/Scripts/python -I tools/episodes/teste_ritmo.py
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # python -I drops the script dir
from kit import *  # noqa: E402,F401,F403

SLUG = 'teste-ritmo'
TITLE = 'Teste de Ritmo'

# 1. bedroom: he wakes up fast (window behind him, not the whiteboard set)
S('r1', 'bedroom', '[calm] Você acordou dez vezes mais rápido.',
  [A('hero', 'rug', 0, 'stand', 'shocked',
     poses=[{'t': '@rápido', 'pose': 'determined', 'blend': 0.25}],
     faces=[{'t': '@rápido', 'face': 'determined', 'blend': 0.2}])],
  cam('medium', 'hero', 15, move='crashIn'))

# 2. street: the dash, whip in; sub-cuts re-frame the run on word starts
S('r2', 'suburb', '[mischievously] Parabéns. Chegou na escola antes do ônibus sair da garagem.',
  [A('hero', 'sidewalk+-7,0,0', 90, 'stand', 'determined', gait='dash',
     path=[{'t': 0, 'pos': 'sidewalk+-7,0,0'}, {'t': 3.2, 'pos': 'sidewalk+16,0,0', 'gait': 'dash'}])],
  cam('full', 'hero', -70), cut='whip', coverage='fast', fx={'speedLines': 'hero'})

# 3. classroom, close: proud of himself (no legs in frame yet)
S('r3', 'classroom', '[deadpan] Só esqueceu um detalhe.', variant=0,
  actors=[A('heroNu', 'aisle', 0, 'confident', 'smug')],
  camera=cam('close', 'heroNu', 10, move='pushIn'), cut='zoom')

# 4. smash cut to full: the reveal
S('r4', 'classroom', 'A calça.', variant=0, hold=0.3,
  actors=[A('heroNu', 'aisle', 0, 'confident', 'smug',
            faces=[{'t': 0.5, 'face': 'shocked', 'blend': 0.12}],
            poses=[{'t': 0.5, 'pose': 'shocked', 'blend': 0.15}])],
  camera=cam('full', 'heroNu', 0, height=24, move='static'), cut='smash')

# 5. the teacher saw it all (back wall behind her), whip in
S('r5', 'classroom', '[darkly amused] E a professora viu tudo.', variant=0, hold=0.4,
  actors=[A('teacher', 'window+3.4,0,1.2', 0, 'shocked', 'shocked', look='heroNu'),
          A('heroNu', 'aisle', 0, 'shocked', 'embarrassed')],
  camera=cam('medium', 'teacher', -15, move='pushIn'), cut='whip', coverage='fast')

ep = episode(SLUG, TITLE,
             cast={'heroNu': {'name': 'Hero', 'top': 'jacket', 'topColor': '#8b8f98', 'accent': '#c9a227',
                              'bottom': 'none', 'shoes': '#f4f1ea', 'hair': 'none'}},
             music=[('r1', 'action')])
write(SLUG, ep)
