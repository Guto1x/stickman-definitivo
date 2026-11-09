---
name: project-pt-br-adaptation
description: "Generated content (scripts, VO text, overlays, thumbnails) and the content-facing docs (STORY_BLUEPRINT, IDEA_ENGINE, script_analysis) are in Portuguese (PT-BR) as of 2026-11-08; code, comments and CLAUDE.md stay in English"
metadata:
  node_type: memory
  type: project
  originSessionId: 37ab0cc5-5add-4480-ae42-47cb5751b23d
  modified: 2026-11-08T13:16:00.541Z
---

On 2026-11-08 the user asked to adapt the project to Portuguese. They chose the scope explicitly when asked: **content only**, not the whole codebase.

**Why:** the channel's audience/output is Portuguese-speaking; the engine, tooling and this file are infrastructure the user reads as a developer, where English is fine and changing it would be pure churn with no benefit.

**What's in Portuguese now:**
- shot-list `vo` text (the actual script), overlay text, thumbnail words;
- `docs/story/STORY_BLUEPRINT.md`, `docs/story/IDEA_ENGINE.md`, `docs/research/script_analysis.md` — these guide the content, so they're written in the content's language, including their example script lines (rewritten as a Brazilian scriptwriter would phrase that same beat, not translated word-for-word).

**What stays in English:** code, comments, JSON field names, file paths, command names, CLAUDE.md, and every other doc not listed above.

**How to apply:**
- Write new scripts/VO/overlays/thumbnails in Portuguese by default; don't ask each time.
- If the user asks for something to be in English (a one-off), that's a request for that piece only, not a scope change — check before assuming it's permanent.
- Related: [[project-narrator-voice]] (the ElevenLabs voices are PT-BR too, picked for this reason).
