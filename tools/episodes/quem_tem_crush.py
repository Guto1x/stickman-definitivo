# Source of public/episodes/quem-tem-crush/episode.json — edit HERE, then run:
#   .venv/Scripts/python -I tools/episodes/quem_tem_crush.py
# (episode.json is regenerated from this file; hand edits to the JSON get overwritten.)
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # python -I drops the script dir
from kit import *  # noqa: E402,F401,F403  (A, S, C, cam, crush, TALK, episode, load_timing, write, …)

SLUG = 'quem-tem-crush'
PINK = '#ff4f9a'


BENCH2 = 'bench+-0.42,0,-0.42'  # next seat along the plaza bench (tangent to the ring at 135°)
RIVAL = 'bench+1.1,0,-0.5'    # standing in front of the bench, facing it (rot -45)
RULES = ['O BRILHO ATRAVESSA TUDO', 'O NÚMERO MUDA NA HORA', 'SUA VOZ FAZ O NÚMERO SUBIR']

# ---------------------------------------------------------------- 1. abertura fria (sala de aula)
S('c1', 'classroom', 'Você precisa de uma dupla pra feira de ciências. E ninguém olha pra você.',
  props=[{'type': 'sign', 'pos': [-4.3, 0.95, 2.2], 'rot': 90, 'w': 0.62, 'h': 0.3, 'text': 'FEIRA DE CIÊNCIAS: DUPLAS', 'bg': '#f6f2e8', 'fg': '#1d2333'}],
  camera={'pos': [-3.1, 1.15, 2.3], 'look': [-4.3, 0.95, 2.2], 'fov': 30, 'move': 'pushIn'})
S('c2', 'classroom', 'Você olha em volta. Todo mundo já tem alguém.',
  actors=[A('hero', 'seat1', -90, 'sit', 'worried'), A('bestie', 'seat3', -90, 'sit', 'happy')],
  camera=cam('close', 'hero', 20, move='drift'))
S('c3', 'classroom', 'Aí você vê: a menina da fileira de trás está brilhando. Rosa. Setenta e três por cento.',
  actors=[A('lia', 'seat2', -90, 'sit', 'smile', glow=PINK)],
  camera=cam('medium', 'lia', 35, move='pushIn'),
  overlays=[crush('lia', 73, 0, at='@rosa')], sfx=[{'t': '@rosa', 'name': 'glint'}])
S('c4', 'classroom', 'Você levanta e vai direto até ela.',
  actors=[A('lia', 'seat2', -90, 'sit', 'smile', glow=PINK),
      A('hero', 'seat1', -90, 'stand', 'determined', path=[{'t': 0.2, 'pos': 'seat1+0,0,0.7'}, {'t': 1.6, 'pos': 'seat2+-0.75,0,0.7', 'gait': 'walk'}])],
  camera=cam('full', 'hero', 40, move='track'))
S('c5', 'classroom', 'Ela diz sim antes de você terminar a pergunta. O estojo dela vai pro chão.',
  actors=[A('lia', 'seat2', -90, 'sit', 'grin', glow=PINK, faces=[{'t': 0.4, 'face': {'mouth': 1, 'open': 0.4, 'eyes': 0.8, 'blush': True}}]),
      A('hero', 'seat2+-0.75,0,0.7', 60, 'relaxed', 'smile', look='lia')],
  props=[{'type': 'book', 'pos': [1.5, 0.8, 1.45], 'color': '#ff7a3d', 'path': [{'t': '@estojo', 'pos': [1.5, 0.8, 1.45]}, {'t': '@chão', 'pos': [1.15, 0.03, 1.2]}]}],
  camera=cam('medium', ['lia', 'hero'], -20),
  overlays=[crush('lia', 80, 73, at='@sim')], sfx=[{'t': '@chão', 'name': 'thud'}])
S('c6', 'classroom', 'Como você sabia que ela ia topar?', who='male',
  actors=[A('bestie', 'seat3', 60, 'sit', 'confused', talk=TALK)],
  camera=cam('close', 'bestie', 0))
S('c7', 'classroom', 'Intuição.', hold=0.4,
  actors=[A('hero', 'seat2+-0.75,0,0.7', -60, 'confident', 'smug', talk=[[0.05, 0.7]])],
  camera=cam('close', 'hero', -10))
S('c8', 'classroom', 'E através da parede, na sala ao lado, mais um brilho rosa. De alguém que você nunca viu.',
  actors=[A('extraA', [5.82, 0, -2.0], -90, 'relaxed', 'neutral', ghost=True, glow=PINK)],
  camera={'pos': [4.3, 1.5, -0.4], 'look': [6, 1.4, -2.0], 'fov': 40, 'move': 'pushIn'},
  overlays=[crush('extraA', 52, 0, at='@brilho')], sfx=[{'t': '@brilho', 'name': 'glint'}])

# ---------------------------------------------------------------- 2. pergunta do título
S('t1', 'suburb', 'E se você pudesse ver quem tem crush em você? Vamos ver o que isso realmente muda.',
  actors=[A('hero', 'sidewalk', 10, 'confident', 'smirk')],
  camera=cam('wide', 'hero', 35, height=8, move='pushIn'),
  overlays=[{'type': 'title', 'small': 'E SE VOCÊ PUDESSE VER', 'big': 'QUEM TEM CRUSH EM VOCÊ?', 'at': 0.2}])

# ---------------------------------------------------------------- 3. mecanismo + limite
C('m1', 'icon', 'Funciona assim: quem tem crush em você brilha. Um brilho rosa, bem no peito.',
  icon='heart', caption='QUEM TEM CRUSH EM VOCÊ', sub='BRILHA ROSA')
S('m2', 'void', 'E em cima da cabeça aparece um número, de zero a cem. O quanto a pessoa gosta de você. Agora.',
  actors=[A('lia', 'left', 30, 'relaxed', 'smile', glow=PINK), A('hero', 'right', -40, 'relaxed', 'surprised', look='lia')],
  camera=cam('medium', ['lia', 'hero'], 0, move='drift'),
  overlays=[crush('lia', 73, 0, at='@número')])
S('m3', 'void', 'Isso é tudo que muda. O resto continua igual.',
  actors=[A('hero', 'center', 0, 'explain', 'focused')], camera=cam('medium', 'hero', 15))
C('m4', 'icon', 'Você só vê o que as pessoas sentem por você. De mais ninguém. Nem o que você mesmo sente.',
  icon='eye', caption='SÓ O QUE SENTEM POR VOCÊ', sub='NEM O QUE VOCÊ SENTE')
S('m5', 'void', 'Anota isso. Você vai precisar.',
  actors=[A('hero', 'center', 0, 'point', 'determined')], camera=cam('xclose', 'hero', -10, move='pushIn'))

# ---------------------------------------------------------------- 4. escada de números + ciência
C('s1', 'icon', 'Agora, a parte estranha: seu corpo já tenta fazer isso sozinho.',
  icon='brain', caption='SEU CORPO JÁ TENTA')
C('s2', 'stat', 'Seu cérebro julga um rosto em um décimo de segundo.',
  value=100, unit='MILISSEGUNDOS', label='PRA JULGAR UM ROSTO', icon='brain')
C('s3', 'icon', 'E nos anos sessenta, o psicólogo Eckhard Hess mediu outra coisa: a pupila aumenta quando você olha pra algo que te interessa.',
  icon='eye', caption='A PUPILA AUMENTA', sub='QUANDO ALGO TE INTERESSA')
C('s4', 'distance', 'Só que, pra ver uma pupila mudar, você precisa estar a um palmo do rosto da pessoa.',
  value=20, unit='CENTÍMETROS', count=1, pose='stand', target='eye')
C('s5', 'distance', 'Pra ver alguém ficar vermelho, uns dois metros.',
  value=2, unit='METROS', count=1, pose='stand', target='heart')
C('s6', 'compare', 'Você: do outro lado do pátio, atravessando parede, com número exato. Duzentas e cinquenta vezes mais longe que uma pupila.',
  title='DE ONDE DÁ PRA SABER', left={'label': 'PUPILA', 'value': 0.2, 'display': '20 CM', 'icon': 'eye'},
  middle={'label': 'RUBOR', 'value': 2, 'display': '2 M', 'icon': 'heart'}, right={'label': 'VOCÊ', 'value': 50, 'display': '50 M', 'icon': 'stand'}, ratioLabel='MAIS LONGE', at='@pátio')
S('s7', 'home', 'E não, não é amor. É crush. Sua mãe, sua avó, seus professores: zero. Ainda bem.',
  actors=[A('mom', 'kitchen', 20, 'relaxed', 'happy'), A('hero', 'table', -150, 'relaxed', 'smirk', look='mom')],
  camera=cam('medium', ['mom', 'hero'], 20),
  overlays=[crush('mom', 0, at='@mãe')])

# ---------------------------------------------------------------- 5. teste de prova (educação física)
SCREEN = {'type': 'screen', 'pos': 'sideline+0,1.4,-3.2', 'w': 3.2, 'h': 1.4, 'text': 'BATIMENTOS', 'fg': '#ff6fa8'}
S('p1', 'stadium', variant=1, vo='Na educação física, todo mundo usa uma faixa no peito que mede o coração.',
  props=[SCREEN],
  actors=[A('coach', 'sideline+2,0,-1', -90, 'armsCrossed', 'suspicious'), A('hero', 'sideline+-1,0,-1.5', 0, 'relaxed', 'happy'),
      A('bestie', 'sideline+-2,0,-1.2', 20, 'relaxed', 'smile'), A('duda', 'sideline+3.2,0,-1.8', -10, 'stretch', 'happy')],
  camera=cam('wide', 'hero', 25, height=6, move='drift'))
