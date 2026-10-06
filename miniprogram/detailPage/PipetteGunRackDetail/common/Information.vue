<template>
	<view class="homeSubpage-detail" style="padding: 0;">
		<view class="information latestStatus">
			<uni-row>
				<uni-col :span="8">
					<view class="status" :class="handleStatusClass(detail.status).class">
						<view class="status-big">
							<view class="status-mid">
								<view class="status-samll">
									{{ handleStatus(detail.status) || "" }}
								</view>
							</view>
						</view>
					</view>
				</uni-col>
				<uni-col :span="16">
					<view class="detail">
						<view class="text">
							{{$t('labDevice.name')}}：
							<text class="span">{{ detail.name }}</text>
						</view>
						<view class="text no">
							{{$t('labDevice.no')}}：
							<text class="span">{{ detail.no || $t('labDevice.notData') }}</text>
						</view>
						<!-- <view class="text">
							所在位置：
							<text class="span">{{ detail.roomName }}</text>
						</view> -->
						<view class="text" @click="handleDetailsPopup">
							{{$t('labDevice.lookMoreMessage')}}>
						</view>
					</view>
				</uni-col>
			</uni-row>
		</view>
		
		<detailsPopup ref="detailsPopup" :detail="detail"></detailsPopup>
	</view>
</template>

<script>
	import detailsPopup from '../../components/detailsPopup/index.vue';
	import { GUNRACKSTATUS } from '@/utils/constant.js'
	import { statusText, statusColor } from '@/utils/methods.js';
	export default{
		components: {
			detailsPopup
		},
		props: ["detail"],
		data() {
			return{
				
			}
		},
		methods: {
			handleDetailsPopup() {
				this.$refs.detailsPopup.showDetailsPopup(13)
			},// 判断参数状态
			handleStatus(status){
				return statusText(status, GUNRACKSTATUS)
			},
			handleStatusClass(status) {
				return statusColor(status, GUNRACKSTATUS)
			}
		}
	}
</script>

<style scoped lang="scss">
	@import '@/style/css/status.scss'; 
	@import '@/style/css/homeSubpageDetail.scss';
</style>