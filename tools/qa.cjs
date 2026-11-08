// QA runner (no frames rendered):
//   node tools/qa.cjs selftest           engine self-tests (npm test)
//   node tools/qa.cjs audit <slug>       pre-render scene audit → out/<slug>/audit.json; exit 1 on errors
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const { createRequire } = require('module');
const req = createRequire(path.join(ROOT, 'package.json'));
const { bundle } = req('@remotion/bundler');
const { selectComposition, openBrowser } = req('@remotion/renderer');

(async () => {
  const [cmd, slug] = process.argv.slice(2);
  if (!['audit', 'selftest'].includes(cmd) || (cmd === 'audit' && !slug)) {
    console.error('usage: node tools/qa.cjs selftest | audit <slug>');
    process.exit(2);
  }
  const serveUrl = await bundle({ entryPoint: path.join(ROOT, 'src/index.ts'), publicDir: path.join(ROOT, 'public') });
  const browser = await openBrowser('chrome', { chromiumOptions: { gl: 'angle' } });
  let code = 0;
  try {
    const comp = await selectComposition({
      serveUrl, id: cmd === 'audit' ? 'Audit' : 'SelfTest', inputProps: cmd === 'audit' ? { slug } : {},
      puppeteerInstance: browser, chromiumOptions: { gl: 'angle' }, timeoutInMilliseconds: 600000,
    });
    if (cmd === 'selftest') {
      const res = comp.props.results;
      for (const r of res) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.pass ? '' : '  —  ' + r.detail}`);
      const failed = res.filter(r => !r.pass).length;
      console.log(`
${res.length - failed}/${res.length} passed`);
      code = failed ? 1 : 0;
    } else {
      const out = path.join(ROOT, 'out', slug);
      fs.mkdirSync(out, { recursive: true });
      fs.writeFileSync(path.join(out, 'audit.json'), JSON.stringify(comp.props.report, null, 1));
      console.log(comp.props.text);
      code = comp.props.report.findings.some(f => f.sev === 'error') ? 1 : 0;
    }
  } finally {
    await browser.close({ silent: true });
  }
  process.exit(code);
})();
