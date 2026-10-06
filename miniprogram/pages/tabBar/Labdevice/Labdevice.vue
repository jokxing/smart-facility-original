<template>
	<view class="labdevice">
		<view style="padding-top: 20rpx;">
			<uni-search-bar class="search" :placeholder="$t('labDevice.inputLabDeviceNameOrNo')" v-model="keyword"
				@confirm="handleSearch" @clear="handleSearchClear" bgColor="#fff" :cancelText="$t('common.cancel')"
				radius="20">
			</uni-search-bar>
		</view>

		<view class="tab-box">
			<view style="display: flex;align-items: center;">
				<view class="demo-uni-col" v-for="(item,index) in dashboardTab" :key="index"
					:class="{active: item.value === sensorStatus}" @click="handleSensorStatus(item.value)">
					<text class="text">{{ item.text }}</text>
					<view class="num" :class="item.class">
						{{ item.num || 0 }}
					</view>
				</view>
			</view>
			<view @click="handleDrawer" style="font-size: 28rpx;font-weight: 500;color: #555555;">
				{{$t('common.screen')}}
				<image style="width: 16rpx;margin-left: 16rpx;" src="../../../static/images/icon-open.png"
					mode="widthFix"></image>
			</view>
		</view>

		<view class="list cardCommon">
			<LabdeviceCard v-for="item in list" :key="item.id" :item="item"></LabdeviceCard>
		</view>
		<uni-drawer ref="showRight" :width="640" mode="right" @change="handleChange">
			<view class="scroll-view" :style="{'padding-top': height}">
				<scroll-view class="scroll-view-box" :style="'height:' + windowHeight * 2 +'rpx;'" scroll-y="true">
					<view class="info-content">
						<text class="name">{{$t('labDevice.runStatus')}}</text>
					</view>
					<view class="content-buts">
						<view class="but" :class="{'active': runStatusTypes.includes(item.id)}"
							v-for="item in runStatus" :key="item.id" @click="handleSearchType(item, 1)">
							{{item.name}}
						</view>
					</view>
					<view class="info-content">
						<text class="name">{{$t('common.owningDepartment')}}</text>
						<view class="more">
							<view class="select-content">{{deparmentNames.join("、")}}</view>
							<view @click="handleMore('deparment')" style="display: flex;align-items: center;">
								<text>{{$t('common.more')}} </text>
								<uni-icons type="right" size="12" color="#999999"></uni-icons>
							</view>
						</view>
					</view>
					<view class="content-buts">
						<view class="but" :class="{'active': deparmentIds.includes(item.id)}"
							v-for="item in deparmentList" :key="item.id" @click="handleSearchType(item, 2)">
							{{item.name}}
						</view>
					</view>
					<view class="info-content mt-24">
						<text class="name">{{$t('labDevice.owningRoom')}}</text>
						<view class="more">
							<view class="select-content">{{floorNames.join("、")}}</view>
							<view @click="handleMore('room')" style="display: flex;align-items: center;">
								<text>{{$t('common.more')}} </text>
								<uni-icons type="right" size="12" color="#999999"></uni-icons>
							</view>
						</view>
					</view>
					<view class="content-buts">
						<view class="but" :class="{'active': floorIds.includes(item.id)}" v-for="item in gardens"
							:key="item.id" @click="handleSearchType(item, 3)">
							{{item.name}}
						</view>
					</view>
					<view class="info-content mt-24">
						<text class="name">{{$t('common.equipmentType')}}</text>
						<view class="more">
							<view class="select-content">{{equipmentTypeNames.join('、')}}</view>
							<view @click="handleMore('equipment')" style="display: flex;align-items: center;">
								<text>{{$t('common.more')}} </text>
								<uni-icons type="right" size="12" color="#999999"></uni-icons>
							</view>
						</view>
					</view>
					<view class="content-buts">
						<view class="but" :class="{'active': equipmentTypes.includes(item.types)}"
							v-for="item in equipmentTypeList" :key="item.code" @click="handleSearchType(item, 4)">
							{{item.name}}
						</view>
					</view>
					<view class="info-content mt-24">
						<text class="name">{{$t('common.bindDevice')}}</text>
						<view class="more">
							<view class="select-content">{{deviceTypeNames.join('、')}}</view>
							<view @click="handleMore('device')" style="display: flex;align-items: center;">
								<text>{{$t('common.more')}} </text>
								<uni-icons type="right" size="12" color="#999999"></uni-icons>
							</view>
						</view>
					</view>
					<view class="content-buts" style="padding-bottom: 300rpx;">
						<view class="but" :class="{'active': deviceTypeIds.includes(item.code)}"
							v-for="item in deviceTypeList" :key="item.code" @click="handleSearchType(item, 5)">
							{{item.name}}
						</view>
					</view>
				</scroll-view>
				<view class="footer" style="position: fixed;bottom: 0rpx;width: 564rpx;background: #FFFFFF;padding: 40rpx 0;border-top: 2rpx solid #EEEEEE;">
					<uni-row>
						<uni-col :span="11">
							<button type="default" class="button-cancel"
								@click="handleReset">{{$t('other.reset')}}</button>
						</uni-col>
						<uni-col :span="11" :push="2">
							<button class="button-primary" @click="submit">{{$t('common.confirm')}}</button>
						</uni-col>
					</uni-row>
				</view>
			</view>
		</uni-drawer>
		<uni-load-more :status="moreStatus" v-show="isList"></uni-load-more>
		<LocationSelect ref="locationSelect" @handle="handleLocationSelectChange"></LocationSelect>
		<Toast ref="toast"></Toast>
	</view>
