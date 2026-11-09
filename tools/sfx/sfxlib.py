"""Procedural sound-effects library (numpy/scipy, no samples, no downloads).

Every generator returns a float32 stereo array of shape (n, 2) at SR. Sounds are built from
filtered noise, swept oscillators and envelopes, then placed on a timeline with `Mix.add`.
All one-shots get short fades so nothing clicks at its edges.
"""
from __future__ import annotations

import numpy as np
from scipy import signal

SR = 48000
_rng = np.random.default_rng(7)


def seed(s: int):
    global _rng
    _rng = np.random.default_rng(s)


# --- basics ---------------------------------------------------------------------------------
def t_axis(dur: float) -> np.ndarray:
    return np.arange(int(dur * SR)) / SR


def white(dur: float) -> np.ndarray:
    return _rng.standard_normal(int(dur * SR)).astype(np.float64)


def pink(dur: float) -> np.ndarray:
    n = int(dur * SR)
    x = _rng.standard_normal(n)
    b, a = [0.049922035, -0.095993537, 0.050612699, -0.004408786], [1, -2.494956002, 2.017265875, -0.522189400]
    y = signal.lfilter(b, a, x)
    return y / (np.std(y) + 1e-9)


def brown(dur: float) -> np.ndarray:
    y = np.cumsum(_rng.standard_normal(int(dur * SR)))
    y = signal.sosfilt(signal.butter(1, 20, 'highpass', fs=SR, output='sos'), y)
    return y / (np.std(y) + 1e-9)


def lp(x, f, order=4):
    return signal.sosfilt(signal.butter(order, min(f, SR / 2 - 100), 'lowpass', fs=SR, output='sos'), x)


def hp(x, f, order=4):
    return signal.sosfilt(signal.butter(order, f, 'highpass', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=3):
    return signal.sosfilt(signal.butter(order, [lo, min(hi, SR / 2 - 100)], 'bandpass', fs=SR, output='sos'), x)


def sweep_filter(x: np.ndarray, f0: float, f1: float, q: float = 2.0, kind: str = 'bp', curve: str = 'exp') -> np.ndarray:
    """Time-varying TPT state-variable filter (cutoff glides f0→f1 over the clip)."""
    n = len(x)
    k = np.linspace(0, 1, n)
    f = f0 * (f1 / f0) ** k if curve == 'exp' else f0 + (f1 - f0) * k
    g = np.tan(np.pi * np.clip(f, 10, SR / 2.2) / SR)
    kk = 1.0 / q
    a1 = 1.0 / (1.0 + g * (g + kk))
    a2 = g * a1
    a3 = g * a2
    ic1 = ic2 = 0.0
    out = np.empty(n)
    mode = 0 if kind == 'bp' else (1 if kind == 'lp' else 2)
    for i in range(n):
        v3 = x[i] - ic2
        v1 = a1[i] * ic1 + a2[i] * v3
        v2 = ic2 + a2[i] * ic1 + a3[i] * v3
        ic1 = 2 * v1 - ic1
        ic2 = 2 * v2 - ic2
        out[i] = v1 if mode == 0 else (v2 if mode == 1 else x[i] - kk * v1 - v2)
    return out


def env_exp(dur: float, tau: float, attack: float = 0.002) -> np.ndarray:
    t = t_axis(dur)
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-t / tau)


def env_adsr(dur: float, a: float, d: float, s: float, r: float) -> np.ndarray:
    t = t_axis(dur)
    e = np.where(t < a, t / max(a, 1e-4), np.where(t < a + d, 1 - (1 - s) * (t - a) / max(d, 1e-4), s))
    rel = np.clip((dur - t) / max(r, 1e-4), 0, 1)
    return e * rel


def env_swell(dur: float, power: float = 2.0) -> np.ndarray:
    """Rises to the end (reverse-cymbal style)."""
    return np.linspace(0, 1, int(dur * SR)) ** power


