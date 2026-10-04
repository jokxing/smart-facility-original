import {readInstrumentWorkbook, createInstrumentExportWorkbook} from '../instrumentWorkbook';
/**
 * Shared lab instruments + room-local layouts for getRoonInstrumentInfoList.
 *
 * Coordinates are room-canvas space 1600×790 (RoomView / RoomDesigner Konva).
 * Task 8C: demo layout overrides persist under smart-facility-demo storage;
 * scenario still only changes status, never position.
 */

import storage from '../storage';
import {DEMO_NOW_MS, formatDemoDateTime, parseDemoDateTime} from '../clock';
import {isActiveDepartment, findDepartmentById} from './auth';
import {ROOM_BOUNDS, roomFrame, validPlacement} from '../../utils/demoLayoutGeometry';
import {getDemoScenario, statusForScenario} from './scenario';
import {allDemoRoomRows} from './room';

const FLOOR_W = 1678;
const FLOOR_H = 795;
const LAYOUT_STORAGE_KEY = 'roomLayoutOverrides';



function floorPctToRoomLocal(roomId, pctLeft, pctTop) {
  const bounds = ROOM_BOUNDS[roomId];
  const fx = (pctLeft / 100) * FLOOR_W;
  const fy = (pctTop / 100) * FLOOR_H;
  const frame = roomFrame(roomId);
  return {x: (fx - bounds.minX) * frame.scale + frame.x, y: (fy - bounds.minY) * frame.scale + frame.y};
}

const DEPT_OPS = 900101;
const DEPT_RD = 900102;
const INSTRUMENT_META_KEY = 'instrumentMeta';
const INSTRUMENT_DELETED_KEY = 'instrumentDeleted';
const INSTRUMENT_CREATED_KEY = 'instrumentCreated';
const IMPORT_ID_MIN = 970101;
const IMPORT_ID_MAX = 970150;
const ALLOWED_TYPES = new Set([1, 2]);


function typeNameFor(types) {
  return Number(types) === 2 ? '演示辅助设备' : '演示设备';
}

/** Room → garden/building/floor for list address filters (floor 930001 only). */
export const INSTRUMENT_ROOM_SPACE = Object.freeze({
  950001: {gardenId: 910001, buildingId: 920001, floorId: 930001, roomName: '演示房间 A'},
  950002: {gardenId: 910001, buildingId: 920001, floorId: 930001, roomName: '演示走廊'},
  950003: {gardenId: 910001, buildingId: 920001, floorId: 930001, roomName: '演示房间 B'}
});

/**
 * Shared entities — one device belongs to exactly one room.
 * departmentId: mostly ops; a few RD rows so department filter can empty/partial-match.
 * daysAgo: staggered createDate for client/table sort display.
 */
export const DEMO_INSTRUMENTS = Object.freeze([
  {id: 970001, name: '演示培养箱', roomId: 950001, assetKey: 'demo-device-incubator', types: 1, departmentId: DEPT_OPS, daysAgo: 29},
  {id: 970002, name: '演示冷藏柜', roomId: 950001, assetKey: 'demo-device-lab-refrigerator', types: 1, departmentId: DEPT_OPS, daysAgo: 28},
  {id: 970003, name: '演示温湿度仪', roomId: 950003, assetKey: 'demo-device-monitor-terminal', types: 1, departmentId: DEPT_OPS, daysAgo: 27},
  {id: 970004, name: '演示检测仪 A', roomId: 950001, assetKey: 'demo-device-analyzer', types: 1, departmentId: DEPT_OPS, daysAgo: 26},
  {id: 970005, name: '演示示波器 A', roomId: 950001, assetKey: 'demo-device-oscilloscope', types: 1, departmentId: DEPT_OPS, daysAgo: 25},
  {id: 970006, name: '演示设备机柜 B', roomId: 950003, assetKey: 'demo-device-equipment-rack', types: 1, departmentId: DEPT_OPS, daysAgo: 24},
  {id: 970007, name: '演示检测仪 B', roomId: 950003, assetKey: 'demo-device-analyzer', types: 1, departmentId: DEPT_RD, daysAgo: 23},
  {id: 970008, name: '演示示波器 B', roomId: 950003, assetKey: 'demo-device-oscilloscope', types: 1, departmentId: DEPT_RD, daysAgo: 22},
  {id: 970009, name: '演示培养箱 B', roomId: 950003, assetKey: 'demo-device-incubator', types: 1, departmentId: DEPT_RD, daysAgo: 21},
  {id: 970010, name: '演示冷藏柜 B', roomId: 950003, assetKey: 'demo-device-lab-refrigerator', types: 1, departmentId: DEPT_OPS, daysAgo: 20},
  {id: 970011, name: '演示监测终端 A', roomId: 950001, assetKey: 'demo-device-monitor-terminal', types: 1, departmentId: DEPT_OPS, daysAgo: 19},
  {id: 970012, name: '演示设备机柜 A', roomId: 950001, assetKey: 'demo-device-equipment-rack', types: 1, departmentId: DEPT_OPS, daysAgo: 18}
]);

