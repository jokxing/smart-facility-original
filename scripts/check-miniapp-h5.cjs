const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const base = process.env.H5_URL || 'http://127.0.0.1:8188';
const evidence = path.resolve(process.env.H5_EVIDENCE_DIR || path.resolve(__dirname, '../docs/evidence/cross-platform-h5'));
const results = [];
const errors = [];
const failedRequests = [];
let browser;
let page;
const record = (name, details = true) => { results.push({ name, details }); console.log(JSON.stringify(results.at(-1))); };
const visibleText = async (text) => {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible', timeout: 15000 });
};
const screenshot = async (name) => {
  await page.waitForTimeout(350);
  return page.screenshot({ path: path.join(evidence, name + '.png') });
};
const tab = async (index) => {
  // uni-app retains previous pages; CSS visibility alone can match a cached TabBar.
  const bars = page.locator('.tab-bar');
  let active;
  const deadline = Date.now() + 15000;
  while (!active && Date.now() < deadline) {
    for (let i = 0; i < await bars.count(); i++) {
      if (await bars.nth(i).evaluate(e => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.left >= -1 && r.right <= innerWidth + 1 && r.top >= 0 && r.bottom <= innerHeight + 1 &&
          document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest('.tab-bar') === e;
      })) { active = bars.nth(i); break; }
    }
    if (!active) await page.waitForTimeout(100);
  }
  assert.ok(active, 'No interactive TabBar in the current viewport');
  const icon = active.locator('.navigator-item').nth(index).locator('.icon');
  const point = await icon.evaluate(e => {
    const r = e.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    return { x, y, hit: document.elementFromPoint(x, y)?.closest('.navigator-item') === e.closest('.navigator-item') };
  });
  assert.ok(point.hit, 'Tab icon is covered in the current viewport');
  // Click the verified on-screen point; scrolling a fixed node in a resized mobile
  // emulation context can move uni-app's retained page instead of the viewport.
  await page.mouse.click(point.x, point.y);
  await page.waitForTimeout(400);
};
const back = async () => {
  await page.locator('.uni-page-head-btn:visible').first().click();
  await page.waitForTimeout(400);
};

