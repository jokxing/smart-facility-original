import ExcelJS from 'exceljs';
import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import {exportDemoRooms, listRooms} from '../../../src/mock/fixtures/room';
import {ROOM_EXPORT_HEADERS} from '../../../src/mock/roomWorkbook';

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

async function readSheet(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.getWorksheet('房间列表');
  const rows = [];
  sheet.eachRow((row) => {
    rows.push([1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
      const value = row.getCell(i).value;
      return value == null ? '' : String(value);
    }));
  });
  return rows;
}

test('room export requires authentication', async () => {
  expect((await client.post('/room/export', {keyword: '', gardenId: ''})).data.code).toBe(2);
});

test('room export returns xlsx for current filters and ignores pagination', async () => {
  await establishSession();
  const filtered = listRooms({keyword: '房间', pageNum: 1, pageSize: 1, gardenId: ''});
  expect(filtered.total).toBe(2);
  expect(filtered.list).toHaveLength(1);

  const buffer = await exportDemoRooms({keyword: '房间', pageNum: 1, pageSize: 1, gardenId: ''});
  const rows = await readSheet(buffer);
  expect(rows[0]).toEqual(ROOM_EXPORT_HEADERS);
  expect(rows.length - 1).toBe(filtered.total);
  expect(rows.slice(1).every(row => row[0].includes('房间'))).toBe(true);

  const http = await client.post('/room/export', {keyword: '房间', pageNum: 1, pageSize: 1, gardenId: ''}, {
    responseType: 'arraybuffer'
  });
  const httpRows = await readSheet(http.data);
  expect(httpRows.length - 1).toBe(2);
});

test('empty filter yields empty sheet; department filter matches list; writes still blocked', async () => {
  await establishSession();
  const empty = await readSheet(await exportDemoRooms({
    keyword: '不存在的房间XYZ', pageNum: 1, pageSize: 10, gardenId: ''
  }));
  expect(empty[0]).toEqual(ROOM_EXPORT_HEADERS);
  expect(empty.length - 1).toBe(0);

  const rd = await readSheet(await exportDemoRooms({departmentId: 900102, gardenId: ''}));
  expect(rd.length - 1).toBe(1);
  expect(rd[1][0]).toBe('演示房间 B');

  const all = await readSheet(await exportDemoRooms({gardenId: ''}));
  expect(all.length - 1).toBe(3);

  expect((await client.post('/room/batch/update', {})).data.message).toMatch(/未开放/);
});
