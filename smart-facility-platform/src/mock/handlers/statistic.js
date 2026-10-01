import {
  getStatisticOverview,
  getStatisticAlarmOverview,
  getStatisticEquipmentAlarm,
  getStatisticInstrumentUse,
  getStatisticInstrumentUseRanking
} from '../fixtures/statistic';
import {protectedRoute, success} from '../response';

// Statistics 4A–4D read path — electricity / device chart stay unregistered.
export default [
  protectedRoute('GET', '/statistic/overview', () => success(getStatisticOverview())),
  protectedRoute('GET', '/statistic/alarm/overview', () => success(getStatisticAlarmOverview())),
  protectedRoute('GET', '/statistic/equipment/alarm', () => success(getStatisticEquipmentAlarm())),
  protectedRoute('GET', '/statistic/instrument/use', ({params}) => success(getStatisticInstrumentUse(params || {}))),
  protectedRoute('GET', '/statistic/instrument/useRanking', ({params}) =>
    success(getStatisticInstrumentUseRanking(params || {})))
];
