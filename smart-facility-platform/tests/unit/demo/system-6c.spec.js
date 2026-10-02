import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {
  DEMO_CREDENTIALS, DEMO_USER, listAllStaff, findStaffById,
  clearStaffCreated, clearStaffMeta
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

test('leave and role update require auth', async () => {
  expect((await client.post('/user/delete/batch', {ids: [900002]})).data.code).toBe(2);
  expect((await client.post('/user/update/role', {id: 900002, roleId: 1})).data.code).toBe(2);
});

test('cannot resign or re-role the demo login identity', async () => {
  await establishSession();
  const leaveSelf = (await client.post('/user/delete/batch', {ids: [DEMO_USER.id]})).data;
  expect(leaveSelf.code).toBe(0);
  expect(leaveSelf.message).toContain('演示登录');

  const roleSelf = (await client.post('/user/update/role', {id: DEMO_USER.id, roleId: 2})).data;
  expect(roleSelf.code).toBe(0);
  expect((await listUsers({pageNum: 1, pageSize: 20})).items.total).toBe(3);
});

test('resign removes from active list but findStaffById still resolves', async () => {
  await establishSession();
  const left = (await client.post('/user/delete/batch', {ids: [900002]})).data;
  expect(left.code).toBe(1);
  expect((await listUsers({pageNum: 1, pageSize: 20})).items.total).toBe(2);
  expect(listAllStaff().some(item => item.id === 900002)).toBe(false);
  expect(findStaffById(900002).name).toBe('演示运维员');
  expect(findStaffById(900002).left).toBe(true);

  const again = (await client.post('/user/delete/batch', {ids: [900002]})).data;
  expect(again.code).toBe(0);
});

test('update role persists primary roleName', async () => {
  await establishSession();
  const res = (await client.post('/user/update/role', {id: 900003, roleId: [1]})).data;
  expect(res.code).toBe(1);
  const row = (await listUsers({keyword: 'rd', pageNum: 1, pageSize: 10})).items.list[0];
  expect(row.roleId).toBe(1);
  expect(row.roleName).toBe('演示管理员');

  const bad = (await client.post('/user/update/role', {id: 900003, roleId: [99]})).data;
  expect(bad.code).toBe(0);
});

test('left staff cannot change role; created staff can leave', async () => {
  await establishSession();
  const created = (await client.post('/user/add', {
    departmentId: 900101, loginId: 'temp6c', pwd: 'Demo1234',
    name: '临时离职', tel: '13900006666', roleId: 2
  })).data;
  expect(created.code).toBe(1);
  expect((await client.post('/user/delete/batch', {ids: [created.items.id]})).data.code).toBe(1);
  expect((await client.post('/user/update/role', {id: created.items.id, roleId: 1})).data.code).toBe(0);
  expect((await listUsers({pageNum: 1, pageSize: 20})).items.total).toBe(3);
});
