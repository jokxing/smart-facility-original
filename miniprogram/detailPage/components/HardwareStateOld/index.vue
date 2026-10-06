<template>
	<view class="lower">
		<uni-grid :column="2" :showBorder="false"  :square="false">
		    <uni-grid-item class="uni-grid-item" v-for="item in data" :key="item.id"  v-if="item.type != 0 && item.isBind === 0">
				<view
					v-if="item.type != 8"
					class="box" 
					:class="handeStatus(item.status) ? 'normal' : 'abnormal'" >
					<image 
						class="icon-image" 
						:src="'../../../static/images/' + (handeStatus(item.status) ? 'icon-normal' : 'icon-abnormal') + '.png'">
					</image>
					<view class="text">
						<text class="text-time text-top">{{ item.sensorType.sensorAlias }}</text>
						<text class="text-time text-lower">
							{{ handleFilter(item.type, item.status, item.value, item.valueStr) }}
							<text class="unit">{{ item.sensorType.unit }}</text>
						</text>
						<view v-if="!(item.type === outageType || item.type === ENMGType || item.type === waterOut || item.type === signal)">
							<text class="alarm-scope">{{$t('other.alarmScope')}}: {{ item.min + " ~ " + item.max }}</text>
						</view>
					</view>
				</view>
				<view 
					class="box"
					:class="handeStatus(item.status) ? 'normal' : 'abnormal'"
					v-else>
					<image
						class="icon-image" 
						:src="'../../../static/images/' + (handeStatus(item.status) ? 'icon-normal' : 'icon-abnormal') + '.png'">
					</image>
					<view class="text">
						<text class="text-time text-top">{{ item.name }}</text>
						<text class="text-time text-lower">
							{{ item.powerFailure == 1 ? $t('other.notBroken') : $t('other.broken') }}
						</text>
					</view>
				</view>
		    </uni-grid-item>
		</uni-grid>
	</view>
</template>

<script>
	import { DATA_ZOOM, DEVICE_TYPE, GREENSTATUS } from "@/utils/constant";
	export default{
		props: {
			data: {
				type: Array,
				default: []
			}
		},
		data() {
			return{
				status: DEVICE_TYPE.STATUS,
				outageType: DEVICE_TYPE.OUTAGE_TYPE,
				ENMGType: DEVICE_TYPE.EN_MG_TYPE,
				waterOut: DEVICE_TYPE.WATER_OUT,
				signal: DEVICE_TYPE.SIGNAL,
				isBindLength: 0
			}
		},
		methods: {
			handleFilter(type, status, val, valueStr) {
				if (DATA_ZOOM[type]) {
					const obj = DATA_ZOOM[type];
					return val ? obj[2] : obj[1];
				} else {
					return val
				}
			},
			handeStatus(status){
				for(var i = 0; i < GREENSTATUS.length; i++){
					if(status === GREENSTATUS[i]){
						return true
					}
				}
			}
		}
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
			height: 172rpx;
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
					font-size: 48rpx;
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
