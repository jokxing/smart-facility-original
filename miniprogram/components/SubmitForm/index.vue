<template>
	<uni-forms ref="form" class="uni-forms submit-form" :modelValue="formData" :rules="rules" :label-position="labelPosition" :label-width="labelWidth">
		<uni-forms-item
			v-for="(item, index) in formItem"
			:key="index"
			:label="item.label" 
			:required="item.isRequired"
			:name="item.prop"
			:class="item.class">
			<uni-easyinput
				v-if="item.type === 'text'" 
				v-model="formData[item.prop]" 
				:placeholder="item.placeholder"
				 @input="handleInput(item,$event)" />
			
			<uni-datetime-picker 
				v-if="item.type === 'date'" 
				type="date" 
				:clear-icon="false" 
				v-model="formData[item.prop]" 
				@maskClick="maskClick" />
				
			<uni-data-checkbox 
				v-if="item.type === 'checkbox'" 
				v-model="formData[item.prop]" 
				:localdata="item.localdata">
			</uni-data-checkbox>
			
			<textarea 
				v-if="item.type === 'textarea'" 
				class="uni-textarea"
				v-model="formData[item.prop]" 
				:placeholder="item.placeholder"
				maxlength="50" 
			/>
			
			<uni-file-picker
				v-if="item.type === 'filePicker'"
			    v-model="formData[item.prop]" 
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
</template>

<script>
	export default{
		props: {
			formData: {
				type: Object,
				default: () => {}
			},
			formItem: {
				type: Array,
				default: () => []
			},
			rules: {
				type: Object,
				default: () => {}
			},
			labelPosition: {
				type: String,
				default: ""
			},
			labelWidth: {
				type: String,
				default: ""
			}
		},
		data(){
			return{
				single: "",
			}
		},
		methods: {
			maskClick(e){
				console.log(e)
			},
			handleInput(item,e){
				this.$emit('handleInput', item, e)
			},
			// 获取上传状态
			select(e){
				// let filearr = e.tempFiles
				// // 支持多图片上传
				// for(var i=0;i<filearr.length;i++) {
				// 	let file = filearr[i].path + "";
				// 	uploadImage(file, 'wxImage/',
				// 	result => { 
				// 		//成功之后，可以将result带去执行其它方法或者赋值
				// 		const url = "wxImage/" + result.split('wxImage/')[1];
				// 		this.fileList.push({
				// 			file: file,
				// 			url: url
				// 		})
				// 	},result =>{ 
				// 		//这里写上传失败的代码 
				// 		uni.showToast({
				// 			title: '上传图片至阿里云失败',
				// 			icon: 'none'
				// 		})
				// 		console.log('fail',JSON.stringify(result));
				// 	})
				// }
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
				// let delFile = this.fileList.findIndex(item => {
				// 	if (item.file == e.tempFilePath) {
				// 		return true
				// 	}
				// });
				// this.fileList.splice(delFile, 1);
			},
		}
	}
</script>

<style scoped lang="scss">
	
</style>