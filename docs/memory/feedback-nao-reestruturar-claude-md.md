---
name: feedback-nao-reestruturar-claude-md
description: Don't split/shorten CLAUDE.md or re-model /stickman and the reviewer agents — user declined on 2026-11-08, waiting to see how the earlier optimizations perform
metadata:
  type: feedback
---

On 2026-11-08 the user turned down a /usage-driven proposal: split CLAUDE.md (29k chars) into docs/pipeline/EPISODE.md + docs/ENGINE.md, put the round-1 reviewer on a sonnet agent instead of `general-purpose`, and cut steps or switch the model in `/stickman`.

**Why:** they're afraid restructuring CLAUDE.md breaks the pipeline flow or loses important info, and want to see how the optimizations already made (docs/OTIMIZACAO.md, [[project-otimizacao]]) perform first.

**How to apply:** don't propose shortening or splitting CLAUDE.md again unless the user brings it up. Small, targeted edits to it are still fine when a task needs them. If usage comes up again, point back to this proposal instead of redoing it.
