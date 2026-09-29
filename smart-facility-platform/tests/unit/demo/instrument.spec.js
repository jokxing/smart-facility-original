import axios from 'axios';
import {validPlacement, roomFrame} from '../../../src/utils/demoLayoutGeometry';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import {
  clearAllRoomLayoutOverrides,
  DEMO_INSTRUMENTS,
  listRoonInstrumentInfo,
  ROOM_BOUNDS,
  saveRoomInstrumentLayout
} from '../../../src/mock/fixtures/instrument';
import {listFloorOverview} from '../../../src/mock/fixtures/floor';
import {listFloorScreen, listRoomScreen} from '../../../src/mock/fixtures/dataV';
import {resetDemoScenario, setDemoScenario} from '../../../src/mock/fixtures/scenario';
import {DEMO_DEVICE_ASSET_REGISTRY, resolveDeviceAssetUrl} from '../../../src/utils/demoDeviceUrl';
import {DEMO_ROOM_MAP_REGISTRY, resolveRoomMapUrlByRoomId} from '../../../src/utils/demoRoomMapUrl';

jest.mock('../../../src/mock/captcha', () => ({createCaptchaImage: () => 'test-png-base64'}));

test('seed geometry fits fully inside aspect-preserved room backgrounds', () => {
  [950001, 950003].forEach(id => {
    const frame = roomFrame(id);
    expect(frame.width / frame.height).toBeCloseTo(ROOM_BOUNDS[id].w / ROOM_BOUNDS[id].h);
    expect(listRoonInstrumentInfo(id).list.every(item => validPlacement(item, id))).toBe(true);
  });
});

test.each([{scaleX: 100}, {scaleX: -1}, {scaleY: 0}, {x: 0}, {x: null},
  {rotation: Infinity}, {sortIndex: 1.5}, {roomId: 950003}, {scaleY: ''}])(
  'invalid full geometry or identity is rejected atomically: %j', change => {
    const seed = listRoonInstrumentInfo(950001).list;
    expect(saveRoomInstrumentLayout(seed).ok).toBe(true);
    const before = storage.getItem('roomLayoutOverrides');
    const invalid = seed.map((item, i) => i === 0 ? {...item, ...change} : item);
    expect(saveRoomInstrumentLayout(invalid).ok).toBe(false);
    expect(storage.getItem('roomLayoutOverrides')).toBe(before);
  });

