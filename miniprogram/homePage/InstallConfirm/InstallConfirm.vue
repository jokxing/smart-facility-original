<!-- 安装确认 -->
<template>
	<view class="install-confirm content-padding">
		<view class="install-list">
			<view class="install-list-lable">{{$t('home.applyUserName')}}</view>
			<view>{{form.applyUserName}}</view>
		</view>
		<view class="install-list">
			<view class="install-list-lable">{{$t('home.applyDate')}}</view>
			<view>{{form.applyDate | forDateTime}}</view>
		</view>
		<view class="install-list">
			<view class="install-list-lable">{{$t('home.procOrderNo')}}</view>
			<view>{{form.procOrderNo}}</view>
		</view>
		<view v-if="task.expandFields">
			<view class="install-list" v-if="task.expandFields['measurementDateShow'] === 1">
				<view class="install-list-lable">{{$t('home.measurementDate')}}</view>
				<view class="example-body" v-if="task.expandFields['measurementDateEdit'] === 1">
					<uni-datetime-picker type="date" v-model="task.expandFields.measurementDate"
						@change="changeLog" />
				</view>
				<view class="" v-else>
					{{task.expandFields.measurementDate}}
				</view>
			</view>
			<view class="install-list" v-if="task.expandFields['sOPSituationReportShow'] === 1">
				<view class="install-list-lable">{{$t('home.sOPSituationReport')}}</view>
				<view v-if="task.finished !== 0" class="accessory">
					{{ task.expandFields.sOPSituationReport ? task.expandFields.sOPSituationReport : "-"}}
				</view>
				<view v-else-if="task.finished == 0 && task.expandFields.sOPSituationReport" class="flex-between">
					<view class="accessory">
						{{ task.expandFields.sOPSituationReport}}
					</view>
					<view v-if="task.expandFields.sOPSituationReportEdit == 1" style="color: #D6AE7B;" @tap="handleSop(3)">
						{{$t('home.resetUpload')}}
					</view>
				</view>
				<view v-else-if="task.finished == 0 && !task.expandFields.sOPSituationReport" style="color: #D6AE7B;" @click="handleSop(3)">
					{{  task.expandFields['sOPSituationReportEdit'] ===1 ? $t('home.clickUpload') : "-"}}
				</view>

			</view>
			<view class="install-list" v-if="task.expandFields['accessoryUrlShow'] === 1">
				<view class="install-list-lable">{{$t('home.accessoryUrl')}}</view>
				<view v-if="task.finished !== 0" class="accessory">
					{{ task.expandFields.accessoryUrl ? task.expandFields.accessoryUrl : "-"}}
				</view>
				<view v-else-if="task.finished == 0 && task.expandFields.accessoryUrl" class="flex-between">
					<view class="accessory">
						{{ task.expandFields.accessoryUrl}}
					</view>
					<view v-if="task.expandFields.accessoryUrlEdit == 1" style="color: #D6AE7B;font-size: 24rpx;" @tap="handleSop(5)">
						{{$t('home.resetUpload')}}
					</view>
				</view>
				<view v-else-if="task.finished == 0 && !task.expandFields.accessoryUrlEdit" style="color: #D6AE7B;" @click="handleSop(5)">
					{{  task.expandFields['accessoryUrlEdit'] ===1 ? $t('home.clickUpload') : "-"}}
				</view>
			</view>
			<view class="install-list" v-if="task.expandFields['remarksShow'] == 1">
				<view class="install-list-lable">{{$t('home.remarks')}}</view>
				<view v-if="task.expandFields['remarksEdit'] !== 1 || task.finished !== 0">{{task.expandFields.remarks}}</view>
				<uni-easyinput v-else trim="all" v-model="task.expandFields.remarks" :placeholder="$t('common.input')"></uni-easyinput>
			</view>
		</view>

		<view class="infrom-asset">
			<view class="h2-title">{{$t('home.assetInform')}}({{assetList.length}})</view>
			<block v-for="item in assetList" :key="item.instrumentNo">
				<AssetCard :items="item"></AssetCard>
			</block>
		</view>
		<view class="h2-title">{{$t('home.setUp')}}</view>
		<view class="step">
			<view class="step-line-one" v-for="item in taskList" :key="item.id">
				<view class="step-bar">
					<uni-icons :class="item.finished == 1 ? 'step-bar-dot' : 'set-bar-hui'"
						:color="item.finished== 1 ? '#28B78D': ''" type="checkbox-filled" size="24"></uni-icons>
					<view class="step-bar-line" v-if="item.finished == 1"></view>
				</view>
				<view class="step-content">
					<view class="step-content-title">
						<span>{{ item.auditStepName}}</span>
						<span class="audit">( {{item.auditType ? $t('home.countersign') : $t('home.orSign')}} )</span>
					</view>
					<view class="step-content-content" v-for="user in item.commentList" :key="user.userId">
						<span>{{ user.userName }}</span>
						<span v-if="item.auditType != -1"
							:style="{ 'color': item.finished == 1 ? '#1bd39e' : (item.finished == -1 ? '#ff4949' : '') }">{{ user.auditOpinion }}</span>
						<span>{{ user.message }}</span>
						<image style="height: 60rpx;transform: rotate(-90deg)" mode="heightFix" v-if="user.signatureUrl"
							:src="BASE_URL + user.signatureUrl"></image>
					</view>
				</view>
			</view>
		</view>

		<view class="bottom-tab" v-if="!task.finished">
			<tab :list="list" :color="'#B2704E'" @change="handleTab"></tab>
		</view>
		<Transfer ref="Transfer" @handle="init" />
	</view>
