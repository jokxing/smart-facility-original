import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import {
  clearInstrumentCreated,
  clearInstrumentDeleted,
  clearInstrumentMeta,
  getInstrumentDashboardNew,
  importDemoInstruments,
  listInstruments,
  listRoonInstrumentInfo
} from '../../../src/mock/fixtures/instrument';
import {listBindableCatalog} from '../../../src/mock/fixtures/equipment';
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
  clearInstrumentCreated();
  clearInstrumentDeleted();
  clearInstrumentMeta();
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

function formWithCsv(csv) {
  const fd = new FormData();
  fd.append('files', new Blob([csv], {type: 'text/csv'}), '设备导入.csv');
  return fd;
}

const DEFAULT_CSV = '\uFEFF名称,部门ID,分类types,房间ID\n演示导入设备,900101,1,950002\n';
const CUSTOM_CSV = '\uFEFF名称,部门ID,分类types,房间ID\n演示导入记录,900102,1,950003\n';

test('import requires auth', async () => {
  expect((await client.post('/instrument/import', formWithCsv(DEFAULT_CSV))).data.code).toBe(2);
});

test('import parses csv row into list dashboard detail bindable', async () => {
  await establishSession();
  expect((await client.post('/instrument/import', {})).data.code).toBe(0);

  const beforeLayout = listRoonInstrumentInfo(950001).list.length;
  const res = (await client.post('/instrument/import', formWithCsv(CUSTOM_CSV))).data;
  expect(res.code).toBe(1);
  expect(res.items).toMatchObject({
    id: 970101,
    name: '演示导入记录',
    departmentId: 900102,
    roomId: 950003,
    types: 1
  });

  const list = (await client.post('/instrument/list', {pageNum: 1, pageSize: 20, keyword: '演示导入记录'})).data;
  expect(list.items.total).toBe(1);
  expect(list.items.list[0]).toMatchObject({
    id: 970101,
    name: '演示导入记录',
    departmentName: '演示研发部',
    roomName: '演示房间 B'
  });

  expect((await client.get('/instrument/dashboard/new')).data.items.totalCount).toBe(13);
  expect(getInstrumentDashboardNew().totalCount).toBe(13);
  expect((await client.get('/instrument/detail', {params: {id: 970101}})).data.items.name).toBe('演示导入记录');
  expect(listBindableCatalog('instrument').some(item => item.id === 970101 && item.name === '演示导入记录')).toBe(true);
  expect(listRoonInstrumentInfo(950001).list).toHaveLength(beforeLayout);
  expect(listInstruments({pageNum: 1, pageSize: 20}).list.some(row => row.id === 970001)).toBe(true);
});

test('import rejects binary xls and missing file; add still blocked', async () => {
  await establishSession();
  expect((await importDemoInstruments({})).ok).toBe(false);
  expect((await client.post('/instrument/add', {name: 'x'})).data.code).toBe(0);

  const ole = new Uint8Array([0xD0, 0xCF, 0x11, 0xE0, 0x00, 0x00]);
  const binaryFail = await importDemoInstruments({files: new Blob([ole])});
  expect(binaryFail.ok).toBe(false);
  expect(binaryFail.message).toContain('CSV');

  const first = await importDemoInstruments({files: new Blob([CUSTOM_CSV], {type: 'text/csv'})});
  expect(first.ok).toBe(true);
  expect(first.name).toBe('演示导入记录');
  const second = await importDemoInstruments({files: new Blob([DEFAULT_CSV], {type: 'text/csv'})});
  expect(second.id).toBe(970102);
  expect(second.name).toBe('演示导入设备');
});
