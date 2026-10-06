<template>
	<view class="asset-inform-list list-default" @click="handleItem(item)">
		<view class="head" :class="item.read ? 'list-read' : 'list-top'">
			<text class="text">{{ item.title }}</text>
			<view class="flex-check">
				<span v-if="isShow == 3" :style="{'color': item.checkType ? '#999999' : '#ff4949'}">{{ item.checkType ? $t('home.checkType') : $t('home.checkType1') }}</span>
				<uni-icons type="right" color="#888888" size="24"></uni-icons>
			</view>
		</view>
		<view class="list-date" v-if="item['sendDate']">
			{{ item.sendDate ? formatTime(item.sendDate) : null }}
		</view>
		<view class="list-date" v-else>
			<view class="">
				{{ item.content }}
			</view>
			<view class="">
				{{ item.createDate | forDateTime}}
			</view>
		</view>
	</view>
</template>

<script>
	import {forDateTime} from "@/utils/methods.js";
	export default {
		name: "AssetInformList",
		props: {
			item: {
				type: Object,
				default: () => {}
			},
			isShow: {
				type: [String, Number],
				default: 0
			}
		},
		data() {
			return {

			};
		},
		methods: {
			handleItem(item) {
				this.$emit("handle", item);
			},
			formatTime(value) {
				//获取年份
				return forDateTime(value);
			}
		}
	}
</script>

<style lang="scss" scoped>
	.asset-inform-list {
		.head{
			.text{
				font-size: 28rpx;
				line-height: 30rpx;
			}
			.flex-check {
				display: flex;
				align-items: center;
			}
		}
		.list-top {
			font-size: 32rpx;
			font-weight: bold;
			color: #333333;
			display: flex;
			justify-content: space-between;
			align-items: center;
			line-height: 1.5;
		}

		.list-date {
			font-size: 24rpx;
			font-weight: 500;
			color: #777777;
			line-height: 26rpx;
			margin-top: 32rpx;
		}
		.list-read {
			color: #666666;
			font-size: 32rpx;
			font-weight: 500;
			line-height: 1.5;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
	}
</style>
