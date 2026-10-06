<template>
	<view class="homeSubpage-detail" style="padding: 0;">
		<view class="latestStatus">
			<view class="top">
				<text class="text">{{$t('other.alarmSystem')}}</text>
			</view>
			<uni-row>
				<uni-col :span="8">
					<view class="item" @click="handleAlarmSettings('phone', detail.phone)">
						<uni-icons custom-prefix="iconfont" type="icon-dianhua" size="14" color="#D6AE7B"></uni-icons>
						<text class="text">{{$t('other.telAlarm')}}</text>
					</view>
				</uni-col>
				<uni-col :span="8">
					<view class="item mid" @click="handleAlarmSettings('sms', detail.sms)">
						<uni-icons custom-prefix="iconfont" type="icon-duanxin" size="14" color="#D6AE7B"></uni-icons>
						<text class="text">{{$t('other.smsAlarm')}}</text>
					</view>
				</uni-col>
				<uni-col :span="8">
					<view class="item right" @click="handleAlarmSettings('weixin', detail.weixin)">
						<uni-icons custom-prefix="iconfont" type="icon-weixin" size="14" color="#D6AE7B"></uni-icons>
						<text class="text">{{$t('other.weixinAlarm')}}</text>
					</view>
				</uni-col>
			</uni-row>
		</view>
		
		<uni-popup
			ref="alarmSettingsPopup" 
			type="left"
			background-color="#fff">
				<view class="popup">
					<uni-data-checkbox mode="list" v-model="value" :localdata="alarmList" :multiple="false" @change="change"></uni-data-checkbox>
				</view>
		</uni-popup>
		
		<Toast ref="toast"></Toast>
	</view>
</template>

<script>
	import Toast from '@/components/Toast/index.vue';
	import { postThingsUserAlarmSet, postEquipmentUserAlarmSetting } from '@/utils/api.js';
	export default{
		components: {
			Toast
		},
		props: ['detail',"thingsId", "thingsType", "type"],
		data() {
			const _this = this;
			return {
				value: null,
				alarmList: [
					{text: _this.$t('other.notAlarm'), value: -1},
					{text: _this.$t('other.alarm0'), value: 0},
					{text: _this.$t('other.alarm1'), value: 1},
					{text: _this.$t('other.alarm2'), value: 5},
					{text: _this.$t('other.alarm3'), value: 10},
					{text: _this.$t('other.alarm4'), value: 15},
					{text: _this.$t('other.alarm5'), value: 20},
					{text: _this.$t('other.alarm6'), value: 30},
					{text: _this.$t('other.alarm7'), value: 45},
					{text: _this.$t('other.alarm8'), value: 60},
					{text: _this.$t('other.alarm9'), value: 120},
					{text: _this.$t('other.alarm10'), value: 180},
				],
			}
		},
		methods: {
			handleAlarmSettings(type,value){
				this.notification = type;
				this.value = value;
				this.$refs.alarmSettingsPopup.open('left')
			},
			change(e){
				var e = e.detail.value
				if(this.thingsType === 4){
					var data = {
						thingsId: this.thingsId,
						thingsType: this.thingsType,
						userId: (uni.getStorageSync('sf-mini-demo:userInfo') || {}).id
					};
					data[this.notification] = e;
					postThingsUserAlarmSet(data).then(res => {
						if(res.code){
							if(res.code === 1){
								this.detail[this.notification] = e;
								this.$refs.toast.open(this.$t('other.alarmSetSuccess'),"success");
							}else{
								this.$refs.toast.open(res.message,"error")
							}
						}else{
							this.$refs.toast.open(res.message,"error")
						}
					})
				}else{
					var data = {
						equipmentId: this.thingsId,
						userId: (uni.getStorageSync('sf-mini-demo:userInfo') || {}).id,
						type: this.detail.equipmentType
					};
					data[this.notification] = e;
					postEquipmentUserAlarmSetting(data).then(res => {
						if(res.code){
							if(res.code === 1){
								this.detail[this.notification] = e;
								this.$refs.toast.open(this.$t('other.alarmSetSuccess'),"success");
							}else{
								this.$refs.toast.open(res.message,"error")
							}
						}else{
							this.$refs.toast.open(res.message,"error")
						}
					})
				}
			},
		}
	}
</script>

<style scoped lang="scss">
	@import '@/style/css/homeSubpageDetail.scss';
	.popup{
		padding: 0 20rpx;
	}
</style>