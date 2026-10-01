import {DEMO_FLOOR_ROOMS} from './floor';
import {DEMO_SPACE} from './space';
import {
  listInstrumentsByRoomId,
  listRoonInstrumentInfo,
  sensorReadingForInstrument,
  resolveInstrumentEntity
} from './instrument';
import {getDemoScenario, statusForScenario} from './scenario';
import {createRoomExportWorkbook} from '../roomWorkbook';

const DEPT_OPS = 900101;
const DEPT_RD = 900102;

/** Room → department for list/detail filters (shared with dashboard). */
const ROOM_DEPARTMENT = Object.freeze({
  950001: DEPT_OPS,
  950002: DEPT_OPS,
  950003: DEPT_RD
});

function departmentNameForId(departmentId) {
  return Number(departmentId) === DEPT_RD ? '演示研发部' : '演示运维部';
}

function findRoomContext(roomId) {
  const key = Number(roomId);
  for (const garden of DEMO_SPACE) {
    for (const building of garden.buildings) {
      for (const floor of building.subDivisions || []) {
        const rooms = DEMO_FLOOR_ROOMS[floor.id] || [];
        const room = rooms.find(item => item.id === key);
        if (room) return {garden, building, floor, room};
      }
    }
  }
  return null;
}

function roomSenorStatus(roomId, room) {
  const hasInstruments = listInstrumentsByRoomId(roomId).length > 0;
  if (hasInstruments) {
    const {senorStatus} = statusForScenario(getDemoScenario());
    return senorStatus;
  }
  // No instruments: follow floor seed (corridor demo uses 3 = 未监测); keep shared with overview.
  return room.senorStatus != null ? room.senorStatus : 3;
}

function buildRoomRow(ctx) {
  const {garden, building, floor, room} = ctx;
  const departmentId = ROOM_DEPARTMENT[room.id] != null ? ROOM_DEPARTMENT[room.id] : DEPT_OPS;
  return {
    id: room.id,
    name: room.name,
    no: 'DEMO-R-' + room.id,
    departmentId,
    departmentName: departmentNameForId(departmentId),
    gardenId: garden.gardenId,
    buildingId: building.id,
    floorId: floor.id,
    // Template typo in Room.vue: gradenName
    gradenName: garden.gardenName,
    buildingName: building.name,
    floorName: floor.name,
    senorStatus: roomSenorStatus(room.id, room),
    createDate: '2026-09-01 10:00:00',
    remark: '',
    openTwoSystem: 1,
    status: 1
  };
}

/** All demo rooms with full list/detail fields (shared entity walk). */
export function allDemoRoomRows() {
  const rows = [];
  for (const garden of DEMO_SPACE) {
    for (const building of garden.buildings) {
      for (const floor of building.subDivisions || []) {
        for (const room of (DEMO_FLOOR_ROOMS[floor.id] || [])) {
          rows.push(buildRoomRow({garden, building, floor, room}));
        }
      }
    }
  }
  return rows;
}

/**
 * Designer sidebar: Layout.vue sends only {floorId, pageNum, pageSize} —
 * no gardenId/buildingId/departmentId/status/objType keys, no keyword → empty.
 * Room management always spreads dashboardItem (gardenId etc.), so floor filter works.
 */
function isDesignerSidebarQuery(body = {}) {
  const hasFloor = body.floorId != null && String(body.floorId).trim() !== '';
  const keyword = String(body.keyword || '').trim();
  if (!hasFloor || keyword) return false;
  const managementKeys = ['gardenId', 'buildingId', 'departmentId', 'status', 'objType'];
  return !managementKeys.some(key => Object.prototype.hasOwnProperty.call(body, key));
}

function matchKeyword(row, keyword) {
  if (!keyword) return true;
  const q = keyword.toLowerCase();
  return [row.name, row.no].some(v => String(v).toLowerCase().includes(q));
}

function matchLocation(row, body = {}) {
  if (body.gardenId != null && String(body.gardenId).trim() !== '') {
    if (Number(row.gardenId) !== Number(body.gardenId)) return false;
  }
  if (body.buildingId != null && String(body.buildingId).trim() !== '') {
    if (Number(row.buildingId) !== Number(body.buildingId)) return false;
  }
  if (body.floorId != null && String(body.floorId).trim() !== '') {
    if (Number(row.floorId) !== Number(body.floorId)) return false;
  }
  return true;
}

