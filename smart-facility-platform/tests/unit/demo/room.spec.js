import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import {getDemoRoomDetail} from '../../../src/mock/fixtures/room';

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

test('room detail requires auth', async () => {
  expect((await client.get('/room/detail', {params: {id: 950001}})).data.code).toBe(2);
});

test('room detail and companion lists match RoomDrawerNew open contract', async () => {
  await establishSession();
  const detail = (await client.get('/room/detail', {params: {id: 950001}})).data;
  expect(detail.code).toBe(1);
  expect(detail.items).toEqual(getDemoRoomDetail(950001));
  expect(detail.items).toMatchObject({
    id: 950001,
    name: '演示房间 A',
    no: expect.any(String),
    floorName: '1F',
    departmentName: expect.any(String),
    senorStatus: expect.any(Number),
    status: expect.any(Number),
    openTwoSystem: 1
  });

  const overview = (await client.get('/map/floor/overview', {params: {floorId: 930001}})).data;
  expect(overview.items.labList.every(room => room.isEdit === true)).toBe(true);

  expect((await client.get('/room/things/list', {params: {roomId: 950001}})).data.items.list).toEqual([]);
  const monitor = (await client.get('/room/monitor/instrument', {params: {roomId: 950001}})).data;
  expect(monitor.code).toBe(1);
  expect(monitor.items.length).toBeGreaterThan(0);
  expect(monitor.items[0]).toMatchObject({id: expect.any(Number), name: expect.any(String), simpleEquipments: expect.any(Array)});
  expect((await client.post('/roomReport/list', {roomId: 950001, pageNum: 1, pageSize: 10})).data.items.list).toEqual([]);
  expect((await client.get('/thingsUser/list', {params: {thingId: 950001, pageNum: 1, pageSize: 10}})).data.items.list).toEqual([]);
  expect((await client.get('/monitorIndicator/getOpenMonitorFlag', {params: {objId: 950001, objType: 3}})).data.items.list).toEqual([]);
});

test('unknown room fails; room things/add rejects invalid hardware bind', async () => {
  await establishSession();
  expect((await client.get('/room/detail', {params: {id: 999999}})).data.code).toBe(0);
  // Bound from hardware detail; empty/invalid body must not fake-succeed.
  expect((await client.post('/room/things/add', {})).data.code).toBe(0);
});
