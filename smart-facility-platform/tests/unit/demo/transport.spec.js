jest.mock('../../../src/mock/captcha', () => ({createCaptchaImage: () => 'test-png-base64'}));

import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import {resetDemoTransport} from '../../../src/mock/fixtures/transport';

test('page catalog and sampleInfoId form contract support create and persisted edit', async () => {
  await establishSession();
  const catalog = await client.post('/sampleInfo/query', {key: 'S-001', pageNum: 1, pageSize: 1});
  expect(catalog.data.items.total).toBe(1);
  const created = await client.post('/transportOrder/add', {
    deliverId: 884001, receiveId: 884002, samples: [{sampleInfoId: catalog.data.items.list[0].id, amount: 2}]
  });
  expect(created.data.code).toBe(1);
  const edited = await client.post('/transportOrder/update', {
    id: 881001, professionNo: 'PN-EDIT', samples: [{sampleInfoId: 885002, amount: 3}]
  });
  expect(edited.data.code).toBe(1);
  const detail = await client.get('/transportOrder/detail/881001');
  expect(detail.data.items.professionNo).toBe('PN-EDIT');
  expect(detail.data.items.sampleInfos[0].sampleId).toBe(885002);
});

test('detail GPS and monitoring use actual page request fields and selected sensor', async () => {
  await establishSession();
  const gps = await client.get('/transportOrder/monitorInfo/gps', {params: {objId: 881005}});
  expect(gps.data.code).toBe(1);
  const tags = await client.get('/monitorIndicator/getOpenMonitorFlag', {params: {objId: 881005, objType: 6}});
  expect(tags.data.code).toBe(1);
  const sensor = tags.data.items.list[0];
  const curve = await client.get('/monitorIndicator/monitorInfo', {params: {objId: 881005, type: 6, objSensorId: sensor.id}});
  expect(curve.data.code).toBe(1);
  expect(curve.data.items.length).toBeGreaterThan(0);
  expect(curve.data.items.some(row => row.data > 8)).toBe(true);
  const invalid = await client.get('/monitorIndicator/monitorInfo', {params: {objId: 1, type: 6, objSensorId: sensor.id}});
  expect(invalid.data.code).toBe(0);
});

test('departure rechecks vehicle occupancy after allocation and leaves failed batch intact', async () => {
  await establishSession();
  await client.post('/transportOrder/change/state', {ids: [881006], state: 3});
  await client.post('/transportOrder/allocateCar', {carId: 882003, driverId: 883003, orderIds: [881001, 881002]});
  await client.post('/transportOrder/change/state', {ids: [881001, 881002], state: 1});
  expect((await client.post('/transportOrder/change/state', {ids: [881001], state: 2})).data.code).toBe(1);
  expect((await client.post('/transportOrder/change/state', {ids: [881002], state: 2})).data.code).toBe(0);
  expect((await client.get('/transportOrder/detail/881002')).data.items.state).toBe(1);
});

let client;
let sessionId;

beforeEach(() => {
  storage.clear();
  resetDemoTransport();
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

test('waybill list stats and query-all vs entity zero', async () => {
  await establishSession();
  const list = await client.post('/transportOrder/query', {pageNum: 1, pageSize: 20});
  expect(list.data.code).toBe(1);
  expect(list.data.items.total).toBe(10);
  const waiting = await client.post('/transportOrder/query', {state: 0, pageNum: 1, pageSize: 20});
  expect(waiting.data.items.total).toBe(3);
  const all = await client.post('/transportOrder/query', {state: null, pageNum: 1, pageSize: 20});
  expect(all.data.items.total).toBe(10);
  const dash = await client.get('/transportOrder/dashboard', {params: {dateType: 3}});
  expect(dash.data.items.totalNum).toBe(10);
  expect(dash.data.items.alarmNum).toBeGreaterThanOrEqual(1);
});

test('state machine rejects skip duplicate and missing vehicle', async () => {
  await establishSession();
  const skip = await client.post('/transportOrder/change/state', {ids: [881001], state: 2});
  expect(skip.data.code).toBe(0);
  const loadEmpty = await client.post('/transportOrder/change/state', {ids: [881001], state: 1});
  expect(loadEmpty.data.code).toBe(0);
  const dup = await client.post('/transportOrder/change/state', {ids: [881003], state: 1});
  expect(dup.data.code).toBe(0);
  const unknown = await client.get('/transportOrder/detail/1');
  expect(unknown.data.code).toBe(0);
});

test('allocate load depart arrive persist and release occupancy', async () => {
  await establishSession();
  const busy = await client.post('/transportOrder/allocateCar', {carId: 882001, driverId: 883001, orderIds: [881001]});
  expect(busy.data.code).toBe(0);

  const arriveC = await client.post('/transportOrder/change/state', {ids: [881006], state: 3});
  expect(arriveC.data.code).toBe(1);
  const carC = await client.get('/refrigerateCar/query', {params: {pageNum: 1, pageSize: 10}});
  expect(carC.data.items.list.find(row => row.id === 882003).carState).toBe(0);

  const okAssign = await client.post('/transportOrder/allocateCar', {
    carId: 882003, driverId: 883002, orderIds: [881002]
  });
  expect(okAssign.data.code).toBe(1);
  const load = await client.post('/transportOrder/change/state', {ids: [881002], state: 1});
  expect(load.data.code).toBe(1);

  const hint = await client.get('/transportOrder/change/getStateInfo', {params: {carId: 882002}});
  expect(hint.data.code).toBe(1);
  expect(hint.data.items.transportOrderStartListVos.length).toBeGreaterThanOrEqual(2);

  const depart = await client.post('/transportOrder/change/state', {
    ids: hint.data.items.transportOrderStartListVos.map(row => row.id),
    state: 2
  });
  expect(depart.data.code).toBe(1);
  const afterDepart = await client.get('/transportOrder/detail/881003');
  expect(afterDepart.data.items.state).toBe(2);

  const token = storage.getItem('token');
  storage.removeItem('token');
  storage.setItem('token', token);
  const again = await client.get('/transportOrder/detail/881006');
  expect(again.data.items.state).toBe(3);
});

test('create uses same catalog and reset restores seeds', async () => {
  await establishSession();
  const created = await client.post('/transportOrder/add', {
    professionNo: 'PN-NEW',
    deliverId: 884001,
    receiveId: 884002,
    samples: [{sampleId: 885001, amount: 2}]
  });
  expect(created.data.code).toBe(1);
  expect(created.data.items.transportNo).toMatch(/^TO-DEMO-/);
  const bad = await client.post('/transportOrder/add', {deliverId: 1, receiveId: 884002, samples: [{sampleId: 885001, amount: 1}]});
  expect(bad.data.code).toBe(0);
  await client.post('/__demo/transport/reset', {});
  const list = await client.post('/transportOrder/query', {pageNum: 1, pageSize: 20});
  expect(list.data.items.total).toBe(10);
});
