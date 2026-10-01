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

test('instrument use requires auth', async () => {
  expect((await client.get('/statistic/instrument/use')).data.code).toBe(2);
});

test('default day duration list matches fixture and active instruments', async () => {
  await establishSession();
  const params = {dateType: 1, queryType: 0, type: 0, beginTime: '', endTime: '', pageNum: 1, pageSize: 10};
  const res = (await client.get('/statistic/instrument/use', {params})).data;
  expect(res.code).toBe(1);
  expect(res.items).toEqual(getStatisticInstrumentUse(params));
  expect(res.items.instrumentUseList).toHaveLength(12);
  expect(res.items.instrumentUseList[0]).toEqual(expect.objectContaining({
    instrumentName: expect.any(String),
    useTime: expect.any(Number),
    useCount: expect.any(Number),
    electricPower: 0
  }));
  expect(res.items.instrumentUseList.every(row => row.useTime > 0)).toBe(true);
  const times = res.items.instrumentUseList.map(r => r.useTime);
  expect(times).toEqual([...times].sort((a, b) => b - a));
});

test('type filter empty; delete shrinks list; electricity query empty; week enlarges useTime', async () => {
  await establishSession();
  const admin = (await client.get('/statistic/instrument/use', {
    params: {dateType: 1, queryType: 0, type: 2}
  })).data.items.instrumentUseList;
  expect(admin).toEqual([]);

  const it = (await client.get('/statistic/instrument/use', {
    params: {dateType: 1, queryType: 0, type: 3}
  })).data.items.instrumentUseList;
  expect(it).toEqual([]);

  const power = (await client.get('/statistic/instrument/use', {
    params: {dateType: 1, queryType: 2, type: 0}
  })).data.items.instrumentUseList;
  expect(power).toEqual([]);

  const day = getStatisticInstrumentUse({dateType: 1, queryType: 0, type: 0}).instrumentUseList[0].useTime;
  const week = getStatisticInstrumentUse({dateType: 2, queryType: 0, type: 0}).instrumentUseList[0].useTime;
  expect(week).toBeGreaterThan(day);

  expect((await client.post('/instrument/remove/970012')).data.code).toBe(1);
  const after = (await client.get('/statistic/instrument/use', {
    params: {dateType: 1, queryType: 0, type: 0}
  })).data.items.instrumentUseList;
  expect(after).toHaveLength(11);
  expect(after.some(row => row.instrumentName === '演示设备机柜 A')).toBe(false);
});