const LAYOUT_SEEDS = Object.freeze([
  {elementId: 970001, roomId: 950001, pctLeft: 7.0918, pctTop: 24.0252, rotation: 90, scaleX: 1.05, scaleY: 1.05, sortIndex: 1},
  {elementId: 970002, roomId: 950001, pctLeft: 7.0918, pctTop: 14.2138, rotation: 90, scaleX: 1.05, scaleY: 1.05, sortIndex: 2},
  {elementId: 970012, roomId: 950001, pctLeft: 7.0918, pctTop: 33.8365, rotation: 90, scaleX: 1.05, scaleY: 1.05, sortIndex: 3},
  {elementId: 970004, roomId: 950001, pctLeft: 18.3552, pctTop: 27.2956, rotation: 0, scaleX: 1.1, scaleY: 1.1, sortIndex: 4},
  {elementId: 970005, roomId: 950001, pctLeft: 25.6257, pctTop: 27.2956, rotation: 0, scaleX: 1.1, scaleY: 1.1, sortIndex: 5},
  {elementId: 970011, roomId: 950001, pctLeft: 32.8963, pctTop: 27.2956, rotation: 0, scaleX: 1.1, scaleY: 1.1, sortIndex: 6},
  {elementId: 970010, roomId: 950003, pctLeft: 88.7962, pctTop: 14.2138, rotation: -90, scaleX: 1.05, scaleY: 1.05, sortIndex: 1},
  {elementId: 970009, roomId: 950003, pctLeft: 88.7962, pctTop: 24.0252, rotation: -90, scaleX: 1.05, scaleY: 1.05, sortIndex: 2},
  {elementId: 970006, roomId: 950003, pctLeft: 88.7962, pctTop: 33.8365, rotation: -90, scaleX: 1.05, scaleY: 1.05, sortIndex: 3},
  {elementId: 970007, roomId: 950003, pctLeft: 60.3695, pctTop: 27.2956, rotation: 0, scaleX: 1.1, scaleY: 1.1, sortIndex: 4},
  {elementId: 970008, roomId: 950003, pctLeft: 67.64, pctTop: 27.2956, rotation: 0, scaleX: 1.1, scaleY: 1.1, sortIndex: 5},
  {elementId: 970003, roomId: 950003, pctLeft: 74.9106, pctTop: 27.2956, rotation: 0, scaleX: 1.1, scaleY: 1.1, sortIndex: 6}
]);

function readCreatedInstruments() {
  try {
    const raw = storage.getItem(INSTRUMENT_CREATED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item => item && Number.isFinite(Number(item.id)));
  } catch (_) {
    return [];
  }
}

function writeCreatedInstruments(list) {
  storage.setItem(INSTRUMENT_CREATED_KEY, JSON.stringify(list));
}

export function clearInstrumentCreated() {
  storage.removeItem(INSTRUMENT_CREATED_KEY);
}

function instrumentById(id) {
  const key = Number(id);
  const seed = DEMO_INSTRUMENTS.find(item => item.id === key);
  if (seed) return seed;
  return readCreatedInstruments().find(item => Number(item.id) === key) || null;
}

/** Seed + imported overlays still alive (not tombstoned). */
export function listActiveInstrumentSeeds() {
  return activeInstrumentSeeds();
}

/** True when any live instrument (seed/import + meta) still references the department. */
export function hasActiveInstrumentInDepartment(departmentId) {
  const key = Number(departmentId);
  if (!Number.isFinite(key)) return false;
  return listActiveInstrumentSeeds().some(entity => {
    const resolved = resolveInstrumentEntity(entity);
    return resolved && Number(resolved.departmentId) === key;
  });
}

export function listImportRemoveIds() {
  const ids = [];
  for (let id = IMPORT_ID_MIN; id <= IMPORT_ID_MAX; id++) ids.push(id);
  return ids;
}

