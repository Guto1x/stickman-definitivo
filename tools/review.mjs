// Review frames: event-anchored, labelled stills for the visual review and the independent reviewer.
//   node tools/review.mjs <slug>
// 1. runs the scene audit (out/<slug>/audit.json) for the event list
// 2. renders Episode in review mode (name tags, expected-position markers, shot/time banner):
//    - every event (swap, path jump, flow boundary): before / at / after, 960×540 each, stacked
//    - every shot: first frame after the cut + early / late / end frames, as a strip per shot (and overview sheets)
//    - flags near-uniform (blank) frames, e.g. a camera inside a wall
// 3. writes out/<slug>/review/manifest.json: each image with its shot, narration and what must be true
//
// Incremental rounds (after fixes):  node tools/review.mjs <slug> --only c8,r6,...
//   re-renders only those shots (ids, or plain shot indexes) plus the events that touch them, and keeps
//   every other image and manifest entry from the last full run. manifest.only lists what changed, so a
//   round-2 reviewer looks at just those. Refuses (asks for a full run) if the shot list or timing changed.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const slug = args.find(a => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--only');
const onlyArg = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
if (!slug || (args.includes('--only') && !onlyArg)) {
  console.error('usage: node tools/review.mjs <slug> [--only <shotId,shotId,...>]');
  process.exit(1);
}
const D = path.join(ROOT, 'public', 'episodes', slug);
const OUT = path.join(ROOT, 'out', slug, 'review');
const ep = JSON.parse(fs.readFileSync(path.join(D, 'episode.json'), 'utf8'));
const tmRaw = fs.readFileSync(path.join(D, 'timing.json'), 'utf8');
const tm = JSON.parse(tmRaw);
const fps = tm.fps || 30;
const timingHash = crypto.createHash('sha1').update(tmRaw).digest('hex').slice(0, 12);
const shotIds = ep.shots.map(s => s.id);

// --only: resolve shot ids to indexes and check the previous full run is still valid
let only = null, prev = null;
if (onlyArg) {
  const manifestPath = path.join(OUT, 'manifest.json');
  if (!fs.existsSync(manifestPath)) { console.error('--only needs a previous full run (no manifest.json). Run without --only first.'); process.exit(1); }
  prev = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (prev.timingHash !== timingHash || JSON.stringify(prev.shotIds) !== JSON.stringify(shotIds)) {
    console.error('timing.json or the shot list changed since the last full run (shot times/indexes moved). Run without --only.');
    process.exit(1);
  }
  only = new Set();
  for (const tok of onlyArg.split(',').map(s => s.trim()).filter(Boolean)) {
    const i = /^\d+$/.test(tok) ? +tok : shotIds.indexOf(tok);
    if (i < 0 || i >= shotIds.length) { console.error(`unknown shot "${tok}"`); process.exit(1); }
    only.add(i);
  }
}

// keep earlier reviewer reports: out/<slug>/review_history/reviewer_report_<time>.md
const prevReport = path.join(OUT, 'reviewer_report.md');
if (fs.existsSync(prevReport)) {
  const hist = path.join(ROOT, 'out', slug, 'review_history');
  fs.mkdirSync(hist, { recursive: true });
  fs.copyFileSync(prevReport, path.join(hist, `reviewer_report_${fs.statSync(prevReport).mtime.toISOString().replace(/[:.]/g, '-')}.md`));
}
if (!only) fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'raw'), { recursive: true });

// 1. audit (for events); errors are reported but don't stop the review frames
spawnSync('node', [path.join(ROOT, 'tools', 'qa.cjs'), 'audit', slug], { stdio: 'inherit', cwd: ROOT });
const audit = JSON.parse(fs.readFileSync(path.join(ROOT, 'out', slug, 'audit.json'), 'utf8'));

const frameAt = (shot, t) => {
  const s = tm.shots[shot];
  const f0 = Math.round(s.start * fps), f1 = Math.round((s.start + s.dur) * fps) - 1;
  return Math.max(f0, Math.min(f1, f0 + Math.round(t * fps)));
};
const vo = i => (ep.shots[i].vo || '').replace(/\[[^\]]*\]/g, '').trim();

