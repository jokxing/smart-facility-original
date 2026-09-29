import {listGardens, listBuildingsByGardenId} from '../fixtures/space';
import {protectedRoute, success} from '../response';

// Only the two existing read contracts from api/map/index.js.
export default [
  protectedRoute('GET', '/map/garden/list', () => success(listGardens())),
  protectedRoute('GET', '/map/building', ({params}) => success(listBuildingsByGardenId(params.gardenId)))
];
