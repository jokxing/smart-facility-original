import {instrumentImportOptions} from '../fixtures/instrument';
import {
  DEMO_INSTRUMENTS,
  batchRemoveInstruments,
  emptyInstrumentSchedulerPage,
  emptyMonitorHistoryPage,
  getDemoInstrumentDetail,
  getDemoMonitorFlag,
  getDemoMonitorInfo,
  getDemoOpenMonitorFlag,
  getInstrumentDashboardNew,
  getInstrumentStatistics,
  importDemoInstruments,
  previewDemoInstruments,
  exportDemoInstruments,
  addDemoInstrument,
  listImportRemoveIds,
  listInstruments,
  listRoonInstrumentInfo,
  removeInstrument,
  resetRoomInstrumentLayout,
  saveRoomInstrumentLayout,
  updateInstrumentBasic
} from '../fixtures/instrument';
import {getEquipmentMonitorInfo, unbindInstrumentHardware} from '../fixtures/equipment';
import {getDemoScenario, setDemoScenario} from '../fixtures/scenario';
import {listRoomTree} from '../fixtures/roomTree';
import {failure, protectedRoute, success} from '../response';

const WRITE_BLOCKED = '本阶段演示未开放仪器写操作。';
const removeIds = DEMO_INSTRUMENTS.map(item => item.id).concat(listImportRemoveIds());
const removeRoutes = removeIds.map(id =>
  protectedRoute('POST', `/instrument/remove/${id}`, () => {
    const result = removeInstrument(id);
    if (!result.ok) return failure(result.message || '删除失败');
    return success({id: result.id, roomId: result.roomId});
  })
);

// Room instrument layout + device list/dashboard + read-only detail + MonitorInfo series.
// 2B: update/basic; 2C: remove tombstone; 2D: import creates corridor instrument.
export default [
  protectedRoute('GET', '/__demo/instrument/import-options', () => success(instrumentImportOptions())),
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
  protectedRoute('GET', '/instrument/instrumentStatistics', () => success(getInstrumentStatistics())),
  protectedRoute('GET', '/instrument/detail', ({params}) => {
    const detail = getDemoInstrumentDetail(params.id);
    return detail ? success(detail) : failure('演示设备不存在。');
  }),
  protectedRoute('POST', '/instrument/update/basic', ({body}) => {
    const result = updateInstrumentBasic(body || {});
    if (!result.ok) return failure(result.message || '保存失败');
    return success({
      id: result.id,
      name: result.name,
      departmentId: result.departmentId,
      departmentName: result.departmentName,
      types: result.types,
      typeName: result.typeName
    });
  }),
  protectedRoute('POST', '/instrument/import/preview', async ({body}) => {
    const result = await previewDemoInstruments(body || {});
    if (!result.rows) return failure(result.message || '预览失败');
    // Always return preview payload (ok may be false); parse-level failures have empty rows.
    if (!result.rows.length && !result.ok) return failure(result.message || '预览失败');
    return success({
      ok: result.ok,
      message: result.message || '',
      rows: result.rows,
      validCount: result.validCount || 0,
      freeCount: result.freeCount || 0
    });
  }),
  protectedRoute('POST', '/instrument/import', async ({body}) => {
    const result = await importDemoInstruments(body || {});
    if (!result.ok) return failure(result.message || '导入失败');
    return success({
      id: result.id,
      name: result.name,
      count: result.count,
      ids: result.ids,
      departmentId: result.departmentId,
      roomId: result.roomId,
      types: result.types
    });
  }),
  protectedRoute('POST', '/instrument/add', ({body}) => {
    const result = addDemoInstrument(body || {});
    if (!result.ok) return failure(result.message || '新增失败');
    return success({
      id: result.id,
      name: result.name,
      count: result.count,
      ids: result.ids,
      departmentId: result.departmentId,
      roomId: result.roomId,
      types: result.types
    });
  }),
  protectedRoute('POST', '/instrument/batch/delete', ({body}) => {
    const result = batchRemoveInstruments(body || {});
    if (!result.ok) return failure(result.message || '批量删除失败');
    return success({count: result.count, ids: result.ids});
  }),
  protectedRoute('POST', '/instrument/batch/update', () => failure(WRITE_BLOCKED)),
  protectedRoute('POST', '/instrument/export', async ({body}) => exportDemoInstruments(body || {})),
  protectedRoute('GET', '/instrument/unbind', ({params}) => {
    const result = unbindInstrumentHardware(params && params.instrumentId);
    if (!result.ok) return failure(result.message || '解绑失败');
    return success({instrumentId: result.instrumentId, count: result.count});
  }),
  ...removeRoutes,
  // Edit modal dependencies (empty / local stubs so form can open without 501).
  protectedRoute('GET', '/grade/getlist', () => success([])),
  protectedRoute('GET', '/file/policy', () => success({
    host: '', accessKey: '', callback: '', dir: '', policy: '', signature: ''
  })),
  protectedRoute('GET', '/file/instrument/pic/search', () => success({list: [], total: 0, pageNum: 1, pageSize: 18})),
  protectedRoute('POST', '/room/tree', ({body}) => success(listRoomTree(body || {}))),
  protectedRoute('GET', '/monitorIndicator/getOpenMonitorFlag', ({params}) => {
    const objType = Number(params.objType);
    if (objType === 3) {
      return success({list: []});
    }
    if (objType !== 2) {
      return failure('本切片仅支持设备或房间监测标签。');
    }
    const items = getDemoOpenMonitorFlag(params.objId);
    return items ? success(items) : failure('演示设备不存在。');
  }),
  protectedRoute('GET', '/monitorIndicator/getMonitorFlag', ({params}) => {
    const objType = Number(params.objType);
    if (objType === 3) {
      return success([]);
    }
    if (objType !== 2) {
      return failure('本切片仅支持设备或房间监测标签。');
    }
    const items = getDemoMonitorFlag(params.objId);
    return items ? success(items) : failure('演示设备不存在。');
  }),
  protectedRoute('GET', '/monitorIndicator/monitorInfo', ({params}) => {
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