def fade(x: np.ndarray, fin: float = 0.003, fout: float = 0.01) -> np.ndarray:
    x = x.copy()
    a, b = int(fin * SR), int(fout * SR)
    if a > 0:
        x[:a] *= np.linspace(0, 1, a)[:, None] if x.ndim == 2 else np.linspace(0, 1, a)
    if b > 0:
        x[-b:] *= np.linspace(1, 0, b)[:, None] if x.ndim == 2 else np.linspace(1, 0, b)
    return x


def osc(freq, dur: float, shape: str = 'sine', phase: float = 0.0) -> np.ndarray:
    """Oscillator with a constant or per-sample frequency array."""
    n = int(dur * SR)
    f = np.full(n, freq, dtype=np.float64) if np.isscalar(freq) else np.asarray(freq)[:n]
    ph = 2 * np.pi * np.cumsum(f) / SR + phase
    if shape == 'sine':
        return np.sin(ph)
    if shape == 'saw':
        return 2 * ((ph / (2 * np.pi)) % 1) - 1
    if shape == 'square':
        return np.sign(np.sin(ph))
    if shape == 'tri':
        return 2 * np.abs(2 * ((ph / (2 * np.pi)) % 1) - 1) - 1
    raise ValueError(shape)


def glide(f0: float, f1: float, dur: float, curve: str = 'exp') -> np.ndarray:
    k = np.linspace(0, 1, int(dur * SR))
    return f0 * (f1 / f0) ** k if curve == 'exp' else f0 + (f1 - f0) * k


def stereo(x: np.ndarray, pan: float = 0.0, width: float = 0.0) -> np.ndarray:
    """pan -1..1 (equal power); width adds a short Haas delay on one side for space."""
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    out = np.stack([x * l, x * r], axis=1)
    if width > 0:
        d = int(width * 0.012 * SR)
        out[d:, 1] = 0.7 * out[d:, 1] + 0.3 * out[:-d, 1]
    return out


def autopan(x: np.ndarray, p0: float, p1: float) -> np.ndarray:
    p = np.linspace(p0, p1, len(x))
    return np.stack([x * np.cos((p + 1) * np.pi / 4), x * np.sin((p + 1) * np.pi / 4)], axis=1)


def saturate(x: np.ndarray, drive: float = 2.0) -> np.ndarray:
    return np.tanh(x * drive) / np.tanh(drive)


def norm(x: np.ndarray, peak: float = 1.0) -> np.ndarray:
    m = np.max(np.abs(x)) + 1e-9
    return x * (peak / m)


def reverb(x: np.ndarray, decay: float = 0.6, mix: float = 0.25, damp: float = 6000, pre: float = 0.012) -> np.ndarray:
    """Convolution with a synthetic stereo exponential-noise IR."""
    n = int(decay * SR)
    t = np.arange(n) / SR
    irs = []
    for _ in range(2):
        ir = _rng.standard_normal(n) * np.exp(-t * 6.9 / decay)
        ir = lp(ir, damp, 2)
        ir[: int(pre * SR)] = 0
        irs.append(ir / np.sqrt(np.sum(ir ** 2) + 1e-9))
    if x.ndim == 1:
        x = stereo(x)
    wet = np.stack([signal.fftconvolve(x[:, i], irs[i])[: len(x)] for i in range(2)], axis=1)
    return x * (1 - mix) + wet * mix


# --- one-shots ------------------------------------------------------------------------------
def click(freq: float = 3200, dur: float = 0.035, level: float = 0.6) -> np.ndarray:
    """Tiny plastic tick (pill, button)."""
    t = t_axis(dur)
    tone = np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.006)
    nz = hp(white(dur), 2500) * np.exp(-t / 0.002) * 0.6
    return fade(stereo((tone + nz) * level), 0.0005, 0.005)


