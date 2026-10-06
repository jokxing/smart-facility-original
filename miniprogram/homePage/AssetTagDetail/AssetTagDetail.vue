<template>
	<view class="asset-tag-detail">
		<view class="info">
			<uni-row class="demo-uni-row">
				<uni-col :span="7">{{$t('labDevice.lableNo')}}</uni-col>
				<uni-col :span="16" :offset="1">{{ detail.labelNo }}</uni-col>
			</uni-row>
			<uni-row class="demo-uni-row">
				<uni-col :span="7">{{$t('other.linkGateway')}}</uni-col>
				<uni-col :span="16" :offset="1">{{ detail.propertyGateName }}</uni-col>
			</uni-row>
			<uni-row class="demo-uni-row">
				<uni-col :span="7">{{$t('other.newStatus')}}</uni-col>
				<uni-col :span="16" :offset="1">
					{{ statusText(detail.status, ASSETTAGSTATUS) }}
				</uni-col>
			</uni-row>
			<uni-row class="demo-uni-row">
				<uni-col :span="7">{{$t('other.lastReportTime')}}</uni-col>
				<uni-col :span="16" :offset="1">{{ detail.reportDate }}</uni-col>
			</uni-row>
			<uni-row class="demo-uni-row">
				<uni-col :span="7">{{$t('labDevice.lableKwh')}}</uni-col>
				<uni-col :span="16" :offset="1">{{ detail.labellectric || '' }}</uni-col>
			</uni-row>
			<uni-row class="demo-uni-row">
				<uni-col :span="7">{{$t('other.bindDevice')}}</uni-col>
				<uni-col :span="16" :offset="1">{{ detail.instrumentName || '' }}</uni-col>
			</uni-row>
		</view>
		
		<view class="fotter">
			<button class="button button-golden" @click="goAssetTagBind">{{$t('other.changeDevice')}}</button>
			<button class="button button-cancel-golden" @click="scanCodeBinding">{{$t('other.qrCodeBind')}}</button>
		</view>
		
		<!-- 已绑定 -->
		<uni-popup class="bound-popup" ref="boundPopup" background-color="#fff" :mask-click="false">
			<view class="content">
				{{$t('other.qrCodeBindMessage1')}} <text class="text">【xx冰箱上】54210212423</text>，{{$t('other.qrCodeBindMessage2')}}
			</view>
			<button class="button button-golden" @click="$refs.boundPopup.close()">{{$t('other.iDo')}}</button>
		</uni-popup>
		
		<!-- 绑定 -->
		<uni-popup class="popup-message" ref="bindPopup" background-color="#fff" :mask-click="false">
			<view class="content" v-if="!isError">
				<uni-icons type="checkbox-filled" size="60" color="#09BB07"></uni-icons>
				<text class="text">{{$t('other.bindSuccess')}}</text>
			</view>
			<view class="content" v-else>
				<uni-icons type="info-filled" size="60" color="#F76260"></uni-icons>
				<text class="text">{{ errorText }}</text>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import { getLabelDetail, getQrCodeBingding } from "@/utils/api.js";
	import { ASSETTAGSTATUS } from "@/utils/constant.js";
	import { statusText } from "@/utils/methods.js";
	export default{
		data() {
			return{
				ASSETTAGSTATUS,
				statusText,
				isError: true,
				errorText: "",
				id: "",
				detail: ""
			}
		},
		onLoad(options) {
			this.id = parseInt(options.id);
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: this.$t('route.assetTagBind')
			});
		},
		onReady() {
			this.getDetail()
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
				getLabelDetail({labelId: this.id}).then(res => {
					if(res.code === 1){
						this.detail = res.items
					}
					uni.hideLoading()
					uni.stopPullDownRefresh()
				})
			},
			goAssetTagBind() {
				uni.navigateTo({
					url: "/homePage/AssetTagDetail/common/AssetTagBind?labelId=" + this.id
				})
			},
			scanCodeBinding() {
				var _this = this;
				wx.scanCode({
					onlyFromCamera: true,
					success(res) {
						console.log(res)
						var data = {
							codeId: res.result,
							labelId: _this.id
						}
						getQrCodeBingding(data).then(res => {
							if(res.code){
								if(res.code === 1){
									_this.isError = false;
									_this.$refs.bindPopup.open("center")
									setTimeout(() => {
										_this.$refs.bindPopup.close();
										uni.navigateTo({
											url: res.url
										})
									},2000)
								}else{
									_this.isError = true;
									_this.errorText = res.message;
									_this.$refs.bindPopup.open("center");
									setTimeout(() => {
										_this.$refs.bindPopup.close();
										_this.errorText = "";
									},3000)
								}
							}else{
								_this.isError = true;
								_this.errorText = res.message;
								_this.$refs.bindPopup.open("center");
								setTimeout(() => {
									_this.$refs.bindPopup.close();
									_this.errorText = "";
								},3000)
							}
						})
					}
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	.asset-tag-detail{
		margin: 40rpx 24rpx;
		.info{
			background-color: #fff;
			border-radius: 10rpx;
			padding: 40rpx 40rpx 10rpx;
			font-size: 28rpx;
			color: #333;
			::v-deep .uni-row{
				margin-bottom: 30rpx;
				.uni-col{
					&:first-child{
						text-align: right;
						color: #666;
					}
				}
			}
		}
		
		.fotter{
			width: 400rpx;
			position: absolute;
			bottom: 10%;
			left: 50%;
			transform: translateX(-50%);
			.button{
				height: 80rpx;
				line-height: 80rpx;
				margin-bottom: 40rpx;
				font-size: 32rpx;
			}
		}
		
		::v-deep .uni-popup .uni-popup__wrapper{
			border-radius: 20rpx;
		}
		
		.bound-popup{
			::v-deep .uni-popup .uni-popup__wrapper{
				width: calc(80% - 120rpx);
				padding: 60rpx;
			}
			.content{
				text-align: center;
				color: #333;
				line-height: 50rpx;
				.text{
					color: $golden;
				}
			}
			.button{
				margin-top: 80rpx;
				height: 80rpx;
				line-height: 80rpx;
			}
		}
	}
</style>