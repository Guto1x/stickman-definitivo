---
name: project-ritmo-rapido
description: House pacing since 2026-11-08 — sub-cuts (coverage), two-sided whip/zoom/smash transitions, 9:16-safe framing (shorts are rendered vertical since 2026-11-09)
metadata:
  type: project
---

On 2026-11-08 the user asked for livelier camera work and transitions, faster cuts ("manter a dopamina"), and 16:9 framing that also works cut down to 9:16. The 10 s test `final/Teste de Ritmo.mp4` (generator `tools/episodes/teste_ritmo.py`) got "agradou muito" → it became house style. (That test and its generator were deleted in the 2026-11-09 cleanup; invasao_zumbi.py's `estilo novo` block is now the reference.)

- Engine: `coverage: fast|calm|off` and `camera.beats` (sub-cuts on word starts, src/episode/scene.ts); `cut: whip|zoom|smash` play on both sides of the cut (ShotView.tsx) with automatic SFX; the audit's `vertical` warning flags a target outside the 9:16 centre column.
- Generators opt in with `episode(..., ritmo='rapido')` (`_modelo.py` does). invasao-zumbi was remade with it (`apply_ritmo`) on 2026-11-09.

**Why:** the episodes felt slow (~3.9 s/shot, mostly near-static `drift`, no transitions).

**How to apply:** new episodes use ritmo='rapido'; `calm` in the dilemma, `smash` by hand on reveals/punchlines. **Native vertical shorts since 2026-11-09** (the old "no native 9:16, cut by hand" rule is retired): 4 rendered 1080×1920 shorts per episode, see [[feedback-cortes-shorts]]. The 16:9 still keeps the subject and key text in the centre column (audit `vertical`), since the shorts reuse those cameras. Pairs with [[feedback-tom-acido]]; never cut between near-identical framings ([[feedback-no-camera-snaps]]).
