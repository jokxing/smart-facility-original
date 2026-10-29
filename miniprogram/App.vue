<script>
	const storage = require('@/utils/demo/storage.js')
	const session = require('@/utils/demo/session.js')
	export default {
		onLaunch() {
			uni.hideTabBar()
			this.applySessionRoute()
			this.versionUpdate()
		},
		globalData: {
		  getModel: function () {
		    return uni.getSystemInfoSync()["model"];
		  },
		  getVersion: function () {
		    return uni.getSystemInfoSync()["version"];
		  },
		  getSystem: function () {
		    return uni.getSystemInfoSync()["system"];
		  },
		  getPlatform: function () {
		    return uni.getSystemInfoSync()["platform"];
		  },
		  getSDKVersion: function () {
		    return uni.getSystemInfoSync()["SDKVersion"];
		  },
		  userInfo: null,
		  platform: "",
		  screenWidth: uni.getSystemInfoSync().screenWidth,
		  screenHeight: uni.getSystemInfoSync().screenHeight,
		  BLEInformation: {
		    platform: "",
		    deviceId: "",
		    writeCharaterId: "",
		    writeServiceId: "",
		    notifyCharaterId: "",
		    notifyServiceId: "",
		    readCharaterId: "",
		    readServiceId: ""
		  }
		},
		methods: {
			currentRoute() {
				var pages = getCurrentPages()
				if (!pages.length) return ''
				var page = pages[pages.length - 1]
				return page.route || ''
			},
			isLoginRoute(route) {
				return route === 'myPage/Login/Login'
			},
			applySessionRoute() {
				if (this._sessionJumping) return
				var token = storage.getDemo('token')
				var route = this.currentRoute()
				if (!session.isDemoToken(token)) {
					if (!this.isLoginRoute(route)) {
						this._sessionJumping = true
						uni.reLaunch({
							url: '/myPage/Login/Login',
							complete: () => {
								this._sessionJumping = false
							}
						})
					}
					return
				}
				if (this.isLoginRoute(route)) {
					this._sessionJumping = true
					uni.reLaunch({
						url: '/pages/tabBar/Home/Home',
						complete: () => {
							this._sessionJumping = false
						}
					})
				}
			},
			versionUpdate() {
				// #ifdef MP-WEIXIN
				const _this = this;
				if (typeof wx !== 'undefined' && wx.canIUse && wx.canIUse('getUpdateManager')) {
					const updateManager = wx.getUpdateManager()
					updateManager.onCheckForUpdate(function(res) {
						if (res.hasUpdate) {
							updateManager.onUpdateReady(function() {
								uni.showModal({
									title: _this.$t('other.updateHint'),
									content: _this.$t('other.updateMessage'),
									success: function(res) {
										if (res.confirm) {
											updateManager.applyUpdate()
										}
									}
								})
							})
							updateManager.onUpdateFailed(function() {
								uni.showModal({
									title: _this.$t('other.updateMessage1'),
									content: _this.$t('other.updateMessage2')
								})
							})
						}
					})
				}
				// #endif
			}
		},
		onShow() {
			this.applySessionRoute()
		},
		onHide: function() {
		}
	}
</script>

<style>
	@import "@/static/iconfont/iconfont.css";
</style>

<style lang="scss">
	/*每个页面公共css */
	@import '@/uni_modules/uni-scss/index.scss';
	@import '@/style/css/common.scss';
	/* #ifndef APP-NVUE */
	page {
		color: #333333;
		background-color: #F3F5F9;
	}
	/* #ifdef H5 */
	body {
		max-width: 480px;
		margin: 0 auto;
		background: #e6eaf0;
	}
	.uni-page-head, .tab-bar, .device-header, .back-log .flex-top, .news-inform .flex-top {
		width: 100%;
		max-width: 480px;
		left: 0 !important;
		right: auto !important;
	}
	uni-page-refresh { width: 100% !important; max-width: 480px; }
	uni-page-body {
		display: flow-root;
		min-height: calc(100vh - 44px);
		background-color: #F3F5F9;
	}
	.back-log .flex-top, .news-inform .flex-top { top: var(--window-top, 0px); }
	uni-page-head .uni-page-head-shadow-grey::after {
		background-image: linear-gradient(to bottom, rgba(0, 0, 0, .08), transparent) !important;
	}
	.uni-popup [name="content"] {
		max-width: 480px;
		left: 0 !important;
		right: 0 !important;
	}
	@media (min-width: 480px) {
		.uni-page-head, .tab-bar, .device-header, .back-log .flex-top, .news-inform .flex-top, .uni-popup [name="content"] {
			width: 480px !important;
			left: 50% !important;
			right: auto !important;
			margin-left: -240px !important;
		}
	}
	/* #endif */
	
	/* #endif */
	.example-info {
		font-size: 14px;
		color: #333;
		padding: 10px;
	}
</style>
