const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1366, height: 767 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + __dirname + '/test.html'); await p.waitForTimeout(300);
  const h = p.locator('lumen-card');
  await h.locator('button.lbtn[data-id="0"]').click(); await p.waitForTimeout(200);
  await p.screenshot({ path: __dirname + '/floor-before.png' });
  await h.locator('button[data-act="edit-start"]').click(); await p.waitForTimeout(200);
  // drag the Kitchen tile to the top-left, then make it bigger
  const k = h.locator('[data-edit="kitchen"]');
  const kb = await k.boundingBox();
  const plan = await h.locator('.plan').boundingBox();
  await p.mouse.move(kb.x + kb.width / 2, kb.y + kb.height / 2);
  await p.mouse.down();
  await p.mouse.move(plan.x + kb.width / 2 + 2, plan.y + kb.height / 2 + 2, { steps: 8 });
  await p.mouse.up();
  await p.waitForTimeout(150);
  const hb = await h.locator('[data-edit="kitchen"] .handle').boundingBox();
  await p.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
  await p.mouse.down();
  await p.mouse.move(hb.x + plan.width * 0.15, hb.y + plan.height * 0.12, { steps: 8 });
  await p.mouse.up();
  await p.waitForTimeout(150);
  await p.screenshot({ path: __dirname + '/floor-editing.png' });
  await h.locator('button[data-act="edit-save"]').click(); await p.waitForTimeout(300);
  const saved = await p.evaluate(() => window.savedConfigs.map(s => s.config.views[0].cards[0].layout));
  console.log('saved layout kitchen:', JSON.stringify(saved[0] && saved[0].kitchen), 'rooms in layout:', saved[0] ? Object.keys(saved[0]).length : 0);
  await p.screenshot({ path: __dirname + '/floor-after.png' });
  await h.locator('button.lbtn[data-id=""]').click(); await p.waitForTimeout(300);
  await p.screenshot({ path: __dirname + '/house-after.png' });
  // cancel path keeps the saved plan
  await h.locator('button.lbtn[data-id="0"]').click(); await p.waitForTimeout(100);
  await h.locator('button[data-act="edit-start"]').click(); await h.locator('button[data-act="edit-auto"]').click(); await h.locator('button[data-act="edit-cancel"]').click();
  const k2 = await h.locator('button.room[data-id="kitchen"]').getAttribute('style');
  console.log('after cancel kitchen style:', k2);
  console.log('errors', JSON.stringify(errs));
  await b.close();
})();
