# Source of public/episodes/menu-corpo/episode.json — edit HERE, then run:
#   .venv/Scripts/python -I tools/episodes/menu_corpo.py
# 15-min "E Se" (extended structure, STORY_BLUEPRINT §4.3 stretched): a body-settings menu with four sliders
# (DOR, SONO, MEDO, FORÇA). Theme rule: "NUNCA ZERO. SÓ MAIS BAIXO." Climax on the frozen park pond (park variant 1 = winter).
# No music: the user adds background tracks in their editor (2026-11-09).
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # python -I drops the script dir
from kit import *  # noqa: E402,F401,F403

SLUG = 'menu-corpo'
TITLE = 'E Se Você Encontrasse um Menu de Configurações do Seu Corpo?'


def M(rows, at=0.2, **kw):
    """Body-settings menu overlay. rows: (label, value) | (label, from, to, cue) | dicts."""
    out = []
    for r in rows:
        if isinstance(r, dict):
            out.append(r)
        elif len(r) == 2:
            out.append({'label': r[0], 'value': r[1]})
        else:
            d = {'label': r[0], 'from': r[1], 'value': r[2], 'at': r[3]}
            if len(r) > 4:
                d.update(r[4])
            out.append(d)
    o = {'type': 'menu', 'rows': out, 'at': at, 'y': 'low'}  # low: under the faces; shots with the bottom-centre clock pass y='top'
    o.update(kw)
    return o


def W(text, at, **kw):
    """Palavra-destaque."""
    d = {'type': 'word', 'text': text, 'at': at}
    d.update(kw)
    return d


FACTORY = [('DOR', 100), ('SONO', 100), ('MEDO', 100), ('FORÇA', 60)]
PRONE = {'hipY': -0.86, 'body': [88, 0, 0], 'head': [-55, 0, 0], 'armL': [165, 14, 0, 20], 'armR': [165, 14, 0, 20], 'legL': [4, 6, 6], 'legR': [4, 6, 6], 'handL': 'open', 'handR': 'open'}
PRONE_REACH = {**PRONE, 'armR': [178, 4, 0, 0], 'armL': [150, 24, 0, 30]}
FLOORSIT = {'hipY': -0.71, 'spine': [8, 0, 0], 'legL': [88, 8, 8], 'legR': [86, 8, 14], 'armL': [-25, 20, 0, 10], 'armR': [-25, 20, 0, 10], 'handL': 'open', 'handR': 'open'}
FOURS = {'hipY': -0.5, 'spine': [72, 0, 0], 'head': [-55, 0, 0], 'armL': [80, 10, 0, 5], 'armR': [60, 10, 0, 5], 'legL': [95, 8, 100], 'legR': [80, 8, 105], 'handL': 'open', 'handR': 'open'}
FOURS_B = {**FOURS, 'armL': [60, 10, 0, 5], 'armR': [80, 10, 0, 5], 'legL': [80, 8, 105], 'legR': [95, 8, 100]}
TREAD = {'armL': [120, 50, 0, 30], 'armR': [120, 50, 0, 30], 'head': [-20, 0, 0], 'handL': 'open', 'handR': 'open'}
SHAKE_HAND = {'armR': [55, 4, 0, 30], 'handR': 'open'}

# --- places
ROAD = [0, 0, -1.4]                 # suburb: hero mid-crossing (faces +z = across the road)
CURB = [0, 0.1, -4.4]
KIDPOS = [2.2, 0.1, 4.6]
SHORE = [-11.6, 0, -9.0]            # park (winter): near shore of the frozen pond
ICE = [-15.5, 0.04, -12.6]          # where Ivy breaks through
ICE_MID = [-13.6, 0.04, -10.9]      # halfway out
ICE_NEAR = [-14.55, 0.04, -11.75]   # the hero's head end when he reaches her
TO_ICE = -133                       # rot from the shore to the ice
TO_SHORE = 47
IN_BED = [-2.55, 0, -2.75]           # bedroom: lying in the bed (sleep pose, rot 0 = head to the headboard)
BED_EDGE = [-1.95, 0, -2.1]         # sitting on the bed's edge, facing +x
DESK1 = [-0.42, 0.79, 1.7]          # classroom: desk in front of seat1
BUCKET = {'type': 'box', 'pos': DESK1, 'w': 0.28, 'h': 0.16, 'd': 0.28, 'color': '#5d9bd1'}
HAND_IN = {'reachR': {'to': [0.02, 0.88, 0.58]}, 'spine': [16, 0, 0], 'hipY': -0.46, 'legL': [88, 6, 92], 'legR': [88, 6, 92]}
ENF = {'type': 'sign', 'pos': [-5.92, 2.1, 0.8], 'rot': 90, 'w': 1.3, 'h': 0.34, 'text': 'ENFERMARIA', 'bg': '#f6f2e8', 'fg': '#c8402f'}
POSTIT = {'type': 'sign', 'pos': [-0.85, 1.55, -3.96], 'rot': 0, 'w': 0.5, 'h': 0.42, 'text': 'NUNCA ZERO', 'bg': '#ffe36b', 'fg': '#1d2333'}
CRACKS = {'type': 'iceHole', 'pos': ICE, 'cracks': True, 'size': 0.6}

RULES = ['SÓ ABRE NUM ALARME DE VERDADE', 'TODA MUDANÇA DESEQUILIBRA OUTRA', 'NÃO CRIA NADA, SÓ MEXE NO QUE É SEU']

# ================================================================ 1. abertura fria (0:00–0:30)
# hooks: disaster in progress (car) + impossible image (frozen world + floating menu) + unexplained oddity (the "loan")
S('a1', 'suburb', 'Você atravessa a rua olhando o celular.',
  actors=[A('hero', [0, 0, -2.4], 0, 'phone', 'bored', hold={'R': 'phone'}, path=[{'t': 0, 'pos': [0, 0, -2.4]}, {'t': 2.2, 'pos': ROAD, 'gait': 'walk'}])],
  camera={'pos': [0.55, 1.3, 0.9], 'look': [0, 1.15, -1.6], 'fov': 30, 'beats': ['@olhando']}, sfx=[{'t': 0.15, 'name': 'horn', 'dur': 0.9}], coverage='fast')
S('a2', 'suburb', 'Um carro. A quarenta por hora. A três metros de você.',
  actors=[A('hero', ROAD, 0, 'phone', 'bored', hold={'R': 'phone'})],
  props=[{'type': 'car', 'pos': [-16, 0, -1.4], 'rot': 90, 'color': '#c8402f', 'path': [{'t': 0, 'pos': [-16, 0, -1.4]}, {'t': 2.8, 'pos': [-4.4, 0, -1.4]}]}],
  camera={'pos': [5.2, 1.0, 4.6], 'look': [-3.0, 0.9, 0.2], 'fov': 44, 'beats': ['@quarenta', '@três']}, sfx=[{'t': '@carro', 'name': 'horn', 'dur': 1.2}],
  overlays=[W('40 KM/H', '@quarenta')])
S('a3', 'suburb', 'Seu coração dispara. E o mundo… para.',
  actors=[A('hero', ROAD, -60, 'shocked', 'shocked', look=[-4, 0.9, -1.4])],
  props=[{'type': 'car', 'pos': [-4.4, 0, -1.4], 'rot': 90, 'color': '#c8402f'}],
  camera=cam('close', 'hero', -30, height=-10, move='crashIn'), fx={'freeze': '@para'},
  sfx=[{'t': '@dispara', 'name': 'heartbeat'}, {'t': '@para', 'name': 'subdrop'}], coverage='off')
S('a4', 'suburb', 'Na sua frente, flutuando, um menu. Igual de videogame.',
  actors=[A('hero', ROAD, -60, 'shocked', 'awe')],
  props=[{'type': 'car', 'pos': [-4.4, 0, -1.4], 'rot': 90, 'color': '#c8402f'}],
  camera={'pos': [1.9, 1.35, 1.6], 'look': [-0.1, 1.45, -1.3], 'fov': 40, 'beats': ['@igual']}, fx={'freeze': True},
  overlays=[M(FACTORY, at='@menu', alarm=True)], coverage='fast')
S('a5', 'suburb', 'Medo: cem. Você arrasta pra zero.',
  actors=[A('hero', ROAD, -60, 'reach', 'focused')],
  props=[{'type': 'car', 'pos': [-4.4, 0, -1.4], 'rot': 90, 'color': '#c8402f'}],
  camera=cam('medium', 'hero', 40, height=-8), fx={'freeze': True},
  overlays=[M([('DOR', 100), ('SONO', 100), ('MEDO', 100, 0, '@zero'), ('FORÇA', 60)], at=0, alarm=True)])
S('a6', 'suburb', 'Força nas pernas: sessenta. Você joga pra cem.',
  actors=[A('hero', ROAD, -60, 'determined', 'determined')],
  props=[{'type': 'car', 'pos': [-4.4, 0, -1.4], 'rot': 90, 'color': '#c8402f'}],
  camera=cam('medium', 'hero', -20, height=10), fx={'freeze': True},
  overlays=[M([('DOR', 100), ('SONO', 100), ('MEDO', 0), ('FORÇA', 60, 100, '@cem')], at=0, alarm=True)])
S('a7', 'suburb', 'O mundo volta. E você pula.',
  actors=[A('hero', ROAD, -90, 'crouch', 'determined',
            path=[{'t': '@pula', 'pos': ROAD}, {'t': '@pula+0.25', 'pos': [0, 1.7, -1.6], 'gait': 'carried'}, {'t': '@pula+0.6', 'pos': [0, 0.1, -4.2], 'gait': 'carried'}],
            poses=[{'t': '@pula', 'pose': 'jump', 'blend': 0.12}, {'t': '@pula+0.55', 'pose': 'crouch', 'blend': 0.4}])],
  props=[{'type': 'car', 'pos': [-4.4, 0, -1.4], 'rot': 90, 'color': '#c8402f',
          'path': [{'t': '@volta', 'pos': [-4.4, 0, -1.4]}, {'t': '@pula-0.05', 'pos': [-3.6, 0, -1.4]}, {'t': '@pula+0.55', 'pos': [4.2, 0, -1.4]}, {'t': '@pula+1.4', 'pos': [16, 0, -1.4]}]}],
  camera={'pos': [0.6, 1.4, 8.5], 'look': [0, 1.4, -1.8], 'fov': 42}, fx={'speedLines': 'hero'},
  sfx=[{'t': '@volta', 'name': 'whoosh'}, {'t': '@pula', 'name': 'whooshUp'}, {'t': '@pula+0.6', 'name': 'thud'}], cut='smash', coverage='off')
S('a8', 'suburb', 'Você pulou um carro?!', who='female',
  actors=[A('kid', KIDPOS, 180, 'shocked', 'awe', look='hero', talk=TALK)], camera=cam('close', 'kid', 15, height=-10))
S('a9', 'suburb', '[deadpan] Não. Eu ajustei as configurações.',
  actors=[A('hero', [0, 0.1, -4.2], 20, 'relaxed', 'smug', look='kid', talk=[[0.05, 2.4]])], camera=cam('close', 'hero', -20, height=8))
S('a10', 'suburb', 'Aí chega uma notificação. [darkly amused] Empréstimo registrado. Pagamento: amanhã.',
  actors=[A('hero', [0, 0.1, -4.2], 20, 'relaxed', 'worried')],
  camera=cam('medium', 'hero', 10, move='pushIn'),
  overlays=[M([('DOR', 100), ('SONO', 100), ('MEDO', 0), ('FORÇA', 100)], at=0.1, note='EMPRÉSTIMO REGISTRADO · PAGAMENTO: AMANHÃ', noteAt='@empréstimo')])

# ================================================================ 2. pergunta do título (0:30–0:37)
S('t1', 'suburb', 'E se você encontrasse um menu de configurações do seu corpo? Veja como isso realmente aconteceria.',
  actors=[A('hero', [0, 0.1, -4.2], 0, 'relaxed', 'smirk')],
  camera={'pos': [2.2, 1.9, 2.4], 'look': [0, 1.2, -4.2], 'fov': 42, 'move': 'pullOut'},
  overlays=[{'type': 'title', 'small': 'E SE VOCÊ ENCONTRASSE UM', 'big': 'MENU DO SEU CORPO?', 'at': 0.2}], coverage='off')

