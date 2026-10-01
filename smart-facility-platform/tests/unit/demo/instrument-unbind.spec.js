import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import {
  clearInstrumentDeleted,
  clearInstrumentMeta,
  listInstruments,
  removeInstrument
} from '../../../src/mock/fixtures/instrument';
import {
  addEquipmentInstrumentBinding,
  listBoundEquipmentTypesForInstrument,
  resetEquipmentBindings,
  unbindInstrumentHardware
} from '../../../src/mock/fixtures/equipment';
import {resetDemoScenario} from '../../../src/mock/fixtures/scenario';

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
  clearInstrumentDeleted();
  clearInstrumentMeta();
  resetEquipmentBindings();
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

test('unbind requires authentication', async () => {
  expect((await client.get('/instrument/unbind', {params: {instrumentId: 970001}})).data.code).toBe(2);
});

test('bound instrument cannot delete until unbind clears bindings', async () => {
  await establishSession();
  expect(addEquipmentInstrumentBinding({equipmentId: 980001, thingsId: 970001}).ok).toBe(true);
  expect(listBoundEquipmentTypesForInstrument(970001).length).toBeGreaterThan(0);
  expect(listInstruments({pageNum: 1, pageSize: 20}).list.find(r => r.id === 970001).boundHardware).toBe(true);

  const blocked = (await client.post('/instrument/remove/970001')).data;
  expect(blocked.code).toBe(0);
  expect(blocked.message).toContain('先解绑');
  expect(removeInstrument(970001).ok).toBe(false);

  const batch = (await client.post('/instrument/batch/delete', {ids: [970001, 970002]})).data;
  expect(batch.code).toBe(0);
  expect(batch.message).toContain('绑定');
  expect(listInstruments({pageNum: 1, pageSize: 20}).list.some(r => r.id === 970002)).toBe(true);

  const unbound = (await client.get('/instrument/unbind', {params: {instrumentId: 970001}})).data;
  expect(unbound.code).toBe(1);
  expect(unbound.items.count).toBe(1);
  expect(listBoundEquipmentTypesForInstrument(970001)).toEqual([]);
  expect(listInstruments({pageNum: 1, pageSize: 20}).list.find(r => r.id === 970001).boundHardware).toBe(false);

  const removed = (await client.post('/instrument/remove/970001')).data;
  expect(removed.code).toBe(1);
  expect(listInstruments({pageNum: 1, pageSize: 20}).list.every(r => r.id !== 970001)).toBe(true);
});

test('unbind rejects when not bound or unknown', async () => {
  await establishSession();
  expect(unbindInstrumentHardware(970001).message).toContain('未绑定');
  expect((await client.get('/instrument/unbind', {params: {instrumentId: 970001}})).data.code).toBe(0);
  expect(unbindInstrumentHardware(999999).ok).toBe(false);
});
