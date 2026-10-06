<!-- 资产盘点报告 -->
<template>
	<view class="asset">
		<view class="asset-report">
			<view class="asset-report-title flex-between">
				<view class="h2-title">{{$t('home.normalReport')}}</view>
				<view>{{reportObj.createDate}}</view>
			</view>
			<view class="asset-report-survey">
				<view class="h2-title">
					{{$t('home.checkSurvey')}}
				</view>
				<view class="survey-ul">
					<view class="survey-ul-list">
						<view class="survey-ul-list-img">
							<uni-icons type="wallet" color="#FFFFFF" size="30"></uni-icons>
						</view>
						<view class="survey-ul-list-count">
							<view class="count-title">{{$t('home.assetCheckMoney')}}</view>
							<view class="count-center">
								<span class="count-sum">{{reportObj.inventoryAmount}}</span>
								<span class="count-status" :style="{'color': !reportObj.inventoryAmountPromotion ? '#ff4949':'#1CA035'}">
									<uni-icons 
									:type="!reportObj.inventoryAmountPromotion ? 'arrow-up':'arrow-down'"
									:color="!reportObj.inventoryAmountPromotion ? '#ff4949':'#1CA035'"
									 size="14"></uni-icons>
									{{reportObj.inventoryAmountPercent || 0}}
								</span>
								<span>{{$t('home.yearOnYear')}}</span>
							</view>
						</view>
					</view>
					<view class="survey-ul-list">
						<view class="survey-ul-list-img color-tow">
							<uni-icons type="star" color="#FFFFFF" size="30"></uni-icons>
						</view>
						<view class="survey-ul-list-count">
							<view class="count-title">{{$t('home.assetCheckNum')}}</view>
							<view class="count-center">
								<span class="count-sum">{{reportObj.inventoryNum}}</span>
								<span class="count-status" :style="{'color': !reportObj.inventoryNumPromotion ? '#ff4949':'#1CA035'}">
									<uni-icons
									:type="!reportObj.inventoryNumPromotion ? 'arrow-up':'arrow-down'"
									:color="!reportObj.inventoryNumPromotion ? '#ff4949':'#1CA035'"
									 size="14"></uni-icons>
									{{reportObj.inventoryNumPercent || 0}}
								</span>
								<span>{{$t('home.yearOnYear')}}</span>
							</view>
						</view>
					</view>
					<view class="survey-ul-list">
						<view class="survey-ul-list-img color-three">
							<uni-icons type="paperplane" color="#FFFFFF" size="30"></uni-icons>
						</view>
						<view class="survey-ul-list-count">
							<view class="count-title">{{$t('home.assetMoveNum')}}</view>
							<view class="count-center">
								<span class="count-sum">{{reportObj.moveNum}}</span>
								<span class="count-status" :style="{'color': !reportObj.moveNumPromotion ? '#ff4949':'#1CA035'}">
									<uni-icons
									:type="!reportObj.moveNumPromotion ? 'arrow-up':'arrow-down'"
									:color="!reportObj.moveNumPromotion ? '#ff4949':'#1CA035'"
									 size="14"></uni-icons>
									{{reportObj.moveNumPercent || 0}}
								</span>
								<span>{{$t('home.yearOnYear')}}</span>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="asset-report-remove">
				<view class="h2-title">
					{{$t('home.assetMove')}}
				</view>
				<view class="report-remove-ul">
					<view class="report-remove-ul-list" v-for="item in removes" :key="item.id">
						<view class="asset-title">
							<span>{{item.instrumentName}}</span>
							<span>{{$t('home.lable')}}：{{item.labelNo}}</span>
						</view>
						<view class="asset-message">
							<view>
								{{$t('home.deviceNo')}}：{{item.instrumentNo}}
							</view>
							<view>
								{{$t('home.owningDepartemnt')}}：{{item.departmentName}}
							</view>
							<view>
								{{$t('home.inventoryBeforeRoomName')}}：{{item.inventoryBeforeRoomName}}
							</view>
							<view>
								{{$t('home.inventoryAfterRoomName')}}：{{item.inventoryAfterRoomName}}
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="asset-share">
				<view class="flex-between">
					<span>{{$t('home.goPCLook')}}</span>
					<view class="">
						<button class="asset-pyq" open-type="share">
							<uni-icons type="weixin" size="30" color="#07c116"></uni-icons>
						</button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getPropertyNumStatistics,
		postPropertyMovePropertyList
	} from "@/utils/api.js"
	export default {
		data() {
			return {
				reportObj: {},
				removes: [],
				id: ""
			}
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: this.$t('route.assetCountReport')
			});
		},
		onLoad:function(options){
			console.log(options);
			this.id = options.id * 1;
			this.getReport(options.id * 1);
		},
		// 发送朋友
		onShareAppMessage() {
			return {
				title: this.$t('route.assetCountReport'),
				path: "/homePage/AssetCountReport/AssetCountReport?id=" + this.id
			}
		},
		// 发送朋友圈
		onShareTimeline() {
			return {
				title: this.$t('route.assetCountReport'),
				path: "/homePage/AssetCountReport/AssetCountReport?id=" + this.id
			}
		},
		methods: {
			getReport(inventoryId) {
				getPropertyNumStatistics({
					inventoryId 
				}).then(res => {
					if (res.code) {
						this.reportObj = res.items;
					}
				})
				postPropertyMovePropertyList({
					inventoryId,
					pageSize: 10,
					pageNum: 1
				}).then(res => {
					if (res.code) {
						this.removes = res.items.list;
					}
				})
			},

		}
	}
