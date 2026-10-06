<template>
	<uni-popup
		ref="popup"
		type="bottom" 
		background-color="#fff"
		class="popup">
			<view class="title">
				<uni-title type="h3" :title="title"></uni-title>
			</view>
			<scroll-view :scroll-top="scrollTop" scroll-y="true" class="scroll-Y">
				<view class="asset-form">
					<SubmitForm 
						ref="submitForm" 
						:formItem="formItem" 
						:formData.sync="formData" 
						:rules="rules"
						:labelWidth="'78'"
						@handleInput="handleInput">
					</SubmitForm>
					<view class="footer">
						<uni-row>
							<uni-col :span="11">
								<button type="default" class="button button-cancel" @click="handleClose">{{$t('commmon.cancel')}}</button>
							</uni-col>
							<uni-col :span="11" :push="2">
								<button class="button button-primary" @click="submit">{{$t('commmon.confirm')}}</button>
							</uni-col>
						</uni-row>
					</view>
				</view>
			</scroll-view>
	</uni-popup>
</template>

<script>
	import SubmitForm from "@/components/SubmitForm/index.vue"
	export default{
		components:{
			SubmitForm
		},
		data(){
			return{
				title: "",
				formItem: [],
				formData: {},
				rules: {}
			}
		},
		methods: {
			showPopup(index) {
				// 1使用，2预约，3报修，4领用，5退还，6借用
				const _this = this;
				if(index === 1){
					this.title = _this.$t('labDevice.use');
					this.formItem = [
						{
							label: _this.$t('labDevice.useName'),
							type: "text",
							prop: "name",
							isRequired: true,
							placeholder: _this.$t('labDevice.inputUseName')
						},
						{
							label: _this.$t('labDevice.assetChange'),
							type: "text",
							prop: "asset",
							isRequired: true,
							placeholder: _this.$t('labDevice.inputAssetChange')
						},
						{
							label: _this.$t('labDevice.useDate'),
							type: "date",
							prop: "date",
							isRequired: true,
						},
						{
							label: _this.$t('labDevice.departmentName'),
							type: "text",
							prop: "department",
							isRequired: true,
							placeholder: _this.$t('labDevice.inputDepartmentName')
						},
						{
							label: _this.$t('labDevice.use1'),
							type: "text",
							prop: "purpose",
							isRequired: true,
							placeholder: _this.$t('labDevice.inputUse1')
						},
						{
							label: _this.$t('labDevice.useBefore'),
							type: "checkbox",
							prop: "preStatus",
							isRequired: true,
							class: "uni-checkbox",
							localdata: [
								{
									text: _this.$t('labDevice.abnormal'),
									value: 0
								},
								{
									text: _this.$t('labDevice.normal'),
									value: 1
								},
							]
						},
						{
							label: _this.$t('labDevice.runStatus'),
							type: "checkbox",
							prop: "runStatus",
							isRequired: true,
							class: "uni-checkbox",
							localdata: [
								{
									text: _this.$t('labDevice.abnormal'),
									value: 0
								},
								{
									text: _this.$t('labDevice.normal'),
									value: 1
								},
							]
						},
						{
							label: _this.$t('home.remarks'),
							type: "textarea",
							prop: "remark",
							placeholder: _this.$t('common.input')
						},
						{
							label: _this.$t('labDevice.imgUpdate'),
							type: "filePicker",
							prop: "picList",
						},
						{
							label: _this.$t('labDevice.fileUpdate'),
							type: "filePicker",
							prop: "fileList",
						},
					]
					this.formData = {
						name: "",
						asset: "",
						date: "",
						department: "",
						purpose: "",
						preStatus: 1,
						runStatus: 0,
						remark: "",
						picList: [],
						fileList: []
					},
					this.rules = {
						name: {
							rules: [
								{
									required: true,
									errorMessage: _this.$t('labDevice.inputUseName'),
								}
							]
						},
						asset: {
							rules: [
								{
									required: true,
									errorMessage: _this.$t('labDevice.inputAssetChange'),
								}
							]
						},
						date: {
							rules: [
								{
									required: true,
									errorMessage: _this.$t('labDevice.changeUseDate'),
								}
							]
						},
						department: {
							rules: [
								{
									required: true,
									errorMessage: _this.$t('labDevice.changeUseDep'),
								}
							]
						},
						purpose: {
							rules: [
								{
									required: true,
									errorMessage: _this.$t('labDevice.inputUse1'),
								}
							]
						}
					}
				}else if(index === 3) {
					this.title = _this.$t('labDevice.fix');
					this.formItem = [
						{
							label: _this.$t('labDevice.fixUser'),
							type: "text",
							prop: "name",
							isRequired: true,
							placeholder: _this.$t('labDevice.inpuFixUser')
						},
						{
							label: _this.$t('labDevice.fixIn'),
							type: "text",
							prop: "content",
							isRequired: true,
							placeholder: _this.$t('labDevice.fixComment')
						},
						{
							label: _this.$t('labDevice.fixDate'),
							type: "date",
							prop: "date",
							isRequired: true,
						},
						{
							label: _this.$t('labDevice.fixDate1'),
							type: "date",
							prop: "expectDate",
							isRequired: true,
						},
						{
							label: _this.$t('home.remarks'),
							type: "textarea",
							prop: "remark",
							placeholder: _this.$t('common.input')
						},
						{
							label: _this.$t('labDevice.imgUpdate'),
							type: "filePicker",
							prop: "picList",
						},
						{
							label: _this.$t('labDevice.fileUpdate'),
							type: "filePicker",
							prop: "fileList",
						},
					]
					this.formData = {
						name: "",
						content: "",
						date: "",
						expectDate: "",
						remark: "",
						picList: [],
						fileList: []
					},
					this.rules = {
						name: {
							rules: [
								{
									required: true,
									errorMessage: _this.$t('labDevice.inpuFixUser'),
								}
							]
						},
						content: {
							rules: [
								{
									required: true,
									errorMessage: _this.$t('labDevice.fixComment'),
								}
							]
						},
						date: {
							rules: [
								{
									required: true,
									errorMessage: _this.$t('labDevice.inputFixDate'),
								}
							]
						}
					}
				}else if(index === 4){
					this.title = _this.$t('labDevice.receive');
					this.formItem = [
						{
							label: _this.$t('labDevice.receive'),
							type: "text",
							prop: "name",
							isRequired: true,
							placeholder: _this.$t('labDevice.inpuReceiveUse')
						},
						{
							label: _this.$t('labDevice.receiveDep'),
							type: "text",
							prop: "department",
							isRequired: true,
							placeholder: _this.$t('labDevice.inpuReceiveDep')
						},
						{
							label: _this.$t('labDevice.receiveDate'),
							type: "date",
							prop: "date",
							isRequired: true,
						},
						{
							label: _this.$t('labDevice.receiveAddress'),
							type: "text",
							prop: "region",
							placeholder: _this.$t('labDevice.inpuReceiveAddress')
						},
						{
							label: _this.$t('home.remarks'),
							type: "textarea",
							prop: "remark",
							placeholder: _this.$t('common.input')
						},
						{
							label: _this.$t('labDevice.imgUpdate'),
							type: "filePicker",
							prop: "picList",
						},
						{
							label: _this.$t('labDevice.fileUpdate'),
							type: "filePicker",
							prop: "fileList",
						},
					]
					this.formData = {
						name: "",
						department: "",
						date: "",
						region: "",
						remark: "",
						picList: [],
						fileList: []
					},
					this.rules = {
						name: {
							rules: [
								{
									required: true,
									errorMessage: _this.$t('labDevice.inpuReceiveUse'),
								}
							]
						},
						department: {
							rules: [
								{
									required: true,
									errorMessage: _this.$t('labDevice.inpuReceiveDep'),
								}
							]
						},
						date: {
							rules: [
								{
									required: true,
									errorMessage: _this.$t('labDevice.changeReceiveDate'),
								}
							]
						}
					}
				}else if(index === 5){
					this.title = _this.$t('labDevice.return');
					this.formItem = [
						{
							label: _this.$t('labDevice.returnUser'),
							type: "text",
							prop: "name",
							isRequired: true,
							placeholder: _this.$t('labDevice.inputReturnUser')
						},
						{
							label: _this.$t('labDevice.returnDate'),
							type: "date",
							prop: "date",
							isRequired: true,
						},
						{
							label: _this.$t('labDevice.returnAddress'),
							type: "text",
							prop: "region",
							placeholder: _this.$t('labDevice.inputReturnAddress')
						},
						{
							label: _this.$t('home.remarks'),
							type: "textarea",
							prop: "remark",
							placeholder: _this.$t('common.input')
						},
						{
							label: _this.$t('labDevice.imgUpdate'),
							type: "filePicker",
							prop: "picList",
						},
						{
							label: _this.$t('labDevice.fileUpdate'),
							type: "filePicker",
							prop: "fileList",
						},
					]
					this.formData = {
						name: "",
						date: "",
						region: "",
						remark: "",
						picList: [],
						fileList: []
					},
					this.rules = {
						name: {
							rules: [
								{
									required: true,
									errorMessage: _this.$t('labDevice.inputReturnUser'),
								}
							]
						},
						date: {
							rules: [
								{
									required: true,
									errorMessage: _this.$t('labDevice.returnDate'),
								}
							]
						}
					}
				}else if(index === 6){
					this.title = _this.$t('labDevice.borrow');
					this.formItem = [
						{
							label: _this.$t('labDevice.borrowUser'),
							type: "text",
							prop: "name",
							isRequired: true,
							placeholder: _this.$t('labDevice.inputBorrowUser')
						},
						{
							label: _this.$t('labDevice.borrowDep'),
							type: "text",
							prop: "department",
							isRequired: true,
							placeholder: _this.$t('labDevice.inputBorrowDep')
						},
						{
							label: _this.$t('labDevice.borrowDate'),
							type: "date",
							prop: "date",
							isRequired: true,
						},
						{
							label: _this.$t('labDevice.borrowAddress'),
							type: "text",
							prop: "region",
							placeholder: _this.$t('labDevice.inputBorrowAddress')
						},
						{
							label: _this.$t('home.remarks'),
							type: "textarea",
							prop: "remark",
							placeholder: _this.$t('common.input')
						},
						{
							label: _this.$t('labDevice.imgUpdate'),
							type: "filePicker",
							prop: "picList",
						},
						{
							label: _this.$t('labDevice.fileUpdate'),
							type: "filePicker",
							prop: "fileList",
						},
					]
					this.formData = {
						name: "",
						department: "",
						date: "",
						region: "",
						remark: "",
						picList: [],
						fileList: []
					},
					this.rules = {
						name: {
							rules: [
								{
									required: true,
									errorMessage: _this.$t('labDevice.inputBorrowUser'),
								}
							]
						},
						department: {
							rules: [
								{
									required: true,
									errorMessage: _this.$t('labDevice.inputBorrowDep'),
								}
							]
						},
						date: {
							rules: [
								{
									required: true,
									errorMessage: _this.$t('labDevice.borrowDate'),
								}
							]
						}
					}
				}else{
					
				}
				
				
				this.$refs.popup.open('bottom');
			},
			handleInput(item,e){
				this.formData[item.prop] = e
			},
			handleClose() {
				this.$refs.popup.close();
				this.$refs.submitForm.$refs.form.resetFields()
			},
			submit() {
				console.log(this.formData)
				this.$refs.submitForm.$refs.form.validate().then(res=>{
				}).catch(err =>{
					console.log('表单错误信息：', err);
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.asset-form{
		padding: 0 24rpx 20rpx;
	}
	.scroll-Y {
		max-height: 1200rpx;
	}
	@media screen and (max-height: 700px) {
		.scroll-Y {
			max-height: 1000rpx;
		}
	}
</style>