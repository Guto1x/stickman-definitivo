---
name: project-2-series-future
description: "Future idea (not started): 'Projeto 2' — a continuous 'Day N' series where the audience votes in YouTube comments on what happens next, reusing this project's engine but not its What-If script pipeline. Notes in futuro.md and projeto-2/"
metadata:
  node_type: memory
  type: project
  originSessionId: 37ab0cc5-5add-4480-ae42-47cb5751b23d
  modified: 2026-11-08T13:55:01.099Z
---

On 2026-11-08 the user described a second content format they want to build **later**, not now: a continuous series where each video is "Day N" of one ongoing story, ending with a few options for what happens next; the audience votes in YouTube comments, and the winning option becomes canon for "Day N+1".

They tried this concept before with other engines and it went badly (reason not detailed). They explicitly want to reuse this project's **engine** (Remotion + Three.js, the deterministic time-based rig — see the conversation about how the engine produces consistent frames) as the technical foundation, not its "What If" story pipeline (`STORY_BLUEPRINT.md` is for the current one-shot curiosity format only).

**Why this memory exists:** so a future session doesn't have to be told the idea again or rediscover that it's intentionally parked.

**Full requirements and detail live in `futuro.md` (project root) and `projeto-2/README.md`** — don't duplicate them here; read those files when this project is picked up. Short version of what the user flagged:
- continuous episodes (state/canon must carry across videos, not just within one);
- explicit worry about plot holes across a branching, voted-on story — needs a cross-episode canon ledger, not just the single-episode plant ledger the current blueprint has;
- a voting mechanic (options presented at episode end, YouTube comment votes decide canon) — who reads/tallies votes is still undecided;
- animation detail needs, not yet specified by the user — don't assume, ask when revisited;
- richer recurring-character identity (`CastMember` today is just outfit/color/height — no personality traits or non-outfit visual identity), since a recurring cast across dozens of episodes needs the audience to recognize characters by more than clothing color.

**How to apply:**
- Do not start implementing this unless the user explicitly asks to pick it up.
- When they do, read `futuro.md` and `projeto-2/README.md` first, then ask what's changed/clarified since 2026-11-08 before writing anything.
- Keep it in `projeto-2/` — don't fold it into the active "E Se" channel pipeline or its docs.
- Related: [[project-ifology-style-channel]], [[project-pt-br-adaptation]].
