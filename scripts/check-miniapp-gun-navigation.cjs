const assert = require('assert');
const {openTakenGun} = require('../miniprogram/utils/gunNavigation.js');
const listRoute = 'pages/tabBar/Labdevice/index';
function check(routes) {
  let stack = routes.map(route => ({route}));
  let flag = false;
  let opened = 0;
  const api = {
    navigateBack({delta, success}) { stack.splice(stack.length - delta); if (success) success(); },
    switchTab({url, success}) { assert.strictEqual(url, '/' + listRoute); stack = [{route: listRoute}]; success(); },
    navigateTo({url}) { opened++; assert.ok(!url.includes('isBackHome')); stack.push({route: url.split('?')[0].slice(1)}); }
  };
  openTakenGun(991002, stack, api, {setDemo(key, value) { assert.strictEqual(key, 'openGunList'); flag = value; }});
  assert.strictEqual(opened, 1);
  assert.strictEqual(stack[stack.length - 2].route, listRoute);
  api.navigateBack({delta: 1});
  assert.strictEqual(stack[stack.length - 1].route, listRoute);
  return flag;
}
assert.strictEqual(check(['pages/tabBar/Home/Home', listRoute, 'detailPage/PipetteGunDetail/index',
  'detailPage/PipetteGunRackDetail/PipetteGunRackDetail', 'detailPage/PipetteGunRackDetail/common/TakeGun']), false);
assert.strictEqual(check(['pages/tabBar/Home/Home', 'detailPage/PipetteGunRackDetail/common/TakeGun']), true);
console.log('Take success navigation preserves list as detail back target; alternate entry opens gun list');
