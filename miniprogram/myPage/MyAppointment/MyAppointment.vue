<template>
	<view class="my-appointment">
		<view class="remind-time">
			<uni-icons class="icon" custom-prefix="iconfont" type="icon-setup" size="16" color="#C39C7C"></uni-icons>
			{{$t('other.remindTime')}}：
			<picker @change="handleRemindTime" :value="index" :range="range" :range-key="'name'" class="picker">
				<view class="uni-input">{{range[index].name}}</view>
			</picker>
		</view>
		<view class="remind-hint">{{ $t('my.remindDemoHint') }}</view>
		<view class="tab-box">
			<view
				class="demo-uni-col"
				v-for="(item, i) in filterTab"
				:key="item.value"
				:class="{active: status === item.value}"
				@click="handleStatus(item.value)">
				<text class="text">{{ item.text }}</text>
			</view>
		</view>
		<view class="cardCommon">
			<view class="empty" v-if="isList && !list.length">{{ $t('common.noData') }}</view>
			<uni-card 
				v-for="item in list" 
				:key="item.id"
				:title="item.instrumentName" 
				:extra="statusText(item.status, appointmentStauts)"
				:class="statusColor(item.status, appointmentStauts).class">
				<uni-row>
					<uni-col :span="24">
						<text class="text">{{$t('labDevice.startDate')}}：{{ item.timeFrom }}</text>
					</uni-col>
					<uni-col :span="24">
						<text class="text">{{$t('labDevice.endDate')}}：{{ item.timeTo }}</text>
					</uni-col>
					<uni-col :span="24">
						<text class="text">{{$t('labDevice.useName')}}：{{ item.userName || '' }}</text>
					</uni-col>
				</uni-row>
				<view class="actions">
					<button class="button button-edit" v-if="item.status === 0 || item.status === 1" @click="handleEdit(item)">{{$t('my.editOrder')}}</button>
					<button class="button" v-if="item.status === 0 || item.status === 1" @click="handleAlertDialog(item)">{{$t('my.cancelOrder')}}</button>
				</view>
			</uni-card>
		</view>
		
		<uni-load-more :status="moreStatus" v-show="isList"></uni-load-more>
		
		<uni-popup ref="alertDialog" type="dialog">
			<uni-popup-dialog :type="msgType" :cancelText="$t('common.cancel')" :confirmText="$t('common.confirm')" :title="$t('other.hint')" :content="$t('my.cancelOrderHint')" @confirm="handleCancelReservation"
				@close="$refs.alertDialog.close()"></uni-popup-dialog>
		</uni-popup>

		<AppointmentPopup ref="appointmentPopup" @saved="reload"></AppointmentPopup>
		
		<Toast ref="toast"></Toast>
	</view>
</template>