def cloth(dur: float = 0.28, level: float = 0.25) -> np.ndarray:
    """Fabric rustle for arm moves."""
    x = bp(white(dur), 900, 5500) * env_adsr(dur, dur * 0.35, dur * 0.3, 0.4, dur * 0.3)
    x *= 0.6 + 0.4 * np.abs(lp(white(dur), 30, 2)) / 0.3
    return fade(stereo(norm(x) * level, width=0.4), 0.005, 0.03)


def mouth_pop(level: float = 0.5) -> np.ndarray:
    dur = 0.09
    t = t_axis(dur)
    tone = osc(glide(1100, 520, dur), dur) * np.exp(-t / 0.018)
    nz = bp(white(dur), 600, 3000) * np.exp(-t / 0.008) * 0.4
    return fade(stereo((tone + nz) * level), 0.0005, 0.01)


def gulp(level: float = 0.8) -> np.ndarray:
    """Cartoon swallow: a wet throat 'glk' with a falling resonance."""
    dur = 0.3
    t = t_axis(dur)
    body = osc(glide(420, 150, dur), dur) * env_adsr(dur, 0.012, 0.09, 0.25, 0.15)
    body += 0.5 * osc(glide(840, 300, dur), dur) * env_exp(dur, 0.05)
    wet = sweep_filter(white(dur), 1600, 380, q=6) * env_exp(dur, 0.06, 0.003) * 0.9
    glk = bp(white(0.03), 300, 1500) * np.exp(-t_axis(0.03) / 0.008)
    x = body * 0.7 + wet
    x[: len(glk)] += glk * 0.8
    return fade(stereo(saturate(norm(x), 1.6) * level), 0.001, 0.04)


def heartbeat(level: float = 1.0) -> np.ndarray:
    """Lub-dub: two sub thumps."""
    def thump(dur, f0, f1, tau):
        t = t_axis(dur)
        x = osc(glide(f0, f1, dur), dur) * np.exp(-t / tau)
        x += lp(white(dur), 300) * np.exp(-t / 0.012) * 0.3
        return x
    a = thump(0.35, 85, 42, 0.07)
    b = thump(0.35, 75, 38, 0.06) * 0.7
    out = np.zeros(int(0.6 * SR))
    out[: len(a)] += a
    o = int(0.17 * SR)
    out[o: o + len(b)] += b
    return fade(stereo(saturate(norm(out), 1.4) * level), 0.001, 0.05)


def sub_drop(dur: float = 0.9, f0: float = 95, f1: float = 32, level: float = 1.0) -> np.ndarray:
    t = t_axis(dur)
    x = osc(glide(f0, f1, dur), dur) * np.exp(-t / (dur * 0.45))
    x += 0.3 * osc(glide(f0 * 2, f1 * 2, dur), dur) * np.exp(-t / (dur * 0.2))
    return fade(stereo(saturate(x, 2.2) * level), 0.002, 0.08)


def riser(dur: float, f0: float = 300, f1: float = 6000, level: float = 0.5, tonal: float = 110) -> np.ndarray:
    """Energy build-up: filtered noise + detuned saw drone, both opening and swelling."""
    nz = sweep_filter(pink(dur), f0, f1, q=3, kind='bp')
    sw = sum(osc(tonal * d, dur, 'saw') for d in (1.0, 1.007, 0.993, 2.003)) / 4
    sw = sweep_filter(sw, f0 * 0.6, f1 * 0.5, q=1.5, kind='lp')
    trem = 1 + 0.35 * np.sin(2 * np.pi * np.linspace(5, 22, len(sw)) * t_axis(dur))
    x = (norm(nz) * 0.6 + norm(sw) * 0.5 * trem) * env_swell(dur, 1.6)
    return fade(stereo(x * level, width=0.8), 0.02, 0.03)


def reverse_swell(dur: float = 0.5, level: float = 0.6) -> np.ndarray:
    x = sweep_filter(white(dur), 400, 9000, q=1.2, kind='bp') * env_swell(dur, 3)
    return fade(stereo(norm(x) * level, width=1), 0.01, 0.004)


