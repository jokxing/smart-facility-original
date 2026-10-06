<!-- 签字画板 -->
<template>
	<view class="new_file" v-if="showAutograph">
		<view class="popupBox">
			<view class="popupTopBox">{{$t('home.signBoard')}}</view>
			<canvas class="mycanvas" canvas-id="mycanvas" @touchstart="touchstart" @touchmove="touchmove"
				:disable-scroll="true" @touchend="touchend"></canvas>
			<view class="deter-but">
				<view class="determineBtn" @click.stop="cancel">{{$t('home.cancel')}}</view>
				<view class="determineBtn" @click.stop="clear">{{$t('home.clearSign')}}</view>			
				<view class="determineBtn" @click.stop="confirm">{{$t('home.userSign')}}</view>
			</view>
			
		</view>
	</view>
</template>

<script>
	import {
		getFormData
	} from "@/utils/methods.js"
	export default {
		data() {
			return {
				showAutograph: false,
				ctx: '', //绘图图像
				points: [], //路径点集合
				signature: '',
				oss: {
					key: "",
					policy: "",
					OSSAccessKeyId: "",
					Success_Action_Status: 200,
					signature: "",
					callback: "",
					host: ""
				},
				url: ""
			};
		},
		methods: {
			//创建并显示签名画布
			autograph() {
				getFormData("image").then(ossObj => {
					this.oss.key = ossObj.dir;
					this.oss.policy = ossObj.policy;
					this.oss.OSSAccessKeyId = ossObj.accessKey;
					this.oss.signature = ossObj.signature;
					this.url = ossObj.host;
					this.oss.host = ossObj.host;
					this.oss.callback = ossObj.callback;
				});
				this.showAutograph = true;
				//创建绘图对象
				this.ctx = uni.createCanvasContext('mycanvas', this);
				//设置画笔样式
				this.ctx.lineWidth = 4;
				this.ctx.lineCap = 'round';
				this.ctx.lineJoin = 'round';
			},
			//触摸开始，获取到起点
			touchstart(e) {
				let startX = e.changedTouches[0].x;
				let startY = e.changedTouches[0].y;
				let startPoint = {
					X: startX,
					Y: startY
				};
				this.points.push(startPoint);
				//每次触摸开始，开启新的路径
				this.ctx.beginPath();
			},
			//触摸移动，获取到路径点
			touchmove(e) {
				let moveX = e.changedTouches[0].x;
				let moveY = e.changedTouches[0].y;
				let movePoint = {
					X: moveX,
					Y: moveY
				};
				this.points.push(movePoint); //存点
				let len = this.points.length;
				if (len >= 2) {
					this.draw(); //绘制路径
				}
			},
			// 触摸结束，将未绘制的点清空防止对后续路径产生干扰
			touchend() {
				this.points = [];
			},
			/* ***********************************************
						#   绘制笔迹
						#	1.为保证笔迹实时显示，必须在移动的同时绘制笔迹
						#	2.为保证笔迹连续，每次从路径集合中区两个点作为起点（moveTo）和终点(lineTo)
						#	3.将上一次的终点作为下一次绘制的起点（即清除第一个点）
						************************************************ */
			draw() {
				let point1 = this.points[0];
				let point2 = this.points[1];
				this.points.shift();
				this.ctx.moveTo(point1.X, point1.Y);
				this.ctx.lineTo(point2.X, point2.Y);
				this.ctx.stroke();
				this.ctx.draw(true);
			},
			//清空画布
			clear() {
				let that = this;
				uni.getSystemInfo({
					success: function(res) {
						let canvasw = res.windowWidth;
						let canvash = res.windowHeight;
						that.ctx.clearRect(0, 0, canvasw, canvash);
						that.ctx.draw(true);
					}
				});
			},
			//关闭并清空画布
			cancel() {
				this.showAutograph = false;
				this.clear();
			},
			//完成绘画并保存到本地
			confirm() {
				let that = this;
				let width = null;
				let height = null;
				uni.getSystemInfo({
					success:function(res){
						console.log(res);
						width = res.windowWidth;
						height = res.windowHeight;
					}
				})
				console.log(width, height);
				uni.canvasToTempFilePath({
					x: 0,
					y: 0,
					width,
					height,
					destHeight: width,
					destWidth: height,
					canvasId: 'mycanvas',
					success: function(res) {
						// 本地图片地址
						console.log(res.tempFilePath);
						const fillName = (res.tempFilePath || '').split('/').pop() || 'demo.png';
						that.handleUpload(res.tempFilePath, "/" + fillName);

						// this.$emit("handle", res.tempFilePath);
					},
					complete: (res) => {
						console.log(res);
					}
				}, that);
			},
			handleUpload(e, fileName) {
				uni.showToast({title: '演示未开放文件上传', icon: 'none'});
				return;
				this.oss.key = this.oss.key + fileName;
				const that = this;
				const uploadTask = uni.uploadFile({
					url: that.url,
					filePath: e,
					fileType: "image",
					name: "file",
					formData: that.oss,
					success: (res) => {
						if (res.statusCode == 200) {
							const obj = JSON.parse(res.data);
							that.$emit("handle", obj.items.fileName);
							uni.showToast({
								title: that.$t('home.updateSuccess'),
								icon: "success",
								duration: 1000
							})
							setTimeout(() => {
								that.cancel();
							}, 1000)
						} else {
							console.log("失败原因" + res);
							uni.showToast({
								title: that.$t('home.updateError'),
								icon: "error",
								duration: 1000
							})
						}

					},
					fail: (err) => {
						throw new Error(err.errMsg);
					}
				})
			}
		}
	};
</script>

<style lang="scss" scoped>
	page {
		font-family: Source Han Sans CN;
	}

	.new_file {
		position: fixed;
		left: 0;
		top: 0;
		width: 100vw;
		height: 100vh;
		z-index: 200;
		background-color: rgba(0, 0, 0, 0.5);

		.popupBox {
			position: fixed;
			left: 50%;
			transform: translate(-50%, 0);
			width: 100%;
			height: 100%;
			background: #ffffff;

			.popupTopBox {
				width: 100%;
				height: 80rpx;
				background: #00aee7;
				border-radius: 16rpx 16rpx 0px 0px;
				text-align: center;
				line-height: 80rpx;
				font-size: 32rpx;
				color: #ffffff;
			}

			.mycanvas {
				width: 83%;
				height: 100%;
				float: right;
				border-left: 2px dashed #777777;
			}

			.deter-but {
				padding-top: 20rpx;
				transform: rotate(90deg);
				display: flex;
				align-items: center;
				position: fixed;
				top: 60vh;
				left: -45vw;
				z-index: 300;
			}
			
			.determineBtn {
				width: 280rpx;
				height: 69rpx;
				background: #00aee7;
				border-radius: 35rpx;
				margin: 0 auto;
				font-size: 30rpx;
				color: #ffffff;
				text-align: center;
				line-height: 69rpx;
			}
		}

		.closeIcon {
			position: fixed;
			left: 50%;
			bottom: 92rpx;
			transform: translate(-50%, 0);
			width: 50rpx;
			height: 50rpx;

			image {
				width: 100%;
				height: 100%;
			}
		}
	}
</style>
