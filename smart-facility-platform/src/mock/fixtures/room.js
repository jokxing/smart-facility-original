import {DEMO_FLOOR_ROOMS} from './floor';
import {DEMO_SPACE} from './space';
import {findFloorById} from './mapFloor';
import {
  listInstrumentsByRoomId,
  listRoonInstrumentInfo,
  sensorReadingForInstrument,
  resolveInstrumentEntity,
  resetRoomInstrumentLayout
} from './instrument';
import {getDemoScenario, statusForScenario} from './scenario';
import {createRoomExportWorkbook} from '../roomWorkbook';
import storage from '../storage';
import {isActiveDepartment, findDepartmentById} from './auth';
import {isDemoMediaKey} from '../../utils/demoMediaStore';
import {DEMO_ROOM_MAP_REGISTRY} from '../../utils/demoRoomMapUrl';

const DEPT_OPS = 900101;
const DEPT_RD = 900102;
const ROOM_CREATED_KEY = 'roomCreated';
const ROOM_META_KEY = 'roomMeta';
const ROOM_DELETED_KEY = 'roomDeleted';
const ROOM_ID_MIN = 950201;
const ROOM_ID_MAX = 950250;

/** Room → department for list/detail filters (shared with dashboard). */
const ROOM_DEPARTMENT = Object.freeze({
  950001: DEPT_OPS,
  950002: DEPT_OPS,
  950003: DEPT_RD
});

