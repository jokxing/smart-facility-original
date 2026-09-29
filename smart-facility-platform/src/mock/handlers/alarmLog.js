import {
  batchHandleAlarmExceptions,
  listAlarmRecordSummary,
  listDemoAlarmErrorTypes,
  listDemoSensorTypesV2
} from '../fixtures/alarm';
import {failure, protectedRoute, success} from '../response';

// alarmLog list + AlarmProcessing batch handle (minimal closed loop).
export default [
  protectedRoute('POST', '/monitorIndicator/historyAlarmRecord/summary', ({body}) => {
    return success(listAlarmRecordSummary(body || {}));
  }),
  protectedRoute('POST', '/monitorIndicator/exceptionHandle/batch', ({body}) => {
    const result = batchHandleAlarmExceptions(body || {});
    if (!result.ok) return failure(result.message || '处理失败');
    return success({count: result.count});
  }),
  protectedRoute('GET', '/alarm/errorList', () => success(listDemoAlarmErrorTypes())),
  protectedRoute('GET', '/monitorIndicator/allSensorType/v2', () => success(listDemoSensorTypesV2()))
];
