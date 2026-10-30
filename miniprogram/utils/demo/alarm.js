var storage = require('./storage.js');
var session = require('./session.js');
var seeds = require('./seeds.js');

var HANDLE_KEY = 'alarmHandles';
var MESSAGE_KEY = 'alarmMessages';
var RESPONSIBLE_KEY = 'responsible';
var FLAG_KEY = 'alarmFlags';
var DEFAULT_HEAD_ID = 900001;
var LIVE_EVENT_ID = 990008;
var ALLOWED_ERROR_TYPES = {1: 1, 2: 1, 3: 1};
var PAGE_SIZE_MAX = 50;
var DUP_WINDOW_MS = 400;
var lastOp = {key: '', at: 0};

var DEMO_STAFF = [
	{id: 900001, name: '演示用户', loginId: 'demo', departmentId: 900101, departmentName: '演示运维部', tel: '13800000001'},
	{id: 900002, name: '演示运维员', loginId: 'ops', departmentId: 900101, departmentName: '演示运维部', tel: '13800000002'},
	{id: 900003, name: '演示研发员', loginId: 'rd', departmentId: 900102, departmentName: '演示研发部', tel: '13800000003'}
];

var ERROR_TYPES = [
	{id: 1, name: '演示误报'},
	{id: 2, name: '演示设备维护'},
	{id: 3, name: '演示环境波动'}
];

function parseJson(key, fallback) {
	var raw = storage.getDemo(key, '');
	if (!raw) return fallback;
	if (typeof raw === 'object') return raw;
	try {
		return JSON.parse(raw);
	} catch (e) {
		return fallback;
	}
}

function writeJson(key, value) {
	storage.setDemo(key, JSON.stringify(value));
}

function parsePage(data) {
	var pageNum = Number(data && (data.pageNum || data.currentPage));
	var pageSize = Number(data && data.pageSize);
	if (!Number.isFinite(pageNum) || pageNum < 1) pageNum = 1;
	if (!Number.isFinite(pageSize) || pageSize < 1) pageSize = 10;
	if (pageSize > PAGE_SIZE_MAX) pageSize = PAGE_SIZE_MAX;
	return {pageNum: Math.floor(pageNum), pageSize: Math.floor(pageSize)};
}

function guardDup(key) {
	var at = Date.now();
	if (lastOp.key === key && at - lastOp.at < DUP_WINDOW_MS) return {ok: false, message: '请勿重复提交'};
	lastOp = {key: key, at: at};
	return null;
}

function normalizeThingsType(type) {
	var n = Number(type);
	if (n === 11) return 3;
	return n;
}

function objTypeOf(miniThingsType) {
	var n = normalizeThingsType(miniThingsType);
	if (n === 4) return 2;
	if (n === 3) return 3;
	return n;
}

function miniTypeOfObj(objType) {
	var n = Number(objType);
	if (n === 2) return 4;
	if (n === 3) return 3;
	return n;
}

function staffName(id) {
	var hit = DEMO_STAFF.filter(function (row) { return row.id === Number(id); })[0];
	return hit ? hit.name : '演示用户';
}

function isResponsible(kind, entityId, userId) {
	var uid = userId == null ? (session.currentUser() || seeds.DEMO_USER).id : userId;
	var map = parseJson(RESPONSIBLE_KEY, {});
	var key = kind + ':' + Number(entityId);
	var head = map[key] != null ? Number(map[key]) : DEFAULT_HEAD_ID;
	return Number(head) === Number(uid);
}

function headId(kind, entityId) {
	var map = parseJson(RESPONSIBLE_KEY, {});
	var key = kind + ':' + Number(entityId);
	return map[key] != null ? Number(map[key]) : DEFAULT_HEAD_ID;
}

function setResponsible(kind, entityId, userId) {
	if (!DEMO_STAFF.filter(function (row) { return row.id === Number(userId); }).length) {
		return {ok: false, message: '未知负责人'};
	}
	if (kind === 'instrument' && !seeds.DEMO_INSTRUMENTS.filter(function (row) { return row.id === Number(entityId); }).length) {
		return {ok: false, message: '未知设备'};
	}
	if (kind === 'room' && !seeds.findRoom(entityId)) return {ok: false, message: '未知房间'};
	var map = parseJson(RESPONSIBLE_KEY, {});
	map[kind + ':' + Number(entityId)] = Number(userId);
	writeJson(RESPONSIBLE_KEY, map);
	return {ok: true};
}

function plusHour(at) {
	var ms = Date.parse(String(at).replace(' ', 'T') + '+08:00');
	if (!Number.isFinite(ms)) return at;
	return seeds.formatDemoDateTime(ms + 3600000);
}

