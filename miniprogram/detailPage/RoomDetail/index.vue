<template>
	<view class="room-detail-page">
		<view class="tab">
			<uni-row>
				<uni-col :span="12" v-for="(item,index) in tab" :key="index">
					<view 
						class="demo-uni-col" 
						:class="{ active: active == index}"
						@click="handleRoomTab(index)">
						{{ item }}
					</view>
				</uni-col>
			</uni-row>
		</view>
		<RoomDetail ref="roomDetail" v-if="active == 0" :thingsId="id"></RoomDetail>
		
		<view v-if="active == 1">
			<view class="tab-box">
				<uni-row>
					<uni-col :span="8" v-for="(item,index) in items" :key="index">
						<view class="demo-uni-col" :class="{active: index === current}" @click="handleTab(index)">
							<text class="text">{{ item }}</text>
						</view>
					</uni-col>
				</uni-row>
			</view>
			<HistoryAlarmRecord ref="abnormalRecord" :typeData="typeData" @handleAlarmStat="handleAlarmStat"></HistoryAlarmRecord>
		</view>
	</view>
</template>

<script>
	import RoomDetail from "./RoomDetail";
	import HistoryAlarmRecord from '@/components/HistoryAlarmRecord';
	export default{
		components: {
			RoomDetail,
			HistoryAlarmRecord
		},
		data() {
			const _this = this;
			return{
				tab: [_this.$t('labDevice.detailMessage'), _this.$t('labDevice.alarmLog')],
				active: 0,
				items: [_this.$t('common.all') +"(0)", _this.$t('my.notDispose') + "(0)", _this.$t('my.disposed') + "(0)"],
				current: 0,
				id: null,
				typeData: {
					id: null,
					type: 3,
					isHead: 0,
					process: 2
				},
			}
		},
		onLoad(options) {
			this.id = parseInt(options.id);
			// uni.setNavigationBarTitle({
			// 	title: options.title
			// });
			this.typeData.id = this.id
		},
		onReachBottom(){
			if(this.active === 1){
				this.$refs.abnormalRecord.handleReachBottom()
			}
		},
		onPullDownRefresh() {
			if(this.active === 0){
				this.$refs.roomDetail.init()
			}else{
				this.$refs.abnormalRecord.init()
			}
		},
		methods: {
			handleRoomTab(index) {
				if(index === 1){
					this.typeData.thingsCreateDate = this.$refs.roomDetail.detail.createDate;
				}
				this.active = index
			},
			handleAlarmStat(e){
				this.items = [this.$t('common.all')+ "(" + e.total + ")",this.$t('my.notDispose')+ "(" + e.noProcessedCount + ")",this.$t('my.disposed') +  "(" + e.processedCount + ")"]
			},
			handleTab(index) {
				this.current = index;
				if(index === 0){
					this.typeData.process = 2
				};
				if(index === 1){
					this.typeData.process = 0
				};
				if(index === 2){
					this.typeData.process = 1
				};
				var _this = this;
				setTimeout(function(){
					_this.$refs.abnormalRecord.init()
				},100)
			},
		}
	}
</script>

<style scoped lang="scss">
	@import "../../style/css/tab.scss";
	/* #ifdef H5 */
	.room-detail-page .tab-box{
		width: calc(100% - 40rpx);
	}
	/* #endif */
</style>
