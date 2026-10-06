<template>
	<uni-card
		:title="item.name" 
		:border="false"
		shadow="0px 1px 6px 0px rgba(51, 51, 51, 0.04)"
		:extra="statusText(item.homingStatus, GUNSTATUS)"
		:class="statusColor(item.homingStatus, GUNSTATUS).class"
		@click="goDetail(item)">
		<uni-row>
			<uni-col :span="24">{{$t('labDevice.principal')}}：<text>{{ item.headUser }}</text></uni-col>
			<uni-col :span="24">{{$t('labDevice.owningAddrss')}}：<text>{{ item.position }}</text></uni-col>
			<uni-col :span="24">
				<text class="card-items">{{$t('other.takeOutTime')}}：<text>{{ (item.takeOutTime) | forDateTime }}</text></text>
			</uni-col>
			<uni-col :span="24">
				<text class="card-items">{{$t('other.homingTime')}}：<text>{{ item.homingTime | forDateTime }}</text></text>
			</uni-col>
		</uni-row>
	</uni-card>
</template>

<script>
	import { GUNSTATUS } from '@/utils/constant.js';
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
				GUNSTATUS,
				statusColor,
				statusText,
			}
		},
		methods: {
			goDetail(item){
				uni.navigateTo({
					url: '/detailPage/PipetteGunDetail/index?title=' + item.name + '&id=' + item.pipetteGunId + '&no=' + item.no
				})
			}
		}
	}
</script>

<style>
</style>