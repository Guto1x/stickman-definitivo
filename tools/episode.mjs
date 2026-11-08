// Episode voice pipeline.
//   node tools/episode.mjs check <slug>             validate vo text (tags, SSML, raw numbers) BEFORE spending credits — STORY_BLUEPRINT.md §6.9/§6.4
//   node tools/episode.mjs sections <slug>          split narration into ElevenLabs TTS sections → sections.json (+ prints the credit estimate)
//   node tools/episode.mjs voice <slug> [s01 s02…]   call ElevenLabs (with-timestamps) for sections lacking audio, trim/level/pace them → vo/sNN.wav
//   node tools/episode.mjs align <slug>             exact word timing from the TTS alignment → timing.json (every cut lands on its first word)
//   node tools/episode.mjs draft <slug>             estimated timing (180 wpm) for previewing before any voice exists
//   node tools/episode.mjs script <slug>            readable script.md (speakers, timestamps) to show the user before voicing
//   node tools/episode.mjs pace <slug>              re-level/re-pace downloaded sections without new ElevenLabs calls
// Files live in public/episodes/<slug>/.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

// .env isn't auto-loaded by node; pick up ELEVENLABS_API_KEY from ROOT/.env without a dotenv dependency.
(function loadEnv() {
  const f = path.join(ROOT, '.env');
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
})();

const [cmd, slug, ...rest] = process.argv.slice(2);
if (!cmd || !slug) {
  console.error('usage: node tools/episode.mjs <check|sections|voice|align|draft|script|pace> <slug> [...]');
  process.exit(1);
}
const DIR = path.join(ROOT, 'public', 'episodes', slug);
const read = f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
const write = (f, o) => fs.writeFileSync(path.join(DIR, f), JSON.stringify(o, null, 1));
const ep = read('episode.json');
const FPS = ep.fps || 30;
const DEFAULT_DIRECTION = '[calm]'; // user found "energetic, quick pace" too hyper (2026-10-28); eleven_v4 reads short delivery tags best, so keep this brief
// House voices (ElevenLabs, eleven_v4, PT-BR). Shots set `who`; episode.voices can add or override speakers.
// episode.json's voice.id always wins for the narrator — this is only the fallback.
export const HOUSE_VOICES = {
  narrator: 'u7N1p4OIOc6Fl7y72WE7', // Yuri — Natural Brazilian Narrator (user's pick, 2026-11-08)
  male: 'H2bV051FngNxkuTNROyc', // Eduardo — Brazilian Portuguese (young, confident): boys, men
  female: 'n2a9VtkZLl8j1FSXHsL7', // Sofia — Natural & Expressive (young, gentle): girls, women
};
const MAX_CHARS = 2500;
const CREDITS_PER_CHAR = 0.4; // measured 2026-11-08: 199 chars → 80 credits on eleven_v4 with Yuri. Varies by model/voice — treat as an estimate.