S('p2', 'stadium', variant=1, vo='Os batimentos de cada um aparecem no telão.',
  props=[dict(SCREEN, text='DUDA: 92 BPM')], camera={'pos': [-6, 1.9, 26.5], 'look': [-6, 1.6, 22.8], 'fov': 34})
S('p3', 'stadium', variant=1, vo='Prova.', who='male',
  actors=[A('bestie', 'sideline+-2,0,-1.2', 60, 'armsCrossed', 'suspicious', look='hero', talk=[[0.05, 0.8]])],
  camera=cam('close', 'bestie', 10))
S('p4', 'stadium', variant=1, vo='Você passa do lado da Duda. Oitenta e um por cento.',
  actors=[A('duda', 'sideline+0.4,0,-2', 10, 'relaxed', 'happy', glow=PINK),
      A('hero', 'sideline+-1.5,0,-1', 90, 'relaxed', 'smirk', path=[{'t': 0.1, 'pos': 'sideline+-1.5,0,-1'}, {'t': 2.0, 'pos': 'sideline+1.6,0,-1', 'gait': 'walk'}])],
  camera=cam('full', 'duda', -15, move='drift'), overlays=[crush('duda', 81, 0, at='@duda')])
C('p5', 'stat', 'No telão, o coração dela pula de noventa e dois pra cento e vinte e oito.',
  value=128, **{'from': 92}, unit='BPM', label='O CORAÇÃO DA DUDA', icon='heart')
S('p6', 'stadium', variant=1, vo='Passa de novo.', who='adulto',
  actors=[A('coach', 'sideline+2,0,-1', -90, 'armsCrossed', 'suspicious', talk=[[0.05, 0.9]])], camera=cam('close', 'coach', 10))
S('p7', 'stadium', variant=1, vo='Você passa de novo. Cento e trinta.',
  actors=[A('duda', 'sideline+0.4,0,-2', 10, 'relaxed', 'embarrassed', glow=PINK),
      A('hero', 'sideline+1.6,0,-1', -90, 'relaxed', 'smirk', path=[{'t': 0.1, 'pos': 'sideline+1.6,0,-1'}, {'t': 1.8, 'pos': 'sideline+-1.5,0,-1', 'gait': 'walk'}])],
  camera=cam('full', 'duda', 20), overlays=[crush('duda', 81, at=0), {'type': 'label', 'text': '130 BPM', 'at': '@cento', 'corner': 'tr'}])
S('p8', 'stadium', variant=1, vo='O professor Ramos olha o telão. Olha pra você. Olha o telão de novo.',
  actors=[A('coach', 'sideline+2,0,-1', -90, 'thinking', 'suspicious',
        poses=[{'t': 0.0, 'pose': {'spine': [4, 0, 0], 'armR': [55, 10, -40, 140], 'armL': [30, 20, -60, 115], 'head': [0, -50, 0]}}, {'t': '@você', 'pose': {'spine': [4, 0, 0], 'armR': [55, 10, -40, 140], 'armL': [30, 20, -60, 115], 'head': [0, 30, 0]}}, {'t': '@novo', 'pose': {'spine': [4, 0, 0], 'armR': [55, 10, -40, 140], 'armL': [30, 20, -60, 115], 'head': [0, -50, 0]}}])],
  camera=cam('xclose', 'coach', 0))
S('p9', 'stadium', variant=1, vo='Hidratação. Todo mundo bebe água.', who='adulto',
  actors=[A('coach', 'sideline+2,0,-1', -90, 'point', 'focused', talk=TALK)], camera=cam('medium', 'coach', 20))
S('p10', 'stadium', variant=1, vo='Aí você passa do lado do Caio. Zero.',
  actors=[A('bestie', 'sideline+-2,0,-1.2', 20, 'confident', 'smug'), A('hero', 'sideline+-1,0,-1.5', -20, 'relaxed', 'neutral', look='bestie')],
  camera=cam('medium', ['bestie', 'hero'], 15), overlays=[crush('bestie', 0, at='@zero')])
S('p11', 'stadium', variant=1, vo='Nem um pouquinho?', who='male',
  actors=[A('bestie', 'sideline+-2,0,-1.2', 20, 'shrug', 'sad', look='hero', talk=[[0.05, 1.2]])], camera=cam('close', 'bestie', 10))
S('p12', 'stadium', variant=1, vo='Zero.',
  actors=[A('hero', 'sideline+-1,0,-1.5', -20, 'relaxed', 'smirk', talk=[[0.05, 0.6]])], camera=cam('close', 'hero', -15))

# ---------------------------------------------------------------- 6. regras
C('r1', 'rules', 'Em uma semana, você descobre as regras.', title='AS REGRAS', prefix='REGRA', rules=RULES, current=0)
C('r2', 'rules', 'Regra um: o brilho atravessa tudo. Parede, porta, ônibus.', title='AS REGRAS', prefix='REGRA', rules=RULES, current=1)
S('r3', 'classroom', 'Aquele brilho da sala ao lado continua lá, todo dia. Você cola o ouvido na parede pra descobrir quem é.', variant=1,
  actors=[A('extraA', [5.82, 0, -2.0], -90, 'relaxed', 'neutral', ghost=True, glow=PINK), A('hero', [5.45, 0, -1.4], 90, 'lean', 'focused', poses=[{'t': 0, 'pose': {'spine': [6, 0, 0], 'head': [0, 0, 25], 'armR': [70, 40, 0, 120]}}])],
  camera={'pos': [2.6, 1.6, 0.8], 'look': [5.5, 1.25, -1.5], 'fov': 40})
S('r4', 'classroom', 'Algum problema com a parede?', who='adulta', variant=1,
  actors=[A('teacher', [3.6, 0, -0.2], 123, 'armsCrossed', 'suspicious', talk=TALK), A('hero', [5.45, 0, -1.4], -57, 'shocked', 'embarrassed', look='teacher')],
  camera={'shot': 'medium', 'target': 'teacher', 'over': 'hero'})
C('r5', 'rules', 'Regra dois: o número muda na hora.', title='AS REGRAS', prefix='REGRA', rules=RULES, current=2)
S('r6', 'classroom', 'Você tropeça na frente da turma inteira. O da Lia cai de setenta e três pra sessenta e nove.',
  actors=[A('lia', 'seat2', -90, 'sit', 'surprised', glow=PINK),
      A('hero', 'front+0.6,0,0.6', 90, 'stand', 'shocked', poses=[{'t': 0.3, 'pose': 'fall', 'blend': 0.2}, {'t': 0.75, 'pose': 'kneel', 'blend': 0.3}])],
  camera={'pos': [-5.0, 2.4, 2.6], 'look': [0.2, 0.6, 0.8], 'fov': 50}, overlays=[crush('lia', 69, 73, at='@lia')], sfx=[{'t': 0.5, 'name': 'thud'}])
S('r7', 'classroom', 'Aí você faz piada do próprio tombo. Setenta e quatro.',
  actors=[A('lia', 'seat2', -90, 'sit', 'grin', glow=PINK), A('hero', 'front+0.6,0,0.6', 90, 'shrug', 'grin', look='lia')],
  camera={'pos': [-5.0, 2.4, 2.6], 'look': [0.2, 0.7, 0.8], 'fov': 44}, overlays=[crush('lia', 74, 69, at='@setenta')])
C('r8', 'rules', 'Regra três: quando a pessoa ouve a sua voz, o número pula.', title='AS REGRAS', prefix='REGRA', rules=RULES, current=3)
S('r9', 'cafeteria', 'Você dá oi pra Duda no refeitório. Noventa.', variant=1,
  actors=[A('duda', 'seat1', 0, 'sit', 'happy', glow=PINK), A('hero', [2.25, 0, 2.75], 180, {'armR': [40, 60, 0, 90], 'handR': 'open'}, 'smile')],
  camera={'shot': 'medium', 'target': 'duda', 'over': 'hero'}, overlays=[crush('duda', 90, 81, at='@oi')])
S('r10', 'cafeteria', 'Você para de dar oi pras pessoas. Por segurança.', variant=1,
  actors=[A('hero', 'aisle', 90, 'stand', 'worried', path=[{'t': 0.2, 'pos': 'aisle'}, {'t': 2.2, 'pos': 'aisle+3,0,0', 'gait': 'sneak'}])],
  camera=cam('full', 'hero', 30, move='track'))

# ---------------------------------------------------------------- 7. montagem de vantagens
S('k1', 'cafeteria', 'E aí começa a parte boa. No refeitório, você nunca mais senta no lugar errado.', variant=0,
  actors=[A('hero', 'seat3', 0, 'sit', 'happy'), A('lia', 'seat1', 0, 'sit', 'smile', glow=PINK)],
  camera=cam('wide', 'hero', 10, move='drift'))
