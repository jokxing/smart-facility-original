<template>
	<view class="details-popup">
		<uni-popup
			ref="detailsPopup" 
			type="bottom" 
			background-color="#fff"
			class="popup">
				<view class="title">
					<uni-title type="h3" :title="$t('labDevice.detailMessage')"></uni-title>
					<uni-icons type="closeempty" size="14" color="#888888" @click="$refs.detailsPopup.close()"></uni-icons>
				</view>
				<view class="content">
					<uni-row>
						<uni-col :span="24">
							<text class="text">{{$t('labDevice.name')}}：<text class="right">{{ detail.name }}</text></text>
						</uni-col>
					</uni-row>
					<uni-row>
						<uni-col :span="24">
							<text class="text">{{$t('labDevice.no')}}：<text class="right">{{ detail.no || $t('labDevice.notData') }}</text></text>
						</uni-col>
					</uni-row>
					<uni-row>
						<uni-col :span="24">
							<text class="text">{{$t('other.createTime')}}：<text class="right">{{ $options.filters['forDateTime'](detail.createDate) || $t('labDevice.notData') }}</text></text>
						</uni-col>
					</uni-row>
					<uni-row>
						<uni-col :span="24">
							<text class="text">{{$t('home.owningDepartemnt')}}：<text class="right">{{ detail.departmentName || $t('labDevice.notData') }}</text></text>
						</uni-col>
					</uni-row>
					
					<template v-if="type === 2">
						<uni-row>
							<uni-col :span="24">
								<text class="text">
									{{$t('other.paramStatus')}}：
									<text
										class="right" 
										:class="handleClass(detail.bingStatus, MONITORSTATUS).class">
										{{ handleStatus(detail.bingStatus, MONITORSTATUS) }}
									</text>
								</text>
							</uni-col>
						</uni-row>
						<uni-row>
							<uni-col :span="24">
								<text class="text">
									{{$t('labDevice.runStatus')}}：
									<text
										class="right"
										:class="handleClass(detail.status, LABSTATUS).class">
										{{ handleStatus(detail.status, LABSTATUS) }}
									</text>
								</text>
							</uni-col>
						</uni-row>
						<uni-row>
							<uni-col :span="24">
								<text class="text">{{$t('labDevice.brandName')}}：<text class="right">{{ detail.brand || $t('labDevice.notData') }}</text></text>
							</uni-col>
						</uni-row>
						<uni-row>
							<uni-col :span="24">
								<text class="text">{{$t('other.model')}}：<text class="right">{{ detail.model || $t('labDevice.notData') }}</text></text>
							</uni-col>
						</uni-row>
						<uni-row>
							<uni-col :span="24">
								<text class="text">{{$t('other.buyDate')}}：<text class="right">{{ detail.buyDate || $t('labDevice.notData') }}</text></text>
							</uni-col>
						</uni-row>
						<uni-row>
							<uni-col :span="24">
								<text class="text">{{$t('other.nextMaintenanceDate')}}：<text class="right">{{ detail.nextMaintenanceDate || $t('labDevice.notData') }}</text></text>
							</uni-col>
						</uni-row>
						<uni-row>
							<uni-col :span="24">
								<text class="text">{{$t('labDevice.owningRoom')}}：<text class="right">{{ detail.roomName || $t('labDevice.notData') }}</text></text>
							</uni-col>
						</uni-row>
						<uni-row>
							<uni-col :span="24">
								<text class="text">{{$t('labDevice.lableNo')}}：<text class="right">{{ detail.labelNo || $t('labDevice.notData') }}</text></text>
							</uni-col>
						</uni-row>
						<uni-row>
							<uni-col :span="24">
								<text class="text" @click="handleUnbindLabel">{{$t('other.monitorStatus')}}：
									<text class="right">
										{{ handleStatus(detail.monitorStatus,ASSETTAGSTATUS) || $t('labDevice.notData') }}
										<text class="text-button" v-if="detail.labelId">{{$t('other.unBind')}}</text>
									</text>
								</text>
							</uni-col>
						</uni-row>
					</template>
				
					<template v-if="type === 3">
						<uni-row>
							<uni-col :span="24">
								<text class="text">
									{{$t('other.paramStatus')}}：
									<text
										class="right" 
										:class="handleClass(detail.senorStatus, MONITORSTATUS).class">
										{{ handleStatus(detail.senorStatus, MONITORSTATUS) ? handleStatus(detail.senorStatus, MONITORSTATUS) : '-' }}
									</text>
								</text>
							</uni-col>
						</uni-row>
						<uni-row>
							<uni-col :span="24">
								<text class="text">
									{{$t('other.lastReport')}}：
									<text class="right">
										{{ detail.status === 0 ? $t('room.newCreate') : detail.status === 1 ? $t('room.qualified') : detail.status === -1 ? $t('room.abarbeitung') : detail.status === -2 ? $t('room.disqualification') : '-' }}
									</text>
								</text>
							</uni-col>
						</uni-row>
						<uni-row>
							<uni-col :span="24">
								<text class="text">
									{{$t('other.gradenName')}}：
									<text class="right">
										{{ detail.gradenName || '' }}{{ detail.buildingName || '' }}{{ detail.floorName || '' }}
									</text>
								</text>
							</uni-col>
						</uni-row>
					</template>
					
					<!-- 移液枪架 -->
					<template v-if="type === 13">
						<uni-row>
							<uni-col :span="24">
								<text class="text">{{$t('labDevice.owningAddrss')}}：<text class="right">{{ detail.roomName || $t('labDevice.notData') }}</text></text>
							</uni-col>
						</uni-row>
						<uni-row>
							<uni-col :span="24">
								<text class="text">{{$t('other.lastReportTime')}}：<text class="right">{{ $options.filters['forDateTime'](detail.reportDate) || $t('labDevice.notData') }}</text></text>
							</uni-col>
						</uni-row>
					</template>
					
					<!-- 移液枪 -->
					<template v-if="type === 15">
						<uni-row>
							<uni-col :span="24">
								<text class="text">{{$t('other.homingStatus')}}：<text class="right">{{ detail.homingStatus === 1 ? (detail.gunRackName || $t('labDevice.notData')) : $t('labDevice.notData') }}</text></text>
							</uni-col>
						</uni-row>
						<uni-row>
							<uni-col :span="24">
								<text class="text">{{$t('labDevice.owningAddrss')}}：<text class="right">{{ detail.preciseLocation || $t('labDevice.notData') }}</text></text>
							</uni-col>
						</uni-row>
						<uni-row>
							<uni-col :span="24">
								<text class="text">{{$t('labDevice.principal')}}：<text class="right">{{ detail.headUser || $t('labDevice.notData') }}</text></text>
							</uni-col>
						</uni-row>
						<uni-row>
							<uni-col :span="24">
								<text class="text">{{$t('labDevice.lastUser')}}：<text class="right">{{ detail.endUser || $t('labDevice.notData') }}</text></text>
							</uni-col>
						</uni-row>
					</template>
				</view>
		</uni-popup>
		
		<Toast ref="toast"></Toast>
	</view>
