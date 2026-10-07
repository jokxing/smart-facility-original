/**
 * Pipette gun rack: tabs, list/stats, drawer take/return. Evidence → docs/evidence/pipette-rack.
 * Requires demo on DEMO_PORT (default 8089).
 */
const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const {setTimeout: sleep} = require('node:timers/promises');

const origin = 'http://127.0.0.1:' + Number(process.env.DEMO_PORT || 8089);
const executable = process.env.DEMO_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const cache = path.resolve(__dirname, '../node_modules/.cache');
fs.mkdirSync(cache, {recursive: true});
const profile = fs.mkdtempSync(path.join(cache, 'demo-pipette-rack-'));
const outDir = path.join(cache, 'demo-pipette-rack-shots');
fs.mkdirSync(outDir, {recursive: true});
const evidenceDir = path.resolve(__dirname, '../../docs/evidence/pipette-rack');

const browser = spawn(executable, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--disable-background-networking', '--disable-component-update', '--disable-sync',
  '--disable-extensions', '--disable-features=msEdgeSidebarV2',
  '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1, EXCLUDE localhost',
  '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1',
  '--user-data-dir=' + profile, 'about:blank'
], {windowsHide: true, stdio: 'ignore'});
let socket;
let launchError;
browser.on('error', error => { launchError = error; });
const pending = new Map();
let nextId = 0;
let sessionId;
let externalAttempts = 0;
const exceptions = [];

async function waitFor(check, label, timeout = 45000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (launchError) throw launchError;
    if (await check()) return;
    await sleep(150);
  }
  throw new Error('Timeout: ' + label);
}
function send(method, params = {}, target = sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, 30000);
    pending.set(id, {resolve: value => {clearTimeout(timer); resolve(value);}, reject: error => {clearTimeout(timer); reject(error);}});
    socket.send(JSON.stringify({id, method, params, ...(target ? {sessionId: target} : {})}));
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
  if (result.exceptionDetails) {
    throw new Error('eval failed: ' + (result.exceptionDetails.exception && result.exceptionDetails.exception.description || result.exceptionDetails.text));
  }
  return result.result.value;
}
async function waitPage(expression, label, timeout = 45000) {
  await waitFor(async () => {
    try { return !!(await evaluate(expression)); } catch (_) { return false; }
  }, label, timeout);
}
async function screenshot(name) {
  await waitPage("!document.querySelector('[class*=\"enter-active\"], [class*=\"leave-active\"]')", 'transition', 15000);
  await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  await sleep(400);
  const {data} = await send('Page.captureScreenshot', {format: 'png'});
  fs.writeFileSync(path.join(outDir, name + '.png'), Buffer.from(data, 'base64'));
}
function publishEvidence() {
  fs.mkdirSync(evidenceDir, {recursive: true});
  for (const file of fs.readdirSync(outDir).filter(name => /\.png$/.test(name))) {
    fs.copyFileSync(path.join(outDir, file), path.join(evidenceDir, file));
  }
}
async function fill(password) {
  await evaluate(`(() => {
    const inputs = [document.querySelector('input[name="username"]'), document.querySelector('input[name="password"]'), document.querySelector('input[tabindex="3"]')];
    ['demo', ${JSON.stringify(password)}, '2468'].forEach((value, index) => {
      inputs[index].value = value; inputs[index].dispatchEvent(new Event('input', {bubbles:true}));
    });
  })()`);
  await evaluate("document.querySelector('.login-button').click()");
}

const findRack = `(() => {
  const root = document.querySelector('#app') && document.querySelector('#app').__vue__;
  const walk = vm => {
    if (!vm) return null;
    if (vm.items && vm.items.equipmentType === 13 && Array.isArray(vm.pipetteGun) && vm.getDashboard) return vm;
    for (const child of (vm.$children || [])) {
      const hit = walk(child);
      if (hit) return hit;
    }
    return null;
  };
  return walk(root);
})()`;

const findDrawer = `(() => {
  const root = document.querySelector('#app') && document.querySelector('#app').__vue__;
  const walk = vm => {
    if (!vm) return null;
    if (vm.$options && vm.$options.name === 'GunRackDrawer' && vm.isDrawer) return vm;
    for (const child of (vm.$children || [])) {
      const hit = walk(child);
      if (hit) return hit;
    }
    return null;
  };
  return walk(root);
})()`;