function historicalEvents() {
	var instrumentRows = [
		{id: 960001, thingsId: 970001, thingsName: '演示培养箱', sensorId: 101, sensorName: '演示温度', at: '2026-09-23 10:00:00', humidity: false},
		{id: 960002, thingsId: 970001, thingsName: '演示培养箱', sensorId: 101, sensorName: '演示温度', at: '2026-09-22 10:00:00', humidity: false},
		{id: 960003, thingsId: 970001, thingsName: '演示培养箱', sensorId: 101, sensorName: '演示温度', at: '2026-09-21 10:00:00', humidity: false},
		{id: 960004, thingsId: 970002, thingsName: '演示冷藏柜', sensorId: 102, sensorName: '演示湿度', at: '2026-09-22 12:00:00', humidity: true},
		{id: 960005, thingsId: 970003, thingsName: '演示温湿度仪', sensorId: 101, sensorName: '演示温度', at: '2026-09-05 12:00:00', humidity: false}
	].map(function (row) {
		return Object.assign({miniType: 4, objType: 2, live: false}, row, {
			end: plusHour(row.at),
			value: row.humidity ? '85.0' : '42.0',
			min: row.humidity ? 30 : 0,
			max: row.humidity ? 70 : 40
		});
	});
	var roomRows = [
		{id: 961001, thingsId: 950001, thingsName: '演示房间 A', sensorId: 101, sensorName: '演示温度', at: '2026-09-23 11:00:00'},
		{id: 961002, thingsId: 950001, thingsName: '演示房间 A', sensorId: 101, sensorName: '演示温度', at: '2026-09-22 10:00:00'},
		{id: 961003, thingsId: 950001, thingsName: '演示房间 A', sensorId: 102, sensorName: '演示湿度', at: '2026-09-21 09:00:00'},
		{id: 961004, thingsId: 950003, thingsName: '演示房间 B', sensorId: 101, sensorName: '演示温度', at: '2026-09-20 08:00:00'},
		{id: 961005, thingsId: 950003, thingsName: '演示房间 B', sensorId: 101, sensorName: '演示温度', at: '2026-09-10 08:00:00'},
		{id: 961006, thingsId: 950002, thingsName: '演示走廊', sensorId: 101, sensorName: '演示温度', at: '2026-08-01 08:00:00'}
	].map(function (row) {
		var humidity = row.sensorId === 102;
		return Object.assign({miniType: 3, objType: 3, live: false}, row, {
			end: plusHour(row.at),
			value: humidity ? '85.0' : '42.0',
			min: humidity ? 30 : 0,
			max: humidity ? 70 : 40
		});
	});
	return instrumentRows.concat(roomRows);
}

function liveEvent() {
	return {
		id: LIVE_EVENT_ID,
		thingsId: 970008,
		thingsName: '演示示波器 B',
		sensorId: 1,
		objSensorId: 980008,
		sensorName: '演示温度',
		at: seeds.formatDemoDateTime(seeds.DEMO_NOW_MS - 3600000),
		end: '',
		value: '45.2',
		min: 0,
		max: 40,
		miniType: 4,
		objType: 2,
		live: true
	};
}

function allEvents() {
	return historicalEvents().concat([liveEvent()]);
}

function handles() {
	var map = parseJson(HANDLE_KEY, {});
	return map && typeof map === 'object' && !Array.isArray(map) ? map : {};
}

function present(event) {
	var patch = handles()[String(event.id)] || {};
	var processed = patch.process === true;
	var kind = event.miniType === 4 ? 'instrument' : 'room';
	return {
		id: event.id,
		eventId: event.id,
		thingsId: event.thingsId,
		objId: event.thingsId,
		equipmentId: event.thingsId,
		objType: event.objType,
		type: event.miniType,
		miniType: event.miniType,
		sensorName: event.sensorName,
		sensorAlias: event.sensorName,
		sensorType: event.sensorId,
		monitorSensorId: event.sensorId,
		objSensorId: event.objSensorId || event.sensorId,
		value: event.value,
		monitorSensorVal: event.value,
		min: event.min,
		max: event.max,
		monitorNormalMin: event.min,
		monitorNormalMax: event.max,
		duration: event.live && !processed ? '持续中' : '1小时',
		durationFormat: event.live && !processed ? '持续中' : '1小时',
		updateValue: processed && !event.live ? event.value : '',
		monitorAlarmEndVal: processed && !event.live ? event.value : '',
		createDate: event.at,
		alarmStartTime: event.at,
		updateDate: processed ? (patch.processDate || event.end) : event.end,
		monitorAlarmEndTime: processed && event.live ? '' : event.end,
		alarmFlag: event.live && !processed ? 0 : 1,
		process: processed ? 1 : 0,
		status: processed ? 1 : 2,
		live: !!event.live,
		thingsName: event.thingsName,
		errorCauseType: patch.errorCauseType || 0,
		errorCauseMethod: patch.errorCauseMethod || '',
		errorCauseMsg: patch.errorCauseMsg || '',
		errorCauseUserName: patch.errorCauseUserName || '',
		processDate: patch.processDate || '',
		headUser: staffName(headId(kind, event.thingsId)),
		companyId: 900001
	};
}

