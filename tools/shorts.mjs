// Vertical shorts from a finished episode (user rule, 2026-11-09): 4 per episode, ~60 s, 1080×1920, each a
// self-contained mini-story that stops on a cliffhanger, freezes the world, and lets the hero break the 4th
// wall to send the viewer to the full story on the channel.
//
//   node tools/shorts.mjs plan   <slug>          reads public/episodes/<slug>/shorts.json → shorts/plan_<n>.json (checks)
//   node tools/shorts.mjs voice  <slug> [n...]   ElevenLabs: the hero's CTA lines (COSTS CREDITS; ~0.45/char) → shorts/cta_<n>.mp3
//   node tools/shorts.mjs audio  <slug>          cuts the episode's own mix (no API) + freeze SFX + CTA voice → shorts/short_<n>.wav
//   node tools/shorts.mjs render <slug> [n...]   plan + audio + render → final/shorts/<episode title>/<n> - <short title>.mp4
//
// The list comes from episode(shorts=[...]) in the generator, or public/episodes/<slug>/shorts.json (wins):
//   [{ title, cta, from, to, drop?: [ids], shots?: [ids] (instead of from/to), stage?: id, stageAt?: s, cutAt?: s }]
//   from/to   first and last shot ids (inclusive); drop removes digressions inside the range
//   shots     an explicit list of shot ids, in order (pieces may jump around the episode)
//   cutAt     end the last shot early (seconds into it), on the cliffhanger beat
//   stage     the shot whose frozen world stages the 4th-wall break (default: the last piece with the hero in it);
//             pick one with the world around him (a street, a lake), not an empty void stage
//   stageAt   the moment of that shot to freeze (seconds; default its end, or the cut point)
//   cta       the hero's line, PT-BR, tied to this short's hook, ending with the channel CTA
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const [cmd, slug, ...rest] = process.argv.slice(2);
if (!['plan', 'voice', 'audio', 'render'].includes(cmd) || !slug) {
  console.error('usage: node tools/shorts.mjs <plan|voice|audio|render> <slug> [n...]');
  process.exit(2);
}
const D = path.join(ROOT, 'public', 'episodes', slug);
const SD = path.join(D, 'shorts');
fs.mkdirSync(SD, { recursive: true });
const read = f => JSON.parse(fs.readFileSync(path.join(D, f), 'utf8'));
const ep = read('episode.json'), tm = read('timing.json');
// shorts.json (the user's picks, or a later re-pick) wins over the generator's episode(shorts=[...])
const specs = fs.existsSync(path.join(D, 'shorts.json')) ? read('shorts.json') : ep.shorts || [];
if (!specs.length) throw new Error(`no shorts planned for ${slug}: add episode(shorts=[...]) in the generator or public/episodes/${slug}/shorts.json`);
const fps = ep.fps || 30;
const only = rest.filter(x => /^\d+$/.test(x)).map(Number);
const pick = (n) => !only.length || only.includes(n);
const idx = Object.fromEntries(ep.shots.map((s, i) => [s.id, i]));
const durOf = i => (Math.round((tm.shots[i].start + tm.shots[i].dur) * fps) - Math.round(tm.shots[i].start * fps)) / fps;
const hasHero = i => ep.shots[i].kind !== 'card' && (ep.shots[i].actors || []).some(a => a.id === 'hero' && !a.hidden);
const HERO_VOICE = '7u8qsX4HQsSHJ0f8xsQZ'; // João Pedro (house hero voice, tools/episode.mjs HOUSE_VOICES.hero)
const CHARS_PER_SEC = 14.5; // PT-BR at the hero's pace, for the CTA estimate before it is voiced
const TARGET = [55, 62]; // seconds (user rule: 60 s shorts)

function planOf(spec, n) {
  const ids = spec.shots || (() => {
    const a = idx[spec.from], b = idx[spec.to];
    if (a === undefined || b === undefined) throw new Error(`short ${n}: unknown from/to ${spec.from}/${spec.to}`);
    return ep.shots.slice(a, b + 1).map(s => s.id).filter(id => !(spec.drop || []).includes(id));
  })();
  const pieces = ids.map(id => {
    const i = idx[id];
    if (i === undefined) throw new Error(`short ${n}: unknown shot ${id}`);
    return { shot: i, from: 0, to: durOf(i) };
  });
  if (spec.cutAt !== undefined) pieces[pieces.length - 1].to = Math.min(pieces[pieces.length - 1].to, spec.cutAt);
  // merge consecutive whole shots? no: one piece per shot keeps the shot's own time base
  const last = pieces[pieces.length - 1];
  let stage = spec.stage !== undefined ? idx[spec.stage] : [...pieces].reverse().find(p => hasHero(p.shot))?.shot;
  if (stage === undefined || !hasHero(stage)) throw new Error(`short ${n}: no shot with the hero to stage the 4th-wall break (set "stage")`);
  const at = spec.stageAt !== undefined ? spec.stageAt : stage === last.shot ? Math.max(0, last.to - 1 / fps) : durOf(stage) - 1 / fps;
  // the CTA's length: the voiced line if it exists, else an estimate
  const ctaFile = path.join(SD, `cta_${n}.json`);
  const voiced = fs.existsSync(ctaFile) ? JSON.parse(fs.readFileSync(ctaFile, 'utf8')) : null;
  const lineDur = voiced ? voiced.dur : spec.cta.length / CHARS_PER_SEC;
  const freeze = { stage, at, hold: 0.6, lead: 0.45, lineDur: +lineDur.toFixed(2), tail: 0.9, ...(voiced ? { words: voiced.words } : {}) };
  const body = pieces.reduce((a, p) => a + p.to - p.from, 0);
  const total = +(body + freeze.hold + freeze.lead + freeze.lineDur + freeze.tail).toFixed(2);
  return { n, title: spec.title, cta: spec.cta, pieces, freeze, total, voiced: !!voiced };
}

