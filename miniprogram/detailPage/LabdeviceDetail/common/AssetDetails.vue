<template>
	<view class="asset-details">
		<view class="title">{{$t('labDevice.basicInformation')}}</view>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.name')}}</uni-col>
			<uni-col :span="18">{{ detail.instrumentName || $t('labDevice.notData') }}</uni-col>
		</uni-row>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.no')}}</uni-col>
			<uni-col :span="18">{{ detail.instrumentNo || $t('labDevice.notData') }}</uni-col>
		</uni-row>
		<uni-row>
			<!-- <uni-col :span="6">{{$t('labDevice.serialNumber')}}</uni-col>
			<uni-col :span="18">11</uni-col> -->
			<uni-col :span="6">{{$t('labDevice.classify')}}</uni-col>
			<uni-col :span="18">{{ statusText(detail.types, INSTRUMENTTYPE)  || $t('labDevice.notData') }}</uni-col>
		</uni-row>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.brandName')}}</uni-col>
			<uni-col :span="18">{{ detail.brandName || $t('labDevice.notData') }}</uni-col>
		</uni-row>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.instrumentModel')}}</uni-col>
			<uni-col :span="18">{{ detail.instrumentModel || $t('labDevice.notData') }}</uni-col>
		</uni-row>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.img')}}</uni-col>
			<uni-col :span="18">
				<text v-if="!detail.logoUrl">{{$t('labDevice.notData')}}</text>
				<image v-else :src="BASE_URL + detail.logoUrl" mode="aspectFit" style="width: 220rpx; height: 220rpx">
				</image>
			</uni-col>
		</uni-row>
		<hr/>
		<view class="hr"></view>
		<view class="title">{{$t('labDevice.installDepartment')}}</view>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.owningRoom')}}</uni-col>
			<uni-col :span="18">{{ detail.roomName || $t('labDevice.notData') }}</uni-col>
		</uni-row>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.installDep')}}</uni-col>
			<uni-col :span="18">{{ detail.departmentName || $t('labDevice.notData') }}</uni-col>
		</uni-row>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.responsibleUser')}}</uni-col>
			<uni-col :span="18">{{ detail.useName || $t('labDevice.notData') }}</uni-col>
		</uni-row>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.installedTime')}}</uni-col>
			<uni-col :span="18">{{ detail.installedTime || $t('labDevice.notData') }}</uni-col>
		</uni-row>
		<view class="hr"></view>
		<view class="title">{{$t('labDevice.userMessage')}}</view>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.departmentName')}}</uni-col>
			<uni-col :span="18">{{ detail.roomName || $t('labDevice.notData') }}</uni-col>
		</uni-row>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.useDeptName')}}</uni-col>
			<uni-col :span="18">{{ detail.useDeptName || $t('labDevice.notData') }}</uni-col>
		</uni-row>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.measured')}}</uni-col>
			<uni-col :span="18">{{ detail.measured ? (detail.measured === 1 ? $t('other.yes') : $t('other.no')) : $t('labDevice.notData') }}
			</uni-col>
		</uni-row>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.checkDate')}}</uni-col>
			<uni-col :span="18">{{ detail.useDeptName || $t('labDevice.notData') }}</uni-col>
		</uni-row>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.verified')}}</uni-col>
			<uni-col :span="18">{{ detail.verified ? (detail.verified === 1 ? $t('other.need') : $t('other.noNeed')) : $t('labDevice.notData') }}
			</uni-col>
		</uni-row>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.sOPSituation')}}</uni-col>
			<uni-col :span="18">
				{{ detail.sOPSituation ? (detail.sOPSituation === 1 ? $t('other.need') : $t('other.noNeed')) : $t('labDevice.notData') }}
			</uni-col>
		</uni-row>
		<view class="hr"></view>
		<view class="title">{{$t('labDevice.assetMessage')}}</view>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.purchaseDate')}}</uni-col>
			<uni-col :span="18">{{ detail.purchaseDate || $t('labDevice.notData') }}</uni-col>
		</uni-row>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.contractNumber')}}</uni-col>
			<uni-col :span="18">{{ detail.contractNumber || $t('labDevice.notData') }}</uni-col>
		</uni-row>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.amountIncludeTax')}}</uni-col>
			<uni-col :span="18">{{ detail.amountIncludeTax || $t('labDevice.notData') }}</uni-col>
		</uni-row>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.assetNo')}}</uni-col>
			<uni-col :span="18">{{ detail.assetNumber || $t('labDevice.notData') }}</uni-col>
		</uni-row>
		<view class="hr"></view>
		<view class="title">{{$t('labDevice.electricParameter')}}</view>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.voltage')}}</uni-col>
			<uni-col :span="18">{{ detail.voltage || $t('labDevice.notData') }}</uni-col>
		</uni-row>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.ratedPower')}}</uni-col>
			<uni-col :span="18">{{ detail.ratedPower || $t('labDevice.notData') }}</uni-col>
		</uni-row>
		<view class="hr"></view>
		<view class="title">{{$t('labDevice.vender')}}</view>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.contactUserName')}}</uni-col>
			<uni-col :span="18">{{ detail.contactUserName || $t('labDevice.notData') }}</uni-col>
		</uni-row>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.contactUserTel')}}</uni-col>
			<uni-col :span="18">{{ detail.contactUserTel || $t('labDevice.notData') }}</uni-col>
		</uni-row>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.manufacturer')}}</uni-col>
			<uni-col :span="18">{{$t('labDevice.notData')}}</uni-col>
		</uni-row>
		<uni-row>
			<uni-col :span="6">{{$t('labDevice.supplier')}}</uni-col>
			<uni-col :span="18">{{$t('labDevice.notData')}}</uni-col>
		</uni-row>
		<view class="hr"></view>
		<view class="title">{{$t('labDevice.otherMessage')}}</view>
		<uni-row>
			<uni-col :span="7">{{$t('labDevice.labelNo')}}</uni-col>
			<uni-col :span="17">{{$t('labDevice.notData')}}</uni-col>
		</uni-row>
		<uni-row>
			<uni-col :span="7">{{$t('labDevice.lableKwh')}}</uni-col>
			<uni-col :span="17">{{$t('labDevice.notData')}}</uni-col>
		</uni-row>
	</view>
