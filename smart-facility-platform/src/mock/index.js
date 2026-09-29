import {createMockAdapter} from './adapter';
import authRoutes from './handlers/auth';
import mapRoutes from './handlers/map';
import floorRoutes from './handlers/floor';
import dataVRoutes from './handlers/dataV';
import roomRoutes from './handlers/room';
import instrumentRoutes from './handlers/instrument';
import alarmLogRoutes from './handlers/alarmLog';

// Register only verified contracts. Unknown requests never fall through to HTTP.
export default createMockAdapter([
  ...authRoutes,
  ...mapRoutes,
  ...floorRoutes,
  ...dataVRoutes,
  ...roomRoutes,
  ...instrumentRoutes,
  ...alarmLogRoutes
]);
