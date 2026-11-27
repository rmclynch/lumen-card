const { chromium } = require('playwright');
// adds a Sigenergy-style solar + battery system to the pretend house and checks the energy view
const SIG = (w) => {
  const S = (state, a) => ({ state, attributes: a });
  const kw = (n) => ({ friendly_name: n, device_class: 'power', unit_of_measurement: 'kW', state_class: 'measurement' });
  const add = {
    'sensor.sigen_plant_pv_power': S(String(w.pv), kw('Sigen Plant PV Power')),
    'sensor.sigen_plant_sigen_pv_power': S(String(w.pv), kw('Sigen Plant Sigen PV Power')),
    'sensor.sigen_inverter_pv_power': S(String(w.pv), kw('Sigen Inverter PV Power')),
    'sensor.sigen_plant_battery_power': S(String(w.batt), kw('Sigen Plant Battery Power')),
    'sensor.sigen_inverter_battery_power': S(String(w.batt), kw('Sigen Inverter Battery Power')),
    'sensor.sigen_plant_battery_state_of_charge': S(String(w.soc), { friendly_name: 'Sigen Plant Battery State of Charge', device_class: 'battery', unit_of_measurement: '%' }),
    'sensor.sigen_plant_grid_active_power': S(String(w.grid), kw('Sigen Plant Grid Active Power')),
    'sensor.sigen_plant_grid_import_power': S(String(Math.max(0, w.grid)), kw('Sigen Plant Grid Import Power')),
    'sensor.sigen_plant_grid_export_power': S(String(Math.max(0, -w.grid)), kw('Sigen Plant Grid Export Power')),
    'sensor.sigen_plant_grid_sensor_phase_a_active_power': S('0.1', kw('Sigen Plant Grid Phase A Active Power')),
    'sensor.sigen_plant_consumed_power': S(String(w.home), kw('Sigen Plant Consumed Power')),
    'sensor.sigen_plant_available_max_charging_power': S('8', kw('Sigen Plant Available Max Charging Power')),
    'sensor.pixel_battery_level': S('55', { friendly_name: 'Pixel Battery level', device_class: 'battery', unit_of_measurement: '%' })
  };
  return add;
};
(async () => {
  const b = await chromium.launch();
  for (const [vw, vh, tag] of [[1366, 767, 'full'], [390, 844, 'phone']]) {
    const p = await b.newPage({ viewport: { width: vw, height: vh } });
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto('file://' + __dirname + '/test.html'); await p.waitForTimeout(300);
    const set = (w) => p.evaluate(([add]) => {
      const c = document.getElementById('c'); const h = c.hass;
      const ents = Object.assign({}, h.entities);
      Object.keys(add).forEach((id) => { if (!id.startsWith('sensor.pixel')) ents[id] = { device_id: id.includes('inverter') ? 'sig_inv' : 'sig_plant', area_id: 'back_room', config_entry_id: 'sig' }; });
      ents['sensor.pixel_battery_level'] = { device_id: 'phone1' };
      c.hass = Object.assign({}, h, { states: Object.assign({}, h.states, add), entities: ents });
    }, [w]);
    await set(SIG({ pv: 3.4, batt: 1.2, soc: 76, grid: -0.6, home: 1.6 }));
    await p.waitForTimeout(300);
    const h = p.locator('lumen-card');
    console.log(tag, 'rail:', JSON.stringify(await h.locator('.kbtn .klbl').allInnerTexts()));
    console.log(tag, 'pill:', tag === 'phone' ? '(none on phones: ' + (await h.locator('.enpill').count()) + ')' : await h.locator('.enpill').innerText());
    await p.screenshot({ path: __dirname + '/energy-house-' + tag + '.png' });
    await (tag === 'phone' ? h.locator('.kbtn[data-act="energy"]') : h.locator('.enpill')).click(); await p.waitForTimeout(300);
    console.log(tag, 'view:', (await h.locator('.card').innerText()).replace(/\s+/g, ' '));
    await p.screenshot({ path: __dirname + '/energy-' + tag + '.png' });
    // evening: battery giving, buying from grid, sun resting
    await set(SIG({ pv: 0, batt: -0.9, soc: 40, grid: 0.4, home: 1.3 })); await p.waitForTimeout(300);
    console.log(tag, 'evening:', (await h.locator('.card').innerText()).replace(/\s+/g, ' '));
    await p.screenshot({ path: __dirname + '/energy-evening-' + tag + '.png' });
    await h.locator('.kbtn[data-act="clear"]').click(); await p.waitForTimeout(200);
    console.log(tag, 'after clear:', await h.locator('.cardhead h1').first().innerText());
    console.log(tag, 'errors', JSON.stringify(errs));
    await p.close();
  }
  await b.close();
})();
