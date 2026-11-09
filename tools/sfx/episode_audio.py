"""Full episode soundtrack: narration + music (ducked under the voice) + per-set ambience +
automatic and scripted sound effects → public/episodes/<slug>/mix.wav (stems in out/audio/<slug>/).

    .venv/Scripts/python -I tools/sfx/episode_audio.py <slug>

Scripted cues: shot "sfx": [{"t": 0.4, "name": "boom", "vol": -6, "dur": 1.2}], t = seconds into the shot.
Automatic: whoosh into cards, whip/flash/zoom/smash cuts, ticks + chime on stat overlays, hits on titles.
Music: the user's track (house rule since 2026-11-09: they send it before each episode):
       {"shot": 0, "file": "music/<slug>/track.mp3", "vol": -20} (path under public/). Procedural beds
       ({"mood": "curious"}) are only a fallback.
SFX pack: efeitos-sonoros/map.json maps event names to the user's files, e.g.
       {"whoosh": {"files": ["whoosh/w1.wav", "whoosh/w2.wav"], "vol": -9}, "pop": {"files": ["ui/pop.wav"]}}
       (paths under efeitos-sonoros/). Mapped events use the pack (variants rotate, peaks normalised);
       the rest are synthesized.
Dry breaths: where a picture cut lands in a pause of the narration, music and ambience drop out for that
       breath too (~0.12-0.16 s), the staccato the Vitinho reference uses (2026-11-09).
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

# --- the user's SFX pack ------------------------------------------------------------------------
PACK_DIR = os.path.join(ROOT, 'efeitos-sonoros')  # the user's folder (2026-11-09); map.json + README.md inside
PACK = {k: v for k, v in (json.load(open(os.path.join(PACK_DIR, 'map.json'), encoding='utf-8')) if os.path.exists(os.path.join(PACK_DIR, 'map.json')) else {}).items() if not k.startswith('_')}
_pack_cache, _pack_turn = {}, {}


def ev(name, synth, db):
    """(sound, dB) for an event: the next variant from the user's pack when `name` is mapped, else the
    synthesized fallback `synth()` at `db`. A pack entry's own "vol" wins over `db`."""
    e = PACK.get(name)
    # a fresh copy ships the map without the audio: missing files fall back to the synthesized sound
    if not e or not e.get('files') or not all(os.path.exists(os.path.join(PACK_DIR, f)) for f in e['files']):
        return synth(), db
    k = _pack_turn.get(name, 0)
    _pack_turn[name] = k + 1
    f = e['files'][k % len(e['files'])]
    if f not in _pack_cache:
        y = decode(os.path.join(PACK_DIR, f))
        _pack_cache[f] = y / (np.max(np.abs(y)) + 1e-9) * 0.89  # pack files come at any level: peak -1 dBFS, then the event's dB
    return _pack_cache[f], e.get('vol', db)


