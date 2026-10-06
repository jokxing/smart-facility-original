/**
 * MP4 reservation create/conflict/update/cancel checks.
 */
var assert = require('assert');
var path = require('path');
var store = {};
global.__SF_UNI__ = {
	getStorageSync: function (key) {
		return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : '';
	},
	setStorageSync: function (key, value) {
		store[key] = value;
	},
	removeStorageSync: function (key) {
		delete store[key];
	}
};
global.uni = global.__SF_UNI__;

var root = path.join(__dirname, '..', 'miniprogram');
var handlers = require(path.join(root, 'utils/demo/handlers.js'));
var session = require(path.join(root, 'utils/demo/session.js'));
var reservation = require(path.join(root, 'utils/demo/reservation.js'));
var storage = require(path.join(root, 'utils/demo/storage.js'));

function check(name, fn) {
	fn();
	console.log('ok', name);
}

session.login('demo', 'Demo1234');
var token = session.currentToken();
reservation.setClock(Date.parse('2026-10-06T04:00:00.000Z'));
storage.removeDemo('reservations');
storage.removeDemo('reservationRemind');

function add(body) {
	return handlers.handleDemoRequest('POST', '/api/instrument/reservation/add', body, token);
}

check('empty list is valid', function () {
	var mine = handlers.handleDemoRequest('POST', '/api/instrument/reservation/mini/schedulerList', {pageNum: 1, pageSize: 10}, token);
	assert.strictEqual(mine.code, 1);
	assert.strictEqual(mine.items.pageData.total, 0);
	var stats = handlers.handleDemoRequest('GET', '/api/thingsUser/all/stat/app', {}, token);
	assert.strictEqual(stats.items.reservationStatistics.noStartNum, 0);
});

check('create future, calendar and mine share store', function () {
	var created = add({
		instrumentId: 970001,
		userId: 1,
		userName: '伪造用户',
		timeFrom: '2026-10-07 10:00:00',
		timeTo: '2026-10-07 11:00:00'
	});
	assert.strictEqual(created.code, 1);
	assert.strictEqual(created.items.userName, '演示用户');
	assert.strictEqual(created.items.userId, 900001);
	assert.strictEqual(created.items.instrumentName, '演示培养箱');
	var cal = handlers.handleDemoRequest('POST', '/api/instrument/reservation/schedulerListV1', {
		instrumentId: 970001,
		startDate: '2026-10-07 00:00:00',
		endDate: '2026-10-07 23:59:59'
	}, token);
	assert.strictEqual(cal.items.length, 1);
	assert.strictEqual(cal.items[0].id, created.items.id);
	var mine = handlers.handleDemoRequest('POST', '/api/instrument/reservation/mini/schedulerList', {pageNum: 1, pageSize: 10}, token);
	assert.strictEqual(mine.items.pageData.total, 1);
	assert.strictEqual(mine.items.pageData.list[0].status, 0);
	var stats = handlers.handleDemoRequest('GET', '/api/thingsUser/all/stat/app', {}, token);
	assert.strictEqual(stats.items.reservationStatistics.noStartNum, 1);
});

check('conflict adjoining and other device', function () {
	var conflict = add({
		instrumentId: 970001,
		timeFrom: '2026-10-07 10:30:00',
		timeTo: '2026-10-07 11:30:00'
	});
	assert.strictEqual(conflict.code, 0);
	var adj = add({
		instrumentId: 970001,
		timeFrom: '2026-10-07 11:00:00',
		timeTo: '2026-10-07 12:00:00'
	});
	assert.strictEqual(adj.code, 1);
	var other = add({
		instrumentId: 970002,
		timeFrom: '2026-10-07 10:00:00',
		timeTo: '2026-10-07 11:00:00'
	});
	assert.strictEqual(other.code, 1);
});

check('cross day and invalid/past', function () {
	var cross = add({
		instrumentId: 970003,
		timeFrom: '2026-10-07 22:00:00',
		timeTo: '2026-10-08 02:00:00'
	});
	assert.strictEqual(cross.code, 1);
	var bad = add({
		instrumentId: 970003,
		timeFrom: '2026-10-08 03:00:00',
		timeTo: '2026-10-08 02:00:00'
	});
	assert.strictEqual(bad.code, 0);
	var past = add({
		instrumentId: 970003,
		timeFrom: '2026-10-05 10:00:00',
		timeTo: '2026-10-05 11:00:00'
	});
	assert.strictEqual(past.code, 0);
	var unknown = add({
		instrumentId: 1,
		timeFrom: '2026-10-08 10:00:00',
		timeTo: '2026-10-08 11:00:00'
	});
	assert.strictEqual(unknown.code, 0);
	var calMiss = handlers.handleDemoRequest('POST', '/api/instrument/reservation/schedulerListV1', {instrumentId: 1}, token);
	assert.strictEqual(calMiss.code, 0);
});

