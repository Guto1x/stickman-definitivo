---
name: project-formula-shorts-adotada
description: "2026-11-09 the user adopted parts of a viral-shorts script formula for long episodes, plus the \"bass magnet\" camera (cut on heavy SFX)"
metadata:
  node_type: memory
  type: project
  originSessionId: dcf204f0-052a-4ee9-a82d-af53fda4b0b3
  modified: 2026-11-09T21:50:07.309Z
---

On 2026-11-09 the user pasted a viral 3D-shorts script formula (third person, 5 blocks, 60–75 s) and asked to adopt what fits the long "E Se Você" episodes. Adopted:
- ≤ 15 words per sentence (hard cap); no two sentences in a row with the same opening (ladainha and the climax ×3 are exempt via `repeat: True`); "each sentence is a cut".
- Facts show the consequence BEFORE the concept (scene → fact → back to "você").
- A skeptic who doubts early and is silenced by the climax ("right person vs. a doubting world").
- Weak adjectives banned: incrível, fantástico, surpreendente.
- Camera: the "bass magnet": strong SFX (boom/farBoom/subdrop) pull or add a sub-cut onto their frame with a camera kick; medium hits (thud/crack/splash/debris) only pull a nearby cut; sub-cuts prefer sentence starts.
- Cut & close rules + more camera movement (same day, "isso agrega muito em reels"): sub-cut cycle PUNCH → ANGLE → CLOSE (face) → pull-out/crane; reaction faces pull a close; stronger default drift; a tight-beat guard (face toward lens, nobody in the sight line, else angle/wider). Written closes that hide the face are only warned by the audit, never overridden.
- Review checks bodies through objects (same day, after a head sank into a classroom desk in menu-corpo q10): audit `clip` + a review event per clip; head/chest errors from 2 cm. Finished episodes now carry clip errors that block a rebuild until fixed.

Rejected: third person (it breaks the second-person What-If format), the 5-block structure (that's for shorts; the 17 beats stay), and "a cut on EVERY bass" (bursts would strobe and break [[feedback-no-camera-snaps]]).

**Why:** the user wants to keep refining our own animation and writing instead of switching to another channel's visual style (they dropped that idea the same day).
**How to apply:** the rules live in docs/story/COLA_ROTEIRO.md ("Voz", "Fatos"), are checked by `episode.mjs check` (non-blocking style warnings), and the camera logic is in src/episode/scene.ts (beatsOf / magnetize). See [[project-ritmo-rapido]] and [[feedback-tom-acido]].
