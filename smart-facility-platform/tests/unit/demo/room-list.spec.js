import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS, DEMO_MENUS} from '../../../src/mock/fixtures/auth';
import {getDemoRoomDetail, getRoomDashboard, listRooms} from '../../../src/mock/fixtures/room';
import {listInstrumentsByRoomId} from '../../../src/mock/fixtures/instrument';

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

test('room list requires auth', async () => {
  expect((await client.post('/room/list', {pageNum: 1, pageSize: 10, gardenId: ''})).data.code).toBe(2);
});

test('room list pagination and fields; designer floorId returns only unplaced', async () => {
  await establishSession();
  // All seed rooms on 930001 are placed → unplaced total 0.
  const designer = (await client.post('/room/list', {floorId: 930001, pageNum: 1, pageSize: 10000})).data;
  expect(designer.items.total).toBe(0);

  const page1 = (await client.post('/room/list', {
    pageNum: 1, pageSize: 2, gardenId: '', buildingId: '', floorId: '', keyword: '', status: '', departmentId: null, objType: ''
  })).data;
  expect(page1.code).toBe(1);
  expect(page1.items.total).toBe(3);
  expect(page1.items.list).toHaveLength(2);
  expect(page1.items.list[0]).toMatchObject({
    id: expect.any(Number),
    name: expect.any(String),
    no: expect.stringMatching(/^DEMO-R-/),
    departmentName: expect.any(String),
    gradenName: expect.any(String),
    buildingName: expect.any(String),
    floorName: '1F',
    openTwoSystem: 1
  });

  const page2 = (await client.post('/room/list', {
    pageNum: 2, pageSize: 2, gardenId: '', buildingId: '', floorId: ''
  })).data;
  expect(page2.items.list).toHaveLength(1);
  expect(page2.items.total).toBe(3);
});

test('keyword / department / status / location filters; empty does not fallback', async () => {
  await establishSession();
  const keyword = (await client.post('/room/list', {
    keyword: '房间', pageNum: 1, pageSize: 10, gardenId: ''
  })).data;
  expect(keyword.items.total).toBe(2);
  expect(keyword.items.list.map(r => r.id).sort()).toEqual([950001, 950003]);

  const empty = (await client.post('/room/list', {
    keyword: '不存在的房间XYZ', pageNum: 1, pageSize: 10, gardenId: ''
  })).data;
  expect(empty.items.total).toBe(0);
  expect(empty.items.list).toEqual([]);

  const rd = (await client.post('/room/list', {
    departmentId: 900102, pageNum: 1, pageSize: 10, gardenId: ''
  })).data;
  expect(rd.items.total).toBe(1);
  expect(rd.items.list[0].id).toBe(950003);

  const notMon = (await client.post('/room/list', {
    status: 3, pageNum: 1, pageSize: 10, gardenId: ''
  })).data;
  expect(notMon.items.total).toBe(1);
  expect(notMon.items.list[0].id).toBe(950002);

  const byFloor = (await client.post('/room/list', {
    gardenId: 910001, buildingId: 920001, floorId: 930001, pageNum: 1, pageSize: 10
  })).data;
  expect(byFloor.items.total).toBe(3);

  const otherFloor = (await client.post('/room/list', {
    gardenId: '', buildingId: '', floorId: 930002, pageNum: 1, pageSize: 10
  })).data;
  expect(otherFloor.items.total).toBe(0);
});

test('dashboard matches location-scoped status counts', async () => {
  await establishSession();
  const dash = (await client.get('/room/dashboardV1', {params: {gardenId: '', buildingId: '', floorId: ''}})).data;
  expect(dash.code).toBe(1);
  expect(dash.items).toEqual(getRoomDashboard({}));
  expect(dash.items.totalNum).toBe(3);
  expect(dash.items.normalNum + dash.items.policeNum + dash.items.leaveNum + dash.items.notMonitoringNum)
    .toBe(dash.items.totalNum);
  expect(dash.items.notMonitoringNum).toBe(1);

  const scoped = (await client.get('/room/dashboardV1', {params: {floorId: 930002}})).data;
  expect(scoped.items.totalNum).toBe(0);
});

test('detail opens new drawer contract; monitor instruments are on-map owned entities', async () => {
  await establishSession();
  const detail = (await client.get('/room/detail', {params: {id: 950001}})).data;
  expect(detail.code).toBe(1);
  expect(detail.items).toEqual(getDemoRoomDetail(950001));
  expect(detail.items.openTwoSystem).toBe(1);

  const monitor = (await client.get('/room/monitor/instrument', {params: {roomId: 950001, types: 0}})).data;
  expect(monitor.code).toBe(1);
  const owned = listInstrumentsByRoomId(950001).map(i => i.id).sort();
  expect(monitor.items.map(i => i.id).sort()).toEqual(owned);
  expect(monitor.items[0]).toMatchObject({
    id: expect.any(Number),
    name: expect.any(String),
    simpleEquipments: [{type: 1, sensors: expect.any(Array)}]
  });

  const corridor = (await client.get('/room/monitor/instrument', {params: {roomId: 950002}})).data;
  expect(corridor.items).toEqual([]);

  const unmapped = (await client.post('/instrument/list', {
    roomId: 950001, monitor: '2', pageNum: 1, pageSize: 10
  })).data;
  expect(unmapped.items.total).toBe(0);
});

test('unknown room / writes validation; batch still refused; menu has room entry', async () => {
  await establishSession();
  expect((await client.get('/room/detail', {params: {id: 999999}})).data.code).toBe(0);
  expect((await client.post('/room/add', {name: 'x'})).data.code).toBe(0);
  expect((await client.post('/room/update/basic', {id: 950001})).data.code).toBe(0);
  expect((await client.post('/room/remove/950001', {})).data.code).toBe(0);
  expect((await client.post('/room/batch/delete', {ids: [950001]})).data.message).toMatch(/未开放/);
  expect((await client.post('/room/batch/update', {})).data.message).toMatch(/未开放/);
  // 3C: export returns workbook buffer (not JSON failure envelope)
  const exported = await client.post('/room/export', {gardenId: ''}, {responseType: 'arraybuffer'});
  expect(exported.data.byteLength).toBeGreaterThan(100);
  expect((await client.post('/room/goods/remove', {})).data.message).toMatch(/未开放/);
  expect(DEMO_MENUS.some(menu => menu.path === '/rm/room')).toBe(true);
  expect(DEMO_MENUS.some(menu => (menu.subMenu || []).some(s => s.path === '/ms/mapSet'))).toBe(true);
  expect(listRooms({pageNum: 1, pageSize: 10, gardenId: ''}).total).toBe(3);
});
