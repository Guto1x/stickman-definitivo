"""The shorts' "world freezes" sound: a downward whoosh + sub drop on the pause hit, then a quiet airy
drone under the hero's 4th-wall line (time stopped). One file, reused by every short; tools/shorts.mjs
places it at the freeze and trims it to the short's length.
    .venv/Scripts/python.exe tools/sfx/freeze.py  ->  public/audio/sfx_freeze.wav
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sfxlib as S  # noqa: E402

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
DUR = 14.0
out = np.zeros((int(DUR * S.SR), 2), np.float32)


def add(t, y, db=0.0):
    i = int(t * S.SR)
    y = y[: max(0, len(out) - i)]
    out[i:i + len(y)] += y * (10 ** (db / 20))


add(0.0, S.whoosh(0.5, 3200, 160, 0.9), -4)          # the world winds down
add(0.04, S.sub_drop(0.8, 110, 30, 1.0), -6)
add(0.0, S.click(1800, 0.03, 0.8), -10)               # the "pause" click
add(0.02, S.glint(0.35), -14)
# time-stopped air: low pink noise + a faint high shimmer, swelling in and slowly breathing
n = len(out)
t = np.arange(n) / S.SR
air = S.lp(S.pink(DUR), 700) * 0.04 + S.hp(S.pink(DUR), 5000) * 0.005  # ~13 dB under the hero's line
env = np.clip((t - 0.3) / 0.8, 0, 1) * (0.85 + 0.15 * np.sin(t * 1.3))
out += S.stereo(air * env, width=1)
out = S.fade(out, 0.002, 1.5)
S.write_wav(os.path.join(ROOT, 'public', 'audio', 'sfx_freeze.wav'), out)
print('public/audio/sfx_freeze.wav')
