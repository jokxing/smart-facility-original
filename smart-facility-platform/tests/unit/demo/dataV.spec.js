import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import {listFloorScreen, listRoomScreen, listMapGardenTree} from '../../../src/mock/fixtures/dataV';
import {DEMO_FLOOR_ROOMS, listFloorOverview} from '../../../src/mock/fixtures/floor';
import {getDemoRoomDetail} from '../../../src/mock/fixtures/room';
import {resetDemoScenario} from '../../../src/mock/fixtures/scenario';

jest.mock('../../../src/mock/captcha', () => ({createCaptchaImage: () => 'test-png-base64'}));

test('room IDs select the related instruments, not the first N cards', () => {
  const query = roomIds => listRoomScreen({buildingId: 920001, roomIds}).instrumentList.map(item => item.id);
  expect(query([950001])).toEqual(expect.arrayContaining([970001, 970002]));
  expect(query([950001]).every(id => [970001, 970002, 970004, 970005, 970011, 970012].includes(id))).toBe(true);
  expect(query('950003')).toEqual(expect.arrayContaining([970003, 970006]));
  expect(query('950003,950002')).toEqual(query('950003'));
  expect(query([950003, 950003])).toEqual(query([950003]));
  expect(query([999999])).toEqual([]);
  expect(query(['invalid'])).toEqual([]);
  expect(query([])).toEqual([]);
  expect(listRoomScreen({floorId: 930001, roomIds: [950003]}).instrumentCount.total).toBe(
    listRoomScreen({floorId: 930001, roomIds: [950003]}).instrumentList.length
  );
  expect(listRoomScreen({floorId: 930001, roomIds: [950002]}).instrumentList).toEqual([]);
});

test('unknown spaces and incompatible scopes are empty, omitted IDs still default', () => {
  for (const id of [999999, 'invalid', 0]) {
    const floor = listFloorScreen({floorId: id});
    expect(floor.roomList).toEqual([]);
    expect(floor.roomCount.total).toBe(0);
    expect(floor.floorDetail.buildingName).toBeUndefined();
    for (const scope of [{floorId: id}, {buildingId: id}]) {
      const screen = listRoomScreen(scope);
      expect(screen.instrumentList).toEqual([]);
      expect(screen.instrumentCount.total).toBe(0);
      expect(screen.roomDetail.buildingName).toBe('');
    }
  }
  expect(listRoomScreen({floorId: 930001, buildingId: 920101}).instrumentList).toEqual([]);
  expect(listRoomScreen({buildingId: 920101, roomIds: [950001]}).instrumentList).toEqual([]);
  expect(listFloorScreen().roomList).toHaveLength(3);
  expect(listRoomScreen().instrumentList.length).toBeGreaterThanOrEqual(12);
  expect(listRoomScreen().instrumentList.map(item => item.id)).toEqual(
    expect.arrayContaining([970001, 970002, 970003])
  );
});

test('floor, drawer and screen project the same room status and counts', () => {
  const room = DEMO_FLOOR_ROOMS[930001][1];
  const previous = room.senorStatus;
  try {
    for (const status of [1, 2, -100]) {
      room.senorStatus = status;
      expect(listFloorOverview(930001).labList[1].senorStatus).toBe(status);
      expect(getDemoRoomDetail(room.id).senorStatus).toBe(status);
      const screen = listFloorScreen({floorId: 930001});
      expect(screen.roomList[1].senorStatus).toBe(status);
      expect(screen.roomCount.alarmCount).toBe(status === 2 ? 1 : 0);
      expect(screen.roomCount.offlineCount).toBe(status === -100 ? 1 : 0);
      expect(listFloorScreen({floorId: 930001, status: 2}).roomList.map(r => r.id)).toEqual(status === 2 ? [950002] : []);
    }
  } finally {
    room.senorStatus = previous;
  }
});

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

test('floor screenV1 requires auth', async () => {
  expect((await client.post('/map/floor/screenV1', {floorId: 930001})).data.code).toBe(2);
});

test('alarm HTTP path preserves custom absolute dates near wall clock', async () => {
  await establishSession();
  const now = jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-10-24T12:00:00+08:00'));
  // Session validity is tested elsewhere; keep its expiry ahead of the controlled clock.
  const auth = JSON.parse(storage.getItem('_auth'));
  auth.expiresAt = Date.now() + 3600000;
  storage.setItem('_auth', JSON.stringify(auth));
  try {
    const body = {thingsType: 11, beginDate: '2026-10-17 00:00:00', endDate: '2026-10-24 12:00:00'};
    const response = (await client.post('/alarm/thing/statistics', body)).data;
    expect(response.code).toBe(1);
    expect(response.items.alarmStatistics).toEqual([]);
  } finally { now.mockRestore(); }
});

