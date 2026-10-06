/**
 * Transport waybill demo store. Independent of mini program storage.
 * Entity state: 0 waiting / 1 loaded / 2 in transit / 3 arrived.
 * Mini-program list query state=0 means ALL, not waiting — see docs/transport-demo-contract.md.
 */
import {DEMO_NOW_MS, formatDemoDateTime, parseDemoDateTime} from '../clock';
import storage from '../storage';

const STATE_KEY = 'transportState';
const CREATED_KEY = 'transportCreated';
const PAGE_MAX = 50;
const CREATED_ID_MIN = 881101;
const CREATED_ID_MAX = 881199;

function nowMs() { return DEMO_NOW_MS; }
function fmt(ms) { return formatDemoDateTime(ms); }
function at(daysAgo, hour = 9) {
  return fmt(nowMs() - daysAgo * 86400000 + (hour - 12) * 3600000);
}
function parseTime(value) {
  if (!value) return NaN;
  const demo = parseDemoDateTime(String(value).replace(' ', 'T'));
  if (Number.isFinite(demo)) return demo;
  const n = Date.parse(String(value).replace(' ', 'T') + '+08:00');
  return Number.isFinite(n) ? n : Date.parse(String(value));
}
function read(key, fallback) {
  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : parsed;
  } catch (e) {
    return fallback;
  }
}
function write(key, value) { storage.setItem(key, JSON.stringify(value)); }
function clone(row) { return JSON.parse(JSON.stringify(row)); }

export const DEMO_DRIVERS = Object.freeze([
  {id: 883001, driverName: '演示司机甲', name: '演示司机甲', tel: '13800001001', userName: '演示司机甲'},
  {id: 883002, driverName: '演示司机乙', name: '演示司机乙', tel: '13800001002', userName: '演示司机乙'},
  {id: 883003, driverName: '演示司机丙', name: '演示司机丙', tel: '13800001003', userName: '演示司机丙'}
]);

export const DEMO_CARS = Object.freeze([
  {id: 882001, carBoard: '京A·D88001', driverId: 883001, brandName: '演示品牌', modelName: '演示厢式'},
  {id: 882002, carBoard: '京A·D88002', driverId: 883002, brandName: '演示品牌', modelName: '演示厢式'},
  {id: 882003, carBoard: '京A·D88003', driverId: 883003, brandName: '演示品牌', modelName: '演示厢式'}
]);

export const DEMO_UNITS = Object.freeze([
  {id: 884001, types: 0, receiptDeliverUserName: '演示发货站', tel: '13800002001', address: '演示省演示市演示区发货路1号', unitName: '演示发货单位'},
  {id: 884002, types: 1, receiptDeliverUserName: '演示收货站', tel: '13800002002', address: '演示省演示市演示区收货路8号', unitName: '演示收货单位'}
]);

export const DEMO_SAMPLES = Object.freeze([
  {id: 885001, sampleNo: 'S-001', sampleName: '演示试剂盒', productionCompany: '演示试剂厂', unitName: '箱', specification: '10支/箱', productionBatch: 'B-2026-01'},
  {id: 885002, sampleNo: 'S-002', sampleName: '演示冷链样本', productionCompany: '演示样本库', unitName: '件', specification: '2kg/件', productionBatch: 'B-2026-02'}
]);

const TEMP_MIN = 2;
const TEMP_MAX = 8;

function sampleLine(sampleId, amount) {
  const s = DEMO_SAMPLES.find(item => item.id === sampleId);
  return {
    sampleId, amount, sampleNo: s.sampleNo, sampleName: s.sampleName,
    unitName: s.unitName, specification: s.specification, productionBatch: s.productionBatch
  };
}

function ops(rows) {
  return rows.map((row, i) => ({id: i + 1, ...row}));
}