function readCreatedRooms() {
  try {
    const raw = storage.getItem(ROOM_CREATED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(item => item && Number.isFinite(Number(item.id))) : [];
  } catch (_) {
    return [];
  }
}

function writeCreatedRooms(list) {
  storage.setItem(ROOM_CREATED_KEY, JSON.stringify(list));
}

function readRoomMeta() {
  try {
    const raw = storage.getItem(ROOM_META_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (_) {
    return {};
  }
}

function writeRoomMeta(map) {
  storage.setItem(ROOM_META_KEY, JSON.stringify(map));
}

function readDeletedRooms() {
  try {
    const raw = storage.getItem(ROOM_DELETED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(Number).filter(Number.isFinite) : [];
  } catch (_) {
    return [];
  }
}

function writeDeletedRooms(list) {
  storage.setItem(ROOM_DELETED_KEY, JSON.stringify(list));
}

export function clearRoomCreated() {
  storage.removeItem(ROOM_CREATED_KEY);
}
export function clearRoomMeta() {
  storage.removeItem(ROOM_META_KEY);
}
export function clearRoomDeleted() {
  storage.removeItem(ROOM_DELETED_KEY);
}

function departmentNameForId(departmentId) {
  const row = findDepartmentById(departmentId);
  if (row) return row.name || row.departmentName || '';
  return Number(departmentId) === DEPT_RD ? '演示研发部' : '演示运维部';
}

function findRoomContext(roomId) {
  const key = Number(roomId);
  if (readDeletedRooms().includes(key)) return null;
  for (const garden of DEMO_SPACE) {
    for (const building of garden.buildings) {
      for (const floor of building.subDivisions || []) {
        const rooms = DEMO_FLOOR_ROOMS[floor.id] || [];
        const room = rooms.find(item => item.id === key);
        if (room) return {garden, building, floor, room, source: 'seed'};
      }
    }
  }
  const created = readCreatedRooms().find(item => Number(item.id) === key);
  if (created) {
    const floor = findFloorById(created.floorId);
    if (!floor) return null;
    const garden = DEMO_SPACE.find(g => Number(g.gardenId) === Number(floor.gardenId));
    const building = garden && garden.buildings.find(b => Number(b.id) === Number(floor.buildingId));
    if (!garden || !building) return null;
    return {
      garden,
      building,
      floor: {id: floor.id, name: floor.name, mapId: floor.mapId, mapUrl: floor.mapUrl},
      room: created,
      source: 'created'
    };
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

function applyRoomMeta(row) {
  if (!row) return null;
  const patch = readRoomMeta()[String(row.id)] || {};
  return {...row, ...patch};
}

function buildRoomRow(ctx) {
  const {garden, building, floor, room} = ctx;
  const baseDept = ROOM_DEPARTMENT[room.id] != null ? ROOM_DEPARTMENT[room.id] : (room.departmentId || DEPT_OPS);
  const row = applyRoomMeta({
    id: room.id,
    name: room.name,
    no: room.no || ('DEMO-R-' + room.id),
    departmentId: room.departmentId != null ? room.departmentId : baseDept,
    departmentName: '',
    gardenId: garden.gardenId,
    buildingId: building.id,
    floorId: floor.id,
    // Template typo in Room.vue: gradenName
    gradenName: garden.gardenName,
    buildingName: building.name,
    floorName: floor.name,
    senorStatus: roomSenorStatus(room.id, room),
    createDate: room.createDate || '2026-09-01 10:00:00',
    remark: room.remark || '',
    openTwoSystem: 1,
    status: 1,
    mapUrl: room.mapUrl || ''
  });
  row.departmentName = departmentNameForId(row.departmentId);
  // floor relocate via meta
  if (row.floorId) {
    const relocated = findFloorById(row.floorId);
    if (relocated) {
      row.floorId = relocated.id;
      row.floorName = relocated.name;
      row.buildingId = relocated.buildingId;
      row.buildingName = relocated.buildingName;
      row.gardenId = relocated.gardenId;
      row.gradenName = relocated.gardenName;
    }
  }
  return row;
}

/** All demo rooms with full list/detail fields (shared entity walk). */
export function allDemoRoomRows() {
  const deleted = new Set(readDeletedRooms());
  const rows = [];
  for (const garden of DEMO_SPACE) {
    for (const building of garden.buildings) {
      for (const floor of building.subDivisions || []) {
        for (const room of (DEMO_FLOOR_ROOMS[floor.id] || [])) {
          if (deleted.has(Number(room.id))) continue;
          rows.push(buildRoomRow({garden, building, floor, room, source: 'seed'}));
        }
      }
    }
  }
  for (const created of readCreatedRooms()) {
    if (deleted.has(Number(created.id))) continue;
    const ctx = findRoomContext(created.id);
    if (ctx) rows.push(buildRoomRow(ctx));
  }
  return rows;
}

/** Valid floor-marker coords (not missing / not sentinel -9999). */
export function hasValidFloorMarkerCoords(room) {
  if (!room) return false;
  const x = Number(room.x);
  const y = Number(room.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
  if (x <= -1000 || y <= -1000) return false;
  return true;
}

function markerDefaults(room, meta = {}) {
  return {
    id: room.id,
    name: meta.name || room.name,
    x: meta.x != null ? meta.x : room.x,
    y: meta.y != null ? meta.y : room.y,
    width: meta.width != null ? meta.width : (room.width != null ? room.width : 180),
    fontSize: meta.fontSize != null ? meta.fontSize : (room.fontSize != null ? room.fontSize : 20),
    color: meta.color || room.color || '#cfe9f8',
    scaleX: meta.scaleX != null ? meta.scaleX : (room.scaleX != null ? room.scaleX : 1),
    scaleY: meta.scaleY != null ? meta.scaleY : (room.scaleY != null ? room.scaleY : 1),
    senorStatus: room.senorStatus != null ? room.senorStatus : 3,
    isEdit: true,
    equipments: room.equipments || [],
    mapUrl: meta.mapUrl || room.mapUrl || ''
  };
}

/**
 * Markers for floor overview: only rooms with valid layout coords on this floor.
 * Unplaced rooms (no x/y or sentinel) belong in designer candidate list, not labList.
 */
export function listRoomMarkersForFloor(floorId) {
  const key = Number(floorId);
  if (!Number.isFinite(key)) return [];
  const {floorRoomLayout} = require('./floorRoomLayout');
  const layout = floorRoomLayout(key);
  if (layout) {
    const rows = allDemoRoomRows().filter(room => Number(room.floorId) === key);
    return layout.list.map(position => {
      const room = rows.find(row => Number(row.id) === Number(position.elementId));
      return room ? {...markerDefaults(room), x: position.x, y: position.y} : null;
    }).filter(Boolean);
  }
  const deleted = new Set(readDeletedRooms());
  const markers = [];

  for (const room of (DEMO_FLOOR_ROOMS[key] || [])) {
    if (deleted.has(Number(room.id))) continue;
    const meta = readRoomMeta()[String(room.id)] || {};
    if (meta.floorId != null && Number(meta.floorId) !== key) continue;
    const marker = markerDefaults(room, meta);
    if (hasValidFloorMarkerCoords(marker)) markers.push(marker);
  }

  for (const room of readCreatedRooms()) {
    if (deleted.has(Number(room.id))) continue;
    const meta = readRoomMeta()[String(room.id)] || {};
    const floorIdFinal = meta.floorId != null ? Number(meta.floorId) : Number(room.floorId);
    if (floorIdFinal !== key) continue;
    const marker = markerDefaults(room, meta);
    if (hasValidFloorMarkerCoords(marker)) markers.push(marker);
  }

  return markers;
}

/** Business rooms on floor that are not yet placed on the floor map. */
export function listUnplacedRoomsForFloor(floorId) {
  const key = Number(floorId);
  if (!Number.isFinite(key)) return [];
  const placedIds = new Set(listRoomMarkersForFloor(key).map(r => Number(r.id)));
  return allDemoRoomRows()
    .filter(row => Number(row.floorId) === key && !placedIds.has(Number(row.id)));
}

export function isRoomPlacedOnFloor(roomId, floorId) {
  return listRoomMarkersForFloor(floorId).some(r => Number(r.id) === Number(roomId));
}

function isAllowedRoomMapKey(value) {
  const key = String(value || '').trim();
  if (!key) return true;
  if (Object.prototype.hasOwnProperty.call(DEMO_ROOM_MAP_REGISTRY, key)) return true;
  return isDemoMediaKey(key);
}

function roomHasAssociations(roomId) {
  const instruments = listInstrumentsByRoomId(roomId) || [];
  if (instruments.length) return {blocked: true, message: '房间仍有关联设备，无法删除或跨楼宇迁移。'};
  try {
    const {listBoundEquipmentForRoom} = require('./equipment');
    const bound = listBoundEquipmentForRoom(roomId) || [];
    if (bound.length) return {blocked: true, message: '房间仍有关联智能硬件，无法删除或跨楼宇迁移。'};
  } catch (_) {}
  const layout = listRoonInstrumentInfo(roomId);
  if (layout && layout.list && layout.list.length) {
    return {blocked: true, message: '房间仍有设备布局，无法删除。'};
  }
  return {blocked: false};
}

function freeRoomId() {
  const used = new Set(allDemoRoomRows().map(r => Number(r.id)).concat(readDeletedRooms()));
  for (let id = ROOM_ID_MIN; id <= ROOM_ID_MAX; id++) {
    if (!used.has(id)) return id;
  }
  return null;
}

export function createDemoRoom(body = {}) {
  const name = String(body.name || '').trim();
  const no = String(body.no || '').trim();
  const departmentId = Number(body.departmentId);
  const floorId = Number(body.floorId);
  const remark = String(body.remark || '').trim();
  const mapUrl = String(body.mapUrl || (body.media && body.media.url) || '').trim();
  if (!name) return {ok: false, message: '请输入房间名称。'};
  if (!no) return {ok: false, message: '请输入房间编号。'};
  if (!isActiveDepartment(departmentId)) return {ok: false, message: '所属部门无效。'};
  const floor = findFloorById(floorId);
  if (!floor) return {ok: false, message: '所属楼层不存在。'};
  if (mapUrl && !isAllowedRoomMapKey(mapUrl)) return {ok: false, message: '房间底图无效。'};
  if (allDemoRoomRows().some(r => r.no === no)) return {ok: false, message: '房间编号已存在。'};
  const id = freeRoomId();
  if (id == null) return {ok: false, message: '新建房间数量已达演示上限。'};
  const row = {
    id,
    name,
    no,
    departmentId,
    floorId,
    buildingId: floor.buildingId,
    remark,
    mapUrl,
    createDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
    senorStatus: 3,
    isEdit: true,
    equipments: []
  };
  writeCreatedRooms(readCreatedRooms().concat([row]));
  return {ok: true, item: getDemoRoomDetail(id)};
}

export function updateDemoRoomBasic(body = {}) {
  const id = Number(body.id);
  const name = String(body.name || '').trim();
  const no = String(body.no || '').trim();
  const departmentId = Number(body.departmentId);
  const floorId = Number(body.floorId);
  const remark = String(body.remark != null ? body.remark : '').trim();
  const nextMap = body.mapUrl != null
    ? String(body.mapUrl).trim()
    : (body.media && body.media.url != null ? String(body.media.url).trim() : null);
  if (!Number.isFinite(id)) return {ok: false, message: '房间不存在。'};
  const current = getDemoRoomDetail(id);
  if (!current) return {ok: false, message: '房间不存在。'};
  if (!name) return {ok: false, message: '请输入房间名称。'};
  if (!no) return {ok: false, message: '请输入房间编号。'};
  if (!isActiveDepartment(departmentId)) return {ok: false, message: '所属部门无效。'};
  const floor = findFloorById(floorId);
  if (!floor) return {ok: false, message: '所属楼层不存在。'};
  if (allDemoRoomRows().some(r => r.no === no && Number(r.id) !== id)) {
    return {ok: false, message: '房间编号已存在。'};
  }
  if (Number(floor.buildingId) !== Number(current.buildingId)) {
    const assoc = roomHasAssociations(id);
    if (assoc.blocked) return {ok: false, message: '含设备或硬件的房间不能跨楼宇迁移。'};
  }
  if (nextMap != null && nextMap !== '' && !isAllowedRoomMapKey(nextMap)) {
    return {ok: false, message: '房间底图无效。'};
  }
  const created = readCreatedRooms();
  const idx = created.findIndex(r => Number(r.id) === id);
  const movedFloor = Number(current.floorId) !== floorId;
  if (movedFloor) require('./floorRoomLayout').clearRoomFloorPlacement(id);
  if (idx >= 0) {
    const row = {
      ...created[idx],
      name,
      no,
      departmentId,
      floorId,
      buildingId: floor.buildingId,
      remark
    };
    if (nextMap != null) row.mapUrl = nextMap;
    if (movedFloor) {row.x = -9999; row.y = -9999;}
    created[idx] = row;
    writeCreatedRooms(created);
  } else {
    const meta = readRoomMeta();
    const patch = {
      ...(meta[String(id)] || {}),
      name,
      no,
      departmentId,
      floorId,
      remark
    };
    if (nextMap != null) patch.mapUrl = nextMap;
    if (movedFloor) {patch.x = -9999; patch.y = -9999;}
    meta[String(id)] = patch;
    writeRoomMeta(meta);
  }
  return {ok: true, item: getDemoRoomDetail(id)};
}

export function removeDemoRoom(roomId) {
  const id = Number(roomId);
  const detail = getDemoRoomDetail(id);
  if (!detail) return {ok: false, message: '房间不存在。'};
  const assoc = roomHasAssociations(id);
  if (assoc.blocked) return {ok: false, message: assoc.message};
  require('./floorRoomLayout').clearRoomFloorPlacement(id);
  const created = readCreatedRooms().filter(r => Number(r.id) !== id);
  writeCreatedRooms(created);
  if ((DEMO_FLOOR_ROOMS[930001] || []).some(r => Number(r.id) === id)) {
    writeDeletedRooms(Array.from(new Set(readDeletedRooms().concat([id]))));
  }
  const meta = readRoomMeta();
  delete meta[String(id)];
  writeRoomMeta(meta);
  try { resetRoomInstrumentLayout(id); } catch (_) {}
  return {ok: true};
}

export function getRoomMapUrlKey(roomId) {
  const detail = getDemoRoomDetail(roomId);
  if (!detail) return null;
  if (detail.mapUrl) return detail.mapUrl;
  return null;
}

/**
 * Designer sidebar: Layout.vue sends only {floorId, pageNum, pageSize} —
 * no gardenId/buildingId/departmentId/status/objType keys, no keyword.
 * Room management always spreads dashboardItem (gardenId etc.), so full list applies.
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
 * POST /room/list — room management table + designer unplaced sidebar + modal keyword.
 */
export function listRooms(body = {}) {
  const pageNum = Math.max(1, Number(body.pageNum) || 1);
  const pageSize = Math.max(1, Number(body.pageSize) || 10);
  if (isDesignerSidebarQuery(body)) {
    const unplaced = listUnplacedRoomsForFloor(body.floorId);
    const start = (pageNum - 1) * pageSize;
    return {
      list: unplaced.slice(start, start + pageSize),
      pageNum,
      pageSize,
      total: unplaced.length
    };
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
