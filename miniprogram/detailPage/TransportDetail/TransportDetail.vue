<!-- 运单详情 -->
<template>
	<page-meta :page-style="'overflow:'+(show?'hidden':'visible')"></page-meta>
	<view class="detail">
		<view v-if="emptyMessage" class="detail-message">{{ emptyMessage }}</view>
		<view v-else-if="detail && detail.id">
		<view class="detail-title">{{$t('labDevice.basicInformation')}}</view>
		<view class="detail-message">
			<view class="message-item">
				{{$t('transport.transportNo')}}：<span class="item">{{detail.transportNo}}</span>
			</view>
			<view class="message-item">
				{{$t('transport.professionNo')}}：<span class="item">{{detail.professionNo}}</span>
			</view>
			<view class="message-item">
				{{$t('transport.carBoard')}}：<span class="item">{{detail.carBoard}}</span>
			</view>
			<view class="message-item">
				{{$t('transport.state')}}：<span class="item"
					:class="detail.state == 2 ? 'inTransit': (detail.state == 3 ? 'deliveried': 'defalt')">{{state[detail.state]}}</span>
			</view>
			<view class="message-item">
				{{$t('transport.driverName')}}：<span class="item">{{detail.driverName}}</span>
			</view>
			<view class="message-item">
				{{$t('transport.consigner')}}：<span class="item">{{detail.deliverName}}</span>
			</view>
			<view class="message-item">
				{{$t('transport.consignerAddress')}}：<span class="item">{{detail.deliverAddress}}</span>
			</view>
			<view class="message-item">
				{{$t('transport.consignee')}}：<span class="item">{{detail.receiveName}}</span>
			</view>
			<view class="message-item">
				{{$t('transport.consigneeAddress')}}：<span class="item">{{detail.receiveAddress}}</span>
			</view>
			<view class="message-item">
				{{$t('transport.beginTime')}}：<span class="item">{{detail.beginTime}}</span>
			</view>
			<view class="message-item">
				{{$t('transport.completeTime')}}：<span class="item">{{detail.completeTime}}</span>
			</view>
			<view class="message-item">
				<view class="" v-for="item in detail.sensors" :key="item.id" v-if="item.monitorSensorCatId !== 12">
					<span class="message-item">{{item.sensorAlias + $t('other.alarmScope')}}</span>：<span
						class="item">{{item.normalMin + "~" + item.normalMax + item.unit}}</span>
				</view>
			</view>
		</view>
		<view class="detail-title">操作记录（演示）</view>
		<view class="detail-message" v-for="record in detail.operations" :key="record.id">
			{{record.at}} · {{record.action}} · {{record.userName}}
		</view>
		<view class="detail-title">{{$t('transport.productList')}}</view>
		<view class="product">
			<view class="detail-message" v-for="(item,index) in detail.sampleInfos" :key="index">
				<view class="message-item">
					{{$t('transport.productNo')}}：<span class="item">{{item.sampleNo}}</span>
				</view>
				<view class="message-item">
					{{$t('transport.productName')}}：<span class="item">{{item.sampleName}}</span>
				</view>
				<view class="message-item">
					{{$t('transport.unit')}}：<span class="item">{{item.unitName}}</span>
				</view>
				<view class="message-item">
					{{$t('transport.specification')}}：<span class="item">{{item.specification}}</span>
				</view>
				<view class="message-item">
					{{$t('transport.num')}}：<span class="item">{{item.amount}}</span>
				</view>
			</view>
		</view>
		<view class="detail-message">
			<view class="h2-title">
				{{$t('labDevice.otherServe')}}
			</view>
			<view class="flex-between" style="margin-top: 30rpx;">
				<button class="print" :class="{'dis': detail.state != 1}" :disabled="detail.state != 1" @click="$refs.deparHint.open(detail.carId)">{{$t('transport.go')}}</button>
				<button class="print" :class="{'dis': detail.state != 2}" :disabled="detail.state != 2" @click="handleGoTo">{{$t('transport.delivery')}}</button>
				<button class="print" @click="handleGoPreview()">演示凭证预览</button>
			</view>

		</view>
		</view>
		<view class="print-popup">
			<uni-popup ref="popup" type="bottom" background-color="#fff" @change="">
				
			<view class="popup-content">
				<view class="head">
					<uni-title type="h3" :title="$t('transport.printChange')"></uni-title>
				</view>
				<ul class="ul">
					<li @click="handleGoPreview()">{{$t('transport.printView')}}</li>
					<li @click="handleShowSearchBlue()">{{$t('transport.printing')}}</li>
					<li style="border-bottom: none;" class="abnormal" @click="$refs.popup.close()">
						{{$t('transport.cancelPrint')}}</li>
				</ul>
			</view>
		</uni-popup>
		</view>
		<uni-popup ref="inputDialog" type="dialog">
			<uni-popup-dialog ref="inputClose" mode="input" :title="$t('transport.interVal')" :value="interVal"
				@confirm="dialogInputConfirm"></uni-popup-dialog>
		</uni-popup>
		<depar-hint @show="change" ref='deparHint' @change="setState"></depar-hint>
		<uni-popup ref="alertDialog" type="dialog">
			<uni-popup-dialog :type="msgType" :cancelText="$t('common.cancel')" :confirmText="$t('common.confirm')"
				:content="sendTitle" @confirm.stop="dialogConfirm"></uni-popup-dialog>
		</uni-popup>
		<SearchBluetooh ref="searchBluetooh" />
	</view>
</template>

