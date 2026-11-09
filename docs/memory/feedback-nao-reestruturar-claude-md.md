---
name: feedback-nao-reestruturar-claude-md
description: CLAUDE.md split DONE 2026-11-09 at the user's request — episode pipeline now in docs/pipeline/EPISODE.md, round-1 reviewer on sonnet agent revisor-episodio
metadata:
  type: feedback
---

On 2026-11-08 the user declined a /usage proposal (split CLAUDE.md, round-1 reviewer on sonnet). On 2026-11-09, after another /usage screen (general-purpose subagents 85%, no /clear 84%, CLAUDE.md 8k tokens/request), they asked for all three fixes:
- The "Making a narrated episode" + "Voice" block moved **verbatim** to `docs/pipeline/EPISODE.md`; CLAUDE.md keeps a pointer (32.4k → 12.9k chars, ~8k → ~3.2k tokens per message). Engine cheat sheet and hard-won rules stay in CLAUDE.md.
- Round 1 review runs on `.claude/agents/revisor-episodio.md` (sonnet, effort high) instead of `general-purpose` on the session model.

**Why:** usage was too high; their earlier fear was losing info or breaking the pipeline, so the text was moved unchanged, not rewritten.

**How to apply:** keep CLAUDE.md lean — new episode-pipeline detail goes in EPISODE.md, not CLAUDE.md. If round-1 reviews on sonnet start missing real problems, tell the user (fallback: `model: opus` in the agent file). Related: [[project-otimizacao]], [[feedback-clear-entre-tarefas]].
