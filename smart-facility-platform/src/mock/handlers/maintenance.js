import {
  addDemoMaintenance,
  completeDemoMaintenance,
  listMaintenances,
  updateDemoMaintenance
} from '../fixtures/maintenance';
import {failure, protectedRoute, success} from '../response';

export default [
  protectedRoute('POST', '/maintenance/list', ({body}) => {
    try {
      return success(listMaintenances(body || {}));
    } catch (error) {
      return failure(error.message || '维保查询参数无效。');
    }
  }),
  protectedRoute('POST', '/maintenance/add', ({body}) => {
    const result = addDemoMaintenance(body || {});
    if (!result.ok) return failure(result.message || '申请失败');
    return success({id: result.id, instrumentId: result.instrumentId});
  }),
  protectedRoute('POST', '/maintenance/updateMaintenance', ({body}) => {
    const result = updateDemoMaintenance(body || {});
    if (!result.ok) return failure(result.message || '更新失败');
    return success({id: result.id, nextMaintenanceDate: result.nextMaintenanceDate});
  }),
  protectedRoute('GET', '/maintenance/complete', ({params}) => {
    const result = completeDemoMaintenance(params || {});
    if (!result.ok) return failure(result.message || '确认失败');
    return success({id: result.id, completeFlag: result.completeFlag, completeDate: result.completeDate});
  })
];
