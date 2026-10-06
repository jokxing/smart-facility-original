<template>
	<view class="labdeviceDetail homeSubpage-detail">
		<view class="information">
			<uni-row>
				<uni-col :span="8">
					<view class="top-box" :class="statusColor(detail.status, LABSTATUS).class">
						<text class="text-1">{{$t('labDevice.runStatus')}}</text>
						<text 
							class="text-2" 
							:class="{'fontSize-small': detail.status === 2 || detail.status === 0}">
							{{ statusText(detail.status, LABSTATUS) }}
						</text>
					</view>
				</uni-col>
				<uni-col :span="8">
					<view class="top-box" :class="statusColor(detail.bingStatus, MONITORSTATUS).class">
						<text class="text-1">{{$t('labDevice.indexStatus')}}</text>
						<text class="text-2">
							{{ statusText(detail.bingStatus, MONITORSTATUS) }}
						</text>
					</view>
				</uni-col>
				<uni-col :span="8">
					<view class="top-box manager-name">
						<text class="text-1">{{$t('labDevice.useName')}}</text>
						<text class="text-2">{{ detail.managerName || $t('labDevice.notData') }}</text>
					</view>
				</uni-col>
			</uni-row>
			<uni-row>
				<uni-col :span="8">
					<view
						class="logo-url"
						:style="{
							backgroundImage: `url(${
							  detail.logoUrl ? (BASE_URL + detail.logoUrl) : ''
							}) `,
						}"
						@click="goAssetDetails">
					</view>
				</uni-col>
				<uni-col :span="16">
					<view class="detail" @click="goAssetDetails">
						<image class="arrow-right" src="../../static/images/arrow-right.png"></image>
						<view class="text">
							{{$t('labDevice.name')}}：
							<text class="span">{{ detail.name || '' }}</text>
						</view>
						<view class="text">
							{{$t('labDevice.no')}}：
							<text class="span">{{ detail.no || '' }}</text>
						</view>
						<view class="text" v-if="detail.head">
							{{$t('labDevice.alarmInfrom')}}：
							<AlarmNotification
								:detail="detail" 
								:thingsId="thingsId" 
								:thingsType="4" 
								@handle="detail.alarmFlag = $event">
							</AlarmNotification>
						</view>
						<view class="text">
							{{$t('labDevice.localtion')}}：
							<text class="span">{{ detail.roomName || '' }}</text>
						</view>
					</view>
				</uni-col>
			</uni-row>
		</view>
		
		<view class="latestStatus" v-if="detail.detailType === 1 && list.length > 0">
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
		
		<view class="footer-button">
			<uni-row>
				<uni-col :span="12">
					<button type="default" class="button button-cancel" @click="$refs.assetManagement.showPopup()">{{$t('labDevice.moreFlowApply')}}</button>
				</uni-col>
				<uni-col :span="12">
					<button type="primary" class="button button-primary" @click="handleAppointment">{{$t('labDevice.orderApply1')}}</button>
				</uni-col>
			</uni-row>
		</view>
		
		<AlarmSettings v-if="detail.head" :detail="detail" :thingsId="thingsId" :thingsType="4"></AlarmSettings>
		
		<!-- <view class="other-services latestStatus">
			<view class="top">
				<text class="text">其他服务</text>
			</view>
			<uni-row>
				<uni-col :span="8">
					<view class="item" :class="{ disabled: detail.status === 3 }"  @click="handleMaintenance">
						<uni-icons custom-prefix="iconfont" type="icon-a-baoxiuweibao" size="14" color="#D6AE7B"></uni-icons>
						<text class="text">维保</text>
					</view>
				</uni-col>
				<uni-col :span="8">
					<view class="item" @click="handleAppointment">
						<uni-icons custom-prefix="iconfont" type="icon-yuyue" size="14" color="#D6AE7B"></uni-icons>
						<text class="text">预约</text>
					</view>
				</uni-col>
			</uni-row>
		</view> -->
		
		<AssetManagement ref="assetManagement" @handle="showPopupCenter"></AssetManagement>
		
		<AppointmentPopup ref="appointmentPopup" :detail="detail"></AppointmentPopup>
		
		<MaintenancePopup ref="maintenancePopup" :instrumentId="thingsId" @handle="detail.status = 3"></MaintenancePopup>
		
		<BindHardware ref="bindHardware"></BindHardware>
		
		<TimeSelect ref="timeSelect" @handle="hanleTimeSelect"></TimeSelect>
		
		<Toast ref="toast"></Toast>
		
		<uni-popup class="popup-center" ref="popupCenter" background-color="#fff">
			<view class="popup-content">
				<text class="text">{{$t('labDevice.functionNotOpen')}}</text>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import AlarmNotification from '@/components/AlarmNotification/index.vue';
	import HardwareState from '../components/HardwareState/index.vue';
	import AlarmSettings from "../components/AlarmSettings/index.vue";
	import AppointmentPopup from '@/components/AppointmentPopup/index.vue';
	import MaintenancePopup from './common/MaintenancePopup.vue';
	import AssetManagement from './common/AssetManagement.vue';
	import BindHardware from "../components/BindHardware/BindHardware.vue";
	import TimeSelect from "@/components/TimeSelect/TimeSelect.vue"
	import Toast from '@/components/Toast/index.vue';
	import { getInstrumentDetail, getOpenMonitorFlag, postThingsUserAlarmSet, getThingsList } from '@/utils/api.js'
	import { BASE_URL, LABSTATUS, MONITORSTATUS } from '@/utils/constant.js'
	import { statusText, statusColor } from '@/utils/methods.js'
	export default{
		props: ['thingsId'],
		data() {
			return {
				statusText,
				statusColor,
				BASE_URL,
				LABSTATUS,
				MONITORSTATUS,
				detail: {
					logoUrl: "",
					name: "",
					no: ""
				},
				list: [],
				thingsList: [],
				isBindLength: 0,
				loadingNum: 0,
				set: null,
				notification: ""
			}
		},
		components: {
			AlarmNotification,
			HardwareState,
			AppointmentPopup,
			MaintenancePopup,
			AlarmSettings,
			AssetManagement,
			BindHardware,
			TimeSelect,
			Toast
		},
		onReady() {
			this.init()
		},
		methods: {
			init() {
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				this.loadingNum = 0;
				this.instrumentDetail();
				this.instrumentThingsList();
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
			instrumentDetail() {
				getInstrumentDetail({id: this.thingsId}).then(res => {
					this.loadingNum++;
					if(res.code === 1 && res.items){
						this.detail = res.items;
						if (this.detail.operatorName) {
							uni.setStorageSync('sf-mini-demo:operatorName', this.detail.operatorName);
						}
						uni.setNavigationBarTitle({
							title: res.items.name
						});
					} else if (this.$refs.toast) {
						this.$refs.toast.open((res && res.message) || this.$t('labDevice.notData'), 'error')
					}
				}).catch(() => {
					this.loadingNum++;
				})
			},
			instrumentThingsList() {
				getOpenMonitorFlag({objId: this.thingsId,objType: 2}).then(res => {
					this.loadingNum++;
					if(res.code === 1 && res.items){
						this.list = res.items.list || [];
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
					objType: 2,
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
			// 跳转资产详情
			goAssetDetails() {
				uni.navigateTo({
					url: "/detailPage/LabdeviceDetail/common/AssetDetails?id=" + this.thingsId
				})
			},
			goDataChart() {
				uni.navigateTo({
					url: "/detailPage/HistoryDataChart/HistoryDataChart?id=" + this.thingsId + "&title=" + this.detail.name + "&type=2"
				})
			},
			handleAppointment() {
				if (!this.detail || !this.detail.id) return;
				this.$refs.timeSelect.open(this.detail);
			},
			hanleTimeSelect(data){
				this.$refs.toast.open(data.msg,data.type);
			},
			// 维保
			handleMaintenance() {
				if(this.detail.status !== 3){
					this.$refs.maintenancePopup.showMaintenancePopup()
				}
			},
			showPopupCenter(){
				this.$refs.popupCenter.open('center');
				setTimeout(() => {
					this.$refs.popupCenter.close()
				},2000)
			}
		},
		onHide(){
			clearInterval(this.set);
			this.set = null
		},
		options: {
		   styleIsolation: 'shared'
		},
	}
</script>

<style scoped lang="scss">
	@import '@/style/css/homeSubpageDetail.scss';
	.labdeviceDetail{
		.popup-center{
			.popup-content{
				padding: 60rpx;
			}
		}
	}
</style>
