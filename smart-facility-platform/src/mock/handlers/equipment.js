import {
  addEquipmentInstrumentBinding,
  addEquipmentRoomBinding,
  emptyUseStatusPage,
  getAlertorBeepTime,
  getDeviceWifiEcho,
  getEquipmentDashboardOverview,
  listDevices,
  getEquipmentDetail,
  getEquipmentDeviceMonitorFlag,
  getEquipmentSingleMonitorFlag,
  getHistoryDeviceChart,
  handleEquipmentException,
  listEquipmentBindThingsCheck,
  listEquipmentBindings,
  listEquipmentHistoryAlarms,
  listEquipmentSort,
  listEquipmentUsers,
  updateEquipmentUserAlarm,
  listGunPipetteBindings,
  listLabelBindings,
  listBindableCatalog,
  listBoundEquipmentForRoom,
  listMonitorIndicatorThingsNewList,
  listSignalReceiverBindings,
  emptyDeviceHistoryAlarmPage,
  addEquipmentUsers,
  removeEquipmentBinding,
  removeEquipmentUserRecord,
  updateEquipmentAlarmInterval,
  updateEquipmentBasic,
  updateEquipmentReportingInterval,
  updateEquipmentSensors
} from '../fixtures/equipment';
import {failure, protectedRoute, success} from '../response';

