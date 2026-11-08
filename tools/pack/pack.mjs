// Packs the production system into "project instructions.md": one file that rebuilds it in an empty folder
// when the user types "start" in a fresh Claude Code chat. It holds the start procedure (tools/pack/header.md),
// the extractor (tools/pack/extract.mjs) and every source, doc and data file plus Claude's project memory,
// verbatim or base64, each with its SHA-256. No videos, episodes or render outputs: the copy starts as an empty
// channel, set up before ElevenLabs (voice) and Fish Audio (optional, fish-mode thumbnails only) are connected
// (tools/pack/fresh/ adds the first-connect checklists and notes for both).
//   node tools/pack/pack.mjs [--out <file>] [--memory <dir>]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url)).replace(/[\\/]+$/, '');
const HERE = path.join(ROOT, 'tools', 'pack');
const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const OUT_NAME = 'project instructions.md';
const out = path.resolve(ROOT, opt('--out') ?? OUT_NAME);
// Claude Code keeps per-project memory under ~/.claude/projects/<project path with every non-alphanumeric as "-">/memory;
// a copy installed without one keeps it in docs/memory/ (see header.md step 4).
const DOCS_MEMORY = path.join(ROOT, 'docs', 'memory');
const memDir = opt('--memory') ?? (fs.existsSync(path.join(DOCS_MEMORY, 'MEMORY.md'))
  ? DOCS_MEMORY
  : path.join(os.homedir(), '.claude', 'projects', ROOT.replace(/[^a-zA-Z0-9]/g, '-'), 'memory'));

// What ships. Generated media, episodes and installs stay behind; the copy rebuilds what it needs.
const SKIP_DIRS = new Set(['node_modules', '.venv', '.git', '.bootstrap', '.claude', 'out', 'voice_auditions', '__pycache__']);
const FIXTURE_EPISODE = 'pipetest'; // the compositions' default slug; ships as JSON only (no audio)
const EXAMPLE_BRIEF = 'thumbnails/swap-pilot/brief.json'; // CLAUDE.md points at it as the brief format
const KEEP_EMPTY = ['final/archive', 'final/thumbnails'];
function keep(rel) {
  if (rel === OUT_NAME) return false;
  if (rel.startsWith('docs/memory/') && path.resolve(memDir) === DOCS_MEMORY) return false; // ships as @memory/ instead
  if (rel.startsWith('final/')) return rel === 'final/README.md';
  if (rel.startsWith('public/episodes/')) return rel.startsWith(`public/episodes/${FIXTURE_EPISODE}/`) && /^[^/]+\.json$/.test(rel.split(`${FIXTURE_EPISODE}/`)[1]);
  if (rel.startsWith('public/audio/')) return !rel.endsWith('.wav'); // demo mixes come from their sfx scripts
  if (/^thumbnails\/[^/]+\//.test(rel) && !rel.startsWith('thumbnails/refs/')) return rel === EXAMPLE_BRIEF;
  return true;
}

// Changes that make the copy a fresh, key-less install. Idempotent, so a copy can repack itself.
const MEMORY_POINTER = /^Project memory \(the user's preferences and decisions\) lives in docs\/memory\/.*\r?\n(\r?\n)?/m;
const ELEVEN_NOTE = '> **ElevenLabs is not connected yet.** This copy was set up from `project instructions.md` without a working `ELEVENLABS_API_KEY`. The first time one is added to `.env`, run `docs/ELEVENLABS_SETUP.md` before any voice work; its last step deletes this note. Until then, take episodes as far as the draft preview. (Fish Audio is separate and optional — only needed for `fish`-mode thumbnails; see `docs/FISH_SETUP.md`.)\n';
const eolOf = t => (t.includes('\r\n') ? '\r\n' : '\n');
const TRANSFORM = {
  'CLAUDE.md': t => {
    t = t.replace(MEMORY_POINTER, '');
    return t.includes('**ElevenLabs is not connected yet.**') ? t : t.replace(/^(# [^\r\n]*\r?\n)/, h => h + eolOf(t) + ELEVEN_NOTE.replace(/\n/g, eolOf(t)));
  },
  // the episode table lists finished videos, which don't ship: keep its header rows only
  'final/README.md': t => {
    const ls = t.split('\n'), at = ls.findIndex(l => l.startsWith('## Episodes'));
    let rows = 0;
    return ls.filter((l, i) => !(at >= 0 && i > at && l.startsWith('|') && ++rows > 2)).join('\n');
  },
};
const EXTRA = [
  ['docs/ELEVENLABS_SETUP.md', path.join(HERE, 'fresh', 'ELEVENLABS_SETUP.md')],
  ['@memory/project-elevenlabs-pending.md', path.join(HERE, 'fresh', 'project-elevenlabs-pending.md')],
  ['docs/FISH_SETUP.md', path.join(HERE, 'fresh', 'FISH_SETUP.md')],
  ['@memory/project-fish-pending.md', path.join(HERE, 'fresh', 'project-fish-pending.md')],
  // the /stickman command; .claude/ itself is skipped, so the local copy (which adds a demo shortcut) never ships
  ['.claude/commands/stickman.md', path.join(HERE, 'fresh', 'stickman.md')],
  // the round-2+ review subagent, pinned to a smaller model (CLAUDE.md step 7.4)
  ['.claude/agents/revisor-verificacao.md', path.join(ROOT, '.claude', 'agents', 'revisor-verificacao.md')],
];
const MEMORY_LINES = [
  '- [ElevenLabs pending](project-elevenlabs-pending.md) — no working ELEVENLABS_API_KEY at setup; run docs/ELEVENLABS_SETUP.md once one is added to .env\n',
  '- [Fish Audio pending](project-fish-pending.md) — Fish MCP NOT connected at setup; run docs/FISH_SETUP.md the first time Fish tools appear, only needed for fish-mode thumbnails\n',
];

const files = new Map(); // rel → Buffer
const dirs = [];
(function walk(dir) {
  const ents = fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true });
  const relDir = dir.replace(/\\/g, '/');
  if (relDir && (ents.length === 0 || KEEP_EMPTY.includes(relDir))) dirs.push(relDir);
  for (const e of ents) {
    const rel = (dir ? `${dir}/` : '') + e.name;
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(rel); }
    else if (e.isFile() && keep(rel.replace(/\\/g, '/'))) files.set(rel.replace(/\\/g, '/'), fs.readFileSync(path.join(ROOT, rel)));
  }
})('');
for (const [rel, fn] of Object.entries(TRANSFORM)) if (files.has(rel)) files.set(rel, Buffer.from(fn(files.get(rel).toString('utf8'))));
for (const [rel, src] of EXTRA) files.set(rel, fs.readFileSync(src));
if (fs.existsSync(memDir)) {
  for (const f of fs.readdirSync(memDir).filter(f => f.endsWith('.md'))) {
    let b = fs.readFileSync(path.join(memDir, f));
    if (f === 'MEMORY.md') {
      const t = b.toString('utf8'), e = eolOf(t);
      const add = MEMORY_LINES.filter(l => !t.includes(l.match(/\(([^)]+)\)/)[0])).map(l => l.replace(/\n/g, e));
      if (add.length) b = Buffer.from(t.replace(/(\r?\n)*$/, e) + add.join(''));
    }
    files.set(`@memory/${f}`, b);
  }
} else console.warn(`no memory folder at ${memDir}: packing without memory (pass --memory <dir>)`);

