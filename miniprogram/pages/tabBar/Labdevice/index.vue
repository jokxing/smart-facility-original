<template>
	<page-meta :page-style="'overflow:'+(popupShow?'hidden':'visible')"></page-meta>
	<view>
		<navbar ref="headers" class="header device-header" :title="isGun ? $t('labDevice.labDeviceGun') : $t('tabBar.labDevice')" :color="'#333'" :background="'#fff'">
			<view class="nav-left-btn" @click="handleToggleModule">
				<i class="iconfont" :class="isGun ? 'icon-shiyanshi' : 'icon-pipette'"></i>
				{{ isGun ? $t('labDevice.equipment') : $t('labDevice.gun') }}
			</view>
		</navbar>
		
		<view :style="{marginTop: height}" v-if="noHomeTo">
			<Labdevice :height="height" ref="labdevice" @change="changePopupShow" v-if="!isGun"></Labdevice>
			<PipetteGun ref="pipetteGun" v-else></PipetteGun>
		</view>
		<tab-bar :selectedIndex='tabBarIndex'></tab-bar>
	</view>
</template>

<script>
	import navbar from '@/components/NavigationBar/index.vue';
	import Labdevice from "@/pages/tabBar/Labdevice/Labdevice.vue";
	import PipetteGun from "@/pages/tabBar/Labdevice/PipetteGun.vue"
	const storage = require('@/utils/demo/storage.js')
	export default {
		components: {
			navbar,
			Labdevice,
			PipetteGun
		},
		data() {
			return {
				height: 0,
				isGun: false,
				noHomeTo: false,
				tabBarIndex: "",
				popupShow: false
			}
		},
		onReady() {
			this.noHomeTo = true;
			var _this = this;
			uni.getSystemInfo({
				success: function(res) { 
					let info = uni.createSelectorQuery().select(".header");
					info.boundingClientRect(function(data) { 
						_this.height = (data ? data.height : 44) + 'px';
					}).exec()
				}
			});
		},
		onShow() {
			let curRoute = 'pages/tabBar/Labdevice/index';
			this.tabBarIndex = curRoute;
			if (storage.getDemo('openGunList')) {
				this.isGun = true;
				storage.removeDemo('openGunList');
			}
			// 子组件不会收到页面 onShow；从详情返回时由页面刷新枪列表与统计。
			this.$nextTick(() => {
				const guns = this.$refs.pipetteGun;
				if (this.isGun && guns && guns._booted) {
					guns.handlePullDownRefresh();
				}
				if (!this.isGun && this.$refs.labdevice) this.$refs.labdevice.handlePullDownRefresh();
			});
			if(storage.getDemo('labStatus')){
				this.noHomeTo = false;
				setTimeout(() => {
					this.noHomeTo = true;
				},100)
			}
		},
		onReachBottom() {
			if(this.isGun){
				this.$refs.pipetteGun.handleReachBottom()
			}else{
				this.$refs.labdevice.handleReachBottom()
			}
		},
		onPullDownRefresh() {
			if(this.isGun){
				this.$refs.pipetteGun.handlePullDownRefresh()
			}else{
				this.$refs.labdevice.handlePullDownRefresh()
			}
		},
		methods: {
		handleToggleModule() {
			this.isGun = !this.isGun
		},
			changePopupShow(e) {
				this.popupShow = e
			}
		}
	}
</script>

<style scoped lang="scss">
	.header{
		position: fixed;
		width: 100%;
		top: 0;
		z-index: 1;
		::v-deep .demo{
			height: 70rpx!important;
			position: relative;
		}
		.nav-left-btn{
			position: absolute;
			bottom: 10%;
			left: 4%;
			// width: 156rpx;
			height: 60rpx;
			background-color: #FCF3EA;
			border-radius: 28rpx;
			line-height: 60rpx;
			text-align: center;
			color: #555;
			display: flex;
			justify-content: center;
			padding: 0 10rpx;
			.iconfont{
				color: #D9B480;
				margin-right: 4rpx;
			}
		}
	}
</style>
