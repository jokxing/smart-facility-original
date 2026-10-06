<template>
	<view class="search">
		<uni-search-bar :placeholder="$t('common.inputNameNo')" v-model="keyword" @confirm="search" @clear="handleClear" bgColor="#fff" :cancelText="$t('common.cancel')"></uni-search-bar>
		
		<view class="list cardCommon">
			<template v-for="item in list">
				<LabdeviceCard v-if="item.type === 2" :key="item.id" :item="item"></LabdeviceCard>
				<RoomCard v-if="item.type === 3" :key="item.id" :item="item"></RoomCard>
				<PipetteGunCard v-if="item.type === 101" :key="item.pipetteGunId" :item="item"></PipetteGunCard>
			</template>
		</view>
	</view>
</template>

<script>
	import LabdeviceCard from "@/components/LabdeviceCard/index.vue";
	import RoomCard from "@/components/RoomCard/index.vue";
	import PipetteGunCard from "@/components/PipetteGunCard/index.vue";
	import { postInstrumentSearch } from "@/utils/api.js";
	export default{
		components: {
			LabdeviceCard,
			RoomCard,
			PipetteGunCard
		},
		data() {
			return {
				keyword: "",
				list: []
			}
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: this.$t('route.search')
			});
		},
		methods: {
			search(){
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				postInstrumentSearch({keyword: this.keyword}).then(res => {
					if(res.code === 1){
						this.list = res.items || []
					} else {
						this.list = []
						uni.showToast({title: (res && res.message) || '搜索失败', icon: 'none'})
					}
					uni.hideLoading();
				}).catch(() => {
					uni.hideLoading();
				})
			},
			handleClear() {
				this.list = []
			}
		}
	}
</script>

<style scoped>
	.search{
		padding-bottom: 60rpx;
	}
</style>