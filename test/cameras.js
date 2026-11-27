const { chromium } = require('playwright');
// the Cameras button on the rail lists every camera, and tapping one opens its live view
(async () => {
  const b = await chromium.launch();
  for (const [vw, vh, tag] of [[1366, 767, 'full'], [390, 844, 'phone']]) {
    const p = await b.newPage({ viewport: { width: vw, height: vh } });
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto('file://' + __dirname + '/test.html'); await p.waitForTimeout(300);
    const h = p.locator('lumen-card');
    console.log(tag, 'rail:', JSON.stringify(await h.locator('.kbtn .klbl').allInnerTexts()));
    await h.locator('.kbtn[data-id="camera"]').click(); await p.waitForTimeout(200);
    console.log(tag, 'rows:', JSON.stringify((await h.locator('.trow:not(.thead)').allInnerTexts()).map((r) => r.replace(/\s+/g, ' ').trim())));
    await p.screenshot({ path: __dirname + '/cameras-' + tag + '.png' });
    await h.locator('button.chip[data-act="open-entity"]').first().click(); await p.waitForTimeout(300);
    console.log(tag, 'opened:', await h.locator('.panel h2').innerText(), '| picture:', await h.locator('.panel img, .panel video').count());
    console.log(tag, 'errors', JSON.stringify(errs));
    await p.close();
  }
  await b.close();
})();
