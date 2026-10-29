<template>
	<view class="prohibition">
		<view class="demo" :style="[{background},{color},{height},{paddingTop}]">
			<!-- 左侧返回按钮 -->
			<view class="left" @click="onBack" v-if="back" :style="[{color},{paddingTop}]">
				<uni-icons type="arrowleft" size="30" :color='color'></uni-icons>
				<!-- 此处图标使用的是 uni-ui图标 -->
			</view>
			<!-- 中间标题文字 -->
			<view class="title" :class="{ 'title-left': isTitleList }">
				{{title}}
			</view>
			
			<slot></slot>
		</view>
	</view>
</template>
 
<script>
	export default {
		data() {
			return {
				height: 0, 
				paddingTop: 0,
				
			}
		},
		// props: ["title", "back"],
		props:{
			title:{ // 标题文字(默认为空)
				type:String,
				default:''
			},
			color:{ // 标题和返回按钮颜色(默认白色)
				type:String,
				default:'#fff'
			},
            //建议使用background  因为使用backgroundColor，会导致不识别渐变颜色
			background:{ // 背景颜色(不传值默认透明)
				type:String,
				default:'transparent'
			},
			back:{ // 是否显示返回按钮(不传值默认不显示)
				type:Boolean,
				default:false
			},
			isHeight: {
				type: String,
				default: null
			},
			isTitleList: {
				type: Boolean,
				default: false
			}
		},
		
		created() {
			var demo = {top: uni.getSystemInfoSync().statusBarHeight || 0, height: 44}
			// #ifdef MP-WEIXIN
			try {
				if (typeof uni.getMenuButtonBoundingClientRect === 'function') {
					var rect = uni.getMenuButtonBoundingClientRect()
					if (rect && rect.height) demo = rect
				}
			} catch (e) {}
			// #endif
			if(this.isHeight){
				this.height = "calc(" + this.isHeight + " - " + demo.top + "px)"
			}else{
				this.height = demo.height + "px"
			}
			this.paddingTop = demo.top + "px"
		},
		methods: {
			// 左侧返回按钮调用
			onBack() {
				this.$emit("onBack")
			}
		}
	}
</script>
<style scoped lang="scss">
	.demo {
		position: relative;//注意，建议使用相对定位，因为固定定位会脱离文档流，然后你还要去设置marginTop值
		width: 100%;
		font-size: 26rpx;
		padding-bottom: 10rpx;
 
		.left {
			float: left;
			position: absolute;
			width: 100rpx;
			height: 50rpx;
			top: 0;
			bottom: 0;
			left: 20rpx;
			color: #fff;
			margin: auto;
		}
 
		.title {
			text-align: center;
			line-height: 66rpx;
			width: calc(100% - 32rpx);
			margin: 0 auto;
			&.title-left{
				text-align: left;
			}
		}
	}
</style>