const jobs = [], items = [];
let render = true; // false while listing files of shots --only skips (paths only, no render job)
const job = (name, frame) => {
  if (render) jobs.push({ out: `../${slug}/review/raw/${name}`, id: 'Episode', props: { slug, review: true }, frame });
  return path.join(OUT, 'raw', name + '.jpg');
};
// an event touches its shot, and a flow also the shot it comes from
const touches = e => !only || only.has(e.shot) || (e.kind === 'flow' && only.has(e.shot - 1));

// 2a. events
audit.events.forEach((e, k) => {
  if (!touches(e)) return;
  const label = `${String(k).padStart(2, '0')}_${e.kind}_s${e.shot}`;
  let times, expect;
  if (e.kind === 'swap') {
    times = [e.t - 0.3, e.t + 0.1, e.t + 0.6];
    expect = `SWAP ${e.what}. Frame 1: both characters at their start spots, the swapper blinking. Frames 2–3: each character stands on the OTHER's dashed marker. Exactly one name tag per marker. No two tags on one spot, no character left behind.`;
  } else if (e.kind === 'jump') {
    times = [e.t - 0.2, e.t + 0.05, e.t + 0.5];
    expect = `JUMP: ${e.what}. The move should read as intended (a swap/teleport/momentum gag), not as a glitch. Nobody overlaps after it.`;
  } else if (e.kind === 'flow') {
    const prevDur = tm.shots[e.shot - 1].dur;
    const pa = frameAt(e.shot - 1, prevDur - 0.05), b0 = frameAt(e.shot, 0.05), b1 = frameAt(e.shot, 1.0);
    const files = [job(label + '_a', pa), job(label + '_b', b0), job(label + '_c', b1)];
    items.push({ label, kind: 'flow', shot: e.shot, id: ep.shots[e.shot].id, files, vo: vo(e.shot),
      expect: `FLOW into shot ${e.shot}: the camera must continue smoothly from frame 1 (end of shot ${e.shot - 1}) through frames 2–3. No jump of the image between frames 1 and 2; characters keep their places.` });
    return;
  } else return; // plain cuts need no event frames
  const files = times.map((t, j) => job(`${label}_${'abc'[j]}`, frameAt(e.shot, t)));
  items.push({ label, kind: e.kind, shot: e.shot, id: ep.shots[e.shot].id, files, vo: vo(e.shot), expect });
});

// 2b. per shot: the first frame after the cut, then early / late / end frames (a strip), so cut-ins,
//     setups and late payoffs are all visible
const STRIP = [0, 0.3, 0.65, 0.93];
const stripT = s => STRIP.map(k => (k === 0 ? Math.min(0.04, s.dur / 2) : s.dur * k));
const strips = tm.shots.map((s, i) => {
  render = !only || only.has(i);
  return stripT(s).map((t, j) => job(`shot_${String(i).padStart(3, '0')}_${'abcd'[j]}`, frameAt(i, t)));
});
render = true;
const mids = strips.map(st => st[2]);
const rendered = new Set(jobs.map(j => path.join(OUT, 'raw', path.basename(j.out) + '.jpg')));
const isNew = f => rendered.has(f);

fs.writeFileSync(path.join(OUT, 'jobs.json'), JSON.stringify(jobs));
if (only) console.log(`--only: ${only.size} shots, ${items.length} events → ${jobs.length} frames`);
const r = spawnSync('node', [path.join(ROOT, 'tools', 'stills.cjs'), path.join(OUT, 'jobs.json')], { encoding: 'utf8', cwd: ROOT });
const fails = (r.stdout || '').split('\n').filter(l => l.startsWith('FAIL'));
if (fails.length) console.log(fails.join('\n'));

