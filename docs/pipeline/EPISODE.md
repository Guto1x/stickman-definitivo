# Episode pipeline (moved out of CLAUDE.md on 2026-11-09 to cut per-message tokens; text unchanged)

Read this whole file before any narrated-episode work (`/stickman`, a script, a shot list, voice, review, build or thumbnail). The engine cheat sheet and hard-won rules stay in `CLAUDE.md`.

## Making a narrated episode (the long-form pipeline)

All files live in `public/episodes/<slug>/`.

1. **Idea:** follow `docs/story/IDEA_ENGINE.md`. Generate candidates, check them with `python -I tools/ideas/novelty.py "<title>"`, score them, and pitch the top 3 to the user. Wait for their pick.
2. **Script:** follow `docs/story/COLA_ROTEIRO.md` (beat sheet, voice rules, checklist, scoring, condensed from `STORY_BLUEPRINT.md`); open the blueprint only at the § the cola names. Show the user the script, with its score, before spending voice credits. Once the shot list exists, `node tools/episode.mjs script <slug>` writes a readable `script.md` (speakers and timestamps). Keep the plant ledger, fact check and score in `script_notes.md`.
3. **Shot list:** write `episode.json` (schema in `src/types.ts`: `Episode`, `Shot3D`, `CardShot`) through a Python generator: copy `tools/episodes/_modelo.py` (the 17 beats, with helpers from `tools/episodes/kit.py`: `A`, `S`, `C`, `cam`, `walk`, `crush`, `ladainha` (one shot per list item, with its number as a `word` overlay plus SFX: the COLA "Ladainha" montage), `episode`, `load_timing`, `resolve_countdowns`, `write`) to `tools/episodes/<slug>.py` and run it with `.venv/Scripts/python -I`. Edit the .py, never the JSON. `invasao_zumbi.py` is the full example (an older generator with its own helpers; new ones should use the kit). Rules:
   - one shot per 2.5–5 s of narration;
   - the `vo` text, read in order across shots, IS the script;
   - silent beats use `hold`, with no `vo`.
   - Fields:
     - `set` is a key from `src/sets` (`SETS`); positions can be mark names, like `"sidewalk"` or `"desk+0.5,0,0"`;
     - `camera` takes `{shot: xclose|close|medium|full|wide|establishing|insert, target, angle, height, move, over, dist}` (`dist` sets how far behind the `over` actor's shoulder the camera sits; default 0.85 m, so ~1.7 keeps the shoulder small);
     - explicit cameras: `{pos, look, fov, to?, moveAt?: [t0, t1], ease?}` runs one move inside a cued window; `{path: [{t, pos, look, fov?, ease?}]}` gives keyframes (pan with a mover, hold for the effect, follow again). `ease: "cruise"` is a steady pan with short ramps, the right choice for tracking someone;
     - `kind: "card"` shots use `src/cards` (`CARDS`; each entry's `description` and `example` show its fields). Any `"@word"` string inside a card spec is resolved to that word's time; `compare` takes an optional `middle` row, and each row has `at`;
     - `overlays` are `label`, `title`, `stat`, `stopwatch`, `bubble`, `caption`, `flash`, `news` (a "TRENDING" lower-third: `headline`, `ticker`, `tag`; `safe: true` centres it in the 9:16 column) `menu` (the body-settings HUD from `menu-corpo`, `src/overlays/BodyMenu.tsx`: `rows` of `{label, value, from?, at?, warn?, dim?}` sliders 0–100 that animate `from`→`value` on their own cue, `title`, `alarm` red frame, `note` toast with `noteAt`, `y` top/mid/low/above; auto SFX: open blip, a tick per moving row, an alert on the toast; generator helper `M()` in `menu_corpo.py`) and `word` (palavra-destaque: `text` pops in big on its `at: "@word"`, centre column; `color` yellow/white/red, `y` low/top/mid). The episode `title` opens compact (small line + big line in 2 rows, inside the 540 px centre column) and glides into the one-line 16:9 layout after ~1.6 s (`compact`: seconds held; 0 = start wide), so the opening works in a vertical short. Put countdowns at `corner: "bc"` (bottom centre: in the column and off faces; `tc` covers heads and card titles); the audit warns on corner HUDs a vertical cut would lose. A countdown that continues across cuts uses one `stopwatch` per shot with `persist: true` (no draw-in). Its `switchAt` and any overlay's `until` take word cues (`"@two"`);
     - `fx` takes `freeze`, `particles`, `grade`, `speedLines` and `shake`;
     - `cut` takes `flow`, `cut`, `flash`, `dip` and the two-sided transitions `whip`, `zoom` and `smash` (end of the outgoing shot + start of this one, with automatic sound);
     - `coverage: fast | calm | off` splits one shot into automatic sub-cuts on word starts (punch-in, then new angles; explicit `pos`/`path` cameras punch in on their look point from ≥ 3.2 m and otherwise orbit ~28° around it; `over` cameras get none; set `coverage: 'off'` where a sub-cut crops the action or shows a nape); `camera.beats` places them by hand. **House pacing:** pass `ritmo='rapido'` to `episode()` in the generator (`_modelo.py` does): coverage `fast` everywhere it applies and whip/zoom on set changes. Use `calm` in the dilemma, `smash` by hand on reveals. the `estilo novo` block at the end of `invasao_zumbi.py` (`apply_ritmo`, hand-set `smash` cuts, `word` highlights, `clips`) is the reference;
     - `sfx` cues use the names in `tools/sfx/episode_audio.py` (LIB);
     - `music` holds mood cues per shot index: curious, wonder, tension, action, sad, none; or `{file}` for your own track.
   - **Word cues:** any effect time can be `"@word"`, `"@word#2"` or `"@word+0.2"` instead of seconds. That covers `fx.swap.t`, overlay `at`, `sfx[].t`, actor `poses[].t`, `faces[].t` and `path[].t`, prop `follow[].t` and `ignite`, `camera.moveAt` and `camera.path[].t`, and card spec values. Cues resolve against the aligned narration, so everything lands on the spoken word and survives re-voicing.
     - Fast repeats ("Blink. Blink.") now resolve to two distinct words with their own times (ElevenLabs' character alignment, not transcription) — `"@blink#2"` works. This used to need an offset workaround (`"@blink+0.75"`) back when alignment came from Whisper; not needed anymore.
     - Prefer cues over numbers everywhere: the audit warns about a numeric swap time.
   - **Power and staging helpers:**
     - `fx.swap {t, ids:[a,b], keepPaths?}`: blink-blink, the place trade, afterimages, a flash and a sound. With `keepPaths`, the actors' paths encode the jump (momentum gags).
     - `strafe: true` keeps an actor facing `rot` while moving (rolling backwards).
     - The `glide` gait is for riding (skateboard stance). `carried` moves an actor without touching their pose (a crouched hero in a ladder basket, a seated flight).
     - A prop with `follow: "dad"` or `[{t,id}]` rides under an actor (skateboards).
     - `park` with `variant: 1` is WINTER (snow lawn, frozen pond; marks `ice`, `shore`). The `iceHole` prop draws crack lines over the second before its `ignite` cue, then opens a dark water hole (`cracks: true` = cracks only); an actor at the same spot with pos y ≈ −0.8 reads as treading water. `dog` is a small wagging toon dog. SFX added: `menu`, `tick`, `alert`, `horn`, `crack` (ice), `splash`.
     - The `spot` prop is a flat glowing floor ring; `ignite: "@fire"` grows toon flames on it. `fire` is free-standing flames, `smoke` a billowing toon column (`h`, `size`, `wind`).
     - The `apartments` set is the fire set piece (burning 4th-floor balcony at the `balcony` mark). Park a `firetruck` at `truck`; a `basket` prop with `follow: "<rider>"` and `from: <pivot mark coords>` draws the ladder up to whoever rides it, so the rider's path drives the ladder.
     - Prop `path[].t` takes word cues too (moving cars, thrown balls).
     - Shot ids must be unique: edits by id hit the first match.
     - `contact: true` on an actor or prop lets it touch others (hugs, tackles) without an overlap error.
     - `who: "male" | "female"` voices a character line with the house secondary voices (see Voice).
   - **Flow vs cut (no snaps):** consecutive shots in the same set whose framings are nearly identical (subject moves <14% of the width, <20° angle change) are joined automatically into one continuous camera move, with the actors blended. Real angle changes stay cuts. `cut: "flow"` forces a flow; `cut: "cut"` on a near-identical framing is an audit error (a jump cut). Talking fades in and out, idle motion runs on a continuous clock, and runs ease in, so bodies don't pop between shots.
4. **Preview before buying voice:**
   - Run `node tools/episode.mjs draft <slug>` (timing estimated at 180 wpm).
   - Run the gates: `npm test` (engine self-tests) and `node tools/qa.cjs audit <slug>` (scene audit, about 3 s). Fix every error before going on.
   - Then run `npm run studio` and open the Episode composition with props `{"slug":"<slug>"}`.
   - Or render a range: `node tools/build-episode.mjs <slug> --from 0 --to 20 --no-audio`.
5. **Voice:**
   0. **Validate `vo` text before it can cost anything.** Run `node tools/episode.mjs check <slug>`. It's mechanical (unbalanced `[tags]`, unsupported SSML like `<break>`, raw digits that should be spelled out — STORY_BLUEPRINT.md §6.9/§6.4) and `voice` (step 2 below) refuses to call ElevenLabs while any of it fails, so this never silently eats credits. It does **not** judge tag placement, descriptiveness or voice-match — self-certify those against STORY_BLUEPRINT.md §9's checklist by eye before the credit checkpoint; that part needs a reader, not a regex.
   1. Run `node tools/episode.mjs sections <slug>`. It prints each section and its estimated credit cost (~0.4 credits/char on eleven_v4 — an estimate, not a bill) and a preview of any `check` problems.
   2. Run `node tools/episode.mjs voice <slug>`. It calls the ElevenLabs API directly (`text-to-speech/{voice}/with-timestamps`) for every section lacking audio, saves the raw mp3 and its per-character alignment, then trims/levels/paces it into `vo/sNN.wav`.
      - It runs 3 calls at once (`voice.parallel` in `episode.json`) and retries 429/5xx by itself.
      - It saves `sections.json` after every section. A failed call or a crash never re-bills audio already received: re-running `voice` calls only the sections still missing.
   3. Re-running `sections` keeps the audio for sections whose text didn't change. After a script edit, run `check` again before `voice <slug>` — only sections missing a `file` get a new (billed) call.
6. **Align:** `node tools/episode.mjs align <slug>` turns the saved per-character alignment into word times — no transcription involved, so it can't mis-hear a word (see "Hard-won rules").
   - Every cut lands 0.12 s before its shot's first word.
   - It warns on a word-count mismatch (script vs. voiced) — rare, means the model actually said something different from the script.
   - Check every shot fast with `node tools/stills.cjs <jobs.json>` (one still per shot, about 1 s each). Make the jobs file from `timing.json` (frame = (start + 0.6·dur)·30), then tile the stills with ffmpeg.
   - Re-run `node tools/qa.cjs audit <slug>`: cue times move with the real voice.
7. **Pre-render review (mandatory before the full build):**
   1. `node tools/qa.cjs audit <slug>` must show 0 errors. Read every warning; fix it, or accept it only when it is intended (say so in the final summary). The audit checks:
      - overlaps and the swap contract (both characters on the other's spot);
      - camera inside a head, target out of frame, and speakers off-screen;
      - a swapper off-screen during the blink, and action that happens off-screen before the character is ever seen;
      - grounding, camera snaps (position step or turn rate), pose snaps and teleports;
      - forced jump cuts, flow continuity, and unresolved word cues (cards included);
      - 9:16 safety (`vertical`): a camera target's head outside the centre column a vertical cut keeps;
      - a camera outside the room walls. Interior sets declare `room`, and the engine pulls such a camera back in along its sight line, but the framing is then tighter than written.
   2. **Cheap pre-check first:** `node tools/sheet.mjs <slug>` tiles one still per key shot (opening, each new set, the hook; ~20 s) into `out/lab/<slug>_sheet.jpg`; or pass ids (`sheet.mjs <slug> c8,r6`). Look at it and fix the obvious (sunk or floating feet, empty frames, wrong set, unreadable text) before the full review; every fix here saves a reviewer round.

      Then `node tools/review.mjs <slug>` renders labelled review frames into `out/<slug>/review/`:
      - every event (swap, jump, flow) as before / at / after frames, with name tags and dashed "expect X" markers;
      - every shot as a strip of four frames: the first frame after the cut, then early, late and end;
      - blank-frame detection: a near-uniform picture, such as a camera inside a wall, is listed under `blank` in the manifest and printed;
      - a `manifest.json` that pairs each image with its narration, word timings and what must be true.
      Look at every event image yourself.
   3. Spawn an **independent reviewer** subagent: the `revisor-episodio` agent (`.claude/agents/`, fresh context, pinned to sonnet / high effort since 2026-11-09 — round 1 on the session model cost ~296k tokens), told to follow `docs/review/REVIEWER_BRIEF.md` for `<slug>`. It writes `out/<slug>/review/reviewer_report.md` with must-fix / should-fix / nit rows and a verdict. Fix every must-fix and should-fix, or tell the user which ones you deferred and why.
   4. After the fixes, re-run step 1 and `node tools/review.mjs <slug> --only <ids of the shots you changed>` (only those shots and their events are re-rendered; the manifest's `only` lists them). If the voice was redone or shots were added/removed, it refuses: run the full `review.mjs`. Then a round-2 reviewer verifies each earlier row and checks only the changed shots: spawn the `revisor-verificacao` subagent (`.claude/agents/`, pinned to sonnet / medium effort — verification doesn't need the main model), naming the slug and the previous report (brief section "Verification rounds"; `review.mjs` archives old reports in `out/<slug>/review_history/`). Build only on "ready for final render".
8. **Build:** `node tools/build-episode.mjs <slug>` makes the soundtrack, renders and muxes. A full build refuses to start while the scene audit has errors. Watch it with `node tools/progress.mjs <slug> --watch` (step, bar, frames, Remotion's time-left estimate; the build writes `out/<slug>/progress.json`).
   - The soundtrack has narration, music ducked under the voice, per-set ambience, automatic sound effects, and the scripted `sfx`.
   - Output is `final/<Episode title>.mp4` at −14 LUFS, plus `out/<slug>/sheet_N.png` (one frame per shot). All finished videos sit together in `final/`. A full build moves the previous cut to `final/archive/<slug>_<date>.mp4`. Thumbnails go in `final/thumbnails/`, and `final/README.md` lists every episode.
   - Defaults: concurrency = CPU cores − 4 (8 here) and CRF 18. Both were measured: 21% faster than 4/14, the file is ~40% of the size, and there's no visible difference. Override with `--concurrency N` / `--crf N`. A 10-min episode took ~25 min at the old 4/14, so expect ~20 min now.
9. **Check the build**, per the loop above:
   - Look at every sheet: framing, occluders, the empty side of sets, overlays. Check loudness and that every swap strip still reads.
   - Listen for a leaked audio tag: ElevenLabs occasionally speaks a `[tag]`'s text instead of performing it (STORY_BLUEPRINT.md §6.9). If you hear one, rewrite that tag and re-voice just that section.
   - Fix `episode.json`, then re-render only the broken range with `--from/--to`.

10. **Thumbnail:** 2D illustrations from GPT Image 2.5, no longer the 3D `Thumbnail` still. The mascot wears a **gray quarter-zip jacket** in thumbnails.
   - **When:** only once the video is confirmed finished, or you're ~90% sure it's about to be finalized. Never earlier.
   - **Locked settings** live in `thumbnails/config.json`: always **3 variants**, Fish at **2K medium** (`gpt-image-2.5-flare`, 16:9, 1,601 credits each, 2048×1152). Don't change them unless the user asks. 1K is only 1088×608, below YouTube's 1280×720.
   - **Brief:** you pick the words (1–3, ALL CAPS, white setup line over a yellow payoff word) and one scene per variant. Write `thumbnails/<slug>/brief.json` (`topic`, `context`, `variants: [{id, text: [{text, color}], scene}]`; see `thumbnails/swap-pilot/brief.json`). The tool refuses a brief that doesn't have exactly 3 variants.
   - **Prompts:** `node tools/thumb-prompt.mjs <slug>` fills the user's JSON template (`thumbnails/prompt_template.json`). It adds the world rule (everyone else is a round-black-head stickman, no humans) and bans stray signs and lettering.
   - **Two modes**, set by `mode` in `thumbnails/config.json` (current: `chatgpt`), or one-off with `--mode`:
     - `fish`: the tool writes `prompt_<id>.txt` and `fish_jobs.json`. Estimate with `estimate_image_edit`, get the user's OK on credits, then submit each job with `generate_image_edit`: the prompt file's exact text, the job's `model_id` and `parameters`, and the `inputs` (the three references, in order). If a reference key has expired, re-upload it with `create_media_upload` and update `thumbnails/refs/refs.json`. Save each result to `thumbnails/<slug>/out/<id>_2k_medium.png`.
     - `chatgpt`: the tool writes `chatgpt_<id>.txt` (a one-line "make an image" ask plus the JSON) and `CHATGPT.md` (attach the three refs in order, paste, save as `out/<id>_chatgpt.png`). Send the user `CHATGPT.md` and the three prompt files with SendUserFile. `--copy <id>` puts one prompt on the clipboard.
   - **Review** every result at full size and at ~360 px wide: exact spelling, level text, gray jacket, stickman-only cast, no extra text. Send the three to the user to pick.
   - **Pick:** `node tools/thumb-prompt.mjs <slug> --pick <id>` writes `final/thumbnails/<slug>_thumbnail.jpg` (1920×1080, under YouTube's 2 MB limit) and records the choice in `brief.json`.

**Voice:** ElevenLabs, model **eleven_v4**, PT-BR. Narrator is Yuri — "Natural Brazilian Narrator" `u7N1p4OIOc6Fl7y72WE7` — which the user chose on 2026-11-08 after a measured 15 s test (199 chars → 80 credits, ~0.4 credits/char).
- The default direction is `[calm]` — eleven_v4 reads short delivery tags best (see its prompting best practices: punctuation and ellipses shape pacing more reliably than a long descriptive phrase). Pace is still set in post, same as before. The narrator is calm at the base but **sarcastic and a little malicious** at chosen beats (the user's call, 2026-11-08: no cute/family IFOLOGY tone) — see STORY_BLUEPRINT.md §6.10.
- **Audio tags are standard practice, not just the default direction.** Write them inline in `vo`, at the exact beat a character reacts (`docs/story/STORY_BLUEPRINT.md` §6.9 has the full catalog and rules) — e.g. `"Ele esperou. [sighs] Nada aconteceu."` Tags stay in English even in a Portuguese line (that's the model's trained vocabulary); the pipeline already strips bracketed text before matching words to voice time, so `"@word"` cues keep working right through a tag.
- **House secondary voices** for other characters: `who: "male"` uses Eduardo "Brazilian Portuguese" `H2bV051FngNxkuTNROyc`, and `who: "female"` uses Sofia "Natural & Expressive" `n2a9VtkZLl8j1FSXHsL7`. For any other speaker, add it to `episode.voices` and use that key in `who`. Put the delivery in the line's `[direction]`, e.g. `[panicked dad, yelling]`.
- Every speaker change starts a new single-speaker section — ElevenLabs has no multi-speaker-call equivalent to Fish's old `<|speaker:N|>` syntax, so this is no longer optional (`voice.mixSpeakers` is gone).
- `voice` evens out each section of 12 or more words toward `voice.targetWpm` (default 175; swap-pilot uses 172), stretching only within `voice.tempoRange` (default `[0.9, 1.1]`). Use `voice.tempo` for a fixed value, and `node tools/episode.mjs pace <slug>` to re-pace without new ElevenLabs calls.
- A 10-min PT-BR script (~1500 words, ~9k chars) is about 3.6k credits at the measured rate — rough, not a bill; check the real balance at elevenlabs.io/app/subscription (the project's API key doesn't have `user_read`, so `tools/episode.mjs` can't query it directly).
- Don't use ElevenLabs' video/music generation for whole episodes — the procedural engine is free per video.
