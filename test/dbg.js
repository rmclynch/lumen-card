const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1366, height: 767 } });
  await p.goto('file://' + __dirname + '/test.html'); await p.waitForTimeout(300);
  await p.evaluate(() => document.getElementById('c').style.setProperty('--lumen-top', '0px'));
  await p.waitForTimeout(400);
  console.log(JSON.stringify(await p.evaluate(() => document.getElementById('c')._dbg)));
  await b.close();
})();
