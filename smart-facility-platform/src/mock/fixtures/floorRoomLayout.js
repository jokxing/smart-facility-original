import storage from '../storage';
import {findFloorById} from './mapFloor';

const KEY = 'floorRoomLayout';
export function readFloorRoomLayouts() {
  try {return JSON.parse(storage.getItem(KEY) || '{}');} catch (_) {return {};}
}
export function floorRoomLayout(floorId) {
  return readFloorRoomLayouts()[String(floorId)] || null;
}
export function clearRoomFloorPlacement(roomId) {
  const data = readFloorRoomLayouts();
  for (const entry of Object.values(data)) {
    entry.list = entry.list.filter(item => Number(item.elementId) !== Number(roomId));
  }
  storage.setItem(KEY, JSON.stringify(data));
}
export function saveFloorRoomLayout(body) {
  const floor = findFloorById(Number(body.floorId));
  if (!floor || Number(body.mediaId) !== Number(floor.mapId)) return {ok: false, message: '楼层或底图标识无效。'};
  if (!Array.isArray(body.list)) return {ok: false, message: '布局数据无效。'};
  const {allDemoRoomRows} = require('./room');
  const rooms = allDemoRoomRows().filter(room => Number(room.floorId) === Number(floor.id));
  const ids = new Set();
  const list = [];
  for (const item of body.list) {
    if (!item || typeof item !== 'object') return {ok: false, message: '布局项无效。'};
    const id = Number(item.elementId);
    if (Number(item.type) !== 11 || Number(item.mediaId) !== Number(floor.mapId) ||
      !rooms.some(room => Number(room.id) === id) || ids.has(id) ||
      ![item.x, item.y].every(Number.isFinite) || item.x < 0 || item.y < 0 || item.x > 1498 || item.y > 755) {
      return {ok: false, message: '房间归属、坐标或布局类型无效。'};
    }
    ids.add(id);
    list.push({elementId: id, x: item.x, y: item.y});
  }
  const data = readFloorRoomLayouts();
  data[String(floor.id)] = {mediaId: floor.mapId, list};
  try {storage.setItem(KEY, JSON.stringify(data));} catch (_) {return {ok: false, message: '布局保存失败，请检查本地存储。'};}
  return {ok: true, floorId: floor.id, count: list.length};
}
