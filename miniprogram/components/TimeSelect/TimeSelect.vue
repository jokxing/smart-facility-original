<template>
	<uni-popup
		ref="popup"
		type="bottom" 
		background-color="#fff"
		class="popup time-select-popup">
		<view class="title">
			<uni-title type="h3" :title="$t('other.timeChange')"></uni-title>
			<uni-icons type="closeempty" color="#888888" size="20" @click="handleClose"></uni-icons>
		</view>
		<view class="date">
			<uni-icons :color="isPreDate ? '#ccc' : '#666'" type="left" size="20" @click="handleTurnDate(-1)"></uni-icons>
			<uni-datetime-picker type="date" v-model="single" :start="start" @change="handleDateChange">{{ dateText }}</uni-datetime-picker>
			<uni-icons color="#666" type="right" size="20" @click="handleTurnDate(1)"></uni-icons>
		</view>
		<view class="time-checkbox">
			<scroll-view class="scroll-Y" scroll-y="true">
				<uni-data-checkbox
					multiple 
					v-model="value" 
					:localdata="range" 
					:selectedColor="'#D9B480'" 
					:selectedTextColor="'#333'"
					@change="handleTimeChange">
				</uni-data-checkbox>
			</scroll-view>
		</view>
		<view class="footer">
			<button type="default" class="button button-cancel" @click="handleReset">{{$t('other.reset')}}</button>
			<button type="primary" class="button button-primary" @click="submit">{{$t('other.orderApply')}}</button>
		</view>
	</uni-popup>
</template>

