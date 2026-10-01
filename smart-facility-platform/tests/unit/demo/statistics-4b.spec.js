import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import {
  clearInstrumentCreated,
  clearInstrumentDeleted,
  clearInstrumentMeta,
  getInstrumentStatistics
} from '../../../src/mock/fixtures/instrument';
import {getStatisticOverview} from '../../../src/mock/fixtures/statistic';
import {resetDemoScenario, setDemoScenario} from '../../../src/mock/fixtures/scenario';

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

test('instrumentStatistics requires auth', async () => {
  expect((await client.get('/instrument/instrumentStatistics')).data.code).toBe(2);
});

test('default scenario: all active instruments counted as run', async () => {
  await establishSession();
  const res = (await client.get('/instrument/instrumentStatistics')).data;
  expect(res.code).toBe(1);
  expect(res.items).toEqual(getInstrumentStatistics());
  expect(res.items).toEqual({
    totalCount: 12,
    runCount: 12,
    standbyCount: 0,
    closeCount: 0
  });
  const overview = getStatisticOverview();
  expect(res.items.totalCount).toBe(overview.instrumentTotal);
  expect(res.items.runCount).toBe(overview.instrumentNormalCount);
});

test('delete reduces total and run; alarm scenario leaves rings empty without inventing normal', async () => {
  await establishSession();
  expect((await client.post('/instrument/remove/970012')).data.code).toBe(1);
  let items = (await client.get('/instrument/instrumentStatistics')).data.items;
  expect(items.totalCount).toBe(11);
  expect(items.runCount).toBe(11);

  setDemoScenario('alarm');
  items = (await client.get('/instrument/instrumentStatistics')).data.items;
  expect(items.totalCount).toBe(11);
  expect(items.runCount).toBe(0);
  expect(items.standbyCount).toBe(0);
  expect(items.closeCount).toBe(0);

  setDemoScenario('offline');
  items = (await client.get('/instrument/instrumentStatistics')).data.items;
  expect(items.totalCount).toBe(11);
  expect(items.runCount + items.standbyCount + items.closeCount).toBe(0);
});
