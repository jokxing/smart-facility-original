import ExcelJS from 'exceljs';
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
  exportDemoInstruments,
  listInstruments
} from '../../../src/mock/fixtures/instrument';
import {EXPORT_HEADERS} from '../../../src/mock/instrumentWorkbook';
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

async function readSheet(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.getWorksheet('设备列表');
  const rows = [];
  sheet.eachRow((row, rowNumber) => {
    rows.push([1, 2, 3, 4, 5, 6, 7].map(i => {
      const value = row.getCell(i).value;
      return value == null ? '' : String(value);
    }));
  });
  return rows;
}

test('export requires authentication', async () => {
  expect((await client.post('/instrument/export', {keyword: ''})).data.code).toBe(2);
});

test('export returns xlsx for current filters and ignores pagination', async () => {
  await establishSession();
  const filtered = listInstruments({keyword: '培养箱', pageNum: 1, pageSize: 1});
  expect(filtered.total).toBeGreaterThan(1);
  expect(filtered.list).toHaveLength(1);

  const buffer = await exportDemoInstruments({keyword: '培养箱', pageNum: 1, pageSize: 1});
  const rows = await readSheet(buffer);
  expect(rows[0]).toEqual(EXPORT_HEADERS);
  expect(rows.length - 1).toBe(filtered.total);
  expect(rows.slice(1).every(row => row[0].includes('培养箱'))).toBe(true);

  const http = await client.post('/instrument/export', {keyword: '培养箱', pageNum: 1, pageSize: 1}, {responseType: 'arraybuffer'});
  const httpRows = await readSheet(http.data);
  expect(httpRows.length - 1).toBe(filtered.total);
});

test('batch/update remains blocked while export works', async () => {
  await establishSession();
  expect((await client.post('/instrument/batch/update', {})).data.code).toBe(0);
  const buffer = await exportDemoInstruments({});
  const rows = await readSheet(buffer);
  expect(rows.length - 1).toBe(12);
});
