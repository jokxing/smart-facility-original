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
import {getStatisticInstrumentUse, getStatisticInstrumentUseRanking} from '../../../src/mock/fixtures/statistic';
import {resetDemoScenario} from '../../../src/mock/fixtures/scenario';
import {
  validateStatisticDateParams,
  validateStatisticHourParams,
  validateStatisticRankingParams
} from '../../../src/utils/statisticRangeValidate';

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

test('unspecified date and hour windows are ok', () => {
  expect(validateStatisticDateParams({})).toEqual({ok: true});
  expect(validateStatisticDateParams({beginTime: '', endTime: '', dateType: 1})).toEqual({ok: true});
  expect(validateStatisticHourParams({})).toEqual({ok: true});
  expect(validateStatisticHourParams({periodBeginTime: '', periodEndTime: ''})).toEqual({ok: true});
  expect(validateStatisticRankingParams({dateType: 1, periodType: 1})).toEqual({ok: true});
});

test('partial or reversed date range is rejected', () => {
  expect(validateStatisticDateParams({beginTime: '2026-09-01 00:00:00', endTime: ''}).ok).toBe(false);
  expect(validateStatisticDateParams({beginTime: '', endTime: '2026-09-02 00:00:00'}).ok).toBe(false);
  expect(validateStatisticDateParams({
    beginTime: '2026-09-10 00:00:00',
    endTime: '2026-09-01 00:00:00'
  })).toEqual({ok: false, message: '开始日期不能晚于结束日期。'});
  expect(validateStatisticDateParams({
    beginTime: 'not-a-date',
    endTime: 'also-bad'
  }).ok).toBe(false);
});

test('partial or reversed hour window is rejected', () => {
  expect(validateStatisticHourParams({periodBeginTime: '08', periodEndTime: ''}).ok).toBe(false);
  expect(validateStatisticHourParams({periodBeginTime: '10', periodEndTime: '08'})).toEqual({
    ok: false,
    message: '时段开始不能晚于结束。'
  });
  expect(validateStatisticHourParams({periodBeginTime: '24', periodEndTime: '10'}).ok).toBe(false);
  expect(validateStatisticHourParams({periodBeginTime: '00', periodEndTime: '23'}).ok).toBe(true);
  expect(validateStatisticHourParams({periodBeginTime: 0, periodEndTime: 0}).ok).toBe(true);
});

test('fixture throws on invalid custom date instead of silent day fallback', () => {
  expect(() => getStatisticInstrumentUse({
    beginTime: '2026-09-10 00:00:00',
    endTime: '2026-09-01 00:00:00',
    queryType: 0,
    type: 0
  })).toThrow('开始日期不能晚于结束日期。');
  expect(() => getStatisticInstrumentUseRanking({
    dateType: 1,
    periodType: 1,
    periodBeginTime: '18',
    periodEndTime: '06'
  })).toThrow('时段开始不能晚于结束。');
});

test('API returns failure for invalid use and ranking ranges', async () => {
  await establishSession();
  const useRes = (await client.get('/statistic/instrument/use', {
    params: {beginTime: '2026-09-10 00:00:00', endTime: '2026-09-01 00:00:00', queryType: 0, type: 0}
  })).data;
  expect(useRes.code).toBe(0);
  expect(useRes.message).toBe('开始日期不能晚于结束日期。');

  const partial = (await client.get('/statistic/instrument/use', {
    params: {beginTime: '2026-09-01 00:00:00', endTime: '', queryType: 0, type: 0}
  })).data;
  expect(partial.code).toBe(0);
  expect(partial.message).toBe('请完整填写起止日期。');

  const rankRes = (await client.get('/statistic/instrument/useRanking', {
    params: {
      queryType: 1, dateType: 1, periodType: 1,
      beginTime: '', endTime: '', periodBeginTime: '20', periodEndTime: '08'
    }
  })).data;
  expect(rankRes.code).toBe(0);
  expect(rankRes.message).toBe('时段开始不能晚于结束。');
});

test('valid custom date and hour still succeed', async () => {
  await establishSession();
  const useRes = (await client.get('/statistic/instrument/use', {
    params: {
      beginTime: '2026-09-01 00:00:00',
      endTime: '2026-09-07 23:59:59',
      queryType: 0,
      type: 0
    }
  })).data;
  expect(useRes.code).toBe(1);
  expect(useRes.items.instrumentUseList).toHaveLength(12);

  const rankRes = (await client.get('/statistic/instrument/useRanking', {
    params: {
      queryType: 1, dateType: 1, periodType: 1,
      beginTime: '', endTime: '', periodBeginTime: '08', periodEndTime: '18'
    }
  })).data;
  expect(rankRes.code).toBe(1);
  expect(rankRes.items).toHaveLength(12);
});
