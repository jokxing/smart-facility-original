<!-- 转办 -->
<template>
    <view>
        <uni-popup ref="transfer" type="bottom" class="popup" backgroundColor="#fff">
            <view class="popup-body">
                <view class="h2-title">
                    {{title}}
                </view>
                <uni-forms ref="baseForm" :modelValue="form">
                    <uni-forms-item :label="$t('home.transferUser')" required v-if="type === 0">
                        <view class="tab-users" @click="handleSelectUser">
                            <view class="tab-users-item">
                                <view class="tab-users-name" v-for="item in users" :key="item.id">
                                    <text>{{ item.name }}</text>
                                    <uni-icons type="closeempty" size="20" color="#888888" />
                                </view>
                            </view>
                            <view>
                                <uni-icons type="right" color="#888888" size="24"></uni-icons>
                            </view>
                        </view>
                    </uni-forms-item>
                    <uni-forms-item :label="$t('home.transferCause')" v-if="type === 0">
                        <uni-easyinput type="textarea" v-model="form.comment" :placeholder="$t('common.input')" />
                    </uni-forms-item>
                    <uni-forms-item :label="$t('home.rejectCause')" v-if="type ===1" required>
                        <uni-easyinput type="textarea" v-model="form.comment" :placeholder="$t('common.input')"></uni-easyinput>
                    </uni-forms-item>
                    <uni-forms-item :label="$t('home.consentComment')" v-if="type ===2" :required="requireComments">
                        <uni-easyinput type="textarea" v-model="form.comment" :placeholder="$t('common.input')"></uni-easyinput>
                    </uni-forms-item>
					<uni-forms-item :label="$t('home.sign')" v-if="type ===2">
					    <view class="sign-but" @click="handleSignPlate()" v-if="form.signatureUrl == ''">{{$t('home.clickSign')}}</view>
						<view class="flex" v-else>
							<image class="img" mode="heightFix" :src="BASE_URL + form.signatureUrl"></image>
							<view class="sign-but" @click="handleSignPlate()">
								{{$t('home.resetSign')}}
							</view>
						</view>
					</uni-forms-item>
                </uni-forms>
                <button style="background: #D6AE7B;" type="primary" @click="submit('valiForm')">{{$t('common.confirm')}}</button>
                <button class="mt" @click="handleClose()">{{$t('common.cancel')}}</button>
            </view>
        </uni-popup>
		<SignPlate ref="SignPlate" @handle="handleImg" />
        <SelectUsers ref="SelectUsers" @handle="handleUsers"/>
    </view>
</template>

