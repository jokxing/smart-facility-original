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
    await evaluate("location.hash = '#/building'");
    await waitPage("location.hash === '#/building' && !!document.querySelector('#container.building')", 'building page opens');
    await waitPage(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.$options.name === 'Building' || (vm.$el && vm.$el.id === 'container' && vm.buildingType)) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      return !!(page && page.isLoading === false && page.glbScene && page.buildingData && page.buildingData.length);
    })()`, 'building model attached to scene', 45000);
    const firstGardenModel = await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.glbScene && vm.buildingVal != null) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      let triangles = 0, textured = false;
      page.glbScene.traverse(node => {
        if (!node.isMesh) return;
        triangles += (node.geometry.index ? node.geometry.index.count : node.geometry.attributes.position.count) / 3;
        if (node.material.map && node.material.map.image) textured = true;
      });
      return {gardenId: page.buildingVal, buildingId: page.buildingNumIndex, url: page.buildingData[0] && page.buildingData[0].url, hasCanvas: !!document.querySelector('#container canvas'), triangles, textured};
    })()`);
    assert.equal(firstGardenModel.gardenId, 910001);
    assert.equal(firstGardenModel.url, 'demo-building-a');
    assert.equal(firstGardenModel.hasCanvas, true);
    assert.equal(firstGardenModel.triangles, 1423, 'downloaded office mesh is loaded, not a placeholder');
    assert.equal(firstGardenModel.textured, true, 'embedded building texture is decoded');
    if (process.env.DEMO_SCREENSHOT) {
      await sleep(1200);
      const capture = await send('Page.captureScreenshot', {format: 'png'});
      fs.writeFileSync(process.env.DEMO_SCREENSHOT, Buffer.from(capture.data, 'base64'));
    }
    assert.equal(await evaluate("fetch('/demo/models/office-building-low-rise.glb').then(r => r.status)"), 200);
    assert.equal(await evaluate("fetch('/demo/floors/floor-a-1f.svg').then(r => r.status)"), 200);
    await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.goFloorView && vm.floorBtns && vm.floorBtns.length) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      const floor = page.floorBtns.find(item => item.id === 930001) || page.floorBtns[page.floorBtns.length - 1];
      page.goFloorView(floor);
    })()`);
    await waitPage("location.hash.indexOf('#/floor/view') === 0", 'floor read-only view opens');
    await waitPage(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.bgConfig && vm.floorId) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      return !!(page && page.loading === false && page.floorId == 930001 && page.bgConfig && page.bgConfig.image
        && page.deviceList && page.deviceList.length >= 3
        && page.deviceList.some(r => r.name === '演示房间 A'));
    })()`, 'floor plan background and room markers loaded', 45000);
    await sleep(800);
    const roomHoverHit = await evaluate(`(() => {
      const find = vm => (!vm ? null : (vm.moveRoomHover && vm.$refs.stage) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(document.querySelector('#app').__vue__), stage = page.$refs.stage.getNode();
      const box = stage.content.getBoundingClientRect();
      const node = stage.findOne('.deviceGroup0').findOne('Text');
      const rect = node.getClientRect();
      return {x: box.left+(rect.x+rect.width/2)*box.width/stage.width(), y: box.top+(rect.y+rect.height/2)*box.height/stage.height()};
    })()`);
    await send('Input.dispatchMouseEvent', {type: 'mouseMoved', ...roomHoverHit});
    await waitPage(`(() => { const card = document.querySelector('.demo-room-tooltip'); return card && /设备\\s*6\\s*台/.test(card.textContent) && /正常\\s*6/.test(card.textContent); })()`, 'floor room hover shows shared device counts');
    await send('Input.dispatchMouseEvent', {type: 'mouseMoved', x: 10, y: 110});
    await waitPage("!document.querySelector('.demo-room-tooltip')", 'floor room hover closes on leave');
    for (const [scenario, label] of [['alarm', '告警'], ['offline', '离线'], ['normal', '正常']]) {
      await evaluate(`(() => {
        const find = vm => (!vm ? null : vm.moveRoomHover ? vm : (vm.$children || []).map(find).find(Boolean));
        return find(document.querySelector('#app').__vue__).handleDemoScenario('${scenario}');
      })()`);
      await sleep(300);
      await send('Input.dispatchMouseEvent', {type: 'mouseMoved', ...roomHoverHit});
      await waitPage(`(() => { const c = document.querySelector('.demo-room-tooltip'); return c && c.textContent.includes('${label} 6'); })()`, 'floor hover ' + scenario);
      await send('Input.dispatchMouseEvent', {type: 'mouseMoved', x: 10, y: 110});
    }
    const emptyRoomHit = await evaluate(`(() => {
      const find = vm => (!vm ? null : vm.moveRoomHover ? vm : (vm.$children || []).map(find).find(Boolean));
      const p = find(document.querySelector('#app').__vue__), s = p.$refs.stage.getNode(), b = s.content.getBoundingClientRect();
      const index = p.deviceList.findIndex(r => r.id === 950002);
      const r = s.findOne('.deviceGroup'+index).findOne('Text').getClientRect();
      return {x: b.left+(r.x+r.width/2)*b.width/s.width(), y: b.top+(r.y+r.height/2)*b.height/s.height()};
    })()`);
    await send('Input.dispatchMouseEvent', {type: 'mouseMoved', ...emptyRoomHit});
    await waitPage(`(() => {const c=document.querySelector('.demo-room-tooltip'); return c && c.textContent.includes('设备 0 台');})()`, 'empty room hover has zero devices');
    // Synthetic edge coordinates test popup clamping; no device layout mutation.
    await evaluate(`(() => {const find=vm=>(!vm?null:vm.moveRoomHover?vm:(vm.$children||[]).map(find).find(Boolean)); find(document.querySelector('#app').__vue__).moveRoomHover({evt:{clientX:innerWidth-1,clientY:innerHeight-1}});})()`);
    await waitPage(`(() => {const r=document.querySelector('.demo-room-tooltip').getBoundingClientRect(); return r.left>=0 && r.top>=0 && r.right<=innerWidth && r.bottom<=innerHeight;})()`, 'room hover stays inside viewport at lower right');
    await send('Input.dispatchMouseEvent', {type: 'mouseMoved', x: 10, y: 110});
    if (process.env.DEMO_FLOOR_SCREENSHOT) {
      await sleep(600);
      const capture = await send('Page.captureScreenshot', {format: 'png'});
      fs.writeFileSync(process.env.DEMO_FLOOR_SCREENSHOT, Buffer.from(capture.data, 'base64'));
    }
    await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.handleMouseDown && vm.deviceList && vm.deviceList.length) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      const room = page.deviceList.find(r => r.id === 950001) || page.deviceList[0];
      // Same path as clicking room name text (not only dblclick / status icon).
      page.handleMouseDown(room, {evt: {cancelBubble: false}});
    })()`);
    await waitPage(`(() => {
      if (location.hash.indexOf('#/dashboard') === 0) return false;
      if (location.hash.indexOf('#/floor/view') !== 0) return false;
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.isDrawer === true && vm.roomId) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      if (!page) return false;
      const module = (function walk(vm) {
        if (!vm) return null;
        if (vm.room && vm.room.name) return vm;
        return (vm.$children || []).map(walk).find(Boolean);
      })(page);
      return !!(module && module.room && module.room.name === '演示房间 A' && module.room.no);
    })()`, 'room name click opens drawer without leaving floor view', 45000);
    await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.floorId == 930001 && vm.handleRoomDetail && vm.isDrawer === true) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      if (page) page.isDrawer = false;
    })()`);
    await waitPage(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.floorId == 930001 && vm.handleRoomDetail) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      return !!(page && page.isDrawer === false);
    })()`, 'room drawer closed back to floor view');
    await waitPage(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.handleToRoomLayout && vm.deviceList) ? vm : (vm.$children || []).map(find).find(Boolean));
      return !!find(root);
    })()`, 'floor view exposes device layout entry');
    await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.handleToRoomLayout && vm.deviceList) ? vm : (vm.$children || []).map(find).find(Boolean));
      find(root).handleToRoomLayout();
    })()`);
    await waitPage("location.hash.indexOf('#/room/view') === 0", 'room device layout opens');
    await waitPage(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.deviceList && vm.getDrawerDataAsync && vm.bgConfig) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      return !!(page && page.loading === false && page.deviceList && page.deviceList.length >= 4
        && page.bgConfig && page.bgConfig.image
        && page.deviceList.every(d => d.isEdit === 1));
    })()`, 'room layout devices and cropped background loaded', 45000);
    assert.equal(await evaluate("fetch('/demo/devices/analyzer.svg').then(r => r.status)"), 200);
    await sleep(1000);
    const hoverHit = await evaluate(`(() => {
      const find = vm => (!vm ? null : (vm.deviceList && vm.getDrawerDataAsync) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(document.querySelector('#app').__vue__), stage = page.$refs.stage.getNode();
      const box = stage.content.getBoundingClientRect();
      const node = stage.findOne('.deviceGroup3');
      return {x: box.left + node.x() * box.width / stage.width(), y: box.top + node.y() * box.height / stage.height()};
    })()`);
    await send('Input.dispatchMouseEvent', {type: 'mouseMoved', ...hoverHit});
    await sleep(200);
    await waitPage(`(() => { const card = document.querySelector('.demo-device-tooltip'); return card && card.textContent.includes('正常') && card.textContent.includes('5.2℃'); })()`, 'device hover shows existing mock reading');
    await send('Input.dispatchMouseEvent', {type: 'mouseMoved', x: 10, y: 110});
    await waitPage("!document.querySelector('.demo-device-tooltip')", 'device hover closes on leave');
    for (const label of ['告警', '离线', '正常']) {
      await evaluate(`(() => {const find=vm=>(!vm?null:vm.handleDemoScenarioCycle?vm:(vm.$children||[]).map(find).find(Boolean));return find(document.querySelector('#app').__vue__).handleDemoScenarioCycle();})()`);
      await sleep(300);
      await send('Input.dispatchMouseEvent', {type: 'mouseMoved', ...hoverHit});
      await waitPage(`(() => {const c=document.querySelector('.demo-device-tooltip');return c && c.textContent.includes('${label}') && c.textContent.includes('${label === '离线' ? '暂无读数' : '5.2℃'}');})()`, 'device hover ' + label);
      await evaluate(`(() => {const find=vm=>(!vm?null:vm.handleDeviceHoverMove?vm:(vm.$children||[]).map(find).find(Boolean));find(document.querySelector('#app').__vue__).handleDeviceHoverMove({evt:{clientX:innerWidth-1,clientY:innerHeight-1}});})()`);
      await waitPage(`(() => {const r=document.querySelector('.demo-device-tooltip').getBoundingClientRect();return r.left>=0 && r.top>=0 && r.right<=innerWidth && r.bottom<=innerHeight;})()`, 'device hover stays inside viewport');
      await send('Input.dispatchMouseEvent', {type: 'mouseMoved', x: 10, y: 110});
    }
    // Device read-only detail: hover → click → close → switch; offline empty reading.
    // Hover loop above ends on 正常; open detail from that shared scenario state.
    await send('Input.dispatchMouseEvent', {type: 'mouseMoved', ...hoverHit});
    await waitPage(`(() => { const card = document.querySelector('.demo-device-tooltip'); return card && card.textContent.includes('正常'); })()`, 'hover before device detail click');
    await evaluate(`(() => {
      const find = vm => (!vm ? null : (vm.handleMouseDown && vm.deviceList && vm.getDrawerDataAsync) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(document.querySelector('#app').__vue__);
      const device = page.deviceList.find(d => d.elementId === 970004) || page.deviceList[0];
      page.handleMouseDown(device, {evt: {cancelBubble: false}});
    })()`);
    await waitPage(`(() => {
      const find = vm => (!vm ? null : (vm.isDrawer === true && vm.detailId) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(document.querySelector('#app').__vue__);
      if (!page || page.detailId != 970004) return false;
      const drawer = (function walk(vm) {
        if (!vm) return null;
        if (vm.detail && vm.detail.name && vm.getDetail) return vm;
        return (vm.$children || []).map(walk).find(Boolean);
      })(page);
      return !!(drawer && drawer.detail && drawer.detail.name && drawer.detail.no
        && drawer.sensors && drawer.sensors.length >= 2
        && String(drawer.sensors[0].monitorSensorVal) === '5.2');
    })()`, 'device click opens LabDeviceDrawer with basic info and reading', 45000);
    await waitPage(`(() => {
      const find = vm => (!vm ? null : (vm.isDrawer === true) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(document.querySelector('#app').__vue__);
      const monitor = (function walk(vm) {
        if (!vm) return null;
        if (vm.dataCharts && vm.handleCutTime && vm.handleCutSensor) return vm;
        return (vm.$children || []).map(walk).find(Boolean);
      })(page);
      return !!(monitor && !monitor.loading && monitor.dataCharts.rows.length > 5
        && monitor.dataCharts.rows.every(r => typeof r.data === 'number'));
    })()`, 'device detail shows monitorInfo series', 45000);
    const chartBefore = await evaluate(`(() => {
      const find = vm => (!vm ? null : (vm.isDrawer === true) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(document.querySelector('#app').__vue__);
      const monitor = (function walk(vm) {
        if (!vm) return null;
        if (vm.dataCharts && vm.handleCutTime && vm.handleCutSensor) return vm;
        return (vm.$children || []).map(walk).find(Boolean);
      })(page);
      window.__demoMonitor = monitor;
      return {count: monitor.dataCharts.rows.length, first: monitor.dataCharts.rows[0].data, sensor: monitor.objSensorId};
    })()`);
    await evaluate('window.__demoMonitor.handleCutTime(5)');
    await waitPage(`(() => {
      const m = window.__demoMonitor;
      return !!(m && !m.loading && m.interval === 5 && m.dataCharts.rows.length > ${chartBefore.count});
    })()`, 'switch time dimension reloads longer series');
    await evaluate('window.__demoMonitor.handleCutSensor(window.__demoMonitor.sensors[1])');
    await waitPage(`(() => {
      const m = window.__demoMonitor;
      return !!(m && !m.loading && m.objSensorId !== ${chartBefore.sensor}
        && m.dataCharts.rows.length > 0 && m.dataCharts.rows[0].data !== ${chartBefore.first});
    })()`, 'switch sensor reloads different series');
    await evaluate('delete window.__demoMonitor');
    await evaluate(`(() => {
      const find = vm => (!vm ? null : (vm.isDrawer === true && vm.handleMouseDown) ? vm : (vm.$children || []).map(find).find(Boolean));
      find(document.querySelector('#app').__vue__).isDrawer = false;
    })()`);
    await waitPage(`(() => {
      const find = vm => (!vm ? null : (vm.handleMouseDown && vm.getDrawerDataAsync) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(document.querySelector('#app').__vue__);
      return !!(page && page.isDrawer === false);
    })()`, 'device drawer closed');
    await evaluate(`(() => {
      const find = vm => (!vm ? null : (vm.handleMouseDown && vm.deviceList) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(document.querySelector('#app').__vue__);
      const other = page.deviceList.find(d => d.elementId === 970005);
      page.handleMouseDown(other, {evt: {cancelBubble: false}});
    })()`);
    await waitPage(`(() => {
      const find = vm => (!vm ? null : (vm.isDrawer === true && vm.detailId == 970005) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(document.querySelector('#app').__vue__);
      if (!page) return false;
      const drawer = (function walk(vm) {
        if (!vm) return null;
        if (vm.detail && vm.detail.id == 970005) return vm;
        return (vm.$children || []).map(walk).find(Boolean);
      })(page);
      return !!(drawer && drawer.detail && drawer.detail.name === '演示示波器 A');
    })()`, 'switching device reloads detail', 45000);
    await evaluate(`(() => {
      const find = vm => (!vm ? null : (vm.isDrawer === true && vm.handleMouseDown) ? vm : (vm.$children || []).map(find).find(Boolean));
      find(document.querySelector('#app').__vue__).isDrawer = false;
    })()`);
    await evaluate(`(() => {
      const find = vm => (!vm ? null : vm.handleDemoScenarioCycle ? vm : (vm.$children || []).map(find).find(Boolean));
      return find(document.querySelector('#app').__vue__).handleDemoScenarioCycle();
    })()`);
    await sleep(300);
    await evaluate(`(() => {
      const find = vm => (!vm ? null : vm.handleDemoScenarioCycle ? vm : (vm.$children || []).map(find).find(Boolean));
      return find(document.querySelector('#app').__vue__).handleDemoScenarioCycle();
    })()`);
    await waitPage(`(() => {
      const find = vm => (!vm ? null : (vm.demoScenario === 'offline' && vm.deviceList) ? vm : (vm.$children || []).map(find).find(Boolean));
      return !!find(document.querySelector('#app').__vue__);
    })()`, 'scenario reaches offline for detail');
    await evaluate(`(() => {
      const find = vm => (!vm ? null : (vm.handleMouseDown && vm.deviceList) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(document.querySelector('#app').__vue__);
      page.handleMouseDown(page.deviceList.find(d => d.elementId === 970004), {evt: {cancelBubble: false}});
    })()`);
    await waitPage(`(() => {
      const find = vm => (!vm ? null : (vm.isDrawer === true) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(document.querySelector('#app').__vue__);
      const drawer = (function walk(vm) {
        if (!vm) return null;
        if (vm.detail && vm.sensors) return vm;
        return (vm.$children || []).map(walk).find(Boolean);
      })(page);
      return !!(drawer && drawer.detail && drawer.detail.bingStatus === -100
        && drawer.sensors[0] && drawer.sensors[0].monitorSensorVal === '');
    })()`, 'offline detail keeps empty reading', 45000);
    await waitPage(`(() => {
      const find = vm => (!vm ? null : (vm.isDrawer === true) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(document.querySelector('#app').__vue__);
      const monitor = (function walk(vm) {
        if (!vm) return null;
        if (vm.dataCharts && vm.handleCutTime) return vm;
        return (vm.$children || []).map(walk).find(Boolean);
      })(page);
      return !!(monitor && !monitor.loading && monitor.dataCharts.rows.length === 0);
    })()`, 'offline detail keeps empty monitor curve', 45000);
    await evaluate(`(() => {
      const find = vm => (!vm ? null : (vm.isDrawer === true && vm.handleMouseDown) ? vm : (vm.$children || []).map(find).find(Boolean));
      find(document.querySelector('#app').__vue__).isDrawer = false;
    })()`);
    await evaluate(`(() => {
      const find = vm => (!vm ? null : vm.handleDemoScenarioCycle ? vm : (vm.$children || []).map(find).find(Boolean));
      return find(document.querySelector('#app').__vue__).handleDemoScenarioCycle();
    })()`);
    await waitPage(`(() => {
      const find = vm => (!vm ? null : (vm.demoScenario === 'normal' && vm.deviceList) ? vm : (vm.$children || []).map(find).find(Boolean));
      return !!find(document.querySelector('#app').__vue__);
    })()`, 'restore normal scenario after detail');
    assert.equal(await evaluate("fetch('/demo/floors/room-a.svg').then(r => r.status)"), 200);
    const seedPositions = await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.deviceList && vm.handleConfiguar) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      window.__demoSeedXY = page.deviceList.map(d => [d.elementId, d.x, d.y]);
      const target = page.deviceList.find(d => d.elementId === 970004);
      window.__demoMovedId = target.elementId;
      window.__demoMovedXY = [target.x + 55, target.y + 35];
      page.handleConfiguar();
      return window.__demoSeedXY;
    })()`);
    assert.ok(Array.isArray(seedPositions) && seedPositions.length >= 4, 'seed positions captured');
    await waitPage("location.hash.indexOf('#/room/designer') === 0", 'room designer opens');
    await waitPage(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.handleSave && vm.deviceDrawerList && vm.deviceDrawerList.length) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      return !!(page && page.deviceDrawerList && page.deviceDrawerList.length >= 4 && page.isDemo === true);
    })()`, 'room designer devices loaded', 45000);
    await sleep(700);
    const dragHit = await evaluate(`(() => {
      const find = vm => (!vm ? null : (vm.commitDemoPlacement && vm.$refs.stage) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(document.querySelector('#app').__vue__);
      const stage = page.$refs.stage.getNode();
      const index = page.deviceDrawerList.findIndex(d => d.elementId === window.__demoMovedId);
      const node = stage.findOne('.deviceGroup' + index);
      const box = stage.container().getBoundingClientRect();
      return {x: box.left + node.x(), y: box.top + node.y(), ratio: page.ratio};
    })()`);
    await send('Input.dispatchMouseEvent', {type: 'mouseMoved', x: dragHit.x, y: dragHit.y});
    await send('Input.dispatchMouseEvent', {type: 'mousePressed', x: dragHit.x, y: dragHit.y, button: 'left', buttons: 1, clickCount: 1});
    for (let i = 1; i <= 5; i++) {
      await send('Input.dispatchMouseEvent', {type: 'mouseMoved', x: dragHit.x + 55 * dragHit.ratio * i / 5, y: dragHit.y + 35 * dragHit.ratio * i / 5, buttons: 1});
      await sleep(30);
    }
    await send('Input.dispatchMouseEvent', {type: 'mouseReleased', x: dragHit.x + 55 * dragHit.ratio, y: dragHit.y + 35 * dragHit.ratio, button: 'left', clickCount: 1});
    await waitPage(`(() => {
      const find = vm => (!vm ? null : (vm.handleSave && vm.deviceDrawerList) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(document.querySelector('#app').__vue__);
      const moved = page.deviceDrawerList.find(d => d.elementId === window.__demoMovedId);
      return Math.abs(moved.x - window.__demoMovedXY[0]) < 1 && Math.abs(moved.y - window.__demoMovedXY[1]) < 1;
    })()`, 'real pointer drag updates logical layout');
    // Read geometry only; all mutations below go through actual pointer gestures.
    const readTransform = () => evaluate(`(() => {
      const find = vm => (!vm ? null : (vm.commitDemoPlacement && vm.$refs.stage) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(document.querySelector('#app').__vue__);
      const stage = page.$refs.stage.getNode(), box = stage.container().getBoundingClientRect();
      const index = page.deviceDrawerList.findIndex(d => d.elementId === window.__demoMovedId);
      const node = stage.findOne('.deviceGroup' + index), tr = page.$refs.transformer.getNode();
      const point = n => { const p = n.getAbsolutePosition(); return {x: box.left + p.x, y: box.top + p.y}; };
      const geometry = d => [d.x, d.y, d.rotation, d.scaleX, d.scaleY];
      return {value: geometry(page.deviceDrawerList[index]),
        rendered: [node.x()/page.ratio, node.y()/page.ratio, node.rotation(), node.scaleX()/page.ratio, node.scaleY()/page.ratio],
        center: point(node), corner: point(tr.findOne('.bottom-right')), rotate: point(tr.findOne('.rotater')),
        outside: {x: box.left + 5, y: box.top + 5}};
    })()`);
    const gesture = async (from, to) => {
      await send('Input.dispatchMouseEvent', {type: 'mouseMoved', ...from});
      await send('Input.dispatchMouseEvent', {type: 'mousePressed', ...from, button: 'left', buttons: 1, clickCount: 1});
      for (let i = 1; i <= 8; i++) {
        await send('Input.dispatchMouseEvent', {type: 'mouseMoved', x: from.x+(to.x-from.x)*i/8, y: from.y+(to.y-from.y)*i/8, buttons: 1});
        await sleep(30);
      }
      await send('Input.dispatchMouseEvent', {type: 'mouseReleased', ...to, button: 'left', clickCount: 1});
      await sleep(200);
    };
    const beforeScale = await readTransform();
    await gesture(beforeScale.corner, {x: beforeScale.corner.x + 12, y: beforeScale.corner.y + 12});
    const scaled = await readTransform();
    assert.ok(Math.abs(scaled.value[3]-beforeScale.value[3]) > 0.01, 'real resize anchor changes scale');
    const dx = scaled.rotate.x-scaled.center.x, dy = scaled.rotate.y-scaled.center.y, angle = Math.PI/6;
    await gesture(scaled.rotate, {x: scaled.center.x+dx*Math.cos(angle)-dy*Math.sin(angle), y: scaled.center.y+dx*Math.sin(angle)+dy*Math.cos(angle)});
    const rotated = await readTransform();
    assert.ok(Math.abs(rotated.value[2]-scaled.value[2]) > 10, 'real rotation anchor changes angle');
    await gesture(rotated.center, rotated.outside);
    const rejected = await readTransform();
    rotated.value.forEach((v, i) => {
      assert.ok(Math.abs(rejected.value[i]-v) < 0.001, 'invalid drag preserves logical transform');
      assert.ok(Math.abs(rejected.rendered[i]-v) < 0.001, 'invalid drag restores rendered transform');
    });
    const expectedTransform = rejected.value;
    await evaluate(`(() => {
      const find = vm => (!vm ? null : (vm.handleSave && vm.deviceDrawerList) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(document.querySelector('#app').__vue__);
      const moved = page.deviceDrawerList.find(d => d.elementId === window.__demoMovedId);
      window.__demoMovedXY = [moved.x, moved.y];
      return page.handleSave();
    })()`);
    await waitPage(`(() => {
      if (location.hash.indexOf('#/room/view') !== 0) return false;
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.deviceList && vm.getDrawerDataAsync) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      if (!page || page.loading || !page.deviceList.length) return false;
      const moved = page.deviceList.find(d => d.elementId === window.__demoMovedId);
      return !!(moved && moved.x === window.__demoMovedXY[0] && moved.y === window.__demoMovedXY[1]);
    })()`, 'saved layout persists after re-enter room view', 45000);
    const persistedDrag = await evaluate('({id: window.__demoMovedId, xy: window.__demoMovedXY, seed: window.__demoSeedXY})');
    await send('Page.reload', {ignoreCache: true});
    await waitPage(`(() => {
      const app = document.querySelector('#app');
      const find = vm => (!vm ? null : (vm.deviceList && vm.getDrawerDataAsync) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(app && app.__vue__);
      const item = page && page.deviceList.find(d => d.elementId === ${persistedDrag.id});
      return !!item && item.x === ${persistedDrag.xy[0]} && item.y === ${persistedDrag.xy[1]};
    })()`, 'saved pointer drag survives full page reload');
    const restoredTransform = await evaluate(`(() => {
      const find = vm => (!vm ? null : (vm.deviceList && vm.getDrawerDataAsync) ? vm : (vm.$children || []).map(find).find(Boolean));
      const item = find(document.querySelector('#app').__vue__).deviceList.find(d => d.elementId === ${persistedDrag.id});
      return [item.x, item.y, item.rotation, item.scaleX, item.scaleY];
    })()`);
    expectedTransform.forEach((v, i) => assert.ok(Math.abs(restoredTransform[i]-v) < 0.001, 'full transform survives save and reload'));
    await evaluate(`window.__demoMovedId = ${persistedDrag.id}; window.__demoMovedXY = ${JSON.stringify(persistedDrag.xy)}; window.__demoSeedXY = ${JSON.stringify(persistedDrag.seed)};`);
    await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.handleConfiguar) ? vm : (vm.$children || []).map(find).find(Boolean));
      find(root).handleConfiguar();
    })()`);
    await waitPage("location.hash.indexOf('#/room/designer') === 0", 're-open designer for reset');
    await waitPage(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.handleResetLayout && vm.deviceDrawerList) ? vm : (vm.$children || []).map(find).find(Boolean));
      return !!find(root);
    })()`, 'designer reset control ready');
    await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.handleResetLayout) ? vm : (vm.$children || []).map(find).find(Boolean));
      return find(root).handleResetLayout();
    })()`);
    await waitPage(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.deviceDrawerList && vm.handleResetLayout) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      if (!page || !page.deviceDrawerList.length) return false;
      const seed = window.__demoSeedXY || [];
      return page.deviceDrawerList.every(d => {
        const row = seed.find(s => s[0] === d.elementId);
        return row && d.x === row[1] && d.y === row[2];
      });
    })()`, 'reset restores seed layout');
    await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.$router && vm.handleResetLayout) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      page.$router.push({path: '/room/view', query: {roomId: page.roomId, roomName: page.$route.query.roomName || '演示房间 A'}});
    })()`);
    await waitPage("location.hash.indexOf('#/room/view') === 0", 'back to room view after reset');
    if (process.env.DEMO_ROOM_SCREENSHOT) {
      await send('Emulation.setDeviceMetricsOverride', {width: 1920, height: 1080, screenWidth: 1920, screenHeight: 1080, deviceScaleFactor: 1, mobile: false});
      await sleep(600);
      const capture = await send('Page.captureScreenshot', {format: 'png'});
      fs.writeFileSync(process.env.DEMO_ROOM_SCREENSHOT, Buffer.from(capture.data, 'base64'));
    }
    await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.handleDemoScenarioCycle && vm.deviceList) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      window.__demoRoomStatusBefore = page.deviceList.map(d => d.status);
      return page.handleDemoScenarioCycle();
    })()`);
    await waitPage(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.deviceList && vm.demoScenario) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      if (!page || !page.deviceList.length) return false;
      const before = window.__demoRoomStatusBefore || [];
      return page.demoScenario !== 'normal' && page.deviceList.every((d, i) => d.status !== before[i] || before[i] === undefined)
        && page.deviceList.every(d => d.status === page.deviceList[0].status);
    })()`, 'shared scenario switch updates room layout status');
    const roomIdsAfterScenario = await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.deviceList && vm.demoScenario) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      return {scenario: page.demoScenario, ids: page.deviceList.map(d => d.elementId), status: page.deviceList[0].status};
    })()`);
    await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.handleBackToList) ? vm : (vm.$children || []).map(find).find(Boolean));
      find(root).handleBackToList();
    })()`);
    await waitPage("location.hash.indexOf('#/floor/view') === 0", 'return from room layout to floor view');
    await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.handleToScreen && vm.floorId == 930001) ? vm : (vm.$children || []).map(find).find(Boolean));
      find(root).handleToScreen('roomDataV');
    })()`);
    await waitPage("location.hash.indexOf('#/roomDataV') === 0", 'room DataV opens after scenario switch');
    await waitPage(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.array && vm.instrumentCount && vm.roomDetail) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      if (!page || page.isLoading || !page.array || !page.array.length || !page.instrumentCount) return false;
      const scenario = ${JSON.stringify(roomIdsAfterScenario.scenario)};
      const count = page.instrumentCount;
      if (scenario === 'alarm') return count.alarmCount === page.array.length && count.normalCount === 0;
      if (scenario === 'offline') return count.offlineCount === page.array.length && count.normalCount === 0;
      return count.normalCount === page.array.length;
    })()`, 'room DataV counts match shared scenario', 45000);
    await evaluate("location.hash = '#/building'");
    await waitPage("location.hash === '#/building'", 'return to building from floor view');
    await waitPage(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.buildingVal === 910001 && vm.glbScene) ? vm : (vm.$children || []).map(find).find(Boolean));
      return !!find(root);
    })()`, 'building state kept after floor return', 45000);
    await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.handleBuilding && vm.buildingType && vm.buildingType.length > 1) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      page.buildingVal = 910002;
      page.handleBuilding();
    })()`);
    await waitPage(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.glbScene && vm.buildingVal === 910002) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      return !!(page && page.isLoading === false && page.buildingNumIndex === 920101 && page.buildingData[0] && page.buildingData[0].url === 'demo-building-c');
    })()`, 'garden switch loads second park building', 45000);
    await evaluate("location.hash = '#/dashboard'");
    await waitPage("location.hash === '#/dashboard' && !!document.querySelector('.bashboard-session')", 'return to dashboard from building');
    await evaluate("location.hash = '#/building'");
    await waitPage("location.hash === '#/building'", 're-enter building for floor DataV');
    await waitPage(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.handleFloorDataV && vm.buildingData && vm.buildingData.length) ? vm : (vm.$children || []).map(find).find(Boolean));
      return !!find(root);
    })()`, 'building page ready for DataV', 45000);
    await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.handleFloorDataV && vm.buildingData && vm.buildingData.length) ? vm : (vm.$children || []).map(find).find(Boolean));
      find(root).handleFloorDataV();
    })()`);
    await waitPage("location.hash.indexOf('#/floorDataV') === 0", 'floor DataV opens');
    await waitPage("Array.from(document.querySelectorAll('button')).some(b => b.disabled && b.textContent.includes('房间展示设置'))", 'demo room display saving is visibly disabled');
    await waitPage(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.array && vm.floorMessage) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      return !!(page && page.isLoading === false && page.array && page.array.length >= 1
        && page.floorMessage && page.floorMessage.floorName === '1F'
        && page.array.some(r => r.name === '演示房间 A'));
    })()`, 'floor DataV shows seeded room cards', 45000);
    await waitPage(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.alarmThingStatistics && vm.extend && vm.extend.xAxis) ? vm : (vm.$children || []).map(find).find(Boolean));
      const chart = find(root);
      return !!(chart && chart.abnormalLoading === false
        && chart.extend.xAxis.data.includes('演示房间 A')
        && chart.extend.series[0].data[chart.extend.xAxis.data.indexOf('演示房间 A')] === 3);
    })()`, 'floor alarm ranking shows room A count 3', 45000);
    await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.handleAbnormalDate && vm.extend) ? vm : (vm.$children || []).map(find).find(Boolean));
      find(root).handleAbnormalDate(2);
    })()`);
    await waitPage(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.alarmThingStatistics && vm.extend && vm.extend.xAxis) ? vm : (vm.$children || []).map(find).find(Boolean));
      const chart = find(root);
      const idx = chart && chart.extend.xAxis.data.indexOf('演示房间 B');
      return !!(chart && chart.abnormalLoading === false && chart.dateActive === 2
        && idx >= 0 && chart.extend.series[0].data[idx] === 1);
    })()`, 'week filter drops room B count to 1', 45000);
    await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.handleBack) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      if (page && page.handleBack) page.handleBack();
      else location.hash = '#/building';
    })()`);
    await waitPage("location.hash === '#/building'", 'return to building from floor DataV');
    await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.handleRoomDataV && vm.buildingData && vm.buildingData.length) ? vm : (vm.$children || []).map(find).find(Boolean));
      find(root).handleRoomDataV();
    })()`);
    await waitPage("location.hash.indexOf('#/roomDataV') === 0", 'room DataV opens');
    await waitPage("!!document.querySelector('button[disabled][title=\"演示房间筛选弹层尚未接入\"]')", 'unavailable room selector is disabled');
    await waitPage(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.array && vm.instrumentCount && vm.roomDetail) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      return !!(page && page.isLoading === false && page.array && page.array.length >= 1
        && page.roomDetail && page.roomDetail.buildingName === '演示一号楼'
        && page.array.some(r => r.name === '演示培养箱'));
    })()`, 'room DataV shows seeded instrument cards', 45000);
    await waitPage(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.alarmThingStatistics && vm.extend && vm.extend.xAxis) ? vm : (vm.$children || []).map(find).find(Boolean));
      const chart = find(root);
      return !!(chart && chart.abnormalLoading === false
        && chart.extend.xAxis.data.includes('演示培养箱')
        && chart.extend.series[0].data[chart.extend.xAxis.data.indexOf('演示培养箱')] === 3);
    })()`, 'room alarm ranking shows incubator count 3', 45000);
    await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.handleBack) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      if (page && page.handleBack) page.handleBack();
      else location.hash = '#/building';
    })()`);
    await waitPage("location.hash === '#/building'", 'return to building from room DataV');
    await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.goFloorView && vm.buildingData && vm.buildingData.length) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      const building = page.buildingData.find(b => b.id === 920001) || page.buildingData[0];
      const floor = (building.subDivisions || []).find(f => f.id === 930001) || building.subDivisions[0];
      page.goFloorView(floor);
    })()`);
    await waitPage("location.hash.indexOf('#/floor/view') === 0", 're-enter floor view for designer');
    await waitPage(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.handleConfiguar && vm.floorId) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      return !!(page && page.loading === false && page.floorId == 930001);
    })()`, 'floor view ready before designer', 45000);
    await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.handleConfiguar) ? vm : (vm.$children || []).map(find).find(Boolean));
      find(root).handleConfiguar();
    })()`);
    await waitPage("location.hash.indexOf('#/floor/designer') === 0", 'floor designer read-only opens');
    await waitPage(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.roomDrawerList && vm.handleSave) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('保存'));
      return !!(page && page.loading === false && page.roomDrawerList && page.roomDrawerList.length >= 3
        && page.roomDrawerList.some(r => r.name === '演示房间 A')
        && page.isDemo === true
        && saveBtn && saveBtn.disabled);
    })()`, 'designer shows markers and save is disabled', 45000);
    await waitPage(`(() => {
      const walk = vm => !vm ? null : vm.handleTransformEnd && vm.list && vm.list.length ? vm : (vm.$children || []).map(walk).find(Boolean);
      const vm = walk(document.querySelector('#app').__vue__);
      return !!(vm && vm.bgConfig.image && vm.$refs.stage);
    })()`, 'designer canvas ready');
    const hit = await evaluate(`(() => {
      const walk = vm => !vm ? null : vm.handleTransformEnd && vm.list && vm.list.length ? vm : (vm.$children || []).map(walk).find(Boolean);
      const vm = walk(document.querySelector('#app').__vue__);
      const stage = vm.$refs.stage.getStage();
      const text = stage.findOne('.textResize0');
      const box = text.getClientRect();
      const rect = stage.container().getBoundingClientRect();
      window.__designerProbe = {vm, stage, snapshot: JSON.stringify({list: vm.list, rooms: vm.roomDrawerList})};
      return {x: rect.left + box.x + box.width / 2, y: rect.top + box.y + box.height / 2,
        draggable: text.getParent().draggable(), transformers: stage.find('Transformer').length};
    })()`);
    assert.equal(hit.draggable, false);
    assert.equal(hit.transformers, 0);
    await send('Input.dispatchMouseEvent', {type: 'mouseMoved', x: hit.x, y: hit.y});
    await send('Input.dispatchMouseEvent', {type: 'mousePressed', x: hit.x, y: hit.y, button: 'left', buttons: 1, clickCount: 1});
    await send('Input.dispatchMouseEvent', {type: 'mouseMoved', x: hit.x + 65, y: hit.y + 25, buttons: 1});
    await send('Input.dispatchMouseEvent', {type: 'mouseReleased', x: hit.x + 65, y: hit.y + 25, button: 'left', clickCount: 1});
    await send('Input.dispatchMouseEvent', {type: 'mousePressed', x: hit.x, y: hit.y, button: 'left', buttons: 1, clickCount: 2});
    await send('Input.dispatchMouseEvent', {type: 'mouseReleased', x: hit.x, y: hit.y, button: 'left', clickCount: 2});
    assert.equal(await evaluate(`(() => {
      const {vm, stage, snapshot} = window.__designerProbe;
      vm.handleDragEnd(vm.list[0], {});
      vm.handleTransformEnd(vm.list[0], {});
      vm.handleTypeClick(vm.list[0]); vm.handleSubmit(); vm.handleDeleteClick(vm.list[0]);
      const group = stage.findOne('.textResize0').getParent();
      return !vm.isDialog && group.x() === 0 && group.y() === 0
        && snapshot === JSON.stringify({list: vm.list, rooms: vm.roomDrawerList});
    })()`), true, 'real drag/double-click and guarded edit methods must not mutate designer');
    await evaluate('delete window.__designerProbe');
    await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => (!vm ? null : (vm.handleSave && vm.isDemo) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(root);
      if (page) page.$router.back();
      else location.hash = '#/floor/view';
    })()`);
    await waitPage("location.hash.indexOf('#/floor/view') === 0 || location.hash === '#/building'", 'leave designer without save');
    await evaluate("location.hash = '#/sys/a/log'");
    await waitPage("location.hash.indexOf('#/sys/a/log') === 0", 'alarm log route opens');
    await waitPage(`(() => {
      const find = vm => (!vm ? null : (vm.handleAlarmProcess && vm.handleGetList && vm.list) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(document.querySelector('#app').__vue__);
      return !!(page && page.loading === false && page.list && page.list.length >= 5
        && page.list.some(r => r.equipmentName === '演示培养箱' && r.process === false));
    })()`, 'alarm log list loads shared instrument alarms', 45000);
    await evaluate(`(() => {
      const find = vm => (!vm ? null : (vm.handleAlarmProcess && vm.list) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(document.querySelector('#app').__vue__);
      const row = page.list.find(r => r.equipmentName === '演示培养箱' && !r.process) || page.list[0];
      window.__demoAlarmId = row.id;
      page.handleAlarmProcess(row);
    })()`);
    await waitPage(`(() => {
      const find = vm => (!vm ? null : (vm.handleSubmit && vm.dialogVisible && vm.alarmTypes) ? vm : (vm.$children || []).map(find).find(Boolean));
      const dialog = find(document.querySelector('#app').__vue__);
      return !!(dialog && dialog.dialogVisible && dialog.alarmTypes && dialog.alarmTypes.length);
    })()`, 'alarm process dialog opens with error types');
    await evaluate(`(() => {
      const find = vm => (!vm ? null : (vm.handleSubmit && vm.dialogVisible && vm.alarmTypes) ? vm : (vm.$children || []).map(find).find(Boolean));
      const dialog = find(document.querySelector('#app').__vue__);
      dialog.form.errorType = dialog.alarmTypes[0].id;
      dialog.form.processDate = '2026-09-24 12:00:00';
      dialog.form.errorCauseMethod = '演示复位';
      dialog.form.errorCauseMsg = '演示波动';
      return dialog.handleSubmit();
    })()`);
    await waitPage(`(() => {
      const find = vm => (!vm ? null : (vm.handleAlarmProcess && vm.handleGetList && vm.list) ? vm : (vm.$children || []).map(find).find(Boolean));
      const page = find(document.querySelector('#app').__vue__);
      const row = page && page.list.find(r => r.id === window.__demoAlarmId);
      return !!(row && row.process === true && row.status === 1);
    })()`, 'alarm handle refreshes row to processed', 45000);
    await evaluate('delete window.__demoAlarmId');
    // Exercise actual table checkboxes and dialog buttons, without setting form data.
    const clickElement = async expression => {
      await evaluate(`(() => { const e = ${expression}; if (!e) throw new Error('Missing click target'); e.scrollIntoView({block:'nearest', inline:'nearest'}); })()`);
      await sleep(400);
      const p = await evaluate(`(() => { const e = ${expression}; const r=e.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; })()`);
      await send('Input.dispatchMouseEvent', {type:'mouseMoved', ...p});
      await send('Input.dispatchMouseEvent', {type:'mousePressed', ...p, button:'left', buttons:1, clickCount:1});
      await send('Input.dispatchMouseEvent', {type:'mouseReleased', ...p, button:'left', clickCount:1});
      await sleep(150);
    };
    const batchRows = await evaluate(`(() => {
      const find=vm=>(!vm?null:vm.handleAlarmProcess&&vm.list?vm:(vm.$children||[]).map(find).find(Boolean));
      return find(document.querySelector('#app').__vue__).list.map((r,index)=>({id:r.id,index,process:r.process})).filter(r=>!r.process).slice(0,2);
    })()`);
    assert.equal(batchRows.length, 2);
    for (const row of batchRows) {
      await clickElement(`document.querySelectorAll('.el-table__body-wrapper tbody tr')[${row.index}].querySelector('.el-checkbox__inner')`);
    }
    await clickElement(`Array.from(document.querySelectorAll('button')).find(e=>/批量处理/.test(e.textContent))`);
    await waitPage(`(() => {
      const find=vm=>(!vm?null:vm.dialogVisible&&vm.alarmTypes?vm:(vm.$children||[]).map(find).find(Boolean));
      const d=find(document.querySelector('#app').__vue__);
      return d && d.form.ids.length===2 && d.form.processDate==='2026-09-24 12:00:00' && d.form.errorType && d.form.errorCauseMethod==='' && d.form.errorCauseMsg==='';
    })()`, 'multi-select dialog initializes fresh date and fields');
    await clickElement(`Array.from(document.querySelectorAll('.el-dialog__wrapper')).find(e=>e.getBoundingClientRect().width>0 && getComputedStyle(e).display!=='none').querySelector('.el-dialog__footer .el-button--primary')`);
    const batchCheck = `(() => {
      const find=vm=>(!vm?null:vm.handleAlarmProcess&&vm.list?vm:(vm.$children||[]).map(find).find(Boolean));
      const p=find(document.querySelector('#app').__vue__);
      return p && ${JSON.stringify(batchRows.map(r=>r.id))}.every(id=>p.list.some(r=>r.id===id && r.process===true && r.status===1 && r.processDate==='2026-09-24 12:00:00'));
    })()`;
    await waitPage(batchCheck, 'two selected alarm rows processed');
    await send('Page.reload', {ignoreCache:true});
    await waitPage(batchCheck, 'both processed alarms survive full reload');
    await evaluate("location.hash = '#/rm/room'");
    await waitPage("location.hash === '#/dashboard'", 'unopened room manage route still blocked');
    assert.equal(await evaluate("fetch('/__demo_api__/unimplemented').then(r => r.status)"), 501);
    assert.equal(await evaluate("fetch('/api/test').then(r => r.status)"), 501);
    assert.equal(await evaluate("fetch('/backupSuite/AutoBackupTool.zip').then(r => r.status)"), 501);
    const cspBlocksExternal = await evaluate(`new Promise(resolve => {
      const timer = setTimeout(() => resolve(false), 2000);
      const listener = event => {
        if (event.violatedDirective === 'connect-src') {
          document.removeEventListener('securitypolicyviolation', listener);
          clearTimeout(timer); resolve(true);
        }
      };
      document.addEventListener('securitypolicyviolation', listener);
      fetch('https://example.invalid/demo-probe').catch(() => {});
    })`);
    assert.equal(cspBlocksExternal, true, 'CSP itself must block external connections before interception');
    await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => vm.$options.name === 'Dashboard' ? vm : vm.$children.map(find).find(Boolean);
      find(root).handleDropdownMenu('3');
    })()`);
    await waitPage("!!document.querySelector('.login-button')", 'logout returns to login');
    assert.equal(await evaluate("window.localStorage.getItem('smart-facility-demo:v1:token')"), null);
    assert.equal(await evaluate("window.localStorage.getItem('token')"), 'unrelated-test-value');
    await waitPage("document.querySelector('.captcha-code-class img').naturalWidth > 0", 'new captcha after logout');
    await fill('Demo1234');
    await waitPage("!!document.querySelector('.bashboard-session')", 'second login');
    await evaluate(`(() => {const k='smart-facility-demo:v1:_auth'; const s=JSON.parse(window.localStorage.getItem(k)); s.expiresAt=0; window.localStorage.setItem(k, JSON.stringify(s));})()`);
    await send('Page.reload');
    await waitPage("!!document.querySelector('.login-button')", 'expired session redirects to login');
    assert.equal(externalAttempts, 0, 'No external application requests may be attempted');
    assert.equal(exceptions.length, 0, 'No uncaught browser exceptions: ' + exceptions.join(' | '));
    console.log(JSON.stringify({passed: true, login: true, wrongPassword: true, refresh: true, logout: true,
      expiry: true, storageIsolation: true, buildingPage: true, buildingModel: true, gardenSwitch: true,
      floorView: true, floorPlanImage: true, roomMarkers: true, roomDrawer: true, deviceDetail: true, deviceHistory: true, alarmLog: true, floorDataV: true, roomDataV: true, alarmRank: true, designerPreview: true,
      unopenedRouteBlocked: true, directApiBlocked: true, cspBlocksExternal, externalAttempts, uncaughtExceptions: exceptions.length}));
  } finally {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {await send('Browser.close', {}, null);} catch (_) {}
      socket.close();
    }
    for (const job of pending.values()) job.reject(new Error('Browser test closed'));
    browser.kill();
  }
})().catch(error => {console.error(error.message); process.exitCode = 1;});