# ================================================================ 3. mecanismo + limite (0:37–1:10)
S('m1', 'void', 'O menu tem quatro barras. Dor. Sono. Medo. Força.',
  actors=[A('hero', 'center', 15, 'thinking', 'focused')], camera=cam('medium', 'hero', 15, move='drift'),
  overlays=[M(FACTORY, at='@quatro')])
S('m2', 'void', 'Cada uma vai de zero a cem. E você arrasta qualquer uma com o pensamento.',
  actors=[A('hero', 'center', -10, 'reach', 'focused')], camera=cam('close', 'hero', -20),
  overlays=[M([('DOR', 100, 30, '@zero'), ('SONO', 100), ('MEDO', 100, 70, '@pensamento'), ('FORÇA', 60)], at=0.1)])
S('m3', 'void', 'O resto continua igual. Você não voa. Não fica invisível. Não vira gênio.',
  actors=[A('hero', 'center', 0, 'shrug', 'bored')], camera=cam('medium', 'hero', 25, move='pushIn'),
  sfx=[{'t': '@voa', 'name': 'pop'}, {'t': '@invisível', 'name': 'pop'}, {'t': '@gênio', 'name': 'pop'}])
S('m4', 'void', 'E tem uma coisa que ninguém te conta sobre essas barras.',
  actors=[A('hero', 'center', 0, 'stand', 'suspicious')], camera=cam('close', 'hero', 0, move='pushIn'))
C('m5', 'icon', 'Cada uma é um alarme. Dor, sono e medo não são defeitos. São o seu corpo gritando: para.',
  icon='warning', caption='CADA BARRA É UM ALARME', sub='NÃO UM DEFEITO')
S('m6', 'void', 'Guarda isso.',
  actors=[A('hero', 'center', 0, 'point', 'determined')], camera=cam('xclose', 'hero', -10, move='pushIn'), coverage='off')

S('m7', 'bedroom', 'E o empréstimo? No dia seguinte, você dorme catorze horas seguidas. E acorda com as pernas doendo como se tivesse corrido uma maratona.',
  actors=[A('hero', IN_BED, 0, 'sleep', 'tired', faces=[{'t': '@acorda', 'face': {'eyes': 0.5, 'brow': 0.9, 'mouth': -0.6, 'sweat': True}, 'blend': 0.4}])],
  camera={'pos': [1.4, 1.45, 1.8], 'look': [-1.6, 0.75, -2.4], 'fov': 40, 'move': 'pushIn'}, overlays=[W('14 HORAS', '@catorze', color='white')])

# ================================================================ 4. escada + âncoras (1:10–2:00)
C('s1', 'icon', 'Agora, a parte estranha: o menu só aparece quando o seu coração dispara.', icon='heart', caption='SÓ ABRE QUANDO', sub='O CORAÇÃO DISPARA')
C('s2', 'compare', 'Parado, o seu coração bate umas setenta vezes por minuto. Num susto de verdade, passa de cento e vinte.',
  title='BATIDAS POR MINUTO', unit='BPM', left={'label': 'PARADO', 'value': 70, 'icon': 'sit', 'at': '@parado'},
  right={'label': 'NUM SUSTO', 'value': 120, 'icon': 'heart', 'at': '@susto'}, ratio=False)
S('s3', 'suburb', 'E no susto, o tempo parece andar devagar. Isso tem explicação.',
  actors=[A('hero', ROAD, -60, 'shocked', 'shocked')], props=[{'type': 'car', 'pos': [-4.4, 0, -1.4], 'rot': 90, 'color': '#c8402f'}],
  camera={'pos': [1.6, 1.5, 1.4], 'look': [-0.6, 1.2, -1.0], 'fov': 44, 'move': 'drift'}, fx={'freeze': True, 'grade': 'flashback'})
C('s4', 'distance', 'Cientistas soltaram voluntários de costas, de trinta e um metros de altura, numa rede.',
  value=31, unit='METROS', count=1, pose='fall', target='flag', label='QUEDA LIVRE NUMA REDE')
C('s5', 'stat', 'Depois, todo mundo jurou que a própria queda durou mais. Um terço a mais. [deadpan] Não durou.',
  value='1/3', label='MAIS LONGA NA LEMBRANÇA', icon='clock')
S('s6', 'void', 'No susto, o cérebro grava mais detalhes. [mischievously] E o seu menu mora exatamente nesse buraco.',
  actors=[A('hero', 'center', 20, 'explain', 'smirk')], camera=cam('medium', 'hero', 20, move='drift'))
C('s7', 'icon', 'E a próxima parte é real: existem pessoas que nascem com a dor em zero.', icon='warning', caption='GENTE QUE NASCE', sub='SEM SENTIR DOR')
C('s8', 'chain', 'Elas mordem a língua sem perceber. Quebram um osso e continuam andando.',
  title='SEM DOR, SEM AVISO', nodes=[{'icon': 'fall', 'label': 'MACHUCA'}, {'icon': 'cross', 'label': 'NÃO SENTE'}, {'icon': 'walk', 'label': 'CONTINUA'}])
S('s9', 'void', 'Pra elas, isso é perigo todo dia. [deadpan] Pra você, é só uma barra.',
  actors=[A('hero', 'center', -15, 'armsCrossed', 'smug')], camera=cam('close', 'hero', -15),
  overlays=[M([('DOR', 100, 0, '@barra')], at='@você')])

# ================================================================ 5. teste de prova (2:00–2:40)
S('p1', 'classroom', 'Na escola, você conta tudo pra enfermeira, a dona Rute. Ela não acredita em nada.', variant=1,
  props=[ENF], actors=[A('rute', 'front+0.4,0,0.6', 90, 'armsCrossed', 'suspicious', look='hero'), A('hero', 'seat1', -90, 'sit', 'happy')],
  camera={'pos': [-1.2, 1.55, 4.6], 'look': [-1.5, 1.1, 1.0], 'fov': 44, 'move': 'drift'})
S('p2', 'classroom', 'Ela traz um balde de água com gelo. É um teste de verdade, usado em laboratório.', variant=1,
  props=[ENF, BUCKET], actors=[A('rute', [-1.25, 0, 1.2], 70, 'holdOut', 'suspicious'), A('hero', 'seat1', -90, 'sit', 'worried', look=DESK1)],
  camera={'pos': [0.9, 1.5, -0.6], 'look': [-0.8, 1.15, 1.4], 'fov': 44}, sfx=[{'t': '@balde', 'name': 'thud'}])
C('p3', 'stat', 'Muita gente não aguenta nem um minuto com a mão lá dentro.', value=1, unit='MINUTO', label='O NORMAL NO BALDE DE GELO', icon='stopwatch')
S('p4', 'classroom', 'Você põe a dor em zero. E a mão no gelo.', variant=1,
  props=[BUCKET], actors=[A('hero', 'seat1', -90, HAND_IN, 'smug')],
  camera={'pos': [-1.4, 1.85, 2.7], 'look': [-0.15, 0.95, 1.7], 'fov': 40},
  overlays=[M([('DOR', 100, 0, '@zero')], at=0.1, y='top')], sfx=[{'t': '@gelo', 'name': 'splash', 'vol': -16}])
S('p5', 'classroom', 'Um minuto. Cinco. Dez.', variant=1,
  props=[ENF, BUCKET], actors=[A('hero', 'seat1', -90, HAND_IN, 'bored'),
                               A('rute', [-1.25, 0, 1.2], 70, 'armsCrossed', 'surprised', look='hero')],
  camera={'pos': [1.6, 1.4, 4.4], 'look': [-0.5, 1.0, 1.5], 'fov': 40, 'move': 'pushIn'},
  overlays=[{'type': 'stopwatch', 'from': '0:00', 'to': '10:00', 'corner': 'bc', 'at': 0.1}], sfx=[{'t': 0.1, 'name': 'ticks', 'dur': 1.6}])
S('p6', 'classroom', 'Cadê o frio?', who='adulta', variant=1,
  actors=[A('rute', [-1.25, 0, 1.2], 70, 'shocked', 'shocked', look='hero', talk=TALK)], camera=cam('close', 'rute', 20))
S('p7', 'classroom', '[deadpan] Desliguei.', variant=1, hold=0.4,
  actors=[A('hero', 'seat1', -90, HAND_IN, 'smug', look='rute', talk=[[0.05, 0.8]])],
  camera=cam('close', 'hero', -30), coverage='off')
S('p8', 'classroom', 'Ela olha a sua mão. Roxa. Você não sente nada. [darkly amused] E acha isso ótimo.', variant=1,
  props=[BUCKET], actors=[A('hero', 'seat1', -90, {'armR': [70, 10, -20, 40], 'handR': 'open', 'hipY': -0.46, 'legL': [88, 6, 92], 'legR': [88, 6, 92]}, 'grin', look=[-0.3, 1.2, 1.7])],
  camera={'pos': [-1.6, 1.3, 0.5], 'look': [0.0, 1.05, 1.7], 'fov': 38}, overlays=[W('ROXA', '@roxa', color='white')])
S('p9', 'classroom', 'De novo. Com a outra.', who='adulta', variant=1,
  actors=[A('rute', [-1.25, 0, 1.2], 70, 'point', 'suspicious', look='hero', talk=TALK), A('hero', 'seat1', -90, HAND_IN, 'smug')], camera=cam('close', 'rute', 0, over='hero', dist=1.7), cut='smash')

S('p10', 'classroom', 'A dona Rute anota tudo num caderno. E liga pra alguém.', variant=1,
  props=[ENF], actors=[A('rute', [-1.25, 0, 1.2], 160, 'phone', 'sly', hold={'R': 'phone'})], camera={'pos': [-0.5, 1.5, -0.9], 'look': [-1.25, 1.3, 1.2], 'fov': 40},
  sfx=[{'t': '@liga', 'name': 'ring', 'dur': 1.0, 'vol': -14}])

# ================================================================ 6. regras (2:40–3:50)
C('r1', 'rules', 'Em três semanas testando, você descobre as regras.', title='AS REGRAS DO MENU', prefix='REGRA', rules=RULES, current=0)
C('r2', 'rules', 'Regra um: o menu só abre num alarme de verdade.', title='AS REGRAS DO MENU', prefix='REGRA', rules=RULES, current=1)
S('r3', 'bedroom', 'Você tenta abrir deitado, calmo, na cama. Nada. Você tenta fazendo força, de careta. Nada.',
  actors=[A('hero', IN_BED, 0, 'sleep', 'focused', faces=[{'t': '@careta', 'face': {'eyes': 0.4, 'brow': -0.8, 'mouth': -0.6, 'width': 1.2}, 'blend': 0.3}])],
  camera={'pos': [1.4, 1.45, 1.8], 'look': [-1.6, 0.75, -2.4], 'fov': 40, 'move': 'pushIn'},
  sfx=[{'t': '@nada', 'name': 'click'}, {'t': '@nada#2', 'name': 'click'}], overlays=[W('NADA', '@nada#2', color='white')])
S('r4', 'bedroom', '[deadpan] Susto ensaiado não conta.',
  actors=[A('hero', IN_BED, 0, 'sleep', 'bored')], camera={'pos': [-3.9, 1.4, -2.0], 'look': [-2.55, 0.8, -3.3], 'fov': 38}, coverage='off')
S('r4b', 'classroom', 'O Caio tenta ajudar. Ele grita no seu ouvido no meio da aula. Você leva uma advertência. [deadpan] O menu nem pisca.', variant=1,
  actors=[A('bestie', 'seat2+0.35,0,-0.55', -120, 'cheer', 'angry', talk=[[0.9, 2.2]]), A('hero', 'seat2', -90, 'sit', 'bored')],
  camera={'pos': [2.4, 1.4, 4.4], 'look': [2.1, 1.1, 1.4], 'fov': 42}, sfx=[{'t': '@grita', 'name': 'pop'}])
