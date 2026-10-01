/**
 * Synthetic historical alarm events for AlarmThingStatistics.
 * Distinct from current senorStatus on rooms/instruments (those stay normal).
 *
 * thingsType 11 = room (FloorDataV); 4 = instrument (RoomDataV).
 * DEMO_ALARM_ANCHOR is the fixed "now" for relative UI presets so counts stay stable.
 */

import {DEMO_NOW_MS, parseDemoDateTime} from '../clock';
import storage from '../storage';
export const DEMO_ALARM_ANCHOR_MS = DEMO_NOW_MS;
const ALARM_HANDLE_STORAGE_KEY = 'alarmLogHandles';

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

function endTimeFor(startAt) {
  const ms = parseDemoDate(startAt);
  if (!Number.isFinite(ms)) return startAt;
  const shift = new Date(ms + 8 * 3600000 + 3600000);
  const pad = n => String(n).padStart(2, '0');
  return shift.getUTCFullYear() + '-' + pad(shift.getUTCMonth() + 1) + '-' + pad(shift.getUTCDate())
    + ' ' + pad(shift.getUTCHours()) + ':' + pad(shift.getUTCMinutes()) + ':' + pad(shift.getUTCSeconds());
}

function seedAlarmLogRecords() {
  return DEMO_ALARM_EVENTS.filter(event => event.thingsType === 4).map((event, index) => {
    const humidity = event.sensorId === 102;
    return {
      id: 960001 + index,
      equipmentName: event.thingsName,
      equipmentNo: 'DEMO-EQ-' + event.thingsId,
      sensorAlias: event.sensorName,
      sensorCatId: event.sensorId,
      monitorSensorVal: humidity ? '85.0' : '42.0',
      status: 2,
      statusStr: '未处理',
      monitorNormalMin: humidity ? 30 : 0,
      monitorNormalMax: humidity ? 70 : 40,
      monitorAlarmStartTime: event.at,
      monitorAlarmEndTime: endTimeFor(event.at),
      durationFormat: '1小时',
      departmentName: '演示运维部',
      departmentId: 900101,
      objName: event.thingsName,
      thingsId: event.thingsId,
      process: false,
      errorCauseType: 0,
      processDate: '',
      errorCauseMethod: '',
      errorCauseMsg: '',
      errorCauseUserName: ''
    };
  });
}

function readHandles() {
  try {
    const raw = storage.getItem(ALARM_HANDLE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (_) {
    return {};
  }
}

function writeHandles(map) {
  storage.setItem(ALARM_HANDLE_STORAGE_KEY, JSON.stringify(map));
}

const ALLOWED_ERROR_TYPES = new Set([1, 2, 3]);

function isValidProcessDate(value) {
  return Number.isFinite(parseDemoDateTime(value));
}

/** Only processing fields may overlay seeds; corrupt patches fall back to seed. */
function sanitizeHandlePatch(patch, recordId) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return null;
  for (const key of ['errorCauseMethod', 'errorCauseMsg', 'errorCauseUserName']) {
    if (patch[key] != null && typeof patch[key] !== 'string') return null;
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'id') && Number(patch.id) !== Number(recordId)) {
    return null;
  }
  if (Object.prototype.hasOwnProperty.call(patch, 'thingsId')
    || Object.prototype.hasOwnProperty.call(patch, 'equipmentNo')
    || Object.prototype.hasOwnProperty.call(patch, 'equipmentName')) {
    return null;
  }
  if (patch.process !== true || Number(patch.status) !== 1) return null;
  if (!isValidProcessDate(patch.processDate)) return null;
  const errorCauseType = Number(patch.errorCauseType);
  if (!ALLOWED_ERROR_TYPES.has(errorCauseType)) return null;
  return {
    process: true,
    status: 1,
    statusStr: '已处理',
    errorCauseType,
    processDate: String(patch.processDate),
    errorCauseMethod: String(patch.errorCauseMethod == null ? '' : patch.errorCauseMethod).slice(0, 30),
    errorCauseMsg: String(patch.errorCauseMsg == null ? '' : patch.errorCauseMsg).slice(0, 30),
    errorCauseUserName: String(patch.errorCauseUserName == null ? 'demo' : patch.errorCauseUserName).slice(0, 50)
  };
}

function applyHandles(record) {
  const raw = readHandles()[String(record.id)];
  const patch = sanitizeHandlePatch(raw, record.id);
  return patch ? {...record, ...patch} : {...record};
}

export function resetDemoAlarmLogHandles() {
  storage.removeItem(ALARM_HANDLE_STORAGE_KEY);
}

/**
 * POST /monitorIndicator/historyAlarmRecord/summary — alarmLog list page.
 */
