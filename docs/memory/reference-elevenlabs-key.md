---
name: reference-elevenlabs-key
description: ELEVENLABS_API_KEY lives in D:\stickman-2\.env (gitignored); the key is scoped — no user_read (no auto balance check) or models_read
metadata:
  node_type: memory
  type: reference
  originSessionId: 37ab0cc5-5add-4480-ae42-47cb5751b23d
  modified: 2026-11-08T13:16:08.451Z
---

The ElevenLabs API key `tools/episode.mjs` uses lives in `D:\stickman-2\.env` as `ELEVENLABS_API_KEY=...`. That file is in `.gitignore` — never commit it, and never print the full key back in a message.

**Scope limits:** this key returns `missing_permissions` on `/v1/user/subscription` (no `user_read`) and `/v1/models` (no `models_read`). It works fine for `/v1/voices`, `/v1/shared-voices`, `/v1/text-to-speech/*`, and `/v1/usage/character-stats`. So:
- To check the real remaining credit balance, ask the user to look at elevenlabs.io/app/subscription, or to create/widen a key with `user_read`.
- To measure actual cost of a call, use `/v1/usage/character-stats?start_unix=<ms>&end_unix=<ms>&include_live_requests=true` and diff before/after — this works with the current key and is how the ~0.4 credits/char rate for eleven_v4 was measured (see [[project-narrator-voice]]).
