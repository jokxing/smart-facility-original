jest.mock('../../../src/mock/captcha', () => ({createCaptchaImage: () => 'test-png-base64'}));

import axios from 'axios';
import qs from 'qs';
import {
  DEMO_EQUIPMENTS,
  getEquipmentDashboardOverview,
  listEquipmentSort
} from '../../../src/mock/fixtures/equipment';
import {DEMO_BASE_URL} from '../../../src/mock/adapter';
import mockAdapter from '../../../src/mock';
import storage from '../../../src/mock/storage';
import {DEMO_CREDENTIALS} from '../../../src/mock/fixtures/auth';

let client;
let sessionId;

beforeEach(() => {
  storage.clear();
  client = axios.create({baseURL: DEMO_BASE_URL, adapter: mockAdapter});
});

async function captcha() {
  const response = await client.get('/captchaCode', {params: {sessionId}});
  sessionId = response.data.items.sessionId;
  client.defaults.headers.common.Authorization = sessionId;
  storage.setItem('sessionId', sessionId);
  return response.data;
}

async function login() {
  return (await client.post('/login', qs.stringify({...DEMO_CREDENTIALS, sessionId}))).data;
}

async function establishSession() {
  await captcha();
  const result = await login();
  storage.setItem('token', result.items.token);
  return result;
}

test('equipment seed has enough rows for two pages and mixed status/type/dept', () => {
  expect(DEMO_EQUIPMENTS.length).toBeGreaterThanOrEqual(15);
  const statuses = new Set(DEMO_EQUIPMENTS.map(item => item.status));
  expect(statuses.has(1)).toBe(true);
  expect(statuses.has(-1)).toBe(true);
  expect(statuses.has(-100)).toBe(true);
  const depts = new Set(DEMO_EQUIPMENTS.map(item => item.departmentId));
  expect(depts.has(900101)).toBe(true);
  expect(depts.has(900102)).toBe(true);
  const types = new Set(DEMO_EQUIPMENTS.map(item => item.equipmentTypeCode));
  expect(types.has(0)).toBe(true);
  expect(types.has(10)).toBe(true);
});

test('dashboard overview counts alarm as status -1 only, not offline', () => {
  const overview = getEquipmentDashboardOverview();
  expect(overview.total).toBe(DEMO_EQUIPMENTS.length);
  expect(overview.alarmCount).toBe(DEMO_EQUIPMENTS.filter(item => item.status === -1).length);
  expect(overview.alarmCount).toBeGreaterThan(0);
  expect(overview.alarmCount).toBeLessThan(overview.total);
});

test('listEquipmentSort filters keyword, department, deviceType and equipmentType on the server', () => {
  const all = listEquipmentSort({pageNum: 1, pageSize: 10, deviceType: 0});
  expect(all.total).toBe(DEMO_EQUIPMENTS.length);
  expect(all.list).toHaveLength(10);
  expect(all.deviceSortCount.deviceCount).toBe(DEMO_EQUIPMENTS.length);

  const byKeyword = listEquipmentSort({pageNum: 1, pageSize: 50, keyword: 'EQ-TH', deviceType: 0});
  expect(byKeyword.total).toBe(3);
  expect(byKeyword.list.every(item => item.no.includes('EQ-TH'))).toBe(true);

  const empty = listEquipmentSort({pageNum: 1, pageSize: 10, keyword: '不存在的关键字XYZ', deviceType: 0});
  expect(empty.total).toBe(0);
  expect(empty.list).toEqual([]);

  const byDept = listEquipmentSort({pageNum: 1, pageSize: 50, departmentId: 900102, deviceType: 0});
  expect(byDept.list.every(item => item.departmentId === 900102)).toBe(true);
  expect(byDept.total).toBe(DEMO_EQUIPMENTS.filter(item => item.departmentId === 900102).length);

  const bySensor = listEquipmentSort({pageNum: 1, pageSize: 50, deviceType: 1});
  expect(bySensor.list.every(item => item.deviceType === 1)).toBe(true);
  expect(bySensor.deviceSortCount.typeSorts.find(item => item.code === 1).count)
    .toBe(DEMO_EQUIPMENTS.filter(item => item.deviceType === 1).length);

  const byEquip = listEquipmentSort({pageNum: 1, pageSize: 50, deviceType: 0, equipmentType: 10});
  expect(byEquip.list.every(item => item.equipmentTypeCode === 10)).toBe(true);
  expect(byEquip.equipmentSortCount.find(item => item.type === 10).count)
    .toBe(DEMO_EQUIPMENTS.filter(item => item.equipmentTypeCode === 10).length);
});

