<template>
	<view class="abnormalRecord">
		<view class="abnormalRecord-content">
			<uni-card 
				v-for="(item,index) in list"
				:key="index"
				class="abnormalRecord-card" 
				:class="[item.process ? 'normal' : 'abnormal']"
				:title="item.sensorAlias" 
				:extra="item.process ? $t('my.disposed') : $t('my.notDispose')" 
				:margin="0"
				@click="showAbnormalFormPopup(item,index)">
			    <uni-row v-if="handleDeviceType(item.monitorSensorId)">
					<uni-col :span="14">
						<text class="text">{{$t('other.alarmValue')}}：{{ item.monitorSensorVal || '' }}</text>
					</uni-col>
					<uni-col :span="10">
						<text class="text">
							{{$t('other.alarmScope')}}：{{ item.monitorNormalMin !== null && item.monitorNormalMin !== undefined && item.monitorNormalMax !== null && item.monitorNormalMax !== undefined ? item.monitorNormalMin + " ~ " + item.monitorNormalMax : '' }}
						</text>
					</uni-col>
				</uni-row>
				<uni-row>
					<uni-col :span="14">
						<text class="text">{{$t('labDevice.duration')}}：{{ item.durationFormat || ''  }}</text>
					</uni-col>
					<uni-col :span="10" v-if="handleDeviceType(item.monitorSensorId)">
						<text class="text">{{$t('other.recoverValue')}}：{{ item.monitorAlarmEndVal || '' }}</text>
					</uni-col>
				</uni-row>
			    <uni-row>
					<uni-col :span="24">
						<text class="text">{{$t('labDevice.startDate')}}：{{ $options.filters['forDateTime'](item.alarmStartTime) || '' }}</text>
					</uni-col>
				</uni-row>
			    <uni-row>
					<uni-col :span="24">
						<text class="text">{{$t('labDevice.endDate')}}：{{ item.alarmFlag ? $options.filters['forDateTime'](item.monitorAlarmEndTime) : '' }}</text>
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
	import AbnormalFormPopup from '@/components/AbnormalFormPopup/AbnormalFormPopup.vue';
	import Toast from '@/components/Toast/index.vue';
	import { postHistoryAlarmRecordAlarmApp } from '@/utils/api.js';
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
			init(type){
				this.pageNum = 1;
				this.pageSize = 10;
				this.list = [];
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				// type: 2设备，3房间
				this.historyAlarmRecordAlarm()
			},
			historyAlarmRecordAlarm(){
				var data = {
					isHead: this.typeData.isHead,
					objId: this.typeData.id,
					objType: this.typeData.type,
					process: this.typeData.process,
					pageNum: this.pageNum,
					pageSize: this.pageSize,
					thingsCreateDate: this.typeData.thingsCreateDate
				};
				postHistoryAlarmRecordAlarmApp(data).then(res => {
					this.handleMessage(res)
				})
			},
			handleMessage(res){
				if(res.code === 1 && res.items){
					this.isList = true;
					this.pageSize = res.items.pageSize;
					this.total = res.items.total;
					// 空筛选结果也需更新全范围统计，不能从当前列表计算数量。
					if (res.items.alarmStat) this.$emit('handleAlarmStat', res.items.alarmStat)
					if(res.items.list && res.items.list.length > 0){
						const { alarmStat, alarmInfo } = res.items.list[0];
						if (!res.items.alarmStat) this.$emit('handleAlarmStat', alarmStat)
						var info = alarmInfo || []
						for(var i = 0; i < info.length; i++){
							this.list.push(info[i])
						}
						if(this.pageSize * this.pageNum >= this.total){
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
			},
			// 区分硬件类型
			handleDeviceType(type){
				var isType;
				var types = Number(type);
				if(types === 46){
					isType = false;
				}else if(DEVICE_ID[types]){
					isType = false;
				}else{
					isType = true;
				}
				
				return isType
			},
			// 显示报警处理
			showAbnormalFormPopup(item){
				this.isAbnormalFormPopup = true;
				var _this = this;
				setTimeout(function(){
					if (_this.$refs.abnormalFormPopup) _this.$refs.abnormalFormPopup.open(item)
				},100)
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
					this.historyAlarmRecordAlarm()
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
			/* #ifdef H5 || APP-PLUS */
			// uni-card 的内联 margin: 0 会覆盖普通外边距。
			margin-bottom: 24rpx !important;
			&:last-child{
				margin-bottom: 0 !important;
			}
			/* #endif */
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