// 3. compose: events stacked vertically at 960 px; overview sheets of mid frames
const ff = (args) => spawnSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
for (const it of items) {
  const out = path.join(OUT, `${it.label}.jpg`);
  ff([...it.files.flatMap(f => ['-i', f]), '-filter_complex', `${it.files.map((_, j) => `[${j}]scale=960:-2[v${j}]`).join(';')};${it.files.map((_, j) => `[v${j}]`).join('')}vstack=inputs=${it.files.length}`, out]);
  it.image = path.relative(ROOT, out).replace(/\\/g, '/');
}
const shotImgs = strips.map((st, i) => {
  const out = path.join(OUT, `shot_${String(i).padStart(3, '0')}.jpg`);
  if (!only || only.has(i)) ff([...st.flatMap(f => ['-i', f]), '-filter_complex', `${st.map((_, j) => `[${j}]scale=480:-2[v${j}]`).join(';')};${st.map((_, j) => `[v${j}]`).join('')}hstack=inputs=${st.length}`, out]);
  return path.relative(ROOT, out).replace(/\\/g, '/');
});
const per = 12;
for (let p = 0; p * per < mids.length; p++) {
  const chunk = mids.slice(p * per, (p + 1) * per);
  if (only && !chunk.some(isNew)) continue; // overview sheet unchanged
  const out = path.join(OUT, `shots_${p + 1}.jpg`);
  const cols = 3;
  const rows = Math.ceil(chunk.length / cols);
  const pad = Array.from({ length: rows * cols - chunk.length }, () => chunk[chunk.length - 1]);
  const all = [...chunk, ...pad];
  ff([...all.flatMap(f => ['-i', f]), '-filter_complex',
    `${all.map((_, j) => `[${j}]scale=640:-2[v${j}]`).join(';')};${all.map((_, j) => `[v${j}]`).join('')}xstack=inputs=${all.length}:layout=${all.map((_, j) => `${(j % cols) * 640}_${Math.floor(j / cols) * 360}`).join('|')}`, out]);
}
// 2c. blank-frame check: a near-uniform picture (camera inside a wall or a prop, a missing set)
//     shows up as a tiny pixel spread after shrinking the frame to 32×18 greyscale
// --only: keep the old blank flags of images not re-rendered, re-check the new ones
const blank = only ? (prev.blank || []).filter(b => !rendered.has(path.join(ROOT, b.image))) : [];
for (const f of [...strips.flat(), ...items.flatMap(it => it.files)]) {
  if (only && !isNew(f)) continue;
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', f, '-vf', 'scale=32:18,format=gray', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 20 });
  const px = r.stdout && r.stdout.length ? [...r.stdout] : null;
  if (!px) continue;
  const mean = px.reduce((a, b) => a + b, 0) / px.length;
  const sd = Math.sqrt(px.reduce((a, b) => a + (b - mean) ** 2, 0) / px.length);
  if (sd < 8) blank.push({ image: path.relative(ROOT, f).replace(/\\/g, '/'), sd: +sd.toFixed(1) });
}
if (blank.length) console.log(`BLANK FRAMES (near-uniform picture — camera inside geometry?):\n${blank.map(b => `  ${b.image} (spread ${b.sd})`).join('\n')}`);

// --only: events of untouched shots come from the last run; the re-rendered ones replace theirs
const keptEvents = only ? prev.events.filter(e => !touches(e)) : [];
const events = [...keptEvents, ...items.map(({ files, ...rest }) => rest)]
  .sort((a, b) => a.shot - b.shot || a.label.localeCompare(b.label));
const manifest = {
  slug, generated: new Date().toISOString(),
  timingHash, shotIds,
  ...(only ? {
    only: [...only].sort((a, b) => a - b).map(i => ({ shot: i, id: shotIds[i] })),
    onlyNote: 'Incremental run: only the shots in "only" (and their events) were re-rendered. Everything else is unchanged from the last full run.',
    fullRun: prev.fullRun || prev.generated,
  } : { fullRun: new Date().toISOString() }),
  audit: { errors: audit.findings.filter(f => f.sev === 'error'), warnings: audit.findings.filter(f => f.sev === 'warn') },
  blank,
  events,
  shots: ep.shots.map((s, i) => ({
    shot: i, id: s.id, kind: s.kind === 'card' ? `card:${s.card}` : s.set, vo: vo(i), words: tm.shots[i].words,
    strip: shotImgs[i], times: stripT(tm.shots[i]).map(t => +t.toFixed(2)),
    full: strips[i].map(f => path.relative(ROOT, f).replace(/\\/g, '/')),
  })),
  overview: fs.readdirSync(OUT).filter(f => f.startsWith('shots_')).map(f => `out/${slug}/review/${f}`),
};
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
console.log(only
  ? `review frames (--only): ${only.size} shots, ${items.length} events re-rendered → out/${slug}/review/ (manifest.json, "only" lists them)`
  : `review frames: ${items.length} events, ${mids.length} shots → out/${slug}/review/ (manifest.json)`);
