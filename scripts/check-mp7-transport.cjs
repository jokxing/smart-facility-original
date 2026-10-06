/**
 * Mini program transport mock checks.
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
var storage = require(path.join(root, 'utils/demo/storage.js'));

function check(name, fn) {
	fn();
	console.log('ok', name);
}

session.login('demo', 'Demo1234');
var token = session.currentToken();
storage.removeDemo('transportState');
storage.removeDemo('transportCreated');

check('dashboard and list share counts; query 0 is all', function () {
	var dash = handlers.handleDemoRequest('GET', '/api/transportOrder/dashboard/wx', {}, token);
	assert.strictEqual(dash.code, 1);
	assert.strictEqual(dash.items.allNum, 10);
	assert.strictEqual(dash.items.loadedCarNum, 2);
	assert.strictEqual(dash.items.inTransitNum, 3);
	assert.strictEqual(dash.items.arrivedNum, 2);
	var all = handlers.handleDemoRequest('POST', '/api/transportOrder/list/wx', {state: 0, pageNum: 1, pageSize: 20}, token);
	assert.strictEqual(all.items.total, 10);
	var loaded = handlers.handleDemoRequest('POST', '/api/transportOrder/list/wx', {state: 1, pageNum: 1, pageSize: 20}, token);
	assert.strictEqual(loaded.items.total, 2);
});

check('unknown detail fails without fake success', function () {
	var miss = handlers.handleDemoRequest('GET', '/api/transportOrder/detail/wx/1', {}, token);
	assert.strictEqual(miss.code, 0);
});

check('profession number search keeps dashboard and list consistent', function () {
	var query = {keyword: 'PN-005', state: 0};
	var list = handlers.handleDemoRequest('POST', '/api/transportOrder/list/wx', query, token);
	var dash = handlers.handleDemoRequest('GET', '/api/transportOrder/dashboard/wx', query, token);
	assert.strictEqual(list.items.total, 1);
	assert.strictEqual(dash.items.allNum, list.items.total);
});

check('depart and arrive update list filter', function () {
	var skip = handlers.handleDemoRequest('POST', '/api/transportOrder/change/state', {ids: [881001], state: 2}, token);
	assert.strictEqual(skip.code, 0);
	var hint = handlers.handleDemoRequest('GET', '/api/transportOrder/change/getStateInfo', {carId: 882002}, token);
	assert.strictEqual(hint.code, 1);
	var ids = hint.items.transportOrderStartListVos.map(function (row) { return row.id; });
	var go = handlers.handleDemoRequest('POST', '/api/transportOrder/change/state', {ids: ids, state: 2}, token);
	assert.strictEqual(go.code, 1);
	var loaded = handlers.handleDemoRequest('POST', '/api/transportOrder/list/wx', {state: 1, pageNum: 1, pageSize: 20}, token);
	assert.strictEqual(loaded.items.total, 0);
	var transit = handlers.handleDemoRequest('POST', '/api/transportOrder/list/wx', {state: 2, pageNum: 1, pageSize: 20}, token);
	assert.ok(transit.items.list.some(function (row) { return row.id === 881003; }));
	var arrive = handlers.handleDemoRequest('POST', '/api/transportOrder/change/state', {ids: [881004], state: 3}, token);
	assert.strictEqual(arrive.code, 1);
	var still = handlers.handleDemoRequest('POST', '/api/transportOrder/list/wx', {state: 2, pageNum: 1, pageSize: 20}, token);
	assert.ok(!still.items.list.some(function (row) { return row.id === 881004; }));
});

check('print is demo voucher; bluetooth refused', function () {
	var preview = handlers.handleDemoRequest('GET', '/api/transportOrder/print/new/881007', {historyTimeInterval: 15}, token);
	assert.strictEqual(preview.code, 1);
	assert.strictEqual(preview.items.demoVoucher, true);
	var ble = handlers.handleDemoRequest('GET', '/api/transportOrder/print/stream', {}, token);
	assert.strictEqual(ble.code, 0);
});

check('logout keeps transport overlay', function () {
	handlers.handleDemoRequest('POST', '/api/transportOrder/change/state', {ids: [881006], state: 3}, token);
	session.logout();
	session.login('demo', 'Demo1234');
	token = session.currentToken();
	var detail = handlers.handleDemoRequest('GET', '/api/transportOrder/detail/wx/881006', {}, token);
	assert.strictEqual(detail.items.state, 3);
});

console.log('check-mp7-transport: all passed');
