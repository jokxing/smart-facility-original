<!-- 待办事项 -->
<template>
	<view class="back-log">
		<view class="flex-top">
			<tab :list="list" :isActive.sync="isActive" @change="handleTab"></tab>
		</view>
		<view class="content-padding">
			<view v-if="isActive == 0">
				<view class="h2-title flex-between" @click="handleUnfold(-1)">
					<view>{{$t('my.notDispose')}}({{ statisticalVO.pendingCount }})</view>
					<view>
						<uni-icons color="#D6ae7b" :type="isPending ? 'bottom' : 'right'" size="24"></uni-icons>
					</view>
				</view>
				<view v-if="isPending">
					<block v-for="item in pendList" :key="item.procOrderNo">
						<BacklogList :items="item" @handle="handleGoFlow(item)"></BacklogList>
					</block>
				</view>
				<view class="h2-title flex-between" @click="handleUnfold(0)">
					<view>{{$t('home.aboutTimeOut')}}({{ statisticalVO.aboutTimeOut }})</view>
					<view>
						<uni-icons color="#D6ae7b" :type="isAbout ? 'bottom' : 'right'" size="24"></uni-icons>
					</view>
				</view>
				<view v-if="isAbout">
					<block v-for="item in aboutList" :key="item.procOrderNo">
						<BacklogList :items="item" @handle="handleGoFlow(item)"></BacklogList>
					</block>
				</view>
				<view class="h2-title flex-between" @click="handleUnfold(1)">
					<view>{{$t('home.timeOut')}}({{ statisticalVO.timeOut }})</view>
					<view>
						<uni-icons color="#D6ae7b" :type="isTimeOut ? 'bottom' : 'right'" size="24"></uni-icons>
					</view>
				</view>
				<view v-if="isTimeOut">
					<block v-for="item in timeOutList" :key="item.procOrderNo">
							<BacklogList :items="item" @handle="handleGoFlow(item)"></BacklogList>
					</block>
				</view>
			</view>
			<view v-else>
				<block v-for="item in activities" :key="item.procOrderNo">
					<BacklogList :items="item" @handle="handleGoFlow(item)"></BacklogList>
				</block>
			</view>
		</view>
		<uni-load-more v-if="isList && total" :status="moreStatus"></uni-load-more>
	</view>
</template>

