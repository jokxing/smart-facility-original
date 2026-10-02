import {
  getStatisticOverview,
  getStatisticAlarmOverview,
  getStatisticEquipmentAlarm,
  getStatisticInstrumentUse,
  getStatisticInstrumentUseRanking
} from '../fixtures/statistic';
import {
  validateStatisticUseParams,
  validateStatisticRankingParams
} from '@/utils/statisticRangeValidate';
import {protectedRoute, success, failure} from '../response';

function handleUse(params) {
  const check = validateStatisticUseParams(params || {});
  if (!check.ok) return failure(check.message);
  try {
    return success(getStatisticInstrumentUse(params || {}));
  } catch (error) {
    return failure((error && error.message) || '统计参数无效。');
  }
}

function handleRanking(params) {
  const check = validateStatisticRankingParams(params || {});
  if (!check.ok) return failure(check.message);
  try {
    return success(getStatisticInstrumentUseRanking(params || {}));
  } catch (error) {
    return failure((error && error.message) || '统计参数无效。');
  }
}

// Statistics 4A–4E read path — /statistic/electricity* and /ds/device/chart stay unregistered.
export default [
  protectedRoute('GET', '/statistic/overview', () => success(getStatisticOverview())),
  protectedRoute('GET', '/statistic/alarm/overview', () => success(getStatisticAlarmOverview())),
  protectedRoute('GET', '/statistic/equipment/alarm', () => success(getStatisticEquipmentAlarm())),
  protectedRoute('GET', '/statistic/instrument/use', ({params}) => handleUse(params)),
  protectedRoute('GET', '/statistic/instrument/useRanking', ({params}) => handleRanking(params))
];
