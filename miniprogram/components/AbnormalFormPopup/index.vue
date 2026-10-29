<template>
	<uni-popup ref="popup" type="bottom" class="popup" background-color="#fff" :mask-click="false">
		<uni-title type="h5" :title="$t('other.alarmDisposed')"></uni-title>
		<view class="popup-content">
			<uni-forms class="uni-forms" ref="form" :rules="rules" :modelValue="formData">
				<uni-forms-item :label="$t('other.malfunctionType')" name="type" required>
					<picker 
						class="popup-picker" 
						@change="bindFaultTypeChange" 
						:value="faultTypeIndex" 
						:range="faultTypeArray" 
						:range-key="'name'">
						<text>{{ faultTypeArray[faultTypeIndex].name }}</text>
						<uni-icons type="bottom" size="16" color="#cccccc"></uni-icons>
					</picker>
				</uni-forms-item>
				<uni-forms-item :label="$t('other.disposeTime')" name="processDate" required>
					<view class="example-body">
						<uni-datetime-picker
							type="datetime"
							v-model="formData.processDate"
						/>
					</view>
				</uni-forms-item>
				<uni-forms-item :label="$t('other.disposeUse')" name="name" class="no-input">
					<text class="text">{{ formData.processUsername }}</text>
				</uni-forms-item>
				<uni-forms-item :label="$t('other.disposeFunction')" name="processMethod">
					<textarea class="uni-textarea" v-model="formData.processMethod"></textarea>
				</uni-forms-item>
				<uni-forms-item :label="$t('other.malfunctionCause')" name="remark">
					<textarea class="uni-textarea" v-model="formData.remark"></textarea>
				</uni-forms-item>
			</uni-forms>
			<view class="footer">
				<uni-row>
					<uni-col :span="11">
						<button type="default" class="button-cancel" @click="close">{{$t('common.cancel')}}</button>
					</uni-col>
					<uni-col :span="11" :push="2">
						<button class="button-primary" @click="submit('form')">{{$t('common.confirm')}}</button>
					</uni-col>
				</uni-row>
			</view>
		</view>
		
	</uni-popup>
</template>

<script>
	import { getAlarmErrorList,postAlarmUpdateProcess, getAlarmProcessInfo, postAlarmAddProcess } from '@/utils/api.js';
	import formatter from '@/utils/formatter.js'
	export default{
		data(){
			const _this = this;
			return{
				data: "",
				faultTypeArray: [{id: 1, name: ''}],
				faultTypeIndex: 0,
				formData: {
					alarmId: null,
					companyId: null,
					equipmentId: null,
					errorType: null,
					processUsername: uni.getStorageSync('sf-mini-demo:username'),
					processDate: "",
					processMethod: "",
					remark: "",
				},
				// 校验规则
				rules: {
					processDate: {
						rules: [{
							required: true,
							errorMessage: _this.$t('other.notDisposeTime')
						}]
					},
				},
				type: null
			}
		},
		methods: {
			alarmErrorList() {
				if(this.type){
					var data = {
						type: this.type
					}
				}else{
					data: ""
				}
				getAlarmErrorList(data).then(res => {
					if(res.code === 1 && res.items && res.items.list && res.items.list.length){
						this.faultTypeArray = res.items.list;
						this.faultTypeIndex = 0;
						this.formData.errorType = res.items.list[0].id;
					}
				})
			},
			open(item, type) {
				//重置
				this.formData = this.$options.data.call(this).formData;
				
				this.data = item;
				this.type = type;
				this.formData.processDate = formatter.formatDate(new Date(),"yyyy-MM-dd hh:mm:ss");
				this.$refs.popup.open('bottom');
				this.alarmErrorList();
				// this.formData.processUsername = uni.getStorageSync('sf-mini-demo:username');
				if(this.data.process){
					this.alarmProcessInfo()
				}else{
					this.formData.processUsername = uni.getStorageSync('sf-mini-demo:username');
				}
			},
			alarmProcessInfo() {
				getAlarmProcessInfo({alarmId: this.data.id}).then(res => {
					if (res.code === 1 && res.items) {
						this.formData = Object.assign({}, this.formData, res.items);
						this.formData.processUsername = res.items.processUserName || res.items.processUsername;
					}
				})
			},
			bindFaultTypeChange(e) {
				this.faultTypeIndex = e.target.value;
				this.formData.errorType = this.faultTypeArray[e.target.value].id;
			},
			submit(ref){
				this.$refs[ref].validate().then(res => {
					this.formData.alarmId = this.data.id;
					this.formData.companyId = this.data.companyId;
					this.formData.equipmentId = this.data.equipmentId;
					uni.showLoading({
						title: this.$t('common.loading'),
						mask: true
					});
					if(this.data.process){
						postAlarmUpdateProcess(this.formData).then(res => {
							this.handleMessage(this.$t('other.fix'), res)
						})
					}else{
						postAlarmAddProcess(this.formData).then(res => {
							this.handleMessage(this.$t('other.add'), res)
						})
					}
				}).catch(err => {
					console.log('err', err);
				})
			},
			handleMessage(title,res){
				uni.hideLoading();
				if(res.code === 1){
					this.$emit("handle", title + this.$t('other.disposeUseSuccess'), "success")
					this.$refs.popup.close();
				}else{
					this.$emit("handle", (res && res.message) || this.$t('labDevice.functionNotOpen'), "error")
				}
			},
			close(){
				this.$emit("handle");
				this.$refs.popup.close()
			}
		}
	}
</script>

<style scoped lang="scss">
	::v-deep .uni-error-message{
		bottom: -20px;
		left: 0!important
	}
</style>
