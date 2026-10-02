import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS, DEMO_MENUS} from '../../../src/mock/fixtures/auth';
import {DEMO_INSTRUMENTS, removeInstrument} from '../../../src/mock/fixtures/instrument';
import {DEMO_MAINTENANCES, listMaintenances} from '../../../src/mock/fixtures/maintenance';

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

async function list(body) {
  return (await client.post('/maintenance/list', body)).data;
}

test('maintenance list and writes require auth', async () => {
  expect((await client.post('/maintenance/list', {pageNum: 1, pageSize: 10})).data.code).toBe(2);
  expect((await client.post('/maintenance/add', {})).data.code).toBe(2);
  expect((await client.post('/maintenance/updateMaintenance', {})).data.code).toBe(2);
  expect((await client.get('/maintenance/complete', {params: {maintenanceId: 960001}})).data.code).toBe(2);
});

test('list pages shared instrument snapshots with source completeFlag only', async () => {
  await establishSession();
  const page1 = await list({pageNum: 1, pageSize: 10});
  expect(page1.code).toBe(1);
  expect(page1.items.total).toBe(14);
  expect(page1.items.list).toHaveLength(10);
  expect(page1.items.list.every(row => [0, 1].includes(row.completeFlag))).toBe(true);
  expect(page1.items.list.every(row => DEMO_INSTRUMENTS.some(item => item.id === row.instrumentId))).toBe(true);
  expect(page1.items.list.every(row => row.instrumentNo === 'DEMO-EQ-' + row.instrumentId)).toBe(true);
  expect(page1.items.list.every(row => row.id !== row.instrumentId)).toBe(true);
  expect(page1.items.list.every(row => row.openTwoSystem === true)).toBe(true);
  const page2 = await list({pageNum: 2, pageSize: 10});
  expect(page2.items.list).toHaveLength(4);
  const ids = page1.items.list.concat(page2.items.list).map(row => row.id).sort();
  expect(ids).toEqual(DEMO_MAINTENANCES.map(item => item.id).sort());
});

test('keyword / department / date / instrument filters and empty result', async () => {
  await establishSession();
  const byName = await list({keyword: '培养箱', pageNum: 1, pageSize: 20});
  expect(byName.items.total).toBe(3);
  expect(byName.items.list.every(row => row.instrumentName.includes('培养箱'))).toBe(true);

  const rd = await list({departmentId: 900102, pageNum: 1, pageSize: 20});
  expect(rd.items.total).toBe(4);
  expect(rd.items.list.every(row => Number(row.departmentId) === 900102)).toBe(true);

  const companyRoot = await list({departmentId: 0, pageNum: 1, pageSize: 20});
  expect(companyRoot.items.total).toBe(14);

  const oneDevice = await list({instrumentId: 970001, pageNum: 1, pageSize: 20});
  expect(oneDevice.items.total).toBe(2);
  expect(oneDevice.items.list.every(row => row.instrumentId === 970001)).toBe(true);

  const empty = await list({keyword: '不存在的维保XYZ', pageNum: 1, pageSize: 10});
  expect(empty.items.total).toBe(0);
  expect(empty.items.list).toEqual([]);

  const recent = listMaintenances({pageNum: 1, pageSize: 20}).list.find(row => row.instrumentId === 970009);
  const ranged = await list({
    startDate: recent.createDate,
    endDate: recent.createDate,
    pageNum: 1,
    pageSize: 20
  });
  expect(ranged.items.list.some(row => row.id === recent.id)).toBe(true);

  const cleared = await list({startDate: '', endDate: '', pageNum: 1, pageSize: 20});
  expect(cleared.items.total).toBe(14);

  const halfDate = await list({startDate: recent.createDate, endDate: '', pageNum: 1, pageSize: 20});
  expect(halfDate.code).toBe(0);
  expect(halfDate.message).toContain('完整');
});

test('invalid date filters are rejected rather than ignored', async () => {
  await establishSession();
  for (const params of [
    {startDate: '2026-02-30 00:00:00', endDate: '2026-09-24 23:59:59'},
    {startDate: '2026-09-24 00:00:00', endDate: '2026-09-01 23:59:59'},
    {startDate: '', endDate: '2026-09-24 23:59:59'}
  ]) {
    expect((await list(params)).code).toBe(0);
  }
  const ranged = await list({startDate: '2026-09-23 00:00:00', endDate: '2026-09-23 23:59:59'});
  expect(ranged.items.list.some(row => row.instrumentId === 970009)).toBe(true);
});

test('pagination keeps filters; page 2 of keyword is empty', async () => {
  await establishSession();
  const page1 = await list({keyword: '培养箱', pageNum: 1, pageSize: 10});
  expect(page1.items.total).toBe(3);
  expect(page1.items.list).toHaveLength(3);
  const page2 = await list({keyword: '培养箱', pageNum: 2, pageSize: 10});
  expect(page2.items.total).toBe(3);
  expect(page2.items.list).toEqual([]);
});

test('deleted instrument keeps historical rows and does not break list', async () => {
  await establishSession();
  const before = await list({keyword: 'DEMO-EQ-970012', pageNum: 1, pageSize: 10});
  expect(before.items.total).toBe(1);
  expect(before.items.list[0].instrumentId).toBe(970012);
  expect(before.items.list[0].openTwoSystem).toBe(true);

  expect(removeInstrument(970012).ok).toBe(true);

  const after = await list({keyword: 'DEMO-EQ-970012', pageNum: 1, pageSize: 10});
  expect(after.items.total).toBe(1);
  expect(after.items.list[0].instrumentName).toBe('演示设备机柜 A');
  expect(after.items.list[0].instrumentNo).toBe('DEMO-EQ-970012');
  expect(after.items.list[0].instrumentDeleted).toBe(true);
  expect(after.items.list[0].openTwoSystem).toBe(false);

  const all = await list({pageNum: 1, pageSize: 20});
  expect(all.items.total).toBe(14);
});

test('menus expose /ld/maintenance not /apply/maintenance', async () => {
  await establishSession();
  expect(DEMO_MENUS.some(menu => menu.path === '/ld/labdevice')).toBe(true);
  const ld = DEMO_MENUS.find(menu => menu.id === 'ld');
  expect(ld.subMenu.some(item => item.path === '/ld/maintenance')).toBe(true);
  expect(DEMO_MENUS.some(menu => menu.path === '/apply/maintenance')).toBe(false);
});
