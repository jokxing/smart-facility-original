<template>
	<view class="tab">
		<view class="tab-item" 
			v-for="(item, index) in list" 
			:style="{'color': color}"
			:class="{'is-active': isActive == item.lable}" 
			:key="index" @click="handleItem(item.lable)">
			<!-- {{ item.prop ? item.text + "("+ statisticalVO[item.prop] +")" : item.text }} -->
			{{ item.text }}
			<view class="ring" v-if="statisticalVO[item.prop] > 0"></view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "Tab",
		props: {
			list: {
				type: Array,
				default: () => []
			},
			isActive: {
				type: Number,
				default: null
			},
			color: {
				type: String,
				default: ""
			},
			statisticalVO: {
				type: Object,
				default: () => ({})
			}
		},
		data() {
			return {

			};
		},
		methods: {
			handleItem(value) {
				console.log(value);
				this.$emit("change", value);
			}
		}
	}
</script>

<style lang="scss">
	.tab {
		height: 80rpx;
		line-height: 80rpx;
		font-size: 28rpx;
		color: #555555;
		padding: 0 40rpx;
		background: #FFFFFF;
		display: flex;
		justify-content: space-around;
		flex-wrap: nowrap;
		z-index: 2000;
		overflow-x: auto;
		
		.tab-item {
			white-space: nowrap;
			padding: 0 10rpx;
			position: relative;
			.ring {
				position: absolute;
				top: 20rpx;
				right: -6rpx;
				width: 12rpx;
				height: 12rpx;
				background-color: #FF4949;
				border-radius: 50%;
			}
		}
		
		.is-active {
			height: 30rpx;
			color: #B2704E;
			border-bottom: 6rpx;
			border-radius: 4rpx;
			position: relative;
		}
		.is-active::after {
			position: absolute;
			content: "";
			top: 65rpx;
			left: 0;
			width: 100%;
			height: 8rpx;
			background-color: #B2704E;
			border-radius: 8rpx;
		}
	}
</style>
