/**
 * MP3 room list/detail/ownership checks.
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

function check(name, fn) {
	fn();
	console.log('ok', name);
}

session.login('demo', 'Demo1234');
var token = session.currentToken();

check('stats ignore sensor tab', function () {
	var all = handlers.handleDemoRequest('GET', '/api/room/mini/statistics', {}, token);
	assert.strictEqual(all.code, 1);
	assert.strictEqual(all.items.monitoringNum, 3);
	assert.strictEqual(all.items.normalNum, 2);
	assert.strictEqual(all.items.policeNum, 1);
	assert.strictEqual(all.items.leaveNum, 0);
	var still = handlers.handleDemoRequest('GET', '/api/room/mini/statistics', {status: 2}, token);
	assert.strictEqual(still.items.monitoringNum, 3);
	assert.strictEqual(still.items.policeNum, 1);
});

check('list filter alarm only B', function () {
	var res = handlers.handleDemoRequest('POST', '/api/room/things/list/miniApp', {
		status: 2, pageNum: 1, pageSize: 10
	}, token);
	assert.strictEqual(res.items.total, 1);
	assert.strictEqual(res.items.list[0].id, 950003);
	assert.strictEqual(res.items.list[0].name, '演示房间 B');
	assert.strictEqual(res.items.list[0].senorStatus, 2);
});

check('corridor normal without sensors', function () {
	var res = handlers.handleDemoRequest('POST', '/api/room/things/list/miniApp', {
		keyword: '走廊', pageNum: 1, pageSize: 10
	}, token);
	assert.strictEqual(res.items.total, 1);
	assert.strictEqual(res.items.list[0].id, 950002);
	assert.strictEqual(res.items.list[0].senorStatus, 1);
	assert.deepStrictEqual(res.items.list[0].sensorList, []);
});

check('invalid space empty not fallback', function () {
	var miss = handlers.handleDemoRequest('POST', '/api/room/things/list/miniApp', {
		gardenId: 999, pageNum: 1, pageSize: 10
	}, token);
	assert.strictEqual(miss.items.total, 0);
	assert.deepStrictEqual(miss.items.list, []);
	var page9 = handlers.handleDemoRequest('POST', '/api/room/things/list/miniApp', {
		pageNum: 9, pageSize: 10
	}, token);
	assert.strictEqual(page9.items.total, 3);
	assert.strictEqual(page9.items.list.length, 0);
});

check('room B detail owns 970008 not A devices', function () {
	var b = handlers.handleDemoRequest('GET', '/api/room/detail', {id: 950003}, token);
	assert.strictEqual(b.code, 1);
	assert.strictEqual(b.items.senorStatus, 2);
	var ids = b.items.instrumentList.map(function (row) { return row.id; });
	assert.ok(ids.indexOf(970008) !== -1);
	assert.ok(ids.indexOf(970001) === -1);
	assert.strictEqual(ids.length, 6);
	var alarm = b.items.instrumentList.filter(function (row) { return row.id === 970008; })[0];
	assert.strictEqual(alarm.bingStatus, 2);
	var a = handlers.handleDemoRequest('GET', '/api/room/detail', {id: 950001}, token);
	assert.strictEqual(a.items.senorStatus, 1);
	var aIds = a.items.instrumentList.map(function (row) { return row.id; });
	assert.ok(aIds.indexOf(970001) !== -1);
	assert.ok(aIds.indexOf(970008) === -1);
	var corridor = handlers.handleDemoRequest('GET', '/api/room/detail', {id: 950002}, token);
	assert.deepStrictEqual(corridor.items.instrumentList, []);
	var unknown = handlers.handleDemoRequest('GET', '/api/room/detail', {id: 1}, token);
	assert.strictEqual(unknown.code, 0);
});

check('room probes and hardware empty', function () {
	var probes = handlers.handleDemoRequest('GET', '/api/monitorIndicator/getOpenMonitorFlag', {
		objId: 950002, objType: 3
	}, token);
	assert.strictEqual(probes.code, 1);
	assert.deepStrictEqual(probes.items.list, []);
	var hw = handlers.handleDemoRequest('GET', '/api/monitorIndicator/things/newList', {
		objId: 950003, objType: 3, pageNum: 1, pageSize: 10
	}, token);
	assert.deepStrictEqual(hw.items.list, []);
	var chart = handlers.handleDemoRequest('GET', '/api/monitorIndicator/monitorInfo', {
		objId: 950001, type: 3, objSensorId: 1, interval: 2
	}, token);
	assert.deepStrictEqual(chart.items, []);
});

check('chip list vs mini list', function () {
	var chips = handlers.handleDemoRequest('POST', '/api/room/list', {keyword: '', pageNum: 1, pageSize: 10}, token);
	assert.strictEqual(chips.items.total, 3);
	var designer = handlers.handleDemoRequest('POST', '/api/room/list', {floorId: 930001, pageNum: 1, pageSize: 10}, token);
	assert.strictEqual(designer.items.total, 0);
});

check('search includes rooms', function () {
	var res = handlers.handleDemoRequest('POST', '/api/instrument/search', {keyword: '演示走廊'}, token);
	assert.strictEqual(res.items.length, 1);
	assert.strictEqual(res.items[0].type, 3);
	assert.strictEqual(res.items[0].id, 950002);
});

check('session required', function () {
	var closed = handlers.handleDemoRequest('POST', '/api/room/things/list/miniApp', {pageNum: 1, pageSize: 10}, '');
	assert.strictEqual(closed.code, 2);
});

console.log('MP3 checks passed');
