<template>
	<view>
		<view class="tab">
			<uni-row>
				<uni-col :span="12" v-for="(item,index) in tab" :key="index">
					<view 
						class="demo-uni-col" 
						:class="{ active: active == index}"
						@click="active = index">
						{{ item }}
					</view>
				</uni-col>
			</uni-row>
		</view>
		
		<HardwareDetail ref="hardwareDetail" v-if="active == 0" :thingsId="id"></HardwareDetail>
		
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
			<AbnormalRecord ref="abnormalRecord" :typeData="typeData" @handleAlarmStat="handleAlarmStat"></AbnormalRecord>
		</view>
	</view>
</template>

<script>
	import HardwareDetail from "./HardwareDetail";
	import AbnormalRecord from '@/components/AbnormalRecord';
	export default{
		components: {
			HardwareDetail,
			AbnormalRecord
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
					type: 1,
					processFlag: 2
				},
			}
		},
		onLoad(options) {
			this.id = parseInt(options.id);
			this.typeData.id = this.id
		},
		onReachBottom(){
			if(this.active === 1){
				this.$refs.abnormalRecord.handleReachBottom()
			}
		},
		onPullDownRefresh() {
			if(this.active === 0){
				this.$refs.hardwareDetail.deviceDetail()
			}else{
				this.$refs.abnormalRecord.init()
			}
		},
		methods: {
			handleAlarmStat(e){
				this.items = [this.$t('common.all')+ "(" + e.total + ")",this.$t('my.notDispose')+ "(" + e.noProcessedCount + ")",this.$t('my.disposed') +  "(" + e.processedCount + ")"]
			},
			handleTab(index) {
				this.current = index;
				if(index === 0){
					this.typeData.processFlag = 2
				};
				if(index === 1){
					this.typeData.processFlag = 0
				};
				if(index === 2){
					this.typeData.processFlag = 1
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
</style>