test('combined filters and pagination stay consistent with facet counts', () => {
  const page1 = listEquipmentSort({
    pageNum: 1, pageSize: 10, departmentId: 900101, deviceType: 0
  });
  const page2 = listEquipmentSort({
    pageNum: 2, pageSize: 10, departmentId: 900101, deviceType: 0
  });
  expect(page1.total).toBe(page2.total);
  expect(page1.total).toBeGreaterThan(10);
  expect(page1.list).toHaveLength(10);
  expect(page2.list.length).toBe(page1.total - 10);
  expect(page1.list[0].id).not.toBe(page2.list[0].id);
  expect(page1.deviceSortCount.deviceCount).toBe(page1.total);

  const combo = listEquipmentSort({
    pageNum: 1, pageSize: 50, departmentId: 900101, deviceType: 2, equipmentType: 0
  });
  expect(combo.list.every(item =>
    item.departmentId === 900101 && item.deviceType === 2 && item.equipmentTypeCode === 0
  )).toBe(true);
});

test('sortName orders by mapped columns', () => {
  const asc = listEquipmentSort({
    pageNum: 1, pageSize: 50, deviceType: 0,
    sortName: {name: 'asc', num: '', department: '', createTime: ''}
  });
  const names = asc.list.map(item => item.name);
  expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'zh')));

  const descNo = listEquipmentSort({
    pageNum: 1, pageSize: 50, deviceType: 0,
    sortName: {name: '', num: 'desc', department: '', createTime: ''}
  });
  const nos = descNo.list.map(item => item.no);
  expect(nos).toEqual([...nos].sort((a, b) => b.localeCompare(a, 'zh')));
});

test('HTTP mock returns sort/list and dashboard without falling through', async () => {
  await establishSession();
  const listRes = await client.post('/equipment/sort/list', {
    pageNum: 1, pageSize: 10, status: 0, departmentId: null, deviceType: 0, equipmentType: null,
    sortName: {name: '', num: '', department: '', createTime: ''}
  });
  expect(listRes.data.code).toBe(1);
  expect(listRes.data.items.list).toHaveLength(10);
  expect(listRes.data.items.deviceSortCount.typeSorts.some(item => item.code === 0)).toBe(true);
  expect(listRes.data.items.equipmentSortCount.some(item => item.type === 10)).toBe(true);

  const dash = await client.get('/equipment/dashboard');
  expect(dash.data.code).toBe(1);
  expect(dash.data.items).toEqual(getEquipmentDashboardOverview());

  const offline = DEMO_EQUIPMENTS.filter(item => item.status === -100);
  const alarm = DEMO_EQUIPMENTS.filter(item => item.status === -1);
  expect(offline.length).toBeGreaterThan(0);
  expect(alarm.length).toBeGreaterThan(0);
  expect(listRes.data.items.list.some(item => item.status === -100 || item.status === -1 || item.status === 1)).toBe(true);
});

