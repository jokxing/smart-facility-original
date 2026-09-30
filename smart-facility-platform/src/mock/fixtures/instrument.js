/**
 * Shared lab instruments + room-local layouts for getRoonInstrumentInfoList.
 *
 * Coordinates are room-canvas space 1600×790 (RoomView / RoomDesigner Konva).
 * Task 8C: demo layout overrides persist under smart-facility-demo storage;
 * scenario still only changes status, never position.
 */

import storage from '../storage';
import {DEMO_NOW_MS, formatDemoDateTime, parseDemoDateTime} from '../clock';
import {ROOM_BOUNDS, roomFrame, validPlacement} from '../../utils/demoLayoutGeometry';
import {getDemoScenario, statusForScenario} from './scenario';

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
const TYPE_NAME = '演示设备';

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

function instrumentById(id) {
  return DEMO_INSTRUMENTS.find(item => item.id === Number(id)) || null;
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
  const seeds = LAYOUT_SEEDS.filter(seed => seed.roomId === roomId).map(seedPlacement);
  const overrides = readOverrides()[String(roomId)];
  if (!Array.isArray(overrides) || !overrides.length) return seeds;
  const result = validateLayout(overrides.map(item => ({...item, type: 4})), roomId);
  return result.ok ? result.items : seeds;
}

export function listInstrumentsByRoomId(roomId) {
  const key = roomId == null || roomId === '' ? null : Number(roomId);
  if (key == null || Number.isNaN(key)) return [];
  return DEMO_INSTRUMENTS.filter(item => item.roomId === key);
}

export function listInstrumentsForFloorRooms(roomIds) {
  const idSet = new Set((roomIds || []).map(Number).filter(n => !Number.isNaN(n)));
  return DEMO_INSTRUMENTS.filter(item => idSet.has(item.roomId));
}

/**
 * Persist type:4 room instrument layout. Returns {ok, message?, roomId?, count?}.
 */
function validateLayout(items, requiredRoomId) {
  if (!Array.isArray(items) || !items.length) {
    return {ok: false, message: '布局列表不能为空。'};
  }
  const roomIds = new Set();
  const normalized = [];
  const seen = new Set();
  for (const raw of items) {
    if (!raw || Number(raw.type) !== 4) {
      return {ok: false, message: '演示仅接受设备布局（type:4）。'};
    }
    const elementId = Number(raw.elementId != null ? raw.elementId : raw.id);
    const entity = instrumentById(elementId);
    if (!entity || seen.has(elementId)) {
      return {ok: false, message: '存在未知设备，已拒绝保存。'};
    }
    seen.add(elementId);
    const roomId = Number(raw.mediaId != null ? raw.mediaId : (raw.roomId != null ? raw.roomId : entity.roomId));
    if (roomId !== entity.roomId || !ROOM_BOUNDS[roomId] || (requiredRoomId != null && roomId !== requiredRoomId)
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
  const expectedIds = new Set(listInstrumentsByRoomId(roomId).map(item => item.id));
  const savedIds = new Set(normalized.map(item => item.elementId));
  if (expectedIds.size !== savedIds.size || [...expectedIds].some(id => !savedIds.has(id))) {
    return {ok: false, message: '演示布局需保留房间内全部已上图设备（不支持增删）。'};
  }
  return {ok: true, roomId, items: normalized.sort((a, b) => a.sortIndex - b.sortIndex)};
}

export function saveRoomInstrumentLayout(items) {
  const result = validateLayout(items);
  if (!result.ok) return result;
  const map = readOverrides();
  map[String(result.roomId)] = result.items;
  writeOverrides(map);
  return {ok: true, roomId: result.roomId, count: result.items.length};
}

export function resetRoomInstrumentLayout(roomId) {
  const key = roomId == null || roomId === '' ? null : Number(roomId);
  if (key == null || Number.isNaN(key) || !ROOM_BOUNDS[key]) {
    return {ok: false, message: '无效房间，无法重置布局。'};
  }
  const map = readOverrides();
  delete map[String(key)];
  writeOverrides(map);
  return {ok: true, roomId: key};
}

export function clearAllRoomLayoutOverrides() {
  storage.removeItem(LAYOUT_STORAGE_KEY);
}

function roomNameForId(roomId) {
  const space = INSTRUMENT_ROOM_SPACE[Number(roomId)];
  return space ? space.roomName : '';
}

function departmentNameForId(departmentId) {
  return Number(departmentId) === DEPT_RD ? '演示研发部' : '演示运维部';
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
  const {status, senorStatus} = statusForScenario(getDemoScenario());
  return {
    id: entity.id,
    name: entity.name,
    no: instrumentNo(entity.id),
    types: entity.types,
    detailType: 1,
    departmentId: entity.departmentId,
    departmentName: departmentNameForId(entity.departmentId),
    status,
    bingStatus: senorStatus,
    brand: '演示品牌',
    managerName: '演示负责人',
    price: 0,
    model: 'DEMO-M1',
    typeName: TYPE_NAME,
    roomId: entity.roomId,
    roomName: roomNameForId(entity.roomId),
    userName: '演示账号',
    createDate: createDateFor(entity),
    companyName: '智慧设施演示空间',
    buyDate: '',
    nextMaintenanceDate: '',
    gradeName: '',
    labelNo: '',
    monitorStatus: null,
    logoUrl: '',
    qrUrl: '',
    labelId: null,
    standbyPowerFlag: false,
    bindingDeviceId: null,
    openTwoSystem: true
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
  const space = INSTRUMENT_ROOM_SPACE[entity.roomId];
  if (!space) return false;
  const roomIds = asIdList(body.roomIdList);
  if (roomIds.length) return roomIds.includes(entity.roomId);
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

  const rows = DEMO_INSTRUMENTS
    .filter(entity => matchSpace(entity, body))
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
 * GET /instrument/dashboard/new — gather cards; universe counts (not list filters).
 */
export function getInstrumentDashboardNew() {
  const rows = DEMO_INSTRUMENTS.map(buildInstrumentRow);
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
  const entity = instrumentById(id);
  return entity ? buildInstrumentRow(entity) : null;
}

/**
 * GET /monitorIndicator/getOpenMonitorFlag — current sensor cards for MonitorSensor.
 * Temperature reuses hover reading; humidity is chart-switch companion only.
 */
export function getDemoOpenMonitorFlag(objId) {
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
  if (key == null || Number.isNaN(key) || !ROOM_BOUNDS[key]) {
    return {
      list: [],
      board: {normalNum: 0, policeNum: 0, leaveNum: 0},
      simpleEquipmentList: []
    };
  }

  const {status, senorStatus} = statusForScenario(getDemoScenario());
  const list = placementsForRoom(key).map(place => {
    const entity = instrumentById(place.elementId);
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
