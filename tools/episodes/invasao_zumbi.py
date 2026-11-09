# Source of public/episodes/invasao-zumbi/episode.json — edit HERE, then run:
#   .venv/Scripts/python -I tools/episodes/invasao_zumbi.py
# (episode.json is regenerated from this file; hand edits to the JSON get overwritten.)
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # python -I drops the script dir
from kit import apply_ritmo  # noqa: E402  (house pacing; the rest of this older generator keeps its own helpers)

SLUG = 'invasao-zumbi'
GREEN = '#8dff6a'
shots = []


def A(id, pos, rot=0, pose='stand', face='neutral', **kw):
    d = {'id': id, 'pos': pos, 'rot': rot, 'pose': pose, 'face': face}
    d.update(kw)
    return d


def Z(id, pos, rot=0, **kw):
    """A zombie: arms out, half-asleep face, green spore glow."""
    kw.setdefault('pose', 'zombie')
    kw.setdefault('face', 'zombie')
    kw.setdefault('glow', GREEN)
    pose, face = kw.pop('pose'), kw.pop('face')
    return A(id, pos, rot, pose, face, **kw)


def walk(a, b, t0=0.2, t1=3.0, gait='shamble'):
    return [{'t': t0, 'pos': a}, {'t': t1, 'pos': b, 'gait': gait}]


def cam(shot, target, angle=0, **kw):
    d = {'shot': shot, 'target': target, 'angle': angle}
    d.update(kw)
    return d


def S(id, set_, vo=None, actors=None, camera=None, **kw):
    d = {'id': id, 'set': set_}
    if vo:
        d['vo'] = vo
    if actors:
        d['actors'] = actors
    if camera:
        d['camera'] = camera
    d.update(kw)
    shots.append(d)


def C(id, card, vo, **spec):
    d = {'id': id, 'kind': 'card', 'card': card, 'vo': vo}
    d.update(spec)
    shots.append(d)


TALK = [[0.05, 3.0]]
SW = lambda v: {'type': 'stopwatch', 'from': v, 'persist': True}
WHISTLE = {'reachR': {'to': 'mouth'}, 'head': [-6, 0, 0], 'armL': [10, 14, 0, 20]}
PHONE_DESK = [1.38, 0.79, 1.75]  # on the hero's desk (classroom seat2)
LAB = [{'type': 'jar', 'pos': [-4.3, 0.78, 2.6]}, {'type': 'glow', 'pos': [-4.3, 0.78, 2.6], 'y': 0.12, 'size': 0.05, 'color': GREEN},
       {'type': 'sign', 'pos': [-5.92, 1.95, 3.6], 'rot': 90, 'w': 1.1, 'h': 0.32, 'text': 'LAB. DE CIÊNCIAS', 'bg': '#f6f2e8', 'fg': '#1d2333'}]
BELL_CAF = {'type': 'box', 'pos': [2.6, 2.55, -4.85], 'w': 0.5, 'h': 0.32, 'd': 0.18, 'color': '#c8402f'}
BELL_CLS = {'type': 'box', 'pos': [-2.4, 2.6, -4.85], 'w': 0.5, 'h': 0.32, 'd': 0.18, 'color': '#c8402f'}
SUNPATCH = {'type': 'rug', 'pos': [0.4, 0.005, -3.6], 'w': 2.4, 'd': 1.3, 'color': '#fff0b0'}
FLOORSIT = {'hipY': -0.71, 'spine': [8, 0, 0], 'legL': [88, 8, 8], 'legR': [86, 8, 14], 'armL': [-25, 20, 0, 10], 'armR': [-25, 20, 0, 10], 'handL': 'open', 'handR': 'open'}
def crowd(n, x0, x1, z0, z1, seed=1, gap=0.9, keep=()):
    """n points on a jittered layout inside a box, never closer than `gap` to each other or to `keep` points."""
    import random
    rnd = random.Random(seed)
    pts = list(keep)
    out = []
    tries = 0
    while len(out) < n and tries < 6000:
        tries += 1
        px, pz = rnd.uniform(x0, x1), rnd.uniform(z0, z1)
        if all((px - a) ** 2 + (pz - b) ** 2 >= gap * gap for a, b in pts):
            pts.append((px, pz))
            out.append((round(px, 2), round(pz, 2)))
    return out


def face_to(tx, tz):
    import math
    return lambda px, pz: round(math.degrees(math.atan2(tx - px, tz - pz)))


def horde(pts, rot=0, first=1, to=None, t1=5.0, **kw):
    """Zombie extras x01, x02… at pts; rot may be face_to(...); to=(tx, tz, frac) walks them that fraction toward a point."""
    out = []
    for k, (px, pz) in enumerate(pts):
        r = rot(px, pz) if callable(rot) else rot
        a = dict(kw)
        if to:
            tx, tz, fr = to
            a['path'] = walk([px, 0, pz], [round(px + (tx - px) * fr, 2), 0, round(pz + (tz - pz) * fr, 2)], 0.0, t1)
        out.append(Z(f'x{first + k:02d}', [px, 0, pz], r, **a))
    return out


CD = {'type': 'stopwatch', 'cd': 'bell'}   # live countdown to the noon bell, filled in from timing.json at the end
CDS = {'type': 'stopwatch', 'cd': 'sun'}   # the 30 s sun timer (top-left corner, so it reads as a different clock)
RULES = ['O SOM MAIS ALTO GANHA', 'ELES FOGEM DO SOL', 'ONDE UM VAI, O BANDO VAI']

# ---------------------------------------------------------------- 1. abertura fria (sala de aula)
S('c1', 'classroom', 'Seu celular toca. No meio da prova.',
  props=[{'type': 'phone', 'pos': PHONE_DESK, 'rot': [-1.57, 0, 0.3],
          'path': [{'t': round(0.1 + 0.07 * k, 2), 'pos': [round(PHONE_DESK[0] + (0.008 if k % 2 else -0.008), 3), PHONE_DESK[1], PHONE_DESK[2]]} for k in range(30)]}],
  camera={'pos': [0.75, 1.1, 2.35], 'look': [1.38, 0.8, 1.75], 'fov': 30, 'move': 'pushIn'},
  sfx=[{'t': 0.1, 'name': 'ring', 'dur': 2.2}])
S('c2', 'classroom', 'A turma inteira vira pra você. Menos o Rafa.',
  actors=[A('hero', 'seat2', -90, 'sit', 'embarrassed'), Z('rafa', 'seat3', -90, pose='sit', face='sleepy', glow=None)],
  camera={'pos': [-1.7, 1.5, 3.0], 'look': [1.2, 0.85, 1.0], 'fov': 44, 'move': 'drift'}, sfx=[{'t': 0.1, 'name': 'ring', 'dur': 1.6}])
S('c3', 'classroom', 'O Rafa levanta. Devagar. Braços pra frente. Olhos quase fechados.',
  actors=[A('rafa', 'seat3', -90, 'sit', 'sleepy',
            poses=[{'t': '@levanta', 'pose': 'stand', 'blend': 0.9}, {'t': '@braços', 'pose': {'hipY': -0.01, 'spine': [10, 0, 0], 'head': [14, 0, 16], 'armL': [88, 0, 0, 6], 'armR': [86, 0, 0, 8], 'handL': 'open', 'handR': 'open'}, 'blend': 0.6}],
            faces=[{'t': '@olhos', 'face': 'zombie', 'blend': 0.4}])],
  camera=cam('medium', 'rafa', 15, move='pushIn'), sfx=[{'t': '@devagar', 'name': 'groan'}])
S('c4', 'classroom', 'E brilhando. Um verde fraquinho, tipo pulseira de festa.',
  actors=[Z('rafa', 'seat3', -90)], camera=cam('close', 'rafa', -10, move='pushIn'), sfx=[{'t': '@brilhando', 'name': 'glint'}])
S('c5', 'classroom', 'Ele anda direto pro seu celular.',
  actors=[Z('rafa', 'seat3', -90, path=walk('seat3', 'aisle+0.2,0,0.1', 0.2, 2.6)), A('hero', 'seat2', -90, 'sit', 'scared', look='rafa')],
  props=[{'type': 'phone', 'pos': PHONE_DESK, 'rot': [-1.57, 0, 0.3]}],
  camera={'pos': [0.0, 2.7, 4.8], 'look': [0.9, 0.9, 0.7], 'fov': 36}, sfx=[{'t': 0.1, 'name': 'ring', 'dur': 2.4}])
S('c6', 'classroom', 'Você joga o celular pro fundo da sala.',
  actors=[A('hero', 'seat2', -90, 'sit', 'determined',
            poses=[{'t': '@joga', 'pose': {'hipY': -0.46, 'legL': [88, 6, 92], 'legR': [88, 6, 92], 'spine': [-4, 0, -25], 'armR': [140, 30, 0, 10], 'handR': 'open'}, 'blend': 0.2}])],
  props=[{'type': 'phone', 'pos': PHONE_DESK, 'rot': [-1.57, 0, 0.3],
          'path': [{'t': '@joga', 'pos': PHONE_DESK}, {'t': '@fundo', 'pos': [3.6, 1.7, 2.6]}, {'t': '@sala', 'pos': [5.4, 0.02, 3.0]}]}],
  camera=cam('medium', 'hero', 140, height=8), sfx=[{'t': '@joga', 'name': 'whoosh'}, {'t': '@sala', 'name': 'thud'}, {'t': '@sala+0.1', 'name': 'ring', 'dur': 2.0}])
S('c7', 'classroom', 'O Rafa muda de direção na hora. E segue o som.',
  actors=[Z('rafa', 'aisle+0.2,0,0.1', 90, path=[{'t': 0.3, 'pos': 'aisle+0.2,0,0.1'}, {'t': 2.6, 'pos': [3.0, 0, 0.9], 'gait': 'shamble'}, {'t': 4.6, 'pos': [4.7, 0, 2.3], 'gait': 'shamble'}]),
          A('hero', 'seat2', -90, 'sit', 'shocked')],
  props=[{'type': 'phone', 'pos': [5.4, 0.02, 3.0], 'rot': [-1.57, 0, 0.3]}],
  camera={'pos': [1.2, 1.9, 6.6], 'look': [1.6, 1.0, 0.9], 'to': {'pos': [1.8, 1.9, 6.6], 'look': [4.3, 0.9, 2.2]}, 'moveAt': [0.3, 4.6], 'ease': 'cruise', 'fov': 40},
  sfx=[{'t': 0.1, 'name': 'ring', 'dur': 2.6}])
S('c8', 'classroom', 'O Rafa sempre andou assim?', who='male',
  actors=[A('bestie', 'seat1', 90, 'sit', 'confused', look='hero', talk=TALK), A('hero', 'seat2', -90, 'sit', 'worried')],
  camera=cam('close', 'bestie', 15))
S('c9', 'classroom', 'Só às segundas.', hold=0.3,
  actors=[A('hero', 'seat2', -90, 'sit', 'smirk', look='bestie', talk=[[0.05, 0.9]])], camera=cam('close', 'hero', -25))
