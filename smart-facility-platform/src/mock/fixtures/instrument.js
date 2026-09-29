/**
 * Shared lab instruments + room-local layouts for getRoonInstrumentInfoList.
 *
 * Coordinates are room-canvas space 1600×790 (RoomView / RoomDesigner Konva).
 * Task 8C: demo layout overrides persist under smart-facility-demo storage;
 * scenario still only changes status, never position.
 */

import storage from '../storage';
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

/** Shared entities — one device belongs to exactly one room. */
export const DEMO_INSTRUMENTS = Object.freeze([
  {id: 970001, name: '演示培养箱', roomId: 950001, assetKey: 'demo-device-incubator', types: 1},
  {id: 970002, name: '演示冷藏柜', roomId: 950001, assetKey: 'demo-device-lab-refrigerator', types: 1},
  {id: 970003, name: '演示温湿度仪', roomId: 950003, assetKey: 'demo-device-monitor-terminal', types: 1},
  {id: 970004, name: '演示检测仪 A', roomId: 950001, assetKey: 'demo-device-analyzer', types: 1},
  {id: 970005, name: '演示示波器 A', roomId: 950001, assetKey: 'demo-device-oscilloscope', types: 1},
  {id: 970006, name: '演示设备机柜 B', roomId: 950003, assetKey: 'demo-device-equipment-rack', types: 1},
  {id: 970007, name: '演示检测仪 B', roomId: 950003, assetKey: 'demo-device-analyzer', types: 1},
  {id: 970008, name: '演示示波器 B', roomId: 950003, assetKey: 'demo-device-oscilloscope', types: 1},
  {id: 970009, name: '演示培养箱 B', roomId: 950003, assetKey: 'demo-device-incubator', types: 1},
  {id: 970010, name: '演示冷藏柜 B', roomId: 950003, assetKey: 'demo-device-lab-refrigerator', types: 1},
  {id: 970011, name: '演示监测终端 A', roomId: 950001, assetKey: 'demo-device-monitor-terminal', types: 1},
  {id: 970012, name: '演示设备机柜 A', roomId: 950001, assetKey: 'demo-device-equipment-rack', types: 1}
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
      // Editable in RoomDesigner; RoomView blocks detail clicks in demo.
      isEdit: 1,
      openTwoSystem: false,
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
    sensors: [
      {
        id: 980000 + (item.elementId % 1000),
        sensorType: {name: '演示温度'},
        status: senorStatus === 2 ? -1 : senorStatus,
        val: senorStatus === -100 ? null : '5.2',
        unit: '℃'
      }
    ]
  }));

  return {list, board, simpleEquipmentList};
}

export {ROOM_BOUNDS, floorPctToRoomLocal, LAYOUT_SEEDS, LAYOUT_STORAGE_KEY, seedPlacement};