PIC = 'picnic'
GROUP = [A('hero', 'picnic+0,0,0.6', 180, 'kneel', 'smug'), A('bestie', 'picnic+0.9,0,0', -90, 'kneel', 'happy'),
     A('extraA', 'picnic+0,0,-0.7', 0, 'kneel', 'surprised'), A('extraC', 'picnic+-0.9,0,0', 90, 'kneel', 'grin')]
S('k2', 'park', 'No verdade ou desafio, alguém pergunta quem gosta de você. Você acerta todas.',
  actors=GROUP, camera=cam('medium', 'hero', 160, height=20, move='drift'))
S('k3', 'park', 'Você é banido do verdade ou desafio. Pra sempre.',
  actors=[A('hero', 'picnic+0,0,0.6', 180, 'shrug', 'embarrassed'), A('bestie', 'picnic+0.9,0,0', -90, 'point', 'grin', look='hero'),
      A('extraA', 'picnic+0,0,-0.7', 0, 'kneel', 'smug'), A('extraC', 'picnic+-0.9,0,0', 90, 'kneel', 'grin')],
  camera=cam('medium', 'hero', -150, height=15), sfx=[{'t': '@banido', 'name': 'pop'}])
S('k4', 'park', 'Você tenta abrir um negócio: cinco reais pra dizer se o crush de alguém gosta dele.',
  actors=[A('hero', 'bench', 135, 'sit', 'smug'), A('rival', RIVAL, -45, 'holdOut', 'happy', look='hero')],
  camera=cam('medium', ['hero', 'rival'], 20))
S('k5', 'park', 'Primeiro cliente: o Rafa. Ele aponta a menina. Ela não brilha. Não pra você.',
  actors=[A('rival', RIVAL, 160, 'point', 'happy'), A('extraB', 'fountain+1.2,0,0.6', -20, 'relaxed', 'neutral')],
  camera=cam('medium', 'extraB', 0), overlays=[crush('extraB', 0, at='@brilha')])
S('k6', 'park', 'Você não faz ideia do que ela sente por ele. Reembolso total.',
  actors=[A('hero', 'bench', 135, 'sit', 'embarrassed'), A('rival', RIVAL, -45, 'armsCrossed', 'angry', look='hero')],
  camera=cam('medium', ['hero', 'rival'], 70), sfx=[{'t': '@reembolso', 'name': 'click'}])
S('k7', 'cafeteria', 'Uma tarde, o número da Duda despenca: de oitenta e um pra quarenta. Você tinha esquecido de responder uma mensagem dela.', variant=1,
  actors=[A('duda', 'seat2', 0, 'sit', 'sad', glow=PINK, hold={'R': 'phone'})],
  camera=cam('medium', 'duda', 15, move='pushIn'), overlays=[crush('duda', 40, 81, at='@despenca', countDur=1.4)])
S('k8', 'cafeteria', 'Você não gosta dela desse jeito. Mas você vai até lá e conta a verdade, com cuidado.', variant=1,
  actors=[A('duda', 'seat2', 0, 'sit', 'sad', glow=PINK),
      A('hero', [0.4, 0, 2.75], -90, 'relaxed', 'worried', path=[{'t': 0.2, 'pos': [0.4, 0, 2.75]}, {'t': 2.6, 'pos': [-3.0, 0, 2.75], 'gait': 'walk', 'rot': 180}])],
  camera={'pos': [-0.6, 1.6, 5.6], 'look': [-2.8, 1.0, 1.6], 'fov': 45})
S('k9', 'cafeteria', 'Obrigada por falar primeiro.', who='female', variant=1,
  actors=[A('duda', 'seat2', 0, 'sit', 'smile', glow=PINK, talk=TALK), A('hero', [-3.0, 0, 2.75], 180, 'relaxed', 'worried')],
  camera={'shot': 'medium', 'target': 'duda', 'over': 'hero'})
S('k10', 'cafeteria', 'O número dela cai. Ela sorri mesmo assim. É a melhor coisa que você faz com esse poder.', variant=1,
  actors=[A('duda', 'seat2', 0, 'sit', 'smile', glow=PINK), A('hero', [-3.0, 0, 2.75], 180, 'relaxed', 'smile')],
  camera={'pos': [-0.6, 1.6, 5.6], 'look': [-2.8, 1.0, 1.6], 'fov': 45}, overlays=[crush('duda', 30, 40, at='@cai')])
S('k11', 'park', 'Até que você se gaba pro Caio: cinco pessoas gostam de você só essa semana.',
  actors=[A('hero', 'path', 30, 'confident', 'smug', talk=TALK), A('bestie', 'path+1.2,0,0', -30, 'armsCrossed', 'bored', look='hero')],
  camera=cam('medium', ['hero', 'bestie'], 0))
S('k12', 'park', 'A Lia escuta. Setenta e quatro. Sessenta e cinco. Se exibir derruba o número.',
  actors=[A('hero', 'path', 30, 'facepalm', 'embarrassed'), A('bestie', 'path+1.2,0,0', -30, 'armsCrossed', 'smug', look='hero'), A('lia', 'path+0.6,0,-2.6', 0, 'relaxed', 'sad', glow=PINK)],
  camera=cam('full', ['hero', 'bestie', 'lia'], 0, height=8), overlays=[crush('lia', 65, 74, at='@sessenta')])

# ---------------------------------------------------------------- 8. "mas" + problemas
S('q1', 'void', 'Essa é a versão divertida. Aqui vem a conta.',
  actors=[A('hero', 'center', 0, {'spine': [28, 0, 0], 'head': [-12, 0, 0], 'hipY': -0.05, 'armL': [-4, 2, 0, 0], 'armR': [-4, 2, 0, 0], 'legL': [10, 4, 18], 'legR': [10, 4, 18]}, 'worried')], camera=cam('medium', 'hero', 0, height=-18, move='pullOut'))
FANS = [('lia', [2.0, 0, 1.7], 58), ('duda', [2.0, 0, 0.0], 81), ('extraA', [0.2, 0, -1.7], 36), ('extraB', [2.0, 0, -1.7], 49), ('extraC', [3.8, 0, 0.0], 62)]
S('q2', 'classroom', 'Problema um: você não consegue desligar. Na aula de matemática, cinco corações piscando em volta de você.', variant=1,
  actors=[A('hero', [0.2, 0, 0.0], -90, 'sit', 'tired')] + [A(i, p, -90, 'sit', 'happy', glow=PINK) for i, p, _ in FANS],
  camera={'pos': [0.8, 2.3, 7.5], 'look': [1.2, 0.9, 0.0], 'fov': 40, 'move': 'drift'},
  overlays=[crush(i, v, 0, at=0.4 + 0.35 * k) for k, (i, _, v) in enumerate(FANS)])
S('q3', 'classroom', 'Cinco números mudando o tempo inteiro. Você não escuta uma palavra da professora.', variant=1,
  actors=[A('hero', [0.2, 0, 0.0], -90, 'sit', 'tired', faces=[{'t': 1.0, 'face': 'sleepy'}])],
  camera=cam('close', 'hero', 15), sfx=[{'t': 0.3, 'name': 'ticks'}])
C('q4', 'stat', 'Sua nota cai de oito e meio pra seis.', value='8,5 → 6', label='SUA NOTA DE MATEMÁTICA', icon='check')
S('q5', 'classroom', 'Solução: sentar na primeira fileira, de frente pro quadro, onde ninguém entra no seu campo de visão.', variant=1,
  actors=[A('hero', [-1.6, 0, 0.0], -90, 'sit', 'focused')], camera={'pos': [-4.6, 1.7, -0.2], 'look': [-1.6, 0.95, 0.0], 'fov': 34})
S('q6', 'classroom', 'Primeira fileira? Você?', who='adulta', variant=1,
  actors=[A('teacher', 'board+0.6,0,1.2', 70, 'armsCrossed', 'surprised', talk=TALK), A('hero', [-1.6, 0, 0.0], -90, 'sit', 'smile')],
  camera=cam('medium', ['teacher', 'hero'], -30))
S('q7', 'bedroom', 'Problema dois: você começa a anotar.',
  actors=[A('hero', 'desk', 180, 'typing', 'focused')], camera=cam('medium', 'hero', -150, move='pushIn'))
C('q8', 'stat', 'Uma planilha. Trinta e quatro nomes, trinta e quatro números, atualizada todo dia.', value=34, unit='NOMES', label='A PLANILHA', icon='check')
S('q9', 'bedroom', 'Você confere umas quarenta vezes por dia. E sem perceber, fica mais legal com quem tem oitenta do que com quem tem dez.',
  actors=[A('hero', 'desk', 180, 'typing', 'smug')], camera=cam('close', 'hero', -160),
  overlays=[{'type': 'label', 'text': '40× POR DIA', 'at': '@quarenta', 'corner': 'tr'}])
S('q10', 'bedroom', 'Sua irmã caçula acha a planilha.',
  actors=[A('sister', 'desk+0.6,0,1.2', -157, 'reach', 'surprised', look=[2.75, 1.05, -3.4]), A('hero', 'rug+1,0,-0.4', 60, 'relaxed', 'worried', look='sister')],
  camera={'pos': [1.0, 1.5, 3.0], 'look': [2.7, 1.0, -1.4], 'fov': 40})
