// One-command finish for a composition: render PNG frames, run its Python sound design,
// mux a 1080p H.264 master, and write a review contact sheet.
//   node tools/build.mjs <CompositionId> <slug> [sfxScript]
//   node tools/build.mjs PillSprint pill_sprint tools/sfx/pill_sprint.py
// Output: final/<slug>.mp4, out/<slug>/frames/*.png, out/<slug>/sheet.png
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const [comp, slug, sfx] = process.argv.slice(2);
if (!comp || !slug) {
  console.error('usage: node tools/build.mjs <CompositionId> <slug> [sfxScript]');
  process.exit(1);
}
const root = fileURLToPath(new URL('..', import.meta.url));
const run = (cmd, args, opts = {}) => {
  console.log('>', cmd, args.join(' '));
  const r = spawnSync(cmd, args, { stdio: 'inherit', cwd: root, shell: process.platform === 'win32', ...opts });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

const outDir = path.join(root, 'out', slug);
const frames = path.join(outDir, 'frames');
fs.rmSync(frames, { recursive: true, force: true });
fs.mkdirSync(frames, { recursive: true });
run('npx', ['remotion', 'render', comp, `"${frames}"`, '--sequence', '--image-format=png', '--concurrency=4', '--log=error']);

let audio = null;
if (sfx) {
  const py = path.join(root, '.venv', 'Scripts', 'python.exe');
  run(`"${py}"`, ['-I', `"${path.join(root, sfx)}"`]);
  audio = path.join(root, 'public', 'audio', `${slug}_mix.wav`);
}

fs.mkdirSync(path.join(root, 'final'), { recursive: true });
const final = path.join(root, 'final', `${slug}.mp4`);
const first = fs.readdirSync(frames).filter(f => f.endsWith('.png')).sort()[0];
const pattern = path.join(frames, first.replace(/\d+\.png$/, m => `%0${m.length - 4}d.png`));
run('ffmpeg', ['-v', 'error', '-y', '-framerate', '30', '-i', `"${pattern}"`,
  ...(audio ? ['-i', `"${audio}"`] : []),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
  ...(audio ? ['-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-shortest'] : []), `"${final}"`]);
run('ffmpeg', ['-v', 'error', '-y', '-framerate', '30', '-i', `"${pattern}"`, '-vf', `"select='not(mod(n\\,4))',scale=480:-2,tile=6x5:padding=4:color=white"`,
  '-frames:v', '1', '-update', '1', `"${path.join(outDir, 'sheet.png')}"`]);
console.log('done:', final);
