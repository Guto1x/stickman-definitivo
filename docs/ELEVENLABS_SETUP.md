# ElevenLabs: first-connect checklist

Voice (narration + character lines) uses the ElevenLabs API, called directly with `fetch` from `tools/episode.mjs` — no MCP. Run this checklist once, the first time a copy of this project has no working `ELEVENLABS_API_KEY`.

Until the key is working, everything except real voice-over works: ideas, scripts, shot lists, `draft` previews, short shots with Python sound, audits, reviews and preview renders. If the user asks for a finished episode before the key works, go up to the preview (CLAUDE.md long-form step 4), then ask them for a key.

## Steps

1. **Get a key.** Ask the user for their ElevenLabs API key (elevenlabs.io/app/settings/api-keys → Create API Key). Save it to `.env` at the project root as `ELEVENLABS_API_KEY=...` (the `.env` file is gitignored — never commit it or print it back in full).

2. **Smoke test.** `GET https://api.elevenlabs.io/v1/voices` (header `xi-api-key: <key>`) must return 200. If it 401s, the key is wrong; if it 403s with `missing_permissions`, the key is scoped — note which permissions are missing (voices/TTS access is enough to run the pipeline; `user_read` is only needed for an automatic balance check, see step 5).

3. **Pick house voices.** `tools/episode.mjs`'s `HOUSE_VOICES` needs a narrator, a male and a female voice. The account's own saved voices (`/v1/voices`) may not have what's needed in the target language — search the full public library instead:
   - `GET /v1/shared-voices?language=<lang>&use_cases=narrative_story` for narrator candidates (calm/warm, not "excited" or "upbeat" — the house style is unhurried).
   - `GET /v1/shared-voices?language=<lang>&gender=male` / `&gender=female` for the secondary voices (young, casual/natural).
   - Pull 3–4 candidates per role, fetch each one's `preview_url`, and let the user pick by ear — don't choose a voice the user hasn't heard.
   - A public-library voice_id can be used directly in a TTS call without first "adding" it to the account.

4. **Measure the real cost before committing.** Credit cost per character varies by model and isn't published cleanly — measure it: call `POST /v1/text-to-speech/{voice_id}/with-timestamps` with a short (~15 s) test script in the target language and the chosen narrator voice and model (`eleven_v4` unless the user asks otherwise), then diff `GET /v1/usage/character-stats?start_unix=<ms>&end_unix=<ms>&include_live_requests=true` before/after (its `usage.All` series updates within a few seconds). Report the measured credits/char to the user and update the `CREDITS_PER_CHAR` constant and the Voice section of `CLAUDE.md`.

5. **Balance checks.** `GET /v1/user/subscription` gives the real remaining balance, but needs the `user_read` permission. If the key doesn't have it, tell the user to check elevenlabs.io/app/subscription manually, or to create a key with that permission added, before any `/stickman` credit checkpoint.

6. **Finish.**
   - Update `HOUSE_VOICES` in `tools/episode.mjs`, the **Voice** section of `CLAUDE.md`, and `public/episodes/pipetest/episode.json` (`voice.id`) if it exists.
   - Replace any "ElevenLabs pending" memory with a short `reference` memory: "ElevenLabs connected `<date>`, narrator `<voice>`, measured `<rate>` credits/char." Update its line in `MEMORY.md`.
   - Tell the user what was checked, which voices were picked, and the measured cost.

## Costs to keep in mind

- Voice: credits/char varies by model — don't assume 1:1. See step 4 for how to measure it for real.
- Re-running `node tools/episode.mjs sections <slug>` is free; only `node tools/episode.mjs voice <slug>` spends credits, and only for sections that don't already have a `file`.
