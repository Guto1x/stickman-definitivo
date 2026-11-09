---
name: project-otimizacao
description: "Optimization plan docs/OTIMIZACAO.md — all phases done 2026-11-08; both pending checks confirmed on menu-corpo (2026-11-09)"
metadata:
  type: project
---

Every task in `docs/OTIMIZACAO.md` was done on 2026-11-08, with one git commit each. Before → after numbers are in its table.

Both pending checks were confirmed on `menu-corpo` (2026-11-09), and the numbers are in OTIMIZACAO.md:
- Parallel ElevenLabs voice works against the real API: 49 sections in 104 s, no word-count diffs.
- Round 2 on the sonnet `revisor-verificacao` agent with `review.mjs --only` cost ≈ 88 k tokens, against ≈ 296 k for round 1 on the session model.

The user runs a second Claude account on a **separate PC** with a copy of the project. Git is how the two copies stay in sync.

**Why:** the user said token spend was "absurd". Reviewer rounds were the biggest cost.

**How to apply:** nothing pending. Round 1 moved to the sonnet `revisor-episodio` agent on 2026-11-09 ([[feedback-nao-reestruturar-claude-md]]). Related: [[feedback-review-and-fix-loop]].
