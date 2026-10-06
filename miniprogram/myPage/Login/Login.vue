<template>
	<view class="login">
		<view class="logo">
			<uni-icons type="home" size="80" color="#303F9F"></uni-icons>
		</view>
		<uni-title type="h2" title="智慧设施助手"></uni-title>
		<text class="text">{{$t('my.demoLoginHint')}}</text>
		<view class="form">
			<input class="input" type="text" :placeholder="$t('my.userName')" v-model="username" maxlength="32" />
			<input class="input" type="password" password :placeholder="$t('my.password')" v-model="password" maxlength="32" />
		</view>
		<button class="button" type="default" :loading="submitting" :disabled="submitting" @click="handleLogin">{{$t('my.demoLogin')}}</button>
		<Toast ref="toast"></Toast>
	</view>
</template>

<script>
	import Toast from "@/components/Toast/index.vue";
	import { sendPostRequest } from '@/utils/request.js'
	const storage = require('@/utils/demo/storage.js')
	export default{
		components: {
			Toast
		},
		data() {
			return{
				username: 'demo',
				password: '',
				submitting: false
			}
		},
		onLoad() {
			// #ifdef MP-WEIXIN
			uni.hideHomeButton();
			// #endif
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: this.$t('route.login')
			});
		},
		methods: {
			handleLogin() {
				if (this.submitting) return
				var username = String(this.username || '').trim()
				var password = String(this.password || '')
				if (!username || !password) {
					this.$refs.toast.open(this.$t('my.demoLoginRequired'), 'error')
					return
				}
				this.submitting = true
				uni.showLoading({
					mask: true,
					title: this.$t('common.loading')
				})
				sendPostRequest({
					url: '/api/demo/login',
					data: {username: username, password: password}
				}).then((res) => {
					if (res && res.code === 1 && res.items && res.items.token) {
						storage.setDemo('token', res.items.token)
						storage.setDemo('userInfo', res.items.user)
						storage.setDemo('username', res.items.user && res.items.user.name)
						uni.reLaunch({
							url: '/pages/tabBar/Home/Home'
						})
						return
					}
					this.$refs.toast.open((res && res.message) || this.$t('my.demoLoginFail'), 'error')
				}).catch(() => {
					this.$refs.toast.open(this.$t('my.demoLoginFail'), 'error')
				}).then(() => {
					this.submitting = false
					uni.hideLoading()
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	@import './Login.scss';
</style>
