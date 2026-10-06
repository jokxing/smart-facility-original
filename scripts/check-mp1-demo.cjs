/**
 * MP1 mock/auth/storage checks. Does not compile the uni-app project.
 */
var assert = require('assert');
var path = require('path');
var fs = require('fs');
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
var seeds = require(path.join(root, 'utils/demo/seeds.js'));
var handlers = require(path.join(root, 'utils/demo/handlers.js'));
var session = require(path.join(root, 'utils/demo/session.js'));
var storage = require(path.join(root, 'utils/demo/storage.js'));

function check(name, fn) {
	fn();
	console.log('ok', name);
}

check('seed alignment', function () {
	assert.strictEqual(seeds.DEMO_INSTRUMENTS.length, 12);
	assert.strictEqual(seeds.ALARM_INSTRUMENT_ID, 970008);
	assert.strictEqual(seeds.DEMO_ROOMS.map(function (r) { return r.id; }).join(','), '950001,950002,950003');
	assert.strictEqual(seeds.statusForInstrument(970008).senorStatus, 2);
	assert.strictEqual(seeds.statusForInstrument(970001).senorStatus, 1);
	assert.strictEqual(seeds.aggregateRoomSenorStatus(950001), 1);
	assert.strictEqual(seeds.aggregateRoomSenorStatus(950003), 2);
});

check('home statistics', function () {
	var stats = seeds.computeHomeStatistics();
	assert.strictEqual(stats.instrumentStatistics.monitorCount, 12);
	assert.strictEqual(stats.instrumentStatistics.normalCount, 11);
	assert.strictEqual(stats.instrumentStatistics.alarmCount, 1);
	assert.strictEqual(stats.instrumentStatistics.offLineCount, 0);
	assert.strictEqual(stats.instrumentStatistics.runCount, 12);
	assert.strictEqual(stats.instrumentStatistics.standbyCount, 0);
	assert.strictEqual(stats.instrumentStatistics.closeCount, 0);
	assert.strictEqual(stats.roomStatistics.monitorCount, 3);
	assert.strictEqual(stats.roomStatistics.normalCount, 2);
	assert.strictEqual(stats.roomStatistics.alarmCount, 1);
	assert.strictEqual(stats.roomStatistics.offLineCount, 0);
});

check('login isolation', function () {
	var bad = handlers.handleDemoRequest('POST', '/api/demo/login', {username: 'demo', password: 'wrong'});
	assert.strictEqual(bad.code, 0);
	assert.ok(!session.isLoggedIn());
	var good = handlers.handleDemoRequest('POST', '/api/demo/login', {username: 'demo', password: 'Demo1234'});
	assert.strictEqual(good.code, 1);
	assert.ok(session.isDemoToken(good.items.token));
	assert.ok(String(storage.getDemo('token')).indexOf('sf-mini-demo:') === -1);
	assert.ok(Object.keys(store).every(function (key) { return key.indexOf('sf-mini-demo:') === 0; }));
	var stats = handlers.handleDemoRequest('GET', '/api/instrument/mini/homePage/statistics', {}, good.items.token);
	assert.strictEqual(stats.items.instrumentStatistics.alarmCount, 1);
});

check('unknown api does not fallback', function () {
	var token = session.currentToken();
	var closed = handlers.handleDemoRequest('POST', '/api/demo/unknown', {}, token);
	assert.strictEqual(closed.code, 0);
	assert.ok(closed.message.indexOf('尚未开放') !== -1);
	assert.strictEqual(closed.items, null);
});

check('storage namespace clear', function () {
	store['unrelated-user-key'] = 'keep';
	session.logout();
	assert.strictEqual(store['unrelated-user-key'], 'keep');
	assert.strictEqual(storage.getDemo('token'), '');
	var expired = handlers.handleDemoRequest('GET', '/api/user/info', {}, '');
	assert.strictEqual(expired.code, 2);
});

check('empty page contracts', function () {
	session.login('demo', 'Demo1234');
	var token = session.currentToken();
	var news = handlers.handleDemoRequest('GET', '/api/notify/message/query', {currentPage: 1, pageSize: 10, types: 0}, token);
	assert.strictEqual(news.code, 1);
	assert.ok(Array.isArray(news.items.list));
	var agenda = handlers.handleDemoRequest('POST', '/api/activiti/task/queryAgenda', {}, token);
	assert.ok(agenda.items.statisticalVO.pendingCount >= 0);
	var transport = handlers.handleDemoRequest('POST', '/api/transportOrder/list/wx', {pageNum: 1, pageSize: 10}, token);
	assert.strictEqual(transport.code, 1);
	assert.strictEqual(transport.items.total, 10);
	assert.ok(Array.isArray(transport.items.list));
});

var requestSrc = fs.readFileSync(path.join(root, 'utils/request.js'), 'utf8');
check('request never calls uni.request', function () {
	assert.ok(requestSrc.indexOf('uni.request') === -1);
	assert.ok(requestSrc.indexOf('handleDemoRequest') !== -1);
});

var configSrc = fs.readFileSync(path.join(root, 'utils/config.js'), 'utf8');
check('config has no legacy host', function () {
	assert.ok(configSrc.indexOf('chuxou') === -1);
	assert.ok(configSrc.indexOf('getAccountInfoSync') === -1);
	assert.ok(configSrc.indexOf('DEMO_MODE = true') !== -1);
});

var appSrc = fs.readFileSync(path.join(root, 'App.vue'), 'utf8');
check('app login route', function () {
	assert.ok(appSrc.indexOf('/myPage/Login/Login') !== -1);
	assert.ok(appSrc.indexOf('/pages/Login/Login') === -1);
	assert.ok(appSrc.indexOf('onLaunch') !== -1);
	assert.ok(appSrc.indexOf('mounted') === -1);
});

console.log('MP1 checks passed');
