# Project instructions: 3D Stickman Long

**Claude: read only lines 1–{{HEADER_END}} of this file.** Everything after that is the packed project ({{SIZE_MB}} MB). If the user typed **start**, follow "For Claude: what start means" below.

This one file rebuilds the 3D Stickman Long production system in an empty folder. That system makes IFOLOGY-style "What If" videos with a 3D stickman hero, built in code with Remotion 4 and Three.js, with Python sound effects and ElevenLabs narration. The file holds:
- the engine, sets, cards and overlays;
- every tool;
- the style, story and research docs and the idea-engine data;
- the thumbnail template and reference images;
- Claude's project memory;
- the `/stickman <topic>` command (topic in, finished video and 3 thumbnails out).

It holds {{FILE_COUNT}} files in all, each with a checksum. It was packed on {{DATE}}. It holds no finished videos or episodes: you start with an empty channel.

## For the human

1. Make an empty folder and put this file in it. Keep the name `project instructions.md`.
2. Open a new Claude Code chat on that folder: the Code tab of the desktop app, or `claude` in a terminal there.
3. Type **start**. (If Claude asks what to start, say "follow project instructions.md".)

At {{SIZE_MB}} MB, the file is too big to paste into a chat, so it has to sit in the folder.

Claude asks four setup questions first:
- what the main character wears (with ready-made looks if you don't want to describe one);
- what language scripts, narration and overlays are written in;
- the narrator voice;
- how thumbnails are made.

Then it installs and checks everything. That takes 5–20 minutes depending on your connection (npm downloads about 1.5 GB) and on how much the outfit changes.

You need Windows 10 or 11, a GPU, and about 4 GB of free disk. Claude installs Node, Python and ffmpeg with winget if they're missing, after asking you.

**ElevenLabs** (voice) is connected afterwards:
1. Get an API key at elevenlabs.io/app/settings/api-keys.
2. Open a new chat in the project folder and give Claude the key.
3. Claude runs `docs/ELEVENLABS_SETUP.md`: it saves the key to `.env`, picks house voices in your language, and measures the real credit cost.

**Fish Audio** is separate and optional — only needed if you picked `fish`-mode thumbnails:
1. Add the Fish Audio connector to your Claude account, or the Fish Audio MCP server to Claude Code.
2. Open a new chat in the project folder and say "Fish is connected".
3. Claude runs `docs/FISH_SETUP.md`: it checks the thumbnail model and uploads the reference images.

Everything else works before either is connected: ideas, scripts, shot lists, previews and short shots.

## For Claude: what "start" means

You are installing an existing project from this file. Every project file comes out of the payload, byte for byte, with its checksum verified. Never write a project file from memory or "improve" one while installing. The only edits you make are the ones the setup answers call for (step 7).

Never read past line {{HEADER_END}} with Read, cat or grep: the rest is {{SIZE_MB}} MB of payload. Keep a task list, and run the long installs in the background.

**Shell.** Run every command in the Bash tool (Git Bash), with forward slashes, exactly as written here: `.venv/Scripts/python`, `--props='{"view":"close"}'`. If there is no Bash tool, use PowerShell:
- write `.venv\Scripts\python`;
- pass `--props` as the path of a small JSON file (`--props=out/lab/close.json`), because PowerShell 5.1 strips the inner quotes of inline JSON;
- write the extractor with the Write tool (step 4).

### 1. Look before you start

- The folder should contain only this file, plus `.bootstrap/` if an earlier attempt stopped. If it holds other files, tell the user and ask before going on. The extractor never overwrites a file that differs unless you pass `--force`.
- Note whether the user has already mentioned an ElevenLabs API key, and whether Fish Audio tools are already available in this session (names ending in `get_credit_balance`, `get_media_model`, …, loaded or deferred). You need both in step 9.

### 2. Ask the setup questions

Ask all four in **one** AskUserQuestion call. If the tool isn't available, ask in chat and wait.

1. Header "Outfit". Question: "What should the main character wear?"
   - **Red hoodie (Recommended)**: "The original look: red hoodie with coral trim and white drawstrings, dark purple joggers, light sneakers."
   - **Purple hoodie**: "The channel's first look: purple hoodie with lilac trim, dark joggers, light sneakers."
   - **Orange hoodie + headband**: "Bright orange hoodie with cream trim, a white sweatband, charcoal joggers, white sneakers."
   - **Yellow bomber + cap**: "Sporty: yellow bomber jacket with charcoal trim, a cream cap, charcoal pants, white sneakers."
   - The automatic "Other" option lets the user describe their own outfit.
2. Header "Language". Question: "What language should scripts, narration, overlays and thumbnails be written in?"
   - **English (Recommended)**: "The language the engine's docs and example scripts are written in."
   - **Portuguese (PT-BR)**: "Scripts, VO text, overlays and thumbnail text in Portuguese. Code, docs and comments stay in English."
   - The automatic "Other" option lets the user name any other language; the story docs (`STORY_BLUEPRINT.md`, `IDEA_ENGINE.md`, `script_analysis.md`) get translated the same way.
3. Header "Narrator". Question: "Which narrator voice should ElevenLabs use once it's connected?"
   - **Default for the chosen language (Recommended)**: "Claude picks a calm, warm narrator in that language from ElevenLabs' public voice library once connected, and confirms it with you by ear before locking it in."
   - **Audition first**: "When ElevenLabs is connected, Claude plays you free samples of 3–4 narrators in that language and you pick."
4. Header "Thumbnails". Question: "How should thumbnails be made?"
   - **Fish GPT Image (Recommended)**: "Claude generates 3 options at 2K through Fish once it's connected (about 4.8k credits per episode)."
   - **ChatGPT, by hand**: "Free: Claude writes the prompts, you paste them into ChatGPT with the 3 reference images."

There is deliberately no blue option. The lead of IFOLOGY FILMS, the channel this style is modelled on, wears a blue hoodie, and the thumbnail reference images show him in it. A blue hoodie would read as a copy of that character. If the user describes a blue hoodie under "Other", tell them this and suggest another colour; go ahead only if they insist.

### 3. Check the prerequisites

Check each of these:
- `node --version`: 20 or newer (the original used v24.16.0);
- Python 3.11 or newer (`py -3.14 --version`, `py --version` or `python --version`; the original used 3.14.3);
- `ffmpeg -version` and `ffprobe -version`;
- optional: `yt-dlp --version`, which `tools/ideas/novelty.py refresh` uses to update competitor titles.

If something is missing, ask once, then install it with winget:
- `winget install -e --id OpenJS.NodeJS.LTS`
- `winget install -e --id Python.Python.3.14`
- `winget install -e --id Gyan.FFmpeg`
- `winget install -e --id yt-dlp.yt-dlp`

A new install isn't on PATH until a new shell starts. Find the full path, for example under `%LOCALAPPDATA%\Microsoft\WinGet\Packages\`, or ask the user to restart the app and type start again; this procedure picks up where it left off. If winget itself is missing, give the user the download pages and wait.

### 4. Unpack

1. Copy the extractor below into `.bootstrap/extract.mjs` exactly as written.
   - In Bash, run this from the project folder; it copies the file exactly:
     `mkdir -p .bootstrap && awk '/^```js extract\.mjs$/{f=1;next} f&&/^```$/{exit} f' "project instructions.md" > .bootstrap/extract.mjs`
   - Without Bash, write it with the Write tool.
2. Run it:

```
node .bootstrap/extract.mjs "project instructions.md" . --memory "<memory folder>"
```

`<memory folder>` is the persistent memory directory that your system prompt names, such as `C:\Users\<name>\.claude\projects\<folder>\memory`. If your system prompt names none, use `docs/memory`. After the extractor has run, add this line directly under the title of `CLAUDE.md`, above the ElevenLabs note, unless it's already there:

`Project memory (the user's preferences and decisions) lives in docs/memory/: read MEMORY.md and the files it links at the start of every session, and save new memories there.`

The extractor must print `0 checksum failures`. If any file fails, this file was changed after packing (an editor or a transfer altered it). Ask the user for a fresh copy. Never hand-write the missing files.

```js extract.mjs
{{EXTRACTOR}}
```

3. Read `CLAUDE.md`, `HOW_TO_USE.md`, `docs/STYLE.md` and the memory files now. They are the project's rules. This session started before they existed, so none of them is loaded yet. From here on, follow them as any session in this project would.

   They record the decisions of the person who built the system: dates, the `swap-pilot` episode, credit balances. Treat them as the house rules and history of this project. The swap-pilot episode itself isn't included; only its thumbnail brief ships, as the example format.

**Editing files.** Many files use CRLF line endings. Keep each file's endings as they are:
- the Edit tool does this;
- `sed -i` in Git Bash silently converts a file to LF;
- Python's `write_text` on Windows forces CRLF.

### 5. Install

1. Run `npm ci` in the background. It installs the exact versions in `package-lock.json`, about 1.5 GB.
   - npm reports some "high severity vulnerabilities" in dependencies. That is expected.
   - Don't run `npm audit fix`: it changes the pinned versions.
2. Run `npx remotion browser ensure`. It downloads the headless Chrome that Remotion renders with.
3. Create the Python environment at the project root. The build tools call `.venv/Scripts/python.exe`, so it must live there.
   - Run `py -3.14 -m venv .venv`, or use whichever Python 3.11+ you found.
   - Then run `.venv/Scripts/python -m pip install numpy==2.5.4 scipy==1.18.1`.
   - If those exact versions have no wheel for that Python, install the latest `numpy scipy` and say so in the report.
4. Run `.venv/Scripts/python -I tools/sfx/pill_sprint.py`. This writes `public/audio/pill_sprint_mix.wav`, the soundtrack of the `PillSprint` reference composition. Without it, that composition fails to load in the studio.

`episode.mjs align` needs no local model — it reads timestamps ElevenLabs already returned, so there's nothing to download here.

### 6. Run the gates

All of these must pass:
- `npm run typecheck`
- `npm test`: every engine self-test prints PASS.
- `node tools/qa.cjs audit pipetest`: 0 errors. `pipetest` is the small fixture episode the compositions default to. It has no audio, which is expected. One framing warning (feet out of frame) is also expected.

### 7. Apply the setup answers

#### Outfit

As packed, the `hero` entry in `src/cast.ts` is:

`{{HERO_ENTRY}}`

If the chosen look is that one, skip to "Narrator". Otherwise work through these six steps. Below, "the old outfit" and "the old colour" mean this packed look.

1. **The hero.** Set the `hero` entry in `src/cast.ts`. The fields are `Outfit` in `src/types.ts`:
   - `top`: hoodie, jacket, tee, coat, dress or suit, with `topColor` and `accent` (trim, drawstrings, zip);
   - `bottom`: pants, shorts or skirt, with `bottomColor`;
   - `shoes`;
   - optional `hat` (cap, headband or helmet) with `hatColor`, and `glasses`;
   - `hair`: keep `none`, the IFOLOGY look, unless the user asked for hair.

   | Look | `hero` entry (after `name: 'Hero'`) |
   |---|---|
   | Red hoodie | `top: 'hoodie', topColor: '#d1342b', accent: '#ff9a8b', bottom: 'pants', bottomColor: '#38275e', shoes: '#efe8ff', hair: 'none'` |
   | Purple hoodie | `top: 'hoodie', topColor: '#7b4fd0', accent: '#c9b2ff', bottom: 'pants', bottomColor: '#2b2540', shoes: '#efe8ff', hair: 'none'` |
   | Orange hoodie + headband | `top: 'hoodie', topColor: '#f07a1f', accent: '#ffe2c2', bottom: 'pants', bottomColor: '#34343c', shoes: '#ffffff', hat: 'headband', hatColor: '#f4f1ea', hair: 'none'` |
   | Yellow bomber + cap | `top: 'jacket', topColor: '#f2c230', accent: '#2b2f3a', bottom: 'pants', bottomColor: '#2b2f3a', shoes: '#ffffff', hat: 'cap', hatColor: '#f4f1ea', hair: 'none'` |

   For an outfit of the user's own, map it onto these fields.
   - Keep hats light-coloured: a dark hat vanishes into the black head.
   - Avoid `hat: 'beanie'`. It renders as a bare dome that reads as a grey helmet. Offer a cap or headband instead, or give the beanie a rolled cuff first: a `memo()`'d LatheGeometry with points bottom → top.
   - A piece the engine doesn't have (a cape, a scarf): use the nearest supported look and tell the user. Build it only if it's small, in `src/engine/Stickman.tsx`, following CLAUDE.md's hard-won rules.
   - Ask a follow-up question only if the description can't be used at all.

2. **The signature colour belongs to the hero.** The outfit's main colour becomes the hero's, and nobody else may wear it. Judge by eye at thumbnail size (~360 px wide), not by hex.
   - These count as the same hue: navy as blue; coral and maroon as red; lilac, violet and periwinkle as purple; amber as orange; gold and mustard as yellow.
   - Pink and magenta are not purple, and teal is not blue or green.
   - If you're unsure, recolour it.

   Recolour every match in the places that dress people or carry team colours:
   - `src/cast.ts`: every other character and the extras, including accents, hats and shoes;
   - `src/sets/kit.tsx`: the crowd `shirts`, which several outdoor sets use;
   - `src/sets/classroom.tsx`: `SHIRTS` (the cafeteria uses them too);
   - `src/sets/stadium.tsx`:
     - the team colours `HOME`/`AWAY` (they also paint end zones, benches and the scoreboard roof);
     - the crowd `SHIRTS`;
     - the scoreboard `Sign` backgrounds;
     - the midfield logo;
     - `BOARD_BG` and `BOARD_TEXT` (the background and the words, e.g. a "PURPLE PRIDE" board for a purple hero).

   Pick replacements that are neither the new signature colour nor the old one, so neither competes with the hero. Leave every colour that doesn't clash as it is.

   Environment colours (walls, chairs, roofs, cabinets) and effect colours (power glows, aura, ghosts) don't count. But check the sets whose environment shares the new colour (purple: the home kitchen's cabinets, the suburb's roofs). Render each one with the hero in it (`"hero":"hero"` in the SetLab props), and tell the user what clashes, rather than repainting the set.

3. **Text.** Every mention of the hero's outfit must describe the new one. The known places:
   - `CLAUDE.md`: the intro paragraph, the "… belongs to the hero" rule in the hard-won rules, and both step-10 thumbnail lines;
   - `HOW_TO_USE.md`: the outfits line;
   - `docs/STYLE.md`: the "wardrobe" line near the top and the hero section;
   - `docs/review/REVIEWER_BRIEF.md`: the colour rule;
   - `docs/story/STORY_BLUEPRINT.md`: "You (purple hoodie)" and "purple-hoodie stickman";
   - `src/cast.ts`: both comments;
   - `src/sets/stadium.tsx`: the comment on `HOME`;
   - `src/demo/PillSprint.tsx`: the first line;
   - `thumbnails/swap-pilot/brief.json`: the example brief future thumbnails are copied from (the "…-hoodie mascot" mentions).

   Then sweep for the rest with `grep -rniE "{{HERO_GREP}}" CLAUDE.md HOW_TO_USE.md src tools docs thumbnails --exclude-dir=pack`, and read every hit. Change the ones that describe the hero. Leave alone:
   - other characters' clothes;
   - the research docs' descriptions of other channels;
   - STORY_BLUEPRINT's list of competitor character tags;
   - `tools/pack/`, the installer, which describes the packed look and re-reads `src/cast.ts` whenever it repacks.

4. **Thumbnails.** The reference images show the mascot in a **blue** hoodie, and the prompts recolour it to the old outfit. Change every outfit field below to describe the new outfit and colour. For a jacket, the `hoodie` object describes the jacket; its key names may stay. Add the hat if there is one.

   In `thumbnails/prompt_template.json`:
   - `task`;
   - `main_character.identity`;
   - `main_character.hoodie`: `type`, `primary_color`, `shadow_color`, `highlight_color`, `shading` and `critical_rule`;
   - `main_character.body.shoes`;
   - `main_character.lighting.hoodie`;
   - `cinematic_art_direction.color_palette.hoodie_<colour>` (rename the key to the new colour);
   - `automatic_scene_generation.instruction`;
   - `final_directive.instruction`;
   - `final_directive.internal_execution`: "Render the …-hoodie mascot consistently."

   Keep `negative_prompt` "Blue hoodie": it still bans the competitor's colour.

   Lighting and background colours are not outfit fields: `main_character.lighting.rim`, `cinematic_art_direction.color_palette`'s backgrounds and accents, and the "prefer purple, indigo, violet" palette. If the new colour is one of them (a purple hero on the template's purple backgrounds), tell the user that the mascot may not stand out. Offer to shift the background palette; don't change it unasked.

   In `tools/thumb-prompt.mjs`, two rule strings:
   - the one starting "Every reference shows a BLUE hoodie: draw it …" must name the new outfit;
   - the one that says which colour belongs only to the mascot ("never …, … is only the mascot") must name the new signature colour.

   They are single-quoted or template JS strings, so escape apostrophes or avoid them.

   Then verify:
   1. Run `node --check tools/thumb-prompt.mjs`.
   2. Run `node -e "JSON.parse(require('fs').readFileSync('thumbnails/prompt_template.json','utf8'))"`.
   3. Run `mkdir -p thumbnails/_check && cp thumbnails/swap-pilot/brief.json thumbnails/_check/`, then `node tools/thumb-prompt.mjs _check --mode chatgpt`.
   4. Grep `thumbnails/_check/chatgpt_A.txt` for the old outfit's colour words and hexes. Only unrelated words (such as the rim-light colours) may match.
   5. Delete `thumbnails/_check/`.

