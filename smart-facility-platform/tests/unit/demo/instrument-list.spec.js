import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS, DEMO_CATEGORIES, DEMO_MENUS} from '../../../src/mock/fixtures/auth';
import {
  DEMO_INSTRUMENTS,
  getInstrumentDashboardNew,
  listInstruments
} from '../../../src/mock/fixtures/instrument';
import {listBindableCatalog} from '../../../src/mock/fixtures/equipment';
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

test('instrument list and dashboard require auth', async () => {
  expect((await client.post('/instrument/list', {pageNum: 1, pageSize: 10})).data.code).toBe(2);
  expect((await client.get('/instrument/dashboard/new')).data.code).toBe(2);
});

test('list pages 12 instruments with openTwoSystem and shared 970xxx ids', async () => {
  await establishSession();
  const page1 = (await client.post('/instrument/list', {pageNum: 1, pageSize: 10, type: 4})).data;
  expect(page1.code).toBe(1);
  expect(page1.items.total).toBe(12);
  expect(page1.items.list).toHaveLength(10);
  expect(page1.items.list.every(row => row.openTwoSystem === true)).toBe(true);
  expect(page1.items.list.map(row => row.id)).toEqual(DEMO_INSTRUMENTS.slice(0, 10).map(item => item.id));
  const page2 = (await client.post('/instrument/list', {pageNum: 2, pageSize: 10, type: 4})).data;
  expect(page2.items.list).toHaveLength(2);
  expect(page2.items.list.map(row => row.id)).toEqual([970011, 970012]);
});

test('keyword / department / category / status filters and empty result', async () => {
  await establishSession();
  const byName = (await client.post('/instrument/list', {keyword: '培养箱', pageNum: 1, pageSize: 10})).data;
  expect(byName.items.total).toBe(2);
  expect(byName.items.list.every(row => row.name.includes('培养箱'))).toBe(true);

  const rd = (await client.post('/instrument/list', {
    departmentIdList: ['900102'], pageNum: 1, pageSize: 20
  })).data;
  expect(rd.items.total).toBe(3);
  expect(rd.items.list.every(row => Number(row.departmentId) === 900102)).toBe(true);

  const typed = (await client.post('/instrument/list', {typesList: [1], pageNum: 1, pageSize: 20})).data;
  expect(typed.items.total).toBe(12);

  const emptyType = (await client.post('/instrument/list', {typesList: [99], pageNum: 1, pageSize: 10})).data;
  expect(emptyType.items.total).toBe(0);
  expect(emptyType.items.list).toEqual([]);

  const running = (await client.post('/instrument/list', {status: 1, pageNum: 1, pageSize: 20})).data;
  expect(running.items.total).toBe(12);
  const unrunning = (await client.post('/instrument/list', {status: 0, pageNum: 1, pageSize: 20})).data;
  expect(unrunning.items.total).toBe(0);

  setDemoScenario('alarm');
  const alarmUnrun = (await client.post('/instrument/list', {status: 0, pageNum: 1, pageSize: 20})).data;
  expect(alarmUnrun.items.total).toBe(12);
  const alarmParam = (await client.post('/instrument/list', {sensorStatus: 2, pageNum: 1, pageSize: 20})).data;
  expect(alarmParam.items.total).toBe(12);
});

test('space filter by floor id and room id; floorIds are floor not room', async () => {
  await establishSession();
  const floor = (await client.post('/instrument/list', {
    floorIds: [930001], pageNum: 1, pageSize: 20
  })).data;
  expect(floor.items.total).toBe(12);
  const roomA = (await client.post('/instrument/list', {
    roomIdList: [950001], pageNum: 1, pageSize: 20
  })).data;
  expect(roomA.items.total).toBe(6);
  expect(roomA.items.list.every(row => row.roomId === 950001)).toBe(true);
  const otherFloor = (await client.post('/instrument/list', {
    floorIds: [930002], pageNum: 1, pageSize: 10
  })).data;
  expect(otherFloor.items.total).toBe(0);
});

test('dashboard counts match list universe and UI field mapping sources', async () => {
  await establishSession();
  const dash = (await client.get('/instrument/dashboard/new')).data;
  expect(dash.code).toBe(1);
  expect(dash.items.totalCount).toBe(12);
  const byType = Object.fromEntries(dash.items.data.map(item => [item.linaType, item]));
  expect(byType[5]).toEqual({linaType: 5, normalCount: 12, abnormalCount: 0, restsCount: 0});
  expect(byType[6]).toEqual({linaType: 6, normalCount: 12, abnormalCount: 0, restsCount: 0});
  expect(getInstrumentDashboardNew()).toEqual(dash.items);

  setDemoScenario('offline');
  const offline = (await client.get('/instrument/dashboard/new')).data.items;
  expect(offline.data.find(d => d.linaType === 5).abnormalCount).toBe(12);
  expect(offline.data.find(d => d.linaType === 6).restsCount).toBe(12);
});

test('detail id matches list row; bindable catalog stays same 970xxx set', async () => {
  await establishSession();
  const list = listInstruments({pageNum: 1, pageSize: 20});
  const detail = (await client.get('/instrument/detail', {params: {id: 970001}})).data;
  expect(detail.code).toBe(1);
  const row = list.list.find(item => item.id === 970001);
  expect(detail.items.id).toBe(row.id);
  expect(detail.items.name).toBe(row.name);
  expect(detail.items.no).toBe(row.no);
  expect(detail.items.departmentName).toBe(row.departmentName);
  expect(detail.items.openTwoSystem).toBe(true);
  expect(listBindableCatalog('instrument').map(item => item.id)).toEqual(DEMO_INSTRUMENTS.map(item => item.id));
});

test('writes except update/basic stay rejected; categories/menus support labdevice entry', async () => {
  await establishSession();
  for (const [method, url] of [
    ['post', '/instrument/add'],
    ['post', '/instrument/batch/delete'],
    ['post', '/instrument/export'],
    ['post', '/instrument/remove/970001'],
    ['get', '/instrument/unbind']
  ]) {
    const res = method === 'get'
      ? (await client.get(url, {params: {instrumentId: 970001}})).data
      : (await client.post(url, {})).data;
    expect(res.code).toBe(0);
    expect(res.message).toContain('未开放');
  }
  expect(DEMO_CATEGORIES.map(item => item.types).sort()).toEqual([1, 2]);
  expect(DEMO_CATEGORIES.every(item => item.code && !String(item.code).includes('undefined'))).toBe(true);
  const cats = (await client.get('/instrumentCategoryInfo/superior/cat')).data;
  expect(cats.items.some(item => item.types === 1)).toBe(true);
  expect(DEMO_MENUS.some(menu => menu.path === '/ld/labdevice')).toBe(true);
});

test('room list: designer floorId empty; modal/keyword returns shared rooms', async () => {
  await establishSession();
  const designer = (await client.post('/room/list', {floorId: 930001, pageNum: 1, pageSize: 10000})).data;
  expect(designer.items.total).toBe(0);
  const modal = (await client.post('/room/list', {pageNum: 1, pageSize: 10000})).data;
  expect(modal.items.total).toBe(3);
  const hit = (await client.post('/room/list', {keyword: '房间', pageNum: 1, pageSize: 10})).data;
  expect(hit.items.total).toBe(2);
  expect(hit.items.list.map(item => item.id).sort()).toEqual([950001, 950003]);
});

test('objType filter uses bindings; unbound type yields empty', async () => {
  await establishSession();
  const none = (await client.post('/instrument/list', {objType: 0, pageNum: 1, pageSize: 10})).data;
  expect(none.items.total).toBe(0);
});
