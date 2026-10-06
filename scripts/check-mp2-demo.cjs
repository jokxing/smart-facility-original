/**
 * MP2 instrument list/detail/monitor checks.
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
var instrument = require(path.join(root, 'utils/demo/instrument.js'));

function check(name, fn) {
	fn();
	console.log('ok', name);
}

session.login('demo', 'Demo1234');
var token = session.currentToken();

check('list paging two pages', function () {
	var page1 = handlers.handleDemoRequest('POST', '/api/instrument/things/list/miniApp/v2', {pageNum: 1, pageSize: 10}, token);
	var page2 = handlers.handleDemoRequest('POST', '/api/instrument/things/list/miniApp/v2', {pageNum: 2, pageSize: 10}, token);
	var page9 = handlers.handleDemoRequest('POST', '/api/instrument/things/list/miniApp/v2', {pageNum: 9, pageSize: 10}, token);
	assert.strictEqual(page1.code, 1);
	assert.strictEqual(page1.items.total, 12);
	assert.strictEqual(page1.items.list.length, 10);
	assert.strictEqual(page2.items.list.length, 2);
	assert.strictEqual(page9.items.list.length, 0);
	assert.strictEqual(page9.items.total, 12);
	var ids = page1.items.list.concat(page2.items.list).map(function (row) { return row.id; });
	assert.strictEqual(new Set(ids).size, 12);
	assert.ok(ids.indexOf(970008) !== -1);
});

check('alarm filter only 970008', function () {
	var res = handlers.handleDemoRequest('POST', '/api/instrument/things/list/miniApp/v2', {status: 2, pageNum: 1, pageSize: 10}, token);
	assert.strictEqual(res.items.total, 1);
	assert.strictEqual(res.items.list[0].id, 970008);
	assert.strictEqual(res.items.list[0].senorStatus, 2);
	assert.strictEqual(res.items.list[0].status, 1);
});

check('standby empty and stats ignore sensor tab', function () {
	var empty = handlers.handleDemoRequest('POST', '/api/instrument/things/list/miniApp/v2', {instrumentStatus: 0, pageNum: 1, pageSize: 10}, token);
	assert.strictEqual(empty.items.total, 0);
	var stats = handlers.handleDemoRequest('GET', '/api/instrument/mini/statistics', {status: 2}, token);
	assert.strictEqual(stats.items.monitorCount, 12);
	assert.strictEqual(stats.items.normalCount, 11);
	assert.strictEqual(stats.items.alarmCount, 1);
	var scoped = handlers.handleDemoRequest('GET', '/api/instrument/mini/statistics', {roomIds: [950003]}, token);
	assert.strictEqual(scoped.items.monitorCount, 6);
	assert.strictEqual(scoped.items.alarmCount, 1);
});

check('detail and unknown id', function () {
	var ok = handlers.handleDemoRequest('GET', '/api/instrument/detail', {id: 970008}, token);
	assert.strictEqual(ok.code, 1);
	assert.strictEqual(ok.items.status, 1);
	assert.strictEqual(ok.items.bingStatus, 2);
	assert.strictEqual(ok.items.roomName, '演示房间 B');
	var miss = handlers.handleDemoRequest('GET', '/api/instrument/detail', {id: 1}, token);
	assert.strictEqual(miss.code, 0);
});

check('search instruments only', function () {
	var res = handlers.handleDemoRequest('POST', '/api/instrument/search', {keyword: '示波器 B'}, token);
	assert.strictEqual(res.code, 1);
	assert.strictEqual(res.items.length, 1);
	assert.strictEqual(res.items[0].type, 2);
	assert.strictEqual(res.items[0].id, 970008);
	var empty = handlers.handleDemoRequest('POST', '/api/instrument/search', {keyword: '移液枪'}, token);
	assert.strictEqual(empty.items.length, 4);
	assert.ok(empty.items.every(function (row) { return row.name.indexOf('移液枪') !== -1; }));
});

check('monitor thresholds and chart', function () {
	var open = handlers.handleDemoRequest('GET', '/api/monitorIndicator/getOpenMonitorFlag', {objId: 970008, objType: 2}, token);
	assert.strictEqual(open.code, 1);
	assert.strictEqual(open.items.list[0].monitorSensorVal, '45.2');
	assert.strictEqual(open.items.list[0].normalMax, 40);
	assert.strictEqual(open.items.list[1].monitorSensorVal, '85.0');
	var chart = handlers.handleDemoRequest('GET', '/api/monitorIndicator/monitorInfo', {
		objId: 970008, objType: 2, type: 2, objSensorId: open.items.list[0].objSensorId, interval: 2
	}, token);
	assert.ok(chart.items.length > 2);
	assert.ok(chart.items[0].data > 30);
	var normal = handlers.handleDemoRequest('GET', '/api/monitorIndicator/getOpenMonitorFlag', {objId: 970001, objType: 2}, token);
	assert.strictEqual(normal.items.list[0].monitorSensorVal, '5.2');
	var emptyHw = handlers.handleDemoRequest('GET', '/api/monitorIndicator/things/newList', {objId: 970001, objType: 2}, token);
	assert.deepStrictEqual(emptyHw.items.list, []);
});

check('session required', function () {
	var closed = handlers.handleDemoRequest('POST', '/api/instrument/things/list/miniApp/v2', {pageNum: 1, pageSize: 10}, '');
	assert.strictEqual(closed.code, 2);
});

check('department filter empty', function () {
	var none = instrument.listInstruments({departmentIds: [1], pageNum: 1, pageSize: 10});
	assert.strictEqual(none.total, 0);
});

console.log('MP2 checks passed');