</template>

<script>
	import AssetCard from "@/homePage/components/AssetCard/AssetCard.vue"
	import Tab from "@/homePage/components/Tab/Tab.vue"
	import Transfer from "@/homePage/components/Transfer/Transfer.vue"
	import {
		postProcessOrderDetails,
		getQueryAssetInformation,
		postActivitiProcessOrderUpdate
	} from "@/utils/api.js"
	import {
		forDateTime,
		getFormData
	} from "@/utils/methods.js"
	import {
		BASE_URL
	} from "@/utils/constant.js"
	const flows = {
		1: "installationUrl",
		2: "useUrl",
		3: "sOPSituationReport",
		4: "responsibleUrl",
		5: "accessoryUrl"
	}
	export default {
		components: {
			AssetCard,
			Tab,
			Transfer
		},
		data() {
			const _this = this;
			return {
				BASE_URL,
				list: [{
						lable: 0,
						text: _this.$t('home.transfer')
					},
					{
						lable: 1,
						text: _this.$t('home.reject')
					},
					{
						lable: 2,
						text: _this.$t('home.consent')
					},
				],
				taskListStatus: {
					1: "已同意",
					"-1": "已驳回",
					0: "审批中",
					2: "已转办"
				},
				isActive: 0,
				signItem: 1,
				form: {},
				task: {},
				oss: {
					key: "",
					policy: "",
					OSSAccessKeyId: "",
					Success_Action_Status: 200,
					signature: "",
					callback: "",
					host: ""
				},
				assetList: [],
				key: "",
				items: {
					currentPage: 1,
					pageSize: 10,
					processOrderNo: ""
				},
				taskList: [],
				taskActive: 0
			}
		},
		onLoad: function(options) {
			this.items.processOrderNo = options.sourceId;
			this.init();
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: this.$t('route.installConfirm')
			});
		},
		onPullDownRefresh() {
			this.init();
		},
		watch:{
			'task.expandFields': {
				handler(newObj) {
					console.log(newObj);
				},
				deep: true
			}
		},
		methods: {
			changeLog(e) {
				console.log(e);
			},
			init() {
				this.handleDetail();
				this.handleAssetInformtion();
			},
			handleFlowShow(obj, value) {
				if (Object.prototype.toString.call(obj) === '[object Object]') {
					return obj.hasOwnProperty(value);
				}
			},
			handleAssetInformtion() {
				getQueryAssetInformation(this.items).then(res => {
					if (res.code) {
						this.assetList = res.items.list;
					}
					uni.stopPullDownRefresh()
				})
			},
			handleTab(value) {
				this.isActive = value;
				const formObj = {
					id: this.form.id,
					measurementDate: this.task.expandFields['measurementDate'] ?? "",
					sopsituationReport: this.task.expandFields['sOPSituationReport'] ?? "",
					accessoryUrl: this.task.expandFields['accessoryUrl'] ?? "",
					remarks: this.task.expandFields['remarks'] ?? ""
				}
				postActivitiProcessOrderUpdate(formObj).then(res => {
					if (res.code) {

					}
				})
				const obj = {
					processOrderNo: this.form.procOrderNo,
					taskId: this.task.taskId,
					modelNodeId: this.task.id,
					expValue: this.task.expandFields,
					meteringDate: this.form.meteringDate,
					requireComments: this.task.requireComments,
					requireSignature: this.task.requireSignature
				}
				this.$refs.Transfer.handleOpen(obj, value);
			},

			handleDetail() {
				uni.showLoading()
				postProcessOrderDetails({
					processOrderNo: this.items.processOrderNo
				}).then(res => {
					if (res.code) {
						const {
							processOrderHistory,
							task,
							taskList
						} = res.items;
						if (processOrderHistory['content']) {
							this.form = Object.assign(processOrderHistory, JSON.parse(processOrderHistory
							.content));
						}
						this.form = processOrderHistory;
						this.task = task;
						this.taskList = taskList;
						console.log(this.form, this.task);
						if (task.auditStepName == "计量验收") {
							this.key = "measurementUrl";
						}
					}
				}).finally(() => {
					uni.hideLoading();
				})
			},
			formatTime(value) {
				return forDateTime(value);
			},
			handleSop(value) {
				uni.showToast({title: '演示未开放文件上传', icon: 'none'});
				return;
				this.key = flows[value];
				getFormData("file").then(ossObj => {
					this.oss.key = ossObj.dir;
					this.oss.policy = ossObj.policy;
					this.oss.OSSAccessKeyId = ossObj.accessKey;
					this.oss.signature = ossObj.signature;
					this.oss.host = ossObj.host;
					this.oss.callback = ossObj.callback;
				});
				this.chooseMessageFile().then(res => {
					console.log(res);
					if (res.errMsg == "chooseMessageFile:ok") {
						const that = this;
						const pathObj = res.tempFiles[0];
						this.oss.key = this.oss.key + pathObj.name;
						uni.uploadFile({
							url: that.oss.host,
							filePath: pathObj.path,
							fileType: "file",
							name: "file",
							formData: that.oss,
							success: (uploadRes) => {
								if (uploadRes.statusCode == 200) {
									const obj = JSON.parse(uploadRes.data);
									that.task.expandFields[that.key] = obj.items.fileName;
									console.log(that.task.expandFields[that.key]);
									that.$forceUpdate()
									uni.showToast({
										title: that.$t('home.updateSuccess'),
										icon: "success",
										duration: 1000
									})
								} else {
									uni.showToast({
										title: that.$t('home.updateError'),
										icon: "error",
										duration: 1000
									})
								}
							}
						})
					}
				})
			},
			chooseMessageFile() {
				return new Promise((resolve, reject) => {
					wx.chooseMessageFile({
						count: 1,
						type: "file",
						success(res) {
							resolve(res)
						},
						fail(err) {
							console.log("选择文件错误 =====>", err)
							resolve(false)
						}
					})
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.step {
		background-color: #FFFFFF;
		padding: 40rpx 40rpx;
		border-radius: 10rpx;
	}

	.step-content {
		margin-left: 48rpx;

		&-title {
			font-weight: bold;
			color: #555555;

			.audit {
				font-size: 24rpx;
			}
		}

		&-content {
			margin: 10px 0;
			color: #b0b0b0;
		}
	}

	.step-bar {
		position: relative;
	}

	.step-bar-dot {
		border-radius: 50%;
		position: absolute;
		left: -10rpx;
		top: 3px;
		z-index: 3;
		color: #28B78D;
	}

	.set-bar-hui {
		border-radius: 50%;
		position: absolute;
		left: -10rpx;
		top: 3px;
		z-index: 3;
		color: #bbbbbb;
	}

	.step-bar-line {
		width: 3px;
		height: 260rpx;
		background-color: #EEEEEE;
		position: absolute;
		left: 10rpx;
		top: 7px;
	}

	.example-body {
		background-color: #fff;
	}

	.install-confirm {
		position: relative;
		padding-bottom: 180rpx;
	}

	.content-padding {
		margin-top: 0;
	}

	.install-list {
		display: flex;
		color: #777777;
		align-items: center;
		min-height: 120rpx;
		line-height: 120rpx;

		.install-list-lable {
			width: 30%;
			font-weight: 500;
			color: #555555;
			line-height: 1.5;
			margin-right: 40rpx;
			text-align: right;
		}
		.accessory {
			line-height: 1.5;
			font-size: 28rpx;
			width: 42vw;
			overflow: hidden;
			white-space: nowrap;
			// word-break: normal;
			text-overflow: ellipsis;
		}

		.sign-but {
			width: 180rpx;
			height: 60rpx;
			background: #FFFFFF;
			border: 2rpx solid #D6AE7B;
			border-radius: 30rpx;
			line-height: 60rpx;
			text-align: center;
			color: #D6AE7B;
		}
	}

	.infrom-asset {
		margin-bottom: 40rpx;
	}

	.bottom-tab {
		width: 100vw;
		height: 120rpx;
		padding-top: 20rpx;
		background: #FFFFFF;
		position: fixed;
		bottom: 0;
		left: 0;
		z-index: 10;
	}
</style>
