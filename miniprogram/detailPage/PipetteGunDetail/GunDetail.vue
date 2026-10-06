<template>
	<view class="pipetteGun-detail homeSubpage-detail" style="padding: 0;">
		<view class="information latestStatus" style="padding: 32rpx 22rpx;">
			<uni-row>
				<uni-col :span="8">
					<view class="status" :class="handleStatusClass(detail.homingStatus).class">
						<view class="status-big">
							<view class="status-mid">
								<view class="status-samll">
									<text class="text">{{ handleStatus(detail.homingStatus) || "" }}</text>
								</view>
							</view>
						</view>
						<text class="status-bottom-test" v-if="detail.homingStatus === 2" :class="handleStatusClass(detail.homingStatus).class">
							{{$t('labDevice.outTime')}}{{ detail.hour }}h
						</text>
					</view>
				</uni-col>
				<uni-col :span="16">
					<view class="detail">
						<view class="text">
							{{$t('labDevice.name')}}：
							<text class="span">{{ detail.name }}</text>
						</view>
						<view class="text no">
							{{$t('labDevice.no')}}：
							<text class="span">{{ detail.no || $t('labDevice.notData') }}</text>
						</view>
						<view class="text no">
							<text style="width: 168rpx;">{{$t('labDevice.owningAddrss')}}：</text>
							<text 
								class="span" 
								:class="detail.homingStatus !== 0 ? handleStatusClass(detail.homingStatus).class : ''">
								{{ detail.preciseLocation || $t('labDevice.notData') }}
							</text>
						</view>
					</view>
				</uni-col>
			</uni-row>
			<uni-row>
				<view class="list">
					<uni-col :span="7">{{$t('labDevice.addrss')}}：</uni-col>
					<uni-col :span="17">{{ detail.position || $t('labDevice.notData') }}</uni-col>
				</view>
				<view class="list">
					<uni-col :span="7">{{$t('common.owningDepartment')}}：</uni-col>
					<uni-col :span="17">{{ detail.departmentName ||$t('labDevice.notData') }}</uni-col>
				</view>
				<view class="list">
					<uni-col :span="7">{{$t('labDevice.lastUser')}}：</uni-col>
					<uni-col :span="17">{{ detail.endUser ||$t('labDevice.notData') }}</uni-col>
				</view>
				<view class="list">
					<uni-col :span="7">{{$t('labDevice.owningCompany')}}：</uni-col>
					<uni-col :span="17">{{ detail.companyName || $t('labDevice.notData') }}</uni-col>
				</view>
				<view class="list">
					<uni-col :span="7">{{$t('labDevice.lastGetTime')}}：</uni-col>
					<uni-col :span="17">{{ $options.filters['forDateTime'](detail.takeOutTime) || $t('labDevice.notData') }}</uni-col>
				</view>
				<view class="list">
					<uni-col :span="7">{{$t('labDevice.lastReturnTime')}}：</uni-col>
					<uni-col :span="17">{{ $options.filters['forDateTime'](detail.homingTime) || $t('labDevice.notData') }}</uni-col>
				</view>
				<view class="list">
					<uni-col :span="24">{{$t('labDevice.principal')}}：</uni-col>
					<uni-col :span="24" v-if="detail.headUser">
						<text class="text" v-for="(item,index) in detail.headUser.split('、')" :key="index">{{ item }}</text>
					</uni-col>
				</view>
			</uni-row>
		</view>
		
		<AlarmSettings v-if="detail.head" :detail="detail" :thingsId="thingsId" :thingsType="13"></AlarmSettings>
		<view class="gun-actions" v-if="detail.pipetteGunId">
			<button
				class="button"
				type="primary"
				plain="true"
				v-if="detail.homingStatus !== 1"
				@click="handleReturn">
				{{$t('labDevice.returnGun')}}
			</button>
			<button
				class="button"
				type="primary"
				plain="true"
				v-if="detail.gunRackId"
				@click="goRack">
				{{$t('route.pipetteGunRackDetail')}}
			</button>
		</view>
		<Toast ref="toast"></Toast>
	</view>
</template>

<script>
	import AlarmSettings from "../components/AlarmSettings/index.vue";
	import Toast from '@/components/Toast/index.vue';
	import { getGunPipetteDetail, postGunReturnPipette } from "@/utils/api.js";
	import { GUNSTATUS } from '@/utils/constant.js'
	import { statusText, statusColor } from '@/utils/methods.js';
	export default{
		components: {
			AlarmSettings,
			Toast
		},
		props: ['thingsId'],
		data() {
			return{
				detail: {}
			}
		},
		mounted() {
			this.bootstrap();
		},
		onReady() {
			this.bootstrap();
		},
		methods: {
			bootstrap() {
				if (this._booted) return;
				this._booted = true;
				this.handleDetail();
			},
			handleDetail() {
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				getGunPipetteDetail({gunId: this.thingsId}).then(res => {
					if(res.code === 1){
						this.detail = res.items;
						this.detail['equipmentType'] = "GUN";
						uni.setNavigationBarTitle({
							title: res.items.name
						});
					}
					uni.hideLoading();
					uni.stopPullDownRefresh()
				})
			},
			handleStatus(status){
				return statusText(status, GUNSTATUS)
			},
			handleStatusClass(status) {
				return statusColor(status, GUNSTATUS)
			},
			handleReturn() {
				var _this = this;
				uni.showModal({
					title: this.$t('other.hint'),
					content: '确认模拟归还？演示不连接真实枪架。',
					success: function (res) {
						if (!res.confirm) return;
						uni.showLoading({mask: true});
						postGunReturnPipette({gunId: _this.thingsId}).then(function (resp) {
							uni.hideLoading();
							if (resp.code === 1) {
								_this.handleDetail();
								if (_this.$refs.toast) _this.$refs.toast.open(resp.message || '模拟归还成功', 'success');
							} else if (_this.$refs.toast) {
								_this.$refs.toast.open(resp.message, 'error');
							}
						})
					}
				})
			},
			goRack() {
				uni.navigateTo({
					url: '/detailPage/PipetteGunRackDetail/PipetteGunRackDetail?id=' + this.detail.gunRackId
				})
			}
		},
		options: {
		   styleIsolation: 'shared'
		},
	}
</script>

<style scoped lang="scss">
	@import '@/style/css/status.scss'; 
	@import '@/style/css/homeSubpageDetail.scss';
	.pipetteGun-detail{
		.gun-actions{
			padding: 0 22rpx 40rpx;
			.button{
				margin-bottom: 16rpx;
			}
		}
		.list{
			width: 100%;
			display: inline-block;
			padding: 40rpx 0;
			border-bottom: 1px #F2F2F2 solid;
			font-size: 28rpx;
			color: #555;
			&:last-child{
				border-bottom: 0;
			}
			.text{
				width: 140rpx;
				height: 60rpx;
				border-radius: 8rpx;
				background-color: $bgGolden;
				margin-right: 20rpx;
				display: block;
				margin-top: 20rpx;
				float: left;
				text-align: center;
				line-height: 60rpx;
			}
		}
		::v-deep .homeSubpage-detail{
			padding-bottom: 60rpx!important;
		}
	}
</style>