S('c10', 'cafeteria', 'E no refeitório, mais doze alunos andando igual. Todos brilhando.', variant=1,
  actors=[Z('zA', [-0.4, 0, -3.6], 0, path=walk([-0.4, 0, -3.6], [-0.3, 0, 0.4], 0.0, 6)),
          Z('zB', [0.6, 0, -2.2], 10, path=walk([0.6, 0, -2.2], [0.7, 0, 1.6], 0.0, 6)),
          Z('zC', [2.4, 0, 2.6], -80, path=walk([2.4, 0, 2.6], [0.9, 0, 3.0], 0.0, 6)),
          Z('zD', [-2.6, 0, 2.7], 80, path=walk([-2.6, 0, 2.7], [-1.0, 0, 3.4], 0.0, 6))]
         + horde([(-4.0, -2.0), (-2.0, -2.0), (2.0, -2.0), (4.0, -2.0), (-4.4, 4.6), (4.2, 4.4), (3.0, 5.4), (-3.4, 5.5)], rot=face_to(0, 6)),
  camera={'pos': [0.3, 1.5, 7.6], 'look': [0, 1.0, -0.5], 'fov': 42, 'move': 'pushIn'}, sfx=[{'t': 0.5, 'name': 'groanLow'}])

# ---------------------------------------------------------------- 2. pergunta do título
S('t1', 'cafeteria', 'E se você salvasse sua escola de uma invasão zumbi? [mischievously] Spoiler: vai custar caro. Pra você.', variant=1,
  actors=[A('hero', [-3.4, 0, 3.9], 60, 'hide', 'scared', look='zB'),
          Z('zA', [-0.3, 0, 0.4], 0, path=walk([-0.3, 0, 0.4], [-0.2, 0, 2.6], 0.0, 6)),
          Z('zB', [0.7, 0, 1.6], 20, path=walk([0.7, 0, 1.6], [1.6, 0, 3.6], 0.0, 6)),
          Z('zC', [0.9, 0, 3.0], -90, path=walk([0.9, 0, 3.0], [3.0, 0, 3.4], 0.0, 6))],
  camera={'pos': [-5.4, 2.6, 7.4], 'look': [0.4, 0.9, 1.2], 'fov': 42, 'move': 'pushIn'},
  overlays=[{'type': 'title', 'small': 'E SE VOCÊ SALVASSE SUA ESCOLA', 'big': 'DE UMA INVASÃO ZUMBI?', 'at': 0.2}])

# ---------------------------------------------------------------- 3. mecanismo + limite
S('m1', 'classroom', 'Tudo começou no laboratório de ciências. A professora Helena trouxe de uma viagem um fungo raro, num pote fechado.', variant=1,
  props=LAB, actors=[A('helena', 'teacher+0.3,0,0.9', 70, 'explain', 'happy', look=[-4.3, 0.9, 2.6])],
  camera={'pos': [-1.6, 1.6, 4.6], 'look': [-4.4, 1.15, 2.7], 'fov': 40, 'move': 'drift'})
S('m2', 'classroom', 'Hoje cedo, alguém derrubou o pote. [deadpan] E não contou pra ninguém.', variant=1,
  props=[{'type': 'jar', 'pos': [-4.3, 0.78, 2.6],
          'path': [{'t': '@derrubou', 'pos': [-4.3, 0.78, 2.6], 'rot': [0, 0, 0]}, {'t': '@pote', 'pos': [-3.8, 0.1, 2.9], 'rot': [0, 0.4, 1.57]}]},
         LAB[2]],
  camera={'pos': [-2.5, 1.0, 4.4], 'look': [-4.1, 0.5, 2.7], 'fov': 34}, fx={'particles': 'dust'},
  sfx=[{'t': '@pote', 'name': 'thud'}, {'t': '@pote+0.1', 'name': 'debris'}])
C('m3', 'icon', 'O fungo solta esporos: um pó invisível, que voa pelo ar. Quem respira, em dez minutos, vira zumbi.',
  icon='warning', caption='ESPOROS NO AR', sub='ZUMBI EM 10 MINUTOS')
S('m4', 'void', 'Mas não do tipo de filme. Ninguém morde. Eles só andam devagar, gemem, e brilham verde. [deadpan] Igual você numa segunda.',
  actors=[Z('zA', 'left+1.5,0,0', 20, path=walk('left+1.5,0,0', 'left+1.7,0,1.4', 0.2, 6)), Z('zC', 'right+-1.5,0,0', -20, path=walk('right+-1.5,0,0', 'right+-1.7,0,1.4', 0.2, 6))],
  camera=cam('wide', ['zA', 'zC'], 0, move='pushIn'), sfx=[{'t': '@gemem', 'name': 'groan'}])
S('m5', 'void', 'E querem encostar em você. Porque um toque passa o fungo adiante, em dez segundos.',
  actors=[A('hero', 'center', 0, 'stand', 'worried', path=[{'t': 0.4, 'pos': 'center'}, {'t': 2.6, 'pos': 'front', 'gait': 'walk'}], strafe=True),
          Z('zB', 'back', 0, path=walk('back', 'center+0,0,-0.9', 0.2, 5))],
  camera=cam('medium', 'hero', 20, move='pullOut'))
C('m6', 'icon', 'O resto continua igual. Menos uma coisa: eles quase não enxergam. Eles seguem o som. Sempre o som mais alto.',
  icon='eye', caption='ELES QUASE NÃO ENXERGAM', sub='SEGUEM O SOM MAIS ALTO')
S('m7', 'void', 'Guarda isso.',
  actors=[A('hero', 'center', 0, 'point', 'determined')], camera=cam('xclose', 'hero', -10, move='pushIn'))

# ---------------------------------------------------------------- 4. escada de números + ciência
C('s1', 'icon', 'Agora, a parte estranha: esse fungo existe de verdade.', icon='globe', caption='ESSE FUNGO EXISTE')
C('s2', 'chain', 'Na Mata Atlântica, aqui no Brasil, vive um fungo que invade formigas. Ele entra no corpo e decide pra onde ela anda.',
  title='O FUNGO DAS FORMIGAS', nodes=[{'icon': 'globe', 'label': 'MATA ATLÂNTICA'}, {'icon': 'brain', 'label': 'FUNGO NO CORPO'}, {'icon': 'walk', 'label': 'FORMIGA ZUMBI'}])
C('s3', 'stat', 'A formiga infectada sai do ninho, sobe numa planta, e morde uma folha a uns vinte e cinco centímetros do chão.',
  value=25, unit='CENTÍMETROS', label='DO CHÃO, PRESA NUMA FOLHA', icon='flag')
C('s4', 'clock', 'E quase sempre perto do meio-dia. Uma atrás da outra, na mesma hora.',
  mode='tick', label='MEIO-DIA', value='12:00', time='12:00')
S('s5', 'void', 'Esse é o zumbi de verdade. E sim: fungo é mais parente seu do que de uma alface.',
  actors=[A('hero', 'center', 15, 'shrug', 'smirk')], camera=cam('medium', 'hero', 15, move='drift'))
C('s6', 'stat', 'Agora, a conta. Cada zumbi encosta em alguém a cada cinco minutos. Então o número dobra.',
  value=5, unit='MINUTOS', label='PRA DOBRAR', icon='clock')
C('s7', 'chain', 'Um. Dois. Quatro. Oito. Dezesseis.',
  title='ZUMBIS', nodes=[{'icon': 'stand', 'label': '1'}, {'icon': 'stand', 'label': '2'}, {'icon': 'stand', 'label': '4'}, {'icon': 'stand', 'label': '8'}, {'icon': 'stand', 'label': '16'}], step=0.6)
C('s8', 'stat', 'Em cinquenta minutos, mais de seiscentos. A escola inteira.',
  value=600, unit='ALUNOS', label='EM 50 MINUTOS', icon='house')
S('s9', 'classroom', 'Cinquenta minutos. O tempo de uma aula. Depois disso, a escola vira quarentena. [darkly amused] Com você trancado do lado de dentro.', variant=1,
  actors=[A('hero', 'center', 20, 'stand', 'worried')], camera=cam('close', 'hero', 10, move='pushIn'), sfx=[{'t': 0.2, 'name': 'ticks', 'dur': 1.2}])

# ---------------------------------------------------------------- 5. teste de prova (refeitório)
S('p1', 'cafeteria', 'No refeitório, o inspetor Seu Jorge acha que é tudo brincadeira.', variant=1,
  actors=[A('jorge', 'center', 135, 'armsCrossed', 'suspicious'),
          Z('zA', [-1.2, 0, 1.0], 10), Z('zB', [-0.2, 0, 0.4], 0), Z('zC', [0.9, 0, 0.6], -15),
          A('hero', [-4.6, 0, 4.6], 120, 'hide', 'worried', look='jorge'), A('bestie', [-5.3, 0, 4.1], 120, 'hide', 'scared', look='jorge')],
  camera={'pos': [3.2, 1.7, 1.2], 'look': [-0.8, 1.0, 3.4], 'fov': 46, 'move': 'drift'})
S('p2', 'cafeteria', '[shouting] Todo mundo sentado. Agora!', who='adulto', variant=1,
  actors=[A('jorge', 'center', 180, 'point', 'angry', talk=TALK)], camera=cam('close', 'jorge', 0))
S('p3', 'cafeteria', 'E apita. Bem alto.', variant=1,
  actors=[A('jorge', 'center', 180, WHISTLE, 'angry', hold={'R': 'whistle'})], camera=cam('close', 'jorge', 30),
  sfx=[{'t': '@apita', 'name': 'whistle', 'dur': 0.9}])
S('p4', 'cafeteria', 'Os zumbis param. Viram a cabeça pra ele. E andam na direção do apito.', variant=1,
  actors=[Z('zA', [-1.2, 0, 1.0], 10, look='jorge', path=walk([-1.2, 0, 1.0], [-0.8, 0, 2.6], '@andam', '@apito+1.6')),
          Z('zB', [-0.2, 0, 0.4], 0, look='jorge', path=walk([-0.2, 0, 0.4], [0.05, 0, 2.3], '@andam', '@apito+1.6')),
          Z('zC', [0.9, 0, 0.6], -15, look='jorge', path=walk([0.9, 0, 0.6], [0.9, 0, 2.6], '@andam', '@apito+1.6')),
          A('jorge', 'center', 180, 'stand', 'surprised', hold={'R': 'whistle'})],
  camera={'pos': [-0.3, 1.7, 6.4], 'look': [-0.1, 1.1, 1.4], 'fov': 42}, sfx=[{'t': '@param', 'name': 'groan'}])
S('p5', 'cafeteria', 'Eu falei... sentado.', who='adulto', variant=1,
  actors=[A('jorge', 'center', 180, 'stand', 'scared', hold={'R': 'whistle'}, talk=TALK)], camera=cam('close', 'jorge', -20))
S('p6', 'cafeteria', 'Um toque no ombro.', variant=1,
  actors=[A('jorge', 'center', 180, 'stand', 'shocked', hold={'R': 'whistle'}, contact=True),
          Z('zB', 'center+-0.78,0,0.32', 119, contact=True, pose={'hipY': -0.01, 'spine': [8, 0, 0], 'head': [12, 0, 14], 'armL': [55, 8, 0, 14], 'armR': [92, -4, 0, 6], 'handL': 'open', 'handR': 'open'})],
  camera={'pos': [-1.0, 1.55, 1.5], 'look': [-0.35, 1.35, 3.9], 'fov': 36})
