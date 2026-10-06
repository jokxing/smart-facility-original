<template>
	<view class="my-mission">
		<view class="tab">
			<uni-row>
				<uni-col :span="12" v-for="(item,index) in tab" :key="index">
					<view 
						class="demo-uni-col" 
						:class="{ active: active == index}"
						@click="handleTab(index)">
						{{ item }}
					</view>
				</uni-col>
			</uni-row>
		</view>
		
		<AbnormalRecord ref="abnormalRecord" :typeData="typeData"></AbnormalRecord>
	</view>
</template>

<script>
	import AbnormalRecord from '@/components/AbnormalRecord/index.vue';
	export default{
		components: {
			AbnormalRecord
		},
		data() {
			const _this = this;
			return {
				tab: [_this.$t('my.notDisAlarm'), _this.$t('my.disAlarm')],
				active: 0,
				typeData: {
					type: 4,
					isHead: 1,
					process: 0
				}
			}
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: this.$t('other.abnormal')
			});
		},
		onLoad(options) {
			this.typeData.type = parseInt(options.type);
			var _this = this
			uni.setNavigationBarTitle({
				title: _this.typeData.type === 4 ? _this.$t('my.equipmentAlarm') : _this.$t('my.roomAlarm')
			});
		},
		onPullDownRefresh() {
			this.$refs.abnormalRecord.init()
		},
		onReachBottom(){
			this.$refs.abnormalRecord.handleReachBottom()
		},
		methods: {
			handleTab(index){
				this.active = index;
				this.typeData.process = index;
				var _this = this;
				setTimeout(function(){
					_this.$refs.abnormalRecord.init()
				},100)
			},
			handlePopup() {
				this.$refs.abnormalFormPopup.open()
			},
		}
	}
</script>

<style scoped lang="scss">
	@import './MyMission.scss';
</style>