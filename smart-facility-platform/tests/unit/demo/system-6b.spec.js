import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS, DEMO_STAFF, listAllStaff, findStaffById, clearStaffCreated, clearStaffMeta} from '../../../src/mock/fixtures/auth';

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

async function listUsers(params = {}) {
  return (await client.get('/user/list', {params})).data;
}

test('add and update require auth', async () => {
  expect((await client.post('/user/add', {loginId: 'x'})).data.code).toBe(2);
  expect((await client.post('/user/update/basic', {id: 900001})).data.code).toBe(2);
  expect((await client.get('/role/list')).data.code).toBe(2);
});

test('role list stub includes 普通成员 for Modal default', async () => {
  await establishSession();
  const roles = (await client.get('/role/list')).data;
  expect(roles.code).toBe(1);
  expect(roles.items.some(item => item.name === '普通成员' && item.id === 2)).toBe(true);
});

test('add staff persists and appears in shared list', async () => {
  await establishSession();
  const created = (await client.post('/user/add', {
    departmentId: 900102,
    loginId: 'newbie',
    pwd: 'Demo1234',
    name: '新演示员',
    tel: '13900000001',
    email: 'newbie@example.com',
    roleId: 2
  })).data;
  expect(created.code).toBe(1);
  expect(created.items.id).toBe(901101);

  const listed = await listUsers({pageNum: 1, pageSize: 20});
  expect(listed.items.total).toBe(DEMO_STAFF.length + 1);
  const row = listed.items.list.find(item => item.id === 901101);
  expect(row).toMatchObject({
    loginId: 'newbie',
    name: '新演示员',
    departmentId: 900102,
    departmentName: '演示研发部',
    roleName: '普通成员'
  });
  expect(findStaffById(901101).name).toBe('新演示员');
  expect(listAllStaff().some(item => item.id === 901101)).toBe(true);
});

test('add validation failures do not write', async () => {
  await establishSession();
  const dup = (await client.post('/user/add', {
    departmentId: 900101, loginId: 'demo', pwd: 'Demo1234', name: '重复', tel: '13900000002', roleId: 2
  })).data;
  expect(dup.code).toBe(0);
  expect(dup.message).toContain('登录名');

  const badLogin = (await client.post('/user/add', {
    departmentId: 900101, loginId: 'ab', pwd: 'Demo1234', name: '短登录', tel: '13900000003', roleId: 2
  })).data;
  expect(badLogin.code).toBe(0);

  const badDept = (await client.post('/user/add', {
    departmentId: 1, loginId: 'okuser', pwd: 'Demo1234', name: '无效部门', tel: '13900000004', roleId: 2
  })).data;
  expect(badDept.code).toBe(0);

  expect((await listUsers({pageNum: 1, pageSize: 20})).items.total).toBe(3);
});

test('update basic overlays seed and keeps loginId', async () => {
  await establishSession();
  const updated = (await client.post('/user/update/basic', {
    id: 900002,
    loginId: 'should-ignore',
    pwd: 'Demo1234',
    name: '运维改名',
    tel: '13800000002',
    email: 'ops2@example.com',
    departmentId: 900101,
    roleId: 2
  })).data;
  expect(updated.code).toBe(1);
  const row = (await listUsers({keyword: '运维改名', pageNum: 1, pageSize: 10})).items.list[0];
  expect(row.loginId).toBe('ops');
  expect(row.name).toBe('运维改名');
  expect(row.email).toBe('ops2@example.com');
});

test('created staff can be selected as equipment principal pool member', async () => {
  await establishSession();
  await client.post('/user/add', {
    departmentId: 900101, loginId: 'ownerx', pwd: 'Demo1234', name: '负责候选', tel: '13900000009', roleId: 2
  });
  expect(listAllStaff().some(item => item.loginId === 'ownerx')).toBe(true);
  expect(findStaffById(901101)).toBeTruthy();
});
