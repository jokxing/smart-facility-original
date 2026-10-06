var seeds = require('./seeds.js');
var session = require('./session.js');
var instrument = require('./instrument.js');
var room = require('./room.js');
var reservation = require('./reservation.js');
var alarm = require('./alarm.js');
var gun = require('./gun.js');
var transport = require('./transport.js');

function ok(items, message) {
	return {code: 1, message: message || 'ok', items: items};
}

function fail(message, code) {
	return {code: code == null ? 0 : code, message: message || '演示未开放该接口', items: null};
}

function pageEmpty(data) {
	var pageNum = (data && (data.pageNum || data.currentPage)) || 1;
	var pageSize = (data && data.pageSize) || 10;
	return ok({
		list: [],
		total: 0,
		pageNum: pageNum,
		pageSize: pageSize
	});
}

function normalizePath(url) {
	var path = String(url || '');
	var q = path.indexOf('?');
	if (q !== -1) path = path.slice(0, q);
	var apiAt = path.indexOf('/api/');
	if (apiAt !== -1) path = path.slice(apiAt);
	return path;
}

var PUBLIC_PATHS = {
	'POST /api/demo/login': true,
	'GET /api/user/language': true
};

function emptyNotify(data) {
	return ok({
		list: [],
		total: 0,
		pageNum: (data && data.currentPage) || 1,
		pageSize: (data && data.pageSize) || 10,
		statisticalVO: {alarmCount: 0, propertyCount: 0, sysCount: 0, propertyNoReadCount: 0}
	});
}

