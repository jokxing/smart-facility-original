import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import {removeInstrument} from '../../../src/mock/fixtures/instrument';
import {
  addDemoMaintenance,
  clearMaintenanceCreated,
  listMaintenances
} from '../../../src/mock/fixtures/maintenance';

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
  clearMaintenanceCreated();
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

test('add requires auth', async () => {
  expect((await client.post('/maintenance/add', {instrumentId: 970001, remark: 'x'})).data.code).toBe(2);
});

test('add persists and appears in list and instrument filter', async () => {
  await establishSession();
  const before = (await client.post('/maintenance/list', {pageNum: 1, pageSize: 20})).data;
  expect(before.items.total).toBe(14);

  const added = (await client.post('/maintenance/add', {
    instrumentId: 970001,
    instrumentName: '演示培养箱',
    instrumentNo: 'DEMO-EQ-970001',
    departmentId: 900101,
    departmentName: '演示运维部',
    companyId: 900001,
    userId: 900001,
    remark: '5B申请备注'
  })).data;
  expect(added.code).toBe(1);
  expect(added.items.id).toBeGreaterThanOrEqual(960101);
  expect(added.items.instrumentId).toBe(970001);

  const all = (await client.post('/maintenance/list', {pageNum: 1, pageSize: 20})).data;
  expect(all.items.total).toBe(15);
  expect(all.items.list[0].id).toBe(added.items.id);
  expect(all.items.list[0].remark).toBe('5B申请备注');
  expect(all.items.list[0].completeFlag).toBe(0);
  expect(all.items.list[0].instrumentName).toBe('演示培养箱');
  expect(all.items.list[0].instrumentNo).toBe('DEMO-EQ-970001');

  const byDevice = (await client.post('/maintenance/list', {
    instrumentId: 970001, pageNum: 1, pageSize: 20
  })).data;
  expect(byDevice.items.total).toBe(3);
  expect(byDevice.items.list.some(row => row.id === added.items.id)).toBe(true);

  const byKeyword = (await client.post('/maintenance/list', {
    keyword: '5B申请备注', pageNum: 1, pageSize: 10
  })).data;
  expect(byKeyword.items.total).toBe(1);
  expect(byKeyword.items.list[0].id).toBe(added.items.id);
});

test('validation failures do not write', async () => {
  await establishSession();
  expect((await client.post('/maintenance/add', {remark: '无设备'})).data.code).toBe(0);
  expect((await client.post('/maintenance/add', {instrumentId: 999999})).data.message).toContain('不存在');
  expect((await client.post('/maintenance/add', {
    instrumentId: 970001,
    remark: 'x'.repeat(51)
  })).data.message).toContain('50');
  expect((await client.post('/maintenance/add', {
    instrumentId: 970001,
    departmentId: 123
  })).data.message).toContain('部门');
  expect(listMaintenances({pageNum: 1, pageSize: 20}).total).toBe(14);
});

test('deleted instrument cannot add; history still lists', async () => {
  await establishSession();
  expect(removeInstrument(970012).ok).toBe(true);
  expect((await client.post('/maintenance/add', {instrumentId: 970012, remark: '再申请'})).data.message)
    .toContain('已删除');
  const history = (await client.post('/maintenance/list', {
    keyword: 'DEMO-EQ-970012', pageNum: 1, pageSize: 10
  })).data;
  expect(history.items.total).toBe(1);
  expect(history.items.list[0].instrumentDeleted).toBe(true);
});

test('fixture addDemoMaintenance succeeds', async () => {
  await establishSession();
  const result = addDemoMaintenance({instrumentId: 970005, remark: 'fixture'});
  expect(result.ok).toBe(true);
  expect(listMaintenances({keyword: 'fixture'}).total).toBe(1);
});
