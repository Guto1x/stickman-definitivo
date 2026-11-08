# E Se Você Salvasse Sua Escola de Uma Invasão Zumbi?: thumbnails in ChatGPT

Make each variant in a **new** ChatGPT chat, so the earlier ones don't bleed in.

1. Attach the three reference images from `D:\stickman-2\thumbnails\refs`, in this order:
   1. `ref1_paused.webp` (PAUSED. close-up)
   2. `ref2_split_face.webp` (split face, mascot half only)
   3. `ref3_too_slow.webp` (TOO SLOW. action shot)
2. Paste the prompt for the variant: open its file below, select all, copy, paste. Or run `node tools/thumb-prompt.mjs invasao-zumbi --mode chatgpt --copy <id>` to put it on the clipboard.
3. Send. Download the image and save it as `thumbnails/invasao-zumbi/out/<id>_chatgpt.png`.
4. Repeat for every variant, then tell Claude which one to use.

| Variant | Text | Prompt file | Scene |
|---|---|---|---|
| A | APITA AGORA. | `chatgpt_A.txt` | Sunny school sports field at noon, bright blue sky, empty grey stands behind. The gray-jacket mascot stands big in the right half of the frame, low angle, cheeks puffed, blowing a bright orange referee whistle held to his mouth, eyes determined. Behind him on the left, a huge crowd of round-black-head zombie kids in colourful hoodies and tees shuffles toward him with arms stretched straight out in front, sleepy half-closed white line eyes, each wrapped in a soft lime-green glow. Small white sound-wave arcs burst from the whistle. Text block bottom-left: APITA (white) over AGORA. (yellow, larger). |
| B | ELES OUVEM. | `chatgpt_B.txt` | School cafeteria, long white tables, warm ceiling lights. The gray-jacket mascot crouches behind a green trash bin in the foreground right, big in frame, one black hand over his own mouth, wide shocked eyes with tiny pupils and a sweat drop, looking at the viewer. Just behind him, a line of round-black-head zombie kids in colourful clothes shuffles past with arms stretched out in front and sleepy half-closed eyes, each with a soft lime-green glow, one of them turning its head toward the bin. Text block bottom-left: ELES (white) over OUVEM. (yellow, larger). |
| C | 30 SEGUNDOS DE SOL. | `chatgpt_C.txt` | Extreme close-up of the gray-jacket mascot's head and shoulders filling the right two-thirds of the frame under a blazing noon sun with strong warm rim light, smug half-lidded eyes and a sly smirk toward the viewer, an orange referee whistle hanging from a cord around his neck. Behind him, slightly blurred, a sea of round-black-head kids on a green sports field, the nearer ones still glowing lime-green with arms out like sleepwalkers, the ones in full sunlight blinking awake and confused. A big glowing yellow sun icon sits in the top-left sky. Text block bottom-left: 30 SEGUNDOS (white) over DE SOL. (yellow, larger). |
