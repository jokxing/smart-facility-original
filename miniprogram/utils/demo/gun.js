/**
 * Mini pipette-gun demo. IDs match Web gun seeds. Local storage only.
 * homingStatus: 0 in use, 1 on rack, 2 timeout (computed from takeOutTime).
 * Empty slots are not gun entities.
 */
var storage = require('./storage.js');
var seeds = require('./seeds.js');
var session = require('./session.js');

var STATE_KEY = 'gunState';
var RECORD_KEY = 'gunRecords';
var PENDING_KEY = 'gunPending';
var TIMEOUT_MS = 24 * 3600 * 1000;
var PAGE_SIZE_MAX = 50;

var RACK_A = 980023;
var RACK_B = 980024;

function nowMs() {
	return seeds.DEMO_NOW_MS;
}

function fmt(ms) {
	return seeds.formatDemoDateTime(ms);
}

function parseJson(key, fallback) {
	var raw = storage.getDemo(key);
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

function clone(row) {
	return JSON.parse(JSON.stringify(row));
}

function decodeDeviceId(value) {
	var s = String(value == null ? '' : value);
	if (/^\d+$/.test(s)) return Number(s);
	try {
		if (typeof atob === 'function') {
			var d = atob(s);
			if (/^\d+$/.test(d)) return Number(d);
		}
	} catch (e) {}
	try {
		if (typeof Buffer !== 'undefined') {
			var d2 = Buffer.from(s, 'base64').toString('utf8');
			if (/^\d+$/.test(d2)) return Number(d2);
		}
	} catch (e2) {}
	return NaN;
}

var DEMO_RACKS = [
	{
		id: RACK_A,
		name: '演示移液枪架 A',
		no: 'EQ-GR-001',
		status: 1,
		roomId: 950001,
		departmentId: 900101,
		broadcastNum: 2,
		slots: 4
	},
	{
		id: RACK_B,
		name: '演示移液枪架 B',
		no: 'EQ-GR-002',
		status: -100,
		roomId: 950003,
		departmentId: 900102,
		broadcastNum: 2,
		slots: 2
	}
];

function defaultGuns() {
	var now = nowMs();
	return [
		{
			pipetteGunId: 991001,
			name: '演示移液枪 1',
			no: 'PG-001',
			gunRackId: RACK_A,
			detent: 1,
			homingStatus: 0,
			takeOutTime: fmt(now - 2 * 3600000),
			homingTime: fmt(now - 26 * 3600000),
			endUser: '演示用户',
			endUserId: 900001
		},
		{
			pipetteGunId: 991002,
			name: '演示移液枪 2',
			no: 'PG-002',
			gunRackId: RACK_A,
			detent: 2,
			homingStatus: 1,
			takeOutTime: fmt(now - 50 * 3600000),
			homingTime: fmt(now - 28 * 3600000),
			endUser: '演示运维员',
			endUserId: 900002
		},
		{
			pipetteGunId: 991003,
			name: '演示移液枪 3',
			no: 'PG-003',
			gunRackId: RACK_A,
			detent: 3,
			homingStatus: 0,
			takeOutTime: fmt(now - 36 * 3600000),
			homingTime: '',
			endUser: '演示研发员',
			endUserId: 900003
		},
		{
			pipetteGunId: 991004,
			name: '演示移液枪 4',
			no: 'PG-004',
			gunRackId: RACK_B,
			detent: 1,
			homingStatus: 1,
			takeOutTime: fmt(now - 80 * 3600000),
			homingTime: fmt(now - 72 * 3600000),
			endUser: '演示用户',
			endUserId: 900001
		}
	];
}

function defaultRecords() {
	var now = nowMs();
	return [
		{
			id: 992001,
			pipetteGunId: 991001,
			no: 'PG-001',
			pipetteGunName: '演示移液枪 1',
			pipetteGunUser: '演示用户',
			gunUserId: 900001,
			gunRackId: RACK_A,
			gunRackName: '演示移液枪架 A',
			position: '1号位',
			backGunRackName: '',
			backPosition: '',
			takeOutTime: fmt(now - 2 * 3600000),
			homingTime: '',
			simulated: true
		},
		{
			id: 992002,
			pipetteGunId: 991002,
			no: 'PG-002',
			pipetteGunName: '演示移液枪 2',
			pipetteGunUser: '演示运维员',
			gunUserId: 900002,
			gunRackId: RACK_A,
			gunRackName: '演示移液枪架 A',
			position: '2号位',
			backGunRackName: '演示移液枪架 A',
			backPosition: '2号位',
			takeOutTime: fmt(now - 50 * 3600000),
			homingTime: fmt(now - 28 * 3600000),
			simulated: true
		},
		{
			id: 992003,
			pipetteGunId: 991003,
			no: 'PG-003',
			pipetteGunName: '演示移液枪 3',
			pipetteGunUser: '演示研发员',
			gunUserId: 900003,
			gunRackId: RACK_A,
			gunRackName: '演示移液枪架 A',
			position: '3号位',
			backGunRackName: '',
			backPosition: '',
			takeOutTime: fmt(now - 36 * 3600000),
			homingTime: '',
			simulated: true
		}
	];
}

function parseTime(value) {
	if (!value) return NaN;
	var n = Date.parse(String(value).replace(' ', 'T') + '+08:00');
	if (!Number.isFinite(n)) n = Date.parse(String(value));
	return n;
}

function durationText(from, to) {
	var start = parseTime(from);
	var end = parseTime(to);
	if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return '';
	var ms = end - start;
	var h = Math.floor(ms / 3600000);
	var m = Math.floor((ms % 3600000) / 60000);
	return h + '小时' + m + '分钟';
}

function findRoom(id) {
	for (var i = 0; i < seeds.DEMO_ROOMS.length; i++) {
		if (seeds.DEMO_ROOMS[i].id === Number(id)) return seeds.DEMO_ROOMS[i];
	}
	return null;
}

function findDept(id) {
	for (var i = 0; i < seeds.DEMO_DEPARTMENTS.length; i++) {
		if (seeds.DEMO_DEPARTMENTS[i].id === Number(id)) return seeds.DEMO_DEPARTMENTS[i];
	}
	return null;
}

function findRack(id) {
	for (var i = 0; i < DEMO_RACKS.length; i++) {
		if (DEMO_RACKS[i].id === Number(id)) return DEMO_RACKS[i];
	}
	return null;
}

function positionOf(rack) {
	var room = findRoom(rack.roomId);
	if (!room) return '';
	return '演示甲园区演示一号楼1F' + room.name;
}

function loadGuns() {
	var overlay = parseJson(STATE_KEY, null);
	var list = defaultGuns();
	if (!overlay) return list;
	return list.map(function (gun) {
		var patch = overlay[String(gun.pipetteGunId)];
		return patch ? Object.assign({}, gun, patch) : gun;
	});
}

function saveGuns(list) {
	var map = {};
	list.forEach(function (gun) {
		map[String(gun.pipetteGunId)] = {
			homingStatus: gun.homingStatus,
			takeOutTime: gun.takeOutTime,
			homingTime: gun.homingTime,
			endUser: gun.endUser,
			endUserId: gun.endUserId,
			detent: gun.detent,
			gunRackId: gun.gunRackId
		};
	});
	writeJson(STATE_KEY, map);
}

function loadRecords() {
	var stored = parseJson(RECORD_KEY, null);
	if (Array.isArray(stored) && stored.length) return stored;
	var seed = defaultRecords();
	writeJson(RECORD_KEY, seed);
	return seed;
}

function saveRecords(list) {
	writeJson(RECORD_KEY, list);
}

function computedStatus(gun) {
	if (Number(gun.homingStatus) === 1) return 1;
	var take = parseTime(gun.takeOutTime);
	if (Number.isFinite(take) && nowMs() - take >= TIMEOUT_MS) return 2;
	return 0;
}

function overtimeHours(gun) {
	if (computedStatus(gun) !== 2) return 0;
	var take = parseTime(gun.takeOutTime);
	if (!Number.isFinite(take)) return 0;
	return Math.floor((nowMs() - take) / 3600000);
}

function presentGun(gun) {
	var rack = findRack(gun.gunRackId);
	var room = rack ? findRoom(rack.roomId) : null;
	var dept = rack ? findDept(rack.departmentId) : findDept(900101);
	var status = computedStatus(gun);
	var hour = overtimeHours(gun);
	var loc = rack ? (rack.name + ' ' + gun.detent + '号位') : '';
	return {
		pipetteGunId: gun.pipetteGunId,
		id: gun.pipetteGunId,
		name: gun.name,
		no: gun.no,
		gunRackId: gun.gunRackId,
		gunRackName: rack ? rack.name : '',
		detent: gun.detent,
		homingStatus: status,
		takeOutTime: gun.takeOutTime || '',
		homingTime: gun.homingTime || '',
		endUser: gun.endUser || '',
		endUserId: gun.endUserId || 0,
		headUser: '演示用户',
		head: 1,
		departmentId: rack ? rack.departmentId : 900101,
		departmentName: dept ? dept.name : '演示运维部',
		companyName: '智慧设施演示空间',
		position: rack ? positionOf(rack) : '',
		preciseLocation: status === 1 ? loc : (status === 0 || status === 2 ? '使用中' : loc),
		overTime: hour ? (hour + 'h') : '',
		hour: hour,
		roomId: rack ? rack.roomId : 0,
		gardenId: room ? room.gardenId : 0,
		buildingId: room ? room.buildingId : 0,
		floorId: room ? room.floorId : 0,
		createDate: '2026-03-01 09:00:00',
		reportDate: fmt(nowMs()),
		remark: '演示移液枪，取还为模拟确认，未连接真实枪架。',
		cancelAlarmFlag: 1,
		type: 101
	};
}

function parsePage(data) {
	var pageNum = Number(data && data.pageNum);
	var pageSize = Number(data && data.pageSize);
	if (!Number.isFinite(pageNum) || pageNum < 1) pageNum = 1;
	if (!Number.isFinite(pageSize) || pageSize < 1) pageSize = 10;
	if (pageSize > PAGE_SIZE_MAX) pageSize = PAGE_SIZE_MAX;
	return {pageNum: Math.floor(pageNum), pageSize: Math.floor(pageSize)};
}

function matchKeyword(row, keyword) {
	if (!keyword) return true;
	var k = String(keyword).toLowerCase();
	return String(row.name).toLowerCase().indexOf(k) !== -1 || String(row.no).toLowerCase().indexOf(k) !== -1;
}

function presentedList() {
	return loadGuns().map(presentGun);
}

function listGuns(data) {
	var page = parsePage(data);
	var status = data && data.status;
	if (status === '' || status == null) status = null;
	else status = Number(status);
	var keyword = data && data.keyword;
	var deptId = data && data.departmentId != null && data.departmentId !== '' ? Number(data.departmentId) : null;
	var gardenId = data && data.gardenId != null && data.gardenId !== '' ? Number(data.gardenId) : null;
	var buildingId = data && data.buildingId != null && data.buildingId !== '' ? Number(data.buildingId) : null;
	var floorId = data && data.floorId != null && data.floorId !== '' ? Number(data.floorId) : null;
	var roomIds = data && data.roomIds;
	if (!Array.isArray(roomIds) && data && data.roomId) roomIds = [data.roomId];
	roomIds = (roomIds || []).map(Number).filter(function (n) { return !Number.isNaN(n); });
	var signatureId = data && data.signatureId != null && data.signatureId !== '' ? Number(data.signatureId) : null;
	var rows = presentedList().filter(function (row) {
		if (status != null && !Number.isNaN(status) && Number(row.homingStatus) !== status) return false;
		if (!matchKeyword(row, keyword)) return false;
		if (deptId != null && !Number.isNaN(deptId) && Number(row.departmentId) !== deptId) return false;
		if (gardenId != null && Number(row.gardenId) !== gardenId) return false;
		if (buildingId != null && Number(row.buildingId) !== buildingId) return false;
		if (floorId != null && Number(row.floorId) !== floorId) return false;
		if (roomIds.length && roomIds.indexOf(Number(row.roomId)) === -1) return false;
		if (signatureId != null && !Number.isNaN(signatureId) && Number(row.endUserId) !== signatureId) return false;
		return true;
	});
	var start = (page.pageNum - 1) * page.pageSize;
	return {
		list: rows.slice(start, start + page.pageSize),
		total: rows.length,
		pageNum: page.pageNum,
		pageSize: page.pageSize
	};
}

function statistics() {
	var rows = presentedList();
	var noHomingNum = 0;
	var homingNum = 0;
	var errorHomingNum = 0;
	rows.forEach(function (row) {
		if (row.homingStatus === 1) homingNum++;
		else if (row.homingStatus === 2) errorHomingNum++;
		else noHomingNum++;
	});
	return {
		totalNum: rows.length,
		noHomingNum: noHomingNum,
		homingNum: homingNum,
		errorHomingNum: errorHomingNum
	};
}

function getDetail(gunId) {
	var id = Number(gunId);
	var list = presentedList();
	for (var i = 0; i < list.length; i++) {
		if (list[i].pipetteGunId === id) return list[i];
	}
	return null;
}

function getRackDetail(deviceId) {
	var id = decodeDeviceId(deviceId);
	var rack = findRack(id);
	if (!rack) return null;
	var dept = findDept(rack.departmentId);
	var room = findRoom(rack.roomId);
	return {
		id: rack.id,
		name: rack.name,
		no: rack.no,
		status: rack.status,
		equipmentTypeCode: 13,
		equipmentType: 'PIPETTE_GUN',
		departmentId: rack.departmentId,
		departmentName: dept ? dept.name : '',
		roomId: rack.roomId,
		roomName: room ? room.name : '',
		companyName: '智慧设施演示空间',
		broadcastNum: rack.broadcastNum,
		remark: '演示移液枪架。离线枪架不模拟硬件取还成功。取还为本地模拟确认。',
		createDate: '2026-03-01 09:00:00',
		reportDate: fmt(nowMs()),
		head: 1,
		headUser: '演示用户',
		userName: '演示用户'
	};
}

function listBindings(data) {
	var rackId = Number(data && data.gunRackId);
	var page = parsePage(data);
	var rack = findRack(rackId);
	if (!rack) {
		return {list: [], total: 0, pageNum: page.pageNum, pageSize: page.pageSize};
	}
	var guns = presentedList().filter(function (g) { return g.gunRackId === rackId; });
	var slots = [];
	for (var detent = 1; detent <= rack.slots; detent++) {
		var gun = null;
		for (var i = 0; i < guns.length; i++) {
			if (Number(guns[i].detent) === detent) gun = guns[i];
		}
		if (gun) {
			slots.push({
				id: rackId * 10 + detent,
				detent: detent,
				name: gun.name,
				no: gun.no,
				homingStatus: gun.homingStatus,
				gunRackId: rackId,
				gunRackName: rack.name,
				pipetteGunId: gun.pipetteGunId,
				headUser: gun.headUser,
				position: positionOf(rack),
				takeOutTime: gun.takeOutTime,
				homingTime: gun.homingTime
			});
		} else {
			slots.push({
				id: rackId * 10 + detent,
				detent: detent,
				name: '',
				no: 'null',
				homingStatus: 0,
				gunRackId: rackId,
				gunRackName: rack.name,
				pipetteGunId: 0,
				headUser: '',
				position: positionOf(rack),
				takeOutTime: '',
				homingTime: ''
			});
		}
	}
	var start = (page.pageNum - 1) * page.pageSize;
	return {
		list: slots.slice(start, start + page.pageSize),
		total: slots.length,
		pageNum: page.pageNum,
		pageSize: page.pageSize
	};
}

function loadPending() {
	return parseJson(PENDING_KEY, null);
}

function savePending(row) {
	if (!row) storage.removeDemo(PENDING_KEY);
	else writeJson(PENDING_KEY, row);
}

function requestTake(data) {
	var rackId = Number(data && data.gunRackId);
	var rack = findRack(rackId);
	if (!rack) return {ok: false, message: '未知枪架'};
	if (Number(rack.status) !== 1) {
		return {ok: false, message: '枪架离线，演示不模拟硬件取枪成功'};
	}
	var pending = loadPending();
	if (pending && Number(pending.gunRackId) === rackId && !pending.confirmed) {
		return {ok: false, message: '已有取枪申请，请等待模拟确认或结束后再试'};
	}
	var homed = presentedList().filter(function (g) {
		return g.gunRackId === rackId && g.homingStatus === 1;
	});
	if (!homed.length) return {ok: false, message: '该枪架没有在位移液枪，无法取枪'};
	var user = session.currentUser() || seeds.DEMO_USER;
	savePending({
		gunRackId: rackId,
		userId: Number((data && data.userId) || user.id),
		userName: user.name,
		confirmed: false,
		createdAt: fmt(nowMs())
	});
	return {ok: true, items: {status: 0, message: '已发出取枪申请，等待模拟枪架确认（非真实硬件）'}};
}

function pollTake(data) {
	var rackId = Number(data && data.gunRackId);
	var pending = loadPending();
	if (!pending || Number(pending.gunRackId) !== rackId) {
		return {ok: false, message: '没有取枪申请'};
	}
	if (pending.confirmed && pending.gunId) {
		return {ok: true, items: {status: 1, gunId: pending.gunId, simulated: true}};
	}
	var rack = findRack(rackId);
	if (!rack || Number(rack.status) !== 1) {
		savePending(null);
		return {ok: false, message: '枪架离线，演示不模拟硬件取枪成功'};
	}
	var guns = loadGuns();
	var target = null;
	for (var i = 0; i < guns.length; i++) {
		var view = presentGun(guns[i]);
		if (view.gunRackId === rackId && view.homingStatus === 1) {
			target = guns[i];
			break;
		}
	}
	if (!target) {
		savePending(null);
		return {ok: false, message: '该枪架没有在位移液枪，无法取枪'};
	}
	var user = session.currentUser() || seeds.DEMO_USER;
	target.homingStatus = 0;
	target.takeOutTime = fmt(nowMs());
	target.homingTime = '';
	target.endUser = pending.userName || user.name;
	target.endUserId = pending.userId || user.id;
	saveGuns(guns);
	var records = loadRecords();
	var nextId = 992100;
	records.forEach(function (row) { if (row.id >= nextId) nextId = row.id + 1; });
	records.push({
		id: nextId,
		pipetteGunId: target.pipetteGunId,
		no: target.no,
		pipetteGunName: target.name,
		pipetteGunUser: target.endUser,
		gunUserId: target.endUserId,
		gunRackId: rackId,
		gunRackName: findRack(rackId).name,
		position: target.detent + '号位',
		backGunRackName: '',
		backPosition: '',
		takeOutTime: target.takeOutTime,
		homingTime: '',
		simulated: true
	});
	saveRecords(records);
	pending.confirmed = true;
	pending.gunId = target.pipetteGunId;
	savePending(pending);
	return {ok: true, items: {status: 1, gunId: target.pipetteGunId, simulated: true}};
}

function returnGun(data) {
	var gunId = Number(data && (data.gunId || data.pipetteGunId));
	var guns = loadGuns();
	var gun = null;
	for (var i = 0; i < guns.length; i++) {
		if (guns[i].pipetteGunId === gunId) gun = guns[i];
	}
	if (!gun) return {ok: false, message: '未知移液枪'};
	var view = presentGun(gun);
	if (view.homingStatus === 1) return {ok: false, message: '该移液枪已在位，不能重复归还'};
	var rack = findRack(gun.gunRackId);
	if (!rack) return {ok: false, message: '未知枪架'};
	if (Number(rack.status) !== 1) {
		return {ok: false, message: '枪架离线，演示不模拟硬件归还成功'};
	}
	for (var j = 0; j < guns.length; j++) {
		var other = presentGun(guns[j]);
		if (other.pipetteGunId !== gunId && other.gunRackId === gun.gunRackId && other.detent === gun.detent && other.homingStatus === 1) {
			return {ok: false, message: '目标枪位已被占用'};
		}
	}
	var takeMs = parseTime(gun.takeOutTime);
	var homeMs = nowMs();
	if (Number.isFinite(takeMs) && homeMs < takeMs) {
		return {ok: false, message: '归还时间不能早于取出时间'};
	}
	gun.homingStatus = 1;
	gun.homingTime = fmt(homeMs);
	saveGuns(guns);
	var records = loadRecords();
	for (var k = records.length - 1; k >= 0; k--) {
		if (records[k].pipetteGunId === gunId && !records[k].homingTime) {
			records[k].homingTime = gun.homingTime;
			records[k].backGunRackName = rack.name;
			records[k].backPosition = gun.detent + '号位';
			break;
		}
	}
	saveRecords(records);
	var pending = loadPending();
	if (pending && Number(pending.gunId) === gunId) savePending(null);
	return {ok: true, items: presentGun(gun)};
}

function presentRecord(row) {
	var take = row.takeOutTime;
	var home = row.homingTime;
	var end = home || fmt(nowMs());
	return Object.assign({}, row, {
		durationUse: durationText(take, end),
		duration: durationText(take, end),
		status: home ? 2 : 1,
		process: home ? 1 : 0,
		gunName: row.pipetteGunName,
		endUser: row.pipetteGunUser,
		createDate: take,
		updateDate: home || ''
	});
}

function listHistory(data) {
	var page = parsePage(data);
	var gunId = Number(data && (data.gunId || data.pipetteGunId || data.deviceId));
	var status = data && data.status !== '' && data.status != null ? Number(data.status) : null;
	var userId = data && data.gunUserId != null && data.gunUserId !== '' ? Number(data.gunUserId) : null;
	var rows = loadRecords().map(presentRecord).filter(function (row) {
		if (gunId && !Number.isNaN(gunId) && Number(row.pipetteGunId) !== gunId) return false;
		if (status === 1 && row.homingTime) return false;
		if (status === 2 && !row.homingTime) return false;
		if (userId != null && !Number.isNaN(userId) && Number(row.gunUserId) !== userId) return false;
		return true;
	}).sort(function (a, b) {
		return String(b.takeOutTime).localeCompare(String(a.takeOutTime));
	});
	var start = (page.pageNum - 1) * page.pageSize;
	return {
		list: rows.slice(start, start + page.pageSize),
		total: rows.length,
		pageNum: page.pageNum,
		pageSize: page.pageSize
	};
}

function timeoutAlarms(data) {
	var page = parsePage(data);
	var gunId = Number(data && (data.deviceId || data.gunId || data.id));
	var rows = presentedList().filter(function (g) {
		if (g.homingStatus !== 2) return false;
		if (gunId && !Number.isNaN(gunId) && g.pipetteGunId !== gunId) return false;
		return true;
	}).map(function (g) {
		return {
			id: 993000 + g.pipetteGunId,
			gunName: g.name,
			endUser: g.endUser,
			duration: g.hour + 'h',
			createDate: g.takeOutTime,
			updateDate: '',
			takeOutTime: g.takeOutTime,
			homingTime: '',
			process: 0
		};
	});
	var start = (page.pageNum - 1) * page.pageSize;
	return {
		list: rows.slice(start, start + page.pageSize),
		total: rows.length,
		pageNum: page.pageNum,
		pageSize: page.pageSize
	};
}

function searchGuns(keyword) {
	return presentedList().filter(function (row) {
		return matchKeyword(row, keyword);
	}).map(function (row) {
		return {
			id: row.pipetteGunId,
			pipetteGunId: row.pipetteGunId,
			name: row.name,
			no: row.no,
			type: 101,
			homingStatus: row.homingStatus,
			headUser: row.headUser,
			position: row.position,
			takeOutTime: row.takeOutTime,
			homingTime: row.homingTime
		};
	});
}

function chartBars() {
	return presentedList().map(function (g) {
		var open = loadRecords().filter(function (r) { return r.pipetteGunId === g.pipetteGunId; });
		return {name: g.name, data: open.length, dataUnit: '次'};
	});
}

module.exports = {
	TIMEOUT_MS: TIMEOUT_MS,
	DEMO_RACKS: DEMO_RACKS,
	decodeDeviceId: decodeDeviceId,
	listGuns: listGuns,
	statistics: statistics,
	getDetail: getDetail,
	getRackDetail: getRackDetail,
	listBindings: listBindings,
	requestTake: requestTake,
	pollTake: pollTake,
	returnGun: returnGun,
	listHistory: listHistory,
	timeoutAlarms: timeoutAlarms,
	searchGuns: searchGuns,
	chartBars: chartBars,
	presentedList: presentedList
};
