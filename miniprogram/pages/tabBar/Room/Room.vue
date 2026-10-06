<template>
	<view class="room">
		<uni-search-bar :cancelText="$t('common.cancel')" class="search" :placeholder="$t('room.inputRoomNameOrNo')" v-model="keyword"
			@confirm="handleSearch" @clear="handleSearch" bgColor="#fff" radius="20">
		</uni-search-bar>

		<view class="location">
			<view>
				<uni-icons custom-prefix="iconfont" type="icon-company" size="20" color="#C39C7C"></uni-icons>
				<text class="text">{{ locationText }}</text>
			</view>
			<button type="primary" class="button button-cancel"
				@click="$refs.locationSelect.open()">{{$t('common.screen')}}</button>
		</view>

		<view class="tab-box">
			<view class="demo-uni-col" v-for="(item,index) in dashboardTab" :key="index"
				:class="{active: item.value === dashboardType}" @click="handleStatusType(item.value)">
				<text class="text">{{ item.text }}</text>
				<view class="num" :class="item.class">
					{{ item.num || 0 }}
				</view>
			</view>
		</view>
		<view class="list cardCommon">
			<RoomCard v-for="item in list" :key="item.id" :item="item"></RoomCard>
		</view>
		<uni-load-more v-if="isList" :status="moreStatus"></uni-load-more>

		<LocationSelect ref="locationSelect" @handle="handleLocationSelectChange"></LocationSelect>

		<Toast ref="toast"></Toast>
		<tab-bar :selectedIndex='tabBarIndex'></tab-bar>
	</view>
</template>

