import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS, DEMO_MENUS, DEMO_STAFF, DEMO_DEPARTMENTS, DEMO_USER} from '../../../src/mock/fixtures/auth';

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

test('user list requires auth', async () => {
  expect((await client.get('/user/list', {params: {pageNum: 1, pageSize: 10}})).data.code).toBe(2);
});

test('list returns shared DEMO_STAFF with department fields', async () => {
  await establishSession();
  const res = await listUsers({pageNum: 1, pageSize: 10});
  expect(res.code).toBe(1);
  expect(res.items.total).toBe(3);
  expect(res.items.list).toHaveLength(3);
  expect(res.items.list.map(row => row.id).sort()).toEqual(DEMO_STAFF.map(item => item.id).sort());
  expect(res.items.list.every(row =>
    row.loginId && row.name && row.departmentName && row.companyName === DEMO_USER.companyName
  )).toBe(true);
  expect(res.items.list.every(row => DEMO_DEPARTMENTS.some(d => d.id === row.departmentId))).toBe(true);
});

test('department / keyword / company-root filters and empty result', async () => {
  await establishSession();
  const ops = await listUsers({departmentId: 900101, pageNum: 1, pageSize: 10});
  expect(ops.items.total).toBe(2);
  expect(ops.items.list.every(row => Number(row.departmentId) === 900101)).toBe(true);

  const rd = await listUsers({departmentId: 900102, pageNum: 1, pageSize: 10});
  expect(rd.items.total).toBe(1);
  expect(rd.items.list[0].loginId).toBe('rd');

  const companyRoot = await listUsers({departmentId: 0, pageNum: 1, pageSize: 10});
  expect(companyRoot.items.total).toBe(3);

  const byLogin = await listUsers({keyword: 'ops', pageNum: 1, pageSize: 10});
  expect(byLogin.items.total).toBe(1);
  expect(byLogin.items.list[0].name).toBe('演示运维员');

  const byName = await listUsers({keyword: '研发', pageNum: 1, pageSize: 10});
  expect(byName.items.total).toBe(1);

  const empty = await listUsers({keyword: '不存在的员工XYZ', pageNum: 1, pageSize: 10});
  expect(empty.items.total).toBe(0);
  expect(empty.items.list).toEqual([]);
});

test('pagination keeps filters; page 2 of department is empty', async () => {
  await establishSession();
  const page1 = await listUsers({departmentId: 900101, pageNum: 1, pageSize: 1});
  expect(page1.items.total).toBe(2);
  expect(page1.items.list).toHaveLength(1);
  const page2 = await listUsers({departmentId: 900101, pageNum: 2, pageSize: 1});
  expect(page2.items.total).toBe(2);
  expect(page2.items.list).toHaveLength(1);
  expect(page2.items.list[0].id).not.toBe(page1.items.list[0].id);
  const page3 = await listUsers({departmentId: 900101, pageNum: 3, pageSize: 1});
  expect(page3.items.list).toEqual([]);
});

test('demo menus expose department path; personal profile path stays closed in menu', async () => {
  await establishSession();
  const menus = (await client.get('/role/menu')).data.items;
  const sys = menus.find(menu => menu.id === 'sys');
  expect(sys).toBeTruthy();
  const paths = sys.subMenu.map(item => item.path);
  expect(paths).toContain('/sys/department');
  expect(paths).toContain('/sys/a/log');
  expect(paths).not.toContain('/sys/user');
  expect(DEMO_MENUS.find(menu => menu.id === 'sys').subMenu.some(item => item.path === '/sys/department')).toBe(true);
});

test('homepage system card remaps to department in demo Dashboard source', () => {
  const fs = require('fs');
  const path = require('path');
  const src = fs.readFileSync(path.resolve(__dirname, '../../../src/views/dashboard/Dashboard.vue'), 'utf8');
  expect(src).toContain("VUE_APP_DEMO === 'true'");
  expect(src).toContain("path: '/sys/department'");
  expect(src).toMatch(/item\.id === ['"]sys['"]/);
});
