# SFX pack (the user's sounds) — `efeitos-sonoros/`

Drop new files anywhere under this folder, then map them in `map.json`. Every mapped event uses the
pack (its variants rotate, so repeats don't sound copied); unmapped events fall back to the synthesized sounds
in `tools/sfx/sfxlib.py`. Peaks are normalised on load, so files can come at any level; `vol` sets the mix level.
Every sound also gets a visual on its frame (`src/episode/sfxVisual.ts`): add a new name there too.

```json
{
  "whoosh":   { "files": ["transicoes/whoosh1.wav", "transicoes/whoosh2.wav"], "vol": -9 },
  "pop":      { "files": ["ui/pop.wav"] }
}
```

`vol` is optional (dB). Entries with `"copyright": true` are excerpts of songs, anime or games (Content ID risk on YouTube): only used when a script names them.

## Event names the mixer plays (`tools/sfx/episode_audio.py`)

| Event | When it plays |
|---|---|
| `whoosh` | whip transitions |
| `whooshUp` | zoom transitions, burst reveals |
| `swoosh` | push transitions, objects flying in (`flyin`) |
| `impact` | smash cuts, flash cuts, the title hit |
| `card` | every 2D card coming in |
| `sparkle` | flashes, swaps, burst reveals |
| `pop` | a `word` highlight, emotes (default), things appearing |
| `ding` | highlight circles, stat numbers landing, music-note emotes |
| `ticks` | stat counters rolling |
| `clock` | time passing (`timewarp`) |
| `swell` | the reverse swell before the title |
| `click` | labels |
| `drip` | sweat / tears emotes |
| `boing` | question-mark emote |
| `sting` | exclamation emote |
| `puff` | anger emote |
| `spot` | a spotlight turning on |
| `swap`, `swapCharge` | the swap power |

Scripted cues in a shot's `sfx` (`boom`, `thud`, `crack`, `splash`, `heartbeat`, `subdrop`, …) can be mapped
by the same names, and new names can be added for the pack's own sounds (e.g. `"risada"`) and used in `sfx`.

## The pack's own names (use them in a shot's `sfx`)

`bonk`, `punch`, `shock`, `fah`, `awkward`, `nuke`, `angels`, `dream`, `photo`, `notify`, `fire`, `water`, `rumble`; copyright-risk: `door`, `eat`, `fall`, `teleport`, `villain`, `angry`, `sad`, `badass`.
