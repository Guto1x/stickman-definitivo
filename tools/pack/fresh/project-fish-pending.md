---
name: project-fish-pending
description: "Fish Audio MCP was NOT connected when this copy was set up; run docs/FISH_SETUP.md the first time Fish tools appear, before any fish-mode thumbnail work"
metadata:
  type: project
---

This copy of the project was set up from `project instructions.md` without the Fish Audio MCP. Fish is used only for `fish`-mode thumbnail image generation — voice uses ElevenLabs instead (see [[project-elevenlabs-pending]]) and is unaffected by this.

**Why:** `fish`-mode thumbnails need Fish, and the thumbnail reference keys in `thumbnails/refs/refs.json` came from another Fish workspace, so they must be uploaded again.

**How to apply:**
- In any session where Fish tools are available (`get_credit_balance`, `get_media_model`, …), and the thumbnail mode is `fish`, run `docs/FISH_SETUP.md` first, then replace this memory with a short "Fish connected" reference.
- If the thumbnail mode is `chatgpt`, this memory doesn't block anything — leave it until the user switches modes or asks.
- Related: [[project-thumbnails-gpt-image]].
