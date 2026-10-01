import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import {
  addDemoInstrument,
  clearInstrumentCreated,
  clearInstrumentDeleted,
  clearInstrumentMeta,
  getInstrumentDashboardNew,
  listInstruments,
  listRoonInstrumentInfo
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
  clearInstrumentCreated();
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

const valid = {
  name: '手填新增设备',
  departmentId: 900102,
  types: 1,
  roomId: 950003
};

test('add requires authentication', async () => {
  expect((await client.post('/instrument/add', valid)).data.code).toBe(2);
});

test('add creates instrument in list dashboard detail bindable without layout', async () => {
  await establishSession();
  const beforeLayout = listRoonInstrumentInfo(950003).list.length;
  const res = (await client.post('/instrument/add', valid)).data;
  expect(res.code).toBe(1);
  expect(res.items).toMatchObject({
    id: 970101,
    name: '手填新增设备',
    count: 1,
    ids: [970101],
    departmentId: 900102,
    roomId: 950003,
    types: 1
  });

  expect(getInstrumentDashboardNew().totalCount).toBe(13);
  expect(listInstruments({keyword: '手填新增', pageSize: 20}).total).toBe(1);
  expect((await client.get('/instrument/detail', {params: {id: 970101}})).data.items.name).toBe('手填新增设备');
  expect(listBindableCatalog('instrument').some(item => item.id === 970101)).toBe(true);
  // Registered but not placed on room canvas
  expect(listRoonInstrumentInfo(950003).list.length).toBe(beforeLayout);
  expect(listRoonInstrumentInfo(950003).list.every(item => item.id !== 970101)).toBe(true);
});

test('add rejects bad fields duplicate and empty capacity edge', async () => {
  await establishSession();
  expect(addDemoInstrument({...valid, name: 'x'}).ok).toBe(false);
  expect(addDemoInstrument({...valid, departmentId: 1}).message).toContain('部门');
  expect(addDemoInstrument({...valid, types: 99}).message).toContain('分类');
  expect(addDemoInstrument({...valid, roomId: 1}).message).toContain('房间');
  expect(addDemoInstrument({...valid}).ok).toBe(true);
  expect(addDemoInstrument({...valid}).message).toContain('重复');
  // Same name allowed in another room
  expect(addDemoInstrument({...valid, roomId: 950001}).ok).toBe(true);
});

test('batch/update stays blocked after add opens', async () => {
  await establishSession();
  expect((await client.post('/instrument/batch/update', {})).data.message).toContain('未开放');
});