5. **Memory.** Rewrite these and date them:
   - in `project-ifology-style-channel.md`: every line about the hero's outfit, and the "never write '… hoodie'" note (it becomes "never describe an old outfit");
   - in `project-thumbnails-gpt-image.md`: every outfit mention (its description and its body);
   - every outfit mention in `MEMORY.md`.

   Say the outfit was chosen at setup.

6. **Look-dev.** Render these stills:
   - `npx remotion still CharacterLab out/lab/hero_close.png --props='{"view":"close"}'`
   - `npx remotion still CharacterLab out/lab/hero_three.png --props='{"view":"three"}'`
   - `npx remotion still CharacterLab out/lab/lineup_a.png --props='{"view":"lineup","ids":["hero","bestie","sister","mom","dad","teacher","coach"]}'`
   - `npx remotion still CharacterLab out/lab/lineup_b.png --props='{"view":"lineup","ids":["hero","rival","scientist","kid","extraA","extraB","extraC"]}'`
   - for each set you recoloured, a `SetLab` still with a camera on the people. For the stadium, use `{"set":"stadium","cam":{"pos":[0,3,8],"look":[0,9,33],"fov":50}}` for the near stand and `{"set":"stadium","cam":{"pos":[-42,17,21],"look":[0,2,-4]}}` for the wide view. Other sets list their cameras in `src/sets/indoor.ts` and `src/sets/outdoor.ts`.

   The full lineup is too wide for the frame and crops the hero, so use groups of seven at most. Between the two groups, every key in `CAST` must stand next to the hero.

   Look at each still. The outfit must read clearly, with no black outline hull and no bell-shaped hem. No other character or crowd member may share the hero's colour. Fix and re-render until all of that holds, then run `npm run typecheck` and `npm test` again.