</template>

<script>
	import {
		getInstrumentNewInfoExpandDetail
	} from "@/utils/api.js";
	import {
		INSTRUMENTTYPE,
		BASE_URL
	} from "@/utils/constant.js";
	import {
		statusText
	} from "@/utils/methods.js";
	export default {
		data() {
			return {
				statusText,
				INSTRUMENTTYPE,
				BASE_URL,
				id: null,
				detail: {}
			}
		},
		onLoad(options) {
			this.id = options.id;
			this.getDetail()
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: this.$t('route.assetDetails')
			});
		},
		onPullDownRefresh() {
			this.getDetail()
		},
		methods: {
			getDetail() {
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				getInstrumentNewInfoExpandDetail({
					instrumentId: this.id
				}).then(res => {
					uni.hideLoading();
					uni.stopPullDownRefresh()
					if (res.code === 1) {
						this.detail = res.items || {}
					} else {
						uni.showToast({title: (res && res.message) || this.$t('labDevice.notData'), icon: 'none'})
					}
				}).catch(() => {
					uni.hideLoading();
					uni.stopPullDownRefresh()
				})
			}
		}
	}
</script>

<style>
	page {
		background-color: #FFFFFF;
	}
</style>
<style scoped lang="scss">
	.asset-details {
		padding: 0 24rpx;
		margin-top: 20rpx;

		.title {
			font-size: 36rpx;
			padding-left: 22rpx;
			font-weight: 600;
			position: relative;
			margin-top: 40rpx;
			margin-bottom: 40rpx;
			&::before {
				content: '';
				width: 8rpx;
				height: 34rpx;
				position: absolute;
				top: 50%;
				left: 0;
				transform: translateY(-50%);
				background-color: #C39C7C;
				border-radius: 4rpx;
			}
		}
		
		.hr {
			border-bottom: 1px #F7F3EF solid;
		}

		::v-deep .uni-row {
			// border-bottom: 1px #F7F3EF solid;
			align-items: center;
			
			&:last-child {
				border-bottom: 0;
				padding-bottom: 60rpx;
			}

			.uni-col {
				margin-bottom: 40rpx;
				color: #888;
				text-align: right;

				&:nth-child(2n+2) {
					text-align: left;
					color: #555;
					padding-left: 40rpx !important;
				}
			}
		}
	}
</style>
