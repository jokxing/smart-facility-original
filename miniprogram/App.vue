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
	
	/* #endif */
	.example-info {
		font-size: 14px;
		color: #333;
		padding: 10px;
	}
</style>