#### Language

If the answer was "English", change nothing.

Otherwise (Portuguese or another language):
- Add a line near the top of `CLAUDE.md`, right after the outfit paragraph: "**Scripts, shot-list `vo` text, overlays and thumbnail text are written in <language>** as of <date> (chosen at setup). Code, comments, field names, file paths and this file stay in English — only the generated content is in <language>."
- Translate `docs/story/STORY_BLUEPRINT.md`, `docs/story/IDEA_ENGINE.md` and `docs/research/script_analysis.md` into that language: prose, checklists and example script lines (rewritten as a native speaker would write that same beat, not translated word-for-word), but not JSON field names, file paths, commands or code. If a pacing number in those docs (words per minute, syllables, characters per line) looks English-specific, leave the number as-is and tell the user it may need a human recheck for the new language — don't invent a new number yourself.
- Add a dated line to `project-pt-br-adaptation.md` (name it for the actual language if not Portuguese) recording the choice, under memory type `project`, and a line in `MEMORY.md`.

#### Narrator

If the answer was "Audition first":
- in `docs/ELEVENLABS_SETUP.md`, change the "Narrator voice" line under "Choices made at setup" to "audition requested at setup: run step 3 as a full audition before picking anything";
- add a dated line to `project-narrator-voice.md`: the user asked to audition narrators once ElevenLabs is connected, with no default locked in until they pick.

