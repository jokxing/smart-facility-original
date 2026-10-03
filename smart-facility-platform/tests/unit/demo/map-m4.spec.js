import storage from '../../../src/mock/storage';
import axios from 'axios';
import qs from 'qs';
import mockAdapter from '../../../src/mock';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import {saveFloorRoomLayout, floorRoomLayout} from '../../../src/mock/fixtures/floorRoomLayout';
import {findFloorById} from '../../../src/mock/fixtures/mapFloor';
import {listRoomMarkersForFloor, listUnplacedRoomsForFloor, getDemoRoomDetail, updateDemoRoomBasic, createDemoRoom, removeDemoRoom} from '../../../src/mock/fixtures/room';

jest.mock('../../../src/mock/captcha', () => ({createCaptchaImage: () => 'test-png-base64'}));

beforeEach(() => storage.clear());
const body = list => ({type: 11, floorId: 930001, mediaId: findFloorById(930001).mapId,
  list: list.map(item => ({type: 11, mediaId: findFloorById(930001).mapId, ...item}))});

test('save replaces floor markers, removed room returns to candidates without deleting entity', () => {
  expect(saveFloorRoomLayout(body([{elementId: 950001, x: 400, y: 200}])).ok).toBe(true);
  expect(listRoomMarkersForFloor(930001).map(room => room.id)).toEqual([950001]);
  expect(listUnplacedRoomsForFloor(930001).some(room => room.id === 950003)).toBe(true);
  expect(getDemoRoomDetail(950003)).toBeTruthy();
  expect(floorRoomLayout(930001).list[0].x).toBe(400);
  expect(saveFloorRoomLayout(body([])).ok).toBe(true);
  expect(listRoomMarkersForFloor(930001)).toHaveLength(0);
});

test('invalid and mixed layouts reject atomically', () => {
  const saved = body([{elementId: 950001, x: 400, y: 200}]);
  saveFloorRoomLayout(saved);
  for (const list of [
    [{elementId: 950001, x: -1, y: 0}],
    [{elementId: 950001, x: NaN, y: 0}],
    [{elementId: 999999, x: 0, y: 0}],
    [{elementId: 950001, x: 0, y: 0}, {elementId: 950001, x: 2, y: 2}],
    [{elementId: 950001, type: 12, x: 0, y: 0}]
  ]) expect(saveFloorRoomLayout(body(list)).ok).toBe(false);
  expect(floorRoomLayout(930001).list).toEqual([{elementId: 950001, x: 400, y: 200}]);
});

test('changing floor clears placement and never brings old coordinates back', () => {
  saveFloorRoomLayout(body([{elementId: 950002, x: 700, y: 450}]));
  const room = getDemoRoomDetail(950002);
  expect(updateDemoRoomBasic({...room, floorId: 930002}).ok).toBe(true);
  expect(listRoomMarkersForFloor(930001)).toHaveLength(0);
  expect(listUnplacedRoomsForFloor(930002).some(item => item.id === 950002)).toBe(true);
  expect(updateDemoRoomBasic({...room, floorId: 930001}).ok).toBe(true);
  expect(listRoomMarkersForFloor(930001)).toHaveLength(0);
});

test('new room can be placed and business deletion clears the layout index', () => {
  const result = createDemoRoom({name: '新增布局房', no: 'M4-NEW', floorId: 930001, departmentId: 900101});
  expect(result.ok).toBe(true);
  expect(saveFloorRoomLayout(body([{elementId: result.item.id, x: 600, y: 200}])).ok).toBe(true);
  expect(listRoomMarkersForFloor(930001)[0].id).toBe(result.item.id);
  expect(removeDemoRoom(result.item.id).ok).toBe(true);
  expect(floorRoomLayout(930001).list).toHaveLength(0);
  expect(listRoomMarkersForFloor(930001)).toHaveLength(0);
});

test('save failure retains the prior persisted floor layout', () => {
  saveFloorRoomLayout(body([{elementId: 950001, x: 400, y: 200}]));
  const write = jest.spyOn(storage, 'setItem').mockImplementationOnce(() => {throw new Error('quota');});
  try {expect(saveFloorRoomLayout(body([])).ok).toBe(false);} finally {write.mockRestore();}
  expect(floorRoomLayout(930001).list).toHaveLength(1);
});

test('API requires a session and floor schema does not accept device elements', async () => {
  const previous = process.env.VUE_APP_DEMO;
  process.env.VUE_APP_DEMO = 'true';
  try {
    const client = axios.create({baseURL: DEMO_BASE_URL, adapter: mockAdapter});
    expect((await client.post('/map/element/config', body([]))).data.code).toBe(2);
    const captcha = await client.get('/captchaCode');
    const sessionId = captcha.data.items.sessionId;
    client.defaults.headers.common.Authorization = sessionId;
    await client.post('/login', qs.stringify({...DEMO_CREDENTIALS, sessionId}));
    expect((await client.post('/map/element/config', body([]))).data.code).toBe(1);
    expect((await client.post('/map/element/config', body([{elementId: 950001, type: 12, x: 10, y: 10}]))).data.code).toBe(0);
  } finally {process.env.VUE_APP_DEMO = previous;}
});
