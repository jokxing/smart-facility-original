jest.mock('../../../src/mock/captcha', () => ({createCaptchaImage: () => 'test-png-base64'}));

import axios from 'axios';
import qs from 'qs';
import {
  DEMO_ALARM_EVENTS,
  batchHandleAlarmExceptions,
  listAlarmRecordSummary,
  listAlarmThingStatistics,
  listAlarmThingSensorsStatistics,
  resetDemoAlarmLogHandles
} from '../../../src/mock/fixtures/alarm';
import {demoAlarmRange} from '../../../src/mock/clock';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';

test('absolute dates never remap with wall clock; shortcuts use the demo clock', () => {
  const now = jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-10-24T12:00:00+08:00'));
  try {
    expect(listAlarmThingStatistics({thingsType: 11, beginDate: '2026-10-17 00:00:00', endDate: '2026-10-24 12:00:00'}).alarmStatistics).toEqual([]);
    expect(demoAlarmRange(7)).toEqual({beginDate: '2026-09-17 00:00:00', endDate: '2026-09-24 12:00:00'});
    expect(listAlarmThingStatistics({thingsType: 11, ...demoAlarmRange(7)}).alarmStatistics).toEqual([
      {thingsName: '演示房间 A', alarmCount: 3}, {thingsName: '演示房间 B', alarmCount: 1}
    ]);
  } finally { now.mockRestore(); }
});

test('explicit offsets equal demo +08 time and boundaries are inclusive', () => {
  for (const instant of ['2026-09-23 11:00:00', '2026-09-23T03:00:00Z', '2026-09-22T23:00:00-04:00']) {
    expect(listAlarmThingStatistics({thingsType: 11, beginDate: instant, endDate: instant}).alarmStatistics).toEqual([{thingsName: '演示房间 A', alarmCount: 1}]);
  }
});

test('invalid and reversed ranges return empty rather than default history', () => {
  for (const beginDate of ['invalid', '2026-02-30 10:00:00', '2026-09-25 00:00:00']) {
    const body = {thingsType: 11, beginDate, endDate: '2026-09-24 12:00:00'};
    expect(listAlarmThingStatistics(body).alarmStatistics).toEqual([]);
    expect(listAlarmThingSensorsStatistics(body).sensors).toEqual([]);
  }
});

const monthRange = {
  beginDate: '2026-08-25 00:00:00',
  endDate: '2026-09-24 12:00:00'
};
const weekRange = {
  beginDate: '2026-09-17 00:00:00',
  endDate: '2026-09-24 12:00:00'
};
const dayRange = {
  beginDate: '2026-09-23 00:00:00',
  endDate: '2026-09-24 12:00:00'
};
const opt = {remap: false};

test('alarm seed is historical and separate from current normal status counts', () => {
  expect(DEMO_ALARM_EVENTS.length).toBe(11);
  expect(DEMO_ALARM_EVENTS.every(e => e.at.startsWith('2026-'))).toBe(true);
});

test('thingsType isolates room vs instrument rankings with fixed month counts', () => {
  expect(listAlarmThingStatistics({thingsType: 11, sensorType: 0, ...monthRange}, opt).alarmStatistics).toEqual([
    {thingsName: '演示房间 A', alarmCount: 3},
    {thingsName: '演示房间 B', alarmCount: 2}
  ]);
  expect(listAlarmThingStatistics({thingsType: 4, sensorType: 0, ...monthRange}, opt).alarmStatistics).toEqual([
    {thingsName: '演示培养箱', alarmCount: 3},
    {thingsName: '演示冷藏柜', alarmCount: 1},
    {thingsName: '演示温湿度仪', alarmCount: 1}
  ]);
  expect(listAlarmThingStatistics({thingsType: 99, ...monthRange}, opt).alarmStatistics).toEqual([]);
});

test('date boundaries change counts; events outside the window are excluded', () => {
  expect(listAlarmThingStatistics({thingsType: 11, sensorType: 0, ...weekRange}, opt).alarmStatistics).toEqual([
    {thingsName: '演示房间 A', alarmCount: 3},
    {thingsName: '演示房间 B', alarmCount: 1}
  ]);
  expect(listAlarmThingStatistics({thingsType: 11, sensorType: 0, ...dayRange}, opt).alarmStatistics).toEqual([
    {thingsName: '演示房间 A', alarmCount: 1}
  ]);
  expect(listAlarmThingStatistics({
    thingsType: 11,
    sensorType: 0,
    beginDate: '2026-07-01 00:00:00',
    endDate: '2026-07-31 23:59:59'
  }, opt).alarmStatistics).toEqual([]);
  expect(listAlarmThingStatistics({
    thingsType: 11,
    sensorType: 0,
    beginDate: '2026-08-01 00:00:00',
    endDate: '2026-08-01 23:59:59'
  }, opt).alarmStatistics).toEqual([{thingsName: '演示走廊', alarmCount: 1}]);
});

