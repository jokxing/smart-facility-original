<template>
	<view class="abnormalRecord">
		<view class="abnormalRecord-content">
			<uni-card 
				v-for="item in list"
				:key="item.id"
				class="abnormalRecord-card" 
				:class="[item.process ? 'normal' : 'abnormal']"
				:title="item.gunName" 
				:extra="item.process ? $t('my.disposed') : $t('my.notDispose')" 
				:margin="0"
				@click="showAbnormalFormPopup(item)">
			    <uni-row>
					<uni-col :span="10">
						<text class="text">{{$t('labDevice.useName')}}：{{ typeData.type === 200 ? (item.endUser || '') : (item.handleUser || '') }}</text>
					</uni-col>
					<uni-col :span="14">
						<text class="text">{{$t('labDevice.duration')}}：{{ item.duration || '' }}</text>
					</uni-col>
				</uni-row>
				<uni-row>
					<uni-col :span="24">
						<text class="text">{{$t('labDevice.startDate')}}：{{ $options.filters['forDateTime'](item.createDate) || '' }}</text>
					</uni-col>
				</uni-row>
				<uni-row>
					<uni-col :span="24">
						<text class="text">{{$t('labDevice.endDate')}}：{{ $options.filters['forDateTime'](item.updateDate) || '' }}</text>
					</uni-col>
				</uni-row>
				<uni-row>
					<uni-col :span="24">
						<text class="text">{{$t('labDevice.getTime')}}：{{ $options.filters['forDateTime'](item.takeOutTime) || '' }}</text>
					</uni-col>
				</uni-row>
				<uni-row>
					<uni-col :span="24">
						<text class="text">{{$t('labDevice.returnTime')}}：{{ item.homingTime || '' }}</text>
					</uni-col>
				</uni-row>
			</uni-card>
		</view>
	
		<AbnormalFormPopup ref="abnormalFormPopup" v-if="isAbnormalFormPopup" @handle="handleToast"></AbnormalFormPopup>
		
		<uni-load-more :status="moreStatus" v-if="isList"></uni-load-more>
		
		<Toast ref="toast"></Toast>
	</view>
</template>

<script>
	import AbnormalFormPopup from '@/components/AbnormalFormPopup/index.vue';
	import Toast from '@/components/Toast/index.vue'
	import { getHistoryThingsAlarmApp, getHistoryDeviceAlarm } from '@/utils/api.js';
	import { DEVICE_ID } from '@/utils/constant.js'
	export default{
		props: ["typeData"],
		components: {
			AbnormalFormPopup,
			Toast
		},
		data() {
			return {
				isList: false,
				list: [],
				// 加载更多
				moreStatus: "no-more",
				// 分页
				pageNum: 1,
				pageSize: 10,
				total: 0,
				isAbnormalFormPopup: false
			}
		},
		mounted() {
			this.init()
		},
		methods: {
			init(){
				this.pageNum = 1;
				this.pageSize = 10;
				this.list = [];
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				this.historyDeviceAlarm()
			},
			handlePull() {
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				this.historyDeviceAlarm()
			},
			historyDeviceAlarm() {
				var data = {
					deviceId: this.typeData.id, 
					type: this.typeData.type,
					deviceNo: this.typeData.no,
					pageNum: this.pageNum,
					pageSize: this.pageSize,
				};
				getHistoryDeviceAlarm(data).then(res => {
					if(res.code === 1){
						this.isList = true;
						this.total = res.items.total;
						if(res.items.list.length > 0){
							for(var i = 0; i < res.items.list.length; i++){
								this.list.push(res.items.list[i])
							}
							
							if(this.pageSize * this.pageNum > this.total){
								this.moreStatus = "no-more"
							}else{
								this.moreStatus = "more"
							}
						}else{
							this.moreStatus = "no-more"
						}
					}
					uni.stopPullDownRefresh();
					uni.hideLoading()
				})
			},
			// 显示报警处理
			showAbnormalFormPopup(item){
				if(item.updateDate){
					this.isAbnormalFormPopup = true;
					var _this = this;
					setTimeout(function(){
						_this.$refs.abnormalFormPopup.open(item, 15)
					},100)
				}
			},
			// 提示语+更新数据
			handleToast(msg,item){
				var _this = this;
				if(msg && item){
					this.$refs.toast.open(msg,item);
					this.init();
					if(item != 'error'){
						setTimeout(function(){
							_this.isAbnormalFormPopup = false
						},500)
					}
				}else{
					setTimeout(function(){
						_this.isAbnormalFormPopup = false
					},500)
				}
			},
			// 上拉更新
			handleReachBottom(){
				if(this.pageNum * this.pageSize < this.total){
					this.pageNum++;
					this.moreStatus = "loading"
					this.historyDeviceAlarm()
				}else{
					this.moreStatus = "no-more"
				}
			},
			// 下拉更新
			handlePullDownRefresh(){
				this.isList = false;
				this.init()
			}
		},
	}
</script>

<style scoped lang="scss">
	.abnormalRecord-content{
		margin: 16rpx 20rpx 0;
		.abnormalRecord-card{
			margin-bottom: 20rpx;
			display: block;
			.uni-card .uni-card__content{
				padding: 10px 0!important;
			}
			.text{
				font-size: $fontSmall!important;
			}
		}
	}
</style>
