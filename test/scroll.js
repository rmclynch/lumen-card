// a redraw (something changing in the house) must not jump a scrolled list back to the top
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 390, height: 600 } })).newPage();
  await p.goto('file://' + __dirname + '/test.html');
  await p.evaluate(() => { const c = document.getElementById('c'); c.setConfig({ phone_house: 'list' }); c.hass = c._hass; });
  await p.waitForTimeout(400);
  const r = await p.evaluate(async () => {
    const c = document.getElementById('c'); const s = c.shadowRoot;
    const el = s.querySelector('.flist'); el.scrollTop = 200; const before = el.scrollTop;
    for (let i = 0; i < 3; i++) {
      c.hass = Object.assign({}, c._hass, { states: Object.assign({}, c._hass.states, { 'media_player.android_tv': { state: i % 2 ? 'playing' : 'paused', attributes: {} } }) });
      await new Promise((ok) => setTimeout(ok, 50));
    }
    return { before, after: s.querySelector('.flist').scrollTop, redrawn: s.querySelector('.flist') !== el };
  });
  console.log(JSON.stringify(r));
  await b.close();
})();
