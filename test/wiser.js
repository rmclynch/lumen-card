// Wiser-style heating: a room device (climate) plus a separate valve device with settings switches.
// Only the heating may show; a real plug elsewhere must still show.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1366, height: 768 } });
  await p.goto('file://' + __dirname + '/test.html');
  const r = await p.evaluate(() => {
    const c = document.getElementById('c'); const h = c._hass;
    const S = (state, a) => ({ state, attributes: a });
    const states = Object.assign({}, h.states, {
      'climate.master_bedroom_wiser_room_heating': S('auto', { friendly_name: 'Master Bedroom Wiser Room Heating', current_temperature: 17.3, temperature: 18, hvac_modes: ['auto', 'heat', 'off'], hvac_action: 'idle' }),
      'switch.master_bedroom_wiser_room_window_detection': S('on', { friendly_name: 'Master Bedroom Wiser Room Window Detection' }),
      'sensor.master_bedroom_wiser_itrv_battery': S('80', { device_class: 'battery' }),
      'switch.master_bedroom_wiser_itrv_device_lock': S('on', { friendly_name: 'Master Bedroom Wiser iTRV Device Lock' }),
      'switch.master_bedroom_wiser_itrv_identify': S('off', { friendly_name: 'Master Bedroom Wiser iTRV Identify' }),
      'switch.back_room_plug': S('on', { friendly_name: 'Back room plug' }),
      'sensor.back_room_plug_power': S('40', { device_class: 'power' })
    });
    const entities = Object.assign({}, h.entities, {
      'climate.master_bedroom_wiser_room_heating': { device_id: 'room' }, 'switch.master_bedroom_wiser_room_window_detection': { device_id: 'room' },
      'sensor.master_bedroom_wiser_itrv_battery': { device_id: 'itrv' }, 'switch.master_bedroom_wiser_itrv_device_lock': { device_id: 'itrv' }, 'switch.master_bedroom_wiser_itrv_identify': { device_id: 'itrv' },
      'switch.back_room_plug': { device_id: 'plug' }, 'sensor.back_room_plug_power': { device_id: 'plug' }
    });
    const devices = Object.assign({}, h.devices, { room: { id: 'room', area_id: 'bedroom' }, itrv: { id: 'itrv', area_id: 'bedroom' }, plug: { id: 'plug', area_id: 'back_room' } });
    c.hass = Object.assign({}, h, { states, entities, devices });
    const m = c._model(); const room = (id) => m.flatMap((f) => f.rooms).find((x) => x.id === id).devs;
    return { bedroom: room('bedroom'), backroom: room('back_room') };
  });
  console.log(JSON.stringify(r, null, 1));
  await b.close();
})();