Otherwise change nothing — step 9 picks a default once ElevenLabs is connected and confirms it with the user.

#### Thumbnails

If the answer was "ChatGPT, by hand":
- in `thumbnails/config.json`, set `"mode": "chatgpt"`;
- in CLAUDE.md step 10, change "(current: `fish`)" to "(current: `chatgpt`)";
- in `project-thumbnails-gpt-image.md`, change "Mode stays `fish` for now" to "Mode is `chatgpt` (chosen at setup, <date>)";
- in `MEMORY.md`, change "(fish now)" to "(chatgpt now)";
- in `docs/FISH_SETUP.md`, change the "Thumbnails" line to "`chatgpt` mode, chosen at setup: skip steps 5–6 unless the user switches to `fish`".

Otherwise change nothing.

### 8. Final look

If the outfit didn't change, render `out/lab/hero_close.png` and the two lineups from step 7 now, and look at all three. This proves the GPU render path works on this machine. If step 7 already rendered them after its last edit, they serve.

### 9. ElevenLabs and Fish Audio

The unpacked `CLAUDE.md` starts with an "ElevenLabs is not connected yet" note, and the memory has `project-elevenlabs-pending.md` (and `project-fish-pending.md`, for `fish`-mode thumbnails only). Together they make every later session run the matching setup doc the first time it can.
- If the user already gave an API key (from step 1), run `docs/ELEVENLABS_SETUP.md` now: save the key to `.env`, pick house voices in the chosen language (step 3 there), and measure the real credit cost. Ask before anything that spends credits.
- If Fish tools are already available in this session and the thumbnail answer was `fish`, also run `docs/FISH_SETUP.md` now.
- Otherwise leave the pending notes and memories in place.

