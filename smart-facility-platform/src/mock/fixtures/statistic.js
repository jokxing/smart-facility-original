/**
 * Statistics 4A — overview + alarm aggregates from shared entities.
 * Overview = current status; rings/histogram = historical alarms (unprocessed).
 */

import {DEMO_NOW_MS, parseDemoDateTime} from '../clock';
import {buildInstrumentRow, listActiveInstrumentSeeds} from './instrument';
import {getRoomDashboard} from './room';
import {DEMO_EQUIPMENTS, listEquipmentAlarmEventsForStatistics} from './equipment';
import {
  listInstrumentAlarmEventsForStatistics,
  listRoomAlarmEventsForStatistics
} from './alarm';

const DEFAULT_RANGE_DAYS = 30;

function defaultRangeMs() {
  return {
    begin: DEMO_NOW_MS - DEFAULT_RANGE_DAYS * 86400000,
    end: DEMO_NOW_MS
  };
}

function parseAt(value) {
  if (value == null || value === '') return NaN;
  const text = String(value).trim();
  const viaClock = parseDemoDateTime(text);
  if (Number.isFinite(viaClock)) return viaClock;
  const normalized = text.includes('T') ? text : text.replace(' ', 'T');
  const withZone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(normalized) ? normalized : normalized + '+08:00';
  return Date.parse(withZone);
}

function inDefaultRange(at) {
  const ms = parseAt(at);
  if (!Number.isFinite(ms)) return false;
  const {begin, end} = defaultRangeMs();
  return ms >= begin && ms <= end;
}

function dayKey(at) {
  const ms = parseAt(at);
  if (!Number.isFinite(ms)) return '';
  const shift = new Date(ms + 8 * 3600000);
  const pad = n => String(n).padStart(2, '0');
  return shift.getUTCFullYear() + '-' + pad(shift.getUTCMonth() + 1) + '-' + pad(shift.getUTCDate());
}

function isOpenAlarm(event) {
  return !event.process && Number(event.status) !== 1;
}

function groupByName(events, nameOf) {
  const groups = new Map();
  for (const event of events) {
    const name = nameOf(event);
    if (!name) continue;
    groups.set(name, (groups.get(name) || 0) + 1);
  }
  return Array.from(groups.entries())
    .map(([name, count]) => ({name, count}))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh'));
}

/**
 * GET /statistic/overview — current-state cards from shared instrument/room/equipment.
 */
export function getStatisticOverview() {
  const instruments = listActiveInstrumentSeeds().map(buildInstrumentRow).filter(Boolean);
  const rooms = getRoomDashboard({});
  const equipment = DEMO_EQUIPMENTS;
  return {
    instrumentTotal: instruments.length,
    instrumentNormalCount: instruments.filter(r => Number(r.status) === 1).length,
    instrumentAlarmCount: instruments.filter(r => Number(r.status) === -1).length,
    instrumentOffLineCount: instruments.filter(r => Number(r.status) === -100).length,
    roomTotal: rooms.totalNum,
    roomNormalCount: rooms.normalNum,
    roomAlarmCount: rooms.policeNum,
    roomOffLineCount: rooms.leaveNum,
    equipmentTotal: equipment.length,
    equipmentNormalCount: equipment.filter(r => Number(r.status) === 1).length,
    equipmentAlarmCount: equipment.filter(r => Number(r.status) === -1).length,
    equipmentOffLineCount: equipment.filter(r => Number(r.status) === -100).length
  };
}

/**
 * GET /statistic/alarm/overview — historical rings; empty arrays are valid empty state.
 */
export function getStatisticAlarmOverview() {
  const instruments = listInstrumentAlarmEventsForStatistics()
    .filter(isOpenAlarm)
    .filter(e => inDefaultRange(e.at));
  const rooms = listRoomAlarmEventsForStatistics()
    .filter(e => inDefaultRange(e.at));
  const equipment = listEquipmentAlarmEventsForStatistics()
    .filter(isOpenAlarm)
    .filter(e => inDefaultRange(e.at));
  return {
    instrumentOverview: groupByName(instruments, e => e.sensorName),
    labOverview: groupByName(rooms, e => e.sensorName),
    equipmentOverview: groupByName(equipment, e => e.typeName)
  };
}

/**
 * GET /statistic/equipment/alarm — histogram rows for hardware history.
 */