test('duplicate devices and corrupt or legacy stored layouts cannot override seeds', () => {
  const seed = listRoonInstrumentInfo(950001).list;
  expect(saveRoomInstrumentLayout([...seed, seed[0]]).ok).toBe(false);
  for (const payload of [
    {'950001': seed.map(d => ({...d, x: 0}))},
    {version: 2, rooms: {'950001': seed.map(d => ({...d, scaleX: 100}))}},
    {version: 2, rooms: {'950001': [...seed, seed[0]]}}
  ]) {
    storage.setItem('roomLayoutOverrides', JSON.stringify(payload));
    expect(listRoonInstrumentInfo(950001).list).toEqual(seed);
  }
  const moved = seed.map(d => ({...d, x: d.x + 20}));
  const other = listRoonInstrumentInfo(950003).list;
  expect(saveRoomInstrumentLayout(moved).ok).toBe(true);
  expect(JSON.parse(storage.getItem('roomLayoutOverrides')).version).toBe(2);
  expect(listRoonInstrumentInfo(950001).list.map(d => d.x)).toEqual(moved.map(d => d.x));
  expect(listRoonInstrumentInfo(950003).list).toEqual(other);
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
  clearAllRoomLayoutOverrides();
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

test('layout read requires auth', async () => {
  expect((await client.post('/map/element/getRoonInstrumentInfoList?roomId=950001')).data.code).toBe(2);
});

test('labs return room-local layout with size/rotation; corridor and illegal ids stay empty', async () => {
  await establishSession();
  const roomA = (await client.post('/map/element/getRoonInstrumentInfoList?roomId=950001')).data;
  expect(roomA.code).toBe(1);
  expect(roomA.items.list.length).toBeGreaterThan(0);
  expect(roomA.items.list.every(item => item.roomId === 950001)).toBe(true);
  roomA.items.list.forEach(item => {
    expect(item.x).toBeGreaterThanOrEqual(0);
    expect(item.y).toBeGreaterThanOrEqual(0);
    expect(item.x).toBeLessThanOrEqual(1600);
    expect(item.y).toBeLessThanOrEqual(790);
    expect(item).toMatchObject({
      elementId: expect.any(Number),
      scaleX: expect.any(Number),
      scaleY: expect.any(Number),
      rotation: expect.any(Number),
      url: expect.any(String),
      isEdit: 1,
      isMonitor: 1
    });
    expect(DEMO_DEVICE_ASSET_REGISTRY[item.url] || null).toBeTruthy();
  });
  expect(roomA.items.list.some(item => item.rotation === 90)).toBe(true);
  expect(roomA.items.board.normalNum).toBe(roomA.items.list.length);

  const roomB = listRoonInstrumentInfo(950003);
  expect(roomB.list.length).toBeGreaterThan(0);
  expect(roomB.list.every(item => item.roomId === 950003)).toBe(true);
  expect(roomB.list.some(item => item.rotation === -90)).toBe(true);

  expect(listRoonInstrumentInfo(950002).list).toEqual([]);
  expect((await client.post('/map/element/getRoonInstrumentInfoList?roomId=999999')).data.items.list).toEqual([]);
  expect(listRoonInstrumentInfo('invalid').list).toEqual([]);
  expect(ROOM_BOUNDS[950001]).toBeTruthy();
});

test('shared instrument ids stay unique per room and cover six asset keys', async () => {
  const ids = DEMO_INSTRUMENTS.map(item => item.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(ids).toEqual(expect.arrayContaining([970001, 970002, 970003]));
  expect(DEMO_INSTRUMENTS.every(item => [950001, 950003].includes(item.roomId))).toBe(true);
  const keys = new Set(DEMO_INSTRUMENTS.map(item => item.assetKey));
  expect(keys.size).toBe(6);
  expect(resolveDeviceAssetUrl('demo-device-analyzer')).toBe('/demo/devices/analyzer.svg');
  expect(resolveRoomMapUrlByRoomId(950001)).toBe(DEMO_ROOM_MAP_REGISTRY['demo-room-a']);
  expect(resolveRoomMapUrlByRoomId(950002)).toBeNull();
});

test('scenario switch changes layout status and RoomDataV counts together; layout coords stay fixed', async () => {
  await establishSession();
  const before = listRoonInstrumentInfo(950001);
  const beforeXY = before.list.map(item => [item.elementId, item.x, item.y, item.rotation]);

  setDemoScenario('alarm');
  const alarmed = listRoonInstrumentInfo(950001);
  expect(alarmed.list.every(item => item.status === -1)).toBe(true);
  expect(alarmed.board.policeNum).toBe(alarmed.list.length);
  expect(alarmed.list.map(item => [item.elementId, item.x, item.y, item.rotation])).toEqual(beforeXY);
  const screenAlarm = listRoomScreen({floorId: 930001, roomIds: [950001]});
  expect(screenAlarm.instrumentCount.alarmCount).toBe(screenAlarm.instrumentList.length);
  expect(screenAlarm.instrumentCount.normalCount).toBe(0);
  expect(screenAlarm.instrumentList.every(item => item.senorStatus === 2)).toBe(true);

  const api = await client.post('/demo/scenario', {scenario: 'offline'});
  expect(api.data.code).toBe(1);
  expect(api.data.items.scenario).toBe('offline');
  const offline = (await client.post('/map/element/getRoonInstrumentInfoList?roomId=950001')).data.items;
  expect(offline.list.every(item => item.status === -100)).toBe(true);
  expect(offline.board.leaveNum).toBe(offline.list.length);
  const screenOffline = listRoomScreen({floorId: 930001, roomIds: [950001]});
  expect(screenOffline.instrumentCount.offlineCount).toBe(screenOffline.instrumentList.length);

  setDemoScenario('normal');
  expect(listRoonInstrumentInfo(950001).board.normalNum).toBe(before.list.length);
});

test('floor room markers for wired labs follow the shared scenario', () => {
  setDemoScenario('normal');
  expect(listFloorOverview(930001).labList.find(r => r.id === 950001).senorStatus).toBe(1);
  expect(listFloorOverview(930001).labList.find(r => r.id === 950002).senorStatus).toBe(1);

  setDemoScenario('alarm');
  expect(listFloorOverview(930001).labList.find(r => r.id === 950001).senorStatus).toBe(2);
  expect(listFloorOverview(930001).labList.find(r => r.id === 950003).senorStatus).toBe(2);
  expect(listFloorOverview(930001).labList.find(r => r.id === 950002).senorStatus).toBe(1);
  expect(listFloorScreen({floorId: 930001}).roomCount.alarmCount).toBe(2);

  setDemoScenario('offline');
  expect(listFloorOverview(930001).labList.find(r => r.id === 950001).senorStatus).toBe(-100);
  expect(listFloorScreen({floorId: 930001}).roomCount.offlineCount).toBe(2);
});

test('type:4 layout save persists and reset restores seeds; illegal writes fail', async () => {
  await establishSession();
  const seed = listRoonInstrumentInfo(950001).list;
  const moved = seed.map((item, index) => ({
    ...item,
    type: 4,
    x: item.x + 40,
    y: item.y + 20,
    sortIndex: index
  }));
  const saved = (await client.post('/map/element/config', moved)).data;
  expect(saved.code).toBe(1);
  expect(saved.items.count).toBe(moved.length);

  const after = (await client.post('/map/element/getRoonInstrumentInfoList?roomId=950001')).data.items.list;
  expect(after.map(item => [item.elementId, item.x, item.y])).toEqual(
    moved.map(item => [item.elementId, item.x, item.y])
  );

  setDemoScenario('alarm');
  const afterAlarm = listRoonInstrumentInfo(950001).list;
  expect(afterAlarm.every(item => item.status === -1)).toBe(true);
  expect(afterAlarm.map(item => [item.elementId, item.x, item.y])).toEqual(
    moved.map(item => [item.elementId, item.x, item.y])
  );

  const reset = (await client.post('/demo/room-layout/reset', {roomId: 950001})).data;
  expect(reset.code).toBe(1);
  const restored = listRoonInstrumentInfo(950001).list;
  expect(restored.map(item => [item.elementId, item.x, item.y])).toEqual(
    seed.map(item => [item.elementId, item.x, item.y])
  );

  expect((await client.post('/map/element/config', [{type: 11, elementId: 950001, x: 1, y: 1}])).data.code).toBe(0);
  expect((await client.post('/map/element/config', [{type: 4, elementId: 999999, mediaId: 950001, x: 10, y: 10}])).data.code).toBe(0);
  expect(saveRoomInstrumentLayout(moved.slice(0, 1)).ok).toBe(false);
});

test('instrument detail requires auth', async () => {
  expect((await client.get('/instrument/detail', {params: {id: 970001}})).data.code).toBe(2);
});

test('instrument detail and open-monitor flags reuse shared ids/sensors; offline has no live reading', async () => {
  await establishSession();

  const detail = (await client.get('/instrument/detail', {params: {id: 970001}})).data;
  expect(detail.code).toBe(1);
  expect(detail.items).toMatchObject({
    id: 970001,
    name: '演示培养箱',
    no: 'DEMO-EQ-970001',
    roomName: '演示房间 A',
    detailType: 1,
    types: 1,
    logoUrl: ''
  });
  expect(listRoonInstrumentInfo(950001).list.find(d => d.elementId === 970001).openTwoSystem).toBe(true);

  const sensors = (await client.get('/monitorIndicator/getOpenMonitorFlag', {
    params: {objId: 970001, objType: 2}
  })).data;
  expect(sensors.code).toBe(1);
  expect(sensors.items.list).toHaveLength(2);
  expect(sensors.items.list[0]).toMatchObject({
    sensorAlias: '演示温度',
    monitorSensorVal: '5.2',
    unit: '℃'
  });
  expect(sensors.items.list[1].sensorAlias).toBe('演示湿度');
  expect(listRoonInstrumentInfo(950001).simpleEquipmentList.find(d => d.id === 970001).sensors[0].val)
    .toBe(sensors.items.list[0].monitorSensorVal);

  expect((await client.get('/monitorIndicator/getMonitorFlag', {
    params: {objId: 970001, objType: 2}
  })).data.items[0].id).toBe(sensors.items.list[0].id);
  const daySeries = (await client.get('/monitorIndicator/monitorInfo', {
    params: {
      objId: 970001,
      type: 2,
      objSensorId: sensors.items.list[0].id,
      interval: 4,
      historyTimeInterval: 5
    }
  })).data;
  expect(daySeries.code).toBe(1);
  expect(daySeries.items.length).toBeGreaterThan(10);
  expect(daySeries.items[0]).toMatchObject({
    id: expect.any(Number),
    createDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2} /),
    data: expect.any(Number)
  });
  expect((await client.post('/instrument/reservation/schedulerList', {
    instrumentId: 970001, pageNum: 1, pageSize: 10
  })).data.items).toEqual({list: [], pageNum: 1, pageSize: 10, total: 0});

  setDemoScenario('offline');
  const offlineDetail = (await client.get('/instrument/detail', {params: {id: 970001}})).data.items;
  expect(offlineDetail.bingStatus).toBe(-100);
  const offlineSensors = (await client.get('/monitorIndicator/getOpenMonitorFlag', {
    params: {objId: 970001, objType: 2}
  })).data.items.list[0];
  expect(offlineSensors.monitorSensorVal).toBe('');
  expect(listRoonInstrumentInfo(950001).simpleEquipmentList[0].sensors[0].val).toBeNull();
  expect((await client.get('/monitorIndicator/monitorInfo', {
    params: {objId: 970001, type: 2, objSensorId: sensors.items.list[0].id, interval: 4}
  })).data.items).toEqual([]);

  expect((await client.get('/instrument/detail', {params: {id: 999999}})).data.code).toBe(0);
  expect((await client.get('/monitorIndicator/getOpenMonitorFlag', {
    params: {objId: 970001, objType: 3}
  })).data.code).toBe(0);
});

test('monitorInfo series follows interval and sensor; segmented range merges; offline stays empty', async () => {
  await establishSession();
  const open = (await client.get('/monitorIndicator/getOpenMonitorFlag', {
    params: {objId: 970004, objType: 2}
  })).data.items;
  const tempId = open.list[0].id;
  const humidityId = open.list[1].id;

  const day = (await client.get('/monitorIndicator/monitorInfo', {
    params: {objId: 970004, type: 2, objSensorId: tempId, interval: 4, historyTimeInterval: 5}
  })).data.items;
  const week = (await client.get('/monitorIndicator/monitorInfo', {
    params: {objId: 970004, type: 2, objSensorId: tempId, interval: 5, historyTimeInterval: 60}
  })).data.items;
  expect(week.length).toBeGreaterThan(day.length);
  expect(week[0].createDate < week[week.length - 1].createDate).toBe(true);

  const humidity = (await client.get('/monitorIndicator/monitorInfo', {
    params: {objId: 970004, type: 2, objSensorId: humidityId, interval: 4, historyTimeInterval: 5}
  })).data.items;
  expect(humidity[0].data).not.toBe(day[0].data);

  setDemoScenario('alarm');
  const alarmed = (await client.get('/monitorIndicator/monitorInfo', {
    params: {objId: 970004, type: 2, objSensorId: tempId, interval: 4, historyTimeInterval: 5}
  })).data.items;
  expect(alarmed[0].data).toBeGreaterThan(30);

  const segment = (await client.get('/monitorIndicator/monitorInfo', {
    params: {
      objId: 970004,
      type: 2,
      objSensorId: tempId,
      beginTime: '2026-09-20 12:00:00',
      endTime: '2026-09-22 12:00:00',
      historyTimeInterval: 60
    }
  })).data.items;
  expect(segment.length).toBeGreaterThan(0);
  expect(segment[0].createDate.startsWith('2026-09-20')).toBe(true);
  expect(segment[segment.length - 1].createDate.startsWith('2026-09-22')).toBe(true);

  expect((await client.post('/monitorIndicator/historyPage', {
    objId: 970004, type: 2, objSensorIds: [tempId], pageNum: 1, pageSize: 10
  })).data.items).toEqual({list: {'970004': []}, total: 0, pageNum: 1, pageSize: 10});

  expect((await client.get('/monitorIndicator/monitorInfo', {
    params: {objId: 970004, type: 3, objSensorId: tempId, interval: 4}
  })).data.code).toBe(0);
  expect((await client.get('/monitorIndicator/monitorInfo', {
    params: {objId: 970004, type: 2, objSensorId: 999, interval: 4}
  })).data.code).toBe(0);

  // Explicit invalid / reversed / one-sided ranges must fail — not fall back to default window.
  for (const params of [
    {beginTime: '2026-09-22 12:00:00', endTime: '2026-09-20 12:00:00'},
    {beginTime: 'invalid', endTime: '2026-09-22 12:00:00'},
    {beginTime: '2026-02-30 12:00:00', endTime: '2026-03-04 12:00:00'},
    {beginTime: '2026-02-30T12:00:00+08:00', endTime: '2026-03-04T12:00:00+08:00'},
    {beginTime: '2026-09-20 12:00:00', endTime: ''},
    {beginTime: '2026-09-20 12:00:00'}
  ]) {
    expect((await client.get('/monitorIndicator/monitorInfo', {
      params: {objId: 970004, type: 2, objSensorId: tempId, historyTimeInterval: 60, ...params}
    })).data.code).toBe(0);
  }

  // interval=6 is 30 days ending at DEMO_NOW (2026-09-24), independent of wall clock.
  const month = (await client.get('/monitorIndicator/monitorInfo', {
    params: {objId: 970004, type: 2, objSensorId: tempId, interval: 6, historyTimeInterval: 1440}
  })).data.items;
  expect(month.length).toBeGreaterThan(0);
  expect(month[0].createDate.startsWith('2026-08-')).toBe(true);
  expect(month[month.length - 1].createDate.startsWith('2026-09-24')).toBe(true);

  const segmentA = (await client.get('/monitorIndicator/monitorInfo', {
    params: {
      objId: 970004, type: 2, objSensorId: tempId,
      beginTime: '2026-08-25 12:00:00', endTime: '2026-08-27 12:00:00', historyTimeInterval: 60
    }
  })).data.items;
  const segmentB = (await client.get('/monitorIndicator/monitorInfo', {
    params: {
      objId: 970004, type: 2, objSensorId: tempId,
      beginTime: '2026-08-27 12:00:00', endTime: '2026-08-29 12:00:00', historyTimeInterval: 60
    }
  })).data.items;
  expect(segmentA.length).toBeGreaterThan(0);
  expect(segmentB.length).toBeGreaterThan(0);
  expect(segmentA[0].createDate < segmentB[0].createDate).toBe(true);
});
