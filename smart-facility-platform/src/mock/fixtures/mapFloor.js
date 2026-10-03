/**
 * Demo floor entity overlays (create/edit mapUrl) on shared DEMO_SPACE buildings.
 * IDs: created floors 931201–931250; mapId 941201–941250.
 */
import storage from '../storage';
import {DEMO_SPACE} from './space';
import {isDemoMediaKey} from '../../utils/demoMediaStore';
import {DEMO_FLOOR_MAP_REGISTRY} from '../../utils/demoFloorMapUrl';

const FLOOR_CREATED_KEY = 'floorCreated';
const FLOOR_META_KEY = 'floorMeta';
const FLOOR_ID_MIN = 931201;
const FLOOR_ID_MAX = 931250;
const MAP_ID_MIN = 941201;
const MAP_ID_MAX = 941250;

function readCreated() {
  try {
    const raw = storage.getItem(FLOOR_CREATED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(item => item && Number.isFinite(Number(item.id))) : [];
  } catch (_) {
    return [];
  }
}

function writeCreated(list) {
  storage.setItem(FLOOR_CREATED_KEY, JSON.stringify(list));
}

function readMeta() {
  try {
    const raw = storage.getItem(FLOOR_META_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (_) {
    return {};
  }
}

function writeMeta(map) {
  storage.setItem(FLOOR_META_KEY, JSON.stringify(map));
}

export function clearFloorCreated() {
  storage.removeItem(FLOOR_CREATED_KEY);
}

export function clearFloorMeta() {
  storage.removeItem(FLOOR_META_KEY);
}

function findBuildingContext(buildingId) {
  const key = Number(buildingId);
  for (const garden of DEMO_SPACE) {
    for (const building of garden.buildings) {
      if (Number(building.id) === key) return {garden, building};
    }
  }
  return null;
}

function applyMeta(floor) {
  if (!floor) return null;
  const patch = readMeta()[String(floor.id)] || {};
  return {...floor, ...patch};
}

function allSeedFloors() {
  const list = [];
  for (const garden of DEMO_SPACE) {
    for (const building of garden.buildings) {
      for (const floor of building.subDivisions || []) {
        list.push({
          ...floor,
          buildingId: building.id,
          buildingName: building.name,
          gardenId: garden.gardenId,
          gardenName: garden.gardenName
        });
      }
    }
  }
  return list;
}

function freeIds() {
  const usedFloor = new Set(allSeedFloors().map(f => Number(f.id)).concat(readCreated().map(f => Number(f.id))));
  const usedMap = new Set(allSeedFloors().map(f => Number(f.mapId)).concat(readCreated().map(f => Number(f.mapId))));
  let floorId = null;
  let mapId = null;
  for (let id = FLOOR_ID_MIN; id <= FLOOR_ID_MAX; id++) {
    if (!usedFloor.has(id)) { floorId = id; break; }
  }
  for (let id = MAP_ID_MIN; id <= MAP_ID_MAX; id++) {
    if (!usedMap.has(id)) { mapId = id; break; }
  }
  return {floorId, mapId};
}

function isAllowedMapKey(value) {
  const key = String(value || '').trim();
  if (!key) return false;
  if (Object.prototype.hasOwnProperty.call(DEMO_FLOOR_MAP_REGISTRY, key)) return true;
  if (isDemoMediaKey(key)) return true;
  return false;
}

/** Floors for one building (seed + created + meta). */
export function listFloorsByBuildingId(buildingId) {
  const ctx = findBuildingContext(buildingId);
  if (!ctx) return [];
  const {garden, building} = ctx;
  const seed = (building.subDivisions || []).map(floor => applyMeta({
    ...floor,
    buildingId: building.id,
    buildingName: building.name,
    gardenId: garden.gardenId,
    gardenName: garden.gardenName,
    uid: floor.uid || ''
  }));
  const created = readCreated()
    .filter(item => Number(item.buildingId) === Number(buildingId))
    .map(item => applyMeta({
      ...item,
      buildingName: building.name,
      gardenId: garden.gardenId,
      gardenName: garden.gardenName
    }));
  return seed.concat(created);
}

/** Merge overlays into a building's subDivisions copy (for space list + tree). */
export function mergeBuildingFloors(building, garden) {
  const floors = listFloorsByBuildingId(building.id).map(floor => ({
    id: floor.id,
    name: floor.name,
    mapId: floor.mapId,
    mapUrl: floor.mapUrl || ''
  }));
  return {
    id: building.id,
    name: building.name,
    url: building.url,
    subDivisions: floors,
    _gardenId: garden && garden.gardenId,
    _gardenName: garden && garden.gardenName
  };
}

export function findFloorById(floorId) {
  const key = Number(floorId);
  if (!Number.isFinite(key)) return null;
  for (const garden of DEMO_SPACE) {
    for (const building of garden.buildings) {
      const hit = listFloorsByBuildingId(building.id).find(f => Number(f.id) === key);
      if (hit) return hit;
    }
  }
  return null;
}

export function createDemoFloor(body = {}) {
  const name = String(body.name || '').trim();
  const buildingId = Number(body.buildingId);
  const media = body.media || {};
  const mapUrl = String(media.url || body.mapUrl || '').trim();
  const uid = String(media.uid || body.uid || '').trim();
  if (!name) return {ok: false, message: '请输入楼层名称。'};
  if (name.length > 16) return {ok: false, message: '楼层名称不能超过 16 个字符。'};
  if (!findBuildingContext(buildingId)) return {ok: false, message: '所属楼宇不存在。'};
  if (!mapUrl) return {ok: false, message: '请上传楼层底图。'};
  if (!isAllowedMapKey(mapUrl)) return {ok: false, message: '底图无效或尚未保存到本地媒体库。'};
  const existing = listFloorsByBuildingId(buildingId);
  if (existing.some(f => f.name === name)) return {ok: false, message: '同一楼宇下楼层名称不能重复。'};
  const {floorId, mapId} = freeIds();
  if (floorId == null || mapId == null) return {ok: false, message: '新建楼层数量已达演示上限。'};
  const row = {
    id: floorId,
    name,
    mapId,
    mapUrl,
    uid,
    buildingId
  };
  writeCreated(readCreated().concat([row]));
  return {ok: true, item: listFloorsByBuildingId(buildingId).find(f => f.id === floorId)};
}

export function updateDemoFloor(body = {}) {
  const id = Number(body.id);
  const name = String(body.name || '').trim();
  const media = body.media || {};
  const nextMap = media.url != null && String(media.url).trim() !== '' ? String(media.url).trim() : null;
  const nextUid = media.uid != null ? String(media.uid).trim() : null;
  if (!Number.isFinite(id)) return {ok: false, message: '楼层不存在。'};
  const current = findFloorById(id);
  if (!current) return {ok: false, message: '楼层不存在。'};
  if (!name) return {ok: false, message: '请输入楼层名称。'};
  if (name.length > 16) return {ok: false, message: '楼层名称不能超过 16 个字符。'};
  const siblings = listFloorsByBuildingId(current.buildingId).filter(f => Number(f.id) !== id);
  if (siblings.some(f => f.name === name)) return {ok: false, message: '同一楼宇下楼层名称不能重复。'};
  if (nextMap != null && !isAllowedMapKey(nextMap)) {
    return {ok: false, message: '底图无效或尚未保存到本地媒体库。'};
  }
  const created = readCreated();
  const createdIdx = created.findIndex(f => Number(f.id) === id);
  if (createdIdx >= 0) {
    const row = {...created[createdIdx], name};
    if (nextMap != null) row.mapUrl = nextMap;
    if (nextUid != null) row.uid = nextUid;
    created[createdIdx] = row;
    writeCreated(created);
  } else {
    const meta = readMeta();
    const patch = {...(meta[String(id)] || {}), name};
    if (nextMap != null) patch.mapUrl = nextMap;
    if (nextUid != null) patch.uid = nextUid;
    meta[String(id)] = patch;
    writeMeta(meta);
  }
  return {ok: true, item: findFloorById(id)};
}