S('r4c', 'void', 'Precisa de perigo de verdade. Um carro. Uma queda. Não um amigo gritando.',
  actors=[A('hero', 'center', 10, 'explain', 'bored')], camera=cam('medium', 'hero', 10))
C('r5', 'rules', 'Regra dois: toda mudança desequilibra outra coisa.', title='AS REGRAS DO MENU', prefix='REGRA', rules=RULES, current=2)
S('r6', 'void', 'Você joga a força pra cem. E aparece uma barra nova, que estava escondida: foco. Caindo.',
  actors=[A('hero', 'center', 10, 'power', 'determined', faces=[{'t': '@foco', 'face': 'confused', 'blend': 0.4}])],
  camera=cam('medium', 'hero', 10, height=-10),
  overlays=[M([('DOR', 100), ('SONO', 100), ('MEDO', 100), ('FORÇA', 60, 100, '@cem'), {'label': 'FOCO', 'from': 80, 'value': 15, 'at': '@caindo', 'warn': True}], at=0.1)])
C('r7', 'stat', 'Faz sentido: o seu cérebro gasta uns vinte por cento de toda a sua energia. A força tem que vir de algum lugar.',
  value=20, unit='%', label='DA SUA ENERGIA VAI PRO CÉREBRO', icon='brain')
S('r8', 'classroom', 'Com a força em cem, você tenta fazer dois mais dois. [deadpan] Você usa os dedos.', variant=0,
  actors=[A('hero', 'seat2', -90, 'sitThink', 'confused')], camera=cam('close', 'hero', 25),
  overlays=[W('2 + 2 = ?', '@dois', color='white', y='top')])
C('r9', 'rules', 'Regra três: o menu não cria nada. Só mexe no que já é seu.', title='AS REGRAS DO MENU', prefix='REGRA', rules=RULES, current=3)
S('r10', 'void', 'Força cem não é força de super-herói. É a força máxima dos seus músculos, que o cérebro trava, pra você não se rasgar.',
  actors=[A('hero', 'center', -20, 'fistPump', 'determined')], camera=cam('medium', 'hero', -20, move='pushIn'))
S('r11', 'void', 'Você procura uma barra escrita voar. [darkly amused] Não tem. Nem inteligência. Você confere duas vezes.',
  actors=[A('hero', 'center', 15, 'thinking', 'suspicious')], camera=cam('close', 'hero', 15),
  overlays=[M(FACTORY, at='@procura', note='BARRA "VOAR" NÃO ENCONTRADA', noteAt='@tem')])

# ================================================================ 7. ladainha de vantagens (3:50–5:05)
ladainha('v', 'classroom', [
    {'vo': 'Vacina na escola: dor em dez. Você boceja enquanto a agulha entra.', 'word': ('DOR 10', '@dez'), 'variant': 0, 'overlays': [],
     'actors': [A('hero', 'seat1', -90, 'sit', 'bored'), A('rute', [-0.2, 0, 2.4], -150, 'reach', 'focused', look='hero', contact=True)],
     'camera': cam('medium', 'hero', -50), 'sfx': [{'t': '@boceja', 'name': 'pop'}]},
    {'vo': 'Apresentação de trabalho: medo em vinte. Doze minutos sem gaguejar.', 'word': ('12 MIN', '@doze'), 'variant': 0,
     'actors': [A('hero', 'front', 90, 'explain', 'smug', talk=[[0.2, 3.5]])], 'camera': cam('medium', 'hero', 0, height=-6), 'coverage': 'off'},
    {'vo': 'O pote de azeitona da sua mãe: força em noventa. Abre de primeira.', 'word': ('FORÇA 90', '@noventa'), 'set': 'home',
     'actors': [A('hero', 'kitchen', 0, 'holdOut', 'smug', hold={'R': 'jar'})], 'camera': cam('medium', 'hero', 20),
     'sfx': [{'t': '@primeira', 'name': 'pop'}]},
    {'vo': '[sweetly] Abre o de pepino também.', 'who': 'adulta', 'set': 'home',
     'actors': [A('mom', 'kitchen+1.1,0,0.4', -60, 'holdOut', 'happy', look='hero', hold={'R': 'jar'}, talk=TALK)], 'camera': cam('close', 'mom', -20)},
    {'vo': 'Banho gelado: dor em zero. A conta de gás cai trinta reais.', 'word': ('-R$ 30', '@trinta'), 'set': 'home',
     'actors': [A('mom', 'table', 0, 'holdOut', 'bliss', hold={'R': 'paper'})], 'camera': cam('close', 'mom', 15)},
    {'vo': 'Cebola pro almoço de domingo: dor em zero nos olhos. Três quilos picados. Sua mãe vende o que sobra pra vizinha.', 'word': ('3 KG', '@três'), 'set': 'home',
     'actors': [A('hero', 'stove', 0, 'typing', 'bored'), A('mom', 'stove+1.2,0,0.5', -60, 'holdOut', 'sly', hold={'R': 'bag'})], 'camera': cam('medium', 'hero', -25)},
    {'vo': 'Sono em zero na véspera da prova: seis horas a mais de estudo.', 'word': ('+6 HORAS', '@seis'), 'set': 'bedroom', 'time': 'interiorNight',
     'actors': [A('hero', 'desk', 180, 'sit', 'focused')], 'camera': {'pos': [1.4, 1.55, -0.6], 'look': [2.9, 1.05, -3.8], 'fov': 44}},
    {'vo': 'Acordar às seis no inverno: sono em quarenta. Você levanta antes do despertador. Ele se sente inútil.', 'word': ('6:00', '@seis'), 'set': 'bedroom',
     'actors': [A('hero', 'bed+0.9,0,0.6', 0, 'stretch', 'smug')], 'camera': cam('medium', 'hero', 25), 'sfx': [{'t': '@despertador', 'name': 'ring', 'dur': 0.8, 'vol': -12}]},
    {'vo': 'Filme de terror com a Ivy, sua irmã de nove anos: medo em zero. Ela grita oitenta vezes. Você come pipoca.', 'word': ('80 GRITOS', '@oitenta'),
     'set': 'home', 'time': 'interiorNight',
     'actors': [A('hero', 'couch', 90, 'sit', 'bored'), A('sister', 'couch+0,0,0.75', 90, 'sit', 'scared')],
     'camera': {'pos': [3.3, 1.25, 1.2], 'look': [1.8, 0.85, -0.05], 'fov': 44}, 'sfx': [{'t': '@grita', 'name': 'pop'}]},
    {'vo': 'Você é muito estranho.', 'who': 'female', 'set': 'home', 'time': 'interiorNight',
     'actors': [A('sister', 'couch+0,0,0.75', 90, 'sit', 'suspicious', look='hero', talk=TALK)], 'camera': cam('close', 'sister', 30)},
    {'vo': 'O Bruno, o maior do nono ano, te encurrala: medo em cinco. Você boceja na cara dele. Ele que recua.', 'word': ('MEDO 5', '@cinco'), 'variant': 1, 'set': 'cafeteria',
     'actors': [A('rival', [0.6, 0, 3.0], -90, 'fight', 'angry', look='hero', path=[{'t': '@recua', 'pos': [0.6, 0, 3.0]}, {'t': '@recua+1.2', 'pos': [1.6, 0, 3.0], 'gait': 'sneak'}], strafe=True,
                  faces=[{'t': '@boceja', 'face': 'scared', 'blend': 0.4}]),
                A('hero', [-0.4, 0, 3.0], 90, 'relaxed', 'bored', look='rival')],
     'camera': cam('medium', 'hero', 35), 'coverage': 'off'},
    {'vo': 'A vizinha do lado, com cinco sacolas de feira: força em oitenta. Você leva tudo. Ela te paga um bolo.', 'word': ('5 SACOLAS', '@cinco'), 'set': 'suburb',
     'actors': [A('hero', [5.4, 0.1, -4.6], 90, 'carry', 'happy', hold={'R': 'bag', 'L': 'bag'}), A('extraB', [7.2, 0.1, -4.6], -90, 'cheer', 'happy', look='hero')],
     'camera': {'pos': [6.3, 1.5, -1.2], 'look': [6.3, 1.1, -4.6], 'fov': 42}},
    {'vo': 'A pipa de um menino presa numa árvore: medo em dez. Oito metros de galho. A pipa desce inteira. Você também.', 'word': ('8 METROS', '@oito'), 'set': 'park',
     'actors': [A('kid', 'lawn', -30, 'cheer', 'happy', look='hero'), A('hero', 'lawn+-0.75,0,0.35', 60, 'holdOut', 'grin', hold={'R': 'paper'})], 'camera': cam('medium', 'hero', 20)},
    {'vo': 'Corrida na educação física: dor em vinte. Você dá doze voltas na quadra. O segundo lugar dá sete.', 'word': ('12 VOLTAS', '@doze'), 'set': 'stadium', 'variant': 1,
     'actors': [A('hero', [-6, 0.02, 4], 90, 'stand', 'determined', path=[{'t': 0, 'pos': [-6, 0.02, 4]}, {'t': 4.5, 'pos': [8, 0.02, 4], 'gait': 'run'}]),
                A('bestie', [-9, 0.02, 5.2], 90, 'stand', 'tired', path=[{'t': 0, 'pos': [-9, 0.02, 5.2]}, {'t': 4.5, 'pos': [-2, 0.02, 5.2], 'gait': 'jog'}])],
     'camera': {'path': [{'t': 0, 'pos': [-6, 1.5, 12], 'look': [-6, 1.0, 4]}, {'t': 4.5, 'pos': [6, 1.5, 12], 'look': [6, 1.0, 4], 'ease': 'cruise'}], 'fov': 44}},
    {'vo': 'Aperto de mão com o diretor: força em cem. [deadpan] Ele precisou de gelo.', 'word': ('FORÇA 100', '@cem'), 'variant': 1,
     'actors': [A('hero', [-2.6, 0, 3.2], 90, SHAKE_HAND, 'happy', look='teacher', contact=True),
                A('teacher', [-1.95, 0, 3.2], -90, SHAKE_HAND, 'neutral', look='hero', contact=True, faces=[{'t': '@cem+0.3', 'face': 'shocked', 'blend': 0.2}])],
     'camera': {'pos': [-2.4, 1.35, 1.5], 'look': [-2.25, 1.2, 3.2], 'fov': 40}, 'sfx': [{'t': '@cem+0.3', 'name': 'thud'}]},
    {'vo': 'Você quebrou o diretor.', 'who': 'male', 'variant': 1,
     'actors': [A('bestie', [-3.6, 0, 4.4], 60, {'head': [-18, 0, 0], 'armL': [35, 20, 0, 60], 'armR': [35, 20, 0, 60], 'handL': 'open', 'handR': 'open'}, 'shocked', talk=TALK)], 'camera': cam('close', 'bestie', 0, height=-12)},
    {'vo': 'Queda de braço no bairro: força em cem, dor em zero. Vinte e três vitórias seguidas.', 'word': ('23 VITÓRIAS', '@vinte'), 'set': 'cafeteria', 'variant': 1,
     'actors': [A('hero', [0.6, 0, 2.22], 180, {'reachR': {'to': [0.0, 1.05, 0.62]}, 'handR': 'fist', 'hipY': -0.46, 'legL': [88, 6, 92], 'legR': [88, 6, 92], 'spine': [12, 0, 0]}, 'determined', contact=True),
                A('rival', [0.6, 0, 0.98], 0, {'reachR': {'to': [0.0, 1.05, 0.62]}, 'handR': 'fist', 'hipY': -0.42, 'legL': [88, 6, 92], 'legR': [88, 6, 92], 'spine': [12, 0, 0]}, 'furious', contact=True)],
     'camera': {'pos': [3.0, 1.4, 1.6], 'look': [0.6, 1.0, 1.6], 'fov': 40}, 'sfx': [{'t': '@seguidas', 'name': 'thud'}]},
    {'vo': 'O prêmio: um troféu de plástico e trezentos reais. [mischievously] Você nunca dormiu tão pouco. Nem ganhou tanto.', 'word': ('R$ 300', '@trezentos'), 'set': 'suburb',
     'props': [{'type': 'trophy', 'pos': [0.6, 0.1, -4.0]}],
     'actors': [A('hero', [0, 0.1, -4.4], 0, 'celebrate', 'grin')], 'camera': cam('medium', 'hero', -15, height=-12, move='pushIn')},
], color='yellow')

