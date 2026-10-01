import {
  getDemoRoomDetail,
  getRoomDashboard,
  listRoomThings,
  listRoomMonitorInstrument,
  listRoomReports,
  listThingsUsers
} from '../fixtures/room';
import {DEMO_FLOOR_ROOMS} from '../fixtures/floor';
import {protectedRoute, success, failure} from '../response';

const DEMO_ROOM_IDS = Object.values(DEMO_FLOOR_ROOMS).flat().map(room => room.id);

const removeRoutes = DEMO_ROOM_IDS.map(id =>
  protectedRoute('POST', `/room/remove/${id}`, () => failure('本阶段演示未开放房间删除。'))
);

// RoomDrawerNew read path + dashboard + explicit write refusals.
export default [
  protectedRoute('GET', '/room/detail', ({params}) => {
    const detail = getDemoRoomDetail(params.id);
    return detail ? success(detail) : failure('演示房间不存在。');
  }),
  protectedRoute('GET', '/room/dashboardV1', ({params}) => success(getRoomDashboard(params || {}))),
  protectedRoute('GET', '/room/things/list', () => success(listRoomThings())),
  protectedRoute('GET', '/room/monitor/instrument', ({params}) => success(listRoomMonitorInstrument(params || {}))),
  protectedRoute('POST', '/roomReport/list', () => success(listRoomReports())),
  protectedRoute('GET', '/thingsUser/list', () => success(listThingsUsers())),

  protectedRoute('POST', '/room/add', () => failure('本阶段演示未开放房间新增。')),
  protectedRoute('POST', '/room/update/basic', () => failure('本阶段演示未开放房间编辑。')),
  ...removeRoutes,
  protectedRoute('POST', '/room/batch/delete', () => failure('本阶段演示未开放房间批量删除。')),
  protectedRoute('POST', '/room/batch/update', () => failure('本阶段演示未开放房间批量更新。')),
  protectedRoute('POST', '/room/export', () => failure('本阶段演示未开放房间导出。')),
  protectedRoute('POST', '/room/goods/remove', () => failure('本阶段演示未开放解绑房间设备。'))
];