S('q11', 'bedroom', 'Por que a Duda tem uma setinha pra baixo?', who='female',
  actors=[A('sister', 'desk+0.6,0,1.2', -120, 'point', 'confused', look='hero', talk=TALK), A('hero', 'rug+1,0,-0.4', 60, 'scared', 'embarrassed', look='sister')],
  camera={'pos': [1.2, 1.5, 3.2], 'look': [2.4, 1.0, -1.2], 'fov': 42})
S('q12', 'bedroom', 'É trabalho de geografia.',
  actors=[A('hero', 'rug+1,0,-0.4', 60, 'shrug', 'embarrassed', talk=[[0.05, 1.2]])], camera=cam('close', 'hero', 10))
S('q13', 'bedroom', 'Desde quando você faz planilha?', who='adulta',
  actors=[A('mom', 'door', -90, 'armsCrossed', 'suspicious', talk=TALK), A('hero', 'rug+1,0,-0.4', 80, 'relaxed', 'embarrassed', look='mom')],
  camera=cam('medium', 'mom', 15))
S('q14', 'cafeteria', 'Problema três, o pior: você para de arriscar.', variant=0,
  actors=[A('hero', 'aisle', 0, 'stand', 'worried')], camera=cam('full', 'hero', 10, move='pullOut'))
S('q15', 'cafeteria', 'Pra que convidar alguém, se você já sabe a resposta? Pra que perguntar, se dá pra só olhar?', variant=1,
  actors=[A('lia', 'seat1', 0, 'sit', 'smile', glow=PINK), A('hero', 'aisle+0.6,0,-0.4', 150, 'relaxed', 'neutral', look='lia')],
  camera=cam('medium', ['lia', 'hero'], -20), overlays=[crush('lia', 74, at=0.3)])
C('q16', 'stat', 'Em um mês inteiro, você não começa uma única conversa.', value=0, unit='CONVERSAS', label='QUE VOCÊ COMEÇOU NUM MÊS', icon='question')
S('q17', 'cafeteria', 'Você sabe o que todo mundo sente. E ninguém sabe nada sobre você.', variant=1,
  actors=[A('hero', 'seat4', 180, 'sit', 'sad')], camera=cam('close', 'hero', 20, move='pushIn'))

# ---------------------------------------------------------------- 9. problema real
S('x1', 'void', 'Esses são chatos. Esse aqui é perigoso.',
  actors=[A('hero', 'center', 0, 'stand', 'worried')], camera=cam('close', 'hero', 0, move='pushIn'), sfx=[{'t': '@perigoso', 'name': 'subdrop'}])
S('x2', 'park', 'Num sábado, no parque, o Caio fica quieto do nada.',
  actors=[A('hero', 'bench', 135, 'sit', 'smile'), A('bestie', BENCH2, 135, 'sit', 'worried')],
  camera=cam('medium', ['hero', 'bestie'], 0, move='drift'))
S('x3', 'park', 'Posso te contar uma coisa?', who='male',
  actors=[A('bestie', BENCH2, 135, 'sit', 'worried', look='hero', talk=TALK)], camera=cam('close', 'bestie', -10))
S('x4', 'park', 'Eu gosto da Lia. Desde o quinto ano.', who='male',
  actors=[A('bestie', BENCH2, 135, 'sit', 'embarrassed', talk=TALK)], camera=cam('xclose', 'bestie', 0))
S('x5', 'park', 'Três anos. E você sabe uma coisa que ele não sabe.',
  actors=[A('hero', 'bench', 135, 'sit', 'worried')], camera=cam('xclose', 'hero', 10, move='pushIn'))
C('x6', 'stat', 'O número da Lia. Noventa e quatro. Por você.', value=94, unit='%', label='A LIA, POR VOCÊ', icon='heart')
C('x7', 'icon', 'Lembra? Você só vê o que sentem por você. Nunca viu o que o Caio sente. Nem o que você sente.',
  icon='eye', caption='SÓ O QUE SENTEM POR VOCÊ', sub='NEM O QUE VOCÊ SENTE')
S('x8', 'park', 'Aí o Caio pede seu celular emprestado, pra mandar mensagem pra ela.',
  actors=[A('hero', 'bench', 135, 'sit', 'worried', hold={'R': 'phone'}), A('bestie', BENCH2, 135, 'sit', 'happy', look='hero', poses=[{'t': 0.3, 'pose': {'hipY': -0.46, 'spine': [-2, 0, 0], 'legL': [88, 6, 92], 'legR': [88, 6, 92], 'armL': [30, 10, 0, 60], 'armR': [60, 10, 0, 20], 'handR': 'open'}}])],
  camera=cam('medium', ['hero', 'bestie'], 20))
C('x9', 'stat', 'A planilha está aberta na tela. Lia, noventa e quatro, com uma setinha pra cima. A um dedo do Caio.', value=94, unit='%', label='LIA, NA PLANILHA ABERTA', icon='phone')
C('x10', 'stat', 'E o celular desliga. Um por cento de bateria. Salvo por sorte.', value=1, unit='%', label='DE BATERIA', icon='phone')
S('x11', 'park', 'Da próxima vez, não vai ter sorte.',
  actors=[A('hero', 'bench', 135, 'sit', {'mouth': -0.3, 'brow': 0.8, 'eyes': 1.1, 'sweat': True})], camera=cam('close', 'hero', 0))

# ---------------------------------------------------------------- 10. maestria + regra tema
C('y1', 'chain', 'Então você estuda quem resolve isso há milhões de anos: o morcego.',
  title='O MORCEGO NO ESCURO', nodes=[{'icon': 'lightning', 'label': 'GRITA'}, {'icon': 'arrow', 'label': 'ESCUTA'}, {'icon': 'check', 'label': 'ACHA'}])
S('y2', 'void', 'No escuro, o morcego não espera pra enxergar. Ele grita primeiro, e escuta o que volta.',
  actors=[A('hero', 'center', 0, 'focus', 'closed')], camera=cam('medium', 'hero', 20, move='orbitL'), fx={'grade': 'night'})
C('y3', 'stat', 'Alguns gritam mais alto que um show de rock, mais de cento e dez decibéis, numa frequência que a gente nem escuta.',
  value=110, unit='DECIBÉIS', label='O GRITO DE UM MORCEGO', icon='lightning')
C('y4', 'stat', 'E quando estão chegando perto, até duzentos gritos por segundo.', value=200, unit='GRITOS POR SEGUNDO', label='CHEGANDO PERTO', icon='stopwatch')
S('y5', 'park', 'Você treina com o Caio: de olhos fechados, puxar assunto com três pessoas sem ver número nenhum.',
  actors=[A('hero', 'center', 0, 'relaxed', 'closed'), A('bestie', 'center+1.2,0,0.4', -60, 'relaxed', 'happy', hold={'R': 'stopwatch'})],
  camera=cam('medium', ['hero', 'bestie'], 15))
S('y6', 'park', 'Primeira: você fala do tempo. Falha.',
  actors=[A('hero', 'center', 30, 'explain', 'closed', talk=TALK), A('extraA', 'center+0.9,0,1.1', -150, 'armsCrossed', 'bored')],
  camera=cam('medium', ['hero', 'extraA'], 85), sfx=[{'t': '@falha', 'name': 'pop'}])
S('y7', 'park', 'Segunda: você fala do tempo de novo. Falha pior.',
  actors=[A('hero', 'center', -30, 'explain', 'closed', talk=TALK), A('extraB', 'center+-0.9,0,1.1', 150, 'relaxed', 'bored',
      path=[{'t': '@falha', 'pos': 'center+-0.9,0,1.1'}, {'t': '@pior+0.6', 'pos': 'center+-4,0,4', 'gait': 'walk'}])],
  camera=cam('medium', ['hero', 'extraB'], -85), sfx=[{'t': '@pior', 'name': 'pop'}])
S('y8', 'park', 'Terceira: você pergunta uma coisa de verdade, e escuta a resposta.',
  actors=[A('hero', 'center', 0, 'relaxed', 'smile'), A('extraC', 'center+0,0,1.2', 180, 'explain', 'happy', talk=[[1.5, 4.0]])],
  camera=cam('medium', ['hero', 'extraC'], 85))
C('y9', 'rules', 'Sua regra: fala primeiro. Olha depois.', title='A SUA REGRA', prefix='REGRA', rules=['FALA PRIMEIRO.', 'OLHA DEPOIS.'], current=0)
S('y10', 'bedroom', 'Você tira a planilha da tela inicial.',
  actors=[A('hero', 'desk', 180, 'typing', 'determined')], camera=cam('close', 'hero', -160))

# ---------------------------------------------------------------- 11. crise (incêndio)
S('z1', 'suburb', 'Por duas semanas, você fala primeiro. Nada de ruim acontece.',
  actors=[A('hero', 'sidewalk+-4,0,0', 90, 'relaxed', 'happy', path=[{'t': 0.2, 'pos': 'sidewalk+-4,0,0'}, {'t': 3.5, 'pos': 'sidewalk+3,0,0', 'gait': 'walk'}]),
      A('bestie', 'sidewalk+-2.8,0,0.6', 90, 'relaxed', 'happy', path=[{'t': 0.2, 'pos': 'sidewalk+-2.8,0,0.6'}, {'t': 3.5, 'pos': 'sidewalk+4.2,0,0.6', 'gait': 'walk'}])],
  camera=cam('wide', 'hero', 20, move='track'))
