# 3D Stickman Long: production system

Project memory (the user's preferences and decisions) lives in `C:\Users\G\.claude\projects\d--stickman-2\memory\`: read MEMORY.md and the files it links at the start of every session, and save new memories there.

This project makes IFOLOGY-style 3D stickman videos: our gray-jacket hero in a low-poly toon world. The hero wears a gray quarter-zip jacket with a gold zip pull as of 2026-11-08 (the user's call; it was red). Keep gray off the supporting cast so he stands out.

**Scripts, shot-list `vo` text, overlays and thumbnail text are written in Portuguese (PT-BR)** as of 2026-11-08 (the user's call). Code, comments, field names, file paths and this file stay in English — only the generated content is PT-BR. `docs/story/STORY_BLUEPRINT.md`, `docs/story/IDEA_ENGINE.md` and `docs/research/script_analysis.md` are written in Portuguese for the same reason: they guide the content, not the engine.
- Built with **Remotion 4 + Three.js** (`@remotion/three`, React Three Fiber). Everything is drawn, animated and changed in code.
- Sound effects are synthesized in **Python** (`.venv`, numpy/scipy).
- Voice uses the **ElevenLabs API**, called directly (no MCP) with a key in `.env` (`ELEVENLABS_API_KEY`, gitignored). Thumbnail image generation can still use the Fish Audio MCP in `fish` mode (see step 10) — that's a separate capability from voice and is unaffected by this.
- Read `docs/STYLE.md` before any visual work and `docs/story/COLA_ROTEIRO.md` before writing a script. Don't read `docs/story/STORY_BLUEPRINT.md` (~50k tokens) or `docs/research/script_analysis.md` (~15k) whole: the cola condenses both and points to the § to open when you need detail or examples.

## `/stickman <topic>`: one command, whole episode

`.claude/commands/stickman.md` runs the long-form pipeline below end to end for a topic, with the saved hero: script, shot list, one credit checkpoint, voice, review, build, then the 3 thumbnails, and sends the video and thumbnails. Its portable copy is `tools/pack/fresh/stickman.md`; edit both together (the local one adds a demo shortcut that must not ship).

## When the user asks for a new shot or video

1. **Pin down the brief.** Get the premise, length and title. Long videos use the "What If" format (research §7 Template A). Pitch 3 titles if none is given.
2. **Write a shot plan.** Write a timing JSON next to the composition, like `src/demo/pillSprint.json`. It holds the shots (`[start, end]` in seconds) and named events. Animation and sound both read this file, so they never drift apart.
3. **Build the composition** in `src/demo/<Name>.tsx`. Use `PillSprint.tsx` as the reference implementation:
   - one `<Sequence>` per shot, each with its own `<Stage cam={...}>`;
   - actors evaluated with `evalActor(spec, CAST.hero, T, seed)`;
   - sets from `src/sets/`;
   - effects from `src/engine/fx.tsx`;
   - 2D overlays from `src/overlays/`;
   - `<Grade/>` last.

   Register it in `src/Root.tsx`.
4. **Write the sound design** in `tools/sfx/<slug>.py`. Copy `pill_sprint.py` and time every sound off the JSON events. Write the mix to `public/audio/<slug>_mix.wav`.
5. **Build:** `node tools/build.mjs <CompositionId> <slug> tools/sfx/<slug>.py`.
   - Output is `final/<slug>.mp4` (1920×1080, 30 fps, H.264 CRF 14, AAC 320k) plus `out/<slug>/sheet.png`.
   - A 4 s shot renders in about 15 s; the sound takes about 50 s.
6. **Review, then fix. Always.**
   - Look at the contact sheet, then at full-resolution frames or crops at every cut and action peak.
   - Make 12-frame strips (ffmpeg `trim`, then `tile`) around fast moves to check motion.
   - For audio, check `showspectrumpic`/`showwavespic` images: is every sound on its cue, and is the main hit the loudest?
   - Fix and re-render until nothing looks wrong, then send the final MP4 with SendUserFile.

Preview interactively with `npm run studio`. Render a look-dev still with `npx remotion still CharacterLab out/lab/x.png --props='{"view":"close"}'`; views are `close`, `full` and `three`.

## Engine cheat sheet

- **Units and axes:** metres, y up. An actor with `rot: 0` faces +z. Character left = +x. The sidewalk top is y = 0.1 in the suburb, and the hero usually stands at `[0, 0.1, -4.6]`.
- **Poses** (`src/engine/rig.ts`): about 45 named poses, or inline `Pose` objects:
  - arms `[fwd, out, twist, elbow]`, legs `[fwd, out, knee]`, `spine` and `head` `[bend/nod, side/turn, twist/tilt]`, plus `hipY` and `body`;
  - **IK:** `reachR: { to: 'mouth' | 'face' | 'chin' | 'chest' | 'heart' | 'temple' | 'hip' | 'pocket' | [x, y, z] }` puts the wrist on a landmark. Root-local points ignore head tilt, so keep head nods small while reaching the face.
- **Keyframes:** `poses: [{ t, pose, blend }]` and `faces: [{ t, face, blend }]`, in the same time base you pass to `evalActor`. Locomotion uses `path: [{ t, pos, gait }]`; gaits are walk, jog, run, sprint, `dash` (athletic sprint), sneak and float. For fake-speed shots, drive `gaitPose('dash', phase)` directly.
- **Faces:** `FACES` in rig.ts (`happy`, `shocked`, `determined`, …), or `Face` objects with `eyes` (0–1.45), `pupils`, `look`, `brow` (−1 angry … 1 worried), `mouth` (−1 … 1), `open`, `width`, `tears`, `sweat`, `blush`. Blinks are automatic.
- **Props in hand:** `hold: { R: 'pill' | 'phone' | 'cup' | 'book' | 'ball' | … }` (`src/sets/props.tsx`).
- **Cameras** (`src/engine/cam.ts`):
  - `camAt(keys, T)` with eases `inOut`, `out`, `snap`, `linear`;
  - `shake(cam, T, amp, freq, seed)` combined with `impulse(T, t0, tau)` for hits;
  - `project` and `pxPerMetre` for 2D overlays.
- **Look** (`src/engine/materials.ts`): `setRim(dirView, color)` sets the crescent per shot. `Lighting` takes a `PALETTES` entry (`afternoon` is the house default; there are also golden, dusk, night, interior, interiorNight and void). Lights are π-scaled with no tone mapping.
- **Effects:** `Glow`, `Sparks`, `DustBurst` (toon puffs), `Leaves`, `Shockwave` (ground ring plus air ring), `Trail` (light ribbon), `AirStreaks`, and ghosts via `<Stickman ghostOpacity ghostColor ghostOrder={20 + 2i}>`. 2D effects are `Crackles` (always pass `center`), `SpeedLines`, `Flash` and `StatCallout`.

## Hard-won rules

These are bugs we already hit. Don't reintroduce them.
- **Lathe winding:** LatheGeometry points must run bottom → top, or the faces point inward and you see the black outline hull.
- **Hoodie split:** the hoodie hem lives on the **hips** bone and the upper body on the **spine**. One rigid piece flares like a bell when he leans.
- **Ghosts** use a depth-only pass plus an `EqualDepth` colour pass:
  - stamp `renderOrder` on the **whole subtree** (three resets the sort group at every nested Group);
  - turn outlines off through `OutlineCtx`;
  - give each ghost its own order pair.
- **Ink colour:** keep the ink near pure black (`#020203`). Purple point lights otherwise tint the head navy.
- **Blending:** additive purple disappears over a bright daytime street. Use normal blending for coloured trails and additive only for white cores and glows.
- **Fast motion:** don't rely on temporal supersampling (it strobes). Use the layered blur. In launch frames, show full-extension strides only, or he reads as walking.
- **Never generate geometry inside render** without `memo()`. It leaks GPU memory over long renders.
- **Additive volumes tint ink.** An additive mesh between the lens and a character (the void-stage beam with the camera inside it) washes the black head navy. The void beam now fades when the camera enters it; any new glow volume needs the same guard.
- **Set RNG and negative seeds:** JS `%` keeps the sign. `rng()` in `src/sets/kit.tsx` normalises it now; without that, blocks at −x got undefined colours (white trees and houses).
- **Cameras behind walls:** a push-in or a camera "in front of" a character facing a wall can start inside or behind the wall and render a few blank frames that a mid-shot still never shows. Interior sets declare `room` now, so the engine pulls the camera back in and the audit warns. Give new interior sets a `room` too.
- **Stops:** a run must brake into a stop (the stride shrinks over the last 0.3 s). Freezing the gait mid-stride leaves a foot in the air.
- **Swaps:** `ids[0]` is the swapper (it blinks). Both actors trade position and facing unless `keepPaths`. Merged keyframe tracks must be time-sorted (`track()` sorts them now), or injected blink keys override later faces.
- **Gaits replace the pose while moving.** A crouched hero riding a basket stood up under `glide`. Use `carried` for anyone being moved: riders, a seated flight.
- **Railings sit at face height.** A 1 m balcony rail crosses a crouched teen's or a child's eyes, and the crouch pose tilts the face down.
  - Film from slightly above (about 20° down), with the head lifted (`head: [-40, …]`).
  - Or film through the gap between two bars (bars every 0.214 m), under the top rail.
- **Hand props follow the wrist.** A tray or letter can end up edge-on, like a sign. Check them in a still, or swap to a clearer prop or pose.
- **No more ASR alignment (obsolete bug class, kept for history).** Voice used to be transcribed with Whisper after the fact, which split compounds ("dodge balls") and mis-heard numbers, pushing words out of alignment. Since 2026-11-08, `align` reads ElevenLabs' own per-character timestamps for the exact text we sent — there's nothing to transcribe or fuzzy-match, so this bug class can't recur. If `align` ever prints a word-count mismatch, that means the model actually said something different from the script (mispronunciation), not an alignment bug — fix the script text, not the alignment code.
- **Gray belongs to the hero.** Keep gray tops off cast, extras, crowds and team colours, including set palettes (`stadium.tsx`, the `kit.tsx` crowd, classroom shirts).

## Making a narrated episode (the long-form pipeline)

All files live in `public/episodes/<slug>/`.

1. **Idea:** follow `docs/story/IDEA_ENGINE.md`. Generate candidates, check them with `python -I tools/ideas/novelty.py "<title>"`, score them, and pitch the top 3 to the user. Wait for their pick.
2. **Script:** follow `docs/story/COLA_ROTEIRO.md` (beat sheet, voice rules, checklist, scoring, condensed from `STORY_BLUEPRINT.md`); open the blueprint only at the § the cola names. Show the user the script, with its score, before spending voice credits. Once the shot list exists, `node tools/episode.mjs script <slug>` writes a readable `script.md` (speakers and timestamps). Keep the plant ledger, fact check and score in `script_notes.md`.
3. **Shot list:** write `episode.json` (schema in `src/types.ts`: `Episode`, `Shot3D`, `CardShot`). Rules:
   - one shot per 2.5–5 s of narration;
   - the `vo` text, read in order across shots, IS the script;
   - silent beats use `hold`, with no `vo`.
   - Fields:
     - `set` is a key from `src/sets` (`SETS`); positions can be mark names, like `"sidewalk"` or `"desk+0.5,0,0"`;
     - `camera` takes `{shot: xclose|close|medium|full|wide|establishing|insert, target, angle, height, move, over, dist}` (`dist` sets how far behind the `over` actor's shoulder the camera sits; default 0.85 m, so ~1.7 keeps the shoulder small);
     - explicit cameras: `{pos, look, fov, to?, moveAt?: [t0, t1], ease?}` runs one move inside a cued window; `{path: [{t, pos, look, fov?, ease?}]}` gives keyframes (pan with a mover, hold for the effect, follow again). `ease: "cruise"` is a steady pan with short ramps, the right choice for tracking someone;
     - `kind: "card"` shots use `src/cards` (`CARDS`; each entry's `description` and `example` show its fields). Any `"@word"` string inside a card spec is resolved to that word's time; `compare` takes an optional `middle` row, and each row has `at`;
     - `overlays` are `label`, `title`, `stat`, `stopwatch`, `bubble`, `caption`, `flash` and `news` (a "TRENDING" lower-third: `headline`, `ticker`, `tag`). A countdown that continues across cuts uses one `stopwatch` per shot with `persist: true` (no draw-in). Its `switchAt` and any overlay's `until` take word cues (`"@two"`);
     - `fx` takes `freeze`, `particles`, `grade`, `speedLines` and `shake`;
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
      - a camera outside the room walls. Interior sets declare `room`, and the engine pulls such a camera back in along its sight line, but the framing is then tighter than written.
   2. **Cheap pre-check first:** `node tools/sheet.mjs <slug>` tiles one still per key shot (opening, each new set, the hook; ~20 s) into `out/lab/<slug>_sheet.jpg`; or pass ids (`sheet.mjs <slug> c8,r6`). Look at it and fix the obvious (sunk or floating feet, empty frames, wrong set, unreadable text) before the full review; every fix here saves a reviewer round.

      Then `node tools/review.mjs <slug>` renders labelled review frames into `out/<slug>/review/`:
      - every event (swap, jump, flow) as before / at / after frames, with name tags and dashed "expect X" markers;
      - every shot as a strip of four frames: the first frame after the cut, then early, late and end;
      - blank-frame detection: a near-uniform picture, such as a camera inside a wall, is listed under `blank` in the manifest and printed;
      - a `manifest.json` that pairs each image with its narration, word timings and what must be true.
      Look at every event image yourself.
   3. Spawn an **independent reviewer** subagent (fresh context, `general-purpose`) told to follow `docs/review/REVIEWER_BRIEF.md` for `<slug>`. It writes `out/<slug>/review/reviewer_report.md` with must-fix / should-fix / nit rows and a verdict. Fix every must-fix and should-fix, or tell the user which ones you deferred and why.
   4. After the fixes, re-run step 1 and `node tools/review.mjs <slug> --only <ids of the shots you changed>` (only those shots and their events are re-rendered; the manifest's `only` lists them). If the voice was redone or shots were added/removed, it refuses: run the full `review.mjs`. Then a round-2 reviewer verifies each earlier row and checks only the changed shots (brief section "Verification rounds"; `review.mjs` archives old reports in `out/<slug>/review_history/`). Build only on "ready for final render".
8. **Build:** `node tools/build-episode.mjs <slug>` makes the soundtrack, renders and muxes. A full build refuses to start while the scene audit has errors.
   - The soundtrack has narration, music ducked under the voice, per-set ambience, automatic sound effects, and the scripted `sfx`.
   - Output is `final/<Episode title>.mp4` at −14 LUFS, plus `out/<slug>/sheet_N.png` (one frame per shot). All finished videos sit together in `final/`. A full build moves the previous cut to `final/archive/<slug>_<date>.mp4`. Thumbnails go in `final/thumbnails/`, and `final/README.md` lists every episode.
   - It renders about 2.5× real time: roughly 25 min for a 10-min episode.
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
- The default direction is `[calm]` — eleven_v4 reads short delivery tags best (see its prompting best practices: punctuation and ellipses shape pacing more reliably than a long descriptive phrase). Pace is still set in post, same as before.
- **Audio tags are standard practice, not just the default direction.** Write them inline in `vo`, at the exact beat a character reacts (`docs/story/STORY_BLUEPRINT.md` §6.9 has the full catalog and rules) — e.g. `"Ele esperou. [sighs] Nada aconteceu."` Tags stay in English even in a Portuguese line (that's the model's trained vocabulary); the pipeline already strips bracketed text before matching words to voice time, so `"@word"` cues keep working right through a tag.
- **House secondary voices** for other characters: `who: "male"` uses Eduardo "Brazilian Portuguese" `H2bV051FngNxkuTNROyc`, and `who: "female"` uses Sofia "Natural & Expressive" `n2a9VtkZLl8j1FSXHsL7`. For any other speaker, add it to `episode.voices` and use that key in `who`. Put the delivery in the line's `[direction]`, e.g. `[panicked dad, yelling]`.
- Every speaker change starts a new single-speaker section — ElevenLabs has no multi-speaker-call equivalent to Fish's old `<|speaker:N|>` syntax, so this is no longer optional (`voice.mixSpeakers` is gone).
- `voice` evens out each section of 12 or more words toward `voice.targetWpm` (default 175; swap-pilot uses 172), stretching only within `voice.tempoRange` (default `[0.9, 1.1]`). Use `voice.tempo` for a fixed value, and `node tools/episode.mjs pace <slug>` to re-pace without new ElevenLabs calls.
- A 10-min PT-BR script (~1500 words, ~9k chars) is about 3.6k credits at the measured rate — rough, not a bill; check the real balance at elevenlabs.io/app/subscription (the project's API key doesn't have `user_read`, so `tools/episode.mjs` can't query it directly).
- Don't use ElevenLabs' video/music generation for whole episodes — the procedural engine is free per video.

## Portable copy

`node tools/pack/pack.mjs` writes `project instructions.md`. It is one file that rebuilds this system in an empty folder when the user types "start" in a fresh Claude Code chat.
- It carries the engine, tools, docs, data and memory, but no videos or episodes.
- During setup it asks about the hero's outfit, the narrator voice, the content language and the thumbnail mode.
- It installs without an ElevenLabs key and leaves `docs/ELEVENLABS_SETUP.md` to run once the user adds one to `.env`. Fish Audio (thumbnails only, `fish` mode) has its own `docs/FISH_SETUP.md`, unaffected by this.

Re-run the packer after changing the engine, tools or docs. The start procedure lives in `tools/pack/header.md`; the fresh-copy files live in `tools/pack/fresh/`.
