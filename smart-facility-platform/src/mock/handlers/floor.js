import {listFloorOverview} from '../fixtures/floor';
import {listRooms} from '../fixtures/room';
import {protectedRoute, success} from '../response';

// Floor overview + room list (designer unplaced / room management / modal keyword).
export default [
  protectedRoute('GET', '/map/floor/overview', ({params}) => success(listFloorOverview(params.floorId))),
  protectedRoute('POST', '/room/list', ({body}) => success(listRooms(body || {})))
];
