import {
  alarmRule,
  detailsTimeout,
  detailsTimeoutDetails,
  detailsUsePerson,
  getGunDetail,
  listGuns,
  listGunPipetteBindings,
  listHistory,
  mouseInfo,
  noHomingList,
  pollTake,
  requestTake,
  returnGun,
  signatureUseRanked,
  statistics,
  timeoutSignature,
  timeoutStatistics,
  useFrequency,
  useStatistics
} from '../fixtures/gun';
import {failure, protectedRoute, success} from '../response';

function wrap(result) {
  if (!result.ok) return failure(result.message);
  return success(result.items);
}

export default [
  protectedRoute('POST', '/gun/pipette/statistics', () => success(statistics())),
  protectedRoute('POST', '/gun/pipette/listV1', ({body}) => success(listGuns(body || {}))),
  protectedRoute('POST', '/gun/pipette/list', ({body}) => success(listGuns(body || {}))),
  protectedRoute('GET', '/gun/pipette/detail', ({params}) => {
    const detail = getGunDetail(params && (params.gunId || params.id));
    return detail ? success(detail) : failure('未知移液枪');
  }),
  protectedRoute('POST', '/gun/pipette/binding/list', ({body}) => success(listGunPipetteBindings(body || {}))),
  protectedRoute('POST', '/gun/pipette/history', ({body}) => success(listHistory(body || {}))),
  protectedRoute('POST', '/gun/take/pipette', ({body}) => wrap(requestTake(body || {}))),
  protectedRoute('GET', '/gun/take', ({params}) => wrap(pollTake(params || {}))),
  protectedRoute('POST', '/gun/return/pipette', ({body}) => wrap(returnGun(body || {}))),
  protectedRoute('POST', '/gun/pipette/use/statistics', () => success(useStatistics())),
  protectedRoute('POST', '/gun/pipette/timeout/statistics', () => success(timeoutStatistics())),
  protectedRoute('POST', '/gun/pipette/noHoming/list', ({body}) => success(noHomingList(body || {}))),
  protectedRoute('GET', '/gun/pipette/mouseInfo', ({params}) => {
    const info = mouseInfo(params || {});
    return info ? success(info) : failure('未知移液枪');
  }),
  protectedRoute('POST', '/gun/pipette/gunUseFrequency', () => success(useFrequency())),
  protectedRoute('POST', '/gun/pipette/signature/useRanked', ({body}) => success(signatureUseRanked(body || {}))),
  protectedRoute('POST', '/gun/pipette/timeout/signature', ({body}) => success(timeoutSignature(body || {}))),
  protectedRoute('POST', '/gun/pipette/timeout/frequency', ({body}) => success(timeoutSignature(body || {}))),
  protectedRoute('POST', '/gun/pipette/details/usePersonStatistics ', ({body}) => success(detailsUsePerson(body || {}))),
  protectedRoute('POST', '/gun/pipette/details/timeoutStatistics ', ({body}) => success(detailsTimeout(body || {}))),
  protectedRoute('POST', '/gun/pipette/details/timeoutDetails ', ({body}) => success(detailsTimeoutDetails(body || {}))),
  protectedRoute('GET', '/gun/pipette/alarm/getRule', () => success(alarmRule())),
  protectedRoute('GET', '/gun/pipette/openAlarm', () => success(true)),
  protectedRoute('POST', '/gun/pipette/edit', () => failure('演示未开放移液枪档案编辑。')),
  protectedRoute('POST', '/gun/pipette/del', () => failure('演示未开放删除移液枪。')),
  protectedRoute('POST', '/gun/pipette/updateDepartment', () => failure('演示未开放批量改部门。')),
  protectedRoute('POST', '/gun/pipette/alarm/batchRule', () => failure('演示未开放修改报警规则，超时仍按 24 小时计算。')),
  protectedRoute('GET', '/gun/pipette/export', () => failure('演示未开放移液枪导出。')),
  protectedRoute('GET', '/gun/pipette/useRecord/export', () => failure('演示未开放使用记录导出。'))
];
