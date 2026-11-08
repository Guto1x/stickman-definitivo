// Bundle once, render many stills (~1 s each instead of ~15 s per CLI call), several at a time.
// Usage: node tools/stills.cjs jobs.json [--parallel N]   → out/lab/<out>.jpg
// jobs.json: [{ "out": "city_1", "id": "SetLab", "props": {...}, "frame": 0 }]  (id defaults to SetLab)
// --parallel: stills rendered at once in one browser (default 4; 1 = the old one-by-one behaviour).
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const { createRequire } = require('module');
const req = createRequire(path.join(ROOT, 'package.json'));
const { bundle } = req('@remotion/bundler');
const { selectComposition, renderStill, openBrowser } = req('@remotion/renderer');

(async () => {
  const args = process.argv.slice(2);
  const parallel = Math.max(1, +(args.includes('--parallel') ? args[args.indexOf('--parallel') + 1] : 4) || 4);
  const jobs = JSON.parse(fs.readFileSync(args[0], 'utf8'));
  const t0 = Date.now();
  const serveUrl = await bundle({ entryPoint: path.join(ROOT, 'src/index.ts'), publicDir: path.join(ROOT, 'public') });
  console.log('bundled in', ((Date.now() - t0) / 1000).toFixed(1), 's');
  const chromiumOptions = { gl: 'angle' };
  const browser = await openBrowser('chrome', { chromiumOptions });
  // one composition lookup per (id, props): Episode's metadata step fetches and resolves the whole episode
  const comps = new Map();
  const compFor = j => {
    const key = (j.id || 'SetLab') + JSON.stringify(j.props || {});
    if (!comps.has(key)) comps.set(key, selectComposition({ serveUrl, id: j.id || 'SetLab', inputProps: j.props, puppeteerInstance: browser, chromiumOptions }));
    return comps.get(key);
  };
  let next = 0, fails = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const j = jobs[next++];
      const t1 = Date.now();
      try {
        const composition = await compFor(j);
        const out = path.join(ROOT, 'out/lab', j.out + '.jpg');
        await renderStill({ composition, serveUrl, output: out, inputProps: j.props, frame: j.frame || 0, imageFormat: 'jpeg', jpegQuality: 88, puppeteerInstance: browser, chromiumOptions, overwrite: true });
        console.log('ok', j.out, ((Date.now() - t1) / 1000).toFixed(1), 's');
      } catch (e) {
        fails++;
        console.log('FAIL', j.out, String(e && e.message).slice(0, 600));
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(parallel, jobs.length) }, worker));
  await browser.close({ silent: true });
  console.log(`${jobs.length - fails}/${jobs.length} stills in ${((Date.now() - t0) / 1000).toFixed(1)} s (parallel ${parallel})`);
})();
