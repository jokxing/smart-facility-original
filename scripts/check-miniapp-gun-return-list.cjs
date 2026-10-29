const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '../miniprogram');
const store = {};
global.__SF_UNI__ = global.uni = {
  getStorageSync: key => store[key] || '',
  setStorageSync: (key, value) => { store[key] = value; },
  removeStorageSync: key => { delete store[key]; }
};
const session = require(path.join(root, 'utils/demo/session.js'));
const handlers = require(path.join(root, 'utils/demo/handlers.js'));
session.login('demo', 'Demo1234');
const request = (method, url, data) => handlers.handleDemoRequest(method, url, data, session.currentToken());
function component(file, context) {
  const source = fs.readFileSync(path.join(root, file), 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1]
    .replace(/^\s*import .*;?\s*$/gm, '').replace('export default', 'module.exports =');
  const sandbox = { module: { exports: {} }, ...context };
  vm.runInNewContext(source, sandbox);
  return sandbox.module.exports;
}
const definition = component('pages/tabBar/Labdevice/PipetteGun.vue', {
  PipetteGunCard: {}, GUNSTATUS: [{code: 0}, {code: 1}, {code: 2}], statusColor() {}, statusText() {}, columns: {},
  postGunPipetteStatistics: () => Promise.resolve(request('POST', '/api/gun/pipette/statistics', {})),
  postGunPipetteList: data => Promise.resolve(request('POST', '/api/gun/pipette/list', data))
});
const list = { ...definition.data.call({ $t: key => key }), ...definition.methods,
  _booted: true, handleLoading() {}, handleMore() {} };
const page = component('pages/tabBar/Labdevice/index.vue', {
  navbar: {}, Labdevice: {}, PipetteGun: {}, require: () => ({ getDemo: () => '' })
});
const view = { isGun: true, $refs: { pipetteGun: list }, $nextTick: fn => fn() };
async function settle() { await Promise.resolve(); await Promise.resolve(); }
(async () => {
  list.init(); await settle();
  assert.strictEqual(list.gunStatus, 'all');
  assert.strictEqual(list.gunTab.filter(tab => tab.status === list.gunStatus).length, 1);
  assert.strictEqual(list.gunTab[0].status, list.gunStatus);
  assert.strictEqual(list.list.length, 4);
  for (const status of [0, 1, 2]) {
    list.handleStatus(status); await settle();
    assert.strictEqual(list.gunTab.filter(tab => tab.status === list.gunStatus).length, 1);
    assert.ok(list.list.length > 0);
    assert.ok(list.list.every(gun => gun.homingStatus === status));
  }
  list.handleStatus('all'); await settle();
  assert.strictEqual(list.list.length, 4);
  assert.strictEqual(list.list.find(g => g.pipetteGunId === 991001).homingStatus, 0);
  assert.strictEqual(request('POST', '/api/gun/return/pipette', { gunId: 991001 }).code, 1);
  // 调用实际页面 onShow，验证缓存子组件刷新而非只验证仓库。
  list.pageNum = 2;
  page.onShow.call(view); await settle();
  assert.strictEqual(list.pageNum, 1);
  const gun = list.list.find(g => g.pipetteGunId === 991001);
  assert.strictEqual(gun.homingStatus, 1);
  assert.ok(gun.homingTime);
  assert.strictEqual(list.gunTab[2].num, 3);
  list.gunStatus = 0; list.keyword = '移液枪';
  page.onShow.call(view); await settle();
  assert.strictEqual(list.gunStatus, 0);
  assert.strictEqual(list.keyword, '移液枪');
  assert.ok(!list.list.some(g => g.pipetteGunId === 991001));
  page.onShow.call({ ...view, isGun: false, $refs: {} });
  console.log('Gun return -> page onShow -> list, counters and retained filters passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
