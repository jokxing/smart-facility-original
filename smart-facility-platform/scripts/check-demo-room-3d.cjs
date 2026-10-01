/**
 * Room management 3D: device-management add (unmapped) → room detail「未监测设备」tab.
 * Evidence → docs/evidence/room-management-3d. Requires demo on DEMO_PORT (default 8088).
 */
const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const {setTimeout: sleep} = require('node:timers/promises');

const origin = 'http://127.0.0.1:' + Number(process.env.DEMO_PORT || 8088);
const executable = process.env.DEMO_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const cache = path.resolve(__dirname, '../node_modules/.cache');
fs.mkdirSync(cache, {recursive: true});
const profile = fs.mkdtempSync(path.join(cache, 'demo-room-3d-'));
const outDir = path.join(cache, 'demo-room-3d-shots');
fs.mkdirSync(outDir, {recursive: true});
const evidenceDir = path.resolve(__dirname, '../../docs/evidence/room-management-3d');

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
    pending.set(id, {resolve: value => {clearTimeout(timer); resolve(value);}, reject: error => {pending.delete(id); reject(error);}});
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

const findLab = `(() => {
  const root = document.querySelector('#app') && document.querySelector('#app').__vue__;
  const walk = vm => {
    if (!vm) return null;
    if (vm.handleInstrumentList && vm.dataSource && vm.items && vm.gather) return vm;
    for (const child of (vm.$children || [])) {
      const hit = walk(child);
      if (hit) return hit;
    }
    return null;
  };
  return walk(root);
})()`;

const findModal = `(() => {
  const root = document.querySelector('#app') && document.querySelector('#app').__vue__;
  const walk = vm => {
    if (!vm) return null;
    if (vm.handleFormSubmit && vm.ruleForm && vm.addAsny) return vm;
    for (const child of (vm.$children || [])) {
      const hit = walk(child);
      if (hit) return hit;
    }
    return null;
  };
  return walk(root);
})()`;

const findRoom = `(() => {
  const root = document.querySelector('#app') && document.querySelector('#app').__vue__;
  const walk = vm => {
    if (!vm) return null;
    if (vm.handleGetRoomList && vm.room && vm.items && vm.totalObject) return vm;
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
    if (vm.isDrawer && vm.detail && vm.detail.id && vm.getDetail && vm.handleProbeNameEdit !== undefined) return vm;
    for (const child of (vm.$children || [])) {
      const hit = walk(child);
      if (hit) return hit;
    }
    return null;
  };
  return walk(root);
})()`;