(async () => {
  try {
    const activePort = path.join(profile, 'DevToolsActivePort');
    await waitFor(() => fs.existsSync(activePort), 'browser start');
    const [port, endpoint] = fs.readFileSync(activePort, 'utf8').trim().split(/\r?\n/);
    socket = new WebSocket('ws://127.0.0.1:' + port + endpoint);
    await new Promise((resolve, reject) => {socket.onopen = resolve; socket.onerror = reject;});
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id && pending.has(message.id)) {
        const job = pending.get(message.id); pending.delete(message.id);
        if (message.error) job.reject(new Error(message.error.message)); else job.resolve(message.result);
      }
      if (message.method === 'Runtime.exceptionThrown') {
        const details = message.params.exceptionDetails || {};
        exceptions.push(String((details.exception && (details.exception.description || details.exception.value)) || details.text || JSON.stringify(details)));
      }
      if (message.method === 'Fetch.requestPaused') {
        const {requestId, request} = message.params;
        const allowed = request.url.startsWith(origin + '/') || /^(data:|blob:|about:)/.test(request.url);
        if (!allowed) externalAttempts++;
        send(allowed ? 'Fetch.continueRequest' : 'Fetch.failRequest', allowed ? {requestId} : {requestId, errorReason: 'BlockedByClient'}).catch(() => {});
      }
    };
    const target = await send('Target.createTarget', {url: 'about:blank'}, null);
    sessionId = (await send('Target.attachToTarget', {targetId: target.targetId, flatten: true}, null)).sessionId;
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440, height: 900, screenWidth: 1440, screenHeight: 900, deviceScaleFactor: 1, mobile: false
    });
    await send('Fetch.enable', {patterns: [{urlPattern: '*'}]});

    await send('Page.navigate', {url: origin + '/#/login'});
    await waitPage("!!document.querySelector('.login-button')", 'login');
    await waitPage("document.querySelector('.captcha-code-class img').naturalWidth > 0", 'captcha');
    await fill('Demo1234');
    await waitPage("location.hash === '#/dashboard'", 'dashboard');

    await send('Page.navigate', {url: origin + '/#/lhd/pipetteGun/pipetteGun'});
    await waitPage("location.hash.indexOf('/lhd/pipetteGun/pipetteGun') >= 0", 'gun tab');
    await waitPage("!!document.querySelector('.el-tabs')", 'tabs');
    const tabLabels = await evaluate(`Array.from(document.querySelectorAll('.el-tabs__item')).map(el => el.textContent.trim())`);
    assert.ok(tabLabels.some(t => t.includes('移液枪')), 'gun tab label');
    assert.ok(tabLabels.some(t => t.includes('枪架管理')), 'rack tab label');
    await screenshot('01-gun-tab');

    await evaluate(`(() => {
      const tabs = Array.from(document.querySelectorAll('.el-tabs__item'));
      const rack = tabs.find(el => el.textContent.includes('枪架管理'));
      if (!rack) throw new Error('rack tab missing');
      rack.click();
    })()`);
    await waitPage("location.hash.indexOf('pipetteGunRack') >= 0", 'rack route');
    await waitPage(`${findRack} && !${findRack}.loading && ${findRack}.pipetteGun.length === 2`, 'rack list');
    const dash = await evaluate(`(() => {
      const page = ${findRack};
      return {
        total: page.totalObject.total.num,
        online: page.totalObject.overview[0].num,
        offline: page.totalObject.overview[1].num,
        rows: page.pipetteGun.map(r => ({id: r.id, name: r.name, status: r.status, roomName: r.roomName}))
      };
    })()`);
    assert.equal(dash.total, 2);
    assert.equal(dash.online, 1);
    assert.equal(dash.offline, 1);
    assert.ok(dash.rows.some(r => r.id === 980023 && r.roomName === '演示房间 A'));
    await screenshot('02-rack-list');

    const sidebarActive = await evaluate(`(() => {
      const active = document.querySelector('.el-menu-vertical-demo .el-menu-item.is-active');
      return active ? (active.getAttribute('index') || active.textContent.trim()) : '';
    })()`);
    assert.ok(/pipetteGun|移液枪/.test(String(sidebarActive)), 'sidebar stays on pipette entry: ' + sidebarActive);

    await evaluate(`(() => {
      const page = ${findRack};
      const row = page.pipetteGun.find(r => r.id === 980023);
      page.handleShowDrawer(row);
    })()`);
    await waitPage(`${findDrawer} && !${findDrawer}.loading && ${findDrawer}.list.length === 4`, 'drawer slots');
    const slots = await evaluate(`(() => {
      const d = ${findDrawer};
      return {
        name: d.powerOutage.name,
        status: d.powerOutage.status,
        empty: d.list.filter(s => s.no === 'null').length,
        bound: d.list.filter(s => s.no !== 'null').length
      };
    })()`);
    assert.equal(slots.name, '演示移液枪架 A');
    assert.equal(slots.empty, 1);
    assert.equal(slots.bound, 3);
    await screenshot('03-rack-detail');

    await evaluate(`${findDrawer}.handleDemoTake()`);
    await waitPage(`${findDrawer} && !${findDrawer}.demoBusy`, 'take done');
    await sleep(300);
    const afterTake = await evaluate(`(() => {
      const d = ${findDrawer};
      return d.list.filter(s => s.no !== 'null' && Number(s.homingStatus) !== 1).length;
    })()`);
    assert.ok(afterTake >= 2, 'in-use slots after take');
    await screenshot('04-after-take');

    const returningId = await evaluate(`${findDrawer}.list.find(s => s.pipetteGunId && s.no !== 'null' && Number(s.homingStatus) !== 1).pipetteGunId`);
    await evaluate(`${findDrawer}.handleDemoReturn()`);
    await waitPage(`${findDrawer} && !${findDrawer}.demoBusy`, 'return done');
    await sleep(300);
    const returned = await evaluate(`${findDrawer}.list.find(s => s.pipetteGunId === ${returningId})`);
    assert.equal(returned.homingStatus, 1, 'returned gun is on rack');
    assert.ok(returned.homingTime, 'return timestamp exists');
    await screenshot('05-after-return');

    await evaluate(`${findDrawer}.handleClose()`);
    await waitPage(`!${findDrawer}`, 'drawer closed');
    await waitPage(`${findRack} && !${findRack}.loading`, 'list refresh');
    await screenshot('06-back-list');

    publishEvidence();
    assert.equal(externalAttempts, 0, 'no external requests');
    assert.equal(exceptions.length, 0, 'no uncaught page exceptions: ' + exceptions.join(' | '));
    console.log('pipette-rack browser check ok');
    console.log('evidence:', evidenceDir);
    process.exitCode = 0;
  } catch (error) {
    console.error(error);
    try { publishEvidence(); } catch (_) {}
    process.exitCode = 1;
  } finally {
    try { if (socket) socket.close(); } catch (_) {}
    try { browser.kill(); } catch (_) {}
    try { fs.rmSync(profile, {recursive: true, force: true}); } catch (_) {}
  }
})();