<script>
	import Toast from "@/components/Toast/index.vue"
	import AppointmentPopup from "@/components/AppointmentPopup/index.vue"
	import { postInstrumentReservationSchedulerList, postInstrumentReservationCancel, postInstrumentReservationRemind } from '@/utils/api.js';
	import { statusColor, statusText } from '@/utils/methods.js';
	export default{
		components: {
			Toast,
			AppointmentPopup
		},
		data() {
			const _this = this;
			return {
				statusColor,
				statusText,
				appointmentStauts: [
					{
						label: _this.$t('my.notStarted'),
						code: 0,
						value: "not-started"
					},
					{
						label: _this.$t('my.inUse'),
						code: 1,
						value: "in-use"
					},
					{
						label: _this.$t('my.closed'),
						code: 2,
						value: "closed"
					},
					{
						label: _this.$t('my.canceled'),
						code: 3,
						value: "canceled"
					}
				],
				filterTab: [
					{text: _this.$t('common.all'), value: 10},
					{text: _this.$t('my.notStarted'), value: 0},
					{text: _this.$t('my.inUse'), value: 1},
					{text: _this.$t('my.closed'), value: 2},
					{text: _this.$t('my.canceled'), value: 3}
				],
				status: 10,
				list: [],
				index: 0,
				range: [
					{name: _this.$t('my.notInform'), code: 0},
					{name: _this.$t('my.inform1'), code: 2},
					{name: _this.$t('my.inform2'), code: 3},
					{name: _this.$t('my.inform3'), code: 4},
					{name: _this.$t('my.inform4'), code: 5},
					{name: _this.$t('my.inform5'), code: 6},
					{name: _this.$t('my.inform6'), code: 7},
					{name: _this.$t('my.inform7'), code: 8},
					{name: _this.$t('my.inform8'), code: 9},
				],
				pageNum: 1,
				pageSize: 10,
				total: 0,
				moreStatus: "more",
				isList: false,
				id: null,
				msgType: 'info'
			}
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: this.$t('my.myOrder')
			});
			this.reload();
		},
		onPullDownRefresh() {
			this.reload()
		},
		onReachBottom(){
			if(this.pageNum * this.pageSize < this.total){
				this.pageNum++;
				this.moreStatus = "loading";
				this.getList();
			}else{
				this.moreStatus = "no-more"
			}
		},
		methods: {
			reload() {
				this.pageNum = 1;
				this.pageSize = 10;
				this.list = [];
				this.isList = false;
				this.getList()
			},
			handleStatus(value) {
				this.status = value;
				this.reload();
			},
			getList() {
				var data = {
					isHead: 1,
					pageNum: this.pageNum,
					pageSize: this.pageSize,
					status: this.status
				};
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				postInstrumentReservationSchedulerList(data).then(res => {
					if(res.code === 1 && res.items && res.items.pageData){
						this.isList = true
						this.pageSize = res.items.pageData.pageSize;
						this.total = res.items.pageData.total;
						for(var i = 0; i < this.range.length; i++){
							if(this.range[i].code === res.items.remind){
								this.index = i
							}
						}
						var list = res.items.pageData.list || []
						if(this.pageNum > 1){
							for(var i = 0; i < list.length; i++){
								this.list.push(list[i])
							}
						}else{
							this.list = list;
						}
						if(this.pageSize * this.pageNum >= this.total){
							this.moreStatus = "no-more"
						}else{
							this.moreStatus = "more"
						}
					} else if (this.$refs.toast) {
						this.$refs.toast.open((res && res.message) || this.$t('common.noData'), 'error')
						this.isList = true;
					}
					uni.stopPullDownRefresh();
					uni.hideLoading();
				}).catch(() => {
					this.isList = true;
					uni.stopPullDownRefresh();
					uni.hideLoading();
				})
			},
			handleRemindTime(e) {
				this.index = e.target.value;
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				postInstrumentReservationRemind({reservationRemind: this.range[this.index].code}).then(res => {
					if(res.code === 1){
						this.$refs.toast.open(res.message || this.$t('my.remindDemoHint'),"success");
					}else{
						this.$refs.toast.open((res && res.message) || this.$t('labDevice.functionNotOpen'),"error")
					}
					uni.hideLoading();
				}).catch(() => {
					uni.hideLoading();
				})
			},
			handleEdit(item){
				this.$refs.appointmentPopup.showEditPopup(item)
			},
			handleAlertDialog(item){
				this.$refs.alertDialog.open();
				this.id = item.id
			},
			handleCancelReservation() {
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				postInstrumentReservationCancel(this.id).then(res => {
					uni.hideLoading();
					if(res.code === 1){
						this.$refs.toast.open(res.message || this.$t('labDevice.cancelOrderSuccess'),"success");
						this.reload()
					}else{
						this.$refs.toast.open((res && res.message) || this.$t('labDevice.functionNotOpen'),"error")
					}
				}).catch(() => {
					uni.hideLoading();
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	@import './MyAppointment.scss';
</style>
