/**
 * Local brand/chrome smoke: login, dashboard, building, navbar, favicon links.
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
const profile = fs.mkdtempSync(path.join(cache, 'demo-brand-'));
const outDir = path.join(cache, 'demo-brand-ui-shots');
fs.mkdirSync(outDir, {recursive: true});
const evidenceDir = path.resolve(__dirname, '../../docs/evidence/brand-ui');
// Avoid writing into public/ while the demo server is running — that can trigger reload mid-login.

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
  if (result.exceptionDetails) {
    throw new Error('eval failed: ' + (result.exceptionDetails.exception && result.exceptionDetails.exception.description || result.exceptionDetails.text));
  }
  return result.result.value;
}
async function waitPage(expression, label, timeout = 30000) {
  await waitFor(async () => {
    try { return !!(await evaluate(expression)); } catch (_) { return false; }
  }, label, timeout);
}
async function screenshot(name) {
  await waitPage("!document.querySelector('[class*=\"enter-active\"], [class*=\"leave-active\"]') && document.getAnimations().every(a => a.effect.getTiming().iterations === Infinity || a.playState !== 'running')", 'page transition completed');
  await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  await sleep(350);
  const {data} = await send('Page.captureScreenshot', {format: 'png'});
  fs.writeFileSync(path.join(outDir, name + '.png'), Buffer.from(data, 'base64'));
}
function publishEvidence() {
  fs.mkdirSync(evidenceDir, {recursive: true});
  for (const file of fs.readdirSync(outDir).filter(name => /\.png$/.test(name))) {
    fs.copyFileSync(path.join(outDir, file), path.join(evidenceDir, file));
  }
}
async function visibleLogo(selector) {
  await waitPage(`(() => {
    const img = document.querySelector(${JSON.stringify(selector)});
    if (!img || !img.complete || !img.naturalWidth) return false;
    const r = img.getBoundingClientRect();
    const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return r.width > 0 && r.height > 0 && (hit === img || img.contains(hit))
      && !document.querySelector('[class*="enter-active"], [class*="leave-active"]');
  })()`, 'visible unobscured logo: ' + selector);
}
async function language(lang, selector, title) {
  await evaluate("document.querySelector('.language .el-dropdown-link, .header .el-dropdown-link, .el-dropdown-link').click()");
  await waitPage("Array.from(document.querySelectorAll('.el-dropdown-menu__item')).some(el => el.textContent.trim() === 'English' && el.getBoundingClientRect().height > 0)", 'language menu');
  await evaluate(`Array.from(document.querySelectorAll('.el-dropdown-menu__item')).find(el => el.textContent.trim() === ${JSON.stringify(lang === 'en' ? 'English' : '中文')}).click()`);
  await waitPage(`localStorage.getItem('smart-facility-demo:v1:lang') === '${lang}' && document.querySelector(${JSON.stringify(selector)})?.textContent.trim() === ${JSON.stringify(title)}`, 'language rendered ' + lang, 60000);
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
function logoProbe(selector) {
  return evaluate(`(() => {
    const img = document.querySelector(${JSON.stringify(selector)});
    if (!img) return null;
    const r = img.getBoundingClientRect();
    return {
      src: img.currentSrc || img.src || '',
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      width: Math.round(r.width),
      height: Math.round(r.height),
      ratio: r.height ? +(r.width / r.height).toFixed(3) : 0
    };
  })()`);
}

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
    };
    const target = await send('Target.createTarget', {url: 'about:blank'}, null);
    sessionId = (await send('Target.attachToTarget', {targetId: target.targetId, flatten: true}, null)).sessionId;
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {width: 1440, height: 900, screenWidth: 1440, screenHeight: 900, deviceScaleFactor: 1, mobile: false});
    await send('Page.navigate', {url: origin + '/#/dashboard'});
    await waitPage("!!document.querySelector('.login-button')", 'anonymous route redirects to login');
    await waitPage("!!(document.querySelector('.captcha-code-class img') && document.querySelector('.captcha-code-class img').naturalWidth > 0)", 'PNG captcha loads');
    await waitPage("!!(document.querySelector('.title-container .logo') && document.querySelector('.title-container .logo').naturalWidth > 0)", 'login logo loaded');
    const loginLogo = await logoProbe('.title-container .logo');
    const loginTitle = await evaluate("document.querySelector('.title-container .title').textContent.trim()");
    const favicons = await evaluate(`Array.from(document.querySelectorAll('link[rel~="icon"]')).map(l => ({href:l.href, type:l.type||''}))`);
    assert.ok(loginLogo.src.includes('facility-logo'), 'login uses facility-logo');
    assert.ok(loginLogo.ratio > 2.0 && loginLogo.ratio < 3.2, 'login logo aspect ~2.5, got ' + loginLogo.ratio);
    assert.equal(loginTitle, '智慧设施');
    assert.ok(favicons.some(f => f.href.includes('favicon.svg')), 'favicon.svg linked');
    assert.ok(favicons.some(f => f.href.includes('favicon.ico')), 'favicon.ico linked');
    const faviconLoaded = await evaluate(`Promise.all(Array.from(document.querySelectorAll('link[rel~="icon"]')).map(async link => {
      const response = await fetch(link.href); if (!response.ok) throw Error('favicon HTTP ' + response.status);
      const img = new Image(); img.src = link.href; await img.decode();
      const canvas = document.createElement('canvas'); canvas.width=32; canvas.height=32;
      const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,32,32);
      return {url: new URL(link.href).pathname, alpha:ctx.getImageData(0,0,1,1).data[3]};
    }))`);
    assert.ok(faviconLoaded.every(icon => icon.alpha === 0), 'favicon corners transparent');
    await visibleLogo('.title-container .logo');
    await screenshot('01-login-zh');
    await language('en', '.title-container .title', 'Smart Facility');
    await visibleLogo('.title-container .logo');
    await screenshot('02-login-en');
    await language('zh', '.title-container .title', '智慧设施');

    await fill('Demo1234');
    await waitPage("location.hash === '#/dashboard' && !!document.querySelector('.bashboard-session')", 'dashboard', 45000);
    await waitPage("!!(document.querySelector('.bashboard-session .logo') && document.querySelector('.bashboard-session .logo').naturalWidth > 0)", 'dashboard logo');
    const dashLogo = await logoProbe('.bashboard-session .logo');
    const dashTitle = await evaluate("document.querySelector('.facility-title').textContent.trim()");
    const company = await evaluate("document.querySelector('.company-title').textContent.trim()");
    const titleWrap = await evaluate(`(() => {
      const el = document.querySelector('.facility-title');
      const cs = getComputedStyle(el);
      return {whiteSpace: cs.whiteSpace, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, text: el.textContent.trim()};
    })()`);
    assert.ok(dashLogo.src.includes('facility-logo'), 'dashboard logo svg');
    assert.ok(dashLogo.ratio > 2.0 && dashLogo.ratio < 3.2, 'dashboard logo aspect');
    assert.equal(dashTitle, '智慧设施智能监控平台');
    assert.equal(company, '智慧设施演示空间');
    assert.ok(titleWrap.scrollWidth <= titleWrap.clientWidth + 2, 'dashboard title no wrap overflow');
    await visibleLogo('.bashboard-session .logo');
    await waitPage("!document.querySelector('.login-container') && !document.querySelector('.el-message')", 'login transition and toast removed');
    await screenshot('03-dashboard-zh');
    await language('en', '.facility-title', 'Smart Facility Monitoring');
    await visibleLogo('.bashboard-session .logo');
    assert.ok(await evaluate("document.querySelector('.facility-title').scrollWidth <= document.querySelector('.facility-title').clientWidth + 2"), 'English title fits');
    await screenshot('03-dashboard-en');
    await language('zh', '.facility-title', '智慧设施智能监控平台');

    const i18nTitles = await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      const find = vm => {
        if (!vm) return null;
        if (vm.$i18n && vm.$i18n.messages) return vm;
        return (vm.$children || []).map(find).find(Boolean) || null;
      };
      const vm = find(root);
      if (!vm) return {error: 'no-i18n'};
      const messages = vm.$i18n.messages || {};
      return {
        zh: messages.zh && messages.zh.login && messages.zh.login.companyName,
        en: messages.en && messages.en.login && messages.en.login.companyName,
        locale: vm.$i18n.locale
      };
    })()`);
    assert.ok(!i18nTitles.error, 'i18n missing: ' + JSON.stringify(i18nTitles));
    assert.equal(i18nTitles.zh, '智慧设施');
    assert.equal(i18nTitles.en, 'Smart Facility');
    fs.writeFileSync(path.join(outDir, '02-login-en.txt'),
      'login.companyName zh=' + i18nTitles.zh + ' en=' + i18nTitles.en + ' locale=' + i18nTitles.locale + '\n');

    await evaluate("location.hash = '#/building'");
    await waitPage("location.hash === '#/building' && !!document.querySelector('#container.building')", 'building');
    await waitPage("!!(document.querySelector('.header .logo img') && document.querySelector('.header .logo img').naturalWidth > 0)", 'building logo');
    await visibleLogo('.header .logo img');
    const buildingLogo = await logoProbe('.header .logo img');
    const buildingCompany = await evaluate("document.querySelector('.header .logo h4').textContent.trim()");
    assert.ok(buildingLogo.src.includes('facility-logo'));
    assert.equal(buildingCompany, '智慧设施演示空间');
    await visibleLogo('.header .logo img');
    await waitPage("!document.querySelector('.bashboard-session') && document.querySelector('#container.building canvas')?.width > 0 && getComputedStyle(document.querySelector('.canvans-loading')).display === 'none'", 'building scene ready', 60000);
    await screenshot('04-building');

    await evaluate("location.hash = '#/sys/a/log'");
    await waitPage("location.hash.indexOf('#/sys/a/log') === 0 && !!document.querySelector('.navbar-logo img')", 'navbar');
    await waitPage("!!(document.querySelector('.navbar-logo img') && document.querySelector('.navbar-logo img').naturalWidth > 0)", 'navbar logo load');
    await visibleLogo('.navbar-logo img');
    const navLogo = await logoProbe('.navbar-logo img');
    const storeLogo = await evaluate(`(() => {
      const root = document.querySelector('#app').__vue__;
      return root && root.$store ? root.$store.state.logoUrl : null;
    })()`);
    assert.ok(navLogo.src.includes('facility-logo'), 'navbar falls back to facility-logo when logoUrl empty');
    assert.equal(storeLogo, '', 'demo getLogo returns empty logoUrl');
    await visibleLogo('.navbar-logo img');
    await waitPage("!document.querySelector('#container.building') && !document.querySelector('.bashboard-session')", 'previous route removed');
    await screenshot('05-navbar');
    publishEvidence();

    console.log(JSON.stringify({
      passed: true,
      loginLogo, loginTitle, i18nTitles, favicons, faviconLoaded, dashLogo, dashTitle, company, titleWrap,
      buildingLogo, buildingCompany, navLogo, storeLogo,
      shots: evidenceDir
    }, null, 2));
  } catch (error) {
    console.error(error);
    try { console.error(await evaluate("JSON.stringify({hash:location.hash,lang:localStorage.getItem('lang'),title:document.querySelector('.title-container .title, .facility-title')?.textContent})")); } catch (_) {}
    process.exitCode = 1;
  } finally {
    try { if (socket) socket.close(); } catch (_) {}
    try { browser.kill(); } catch (_) {}
    try { fs.rmSync(profile, {recursive: true, force: true}); } catch (_) {}
  }
})();
