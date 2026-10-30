<template>
	<view class="my">
		<view class="head" @click="handleGoUserInfo">
			<image class="image" :src="avatarUrl"></image>
			<view class="infor">
				<uni-title type="h2" color="#333" :title="info.name"></uni-title>
				<text class="text">{{ info.companyName }}</text>
			</view>
			<uni-icons type="right" size="20" color="#888"></uni-icons>
		</view>
		<view class="box my-responsible">
			<uni-title type="h3" :title="$t('my.myResponsible')"></uni-title>
			<uni-row>
				<uni-col :span="11">
					<view class="demo-uni-col" @click="handleGoMyResponsible(2)">
						<text class="text">{{$t('labDevice.equipment')}}</text>
						<view class="num">
							<uni-title type="h2" :title="String(thingsUser.instrumentCount)"></uni-title>
							<!-- <text class="span"></text> -->
						</view>
					</view>
				</uni-col>
				<uni-col :span="11">
					<view class="demo-uni-col" @click="handleGoMyResponsible(3)">
						<text class="text">{{$t('room.room')}}</text>
						<view class="num">
							<uni-title type="h2" :title="String(thingsUser.roomCount)"></uni-title>
							<!-- <text class="span">间</text> -->
						</view>
					</view>
				</uni-col>
			</uni-row>
		</view>
		<view class="box my-task">
			<uni-title type="h3" :title="$t('my.myTask')"></uni-title>
			<uni-row >
				<uni-col :span="11">
					<view class="demo-uni-col" @click="handleGoBacklog">
						<text class="text">{{$t('my.myTodoList')}}</text>
						<uni-title type="h2" :title="String(thingsUser.waitHandleNum)" color="#5896D3"></uni-title>
					</view>
				</uni-col>
				<uni-col :span="11">
					<view class="demo-uni-col" @click="handleGoMyAppointment">
						<text class="text">{{$t('my.myOrder')}}</text>
						<uni-title type="h2" :title="String(thingsUser.reservationStatistics.noStartNum)" color="#42C2A9"></uni-title>
					</view>
				</uni-col>
			</uni-row>
		</view>
		<view class="box alarm-statistics">
			<uni-title type="h3" :title="$t('my.alarmStat')"></uni-title>
			<uni-row>
				<uni-col :span="12" v-for="item in thingsUser.statList" :key="item.thingsType">
					<view @click="handleGoMyMission(item.thingsType)">
						<text class="title">{{ item.thingsType === 4 ? $t('my.equipmentAlarm') : $t('my.roomAlarm') }}</text>
						<view class="num">
							<uni-title type="h2" :title="String(item.total)"></uni-title>
							<!-- <text class="unit">次</text> -->
						</view>
						<view class="handle-num">
							<view class="handle-num-box normal">
								<text class="text">{{$t('my.disposed')}}</text>
								<text class="text">{{ item.processedCount }}</text>
							</view>
							<view class="handle-num-box abnormal">
								<text class="text">{{$t('my.notDispose')}}</text>
								<text class="text">{{ item.noProcessedCount }}</text>
							</view>
						</view>
					</view>
				</uni-col>
			</uni-row>
		</view>
		<tab-bar :selectedIndex='tabBarIndex'></tab-bar>
	</view>
</template>

<script>
	import { getHistoryThingsAlarmAllApp, getThingsUserAllStatApp } from '@/utils/api.js';
	const storage = require('@/utils/demo/storage.js')
	export default{
		data() {
			return{
				info: storage.getDemo('userInfo', {}) || {},
				taskList: [],
				thingsUser: {
					instrumentCount: 0,
					roomCount: 0,
					waitHandleNum: 0,
					reservationStatistics: {noStartNum: 0},
					statList: []
				},
				avatarUrl: require("../../../static/images/head-portrait.png"),
				tabBarIndex: ""
			}
		},
		onShow() {
			let curRoute = 'pages/tabBar/My/My';
			this.tabBarIndex = curRoute;
			uni.setNavigationBarTitle({
				title: this.$t('tabBar.user')
			});
			this.info = storage.getDemo('userInfo', {}) || {}
			this.thingsUserAllStat();
		},
		onReady() {
			this.thingsUserAllStat();
			this.info = storage.getDemo('userInfo', {}) || {}
			if(storage.getDemo('avatarUrl')){
				this.avatarUrl = storage.getDemo('avatarUrl')
			}
		},
		onPullDownRefresh() {
			this.thingsUserAllStat()
		},
		methods: {
			thingsUserAllStat(){
				// uni.showLoading({
				// 	title: '加载中',
				// 	mask: true
				// });
				getThingsUserAllStatApp().then(res => {
					if(res.code === 1 && res.items){
						this.thingsUser = res.items;
					}
					uni.hideLoading();
					uni.stopPullDownRefresh()
				}).catch(() => {
					uni.hideLoading();
					uni.stopPullDownRefresh()
				})
			},
			// 跳转个人信息
			handleGoUserInfo() {
				uni.navigateTo({
					url: "/myPage/UserInfo/UserInfo"
				})
			},
			// 跳转我负责的
			handleGoMyResponsible(type) {
				uni.navigateTo({
					url: "/myPage/MyResponsible/MyResponsible?type=" + type
				})
			},
			// 跳转待办
			handleGoBacklog() {
				uni.navigateTo({
					url: "/homePage/Backlog/Backlog"
				})
			},
			// 跳转预约
			handleGoMyAppointment() {
				uni.navigateTo({
					url: '/myPage/MyAppointment/MyAppointment'
				})
			},
			// 跳转报警
			handleGoMyMission(type) {
				uni.navigateTo({
					url: '/myPage/MyMission/MyMission?type=' + type
				})
			}
		},
		onHide(){
			clearInterval(this.set);
			this.set = null
		}
	}
</script>

<style scoped lang="scss">
	@import "./My.scss";
</style>
