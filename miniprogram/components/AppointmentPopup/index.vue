<template>
	<view class="appointment-popup">
		<uni-popup
			ref="appointmentPopup" 
			type="bottom" 
			background-color="#fff"
			class="popup no-margin">
				<view class="title">
					<uni-title type="h3" :title="$t('labDevice.orderApply')"></uni-title>
				</view>
				<view class="appointment-apply">
					<uni-forms class="uni-forms" label-position="top">
						<uni-forms-item class="name" :label="$t('labDevice.userName')">
							<text>{{ items.operatorName }}</text>
						</uni-forms-item>
						<uni-forms-item :label="$t('labDevice.orderDate')" required>
							<view class="date-item">
								<text 
									class="time" 
									:class="{ active: timeFrom != '' }" 
									@click="handleTime(1)">
									{{ timeFrom ? timeFrom : $t('labDevice.startDate') }}
								</text>
								<text>—</text>
								<text 
									class="time" 
									:class="{ active: timeTo != '' }" 
									@click="handleTime(2)">
									{{ timeTo ? timeTo : $t('labDevice.endDate') }}
								</text>
							</view>
						</uni-forms-item>
						<uni-forms-item :label="$t('labDevice.remark')">
							<textarea class="uni-textarea" v-model="remark" />
						</uni-forms-item>
					</uni-forms>
					
					<view class="footer">
						<uni-row>
							<uni-col :span="11">
								<button type="default" class="button-cancel" @click="$refs.appointmentPopup.close()">{{$t('common.cancel')}}</button>
							</uni-col>
							<uni-col :span="11" :push="2">
								<button class="button-primary" @click="submit">{{$t('common.confirm')}}</button>
							</uni-col>
						</uni-row>
					</view>
				</view>
		</uni-popup>
		
		<AppointmentTime ref="appointmentTime" @handle="getDateTime"></AppointmentTime>
		
		<Toast ref="toast"></Toast>
	</view>
</template>

<script>
	import AppointmentTime from '@/components/AppointmentTime/index.vue'
	import Toast from '@/components/Toast/index.vue'
	import { postInstrumentReservationAdd, postInstrumentReservationUpdate } from '@/utils/api.js'
	export default{
		components: {
			AppointmentTime,
			Toast
		},
		props: ["detail"],
		data() {
			return {
				items: {},
				timeType: null,
				timeFrom: "",
				timeTo: "",
				remark: "",
				editId: null,
				lockStart: false,
				submitting: false
			}
		},
		methods: {
			showAppointmentPopup(item) {
				this.resetForm();
				this.items = item || {};
				this.$refs.appointmentPopup.open('bottom')
			},
			showEditPopup(row) {
				this.resetForm();
				this.items = Object.assign({}, row, {operatorName: row.userName});
				this.editId = row.id;
				this.timeFrom = row.timeFrom;
				this.timeTo = row.timeTo;
				this.remark = row.remark || '';
				this.lockStart = Number(row.status) === 1;
				this.$refs.appointmentPopup.open('bottom')
			},
			resetForm() {
				this.editId = null;
				this.lockStart = false;
				this.timeFrom = "";
				this.timeTo = "";
				this.remark = "";
				this.submitting = false;
			},
			handleTime(i) {
				if (i === 1 && this.lockStart) return;
				this.timeType = i;
				this.$refs.appointmentTime.open()
			},
			getDateTime(item) {
				if(item){
					if(this.timeType == 1){
						this.timeFrom = item
					}
					if(this.timeType == 2){
						this.timeTo = item
					}
				}else{
					this.$refs.toast.open(this.$t('labDevice.changeDate'),"error")
				}
			},
			submit() {
				if (this.submitting) return;
				if(this.timeFrom != "" && this.timeTo != ""){
					var from = this.timeFrom.length === 16 ? this.timeFrom + ':00' : this.timeFrom;
					var to = this.timeTo.length === 16 ? this.timeTo + ':00' : this.timeTo;
					if(new Date(from.replace(/-/g, '/')).getTime() >= new Date(to.replace(/-/g, '/')).getTime()){
						this.$refs.toast.open(this.$t('labDevice.startNotEndDate'),"error")
					}else{
						this.submitting = true;
						var req = this.editId
							? postInstrumentReservationUpdate({
								id: this.editId,
								timeFrom: from,
								timeTo: to,
								remark: this.remark
							})
							: postInstrumentReservationAdd({
								instrumentId: this.detail && this.detail.id,
								timeFrom: from,
								timeTo: to,
								remark: this.remark
							});
						uni.showLoading({
							title: this.$t('common.loading'),
							mask: true
						});
						req.then(res => {
							this.submitting = false;
							uni.hideLoading();
							if(res.code === 1){
								this.$refs.toast.open(res.message,"success");
								this.$refs.appointmentPopup.close()
								this.$emit('saved')
							}else{
								this.$refs.toast.open((res && res.message) || this.$t('labDevice.functionNotOpen'),"error")
							}
						}).catch(() => {
							this.submitting = false;
							uni.hideLoading();
						})
					}
				}else{
					this.$refs.toast.open(this.$t('labDevice.changeDate'),"error")
				}
			},
		},
	}
</script>

<style scoped lang="scss">
	.appointment-apply{
		padding: 0 30rpx 20rpx 30rpx;
		.date-item{
			display: flex;
			justify-content: space-between;
			flex-wrap: nowrap;
			align-items: center;
			.time{
				width: 46%;
				height: 84rpx;
				line-height: 84rpx;
				display: inline-block;
				text-align: center;
				border-radius: 4px;
				color: #bebebe;
				background-color: $inputBgColor;
				&.active{
					color: #333;
				}
			}
		}
	}
</style>
