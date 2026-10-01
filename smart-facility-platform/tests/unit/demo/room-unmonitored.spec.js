import {updateInstrumentBasic} from '../../../src/mock/fixtures/instrument';
import axios from 'axios';
import qs from 'qs';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';
import {
  addDemoInstrument,
  clearInstrumentCreated,
  listInstruments,
  listInstrumentsByRoomId
} from '../../../src/mock/fixtures/instrument';
import {listRoomMonitorInstrument} from '../../../src/mock/fixtures/room';

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

test('cold room A: on-map instruments only; unmonitored empty', async () => {
  await establishSession();
  const onMap = listRoomMonitorInstrument({roomId: 950001, types: 0});
  expect(onMap.map(i => i.id).sort()).toEqual(listInstrumentsByRoomId(950001).map(i => i.id).sort());
  expect(onMap.length).toBe(6);

  const unmapped = (await client.post('/instrument/list', {
    roomId: 950001, monitor: '2', pageNum: 1, pageSize: 10, type: 4
  })).data;
  expect(unmapped.code).toBe(1);
  expect(unmapped.items.total).toBe(0);
  expect(unmapped.items.list).toEqual([]);
});

test('add instrument (imported) appears in unmonitored only; on-map list unchanged', async () => {
  await establishSession();
  const beforeOnMap = listRoomMonitorInstrument({roomId: 950001, types: 0}).length;
  const created = addDemoInstrument({
    name: '演示未上图培养箱',
    departmentId: 900101,
    types: 1,
    roomId: 950001
  });
  expect(created.ok).toBe(true);
  expect(created.id).toBeGreaterThanOrEqual(970101);

  const unmapped = listInstruments({
    roomId: 950001, monitor: '2', pageNum: 1, pageSize: 10
  });
  expect(unmapped.total).toBe(1);
  expect(unmapped.list[0]).toMatchObject({
    id: created.id,
    name: '演示未上图培养箱',
    roomId: 950001,
    roomName: '演示房间 A'
  });

  const onMap = listRoomMonitorInstrument({roomId: 950001, types: 0});
  expect(onMap.length).toBe(beforeOnMap);
  expect(onMap.every(item => item.id !== created.id)).toBe(true);

  // Owned-but-not-on-map must not appear under monitor=1
  expect(listInstruments({roomId: 950001, monitor: '1', pageNum: 1, pageSize: 20}).list
    .some(row => row.id === created.id)).toBe(false);

  const http = (await client.post('/instrument/list', {
    roomId: 950001, monitor: '2', pageNum: 1, pageSize: 10, type: 4
  })).data;
  expect(http.items.total).toBe(1);
  expect(http.items.list[0].id).toBe(created.id);

  // Corridor stays empty even after create in room A
  expect(listInstruments({roomId: 950002, monitor: '2', pageNum: 1, pageSize: 10}).total).toBe(0);
});

test('unmonitored list respects type category from room detail tabs', async () => {
  await establishSession();
  addDemoInstrument({
    name: '演示未上图培养箱',
    departmentId: 900101,
    types: 1,
    roomId: 950001
  });
  addDemoInstrument({
    name: '演示未上图行政柜',
    departmentId: 900101,
    types: 2,
    roomId: 950001
  });

  const all = listInstruments({roomId: 950001, monitor: '2', type: 4, pageNum: 1, pageSize: 10});
  expect(all.total).toBe(2);

  const lab = listInstruments({roomId: 950001, monitor: '2', type: 1, pageNum: 1, pageSize: 10});
  expect(lab.total).toBe(1);
  expect(lab.list[0].name).toBe('演示未上图培养箱');

  const admin = listInstruments({roomId: 950001, monitor: '2', type: 2, pageNum: 1, pageSize: 10});
  expect(admin.total).toBe(1);
  expect(admin.list[0].name).toBe('演示未上图行政柜');

  const it = (await client.post('/instrument/list', {
    roomId: 950001, monitor: '2', type: 3, pageNum: 1, pageSize: 10
  })).data;
  expect(it.code).toBe(1);
  expect(it.items.total).toBe(0);
});

 test('room category reflects current edited metadata', () => {
  expect(updateInstrumentBasic({id:970001,name:'演示培养箱',departmentId:900101,types:2}).ok).toBe(true);
  expect(listRoomMonitorInstrument({roomId:950001,types:2}).some(item=>item.id===970001)).toBe(true);
  expect(listRoomMonitorInstrument({roomId:950001,types:1}).some(item=>item.id===970001)).toBe(false);
});
