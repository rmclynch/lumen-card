const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const cases = [
    ['rain-wind', { state: 'rainy', attributes: { temperature: 8, wind_speed: 42, wind_speed_unit: 'km/h' } }, -12, 'balanced'],
    ['snow', { state: 'snowy', attributes: { temperature: -1 } }, 25, 'showy'],
    ['sunny-midday', { state: 'sunny', attributes: { temperature: 14 } }, 35, 'balanced'],
    ['subtle', { state: 'rainy', attributes: { temperature: 8 } }, 10, 'subtle']
  ];
  for (const [name, wx, el, fx] of cases) {
    const p = await b.newPage({ viewport: { width: 1366, height: 767 } });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + __dirname + '/test.html'); await p.waitForTimeout(200);
    await p.evaluate(([wx, el, fx]) => {
      const c = document.getElementById('c');
      const h = c.hass;
      c.setConfig({ effects: fx });
      c.hass = Object.assign({}, h, { states: Object.assign({}, h.states, { 'weather.forecast_home': wx, 'sun.sun': { state: 'x', attributes: { elevation: el, rising: true } } }) });
    }, [wx, el, fx]);
    await p.waitForTimeout(700);
    const info = await p.evaluate(() => { const sr = document.getElementById('c').shadowRoot; return { cls: sr.querySelector('.root').className, drops: sr.querySelectorAll('.drop').length, flakes: sr.querySelectorAll('.flake').length, gusts: sr.querySelectorAll('.gust').length, clouds: sr.querySelectorAll('.cloud').length, chip: sr.querySelector('.wx').innerText.replace(/\s+/g, ' '), brand: sr.querySelector('.brand').innerText.replace(/\s+/g, ' ') }; });
    // steady layer: a state change elsewhere must not rebuild the weather
    const same = await p.evaluate(() => { const c = document.getElementById('c'); const before = c.shadowRoot.querySelector('.fxs').firstElementChild; const h = c.hass; c.hass = Object.assign({}, h, { states: Object.assign({}, h.states, { 'media_player.android_tv': { state: 'paused', attributes: { friendly_name: 'Android TV' } } }) }); return before === c.shadowRoot.querySelector('.fxs').firstElementChild; });
    console.log(name, JSON.stringify(info), 'weather layer kept:', same, 'errors', errs.length);
    await p.screenshot({ path: __dirname + '/sky-' + name + '.png' });
    await p.close();
  }
  await b.close();
})();