function matchProcess(row, process) {
	if (process == null || process === '' || Number(process) === 2) return true;
	return Number(row.process) === Number(process);
}

function scopedEvents(data, ignoreProcess) {
	var isHead = data && (data.isHead === 1 || data.isHead === '1');
	var user = session.currentUser() || seeds.DEMO_USER;
	var objId = data && (data.objId != null ? data.objId : data.thingsId);
	var objType = data && data.objType != null ? Number(data.objType) : null;
	var miniType = data && data.type != null ? normalizeThingsType(data.type) : null;
	return allEvents().map(present).filter(function (row) {
		if (objId != null && objId !== '' && Number(row.thingsId) !== Number(objId)) return false;
		if (objType != null && !Number.isNaN(objType) && Number(row.objType) !== objType) return false;
		if (miniType != null && !Number.isNaN(miniType) && Number(row.miniType) !== miniType) return false;
		if (isHead && !isResponsible(row.miniType === 4 ? 'instrument' : 'room', row.thingsId, user.id)) return false;
		if (!ignoreProcess && !matchProcess(row, data && data.process)) return false;
		return true;
	});
}

function wrapPage(rows, data) {
	// 分类标签统计整个对象/负责人范围；列表 total 仍使用筛选后的数量供分页。
	var scoped = rows;
	rows = scoped.filter(function (row) { return matchProcess(row, data && data.process); });
	var page = parsePage(data);
	var start = (page.pageNum - 1) * page.pageSize;
	var slice = start >= rows.length ? [] : rows.slice(start, start + page.pageSize);
	var processed = scoped.filter(function (row) { return row.process; }).length;
	var alarmStat = {
		total: scoped.length,
		noProcessedCount: scoped.length - processed,
		processedCount: processed
	};
	return {
		alarmStat: alarmStat,
		list: slice.length ? [{alarmStat: alarmStat, alarmInfo: slice}] : [],
		total: rows.length,
		pageNum: page.pageNum,
		pageSize: page.pageSize
	};
}

function historyForObj(data) {
	return wrapPage(scopedEvents(data, true), data);
}

function historyForMission(data) {
	return wrapPage(scopedEvents(data, true), data);
}

function findEvent(id) {
	var hit = allEvents().filter(function (row) { return Number(row.id) === Number(id); })[0];
	return hit ? present(hit) : null;
}

function applyProcess(body, isUpdate) {
	var user = session.currentUser() || seeds.DEMO_USER;
	var id = body && (body.alarmId || body.id);
	var row = findEvent(id);
	if (!row && body && body.objSensorId) {
		row = allEvents().map(present).filter(function (item) {
			return Number(item.objSensorId) === Number(body.objSensorId) && !item.process;
		})[0];
	}
	if (!row) return {ok: false, message: '未知告警'};
	if (!isResponsible(row.miniType === 4 ? 'instrument' : 'room', row.thingsId, user.id)) {
		return {ok: false, message: '无权处理该告警'};
	}
	if (!isUpdate && row.process) return {ok: false, message: '该告警已处理'};
	if (isUpdate && !row.process) return {ok: false, message: '告警尚未处理'};
	var errorCauseType = Number(body.errorType != null ? body.errorType : body.errorCauseType);
	if (!ALLOWED_ERROR_TYPES[errorCauseType]) return {ok: false, message: '请选择有效的报警类型'};
	var processDate = String(body.processDate || '').trim();
	if (!processDate) return {ok: false, message: '请填写有效的处理时间'};
	var dup = guardDup('p:' + row.id + ':' + processDate);
	if (dup) return dup;
	var map = handles();
	map[String(row.id)] = {
		process: true,
		status: 1,
		errorCauseType: errorCauseType,
		processDate: processDate,
		errorCauseMethod: String(body.errorCauseMethod || body.processMethod || '').slice(0, 80),
		errorCauseMsg: String(body.errorCauseMsg || body.remark || '').slice(0, 80),
		errorCauseUserName: user.name,
		errorCauseUserId: user.id
	};
	writeJson(HANDLE_KEY, map);
	ensureMessages();
	syncLiveMessage(row.id);
	return {ok: true, row: findEvent(row.id)};
}