function seedOrders() {
  return [
    {
      id: 881001, transportNo: 'TO-DEMO-001', professionNo: 'PN-001', state: 0,
      carId: 0, driverId: 0, deliverId: 884001, receiveId: 884002,
      createDate: at(12, 9), loadingTime: '', beginTime: '', completeTime: '',
      planBeginTime: at(1, 8), comment: '待装车，未分配车辆。',
      tempOverrun: false, delayed: false, samples: [sampleLine(885001, 2)],
      operations: ops([{at: at(12, 9), action: '创建', userName: '演示用户'}])
    },
    {
      id: 881002, transportNo: 'TO-DEMO-002', professionNo: 'PN-002', state: 0,
      carId: 0, driverId: 0, deliverId: 884001, receiveId: 884002,
      createDate: at(11, 10), loadingTime: '', beginTime: '', completeTime: '',
      planBeginTime: at(0, 14), comment: '待装车。',
      tempOverrun: false, delayed: false, samples: [sampleLine(885002, 1)],
      operations: ops([{at: at(11, 10), action: '创建', userName: '演示用户'}])
    },
    {
      id: 881003, transportNo: 'TO-DEMO-003', professionNo: 'PN-003', state: 1,
      carId: 882002, driverId: 883002, deliverId: 884001, receiveId: 884002,
      createDate: at(3, 8), loadingTime: at(0, 8), beginTime: '', completeTime: '',
      planBeginTime: at(0, 13), comment: '已装车，可发运。',
      tempOverrun: false, delayed: false, samples: [sampleLine(885001, 3)],
      operations: ops([
        {at: at(3, 8), action: '创建', userName: '演示用户'},
        {at: at(3, 9), action: '分配车辆', userName: '演示用户'},
        {at: at(0, 8), action: '装车', userName: '演示用户'}
      ])
    },
    {
      id: 881004, transportNo: 'TO-DEMO-004', professionNo: 'PN-004', state: 2,
      carId: 882001, driverId: 883001, deliverId: 884001, receiveId: 884002,
      createDate: at(4, 8), loadingTime: at(0, 6), beginTime: at(0, 7), completeTime: '',
      planBeginTime: at(0, 7), comment: '运输中，温度正常。',
      tempOverrun: false, delayed: false, samples: [sampleLine(885001, 1), sampleLine(885002, 2)],
      operations: ops([
        {at: at(4, 8), action: '创建', userName: '演示用户'},
        {at: at(0, 6), action: '装车', userName: '演示用户'},
        {at: at(0, 7), action: '发运', userName: '演示用户'}
      ])
    },
    {
      id: 881005, transportNo: 'TO-DEMO-005', professionNo: 'PN-005', state: 2,
      carId: 882001, driverId: 883001, deliverId: 884001, receiveId: 884002,
      createDate: at(4, 8), loadingTime: at(0, 6), beginTime: at(0, 7), completeTime: '',
      planBeginTime: at(0, 7), comment: '运输中，温度超限。',
      tempOverrun: true, delayed: false, samples: [sampleLine(885002, 4)],
      operations: ops([
        {at: at(4, 8), action: '创建', userName: '演示用户'},
        {at: at(0, 6), action: '装车', userName: '演示用户'},
        {at: at(0, 7), action: '发运', userName: '演示用户'}
      ])
    },
    {
      id: 881006, transportNo: 'TO-DEMO-006', professionNo: 'PN-006', state: 2,
      carId: 882003, driverId: 883003, deliverId: 884001, receiveId: 884002,
      createDate: at(2, 9), loadingTime: at(1, 15), beginTime: at(0, 11), completeTime: '',
      planBeginTime: at(1, 8), comment: '运输中，相对计划发运延迟。',
      tempOverrun: false, delayed: true, samples: [sampleLine(885001, 2)],
      operations: ops([
        {at: at(2, 9), action: '创建', userName: '演示用户'},
        {at: at(1, 15), action: '装车', userName: '演示用户'},
        {at: at(0, 11), action: '发运', userName: '演示用户'}
      ])
    },
    {
      id: 881007, transportNo: 'TO-DEMO-007', professionNo: 'PN-007', state: 3,
      carId: 882001, driverId: 883001, deliverId: 884001, receiveId: 884002,
      createDate: at(10, 9), loadingTime: at(9, 10), beginTime: at(9, 11), completeTime: at(8, 16),
      planBeginTime: at(9, 11), comment: '已送达。',
      tempOverrun: false, delayed: false, samples: [sampleLine(885001, 1)],
      operations: ops([
        {at: at(10, 9), action: '创建', userName: '演示用户'},
        {at: at(9, 10), action: '装车', userName: '演示用户'},
        {at: at(9, 11), action: '发运', userName: '演示用户'},
        {at: at(8, 16), action: '送达', userName: '演示用户'}
      ])
    },
    {
      id: 881008, transportNo: 'TO-DEMO-008', professionNo: 'PN-008', state: 3,
      carId: 882002, driverId: 883002, deliverId: 884001, receiveId: 884002,
      createDate: at(8, 9), loadingTime: at(7, 10), beginTime: at(7, 11), completeTime: at(6, 15),
      planBeginTime: at(7, 11), comment: '已送达，运输中曾超温。',
      tempOverrun: true, delayed: false, samples: [sampleLine(885002, 2)],
      operations: ops([
        {at: at(8, 9), action: '创建', userName: '演示用户'},
        {at: at(7, 10), action: '装车', userName: '演示用户'},
        {at: at(7, 11), action: '发运', userName: '演示用户'},
        {at: at(6, 15), action: '送达', userName: '演示用户'}
      ])
    },
    {
      id: 881009, transportNo: 'TO-DEMO-009', professionNo: 'PN-009', state: 1,
      carId: 882002, driverId: 883002, deliverId: 884001, receiveId: 884002,
      createDate: at(3, 8), loadingTime: at(0, 8), beginTime: '', completeTime: '',
      planBeginTime: at(0, 13), comment: '与 TO-DEMO-003 同车待发。',
      tempOverrun: false, delayed: false, samples: [sampleLine(885002, 1)],
      operations: ops([
        {at: at(3, 8), action: '创建', userName: '演示用户'},
        {at: at(0, 8), action: '装车', userName: '演示用户'}
      ])
    },
    {
      id: 881010, transportNo: 'TO-DEMO-010', professionNo: 'PN-010', state: 0,
      carId: 0, driverId: 0, deliverId: 884001, receiveId: 884002,
      createDate: at(1, 16), loadingTime: '', beginTime: '', completeTime: '',
      planBeginTime: at(0, 18), comment: '待装车。',
      tempOverrun: false, delayed: false, samples: [sampleLine(885001, 5)],
      operations: ops([{at: at(1, 16), action: '创建', userName: '演示用户'}])
    }
  ];
}

