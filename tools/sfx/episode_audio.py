"""Full episode soundtrack: narration + music (ducked under the voice) + per-set ambience +
automatic and scripted sound effects → public/episodes/<slug>/mix.wav (stems in out/audio/<slug>/).

    .venv/Scripts/python -I tools/sfx/episode_audio.py <slug>

Scripted cues: shot "sfx": [{"t": 0.4, "name": "boom", "vol": -6, "dur": 1.2}], t = seconds into the shot.
Automatic: whoosh into cards, whip/flash/zoom/smash cuts, ticks + chime on stat overlays, hits on titles.
Music: episode "music": [{"shot": 0, "mood": "curious"}, {"shot": 14, "mood": "tension"}] or a file:
       {"shot": 0, "file": "music/my_track.mp3", "vol": -18} (path under public/).
"""
import json
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np  # noqa: E402
from scipy.io import wavfile  # noqa: E402

import music as M  # noqa: E402
import sfxlib as S  # noqa: E402

SR = S.SR
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
slug = sys.argv[1]
D = os.path.join(ROOT, 'public', 'episodes', slug)
ep = json.load(open(os.path.join(D, 'episode.json'), encoding='utf-8'))
tm = json.load(open(os.path.join(D, 'timing.json'), encoding='utf-8'))
TOTAL = tm['total'] + 1.0
N = int(TOTAL * SR)
S.seed(42)

OUTDOOR = {'suburb', 'city', 'park', 'stadium', 'rooftop', 'apartments'}
NIGHT = {'night', 'interiorNight', 'dusk', 'rooftopNight', 'cityNight', 'stadiumNight'}


def load_wav(path):
    sr, x = wavfile.read(path)
    integer = x.dtype.kind == 'i'
    x = x.astype(np.float64)
    if integer:
        x /= 32768.0
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    if sr != SR:
        raise SystemExit(f'{path}: expected {SR} Hz, got {sr}')
    return x


def decode(path):
    """Any audio file → float stereo at SR via ffmpeg."""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)


class Bus:
    def __init__(self):
        self.x = np.zeros((N, 2))

    def add(self, t, y, db=0.0):
        if y.ndim == 1:
            y = S.stereo(y)
        i = int(round(t * SR))
        if i < 0:
            y, i = y[-i:], 0
        m = min(len(y), N - i)
        if m > 0:
            self.x[i:i + m] += y[:m] * 10 ** (db / 20)


vo, mus, amb, fx = Bus(), Bus(), Bus(), Bus()


def cue(spec, words, fallback=0.0):
    """Same word-cue syntax as src/episode/cue.ts: number, '@word', '@word#2', '@word+0.1'."""
    import re
    if spec is None:
        return fallback
    if isinstance(spec, (int, float)):
        return float(spec)
    m = re.match(r"^@((?:[^\W_]|')+)(?:#(\d+))?([+-][\d.]+)?$", str(spec).strip(), re.I)
    if not m:
        return fallback
    hits = [t for w, t in (words or []) if w == m.group(1).lower()]
    if not hits:
        return fallback
    n = int(m.group(2) or 1)
    return hits[min(n, len(hits)) - 1] + float(m.group(3) or 0)


# --- narration ------------------------------------------------------------------------------
draft = tm.get('draft', False)
if not draft:
    for sec in tm['sections']:
        vo.add(sec['start'], load_wav(os.path.join(ROOT, 'public', sec['file'])), 0)

# --- ambience per 3D shot (crossfaded) ------------------------------------------------------
for i, shot in enumerate(ep['shots']):
    st, du = tm['shots'][i]['start'], tm['shots'][i]['dur']
    if shot.get('kind') == 'card':
        continue
    seg = du + 0.3
    set_ = shot.get('set', 'suburb')
    night = shot.get('time') in NIGHT
    if set_ in OUTDOOR:
        a = S.ambience(seg, 0.12)
        if night:
            a = S.stereo(S.lp(S.pink(seg), 900) * 0.04, width=1)
            for c in range(int(seg * 3)):
                ch = S.osc(4300, 0.05) * np.sin(np.pi * S.t_axis(0.05) / 0.05) * 0.03
                j = int((c / 3 + 0.1) * SR)
                a[j:j + len(ch)] += S.stereo(ch, 0.5 - (c % 2))[: max(0, min(len(ch), len(a) - j))]
        if set_ == 'stadium':
            crowd = S.bp(S.pink(seg), 300, 2500) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.3 * S.t_axis(seg)))
            a += S.stereo(S.norm(crowd) * 0.15, width=1)
        if set_ == 'apartments':
            # a building fire instead of birds: roar + flame rush + wood crackle, a siren far off
            a = S.stereo(S.lp(S.brown(seg), 300) * 0.03, width=1) + S.fire_bed(seg, 0.16) + S.siren(seg, 0.05, 0.75)
    else:
        a = S.stereo(S.lp(S.pink(seg), 500) * 0.05 + S.lp(S.brown(seg), 120) * 0.04, width=1)
    amb.add(st - 0.15, S.fade(a, 0.15, 0.15), -2)

