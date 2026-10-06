var storage = require('./storage.js');
var session = require('./session.js');
var instrument = require('./instrument.js');
var seeds = require('./seeds.js');

var STORE_KEY = 'reservations';
var REMIND_KEY = 'reservationRemind';
var PAGE_SIZE_MAX = 50;
var DUP_WINDOW_MS = 400;

var clockMs = null;
var lastOp = {key: '', at: 0};

function nowMs() {
	return clockMs == null ? Date.now() : clockMs;
}

function setClock(ms) {
	clockMs = ms == null ? null : Number(ms);
}

function pad(n) {
	return n < 10 ? '0' + n : String(n);
}

function formatShanghai(ms) {
	var d = new Date(Number(ms) + 8 * 3600000);
	return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + ' ' +
		pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds());
}

function parseDateTime(value) {
	if (value == null || value === '') return NaN;
	if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
	var s = String(value).trim();
	var m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
	if (m) {
		var y = Number(m[1]);
		var mo = Number(m[2]);
		var d = Number(m[3]);
		var h = Number(m[4]);
		var mi = Number(m[5]);
		var sec = m[6] == null ? 0 : Number(m[6]);
		if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59 || sec > 59) return NaN;
		var utc = Date.UTC(y, mo - 1, d, h - 8, mi, sec);
		if (formatShanghai(utc).slice(0, 10) !== m[1] + '-' + m[2] + '-' + m[3]) return NaN;
		return utc;
	}
	var parsed = Date.parse(s);
	return Number.isFinite(parsed) ? parsed : NaN;
}

function readList() {
	var raw = storage.getDemo(STORE_KEY, '');
	if (!raw) return [];
	if (Array.isArray(raw)) return raw;
	try {
		var parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
		return Array.isArray(parsed) ? parsed : [];
	} catch (e) {
		return [];
	}
}

function writeList(list) {
	storage.setDemo(STORE_KEY, JSON.stringify(list || []));
}

function getRemind() {
	var value = storage.getDemo(REMIND_KEY, 0);
	var n = Number(value);
	return Number.isFinite(n) ? n : 0;
}

function setRemind(code) {
	var n = Number(code);
	if (!Number.isFinite(n) || n < 0) n = 0;
	storage.setDemo(REMIND_KEY, n);
	return n;
}

function parsePage(data) {
	var pageNum = Number(data && data.pageNum);
	var pageSize = Number(data && data.pageSize);
	if (!Number.isFinite(pageNum) || pageNum < 1) pageNum = 1;
	if (!Number.isFinite(pageSize) || pageSize < 1) pageSize = 10;
	if (pageSize > PAGE_SIZE_MAX) pageSize = PAGE_SIZE_MAX;
	return {pageNum: Math.floor(pageNum), pageSize: Math.floor(pageSize)};
}

function statusOf(row, at) {
	if (row && row.cancelled) return 3;
	var start = parseDateTime(row.timeFrom);
	var end = parseDateTime(row.timeTo);
	var t = at == null ? nowMs() : at;
	if (end <= t) return 2;
	if (start <= t) return 1;
	return 0;
}

function overlaps(aFrom, aTo, bFrom, bTo) {
	return aFrom < bTo && aTo > bFrom;
}

function present(row) {
	var detail = instrument.getDetail(row.instrumentId) || {};
	return {
		id: row.id,
		instrumentId: row.instrumentId,
		instrumentName: detail.name || '',
		instrumentNo: detail.no || '',
		userId: row.userId,
		userName: row.userName,
		timeFrom: row.timeFrom,
		timeTo: row.timeTo,
		remark: row.remark || '',
		createDate: row.createDate,
		updateDate: row.updateDate || row.createDate,
		cancelled: !!row.cancelled,
		status: statusOf(row),
		tel: row.tel || '—'
	};
}

function failMsg(message) {
	return {ok: false, message: message};
}

function guardDup(key) {
	var at = nowMs();
	if (lastOp.key === key && at - lastOp.at < DUP_WINDOW_MS) {
		return failMsg('请勿重复提交');
	}
	lastOp = {key: key, at: at};
	return null;
}

