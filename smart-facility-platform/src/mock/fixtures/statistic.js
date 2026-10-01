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
