<template>
	<view class="roomDetail homeSubpage-detail">
		<view class="information">
			<uni-row>
				<uni-col :span="8">
					<view class="status" :class="statusColor(detail.senorStatus, MONITORSTATUS).class">
						<view class="status-big">
							<view class="status-mid">
								<view class="status-samll">
									{{ statusText(detail.senorStatus, MONITORSTATUS) || "" }}
								</view>
							</view>
						</view>
					</view>
				</uni-col>
				<uni-col :span="16">
					<view class="detail" @click="handleShowdetailsPopup">
						<image class="arrow-right" src="../../static/images/arrow-right.png"></image>
						<text class="text">
							{{$t('labDevice.name')}}： 
							<text class="span">{{ detail.name || '' }}</text>
						</text>
						<text class="text">
							{{$t('labDevice.no')}}：
							<text class="span">{{ detail.no || '' }}</text>
						</text>
						<view class="text" v-if="detail.head">
							{{$t('labDevice.alarmInfrom')}}：
							<AlarmNotification
								:detail="detail" 
								:thingsId="thingsId" 
								:thingsType="11" 
								@handle="detail.alarmFlag = $event">
							</AlarmNotification>
						</view>
						<view class="text">
							{{$t('room.address')}}：
							<text class="span">{{ detail.gradenName || '' }}{{ detail.buildingName || '' }}{{ detail.floorName || '' }}</text>
						</view>
					</view>
				</uni-col>
			</uni-row>
		</view>
		
		<view class="latestStatus" v-if="list.length > 0">
			<view class="top">
				<uni-row>
					<uni-col :span="7">
						<text class="text">{{$t('labDevice.newStatus')}}</text>
					</uni-col>
					<uni-col :span="17">
						<view class="float-right">
							<view class="inner" v-if="thingsList.length > 0" @click="$refs.bindHardware.open(thingsList)">
								<uni-icons custom-prefix="iconfont" type="icon-shiyanshi"></uni-icons>
								{{$t('labDevice.bindDevice')}}
							</view>
							<view class="inner" v-if="list.length > 0" @click="goDataChart">
								<uni-icons custom-prefix="iconfont" type="icon-shuju"></uni-icons>
								{{$t('labDevice.dataChart')}}
							</view>
						</view>
					</uni-col>
				</uni-row>
			</view>
			<HardwareState :data="list"></HardwareState>
		</view>
		
		<view class="equipment-list">
			<view class="title">
				<uni-title type="h3" :title="$t('room.deviceList')"></uni-title>
				<text class="text">（{{$t('home.monitoring')}}：{{ instrumentList.length }}）</text>
			</view>
			<view class="list cardCommon">
				<LabdeviceCard v-for="item in instrumentList" :key="item.id" :item="item"></LabdeviceCard>
			</view>
		</view>
		
		<detailsPopup ref="detailsPopup" :detail="detail"></detailsPopup>
		
		<BindHardware ref="bindHardware"></BindHardware>
	</view>
</template>