function loadCreated() {
  const stored = read(CREATED_KEY, []);
  return Array.isArray(stored) ? stored : [];
}
function saveCreated(list) { write(CREATED_KEY, list); }
function loadOverlay() {
  const stored = read(STATE_KEY, {});
  return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
}
function saveOverlay(map) { write(STATE_KEY, map); }

export function resetDemoTransport() {
  storage.removeItem(STATE_KEY);
  storage.removeItem(CREATED_KEY);
}

function mergeOrder(seed) {
  const overlay = loadOverlay()[String(seed.id)];
  return overlay ? {...seed, ...overlay, samples: overlay.samples || seed.samples, operations: overlay.operations || seed.operations} : seed;
}

function allOrders() {
  return seedOrders().map(mergeOrder).concat(loadCreated().map(mergeOrder));
}

function findDriver(id) { return DEMO_DRIVERS.find(item => item.id === Number(id)) || null; }
function findCar(id) { return DEMO_CARS.find(item => item.id === Number(id)) || null; }
function findUnit(id) { return DEMO_UNITS.find(item => item.id === Number(id)) || null; }
function findSample(id) { return DEMO_SAMPLES.find(item => item.id === Number(id)) || null; }

function occupiedCarIds(exceptId) {
  const ids = new Set();
  allOrders().forEach(order => {
    if (Number(order.id) === Number(exceptId)) return;
    if (Number(order.state) === 2 && order.carId) ids.add(Number(order.carId));
  });
  return ids;
}

function occupiedDriverIds(exceptId) {
  const ids = new Set();
  allOrders().forEach(order => {
    if (Number(order.id) === Number(exceptId)) return;
    if (Number(order.state) === 2 && order.driverId) ids.add(Number(order.driverId));
  });
  return ids;
}

function currentTemp(order) {
  if (Number(order.state) < 2) return 5.0;
  return order.tempOverrun ? 9.4 : 5.2;
}

function sensorsOf(order) {
  const val = currentTemp(order);
  const overrun = val > TEMP_MAX || val < TEMP_MIN;
  return [
    {
      id: order.id * 10 + 1, monitorSensorCatId: 3, monitorSensorId: 1,
      monitorSensorName: '温度', sensorAlias: '温度', unit: '℃',
      monitorSensorVal: val, normalMin: TEMP_MIN, normalMax: TEMP_MAX, normalCat: 3,
      activateFlag: overrun ? 1 : 0, monitorFlag: 1
    },
    {
      id: order.id * 10 + 2, monitorSensorCatId: 3, monitorSensorId: 2,
      monitorSensorName: '湿度', sensorAlias: '湿度', unit: '%RH',
      monitorSensorVal: 55, normalMin: 30, normalMax: 80, normalCat: 3,
      activateFlag: 0, monitorFlag: 1
    },
    {
      id: order.id * 10 + 3, monitorSensorCatId: 12, monitorSensorId: 12,
      monitorSensorName: '定位', sensorAlias: '定位', unit: '',
      gps: '模拟轨迹（演示）', activateFlag: 0, monitorFlag: 1, monitorSensorVal: null
    }
  ];
}

function presentOrder(order) {
  const car = findCar(order.carId);
  const driver = findDriver(order.driverId);
  const deliver = findUnit(order.deliverId);
  const receive = findUnit(order.receiveId);
  return {
    ...order,
    carBoard: car ? car.carBoard : '',
    driverName: driver ? driver.driverName : '',
    driverTel: driver ? driver.tel : '',
    brandName: car ? car.brandName : '',
    modelName: car ? car.modelName : '',
    deliverName: deliver ? deliver.receiptDeliverUserName : '',
    deliverAddress: deliver ? deliver.address : '',
    deliverUnits: deliver ? deliver.unitName : '',
    receiveName: receive ? receive.receiptDeliverUserName : '',
    receiveAddress: receive ? receive.address : '',
    receiveUnits: receive ? receive.unitName : '',
    sampleInfos: order.samples || [],
    sensors: sensorsOf(order),
    statusValue: currentTemp(order),
    createUserName: '演示用户',
    equipmentNo: 'EQ-TR-001',
    remark: order.comment
  };
}