test('device detail path serves recorder/socket only and keeps instrument separate', async () => {
  await establishSession();
  const recorder = await client.get('/device/detail', {params: {deviceId: 980001}});
  expect(recorder.data.code).toBe(1);
  expect(recorder.data.items).toMatchObject({
    id: 980001, equipmentTypeCode: 0, no: 'EQ-TH-001', alarmInterval: 5
  });
  expect(recorder.data.items.sensors[0].sensorType.name).toBe('温度（温湿度设备单通道演示）');
  // HardwareState reads min/max — must not be undefined
  expect(recorder.data.items.sensors[0].min).toBe(0);
  expect(recorder.data.items.sensors[0].max).toBe(30);
  expect(recorder.data.items.signalStrength).toBe(-70);

  const socket = await client.get('/device/detail', {params: {deviceId: '980010'}});
  expect(socket.data.code).toBe(1);
  expect(socket.data.items.equipmentTypeCode).toBe(10);
  expect(socket.data.items.wifiFlag).toBe(true);

  const alerter = await client.get('/device/detail', {params: {deviceId: 980012}});
  expect(alerter.data.code).toBe(1);
  expect(alerter.data.items.equipmentTypeCode).toBe(7);
  expect(alerter.data.items.defenceAlarmStatus).toBe(1);
  expect(alerter.data.items.powerFailure).toBe(1);
  expect(alerter.data.items.statusStr).toBe('正常');

  const alerterAlarm = await client.get('/device/detail', {params: {deviceId: 980013}});
  expect(alerterAlarm.data.code).toBe(1);
  expect(alerterAlarm.data.items.defenceAlarmStatus).toBe(0);

  const beep = await client.get('/alertor/obtain/beepTime', {params: {equipmentId: 980012}});
  expect(beep.data.code).toBe(1);
  expect(beep.data.items).toBe(30);

  const power = await client.get('/device/detail', {params: {deviceId: 980014}});
  expect(power.data.code).toBe(1);
  expect(power.data.items.equipmentTypeCode).toBe(8);
  expect(power.data.items.powerFailure).toBe(1);
  expect(power.data.items.wifiFlag).toBe(true);

  const powerOffline = await client.get('/device/detail', {params: {deviceId: 980015}});
  expect(powerOffline.data.code).toBe(1);
  expect(powerOffline.data.items.powerFailure).toBe(0);

  const signal = await client.get('/device/detail', {params: {deviceId: 980016}});
  expect(signal.data.code).toBe(1);
  expect(signal.data.items.equipmentTypeCode).toBe(14);
  expect(signal.data.items.statusStr).toBe('正常');
  expect(signal.data.items.runStatus).toBe(1);
  expect(signal.data.items.sensors[0].deviceId).toBe(980016);
  expect(signal.data.items.sensors[0].sensorType.sensorAlias).toBe('温度（温湿度设备单通道演示）');

  const signalBind = await client.get('/device/signal/bind/list', {params: {signId: 980016, pageNum: 1, pageSize: 10}});
  expect(signalBind.data.code).toBe(1);
  expect(signalBind.data.items.list.some(i => i.id === 980001)).toBe(true);

  const chart = await client.get('/history/device/chart', {params: {deviceId: 980016, idx: 0, interval: 4, historyTimeInterval: 5, type: 1}});
  expect(chart.data.code).toBe(1);
  expect(chart.data.items.list.length).toBeGreaterThan(0);

  const bindReject = await client.post('/device/signal/bind', {signalReceiverId: 980016, equipmentId: 980002});
  expect(bindReject.data.code).toBe(0);

  const gatewayBlocked = await client.get('/device/detail', {params: {deviceId: 980099}});
  expect(gatewayBlocked.data.code).toBe(0);

  const wifiEcho = await client.get('/device/wifi/echo', {params: {deviceId: 980010}});
  expect(wifiEcho.data.code).toBe(1);
  expect(wifiEcho.data.items.wifiConfig.ssid).toBe('Demo-Lab-WiFi-10');
  expect(wifiEcho.data.items.wifiConfig.ip).toBe('192.168.1.10');
  expect(wifiEcho.data.items.lanConfig.ip).toBe('192.168.10.10');

  const wifiEchoPower = await client.get('/device/wifi/echo', {params: {deviceId: 980014}});
  expect(wifiEchoPower.data.code).toBe(1);
  expect(wifiEchoPower.data.items.wifiConfig.ssid).toBe('Demo-Lab-WiFi-14');

  const wifiEchoBlocked = await client.get('/device/wifi/echo', {params: {deviceId: 980001}});
  expect(wifiEchoBlocked.data.code).toBe(0);

  const wifiInputReject = await client.post('/device/wifi/input', {equipmentNo: 'EQ-SK-001', networkMode: 2});
  expect(wifiInputReject.data.code).toBe(0);

  const gunRack = await client.get('/device/detail', {params: {deviceId: 980023}});
  expect(gunRack.data.code).toBe(1);
  expect(gunRack.data.items.equipmentTypeCode).toBe(13);
  expect(gunRack.data.items.roomName).toBe('演示房间 A');
  expect(gunRack.data.items.companyName).toBe('演示科技有限公司');

  const gunList = await client.post('/gun/pipette/binding/list', {
    gunRackId: 980023, pageNum: 1, pageSize: 10
  });
  expect(gunList.data.code).toBe(1);
  expect(gunList.data.items.list.length).toBe(4);
  expect(gunList.data.items.list[0].no).toBe('PG-001');
  expect(gunList.data.items.list[1].homingStatus).toBe(1);

  const historyAlarm = await client.get('/history/device/alarm', {params: {deviceId: 980023, type: '1000'}});
  expect(historyAlarm.data.code).toBe(1);
  expect(historyAlarm.data.items.list).toEqual([]);

  const gateway = await client.get('/device/detail', {params: {deviceId: 980025}});
  expect(gateway.data.code).toBe(1);
  expect(gateway.data.items.equipmentTypeCode).toBe(16);
  expect(gateway.data.items.wifiFlag).toBe(true);
  expect(gateway.data.items.propertyNum).toBe(3);
  expect(gateway.data.items.roomName).toBe('演示房间 A');

  const labels = await client.post('/label/binding/list', {
    gatewayId: 980025, pageNum: 1, pageSize: 10
  });
  expect(labels.data.code).toBe(1);
  expect(labels.data.items.list.length).toBe(3);
  expect(labels.data.items.list[0].labelNo).toBe('TAG-001');

  const wifiGw = await client.get('/device/wifi/echo', {params: {deviceId: 980025}});
  expect(wifiGw.data.code).toBe(1);
  expect(wifiGw.data.items.wifiConfig.ssid).toBe('Demo-Lab-WiFi-25');

  const instrument = await client.get('/instrument/detail', {params: {id: 970001}});
  expect(instrument.data.code).toBe(1);
  expect(instrument.data.items.id).toBe(970001);
});