<script>
	import Tab from "@/homePage/components/Tab/Tab.vue"
	import BacklogList from "@/homePage/components/backlogList/backlogList.vue"
	import {
		getActivitiTaskList,
		getActivitiTaskQuery
	} from "@/utils/api.js"
	export default {
		components: {
			Tab,
			BacklogList
		},
		data() {
			const _this = this;
			return {
				list: [{
						lable: 0,
						text: _this.$t('home.notDispose')
					},
					{
						lable: 1,
						text: _this.$t('my.disposed')
					},
					{
						lable: 2,
						text: _this.$t('home.myPlay')
					},
					{
						lable: 3,
						text:  _this.$t('home.ccMe')
					},
				],
				isActive: 0,
				activities: [],
				items: {
					type: 4,
					currentPage: 1,
					pageSize: 10,
					timeOptions: -1
				},
				statisticalVO: {
					aboutTimeOut: 0,
					pendingCount: 0,
					timeOut: 0
				},
				isPending: true,
				isAbout: false,
				isTimeOut: false,
				isList: false,
				pendList: [],
				aboutList: [],
				timeOutList: [],
				activitiItems: {
					currentPage: 1,
					pageSize: 10,
					taskStatus: 0, //  1 已处理，2 我申请的，3 抄送我的
					type: 4
				},
				total: 0,
				moreStatus: "no-more",
				loading: 0,
			};
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: this.$t('home.todoList')
			});
			this.items.currentPage = 1;
			this.activitiItems.currentPage = 1;
			if (this.isActive === 0) this.handleBackLogList();
			else this.handleGetTaskQuery();
		},
		onPullDownRefresh() {
			console.log(1);
			this.activitiItems.currentPage = 1;
			this.items.currentPage = 1;
			this.activitiItems.pageSize = 10;
			this.pendList = [];
			this.aboutList = [];
			this.timeOutList = [];
			if (this.isActive === 0) {
				
				this.handleBackLogList();
			} else {
				this.handleGetTaskQuery();
			}
		},
		onReachBottom() {
			if (this.items.currentPage * this.items.pageSize < this.total || this.activitiItems.currentPage * this
				.activitiItems.pageSize < this.total) {
				this.moreStatus = "loading";
				if (this.activitiItems.taskStatus) {
					this.activitiItems.currentPage += 1;
					this.handleGetTaskQuery();
				} else {
					this.items.currentPage += 1;
					this.handleBackLogList();
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
			handleTab(value) {
				this.isActive = value;
				if (value) {
					this.pendList = [];
					this.aboutList = [];
					this.timeOutList = [];
					this.activitiItems.taskStatus = value;
					this.activitiItems.currentPage = 1;
					this.handleGetTaskQuery();
				} else {
					this.items.currentPage = 1;
					this.handleBackLogList();
				}

			},
			// 点击展开超时、未超时、待处理
			handleUnfold(value) {
				this.items.timeOptions = value;
				this.items.currentPage = 1;
				switch (value) {
					case -1:
						this.isPending = !this.isPending;
						this.isAbout = false;
						this.isTimeOut = false;
						break
					case 0:
						this.isAbout = !this.isAbout;
						this.isTimeOut = false;
						this.isPending = false;
						break
					case 1:
						this.isTimeOut = !this.isTimeOut;
						this.isAbout = false;
						this.isPending = false;
						break;
				}
				this.handleBackLogList();
			},
			handleGetTaskQuery() {
				uni.showLoading()
				getActivitiTaskQuery(this.activitiItems).then(res => {
					uni.hideLoading();
					uni.stopPullDownRefresh();
					if (res.code === 1 && res.items) {
						var pack = res.items;
						var list = Array.isArray(pack) ? pack : (pack.list || []);
						this.activities = this.activitiItems.currentPage === 1 ? list : this.activities.concat(list);
						this.total = pack.total != null ? pack.total : list.length;
						this.isList = true;
						if (this.activitiItems.currentPage * this.activitiItems.pageSize >= this.total) {
							this.moreStatus = "no-more"
						} else {
							this.moreStatus = "more";
						}
					}
				}).catch(() => {
					uni.hideLoading();
					uni.stopPullDownRefresh();
				})
			},
			handleBackLogList() {
				uni.showLoading();
				getActivitiTaskList(this.items).then(res => {
					uni.hideLoading();
					uni.stopPullDownRefresh();
					if (res.code === 1 && res.items) {
						this.statisticalVO = res.items.statisticalVO || this.statisticalVO;
						this.total = res.items.total || 0;
						this.isList = true;
						var rows = res.items.list || [];
						if (this.items.currentPage === 1) {
							this.pendList = [];
							this.aboutList = [];
							this.timeOutList = [];
						}
						if (this.items.currentPage * this.items.pageSize >= this.total) {
							this.moreStatus = "no-more"
						} else {
							this.moreStatus = "more";
						}
						switch (this.items.timeOptions) {
							case -1:
								this.pendList = this.pendList.concat(rows);
								break
							case 0:
								this.aboutList = this.aboutList.concat(rows);
								break
							case 1:
								this.timeOutList = this.timeOutList.concat(rows);
								break;
						}
					}
				}).catch(() => {
					uni.hideLoading();
					uni.stopPullDownRefresh();
				})
			},
			handleGoFlow(item) {
				if (item && item.bizType === 'alarm') {
					if (Number(item.objType) === 2) {
						uni.navigateTo({
							url: '/detailPage/LabdeviceDetail/index?id=' + item.objId
						});
					} else if (Number(item.objType) === 3) {
						uni.navigateTo({
							url: '/detailPage/RoomDetail/index?id=' + item.objId
						});
					}
					return;
				}
				uni.showToast({title: '该审批流程演示尚未开放', icon: 'none'});
			}
		}
	}
</script>

<style lang="scss">

</style>
