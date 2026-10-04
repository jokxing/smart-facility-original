import {DEMO_SPACE} from './space';
import {listFloorsByBuildingId} from './mapFloor';
import {DEMO_USER} from './auth';
import {listInstrumentsByRoomId, listInstrumentsForFloorRooms, sensorReadingForInstrument} from './instrument';
import {aggregateInstrumentStatus, statusForInstrument} from './scenario';
import {EQUIPMENT_TYPE_META} from './equipment';

function roomsForFloorCards(floorId) {
  try {
    const {allDemoRoomRows} = require('./room');
    return allDemoRoomRows().filter(row => Number(row.floorId) === Number(floorId));
  } catch (_) {
    return [];
  }
}

/**
 * FloorDataV (POST /map/floor/screenV1) projection from shared space/room seeds.
 * Source-confirmed consumption: roomList, roomData, floorDetail, roomCount, alarmCount.
 * Sensor fields are provisional demo values for card display only.
 */

function findFloorContext(floorId) {
  const key = floorId == null || floorId === '' ? null : Number(floorId);
  for (const garden of DEMO_SPACE) {
    for (const building of garden.buildings) {
      const floors = listFloorsByBuildingId(building.id);
      for (const floor of floors) {
        if (key != null && floor.id === key) {
          return {garden, building, floor};
        }
      }
    }
  }
  if (key != null) return null;
  // Only an omitted ID selects the default demo floor.
  const garden = DEMO_SPACE[0];
  const building = garden.buildings[0];
  const floor = listFloorsByBuildingId(building.id)[0];
  return {garden, building, floor};
}

function roomCardsForFloor(floorId, statusFilter) {
  const rooms = roomsForFloorCards(floorId);
  return rooms.map(room => {
    const devices = listInstrumentsByRoomId(room.id);
    const senorStatus = devices.length ? aggregateInstrumentStatus(devices) : (room.senorStatus == null ? 3 : room.senorStatus);
    const representative = devices.find(device => statusForInstrument(device.id).senorStatus === senorStatus) || devices[0];
    const reading = representative ? sensorReadingForInstrument(representative.id) : null;
    return {
      id: room.id,
      name: room.name,
      senorStatus,
      data: reading ? [
        {
          id: 960000 + room.id % 1000,
          monitorSensorCatId: 101,
          monitorSensorVal: reading.val == null ? '' : reading.val,
          unit: '℃',
          sensorAlias: representative.name + '温度',
          activateFlag: senorStatus === 2 ? 1 : 0,
          signalSwitchStatus: 0,
          normalMin: 0,
          normalMax: 40
        }
      ] : []
    };
  }).filter(room => (statusFilter == null || statusFilter === '' ? true : Number(room.senorStatus) === Number(statusFilter)));
}

export function listMapGardenTree() {
  return DEMO_SPACE.map(garden => ({
    gardenId: garden.gardenId,
    gardenName: garden.gardenName,
    subDivisions: garden.buildings.map(building => ({
      id: building.id,
      name: building.name,
      subDivisions: listFloorsByBuildingId(building.id).map(floor => ({
        id: floor.id,
        name: floor.name
      }))
    }))
  }));
}

export function listFloorScreen(body = {}) {
  const ctx = findFloorContext(body.floorId) || {garden: {}, building: {}, floor: {}};
  const statusFilter = body.status;
  const roomList = roomCardsForFloor(ctx.floor.id, statusFilter);
  const roomData = roomsForFloorCards(ctx.floor.id).map(room => ({
    id: room.id,
    name: room.name,
    screenShowFlag: 1
  }));
  const alarmTotal = roomList.filter(r => r.senorStatus === 2).length;
  const offlineCount = roomList.filter(r => r.senorStatus === -100).length;
  const normalCount = roomList.filter(r => r.senorStatus === 1).length;
  return {
    roomList,
    roomData,
    floorDetail: {
      gardenName: ctx.garden.gardenName,
      buildingName: ctx.building.name,
      floorName: ctx.floor.name,
      companyName: DEMO_USER.companyName,
      departmentName: '演示运维部',
      userName: DEMO_USER.name
    },
    roomCount: {
      total: roomList.length,
      normalCount,
      alarmCount: alarmTotal,
      offlineCount,
      status: alarmTotal > 0 ? 2 : 1
    },
    alarmCount: alarmTotal > 0
      ? [{type: 101, name: '演示温度', count: alarmTotal}]
      : []
  };
}