test('hardware monitor flags, curve type=1, alarms and empty shells', async () => {
  await establishSession();
  const single = await client.get('/monitorIndicator/getDeviceSingleMonitorFlag', {params: {equipmentId: 980002}});
  expect(single.data.code).toBe(1);
  expect(single.data.items[0].objSensorId).toBe(980002 * 10 + 1);
  expect(single.data.items[0].min).toBe(0);
  expect(single.data.items[0].max).toBe(30);

  const flags = await client.get('/monitorIndicator/getDeviceMonitorFlag', {params: {equipmentId: 980002}});
  expect(flags.data.code).toBe(1);
  expect(flags.data.items[0].objSensorIds).toEqual([980002 * 10 + 1]);

  const curve = await client.get('/monitorIndicator/monitorInfo', {
    params: {type: 1, objId: 980001, objSensorId: 980001 * 10 + 1, interval: 4, historyTimeInterval: 5}
  });
  expect(curve.data.code).toBe(1);
  expect(curve.data.items.length).toBeGreaterThan(0);
  expect(curve.data.items[0]).toHaveProperty('createDate');
  expect(curve.data.items[0]).toHaveProperty('data');

  const offlineCurve = await client.get('/monitorIndicator/monitorInfo', {
    params: {type: 1, objId: 980004, objSensorId: 980004 * 10 + 1, interval: 4}
  });
  expect(offlineCurve.data.code).toBe(1);
  expect(offlineCurve.data.items).toEqual([]);

  // Water immersion discrete 0/1 — legal 0 must not become 20, no float wobble
  const water = await client.get('/monitorIndicator/monitorInfo', {
    params: {type: 1, objId: 980005, objSensorId: 980005 * 10 + 1, interval: 4, historyTimeInterval: 5}
  });
  expect(water.data.code).toBe(1);
  expect(water.data.items.length).toBeGreaterThan(0);
  expect(water.data.items.every(row => row.data === 0 || row.data === 1)).toBe(true);

  const alarms = await client.post('/monitorIndicator/historyAlarmRecord', {
    objSensorIds: [980002 * 10 + 1], pageNum: 1, pageSize: 10
  });
  expect(alarms.data.code).toBe(1);
  expect(alarms.data.items.total).toBe(1);
  expect(alarms.data.items.list[0].equipmentId).toBe(980002);
  expect(alarms.data.items.list[0].kind).toBe('threshold');
  expect(alarms.data.items.list[0].process).toBe(false);

  // Offline tab uses objId without objSensorIds — must not return threshold rows
  const offlineAlarms = await client.post('/monitorIndicator/historyAlarmRecord', {
    objId: 980004, objType: 1, pageNum: 1, pageSize: 10
  });
  expect(offlineAlarms.data.code).toBe(1);
  expect(offlineAlarms.data.items.total).toBe(1);
  expect(offlineAlarms.data.items.list[0].kind).toBe('offline');
  expect(offlineAlarms.data.items.list.every(row => row.kind === 'offline')).toBe(true);

  const offlineEmptyThresholdDevice = await client.post('/monitorIndicator/historyAlarmRecord', {
    objId: 980002, objType: 1, pageNum: 1, pageSize: 10
  });
  expect(offlineEmptyThresholdDevice.data.items.total).toBe(0);

  expect((await client.get('/equipmentUser/list', {params: {equipmentId: 980001}})).data.items.list).toEqual([]);
  expect((await client.get('/useStatus/query', {params: {id: 980001}})).data.items.list).toEqual([]);
  expect((await client.post('/device/binding', {equipmentIdStr: '980001'})).data.items).toEqual([]);
  expect((await client.get('/monitorAlarmRule/isOpenTwoSystem', {params: {equipmentId: 980001}})).data.items).toBe(false);
});