test('sensorType filters ranking; sensor chips stay same-source without self-echo', () => {
  expect(listAlarmThingStatistics({thingsType: 11, sensorType: 101, ...monthRange}, opt).alarmStatistics).toEqual([
    {thingsName: '演示房间 A', alarmCount: 2},
    {thingsName: '演示房间 B', alarmCount: 2}
  ]);
  expect(listAlarmThingStatistics({thingsType: 11, sensorType: 102, ...monthRange}, opt).alarmStatistics).toEqual([
    {thingsName: '演示房间 A', alarmCount: 1}
  ]);
  expect(listAlarmThingStatistics({thingsType: 11, sensorType: 999, ...monthRange}, opt).alarmStatistics).toEqual([]);
  expect(listAlarmThingSensorsStatistics({thingsType: 11, ...monthRange}, opt).sensors).toEqual([
    {sensorId: 101, sensorName: '演示温度'},
    {sensorId: 102, sensorName: '演示湿度'}
  ]);
  expect(listAlarmThingSensorsStatistics({thingsType: 4, ...weekRange}, opt).sensors).toEqual([
    {sensorId: 101, sensorName: '演示温度'},
    {sensorId: 102, sensorName: '演示湿度'}
  ]);
  expect(listAlarmThingStatistics({thingsType: 4, sensorType: 0, ...weekRange}, opt).alarmStatistics).toEqual([
    {thingsName: '演示培养箱', alarmCount: 3},
    {thingsName: '演示冷藏柜', alarmCount: 1}
  ]);
});

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
  resetDemoAlarmLogHandles();
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

test('alarm log summary reuses instrument seed ids and supports handle closed loop', async () => {
  expect((await client.post('/monitorIndicator/historyAlarmRecord/summary', {pageNum: 1, pageSize: 10})).data.code).toBe(2);
  await establishSession();

  const page = (await client.post('/monitorIndicator/historyAlarmRecord/summary', {
    pageNum: 1, pageSize: 10, status: [], departmentId: [], sensorCatId: [], key: ''
  })).data;
  expect(page.code).toBe(1);
  expect(page.items.total).toBe(5);
  expect(page.items.list.every(item => item.process === false && item.status === 2)).toBe(true);
  expect(page.items.list.some(item => item.equipmentName === '演示培养箱' && item.equipmentNo === 'DEMO-EQ-970001')).toBe(true);
  expect(page.items.list[0].monitorAlarmEndTime).toBeTruthy();

  const filtered = listAlarmRecordSummary({status: [2], sensorCatId: [102], pageNum: 1, pageSize: 10});
  expect(filtered.list).toHaveLength(1);
  expect(filtered.list[0].equipmentName).toBe('演示冷藏柜');

  const targetId = page.items.list.find(item => item.equipmentName === '演示培养箱').id;
  const handled = batchHandleAlarmExceptions({
    ids: [targetId],
    errorType: 2,
    processDate: '2026-09-24 12:00:00',
    errorCauseMethod: '演示复位',
    errorCauseMsg: '演示波动',
    errorCauseUserName: 'demo'
  });
  expect(handled.ok).toBe(true);

  const apiHandle = (await client.post('/monitorIndicator/exceptionHandle/batch', {
    ids: [page.items.list.find(item => item.equipmentName === '演示冷藏柜').id],
    errorType: 1,
    processDate: '2026-09-24 12:30:00',
    errorCauseMethod: '演示核对',
    errorCauseMsg: '演示误报',
    errorCauseUserName: 'demo'
  })).data;
  expect(apiHandle.code).toBe(1);

  const after = listAlarmRecordSummary({pageNum: 1, pageSize: 20});
  const incubator = after.list.filter(item => item.equipmentName === '演示培养箱');
  expect(incubator.some(item => item.id === targetId && item.process === true && item.status === 1)).toBe(true);
  expect(after.list.find(item => item.equipmentName === '演示冷藏柜')).toMatchObject({
    process: true,
    status: 1,
    statusStr: '已处理',
    errorCauseMethod: '演示核对'
  });
  expect(listAlarmRecordSummary({status: [2], pageNum: 1, pageSize: 20}).total).toBe(3);

  expect((await client.get('/alarm/errorList')).data.items.list.length).toBe(3);
  expect((await client.get('/monitorIndicator/allSensorType/v2')).data.items).toEqual([
    {id: 101, name: '演示温度', unit: '℃'},
    {id: 102, name: '演示湿度', unit: '%'}
  ]);
  expect(batchHandleAlarmExceptions({ids: [999999]}).ok).toBe(false);
});

