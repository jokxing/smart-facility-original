import ExcelJS from 'exceljs';
import {createInstrumentWorkbook} from '../../../src/mock/instrumentWorkbook';
import {instrumentImportOptions, removeInstrument} from '../../../src/mock/fixtures/instrument';
import {addEquipmentInstrumentBinding} from '../../../src/mock/fixtures/equipment';
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


async function fileFor(rows, name = '设备导入.xlsx') {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('设备导入');
  sheet.addRows([['名称', '部门', '分类', '房间'], ...rows]);
  return new File([await workbook.xlsx.writeBuffer()], name);
}
const row = (name = '导入设备甲') => [name, '演示研发部', '演示设备', '演示房间 B'];
async function formFor(rows) {
  const form = new FormData(); form.append('files', await fileFor(rows)); return form;
}
test('import requires authentication', async () => {
  expect((await client.post('/instrument/import', await formFor([row()]))).data.code).toBe(2);
});
test('real XLSX batch updates list, dashboard, detail and binding', async () => {
  await establishSession();
  const before = listRoonInstrumentInfo(950003).list.length;
  const res = (await client.post('/instrument/import', await formFor([row(), row('导入设备乙')]))).data;
  expect(res.code).toBe(1);
  expect(res.items).toMatchObject({count: 2, ids: [970101, 970102]});
  expect(getInstrumentDashboardNew().totalCount).toBe(14);
  expect(listInstruments({keyword: '导入设备', pageSize: 20}).total).toBe(2);
  expect((await client.get('/instrument/detail', {params: {id: 970101}})).data.items.name).toBe('导入设备甲');
  expect(listBindableCatalog('instrument').some(item => item.id === 970101)).toBe(true);
  expect(listRoonInstrumentInfo(950003).list.length).toBe(before);
});
test('invalid second row and duplicate rows leave no partial writes', async () => {
  const bad = row('导入设备乙'); bad[1] = '不存在';
  const result = await importDemoInstruments({files: await fileFor([row(), bad])});
  expect(result).toMatchObject({ok: false}); expect(result.message).toContain('第 3 行');
  expect(getInstrumentDashboardNew().totalCount).toBe(12);
  expect((await importDemoInstruments({files: await fileFor([row(), row()])})).ok).toBe(false);
  expect(getInstrumentDashboardNew().totalCount).toBe(12);
});
test('concurrent imports allocate distinct IDs and repeat imports are rejected', async () => {
  const files = await Promise.all([fileFor([row()]), fileFor([row('导入设备乙')])]);
  const results = await Promise.all(files.map(files => importDemoInstruments({files})));
  expect(results.every(item => item.ok)).toBe(true);
  expect(new Set(results.map(item => item.id)).size).toBe(2);
  expect((await importDemoInstruments({files: files[0]})).ok).toBe(false);
});
test('reject unsupported, corrupt, oversized, multiple files and formula cells', async () => {
  expect((await importDemoInstruments({})).ok).toBe(false);
  const file = await fileFor([row()]);
  expect((await importDemoInstruments({files: [file, file]})).ok).toBe(false);
  for (const bad of [new File(['csv'], 'a.csv'), new File(['bad'], 'a.xlsx'), {name:'a.xlsx', size: 11*1024*1024}]) {
    expect((await importDemoInstruments({files: bad})).ok).toBe(false);
  }
  const cells = row(); cells[0] = {formula: '1+1', result: 2};
  expect((await importDemoInstruments({files: await fileFor([cells])})).message).toContain('公式');
});
test('capacity failure does not partially save', async () => {
  expect((await importDemoInstruments({files: await fileFor(Array.from({length:49}, (_, i) => row('批次设备' + i)))})).count).toBe(49);
  expect((await importDemoInstruments({files: await fileFor([row(), row('最后设备')])})).ok).toBe(false);
  expect(getInstrumentDashboardNew().totalCount).toBe(61);
});
test('downloaded template is genuine XLSX and accepted by the same parser', async () => {
  const buffer = await createInstrumentWorkbook(instrumentImportOptions());
  expect(buffer[0]).toBe(0x50); expect(buffer[1]).toBe(0x4b);
  expect((await importDemoInstruments({files: new File([buffer], '模板.xlsx')})).count).toBe(1);
});

test('imported devices bind, bound deletion is blocked, deleted devices cannot bind', async () => {
  const result = await importDemoInstruments({files: await fileFor([row(), row('待删除设备')])});
  expect(addEquipmentInstrumentBinding({equipmentId: 980001, thingsId: result.id}).ok).toBe(true);
  expect(removeInstrument(result.id).ok).toBe(false);
  expect(removeInstrument(result.ids[1]).ok).toBe(true);
  expect(addEquipmentInstrumentBinding({equipmentId: 980001, thingsId: result.ids[1]}).ok).toBe(false);
});
