<template>
	<view  class="data-chart" @touchmove.stop.prevent="moveStop">
		<uni-row>
			<view
				class="tab" 
				v-for="item in tabs" 
				:key="item.objSensorId" 
				:class="{ active: active == item.objSensorId }"
				@click="handleTab(item)">
				{{ item.sensorAlias }}
			</view>
		</uni-row>
		<uni-row>
			<view class="date">
				<view
					class="tab-date" 
					v-for="item in dateTabs" 
					:key="item.interval" 
					:class="{ active: dateActive == item.interval }"
					@click="handleDateTab(item)">
					{{ item.text }}
				</view>
			</view>
		</uni-row>
		<view class="charts" v-if="historyLIst.length > 0">
			<view v-if="isType">
				<qiun-data-charts
					v-show="!isHorizontal"
					style="width: 100%; height: 500rpx;"
					type="line"
					:chartData="historicalData"
					background="#ffffff"
					:canvas2d="true"
					:opts="historicalOpts"
					:ontouch="true"
					:onzoom="true"
				/>
				<text class="unit">
					{{$t('common.unit')}}: {{ unit }}
				</text>
			</view>
			<view v-else>
				<qiun-data-charts
					v-show="!isHorizontal"
					style="width: 100%; height: 500rpx;"
					type="line"
					:chartData="historicalTypeData"
					background="#ffffff"
					:canvas2d="true"
					:opts="historicalTypeOpts"
					:ontouch="true"
					:onzoom="true"
				/>
				<text class="unit">{{ unit }}</text>
			</view>
			
			<button class="button-primary" @click="handleHorizontal">{{$t('labDevice.landscape')}}</button>
		</view>
		<view class="no-data" v-else>
			<image src="../../static/images/no-data.png" mode="aspectFill"></image>
		</view>
		
		<view class="horizontal-screen" v-if="isHorizontal && historyLIst.length > 0">
			<view class="box" v-if="isType">
				<uni-icons class="icon" type="clear" size="30" @click="closeHorizontal"></uni-icons>
				<qiun-data-charts
					type="line"
					style="width: 100%; height: 100%;"
					:chartData="horizontalData"
					background="#ffffff"
					:canvas2d="true"
					:opts="horizontalOpts"
					:ontouch="true"
					:onzoom="true"
				/>
			</view>
			<view class="box" v-else>
				<uni-icons class="icon" type="clear" size="30" @click="closeHorizontal"></uni-icons>
				<qiun-data-charts
					type="line"
					style="width: 100%; height: 100%;"
					:chartData="typeHorizontalData"
					background="#ffffff"
					:canvas2d="true"
					:opts="typeHorizontalOpts"
					:ontouch="true"
					:onzoom="true"
				/>
			</view>
		</view>
	</view>
</template>

