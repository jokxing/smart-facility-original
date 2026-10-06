/**
 * Mini program transport mock. Same IDs/states as Web; local storage only.
 * List query state=0 means ALL. Entity 0 is waiting to load.
 */
var storage = require('./storage.js');
var seeds = require('./seeds.js');

var STATE_KEY = 'transportState';
var CREATED_KEY = 'transportCreated';
var PAGE_MAX = 50;
var TEMP_MIN = 2;
var TEMP_MAX = 8;

function nowMs() { return seeds.DEMO_NOW_MS; }
function fmt(ms) { return seeds.formatDemoDateTime(ms); }
function at(daysAgo, hour) {
	hour = hour == null ? 9 : hour;
	return fmt(nowMs() - daysAgo * 86400000 + (hour - 12) * 3600000);
}
function parseTime(value) {
	if (!value) return NaN;
	var n = Date.parse(String(value).replace(' ', 'T') + '+08:00');
	return Number.isFinite(n) ? n : Date.parse(String(value));
}
function readJson(key, fallback) {
	var raw = storage.getDemo(key);
	if (!raw) return fallback;
	if (typeof raw === 'object') return raw;
	try { return JSON.parse(raw); } catch (e) { return fallback; }
}
function writeJson(key, value) { storage.setDemo(key, JSON.stringify(value)); }
function clone(row) { return JSON.parse(JSON.stringify(row)); }

var DEMO_DRIVERS = [
	{id: 883001, driverName: '演示司机甲', tel: '13800001001'},
	{id: 883002, driverName: '演示司机乙', tel: '13800001002'},
	{id: 883003, driverName: '演示司机丙', tel: '13800001003'}
];
var DEMO_CARS = [
	{id: 882001, carBoard: '京A·D88001', driverId: 883001},
	{id: 882002, carBoard: '京A·D88002', driverId: 883002},
	{id: 882003, carBoard: '京A·D88003', driverId: 883003}
];
var DEMO_UNITS = [
	{id: 884001, types: 0, receiptDeliverUserName: '演示发货站', address: '演示省演示市演示区发货路1号'},
	{id: 884002, types: 1, receiptDeliverUserName: '演示收货站', address: '演示省演示市演示区收货路8号'}
];
var DEMO_SAMPLES = [
	{id: 885001, sampleNo: 'S-001', sampleName: '演示试剂盒', unitName: '箱', specification: '10支/箱', productionBatch: 'B-2026-01'},
	{id: 885002, sampleNo: 'S-002', sampleName: '演示冷链样本', unitName: '件', specification: '2kg/件', productionBatch: 'B-2026-02'}
];

function sampleLine(sampleId, amount) {
	var s = findById(DEMO_SAMPLES, sampleId);
	return {sampleId: sampleId, amount: amount, sampleNo: s.sampleNo, sampleName: s.sampleName, unitName: s.unitName, specification: s.specification, productionBatch: s.productionBatch};
}
function findById(list, id) {
	for (var i = 0; i < list.length; i++) if (list[i].id === Number(id)) return list[i];
	return null;
}
function ops(rows) {
	return rows.map(function (row, i) { return {id: i + 1, at: row.at, action: row.action, userName: row.userName}; });
}

