import {
  getStatisticOverview,
  getStatisticAlarmOverview,
  getStatisticEquipmentAlarm,
  getStatisticInstrumentUse
} from '../fixtures/statistic';
import {protectedRoute, success} from '../response';

// Statistics 4A–4C read path — ranking/electricity stay unregistered.
export default [
  protectedRoute('GET', '/statistic/overview', () => success(getStatisticOverview())),
  protectedRoute('GET', '/statistic/alarm/overview', () => success(getStatisticAlarmOverview())),
  protectedRoute('GET', '/statistic/equipment/alarm', () => success(getStatisticEquipmentAlarm())),
  protectedRoute('GET', '/statistic/instrument/use', ({params}) => success(getStatisticInstrumentUse(params || {})))
];
