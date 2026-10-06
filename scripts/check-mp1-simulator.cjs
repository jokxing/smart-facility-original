// Executes the existing compiled miniapp inside WeChat DevTools. No dependency installation.
const {connect, delay} = require('./mp1-simulator-driver.cjs');
if (process.argv.includes('--native')) {
  require('./mp1-native-ui.cjs')().catch(error => {console.error(error.message);process.exitCode=1;});
  return;
}
const fs = require('fs');
const path = require('path');
const {spawnSync} = require('child_process');
const project = path.resolve(__dirname, '../miniprogram/unpackage/dist/dev/mp-weixin');
const evidence = path.resolve(__dirname, '../docs/evidence/miniapp-mp1');
const cli = 'F:\\应用\\微信开发者工具\\微信web开发者工具\\cli.bat';
const results = [];
let driver;
function record(name, passed, details) {
  const result = {name, passed, details};
  results.push(result);
  console.log(JSON.stringify(result));
}
async function state() {
  const snapshot = await driver.evaluate(function () {
    var page = getCurrentPages().slice(-1)[0];
    var vm = page && page.$vm;
    return {route: page && page.route, loading: vm && vm.loading, submitting: vm && vm.submitting,
      loadingNum: vm && vm.loadingNum, statistics: vm && vm.statistics, items: vm && vm.items,
      tokenPresent: undefined};
  });
  snapshot.tokenPresent = !!await driver.wx('getStorageSync', 'sf-mini-demo:token');
  return snapshot;
}
async function waitRoute(route) {
  for (let attempt=0;attempt<40;attempt++) {
    const current=await state();
    if(current.route===route)return current;
    await delay(500);
  }
  return state();
}
async function action(method, ...args) {
  return driver.evaluate(function (name, params) {
    var page = getCurrentPages().slice(-1)[0];
    if (!page || !page.$vm || typeof page.$vm[name] !== 'function') return {error:'Missing method: ' + name};
    try {page.$vm[name].apply(page.$vm, params);return {called:name};}
    catch (error) {return {error:error.message};}
  }, method, args);
}
async function restart() {
  driver.close();
  for (const command of ['close', 'auto']) {
    const args = [command, '--project', project];
    if (command === 'auto') args.push('--auto-port', '9420');
    const output = spawnSync(cli, args, {shell:true, windowsHide:true, encoding:'utf8', timeout:45000});
    if (output.status !== 0) throw new Error('IDE ' + command + ' failed; exit ' + output.status);
    if (command === 'close') await delay(2000);
  }
  for (let attempt = 0; attempt < 20; attempt++) {
    try {driver = await connect();break;}
    catch (error) {if(attempt === 19)throw error;await delay(500);}
  }
  await delay(2500);
}
async function capture(name) {
  try {await driver.screenshot(name);console.log('Screenshot saved: ' + name);}
  catch (error) {record('screenshot ' + name, false, error.message);}
}
async function main() {
  fs.mkdirSync(evidence, {recursive:true});
  driver = await connect();
  const tool = await driver.call('Tool.getInfo');
  record('simulator connected', true, tool);
  await driver.call('App.enableLog');
  await driver.wx('setStorageSync', 'sf-mp1-acceptance-unrelated', 'keep');
  for (const key of ['token','userInfo','username','avatarUrl','labStatus','roomStatus','tabBarIndex']) await driver.wx('removeStorageSync', 'sf-mini-demo:' + key);
  await driver.evaluate(function () {getApp().$vm.applySessionRoute();});
  await delay(1800);
  let current = await state();
  record('startup guard without session (same simulator process)', current.route === 'myPage/Login/Login' && !current.tokenPresent, current);
  await capture('02-login-session-guard');
  await driver.evaluate(function () {var vm=getCurrentPages().slice(-1)[0].$vm;vm.username='demo';vm.password='wrong';});
  await action('handleLogin');
  await delay(600);
  current = await state();
  record('wrong password stays logged out', current.route === 'myPage/Login/Login' && !current.tokenPresent && !current.submitting, current);
  await driver.evaluate(function () {var vm=getCurrentPages().slice(-1)[0].$vm;vm.password='Demo1234';vm.handleLogin();vm.handleLogin();});
  current = await waitRoute('pages/tabBar/Home/Home');
  await delay(1000);
  current = await state();
  const stats = current.statistics;
  record('login and duplicate submission', current.route === 'pages/tabBar/Home/Home' && current.tokenPresent, current);
  record('home statistics', !!stats && stats.instrumentStatistics.normalCount === 11 && stats.instrumentStatistics.alarmCount === 1 && stats.instrumentStatistics.runCount === 12 && stats.roomStatistics.normalCount === 2 && stats.roomStatistics.alarmCount === 1, stats);
  await capture('03-home-after-login');
  await driver.wx('startPullDownRefresh');
  await delay(1300);
  current = await state();
  record('home pull down refresh', current.loading === false && current.statistics.instrumentStatistics.alarmCount === 1, current);
  await driver.evaluate(function () {getApp().$vm.applySessionRoute();});
  await delay(500);
  current = await state();
  record('valid session guard does not redirect', current.route === 'pages/tabBar/Home/Home' && current.tokenPresent, current);
  await driver.call('App.enableLog');
  await action('handleGoNewsInform');
  current = await waitRoute('homePage/NewsInform/NewsInform');
  record('message navigation', current.route === 'homePage/NewsInform/NewsInform', current);
  await driver.wx('navigateBack');
  await waitRoute('pages/tabBar/Home/Home');
  await delay(1000);
  await action('handleGoBackLog');
  current = await waitRoute('homePage/Backlog/Backlog');
  record('todo navigation', current.route === 'homePage/Backlog/Backlog', current);
  await driver.wx('navigateBack');
  await waitRoute('pages/tabBar/Home/Home');
  await delay(1000);
  await action('handleGoRoom', 2);
  await waitRoute('pages/tabBar/Room/Room');
  await delay(1800);
  current = await state();
  record('home to room loading finishes', current.route === 'pages/tabBar/Room/Room' && current.loadingNum === 0, current);
  await capture('04-room-navigation');
  await driver.wx('hideLoading');
  await driver.wx('switchTab', {url:'/pages/tabBar/Home/Home'});
  await waitRoute('pages/tabBar/Home/Home');
  await delay(1000);
  await action('handleGoLabdevice', 2);
  await waitRoute('pages/tabBar/Labdevice/index');
  await delay(1400);
  driver.events.length = 0;
  const device = await driver.evaluate(async function () {
    var vm=getCurrentPages().slice(-1)[0].$vm;
    var component=vm.$refs.labdevice;
    if(!component)return {error:'Device component not mounted'};
    var result={handleLoadingType:typeof component.handleLoading, list:component.list};
    try {await component.init();result.initReturned=true;}catch(e){result.error=e.message;}
    return result;
  });
  await driver.wx('startPullDownRefresh');
  await delay(1500);
  const runtimeErrors = driver.events.filter(event => event.method === 'App.exceptionThrown' || (event.method === 'App.logAdded' && event.params.type === 'error')).map(event => event.params);
  record('device initialization and native refresh', !device.error && runtimeErrors.length === 0, {device, runtimeErrors});
  await driver.wx('stopPullDownRefresh');
  await driver.wx('hideLoading');
  await driver.wx('switchTab', {url:'/pages/tabBar/Transport/Transport'});
  await waitRoute('pages/tabBar/Transport/Transport');
  await delay(1000);
  current=await state();
  record('transport tab navigation', current.route === 'pages/tabBar/Transport/Transport', current);
  await driver.wx('switchTab', {url:'/pages/tabBar/My/My'});
  await waitRoute('pages/tabBar/My/My');
  await delay(1000);
  await action('handleGoUserInfo');
  await waitRoute('myPage/UserInfo/UserInfo');
  await action('handleLogout');
  current=await waitRoute('myPage/Login/Login');
  const unrelated = await driver.wx('getStorageSync', 'sf-mp1-acceptance-unrelated');
  record('logout and unrelated storage preservation', current.route === 'myPage/Login/Login' && !current.tokenPresent && unrelated === 'keep', current);
  await delay(2000);
  await restart();
  await delay(4000);
  current=await state();
  record('reopen after logout', current.route === 'myPage/Login/Login' && !current.tokenPresent, current);
  await driver.wx('removeStorageSync', 'sf-mp1-acceptance-unrelated');
  await capture('05-logout-reopen');
}
main().catch(error => {record('suite interrupted', false, error.message);process.exitCode=1;}).finally(() => {
  fs.mkdirSync(evidence, {recursive:true});
  fs.writeFileSync(path.join(evidence, 'results.json'), JSON.stringify({testedAt:new Date().toISOString(), method:'WeChat DevTools automation; real compiled Vue page methods and native navigation; screenshots; IDE close/reopen', results}, null, 2).replace(/https?:[^\s"\\]+/g, '[URL omitted]'));
  if(driver)driver.close();
});
