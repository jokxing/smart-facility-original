import {
  getDemoRoomDetail,
  getRoomDashboard,
  listRoomThings,
  listRoomMonitorInstrument,
  listRoomReports,
  listThingsUsers,
  exportDemoRooms,
  createDemoRoom,
  updateDemoRoomBasic,
  removeDemoRoom
} from '../fixtures/room';
import {protectedRoute, success, failure} from '../response';
import {validateDemoStoredMedia} from '../../utils/demoMediaStore';

// RoomDrawerNew read path + dashboard + export + room entity writes (M2).
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

  protectedRoute('POST', '/room/add', async ({body}) => {
    const mediaCheck = await validateDemoStoredMedia(body && (body.mapUrl || (body.media && body.media.url)));
    if (!mediaCheck.ok) return failure(mediaCheck.message);
    try {
      const result = createDemoRoom(body || {});
      return result.ok ? success(result.item) : failure(result.message);
    } catch (_) {
      return failure('保存失败，请检查浏览器存储空间后重试。');
    }
  }),
  protectedRoute('POST', '/room/update/basic', async ({body}) => {
    const mediaCheck = await validateDemoStoredMedia(body && (body.mapUrl != null ? body.mapUrl : body.media && body.media.url));
    if (!mediaCheck.ok) return failure(mediaCheck.message);
    try {
      const result = updateDemoRoomBasic(body || {});
      return result.ok ? success(result.item) : failure(result.message);
    } catch (_) {
      return failure('保存失败，请检查浏览器存储空间后重试。');
    }
  }),
  protectedRoute('POST', /^\/room\/remove\/(\d+)$/, ({path}) => {
    const id = Number(String(path).split('/').pop());
    const result = removeDemoRoom(id);
    return result.ok ? success(true) : failure(result.message);
  }),
  protectedRoute('POST', '/room/batch/delete', () => failure('本阶段演示未开放房间批量删除。')),
  protectedRoute('POST', '/room/batch/update', () => failure('本阶段演示未开放房间批量更新。')),
  protectedRoute('POST', '/room/export', async ({body}) => exportDemoRooms(body || {})),
  protectedRoute('POST', '/room/goods/remove', () => failure('本阶段演示未开放解绑房间设备。'))
];