function processInfo(alarmId) {
	var row = findEvent(alarmId);
	if (!row) return null;
	return {
		alarmId: row.id,
		errorType: row.errorCauseType,
		processDate: row.processDate,
		processMethod: row.errorCauseMethod,
		processUserName: row.errorCauseUserName,
		processUsername: row.errorCauseUserName,
		remark: row.errorCauseMsg
	};
}

function ensureMessages() {
	var list = parseJson(MESSAGE_KEY, null);
	var live = present(liveEvent());
	var title = '演示告警：' + (live.thingsName || '演示示波器 B');
	if (!Array.isArray(list)) {
		list = [{
			id: 880008,
			eventId: LIVE_EVENT_ID,
			types: 0,
			subType: 0,
			title: title,
			content: live.sensorName + ' ' + live.value + '℃，待人工确认',
			read: 0,
			sendDate: live.alarmStartTime,
			sourceId: LIVE_EVENT_ID,
			objId: live.thingsId,
			objType: live.objType
		}];
		writeJson(MESSAGE_KEY, list);
		return list;
	}
	var changed = false;
	list = list.map(function (row) {
		if (row && String(row.title).indexOf('undefined') !== -1) {
			changed = true;
			return Object.assign({}, row, {title: title, objId: row.objId || live.thingsId, objType: row.objType || live.objType});
		}
		return row;
	});
	if (changed) writeJson(MESSAGE_KEY, list);
	return list;
}

function syncLiveMessage(eventId) {
	var list = ensureMessages();
	writeJson(MESSAGE_KEY, list);
	return eventId;
}

function queryMessages(data) {
	var list = ensureMessages();
	var types = data && data.types;
	if (types !== '' && types != null) {
		list = list.filter(function (row) { return Number(row.types) === Number(types); });
	}
	var unread = function (type) {
		return ensureMessages().filter(function (row) { return Number(row.types) === type && !row.read; }).length;
	};
	var page = parsePage(data);
	var start = (page.pageNum - 1) * page.pageSize;
	return {
		list: start >= list.length ? [] : list.slice(start, start + page.pageSize),
		total: list.length,
		pageNum: page.pageNum,
		pageSize: page.pageSize,
		statisticalVO: {
			alarmCount: unread(0),
			propertyCount: unread(1),
			sysCount: unread(2),
			propertyNoReadCount: 0
		}
	};
}

function readMessage(id) {
	var list = ensureMessages();
	var found = false;
	writeJson(MESSAGE_KEY, list.map(function (row) {
		if (Number(row.id) === Number(id)) {
			found = true;
			return Object.assign({}, row, {read: 1});
		}
		return row;
	}));
	return found;
}

function readAll(type) {
	var list = ensureMessages();
	writeJson(MESSAGE_KEY, list.map(function (row) {
		if (type == null || type === '' || Number(row.types) === Number(type)) {
			return Object.assign({}, row, {read: 1});
		}
		return row;
	}));
	return true;
}

function cleanMessages(type) {
	var list = ensureMessages().filter(function (row) {
		return type != null && type !== '' && Number(row.types) !== Number(type);
	});
	writeJson(MESSAGE_KEY, list);
	return true;
}

function unreadFlags() {
	var msgs = ensureMessages();
	var notifyUnread = msgs.some(function (row) { return !row.read; });
	var pendingLive = scopedEvents({isHead: 1, process: 0}).some(function (row) { return row.live; });
	return {
		notifyUnread: notifyUnread,
		activitiUnread: pendingLive
	};
}

function alarmStats() {
	var user = session.currentUser() || seeds.DEMO_USER;
	var rows = allEvents().map(present).filter(function (row) {
		return isResponsible(row.miniType === 4 ? 'instrument' : 'room', row.thingsId, user.id);
	});
	function pack(miniType) {
		var scoped = rows.filter(function (row) { return row.miniType === miniType; });
		var processed = scoped.filter(function (row) { return row.process; }).length;
		return {
			thingsType: miniType,
			total: scoped.length,
			processedCount: processed,
			noProcessedCount: scoped.length - processed
		};
	}
	return {
		instrumentCount: seeds.DEMO_INSTRUMENTS.filter(function (row) {
			return isResponsible('instrument', row.id, user.id);
		}).length,
		roomCount: seeds.DEMO_ROOMS.filter(function (row) {
			return isResponsible('room', row.id, user.id);
		}).length,
		waitHandleNum: scopedEvents({isHead: 1, process: 0}).filter(function (row) { return row.live; }).length,
		statList: [pack(4), pack(3)]
	};
}