def sfx(t, name, synth, db):
    y, d = ev(name, synth, db)
    fx.add(t, y, d)


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
        sfx(st - 0.05, 'card', lambda: S.whoosh(0.3, 4200, 900, 0.5), -15)
    words = tm['shots'][i].get('words')
    swap = (shot.get('fx') or {}).get('swap')
    if swap:
        ts = st + cue(swap['t'], words, 0.5)
        sfx(ts - 0.3, 'swapCharge', lambda: S.whoosh(0.3, 600, 5200, 0.6), -11)   # blink-blink charge
        sfx(ts, 'swap', lambda: S.mouth_pop(0.8), -6)                           # the swap 'pop'
        sfx(ts, 'sparkle', lambda: S.glint(0.4), -13)
    cut = shot.get('cut')
    if cut == 'whip':
        sfx(st - 0.12, 'whoosh', lambda: S.whoosh(0.3, 3000, 600, 0.9), -8)
    elif cut == 'push':
        sfx(st - 0.12, 'swoosh', lambda: S.whoosh(0.28, 4200, 1200, 0.7), -10)
    elif cut == 'flash':
        sfx(st, 'sparkle', lambda: S.glint(0.4), -12)
        sfx(st, 'impact', lambda: S.boom(0.6, 0.4), -12)
    elif cut == 'zoom':
        sfx(st - 0.22, 'whooshUp', lambda: S.whoosh(0.35, 600, 5200, 0.7), -9)      # rising rush into the cut
    elif cut == 'smash':
        sfx(st, 'impact', lambda: S.boom(0.7, 0.2), -7)                              # hard hit on the frame
        sfx(st, 'sparkle', lambda: S.glint(0.3), -14)
    for o in shot.get('overlays', []):
        at = st + cue(o.get('at', 0), words, 0)
        if o['type'] == 'stat':
            sfx(at, 'ticks', lambda: S.ticks(0.33, 30, 12, 0.18), -14)
            sfx(at + 0.33, 'ding', lambda: S.chime(0.45), -10)
        elif o['type'] == 'title':
            sfx(at - 0.3, 'swell', lambda: S.reverse_swell(0.3, 0.5), -10)
            sfx(at, 'impact', lambda: S.boom(0.8, 0.3), -9)
        elif o['type'] == 'label':
            sfx(at, 'click', lambda: S.click(2600, 0.03, 0.4), -14)
        # beat effects (2026-11-09, Vitinho reference): no visual event without a sound
        elif o['type'] == 'emote':
            sfx(at, {'sweat': 'drip', 'tears': 'drip', 'question': 'boing', 'exclaim': 'sting', 'notes': 'ding', 'sparkle': 'sparkle', 'anger': 'puff', 'love': 'pop', 'zzz': 'pop'}.get(o.get('kind', ''), 'pop'),
                lambda: S.mouth_pop(0.6), -9)
        elif o['type'] == 'circle':
            sfx(at, 'ding', lambda: S.chime(0.4), -10)
        elif o['type'] == 'burst':
            sfx(at - 0.15, 'whooshUp', lambda: S.whoosh(0.3, 500, 5000, 0.6), -11)
            sfx(at, 'sparkle', lambda: S.glint(0.4), -11)
        elif o['type'] == 'flyin':
            sfx(at, 'swoosh', lambda: S.whoosh(0.35, 4000, 900, 0.6), -11)
        elif o['type'] == 'timewarp':
            sfx(at, 'clock', lambda: S.ticks(1.2, 14, 30, 0.2), -12)
            sfx(at, 'whooshUp', lambda: S.whoosh(0.8, 300, 3000, 0.5), -14)
        elif o['type'] == 'spotlight':
            sfx(at, 'spot', lambda: S.boom(0.5, 0.6), -14)
        elif o['type'] == 'word':
            sfx(at, 'pop', lambda: S.mouth_pop(0.5), -12)
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
        if name not in LIB and name not in PACK:
            print(f'  ! unknown sfx "{name}" in shot {i} (known: {", ".join(LIB)})')
            continue
        y, d = ev(name, lambda: LIB[name](c.get('dur')), DEFAULT_DB.get(name, -8))
        fx.add(st + cue(c.get('t', 0), words, 0), y, c.get('vol', d))

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

# --- dry breaths ---------------------------------------------------------------------------------
# Where a picture cut lands in a pause of the narration, the music and ambience drop out for that breath
# too (up to 0.16 s, ending on the cut): the track "breathes" with the voice (Vitinho reference, 2026-11-09).
if not draft:
    hop10 = SR // 100
    nf = N // hop10
    lv = np.sqrt(np.mean(vo.x[: nf * hop10].mean(axis=1).reshape(nf, hop10) ** 2, axis=1))
    quiet = lv < 0.004
    gate = np.ones(N)
    ramp = int(0.008 * SR)
    breaths = 0
    for i in range(1, len(tm['shots'])):
        c = tm['shots'][i]['start']
        k = int(c * 100)
        if not (0 < k < nf and quiet[max(0, k - 2):k + 1].all()):
            continue
        a = k
        while a > 0 and quiet[a - 1] and k - a < 16:
            a -= 1
        if k - a < 8:  # a breath shorter than 0.08 s is not a sentence break
            continue
        i0, i1 = a * hop10, k * hop10
        gate[i0:i1] = 0
        gate[i0:i0 + ramp] = np.linspace(1, 0, min(ramp, i1 - i0))
        gate[max(i0, i1 - ramp):i1] = np.linspace(0, 1, i1 - max(i0, i1 - ramp))
        breaths += 1
    mus.x *= gate[:, None]
    amb.x *= gate[:, None]
    print(f'dry breaths: music/ambience drop out on {breaths} of {len(tm["shots"]) - 1} cuts')

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