function persistOrder(order) {
  if (order.id >= CREATED_ID_MIN) {
    const created = loadCreated().map(item => Number(item.id) === Number(order.id) ? order : item);
    saveCreated(created);
    return;
  }
  const overlay = loadOverlay();
  overlay[String(order.id)] = {
    state: order.state, carId: order.carId, driverId: order.driverId,
    loadingTime: order.loadingTime, beginTime: order.beginTime, completeTime: order.completeTime,
    professionNo: order.professionNo, deliverId: order.deliverId, receiveId: order.receiveId,
    comment: order.comment, samples: order.samples, operations: order.operations,
    tempOverrun: order.tempOverrun, delayed: order.delayed
  };
  saveOverlay(overlay);
}

function parsePage(data) {
  let pageNum = Number(data && data.pageNum);
  let pageSize = Number(data && data.pageSize);
  if (!Number.isFinite(pageNum) || pageNum < 1) pageNum = 1;
  if (!Number.isFinite(pageSize) || pageSize < 1) pageSize = 10;
  if (pageSize > PAGE_MAX) pageSize = PAGE_MAX;
  return {pageNum: Math.floor(pageNum), pageSize: Math.floor(pageSize)};
}

function inWindow(timeStr, begin, end) {
  if (!Number.isFinite(begin) && !Number.isFinite(end)) return true;
  const t = parseTime(timeStr);
  if (!Number.isFinite(t)) return false;
  if (Number.isFinite(begin) && t < begin) return false;
  if (Number.isFinite(end) && t > end) return false;
  return true;
}

function queryWindow(query) {
  let begin = parseTime(query && query.beginTime);
  let end = parseTime(query && query.endTime);
  const dt = Number(query && query.dateType);
  if (!Number.isFinite(begin) && !Number.isFinite(end) && dt) {
    if (dt === 1) begin = nowMs() - 24 * 3600000;
    else if (dt === 2) begin = nowMs() - 7 * 86400000;
    else if (dt === 3) begin = nowMs() - 30 * 86400000;
    end = nowMs();
  }
  return {begin, end};
}

export function listOrders(query = {}) {
  const page = parsePage(query);
  let state = query.state;
  if (state === '' || state == null) state = null;
  else state = Number(state);
  const keyword = query.keyword ? String(query.keyword).toLowerCase() : '';
  const sampleId = query.sampleId != null && query.sampleId !== '' ? Number(query.sampleId) : null;
  const deliverId = query.deliverId != null && query.deliverId !== '' ? Number(query.deliverId) : null;
  const receiptId = query.receiptId != null && query.receiptId !== '' ? Number(query.receiptId) : null;
  const win = queryWindow(query);
  let rows = allOrders().map(presentOrder).filter(row => {
    if (state != null && !Number.isNaN(state) && Number(row.state) !== state) return false;
    if (keyword && String(row.transportNo).toLowerCase().indexOf(keyword) === -1 &&
        String(row.professionNo).toLowerCase().indexOf(keyword) === -1) return false;
    if (sampleId != null && !Number.isNaN(sampleId) && !(row.samples || []).some(s => Number(s.sampleId) === sampleId)) return false;
    if (deliverId != null && Number(row.deliverId) !== deliverId) return false;
    if (receiptId != null && Number(row.receiveId) !== receiptId) return false;
    if (!inWindow(row.createDate, win.begin, win.end) && !inWindow(row.beginTime, win.begin, win.end)) return false;
    return true;
  });
  const sortName = query.sortName || {};
  Object.keys(sortName).forEach(key => {
    const dir = sortName[key];
    if (!dir) return;
    rows = rows.slice().sort((a, b) => {
      const av = a[key] == null ? '' : a[key];
      const bv = b[key] == null ? '' : b[key];
      const cmp = String(av).localeCompare(String(bv), 'zh');
      return dir === 'desc' ? -cmp : cmp;
    });
  });
  const start = (page.pageNum - 1) * page.pageSize;
  return {list: rows.slice(start, start + page.pageSize), total: rows.length, pageNum: page.pageNum, pageSize: page.pageSize};
}

export function wxDashboard(query = {}) {
  const keyword = query.keyword ? String(query.keyword).toLowerCase() : '';
  const rows = allOrders().map(presentOrder).filter(row => {
    if (keyword && String(row.transportNo).toLowerCase().indexOf(keyword) === -1) return false;
    return inWindow(row.createDate, nowMs() - 30 * 86400000, nowMs());
  });
  return {
    allNum: rows.length,
    loadedCarNum: rows.filter(r => r.state === 1).length,
    inTransitNum: rows.filter(r => r.state === 2).length,
    arrivedNum: rows.filter(r => r.state === 3).length,
    notLoadedCarNum: rows.filter(r => r.state === 0).length
  };
}

