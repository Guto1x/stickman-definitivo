# 3D Stickman Long: production system

Project memory (the user's preferences and decisions) lives in `C:\Users\G\.claude\projects\d--stickman-2\memory\`: read MEMORY.md and the files it links at the start of every session, and save new memories there.
`docs/memory/` is a copy of that memory inside the repo, so a git clone on another machine carries the user's decisions: if the memory folder this session names is empty or missing, copy `docs/memory/*` into it first and read it from there. **Whenever you save or change a memory, copy the file to `docs/memory/` too.** New machine setup: `docs/SETUP.md`.

This project makes IFOLOGY-style 3D stickman videos for the channel **Fora do Roteiro** (the user's call, 2026-11-09): our gray-jacket hero in a low-poly toon world. The channel logo is `public/brand/logo.png`: the hero's smug half-lidded face, gray quarter-zip with the gold zip pull, on purple with an orange/violet rim. The hero wears a gray quarter-zip jacket with a gold zip pull as of 2026-11-08 (the user's call; it was red). Keep gray off the supporting cast so he stands out.

**Scripts, shot-list `vo` text, overlays and thumbnail text are written in Portuguese (PT-BR)** as of 2026-11-08 (the user's call). Code, comments, field names, file paths and this file stay in English — only the generated content is PT-BR. `docs/story/STORY_BLUEPRINT.md`, `docs/story/IDEA_ENGINE.md` and `docs/research/script_analysis.md` are written in Portuguese for the same reason: they guide the content, not the engine.
- Built with **Remotion 4 + Three.js** (`@remotion/three`, React Three Fiber). Everything is drawn, animated and changed in code.
- Sound effects are synthesized in **Python** (`.venv`, numpy/scipy).
- Voice uses the **ElevenLabs API**, called directly (no MCP) with a key in `.env` (`ELEVENLABS_API_KEY`, gitignored). Thumbnail image generation can still use the Fish Audio MCP in `fish` mode (see `docs/pipeline/EPISODE.md` step 10) — that's a separate capability from voice and is unaffected by this.
- Read `docs/STYLE.md` before any visual work and `docs/story/COLA_ROTEIRO.md` before writing a script. Don't read `docs/story/STORY_BLUEPRINT.md` (~50k tokens) or `docs/research/script_analysis.md` (~15k) whole: the cola condenses both and points to the § to open when you need detail or examples.

## `/stickman <topic>`: one command, whole episode

`.claude/commands/stickman.md` runs the long-form pipeline (`docs/pipeline/EPISODE.md`) end to end for a topic, with the saved hero: script, shot list, one credit checkpoint, voice, review, build, then the 3 thumbnails, and sends the video and thumbnails. Its portable copy is `tools/pack/fresh/stickman.md`; edit both together (the local one adds a demo shortcut that must not ship).

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
- **Props in hand:** `hold: { R: 'pill' | 'phone' | 'cup' | 'book' | 'ball' | … }` (`src/sets/props.tsx`). `scaleR`/`scaleL` enlarges one about the palm (`hold: { R: 'flower', scaleR: 2 }`) when the narration points at it.
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
- **Bodies through furniture:** the audit's `clip` check tests bodies against `SetDef.solids` (indoor furniture recorded by `Batch`) and furniture props. A new indoor set declares `solids` (its `Batch` builders, plus `src/sets/solids.ts` stand-ins for JSX furniture) and marks bedding/cushions `soft: true`, or bodies pass through it unchecked.
- **Stops:** a run must brake into a stop (the stride shrinks over the last 0.3 s). Freezing the gait mid-stride leaves a foot in the air.
- **Swaps:** `ids[0]` is the swapper (it blinks). Both actors trade position and facing unless `keepPaths`. Merged keyframe tracks must be time-sorted (`track()` sorts them now), or injected blink keys override later faces.
- **Gaits replace the pose while moving.** A crouched hero riding a basket stood up under `glide`. Use `carried` for anyone being moved: riders, a seated flight.
- **Railings sit at face height.** A 1 m balcony rail crosses a crouched teen's or a child's eyes, and the crouch pose tilts the face down.
  - Film from slightly above (about 20° down), with the head lifted (`head: [-40, …]`).
  - Or film through the gap between two bars (bars every 0.214 m), under the top rail.
- **Hand props follow the wrist.** A tray or letter can end up edge-on, like a sign. Check them in a still, or swap to a clearer prop or pose.
- **No more ASR alignment (obsolete bug class, kept for history).** Voice used to be transcribed with Whisper after the fact, which split compounds ("dodge balls") and mis-heard numbers, pushing words out of alignment. Since 2026-11-08, `align` reads ElevenLabs' own per-character timestamps for the exact text we sent — there's nothing to transcribe or fuzzy-match, so this bug class can't recur. If `align` ever prints a word-count mismatch, that means the model actually said something different from the script (mispronunciation), not an alignment bug — fix the script text, not the alignment code.
- **Staging traps from `quem-tem-crush`** (a discarded test episode) (each cost a reviewer round):
  - **A partial pose resets the rest to standing.** On a seated actor, give the full seated pose, not just the changed arm.
  - **`sitFloor` sinks the feet ~0.4 m.** For the floor or a kerb, use `sit` on a `crate` (h 0.45) or `kneel`.
  - **A `smoke` prop near the lens reads as a rock.** Keep it far from the sight line; use small puffs (`size` ~0.25, `n` 60, `wind`).
  - **Additive glow vanishes in daylight, whatever its colour.** Use a solid `glow` or the `crush` badge.
  - **A flow needs the same props and actors in both shots.** Otherwise they vanish mid-move.
  - **`insert` on a hand fails the audit.** Use `close` with `focus: 'handR'` and a short `dist`.
  - **Two far-apart actors in one automatic framing give an empty frame.** Split the shot, or use an explicit camera.
  - **A speaker must face the camera.** `over: '<listener>'` fixes most dialogue shots.
- **Gray belongs to the hero.** Keep gray tops off cast, extras, crowds and team colours, including set palettes (`stadium.tsx`, the `kit.tsx` crowd, classroom shirts).

## Making a narrated episode (the long-form pipeline)

**Before any episode work** (`/stickman`, an idea, script, shot list, voice, review, build or thumbnail), read `docs/pipeline/EPISODE.md` in full. It holds the 10 steps, the shot-list fields, word cues, staging helpers, the review rounds, the build, thumbnails and the **Voice** settings (narrator, house voices, pacing, credits). Step numbers elsewhere ("step 7.4", "step 10") refer to that file.

## Portable copy

`node tools/pack/pack.mjs` writes `project instructions.md`. It is one file that rebuilds this system in an empty folder when the user types "start" in a fresh Claude Code chat.
- It carries the engine, tools, docs, data and memory, but no videos or episodes.
- During setup it asks about the hero's outfit, the narrator voice, the content language and the thumbnail mode.
- It installs without an ElevenLabs key and leaves `docs/ELEVENLABS_SETUP.md` to run once the user adds one to `.env`. Fish Audio (thumbnails only, `fish` mode) has its own `docs/FISH_SETUP.md`, unaffected by this.

Re-run the packer after changing the engine, tools or docs. The start procedure lives in `tools/pack/header.md`; the fresh-copy files live in `tools/pack/fresh/`.
