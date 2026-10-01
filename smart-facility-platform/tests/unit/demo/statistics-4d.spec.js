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
import {getStatisticInstrumentUseRanking} from '../../../src/mock/fixtures/statistic';
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

test('useRanking requires auth', async () => {
  expect((await client.get('/statistic/instrument/useRanking')).data.code).toBe(2);
});

test('default ranking is array of active instruments with rate fields', async () => {
  await establishSession();
  const params = {
    queryType: 1, dateType: 1, periodType: 1,
    beginTime: '', endTime: '', periodBeginTime: '', periodEndTime: ''
  };
  const res = (await client.get('/statistic/instrument/useRanking', {params})).data;
  expect(res.code).toBe(1);
  expect(res.items).toEqual(getStatisticInstrumentUseRanking(params));
  expect(Array.isArray(res.items)).toBe(true);
  expect(res.items).toHaveLength(12);
  expect(res.items[0]).toEqual(expect.objectContaining({
    instrumentName: expect.any(String),
    useRate: expect.any(Number),
    variationRate: expect.any(Number),
    changed: expect.any(Boolean)
  }));
  expect(res.items.every(row => row.useRate >= 0 && row.useRate <= 100)).toBe(true);
  const rates = res.items.map(r => r.useRate);
  expect(rates).toEqual([...rates].sort((a, b) => b - a));
});

test('delete shrinks ranking; periodType and hour window change rates', async () => {
  await establishSession();
  const workday = getStatisticInstrumentUseRanking({queryType: 1, dateType: 1, periodType: 1});
  const natural = getStatisticInstrumentUseRanking({queryType: 1, dateType: 1, periodType: 2});
  expect(natural[0].useRate).toBeLessThan(workday[0].useRate);

  const narrow = getStatisticInstrumentUseRanking({
    queryType: 1, dateType: 1, periodType: 2,
    periodBeginTime: '09', periodEndTime: '10'
  });
  expect(narrow[0].useRate).toBeLessThanOrEqual(natural[0].useRate);

  expect((await client.post('/instrument/remove/970012')).data.code).toBe(1);
  const after = (await client.get('/statistic/instrument/useRanking', {
    params: {queryType: 1, dateType: 1, periodType: 1}
  })).data.items;
  expect(after).toHaveLength(11);
  expect(after.some(row => row.instrumentName === '演示设备机柜 A')).toBe(false);
});
