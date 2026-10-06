/**
 * Mini program demo seeds. Adapted from Web
 * smart-facility-platform/src/mock/fixtures/{auth,instrument,room,scenario,space}.js
 * Differences: no window/axios/Element; no layout/workbook; no created-overlay storage.
 * IDs and names stay aligned. Storage is uni namespaced, not Web localStorage.
 */

var DEMO_CREDENTIALS = {username: 'demo', password: 'Demo1234'};

var DEMO_USER = {
	id: 900001,
	loginId: 'demo',
	name: '演示用户',
	companyId: 900001,
	companyName: '智慧设施演示空间',
	departmentId: 900101,
	departmentName: '演示运维部',
	roleId: 1,
	tel: '13800000001',
	email: 'demo@example.com',
	deviceSeeFlag: 1,
	instrumentSeeFlag: 1,
	roomSeeFlag: 1,
	weixinOpenId: '',
	roles: [{id: 1, name: '演示管理员'}]
};

var DEMO_DEPARTMENTS = [
	{id: 900101, name: '演示运维部', departmentName: '演示运维部', parentId: 0, subDivisions: []},
	{id: 900102, name: '演示研发部', departmentName: '演示研发部', parentId: 0, subDivisions: []}
];

var DEMO_CATEGORIES = [
	{id: 900201, name: '演示设备', types: 1, code: 'DEMO-1', childrenList: []},
	{id: 900202, name: '演示辅助设备', types: 2, code: 'DEMO-2', childrenList: []}
];

var DEMO_BIND_EQUIPMENT_TYPES = [
	{code: 1, name: '演示记录仪', id: 1}
];

var DEMO_SPACE = [
	{
		gardenId: 910001,
		gardenName: '演示甲园区',
		subDivisions: [
			{
				id: 920001,
				name: '演示一号楼',
				subDivisions: [
					{id: 930001, name: '1F'},
					{id: 930002, name: '2F'},
					{id: 930003, name: '3F'}
				]
			},
			{
				id: 920002,
				name: '演示二号楼',
				subDivisions: [
					{id: 930011, name: '1F'},
					{id: 930012, name: '2F'}
				]
			}
		]
	}
];

var DEMO_ROOMS = [
	{id: 950001, name: '演示房间 A', gardenId: 910001, buildingId: 920001, floorId: 930001, departmentId: 900101},
	{id: 950002, name: '演示走廊', gardenId: 910001, buildingId: 920001, floorId: 930001, departmentId: 900101},
	{id: 950003, name: '演示房间 B', gardenId: 910001, buildingId: 920001, floorId: 930001, departmentId: 900102}
];

var DEPT_OPS = 900101;
var DEPT_RD = 900102;

var DEMO_INSTRUMENTS = [
	{id: 970001, name: '演示培养箱', roomId: 950001, types: 1, departmentId: DEPT_OPS, daysAgo: 29},
	{id: 970002, name: '演示冷藏柜', roomId: 950001, types: 1, departmentId: DEPT_OPS, daysAgo: 28},
	{id: 970003, name: '演示温湿度仪', roomId: 950003, types: 1, departmentId: DEPT_OPS, daysAgo: 27},
	{id: 970004, name: '演示检测仪 A', roomId: 950001, types: 1, departmentId: DEPT_OPS, daysAgo: 26},
	{id: 970005, name: '演示示波器 A', roomId: 950001, types: 1, departmentId: DEPT_OPS, daysAgo: 25},
	{id: 970006, name: '演示设备机柜 B', roomId: 950003, types: 1, departmentId: DEPT_OPS, daysAgo: 24},
	{id: 970007, name: '演示检测仪 B', roomId: 950003, types: 1, departmentId: DEPT_RD, daysAgo: 23},
	{id: 970008, name: '演示示波器 B', roomId: 950003, types: 1, departmentId: DEPT_RD, daysAgo: 22},
	{id: 970009, name: '演示培养箱 B', roomId: 950003, types: 1, departmentId: DEPT_RD, daysAgo: 21},
	{id: 970010, name: '演示冷藏柜 B', roomId: 950003, types: 1, departmentId: DEPT_OPS, daysAgo: 20},
	{id: 970011, name: '演示监测终端 A', roomId: 950001, types: 1, departmentId: DEPT_OPS, daysAgo: 19},
	{id: 970012, name: '演示设备机柜 A', roomId: 950001, types: 1, departmentId: DEPT_OPS, daysAgo: 18}
];

var ALARM_INSTRUMENT_ID = 970008;
var DEMO_NOW_MS = Date.parse('2026-10-05T04:00:00.000Z');

