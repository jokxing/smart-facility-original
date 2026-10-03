import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import {clearFloorCreated, clearFloorMeta, listFloorsByBuildingId} from '../../../src/mock/fixtures/mapFloor';
import {
  clearRoomCreated,
  clearRoomMeta,
  clearRoomDeleted,
  listUnplacedRoomsForFloor,
  isRoomPlacedOnFloor
} from '../../../src/mock/fixtures/room';
import {listRoomTree} from '../../../src/mock/fixtures/roomTree';

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

test('created floor appears under building and overview returns mapUrl/name without ghost markers', async () => {
  await establishSession();
  const created = (await client.post('/map/floor', {
    name: 'M3演示层',
    buildingId: 920001,
    media: {url: 'demo-floor-a-1f', uid: 'm3'}
  })).data;
  expect(created.code).toBe(1);
  const floorId = created.items.id;

  const buildings = (await client.get('/map/building', {params: {gardenId: 910001}})).data;
  expect(buildings.code).toBe(1);
  const building = buildings.items.find(b => b.id === 920001);
  expect(building.subDivisions.some(f => f.id === floorId && f.name === 'M3演示层' && f.mapUrl === 'demo-floor-a-1f')).toBe(true);
  expect(listFloorsByBuildingId(920001).some(f => f.id === floorId)).toBe(true);

  const overview = (await client.get('/map/floor/overview', {params: {floorId}})).data;
  expect(overview.code).toBe(1);
  expect(overview.items).toMatchObject({
    floorId,
    floorName: 'M3演示层',
    mapUrl: 'demo-floor-a-1f',
    labList: []
  });

  const renamed = (await client.put('/map/floor', {
    id: floorId,
    name: 'M3演示层改',
    buildingId: 920001,
    media: {url: 'demo-floor-a-1f', uid: 'm3'}
  })).data;
  expect(renamed.code).toBe(1);
  const ov2 = (await client.get('/map/floor/overview', {params: {floorId}})).data;
  expect(ov2.items.floorName).toBe('M3演示层改');
});

test('unplaced room appears in designer list only; delete clears overview and candidates', async () => {
  await establishSession();
  const floor = (await client.post('/map/floor', {
    name: 'M3候选层',
    buildingId: 920001,
    media: {url: 'demo-floor-a-1f', uid: 'm3'}
  })).data.items;

  const room = (await client.post('/room/add', {
    name: 'M3空房间',
    no: 'M3-R-001',
    departmentId: 900101,
    floorId: floor.id,
    buildingId: 920001,
    remark: ''
  })).data;
  expect(room.code).toBe(1);
  const roomId = room.items.id;

  expect(isRoomPlacedOnFloor(roomId, floor.id)).toBe(false);
  expect(listUnplacedRoomsForFloor(floor.id).some(r => r.id === roomId)).toBe(true);

  const overview = (await client.get('/map/floor/overview', {params: {floorId: floor.id}})).data;
  expect(overview.items.labList).toEqual([]);
  expect(overview.items.labList.some(r => Number(r.x) <= -1000)).toBe(false);

  const designer = (await client.post('/room/list', {floorId: floor.id, pageNum: 1, pageSize: 10000})).data;
  expect(designer.code).toBe(1);
  expect(designer.items.total).toBe(1);
  expect(designer.items.list[0]).toMatchObject({id: roomId, name: 'M3空房间', floorId: floor.id});

  // Management list (with gardenId) still sees the room.
  const managed = (await client.post('/room/list', {
    floorId: floor.id, pageNum: 1, pageSize: 10, gardenId: 910001
  })).data;
  expect(managed.items.total).toBe(1);

  const renamed = (await client.post('/room/update/basic', {
    id: roomId,
    name: 'M3空房间改',
    no: 'M3-R-001',
    departmentId: 900101,
    floorId: floor.id,
    buildingId: 920001,
    remark: ''
  })).data;
  expect(renamed.code).toBe(1);
  const designer2 = (await client.post('/room/list', {floorId: floor.id, pageNum: 1, pageSize: 10000})).data;
  expect(designer2.items.list[0].name).toBe('M3空房间改');

  expect((await client.post('/room/remove/' + roomId)).data.code).toBe(1);
  expect((await client.get('/map/floor/overview', {params: {floorId: floor.id}})).data.items.labList).toEqual([]);
  expect((await client.post('/room/list', {floorId: floor.id, pageNum: 1, pageSize: 10000})).data.items.total).toBe(0);
});

test('seed placed rooms stay on overview; room tree includes created floor/room', async () => {
  await establishSession();
  const overview = (await client.get('/map/floor/overview', {params: {floorId: 930001}})).data;
  expect(overview.items.labList.map(r => r.id).sort()).toEqual([950001, 950002, 950003]);
  expect(overview.items.labList.every(r => r.x > -1000 && r.y > -1000)).toBe(true);

  const floor = (await client.post('/map/floor', {
    name: 'M3树层',
    buildingId: 920001,
    media: {url: 'demo-floor-a-1f', uid: 'm3'}
  })).data.items;
  const room = (await client.post('/room/add', {
    name: '树房间',
    no: 'M3-TREE-1',
    departmentId: 900101,
    floorId: floor.id,
    buildingId: 920001
  })).data.items;

  const tree = listRoomTree({});
  const building = tree[0].children.find(b => b.id === 920001);
  const floorNode = building.children.find(f => f.id === floor.id);
  expect(floorNode).toBeTruthy();
  expect(floorNode.children.some(r => r.id === room.id && r.name === '树房间')).toBe(true);
});

test('floor marker save remains blocked (M4)', async () => {
  await establishSession();
  expect((await client.post('/map/element/config', [{type: 11, elementId: 950001, x: 10, y: 10}])).data.code).toBe(0);
});
