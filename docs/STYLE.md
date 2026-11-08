# House Style: 3D Stickman "What If" Films

This style is built from IFOLOGY FILMS, Ifverse Tales, Last Soul Origin, Monk Mode Films and Day One Films. Our main character is modelled on IFOLOGY's lead, with our own gray wardrobe.
- The full script and packaging research is in `research/script_analysis.md`.
- HD reference contact sheets are in `research/reference_frames/`. They come from the user's three top picks:
  - "What IF You Were 10x Faster?"
  - "What IF You Could Stop Time?"
  - "What IF You Could Shapeshift?"

## 1. What the reference channels do

| | IFOLOGY / Ifverse ("What If", longform) | Day One / Monk Mode (motivational) | Last Soul Origin |
|---|---|---|---|
| Medium | 3D, low-poly toon | 2D vector on black | 3D silhouette, soft light |
| Length | 7–24 min | 2.5–4 min | 3–5.5 min |
| Avg shot | 2.9–5.5 s (IFOLOGY "Stop Time": 2.9 s) | 11–26 s | ~5 s |
| Voice | 2nd person present, 180–190 wpm (IFOLOGY), ~110 wpm (Ifverse) | almost none: text cards plus an inner voice | dialogue captions |
| Top video | 4.5M (Ifverse, "Reaction Time 10x"), 813K (IFOLOGY, "10x Faster") | 5.1M ("DISCIPLINE") | 747K ("1 MINUTE") |

**Our lane:** the IFOLOGY/Ifverse "What If" format, 8–10 min, numbers in the title. This has the steadiest views and carries mid-roll ads. See the research doc §7 for the beat sheet and topics.

## 2. Character: the hero

The IFOLOGY lead's construction, in our own wardrobe: a gray quarter-zip jacket since 2026-11-08 (it was red, before that purple).
- **Head:** a big matte-black sphere (r 0.212 m) with a **crisp cream crescent** (`#f6e7c6`) on its upper-left silhouette edge, plus a thin black contour. No neck: the head sits on the hood.
- **Face:** tiny thin white line art in the lower-centre of the head.
  - Eyes are small vertical ovals, or ∩ arcs when happy or closed.
  - Brows appear only when emotional; the mouth is a thin curve.
  - When shocked, the eyes turn into white discs with pupils.
  - Never draw big cartoon features. The black head should dominate.
- **Body:** fitted quarter-zip jacket in gray `#8b8f98` with gold zip-pull trim `#c9a227`, no hood, a short chest zip, and a small stand-up collar. Charcoal pants `#2b2f3a`, off-white sneakers `#f4f1ea`. No other character wears gray.
- **Limbs:** thin black sticks with black mitten hands (with thumb). Two-band cel shading on the cloth, cream edge highlight, thin black inverted-hull outline.
- **Proportions:** about 1.8 m tall. Head diameter ≈ 1.25× jacket width. Legs are long and thin.
- **When powered:** the crescent turns lavender (`#d2b2ff`), the face lines glow purple, and you get a purple aura, sparks and crackles.

All of this is code in `src/engine/Stickman.tsx` and `src/cast.ts`. Change the wardrobe in `cast.ts`.

## 3. World

- **Low-poly suburb:** pastel two-storey houses with gable roofs, white trim and light-blue glass; green lawns; bumpy rounded hedges; round-blob trees; beige sidewalks with joints; blue-grey asphalt with a yellow dashed centre line and white edge lines.
- **Light:** bright late afternoon. The sky runs from blue to a pale horizon. Shadows are soft but clear, from one sun.
- **Shading:**
  - Environments use 3-band toon shading.
  - Characters use 2 bands plus the rim crescent.
  - No tone mapping, so the colours you type are the colours you get.
- **Grade:** a heavy IFOLOGY vignette and fine film grain (`src/overlays/Grade.tsx`).

## 4. Camera and editing

- **Lens:** fov 28–35 (no wide-angle distortion), mostly at eye or chest height. Use a low angle for hero and power moments, and an ECU for reactions.
- **Shot length:** cut every 2.5–5 s; action beats 0.5–1.5 s.
- **Motion:** every shot moves a little (push-in, drift, small shake). Use impulse shake on impacts.
- **Speed shots:** use a two-layer render.
  - The world goes on its own canvas with a strong horizontal blur.
  - The hero renders sharp on a transparent canvas, with real shadows from a `shadowMaterial` ground.
  - Anime speed lines sit between the two layers, with afterimages behind him.
- **Flashes:** short (0.1–0.2 s) white or purple flashes on surges and impacts only.

## 5. On-screen graphics

- **Stat callout** (IFOLOGY gold): a chunky serif number (Bree Serif) with a gold gradient and a dark purple drop-shadow, a gold underline, and a cream condensed label (Barlow Condensed 800). Numbers count up. See `src/overlays/Stat.tsx`.
- **Energy:** 2D lightning arcs that leave the silhouette outward (never across the face), plus 3D sparks and glow (`src/overlays/Energy.tsx`, `src/engine/fx.tsx`).
- **Later** (not built yet): IFOLOGY's navy "blueprint" explainer cards with white line-art and gold numbers, title cards, chapter labels.

## 6. Sound

Every sound is generated in Python (`tools/sfx/sfxlib.py`). No samples are used.
- **Layers:** ambience (air, distant traffic, birds), foley (cloth, clicks, gulp), power (reverse swell, heartbeat, sub drop, riser, crackle), impacts (boom, debris, leaves, distant sonic boom), speed (wind roar, footfalls, pass-by whooshes), and UI (ticks, chime).
- **Biggest hit:** the main action (the launch), not the setup.
- **Master:** about −14 dB RMS, peak −1 dBFS.
