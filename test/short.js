const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [w,h,name] of [[1366,543,'short'],[1366,767,'laptop'],[1920,1080,'full']]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const errs=[]; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + __dirname + '/test.html'); await p.waitForTimeout(300);
    // second render so the stage measures itself
    
    await p.waitForTimeout(200);
    await p.screenshot({ path: __dirname + '/' + name + '.png' });
    const box = await p.evaluate(() => { const r = document.getElementById('c').shadowRoot.querySelector('.hint').getBoundingClientRect(); return [Math.round(r.bottom), innerHeight]; });
    console.log(name, 'hint bottom/viewport', box, 'errors', errs.length);
    await p.close();
  }
  await b.close();
})();