</template>

<script>
	import LabdeviceCard from "@/components/LabdeviceCard/index.vue";
	import Toast from "@/components/Toast/index.vue";
	import LocationSelect from "@/components/LocationSelect/index.vue";
	import {
		getInstrumentStatistics,
		postInstrumentThingsListApp,
		getDepartment,
		postRooms,
		getInstrumentType,
		getEquipmentBindEquipmentType
	} from '@/utils/api.js';
	const storage = require('@/utils/demo/storage.js')
	import {
		MONITORSTATUS
	} from '@/utils/constant.js';
	import columns from "./columns.js";
	export default {
		components: {
			LabdeviceCard,
			Toast,
			LocationSelect
		},
		props: {
			height: {
				type: String,
				default: ''
			}
		},
		data() {
			const _this = this;
			return {
				keyword: "",
				// 统计
				statistics: {},
				// 运行状态数据
				instrumentStatus: null,
				// 状态 
				dashboardTab: [{
						text: _this.$t('labDevice.indexMonitor'),
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
				sensorStatus: 10,
				// 列表
				list: [],
				// 分页
				pageNum: 1,
				pageSize: 10,
				total: 0,
				// 加载更多
				moreStatus: "no-more",
				isList: false,
				// 定时器清除loading
				loadingNum: 0,
				set: null,
				drawerWidth: 320,
				// 提交数据
				obj: {
					pageNum: 1,
					pageSize: 10,
					keyword: "",
					status: 10,
					objTypes: [],
					departmentIds: [],
					typeList: [],
					roomIds: [],
					instrumentStatus: ""
				},
				deparmentList: [],
				deviceTypeList: [],
				gardens: [],
				equipmentTypeList: [],
				equipmentTypeNames: [],
				equipmentTypes: [],
				floorNames: [],
				floorIds: [],
				deparmentNames: [],
				deparmentIds: [],
				deviceTypeNames: [],
				deviceTypeIds: [],
				runStatus: [{
						id: 1,
						name: _this.$t('other.run')
					},
					{
						id: 0,
						name: _this.$t('other.standby')
					}
				],
				runStatusTypes: [],
				popupShow: false,
				windowHeight: 600,
				popupType: "",
				gardensChangeIds: [],
				deparmentChangeIds: [],
				equipmentTypeChangeIds: [],
				deviceTypeChangeIds: []
			}
		},
		onReady() {
			uni.getSystemInfo({
				success: (res) => {
					this.windowHeight = res.windowHeight;
					this.drawerWidth = res.windowWidth;
				}
			})
			columns.assign(this);
			var labStatus = storage.getDemo('labStatus');
			if (labStatus) {
				this.obj.status = labStatus;
				this.sensorStatus = labStatus;
				storage.removeDemo('labStatus');
			}
			this.init();
		},
		onPullDownRefresh() {
			this.pageNum = 1;
			this.pageSize = 10;
			this.list = [];
			this.isList = false;
			this.init()
		},
		methods: {
			handleReset() {
				this.equipmentTypes = [];
				this.equipmentTypeNames = [];
				this.floorNames = [];
				this.floorIds = [];
				this.deparmentNames = [];
				this.deparmentIds = [];
				this.deviceTypeNames = [];
				this.deviceTypeIds = [];
				this.runStatusTypes = [];
				this.gardensChangeIds = [];
				this.deparmentChangeIds = [];
				this.equipmentTypeChangeIds = [];
				this.deviceTypeChangeIds = [];
				this.$refs.showRight.close();
				this.obj.pageNum = 1;
				this.obj.pageSize = 10;
				this.obj.instrumentStatus = "";
				this.obj.departmentIds = [];
				this.obj.typeList = [];
				this.obj.objTypes = [];
				this.obj.roomIds = [];
				this.list = [];
				this.isList = false;
				this.init();
			},
			handleLocationSelectChange(ids) {
				if (this.popupType === 'room') {
					this.gardensChangeIds = ids;
					this.floorIds = ids.map(item => item.id);
					this.floorNames = ids.map(item => item.name);
				} else if (this.popupType === 'deparment') {
					this.deparmentChangeIds = ids;
					this.deparmentIds = ids.map(item => item.id);
					this.deparmentNames = ids.map(item => item.name);
				} else if (this.popupType === 'device') {
					this.deviceTypeChangeIds = ids;
					this.deviceTypeIds = ids.map(item => item.id);
					this.deviceTypeNames = ids.map(item => item.name);
				} else if (this.popupType === 'equipment') {
					this.equipmentTypeChangeIds = ids;
					console.log(ids);
					this.equipmentTypes = ids.map(item => item.id);
					this.equipmentTypeNames = ids.map(item => item.name);
				}
			},
			handleChange(e) {
				this.$emit('change', e)
			},
			handleDrawer() {
				this.$refs.showRight.open();
				this.handleGetDepartmentList();
				this.handleBindDeviceList();
				this.handleMapGarden();
				this.handleInstrumentType();
			},
			handleSearchType(items, type) {
				if (type === 1) {
					if (!this.runStatusTypes.includes(items.id)) {
						this.runStatusTypes = [];
						this.runStatusTypes.push(items.id);
					} else{
						const index = this.runStatusTypes.findIndex(i => i == items.id);
						this.runStatusTypes.splice(index, 1);
					}
				} else if (type === 2) {
					if (!this.deparmentIds.includes(items.id)) {
						this.deparmentIds.push(items.id);
						this.deparmentChangeIds.push({id: items.id});
						this.deparmentNames.push(items.name);
					} else {
						const index = this.deparmentIds.findIndex(i => i == items.id);
						this.deparmentNames.splice(index, 1);
						this.deparmentChangeIds.splice(index, 1);
						this.deparmentIds.splice(index, 1);
					}
					
				} else if (type === 3) {
					if (!this.floorIds.includes(items.id)) {
						this.floorIds.push(items.id);
						this.gardensChangeIds.push({id: items.id});
						this.floorNames.push(items.name)
					} else {
						const index = this.floorIds.findIndex(i => i == items.id);
						this.floorIds.splice(index, 1);
						this.gardensChangeIds.splice(index, 1);
						this.floorNames.splice(index, 1);
					}
				} else if (type === 4) {
					if (!this.equipmentTypes.includes(items.types)) {
						this.equipmentTypes.push(items.types);
						this.equipmentTypeChangeIds.push({id: items.types});
						this.equipmentTypeNames.push(items.name);
					} else {
						const index = this.equipmentTypes.findIndex(i => i == items.types);
						this.equipmentTypes.splice(index, 1);
						this.equipmentTypeChangeIds.splice(index, 1);
						this.equipmentTypeNames.splice(index, 1);
					}
					
				} else if (type === 5) {
					if (!this.deviceTypeIds.includes(items.code)) {
						this.deviceTypeIds.push(items.code);
						this.deviceTypeChangeIds.push({id: items.code});
						this.deviceTypeNames.push(items.name)
					} else {
						const index = this.deviceTypeIds.findIndex(i => i == items.code);
						this.deviceTypeIds.splice(index, 1);
						this.deviceTypeChangeIds.splice(index, 1);
						console.log(this.deviceTypeChangeIds);
						this.deviceTypeNames.splice(index, 1);
					}
				}
			},
			submit() {
				this.obj.instrumentStatus = this.runStatusTypes[0];
				this.obj.departmentIds = this.deparmentIds;
				this.obj.typeList = this.equipmentTypes;
				this.obj.objTypes = this.deviceTypeIds;
				this.obj.roomIds = this.floorIds;
				this.pageNum = 1;
				this.pageSize = 10;
				this.list = [];
				this.isList = false;
				this.$refs.showRight.close();
				this.init()
			},
			// 获取部门列表
				handleGetDepartmentList() {
				if (this.deparmentList.length > 0) {
					return
				}
				getDepartment().then(res => {
					if (res.code === 1 && res.items && res.items.list) {
						this.deparmentList = res.items.list.slice(0, 6)
					}
				})
			},
			handleBindDeviceList() {
				if (this.deviceTypeList.length > 0) {
					return
				}
				getEquipmentBindEquipmentType({
					objType: 2
				}).then(res => {
					if (res.code === 1 && res.items) {
						this.deviceTypeList = res.items.slice(0, 6)
					}
				})
			},
			handleMapGarden() {
				if (this.gardens.length > 0) {
					return
				}
				postRooms({
					keyword: "",
					pageSize:6,
					pageNum: 1
				}).then(res => {
					if (res.code === 1 && res.items && res.items.list) {
						this.gardens = res.items.list.slice(0, 6)
					}
				})
			},
			handleInstrumentType() {
				if (this.equipmentTypeList.length > 0) {
					return
				}
				getInstrumentType().then(res => {
					if (res.code === 1 && res.items) {
						this.equipmentTypeList = res.items
					}
				})
			},
			handleMore(type) {
				this.popupType = type;
				let arr = [];
				if (this.popupType === 'room') {
					arr = this.gardensChangeIds
				} else if (this.popupType === 'deparment') {
					arr = this.deparmentChangeIds
				} else if (this.popupType === 'device') {
					arr = this.deviceTypeChangeIds
				} else if (this.popupType === 'equipment') {
					arr = this.equipmentTypeChangeIds
				}
				this.$refs.locationSelect.open(type, arr)
			},
			init() {
				columns.assign(this);
				this.instrumentStatistics();
				this.instrumentList();
				this.handleLoading(2)
			},
			instrumentStatistics() {
				getInstrumentStatistics({
					keyword: this.keyword,
					departmentIds: this.obj.departmentIds,
					typeList: this.obj.typeList,
					objTypes: this.obj.objTypes,
					roomIds: this.obj.roomIds,
					instrumentStatus: this.obj.instrumentStatus
				}).then(res => {
					this.loadingNum++;
					if (res.code === 1 && res.items) {
						this.statistics = res.items;
						this.dashboardTab[0].num = res.items.monitorCount;
						this.dashboardTab[1].num = res.items.normalCount;
						this.dashboardTab[2].num = res.items.alarmCount;
						this.dashboardTab[3].num = res.items.offLineCount
					} else if (this.$refs.toast && res && res.message) {
						this.$refs.toast.open(res.message, "error")
					}
				}).catch(() => {
					this.loadingNum++;
				})
			},
			instrumentList() {
				this.obj.pageNum = this.pageNum;
				this.obj.pageSize = this.pageSize;
				this.obj.keyword = this.keyword;
				postInstrumentThingsListApp(this.obj).then(res => {
					this.loadingNum++;
					if (res.code === 1 && res.items) {
						var list = res.items.list || []
						if (this.pageNum > 1) {
							for (var i = 0; i < list.length; i++) {
								this.list.push(list[i])
							}
						} else {
							this.list = list;
						}
						this.total = res.items.total;
						this.isList = true;
						if (this.pageNum * this.pageSize >= this.total) {
							this.moreStatus = "no-more"
						} else {
							this.moreStatus = "more"
						}
					} else if (this.$refs.toast) {
						this.$refs.toast.open((res && res.message) || this.$t('common.noData'), "error")
						this.isList = true;
					}
				}).catch(() => {
					this.loadingNum++;
					this.isList = true;
				})
			},
			// 搜索
			handleSearch() {
				this.pageNum = 1;
				this.pageSize = 10;
				this.list = [];
				this.handleLoading(1);
				this.instrumentList()
			},
			handleSearchClear() {
				this.keyword = "";
				this.handleSearch();
			},
			// 运行状态Tab
			handleRunStatus(status) {
				this.instrumentStatus = status;
				this.obj['instrumentStatus'] = status;
				delete this.obj.status;
				this.sensorStatus = null;
				this.pageNum = 1;
				this.pageSize = 10;
				this.list = [];
				this.handleLoading(1);
				this.instrumentList();
			},
			// 状态Tab
			handleSensorStatus(index) {
				this.sensorStatus = index;
				this.obj['status'] = index;
				delete this.obj.instrumentStatus;
				this.instrumentStatus = null;
				this.pageNum = 1;
				this.pageSize = 10;
				this.list = [];
				this.isList = false;
				this.handleLoading(1)
				this.instrumentList();
			},
			goDetail(item) {
				uni.navigateTo({
					url: '/detailPage/LabdeviceDetail/index?title=' + item.name + '&id=' + item.id
				})
			},
			handlePullDownRefresh() {
				this.pageNum = 1;
				this.pageSize = 10;
				this.list = [];
				this.isList = false;
				this.init()
			}
		},
		onHide() {
			clearInterval(this.set);
			this.set = null
		},
		options: {
		  styleIsolation: 'shared' // 解除样式隔离
		}
	}
</script>

<style scoped lang="scss">
	@import "./Labdevice.scss";
	@import "../../../style/css/tab.scss";
	
	.scroll-view {
		background-color: #FFFFFF;
		padding: 40rpx 40rpx 0 36rpx;
		
		.scroll-view-box {
			padding-bottom: 120rpx;
		}

		.info-content {
			display: flex;
			justify-content: space-between;
			align-items: center;

			.name {
				font-size: 28rpx;
				font-weight: bold;
				color: #333333;
				line-height: 26rpx;
			}

			.more {
				font-size: 24rpx;
				font-weight: 500;
				color: #777777;
				line-height: 26rpx;
				display: flex;
				align-items: center;
			}

			.select-content {
				width: 260rpx;
				font-size: 24rpx;
				font-weight: 500;
				color: #C39C7C;
				line-height: 26rpx;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				text-align: right;
				margin-right: 10rpx;
			}
		}

		.content-buts {
			display: flex;
			align-items: center;
			flex-wrap: wrap;
			margin-top: 32rpx;

			.but {
				width: 102rpx;
				height: 60rpx;
				background: #F5F5F5;
				border-radius: 15px;
				overflow: hidden;
				padding: 0 34rpx;
				text-overflow: ellipsis;
				white-space: nowrap;
				text-align: center;
				line-height: 60rpx;
				font-size: 24rpx;
				font-weight: 500;
				color: #555555;
				margin-right: 20rpx;
				margin-bottom: 20rpx;

				&.active {
					background: #FAEFE3;
					color: #C39C7C;
				}
			}

			.but:nth-of-type(3n) {
				margin-right: 0;
			}
		}

		.mt-24 {
			margin-top: 48rpx;
		}
	}
</style>