export function listAlarmRecordSummary(body = {}) {
  const pageNum = Math.max(1, Number(body.pageNum) || 1);
  const pageSize = Math.max(1, Number(body.pageSize) || 10);
  const statuses = Array.isArray(body.status) ? body.status.map(Number).filter(n => !Number.isNaN(n)) : [];
  const departments = Array.isArray(body.departmentId)
    ? body.departmentId.map(Number).filter(n => !Number.isNaN(n))
    : [];
  const sensors = Array.isArray(body.sensorCatId)
    ? body.sensorCatId.map(Number).filter(n => !Number.isNaN(n))
    : [];
  const key = body.key == null ? '' : String(body.key).trim();
  const start = body.startDate ? parseDemoDate(body.startDate) : NaN;
  const end = body.endDate ? parseDemoDate(body.endDate) : NaN;

  let list = seedAlarmLogRecords().map(applyHandles);
  if (statuses.length) list = list.filter(item => statuses.includes(Number(item.status)));
  if (departments.length) list = list.filter(item => departments.includes(Number(item.departmentId)));
  if (sensors.length) list = list.filter(item => sensors.includes(Number(item.sensorCatId)));
  if (key) {
    list = list.filter(item =>
      String(item.equipmentName).includes(key) || String(item.equipmentNo).includes(key)
    );
  }
  if (Number.isFinite(start) && Number.isFinite(end) && start <= end) {
    list = list.filter(item => {
      const at = parseDemoDate(item.monitorAlarmStartTime);
      return Number.isFinite(at) && at >= start && at <= end;
    });
  }
  list.sort((a, b) => String(b.monitorAlarmStartTime).localeCompare(String(a.monitorAlarmStartTime)));
  const total = list.length;
  const startIndex = (pageNum - 1) * pageSize;
  return {
    list: list.slice(startIndex, startIndex + pageSize),
    total,
    pageNum,
    pageSize
  };
}

/**
 * POST /monitorIndicator/exceptionHandle/batch — AlarmProcessing submit.
 * Requires valid processDate and known errorType; failed writes leave storage unchanged.
 */
export function batchHandleAlarmExceptions(body = {}) {
  const ids = Array.isArray(body.ids) ? body.ids.map(Number) : [];
  if (ids.some(id => !Number.isSafeInteger(id)) || new Set(ids).size !== ids.length) {
    return {ok: false, message: '报警记录编号无效或重复。'};
  }
  for (const key of ['errorCauseMethod', 'errorCauseMsg', 'errorCauseUserName']) {
    if (body[key] != null && typeof body[key] !== 'string') return {ok: false, message: '处理信息格式无效。'};
  }
  if (!ids.length) return {ok: false, message: '请选择要处理的报警记录。'};
  const seeds = seedAlarmLogRecords();
  const known = new Set(seeds.map(item => item.id));
  if (ids.some(id => !known.has(id))) {
    return {ok: false, message: '存在未知报警记录，已拒绝处理。'};
  }
  const errorCauseType = Number(body.errorType);
  if (!ALLOWED_ERROR_TYPES.has(errorCauseType)) {
    return {ok: false, message: '请选择有效的报警类型。'};
  }
  if (!isValidProcessDate(body.processDate)) {
    return {ok: false, message: '请填写有效的处理时间。'};
  }
  const handles = readHandles();
  const next = {...handles};
  for (const id of ids) {
    const patch = sanitizeHandlePatch({
      process: true,
      status: 1,
      statusStr: '已处理',
      errorCauseType,
      processDate: body.processDate,
      errorCauseMethod: body.errorCauseMethod || '',
      errorCauseMsg: body.errorCauseMsg || '',
      errorCauseUserName: body.errorCauseUserName || 'demo'
    }, id);
    if (!patch) return {ok: false, message: '处理参数无效，未保存。'};
    next[String(id)] = patch;
  }
  writeHandles(next);
  return {ok: true, count: ids.length};
}

export function listDemoAlarmErrorTypes() {
  return {
    list: [
      {id: 1, name: '演示误报'},
      {id: 2, name: '演示设备维护'},
      {id: 3, name: '演示环境波动'}
    ]
  };
}

export function listDemoSensorTypesV2() {
  return [
    {id: 101, name: '演示温度', unit: '℃'},
    {id: 102, name: '演示湿度', unit: '%'}
  ];
}

/**
 * Statistics 4A — instrument historical alarms with process overlay (same ids as alarm log).
 * Unprocessed: status !== 1 / process !== true.
 */
export function listInstrumentAlarmEventsForStatistics() {
  return seedAlarmLogRecords().map(applyHandles).map(record => ({
    thingsId: record.thingsId,
    thingsName: record.equipmentName,
    sensorId: record.sensorCatId,
    sensorName: record.sensorAlias,
    at: record.monitorAlarmStartTime,
    process: !!record.process,
    status: Number(record.status)
  }));
}

/** Statistics 4A — room historical alarms (no process path). */
export function listRoomAlarmEventsForStatistics() {
  return DEMO_ALARM_EVENTS.filter(event => event.thingsType === 11).map(event => ({
    thingsId: event.thingsId,
    thingsName: event.thingsName,
    sensorId: event.sensorId,
    sensorName: event.sensorName,
    at: event.at,
    process: false,
    status: 2
  }));
}

export {ALARM_HANDLE_STORAGE_KEY};