<script>
	import RoomCard from "@/components/RoomCard/index.vue";
	import Toast from "@/components/Toast/index.vue";
	import LocationSelect from "@/components/LocationSelect/index.vue";
	import {
		getRoomStatistics,
		postRoomList
	} from '@/utils/api.js'
	const storage = require('@/utils/demo/storage.js')
	import {
		MONITORSTATUS,
		DATAZOOM
	} from '@/utils/constant.js';
	import {
		statusColor,
		statusText,
		sensorsArray
	} from '@/utils/methods.js';
	export default {
		components: {
			RoomCard,
			Toast,
			LocationSelect,
		},
		data() {
			const _this = this;
			return {
				MONITORSTATUS,
				statusColor,
				statusText,
				dataZoom: DATAZOOM,
				list: [],
				isList: false,
				pageNum: 1,
				pageSize: 10,
				total: 0,
				keyword: "",
				gardenId: "",
				buildingId: "",
				floorId: "",
				locationText: _this.$t('common.all'),
				status: 10,
				moreStatus: "no-more",
				loadingNum: 0,
				set: null,
				// 状态
				dashboard: "",
				dashboardTab: [{
						text: _this.$t('home.monitoring'),
						value: 10,
						num: 0,
						class: "total"
					},
					{
						text: MONITORSTATUS[0].label,
						value: MONITORSTATUS[0].code,
						num: 0,
						class: MONITORSTATUS[0].value
					},
					{
						text: MONITORSTATUS[1].label,
						value: MONITORSTATUS[1].code,
						num: 0,
						class: MONITORSTATUS[1].value
					},
					{
						text: MONITORSTATUS[2].label,
						value: MONITORSTATUS[2].code,
						num: 0,
						class: MONITORSTATUS[2].value
					},
				],
				dashboardType: 10,
				tabBarIndex: ""
			}
		},
		onReady() {
			this.init()
		},
		onShow() {
			let curRoute = (this.$mp && this.$mp.page && this.$mp.page.route) || '';
			this.tabBarIndex = curRoute;
			uni.setNavigationBarTitle({
				title: this.$t('tabBar.room')
			});
			if (storage.getDemo('roomStatus')) {
				this.consumeHomeFilter();
				this.pageNum = 1;
				this.list = [];
				this.init()
			}
		},
		onPullDownRefresh() {
			this.pageNum = 1;
			this.pageSize = 10;
			this.list = [];
			this.isList = false;
			this.init();
		},
		onReachBottom() {
			if (this.pageNum * this.pageSize < this.total) {
				this.pageNum++;
				this.moreStatus = "loading";
				this.handleLoading(1);
				this.roomList();
			} else {
				this.moreStatus = "no-more"
			}
		},
		methods: {
			consumeHomeFilter() {
				var roomStatus = storage.getDemo('roomStatus');
				if (roomStatus) {
					this.status = roomStatus;
					this.dashboardType = roomStatus;
					storage.removeDemo('roomStatus');
				}
			},
			init() {
				clearInterval(this.set);
				this.loadingNum = 0;
				this.roomDashboard();
				this.roomList();
				this.handleLoading(2)
			},
			roomDashboard() {
				var data = {
					gardenId: this.gardenId,
					buildingId: this.buildingId,
					floorId: this.floorId,
				};
				getRoomStatistics(data).then(res => {
					this.loadingNum++;
					if (res.code === 1 && res.items) {
						this.dashboardTab[0].num = res.items.monitoringNum;
						this.dashboardTab[1].num = res.items.normalNum;
						this.dashboardTab[2].num = res.items.policeNum;
						this.dashboardTab[3].num = res.items.leaveNum
					} else if (this.$refs.toast && res && res.message) {
						this.$refs.toast.open(res.message, "error")
					}
				}).catch(() => {
					this.loadingNum++;
				})
			},
			roomList() {
				var data = {
					pageNum: this.pageNum,
					pageSize: this.pageSize,
					gardenId: this.gardenId,
					buildingId: this.buildingId,
					floorId: this.floorId,
					keyword: this.keyword,
					status: this.status
				};
				postRoomList(data).then(res => {
					this.loadingNum++;
					if (res.code === 1 && res.items) {
						this.isList = true;
						var list = res.items.list || []
						if (this.pageNum > 1) {
							for (var i = 0; i < list.length; i++) {
								this.list.push(list[i])
							}
						} else {
							this.list = list;
						}
						this.pageSize = res.items.pageSize;
						this.total = res.items.total;
						if (this.pageNum * this.pageSize >= this.total) {
							this.moreStatus = "no-more"
						} else {
							this.moreStatus = "more";
						}
					} else if (this.$refs.toast) {
						this.$refs.toast.open((res && res.message) || this.$t('common.noData'), "error")
						this.isList = true;
					}
					uni.stopPullDownRefresh()
				}).catch(() => {
					this.loadingNum++;
					this.isList = true;
					uni.stopPullDownRefresh()
				})
			},
			handleLoading(index) {
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				var _this = this;
				clearInterval(this.set);
				this.set = setInterval(function() {
					if (_this.loadingNum >= index) {
						_this.loadingNum = 0;
						clearInterval(_this.set);
						_this.set = null;
						uni.hideLoading();
					}
				}, 100)
				setTimeout(function() {
					if (_this.set) {
						clearInterval(_this.set);
						_this.set = null;
						uni.hideLoading();
					}
				}, 8000)
			},
			// 搜索
			handleSearch() {
				this.pageNum = 1;
				this.pageSize = 10;
				this.list = [];
				this.handleLoading(1);
				this.roomList()
			},
			handleSearchClear() {
				this.keyword = "";
				this.handleSearch();
			},
			// 状态筛选
			handleStatusType(index) {
				this.dashboardType = index;
				this.status = index;
				this.pageNum = 1;
				this.pageSize = 10;
				this.list = [];
				this.isList = false;
				this.roomList();
				this.handleLoading(1)
			},
			// 地理位置选择
			handleLocationSelectChange(ids) {
				if (!ids || !ids.length) {
					this.locationText = this.$t('common.all');
					this.gardenId = "";
					this.buildingId = "";
					this.floorId = "";
				} else if (ids[0].level === 1) {
					this.locationText = ids[0].name;
					this.gardenId = ids[0].id;
					this.buildingId = "";
					this.floorId = "";
				} else if (ids[0].level === 2) {
					this.locationText = (ids[0].parents && ids[0].parents[0] ? ids[0].parents[0].name + '/' : '') + ids[0].name;
					this.buildingId = ids[0].id;
					this.gardenId = ids[0].parents && ids[0].parents[0] ? ids[0].parents[0].id : "";
					this.floorId = "";
				} else if (ids[0].level === 3) {
					var p0 = ids[0].parents && ids[0].parents[0] ? ids[0].parents[0] : {};
					var p1 = ids[0].parents && ids[0].parents[1] ? ids[0].parents[1] : {};
					this.locationText = (p0.name || '') + '/' + (p1.name || '') + '/' + ids[0].name
					this.floorId = ids[0].id;
					this.gardenId = p0.id || "";
					this.buildingId = p1.id || "";
				}

				this.pageNum = 1;
				this.pageSize = 10;
				this.list = [];
				this.isList = false;
				this.init()
			},
			// 跳转房间详情
			goRoomDetail(item) {
				uni.navigateTo({
					url: "/detailPage/RoomDetail/index?title=" + item.name + '&id=' + item.id
				})
			}
		},
		onHide() {
			clearInterval(this.set);
			this.set = null
		},
		onUnload() {
			clearInterval(this.set);
			this.set = null
		}
	}
</script>

<style scoped lang="scss">
	@import "./Room.scss";
	@import "../../../style/css/tab.scss";
</style>
