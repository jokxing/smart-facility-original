<!-- 消息通知 -->
<template>
	<view class="news-inform">
		<view class="flex-top">
			<tab :list="list" :statisticalVO="statisticalVO" :isActive.sync="isActive" @change="handleTab"></tab>
		</view>
		<view class="onekey">
			<button class="button" @click="handleOnekeyRead">
				<uni-icons custom-prefix="iconfont" type="icon-qingchu" size="16" color="#D9B480"></uni-icons>
				{{$t('home.oneKeyRead')}}
			</button>
			<button class="button" @click="handleOnekeyClean">
				<uni-icons custom-prefix="iconfont" type="icon-delete" size="16" color="#D9B480"></uni-icons>
				{{$t('home.oneKeyClear')}}
			</button>
		</view>
		<view class="news-inform-content content-padding">
			<view v-if="dataList.length">
				<block v-for="item in dataList" :key="item.id">
					<AssetInformList :isShow="isActive" :item="item" @handle="handleToDetail(item)"></AssetInformList>
				</block>
			</view>
			<view v-else class="empty">
				{{$t('common.noData')}}……
			</view>
		</view>
		<uni-load-more v-if="isList && dataList.length" :status="moreStatus"></uni-load-more>
		<view class="details-popup">
			<uni-popup class="popup" ref="inputDialog" type="bottom" background-color="#fff">
				<view class="title">
					<uni-title type="h3" :title="$t('home.addressAdjust')"></uni-title>
				</view>
				<uni-forms class="formW" ref="form" labelWidth="120px">
					<uni-forms-item :label="$t('home.isAddressAdjust')" required>
						<picker class="popup-picker w95" @change="removeChange" :value="form.status" :range-key="index"
							:range="range">
							<view class="uni-input">{{range[form.status]}}</view>
						</picker>
					</uni-forms-item>
					<uni-forms-item v-if="isShowRemove" :label="$t('home.moveAddressAdjust')" required>
						<picker class="popup-picker w95" @change="bindPickerChange" :value="roomIndex"
							:range-key="'name'" :range="rooms">
							<view class="uni-input">{{rooms[roomIndex].name}}</view>
						</picker>
					</uni-forms-item>
					<uni-forms-item :label="$t('home.describe')">
						<textarea class="w95 texta" v-model="formData.remark"></textarea>
					</uni-forms-item>
				</uni-forms>
				<view class="footer">
					<uni-row>
						<uni-col :span="11">
							<button type="default" class="button-cancel" @click="close">{{$t('common.cancel')}}</button>
						</uni-col>
						<uni-col :span="11" :push="2">
							<button class="button-primary" @click="submit()">{{$t('common.confirm')}}</button>
						</uni-col>
					</uni-row>
				</view>
			</uni-popup>
		</view>
		<Toast ref="toast"></Toast>
	</view>
</template>

