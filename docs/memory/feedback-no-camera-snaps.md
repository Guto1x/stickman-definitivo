---
name: feedback-no-camera-snaps
description: User hates "snaps" — a cut to the same set where the camera shifts only a few pixels, or bodies popping while talking; wants one continuous flowing view instead
metadata:
  node_type: memory
  type: feedback
  originSessionId: 02ad560f-9c9c-4dbc-a8d1-5ccfbd6dc36c
  modified: 2026-10-28T01:36:55.309Z
---

The user doesn't want "snaps". They define a snap as a cut where the next shot is in the same environment and the camera jumps to a slightly different spot, "a few pixels over". They said it looks low quality and want one coherent, flowing view instead. Bodies jerking while someone talks count as snaps too.

Clearly different camera views are still fine.

**Why:** the user said this on 2026-10-27 and clarified it mid-task.

**How to apply:**
- Never cut between near-identical framings. The engine auto-flows them (same set, <14% shift, <20°), and `cut: "cut"` on such a pair is an audit error.
- Make real cuts with a clear angle change (≥30°) or a different shot size.
- Keep camera moves smooth. The audit warns at >12% position step or >4.5° of turn per frame.
- Keep talking, idle motion and gait starts blended.

Related: [[feedback-review-and-fix-loop]].
