---
name: project-narrator-voice
description: "ElevenLabs PT-BR voices — narrator Matheus 36rVQA1AOIPwpA3Hg1tC always animated ([excited]), hero João Pedro 7u8qsX4HQsSHJ0f8xsQZ always dynamic ([playful]) — both picked by ear 2026-11-09; Eduardo/Sofia for other characters; ~0.45 credits/char"
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

**Current voices (user's picks by ear, 2026-11-09 — supersede Yuri and the calm direction above):**
- **Narrator: Matheus — "Friendly and Energetic"** `36rVQA1AOIPwpA3Hg1tC`. Always in that animated, natural, enthusiastic tone — "tem que ser assim sempre pra reter". Base direction `[excited]`, stability 0.4 (both defaults in tools/episode.mjs). The sarcastic/malicious tags of [[feedback-tom-acido]] ride on top of that energy.
- **Hero: João Pedro — dynamic** `7u8qsX4HQsSHJ0f8xsQZ`, `who: "hero"`. Always that dynamic, playful tone (`[playful]` added automatically), except when the scene demands another — then the line starts with its own tag. First used for the shorts' 4th-wall break ([[feedback-cortes-shorts]]).
- Picked from an 11-sample audition (6 narrators, 5 heroes; 1905 chars → 869 credits ≈ 0.45 credits/char).

**How to apply:**
- Use Matheus for all narration with the `[excited]` base direction — plus sarcastic/malicious tags at chosen beats since 2026-11-08 (see [[feedback-tom-acido]]). (The old "don't go energetic" caution is retired: the user now wants the energetic tone.)
- Use the house male/female voices for character lines unless the user picks others.
- Don't swap voices or models without asking.
- Related: [[project-ifology-style-channel]], [[project-pt-br-adaptation]].
