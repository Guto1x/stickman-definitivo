---
name: project-ifology-style-channel
description: "Goal and key decisions for the 3D stickman longform channel (IFOLOGY-style hero, GRAY quarter-zip jacket since 2026-11-08, Remotion+Three engine, ElevenLabs voice, PT-BR content)"
metadata:
  node_type: memory
  type: project
  originSessionId: 02ad560f-9c9c-4dbc-a8d1-5ccfbd6dc36c
  modified: 2026-11-08T13:16:40.925Z
---

The user is building a faceless YouTube channel of 3D stickman "What If" videos. **The channel is called "Fora do Roteiro"** (user, 2026-11-09). Its logo is `public/brand/logo.png`: the hero's smug half-lidded face, gray quarter-zip with the gold zip pull, on purple with an orange/violet rim. They want it modelled on **IFOLOGY FILMS**, specifically its top videos "What IF You Were 10x Faster?" (y300HjYnHPw), "Stop Time" (YznR5NmI3bc) and "Shapeshift" (RxAhxw6Emec). Their main character must look like IFOLOGY's lead in their own colours. It was purple, then red (2026-10-28); on 2026-11-08, at setup of a fresh copy of the project, the user chose a **gray quarter-zip jacket with a gold zip pull** (nodding to a gold watch, which the engine has no accessory field for). Decided on 2026-10-26:
- They explicitly asked for **Remotion + a 3D drawing kit**, so everything is drawn and animated in code with Three.js and is free per video.
- Sound effects are synthesized in **Python**.
- The voice came from the **Fish Audio MCP** originally; on 2026-11-08 the user moved voice to the **ElevenLabs API** (called directly, no MCP) and asked for scripts/VO/overlays/thumbnails to be in **Portuguese (PT-BR)** — see [[project-narrator-voice]] and [[project-pt-br-adaptation]]. Fish Audio remains in use only for optional `fish`-mode thumbnail image generation.
- Fish's AI video models were rejected: too expensive for 10-min videos, since the balance was 250k credits.
- The first deliverable was a 4 s 1080p test: the hero takes a pill and runs 100x faster.

**Why:** they want a repeatable, low-cost system they can prompt from Claude Code to produce longform videos.
**How to apply:**
- Keep the IFOLOGY look: black sphere head with a cream crescent, tiny line-art face, toon low-poly suburb, heavy vignette.
- The hero's jacket is gray (`#8b8f98` in `src/cast.ts`), accent gold (`#c9a227`). Keep gray tops off the supporting cast so he stands out, and never describe an old outfit (red hoodie, purple hoodie) in narration.
- Finished videos go flat in `final/`, named by title, so the user can browse them in one folder; `thumbnails/` and `archive/` sit inside it.
- Final output is always 1080p.
- See [[feedback-review-and-fix-loop]].