S('p7', 'cafeteria', 'Dez segundos depois, o Seu Jorge está gemendo junto. [darkly amused] Afinadíssimo.', variant=1,
  actors=[Z('jorge', 'center', 180), Z('zA', 'center+-0.8,0,-0.6', 20), Z('zB', 'center+0.6,0,-0.7', -10)],
  camera=cam('medium', 'jorge', -10, move='pushIn'), sfx=[{'t': '@gemendo', 'name': 'groanLow'}])
S('p8', 'cafeteria', 'O apito cai no chão. Você pega, e guarda no bolso. Ainda não sabe por quê.', variant=1,
  actors=[A('hero', [-4.6, 0, 4.6], 120, 'crouch', 'focused',
            poses=[{'t': 0, 'pose': {'hipY': -0.42, 'spine': [38, 0, 0], 'head': [20, 0, 0], 'legL': [80, 6, 100], 'legR': [60, 6, 110], 'armR': [70, 6, 0, 10], 'armL': [20, 10, 0, 30], 'handR': 'fist'}},
                   {'t': '@pega', 'pose': 'crouch', 'blend': 0.4},
                   {'t': '@guarda', 'pose': {'hipY': 0, 'legL': [0, 0, 0], 'legR': [0, 0, 0], 'spine': [4, 0, 0], 'reachR': {'to': 'pocket'}, 'head': [10, 0, 0]}, 'blend': 0.6}], hold={'R': 'whistle'})],
  camera=cam('full', 'hero', 20), sfx=[{'t': '@cai', 'name': 'click'}])

# ---------------------------------------------------------------- 6. regras
C('r1', 'rules', 'Em vinte minutos escondido, você aprende as regras.', title='AS REGRAS', prefix='REGRA', rules=RULES, current=0)
C('r2', 'rules', 'Regra um: o som mais alto ganha.', title='AS REGRAS', prefix='REGRA', rules=RULES, current=1)
CAF_Z = [('zA', [-1.6, 0, 3.2]), ('zC', [-0.2, 0, 3.7]), ('zD', [1.0, 0, 3.0])]
S('r3', 'cafeteria', 'Você testa. Seu celular tocando de um lado. Um livro batendo no chão do outro.', variant=1,
  props=[{'type': 'phone', 'pos': [-3.4, 0.78, 1.6], 'rot': [-1.57, 0, 0]}, {'type': 'book', 'pos': [3.8, 0.03, 4.4], 'color': '#c8402f',
          'path': [{'t': '@livro', 'pos': [3.8, 0.95, 4.4]}, {'t': '@batendo', 'pos': [3.8, 0.03, 4.4]}]}],
  actors=[Z(i, p, 40) for i, p in CAF_Z] + [A('hero', [-2.4, 0, 4.6], 120, 'crouch', 'focused')],
  camera={'pos': [0.0, 2.6, 9.4], 'look': [0.4, 0.8, 2.6], 'fov': 46},
  sfx=[{'t': '@celular', 'name': 'ring', 'dur': 2.4}, {'t': '@livro+0.4', 'name': 'thud'}, {'t': '@outro', 'name': 'thud'}])
S('r4', 'cafeteria', 'Eles vão pro livro. O toque do seu celular é educado demais.', variant=1,
  props=[{'type': 'phone', 'pos': [-3.4, 0.78, 1.6], 'rot': [-1.57, 0, 0]}, {'type': 'book', 'pos': [3.8, 0.03, 4.4], 'color': '#c8402f'}],
  actors=[Z(i, p, 40, path=walk(p, q, 0.2, 4.5)) for (i, p), q in zip(CAF_Z, [[2.0, 0, 3.6], [2.9, 0, 4.7], [3.2, 0, 3.4]])] + [A('hero', [-2.4, 0, 4.6], 120, 'crouch', 'smirk')],
  camera={'pos': [0.0, 2.6, 9.4], 'look': [1.0, 0.8, 2.8], 'fov': 46}, sfx=[{'t': 0.2, 'name': 'ring', 'dur': 2.0, 'vol': -8}])
C('r5', 'rules', 'Regra dois: eles fogem do sol.', title='AS REGRAS', prefix='REGRA', rules=RULES, current=2)
S('r6', 'classroom', 'Um zumbi chega perto da janela. Pisa numa faixa de sol. E recua, como quem pisa em água gelada.', variant=1,
  props=[SUNPATCH],
  actors=[Z('zE', [0.4, 0, -1.4], 180, path=[{'t': 0.2, 'pos': [0.4, 0, -1.4]}, {'t': '@pisa', 'pos': [0.4, 0, -3.0], 'gait': 'shamble'},
                                         {'t': '@recua', 'pos': [0.4, 0, -3.0]}, {'t': '@gelada', 'pos': [0.4, 0, -2.0], 'gait': 'sneak'}],
            strafe=True)],
  camera={'pos': [3.4, 1.5, 0.6], 'look': [0.3, 0.9, -2.6], 'fov': 40}, sfx=[{'t': '@recua', 'name': 'groan'}])
C('r7', 'rules', 'Regra três: onde um vai, o bando vai atrás.', title='AS REGRAS', prefix='REGRA', rules=RULES, current=3)
S('r8', 'cafeteria', 'O Davi tropeça numa bandeja. Um zumbi vira. Depois outro. Depois o bando inteiro.', variant=1,
  props=[{'type': 'box', 'pos': [-2.9, 0, 3.6], 'w': 0.36, 'h': 0.02, 'd': 0.25, 'color': '#3d6fb6'}],
  actors=[A('bestie', [-3.6, 0, 3.8], 90, 'stand', 'shocked', poses=[{'t': '@tropeça', 'pose': 'fall', 'blend': 0.25}, {'t': '@tropeça+0.45', 'pose': FLOORSIT, 'blend': 0.35}]),
          Z('zA', [0.2, 0, -1.6], 0, path=walk([0.2, 0, -1.6], [-0.8, 0, 0.4], '@um', '@um+3')),
          Z('zC', [0.8, 0, 0.0], 0, path=walk([0.8, 0, 0.0], [-0.4, 0, 1.8], '@outro', '@outro+3')),
          Z('zD', [-0.2, 0, -3.0], 0, path=walk([-0.2, 0, -3.0], [-1.0, 0, -1.2], '@bando', '@bando+3')),
          Z('zE', [2.2, 0, 3.0], -90, path=walk([2.2, 0, 3.0], [0.8, 0, 3.4], '@bando', '@bando+3'))],
  camera={'pos': [-5.3, 2.0, 7.8], 'look': [-0.8, 0.9, 1.0], 'fov': 44}, sfx=[{'t': '@tropeça', 'name': 'thud'}, {'t': '@bando', 'name': 'groanLow'}])
S('r9', 'cafeteria', 'Foi mal! Foi mal!', who='male', variant=1,
  actors=[A('bestie', [-3.6, 0, 3.8], 90, 'scared', 'scared', talk=TALK)], camera=cam('close', 'bestie', 10))

# ---------------------------------------------------------------- 7. montagem de vantagens
S('k1', 'cafeteria', 'E aí vem a parte boa: a escola é sua.', variant=1,
  actors=[A('hero', 'center', 0, 'power', 'grin')], camera={'pos': [0.2, 1.5, 6.2], 'look': [0, 1.2, 2.0], 'fov': 40, 'to': {'pos': [0.3, 2.0, 9.2], 'look': [0, 1.1, 1.5]}})
S('k2', 'cafeteria', 'Almoço sem fila. Sobremesa? Três.', variant=1,
  actors=[A('hero', 'seat1', 0, 'sit', 'bliss', hold={'R': 'cup'}), A('bestie', 'seat1+1.2,0,0', 0, 'sit', 'happy', hold={'R': 'cup'})],
  props=[{'type': 'pizza', 'pos': 'seat1+0,0.78,0.62'}],
  camera=cam('medium', 'hero', 20), sfx=[{'t': '@três', 'name': 'pop'}])
S('k3', 'cafeteria', 'Pra atravessar um corredor cheio de zumbi, você só deixa uma música tocando do outro lado.', variant=1,
  props=[{'type': 'phone', 'pos': [4.6, 0.78, 1.6], 'rot': [-1.57, 0, 0]}],
  actors=[Z('zA', [-0.4, 0, 0.0], 90, path=walk([-0.4, 0, 0.0], [2.2, 0, 0.3], 0.3, 6)),
          Z('zC', [-0.6, 0, 2.6], 90, path=walk([-0.6, 0, 2.6], [2.2, 0, 2.9], 0.3, 6)),
          A('hero', [-3.4, 0, 4.4], 90, 'stand', 'smug', path=[{'t': 1.2, 'pos': [-3.4, 0, 4.4]}, {'t': 4.8, 'pos': [-5.0, 0, 4.4], 'gait': 'sneak'}])],
  camera={'pos': [0.2, 2.4, 9.6], 'look': [-0.6, 0.9, 1.4], 'fov': 42}, sfx=[{'t': 0.2, 'name': 'ring', 'dur': 3.0, 'vol': -6}])
S('k4', 'classroom', 'Você tenta guiar eles batendo palma.', variant=1,
  actors=[A('hero', [-3.4, 0, 4.6], 30, {'armL': [75, 28, 0, 40], 'armR': [75, 28, 0, 40], 'handL': 'open', 'handR': 'open'}, 'smug',
            poses=[{'t': round(0.45 + 0.5 * k + (0.25 if j else 0), 2), 'pose': {'armL': [75, 28 if j else -4, 0, 40], 'armR': [75, 28 if j else -4, 0, 40], 'handL': 'open', 'handR': 'open'}, 'blend': 0.12} for k in range(4) for j in (0, 1)])],
  camera=cam('medium', 'hero', 10), sfx=[{'t': round(0.57 + 0.5 * k, 2), 'name': 'click'} for k in range(4)])
S('k5', 'classroom', 'Eles vêm em você. Todos.', variant=1,
  actors=[Z('zA', [0.9, 0, 4.4], -90, path=walk([0.9, 0, 4.4], [-1.6, 0, 4.5], 0.0, 4)),
          Z('zB', [2.2, 0, 3.8], -90, path=walk([2.2, 0, 3.8], [-0.6, 0, 3.9], 0.0, 4)),
          Z('zC', [2.4, 0, 4.9], -90, path=walk([2.4, 0, 4.9], [0.6, 0, 5.0], 0.0, 4)),
          A('hero', [-3.4, 0, 4.6], 90, 'shocked', 'shocked', path=[{'t': '@todos', 'pos': [-3.4, 0, 4.6]}, {'t': '@todos+1.4', 'pos': [-5.2, 0, 4.4], 'gait': 'run'}])],
  camera={'pos': [-1.4, 1.7, 9.0], 'look': [-2.1, 0.9, 4.4], 'fov': 46}, sfx=[{'t': '@todos', 'name': 'groanLow'}])