### 10. Finish

Delete `.bootstrap/`. Leave `project instructions.md` where it is: it's this copy's installer, and `node tools/pack/pack.mjs` refreshes it after changes.

Report to the user:
- files unpacked, and the checksum result;
- what was installed, with versions;
- the gate results;
- the outfit applied, every colour you moved off the cast, and `hero_close.png` and `lineup_a.png` sent by SendUserFile;
- the language, narrator and thumbnail choices;
- anything that failed or was skipped.

End with how to connect ElevenLabs (get a key, give it to Claude in a new chat) and, if the thumbnail answer was `fish`, how to connect Fish Audio too (connect it, open a new chat here, say "Fish is connected") — plus two or three things to ask for next, from `HOW_TO_USE.md`, such as "Give me 3 new What If ideas" or `/stickman What If You Could Breathe Underwater`. Mention that `/stickman` shows up in a new chat (commands load when a session starts).

## What's in the payload

{{CONTENTS}}

Left out on purpose:
- finished videos, episodes, voice-overs and thumbnails (you start with an empty channel);
- the render outputs in `out/` and `final/`;
- `node_modules/` and `.venv/` (step 5 rebuilds them).

`final/` starts with only its README and empty `archive/` and `thumbnails/` folders; the empty root `episodes/` folder is carried over as it is.

To repack after changing the project, run `node tools/pack/pack.mjs`. It rewrites this file from the current project.
