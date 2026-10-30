<template>
	<view class="home">
		<navbar class="header" :background="backgroundColor" :title="title" :isHeight="'400rpx'" :isTitleList="true">
		</navbar>

		<view class="search" @click="handleGoSearch">
			<text class="text">{{ $t('home.searchNameNo') }}...</text>
			<uni-icons class="search-icon" color="#D6AE7B" size="22" type="search" />
		</view>

		<view class="more-features">
			<view class="feature-grid">
				<view class="feature-cell">
					<view class="grid-item-box" @click="handleGoNewsInform">
						<view :class="{'ring':items.notifyUnread}">
						</view>
						<image class="image" src="../../../static/images/icon-message.png" />
						<text class="text">{{ $t('home.messageCenter') }}</text>
					</view>
				</view>
				<view class="feature-cell">
					<view class="grid-item-box" @click="goPipetteGunRackDetail">
						<image class="image" src="../../../static/images/icon-scan.png" />
						<text class="text">{{ $t('home.qrCode') }}</text>
					</view>
				</view>
				<view class="feature-cell">
					<view class="grid-item-box" @click="handleGoBackLog">
						<view :class="{'ring':items.activitiUnread}">
						</view>
						<image class="image" src="../../../static/images/icon-toDoList.png" />
						<text class="text">{{ $t('home.todoList') }}</text>
					</view>
				</view>
			</view>
		</view>
		<view class="demo-hint">{{ $t('home.demoEmptyHint') }}</view>
		<view class="statistics equipment-overview">
			<view class="head">
				<uni-title type="h2" :title="$t('home.labDeviceStat')"></uni-title>
				<view class="subtitle">
					<text class="text">
						（{{$t('home.monitoring')}}：{{statistics.instrumentStatistics.monitorCount || 0 }} · {{$t('home.paramStat')}}）
					</text>
				</view>
			</view>
			<view class="run-line">
				{{$t('home.runStat')}}：{{$t('home.runCount')}} {{statistics.instrumentStatistics.runCount || 0}}
				 / {{$t('home.standbyCount')}} {{statistics.instrumentStatistics.standbyCount || 0}}
				 / {{$t('home.closeCount')}} {{statistics.instrumentStatistics.closeCount || 0}}
			</view>
			<uni-row>
				<uni-col :span="8">
					<view class="box normal" @click="handleGoLabdevice(1)">
						<uni-title type="h5" :title="$t('home.normalLabDevice')" color="#91ADA1"></uni-title>
						<view class="num">
							{{ statistics.instrumentStatistics.normalCount || 0 }}
							<!-- <text class="text">{{$t('home.pcs')}}</text> -->
						</view>
					</view>
				</uni-col>
				<uni-col :span="8">
					<view class="box abnormal" @click="handleGoLabdevice(2)">
						<uni-title type="h5" :title="$t('home.abnormalLabDevice')" color="#C5A1A2"></uni-title>
						<view class="num">
							{{ statistics.instrumentStatistics.alarmCount || 0 }}
							<!-- <text class="text">{{$t('home.pcs')}}</text> -->
						</view>
					</view>
				</uni-col>
				<uni-col :span="8">
					<view class="box offLine" @click="handleGoLabdevice(-100)">
						<uni-title type="h5" :title="$t('home.offlineLabDevice')" color="#959DAD"></uni-title>
						<view class="num">
							{{ statistics.instrumentStatistics.offLineCount || 0 }}
							<!-- <text class="text">{{$t('home.pcs')}}</text> -->
						</view>
					</view>
				</uni-col>
			</uni-row>
		</view>

		<view class="statistics asset-inventory">
			<view class="head">
				<uni-title type="h2" :title="$t('home.roomStat')"></uni-title>
				<view class="subtitle">
					<text class="text">
						（{{$t('home.monitoring')}}：{{ statistics.roomStatistics.monitorCount || 0 }}）
					</text>
				</view>
			</view>
			<uni-row>
				<uni-col :span="8">
					<view class="box normal" @click="handleGoRoom(1)">
						<uni-title type="h5" :title="$t('home.normalRoom')" color="#91ADA1"></uni-title>
						<view class="num">
							{{ statistics.roomStatistics.normalCount || 0 }}<text class="text"></text>
						</view>
					</view>
				</uni-col>
				<uni-col :span="8">
					<view class="box abnormal" @click="handleGoRoom(2)">
						<uni-title type="h5" :title="$t('home.abnormalRoom')" color="#C5A1A2"></uni-title>
						<view class="num">
							{{ statistics.roomStatistics.alarmCount || 0 }}<text class="text"></text>
						</view>
					</view>
				</uni-col>
				<uni-col :span="8">
					<view class="box offLine" @click="handleGoRoom(-100)">
						<uni-title type="h5" :title="$t('home.offlineRoom')" color="#959DAD"></uni-title>
						<view class="num">
							{{ statistics.roomStatistics.offLineCount || 0 }}<text class="text"></text>
						</view>
					</view>
				</uni-col>
			</uni-row>
		</view>
		<tab-bar :selectedIndex='tabBarIndex'></tab-bar>
		<uni-popup class="home-notice" ref="popup" background-color="transparent" :mask-click="false">
			<view class="notice-content">
				<view class="notice-icon">
					<uni-icons type="info-filled" size="36" color="#B2704E"></uni-icons>
				</view>
				<text class="notice-text">{{ errorText }}</text>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import navbar from '@/components/NavigationBar/index.vue';
	import {
		getHomeStatistics,
		getQrCodeInfo,
		getActivitiUnread,
		postInstrumentSearch
	} from '@/utils/api.js';
	const session = require('@/utils/demo/session.js');
	export default {
		components: {
			navbar
		},
		data() {
			const _this = this;
			return {
				backgroundColor: "linear-gradient(-15deg, #2a305d 0%, #606bad 100%)",
				title: _this.$t('tabBar.home'),
				statistics: {
					instrumentStatistics: {
						monitorCount: 0,
						normalCount: 0,
						alarmCount: 0,
						offLineCount: 0,
						runCount: 0,
						standbyCount: 0,
						closeCount: 0
					},
					roomStatistics: {
						monitorCount: 0,
						normalCount: 0,
						alarmCount: 0,
						offLineCount: 0
					}
				},
				errorText: "",
				loading: false,
				items: {
					activitiUnread: false,
					notifyUnread: false
				},
				tabBarIndex: ""
			}
		},
		onShow() {
			if (!session.isLoggedIn()) return;

			let curRoute = 'pages/tabBar/Home/Home';
			this.tabBarIndex = curRoute;
			this.handleActiveUnread();
		},
		onPullDownRefresh() {
			this.init()
		},
		onReady() {
			if (!session.isLoggedIn()) return;

			var _this = this;
			uni.getStorage({
				key: 'sf-mini-demo:userInfo',
				success: function(res) {
					if (res.data && res.data.companyName) {
						_this.title = res.data.companyName
					}
				}
			});
			this.init();
		},
		methods: {
			init() {
				if (this.loading) return
				this.loading = true
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				this.instrumentDashboard();
			},
			instrumentDashboard() {
				getHomeStatistics().then(res => {
					if (res.code === 1 && res.items) {
						this.statistics = res.items;
					} else if (res && res.message) {
						this.errorText = res.message;
						this.$refs.popup.open("center")
						setTimeout(() => {
							this.$refs.popup.close();
							this.errorText = "";
						}, 3000)
					}
					this.loading = false
					uni.hideLoading()
					uni.stopPullDownRefresh()
				}).catch(() => {
					this.loading = false
					uni.hideLoading()
					uni.stopPullDownRefresh()
				})
			},
			handleActiveUnread() {
				getActivitiUnread().then(res => {
					if (res.code === 1 && res.items) {
						this.items = res.items;
					}
				})
			},
			goPipetteGunRackDetail() {
				var _this = this;
				// #ifdef MP-WEIXIN
				uni.scanCode({
					onlyFromCamera: true,
					success(res) {
						getQrCodeInfo({
							id: res.result
						}).then(res => {
							if (res.code === 1 || res.code === 200) {
								uni.navigateTo({
									url: res.url
								})
							} else {
								_this.errorText = res.message;
								_this.$refs.popup.open("center")
								setTimeout(() => {
									_this.$refs.popup.close();
									_this.errorText = "";
								}, 3000)
							}
						})
					}
				})
				// #endif
				// #ifndef MP-WEIXIN
				this.errorText = this.$t('home.scanUnsupported');
				this.$refs.popup.open("center")
				setTimeout(() => {
					this.$refs.popup.close();
					this.errorText = "";
				}, 3000)
				// #endif
			},
			handleGoSearch() {
				uni.navigateTo({
					url: "/homePage/Search/Search"
				})
			},
			handleGoNewsInform() {
				uni.navigateTo({
					url: "/homePage/NewsInform/NewsInform"
				})
			},
			handleGoBackLog() {
				uni.navigateTo({
					url: "/homePage/Backlog/Backlog"
				})
			},
			handleGoLabdevice(status) {
				// 跳转tabBar的页面不支持传参数，通过本地存储
				uni.setStorageSync('sf-mini-demo:labStatus', status);
				uni.switchTab({
					url: "/pages/tabBar/Labdevice/index"
				})
			},
			handleGoRoom(status) {
				// 跳转tabBar的页面不支持传参数，通过本地存储
				uni.setStorageSync('sf-mini-demo:roomStatus', status);
				uni.switchTab({
					url: "/pages/tabBar/Room/Room"
				})
			}
		},

		onHide() {
			clearInterval(this.set);
			this.set = null
		},

	}
</script>

<style scoped lang="scss">
	@import "./Home.scss";
	.feature-grid { display: flex; width: 100%; }
	.feature-cell { flex: 1; min-width: 0; }
</style>
