jest.mock('../../../src/mock/captcha', () => ({createCaptchaImage: () => 'test-png-base64'}));

import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';

let client;
let sessionId;

beforeEach(() => {
  storage.clear();
  client = axios.create({baseURL: DEMO_BASE_URL, adapter: mockAdapter});
});

async function captcha() {
  const response = await client.get('/captchaCode', {params: {sessionId}});
  sessionId = response.data.items.sessionId;
  client.defaults.headers.common.Authorization = sessionId;
  storage.setItem('sessionId', sessionId);
  return response.data;
}

async function login() {
  return (await client.post('/login', qs.stringify({...DEMO_CREDENTIALS, sessionId}))).data;
}

async function establishSession() {
  await captcha();
  const result = await login();
  storage.setItem('token', result.items.token);
  return result;
}

test('pipette list stats exclude empty slots and compute timeout', async () => {
  await establishSession();
  const stats = await client.post('/gun/pipette/statistics', {});
  expect(stats.data.code).toBe(1);
  expect(stats.data.items.totalNum).toBe(4);
  expect(stats.data.items.homingNum).toBe(2);
  expect(stats.data.items.noHomingNum).toBe(1);
  expect(stats.data.items.errorHomingNum).toBe(1);

  const list = await client.post('/gun/pipette/listV1', {pageNum: 1, pageSize: 10});
  expect(list.data.items.total).toBe(4);
  expect(list.data.items.list.every(row => row.no && row.no !== 'null')).toBe(true);

  const timed = await client.post('/gun/pipette/listV1', {status: 2, pageNum: 1, pageSize: 10});
  expect(timed.data.items.list[0].no).toBe('PG-003');
  expect(timed.data.items.list[0].hour).toBeGreaterThanOrEqual(24);

  const bind = await client.post('/gun/pipette/binding/list', {gunRackId: 980023, pageNum: 1, pageSize: 10});
  expect(bind.data.items.list.length).toBe(4);
  expect(bind.data.items.list[3].no).toBe('null');
});

test('simulate take then return keeps records and blocks illegal ops', async () => {
  await establishSession();
  const offline = await client.post('/gun/take/pipette', {gunRackId: 980024});
  expect(offline.data.code).toBe(0);

  const req = await client.post('/gun/take/pipette', {gunRackId: 980023, userId: 900001});
  expect(req.data.code).toBe(1);
  expect(req.data.items.status).toBe(0);
  const dup = await client.post('/gun/take/pipette', {gunRackId: 980023});
  expect(dup.data.code).toBe(0);

  const poll = await client.get('/gun/take', {params: {gunRackId: 980023}});
  expect(poll.data.items.status).toBe(1);
  expect(poll.data.items.gunId).toBe(991002);
  expect(poll.data.items.simulated).toBe(true);

  const taken = await client.get('/gun/pipette/detail', {params: {gunId: 991002}});
  expect(taken.data.items.homingStatus).toBe(0);

  const alreadyHome = await client.post('/gun/return/pipette', {gunId: 991004});
  expect(alreadyHome.data.code).toBe(0);

  const ret = await client.post('/gun/return/pipette', {gunId: 991002});
  expect(ret.data.code).toBe(1);
  expect(ret.data.items.homingStatus).toBe(1);

  const hist = await client.post('/gun/pipette/history', {gunId: 991002, pageNum: 1, pageSize: 20});
  expect(hist.data.items.list.some(row => row.homingTime)).toBe(true);

  const unknown = await client.get('/gun/pipette/detail', {params: {gunId: 1}});
  expect(unknown.data.code).toBe(0);
});

test('timeout return updates list stats slots and history', async () => {
  await establishSession();
  const before = await client.post('/gun/pipette/statistics', {});
  expect(before.data.items.errorHomingNum).toBe(1);
  const ret = await client.post('/gun/return/pipette', {gunId: 991003});
  expect(ret.data.code).toBe(1);
  expect(ret.data.items.homingStatus).toBe(1);
  const take = Date.parse(String(ret.data.items.takeOutTime).replace(' ', 'T') + '+08:00');
  const home = Date.parse(String(ret.data.items.homingTime).replace(' ', 'T') + '+08:00');
  expect(home).toBeGreaterThanOrEqual(take);

  const stats = await client.post('/gun/pipette/statistics', {});
  expect(stats.data.items.errorHomingNum).toBe(0);
  expect(stats.data.items.homingNum).toBe(3);
  expect(stats.data.items.noHomingNum).toBe(1);

  const timed = await client.post('/gun/pipette/listV1', {status: 2, pageNum: 1, pageSize: 10});
  expect(timed.data.items.total).toBe(0);
  const onRack = await client.post('/gun/pipette/listV1', {status: 1, pageNum: 1, pageSize: 10});
  expect(onRack.data.items.list.some(row => row.no === 'PG-003')).toBe(true);

  const bind = await client.post('/gun/pipette/binding/list', {gunRackId: 980023, pageNum: 1, pageSize: 10});
  expect(bind.data.items.list.find(row => row.no === 'PG-003').homingStatus).toBe(1);

  const hist = await client.post('/gun/pipette/history', {gunId: 991003, pageNum: 1, pageSize: 20});
  expect(hist.data.items.list.some(row => row.homingTime)).toBe(true);

  const dup = await client.post('/gun/return/pipette', {gunId: 991003});
  expect(dup.data.code).toBe(0);
});
