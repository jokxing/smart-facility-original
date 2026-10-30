<!-- 运单管理 -->
<template>
	<page-meta :page-style="'overflow:'+(show?'hidden':'visible')"></page-meta>
	
	<view class="home">
		<!-- <navbar class="header" :background="backgroundColor" :title="$t('route.transport')" :isHeight="'400rpx'"></navbar> -->
		<!-- :bgColor="'#4e5992'" -->
		<uni-search-bar :cancelText="$t('common.cancel')" class="search1" :placeholder="$t('transport.interSearch')"
			v-model="items.keyword" @confirm="handleSearch" @clear="handleSearch" bgColor="#fff" radius="20">
		</uni-search-bar>
		<!-- <SearchSelect class="search1"  @input="handleInput" :searchList="searchList" /> -->
		<view class="transport-sum " :style="items.keyword ? 'height: 182rpx' : ''">
			<view class="hint" v-show="!items.keyword">
				{{ $t('transport.demoClockHint') }}
			</view>
			<view class="flex-between">
				<view class="transport-sum-item" :class="{'is-active': items.state == 0}" @click="handleStatus(0)">
					<view class="transport-sum-num">{{dashboard.allNum}}</view>
					<view class="transport-sum-title">{{ $t('common.all') }}</view>
				</view>
				<view class="transport-sum-item" :class="{'is-active': items.state == 1}" @click="handleStatus(1)">
					<view class="transport-sum-num truck">{{dashboard.loadedCarNum}}</view>
					<view class="transport-sum-title">{{ $t('transport.carLoadereed') }}</view>
				</view>
				<view class="transport-sum-item" :class="{'is-active': items.state == 2}" @click="handleStatus(2)">
					<view class="transport-sum-num go">{{dashboard.inTransitNum}}</view>
					<view class="transport-sum-title">{{ $t('transport.inTransit') }}</view>
				</view>
				<view class="transport-sum-item" :class="{'is-active': items.state == 3}" @click="handleStatus(3)">
					<view class="transport-sum-num end">{{dashboard.arrivedNum}}</view>
					<view class="transport-sum-title">{{ $t('transport.deliveried') }}</view>
				</view>
			</view>
		</view>
		<view class="transport-ul">
			<view class="transport-list" v-for="(item,index) in list" :key="item.id" @click="handleGoDetail(item.id)">
				<view class="transport-name flex-between">
					<span>
						<radio-group @change="handleChangeWaybill($event, item.id)">
							<label>
								<!-- " -->
								<checkbox v-if="items.state && isBatch" class="check" @change.stop="" color="#D6AE7B" :value="true"
									:checked="checkbox1.includes(item.id)" />
								{{$t('transport.transportNo1')}}:
								<view :class="isBatch ? 'mr' : ''">
									{{item.transportNo}}
								</view>
							</label>
						</radio-group>
					</span>
					<view class="transport-status"
						:class="item.state == 2 ? 'inTransit': (item.state == 3 ? 'deliveried': '')">
						{{state[item.state]}}
					</view>
				</view>
				<view :class="isBatch ? 'mr' : ''" style="font-size: 28rpx;">
					{{ $t('transport.consignee') }}： {{ item.receiveName }}
				</view>
				<view class="sensors" :class="isBatch ? 'mr' : ''">
					<view class="text" v-for="sensors in item.sensors" :key="sensors.id">
						<text v-if="sensors.monitorSensorCatId != 12">{{ sensors.sensorAlias }}：</text>
						<text v-if="dataZoom[sensors.monitorSensorCatId]" class="span"
							:class="sensors.activateFlag === 1 ? 'abnormal' : 'normal'">{{ sensors.activateFlag === 1 ? dataZoom[sensors.monitorSensorCatId][1] : dataZoom[sensors.monitorSensorCatId][2] }}</text>
						<text v-else-if="sensors.monitorSensorCatId == 12"></text>
						<text v-else class="span" :class="sensors.activateFlag === 1 ? 'abnormal' : 'normal'">
							{{ sensors.monitorSensorVal !== null && sensors.monitorSensorVal !== undefined ? sensors.monitorSensorVal : '' }}{{ sensors.unit }}
						</text>
					</view>
				</view>
				<view :class="isBatch ? 'mr' : ''">
					{{$t('other.checkDate')}}：{{ item.beginTime || "" }}
				</view>
				<button v-if="operation[item.state] && !isBatch" class="but-transport"
					@click.stop="handleUpdateStatus(item)">{{ operation[item.state] }}</button>
			</view>
			<view v-if="isList && !list.length" class="transport-list">暂无运单</view>
			<view class="batch-but" :class="isBatch ? 'mb': ''">
				<button v-if="items.state == 2 && list.length" :class="isBatch ? 'cancel' : 'primary'"
					@click="hide">{{isBatch ? $t('common.cancel') : $t('transport.batchDelivery')}}</button>
				<button class="cancel" @click="handleResetDemo">重置演示运单</button>
			</view>
		</view>
		<view class="all-send flex-between" v-if="items.state && isBatch">
			<view class="">
				<!--  -->
				<radio-group @change="handleBatch">
					<label>
						<checkbox class="check" color="#D6AE7B" :value="true" :checked="batch" />
						{{ $t('transport.allChange')}}
					</label>
				</radio-group>
			</view>
			<button class="primary" @click="handleBatchComfirm">{{$t('transport.delivery')}}</button>
		</view>
		<tab-bar :selectedIndex='tabBarIndex'></tab-bar>
		<uni-load-more :status="moreStatus" v-show="isList && !isBatch"></uni-load-more>
		<depar-hint @show="change" ref='deparHint' @change="setState"></depar-hint>
		<uni-popup ref="alertDialog" type="dialog">
			<uni-popup-dialog type="info" :cancelText="$t('common.cancel')" :confirmText="$t('common.confirm')"
				:content="sendTitle" @confirm="dialogConfirm"></uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
	import {
		DATAZOOM,
		MONITORSTATUS
	} from '@/utils/constant.js';
	import {
		statusColor,
		statusText
	} from '@/utils/methods.js';
	import navbar from '@/components/NavigationBar/index.vue';
	import Toast from "@/components/Toast/index.vue";
	import DeparHint from "@/pages/tabBar/Transport/deparHint.vue"
	import {
		postTransportOrderQuery,
		getTransportOrderDashboard,
		changeTransportOrderState,
		postDemoTransportReset
	} from "@/utils/api.js"
	export default {
		components: {
			navbar,
			Toast,
			DeparHint
		},
		data() {
			const _this = this;
			return {
				MONITORSTATUS,
				statusColor,
				statusText,
				dataZoom: DATAZOOM,
				backgroundColor: "linear-gradient(-15deg, #2a305d 0%, #606bad 100%)",
				dashboard: {
					allNum: 0,
					arrivedNum: 0,
					inTransitNum: 0,
					loadedCarNum: 0,
					notLoadedCarNum: 0
				},
				moreStatus: "",
				isList: false,
				items: {
					beginTime: "",
					deliverId: "",
					endTime: "",
					pageNum: 1,
					pageSize: 10,
					receiptId: "",
					sampleId: "",
					keyword: "",
					sortName: {
						beginTime: "",
						completeTime: "",
						createDate: "",
						professionNo: "",
						state: "",
						transportNo: ""
					},
					state: 0
				},
				checkbox1: [],
				list: [],
				total: "",
				state: {
					0: _this.$t('transport.notCarLoader'),
					1: _this.$t('transport.carLoadereed'),
					2: _this.$t('transport.inTransit'),
					3: _this.$t('transport.deliveried')
				},
				operation: {
					1: _this.$t('transport.go'),
					2: _this.$t('transport.delivery')
				},
				tabBarIndex: "",
				sendTitle: _this.$t('transport.isSend'),
				isBatch: false,
				batch: false,
				waybillId: "",
				show: false
			};
		},
		onShow() {
			let curRoute = 'pages/tabBar/Transport/Transport';
			this.tabBarIndex = curRoute;
			this.init();

		},
		onPullDownRefresh() {
			this.init();
		},
		onReachBottom() {
			if (this.items.pageNum * this.items.pageSize < this.total) {
				this.items.pageNum += 1;
				this.moreStatus = "loading";
				this.getTransportList();
			} else {
				this.moreStatus = "no-more";
			}
		},
		watch: {
			isBatch: {
				handler: function(val) {
					if (!val) {
						this.checkbox1 = [];
					}
				}
			}
		},
		methods: {
			hide() {
				this.isBatch = !this.isBatch;
				this.batch = false;
			},
			change(val) {
				this.show = val;
			},
			handleSearch() {
				this.items.pageNum = 1;
				this.list = [];
				this.getTransportList();
				this.handleGetTransportDashboard()
			},
			dialogConfirm() {
				let arr = [];
				if (this.isBatch) {
					arr = this.checkbox1;
				} else {
					arr = [this.waybillId];
				}
				this.setState(arr, 3);
				this.isBatch = false;
				this.$refs.alertDialog.close();
			},
			handleGoDetail(id) {
				if (this.isBatch) {
					return
				} else {
					uni.navigateTo({
						url: "../../../detailPage/TransportDetail/TransportDetail?id=" + id
					})
				}
			},
			handleUpdateStatus(item) {
				if (item.state == 1) {
					this.$refs.deparHint.open(item.carId);
				}
				if (item.state == 2) {
					this.sendTitle = this.$t('transport.isSend');
					this.waybillId = item.id;
					this.$refs.alertDialog.open();
				}
			},
			init(state) {
				this.items.pageNum = 1;
				this.items.pageSize = 10;
				this.list = [];
				if (state === 0 || state) {
					this.items.state = state;
				} else if (this.items.state === '' || this.items.state == null) {
					this.items.state = 0;
				}
				this.handleGetTransportDashboard();
				this.getTransportList();
			},
			handleGetTransportDashboard() {
				getTransportOrderDashboard({keyword: this.items.keyword}).then(res => {
					if (res && res.code && res.items) {
						this.dashboard = res.items;
					}
				})
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
						this.init();
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
			getTransportList() {
				const obj = JSON.parse(JSON.stringify(this.items));
				if (obj.state == 0) {
					obj.state = "";
				}
				const seq = (this._listSeq = (this._listSeq || 0) + 1);
				uni.showLoading()
				postTransportOrderQuery(obj).then(res => {
					if (seq !== this._listSeq) return;
					uni.stopPullDownRefresh();
					uni.hideLoading();
					if (res && res.code && res.items && Array.isArray(res.items.list)) {
						this.list = this.list.concat(res.items.list);
						this.total = res.items.total;
						this.isList = true;
						if (this.items.pageNum * this.items.pageSize >= res.items.total) {
							this.moreStatus = "no-more";
						} else {
							this.moreStatus = "more";
						}
					} else {
						this.isList = true;
						this.moreStatus = "no-more";
						uni.showToast({title: (res && res.message) || '运单列表加载失败', icon: 'none'});
					}
				}).catch(() => {
					if (seq !== this._listSeq) return;
					uni.stopPullDownRefresh();
					uni.hideLoading();
					this.isList = true;
					this.moreStatus = "no-more";
				})
			},
			handleResetDemo() {
				uni.showModal({
					title: '重置演示运单',
					content: '将恢复预置样例并清除本机运单改动，不会影响 SaaS。确定继续？',
					success: (res) => {
						if (!res.confirm) return;
						uni.showLoading();
						postDemoTransportReset().then(result => {
							uni.hideLoading();
							if (result && result.code) {
								this.init(0);
							} else {
								uni.showToast({title: (result && result.message) || '重置失败', icon: 'none'});
							}
						});
					}
				});
			},
			handleStatus(val) {
				console.log(val);
				this.list = [];
				this.items.state = val;
				this.items.pageNum = 1;
				this.isBatch = false;
				this.getTransportList();
				this.handleGetTransportDashboard();
			},
			handleBatch(e) {
				console.log(e.detail.value);
				if (e.detail.value) {
					this.checkbox1 = Array.from(this.list, ({
						id
					}) => id);
					this.checkbox1 = Array.from(new Set(this.checkbox1));
					this.batch = true;
				} else {
					this.checkbox1 = [];
					this.batch = false;
				}
			},
			handleChangeWaybill(e, id) {
				this.isBatch = true;
				if (e.detail.value) {
					this.checkbox1.push(id);
				} else {
					for (let i = 0; i < this.checkbox1.length; i++) {
						const list = this.checkbox1[i]
						if (id == list) {
							this.checkbox1.splice(i, 1)
						}
					}
				}
				if (this.checkbox1.length === this.list.length) {
					this.batch = true;
				} else {
					console.log(this.checkbox1.length === this.list.length);
					this.batch = false;
				}
			},
			handleBatchComfirm() {
				if (this.checkbox1.length === 0) {
					uni.showToast({
						title: this.$t('transport.changeError'),
						icon: "none"
					})
					return false;
				}
				this.sendTitle = this.$t('transport.isBatchSend') + this.checkbox1.length + this.$t(
					'transport.waybillNum') + "?";
				this.$refs.alertDialog.open();
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import "../Home/Home.scss";

	// .search1 {
	// 	width: 100%;
	// 	position: absolute;
	// 	top: 160rpx;
	// }

	.transport-sum {
		width: 662rpx;
		height: 246rpx;
		box-shadow: 0rpx 2rpx 12rpx 0rpx rgba(51, 51, 51, 0.04);
		border-radius: 16rpx;
		background-color: #FFFFFF;
		margin: 0 auto;
		padding: 24rpx 15rpx 0 15rpx;

		.hint {
			font-size: 24rpx;
			font-weight: 500;
			color: #555555;
			margin-bottom: 24rpx;
			margin-left: 12rpx;
		}


		.transport-sum-item {
			width: 150rpx;
			height: 160rpx;
			text-align: center;

			.transport-sum-num {
				font-size: 60rpx;
				font-weight: 500;
				color: #CBA575;
				line-height: 1.5;
				z-index: 2;
			}

			.truck {
				color: #2A7DFD;
			}

			.go {
				color: #10B89B;
			}

			.end {
				color: #777777;
			}

			.transport-sum-title {
				font-size: 24rpx;
				font-weight: 500;
				color: #555555;
				line-height: 1.5;
				z-index: 2;
			}

			&.is-active {
				background-color: #FAF5EF;
				border-radius: 16rpx;
			}
		}
	}

	.primary {
		background: #D6AE7B;
		border-radius: 45rpx;
		color: #FFFFFF;
		margin-top: 40rpx;
	}

	.cancel {
		background-color: #fff !important;
		border: 2rpx solid $primary;
		color: $primary !important;
		border-radius: 45rpx;
		margin-top: 40rpx;

		&::after {
			border: none
		}
	}

	.mr {
		margin-left: 54rpx;
	}

	.transport-ul {
		margin-top: 40rpx;

		.batch-but {
			width: 360rpx;
			height: 90rpx;
			margin: 0 auto;
			&.mb {
				margin-bottom: 180rpx;
			}
		}

		.transport-list {
			width: 620rpx;
			background: #FFFFFF;
			box-shadow: 0px 2rpx 12rpx 0px rgba(51, 51, 51, 0.04);
			border-radius: 10rpx;
			padding: 30rpx 30rpx;
			margin: 20rpx auto;
			color: #555555;
			line-height: 1.75;
			position: relative;

			.transport-name {
				font-size: 32rpx;
				font-weight: bold;
				color: #333333;
				margin-bottom: 20rpx;
				position: relative;
			}

			.transport-name::before {
				content: "";
				position: absolute;
				top: 15rpx;
				left: -30rpx;
				width: 6rpx;
				height: 30rpx;
				background: #D6AE7B;
				border-radius: 6rpx;
			}



			.monitoring {
				color: #333333;
				font-weight: bold;
			}

			.transport-status {
				position: absolute;
				top: -30rpx;
				right: -30rpx;
				text-align: center;
				padding: 14rpx 26rpx 14rpx 26rpx;
				background: #EBF0F6;
				border-radius: 0rpx 10rpx 0rpx 10rpx;
				color: #2A7DFD;
				font-size: 24rpx;

				&.inTransit {
					color: #10B89B;
					background: #E7F8F5;
				}

				&.deliveried {
					color: #777777;
					background: #F2F2F2;
				}
			}

			.sensors {
				width: 100%;
				display: flex;
				flex-wrap: wrap;
				font-size: $fontSmall;

				.text {
					width: auto;
					margin-right: 30rpx;
				}

				.normal {
					color: $normal-color;
				}

				.abnormal {
					color: $abnormal-color;
				}

				.offLine {
					color: $offLine-color;
				}
			}

			.but-transport {
				height: 65rpx;
				background: #FFFFFF;
				border: 2rpx solid #CBA575;
				border-radius: 30rpx;
				line-height: 60rpx;
				font-size: 28rpx;
				font-weight: 500;
				color: #CBA575;
				position: absolute;
				text-align: center;
				bottom: 20rpx;
				right: 20rpx;
			}
		}
	}

	.all-send {
		width: 100%;
		position: fixed;
		bottom: 134rpx;
		background: #FFFFFF;
		padding: 20rpx 0 20rpx 32rpx;
		color: #777777;

		.primary {
			height: 80rpx;
			margin: 0;
			margin-right: 64rpx;
			line-height: 80rpx;
		}
	}
</style>
