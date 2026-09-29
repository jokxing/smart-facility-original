import {DEMO_SPACE} from './space';
import {listInstrumentsByRoomId, listRoonInstrumentInfo} from './instrument';
import {countDemoDeviceStatus} from '../../utils/demoDeviceStatus';
import {getDemoScenario, statusForScenario} from './scenario';

/**
 * Synthetic rooms for demo-floor-a-1f (floorId 930001).
 * Source-confirmed fields consumed by floorConfiguar/index.vue deviceList:
 * id, name, x, y, width, fontSize, color, scaleX/scaleY, senorStatus, equipments[]
 * (equipments must be an array; empty is OK for marker-only). isEdit true so demo
 * can open RoomDrawer read-only detail (task 5B). Coordinates align with public/demo/floors/floor-a-1f.svg.
 * Rooms that own instruments inherit the shared demo scenario senorStatus (task 8B).
 */
export const DEMO_FLOOR_ROOMS = Object.freeze({
  930001: [
    {
      id: 950001,
      name: '演示房间 A',
      x: 355,
      y: 145,
      width: 180,
      fontSize: 20,
      color: '#cfe9f8',
      scaleX: 1,
      scaleY: 1,
      senorStatus: 1,
      isEdit: true,
      equipments: []
    },
    {
      id: 950002,
      name: '演示走廊',
      x: 750,
      y: 450,
      width: 160,
      fontSize: 20,
      color: '#cfe9f8',
      scaleX: 1,
      scaleY: 1,
      senorStatus: 1,
      isEdit: true,
      equipments: []
    },
    {
      id: 950003,
      name: '演示房间 B',
      x: 1060,
      y: 145,
      width: 180,
      fontSize: 20,
      color: '#cfe9f8',
      scaleX: 1,
      scaleY: 1,
      senorStatus: 1,
      isEdit: true,
      equipments: []
    }
  ]
});

/**
 * mapFloorOverview shape for /floor/view.
 * labList: provisional demo rooms for wired floor only; other floors stay empty.
 */
export function listFloorOverview(floorId) {
  const key = floorId == null || floorId === '' ? null : Number(floorId);
  if (key == null || Number.isNaN(key)) {
    return {labList: []};
  }
  let found = null;
  for (const garden of DEMO_SPACE) {
    for (const building of garden.buildings) {
      const floor = (building.subDivisions || []).find(item => item.id === key);
      if (floor) {
        found = {garden, building, floor};
        break;
      }
    }
    if (found) break;
  }
  if (!found) return {labList: []};
  const rooms = DEMO_FLOOR_ROOMS[key] || [];
  const {senorStatus: scenarioStatus} = statusForScenario(getDemoScenario());
  return {
    labList: rooms.map(room => {
      const hasInstruments = listInstrumentsByRoomId(room.id).length > 0;
      return {
        ...room,
        deviceSummary: countDemoDeviceStatus(listRoonInstrumentInfo(room.id).list),
        senorStatus: hasInstruments ? scenarioStatus : room.senorStatus,
        equipments: (room.equipments || []).map(eq => ({
          ...eq,
          sensors: eq.sensors ? eq.sensors.map(s => ({...s})) : []
        }))
      };
    }),
    floorId: found.floor.id,
    floorName: found.floor.name,
    mapId: found.floor.mapId,
    mapUrl: found.floor.mapUrl || ''
  };
}