def zap(freq: float = 3000, dur: float = 0.05, level: float = 0.4) -> np.ndarray:
    t = t_axis(dur)
    f = freq * (1 + 0.6 * _rng.standard_normal(len(t)).cumsum() / np.sqrt(len(t)) * 0.2)
    x = osc(np.abs(f), dur, 'square') * np.exp(-t / (dur * 0.35))
    x = hp(x, 1200) + hp(white(dur), 4000) * np.exp(-t / 0.006) * 0.8
    return fade(stereo(x * level, pan=float(_rng.uniform(-0.6, 0.6))), 0.0005, 0.005)


def crackle_bed(dur: float, density, level: float = 0.35) -> np.ndarray:
    """Electric crackling; `density` = events/second, scalar or callable of time (s)."""
    out = np.zeros((int(dur * SR), 2))
    t = 0.0
    while t < dur:
        d = density(t) if callable(density) else density
        if d <= 0:
            t += 0.02
            continue
        t += float(_rng.exponential(1 / d))
        if t >= dur:
            break
        z = zap(float(_rng.uniform(1800, 6500)), float(_rng.uniform(0.012, 0.06)), level * float(_rng.uniform(0.4, 1.0)))
        i = int(t * SR)
        m = min(len(z), len(out) - i)
        out[i: i + m] += z[:m]
    hum = osc(120, dur, 'saw') * 0.5 + osc(240.6, dur, 'saw') * 0.3
    hum = lp(hum, 900) * 0.08 * level
    if callable(density):
        hum *= np.clip(np.array([density(x) for x in t_axis(dur)[::480]]).repeat(480)[: len(hum)] / 30, 0, 1)
    return out + stereo(hum)


def boom(level: float = 1.0, dist: float = 0.0) -> np.ndarray:
    """Launch / sonic boom: sub kick + mid punch + crack. `dist` 0..1 makes it far and dull."""
    dur = 1.4
    t = t_axis(dur)
    sub = osc(glide(70, 28, dur), dur) * np.exp(-t / 0.35)
    punch = lp(white(dur), 900) * np.exp(-t / 0.07)
    crack = hp(white(dur), 2500) * np.exp(-t / 0.012)
    x = sub * 1.0 + punch * 0.7 + crack * (0.6 * (1 - dist))
    if dist > 0:
        x = lp(x, 3000 * (1 - dist) + 400)
    x = saturate(norm(x), 2.4)
    return fade(reverb(stereo(x * level, width=0.5), decay=0.9 + dist, mix=0.18 + 0.3 * dist), 0.0005, 0.2)


def double_boom(level: float = 0.8, dist: float = 0.5) -> np.ndarray:
    a = boom(level, dist)
    out = np.zeros((len(a) + int(0.07 * SR), 2))
    out[: len(a)] += a
    out[int(0.07 * SR):] += a * 0.75
    return out


def whoosh(dur: float = 0.6, f0: float = 2400, f1: float = 300, level: float = 0.7, pan0: float = 0.0, pan1: float = 0.0, q: float = 1.6) -> np.ndarray:
    x = sweep_filter(pink(dur), f0, f1, q=q, kind='bp')
    x = norm(x) * np.sin(np.pi * np.clip(t_axis(dur) / dur, 0, 1)) ** 1.5
    return fade(autopan(x * level, pan0, pan1), 0.005, 0.02)


def wind_roar(dur: float, level: float = 0.6) -> np.ndarray:
    """Speed wind: buffeting band noise + low rumble."""
    t = t_axis(dur)
    flutter = 1 + 0.35 * lp(white(dur), 14, 2) / 0.05
    band = bp(pink(dur), 250, 3500) * np.clip(flutter, 0.3, 1.8)
    rum = lp(brown(dur), 120) * 0.8
    x = norm(band) * 0.8 + norm(rum) * 0.5
    return fade(stereo(x * level, width=1.0), 0.02, 0.05)