export function webDashboard(query = {}) {
  const win = queryWindow(query.beginTime || query.endTime || query.dateType ? query : {dateType: 3});
  const rows = allOrders().map(presentOrder).filter(row => inWindow(row.createDate, win.begin, win.end));
  return {
    totalNum: rows.length,
    abnormalNum: rows.filter(r => r.tempOverrun || r.delayed).length,
    goNum: rows.filter(r => r.state === 2).length,
    alarmNum: rows.filter(r => r.tempOverrun).length
  };
}

export function getOrderDetail(id) {
  const order = allOrders().find(row => Number(row.id) === Number(id));
  return order ? presentOrder(order) : null;
}

function pushOp(order, action) {
  const operations = (order.operations || []).concat([{id: (order.operations || []).length + 1, at: fmt(nowMs()), action, userName: '演示用户'}]);
  return {...order, operations};
}

function assertTimeline(order) {
  const times = [order.createDate, order.loadingTime, order.beginTime, order.completeTime].filter(Boolean).map(parseTime);
  for (let i = 1; i < times.length; i++) {
    if (times[i] < times[i - 1]) return '时间顺序须满足创建≤装车≤发运≤送达';
  }
  return null;
}

export function createOrder(body = {}) {
  const deliverId = Number(body.deliverId);
  const receiveId = Number(body.receiveId || body.receiptId);
  if (!findUnit(deliverId) || findUnit(deliverId).types !== 0) return {ok: false, message: '未知发货单位'};
  if (!findUnit(receiveId) || findUnit(receiveId).types !== 1) return {ok: false, message: '未知收货单位'};
  const samples = Array.isArray(body.samples) ? body.samples : [];
  if (!samples.length) return {ok: false, message: '请至少添加一件货品'};
  const normalized = [];
  for (let i = 0; i < samples.length; i++) {
    const sample = findSample(samples[i].sampleId || samples[i].sampleInfoId);
    const amount = Number(samples[i].amount);
    if (!sample) return {ok: false, message: '未知货品'};
    if (!Number.isInteger(amount) || amount < 1) return {ok: false, message: '货品数量须为正整数'};
    normalized.push(sampleLine(sample.id, amount));
  }
  const created = loadCreated();
  const used = new Set(allOrders().map(row => row.id));
  let nextId = CREATED_ID_MIN;
  while (used.has(nextId) && nextId <= CREATED_ID_MAX) nextId++;
  if (nextId > CREATED_ID_MAX) return {ok: false, message: '演示运单数量已达上限'};
  const seq = String(nextId).slice(-3);
  const order = {
    id: nextId,
    transportNo: 'TO-DEMO-' + seq,
    professionNo: String(body.professionNo || '').trim() || ('PN-' + seq),
    state: 0, carId: 0, driverId: 0, deliverId, receiveId,
    createDate: fmt(nowMs()), loadingTime: '', beginTime: '', completeTime: '',
    planBeginTime: '', comment: String(body.comment || ''),
    tempOverrun: false, delayed: false, samples: normalized,
    operations: ops([{at: fmt(nowMs()), action: '创建', userName: '演示用户'}])
  };
  created.push(order);
  saveCreated(created);
  return {ok: true, items: presentOrder(order)};
}

export function updateOrder(body = {}) {
  const order = allOrders().find(row => Number(row.id) === Number(body.id));
  if (!order) return {ok: false, message: '未知运单'};
  if (Number(order.state) !== 0) return {ok: false, message: '仅待装车运单可编辑'};
  const deliverId = Number(body.deliverId || order.deliverId);
  const receiveId = Number(body.receiveId || body.receiptId || order.receiveId);
  if (!findUnit(deliverId) || findUnit(deliverId).types !== 0) return {ok: false, message: '未知发货单位'};
  if (!findUnit(receiveId) || findUnit(receiveId).types !== 1) return {ok: false, message: '未知收货单位'};
  const incoming = Array.isArray(body.samples) ? body.samples : order.samples;
  if (!incoming.length) return {ok: false, message: '请至少添加一件货品'};
  const normalized = [];
  for (let i = 0; i < incoming.length; i++) {
    const sample = findSample(incoming[i].sampleId || incoming[i].sampleInfoId);
    const amount = Number(incoming[i].amount);
    if (!sample) return {ok: false, message: '未知货品'};
    if (!Number.isInteger(amount) || amount < 1) return {ok: false, message: '货品数量须为正整数'};
    normalized.push(sampleLine(sample.id, amount));
  }
  const updated = {
    ...order,
    professionNo: String(body.professionNo || order.professionNo).trim(),
    comment: body.comment != null ? String(body.comment) : order.comment,
    deliverId,
    receiveId,
    samples: normalized
  };
  persistOrder(updated);
  return {ok: true, items: presentOrder(updated)};
}

