<template>
	<view class="labdevice">
		<view style="padding-top: 20rpx;">
			<uni-search-bar
				class="search"
				:placeholder="$t('labDevice.inputGunNameOrNo')"
				v-model="keyword"
				@confirm="handleSearch" 
				@clear="handleSearchClear"
				bgColor="#fff"
				:cancelText="$t('common.cancel')"
				radius="20">
			</uni-search-bar>
		</view>
		
		<view class="tab-box">
			<view 
				class="demo-uni-col" v-for="(item,index) in gunTab" 
				:key="index" 
				:class="{active: item.status === gunStatus}"
				style="padding: 0 12rpx;"
				@click="handleStatus(item.status)">
				<text class="text">{{ item.text }}</text>
				<view class="num" :class="item.class">
					{{ item.num || 0 }}
				</view>
			</view>
		</view>
		
		<view class="list cardCommon">
			<PipetteGunCard v-for="item in list" :key="item.pipetteGunId" :item="item"></PipetteGunCard>
		</view>
		
		<uni-load-more :status="moreStatus" v-show="isList"></uni-load-more>
	</view>
</template>

<script>
	import PipetteGunCard from "@/components/PipetteGunCard/index.vue";
	import { postGunPipetteList, postGunPipetteStatistics } from '@/utils/api.js';
	import { GUNSTATUS } from '@/utils/constant.js';
	import { statusColor, statusText } from '@/utils/methods.js';
	import columns from"./columns.js";
	export default{
		components: {
			PipetteGunCard
		},
		data() {
			const _this = this;
			return {
				GUNSTATUS,
				statusText,
				statusColor,
				keyword: "",
				// 枪状态
				gunTab: [
					{
						text: _this.$t('common.all'),
						status: 'all',
						num: 0,
						class: "total"
					},
					{
						text: GUNSTATUS[0].label,
						status: GUNSTATUS[0].code,
						num: 0,
						class: GUNSTATUS[0].value
					},
					{
						text: GUNSTATUS[1].label,
						status: GUNSTATUS[1].code,
						num: 0,
						class: GUNSTATUS[1].value
					},
					{
						text: GUNSTATUS[2].label,
						status: GUNSTATUS[2].code,
						num: 0,
						class: GUNSTATUS[2].value
					},
				],
				gunStatus: 'all',
				// 列表
				list: [],
				// 分页
				pageNum: 1,
				pageSize: 10,
				total: 0,
				// 加载更多
				moreStatus: "no-more",
				isList: false,
				// 定时器清除loading
				loadingNum: 0,
				set: null
			}
		},
		created() {
			columns.assign(this);
		},
		mounted() {
			this.bootstrap();
		},
		onReady() {
			this.bootstrap();
		},
		methods: {
			bootstrap() {
				if (this._booted) return;
				this._booted = true;
				columns.assign(this);
				this.init();
			},
			init() {
				this.handleLoading(2);
				this.getStatistics();
				this.getList();
			},
			getStatistics() {
				postGunPipetteStatistics().then(res => {
					this.loadingNum++;
					if(res.code === 1){
						this.gunTab[0].num = res.items.totalNum;
						this.gunTab[1].num = res.items.noHomingNum;
						this.gunTab[2].num = res.items.homingNum;
						this.gunTab[3].num = res.items.errorHomingNum;
					}
				})
			},
			getList() {
				var data = {
					pageNum: this.pageNum,
					pageSize: this.pageSize,
					// 全部使用明确的视图键，接口仍以 null 表示不限状态。
					status: this.gunStatus === 'all' ? null : this.gunStatus,
					keyword: this.keyword
				}
				postGunPipetteList(data).then(res => {
					this.loadingNum++;
					if(res.code === 1){
						if (this.pageNum === 1) {
							this.list = res.items.list;
						} else {
							this.list = this.list.concat(res.items.list);
						}
						this.total = res.items.total;
						this.handleMore()
					}
				})
			},
			// 搜索
			handleSearch() {
				this.pageNum = 1;
				this.pageSize = 10;
				this.list = [];
				this.handleLoading(1);
				this.getList()
			},
			handleSearchClear() {
				this.keyword = "";
				this.handleSearch();
			},
			// 状态
			handleStatus(status){
				this.gunStatus = status;
				this.pageNum = 1;
				this.pageSize = 10;
				this.list = [];
				this.handleLoading(1);
				this.getList()
			},
			goDetail(item){
				uni.navigateTo({
					url: '/detailPage/PipetteGunDetail/index?title=' + item.name + '&id=' + item.pipetteGunId + '&no=' + item.no
				})
			},
			handlePullDownRefresh() {
				this.pageNum = 1;
				this.pageSize = 10;
				this.list = [];
				this.isList = false;
				this.init()
			},
			handleReachBottom() {
				if(this.pageNum * this.pageSize < this.total){
					this.pageNum++;
					this.moreStatus = "loading";
					this.handleLoading(1);
					this.getList();
				}else{
					this.moreStatus = "no-more"
				}
			}
		}
	}
</script>

<style scoped lang="scss">
	@import "./Labdevice.scss";
	@import "../../../style/css/tab.scss";
</style>
