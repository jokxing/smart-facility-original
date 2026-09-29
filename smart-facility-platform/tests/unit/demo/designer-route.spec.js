jest.mock('../../../src/views/layout/Layout', () => ({name: 'Layout', render: h => h('router-view')}));

const previousDemo = process.env.VUE_APP_DEMO;
afterAll(() => { process.env.VUE_APP_DEMO = previousDemo; });

test.each(['true', 'false'])('designer route preserves the shell only outside demo (%s)', mode => {
  process.env.VUE_APP_DEMO = mode;
  jest.resetModules();
  const {routes, default: router} = require('../../../src/router');
  const records = [];
  const walk = nodes => nodes.forEach(route => {
    if (route.name === 'FloorDesigner' || route.name === 'RoomDesigner') records.push(route.name);
    walk(route.children || []);
  });
  walk(routes);
  expect(records.filter(name => name === 'FloorDesigner')).toHaveLength(1);
  expect(records.filter(name => name === 'RoomDesigner')).toHaveLength(1);
  const floorMatched = router.match('/floor/designer').matched;
  expect(floorMatched.map(route => route.name)).toEqual(mode === 'true' ? ['FloorDesigner'] : [undefined, 'FloorDesigner']);
  const roomMatched = router.match('/room/designer').matched;
  expect(roomMatched.map(route => route.name)).toEqual(mode === 'true' ? ['RoomDesigner'] : [undefined, 'RoomDesigner']);
});
