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
					<text class="text">{{ formData.userName }}</text>
				</uni-forms-item>
				<uni-forms-item :label="$t('other.disposeFunction')" name="errorCauseMethod">
					<textarea class="uni-textarea" v-model="formData.errorCauseMethod"></textarea>
				</uni-forms-item>
				<uni-forms-item :label="$t('other.malfunctionCause')" name="errorCauseMsg">
					<textarea class="uni-textarea" v-model="formData.errorCauseMsg"></textarea>
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
	import { getAlarmErrorList, postExceptionHandle } from '@/utils/api.js';
	import formatter from '@/utils/formatter.js'
	export default{
		data(){
			const _this = this;
			return{
				data: "",
				faultTypeArray: [{id: 1, name: ''}],
				faultTypeIndex: 0,
				formData: {
					errorCauseMethod: null,
					errorCauseMsg: "",
					errorType: null,
					objSensorId: null,
					process: false,
					processDate: "",
					time: "",
					userId: null,
					userName: ""
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
			open(item, type) {
				this.formData = this.$options.data.call(this).formData;
				this.data = item || {};
				this.type = type;
				this.formData.process = item && item.process;
				this.formData.objSensorId = item && (item.objSensorId || item.id);
				this.formData.time = item && item.time;
				this.$refs.popup.open('bottom');
				this.alarmErrorList();
				if(item && item.process){
					this.formData.processDate = item.errorCauseTime || item.processDate;
					this.formData.errorCauseMsg = item.errorCauseMsg;
					this.formData.errorType = item.errorCauseTypeFormat || item.errorCauseType;
					this.formData.errorCauseMethod = item.errorCauseMethod;
					this.formData.userName = item.errorCauseUserName;
					this.formData.userId = item.errorCauseUserId;
					this.faultTypeIndex = 0;
				}else{
					this.formData.userName = uni.getStorageSync('sf-mini-demo:username');
					this.formData.userId = (uni.getStorageSync('sf-mini-demo:userInfo') || {}).id;
					this.formData.processDate = formatter.formatDate(new Date(),"yyyy-MM-dd hh:mm:ss");
				}
			},
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
						if(!this.formData.process){
							this.faultTypeIndex = 0;
							this.formData.errorType = res.items.list[0].id;
						}
					}
				})
			},
			bindFaultTypeChange(e) {
				this.faultTypeIndex = e.target.value;
				this.formData.errorType = this.faultTypeArray[e.target.value].id;
			},
			submit(ref){
				this.$refs[ref].validate().then(res => {
					uni.showLoading({
						title: this.$t('common.loading'),
						mask: true
					});
					postExceptionHandle({
						alarmId: this.data && this.data.id,
						objSensorId: this.formData.objSensorId,
						errorType: this.formData.errorType,
						processDate: this.formData.processDate,
						errorCauseMethod: this.formData.errorCauseMethod,
						errorCauseMsg: this.formData.errorCauseMsg
					}).then(res => {
						uni.hideLoading();
						if(res.code === 1){
							var title = this.formData.process ? this.$t('other.fix') : this.$t('other.add');
							this.$emit("handle", title + this.$t('other.disposeUseSuccess'), "success");
							this.$refs.popup.close();
						}else{
							this.$emit("handle", res.message, "error")
						}
					}).catch(() => {
						uni.hideLoading();
					})
				}).catch(err => {
					console.log('err', err);
				})
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