# ================================================================ 8. história B: o canal da Ivy (5:05–5:35)
S('b1', 'home', 'Quem mais lucra com tudo isso é a Ivy.',
  actors=[A('sister', 'center', 20, 'phone', 'sly', hold={'R': 'phone'})], camera=cam('medium', 'sister', 20, move='pushIn'))
S('b2', 'home', 'Ela tem um canal. Trezentos e doze inscritos. E um plano: dez mil até o fim do inverno.',
  actors=[A('sister', 'center', -10, 'holdOut', 'determined', hold={'R': 'phone'})], camera=cam('close', 'sister', -15),
  overlays=[W('312', '@trezentos'), W('10.000', '@dez', y='mid')])
S('b3', 'home', 'Ela grava tudo o que você faz. O pote, o diretor, o carro. [sarcastic] Sem autorização, claro.',
  actors=[A('sister', 'center+1.6,0,0.4', -90, 'phone', 'focused', hold={'R': 'phone'}), A('hero', 'kitchen', 0, 'holdOut', 'smug', hold={'R': 'jar'})],
  camera={'pos': [2.6, 1.5, 3.4], 'look': [-1.4, 1.1, -1.8], 'fov': 44})
S('b4', 'home', 'Você é meu conteúdo.', who='female',
  actors=[A('sister', 'center+1.6,0,0.4', -90, 'phone', 'smug', hold={'R': 'phone'}, look='camera', talk=TALK)], camera=cam('close', 'sister', 25))
S('b5', 'home', 'E ela quer um vídeo que ninguém nunca fez. Essa parte vai importar.',
  actors=[A('sister', 'center+1.6,0,0.4', -90, 'thinking', 'sly', hold={'R': 'phone'})], camera=cam('xclose', 'sister', -10, move='pushIn'), coverage='off')
S('b6', 'home', 'Algo perigoso. Perigo dá visualização.', who='female',
  actors=[A('sister', 'center+1.6,0,0.4', -90, 'point', 'sly', look='hero', talk=TALK)], camera=cam('close', 'sister', 35))

# ================================================================ 9. "mas" + problemas 1–3 (5:35–7:35)
S('q1', 'void', 'Essa é a versão divertida. Aqui vem a conta.',
  actors=[A('hero', 'center', 0, 'stand', 'worried')], camera=cam('medium', 'hero', 0, move='pullOut'), sfx=[{'t': '@conta', 'name': 'subdrop'}])
S('q2', 'void', 'O menu disse empréstimo. [darkly amused] O banco é o seu corpo. E ele cobra juros.',
  actors=[A('hero', 'center', 0, 'stand', 'scared')], camera=cam('close', 'hero', 15),
  overlays=[M(FACTORY, at=0.1, note='EMPRÉSTIMO ATIVO · JUROS DIÁRIOS', noteAt='@juros')])
# problem 1: sleep (annoying)
C('q3', 'stat', 'Problema um: o sono. Você passa quatro noites com o sono em zero.', value=4, unit='NOITES', label='SEM DORMIR', icon='clock')
S('q4', 'classroom', 'No quinto dia, a conta chega inteira. Você dorme em pé. No meio da apresentação.', variant=0,
  actors=[A('hero', 'front', 90, {'head': [35, 0, 15], 'spine': [6, 0, 0], 'armL': [0, 6, 0, 10], 'armR': [0, 6, 0, 10]}, 'closed')],
  camera=cam('medium', 'hero', 0, height=-6), coverage='off', overlays=[W('Zzz', '@pé', color='white')], sfx=[{'t': '@pé', 'name': 'subdrop'}])
C('q5', 'stat', 'Em mil novecentos e sessenta e quatro, um estudante americano ficou onze dias sem dormir. No fim, ele via coisas que não existiam.',
  value=11, unit='DIAS', label='ACORDADO, EM 1964', icon='eye')
C('q5b', 'icon', 'E tem mais: dormindo, o cérebro faz faxina. Um líquido lava o lixo do dia. Isso foi visto em camundongos, em dois mil e treze. Sem sono, o lixo fica.',
  icon='brain', caption='O CÉREBRO FAZ FAXINA', sub='SÓ QUANDO VOCÊ DORME')
S('q6', 'bedroom', 'Você chega no quarto dia. [deadpan] E conversa dez minutos com o guarda-roupa.', time='interiorNight',
  actors=[A('hero', 'wardrobe+1.0,0,0', -90, 'explain', 'tired', talk=[[0.4, 3.6]])], camera={'pos': [0.6, 1.5, 2.6], 'look': [-2.2, 1.2, 0.8], 'fov': 42},
  overlays=[W('10 MIN', '@dez', color='white')])
S('q7', 'bedroom', 'Ele tá discutindo com o guarda-roupa de novo.', who='female', time='interiorNight',
  actors=[A('sister', 'door', -90, 'phone', 'smirk', hold={'R': 'phone'}, talk=TALK)], camera=cam('close', 'sister', -20))
S('q8', 'void', 'Solução barata: sono nunca abaixo de sessenta.',
  actors=[A('hero', 'center', 0, 'point', 'tired')], camera=cam('medium', 'hero', 10),
  overlays=[M([('SONO', 0, 60, '@sessenta')], at=0.1)])
# problem 2: strength steals focus (expensive)
S('q9', 'void', 'Problema dois: a força. Você deixa em cem depois da queda de braço. E esquece de baixar.',
  actors=[A('hero', 'center', 20, 'power', 'grin')], camera=cam('medium', 'hero', 20, height=-10),
  overlays=[M([('FORÇA', 100), {'label': 'FOCO', 'value': 12, 'warn': True}], at='@força', title='CONFIGURAÇÕES')])
S('q10', 'classroom', 'Na prova de matemática, o foco está em doze. [deadpan] Você tira meio ponto.', variant=0,
  actors=[A('hero', 'seat2', -90, 'sitSlump', 'confused', hold={'R': 'paper'})], camera=cam('close', 'hero', 30),
  overlays=[W('0,5', '@meio', color='red')], sfx=[{'t': '@meio', 'name': 'subdrop'}])
S('q11', 'home', 'Recuperação: quatrocentos reais. Sua mãe desconta da sua mesada.',
  actors=[A('mom', 'table', 0, 'holdOut', 'angry', hold={'R': 'paper'}), A('hero', 'center', -150, 'sad', 'sad', look='mom')],
  camera={'pos': [0.8, 1.5, 3.4], 'look': [-2.0, 1.1, -0.6], 'fov': 44}, overlays=[W('R$ 400', '@quatrocentos')])
S('q12', 'home', 'Com juros.', who='adulta',
  actors=[A('mom', 'table', 0, 'armsCrossed', 'smug', look='hero', talk=[[0.05, 0.9]])], camera=cam('close', 'mom', 10), cut='smash')
S('q12b', 'classroom', 'O professor de matemática olha a sua prova, olha pra você, e pergunta se está tudo bem em casa. [darkly amused] Não está. Mas não pelo motivo que ele pensa.', variant=1,
  actors=[A('teacher', 'front', 60, 'holdOut', 'worried', hold={'R': 'paper'}, look='hero'), A('hero', 'seat3', -90, 'sit', 'embarrassed', look='teacher')],
  camera={'pos': [-1.6, 1.5, 3.6], 'look': [-2.0, 1.1, 0.0], 'fov': 44})
# problem 3: pain (dangerous)
S('q13', 'stadium', 'Problema três: a dor. No futebol da escola, você joga com a dor em zero.', variant=1,
  actors=[A('hero', [-4, 0.02, 2], 90, 'stand', 'determined', path=[{'t': 0.2, 'pos': [-4, 0.02, 2]}, {'t': 3.6, 'pos': [3, 0.02, 1.6], 'gait': 'run'}])],
  props=[{'type': 'ball', 'pos': [-3.4, 0.02, 2.1], 'path': [{'t': 0.2, 'pos': [-3.4, 0.02, 2.1]}, {'t': 3.6, 'pos': [3.6, 0.02, 1.7]}]}],
  camera={'path': [{'t': 0, 'pos': [-4, 1.4, 9], 'look': [-3, 0.9, 2]}, {'t': 3.6, 'pos': [3, 1.4, 9], 'look': [3, 0.9, 2], 'ease': 'cruise'}], 'fov': 44},
  overlays=[M([('DOR', 0)], at='@dor', y='top')])
S('q14', 'stadium', 'Na primeira dividida, o seu pulso entorta pro lado errado. Você não sente. E faz mais dois gols.', variant=1,
  actors=[A('hero', [0.4, 0.02, 1.6], 90, {'hipY': 0.05, 'head': [-4, 0, 0], 'armL': [150, 40, 0, 10], 'armR': [140, 40, 95, 70], 'handL': 'fist', 'handR': 'open', 'legL': [20, 8, 40], 'legR': [6, 8, 20]}, 'grin')],
  camera=cam('medium', 'hero', 0, height=-10), coverage='off', sfx=[{'t': '@entorta', 'name': 'thud'}, {'t': '@gols', 'name': 'chime'}],
  overlays=[W('2 GOLS', '@dois')])
S('q14b', 'stadium', 'No vestiário, o Caio aponta pro seu braço.', variant=1,
  actors=[A('bestie', [0.2, 0.02, 3.2], 160, 'point', 'shocked', look='hero'), A('hero', [0.6, 0.02, 2.2], -20, 'relaxed', 'happy', look='bestie')], camera=cam('medium', ['hero', 'bestie'], 90))
S('q14c', 'stadium', 'Isso aí não dobra pra esse lado.', who='male', variant=1,
  actors=[A('bestie', [0.2, 0.02, 3.2], 160, 'point', 'scared', look='hero', talk=TALK)], camera=cam('close', 'bestie', 20))
C('q15', 'stat', 'No hospital: pulso quebrado em dois lugares. Você jogou quarenta minutos com ele assim.', value=40, unit='MINUTOS', label='JOGANDO COM O PULSO QUEBRADO', icon='warning')
S('q16', 'home', 'Esse gesso sai da sua mesada.', who='adulta',
  actors=[A('mom', 'center', 160, 'point', 'angry', talk=TALK), A('hero', 'center+1.0,0,-1.5', -30, {'armR': [60, 10, -20, 95], 'armL': [4, 8, 0, 20]}, 'sad', look='mom')],
  camera=cam('close', 'mom', -25))
S('q17', 'void', 'Por isso quem nasce sem dor vive se machucando. A dor é o aviso. [deadpan] E você desligou o aviso. Solução: dor nunca abaixo de trinta.',
  actors=[A('hero', 'center', 0, {'armR': [60, 10, -20, 95], 'armL': [4, 8, 0, 20]}, 'worried')], camera=cam('medium', 'hero', -15, move='pushIn'),
  overlays=[M([('DOR', 0, 30, '@trinta')], at='@solução')])

# ================================================================ 10. problema real: sem medo (7:35–8:35)
S('x1', 'void', 'Esses doem no bolso. O próximo dói em outra pessoa.',
  actors=[A('hero', 'center', 0, 'stand', 'neutral')], camera=cam('close', 'hero', 0, move='pushIn'), sfx=[{'t': '@pessoa', 'name': 'subdrop'}])
S('x2', 'park', 'Você passa uma semana com o medo em zero. E se sente ótimo. Até o sábado.', variant=1,
  actors=[A('hero', 'center', 0, 'relaxed', 'smug')],
  camera=cam('medium', 'hero', 15), overlays=[M([('MEDO', 0)], at='@medo', y='top')])
S('x2b', 'home', 'Na quarta, a Ivy chora de medo de um trovão. Você assiste. [deadpan] Parece um vídeo engraçado.', time='interiorNight',
  actors=[A('sister', 'couch+0,0,0.5', 90, 'sit', 'cry'), A('hero', [3.0, 0, 1.5], -120, 'armsCrossed', 'smirk', look='sister')],
  camera={'pos': [4.0, 1.4, -0.7], 'look': [2.2, 1.0, 0.7], 'fov': 44}, sfx=[{'t': '@trovão', 'name': 'farBoom'}])