</template>

<script>
	import Toast from '@/components/Toast/index.vue'
	import { MONITORSTATUS, LABSTATUS, ASSETTAGSTATUS } from "@/utils/constant";
	import { statusText, statusColor } from '@/utils/methods.js';
	import { getInstrumentUnbind } from '@/utils/api.js';
	export default{
		components: {
			Toast
		},
		props: ["detail"],
		data() {
			return {
				MONITORSTATUS,
				LABSTATUS,
				ASSETTAGSTATUS,
				type: null
			}
		},
		methods: {
			handleStatus(status, arr) {
				return statusText(status, arr)
			},
			handleClass(status, arr) {
				return statusColor(status, arr)
			},
			showDetailsPopup(index) {
				// 2设备，3房间，13移液枪架，15移液枪
				this.type = index;
				this.$refs.detailsPopup.open('bottom')
			},
			// 设备解绑标签
			handleUnbindLabel() {
				var _this = this;
				uni.showModal({
					title: _this.$t('other.hint'),
					content: _this.$t('other.unBindMessage'),
					success: function (res) {
						if (res.confirm) {
							getInstrumentUnbind({instrumentId: _this.detail.id}).then(res => {
								if(res.code){
									if(res.code === 1){
										_this.$refs.toast.open(_this.$t('other.unBindSuccess'),"success");
										_this.$emit("handle")
									}else{
										_this.$refs.toast.open(res.message,"error")
									}
								}else{
									_this.$refs.toast.open(res.message,"error")
								}
							})
						}
					}
				});
			}
		},
	}
</script>

<style scoped lang="scss">
	.details-popup{
		.content{
			padding: 0 50rpx 120rpx;
			.text{
				color: #666;
				font-size: $fontSmall;
				display: block;
				margin-bottom: 30rpx;
			}
			.right{
				color: #333;
			}
		}
		
		.normal{
			color: $normal-color!important;
		}
		.abnormal{
			color: $abnormal-color!important;
		}
		.offLine{
			color: $offLine-color!important;
		}
		
		.run{
			color: $run-color!important;
		}
		.standby{
			color: $standby-color!important;
		}
		.off{
			color: $off-color!important;
		}
		.maintain{
			color: $maintain-color!important;
		}
		
		.text-button{
			color: $blur;
			margin-left: 20rpx;
		}
	}
</style>
