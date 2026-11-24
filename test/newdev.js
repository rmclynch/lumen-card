const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1366, height: 767 } });
  await p.goto('file://' + __dirname + '/test.html'); await p.waitForTimeout(300);
  const r = await p.evaluate(async () => {
    const c = document.getElementById('c');
    const old = c.hass;
    // 1) a new light's state arrives before its registry entry (what Home Assistant does)
    const h1 = Object.assign({}, old, { states: Object.assign({}, old.states, { 'light.hall_lamp': { state: 'on', attributes: { friendly_name: 'Hall lamp' } } }) });
    c.hass = h1;
    const before = c.shadowRoot.querySelector('button.room[data-id="hall"]').className;
    // 2) then the registry updates with the light's area
    const h2 = Object.assign({}, h1, { entities: Object.assign({}, old.entities, { 'light.hall_lamp': { area_id: 'hall' } }) });
    c.hass = h2;
    const after = c.shadowRoot.querySelector('button.room[data-id="hall"]').className;
    return [before, after];
  });
  console.log(JSON.stringify(r));
  await b.close();
})();
