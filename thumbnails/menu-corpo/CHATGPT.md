# E Se Você Encontrasse um Menu de Configurações do Seu Corpo?: thumbnails in ChatGPT

Make each variant in a **new** ChatGPT chat, so the earlier ones don't bleed in.

1. Attach the three reference images from `D:\stickman-2\thumbnails\refs`, in this order:
   1. `ref1_paused.webp` (PAUSED. close-up)
   2. `ref2_split_face.webp` (split face, mascot half only)
   3. `ref3_too_slow.webp` (TOO SLOW. action shot)
2. Paste the prompt for the variant: open its file below, select all, copy, paste. Or run `node tools/thumb-prompt.mjs menu-corpo --mode chatgpt --copy <id>` to put it on the clipboard.
3. Send. Download the image and save it as `thumbnails/menu-corpo/out/<id>_chatgpt.png`.
4. Repeat for every variant, then tell Claude which one to use.

| Variant | Text | Prompt file | Scene |
|---|---|---|---|
| A | MEDO ZERO | `chatgpt_A.txt` | Extreme close-up of the gray-jacket mascot's head and shoulders in the right two-thirds of the frame, smug half-lidded eyes, one black finger dragging a glowing slider on a floating translucent navy game menu with a red pulsing frame. The slider's bar reads empty, the knob slammed to the far left; the other three bars are full and gold; no lettering on the menu. Behind him, a red car frozen mid-motion a few metres away on a pastel suburban street, motion streaks hanging in the air as if time stopped. Text block bottom-left: MEDO (white) over ZERO (yellow, larger). |
| B | NUNCA ZERO. | `chatgpt_B.txt` | Golden-hour frozen park pond, pale blue ice with dark crack lines radiating from a jagged black hole of water. The gray-jacket mascot lies flat on his belly on the cracking ice, one arm stretched out, gripping the hand of a small round-black-head girl in a coral-orange hoodie who is in the freezing water up to her chest, eyes huge and scared. A floating translucent game menu hovers above him with four bars set at middle values (none at zero), its frame glowing red, no lettering on it. Snowy lawn and bare trees blurred behind. Text block bottom-left: NUNCA (white) over ZERO. (yellow, larger). |
| C | DOR: DESLIGADA | `chatgpt_C.txt` | School infirmary. The gray-jacket mascot sits at a desk with his hand plunged into a blue bucket full of ice cubes, completely relaxed, a bored smirk, while a round-black-head nurse in a white coat with glasses stares at him in shock, a stopwatch in her hand. His hand in the ice is tinted purple. A floating translucent game menu beside his head shows one slider dragged all the way to empty (no lettering on the menu). Warm yellow and navy classroom colours. Text block bottom-left: DOR: (white) over DESLIGADA (yellow, larger). |
