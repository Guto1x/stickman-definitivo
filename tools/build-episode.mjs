// Finish an episode: (re)build the soundtrack, render the Episode composition, mux with a
// loudness-normalised mix (−14 LUFS, −1 dBTP), and write review sheets (one frame per shot).
//   node tools/build-episode.mjs <slug> [--from <sec> --to <sec>] [--no-audio] [--skip-audit] [--crf 18] [--concurrency N]
// A full build refuses to start while the scene audit has errors (range previews skip the gate).
// Output: final/<Episode title>.mp4 (the previous cut moves to final/archive/), or out/<slug>/preview_<from>-<to>.mp4 for a range.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const slug = args[0];
const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
if (!slug) {
  console.error('usage: node tools/build-episode.mjs <slug> [--from s --to s] [--no-audio]');
  process.exit(1);
}
const from = opt('--from'), to = opt('--to');
const D = path.join(ROOT, 'public', 'episodes', slug);
const OUT = path.join(ROOT, 'out', slug);
fs.mkdirSync(OUT, { recursive: true });
const run = (cmd, a) => {
  console.log('>', cmd, a.join(' '));
  const r = spawnSync(cmd, a, { stdio: 'inherit', cwd: ROOT, shell: process.platform === 'win32' });
  if (r.status !== 0) process.exit(r.status ?? 1);
};
const q = s => `"${s}"`;
const timing = JSON.parse(fs.readFileSync(path.join(D, 'timing.json'), 'utf8'));
const fps = timing.fps || 30;

if (from === undefined && !args.includes('--skip-audit')) {
  const r = spawnSync('node', [path.join(ROOT, 'tools', 'qa.cjs'), 'audit', slug], { stdio: 'inherit', cwd: ROOT });
  if (r.status !== 0) {
    console.error(`
scene audit has errors: fix them (out/${slug}/audit.json) before the final render, or pass --skip-audit.`);
    process.exit(1);
  }
}

if (!args.includes('--no-audio')) run(q(path.join(ROOT, '.venv', 'Scripts', 'python.exe')), ['-I', q(path.join(ROOT, 'tools', 'sfx', 'episode_audio.py')), slug]);

const silent = path.join(OUT, 'video_silent.mp4');
const frames = from !== undefined ? [`--frames=${Math.round(+from * fps)}-${Math.round(+to * fps) - 1}`] : [];
// defaults measured on a 12-core RTX 3060 box (20 s range): concurrency 4 → 85 s, 6 → 74 s, 8 → 67 s, 10 → 66 s;
// CRF 18 is 39% of CRF 14's size at SSIM 0.994 (no visible difference; YouTube re-encodes anyway)
const concurrency = opt('--concurrency') ?? Math.max(2, os.cpus().length - 4), crf = opt('--crf') ?? 18;
const t0 = Date.now();
run('npx', ['remotion', 'render', 'Episode', q(silent), `--props=${q(JSON.stringify({ slug }).replace(/"/g, '\\"'))}`, '--muted', `--concurrency=${concurrency}`, `--crf=${crf}`, '--log=error', ...frames]);
console.log(`render: ${((Date.now() - t0) / 1000).toFixed(0)} s (concurrency ${concurrency}, crf ${crf})`);

// Every finished episode sits directly in final/, named by its title (e.g. "What If You Could Swap Places With Anyone.mp4"),
// so all the videos can be browsed in one folder. A rebuild moves the previous cut to final/archive/<slug>_<date>.mp4.
const ep = JSON.parse(fs.readFileSync(path.join(D, 'episode.json'), 'utf8'));
const niceName = (ep.title || slug).replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim();
const final = from !== undefined ? path.join(OUT, `preview_${from}-${to}.mp4`) : path.join(ROOT, 'final', `${niceName}.mp4`);
fs.mkdirSync(path.dirname(final), { recursive: true });
if (from === undefined && fs.existsSync(final)) {
  const stamp = fs.statSync(final).mtime.toISOString().slice(0, 16).replace(/[-:]/g, '').replace('T', '-');
  const arch = path.join(ROOT, 'final', 'archive');
  fs.mkdirSync(arch, { recursive: true });
  fs.renameSync(final, path.join(arch, `${slug}_${stamp}.mp4`));
}
const mix = path.join(D, 'mix.wav');
const audioIn = fs.existsSync(mix) ? ['-ss', String(from ?? 0), '-i', q(mix)] : [];
run('ffmpeg', ['-v', 'error', '-y', '-i', q(silent), ...audioIn, '-c:v', 'copy',
  ...(audioIn.length ? ['-af', 'loudnorm=I=-14:TP=-1:LRA=11', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-shortest'] : []), '-movflags', '+faststart', q(final)]);

// review sheet: one frame from the middle of every shot
if (from === undefined) {
  const shotsDir = path.join(OUT, 'shots');
  fs.rmSync(shotsDir, { recursive: true, force: true });
  fs.mkdirSync(shotsDir, { recursive: true });
  timing.shots.forEach((s, i) => {
    spawnSync('ffmpeg', ['-v', 'error', '-y', '-ss', (s.start + s.dur / 2).toFixed(3), '-i', final, '-frames:v', '1', '-vf', 'scale=480:-2',
      path.join(shotsDir, `${String(i).padStart(3, '0')}.png`)]);
  });
  const per = 30;
  for (let p = 0; p * per < timing.shots.length; p++) {
    spawnSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-start_number', String(p * per), '-i', path.join(shotsDir, '%03d.png'),
      '-vf', `trim=end_frame=${per},tile=6x5:padding=4:color=white`, '-frames:v', '1', '-update', '1', path.join(OUT, `sheet_${p + 1}.png`)]);
  }
}
console.log('done:', final);