S('x3', 'park', 'O lago do parque congelou na primeira semana de frio. Gelo fininho.', variant=1,
  actors=[A('hero', SHORE, TO_ICE, 'stand', 'neutral'), A('bestie', [-11.0, 0, -9.8], TO_ICE, 'armsCrossed', 'worried')],
  camera={'pos': [-6, 1.7, -2], 'look': [-15, 0.6, -12], 'fov': 42, 'move': 'pushIn'}, sfx=[{'t': 0.3, 'name': 'wind', 'dur': 2.5}])
C('x4', 'stat', 'Com menos de cinco centímetros de gelo, ninguém deveria pisar. Pra andar com segurança, precisa de uns dez.',
  value=10, unit='CM', label='O MÍNIMO PRA ANDAR NO GELO', icon='warning')
S('x5', 'park', 'Você desafia o Caio, seu melhor amigo, a atravessar. [mischievously] Valendo vinte reais.', variant=1,
  actors=[A('hero', SHORE, 143, 'point', 'grin', look='bestie'), A('bestie', [-11.0, 0, -9.8], 100, 'stand', 'worried', look='hero')],
  camera=cam('medium', 'hero', 25), coverage='off', overlays=[W('R$ 20', '@vinte')])
S('x6', 'park', 'A cara do Caio está gritando. Olhos arregalados. Boca tremendo.', variant=1,
  actors=[A('bestie', ICE_MID, TO_SHORE, 'scared', 'scared', look='hero')], camera=cam('close', 'bestie', 10), sfx=[{'t': 0.4, 'name': 'crack', 'vol': -14}])
S('x7', 'park', 'E você não entende. Você acha que ele está fazendo careta. E ri.', variant=1,
  actors=[A('hero', SHORE, TO_ICE, 'shrug', 'neutral', faces=[{'t': '@ri', 'face': 'grin', 'blend': 0.3}], look='bestie')],
  camera=cam('close', 'hero', 25), sfx=[{'t': '@ri', 'name': 'pop'}])
C('x8', 'icon', 'Nos Estados Unidos, uma mulher conhecida só pelas iniciais S M perdeu a parte do cérebro que sente medo.',
  icon='brain', caption='A MULHER QUE NÃO', sub='SENTE MEDO')
C('x9', 'chain', 'Ela não sente medo. E não reconhece o medo na cara de ninguém.',
  title='SEM MEDO', nodes=[{'icon': 'brain', 'label': 'SEM ALARME'}, {'icon': 'eye', 'label': 'NÃO LÊ O MEDO'}, {'icon': 'question', 'label': 'NOS OUTROS'}])
S('x10', 'park', '[softly] É isso que você virou. Sem medo, você não vê o medo dos outros.', variant=1,
  actors=[A('hero', SHORE, TO_ICE, 'stand', 'neutral', look='bestie')], camera=cam('xclose', 'hero', 15, move='pushIn'),
  overlays=[W('MEDO', '@medo#2', color='red', y='top')], coverage='off')
S('x11', 'park', 'O gelo estala embaixo do Caio.', variant=1,
  props=[{'type': 'iceHole', 'pos': ICE_MID, 'cracks': True, 'size': 0.5, 'ignite': '@estala'}],
  actors=[A('bestie', ICE_MID, TO_SHORE, 'scared', 'shocked')], camera=cam('full', 'bestie', -20, height=25), sfx=[{'t': '@estala', 'name': 'crack'}], cut='smash')
S('x12', 'park', 'Um cachorro late do outro lado. O Caio se assusta, pula pra trás, e cai sentado na grama. Salvo por um cachorro.', variant=1,
  actors=[A('bestie', ICE_MID, TO_SHORE, 'scared', 'scared', path=[{'t': '@pula', 'pos': ICE_MID}, {'t': '@pula+0.8', 'pos': [-11.6, 0, -9.9], 'gait': 'run'}],
            poses=[{'t': '@cai', 'pose': FLOORSIT, 'blend': 0.3}])],
  props=[{'type': 'iceHole', 'pos': ICE_MID, 'cracks': True, 'size': 0.5}, {'type': 'dog', 'pos': [-14.8, 0, -19.4], 'rot': 20, 'scale': 1.6}],
  camera={'pos': [-7.8, 1.6, -5.6], 'look': [-14.4, 0.6, -12.6], 'fov': 44}, sfx=[{'t': '@late', 'name': 'pop'}, {'t': '@cai', 'name': 'thud'}])
S('x13', 'park', 'Eu quase afundei. E você riu.', who='male', variant=1,
  actors=[A('bestie', [-11.6, 0, -9.9], 40, FLOORSIT, 'angry', look='hero', talk=TALK)], camera=cam('close', 'bestie', 20, height=15))
S('x14', 'park', 'Ele vai embora. E você não sente nada. [pause] Isso deveria te assustar.', variant=1,
  actors=[A('bestie', [-10.6, 0, -9.0], 50, 'stand', 'sad', path=[{'t': 0.3, 'pos': [-10.6, 0, -9.0]}, {'t': 4.0, 'pos': [-7.6, 0, -6.2], 'gait': 'walk'}]),
          A('hero', SHORE, 45, 'stand', 'neutral', look='bestie')],
  camera={'pos': [-14.6, 1.5, -11.0], 'look': [-9.8, 1.0, -7.8], 'fov': 42})

# ================================================================ 11. batida quieta (8:35–9:05)
S('z1', 'home', 'Em casa, a sua mãe repara antes de todo mundo.', time='interiorNight',
  actors=[A('mom', 'kitchen', 30, 'armsCrossed', 'suspicious', look='hero'), A('hero', 'seat', 0, 'sit', 'neutral')],
  camera=cam('medium', 'mom', 20))
S('z2', 'home', 'Você não come há dois dias. [chuckling] Tá saindo barato.', who='adulta', time='interiorNight',
  actors=[A('mom', 'kitchen', 30, 'relaxed', 'smug', look='hero', talk=TALK), A('hero', 'seat', 0, 'sit', 'neutral')], camera=cam('close', 'mom', 25))
S('z3', 'home', 'Ela ri. Você não. Você olha pra cara dela e não sabe o que ela está sentindo.', time='interiorNight',
  actors=[A('hero', 'seat', 0, 'sit', 'confused', look='mom')], camera=cam('close', 'hero', -20))
S('z3b', 'home', 'No celular, o Caio não responde. Faz quatro dias.', time='interiorNight',
  actors=[A('hero', 'seat', 0, 'phone', 'sad', hold={'R': 'phone'})], camera=cam('close', 'hero', 30), overlays=[W('4 DIAS', '@quatro', color='white', y='top')])
S('z4', 'bedroom', 'Naquela noite, você tropeça no escuro. O coração dispara. O menu abre. E você volta tudo pro padrão.', time='interiorNight',
  actors=[A('hero', 'center', 0, 'stand', 'scared', poses=[{'t': '@tropeça', 'pose': 'fall', 'blend': 0.2}, {'t': '@tropeça+0.5', 'pose': 'stand', 'blend': 0.4}])],
  camera=cam('medium', 'hero', 15), sfx=[{'t': '@tropeça', 'name': 'thud'}, {'t': '@dispara', 'name': 'heartbeat'}],
  overlays=[M([('DOR', 30, 100, '@padrão'), ('SONO', 60, 100, '@padrão+0.1'), ('MEDO', 0, 100, '@padrão+0.2'), ('FORÇA', 100, 60, '@padrão+0.3')], at='@abre', alarm=True)])
S('z5', 'bedroom', 'E sente tudo de uma vez. O pulso. O sono. E a vergonha.', time='interiorNight',
  actors=[A('hero', BED_EDGE, 90, 'sitSlump', 'cry')], camera=cam('medium', 'hero', 0, move='pushIn'), coverage='calm')

# ================================================================ 12. maestria + regra tema (9:05–10:00)
S('y1', 'void', 'Aí você aprende com quem faz isso há milhões de anos.',
  actors=[A('hero', 'center', 0, 'thinking', 'focused')], camera=cam('medium', 'hero', 0, move='pushIn'))
C('y2', 'stat', 'Um urso hibernando derruba o coração pra menos de dez batidas por minuto. Mas nunca pra zero.',
  value='< 10', unit='BPM', label='URSO HIBERNANDO · NUNCA ZERO', icon='heart')
S('y3', 'void', 'Ele abaixa tudo pra sobreviver ao inverno. Mas deixa o alarme ligado. Baixinho.',
  actors=[A('hero', 'center', 20, 'explain', 'focused')], camera=cam('close', 'hero', 20))
S('y4', 'void', 'Você treina igual. Dor em setenta. Medo em sessenta. Nunca nos extremos.',
  actors=[A('hero', 'center', -15, 'focus', 'determined')], camera=cam('medium', 'hero', -15),
  overlays=[M([('DOR', 100, 70, '@setenta'), ('SONO', 100), ('MEDO', 100, 60, '@sessenta'), ('FORÇA', 60)], at=0.1)])
S('y4b', 'void', 'Dor em setenta ainda dói. Mas você sabe onde está o seu pulso. Medo em sessenta ainda assusta. Mas você para antes da beirada.',
  actors=[A('hero', 'center', 25, 'stand', 'focused')], camera=cam('close', 'hero', 25, move='drift'))
S('y5', 'home', 'E pra abrir o menu quando precisa, você contrata a Ivy. Ela te dá sustos. Cinco reais cada.',
  actors=[A('hero', 'couch', 90, 'sit', 'neutral'),
          A('sister', 'couch+-1.0,0,-0.9', 90, 'crouch', 'sly', poses=[{'t': '@sustos', 'pose': 'fight', 'blend': 0.15}], faces=[{'t': '@sustos', 'face': 'furious', 'blend': 0.1}])],
  camera={'pos': [3.4, 1.3, 1.6], 'look': [1.4, 0.95, -0.4], 'fov': 42}, overlays=[W('R$ 5', '@cinco')], sfx=[{'t': '@sustos', 'name': 'pop'}])
S('y6', 'home', 'Pagamento adiantado.', who='female',
  actors=[A('sister', 'couch+-1.0,0,-0.9', 90, 'holdOut', 'smug', look='hero', talk=TALK)], camera=cam('close', 'sister', 30), cut='smash')
S('y7', 'bedroom', 'Você erra. Quase deixa a força em cem de novo. O Caio, que voltou a falar com você depois de uma pizza, te segura.',
  actors=[A('hero', 'center', 30, 'power', 'determined'), A('bestie', 'center+0.7,0,0.2', -60, 'reach', 'worried', look='hero', contact=True)],
  props=[{'type': 'pizza', 'pos': 'rug'}],
  camera=cam('medium', ['hero', 'bestie'], 20))
S('y8', 'bedroom', 'Até que você escreve a regra num papel amarelo. E cola na parede, do lado da cama.',
  props=[POSTIT], actors=[A('hero', [-0.6, 0, -3.35], 180, {'reachR': {'to': [0.12, 1.5, 0.48]}}, 'focused')],
  camera={'pos': [1.0, 1.5, -1.2], 'look': [-0.75, 1.35, -3.8], 'fov': 40}, coverage='off')
S('y9', 'bedroom', 'Nunca zero. Só mais baixo.',
  props=[POSTIT], camera={'pos': [-0.75, 1.5, -2.7], 'look': [-0.85, 1.55, -3.96], 'fov': 34, 'move': 'pushIn'},
  coverage='off')

# ================================================================ 13. crise (10:00–10:30)
S('k1', 'park', 'Por dois meses, nada dá errado.', variant=1, time='golden',
  actors=[A('hero', 'center', 20, 'relaxed', 'smile')], camera=cam('wide', 'hero', 20))
S('k2', 'park', 'Até um domingo de inverno, no fim da tarde.', variant=1, time='golden',
  camera={'pos': [-6, 1.7, -2], 'look': [-15, 0.6, -12], 'fov': 44, 'move': 'drift'}, sfx=[{'t': 0.2, 'name': 'wind', 'dur': 3.0}])