export function allocateCar(body = {}) {
  const car = findCar(body.carId);
  const driver = findDriver(body.driverId || (car && car.driverId));
  const ids = Array.isArray(body.orderIds) ? body.orderIds.map(Number) : [];
  if (!car) return {ok: false, message: '未知车辆'};
  if (!driver) return {ok: false, message: '未知司机'};
  if (!ids.length) return {ok: false, message: '请选择运单'};
  const occupiedCars = occupiedCarIds();
  const occupiedDrivers = occupiedDriverIds();
  const snapshot = allOrders();
  for (let i = 0; i < ids.length; i++) {
    const order = snapshot.find(row => Number(row.id) === ids[i]);
    if (!order) return {ok: false, message: '未知运单'};
    if (Number(order.state) !== 0) return {ok: false, message: '仅待装车运单可分配车辆'};
    if (occupiedCars.has(car.id) && Number(order.carId) !== car.id) return {ok: false, message: '该车辆运输中，送达前不可再分配'};
    if (occupiedDrivers.has(driver.id) && Number(order.driverId) !== driver.id) return {ok: false, message: '该司机运输中，送达前不可再分配'};
  }
  ids.forEach(id => {
    const order = snapshot.find(row => Number(row.id) === id);
    persistOrder(pushOp({...order, carId: car.id, driverId: driver.id}, '分配车辆'));
  });
  return {ok: true, items: true};
}

function changeOne(order, nextState) {
  const current = Number(order.state);
  if (nextState === current) return {ok: false, message: '重复操作'};
  if (nextState === 1) {
    if (current !== 0) return {ok: false, message: '禁止跳状态装车'};
    if (!order.carId || !order.driverId) return {ok: false, message: '未分配车辆或司机，不能装车'};
    const next = pushOp({...order, state: 1, loadingTime: fmt(nowMs())}, '装车');
    const err = assertTimeline(next);
    if (err) return {ok: false, message: err};
    return {ok: true, order: next};
  }
  if (nextState === 2) {
    if (current !== 1) return {ok: false, message: '禁止跳状态发运'};
    if (!order.carId || !order.driverId) return {ok: false, message: '未分配车辆或司机，不能发运'};
    // 分配后资源可能被其他运输占用，发运时再次校验，不能只在分配时检查。
    if (allOrders().some(row => Number(row.state) === 2 && Number(row.carId) === Number(order.carId))) {
      return {ok: false, message: '该车辆正在运输，不能再次发运'};
    }
    if (allOrders().some(row => Number(row.state) === 2 && Number(row.driverId) === Number(order.driverId))) {
      return {ok: false, message: '该司机正在运输，不能再次发运'};
    }
    const next = pushOp({...order, state: 2, beginTime: fmt(nowMs())}, '发运');
    const err = assertTimeline(next);
    if (err) return {ok: false, message: err};
    return {ok: true, order: next};
  }
  if (nextState === 3) {
    if (current !== 2) return {ok: false, message: '禁止跳状态送达'};
    const next = pushOp({...order, state: 3, completeTime: fmt(nowMs())}, '送达');
    const err = assertTimeline(next);
    if (err) return {ok: false, message: err};
    return {ok: true, order: next};
  }
  return {ok: false, message: '非法状态'};
}

export function changeState(body = {}) {
  const ids = Array.isArray(body.ids) ? body.ids.map(Number) : [];
  const nextState = Number(body.state);
  if (!ids.length) return {ok: false, message: '请选择运单'};
  if (![1, 2, 3].includes(nextState)) return {ok: false, message: '非法状态'};
  const snapshot = allOrders();
  const planned = [];
  for (let i = 0; i < ids.length; i++) {
    const order = snapshot.find(row => Number(row.id) === ids[i]);
    if (!order) return {ok: false, message: '未知运单'};
    const result = changeOne(order, nextState);
    if (!result.ok) return result;
    planned.push(result.order);
  }
  planned.forEach(persistOrder);
  return {ok: true, items: true};
}

export function getStateInfo(params = {}) {
  const carId = Number(params.carId);
  const car = findCar(carId);
  if (!car) return {ok: false, message: '未知车辆'};
  const list = allOrders().filter(row => Number(row.carId) === carId && Number(row.state) === 1).map(presentOrder);
  if (!list.length) return {ok: false, message: '该车辆没有已装车运单'};
  const driver = findDriver(list[0].driverId);
  return {
    ok: true,
    items: {
      carBoard: car.carBoard,
      driverName: driver ? driver.driverName : '',
      driverTel: driver ? driver.tel : '',
      simpleEquipmentVO: sensorsOf(list[0]),
      transportOrderStartListVos: list.map(row => ({
        id: row.id, transportNo: row.transportNo, deliverName: row.deliverName, receiveName: row.receiveName
      }))
    }
  };
}

