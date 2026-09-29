import {
  listRoonInstrumentInfo,
  resetRoomInstrumentLayout,
  saveRoomInstrumentLayout
} from '../fixtures/instrument';
import {getDemoScenario, setDemoScenario} from '../fixtures/scenario';
import {failure, protectedRoute, success} from '../response';

// Room instrument layout read/write (type:4 only) + scenario + layout reset.
export default [
  protectedRoute('POST', '/map/element/getRoonInstrumentInfoList', ({params}) => {
    return success(listRoonInstrumentInfo(params.roomId));
  }),
  protectedRoute('POST', '/map/element/config', ({body}) => {
    const items = Array.isArray(body) ? body : (body && body.list);
    const result = saveRoomInstrumentLayout(items);
    if (!result.ok) return failure(result.message || '保存失败');
    return success({roomId: result.roomId, count: result.count});
  }),
  protectedRoute('POST', '/demo/room-layout/reset', ({body}) => {
    const result = resetRoomInstrumentLayout(body && body.roomId);
    if (!result.ok) return failure(result.message || '重置失败');
    return success({roomId: result.roomId, list: listRoonInstrumentInfo(result.roomId).list});
  }),
  protectedRoute('GET', '/demo/scenario', () => success({scenario: getDemoScenario()})),
  protectedRoute('POST', '/demo/scenario', ({body}) => {
    const next = setDemoScenario(body && body.scenario);
    if (body && body.scenario != null && String(body.scenario).trim() !== next) {
      return failure('演示场景仅支持 normal / alarm / offline。');
    }
    return success({scenario: next});
  })
];
