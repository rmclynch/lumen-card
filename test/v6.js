// 0.6: rail counts, favourite room + going home, camera, phone and small layouts
const { chromium } = require('playwright');
const LAYOUT = { hall: [0, 0, 15, 100], living_room: [17.5, 0, 45, 55], back_room: [65, 0, 35, 35], kitchen: [17.5, 57.5, 40, 42.5], dining_room: [65, 37.5, 35, 62.5], bedroom: [0, 0, 50, 60], eli_room: [52.5, 0, 47.5, 45], martha_room: [52.5, 47.5, 47.5, 52.5], jude_room: [0, 0, 47.5, 100], lollie_room: [50, 0, 50, 100] };
const out = (n) => __dirname + '/' + n + '.png';
const card = (p, fn, arg) => p.evaluate(fn, arg);

async function open(b, viewport, opts = {}) {
  const ctx = await b.newContext({ viewport, deviceScaleFactor: opts.dsf || 1 });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  if (opts.fav) await p.addInitScript((f) => { localStorage.setItem('lumen-fav:' + location.pathname, f); }, opts.fav);
  await p.goto('file://' + __dirname + '/test.html');
  await card(p, (L) => { const c = document.getElementById('c'); c.setConfig({ layout: L }); c.hass = c._hass; }, LAYOUT);
  await p.waitForTimeout(500);
  return { p, errors, ctx };
}
const sr = (p, js) => p.evaluate(new Function('const s = document.getElementById("c").shadowRoot; const c = document.getElementById("c"); return (' + js + ');'));
const click = (p, sel) => p.evaluate((q) => { const el = document.getElementById('c').shadowRoot.querySelector(q); if (!el) throw new Error('no ' + q); el.click(); }, sel);

