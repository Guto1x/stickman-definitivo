// Bundle once, render many stills (~1 s each instead of ~15 s per CLI call).
// Usage: node tools/stills.cjs jobs.json   → out/lab/<out>.jpg
// jobs.json: [{ "out": "city_1", "id": "SetLab", "props": {...}, "frame": 0 }]  (id defaults to SetLab)
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const { createRequire } = require('module');
const req = createRequire(path.join(ROOT, 'package.json'));
const { bundle } = req('@remotion/bundler');
const { selectComposition, renderStill, openBrowser } = req('@remotion/renderer');

(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const t0 = Date.now();
  const serveUrl = await bundle({ entryPoint: path.join(ROOT, 'src/index.ts'), publicDir: path.join(ROOT, 'public') });
  console.log('bundled in', ((Date.now() - t0) / 1000).toFixed(1), 's');
  const browser = await openBrowser('chrome', { chromiumOptions: { gl: 'angle' } });
  for (const j of jobs) {
    const t1 = Date.now();
    try {
      const comp = await selectComposition({ serveUrl, id: j.id || 'SetLab', inputProps: j.props, puppeteerInstance: browser, chromiumOptions: { gl: 'angle' } });
      const out = path.join(ROOT, 'out/lab', j.out + '.jpg');
      await renderStill({ composition: comp, serveUrl, output: out, inputProps: j.props, frame: j.frame || 0, imageFormat: 'jpeg', jpegQuality: 88, puppeteerInstance: browser, chromiumOptions: { gl: 'angle' }, overwrite: true });
      console.log('ok', j.out, ((Date.now() - t1) / 1000).toFixed(1), 's');
    } catch (e) {
      console.log('FAIL', j.out, String(e && e.message).slice(0, 600));
    }
  }
  await browser.close({ silent: true });
})();
