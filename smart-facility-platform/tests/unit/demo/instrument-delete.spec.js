import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import {
  clearInstrumentDeleted,
  clearInstrumentMeta,
  getInstrumentDashboardNew,
  listInstruments,
  listRoonInstrumentInfo,
  removeInstrument
} from '../../../src/mock/fixtures/instrument';
import {listBindableCatalog} from '../../../src/mock/fixtures/equipment';
import {resetDemoScenario} from '../../../src/mock/fixtures/scenario';

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
  clearInstrumentDeleted();
  clearInstrumentMeta();
  resetDemoScenario();
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

test('remove requires auth', async () => {
  expect((await client.post('/instrument/remove/970012')).data.code).toBe(2);
});

test('remove tombstones instrument across list dashboard detail layout bindable', async () => {
  await establishSession();
  expect(listRoonInstrumentInfo(950001).list.some(item => item.id === 970012)).toBe(true);

  const res = (await client.post('/instrument/remove/970012')).data;
  expect(res.code).toBe(1);
  expect(res.items.id).toBe(970012);

  const list = (await client.post('/instrument/list', {pageNum: 1, pageSize: 20})).data;
  expect(list.items.total).toBe(11);
  expect(list.items.list.every(row => row.id !== 970012)).toBe(true);

  const dash = (await client.get('/instrument/dashboard/new')).data.items;
  expect(dash.totalCount).toBe(11);
  expect(getInstrumentDashboardNew().totalCount).toBe(11);

  expect((await client.get('/instrument/detail', {params: {id: 970012}})).data.code).toBe(0);
  expect(listRoonInstrumentInfo(950001).list.some(item => item.id === 970012)).toBe(false);
  expect(listRoonInstrumentInfo(950001).list).toHaveLength(5);
  expect(listBindableCatalog('instrument').some(item => item.id === 970012)).toBe(false);

  // Other instruments stay.
  expect(listInstruments({pageNum: 1, pageSize: 20}).list.some(row => row.id === 970001)).toBe(true);
  expect((await client.get('/instrument/detail', {params: {id: 970001}})).data.code).toBe(1);
});

test('remove rejects unknown already-deleted; batch delete still blocked', async () => {
  await establishSession();
  expect(removeInstrument(999999).ok).toBe(false);
  expect(removeInstrument(970011).ok).toBe(true);
  expect((await client.post('/instrument/remove/970011')).data.message).toContain('已删除');
  expect((await client.post('/instrument/batch/delete', {ids: [970001]})).data.code).toBe(0);
  expect((await client.post('/instrument/update/basic', {
    id: 970011, name: '不应成功', departmentId: 900101, types: 1
  })).data.code).toBe(0);
});
