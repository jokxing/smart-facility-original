/**
 * Hardware 1A browser acceptance: homepage entry, list filters/pagination,
 * drawer restriction, unopened hardware routes blocked. Screenshots → docs/evidence/hardware-1a.
 * Requires demo already listening on DEMO_PORT (default 8088). No installs.
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
const profile = fs.mkdtempSync(path.join(cache, 'demo-hardware-1a-'));
const outDir = path.join(cache, 'demo-hardware-1a-shots');
fs.mkdirSync(outDir, {recursive: true});
const evidenceDir = path.resolve(__dirname, '../../docs/evidence/hardware-1a');

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
  await waitPage("!document.querySelector('[class*=\"enter-active\"], [class*=\"leave-active\"]')", 'transition done', 15000);
  await waitPage(`(() => {
    const root = document.querySelector('.hardware-home');
    if (!root) return true;
    const mask = root.querySelector('.el-loading-mask');
    if (!mask) return true;
    const style = getComputedStyle(mask);
    return style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0;
  })()`, 'hardware loading gone', 20000);
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
function findHardwareHomeExpr() {
  return `(() => {
    const root = document.querySelector('#app') && document.querySelector('#app').__vue__;
    const find = vm => (!vm ? null : (vm.$options.name === 'HardwareHome' ? vm : (vm.$children || []).map(find).find(Boolean)));
    return find(root);
  })()`;
}

(async () => {
  try {
    const activePort = path.join(profile, 'DevToolsActivePort');
    await waitFor(() => fs.existsSync(activePort), 'headless browser startup');
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
        send(allowed ? 'Fetch.continueRequest' : 'Fetch.failRequest', allowed ? {requestId} : {requestId, errorReason: 'BlockedByClient'})
          .catch(() => {});
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
    await waitPage("!!document.querySelector('.login-button')", 'login page');
    await waitPage("document.querySelector('.captcha-code-class img').naturalWidth > 0", 'captcha');
    await fill('Demo1234');
    await waitPage("location.hash === '#/dashboard' && !!document.querySelector('.bashboard-session')", 'dashboard');

    // Homepage card → hardware home
    await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => vm.$options.name === 'Dashboard' ? vm : (vm.$children || []).map(find).find(Boolean);
      const dash = find(root);
      const item = dash.menuList.find(m => m.id === 'lhd' || (m.path && m.path.indexOf('/lhd/hardware') !== -1));
      if (!item) throw new Error('hardware menu card missing');
      dash.handleForward(item.id, item.path, dash.menuList.indexOf(item));
    })()`);
    await waitPage("location.hash === '#/lhd/hardware/home' && !!document.querySelector('.hardware-home')", 'hardware home from card');
    await waitPage(`${findHardwareHomeExpr()} && ${findHardwareHomeExpr()}.device.length === 10 && !${findHardwareHomeExpr()}.loading`, 'first page has 10 rows');
    await waitPage(`${findHardwareHomeExpr()}.total > 10`, 'total spans multiple pages');
    await screenshot('01-hardware-list');

    // Keyword hit
    await evaluate(`(() => {
      const vm = ${findHardwareHomeExpr()};
      vm.items.keyword = 'EQ-TH';
      vm.handleQuery(vm.items.equipmentType, vm.items.deviceType);
    })()`);
    await waitPage(`${findHardwareHomeExpr()} && !${findHardwareHomeExpr()}.loading && ${findHardwareHomeExpr()}.device.length === 3 && ${findHardwareHomeExpr()}.items.pageNum === 1`, 'keyword search hits');
    await screenshot('02-search-hit');

    // Keyword miss
    await evaluate(`(() => {
      const vm = ${findHardwareHomeExpr()};
      vm.items.keyword = 'NO_MATCH_XYZ_999';
      vm.handleQuery(vm.items.equipmentType, vm.items.deviceType);
    })()`);
    await waitPage(`${findHardwareHomeExpr()} && !${findHardwareHomeExpr()}.loading && ${findHardwareHomeExpr()}.device.length === 0 && ${findHardwareHomeExpr()}.total === 0`, 'keyword empty');
    await screenshot('03-search-empty');

    // Department + type combo, then clear
    await evaluate(`(() => {
      const vm = ${findHardwareHomeExpr()};
      vm.items.keyword = '';
      vm.items.departmentId = 900102;
      vm.items.deviceType = 1;
      vm.items.equipmentType = null;
      vm.items.pageNum = 1;
      vm.getList();
    })()`);
    await waitPage(`${findHardwareHomeExpr()} && !${findHardwareHomeExpr()}.loading && ${findHardwareHomeExpr()}.device.length > 0 && ${findHardwareHomeExpr()}.device.every(r => r.departmentId === 900102 && r.deviceType === 1)`, 'dept+type filter');

    // Reset filters, open page 2
    await evaluate(`(() => {
      const vm = ${findHardwareHomeExpr()};
      vm.items.keyword = '';
      vm.items.departmentId = null;
      vm.items.deviceType = 0;
      vm.items.equipmentType = null;
      vm.items.pageNum = 1;
      vm.getList();
    })()`);
    await waitPage(`${findHardwareHomeExpr()} && !${findHardwareHomeExpr()}.loading && ${findHardwareHomeExpr()}.device.length === 10`, 'reset to full list');
    await evaluate(`(() => {
      const vm = ${findHardwareHomeExpr()};
      vm.items.pageNum = 2;
      vm.getList();
    })()`);
    await waitPage(`${findHardwareHomeExpr()} && !${findHardwareHomeExpr()}.loading && ${findHardwareHomeExpr()}.items.pageNum === 2 && ${findHardwareHomeExpr()}.device.length > 0`, 'page 2');
    const page2First = await evaluate(`${findHardwareHomeExpr()}.device[0].id`);
    await screenshot('04-page-2');

    // Filter change resets pageNum via handleQuery
    await evaluate(`(() => {
      const vm = ${findHardwareHomeExpr()};
      vm.items.pageNum = 2;
      vm.handleQueryDeviceType(2);
    })()`);
    await waitPage(`${findHardwareHomeExpr()} && !${findHardwareHomeExpr()}.loading && ${findHardwareHomeExpr()}.items.pageNum === 1 && ${findHardwareHomeExpr()}.items.deviceType === 2`, 'filter resets page');
    assert.notEqual(page2First, await evaluate(`${findHardwareHomeExpr()}.device[0] && ${findHardwareHomeExpr()}.device[0].id`), 'page2 id differs after filter');

    // Sort name asc
    await evaluate(`(() => {
      const vm = ${findHardwareHomeExpr()};
      vm.items.deviceType = 0;
      vm.items.equipmentType = null;
      vm.sortChange({prop: 'name', order: 'ascending'});
    })()`);
    await waitPage(`${findHardwareHomeExpr()} && !${findHardwareHomeExpr()}.loading && ${findHardwareHomeExpr()}.columnSort.name === 'asc'`, 'sort applied');
    const sorted = await evaluate(`${findHardwareHomeExpr()}.device.map(r => r.name)`);
    assert.deepEqual(sorted, [...sorted].sort((a, b) => a.localeCompare(b, 'zh')));

    // Status mapping present in seed page
    await evaluate(`(() => {
      const vm = ${findHardwareHomeExpr()};
      vm.items.keyword = '';
      vm.items.departmentId = null;
      vm.items.deviceType = 0;
      vm.items.equipmentType = null;
      Object.keys(vm.columnSort).forEach(k => { vm.columnSort[k] = ''; });
      vm.items.pageNum = 1;
      vm.items.pageSize = 50;
      vm.getList();
    })()`);
    await waitPage(`${findHardwareHomeExpr()} && !${findHardwareHomeExpr()}.loading && ${findHardwareHomeExpr()}.device.length >= 15`, 'full list for status check');
    const statusFlags = await evaluate(`(() => {
      const rows = ${findHardwareHomeExpr()}.device;
      return {
        normal: rows.some(r => r.status === 1),
        alarm: rows.some(r => r.status === -1),
        offline: rows.some(r => r.status === -100)
      };
    })()`);
    assert.equal(statusFlags.normal, true);
    assert.equal(statusFlags.alarm, true);
    assert.equal(statusFlags.offline, true);

    // Supported details are covered by 1B; unknown types remain restricted.
    await evaluate(`(() => {
      const table = ${findHardwareHomeExpr()}.$children.find(c => c.handleShowDrawer);
      table.handleShowDrawer({id: 999999, strId: '999999', equipmentTypeCode: 999, openTwoSystem: true});
    })()`);
    await waitPage("Array.from(document.querySelectorAll('.el-message')).some(e => /详情|尚未接入/.test(e.textContent))", 'detail restricted message');
    assert.equal(await evaluate(`${findHardwareHomeExpr()}.$children.some(c => c.deviceDrawer || c.deviceDrawerNew)`), false, 'no device drawer opened');

    // Refresh stays on hardware
    await send('Page.reload', {ignoreCache: true});
    await waitPage("location.hash === '#/lhd/hardware/home' && !!document.querySelector('.hardware-home')", 'refresh keeps hardware');
    await waitPage(`${findHardwareHomeExpr()} && !${findHardwareHomeExpr()}.loading && ${findHardwareHomeExpr()}.device.length > 0`, 'list after refresh');
    await screenshot('05-after-refresh');

    // Unopened hardware child route blocked
    await evaluate("location.hash = '#/lhd/device'");
    await waitPage("location.hash === '#/dashboard'", 'device manage still blocked');

    // Return home from hardware again then dashboard logo/nav
    await evaluate("location.hash = '#/lhd/hardware/home'");
    await waitPage("location.hash === '#/lhd/hardware/home' && !!document.querySelector('.hardware-home')", 'direct hardware access');
    await evaluate("location.hash = '#/dashboard'");
    await waitPage("location.hash === '#/dashboard' && !!document.querySelector('.bashboard-session')", 'back to dashboard');
    await screenshot('06-back-dashboard');

    assert.equal(externalAttempts, 0, 'no external requests');
    assert.equal(exceptions.length, 0, 'uncaught: ' + exceptions.join(' | '));
    publishEvidence();
    console.log(JSON.stringify({
      passed: true,
      hardwareEntry: true,
      searchHitEmpty: true,
      filterPaginationSort: true,
      statusMapping: true,
      detailRestricted: true,
      refresh: true,
      unopenedDeviceBlocked: true,
      evidenceDir,
      externalAttempts,
      uncaughtExceptions: exceptions.length
    }));
  } finally {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try { await send('Browser.close', {}, null); } catch (_) {}
      socket.close();
    }
    for (const job of pending.values()) job.reject(new Error('Browser test closed'));
    browser.kill();
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
