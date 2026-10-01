import {
  getStatisticOverview,
  getStatisticAlarmOverview,
  getStatisticEquipmentAlarm
} from '../fixtures/statistic';
import {protectedRoute, success} from '../response';

// Statistics 4A read path only — use/ranking/electricity stay unregistered.
export default [
  protectedRoute('GET', '/statistic/overview', () => success(getStatisticOverview())),
  protectedRoute('GET', '/statistic/alarm/overview', () => success(getStatisticAlarmOverview())),
  protectedRoute('GET', '/statistic/equipment/alarm', () => success(getStatisticEquipmentAlarm()))
];
