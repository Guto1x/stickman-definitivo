// Finish an episode: (re)build the soundtrack, render the Episode composition, mux with a
// loudness-normalised mix (−14 LUFS, −1 dBTP), and write review sheets (one frame per shot).
//   node tools/build-episode.mjs <slug> [--from <sec> --to <sec>] [--no-audio] [--skip-audit] [--crf 18] [--concurrency N]
// A full build refuses to start while the scene audit has errors (range previews skip the gate).
// Output: final/<Episode title>.mp4 (the previous cut moves to final/archive/), or out/<slug>/preview_<from>-<to>.mp4 for a range.
import { spawn, spawnSync } from 'node:child_process';
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
// live progress for `node tools/progress.mjs <slug>`: step, frames, % and Remotion's own time-remaining estimate
const PROG = path.join(OUT, 'progress.json');
const BUILD_T0 = Date.now();
const progress = (step, extra = {}) => {
  try { fs.writeFileSync(PROG, JSON.stringify({ slug, step, started: BUILD_T0, updated: Date.now(), range: from !== undefined ? [+from, +to] : null, ...extra })); } catch { /* best effort */ }
};
progress('audit');
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

// fresh clone: the paid mp3s are in git, the derived .wav are not — rebuild them locally (no ElevenLabs call)
if (!args.includes('--no-audio') && fs.existsSync(path.join(D, 'sections.json'))) {
  const secs = JSON.parse(fs.readFileSync(path.join(D, 'sections.json'), 'utf8'));
  if (secs.some(s => s.file && !fs.existsSync(path.join(D, s.file)) && fs.existsSync(path.join(D, 'vo', `${s.id}.mp3`))))
    run('node', [q(path.join(ROOT, 'tools', 'episode.mjs')), 'pace', slug]);
}

if (!args.includes('--no-audio')) {
  progress('audio');
  run(q(path.join(ROOT, '.venv', 'Scripts', 'python.exe')), ['-I', q(path.join(ROOT, 'tools', 'sfx', 'episode_audio.py')), slug]);
}

// a range preview gets its own file: sharing video_silent.mp4 let a preview clobber a full build running at the same time
const silent = path.join(OUT, from !== undefined ? `video_silent_${from}-${to}.mp4` : 'video_silent.mp4');
const frames = from !== undefined ? [`--frames=${Math.round(+from * fps)}-${Math.round(+to * fps) - 1}`] : [];
// defaults measured on a 12-core RTX 3060 box (20 s range): concurrency 4 → 85 s, 6 → 74 s, 8 → 67 s, 10 → 66 s;
// CRF 18 is 39% of CRF 14's size at SSIM 0.994 (no visible difference; YouTube re-encodes anyway)
const concurrency = opt('--concurrency') ?? Math.max(2, os.cpus().length - 4), crf = opt('--crf') ?? 18;
const t0 = Date.now();
// Remotion prints "Rendered 46/60, time remaining: 2s" lines (and "Encoded N/T"): keep them out of the log,
// write them to progress.json, and print one short line every 2 %
await new Promise(resolve => {
  const a = ['remotion', 'render', 'Episode', q(silent), `--props=${q(JSON.stringify({ slug }).replace(/"/g, '\\"'))}`, '--muted', `--concurrency=${concurrency}`, `--crf=${crf}`, ...frames];
  console.log('> npx', a.join(' '));
  progress('render', { done: 0, total: 0 });
  const child = spawn('npx', a, { cwd: ROOT, shell: process.platform === 'win32' });
  let lastPct = -1, buf = '';
  const onData = chunk => {
    buf += chunk.toString();
    const lines = buf.split(/\r?\n|\r/);
    buf = lines.pop();
    for (const line of lines) {
      const m = /(Rendered|Encoded) (\d+)\/(\d+)(?:, time remaining: (.+))?/.exec(line);
      if (!m) { if (line.trim() && !/^\s*\+|Bundl|Copying|Getting|composition/i.test(line)) console.log(line); continue; }
      const [, kind, done, total, eta] = m;
      progress(kind === 'Rendered' ? 'render' : 'encode', { done: +done, total: +total, eta: eta || null });
      const pct = Math.floor((100 * +done) / +total);
      if (kind === 'Rendered' && (pct >= lastPct + 2 || +done === +total)) { lastPct = pct; console.log(`render ${pct}% (${done}/${total})${eta ? `, ~${eta} left` : ''}`); }
    }
  };
  child.stdout.on('data', onData);
  child.stderr.on('data', onData);
  child.on('close', code => { if (code !== 0) { progress('failed', { code }); process.exit(code ?? 1); } resolve(); });
});
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
progress('mux');
const mix = path.join(D, 'mix.wav');
const audioIn = fs.existsSync(mix) ? ['-ss', String(from ?? 0), '-i', q(mix)] : [];
run('ffmpeg', ['-v', 'error', '-y', '-i', q(silent), ...audioIn, '-c:v', 'copy',
  ...(audioIn.length ? ['-af', 'loudnorm=I=-14:TP=-1:LRA=11', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-shortest'] : []), '-movflags', '+faststart', q(final)]);

// review sheet: one frame from the middle of every shot
if (from === undefined) {
  progress('sheets');
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
// subtitles + the marked shorts' timecodes for the user's own 9:16 edit (no-op on a range preview)
if (from === undefined && !timing.draft) run('node', [q(path.join(ROOT, 'tools', 'episode.mjs')), 'srt', slug]);
progress('done', { final });
console.log('done:', final);
