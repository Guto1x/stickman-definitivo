---
name: project-ritmo-rapido
description: House pacing since 2026-11-08 — sub-cuts (coverage), two-sided whip/zoom/smash transitions, 9:16-safe framing; user loved the 10 s test (teste-ritmo)
metadata:
  type: project
---

On 2026-11-08 the user asked for livelier camera work and transitions, faster cuts ("manter a dopamina"), and 16:9 framing that also works cut down to 9:16. The 10 s test `final/Teste de Ritmo.mp4` (generator `tools/episodes/teste_ritmo.py`) got "agradou muito" → it became house style.

- Engine: `coverage: fast|calm|off` and `camera.beats` (sub-cuts on word starts, src/episode/scene.ts); `cut: whip|zoom|smash` play on both sides of the cut (ShotView.tsx) with automatic SFX; the audit's `vertical` warning flags a target outside the 9:16 centre column.
- Generators opt in with `episode(..., ritmo='rapido')` (`_modelo.py` does). Old episodes (quem-tem-crush, invasao-zumbi) stay unchanged on purpose.

**Why:** the episodes felt slow (~3.9 s/shot, mostly near-static `drift`, no transitions).

**How to apply:** new episodes use ritmo='rapido'; `calm` in the dilemma, `smash` by hand on reveals/punchlines. **No native 9:16 render** (user, 2026-11-08): they render 16:9 only and cut the shorts by hand in their own editor — cheaper and they keep control. So the 16:9 must stay crop-friendly: subject in the centre column (audit `vertical`), important text inside it too, and helpers that feed their manual edit (e.g. an .srt from the word timings, a hi-res re-render of a chosen range) instead of a shorts pipeline. Pairs with [[feedback-tom-acido]]; never cut between near-identical framings ([[feedback-no-camera-snaps]]).
