<template>
	<view class="take-gun">
		<Information :detail="detail"></Information>
		
		<button class="button" type="primary" @click="handleBake">{{$t('labDevice.getGun')}}</button>
		
		<uni-popup ref="popup" background-color="#fff" :mask-click="false">
			<view class="popup-content">
				<view class="take-content" v-if="!isTake">
					<text class="text">{{$t('labDevice.pleaseGetGun')}}!</text>
					<view class="num">
						<text class="num-text">{{ num }}</text>
						<text class="num-second">s</text>
					</view>
				</view>
				<view class="fetched-content" v-else>
					<uni-icons type="checkbox-filled" size="60" color="#09BB07"></uni-icons>
					<text class="text">{{$t('labDevice.takenAway')}}</text>
				</view>
			</view>
		</uni-popup>
		
		<Toast ref="toast"></Toast>
	</view>
</template>

<script>
	import Information from "./Information.vue";
	import Toast from '@/components/Toast/index.vue'
	import { getDeviceDetail, postGunTakePipette, getGunTake } from "@/utils/api.js";
	import { Base64 } from "@/utils/base64.js";
	const gunNavigation = require('@/utils/gunNavigation.js');
	const storage = require('@/utils/demo/storage.js');
	export default{
		components: {
			Information,
			Toast
		},
		data() {
			return{
				deviceId: null,
				detail: "",
				num: 30,
				set: null,
				gunTakeSet: null,
				isTake: false
			}
		},
		onLoad(options) {
			this.gunRackId = options.id;
			var base64 = new Base64()
			this.deviceId = base64.encode(options.id)
		},
		onReady() {
			this.handleDetail()
		},
		onPullDownRefresh() {
			this.handleDetail()
		},
		methods: {
			handleDetail() {
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				getDeviceDetail({deviceId: this.deviceId}).then(res => {
					this.loadingNum++;
					if(res.code === 1){
						this.detail = res.items;
						uni.setNavigationBarTitle({
							title: res.items.name
						});
					};
					uni.hideLoading();
					uni.stopPullDownRefresh()
				})
			},
			handleBake(){
				var _this = this;
				var data = {
					gunRackId: this.gunRackId,
					userId: (uni.getStorageSync('sf-mini-demo:userInfo') || {}).id
				}
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				postGunTakePipette(data).then(res => {
					if(res.code){
						if(res.code === 1){
							this.$refs.popup.open("center");
							this.isTake = false;
							
							this.handlegetGunTake();
							this.gunTakeSet = setInterval(function(){
								_this.handlegetGunTake();
							},5000)
							
							this.set = setInterval(function(){
								_this.num--;
								if(_this.num < 5){
									clearInterval(_this.gunTakeSet)
								}
								if(_this.num === 0){
									clearInterval(_this.set);
									_this.$refs.popup.close();
									uni.showModal({
										title: _this.$t('other.hint'),
										content: _this.$t('labDevice.outTimeGetGun'),
										showCancel: false,
										success: function (res) {
										}
									});
									_this.num = 30;
								}
							},1000)
						}else{
							this.$refs.toast.open(res.message,"error")
						}
					}else{
						this.$refs.toast.open(res.message,"error")
					}
					uni.hideLoading();
				}).catch(err => {
					this.$refs.toast.open(err.message,"error")
				})
			},
			handlegetGunTake() {
				var _this = this;
				getGunTake({gunRackId: this.gunRackId}).then(res => {
					if(res.code === 1){
						if(res.items.status === 1 && !this.isTake){
							this.isTake = true;
							clearInterval(this.set);
							clearInterval(this.gunTakeSet);
							setTimeout(function(){
								_this.$refs.popup.close();
								gunNavigation.openTakenGun(res.items.gunId, getCurrentPages(), uni, storage);
								_this.num = 30;
							},3000)
						}
					}else{
						clearInterval(this.set);
						clearInterval(this.gunTakeSet)
						this.$refs.popup.close();
						uni.showModal({
							title: _this.$t('other.hint'),
							content: res.message,
							showCancel: false,
							success: function (res) {
							}
						});
					}
				})
			}
		},
		onHide(){
			clearInterval(this.set);
			this.set = null;
			clearInterval(this.gunTakeSet);
			this.gunTakeSet = null
		}
	}
</script>

<style scoped lang="scss">
	.take-gun{
		padding: 0 20rpx;
		.button{
			width: 400rpx;
			height: 80rpx;
			line-height: 80rpx;
			background-color: $golden;
			color: #fff;
			position: absolute;
			bottom: 20%;
			left: 50%;
			transform: translateX(-50%);
		}
		
		.popup-content{
			width: 320rpx;
			border-radius: 10rpx;
			text-align: center;
			padding: 40rpx 0;
			.take-content{
				.text{
					font-size: 32rpx;
					color: #555555;
					display: block;
					margin-bottom: 48rpx;
				}
				.num{
					color: $golden;
					.num-text{
						font-size: 72rpx;
						font-weight: bold;
						margin-right: 10rpx;
					}
					.num-second{
						font-weight: initial;
						font-size: 40rpx;
					}
				}
			}
			.fetched-content{
				display: flex;
				flex-direction: column;
				align-content: center;
				justify-content: center;
				.text{
					color: #333;
				}
			}
		}
	}
</style>