<script>
	import {
		postTransportOrderDetail
	} from "@/utils/api.js"
	import {
		changeTransportOrderState
	} from "@/utils/api.js"
	import DeparHint from "@/pages/tabBar/Transport/deparHint.vue"
	import SearchBluetooh from "@/detailPage/components/SearchBluetooh/SearchBluetooh.vue"
	export default {
		components: {
			SearchBluetooh,
			DeparHint
		},
		options: {
			styleIsolation: 'shared' // 解除样式隔离
		},
		data() {
			const _this = this;
			return {
				detailId: "",
				detail: null,
				emptyMessage: "",
				interVal: 15,
				popup: false,
				show: false,
				state: {
					0: _this.$t('transport.notCarLoader'),
					1: _this.$t('transport.carLoadereed'),
					2: _this.$t('transport.inTransit'),
					3: _this.$t('transport.deliveried')
				},
				waybillId: "",
				sendTitle: _this.$t('transport.isSend'),
			}
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: this.$t('route.transportDetail')
			});
		},
		onLoad(options) {
			this.detailId = options.id;
			this.getDetail(this.detailId);
		},
		methods: {
			change(val) {
				this.show = val;
			},
			handleGoTo() {
				this.sendTitle = this.$t('transport.isSend');
				this.waybillId = this.detail.id;
				this.$refs.alertDialog.open()
			},
			dialogConfirm() {
				let arr = [this.waybillId];
				this.setState(arr, 3);
				this.isBatch = false;
				this.$refs.alertDialog.close();
			},
			setState(ids, state) {
				uni.showLoading();
				changeTransportOrderState({
					ids,
					state
				}).then(res => {
					if (res.code) {
						uni.showToast({
							title: this.$t('common.handleSuccess'),
							icon: "success"
						})
						this.getDetail(this.detailId);
					} else {
						uni.showToast({
							title: res.message,
							icon: "none"
						})
					}
				}).finally(() => {
					uni.hideLoading();
				})
			},
			handleGoPreview() {
				if (this.$refs.popup) this.$refs.popup.close()
				setTimeout(() => {
					uni.navigateTo({
						url: "../PrintPreview/PrintPreview?id=" + this.detailId
					})
				})

			},
			bindPickerChange() {},
			handleShowSearchBlue() {
				uni.showToast({
					title: '蓝牙打印未接入',
					icon: 'none'
				});
			},
			dialogInputConfirm(e) {
				if (typeof(e * 1) != 'number') {
					uni.showToast({
						title: this.$t('transport.interValError'),
						icon: "none"
					})
					return false;
				}
				this.$refs.popup.close()
				this.interVal = parseInt(e * 1);
				this.$refs.searchBluetooh.open(this.detailId, parseInt(this.interVal * 1));
			},
			getDetail(id) {
				const seq = (this._detailSeq = (this._detailSeq || 0) + 1);
				uni.showLoading()
				postTransportOrderDetail({
					id
				}).then(res => {
					if (seq !== this._detailSeq) return;
					uni.hideLoading()
					if (res && res.code && res.items && res.items.id) {
						this.detail = res.items;
						this.emptyMessage = "";
					} else {
						this.detail = null;
						this.emptyMessage = (res && res.message) || '未知运单';
					}
				}).catch(() => {
					if (seq !== this._detailSeq) return;
					uni.hideLoading()
					this.detail = null;
					this.emptyMessage = '未知运单';
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.print-popup {
		.head {
			padding: 20rpx;
			margin-left: 40rpx;
			::v-deep .uni-title__box {
				padding: 0 !important;
			}
		}
		::v-deep .uni-popup .uni-popup__wrapper {
			width: 100%;
			height: 470rpx;
			box-sizing: border-box;
			border-radius: 20rpx 20rpx;
		} 
	}
	
	.detail {
		padding: 40rpx 60rpx;

		.detail-title {
			font-size: 36rpx;
			font-weight: bold;
			color: #333333;
			line-height: 2;
			position: relative;
			padding-left: 10rpx;
		}

		.detail-title::before {
			content: "";
			width: 8rpx;
			height: 34rpx;
			background: #D6AE7B;
			border-radius: 4rpx;
			position: absolute;
			top: 20rpx;
			left: -20rpx;
		}

		.detail-message {
			background: #FFFFFF;
			box-shadow: 0px 2rpx 12rpx 0px rgba(51, 51, 51, 0.04);
			border-radius: 16rpx;
			padding: 40rpx;
			margin: 40rpx -20rpx;
			color: #888888;
			line-height: 1.5;

			.item {
				color: #555555;

				&.inTransit {
					color: #10B89B;
				}

				&.deliveried {
					color: #777777;
				}

				&.defalt {
					color: #2A7DFD;
				}
			}
		}

		.product {
			margin-top: 40rpx;
		}

		.print {
			width: 180rpx;
			height: 72rpx;
			line-height: 70rpx;
			background: #FFFFFF;
			border: 2rpx solid #D6AE7B;
			border-radius: 10rpx;
			color: #CBA575;
			&.dis {
				border: none;
			}
		}

		.ul {
			width: 100%;
			padding: 40rpx 0;
			padding-top: 0;
			border-radius: 20rpx;
			text-align: center;
			background: #FFFFFF;
			text-align: center;
		}

		.ul>li {
			width: 100%;
			list-style: none;
			line-height: 2;
			color: #1890FF;
			height: 100%;
			padding: 30rpx 0;
			border-bottom: 2rpx #EEEEEE solid;

			&.abnormal {
				color: #E93F40;
			}
		}

	}
</style>
