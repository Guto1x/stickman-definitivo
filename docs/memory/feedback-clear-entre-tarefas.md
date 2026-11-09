---
name: feedback-clear-entre-tarefas
description: Remind the user to run /clear when switching tasks (episode → engine → thumbnail); /usage flagged long uncleared sessions at 84% (2026-11-09)
metadata:
  type: feedback
---

The user asked (2026-11-09) to be reminded to `/clear` when they switch tasks, since /usage showed long sessions without clearing as a top cost.

**Why:** every message in a long session re-sends the whole history.

**How to apply:** when a task finishes and the user's next request is unrelated (new episode, engine change, thumbnails, tooling), add one short line suggesting `/clear` first. Not mid-task, and not more than once per switch. Related: [[feedback-nao-reestruturar-claude-md]].
