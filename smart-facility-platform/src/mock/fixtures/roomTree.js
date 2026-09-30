import {DEMO_SPACE} from './space';
import {DEMO_FLOOR_ROOMS} from './floor';

/**
 * POST /room/tree — SelectRoomTree (edit modal). Level 4 nodes are selectable rooms.
 * Shape: garden → building → floor → room; props {id, name, children, level}.
 */
export function listRoomTree(body = {}) {
  const keyword = String(body.keyword || '').trim().toLowerCase();
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
      for (const floor of building.subDivisions || []) {
        const rooms = (DEMO_FLOOR_ROOMS[floor.id] || [])
          .filter(room => !keyword || String(room.name).toLowerCase().includes(keyword))
          .map(room => ({id: room.id, name: room.name, level: 4, children: []}));
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
