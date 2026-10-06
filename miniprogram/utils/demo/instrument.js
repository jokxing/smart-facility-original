var seeds = require('./seeds.js');
var alarm = require('./alarm.js');

var SEARCH_TYPE_INSTRUMENT = 2;
var MONITOR_OBJ_TYPE_INSTRUMENT = 2;
var PAGE_SIZE_MAX = 50;

function asIdList(value) {
	if (value == null || value === '') return [];
	var raw = Array.isArray(value) ? value : [value];
	return raw.map(Number).filter(function (n) { return !Number.isNaN(n); });
}

function parsePage(data) {
	var pageNum = Number(data && data.pageNum);
	var pageSize = Number(data && data.pageSize);
	if (!Number.isFinite(pageNum) || pageNum < 1) pageNum = 1;
	if (!Number.isFinite(pageSize) || pageSize < 1) pageSize = 10;
	if (pageSize > PAGE_SIZE_MAX) pageSize = PAGE_SIZE_MAX;
	return {pageNum: Math.floor(pageNum), pageSize: Math.floor(pageSize)};
}

function findInstrument(id) {
	var key = Number(id);
	for (var i = 0; i < seeds.DEMO_INSTRUMENTS.length; i++) {
		if (seeds.DEMO_INSTRUMENTS[i].id === key) return seeds.DEMO_INSTRUMENTS[i];
	}
	return null;
}

function sensorReading(entity) {
	var state = seeds.statusForInstrument(entity.id);
	var alarm = state.senorStatus === 2;
	var offline = state.senorStatus === -100;
	var time = offline ? '' : seeds.formatDemoDateTime(seeds.DEMO_NOW_MS);
	var tempId = 980000 + (entity.id % 1000);
	return [
		{
			id: tempId,
			objSensorId: tempId,
			sensorAlias: '演示温度',
			monitorSensorVal: offline ? '' : (alarm ? '45.2' : '5.2'),
			unit: '℃',
			monitorSensorTime: time,
			activateFlag: alarm ? 1 : 0,
			runStatus: state.senorStatus,
			monitorSensorCatId: 1,
			normalMin: 0,
			normalMax: 40,
			inlay: 1
		},
		{
			id: tempId + 100000,
			objSensorId: tempId + 100000,
			sensorAlias: '演示湿度',
			monitorSensorVal: offline ? '' : (alarm ? '85.0' : '55.0'),
			unit: '%',
			monitorSensorTime: time,
			activateFlag: alarm ? 1 : 0,
			runStatus: state.senorStatus,
			monitorSensorCatId: 2,
			normalMin: 30,
			normalMax: 70,
			inlay: 1
		}
	];
}

function buildListRow(entity) {
	var room = seeds.findRoom(entity.roomId);
	var dept = seeds.findDepartment(entity.departmentId);
	var state = seeds.statusForInstrument(entity.id);
	var sensors = sensorReading(entity);
	return {
		id: entity.id,
		name: entity.name,
		no: seeds.instrumentNo(entity.id),
		types: entity.types,
		type: SEARCH_TYPE_INSTRUMENT,
		detailType: 1,
		departmentId: entity.departmentId,
		departmentName: dept ? dept.name : '',
		status: state.runningStatus,
		senorStatus: state.senorStatus,
		bingStatus: state.senorStatus,
		brand: '演示品牌',
		managerName: alarm.staffName(alarm.headId('instrument', entity.id)),
		headUser: alarm.staffName(alarm.headId('instrument', entity.id)),
		model: 'DEMO-M1',
		typeName: seeds.typeNameFor(entity.types),
		roomId: entity.roomId,
		roomName: room ? room.name : '',
		gardenId: room ? room.gardenId : null,
		buildingId: room ? room.buildingId : null,
		floorId: room ? room.floorId : null,
		createDate: seeds.formatDemoDateTime(seeds.DEMO_NOW_MS - entity.daysAgo * 86400000),
		checkDate: sensors[0].monitorSensorTime,
		sensorList: sensors,
		logoUrl: '',
		head: false,
		alarmFlag: 0,
		openTwoSystem: true
	};
}

function buildDetail(entity) {
	var row = buildListRow(entity);
	row.companyName = seeds.DEMO_USER.companyName;
	row.userName = seeds.DEMO_USER.name;
	row.operatorName = seeds.DEMO_USER.name;
	row.head = alarm.isResponsible('instrument', entity.id);
	row.headUser = alarm.staffName(alarm.headId('instrument', entity.id));
	row.alarmFlag = alarm.getAlarmFlag(entity.id, 4);
	return row;
}

function matchKeyword(row, keyword) {
	var key = String(keyword || '').trim().toLowerCase();
	if (!key) return true;
	return [row.name, row.no, row.roomName].some(function (text) {
		return String(text || '').toLowerCase().indexOf(key) !== -1;
	});
}

