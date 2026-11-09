---
name: project-refazer-episodios
description: NEXT TASK (agreed 2026-11-08) — redo invasao-zumbi then quem-tem-crush in the new style: free visual pass first, then a targeted acid-tone rewrite shown before any voice credits
metadata:
  type: project
---

On 2026-11-08 the user agreed to remake both finished episodes in the new style. They asked to start in a fresh session (after /clear).

**Order:** invasao-zumbi first (shorter, 7.9k chars, its stakes already suit the acid tone), then quem-tem-crush (9.1k chars, the cutest story, so it needs more rewriting).

**Per episode:**
1. **Visual pass (0 credits, keeps the current voice).** In `tools/episodes/<slug>.py`:
   - add `ritmo='rapido'` (coverage sub-cuts + whip/zoom on set changes; `coverage='calm'` in the dilemma; `cut='smash'` by hand on reveals);
   - mark ≥ 4 self-contained ~90 s `clips` ([[feedback-cortes-shorts]]);
   - move key overlays and subjects into the 9:16 centre column (audit `vertical`).

   Then regenerate, `qa.cjs audit`, `review.mjs`, reviewer, build. The build writes `.srt` and `- cortes.txt`.
2. **Tone pass ([[feedback-tom-acido]]).** Rewrite only the lines that need it: narrator jabs, self-interested family, no hug or moral at the end. Show the user the script and the credit estimate before `voice`. Only changed sections are billed.

**Not built yet (do it during the zumbi):**
- a "palavra-destaque" overlay (the key word pops in on its `@word` cue, centre column);
- an audit warning when an important overlay (stopwatch/stat/label corner) sits outside the 9:16 centre column.

**Keep:** `/stickman` must still stop once before spending voice credits — the user said "não tire isso".

**Still waiting on the user:** which of the 5 sarcastic tags sounded good on Yuri (`out/lab/teste_tags_yuri.mp3`: sarcastic, mischievously, deadpan, darkly amused, menacing). Prune the cola/§6.10 list to those.
