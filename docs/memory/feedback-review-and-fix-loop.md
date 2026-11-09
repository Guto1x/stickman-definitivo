---
name: feedback-review-and-fix-loop
description: User requires very high animation quality — numeric audit + independent reviewer BEFORE the final render, then review the render and fix before delivering
metadata:
  node_type: memory
  type: feedback
  originSessionId: 02ad560f-9c9c-4dbc-a8d1-5ccfbd6dc36c
  modified: 2026-10-28T01:36:49.909Z
---

After the first version of any animation, review it frame by frame and fix every mistake before delivering. The user asked for "very high quality", "no distortion and nothing looks bad", and final output in 1080p HD.

On 2026-10-27 the user found a swap bug that two of my reviews had missed: the swapped character stayed put and the two blended into each other. In response they asked for a stronger process: a numeric scene audit, engine self-tests, labelled event frames, and an **independent second reviewer that runs before the final render**.

**Why:**
- The user said this explicitly. Quality matters more than speed.
- My own reviews had confirmation bias, and thumbnail-sized frames hid the problem.

**How to apply:**
- Before the final render:
  - `npm test`;
  - `node tools/qa.cjs audit <slug>`, which must show 0 errors;
  - `node tools/review.mjs <slug>`;
  - a fresh reviewer subagent with `docs/review/REVIEWER_BRIEF.md`;
  - fix the must-fix and should-fix rows, then a round-2 verification.
- After the render:
  - look at the contact sheets and full-res crops at cuts and action peaks;
  - make 12-frame strips around fast moves;
  - check the audio with spectrogram and waveform images.
- Tell the user what was found and fixed, and anything deferred.

Related: [[project-ifology-style-channel]], [[feedback-no-camera-snaps]].