<script>
	import formatter from '@/utils/formatter.js';
	import { postInstrumentReservationSchedulerListV1, postInstrumentReservationAdd } from "@/utils/api.js";
	export default{
		data() {
			return{
				dateText: "",
				date: "",
				single: "",
				start: "",
				value: [],
				range: [],
				timeFrom: "",
				timeTo: "",
				timeStart: "",
				timeEnd: "",
				isPastDate: true,
				isPreDate: true,
				obj: {},
				submitting: false
			}
		},
		methods: {
			open(obj) {
				this.obj = obj;
				this.date = formatter.formatDate(new Date(),"yyyy-MM-dd");
				this.dateText = this.date + ' ' + formatter.formatWeek(new Date());
				this.start = formatter.formatDate(new Date(),"yyyy-MM-dd");
				this.testme();
				this.getList();
				this.$refs.popup.open('bottom');
			},
			parseSafeDate(value) {
				return new Date(String(value).replace(/-/g, '/'));
			},
			testme() {
			    let tmp = [];
				this.range = [];
				var k = (parseInt(formatter.formatDate(new Date(),"hh")) * 60) + parseInt(formatter.formatDate(new Date(),"mm"));
			    for (var i = 0; i < 1440; i += 15) {
			        let mTime = i % 60;
			        let hTime = parseInt(i / 60);
			        let h = this.formatZero(hTime, 2);
			        let m = this.formatZero(mTime, 2);
					tmp.push({
						time: h + ":" + m,
						isPastTimes: this.isPastDate && i <= k,
						timeStamp: (hTime * 60) + mTime
					});
			    }
				for(var i = 0; i < tmp.length - 1; i++){
					this.range.push({
						value: i+1,
						text: tmp[i].time + '~' + tmp[i+1].time,
						startStamp: tmp[i].timeStamp,
						endStamp: tmp[i+1].timeStamp,
						disable: !!(tmp[i].isPastTimes || tmp[i + 1].isPastTimes)
					})
				}
			},
			formatZero(num, len) {
				if (String(num).length > len) return num;
				return (Array(len).join(0) + num).slice(-len);
			},
			getList() {
				var data = {
					instrumentId: this.obj.id,
					startDate: this.date + " 00:00:00",
					endDate: this.date + " 23:59:59",
				}
				uni.showLoading({
					mask: true
				});
				postInstrumentReservationSchedulerListV1(data).then(res => {
					if(res.code === 1){
						this.getAppointee(res.items || [])
					}
					uni.hideLoading();
				}).catch(() => {
					uni.hideLoading();
				})
			},
			// 被预约
			getAppointee(items) {
				for(var i = 0; i < this.range.length; i++){
					for(var j = 0; j < items.length; j++){
						if(formatter.formatDate(items[j].timeFrom, 'yyyy-MM-dd') === this.date){
							if(
								((parseInt(formatter.formatDate(items[j].timeTo,"hh")) * 60) + parseInt(formatter.formatDate(items[j].timeTo,"mm")) > this.range[i].startStamp )
								&& 
								(this.range[i].endStamp > (parseInt(formatter.formatDate(items[j].timeFrom,"hh")) * 60) + parseInt(formatter.formatDate(items[j].timeFrom,"mm")))
							){
								this.range[i].text = this.range[i].text + '\xa0\xa0\xa0\xa0' + items[j].userName
								this.range[i].disable = true
							}
						}
					}
				}
			},
			// 选择时间段
			handleTimeChange(e){
				var arr = e.detail.value;
				if(arr.length >= 2){
					this.value = [];
					let min = arr[0];
					let max = arr[arr.length-1];
					this.value.push(arr[0])
					for(var i = min + 1; i <= max; i++){
						this.value.push(i)
					}
				};
				
				if(e.detail.data.length > 0){
					this.timeStart =  e.detail.data[0].text.split('~')[0];
					this.timeEnd = e.detail.data[e.detail.data.length - 1].text.split('~')[1];
				}else{
					this.timeStart =  '';
					this.timeEnd = '';
				}
				
				this.getDateTime()
			},
			// 翻日期
			handleTurnDate(index) {
				if(index === 1){
					this.isPreDate = false;
					this.date = formatter.formatDate(new Date(this.parseSafeDate(this.date).getTime() + 86400000),"yyyy-MM-dd")
					this.dateText = formatter.formatDate(this.date,"yyyy-MM-dd") + ' ' + formatter.formatWeek(this.parseSafeDate(this.date));
				}else{
					var nowDate = formatter.formatDate(new Date(),"yyyy-MM-dd")
					if((this.parseSafeDate(this.date).getTime() - 86400000) >= this.parseSafeDate(nowDate).getTime()){
						this.date = formatter.formatDate(new Date(this.parseSafeDate(this.date).getTime() - 86400000),"yyyy-MM-dd");
						this.dateText = formatter.formatDate(this.date,"yyyy-MM-dd") + ' ' + formatter.formatWeek(this.parseSafeDate(this.date));
						if(this.date === formatter.formatDate(new Date(), "yyyy-MM-dd")){
							this.isPreDate = true;
						}
					}else{
						this.isPreDate = true;
					}
				}
				this.isPastDate = this.date === formatter.formatDate(new Date(), "yyyy-MM-dd");
				this.value = [];
				this.testme();
				this.getList()
			},
			// 选择日期
			handleDateChange(e) {
				this.date = e;
				this.dateText = e + ' ' + formatter.formatWeek(this.parseSafeDate(e));
				if(this.parseSafeDate(e).getTime() <= this.parseSafeDate(this.start).getTime()){
					this.isPastDate = true;
					this.isPreDate = true;
				}else{
					this.isPastDate = false;
					this.isPreDate = false;
				}
				this.value = [];
				this.testme();
				this.getList();
				this.getDateTime()
			},
			// 时间赋值
			getDateTime() {
				this.timeFrom = formatter.formatDate(this.date, "yyyy-MM-dd") + ' ' + this.timeStart;
				this.timeTo = formatter.formatDate(this.date, "yyyy-MM-dd") + ' ' + this.timeEnd;
			},
			submit(){
				if(this.submitting) return;
				if(this.timeFrom && this.timeTo){
					this.submitting = true;
					var data = {
						instrumentId: this.obj.id,
						timeFrom: this.timeFrom.length === 16 ? this.timeFrom + ':00' : this.timeFrom,
						timeTo: this.timeTo.length === 16 ? this.timeTo + ':00' : this.timeTo
					}
					uni.showLoading({
						mask: true
					});
					postInstrumentReservationAdd(data).then(res => {
						this.submitting = false;
						if(res.code === 1){
							this.$emit('handle', {
								msg: res.message || this.$t('my.orderApplySuccess'),
								type: "success"
							});
							this.handleClose()
						}else{
							this.$emit('handle', {
								msg: (res && res.message) || this.$t('labDevice.functionNotOpen'),
								type: "error"
							})
						}
						uni.hideLoading();
					}).catch(() => {
						this.submitting = false;
						uni.hideLoading();
					})
				}else{
					this.$emit('handle', {
						msg: this.$t('my.timeChange1'),
						type: "error"
					})
				}
			},
			// 重置
			handleReset() {
				this.value = [];
				this.timeFrom = "";
				this.timeTo = ""
			},
			// 关闭
			handleClose() {
				this.$refs.popup.close();
				this.handleReset();
			}
		},
		options: {
		   styleIsolation: 'shared'
		}
	}
</script>

<style lang="scss" scoped>
	.time-select-popup{
		.date{
			margin: 0 60rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;	
		}
		.time-checkbox{
			margin: 40rpx 0 40rpx 48rpx;
			::v-deep .uni-data-checklist .checklist-group .checklist-box{
				margin: 20rpx 0;
				.checklist-content .checklist-text{
					margin-left: 20rpx;
				}
			}
			.scroll-Y {
				height: 800rpx;
			}
		}
		.footer{
			display: flex;
			justify-content: space-between;
			margin-bottom: 60rpx;
			.button{
				border-radius: 40rpx;
				&:first-child{
					width: 240rpx;
				}
				&:last-child{
					width: 400rpx;
				}
			}
		}
	}
</style>