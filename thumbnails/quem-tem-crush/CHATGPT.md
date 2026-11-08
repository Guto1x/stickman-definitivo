# E Se Você Pudesse Ver Quem Tem Crush em Você?: thumbnails in ChatGPT

Make each variant in a **new** ChatGPT chat, so the earlier ones don't bleed in.

1. Attach the three reference images from `D:\stickman-2\thumbnails\refs`, in this order:
   1. `ref1_paused.webp` (PAUSED. close-up)
   2. `ref2_split_face.webp` (split face, mascot half only)
   3. `ref3_too_slow.webp` (TOO SLOW. action shot)
2. Paste the prompt for the variant: open its file below, select all, copy, paste. Or run `node tools/thumb-prompt.mjs quem-tem-crush --mode chatgpt --copy <id>` to put it on the clipboard.
3. Send. Download the image and save it as `thumbnails/quem-tem-crush/out/<id>_chatgpt.png`.
4. Repeat for every variant, then tell Claude which one to use.

| Variant | Text | Prompt file | Scene |
|---|---|---|---|
| A | ELA GOSTA. | `chatgpt_A.txt` | Bright school classroom in warm afternoon light. Extreme close-up of the gray-jacket mascot filling the right half of the frame, smug half-lidded eyes and a sly smirk, glancing sideways at the viewer. Behind him, softly out of focus, a girl with a round black head, curly hair and a purple hoodie sits at a desk, glowing soft pink from her chest, with a small pink pill-shaped badge floating above her head: a white heart icon and the number 94%. Text block bottom-left: ELA (white) over GOSTA. (yellow, larger). |
| B | 87% POR QUEM? | `chatgpt_B.txt` | Night bedroom lit by a cold blue window and a warm desk lamp. The gray-jacket mascot, big in the right two-thirds of the frame, holds a folded sheet of paper and stares at it wide-eyed and worried, a single sweat drop on his head. Directly above HIS OWN head floats a large glowing pink pill-shaped badge with a white heart icon and the number 87% — he cannot see it, but the viewer can. Through the dark window behind him, a tiny figure in a bright yellow raincoat stands under a streetlight. Text block upper-left: 87% (white) over POR QUEM? (yellow, larger). |
| C | SÓ VOCÊ VÊ. | `chatgpt_C.txt` | Golden-hour apartment street. A sand-coloured apartment block with orange flames in a fourth-floor balcony doorway and thick billowing toon smoke covering the facade. Through the smoke on that balcony, a soft pink glow in the shape of a lying figure, with a small pink badge reading 12% above it. In the foreground right, big, the gray-jacket mascot looks up at the balcony, eyes wide and determined, mouth open mid-shout, one arm pointing up. A red fire-truck ladder basket is rising toward the balcony. Text block bottom-left: SÓ VOCÊ (white) over VÊ. (yellow, larger). |
