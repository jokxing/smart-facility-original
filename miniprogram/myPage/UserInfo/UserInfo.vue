<template>
	<view class="user-info">
		<uni-row>
			<uni-col :span="6">{{$t('my.userName')}}</uni-col>
			<uni-col :span="18">
				<text style="color: #888;">{{ info.loginId }}</text>
			</uni-col>
			<uni-col :span="6">{{$t('my.name')}}</uni-col>
			<uni-col :span="18">{{ info.name }}</uni-col>
			<uni-col :span="6">{{$t('my.tel')}}</uni-col>
			<uni-col :span="18">{{ info.tel }}</uni-col>
			<uni-col :span="6">{{$t('my.email')}}</uni-col>
			<uni-col :span="18">{{ info.email || '' }}</uni-col>
			<uni-col :span="6">{{$t('my.rule')}}</uni-col>
		<uni-col :span="18">{{ (info.roles && info.roles[0] && info.roles[0].name) || '' }}</uni-col>
		</uni-row>
		
		<!-- <uni-row>
			<uni-title type="h3" title="绑定关系"></uni-title>
			<view class="bind-relationship">
				<view>
					<image src="../../static/images/head-portrait.png" mode="aspectFit"></image>
					<text class="name">张新文</text>
				</view>
				<text class="bind">已绑定</text>
			</view>
			<view class="bind-relationship">
				<view>
					<image src="../../static/images/head-portrait.png" mode="aspectFit"></image>
					<text class="name">张新文</text>
				</view>
				<text class="bind">已绑定</text>
			</view>
		</uni-row> -->
		
		<uni-row>
			<text class="switch-account" @click="handleGoSwitchAccount">{{$t('my.cutUserName1')}}</text>
		</uni-row>
		<uni-row>
			<button class="logout-btn" :loading="loggingOut" :disabled="loggingOut" @click="handleLogout">{{$t('my.logout')}}</button>
		</uni-row>
	</view>
</template>

<script>
	const storage = require('@/utils/demo/storage.js')
	const session = require('@/utils/demo/session.js')
	import { sendPostRequest } from '@/utils/request.js'
	export default{
		data() {
			return{
				info: storage.getDemo('userInfo', {}) || {},
				loggingOut: false
			}
		},
		onShow() {
			this.info = storage.getDemo('userInfo', {}) || {}
			uni.setNavigationBarTitle({
				title: this.$t('route.userInfo')
			});
		},
		methods: {
			handleGoSwitchAccount() {
				uni.navigateTo({
					url: "/myPage/SwitchAccount/SwitchAccount"
				})
			},
			handleLogout() {
				if (this.loggingOut) return
				this.loggingOut = true
				uni.showLoading({mask: true, title: this.$t('common.loading')})
				sendPostRequest({url: '/api/demo/logout'}).then(() => {
					session.logout()
					uni.reLaunch({
						url: '/myPage/Login/Login'
					})
				}).then(() => {
					this.loggingOut = false
					uni.hideLoading()
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	.user-info{
		::v-deep .uni-row{
			background-color: #fff;
			margin-top: 20rpx;
			padding: 0 40rpx;
			.uni-col{
				line-height: 100rpx;
				height: 100rpx;
				color: #333;
			}
			.uni-col-18{
				text-align: right;
				color: #555;
			}
		}
		.bind-relationship{
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 28rpx 0;
			border-bottom: 1px #EEEEEE solid;
			&:last-child{
				border-bottom: 0;
			}
			image{
				width: 84rpx;
				height: 84rpx;
				margin-right: 24rpx;
			}
			.name{
				line-height: 84rpx;
				font-size: 36rpx;
				color: #333;
				vertical-align: bottom;
			}
			.bind{
				color: #C39C7C;
			}
		}
		
		.switch-account{
			display: inline-block;
			text-align: center;
			line-height: 100rpx;
			width: 100%;
		}
		.logout-btn{
			width: 80%;
			margin: 24rpx auto 40rpx;
			background: #fff;
			color: #C45656;
			border: 1px solid #E8C4C4;
		}
	}
</style>