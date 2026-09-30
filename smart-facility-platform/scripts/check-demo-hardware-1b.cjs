/**
 * Hardware 1B: open recorder/socket detail drawer from list ? basic info, curve, alarms.
 * Evidence ? docs/evidence/hardware-1b. Requires demo on DEMO_PORT (default 8088).
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
const profile = fs.mkdtempSync(path.join(cache, 'demo-hardware-1b-'));
const outDir = path.join(cache, 'demo-hardware-1b-shots');
fs.mkdirSync(outDir, {recursive: true});
const evidenceDir = path.resolve(__dirname, '../../docs/evidence/hardware-1b');

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
const findHW = `(() => {
  const root = document.querySelector('#app') && document.querySelector('#app').__vue__;
  const find = vm => (!vm ? null : (vm.$options.name === 'HardwareHome' ? vm : (vm.$children || []).map(find).find(Boolean)));
  return find(root);
})()`;
const findDrawer = `(() => {
  const root = document.querySelector('#app') && document.querySelector('#app').__vue__;
  const find = vm => (!vm ? null : ((vm.device && vm.getDetail && vm.$options.components && (vm.monitorSensors || vm.sensorsFlag)) || (vm.$options.name && String(vm.$options.name).includes('DeviceDrawer')) ? vm : null) || (vm.$children || []).map(find).find(Boolean));
  // Prefer visible drawer with loaded device id
  const walk = vm => {
    if (!vm) return null;
    if (vm.isDrawer && vm.device && vm.device.id && !vm.loading) return vm;
    for (const child of (vm.$children || [])) {
      const hit = walk(child);
      if (hit) return hit;
    }
    return null;
  };
  return walk(root);
})()`;
const findAlerter = `(() => {
  const root = document.querySelector('#app') && document.querySelector('#app').__vue__;
  const walk = vm => {
    if (!vm) return null;
    if (vm.isDrawer && vm.alertor && vm.alertor.id && vm.$options && vm.$options.name === 'AlerterDrawer') return vm;
    for (const child of (vm.$children || [])) {
      const hit = walk(child);
      if (hit) return hit;
    }
    return null;
  };
  return walk(root);
})()`;
const findPower = `(() => {
  const root = document.querySelector('#app') && document.querySelector('#app').__vue__;
  const walk = vm => {
    if (!vm) return null;
    if (vm.isDrawer && vm.powerOutage && vm.powerOutage.id && vm.$options && vm.$options.name === 'PowerDrawer') return vm;
    for (const child of (vm.$children || [])) {
      const hit = walk(child);
      if (hit) return hit;
    }
    return null;
  };
  return walk(root);
})()`;
const findSignal = `(() => {
  const root = document.querySelector('#app') && document.querySelector('#app').__vue__;
  const walk = vm => {
    if (!vm) return null;
    if (vm.isDrawer && vm.signal && vm.signal.id && vm.$options && vm.$options.name === 'SignalSourceDrawer') return vm;
    for (const child of (vm.$children || [])) {
      const hit = walk(child);
      if (hit) return hit;
    }
    return null;
  };
  return walk(root);
})()`;
const findGunRack = `(() => {
  const root = document.querySelector('#app') && document.querySelector('#app').__vue__;
  const walk = vm => {
    if (!vm) return null;
    if (vm.isDrawer && vm.powerOutage && vm.powerOutage.id && vm.$options && vm.$options.name === 'GunRackDrawer') return vm;
    for (const child of (vm.$children || [])) {
      const hit = walk(child);
      if (hit) return hit;
    }
    return null;
  };
  return walk(root);
})()`;
const findGateway = `(() => {
  const root = document.querySelector('#app') && document.querySelector('#app').__vue__;
  const walk = vm => {
    if (!vm) return null;
    if (vm.isDrawer && vm.detail && vm.detail.id && vm.$options && vm.$options.name === 'AssetGatewayDrawer') return vm;
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
    await evaluate("Array.from(document.querySelectorAll('.bashboard-session .div-a')).find(el => el.textContent.includes('智能硬件')).click()");
    await waitPage("!!document.querySelector('.hardware-home')", 'hardware home');
    await waitPage(`${findHW} && !${findHW}.loading && ${findHW}.device.length > 0`, 'list ready');

    // Open recorder detail (first page includes 980001 in seed order)
    await evaluate(`(() => {
      const hw = ${findHW};
      hw.items.keyword = '';
      hw.items.pageNum = 1;
      hw.items.equipmentType = null;
      hw.items.deviceType = 0;
      hw.getList();
    })()`);
    await waitPage(`${findHW} && !${findHW}.loading && ${findHW}.device.some(r => r.id === 980001)`, 'recorder in list');
    await sleep(300);
    await evaluate(`(() => {
      const hw = ${findHW};
      const row = hw.device.find(r => r.id === 980001);
      if (!row) throw new Error('recorder row missing ids=' + hw.device.map(r => r.id).join(','));
      const table = hw.$children.find(c => c.handleShowDrawer);
      if (!table) throw new Error('DeviceTable missing');
      table.handleShowDrawer(row);
    })()`);
    await waitPage(`${findDrawer} && ${findDrawer}.device.id === 980001`, 'recorder drawer open');
    await waitPage(`${findDrawer} && ${findDrawer}.monitorSensors.length > 0`, 'monitor sensors loaded');
    // Demo: interval/rules toolbar only ? no acoustic switches; sensor min/max present
    assert.equal(await evaluate(`${findDrawer}.isDemo === true`), true);
    assert.equal(await evaluate(`!!document.querySelector('.detail-handle-demo')`), true, 'demo settings toolbar');
    assert.equal(await evaluate(`!document.querySelector('.detail-handle-demo .el-switch')`), true, 'no demo switches');
    assert.equal(await evaluate(`${findDrawer}.device.sensors[0].min === 0 && ${findDrawer}.device.sensors[0].max === 30`), true);
    assert.equal(await evaluate(`!String(${findDrawer}.device.sensors[0].min).includes('undefined')`), true);
    await screenshot('01-recorder-detail');

    // Interval + threshold settings closed loop on 980001
    await evaluate("localStorage.removeItem('smart-facility-demo:v1:equipmentSettings')");
    await evaluate(`(() => { ${findDrawer}.getDetail(); })()`);
    await waitPage(`${findDrawer} && ${findDrawer}.device.reportingInterval === 10 && !${findDrawer}.loading`, 'settings reset');
    await evaluate(`(() => {
      const d = ${findDrawer};
      d.$refs.UpdateExportTime.open(0, d.device);
    })()`);
    await waitPage(`${findDrawer}.$refs.UpdateExportTime.dialogVisible === true`, 'export dialog');
    await evaluate(`(() => {
      const dlg = ${findDrawer}.$refs.UpdateExportTime;
      dlg.form.reportingInterval = '15';
      dlg.handleSubmit();
    })()`);
    await waitPage(`${findDrawer} && !${findDrawer}.loading && ${findDrawer}.device.reportingInterval === 15`, 'reporting updated');
    await evaluate(`(() => {
      const d = ${findDrawer};
      d.$refs.UpdateAlarmTime.open(0, d.device);
    })()`);
    await waitPage(`${findDrawer}.$refs.UpdateAlarmTime.dialogVisible === true`, 'alarm interval dialog');
    await evaluate(`(() => {
      const dlg = ${findDrawer}.$refs.UpdateAlarmTime;
      dlg.form.alarmInterval = '8';
      dlg.handleSubmit();
    })()`);
    await waitPage(`${findDrawer} && !${findDrawer}.loading && ${findDrawer}.device.alarmInterval === 8`, 'alarm interval updated');
    await evaluate(`(() => {
      const d = ${findDrawer};
      d.$refs.UpdateAlarmRules.open(0, d.device);
    })()`);
    await waitPage(`${findDrawer}.$refs.UpdateAlarmRules.dialogVisible === true`, 'rules dialog');
    await evaluate(`(() => {
      const dlg = ${findDrawer}.$refs.UpdateAlarmRules;
      dlg.sensors[0].min = '2';
      dlg.sensors[0].max = '28';
      dlg.handleSubmit();
    })()`);
    await waitPage(`${findDrawer} && !${findDrawer}.loading && ${findDrawer}.device.sensors[0].min === 2 && ${findDrawer}.device.sensors[0].max === 28`, 'thresholds updated');
    await screenshot('06-settings-updated');

    // Department + principal closed loop on same drawer
    await waitPage(`${findDrawer} && ${findDrawer}.device && ${findDrawer}.device.id === 980001`, 'drawer before owner');
    await evaluate(`localStorage.removeItem('smart-facility-demo:v1:equipmentMeta'); localStorage.removeItem('smart-facility-demo:v1:equipmentUsers');`);
    await evaluate(`(() => {
      const d = ${findDrawer};
      if (!d) throw new Error('drawer missing before meta reset');
      d.getDetail();
    })()`);
    await waitPage(`${findDrawer} && ${findDrawer}.device && ${findDrawer}.device.id === 980001 && !${findDrawer}.loading && ${findDrawer}.device.no === 'EQ-TH-001'`, 'meta reset');
    await evaluate(`(() => {
      const d = ${findDrawer};
      d.handleEquipmentUsers();
      d.$refs.UpdateDepartment.open(0, d.device);
    })()`);
    await waitPage(`${findDrawer} && ${findDrawer}.$refs.UpdateDepartment.dialogVisible === true`, 'dept dialog');
    await evaluate(`(() => {
      const dlg = ${findDrawer}.$refs.UpdateDepartment;
      dlg.form.name = 'Demo-Recorder-A';
      dlg.form.departmentId = 900102;
      dlg.selectTreeValue = '900102';
      dlg.handleSubmit();
    })()`);
    await waitPage(`${findDrawer} && ${findDrawer}.device && !${findDrawer}.loading && ${findDrawer}.device.name === 'Demo-Recorder-A' && Number(${findDrawer}.device.departmentId) === 900102`, 'dept updated');
    await evaluate(`(() => {
      const d = ${findDrawer};
      d.$refs.SetPrincipal.open(0, d.device.id);
    })()`);
    await waitPage(`${findDrawer} && ${findDrawer}.$refs.SetPrincipal.dialogVisible === true`, 'principal dialog');
    await waitPage(`${findDrawer} && ${findDrawer}.$refs.SetPrincipal.personnels.length > 0`, 'staff loaded');
    await evaluate(`(() => {
      const dlg = ${findDrawer}.$refs.SetPrincipal;
      dlg.form.userIds = [900002];
      dlg.form.weixin = true;
      dlg.form.sms = false;
      dlg.form.phone = false;
      dlg.handleSubmit();
    })()`);
    await waitPage(`${findDrawer} && !${findDrawer}.principalLoading && ${findDrawer}.equipmentUsers.some(u => Number(u.userId) === 900002)`, 'principal added');
    await screenshot('07-owner-dept-updated');

    // Binding room + instrument (demo DeviceBindRelationship, no nested drawers)
    await evaluate("localStorage.removeItem('smart-facility-demo:v1:equipmentBindings')");
    await evaluate(`(() => {
      const d = ${findDrawer};
      const walk = vm => {
        if (!vm) return null;
        if (vm.handleDeviceBinding && Array.isArray(vm.bingThings)) return vm;
        for (const child of (vm.$children || [])) {
          const hit = walk(child);
          if (hit) return hit;
        }
        return null;
      };
      const bind = walk(d);
      if (!bind) throw new Error('bind component missing');
      bind.handleDeviceBinding();
    })()`);
    const findBind = `(() => {
      const d = ${findDrawer};
      const walk = vm => {
        if (!vm) return null;
        if (vm.handleDeviceBinding && Array.isArray(vm.bingThings) && vm.isDemo) return vm;
        for (const child of (vm.$children || [])) {
          const hit = walk(child);
          if (hit) return hit;
        }
        return null;
      };
      return walk(d);
    })()`;
    await waitPage(`${findBind} && ${findBind}.bingThings.length === 0`, 'bindings cleared');
    await evaluate("Array.from(document.querySelectorAll('.device-bind-relationship button')).find(el => el.textContent.trim() === '绑定房间').click()");
    await waitPage(`${findBind} && ${findBind}.bindDialogVisible && !${findBind}.catalogLoading && ${findBind}.bindOptions.length > 0`, 'room catalog loaded');
    await evaluate("Array.from(document.querySelectorAll('.el-dialog .el-select')).find(el => el.getBoundingClientRect().height > 0).click()");
    await waitPage("Array.from(document.querySelectorAll('.el-select-dropdown__item')).some(el => el.textContent.trim() === '演示房间 A' && el.getBoundingClientRect().height > 0)", 'room options');
    await evaluate("Array.from(document.querySelectorAll('.el-select-dropdown__item')).find(el => el.textContent.trim() === '演示房间 A' && el.getBoundingClientRect().height > 0).click()");
    await evaluate("Array.from(document.querySelectorAll('.el-dialog button')).find(el => el.textContent.trim() === '确定' && el.getBoundingClientRect().height > 0).click()");
    await waitPage(`${findBind} && ${findBind}.bingThings.some(i => Number(i.id) === 950001 && Number(i.type) === 11)`, 'room bound');
    await evaluate("Array.from(document.querySelectorAll('.device-bind-relationship button')).find(el => el.textContent.trim() === '绑定仪器').click()");
    await waitPage(`${findBind} && ${findBind}.bindDialogVisible && !${findBind}.catalogLoading && ${findBind}.bindOptions.length > 0`, 'instrument catalog loaded');
    await evaluate("Array.from(document.querySelectorAll('.el-dialog .el-select')).find(el => el.getBoundingClientRect().height > 0).click()");
    await waitPage("Array.from(document.querySelectorAll('.el-select-dropdown__item')).some(el => el.textContent.trim() === '演示培养箱' && el.getBoundingClientRect().height > 0)", 'instrument options');
    await evaluate("Array.from(document.querySelectorAll('.el-select-dropdown__item')).find(el => el.textContent.trim() === '演示培养箱' && el.getBoundingClientRect().height > 0).click()");
    await evaluate("Array.from(document.querySelectorAll('.el-dialog button')).find(el => el.textContent.trim() === '确定' && el.getBoundingClientRect().height > 0).click()");
    await waitPage(`${findBind} && ${findBind}.bingThings.length === 2`, 'instrument bound');
    await screenshot('08-binding-updated');

    // Curve rows present (MonitorInfo)
    await waitPage(`(() => {
      const d = ${findDrawer};
      const find = vm => (!vm ? null : (vm.dataCharts && vm.dataCharts.rows ? vm : (vm.$children || []).map(find).find(Boolean)));
      const m = find(d);
      return m && m.dataCharts.rows.length > 0;
    })()`, 'curve has points');
    await screenshot('02-recorder-curve');

    // Closed-loop: threshold alarm process on 980002 (seed process:false)
    await evaluate("localStorage.removeItem('smart-facility-demo:v1:equipmentAlarmHandles')");
    await evaluate(`(() => { const d = ${findDrawer}; if (d) d.$emit('update:isDrawer', false); })()`);
    await sleep(400);
    await evaluate(`(() => {
      const hw = ${findHW};
      const row = hw.device.find(r => r.id === 980002);
      if (!row) throw new Error('row 980002 missing');
      hw.$children.find(c => c.handleShowDrawer).handleShowDrawer(row);
    })()`);
    await waitPage(`${findDrawer} && ${findDrawer}.device.id === 980002`, 'alarm device drawer');
    const findAlarm = `(() => {
      const d = ${findDrawer};
      const walk = vm => {
        if (!vm) return null;
        if (vm.handleAlarmProcess && Array.isArray(vm.list) && vm.$refs && vm.$refs.AlarmProcessing) return vm;
        for (const child of (vm.$children || [])) {
          const hit = walk(child);
          if (hit) return hit;
        }
        return null;
      };
      return walk(d);
    })()`;
    await waitPage(`${findAlarm} && ${findAlarm}.list.length > 0 && ${findAlarm}.list[0].process === false`, 'unprocessed threshold alarm');
    await evaluate(`(() => { const a = ${findAlarm}; a.handleAlarmProcess(a.list[0]); })()`);
    await waitPage(`${findAlarm} && ${findAlarm}.$refs.AlarmProcessing.dialogVisible === true`, 'alarm dialog');
    await evaluate(`(() => {
      const ap = ${findAlarm}.$refs.AlarmProcessing;
      ap.form.errorType = 1;
      ap.form.processDate = '2026-09-24 12:30:00';
      ap.form.errorCauseMethod = 'demo-check';
      ap.form.errorCauseMsg = 'sensor-false-alarm';
      ap.handleSubmit();
    })()`);
    await waitPage(`${findAlarm} && !${findAlarm}.loading && ${findAlarm}.list[0].process === true`, 'alarm list processed');
    assert.equal(await evaluate(`${findAlarm}.list[0].errorCauseMsg`), 'sensor-false-alarm');
    await screenshot('05-alarm-processed');

    // Alerter detail (type 7)
    await evaluate(`(() => {
      const d = ${findDrawer};
      if (d) d.$emit('update:isDrawer', false);
    })()`);
    await sleep(300);
    await evaluate(`(() => {
      const hw = ${findHW};
      hw.items.keyword = 'EQ-AL-001';
      hw.items.pageNum = 1;
      hw.getList();
    })()`);
    await waitPage(`${findHW} && !${findHW}.loading && ${findHW}.device.some(r => r.id === 980012)`, 'alerter in list');
    await evaluate(`(() => {
      const hw = ${findHW};
      const row = hw.device.find(r => r.id === 980012);
      if (!row) throw new Error('row 980012 missing');
      hw.$children.find(c => c.handleShowDrawer).handleShowDrawer(row);
    })()`);
    await waitPage(`${findAlerter} && ${findAlerter}.alertor && ${findAlerter}.alertor.id === 980012 && Number(${findAlerter}.beepDuration) === 30`, 'alerter drawer');
    await screenshot('09-alerter-detail');

    // Power detail (type 8)
    await evaluate(`(() => {
      const a = ${findAlerter};
      if (a) a.$emit('update:isDrawer', false);
    })()`);
    await sleep(300);
    await evaluate(`(() => {
      const hw = ${findHW};
      hw.items.keyword = 'EQ-PO-001';
      hw.items.pageNum = 1;
      hw.getList();
    })()`);
    await waitPage(`${findHW} && !${findHW}.loading && ${findHW}.device.some(r => r.id === 980014)`, 'power in list');
    await evaluate(`(() => {
      const hw = ${findHW};
      const row = hw.device.find(r => r.id === 980014);
      if (!row) throw new Error('row 980014 missing');
      hw.$children.find(c => c.handleShowDrawer).handleShowDrawer(row);
    })()`);
    await waitPage(`${findPower} && ${findPower}.powerOutage && ${findPower}.powerOutage.id === 980014 && ${findPower}.powerOutage.powerFailure === 1`, 'power drawer');
    await screenshot('10-power-detail');
    assert.ok(await evaluate("!document.querySelector('.el-drawer').textContent.includes('℃')"), 'power drawer must not display temperature units');

    // Signal receiver detail (type 14)
    await evaluate(`(() => {
      const p = ${findPower};
      if (p) p.$emit('update:isDrawer', false);
    })()`);
    await sleep(300);
    await evaluate(`(() => {
      const hw = ${findHW};
      hw.items.keyword = 'EQ-SG-001';
      hw.items.pageNum = 1;
      hw.getList();
    })()`);
    await waitPage(`${findHW} && !${findHW}.loading && ${findHW}.device.some(r => r.id === 980016)`, 'signal in list');
    await evaluate(`(() => {
      const hw = ${findHW};
      const row = hw.device.find(r => r.id === 980016);
      if (!row) throw new Error('row 980016 missing');
      hw.$children.find(c => c.handleShowDrawer).handleShowDrawer(row);
    })()`);
    await waitPage(`${findSignal} && ${findSignal}.signal && ${findSignal}.signal.id === 980016 && ${findSignal}.signalData && ${findSignal}.signalData.some(r => r.id === 980001)`, 'signal drawer');
    await screenshot('11-signal-detail');

    // Gun rack detail (type 13)
    await evaluate(`(() => {
      const s = ${findSignal};
      if (s) s.$emit('update:isDrawer', false);
    })()`);
    await sleep(300);
    await evaluate(`(() => {
      const hw = ${findHW};
      hw.items.keyword = 'EQ-GR-001';
      hw.items.pageNum = 1;
      hw.getList();
    })()`);
    await waitPage(`${findHW} && !${findHW}.loading && ${findHW}.device.some(r => r.id === 980023)`, 'gunrack in list');
    await evaluate(`(() => {
      const hw = ${findHW};
      const row = hw.device.find(r => r.id === 980023);
      if (!row) throw new Error('row 980023 missing');
      hw.$children.find(c => c.handleShowDrawer).handleShowDrawer(row);
    })()`);
    await waitPage(`${findGunRack} && ${findGunRack}.powerOutage && ${findGunRack}.powerOutage.id === 980023 && ${findGunRack}.list && ${findGunRack}.list.some(r => r.no === 'PG-001')`, 'gunrack drawer');
    await screenshot('13-gunrack-detail');

    // Gateway detail (type 16)
    await evaluate(`(() => {
      const g = ${findGunRack};
      if (g) g.$emit('update:isDrawer', false);
    })()`);
    await sleep(300);
    await evaluate(`(() => {
      const hw = ${findHW};
      hw.items.keyword = 'EQ-GW-001';
      hw.items.pageNum = 1;
      hw.getList();
    })()`);
    await waitPage(`${findHW} && !${findHW}.loading && ${findHW}.device.some(r => r.id === 980025)`, 'gateway in list');
    await evaluate(`(() => {
      const hw = ${findHW};
      const row = hw.device.find(r => r.id === 980025);
      if (!row) throw new Error('row 980025 missing');
      hw.$children.find(c => c.handleShowDrawer).handleShowDrawer(row);
    })()`);
    await waitPage(`${findGateway} && ${findGateway}.detail && ${findGateway}.detail.id === 980025 && ${findGateway}.labelList && ${findGateway}.labelList.some(r => r.labelNo === 'TAG-001')`, 'gateway drawer');
    await screenshot('14-gateway-detail');

    // Unsupported type still blocked (unknown = 99)
    await evaluate(`(() => {
      const g = ${findGateway};
      if (g) g.$emit('update:isDrawer', false);
    })()`);
    await sleep(300);
    await evaluate(`(() => {
      const hw = ${findHW};
      const row = {equipmentTypeCode: 99, openTwoSystem: true, strId: '980099', id: 980099, name: 'Demo-Unknown'};
      if (!hw.device.some(r => r.equipmentTypeCode === 99)) {
        hw.device = hw.device.concat([row]);
      }
      const table = hw.$children.find(c => c.handleShowDrawer);
      table.handleShowDrawer(hw.device.find(r => r.equipmentTypeCode === 99));
    })()`);
    await waitPage("Array.from(document.querySelectorAll('.el-message')).some(e => /\u672a\u77e5|\u6682\u672a|\u5c1a\u672a|\u540e\u7eed/.test(e.textContent))", 'unknown blocked');

    // Socket detail + network config read-only
    await evaluate(`(() => {
      const hw = ${findHW};
      hw.items.keyword = 'EQ-SK-001';
      hw.items.pageNum = 1;
      hw.getList();
    })()`);
    await waitPage(`${findHW} && !${findHW}.loading && ${findHW}.device.some(r => r.id === 980010)`, 'socket in list');
    await evaluate(`(() => {
      const hw = ${findHW};
      const row = hw.device.find(r => r.id === 980010);
      if (!row) throw new Error('row 980010 missing');
      hw.$children.find(c => c.handleShowDrawer).handleShowDrawer(row);
    })()`);
    await waitPage(`${findDrawer} && ${findDrawer}.device.id === 980010 && ${findDrawer}.device.equipmentTypeCode === 10`, 'socket drawer');
    await screenshot('03-socket-detail');
    await evaluate(`(() => {
      const d = ${findDrawer};
      d.handleDropdownMenu('NetworkConfiguration');
    })()`);
    await waitPage(`${findDrawer} && ${findDrawer}.$refs.NetworkConfiguration && ${findDrawer}.$refs.NetworkConfiguration.dialogVisible === true && ${findDrawer}.$refs.NetworkConfiguration.form && ${findDrawer}.$refs.NetworkConfiguration.form.wifiConfig && ${findDrawer}.$refs.NetworkConfiguration.form.wifiConfig.ssid === 'Demo-Lab-WiFi-10'`, 'network config open');
    await screenshot('12-network-config');
    await evaluate(`(() => {
      const d = ${findDrawer};
      d.$refs.NetworkConfiguration.handleClose();
    })()`);

    // Close and return list / dashboard
    await evaluate(`(() => { const d = ${findDrawer}; if (d) d.$emit('update:isDrawer', false); })()`);
    await evaluate("location.hash = '#/dashboard'");
    await waitPage("location.hash === '#/dashboard'", 'back dashboard');
    await screenshot('04-back-dashboard');

    assert.equal(externalAttempts, 0);
    assert.equal(exceptions.length, 0, exceptions.join(' | '));
    publishEvidence();
    console.log(JSON.stringify({
      passed: true, recorderDetail: true, curve: true, settingsUpdated: true, ownerDeptUpdated: true,
      bindingUpdated: true, alarmProcessed: true, alerterDetail: true, powerDetail: true,
      signalDetail: true, socketDetail: true, networkConfig: true, gunRackDetail: true,
      gatewayDetail: true, unsupportedBlocked: true,
      evidenceDir, externalAttempts, uncaughtExceptions: exceptions.length
    }));
  } finally {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try { await send('Browser.close', {}, null); } catch (_) {}
      socket.close();
    }
    for (const job of pending.values()) job.reject(new Error('closed'));
    browser.kill();
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
