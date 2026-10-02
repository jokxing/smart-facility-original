import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import {
  clearMaintenanceCreated,
  clearMaintenanceMeta,
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
  clearMaintenanceMeta();
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

test('update and complete require auth', async () => {
  expect((await client.post('/maintenance/updateMaintenance', {
    maintenanceId: 960002, nextMaintenanceDate: '2026-10-01 09:00:00'
  })).data.code).toBe(2);
  expect((await client.get('/maintenance/complete', {params: {maintenanceId: 960002}})).data.code).toBe(2);
});

test('update nextMaintenanceDate persists to list', async () => {
  await establishSession();
  const next = '2026-10-01 09:00:00';
  const res = (await client.post('/maintenance/updateMaintenance', {
    maintenanceId: 960002,
    nextMaintenanceDate: next
  })).data;
  expect(res.code).toBe(1);
  expect(res.items.nextMaintenanceDate).toBe(next);
  const row = listMaintenances({pageNum: 1, pageSize: 50}).list.find(item => item.id === 960002);
  expect(row.nextMaintenanceDate).toBe(next);
  expect(row.completeFlag).toBe(0);
});

test('update rejects missing / invalid / earlier-than-createDate', async () => {
  await establishSession();
  expect((await client.post('/maintenance/updateMaintenance', {
    maintenanceId: 999999, nextMaintenanceDate: '2026-10-01 09:00:00'
  })).data.message).toContain('不存在');
  expect((await client.post('/maintenance/updateMaintenance', {
    maintenanceId: 960002, nextMaintenanceDate: ''
  })).data.message).toContain('请选择');
  expect((await client.post('/maintenance/updateMaintenance', {
    maintenanceId: 960002, nextMaintenanceDate: 'not-a-date'
  })).data.message).toContain('无效');
  const row = listMaintenances({pageNum: 1, pageSize: 50}).list.find(item => item.id === 960002);
  expect((await client.post('/maintenance/updateMaintenance', {
    maintenanceId: 960002,
    nextMaintenanceDate: '2020-01-01 00:00:00'
  })).data.message).toContain('不能小于');
  expect(listMaintenances({pageNum: 1, pageSize: 50}).list.find(item => item.id === 960002).nextMaintenanceDate)
    .toBe(row.nextMaintenanceDate);
});

test('complete marks flag and rejects double complete', async () => {
  await establishSession();
  const first = (await client.get('/maintenance/complete', {params: {maintenanceId: 960002}})).data;
  expect(first.code).toBe(1);
  expect(first.items.completeFlag).toBe(1);
  const row = listMaintenances({pageNum: 1, pageSize: 50}).list.find(item => item.id === 960002);
  expect(row.completeFlag).toBe(1);
  expect(row.completeDate).toBe(first.items.completeDate);

  const again = (await client.get('/maintenance/complete', {params: {maintenanceId: 960002}})).data;
  expect(again.code).toBe(0);
  expect(again.message).toContain('已完成');

  const already = (await client.get('/maintenance/complete', {params: {maintenanceId: 960001}})).data;
  expect(already.code).toBe(0);
  expect(already.message).toContain('已完成');
});

test('update and complete work on newly added records', async () => {
  await establishSession();
  const added = (await client.post('/maintenance/add', {
    instrumentId: 970001, remark: '5C闭环'
  })).data;
  expect(added.code).toBe(1);
  const id = added.items.id;
  const next = '2026-11-01 10:00:00';
  expect((await client.post('/maintenance/updateMaintenance', {
    maintenanceId: id, nextMaintenanceDate: next
  })).data.code).toBe(1);
  expect((await client.get('/maintenance/complete', {params: {maintenanceId: id}})).data.code).toBe(1);
  const row = listMaintenances({keyword: '5C闭环'}).list[0];
  expect(row.nextMaintenanceDate).toBe(next);
  expect(row.completeFlag).toBe(1);
});
