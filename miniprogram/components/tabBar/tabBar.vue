<template>
	<view>
		<view class="tab-bar">
			<view class="navigator">
				<view class="navigator-item" v-for="(item,index) in list" :key="item.pagePath"
					@click="switchTab(index,item)">
					<image :src="item.iconPath" class="icon" v-if="selectedIndex !== item.pagePath" />
					<image :src="item.selectedIconPath" class="icon" v-else />
					<text :class="['item-text',{'text-active':selectedIndex === item.pagePath}]">{{item.text}}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "tabBar",
		props:{
			selectedIndex: {
				type: String,
				default: ""
			}
		},
		data() {
			const _this = this;
			return {
				showselected: false,
				list: [{
						"text": _this.$t('tabBar.home'),
						"pagePath": "pages/tabBar/Home/Home",
						"iconPath": require("static/images/tabBar-home.png"),
						"selectedIconPath": require("static/images/tabBar-home-on.png")
					},
					{
						"text": _this.$t('tabBar.labDevice'),
						"pagePath": "pages/tabBar/Labdevice/index",
						"iconPath": require("static/images/tabBar-labdevice.png"),
						"selectedIconPath": require("static/images/tabBar-labdevice-on.png")
					},
					{
						"text": _this.$t('tabBar.room'),
						"pagePath": "pages/tabBar/Room/Room",
						"iconPath": require("static/images/tabBar-room.png"),
						"selectedIconPath": require("static/images/tabBar-room-on.png")
					},
					{
						"text": _this.$t('tabBar.transport'),
						"pagePath": "pages/tabBar/Transport/Transport",
						"iconPath": require("static/images/tabBar-room.png"),
						"selectedIconPath": require("static/images/tabBar-room-on.png")
					},
					{
						"text": _this.$t('tabBar.user'),
						"pagePath": "pages/tabBar/My/My",
						"iconPath": require("static/images/tabBar-my.png"),
						"selectedIconPath": require("static/images/tabBar-my-on.png")
					}
				]
			};
		},
		
		methods: {
			switchTab(index, item) {
				let url = '/' + item.pagePath
				let pagePath = url
				const detail = {
					index,
					pagePath
				}
				uni.switchTab({
					from: 'tabBar',
					url,
					detail
				})
				// this.selectedIndex = index;
				uni.setStorageSync('sf-mini-demo:tabBarIndex', index)
			}
		},
	}
</script>

<style scoped lang="scss">
	.tab-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 100rpx;
		padding-bottom: constant(safe-area-inset-bottom); 
		padding-bottom:env(safe-area-inset-bottom);
		z-index: 99;
		background: #FFFFFF;
		border-top: 2rpx solid #eee;
	}

	.navigator {
		display: flex;
		justify-content: space-between;
		width: 85%;
		margin: 0 auto;
		padding: 20rpx;
	}

	.navigator-item {
		display: flex;
		align-items: center;
		flex-direction: column;
		flex: 1;
		min-width: 0;
		height: auto;
	}

	.item-text {
		white-space: nowrap;
		margin-top: 6rpx;
		color: #777E86;
		font-size: 24rpx;
	}

	.text-active {
		color: #B2704E !important;
	}

	.icon {
		width: 20px;
		height: 20px;
	}
	/* #ifdef APP-PLUS */
	.tab-bar{ height: auto; }
	.navigator{
		box-sizing: border-box;
		width: 100%;
		min-height: 100rpx;
		padding: 12rpx 24rpx;
	}
	/* #endif */
</style>
