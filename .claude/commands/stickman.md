---
description: Make a full "What If" stickman episode from a topic, then generate its 3 thumbnails
argument-hint: <video topic, e.g. What If You Could Swap Places With Anyone>
---

# /stickman: topic → finished video + 3 thumbnails

Topic: **$ARGUMENTS**

If the topic is empty, ask for one and stop.

Make one complete narrated episode about this topic with the saved hero, then generate its 3 thumbnails. Follow `CLAUDE.md` ("Making a narrated episode") step by step; this command only fixes the choices below. Keep a task list for the whole run.

## Fixed choices

- **Hero:** the saved character, the `hero` entry in `src/cast.ts`, exactly as it is. Don't change the outfit, and keep its signature colour off everyone else (CLAUDE.md, "… belongs to the hero").
- **Idea:** the topic replaces the idea step. Skip candidate generation and pitching. Shape it into a "What If" title (keep the user's wording when it already is one), run `python -I tools/ideas/novelty.py "<title>"`, and mention any close competitor title in the summary.
- **Slug:** short kebab-case from the title, not already used in `public/episodes/`.
- **Length:** 8–10 minutes unless the user's topic says otherwise.
- **Voice, music, look:** the house defaults in `CLAUDE.md` and memory.

## Run

1. **Script** (`docs/story/COLA_ROTEIRO.md`; open `STORY_BLUEPRINT.md` only at the § it names): beat sheet, script, plant ledger, fact check and score in `script_notes.md`.
2. **Shot list:** `episode.json`, generated from `tools/episodes/<slug>.py` (copy `_modelo.py`; helpers in `kit.py`), then `node tools/episode.mjs draft <slug>`, `npm test`, `node tools/qa.cjs audit <slug>` and `node tools/episode.mjs check <slug>` (vo text: tags, SSML, raw numbers — CLAUDE.md Voice step 5.0). Fix every error, then self-certify STORY_BLUEPRINT.md §9's "Tags de áudio e fala" group by eye — `check` is mechanical and won't catch a misplaced or mismatched tag.
3. **One checkpoint before spending credits.** Check the ElevenLabs credit balance (`GET /v1/user/subscription`; if the API key lacks `user_read`, ask the user to check elevenlabs.io/app/subscription or widen the key) and show the user, in one message:
   - the title and a short synopsis;
   - the script score and the path to `script.md`;
   - the credit estimate: voice (`node tools/episode.mjs sections <slug>` prints it, ~0.4 credits/char on eleven_v4 — see CLAUDE.md Voice) plus thumbnails (3 × the per-image cost in `thumbnails/config.json`, fish mode only).

   Wait for one OK. That OK covers the voice and the 3 thumbnails; don't ask again for either. If the balance is too low, say so and stop there.
4. **Voice, align, pre-render review:** CLAUDE.md steps 5–7, including the independent reviewer rounds. Build only on "ready for final render".
5. **Build and check:** steps 8–9. Re-render broken ranges until the sheets are clean.
6. **Thumbnails:** step 10, with the video now finished:
   - write `thumbnails/<slug>/brief.json` with exactly 3 variants (one scene per variant, drawn from the episode's strongest moments), then `node tools/thumb-prompt.mjs <slug>`;
   - `fish` mode: run `estimate_image_edit`, then submit all 3 jobs (already approved at the checkpoint), poll them together, and save each to `thumbnails/<slug>/out/<id>_2k_medium.png`. Review each at full size and at ~360 px; regenerate one only if it fails the step-10 checks (spelling, hero colour, stickman-only cast, no stray text), and only within the approved credits;
   - `chatgpt` mode: send `CHATGPT.md` and the three prompt files instead.
7. **Update `final/README.md`** with the new episode row.

## Deliver

Keep the final message short:
1. send the video, `final/<Episode title>.mp4`, with SendUserFile (`display: "render"`);
2. send the 3 thumbnails with SendUserFile in one call, captioned A / B / C with their text;
3. one or two lines: title, length, and any warning you accepted. Ask which thumbnail to pick (`node tools/thumb-prompt.mjs <slug> --pick <id>`).
