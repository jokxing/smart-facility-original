<template>
	<view class="HardwareDetail homeSubpage-detail">
		<view class="information">
			<uni-row>
				<uni-col :span="8">
					<view class="status" :class="handleGreenStatus(detail.status).class">
						<view class="status-big">
							<view class="status-mid">
								<view class="status-samll">
									{{ handleStatus(detail.status) || "" }}
								</view>
							</view>
						</view>
					</view>
				</uni-col>
				<uni-col :span="16">
					<view class="detail">
						<view class="text">
							{{$t('labDevice.name')}}：
							<text class="span">{{ detail.name || '' }}</text>
						</view>
						<view class="text no">
							{{$t('labDevice.no')}}：
							<text class="span">{{ detail.no || '' }}</text>
						</view>
						<view class="text acousto-optic">
							{{$t('labDevice.signAlarm')}}：
							<switch 
								:class="{'detail-disabled': detail.status === 0}"
								:disabled="detail.status === 0" 
								:checked="!detail.closeSoundLightAlarm" 
								style="transform:scale(0.7)" 
								color="#3F51B5" 
								@change="acoustoOpticChange" />
						</view>
						<view class="text platform">
							{{$t('labDevice.systemAlarm')}}：
							<switch 
								:checked="!detail.closeSystemAlarm" 
								style="transform:scale(0.7)" 
								color="#3F51B5" 
								@change="platformChange" />
						</view>
						<view class="text" @click="handleDetailsPopup">
							{{$t('labDevice.lookMoreMessage')}}>
						</view>
					</view>
				</uni-col>
			</uni-row>
		</view>
		
		<view class="latestStatus" v-if="list.length > 0">
			<view class="top">
				<uni-row>
					<uni-col :span="12">
						<text class="text">{{$t('labDevice.newStatus')}}</text>
					</uni-col>
					<uni-col :span="12">
						<text class="float-right">{{ reportDate | forDateTime }}</text>
					</uni-col>
				</uni-row>
			</view>
			<HardwareState :data="list"></HardwareState>
		</view>
		
		<AlarmSettings :detail="detail" :thingsId="thingsId"></AlarmSettings>
		
		<view class="other-services latestStatus">
			<view class="top">
				<text class="text">{{$t('labDevice.otherServe')}}</text>
			</view>
			<uni-row>
				<uni-col :span="8">
					<view class="item" @click="goDataChart">
						<uni-icons custom-prefix="iconfont" type="icon-shuju" size="14" color="#D6AE7B"></uni-icons>
						<text class="text">{{$t('labDevice.dataChart')}}</text>
					</view>
				</uni-col>
			</uni-row>
		</view>
		
		<detailsPopup ref="detailsPopup" :detail="detail"></detailsPopup>
		
		<Toast ref="toast"></Toast>
	</view>
</template>

<script>
	import AlarmNotification from '@/components/AlarmNotification/index.vue'
	import HardwareState from '../components/HardwareStateOld/index.vue'
	import AlarmSettings from "../components/AlarmSettings/index.vue";
	import detailsPopup from '../components/detailsPopup/index.vue';
	import Toast from '@/components/Toast/index.vue'
	import { getDeviceDetailApp, postEquipmentUserAlarmSetting, postDeviceCloseAlarmSystem, postDeviceCloseAlarmSoundLight } from '@/utils/api.js'
	import { BASE_URL, MONITORSTATUS, GREENSTATUS } from '@/utils/constant.js'
	import { statusText } from '@/utils/methods.js'
	export default{
		props: ['thingsId'],
		data() {
			return {
				BASE_URL,
				defaultImage: "",
				detail: {
					status: null,
					name: "",
					no: ""
				},
				reportDate: "",
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
			detailsPopup,
			AlarmSettings,
			Toast
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: this.$t('route.hardwareDetail')
			});
		},
		mounted() {
			this.deviceDetail()
		},
		methods: {
			deviceDetail() {
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				getDeviceDetailApp({deviceId: this.thingsId}).then(res => {
					if(res.code == 1){
						this.detail = res.items;
						
						if (res.items.sensors) {
							let list = [];
							for (let j = 0, sensors = res.items.sensors; j < sensors.length; j++) {
								list.push({
									...sensors[j],
									...sensors[j].sensorType,
									isBind: 0
								});
							}
							this.list = list
						}
						
						uni.setStorageSync('operatorName', this.detail.operatorName);
						uni.setNavigationBarTitle({
							title: res.items.name
						});
						uni.hideLoading();
						uni.stopPullDownRefresh()
					}
				})
			},
			// 声光报警
			acoustoOpticChange(e){
				var data = {
					closeSoundLightAlarm: e.detail.value ? 0 : 1,
					id: this.detail.id
				}
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				postDeviceCloseAlarmSoundLight(data).then(res => {
					if(res.code){
						if(res.code === 1){
							this.$refs.toast.open(this.$t('common.handleSuccess'),"success");
						}else{
							this.$refs.toast.open(res.message,"error")
						}
					}else{
						this.$refs.toast.open(res.message,"error")
					}
					uni.hideLoading()
				})
			},
			// 平台报警
			platformChange(e){
				var data = {
					closeSystemAlarm: e.detail.value ? 0 : 1,
					id: this.detail.id
				}
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				postDeviceCloseAlarmSystem(data).then(res => {
					if(res.code){
						if(res.code === 1){
							this.$refs.toast.open(this.$t('common.handleSuccess'),"success");
						}else{
							this.$refs.toast.open(res.message,"error")
						}
					}else{
						this.$refs.toast.open(res.message,"error")
					}
					uni.hideLoading()
				})
			},
			// 查看更多信息
			handleDetailsPopup() {
				this.$refs.detailsPopup.showDetailsPopup(2)
			},
			// 数据图表
			goDataChart() {
				uni.navigateTo({
					url: "/detailPage/HistoryDataChart/HistoryDataChart?id=" + this.detail.id + "&title=" + this.detail.name + "&type=1"
				})
			},
			// 判断参数状态
			handleStatus(status){
				return statusText(status, MONITORSTATUS)
			},
			// 新建、正常为绿色，其他状态为红色
			handleGreenStatus(status) {
				if(GREENSTATUS.indexOf(status) > -1){
					return {class: "normal"}
				}else{
					return {class: "abnormal"}
				}
			}
		},
		onHide(){
			clearInterval(this.set);
			this.set = null
		}
	}
</script>

<style scoped lang="scss">
	@import '@/style/css/homeSubpageDetail.scss';
	@import '@/style/css/status.scss'; 
	.alarm-settings{
		margin-top: 30rpx;
	}
	
	.HardwareDetail{
		.detail{
			.no{
				margin-bottom: 0!important;
			}
			.acousto-optic{
				margin-bottom: 0!important;
				line-height: 64rpx;
			}
			.platform{
				margin-bottom: 10rpx!important;
				line-height: 64rpx;
			}
			.detail-disabled{
				opacity: 0.5;
			}
		}
	}
</style>
