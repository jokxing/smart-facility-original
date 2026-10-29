<template>
	<view class="lower">
		<uni-grid :column="2" :showBorder="false"  :square="false">
		    <uni-grid-item class="uni-grid-item" v-for="item in data" :key="item.id">
				<view
					v-if="item.type != 8"
					class="box" 
					:class="item.activateFlag === 1 ? 'abnormal' : 'normal'" >
					<image 
						class="icon-image" 
						:src="'/static/images/' + (item.activateFlag === 1 ? 'icon-abnormal' : 'icon-normal') + '.png'">
					</image>
					<view class="text">
						<text class="text-time text-top">{{ item.sensorAlias }}</text>
						<view v-if="!dataZoom[item.monitorSensorCatId]">
							<text class="text-time text-lower">
								{{ item.monitorSensorVal !== null && item.monitorSensorVal !== undefined ? item.monitorSensorVal : '' }}
								<text class="unit">{{ item.unit }}</text>
							</text>
							<view>
								<text class="alarm-scope" v-if="item.normalMax">{{$t('other.alarmScope')}}: {{ item.normalMin + " ~ " + item.normalMax }}</text>
							</view>
						</view>
						<view v-else>
							<text class="text-time text-lower">
								{{ item.activateFlag === 1 ? dataZoom[item.monitorSensorCatId][1] : dataZoom[item.monitorSensorCatId][2] }}
							</text>
						</view>
						<text class="alarm-scope">{{ item.monitorSensorTime | forDateTime }}</text>
					</view>
				</view>
		    </uni-grid-item>
		</uni-grid>
	</view>
</template>

<script>
	import { DATAZOOM } from "@/utils/constant";
	export default{
		props: {
			data: {
				type: Array,
				default: []
			}
		},
		data() {
			return{
				dataZoom: DATAZOOM
			}
		},
	}
</script>

<style scoped lang="scss">
	.lower{
		margin-top: 20rpx;
		.uni-grid-item:nth-child(2n+2){
			.box{
				position: absolute;
				right: 0;
			}
		}
		.box{
			width: calc(96% - 40rpx);
			height: 194rpx;
			margin-bottom: 20rpx;
			border-radius: 16rpx;
			padding: 22rpx 20rpx;
			position: relative;
			.icon-image{
				width: 34rpx;
				height: 34rpx;
				position: absolute;
				top: 12rpx;
				right: 12rpx;
			}
			.text{
				width: 100%;
				.text-time{
					width: 90%;
					display:inline-block;
				}
				.text-top{
					font-size: $fontSmall;
					margin-bottom: 14rpx;
					color: #555;
				}
				.text-lower{
					font-size: 40rpx;
					margin-bottom: 20rpx;
					font-weight: bold;
					.unit{
						font-size: 24rpx;
						color: #666!important;
						margin-left: 16rpx;
					}
				}
				.alarm-scope{
					width: 100%;
					font-size: 24rpx;
					color: #777;
					display: block;
				}
			}
		}
		//正常
		.normal{
			background-color: #01cd9b26;
			.text-lower{
				color: $normal-color;
			}
		}
		//报警
		.abnormal{
			background-color: #ef4d4e26;
			.text-lower{
				color: $abnormal-color;
			}
		}
	}
</style>
