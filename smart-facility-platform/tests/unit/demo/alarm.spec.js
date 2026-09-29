import {
  DEMO_ALARM_EVENTS,
  listAlarmThingStatistics,
  listAlarmThingSensorsStatistics
} from '../../../src/mock/fixtures/alarm';
import {demoAlarmRange} from '../../../src/mock/clock';

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

jest.mock('../../../src/mock/captcha', () => ({createCaptchaImage: () => 'test-png-base64'}));

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
  // Corridor event on 2026-08-01 only appears when window covers it.
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
  // Ranking counts for type 4 week must match the same seed (not a second invented list).
  expect(listAlarmThingStatistics({thingsType: 4, sensorType: 0, ...weekRange}, opt).alarmStatistics).toEqual([
    {thingsName: '演示培养箱', alarmCount: 3},
    {thingsName: '演示冷藏柜', alarmCount: 1}
  ]);
});
