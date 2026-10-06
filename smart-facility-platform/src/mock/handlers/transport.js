import {
  allocateCar,
  changeDriver,
  changeState,
  createOrder,
  deleteOrders,
  getOrderDetail,
  getStateInfo,
  historyAlarms,
  historyData,
  indexGpsPage,
  indexGpsTrack,
  indexOrderList,
  listAddresses,
  listCars,
  listDrivers,
  listOrders,
  listSamples,
  monitorGps,
  printBundle,
  resetDemoTransport,
  updateOrder,
  webDashboard
} from '../fixtures/transport';
import {failure, protectedRoute, success} from '../response';

function wrap(result) {
  if (!result || !result.ok) return failure((result && result.message) || '操作失败');
  return success(result.items);
}

function idFromPath(path, prefix) {
  const part = String(path || '').split(prefix).pop();
  return part && part.split('/')[0];
}

export default [
  protectedRoute('POST', '/__demo/transport/reset', () => {
    resetDemoTransport();
    return success(true);
  }),
  protectedRoute('POST', '/transportOrder/query', ({body}) => success(listOrders(body || {}))),
  protectedRoute('POST', '/transportOrder/add', ({body}) => wrap(createOrder(body || {}))),
  protectedRoute('POST', '/transportOrder/update', ({body}) => wrap(updateOrder(body || {}))),
  protectedRoute('POST', '/transportOrder/allocateCar', ({body}) => wrap(allocateCar(body || {}))),
  protectedRoute('POST', '/transportOrder/change/state', ({body}) => wrap(changeState(body || {}))),
  protectedRoute('POST', '/transportOrder/change/driver', ({body}) => wrap(changeDriver(body || {}))),
  protectedRoute('POST', '/transportOrder/delete', () => wrap(deleteOrders())),
  protectedRoute('GET', /^\/transportOrder\/detail\/\d+$/, ({path}) => {
    const detail = getOrderDetail(idFromPath(path, '/transportOrder/detail/'));
    return detail ? success(detail) : failure('未知运单');
  }),
  protectedRoute('GET', '/transportOrder/dashboard', ({params}) => success(webDashboard(params || {}))),
  protectedRoute('GET', '/transportOrder/change/getStateInfo', ({params}) => wrap(getStateInfo(params || {}))),
  protectedRoute('GET', '/transportOrder/historyAlarmRecord', ({params}) => success(historyAlarms(params || {}))),
  protectedRoute('GET', '/transportOrder/index/historyData', ({params}) => success(historyData(params || {}))),
  protectedRoute('GET', '/transportOrder/index/historyData/gps', ({params}) => success(indexGpsPage(params || {}))),
  protectedRoute('GET', '/transportOrder/index/graphics', ({params}) => success(indexGpsTrack(params || {}))),
  protectedRoute('POST', '/transportOrder/index/order/list', ({body}) => success(indexOrderList(body || {}))),
  protectedRoute('POST', '/transportOrder/index/gps', ({body}) => success(indexGpsTrack(body || {}))),
  protectedRoute('GET', '/transportOrder/monitorInfo/gps', ({params}) => wrap(monitorGps(params || {}))),
  protectedRoute('POST', '/transportOrder/batchPrint/new', ({body}) => wrap(printBundle(body || {}))),
  protectedRoute('GET', '/userDriverInfo/miniQueryAll', () => success(listDrivers())),
  protectedRoute('GET', '/userDriverInfo/query', ({params}) => success({list: listDrivers(), total: listDrivers().length, pageNum: 1, pageSize: 10})),
  protectedRoute('GET', '/refrigerateCar/query', ({params}) => success(listCars(params || {}))),
  protectedRoute('GET', '/sampleInfo/miniQueryAll', ({params}) => success(listSamples(params || {}))),
  protectedRoute('POST', '/sampleInfo/query', ({body}) => {
    const rows = listSamples(body || {});
    const pageNum = Math.max(1, Math.floor(Number(body && body.pageNum) || 1));
    const pageSize = Math.min(50, Math.max(1, Math.floor(Number(body && body.pageSize) || 10)));
    return success({list: rows.slice((pageNum - 1) * pageSize, pageNum * pageSize), total: rows.length, pageNum, pageSize});
  }),
  protectedRoute('GET', '/receiptDeliverAddress/miniQueryAll', ({params}) => success(listAddresses(params || {}))),
  protectedRoute('GET', '/transportOrder/export/gps', () => failure('演示未开放 GPS 导出。')),
  protectedRoute('GET', '/transportOrder/index/historyData/gps/export', () => failure('演示未开放 GPS 导出。')),
  protectedRoute('GET', '/transportOrder/historyAlarmRecord/export', () => failure('演示未开放报警导出。')),
  protectedRoute('POST', '/userDriverInfo/add', () => failure('演示未开放司机档案管理。')),
  protectedRoute('POST', '/refrigerateCar/add', () => failure('演示未开放冷藏车档案管理。')),
  protectedRoute('POST', '/sampleInfo/add', () => failure('演示未开放品名维护。')),
  protectedRoute('POST', '/receiptDeliverAddress/add', () => failure('演示未开放收发货单位管理。'))
];
