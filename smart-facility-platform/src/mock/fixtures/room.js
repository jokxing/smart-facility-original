import {DEMO_FLOOR_ROOMS} from './floor';
import {DEMO_SPACE} from './space';
import {listInstrumentsByRoomId} from './instrument';
import {getDemoScenario, statusForScenario} from './scenario';

/**
 * Room detail drawer (RoomModule via RoomDrawer) read-only fixtures.
 * Source-confirmed: GET /room/detail items fields used in RoomModule template;
 * companion lists may be empty arrays/pages for this slice.
 */

function findRoomContext(roomId) {
  const key = Number(roomId);
  for (const garden of DEMO_SPACE) {
    for (const building of garden.buildings) {
      for (const floor of building.subDivisions || []) {
        const rooms = DEMO_FLOOR_ROOMS[floor.id] || [];
        const room = rooms.find(item => item.id === key);
        if (room) return {garden, building, floor, room};
      }
    }
  }
  return null;
}

export function getDemoRoomDetail(roomId) {
  const ctx = findRoomContext(roomId);
  if (!ctx) return null;
  const {garden, building, floor, room} = ctx;
  const hasInstruments = listInstrumentsByRoomId(room.id).length > 0;
  const {senorStatus: scenarioStatus} = statusForScenario(getDemoScenario());
  return {
    id: room.id,
    name: room.name,
    no: 'DEMO-R-' + room.id,
    floorId: floor.id,
    floorName: floor.name,
    buildingId: building.id,
    buildingName: building.name,
    gardenId: garden.gardenId,
    gardenName: garden.gardenName,
    senorStatus: hasInstruments
      ? scenarioStatus
      : (room.senorStatus != null ? room.senorStatus : 1),
    departmentName: '演示运维部',
    createDate: '2026-09-01 10:00:00',
    status: 1,
    openTwoSystem: 0
  };
}

export function listRoomThings() {
  return {list: []};
}

export function listRoomMonitorInstrument() {
  return [];
}

export function listRoomReports() {
  return {list: [], pageNum: 1, pageSize: 10, total: 0};
}

export function listThingsUsers() {
  return {list: [], pageNum: 1, pageSize: 10, total: 0};
}