def footstep(level: float = 0.5, pan: float = 0.0) -> np.ndarray:
    dur = 0.08
    t = t_axis(dur)
    x = osc(glide(140, 70, dur), dur) * np.exp(-t / 0.018) + lp(white(dur), 1800) * np.exp(-t / 0.01) * 0.6
    return fade(stereo(x * level, pan), 0.0005, 0.01)


def debris(dur: float = 0.8, level: float = 0.35) -> np.ndarray:
    """Gravel and dust spray: scattered ticks over a hiss."""
    out = np.zeros((int(dur * SR), 2))
    for _ in range(int(55 * dur)):
        t0 = float(_rng.uniform(0, dur * 0.9)) ** 1.3 / (dur * 0.9) ** 0.3
        c = click(float(_rng.uniform(1500, 5000)), 0.02, float(_rng.uniform(0.05, 0.25)))
        c = c * np.array([float(_rng.uniform(0.3, 1)), float(_rng.uniform(0.3, 1))])
        i = int(t0 * SR)
        m = min(len(c), len(out) - i)
        out[i: i + m] += c[:m]
    hiss = bp(white(dur), 1500, 8000) * env_exp(dur, dur * 0.35, 0.01) * 0.25
    return (out + stereo(hiss, width=1)) * level


def rustle(dur: float = 0.9, level: float = 0.3) -> np.ndarray:
    """Leaves blowing."""
    x = bp(white(dur), 2000, 9000)
    am = np.clip(lp(white(dur), 25, 2) * 8 + 0.5, 0, 1.4)
    x = x * am * env_adsr(dur, 0.08, 0.2, 0.7, dur * 0.4)
    return fade(stereo(norm(x) * level, width=1), 0.01, 0.06)


def bird(level: float = 0.15, pan: float = 0.0) -> np.ndarray:
    """Short songbird chirp phrase."""
    out = []
    for _ in range(int(_rng.integers(2, 5))):
        d = float(_rng.uniform(0.04, 0.09))
        f0, f1 = float(_rng.uniform(2800, 4200)), float(_rng.uniform(3200, 5600))
        t = t_axis(d)
        f = glide(f0, f1, d) * (1 + 0.04 * np.sin(2 * np.pi * 60 * t))
        out.append(osc(f, d) * np.sin(np.pi * t / d) ** 2)
        out.append(np.zeros(int(float(_rng.uniform(0.02, 0.06)) * SR)))
    x = np.concatenate(out)
    return fade(stereo(x * level, pan), 0.002, 0.01)


def ambience(dur: float, level: float = 0.12) -> np.ndarray:
    """Calm suburban afternoon: soft air, faint distant traffic, occasional birds."""
    air = lp(pink(dur), 1200) * 0.6
    traffic = lp(brown(dur), 300) * 0.3
    x = stereo(norm(air + traffic) * level, width=1)
    t = 0.15
    while t < dur - 0.3:
        b = bird(level * float(_rng.uniform(0.6, 1.2)), float(_rng.uniform(-0.8, 0.8)))
        i = int(t * SR)
        m = min(len(b), len(x) - i)
        x[i: i + m] += b[:m]
        t += float(_rng.uniform(0.5, 1.1))
    return x