function checks(plan, spec) {
  const out = [];
  if (plan.total < TARGET[0] || plan.total > TARGET[1]) out.push(`runs ${plan.total.toFixed(1)} s — aim for ${TARGET[0]}–${TARGET[1]} s (60 s rule): add or drop a shot`);
  const first = ep.shots[plan.pieces[0].shot];
  const opener = (first.vo || '').replace(/\[[^\]]*\]/g, '').trim();
  if (/^(e|mas|então|aí|depois|até|por isso|isso|esses?|essas?|aquilo|também)(?!\p{L})/iu.test(opener)) out.push(`opens with "${opener.split(' ').slice(0, 3).join(' ')}…" — a short must open cold, without a connective that needs context`);
  if (first.kind === 'card') out.push('opens on a 2D card — open on a 3D shot with a character (the hook)');
  if (!/canal/i.test(spec.cta)) out.push('the CTA line never sends the viewer to the channel ("entra no canal…")');
  if (spec.cta.length > 120) out.push(`the CTA line is ${spec.cta.length} chars — keep it under ~120 (≈ 8 s)`);
  return out;
}

const plans = specs.map((s, k) => planOf(s, k + 1));

if (cmd === 'plan' || cmd === 'audio' || cmd === 'render') {
  plans.forEach((p, k) => {
    if (!pick(p.n)) return;
    fs.writeFileSync(path.join(SD, `plan_${p.n}.json`), JSON.stringify(p, null, 1));
    const warn = checks(p, specs[k]);
    console.log(`short ${p.n}: ${p.total.toFixed(1)} s  ${p.pieces.length} shots  stage ${ep.shots[p.freeze.stage].id}  ${p.voiced ? 'CTA voiced' : 'CTA not voiced (captions only)'}  — ${p.title}`);
    warn.forEach(w => console.log('   ~ ' + w));
  });
}