const findMonitor = `(() => {
  const tabs = document.querySelector('.room-drawer .el-tabs');
  if (!tabs || !tabs.__vue__) return null;
  let p = tabs.__vue__;
  while (p) {
    if (p.handleGetRoomMonitorInstrument && p.handleInstrumentListQuery && p.monitorStatus != null) return p;
    p = p.$parent;
  }
  return null;
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
    await evaluate(`(() => {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.indexOf('instrumentDeleted') >= 0 || k.indexOf('instrumentMeta') >= 0 || k.indexOf('instrumentCreated') >= 0)) keys.push(k);
      }
      keys.forEach(k => localStorage.removeItem(k));
    })()`);
    await waitPage("document.querySelector('.captcha-code-class img').naturalWidth > 0", 'captcha');
    await fill('Demo1234');
    await waitPage("location.hash === '#/dashboard'", 'dashboard');

    // Device management → add unmapped instrument into room A (same path as 2G).
    await evaluate(`(() => {
      const cards = Array.from(document.querySelectorAll('.bashboard-session .div-a, .bashboard-session [class*="div"]'));
      const hit = cards.find(el => (el.textContent || '').includes('设备管理'));
      if (!hit) throw new Error('设备管理 card not found');
      hit.click();
    })()`);
    await waitPage("location.hash.indexOf('/ld/labdevice') >= 0", 'labdevice route');
    await waitPage(`${findLab} && !${findLab}.refreshLoading && ${findLab}.total === 12`, 'list ready 12');

    await evaluate(`(() => { ${findLab}.$store.commit('lab/ADDMODAL'); })()`);
    await waitPage(`${findLab}.modalVisible === true`, 'modalVisible');
    await waitPage("!!document.querySelector('.labDevice-modal')", 'add modal DOM');
    await waitPage(`!!(${findModal} && ${findModal}.addAsny)`, 'add modal vm');
    await evaluate(`(async () => {
      const modal = ${findModal};
      modal.ruleForm = {
        ...modal.ruleForm,
        name: '演示未上图培养箱',
        no: '',
        departmentId: '900101',
        types: 1,
        roomId: 950001,
        roomName: '演示房间 A'
      };
      await modal.$nextTick();
      modal.handleFormSubmit('labDeviceForm');
      return true;
    })()`);
    await waitPage(`${findLab} && !${findLab}.refreshLoading && ${findLab}.total === 13`, 'list total 13');
    await evaluate(`(() => {
      const page = ${findLab};
      page.items.keyword = '演示未上图培养箱';
      page.handleSearchFormButtonClick('search');
    })()`);
    await waitPage(`${findLab} && !${findLab}.refreshLoading && ${findLab}.total === 1`, 'search created');
    const pinnedId = await evaluate(`${findLab}.dataSource[0].id`);
    assert.ok(pinnedId >= 970101);
    await screenshot('01-after-add');

    // Room management → room A detail
    await evaluate("window.location.hash = '#/dashboard'");
    await waitPage("location.hash === '#/dashboard'", 'dashboard again');
    await waitPage("!!document.querySelector('.bashboard-session')", 'dashboard cards');
    await evaluate(`(() => {
      const cards = Array.from(document.querySelectorAll('.bashboard-session .div-a, .bashboard-session [class*="div"]'));
      const hit = cards.find(el => (el.textContent || '').includes('房间管理'));
      if (!hit) throw new Error('房间管理 card not found');
      hit.click();
    })()`);
    await waitPage("location.hash.indexOf('/rm/room') >= 0", 'room route');
    await waitPage(`${findRoom} && !${findRoom}.refreshLoading && ${findRoom}.room.length > 0`, 'room list');

    await evaluate(`(() => {
      const page = ${findRoom};
      page.handleShowDrawer(page.room.find(r => r.id === 950001));
    })()`);
    await waitPage(`${findDrawer} && !${findDrawer}.loading && ${findDrawer}.detail && ${findDrawer}.detail.id === 950001`, 'detail A');
    await waitPage(`${findMonitor} && ${findMonitor}.monitor && ${findMonitor}.monitor.length === 6`, 'on-map six');
    await screenshot('02-monitored');

    await evaluate(`(() => {
      const m = ${findMonitor};
      m.monitorStatus = '2';
      m.handleCutMonitor();
    })()`);
    await waitPage(`${findMonitor} && !${findMonitor}.loading && ${findMonitor}.monitorTotal === 1`, 'unmonitored one');
    assert.equal(await evaluate(`${findMonitor}.noMonitor[0].id`), pinnedId);
    assert.match(await evaluate(`${findMonitor}.noMonitor[0].name`), /未上图培养箱/);
    assert.equal(await evaluate(`!document.querySelector('.icon-add-to')`), true);
    await screenshot('03-unmonitored');

    await evaluate(`(() => {
      const m = ${findMonitor};
      m.monitorStatus = '1';
      m.handleCutMonitor();
    })()`);
    await waitPage(`${findMonitor} && !${findMonitor}.loading && ${findMonitor}.monitor.length === 6`, 'on-map still six');
    await screenshot('04-monitored-again');

    publishEvidence();
    assert.equal(externalAttempts, 0, 'external attempts');
    const serious = exceptions.filter(text =>
      !/ResizeObserver|non-passive|favicon|signError|签名|getNode|SelectTree/i.test(text)
    );
    assert.equal(serious.length, 0, 'uncaught: ' + serious.slice(0, 3).join(' | '));
    console.log('room-management-3d browser OK; externalAttempts=' + externalAttempts + '; evidence=' + evidenceDir);
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