def fire_bed(dur: float, level: float = 0.3) -> np.ndarray:
    """A building fire heard from the street: low roar, breathy flame rush, and wood-crackle pops
    (short filtered noise bursts at random times, a few loud snaps among many small ones)."""
    t = t_axis(dur)
    roar = lp(brown(dur), 160) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.17 * t))
    rush = bp(pink(dur), 300, 1800) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 0.31 * t + 1.3)))
    x = stereo(norm(roar) * 0.55 + norm(rush) * 0.25, width=1)
    k = 0.0
    while k < dur:
        k += float(_rng.exponential(1 / 14))
        if k >= dur:
            break
        big = _rng.random() < 0.12
        n = int(SR * float(_rng.uniform(0.002, 0.012 if not big else 0.03)))
        e = env_exp(n / SR, 0.004 if not big else 0.01)
        n = len(e)
        burst = bp(white(n / SR + 0.01), 600 if big else 1500, 7000)[:n] * e
        amp = float(_rng.uniform(0.15, 0.4)) * (2.2 if big else 1.0)
        i = int(k * SR)
        m = min(n, len(x) - i)
        x[i: i + m] += stereo(burst[:m] * amp, float(_rng.uniform(-0.6, 0.6)))
    return norm(x) * level


def siren(dur: float, level: float = 0.2, dist: float = 0.6) -> np.ndarray:
    """US-style wail siren, slow up/down sweep 650–1400 Hz (period ~3.6 s); `dist` 0..1 dulls it."""
    t = t_axis(dur)
    f = 650 + 750 * (0.5 - 0.5 * np.cos(2 * np.pi * t / 3.6))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)
    y = lp(y, 5000 - 3800 * dist) * level * (1 - 0.5 * dist)
    return stereo(y, -0.3, width=1)


def chime(level: float = 0.35) -> np.ndarray:
    """UI 'ding' for stat callouts: two bell partial sets."""
    dur = 0.9
    t = t_axis(dur)
    x = np.zeros_like(t)
    for f, a, tau in ((1318.5, 1.0, 0.35), (1975.5, 0.6, 0.28), (2637, 0.3, 0.18), (3951, 0.15, 0.1)):
        x += a * np.sin(2 * np.pi * f * t) * np.exp(-t / tau)
    return fade(reverb(stereo(norm(x) * level), 1.2, 0.25), 0.001, 0.1)


def glint(level: float = 0.3) -> np.ndarray:
    """'Shing' sparkle for a confident smirk."""
    dur = 0.6
    t = t_axis(dur)
    x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / tau) for f, a, tau in ((2800, 1, 0.18), (4120, 0.7, 0.14), (6310, 0.5, 0.1), (8800, 0.3, 0.06)))
    x = x * np.clip(t / 0.004, 0, 1) + hp(white(dur), 6000) * np.exp(-t / 0.03) * 0.3
    return fade(reverb(stereo(norm(x) * level, 0.2), 0.8, 0.3), 0.001, 0.08)


def ticks(dur: float, rate0: float, rate1: float, level: float = 0.2) -> np.ndarray:
    """Counter ticks speeding up/slowing down."""
    out = np.zeros((int(dur * SR), 2))
    t = 0.0
    while t < dur:
        k = t / dur
        c = click(2600 + 900 * k, 0.025, level)
        i = int(t * SR)
        m = min(len(c), len(out) - i)
        out[i: i + m] += c[:m]
        t += 1 / (rate0 + (rate1 - rate0) * k)
    return out


# --- timeline -------------------------------------------------------------------------------
class Mix:
    def __init__(self, dur: float):
        self.buf = np.zeros((int(dur * SR), 2))

    def add(self, t: float, x: np.ndarray, gain_db: float = 0.0):
        if x.ndim == 1:
            x = stereo(x)
        i = int(round(t * SR))
        if i < 0:
            x, i = x[-i:], 0
        m = min(len(x), len(self.buf) - i)
        if m > 0:
            self.buf[i: i + m] += x[:m] * (10 ** (gain_db / 20))

    def duck(self, t0: float, t1: float, db: float, ramp: float = 0.05):
        """Gain envelope dip (e.g. ambience under a big moment)."""
        n = len(self.buf)
        tt = np.arange(n) / SR
        g = np.ones(n)
        inside = (tt >= t0) & (tt <= t1)
        g[inside] = 10 ** (db / 20)
        g = signal.convolve(g, np.ones(int(ramp * SR)) / int(ramp * SR), mode='same')
        self.buf *= g[:, None]

    def master(self, ceiling_db: float = -1.0, drive: float = 1.3) -> np.ndarray:
        x = self.buf - np.mean(self.buf, axis=0)
        x = hp(x.T, 25, 2).T
        x = norm(x, 1.0)
        x = np.tanh(x * drive) / np.tanh(drive)  # gentle glue / limiting
        x = norm(x, 10 ** (ceiling_db / 20))
        return fade(x, 0.002, 0.04).astype(np.float32)



