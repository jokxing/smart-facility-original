// Synthetic public demo credentials and identity; no original business data.
export const DEMO_CREDENTIALS = {username: 'demo', password: 'Demo1234', captchaCode: '2468'};
export const DEMO_USER = {
  id: 900001, loginId: 'demo', name: '演示用户', companyId: 900001,
  companyName: '智慧设施演示空间', departmentId: 900101, roleId: 1,
  deviceSeeFlag: 1, instrumentSeeFlag: 1, roomSeeFlag: 1
};
/** Staff pool for SetPrincipal /user/list (demo only). */
export const DEMO_STAFF = Object.freeze([
  {id: 900001, name: '演示用户', loginId: 'demo', departmentId: 900101, isBoundWeixin: true},
  {id: 900002, name: '演示运维员', loginId: 'ops', departmentId: 900101, isBoundWeixin: false},
  {id: 900003, name: '演示研发员', loginId: 'rd', departmentId: 900102, isBoundWeixin: true}
]);
export const DEMO_DEPARTMENTS = [
  {id: 900101, name: '演示运维部', departmentName: '演示运维部', parentId: 0, children: [], subDivisions: []},
  {id: 900102, name: '演示研发部', departmentName: '演示研发部', parentId: 0, children: [], subDivisions: []}
];
/** Cascader (SearchForm) expects `types` + `childrenList`; store bootstrap still accepts `children`. */
export const DEMO_CATEGORIES = [
  {id: 900201, name: '演示设备', catName: '演示设备', types: 1, parentId: 0, children: [], childrenList: []}
];
export const DEMO_MENUS = [
  {id: 'ld', name: '设备管理', englishName: 'labDevice', path: '/ld/labdevice', subMenu: [
    {id: 'demo-labdevice', name: '实验室设备', englishName: 'labDevice', path: '/ld/labdevice', icon: 'icon-home1', subMenu: []}
  ]},
  {id: 'lhd', name: '智能硬件', englishName: 'hardware', path: '/lhd/hardware/home', subMenu: [
    {id: 'demo-hardware-home', name: '主页', englishName: 'home', path: '/lhd/hardware/home', icon: 'icon-home1', subMenu: []}
  ]},
  {id: 'rm', name: '房间管理', englishName: 'room', path: '/rm/room', subMenu: [
    {id: 'demo-room', name: '房间', englishName: 'room', path: '/rm/room', icon: 'icon-home1', subMenu: []}
  ]},
  {id: 'sys', name: '系统', englishName: 'system', path: '/sys/a/log', subMenu: [
    {id: 'demo-alarm-log', name: '报警记录', englishName: 'alarmLog', path: '/sys/a/log', icon: 'icon-warning-line', subMenu: []}
  ]}
];
// Dashboard overview is derived from fixtures/equipment.js (handlers/equipment).