function seedOrders() {
	return [
		{id: 881001, transportNo: 'TO-DEMO-001', professionNo: 'PN-001', state: 0, carId: 0, driverId: 0, deliverId: 884001, receiveId: 884002, createDate: at(12, 9), loadingTime: '', beginTime: '', completeTime: '', planBeginTime: at(1, 8), comment: '待装车，未分配车辆。', tempOverrun: false, delayed: false, samples: [sampleLine(885001, 2)], operations: ops([{at: at(12, 9), action: '创建', userName: '演示用户'}])},
		{id: 881002, transportNo: 'TO-DEMO-002', professionNo: 'PN-002', state: 0, carId: 0, driverId: 0, deliverId: 884001, receiveId: 884002, createDate: at(11, 10), loadingTime: '', beginTime: '', completeTime: '', planBeginTime: at(0, 14), comment: '待装车。', tempOverrun: false, delayed: false, samples: [sampleLine(885002, 1)], operations: ops([{at: at(11, 10), action: '创建', userName: '演示用户'}])},
		{id: 881003, transportNo: 'TO-DEMO-003', professionNo: 'PN-003', state: 1, carId: 882002, driverId: 883002, deliverId: 884001, receiveId: 884002, createDate: at(3, 8), loadingTime: at(0, 8), beginTime: '', completeTime: '', planBeginTime: at(0, 13), comment: '已装车，可发运。', tempOverrun: false, delayed: false, samples: [sampleLine(885001, 3)], operations: ops([{at: at(3, 8), action: '创建', userName: '演示用户'}, {at: at(0, 8), action: '装车', userName: '演示用户'}])},
		{id: 881004, transportNo: 'TO-DEMO-004', professionNo: 'PN-004', state: 2, carId: 882001, driverId: 883001, deliverId: 884001, receiveId: 884002, createDate: at(4, 8), loadingTime: at(0, 6), beginTime: at(0, 7), completeTime: '', planBeginTime: at(0, 7), comment: '运输中，温度正常。', tempOverrun: false, delayed: false, samples: [sampleLine(885001, 1), sampleLine(885002, 2)], operations: ops([{at: at(4, 8), action: '创建', userName: '演示用户'}, {at: at(0, 7), action: '发运', userName: '演示用户'}])},
		{id: 881005, transportNo: 'TO-DEMO-005', professionNo: 'PN-005', state: 2, carId: 882001, driverId: 883001, deliverId: 884001, receiveId: 884002, createDate: at(4, 8), loadingTime: at(0, 6), beginTime: at(0, 7), completeTime: '', planBeginTime: at(0, 7), comment: '运输中，温度超限。', tempOverrun: true, delayed: false, samples: [sampleLine(885002, 4)], operations: ops([{at: at(4, 8), action: '创建', userName: '演示用户'}, {at: at(0, 7), action: '发运', userName: '演示用户'}])},
		{id: 881006, transportNo: 'TO-DEMO-006', professionNo: 'PN-006', state: 2, carId: 882003, driverId: 883003, deliverId: 884001, receiveId: 884002, createDate: at(2, 9), loadingTime: at(1, 15), beginTime: at(0, 11), completeTime: '', planBeginTime: at(1, 8), comment: '运输中，相对计划发运延迟。', tempOverrun: false, delayed: true, samples: [sampleLine(885001, 2)], operations: ops([{at: at(2, 9), action: '创建', userName: '演示用户'}, {at: at(0, 11), action: '发运', userName: '演示用户'}])},
		{id: 881007, transportNo: 'TO-DEMO-007', professionNo: 'PN-007', state: 3, carId: 882001, driverId: 883001, deliverId: 884001, receiveId: 884002, createDate: at(10, 9), loadingTime: at(9, 10), beginTime: at(9, 11), completeTime: at(8, 16), planBeginTime: at(9, 11), comment: '已送达。', tempOverrun: false, delayed: false, samples: [sampleLine(885001, 1)], operations: ops([{at: at(10, 9), action: '创建', userName: '演示用户'}, {at: at(8, 16), action: '送达', userName: '演示用户'}])},
		{id: 881008, transportNo: 'TO-DEMO-008', professionNo: 'PN-008', state: 3, carId: 882002, driverId: 883002, deliverId: 884001, receiveId: 884002, createDate: at(8, 9), loadingTime: at(7, 10), beginTime: at(7, 11), completeTime: at(6, 15), planBeginTime: at(7, 11), comment: '已送达，运输中曾超温。', tempOverrun: true, delayed: false, samples: [sampleLine(885002, 2)], operations: ops([{at: at(8, 9), action: '创建', userName: '演示用户'}, {at: at(6, 15), action: '送达', userName: '演示用户'}])},
		{id: 881009, transportNo: 'TO-DEMO-009', professionNo: 'PN-009', state: 1, carId: 882002, driverId: 883002, deliverId: 884001, receiveId: 884002, createDate: at(3, 8), loadingTime: at(0, 8), beginTime: '', completeTime: '', planBeginTime: at(0, 13), comment: '与 TO-DEMO-003 同车待发。', tempOverrun: false, delayed: false, samples: [sampleLine(885002, 1)], operations: ops([{at: at(3, 8), action: '创建', userName: '演示用户'}, {at: at(0, 8), action: '装车', userName: '演示用户'}])},
		{id: 881010, transportNo: 'TO-DEMO-010', professionNo: 'PN-010', state: 0, carId: 0, driverId: 0, deliverId: 884001, receiveId: 884002, createDate: at(1, 16), loadingTime: '', beginTime: '', completeTime: '', planBeginTime: at(0, 18), comment: '待装车。', tempOverrun: false, delayed: false, samples: [sampleLine(885001, 5)], operations: ops([{at: at(1, 16), action: '创建', userName: '演示用户'}])}
	];
}

