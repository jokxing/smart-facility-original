import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import {
  clearInstrumentCreated,
  clearInstrumentDeleted,
  clearInstrumentMeta
} from '../../../src/mock/fixtures/instrument';
import {getStatisticInstrumentUse} from '../../../src/mock/fixtures/statistic';
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

test('electricity use requires auth', async () => {
  expect((await client.get('/statistic/instrument/use', {
    params: {queryType: 2, dateType: 1, type: 0}
  })).data.code).toBe(2);
});

test('queryType 2 returns positive electricPower sorted desc', async () => {
  await establishSession();
  const params = {dateType: 1, queryType: 2, type: 0, beginTime: '', endTime: '', pageNum: 1, pageSize: 10};
  const res = (await client.get('/statistic/instrument/use', {params})).data;
  expect(res.code).toBe(1);
  expect(res.items).toEqual(getStatisticInstrumentUse(params));
  expect(res.items.instrumentUseList).toHaveLength(12);
  expect(res.items.instrumentUseList.every(row => row.electricPower > 0)).toBe(true);
  const powers = res.items.instrumentUseList.map(r => r.electricPower);
  expect(powers).toEqual([...powers].sort((a, b) => b - a));
  const incubator = res.items.instrumentUseList.find(r => r.instrumentName === '演示培养箱');
  expect(incubator).toBeTruthy();
  expect(incubator.electricPower).toBe(Math.round(0.8 * (incubator.useTime / 3600) * 100) / 100);
});

test('week power > day; delete shrinks electricity list', async () => {
  await establishSession();
  const day = getStatisticInstrumentUse({dateType: 1, queryType: 2, type: 0}).instrumentUseList[0].electricPower;
  const week = getStatisticInstrumentUse({dateType: 2, queryType: 2, type: 0}).instrumentUseList[0].electricPower;
  expect(week).toBeGreaterThan(day);

  expect((await client.post('/instrument/remove/970001')).data.code).toBe(1);
  const after = (await client.get('/statistic/instrument/use', {
    params: {dateType: 1, queryType: 2, type: 0}
  })).data.items.instrumentUseList;
  expect(after).toHaveLength(11);
  expect(after.some(row => row.instrumentName === '演示培养箱')).toBe(false);
});