export function getStatisticEquipmentAlarm() {
  const open = listEquipmentAlarmEventsForStatistics()
    .filter(isOpenAlarm)
    .filter(e => inDefaultRange(e.at));
  const byDay = new Map();
  for (const event of open) {
    const lineName = dayKey(event.at);
    if (!lineName) continue;
    let row = byDay.get(lineName);
    if (!row) {
      row = new Map();
      byDay.set(lineName, row);
    }
    row.set(event.typeName, (row.get(event.typeName) || 0) + 1);
  }
  const typeNames = ['阈值', '离线'];
  return Array.from(byDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([lineName, counts]) => ({
      lineName,
      data: typeNames
        .filter(typeName => (counts.get(typeName) || 0) > 0)
        .map(typeName => ({typeName, count: counts.get(typeName)}))
    }))
    .filter(item => item.data.length > 0);
}

function windowDays(params = {}) {
  const begin = parseAt(params.beginTime);
  const end = parseAt(params.endTime);
  if (Number.isFinite(begin) && Number.isFinite(end) && begin <= end) {
    const beginDay = Math.floor((begin + 8 * 3600000) / 86400000);
    const endDay = Math.floor((end + 8 * 3600000) / 86400000);
    return Math.max(1, endDay - beginDay + 1);
  }
  const dateType = Number(params.dateType);
  if (dateType === 2) return 7;
  if (dateType === 3) return 30;
  return 1;
}

function matchUseType(row, typeFilter) {
  const key = Number(typeFilter);
  if (!key || Number.isNaN(key)) return true;
  if (key === 1) return Number(row.types) === 1;
  if (key === 2) return Number(row.types) === 2;
  // type=3 IT：演示无对应 types
  if (key === 3) return false;
  return true;
}

/**
 * GET /statistic/instrument/use — Statistics 4C bar chart.
 * Derived from active instruments + demo clock window; not live meter samples.
 * queryType 2 (electricity) → empty list.
 */
export function getStatisticInstrumentUse(params = {}) {
  const queryType = Number(params.queryType);
  if (queryType === 2) {
    return {instrumentUseList: []};
  }
  const days = windowDays(params);
  const rows = listActiveInstrumentSeeds()
    .map(buildInstrumentRow)
    .filter(Boolean)
    .filter(row => matchUseType(row, params.type))
    .map(row => {
      const hours = Number(row.workingHours);
      const workHours = Number.isFinite(hours) && hours > 0 ? hours : 7.5;
      const factor = 0.5 + ((Number(row.id) % 7) / 10);
      const useTime = Math.round(workHours * days * 3600 * factor);
      const useCount = Math.max(1, Math.round(days * (1 + (Number(row.id) % 5))));
      return {
        instrumentName: row.name,
        useTime,
        useCount,
        electricPower: 0
      };
    });
  const metric = queryType === 1 ? 'useCount' : 'useTime';
  rows.sort((a, b) => b[metric] - a[metric] || a.instrumentName.localeCompare(b.instrumentName, 'zh'));
  return {instrumentUseList: rows};
}

function parseHour(value) {
  if (value == null || value === '') return NaN;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 23) return NaN;
  return Math.floor(n);
}

/**
 * GET /statistic/instrument/useRanking — Statistics 4D table.
 * Returns a plain array (page assigns res.items directly to useRanKings).
 */
export function getStatisticInstrumentUseRanking(params = {}) {
  const days = windowDays(params);
  const periodType = Number(params.periodType) === 2 ? 2 : 1;
  const queryType = Number(params.queryType) || 1;
  const beginH = parseHour(params.periodBeginTime);
  const endH = parseHour(params.periodEndTime);
  const hasHourWindow = Number.isFinite(beginH) && Number.isFinite(endH) && beginH <= endH;
  const hourSpan = hasHourWindow ? Math.max(1, endH - beginH + 1) : null;

  const rows = listActiveInstrumentSeeds()
    .map(buildInstrumentRow)
    .filter(Boolean)
    .map(row => {
      const hours = Number(row.workingHours);
      const workHours = Number.isFinite(hours) && hours > 0 ? hours : 7.5;
      const factor = 0.5 + ((Number(row.id) % 7) / 10);
      const base = periodType === 1 ? workHours : 24;
      const hourScale = hourSpan == null ? 1 : Math.min(1, hourSpan / base);
      let useRate = Math.min(100, Math.round(factor * (workHours / base) * hourScale * 100));
      if (queryType === 2) {
        useRate = Math.min(100, Math.round(useRate * (days === 1 ? 1 : 0.98)));
      } else if (queryType === 3) {
        useRate = Math.min(100, Math.round(useRate * 0.95));
      }
      const variationRate = (Number(row.id) % 11) - 5;
      return {
        instrumentName: row.name,
        useRate,
        variationRate,
        changed: variationRate >= 0
      };
    });

  rows.sort((a, b) => b.useRate - a.useRate || a.instrumentName.localeCompare(b.instrumentName, 'zh'));
  return rows;
}
