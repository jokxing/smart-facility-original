/**
 * Synthetic historical alarm events for AlarmThingStatistics.
 * Distinct from current senorStatus on rooms/instruments (those stay normal).
 *
 * thingsType 11 = room (FloorDataV); 4 = instrument (RoomDataV).
 * DEMO_ALARM_ANCHOR is the fixed "now" for relative UI presets so counts stay stable.
 */

import {DEMO_NOW_MS} from '../clock';
export const DEMO_ALARM_ANCHOR_MS = DEMO_NOW_MS;

/** Absolute event times around the demo anchor (not derived from wall clock). */
export const DEMO_ALARM_EVENTS = Object.freeze([
  {thingsType: 11, thingsId: 950001, thingsName: '演示房间 A', sensorId: 101, sensorName: '演示温度', at: '2026-09-23 11:00:00'},
  {thingsType: 11, thingsId: 950001, thingsName: '演示房间 A', sensorId: 101, sensorName: '演示温度', at: '2026-09-22 10:00:00'},
  {thingsType: 11, thingsId: 950001, thingsName: '演示房间 A', sensorId: 102, sensorName: '演示湿度', at: '2026-09-21 09:00:00'},
  {thingsType: 11, thingsId: 950003, thingsName: '演示房间 B', sensorId: 101, sensorName: '演示温度', at: '2026-09-20 08:00:00'},
  {thingsType: 11, thingsId: 950003, thingsName: '演示房间 B', sensorId: 101, sensorName: '演示温度', at: '2026-09-10 08:00:00'},
  {thingsType: 11, thingsId: 950002, thingsName: '演示走廊', sensorId: 101, sensorName: '演示温度', at: '2026-08-01 08:00:00'},
  {thingsType: 4, thingsId: 970001, thingsName: '演示培养箱', sensorId: 101, sensorName: '演示温度', at: '2026-09-23 10:00:00'},
  {thingsType: 4, thingsId: 970001, thingsName: '演示培养箱', sensorId: 101, sensorName: '演示温度', at: '2026-09-22 10:00:00'},
  {thingsType: 4, thingsId: 970001, thingsName: '演示培养箱', sensorId: 101, sensorName: '演示温度', at: '2026-09-21 10:00:00'},
  {thingsType: 4, thingsId: 970002, thingsName: '演示冷藏柜', sensorId: 102, sensorName: '演示湿度', at: '2026-09-22 12:00:00'},
  {thingsType: 4, thingsId: 970003, thingsName: '演示温湿度仪', sensorId: 101, sensorName: '演示温度', at: '2026-09-05 12:00:00'}
]);

function parseDemoDate(value) {
  if (value == null || value === '') return NaN;
  const text = String(value).trim();
  const normalized = text.replace(' ', 'T');
  const local = /^(\d{4}-\d{2}-\d{2})(?:T(\d{2}:\d{2}:\d{2}))?$/.exec(normalized);
  if (local) {
    const canonical = local[1] + 'T' + (local[2] || '00:00:00');
    const ms = Date.parse(canonical + '+08:00');
    if (!Number.isFinite(ms)) return NaN;
    return new Date(ms + 8 * 3600000).toISOString().slice(0, 19) === canonical ? ms : NaN;
  }
  return /(?:Z|[+-]\d{2}:\d{2})$/i.test(normalized) ? Date.parse(normalized) : NaN;
}

function resolveRange(beginDate, endDate) {
  const absent = value => value == null || value === '';
  const begin = absent(beginDate) ? DEMO_ALARM_ANCHOR_MS - 30 * 86400000 : parseDemoDate(beginDate);
  const end = absent(endDate) ? DEMO_ALARM_ANCHOR_MS : parseDemoDate(endDate);
  return {begin, end};
}

function matchingEvents(body = {}) {
  const thingsType = body.thingsType == null || body.thingsType === '' ? null : Number(body.thingsType);
  if (thingsType !== 11 && thingsType !== 4) return [];
  const {begin, end} = resolveRange(body.beginDate, body.endDate);
  if (!Number.isFinite(begin) || !Number.isFinite(end) || begin > end) return [];
  const sensorType = body.sensorType == null || body.sensorType === '' ? 0 : Number(body.sensorType);
  return DEMO_ALARM_EVENTS.filter(event => {
    if (event.thingsType !== thingsType) return false;
    const at = parseDemoDate(event.at);
    if (at < begin || at > end) return false;
    if (sensorType && sensorType !== 0 && event.sensorId !== sensorType) return false;
    return true;
  });
}

export function listAlarmThingStatistics(body = {}) {
  const events = matchingEvents(body);
  const groups = new Map();
  for (const event of events) {
    let row = groups.get(event.thingsId);
    if (!row) {
      row = {thingsName: event.thingsName, alarmCount: 0};
      groups.set(event.thingsId, row);
    }
    row.alarmCount += 1;
  }
  const alarmStatistics = Array.from(groups.values()).sort((a, b) =>
    b.alarmCount - a.alarmCount || a.thingsName.localeCompare(b.thingsName, 'zh')
  );
  return {alarmStatistics};
}

export function listAlarmThingSensorsStatistics(body = {}) {
  // Sensor chips ignore sensorType filter; same date/type scope as ranking.
  const events = matchingEvents({...body, sensorType: 0});
  const sensors = [];
  const seen = new Set();
  for (const event of events) {
    if (seen.has(event.sensorId)) continue;
    seen.add(event.sensorId);
    sensors.push({sensorId: event.sensorId, sensorName: event.sensorName});
  }
  sensors.sort((a, b) => a.sensorId - b.sensorId);
  return {sensors};
}