S('k3', 'park', 'A Ivy está no meio do lago congelado. Ao vivo. Pros trezentos e doze inscritos.', variant=1, time='golden',
  actors=[A('sister', ICE, 40, 'phone', 'happy', hold={'R': 'phone'})],
  camera=cam('medium', 'sister', 0), overlays=[W('● AO VIVO', '@vivo', color='red', y='top')])
S('k3b', 'park', 'Ela queria o vídeo que ninguém nunca fez. E escolheu o lugar que você mesmo testou com o Caio.', variant=1, time='golden',
  actors=[A('sister', ICE, 40, 'phone', 'grin', hold={'R': 'phone'})], camera={'pos': [-6, 1.7, -2], 'look': [-15, 0.6, -12], 'fov': 34, 'move': 'pushIn'})
S('k4', 'park', '[excited] Oi, gente! Patinando sem patins!', who='female', variant=1, time='golden',
  actors=[A('sister', ICE, 40, 'holdOut', 'grin', hold={'R': 'phone'}, talk=TALK)], camera=cam('close', 'sister', 30))
S('k5', 'park', 'O gelo faz um barulho de vidro.', variant=1, time='golden',
  props=[{'type': 'iceHole', 'pos': ICE, 'cracks': True, 'size': 0.6, 'ignite': '@barulho'}],
  actors=[A('sister', ICE, 40, 'scared', 'scared', hold={'R': 'phone'})],
  camera=cam('full', 'sister', -30, height=30), sfx=[{'t': '@barulho', 'name': 'crack'}])
S('k6', 'park', 'E ela some.', variant=1, time='golden',
  props=[{'type': 'iceHole', 'pos': ICE, 'size': 0.6, 'ignite': '@some'}],
  actors=[A('sister', ICE, 40, 'fall', 'shocked', path=[{'t': '@some', 'pos': ICE}, {'t': '@some+0.25', 'pos': [ICE[0], -1.6, ICE[2]], 'gait': 'carried'}])],
  camera={'pos': [-12.6, 1.6, -9.6], 'look': [-15.5, 0.5, -12.6], 'fov': 40}, sfx=[{'t': '@some', 'name': 'splash'}], cut='smash', coverage='off')
S('k6b', 'park', 'Na margem, três adultos pegam o celular. Ninguém entra. [sarcastic] Todo mundo quer o melhor ângulo.', variant=1, time='golden',
  actors=[A('extraA', [-10.2, 0, -8.2], -130, 'phone', 'shocked', hold={'R': 'phone'}), A('extraB', [-9.2, 0, -9.2], -125, 'phone', 'surprised', hold={'R': 'phone'}),
          A('extraC', [-11.0, 0, -7.2], -135, 'phone', 'awe', hold={'R': 'phone'})],
  camera={'pos': [-12.6, 1.5, -10.6], 'look': [-10.0, 1.3, -8.0], 'fov': 44})
C('k7', 'chain', 'Água perto de zero grau tem uma regra: um minuto pra recuperar o fôlego. Dez minutos de braço funcionando. Depois, os braços param.',
  title='ÁGUA GELADA', nodes=[{'icon': 'heart', 'label': 'FÔLEGO', 'value': '1 MIN'}, {'icon': 'muscle', 'label': 'BRAÇOS', 'value': '10 MIN'}, {'icon': 'cross', 'label': 'PARAM'}])
