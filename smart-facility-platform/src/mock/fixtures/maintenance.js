/**
 * Synthetic maintenance records over shared DEMO_INSTRUMENTS.
 * Names/numbers/departments are snapshots so deleted instruments still list.
 * 5B: POST /maintenance/add → maintenanceCreated.
 * 5C: updateMaintenance / complete → maintenanceMeta overlay.
 */
import storage from '../storage';
import {DEMO_NOW_MS, formatDemoDateTime, parseDemoDateTime} from '../clock';
import {findStaffById, isActiveDepartment, DEMO_USER} from './auth';
import {
  buildInstrumentRow,
  isInstrumentDeleted,
  listActiveInstrumentSeeds,
  resolveInstrumentEntity
} from './instrument';

const MAINTENANCE_CREATED_KEY = 'maintenanceCreated';
const MAINTENANCE_META_KEY = 'maintenanceMeta';
const CREATED_ID_MIN = 960101;
const CREATED_ID_MAX = 960150;
const DEPT_OPS = 900101;
const DEPT_RD = 900102;

function staffName(id) {
  const row = findStaffById(id);
  return row ? row.name : '演示用户';
}

function staffTel(id) {
  const row = findStaffById(id);
  return row && row.tel ? row.tel : '13800000000';
}

function atDaysAgo(days, hour = 9) {
  const noon = 12;
  return formatDemoDateTime(DEMO_NOW_MS - days * 86400000 + (hour - noon) * 3600000);
}

function instrumentNo(id) {
  return 'DEMO-EQ-' + id;
}

/**
 * 14 rows so pageSize 10 yields two pages.
 * completeFlag only 0 (维护中) / 1 (维护完成) — matches views/maintenance STATUSSET.
 */
export const DEMO_MAINTENANCES = Object.freeze([
  {id: 960001, instrumentId: 970001, instrumentName: '演示培养箱', departmentId: 900101, userId: 900001, completeFlag: 1, daysAgo: 18, remark: '定期保养'},
  {id: 960002, instrumentId: 970001, instrumentName: '演示培养箱', departmentId: 900101, userId: 900002, completeFlag: 0, daysAgo: 2, remark: '温控校准'},
  {id: 960003, instrumentId: 970002, instrumentName: '演示冷藏柜', departmentId: 900101, userId: 900001, completeFlag: 1, daysAgo: 16, remark: '压缩机检查'},
  {id: 960004, instrumentId: 970003, instrumentName: '演示温湿度仪', departmentId: 900101, userId: 900002, completeFlag: 0, daysAgo: 5, remark: '探头清洁'},
  {id: 960005, instrumentId: 970004, instrumentName: '演示检测仪 A', departmentId: 900101, userId: 900001, completeFlag: 1, daysAgo: 14, remark: '年度维保'},
  {id: 960006, instrumentId: 970005, instrumentName: '演示示波器 A', departmentId: 900101, userId: 900002, completeFlag: 0, daysAgo: 4, remark: '通道校准'},
  {id: 960007, instrumentId: 970006, instrumentName: '演示设备机柜 B', departmentId: 900101, userId: 900001, completeFlag: 1, daysAgo: 12, remark: '风扇更换'},
  {id: 960008, instrumentId: 970007, instrumentName: '演示检测仪 B', departmentId: 900102, userId: 900003, completeFlag: 0, daysAgo: 3, remark: '研发侧点检'},
  {id: 960009, instrumentId: 970008, instrumentName: '演示示波器 B', departmentId: 900102, userId: 900003, completeFlag: 1, daysAgo: 10, remark: '探头更换'},
  {id: 960010, instrumentId: 970009, instrumentName: '演示培养箱 B', departmentId: 900102, userId: 900003, completeFlag: 0, daysAgo: 1, remark: '密封圈检查'},
  {id: 960011, instrumentId: 970010, instrumentName: '演示冷藏柜 B', departmentId: 900101, userId: 900001, completeFlag: 1, daysAgo: 8, remark: '除霜保养'},
  {id: 960012, instrumentId: 970011, instrumentName: '演示监测终端 A', departmentId: 900101, userId: 900002, completeFlag: 0, daysAgo: 6, remark: '固件检查'},
  {id: 960013, instrumentId: 970012, instrumentName: '演示设备机柜 A', departmentId: 900101, userId: 900001, completeFlag: 1, daysAgo: 20, remark: '历史机柜保养'},
  {id: 960014, instrumentId: 970007, instrumentName: '演示检测仪 B', departmentId: 900102, userId: 900003, completeFlag: 1, daysAgo: 11, remark: '上次完成记录'}
]);