S('k6', 'classroom', 'Na sala do primeiro ano, um menino se esconde embaixo da mesa. Três zumbis em volta.', variant=1,
  actors=[A('kid', [-3.4, 0, 3.4], 60, 'hide', 'scared'),
          Z('zD', [-2.3, 0, 2.7], -58), Z('zE', [-3.1, 0, 4.6], -166), Z('zF', [-4.4, 0, 4.2], 129)],
  props=[{'type': 'desk', 'pos': [-3.4, 0, 3.4], 'rot': 60}],
  camera={'pos': [-0.4, 1.3, 4.6], 'look': [-3.2, 0.85, 3.5], 'fov': 44, 'move': 'pushIn'}, sfx=[{'t': 0.4, 'name': 'groan'}])
S('k7', 'classroom', 'Você deixa o celular tocando lá no fundo. Os três vão atrás do som.', variant=1,
  props=[{'type': 'phone', 'pos': [5.0, 0.02, 5.0], 'rot': [-1.57, 0, 0]}],
  actors=[A('kid', [-3.4, 0, 3.4], 60, 'hide', 'worried'),
          Z('zD', [-2.3, 0, 2.7], 90, path=walk([-2.3, 0, 2.7], [1.6, 0, 4.4], 0.4, 6)),
          Z('zE', [-3.1, 0, 4.6], 90, path=walk([-3.1, 0, 4.6], [0.4, 0, 5.2], 0.6, 6)),
          Z('zF', [-4.4, 0, 4.2], 90, path=walk([-4.4, 0, 4.2], [-0.8, 0, 4.5], 0.8, 6))],
  camera={'pos': [-0.8, 1.7, 8.6], 'look': [-0.6, 0.8, 4.0], 'fov': 50}, sfx=[{'t': 0.2, 'name': 'ring', 'dur': 3.4, 'vol': -6}])
S('k8', 'classroom', 'Você é tipo um super-herói?', who='female', variant=1,
  actors=[A('kid', 'center+-3.8,0,-1.5', 49, 'relaxed', 'awe', look='hero', talk=TALK), A('hero', 'center+-3.0,0,-0.8', -131, 'crouch', 'smile', look='kid')],
  camera={'pos': [-3.05, 1.0, 4.9], 'look': [-3.4, 0.85, 3.4], 'fov': 34})
S('k9', 'classroom', 'Sou tipo um despertador.', variant=1,
  actors=[A('hero', 'center+-3.0,0,-0.8', -131, 'crouch', 'smirk', look='kid', talk=[[0.05, 1.2]]), A('kid', 'center+-3.8,0,-1.5', 49, 'relaxed', 'happy')],
  camera={'pos': [-3.0, 1.2, 2.6], 'look': [-2.9, 0.9, 3.8], 'fov': 40})
S('k10', 'classroom', '[deadpan] Ele te abraça. E limpa o nariz na sua blusa.', variant=1,
  actors=[A('kid', 'center+-3.8,0,-1.5', 49, 'hug', 'bliss', contact=True), A('hero', 'center+-3.45,0,-1.2', -131, 'hug', 'smile', contact=True)],
  camera={'pos': [-1.4, 1.5, 1.9], 'look': [-3.2, 1.15, 3.5], 'fov': 42, 'move': 'pullOut'})
# ---------------------------------------------------------------- 8. "mas" + problemas
S('q1', 'void', '[darkly amused] Aí a escola cobra o aluguel. Em três problemas.',
  actors=[A('hero', 'center', 0, 'sad', 'worried')], camera=cam('medium', 'hero', 0, move='pullOut'))
C('q2', 'stat', 'Problema um: o seu celular é a sua única isca. E está com dezoito por cento.', value=18, unit='%', label='DE BATERIA', icon='phone')
S('q3', 'classroom', 'Cada isca gasta uns três por cento. Seis iscas, e acabou.', variant=1,
  actors=[A('hero', [-3.4, 0, 4.6], 20, 'phone', 'worried', hold={'R': 'phone'})], camera=cam('close', 'hero', 25))
S('q4', 'cafeteria', 'Solução: você pega emprestado o celular do Seu Jorge. Ele não reclama.', variant=1,
  actors=[Z('jorge', 'center', 0), A('hero', 'center+0.75,0,-0.2', -80, 'reach', 'focused', look='jorge', contact=True)],
  camera={'pos': [2.8, 1.5, 5.4], 'look': [0.4, 1.1, 3.6], 'fov': 40}, sfx=[{'t': '@reclama', 'name': 'groan'}])
S('q5', 'cafeteria', 'Isso é roubo.', who='male', variant=1,
  actors=[A('bestie', [-3.3, 0, 4.4], 60, 'armsCrossed', 'suspicious', look=[0.4, 1.4, 3.8], talk=[[0.05, 1.0]])], camera=cam('close', 'bestie', 15))
S('q6', 'cafeteria', '[whispering] É empréstimo.', variant=1,
  actors=[A('hero', [-2.6, 0, 4.0], -120, 'phone', 'smug', hold={'R': 'phone'}, look='bestie', talk=[[0.05, 1.0]])], camera=cam('close', 'hero', -15))
S('q7', 'classroom', 'Problema dois: a sala onde os sobreviventes se escondem. Quarenta alunos e a diretora, em silêncio total. Por horas.', variant=0,
  actors=[A('celia', 'front+0.4,0,0.6', 90, 'armsCrossed', 'focused'), A('sister', 'seat1', -90, 'sit', 'worried'), A('hero', 'aisle', -90, 'stand', 'worried')],
  camera={'pos': [0.8, 2.3, 10.5], 'look': [-0.2, 1, -0.5], 'fov': 40, 'move': 'pushIn'})
S('q8', 'classroom', 'Aí alguém espirra. E na porta, um gemido.', variant=0,
  actors=[A('sister', 'seat1', -90, 'sit', 'scared', look='celia'), A('hero', 'aisle', -150, 'stand', 'scared', look=[-5.4, 1.2, 4.2]),
          A('celia', 'front+0.4,0,0.6', 150, 'scared', 'shocked', look=[-5.4, 1.2, 4.2])],
  camera={'pos': [-1.7, 1.35, 2.1], 'look': [0.2, 0.85, 1.6], 'fov': 42}, sfx=[{'t': '@espirra', 'name': 'pop'}, {'t': '@gemido', 'name': 'groanLow'}])
S('q9', 'classroom', 'Solução: chiclete pra todo mundo. Boca mastigando não conversa.', variant=0,
  actors=[A('hero', 'aisle', -90, 'holdOut', 'smug', hold={'R': 'paper'}), A('sister', 'seat1', 90, 'sit', 'happy', look='hero')],
  camera=cam('medium', 'hero', -40))
S('q10', 'classroom', 'Chiclete? Na minha escola?', who='adulta', variant=0,
  actors=[A('celia', 'front+0.4,0,0.6', 90, 'armsCrossed', 'angry', talk=TALK)], camera=cam('close', 'celia', 10))
S('q11', 'cafeteria', 'Problema três: o banheiro fica do outro lado do refeitório. Com oito zumbis no caminho.', variant=1,
  actors=[Z('zA', [-0.3, 0, -2.0], 0), Z('zB', [0.5, 0, -0.4], 20), Z('zC', [-0.5, 0, 1.0], -10), Z('zD', [0.4, 0, 2.6], 0)]
         + horde([(-0.4, -4.2), (0.5, 1.6), (2.6, 3.4), (-0.6, -0.9)], rot=face_to(-4, 6)),
  props=[{'type': 'sign', 'pos': [5.92, 1.9, 2.4], 'rot': -90, 'w': 0.9, 'h': 0.3, 'text': 'BANHEIRO →', 'bg': '#f6f2e8', 'fg': '#1d2333'}],
  camera={'pos': [-4.2, 1.7, 6.8], 'look': [1.0, 1.0, 0.4], 'fov': 44, 'move': 'drift'})
S('q12', 'cafeteria', 'Solução: revezamento. Alguém faz barulho numa ponta, e o resto atravessa na outra.', variant=1,
  actors=[A('bestie', [-4.4, 0, -2.0], 90, 'cheer', 'determined', hold={'R': 'tray'}),
          Z('zA', [-0.3, 0, -2.0], -90, path=walk([-0.3, 0, -2.0], [-2.3, 0, -2.0], 0.3, 6)),
          Z('zB', [0.5, 0, -0.4], -100, path=walk([0.5, 0, -0.4], [-1.6, 0, -1.6], 0.3, 6)),
          A('sister', [0.8, 0, 4.6], 90, 'stand', 'determined', path=[{'t': 1.6, 'pos': [0.8, 0, 4.6]}, {'t': 4.4, 'pos': [4.6, 0, 4.4], 'gait': 'sneak'}]),
          A('kid', [-0.2, 0, 5.0], 90, 'stand', 'scared', path=[{'t': 2.0, 'pos': [-0.2, 0, 5.0]}, {'t': 4.8, 'pos': [3.6, 0, 5.0], 'gait': 'sneak'}])],
  camera={'pos': [0.6, 2.8, 11.5], 'look': [0.0, 0.9, 1.0], 'fov': 44}, sfx=[{'t': 0.4, 'name': 'thud'}, {'t': 0.8, 'name': 'thud'}, {'t': 1.2, 'name': 'thud'}])
S('q13', 'cafeteria', '[whispering] Eu não vou fazer xixi com zumbi escutando.', who='female', variant=1,
  actors=[A('sister', [4.6, 0, 4.4], -150, 'armsCrossed', 'angry', look='camera', talk=TALK)], camera=cam('close', 'sister', 0))

# ---------------------------------------------------------------- 9. problema real
S('x1', 'void', 'Nada disso é o que te dá medo de verdade.',
  actors=[A('hero', 'center', 0, 'stand', 'worried')], camera=cam('close', 'hero', 0, move='pushIn'), sfx=[{'t': '@verdade', 'name': 'subdrop'}])
C('x2', 'icon', 'Lembra? Eles seguem o som mais alto. E qual é o som mais alto de uma escola?', icon='question', caption='O SOM MAIS ALTO', sub='DA ESCOLA')
S('x3', 'cafeteria', 'O sinal.', variant=1, props=[BELL_CAF, {'type': 'sign', 'pos': [2.6, 2.22, -4.9], 'w': 0.6, 'h': 0.2, 'text': 'SINAL', 'bg': '#f6f2e8', 'fg': '#1d2333'}],
  camera={'pos': [1.6, 1.9, -2.6], 'look': [2.6, 2.5, -4.85], 'fov': 30}, sfx=[{'t': 0.1, 'name': 'bell', 'dur': 1.2, 'vol': -4}])
C('x4', 'clock', 'Ele toca sozinho, a cada cinquenta minutos. E o painel que desliga fica na diretoria. Lotada de zumbi.',
  mode='tick', label='A CADA 50 MINUTOS', value='10:50', time='10:50')