export function changeDriver(body = {}) {
  const order = allOrders().find(row => Number(row.id) === Number(body.orderId));
  const driver = findDriver(body.driverId);
  if (!order) return {ok: false, message: '未知运单'};
  if (!driver) return {ok: false, message: '未知司机'};
  if (Number(order.state) !== 0) return {ok: false, message: '仅待装车可更换司机'};
  if (occupiedDriverIds(order.id).has(driver.id)) return {ok: false, message: '该司机运输中，送达前不可再分配'};
  persistOrder(pushOp({...order, driverId: driver.id}, '更换司机'));
  return {ok: true, items: true};
}

export function deleteOrders() {
  return {ok: false, message: '演示未开放删除运单'};
}

export function listDrivers() {
  return DEMO_DRIVERS.map(item => ({...item}));
}

export function listCars(query = {}) {
  const page = parsePage(query);
  const keyword = query.carBoard ? String(query.carBoard) : '';
  const occupied = occupiedCarIds();
  let rows = DEMO_CARS.map(car => {
    const driver = findDriver(car.driverId);
    return {
      ...car,
      driverName: driver ? driver.driverName : '',
      tel: driver ? driver.tel : '',
      carState: occupied.has(car.id) ? 1 : 0
    };
  }).filter(row => !keyword || row.carBoard.indexOf(keyword) !== -1);
  const start = (page.pageNum - 1) * page.pageSize;
  return {list: rows.slice(start, start + page.pageSize), total: rows.length, pageNum: page.pageNum, pageSize: page.pageSize};
}

export function listSamples(query = {}) {
  const keyword = String((query && (query.keyWord || query.keyword || query.key)) || '').toLowerCase();
  return DEMO_SAMPLES.filter(item => !keyword || item.sampleName.toLowerCase().indexOf(keyword) !== -1 || item.sampleNo.toLowerCase().indexOf(keyword) !== -1)
    .map(item => ({...item}));
}

export function listAddresses(query = {}) {
  const types = query.types == null || query.types === '' ? null : Number(query.types);
  const keyword = String((query && (query.keyWord || query.keyword)) || '');
  return DEMO_UNITS.filter(item => (types == null || item.types === types) && (!keyword || item.receiptDeliverUserName.indexOf(keyword) !== -1))
    .map(item => ({...item}));
}

function syntheticPoints(order, intervalMin) {
  const start = parseTime(order.beginTime || order.loadingTime || order.createDate);
  const end = parseTime(order.completeTime) || nowMs();
  // 限制采样数量时仍覆盖全程，避免只截取开头而漏掉超温段。
  const step = Math.max(Math.max(1, Number(intervalMin) || 30) * 60000, Math.ceil((end - start) / 23));
  const points = [];
  for (let t = start; t <= end && points.length < 24; t += step) {
    const ratio = (t - start) / Math.max(end - start, 1);
    const base = order.tempOverrun ? 5 + ratio * 4.4 : 4.2 + ratio;
    points.push({t: fmt(t), temp: Number(base.toFixed(1)), hum: 55, lng: 116.39 + ratio * 0.08, lat: 39.90 + ratio * 0.04});
  }
  if (points.length && points[points.length - 1].t !== fmt(end)) {
    points.push({t: fmt(end), temp: currentTemp(order), hum: 55, lng: 116.47, lat: 39.94});
  }
  if (!points.length) points.push({t: fmt(nowMs()), temp: currentTemp(order), hum: 55, lng: 116.39, lat: 39.90});
  return points;
}

export function monitorGps(params = {}) {
  const order = getOrderDetail(params.orderId || params.objId || params.id);
  if (!order) return {ok: false, message: '未知运单'};
  const points = syntheticPoints(order, params.historyTimeInterval);
  return {
    ok: true,
    items: {
      list: points.map((p, i) => ({id: i + 1, createDate: p.t, longitude: p.lng, latitude: p.lat, transportNo: order.transportNo, professionNo: order.professionNo, carBoard: order.carBoard, objId: order.id})),
      total: points.length
    }
  };
}

export function historyAlarms(query = {}) {
  const page = parsePage(query);
  const win = queryWindow(query);
  const rows = allOrders().filter(row => row.tempOverrun && inWindow(row.beginTime || row.createDate, win.begin, win.end)).map(row => {
    const view = presentOrder(row);
    return {
      objId: row.id, transportNo: row.transportNo, professionNo: row.professionNo, carBoard: view.carBoard,
      monitorNormalMin: TEMP_MIN, monitorNormalMax: TEMP_MAX, unit: '℃', monitorSensorVal: 9.4,
      durationFormat: '1小时', alarmStartTime: row.beginTime || row.createDate, monitorAlarmEndTime: row.completeTime || '',
      createDate: row.beginTime || row.createDate
    };
  });
  const start = (page.pageNum - 1) * page.pageSize;
  return {list: rows.slice(start, start + page.pageSize), total: rows.length};
}

