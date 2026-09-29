import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import {DEMO_SPACE, assertDemoSpaceIntegrity, listBuildingsByGardenId, DEMO_MODEL_PENDING} from '../../../src/mock/fixtures/space';
import {DEMO_MODEL_REGISTRY, resolveBuildingModelUrl} from '../../../src/utils/demoModelUrl';

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

test('map reads require demo auth like other protected routes', async () => {
  expect((await client.get('/map/garden/list')).data.code).toBe(2);
  expect((await client.get('/map/building', {params: {gardenId: 910001}})).data.code).toBe(2);
});

test('garden list and building filter preserve Building.vue contracts and parent-child ids', async () => {
  await establishSession();
  const integrity = assertDemoSpaceIntegrity();
  expect(integrity.gardenCount).toBe(2);

  const gardens = (await client.get('/map/garden/list')).data;
  expect(gardens.code).toBe(1);
  expect(gardens.items).toEqual(DEMO_SPACE.map(({gardenId, gardenName}) => ({gardenId, gardenName})));
  gardens.items.forEach(item => {
    expect(item).toEqual({gardenId: expect.any(Number), gardenName: expect.any(String)});
    expect(Object.keys(item).sort()).toEqual(['gardenId', 'gardenName']);
  });

  const east = (await client.get('/map/building', {params: {gardenId: 910001}})).data;
  const west = (await client.get('/map/building', {params: {gardenId: '910002'}})).data;
  const missing = (await client.get('/map/building', {params: {gardenId: 999999}})).data;

  expect(east.code).toBe(1);
  expect(west.code).toBe(1);
  expect(east.items.map(item => item.id)).toEqual([920001, 920002]);
  expect(west.items.map(item => item.id)).toEqual([920101]);
  expect(missing.items).toEqual([]);
  expect(east.items.map(item => item.id)).not.toEqual(west.items.map(item => item.id));

  const first = east.items[0];
  expect(first).toMatchObject({id: 920001, name: '演示一号楼', url: 'demo-building-a'});
  expect(first.subDivisions.map(floor => floor.id)).toEqual([930001, 930002, 930003]);
  first.subDivisions.forEach(floor => {
    expect(floor).toEqual({
      id: expect.any(Number),
      name: expect.any(String),
      mapId: expect.any(Number),
      mapUrl: expect.any(String)
    });
  });
  expect(first.subDivisions[0].mapUrl).toBe('demo-floor-a-1f');
  expect(first.subDivisions[1].mapUrl).toBe('');

  expect(east.items).toEqual(listBuildingsByGardenId(910001));
  expect((await client.get('/map/building', {params: {gardenId: 910001}})).data.items).toEqual(east.items);
});

test('building urls resolve through registered local models; one floor map is wired', async () => {
  await establishSession();
  expect(DEMO_MODEL_PENDING.buildingUrlReady).toBe(true);
  expect(DEMO_MODEL_PENDING.floorMapUrlReady).toBe(true);

  const buildings = (await client.get('/map/building', {params: {gardenId: 910001}})).data.items
    .concat((await client.get('/map/building', {params: {gardenId: 910002}})).data.items);
  expect(buildings).toHaveLength(3);
  buildings.forEach(building => {
    expect(Object.prototype.hasOwnProperty.call(DEMO_MODEL_REGISTRY, building.url)).toBe(true);
    expect(resolveBuildingModelUrl(building.url)).toBe(DEMO_MODEL_REGISTRY[building.url]);
  });
  const wired = buildings[0].subDivisions.find(floor => floor.id === 930001);
  const pending = buildings[0].subDivisions.find(floor => floor.id === 930002);
  expect(wired.mapUrl).toBe('demo-floor-a-1f');
  expect(pending.mapUrl).toBe('');

  expect(resolveBuildingModelUrl('')).toBeNull();
  expect(resolveBuildingModelUrl('https://example.invalid/x.glb')).toBeNull();
  expect(resolveBuildingModelUrl('../secret.glb')).toBeNull();
  expect(resolveBuildingModelUrl('/demo/models/not-registered.glb')).toBeNull();
  await expect(client.get('/map/floor/not-wired')).rejects.toMatchObject({code: 'MOCK_NOT_IMPLEMENTED'});
});
