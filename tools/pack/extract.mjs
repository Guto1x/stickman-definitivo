// Unpacks "project instructions.md": writes every embedded file and checks its SHA-256.
//   node extract.mjs "<project instructions.md>" [outDir=.] [--memory <dir>] [--force]
// Files packed as @memory/… go to --memory (Claude's memory folder), or to .bootstrap/memory/ without it.
// An existing file that differs is kept unless --force. Exit 1 if any checksum fails.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const args = process.argv.slice(2);
const take = k => { const i = args.indexOf(k); return i < 0 ? undefined : args.splice(i, 2)[1]; };
const memDir = take('--memory');
const force = args.includes('--force');
const [src, outDir = '.'] = args.filter(a => a !== '--force');
if (!src) {
  console.error('usage: node extract.mjs "<project instructions.md>" [outDir] [--memory <dir>] [--force]');
  process.exit(2);
}

const lines = fs.readFileSync(src, 'utf8').replace(/\r\n/g, '\n').split('\n');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const HEAD = /^@@@@ FILE (.+) \| (text|text-crlf|base64) \| (\d+) \| ([0-9a-f]{64})( \| noeol)?$/;
let i = lines.indexOf('@@@@ PAYLOAD BEGIN');
if (i < 0) throw new Error('no payload found in ' + src);
const n = { written: 0, same: 0, dirs: 0, kept: [], bad: [] };
for (i++; i < lines.length && lines[i] !== '@@@@ PAYLOAD END'; i++) {
  const line = lines[i];
  if (line.startsWith('@@@@ DIR ')) {
    fs.mkdirSync(path.join(outDir, line.slice(9)), { recursive: true });
    n.dirs++;
    continue;
  }
  const m = HEAD.exec(line);
  if (!m) {
    if (line.trim()) throw new Error(`line ${i + 1}: expected a FILE header, got: ${line.slice(0, 80)}`);
    continue;
  }
  const [, rel, enc, size, hash, noeol] = m;
  const body = [];
  for (i++; lines[i] !== '@@@@ END'; i++) {
    if (i >= lines.length) throw new Error('unterminated entry: ' + rel);
    body.push(lines[i]);
  }
  let buf;
  if (enc === 'base64') buf = Buffer.from(body.join(''), 'base64');
  else {
    let t = body.join('\n') + (noeol ? '' : '\n');
    if (enc === 'text-crlf') t = t.replace(/\n/g, '\r\n');
    buf = Buffer.from(t, 'utf8');
  }
  if (buf.length !== +size || sha(buf) !== hash) {
    n.bad.push(rel);
    continue;
  }
  const dst = rel.startsWith('@memory/')
    ? path.join(memDir ?? path.join(outDir, '.bootstrap', 'memory'), rel.slice(8))
    : path.join(outDir, rel);
  if (fs.existsSync(dst)) {
    if (sha(fs.readFileSync(dst)) === hash) { n.same++; continue; }
    if (!force) { n.kept.push(rel); continue; }
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, buf);
  n.written++;
}
console.log(`${n.written} files written, ${n.same} already identical, ${n.dirs} folders, ${n.bad.length} checksum failures`);
if (n.kept.length) console.log(`kept ${n.kept.length} existing files that differ (pass --force to overwrite):\n  ${n.kept.join('\n  ')}`);
if (n.bad.length) {
  console.error(`CHECKSUM FAILED (this file was altered after packing):\n  ${n.bad.join('\n  ')}`);
  process.exit(1);
}
