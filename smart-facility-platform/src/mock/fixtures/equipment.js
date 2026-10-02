/**
 * Demo smart-hardware (equipment) seeds for HardwareHome POST /equipment/sort/list.
 * Separate from lab instruments (instrument.js). Synthetic IDs in 980xxx.
 */

import {formatDemoDateTime, DEMO_NOW_MS, parseDemoDateTime} from '../clock';
import storage from '../storage';
import {listAllStaff, isActiveDepartment, findDepartmentById} from './auth';
import {DEMO_FLOOR_ROOMS} from './floor';
import {listActiveInstrumentSeeds, resolveInstrumentEntity} from './instrument';

const DEPT_OPS = 900101;
const DEPT_RD = 900102;

export const SENSOR_TYPE_META = Object.freeze([
  {code: 0, name: '全部'},
  {code: 1, name: '温度（温湿度设备单通道演示）', unit: '℃', sensorTypeId: 101},
  {code: 2, name: '温度', unit: '℃', sensorTypeId: 102},
  {code: 3, name: '水浸', unit: '', sensorTypeId: 103},
  {code: 4, name: '二氧化碳', unit: 'ppm', sensorTypeId: 104},
  {code: 5, name: '压差', unit: 'Pa', sensorTypeId: 105},
  {code: 6, name: '氧气', unit: '%', sensorTypeId: 106},
  {code: 7, name: '压力', unit: 'kPa', sensorTypeId: 107},
  {code: 8, name: '供电状态', unit: '', sensorTypeId: 17}
]);

export const EQUIPMENT_TYPE_META = Object.freeze([
  {type: 0, name: '记录仪'},
  {type: 10, name: '设备管理器'},
  {type: 7, name: '声光报警器'},
  {type: 8, name: '断电报警器'},
  {type: 14, name: '信号接收器'},
  {type: 13, name: '移液枪架'},
  {type: 16, name: '资产网关'}
]);

function sensorFor(deviceType, status, value) {
  const meta = SENSOR_TYPE_META.find(item => item.code === deviceType) || SENSOR_TYPE_META[1];
  const isSwitch = deviceType === 3;
  return {
    idx: 0,
    type: isSwitch ? 26 : (deviceType === 8 ? 17 : deviceType),
    status,
    value: isSwitch ? (status === 1 ? 0 : 1) : value,
    signalSwitchStatus: 0,
    switchOff: false,
    warningMin: 0,
    warningMax: 0,
    sensorType: {
      id: meta.sensorTypeId || deviceType,
      name: meta.name,
      unit: meta.unit || ''
    }
  };
}

function row(seed) {
  const createDate = formatDemoDateTime(DEMO_NOW_MS - seed.daysAgo * 86400000);
  const noProbe = [7, 13, 16].includes(seed.equipmentTypeCode);
  const deviceType = noProbe ? 0 : (seed.equipmentTypeCode === 8 ? 8 : seed.deviceType);
  return {
    id: seed.id,
    strId: String(seed.id),
    name: seed.name,
    no: seed.no,
    departmentId: seed.departmentId,
    departmentName: seed.departmentId === DEPT_RD ? '演示研发部' : '演示运维部',
    deviceType,
    equipmentTypeCode: seed.equipmentTypeCode,
    status: seed.status,
    battery: seed.battery != null ? seed.battery : '3.6',
    detectFlag: !!seed.detectFlag,
    gatewayName: seed.gatewayName || '演示网关 A',
    panId: seed.panId || '',
    createDate,
    reportDate: createDate,
    openTwoSystem: true,
    sensors: noProbe ? [] : [sensorFor(deviceType, seed.status === -100 ? -100 : (seed.status === -1 ? -1 : 1),
      deviceType === 8 ? (seed.status === 1 ? 1 : 0) : seed.value)]
  };
}

/**
 * 22 rows → ≥2 pages at pageSize 10.
 * Mix: equipment types, sensor types, departments, normal / alarm / offline.
 */
export const DEMO_EQUIPMENTS = Object.freeze([
  row({id: 980001, name: '演示温湿度记录仪 A', no: 'EQ-TH-001', departmentId: DEPT_OPS, deviceType: 1, equipmentTypeCode: 0, status: 1, value: '24.5', daysAgo: 30}),
  row({id: 980002, name: '演示温湿度记录仪 B', no: 'EQ-TH-002', departmentId: DEPT_OPS, deviceType: 1, equipmentTypeCode: 0, status: -1, value: '38.2', daysAgo: 28}),
  row({id: 980003, name: '演示温度记录仪 A', no: 'EQ-T-001', departmentId: DEPT_RD, deviceType: 2, equipmentTypeCode: 0, status: 1, value: '22.0', daysAgo: 26}),
  row({id: 980004, name: '演示温度记录仪 B', no: 'EQ-T-002', departmentId: DEPT_OPS, deviceType: 2, equipmentTypeCode: 0, status: -100, value: '0', daysAgo: 25}),
  row({id: 980005, name: '演示水浸记录仪 A', no: 'EQ-W-001', departmentId: DEPT_OPS, deviceType: 3, equipmentTypeCode: 0, status: 1, value: 0, daysAgo: 24}),
  row({id: 980006, name: '演示二氧化碳记录仪', no: 'EQ-CO2-001', departmentId: DEPT_RD, deviceType: 4, equipmentTypeCode: 0, status: 1, value: '420', daysAgo: 22}),
  row({id: 980007, name: '演示压差记录仪', no: 'EQ-DP-001', departmentId: DEPT_OPS, deviceType: 5, equipmentTypeCode: 0, status: -1, value: '12.5', daysAgo: 20}),
  row({id: 980008, name: '演示氧气记录仪', no: 'EQ-O2-001', departmentId: DEPT_RD, deviceType: 6, equipmentTypeCode: 0, status: 1, value: '20.9', daysAgo: 18}),
  row({id: 980009, name: '演示压力记录仪', no: 'EQ-P-001', departmentId: DEPT_OPS, deviceType: 7, equipmentTypeCode: 0, status: 1, value: '101.3', daysAgo: 16}),
  row({id: 980010, name: '演示设备管理器 A', no: 'EQ-SK-001', departmentId: DEPT_OPS, deviceType: 1, equipmentTypeCode: 10, status: 1, value: '25.0', daysAgo: 15, battery: '3.7'}),
  row({id: 980011, name: '演示设备管理器 B', no: 'EQ-SK-002', departmentId: DEPT_RD, deviceType: 2, equipmentTypeCode: 10, status: -100, value: '0', daysAgo: 14, battery: '3.2'}),
  row({id: 980012, name: '演示声光报警器 A', no: 'EQ-AL-001', departmentId: DEPT_OPS, deviceType: 1, equipmentTypeCode: 7, status: 1, value: '24.0', daysAgo: 12}),
  row({id: 980013, name: '演示声光报警器 B', no: 'EQ-AL-002', departmentId: DEPT_RD, deviceType: 1, equipmentTypeCode: 7, status: -1, value: '30.0', daysAgo: 11}),
  row({id: 980014, name: '演示断电报警器 A', no: 'EQ-PO-001', departmentId: DEPT_OPS, deviceType: 2, equipmentTypeCode: 8, status: 1, value: '220', daysAgo: 10}),
  row({id: 980015, name: '演示断电报警器 B', no: 'EQ-PO-002', departmentId: DEPT_OPS, deviceType: 2, equipmentTypeCode: 8, status: -100, value: '0', daysAgo: 9}),
  row({id: 980016, name: '演示信号接收器 A', no: 'EQ-SG-001', departmentId: DEPT_RD, deviceType: 1, equipmentTypeCode: 14, status: 1, value: '24.1', daysAgo: 8}),
  row({id: 980017, name: '演示信号接收器 B', no: 'EQ-SG-002', departmentId: DEPT_OPS, deviceType: 4, equipmentTypeCode: 14, status: 1, value: '410', daysAgo: 7}),
  row({id: 980018, name: '演示温湿度记录仪 C', no: 'EQ-TH-003', departmentId: DEPT_RD, deviceType: 1, equipmentTypeCode: 0, status: 1, value: '23.8', daysAgo: 6}),
  row({id: 980019, name: '演示温度记录仪 C', no: 'EQ-T-003', departmentId: DEPT_OPS, deviceType: 2, equipmentTypeCode: 0, status: 0, value: '0', daysAgo: 5}),
  row({id: 980020, name: '演示水浸记录仪 B', no: 'EQ-W-002', departmentId: DEPT_RD, deviceType: 3, equipmentTypeCode: 0, status: -1, value: 1, daysAgo: 4}),
  row({id: 980021, name: '演示设备管理器 C', no: 'EQ-SK-003', departmentId: DEPT_OPS, deviceType: 5, equipmentTypeCode: 10, status: 1, value: '8.0', daysAgo: 3}),
  row({id: 980022, name: '演示压力记录仪 B', no: 'EQ-P-002', departmentId: DEPT_RD, deviceType: 7, equipmentTypeCode: 0, status: -100, value: '0', daysAgo: 2}),
  row({id: 980023, name: '演示移液枪架 A', no: 'EQ-GR-001', departmentId: DEPT_OPS, deviceType: 1, equipmentTypeCode: 13, status: 1, value: '0', daysAgo: 1}),
  row({id: 980024, name: '演示移液枪架 B', no: 'EQ-GR-002', departmentId: DEPT_RD, deviceType: 1, equipmentTypeCode: 13, status: -100, value: '0', daysAgo: 0}),
  row({id: 980025, name: '演示资产网关 A', no: 'EQ-GW-001', departmentId: DEPT_OPS, deviceType: 1, equipmentTypeCode: 16, status: 1, value: '0', daysAgo: 0}),
  row({id: 980026, name: '演示资产网关 B', no: 'EQ-GW-002', departmentId: DEPT_RD, deviceType: 1, equipmentTypeCode: 16, status: -100, value: '0', daysAgo: 0})
]);