check('update keeps id and releases old slot', function () {
	var mine = handlers.handleDemoRequest('POST', '/api/instrument/reservation/mini/schedulerList', {pageNum: 1, pageSize: 10, status: 0}, token);
	var first = mine.items.pageData.list.filter(function (row) { return row.instrumentId === 970001 && row.timeFrom.indexOf('10:00:00') !== -1; })[0];
	var updated = handlers.handleDemoRequest('POST', '/api/instrument/reservation/update', {
		id: first.id,
		timeFrom: '2026-10-07 13:00:00',
		timeTo: '2026-10-07 14:00:00'
	}, token);
	assert.strictEqual(updated.code, 1);
	assert.strictEqual(updated.items.id, first.id);
	var reuse = add({
		instrumentId: 970001,
		timeFrom: '2026-10-07 10:00:00',
		timeTo: '2026-10-07 11:00:00'
	});
	assert.strictEqual(reuse.code, 1);
});

check('in-progress only end can change', function () {
	reservation.setClock(Date.parse('2026-10-07T01:30:00.000Z'));
	var live = add({
		instrumentId: 970008,
		timeFrom: '2026-10-07 10:00:00',
		timeTo: '2026-10-07 12:00:00'
	});
	assert.strictEqual(live.code, 1);
	reservation.setClock(Date.parse('2026-10-07T03:00:00.000Z'));
	var startChange = handlers.handleDemoRequest('POST', '/api/instrument/reservation/update', {
		id: live.items.id,
		timeFrom: '2026-10-07 10:30:00',
		timeTo: '2026-10-07 12:00:00'
	}, token);
	assert.strictEqual(startChange.code, 0);
	var endChange = handlers.handleDemoRequest('POST', '/api/instrument/reservation/update', {
		id: live.items.id,
		timeFrom: '2026-10-07 10:00:00',
		timeTo: '2026-10-07 13:00:00'
	}, token);
	assert.strictEqual(endChange.code, 1);
	assert.strictEqual(endChange.items.timeFrom, '2026-10-07 10:00:00');
});

check('cancel keeps history and rejects repeat / ended / others', function () {
	reservation.setClock(Date.parse('2026-10-06T04:00:00.000Z'));
	var row = add({
		instrumentId: 970004,
		timeFrom: '2026-10-09 09:00:00',
		timeTo: '2026-10-09 10:00:00'
	});
	var cancelled = handlers.handleDemoRequest('POST', '/api/instrument/reservation/cancel/' + row.items.id, {}, token);
	assert.strictEqual(cancelled.code, 1);
	var mine = handlers.handleDemoRequest('POST', '/api/instrument/reservation/mini/schedulerList', {pageNum: 1, pageSize: 50, status: 3}, token);
	assert.ok(mine.items.pageData.list.some(function (item) { return item.id === row.items.id && item.status === 3; }));
	var cal = handlers.handleDemoRequest('POST', '/api/instrument/reservation/schedulerListV1', {
		instrumentId: 970004,
		startDate: '2026-10-09 00:00:00',
		endDate: '2026-10-09 23:59:59'
	}, token);
	assert.strictEqual(cal.items.length, 0);
	var again = handlers.handleDemoRequest('POST', '/api/instrument/reservation/cancel/' + row.items.id, {}, token);
	assert.strictEqual(again.code, 0);
	var ended = add({
		instrumentId: 970005,
		timeFrom: '2026-10-08 09:00:00',
		timeTo: '2026-10-08 10:00:00'
	});
	reservation.setClock(Date.parse('2026-10-08T03:00:00.000Z'));
	var cancelEnded = handlers.handleDemoRequest('POST', '/api/instrument/reservation/cancel/' + ended.items.id, {}, token);
	assert.strictEqual(cancelEnded.code, 0);
	var editEnded = handlers.handleDemoRequest('POST', '/api/instrument/reservation/update', {
		id: ended.items.id,
		timeFrom: '2026-10-09 09:00:00',
		timeTo: '2026-10-09 10:00:00'
	}, token);
	assert.strictEqual(editEnded.code, 0);
	reservation.insertRowForTest({
		id: 880001,
		instrumentId: 970006,
		userId: 900099,
		userName: '他人',
		timeFrom: '2026-10-10 09:00:00',
		timeTo: '2026-10-10 10:00:00',
		cancelled: false,
		createDate: '2026-10-06 12:00:00'
	});
	reservation.setClock(Date.parse('2026-10-06T04:00:00.000Z'));
	var steal = handlers.handleDemoRequest('POST', '/api/instrument/reservation/cancel/880001', {}, token);
	assert.strictEqual(steal.code, 0);
});

check('remind local only and persist after logout', function () {
	var remind = handlers.handleDemoRequest('POST', '/api/instrument/reservation/remind', {reservationRemind: 3}, token);
	assert.strictEqual(remind.code, 1);
	assert.ok(String(remind.message).indexOf('演示不发送通知') !== -1);
	session.logout();
	assert.strictEqual(session.currentToken(), '');
	assert.ok(storage.getDemo('reservations'));
	session.login('demo', 'Demo1234');
	token = session.currentToken();
	var mine = handlers.handleDemoRequest('POST', '/api/instrument/reservation/mini/schedulerList', {pageNum: 1, pageSize: 10}, token);
	assert.strictEqual(mine.items.remind, 3);
	assert.ok(mine.items.pageData.total >= 1);
});

check('session required', function () {
	var closed = handlers.handleDemoRequest('POST', '/api/instrument/reservation/add', {
		instrumentId: 970001,
		timeFrom: '2026-10-11 09:00:00',
		timeTo: '2026-10-11 10:00:00'
	}, '');
	assert.strictEqual(closed.code, 2);
});

reservation.setClock(null);
console.log('MP4 checks passed');
