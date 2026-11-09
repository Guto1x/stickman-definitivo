---
name: project-thumbnails-gpt-image
description: "Thumbnails are 2D GPT Image 2.5 illustrations (Fish or manual ChatGPT mode), gray quarter-zip jacket, locked at 3 variants 2K medium, only when a video is ~finished"
metadata:
  node_type: memory
  type: project
  originSessionId: f27b5c8c-295f-4e62-bbc1-092e91872953
  modified: 2026-11-08T08:10:29.030Z
---

As of 2026-10-28 the user dropped 3D (Remotion `Thumbnail` still) thumbnails for GPT Image 2.5 illustrations made from their JSON template plus reference images. As of 2026-11-08 the mascot wears a GRAY quarter-zip jacket with a gold zip pull. The workflow is CLAUDE.md step 10; settings are in `thumbnails/config.json`.

The user set these rules (2026-10-28):
- Two modes must stay available: `fish` (Claude generates via the Fish MCP) and `chatgpt` (Claude hands over prompts + refs for the user to paste into ChatGPT). Mode is `chatgpt` (chosen at setup, 2026-11-08).
- Locked: 3 variants every time, 2K medium. Don't change unless asked.
- Only generate once a video is confirmed finished or ~90% sure to be finalized, never earlier.

**Why:** spend credits only on thumbnails that will ship; keep a free manual fallback.

**How to apply:** don't propose thumbnails mid-production; when an episode is near final, write the brief, run `node tools/thumb-prompt.mjs <slug>`, estimate and get the user's OK on credits, then `--pick` their choice. First episode: swap-pilot used variant B "SWAPPED." Related: [[project-ifology-style-channel]].
