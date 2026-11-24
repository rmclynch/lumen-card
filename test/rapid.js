const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1366, height: 767 } });
  const errs=[]; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + __dirname + '/test.html'); await p.waitForTimeout(300);
  const h = p.locator('lumen-card');
  await h.locator('button.room[data-id="jude_room"]').click();
  await h.locator('button.pill[data-act="entity"]').first().click();
  const plus = h.locator('button.step[data-delta="0.5"]');
  // tap, wait for the send, tap again inside the 4s window, then a burst
  await plus.click(); await p.waitForTimeout(900);
  await plus.click(); await p.waitForTimeout(900);
  for (let i = 0; i < 4; i++) { await plus.click(); await p.waitForTimeout(120); }
  await p.waitForTimeout(5200);
  const anim = await p.evaluate(() => document.getElementById('c').shadowRoot.querySelector('.panel').className);
  console.log('calls', JSON.stringify(await p.evaluate(() => window.calls.map(c => c[2].temperature))));
  console.log('panel class after redraws:', anim, 'errors', errs.length);
  await b.close();
})();