<script>
	import { getMonitorFlag, getMonitorInfo, getDeviceSingleMonitorFlag } from "@/utils/api.js";
	import { DATAZOOM } from "@/utils/constant.js"
	export default{
		data() {
			return{
				dataZoom: DATAZOOM,
				id: null,
				type: null,
				isType: true,
				unit: "",
				// 屏幕尺寸
				windowWidth: 0,
				windowHeight: 0,
				// tab
				tabs: [],
				active: 0,
				// 时间
				dateTabs: [
					{
						text: '1h', 
						interval: 2
					},
					{
						text: '6h', 
						interval: 3
					},
					{
						text: '24h', 
						interval: 4
					},
				],
				dateActive: 2,
				// 历史数据折线图
				historicalData: {},
				historicalOpts: {
					enableScroll: true,
					legend: {
						show: false,
					},
					xAxis: {
						disableGrid: true,
						scrollShow: true,
						itemCount: 6
					},
					yAxis: {
						data:[
							{
								tofix: 2
					// 			min: 0,
					// 			max: 0
							}
						]
					}
				},
				// 有些硬件返回0和1 针对这些处理历史数据折线图
				historicalTypeData: {},
				historicalTypeOpts: {
					enableScroll: true,
					dataLabel: false,
					legend: {
						show: false,
					},
					xAxis: {
						disableGrid: true,
						scrollShow: true,
						itemCount: 6
					},
					yAxis: {
						splitNumber: 1,
						data:[
							{
								min: 0,
								max: 1
							}
						]
					}
				},
				historyLIst: [],
				// 横屏图表
				isHorizontal: false,
				horizontalData: {},
				horizontalOpts: {
					enableScroll: true,
					rotate: true,
					legend: {
						show: false,
					},
					xAxis: {
						disableGrid: true,
						scrollShow: true,
						itemCount: 10
					},
					yAxis: {
						data:[
							{
								tofix: 2
					// 			min: 0,
					// 			max: 0
							}
						]
					}
				},
				// 横屏图表-有些硬件返回0和1 针对这些处理历史数据折线图
				typeHorizontalData: {},
				typeHorizontalOpts: {
					enableScroll: true,
					dataLabel: false,
					rotate: true,
					legend: {
						show: false,
					},
					xAxis: {
						disableGrid: true,
						scrollShow: true,
						itemCount: 10
					},
					yAxis: {
						splitNumber: 1,
						data:[
							{
								min: 0,
								max: 1
							}
						]
					}
				},
				seriesName: ""
			}
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: this.$t('labDevice.dataChart')
			});
		},
		onLoad(options) {
			this.id = options.id;
			this.type = options.type; // 2设备，3房间
			if(options.type === "1"){
				this.hardwareMonitor()
			}else{
				this.monitorFlag()
			}
		},
		methods: {
			hardwareMonitor() {
				getDeviceSingleMonitorFlag({equipmentId: this.id}).then(res => {
					this.handleMonitorMessage(res)
				})
			},
			monitorFlag() {
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				getMonitorFlag({
					objId: this.id,
					objType: this.type,
				}).then(res => {
					this.handleMonitorMessage(res)
				})
			},
			handleMonitorMessage(res){
				if(res.code === 1 && res.items && res.items.length){
					this.tabs = [];
					var list = res.items;
					for(var i = 0; i < list.length; i++){
						if(list[i].inlay != 3){
							this.tabs.push(list[i])
						}
					};
					if (!this.tabs.length) {
						uni.hideLoading();
						return
					}
					this.active = this.tabs[0].objSensorId;
					this.seriesName = this.tabs[0].sensorAlias;
					this.handleUnit(this.tabs[0]);
					this.monitorInfo()
					return
				}
				uni.hideLoading();
			},
			monitorInfo() {
				var data =  {
					historyTimeInterval: 1,
					objSensorId: this.active,
					type: this.type,
					interval: this.dateActive,
					objId: this.id
				}
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				this.historicalData = {};
				this.historyLIst = [];
				getMonitorInfo(data).then(res => {
					if(res.code === 1){
						let list = res.items || [];
						this.historyLIst = list;
						const categoriesArr = [];
						const dataArr = [];
						if(list.length > 0){
							for(var i = 0; i < list.length; i++){
								categoriesArr.push(list[i].createDate.split(' ')[1]);
								dataArr.push(list[i].data)
							}
							let data = {
								categories: categoriesArr,
								series: [
								  {
									name: this.seriesName,
									data: dataArr
								  },
								]
							};
							if(this.isType){
								this.historicalData = JSON.parse(JSON.stringify(data));
							}else{
								this.historicalTypeData = JSON.parse(JSON.stringify(data));
							}
						}
					};
					uni.hideLoading();
				}).catch(() => {
					uni.hideLoading();
				})
			},
			// 探头tab
			handleTab(item){
				this.seriesName = item.sensorAlias;
				this.active = item.objSensorId;
				this.handleUnit(item);
				this.monitorInfo()
			},
			// 对应的单位
			handleUnit(item){
				if(this.dataZoom[item.monitorSensorCatId]){
					this.isType = false;
					const obj = this.dataZoom[item.monitorSensorCatId];
					this.unit = "0"+ this.$t('labDevice.mission') +" ：" + obj[1] + "，1 "+ this.$t('labDevice.mission') +"：" + obj[2];
				}else{
					this.isType = true;
					this.unit = item.unit;
				}
			},
			// 时间tab
			handleDateTab(item){
				this.dateActive = item.interval;
				this.monitorInfo()
			},
			// 横屏更新横屏图表
			handleHorizontal(){
				var itemCount = 10
				if(this.windowHeight < 580){
					itemCount = 9
				}
				if(this.windowHeight > 720){
					itemCount = 11
				}
				if(this.windowHeight > 750){
					itemCount = 12
				}
				if(this.isType){
					this.horizontalData = this.historicalData;
					this.horizontalOpts.xAxis.itemCount = itemCount
				}else{
					this.typeHorizontalData = this.historicalTypeData;
					this.typeHorizontalOpts.xAxis.itemCount = itemCount
				}
				this.isHorizontal = true;
			},
			// 关闭横屏清除数据
			closeHorizontal(){
				this.isHorizontal = false;
				this.horizontalData = {};
				this.typeHorizontalData = {}
			},
			// 一个空函数来禁止页面滑动，禁止删除
			moveStop(){
				
			}
		}
	}
</script>

<style scoped lang="scss">
	.data-chart{
		.tab{
			padding: 20rpx 40rpx;
			font-size: 32rpx;
			float: left;
			position: relative;
			color: #888;
			
			&.active{
				color: #333;
				font-weight: 600;
				&::before{
					content: '';
					width: 50%;
					height: 8rpx;
					background-color: $primary;
					position: absolute;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
					border-radius: 4rpx;
				}
			}
		}
		.date{
			margin-top: 30rpx;
			display: flex;
			justify-content: space-evenly;
			.tab-date{
				width: 210rpx;
				line-height: 72rpx;
				text-align: center;
				border-radius: 5px;
				background-color: #fff;
				margin-bottom: 40rpx;
				&.active{
					background-color: $primary;
					color: #fff;
				}
			}
		}
		.unit{
			margin: 30rpx;
			color: #666;
			display: block;
		}
		.charts{
			position: relative;
			.button-primary{
				// width: 133rpx;
				height: 60rpx;
				line-height: 60rpx;
				font-size: 26rpx;
				position: absolute;
				bottom: -12rpx;
				right: 15px;
			}
		}
		.no-data{
			text-align: center;
			margin-top: 20%;
			image{
				width: 410rpx;
				height: 314rpx;
			}
		}
		
		.horizontal-screen{
			position: absolute;
			top: 0;
			left: 0;
			width: 100vw;
			height: 100vh;
			background-color: #0000005c;
			.box{
				width: 94vw;
				height: 90vh;
				margin: 3vh auto 0;
				.icon{
					position: absolute;
					bottom: 3vh;
					right: 0;
					z-index: 1;
				}
			}
		}
	}
</style>
