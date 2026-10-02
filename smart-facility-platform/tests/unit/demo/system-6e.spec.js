import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {
  DEMO_CREDENTIALS, DEMO_USER, findDepartmentById, listAllStaff,
  clearDepartmentCreated, clearDepartmentMeta, clearStaffCreated, clearStaffMeta
} from '../../../src/mock/fixtures/auth';
import {
  updateInstrumentBasic, clearInstrumentMeta, clearInstrumentCreated, clearInstrumentDeleted
} from '../../../src/mock/fixtures/instrument';
import {
  updateEquipmentBasic, getEquipmentDetail, listEquipmentSort, equipmentById
} from '../../../src/mock/fixtures/equipment';
import {listMaintenances} from '../../../src/mock/fixtures/maintenance';
import zh from '../../../src/i18n/config/zh';
import en from '../../../src/i18n/config/en';

jest.mock('../../../src/mock/captcha', () => ({createCaptchaImage: () => 'test-png-base64'}));

let client;
let sessionId;
const previousDemo = process.env.VUE_APP_DEMO;

beforeAll(() => {
  process.env.VUE_APP_DEMO = 'true';
});
afterAll(() => {
  process.env.VUE_APP_DEMO = previousDemo;
});

beforeEach(() => {
  storage.clear();
  clearDepartmentCreated();
  clearDepartmentMeta();
  clearStaffCreated();
  clearStaffMeta();
  clearInstrumentMeta();
  clearInstrumentCreated();
  clearInstrumentDeleted();
  client = axios.create({baseURL: DEMO_BASE_URL, adapter: mockAdapter});
});

async function establishSession() {
  const captcha = await client.get('/captchaCode', {params: {sessionId}});
  sessionId = captcha.data.items.sessionId;
  client.defaults.headers.common.Authorization = sessionId;
  storage.setItem('sessionId', sessionId);
  const login = await client.post('/login', qs.stringify({...DEMO_CREDENTIALS, sessionId}));
  storage.setItem('token', login.data.items.token);
  const info = await client.get('/user/info');
  storage.setItem('USERINFO', JSON.stringify(info.data.items));
}

test('basic edit preserves multiple roles unless primary role changes', async () => {
  await establishSession();
  expect((await client.post('/user/update/role', {id: 900002, roleId: [1, 2]})).data.code).toBe(1);
  const basic = {id: 900002, name: '演示运维员', tel: '13800000002', pwd: 'Demo1234', departmentId: 900101};
  expect((await client.post('/user/update/basic', basic)).data.code).toBe(1);
  expect(listAllStaff().find(row => row.id === 900002)).toMatchObject({roleId: 1, roleIds: [1, 2]});
  expect((await client.post('/user/update/basic', {...basic, roleId: 2})).data.code).toBe(1);
  expect(listAllStaff().find(row => row.id === 900002)).toMatchObject({roleId: 2, roleIds: [2]});
});

test('invalid role entries reject the entire update without partial role write', async () => {
  await establishSession();
  for (const roleId of [[1, 'bad'], [1, true], [1, []]]) {
    expect((await client.post('/user/update/role', {id: 900002, roleId})).data.code).toBe(0);
    expect(listAllStaff().find(row => row.id === 900002).roleId).toBe(2);
  }
});

