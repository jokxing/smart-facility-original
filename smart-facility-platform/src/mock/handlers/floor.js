import {listFloorOverview} from '../fixtures/floor';
import {protectedRoute, success} from '../response';

// Floor overview + designer sidebar room list (read-only). Writes stay unimplemented.
export default [
  protectedRoute('GET', '/map/floor/overview', ({params}) => success(listFloorOverview(params.floorId))),
  // Designer left list: rooms not yet on the map. Demo markers already cover the wired floor.
  protectedRoute('POST', '/room/list', () => success({list: [], pageNum: 1, pageSize: 10000, total: 0}))
];
