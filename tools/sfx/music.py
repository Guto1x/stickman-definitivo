"""Procedural underscore beds (numpy only). Each mood renders one seamless 8-bar loop with
vectorised additive instruments, then `bed(mood, seconds)` tiles it to any length.
Moods: curious (playful pluck, IFOLOGY-style default), wonder, tension, action, sad.
These sit ~17 dB under the narration and duck further while the voice speaks.
"""
from __future__ import annotations

import numpy as np

import sfxlib as S

SR = S.SR


def mtof(m):
    return 440.0 * 2 ** ((np.asarray(m, dtype=float) - 69) / 12)


def note_pluck(f: float, dur: float, bright: float = 1.0) -> np.ndarray:
    """Plucked string / marimba-ish tone: harmonics with faster decay up the series."""
    t = S.t_axis(dur)
    x = np.zeros_like(t)
    for h in range(1, 7):
        x += (0.6 ** (h - 1)) * bright ** (h - 1) * np.sin(2 * np.pi * f * h * t) * np.exp(-t * (3.5 + 2.2 * h))
    x *= np.clip(t / 0.003, 0, 1)
    return x


def note_bell(f: float, dur: float) -> np.ndarray:
    t = S.t_axis(dur)
    x = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d) for r, a, d in ((1, 1, 1.6), (2.76, 0.4, 2.8), (5.4, 0.2, 4.5), (8.9, 0.08, 7)))
    return x * np.clip(t / 0.002, 0, 1)


def note_piano(f: float, dur: float) -> np.ndarray:
    t = S.t_axis(dur)
    x = sum((0.55 ** (h - 1)) * np.sin(2 * np.pi * f * h * t * (1 + 0.0004 * h * h)) * np.exp(-t * (1.2 + 0.9 * h)) for h in range(1, 8))
    return x * np.clip(t / 0.004, 0, 1)


def pad(freqs, dur: float, cutoff: float = 1100, attack: float = 0.6) -> np.ndarray:
    t = S.t_axis(dur)
    x = np.zeros_like(t)
    for f in freqs:
        for det in (-0.004, 0.0, 0.0045):
            x += S.osc(f * (1 + det), dur, 'saw')
    x = S.lp(x / (3 * len(freqs)), cutoff, 2)
    env = np.clip(t / attack, 0, 1) * np.clip((dur - t) / 0.4, 0, 1)
    return x * env


def bass_note(f: float, dur: float, kind: str = 'sine') -> np.ndarray:
    t = S.t_axis(dur)
    if kind == 'saw':
        x = S.lp(S.osc(f, dur, 'saw'), 650, 2)
    else:
        x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t)
    return x * np.clip(t / 0.005, 0, 1) * np.clip((dur - t) / 0.05, 0, 1) * np.exp(-t * 1.5)


def kick(level=1.0):
    d = 0.35
    t = S.t_axis(d)
    return (np.sin(2 * np.pi * np.cumsum(S.glide(120, 45, d)) / SR) * np.exp(-t / 0.09)) * level


def snare(level=1.0):
    d = 0.25
    t = S.t_axis(d)
    return (S.bp(S.white(d), 1200, 7000) * np.exp(-t / 0.05) * 0.8 + np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.04) * 0.5) * level


def hat(level=1.0, open_=False):
    d = 0.18 if open_ else 0.05
    t = S.t_axis(d)
    return S.hp(S.white(d), 7000) * np.exp(-t / (0.06 if open_ else 0.015)) * level


def shaker(level=1.0):
    d = 0.08
    t = S.t_axis(d)
    return S.bp(S.white(d), 4000, 12000) * np.sin(np.pi * t / d) ** 2 * level


class Track:
    def __init__(self, bars: int, bpm: float, beats_per_bar: int = 4):
        self.beat = 60.0 / bpm
        self.len = bars * beats_per_bar * self.beat
        self.buf = np.zeros((int(self.len * SR) + SR, 2))

    def add(self, beat_pos: float, x: np.ndarray, gain: float = 1.0, pan: float = 0.0):
        st = S.stereo(x * gain, pan)
        i = int(beat_pos * self.beat * SR)
        m = min(len(st), len(self.buf) - i)
        self.buf[i: i + m] += st[:m]

    def loop(self) -> np.ndarray:
        n = int(self.len * SR)
        out = self.buf[:n].copy()
        tail = self.buf[n:]
        out[: len(tail)] += tail  # wrap ringing tails to the start: seamless loop
        return out


