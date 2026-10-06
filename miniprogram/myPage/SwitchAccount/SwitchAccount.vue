<template>
	<view class="switch-account">
		<uni-title type="h1" :title="$t('my.cutUserName')"></uni-title>
		<view class="user-list">
			<image src="../../static/images/head-portrait.png" mode="aspectFill"></image>
			<view class="item">
				<view class="name">
					<text class="name-text">{{ currentName }}</text>
					<text class="text">{{$t('my.newUse')}}</text>
				</view>
				<text class="company">{{ currentCompany }}</text>
			</view>
		</view>
		<text class="hint">{{$t('my.demoLoginHint')}}</text>
	</view>
</template>

<script>
	const storage = require('@/utils/demo/storage.js')
	export default {
		data() {
			var info = storage.getDemo('userInfo', {}) || {}
			return{
				currentName: info.name || '',
				currentCompany: info.companyName || ''
			}
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: this.$t('my.cutUserName1')
			});
		}
	}
</script>

<style lang="scss" scoped>
	.switch-account{
		::v-deep .uni-h1{
			width: 100%;
		}
		.user-list{
			display: flex;
			align-items: center;
			background: #fff;
			margin: 20rpx;
			padding: 24rpx;
			border-radius: 12rpx;
			image{
				width: 84rpx;
				height: 84rpx;
				margin-right: 24rpx;
			}
			.name-text{
				margin-right: 16rpx;
			}
			.text{
				color: #C39C7C;
				font-size: 24rpx;
			}
			.company{
				display: block;
				color: #888;
				font-size: 24rpx;
			}
		}
		.hint{
			display: block;
			margin: 24rpx;
			color: #888;
			font-size: 24rpx;
			line-height: 1.5;
		}
	}
</style>
