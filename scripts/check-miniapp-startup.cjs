const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../miniprogram');
let route = '';
let token = '';
const jumps = [];
const sandbox = {
  require: name => name.includes('storage')
    ? { getDemo: () => token }
    : { isDemoToken: value => value === 'sf-demo-test' },
  getCurrentPages: () => route ? [{ route }] : [],
  uni: { hideTabBar() {}, getSystemInfoSync: () => ({}), reLaunch: options => jumps.push(options) },
  module: { exports: {} }
};
const source = fs.readFileSync(path.join(root, 'App.vue'), 'utf8')
  .match(/<script>([\s\S]*?)<\/script>/)[1].replace('export default', 'module.exports =');
vm.runInNewContext(source, sandbox);
const definition = sandbox.module.exports;
const app = { ...definition.methods };
definition.onLaunch.call(app);
definition.onShow.call(app);
assert.equal(jumps.length, 0, 'Do not navigate before the first page is ready');
app.applySessionRoute();
assert.equal(jumps.length, 0, 'No navigation with an empty page stack');
route = 'pages/tabBar/Home/Home';
app._sessionReady = true;
app.applySessionRoute();
definition.onShow.call(app);
app.applySessionRoute();
assert.equal(jumps.length, 1, 'Concurrent auth checks share a navigation lock');
assert.equal(jumps[0].url, '/myPage/Login/Login');
route = 'myPage/Login/Login';
jumps[0].complete();
app.applySessionRoute();
assert.equal(jumps.length, 1, 'Do not relaunch an existing login page');
token = 'sf-demo-test';
app.applySessionRoute();
assert.equal(jumps.length, 2);
assert.equal(jumps[1].url, '/pages/tabBar/Home/Home');
route = 'pages/tabBar/Home/Home';
jumps[1].complete();
definition.onShow.call(app);
assert.equal(jumps.length, 2, 'Authenticated foreground resume keeps the current page');
console.log('Startup route timing, shared lock, login and resume checks passed');