const BIN_EXT = /\.(png|jpe?g|webp|gif|ico|mp3|wav|flac|mp4|mov|webm|pyc|woff2?|ttf|otf|zip|gz)$/i;
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
/** Text verbatim when it survives the round trip (strict UTF-8, uniform line endings, no marker-like lines), else base64. */
function encode(rel, buf) {
  const b64 = () => ({ enc: 'base64', body: buf.toString('base64').match(/.{1,76}/g) ?? [''], noeol: false });
  if (BIN_EXT.test(rel) || buf.includes(0)) return b64();
  let t = buf.toString('utf8');
  if (!Buffer.from(t, 'utf8').equals(buf)) return b64();
  let enc = 'text';
  if (t.includes('\r')) {
    const lf = t.replace(/\r\n/g, '\n');
    if (lf.includes('\r') || /(^|[^\r])\n/.test(t)) return b64(); // lone CR or mixed endings
    t = lf;
    enc = 'text-crlf';
  }
  const noeol = !t.endsWith('\n');
  const body = (noeol ? t : t.slice(0, -1)).split('\n');
  if (body.some(l => l.startsWith('@@@@ ') || l.startsWith('~~~~~~~~~~~~~~~~'))) return b64();
  return { enc, body, noeol };
}

const order = [...files.keys()].sort((a, b) => (BIN_EXT.test(a) - BIN_EXT.test(b)) || (a < b ? -1 : 1));
const payload = ['~~~~~~~~~~~~~~~~ payload', '@@@@ PAYLOAD BEGIN', ...dirs.sort().map(d => `@@@@ DIR ${d}`)];
const groups = new Map();
for (const rel of order) {
  const buf = files.get(rel);
  const { enc, body, noeol } = encode(rel, buf);
  payload.push(`@@@@ FILE ${rel} | ${enc} | ${buf.length} | ${sha(buf)}${noeol ? ' | noeol' : ''}`, ...body, '@@@@ END');
  const g = rel.startsWith('@memory/') ? '@memory/' : rel.includes('/') ? rel.split('/')[0] + '/' : '(root)';
  const s = groups.get(g) ?? { n: 0, bytes: 0, bin: 0 };
  s.n++; s.bytes += buf.length; s.bin += enc === 'base64' ? 1 : 0;
  groups.set(g, s);
}
payload.push('@@@@ PAYLOAD END', '~~~~~~~~~~~~~~~~', '');

