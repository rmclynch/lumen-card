const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1366, height: 767 } });
  await p.goto('file://' + __dirname + '/test.html'); await p.waitForTimeout(300);
  // behave like kiosk: card gets the full window height
  await p.evaluate(() => document.getElementById('c').style.setProperty('--lumen-top', '0px'));
  await p.waitForTimeout(400);
  const m = await p.evaluate(() => {
    const sr = document.getElementById('c').shadowRoot;
    const st = sr.querySelector('.stage').getBoundingClientRect();
    const fl = [...sr.querySelectorAll('.floor')].map(f => f.getBoundingClientRect());
    const minX = Math.min(...fl.map(r => r.left)), maxX = Math.max(...fl.map(r => r.right));
    const minY = Math.min(...fl.map(r => r.top)), maxY = Math.max(...fl.map(r => r.bottom));
    return { stage: [Math.round(st.left), Math.round(st.top), Math.round(st.width), Math.round(st.height)], floors: [Math.round(minX), Math.round(minY), Math.round(maxX - minX), Math.round(maxY - minY)] };
  });
  console.log(JSON.stringify(m));
  await p.screenshot({ path: __dirname + '/fill.png' });
  await b.close();
})();
