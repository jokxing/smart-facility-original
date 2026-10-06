<template>
	<view class="patrolReportDetail">
		<uni-title class="title" type="h3" :title="$t('room.reportGrade')" align="left"></uni-title>
		<uni-row>
			<picker 
				class="popup-picker" 
				@change="bindGradeChange" 
				:value="gradeIndex" 
				:range="gradeTypes" 
				:range-key="'name'">
				<text>{{ gradeTypes[gradeIndex].name }}</text>
				<uni-icons type="bottom" size="16" color="#cccccc"></uni-icons>
			</picker>
		</uni-row>
		<uni-title class="title" type="h3" :title="$t('labDevice.basicInformation')" align="left"></uni-title>
		<view class="essentialInformation">
			<uni-row>
				<uni-col :span="6">
					<text class="text-form">{{$t('room.reportName')}}：</text>
				</uni-col>
				<uni-col :span="18">
					<uni-easyinput class="uni-input" type="text" v-model="name" disabled />
				</uni-col>
			</uni-row>
			<uni-row>
				<uni-col :span="6">
					<text class="text-form">{{$t('room.checkUserName')}}：</text>
				</uni-col>
				<uni-col :span="18">
					<text class="text-form text-right">{{ checkUserName }}</text>
				</uni-col>
			</uni-row>
			<uni-row>
				<uni-col :span="6">
					<text class="text-form">{{$t('room.checkDate')}}：</text>
				</uni-col>
				<uni-col :span="18">
					<uni-datetime-picker 
						type="date" 
						:clear-icon="false" 
						v-model="checkDate" 
						:disabled="isDisabled" 
						@maskClick="maskClick" />
				</uni-col>
			</uni-row>
		</view>
		<uni-title class="title" type="h3" :title="$t('room.checkItemContent')" align="left"></uni-title>
		<view class="checkItem-content">
			<uni-row>
				<uni-col :span="4">
					<text class="text-num">{{$t('room.sum')}}</text>
					<text class="text-num">{{ itemList.length || 0 }}{{$t('room.item')}}</text>
				</uni-col>
				<uni-col :span="4">
					<text class="text-num">{{$t('room.noViolationCount')}}</text>
					<text class="text-num">{{ noViolationCount }}{{$t('room.item')}}</text>
				</uni-col>
				<uni-col :span="5">
					<text class="text-num">{{$t('room.ordinaryViolationCount')}}</text>
					<text class="text-num">{{ ordinaryViolationCount }}{{$t('room.item')}}</text>
				</uni-col>
				<uni-col :span="5">
					<text class="text-num">{{$t('mediumViolationCount')}}</text>
					<text class="text-num">{{ mediumViolationCount }}{{$t('room.item')}}</text>
				</uni-col>
				<uni-col :span="5">
					<text class="text-num">{{$t('room.seriousViolationCount')}}</text>
					<text class="text-num">{{ seriousViolationCount }}{{$t('room.item')}}</text>
				</uni-col>
			</uni-row>
			<uni-row v-for="item in itemList" :key="item.itemId">
				<uni-col :span="8">
					<text class="text-form">{{ item.itemName }}：</text>
				</uni-col>
				<uni-col :span="16">
					<picker 
						class="popup-picker" 
						:class="{ 'is-disabled': isDisabled }"
						@change="bindViolationChange($event,item)" 
						:value="item.violationIndex" 
						:range="item.violationTypes"
						:disabled="isDisabled"
						:range-key="'name'">
						<text>{{ item.violationTypes[item.violationIndex].name }}</text>
						<uni-icons type="bottom" size="16" color="#cccccc"></uni-icons>
					</picker>
				</uni-col>
			</uni-row>
		</view>
		<uni-title class="title" type="h3" :title="$t('labDevice.checkReportImg')" align="left"></uni-title>
		<view>
			<uni-file-picker
			    v-model="imageValue" 
			    fileMediatype="image" 
			    mode="grid" 
			    @select="select" 
			    @progress="progress" 
			    @success="success" 
			    @fail="fail" 
			/>
		</view>
		<view class="button">
			<uni-row>
				<uni-col :span="11">
					<button 
						class="button-primary" 
						type="primary"
						@click="submit">{{$t('room.save')}}</button>
				</uni-col>
				<uni-col :span="11" :push="2">
					<button 
						class="button-primary" 
						type="primary" 
						v-show="isDisabled"
						@click="isDisabled = false">{{$t('room.change')}}</button>
				</uni-col>
				<uni-col :span="11" :push="2">
					<button 
						class="button-primary" 
						type="primary" 
						v-show="!isDisabled"
						@click="isDisabled = true">{{$t('room.preview')}}</button>
				</uni-col>
			</uni-row>
		</view>
		
		<Toast ref="toast"></Toast>
	</view>
