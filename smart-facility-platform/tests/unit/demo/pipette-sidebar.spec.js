import fs from 'fs';
import path from 'path';

const source = fs.readFileSync(path.resolve(__dirname, '../../../src/views/layout/components/Slidebar.vue'), 'utf8');
const body = source.match(/activeMenu\(\)\s*\{([\s\S]*?)\r?\n\s*\},\r?\n\s*isCollapse/)[1];
const activeMenu = new Function(body);

test('both gun tabs select the actual demo sidebar entry', () => {
  const subMenu = [{path: '/lhd/pipetteGun/pipetteGun', subMenu: []}];
  ['/lhd/pipetteGun/pipetteGun', '/lhd/pipetteGun/pipetteGunRack'].forEach(route => {
    expect(activeMenu.call({$route: {path: route}, subMenu})).toBe(subMenu[0].path);
  });
});

test('original parent menu and unrelated routes retain selection', () => {
  expect(activeMenu.call({$route: {path: '/lhd/pipetteGun/pipetteGunRack'}, subMenu: [{path: '/lhd/pipetteGun'}]})).toBe('/lhd/pipetteGun');
  expect(activeMenu.call({$route: {path: '/lhd/hardware/home'}, subMenu: []})).toBe('/lhd/hardware/home');
});
