/**
 * System 6A: sidebar → /sys/department read-only list filter/page; write buttons disabled.
 * Evidence → docs/evidence/system-6a. Requires demo on DEMO_PORT (default 8088).
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
const profile = fs.mkdtempSync(path.join(cache, 'demo-system-6a-'));
const outDir = path.join(cache, 'demo-system-6a-shots');
fs.mkdirSync(outDir, {recursive: true});
const evidenceDir = path.resolve(__dirname, '../../docs/evidence/system-6a');

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

const findPage = `(() => {
  const root = document.querySelector('#app') && document.querySelector('#app').__vue__;
  const walk = vm => {
    if (!vm) return null;
    if (vm.handleGetUserList && vm.userListParams && Array.isArray(vm.dataSource) && vm.handleWholeDept) return vm;
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
    await waitPage("!!document.querySelector('.bashboard-session') && !document.querySelector('[class*=\"enter-active\"]')", 'dashboard settled');
    await screenshot('01-dashboard');

    // Homepage「系统」card must open /sys/department (not blocked /sys/user).
    await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => vm.$options.name === 'Dashboard' ? vm : (vm.$children || []).map(find).find(Boolean);
      const dash = find(root);
      const item = dash.menuList.find(m => m.id === 'sys');
      if (!item) throw new Error('system menu card missing');
      if (item.path !== '/sys/department') throw new Error('system card path is ' + item.path);
      dash.handleForward(item.id, item.path, dash.menuList.indexOf(item));
    })()`);
    await waitPage("location.hash.indexOf('/sys/department') >= 0", 'department from homepage card');
    await waitPage(`${findPage} && !${findPage}.tableLoading && ${findPage}.dataSource.length > 0`, 'list ready');
    assert.equal(await evaluate(`${findPage}.isDemo`), true);
    assert.equal(await evaluate(`${findPage}.total`), 3);
    assert.equal(await evaluate(`${findPage}.dataSource.length`), 3);
    const writeDisabled = await evaluate(`(() => {
      const buttons = Array.from(document.querySelectorAll('.department .btn-group .el-button, .department .page-content-left .el-button'));
      const importBtn = buttons.find(btn => btn.classList.contains('icon-upload'));
      const exportBtn = buttons.find(btn => btn.classList.contains('icon-download1'));
      return {
        importDisabled: !!(importBtn && (importBtn.disabled || importBtn.classList.contains('is-disabled'))),
        exportDisabled: !!(exportBtn && (exportBtn.disabled || exportBtn.classList.contains('is-disabled'))),
        modalVisible: !!${findPage}.modalVisible,
        importVisible: !!${findPage}.importFileVisible
      };
    })()`);
    assert.equal(writeDisabled.importDisabled, true, 'import should stay disabled');
    assert.equal(writeDisabled.exportDisabled, true, 'export should stay disabled');
    assert.equal(writeDisabled.modalVisible, false);
    assert.equal(writeDisabled.importVisible, false);
    await screenshot('02-list');

    await evaluate(`(() => {
      const page = ${findPage};
      page.keywordInput = 'ops';
      page.handleSearch();
    })()`);
    await waitPage(`${findPage} && !${findPage}.tableLoading && ${findPage}.total === 1`, 'keyword result');
    await screenshot('03-search');

    await evaluate(`(() => {
      const page = ${findPage};
      page.keywordInput = '不存在的员工XYZ';
      page.handleSearch();
    })()`);
    await waitPage(`${findPage} && !${findPage}.tableLoading && ${findPage}.total === 0`, 'empty result');
    await screenshot('04-empty');

    await evaluate(`(() => {
      const page = ${findPage};
      page.keywordInput = '';
      page.handleSearch();
    })()`);
    await waitPage(`${findPage} && !${findPage}.tableLoading && ${findPage}.total === 3`, 'keyword cleared');

    await evaluate(`(() => {
      const page = ${findPage};
      page.handleDeptSelect({deptId: 900102, currentDept: {name: '演示研发部'}, pid: 0});
    })()`);
    await waitPage(`${findPage} && !${findPage}.tableLoading && ${findPage}.total === 1 && ${findPage}.pageNum === 1`, 'department filter');
    assert.equal(await evaluate(`${findPage}.dataSource[0].loginId`), 'rd');
    await screenshot('05-department');

    await evaluate(`(() => { ${findPage}.handleWholeDept(); })()`);
    await waitPage(`${findPage} && !${findPage}.tableLoading && ${findPage}.total === 3`, 'company root');
    await screenshot('06-company-root');

    await evaluate(`(() => {
      const page = ${findPage};
      page.handlePageSizeChange(1);
    })()`);
    await waitPage(`${findPage} && !${findPage}.tableLoading && ${findPage}.dataSource.length === 1`, 'page size 1');
    await evaluate(`(() => { ${findPage}.handlePageNumChange(2); })()`);
    await waitPage(`${findPage} && !${findPage}.tableLoading && ${findPage}.pageNum === 2 && ${findPage}.dataSource.length === 1`, 'page 2');
    await screenshot('07-page2');

    await evaluate("window.location.hash = '#/dashboard'");
    await waitPage("location.hash === '#/dashboard'", 'back home');
    await screenshot('08-back-home');

    publishEvidence();
    assert.equal(externalAttempts, 0, 'external attempts');
    const serious = exceptions.filter(text => !/ResizeObserver|non-passive|favicon/i.test(text));
    assert.equal(serious.length, 0, 'uncaught: ' + serious.slice(0, 3).join(' | '));
    console.log('system-6a browser OK; externalAttempts=' + externalAttempts + '; evidence=' + evidenceDir);
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