function readCreatedMaintenances() {
  try {
    const raw = storage.getItem(MAINTENANCE_CREATED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item => item && Number.isFinite(Number(item.id)));
  } catch (_) {
    return [];
  }
}

function writeCreatedMaintenances(list) {
  storage.setItem(MAINTENANCE_CREATED_KEY, JSON.stringify(list));
}

export function clearMaintenanceCreated() {
  storage.removeItem(MAINTENANCE_CREATED_KEY);
}

function readMaintenanceMeta() {
  try {
    const raw = storage.getItem(MAINTENANCE_META_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (_) {
    return {};
  }
}

function writeMaintenanceMeta(map) {
  storage.setItem(MAINTENANCE_META_KEY, JSON.stringify(map));
}

export function clearMaintenanceMeta() {
  storage.removeItem(MAINTENANCE_META_KEY);
}

function freeCreatedIds() {
  const created = readCreatedMaintenances();
  const used = new Set(created.map(item => Number(item.id)));
  const free = [];
  for (let id = CREATED_ID_MIN; id <= CREATED_ID_MAX; id++) {
    if (!used.has(id)) free.push(id);
  }
  return {created, free};
}

function findMaintenanceSeed(id) {
  const key = Number(id);
  const created = readCreatedMaintenances().find(item => Number(item.id) === key);
  if (created) return created;
  return DEMO_MAINTENANCES.find(item => item.id === key) || null;
}

function applyMeta(seed) {
  if (!seed) return null;
  const patch = readMaintenanceMeta()[String(seed.id)] || {};
  return {...seed, ...patch};
}

function allMaintenanceSeeds() {
  return DEMO_MAINTENANCES.concat(readCreatedMaintenances()).map(applyMeta);
}

function buildRow(seed) {
  const deleted = isInstrumentDeleted(seed.instrumentId);
  const createDate = seed.createDate || atDaysAgo(seed.daysAgo == null ? 0 : seed.daysAgo, 9);
  const maintenanceDate = seed.maintenanceDate || atDaysAgo(seed.daysAgo == null ? 0 : seed.daysAgo, 10);
  const completeDate = seed.completeDate != null
    ? seed.completeDate
    : (seed.completeFlag === 1 ? atDaysAgo(seed.daysAgo == null ? 0 : seed.daysAgo, 16) : '');
  const nextMaintenanceDate = seed.nextMaintenanceDate != null
    ? seed.nextMaintenanceDate
    : atDaysAgo(Math.max(0, (seed.daysAgo == null ? 0 : seed.daysAgo) - 30), 9);
  return {
    id: seed.id,
    instrumentId: seed.instrumentId,
    instrumentName: seed.instrumentName,
    instrumentNo: seed.instrumentNo || instrumentNo(seed.instrumentId),
    departmentId: seed.departmentId,
    userName: staffName(seed.userId),
    tel: staffTel(seed.userId),
    createDate,
    maintenanceDate,
    completeDate,
    nextMaintenanceDate,
    remark: seed.remark == null ? '' : String(seed.remark),
    completeFlag: seed.completeFlag,
    openTwoSystem: !deleted,
    instrumentDeleted: deleted
  };
}

function asText(value) {
  return value == null ? '' : String(value).trim();
}

function matchKeyword(row, keyword) {
  const key = asText(keyword).toLowerCase();
  if (!key) return true;
  const blob = [row.instrumentName, row.instrumentNo, row.userName, row.tel, row.remark]
    .map(item => String(item || '').toLowerCase())
    .join(' ');
  return blob.includes(key);
}

function matchDepartment(row, departmentId) {
  if (departmentId == null || departmentId === '') return true;
  const key = Number(departmentId);
  if (!Number.isFinite(key) || key === 0) return true;
  return Number(row.departmentId) === key;
}

function matchInstrument(row, instrumentId) {
  if (instrumentId == null || instrumentId === '') return true;
  const key = Number(instrumentId);
  if (!Number.isFinite(key)) return true;
  return Number(row.instrumentId) === key;
}

export function validateMaintenanceRange(body = {}) {
  const start = asText(body.startDate);
  const end = asText(body.endDate);
  if (!start && !end) return {ok: true};
  if (!start || !end) return {ok: false, message: '请完整填写起止日期。'};
  const beginMs = parseDemoDateTime(start);
  const endMs = parseDemoDateTime(end);
  if (!Number.isFinite(beginMs) || !Number.isFinite(endMs)) return {ok: false, message: '日期格式无效。'};
  if (beginMs > endMs) return {ok: false, message: '开始日期不能晚于结束日期。'};
  return {ok: true};
}

function matchCreateDate(row, startDate, endDate) {
  const startText = asText(startDate);
  const endText = asText(endDate);
  if (!startText && !endText) return true;
  if (!startText || !endText) return true;
  const begin = parseDemoDateTime(startText);
  const end = parseDemoDateTime(endText);
  if (!Number.isFinite(begin) || !Number.isFinite(end)) return true;
  const created = parseDemoDateTime(row.createDate);
  if (!Number.isFinite(created)) return false;
  return created >= begin && created <= end;
}

export function listMaintenances(body = {}) {
  const check = validateMaintenanceRange(body);
  if (!check.ok) throw new Error(check.message);
  const pageNum = Math.max(1, Number(body.pageNum) || 1);
  const pageSize = Math.max(1, Number(body.pageSize) || 10);
  const rows = allMaintenanceSeeds().map(buildRow)
    .filter(row => matchKeyword(row, body.keyword))
    .filter(row => matchDepartment(row, body.departmentId))
    .filter(row => matchInstrument(row, body.instrumentId))
    .filter(row => matchCreateDate(row, body.startDate, body.endDate))
    .sort((a, b) => {
      const byDate = String(b.createDate).localeCompare(String(a.createDate));
      return byDate !== 0 ? byDate : b.id - a.id;
    });
  const start = (pageNum - 1) * pageSize;
  return {
    list: rows.slice(start, start + pageSize),
    total: rows.length,
    pageNum,
    pageSize
  };
}

/**
 * POST /maintenance/add — from MaintenanceModal (device drawer).
 * Body fields from source: companyId, departmentId, departmentName, instrumentId,
 * instrumentName, instrumentNo, remark, userId.
 * Identity resolved from shared active instrument; snapshots stored on the record.
 */
export function addDemoMaintenance(body = {}) {
  const instrumentId = Number(body && body.instrumentId);
  if (!Number.isFinite(instrumentId)) {
    return {ok: false, message: '请选择有效设备。'};
  }
  if (isInstrumentDeleted(instrumentId)) {
    return {ok: false, message: '该设备已删除，无法申请维保。'};
  }
  const seed = listActiveInstrumentSeeds().find(item => Number(item.id) === instrumentId);
  if (!seed) return {ok: false, message: '演示设备不存在。'};
  const resolved = resolveInstrumentEntity(seed);
  if (!resolved) return {ok: false, message: '演示设备不存在。'};
  const row = buildInstrumentRow(resolved);
  if (!row) return {ok: false, message: '演示设备不存在。'};

  const remark = asText(body.remark);
  if (remark.length > 50) {
    return {ok: false, message: '故障描述不能超过 50 字。'};
  }

  let departmentId = Number(row.departmentId);
  if (body.departmentId != null && body.departmentId !== '') {
    const requested = Number(body.departmentId);
    if (!isActiveDepartment(requested)) {
      return {ok: false, message: '请选择有效部门。'};
    }
  }

  let userId = DEMO_USER.id;
  if (body.userId != null && body.userId !== '') {
    const requestedUser = Number(body.userId);
    if (findStaffById(requestedUser)) userId = requestedUser;
  }

  const {created, free} = freeCreatedIds();
  if (!free.length) {
    return {ok: false, message: '维保申请容量已满，本条未写入。'};
  }

  const now = formatDemoDateTime(DEMO_NOW_MS);
  const entity = {
    id: free[0],
    instrumentId: row.id,
    instrumentName: row.name,
    instrumentNo: row.no,
    departmentId,
    userId,
    completeFlag: 0,
    remark,
    createDate: now,
    maintenanceDate: now,
    completeDate: '',
    nextMaintenanceDate: ''
  };
  try {
    writeCreatedMaintenances(created.concat([entity]));
  } catch (_) {
    return {ok: false, message: '本地保存失败，请检查浏览器存储空间后重试。'};
  }
  return {ok: true, id: entity.id, instrumentId: entity.instrumentId};
}

/**
 * POST /maintenance/updateMaintenance — set nextMaintenanceDate.
 * Source UI: next date must not be earlier than createDate (申请时间).
 */
export function updateDemoMaintenance(body = {}) {
  const maintenanceId = Number(body && body.maintenanceId);
  if (!Number.isFinite(maintenanceId)) {
    return {ok: false, message: '维保记录不存在。'};
  }
  const seed = findMaintenanceSeed(maintenanceId);
  if (!seed) return {ok: false, message: '维保记录不存在。'};
  const row = buildRow(applyMeta(seed));
  const nextText = asText(body.nextMaintenanceDate);
  if (!nextText) return {ok: false, message: '请选择下次维保日期。'};
  const nextMs = parseDemoDateTime(nextText);
  if (!Number.isFinite(nextMs)) {
    return {ok: false, message: '下次维保日期无效。'};
  }
  const createMs = parseDemoDateTime(row.createDate);
  if (Number.isFinite(createMs) && nextMs < createMs) {
    return {ok: false, message: '下次维保时间不能小于当前维保的申请时间'};
  }
  try {
    const map = readMaintenanceMeta();
    map[String(maintenanceId)] = {...(map[String(maintenanceId)] || {}), nextMaintenanceDate: nextText};
    writeMaintenanceMeta(map);
  } catch (_) {
    return {ok: false, message: '本地保存失败，请检查浏览器存储空间后重试。'};
  }
  return {ok: true, id: maintenanceId, nextMaintenanceDate: nextText};
}

/**
 * GET /maintenance/complete — mark completeFlag=1.
 * Already completed → failure (idempotent reject, no silent success).
 */
export function completeDemoMaintenance(params = {}) {
  const maintenanceId = Number(params && params.maintenanceId);
  if (!Number.isFinite(maintenanceId)) {
    return {ok: false, message: '维保记录不存在。'};
  }
  const seed = findMaintenanceSeed(maintenanceId);
  if (!seed) return {ok: false, message: '维保记录不存在。'};
  const current = applyMeta(seed);
  if (Number(current.completeFlag) === 1) {
    return {ok: false, message: '该维保已完成，无需重复确认。'};
  }
  const now = formatDemoDateTime(DEMO_NOW_MS);
  try {
    const map = readMaintenanceMeta();
    map[String(maintenanceId)] = {
      ...(map[String(maintenanceId)] || {}),
      completeFlag: 1,
      completeDate: now
    };
    writeMaintenanceMeta(map);
  } catch (_) {
    return {ok: false, message: '本地保存失败，请检查浏览器存储空间后重试。'};
  }
  return {ok: true, id: maintenanceId, completeFlag: 1, completeDate: now};
}