if (cmd === 'voice') {
  const KEY = (fs.readFileSync(path.join(ROOT, '.env'), 'utf8').match(/ELEVENLABS_API_KEY=(.+)/) || [])[1]?.trim();
  if (!KEY) throw new Error('ELEVENLABS_API_KEY not set in .env');
  const todo = plans.filter(p => pick(p.n));
  const chars = todo.reduce((a, p) => a + p.cta.length + 11, 0);
  console.log(`voicing ${todo.length} CTA line(s), ${chars} chars (~${Math.round(chars * 0.45)} credits)`);
  for (const p of todo) {
    const text = (p.cta.trim().startsWith('[') ? '' : '[playful] ') + p.cta;
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${HERO_VOICE}/with-timestamps`, {
      method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model_id: 'eleven_v4', voice_settings: { stability: 0.4, similarity_boost: 0.8 } }),
    });
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
    const j = await res.json();
    fs.writeFileSync(path.join(SD, `cta_${p.n}.mp3`), Buffer.from(j.audio_base64, 'base64'));
    // words from the character timestamps (tags stripped)
    const a = j.alignment, words = [];
    let cur = '', t0 = 0, inTag = false;
    a.characters.forEach((ch, i) => {
      if (ch === '[') inTag = true;
      if (inTag) { if (ch === ']') inTag = false; return; }
      if (/\s/.test(ch)) { if (cur) words.push([cur, +t0.toFixed(3)]); cur = ''; return; }
      if (!cur) t0 = a.character_start_times_seconds[i];
      cur += ch;
    });
    if (cur) words.push([cur, +t0.toFixed(3)]);
    const clean = words.map(([w, t]) => [w.replace(/[.,!?…]+$/, ''), t]).filter(([w]) => w);
    const dur = a.character_end_times_seconds[a.character_end_times_seconds.length - 1];
    fs.writeFileSync(path.join(SD, `cta_${p.n}.json`), JSON.stringify({ text, dur, words: clean }));
    console.log(`  cta_${p.n}.mp3  ${dur.toFixed(2)} s`);
  }
  console.log('now: node tools/shorts.mjs render ' + slug);
}

function sh(c, a) {
  const r = spawnSync(c, a, { stdio: ['ignore', 'inherit', 'inherit'], cwd: ROOT });
  if (r.status !== 0) throw new Error(`${c} failed (${r.status})`);
}

/** The episode's finished soundtrack: mix.wav when it is still there, else the audio of the final mp4. */
function episodeAudio() {
  const mix = path.join(D, 'mix.wav');
  if (fs.existsSync(mix)) return mix;
  const norm = s => s.normalize('NFC').replace(/[?:*"<>|\\/]/g, '').trim().toLowerCase();
  const fin = fs.readdirSync(path.join(ROOT, 'final')).find(f => f.endsWith('.mp4') && norm(f.replace(/\.mp4$/, '')) === norm(ep.title));
  if (!fin) throw new Error(`no mix.wav and no final/<"${ep.title}">.mp4 to take the soundtrack from`);
  return path.join(ROOT, 'final', fin);
}

if (cmd === 'audio' || cmd === 'render') {
  const src = episodeAudio();
  const sfx = path.join(ROOT, 'public', 'audio', 'sfx_freeze.wav');
  if (!fs.existsSync(sfx)) sh(path.join(ROOT, '.venv', 'Scripts', 'python.exe'), [path.join(ROOT, 'tools', 'sfx', 'freeze.py')]);
  for (const p of plans) {
    if (!pick(p.n)) continue;
    const parts = [], labels = [];
    p.pieces.forEach((pc, k) => {
      const a = tm.shots[pc.shot].start + pc.from, b = tm.shots[pc.shot].start + pc.to, d = b - a;
      parts.push(`[0:a]atrim=start=${a.toFixed(3)}:end=${b.toFixed(3)},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,afade=t=in:d=0.008,afade=t=out:st=${Math.max(0, d - 0.02).toFixed(3)}:d=0.02[p${k}]`);
      labels.push(`[p${k}]`);
    });
    const body = p.pieces.reduce((s, pc) => s + pc.to - pc.from, 0);
    const ctaAt = body + p.freeze.hold + p.freeze.lead;
    const cta = path.join(SD, `cta_${p.n}.mp3`);
    const inputs = ['-i', src, '-i', sfx, ...(fs.existsSync(cta) ? ['-i', cta] : [])];
    const ms = s => Math.round(s * 1000);
    const fc = [
      ...parts,
      `${labels.join('')}concat=n=${labels.length}:v=0:a=1[body]`,
      `[1:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay=${ms(body)}|${ms(body)}[fz]`,
      ...(fs.existsSync(cta) ? [`[2:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=1.6,adelay=${ms(ctaAt)}|${ms(ctaAt)}[cta]`] : []),
      `[body][fz]${fs.existsSync(cta) ? '[cta]' : ''}amix=inputs=${fs.existsSync(cta) ? 3 : 2}:normalize=0:duration=longest,apad=whole_dur=${p.total},atrim=0:${p.total},loudnorm=I=-14:TP=-1:LRA=9[out]`,
    ];
    const out = path.join(SD, `short_${p.n}.wav`);
    sh('ffmpeg', ['-y', '-v', 'error', ...inputs, '-filter_complex', fc.join(';'), '-map', '[out]', '-ar', '48000', '-ac', '2', out]);
    console.log(`  ${path.relative(ROOT, out)}  ${p.total.toFixed(1)} s${fs.existsSync(cta) ? '' : '  (no CTA voice yet)'}`);
  }
}

if (cmd === 'render') {
  const dir = path.join(ROOT, 'final', 'shorts', ep.title.replace(/[?:*"<>|\\/]/g, '').trim());
  fs.mkdirSync(dir, { recursive: true });
  for (const p of plans) {
    if (!pick(p.n)) continue;
    const out = path.join(dir, `${p.n} - ${p.title.replace(/[?:*"<>|\\/]/g, '')}.mp4`);
    console.log(`rendering short ${p.n} → ${path.relative(ROOT, out)}`);
    // props go through a file: Windows' shell mangles inline JSON quotes
    const propsFile = path.join(ROOT, 'out', slug, `short_${p.n}_props.json`);
    fs.mkdirSync(path.dirname(propsFile), { recursive: true });
    fs.writeFileSync(propsFile, JSON.stringify({ slug, n: p.n }));
    const r = spawnSync('npx', ['remotion', 'render', 'Short', `"${out}"`, `--props="${propsFile}"`, '--gl=angle', '--crf=18', '--log=error'],
      { stdio: 'inherit', cwd: ROOT, shell: process.platform === 'win32' });
    if (r.status !== 0) throw new Error('render failed');
  }
}
