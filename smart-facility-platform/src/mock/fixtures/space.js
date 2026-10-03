/**
 * Unified synthetic space seed for garden / building / floor reads.
 *
 * Do not copy original customer gardens, buildings, floors, or model paths.
 * Values below are invented for local demo only — not a real backend schema.
 *
 * Field provenance
 * | Field | Status | Evidence |
 * | gardenId, gardenName | Source-confirmed (garden list) | Building.vue el-option + getList |
 * | id, name, url, subDivisions | Source-confirmed (building list) | Building.vue buildingInit / handleBuildingNum |
 * | subDivisions[].id, name | Source-confirmed (floor buttons / query) | Building.vue floorBtns + goFloorView |
 * | subDivisions[].mapId, mapUrl | Source-confirmed (consumed on floor jump) | Building.vue goFloorView query |
 * | Numeric ID ranges / display labels | Provisional demo values | Chosen for this seed only |
 * | building.url | Demo registry keys | Mapped by demoModelUrl.js to public/demo/models/*.glb |
 * | floor.mapUrl (one demo floor) | Demo registry key | demo-floor-a-1f → public/demo/floors/floor-a-1f.svg |
 * | other floors mapUrl | Still empty | Pending until more floor assets |
 *
 * Parent–child: one tree only. listBuildingsByGardenId filters this tree by gardenId.
 *
 * Model/map status (task 4A): buildings ready; at least one floor mapUrl registered for read-only preview.
 */
export const DEMO_MODEL_PENDING = {
  buildingUrlReady: true,
  floorMapUrlReady: true,
  reason: 'One synthetic floor plan (demo-floor-a-1f) is local; other floors mapUrl still empty; designer not open.'
};

export const DEMO_SPACE = [
  {
    gardenId: 910001,
    gardenName: '演示甲园区',
    buildings: [
      {
        id: 920001,
        name: '演示一号楼',
        url: 'demo-building-a',
        subDivisions: [
          {id: 930001, name: '1F', mapId: 940001, mapUrl: 'demo-floor-a-1f'},
          {id: 930002, name: '2F', mapId: 940002, mapUrl: ''},
          {id: 930003, name: '3F', mapId: 940003, mapUrl: ''}
        ]
      },
      {
        id: 920002,
        name: '演示二号楼',
        url: 'demo-building-b',
        subDivisions: [
          {id: 930011, name: '1F', mapId: 940011, mapUrl: ''},
          {id: 930012, name: '2F', mapId: 940012, mapUrl: ''}
        ]
      }
    ]
  },
  {
    gardenId: 910002,
    gardenName: '演示乙园区',
    buildings: [
      {
        id: 920101,
        name: '演示实验楼',
        url: 'demo-building-c',
        subDivisions: [
          {id: 930101, name: 'B1', mapId: 940101, mapUrl: ''},
          {id: 930102, name: '1F', mapId: 940102, mapUrl: ''},
          {id: 930103, name: '2F', mapId: 940103, mapUrl: ''}
        ]
      }
    ]
  }
];

function assertUnique(set, value, label) {
  if (set.has(value)) {
    throw new Error(`Demo space seed duplicate ${label}: ${value}`);
  }
  set.add(value);
}

/** Fail fast if IDs collide or a building/floor lacks required confirmed fields. */
export function assertDemoSpaceIntegrity(space = DEMO_SPACE) {
  const gardenIds = new Set();
  const buildingIds = new Set();
  const floorIds = new Set();
  const mapIds = new Set();

  for (const garden of space) {
    if (garden.gardenId == null || !garden.gardenName) {
      throw new Error('Demo garden requires gardenId and gardenName');
    }
    assertUnique(gardenIds, garden.gardenId, 'gardenId');
    if (!Array.isArray(garden.buildings) || garden.buildings.length === 0) {
      throw new Error(`Demo garden ${garden.gardenId} has no buildings`);
    }
    for (const building of garden.buildings) {
      if (building.id == null || !building.name || !('url' in building) || !Array.isArray(building.subDivisions)) {
        throw new Error(`Demo building under ${garden.gardenId} missing id/name/url/subDivisions`);
      }
      assertUnique(buildingIds, building.id, 'building id');
      if (building.subDivisions.length === 0) {
        throw new Error(`Demo building ${building.id} has no floors`);
      }
      for (const floor of building.subDivisions) {
        if (floor.id == null || !floor.name || !('mapId' in floor) || !('mapUrl' in floor)) {
          throw new Error(`Demo floor under building ${building.id} missing id/name/mapId/mapUrl`);
        }
        assertUnique(floorIds, floor.id, 'floor id');
        assertUnique(mapIds, floor.mapId, 'mapId');
      }
    }
  }
  return {
    gardenCount: gardenIds.size,
    buildingCount: buildingIds.size,
    floorCount: floorIds.size
  };
}

assertDemoSpaceIntegrity();

export function listGardens() {
  return DEMO_SPACE.map(({gardenId, gardenName}) => ({gardenId, gardenName}));
}

export function listBuildingsByGardenId(gardenId) {
  const key = gardenId == null || gardenId === '' ? null : Number(gardenId);
  if (key == null || Number.isNaN(key)) return [];
  const garden = DEMO_SPACE.find(item => item.gardenId === key);
  if (!garden) return [];
  // Lazy require avoids circular init with mapFloor → space.
  const {mergeBuildingFloors} = require('./mapFloor');
  return garden.buildings.map(building => {
    const merged = mergeBuildingFloors(building, garden);
    return {
      id: merged.id,
      name: merged.name,
      url: merged.url,
      subDivisions: merged.subDivisions
    };
  });
}
