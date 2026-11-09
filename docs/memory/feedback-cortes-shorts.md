---
name: feedback-cortes-shorts
description: Every long (~10 min) episode must contain ≥ 4 self-contained ~90 s segments the user can cut by hand into YouTube Shorts / Reels / TikTok (user rule, 2026-11-08)
metadata:
  type: feedback
---

The user cuts shorts by hand from the 16:9 episode (no native vertical render, see [[project-ritmo-rapido]]) and requires every long episode to have **at least 4 scenes usable as ~90 s shorts**.

**Why:** each long video should also feed Shorts, Reels and TikTok without extra production.

**How to apply:** when writing the script and shot list, plan the 4 segments (COLA_ROTEIRO "Cortes para shorts"): each opens on a cold hook that needs no context, ends on a punch or cliffhanger, keeps subject and text in the centre column, and avoids two-column cards. Mark them in the generator with `episode(clips=[(title, first shot id, last shot id), ...])`; the audit warns under 4 clips or outside 60–95 s. The build writes `final/<title>.srt` (exact word times) and `final/<title> - cortes.txt` (timecodes) for the user's editor.