</template>

<script>
	import Toast from '@/components/Toast/index.vue'
	import { getReportTemplateObtainItem } from '@/utils/api.js'
	import formatter from '@/utils/formatter.js'
	export default{
		components: {
			Toast
		},
		data() {
			const _this = this;
			return {
				isDisabled: true,
				gradeTypes: [
					{id: -2, name: _this.$t('room.disqualification')},
					{id: 1, name: _this.$t('room.qualified')},
					{id: -1, name: _this.$t('room.abarbeitung')},
					{id: 0, name: _this.$t('room.newCreate')},
				],
				gradeIndex: 0,
				name: "",
				checkUserName: (uni.getStorageSync('sf-mini-demo:userInfo') || {}).name,
				checkDate: formatter.formatDate(new Date(),"yyyy-MM-dd"),
				noViolationCount: 0,
				ordinaryViolationCount: 0,
				mediumViolationCount: 0,
				seriousViolationCount: 0,
				violationTypes: [
					{id: 0, name: _this.$t('room.noViolationCount')},
					{id: 1, name: _this.$t('room.ordinaryViolationCount')},
					{id: 2, name: _this.$t('room.mediumViolationCount')},
					{id: 3, name: _this.$t('room.seriousViolationCount')},
				],
				templateId: null,
				itemList: ""
			}
		},
		onLoad(options) {
			if(options.title){
				uni.setNavigationBarTitle({
					title: options.title
				})
			}
			if(options.templateId){
				this.templateId = parseInt(options.templateId)
			}
			if(options.name){
				this.name = options.name
			}
		},
		onShow() {
			uni.setNavigationBarTitle({
				title: this.$t('route.patrolReportDetail')
			});
		},
		onReady() {
			this.getItem()
		},
		methods: {
			getItem(){
				getReportTemplateObtainItem({templateId: this.templateId}).then(res => {
					if(res.code === 1){
						for(var i = 0; i < res.items.itemList.length; i++){
							res.items.itemList[i].violationTypes = this.violationTypes;
							res.items.itemList[i].violationIndex = 0;
						}
						this.itemList = res.items.itemList;
						this.noViolationCount = res.items.itemList.length;
					}
				})
			},
			// 报告等级选项
			bindGradeChange(e) {
				this.gradeIndex = e.target.value
			},
			// 日期
			maskClick(e){
				console.log('maskClick事件:', e);
			},
			// 检查项内容选项
			bindViolationChange(e,item) {
				item.violationIndex = parseInt(e.target.value);
				
				this.noViolationCount = 0;
				this.ordinaryViolationCount = 0;
				this.mediumViolationCount = 0;
				this.seriousViolationCount = 0;
				for(var i = 0; i < this.itemList.length; i++){
					if(this.itemList[i].violationIndex === 0){
						this.noViolationCount++
					}
					if(this.itemList[i].violationIndex === 1){
						this.ordinaryViolationCount++
					}
					if(this.itemList[i].violationIndex === 2){
						this.mediumViolationCount++
					}
					if(this.itemList[i].violationIndex === 3){
						this.seriousViolationCount++
					}
				}
			},
			// 获取上传状态
			select(e){
				console.log('选择文件：',e)
			},
			// 获取上传进度
			progress(e){
				console.log('上传进度：',e)
			},
			// 上传成功
			success(e){
				console.log('上传成功')
			},
			// 上传失败
			fail(e){
				console.log('上传失败：',e)
			},
			submit(){
				this.isDisabled = true;
				postReportTemplateAddReport().then(res => {
					if(res.code){
						if(res.code === 1){
							
						}else{
							this.$refs.toast.open(res.message, "error")
						}
					}else{
						this.$refs.toast.open(res.message, "error")
					}
				})
			}
		},
	}
</script>

<style scoped lang="scss">
	@import './PatrolReportDetail.scss';
</style>
