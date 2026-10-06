<template>
	<view>
		<uni-popup ref="popup2" background-color="#fff" @maskClick="change">
			<view class="popup-content">
				<view class="title">
					<view class="">{{$t('transport.searchBluetooh')}}</view>
					<text class="td">{{$t('transport.clickPrint1')}}</text>
					<text class="td">{{$t('transport.clickPrint')}}</text>
				</view>
				<scroll-view @scroll="scroll" :scroll-top="scrollTop" scroll-y="true" class="scroll-Y">
				<view class="device_ul" scroll-y scroll-with-animation>
					<view v-for="(item, index) in list" :key="index" @tap="bindViewTap(item.deviceId)" class="device-li"
						hover-class="item_hover">
						<view style="font-size: 16px; color: #333;">{{ item.name }}</view>
						<view style="font-size: 16px; color: #333;">{{ item.deviceId }}</view>
						<view style="font-size: 10px">
							{{$t('transport.signal')}}: {{ item.RSSI }}dBm
							<!-- ({{ utils.max(0, item.RSSI + 100) }}%) -->
						</view>
					</view>
					<uni-load-more :status="loading"></uni-load-more>
				</view>
				
				</scroll-view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import {getTransportOrderPrint} from "@/utils/api.js"
	var app = getApp();
	var esc = require("../../../utils/esc.js");
	var encode = require("../../../utils/encoding.js");
	function Bluetooth() {
		this.platform = "";
		this.deviceId = "";
		this.writeCharaterId = "";
		this.writeServiceId = "";
		this.notifyCharaterId = "";
		this.notifyServiceId = "";
		this.readCharaterId = "";
		this.readServiceId = "";
	}
	let bluetooth;
	let command = esc.jpPrinter.createNew();
	export default {
		data() {
			return {
				list: [],
				services: [],
				serviceId: 0,
				writeCharacter: false,
				readCharacter: false,
				notifyCharacter: false,
				isSearching: false,
				oneTimeData: 0,
				looptime: 0,
				lastData: 0,
				currentTime: 1,
				printerNum: 1,
				currentPrint: 1,
				isReceiptSend: false,
				printNum: [],
				printObj: "",
				loading: "",
				id: "",
				scrollTop: 0,
				old: {
					scrollTop: 0
				}
			};
		},
		options: {
		  styleIsolation: 'shared' // 解除样式隔离
		},
		methods: {
			scroll: function(e) {
				this.old.scrollTop = e.detail.scrollTop
			},
			change() {
				uni.closeBluetoothAdapter({
					success(res) {
						console.log(res);
					}
				})
			},
			getPrintData(id,historyTimeInterval) {
				getTransportOrderPrint({orderId: id, historyTimeInterval}).then(res => {
					this.printObj = res
				})
			},
			open(id, interVal) {
				console.log(interVal);
				this.getPrintData(id, interVal)
				app.globalData.BLEInformation.platform = app.globalData.getPlatform();
				bluetooth = new Bluetooth();
				var list = [];
				var numList = [];
				var j = 0;
				for (var i = 20; i < 200; i += 10) {
					list[j] = i;
					j++;
				}
				for (var i = 1; i < 10; i++) {
					numList[i - 1] = i;
				}
				this.oneTimeData = list[0];
				this.printNum = numList;
				this.printerNum = numList[0];
				this.initBluetooth();
				this.$refs.popup2.open("bottom");
			},
			// 错误码提示
			errorCodeTip(code) {
				const _this = this;
				if (code == 0) {
					//正常
				} else if (code == 10000) {
					uni.showToast({
						title: _this.$t('transport.notInitBluetooh'),
						icon: 'none'
					})
				} else if (code == 10001) {
					uni.showToast({
						title: _this.$t('transport.bluetoohDisabled'),
						icon: 'none'
					})
				} else if (code == 10002) {
					uni.showToast({
						title: _this.$t('transport.nofindBluetooh'),
						icon: 'none'
					})
				} else if (code == 10003) {
					uni.showToast({
						title: _this.$t('transport.connectionFail'),
						icon: 'none'
					})
				} else if (code == 10004) {
					uni.showToast({
						title: _this.$t('transport.nofindServer'),
						icon: 'none'
					})
				} else if (code == 10005) {
					uni.showToast({
						title: _this.$t('transport.nofindValue'),
						icon: 'none'
					})
				} else if (code == 10006) {
					uni.showToast({
						title: _this.$t('transport.connectionCut'),
						icon: 'none'
					})
				} else if (code == 10007) {
					uni.showToast({
						title: _this.$t('transport.nonsupport'),
						icon: 'none'
					})
				} else if (code == 10008) {
					uni.showToast({
						title: _this.$t('transport.BlurError'),
						icon: 'none'
					})
				} else if (code == 10009) {
					uni.showToast({
						title: _this.$t('transport.BlurError1'),
						icon: 'none'
					})
				}
			},
			// 初始化
			initBluetooth() {
				let that = this;
				uni.openBluetoothAdapter({
					success: (res) => {
						console.log(res);
						// 开始搜索蓝牙
						uni.getBluetoothAdapterState({
							success: (res2) => {
								console.log("<=====搜索蓝牙=====>");
								console.log(res2);
								if (res2.available) {
									that.isSearching = true;
									if (res2.discovering) {
										uni.showToast({
											title: that.$t('transport.findBluetooh'),
											icon: "none"
										})
									}
									that.getBluetoothDevices();
								} else {
									uni.showToast({
										title: that.$t('transport.blurError2'),
										icon: "none"
									})
								}
							},
							fail: (err) => {
								console.log(err);
								that.errorCodeTip(err.errCode)
							}
						})
					},
					fail: (err) => {
						console.log(err);
						that.errorCodeTip(err.errCode)
					}
				})
			},
			// 获取蓝牙设备信息
			getBluetoothDevices() {
				let that = this;
				this.isSearching = true;
				that.list = [];
				this.getNewDeviceBluetooth();
				uni.startBluetoothDevicesDiscovery({
					success: (res) => {
						console.log("<===蓝牙设备信息==>");
						console.log(res);
						setTimeout(() => {
							// this.getSearchedBluetooth();
						}, 5000)
					},
					fail: (err) => {
						console.log(err);
						that.errorCodeTip(err.errCode);
					}
				})
			},
			getNewDeviceBluetooth() {
				this.loading = "loading";
				uni.onBluetoothDeviceFound((devices) => {
					console.log(devices);
					this.getSearchedBluetooth();
				})
			},
			// 获取搜索到的蓝牙
			getSearchedBluetooth() {
				uni.getBluetoothDevices({
					success: (res) => {
						console.log("搜索结果");
						console.log(res);
						let devices = [];
						let num = 0;
						for (let i = 0; i < res.devices.length; ++i) {
							if (res.devices[i].name != "未知设备") {
								devices[num] = res.devices[i];
								num++;
							}
						}
						this.list = devices;
						this.isSearching = false;
						uni.hideLoading();
					},
					fail: (err) => {
						this.loading = "no-more"
						console.log(err);
					}
				})
			},
			// 连接蓝牙
			bindViewTap(device) {
				this.stopSearch();
				this.serviceId = 0;
				this.writeCharacter = false;
				this.readCharacter = false;
				this.notifyCharacter = false;
				this.loading = "no-more";
				uni.showLoading({
					title: this.$t('transport.blurLoading')
				})
				uni.createBLEConnection({
					deviceId: device,
					success: (res) => {
						bluetooth.deviceId = device;
						app.globalData.BLEInformation.deviceId = device;
						uni.hideLoading();
						this.getSeviceId();
					},
					fail: (err) => {
						console.log(err);
						this.errorCodeTip(err.errCode);
						uni.hideLoading();
					}
				})
			},

			// 连接服务
			getSeviceId() {
				let platform = app.globalData.BLEInformation.platform;

				uni.getBLEDeviceServices({
					deviceId: bluetooth.deviceId,
					success: (res) => {
						this.services = res.services;
						this.getBLEDeviceCharacteristics();
					},
					fail: (err) => {
						this.errorCodeTip(err.errCode);
					}
				})
			},
			// 获取低功耗蓝夜特征
			getBLEDeviceCharacteristics() {
				let {
					services: list,
					serviceId: num,
					writeCharacter: write,
					readCharacter: read,
					notifyCharacter: notify
				} = this;

				uni.getBLEDeviceCharacteristics({
					deviceId: bluetooth.deviceId,
					serviceId: list[num].uuid,
					success: (res) => {
						for (let i = 0; i < res.characteristics.length; i++) {
							const properties = res.characteristics[i].properties;
							const item = res.characteristics[i].uuid;
							if (!notify) {
								if (properties.notify) {
									app.globalData.BLEInformation.notifyCharaterId = item;
									app.globalData.BLEInformation.notifyServiceId = list[num].uuid;
									bluetooth.notifyCharaterId = item;
									bluetooth.notifyServiceId = list[num].uuid;
									notify = true;
								}
							}
							if (!write) {
								if (properties.write) {
									app.globalData.BLEInformation.writeCharaterId = item;
									app.globalData.BLEInformation.writeServiceId = list[num].uuid;
									bluetooth.writeCharaterId = item;
									bluetooth.writeServiceId = list[num].uuid;
									write = true;
								}
							}
							if (!read) {
								if (properties.read) {
									app.globalData.BLEInformation.readCharaterId = item;
									app.globalData.BLEInformation.readServiceId = list[num].uuid;
									bluetooth.readCharaterId = item;
									bluetooth.readServiceId = list[num].uuid;
									read = true;
								}
							}
						}
						if (!write || !notify || !read) {
							num++
							this.writeCharacter = write;
							this.readCharacter = read;
							this.notifyCharacter = notify;
							this.serviceId = num;
							if (num == list.length) {
								uni.showModal({
									title: this.$t('other.hint'),
									content: this.$t('transport.blurLoading'),
								})
							} else {
								this.getBLEDeviceCharacteristics()
							}
						} else {
							console.log(res);
							this.receiptTest();
						}
					},
					fail: (err) => {
						console.log("低功耗蓝夜", err);
						this.errorCodeTip(err.errCode);
					}
				})
			},
			// 停止搜索
			stopSearch() {
				uni.stopBluetoothDevicesDiscovery({
					success: (res) => {
						this.isSearching = false;
					},
					fail: (err) => {
						this.errorCodeTip(err.errCode);
					}
				})
			},
			//校验权限
			checkPemission() {
				let that = this
				let platform = bluetooth.platform;
				that.getBluetoothDevices();
			},
			// 判断打印机状态
			queryStatus() {
				command.getRealtimeStatusTransmission(1);
			},
			// 发送分包
			send(buff) {
				let lootTime = this.looptime;
				let lastData = this.lastData;
				let currentTime = this.currentTime;
				let onTimeData = this.oneTimeData;
				let buf;
				let printNum = 1;
				let currentPrint = 1;
				let dataView;
				console.log("打印=====》");
				console.log(bluetooth);

				if (currentTime < lootTime) {
					buf = new ArrayBuffer(onTimeData);
					dataView = new DataView(buf);

					for (var i = 0; i < onTimeData; ++i) {
						dataView.setUint8(i, buff[(currentTime - 1) * onTimeData + i]);
					}
				} else {
					buf = new ArrayBuffer(lastData);
					dataView = new DataView(buf);

					for (var i = 0; i < lastData; i++) {
						dataView.setUint8(i, buff[(currentTime - 1) * onTimeData + i]);
					}
				}
				const _this = this;
				uni.writeBLECharacteristicValue({
					deviceId: bluetooth.deviceId,
					serviceId: bluetooth.writeServiceId,
					characteristicId: bluetooth.writeCharaterId,
					value: buf,
					success: (res) => {
						if (currentPrint == printNum) {
							uni.showToast({
								title: this.$t('transport.printing1')
							});
						}
					},
					fail: (err) => {
						uni.showToast({
							title: this.$t('transport.printError'),
							icon: 'none'
						});
					},
					complete: () => {
						currentTime++;

						if (currentTime <= lootTime) {
							this.currentTime = currentTime;
							this.send(buff);
						} else {
							// wx.showToast({
							//   title: '已打印第' + currentPrint + '张',
							// })
							if (currentPrint == printNum) {
								this.looptime = 0;
								this.lastData = 0;
								this.currentTime = 1;
								this.isReceiptSend = false;
								this.currentPrint = 1;
								// closeBluetoothAdapter
								uni.closeBluetoothAdapter({
									success(res) {
										console.log(res);
									}
								})
								// 打印完成后断开连接
							} else {
								currentPrint++;
								this.currentTime = 1;
								this.currentPrint = currentPrint;
								this.send(buff);
							}
						}
					}
				})
			},
			// 准备发送
			prepareSend(buff) {
				const time = this.oneTimeData;
				const looptiem = parseInt(buff.length / time);
				const lastData = parseInt(buff.length % time);
				this.looptime = looptiem + 1;
				this.lastData = lastData;
				this.currentTime = 1;
				this.send(buff);
			},
			// 打印
			receiptTest() {
				let that = this;
				var canvasWidth = that.canvasWidth;
				var canvasHeight = that.canvasHeight;
				command.init(); //初始化打印机
				
				command.setLeftMargin(0); //设置左边距
				
				command.setPrint();
				command.setPrintMode(0);
				command.setText(this.printObj)
				// command.setText("    71106 29079 81101 66268");
				// command.setPrint();
				// command.setPrintMode(0);
				// command.setText("测试票，机号：44010660 2007.09.07-10：43：32");
				// command.setPrint();
				// command.setPrintMode(0);
				// command.setText("双色球(B001)/2007105(0623)期 序号：00067：单式");
				// command.setPrint();
				// command.setPrint();
				// command.setPrintMode(0);
				// command.setText("1> ");
				// command.setPrintMode(41);
				// command.setText("03 04 13 18 19 27 - 13* 001");
				// command.setPrint();
				// command.setPrintMode(0);
				// command.setText("2> ");
				// command.setPrintMode(41);
				// command.setText("01 04 17 18 19 28 - 01* 001");
				// command.setPrint();
				// command.setPrintMode(0);
				// command.setText("3> ");
				// command.setPrintMode(41);
				// command.setText("01 04 17 18 19 28 - 01* 001");
				// command.setPrint();
				// command.setPrintMode(41);
				// command.setText("    CD33 7B07 5F 8D D2C2");
				// command.setPrint();
				// command.setPrintMode(0);
				// command.setText("开奖日:2007-09-09       金额20元");
				// command.setPrint();
				// command.setText("站地址：好易内部测试");
				// command.setPrint();
				// command.setText("查询电话：16880345 客服电话：020-88320568");
				// command.setPrint();
				// command.setText(
				// 	"兑奖通知:中奖10000元以内（含10000元）由银行自动返奖；10000元以上持本票到广州市福利彩票发行中心领奖。（此票不能在电脑福利彩票投注站兑奖）"
				// 	); // command.setAbsolutePrintPosition(18)
				
				command.setPrint();
				command.setHRIPosition(0); //设置HRI位置
				
				command.setHRIFont(0); //HRI字体大小
				
				// command.setBarcodeHeight(60); //条码高度
				
				// command.setBarcodeWidth(2); //设置条码宽度
				
				// command.setAbsolutePrintPosition(24);
				// command.setCode128("{A71106290798110166238"); //code128  A类型
				
				// command.setText("                                 888888888888");
				command.setPrint();
				command.setPrint();
				command.setPrint();
				command.setPrint();
				command.setPrint();
				command.setPrint();
				command.setPrint();
				command.setPrint();
				command.setPrint();
				command.setBlackMarkStart();
				command.setCut();
				this.prepareSend(command.getData())
			},

		}
	}
</script>

<style lang="scss" scoped>
	::v-deep .uni-popup .uni-popup__wrapper {
		width: 100%;
		height: 600rpx;
		box-sizing: border-box;
		border-radius: 20rpx 20rpx;
	} 
	.scroll-Y {
		height: 600rpx;
	}
	.popup-content {
		align-items: center;
		justify-content: center;
		padding: 15px;
		height: 600rpx;
		background-color: #fff;
		overflow-x: auto;
		text-align: center;
		border-radius: 20rpx 20rpx;
		
		.title {
			
			.td {
				font-size: 24rpx;
				color: #999999;
			}
		}


		.devices-ul {
			height: 500rpx;
			overflow-y: auto;
			.device-li {
				text-align: center;
				border-bottom: 2rpx solid #999999;
			}
		}
	}
</style>
