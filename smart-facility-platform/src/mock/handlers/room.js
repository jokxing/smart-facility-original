import {
  getDemoRoomDetail,
  listRoomThings,
  listRoomMonitorInstrument,
  listRoomReports,
  listThingsUsers
} from '../fixtures/room';
import {protectedRoute, success, failure} from '../response';

// RoomDrawer → RoomModule read-only open path.
export default [
  protectedRoute('GET', '/room/detail', ({params}) => {
    const detail = getDemoRoomDetail(params.id);
    return detail ? success(detail) : failure('演示房间不存在。');
  }),
  protectedRoute('GET', '/room/things/list', () => success(listRoomThings())),
  protectedRoute('GET', '/room/monitor/instrument', () => success(listRoomMonitorInstrument())),
  protectedRoute('POST', '/roomReport/list', () => success(listRoomReports())),
  protectedRoute('GET', '/thingsUser/list', () => success(listThingsUsers()))
];
