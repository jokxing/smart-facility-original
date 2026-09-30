import {listFloorOverview} from '../fixtures/floor';
import {DEMO_FLOOR_ROOMS} from '../fixtures/floor';
import {protectedRoute, success} from '../response';

function allRooms() {
  return Object.values(DEMO_FLOOR_ROOMS).flat().map(room => ({
    id: room.id,
    name: room.name,
    roomName: room.name
  }));
}

function listRooms(body = {}) {
  const keyword = String(body.keyword || '').trim().toLowerCase();
  const pageNum = Math.max(1, Number(body.pageNum) || 1);
  const pageSize = Math.max(1, Number(body.pageSize) || 10);
  // Designer sidebar: floorId set + no keyword → rooms already on map, keep empty.
  if (body.floorId != null && String(body.floorId).trim() !== '' && !keyword) {
    return {list: [], pageNum, pageSize, total: 0};
  }
  const all = allRooms();
  const list = keyword
    ? all.filter(room => String(room.name).toLowerCase().includes(keyword))
    : all;
  const start = (pageNum - 1) * pageSize;
  return {
    list: list.slice(start, start + pageSize),
    pageNum,
    pageSize,
    total: list.length
  };
}

// Floor overview + room list (designer empty / modal & keyword filled).
export default [
  protectedRoute('GET', '/map/floor/overview', ({params}) => success(listFloorOverview(params.floorId))),
  protectedRoute('POST', '/room/list', ({body}) => success(listRooms(body || {})))
];
