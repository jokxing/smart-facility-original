import {listFloorOverview} from '../fixtures/floor';
import {DEMO_FLOOR_ROOMS} from '../fixtures/floor';
import {protectedRoute, success} from '../response';

function listRooms(body = {}) {
  const keyword = String(body.keyword || '').trim().toLowerCase();
  // Designer sidebar expects empty "not-on-map" rooms when no keyword.
  if (!keyword) {
    return {list: [], pageNum: 1, pageSize: Number(body.pageSize) || 10000, total: 0};
  }
  const all = Object.values(DEMO_FLOOR_ROOMS).flat().map(room => ({
    id: room.id,
    name: room.name,
    roomName: room.name
  }));
  const list = all.filter(room => String(room.name).toLowerCase().includes(keyword));
  const pageNum = Math.max(1, Number(body.pageNum) || 1);
  const pageSize = Math.max(1, Number(body.pageSize) || 10);
  const start = (pageNum - 1) * pageSize;
  return {
    list: list.slice(start, start + pageSize),
    pageNum,
    pageSize,
    total: list.length
  };
}

// Floor overview + designer sidebar room list (read-only). Writes stay unimplemented.
export default [
  protectedRoute('GET', '/map/floor/overview', ({params}) => success(listFloorOverview(params.floorId))),
  protectedRoute('POST', '/room/list', ({body}) => success(listRooms(body || {})))
];
