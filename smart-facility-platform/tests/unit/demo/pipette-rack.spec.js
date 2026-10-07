jest.mock('../../../src/mock/captcha', () => ({createCaptchaImage: () => 'test-png-base64'}));

import axios from 'axios';
import qs from 'qs';
import {
  getEquipmentDashboardOverview,
  listDevices
} from '../../../src/mock/fixtures/equipment';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import fs from 'fs';
import path from 'path';

test('gun rack paging normalizes fractional and non-finite input', () => {
  const pack = listDevices({equipmentType: 13, pageNum: Infinity, pageSize: Infinity});
  expect(pack.pageNum).toBe(1);
  expect(pack.pageSize).toBe(10);
  expect(pack.list).toHaveLength(2);
  expect(listDevices({equipmentType: 13, pageNum: 1.9, pageSize: 1.9}).list).toHaveLength(1);
});

test('rack page ignores an old filter response and clears loading on failure', async () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../../../src/views/pipetteGunRack/index.vue'), 'utf8');
  const body = source.match(/getList\(\)\s*\{([\s\S]*?)\r?\n\s*\},\r?\n\s*getRowKey/)[1];
  const jobs = [];
  const getList = new Function('getDeviceList', 'return function () {' + body + '}')(
    () => new Promise(resolve => jobs.push(resolve))
  );
  const page = {items: {status: 0}, $message: {error: jest.fn()}};
  getList.call(page);
  page.items.status = -100;
  getList.call(page);
  jobs[1]({code: 1, items: {list: [{id: 980024}], total: 1}});
  await new Promise(resolve => setTimeout(resolve, 0));
  jobs[0]({code: 1, items: {list: [{id: 980023}], total: 1}});
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(page.pipetteGun[0].id).toBe(980024);
  expect(page.loading).toBe(false);
  getList.call(page);
  jobs[2]({code: 0, message: '模拟失败'});
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(page.pipetteGun).toEqual([]);
  expect(page.loading).toBe(false);
});

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

test('gun rack dashboard counts match type=13 list universe', () => {
  const dash = getEquipmentDashboardOverview({equipmentType: 13});
  expect(dash).toMatchObject({total: 2, normalCount: 1, offLineCount: 1, noActivatedCount: 0});
  const list = listDevices({equipmentType: 13, pageNum: 1, pageSize: 10, status: 0});
  expect(list.total).toBe(dash.total);
  expect(list.list).toHaveLength(2);
  expect(list.list.every(row => row.equipmentTypeCode === 13)).toBe(true);
  expect(list.list.find(row => row.id === 980023).roomName).toBe('演示房间 A');
  expect(list.list.find(row => row.id === 980024).userName).toBe('演示用户');
});

test('gun rack list filters keyword status and resets pagination contract', async () => {
  await establishSession();
  const all = await client.post('/device/list', {equipmentType: 13, pageNum: 1, pageSize: 10, status: 0});
  expect(all.data.code).toBe(1);
  expect(all.data.items.total).toBe(2);

  const online = await client.post('/device/list', {equipmentType: 13, pageNum: 1, pageSize: 10, status: 1});
  expect(online.data.items.total).toBe(1);
  expect(online.data.items.list[0].id).toBe(980023);

  const offline = await client.post('/device/list', {equipmentType: 13, pageNum: 1, pageSize: 10, status: -100});
  expect(offline.data.items.total).toBe(1);
  expect(offline.data.items.list[0].id).toBe(980024);

  const kw = await client.post('/device/list', {equipmentType: 13, pageNum: 1, pageSize: 10, status: 0, keyword: 'EQ-GR-002'});
  expect(kw.data.items.total).toBe(1);
  expect(kw.data.items.list[0].no).toBe('EQ-GR-002');

  const empty = await client.post('/device/list', {equipmentType: 13, pageNum: 1, pageSize: 10, status: 0, keyword: 'NO-SUCH-RACK'});
  expect(empty.data.items.total).toBe(0);

  const dash = await client.get('/equipment/dashboard', {params: {equipmentType: 13}});
  expect(dash.data.items.total).toBe(2);
  expect(dash.data.items.normalCount).toBe(1);
  expect(dash.data.items.offLineCount).toBe(1);
});

test('typed dashboard does not change untyped overview contract', () => {
  const overview = getEquipmentDashboardOverview();
  expect(Object.keys(overview).sort()).toEqual(['alarmCount', 'total']);
  expect(overview.total).toBeGreaterThan(2);
});

test('take return syncs rack slots with gun list and rejects offline rack', async () => {
  await establishSession();
  const beforeBind = await client.post('/gun/pipette/binding/list', {gunRackId: 980023, pageNum: 1, pageSize: 10});
  expect(beforeBind.data.items.list.length).toBe(4);
  expect(beforeBind.data.items.list.filter(row => row.no !== 'null').length).toBe(3);
  expect(beforeBind.data.items.list[3].no).toBe('null');
  expect(beforeBind.data.items.list[0].takeOutTime).toBeTruthy();

  const offlineTake = await client.post('/gun/take/pipette', {gunRackId: 980024});
  expect(offlineTake.data.code).toBe(0);

  const req = await client.post('/gun/take/pipette', {gunRackId: 980023, userId: 900001});
  expect(req.data.code).toBe(1);
  const poll = await client.get('/gun/take', {params: {gunRackId: 980023}});
  expect(poll.data.items.status).toBe(1);
  expect(poll.data.items.simulated).toBe(true);

  const afterTake = await client.post('/gun/pipette/binding/list', {gunRackId: 980023, pageNum: 1, pageSize: 10});
  const taken = afterTake.data.items.list.find(row => row.pipetteGunId === poll.data.items.gunId);
  expect(taken.homingStatus).toBe(0);

  const gunList = await client.post('/gun/pipette/listV1', {pageNum: 1, pageSize: 10});
  expect(gunList.data.items.list.find(row => row.pipetteGunId === poll.data.items.gunId).homingStatus).toBe(0);

  const ret = await client.post('/gun/return/pipette', {gunId: poll.data.items.gunId});
  expect(ret.data.code).toBe(1);
  expect(ret.data.items.homingStatus).toBe(1);

  const afterRet = await client.post('/gun/pipette/binding/list', {gunRackId: 980023, pageNum: 1, pageSize: 10});
  expect(afterRet.data.items.list.find(row => row.pipetteGunId === poll.data.items.gunId).homingStatus).toBe(1);

  const refuseWrite = await client.post('/device/remove/batch', {ids: [980023]});
  expect(refuseWrite.data.code).toBe(0);
  const refuseExport = await client.get('/device/output/equipment', {params: {equipmentType: 13}});
  expect(refuseExport.data.code).toBe(0);
});
