---
name: project-narrator-voice
description: "ElevenLabs voices for the stickman channel (PT-BR) — narrator Yuri u7N1p4OIOc6Fl7y72WE7 (eleven_v4) with a calm [calm] direction, plus house male Eduardo and female Sofia for other characters; measured ~0.4 credits/char"
metadata:
  node_type: memory
  type: project
  originSessionId: 37ab0cc5-5add-4480-ae42-47cb5751b23d
  modified: 2026-11-08T13:15:43.399Z
---

The channel narrator is the ElevenLabs voice **Yuri — "Natural Brazilian Narrator"**, id `u7N1p4OIOc6Fl7y72WE7`, on model **eleven_v4**. The user picked it on 2026-11-08 after listening to a 15 s PT-BR test clip (see [[project-pt-br-adaptation]] for why the project is in Portuguese at all).

This replaces the old Fish Audio narrator ("Warm Storyteller") entirely — voice no longer uses Fish or any MCP; `tools/episode.mjs` calls the ElevenLabs API directly with a key in `.env`.

- **Model:** eleven_v4. Measured cost on 2026-11-08: a 199-char test (Yuri) cost 80 credits → **~0.4 credits/char**, confirmed via `/v1/usage/character-stats` before/after. This is noticeably cheaper than Fish's old 1 credit/byte.
- **Direction:** `[calm]` — short delivery tags work better than a long descriptive phrase on eleven_v4 (per its own prompting best practices: punctuation/ellipses shape pacing more reliably). Final pacing is still set in post (ffmpeg tempo-match to `targetWpm`), same mechanism as before.
- **House secondary voices** (picked the same day, from ElevenLabs' public PT-BR voice library, by ear):
  - male: Eduardo — "Brazilian Portuguese" `H2bV051FngNxkuTNROyc`;
  - female: Sofia — "Natural & Expressive" `n2a9VtkZLl8j1FSXHsL7`.
- **No more multi-speaker calls.** ElevenLabs has no equivalent to Fish's `<|speaker:N|>` syntax, so `voice.mixSpeakers` is gone — every speaker change is always its own single-speaker call now.
- **Alignment is exact, not transcribed.** `align` reads ElevenLabs' own per-character timestamps for the text we sent — no Whisper, no ASR, no fuzzy word-matching. See [[feedback-no-camera-snaps]]'s sibling rule in CLAUDE.md's hard-won rules for why this matters (it was a real recurring bug source before).
- The account's API key is scoped: it can list voices, call TTS and read usage stats, but lacks `user_read` (no automatic balance check) and `models_read`. Check elevenlabs.io/app/subscription manually, or widen the key, if an automatic balance check is ever needed.

**How to apply:**
- Use the narrator voice for all narration, with the `[calm]` base direction — plus sarcastic/malicious tags at chosen beats since 2026-11-08 (see [[feedback-tom-acido]]). Don't go back to a more "energetic" direction without asking — the same lesson from the old Fish voice still applies: the user found hyper/quick pacing unpleasant.
- Use the house male/female voices for character lines unless the user picks others.
- Don't swap voices or models without asking.
- Related: [[project-ifology-style-channel]], [[project-pt-br-adaptation]].
