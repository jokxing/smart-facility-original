import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS, DEMO_MENUS} from '../../../src/mock/fixtures/auth';
import {
  getStatisticOverview,
  getStatisticAlarmOverview,
  getStatisticEquipmentAlarm
} from '../../../src/mock/fixtures/statistic';
import {clearInstrumentDeleted, clearInstrumentCreated, clearInstrumentMeta} from '../../../src/mock/fixtures/instrument';
import {resetDemoScenario, setDemoScenario} from '../../../src/mock/fixtures/scenario';
import {resetDemoAlarmLogHandles, batchHandleAlarmExceptions} from '../../../src/mock/fixtures/alarm';
import {DEMO_EQUIPMENTS} from '../../../src/mock/fixtures/equipment';

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
  resetDemoAlarmLogHandles();
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

test('statistic routes require auth', async () => {
  expect((await client.get('/statistic/overview')).data.code).toBe(2);
  expect((await client.get('/statistic/alarm/overview')).data.code).toBe(2);
  expect((await client.get('/statistic/equipment/alarm')).data.code).toBe(2);
});

test('overview aggregates current shared entities; equals fixture helper', async () => {
  await establishSession();
  const res = (await client.get('/statistic/overview')).data;
  expect(res.code).toBe(1);
  expect(res.items).toEqual(getStatisticOverview());
  expect(res.items.instrumentTotal).toBe(12);
  expect(res.items.instrumentNormalCount).toBe(12);
  expect(res.items.instrumentAlarmCount).toBe(0);
  expect(res.items.instrumentOffLineCount).toBe(0);
  expect(res.items.roomTotal).toBe(3);
  expect(res.items.roomNormalCount).toBe(2);
  expect(res.items.roomAlarmCount).toBe(0);
  expect(res.items.roomOffLineCount).toBe(0);
  expect(res.items.equipmentTotal).toBe(DEMO_EQUIPMENTS.length);
  expect(res.items.equipmentNormalCount + res.items.equipmentAlarmCount + res.items.equipmentOffLineCount)
    .toBeLessThanOrEqual(res.items.equipmentTotal);
});

test('overview follows scenario and instrument delete/add', async () => {
  await establishSession();
  setDemoScenario('alarm');
  let items = (await client.get('/statistic/overview')).data.items;
  expect(items.instrumentAlarmCount).toBe(items.instrumentTotal);
  expect(items.instrumentNormalCount).toBe(0);
  expect(items.roomAlarmCount).toBe(2);
  expect(items.roomNormalCount).toBe(0);

  setDemoScenario('offline');
  items = (await client.get('/statistic/overview')).data.items;
  expect(items.instrumentOffLineCount).toBe(items.instrumentTotal);
  expect(items.roomOffLineCount).toBe(2);

  resetDemoScenario();
  const before = (await client.get('/statistic/overview')).data.items.instrumentTotal;
  expect((await client.post('/instrument/remove/970012')).data.code).toBe(1);
  const afterDelete = (await client.get('/statistic/overview')).data.items.instrumentTotal;
  expect(afterDelete).toBe(before - 1);

  const add = (await client.post('/instrument/add', {
    name: '统计演示新增仪',
    departmentId: 900101,
    types: 1,
    roomId: 950001
  })).data;
  expect(add.code).toBe(1);
  const afterAdd = (await client.get('/statistic/overview')).data.items.instrumentTotal;
  expect(afterAdd).toBe(before);
});

test('alarm overview and histogram use historical open alarms; empty stays empty', async () => {
  await establishSession();
  const overview = (await client.get('/statistic/alarm/overview')).data;
  expect(overview.code).toBe(1);
  expect(overview.items).toEqual(getStatisticAlarmOverview());
  expect(Array.isArray(overview.items.instrumentOverview)).toBe(true);
  expect(Array.isArray(overview.items.labOverview)).toBe(true);
  expect(Array.isArray(overview.items.equipmentOverview)).toBe(true);
  expect(overview.items.instrumentOverview.some(row => row.name === '演示温度' && row.count > 0)).toBe(true);
  expect(overview.items.labOverview.some(row => row.name === '演示温度' && row.count > 0)).toBe(true);
  expect(overview.items.equipmentOverview.some(row => row.name === '阈值' || row.name === '离线')).toBe(true);

  const hist = (await client.get('/statistic/equipment/alarm')).data;
  expect(hist.code).toBe(1);
  expect(hist.items).toEqual(getStatisticEquipmentAlarm());
  expect(hist.items.length).toBeGreaterThan(0);
  expect(hist.items[0]).toEqual(expect.objectContaining({
    lineName: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    data: expect.any(Array)
  }));
  expect(hist.items[0].data[0]).toEqual(expect.objectContaining({
    typeName: expect.any(String),
    count: expect.any(Number)
  }));
});

test('processing instrument alarm reduces instrument ring counts', async () => {
  await establishSession();
  const before = getStatisticAlarmOverview().instrumentOverview
    .reduce((sum, row) => sum + row.count, 0);
  expect(before).toBeGreaterThan(0);

  const handled = batchHandleAlarmExceptions({
    ids: [960001],
    processDate: '2026-09-24 11:00:00',
    errorType: 1,
    errorCauseMethod: '演示处理',
    errorCauseMsg: '演示说明',
    errorCauseUserName: 'demo'
  });
  expect(handled.ok).toBe(true);

  const after = (await client.get('/statistic/alarm/overview')).data.items.instrumentOverview
    .reduce((sum, row) => sum + row.count, 0);
  expect(after).toBe(before - 1);
});

test('demo menu includes statistics entry', () => {
  expect(DEMO_MENUS.some(menu => menu.path === '/ds/statistics')).toBe(true);
});
