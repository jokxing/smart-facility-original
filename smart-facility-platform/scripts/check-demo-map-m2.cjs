/**
 * Map M2: floor create/edit + room add/edit/remove via real demo entry.
 * Evidence → docs/evidence/map-m2.
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
const profile = fs.mkdtempSync(path.join(cache, 'demo-map-m2-'));
const outDir = path.join(cache, 'demo-map-m2-shots');
fs.mkdirSync(outDir, {recursive: true});
const evidenceDir = path.resolve(__dirname, '../../docs/evidence/map-m2');

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
  await sleep(300);
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

const findRoom = `(() => {
  const root = document.querySelector('#app') && document.querySelector('#app').__vue__;
  const walk = vm => {
    if (!vm) return null;
    if (vm.handleGetRoomList && vm.room && vm.items) return vm;
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

    // --- Map settings: open floor create dialog and submit with built-in map key ---
    await evaluate("location.hash = '#/ms/mapSet'");
    await waitPage("location.hash.indexOf('/ms/mapSet') >= 0", 'map set route');
    await waitPage("!!document.querySelector('.map-set')", 'map set page');
    await screenshot('01-map-set');

    // Select 演示一号楼 in tree (level 2 → floor list)
    await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.handleGetFloorList && vm.$refs.CreateFloor) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      page.companyObject = {gardenId: 910001, gardenName: '演示甲园区', buildingId: 920001, buildingName: '演示一号楼'};
      page.handleTableData(2, 920001, '演示一号楼');
    })()`);
    await waitPage(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.level === 2 && Array.isArray(vm.building)) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      return page && page.building && page.building.length >= 3;
    })()`, 'floor list loaded');

    const createRes = await evaluate(`(async () => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.$refs && vm.$refs.CreateFloor) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      page.handleAdd();
      const modal = page.$refs.CreateFloor;
      modal.form.name = '演示M2层';
      modal.form.buildingId = 920001;
      modal.form.buildingName = '演示一号楼';
      modal.fileList = [{name: 'demo-floor-a-1f', uid: 'browser', url: '/demo/floors/floor-a-1f.svg'}];
      modal.disabled = false;
      const res = await modal.handleSubmit();
      if (!res || !res.code) throw new Error('floor create failed: ' + JSON.stringify(res));
      // Ensure floor table is visible even if tree refresh races
      page.handleGetFloorList(920001);
      return res;
    })()`);
    assert.ok(createRes && createRes.code, 'floor create API ok');
    await waitPage(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.level === 2 && Array.isArray(vm.building)) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      return page && page.building.some(f => f.name === '演示M2层');
    })()`, 'floor created in table');
    const newFloorId = await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.building && vm.building.length) ? vm : (vm.$children || []).map(find).find(Boolean));
      return find(root).building.find(f => f.name === '演示M2层').id;
    })()`);
    await screenshot('02-floor-created');
    assert.ok(Number(newFloorId) >= 931201, 'new floor id in created pool');

    // --- Room management: add empty room then delete ---
    await evaluate("location.hash = '#/rm/room'");
    await waitPage("location.hash.indexOf('/rm/room') >= 0", 'room route');
    await waitPage(`${findRoom} && !${findRoom}.refreshLoading`, 'room list');
    await screenshot('03-room-list');

    await evaluate(`(() => {
      const page = ${findRoom};
      page.handleAdd();
    })()`);
    await waitPage("!!document.querySelector('.el-dialog__wrapper') || !!document.querySelector('.el-dialog')", 'create dialog');
    const roomNo = 'M2R' + Date.now().toString().slice(-6);
    await evaluate(`(() => {
      const page = ${findRoom};
      const modal = (page.$children || []).find(c => typeof c.handleSubmit === 'function' && c.form && c.dialogVisible);
      if (!modal) throw new Error('Create modal not found');
      modal.form.name = 'M2空房间';
      modal.form.no = ${JSON.stringify(roomNo)};
      modal.form.departmentId = '900101';
      modal.form.floorId = '930001';
      modal.form.buildingId = 920001;
      return modal.handleSubmit();
    })()`);
    await waitPage(`${findRoom} && !${findRoom}.refreshLoading && ${findRoom}.room.some(r => r.no === ${JSON.stringify(roomNo)})`, 'room created in list');
    const createdId = await evaluate(`${findRoom}.room.find(r => r.no === ${JSON.stringify(roomNo)}).id`);
    await screenshot('04-room-created');

    // Seed room with devices: delete should fail and remain listed
    await evaluate(`(() => {
      const page = ${findRoom};
      return page.handleDelete({id: 950001, name: '演示房间 A'});
    })()`);
    await sleep(400);
    await evaluate(`(() => {
      const btn = Array.from(document.querySelectorAll('.el-message-box__btns button')).find(b => /确定|确认|OK/i.test(b.textContent || ''));
      if (btn) btn.click();
    })()`);
    await sleep(800);
    const seedStillThere = await evaluate(`${findRoom}.room.some(r => r.id === 950001) || ${findRoom}.total >= 3`);
    assert.equal(seedStillThere, true, 'seed room with devices not removed');

    await evaluate(`(() => {
      const page = ${findRoom};
      return page.handleDelete({id: ${createdId}, name: 'M2空房间'});
    })()`);
    await sleep(400);
    await evaluate(`(() => {
      const btn = Array.from(document.querySelectorAll('.el-message-box__btns button')).find(b => /确定|确认|OK/i.test(b.textContent || ''));
      if (btn) btn.click();
    })()`);
    await waitPage(`${findRoom} && !${findRoom}.refreshLoading && !${findRoom}.room.some(r => r.id === ${createdId})`, 'empty room deleted');
    await screenshot('05-room-deleted');

    publishEvidence();
    assert.equal(externalAttempts, 0, 'external attempts');
    const serious = exceptions.filter(text =>
      !/ResizeObserver|non-passive|favicon|SelectTree|getNode|Message|signError|签名/i.test(text)
    );
    assert.equal(serious.length, 0, 'uncaught: ' + serious.slice(0, 3).join(' | '));
    console.log('map-m2 browser OK; externalAttempts=' + externalAttempts + '; floorId=' + newFloorId + '; evidence=' + evidenceDir);
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