# --- sound effects ----------------------------------------------------------------------------
LIB = {
    'whoosh': lambda d: S.whoosh(d or 0.5, 2600, 500, 0.8),
    'whooshUp': lambda d: S.whoosh(d or 0.5, 500, 4000, 0.8),
    'swoosh': lambda d: S.whoosh(d or 0.25, 5000, 1500, 0.6),
    'boom': lambda d: S.boom(1.0, 0.0),
    'farBoom': lambda d: S.double_boom(0.8, 0.6),
    'thud': lambda d: S.footstep(1.0),
    'footsteps': lambda d: np.concatenate([np.vstack([S.footstep(0.7, 0.2 * (-1) ** k), np.zeros((int(0.27 * SR) - len(S.footstep()), 2))]) for k in range(int((d or 1.2) / 0.27))]),
    'gulp': lambda d: S.gulp(0.9),
    'click': lambda d: S.click(3200, 0.03, 0.6),
    'pop': lambda d: S.mouth_pop(0.7),
    'cloth': lambda d: S.cloth(d or 0.3, 0.4),
    'heartbeat': lambda d: S.heartbeat(1.0),
    'subdrop': lambda d: S.sub_drop(d or 0.9),
    'riser': lambda d: S.riser(d or 2.0),
    'swell': lambda d: S.reverse_swell(d or 0.5),
    'zap': lambda d: S.zap(3000, 0.06, 0.6),
    'crackle': lambda d: S.crackle_bed(d or 1.0, 25, 0.5),
    'wind': lambda d: S.wind_roar(d or 2.0, 0.7),
    'debris': lambda d: S.debris(d or 0.8, 0.5),
    'rustle': lambda d: S.rustle(d or 0.9, 0.4),
    'chime': lambda d: S.chime(0.45),
    'glint': lambda d: S.glint(0.4),
    'ticks': lambda d: S.ticks(d or 0.4, 26, 12, 0.18),
    'ring': lambda d: S.ringtone(d or 1.6),
    'bell': lambda d: S.school_bell(d or 2.5),
    'whistle': lambda d: S.whistle(d or 0.7),
    'groan': lambda d: S.groan(d or 1.4),
    'groanLow': lambda d: S.groan(d or 1.8, 0.3, 82.0),
    'menu': lambda d: S.ui_open(0.35),
    'tick': lambda d: S.ui_tick(0.3),
    'alert': lambda d: S.ui_alert(0.35),
    'horn': lambda d: S.horn(d or 0.8),
    'crack': lambda d: S.ice_crack(0.6),
    'splash': lambda d: S.splash(0.6),
}
DEFAULT_DB = {'whoosh': -9, 'swoosh': -12, 'whooshUp': -9, 'boom': -4, 'farBoom': -8, 'gulp': -2, 'chime': -8, 'ticks': -12, 'glint': -10,
              'wind': -8, 'riser': -10, 'crackle': -12, 'heartbeat': -4, 'subdrop': -8, 'click': -10, 'pop': -6, 'cloth': -10, 'footsteps': -10}