<script>
	import AlarmNotification from '@/components/AlarmNotification/index.vue'
	import HardwareState from '../components/HardwareState/index.vue';
	import LabdeviceCard from "@/components/LabdeviceCard/index.vue";
	import detailsPopup from '../components/detailsPopup/index.vue';
	import BindHardware from "../components/BindHardware/BindHardware.vue";
	import { getRoomDetail, getOpenMonitorFlag, getThingsList } from '@/utils/api.js';
	import { MONITORSTATUS } from '@/utils/constant.js';
	import { statusColor, statusText } from '@/utils/methods.js'
	export default{
		props: ['thingsId'],
		data() {
			return {
				MONITORSTATUS,
				statusColor,
				statusText,
				isAlarmNotification: false,
				detail: "",
				reportDate: "",
				list: [],
				isList: false,
				thingsList: [],
				instrumentList: [],
				isBindLength: 0,
				loadingNum: 0,
				set: null
			}
		},
		components: {
			AlarmNotification,
			HardwareState,
			LabdeviceCard,
			detailsPopup,
			BindHardware
		},
		mounted() {
			this.init()
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: this.$t('route.roomDetail')
			});
		},
		methods: {
			init(){
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				this.loadingNum = 0;
				this.instrumentList = [];
				this.list = [];
				this.thingsList = [];
				this.roomDetail();
				this.roomThingsList();
				this.getBindHardware();
				var _this = this;
				clearInterval(this.set);
				this.set = setInterval(function(){
					if(_this.loadingNum >= 3){
						_this.loadingNum = 0;
						clearInterval(_this.set);
						_this.set = null;
						uni.hideLoading();
					}
				}, 100)
				setTimeout(function(){
					if (_this.set) {
						clearInterval(_this.set);
						_this.set = null;
						uni.hideLoading();
					}
				}, 8000)
			},
			roomDetail() {
				getRoomDetail({id: this.thingsId}).then(res => {
					this.loadingNum++;
					if(res.code === 1 && res.items){
						this.detail = res.items;
						uni.setNavigationBarTitle({
							title: res.items.name
						});
						var instrumentList = res.items.instrumentList || [];
						this.instrumentList = instrumentList.map(function(row) {
							return {
								...row,
								senorStatus: row.bingStatus != null ? row.bingStatus : row.senorStatus,
								sensorList: row.simpleEquipmentVOS || row.sensorList || []
							}
						})
					} else if (this.$refs.toast) {
						uni.showToast({title: (res && res.message) || this.$t('labDevice.notData'), icon: 'none'})
					}
				}).catch(() => {
					this.loadingNum++;
				})
			},
			roomThingsList(){
				getOpenMonitorFlag({objId: this.thingsId,objType: 3}).then(res => {
					this.loadingNum++;
					if(res.code === 1 && res.items){
						this.list = res.items.list || [];
						if(this.list.length > 0){
							this.reportDate = this.list[0].monitorSensorTime ? this.list[0].monitorSensorTime : '';
							this.isList = true;
						}
					}
					uni.stopPullDownRefresh()
				}).catch(() => {
					this.loadingNum++;
					uni.stopPullDownRefresh()
				})
			},
			getBindHardware() {
				getThingsList({
					objId: this.thingsId,
					objType: 3,
					pageNum: 1,
					pageSize: 999
				}).then(res => {
					this.loadingNum++;
					if(res.code === 1 && res.items){
						this.thingsList = res.items.list || []
					}
				}).catch(() => {
					this.loadingNum++;
				})
			},
			handleAlarmNotification(){
				this.isAlarmNotification =! this.isAlarmNotification;
			},
			handleShowdetailsPopup() {
				this.$refs.detailsPopup.showDetailsPopup(3)
			},
			// 数据图表
			goDataChart() {
				if(this.list.length > 0){
					uni.navigateTo({
						url: "/detailPage/HistoryDataChart/HistoryDataChart?id=" + this.thingsId + "&title=" + this.detail.name + "&type=3"
					})
				}
			},
			// 绑定的硬件跳转详情
			goHardwareDetail(id) {
				uni.navigateTo({
					url: "/detailPage/HardwareDetail/index?id=" + id
				})
			}
		},
		onHide(){
			clearInterval(this.set);
			this.set = null
		},
		onUnload(){
			clearInterval(this.set);
			this.set = null
		},
		options: {
		   styleIsolation: 'shared'
		}
	}
</script>

<style scoped lang="scss">
	@import '@/style/css/homeSubpageDetail.scss';
	@import '@/style/css/status.scss'; 
	.roomDetail{
		.information{
			background-color: #fff;
			padding: 26rpx 16rpx;
			border-radius: 20rpx;
			::v-deep .uni-row{
				margin-top: 0!important;
			}
		}
		
		.equipment-list{
			padding-bottom: 60rpx;
			.title{
				display: flex;
				align-items: center;
				::v-deep .uni-h3{
					padding-left: 28rpx;
					position: relative;
					font-size: 36rpx;
					&::after{
						content: '';
						width: 8rpx;
						height: 34rpx;
						position: absolute;
						top: 50%;
						left: 0;
						transform: translateY(-50%);
						border-radius: 4rpx;
						background-color: $primary;
					}
				}
				.text{
					color: #555;
					font-size: 26rpx;
				}
			}
			
			.cardCommon ::v-deep .uni-card{
				margin-left: 0!important;
				margin-right: 0!important;
			}
		}
	}
</style>
