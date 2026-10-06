<template>
	<view class="switch" :class="{open: alarmFlag}" @click.stop="handleAlarmNotification">
		<view class="switch-box"></view>
	</view>
</template>

<script>
	import { postAlarmThingsStatusUpdate } from '@/utils/api.js'
	export default{
		props: ['detail', 'thingsType', 'thingsId'],
		data() {
			return {
				alarmFlag: false,
				busy: false
			}
		},
		watch: {
			'detail.alarmFlag': {
				immediate: true,
				handler: function (val) {
					this.alarmFlag = Number(val) === 1;
				}
			}
		},
		methods: {
			isOn() {
				return Number(this.detail && this.detail.alarmFlag) === 1 || this.alarmFlag === true;
			},
			handleAlarmNotification(){
				if (this.busy) return;
				var _this = this;
				if (!this.isOn()) {
					uni.showModal({
						title: _this.$t('other.ps'),
						content: _this.$t('other.openHint'),
						success: function (res) {
							if (res.confirm) {
								_this.alarmThingsStatusUpdate(1);
							}
						}
					});
					return;
				}
				uni.showModal({
					title: _this.$t('other.ps'),
					content: _this.$t('other.closeHint'),
					success: function (res) {
						if (res.confirm) {
							_this.alarmThingsStatusUpdate(0);
						}
					}
				});
			},
			alarmThingsStatusUpdate(nextFlag){
				var _this = this;
				this.busy = true;
				uni.showLoading();
				postAlarmThingsStatusUpdate({
					thingsId: this.thingsId,
					thingsType: this.thingsType,
					alarmFlag: nextFlag
				}).then(function (res) {
					uni.hideLoading();
					_this.busy = false;
					if(res.code === 1){
						_this.alarmFlag = Number(nextFlag) === 1;
						_this.$emit('handle', Number(nextFlag) === 1 ? 1 : 0)
					}else{
						uni.showToast({
							title: (res && res.message) || _this.$t('labDevice.functionNotOpen'),
							icon: "none",
							duration: 2000
						});
					}
				}).catch(function () {
					uni.hideLoading();
					_this.busy = false;
				})
			},
		}
	}
</script>

<style scoped lang="scss">
	.switch{
		width: 80rpx;
		height: 40rpx;
		background-color: #e1e1e1;
		border-radius: 20rpx;
		display: inline-block;
		position: relative;
		.switch-box{
			width: 32rpx;
			height: 32rpx;
			background-color: #fff;
			border-radius: 50%;
			position: absolute;
			left: 4rpx;
			top: 50%;
			transform: translateY(-50%);
			transition: all .3s;
		}
		&.open{
			background-color: $primary;
			.switch-box{
				left: 44rpx;
			}
		}
	}
</style>
