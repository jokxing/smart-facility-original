<!-- 资产报警 -->
<template>
	<view class="asset-alarm">
		<view class="asset-alarm-message">
			{{title}}
		</view>
		<view class="h2-title">
			{{$t('home.handleExport')}}
		</view>
		<view class="">
			<uni-steps :options="list" active-color="#ff0000" active-icon="smallcircle-filled" :active="list.length" direction="column" />
		</view>
	</view>
</template>

<script>
	import {getPropertyReport} from "@/utils/api.js"
	import {forDateTime} from "@/utils/methods.js"
	export default {
		name: "AssetAlarm",
		data() {
			return {
				active: 1,
				list: [],
				report: {
					
				},
				title: "",
				sendDate: ""
			};
		},
		onLoad: function(options) {
			this.title = options.content;
			this.sendDate = options.sendDate;
			this.handleGetReport(options.sourceId);
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: this.$t('route.assetAlarm')
			});
		},
		methods:{
			handleGetReport(sourceId) {
				getPropertyReport({sourceId}).then(res => {
					if (res.code) {
						this.list = [];
						res.items.map((item, index) => {
							this.list.push({title: item.roomName, desc: item.moveDate})
						})
						this.list.push({title: this.$t('home.disconnect'), desc: forDateTime(this.sendDate)})
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	.asset-alarm {
		background-color: #FFFFFF;
		border-radius: 8rpx;
		margin: 40rpx;
		padding: 40rpx;
		.asset-alarm-message {
			width: 98%;
			
		}
	}
</style>