S('x5', 'cafeteria', 'Às dez e cinquenta, você está atravessando o refeitório. Bem embaixo da caixa de som.', variant=1, props=[BELL_CAF],
  actors=[A('hero', [-1.4, 0, -4.1], 90, 'stand', 'focused', path=[{'t': 0.4, 'pos': [-1.4, 0, -4.1]}, {'t': 4.0, 'pos': [2.4, 0, -4.1], 'gait': 'sneak'}])],
  camera={'pos': [0.4, 1.6, 2.4], 'look': [1.4, 1.4, -4.4], 'fov': 40})
S('x6', 'cafeteria', 'Ele toca.', variant=1, props=[BELL_CAF],
  actors=[A('hero', [2.4, 0, -4.1], 90, 'shocked', 'shocked', look=[2.6, 2.55, -4.85])],
  camera=cam('close', 'hero', 30, height=-12, move='crashIn'), sfx=[{'t': 0.05, 'name': 'bell', 'dur': 3.0}])
S('x7', 'cafeteria', 'Cento e cinquenta zumbis, de todas as salas, vindo ao mesmo tempo.', variant=1, props=[BELL_CAF],
  actors=horde(crowd(14, -4.8, 4.8, -2.4, 5.4, seed=7, gap=1.0, keep=[(x, z) for x in (-3, 3) for z in (-0.8, 1.6)]), rot=face_to(2.6, -4.85), to=(1.6, -3.8, 0.35), t1=6),
  camera={'pos': [2.2, 2.6, -4.2], 'look': [-0.6, 0.6, 3.0], 'fov': 52, 'move': 'shake'}, sfx=[{'t': 0.1, 'name': 'bell', 'dur': 2.5, 'vol': -6}, {'t': 0.6, 'name': 'groanLow'}])
S('x8', 'cafeteria', 'Você se joga atrás da lixeira. Eles passam a um palmo do seu tênis.', variant=1,
  props=[{'type': 'crate', 'pos': [2.4, 0, 4.6], 'w': 0.55, 'h': 0.85, 'd': 0.55, 'color': '#3f8a4a'}, {'type': 'sign', 'pos': [2.4, 0.55, 4.88], 'w': 0.4, 'h': 0.12, 'text': 'LIXO', 'bg': '#f6f2e8', 'fg': '#1d2333'}],
  actors=[A('hero', [2.4, 0, 5.3], 180, 'hide', 'scared'),
          Z('zE', [-0.4, 0, 3.7], 90, path=walk([-0.4, 0, 3.7], [5.2, 0, 3.8], 0.4, 7)),
          Z('zB', [-1.4, 0, 3.2], 90, path=walk([-1.4, 0, 3.2], [4.2, 0, 3.1], 0.6, 7))],
  camera={'pos': [5.4, 0.95, 5.85], 'look': [2.0, 0.6, 4.3], 'fov': 44}, sfx=[{'t': 0.3, 'name': 'thud'}])
S('x9', 'cafeteria', 'Salvo por sorte. E daqui a cinquenta minutos, o sinal toca de novo.', variant=1,
  props=[{'type': 'crate', 'pos': [2.4, 0, 4.6], 'w': 0.55, 'h': 0.85, 'd': 0.55, 'color': '#3f8a4a'}],
  actors=[A('hero', [2.4, 0, 5.3], 120, 'hide', {'mouth': -0.3, 'brow': 0.8, 'eyes': 1.1, 'sweat': True})],
  camera={'pos': [3.45, 0.9, 4.8], 'look': [2.4, 0.72, 5.3], 'fov': 34, 'move': 'pushIn'}, sfx=[{'t': '@sinal', 'name': 'heartbeat'}])
# ---------------------------------------------------------------- 10. maestria + regra tema
C('y1', 'icon', 'Então você volta pra origem de tudo: as formigas. Cientistas estudaram como elas se defendem.',
  icon='brain', caption='COMO AS FORMIGAS', sub='SE DEFENDEM')
C('y2', 'chain', 'Elas não lutam contra a doença dentro do ninho. Elas levam tudo que está contaminado pra fora.',
  title='A DEFESA DAS FORMIGAS', nodes=[{'icon': 'house', 'label': 'NINHO'}, {'icon': 'arrow', 'label': 'LEVA'}, {'icon': 'flag', 'label': 'PRA FORA'}])
C('y3', 'icon', 'E fungo que ataca inseto odeia sol: a luz ultravioleta destrói os esporos.',
  icon='sun', caption='LUZ DO SOL', sub='DESTRÓI OS ESPOROS')
S('y4', 'stadium', 'Aí você vê o Rafa. Ele seguiu um alarme de carro até o campo. E ficou parado no sol.', variant=1,
  actors=[Z('rafa', 'midfield', 30)], camera=cam('wide', 'rafa', 20, height=10, move='pushIn'), sfx=[{'t': '@alarme', 'name': 'ticks', 'dur': 1.0}])
S('y5', 'stadium', 'Trinta segundos depois, ele pisca.', variant=1,
  actors=[A('rafa', 'midfield', 30, 'stand', 'sleepy', faces=[{'t': '@pisca', 'face': 'confused', 'blend': 0.3}])],
  camera=cam('close', 'rafa', 10), overlays=[{'type': 'stopwatch', 'from': '0:30', 'at': 0.1, 'corner': 'bc'}], sfx=[{'t': '@pisca', 'name': 'chime'}])
S('y6', 'stadium', 'Eu perdi a prova?', who='male', variant=1,
  actors=[A('rafa', 'midfield', 30, 'shrug', 'confused', talk=TALK)], camera=cam('medium', 'rafa', -20))
S('y7', 'stadium', 'Trinta segundos de sol. É a cura.', variant=1,
  actors=[A('hero', 'midfield+-3,0,3', 150, 'stand', 'awe')], camera=cam('xclose', 'hero', 0, height=-8, move='pushIn'), sfx=[{'t': '@cura', 'name': 'swell'}])
S('y8', 'cafeteria', 'Você e o Davi treinam: levar grupos pequenos pro sol, usando o som. [deadpan] O Davi já cobra cinco reais por zumbi curado.', variant=1,
  actors=[A('hero', [-1.6, 0, 4.4], 120, 'holdOut', 'determined', hold={'R': 'phone'}), A('bestie', [-2.6, 0, 4.0], 110, 'thinking', 'focused', look='hero')],
  camera=cam('medium', 'hero', -15))
S('y9', 'cafeteria', 'Primeira vez: o celular toca baixo demais. Eles param no bebedouro.', variant=1,
  actors=[Z('zA', [0.4, 0, 0.0], 0, path=walk([0.4, 0, 0.0], [0.4, 0, 1.2], 0.2, 2.4)), Z('zC', [-0.4, 0, -0.4], 0, path=walk([-0.4, 0, -0.4], [-0.5, 0, 0.8], 0.2, 2.4)),
          A('hero', [0.0, 0, 4.4], 180, 'holdOut', 'confused', hold={'R': 'phone'})],
  camera={'pos': [3.4, 1.6, 6.4], 'look': [0.0, 1.0, 1.4], 'fov': 42}, sfx=[{'t': '@baixo', 'name': 'ring', 'dur': 1.2, 'vol': -14}, {'t': '@bebedouro', 'name': 'pop'}])
S('y10', 'stadium', 'Segunda: você anda rápido demais, e eles perdem o som.', variant=1,
  actors=[A('hero', 'midfield+-6,0,8', 150, 'stand', 'determined', hold={'R': 'phone'}, path=[{'t': 0.3, 'pos': 'midfield+-6,0,8'}, {'t': 2.2, 'pos': 'midfield+-2,0,2', 'gait': 'jog'}]),
          Z('zA', 'midfield+-7.6,0,11', 150, path=walk('midfield+-7.6,0,11', 'midfield+-6.9,0,9.8', 0.2, 2.2)),
          Z('zC', 'midfield+-8.6,0,10.2', 150, path=walk('midfield+-8.6,0,10.2', 'midfield+-8.0,0,9.2', 0.2, 2.2))],
  camera=cam('wide', 'hero', 60, height=10), sfx=[{'t': '@perdem', 'name': 'pop'}])
S('y11', 'stadium', 'Terceira: devagar. Sempre um passo na frente deles. Até o sol.', variant=1,
  actors=[A('hero', 'midfield+-4,0,6', -30, 'holdOut', 'focused', hold={'R': 'phone'}, strafe=True,
            path=[{'t': 0.2, 'pos': 'midfield+-4,0,6'}, {'t': 5.5, 'pos': 'midfield+-1.6,0,2.2', 'gait': 'walk'}]),
          Z('zA', 'midfield+-5.2,0,7.6', 150, path=walk('midfield+-5.2,0,7.6', 'midfield+-2.8,0,3.8', 0.2, 5.5)),
          Z('zC', 'midfield+-4.2,0,8.4', 150, path=walk('midfield+-4.2,0,8.4', 'midfield+-1.8,0,4.6', 0.2, 5.5))],
  camera=cam('wide', 'hero', 90, height=12, move='track'), sfx=[{'t': 0.2, 'name': 'ring', 'dur': 3.0, 'vol': -8}])
C('y12', 'chain', 'Cinco acordados. Depois doze. Depois vinte e três.', title='ACORDADOS',
  nodes=[{'icon': 'check', 'label': '5'}, {'icon': 'check', 'label': '12'}, {'icon': 'check', 'label': '23'}], step=1.75)
C('y13', 'rules', 'Sua regra: não lute. Leve pra fora.', title='A SUA REGRA', prefix='REGRA', rules=['NÃO LUTE.', 'LEVE PRA FORA.'], current=0)

# ---------------------------------------------------------------- 11. crise
WOKEN = [A(f'w{k}', p, r, FLOORSIT, f) for k, (p, r, f) in enumerate([('midfield+-2,0,2', 20, 'confused'), ('midfield+1,0,1', -30, 'tired'), ('midfield+-0.5,0,-1.5', 160, 'happy'), ('midfield+2.4,0,-0.6', -100, 'confused')], 1)]
S('z1', 'stadium', 'Por uma hora, funciona.', variant=1,
  actors=WOKEN + [A('hero', 'midfield+0.2,0,3.4', 170, 'confident', 'smile')], camera=cam('wide', 'hero', 10, height=14, move='craneUp'))
S('z2', 'classroom', 'Até você olhar o relógio da parede. Onze e cinquenta e seis.', variant=0,
  actors=[A('hero', 'aisle', -90, 'stand', 'shocked')], camera=cam('close', 'hero', 40, height=-6), sfx=[{'t': '@onze', 'name': 'ticks', 'dur': 1.4}])
S('z3', 'classroom', 'O sinal do meio-dia é o mais longo do dia. E a caixa de som dele fica na parede desta sala.', variant=0, props=[BELL_CLS],
  camera={'pos': [-0.6, 1.6, 0.6], 'look': [-2.4, 2.4, -4.85], 'fov': 36, 'move': 'pushIn'})
S('z4', 'classroom', 'Onde estão quarenta alunos. A diretora. E a sua irmã.', variant=0,
  actors=[A('sister', 'seat1', -90, 'sit', 'scared'), A('celia', 'front+0.4,0,0.6', 90, 'armsCrossed', 'worried')],
  camera=cam('close', 'sister', -20, move='pushIn'))