<script>
import SelectUsers from "@/components/SelectUsers/SelectUsers.vue"
import SignPlate from "@/homePage/components/SignPlate/SignPlate.vue"
import {BASE_URL} from "@/utils/constant.js"
import {postActivitiTransferTask,postTransferTask,postTerminateTask} from "@/utils/api.js"
export default {
    name: "Transfer",
    components: {
        SelectUsers,
		SignPlate,
    },
    data() {
        return {
            form: {
                comment: "",
                processOrderNo: "",
                taskId: "",
                modelNodeId: "",
                expValue: null,
				signatureUrl: ""
            },
            users: [],
            type: 0, // 0、转办 1、驳回 2、同意
            title: "转办",
			BASE_URL,
			requireComments: false,
			requireSignature: false
        };
    },
    methods: {
		handleSignPlate() {
			// this.form.signatureUrl = "";
			this.$refs.SignPlate.autograph();
		},
		handleImg(value) {
			this.form.signatureUrl = value;
			console.log(this.form);
		},
        handleOpen(item, type) {
            const {processOrderNo, taskId, modelNodeId,expValue} = item;
            this.form.processOrderNo = processOrderNo;
            this.form.taskId = taskId;
            this.form.modelNodeId = modelNodeId;
            this.form.expValue = expValue;
            this.type = type;
			this.requireComments = item.requireComments;
			this.requireSignature = item.requireSignature;
            console.log(this.form);
            switch(type) {
                case 0:
                    this.title = this.$t('home.transfer');
                    break;
                case 1:
                    this.title = this.$t('home.reject');
                    break;
                case 2:
                    this.title = this.$t('other.agreed');
                    break;
            }
            this.$refs.transfer.open();
        },
        submit() {
            switch(this.type) {
                case 0:
                    this.submitTransfer();
                    break;
                case 1:
                    this.submitTerminate();
                    break;
                case 2:
                    this.submitConsent();
                    break;
            }
        },
        handleSelectUser() {
            this.$refs.SelectUsers.handleOpen();
        },
        handleUsers(arr) {
            this.users = arr;
        },
		handleClose() {
			this.$refs.transfer.close();
			this.form = {
                comment: "",
                processOrderNo: "",
                taskId: "",
                modelNodeId: "",
                expValue: null,
				signatureUrl: ""
            }
		},
        // 同意
        submitConsent() {
			uni.showLoading()
			const that = this;
            postActivitiTransferTask(this.form).then(res => {
				uni.hideLoading()
                if (res.code) {
                    uni.showToast({
                        title: that.$t('home.agreed'),
                        icon: "success",
                        duration: 1000
                    })
					this.$emit("handle");
					this.handleClose();
                } else {
					let message;
					if (res.message.indexOf("2") != -1) {
						message = that.$t('home.flowEnd');
					}
                    uni.showToast({
                        title: message,
                        icon: "error",
                        duration: 1000
                    })
                }
            }).catch(() => {
				uni.hideLoading()
			})
        },
        // 转让
        submitTransfer() {
            if (!this.users.length) {
                uni.showToast({
                    title: this.$t('home.selectTransfer'),
                    icon: "error",
                    duration: 1000
                })
				return
            }
            this.form['assignee'] = this.users[0].id;
			uni.showLoading()
            postTransferTask(this.form).then(res => {
				uni.hideLoading()
                if (res.code) {
                    uni.showToast({
                        title: this.$t('home.transfered'),
                        icon: "success",
                        duration: 1000
                    })
					this.$emit("handle");
                    this.$refs.transfer.close();
                } else {
                    let message;
                    if (res.message.indexOf("2") != -1) {
                    	message = that.$t('home.flowEnd');
                    }
                    uni.showToast({
                        title: message,
                        icon: "error",
                        duration: 1000
                    })
                }
            }).catch(() => {
				uni.hideLoading()
			})
        },
        // 驳回
        submitTerminate() {
            if (!this.form.comment) {
                return uni.showToast({
                    title: this.$t('home.rejectIsNot'),
                    icon: "error",
                    duration: 1000
                })
            }
			uni.showLoading()
            postTerminateTask(this.form).then(res => {
				uni.hideLoading()
                if (res.code) {
                    uni.showToast({
                        title: this.$t('home.rejected'),
                        icon: "success",
                        duration: 1000
                    })
					this.$emit("handle");
                    this.$refs.transfer.close();
                } else {
                    let message;
                    if (res.message.indexOf("2") != -1) {
                    	message = that.$t('home.flowEnd');
                    }
                    uni.showToast({
                        title: message,
                        icon: "error",
                        duration: 1000
                    })
                }
            }).catch(() => {
				uni.hideLoading()
			})
        }
    }
}
</script>

<style lang="scss" scoped>
.popup-body {
    padding: 60rpx 40rpx;
}
.mt {
    margin-top: 40rpx;
    border:2rpx solid #D6AE7B;
    background-color: #FFFFFF;
}
.tab-users {
    width: 490rpx;
    padding: 10rpx 24rpx;
    background: #F5F5F5;
    height: 80rpx;
    border-radius: 10rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .tab-users-item {
        flex: 1;
        display: flex;
        align-items: center;

        .tab-users-name {
            width: 160rpx;
            height: 60rpx;
            background: #FFFFFF;
            border-radius: 8rpx;
            line-height: 60rpx;
            padding: 0 20rpx;
            display: flex;
            justify-content: space-between;
        }
    }
}
.sign-but {
			width: 180rpx;
			height: 60rpx;
			background: #FFFFFF;
			border: 2rpx solid #D6AE7B;
			border-radius: 30rpx;
			line-height: 60rpx;
			text-align: center;
			color: #D6AE7B;
		}
		.flex {
			display: flex;
			align-items: center;
		}
		.img {
			height: 120rpx;
			transform: rotate(-90deg);
		}
</style>