export {listAlarmThingStatistics, listAlarmThingSensorsStatistics} from './alarm';

/** SearchForm related-hardware select: {code, name} from EQUIPMENT_TYPE_META. */
export function listBindEquipmentTypes() {
  return EQUIPMENT_TYPE_META.map(meta => ({code: meta.type, name: meta.name}));
}

/**
 * RoomDataV (POST /map/room/screenV1) — instrument cards for building/floor scope.
 * Source-confirmed: instrumentCount, instrumentList, roomDetail.
 */
function findBuildingContext(buildingId) {
  const key = buildingId == null || buildingId === '' ? null : Number(buildingId);
  for (const garden of DEMO_SPACE) {
    for (const building of garden.buildings) {
      if (key != null && building.id === key) {
        const floor = (building.subDivisions || [])[0] || {id: null, name: ''};
        return {garden, building, floor};
      }
    }
  }
  return key == null ? findFloorContext(null) : null;
}

function instrumentCardsForFloor(floorId, statusFilter) {
  const rooms = roomsForFloorCards(floorId);
  return listInstrumentsForFloorRooms(rooms.map(room => room.id)).map((entity, index) => ({
    id: entity.id,
    roomId: entity.roomId,
    floorId,
    name: entity.name,
    senorStatus: statusForInstrument(entity.id).senorStatus,
    data: [
      {
        id: 980000 + (entity.id % 1000),
        monitorSensorCatId: 101,
        monitorSensorVal: sensorReadingForInstrument(entity.id).val == null ? '' : sensorReadingForInstrument(entity.id).val,
        unit: '℃',
        sensorAlias: '演示温度',
        activateFlag: statusForInstrument(entity.id).senorStatus === 2 ? 1 : 0,
        signalSwitchStatus: 0,
        normalMin: 0,
        normalMax: 40
      }
    ]
  })).filter(item => (statusFilter == null || statusFilter === '' ? true : Number(item.senorStatus) === Number(statusFilter)));
}

export function listRoomScreen(body = {}) {
  let ctx = body.floorId != null && body.floorId !== ''
    ? findFloorContext(body.floorId)
    : body.buildingId != null && body.buildingId !== ''
      ? findBuildingContext(body.buildingId)
      : findFloorContext(null);
  const statusFilter = body.status;
  // Intersect explicit scopes; invalid IDs never select another space.
  if (ctx && body.buildingId != null && body.buildingId !== '' && Number(body.buildingId) !== ctx.building.id) ctx = null;
  const floorScoped = body.floorId != null && body.floorId !== '';
  const floors = ctx
    ? (floorScoped ? [ctx.floor] : listFloorsByBuildingId(ctx.building.id))
    : [];
  let instrumentList = floors.reduce((cards, floor) => cards.concat(instrumentCardsForFloor(floor.id, statusFilter)), []);
  if (body.roomIds != null && body.roomIds !== '') {
    const ids = (Array.isArray(body.roomIds) ? body.roomIds : String(body.roomIds).split(','))
      .map(Number)
      .filter(n => !Number.isNaN(n));
    instrumentList = instrumentList.filter(item => ids.includes(item.roomId));
  }
  const total = instrumentList.length;
  return {
    instrumentCount: {
      notMonitorCount: 0,
      monitorTotal: total,
      total,
      normalCount: instrumentList.filter(item => item.senorStatus === 1).length,
      alarmCount: instrumentList.filter(item => item.senorStatus === 2).length,
      offlineCount: instrumentList.filter(item => item.senorStatus === -100).length,
      runCount: instrumentList.filter(item => item.senorStatus === 1).length,
      standbyCount: 0,
      shutdownCount: 0,
      maintainCount: 0
    },
    instrumentList,
    roomDetail: {
      roomName: ctx ? ctx.building.name + ' · 设备监控' : '',
      companyName: DEMO_USER.companyName,
      floorName: ctx ? ctx.floor.name : '',
      buildingName: ctx ? ctx.building.name : '',
      gardenName: ctx ? ctx.garden.gardenName : ''
    }
  };
}
