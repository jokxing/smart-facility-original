import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import {DEMO_MODEL_PENDING} from '../../../src/mock/fixtures/space';
import {DEMO_FLOOR_ROOMS, listFloorOverview} from '../../../src/mock/fixtures/floor';
import {DEMO_FLOOR_MAP_REGISTRY, resolveFloorMapUrl} from '../../../src/utils/demoFloorMapUrl';

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

test('floor overview requires auth', async () => {
  expect((await client.get('/map/floor/overview', {params: {floorId: 930001}})).data.code).toBe(2);
});

test('wired floor returns synthetic labList markers with confirmed fields', async () => {
  await establishSession();
  expect(DEMO_MODEL_PENDING.floorMapUrlReady).toBe(true);

  const overview = (await client.get('/map/floor/overview', {params: {floorId: 930001}})).data;
  expect(overview.code).toBe(1);
  expect(overview.items.mapUrl).toBe('demo-floor-a-1f');
  expect(resolveFloorMapUrl(overview.items.mapUrl)).toBe(DEMO_FLOOR_MAP_REGISTRY['demo-floor-a-1f']);
  expect(overview.items.labList).toHaveLength(DEMO_FLOOR_ROOMS[930001].length);
  expect(overview.items.labList.map(r => r.name)).toEqual(['演示房间 A', '演示走廊', '演示房间 B']);
  overview.items.labList.forEach(room => {
    expect(room).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      x: expect.any(Number),
      y: expect.any(Number),
      width: expect.any(Number),
      fontSize: expect.any(Number),
      color: expect.any(String),
      senorStatus: expect.any(Number),
      equipments: expect.any(Array)
    });
    expect(Array.isArray(room.equipments)).toBe(true);
  });
  expect(overview.items).toEqual(listFloorOverview(930001));
});

test('unwired floors keep empty labList; designer write stays blocked; room list is empty for sidebar', async () => {
  await establishSession();
  expect((await client.get('/map/floor/overview', {params: {floorId: 930002}})).data.items.labList).toEqual([]);
  expect((await client.get('/map/floor/overview', {params: {floorId: 999999}})).data.items.labList).toEqual([]);
  const rooms = (await client.post('/room/list', {floorId: 930001, pageNum: 1, pageSize: 10000})).data;
  expect(rooms.code).toBe(1);
  expect(rooms.items.list).toEqual([]);
  expect(rooms.items.total).toBe(0);
  // Floor room-marker writes (type:11) stay rejected; empty body is also rejected.
  expect((await client.post('/map/element/config', [{type: 11, elementId: 950001, x: 1, y: 1}])).data.code).toBe(0);
  expect((await client.post('/map/element/config', {})).data.code).toBe(0);
});