def chords_for(mood):
    # (root midi, chord intervals) per bar for 8 bars
    if mood == 'curious':
        prog = [(53, (0, 4, 7)), (50, (0, 3, 7)), (46, (0, 4, 7)), (48, (0, 4, 7))]  # F Dm Bb C
    elif mood == 'wonder':
        prog = [(50, (0, 4, 7, 11)), (52, (0, 4, 7)), (47, (0, 3, 7)), (43, (0, 4, 7, 11))]  # Dmaj7 E Bm Gmaj7
    elif mood == 'tension':
        prog = [(45, (0, 3, 7)), (41, (0, 4, 7)), (50, (0, 3, 7)), (40, (0, 4, 7))]  # Am F Dm E
    elif mood == 'action':
        prog = [(50, (0, 3, 7)), (46, (0, 4, 7)), (48, (0, 4, 7)), (45, (0, 4, 7))]  # Dm Bb C A
    else:  # sad
        prog = [(48, (0, 3, 7)), (44, (0, 4, 7)), (51, (0, 4, 7)), (46, (0, 4, 7))]  # Cm Ab Eb Bb
    return prog * 2


def render_loop(mood: str) -> np.ndarray:
    S.seed(1000 + len(mood))
    bpm = {'curious': 104, 'wonder': 76, 'tension': 92, 'action': 128, 'sad': 68}[mood]
    tr = Track(8, bpm)
    prog = chords_for(mood)
    b = tr.beat
    for bar, (root, iv) in enumerate(prog):
        p0 = bar * 4
        notes = [root + i for i in iv]
        if mood == 'curious':
            tr.add(p0, pad(mtof([n + 12 for n in notes]), 4 * b, 900), 0.18)
            arp = [notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[0] + 24, notes[2] + 12, notes[1] + 12, notes[0] + 12, notes[1] + 24]
            for k, m in enumerate(arp):
                tr.add(p0 + k * 0.5, note_pluck(float(mtof(m)), 0.6, 0.8), 0.32, pan=-0.25 + 0.5 * (k % 2))
            for q in range(4):
                tr.add(p0 + q, bass_note(float(mtof(root - 12)), b * 0.9), 0.5)
                tr.add(p0 + q + 0.5, shaker(), 0.12, 0.3)
                tr.add(p0 + q + 0.75, shaker(), 0.07, 0.3)
            tr.add(p0, kick(0.5), 1.0)
            tr.add(p0 + 2, kick(0.4), 1.0)
        elif mood == 'wonder':
            tr.add(p0, pad(mtof(notes + [notes[0] + 12]), 4 * b + 0.3, 1400, 1.2), 0.3)
            for k in range(4):
                m = notes[(k * 2) % len(notes)] + 24
                tr.add(p0 + k + (0.5 if k % 2 else 0), note_bell(float(mtof(m)), 2.0), 0.18, pan=-0.4 + 0.27 * k)
            tr.add(p0, bass_note(float(mtof(root - 12)), 4 * b), 0.3)
        elif mood == 'tension':
            tr.add(p0, pad(mtof([notes[0] + 12, notes[0] + 13, notes[2] + 12]), 4 * b, 700, 1.0), 0.16)
            for e in range(8):
                tr.add(p0 + e * 0.5, bass_note(float(mtof(root - 12)), b * 0.45, 'saw'), 0.45)
                tr.add(p0 + e * 0.5, hat(0.6), 0.1, 0.4)
            tr.add(p0, kick(0.7), 1.0)
            tr.add(p0 + 0.75, kick(0.4), 1.0)
        elif mood == 'action':
            tr.add(p0, pad(mtof([n + 12 for n in notes]), 4 * b, 1600, 0.05), 0.2)
            for e in range(8):
                tr.add(p0 + e * 0.5, bass_note(float(mtof(root - 12)), b * 0.48, 'saw'), 0.55)
                tr.add(p0 + e * 0.5 + 0.25, hat(0.8), 0.14, 0.3)
            for q in range(4):
                tr.add(p0 + q, kick(1.0), 0.9)
            tr.add(p0 + 1, snare(), 0.45)
            tr.add(p0 + 3, snare(), 0.45)
            if bar % 2 == 0:
                for n in notes:
                    tr.add(p0, note_pluck(float(mtof(n + 12)), 0.4, 1.2), 0.18)
        else:  # sad
            tr.add(p0, pad(mtof([n + 12 for n in notes]), 4 * b, 800, 1.5), 0.15)
            for k, m in enumerate([notes[0], notes[1] + 12, notes[2] + 12, notes[1] + 12]):
                tr.add(p0 + k, note_piano(float(mtof(m + 12)), 2.5), 0.3)
            tr.add(p0, note_piano(float(mtof(root - 12)), 4 * b), 0.35)
    x = tr.loop()
    x = S.reverb(x, decay=1.4, mix=0.18, damp=5000)
    return S.norm(x, 0.8)


_cache: dict[str, np.ndarray] = {}


def bed(mood: str, seconds: float) -> np.ndarray:
    if mood == 'none':
        return np.zeros((int(seconds * SR), 2))
    if mood not in _cache:
        _cache[mood] = render_loop(mood)
    loop = _cache[mood]
    reps = int(np.ceil(seconds * SR / len(loop))) + 1
    return np.tile(loop, (reps, 1))[: int(seconds * SR)]