function allOrders() {
	var overlay = readJson(STATE_KEY, {}) || {};
	var created = readJson(CREATED_KEY, []) || [];
	var seedsList = seedOrders().map(function (row) {
		var extra = overlay[String(row.id)];
		return extra ? Object.assign({}, row, extra) : row;
	});
	return seedsList.concat(Array.isArray(created) ? created : []);
}

function persist(order) {
	if (Number(order.id) >= 881101) {
		var created = (readJson(CREATED_KEY, []) || []).map(function (row) {
			return Number(row.id) === Number(order.id) ? order : row;
		});
		writeJson(CREATED_KEY, created);
		return;
	}
	var overlay = readJson(STATE_KEY, {}) || {};
	overlay[String(order.id)] = {
		state: order.state, carId: order.carId, driverId: order.driverId,
		loadingTime: order.loadingTime, beginTime: order.beginTime, completeTime: order.completeTime,
		operations: order.operations, tempOverrun: order.tempOverrun, delayed: order.delayed
	};
	writeJson(STATE_KEY, overlay);
}

function resetDemoTransport() {
	storage.removeDemo(STATE_KEY);
	storage.removeDemo(CREATED_KEY);
}

function currentTemp(order) {
	if (Number(order.state) < 2) return 5.0;
	return order.tempOverrun ? 9.4 : 5.2;
}

function sensorsOf(order) {
	var val = currentTemp(order);
	var overrun = val > TEMP_MAX || val < TEMP_MIN;
	return [
		{id: order.id * 10 + 1, monitorSensorCatId: 3, monitorSensorId: 1, monitorSensorName: '温度', sensorAlias: '温度', unit: '℃', monitorSensorVal: val, normalMin: TEMP_MIN, normalMax: TEMP_MAX, normalCat: 3, activateFlag: overrun ? 1 : 0, monitorFlag: 1},
		{id: order.id * 10 + 2, monitorSensorCatId: 3, monitorSensorId: 2, monitorSensorName: '湿度', sensorAlias: '湿度', unit: '%RH', monitorSensorVal: 55, normalMin: 30, normalMax: 80, normalCat: 3, activateFlag: 0, monitorFlag: 1},
		{id: order.id * 10 + 3, monitorSensorCatId: 12, monitorSensorId: 12, monitorSensorName: '定位', sensorAlias: '定位', unit: '', gps: '模拟轨迹（演示）', activateFlag: 0, monitorFlag: 1, monitorSensorVal: null}
	];
}

