import {listInstrumentsByRoomId, listRoonInstrumentInfo} from './instrument';
import {countDemoDeviceStatus} from '../../utils/demoDeviceStatus';
import {getDemoScenario, statusForScenario} from './scenario';
import {findFloorById} from './mapFloor';

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
      senorStatus: 3,
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
 * labList: only rooms with valid layout coords (unplaced rooms go to designer /room/list).
 */
export function listFloorOverview(floorId) {
  const key = floorId == null || floorId === '' ? null : Number(floorId);
  if (key == null || Number.isNaN(key)) {
    return {labList: []};
  }
  const floor = findFloorById(key);
  if (!floor) return {labList: []};

  // Lazy: room entity overlay (avoids circular floor ↔ room init).
  let roomRows = [];
  try {
    const roomFx = require('./room');
    if (typeof roomFx.listRoomMarkersForFloor === 'function') {
      roomRows = roomFx.listRoomMarkersForFloor(key);
    }
  } catch (_) {
    roomRows = (DEMO_FLOOR_ROOMS[key] || []).map(room => ({...room}));
  }

  const {senorStatus: scenarioStatus} = statusForScenario(getDemoScenario());
  return {
    labList: roomRows.map(room => {
      const hasInstruments = listInstrumentsByRoomId(room.id).length > 0;
      return {
        ...room,
        openTwoSystem: true,
        isEdit: room.isEdit !== false,
        deviceSummary: countDemoDeviceStatus(listRoonInstrumentInfo(room.id).list),
        senorStatus: hasInstruments ? scenarioStatus : (room.senorStatus != null ? room.senorStatus : 3),
        equipments: (room.equipments || []).map(eq => ({
          ...eq,
          sensors: eq.sensors ? eq.sensors.map(s => ({...s})) : []
        }))
      };
    }),
    floorId: floor.id,
    floorName: floor.name,
    mapId: floor.mapId,
    mapUrl: floor.mapUrl || ''
  };
}
