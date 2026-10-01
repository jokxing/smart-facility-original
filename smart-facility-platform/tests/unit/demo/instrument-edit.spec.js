import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import {
  clearInstrumentMeta,
  listInstruments,
  listRoonInstrumentInfo,
  updateInstrumentBasic
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

test('update/basic requires auth', async () => {
  expect((await client.post('/instrument/update/basic', {
    id: 970001, name: '改名', departmentId: 900101, types: 1
  })).data.code).toBe(2);
});

test('update/basic persists name department types across list detail layout bindable', async () => {
  await establishSession();
  const res = (await client.post('/instrument/update/basic', {
    id: 970001,
    name: '演示培养箱改名',
    departmentId: 900102,
    types: 2,
    brand: 'ignored',
    logoUrl: 'ignored'
  })).data;
  expect(res.code).toBe(1);
  expect(res.items).toMatchObject({
    id: 970001,
    name: '演示培养箱改名',
    departmentId: 900102,
    departmentName: '演示研发部',
    types: 2,
    typeName: '演示辅助设备'
  });

  const list = (await client.post('/instrument/list', {pageNum: 1, pageSize: 20, keyword: '改名'})).data;
  expect(list.items.total).toBe(1);
  expect(list.items.list[0]).toMatchObject({
    id: 970001,
    name: '演示培养箱改名',
    departmentId: 900102,
    departmentName: '演示研发部',
    types: 2,
    typeName: '演示辅助设备'
  });

  const detail = (await client.get('/instrument/detail', {params: {id: 970001}})).data.items;
  expect(detail.name).toBe('演示培养箱改名');
  expect(detail.departmentName).toBe('演示研发部');
  expect(detail.typeName).toBe('演示辅助设备');

  expect(listRoonInstrumentInfo(950001).list.find(item => item.id === 970001).name).toBe('演示培养箱改名');
  expect(listBindableCatalog('instrument').find(item => item.id === 970001).name).toBe('演示培养箱改名');

  const byDept = listInstruments({departmentIdList: [900102], pageNum: 1, pageSize: 20});
  expect(byDept.list.some(row => row.id === 970001)).toBe(true);
});

test('update/basic rejects unknown id empty name bad department bad types', async () => {
  await establishSession();
  expect((await client.post('/instrument/update/basic', {
    id: 999999, name: 'x', departmentId: 900101, types: 1
  })).data.code).toBe(0);
  expect((await client.post('/instrument/update/basic', {
    id: 970001, name: 'x', departmentId: 900101, types: 1
  })).data.message).toContain('名称');
  expect((await client.post('/instrument/update/basic', {
    id: 970001, name: '合法名称', departmentId: 1, types: 1
  })).data.message).toContain('部门');
  expect((await client.post('/instrument/update/basic', {
    id: 970001, name: '合法名称', departmentId: 900101, types: 99
  })).data.message).toContain('分类');
  expect(updateInstrumentBasic({id: 970001, name: '合法名称', departmentId: 900101, types: 1}).ok).toBe(true);
});

test('edit modal dependency stubs succeed', async () => {
  await establishSession();
  expect((await client.get('/grade/getlist')).data.code).toBe(1);
  expect((await client.get('/file/policy')).data.code).toBe(1);
  expect((await client.get('/file/instrument/pic/search', {params: {title: '', type: 1}})).data.items.list).toEqual([]);
  const tree = (await client.post('/room/tree', {keyword: ''})).data;
  expect(tree.code).toBe(1);
  expect(tree.items[0].children[0].children[0].children.some(r => r.id === 950001)).toBe(true);
});


test('rename enforces same-room uniqueness while allowing unchanged and other-room names', () => {
  const update = name => updateInstrumentBasic({id: 970001, name, departmentId: 900101, types: 1});
  expect(update('演示冷藏柜').ok).toBe(false);
  expect(listInstruments({keyword: '演示培养箱', pageSize: 20}).list.find(row => row.id === 970001).name).toBe('演示培养箱');
  expect(update('演示培养箱').ok).toBe(true);
  expect(update('演示培养箱 B').ok).toBe(true);
});
