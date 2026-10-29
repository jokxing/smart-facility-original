<template>
	<view class="">
		<uni-popup
			ref="popup"
			type="bottom" 
			background-color="#fff"
			class="popup date-time-popup"
			:mask-click="false">
			<view class="title">
				<uni-title type="h3" :title="$t('other.orderApply')"></uni-title>
			</view>
			<scroll-view class="scroll-view_H" scroll-x="true" scroll-left="120">
				<view 
					class="date-item" 
					v-if="dateArr.length > 0" 
					v-for="item in dateArr" 
					:key="item.id"
					:class="{ acitve: dateActive == item.id }"
					@click="handleDate(item)">
					<text class="text">{{ item.week }}</text>
					<uni-dateformat class="dateformat" :date="item.date" format="yyyy-MM-dd"></uni-dateformat>
				</view>
			</scroll-view>
			
			<uni-data-checkbox class="data-checkbox" :localdata="range"></uni-data-checkbox>
			
			<scroll-view class="scroll-Y" scroll-y="true">
				<uni-data-checkbox 
					class="time-checkbox" 
					v-model="timeRadio" 
					:localdata="timeArr"
					@change="handleTime">
				</uni-data-checkbox>
			</scroll-view>
			<view class="footer">
				<button class="button" @click="close">{{$t('other.close')}}</button>
				<button class="button button-primary" @click="submit">{{$t('common.confirm')}}</button>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import formatter from '@/utils/formatter.js'
	export default{
		data() {
			const _this = this;
			return{
				now: Date.now(),
				dateArr: [],
				dateActive: 0,
				date: "",
				range: [
					{
						text: _this.$t('other.orderOrNotOrder'),
						disable:true
					},
				],
				timeArr: [],
				timeRadio: null,
				time: ""
			}
		},
		mounted() {
			const myDate = new Date().getTime();
			var dateArr = [];
			var a = new Array(this.$t('other.sunday'), this.$t('other.monday'), this.$t('other.tuesday'), this.$t('other.wednesday'), this.$t('other.thursday'), this.$t('other.friday'), this.$t('other.saturday'));  
			for(var i = 0; i < 7; i++){
				dateArr.push({
					id: i,
					date: myDate + 86400000*i,
					week: i == 0 ? this.$t('other.day') : i == 1 ? this.$t('other.tomorrow') : a[new Date(myDate + 86400000*i).getDay()]
				})
			};
			this.dateArr = dateArr;
			
			this.date = formatter.formatDate(new Date(),"yyyy-MM-dd"); 
			
			this.testme()
		},
		methods: {
			open() {
				this.$refs.popup.open('bottom');
				this.testme()
			},
			handleDate(item){
				this.date = formatter.formatDate(new Date(item.date),"yyyy-MM-dd"); 
				this.dateActive = item.id;
				this.testme()
			},
			testme() {
				let tmp = [];
				for (var i = 0; i < 1440; i += 15) {
					let m = i % 60;
					let h = parseInt(i / 60);
					h = this.formatZero(h, 2);
					m = this.formatZero(m, 2);
					tmp.push({
						text: h + ":" + m,
						value: i,
						disable: this.timeRange(h + ":" + m)
					});
				};
				this.timeArr = tmp;
			},
			formatZero(num, len) {
				if (String(num).length > len) return num;
				return (Array(len).join(0) + num).slice(-len);
			},
			timeRange(beginTime) {
				var strb = beginTime.split(":");
			      if (strb.length != 2) {
			        return false;
			      }
			      var b = new Date(this.date);
			      var n = new Date();
			      b.setHours(strb[0]);
			      b.setMinutes(strb[1]);
			      if (n.getTime() < b.getTime()) {
			        return false;
			      } else {
			        return true;
			      }
			},
			handleTime(e){
				this.time = e.detail.data.text
			},
			submit(){
				if(this.timeRadio !== null){
					this.$emit("handle", this.date + ' ' + this.time);
					this.close()
				}else{
					this.$emit("handle");
				}
			},
			close(){
				this.$refs.popup.close();
				this.dateActive = 0;
				this.date = formatter.formatDate(new Date(),"yyyy-MM-dd");
				this.timeRadio = null;
			}
		}
	}
</script>

<style scoped lang="scss">
	.date-time-popup{
		.scroll-view_H {
			white-space: nowrap;
			width: 100%;
			margin-top: 20rpx;
		}
		.date-item{
			width: 200rpx;
			padding: 10rpx 0;
			text-align: center;
			display: inline-block;
			border-top: 1px #d6d6d6 solid;
			border-left: 1px #d6d6d6 solid;
			border-bottom: 1px #d6d6d6 solid;
			font-size: 30rpx;
			&:first-child{
				margin-left: 30rpx;
			}
			&:last-child{
				margin-right: 30rpx;
				border-right: 1px #d6d6d6 solid;
			}
			&.acitve{
				background-color: $primary;
				.text{
					color: #fff;
				}
				.dateformat{
					color: #fff;
				}
			}
			.text{
				width: 100%;
				display: block;
			}
		}
		.data-checkbox{
			margin-left: 50rpx;
			margin-top: 30rpx;
			display: block;
		}
		.scroll-Y {
			height: 600rpx;
			padding: 30rpx 30rpx 60rpx 50rpx;
		}
		.footer{
			margin: 0 30rpx 30rpx;
			display: flex;
			.button{
				width: 48%;
				height: 100rpx;
				line-height: 100rpx;
				
			}
		}
	}
</style>
