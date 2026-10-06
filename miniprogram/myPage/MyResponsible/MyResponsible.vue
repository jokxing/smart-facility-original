<template>
	<view>
		<view class="list cardCommon">
			<template v-if="type === '2'">
				<LabdeviceCard v-for="item in list" :key="item.id" :item="item"></LabdeviceCard>
			</template>
			
			<template v-if="type === '3'">
				<RoomCard v-for="item in list" :key="item.id" :item="item"></RoomCard>
			</template>
		</view>
		
		<uni-load-more :status="moreStatus" v-show="isList"></uni-load-more>
	</view>
</template>

<script>
	import LabdeviceCard from "@/components/LabdeviceCard/index.vue";
	import RoomCard from "@/components/RoomCard/index.vue";
	import { postInstrumentThingsListApp, postRoomList } from "@/utils/api.js";
	export default{
		components: {
			LabdeviceCard,
			RoomCard
		},
		data() {
			return{
				type: "",
				list: [],
				pageNum: 1,
				pageSize: 10,
				total: 0,
				// 加载更多
				moreStatus: "no-more",
				isList: false,
			}
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: this.$t('my.myResponsible')
			});
		},
		onLoad(options) {
			this.type = options.type;
			if(options.type === '2'){
				uni.setNavigationBarTitle({
					title: this.$t('my.myResponsibleEquipment')
				});
				this.getLabList()
			}
			if(options.type === '3'){
				uni.setNavigationBarTitle({
					title: this.$t('my.myResponsibleRoom')
				});
				this.getRoomList()
			}
		},
		onPullDownRefresh() {
			this.pageNum = 1;
			this.pageSize = 10;
			this.list = [];
			this.isList = false;
			if(this.type === '2'){
				this.getLabList();
			}else{
				this.getRoomList()
			}
		},
		onReachBottom(){
			if(this.pageNum * this.pageSize < this.total){
				this.pageNum++;
				this.moreStatus = "loading";
				if(this.type === '2'){
					this.getLabList();
				}else{
					this.getRoomList()
				}
			}else{
				this.moreStatus = "no-more"
			}
		},
		methods: {
			getLabList() {
				var data = {
					pageNum: this.pageNum,
					pageSize: this.pageSize,
					isHead: 1
				};
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				postInstrumentThingsListApp(data).then(res => {
					this.handleMessage(res)
				})
			},
			getRoomList() {
				var data = {
					pageNum: this.pageNum,
					pageSize: this.pageSize,
					isHead: 1
				};
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				postRoomList(data).then(res => {
					this.handleMessage(res)
				})
			},
			handleMessage(res){
				if(res.code === 1 && res.items){
					this.isList = true;
					var list = res.items.list || []
					if(this.pageNum > 1){
						for(var i = 0; i < list.length; i++){
							this.list.push(list[i])
						}
					}else{
						this.list = list;
					}
					this.total = res.items.total;
					if(this.pageNum * this.pageSize >= this.total){
						this.moreStatus = "no-more"
					}else{
						this.moreStatus = "more";
					}
				}else{
					uni.showToast({title: (res && res.message) || this.$t('common.noData'), icon: 'none'})
				}
				uni.hideLoading();
				uni.stopPullDownRefresh();
			}
		}
	}
</script>

<style>
</style>