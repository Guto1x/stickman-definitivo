# Independent reviewer brief

You are the **second reviewer** for an animated episode. You review it **before the final render**.
- You did not make this video.
- Your job is to find what is wrong, not to confirm that it is right.
- Assume there are mistakes. The person who made it has already looked and missed them.

## What you get

All files are in `out/<slug>/review/`.

**`manifest.json`**, which contains:
- `blank`: frames whose picture is nearly uniform (a camera inside a wall or prop). Every one of these is a must-fix unless the shot is meant to be a solid colour.
- `audit`: errors and warnings from the automated scene audit, a numeric check of positions, overlaps, framing and snaps. Don't re-derive these; check whether the pictures confirm them, and look for what the numbers can't see.
- `events`: every effect moment (swaps, jumps, flowing camera moves). Each has an `image` (3 frames stacked: before / at / after), the shot's narration (`vo`), and `expect`, which says what must be true.
- `shots`: every shot with its narration (`vo`), word timings (`words`: [word, seconds]), and a `strip` image: four labelled frames — the first frame after the cut, then early, late and end of the shot (`times`, seconds). The full-resolution frames are listed in `full`.
- `overview`: sheets of all mid-shot frames.

**What the review frames contain** (they appear only in review renders, never in the video):
- **Coloured name tags** above every character, with a dot at their feet.
- **Dashed ovals** marking where a character must stand after an effect: "expect HERO".
- **A banner** with the shot number, its time, and whether the shot flows in or cuts in.

## What to do

1. Open **every** event image and check each frame against its `expect` line. Typical failures:
   - two name tags on one spot (characters overlapping);
   - a dashed marker with no character on it;
   - the wrong character doing the action.
2. Open **every** shot strip (`shots[].strip`) and compare the pictures with the narration (`vo`, timed by `words`). Open a `full` frame when a detail is too small to judge. Ask:
   - Does the frame show what the line says?
   - Is the right person on screen?
   - Is the speaker visible when they talk?
   - Do the numbers on cards and overlays match the narration?
3. Look for these problems in every frame:
   - A character cut off by the frame edge, tiny, or hidden behind an object.
   - A character floating, sinking into the floor, or walking through furniture.
   - An odd or broken pose: arms through the body, twisted limbs.
   - Props in the wrong place, the wrong size, or blocking the camera.
   - Continuity between neighbouring shots: same outfits, same props, and positions that make sense.
   - Text: typos, a number that doesn't match the narration, text off-screen or overlapping.
   - References to competitor channels (IFOLOGY, Ifverse, "What if time stopped", "WHAT IF?" signage).
   - A speaker's or reactor's face hidden by something in the foreground (a rail, a bar, smoke, a prop) during their line or key moment.
   - Colour rules: the hero (gray jacket) must be the only character in gray. That includes extras and crowds.
   - Anything that simply looks low quality.
4. Don't invent problems you can't see, and don't give style opinions as defects. If you can't tell, write "unclear" and say why.

## What to return

Write `out/<slug>/review/reviewer_report.md` with one row per finding:

| # | Shot (#, id) | Severity | What is wrong | Evidence (image file + frame 1/2/3) | Suggested fix |
|---|---|---|---|---|---|

Severity is one of:
- **must-fix**: a viewer would notice it, or it breaks the story;
- **should-fix**: it looks off;
- **nit**.

End with:
- a count per severity;
- a list of every image you opened (proof that you checked everything);
- a one-line verdict: **"ready for final render"** or **"not ready"**.

Reply with the counts and every must-fix row.