test('hardware exceptionHandle persists and list reflects processed state', async () => {
  const {
    handleEquipmentException,
    listEquipmentHistoryAlarms,
    resetEquipmentAlarmHandles
  } = require('../../../src/mock/fixtures/equipment');
  resetEquipmentAlarmHandles();

  const before = listEquipmentHistoryAlarms({objSensorIds: [980002 * 10 + 1], pageNum: 1, pageSize: 10});
  expect(before.list[0].process).toBe(false);

  expect(handleEquipmentException({
    objSensorId: 980002 * 10 + 1,
    time: '2026-09-22 10:00:00',
    errorType: 1,
    processDate: '2026-09-24 12:00:00',
    errorCauseMethod: '演示排查',
    errorCauseMsg: '传感器误报',
    userName: '演示用户'
  }).ok).toBe(true);

  const after = listEquipmentHistoryAlarms({objSensorIds: [980002 * 10 + 1], pageNum: 1, pageSize: 10});
  expect(after.list[0].process).toBe(true);
  expect(after.list[0].errorCauseMsg).toBe('传感器误报');
  expect(after.list[0].errorCauseTypeFormat).toBe(1);
  expect(after.list[0].errorCauseTime).toBe('2026-09-24 12:00:00');

  // Invalid type / date / unknown record rejected; storage unchanged on failure path for bad id
  expect(handleEquipmentException({
    objSensorId: 980002 * 10 + 1, time: '2026-09-22 10:00:00', errorType: 99, processDate: '2026-09-24 12:00:00'
  }).ok).toBe(false);
  expect(handleEquipmentException({
    objSensorId: 999999, time: '2026-09-22 10:00:00', errorType: 1, processDate: '2026-09-24 12:00:00'
  }).ok).toBe(false);

  await establishSession();
  const http = await client.post('/monitorIndicator/exceptionHandle', {
    objSensorId: 980007 * 10 + 1,
    time: '2026-09-20 15:30:00',
    errorType: 2,
    processDate: '2026-09-24 13:00:00',
    errorCauseMethod: '复检',
    errorCauseMsg: '已处理编辑'
  });
  expect(http.data.code).toBe(1);
  resetEquipmentAlarmHandles();
});