S('k8', 'park', 'Dez minutos. Começando agora.', variant=1, time='golden',
  props=[{'type': 'iceHole', 'pos': ICE, 'size': 0.6}],
  actors=[A('sister', [ICE[0], -0.78, ICE[2]], 40, TREAD, 'scared')],
  camera=cam('close', 'sister', 20, height=20), overlays=[{'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}], sfx=[{'t': '@agora', 'name': 'ticks', 'dur': 1.0}])

# ================================================================ 14. primeira tentativa (10:30–11:15)
S('f1', 'park', 'O seu coração dispara. O menu abre sozinho. E você faz o que sempre quis fazer.', variant=1, time='golden',
  actors=[A('hero', SHORE, TO_ICE, 'shocked', 'shocked')], camera=cam('medium', 'hero', 20, height=-10),
  overlays=[M(FACTORY, at='@abre', alarm=True, y='top'), {'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}], sfx=[{'t': '@dispara', 'name': 'heartbeat'}])
S('f2', 'park', 'Medo: zero. Dor: zero. Força: cem.', variant=1, time='golden',
  actors=[A('hero', SHORE, TO_ICE, 'power', 'determined')], camera=cam('full', 'hero', 0, height=-12),
  overlays=[M([('DOR', 100, 0, '@dor'), ('SONO', 100), ('MEDO', 100, 0, '@medo'), ('FORÇA', 60, 100, '@cem')], at=0, alarm=True, y='top'),
            {'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}])
S('f3', 'park', 'Você corre pro gelo. Em pé. Rápido.', variant=1, time='golden',
  props=[{'type': 'iceHole', 'pos': ICE, 'size': 0.6}],
  actors=[A('hero', SHORE, TO_ICE, 'stand', 'determined', path=[{'t': 0.1, 'pos': SHORE}, {'t': 2.0, 'pos': ICE_MID, 'gait': 'sprint'}]),
          A('sister', [ICE[0], -0.78, ICE[2]], 40, TREAD, 'scared')],
  camera={'pos': [-9.0, 1.0, -12.8], 'look': [-13.0, 0.8, -10.6], 'fov': 46}, fx={'speedLines': 'hero'},
  overlays=[{'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}])
S('f4', 'park', 'Na terceira passada, o gelo racha embaixo de você.', variant=1, time='golden',
  props=[{'type': 'iceHole', 'pos': ICE_MID, 'cracks': True, 'size': 0.7, 'ignite': '@racha'}],
  actors=[A('hero', ICE_MID, TO_ICE, 'shocked', 'neutral')], camera=cam('full', 'hero', 20, height=35),
  sfx=[{'t': '@racha', 'name': 'crack'}], overlays=[{'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}], cut='smash')
S('f5', 'park', 'Sem medo, você não para. Sem dor, você não sente o frio subindo pelas pernas.', variant=1, time='golden',
  props=[{'type': 'iceHole', 'pos': ICE_MID, 'size': 0.55}],
  actors=[A('hero', [ICE_MID[0], -0.8, ICE_MID[2]], TO_ICE, TREAD, 'neutral')],
  camera=cam('medium', 'hero', -25, height=25), overlays=[{'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}], sfx=[{'t': 0.2, 'name': 'splash', 'vol': -12}])
S('f6', 'park', 'E quando olha pra Ivy, você não entende a cara dela. Ela grita o seu nome. Você acha que ela está brincando.', variant=1, time='golden',
  props=[{'type': 'iceHole', 'pos': ICE, 'size': 0.6}],
  actors=[A('sister', [ICE[0], -0.78, ICE[2]], 40, TREAD, 'scared', talk=[[1.0, 3.0]])],
  camera=cam('close', 'sister', -10, height=15), overlays=[{'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}])
S('f7', 'park', '[darkly amused] Você não sente nada. Mas o seu corpo sente tudo. As pernas param de obedecer.', variant=1, time='golden',
  props=[{'type': 'iceHole', 'pos': ICE_MID, 'size': 0.55}],
  actors=[A('hero', [ICE_MID[0], -0.8, ICE_MID[2]], TO_ICE, TREAD, 'confused')],
  camera=cam('close', 'hero', 30), overlays=[{'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}])
S('f8', 'park', 'Você sai do buraco de quatro e volta pra margem. O relógio não esperou.', variant=1, time='golden',
  props=[{'type': 'iceHole', 'pos': ICE_MID, 'size': 0.55}],
  actors=[A('hero', ICE_MID, TO_SHORE, FOURS, 'tired', path=[{'t': 0.3, 'pos': ICE_MID}, {'t': 3.4, 'pos': SHORE, 'gait': 'carried'}],
            poses=[{'t': round(0.3 + 0.45 * k, 2), 'pose': FOURS_B if k % 2 else FOURS, 'blend': 0.25} for k in range(7)])],
  camera={'pos': [-8.6, 1.4, -7.4], 'look': [-12.4, 0.6, -9.9], 'fov': 42}, overlays=[{'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}])

# ================================================================ 15. dilema (11:15–11:35)
S('d1', 'park', 'Força total quebra o gelo. Sem dor, você congela sem perceber. Sem medo, você não entende a sua irmã.', variant=1, time='golden',
  actors=[A('hero', SHORE, TO_ICE, 'kneel', 'worried')], camera=cam('medium', 'hero', 10), coverage='calm',
  overlays=[{'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}])
S('d2', 'park', 'Correr sem sentir nada…', variant=1, time='golden',
  actors=[A('hero', SHORE, TO_ICE, 'kneel', 'worried')], camera=cam('close', 'hero', -35), coverage='off',
  overlays=[{'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}])
S('d3', 'park', '…ou rastejar sentindo tudo.', variant=1, time='golden', hold=2,
  actors=[A('hero', SHORE, TO_ICE, 'kneel', 'determined')], camera=cam('xclose', 'hero', 10, move='pushIn'), coverage='off',
  overlays=[{'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}], sfx=[{'t': 0.4, 'name': 'heartbeat'}])

# ================================================================ 16. clímax (11:35–12:35)
S('e1', 'park', 'Você abre o menu. E pela primeira vez, não vai pro extremo.', variant=1, time='golden',
  actors=[A('hero', SHORE, TO_ICE, 'kneel', 'focused')], camera=cam('medium', 'hero', 30),
  overlays=[M([('DOR', 0), ('SONO', 100), ('MEDO', 0), ('FORÇA', 100)], at='@menu', alarm=True, y='top'), {'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}])
S('e2', 'park', 'Medo: quarenta. Pra ver o medo da Ivy. Dor: trinta. Pra sentir quando a mão estiver congelando. Força: oitenta.', variant=1, time='golden',
  actors=[A('hero', SHORE, TO_ICE, 'kneel', 'determined')], camera=cam('medium', 'hero', -20, height=-8),
  overlays=[M([('DOR', 0, 30, '@trinta'), ('SONO', 100), ('MEDO', 0, 40, '@quarenta'), ('FORÇA', 100, 80, '@oitenta')], at=0, alarm=True, y='top'),
            {'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}])
S('e3', 'park', 'Nunca zero. Só mais baixo.', variant=1, time='golden',
  actors=[A('hero', SHORE, TO_ICE, 'kneel', 'determined')], camera=cam('xclose', 'hero', 0), coverage='off',
  overlays=[W('NUNCA ZERO', '@nunca', y='top'), {'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}])
S('e4', 'park', 'Você deita no gelo. Deitado, o seu peso se espalha numa área umas dez vezes maior que a dos seus pés.', variant=1, time='golden',
  props=[{'type': 'iceHole', 'pos': ICE, 'size': 0.6}],
  actors=[A('hero', [-12.3, 0.04, -9.65], TO_ICE, 'kneel', 'focused', poses=[{'t': '@deita', 'pose': PRONE, 'blend': 0.5}])],
  camera=cam('medium', 'hero', 70, height=25), overlays=[W('10×', '@dez'), {'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}])
S('e5', 'park', 'Você rasteja. O gelo estala. Mas aguenta.', variant=1, time='golden',
  props=[{'type': 'iceHole', 'pos': ICE, 'size': 0.6}, {'type': 'iceHole', 'pos': [-13.4, 0.04, -10.7], 'cracks': True, 'size': 0.5, 'ignite': '@estala'}],
  actors=[A('hero', [-12.3, 0.04, -9.65], TO_ICE, PRONE, 'focused', path=[{'t': 0.2, 'pos': [-12.3, 0.04, -9.65]}, {'t': 3.4, 'pos': [-13.6, 0.04, -10.85], 'gait': 'carried'}],
            poses=[{'t': round(0.3 + 0.6 * k, 2), 'pose': PRONE_REACH if k % 2 else PRONE, 'blend': 0.3} for k in range(6)])],
  camera={'pos': [-11.0, 0.5, -11.6], 'look': [-13.0, 0.2, -10.2], 'fov': 42}, sfx=[{'t': '@estala', 'name': 'crack', 'vol': -10}],
  overlays=[{'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}])
S('e5b', 'park', 'A água rouba o calor do corpo umas vinte e cinco vezes mais rápido que o ar. Com a dor em trinta, você sente isso nas mãos. Ainda bem.', variant=1, time='golden',
  props=[{'type': 'iceHole', 'pos': ICE, 'size': 0.6}],
  actors=[A('hero', [-13.6, 0.04, -10.85], TO_ICE, PRONE, 'focused', faces=[{'t': '@mãos', 'face': {'eyes': 0.8, 'brow': 0.6, 'mouth': -0.6}, 'blend': 0.3}])],
  camera=cam('medium', 'hero', 60, height=20), overlays=[W('25×', '@vinte', y='top'), {'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}])
S('e6', 'park', 'E agora você vê a cara da Ivy. Ela não está brincando. Ela está apavorada.', variant=1, time='golden',
  props=[{'type': 'iceHole', 'pos': ICE, 'size': 0.6}],
  actors=[A('sister', [ICE[0], -0.78, ICE[2]], 40, TREAD, {'eyes': 1.45, 'brow': 1, 'mouth': -0.8, 'open': 0.6, 'tears': True})],
  camera=cam('close', 'sister', 5, height=10), overlays=[W('APAVORADA', '@apavorada', color='white', y='top'), {'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}])
# The grip: both right wrists on one point at the hole's edge, 1.0 m ahead of the hero's root (toward Ivy).
# reachR targets are root-local (forward = +z); Ivy is scaled 0.82, so her local target is divided by 0.82.
GRIP_H = {'to': [0.0, 0.16, 1.0]}                                       # hero (root y 0.04 -> grip y 0.2)
GRIP_I = lambda depth: {'to': [0.0, round((0.2 - depth) / 0.82 - 0.45, 3), 0.42]}  # Ivy at ICE, root y = depth
HOLD_H = {**PRONE, 'head': [-62, 0, 0], 'reachR': GRIP_H, 'armL': [150, 24, 0, 30]}
HOLD_I = lambda depth: {**TREAD, 'head': [-25, 0, 0], 'armL': [50, 35, 0, 30], 'reachR': GRIP_I(depth)}
SIDE_CAM = {'pos': [-13.83, 0.6, -14.06], 'look': [-15.3, 0.15, -12.42], 'fov': 40}  # perpendicular to the hero–Ivy line
S('e7', 'park', '[softly] Olha pra mim. Respira. Me dá a mão.', variant=1, time='golden',
  props=[{'type': 'iceHole', 'pos': ICE, 'size': 0.6}],
  actors=[A('hero', ICE_NEAR, TO_ICE, {**PRONE, 'head': [-85, 0, 0], 'armR': [170, 4, 0, 10]}, 'determined', talk=[[0.1, 2.8]]),
          A('sister', [ICE[0], -0.78, ICE[2]], TO_SHORE, {**TREAD, 'armL': [60, 40, 0, 30], 'armR': [60, 40, 0, 30]}, 'scared')],
  camera={'pos': [-14.25, 0.55, -13.55], 'look': [-14.95, 0.4, -12.1], 'fov': 40}, overlays=[{'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}], coverage='off')
S('e8', 'park', 'Ela dá.', variant=1, time='golden',
  props=[{'type': 'iceHole', 'pos': ICE, 'size': 0.6}],
  actors=[A('hero', ICE_NEAR, TO_ICE, HOLD_H, 'focused', contact=True),
          A('sister', [ICE[0], -0.78, ICE[2]], TO_SHORE, TREAD, 'scared', contact=True,
            poses=[{'t': '@dá', 'pose': HOLD_I(-0.78), 'blend': 0.3}])],
  camera=SIDE_CAM, overlays=[{'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}], coverage='off')


def PULL(sid, depth, cue_word, camera):
    up = round(depth + 0.22, 2)
    S(sid, 'park', 'Puxa.', variant=1, time='golden', hold=0.5, props=[{'type': 'iceHole', 'pos': ICE, 'size': 0.6}],
      actors=[A('hero', ICE_NEAR, TO_ICE, HOLD_H, 'determined', contact=True,
                faces=[{'t': '@puxa', 'face': {'eyes': 0.5, 'brow': -0.9, 'mouth': -0.7, 'width': 1.2}, 'blend': 0.2}]),
              A('sister', [ICE[0], depth, ICE[2]], TO_SHORE, HOLD_I(depth), 'scared', contact=True,
                path=[{'t': '@puxa', 'pos': [ICE[0], depth, ICE[2]]}, {'t': '@puxa+0.4', 'pos': [ICE[0], up, ICE[2]], 'gait': 'carried'}],
                poses=[{'t': '@puxa', 'pose': HOLD_I(depth), 'blend': 0.05}, {'t': '@puxa+0.4', 'pose': HOLD_I(up), 'blend': 0.4}])],
      camera=camera, sfx=[{'t': '@puxa', 'name': 'crack' if cue_word else 'splash', 'vol': -8}],
      overlays=[{'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}], coverage='off', **({'cut': 'smash'} if cue_word else {}))


PULL('e9', -0.78, True, {'pos': [-14.2, 0.45, -13.45], 'look': [-15.3, 0.2, -12.42], 'fov': 34})
PULL('e10', -0.56, True, {'pos': [-16.6, 0.8, -10.9], 'look': [-15.35, 0.2, -12.45], 'fov': 38})
PULL('e11', -0.34, False, {'pos': [-13.2, 2.4, -14.6], 'look': [-15.3, 0.1, -12.42], 'fov': 40})
S('e12', 'park', 'Ela sai da água de barriga, por cima do gelo. E vocês dois rastejam até a margem.', variant=1, time='golden',
  props=[{'type': 'iceHole', 'pos': ICE, 'size': 0.6}],
  actors=[A('hero', ICE_NEAR, TO_SHORE, PRONE, 'determined', path=[{'t': 0.4, 'pos': ICE_NEAR}, {'t': 4.6, 'pos': [-12.2, 0.04, -9.6], 'gait': 'carried'}]),
          A('sister', [-15.0, 0.04, -12.2], TO_SHORE, PRONE, 'scared', path=[{'t': 0.4, 'pos': [-15.0, 0.04, -12.2]}, {'t': 4.6, 'pos': [-12.8, 0.04, -10.4], 'gait': 'carried'}])],
  camera={'pos': [-8.4, 2.2, -7.2], 'look': [-12.8, 0.3, -10.2], 'fov': 42}, overlays=[{'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}])
S('e13', 'park', 'Um minuto e dez segundos sobrando.', variant=1, time='golden',
  actors=[A('hero', SHORE, 0, FLOORSIT, 'tired'), A('sister', [-12.3, 0, -9.3], 60, FLOORSIT, 'cry', contact=True)],
  camera=cam('medium', ['hero', 'sister'], 10), overlays=[{'type': 'stopwatch', 'cd': 'main', 'corner': 'bc'}, W('1:10', '@minuto', y='top')])
S('e14', 'park', 'O celular dela afunda. [deadpan] A live, não.', variant=1, time='golden',
  props=[{'type': 'iceHole', 'pos': ICE, 'size': 0.6}, {'type': 'phone', 'pos': [ICE[0], 0.05, ICE[2]], 'path': [{'t': 0.3, 'pos': [ICE[0], 0.05, ICE[2]]}, {'t': 2.0, 'pos': [ICE[0], -0.4, ICE[2]]}]}],
  camera={'pos': [-14.6, 1.0, -11.6], 'look': [-15.5, 0.0, -12.6], 'fov': 36}, sfx=[{'t': 0.3, 'name': 'splash', 'vol': -14}], cut='smash')

# ================================================================ 17. consequência (12:35–13:05)
S('h1', 'park', 'Aí chega a conta. O menu fecha. E tudo volta pra cem de uma vez.', variant=1, time='dusk',
  props=[{'type': 'rug', 'pos': [-11.6, 0.01, -9.0], 'w': 1.4, 'd': 1.2, 'color': '#d9a441'}],
  actors=[A('hero', SHORE, 0, FLOORSIT, 'shocked'), A('sister', [-12.3, 0, -9.3], 60, FLOORSIT, 'tired', contact=True)], camera=cam('medium', 'hero', 20, height=12),
  overlays=[M([('DOR', 30, 100, '@cem'), ('SONO', 100), ('MEDO', 40, 100, '@cem+0.1'), ('FORÇA', 80, 60, '@cem+0.2')], at='@conta', note='EMPRÉSTIMO VENCIDO · COBRANDO AGORA', noteAt='@fecha')])
S('h2', 'park', 'O frio. A dor nas mãos. O medo que ficou guardado. Você treme por uma hora, embrulhado num cobertor.', variant=1, time='dusk',
  props=[{'type': 'rug', 'pos': [-11.6, 0.01, -9.0], 'w': 1.4, 'd': 1.2, 'color': '#d9a441'}],
  actors=[A('hero', SHORE, 0, FLOORSIT, {'eyes': 0.9, 'brow': 1, 'mouth': -0.5, 'sweat': True}), A('sister', [-12.3, 0, -9.3], 60, FLOORSIT, 'tired', contact=True)],
  camera=cam('medium', 'hero', -20), overlays=[W('1 HORA', '@hora', color='white')])
S('h2b', 'void', 'No hospital, o médico olha as suas mãos: vermelhas, inchadas, mas inteiras. Com a dor em zero, você nem teria saído do gelo a tempo.',
  actors=[A('hero', 'center', 10, {'armL': [60, 10, -40, 70], 'armR': [60, 10, -40, 70], 'head': [25, 0, 0], 'handL': 'open', 'handR': 'open'}, 'tired')], camera=cam('close', 'hero', 10, height=10))
S('h3', 'park', 'Esse susto eu cobro em dobro.', who='female', variant=1, time='dusk',
  actors=[A('sister', [-12.3, 0, -9.3], 60, FLOORSIT, 'smug', look='hero', talk=TALK)], camera=cam('close', 'sister', 25), cut='smash')
S('h4', 'home', 'Na manhã seguinte, a live tem dois milhões de visualizações. O título: garoto sem medo salva irmã no gelo.',
  actors=[A('hero', 'couch', 90, 'phone', 'tired', hold={'R': 'phone'})], camera=cam('medium', 'hero', 30),
  overlays=[{'type': 'news', 'headline': 'GAROTO SEM MEDO SALVA IRMÃ NO GELO', 'ticker': '2.000.000 VISUALIZAÇÕES · AO VIVO', 'tag': 'VIRAL', 'safe': True, 'at': '@título'}])
S('h4b', 'home', 'A Ivy passa de trezentos e doze inscritos pra oitocentos mil. E cobra cinquenta reais por entrevista com o irmão.',
  actors=[A('sister', 'center+1.6,0,0.4', -90, 'holdOut', 'smug', hold={'R': 'phone'})], camera=cam('medium', 'sister', -20), overlays=[W('800 MIL', '@oitocentos')])
S('h4c', 'home', 'E os meus vinte reais?', who='male',
  actors=[A('bestie', 'door+-0.8,0,0.4', -100, 'armsCrossed', 'suspicious', talk=TALK)], camera=cam('close', 'bestie', 20), cut='smash')
S('h5', 'home', '[sarcastic] Sem medo. Foi justamente o medo que salvou. E por uma semana, você não toca no menu.',
  actors=[A('hero', 'couch', 90, 'sit', 'smirk')], camera=cam('close', 'hero', -20))

# ================================================================ 18. mundo maior (13:05–14:10)
S('w1', 'rooftop', 'Do outro lado da cidade, alguém assiste o vídeo quadro a quadro.', time='night',
  actors=[A('mulher', 'ledge', 0, 'phone', 'focused', hold={'R': 'phone'})], camera=cam('medium', 'mulher', 25, move='pushIn'))
S('w2', 'rooftop', 'Ela para no meio segundo antes de você deitar no gelo. O seu olho parado, olhando pro nada.', time='night',
  actors=[A('mulher', 'ledge', 0, 'phone', 'suspicious', hold={'R': 'phone'})], camera=cam('close', 'mulher', -20),
  overlays=[W('0,5 S', '@meio', color='white')])
S('w3', 'rooftop', 'Ela sabe o que é aquilo.', time='night',
  actors=[A('mulher', 'ledge', 0, 'stand', 'smirk')], camera=cam('xclose', 'mulher', 10, move='pushIn'), coverage='off', sfx=[{'t': 0.3, 'name': 'subdrop'}])
S('w4', 'suburb', 'Três dias depois, a campainha toca.',
  actors=[A('mulher', [8.45, 0.08, -11.2], 180, 'stand', 'neutral')], camera={'pos': [10.6, 1.4, -6.6], 'look': [8.45, 1.4, -12.2], 'fov': 40},
  sfx=[{'t': '@campainha', 'name': 'chime'}])
S('w5', 'suburb', 'Uma mulher de terno vinho, com um envelope.',
  actors=[A('mulher', [8.45, 0.08, -11.2], 180, 'holdOut', 'smile', hold={'R': 'letter'}), A('hero', 'door', 0, 'stand', 'suspicious', look='mulher')],
  camera=cam('medium', 'mulher', -30))
S('w6', 'suburb', '[softly] Eu sei do menu.', who='vila',
  actors=[A('mulher', [8.45, 0.08, -11.2], 180, 'holdOut', 'smirk', hold={'R': 'letter'}, look='hero', talk=TALK)], camera=cam('close', 'mulher', 15), cut='smash')
S('w7', 'home', 'No envelope, um contrato. E um número com seis zeros.',
  actors=[A('mom', 'table', 0, 'holdOut', 'awe', hold={'R': 'paper'})], camera=cam('close', 'mom', 20), overlays=[W('R$ 1.000.000', '@zeros')])
S('w8', 'home', 'Ela quer estudar você. Descobrir como desligar a dor de outras pessoas. Muitas pessoas.',
  actors=[A('mulher', 'center', -40, 'explain', 'smile', look='mom'), A('mom', 'table', 0, 'sit', 'awe', look='mulher'), A('hero', 'center+1.6,0,0.6', -90, 'armsCrossed', 'suspicious', look='mulher')],
  camera={'pos': [1.2, 1.55, 4.8], 'look': [-1.0, 1.1, -0.4], 'fov': 44})
S('w8b', 'home', 'Ela explica que o menu não é só seu. Que existem outros. Poucos. [pause] E que quem não assina com ela costuma assinar com alguém pior.',
  actors=[A('mulher', 'center', -40, 'explain', 'smile', look='hero')], camera=cam('close', 'mulher', -30))
S('w8c', 'home', 'A sua enfermeira manda lembranças.', who='vila',
  actors=[A('mulher', 'center', -10, 'stand', 'sly', look='hero', talk=TALK)], camera=cam('close', 'mulher', 15), cut='smash')
S('w9', 'home', '[menacing] Gente que precisa ir pra lugares onde a dor só atrapalha.',
  actors=[A('mulher', 'center', 20, 'stand', 'sly', look='camera')], camera=cam('close', 'mulher', 0, move='pushIn'), coverage='off')
S('w10', 'home', 'Quanto é isso em mesadas?', who='adulta',
  actors=[A('mom', 'table', 0, 'sit', 'happy', look='mulher', talk=TALK)], camera=cam('close', 'mom', -20), cut='smash')
S('w11', 'home', 'A sua mãe já está procurando uma caneta.',
  actors=[A('mom', 'table', 0, 'sit', 'focused', hold={'R': 'pen'})], camera=cam('medium', 'mom', 30))
S('w12', 'home', 'Você diz que vai pensar. A mulher sorri, como quem já sabe a resposta.',
  actors=[A('mulher', 'center', 60, 'stand', 'smirk', look='hero'), A('hero', 'center+1.6,0,0.6', -90, 'armsCrossed', 'worried', look='mulher')],
  camera=cam('close', 'mulher', 25))

S('w13', 'suburb', 'Ela vai embora a pé. Sem carro. Sem pressa. Como quem sabe que vai voltar.', time='dusk',
  actors=[A('mulher', [8.45, 0.08, -11.2], 90, 'stand', 'smirk', path=[{'t': 0.3, 'pos': [8.45, 0.08, -11.2]}, {'t': 2.2, 'pos': [8.45, 0.1, -5.0], 'gait': 'walk'}, {'t': 4.6, 'pos': [14.0, 0.1, -4.6], 'gait': 'walk'}])],
  camera={'pos': [4.0, 1.5, -1.0], 'look': [9.5, 1.2, -5.5], 'fov': 44})

# ================================================================ 19. gancho final (14:10–14:40)
S('g1', 'bedroom', 'Naquela noite, o menu abre sozinho. Sem susto. Sem alarme. Isso nunca tinha acontecido.', time='interiorNight',
  actors=[A('hero', IN_BED, 0, 'sleep', 'closed', faces=[{'t': '@abre', 'face': 'shocked', 'blend': 0.3}])],
  camera={'pos': [1.4, 1.45, 1.8], 'look': [-1.6, 0.75, -2.4], 'fov': 40, 'move': 'pushIn'},
  overlays=[M(FACTORY, at='@abre')], sfx=[{'t': '@nunca', 'name': 'subdrop'}])
S('g2', 'bedroom', 'Uma notificação. Atualização disponível. Agora com acesso às configurações de pessoas num raio de cinco metros.', time='interiorNight',
  actors=[A('hero', BED_EDGE, 90, 'sitSlump', 'shocked')], camera=cam('close', 'hero', 30),
  overlays=[M(FACTORY, at=0, title='ATUALIZAÇÃO 2.0', note='ACESSO A PESSOAS NUM RAIO DE 5 METROS', noteAt='@acesso')])
S('g3', 'bedroom', 'E aparecem quatro barras novas. São da Ivy, dormindo no quarto ao lado.', time='interiorNight',
  actors=[A('hero', BED_EDGE, 90, 'sitSlump', 'awe', look=[0.5, 1.6, -0.5])], camera=cam('medium', 'hero', -25),
  overlays=[M(FACTORY, at='@barras', title='IVY')])
S('g4', 'bedroom', 'Você poderia apagar o medo de gelo dela pra sempre. Ou o medo da sua mãe de perder dinheiro. [pause] Ou o de qualquer um.', time='interiorNight',
  actors=[A('hero', BED_EDGE, 90, 'sitThink', 'focused')], camera=cam('close', 'hero', 10, move='pushIn'), coverage='calm')
S('g4b', 'bedroom', 'Seria tão fácil. Uma barra. Um dedo. Ninguém ia saber.', time='interiorNight', coverage='off',
  actors=[A('hero', BED_EDGE, 90, {'hipY': -0.46, 'spine': [10, 0, 0], 'legL': [88, 6, 92], 'legR': [88, 6, 92], 'armR': [70, 6, 0, 10], 'handR': 'point', 'armL': [10, 10, 0, 30]}, 'focused')],
  camera={'pos': [0.9, 1.35, 0.4], 'look': [-1.3, 0.95, -2.3], 'fov': 38},
  overlays=[M([('DOR', 100), ('SONO', 100), ('MEDO', 100, 70, '@dedo'), ('FORÇA', 60)], at='@barra', title='IVY')])
S('g5', 'suburb', 'Aí o menu mostra mais alguém no raio. Do lado de fora da sua janela.', time='night',
  actors=[A('mulher', [6.5, 0.08, -9.5], 180, 'stand', 'smirk', look=[6.5, 4, -17])], camera={'pos': [7.2, 1.6, -6.9], 'look': [6.5, 1.5, -9.5], 'fov': 42, 'move': 'pushIn'},
  sfx=[{'t': '@fora', 'name': 'subdrop'}])
S('g6', 'suburb', 'Medo: zero.', time='night', hold=1,
  actors=[A('mulher', [6.5, 0.08, -9.5], 180, 'stand', 'sly', look='camera')], camera=cam('xclose', 'mulher', 0, move='pushIn'), coverage='off',
  overlays=[M([('DOR', 100), ('SONO', 100), {'label': 'MEDO', 'value': 0, 'warn': True}, ('FORÇA', 60)], at=0.05, title='ELA')], cut='smash')

# ================================================================ 20. CTA (14:40–15:00)
S('i1', 'void', 'Então: qual barra você mexeria primeiro? E pra quanto?',
  actors=[A('hero', 'center', 0, 'shrug', 'smirk')], camera=cam('medium', 'hero', 0),
  overlays=[M(FACTORY, at=0.3)])
C('i2', 'title', 'E se essa atualização chegasse pra você: você mudaria o medo de outra pessoa? Conta pra gente nos comentários. Todo poder tem um preço. Até a próxima.',
  small='VOCÊ MUDARIA O MEDO', big='DE OUTRA PESSOA?')

# ---------------------------------------------------------------- estilo novo: calm dilemma
by_id = {s['id']: s for s in shots}
for sid in ('d1',):
    by_id[sid]['coverage'] = 'calm'

ep = episode(
    SLUG, TITLE,
    ritmo='rapido',
    voices={**HOUSE_VOICES, 'vila': 'pFZP5JQG7iQjIQuC4Bku'},  # Lily — velvety; a slight accent suits the stranger
    clips=[
        ('Um carro vinha, e eu abri o menu do meu corpo', 'a1', 's5'),
        ('O teste do balde de gelo', 'p1', 'r8'),
        ('O que eu fiz com o menu do corpo', 'v1', 'v15'),
        ('Sem medo, você não vê o medo dos outros', 'x1', 'x14'),
        ('A irmã caiu no gelo ao vivo', 'k3', 'd3'),
        ('Nunca zero: o resgate no gelo', 'e1', 'h3'),
    ],
    cast={
        'bestie': {'name': 'Caio'},
        'sister': {'name': 'Ivy'},
        'mom': {'name': 'Mãe'},
        'kid': {'name': 'Menino da rua'},
        'rival': {'name': 'Bruno'},
        'teacher': {'name': 'Diretor', 'hair': 'none'},
        'extraB': {'name': 'Vizinha'},
        'rute': {'name': 'Dona Rute', 'top': 'coat', 'topColor': '#f3f1ea', 'accent': '#e05a6a', 'bottom': 'pants', 'bottomColor': '#3a4256', 'shoes': '#ffffff', 'hair': 'bun', 'glasses': True, 'glassesColor': '#9fd3f2'},
        'mulher': {'name': 'Mulher de terno vinho', 'top': 'suit', 'topColor': '#6e1f33', 'accent': '#f0d9a8', 'bottom': 'pants', 'bottomColor': '#1d1a24', 'shoes': '#1b1b20', 'hair': 'bob'},
    },
    music=[('a1', 'none')],
)

# ---------------------------------------------------------------- the 10-minute cold-water clock (piecewise: the failed try costs time)
tm = load_timing(SLUG)
if tm is None:
    for sh in shots:
        for o in sh.get('overlays', []):
            if o.pop('cd', None):
                o['from'] = '10:00'
else:
    idx = shot_index()
    keys = [(tm.at('k8', 'agora'), 600.0), (tm.start('f8') + tm.dur('f8'), 420.0), (tm.start('e13'), 70.0)]

    def clock_at(T):
        if T <= keys[0][0]:
            return keys[0][1], 0.0
        for (t0, v0), (t1, v1) in zip(keys, keys[1:]):
            if T <= t1:
                rate = (v0 - v1) / (t1 - t0)
                return v0 - (T - t0) * rate, rate
        return keys[-1][1], 0.0

    last = 'e13'
    for i, sh in enumerate(shots):
        for o in sh.get('overlays', []):
            if not o.pop('cd', None):
                continue
            st = tm.tm['shots'][i]['start']
            begin = max(st, keys[0][0])
            left, rate = clock_at(begin + 0.01)
            if rate == 0.0:
                rate = 0.001
            left = max(0.0, left)
            o.update({'from': f'{int(left // 60)}:{int(left % 60):02d}', 'tick': round(rate, 3), 'keep': sh['id'] != last})
            if st < keys[0][0]:
                o['at'] = round(keys[0][0] - st, 3)
            else:
                o['persist'] = True

write(SLUG, ep)
