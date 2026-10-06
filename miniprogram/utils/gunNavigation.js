// 取枪完成后保留原枪列表，移除旧详情、枪架及取枪页。
function openTakenGun(gunId, pages, api, storage) {
	var target = '/detailPage/PipetteGunDetail/index?id=' + encodeURIComponent(gunId);
	var listIndex = -1;
	for (var i = pages.length - 1; i >= 0; i--) {
		if (pages[i].route === 'pages/tabBar/Labdevice/index') {
			listIndex = i;
			break;
		}
	}
	var open = function () { api.navigateTo({url: target}); };
	if (listIndex >= 0) {
		var delta = pages.length - 1 - listIndex;
		if (delta > 0) api.navigateBack({delta: delta, success: open});
		else open();
	} else {
		storage.setDemo('openGunList', true);
		api.switchTab({url: '/pages/tabBar/Labdevice/index', success: open});
	}
}

module.exports = {openTakenGun: openTakenGun};