</script>

<style lang="scss" scoped>
	.asset {
		padding-bottom: 40rpx;
	}
	.asset-report {
		width: 80vw;
		margin: 40rpx auto;
		padding: 40rpx;
		background-color: #FFFFFF;
		border-radius: 10rpx;
		
		.asset-report-title {
			color: #666666;
			font-size: 28rpx;
		}
		.asset-report-survey {
			
			.survey-ul {
				margin-top: 40rpx;
				.survey-ul-list {
					display: flex;
					margin-bottom: 40rpx;
					.survey-ul-list-img {
						width: 120rpx;
						height: 120rpx;
						border-radius: 50%;
						background-color: #48A9EE;
						margin-right: 20rpx;
						text-align: center;
						line-height: 120rpx;
					}
					.color-tow {
						background-color: #F4857C;
					}
					.color-three {
						background-color: #FFD86F;
					}
					.survey-ul-list-count {
						color: #666666;
						line-height: 1.5;
						.count-title {
						}
						.count-center {
							font-size: 28rpx;
							.count-sum {
								color: #333333;
								font-size: 48rpx;
								font-weight: bold;
								margin-right: 20rpx;
							}
							.count-status {
								color: #FF4949;
								margin-right: 20rpx;
							}
						}
					}
				}
			}
		}
		.asset-report-remove {
			.report-remove-ul {
				max-height: 600rpx;
				overflow-y: auto;
				margin-top: 40rpx;
				margin-bottom: 4rpx;
				
				.report-remove-ul-list {
					color: #666666;
					.asset-title {
						font-weight: bold;
						color: #333333;
						border: 2rpx solid #999999;
						border-bottom: none;
						border-radius: 10rpx 10rpx 0 0;
						padding: 20rpx 40rpx;
						display: flex;
						justify-content: space-between;
					}
					.asset-message {
						border: 2rpx solid #999999;
						padding: 20rpx 40rpx;
						margin-bottom: -2rpx;
						font-size: 28rpx;
						line-height: 1.5;
					}
				}
			}
		}
		.asset-share {
			margin-top: 40rpx;
			font-size: 28rpx;
			color: #666666;
			.asset-pyq {
				line-height: 1.5;
				padding: 0 !important;
				border: none;
				border-color: #FFFFFF;
				box-sizing: none;
				background-color: #FFFFFF;
			}
			button::after{
			        border: 0;
			    }
		}
	}
</style>