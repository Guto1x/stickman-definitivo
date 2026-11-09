# Setting up a new machine (git clone)

The repo carries the whole system: engine, tools, docs, generators, episode specs, the user's memory (`docs/memory/`) and the **paid** ElevenLabs audio (`public/episodes/*/vo/*.mp3` + `*.align.json`). It does not carry videos (`final/`, `out/`), installed packages, or the API key.

## 1. Install (once)
- **Windows** (the tools call `.venv\Scripts\python.exe`).
- **Node.js 22+**, **Git**, **Python 3.11+**.
- **FFmpeg** with `ffmpeg` and `ffprobe` on the PATH (e.g. `winget install Gyan.FFmpeg`).
- **Claude Code**.
- Optional: **yt-dlp** on the PATH, only to refresh competitor title lists (`tools/ideas/novelty.py refresh`).

## 2. Get the project
```
git clone <repo url> D:\stickman-2
cd D:\stickman-2
npm ci
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
npx remotion browser ensure
npm test
```
`npm test` must end with every self-test passing.

## 3. The ElevenLabs key
Create `.env` in the project root (it is gitignored, never commit it):
```
ELEVENLABS_API_KEY=<your key>
```

## 4. Use it
Open the folder in Claude Code. In the first session, Claude copies `docs/memory/` into its memory folder (CLAUDE.md, first lines). Then:
```
/stickman E Se Você <tema>
```
It runs the whole pipeline with the house rules: acid tone, fast pacing, 4+ clips of ~90 s for shorts. It stops once before spending voice credits. The video, `.srt` and `- cortes.txt` land in `final/`.

## Notes
- **Old episodes rebuild without new credits.** `node tools/build-episode.mjs <slug>` sees the missing `.wav` and rebuilds them from the saved mp3s (`episode.mjs pace`); no ElevenLabs call.
- `final/README.md` (the episode list) is not in git; a build or `/stickman` recreates it.
- Thumbnails in `chatgpt` mode need nothing extra. `fish` mode needs the Fish Audio MCP (`docs/FISH_SETUP.md`).