S('z2', 'apartments', 'Até um sábado à tarde, na rua da Lia.',
  actors=[A('extraA', 'crowd+-3,0,0', 90, 'relaxed', 'happy', path=[{'t': 0.2, 'pos': 'crowd+-3,0,0'}, {'t': 4, 'pos': 'crowd+2,0,0', 'gait': 'walk'}])],
  camera={'pos': [14, 1.6, 4], 'look': [-6, 2.0, -1], 'fov': 45, 'move': 'drift'})
S('z3', 'apartments', 'O Caio finalmente criou coragem. Comprou uma flor pra ela.',
  actors=[A('bestie', 'crowd+-1,0,0', 180, 'holdOut', 'embarrassed', hold={'R': 'flower'})],
  camera=cam('close', 'bestie', 20, focus='handR', dist=1.1))
S('z4', 'apartments', 'Aí vocês sentem o cheiro. Fumaça. Saindo do quarto andar. Do prédio dela.',
  camera={'pos': [3, 1.4, 6], 'look': [0, 8.5, -9], 'fov': 46, 'move': 'pushIn'}, sfx=[{'t': '@fumaça', 'name': 'crackle'}])
S('z5', 'apartments', 'Cadê a Lia? Ela estava em casa!', who='adulta',
  actors=[A('maeLia', 'crowd+1.2,0,-0.6', 180, 'scared', 'cry', talk=TALK), A('extraA', 'crowd+-1,0,0.8', 180, 'scared', 'worried'), A('extraB', 'crowd+2.4,0,0.6', 180, 'shocked', 'scared')],
  camera=cam('medium', 'maeLia', 10, move='handheld'))
S('z6', 'apartments', 'Os bombeiros procuram no segundo andar, onde a avó dela mora. E a fumaça cobre a fachada inteira.',
  props=[{'type': 'firetruck', 'pos': 'truck', 'stowed': True}, {'type': 'smoke', 'pos': [0, 9.15, -8.2], 'h': 9, 'size': 1.2}],
  actors=[A('bombeiro', 'street+3,0,1.2', 180, 'point', 'focused', poses=[{'t': 0, 'pose': {'armR': [120, 10, 0, 0], 'handR': 'point'}}])],
  camera={'pos': [6, 1.5, 5], 'look': [0, 6.5, -9], 'fov': 55})
LIA_BAL = A('lia', 'balcony+0,0,-0.3', 0, 'lie', 'sleepy', glow=PINK)
S('z7', 'apartments', 'Mas você vê. No quarto andar, atrás da fumaça, um brilho rosa.',
  actors=[LIA_BAL, A('bombeiro', 'street+3,0,1.2', 180, 'point', 'focused', poses=[{'t': 0, 'pose': {'armR': [120, 10, 0, 0], 'handR': 'point'}}]), A('hero', 'crowd+0,0,0.3', 180, 'stand', 'surprised', look=[0, 9.5, -8.7])],
  props=[{'type': 'firetruck', 'pos': 'truck', 'stowed': True}, {'type': 'smoke', 'pos': [0, 9.15, -8.2], 'h': 9, 'size': 1.2},
     {'type': 'glow', 'pos': 'balcony+0,0,-0.3', 'y': 0.45, 'size': 0.6, 'color': PINK}],
  camera={'pos': [0.9, 1.0, 9.8], 'look': [0.1, 8.6, -8.6], 'fov': 52, 'move': 'pushIn'}, sfx=[{'t': '@brilho', 'name': 'glint'}])
S('z8', 'apartments', 'Quarenta e um por cento. Caindo.',
  actors=[LIA_BAL],
  camera={'pos': [-2.2, 10.8, -5.4], 'look': [0.1, 9.35, -8.6], 'fov': 34},
  overlays=[crush('lia', 41, 48, at=0.2, countDur=2.5)], sfx=[{'t': 0.2, 'name': 'heartbeat'}])
S('z9', 'apartments', 'Um ponto a cada dois segundos. Um minuto e vinte e dois até o zero.',
  actors=[A('hero', 'crowd+0,0,0.3', 180, 'scared', 'scared', look=[0, 9.5, -8.7])],
  camera=cam('xclose', 'hero', 10, height=-10),
  overlays=[{'type': 'stopwatch', 'from': '1:22', 'at': '@minuto'}])

# ---------------------------------------------------------------- 12. dilema
SW = lambda v: {'type': 'stopwatch', 'from': v, 'persist': True}
S('d1', 'apartments', 'O bombeiro só vai subir pro quarto andar se você disser como sabe.',
  actors=[A('hero', 'crowd+0,0,0.3', 180, 'stand', 'worried'), A('bombeiro', 'truck+-3,0,-1.5', 160, 'point', 'focused')],
  camera={'pos': [-1.5, 1.7, 9.8], 'look': [3.0, 1.4, -2.5], 'fov': 45}, overlays=[SW('1:10')])
S('d2', 'apartments', 'Na frente da rua inteira. Da mãe dela. Do Caio, segurando a flor.',
  actors=[A('maeLia', 'crowd+1.2,0,-0.6', 180, 'scared', 'cry'), A('bestie', 'crowd+-1,0,0', 180, 'holdOut', 'worried', hold={'R': 'flower'}),
      A('extraA', 'crowd+-0.2,0,1.0', 180, 'stand', 'worried'), A('extraC', 'crowd+2.4,0,0.4', 180, 'phone', 'worried', hold={'R': 'phone'}),
      A('extraB', 'crowd+3.4,0,1.1', 180, 'shocked', 'scared'), A('rival', 'crowd+-2.2,0,0.9', 180, 'stand', 'worried')],
  camera={'pos': [-0.4, 1.7, 2.2], 'look': [0.6, 1.3, 7.8], 'fov': 46}, overlays=[SW('1:04')])
S('d3', 'apartments', 'Se você falar, o segredo dela vira de todo mundo. Se você ficar quieto...',
  actors=[A('hero', 'crowd+0,0,0.3', 180, 'stand', 'worried')], camera=cam('xclose', 'hero', 5), overlays=[SW('0:58')])
S('d4', 'apartments', 'O segredo dela... ou ela.', hold=2.0,
  actors=[A('hero', 'crowd+0,0,0.3', 180, 'stand', 'determined')], camera=cam('xclose', 'hero', 0, move='pushIn'),
  overlays=[SW('0:52')], fx={'vignette': 0.35})

# ---------------------------------------------------------------- 13. clímax
S('e1', 'apartments', 'Você fala primeiro.',
  actors=[A('hero', 'crowd+0,0,0.3', 180, 'determined', 'determined')], camera=cam('close', 'hero', 150), overlays=[SW('0:48')])
S('e2', 'apartments', '[shouting] Quarto andar! Ela está na sacada!',
  actors=[A('hero', 'crowd+0,0,0.3', 180, 'point', 'furious', talk=TALK, poses=[{'t': 0, 'pose': {'armR': [130, 10, 0, 0], 'handR': 'point', 'head': [-15, 0, 0]}}]),
],
  camera=cam('medium', 'hero', 15, height=-8), overlays=[SW('0:46')], sfx=[{'t': 0.05, 'name': 'whoosh'}])
S('e3', 'apartments', 'Como você sabe?', who='adulto',
  actors=[A('bombeiro', 'truck+-3,0,-1.5', 30, 'stand', 'suspicious', look='hero', talk=TALK)], camera=cam('close', 'bombeiro', 10), overlays=[SW('0:42')])
S('e4', 'apartments', 'E você diz. Alto. Na frente de todo mundo.',
  actors=[A('hero', 'crowd+0,0,0.3', 180, 'stand', 'determined'), A('bestie', 'crowd+-1,0,0', 120, 'stand', 'worried', hold={'R': 'flower'}, look='hero')],
  camera=cam('medium', ['hero', 'bestie'], 20), overlays=[SW('0:40')])
S('e5', 'apartments', '[shouting] Porque ela gosta de mim!',
  actors=[A('hero', 'crowd+0,0,0.3', 180, 'fistPump', 'furious', talk=TALK)], camera=cam('close', 'hero', -5, move='crashIn'),
  overlays=[SW('0:37')], sfx=[{'t': 0.1, 'name': 'boom'}])
S('e6', 'apartments', 'O Caio olha pra você. Um segundo inteiro.', hold=0.6,
  actors=[A('bestie', 'crowd+-1,0,0', 120, 'stand', 'shocked', hold={'R': 'flower'}, look='hero')], camera=cam('xclose', 'bestie', 0), overlays=[SW('0:34')])
S('e7', 'apartments', '[shouting] Ele não erra! Confia nele!', who='male',
  actors=[A('bestie', 'crowd+-1,0,0', 180, 'point', 'determined', hold={'R': 'flower'}, talk=TALK, poses=[{'t': 0, 'pose': {'armR': [120, 10, 0, 0], 'handR': 'point'}}])],
  camera=cam('medium', 'bestie', 15), overlays=[SW('0:30')])
