/**
 * MP5 alarm / message / todo / owner checks.
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
var seeds = require(path.join(root, 'utils/demo/seeds.js'));
var alarm = require(path.join(root, 'utils/demo/alarm.js'));

function check(name, fn) {
	fn();
	console.log('ok', name);
}

session.login('demo', 'Demo1234');
var token = session.currentToken();
storage.removeDemo('alarmHandles');
storage.removeDemo('alarmMessages');
storage.removeDemo('responsible');

check('agenda groups match counts and card fields', function () {
	var counts;
	var total = 0;
	[-1, 0, 1].forEach(function (option) {
		var result = alarm.agenda({timeOptions: option, currentPage: 1, pageSize: 10});
		counts = result.statisticalVO;
		var key = option === -1 ? 'pendingCount' : (option === 0 ? 'aboutTimeOut' : 'timeOut');
		assert.strictEqual(result.total, counts[key]);
		assert.strictEqual(result.list.length, counts[key]);
		result.list.forEach(function (row) {
			assert.strictEqual(row.timeOptions, option);
			assert.ok(row.taskStartDate && row.applyUserName && row.dueDate);
		});
		total += result.total;
	});
	assert.strictEqual(total, alarm.alarmStats({}).waitHandleNum);
	assert.strictEqual(counts.aboutTimeOut, 1);
});

check('live event on device detail and mission list', function () {
	var detail = handlers.handleDemoRequest('POST', '/api/monitorIndicator/miniAppHistoryAlarmRecord', {
		objId: 970008, objType: 2, process: 0, pageNum: 1, pageSize: 10
	}, token);
	assert.strictEqual(detail.code, 1);
	assert.strictEqual(detail.items.list[0].alarmInfo[0].id, 990008);
	assert.strictEqual(detail.items.list[0].alarmInfo[0].process, 0);
	var mine = handlers.handleDemoRequest('GET', '/api/history/things/alarm/app', {
		isHead: 1, type: 4, process: 0, pageNum: 1, pageSize: 20
	}, token);
	var ids = mine.items.list[0].alarmInfo.map(function (row) { return row.id; });
	assert.ok(ids.indexOf(990008) !== -1);
	assert.ok(ids.indexOf(960001) !== -1);
});

check('process does not clear sensor alarm', function () {
	var handled = handlers.handleDemoRequest('POST', '/api/monitorIndicator/exceptionHandle', {
		alarmId: 990008, errorType: 1, processDate: '2026-10-06 12:30:00', errorCauseMsg: '演示确认'
	}, token);
	assert.strictEqual(handled.code, 1);
	assert.strictEqual(handled.items.process, 1);
	var again = handlers.handleDemoRequest('POST', '/api/alarm/add/process', {
		alarmId: 990008, errorType: 1, processDate: '2026-10-06 12:31:00'
	}, token);
	assert.strictEqual(again.code, 0);
	var device = handlers.handleDemoRequest('GET', '/api/instrument/detail', {id: 970008}, token);
	assert.strictEqual(device.items.bingStatus, 2);
	assert.strictEqual(seeds.statusForInstrument(970008).senorStatus, 2);
	var room = handlers.handleDemoRequest('GET', '/api/room/detail', {id: 950003}, token);
	assert.strictEqual(room.items.senorStatus, 2);
});

check('todo and stats follow process', function () {
	var stats = handlers.handleDemoRequest('GET', '/api/thingsUser/all/stat/app', {}, token);
	assert.strictEqual(stats.items.waitHandleNum, 0);
	assert.strictEqual(stats.items.instrumentCount, 12);
	assert.ok(stats.items.statList[0].total >= 1);
	var agenda = handlers.handleDemoRequest('POST', '/api/activiti/task/queryAgenda', {currentPage: 1, pageSize: 10}, token);
	assert.strictEqual(agenda.items.statisticalVO.pendingCount, 0);
	var done = handlers.handleDemoRequest('GET', '/api/activiti/task/query', {taskStatus: 1}, token);
	assert.ok(done.items.list.some(function (row) { return row.eventId === 990008; }));
});

check('messages read and clean keep alarms', function () {
	storage.removeDemo('alarmMessages');
	var unread = handlers.handleDemoRequest('GET', '/api/activiti/unread', {}, token);
	assert.strictEqual(unread.items.notifyUnread, true);
	var list = handlers.handleDemoRequest('GET', '/api/notify/message/query', {types: 0, currentPage: 1, pageSize: 10}, token);
	assert.ok(list.items.list.length >= 1);
	assert.ok(String(list.items.list[0].title).indexOf('undefined') === -1);
	assert.ok(String(list.items.list[0].title).indexOf('演示示波器 B') !== -1);
	assert.strictEqual(list.items.statisticalVO.alarmCount, 1);
	var id = list.items.list[0].id;
	var read = handlers.handleDemoRequest('POST', '/api/notify/message/read/' + id, {}, token);
	assert.strictEqual(read.code, 1);
	var after = handlers.handleDemoRequest('GET', '/api/notify/message/query', {types: 0, currentPage: 1, pageSize: 10}, token);
	assert.strictEqual(after.items.statisticalVO.alarmCount, 0);
	handlers.handleDemoRequest('GET', '/api/message/clean', {type: 0}, token);
	var empty = handlers.handleDemoRequest('GET', '/api/notify/message/query', {types: 0, currentPage: 1, pageSize: 10}, token);
	assert.strictEqual(empty.items.list.length, 0);
	var still = handlers.handleDemoRequest('POST', '/api/monitorIndicator/miniAppHistoryAlarmRecord', {
		objId: 970008, objType: 2, process: 2, pageNum: 1, pageSize: 10
	}, token);
	assert.strictEqual(still.items.list[0].alarmInfo[0].id, 990008);
});

check('unknown and owner checks', function () {
	var miss = handlers.handleDemoRequest('POST', '/api/monitorIndicator/exceptionHandle', {
		alarmId: 1, errorType: 1, processDate: '2026-10-06 12:30:00'
	}, token);
	assert.strictEqual(miss.code, 0);
	alarm.setResponsible('instrument', 970001, 900002);
	var steal = handlers.handleDemoRequest('POST', '/api/alarm/add/process', {
		alarmId: 960001, errorType: 2, processDate: '2026-10-06 12:30:00'
	}, token);
	assert.strictEqual(steal.code, 0);
	alarm.setResponsible('instrument', 970001, 900001);
	var bpm = handlers.handleDemoRequest('POST', '/api/activiti/task/complete', {}, token);
	assert.ok(String(bpm.message).indexOf('尚未开放') !== -1);
});

check('logout keeps handles', function () {
	session.logout();
	session.login('demo', 'Demo1234');
	token = session.currentToken();
	var row = handlers.handleDemoRequest('GET', '/api/alarm/process/info', {alarmId: 990008}, token);
	assert.strictEqual(row.code, 1);
	assert.ok(row.items.processDate);
});

console.log('MP5 checks passed');
