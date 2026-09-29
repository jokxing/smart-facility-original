import {
  listFloorScreen,
  listRoomScreen,
  listMapGardenTree,
  listAlarmThingStatistics,
  listAlarmThingSensorsStatistics,
  listBindEquipmentTypes
} from '../fixtures/dataV';
import {protectedRoute, success} from '../response';

// FloorDataV + RoomDataV read-only slices and shared mount deps.
export default [
  protectedRoute('POST', '/map/floor/screenV1', ({body}) => success(listFloorScreen(body || {}))),
  protectedRoute('POST', '/map/room/screenV1', ({body}) => success(listRoomScreen(body || {}))),
  protectedRoute('GET', '/map/garden', () => success(listMapGardenTree())),
  protectedRoute('GET', '/equipment/bindEquipmentType', () => success(listBindEquipmentTypes())),
  protectedRoute('POST', '/alarm/thing/statistics', ({body}) => success(listAlarmThingStatistics(body || {}))),
  protectedRoute('POST', '/alarm/thing/sensors/statistics', ({body}) => success(listAlarmThingSensorsStatistics(body || {})))
];
