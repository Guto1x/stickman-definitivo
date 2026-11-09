---
name: project-otimizacao
description: "Optimization plan docs/OTIMIZACAO.md — all phases done 2026-11-08; two things still to confirm on the next real episode"
metadata:
  node_type: memory
  type: project
  originSessionId: 37ab0cc5-5add-4480-ae42-47cb5751b23d
  modified: 2026-11-08T23:56:12.544Z
---

Every task in `docs/OTIMIZACAO.md` was done on 2026-11-08, with one git commit each. Before → after numbers are in its table.

Still to confirm on the next real episode:
- Parallel ElevenLabs voice works against the real API. It was tested only with an offline mock.
- Token cost of a round-2 review on the sonnet `revisor-verificacao` agent combined with `review.mjs --only`.

The user runs a second Claude account on a **separate PC** with a copy of the project. Git is how the two copies stay in sync.

**Why:** the user said token spend was "absurd". Reviewer rounds were the biggest cost.

**How to apply:** on the next episode, measure those two items and write the results into the OTIMIZACAO.md table. Related: [[feedback-review-and-fix-loop]].
