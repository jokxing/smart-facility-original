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
		
		<view v-if="active == 0">
			<GunDetail ref="GunDetail" :thingsId="id"></GunDetail>
		</view>
		
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
			<GunAbnormalRecord ref="abnormalRecord" :typeData="typeData" @handleAlarmStat="handleAlarmStat"></GunAbnormalRecord>
		</view>
	</view>
</template>

<script>
	import GunDetail from "./GunDetail.vue";
	import GunAbnormalRecord from './common/GunAbnormalRecord';
	export default{
		components: {
			GunDetail,
			GunAbnormalRecord
		},
		data() {
			const _this = this;
			return{
				tab: [_this.$t('labDevice.detailMessage'), _this.$t('labDevice.alarmLog')],
				active: -1,
				items: [_this.$t('labDevice.outTimeReturn')],
				current: 0,
				id: null,
				typeData: {
					id: null,
					no: "",
					isHead: 0,
					type: 200
				},
			}
		},
		onLoad(options) {
			this.id = parseInt(options.id);
			this.typeData.id = this.id;
			this.typeData.no = options.no;
			this.active = 0
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: this.$t('route.pipetteGunDetail')
			});
		},
		onReachBottom(){
			if(this.active === 1){
				this.$refs.abnormalRecord.handleReachBottom()
			}
		},
		onPullDownRefresh() {
			if(this.active === 0){
				this.$refs.GunDetail.handleDetail()
			}else{
				this.$refs.abnormalRecord.init()
			}
		},
		methods: {
			handleTab(index) {
				this.current = index;
				if(index === 0){
					this.typeData.type = 200
				};
				if(index === 1){
					this.typeData.type = 201
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