(async () => {
  const b = await chromium.launch();
  const report = {};

  // ---- 1. rail counts (laptop) ----
  let { p, errors } = await open(b, { width: 1366, height: 768 });
  report.mode = await sr(p, 'c._modeNow');
  report.counts = await sr(p, '[...s.querySelectorAll("nav.rail .kbtn")].map(k => k.querySelector(".klbl").textContent + "=" + (k.querySelector(".kcount") ? k.querySelector(".kcount").textContent : "-"))');
  await p.screenshot({ path: out('v6-rail') });

  // ---- 2. favourite: star the kitchen, reload, it opens there; wander off, come home ----
  await click(p, '.room[data-id="kitchen"]');
  await p.waitForTimeout(100);
  report.starBefore = await sr(p, 's.querySelector(".pill.star").textContent.trim()');
  await click(p, '.pill.star');
  await p.waitForTimeout(100);
  report.starAfter = await sr(p, 's.querySelector(".pill.star").textContent.trim()');
  report.stored = await p.evaluate(() => localStorage.getItem('lumen-fav:' + location.pathname));
  await p.screenshot({ path: out('v6-fav') });
  await p.reload();
  await card(p, (L) => { const c = document.getElementById('c'); c.setConfig({ layout: L }); c.hass = c._hass; }, LAYOUT);
  await p.waitForTimeout(400);
  report.openedOnReload = await sr(p, 'c._view.room');
  await click(p, '[data-act="close"]');
  await click(p, '.lbtn[data-id="first"]');
  report.wandered = await sr(p, 'JSON.stringify(c._view)');
  await sr(p, '(c._goHomeIfIdle(), c._view.room)');
  report.homeTooSoon = await sr(p, 'c._view.room');
  await sr(p, '(c._lastTouch = Date.now() - 5 * 60000 - 1000, c._goHomeIfIdle(), c._view.room)');
  report.homeAfter5 = await sr(p, 'c._view.room + " floor=" + c._view.floor');

  // ---- 3. camera ----
  await click(p, '.lbtn[data-id=""]');
  await click(p, '.room[data-id="living_room"]');
  await click(p, '.pill[data-act="entity"][data-id="camera.front_room_camera"]');
  await p.waitForTimeout(300);
  report.camera = await sr(p, '({ img: !!s.querySelector(".camslot img"), arrows: s.querySelectorAll(".dpad .ibtn").length, switches: [...s.querySelectorAll(".camwrap .opts .pill")].map(x => x.textContent.trim()), note: (s.querySelector(".camnote") || {}).textContent })');
  const img1 = await sr(p, 's.querySelector(".camslot img") === c._cam.img');
  await click(p, '.dpad .ibtn[aria-label="Turn camera left"]');
  // something else in the house changes: the picture must survive the redraw
  await sr(p, '(c._hass = Object.assign({}, c._hass, { states: Object.assign({}, c._hass.states, { "light.kitchen_bulb": { state: "off", attributes: c._hass.states["light.kitchen_bulb"].attributes } }) }), c.hass = c._hass, 1)');
  await p.waitForTimeout(200);
  report.sameImgAfterRedraw = img1 && await sr(p, 'c._cam && s.querySelector(".camslot img") === c._cam.img');
  report.calls = await p.evaluate(() => window.calls.filter((x) => x[0] === 'button'));
  await p.screenshot({ path: out('v6-camera') });
  await click(p, '[data-act="close-bg"]');
  report.camStopped = await sr(p, 'c._cam === null');
  report.errorsFull = errors;

  // ---- 4. phone ----
  ({ p, errors } = await open(b, { width: 390, height: 844 }, { dsf: 2, fav: 'kitchen' }));
  report.phone = await sr(p, '({ mode: c._modeNow, room: c._view.room, sections: s.querySelectorAll(".fsec").length, star: !!s.querySelector(".pill.star"), hscroll: document.documentElement.scrollWidth > innerWidth })');
  await p.screenshot({ path: out('v6-phone-house') });
  await click(p, '.kbtn[data-id="light"]');
  await p.waitForTimeout(150);
  await p.screenshot({ path: out('v6-phone-lights') });
  await click(p, '[data-act="kinds-done"]');
  await click(p, '.room[data-id="lollie_room"]');
  await p.waitForTimeout(150);
  await click(p, '.pill[data-act="entity"]');
  await p.waitForTimeout(400);
  await p.screenshot({ path: out('v6-phone-radiator') });
  report.errorsPhone = errors;

  // ---- 5. small square screen ----
  ({ p, errors } = await open(b, { width: 480, height: 480 }, { fav: 'kitchen' }));
  report.small = await sr(p, '({ mode: c._modeNow, room: c._view.room, tiles: [...s.querySelectorAll(".smgrid .tile")].map(t => t.querySelector(".tn").textContent) })');
  await p.screenshot({ path: out('v6-small-room') });
  await click(p, '.smgrid .tile[data-act="toggle"]');
  report.smallToggle = await p.evaluate(() => window.calls.slice(-1));
  await click(p, '[data-act="sm-up"]');
  await p.waitForTimeout(100);
  await p.screenshot({ path: out('v6-small-floor') });
  await click(p, '[data-act="sm-up"]');
  await p.waitForTimeout(100);
  report.smallHome = await sr(p, '[...s.querySelectorAll(".smgrid .tile")].map(t => t.textContent.replace(/\\s+/g, " ").trim())');
  await p.screenshot({ path: out('v6-small-house') });
  await click(p, '.tile[data-id="attic"]');
  await click(p, '.tile[data-id="lollie_room"]');
  await click(p, '.tile[data-act="entity"]');
  await p.waitForTimeout(400);
  await p.screenshot({ path: out('v6-small-radiator') });
  await click(p, '[data-act="back"]');
  report.smallBackToRoom = await sr(p, 'c._view.room + " panel=" + !!s.querySelector(".panel")');
  report.errorsSmall = errors;

  console.log(JSON.stringify(report, null, 1));
  await b.close();
})();