function clone(item) {
  return JSON.parse(JSON.stringify(item));
}

const EQUIPMENT_META_KEY = 'equipmentMeta';
const EQUIPMENT_USERS_KEY = 'equipmentUsers';

function readJsonMap(key) {
  try {
    const raw = storage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (_) {
    return {};
  }
}

function writeJsonMap(key, map) {
  storage.setItem(key, JSON.stringify(map));
}

function departmentNameOf(departmentId) {
  const row = findDepartmentById(departmentId);
  return row ? row.name : (Number(departmentId) === DEPT_RD ? '演示研发部' : '演示运维部');
}

/** Overlay persisted name/department onto a seed row (always clones). */
function applyEquipmentMeta(item) {
  const base = clone(item);
  const patch = readJsonMap(EQUIPMENT_META_KEY)[String(item.id)];
  if (patch && typeof patch === 'object') {
    if (patch.name != null && String(patch.name).trim() !== '') {
      base.name = String(patch.name).trim().slice(0, 50);
    }
    if (patch.departmentId != null && Number.isFinite(Number(patch.departmentId))) {
      base.departmentId = Number(patch.departmentId);
    }
  }
  // Always resolve live department name from shared pool (rename sync); ignore stale patch.departmentName.
  base.departmentName = departmentNameOf(base.departmentId);
  return base;
}

/** True when any live hardware row still references the department. */
export function hasActiveEquipmentInDepartment(departmentId) {
  const key = Number(departmentId);
  if (!Number.isFinite(key)) return false;
  return DEMO_EQUIPMENTS.map(applyEquipmentMeta).some(item => Number(item.departmentId) === key);
}

function hasKeyword(item, keyword) {
  if (keyword == null || keyword === '') return true;
  const q = String(keyword).trim().toLowerCase();
  if (!q) return true;
  return [item.name, item.no, item.departmentName, item.gatewayName]
    .some(field => String(field || '').toLowerCase().includes(q));
}

function matchDepartment(item, departmentId) {
  if (departmentId == null || departmentId === '' || departmentId === '0' || departmentId === 0) return true;
  return Number(item.departmentId) === Number(departmentId);
}

function matchDeviceType(item, deviceType) {
  const code = Number(deviceType);
  if (!code) return true;
  return Number(item.deviceType) === code;
}

function matchEquipmentType(item, equipmentType) {
  if (equipmentType == null || equipmentType === '' || equipmentType === 'null') return true;
  return Number(item.equipmentTypeCode) === Number(equipmentType);
}

function applyScope(list, body) {
  return list.filter(item =>
    hasKeyword(item, body.keyword) && matchDepartment(item, body.departmentId)
  );
}

function buildTypeSorts(list) {
  const typeSorts = SENSOR_TYPE_META.map(meta => ({
    code: meta.code,
    name: meta.name,
    count: meta.code === 0 ? list.length : list.filter(item => Number(item.deviceType) === meta.code).length
  }));
  return typeSorts;
}

function buildEquipmentSortCount(list) {
  return EQUIPMENT_TYPE_META.map(meta => ({
    type: meta.type,
    name: meta.name,
    count: list.filter(item => Number(item.equipmentTypeCode) === meta.type).length
  }));
}

function sortList(list, sortName) {
  const sort = sortName && typeof sortName === 'object' ? sortName : {};
  const entry = Object.entries(sort).find(([, order]) => order === 'asc' || order === 'desc');
  if (!entry) return list;
  const [field, order] = entry;
  const keyMap = {name: 'name', num: 'no', department: 'departmentName', createTime: 'createDate'};
  const prop = keyMap[field];
  if (!prop) return list;
  const factor = order === 'asc' ? 1 : -1;
  return list.slice().sort((a, b) => {
    const left = a[prop] == null ? '' : String(a[prop]);
    const right = b[prop] == null ? '' : String(b[prop]);
    return left.localeCompare(right, 'zh') * factor;
  });
}

/**
 * HardwareHome / Device shared list contract.
 * Facets: typeSorts ignore deviceType filter; equipmentSortCount ignore equipmentType filter.
 * List + deviceCount + total apply all filters.
 */
export function listEquipmentSort(body = {}) {
  const pageNum = Math.max(1, Number(body.pageNum) || 1);
  const pageSize = Math.max(1, Number(body.pageSize) || 10);
  const universe = DEMO_EQUIPMENTS.map(applyEquipmentMeta);
  const scope = applyScope(universe, body);

  const forTypeSorts = scope.filter(item => matchEquipmentType(item, body.equipmentType));
  const forEquipmentSort = scope.filter(item => matchDeviceType(item, body.deviceType));
  const filtered = scope
    .filter(item => matchDeviceType(item, body.deviceType))
    .filter(item => matchEquipmentType(item, body.equipmentType));
  const sorted = sortList(filtered, body.sortName);
  const start = (pageNum - 1) * pageSize;

  return {
    list: sorted.slice(start, start + pageSize).map(clone),
    total: sorted.length,
    pageNum,
    pageSize,
    deviceSortCount: {
      typeSorts: buildTypeSorts(forTypeSorts),
      deviceCount: sorted.length
    },
    equipmentSortCount: buildEquipmentSortCount(forEquipmentSort)
  };
}

/** Dashboard disc: same equipment universe; alarm = status -1 only (not offline). */
export function getEquipmentDashboardOverview() {
  const total = DEMO_EQUIPMENTS.length;
  const alarmCount = DEMO_EQUIPMENTS.filter(item => Number(item.status) === -1).length;
  return {total, alarmCount};
}

/** 1B+: DeviceDrawerNew / AlerterDrawer / PowerDrawerNew / SignalSourceDrawer */
export const DEMO_EQUIPMENT_DETAIL_CODES = Object.freeze([0, 10, 7, 8, 14, 13, 16]);

/** 写操作（间隔/阈值/部门/负责人/绑定）仅记录仪与设备管理器。声光/断电/信号只读。 */
export const DEMO_EQUIPMENT_WRITE_CODES = Object.freeze([0, 10]);

export function equipmentById(id) {
  const key = id == null || id === '' ? NaN : Number(id);
  if (Number.isNaN(key)) return null;
  const seed = DEMO_EQUIPMENTS.find(item => item.id === key);
  return seed ? applyEquipmentMeta(seed) : null;
}

export function supportsEquipmentDetail(row) {
  if (!row || !row.openTwoSystem) return false;
  return DEMO_EQUIPMENT_DETAIL_CODES.includes(Number(row.equipmentTypeCode));
}

export function supportsEquipmentWrite(row) {
  if (!row || !row.openTwoSystem) return false;
  return DEMO_EQUIPMENT_WRITE_CODES.includes(Number(row.equipmentTypeCode));
}

function probeId(equipmentId) {
  return Number(equipmentId) * 10 + 1;
}

/** Shared thresholds — align HardwareState min/max with alarm samples. */
export const EQUIPMENT_THRESHOLDS = Object.freeze({
  1: {min: 0, max: 30, unit: '℃'},
  2: {min: 0, max: 30, unit: '℃'},
  3: {min: 0, max: 1, unit: ''},
  4: {min: 0, max: 1000, unit: 'ppm'},
  5: {min: 0, max: 10, unit: 'Pa'},
  6: {min: 18, max: 23, unit: '%'},
  7: {min: 90, max: 110, unit: 'kPa'},
  8: {min: 0, max: 1, unit: ''}
});

function thresholdsFor(deviceType) {
  return EQUIPMENT_THRESHOLDS[deviceType] || {min: 0, max: 100, unit: ''};
}

function isDiscreteDeviceType(deviceType) {
  return Number(deviceType) === 3 || Number(deviceType) === 8;
}

function sensorReading(entity) {
  const sensor = (entity.sensors && entity.sensors[0]) || {};
  const meta = SENSOR_TYPE_META.find(item => item.code === entity.deviceType) || SENSOR_TYPE_META[1];
  const thr = resolveThresholds(entity);
  const offline = Number(entity.status) === -100;
  return {
    sensorId: entity.deviceType === 3 ? 26 : (entity.deviceType === 8 ? 17 : entity.deviceType),
    objSensorId: probeId(entity.id),
    sensorAlias: meta.name,
    unit: thr.unit != null ? thr.unit : (meta.unit || ''),
    monitorSensorVal: offline ? '' : String(sensor.value != null ? sensor.value : ''),
    monitorSensorTime: offline ? '' : entity.reportDate,
    signalSwitchStatus: 0,
    monitorSensorCatId: entity.deviceType || 1,
    // MonitorInfo / flag cards
    normalMin: thr.min,
    normalMax: thr.max,
    // HardwareState cards read min/max (not normalMin/Max)
    min: thr.min,
    max: thr.max,
    status: sensor.status != null ? sensor.status : entity.status
  };
}

const EQUIPMENT_SETTINGS_KEY = 'equipmentSettings';
const DEFAULT_ALARM_INTERVAL = 5;
const DEFAULT_REPORTING_INTERVAL = 10;

function readEquipmentSettings() {
  try {
    const raw = storage.getItem(EQUIPMENT_SETTINGS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (_) {
    return {};
  }
}

function writeEquipmentSettings(map) {
  storage.setItem(EQUIPMENT_SETTINGS_KEY, JSON.stringify(map));
}

function settingsFor(deviceId) {
  return readEquipmentSettings()[String(deviceId)] || {};
}

function resolveThresholds(entity) {
  const base = thresholdsFor(entity.deviceType);
  const patch = settingsFor(entity.id);
  const sensorPatch = Array.isArray(patch.sensors) && patch.sensors.length ? patch.sensors[0] : null;
  if (!sensorPatch) return base;
  const min = Number(sensorPatch.min);
  const max = Number(sensorPatch.max);
  return {
    min: Number.isFinite(min) ? min : base.min,
    max: Number.isFinite(max) ? max : base.max,
    unit: base.unit
  };
}

/**
 * GET /device/detail?deviceId= — DeviceDrawerNew detail contract (not instrument/detail).
 */
export function getEquipmentDetail(deviceId) {
  const entity = equipmentById(deviceId);
  if (!entity || !supportsEquipmentDetail(entity)) return null;
  const base = clone(entity);
  const thr = resolveThresholds(entity);
  const patch = settingsFor(entity.id);
  const sensorPatches = Array.isArray(patch.sensors) ? patch.sensors : [];
  const sensors = (base.sensors || []).map((sensor, index) => {
    const sp = sensorPatches.find(item => Number(item.idx) === Number(sensor.idx != null ? sensor.idx : index))
      || sensorPatches[index]
      || null;
    const min = sp && Number.isFinite(Number(sp.min)) ? Number(sp.min) : thr.min;
    const max = sp && Number.isFinite(Number(sp.max)) ? Number(sp.max) : thr.max;
    return {
      ...sensor,
      idx: sensor.idx != null ? sensor.idx : index,
      switchOff: sp ? !!sp.switchOff : !!sensor.switchOff,
      warningMin: sp && Number.isFinite(Number(sp.warningMin)) ? Number(sp.warningMin) : (Number(sensor.warningMin) || 0),
      warningMax: sp && Number.isFinite(Number(sp.warningMax)) ? Number(sp.warningMax) : (Number(sensor.warningMax) || 0),
      min,
      max,
      sensorType: {
        ...(sensor.sensorType || {}),
        unit: thr.unit != null ? thr.unit : ((sensor.sensorType && sensor.sensorType.unit) || '')
      }
    };
  });
  // dBm for signalStateFilter(-82,-72): normal ~-70 strong, offline very weak
  const signalStrength = Number(entity.status) === -100 ? -95 : -70;
  const code = Number(entity.equipmentTypeCode);
  const status = Number(entity.status);
  const detail = {
    ...base,
    sensors,
    alarmInterval: patch.alarmInterval != null ? Number(patch.alarmInterval) : DEFAULT_ALARM_INTERVAL,
    reportingInterval: patch.reportingInterval != null ? Number(patch.reportingInterval) : DEFAULT_REPORTING_INTERVAL,
    signalStrength,
    closeSoundLightAlarm: 0,
    closeSystemAlarm: 0,
    wifiFlag: code === 10 || code === 8 || code === 16,
    standPower: code === 10 ? 12 : 0,
    useStatus: 0
  };
  if (code === 8) {
    // 1 = 有电/正常供电展示；离线或告警视为断电态 0
    detail.powerFailure = (status === -100 || status === -1) ? 0 : 1;
  }
  if (code === 7) {
    detail.defenceAlarmStatus = status === -1 ? 0 : 1;
    detail.powerFailure = 1;
    detail.statusStr = status === -100 ? '离线' : (status === -1 ? '异常' : (status === 0 ? '未激活' : '正常'));
  }
  if (code === 14) {
    detail.runStatus = status === 0 ? 0 : 1;
    detail.statusStr = status === -100 ? '离线' : (status === -1 ? '异常' : (status === 0 ? '未激活' : '正常'));
    detail.sensors = sensors.map(sensor => ({
      ...sensor,
      deviceId: entity.id,
      productId: 14,
      min: thr.min,
      max: thr.max,
      sensorType: {
        ...(sensor.sensorType || {}),
        sensorAlias: (sensor.sensorType && (sensor.sensorType.sensorAlias || sensor.sensorType.name)) || '',
        unit: thr.unit != null ? thr.unit : ((sensor.sensorType && sensor.sensorType.unit) || '')
      }
    }));
  }
  if (code === 13) {
    detail.roomName = entity.departmentId === DEPT_RD ? '演示房间 B' : '演示房间 A';
    detail.remark = '演示移液枪架（只读）';
    detail.companyName = '演示科技有限公司';
    detail.closeSoundLightAlarm = 0;
  }
  if (code === 16) {
    detail.roomName = entity.departmentId === DEPT_RD ? '演示房间 B' : '演示房间 A';
    detail.remark = '演示资产网关（只读）';
    detail.companyName = '演示科技有限公司';
    detail.propertyNum = entity.id === 980025 ? 3 : (status === -100 ? 0 : 2);
  }
  return detail;
}

/** GET /alertor/obtain/beepTime — AlerterDrawer beep duration (seconds). */
export function getAlertorBeepTime(equipmentId) {
  const entity = equipmentById(equipmentId);
  if (!entity || Number(entity.equipmentTypeCode) !== 7) return null;
  return 30;
}

/** GET /monitorIndicator/getDeviceSingleMonitorFlag — MonitorInfo tabs (type=1 uses objSensorId). */
export function getEquipmentSingleMonitorFlag(equipmentId) {
  const entity = equipmentById(equipmentId);
  if (!entity || !supportsEquipmentDetail(entity)) return null;
  if (!entity.sensors.length) return [];
  const reading = sensorReading(entity);
  return [reading];
}

/** GET /monitorIndicator/getDeviceMonitorFlag — vuex deviceSensorsFlag for HistoryAlarmRecord. */
export function getEquipmentDeviceMonitorFlag(equipmentId) {
  const entity = equipmentById(equipmentId);
  if (!entity || !supportsEquipmentDetail(entity)) return null;
  if (!entity.sensors.length) return [];
  const reading = sensorReading(entity);
  return [{
    idx: 0,
    monitorSensorId: reading.sensorId,
    objSensorIds: [reading.objSensorId],
    monitorSensorCatId: reading.monitorSensorCatId,
    sensorAlias: reading.sensorAlias,
    unit: reading.unit
  }];
}

/**
 * GET /monitorIndicator/monitorInfo with type=1 (hardware).
 * Reuses series shape of instrument charts; offline → [].
 */
export function getEquipmentMonitorInfo(params) {
  if (!params || Number(params.type) !== 1) return null;
  const entity = equipmentById(params.objId);
  if (!entity || !supportsEquipmentDetail(entity)) return null;
  const sensorId = Number(params.objSensorId);
  const reading = sensorReading(entity);
  if (sensorId !== reading.objSensorId) return null;

  const hasBegin = params.beginTime != null && String(params.beginTime).trim() !== '';
  const hasEnd = params.endTime != null && String(params.endTime).trim() !== '';
  let begin;
  let end;
  if (hasBegin || hasEnd) {
    if (!hasBegin || !hasEnd) return null;
    begin = parseDemoDateTime(params.beginTime);
    end = parseDemoDateTime(params.endTime);
    if (!Number.isFinite(begin) || !Number.isFinite(end) || end <= begin) return null;
  } else {
    const interval = Number(params.interval);
    const days = interval === 5 ? 7 : interval === 6 ? 30 : interval === 7 ? 90 : 1;
    begin = DEMO_NOW_MS - days * 86400000;
    end = DEMO_NOW_MS;
  }
  if (Number(entity.status) === -100) return [];

  const hintMin = Number(params.historyTimeInterval) > 0 ? Number(params.historyTimeInterval) : 5;
  let step = hintMin * 60 * 1000;
  const maxPoints = 48;
  if ((end - begin) / step > maxPoints) step = Math.ceil((end - begin) / maxPoints / 60000) * 60000;

  const parsed = Number(String(reading.monitorSensorVal).replace(/[^\d.-]/g, ''));
  const discrete = isDiscreteDeviceType(entity.deviceType);
  const base = Number.isFinite(parsed) ? parsed : (discrete ? 0 : 20);
  const alarm = Number(entity.status) === -1;
  const rows = [];
  let index = 0;
  for (let t = begin; t <= end; t += step) {
    let data;
    if (discrete) {
      // Water immersion etc.: only 0/1, never float wobble; keep legal 0.
      data = alarm ? (index % 3 === 0 ? 1 : 0) : (Number(base) ? 1 : 0);
    } else {
      const wobble = ((index % 6) - 2) * (alarm ? 1.5 : 0.3);
      data = Number((base + wobble).toFixed(1));
    }
    rows.push({
      id: index + 1,
      createDate: formatDemoDateTime(t),
      data
    });
    index += 1;
    if (index >= 96) break;
  }
  return rows;
}

const DEMO_EQUIPMENT_ALARMS = Object.freeze([
  {
    id: 981001,
    equipmentId: 980002,
    objSensorId: probeId(980002),
    kind: 'threshold',
    objType: 4,
    objName: '演示温湿度记录仪 B',
    equipmentName: '演示温湿度记录仪 B',
    monitorSensorVal: '38.2',
    monitorNormalMin: 0,
    monitorNormalMax: 30,
    alarmRange: '0 ~ 30',
    alarmStartTime: '2026-09-22 10:00:00',
    // AlarmProcessing.open reads row.time
    time: '2026-09-22 10:00:00',
    monitorAlarmEndTime: '2026-09-22 10:25:00',
    alarmFlag: true,
    durationFormat: '25 分钟',
    monitorAlarmEndVal: '36.1',
    process: false,
    status: 0
  },
  {
    id: 981002,
    equipmentId: 980007,
    objSensorId: probeId(980007),
    kind: 'threshold',
    objType: 4,
    objName: '演示压差记录仪',
    equipmentName: '演示压差记录仪',
    monitorSensorVal: '12.5',
    monitorNormalMin: 0,
    monitorNormalMax: 10,
    alarmRange: '0 ~ 10',
    alarmStartTime: '2026-09-20 15:30:00',
    time: '2026-09-20 15:30:00',
    monitorAlarmEndTime: '2026-09-20 15:42:00',
    alarmFlag: true,
    durationFormat: '12 分钟',
    monitorAlarmEndVal: '11.2',
    process: true,
    status: 1,
    errorCauseTime: '2026-09-20 16:00:00',
    errorCauseMsg: '演示环境波动已恢复',
    errorCauseTypeFormat: 3,
    errorCauseMethod: '演示现场确认'
  }
]);

const DEMO_EQUIPMENT_OFFLINE_ALARMS = Object.freeze([
  {
    id: 982001,
    equipmentId: 980004,
    kind: 'offline',
    objType: 1,
    objName: '演示温度记录仪 B',
    equipmentName: '演示温度记录仪 B',
    monitorSensorVal: '',
    monitorNormalMin: undefined,
    monitorNormalMax: undefined,
    alarmStartTime: '2026-09-23 08:00:00',
    monitorAlarmEndTime: '',
    alarmFlag: false,
    durationFormat: '离线',
    monitorAlarmEndVal: '',
    process: false,
    status: -100
  },
  {
    id: 982002,
    equipmentId: 980011,
    kind: 'offline',
    objType: 1,
    objName: '演示设备管理器 B',
    equipmentName: '演示设备管理器 B',
    monitorSensorVal: '',
    alarmStartTime: '2026-09-22 18:00:00',
    monitorAlarmEndTime: '',
    alarmFlag: false,
    durationFormat: '离线',
    monitorAlarmEndVal: '',
    process: false,
    status: -100
  }
]);

/**
 * Statistics 4A — all hardware historical alarms with handle overlay.
 * kind: threshold | offline；已处理看 process / status===1。
 */
export function listEquipmentAlarmEventsForStatistics() {
  return DEMO_EQUIPMENT_ALARMS.concat(DEMO_EQUIPMENT_OFFLINE_ALARMS).map(item => {
    const merged = applyEquipmentAlarmHandle(item);
    return {
      id: merged.id,
      equipmentId: merged.equipmentId,
      equipmentName: merged.equipmentName,
      kind: merged.kind,
      typeName: merged.kind === 'offline' ? '离线' : '阈值',
      at: merged.alarmStartTime || merged.time,
      process: !!merged.process,
      status: Number(merged.status)
    };
  });
}

/**
 * POST /monitorIndicator/historyAlarmRecord — hardware drawer alarm table (type=1).
 * objSensorIds → threshold events; objId without sensor ids → offline events only.
 */
export function listEquipmentHistoryAlarms(body = {}) {
  const pageNum = Math.max(1, Number(body.pageNum) || 1);
  const pageSize = Math.max(1, Number(body.pageSize) || 10);
  const sensorIds = Array.isArray(body.objSensorIds)
    ? body.objSensorIds.map(Number).filter(n => !Number.isNaN(n))
    : (body.objSensorIds != null && body.objSensorIds !== '' ? [Number(body.objSensorIds)].filter(n => !Number.isNaN(n)) : []);
  const objId = body.objId != null && body.objId !== '' ? Number(body.objId) : null;
  const offlineTab = sensorIds.length === 0 && objId != null && !Number.isNaN(objId);

  let events;
  if (offlineTab) {
    events = DEMO_EQUIPMENT_OFFLINE_ALARMS.filter(item => Number(item.equipmentId) === objId);
  } else if (sensorIds.length) {
    events = DEMO_EQUIPMENT_ALARMS.filter(item => sensorIds.includes(Number(item.objSensorId)));
  } else {
    events = [];
  }

  const merged = events.map(applyEquipmentAlarmHandle);
  const start = (pageNum - 1) * pageSize;
  return {
    list: merged.slice(start, start + pageSize).map(clone),
    total: merged.length,
    pageNum,
    pageSize
  };
}

const EQUIPMENT_ALARM_HANDLE_KEY = 'equipmentAlarmHandles';
const ALLOWED_EQUIPMENT_ERROR_TYPES = new Set([1, 2, 3]);

function handleKey(objSensorId, time) {
  return String(objSensorId) + '|' + String(time || '');
}

function readEquipmentAlarmHandles() {
  try {
    const raw = storage.getItem(EQUIPMENT_ALARM_HANDLE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (_) {
    return {};
  }
}

function writeEquipmentAlarmHandles(map) {
  storage.setItem(EQUIPMENT_ALARM_HANDLE_KEY, JSON.stringify(map));
}

function applyEquipmentAlarmHandle(record) {
  const key = handleKey(record.objSensorId, record.time || record.alarmStartTime);
  const patch = readEquipmentAlarmHandles()[key];
  if (!patch || patch.process !== true) return {...record};
  return {
    ...record,
    process: true,
    status: 1,
    errorCauseTime: patch.processDate,
    errorCauseMsg: patch.errorCauseMsg || '',
    errorCauseTypeFormat: patch.errorCauseType,
    errorCauseMethod: patch.errorCauseMethod || ''
  };
}

/**
 * POST /monitorIndicator/exceptionHandle — AlarmProcessing (HistoryAlarmRecord type=1).
 * Matches seed by objSensorId + time (form does not send alarm id). Offline events rejected.
 */
export function handleEquipmentException(body = {}) {
  const objSensorId = Number(body.objSensorId);
  const time = body.time != null ? String(body.time) : '';
  if (!Number.isFinite(objSensorId) || !time) {
    return {ok: false, message: '报警记录定位参数无效。'};
  }
  const seed = DEMO_EQUIPMENT_ALARMS.find(item =>
    Number(item.objSensorId) === objSensorId && String(item.time || item.alarmStartTime) === time
  );
  if (!seed) {
    return {ok: false, message: '未找到可处理的阈值告警记录。'};
  }
  if (seed.kind === 'offline') {
    return {ok: false, message: '离线告警不可在此处理。'};
  }
  const errorCauseType = Number(body.errorType);
  if (!ALLOWED_EQUIPMENT_ERROR_TYPES.has(errorCauseType)) {
    return {ok: false, message: '请选择有效的报警类型。'};
  }
  if (!Number.isFinite(parseDemoDateTime(body.processDate))) {
    return {ok: false, message: '请填写有效的处理时间。'};
  }
  for (const key of ['errorCauseMethod', 'errorCauseMsg']) {
    if (body[key] != null && typeof body[key] !== 'string') {
      return {ok: false, message: '处理信息格式无效。'};
    }
  }
  const key = handleKey(objSensorId, time);
  const next = {...readEquipmentAlarmHandles()};
  next[key] = {
    process: true,
    errorCauseType,
    processDate: String(body.processDate),
    errorCauseMethod: String(body.errorCauseMethod == null ? '' : body.errorCauseMethod).slice(0, 30),
    errorCauseMsg: String(body.errorCauseMsg == null ? '' : body.errorCauseMsg).slice(0, 30),
    userName: String(body.userName == null ? 'demo' : body.userName).slice(0, 50)
  };
  writeEquipmentAlarmHandles(next);
  return {ok: true, key};
}

export function resetEquipmentAlarmHandles() {
  storage.removeItem(EQUIPMENT_ALARM_HANDLE_KEY);
}

function assertWritableEquipment(deviceId) {
  const entity = equipmentById(deviceId);
  if (!entity || !supportsEquipmentWrite(entity)) {
    return {ok: false, message: '演示硬件不存在或本阶段未开放该类型设置。'};
  }
  return {ok: true, entity};
}

function isPositiveInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1;
}

/** POST /device/update/interval/report */
export function updateEquipmentReportingInterval(body = {}) {
  const id = Number(body.id);
  const gate = assertWritableEquipment(id);
  if (!gate.ok) return gate;
  if (!isPositiveInt(body.reportingInterval)) {
    return {ok: false, message: '汇报间隔须为正整数分钟。'};
  }
  const reportingInterval = Number(body.reportingInterval);
  const next = {...readEquipmentSettings()};
  next[String(id)] = {...(next[String(id)] || {}), reportingInterval};
  writeEquipmentSettings(next);
  return {ok: true, reportingInterval};
}

/** POST /device/update/interval/alarm */
export function updateEquipmentAlarmInterval(body = {}) {
  const id = Number(body.id);
  const gate = assertWritableEquipment(id);
  if (!gate.ok) return gate;
  if (!isPositiveInt(body.alarmInterval)) {
    return {ok: false, message: '报警间隔须为正整数分钟。'};
  }
  const alarmInterval = Number(body.alarmInterval);
  const next = {...readEquipmentSettings()};
  next[String(id)] = {...(next[String(id)] || {}), alarmInterval};
  writeEquipmentSettings(next);
  return {ok: true, alarmInterval};
}

/** POST /device/update/sensors — UpdateAlarmRules single-device submit. */
export function updateEquipmentSensors(body = {}) {
  const id = Number(body.id);
  const gate = assertWritableEquipment(id);
  if (!gate.ok) return gate;
  const sensors = Array.isArray(body.sensors) ? body.sensors : [];
  if (!sensors.length) return {ok: false, message: '传感器参数无效。'};
  const normalized = [];
  const seen = new Set();
  const validNumber = value => (typeof value === 'number' || typeof value === 'string')
    && String(value).trim() !== '' && Number.isFinite(Number(value));
  for (const item of sensors) {
    if (!item || !validNumber(item.idx) || !validNumber(item.type)
      || seen.has(Number(item.idx))
      || !gate.entity.sensors.some(sensor => sensor.idx === Number(item.idx) && sensor.type === Number(item.type))) {
      return {ok: false, message: '探头编号或类型无效，或存在重复探头。'};
    }
    seen.add(Number(item.idx));
    const min = Number(item.min);
    const max = Number(item.max);
    if (!validNumber(item.min) || !validNumber(item.max)) {
      return {ok: false, message: '请填写有效的报警范围。'};
    }
    if (min > max) return {ok: false, message: '报警范围下限不能大于上限。'};
    const switchOff = !!item.switchOff;
    let warningMin = Number(item.warningMin);
    let warningMax = Number(item.warningMax);
    if (switchOff) {
      if (!validNumber(item.warningMin) || !validNumber(item.warningMax) || warningMin > warningMax) {
        return {ok: false, message: '请填写有效的预警范围。'};
      }
    } else {
      warningMin = 0;
      warningMax = 0;
    }
    normalized.push({
      idx: Number.isFinite(Number(item.idx)) ? Number(item.idx) : 0,
      type: Number(item.type),
      min,
      max,
      switchOff,
      warningMin,
      warningMax
    });
  }
  const next = {...readEquipmentSettings()};
  next[String(id)] = {...(next[String(id)] || {}), sensors: normalized};
  writeEquipmentSettings(next);
  return {ok: true, count: normalized.length};
}

export function resetEquipmentSettings() {
  storage.removeItem(EQUIPMENT_SETTINGS_KEY);
}

/** POST /device/update/basic — UpdateDepartment (name + department). */
export function updateEquipmentBasic(body = {}) {
  const id = Number(body.id);
  const gate = assertWritableEquipment(id);
  if (!gate.ok) return gate;
  const name = String(body.name == null ? '' : body.name).trim();
  if (!name) return {ok: false, message: '请填写设备名称。'};
  if (name.length > 50) return {ok: false, message: '设备名称过长。'};
  const departmentId = Number(body.departmentId);
  if (!isActiveDepartment(departmentId)) {
    return {ok: false, message: '请选择有效部门。'};
  }
  const next = {...readJsonMap(EQUIPMENT_META_KEY)};
  next[String(id)] = {
    name,
    departmentId,
    departmentName: departmentNameOf(departmentId)
  };
  writeJsonMap(EQUIPMENT_META_KEY, next);
  return {ok: true, name, departmentId};
}

/**
 * GET /equipmentUser/list
 */
export function listEquipmentUsers(params = {}) {
  const equipmentId = Number(params.equipmentId);
  const pageNum = Math.max(1, Number(params.pageNum) || 1);
  const pageSize = Math.max(1, Number(params.pageSize) || 10);
  if (!Number.isFinite(equipmentId)) {
    return {list: [], total: 0, pageNum, pageSize};
  }
  const bucket = readJsonMap(EQUIPMENT_USERS_KEY)[String(equipmentId)];
  const all = Array.isArray(bucket) ? bucket : [];
  const start = (pageNum - 1) * pageSize;
  return {
    list: all.slice(start, start + pageSize).map(clone),
    total: all.length,
    pageNum,
    pageSize
  };
}

/** POST /equipmentUser/add — SetPrincipal for DEVICE. */
export function addEquipmentUsers(body = {}) {
  const equipmentIds = Array.isArray(body.equipmentIds)
    ? body.equipmentIds.map(Number).filter(n => Number.isFinite(n))
    : [];
  const userIds = Array.isArray(body.userIds)
    ? body.userIds.map(Number).filter(n => Number.isFinite(n))
    : [];
  if (!equipmentIds.length) return {ok: false, message: '设备编号无效。'};
  if (!userIds.length) return {ok: false, message: '请选择负责人。'};
  for (const equipmentId of equipmentIds) {
    const gate = assertWritableEquipment(equipmentId);
    if (!gate.ok) return gate;
  }
  const staffMap = {};
  listAllStaff().forEach(u => { staffMap[u.id] = u; });
  if (userIds.some(id => !staffMap[id])) {
    return {ok: false, message: '存在未知用户，已拒绝添加。'};
  }
  const weixin = Number(body.weixin) === 0 ? 0 : -1;
  const sms = Number(body.sms) === 0 ? 0 : -1;
  const phone = Number(body.phone) === 0 ? 0 : -1;
  const timeFlag = body.timeFlag == null ? 1 : Number(body.timeFlag);
  const store = {...readJsonMap(EQUIPMENT_USERS_KEY)};
  let added = 0;
  for (const equipmentId of equipmentIds) {
    const key = String(equipmentId);
    const current = Array.isArray(store[key]) ? store[key].slice() : [];
    const existing = new Set(current.map(row => Number(row.userId)));
    for (const userId of userIds) {
      if (existing.has(userId)) continue;
      const staff = staffMap[userId];
      current.push({
        id: Number(String(equipmentId) + String(userId)),
        equipmentId,
        userId,
        userName: staff.name,
        tel: '',
        weixin,
        sms,
        phone,
        timeFrom: '00:00:00',
        timeTo: '23:59:59',
        timeFlag: Number.isFinite(timeFlag) ? timeFlag : 1,
        type: body.type || 'DEVICE'
      });
      existing.add(userId);
      added += 1;
    }
    store[key] = current;
  }
  if (!added) return {ok: false, message: '所选用户已是负责人。'};
  writeJsonMap(EQUIPMENT_USERS_KEY, store);
  return {ok: true, count: added};
}

/** POST /equipmentUser/remove */
export function removeEquipmentUserRecord(body = {}) {
  const equipmentId = Number(body.equipmentId);
  const userId = Number(body.userId);
  const gate = assertWritableEquipment(equipmentId);
  if (!gate.ok) return gate;
  if (!Number.isFinite(userId)) return {ok: false, message: '用户编号无效。'};
  const store = {...readJsonMap(EQUIPMENT_USERS_KEY)};
  const key = String(equipmentId);
  const current = Array.isArray(store[key]) ? store[key] : [];
  const next = current.filter(row => Number(row.userId) !== userId);
  if (next.length === current.length) return {ok: false, message: '未找到该负责人。'};
  store[key] = next;
  writeJsonMap(EQUIPMENT_USERS_KEY, store);
  return {ok: true};
}

export function resetEquipmentMetaAndUsers() {
  storage.removeItem(EQUIPMENT_META_KEY);
  storage.removeItem(EQUIPMENT_USERS_KEY);
}

export function emptyEquipmentUserPage() {
  return {list: [], total: 0, pageNum: 1, pageSize: 10};
}

export function emptyUseStatusPage() {
  return {list: [], total: 0, pageNum: 1, pageSize: 10};
}

const EQUIPMENT_BINDINGS_KEY = 'equipmentBindings';

/** Seed: 设备管理器 A → 房间 A；温湿度记录仪 C → 房间 B. */
const DEMO_SEED_EQUIPMENT_BINDINGS = Object.freeze({
  '980010': [{id: 950001, name: '演示房间 A', type: 11, openTwoSystem: true}],
  '980018': [{id: 950003, name: '演示房间 B', type: 11, openTwoSystem: true}]
});

const BINDABLE_ROOMS = Object.freeze(Object.values(DEMO_FLOOR_ROOMS).flat()
  .map(({id, name}) => ({id, name, type: 11, openTwoSystem: true})));

function readEquipmentBindingsStore() {
  // Cold demo: never-written key exposes seed room binds (980010/980018 — not 980001,
  // so hardware bind unit tests that expect 980001 empty stay valid).
  if (storage.getItem(EQUIPMENT_BINDINGS_KEY) == null) {
    return JSON.parse(JSON.stringify(DEMO_SEED_EQUIPMENT_BINDINGS));
  }
  return readJsonMap(EQUIPMENT_BINDINGS_KEY);
}

function writeEquipmentBindingsStore(map) {
  writeJsonMap(EQUIPMENT_BINDINGS_KEY, map);
}

function bindingsFor(equipmentId) {
  const bucket = readEquipmentBindingsStore()[String(equipmentId)];
  return Array.isArray(bucket) ? bucket.map(clone) : [];
}

function catalogThing(type, thingsId) {
  const list = Number(type) === 11 ? BINDABLE_ROOMS : listBindableCatalog('instrument');
  return list.find(item => Number(item.id) === Number(thingsId)) || null;
}

/** Demo picker options for DeviceBindRelationship. */
export function listBindableCatalog(kind) {
  if (kind === 'room') return BINDABLE_ROOMS.map(clone);
  if (kind === 'instrument') {
    return listActiveInstrumentSeeds()
      .map(seed => {
        const entity = resolveInstrumentEntity(seed);
        if (!entity) return null;
        return {id: entity.id, name: entity.name, type: 4, openTwoSystem: true};
      })
      .filter(Boolean);
  }
  return BINDABLE_ROOMS.map(clone).concat(listBindableCatalog('instrument'));
}

/**
 * POST /device/binding?equipmentIdStr=
 * Returns bound rooms (type=11) / instruments (type=4).
 */
export function listEquipmentBindings(params = {}) {
  const raw = params.equipmentIdStr != null ? params.equipmentIdStr : params.equipmentId;
  const equipmentId = Number(raw);
  if (!Number.isFinite(equipmentId)) return [];
  return bindingsFor(equipmentId).map(item => catalogThing(item.type, item.id)).filter(Boolean).map(clone);
}

/**
 * Instrument list objType filter: equipmentTypeCodes currently bound to this instrument.
 */
export function listBoundEquipmentTypesForInstrument(instrumentId) {
  const key = Number(instrumentId);
  if (!Number.isFinite(key)) return [];
  const codes = new Set();
  const store = readEquipmentBindingsStore();
  for (const [equipmentId, bucket] of Object.entries(store)) {
    if (!Array.isArray(bucket) || !bucket.some(item => Number(item.type) === 4 && Number(item.id) === key)) continue;
    const row = equipmentById(equipmentId);
    if (row && row.equipmentTypeCode != null) codes.add(Number(row.equipmentTypeCode));
  }
  return [...codes];
}

/**
 * Reverse lookup: hardware currently bound to this room (type:11 in equipmentBindings).
 */
export function listBoundEquipmentForRoom(roomId) {
  const key = Number(roomId);
  if (!Number.isFinite(key)) return [];
  const rows = [];
  const store = readEquipmentBindingsStore();
  for (const [equipmentId, bucket] of Object.entries(store)) {
    if (!Array.isArray(bucket) || !bucket.some(item => Number(item.type) === 11 && Number(item.id) === key)) continue;
    const eq = equipmentById(equipmentId);
    if (!eq) continue;
    rows.push({
      id: eq.id,
      equipmentId: eq.id,
      equipmentName: eq.name,
      equipmentNo: eq.no,
      equipmentTypeCode: eq.equipmentTypeCode
    });
  }
  return rows.sort((a, b) => Number(a.id) - Number(b.id));
}

/**
 * GET /monitorIndicator/things/newList — BindHardwareTable (objType 3=room, 2=instrument).
 */
export function listMonitorIndicatorThingsNewList(params = {}) {
  const pageNum = Math.max(1, Number(params.pageNum) || 1);
  const pageSize = Math.max(1, Number(params.pageSize) || 10);
  const objType = Number(params.objType);
  const objId = Number(params.objId);
  let rows = [];
  if (objType === 3 && Number.isFinite(objId)) {
    rows = listBoundEquipmentForRoom(objId);
  } else if (objType === 2 && Number.isFinite(objId)) {
    const store = readEquipmentBindingsStore();
    for (const [equipmentId, bucket] of Object.entries(store)) {
      if (!Array.isArray(bucket) || !bucket.some(item => Number(item.type) === 4 && Number(item.id) === objId)) continue;
      const eq = equipmentById(equipmentId);
      if (!eq) continue;
      rows.push({
        id: eq.id,
        equipmentId: eq.id,
        equipmentName: eq.name,
        equipmentNo: eq.no,
        equipmentTypeCode: eq.equipmentTypeCode
      });
    }
    rows.sort((a, b) => Number(a.id) - Number(b.id));
  }
  const start = (pageNum - 1) * pageSize;
  return {
    list: rows.slice(start, start + pageSize),
    total: rows.length,
    pageNum,
    pageSize
  };
}

function pushBinding(equipmentId, thing) {
  const store = {...readEquipmentBindingsStore()};
  const key = String(equipmentId);
  const current = Array.isArray(store[key]) ? store[key].slice() : [];
  if (current.some(row => Number(row.id) === Number(thing.id) && Number(row.type) === Number(thing.type))) {
    return {ok: false, message: '该事物已绑定。'};
  }
  // One room + multiple instruments allowed; replace prior room if binding another room.
  let next = current;
  if (Number(thing.type) === 11) {
    next = current.filter(row => Number(row.type) !== 11);
  }
  next.push({
    id: thing.id,
    name: thing.name,
    type: thing.type,
    openTwoSystem: !!thing.openTwoSystem
  });
  store[key] = next;
  writeEquipmentBindingsStore(store);
  return {ok: true, list: next.map(clone)};
}

/** POST /room/things/add — {thingsId: roomId, equipmentId, equipmentType} */
export function addEquipmentRoomBinding(body = {}) {
  const equipmentId = Number(body.equipmentId);
  const thingsId = Number(body.thingsId);
  const gate = assertWritableEquipment(equipmentId);
  if (!gate.ok) return gate;
  const thing = catalogThing(11, thingsId);
  if (!thing) return {ok: false, message: '演示房间不存在。'};
  return pushBinding(equipmentId, thing);
}

/** POST /instrument/things/add — [{thingsId, equipmentId, equipmentType}] or single object */
export function addEquipmentInstrumentBinding(body = {}) {
  const rows = Array.isArray(body) ? body : [body];
  if (!rows.length) return {ok: false, message: '绑定参数无效。'};
  const planned = [];
  const seen = new Set();
  for (const row of rows) {
    if (!row) return {ok: false, message: '绑定参数无效。'};
    const equipmentId = Number(row.equipmentId);
    const thingsId = Number(row.thingsId);
    const gate = assertWritableEquipment(equipmentId);
    if (!gate.ok) return gate;
    const thing = catalogThing(4, thingsId);
    if (!thing) return {ok: false, message: '演示仪器不存在。'};
    const key = equipmentId + ':' + thingsId;
    if (seen.has(key) || bindingsFor(equipmentId).some(item => item.type === 4 && item.id === thingsId)) {
      return {ok: false, message: '该事物已绑定或批次中存在重复绑定。'};
    }
    seen.add(key);
    planned.push({equipmentId, thing});
  }
  const store = {...readEquipmentBindingsStore()};
  for (const {equipmentId, thing} of planned) {
    store[String(equipmentId)] = [...(store[String(equipmentId)] || []), {...thing}];
  }
  writeEquipmentBindingsStore(store);
  return {ok: true, list: store[String(planned[planned.length - 1].equipmentId)].map(clone)};
}

/**
 * POST /room/things/remove | /instrument/things/remove
 * {equipmentId, thingsId, thingsType?}
 */
export function removeEquipmentBinding(body = {}) {
  const equipmentId = Number(body.equipmentId);
  const thingsId = Number(body.thingsId);
  const gate = assertWritableEquipment(equipmentId);
  if (!gate.ok) return gate;
  if (!Number.isFinite(thingsId)) return {ok: false, message: '事物编号无效。'};
  const explicitType = body.thingsType != null ? Number(body.thingsType) : null;
  const store = {...readEquipmentBindingsStore()};
  const key = String(equipmentId);
  const current = Array.isArray(store[key]) ? store[key] : [];
  const filtered = current.filter(row => {
    if (Number(row.id) !== thingsId) return true;
    if (explicitType != null && Number(row.type) !== explicitType) return true;
    return false;
  });
  if (filtered.length === current.length) return {ok: false, message: '未找到绑定关系。'};
  store[key] = filtered;
  writeEquipmentBindingsStore(store);
  return {ok: true, list: filtered.map(clone)};
}

/**
 * GET /instrument/unbind?instrumentId=
 * Clear all equipment↔instrument (type=4) bindings for one instrument.
 * Required before delete when the instrument is bound to smart hardware.
 */
export function unbindInstrumentHardware(instrumentId) {
  const key = Number(instrumentId);
  if (!Number.isFinite(key)) return {ok: false, message: '设备编号无效。'};
  const alive = listActiveInstrumentSeeds().some(item => Number(item.id) === key && !!resolveInstrumentEntity(item));
  if (!alive) return {ok: false, message: '演示设备不存在。'};
  const store = {...readEquipmentBindingsStore()};
  let removed = 0;
  for (const eqId of Object.keys(store)) {
    const bucket = Array.isArray(store[eqId]) ? store[eqId] : [];
    const next = bucket.filter(row => !(Number(row.type) === 4 && Number(row.id) === key));
    if (next.length === bucket.length) continue;
    removed += bucket.length - next.length;
    if (next.length) store[eqId] = next;
    else delete store[eqId];
  }
  if (!removed) return {ok: false, message: '该设备未绑定智能硬件。'};
  writeEquipmentBindingsStore(store);
  return {ok: true, instrumentId: key, count: removed};
}

/** POST /device/deviceBindThings — delete guard; return bound thing summaries. */
export function listEquipmentBindThingsCheck(body = {}) {
  const ids = Array.isArray(body.ids) ? body.ids.map(Number).filter(n => Number.isFinite(n)) : [];
  const rows = [];
  for (const equipmentId of ids) {
    const entity = equipmentById(equipmentId);
    for (const bind of bindingsFor(equipmentId)) {
      rows.push({
        equipmentId,
        equipmentNo: entity ? entity.no : String(equipmentId),
        objType: Number(bind.type) === 11 ? 1 : 2,
        objNo: bind.name,
        objId: bind.id
      });
    }
  }
  return rows;
}

export function resetEquipmentBindings() {
  storage.removeItem(EQUIPMENT_BINDINGS_KEY);
}

/** @deprecated empty stub kept for callers; prefer listEquipmentBindings. */
export function emptyEquipmentBindings() {
  return [];
}

/**
 * GET /device/signal/bind/list — SignalSourceDrawer bound hardware.
 * Demo：980016 预置绑定一台记录仪（只读展示）；写绑定/解绑由 handler 拒绝。
 */
export function listSignalReceiverBindings(params = {}) {
  const signId = Number(params.signId != null ? params.signId : params.signalReceiverId);
  const pageNum = Math.max(1, Number(params.pageNum) || 1);
  const pageSize = Math.max(1, Number(params.pageSize) || 10);
  const receiver = equipmentById(signId);
  if (!receiver || Number(receiver.equipmentTypeCode) !== 14) {
    return {list: [], total: 0, pageNum, pageSize};
  }
  const seeds = signId === 980016
    ? [980001]
    : (signId === 980017 ? [980003] : []);
  const list = seeds.map(id => {
    const eq = equipmentById(id);
    if (!eq) return null;
    return {
      id: eq.id,
      encodeId: eq.strId,
      name: eq.name,
      no: eq.no,
      type: eq.equipmentTypeCode,
      equipmentTypeCode: eq.equipmentTypeCode,
      status: eq.status,
      battery: eq.battery,
      openTwoSystem: !!eq.openTwoSystem,
      sensors: clone(eq.sensors || []),
      departmentName: eq.departmentName
    };
  }).filter(Boolean);
  const start = (pageNum - 1) * pageSize;
  return {
    list: list.slice(start, start + pageSize),
    total: list.length,
    pageNum,
    pageSize
  };
}

/**
 * GET /history/device/chart — DeviceMonitorMessage curve for signal (and reusable).
 * Returns {list: [{createDate, data}]} matching DeviceMonitorMessage contract.
 */
export function getHistoryDeviceChart(params = {}) {
  const deviceId = Number(params.deviceId);
  const entity = equipmentById(deviceId);
  if (!entity || !supportsEquipmentDetail(entity)) return null;
  if (Number(entity.status) === -100) return {list: []};

  const rows = getEquipmentMonitorInfo({
    type: 1,
    objId: deviceId,
    objSensorId: probeId(deviceId),
    interval: params.interval != null ? params.interval : 4,
    historyTimeInterval: params.historyTimeInterval,
    beginTime: params.beginTime,
    endTime: params.endTime
  });
  if (rows == null) return {list: []};
  return {
    list: rows.map(row => ({
      createDate: row.createDate,
      data: row.data
    }))
  };
}

/**
 * GET /device/wifi/echo — NetworkConfiguration 回显。
 * wifiFlag 设备（type 8/10/16）可读；不下发。
 */
export function getDeviceWifiEcho(deviceId) {
  const entity = equipmentById(deviceId);
  if (!entity || !supportsEquipmentDetail(entity)) return null;
  const code = Number(entity.equipmentTypeCode);
  if (code !== 10 && code !== 8 && code !== 16) return null;
  const suffix = String(entity.id).slice(-2);
  return {
    networkMode: 2,
    wifiConfig: {
      dhcp: 0,
      dns: '8.8.8.8',
      encryptionType: 4,
      gateway: '192.168.1.1',
      ip: `192.168.1.${suffix}`,
      password: '********',
      securityMode: 3,
      ssid: `Demo-Lab-WiFi-${suffix}`,
      submask: '255.255.255.0'
    },
    lanConfig: {
      dhcp: 0,
      dns: '8.8.8.8',
      gateway: '192.168.1.1',
      ip: `192.168.10.${suffix}`,
      submask: '255.255.255.0'
    },
    equipmentNo: entity.no
  };
}

/**
 * POST /gun/pipette/binding/list — GunRackDrawer 移液枪位列表。
 */
export function listGunPipetteBindings(body = {}) {
  const gunRackId = Number(body.gunRackId);
  const pageNum = Math.max(1, Number(body.pageNum) || 1);
  const pageSize = Math.max(1, Number(body.pageSize) || 10);
  const rack = equipmentById(gunRackId);
  if (!rack || Number(rack.equipmentTypeCode) !== 13) {
    return {list: [], total: 0, pageNum, pageSize};
  }
  const seeds = gunRackId === 980023
    ? [
      {detent: 1, name: '演示移液枪 1', no: 'PG-001', homingStatus: 0},
      {detent: 2, name: '演示移液枪 2', no: 'PG-002', homingStatus: 1},
      {detent: 3, name: '演示移液枪 3', no: 'PG-003', homingStatus: 2},
      {detent: 4, name: '', no: 'null', homingStatus: 0}
    ]
    : [
      {detent: 1, name: '演示移液枪 4', no: 'PG-004', homingStatus: 0},
      {detent: 2, name: '', no: 'null', homingStatus: 0}
    ];
  const list = seeds.map((item, index) => ({
    id: gunRackId * 10 + index + 1,
    detent: item.detent,
    name: item.name,
    no: item.no,
    homingStatus: item.homingStatus,
    gunRackId,
    gunRackName: rack.name
  }));
  const start = (pageNum - 1) * pageSize;
  return {
    list: list.slice(start, start + pageSize),
    total: list.length,
    pageNum,
    pageSize
  };
}

/** GET /history/device/alarm、/history/my/alarm — 枪架/网关告警空列表桩。 */
export function emptyDeviceHistoryAlarmPage(params = {}) {
  return {
    list: [],
    total: 0,
    pageNum: Math.max(1, Number(params.pageNum) || 1),
    pageSize: Math.max(1, Number(params.pageSize) || 10)
  };
}

/**
 * POST /label/binding/list — GatewayDrawer 绑定资产标签列表。
 */
export function listLabelBindings(body = {}) {
  const gatewayId = Number(body.gatewayId);
  const pageNum = Math.max(1, Number(body.pageNum) || 1);
  const pageSize = Math.max(1, Number(body.pageSize) || 10);
  const gateway = equipmentById(gatewayId);
  if (!gateway || Number(gateway.equipmentTypeCode) !== 16) {
    return {list: [], total: 0, pageNum, pageSize};
  }
  const seeds = gatewayId === 980025
    ? [
      {labelNo: 'TAG-001', status: 1, labelSignal: -68, labellectric: '3.1', instrumentName: '演示培养箱'},
      {labelNo: 'TAG-002', status: 1, labelSignal: -75, labellectric: '2.9', instrumentName: '演示冷藏柜'},
      {labelNo: 'TAG-003', status: 0, labelSignal: -90, labellectric: '2.4', instrumentName: ''}
    ]
    : [
      {labelNo: 'TAG-004', status: 1, labelSignal: -80, labellectric: '3.0', instrumentName: ''}
    ];
  const list = seeds.map((item, index) => ({
    id: gatewayId * 10 + index + 1,
    labelNo: item.labelNo,
    propertyGateName: gateway.name,
    status: item.status,
    labelSignal: item.labelSignal,
    reportDate: gateway.reportDate,
    labellectric: item.labellectric,
    instrumentName: item.instrumentName
  }));
  const start = (pageNum - 1) * pageSize;
  return {
    list: list.slice(start, start + pageSize),
    total: list.length,
    pageNum,
    pageSize
  };
}
