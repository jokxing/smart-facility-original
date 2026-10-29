<!-- 打印预览 -->
<template>
	<view class="preview">
		<view class="detail-message" v-if="print && print.sensorData">
			<view class="message-item" v-if="print.watermark">{{ print.watermark }}</view>
			<view class="message-item">
				{{$t('transport.loadingTime')}}：<span class="item">{{print.loadingTime || ""}}</span>
			</view>
			<view class="message-item">
				{{$t('transport.beginTime')}}：<span class="item">{{print.beginTime || ""}}</span>
			</view>
			<view class="message-item">
				{{$t('transport.completeTime')}}：<span class="item">{{print.completeTime || ""}}</span>
			</view>
			<view class="message-item">
				{{$t('transport.temperatureScoped')}}：<span class="item" v-if="print.alarmMin">{{print.alarmMin + "~" + print.alarmMax}}
					℃</span>
			</view>
			<view class="message-item">
				{{$t('transport.temperatureMax')}}：<span class="item">{{print.maxTemperatureDate || ""}}
					{{print.maxTemperature || 0}} ℃</span>
			</view>
			<view class="message-item">
				{{$t('transport.temperatureMin')}}：<span class="item">{{print.minTemperatureDate || ""}}
					{{print.minTemperature || 0}} ℃</span>
			</view>
			<view class="message-item">
				<view class="">
					{{$t('transport.temperatureInfo')}}：<span class="item">{{historyTimeInterval}}
						{{$t('transport.defaultTime')}}</span>
				</view>

			</view>
			<view class="table">
				<view class="table-th1">{{$t('transport.reportTime')}}</view>
				<view class="table-th2" v-for="(item,index) in print.sensorData[0].values" :key="index">{{ item }}
				</view>
			</view>
			<template v-for="(item, index) in print.sensorData">
				<view v-if="index > 0" class="table" :key="index">
					<view class="table-th1">{{item.key}}</view>
					<view class="table-th2" v-for="(i,k) in item.values" :key="k">{{ i }}</view>
				</view>
			</template>
		</view>
		<view class="print-but">
			<button class="cancel" @click="$refs.inputDialog.open()">{{$t('transport.fixIinterVal')}}</button>
			<button class="send" disabled @click="writeBLECharacteristicValueTongzhishu">蓝牙打印未接入</button>
		</view>
		<uni-popup ref="inputDialog" type="dialog">
			<uni-popup-dialog ref="inputClose" mode="input" :title="$t('transport.interVal')"
				:value="historyTimeInterval" @confirm="dialogInputConfirm"></uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
	import {
		getTransportOrderPrintView
	} from "@/utils/api.js"
	export default {
		data() {
			return {
			print: {sensorData: [{values: []}]},
				orderId: null,
				historyTimeInterval: 15,
				range: []
			};
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: this.$t('transport.printView')
			});
		},
		onLoad(options) {
			this.orderId = options.id;
			this.getPrintView()
		},
		methods: {
			getPrintView() {
				uni.showLoading()
				getTransportOrderPrintView({
					orderId: this.orderId,
					historyTimeInterval: this.historyTimeInterval
				}).then(res => {
					uni.hideLoading()
					if (res.code) {
						this.print = res.items;
					}
				})
			},
			writeBLECharacteristicValueTongzhishu() {
				uni.showToast({title: '蓝牙打印未接入', icon: 'none'});
			},
			dialogInputConfirm(e) {
				if (typeof(e * 1) != 'number') {
					uni.showToast({
						title: this.$t('transport.interValError'),
						icon: "none"
					})
					return false;
				}
				this.historyTimeInterval = parseInt(e * 1);
				this.getPrintView();
			}
		}
	}
</script>

<style lang="scss" scoped>
	.preview {
		padding: 40rpx 60rpx 120rpx;

		.detail-message {
			background: #FFFFFF;
			box-shadow: 0px 2rpx 12rpx 0px rgba(51, 51, 51, 0.04);
			border-radius: 16rpx;
			padding: 40rpx;
			margin: 40rpx -20rpx ;
			color: #888888;
			line-height: 2;
			font-size: 28rpx;

			.item {
				color: #555555;
			}

			.table {
				display: flex;
				flex-wrap: wrap;

				.table-th1 {
					width: 50%;
				}

				.table-th2 {
					width: 140rpx;
				}
			}

		}
		
		.print-but {
			position: fixed;
			bottom: 0;
			left: 0;
			display: flex;
		}
		
		.send {
			width: 50vw;
			height: 120rpx;
			color: #CBA575;
			line-height: 120rpx;
			border-radius: 10rpx 0 0 0;
			
			&::after {
				border-bottom: none;

			}
		}

		.cancel {
			width: 50vw;
			height: 120rpx;
			color: #CBA575;
			border-radius:  10rpx 0 0 0;
			line-height: 120rpx;

			&::after {
				border-bottom: none;

			}
		}
	}
</style>
