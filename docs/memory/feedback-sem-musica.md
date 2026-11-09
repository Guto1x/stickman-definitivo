---
name: feedback-sem-musica
description: "Music and SFX come from the user (2026-11-09): a background track goes INTO the video, sent by the user before each episode; a user SFX pack replaces the synthesized sounds; menu-corpo stays music-free"
metadata:
  node_type: memory
  type: feedback
  originSessionId: dcf204f0-052a-4ee9-a82d-af53fda4b0b3
  modified: 2026-11-09T23:25:36.879Z
---

**Music (user, 2026-11-09, after the Vitinho reference analysis):** the background track goes into the video itself (long and shorts), low under the voice (~20 dB below), dropping out with the voice in the short sentence breaths. The user **sends the track before each episode** — the procedural music beds are "muito genéricas" and are not used any more. Ask for the track at the start of each episode if it hasn't arrived; put it in `public/music/<slug>/` and point the generator's `music=[('a1', 'music/<slug>/<file>.mp3')]` at it.

**SFX:** the user is leaving an SFX pack in the project before the next episode. It arrived on 2026-11-09 in `efeitos-sonoros/` and is mapped in `efeitos-sonoros/map.json` (event name → files; meme/anime/game excerpts flagged `copyright`, used only by name); mapped events use the pack, unmapped ones fall back to the synthesized sounds in `tools/sfx/sfxlib.py`.

**Why:** the generated music and synthesized SFX sound generic; the reference channel retains with a real music bed and well-made sound effects on every visual event.

**History:** menu-corpo (2026-11-09) was built with no music at all ("vou colocar no editor") — it stays as posted ([[project-refazer-episodios]]). Related: [[project-ifology-style-channel]].