S('z5', 'cafeteria', 'No refeitório ao lado, quase quatrocentos zumbis. Parados. Esperando um som.', variant=1,
  actors=[Z(i, p, r) for i, p, r in [('zA', [-0.4, 0, -2.6], 0), ('zB', [0.6, 0, -1.6], 10), ('zC', [-0.5, 0, -0.4], -5), ('zD', [0.5, 0, 0.8], 0),
                                       ('zE', [-0.6, 0, 2.0], 15), ('zF', [0.7, 0, 3.0], -10), ('jorge', [2.2, 0, 3.4], -20), ('rafa2', [-2.2, 0, 3.3], 20)]]
         + horde(crowd(12, -5.0, 5.0, -4.6, 4.6, seed=11, gap=0.95, keep=[(-0.4, -2.6), (0.6, -1.6), (-0.5, -0.4), (0.5, 0.8), (-0.6, 2.0), (0.7, 3.0), (2.2, 3.4), (-2.2, 3.3)] + [(x, z) for x in (-3, -2, -1.4, 1.4, 2, 3, 4, -4) for z in (-3.2, -0.8, 1.6)]), rot=0),
  camera={'pos': [0.1, 1.4, 8.4], 'look': [0, 1.1, -1], 'fov': 34, 'move': 'pushIn'}, sfx=[{'t': 0.3, 'name': 'groanLow'}])
S('z6', 'classroom', 'Quatro minutos até o sinal.', variant=0,
  actors=[A('hero', 'aisle', -90, 'stand', 'scared')], camera=cam('xclose', 'hero', 15, height=-8),
  overlays=[dict(CD)], sfx=[{'t': '@quatro', 'name': 'heartbeat'}])

# ---------------------------------------------------------------- 12. dilema
S('d1', 'classroom', 'Pra tirar quatrocentos zumbis do prédio, você precisa de um som mais alto que o sinal. Lá fora. No sol.', variant=0,
  actors=[A('hero', 'aisle', -60, 'thinking', 'focused')], camera=cam('medium', 'hero', -30), overlays=[dict(CD)])
C('d2', 'compare', 'Um sinal de escola faz uns noventa e cinco decibéis. Um apito de juiz, cento e quinze.',
  title='O SOM MAIS ALTO', unit='DB', left={'label': 'SINAL', 'value': 95, 'icon': 'clock'}, right={'label': 'APITO', 'value': 115, 'icon': 'lightning'},
  ratio=False, at='@apito', overlays=[dict(CD)])
C('d3', 'stat', 'E cada dez decibéis a mais é dez vezes mais energia. Vinte a mais: cem vezes.',
  value=100, unit='×', label='MAIS ENERGIA QUE O SINAL', icon='lightning', overlays=[dict(CD)])
S('d4', 'classroom', 'O apito está no seu bolso. Só que o som mais alto do campo vai ser você. Quatrocentos zumbis vindo na sua direção. E basta um encostar.', variant=0,
  actors=[A('hero', 'aisle', -60, 'holdOut', 'worried', hold={'R': 'whistle'})], camera=cam('close', 'hero', 20, move='pushIn'), overlays=[dict(CD)])
S('d5', 'classroom', 'Você vai apitar pra quatrocentos zumbis?', who='male', variant=0,
  actors=[A('bestie', 'seat3', 90, 'sit', 'scared', look='hero', talk=TALK)], camera=cam('close', 'bestie', 10), overlays=[dict(CD)])
S('d6', 'classroom', 'A sua escola... ou você.', hold=2.0, variant=0,
  actors=[A('hero', 'aisle', -60, 'stand', 'determined', hold={'R': 'whistle'})], camera=cam('xclose', 'hero', 0, move='pushIn'),
  overlays=[dict(CD)], fx={'vignette': 0.35})

# ---------------------------------------------------------------- 13. clímax
S('e1', 'classroom', 'Você não luta. Você leva pra fora.', variant=0,
  actors=[A('hero', 'aisle', -60, 'determined', 'determined', hold={'R': 'whistle'}, path=[{'t': '@leva', 'pos': 'aisle'}, {'t': '@fora+0.8', 'pos': 'aisle+0,0,3.4', 'gait': 'run'}])],
  camera=cam('medium', 'hero', 5, height=14), overlays=[dict(CD)])
S('e2', 'stadium', 'Você corre pro meio do campo. Meio-dia. Sol a pino. A mesma hora das formigas.', variant=1,
  actors=[A('hero', 'midfield+-10,0,12', -20, 'stand', 'determined', hold={'R': 'whistle'}, path=[{'t': 0.1, 'pos': 'midfield+-10,0,12'}, {'t': 4.0, 'pos': 'midfield', 'gait': 'run'}])],
  camera=cam('wide', 'hero', 70, height=14, move='track'), overlays=[dict(CD)])
S('e3', 'stadium', 'Você apita. Uma vez.', variant=1,
  actors=[A('hero', 'midfield', -20, WHISTLE, 'determined', hold={'R': 'whistle'})], camera=cam('close', 'hero', 0, height=-12),
  overlays=[dict(CD)], sfx=[{'t': '@vez', 'name': 'whistle', 'dur': 1.0}])
HORDE1 = [('zA', 'midfield+-9,0,20', -9.6), ('zB', 'midfield+-6,0,21', -7.4), ('zC', 'midfield+-12,0,19', -6.0)]
S('e4', 'stadium', 'Os primeiros zumbis aparecem na beira do campo.', variant=1,
  actors=[A('hero', 'midfield', -20, WHISTLE, 'determined', hold={'R': 'whistle'})] + [Z(i, p, 160, path=walk(p, q, 0.0, 5)) for i, p, q in
          [('zA', 'midfield+-9,0,20', 'midfield+-7.2,0,15'), ('zB', 'midfield+-6,0,21', 'midfield+-4.8,0,16'), ('zC', 'midfield+-12,0,19', 'midfield+-9.6,0,14.6')]],
  camera={'pos': [2.6, 1.5, -2.6], 'look': [-6.5, 1.2, 15], 'fov': 19}, overlays=[dict(CD)], sfx=[{'t': 0.5, 'name': 'groanLow'}])
S('e5', 'stadium', 'Duas vezes. O bando vai atrás dos primeiros.', variant=1,
  actors=[A('hero', 'midfield', -20, WHISTLE, 'determined', hold={'R': 'whistle'})] +
         horde(crowd(10, -14, 6, 15, 23, seed=21, gap=1.4), rot=face_to(0, 0), to=(0, 0, 0.2), first=20) +
         [Z(i, p, 150, path=walk(p, f'midfield+{x * 0.75},0,{z * 0.75}', 0.0, 5)) for i, p, x, z in
          [('zA', 'midfield+-7.2,0,10.4', -7.2, 10.4), ('zB', 'midfield+-4.8,0,13.6', -4.8, 13.6), ('zC', 'midfield+-9.6,0,13', -9.6, 13), ('zD', 'midfield+-3,0,17', -3, 17),
           ('zE', 'midfield+-11,0,17', -11, 17), ('zF', 'midfield+-7,0,18', -7, 18)]],
  camera={'pos': [3.0, 3.2, -6.0], 'look': [-3.5, 0.8, 9.0], 'fov': 44}, overlays=[dict(CD)], sfx=[{'t': '@vezes', 'name': 'whistle', 'dur': 1.0}, {'t': '@bando', 'name': 'groanLow'}])
S('e6', 'stadium', 'Três vezes. Lá dentro, o sinal toca. Ninguém volta. O seu apito é mais alto.', variant=1,
  actors=[A('hero', 'midfield', -20, WHISTLE, 'furious', hold={'R': 'whistle'})], camera=cam('close', 'hero', -20, height=-10, move='crashIn'),
  overlays=[dict(CD)], sfx=[{'t': '@vezes', 'name': 'whistle', 'dur': 1.2, 'vol': -3}, {'t': '@toca', 'name': 'bell', 'dur': 2.5, 'vol': -14}])
RING = [('zA', -2.6, 4.2), ('zB', -0.4, 4.6), ('zC', -4.4, 2.4), ('zD', 1.6, 3.8), ('zE', -3.6, 5.6), ('zF', 0.8, 6.2), ('jorge', -1.6, 6.8), ('rafa2', 3.0, 5.4)]
S('e7', 'stadium', 'Quatrocentos zumbis no sol. Agora, trinta segundos.', variant=1,
  actors=[A('hero', 'midfield', -20, WHISTLE, 'determined', hold={'R': 'whistle'})] +
         [Z(i, f'midfield+{x * 1.6},0,{z * 1.6}', 150, path=walk(f'midfield+{x * 1.6},0,{z * 1.6}', f'midfield+{x * 1.25},0,{z * 1.25}', 0.0, 5)) for i, x, z in RING] +
         horde(crowd(30, -16, 10, 6, 24, seed=31, gap=1.3, keep=[(x * 1.6, z * 1.6) for _, x, z in RING]), rot=face_to(0, 0), to=(0, 0, 0.12), first=1),
  camera={'pos': [-15, 10, -9], 'look': [-2, 0.8, 7], 'fov': 40, 'move': 'drift'},
  overlays=[dict(CDS)], sfx=[{'t': 0.3, 'name': 'groanLow'}])
S('e8', 'stadium', 'Mas eles continuam vindo. Dez metros. Cinco.', variant=1,
  actors=[A('hero', 'midfield', -20, WHISTLE, 'scared', hold={'R': 'whistle'})] +
         [Z(i, f'midfield+{x * 2.2},0,{z * 2.2}', 150, path=walk(f'midfield+{x * 2.2},0,{z * 2.2}', f'midfield+{x * 0.5},0,{z * 0.5}', 0.0, 3.4)) for i, x, z in RING[:6]],
  camera={'over': 'hero', 'shot': 'medium', 'target': 'zB', 'dist': 1.7}, overlays=[dict(CDS)], sfx=[{'t': '@cinco', 'name': 'heartbeat'}])
TOUCH = Z('zB', 'midfield+0.12,0,0.66', 175, contact=True, pose={'hipY': -0.01, 'spine': [8, 0, 0], 'head': [12, 0, 14], 'armL': [55, 8, 0, 14], 'armR': [88, -6, 0, 8], 'handL': 'open', 'handR': 'open'})
S('e9', 'stadium', 'Um dedo encosta no seu ombro.', variant=1,
  actors=[A('hero', 'midfield', -20, WHISTLE, 'shocked', hold={'R': 'whistle'}, contact=True), TOUCH],
  camera=cam('medium', 'hero', 85), overlays=[dict(CDS)], sfx=[{'t': '@ombro', 'name': 'subdrop'}])
S('e10', 'stadium', 'E o verde sobe pelo seu braço. Dez segundos.', variant=1,
  actors=[A('hero', 'midfield', -20, WHISTLE, 'tired', hold={'R': 'whistle'}, glow=GREEN, contact=True), TOUCH],
  camera=cam('close', 'hero', -40, move='pushIn'), overlays=[dict(CDS)], sfx=[{'t': '@verde', 'name': 'glint'}])