function matchSensorStatus(senorStatus, filter) {
	if (filter == null || filter === '' || Number(filter) === 10) return true;
	var key = Number(filter);
	if (Number.isNaN(key)) return true;
	if (key === 1) return Number(senorStatus) === 1;
	if (key === 2) return Number(senorStatus) === 2 || Number(senorStatus) === -1;
	if (key === -100) return Number(senorStatus) === -100;
	return Number(senorStatus) === key;
}

function matchRunningStatus(status, filter) {
	if (filter == null || filter === '') return true;
	var key = Number(filter);
	if (Number.isNaN(key)) return true;
	if (key === 1) return Number(status) === 1;
	if (key === 0) return [0, 2].indexOf(Number(status)) !== -1;
	return Number(status) === key;
}

function matchSpace(row, ids) {
	if (!ids.length) return true;
	return ids.some(function (id) {
		return row.roomId === id || row.floorId === id || row.buildingId === id || row.gardenId === id;
	});
}

function filterRows(data, options) {
	options = options || {};
	var keyword = data && data.keyword;
	var deptIds = asIdList(data && (data.departmentIds || data.departmentIdList));
	var typeList = asIdList(data && (data.typeList || data.typesList));
	var roomIds = asIdList(data && (data.roomIds || data.roomIdList));
	var objTypes = asIdList(data && (data.objTypes || data.objType));
	var sensorFilter = options.ignoreSensor ? null : (data && data.status);
	var runFilter = data && data.instrumentStatus;
	return seeds.DEMO_INSTRUMENTS.map(buildListRow).filter(function (row) {
		if (!matchKeyword(row, keyword)) return false;
		if (deptIds.length && deptIds.indexOf(Number(row.departmentId)) === -1) return false;
		if (typeList.length && typeList.indexOf(Number(row.types)) === -1) return false;
		if (!matchSpace(row, roomIds)) return false;
		if (objTypes.length) return false;
		if (!matchSensorStatus(row.senorStatus, sensorFilter)) return false;
		if (!matchRunningStatus(row.status, runFilter)) return false;
		if (data && (data.isHead === 1 || data.isHead === '1') && !alarm.isResponsible('instrument', row.id)) return false;
		return true;
	});
}

function listInstruments(data) {
	var rows = filterRows(data, {});
	var page = parsePage(data);
	var start = (page.pageNum - 1) * page.pageSize;
	return {
		list: start >= rows.length ? [] : rows.slice(start, start + page.pageSize),
		total: rows.length,
		pageNum: page.pageNum,
		pageSize: page.pageSize
	};
}

function listStatistics(data) {
	var rows = filterRows(data, {ignoreSensor: true});
	var normal = 0;
	var alarm = 0;
	var offline = 0;
	rows.forEach(function (row) {
		if (row.senorStatus === 1) normal += 1;
		else if (row.senorStatus === 2) alarm += 1;
		else if (row.senorStatus === -100) offline += 1;
	});
	return {
		monitorCount: rows.length,
		normalCount: normal,
		alarmCount: alarm,
		offLineCount: offline
	};
}

function searchInstruments(data) {
	var keyword = String(data && data.keyword || '').trim();
	if (!keyword) return [];
	return filterRows({keyword: keyword}, {}).map(function (row) {
		row.type = SEARCH_TYPE_INSTRUMENT;
		return row;
	});
}

function getDetail(id) {
	var entity = findInstrument(id);
	return entity ? buildDetail(entity) : null;
}

function getAssetDetail(id) {
	var detail = getDetail(id);
	if (!detail) return null;
	return {
		instrumentName: detail.name,
		instrumentNo: detail.no,
		types: detail.types,
		brandName: detail.brand,
		instrumentModel: detail.model,
		logoUrl: '',
		roomName: detail.roomName,
		departmentName: detail.departmentName,
		useName: detail.managerName,
		installedTime: detail.createDate,
		useDeptName: detail.departmentName,
		measured: null,
		verified: null,
		sOPSituation: null,
		purchaseDate: '',
		contractNumber: '',
		amountIncludeTax: '',
		assetNumber: detail.no,
		voltage: '',
		ratedPower: '',
		contactUserName: '',
		contactUserTel: ''
	};
}

function getOpenMonitor(objId, objType) {
	if (Number(objType) === 3) {
		var room = seeds.findRoom(objId);
		if (!room) return null;
		return {list: [], isBind: 0, type: 3, bindingDeviceId: []};
	}
	if (Number(objType) !== MONITOR_OBJ_TYPE_INSTRUMENT) return null;
	var entity = findInstrument(objId);
	if (!entity) return null;
	return {
		list: sensorReading(entity),
		isBind: 0,
		type: MONITOR_OBJ_TYPE_INSTRUMENT,
		bindingDeviceId: []
	};
}

function getMonitorFlagList(objId, objType) {
	var open = getOpenMonitor(objId, objType);
	return open ? open.list : null;
}

function chartValue(sensorId, index, alarm) {
	var humidity = Number(sensorId) >= 1080000;
	if (alarm) {
		return humidity
			? Number((78 + (index % 7) * 1.5).toFixed(1))
			: Number((38 + (index % 5) * 1.2).toFixed(1));
	}
	return humidity
		? Number((52 + (index % 6) * 0.8).toFixed(1))
		: Number((4.8 + (index % 6) * 0.2).toFixed(1));
}

