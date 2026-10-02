import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {
  DEMO_CREDENTIALS, DEMO_USER, listDemoDepartments, listActiveDepartmentsFlat,
  findDepartmentById, clearDepartmentCreated, clearDepartmentMeta,
  clearStaffCreated, clearStaffMeta, listAllStaff
} from '../../../src/mock/fixtures/auth';

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

test('department writes require auth', async () => {
  expect((await client.post('/department/add', {name: 'x'})).data.code).toBe(2);
  expect((await client.post('/department/update', {id: 900101, name: 'x'})).data.code).toBe(2);
  expect((await client.post('/department/remove/900103', {})).data.code).toBe(2);
  expect((await client.put('/department/move', null, {params: {departmentIdOne: 900101, departmentIdTwo: 900102}})).data.code).toBe(2);
});

test('add child department and list tree nesting', async () => {
  await establishSession();
  const created = (await client.post('/department/add', {name: '演示质控组', parentDepartmentId: 900101})).data;
  expect(created.code).toBe(1);
  expect(created.items.id).toBe(900103);
  const list = (await client.get('/department/list')).data.items.list;
  expect(list).toHaveLength(2);
  const ops = list.find(item => item.id === 900101);
  expect(ops.subDivisions.some(child => child.id === 900103 && child.name === '演示质控组')).toBe(true);
  expect(listActiveDepartmentsFlat().some(item => item.id === 900103)).toBe(true);
});

test('rename updates staff departmentName; seed delete blocked', async () => {
  await establishSession();
  expect((await client.post('/department/update', {id: 900102, name: '演示研发中心'})).data.code).toBe(1);
  const staff = listAllStaff().find(item => item.id === 900003);
  expect(staff.departmentName).toBe('演示研发中心');
  expect(findDepartmentById(900102).name).toBe('演示研发中心');

  const blocked = (await client.post('/department/remove/900101', {})).data;
  expect(blocked.code).toBe(0);
  expect(blocked.message).toContain('不可删除');
});

test('created department delete rules and move siblings', async () => {
  await establishSession();
  const a = (await client.post('/department/add', {name: '临时甲'})).data.items.id;
  const b = (await client.post('/department/add', {name: '临时乙'})).data.items.id;
  expect(a).toBe(900103);
  expect(b).toBe(900104);

  await client.post('/user/add', {
    departmentId: a, loginId: 'depstaff', pwd: 'Demo1234', name: '挂靠员工', tel: '13900001111', roleId: 2
  });
  expect((await client.post(`/department/remove/${a}`, {})).data.code).toBe(0);

  await client.post('/user/delete/batch', {ids: [listAllStaff().find(item => item.loginId === 'depstaff').id]});
  expect((await client.post(`/department/remove/${a}`, {})).data.code).toBe(1);
  expect(findDepartmentById(a)).toBeNull();

  const before = listDemoDepartments().map(item => item.id);
  expect((await client.put('/department/move', null, {
    params: {departmentIdOne: 900101, departmentIdTwo: 900102}
  })).data.code).toBe(1);
  const after = listDemoDepartments().map(item => item.id);
  expect(after[0]).toBe(before[1]);
  expect(after[1]).toBe(before[0]);
});

test('demo login identity unchanged after department ops', async () => {
  await establishSession();
  await client.post('/department/add', {name: '旁路部门'});
  const info = (await client.get('/user/info')).data.items;
  expect(info).toMatchObject({id: DEMO_USER.id, loginId: 'demo', roleId: 1, departmentId: 900101});
});
