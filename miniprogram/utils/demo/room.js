var seeds = require('./seeds.js');
var instrument = require('./instrument.js');
var alarm = require('./alarm.js');

var SEARCH_TYPE_ROOM = 3;
var PAGE_SIZE_MAX = 50;

function parsePage(data) {
	var pageNum = Number(data && data.pageNum);
	var pageSize = Number(data && data.pageSize);
	if (!Number.isFinite(pageNum) || pageNum < 1) pageNum = 1;
	if (!Number.isFinite(pageSize) || pageSize < 1) pageSize = 10;
	if (pageSize > PAGE_SIZE_MAX) pageSize = PAGE_SIZE_MAX;
	return {pageNum: Math.floor(pageNum), pageSize: Math.floor(pageSize)};
}

function hasFilterValue(value) {
	return value !== '' && value != null && !Number.isNaN(Number(value)) && Number(value) !== 0;
}

function roomNo(id) {
	return 'DEMO-RM-' + id;
}

function spaceNames(room) {
	var garden = '';
	var building = '';
	var floor = '';
	seeds.DEMO_SPACE.forEach(function (g) {
		if (g.gardenId === room.gardenId) {
			garden = g.gardenName;
			(g.subDivisions || []).forEach(function (b) {
				if (b.id === room.buildingId) {
					building = b.name;
					(b.subDivisions || []).forEach(function (f) {
						if (f.id === room.floorId) floor = f.name;
					});
				}
			});
		}
	});
	return {garden: garden, building: building, floor: floor};
}

function instrumentsForRoom(roomId) {
	return instrument.listInstruments({
		roomIds: [Number(roomId)],
		pageNum: 1,
		pageSize: 50,
		status: 10
	}).list;
}

function matchSensorStatus(senorStatus, filter) {
	if (filter == null || filter === '' || Number(filter) === 10) return true;
	var key = Number(filter);
	if (Number.isNaN(key)) return true;
	return Number(senorStatus) === key;
}

function inSpace(room, data) {
	if (hasFilterValue(data && data.gardenId) && Number(data.gardenId) !== room.gardenId) return false;
	if (hasFilterValue(data && data.buildingId) && Number(data.buildingId) !== room.buildingId) return false;
	if (hasFilterValue(data && data.floorId) && Number(data.floorId) !== room.floorId) return false;
	return true;
}

function buildRoomRow(room) {
	var dept = seeds.findDepartment(room.departmentId);
	var names = spaceNames(room);
	var devices = instrumentsForRoom(room.id);
	var senorStatus = seeds.aggregateRoomSenorStatus(room.id);
	var representative = devices.filter(function (row) { return row.senorStatus === 2; })[0] || devices[0] || null;
	return {
		id: room.id,
		name: room.name,
		no: roomNo(room.id),
		type: SEARCH_TYPE_ROOM,
		departmentId: room.departmentId,
		departmentName: dept ? dept.name : '',
		gardenId: room.gardenId,
		buildingId: room.buildingId,
		floorId: room.floorId,
		gradenName: names.garden,
		buildingName: names.building,
		floorName: names.floor,
		senorStatus: senorStatus,
		sensorList: representative ? representative.sensorList : [],
		checkDate: representative ? representative.checkDate : '',
		createDate: seeds.formatDemoDateTime(seeds.DEMO_NOW_MS - 20 * 86400000),
		openTwoSystem: 1,
		head: false
	};
}

function filterRooms(data, options) {
	options = options || {};
	var keyword = String(data && data.keyword || '').trim().toLowerCase();
	return seeds.DEMO_ROOMS.map(buildRoomRow).filter(function (row) {
		if (!inSpace({gardenId: row.gardenId, buildingId: row.buildingId, floorId: row.floorId}, data)) return false;
		if (keyword && [row.name, row.no].every(function (text) {
			return String(text || '').toLowerCase().indexOf(keyword) === -1;
		})) return false;
		if (!options.ignoreSensor && !matchSensorStatus(row.senorStatus, data && data.status)) return false;
		if (data && (data.isHead === 1 || data.isHead === '1') && !alarm.isResponsible('room', row.id)) return false;
		return true;
	});
}

function listMiniRooms(data) {
	var rows = filterRooms(data, {});
	var page = parsePage(data);
	var start = (page.pageNum - 1) * page.pageSize;
	return {
		list: start >= rows.length ? [] : rows.slice(start, start + page.pageSize),
		total: rows.length,
		pageNum: page.pageNum,
		pageSize: page.pageSize
	};
}

function roomStatistics(data) {
	var rows = filterRooms(data, {ignoreSensor: true});
	var normal = 0;
	var alarm = 0;
	var offline = 0;
	rows.forEach(function (row) {
		if (row.senorStatus === 1) normal += 1;
		else if (row.senorStatus === 2) alarm += 1;
		else if (row.senorStatus === -100) offline += 1;
	});
	return {
		monitoringNum: rows.length,
		normalNum: normal,
		policeNum: alarm,
		leaveNum: offline
	};
}

function getRoomDetail(id) {
	var room = seeds.findRoom(id);
	if (!room) return null;
	var row = buildRoomRow(room);
	row.instrumentList = instrumentsForRoom(room.id).map(function (item) {
		return {
			id: item.id,
			name: item.name,
			no: item.no,
			status: item.status,
			bingStatus: item.senorStatus,
			senorStatus: item.senorStatus,
			checkDate: item.checkDate,
			simpleEquipmentVOS: item.sensorList,
			sensorList: item.sensorList,
			roomId: item.roomId
		};
	});
	row.head = alarm.isResponsible('room', room.id);
	row.headUser = alarm.staffName(alarm.headId('room', room.id));
	row.alarmFlag = alarm.getAlarmFlag(room.id, 11);
	return row;
}

function searchRooms(keyword) {
	var key = String(keyword || '').trim();
	if (!key) return [];
	return filterRooms({keyword: key, status: 10}, {});
}

function isDesignerRoomQuery(data) {
	if (!data) return false;
	var hasFloor = data.floorId != null && data.floorId !== '';
	var hasGardenKey = Object.prototype.hasOwnProperty.call(data, 'gardenId');
	var hasBuildingKey = Object.prototype.hasOwnProperty.call(data, 'buildingId');
	var hasKeyword = data.keyword != null && String(data.keyword).trim() !== '';
	return hasFloor && !hasGardenKey && !hasBuildingKey && !hasKeyword;
}

function listChipRooms(data) {
	if (isDesignerRoomQuery(data)) {
		var page = parsePage(data);
		return {list: [], total: 0, pageNum: page.pageNum, pageSize: page.pageSize};
	}
	return instrument.listRooms(data);
}

module.exports = {
	SEARCH_TYPE_ROOM: SEARCH_TYPE_ROOM,
	listMiniRooms: listMiniRooms,
	roomStatistics: roomStatistics,
	getRoomDetail: getRoomDetail,
	searchRooms: searchRooms,
	listChipRooms: listChipRooms
};