for i, shot in enumerate(ep['shots']):
    st = tm['shots'][i]['start']
    if shot.get('kind') == 'card':
        fx.add(st - 0.05, S.whoosh(0.3, 4200, 900, 0.5), -15)
    words = tm['shots'][i].get('words')
    swap = (shot.get('fx') or {}).get('swap')
    if swap:
        ts = st + cue(swap['t'], words, 0.5)
        fx.add(ts - 0.3, S.whoosh(0.3, 600, 5200, 0.6), -11)   # blink-blink charge
        fx.add(ts, S.mouth_pop(0.8), -6)                      # the swap 'pop'
        fx.add(ts, S.glint(0.4), -13)
    cut = shot.get('cut')
    if cut == 'whip':
        fx.add(st - 0.12, S.whoosh(0.3, 3000, 600, 0.9), -8)
    elif cut == 'flash':
        fx.add(st, S.glint(0.4), -12)
        fx.add(st, S.boom(0.6, 0.4), -12)
    elif cut == 'zoom':
        fx.add(st - 0.22, S.whoosh(0.35, 600, 5200, 0.7), -9)      # rising rush into the cut
    elif cut == 'smash':
        fx.add(st, S.boom(0.7, 0.2), -7)                            # hard hit on the frame
        fx.add(st, S.glint(0.3), -14)
    for o in shot.get('overlays', []):
        at = st + cue(o.get('at', 0), words, 0)
        if o['type'] == 'stat':
            fx.add(at, S.ticks(0.33, 30, 12, 0.18), -14)
            fx.add(at + 0.33, S.chime(0.45), -10)
        elif o['type'] == 'title':
            fx.add(at - 0.3, S.reverse_swell(0.3, 0.5), -10)
            fx.add(at, S.boom(0.8, 0.3), -9)
        elif o['type'] == 'label':
            fx.add(at, S.click(2600, 0.03, 0.4), -14)
        elif o['type'] == 'menu':
            # body-settings HUD: open blip, a slider tick per changing row, the toast's alert
            fx.add(at, S.ui_open(0.35), -9)
            for r in o.get('rows', []):
                if 'from' in r:
                    fx.add(st + cue(r.get('at', 0), words, 0), S.ui_tick(0.3), -10)
            if o.get('note'):
                fx.add(st + cue(o.get('noteAt', 0.6), words, 0) if isinstance(o.get('noteAt'), str) else at + o.get('noteAt', 0.6), S.ui_alert(0.35), -10)
    for c in shot.get('sfx', []):
        name = c['name']
        if name not in LIB:
            print(f'  ! unknown sfx "{name}" in shot {i} (known: {", ".join(LIB)})')
            continue
        fx.add(st + cue(c.get('t', 0), words, 0), LIB[name](c.get('dur')), c.get('vol', DEFAULT_DB.get(name, -8)))

# --- music --------------------------------------------------------------------------------------
cues = sorted(ep.get('music', [{'shot': 0, 'mood': 'curious'}]), key=lambda c: c['shot'])
for k, c in enumerate(cues):
    t0 = tm['shots'][c['shot']]['start']
    t1 = tm['shots'][cues[k + 1]['shot']]['start'] if k + 1 < len(cues) else TOTAL
    seg = t1 - t0 + 1.0
    if c.get('file'):
        y = decode(os.path.join(ROOT, 'public', c['file']))
        reps = int(np.ceil(seg * SR / len(y))) + 1
        y = np.tile(y, (reps, 1))[: int(seg * SR)]
    else:
        y = M.bed(c.get('mood', 'curious'), seg)
    y = S.fade(y, 0.6 if k == 0 else 1.0, 1.0 if k + 1 < len(cues) else 2.0)
    mus.add(t0 - (0 if k == 0 else 0.5), y, c.get('vol', -17))

# duck music + ambience under the voice (smoothed envelope sidechain)
env = np.abs(vo.x).mean(axis=1)
hop = 480
e = np.array([env[j:j + hop].max() for j in range(0, N, hop)])
g = np.zeros_like(e)
for j in range(len(e)):
    target = 1.0 if e[j] > 0.02 else 0.0
    coef = 0.5 if target > (g[j - 1] if j else 0) else 0.06  # fast attack, slow release
    g[j] = (g[j - 1] if j else 0) + coef * (target - (g[j - 1] if j else 0))
duck = np.repeat(g, hop)[:N]
mus.x *= (1 - 0.55 * duck)[:, None]
amb.x *= (1 - 0.35 * duck)[:, None]

# --- master -------------------------------------------------------------------------------------
# Stems first, then sum in place in float32: four float64 buses of a 15-min episode are ~640 MB each,
# and `vo + mus + amb + fx` used to allocate temporaries until it ran out of memory (menu-corpo, 2026-11-09).
out_dir = os.path.join(ROOT, 'out', 'audio', slug)
os.makedirs(out_dir, exist_ok=True)
for name, b in (('vo', vo), ('music', mus), ('ambience', amb), ('sfx', fx)):
    S.write_wav(os.path.join(out_dir, f'{name}.wav'), S.norm(b.x, 0.9) if np.any(b.x) else b.x)
mix = vo.x.astype(np.float32)
vo.x = None
for b in (mus, amb, fx):
    mix += b.x.astype(np.float32)
    b.x = None
mix -= mix.mean(axis=0)
mix = S.hp(mix.T, 25, 2).T.astype(np.float32)
peak = np.max(np.abs(mix)) + 1e-9
mix /= peak
mix = (np.tanh(mix * 1.2) / np.tanh(1.2)).astype(np.float32)
mix = S.norm(mix, 10 ** (-1.0 / 20))
mix = S.fade(mix, 0.01, 0.8)

S.write_wav(os.path.join(D, 'mix.wav'), mix.astype(np.float32))
rms = 20 * np.log10(np.sqrt(np.mean(mix ** 2)) + 1e-9)
print(f'mix.wav: {TOTAL:.1f} s, rms {rms:.1f} dBFS' + (' (draft timing: no narration yet)' if draft else ''))