const WHAT = {
  '(root)': '`CLAUDE.md` (the project rules), `HOW_TO_USE.md`, `package.json`, `package-lock.json`, Remotion and TypeScript config',
  'src/': 'the engine (rig, Stickman, actors, cameras, materials, effects), sets, cards, overlays, the episode pipeline and its self-tests',
  'tools/': 'build, episode, QA, review, stills, thumbnail and pack tools; Python sound design, music and idea tools',
  'docs/': 'style bible, story blueprint, idea engine, reviewer brief, ElevenLabs and Fish first-connect checklists, channel research with reference frames',
  'data/': 'idea-engine data: competitor titles, beat sheets, transcripts, patterns, ideas backlog',
  'public/': `the \`${FIXTURE_EPISODE}\` fixture episode (JSON only), empty \`music/\` and \`sfx/\``,
  'thumbnails/': 'config, the prompt template, the 3 reference images, an example brief',
  'final/': 'its README (finished videos land here)',
  '.claude/': 'the `/stickman <topic>` command and the `revisor-verificacao` subagent (sonnet)',
  '@memory/': "Claude's memory for this project (extracted into the new project's memory folder)",
};
const contents = ['| Path | Files | Size | What |', '|---|---|---|---|',
  ...[...groups].map(([g, s]) => `| \`${g}\` | ${s.n}${s.bin ? ` (${s.bin} binary)` : ''} | ${(s.bytes / 1024).toFixed(0)} KB | ${WHAT[g] ?? ''} |`)].join('\n');

// The hero as packed, so the outfit step stays right after a copy changes outfits and repacks itself.
const heroBody = /\bhero: \{([\s\S]*?)\},/.exec(files.get('src/cast.ts').toString('utf8'))?.[1];
if (!heroBody) throw new Error('no hero entry in src/cast.ts');
const heroEntry = `{ ${heroBody.replace(/\/\/[^\r\n]*/g, '').replace(/\s+/g, ' ').trim().replace(/,$/, '')} }`;
const heroField = k => new RegExp(`\\b${k}: '([^']+)'`).exec(heroBody)?.[1];
const heroGrep = [...new Set(['hoodie', heroField('top'), heroField('topColor'), heroField('accent')].filter(Boolean))].join('|');

const extractor = fs.readFileSync(path.join(HERE, 'extract.mjs'), 'utf8').replace(/\r\n/g, '\n').replace(/\n+$/, '');
let header = fs.readFileSync(path.join(HERE, 'header.md'), 'utf8').replace(/\r\n/g, '\n')
  .replace('{{EXTRACTOR}}', () => extractor)
  .replace('{{CONTENTS}}', () => contents)
  .replace('{{HERO_ENTRY}}', () => heroEntry)
  .replace('{{HERO_GREP}}', () => heroGrep)
  .replace(/\{\{DATE\}\}/g, new Date().toISOString().slice(0, 10))
  .replace(/\{\{FILE_COUNT\}\}/g, String(files.size));
header = header.replace(/\n*$/, '\n\n');
const headerEnd = header.split('\n').length - 1;
const body = payload.join('\n');
const mb = ((Buffer.byteLength(header) + Buffer.byteLength(body)) / 1e6).toFixed(1);
header = header.replace(/\{\{HEADER_END\}\}/g, String(headerEnd)).replace(/\{\{SIZE_MB\}\}/g, mb);
if (header.split('\n').includes('@@@@ PAYLOAD BEGIN')) throw new Error('header must not contain the payload marker line');
fs.writeFileSync(out, header + body);
console.log(`${path.relative(ROOT, out)}: ${files.size} files, ${dirs.length} empty folders, ${mb} MB, header ${headerEnd} lines`);
