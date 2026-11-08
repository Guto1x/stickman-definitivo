---
name: project-elevenlabs-pending
description: "No working ELEVENLABS_API_KEY when this copy was set up; run docs/ELEVENLABS_SETUP.md the first time one is added to .env, before any voice work"
metadata:
  type: project
---

This copy of the project was set up from `project instructions.md` without a working ElevenLabs API key. The user will add one to `.env` afterwards.

**Why:** voice-over (TTS) needs it. The house voice ids must be reachable from the account the key belongs to, and the credits/char rate (`CREDITS_PER_CHAR` in `tools/episode.mjs`) was only ever measured on the original project's account — it should be re-measured once a real key is in place, not assumed.

**How to apply:**
- In any session where `.env` has a working `ELEVENLABS_API_KEY`, run `docs/ELEVENLABS_SETUP.md` first, then replace this memory with a short "ElevenLabs connected" reference.
- Until then, take episodes up to the draft preview, then ask the user for a key.
- Related: [[project-narrator-voice]], [[project-fish-pending]].
