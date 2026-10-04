import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import {
  clearRoomCreated,
  clearRoomMeta,
  clearRoomDeleted,
  createDemoRoom,
  updateDemoRoomBasic,
  removeDemoRoom,
  listUnplacedRoomsForFloor,
  getDemoRoomDetail
} from '../../../src/mock/fixtures/room';
import {clearFloorCreated, clearFloorMeta} from '../../../src/mock/fixtures/mapFloor';
import {createSeqLock, settleLatestList} from '../../../src/utils/demoRequestSeq';

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

test('map lab list requires auth', async () => {
  expect((await client.get('/map/lab', {params: {floorId: 930001}})).data.code).toBe(2);
});

test('floor 1F returns all business rooms with table fields including unplaced', async () => {
  await establishSession();
  const created = createDemoRoom({
    name: '未布局检测房',
    no: 'MAP-UNPLACED',
    departmentId: 900101,
    floorId: 930001,
    mapUrl: 'demo-room-a'
  });
  expect(created.ok).toBe(true);
  expect(listUnplacedRoomsForFloor(930001).some(row => Number(row.id) === Number(created.item.id))).toBe(true);

  const res = (await client.get('/map/lab', {params: {floorId: '930001'}})).data;
  expect(res.code).toBe(1);
  expect(Array.isArray(res.items)).toBe(true);
  expect(res.items.map(row => row.labId).sort()).toEqual([950001, 950002, 950003, created.item.id].sort());
  const roomA = res.items.find(row => row.labId === 950001);
  expect(roomA).toMatchObject({
    labId: 950001,
    labName: '演示房间 A',
    labMapUrl: 'demo-room-a',
    departmentName: expect.any(String),
    floorName: '1F',
    buildingName: '演示一号楼',
    gardenName: '演示甲园区'
  });
  const corridor = res.items.find(row => row.labId === 950002);
  expect(corridor.labMapUrl).toBe('');
  expect(corridor.labName).toBe('演示走廊');
});

test('unknown or empty floors do not fall back; floorId 0 stays closed', async () => {
  await establishSession();
  const unknown = (await client.get('/map/lab', {params: {floorId: 999999}})).data;
  expect(unknown.code).toBe(1);
  expect(unknown.items).toEqual([]);

  const emptyFloor = (await client.get('/map/lab', {params: {floorId: 930002}})).data;
  expect(emptyFloor.code).toBe(1);
  expect(emptyFloor.items).toEqual([]);

  const missing = (await client.get('/map/lab')).data;
  expect(missing.code).toBe(0);
  expect(missing.items).toBeNull();

  const unbound = (await client.get('/map/lab', {params: {floorId: 0}})).data;
  expect(unbound.code).toBe(1);
  expect(unbound.items).toEqual([]);
  await expect(client.post('/map/bound/lab', {labId: 950001})).rejects.toMatchObject({code: 'MOCK_NOT_IMPLEMENTED'});
});

test('create rename map move and delete stay on the same business source', async () => {
  await establishSession();
  const created = createDemoRoom({
    name: '同步房间',
    no: 'MAP-SYNC',
    departmentId: 900101,
    floorId: 930001,
    mapUrl: 'demo-room-a'
  });
  const id = created.item.id;
  expect((await client.get('/map/lab', {params: {floorId: 930001}})).data.items.some(row => row.labId === id && row.labName === '同步房间')).toBe(true);

  const current = getDemoRoomDetail(id);
  expect(updateDemoRoomBasic({
    ...current,
    name: '同步房间改',
    mapUrl: 'demo-room-b',
    floorId: 930002
  }).ok).toBe(true);
  const afterMove = (await client.get('/map/lab', {params: {floorId: 930001}})).data.items;
  expect(afterMove.some(row => row.labId === id)).toBe(false);
  const onNew = (await client.get('/map/lab', {params: {floorId: 930002}})).data.items.find(row => row.labId === id);
  expect(onNew).toMatchObject({labName: '同步房间改', labMapUrl: 'demo-room-b', floorName: '2F'});

  expect(removeDemoRoom(id).ok).toBe(true);
  expect((await client.get('/map/lab', {params: {floorId: 930002}})).data.items.some(row => row.labId === id)).toBe(false);
});

test('latest list request wins and failure ends loading without empty-success', () => {
  const lock = createSeqLock();
  const first = lock.start();
  const second = lock.start();
  expect(settleLatestList(lock, first, {ok: true, items: [{labId: 1}]})).toEqual({applied: false});
  const okB = settleLatestList(lock, second, {ok: true, items: [{labId: 2}]});
  expect(okB).toEqual({applied: true, loading: false, rows: [{labId: 2}], error: ''});

  const failToken = lock.start();
  expect(settleLatestList(lock, failToken, {ok: false, message: 'boom'})).toEqual({
    applied: true,
    loading: false,
    rows: [],
    error: 'boom'
  });

  const stale = lock.start();
  lock.kill();
  expect(settleLatestList(lock, stale, {ok: true, items: []}).applied).toBe(false);
});

test('floor list rows keep map fields for designer entry and empty floors stay without maps', async () => {
  await establishSession();
  const floors = (await client.get('/map/floor', {params: {buildingId: 920001}})).data;
  expect(floors.code).toBe(1);
  const oneF = floors.items.find(row => row.id === 930001);
  const twoF = floors.items.find(row => row.id === 930002);
  expect(oneF).toMatchObject({id: 930001, name: '1F', mapId: 940001, mapUrl: 'demo-floor-a-1f'});
  expect(twoF.mapUrl).toBe('');
});
