import {DEMO_SPACE} from './space';
import {listFloorsByBuildingId} from './mapFloor';
import {allDemoRoomRows} from './room';

/**
 * POST /room/tree — SelectRoomTree (edit modal). Level 4 nodes are selectable rooms.
 * Shape: garden → building → floor → room; props {id, name, children, level}.
 * Floors/rooms include M2 overlays (created + meta − deleted).
 */
export function listRoomTree(body = {}) {
  const keyword = String(body.keyword || '').trim().toLowerCase();
  const roomsByFloor = new Map();
  for (const row of allDemoRoomRows()) {
    if (keyword && !String(row.name).toLowerCase().includes(keyword)) continue;
    const fid = Number(row.floorId);
    if (!roomsByFloor.has(fid)) roomsByFloor.set(fid, []);
    roomsByFloor.get(fid).push({id: row.id, name: row.name, level: 4, children: []});
  }
  const trees = [];
  for (const garden of DEMO_SPACE) {
    const gardenNode = {
      id: garden.gardenId,
      name: garden.gardenName,
      level: 1,
      children: []
    };
    for (const building of garden.buildings || []) {
      const buildingNode = {
        id: building.id,
        name: building.name,
        level: 2,
        children: []
      };
      for (const floor of listFloorsByBuildingId(building.id)) {
        const rooms = roomsByFloor.get(Number(floor.id)) || [];
        if (!rooms.length) continue;
        buildingNode.children.push({
          id: floor.id,
          name: floor.name,
          level: 3,
          children: rooms
        });
      }
      if (buildingNode.children.length) gardenNode.children.push(buildingNode);
    }
    if (gardenNode.children.length) trees.push(gardenNode);
  }
  return trees;
}
