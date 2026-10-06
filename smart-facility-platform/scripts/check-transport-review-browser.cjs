// Local-only smoke test using installed Edge and Node's built-in CDP WebSocket.
// No browser download, external navigation, or third-party test dependency.
const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const {setTimeout: sleep} = require('node:timers/promises');

const origin = 'http://127.0.0.1:' + Number(process.env.DEMO_PORT || 8088);
const executable = process.env.DEMO_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const cache = path.resolve(__dirname, '../node_modules/.cache');
fs.mkdirSync(cache, {recursive: true});
const profile = fs.mkdtempSync(path.join(cache, 'demo-browser-'));
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

async function waitFor(check, label, timeout = 30000) {
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
  if (result.exceptionDetails) throw new Error('Browser evaluation failed: ' + (result.exceptionDetails.exception && result.exceptionDetails.exception.description || result.exceptionDetails.text) + '\nExpression: ' + expression.slice(0, 700));
  return result.result.value;
}
async function waitPage(expression, label) {
  await waitFor(() => evaluate(expression), label);
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
        const desc = (details.exception && (details.exception.description || details.exception.value))
          || details.text
          || details.url
          || JSON.stringify(details);
        exceptions.push(String(desc));
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
    if (process.env.DEMO_FLOOR_SCREENSHOT) {
      await send('Emulation.setDeviceMetricsOverride', {width: 1920, height: 1080, screenWidth: 1920, screenHeight: 1080, deviceScaleFactor: 1, mobile: false});
    }
    await send('Fetch.enable', {patterns: [{urlPattern: '*'}]});
    await send('Page.navigate', {url: origin + '/#/dashboard'});
    await waitPage("!!document.querySelector('.login-button')", 'anonymous route redirects to login');
    await waitPage("document.querySelector('.captcha-code-class img').naturalWidth > 0", 'PNG captcha loads');
    await evaluate("window.localStorage.setItem('token', 'unrelated-test-value')");
    await fill('wrong-password');
    await waitPage("Array.from(document.querySelectorAll('.el-message')).some(e => e.textContent.includes('密码不正确'))", 'wrong password rejected');
    await waitPage("!document.querySelector('.login-button').disabled", 'login button recovers');
    await fill('Demo1234');
    await waitPage("location.hash === '#/dashboard' && !!document.querySelector('.bashboard-session')", 'login reaches original dashboard');
    assert.equal(await evaluate("JSON.parse(window.localStorage.getItem('smart-facility-demo:v1:USERINFO')).loginId"), 'demo');
    assert.equal(await evaluate("window.localStorage.getItem('token')"), 'unrelated-test-value');
    await send('Page.reload');
    await waitPage("!!document.querySelector('.bashboard-session')", 'login persists after refresh');
    await evaluate(`window.findReview = predicate => {
      const find = vm => !vm ? null : predicate(vm) ? vm : (vm.$children || []).map(find).find(Boolean);
      return find(document.querySelector('#app').__vue__);
    }`);
    await evaluate("location.hash = '#/apply/transport/waybill'");
    await waitPage("!!window.findReview(vm => vm.$options.name === 'transportWaybill' && vm.list && vm.list.length === 10)", 'waybill list');
    await evaluate(`(async () => {
      const page = window.findReview(vm => vm.$options.name === 'transportWaybill');
      page.handleAdd();
      await page.$nextTick();
      const form = page.$refs.createWayBill;
      form.form.professionNo = 'PN-BROWSER';
      form.form.deliverId = 884001; form.form.receiveId = 884002;
      form.handleSelectSample();
    })()`);
    await waitPage("!!window.findReview(vm => vm.$options.name === 'SelectSampleDialog' && vm.visible && vm.list.length === 2)", 'actual catalog dialog loads');
    await evaluate(`(() => {
      const form = window.findReview(vm => vm.$options.name === 'transportWaybill').$refs.createWayBill;
      const dialog = form.$refs.selectSampleDialog;
      dialog.selection = [dialog.list[0]]; dialog.handleConfirm();
      form.handleSubmit();
    })()`);
    await waitPage("!!window.findReview(vm => vm.$options.name === 'transportWaybill' && vm.total === 11)", 'create via page form');
    await evaluate(`(() => {
      const page = window.findReview(vm => vm.$options.name === 'transportWaybill');
      page.$refs.waybillInfo.open({id:881005, name:'TO-DEMO-005', no:'TO-DEMO-005'});
    })()`);
    await waitPage("!!window.findReview(vm => vm.$options.name === 'WaybillInfo' && vm.details.id === 881005 && vm.gpsInfos.length > 0)", 'detail GPS actual objId');
    await sleep(1500);
    const evidence = path.resolve(__dirname, '../../docs/evidence/transport-review');
    fs.mkdirSync(evidence, {recursive:true});
    fs.writeFileSync(path.join(evidence,'saas-waybill-detail.png'), Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
    assert.equal(exceptions.length,0, exceptions.join(' | '));
    assert.equal(externalAttempts,0,'external application requests');
    console.log(JSON.stringify({passed:true, list:true, catalog:true, pageFormCreate:true, detailGPS:true, uncaughtErrors:exceptions.length, externalAttempts}));
  } finally {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {await send('Browser.close', {}, null);} catch (_) {}
      socket.close();
    }
    browser.kill();
  }
})().catch(error => {console.error(error.message); process.exitCode=1;});