/** Spoken words only: drop [direction]/audio-tag brackets and <tags>. */
const spoken = s => (s || '').replace(/\[[^\]]*\]/g, ' ').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
// \p{L}/\p{N} (not a-z0-9) so accented PT letters (á é í ó ú ã õ â ê ô ü ç à) survive normalisation.
const norm = s => s.toLowerCase().replace(/[’']/g, "'").replace(/[^\p{L}\p{N}' ]+/gu, ' ').trim();
const toks = s => norm(spoken(s).replace(/[-–—]/g, ' ')).split(/\s+/).filter(Boolean);

/** Mechanical gate on `vo` text, run before any ElevenLabs call: catches the unambiguous mistakes from
 *  STORY_BLUEPRINT.md §6.9 (tags, SSML) and §6.4 (numbers) that a human/agent could otherwise miss and pay
 *  credits for. Does NOT judge tag placement, descriptiveness or voice-match — those need a reader's
 *  judgment and stay in STORY_BLUEPRINT.md §9's checklist, self-certified before the credit checkpoint. */
function checkVoiceText(episode) {
  const errors = [];
  episode.shots.forEach((shot, i) => {
    const vo = shot.vo;
    if (!vo) return;
    const where = `shot #${i}${shot.id ? ` (${shot.id})` : ''}`;
    let depth = 0;
    for (const ch of vo) {
      if (ch === '[') depth++;
      else if (ch === ']') { if (depth === 0) errors.push(`${where}: stray ']' with no matching '[' in vo`); else depth--; }
    }
    if (depth > 0) errors.push(`${where}: unclosed '[' in vo (${depth} still open) — ElevenLabs will read the bracket text aloud instead of treating it as a tag`);
    const angle = vo.match(/<[^>]*>/g);
    if (angle) errors.push(`${where}: SSML/HTML-like tag ${angle.join(', ')} in vo — eleven_v4 doesn't support <break> or any SSML; use punctuation or [tags] instead (STORY_BLUEPRINT.md §6.9)`);
    const digits = spoken(vo).match(/\d+/g); // digits outside [tags] only — a tag like a [9mm gunshot] sound cue is fine
    if (digits) errors.push(`${where}: raw digit(s) ${digits.join(', ')} in vo — spell numbers, dates, money, time and abbreviations out for narration (STORY_BLUEPRINT.md §6.4), e.g. "365" → "trezentos e sessenta e cinco"`);
  });
  return errors;
}

function buildSections() {
  const sections = [];
  let cur = null, breakNext = false, lastWho = null;
  ep.shots.forEach((shot, i) => {
    const text = spoken(shot.vo);
    if (!text) {
      breakNext = true;
      return;
    }
    const who = shot.who || 'narrator';
    if (who !== lastWho) breakNext = true; // every speaker change starts a new single-speaker section
    lastWho = who;
    if (!cur || breakNext || cur.chars + shot.vo.length > MAX_CHARS) {
      cur = { id: `s${String(sections.length + 1).padStart(2, '0')}`, shots: [], parts: [], chars: 0 };
      sections.push(cur);
      breakNext = false;
    }
    cur.shots.push(i);
    cur.parts.push({ who, text: shot.vo.trim() });
    cur.chars += shot.vo.length + 1;
    if (shot.hold > 0) breakNext = true;
  });
  const voices = { ...HOUSE_VOICES, narrator: ep.voice.id || HOUSE_VOICES.narrator, ...(ep.voices || {}) };
  const direction = ep.voice.direction ?? DEFAULT_DIRECTION;
  return sections.map(s => {
    const who = s.parts[0].who; // one speaker per section (see breakNext above)
    const first = s.parts[0].text;
    const text = (first.startsWith('[') || who !== 'narrator' || !direction ? '' : direction + ' ') + s.parts.map(p => p.text).join(' ');
    return { id: s.id, shots: s.shots, voice_id: voices[who], model: ep.voice.model || 'eleven_v4', text, file: null };
  });
}

function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 1 << 30, ...opts });
  if (r.status !== 0) {
    console.error(r.stderr);
    process.exit(1);
  }
  return r;
}

/** One ElevenLabs call, text in = alignment out: character-accurate timestamps for exactly the text sent,
 *  so there is nothing to transcribe or fuzzy-match afterwards (that whole class of bug is gone with Whisper). */
