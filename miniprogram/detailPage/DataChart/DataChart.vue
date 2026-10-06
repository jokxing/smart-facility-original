<template>
	<view class="data-chart" @touchmove.stop.prevent="moveStop">
		<uni-row>
			<view
				class="tab" 
				v-for="item in tabs" 
				:key="item.id" 
				:class="{ active: active == item.id }"
				@click="handleTab(item.id)">
				{{ item.text }}
			</view>
		</uni-row>
		<uni-row>
			<view
				class="tab-type" 
				v-for="item in typeTabs" 
				:key="item.idx" 
				:class="{ active: typeActive == item.idx }"
				@click="handleTabType(item)">
				{{ item.sensorType.sensorAlias }}
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
					type="line"
					:chartData="historicalData"
					background="#ffffff"
					:canvas2d="true"
					:opts="historicalOpts"
					:ontouch="true"
					:onzoom="true"
				/>
				<text class="unit">
					单位: {{ unit }}
				</text>
			</view>
			<view v-else>
				<qiun-data-charts
					v-show="!isHorizontal"
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
			
			<button class="button-primary" @click="handleHorizontal">横屏</button>
		</view>
		<view class="no-data" v-else>
			暂无数据
		</view>
		
		<view class="horizontal-screen" v-if="isHorizontal && historyLIst.length > 0">
			<view class="box" v-if="isType">
				<uni-icons class="icon" type="clear" size="30" @click="closeHorizontal"></uni-icons>
				<qiun-data-charts
					type="line"
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
	import { getInstrumentThingsList, getRoomThingsList, getDeviceDetailApp, getHistoryDeviceChart } from '@/utils/api.js'
	import { DEVICE_TYPE, DATA_ZOOM } from "@/utils/constant";
	export default{
		data() {
			return{
				id: null,
				list: [],
				unit: "",
				status: DEVICE_TYPE.STATUS,
				outageType: DEVICE_TYPE.OUTAGE_TYPE,
				ENMGType: DEVICE_TYPE.EN_MG_TYPE,
				waterOut: DEVICE_TYPE.WATER_OUT,
				signal: DEVICE_TYPE.SIGNAL,
				isType: true,
				// 屏幕尺寸
				windowWidth: 0,
				windowHeight: 0,
				// tab
				tabs: [],
				active: 0,
				// 类型
				typeTabs:[],
				typeActive: 0,
				// 时间
				dateTabs: [
					{
						text: '1小时', 
						interval: 2
					},
					{
						text: '6小时', 
						interval: 3
					},
					{
						text: '1天', 
						interval: 4
					},
				],
				dateActive: 2,
				// 折线图数据
				chartData: {
					deviceId: null,
					idx: null,
					interval: 2,
					productId: null,
					type: 2,
				},
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
					// yAxis: {
					// 	data:[
					// 		{
					// 			min: 0,
					// 			max: 0
					// 		}
					// 	]
					// }
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
			}
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: this.$t('labDevice.dataChart')
			});
		},
		onLoad(options) {
			var _this = this;
			this.id = options.id;
			uni.setNavigationBarTitle({
				title: options.title + _this.$t('labDevice.dataChart')
			});
			uni.showLoading({
				title: this.$t('common.loading'),
				mask: true
			});
			// 1硬件，2设备，3房间
			if(options.type === "1"){
				this.instrumentDetail()
			}
			if(options.type === "2"){
				this.instrumentThingsList()
			}
			if(options.type === "3"){
				this.roomThingsList()
			}
			this.chartData.type = parseInt(options.type);
			
			// 获取屏幕高度
			uni.getSystemInfo({
				success:function(res){
					_this.windowWidth = res.windowWidth;
					_this.windowHeight = res.windowHeight
				}
			})
			if(_this.windowWidth < 330){
				this.historicalOpts.xAxis.itemCount = 5
				this.historicalTypeOpts.xAxis.itemCount = 5
			}
			if(_this.windowWidth > 420){
				this.historicalOpts.xAxis.itemCount = 7
				this.historicalTypeOpts.xAxis.itemCount = 7
			}
		},
		methods: {
			// 硬件
			instrumentDetail() {
				getDeviceDetailApp({deviceId: this.id}).then(res => {
					if(res.code === 1){
						this.list = res.items;
						this.tabs.push({
							text: this.list.name, 
							id: this.list.id
						})
						this.active = this.list.id;
						this.typeTabs = this.list.sensors;
						this.typeActive = this.list.sensors[0].idx;
						
						this.handleUnit(this.typeTabs[0]);
						
						// 数据折线图传值
						this.chartData.deviceId = this.list.id;
						this.chartData.idx = this.list.sensors[0] ? this.list.sensors[0].idx : 0;
						this.chartData.productId = this.list.productId
						this.historyDeviceChart()
					}
				})
			},
			// 设备
			instrumentThingsList() {
				getInstrumentThingsList({instrumentId: this.id}).then(res => {
					this.handleMessage(res)
				})
			},
			// 房间
			roomThingsList(){
				getRoomThingsList({roomId: this.id}).then(res => {
					this.handleMessage(res)
				})
			},
			// 设备/房间公共的
			handleMessage(res){
				if(res.code === 1){
					this.list = res.items.list;
					for(var i = 0; i < this.list.length; i++){
						this.tabs.push({
							text: this.list[i].name, 
							id: this.list[i].id
						})
					}
					this.active = this.list[0].id;
					this.typeTabs = this.list[0].sensors;
					this.typeActive = this.list[0].sensors[0].idx;
					
					this.handleUnit(this.typeTabs[0]);
					
					// 数据折线图传值
					this.chartData.deviceId = this.list[0].id;
					this.chartData.idx = this.list[0].sensors[0] ? this.list[0].sensors[0].idx : 0;
					this.chartData.productId = this.list[0].productId
					this.historyDeviceChart()
				}
			},
			// 请求图表
			historyDeviceChart(){
				getHistoryDeviceChart(this.chartData).then(res => {
					uni.hideLoading();
					if(res.code === 1){
						let list = res.items.list;
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
					}
				})
			},
			// 硬件名称tab
			handleTab(id){
				this.active = id;
				this.typeActive = 0;
				for(var i = 0; i < this.list.length; i++){
					if(this.list[i].id === id){
						this.typeTabs = this.list[i].sensors;
						// 数据折线图传值
						this.chartData.deviceId = this.list[i].id;
						this.chartData.idx = this.list[i].sensors[0] ? this.list[i].sensors[0].idx : 0;
						this.chartData.productId = this.list[i].productId
					}
				}
				this.handleUnit(this.typeTabs[0]);
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				this.historyDeviceChart()
			},
			// 硬件类型tab
			handleTabType(item){
				this.typeActive = item.idx;
				this.handleUnit(item);
				this.historicalData = {};
				this.chartData.idx = item.idx;
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				this.historyDeviceChart()
			},
			// 对应的单位
			handleUnit(item){
				if(!(item.type === this.outageType || item.type === this.ENMGType || item.type === this.waterOut || item.type === this.signal)){
					this.isType = true;
					this.unit = item.sensorType.unit;
				}else{
					this.isType = false;
					const obj = DATA_ZOOM[item.type];
					this.unit = "0 " +this.$t('labDevice.mission')+ "：" + obj[1] + "，1 " +this.$t('labDevice.mission')+ "：" + obj[2];
				}
			},
			// 时间tab
			handleDateTab(item){
				this.dateActive = item.interval;
				this.chartData.interval = item.interval;
				this.historyDeviceChart()
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
			font-size: 22rpx;
			float: left;
			border-top: 1px #eee solid;
			border-left: 1px #eee solid;
			border-bottom: 1px #eee solid;
			background-color: #fff;
			
			&:last-child{
				border-right: 1px #eee solid;
			}
			
			&.active{
				background-color: $primary;
				color: #fff;
			}
		}
		.tab-type{
			margin-top: 30rpx;
			float: left;
			padding: 0 30rpx;
			&.active{
				color: $primary;
			}
		}
		.date{
			margin-top: 30rpx;
			display: flex;
			justify-content: center;
			.tab-date{
				width: 140rpx;
				line-height: 80rpx;
				text-align: center;
				float: left;
				border: 1px #eee solid;
				background-color: #fff;
				margin-right: 10rpx;
				margin-bottom: 10rpx;
				&.active{
					color: $primary;
					border-color: $primary;
				}
				&:last-child{
					margin-right: 0;
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
				width: 133rpx;
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