test('batch handle requires date/type; multi-select succeeds; corrupt cache cannot rewrite identity', async () => {
  await establishSession();
  const page = listAlarmRecordSummary({pageNum: 1, pageSize: 20});
  const a = page.list.find(item => item.equipmentName === '演示培养箱');
  const b = page.list.find(item => item.equipmentName === '演示冷藏柜');
  expect(a && b).toBeTruthy();

  const before = storage.getItem('alarmLogHandles');
  for (const invalid of [
    {processDate: '2026-02-30T12:00:00+08:00'},
    {ids: [a.id, 'invalid']}, {ids: [a.id, a.id]}, {errorCauseMsg: {bad: true}}
  ]) {
    expect(batchHandleAlarmExceptions({ids: [a.id], errorType: 1, processDate: '2026-09-24 12:00:00', ...invalid}).ok).toBe(false);
    expect(storage.getItem('alarmLogHandles')).toBe(before);
  }
  expect(batchHandleAlarmExceptions({
    ids: [a.id],
    errorType: 1,
    processDate: ''
  }).ok).toBe(false);
  expect(batchHandleAlarmExceptions({
    ids: [a.id],
    errorType: 0,
    processDate: '2026-09-24 12:00:00'
  }).ok).toBe(false);
  expect(batchHandleAlarmExceptions({
    ids: [a.id],
    errorType: 1,
    processDate: 'not-a-date'
  }).ok).toBe(false);
  expect(storage.getItem('alarmLogHandles')).toBe(before);
  expect(listAlarmRecordSummary({pageNum: 1, pageSize: 20}).list.find(item => item.id === a.id).process).toBe(false);

  const multi = batchHandleAlarmExceptions({
    ids: [a.id, b.id],
    errorType: 2,
    processDate: '2026-09-24 12:00:00',
    errorCauseMethod: '批量演示',
    errorCauseMsg: '统一处理',
    errorCauseUserName: 'demo'
  });
  expect(multi.ok).toBe(true);
  expect(multi.count).toBe(2);
  const after = listAlarmRecordSummary({pageNum: 1, pageSize: 20});
  expect(after.list.find(item => item.id === a.id)).toMatchObject({process: true, status: 1, errorCauseMethod: '批量演示'});
  expect(after.list.find(item => item.id === b.id)).toMatchObject({process: true, status: 1});

  storage.setItem('alarmLogHandles', JSON.stringify({
    [String(a.id)]: {
      id: 111,
      thingsId: 999999,
      equipmentName: '伪造设备',
      process: true,
      status: 1,
      processDate: '2026-09-24 12:00:00',
      errorCauseType: 1
    }
  }));
  const protectedRow = listAlarmRecordSummary({pageNum: 1, pageSize: 20}).list.find(item => item.id === a.id);
  expect(protectedRow.equipmentName).toBe('演示培养箱');
  expect(protectedRow.thingsId).toBe(970001);
  expect(protectedRow.process).toBe(false);
  storage.setItem('alarmLogHandles', JSON.stringify({[a.id]: {
    process: true, status: 1, processDate: '2026-09-24 12:00:00',
    errorCauseType: 1, errorCauseMsg: {bad: true}
  }}));
  expect(listAlarmRecordSummary({pageSize: 20}).list.find(r => r.id === a.id).process).toBe(false);

  storage.setItem('alarmLogHandles', JSON.stringify({
    [String(b.id)]: {
      process: true,
      status: 1,
      processDate: '2026-09-24 15:00:00',
      errorCauseType: 3,
      errorCauseMethod: '合法缓存'
    }
  }));
  expect(listAlarmRecordSummary({pageNum: 1, pageSize: 20}).list.find(item => item.id === b.id)).toMatchObject({
    process: true,
    status: 1,
    errorCauseMethod: '合法缓存',
    equipmentName: '演示冷藏柜'
  });
});
