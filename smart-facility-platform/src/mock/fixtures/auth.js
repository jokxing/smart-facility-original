// Synthetic public demo credentials and identity; no original business data.
export const DEMO_CREDENTIALS = {username: 'demo', password: 'Demo1234', captchaCode: '2468'};
export const DEMO_USER = {
  id: 900001, loginId: 'demo', name: '演示用户', companyId: 900001,
  companyName: '智慧设施演示空间', departmentId: 900101, roleId: 1,
  deviceSeeFlag: 1, instrumentSeeFlag: 1, roomSeeFlag: 1
};
export const DEMO_DEPARTMENTS = [
  {id: 900101, name: '演示运维部', departmentName: '演示运维部', parentId: 0, children: []}
];
export const DEMO_CATEGORIES = [
  {id: 900201, name: '演示设备', catName: '演示设备', parentId: 0, children: []}
];
export const DEMO_MENUS = [
  {id: 'lhd', name: '智能硬件', englishName: 'hardware', path: '/lhd/hardware/home', subMenu: [
    {id: 'demo-device', name: '记录仪', englishName: 'device', path: '/lhd/device', icon: 'icon-device1', subMenu: []}
  ]},
  {id: 'rm', name: '房间管理', englishName: 'room', path: '/rm/room', subMenu: [
    {id: 'demo-room', name: '房间', englishName: 'room', path: '/rm/room', icon: 'icon-home1', subMenu: []}
  ]}
];
// Only the landing-page contract; device records belong to the next slice.
export const DEMO_OVERVIEW = {total: 0, alarmCount: 0};
