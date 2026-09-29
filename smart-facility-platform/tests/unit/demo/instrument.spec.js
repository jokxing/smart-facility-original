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
