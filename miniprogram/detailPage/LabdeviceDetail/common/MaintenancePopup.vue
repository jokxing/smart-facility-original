<template>
	<view class="maintenance-popup">
		<uni-popup
			ref="maintenancePopup" 
			type="bottom" 
			background-color="#fff"
			class="popup">
				<view class="title">
					<uni-title type="h3" :title="$t('labDevice.maintenanceApply')"></uni-title>
				</view>
				<view class="maintenanc-apply">
					<uni-forms ref="form" class="uni-forms is-top" :modelValue="formData" :rules="rules" label-position="top">
						<uni-forms-item :label="$t('labDevice.faultRemark')" required name="remark">
							<textarea class="uni-textarea" v-model="formData.remark" maxlength="50" />
						</uni-forms-item>
						<uni-forms-item :label="$t('labDevice.updateFaultImg')" label-width="95">
							<uni-file-picker 
							    v-model="imageValue" 
							    fileMediatype="image" 
							    mode="grid" 
								:limit="3"
							    @select="select($event)" 
							    @progress="progress" 
							    @success="success" 
							    @fail="fail" 
								@delete="handleDelete"
							/>
						</uni-forms-item>
					</uni-forms>
					<view class="footer">
						<uni-row>
							<uni-col :span="11">
								<button type="default" class="button-cancel" @click="$refs.maintenancePopup.close()">{{$t('common.cancel')}}</button>
							</uni-col>
							<uni-col :span="11" :push="2">
								<button class="button-primary" @click="submit">{{$t('common.confirm')}}</button>
							</uni-col>
						</uni-row>
					</view>
				</view>
		</uni-popup>
		
		<Toast ref="toast"></Toast>
	</view>
</template>

<script>
	import Toast from "@/components/Toast/index.vue";
	// 引入上传图片的插件
	import uploadImage from '@/js_sdk/yushijie-ossutil/ossutil/uploadFile.js';
	import { postMaintenanceAdd } from '@/utils/api.js';
	export default{
		components: {
			Toast
		},
		props: ["instrumentId"],
		data() {
			const _this = this;
			return {
				maintenanceFormData: {},
				imageValue:[],
				urlList: [],
				fileList: [],
				// 表单数据
				formData: {
					remark: '',
				},
				rules: {
					remark: {
						rules: [{
								required: true,
								errorMessage: _this.$t('labDevice.inputFaultRemark'),
							}
						]
					},
				}
			}
		},
		onReady() {
			// ios的rules生效
			this.$refs.form.setRules(this.rules)
		},
		methods: {
			showMaintenancePopup() {
				this.$refs.maintenancePopup.open('bottom')
			},
			// 获取上传状态
			select(e){
				let filearr = e.tempFiles
				// 支持多图片上传
				for(var i=0;i<filearr.length;i++) {
					let file = filearr[i].path + "";
					uploadImage(file, 'wxImage/',
					result => { 
						//成功之后，可以将result带去执行其它方法或者赋值
						const url = "wxImage/" + result.split('wxImage/')[1];
						this.fileList.push({
							file: file,
							url: url
						})
					},result =>{ 
						//这里写上传失败的代码 
						uni.showToast({
							title: this.$t('labDevice.updateAlicloubError'),
							icon: 'none'
						})
						console.log('fail',JSON.stringify(result));
					})
				}
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
			// 删除图片
			handleDelete(e){
				let delFile = this.fileList.findIndex(item => {
					if (item.file == e.tempFilePath) {
						return true
					}
				});
				this.fileList.splice(delFile, 1);
			},
			submit() {
				this.$refs.form.validate().then(res=>{
					this.maintenanceAdd()
				}).catch(err =>{
					console.log('表单错误信息：', err);
				})
			},
			maintenanceAdd() {
				// 把现图片的名称给urlList赋值
				if(this.fileList.length > 0){
					for(var i = 0; i < this.fileList.length; i++){
						this.urlList.push(this.fileList[i].url)
					}
				}
				var data = {
					instrumentId: this.instrumentId,
					remark: this.formData.remark,
					urlList: this.urlList
				}
				postMaintenanceAdd(data).then(res => {
					if(res.code){
						if(res.code === 1){
							this.$refs.toast.open(this.$t('labDevice.maintenanceApplySuccess'),"success");
							this.$refs.maintenancePopup.close();
							this.$emit('handle')
						}else{
							this.$refs.toast.open(res.message,"error")
						}
					}else{
						this.$refs.toast.open(res.message,"error")
					}
				})
			}
		},
	}
</script>

<style scoped lang="scss">
	.maintenanc-apply{
		padding: 0 30rpx 20rpx 30rpx;
	}
</style>
