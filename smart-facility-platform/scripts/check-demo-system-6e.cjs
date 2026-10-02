/**
 * System 6E: cross-module consistency — leave copy, rename→hardware name,
 * delete blocked while instrument references dept.
 * Evidence → docs/evidence/system-6e.
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
const profile = fs.mkdtempSync(path.join(cache, 'demo-system-6e-'));
const outDir = path.join(cache, 'demo-system-6e-shots');
fs.mkdirSync(outDir, {recursive: true});
const evidenceDir = path.resolve(__dirname, '../../docs/evidence/system-6e');

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
    if (vm.handleGetUserList && vm.getDepartmentData && Array.isArray(vm.departmentList)) return vm;
    for (const child of (vm.$children || [])) {
      const hit = walk(child);
      if (hit) return hit;
    }
    return null;
  };
  return walk(root);
})()`;

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
    if (vm.ruleForm && vm.updateAsny && vm.isEdit) return vm;
    for (const child of (vm.$children || [])) {
      const hit = walk(child);
      if (hit) return hit;
    }
    return null;
  };
  return walk(root);
})()`;

const findHardware = `(() => {
  const root = document.querySelector('#app') && document.querySelector('#app').__vue__;
  const find = vm => (!vm ? null : (vm.$options.name === 'HardwareHome' ? vm : (vm.$children || []).map(find).find(Boolean)));
  return find(root);
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

    await evaluate("window.location.hash = '#/sys/department'");
    await waitPage("location.hash.indexOf('/sys/department') >= 0", 'department route');
    await waitPage(`${findPage} && ${findPage}.departmentList.length >= 2`, 'dept tree ready');

    const leaveCopy = await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      return root.$t('system.deleteUser');
    })()`);
    assert.ok(!/将自动解除/.test(leaveCopy), leaveCopy);
    assert.ok(/不会自动解绑/.test(leaveCopy), leaveCopy);
    await screenshot('01-leave-copy');

    const createdId = await evaluate(`(async () => {
      const page = ${findPage};
      page.handleAddDept();
      await new Promise(r => setTimeout(r, 200));
      const modal = (page.$children || []).find(c => typeof c.addDepartmentAsync === 'function');
      modal.form.departmentName = '六E引用部';
      await modal.addDepartmentAsync();
      await page.getDepartmentData();
      const walk = (list, acc=[]) => {
        (list || []).forEach(d => { acc.push(d); if (d.subDivisions) walk(d.subDivisions, acc); });
        return acc;
      };
      const hit = walk(page.departmentList).find(d => d.name === '六E引用部');
      return hit ? hit.id : null;
    })()`);
    assert.ok(createdId, 'created department id');
    await screenshot('02-created-dept');

    await evaluate("window.location.hash = '#/ld/labdevice'");
    await waitPage("location.hash.indexOf('/ld/labdevice') >= 0", 'labdevice');
    await waitPage(`${findLab} && !${findLab}.refreshLoading && ${findLab}.dataSource.length > 0`, 'lab list');
    await evaluate(`(() => {
      const page = ${findLab};
      const row = page.dataSource.find(r => r.id === 970001) || page.dataSource[0];
      page.handleEdit(row);
    })()`);
    await waitPage(`${findModal} && ${findModal}.isEdit && ${findModal}.ruleForm`, 'edit modal');
    await evaluate(`(() => {
      const modal = ${findModal};
      modal.ruleForm.departmentId = String(${createdId});
      modal.handleFormSubmit('labDeviceForm');
    })()`);
    await waitPage(`${findLab} && !${findLab}.refreshLoading && ${findLab}.dataSource.some(r => r.id === 970001 && Number(r.departmentId) === ${createdId})`, 'instrument moved in');
    await screenshot('03-instrument-in-dept');

    await evaluate("window.location.hash = '#/sys/department'");
    await waitPage(`${findPage} && ${findPage}.departmentList`, 'back department');
    const blocked = await evaluate(`(async () => {
      const page = ${findPage};
      await page.getDepartmentData();
      const tree = (page.$children || []).find(c => typeof c.deptDeleteAsync === 'function');
      await tree.deptDeleteAsync(${createdId});
      await page.getDepartmentData();
      const walk = (list, acc=[]) => {
        (list || []).forEach(d => { acc.push(d); if (d.subDivisions) walk(d.subDivisions, acc); });
        return acc;
      };
      return walk(page.departmentList).some(d => d.id === ${createdId});
    })()`);
    assert.equal(blocked, true, 'department with instrument must remain');
    await screenshot('04-delete-blocked');

    await evaluate("window.location.hash = '#/ld/labdevice'");
    await waitPage(`${findLab} && !${findLab}.refreshLoading`, 'lab again');
    await evaluate(`(() => {
      const page = ${findLab};
      const row = page.dataSource.find(r => r.id === 970001);
      page.handleEdit(row);
    })()`);
    await waitPage(`${findModal} && ${findModal}.isEdit`, 'edit back');
    await evaluate(`(() => {
      const modal = ${findModal};
      modal.ruleForm.departmentId = '900101';
      modal.handleFormSubmit('labDeviceForm');
    })()`);
    await waitPage(`${findLab} && !${findLab}.refreshLoading && ${findLab}.dataSource.some(r => r.id === 970001 && Number(r.departmentId) === 900101)`, 'instrument moved out');

    await evaluate("window.location.hash = '#/sys/department'");
    await waitPage(`location.hash.indexOf('/sys/department') >= 0 && !!(${findPage} && ${findPage}.departmentList && ${findPage}.departmentList.length >= 2)`, 'dept for delete');
    const removed = await evaluate(`(async () => {
      const page = ${findPage};
      await page.getDepartmentData();
      const tree = (page.$children || []).find(c => typeof c.deptDeleteAsync === 'function');
      await tree.deptDeleteAsync(${createdId});
      await page.getDepartmentData();
      const walk = (list, acc=[]) => {
        (list || []).forEach(d => { acc.push(d); if (d.subDivisions) walk(d.subDivisions, acc); });
        return acc;
      };
      return !walk(page.departmentList).some(d => d.id === ${createdId});
    })()`);
    assert.equal(removed, true, 'department deletable after move-out');
    await screenshot('05-delete-ok');

    await evaluate(`(async () => {
      const page = ${findPage};
      page.handleOpenDeptModal({title: '编辑', type: 2, editData: {id: 900101, name: '演示运维部'}});
      await new Promise(r => setTimeout(r, 200));
      const modal = (page.$children || []).find(c => typeof c.updateDepartmentAsync === 'function');
      modal.form.departmentName = '演示运维中心';
      modal.form.id = 900101;
      await modal.updateDepartmentAsync();
      await page.getDepartmentData();
    })()`);
    await screenshot('06-renamed');

    await evaluate("window.location.hash = '#/lhd/hardware/home'");
    await waitPage("location.hash.indexOf('/lhd/hardware/home') >= 0", 'hardware');
    await waitPage(`${findHardware} && !${findHardware}.loading && ${findHardware}.device.length > 0`, 'hardware list');
    const hwName = await evaluate(`(() => {
      const page = ${findHardware};
      const row = page.device.find(r => Number(r.departmentId) === 900101) || page.device[0];
      return row && row.departmentName;
    })()`);
    assert.equal(hwName, '演示运维中心', 'hardware departmentName after rename');
    await screenshot('07-hardware-renamed');

    publishEvidence();
    assert.equal(externalAttempts, 0, 'external attempts');
    const serious = exceptions.filter(text =>
      !/ResizeObserver|non-passive|favicon|SelectTree|getNode|Message|signError|签名/i.test(text)
    );
    assert.equal(serious.length, 0, 'uncaught: ' + serious.slice(0, 3).join(' | '));
    console.log('system-6e browser OK; externalAttempts=' + externalAttempts + '; evidence=' + evidenceDir);
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
