<template>
	<uni-card
		:title="item.name" 
		:border="false"
		shadow="0px 1px 6px 0px rgba(51, 51, 51, 0.04)"
		:sub-title="statusText(item.status, LABSTATUS)" 
		:extra="statusText(item.senorStatus, MONITORSTATUS)"
		:class="[
			statusColor(item.senorStatus, MONITORSTATUS).class,
			statusColor(item.status, LABSTATUS).class,
		]"
		@click="goDetail(item)">
	    <view class="sensors">
	    	<text class="text" v-for="sensors in item.sensorList" :key="sensors.id">
	    		<text v-if="sensors.sensorAlias">{{ sensors.sensorAlias }}：</text>
				<text
					v-if="dataZoom[sensors.monitorSensorCatId]"
					class="span"
					:class="sensors.activateFlag === 1 ? 'abnormal' : 'normal'">
					{{ sensors.activateFlag === 1 ? dataZoom[sensors.monitorSensorCatId][1] : dataZoom[sensors.monitorSensorCatId][2] }}
				</text>
				<text
					v-else
					class="span"
					:class="statusColor(sensors.runStatus,MONITORSTATUS).class">
					{{ sensors.monitorSensorVal !== null && sensors.monitorSensorVal !== undefined ? sensors.monitorSensorVal : '' }} {{ sensors.unit || '' }}
				</text>
	    	</text>
	    </view>
		<uni-row>
			<uni-col :span="24">
				<text class="card-items">{{$t('other.checkDate')}}：<text v-if="item.checkDate">{{ forDateTime(item.checkDate) }}</text></text>
			</uni-col>
			<uni-col :span="24">
				<text class="card-items">{{$t('labDevice.no')}}：{{ item.no || '' }}</text>
			</uni-col>
		</uni-row>
	</uni-card>
</template>

<script>
	import { LABSTATUS, DATAZOOM, MONITORSTATUS } from '@/utils/constant.js';
	import { statusColor, statusText, forDateTime } from '@/utils/methods.js';
	export default{
		props: {
			item: {
				type: Object,
				default: () => {}
			}
		},
		data() {
			return {
				LABSTATUS,
				MONITORSTATUS,
				statusColor,
				statusText,
				dataZoom: DATAZOOM,
			}
		},
		methods: {
			forDateTime(value) {
				return forDateTime(value)
			},
			goDetail(item) {
				uni.navigateTo({
					url: '/detailPage/LabdeviceDetail/index?title=' + item.name + '&id=' + item.id
				})
			},
		}
	}
</script>

<style>
</style>