PIV = [11.6, 2.75, -2.4]
RIDE_UP = [{'t': 0.1, 'pos': [10.6, 2.85, -2.4]}, {'t': 3.2, 'pos': [1.5, 9.25, -7.3], 'gait': 'carried'}]
S('e8', 'apartments', 'A escada gira. O cesto sobe até o quarto andar.',
  props=[{'type': 'firetruck', 'pos': 'truck'}, {'type': 'basket', 'follow': 'bombeiro', 'from': PIV}],
  actors=[A('bombeiro', [10.6, 2.85, -2.4], -150, 'crouch', 'determined', path=RIDE_UP, gait='carried', contact=True)],
  camera={'pos': [12, 2.0, 3.2], 'look': [3, 6.2, -7], 'fov': 54}, overlays=[SW('0:26')], sfx=[{'t': 0.2, 'name': 'riser'}])
HOVER = [1.5, 9.25, -7.3]
BAL_CAM = {'pos': [-2.6, 10.7, -4.9], 'look': [0.6, 9.55, -8.1], 'fov': 40}
BASKET = {'type': 'basket', 'follow': 'bombeiro', 'from': PIV}
S('e9', 'apartments', 'Mas a fumaça engole a sacada. O bombeiro não enxerga nada. Doze por cento.',
  props=[{'type': 'firetruck', 'pos': 'truck'}, BASKET, {'type': 'smoke', 'pos': [0.9, 9.15, -7.85], 'h': 2.6, 'size': 0.27, 'n': 60, 'wind': [0.45, 0.1]}],
  actors=[A('bombeiro', HOVER, -131, 'reach', 'worried', gait='carried', contact=True), A('lia', 'balcony+0,0,-0.3', 0, 'lie', 'closed', glow=PINK)],
  camera=BAL_CAM, overlays=[SW('0:24'), crush('lia', 12, 15, at='@doze')])
S('e10', 'apartments', 'Regra três: a sua voz faz o número subir.',
  actors=[A('hero', 'crowd+0,0,0.3', 180, 'stand', 'determined')], camera=cam('close', 'hero', 150), overlays=[SW('0:21')])
S('e11', 'apartments', '[shouting] Lia!',
  actors=[A('hero', 'crowd+0,0,0.3', 180, 'cheer', 'furious', talk=[[0.05, 0.8]])], camera=cam('full', 'hero', 150, height=-12),
  overlays=[SW('0:19')], sfx=[{'t': 0.05, 'name': 'heartbeat'}])
S('e12', 'apartments', 'Vinte e cinco. Ela levanta a cabeça.',
  props=[{'type': 'firetruck', 'pos': 'truck'}, BASKET, {'type': 'smoke', 'pos': [0.9, 9.15, -7.85], 'h': 2.6, 'size': 0.23, 'n': 60, 'wind': [0.45, 0.1]}],
  actors=[A('bombeiro', HOVER, -131, 'reach', 'worried', gait='carried', contact=True),
      A('lia', 'balcony+0,0,-0.3', 0, 'lie', 'sleepy', glow=PINK, poses=[{'t': 0.4, 'pose': {'hipY': -0.82, 'body': [-90, 0, 0], 'head': [35, 0, 0], 'armL': [0, 12, 0, 6], 'armR': [30, 25, 0, 40]}, 'blend': 0.8}])],
  camera=BAL_CAM, overlays=[SW('0:17'), crush('lia', 25, 12, at=0.1)], sfx=[{'t': 0.1, 'name': 'chime'}])
S('e13', 'apartments', '[shouting] Lia!',
  actors=[A('hero', 'crowd+0,0,0.3', 180, 'cheer', 'furious', talk=[[0.05, 0.8]])], camera=cam('close', 'hero', 20, height=-10),
  overlays=[SW('0:15')], sfx=[{'t': 0.05, 'name': 'heartbeat'}])
S('e14', 'apartments', 'Quarenta. Ela se arrasta até a grade.',
  props=[{'type': 'firetruck', 'pos': 'truck'}, BASKET, {'type': 'smoke', 'pos': [0.9, 9.15, -7.85], 'h': 2.6, 'size': 0.19, 'n': 60, 'wind': [0.45, 0.1]}],
  actors=[A('bombeiro', HOVER, -131, 'reach', 'determined', gait='carried', contact=True),
      A('lia', 'balcony+0,0,-0.3', 52, 'crouch', 'scared', glow=PINK, path=[{'t': 0.3, 'pos': 'balcony+0,0,-0.3'}, {'t': 2.2, 'pos': 'balcony+0.3,0,0.35', 'gait': 'carried'}])],
  camera=BAL_CAM, overlays=[SW('0:13'), crush('lia', 40, 25, at=0.1)], sfx=[{'t': 0.1, 'name': 'chime'}])
S('e15', 'apartments', '[shouting] Lia!',
  actors=[A('hero', 'crowd+0,0,0.3', 180, 'cheer', 'furious', talk=[[0.05, 0.8]])], camera=cam('medium', 'hero', 150, height=-12, move='crashIn'),
  overlays=[SW('0:11')], sfx=[{'t': 0.05, 'name': 'heartbeat'}])
S('e16', 'apartments', 'Cinquenta e oito. A mão dela atravessa a fumaça.',
  props=[{'type': 'firetruck', 'pos': 'truck'}, BASKET, {'type': 'smoke', 'pos': [0.9, 9.15, -7.85], 'h': 2.6, 'size': 0.14, 'n': 60, 'wind': [0.45, 0.1]}],
  actors=[A('bombeiro', HOVER, -131, 'reach', 'determined', gait='carried', contact=True),
      A('lia', 'balcony+0.3,0,0.35', 52, {'reachR': {'to': [0, 1.25, 0.8]}, 'spine': [15, 0, 0]}, 'scared', glow=PINK, contact=True)],
  camera=BAL_CAM, overlays=[SW('0:09'), crush('lia', 58, 40, at=0.1)], sfx=[{'t': 0.1, 'name': 'chime'}])
S('e17', 'apartments', 'O bombeiro segura.',
  props=[{'type': 'firetruck', 'pos': 'truck'}, BASKET],
  actors=[A('bombeiro', HOVER, -131, {'reachR': {'to': [0, 1.2, 0.75]}, 'spine': [20, 0, 0]}, 'determined', gait='carried', contact=True),
      A('lia', 'balcony+0.3,0,0.35', 52, {'reachR': {'to': [0, 1.25, 0.8]}, 'spine': [15, 0, 0]}, 'surprised', glow=PINK, contact=True)],
  camera={'pos': [-1.8, 10.3, -5.0], 'look': [0.9, 9.8, -7.9], 'fov': 34}, overlays=[SW('0:07')], sfx=[{'t': 0.1, 'name': 'thud'}, {'t': 0.2, 'name': 'swell'}])
RIDE_DOWN = [{'t': 0.3, 'pos': HOVER}, {'t': 3.5, 'pos': [10.6, 2.85, -2.4], 'gait': 'carried'}]
S('e18', 'apartments', 'O cesto desce. Ela está tossindo. Viva.', hold=1.2,
  props=[{'type': 'firetruck', 'pos': 'truck'}, BASKET],
  actors=[A('bombeiro', HOVER, -150, 'carry', 'focused', path=RIDE_DOWN, gait='carried', contact=True),
      A('lia', [1.1, 9.25, -7.2], -150, {'reachR': {'to': 'mouth'}, 'spine': [15, 0, 0]}, {'eyes': 0.35, 'open': 0.55, 'mouth': -0.3, 'brow': 0.8}, gait='carried', contact=True,
        path=[{'t': 0.3, 'pos': [1.1, 9.25, -7.2]}, {'t': 3.5, 'pos': [10.2, 2.85, -2.3], 'gait': 'carried'}])],
  camera={'pos': [12, 2.0, 3.2], 'look': [3, 6.2, -7], 'fov': 54}, overlays=[{'type': 'stopwatch', 'from': '0:05', 'to': 'SALVA', 'persist': True, 'switchAt': '@viva'}])
S('e19', 'apartments', 'Você tenta dizer alguma coisa. Não sai nada. Sua voz acabou.',
  actors=[A('hero', 'crowd+0,0,0.3', 180, {'spine': [14, 0, 0], 'head': [12, 0, 0], 'reachR': {'to': 'chin'}}, 'tired')], camera=cam('close', 'hero', 15))

# ---------------------------------------------------------------- 14. consequência
CRATES = [{'type': 'crate', 'pos': 'crowd+0,0,0.72', 'w': 0.5, 'h': 0.45, 'd': 0.45, 'color': '#9a6b45'},
      {'type': 'crate', 'pos': 'crowd+-0.9,0,0.72', 'w': 0.5, 'h': 0.45, 'd': 0.45, 'color': '#9a6b45'}]
S('f1', 'apartments', 'Rouco por três dias, diz o paramédico.', props=CRATES,
  actors=[A('hero', 'crowd+0,0,0.6', 180, 'sit', 'tired'), A('bestie', 'crowd+-0.9,0,0.6', 180, 'sit', 'sad', hold={'R': 'flower'})],
  camera=cam('medium', ['hero', 'bestie'], 0, height=10))
S('f2', 'apartments', 'Três anos, cara.', props=CRATES, who='male',
  actors=[A('bestie', 'crowd+-0.9,0,0.6', 180, 'sit', 'sad', hold={'R': 'flower'}, look='hero', talk=TALK)], camera=cam('close', 'bestie', -15))
S('f3', 'apartments', '[whispering] Desculpa.', props=CRATES,
  actors=[A('hero', 'crowd+0,0,0.6', 180, 'sit', 'sad', look='bestie', talk=[[0.05, 0.7]])], camera=cam('close', 'hero', 15))
