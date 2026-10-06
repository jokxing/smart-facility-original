<template>
	<uni-popup
		ref="popup"
		type="bottom" 
		background-color="#fff"
		class="popup asset-management">
		<view class="title">
			<uni-title type="h3" :title="$t('labDevice.flowApply')"></uni-title>
			<uni-icons type="closeempty" size="14" color="#888888" @click="$refs.popup.close()"></uni-icons>
		</view>
		<view class="process box">
			<view class="content">
				<view class="item" v-for="(item, index) in processApply" :key="index" v-if="index < 5" @click="hanldeApply">
					<view class="img">
						<uni-icons custom-prefix="iconfont" :type="item.icon" size="14" color="#D6AE7B"></uni-icons>
					</view>
					<text class="text">{{ item.label }}</text>
				</view>
			</view>
			<view class="content">
				<view class="item" v-for="(item, index) in processApply" :key="index" v-if="index >= 5" @click="hanldeApply">
					<view class="img">
						<uni-icons custom-prefix="iconfont" :type="item.icon" size="14" color="#D6AE7B"></uni-icons>
					</view>
					<text class="text">{{ item.label }}</text>
				</view>
			</view>
		</view>
	</uni-popup>
</template>

<script>
	export default{
		data() {
			const _this = this;
			return{
				processApply:[
					{
						label:_this.$t('labDevice.receive'),
						icon: "icon-lingyong"
					},
					{
						label: _this.$t('labDevice.return1'),
						icon: "icon-shiyong"
					},
					{
						label: _this.$t('labDevice.borrow'),
						icon: "icon-jieyong"
					},
					{
						label: _this.$t('labDevice.return'),
						icon: "icon-tuihuan"
					},
					{
						label: _this.$t('labDevice.fix'),
						icon: "icon-baoxiu"
					},
					{
						label: _this.$t('labDevice.fix1'),
						icon: "icon-baoxiu"
					},
					{
						label: _this.$t('labDevice.assetChange'),
						icon: "icon-zichanbiangeng"
					},
					{
						label: _this.$t('labDevice.dispose'),
						icon: "icon-chuzhi"
					},
					{
						label: _this.$t('labDevice.deviceFiles'),
						icon: "icon-shebeiwenjianshoukong"
					},
					{
						label: _this.$t('labDevice.orderApply'),
						icon: "icon-shenqingcaigou"
					}
				]
			}
		},
		methods:{
			hanldeApply() {
				this.$emit('handle')
			},
			showPopup(index) {
				this.$refs.popup.open('bottom')
			}
		}
	}
</script>

<style scoped lang="scss">
	.asset-management{
		.box{
			padding: 0 40rpx 40rpx;
		}
		.process{
			.content{
				padding-bottom: 28rpx;
				margin-bottom: 28rpx;
				border-bottom: 1px #F3E3CC solid;
				display: flex;
				.item{
					width: 20%;
					display: flex;
					flex-direction: column;
					align-items: center;
					.img{
						width: 64rpx;
						height: 64rpx;
						border-radius: 50%;
						background-color: #FEF2E2;
						text-align: center;
						line-height: 64rpx;
						margin-bottom: 10rpx;
					}
					.text{
						color: #555;
						font-size: 28rpx;
						text-align: center;
					}
				}
				
				&:last-child{
					border-bottom: 0;
					.item{
						width: 26%;
					}
				}
			}
		}
		.maintenance{
			padding-bottom: 80rpx;
			.content{
				display: flex;
				justify-content: space-between;
				.item{
					width: 212rpx;
					height: 80rpx;
					border: 1px solid $golden;
					border-radius: 10rpx;
					text-align: center;
					line-height: 80rpx;
					.text{
						color: #555;
						font-size: 28rpx;
						margin-left: 20rpx;
					}
				}
			}
		}
	}
</style>