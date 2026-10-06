<template>
	<uni-popup ref="message" type="message">
		<uni-popup-message :type="msgType" :message="messageText" :duration="2000"></uni-popup-message>
	</uni-popup>
</template>

<script>
	export default{
		data() {
			return{
				msgType: '',
				messageText: '',
			}
		},
		methods: {
			open(text,type){
				this.messageText = text;
				this.msgType = type;
				this.$refs.message.open()
			}
		}
	}
</script>

<style>
</style>