S('f4', 'apartments', 'Não. Você falou primeiro. Eu nunca falei.', props=CRATES, who='male',
  actors=[A('bestie', 'crowd+-0.9,0,0.6', 180, 'sit', 'smile', hold={'R': 'flower'}, look='hero', talk=TALK)], camera=cam('close', 'bestie', -20))
S('f5', 'apartments', 'E eu? Quanto eu tô?', props=CRATES, who='male',
  actors=[A('bestie', 'crowd+-0.9,0,0.6', 180, 'sit', 'smug', hold={'R': 'flower'}, look='hero', talk=TALK), A('hero', 'crowd+0,0,0.6', 180, 'sit', 'tired')],
  camera=cam('close', 'bestie', 35), overlays=[crush('bestie', 0, at=0.6)])
S('f6', 'apartments', 'Você faz um zero com a mão.', props=CRATES,
  actors=[A('hero', 'crowd+0,0,0.6', 180, 'sit', 'smirk', poses=[{'t': 0.2, 'pose': {'hipY': -0.46, 'spine': [-2, 0, 0], 'legL': [88, 6, 92], 'legR': [88, 6, 92], 'armL': [30, 10, 0, 60], 'armR': [70, 10, -40, 70], 'handR': 'fist'}}])],
  camera=cam('close', 'hero', 20))
S('f7', 'apartments', '[chuckling] Grosso.', props=CRATES, who='male',
  actors=[A('bestie', 'crowd+-0.9,0,0.6', 180, 'sit', 'grin', hold={'R': 'flower'}, talk=[[0.05, 0.9]])], camera=cam('close', 'bestie', -10))
NEWS = 'O GAROTO MAIS QUIETO DA ESCOLA GRITOU MAIS ALTO QUE A SIRENE'
S('f8', 'home', 'Até o jantar, o vídeo de um vizinho está em todo lugar.',
  actors=[A('mom', 'seat', 0, 'sit', 'surprised', hold={'R': 'phone'})], camera=cam('close', 'mom', 15),
  overlays=[{'type': 'news', 'headline': NEWS, 'tag': 'VIRAL', 'at': 0.4}])
S('f9', 'home', 'O título: o garoto mais quieto da escola gritou mais alto que a sirene.',
  actors=[A('mom', 'seat', 0, 'sit', 'happy', hold={'R': 'phone'})],
  camera=cam('medium', 'mom', -20))
S('f10', 'home', 'Chá com mel. E nada de planilha hoje.', who='adulta',
  actors=[A('mom', 'table+-0.5,0,0.9', 60, 'holdOut', 'love', hold={'R': 'cup'}, talk=TALK), A('hero', 'table+0.9,0,0.9', -100, 'relaxed', 'smile', look='mom')],
  camera=cam('medium', ['mom', 'hero'], 0))
S('f11', 'bedroom', 'Você abre a planilha. E apaga. Trinta e quatro nomes. Trinta e quatro números.', time='interiorNight',
  actors=[A('hero', 'desk', 180, 'typing', 'determined')], camera=cam('close', 'hero', -150, move='pushIn'),
  sfx=[{'t': '@apaga', 'name': 'click'}])
S('f12', 'home', 'No domingo, a Lia aparece na sua porta.',
  actors=[A('lia', 'door+-0.6,0,0.6', -120, 'relaxed', 'smile', glow=PINK), A('hero', 'door+-1.8,0,1.2', 60, 'relaxed', 'surprised', look='lia')],
  camera=cam('medium', ['lia', 'hero'], 20))
S('f13', 'home', 'Você gritou meu nome três vezes.', who='female',
  actors=[A('lia', 'door+-0.6,0,0.6', -120, 'relaxed', 'smile', glow=PINK, talk=TALK, look='hero')], camera=cam('close', 'lia', 0))
S('f14', 'home', '[whispering] Eu sei.',
  actors=[A('hero', 'door+-1.8,0,1.2', 60, 'relaxed', 'smile', talk=[[0.05, 0.7]], look='lia')], camera=cam('close', 'hero', 0))
S('f15', 'home', 'Eu ouvi todas.', who='female',
  actors=[A('lia', 'door+-0.6,0,0.6', -120, 'relaxed', 'love', glow=PINK, talk=TALK, look='hero')], camera=cam('close', 'lia', 10))
S('f16', 'home', 'E pela primeira vez, você não olha o número dela.',
  actors=[A('lia', 'door+-0.6,0,0.6', -120, 'relaxed', 'happy', glow=PINK), A('hero', 'door+-1.8,0,1.2', 60, 'relaxed', 'happy', look='lia')],
  camera=cam('medium', ['lia', 'hero'], -30, move='pullOut'))

# ---------------------------------------------------------------- 15. mundo maior
S('g1', 'apartments', 'Mas o vídeo do vizinho mostra uma coisa que ninguém comentou.',
  props=[{'type': 'firetruck', 'pos': 'truck'}],
  camera={'pos': [3, 1.4, 6], 'look': [0, 8.5, -9], 'fov': 50}, fx={'grade': 'flashback'})
S('g2', 'apartments', 'Do outro lado da rua, um homem de capa de chuva amarela. Num dia de sol.',
  actors=[A('estranho', 'crowd+4.5,0,1.2', 180, 'stand', 'neutral'), A('extraA', 'crowd+1.4,0,0.5', 180, 'phone', 'worried', hold={'R': 'phone'}),
      A('extraB', 'crowd+2.6,0,0.2', 180, 'shocked', 'scared')],
  camera=cam('full', 'estranho', 20))
S('g3', 'apartments', 'Todo mundo olha pro fogo. Ele olha pra você.',
  actors=[A('estranho', 'crowd+4.5,0,1.2', -100, 'stand', {'eyes': 1.1, 'mouth': -0.05, 'brow': -0.2, 'lid': 0.3})], camera=cam('close', 'estranho', 0, move='pushIn'))
S('g4', 'bedroom', 'Naquela noite, você não consegue dormir. Lá fora, debaixo do poste...', time='interiorNight',
  actors=[A('hero', 'window', 180, 'stand', 'worried')], camera=cam('medium', 'hero', 150))
STREET_NIGHT = [{'type': 'lamp', 'pos': 'farSidewalk+1,0,1', 'on': True}]
S('g5', 'suburb', 'O homem da capa amarela. Parado. Olhando pra sua janela.', time='night',
  props=STREET_NIGHT, actors=[A('estranho', 'farSidewalk+1,0,0.4', 180, 'stand', 'neutral')], camera=cam('full', 'estranho', -20, move='pushIn'))
S('g6', 'suburb', 'Ele atravessa a rua, deixa um envelope na sua caixa de correio, e vai embora devagar.', time='night',
  props=STREET_NIGHT, actors=[A('estranho', 'farSidewalk+1,0,0.4', 180, 'stand', 'neutral',
                            path=[{'t': 0.3, 'pos': 'farSidewalk+1,0,0.4'}, {'t': 3.0, 'pos': 'mailbox+0,0,1', 'gait': 'walk'}, {'t': 4.6, 'pos': 'mailbox+0,0,1'},
                                  {'t': 6.5, 'pos': 'mailbox+6,0,2', 'gait': 'walk'}])],
  camera=cam('wide', 'estranho', 30, move='track'))
S('g7', 'suburb', 'Você desce sem fazer barulho. Não que você conseguisse fazer barulho.', time='night',
  actors=[A('hero', 'mailbox+0,0,0.8', 180, 'reach', 'worried')], camera=cam('medium', 'hero', 30))
S('g8', 'bedroom', 'Dentro, três fotos de crianças que você nunca viu.', time='interiorNight',
  actors=[A('hero', 'center', 0, 'holdOut', 'confused', hold={'R': 'book'})], camera=cam('close', 'hero', 10))
S('g9', 'void', 'Uma menina cercada de cópias transparentes dela mesma.',
  actors=[A('fotoA', 'center', 0, 'relaxed', 'neutral')] + [A(f'echo{k}', p, r, 'relaxed', 'neutral', ghost=True, glow='#7fd6ff') for k, (p, r) in enumerate([('left', 20), ('right', -20), ('back', 0)], 1)],
  camera=cam('wide', 'fotoA', 0), fx={'grade': 'flashback'})
S('g10', 'void', 'Um menino no meio de um salto, metade numa sala de aula, metade num telhado.',
  actors=[A('fotoB', 'center', 90, 'jump', 'determined', glow='#8fc2ff')], camera=cam('wide', 'fotoB', 20), fx={'grade': 'flashback', 'speedLines': 'fotoB'})
S('g11', 'void', 'E uma criança equilibrando cinco laranjas, depois de olhar um malabarista uma única vez.',
  actors=[A('fotoC', 'center', 0, {'armL': [70, 20, 0, 60], 'armR': [70, 20, 0, 60], 'head': [-25, 0, 0], 'handL': 'open', 'handR': 'open'}, 'grin')],
  props=[{'type': 'ball', 'pos': q, 'color': '#ff8c1a', 'scale': 0.6} for q in ['center+-0.28,0.95,0.35', 'center+-0.12,1.25,0.35', 'center+0.05,1.4,0.35', 'center+0.2,1.22,0.35', 'center+0.32,0.98,0.35']],
  camera=cam('full', 'fotoC', 10), fx={'grade': 'flashback'})