export default [
  protectedRoute('GET', '/__demo/equipment/bindable', ({params}) => {
    if (!params || !['room', 'instrument'].includes(params.kind)) return failure('绑定类型无效。');
    return success(listBindableCatalog(params.kind));
  }),
  protectedRoute('POST', '/equipment/sort/list', ({body}) => success(listEquipmentSort(body || {}))),
  protectedRoute('GET', '/equipment/dashboard', ({params}) => success(getEquipmentDashboardOverview(params || {}))),
  protectedRoute('POST', '/device/list', ({body}) => success(listDevices(body || {}))),
  protectedRoute('POST', '/device/remove/batch', () => failure('本阶段演示未开放枪架批量删除。')),
  protectedRoute('GET', '/device/output/equipment', () => failure('本阶段演示未开放枪架导出。')),
  protectedRoute('POST', '/device/room', () => failure('本阶段演示未开放批量修改房间。')),
  protectedRoute('POST', '/device/add', () => failure('本阶段演示未开放新增枪架。')),
  protectedRoute('POST', '/device/openGun/remind', () => failure('本阶段演示未开放语音提醒下发（需真实枪架）。')),
  protectedRoute('POST', '/device/import/batch/equipment', () => failure('本阶段演示未开放枪架导入。')),

  protectedRoute('GET', '/device/detail', ({params}) => {
    const detail = getEquipmentDetail(params && params.deviceId);
    return detail ? success(detail) : failure('演示硬件不存在或本阶段未开放该类型详情。');
  }),
  protectedRoute('GET', '/alertor/obtain/beepTime', ({params}) => {
    const seconds = getAlertorBeepTime(params && params.equipmentId);
    return seconds != null ? success(seconds) : failure('演示声光蜂鸣时长不存在。');
  }),
  protectedRoute('GET', '/monitorIndicator/getDeviceSingleMonitorFlag', ({params}) => {
    const items = getEquipmentSingleMonitorFlag(params && params.equipmentId);
    return items ? success(items) : failure('演示硬件监测标签不存在。');
  }),
  protectedRoute('GET', '/monitorIndicator/getDeviceMonitorFlag', ({params}) => {
    const items = getEquipmentDeviceMonitorFlag(params && params.equipmentId);
    return items ? success(items) : failure('演示硬件监测标签不存在。');
  }),
  protectedRoute('GET', '/monitorAlarmRule/isOpenTwoSystem', () => success(false)),
  protectedRoute('GET', '/equipmentUser/list', ({params}) => success(listEquipmentUsers(params || {}))),
  protectedRoute('POST', '/equipmentUser/add', ({body}) => {
    const result = addEquipmentUsers(body || {});
    if (!result.ok) return failure(result.message || '添加失败');
    return success({count: result.count});
  }),
  protectedRoute('POST', '/equipmentUser/alarmSetting', ({body}) => {
    try {
      const result = updateEquipmentUserAlarm(body || {});
      return result.ok ? success(null) : failure(result.message);
    } catch (_) { return failure('保存失败，请检查本地存储后重试。'); }
  }),
  protectedRoute('POST', '/equipmentUser/remove', ({body}) => {
    const result = removeEquipmentUserRecord(body || {});
    if (!result.ok) return failure(result.message || '删除失败');
    return success(null);
  }),
  protectedRoute('GET', '/useStatus/query', () => success(emptyUseStatusPage())),
  protectedRoute('POST', '/device/binding', ({params, body}) => {
    const equipmentIdStr = (params && params.equipmentIdStr)
      || (body && (body.equipmentIdStr != null ? body.equipmentIdStr : body.equipmentId));
    return success(listEquipmentBindings({equipmentIdStr}));
  }),
  protectedRoute('GET', '/monitorIndicator/things/newList', ({params}) => {
    const objType = Number(params && params.objType);
    if (objType !== 2 && objType !== 3) {
      return failure('本切片仅支持房间或仪器关联硬件列表。');
    }
    return success(listMonitorIndicatorThingsNewList(params || {}));
  }),
  protectedRoute('POST', '/device/deviceBindThings', ({body}) => {
    return success(listEquipmentBindThingsCheck(body || {}));
  }),
  protectedRoute('GET', '/device/statusPdf', () => success('')),
  protectedRoute('POST', '/device/update/closeAlarm/soundLight', () => failure('本阶段演示未开放声光报警开关。')),
  protectedRoute('POST', '/device/update/closeAlarm/system', () => failure('本阶段演示未开放平台报警开关。')),
  protectedRoute('GET', '/device/signal/bind/list', ({params}) => {
    return success(listSignalReceiverBindings(params || {}));
  }),
  protectedRoute('GET', '/device/signal/bind/devices', () => failure('本阶段演示未开放信号接收器绑定写操作。')),
  protectedRoute('POST', '/device/signal/bind', () => failure('本阶段演示未开放信号接收器绑定。')),
  protectedRoute('POST', '/device/signal/unbind', () => failure('本阶段演示未开放信号接收器解绑。')),
  protectedRoute('GET', '/history/device/chart', ({params}) => {
    const chart = getHistoryDeviceChart(params || {});
    return chart ? success(chart) : failure('演示硬件曲线不存在或本阶段未开放。');
  }),
  protectedRoute('GET', '/device/wifi/echo', ({params}) => {
    const echo = getDeviceWifiEcho(params && params.deviceId);
    return echo ? success(echo) : failure('演示联网配置不存在或该类型未开放。');
  }),
  protectedRoute('POST', '/device/wifi/input', () => failure('本阶段演示未开放联网配置下发。')),
  protectedRoute('POST', '/device/wifi/inputBatch', () => failure('本阶段演示未开放联网配置批量下发。')),
  protectedRoute('POST', '/gun/pipette/binding/list', ({body}) => {
    return success(listGunPipetteBindings(body || {}));
  }),
  protectedRoute('POST', '/label/binding/list', ({body}) => {
    return success(listLabelBindings(body || {}));
  }),
  protectedRoute('GET', '/history/device/alarm', ({params}) => success(emptyDeviceHistoryAlarmPage(params || {}))),
  protectedRoute('GET', '/history/my/alarm', ({params}) => success(emptyDeviceHistoryAlarmPage(params || {}))),
  protectedRoute('POST', '/monitorIndicator/historyAlarmRecord', ({body}) => {
    return success(listEquipmentHistoryAlarms(body || {}));
  }),
  protectedRoute('POST', '/monitorIndicator/exceptionHandle', ({body}) => {
    const result = handleEquipmentException(body || {});
    if (!result.ok) return failure(result.message || '处理失败');
    return success({key: result.key});
  }),
  protectedRoute('POST', '/device/update/interval/report', ({body}) => {
    const result = updateEquipmentReportingInterval(body || {});
    if (!result.ok) return failure(result.message || '修改失败');
    return success({reportingInterval: result.reportingInterval});
  }),
  protectedRoute('POST', '/device/update/interval/alarm', ({body}) => {
    const result = updateEquipmentAlarmInterval(body || {});
    if (!result.ok) return failure(result.message || '修改失败');
    return success({alarmInterval: result.alarmInterval});
  }),
  protectedRoute('POST', '/device/update/sensors', ({body}) => {
    const result = updateEquipmentSensors(body || {});
    if (!result.ok) return failure(result.message || '修改失败');
    return success({count: result.count});
  }),
  protectedRoute('POST', '/device/update/basic', ({body}) => {
    const result = updateEquipmentBasic(body || {});
    if (!result.ok) return failure(result.message || '修改失败');
    return success({name: result.name, departmentId: result.departmentId});
  }),
  protectedRoute('POST', '/room/things/add', ({body}) => {
    const result = addEquipmentRoomBinding(body || {});
    if (!result.ok) return failure(result.message || '绑定失败');
    return success(result.list);
  }),
  protectedRoute('POST', '/room/things/remove', ({body}) => {
    const result = removeEquipmentBinding({...(body || {}), thingsType: 11});
    if (!result.ok) return failure(result.message || '解绑失败');
    return success(result.list);
  }),
  protectedRoute('POST', '/instrument/things/add', ({body}) => {
    const result = addEquipmentInstrumentBinding(body || {});
    if (!result.ok) return failure(result.message || '绑定失败');
    return success(result.list);
  }),
  protectedRoute('POST', '/instrument/things/remove', ({body}) => {
    const result = removeEquipmentBinding({...(body || {}), thingsType: body && body.thingsType != null ? body.thingsType : 4});
    if (!result.ok) return failure(result.message || '解绑失败');
    return success(result.list);
  })
];
