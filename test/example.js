const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1366, height: 767 } });
  await p.goto('file://' + __dirname + '/test.html'); await p.waitForTimeout(200);
  // a drawn plan: long hall, big living room, kitchen-diner, small back room
  await p.evaluate(() => {
    const c = document.getElementById('c');
    c.setConfig({ layout: {
      hall: [0, 0, 15, 100], living_room: [17.5, 0, 45, 55], back_room: [65, 0, 35, 35],
      kitchen: [17.5, 57.5, 40, 42.5], dining_room: [65, 37.5, 35, 62.5],
      bedroom: [0, 0, 50, 60], eli_room: [52.5, 0, 47.5, 45], martha_room: [52.5, 47.5, 47.5, 52.5],
      jude_room: [0, 0, 47.5, 100], lollie_room: [50, 0, 50, 100]
    } });
    c.hass = Object.assign({}, c.hass);
  });
  await p.waitForTimeout(500);
  await p.screenshot({ path: __dirname + '/example-house.png' });
  await p.locator('lumen-card').locator('button.lbtn[data-id="0"]').click(); await p.waitForTimeout(300);
  await p.screenshot({ path: __dirname + '/example-ground.png' });
  await b.close();
})();