function agenda(data) {
	var pending = scopedEvents({isHead: 1, process: 0}).filter(function (row) { return row.live; });
	var list = pending.map(function (row) {
		return {
			procOrderNo: 'ALM-' + row.id,
			title: row.thingsName + ' 告警待处理',
			bizType: 'alarm',
			eventId: row.id,
			objId: row.thingsId,
			objType: row.objType,
			createDate: row.alarmStartTime,
			taskStartDate: row.alarmStartTime,
			applyUserName: '演示监测系统'
		};
	});
	// 同源告警处理时限两小时，最后一小时进入即将超时；使用演示时钟。
	list.forEach(function (item) {
		item.taskStartDate = item.createDate;
		item.applyDate = item.createDate;
		item.applyUserName = '演示监测系统';
		var startAt = Date.parse(String(item.createDate).replace(' ', 'T') + '+08:00');
		var deadline = startAt + 2 * 3600000;
		item.dueDate = seeds.formatDemoDateTime(deadline);
		item.timeOptions = deadline <= seeds.DEMO_NOW_MS ? 1 : (deadline - seeds.DEMO_NOW_MS <= 3600000 ? 0 : -1);
	});
	var counts = {
		pendingCount: list.filter(function (item) { return item.timeOptions === -1; }).length,
		aboutTimeOut: list.filter(function (item) { return item.timeOptions === 0; }).length,
		timeOut: list.filter(function (item) { return item.timeOptions === 1; }).length
	};
	var option = data && data.timeOptions != null ? Number(data.timeOptions) : null;
	if (option != null) list = list.filter(function (item) { return item.timeOptions === option; });
	var page = parsePage(data);
	var start = (page.pageNum - 1) * page.pageSize;
	return {
		list: start >= list.length ? [] : list.slice(start, start + page.pageSize),
		total: list.length,
		statisticalVO: counts
	};
}

function taskQuery(data) {
	var status = Number(data && data.taskStatus);
	var rows = scopedEvents({isHead: 1, process: status === 1 ? 1 : 0});
	if (status === 2 || status === 3) rows = [];
	var list = rows.map(function (row) {
		return {
			procOrderNo: 'ALM-' + row.id,
			title: row.thingsName + (row.process ? ' 告警已处理' : ' 告警待处理'),
			bizType: 'alarm',
			eventId: row.id,
			objId: row.thingsId,
			objType: row.objType,
			createDate: row.alarmStartTime,
			taskStartDate: row.alarmStartTime,
			applyUserName: '演示监测系统'
		};
	});
	return {list: list, total: list.length};
}

function getAlarmFlag(thingsId, thingsType) {
	var map = parseJson(FLAG_KEY, {});
	var key = Number(thingsType) + ':' + Number(thingsId);
	if (map[key] == null || map[key] === '') return 0;
	return Number(map[key]) === 1 ? 1 : 0;
}

function setAlarmFlag(thingsId, thingsType, flag) {
	var map = parseJson(FLAG_KEY, {});
	map[Number(thingsType) + ':' + Number(thingsId)] = Number(flag);
	writeJson(FLAG_KEY, map);
	return true;
}

module.exports = {
	LIVE_EVENT_ID: LIVE_EVENT_ID,
	DEMO_STAFF: DEMO_STAFF,
	ERROR_TYPES: ERROR_TYPES,
	HANDLE_KEY: HANDLE_KEY,
	MESSAGE_KEY: MESSAGE_KEY,
	RESPONSIBLE_KEY: RESPONSIBLE_KEY,
	isResponsible: isResponsible,
	headId: headId,
	staffName: staffName,
	setResponsible: setResponsible,
	historyForObj: historyForObj,
	historyForMission: historyForMission,
	findEvent: findEvent,
	applyProcess: applyProcess,
	processInfo: processInfo,
	queryMessages: queryMessages,
	readMessage: readMessage,
	readAll: readAll,
	cleanMessages: cleanMessages,
	unreadFlags: unreadFlags,
	alarmStats: alarmStats,
	agenda: agenda,
	taskQuery: taskQuery,
	setAlarmFlag: setAlarmFlag,
	getAlarmFlag: getAlarmFlag,
	ensureMessages: ensureMessages
};