def ringtone(dur: float = 1.6, level: float = 0.35) -> np.ndarray:
    """Cheerful phone ringtone: little 4-note marimba-ish motif, repeated."""
    notes = [1318.5, 1567.98, 1975.53, 1567.98]
    out = np.zeros(int(dur * SR))
    step = 0.13
    k = 0
    t0 = 0.0
    while t0 < dur - 0.05:
        f = notes[k % 4]
        n = osc(f, 0.12) * env_exp(0.12, 0.05) + 0.3 * osc(f * 2, 0.12) * env_exp(0.12, 0.03)
        i = int(t0 * SR)
        out[i:i + len(n)] += n[:max(0, len(out) - i)]
        k += 1
        t0 += step if k % 4 else step + 0.25
    return stereo(fade(out * level, 0.005, 0.05), 0.0, 0.2)


def school_bell(dur: float = 2.5, level: float = 0.45) -> np.ndarray:
    """Electric school bell: hammer striking a gong ~25×/s, metallic partials, slight room."""
    t = t_axis(dur)
    gong = sum(a * osc(f, dur) for f, a in ((1180, 1.0), (2830, 0.5), (4120, 0.3), (590, 0.25)))
    strike = 0.55 + 0.45 * (np.sin(2 * np.pi * 24 * t) > 0)
    x = saturate(gong * strike * 0.6, 1.6)
    x = x * env_adsr(dur, 0.01, 0.1, 0.9, 0.25)
    return reverb(stereo(fade(x * level, 0.005, 0.2), 0.0, 0.3), 0.7, 0.3)


def whistle(dur: float = 0.7, level: float = 0.5) -> np.ndarray:
    """Pea whistle: ~3.1 kHz tone with fast pea warble + breath noise."""
    t = t_axis(dur)
    f = 3100 + 60 * np.sin(2 * np.pi * 38 * t)
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) * (0.75 + 0.25 * np.sin(2 * np.pi * 38 * t))
    breath = bp(white(dur), 2500, 5000) * 0.25
    x = (tone + breath) * env_adsr(dur, 0.015, 0.05, 0.9, 0.08)
    return reverb(stereo(fade(x * level, 0.005, 0.05), 0.0, 0.1), 0.5, 0.2)


def groan(dur: float = 1.4, level: float = 0.3, f0: float = 110.0) -> np.ndarray:
    """Zombie moan: breathy low vowel gliding down, wobbling."""
    t = t_axis(dur)
    f = glide(f0 * 1.15, f0 * 0.8, dur) * (1 + 0.03 * np.sin(2 * np.pi * 5.5 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    buzz = sum(np.sin(ph * h) / h for h in range(1, 9))
    voice = bp(buzz, 250, 1400) + bp(pink(dur), 300, 1200) * 0.4
    x = voice * env_adsr(dur, 0.18, 0.2, 0.8, 0.4)
    return reverb(stereo(fade(norm(x) * level, 0.02, 0.2), 0.0, 0.3), 0.6, 0.25)

def ui_open(level: float = 0.35) -> np.ndarray:
    """Game-menu open: a soft two-step rising blip with a glassy tail."""
    out = np.zeros(int(0.5 * SR))
    for k, f in enumerate((880.0, 1318.5)):
        d = 0.16
        t = t_axis(d)
        b = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t / 0.07) * np.clip(t / 0.003, 0, 1)
        i = int(k * 0.07 * SR)
        out[i:i + len(b)] += b
    return fade(reverb(stereo(norm(out) * level), 0.7, 0.25), 0.001, 0.05)


def ui_tick(level: float = 0.3) -> np.ndarray:
    """Slider notch: a short square-ish tick with a pitch blip."""
    d = 0.09
    t = t_axis(d)
    x = np.sign(np.sin(2 * np.pi * 1760 * t)) * np.exp(-t / 0.015) * 0.5 + np.sin(2 * np.pi * 2640 * t) * np.exp(-t / 0.03)
    return fade(stereo(norm(x) * level), 0.001, 0.02)


def ui_alert(level: float = 0.35) -> np.ndarray:
    """Notification: two falling tones, a little ominous (the debt toast)."""
    out = np.zeros(int(0.7 * SR))
    for k, f in enumerate((987.8, 659.3)):
        d = 0.32
        t = t_axis(d)
        b = (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 1.5 * f * t)) * np.exp(-t / 0.14) * np.clip(t / 0.004, 0, 1)
        i = int(k * 0.16 * SR)
        out[i:i + len(b)] += b
    return fade(reverb(stereo(norm(out) * level), 0.9, 0.25), 0.001, 0.08)