function present(order) {
	var car = findById(DEMO_CARS, order.carId);
	var driver = findById(DEMO_DRIVERS, order.driverId);
	var deliver = findById(DEMO_UNITS, order.deliverId);
	var receive = findById(DEMO_UNITS, order.receiveId);
	return Object.assign({}, order, {
		carBoard: car ? car.carBoard : '',
		driverName: driver ? driver.driverName : '',
		driverTel: driver ? driver.tel : '',
		deliverName: deliver ? deliver.receiptDeliverUserName : '',
		deliverAddress: deliver ? deliver.address : '',
		receiveName: receive ? receive.receiptDeliverUserName : '',
		receiveAddress: receive ? receive.address : '',
		sampleInfos: order.samples || [],
		sensors: sensorsOf(order)
	});
}

function parsePage(data) {
	var pageNum = Number(data && (data.pageNum || data.currentPage));
	var pageSize = Number(data && data.pageSize);
	if (!Number.isFinite(pageNum) || pageNum < 1) pageNum = 1;
	if (!Number.isFinite(pageSize) || pageSize < 1) pageSize = 10;
	if (pageSize > PAGE_MAX) pageSize = PAGE_MAX;
	return {pageNum: Math.floor(pageNum), pageSize: Math.floor(pageSize)};
}

function listOrders(query) {
	query = query || {};
	var page = parsePage(query);
	var state = query.state;
	if (state === '' || state == null || Number(state) === 0) state = null;
	else state = Number(state);
	var keyword = query.keyword ? String(query.keyword).toLowerCase() : '';
	var rows = allOrders().map(present).filter(function (row) {
		if (state != null && !Number.isNaN(state) && Number(row.state) !== state) return false;
		if (keyword && String(row.transportNo).toLowerCase().indexOf(keyword) === -1 && String(row.professionNo).toLowerCase().indexOf(keyword) === -1) return false;
		return true;
	});
	var start = (page.pageNum - 1) * page.pageSize;
	return {list: rows.slice(start, start + page.pageSize), total: rows.length, pageNum: page.pageNum, pageSize: page.pageSize};
}

function dashboard(query) {
	var keyword = query && query.keyword ? String(query.keyword).toLowerCase() : '';
	var rows = allOrders().map(present).filter(function (row) {
		if (keyword && String(row.transportNo).toLowerCase().indexOf(keyword) === -1 && String(row.professionNo).toLowerCase().indexOf(keyword) === -1) return false;
		return true;
	});
	return {
		allNum: rows.length,
		loadedCarNum: rows.filter(function (r) { return r.state === 1; }).length,
		inTransitNum: rows.filter(function (r) { return r.state === 2; }).length,
		arrivedNum: rows.filter(function (r) { return r.state === 3; }).length,
		notLoadedCarNum: rows.filter(function (r) { return r.state === 0; }).length
	};
}

function getDetail(id) {
	var order = null;
	var list = allOrders();
	for (var i = 0; i < list.length; i++) if (Number(list[i].id) === Number(id)) order = list[i];
	return order ? present(order) : null;
}

function pushOp(order, action) {
	var operations = (order.operations || []).concat([{id: (order.operations || []).length + 1, at: fmt(nowMs()), action: action, userName: '演示用户'}]);
	return Object.assign({}, order, {operations: operations});
}

function assertTimeline(order) {
	var times = [order.createDate, order.loadingTime, order.beginTime, order.completeTime].filter(Boolean).map(parseTime);
	for (var i = 1; i < times.length; i++) {
		if (times[i] < times[i - 1]) return '时间顺序须满足创建≤装车≤发运≤送达';
	}
	return null;
}