function pad(n) {
	return n < 10 ? '0' + n : String(n);
}

function formatDemoDateTime(ms) {
	var d = new Date(ms);
	var utc = d.getTime() + d.getTimezoneOffset() * 60000;
	var cst = new Date(utc + 8 * 3600000);
	return cst.getFullYear() + '-' + pad(cst.getMonth() + 1) + '-' + pad(cst.getDate()) +
		' ' + pad(cst.getHours()) + ':' + pad(cst.getMinutes()) + ':' + pad(cst.getSeconds());
}

function findRoom(roomId) {
	var key = Number(roomId);
	for (var i = 0; i < DEMO_ROOMS.length; i++) {
		if (DEMO_ROOMS[i].id === key) return DEMO_ROOMS[i];
	}
	return null;
}

function findDepartment(departmentId) {
	var key = Number(departmentId);
	for (var i = 0; i < DEMO_DEPARTMENTS.length; i++) {
		if (DEMO_DEPARTMENTS[i].id === key) return DEMO_DEPARTMENTS[i];
	}
	return null;
}

function instrumentNo(id) {
	return 'DEMO-EQ-' + id;
}

function typeNameFor(types) {
	return Number(types) === 2 ? '演示辅助设备' : '演示设备';
}

function statusForInstrument(id) {
	if (Number(id) === ALARM_INSTRUMENT_ID) {
		return {runningStatus: 1, senorStatus: 2};
	}
	return {runningStatus: 1, senorStatus: 1};
}

function aggregateRoomSenorStatus(roomId) {
	var devices = DEMO_INSTRUMENTS.filter(function (item) {
		return Number(item.roomId) === Number(roomId);
	});
	if (!devices.length) return 1;
	var states = devices.map(function (item) {
		return statusForInstrument(item.id).senorStatus;
	});
	if (states.indexOf(2) !== -1) return 2;
	if (states.indexOf(-100) !== -1) return -100;
	return 1;
}

function computeHomeStatistics() {
	var instruments = DEMO_INSTRUMENTS;
	var paramNormal = 0;
	var paramAlarm = 0;
	var paramOffline = 0;
	var runCount = 0;
	var standbyCount = 0;
	var closeCount = 0;
	instruments.forEach(function (item) {
		var state = statusForInstrument(item.id);
		if (state.senorStatus === 1) paramNormal += 1;
		else if (state.senorStatus === 2) paramAlarm += 1;
		else if (state.senorStatus === -100) paramOffline += 1;
		if (state.runningStatus === 1) runCount += 1;
		else if (state.runningStatus === 2) standbyCount += 1;
		else if (state.runningStatus === 0) closeCount += 1;
	});
	var roomNormal = 0;
	var roomAlarm = 0;
	var roomOffline = 0;
	DEMO_ROOMS.forEach(function (room) {
		var senor = aggregateRoomSenorStatus(room.id);
		if (senor === 1) roomNormal += 1;
		else if (senor === 2) roomAlarm += 1;
		else if (senor === -100) roomOffline += 1;
	});
	return {
		instrumentStatistics: {
			monitorCount: instruments.length,
			normalCount: paramNormal,
			alarmCount: paramAlarm,
			offLineCount: paramOffline,
			runCount: runCount,
			standbyCount: standbyCount,
			closeCount: closeCount
		},
		roomStatistics: {
			monitorCount: DEMO_ROOMS.length,
			normalCount: roomNormal,
			alarmCount: roomAlarm,
			offLineCount: roomOffline
		}
	};
}

module.exports = {
	DEMO_CREDENTIALS: DEMO_CREDENTIALS,
	DEMO_USER: DEMO_USER,
	DEMO_DEPARTMENTS: DEMO_DEPARTMENTS,
	DEMO_CATEGORIES: DEMO_CATEGORIES,
	DEMO_BIND_EQUIPMENT_TYPES: DEMO_BIND_EQUIPMENT_TYPES,
	DEMO_SPACE: DEMO_SPACE,
	DEMO_ROOMS: DEMO_ROOMS,
	DEMO_INSTRUMENTS: DEMO_INSTRUMENTS,
	ALARM_INSTRUMENT_ID: ALARM_INSTRUMENT_ID,
	DEMO_NOW_MS: DEMO_NOW_MS,
	pad: pad,
	formatDemoDateTime: formatDemoDateTime,
	findRoom: findRoom,
	findDepartment: findDepartment,
	instrumentNo: instrumentNo,
	typeNameFor: typeNameFor,
	statusForInstrument: statusForInstrument,
	aggregateRoomSenorStatus: aggregateRoomSenorStatus,
	computeHomeStatistics: computeHomeStatistics
};
