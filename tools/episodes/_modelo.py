# Skeleton for a new episode. Copy to tools/episodes/<slug_with_underscores>.py, set SLUG, fill the beats.
#   .venv/Scripts/python -I tools/episodes/<file>.py   -> public/episodes/<slug>/episode.json
# episode.json is regenerated from the .py: never hand-edit the JSON.
# Beats, word budgets and rules: docs/story/COLA_ROTEIRO.md. Schema: src/types.ts. Cards: src/cards (CARDS).
# One shot per 2.5–5 s of narration; ids unique (edits by id hit the first match); vo in PT-BR,
# numbers spelled out, [tags] in English (COLA "Tags de áudio").
# ritmo='rapido' (house pacing): automatic sub-cuts (coverage 'fast') on automatic cameras and whip/zoom on set
# changes. Override per shot: coverage='calm' in the dilemma, 'off' for a held tableau; cut='smash' on a reveal/punchline.
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # python -I drops the script dir
from kit import *  # noqa: E402,F401,F403  (A, S, C, cam, walk, crush, TALK, SW, episode, load_timing, resolve_countdowns, write)

SLUG = 'novo-episodio'
TITLE = 'E Se Você ...?'

# Marks and repeated actors/props go here, e.g.:
# HERO_DESK = 'seat2'
# RULES = ['REGRA UM', 'REGRA DOIS', 'REGRA TRÊS']

# ---------------------------------------------------------------- 1. abertura fria (0:00–0:20)
# Plan 1 = close of an object; power visible by 0:08; witness line + deadpan answer.
# S('c1', 'bedroom', 'Você ...', [A('hero', 'bed+0.6,0,0', 180, 'stand', 'neutral')], cam('insert', 'hero'))

# ---------------------------------------------------------------- 2. pergunta do título (0:20–0:25)
# S('t1', 'suburb', 'E se você ...? Veja o que realmente muda.', camera=cam('establishing', 'hero'),
#   overlays=[{'type': 'title', 'text': TITLE}])

# ---------------------------------------------------------------- 3. mecanismo + limite (0:25–0:50)
# C('m1', 'icon', '...')  # the body part; then the limit's signpost line ("Guarda isso.")

# ---------------------------------------------------------------- 4. escada de números + ciência (0:50–1:25)
# C('n1', 'compare', '...', ...)  # NORMAL vs VOCÊ

# ---------------------------------------------------------------- 5. teste de prova (1:25–1:50)

# ---------------------------------------------------------------- 6. regras (1:50–2:30)

# ---------------------------------------------------------------- 7. ladainha de vantagens (2:30–3:40)
# 12–16 itens "X + número. Efeito em 1 linha." (COLA "Ladainha"); um plano por item, número em destaque + SFX:
# ladainha('v', 'suburb', [
#     {'vo': 'A moça da cantina custa três reais. Agora o pastel vem com dois recheios.',
#      'word': ('R$ 3', '@três'), 'actors': [...], 'camera': cam('medium', 'cantina')},
#     ...
# ])

# ---------------------------------------------------------------- 8. "mas" + problemas 1–3 (3:40–4:40)

# ---------------------------------------------------------------- 9. problema real (4:40–5:25)

# ---------------------------------------------------------------- 10. maestria + regra tema (5:25–6:05)

# ---------------------------------------------------------------- 11. crise (6:05–6:30)
# Countdown that lines up across cuts: put {'type': 'stopwatch', 'cd': 'main'} in each shot's overlays,
# then fill `clocks` at the bottom.

# ---------------------------------------------------------------- 12. dilema (6:30–6:50)
# Binary "A… ou B." then a silent hold: S('d9', ..., hold=2)

# ---------------------------------------------------------------- 13. clímax (6:50–7:35)

# ---------------------------------------------------------------- 14. consequência (7:35–8:00)

# ---------------------------------------------------------------- 15. mundo maior (8:00–9:10)

# ---------------------------------------------------------------- 16. gancho final (9:10–9:40)

# ---------------------------------------------------------------- 17. CTA (9:40–10:00)
# S('i1', 'suburb', 'Então: ...? E ...? Conta pra gente nos comentários. Todo poder tem um preço. Até a próxima.', ...)

# ---------------------------------------------------------------- episode
ep = episode(
    SLUG, TITLE,
    ritmo='rapido',
    clips=[  # ≥ 4 shorts of ~90 s, whole shots, each opens on a cold hook (COLA "Cortes para shorts")
        # ('O poder', 'c1', 'n3'), ('Os problemas', 'p1', 'p9'), ('O plano', '...', '...'), ('O clímax', 'k1', 'k12'),
    ],
    cast={
        'bestie': {'name': '...'},
        # 'mom': {'name': 'Mãe'},
        # new characters: top/topColor/accent/bottom/bottomColor/shoes/hair — never gray (gray is the hero's)
    },
    music=[  # (first shot id, mood): curious, wonder, tension, action, sad, none
        # ('c1', 'curious'),
    ],
)

# Live countdowns from the real voice timing (no-op on the draft, which shows the fallback):
tm = load_timing(SLUG)
# clocks = {'main': (tm.at('<shot>', '<word>'), tm.at('<shot>', '<word>'), <total s>, 'tr', '<last shot id>')} if tm else {}
# resolve_countdowns(tm, clocks)

write(SLUG, ep)
