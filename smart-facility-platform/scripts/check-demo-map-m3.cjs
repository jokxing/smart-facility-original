/**
 * Map M3: SaaS floor/room → building/overview/designer read-side sync.
 * Evidence → docs/evidence/map-m3.
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
const profile = fs.mkdtempSync(path.join(cache, 'demo-map-m3-'));
const outDir = path.join(cache, 'demo-map-m3-shots');
fs.mkdirSync(outDir, {recursive: true});
const evidenceDir = path.resolve(__dirname, '../../docs/evidence/map-m3');

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

const findMapSet = `(() => {
  const root = document.querySelector('#app') && document.querySelector('#app').__vue__;
  const walk = vm => {
    if (!vm) return null;
    if (vm.handleGetFloorList && vm.$refs && vm.$refs.CreateFloor) return vm;
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
    if (vm.handleGetRoomList && vm.room && vm.items) return vm;
    for (const child of (vm.$children || [])) {
      const hit = walk(child);
      if (hit) return hit;
    }
    return null;
  };
  return walk(root);
})()`;

const findFloorView = `(() => {
  const root = document.querySelector('#app') && document.querySelector('#app').__vue__;
  const walk = vm => {
    if (!vm) return null;
    if (vm.getDrawerDataAsync && Array.isArray(vm.deviceList) && vm.mapUrl !== undefined) return vm;
    for (const child of (vm.$children || [])) {
      const hit = walk(child);
      if (hit) return hit;
    }
    return null;
  };
  return walk(root);
})()`;

const findLayout = `(() => {
  const el = document.querySelector('.desinerLayout');
  if (el && el.__vue__ && typeof el.__vue__.getRoomListAsync === 'function') return el.__vue__;
  const root = document.querySelector('#app') && document.querySelector('#app').__vue__;
  const walk = vm => {
    if (!vm) return null;
    if (vm.getRoomListAsync && Array.isArray(vm.roomList)) return vm;
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

    // 1) Create floor via map settings
    await evaluate("location.hash = '#/ms/mapSet'");
    await waitPage("!!document.querySelector('.map-set')", 'map set');
    await evaluate(`(() => {
      const page = ${findMapSet};
      page.companyObject = {gardenId: 910001, gardenName: '演示甲园区', buildingId: 920001, buildingName: '演示一号楼'};
      page.handleTableData(2, 920001, '演示一号楼');
    })()`);
    await waitPage(`${findMapSet} && ${findMapSet}.level === 2 && ${findMapSet}.building && ${findMapSet}.building.length >= 3`, 'floor list');

    const floorRes = await evaluate(`(async () => {
      const page = ${findMapSet};
      page.handleAdd();
      const modal = page.$refs.CreateFloor;
      modal.form.name = '演示M3层';
      modal.form.buildingId = 920001;
      modal.form.buildingName = '演示一号楼';
      modal.fileList = [{name: 'demo-floor-a-1f', uid: 'm3', url: '/demo/floors/floor-a-1f.svg'}];
      modal.disabled = false;
      const res = await modal.handleSubmit();
      page.handleGetFloorList(920001);
      return res;
    })()`);
    assert.ok(floorRes && floorRes.code, 'floor create');
    await waitPage(`${findMapSet} && ${findMapSet}.building.some(f => f.name === '演示M3层')`, 'floor in map set');
    const floorId = await evaluate(`${findMapSet}.building.find(f => f.name === '演示M3层').id`);
    const mapUrl = await evaluate(`${findMapSet}.building.find(f => f.name === '演示M3层').mapUrl`);
    await screenshot('01-floor-created');

    // 2) Building page shows new floor
    await evaluate("location.hash = '#/building'");
    await waitPage("location.hash.indexOf('/building') >= 0", 'building route');
    await waitPage(`(() => {
      const root = document.querySelector('#app').__vue__;
      const walk = vm => (!vm ? null : (vm.floorBtns && vm.goFloorView) ? vm : (vm.$children || []).map(walk).find(Boolean));
      const page = walk(root);
      return page && page.floorBtns && page.floorBtns.some(f => f.id === ${floorId} || f.name === '演示M3层');
    })()`, 'building floor btn');
    await screenshot('02-building-floors');

    // 3) Floor preview: map + empty markers (no ghosts)
    await evaluate(`location.hash = '#/floor/view?floorId=${floorId}&mapUrl=${encodeURIComponent(mapUrl)}&mapId=0&floorName=' + encodeURIComponent('演示M3层')`);
    await waitPage("location.hash.indexOf('/floor/view') >= 0", 'floor view');
    await waitPage(`${findFloorView} && !${findFloorView}.loading`, 'floor view loaded');
    await evaluate(`(async () => {
      const page = ${findFloorView};
      await page.getDrawerDataAsync();
      return true;
    })()`);
    const viewState = await evaluate(`(() => {
      const page = ${findFloorView};
      return {
        floorName: page.floorName,
        mapUrl: page.mapUrl,
        markerCount: (page.deviceList || []).length,
        ghost: (page.deviceList || []).some(r => Number(r.x) <= -1000 || Number(r.y) <= -1000)
      };
    })()`);
    assert.equal(viewState.markerCount, 0, 'no markers on new floor');
    assert.equal(viewState.ghost, false, 'no ghost markers');
    assert.ok(viewState.mapUrl === mapUrl || viewState.mapUrl === 'demo-floor-a-1f', 'map url synced');
    await screenshot('03-floor-view-empty');

    // 4) Add empty room on new floor
    await evaluate("location.hash = '#/rm/room'");
    await waitPage(`${findRoom} && !${findRoom}.refreshLoading`, 'room list');
    const roomNo = 'M3R' + Date.now().toString().slice(-6);
    await evaluate(`(() => { ${findRoom}.handleAdd(); })()`);
    await waitPage("!!document.querySelector('.el-dialog__wrapper') || !!document.querySelector('.el-dialog')", 'create dialog');
    await evaluate(`(() => {
      const page = ${findRoom};
      const modal = (page.$children || []).find(c => typeof c.handleSubmit === 'function' && c.form && c.dialogVisible);
      if (!modal) throw new Error('Create modal not found');
      modal.form.name = 'M3候选房间';
      modal.form.no = ${JSON.stringify(roomNo)};
      modal.form.departmentId = '900101';
      modal.form.floorId = String(${floorId});
      modal.form.buildingId = 920001;
      return modal.handleSubmit();
    })()`);
    await waitPage(`${findRoom} && !${findRoom}.refreshLoading && ${findRoom}.room.some(r => r.no === ${JSON.stringify(roomNo)})`, 'room created');
    const roomId = await evaluate(`${findRoom}.room.find(r => r.no === ${JSON.stringify(roomNo)}).id`);
    await screenshot('04-room-created');

    // 5) Designer: candidate has room; canvas empty
    await evaluate(`(() => {
      document.querySelector('#app').__vue__.$router.push({
        path: '/floor/designer',
        query: {
          floorId: String(${floorId}),
          mapUrl: ${JSON.stringify(mapUrl)},
          mapId: '0',
          floorName: '演示M3层'
        }
      });
      return true;
    })()`);
    await waitPage("location.hash.indexOf('/floor/designer') >= 0", 'designer route');
    await waitPage("!!document.querySelector('.desinerLayout')", 'designer dom');
    await waitPage(`!!(${findLayout})`, 'designer layout');
    await evaluate(`(async () => {
      const layout = ${findLayout};
      await layout.getRoomListAsync(${floorId});
      return {ok: true, n: (layout.roomList || []).length};
    })()`);
    await waitPage(`!!(${findLayout}) && ${findLayout}.roomList.some(r => r.id === ${roomId})`, 'candidate listed');
    const designerState = await evaluate(`(() => {
      const layout = ${findLayout};
      return {
        candidates: (layout.roomList || []).map(r => ({id: r.id, name: r.name})),
        placed: (layout.roomDrawerList || []).map(r => r.id)
      };
    })()`);
    assert.ok(designerState.candidates.some(r => r.id === roomId), 'candidate has room');
    assert.ok(!designerState.placed.includes(roomId), 'not on canvas');
    await screenshot('05-designer-candidate');

    // 6) Rename room → candidate name syncs
    await evaluate("location.hash = '#/rm/room'");
    await waitPage(`${findRoom} && !${findRoom}.refreshLoading`, 'room list again');
    const renameRes = await evaluate(`(async () => {
      const page = ${findRoom};
      const row = page.room.find(r => r.id === ${roomId});
      if (!row) throw new Error('row missing');
      page.handleEdit(row);
      const modal = page.$refs.Create || (page.$children || []).find(c => c.form && c.dialogVisible && typeof c.handleSubmit === 'function');
      if (!modal) throw new Error('edit modal not found');
      modal.form.name = 'M3候选房间改';
      modal.form.no = row.no;
      modal.form.departmentId = String(row.departmentId || 900101);
      modal.form.floorId = String(${floorId});
      modal.form.buildingId = 920001;
      modal.form.id = ${roomId};
      return modal.handleSubmit();
    })()`);
    assert.ok(renameRes && renameRes.code, 'room rename');
    await sleep(600);
    await evaluate(`(() => {
      document.querySelector('#app').__vue__.$router.push({
        path: '/floor/designer',
        query: {floorId: String(${floorId}), mapUrl: ${JSON.stringify(mapUrl)}, mapId: '0', floorName: '演示M3层'}
      });
      return true;
    })()`);
    await waitPage("!!document.querySelector('.desinerLayout')", 'designer after rename');
    await waitPage(`!!(${findLayout})`, 'designer vm after rename');
    await evaluate(`(async () => { const layout = ${findLayout}; await layout.getRoomListAsync(${floorId}); return {ok: true, n: layout.roomList.length}; })()`);
    await waitPage(`!!(${findLayout}) && ${findLayout}.roomList.some(r => r.id === ${roomId} && r.name === 'M3候选房间改')`, 'renamed candidate');
    await screenshot('06-renamed-candidate');

    // 7) Delete empty room → candidate gone; overview still empty
    await evaluate("location.hash = '#/rm/room'");
    await waitPage(`${findRoom} && !${findRoom}.refreshLoading`, 'room list delete');
    await evaluate(`(() => { ${findRoom}.handleDelete({id: ${roomId}, name: 'M3候选房间改'}); return true; })()`);
    await sleep(400);
    await evaluate(`(() => {
      const btn = Array.from(document.querySelectorAll('.el-message-box__btns button')).find(b => /确定|确认|OK/i.test(b.textContent || ''));
      if (btn) btn.click();
      return true;
    })()`);
    await waitPage(`${findRoom} && !${findRoom}.refreshLoading && !${findRoom}.room.some(r => r.id === ${roomId})`, 'room deleted');

    await evaluate(`(() => {
      document.querySelector('#app').__vue__.$router.push({
        path: '/floor/designer',
        query: {floorId: String(${floorId}), mapUrl: ${JSON.stringify(mapUrl)}, mapId: '0', floorName: '演示M3层'}
      });
      return true;
    })()`);
    await waitPage("!!document.querySelector('.desinerLayout')", 'designer after delete');
    await waitPage(`!!(${findLayout})`, 'designer vm after delete');
    await evaluate(`(async () => { const layout = ${findLayout}; await layout.getRoomListAsync(${floorId}); return {ok: true}; })()`);
    await waitPage(`!!(${findLayout}) && !${findLayout}.roomList.some(r => r.id === ${roomId})`, 'candidate cleared');
    await screenshot('07-after-delete');

    await evaluate(`(() => {
      document.querySelector('#app').__vue__.$router.push({
        path: '/floor/view',
        query: {floorId: String(${floorId}), mapUrl: ${JSON.stringify(mapUrl)}, mapId: '0', floorName: '演示M3层'}
      });
      return true;
    })()`);
    await waitPage("location.hash.indexOf('/floor/view') >= 0", 'view route after delete');
    await waitPage(`!!(${findFloorView}) && !${findFloorView}.loading`, 'view after delete');
    await evaluate(`(async () => { await ${findFloorView}.getDrawerDataAsync(); return {ok: true}; })()`);
    const finalMarkers = await evaluate(`(${findFloorView}.deviceList || []).length`);
    assert.equal(finalMarkers, 0, 'overview still empty');

    publishEvidence();
    assert.equal(externalAttempts, 0, 'external attempts');
    const serious = exceptions.filter(text =>
      !/ResizeObserver|non-passive|favicon|SelectTree|getNode|Message|signError|签名/i.test(text)
    );
    assert.equal(serious.length, 0, 'uncaught: ' + serious.slice(0, 3).join(' | '));
    console.log('map-m3 browser OK; externalAttempts=' + externalAttempts + '; floorId=' + floorId + '; evidence=' + evidenceDir);
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
