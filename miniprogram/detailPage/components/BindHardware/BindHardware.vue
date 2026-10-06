<template>
	<view class="bindHardware-popup">
		<uni-popup
			ref="bindHardwarePopup"
			type="bottom" 
			background-color="#fff"
			class="popup">
			<view class="title">
				<uni-title type="h3" :title="$t('labDevice.bindDevice')"></uni-title>
			</view>
			<view class="list" v-for="item in list" :key="item.equipmentId" @click="goHardwareDetail(item.equipmentId)">
				<uni-row>
					<view class="name">
						{{ item.equipmentName }}
						<view 
							class="status"
							:class="statusColor(item.runStatus, MONITORSTATUS).class">
							{{ statusText(item.runStatus, MONITORSTATUS) }}
						</view>
					</view>
					<view class="no">
						{{ item.equipmentNo }}
					</view>
					<uni-icons class="icon" type="right" size="20"></uni-icons>
				</uni-row>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import { MONITORSTATUS } from "@/utils/constant.js";
	import { statusText, statusColor } from "@/utils/methods.js";
	export default{
		data() {
			return {
				MONITORSTATUS,
				statusText,
				statusColor,
				list: []
			}
		},
		methods: {
			open(list){
				this.$refs.bindHardwarePopup.open('buttom');
				this.list = list;
			},
			goHardwareDetail(id) {
				uni.navigateTo({
					url: "/detailPage/HardwareDetail/index?id=" + id
				})
			},
		},
		options: {
		   styleIsolation: 'shared'
		}
	}
</script>

<style lang="scss" scoped>
	.bindHardware-popup{
		.list{
			margin: 10rpx 30rpx;
			position: relative;
			&:last-child{
				margin-bottom: 60rpx;
			}
			::v-deep .uni-row{
				border-bottom: 1px #F5F5F5 solid;
				padding: 30rpx 0;
				.name{
					color: #333;
					font-size: 32rpx;
					display: flex;
					margin-bottom: 20rpx;
					.status{
						margin-left: 30rpx;
						font-size: 26rpx;
						padding: 6rpx 20rpx;
						border-radius: 50rpx;
						&.normal{
							color: $normal-color;
							background-color: $normal-bg;
						}
						&.abnormal{
							color: $abnormal-color;
							background-color: $abnormal-bg;
						}
						&.offLine{
							color: $offLine-color;
							background-color: $offLine-bg;
						}
					}
				}
				.no{
					font-size: 28rpx;
					color: #555;
				}
			}
			.icon{
				position: absolute;
				top: 50%;
				right: 0;
				transform: translateY(-50%);
			}
		}
	}
</style>