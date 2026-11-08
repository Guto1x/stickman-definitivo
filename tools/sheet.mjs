// Cheap pre-check before review.mjs: one labelled still per chosen shot, tiled 4 across.
//   node tools/sheet.mjs <slug>                 → auto-picks key shots (opening, each new set, the last shots)
//   node tools/sheet.mjs <slug> c8,r6,12        → those shots (ids or indexes)
//   options: --at 0.7 (fraction of the shot), --max 16 (auto mode)
// Output: out/lab/<slug>_sheet.jpg (each tile 480 px wide, with the review banner showing the shot number).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const pos = args.filter((a, i) => !a.startsWith('--') && !['--at', '--max'].includes(args[i - 1]));
const [slug, list] = pos;
if (!slug) {
  console.error('usage: node tools/sheet.mjs <slug> [id,id,...] [--at 0.7] [--max 16]');
  process.exit(1);
}
const at = +opt('--at', 0.7), max = +opt('--max', 16);
const D = path.join(ROOT, 'public', 'episodes', slug);
const ep = JSON.parse(fs.readFileSync(path.join(D, 'episode.json'), 'utf8'));
const tm = JSON.parse(fs.readFileSync(path.join(D, 'timing.json'), 'utf8'));
const fps = tm.fps || 30;
const ids = ep.shots.map(s => s.id);

let pick;
if (list) {
  pick = list.split(',').map(s => s.trim()).filter(Boolean).map(tok => {
    const i = /^\d+$/.test(tok) ? +tok : ids.indexOf(tok);
    if (i < 0 || i >= ids.length) { console.error(`unknown shot "${tok}"`); process.exit(1); }
    return i;
  });
} else {
  // opening, the first shot of every new set, and the last two 3D shots (hook); thinned evenly to --max
  const s3d = ep.shots.map((s, i) => i).filter(i => ep.shots[i].kind !== 'card');
  const key = new Set([0]);
  let prevSet = null;
  for (const i of s3d) { if (ep.shots[i].set !== prevSet) key.add(i); prevSet = ep.shots[i].set; }
  s3d.slice(-2).forEach(i => key.add(i));
  pick = [...key].sort((a, b) => a - b);
  if (pick.length > max) pick = Array.from({ length: max }, (_, k) => pick[Math.round(k * (pick.length - 1) / (max - 1))]);
  pick = [...new Set(pick)];
}

const name = i => `sheet_${slug}_${String(i).padStart(3, '0')}`;
const jobs = pick.map(i => {
  const s = tm.shots[i];
  const f0 = Math.round(s.start * fps), f1 = Math.round((s.start + s.dur) * fps) - 1;
  return { out: `sheet/${name(i)}`, id: 'Episode', props: { slug, review: true }, frame: Math.min(f1, f0 + Math.round(s.dur * at * fps)) };
});
const LAB = path.join(ROOT, 'out', 'lab');
fs.mkdirSync(path.join(LAB, 'sheet'), { recursive: true });
const jobsFile = path.join(LAB, 'sheet', `${slug}_jobs.json`);
fs.writeFileSync(jobsFile, JSON.stringify(jobs));
console.log(`sheet: ${pick.length} shots → ${pick.map(i => ids[i] ?? i).join(', ')}`);
const r = spawnSync('node', [path.join(ROOT, 'tools', 'stills.cjs'), jobsFile], { encoding: 'utf8', cwd: ROOT });
const fails = (r.stdout || '').split('\n').filter(l => l.startsWith('FAIL'));
if (fails.length) console.log(fails.join('\n'));

const files = pick.map(i => path.join(LAB, 'sheet', name(i) + '.jpg')).filter(f => fs.existsSync(f));
const cols = Math.min(4, files.length), rows = Math.ceil(files.length / cols);
const all = [...files, ...Array(rows * cols - files.length).fill(files[files.length - 1])];
const out = path.join(LAB, `${slug}_sheet.jpg`);
spawnSync('ffmpeg', ['-v', 'error', '-y', ...all.flatMap(f => ['-i', f]), '-filter_complex',
  `${all.map((_, j) => `[${j}]scale=480:270[v${j}]`).join(';')};${all.map((_, j) => `[v${j}]`).join('')}xstack=inputs=${all.length}:layout=${all.map((_, j) => `${(j % cols) * 480}_${Math.floor(j / cols) * 270}`).join('|')}`,
  '-q:v', '3', out], { stdio: 'inherit' });
console.log(`→ ${path.relative(ROOT, out).replace(/\\/g, '/')}`);
