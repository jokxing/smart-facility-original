<!-- 发车确认弹窗 -->
<template>
	<view class="depart-hint">
		<uni-popup @change="change" ref="departHint" type="bottom" background-color="#fff" class="popup1">
			
				<view class="title-head">
					<uni-title type="h3" :title="$t('transport.departMessage')"></uni-title>
				</view>
				<scroll-view @scroll="scroll" :scroll-top="scrollTop" scroll-y="true" class="scroll-Y">
				<view class="content-hint">
					<h4>{{ $t('other.alarmScope') }}</h4>
					<view class="sensors">
						<view class="text" v-for="sensors in depart.simpleEquipmentVO" :key="sensors.id">
							{{ sensors.sensorAlias }}：
							<text v-if="dataZoom[sensors.monitorSensorCatId]"
								class="span">{{ sensors.activateFlag === 1 ? dataZoom[sensors.monitorSensorCatId][1] : dataZoom[sensors.monitorSensorCatId][2] }}</text>
							<text v-else-if="sensors.monitorSensorCatId == 12">{{ sensors.gps }}</text>
							<text v-else class="span">
								{{ sensors.normalMin + "~" + sensors.normalMax }}{{ sensors.unit }}
							</text>
						</view>
					</view>
					<h4>{{ $t('transport.relationWaybill') }}: <span style="color: #2A7DFD;font-weight: Bold;">
							{{ " " + depart.transportOrderStartListVos.length + $t('transport.waybillNum')}}</span>
					</h4>
					<view class="ul-waybill">
						<view class="li-waybill" v-for="item in depart.transportOrderStartListVos" :key="item.id">
							<view class="">{{$t('transport.transportNo1')}}：{{item.transportNo}}</view>
							<view class="">{{$t('transport.consigner')}}：{{item.deliverName}}</view>
							<view class="">{{$t('transport.consignee')}}：{{item.receiveName}}</view>
						</view>
					</view>
					<view class="footer">
						<uni-row>
							<uni-col :span="11">
								<button class="button-cancel" @click="close">{{ $t('common.cancel') }}</button>
							</uni-col>
							<uni-col :span="11" :push="2">
								<button class="button-primary"
									@click="handleSetState">{{ $t('common.confirm') }}</button>
							</uni-col>
						</uni-row>
					</view>

				</view>
			</scroll-view>
		</uni-popup>
	</view>
</template>

<script>
	import {
		DATAZOOM,
		MONITORSTATUS
	} from '@/utils/constant.js';
	import {
		getTransportOrderGetStateInfo
	} from "@/utils/api.js"
	export default {
		name: "deparHint",
		data() {
			return {
				MONITORSTATUS,
				dataZoom: DATAZOOM,
				depart: {simpleEquipmentVO: [], transportOrderStartListVos: []},
				scrollTop: 0,
				old: {
					scrollTop: 0
				}
			}
		},
		options: {
		  styleIsolation: 'shared' // 解除样式隔离
		},
		methods: {
			change(e) {
				this.$emit("show", e.show)
			},
			open(id) {
				this.getDepartInfo(id);
			},
			getDepartInfo(carId) {
				getTransportOrderGetStateInfo({
					carId
				}).then(res => {
					if (res.code) {
						this.depart = res.items;
						this.$refs.departHint.open('bottom');
					} else {
						uni.showToast({
							title: res.message
						})
					}
				})
			},
			close() {
				this.$refs.departHint.close();
			},
			handleSetState() {
				const arr = Array.from(this.depart.transportOrderStartListVos, ({
					id
				}) => id);
				this.$emit('change', arr, 2);
				this.close();
			},
			scroll: function(e) {
				this.old.scrollTop = e.detail.scrollTop
			},
		}
	}
</script>

<style lang="scss" scoped>
	::v-deep .uni-popup .uni-popup__wrapper {
		width: 100%;
		box-sizing: border-box;
		border-radius: 20rpx 20rpx;
	} 
	.popup1 {
		.scroll-Y {
			height: 70vh;
		}

		// border-radius: 30rpx 30rpx 0rpx 0rpx !important;
		.title-head {
			padding: 16rpx 40rpx 0 40rpx;
		}

		.content-hint {
			height: 70vh;
			padding: 0rpx 60rpx 60rpx;

			.sensors {
				margin-bottom: 40rpx;
				margin-top: 40rpx;
				margin-left: 20rpx;
			}

			.ul-waybill {
				margin-top: 40rpx;
				margin-bottom: 60rpx;

				.li-waybill {
					width: 568rpx;
					height: 136rpx;
					background: #F5F5F5;
					border-radius: 16rpx;
					margin-bottom: 20rpx;
					padding: 36rpx;
					font-size: 28rpx;
					line-height: 1.5;
				}
			}

			// 主色按钮统一
			.button-primary {
				background-color: $primary !important;
				color: #fff;
				border-radius: 50rpx;
			}

			// 取消按钮统一
			.button-cancel {
				background-color: #fff !important;
				border: 2rpx solid $primary;
				color: $primary !important;
				border-radius: 50rpx;

				&::after {
					border: none
				}
			}
			.footer {
				padding-bottom: 40rpx;
			}

		}
	}
</style>