S('e11', 'stadium', 'Você continua apitando. Até esquecer por quê.', hold=1.0, variant=1,
  actors=[A('hero', 'midfield', -20, WHISTLE, 'zombie', hold={'R': 'whistle'}, glow=GREEN)],
  camera=cam('xclose', 'hero', 0, height=-6, move='pushIn'), overlays=[dict(CDS)],
  sfx=[{'t': 0.2, 'name': 'whistle', 'dur': 1.0, 'vol': -4}, {'t': '@esquecer', 'name': 'whistle', 'dur': 0.6, 'vol': -12}], fx={'vignette': 0.45})
S('e12', 'stadium', 'Você acorda na grama. Sol na cara. Quatrocentos alunos piscando, confusos.', variant=1, cut='dip',
  actors=[A('hero', 'midfield', -20, 'lie', 'closed', faces=[{'t': '@acorda', 'face': 'confused', 'blend': 0.3}], poses=[{'t': '@sol', 'pose': FLOORSIT, 'blend': 0.8}])] +
         horde(crowd(16, -7, 5, 1.6, 9, seed=41, gap=1.1), rot=face_to(0, 0), pose='stand', face='confused', glow=None, first=1),
  camera={'pos': [3.4, 4.2, -5.2], 'look': [-0.8, 0.5, 2.4], 'fov': 42, 'move': 'craneUp'}, sfx=[{'t': '@acorda', 'name': 'swell'}])
S('e13', 'stadium', 'Seu celular está no chão. Pisado por oitocentos pés.', variant=1,
  props=[{'type': 'phone', 'pos': 'midfield+1.4,0.01,1.2', 'rot': [-1.57, 0, 0.8], 'broken': True}],
  camera={'pos': [1.0, 0.55, 2.0], 'look': [1.4, 0.0, 1.2], 'fov': 30}, sfx=[{'t': '@pisado', 'name': 'debris'}])

# ---------------------------------------------------------------- 14. consequência
S('f1', 'stadium', 'Você tá com cheiro de cogumelo.', who='female', variant=1,
  actors=[A('sister', 'midfield+0.6,0,1.0', -150, 'armsCrossed', 'suspicious', look='hero', talk=TALK), A('hero', 'midfield', -20, FLOORSIT, 'tired', look='sister')],
  camera=cam('close', 'sister', 10))
S('f2', 'stadium', 'Quem estava apitando no recreio?', who='adulto', variant=1,
  actors=[A('jorge', 'midfield+-1.1,0,1.2', 140, 'armsCrossed', 'angry', talk=TALK, look='hero'), A('hero', 'midfield', -20, FLOORSIT, 'embarrassed', look='jorge')],
  camera=cam('medium', 'jorge', 20))
S('f3', 'stadium', 'Você devolve o apito. [deadpan] Ele te devolve uma advertência.', variant=1,
  actors=[A('hero', 'midfield', -20, FLOORSIT, 'embarrassed', hold={'R': 'whistle'}, look='jorge', contact=True,
            poses=[{'t': '@devolve', 'pose': dict(FLOORSIT, armR=[70, 10, 0, 10], handR='fist')}]),
          A('jorge', 'midfield+-0.35,0,1.05', 160, {'spine': [22, 0, 0], 'head': [18, 0, 0], 'armR': [55, -8, 0, 20], 'handR': 'open'}, 'suspicious', look='hero', contact=True)],
  camera=cam('full', ['hero', 'jorge'], -100, height=8))
NEWS1 = 'ESCOLA FECHA POR UM DIA. MOTIVO OFICIAL: MOFO'
NEWS2 = 'ALUNO LEVA SUSPENSÃO POR APITAR NO RECREIO'
S('f4', 'home', 'No jornal da noite, a escola fecha por um dia. Motivo oficial: mofo.', time='interiorNight',
  actors=[A('mom', 'couch', 90, 'sit', 'surprised'), A('hero', 'couch+0,0,0.9', 90, 'sit', 'tired')],
  camera={'pos': [4.0, 1.35, 1.3], 'look': [1.75, 1.0, 0.05], 'fov': 40}, overlays=[{'type': 'news', 'headline': NEWS1, 'tag': 'URGENTE', 'at': 0.4, 'safe': True}])
S('f5', 'home', 'E o vídeo de um aluno viraliza. O título: aluno leva suspensão por apitar no recreio.', time='interiorNight',
  actors=[A('mom', 'couch', 90, 'sit', 'suspicious', look='hero'), A('hero', 'couch+0,0,0.9', 90, 'sit', 'embarrassed')],
  camera={'pos': [3.7, 1.3, 0.2], 'look': [1.75, 1.0, 0.25], 'fov': 38, 'move': 'pushIn'}, overlays=[{'type': 'news', 'headline': NEWS2, 'tag': 'VIRAL', 'at': '@viraliza', 'safe': True}])
S('f6', 'home', 'Suspenso? [pause] E o vídeo tem quantas visualizações?', who='adulta', time='interiorNight',
  actors=[A('mom', 'couch', 90, 'sit', 'confused', look='hero', talk=[[0.05, 4.0]], faces=[{'t': '@vídeo', 'face': 'smug', 'blend': 0.3}])], camera={'pos': [3.0, 1.15, -0.9], 'look': [1.75, 1.05, -0.4], 'fov': 34})
S('f7', 'home', 'Dois milhões.', time='interiorNight',
  actors=[A('hero', 'couch+0,0,0.9', 90, 'sit', 'tired', look='mom', talk=[[0.05, 1.2]])], camera={'pos': [3.0, 1.15, 1.2], 'look': [1.75, 1.05, 0.5], 'fov': 34})
S('f8', 'home', 'Ótimo. Amanhã a gente vende camiseta. Agora vai tomar banho, você tá com cheiro de cogumelo.', who='adulta', time='interiorNight',
  actors=[A('mom', 'couch', 90, 'sit', 'smug', look='hero', talk=[[0.05, 6.0]]), A('hero', 'couch+0,0,0.9', 90, 'sit', 'embarrassed')],
  camera={'pos': [4.0, 1.35, 1.3], 'look': [1.75, 1.0, 0.05], 'fov': 40})
S('f9', 'bedroom', 'De manhã, você jogou o celular longe pra fugir de um zumbi. De tarde, você chamou quatrocentos pra perto.', time='interiorNight',
  actors=[A('hero', 'window+0,0,0.6', 0, 'stand', 'smile')], camera=cam('medium', 'hero', 15, move='pushIn'))  # back to the night window, facing us

# ---------------------------------------------------------------- 15. mundo maior
S('g1', 'home', 'Mas naquela noite, você assiste o vídeo de novo. Quadro por quadro.', time='interiorNight',
  actors=[A('hero', 'couch+0,0,0.9', 90, 'sit', 'focused', hold={'R': 'phone'})], camera={'pos': [3.0, 1.2, 1.4], 'look': [1.75, 1.0, 0.5], 'fov': 36, 'move': 'pushIn'})
S('g2', 'stadium', 'No fundo da imagem, do lado de fora do campo, tem um homem de capa de chuva amarela. Num dia de sol.', variant=1,
  actors=[A('estranho', 'midfield+-10,0,20', 170, 'stand', 'neutral', hold={'R': 'jar'})] +
         [A(i, f'midfield+{x},0,{z}', r, 'stand', 'confused') for i, x, z, r in [('zA', -3.4, 4.6, 160), ('zC', -4.6, 2, 120), ('zD', 1.5, 3.6, 200)]],
  camera={'pos': [2, 1.6, -4], 'look': [-8, 1.4, 18], 'fov': 34}, fx={'grade': 'flashback'})
S('g3', 'stadium', 'Todo mundo olha pros zumbis. Ele olha pra você.', variant=1,
  actors=[A('estranho', 'midfield+-10,0,20', 170, 'stand', 'neutral', hold={'R': 'jar'}, look=[0, 1.0, 0])],
  camera=cam('close', 'estranho', 10, move='pushIn'), fx={'grade': 'flashback'})
S('g4', 'stadium', 'E na mão dele, um pote. O pote da professora Helena. Vazio.', variant=1,
  actors=[A('estranho', 'midfield+-10,0,20', 170, {'armR': [55, 8, 0, 60], 'handR': 'fist'}, 'neutral', hold={'R': 'jar'}, look=[0, 1.0, 0])],
  camera=cam('medium', 'estranho', -20, focus='handR'), fx={'grade': 'flashback'}, sfx=[{'t': '@vazio', 'name': 'subdrop'}])
S('g5', 'classroom', 'Alguém viu o meu pote?', who='adulta', variant=1,
  props=LAB[2:], actors=[A('helena', 'teacher+0.3,0,0.9', 100, 'shrug', 'worried', talk=TALK)],
  camera={'pos': [-2.4, 1.6, 4.0], 'look': [-4.6, 1.3, 3.0], 'fov': 34})
C('g6', 'icon', 'No armário dela, sobrou só a etiqueta. Amostra dois de cinco.', icon='warning', caption='AMOSTRA 2 DE 5', sub='FUNGO DAS FORMIGAS')
S('g7', 'bedroom', 'Dois de cinco. Então existem mais três. Em algum lugar.', time='interiorNight',
  actors=[A('hero', 'window', 0, 'stand', 'worried')], camera=cam('xclose', 'hero', 10, move='pushIn'))

# ---------------------------------------------------------------- 16. gancho final
STRANGER_DAY = 'farSidewalk+1,0,0.4'
S('h1', 'suburb', 'Na saída da escola, você vê ele de novo. Do outro lado da rua. No sol do meio-dia.',
  actors=[A('estranho', STRANGER_DAY, 180, 'stand', 'neutral'), A('hero', 'sidewalk', 0, 'stand', 'worried', look='estranho')],
  camera={'over': 'hero', 'shot': 'medium', 'target': 'estranho', 'dist': 1.7})
S('h2', 'suburb', 'Ele levanta o rosto. E brilha. Verde.',
  actors=[A('estranho', STRANGER_DAY, 180, 'stand', 'neutral', glow=GREEN, look='hero')], camera=cam('close', 'estranho', 0, move='pushIn'),
  sfx=[{'t': '@verde', 'name': 'subdrop'}])
S('h3', 'suburb', 'Ele está no sol faz muito mais que trinta segundos. E não cura. Não geme. Anda normal.',
  actors=[A('estranho', STRANGER_DAY, 90, 'stand', 'neutral', glow=GREEN, path=[{'t': '@anda', 'pos': STRANGER_DAY}, {'t': '@normal+2', 'pos': 'farSidewalk+4,0,0.4', 'gait': 'walk'}])],
  camera=cam('full', 'estranho', 40, move='track'))
S('h4', 'suburb', '[menacing] Trinta segundos. Bom saber.', who='adulto',
  actors=[A('estranho', 'farSidewalk+4,0,0.4', 180, 'stand', 'smirk', glow=GREEN, look='camera', talk=TALK)], camera=cam('xclose', 'estranho', 0))
S('h5', 'suburb', '[menacing] Um zumbi que pensa. E agora, ele conhece as suas regras.', hold=1.2,
  actors=[A('hero', 'sidewalk', 0, 'stand', 'scared')], camera=cam('xclose', 'hero', 10, move='pushIn'),
  fx={'vignette': 0.5}, sfx=[{'t': '@regras', 'name': 'subdrop'}])