function handleDemoRequest(method, url, data, token) {
	var path = normalizePath(url);
	var key = String(method || 'GET').toUpperCase() + ' ' + path;
	if (!PUBLIC_PATHS[key] && !session.isDemoToken(token)) {
		return fail('登录已失效', 2);
	}

	if (key === 'POST /api/demo/login') {
		var result = session.login(data && data.username, data && data.password);
		if (!result.ok) return fail(result.message);
		return ok({token: result.token, user: result.user});
	}
	if (key === 'POST /api/demo/logout') {
		session.logout();
		return ok(true);
	}
	if (key === 'GET /api/user/info') {
		return ok(session.currentUser());
	}
	if (key === 'GET /api/user/language') {
		return ok({code: data && Number(data.code) === 2 ? 2 : 1});
	}
	if (key === 'GET /api/instrument/mini/homePage/statistics') {
		return ok(seeds.computeHomeStatistics());
	}
	if (key === 'GET /api/activiti/unread') {
		return ok(alarm.unreadFlags());
	}
	if (key === 'GET /api/thingsUser/all/stat/app') {
		var reservationStatistics = reservation.userStats();
		var stats = alarm.alarmStats();
		return ok({
			instrumentCount: stats.instrumentCount,
			roomCount: stats.roomCount,
			waitHandleNum: stats.waitHandleNum,
			reservationStatistics: reservationStatistics,
			statList: stats.statList
		});
	}
	if (key === 'GET /api/notify/message/query') {
		return ok(alarm.queryMessages(data));
	}
	if (key.indexOf('POST /api/notify/message/read/') === 0) {
		var msgId = path.split('/').pop();
		if (!alarm.readMessage(msgId)) return fail('未知消息');
		return ok(true);
	}
	if (key === 'GET /api/message/read') {
		alarm.readAll(data && data.type);
		return ok(true);
	}
	if (key === 'GET /api/message/clean') {
		alarm.cleanMessages(data && data.type);
		return ok(true);
	}
	if (key === 'GET /api/property/unusualMsg/noReadCount') {
		return ok(0);
	}
	if (key === 'POST /api/property/unusualMsg') {
		return pageEmpty(data);
	}
	if (key === 'POST /api/property/unusualMsg/read' || key === 'POST /api/property/unusualMsg/ignore' || key === 'POST /api/property/positionChange') {
		return fail('资产异动处理尚未开放');
	}
	if (key === 'GET /api/room/positionRoom/list') {
		return ok([]);
	}
	if (key === 'POST /api/activiti/task/queryAgenda') {
		return ok(alarm.agenda(data));
	}
	if (key === 'GET /api/activiti/task/query') {
		return ok(alarm.taskQuery(data));
	}
	if (key === 'GET /api/transportOrder/dashboard/wx') {
		return ok(transport.dashboard(data));
	}
	if (key === 'POST /api/transportOrder/list/wx') {
		return ok(transport.listOrders(data));
	}
	if (path.indexOf('/api/transportOrder/detail/wx/') === 0) {
		var orderDetail = transport.getDetail(path.split('/').pop());
		if (!orderDetail) return fail('未知运单');
		return ok(orderDetail);
	}
	if (key === 'GET /api/transportOrder/change/getStateInfo') {
		var hint = transport.getStateInfo(data);
		if (!hint.ok) return fail(hint.message);
		return ok(hint.items);
	}
	if (key === 'POST /api/transportOrder/change/state') {
		var changed = transport.changeState(data);
		if (!changed.ok) return fail(changed.message);
		return ok(true);
	}
	if (path.indexOf('/api/transportOrder/print/new/') === 0) {
		var printed = transport.printView(path.split('/').pop(), data && data.historyTimeInterval);
		if (!printed.ok) return fail(printed.message);
		return ok(printed.items);
	}
	if (key === 'GET /api/transportOrder/print/stream') {
		return fail('蓝牙/真实打印未接入');
	}
	if (key === 'POST /api/demo/transport/reset') {
		transport.resetDemoTransport();
		return ok(true);
	}
	if (key === 'POST /api/instrument/search') {
		var keyword = data && data.keyword;
		return ok(instrument.searchInstruments(data).concat(room.searchRooms(keyword)).concat(gun.searchGuns(keyword)));
	}
	if (key === 'GET /api/instrument/mini/statistics') {
		return ok(instrument.listStatistics(data));
	}
	if (key === 'POST /api/instrument/things/list/miniApp/v2') {
		return ok(instrument.listInstruments(data));
	}
	if (key === 'GET /api/instrument/detail') {
		var detail = instrument.getDetail(data && data.id);
		if (!detail) return fail('未知设备');
		return ok(detail);
	}
	if (key === 'GET /api/instrumentNewInfoExpand/details') {
		var asset = instrument.getAssetDetail(data && (data.instrumentId || data.id));
		if (!asset) return fail('未知设备');
		return ok(asset);
	}
	if (key === 'GET /api/monitorIndicator/getOpenMonitorFlag') {
		var open = instrument.getOpenMonitor(data && data.objId, data && data.objType);
		if (!open) return fail('未知设备或监测类型');
		return ok(open);
	}
	if (key === 'GET /api/monitorIndicator/getMonitorFlag') {
		var flags = instrument.getMonitorFlagList(data && data.objId, data && data.objType);
		if (!flags) return fail('未知设备或监测类型');
		return ok(flags);
	}
	if (key === 'GET /api/monitorIndicator/monitorInfo') {
		var series = instrument.getMonitorInfo(data);
		if (series == null) return fail('未知设备或监测类型');
		return ok(series);
	}
	if (key === 'GET /api/monitorIndicator/things/newList') {
		return ok(instrument.emptyHardware(data));
	}
	if (key === 'GET /api/instrument/things/list') {
		return ok(instrument.emptyHardware(data));
	}
	if (key === 'GET /api/department/list') {
		return ok(instrument.listDepartments());
	}
	if (key === 'GET /api/room/mini/statistics') {
		return ok(room.roomStatistics(data));
	}
	if (key === 'POST /api/room/things/list/miniApp') {
		return ok(room.listMiniRooms(data));
	}
	if (key === 'GET /api/room/detail') {
		var roomDetail = room.getRoomDetail(data && data.id);
		if (!roomDetail) return fail('未知房间');
		return ok(roomDetail);
	}
	if (key === 'GET /api/room/things/list') {
		return ok(instrument.emptyHardware(data));
	}
	if (key === 'POST /api/room/list') {
		return ok(room.listChipRooms(data));
	}
	if (key === 'GET /api/map/garden') {
		return ok(instrument.gardenList());
	}
	if (key === 'POST /api/room/tree') {
		return ok(instrument.roomTree());
	}
	if (key === 'GET /api/instrumentCategoryInfo/superior/cat') {
		return ok(seeds.DEMO_CATEGORIES.slice());
	}
	if (key === 'GET /api/equipment/bindEquipmentType') {
		return ok(seeds.DEMO_BIND_EQUIPMENT_TYPES.slice());
	}
	if (key === 'POST /api/monitorIndicator/miniAppHistoryAlarmRecord') {
		return ok(alarm.historyForObj(data));
	}
	if (key === 'GET /api/history/things/alarm/app') {
		return ok(alarm.historyForMission(data));
	}
	if (key === 'GET /api/alarm/errorList') {
		return ok({list: alarm.ERROR_TYPES.slice()});
	}
	if (key === 'POST /api/monitorIndicator/exceptionHandle' || key === 'POST /api/alarm/add/process') {
		var handled = alarm.applyProcess(data, false);
		if (!handled.ok) return fail(handled.message);
		return ok(handled.row, '处理成功');
	}
	if (key === 'POST /api/alarm/update/process') {
		var processUpdated = alarm.applyProcess(data, true);
		if (!processUpdated.ok) return fail(processUpdated.message);
		return ok(processUpdated.row, '修改成功');
	}
	if (key === 'GET /api/alarm/process/info') {
		var info = alarm.processInfo(data && data.alarmId);
		if (!info) return fail('未知告警');
		return ok(info);
	}
	if (key === 'GET /api/user/list') {
		return ok(alarm.DEMO_STAFF.slice());
	}
	if (key === 'POST /api/thingsUser/alarm/set') {
		return ok(true, '已保存本地偏好，演示不发送通知');
	}
	if (key === 'POST /api/alarm/things/status/update') {
		alarm.setAlarmFlag(data && data.thingsId, data && data.thingsType, data && data.alarmFlag);
		return ok(true, '已保存本地开关，演示不发送通知');
	}
	if (key === 'GET /api/property/report') {
		return ok([]);
	}
	if (key === 'POST /api/activiti/task/complete' || key === 'POST /api/activiti/task/transfer' || key === 'POST /api/activiti/task/terminate') {
		return fail('该审批流程演示尚未开放');
	}
	if (key === 'POST /api/instrument/reservation/add') {
		var added = reservation.saveReservation(data, false);
		if (!added.ok) return fail(added.message);
		return ok(added.row, '预约成功');
	}
	if (key === 'POST /api/instrument/reservation/update') {
		var updated = reservation.saveReservation(data, true);
		if (!updated.ok) return fail(updated.message);
		return ok(updated.row, '修改成功');
	}
	if (key === 'POST /api/instrument/reservation/mini/schedulerList') {
		return ok(reservation.myPage(data));
	}
	if (key === 'POST /api/instrument/reservation/schedulerListV1') {
		var cal = reservation.calendarList(data);
		if (!cal.ok) return fail(cal.message);
		return ok(cal.list);
	}
	if (key.indexOf('POST /api/instrument/reservation/cancel/') === 0) {
		var cancelId = path.split('/').pop();
		var cancelled = reservation.cancelReservation(cancelId);
		if (!cancelled.ok) return fail(cancelled.message);
		return ok(cancelled.row, '取消预约成功');
	}
	if (key === 'POST /api/instrument/reservation/remind') {
		reservation.setRemind(data && data.reservationRemind);
		return ok(true, '已保存本地提醒偏好，演示不发送通知');
	}
	if (key === 'GET /api/qrCode/info') {
		return fail('扫码业务演示尚未开放');
	}
	if (key === 'POST /api/gun/pipette/statistics') {
		return ok(gun.statistics());
	}
	if (key === 'POST /api/gun/pipette/list' || key === 'POST /api/gun/pipette/listV1') {
		return ok(gun.listGuns(data));
	}
	if (key === 'GET /api/gun/pipette/detail') {
		var gunDetail = gun.getDetail(data && (data.gunId || data.id || data.pipetteGunId));
		if (!gunDetail) return fail('未知移液枪');
		return ok(gunDetail);
	}
	if (key === 'POST /api/gun/pipette/binding/list') {
		return ok(gun.listBindings(data));
	}
	if (key === 'POST /api/gun/take/pipette') {
		var takeReq = gun.requestTake(data);
		if (!takeReq.ok) return fail(takeReq.message);
		return ok(takeReq.items, '已发出取枪申请（模拟，未连接硬件）');
	}
	if (key === 'GET /api/gun/take') {
		var takePoll = gun.pollTake(data);
		if (!takePoll.ok) return fail(takePoll.message);
		return ok(takePoll.items);
	}
	if (key === 'POST /api/gun/return/pipette') {
		var returned = gun.returnGun(data);
		if (!returned.ok) return fail(returned.message);
		return ok(returned.items, '模拟归还成功，未连接硬件');
	}
	if (key === 'POST /api/gun/pipette/history') {
		return ok(gun.listHistory(data));
	}
	if (key === 'GET /api/history/device/alarm') {
		return ok(gun.timeoutAlarms(data));
	}
	if (key === 'GET /api/device/detail' || key === 'GET /api/device/detail/app') {
		var rack = gun.getRackDetail(data && data.deviceId);
		if (!rack) return fail('未知硬件或该类型详情未开放');
		return ok(rack);
	}
	if (key === 'POST /api/device/openGun/remind') {
		return fail('未扫码取枪语音提醒需真实枪架，演示未连接硬件');
	}

	return fail('该功能演示尚未开放');
}

module.exports = {
	handleDemoRequest: handleDemoRequest,
	normalizePath: normalizePath,
	fail: fail,
	ok: ok
};