C('g12', 'icon', 'No verso, escrito à mão: vão precisar de alguém que vê o que as pessoas sentem.',
  icon='eye', caption='VÃO PRECISAR DE ALGUÉM', sub='QUE VÊ O QUE AS PESSOAS SENTEM')
S('g13', 'home', 'Tem mais chá no fogão!', who='adulta', time='interiorNight',
  actors=[A('mom', 'stove+0.4,0,0.8', 10, 'wave', 'happy', talk=TALK)], camera=cam('medium', 'mom', 10))
S('g14', 'bedroom', 'Você bate duas vezes no chão. Quer dizer obrigado.', time='interiorNight',
  actors=[A('hero', 'rug', 0, 'crouch', 'smile')], camera=cam('medium', 'hero', 20), sfx=[{'t': '@bate', 'name': 'thud'}, {'t': '@bate+0.35', 'name': 'thud'}])

# ---------------------------------------------------------------- 16. gancho final
S('h1', 'bedroom', 'No fundo do envelope, tem mais uma folha.', time='interiorNight',
  actors=[A('hero', 'center', 0, 'holdOut', 'confused', hold={'R': 'book'})], camera=cam('close', 'hero', 10))
C('h2', 'rules', 'É a sua planilha. A que você apagou hoje à tarde. Lia, noventa e quatro. Duda, oitenta e um. Caio, zero. Todas certas.',
  title='A SUA PLANILHA', prefix='LINHA', rules=['LIA — 94%', 'DUDA — 81%', 'CAIO — 0%'], current=0)
S('h3', 'bedroom', 'E uma linha a mais, que você nunca escreveu.', time='interiorNight',
  actors=[A('hero', 'center', 0, 'holdOut', 'scared', hold={'R': 'book'})], camera=cam('xclose', 'hero', 10), sfx=[{'t': 0.4, 'name': 'subdrop'}])
C('h4', 'rules', 'O seu nome. Oitenta e sete.', title='A SUA PLANILHA', prefix='LINHA', rules=['LIA — 94%', 'DUDA — 81%', 'CAIO — 0%', 'VOCÊ — 87%'], current=4)
S('h5', 'bedroom', 'Você nunca viu o seu próprio número. Ninguém consegue.', time='interiorNight',
  actors=[A('hero', 'center', 0, 'holdOut', 'scared', hold={'R': 'book'})], camera=cam('xclose', 'hero', 10, move='pushIn'))
S('h6', 'bedroom', 'Alguém consegue.', hold=1.2, time='interiorNight',
  actors=[A('hero', 'center', 0, 'holdOut', 'scared', hold={'R': 'book'})], camera=cam('xclose', 'hero', 10), overlays=[crush('hero', 87, 0, at='@alguém', countDur=1.2)],
  fx={'vignette': 0.5}, sfx=[{'t': 0.2, 'name': 'subdrop'}])

# ---------------------------------------------------------------- 17. CTA
S('i1', 'suburb', 'Então: quem você olharia primeiro, se pudesse ver o número? E aquele oitenta e sete... é por quem? Conta pra gente nos comentários. Todo poder tem um preço. Até a próxima.',
  time='night', props=STREET_NIGHT, actors=[A('hero', 'sidewalk', 10, 'confident', 'smirk')],
  camera=cam('wide', 'hero', 30, height=5, move='pullOut'),
  overlays=[{'type': 'title', 'small': 'QUEM VOCÊ OLHARIA PRIMEIRO?', 'big': 'E O 87... É POR QUEM?', 'at': '@oitenta'}])

# ---------------------------------------------------------------- episode
idx = shot_index()
ep = episode(
    SLUG, 'E Se Você Pudesse Ver Quem Tem Crush em Você?',
    cast={
    'bestie': {'name': 'Caio'},
    'extraB': {'topColor': '#d0533f'},
    'sister': {'name': 'Bia'},
    'rival': {'name': 'Rafa'},
    'teacher': {'name': 'Professora Sônia'},
    'coach': {'name': 'Professor Ramos'},
    'mom': {'name': 'Mãe'},
    'lia': {'name': 'Lia', 'top': 'hoodie', 'topColor': '#7a5cc8', 'accent': '#e9ddff', 'bottom': 'pants', 'bottomColor': '#2c3e63', 'shoes': '#ffffff', 'hair': 'curly'},
    'duda': {'name': 'Duda', 'top': 'tee', 'topColor': '#2fa6a0', 'bottom': 'skirt', 'bottomColor': '#3b4a6b', 'shoes': '#ffffff', 'hair': 'ponytail'},
    'maeLia': {'name': 'Mãe da Lia', 'top': 'jacket', 'topColor': '#b8476a', 'accent': '#ffe1ea', 'bottom': 'skirt', 'bottomColor': '#2d3550', 'shoes': '#5a3e33', 'hair': 'bun'},
    'bombeiro': {'name': 'Bombeiro', 'top': 'coat', 'topColor': '#c8302a', 'accent': '#f2c53c', 'bottom': 'pants', 'bottomColor': '#1f2433', 'shoes': '#1b1b20', 'hat': 'helmet', 'hatColor': '#f2c53c'},
    'estranho': {'name': 'Homem da capa amarela', 'top': 'coat', 'topColor': '#ffd21f', 'accent': '#fff3d6', 'bottom': 'pants', 'bottomColor': '#1d2333', 'shoes': '#2b2622'},
    'fotoA': {'top': 'tee', 'topColor': '#4bb37a', 'bottom': 'shorts', 'bottomColor': '#2c3e63', 'shoes': '#ffffff', 'hair': 'bun', 'height': 0.85},
    'fotoB': {'top': 'hoodie', 'topColor': '#e8a23a', 'accent': '#fff3d6', 'bottom': 'pants', 'bottomColor': '#2b2f3a', 'shoes': '#ffffff', 'hair': 'spiky', 'height': 0.85},
    'fotoC': {'top': 'tee', 'topColor': '#c94b8a', 'bottom': 'shorts', 'bottomColor': '#3d6fb6', 'shoes': '#ffffff', 'hair': 'afro', 'height': 0.7},
    **{f'echo{k}': {'top': 'tee', 'topColor': '#4bb37a', 'bottom': 'shorts', 'bottomColor': '#2c3e63', 'shoes': '#ffffff', 'hair': 'bun', 'height': 0.85} for k in (1, 2, 3)},
    },
    music=[('c1', 'curious'), ('x1', 'tension'), ('y1', 'wonder'), ('z2', 'tension'), ('e1', 'action'),
       ('f1', 'sad'), ('f12', 'wonder'), ('g1', 'tension'), ('h6', 'none'), ('i1', 'curious')],
)

# ---------------------------------------------------------------- fire countdown, from the real voice timing
# One point every two seconds: the clock reads 2 x Lia's number. It ticks live while her number falls,
# and jumps up with each shout when it rises. Needs timing.json (after `align`); the draft keeps the static values.
tm = load_timing(SLUG)
if tm:
    st, wt, fmt = tm.start, tm.word, tm.fmt
    t0 = tm.at('z9', 'minuto')  # the clock shows 1:22 here
    T = 58 / (st('e9') + wt('e9', 'doze') - t0)  # story seconds per real second: 1:22 -> 0:24 exactly on "doze"
    rem = lambda sid: 82 - T * (st(sid) - t0)
    def put(sid, sw):
        sh = shots[idx[sid]]
        sh['overlays'] = [o for o in sh.get('overlays', []) if o['type'] != 'stopwatch'] + [sw]
    put('z9', {'type': 'stopwatch', 'from': '1:22', 'tick': round(T, 3), 'keep': True, 'at': '@minuto'})
    for sid in ['d1', 'd2', 'd3', 'd4', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'e10', 'e11']:
        put(sid, {'type': 'stopwatch', 'from': fmt(rem(sid)), 'tick': round(T, 3), 'persist': True, 'keep': True})
    put('e12', {'type': 'stopwatch', 'from': fmt(rem('e12')), 'to': '0:50', 'switchAt': '@vinte', 'persist': True, 'keep': True})
    put('e13', {'type': 'stopwatch', 'from': '0:50', 'tick': round(T, 3), 'persist': True, 'keep': True})
    put('e14', {'type': 'stopwatch', 'from': fmt(50 - T * (st('e14') - st('e13'))), 'to': '1:20', 'switchAt': '@quarenta', 'persist': True, 'keep': True})
    put('e15', {'type': 'stopwatch', 'from': '1:20', 'tick': round(T, 3), 'persist': True, 'keep': True})
    put('e16', {'type': 'stopwatch', 'from': fmt(80 - T * (st('e16') - st('e15'))), 'to': '1:56', 'switchAt': '@cinquenta', 'persist': True, 'keep': True})
    put('e17', {'type': 'stopwatch', 'from': '1:56', 'to': 'SALVA', 'switchAt': '@segura', 'persist': True, 'keep': True})
    put('e18', {'type': 'stopwatch', 'from': 'SALVA', 'persist': True})
    print(f'clock: x{T:.2f} story time; e9 starts at {fmt(rem("e9"))}, reads 0:24 on "doze"; e12 starts at {fmt(rem("e12"))}')

write(SLUG, ep, drop_none=False)