function matchDepartment(row, departmentId) {
  if (departmentId == null || departmentId === '' || departmentId === '0' || departmentId === 0) return true;
  return Number(row.departmentId) === Number(departmentId);
}

function matchStatus(row, status) {
  if (status == null || status === '') return true;
  return Number(row.senorStatus) === Number(status);
}

/**
 * POST /room/list — room management table + designer empty sidebar + modal keyword.
 */
export function listRooms(body = {}) {
  const pageNum = Math.max(1, Number(body.pageNum) || 1);
  const pageSize = Math.max(1, Number(body.pageSize) || 10);
  if (isDesignerSidebarQuery(body)) {
    return {list: [], pageNum, pageSize, total: 0};
  }
  const keyword = String(body.keyword || '').trim();
  const filtered = allDemoRoomRows()
    .filter(row => matchLocation(row, body))
    .filter(row => matchDepartment(row, body.departmentId))
    .filter(row => matchStatus(row, body.status))
    .filter(row => matchKeyword(row, keyword));
  const start = (pageNum - 1) * pageSize;
  return {
    list: filtered.slice(start, start + pageSize),
    pageNum,
    pageSize,
    total: filtered.length
  };
}

/**
 * GET /room/dashboardV1 — location-scoped counts (not keyword/department/status).
 */
export function getRoomDashboard(params = {}) {
  const scoped = allDemoRoomRows().filter(row => matchLocation(row, params));
  return {
    totalNum: scoped.length,
    normalNum: scoped.filter(r => Number(r.senorStatus) === 1).length,
    policeNum: scoped.filter(r => Number(r.senorStatus) === 2).length,
    leaveNum: scoped.filter(r => Number(r.senorStatus) === -100).length,
    notMonitoringNum: scoped.filter(r => Number(r.senorStatus) === 3).length
  };
}

export function getDemoRoomDetail(roomId) {
  const ctx = findRoomContext(roomId);
  if (!ctx) return null;
  return buildRoomRow(ctx);
}

export function listRoomThings() {
  return {list: []};
}

/**
 * GET /room/monitor/instrument — instruments with space ownership AND on-map placement.
 */
export function listRoomMonitorInstrument(params = {}) {
  const roomId = params.roomId == null || params.roomId === '' ? null : Number(params.roomId);
  if (roomId == null || Number.isNaN(roomId)) return [];
  const typesFilter = params.types == null || params.types === '' || Number(params.types) === 0
    ? null
    : Number(params.types);
  const owned = listInstrumentsByRoomId(roomId);
  const onMapIds = new Set(
    (listRoonInstrumentInfo(roomId).list || []).map(item => Number(item.elementId || item.id))
  );
  return owned
    .map(resolveInstrumentEntity)
    .filter(Boolean)
    .filter(entity => onMapIds.has(Number(entity.id)))
    .filter(entity => typesFilter == null || Number(entity.types) === typesFilter)
    .map(entity => {
      const resolved = resolveInstrumentEntity(entity) || entity;
      const reading = sensorReadingForInstrument(resolved.id);
      return {
        id: resolved.id,
        name: resolved.name,
        logoUrl: resolved.assetKey || '',
        simpleEquipments: [{
          type: 1,
          powerFailure: false,
          sensors: [{
            id: reading.id,
            type: 1,
            status: reading.status,
            value: reading.val == null ? '' : reading.val,
            sensorType: {
              name: reading.sensorType.name,
              unit: reading.unit
            }
          }]
        }]
      };
    });
}

export function listRoomReports() {
  return {list: [], pageNum: 1, pageSize: 10, total: 0};
}

export function listThingsUsers() {
  return {list: [], pageNum: 1, pageSize: 10, total: 0};
}

/**
 * POST /room/export — filtered rooms as local XLSX (ignores pageNum/pageSize).
 * Reuses listRooms filters; empty filter → empty workbook (no full-list fallback).
 */
export async function exportDemoRooms(body = {}) {
  const filtered = listRooms({...body, pageNum: 1, pageSize: 10000});
  return createRoomExportWorkbook(filtered.list || []);
}

/** Empty room-level probe cards (objType 3); device slice keeps objType 2. */
export function getRoomOpenMonitorFlag() {
  return {list: []};
}

export function getRoomMonitorFlag() {
  return [];
}

export {ROOM_DEPARTMENT, DEPT_OPS, DEPT_RD};
