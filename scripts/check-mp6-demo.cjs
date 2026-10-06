/**
 * MP6 pipette gun take/return / list / timeout checks (mini program).
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
storage.removeDemo('gunState');
storage.removeDemo('gunRecords');
storage.removeDemo('gunPending');

check('list and stats exclude empty slots', function () {
	var stats = handlers.handleDemoRequest('POST', '/api/gun/pipette/statistics', {}, token);
	assert.strictEqual(stats.code, 1);
	assert.strictEqual(stats.items.totalNum, 4);
	assert.strictEqual(stats.items.homingNum, 2);
	assert.strictEqual(stats.items.noHomingNum, 1);
	assert.strictEqual(stats.items.errorHomingNum, 1);
	var list = handlers.handleDemoRequest('POST', '/api/gun/pipette/list', {pageNum: 1, pageSize: 10}, token);
	assert.strictEqual(list.items.total, 4);
	assert.ok(list.items.list.every(function (row) { return row.no !== 'null' && row.no; }));
	var timeout = handlers.handleDemoRequest('POST', '/api/gun/pipette/list', {status: 2, pageNum: 1, pageSize: 10}, token);
	assert.strictEqual(timeout.items.total, 1);
	assert.strictEqual(timeout.items.list[0].no, 'PG-003');
	assert.ok(timeout.items.list[0].hour >= 24);
});

check('bindings keep empty slot and live status', function () {
	var bind = handlers.handleDemoRequest('POST', '/api/gun/pipette/binding/list', {
		gunRackId: 980023, pageNum: 1, pageSize: 10
	}, token);
	assert.strictEqual(bind.items.total, 4);
	assert.strictEqual(bind.items.list[0].no, 'PG-001');
	assert.strictEqual(bind.items.list[1].homingStatus, 1);
	assert.strictEqual(bind.items.list[3].no, 'null');
});

check('timeout is computed not a static badge', function () {
	var detail = handlers.handleDemoRequest('GET', '/api/gun/pipette/detail', {gunId: 991003}, token);
	assert.strictEqual(detail.items.homingStatus, 2);
	assert.ok(detail.items.hour >= 24);
	var alarms = handlers.handleDemoRequest('GET', '/api/history/device/alarm', {deviceId: 991003, type: 200}, token);
	assert.ok(alarms.items.total >= 1);
});

check('offline rack cannot simulate take', function () {
	var take = handlers.handleDemoRequest('POST', '/api/gun/take/pipette', {gunRackId: 980024}, token);
	assert.strictEqual(take.code, 0);
	assert.ok(String(take.message).indexOf('离线') !== -1);
});

check('overdue return uses on-rack text and color across views', function () {
	var fs = require('fs');
	var vm = require('vm');
	var source = fs.readFileSync(path.join(root, 'utils/constant.js'), 'utf8');
	var expression = source.match(/export const GUNSTATUS\s*=\s*(\[[\s\S]*?\]);/)[1];
	var status = vm.runInNewContext(expression, {i18n: {t: function (key) { return key; }}});
	assert.strictEqual(status[0].label, 'other.homing');
	assert.strictEqual(status[1].label, 'other.noHoming');
	assert.strictEqual(status[1].value, 'noHoming');
	var ret = handlers.handleDemoRequest('POST', '/api/gun/return/pipette', {gunId: 991003}, token);
	assert.strictEqual(ret.code, 1);
	var detail = handlers.handleDemoRequest('GET', '/api/gun/pipette/detail', {gunId: 991003}, token).items;
	assert.strictEqual(detail.homingStatus, 1);
	assert.ok(detail.homingTime && detail.preciseLocation);
	var list = handlers.handleDemoRequest('POST', '/api/gun/pipette/list', {status: 2}, token).items;
	assert.strictEqual(list.total, 0);
	storage.removeDemo('gunState');
	storage.removeDemo('gunRecords');
});

check('take is request then simulated confirm', function () {
	var req = handlers.handleDemoRequest('POST', '/api/gun/take/pipette', {gunRackId: 980023, userId: 900001}, token);
	assert.strictEqual(req.code, 1);
	assert.strictEqual(req.items.status, 0);
	var dup = handlers.handleDemoRequest('POST', '/api/gun/take/pipette', {gunRackId: 980023}, token);
	assert.strictEqual(dup.code, 0);
	var still = handlers.handleDemoRequest('GET', '/api/gun/pipette/detail', {gunId: 991002}, token);
	assert.strictEqual(still.items.homingStatus, 1);
	var poll = handlers.handleDemoRequest('GET', '/api/gun/take', {gunRackId: 980023}, token);
	assert.strictEqual(poll.code, 1);
	assert.strictEqual(poll.items.status, 1);
	assert.strictEqual(poll.items.gunId, 991002);
	assert.strictEqual(poll.items.simulated, true);
	var taken = handlers.handleDemoRequest('GET', '/api/gun/pipette/detail', {gunId: 991002}, token);
	assert.strictEqual(taken.items.homingStatus, 0);
	var stats = handlers.handleDemoRequest('POST', '/api/gun/pipette/statistics', {}, token);
	assert.strictEqual(stats.items.homingNum, 1);
	assert.strictEqual(stats.items.noHomingNum, 2);
});

check('duplicate return blocked and return updates history', function () {
	var homed = handlers.handleDemoRequest('POST', '/api/gun/return/pipette', {gunId: 991004}, token);
	assert.strictEqual(homed.code, 0);
	var ret = handlers.handleDemoRequest('POST', '/api/gun/return/pipette', {gunId: 991001}, token);
	assert.strictEqual(ret.code, 1);
	assert.strictEqual(ret.items.homingStatus, 1);
	var again = handlers.handleDemoRequest('POST', '/api/gun/return/pipette', {gunId: 991001}, token);
	assert.strictEqual(again.code, 0);
	var hist = handlers.handleDemoRequest('POST', '/api/gun/pipette/history', {
		gunId: 991001, pageNum: 1, pageSize: 10
	}, token);
	assert.ok(hist.items.list.some(function (row) { return row.homingTime; }));
});

check('logout keeps gun state', function () {
	handlers.handleDemoRequest('POST', '/api/demo/logout', {}, token);
	session.login('demo', 'Demo1234');
	token = session.currentToken();
	var detail = handlers.handleDemoRequest('GET', '/api/gun/pipette/detail', {gunId: 991002}, token);
	assert.strictEqual(detail.items.homingStatus, 0);
});

check('unknown id and rack detail', function () {
	var miss = handlers.handleDemoRequest('GET', '/api/gun/pipette/detail', {gunId: 1}, token);
	assert.strictEqual(miss.code, 0);
	var rack = handlers.handleDemoRequest('GET', '/api/device/detail', {deviceId: 980023}, token);
	assert.strictEqual(rack.code, 1);
	assert.strictEqual(rack.items.equipmentTypeCode, 13);
	assert.strictEqual(rack.items.status, 1);
});

console.log('MP6 checks passed');
