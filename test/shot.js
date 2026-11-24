const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + __dirname + '/test.html');
  await p.waitForTimeout(400);
  await p.screenshot({ path: __dirname + '/house.png' });
  const host = p.locator('lumen-card');
  // open Lollie room
  await host.locator('button.room[data-id="lollie_room"]').click();
  await p.waitForTimeout(400);
  await p.screenshot({ path: __dirname + '/room.png' });
  await host.locator('button.pill[data-act="entity"]').first().click();
  await p.waitForTimeout(400);
  await host.locator('button.step[data-delta="0.5"]').click();
  await host.locator('button.step[data-delta="0.5"]').click();
  await p.waitForTimeout(1200);
  await p.screenshot({ path: __dirname + '/dial.png' });
  await host.locator('button.pill[data-act="mode"][data-mode="off"]').click();
  // floor view
  await host.locator('button.pill[data-act="back"]').click();
  await host.locator('button.pill[data-act="close"]').click();
  await host.locator('button.lbtn[data-id="0"]').click();
  await p.waitForTimeout(300);
  await p.screenshot({ path: __dirname + '/floor.png' });
  console.log('calls', JSON.stringify(await p.evaluate(() => window.calls)));
  console.log('errors', JSON.stringify(errs));
  await b.close();
})();