test('delete department blocked while instrument or equipment references it; ok after move-out', async () => {
  await establishSession();
  const deptId = (await client.post('/department/add', {name: '临时引用部'})).data.items.id;
  expect(deptId).toBe(900103);

  expect(updateInstrumentBasic({
    id: 970001, name: '演示培养箱', departmentId: deptId, types: 1
  }).ok).toBe(true);
  let blocked = (await client.post(`/department/remove/${deptId}`, {})).data;
  expect(blocked.code).toBe(0);
  expect(blocked.message).toMatch(/设备或硬件/);
  expect(findDepartmentById(deptId)).toBeTruthy();

  expect(updateInstrumentBasic({
    id: 970001, name: '演示培养箱', departmentId: 900101, types: 1
  }).ok).toBe(true);

  expect(updateEquipmentBasic({
    id: 980001, name: '演示温湿度记录仪 A', departmentId: deptId
  }).ok).toBe(true);
  blocked = (await client.post(`/department/remove/${deptId}`, {})).data;
  expect(blocked.code).toBe(0);
  expect(blocked.message).toMatch(/设备或硬件/);

  expect(updateEquipmentBasic({
    id: 980001, name: '演示温湿度记录仪 A', departmentId: 900101
  }).ok).toBe(true);
  const removed = (await client.post(`/department/remove/${deptId}`, {})).data;
  expect(removed.code).toBe(1);
  expect(findDepartmentById(deptId)).toBeNull();

  // Historical maintenance snapshot still lists original departmentId.
  const page = listMaintenances({pageNum: 1, pageSize: 50});
  expect(page.list.some(row => Number(row.departmentId) === 900101)).toBe(true);
});

test('hardware list and detail resolve live department name after rename', async () => {
  await establishSession();
  const before = getEquipmentDetail(980001);
  expect(before.departmentName).toBe('演示运维部');

  expect((await client.post('/department/update', {id: 900101, name: '演示运维中心'})).data.code).toBe(1);

  const detail = getEquipmentDetail(980001);
  expect(detail.departmentId).toBe(900101);
  expect(detail.departmentName).toBe('演示运维中心');

  const listed = listEquipmentSort({pageNum: 1, pageSize: 50, keyword: 'EQ-TH-001'});
  expect(listed.list[0].departmentName).toBe('演示运维中心');

  // Overlay with stale departmentName must not win over shared pool.
  expect(updateEquipmentBasic({
    id: 980003, name: '演示温度记录仪 A', departmentId: 900102
  }).ok).toBe(true);
  expect((await client.post('/department/update', {id: 900102, name: '演示研发中心'})).data.code).toBe(1);
  expect(equipmentById(980003).departmentName).toBe('演示研发中心');
});

test('basic edit protects demo login role and keeps role when omitted', async () => {
  await establishSession();
  const rejected = (await client.post('/user/update/basic', {
    id: DEMO_USER.id,
    pwd: 'Demo1234',
    name: '演示用户',
    tel: '13800000001',
    email: 'demo@example.com',
    departmentId: DEMO_USER.departmentId,
    roleId: 2
  })).data;
  expect(rejected.code).toBe(0);
  expect(rejected.message).toMatch(/角色/);

  const info = (await client.get('/user/info')).data.items;
  expect(info).toMatchObject({id: DEMO_USER.id, roleId: 1, loginId: 'demo'});
  const pool = listAllStaff().find(item => item.id === DEMO_USER.id);
  expect(pool.roleId).toBe(1);

  const keep = (await client.post('/user/update/basic', {
    id: 900002,
    pwd: 'Demo1234',
    name: '运维改名',
    tel: '13800000002',
    email: 'ops@example.com',
    departmentId: 900101
    // no roleId
  })).data;
  expect(keep.code).toBe(1);
  const row = listAllStaff().find(item => item.id === 900002);
  expect(row.roleId).toBe(2);
  expect(row.name).toBe('运维改名');
});

test('leave confirmation copy drops auto-unbind promise', () => {
  expect(zh.system.deleteUser).not.toMatch(/将自动解除|将自动解绑/);
  expect(zh.system.deleteUser).toMatch(/历史维保|负责人/);
  expect(zh.system.deleteUser).toMatch(/不会自动解绑/);
  expect(en.system.deleteUser).not.toMatch(/will be automatically released/i);
  expect(en.system.deleteUser).toMatch(/not auto-unbound/i);
  expect(en.system.deleteUser).toMatch(/maintenance|principal|Historical/i);
});