def horn(dur: float = 0.8, level: float = 0.5) -> np.ndarray:
    """Car horn: two detuned buzzy tones (a major third), slight doppler drop."""
    t = t_axis(dur)
    f = np.where(t < dur * 0.6, 1.0, 1.0 - 0.04 * (t - dur * 0.6) / (dur * 0.4))
    x = np.zeros_like(t)
    for base in (415.0, 523.0):
        ph = 2 * np.pi * np.cumsum(base * f) / SR
        x += np.sign(np.sin(ph)) * 0.6 + np.sin(2 * ph) * 0.3
    x = lp(x, 3500) * env_adsr(dur, 0.01, 0.05, 0.9, 0.08)
    return fade(stereo(norm(saturate(x, 1.5)) * level), 0.003, 0.05)


def ice_crack(level: float = 0.6) -> np.ndarray:
    """Ice cracking: a sharp snap, a few ringing pings and a low creak."""
    d = 1.0
    t = t_axis(d)
    x = hp(white(d), 1800) * np.exp(-t / 0.012) * 1.2
    for k, (f, at) in enumerate(((3100, 0.0), (2300, 0.05), (4200, 0.11), (1700, 0.19))):
        tt = np.clip(t - at, 0, None)
        x += np.where(t >= at, np.sin(2 * np.pi * f * tt * (1 - 0.25 * tt)) * np.exp(-tt / 0.09), 0) * 0.45
    x += lp(brown(d), 180) * np.exp(-t / 0.35) * 0.8
    return fade(reverb(stereo(norm(x) * level, 0.0, 0.3), 1.0, 0.3), 0.001, 0.1)


def splash(level: float = 0.6) -> np.ndarray:
    """Body into water: low thump + a noisy splash burst + bubbling tail."""
    d = 1.4
    t = t_axis(d)
    x = np.sin(2 * np.pi * 70 * t) * np.exp(-t / 0.08) * 0.8
    x += bp(white(d), 400, 4000) * np.exp(-t / 0.18) * np.clip(t / 0.01, 0, 1)
    bub = np.zeros_like(t)
    rnd = np.random.default_rng(7)
    for _ in range(14):
        at = 0.25 + rnd.random() * 0.9
        f = 500 + rnd.random() * 900
        tt = np.clip(t - at, 0, None)
        bub += np.where(t >= at, np.sin(2 * np.pi * f * tt * (1 + 3 * tt)) * np.exp(-tt / 0.03), 0)
    x += bub * 0.18
    return fade(reverb(stereo(norm(x) * level, 0, 0.4), 0.8, 0.2), 0.002, 0.15)


def write_wav(path: str, x: np.ndarray):
    from scipy.io import wavfile
    wavfile.write(path, SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))
