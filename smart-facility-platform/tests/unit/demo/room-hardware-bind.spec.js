import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import {
  listBoundEquipmentForRoom,
  listMonitorIndicatorThingsNewList,
  listEquipmentBindings,
  resetEquipmentBindings
} from '../../../src/mock/fixtures/equipment';

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

test('seed room bindings: A has 980010, B has 980018, corridor empty; 980001 stays unbound', () => {
  expect(listBoundEquipmentForRoom(950001)).toEqual([
    expect.objectContaining({id: 980010, equipmentNo: 'EQ-SK-001', equipmentName: expect.any(String)})
  ]);
  expect(listBoundEquipmentForRoom(950003).map(r => r.id)).toEqual([980018]);
  expect(listBoundEquipmentForRoom(950002)).toEqual([]);
  expect(listEquipmentBindings({equipmentIdStr: 980001})).toEqual([]);
  expect(listEquipmentBindings({equipmentIdStr: 980010})[0]).toMatchObject({
    id: 950001, type: 11, name: '演示房间 A'
  });
});

test('things/newList requires auth and pages room hardware from shared bindings', async () => {
  expect((await client.get('/monitorIndicator/things/newList', {
    params: {objId: 950001, objType: 3, pageNum: 1, pageSize: 10}
  })).data.code).toBe(2);

  await establishSession();
  const roomA = (await client.get('/monitorIndicator/things/newList', {
    params: {objId: 950001, objType: 3, pageNum: 1, pageSize: 10}
  })).data;
  expect(roomA.code).toBe(1);
  expect(roomA.items).toEqual(listMonitorIndicatorThingsNewList({
    objId: 950001, objType: 3, pageNum: 1, pageSize: 10
  }));
  expect(roomA.items.total).toBe(1);
  expect(roomA.items.list[0]).toMatchObject({
    equipmentName: expect.any(String),
    equipmentNo: 'EQ-SK-001'
  });

  const corridor = (await client.get('/monitorIndicator/things/newList', {
    params: {objId: 950002, objType: 3, pageNum: 1, pageSize: 10}
  })).data;
  expect(corridor.items.total).toBe(0);
  expect(corridor.items.list).toEqual([]);

  const badType = (await client.get('/monitorIndicator/things/newList', {
    params: {objId: 950001, objType: 9, pageNum: 1, pageSize: 10}
  })).data;
  expect(badType.code).toBe(0);
});

test('hardware bind write still updates reverse room list; reset clears to seed', async () => {
  await establishSession();
  const {
    addEquipmentRoomBinding,
    removeEquipmentBinding
  } = require('../../../src/mock/fixtures/equipment');

  expect(addEquipmentRoomBinding({equipmentId: 980001, thingsId: 950001}).ok).toBe(true);
  const ids = listBoundEquipmentForRoom(950001).map(r => r.id).sort();
  expect(ids).toEqual([980001, 980010]);

  expect(removeEquipmentBinding({equipmentId: 980001, thingsId: 950001, thingsType: 11}).ok).toBe(true);
  expect(listBoundEquipmentForRoom(950001).map(r => r.id)).toEqual([980010]);

  resetEquipmentBindings();
  expect(listBoundEquipmentForRoom(950001).map(r => r.id)).toEqual([980010]);
});
