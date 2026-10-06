<template>
	<view class="asset-tag-bind">
		<uni-search-bar :radius="100" cancelButton="none" bgColor="#fff" :placeholder="$t('labDevice.inputLabDeviceNameOrNo')" v-model="keyword" @input="search">
			<uni-icons slot="searchIcon" color="#D6AE7B" size="18" type="search" />
		</uni-search-bar>
		
		<view class="list" v-for="item in list" :key="item.id">
			<view class="img-box">
				<view 
					class="pic"
					:style="{
						backgroundImage: `url(${ item.logoUrl ? 
						  (BASE_URL + item.logoUrl) : ''
						}) `,
					}">
				</view>
			</view>
			<view class="text">
				<text class="name">{{ item.name }}</text>
				<text class="no">{{ item.no }}</text>
			</view>
			<text class="bind" :class="item.labelId ? 'grey' : 'golden'" @click="handleBingd(item.id)">{{ item.labelId ? $t('labDevice.isbind') : $t('labDevice.bind') }}</text>
		</view>
		
		<uni-load-more :status="moreStatus" v-show="isList"></uni-load-more>
		
		<Toast ref="toast"></Toast>
		
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
	import Toast from '@/components/Toast/index.vue'
	import { getInstrumentBindingList, getInstrumentBinding } from "@/utils/api.js";
	import { BASE_URL } from '@/utils/constant.js'
	export default{
		components: {
			Toast
		},
		data(){
			return{
				BASE_URL,
				keyword: "",
				list: [],
				labelId: null,
				// 分页
				pageNum: 1,
				pageSize: 10,
				total: 0,
				// 加载更多
				moreStatus: "no-more",
				isList: false,
				// 
				isError: true,
				errorText: "",
			}
		},
		onLoad(options) {
			this.labelId = options.labelId
		},
		onReady() {
			this.init()
		},
		onPullDownRefresh() {
			this.pageNum = 1;
			this.pageSize = 10;
			this.list = [];
			this.isList = false;
			this.init();
		},
		onReachBottom(){
			if(this.pageNum * this.pageSize < this.total){
				this.pageNum++;
				this.moreStatus = "loading";
				this.init();
			}else{
				this.moreStatus = "no-more"
			}
		},
		methods: {
			init() {
				var data = {
					keyword: this.keyword,
					pageNum: this.pageNum,
					pageSize: this.pageSize
				}
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				getInstrumentBindingList(data).then(res => {
					if(res.code === 1){
						this.isList = true;
						var list = res.items.list;
						for(var i = 0; i < list.length; i++){
							this.list.push(list[i]);
						}
						this.total = res.items.total;
						if(this.pageNum * this.pageSize > this.total){
							this.moreStatus = "no-more"
						}else{
							this.moreStatus = "more";
						}
					};
					uni.hideLoading();
					uni.stopPullDownRefresh();
				})
			},
			search() {
				this.pageNum = 1;
				this.pageSize = 10;
				this.list = [];
				this.isList = false;
				this.init();
			},
			handleBingd(id) {
				var data = {
					instrumentId: id,
					labelId: this.labelId
				};
				var _this = this;
				getInstrumentBinding(data).then(res => {
					if(res.code){
						if(res.code === 1){
							_this.isError = false;
							_this.$refs.bindPopup.open("center")
							setTimeout(() => {
								_this.$refs.bindPopup.close();
								uni.navigateTo({
									url: res.items
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
							// this.$refs.toast.open(res.message,"error");
						}
					}else{
						_this.isError = true;
						_this.errorText = res.message;
						_this.$refs.bindPopup.open("center");
						setTimeout(() => {
							_this.$refs.bindPopup.close();
							_this.errorText = "";
						},3000)
						// this.$refs.toast.open(res.message,"error");
					}
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	.asset-tag-bind{
		::v-deep .uni-searchbar__box{
			box-shadow: 0px 1px 4px 0px rgba(51,51,51,0.0600);
			margin-bottom: 30rpx;
		}
		.list{
			margin: 0 24rpx 20rpx;
			padding: 20rpx;
			border-radius: 10rpx;
			background-color: #fff;
			display: flex;
			align-items: center;
			.img-box{
				width: 160rpx;
				height: 120rpx;
				background-color: #F5F5F5;
				border-radius: 10rpx;
				margin-right: 40rpx;
				.pic{
					width: 100%;
					height: 100%;
					// background-image: url("../../../static/images/abnormal.png");
					background-repeat: no-repeat;
					background-size: 60% auto;
					background-position: center;
				}
			}
			.text{
				.name{
					font-size: 32rpx;
					color: #333;
					margin-bottom: 16rpx;
					font-weight: bold;
					display: block;
				}
				.no{
					width: 340rpx;
					font-size: 28rpx;
					color: #666;
					display: block;
					overflow: hidden;
					text-overflow:ellipsis;
					white-space: nowrap;
				}
			}
			.bind{
				width: 100rpx;
				height: 50rpx;
				border-radius: 24rpx;
				line-height: 50rpx;
				font-size: 26rpx;
				text-align: center;
				margin-left: auto;
				&.golden{
					color: $golden;
					background-color: $bgGolden;
				}
				&.grey{
					color: #999;
					background-color: #eee;
				}
			}
		}
	}
</style>