test('hardware interval and sensor threshold settings persist on detail', async () => {
  const {
    getEquipmentDetail,
    getEquipmentSingleMonitorFlag,
    resetEquipmentSettings,
    updateEquipmentAlarmInterval,
    updateEquipmentReportingInterval,
    updateEquipmentSensors
  } = require('../../../src/mock/fixtures/equipment');
  resetEquipmentSettings();

  expect(getEquipmentDetail(980001).reportingInterval).toBe(10);
  expect(getEquipmentDetail(980001).alarmInterval).toBe(5);

  expect(updateEquipmentReportingInterval({id: 980001, reportingInterval: 15}).ok).toBe(true);
  expect(updateEquipmentAlarmInterval({id: 980001, alarmInterval: 8}).ok).toBe(true);
  expect(getEquipmentDetail(980001).reportingInterval).toBe(15);
  expect(getEquipmentDetail(980001).alarmInterval).toBe(8);

  expect(updateEquipmentReportingInterval({id: 980001, reportingInterval: 0}).ok).toBe(false);
  expect(updateEquipmentAlarmInterval({id: 980012, alarmInterval: 3}).ok).toBe(false);

  expect(updateEquipmentSensors({
    id: 980001,
    sensors: [{idx: 0, type: 1, min: 2, max: 28, switchOff: false, warningMin: 0, warningMax: 0}]
  }).ok).toBe(true);
  expect(getEquipmentDetail(980001).sensors[0].min).toBe(2);
  expect(getEquipmentDetail(980001).sensors[0].max).toBe(28);
  expect(getEquipmentSingleMonitorFlag(980001)[0].min).toBe(2);
  expect(getEquipmentSingleMonitorFlag(980001)[0].max).toBe(28);

  expect(updateEquipmentSensors({
    id: 980001,
    sensors: [{idx: 0, type: 1, min: 30, max: 10, switchOff: false}]
  }).ok).toBe(false);

  await establishSession();
  expect((await client.post('/device/update/interval/report', {id: 980001, reportingInterval: 20})).data.code).toBe(1);
  expect((await client.get('/device/detail', {params: {deviceId: 980001}})).data.items.reportingInterval).toBe(20);
  expect((await client.post('/device/update/interval/alarm', {id: 980001, alarmInterval: 12})).data.code).toBe(1);
  expect((await client.post('/device/update/sensors', {
    id: 980001,
    sensors: [{idx: 0, type: 1, min: 1, max: 25, switchOff: false, warningMin: 0, warningMax: 0}]
  })).data.code).toBe(1);
  const after = await client.get('/device/detail', {params: {deviceId: 980001}});
  expect(after.data.items.alarmInterval).toBe(12);
  expect(after.data.items.sensors[0].min).toBe(1);
  expect(after.data.items.sensors[0].max).toBe(25);
  resetEquipmentSettings();
});

