import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import {clearFloorCreated, clearFloorMeta, listFloorsByBuildingId, findFloorById} from '../../../src/mock/fixtures/mapFloor';
import {
  clearRoomCreated,
  clearRoomMeta,
  clearRoomDeleted,
  createDemoRoom,
  removeDemoRoom,
  getDemoRoomDetail,
  allDemoRoomRows
} from '../../../src/mock/fixtures/room';
import {resolveFloorMapUrl} from '../../../src/utils/demoFloorMapUrl';
import {isDemoMediaKey} from '../../../src/utils/demoMediaStore';

jest.mock('../../../src/mock/captcha', () => ({createCaptchaImage: () => 'test-png-base64'}));

test('missing stored image rejects floor creation without writing an entity', async () => {
  await establishSession();
  const before = listFloorsByBuildingId(920001).length;
  const result = await client.post('/map/floor', {name: '缺失底图层', buildingId: 920001, media: {url: 'demo-media-missing'}});
  expect(result.data.code).toBe(0);
  expect(listFloorsByBuildingId(920001)).toHaveLength(before);
});

test('floor rename propagates to existing room detail and list', async () => {
  await establishSession();
  const result = await client.put('/map/floor', {id: 930001, name: '改名楼层', buildingId: 920001, media: {url: 'demo-floor-a-1f'}});
  expect(result.data.code).toBe(1);
  expect(getDemoRoomDetail(950001).floorName).toBe('改名楼层');
  expect(allDemoRoomRows().find(row => row.id === 950001).floorName).toBe('改名楼层');
});

test('storage failure returns an explicit failure envelope', async () => {
  await establishSession();
  const write = jest.spyOn(storage, 'setItem').mockImplementationOnce(() => {throw new Error('quota');});
  try {
    const result = await client.post('/map/floor', {name: '写入失败层', buildingId: 920001, media: {url: 'demo-floor-a-1f'}});
    expect(result.data.code).toBe(0);
    expect(listFloorsByBuildingId(920001).some(row => row.name === '写入失败层')).toBe(false);
  } finally {write.mockRestore();}
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
  clearFloorCreated();
  clearFloorMeta();
  clearRoomCreated();
  clearRoomMeta();
  clearRoomDeleted();
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

test('floor list/create/update require auth and persist under building', async () => {
  expect((await client.get('/map/floor', {params: {buildingId: 920001}})).data.code).toBe(2);
  await establishSession();
  const listed = (await client.get('/map/floor', {params: {buildingId: 920001}})).data;
  expect(listed.code).toBe(1);
  expect(listed.items.some(f => f.id === 930001 && f.mapUrl === 'demo-floor-a-1f')).toBe(true);

  const created = (await client.post('/map/floor', {
    name: '演示4F',
    buildingId: 920001,
    media: {url: 'demo-floor-a-1f', uid: 'seed'}
  })).data;
  expect(created.code).toBe(1);
  expect(created.items.id).toBeGreaterThanOrEqual(931201);
  expect(listFloorsByBuildingId(920001).some(f => f.id === created.items.id)).toBe(true);

  const updated = (await client.put('/map/floor', {
    id: created.items.id,
    name: '演示4F改',
    buildingId: 920001,
    media: {url: 'demo-floor-a-1f', uid: 'seed'}
  })).data;
  expect(updated.code).toBe(1);
  expect(findFloorById(created.items.id).name).toBe('演示4F改');

  expect((await client.post('/map/floor', {name: '无图', buildingId: 920001, media: {url: ''}})).data.code).toBe(0);
  expect((await client.delete('/map/floor', {params: {floorId: created.items.id}})).data.code).toBe(0);
});

test('room add/update/remove with association guard', async () => {
  await establishSession();
  const add = (await client.post('/room/add', {
    name: '新建空房间',
    no: 'DEMO-R-NEW1',
    departmentId: 900101,
    floorId: 930001,
    remark: 'm2'
  })).data;
  expect(add.code).toBe(1);
  expect(add.items.id).toBeGreaterThanOrEqual(950201);
  expect(allDemoRoomRows().some(r => r.id === add.items.id)).toBe(true);

  const edit = (await client.post('/room/update/basic', {
    id: add.items.id,
    name: '新建空房间改',
    no: 'DEMO-R-NEW1',
    departmentId: 900101,
    floorId: 930001,
    remark: ''
  })).data;
  expect(edit.code).toBe(1);
  expect(getDemoRoomDetail(add.items.id).name).toBe('新建空房间改');

  // Seed room with devices cannot delete
  const blocked = (await client.post('/room/remove/950001')).data;
  expect(blocked.code).toBe(0);

  const removed = (await client.post('/room/remove/' + add.items.id)).data;
  expect(removed.code).toBe(1);
  expect(getDemoRoomDetail(add.items.id)).toBe(null);

  // Cross-building move with devices rejected
  const cross = (await client.post('/room/update/basic', {
    id: 950001,
    name: '演示房间 A',
    no: 'DEMO-R-950001',
    departmentId: 900101,
    floorId: 930101
  })).data;
  expect(cross.code).toBe(0);
});

test('resolveFloorMapUrl keeps built-in keys and rejects raw blob urls', () => {
  expect(resolveFloorMapUrl('demo-floor-a-1f')).toBe('/demo/floors/floor-a-1f.svg');
  expect(resolveFloorMapUrl('blob:http://127.0.0.1/x')).toBe(null);
  expect(isDemoMediaKey('demo-media-abc-1')).toBe(true);
  expect(isDemoMediaKey('demo-floor-a-1f')).toBe(false);
});

test('createDemoRoom helper rejects bad parent', () => {
  const bad = createDemoRoom({name: 'x', no: 'N1', departmentId: 900101, floorId: 999999});
  expect(bad.ok).toBe(false);
  const delMissing = removeDemoRoom(999999);
  expect(delMissing.ok).toBe(false);
});