test('floor screenV1 projects roomList and counts from shared seeds', async () => {
  await establishSession();
  const res = (await client.post('/map/floor/screenV1', {floorId: 930001})).data;
  expect(res.code).toBe(1);
  expect(res.items).toEqual(listFloorScreen({floorId: 930001}));
  expect(res.items.roomList.length).toBeGreaterThan(0);
  expect(res.items.roomList[0]).toMatchObject({
    id: expect.any(Number),
    name: expect.any(String),
    senorStatus: expect.any(Number),
    data: expect.any(Array)
  });
  expect(res.items.floorDetail).toMatchObject({
    gardenName: '演示甲园区',
    buildingName: '演示一号楼',
    floorName: '1F'
  });
  expect(res.items.roomCount.total).toBe(res.items.roomList.length);
  expect(Array.isArray(res.items.alarmCount)).toBe(true);
});

test('room screenV1 projects instrumentList for building scope', async () => {
  await establishSession();
  const res = (await client.post('/map/room/screenV1', {buildingId: 920001})).data;
  expect(res.code).toBe(1);
  expect(res.items).toEqual(listRoomScreen({buildingId: 920001}));
  expect(res.items.instrumentList.length).toBeGreaterThan(0);
  expect(res.items.instrumentList[0]).toMatchObject({
    id: expect.any(Number),
    name: expect.any(String),
    senorStatus: expect.any(Number),
    data: expect.any(Array)
  });
  expect(res.items.instrumentCount.total).toBe(res.items.instrumentList.length);
  expect(res.items.roomDetail).toMatchObject({
    gardenName: '演示甲园区',
    buildingName: '演示一号楼',
    floorName: '1F'
  });
});

test('garden tree stays local; alarm ranking returns seeded history; designer writes blocked', async () => {
  await establishSession();
  expect((await client.get('/map/garden')).data.items).toEqual(listMapGardenTree());
  expect((await client.get('/equipment/bindEquipmentType', {params: {objType: 2}})).data.items).toEqual([
    {code: 0, name: '记录仪'},
    {code: 10, name: '设备管理器'},
    {code: 7, name: '声光报警器'},
    {code: 8, name: '断电报警器'},
    {code: 14, name: '信号接收器'},
    {code: 13, name: '移液枪架'},
    {code: 16, name: '资产网关'}
  ]);
  const monthBody = {
    thingsType: 11,
    sensorType: 0,
    beginDate: '2026-08-25 00:00:00',
    endDate: '2026-09-24 12:00:00'
  };
  // HTTP uses absolute dates; demo shortcuts are resolved before sending.
  const absoluteBody = {
    thingsType: 11,
    sensorType: 0,
    beginDate: '2026-08-25 00:00:00',
    endDate: '2026-09-24 12:00:00'
  };
  // Explicit dates have stable counts regardless of wall clock.
  const stats = (await client.post('/alarm/thing/statistics', absoluteBody)).data;
  expect(stats.code).toBe(1);
  expect(stats.items.alarmStatistics).toEqual([
    {thingsName: '演示房间 A', alarmCount: 3},
    {thingsName: '演示房间 B', alarmCount: 2}
  ]);
  const sensors = (await client.post('/alarm/thing/sensors/statistics', {
    thingsType: 11,
    beginDate: monthBody.beginDate,
    endDate: monthBody.endDate
  })).data;
  expect(sensors.items.sensors).toEqual([
    {sensorId: 101, sensorName: '演示温度'},
    {sensorId: 102, sensorName: '演示湿度'}
  ]);
  expect((await client.post('/alarm/thing/statistics', {thingsType: 11})).data.code).toBe(1);
  await expect(client.put('/map/showRoom/batch', {isShow: 1, roomIds: [950001]})).rejects.toMatchObject({code: 'MOCK_NOT_IMPLEMENTED'});
  expect((await client.post('/map/element/config', [{type: 11, elementId: 950001}])).data.code).toBe(0);
});

test('alarm statistics require auth', async () => {
  expect((await client.post('/alarm/thing/statistics', {thingsType: 11})).data.code).toBe(2);
  expect((await client.post('/alarm/thing/sensors/statistics', {thingsType: 11})).data.code).toBe(2);
});