function readDeletedIds() {
  try {
    const raw = storage.getItem(INSTRUMENT_DELETED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(Number).filter(n => !Number.isNaN(n)) : [];
  } catch (_) {
    return [];
  }
}

function writeDeletedIds(ids) {
  storage.setItem(INSTRUMENT_DELETED_KEY, JSON.stringify([...new Set(ids.map(Number))]));
}

export function isInstrumentDeleted(id) {
  return readDeletedIds().includes(Number(id));
}

export function clearInstrumentDeleted() {
  storage.removeItem(INSTRUMENT_DELETED_KEY);
}

function activeInstrumentSeeds() {
  const created = readCreatedInstruments().filter(item => !isInstrumentDeleted(item.id));
  return DEMO_INSTRUMENTS.filter(item => !isInstrumentDeleted(item.id)).concat(created);
}

export function instrumentImportOptions() {
  return {
    departments: [DEPT_OPS, DEPT_RD].map(id => ({id, name: departmentNameForId(id)})),
    types: [...ALLOWED_TYPES].map(id => ({id, name: typeNameFor(id)})),
    rooms: allDemoRoomRows().map(room => ({id: Number(room.id), name: room.name}))
  };
}

function freeImportIds() {
  const created = readCreatedInstruments();
  const used = new Set(created.map(item => Number(item.id)).concat(readDeletedIds()));
  const free = [];
  for (let id = IMPORT_ID_MIN; id <= IMPORT_ID_MAX; id++) if (!used.has(id)) free.push(id);
  return {created, free};
}

/**
 * Shared business plan for preview + confirm. Does not write storage.
 * Collects per-row errors so the UI can show a full preview table.
 */
export function buildInstrumentImportPlan(rows) {
  const options = instrumentImportOptions();
  const known = new Set(activeInstrumentSeeds().map(resolveInstrumentEntity).filter(Boolean).map(item => item.roomId + ':' + item.name.trim()));
  const previewRows = [];
  const planned = [];
  for (const {rowNumber, cells} of rows) {
    const [name, department, type, room] = cells;
    let error = '';
    let departmentId = null;
    let types = null;
    let roomId = null;
    if (name.length < 2 || name.length > 26) error = '名称必须为 2–26 字。';
    const dept = options.departments.find(item => item.name === department);
    const category = options.types.find(item => item.name === type);
    const space = options.rooms.find(item => item.name === room);
    if (!error && !dept) error = '部门不在模板可选范围内。';
    if (!error && !category) error = '分类不在模板可选范围内。';
    if (!error && !space) error = '房间不在模板可选范围内。';
    if (!error) {
      const key = space.id + ':' + name;
      if (known.has(key)) error = '同房间设备名称重复（含已有设备或本批次）。';
      else {
        known.add(key);
        departmentId = dept.id;
        types = category.id;
        roomId = space.id;
        planned.push({
          name, departmentId, types, roomId,
          assetKey: 'demo-device-incubator', daysAgo: 0, imported: true
        });
      }
    }
    previewRows.push({
      rowNumber,
      name,
      department,
      type,
      room,
      departmentId,
      types,
      roomId,
      error
    });
  }
  const {created, free} = freeImportIds();
  let message = '';
  if (previewRows.some(item => item.error)) {
    message = '存在校验错误，请修正后重新选择文件。';
  } else if (planned.length > free.length) {
    message = '剩余导入容量为 ' + free.length + ' 台，本批次未写入。';
    previewRows.forEach(item => { item.error = message; });
  }
  const ok = !message && planned.length > 0;
  return {
    ok,
    message: ok ? '' : (message || '请至少填写一行设备。'),
    rows: previewRows,
    planned: ok ? planned : [],
    created,
    free,
    validCount: planned.length,
    freeCount: free.length
  };
}

async function readImportRowsFromBody(body = {}) {
  const files = Array.isArray(body.files) ? body.files : (body.files ? [body.files] : []);
  if (files.length !== 1) return {ok: false, message: '每次请选择一个 .xlsx 文件。'};
  try {
    return {ok: true, rows: await readInstrumentWorkbook(files[0])};
  } catch (error) {
    return {ok: false, message: error.message || '读取失败，请重新选择文件。'};
  }
}

/** POST /instrument/import/preview — validate only; never writes. */
export async function previewDemoInstruments(body = {}) {
  const read = await readImportRowsFromBody(body);
  if (!read.ok) return {ok: false, message: read.message, rows: []};
  const plan = buildInstrumentImportPlan(read.rows);
  return {
    ok: plan.ok,
    message: plan.message,
    rows: plan.rows,
    validCount: plan.validCount,
    freeCount: plan.freeCount
  };
}

/** Parse first; validate against current state and commit synchronously after the last await. */
export async function importDemoInstruments(body = {}) {
  const read = await readImportRowsFromBody(body);
  if (!read.ok) return {ok: false, message: read.message};
  const plan = buildInstrumentImportPlan(read.rows);
  if (!plan.ok) {
    const firstError = plan.rows.find(item => item.error);
    return {
      ok: false,
      message: firstError ? ('第 ' + firstError.rowNumber + ' 行：' + firstError.error) : plan.message
    };
  }
  const entities = plan.planned.map((item, index) => ({...item, id: plan.free[index]}));
  try { writeCreatedInstruments(plan.created.concat(entities)); }
  catch (_) { return {ok: false, message: '本地保存失败，请检查浏览器存储空间后重试。'}; }
  return {...entities[0], ok: true, count: entities.length, ids: entities.map(item => item.id)};
}

/**
 * POST /instrument/add — create one instrument into the same import id pool.
 * Persists name/departmentId/types/roomId; other body fields accepted but ignored.
 * Marked imported:true so it is registered but not auto-placed on room layout.
 */
export function addDemoInstrument(body = {}) {
  const name = String(body.name == null ? '' : body.name).trim();
  if (name.length < 2 || name.length > 26) {
    return {ok: false, message: '请填写 2–26 字的设备名称。'};
  }
  const departmentId = Number(body.departmentId);
  if (!isActiveDepartment(departmentId)) {
    return {ok: false, message: '请选择有效部门。'};
  }
  const types = Number(body.types);
  if (!ALLOWED_TYPES.has(types)) {
    return {ok: false, message: '请选择有效设备分类。'};
  }
  const roomId = Number(body.roomId);
  if (!allDemoRoomRows().some(room => Number(room.id) === roomId)) {
    return {ok: false, message: '请选择有效房间。'};
  }
  const dupKey = roomId + ':' + name;
  const known = activeInstrumentSeeds()
    .map(resolveInstrumentEntity)
    .filter(Boolean)
    .some(item => item.roomId + ':' + String(item.name).trim() === dupKey);
  if (known) return {ok: false, message: '同房间设备名称重复。'};
  const {created, free} = freeImportIds();
  if (!free.length) return {ok: false, message: '剩余导入容量为 0 台，本条未写入。'};
  const entity = {
    id: free[0],
    name,
    departmentId,
    types,
    roomId,
    assetKey: 'demo-device-incubator',
    daysAgo: 0,
    imported: true
  };
  try { writeCreatedInstruments(created.concat([entity])); }
  catch (_) { return {ok: false, message: '本地保存失败，请检查浏览器存储空间后重试。'}; }
  return {
    ok: true,
    id: entity.id,
    name: entity.name,
    count: 1,
    ids: [entity.id],
    departmentId: entity.departmentId,
    roomId: entity.roomId,
    types: entity.types
  };
}

function pruneDeletedFromLayouts(deletedId) {
  const key = Number(deletedId);
  const map = readOverrides();
  let changed = false;
  for (const roomId of Object.keys(map)) {
    const items = map[roomId];
    if (!Array.isArray(items)) continue;
    const next = items.filter(item => {
      const elementId = Number(item.elementId != null ? item.elementId : item.id);
      return elementId !== key;
    });
    if (next.length !== items.length) {
      map[roomId] = next;
      changed = true;
    }
  }
  if (changed) writeOverrides(map);
}

/**
 * POST /instrument/remove/:id — tombstone overlay; keeps DEMO_INSTRUMENTS seed immutable.
 */
export function removeInstrument(id) {
  const key = Number(id);
  const seed = instrumentById(key);
  if (!seed) return {ok: false, message: '演示设备不存在。'};
  if (isInstrumentDeleted(key)) return {ok: false, message: '演示设备已删除。'};
  if (boundEquipmentTypesForInstrument(key).length) return {ok: false, message: '该设备已绑定智能硬件，请先解绑后删除。'};
  writeDeletedIds(readDeletedIds().concat(key));
  const meta = readInstrumentMeta();
  if (meta[String(key)]) {
    delete meta[String(key)];
    writeInstrumentMeta(meta);
  }
  pruneDeletedFromLayouts(key);
  return {ok: true, id: key, roomId: seed.roomId};
}

/**
 * POST /instrument/batch/delete — atomic tombstone; same guards as single remove.
 * Body: {ids: number[]}
 */
export function batchRemoveInstruments(body = {}) {
  const ids = [...new Set((Array.isArray(body && body.ids) ? body.ids : [])
    .map(Number)
    .filter(n => !Number.isNaN(n)))];
  if (!ids.length) return {ok: false, message: '请选择要删除的设备。'};
  for (const id of ids) {
    const seed = instrumentById(id);
    if (!seed || isInstrumentDeleted(id)) {
      return {ok: false, message: '存在无效或已删除的设备，本批次未删除。'};
    }
    if (boundEquipmentTypesForInstrument(id).length) {
      return {ok: false, message: '存在已绑定智能硬件的设备，请先解绑后删除。'};
    }
  }
  const deleted = [];
  for (const id of ids) {
    const result = removeInstrument(id);
    if (!result.ok) return {ok: false, message: result.message || '批量删除失败。'};
    deleted.push(result.id);
  }
  return {ok: true, count: deleted.length, ids: deleted};
}

function readInstrumentMeta() {
  try {
    const raw = storage.getItem(INSTRUMENT_META_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (_) {
    return {};
  }
}

function writeInstrumentMeta(map) {
  storage.setItem(INSTRUMENT_META_KEY, JSON.stringify(map));
}

/** Seed + overlay (name / departmentId / types). Used by list, detail, layout, bindable. */
export function resolveInstrumentEntity(entity) {
  if (!entity || isInstrumentDeleted(entity.id)) return null;
  const patch = readInstrumentMeta()[String(entity.id)] || {};
  return {
    ...entity,
    name: patch.name != null ? patch.name : entity.name,
    departmentId: patch.departmentId != null ? patch.departmentId : entity.departmentId,
    types: patch.types != null ? patch.types : entity.types,
    roomId: patch.roomId != null ? patch.roomId : entity.roomId
  };
}

export function clearInstrumentMeta() {
  storage.removeItem(INSTRUMENT_META_KEY);
}

/**
 * POST /instrument/update/basic — persist name + department + category (types).
 * Other body fields accepted but ignored for demo overlay.
 */
export function updateInstrumentBasic(body = {}) {
  const id = Number(body && body.id);
  const seed = instrumentById(id);
  if (!seed || isInstrumentDeleted(id)) return {ok: false, message: '演示设备不存在。'};
  const current = resolveInstrumentEntity(seed);
  const roomId = body.roomId == null ? current.roomId : Number(body.roomId);
  if (!allDemoRoomRows().some(room => Number(room.id) === roomId)) return {ok: false, message: '请选择有效房间。'};
  const name = String(body.name == null ? '' : body.name).trim();
  if (name.length < 2 || name.length > 26) {
    return {ok: false, message: '请填写 2–26 字的设备名称。'};
  }
  const departmentId = Number(body.departmentId);
  if (!isActiveDepartment(departmentId)) {
    return {ok: false, message: '请选择有效部门。'};
  }
  const types = body.types == null || body.types === '' ? current.types : Number(body.types);
  if (!ALLOWED_TYPES.has(types)) {
    return {ok: false, message: '请选择有效设备分类。'};
  }
  const duplicate = activeInstrumentSeeds().map(resolveInstrumentEntity).some(item =>
    item && Number(item.id) !== id && Number(item.roomId) === roomId && item.name.trim() === name);
  if (duplicate) return {ok: false, message: '同房间设备名称重复。'};
  const next = {...readInstrumentMeta()};
  const oldLayoutValue = storage.getItem(LAYOUT_STORAGE_KEY);
  if (roomId !== current.roomId) {
    // Materialize the old snapshot so moving back cannot resurrect a seed position.
    const layouts = readOverrides();
    layouts[String(current.roomId)] = placementsForRoom(current.roomId).filter(item => item.elementId !== id);
    try { writeOverrides(layouts); } catch (_) { return {ok: false, message: '本地布局保存失败，请重试。'}; }
  }
  next[String(id)] = {name, departmentId, types, roomId};
  try { writeInstrumentMeta(next); } catch (_) {
    try {
      if (oldLayoutValue == null) storage.removeItem(LAYOUT_STORAGE_KEY);
      else storage.setItem(LAYOUT_STORAGE_KEY, oldLayoutValue);
    } catch (_) {}
    return {ok: false, message: '本地设备保存失败，请重试。'};
  }
  return {
    ok: true,
    id,
    name,
    departmentId,
    departmentName: departmentNameForId(departmentId),
    roomId,
    types,
    typeName: typeNameFor(types)
  };
}

function readOverrides() {
  try {
    const raw = storage.getItem(LAYOUT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && parsed.version === 2 && parsed.rooms && typeof parsed.rooms === 'object' && !Array.isArray(parsed.rooms) ? parsed.rooms : {};
  } catch (_) {
    return {};
  }
}

function writeOverrides(map) {
  storage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify({version: 2, rooms: map}));
}

function seedPlacement(seed) {
  const width = Math.abs(seed.rotation) === 90 ? 56 : 52;
  const height = width * 144 / 128;
  const pos = floorPctToRoomLocal(seed.roomId, seed.pctLeft + width / 2 / FLOOR_W * 100, seed.pctTop + height / 2 / FLOOR_H * 100);
  const scale = width * roomFrame(seed.roomId).scale / 128;
  return {
    elementId: seed.elementId,
    roomId: seed.roomId,
    x: pos.x,
    y: pos.y,
    rotation: seed.rotation,
    scaleX: scale,
    scaleY: scale,
    sortIndex: seed.sortIndex
  };
}

function placementsForRoom(roomId) {
  const seeds = LAYOUT_SEEDS
    .filter(seed => seed.roomId === roomId && !isInstrumentDeleted(seed.elementId))
    .map(seedPlacement);
  const overrides = readOverrides()[String(roomId)];
  if (!Array.isArray(overrides)) return seeds.filter(item => resolveInstrumentEntity(instrumentById(item.elementId)).roomId === roomId);
  const filtered = overrides
    .filter(item => {
      const entity = resolveInstrumentEntity(instrumentById(item.elementId != null ? item.elementId : item.id));
      return entity && entity.roomId === roomId;
    })
    .map(item => ({...item, type: 4}));
  if (!filtered.length) return [];
  const result = validateLayout(filtered, roomId);
  return result.ok ? result.items : seeds.filter(item => resolveInstrumentEntity(instrumentById(item.elementId)).roomId === roomId);
}

export function listInstrumentsByRoomId(roomId) {
  const key = roomId == null || roomId === '' ? null : Number(roomId);
  if (key == null || Number.isNaN(key)) return [];
  // Created and imported records share ownership and layout eligibility.
  return activeInstrumentSeeds().map(resolveInstrumentEntity).filter(item => item && item.roomId === key);
}

export function listInstrumentsForFloorRooms(roomIds) {
  const idSet = new Set((roomIds || []).map(Number).filter(n => !Number.isNaN(n)));
  return activeInstrumentSeeds().map(resolveInstrumentEntity).filter(item => item && idSet.has(item.roomId));
}

/**
 * Persist type:4 room instrument layout. Returns {ok, message?, roomId?, count?}.
 */
function validateLayout(items, requiredRoomId) {
  if (!Array.isArray(items) || (!items.length && requiredRoomId == null)) {
    return {ok: false, message: '布局列表不能为空。'};
  }
  if (requiredRoomId != null && !allDemoRoomRows().some(room => Number(room.id) === Number(requiredRoomId))) return {ok: false, message: '房间不存在。'};
  if (!items.length) return {ok: true, roomId: Number(requiredRoomId), items: []};
  const roomIds = new Set();
  const normalized = [];
  const seen = new Set();
  for (const raw of items) {
    if (!raw || Number(raw.type) !== 4) {
      return {ok: false, message: '演示仅接受设备布局（type:4）。'};
    }
    const elementId = Number(raw.elementId != null ? raw.elementId : raw.id);
    const entity = resolveInstrumentEntity(instrumentById(elementId));
    if (!entity || isInstrumentDeleted(elementId) || seen.has(elementId)) {
      return {ok: false, message: '存在未知设备，已拒绝保存。'};
    }
    seen.add(elementId);
    const roomId = Number(raw.mediaId != null ? raw.mediaId : (raw.roomId != null ? raw.roomId : entity.roomId));
    if (roomId !== entity.roomId || (requiredRoomId != null && roomId !== Number(requiredRoomId))
      || (raw.roomId != null && Number(raw.roomId) !== roomId) || (raw.id != null && Number(raw.id) !== elementId)) {
      return {ok: false, message: '设备与房间不匹配，已拒绝保存。'};
    }
    const number = value => (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) ? Number(value) : NaN;
    const item = {elementId, roomId};
    for (const key of ['x', 'y', 'rotation', 'scaleX', 'scaleY', 'sortIndex']) item[key] = number(raw[key]);
    if (!validPlacement(item, roomId)) return {ok: false, message: '设备尺寸、角度或完整边界无效，未保存。'};
    roomIds.add(roomId);
    normalized.push(item);
  }
  if (roomIds.size !== 1) {
    return {ok: false, message: '单次保存只能包含同一房间的设备。'};
  }
  const roomId = [...roomIds][0];
  return {ok: true, roomId, items: normalized.sort((a, b) => a.sortIndex - b.sortIndex)};
}

export function saveRoomInstrumentLayout(items, roomId) {
  const result = validateLayout(items, roomId);
  if (!result.ok) return result;
  const map = readOverrides();
  map[String(result.roomId)] = result.items;
  try { writeOverrides(map); } catch (_) { return {ok: false, message: '本地布局保存失败，请重试。'}; }
  return {ok: true, roomId: result.roomId, count: result.items.length};
}

export function resetRoomInstrumentLayout(roomId) {
  const key = roomId == null || roomId === '' ? null : Number(roomId);
  if (key == null || Number.isNaN(key) || !allDemoRoomRows().some(room => Number(room.id) === key)) {
    return {ok: false, message: '无效房间，无法重置布局。'};
  }
  const map = readOverrides();
  delete map[String(key)];
  try { writeOverrides(map); } catch (_) { return {ok: false, message: '本地布局保存失败，请重试。'}; }
  return {ok: true, roomId: key};
}

export function clearAllRoomLayoutOverrides() {
  storage.removeItem(LAYOUT_STORAGE_KEY);
}

function roomNameForId(roomId) {
  const room = allDemoRoomRows().find(item => Number(item.id) === Number(roomId));
  return room ? room.name : '';
}

function departmentNameForId(departmentId) {
  const row = findDepartmentById(departmentId);
  return row ? row.name : (Number(departmentId) === DEPT_RD ? '演示研发部' : '演示运维部');
}

function instrumentNo(id) {
  return 'DEMO-EQ-' + id;
}

function createDateFor(entity) {
  const days = entity.daysAgo == null ? 29 : Number(entity.daysAgo);
  return formatDemoDateTime(DEMO_NOW_MS - days * 86400000);
}

/** Shared list/detail row fields from one instrument entity + current scenario. */
export function buildInstrumentRow(entity) {
  const resolved = resolveInstrumentEntity(entity);
  if (!resolved) return null;
  const {status, senorStatus} = statusForScenario(getDemoScenario());
  const boundHardware = boundEquipmentTypesForInstrument(resolved.id).length > 0;
  return {
    id: resolved.id,
    name: resolved.name,
    no: instrumentNo(resolved.id),
    types: resolved.types,
    detailType: 1,
    departmentId: resolved.departmentId,
    departmentName: departmentNameForId(resolved.departmentId),
    status,
    bingStatus: senorStatus,
    brand: '演示品牌',
    managerName: '演示负责人',
    price: 0,
    model: 'DEMO-M1',
    typeName: typeNameFor(resolved.types),
    roomId: resolved.roomId,
    roomName: roomNameForId(resolved.roomId),
    userName: '演示账号',
    createDate: createDateFor(resolved),
    companyName: '智慧设施演示空间',
    buyDate: '',
    nextMaintenanceDate: '',
    gradeName: '',
    labelNo: '',
    monitorStatus: null,
    logoUrl: '',
    layoutAssetKey: resolved.assetKey,
    qrUrl: '',
    labelId: null,
    boundHardware,
    standbyPowerFlag: false,
    bindingDeviceId: null,
    openTwoSystem: true,
    workingHours: 7.5,
    companyId: 900001,
    createUserId: 900001
  };
}

function asIdList(value) {
  if (value == null || value === '') return [];
  const raw = Array.isArray(value) ? value : [value];
  return raw.map(Number).filter(n => !Number.isNaN(n));
}

function matchRunningStatus(status, filter) {
  const key = Number(filter);
  if (Number.isNaN(key)) return true;
  if (key === 1) return Number(status) === 1;
  if (key === 0) return [0, -1, 2, -100].includes(Number(status));
  if (key === 4) return [3, 4].includes(Number(status));
  return Number(status) === key;
}

function matchSensorStatus(bingStatus, filter) {
  const key = Number(filter);
  if (Number.isNaN(key)) return true;
  if (key === 1) return Number(bingStatus) === 1;
  if (key === 2) return [2, -1].includes(Number(bingStatus));
  if (key === 3) {
    const n = Number(bingStatus);
    return n !== 1 && n !== 2 && n !== -1;
  }
  return Number(bingStatus) === key;
}

function matchSpace(entity, body) {
  const space = allDemoRoomRows().find(room => Number(room.id) === Number(entity.roomId));
  if (!space) return false;
  const roomIds = asIdList(body.roomIdList);
  if (roomIds.length) return roomIds.includes(entity.roomId);
  // Room detail「未监测」Tab uses single roomId (not roomIdList).
  if (body.roomId != null && String(body.roomId).trim() !== '') {
    return Number(body.roomId) === entity.roomId;
  }
  const floorIds = asIdList(body.floorIds);
  if (floorIds.length) return floorIds.includes(space.floorId);
  if (body.buildingId != null && String(body.buildingId).trim() !== '') {
    return Number(body.buildingId) === space.buildingId;
  }
  if (body.gardenId != null && String(body.gardenId).trim() !== '') {
    return Number(body.gardenId) === space.gardenId;
  }
  return true;
}

function isInstrumentOnMap(instrumentId, roomId) {
  const onMap = placementsForRoom(Number(roomId)).some(place => Number(place.elementId) === Number(instrumentId));
  return onMap;
}

function matchMonitorFlag(entity, monitor) {
  if (monitor == null || monitor === '') return true;
  const key = String(monitor);
  const onMap = isInstrumentOnMap(entity.id, entity.roomId);
  // monitor=1 已上图；monitor=2 空间归属但未上图
  if (key === '1') return onMap;
  if (key === '2') return !onMap;
  return true;
}

/** Room detail 未监测 Tab：type 4/0/空=全部；1/2/3 对齐仪器 types。 */
function matchListType(entity, type) {
  if (type == null || type === '') return true;
  const code = Number(type);
  if (Number.isNaN(code) || code === 0 || code === 4) return true;
  return Number(entity.types) === code;
}

/**
 * Optional hook: bound hardware type codes for an instrument (objType filter).
 * Injected from equipment fixture to avoid circular imports at module load.
 */
let boundEquipmentTypesForInstrument = () => [];

export function setBoundEquipmentTypesResolver(fn) {
  boundEquipmentTypesForInstrument = typeof fn === 'function' ? fn : (() => []);
}

function matchObjType(instrumentId, objType) {
  if (objType == null || objType === '') return true;
  const code = Number(objType);
  if (Number.isNaN(code)) return true;
  return boundEquipmentTypesForInstrument(instrumentId).includes(code);
}

/**
 * POST /instrument/list — labDevice table; derived from DEMO_INSTRUMENTS only.
 */
export function listInstruments(body = {}) {
  const pageNum = Math.max(1, Number(body.pageNum) || 1);
  const pageSize = Math.max(1, Number(body.pageSize) || 10);
  const keyword = String(body.keyword || '').trim().toLowerCase();
  const deptIds = asIdList(body.departmentIdList);
  const typesList = asIdList(body.typesList);
  const statusFilter = body.status;
  const sensorFilter = body.sensorStatus;

  const rows = activeInstrumentSeeds()
    .map(resolveInstrumentEntity)
    .filter(Boolean)
    .filter(entity => matchSpace(entity, body))
    .filter(entity => matchMonitorFlag(entity, body.monitor))
    .filter(entity => matchListType(entity, body.type))
    .filter(entity => !deptIds.length || deptIds.includes(Number(entity.departmentId)))
    .filter(entity => !typesList.length || typesList.includes(Number(entity.types)))
    .filter(entity => matchObjType(entity.id, body.objType))
    .map(buildInstrumentRow)
    .filter(row => {
      if (!keyword) return true;
      return [row.name, row.no, row.roomName].some(v => String(v).toLowerCase().includes(keyword));
    })
    .filter(row => statusFilter == null || statusFilter === '' || matchRunningStatus(row.status, statusFilter))
    .filter(row => sensorFilter == null || sensorFilter === '' || matchSensorStatus(row.bingStatus, sensorFilter));

  const start = (pageNum - 1) * pageSize;
  return {
    list: rows.slice(start, start + pageSize),
    total: rows.length,
    pageNum,
    pageSize
  };
}

/**
 * POST /instrument/export — filtered list as local XLSX (no external download service).
 * Ignores pageNum/pageSize and exports the full filtered set.
 */
export async function exportDemoInstruments(body = {}) {
  const filtered = listInstruments({...body, pageNum: 1, pageSize: 10000});
  return createInstrumentExportWorkbook(filtered.list || []);
}

/**
 * GET /instrument/dashboard/new — gather cards; universe counts (not list filters).
 */
export function getInstrumentDashboardNew() {
  const rows = activeInstrumentSeeds().map(buildInstrumentRow);
  const runNormal = rows.filter(r => Number(r.status) === 1).length;
  const runAbnormal = rows.filter(r => [0, -1, 2, -100].includes(Number(r.status))).length;
  const runRest = rows.filter(r => [3, 4].includes(Number(r.status))).length;
  const paramNormal = rows.filter(r => Number(r.bingStatus) === 1).length;
  const paramAbnormal = rows.filter(r => [2, -1].includes(Number(r.bingStatus))).length;
  const paramRest = rows.length - paramNormal - paramAbnormal;
  return {
    totalCount: rows.length,
    data: [
      {linaType: 5, normalCount: runNormal, abnormalCount: runAbnormal, restsCount: runRest},
      {linaType: 6, normalCount: paramNormal, abnormalCount: paramAbnormal, restsCount: paramRest}
    ]
  };
}

/**
 * GET /instrument/instrumentStatistics — Statistics 4B run/standby/close rings.
 * LABSTATUS: 1 run, 2 standby, 0 close. Other status codes count only in totalCount.
 */
export function getInstrumentStatistics() {
  const rows = activeInstrumentSeeds().map(buildInstrumentRow).filter(Boolean);
  return {
    totalCount: rows.length,
    runCount: rows.filter(r => Number(r.status) === 1).length,
    standbyCount: rows.filter(r => Number(r.status) === 2).length,
    closeCount: rows.filter(r => Number(r.status) === 0).length
  };
}

/**
 * Shared hover/list sensor reading for one instrument under the current scenario.
 * Offline keeps val null — never forge a live normal reading.
 */
export function sensorReadingForInstrument(elementId) {
  const {senorStatus} = statusForScenario(getDemoScenario());
  return {
    id: 980000 + (Number(elementId) % 1000),
    sensorType: {name: '演示温度'},
    status: senorStatus === 2 ? -1 : senorStatus,
    val: senorStatus === -100 ? null : '5.2',
    unit: '℃'
  };
}

/**
 * GET /instrument/detail — LabDeviceDrawer basic info (read-only demo slice).
 * logoUrl left empty so the drawer uses the local default image (no external file URL).
 */
export function getDemoInstrumentDetail(id) {
  if (isInstrumentDeleted(id)) return null;
  const entity = instrumentById(id);
  return entity ? buildInstrumentRow(entity) : null;
}

/**
 * GET /monitorIndicator/getOpenMonitorFlag — current sensor cards for MonitorSensor.
 * Temperature reuses hover reading; humidity is chart-switch companion only.
 */
export function getDemoOpenMonitorFlag(objId) {
  if (isInstrumentDeleted(objId)) return null;
  const entity = instrumentById(objId);
  if (!entity) return null;
  const reading = sensorReadingForInstrument(entity.id);
  const offline = reading.val == null;
  const {senorStatus} = statusForScenario(getDemoScenario());
  const humidityVal = offline ? '' : (senorStatus === 2 ? '85.0' : '55.0');
  return {
    list: [
      {
        id: reading.id,
        sensorAlias: reading.sensorType.name,
        monitorSensorVal: offline ? '' : reading.val,
        unit: reading.unit,
        monitorSensorTime: offline ? '' : '2026-09-24 12:00:00',
        activateFlag: reading.status === -1 ? 1 : 0,
        signalSwitchStatus: 0,
        monitorSensorCatId: 1,
        normalMin: 0,
        normalMax: 40,
        deleteFlag: false,
        showAlarmFlag: 1,
        inlay: 1
      },
      {
        id: reading.id + 100000,
        sensorAlias: '演示湿度',
        monitorSensorVal: humidityVal,
        unit: '%',
        monitorSensorTime: offline ? '' : '2026-09-24 12:00:00',
        activateFlag: senorStatus === 2 ? 1 : 0,
        signalSwitchStatus: 0,
        monitorSensorCatId: 2,
        normalMin: 30,
        normalMax: 70,
        deleteFlag: false,
        showAlarmFlag: 1,
        inlay: 1
      }
    ],
    isBind: 1,
    type: 2,
    bindingDeviceId: []
  };
}

/** GET /monitorIndicator/getMonitorFlag — vuex sensorsFlag; same probe list is enough. */
export function getDemoMonitorFlag(objId) {
  const open = getDemoOpenMonitorFlag(objId);
  return open ? open.list : null;
}


/**
 * Absent begin+end → interval window on DEMO_NOW_MS.
 * Any explicit begin/end must both parse and satisfy end > begin; otherwise invalid.
 */
function monitorInfoRange(params) {
  const hasBegin = params && params.beginTime != null && String(params.beginTime).trim() !== '';
  const hasEnd = params && params.endTime != null && String(params.endTime).trim() !== '';
  if (hasBegin || hasEnd) {
    if (!hasBegin || !hasEnd) return {ok: false};
    const begin = parseDemoDateTime(params.beginTime);
    const end = parseDemoDateTime(params.endTime);
    if (!Number.isFinite(begin) || !Number.isFinite(end) || end <= begin) return {ok: false};
    return {ok: true, begin, end};
  }
  const interval = Number(params && params.interval);
  const days = interval === 5 ? 7 : interval === 6 ? 30 : interval === 7 ? 90 : 1;
  return {ok: true, begin: DEMO_NOW_MS - days * 86400000, end: DEMO_NOW_MS};
}

function monitorInfoStepMs(params, begin, end) {
  const hintMin = Number(params && params.historyTimeInterval) > 0
    ? Number(params.historyTimeInterval)
    : 5;
  let step = hintMin * 60 * 1000;
  const interval = Number(params && params.interval);
  const maxPoints = interval === 4 ? 48 : interval === 5 ? 84 : 96;
  const span = Math.max(end - begin, step);
  if (span / step > maxPoints) {
    step = Math.ceil(span / maxPoints / 60000) * 60000;
  }
  return Math.max(step, 60 * 1000);
}

function monitorSeriesValue(sensorId, index, scenario) {
  const humidity = Number(sensorId) >= 1080000;
  if (scenario === 'alarm') {
    return humidity
      ? Number((78 + (index % 7) * 1.5).toFixed(1))
      : Number((38 + (index % 5) * 1.2).toFixed(1));
  }
  return humidity
    ? Number((52 + (index % 6) * 0.8).toFixed(1))
    : Number((4.8 + (index % 6) * 0.2).toFixed(1));
}

/**
 * GET /monitorIndicator/monitorInfo — MonitorInfo chart series (device type:2 only).
 * Offline / unknown sensor → []; invalid explicit range → null (handler failure).
 */
export function getDemoMonitorInfo(params) {
  if (!params || Number(params.type) !== 2) return null;
  const objId = Number(params.objId);
  const sensorId = Number(params.objSensorId);
  if (!instrumentById(objId) || Number.isNaN(sensorId)) return null;
  const open = getDemoOpenMonitorFlag(objId);
  if (!open || !open.list.some(item => Number(item.id) === sensorId)) return null;

  const range = monitorInfoRange(params);
  if (!range.ok) return null;
  const scenario = getDemoScenario();
  if (scenario === 'offline') return [];
  const {begin, end} = range;
  const step = monitorInfoStepMs(params, begin, end);
  const rows = [];
  let index = 0;
  for (let t = begin; t <= end; t += step) {
    rows.push({
      id: index + 1,
      createDate: formatDemoDateTime(t),
      data: monitorSeriesValue(sensorId, index, scenario)
    });
    index += 1;
    if (index >= 120) break;
  }
  return rows;
}

/** Empty historyPage for SeeHistory dialog mount/query; not a full history product. */
export function emptyMonitorHistoryPage(objId) {
  const key = objId == null || objId === '' ? '0' : String(objId);
  return {list: {[key]: []}, total: 0, pageNum: 1, pageSize: 10};
}

/** Empty page for TagPane mount; reservation/history not part of this slice. */
export function emptyInstrumentSchedulerPage() {
  return {list: [], pageNum: 1, pageSize: 10, total: 0};
}

/**
 * POST /map/element/getRoonInstrumentInfoList response items.
 */
export function listRoonInstrumentInfo(roomId) {
  const key = roomId == null || roomId === '' ? null : Number(roomId);
  if (key == null || Number.isNaN(key)) {
    return {
      list: [],
      board: {normalNum: 0, policeNum: 0, leaveNum: 0},
      simpleEquipmentList: []
    };
  }

  const {status, senorStatus} = statusForScenario(getDemoScenario());
  const list = placementsForRoom(key).map(place => {
    const entity = resolveInstrumentEntity(instrumentById(place.elementId));
    return {
      id: place.elementId,
      elementId: place.elementId,
      roomId: key,
      mediaId: key,
      name: entity ? entity.name : '',
      url: entity ? entity.assetKey : '',
      logoUrl: entity ? entity.assetKey : '',
      x: place.x,
      y: place.y,
      rotation: place.rotation,
      scaleX: place.scaleX,
      scaleY: place.scaleY,
      sortIndex: place.sortIndex,
      types: entity ? entity.types : 1,
      status,
      senorStatus,
      isMonitor: 1,
      // Editable in RoomDesigner; RoomView opens LabDeviceDrawer in demo.
      isEdit: 1,
      openTwoSystem: true,
      type: 4
    };
  });

  const board = {
    normalNum: senorStatus === 1 ? list.length : 0,
    policeNum: senorStatus === 2 ? list.length : 0,
    leaveNum: senorStatus === -100 ? list.length : 0
  };

  const simpleEquipmentList = list.map(item => ({
    id: item.elementId,
    name: item.name,
    sensors: [sensorReadingForInstrument(item.elementId)]
  }));

  return {list, board, simpleEquipmentList};
}

export {ROOM_BOUNDS, floorPctToRoomLocal, LAYOUT_SEEDS, LAYOUT_STORAGE_KEY, seedPlacement};