function changeOne(order, nextState) {
	var current = Number(order.state);
	if (nextState === current) return {ok: false, message: '重复操作'};
	if (nextState === 2) {
		if (current !== 1) return {ok: false, message: '禁止跳状态发运'};
		if (!order.carId || !order.driverId) return {ok: false, message: '未分配车辆或司机，不能发运'};
		if (allOrders().some(function (row) { return Number(row.state) === 2 && (Number(row.carId) === Number(order.carId) || Number(row.driverId) === Number(order.driverId)); })) {
			return {ok: false, message: '车辆或司机正在运输，不能再次发运'};
		}
		if (allOrders().some(function (row) { return Number(row.state) === 2 && (Number(row.carId) === Number(order.carId) || Number(row.driverId) === Number(order.driverId)); })) {
			return {ok: false, message: '车辆或司机正在运输，不能再次发运'};
		}
		var departed = pushOp(Object.assign({}, order, {state: 2, beginTime: fmt(nowMs())}), '发运');
		var err = assertTimeline(departed);
		if (err) return {ok: false, message: err};
		return {ok: true, order: departed};
	}
	if (nextState === 3) {
		if (current !== 2) return {ok: false, message: '禁止跳状态送达'};
		var arrived = pushOp(Object.assign({}, order, {state: 3, completeTime: fmt(nowMs())}), '送达');
		var terr = assertTimeline(arrived);
		if (terr) return {ok: false, message: terr};
		return {ok: true, order: arrived};
	}
	if (nextState === 1) return {ok: false, message: '小程序演示不开放装车，请在 SaaS 创建并装车'};
	return {ok: false, message: '非法状态'};
}

function changeState(data) {
	var ids = (data && data.ids) || [];
	var nextState = Number(data && data.state);
	if (!ids.length) return {ok: false, message: '请选择运单'};
	var snapshot = allOrders();
	var planned = [];
	for (var i = 0; i < ids.length; i++) {
		var order = null;
		for (var j = 0; j < snapshot.length; j++) if (Number(snapshot[j].id) === Number(ids[i])) order = snapshot[j];
		if (!order) return {ok: false, message: '未知运单'};
		var result = changeOne(order, nextState);
		if (!result.ok) return result;
		planned.push(result.order);
	}
	planned.forEach(persist);
	return {ok: true, items: true};
}

function getStateInfo(data) {
	var carId = Number(data && data.carId);
	var car = findById(DEMO_CARS, carId);
	if (!car) return {ok: false, message: '未知车辆'};
	var list = allOrders().filter(function (row) { return Number(row.carId) === carId && Number(row.state) === 1; }).map(present);
	if (!list.length) return {ok: false, message: '该车辆没有已装车运单'};
	var driver = findById(DEMO_DRIVERS, list[0].driverId);
	return {
		ok: true,
		items: {
			carBoard: car.carBoard,
			driverName: driver ? driver.driverName : '',
			driverTel: driver ? driver.tel : '',
			simpleEquipmentVO: sensorsOf(list[0]),
			transportOrderStartListVos: list.map(function (row) {
				return {id: row.id, transportNo: row.transportNo, deliverName: row.deliverName, receiveName: row.receiveName};
			})
		}
	};
}

function printView(id, interval) {
	var order = getDetail(id);
	if (!order) return {ok: false, message: '未知运单'};
	var val = currentTemp(order);
	return {
		ok: true,
		items: {
			loadingTime: order.loadingTime,
			beginTime: order.beginTime,
			completeTime: order.completeTime,
			alarmMin: TEMP_MIN,
			alarmMax: TEMP_MAX,
			maxTemperature: order.tempOverrun ? 9.4 : val,
			maxTemperatureDate: order.beginTime || order.createDate,
			minTemperature: 4.2,
			minTemperatureDate: order.createDate,
			demoVoucher: true,
			watermark: '演示凭证，非签收签名',
			sensorData: [
				{key: '时间', values: ['10:00', '10:30', '11:00']},
				{key: '温度℃', values: [5.0, val, val]},
				{key: '湿度%RH', values: [55, 55, 55]}
			]
		}
	};
}

module.exports = {
	listOrders: listOrders,
	dashboard: dashboard,
	getDetail: getDetail,
	changeState: changeState,
	getStateInfo: getStateInfo,
	printView: printView,
	resetDemoTransport: resetDemoTransport
};