function saveReservation(body, update) {
	var user = session.currentUser() || seeds.DEMO_USER;
	var list = readList();
	var old = null;
	if (update) {
		old = list.filter(function (row) { return Number(row.id) === Number(body && body.id); })[0];
		if (!old) return failMsg('预约不存在');
		if (Number(old.userId) !== Number(user.id)) return failMsg('无权修改该预约');
		if (old.cancelled) return failMsg('预约已取消，不能修改');
		if (statusOf(old) === 2) return failMsg('预约已结束，不能修改');
	}
	var instrumentId = Number(update ? old.instrumentId : body && body.instrumentId);
	var entity = instrument.findInstrument(instrumentId);
	if (!entity) return failMsg('未知设备');
	var start = parseDateTime(body && body.timeFrom);
	var end = parseDateTime(body && body.timeTo);
	if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
		return failMsg('请选择有效的开始和结束时间，结束时间须晚于开始时间');
	}
	var now = nowMs();
	var oldStart = old ? parseDateTime(old.timeFrom) : NaN;
	var inUse = old && statusOf(old) === 1;
	if (end <= now) return failMsg('预约时间已过去');
	if (!old || oldStart > now) {
		if (start < now) return failMsg('预约时间已过去');
	}
	if (inUse && start !== oldStart) {
		return failMsg('进行中的预约不可修改开始时间');
	}
	var conflict = list.some(function (row) {
		if (row.cancelled) return false;
		if (Number(row.instrumentId) !== instrumentId) return false;
		if (old && Number(row.id) === Number(old.id)) return false;
		return overlaps(start, end, parseDateTime(row.timeFrom), parseDateTime(row.timeTo));
	});
	if (conflict) return failMsg('该时段已有预约，请选择其他时间');
	var dup = guardDup((update ? 'u' : 'a') + ':' + instrumentId + ':' + start + ':' + end);
	if (dup) return dup;
	var row = {
		id: old ? old.id : Math.max(now, list.reduce(function (max, item) { return Math.max(max, Number(item.id) || 0); }, 0) + 1),
		instrumentId: instrumentId,
		userId: old ? old.userId : user.id,
		userName: old ? old.userName : user.name,
		timeFrom: inUse ? old.timeFrom : formatShanghai(start),
		timeTo: formatShanghai(end),
		remark: body && body.remark != null ? String(body.remark) : (old ? old.remark : ''),
		createDate: old ? old.createDate : formatShanghai(now),
		updateDate: formatShanghai(now),
		cancelled: false,
		departmentId: entity.departmentId,
		tel: user.tel || '—'
	};
	if (old) {
		writeList(list.map(function (item) { return Number(item.id) === Number(old.id) ? row : item; }));
	} else {
		writeList(list.concat([row]));
	}
	return {ok: true, row: present(row)};
}

function cancelReservation(id) {
	var user = session.currentUser() || seeds.DEMO_USER;
	var list = readList();
	var row = list.filter(function (item) { return Number(item.id) === Number(id); })[0];
	if (!row) return failMsg('预约不存在');
	if (Number(row.userId) !== Number(user.id)) return failMsg('无权取消该预约');
	if (row.cancelled) return failMsg('预约已取消');
	if (statusOf(row) === 2) return failMsg('预约已结束，不能取消');
	var dup = guardDup('c:' + row.id);
	if (dup) return dup;
	writeList(list.map(function (item) {
		return Number(item.id) === Number(row.id) ? Object.assign({}, item, {cancelled: true, updateDate: formatShanghai(nowMs())}) : item;
	}));
	return {ok: true, row: present(Object.assign({}, row, {cancelled: true}))};
}

function calendarList(data) {
	var instrumentId = Number(data && data.instrumentId);
	if (!instrument.findInstrument(instrumentId)) return failMsg('未知设备');
	var winStart = data && data.startDate ? parseDateTime(data.startDate) : NaN;
	var winEnd = data && data.endDate ? parseDateTime(data.endDate) : NaN;
	var list = readList().filter(function (row) {
		if (row.cancelled) return false;
		if (Number(row.instrumentId) !== instrumentId) return false;
		var start = parseDateTime(row.timeFrom);
		var end = parseDateTime(row.timeTo);
		if (Number.isFinite(winStart) && end <= winStart) return false;
		if (Number.isFinite(winEnd) && start >= winEnd) return false;
		return true;
	}).map(present);
	return {ok: true, list: list};
}

function myPage(data) {
	var user = session.currentUser() || seeds.DEMO_USER;
	var statusFilter = data && data.status;
	var hasStatus = statusFilter !== '' && statusFilter != null && Number(statusFilter) !== 10 && !Number.isNaN(Number(statusFilter));
	var rows = readList().filter(function (row) {
		if (Number(row.userId) !== Number(user.id)) return false;
		if (hasStatus && statusOf(row) !== Number(statusFilter)) return false;
		return true;
	}).map(present).sort(function (a, b) { return b.id - a.id; });
	var page = parsePage(data);
	var start = (page.pageNum - 1) * page.pageSize;
	return {
		remind: getRemind(),
		pageData: {
			list: start >= rows.length ? [] : rows.slice(start, start + page.pageSize),
			total: rows.length,
			pageNum: page.pageNum,
			pageSize: page.pageSize
		}
	};
}

function userStats() {
	var user = session.currentUser() || seeds.DEMO_USER;
	var noStartNum = 0;
	var inUseNum = 0;
	var closedNum = 0;
	readList().forEach(function (row) {
		if (Number(row.userId) !== Number(user.id)) return;
		var status = statusOf(row);
		if (status === 0) noStartNum += 1;
		else if (status === 1) inUseNum += 1;
		else if (status === 2) closedNum += 1;
	});
	return {noStartNum: noStartNum, inUseNum: inUseNum, closedNum: closedNum};
}

function insertRowForTest(row) {
	var list = readList();
	writeList(list.concat([row]));
}

module.exports = {
	STORE_KEY: STORE_KEY,
	REMIND_KEY: REMIND_KEY,
	parseDateTime: parseDateTime,
	formatShanghai: formatShanghai,
	setClock: setClock,
	nowMs: nowMs,
	statusOf: statusOf,
	saveReservation: saveReservation,
	cancelReservation: cancelReservation,
	calendarList: calendarList,
	myPage: myPage,
	userStats: userStats,
	getRemind: getRemind,
	setRemind: setRemind,
	insertRowForTest: insertRowForTest,
	readList: readList
};
