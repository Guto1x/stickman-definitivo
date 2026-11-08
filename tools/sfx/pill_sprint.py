"""Sound design for the 4 s pill-sprint shot. Event times come from src/demo/pillSprint.json,
the same file the animation reads, so picture and sound can't drift apart.

    .venv/Scripts/python tools/sfx/pill_sprint.py
writes public/audio/pill_sprint_mix.wav (+ stems in out/audio/pill_sprint/).
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np  # noqa: E402
import sfxlib as S  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
TL = json.load(open(os.path.join(ROOT, 'src', 'demo', 'pillSprint.json'), encoding='utf-8'))
E, SH, DUR = TL['events'], TL['shots'], TL['duration']
S.seed(11)

stems = {k: S.Mix(DUR) for k in ('amb', 'foley', 'power', 'impact', 'speed', 'ui')}

# --- ambience: calm street until the launch; dips during the close-up ------------------------
amb = S.ambience(SH['D'][0] + 0.2, level=0.13)
stems['amb'].add(0.0, amb, -2)
stems['amb'].duck(SH['B'][0], SH['B'][1], -6)
stems['amb'].duck(E['launch'], DUR, -40, ramp=0.03)

# --- foley: pill handling, mouth, gulp ------------------------------------------------------
f = stems['foley']
f.add(0.06, S.click(3400, 0.03, 0.35), -6)               # pill tapped between the fingers
f.add(E['pillLift'] - 0.02, S.cloth(0.3, 0.3), -8)        # sleeve rustle as the hand rises
f.add(E['pillIn'] - 0.015, S.mouth_pop(0.6), -3)          # pill in
f.add(E['gulp'] - 0.04, S.gulp(0.9), 0)                   # GULP
f.add(E['crouch'], S.cloth(0.25, 0.35), -6)               # drops into the crouch

# --- power-up: reverse swell into the surge, heartbeat, sub drop, rising energy --------------
p = stems['power']
p.add(E['surge'] - 0.45, S.reverse_swell(0.45, 0.55), -6)
p.add(E['surge'], S.heartbeat(1.0), -4)
p.add(E['surge'], S.sub_drop(0.9, 95, 30, 0.9), -8)
p.add(E['beat2'], S.heartbeat(0.9), -6)
rise_dur = E['launch'] - E['surge']
p.add(E['surge'] + 0.05, S.riser(rise_dur - 0.05, 260, 7000, 0.5, 110), -9)


def crack_density(t):
    T = E['surge'] + t
    if T > E['launch']:
        return 0
    return 18 + 30 * (T - E['surge']) / (E['launch'] - E['surge'])


p.add(E['surge'], S.crackle_bed(E['launch'] - E['surge'] + 0.05, crack_density, 0.5), -9)
p.add(SH['B'][0] - 0.03, S.whoosh(0.22, 3000, 700, 0.45), -10)      # cut into the close-up
p.add(E['smirk'] + 0.02, S.glint(0.4), -9)                           # confident smirk sparkle

# --- impact: launch boom, debris, leaves, distant sonic boom --------------------------------
i = stems['impact']
i.add(E['launch'] - 0.012, S.boom(1.0, 0.0), 2)
i.add(E['launch'], S.whoosh(0.55, 2600, 260, 0.9, 0.0, 0.6, q=1.3), -3)
i.add(E['launch'] + 0.02, S.debris(0.9, 0.5), -4)
i.add(E['launch'] + 0.05, S.rustle(0.95, 0.35), -6)
i.add(E['launch'] + 0.12, S.double_boom(0.7, 0.6), -7)             # far down the street

# --- speed: wind roar, footfalls, passing whooshes, exit ------------------------------------
sp = stems['speed']
d0 = SH['D'][0]
sp.add(d0 - 0.03, S.whoosh(0.18, 5000, 1200, 0.7), -6)             # smash cut in
wind = S.wind_roar(DUR - d0 + 0.05, 0.75)
sp.add(d0, wind, -5)
# footfalls on the dash cycle: 3.9 cycles/s = 7.8 contacts/s, alternating sides
k = 0
t = d0 + 0.02
while t < E['exit'] + 0.1:
    sp.add(t, S.footstep(0.6, -0.15 if k % 2 else 0.15), -9)
    k += 1
    t += 1 / 7.8
# world rushing past: short whooshes sweeping right → left
for j, tw in enumerate(np.arange(d0 + 0.1, DUR - 0.1, 0.23)):
    sp.add(float(tw), S.whoosh(0.2, 1800 + 300 * (j % 3), 500, 0.35, 0.7, -0.7), -12)
sp.add(d0, S.crackle_bed(DUR - d0, 10, 0.35), -14)
sp.add(E['exit'] - 0.05, S.whoosh(0.4, 900, 4500, 0.9, -0.2, 0.9, q=1.4), -2)   # he pulls away
sp.add(E['exit'] + 0.16, S.boom(0.7, 0.35), -5)

# --- ui: ×100 callout --------------------------------------------------------------------------
u = stems['ui']
u.add(E['hud'] - 0.04, S.whoosh(0.16, 6000, 2000, 0.4), -10)
u.add(E['hud'], S.ticks(0.33, 30, 12, 0.18), -12)
u.add(E['hud'] + 0.33, S.chime(0.45), -6)

# --- mix ----------------------------------------------------------------------------------
gains = {'amb': 0, 'foley': 0, 'power': 0, 'impact': 0, 'speed': -1, 'ui': -1}
master = S.Mix(DUR)
out_dir = os.path.join(ROOT, 'out', 'audio', 'pill_sprint')
os.makedirs(out_dir, exist_ok=True)
for name, st in stems.items():
    master.buf += st.buf * (10 ** (gains[name] / 20))
    S.write_wav(os.path.join(out_dir, f'{name}.wav'), S.norm(st.buf, 0.9) if np.any(st.buf) else st.buf)
mix = master.master(-1.0, 1.25)
os.makedirs(os.path.join(ROOT, 'public', 'audio'), exist_ok=True)
S.write_wav(os.path.join(ROOT, 'public', 'audio', 'pill_sprint_mix.wav'), mix)
rms = 20 * np.log10(np.sqrt(np.mean(mix ** 2)) + 1e-9)
print(f'wrote mix ({DUR}s, rms {rms:.1f} dBFS, peak {20*np.log10(np.max(np.abs(mix))):.1f} dBFS)')