export function monitorSeries(query = {}) {
  const order = getOrderDetail(query.objId);
  if (!order) return null;
  const sensor = order.sensors.find(item => Number(item.id) === Number(query.objSensorId) && item.monitorSensorCatId !== 12);
  if (!sensor) return null;
  const win = queryWindow(query);
  return syntheticPoints(order, query.historyTimeInterval).filter(point => inWindow(point.t, win.begin, win.end))
    .map((point, i) => ({id: i + 1, createDate: point.t, data: sensor.monitorSensorId === 2 ? point.hum : point.temp}));
}

export function historyData(query = {}) {
  const inTransit = allOrders().find(row => Number(row.state) === 2) || allOrders()[0];
  const points = syntheticPoints(inTransit, query.historyTimeInterval || 30);
  return {
    columns: ['时间', '温度'],
    rows: points.map(p => ({时间: p.t, 温度: p.temp}))
  };
}

export function indexGpsPage(query = {}) {
  const page = parsePage(query);
  const rows = [];
  allOrders().filter(row => Number(row.state) >= 2).forEach(row => {
    syntheticPoints(row, 60).forEach((p, i) => {
      rows.push({
        objId: row.id, transportNo: row.transportNo, professionNo: row.professionNo,
        carBoard: presentOrder(row).carBoard, longitude: p.lng, latitude: p.lat, createDate: p.t, id: row.id * 100 + i
      });
    });
  });
  const start = (page.pageNum - 1) * page.pageSize;
  return {list: rows.slice(start, start + page.pageSize), total: rows.length};
}

export function indexOrderList(query = {}) {
  const keyword = String((query && query.keyword) || '').toLowerCase();
  const grouped = {};
  allOrders().filter(row => Number(row.state) >= 1 && row.carId).forEach(row => {
    const view = presentOrder(row);
    if (query.professionNo && view.professionNo.indexOf(query.professionNo) === -1) return;
    if (query.carBoard && view.carBoard.indexOf(query.carBoard) === -1) return;
    if (keyword && view.driverName.toLowerCase().indexOf(keyword) === -1 && String(view.driverTel).indexOf(keyword) === -1) return;
    if (query.state != null && query.state !== '' && Number(row.state) !== Number(query.state)) return;
    if (!grouped[row.carId]) {
      grouped[row.carId] = {carId: row.carId, carBoard: view.carBoard, driverName: view.driverName, beginTime: view.beginTime, orderInfoVos: []};
    }
    grouped[row.carId].orderInfoVos.push({
      orderId: row.id, transportNo: row.transportNo, state: row.state, time: view.beginTime || view.loadingTime,
      sensorDate: [{name: '温度', date: currentTemp(row) + ' ℃'}, {name: '湿度', date: '55 %RH'}]
    });
  });
  return Object.keys(grouped).map(key => grouped[key]);
}

export function indexGpsTrack(query = {}) {
  const carId = Number(query.carId);
  const orderId = Number(query.orderId);
  const target = allOrders().find(row => (orderId && Number(row.id) === orderId) || (carId && Number(row.carId) === carId && Number(row.state) === 2))
    || allOrders().find(row => Number(row.state) === 2);
  if (!target) return {gps: [], orderGPS: []};
  const points = syntheticPoints(target, 20);
  return {
    gps: points.map(p => [p.lng, p.lat]),
    orderGPS: points.map(p => ({lng: p.lng, lat: p.lat, time: p.t, simulated: true}))
  };
}

export function printBundle(body = {}) {
  const ids = Array.isArray(body.orderIds) ? body.orderIds.map(Number) : (body.orderId ? [Number(body.orderId)] : []);
  if (!ids.length) return {ok: false, message: '请选择运单'};
  const datas = [];
  for (let i = 0; i < ids.length; i++) {
    const order = getOrderDetail(ids[i]);
    if (!order) return {ok: false, message: '未知运单'};
    const points = syntheticPoints(order, body.historyTimeInterval || 15);
    const temps = points.map(p => p.temp);
    datas.push({
      transportNo: order.transportNo,
      professionNo: order.professionNo,
      printDate: fmt(nowMs()),
      beginTime: order.beginTime,
      completeTime: order.completeTime,
      loadingTime: order.loadingTime,
      alarmMin: TEMP_MIN,
      alarmMax: TEMP_MAX,
      maxTemperature: Math.max.apply(null, temps),
      maxTemperatureDate: points[temps.indexOf(Math.max.apply(null, temps))].t,
      minTemperature: Math.min.apply(null, temps),
      minTemperatureDate: points[temps.indexOf(Math.min.apply(null, temps))].t,
      demoVoucher: true,
      watermark: '演示凭证，非签收签名',
      sensorData: [
        {key: '时间', values: points.map(p => p.t.slice(11, 16))},
        {key: '温度℃', values: temps},
        {key: '湿度%RH', values: points.map(() => 55)}
      ]
    });
  }
  return {ok: true, items: datas};
}

export function wxList(query = {}) {
  const mapped = {...query};
  if (Number(mapped.state) === 0) mapped.state = null;
  return listOrders(mapped);
}
