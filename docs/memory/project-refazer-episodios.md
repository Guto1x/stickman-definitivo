---
name: project-refazer-episodios
description: Remake of old episodes is CLOSED (2026-11-09) — zumbi redone in the new style; quem-tem-crush discarded as a test; repo cleaned to zumbi only
metadata:
  type: project
---

On 2026-11-08 the user agreed to remake both finished episodes in the new style. On 2026-11-09 zumbi was finished: visual pass (`apply_ritmo`, clips, 9:16-safe; 2 review rounds), then tone pass (14 lines rewritten, ~1.7k credits, 10 sections re-voiced; 9:14), then the final build.

Then the user **discarded quem-tem-crush** ("foi um bom teste pra nós") and asked to clean out every leftover from other videos. Deleted: the crush and teste-ritmo episodes, generators, thumbnails, renders, the old zumbi cut in `final/archive/`, and `out/lab`. Kept as engine infrastructure: `pipetest` (the compositions' default fixture, shipped by the packer), the `swap-pilot` thumbnail brief (example format), and `PillSprint` (reference composition).

**Why:** start the next episodes from a clean repo where zumbi is the only real example.

**How to apply:** don't suggest remaking crush. Lesson to keep: a voice section spans many shots, so one changed line re-voices all of it. Show the user a full option and a lean credit option. Still deferred: card layouts are 16:9-wide (a 9:16 crop loses half); the user was offered a narrow card layout. `/stickman` must still stop once before spending voice credits (the user said "não tire isso").
