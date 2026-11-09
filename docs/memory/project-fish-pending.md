---
name: project-fish-pending
description: "Fish Audio MCP is NOT connected in this project; it is only needed for fish-mode thumbnail image generation (currently chatgpt mode), not voice — voice uses ElevenLabs directly, see project-narrator-voice"
metadata:
  node_type: memory
  type: project
  originSessionId: 37ab0cc5-5add-4480-ae42-47cb5751b23d
  modified: 2026-11-08T13:15:50.631Z
---

As of 2026-11-08, voice no longer depends on Fish Audio at all — it uses the ElevenLabs API directly (see [[project-narrator-voice]]). Fish Audio's only remaining role in this project is `fish`-mode thumbnail image generation, and the current thumbnail mode is `chatgpt` (`thumbnails/config.json`), which doesn't need Fish either.

**Why this memory still exists:** if the user ever asks to switch thumbnail mode to `fish`, or asks to set up Fish Audio, `docs/FISH_SETUP.md` has the checklist (model check, reference-image re-upload). There is no urgency otherwise.

**How to apply:**
- Don't tell the user Fish needs connecting for voice-over — that's wrong now; ElevenLabs already works.
- Only run `docs/FISH_SETUP.md` if the thumbnail mode is switched to `fish`, or the user explicitly asks.
- Related: [[project-narrator-voice]], [[project-thumbnails-gpt-image]].