(async () => {
  fs.mkdirSync(evidence, { recursive: true });
  browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'zh-CN', timezoneId: 'Asia/Shanghai' });
  page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) failedRequests.push({ url: response.url(), status: response.status() }); });
  page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));

  await page.goto(base + '/#/detailPage/LabdeviceDetail/index?id=970001');
  await page.waitForURL('**/myPage/Login/Login');
  record('guest detail link redirects to login');
  await page.locator('input').nth(1).fill('wrong');
  await page.getByText('本地演示登录', { exact: true }).click();
  await visibleText('账号或密码错误');
  record('invalid credentials rejected');
  await page.locator('input').nth(1).fill('Demo1234');
  await page.getByText('本地演示登录', { exact: true }).click();
  await visibleText('设备统计');
  assert.equal(await page.locator('.equipment-overview .num').allTextContents().then(a => a.map(t => t.trim())).then(a => a.join(',')), '11,1,0');
  assert.equal(await page.locator('.asset-inventory .num').allTextContents().then(a => a.map(t => t.trim())).then(a => a.join(',')), '2,1,0');
  await screenshot('01-home-mobile');
  record('login and home device/room counts');

  await tab(1);
  await page.locator('.labdevice .uni-card').first().waitFor();
  assert.equal(await page.locator('.navigator-item .text-active').innerText(), '设备');
  assert.equal(await page.locator('.labdevice .uni-card').count(), 10);
  await page.locator('.labdevice .demo-uni-col').filter({ hasText: '报警' }).click();
  await visibleText('演示示波器 B');
  assert.equal(await page.locator('.labdevice .uni-card').count(), 1);
  await page.locator('.labdevice .uni-card').first().click();
  await visibleText('DEMO-EQ-970008');
  await visibleText('45.2');
  await screenshot('02-device-detail');
  record('device list, status filter, detail and sensor readings');

  await page.locator('.inner').filter({ hasText: '数据图表' }).click();
  await page.waitForURL('**/detailPage/HistoryDataChart/HistoryDataChart?*');
  await page.locator('canvas').first().waitFor({ state: 'visible' });
  await page.getByText('24h', { exact: true }).click();
  await page.waitForTimeout(800);
  const plotted = await page.locator('.data-chart canvas').first().evaluate(canvas => {
    const rect = canvas.getBoundingClientRect();
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    let bluePixels = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] < 100 && pixels[i + 1] > 80 && pixels[i + 1] < 210 && pixels[i + 2] > 160 && pixels[i + 3] > 100) bluePixels++;
    }
    return {height: rect.height, bluePixels};
  });
  assert.ok(plotted.height > 100 && plotted.bluePixels > 20, `Chart curve is not visible: ${JSON.stringify(plotted)}`);
  await screenshot('03-chart');
  record('historical chart canvas and period switch');
  await back();

  await page.getByText('预约申请', { exact: true }).click();
  await page.locator('.time-select-popup .title').waitFor({ state: 'visible' });
  await page.locator('.time-select-popup .date .uni-icons').last().click();
  await page.locator('.time-select-popup .checklist-box').first().click();
  await page.locator('.time-select-popup .footer .button-primary').click();
  await visibleText('预约成功');
  record('create future reservation through time picker');

  await back();
  await tab(4);
  await page.getByText('我的预约', { exact: true }).click();
  await visibleText('演示示波器 B');
  await screenshot('04-reservation');
  await page.reload();
  await visibleText('演示示波器 B');
  record('reservation survives browser reload');
  await page.getByText('取消预约', { exact: true }).first().click();
  await page.locator('.uni-popup-dialog .uni-dialog-button').last().click();
  await visibleText('已取消');
  record('cancel reservation');
  await back();

  await tab(2);
  await page.locator('.room .uni-card').first().waitFor();
  assert.equal(await page.locator('.room .uni-card').count(), 3);
  await page.locator('.room .uni-card').filter({ hasText: '房间 B' }).click();
  await visibleText('演示示波器 B');
  await screenshot('05-room-detail');
  record('room list and linked device detail');
  await back();

  await tab(1);
  await page.locator('.labdevice .demo-uni-col').filter({ hasText: '报警' }).click();
  await page.locator('.labdevice .uni-card').first().click();
  await visibleText('DEMO-EQ-970008');
  await page.getByText('报警记录', { exact: true }).click();
  await page.locator('.abnormalRecord .uni-card').first().waitFor();
  await page.locator('.abnormalRecord .uni-card').first().click();
  await page.locator('.popup-content textarea').first().fill('H5 演示：已核查环境，登记人工处理');
  await page.locator('.popup-content .button-primary').click();
  await visibleText('已处理');
  await screenshot('06-alarm-handled');
  record('alarm handling persisted');
  await back();

  await tab(3);
  await page.locator('.transport-list').first().waitFor();
  const departing = page.locator('.transport-list').filter({ has: page.locator('.but-transport', { hasText: '出发' }) }).first();
  const number = (await departing.locator('.transport-name').innerText()).match(/TO-DEMO-\d+/)[0];
  await departing.locator('.but-transport').click();
  await page.locator('.depart-hint .button-primary:visible').click();
  const shipped = page.locator('.transport-list').filter({ hasText: number });
  await shipped.locator('.but-transport').filter({ hasText: '送达' }).waitFor();
  await shipped.locator('.but-transport').click();
  await page.locator('.uni-popup-dialog .uni-dialog-button:visible').last().click();
  await shipped.locator('.deliveried').waitFor();
  await shipped.click();
  await visibleText('操作记录（演示）');
  await screenshot('07-waybill-delivered');
  await page.getByText('演示凭证预览', { exact: true }).click();
  await visibleText('蓝牙打印未接入');
  record('waybill depart, arrive, operation history and demo voucher');
  await back();
  await back();

  await tab(0);
  await page.getByText('消息中心', { exact: true }).click();
  await visibleText('一键已读');
  await page.getByText('一键已读', { exact: true }).click();
  await screenshot('08-messages');
  record('message centre and mark read');
  await back();

  await tab(1);
  await page.locator('.nav-left-btn').click();
  await page.locator('.labdevice .uni-card').first().waitFor();
  await screenshot('08-pipette-list');
  await page.locator('.labdevice .uni-card').first().click();
  await visibleText('移液枪');
  await screenshot('08-pipette-detail');
  record('pipette list and detail; no real hardware used');
  await back();
  await tab(0);

  await tab(4);
  await page.locator('.my .head').click();
  await page.getByText('退出登录', { exact: true }).click();
  await page.waitForURL('**/myPage/Login/Login');
  await page.locator('input').nth(1).fill('Demo1234');
  await page.getByText('本地演示登录', { exact: true }).click();
  await visibleText('设备统计');
  await tab(3);
  await page.locator('.transport-list').filter({ hasText: number }).locator('.deliveried').waitFor();
  record('logout/relogin preserves waybill business state');

  await tab(0);

  for (const [width, height] of [[320, 740], [768, 1024], [1280, 900]]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(250);
    const layout = await page.evaluate(() => ({
      viewport: innerWidth,
      content: document.documentElement.scrollWidth,
      tab: document.querySelector('.tab-bar').getBoundingClientRect().toJSON(),
      body: document.querySelector('uni-page-body').getBoundingClientRect().toJSON()
    }));
    assert.ok(layout.content <= width + 1, `Horizontal overflow at ${width}: ${JSON.stringify(layout)}`);
    assert.ok(layout.tab.width <= Math.min(width, 480) + 1, JSON.stringify(layout));
    await screenshot('09-home-width-' + width);
    record('responsive layout ' + width, layout);
  }
  await tab(1);
  if ((await page.locator('.nav-left-btn').innerText()).includes('设备')) await page.locator('.nav-left-btn').click();
  await page.locator('.labdevice .uni-card').first().click();
  await page.getByText('预约申请', { exact: true }).click();
  await page.locator('.time-select-popup .title').waitFor();
  const popupWidth = await page.locator('.time-select-popup .uni-popup__wrapper').evaluate(e => e.getBoundingClientRect().width);
  assert.ok(popupWidth <= 481, `Desktop popup width: ${popupWidth}`);
  await screenshot('09-reservation-desktop');
  record('desktop reservation popup width', popupWidth);
  await page.locator('.time-select-popup .title .uni-icons').click();
  await back();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= 390), 'Device page overflow after shrinking from desktop');
  await tab(4);
  await visibleText('我的预约');
  record('device page and tab interaction after shrinking to mobile');
  record('runtime errors', errors);
  record('failed resources', failedRequests);
  assert.deepEqual(errors, []);
  assert.deepEqual(failedRequests, []);
})().catch(async error => {
  record('FAIL', error.stack);
  if (page) { console.log('URL', page.url()); console.log('BODY', await page.locator('body').innerText().catch(() => 'unavailable')); await screenshot('failure').catch(() => {}); }
  process.exitCode = 1;
}).finally(async () => {
  fs.mkdirSync(evidence, { recursive: true });
  fs.writeFileSync(path.join(evidence, 'results.json'), JSON.stringify({ at: new Date().toISOString(), status: process.exitCode ? 'failed' : 'passed', base, browser: browser ? browser.version() : null, results, errors, failedRequests }, null, 2));
  if (!process.exitCode) fs.rmSync(path.join(evidence, 'failure.png'), { force: true });
  if (browser) await browser.close();
});
