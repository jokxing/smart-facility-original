var NS = 'sf-mini-demo:';
var SESSION_KEYS = [
	'token',
	'userInfo',
	'username',
	'avatarUrl',
	'labStatus',
	'roomStatus',
	'tabBarIndex',
	'operatorName'
];
var BUSINESS_KEYS = [
	'reservations',
	'reservationRemind',
	'alarmHandles',
	'alarmMessages',
	'responsible',
	'alarmFlags',
	'gunState',
	'gunRecords',
	'gunPending',
	'transportState',
	'transportCreated'
];
var DEMO_KEYS = SESSION_KEYS.concat(BUSINESS_KEYS);

function storageApi() {
	if (typeof uni !== 'undefined' && uni.getStorageSync) return uni;
	if (typeof global !== 'undefined' && global.__SF_UNI__) return global.__SF_UNI__;
	throw new Error('storage api unavailable');
}

function namespaced(key) {
	return NS + key;
}

function getDemo(key, fallback) {
	var value = storageApi().getStorageSync(namespaced(key));
	if (value === undefined || value === null || value === '') {
		return fallback === undefined ? '' : fallback;
	}
	return value;
}

function setDemo(key, value) {
	storageApi().setStorageSync(namespaced(key), value);
}

function removeDemo(key) {
	storageApi().removeStorageSync(namespaced(key));
}

function clearSessionStorage() {
	SESSION_KEYS.forEach(function (key) {
		removeDemo(key);
	});
}

function clearDemoStorage() {
	DEMO_KEYS.forEach(function (key) {
		removeDemo(key);
	});
}

module.exports = {
	NS: NS,
	SESSION_KEYS: SESSION_KEYS,
	BUSINESS_KEYS: BUSINESS_KEYS,
	DEMO_KEYS: DEMO_KEYS,
	getDemo: getDemo,
	setDemo: setDemo,
	removeDemo: removeDemo,
	clearSessionStorage: clearSessionStorage,
	clearDemoStorage: clearDemoStorage
};
