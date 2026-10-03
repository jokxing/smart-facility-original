import {listGardens, listBuildingsByGardenId} from '../fixtures/space';
import {listFloorsByBuildingId, createDemoFloor, updateDemoFloor} from '../fixtures/mapFloor';
import {protectedRoute, success, failure} from '../response';
import {validateDemoStoredMedia} from '../../utils/demoMediaStore';

export default [
  protectedRoute('GET', '/map/garden/list', () => success(listGardens())),
  protectedRoute('GET', '/map/building', ({params}) => success(listBuildingsByGardenId(params.gardenId))),
  protectedRoute('GET', '/map/floor', ({params}) => {
    const buildingId = params && params.buildingId;
    if (buildingId == null || buildingId === '') return failure('请指定楼宇。');
    return success(listFloorsByBuildingId(buildingId));
  }),
  protectedRoute('POST', '/map/floor', async ({body}) => {
    const mediaCheck = await validateDemoStoredMedia(body && ((body.media && body.media.url) || body.mapUrl));
    if (!mediaCheck.ok) return failure(mediaCheck.message);
    try {
      const result = createDemoFloor(body || {});
      return result.ok ? success(result.item) : failure(result.message);
    } catch (_) {
      return failure('保存失败，请检查浏览器存储空间后重试。');
    }
  }),
  protectedRoute('PUT', '/map/floor', async ({body}) => {
    const mediaCheck = await validateDemoStoredMedia(body && body.media && body.media.url);
    if (!mediaCheck.ok) return failure(mediaCheck.message);
    try {
      const result = updateDemoFloor(body || {});
      return result.ok ? success(result.item) : failure(result.message);
    } catch (_) {
      return failure('保存失败，请检查浏览器存储空间后重试。');
    }
  }),
  protectedRoute('DELETE', '/map/floor', () => failure('本阶段演示未开放楼层删除。'))
];