<script>
	import Toast from "@/components/Toast/index.vue"
	import Tab from "@/homePage/components/Tab/Tab.vue";
	import {
		getNotifyMessageQuery,
		getNotifyMessageRead,
		getPropertyNoReadCount,
		getPropertyUnusualMsg,
		getPropertyUnusualMsgRead,
		getRoomPositionRoomList,
		postPropertyUnusualMsgIgnore,
		postPropertyPositionChange,
		getMessageRead,
		getMessageClean
	} from "../../utils/api.js"
	import AssetInformList from "@/homePage/components/AssetInformList/AssetInformList.vue"
	export default {
		components: {
			Tab,
			AssetInformList,
			Toast
		},
		data() {
			const _this = this;
			return {
				list: [{
						lable: 1,
						text: _this.$t('home.assetMessage'),
						prop: "propertyCount"
					},
					{
						lable: 3,
						text: _this.$t('home.moveMessage'),
						prop: "propertyNoReadCount"
					},
					{
						lable: 0,
						text: _this.$t('home.alarmMessage'),
						prop: "alarmCount"
					},
					{
						lable: 2,
						text: _this.$t('home.systemMessage'),
						prop: "sysCount"
					},
				],
				isActive: 1,
				items: {
					currentPage: 1,
					pageSize: 10,
					read: "",
					sorter: "",
					types: 1
				},
				total: 0,
				loading: 0,
				moreStatus: "no-more",
				isList: false,
				dataList: [],
				set: "",
				statisticalVO: {
					alarmCount: 0,
					propertyCount: 0,
					sysCount: 0,
					propertyNoReadCount: 0
				},
				keyword: "",
				status: 1,
				form: {
					status: 1,
					roomId: "",
					roomName: "",
					msgIdList: []
				},
				range: [_this.$t('other.no'), _this.$t('other.yes')],
				rooms: [],
				roomIndex: 0,
				isShowRemove: false
			};
		},
		onShow() {
			this.items.currentPage = 1;
			this.dataList = [];
			this.isList = false;
			this.handleGetNotifyList();
			uni.setNavigationBarTitle({
				title: this.$t('home.messageCenter')
			});
		},
		onPullDownRefresh() {
			this.items.currentPage = 1;
			this.dataList = [];
			this.isList = false;
			if (this.isActive == 3) {
				this.handlePropertyUnusual();
			} else {
				this.handleGetNotifyList();
			}

		},
		onReachBottom() {
			if (this.items.currentPage * this.items.pageSize < this.total) {
				this.items.currentPage += 1;
				this.moreStatus = "loading";
				if (this.isActive == 3) {
					this.handlePropertyUnusual()
				} else {
					this.handleGetNotifyList();
				}

				const _this = this;
				this.set = setInterval(function() {
					if (_this.loading === 1) {
						_this.loading = 0;
						clearInterval(_this.set);
						uni.hideLoading();
					}
				}, 100)
			} else {
				this.moreStatus = "no-more"
			}
		},
		methods: {
			submit() {
				if (this.form.status) {
					delete this.form.roomId;
					delete this.form.roomName;
					delete this.form.status;
					postPropertyUnusualMsgIgnore(this.form).then(res => {
						this.loading = false;
						if (res.code) {
							this.close();
							this.handlePropertyUnusual()
							uni.showToast({
								title: this.$t('common.editSuccess'),
								icon: "success",
								duration: 1500
							});
						} else {
							uni.showToast({
								title: res.message,
								icon: "error",
								duration: 1500
							})
						}
					})
				} else {
					delete this.form.status;
					if (this.form.roomId) {
						this.rooms.map((item) => {
							if (item.id === this.form.roomId) {
								this.form.roomName = item.name + item.gatewayName
							}
						})
					}
					postPropertyPositionChange(this.form).then(res => {
						this.loading = false;
						if (res.code) {
							this.close();
							this.handlePropertyUnusual();
							uni.showToast({
								title: this.$t('common.updateSuccess'),
								icon: "success",
								duration: 1500
							});
						} else {
							uni.showToast({
								title: res.message,
								icon: "error",
								duration: 1500
							})
						}
					})
				}
			},
			removeChange(e) {
				console.log(e);
				this.form.status = e.detail.value * 1;
				this.isShowRemove = e.detail.value == 0;
			},
			close() {
				this.$refs.inputDialog.close();
			},
			bindPickerChange(e) {
				console.log(e);
				this.form.roomId = this.rooms[e.detail.value * 1].id;
				this.form.roomName = this.rooms[e.detail.value * 1].name;
				console.log(this.form);
			},
			handleTab(value) {
				this.isActive = value;
				this.items.types = value;
				this.dataList = [];
				this.items.currentPage = 1;
				if (value == 3) {
					this.handlePropertyUnusual();
				} else {
					this.handleGetNotifyList();
				}


			},
			handleGetNotifyList() {
				uni.showLoading();
				getNotifyMessageQuery(this.items).then(res => {
					uni.hideLoading();
					uni.stopPullDownRefresh();
					this.loading++;
					if (res.code === 1 && res.items) {
						this.isList = true;
						if (res.items.list.length === 0) {
							this.dataList = [];
						} else {
							this.dataList = this.dataList.concat(...res.items.list);
							this.total = res.items.total;
						}
						if (res.items.statisticalVO) {
							this.statisticalVO.alarmCount = res.items.statisticalVO.alarmCount;
							this.statisticalVO.sysCount = res.items.statisticalVO.sysCount;
							this.statisticalVO.propertyCount = res.items.statisticalVO.propertyCount;
						}
						getPropertyNoReadCount().then(result => {
							if (result.code === 1) {
								this.statisticalVO.propertyNoReadCount = result.items;
							}
						});
						if (this.items.currentPage * this.items.pageSize > this.total) {
							this.moreStatus = "no-more"
						} else {
							this.moreStatus = "more";
						}
					} else {
						this.$refs.toast.open(res.message, "error")
					}
				}).catch(e => {
					console.log(e);
					uni.hideLoading()
				})
			},
			handlePropertyUnusual() {
				this.loading = true;
				getPropertyUnusualMsg({
					keyword: this.keyword,
					pageSize: this.items.pageSize,
					pageNum: this.items.currentPage,
					status: null
				}).then(res => {
					this.loading = false;
					if (res.code) {
						this.dataList = this.dataList.concat(...res.items.list);
						this.total = res.items.total;
						if (this.items.currentPage * this.items.pageSize > this.total) {
							this.moreStatus = "no-more"
						} else {
							this.moreStatus = "more";
						}
					}
					uni.stopPullDownRefresh()
				})
			},
			handleGetPropertyNoReadCount() {
				getPropertyNoReadCount().then(res => {
					if (res.code) {

						this.statisticalVO.propertyNoReadCount = res.items;
						console.log(this.statisticalVO);
					}
				})
			},
			handleToDetail(items) {
				console.log(items);
				if (this.items.types === 3) {
					uni.showToast({title: '资产异动处理尚未开放', icon: 'none'});
					return
				}
				if (this.items.types == 1) {
					getNotifyMessageRead({
						id: items.id
					}).then(res => {});
					uni.showToast({title: '资产消息演示尚未开放', icon: 'none'});
					return
				}
				if (this.items.types == 0) {
					getNotifyMessageRead({
						id: items.id
					}).then(res => {});
					if (Number(items.objType) === 3) {
						uni.navigateTo({
							url: "/detailPage/RoomDetail/index?id=" + items.objId
						});
					} else {
						uni.navigateTo({
							url: "/detailPage/LabdeviceDetail/index?id=" + (items.objId || 970008)
						});
					}
					return
				}

			},
			handleOnekeyRead(){
				getMessageRead({type: this.isActive}).then(res => {
					if (res.code === 1) {
						uni.showToast({
							icon: "success",
							duration: 1500
						});
						this.handleGetNotifyList();
						
					} else {
						uni.showToast({
							icon: "error",
							duration: 1500
						})
					}
				})
			},
			handleOnekeyClean() {
				getMessageClean({type: this.isActive}).then(res => {
					if (res.code === 1) {
						uni.showToast({
							icon: "success",
							duration: 1500
						});
						this.handleGetNotifyList();
						
					} else {
						uni.showToast({
							icon: "error",
							duration: 1500
						})
					}
				})
			},
			dialogInputConfirm() {}
		}
	}
</script>

<style lang="scss" scoped>
	.news-inform{
		.content-padding{
			padding: 20rpx 24rpx;
			margin-top: 0;
		}
		.onekey{
			display: flex;
			justify-content: flex-end;
			margin-top: 100rpx;
			margin-right: 24rpx;
			.button{
				width: 180rpx;
				padding: 0 10rpx;
				height: 60rpx;
				line-height: 50rpx;
				font-size: 26rpx;
				background-color: #fff;
				border: 1px $primary solid;
				color: $primary;
				margin: 0;
				border-radius: 30rpx;
				&:first-child{
					margin-right: 20rpx;
				}
				&::after{
					border: none;
				}
			}
		}
	}
	.picker {
		width: 100%;
		height: 100rpx;
	}

	.formW {
		margin: 0 40rpx;
	}

	.w95 {
		width: 500rpx !important;
	}
	::v-deep.uni-forms-item__content {
		width: 500rpx !important;
	}
	.texta {
		height: 80rpx;
		border-radius: 4px;
		padding: 8px;
		background-color: #F5F5F5;
		color: #333;
	}
	::v-deep .uni-forms-item {
		margin: 0 40rpx;
	}
	.footer {
		margin-left: 40rpx;
		margin-right: 40rpx;
	}
</style>
