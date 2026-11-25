// the gear opens Settings (saved per screen) with How to use Lumen inside
const { chromium } = require('playwright');
const q = (p, js) => p.evaluate(new Function('const s = document.getElementById("c").shadowRoot; const c = document.getElementById("c"); return (' + js + ');'));
const click = (p, sel) => p.evaluate((x) => document.getElementById('c').shadowRoot.querySelector(x).click(), sel);
(async () => {
  const b = await chromium.launch();
  for (const [name, vp, dsf] of [['big', { width: 1366, height: 768 }, 1], ['phone', { width: 390, height: 844 }, 2], ['small', { width: 480, height: 480 }, 1]]) {
    const p = await (await b.newContext({ viewport: vp, deviceScaleFactor: dsf })).newPage();
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    await p.goto('file://' + __dirname + '/test.html');
    await p.waitForTimeout(400);
    await click(p, '.setbtn');
    await p.waitForTimeout(400);
    const rows = await q(p, '[...s.querySelectorAll(".setrow .lbl")].map(x => x.textContent)');
    await p.screenshot({ path: __dirname + '/settings-' + name + '.png' });
    // change sky effects and pick a room, check they're saved for this screen
    await click(p, '[data-act="set"][data-key="effects"][data-val="showy"]');
    let picked = null;
    if (await q(p, '!!s.querySelector("select[data-key=room]")')) {
      await p.evaluate(() => { const el = document.getElementById('c').shadowRoot.querySelector('select[data-key=room]'); el.value = 'kitchen'; el.dispatchEvent(new Event('change', { bubbles: true })); });
      picked = await q(p, 'c._fav()');
    }
    const saved = await p.evaluate(() => localStorage.getItem('lumen-screen:' + location.pathname));
    const fx = await q(p, 'c._effects()');
    await click(p, '[data-act="help"]');
    await p.waitForTimeout(300);
    const howto = await q(p, 's.querySelector(".help h2").textContent');
    await p.screenshot({ path: __dirname + '/howto-' + name + '.png' });
    await click(p, '[data-act="settings"]');
    await click(p, '[data-act="help-close"]');
    const closed = await q(p, '!s.querySelector(".panel.help")');
    console.log(name, JSON.stringify({ rows, saved, fx, picked, howto, closed, errors }));
  }
  await b.close();
})();