// Retries only answers that mean "nothing was generated, try later": 429 (too many concurrent requests /
// rate limit) and 5xx. Any other error (bad key, bad voice, out of credits) fails at once.
async function synthesize(voiceId, text, model, tag = '') {
  if (!process.env.ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY not set (expected in .env at the project root)');
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`, {
      method: 'POST',
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        model_id: model,
        voice_settings: { stability: ep.voice.stability ?? 0.5, similarity_boost: ep.voice.similarityBoost ?? 0.8 },
      }),
    });
    if (res.ok) return res.json(); // { audio_base64, alignment: {characters, character_start_times_seconds, character_end_times_seconds}, normalized_alignment }
    const body = await res.text();
    if ((res.status === 429 || res.status >= 500) && attempt < 6) {
      const wait = Math.min(30, +(res.headers.get('retry-after') || 0) || 2 ** attempt) * 1000;
      console.log(`${tag}: ElevenLabs ${res.status}, retry ${attempt}/5 in ${wait / 1000} s`);
      await new Promise(r => setTimeout(r, wait));
      continue;
    }
    throw new Error(`ElevenLabs TTS failed ${res.status}: ${body}`);
  }
}

function processVoice(src, dst, tempoOverride) {
  const tempo = tempoOverride ?? ep.voice.tempo ?? 1.0;
  const maxPause = ep.voice.maxPause ?? 0.45;
  const af = [
    'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03',
    'areverse', 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06', 'areverse',
    `silenceremove=stop_periods=-1:stop_duration=${maxPause}:stop_threshold=-42dB:stop_silence=${maxPause}`,
    ...(tempo !== 1 ? [`atempo=${tempo}`] : []),
    'loudnorm=I=-16:TP=-1.5:LRA=9',
    'afade=t=in:d=0.01',
  ].join(',');
  sh('ffmpeg', ['-y', '-v', 'error', '-i', src, '-af', af, '-ar', '48000', '-ac', '1', dst]);
}

/** Keep narration pace consistent: measure the section, then time-stretch (pitch kept) toward targetWpm,
 *  both ways but only gently (voice.tempoRange, default ±10%: bigger stretches sound rushed or dragged).
 *  Short lines (< 12 words, e.g. "Cara.") are left as read. */
function pace(s) {
  const mp3 = path.join(DIR, 'vo', `${s.id}.mp3`), wav = path.join(DIR, 'vo', `${s.id}.wav`);
  processVoice(mp3, wav, 1.0);
  const words = toks(s.text).length;
  const wpm = words / (durOf(wav) / 60);
  const target = ep.voice.targetWpm ?? 175;
  const [lo, hi] = ep.voice.tempoRange ?? [0.9, 1.1];
  const tempo = ep.voice.tempo ?? (words < 12 ? 1 : Math.min(hi, Math.max(lo, target / wpm)));
  if (Math.abs(tempo - 1) > 0.005) processVoice(mp3, wav, tempo);
  s.tempo = +tempo.toFixed(3);
  console.log(`${s.id}: ${durOf(wav).toFixed(2)} s  (${wpm.toFixed(0)} wpm read → ×${tempo.toFixed(2)} → ${(wpm * tempo).toFixed(0)} wpm)`);
}

const durOf = f => parseFloat(sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', f]).stdout);

/** Silence intervals [{start,end}] in a file, via ffmpeg's own detector — used to mirror what
 *  processVoice's silenceremove filters will trim, so word times can be remapped onto the final audio. */
function detectSilences(file, dB, minDur) {
  const out = sh('ffmpeg', ['-v', 'info', '-i', file, '-af', `silencedetect=n=${dB}dB:d=${minDur}`, '-f', 'null', '-']).stderr;
  const starts = [...out.matchAll(/silence_start:\s*([\d.]+)/g)].map(m => parseFloat(m[1]));
  const ends = [...out.matchAll(/silence_end:\s*([\d.]+)/g)].map(m => parseFloat(m[1]));
  return starts.map((start, i) => ({ start, end: ends[i] ?? start }));
}

/** How processVoice's trim filters reshape the raw ElevenLabs audio's timeline: how much silence came off
 *  the head (same -45dB/0.03 the start filter uses), and every internal pause clipped down to maxPause
 *  (same -42dB/maxPause the stop filter uses). Mirrors the ffmpeg filter chain in processVoice() above —
 *  change one, change the other. */
function buildTimeMap(raw, maxPause) {
  const dur = durOf(raw);
  const lead = detectSilences(raw, -45, 0.03).find(s => s.start < 0.02);
  const T_lead = lead ? Math.max(0, lead.end - lead.start - 0.03) : 0;
  const clips = [];
  for (const s of detectSilences(raw, -42, maxPause)) {
    if (s.start < T_lead + 0.05 || s.end > dur - 0.05) continue; // part of the lead/trail trim, not a mid-clip
    const segDur = s.end - s.start;
    if (segDur > maxPause + 0.01) clips.push({ start: s.start - T_lead, end: s.end - T_lead, removed: segDur - maxPause });
  }
  return { T_lead, clips };
}

/** Raw (pre-trim, pre-tempo) ElevenLabs time → final processed-wav time. */
function mapTime(map, tRaw, tempo) {
  let t = Math.max(0, tRaw - map.T_lead), removed = 0;
  for (const c of map.clips) {
    if (t >= c.end) removed += c.removed;
    else if (t > c.start) removed += Math.max(0, t - c.start - (c.end - c.start - c.removed));
  }
  return Math.max(0, t - removed) / tempo;
}

/** Word list with raw timestamps straight from the ElevenLabs character alignment: no transcription, so no
 *  ASR drift, no "365"/"dodge balls" mismatches, and no unmatched words — we group the exact characters of
 *  the exact text we sent, skipping [bracket]/<tag> spans the same way `spoken()` does for the script. */
function wordsFromAlignment(alignment) {
  const chars = alignment.characters, starts = alignment.character_start_times_seconds, ends = alignment.character_end_times_seconds;
  const heard = chars.join('');
  const skip = new Array(chars.length).fill(false);
  for (const re of [/\[[^\]]*\]/g, /<[^>]*>/g]) {
    let m; while ((m = re.exec(heard))) for (let i = m.index; i < m.index + m[0].length; i++) skip[i] = true;
  }
  const words = [];
  let cur = null;
  for (let i = 0; i < chars.length; i++) {
    const isWord = !skip[i] && /\S/.test(chars[i]) && chars[i] !== '-' && chars[i] !== '–' && chars[i] !== '—';
    if (isWord) {
      cur ??= { t0: starts[i], chars: [] };
      cur.t1 = ends[i];
      cur.chars.push(chars[i]);
    } else if (cur) {
      words.push({ w: norm(cur.chars.join('')), t0: cur.t0 });
      cur = null;
    }
  }
  if (cur) words.push({ w: norm(cur.chars.join('')), t0: cur.t0 });
  return words.filter(w => w.w);
}

/** Lay shots and sections on the timeline. sectionDur[s] = audio length; shotOffset[i] = first-word time within its section. */
function layout(sections, sectionDur, shotOffset) {
  const LEAD = 0.12; // cut this much before the shot's first word
  const shots = ep.shots.map(() => ({ start: 0, dur: 0, section: null }));
  const secOf = {};
  sections.forEach((s, k) => s.shots.forEach(i => (secOf[i] = k)));
  const secStart = [];
  let cursor = 0.3;
  ep.shots.forEach((shot, i) => {
    const k = secOf[i];
    if (k === undefined) {
      shots[i] = { start: cursor, dur: shot.hold || 1.5, section: null };
      cursor += shots[i].dur;
      return;
    }
    const s = sections[k];
    const firstInSec = s.shots[0] === i;
    if (firstInSec) secStart[k] = cursor + 0.15;
    const start = firstInSec ? cursor : Math.max(shots[i - 1].start + 0.5, secStart[k] + shotOffset[i] - LEAD);
    shots[i] = { start, dur: 0, section: k };
    if (s.shots[s.shots.length - 1] === i) cursor = secStart[k] + sectionDur[k] + Math.max(shot.hold || 0, 0.3);
    else cursor = start;
  });
  // snap cuts to frame boundaries first, so start + dur of one shot is exactly the next start (no black frame)
  const snap = s => Math.round(s * FPS) / FPS;
  shots.forEach(s => (s.start = snap(s.start)));
  ep.shots.forEach((_, i) => {
    const next = i + 1 < shots.length ? shots[i + 1].start : snap(cursor + 0.4);
    shots[i].dur = +(next - shots[i].start).toFixed(4);
    shots[i].start = +shots[i].start.toFixed(4);
  });
  const total = +(shots[shots.length - 1].start + shots[shots.length - 1].dur).toFixed(3);
  return { fps: FPS, total, shots, sections: sections.map((s, k) => ({ file: `episodes/${slug}/vo/${s.id}.wav`, start: +(secStart[k] ?? 0).toFixed(3), dur: +sectionDur[k].toFixed(3) })) };
}

if (cmd === 'check') {
  const errors = checkVoiceText(ep);
  if (errors.length) {
    console.error(`${errors.length} problem(s) — fix before running 'voice' (this is what 'voice' itself refuses on, see below):`);
    errors.forEach(e => console.error('  - ' + e));
    process.exit(1);
  }
  console.log(`vo text check: 0 problems, ${ep.shots.filter(s => s.vo).length} shots with narration.`);
  console.log(`Mechanical only (brackets, SSML, raw numbers) — still self-certify the judgment items in STORY_BLUEPRINT.md §9 (tag placement, descriptiveness, voice match) before the credit checkpoint.`);
} else if (cmd === 'sections') {
  const secs = buildSections();
  const old = fs.existsSync(path.join(DIR, 'sections.json')) ? read('sections.json') : [];
  // keep downloaded audio for sections whose text didn't change
  secs.forEach(s => {
    const o = old.find(x => x.id === s.id && x.text === s.text);
    if (o) Object.assign(s, { file: o.file, tempo: o.tempo });
  });
  write('sections.json', secs);
  const bytes = secs.reduce((a, s) => a + Buffer.byteLength(s.text), 0);
  console.log(`${secs.length} sections, ${bytes} chars (~${Math.round(bytes * CREDITS_PER_CHAR)} ElevenLabs credits, estimate), ${ep.shots.length} shots`);
  secs.forEach(s => console.log(`${s.id}  shots ${s.shots[0]}–${s.shots[s.shots.length - 1]}  ${Buffer.byteLength(s.text)} B  ${s.file ? 'HAS AUDIO' : 'needs TTS'}`));
  const checkErrors = checkVoiceText(ep);
  if (checkErrors.length) {
    console.log(`\n${checkErrors.length} vo text problem(s) — run 'node tools/episode.mjs check ${slug}' for the full list, and fix before 'voice' (it will refuse otherwise):`);
    checkErrors.slice(0, 5).forEach(e => console.log('  - ' + e));
  }
} else if (cmd === 'voice') {
  const checkErrors = checkVoiceText(ep);
  if (checkErrors.length) {
    console.error(`Refusing to spend ElevenLabs credits: ${checkErrors.length} problem(s) in vo text (run 'node tools/episode.mjs check ${slug}' for the full list):`);
    checkErrors.forEach(e => console.error('  - ' + e));
    process.exit(1);
  }
  const secs = read('sections.json');
  fs.mkdirSync(path.join(DIR, 'vo'), { recursive: true });
  const ids = rest.length ? rest : secs.filter(s => !s.file || !fs.existsSync(path.join(DIR, s.file))).map(s => s.id);
  ids.forEach(id => { if (!secs.some(x => x.id === id)) throw new Error('unknown section ' + id); });
  // a few calls at once (voice.parallel, default 3); sections.json is saved after EVERY finished section,
  // so a crash or a failed call never loses (and never re-bills) the audio already paid for
  const parallel = Math.max(1, ep.voice.parallel ?? 3);
  const t0 = Date.now();
  let next = 0;
  const failed = [];
  const worker = async () => {
    while (next < ids.length) {
      const id = ids[next++];
      const s = secs.find(x => x.id === id);
      console.log(`${s.id}: calling ElevenLabs (${Buffer.byteLength(s.text)} chars, voice ${s.voice_id}, ${s.model})…`);
      try {
        const r = await synthesize(s.voice_id, s.text, s.model, s.id);
        fs.writeFileSync(path.join(DIR, 'vo', `${s.id}.mp3`), Buffer.from(r.audio_base64, 'base64'));
        fs.writeFileSync(path.join(DIR, 'vo', `${s.id}.align.json`), JSON.stringify(r.alignment));
        Object.assign(s, { file: `vo/${s.id}.wav` });
        pace(s);
        write('sections.json', secs);
      } catch (e) {
        failed.push(s.id);
        console.error(`${s.id}: FAILED — ${e.message}`);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(parallel, ids.length) }, worker));
  write('sections.json', secs);
  console.log(`voice: ${ids.length - failed.length}/${ids.length} sections in ${((Date.now() - t0) / 1000).toFixed(0)} s (parallel ${parallel})`);
  if (failed.length) {
    console.error(`failed: ${failed.join(' ')} — fix the cause, then re-run 'voice ${slug}' (only these get a new call)`);
    process.exit(1);
  }
} else if (cmd === 'pace') {
  // re-level and re-pace already-downloaded sections (no new ElevenLabs calls)
  const secs = read('sections.json');
  secs.filter(s => s.file && fs.existsSync(path.join(DIR, 'vo', `${s.id}.mp3`))).forEach(pace);
  write('sections.json', secs);
} else if (cmd === 'align') {
  const secs = read('sections.json');
  const missing = secs.filter(s => !s.file || !fs.existsSync(path.join(DIR, s.file)) || !fs.existsSync(path.join(DIR, 'vo', `${s.id}.align.json`)));
  if (missing.length) {
    console.error('sections without audio/alignment: ' + missing.map(s => s.id).join(' '));
    process.exit(1);
  }
  const maxPause = ep.voice.maxPause ?? 0.45;
  const sectionDur = [], shotOffset = {}, allWords = [];
  for (const [k, s] of secs.entries()) {
    const mp3 = path.join(DIR, 'vo', `${s.id}.mp3`), wav = path.join(DIR, s.file);
    const alignment = JSON.parse(fs.readFileSync(path.join(DIR, 'vo', `${s.id}.align.json`), 'utf8'));
    const map = buildTimeMap(mp3, maxPause);
    const tempo = s.tempo ?? 1;
    const words = wordsFromAlignment(alignment).map(w => ({ w: w.w, t: mapTime(map, w.t0, tempo) }));
    sectionDur[k] = durOf(wav);
    const sw = [], owner = [];
    s.shots.forEach(i => toks(ep.shots[i].vo).forEach(w => { sw.push(w); owner.push(i); }));
    if (words.length !== sw.length) {
      console.log(`${s.id}: WARNING word count mismatch — script has ${sw.length}, ElevenLabs voiced ${words.length} (mispronunciation or text drift; re-run 'sections' then 'voice' if the script changed)`);
    }
    const T = sw.map((_, j) => (words[j] ?? words[words.length - 1] ?? { t: 0 }).t);
    s.shots.forEach(i => (shotOffset[i] = T[owner.indexOf(i)]));
    allWords.push({ section: s.id, words: sw.map((w, j) => ({ w, t: +T[j].toFixed(3), shot: owner[j] })) });
    console.log(`${s.id}: ${sectionDur[k].toFixed(2)} s, ${sw.length} words`);
  }
  const timing = layout(secs, sectionDur, shotOffset);
  attachWords(timing, secs, allWords.map(x => x.words));
  write('timing.json', timing);
  write('words.json', allWords);
  report(timing);
} else if (cmd === 'draft') {
  const secs = buildSections();
  const WPS = 3.0;
  const sectionDur = secs.map(s => s.shots.reduce((a, i) => a + toks(ep.shots[i].vo).length / WPS + 0.15, 0));
  const shotOffset = {};
  secs.forEach(s => {
    let acc = 0;
    s.shots.forEach(i => { shotOffset[i] = acc; acc += toks(ep.shots[i].vo).length / WPS + 0.15; });
  });
  const timing = layout(secs, sectionDur, shotOffset);
  timing.draft = true;
  attachWords(timing, secs, secs.map(sec => {
    const out = [];
    sec.shots.forEach(i => { let acc = shotOffset[i]; toks(ep.shots[i].vo).forEach(w => { out.push({ w, t: acc, shot: i }); acc += 1 / WPS; }); });
    return out;
  }));
  write('timing.json', timing);
  report(timing);
} else if (cmd === 'script') {
  // readable script for review: one line per shot, speaker names from the cast, times from timing.json
  const tm = fs.existsSync(path.join(DIR, 'timing.json')) ? read('timing.json') : null;
  const castNames = { ...(ep.cast || {}) };
  const out = [`# ${ep.title}`, '', tm ? `${tm.draft ? 'Draft timing' : 'Voiced timing'}: ${Math.floor(tm.total / 60)}:${String(Math.round(tm.total % 60)).padStart(2, '0')}` : '', ''];
  ep.shots.forEach((shot, i) => {
    if (!shot.vo) return;
    const talker = (shot.actors || []).find(a => a.talk);
    const name = shot.who ? (talker ? (castNames[talker.id]?.name || talker.id) : shot.who).toUpperCase() : talker?.id === 'hero' ? 'YOU' : null;
    const dir = ep.voice.direction ?? DEFAULT_DIRECTION;
    const line = shot.vo.replace(new RegExp('^' + dir.replace(/[[\]()]/g, '\\$&') + '\\s*'), '').replace(/\[([^\]]*)\]/g, '*[$1]*').trim();
    const ts = tm ? `\`${Math.floor(tm.shots[i].start / 60)}:${String(Math.floor(tm.shots[i].start % 60)).padStart(2, '0')}\` ` : '';
    out.push(name ? `${ts}> **${name}:** ${line}` : `${ts}${line}`, '');
  });
  fs.writeFileSync(path.join(DIR, 'script.md'), out.join('\n'));
  console.log(`script.md: ${ep.shots.filter(s => s.vo).length} lines`);
} else {
  console.error('unknown command ' + cmd);
  process.exit(1);
}

/** Per-shot word list [word, seconds-into-shot] so specs can cue effects on words ("@blink#2+0.1"). */
function attachWords(timing, secs, wordsPerSection) {
  secs.forEach((sec, k) => {
    const s0 = timing.sections[k].start;
    for (const w of wordsPerSection[k]) {
      const sh = timing.shots[w.shot];
      (sh.words ||= []).push([w.w, +(s0 + w.t - sh.start).toFixed(3)]);
    }
  });
}

function report(timing) {
  const short = timing.shots.map((s, i) => [i, s.dur]).filter(([, d]) => d < 0.8);
  console.log(`total ${timing.total.toFixed(1)} s (${(timing.total / 60).toFixed(2)} min), ${timing.shots.length} shots, avg ${(timing.total / timing.shots.length).toFixed(2)} s/shot`);
  if (short.length) console.log('very short shots (merge or extend): ' + short.map(([i, d]) => `#${i} ${d}s`).join(', '));
}