test('hardware basic info and principals persist', async () => {
  const {
    addEquipmentUsers,
    getEquipmentDetail,
    listEquipmentUsers,
    removeEquipmentUserRecord,
    resetEquipmentMetaAndUsers,
    updateEquipmentBasic
  } = require('../../../src/mock/fixtures/equipment');
  resetEquipmentMetaAndUsers();

  expect(getEquipmentDetail(980001).name).toBe('演示温湿度记录仪 A');
  expect(getEquipmentDetail(980001).departmentId).toBe(900101);

  expect(updateEquipmentBasic({
    id: 980001, name: '演示温湿度记录仪 A-改', departmentId: 900102
  }).ok).toBe(true);
  expect(getEquipmentDetail(980001)).toMatchObject({
    name: '演示温湿度记录仪 A-改', departmentId: 900102, departmentName: '演示研发部'
  });
  expect(updateEquipmentBasic({id: 980001, name: '', departmentId: 900101}).ok).toBe(false);
  expect(updateEquipmentBasic({id: 980012, name: 'x', departmentId: 900101}).ok).toBe(false);

  expect(listEquipmentUsers({equipmentId: 980001}).total).toBe(0);
  expect(addEquipmentUsers({
    equipmentIds: [980001], userIds: [900002], type: 'DEVICE', weixin: 0, sms: -1, phone: -1
  }).ok).toBe(true);
  expect(listEquipmentUsers({equipmentId: 980001}).list[0]).toMatchObject({
    userId: 900002, userName: '演示运维员', weixin: 0
  });
  expect(addEquipmentUsers({
    equipmentIds: [980001], userIds: [900002], type: 'DEVICE', weixin: 0
  }).ok).toBe(false);
  expect(removeEquipmentUserRecord({equipmentId: 980001, userId: 900002}).ok).toBe(true);
  expect(listEquipmentUsers({equipmentId: 980001}).total).toBe(0);

  await establishSession();
  expect((await client.post('/device/update/basic', {
    id: 980001, name: '演示温湿度记录仪 A-HTTP', departmentId: 900101
  })).data.code).toBe(1);
  expect((await client.get('/device/detail', {params: {deviceId: 980001}})).data.items.name)
    .toBe('演示温湿度记录仪 A-HTTP');
  expect((await client.post('/equipmentUser/add', {
    equipmentIds: [980001], userIds: [900003], type: 'DEVICE', weixin: 0, sms: 0, phone: -1
  })).data.code).toBe(1);
  const users = await client.get('/equipmentUser/list', {params: {equipmentId: 980001, pageNum: 1, pageSize: 10}});
  expect(users.data.items.list[0].userName).toBe('演示研发员');
  expect((await client.get('/user/list', {params: {pageNum: 1, pageSize: 20}})).data.items.total).toBe(3);
  resetEquipmentMetaAndUsers();
});

test('hardware binding room and instrument persists', async () => {
  const {
    addEquipmentInstrumentBinding,
    addEquipmentRoomBinding,
    listEquipmentBindings,
    removeEquipmentBinding,
    resetEquipmentBindings
  } = require('../../../src/mock/fixtures/equipment');
  resetEquipmentBindings();

  expect(listEquipmentBindings({equipmentIdStr: 980001})).toEqual([]);
  expect(addEquipmentRoomBinding({equipmentId: 980001, thingsId: 950001}).ok).toBe(true);
  expect(listEquipmentBindings({equipmentIdStr: '980001'})[0]).toMatchObject({
    id: 950001, name: '演示房间 A', type: 11
  });
  expect(addEquipmentInstrumentBinding([{equipmentId: 980001, thingsId: 970001}]).ok).toBe(true);
  expect(listEquipmentBindings({equipmentIdStr: 980001}).map(i => i.type).sort((a, b) => a - b)).toEqual([4, 11]);
  expect(addEquipmentRoomBinding({equipmentId: 980001, thingsId: 950003}).ok).toBe(true);
  expect(listEquipmentBindings({equipmentIdStr: 980001}).filter(i => i.type === 11)[0].id).toBe(950003);
  expect(removeEquipmentBinding({equipmentId: 980001, thingsId: 970001, thingsType: 4}).ok).toBe(true);
  expect(listEquipmentBindings({equipmentIdStr: 980001}).some(i => i.type === 4)).toBe(false);
  expect(addEquipmentRoomBinding({equipmentId: 980012, thingsId: 950001}).ok).toBe(false);

  await establishSession();
  expect((await client.post('/device/binding', {equipmentIdStr: '980001'})).data.items.some(i => i.type === 11)).toBe(true);
  expect((await client.post('/instrument/things/add', [{
    equipmentId: 980001, thingsId: 970002, equipmentType: 0
  }])).data.code).toBe(1);
  expect((await client.post('/device/binding', {equipmentIdStr: '980001'})).data.items.some(i => i.id === 970002)).toBe(true);
  expect((await client.post('/room/things/remove', {
    equipmentId: 980001, thingsId: 950003, thingsType: 11
  })).data.code).toBe(1);
  resetEquipmentBindings();
});
