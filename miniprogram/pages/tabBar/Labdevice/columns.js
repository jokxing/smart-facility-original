import Vue from "vue";
import i18n from "../../../lang/index.js"
let _this = null
export default {
    assign(vm) {
        _this = vm
    }
}

// 一个页面请求次数，定时器中满足这个次数消灭loading并清除定时器
Vue.prototype.handleLoading = function(index) {
	if (_this.set) {
		clearInterval(_this.set);
		_this.set = null;
	}
	_this.loadingNum = 0;
	uni.showLoading({
		title: i18n.t('common.loading'),
		mask: true
	});
	_this.set = setInterval(function(){
		if(_this.loadingNum >= index){
			_this.loadingNum = 0;
			clearInterval(_this.set);
			_this.set = null;
			uni.hideLoading();
			uni.stopPullDownRefresh()
		}
	}, 100)
}

// 上拉更新数据
Vue.prototype.handleReachBottom = function() {
	if(_this.pageNum * _this.pageSize < _this.total){
		_this.pageNum++;
		_this.moreStatus = "loading";
		_this.handleLoading(1);
		_this.instrumentList();
	}else{
		_this.moreStatus = "no-more"
	}
}

// 底部加载
Vue.prototype.handleMore = function() {
	_this.isList = true;
	if(_this.pageNum * _this.pageSize > _this.total){
		_this.moreStatus = "no-more"
	}else{
		_this.moreStatus = "more";
	}
}