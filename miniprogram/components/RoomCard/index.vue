<template>
	<uni-card
		:title="item.name" 
		:border="false"
		shadow="0px 1px 6px 0px rgba(51, 51, 51, 0.04)"
		:extra="statusText(item.senorStatus, MONITORSTATUS)"
		:class="statusColor(item.senorStatus, MONITORSTATUS).class"
		@click="goRoomDetail(item)">
	    <view class="sensors">
	    	<text class="text" v-for="sensors in item.sensorList" :key="sensors.id">
	    		{{ sensors.sensorAlias }}：
	    		<text
					v-if="dataZoom[sensors.monitorSensorCatId]"
	    			class="span"
	    			:class="sensors.activateFlag === 1 ? 'abnormal' : 'normal'">
					{{ sensors.activateFlag === 1 ? dataZoom[sensors.monitorSensorCatId][1] : dataZoom[sensors.monitorSensorCatId][2] }}
	    		</text>
				<text
					v-else
					class="span"
					:class="statusColor(sensors.runStatus, MONITORSTATUS).class">
					{{ sensors.monitorSensorVal !== null && sensors.monitorSensorVal !== undefined ? sensors.monitorSensorVal : '' }} {{ sensors.unit }}
				</text>
	    	</text>
	    </view>
		<uni-row>
			<uni-col :span="24">
				<text class="card-items">{{$t('other.checkDate')}}：{{ $options.filters['forDateTime'](item.checkDate) || '' }}</text>
			</uni-col>
			<uni-col :span="24">
				<text class="card-items">{{$t('labDevice.no')}}：{{ item.no || '' }}</text>
			</uni-col>
		</uni-row>
	</uni-card>
</template>

<script>
	import { DATAZOOM, MONITORSTATUS } from '@/utils/constant.js';
	import { statusColor, statusText } from '@/utils/methods.js';
	export default{
		props: {
			item: {
				type: Object,
				default: () => {}
			}
		},
		data() {
			return {
				MONITORSTATUS,
				statusColor,
				statusText,
				dataZoom: DATAZOOM,
			}
		},
		methods: {
			goRoomDetail(item) {
				uni.navigateTo({
					url: "/detailPage/RoomDetail/index?title=" + item.name + '&id=' + item.id
				})
			}
		}
	}
</script>

<style>
</style>