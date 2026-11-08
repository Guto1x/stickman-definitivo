// Build GPT Image 2.5 thumbnail prompts from thumbnails/prompt_template.json.
//   node tools/thumb-prompt.mjs <slug>                 prompts for the mode in thumbnails/config.json
//   node tools/thumb-prompt.mjs <slug> --mode chatgpt  override the mode (fish | chatgpt)
//   node tools/thumb-prompt.mjs <slug> --copy B        also put variant B's prompt on the clipboard
//   node tools/thumb-prompt.mjs <slug> --pick B        make out/B_*.png the episode thumbnail
// Reads thumbnails/<slug>/brief.json ({topic, context, variants:[{id, text:[{text,color}], scene}]}).
// fish:    writes prompt_<id>.txt and fish_jobs.json (Claude submits them through the Fish MCP).
// chatgpt: writes chatgpt_<id>.txt and CHATGPT.md (the user pastes them into ChatGPT with the refs).
// The references in thumbnails/refs/refs.json go with every prompt, in order.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const slug = args[0];
const flag = (name) => { const i = args.indexOf(`--${name}`); return i > 0 ? args[i + 1] : undefined; };
if (!slug || slug.startsWith('--')) {
  console.error('usage: node tools/thumb-prompt.mjs <slug> [--mode fish|chatgpt] [--copy <id>] [--pick <id>]');
  process.exit(1);
}

const dir = path.join(root, 'thumbnails', slug);
const briefPath = path.join(dir, 'brief.json');
const brief = JSON.parse(fs.readFileSync(briefPath, 'utf8'));
const config = JSON.parse(fs.readFileSync(path.join(root, 'thumbnails', 'config.json'), 'utf8'));
const template = fs.readFileSync(path.join(root, 'thumbnails', 'prompt_template.json'), 'utf8');
const { refs } = JSON.parse(fs.readFileSync(path.join(root, 'thumbnails', 'refs', 'refs.json'), 'utf8'));

if (flag('pick')) { pick(flag('pick')); process.exit(0); }

const mode = flag('mode') ?? config.mode;
if (!['fish', 'chatgpt'].includes(mode)) { console.error(`unknown mode "${mode}" (fish | chatgpt)`); process.exit(1); }
if (brief.variants.length !== config.variants) {
  console.error(`brief has ${brief.variants.length} variants; config.json locks it at ${config.variants}`);
  process.exit(1);
}

const HEX = { white: '#FFFFFF', yellow: '#FFE12B' };
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six'];
const n = WORDS[refs.length] ?? String(refs.length);

function buildPrompt(v) {
  // The template says "four" references; we send however many refs.json lists.
  const t = JSON.parse(template.replaceAll('four supplied', `${n} supplied`).replaceAll('four reference', `${n} reference`));
  const full = v.text.map((l) => l.text).join(' ');
  const lines = v.text.map((l, i) => ({ line: i + 1, text: l.text, color: HEX[l.color] ?? l.color, color_name: l.color }));

  t.input.video_topic = brief.topic;
  t.input.additional_context = brief.context;
  t.input.scene_direction = v.scene;
  t.input.reference_images = {
    rule: `Use the ${n} supplied images, in order, as primary visual references for character proportions, linework, rendering, lighting, composition, and typography. Every reference shows a BLUE hoodie: draw a heather-GRAY quarter-zip jacket with a gold zip pull instead.`,
    images: refs.map((r, i) => ({ image: i + 1, shows: r.about })),
  };

  // We choose the words; the model must not invent its own.
  const auto = t.automatic_thumbnail_text;
  t.automatic_thumbnail_text = {
    mode: 'PROVIDED',
    priority: auto.priority,
    instruction: `Use EXACTLY this thumbnail text and nothing else: "${full}". Same words, spelling, punctuation, line breaks and colours as listed. Do not add, drop or change any word, and add no other text anywhere in the image.`,
    provided_text: { full, lines },
    tone: auto.tone,
    text_examples: auto.text_examples,
  };

  t.automatic_scene_generation.mode = 'GUIDED';
  t.automatic_scene_generation.provided_scene = v.scene;
  // Channel world rules (the first test drew anime kids and a "PIZZA" sign).
  t.supporting_characters = {
    rule: 'Everyone else in the scene is the same kind of cartoon character as the mascot: perfectly round black head, minimal off-white eyes and mouth, no hair, ears, nose or visible skin, black hands. Tell them apart by hoodie or clothing colour, never gray (gray is only the mascot). Adults may wear uniforms or helmets over the same black head.',
    avoid: ['Realistic humans', 'Anime or cartoon humans with hair or skin', 'Any character with a face other than the mascot style'],
  };
  t.negative_prompt.push('Humans with hair or skin', 'Signs, labels, logos or any lettering other than the provided thumbnail text');

  const fd = t.final_directive;
  fd.instruction = fd.instruction.replace(
    'Automatically generate an extremely short, emotionally compelling thumbnail hook, ideally 1-3 words.',
    `Use exactly the provided thumbnail text "${full}" (${lines.map((l) => `${l.text} in ${l.color_name}`).join(', ')}).`,
  );
  fd.internal_execution = fd.internal_execution.map((s) =>
    s === 'Select the strongest minimal thumbnail text.' ? `Use the provided thumbnail text "${full}" exactly.`
      : s === 'Determine white/yellow emphasis.' ? 'Apply the provided white/yellow line colours.'
        : s);

  return { full, json: JSON.stringify(t) };
}

