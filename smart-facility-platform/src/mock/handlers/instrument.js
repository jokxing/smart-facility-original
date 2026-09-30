import {
  DEMO_INSTRUMENTS,
  emptyInstrumentSchedulerPage,
  emptyMonitorHistoryPage,
  getDemoInstrumentDetail,
  getDemoMonitorFlag,
  getDemoMonitorInfo,
  getDemoOpenMonitorFlag,
  getInstrumentDashboardNew,
  listInstruments,
  listRoonInstrumentInfo,
  resetRoomInstrumentLayout,
  saveRoomInstrumentLayout
} from '../fixtures/instrument';
import {getEquipmentMonitorInfo} from '../fixtures/equipment';
import {getDemoScenario, setDemoScenario} from '../fixtures/scenario';
import {failure, protectedRoute, success} from '../response';

const WRITE_BLOCKED = '本阶段演示未开放仪器写操作。';
const removeRoutes = DEMO_INSTRUMENTS.map(item =>
  protectedRoute('POST', `/instrument/remove/${item.id}`, () => failure(WRITE_BLOCKED))
);

// Room instrument layout + device list/dashboard + read-only detail + MonitorInfo series.
// historyPage is an empty stub so the dialog does not 501; writes are explicitly rejected.
export default [
  protectedRoute('POST', '/map/element/getRoonInstrumentInfoList', ({params}) => {
    return success(listRoonInstrumentInfo(params.roomId));
  }),
  protectedRoute('POST', '/map/element/config', ({body}) => {
    const items = Array.isArray(body) ? body : (body && body.list);
    const result = saveRoomInstrumentLayout(items);
    if (!result.ok) return failure(result.message || '保存失败');
    return success({roomId: result.roomId, count: result.count});
  }),
  protectedRoute('POST', '/demo/room-layout/reset', ({body}) => {
    const result = resetRoomInstrumentLayout(body && body.roomId);
    if (!result.ok) return failure(result.message || '重置失败');
    return success({roomId: result.roomId, list: listRoonInstrumentInfo(result.roomId).list});
  }),
  protectedRoute('GET', '/demo/scenario', () => success({scenario: getDemoScenario()})),
  protectedRoute('POST', '/demo/scenario', ({body}) => {
    const next = setDemoScenario(body && body.scenario);
    if (body && body.scenario != null && String(body.scenario).trim() !== next) {
      return failure('演示场景仅支持 normal / alarm / offline。');
    }
    return success({scenario: next});
  }),
  protectedRoute('POST', '/instrument/list', ({body}) => success(listInstruments(body || {}))),
  protectedRoute('GET', '/instrument/dashboard/new', () => success(getInstrumentDashboardNew())),
  protectedRoute('GET', '/instrument/detail', ({params}) => {
    const detail = getDemoInstrumentDetail(params.id);
    return detail ? success(detail) : failure('演示设备不存在。');
  }),
  protectedRoute('POST', '/instrument/add', () => failure(WRITE_BLOCKED)),
  protectedRoute('POST', '/instrument/update/basic', () => failure(WRITE_BLOCKED)),
  protectedRoute('POST', '/instrument/batch/delete', () => failure(WRITE_BLOCKED)),
  protectedRoute('POST', '/instrument/batch/update', () => failure(WRITE_BLOCKED)),
  protectedRoute('POST', '/instrument/export', () => failure(WRITE_BLOCKED)),
  protectedRoute('GET', '/instrument/unbind', () => failure(WRITE_BLOCKED)),
  ...removeRoutes,
  protectedRoute('GET', '/monitorIndicator/getOpenMonitorFlag', ({params}) => {
    if (Number(params.objType) !== 2) {
      return failure('本切片仅支持设备监测标签。');
    }
    const items = getDemoOpenMonitorFlag(params.objId);
    return items ? success(items) : failure('演示设备不存在。');
  }),
  protectedRoute('GET', '/monitorIndicator/getMonitorFlag', ({params}) => {
    if (Number(params.objType) !== 2) {
      return failure('本切片仅支持设备监测标签。');
    }
    const items = getDemoMonitorFlag(params.objId);
    return items ? success(items) : failure('演示设备不存在。');
  }),
  protectedRoute('GET', '/monitorIndicator/monitorInfo', ({params}) => {
    // type 1 = smart hardware (DeviceDrawerNew); type 2 = lab instrument.
    if (Number(params && params.type) === 1) {
      const items = getEquipmentMonitorInfo(params);
      if (items == null) return failure('演示硬件监测曲线参数无效。');
      return success(items);
    }
    const items = getDemoMonitorInfo(params);
    if (items == null) return failure('演示监测曲线参数无效。');
    return success(items);
  }),
  protectedRoute('POST', '/monitorIndicator/historyPage', ({body}) => {
    return success(emptyMonitorHistoryPage(body && body.objId));
  }),
  protectedRoute('POST', '/instrument/reservation/schedulerList', () => success(emptyInstrumentSchedulerPage()))
];
