// Progress of a running build-episode.mjs: step, a bar, frames, elapsed time and the estimated time left.
//   node tools/progress.mjs <slug>            → one snapshot
//   node tools/progress.mjs <slug> --watch    → refreshes every 3 s until the build is done (Ctrl+C to stop)
// Reads out/<slug>/progress.json, which build-episode.mjs writes as it goes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const slug = args.find(a => !a.startsWith('--'));
if (!slug) {
  console.error('usage: node tools/progress.mjs <slug> [--watch]');
  process.exit(1);
}
const file = path.join(ROOT, 'out', slug, 'progress.json');
const STEPS = { audit: 'auditoria da cena', audio: 'trilha sonora (voz, música, efeitos)', render: 'renderizando quadros', encode: 'codificando o vídeo', mux: 'juntando vídeo e áudio', sheets: 'folhas de contato', done: 'pronto', failed: 'FALHOU' };
const mmss = ms => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

function snapshot() {
  if (!fs.existsSync(file)) return { text: `nenhuma build com progresso para "${slug}" (o arquivo ${path.relative(ROOT, file)} não existe)`, end: true };
  let p;
  try { p = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return { text: '(lendo…)', end: false }; }
  const lines = [`${slug}${p.range ? ` [trecho ${p.range[0]}–${p.range[1]} s]` : ''} — ${STEPS[p.step] || p.step}`];
  if ((p.step === 'render' || p.step === 'encode') && p.total) {
    const k = p.done / p.total, n = 30, fill = Math.round(k * n);
    lines.push(`[${'█'.repeat(fill)}${'░'.repeat(n - fill)}] ${(100 * k).toFixed(1)}%  ${p.done}/${p.total} quadros${p.step === 'encode' ? ' codificados' : ''}`);
    if (p.eta) lines.push(`faltam ~${p.eta} (estimativa do Remotion)`);
  }
  lines.push(`tempo total da build: ${mmss((p.step === 'done' ? p.updated : Date.now()) - p.started)}`);
  const stale = Date.now() - p.updated > 120000 && !['done', 'failed'].includes(p.step);
  if (stale) lines.push(`(sem atualização há ${mmss(Date.now() - p.updated)} — a build pode ter parado)`);
  if (p.step === 'done' && p.final) lines.push(`arquivo: ${p.final}`);
  return { text: lines.join('\n'), end: ['done', 'failed'].includes(p.step) };
}

if (!args.includes('--watch')) {
  console.log(snapshot().text);
} else {
  const tick = () => {
    const s = snapshot();
    process.stdout.write('\x1b[2J\x1b[H' + s.text + '\n');
    if (s.end) process.exit(0);
  };
  tick();
  setInterval(tick, 3000);
}
