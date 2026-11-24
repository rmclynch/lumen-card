// Robert's real rooms and drawing, at laptop size
const { chromium } = require('playwright');
const LAYOUT = {"back_room":[72.5,45,27.5,55],"dining_room":[40,35,32.5,65],"hall":[0,0,40,35],"kitchen":[40,0,32.5,35],"living_room":[0,35,40,65],"eli_room":[0,45,50,55],"martha_room":[0,0,30,45],"bedroom":[50,30,50,70],"jude_room":[50,10,35,82.5],"lollie_room":[15,30,35,62.5],"toilet":[72.5,0,15,45],"utility_room":[87.5,0,12.5,45],"bathroom":[50,0,25,30],"ensuite":[75,0,25,30],"landing1":[30,0,20,45],"landing2":[15,10,35,20]};
const EXTRA = [['toilet','Toilet','0'],['utility_room','Utility Room','0'],['landing1','Landing1','first'],['ensuite','Ensuite','first'],['bathroom','Bathroom','first'],['landing2','Landing2','attic']];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +(process.env.W || 1366), height: +(process.env.H || 710) }, deviceScaleFactor: +(process.env.DSF || 1) });
  p.on('console', (m) => console.log(m.text())); await p.addInitScript(() => { window.LUMEN_DEBUG = 1; }); await p.goto('file://' + __dirname + '/test.html');
  await p.evaluate(([L, E]) => {
    const c = document.getElementById('c'); const h = c._hass;
    const areas = { ...h.areas }; E.forEach(([id, n, f]) => areas[id] = { area_id: id, name: n, floor_id: f });
    c.setConfig({ layout: L }); c.hass = { ...h, areas };
  }, [LAYOUT, EXTRA]);
  await p.waitForTimeout(600);
  const sizes = await p.evaluate(() => [...document.getElementById('c').shadowRoot.querySelectorAll('.tag .tn')].map((e) => e.textContent + ':' + e.style.fontSize));
  console.log(sizes.join('  '));
  await p.screenshot({ path: __dirname + '/' + (process.env.OUT || 'real') + '.png' });
  await b.close();
})();
