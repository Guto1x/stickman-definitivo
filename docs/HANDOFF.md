# Handoff — retention package (2026-11-09)

State of the work started on 2026-11-09, for the next session. Everything below is in the working tree
(**not committed yet** — commit only when the user asks). Memory files cover the *why*; this is the *where*.

## Done and verified

| Area | What | Where |
|---|---|---|
| Voices | Narrator **Matheus** (`[excited]` default, stability 0.4), hero **João Pedro** (`who: "hero"`, `[playful]` default) | `tools/episode.mjs` HOUSE_VOICES, `kit.py`; memory `project-narrator-voice` |
| Script rules | ≤ 15 words/sentence, no repeated openings, banned weak adjectives (non-blocking `check` warnings); consequence before concept; the skeptic who loses | `docs/story/COLA_ROTEIRO.md`, `tools/episode.mjs` styleWarnings |
| Camera | bass magnet, sentence-start sub-cuts, PUNCH→ANGLE→CLOSE cycle, reaction-face closes, tight-beat guard, wider drift | `src/episode/scene.ts`, `camsolve.ts` |
| Audit | `clip` (bodies through furniture), face-away closes, `shorts`, `beat` (> 2.5 s with nothing new), `sync` (sound with nothing visible) | `src/episode/audit.ts`, `collide.ts` |
| Shorts | 4 vertical 60 s shorts per episode, freeze + hero 4th-wall line, burned captions; `node tools/shorts.mjs plan|voice|audio|render <slug>` | `src/episode/Short.tsx`, `tools/shorts.mjs`, EPISODE.md step 8b |
| Beat effects | overlays `emote`, `circle`, `flyin`, `timewarp`, `spotlight`; `fx.burst`, `fx.focus`; cut `push`; stronger whip/zoom blur — all rendered and checked in stills | `src/overlays/Beats.tsx`, `src/engine/Burst.tsx`, `ShotView.tsx` |
| Sound → picture | every scripted sound gets an automatic visual (shake/flash/punch-in/emote/burst) | `src/episode/sfxVisual.ts`, `ShotView.tsx` |
| SFX pack | the user's 54 files mapped to 30 events; peaks normalised; meme/anime/game excerpts flagged `copyright` (used only by name) | `efeitos-sonoros/map.json` + `README.md`, `tools/sfx/episode_audio.py` |
| Audio pacing | narration pauses ≤ 0.22 s; music/ambience drop out in the sentence breath where a cut lands ("dry breaths") | `episode.mjs` processVoice, `episode_audio.py` |

## Not done / to check

1. **Menu-corpo test shorts** (`final/shorts/E Se Você Encontrasse…/1–4`) were re-rendered (wider vertical lens, quieter freeze air) but **not reviewed or sent** to the user. Their CTA line is captions only: the user said not to spend credits on it. They were rendered **before** the beat effects / sound-to-picture work.
2. **Not seen in a render yet:** the `push` transition, the stronger blur, and the sound-to-picture visuals (shake/flash/punch-in from `sfx`). The test that printed the `[sync]` warning didn't render frames. Check them on the first new episode.
3. **The SFX pack hasn't been listened to in context.** Levels in `map.json` are estimates. Do a mix pass on the first new episode and adjust `vol`.
4. **Music:** the user sends the track before each episode (`public/music/<slug>/`, `music=[('a1', 'music/<slug>/x.mp3')]`). Ask at the start if it hasn't arrived. Procedural beds are a fallback only.
5. **Packer not re-run** after the last changes: run `node tools/pack/pack.mjs` before committing.
6. `kit.py` has no helper functions for the new overlays; write them as plain dicts (`{'type': 'emote', 'actor': 'hero', 'kind': 'sweat', 'at': '@palavra'}`).

## For the next episode (`/stickman <tema>`)

- Ask for the **music track** first.
- Script per the cola: the new "Batida visual" and "Shorts" sections apply. Plan the 4 shorts in `episode(shorts=[...])`: the user's picks if they name moments, else the 4 strongest hooks.
- Put a beat (emote / circle / flyin / word / face change / burst / sub-cut) on every sentence. Every sound needs a visible event: use the pack's names (`bonk`, `shock`, `fah`, `punch`, `angels`…), which come with automatic visuals.
- Credit checkpoint = voice + 4 shorts CTA lines (~160 credits) + thumbnails.
- After the build: `node tools/shorts.mjs plan/voice/render <slug>`, review, send video + shorts + thumbnails.
- Posted episodes (menu-corpo, zumbi) are frozen. Never fix them for new rules.