function getMonitorInfo(data) {
	if (!data) return null;
	if (Number(data.type) === 3) {
		return seeds.findRoom(data.objId) ? [] : null;
	}
	if (Number(data.type) !== MONITOR_OBJ_TYPE_INSTRUMENT) return null;
	var entity = findInstrument(data.objId);
	if (!entity) return null;
	var sensorId = Number(data.objSensorId);
	var flags = sensorReading(entity);
	var hit = flags.filter(function (item) { return Number(item.objSensorId) === sensorId; })[0];
	if (!hit) return [];
	var alarm = seeds.statusForInstrument(entity.id).senorStatus === 2;
	var interval = Number(data.interval);
	var spanMs = interval === 3 ? 6 * 3600000 : interval === 4 ? 24 * 3600000 : 3600000;
	var step = interval === 4 ? 30 * 60000 : interval === 3 ? 15 * 60000 : 5 * 60000;
	var end = seeds.DEMO_NOW_MS;
	var begin = end - spanMs;
	var list = [];
	var index = 0;
	for (var t = begin; t <= end; t += step) {
		list.push({
			createDate: seeds.formatDemoDateTime(t),
			data: chartValue(sensorId, index, alarm)
		});
		index += 1;
	}
	return list;
}

function listDepartments() {
	return {list: seeds.DEMO_DEPARTMENTS.slice()};
}

function listRooms(data) {
	var keyword = String(data && data.keyword || '').trim();
	var rows = seeds.DEMO_ROOMS.filter(function (room) {
		return !keyword || room.name.indexOf(keyword) !== -1;
	});
	var page = parsePage(data);
	var start = (page.pageNum - 1) * page.pageSize;
	return {
		list: rows.slice(start, start + page.pageSize),
		total: rows.length,
		pageNum: page.pageNum,
		pageSize: page.pageSize
	};
}

function gardenList() {
	return seeds.DEMO_SPACE.slice();
}

function roomTree() {
	return seeds.DEMO_SPACE.map(function (garden) {
		return {
			id: garden.gardenId,
			name: garden.gardenName,
			children: (garden.subDivisions || []).map(function (building) {
				return {
					id: building.id,
					name: building.name,
					children: (building.subDivisions || []).map(function (floor) {
						return {
							id: floor.id,
							name: floor.name,
							children: seeds.DEMO_ROOMS.filter(function (room) {
								return room.floorId === floor.id && room.buildingId === building.id;
							}).map(function (room) {
								return {id: room.id, name: room.name, children: []};
							})
						};
					})
				};
			})
		};
	});
}

function emptyHardware(data) {
	var page = parsePage(data);
	return {list: [], total: 0, pageNum: page.pageNum, pageSize: page.pageSize};
}

function historyAlarms(data) {
	var objId = Number(data && data.objId);
	var process = Number(data && data.process);
	var page = parsePage(data);
	var alarmInfo = [];
	if (objId === seeds.ALARM_INSTRUMENT_ID) {
		var sensors = sensorReading(findInstrument(objId));
		var temp = sensors[0];
		var row = {
			id: 990008,
			sensorAlias: temp.sensorAlias,
			process: 0,
			monitorSensorVal: temp.monitorSensorVal,
			monitorNormalMin: temp.normalMin,
			monitorNormalMax: temp.normalMax,
			durationFormat: '持续中',
			alarmStartTime: seeds.formatDemoDateTime(seeds.DEMO_NOW_MS - 3600000),
			monitorAlarmEndTime: '',
			monitorAlarmEndVal: '',
			alarmFlag: 0,
			monitorSensorId: temp.monitorSensorCatId
		};
		if (process === 2 || process === 0 || process === '' || data.process == null) {
			if (process !== 1) alarmInfo.push(row);
		}
	}
	var alarmStat = {
		total: alarmInfo.length,
		noProcessedCount: alarmInfo.length,
		processedCount: 0
	};
	return {
		list: alarmInfo.length ? [{alarmStat: alarmStat, alarmInfo: alarmInfo}] : [],
		total: alarmInfo.length,
		pageNum: page.pageNum,
		pageSize: page.pageSize
	};
}

module.exports = {
	SEARCH_TYPE_INSTRUMENT: SEARCH_TYPE_INSTRUMENT,
	findInstrument: findInstrument,
	listInstruments: listInstruments,
	listStatistics: listStatistics,
	searchInstruments: searchInstruments,
	getDetail: getDetail,
	getAssetDetail: getAssetDetail,
	getOpenMonitor: getOpenMonitor,
	getMonitorFlagList: getMonitorFlagList,
	getMonitorInfo: getMonitorInfo,
	listDepartments: listDepartments,
	listRooms: listRooms,
	gardenList: gardenList,
	roomTree: roomTree,
	emptyHardware: emptyHardware,
	historyAlarms: historyAlarms
};
