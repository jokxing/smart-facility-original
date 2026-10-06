<template>
	<view class="pipetteGun-detail homeSubpage-detail">
		<Information :detail="detail"></Information>
		
		<view class="other-services latestStatus">
			<view class="top">
				<text class="text">{{$t('labDevice.otherServe')}}</text>
			</view>
			<uni-row>
				<uni-col :span="6">
					<button class="button" type="primary" plain="true" @click="goTakeGun">{{$t('labDevice.getGun')}}</button>
				</uni-col>
				<uni-col :span="14" :offset="1">
					<view class="voice-picker">
						<button class="button" type="primary" plain="true">{{$t('labDevice.qrcodeGetGunHint')}}</button>
						<picker
							class="popup-picker" 
							@change="handleVoiceSet" 
							:value="voiceIndex" 
							:range="broadcast" 
							:range-key="'name'">
							<text>{{ broadcast[voiceIndex].name }}</text>
							<uni-icons type="bottom" size="16" color="#cccccc"></uni-icons>
						</picker>
					</view>
				</uni-col>
			</uni-row>
		</view>
		
		<!-- 枪位列表：空枪位不是移液枪实体 -->
		<view class="gun-list">
			<uni-title type="h4" :title="$t('labDevice.gun')"></uni-title>
			<view class="list cardCommon">
				<uni-card
					v-for="item in gunList"
					:key="item.id"
					:title="item.name ? item.name : '空枪位'"
					:border="false"
					shadow="0px 1px 6px 0px rgba(51, 51, 51, 0.04)"
					:extra="item.no === 'null' ? '' : statusText(item.homingStatus, GUNSTATUS)"
					:class="item.no === 'null' ? '' : handleStatusClass(item.homingStatus).class"
					@click="goGun(item)">
					<uni-row>
						<uni-col :span="24">{{$t('labDevice.no')}}：<text>{{ item.no === 'null' ? '-' : item.no }}</text></uni-col>
						<uni-col :span="24">枪位：<text>{{ item.detent }}</text></uni-col>
					</uni-row>
				</uni-card>
			</view>
		</view>
		
		<uni-load-more :status="moreStatus" v-show="isList" style="margin-bottom: 60rpx;"></uni-load-more>
		<Toast ref="toast"></Toast>
	</view>
</template>

<script>
	import Information from "./common/Information.vue";
	import Toast from '@/components/Toast/index.vue';
	import { Base64 } from "@/utils/base64.js";
	import { getDeviceDetail, postGunPipetteBindingList, postDeviceOpenGunRemind } from "@/utils/api.js";
	import { statusText,statusColor } from "@/utils/methods.js";
	import { GUNSTATUS, BROADCAST } from "@/utils/constant.js"
	export default{
		components: {
			Information,
			Toast
		},
		data() {
			return{
				statusText,
				GUNSTATUS,
				broadcast: BROADCAST,
				voiceIndex: 1,
				voiceNum: null,
				voiceArr: [
					{
						no: "",
						voiceNum: 0,
					}
				],
				visible: false,
				gunRackId: null,
				deviceId: null,
				detail: "",
				pageNum: 1,
				pageSize: 10,
				total: 0,
				gunList: [],
				loadingNum: 0,
				set: null,
				// 加载更多
				moreStatus: "no-more",
				isList: false,
			}
		},
		onLoad(options) {
			this.gunRackId = options.id;
			var base64 = new Base64()
			this.deviceId = base64.encode(options.id)
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: this.$t('route.pipetteGunRackDetail')
			});
		},
		onReady() {
			this.handleDetail()
		},
		onPullDownRefresh() {
			this.handleDetail()
		},
		onReachBottom(){
			if(this.pageNum * this.pageSize < this.total){
				this.pageNum++;
				this.moreStatus = "loading";
				this.gunBindingList();
			}else{
				this.moreStatus = "no-more"
			}
		},
		methods: {
			// init(){
			// 	uni.showLoading({
			// 		title: '加载中',
			// 		mask: true
			// 	});
			// 	this.handleDetail();
			// 	this.gunBindingList();
			// 	var _this = this;
			// 	this.set = setInterval(function(){
			// 		if(_this.loadingNum === 2){
			// 			_this.loadingNum = 0;
			// 			clearInterval(_this.set);
			// 			uni.hideLoading();
			// 			uni.stopPullDownRefresh()
			// 		}
			// 	}, 100)
			// },
			handleDetail() {
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				this.pageNum = 1;
				this.gunList = [];
				getDeviceDetail({deviceId: this.deviceId}).then(res => {
					if(res.code === 1){
						this.detail = res.items;
						this.voiceArr[0].no = res.items.no;
						if(res.items.broadcastNum === 0){
							this.voiceIndex = 2
						}else if(res.items.broadcastNum === 1){
							this.voiceIndex = 0
						}else{
							this.voiceIndex = 1
						}
						uni.setNavigationBarTitle({
							title: res.items.name
						});
					}
					this.gunBindingList();
					uni.hideLoading();
					uni.stopPullDownRefresh()
				})
			},
			gunBindingList(){
				var data = {
					gunRackId: this.gunRackId,
					pageNum: this.pageNum,
					pageSize: this.pageSize
				}
				postGunPipetteBindingList(data).then(res => {
					this.loadingNum++;
					if(res.code === 1){
						if (this.pageNum === 1) {
							this.gunList = res.items.list;
						} else {
							this.gunList = this.gunList.concat(res.items.list);
						}
						this.total = res.items.total;
						
						this.isList = true;
						if(this.pageNum * this.pageSize > this.total){
							this.moreStatus = "no-more"
						}else{
							this.moreStatus = "more";
						}
					}
				})
			},
			handleStatusClass(status) {
				return statusColor(status, GUNSTATUS)
			},
			goTakeGun() {
				uni.navigateTo({
					url: "/detailPage/PipetteGunRackDetail/common/TakeGun?id=" + this.gunRackId
				})
			},
			goGun(item) {
				if (!item.pipetteGunId || item.no === 'null') return;
				uni.navigateTo({
					url: '/detailPage/PipetteGunDetail/index?title=' + item.name + '&id=' + item.pipetteGunId + '&no=' + item.no
				})
			},
			// 播报设置
			handleVoiceSet(e) {
				this.voiceIndex = e.target.value;
				this.voiceArr[0].voiceNum = this.broadcast[e.target.value].num;
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				postDeviceOpenGunRemind(this.voiceArr).then(res => {
					if(res.code){
						if(res.code === 1){
							this.$refs.toast.open(this.$t('labDevice.systemSuccess'),"success");
						}else{
							this.$refs.toast.open(res.message,"error")
						}
					}else{
						this.$refs.toast.open(res.message,"error")
					}
					uni.hideLoading();
				})
			}
		},
		onHide(){
			clearInterval(this.set);
			this.set = null
		}
	}
</script>

<style scoped lang="scss">
	@import 'PipetteGunRackDetail.scss';
	@import '@/style/css/homeSubpageDetail.scss';
</style>