# ---------------------------------------------------------------- 17. CTA
S('i1', 'suburb', 'Então: o que você faria primeiro numa escola só sua? E o homem da capa amarela: ele trouxe o fungo... ou está fugindo dele? Conta pra gente nos comentários. Todo poder tem um preço. Até a próxima.',
  time='golden', actors=[A('hero', 'sidewalk', 10, 'confident', 'smirk', hold={'R': 'whistle'})],
  camera=cam('wide', 'hero', 30, height=5, move='pullOut'),
  overlays=[{'type': 'title', 'small': 'O QUE VOCÊ FARIA PRIMEIRO?', 'big': 'ELE TROUXE O FUNGO?', 'at': '@capa'}])

# ---------------------------------------------------------------- estilo novo (2026-11-08): ritmo, destaques, cortes
# Same voice as before (no vo text changes here): only cuts, sub-cuts and 2D overlays.
by_id = {s['id']: s for s in shots}
# smash cuts on reveals / punchlines (set by hand; apply_ritmo leaves explicit cuts alone)
for sid in ('x6', 'e9', 'h2', 'k9'):
    by_id[sid]['cut'] = 'smash'
# the dilemma breathes: calm sub-cuts; the held decision and the fade-out stay one take
for sid in ('d1', 'd4', 'd5'):
    by_id[sid]['coverage'] = 'calm'
for sid in ('d6', 'e11', 'h5', 'x9', 'x5', 'g1', 'p4', 'm5', 'p8', 'r3', 'r4', 'r6', 'k3', 'k6', 'c4', 'f9', 'i1', 'q3', 'f3'):  # x9: tight hiding close; x5: framed on the speaker box; g1: orbit shows his nape; p4: punch-in centres Jorge's back
    by_id[sid]['coverage'] = 'off'
# palavra-destaque: the key word pops in on its cue, inside the 9:16 centre column
WORDS = {
    'c4': [('VERDE', '@verde')],
    's9': [('50 MINUTOS', '@cinquenta')],
    'p7': [('10 SEGUNDOS', '@dez')],
    'r4': [('EDUCADO DEMAIS', '@educado', {'color': 'white'})],
    'k2': [('3 SOBREMESAS', '@três')],
    'q3': [('6 ISCAS', '@seis')],
    'x7': [('150 ZUMBIS', '@cento')],
    'z2': [('11:56', '@onze', {'color': 'red'})],
    'z5': [('400 ZUMBIS', '@quatrocentos')],
    'e7': [('30 SEGUNDOS', '@trinta', {'y': 'top'})],  # the sun clock sits bottom-centre
    'h5': [('QUE PENSA', '@pensa')],
}
for sid, ws in WORDS.items():
    for w in ws:
        by_id[sid].setdefault('overlays', []).append({'type': 'word', 'text': w[0], 'at': w[1], **(w[2] if len(w) > 2 else {})})
apply_ritmo(shots)

# ---------------------------------------------------------------- episode
idx = {s['id']: i for i, s in enumerate(shots)}
assert len(idx) == len(shots), 'duplicate shot ids'
ZOMB = [('zA', 'hoodie', '#3d6fb6', None), ('zB', 'jacket', '#e2b23f', 'bun'), ('zC', 'tee', '#d77fc0', 'ponytail'), ('zD', 'tee', '#2fa6a0', 'curly'),
        ('zE', 'hoodie', '#e8735a', None), ('zF', 'jacket', '#7a5cc8', 'spiky'), ('rafa2', 'tee', '#c8402f', 'bob')]
cast = {
    'bestie': {'name': 'Davi'},
    'sister': {'name': 'Nina'},
    'rafa': {'name': 'Rafa', 'top': 'jacket', 'topColor': '#6b4a35', 'accent': '#1b1b20', 'bottom': 'pants', 'bottomColor': '#1b1b20', 'shoes': '#e8e4da', 'hair': 'spiky'},
    'helena': {'name': 'Professora Helena', 'top': 'coat', 'topColor': '#f3f1ea', 'accent': '#d9e6f2', 'bottom': 'pants', 'bottomColor': '#3a4256', 'shoes': '#2b2622', 'glasses': True, 'glassesColor': '#7fc3f0', 'hair': 'curly'},
    'jorge': {'name': 'Seu Jorge', 'top': 'jacket', 'topColor': '#2b3a5c', 'accent': '#ffffff', 'bottom': 'pants', 'bottomColor': '#1f2433', 'shoes': '#ffffff', 'hat': 'cap', 'hatColor': '#1f2433'},
    'celia': {'name': 'Dona Célia', 'top': 'suit', 'topColor': '#6b5a48', 'accent': '#a3242c', 'bottom': 'skirt', 'bottomColor': '#3a3430', 'shoes': '#2b2622', 'glasses': True, 'glassesColor': '#9fd3f2', 'hair': 'bun'},
    'kid': {'name': 'Menino do primeiro ano'},
    'mom': {'name': 'Mãe'},
    'estranho': {'name': 'Homem da capa amarela', 'top': 'coat', 'topColor': '#f2c53c', 'accent': '#fff3d6', 'bottom': 'pants', 'bottomColor': '#1d2333', 'shoes': '#2b2622'},
    **{z: {'top': top, 'topColor': c, 'accent': '#f4ead6', 'bottom': 'pants', 'bottomColor': '#2c3e63', 'shoes': '#ffffff', **({'hair': h} if h else {})} for z, top, c, h in ZOMB},
    **{f'x{k:02d}': {'top': ['hoodie', 'jacket', 'tee'][k % 3], 'topColor': ['#3d6fb6', '#e2b23f', '#d77fc0', '#2fa6a0', '#e8735a', '#7a5cc8', '#c8402f', '#6b4a35', '#4a9fd8', '#d9a441'][k % 10],
                    'bottom': 'pants', 'bottomColor': ['#2c3e63', '#3a3430', '#1d2333'][k % 3], 'shoes': '#ffffff', **({'hair': ['bun', 'ponytail', 'curly', 'spiky', 'bob'][k % 5]} if k % 2 else {})} for k in range(1, 41)},
    **{f'w{k}': {'top': 'tee', 'topColor': c, 'bottom': 'pants', 'bottomColor': '#2c3e63', 'shoes': '#ffffff'} for k, c in enumerate(['#3d6fb6', '#e2b23f', '#d77fc0', '#2fa6a0'], 1)},
}
ep = {
    'slug': SLUG,
    'hookCheck': False,  # made before the first-10-s hook rule (2026-11-09); the user chose not to apply it here
    'title': 'E Se Você Salvasse Sua Escola de Uma Invasão Zumbi?',
    'voice': {'id': 'u7N1p4OIOc6Fl7y72WE7', 'model': 'eleven_v4'},
    'voices': {'adulto': 'u4sbCzXyUVxIAihOtCss', 'adulta': 'dxIMMSJYSsbUSMhioLNb'},
    'cast': cast,
    'music': [
        {'shot': idx['c1'], 'mood': 'curious'},
        {'shot': idx['c10'], 'mood': 'tension'},
        {'shot': idx['m3'], 'mood': 'curious'},
        {'shot': idx['k1'], 'mood': 'curious'},
        {'shot': idx['x1'], 'mood': 'tension'},
        {'shot': idx['y1'], 'mood': 'wonder'},
        {'shot': idx['z2'], 'mood': 'tension'},
        {'shot': idx['e1'], 'mood': 'action'},
        {'shot': idx['e12'], 'mood': 'wonder'},
        {'shot': idx['f4'], 'mood': 'curious'},
        {'shot': idx['g1'], 'mood': 'tension'},
        {'shot': idx['h5'], 'mood': 'none'},
        {'shot': idx['i1'], 'mood': 'curious'},
    ],
    'shots': shots,
    # ≥ 4 self-contained ~90 s shorts the user cuts by hand (cold hook in, punch/cliffhanger out)
    'clips': [{'title': t, 'from': a, 'to': b} for t, a, b in [
        ('Meu colega virou zumbi no meio da prova', 'c1', 'm7'),
        ('Esse fungo zumbi existe de verdade', 's1', 'p8'),
        ('As 3 regras pra sobreviver aos zumbis', 'r1', 'k10'),
        ('O som mais alto da escola', 'q1', 'x9'),
        ('400 zumbis e um apito', 'z1', 'e12'),
        ('O homem da capa amarela', 'f4', 'h5'),
    ]],
}


def resolve_countdowns():
    """Turn CD/CDS markers into live countdowns that line up across cuts (story time runs faster than screen time)."""
    tp = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'episodes', SLUG, 'timing.json')
    tm = json.load(open(tp, encoding='utf-8')) if os.path.exists(tp) else None
    if not tm or len(tm['shots']) != len(shots):
        for sh in shots:
            for o in sh.get('overlays', []):
                if o.pop('cd', None):
                    o['from'] = '4:00'
        return

    def wt(sid, word):
        sh = tm['shots'][idx[sid]]
        return sh['start'] + next(t for w, t in sh['words'] if w == word)

    # both clocks sit bottom-centre (9:16 column, off the faces); they never overlap in time
    # y5: 0:30 runs down to 0:00 on "pisca"
    y5 = shots[idx['y5']]['overlays'][0]
    y5['tick'] = round(30 / max(0.5, wt('y5', 'pisca') - tm['shots'][idx['y5']]['start'] - 0.1), 3)
    clocks = {'bell': (wt('z6', 'quatro'), wt('e6', 'toca'), 240, 'bc', 'e6'),
              'sun': (wt('e7', 'trinta'), tm['shots'][idx['e11']]['start'] + tm['shots'][idx['e11']]['dur'], 30, 'bc', 'e11')}
    for i, sh in enumerate(shots):
        for o in sh.get('overlays', []):
            kind = o.pop('cd', None)
            if not kind:
                continue
            t0, t1, total, corner, last = clocks[kind]
            rate = total / (t1 - t0)
            st = tm['shots'][i]['start']
            begin = max(st, t0)
            left = max(0.0, total - (begin - t0) * rate)
            o.update({'from': f'{int(left // 60)}:{int(round(left % 60)) % 60:02d}' if round(left % 60) < 60 else f'{int(left // 60) + 1}:00',
                      'tick': round(rate, 3), 'corner': corner, 'keep': sh['id'] != last})
            if st < t0:
                o['at'] = round(t0 - st, 3)
            else:
                o['persist'] = True


resolve_countdowns()


def clean(o):
    """Drop None values (e.g. glow=None on a zombie that isn't glowing yet)."""
    if isinstance(o, dict):
        return {k: clean(v) for k, v in o.items() if v is not None}
    if isinstance(o, list):
        return [clean(v) for v in o]
    return o


out = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'episodes', SLUG, 'episode.json')
os.makedirs(os.path.dirname(out), exist_ok=True)
with open(out, 'w', encoding='utf-8') as f:
    json.dump(clean(ep), f, ensure_ascii=False, indent=1)
words = sum(len(s.get('vo', '').split()) for s in shots)
print(f'{len(shots)} shots, {words} words -> {os.path.normpath(out)}')