// ChatGPT answers a bare JSON paste with text, so it gets a one-line ask first.
const chatgptLead = () =>
  `Create one image (no text reply). I've attached ${n} reference images in this order: ${refs.map((r, i) => `${i + 1}) ${r.label}`).join(', ')}. Make a 16:9 landscape YouTube thumbnail that follows this JSON brief exactly:\n\n`;

const written = [];
for (const v of brief.variants) {
  const { full, json } = buildPrompt(v);
  const file = path.join(dir, mode === 'fish' ? `prompt_${v.id}.txt` : `chatgpt_${v.id}.txt`);
  fs.writeFileSync(file, mode === 'fish' ? json : chatgptLead() + json);
  written.push({ id: v.id, full, file });
  console.log(`${path.relative(root, file)}  ${fs.statSync(file).size} bytes  "${full}"`);
}

if (mode === 'fish') {
  const jobs = {
    note: 'Submit each job with Fish generate_image_edit after estimate_image_edit and the user\'s OK. prompt = the exact text of prompt_file.',
    model_id: config.fish.model_id,
    parameters: config.fish.parameters,
    inputs: refs.map((r) => ({ role: 'ref', object_key: r.object_key })),
    jobs: written.map((w) => ({ id: w.id, text: w.full, prompt_file: path.relative(root, w.file).replaceAll('\\', '/') })),
  };
  fs.writeFileSync(path.join(dir, 'fish_jobs.json'), JSON.stringify(jobs, null, 2) + '\n');
  console.log(`${path.join('thumbnails', slug, 'fish_jobs.json')}  ${config.fish.model_id} ${Object.values(config.fish.parameters).join(' ')}`);
} else {
  const refDir = path.join(root, 'thumbnails', 'refs');
  const md = [
    `# ${brief.topic}: thumbnails in ChatGPT`,
    '',
    `Make each variant in a **new** ChatGPT chat, so the earlier ones don't bleed in.`,
    '',
    `1. Attach the ${n} reference images from \`${refDir}\`, in this order:`,
    ...refs.map((r, i) => `   ${i + 1}. \`${r.file}\` (${r.label})`),
    `2. Paste the prompt for the variant: open its file below, select all, copy, paste. Or run \`node tools/thumb-prompt.mjs ${slug} --mode chatgpt --copy <id>\` to put it on the clipboard.`,
    `3. Send. Download the image and save it as \`thumbnails/${slug}/out/<id>_chatgpt.png\`.`,
    `4. Repeat for every variant, then tell Claude which one to use.`,
    '',
    '| Variant | Text | Prompt file | Scene |',
    '|---|---|---|---|',
    ...brief.variants.map((v, i) => `| ${v.id} | ${written[i].full} | \`${path.basename(written[i].file)}\` | ${v.scene} |`),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'CHATGPT.md'), md);
  console.log(path.join('thumbnails', slug, 'CHATGPT.md'));
}

const copyId = flag('copy');
if (copyId) {
  const w = written.find((x) => x.id === copyId);
  if (!w) { console.error(`no variant "${copyId}"`); process.exit(1); }
  const r = spawnSync('powershell', ['-NoProfile', '-Command', `Get-Content -Raw -Encoding UTF8 -LiteralPath '${w.file}' | Set-Clipboard`]);
  console.log(r.status === 0 ? `variant ${copyId} prompt copied to the clipboard` : `clipboard copy failed: ${r.stderr}`);
}

// The chosen thumbnail goes in final/thumbnails/, next to the other episodes' thumbnails.
function pick(id) {
  const out = path.join(dir, 'out');
  const pngs = fs.existsSync(out) ? fs.readdirSync(out).filter((f) => f.startsWith(`${id}_`) && f.endsWith('.png')) : [];
  if (!pngs.length) { console.error(`no thumbnails/${slug}/out/${id}_*.png`); process.exit(1); }
  const src = pngs.map((f) => path.join(out, f)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
  const probe = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width', '-of', 'csv=p=0', src], { encoding: 'utf8' });
  if (Number(probe.stdout) < 1920) console.warn(`warning: ${path.basename(src)} is ${probe.stdout.trim()} px wide, upscaling to 1920`);
  const dst = path.join(root, 'final', 'thumbnails', `${slug}_thumbnail.jpg`);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  const ff = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-vf', 'scale=1920:1080:flags=lanczos', '-q:v', '2', dst]);
  if (ff.status !== 0) { console.error(String(ff.stderr)); process.exit(1); }
  brief.chosen = { id, file: path.relative(root, src).replaceAll('\\', '/'), at: new Date().toISOString().slice(0, 10) };
  fs.writeFileSync(briefPath, JSON.stringify(brief, null, 2) + '\n');
  console.log(`${path.relative(root, dst)}  ${(fs.statSync(dst).size / 1024).toFixed(0)} KB  from ${path.basename(src)}`);
}
