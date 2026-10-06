<!-- 选择成员 -->
<template>
    <view>
        <uni-popup ref="selectUsers" type="bottom" class="popup" backgroundColor="#fff">
            <view class="popup-body">
                <view class="h2-title">
                    {{$t('other.changeUse')}}
                </view>
                <view style="color: #999999;line-height: 1.5;">{{$t('other.change')}}</text>
                    <uni-easyinput class="mt" suffixIcon="search" v-model="items.keyword" :placeholder="$t('other.inputUserName')" @input="handleGetUserList()" @iconClick="handleGetUserList()"></uni-easyinput>
                </view>
                <view class="mt">
                    <uni-data-checkbox :max="1" :map="options" v-model="baseFormData" multiple :localdata="users" />
                </view>
                <view style="color: #999999;" class="mt">{{$t('other.chcked')}}</text>
                    <view class="users mt">
                        <view class="tab-users-item">
                            <view class="tab-users-name" v-for="item in checkUsers" :key="item.id">
                                <text>{{ item.name }}</text>
                                <uni-icons type="closeempty" size="20" color="#888888" />
                            </view>
                        </view>
                    </view>
                </view>
                <button style="background: #D6AE7B;" type="primary" @click="submit('valiForm')">{{$t('common.confirm')}}</button>
                <button class="mt" @click="$refs.selectUsers.close()">{{$t('common.cancel')}}</button>
            </view>
        </uni-popup>
    </view>
</template>

<script>
import {
    getUserList
} from "@/utils/api.js"
import {
    arrayToHeavy
} from "@/utils/methods.js"
export default {
    name: "SelectUsers",
    data() {
        return {
            valeu: "",
            baseFormData: "",
            users: [],
            checkUsers: [],
            items: {
                departmentId: "",
                keyword: "",
                pageNum: 1,
                pageSize: 10,
                isDelete: 0
            },
            options: {
                text: "name",
                value: "id"
            },
            usersObj: {}
        };
    },
    watch: {
        baseFormData: {
            handler(arr) {
                if (arr.length) {
                    arr.map(item => {
                        if (this.usersObj[item]) {
                            this.checkUsers.push(this.usersObj[item]);
                        }
                    })
                    this.checkUsers = arrayToHeavy(this.checkUsers, "id");
                } else {
                    this.checkUsers = [];
                }
            },
            deep: true
        }
    },
    methods: {
        handleOpen() {
            this.$refs.selectUsers.open();
            this.handleGetUserList();
        },
        handleGetUserList() {
            uni.showLoading();
            getUserList(this.items).then(res => {
                if (res.code) {
                    this.users = res.items.list;
                    this.usersObj = this.users.reduce((prev, current) => {
                        prev[current.id] = current;
                        return prev;
                    }, {})
                }
            }).finally(() => {
                uni.hideLoading();
            })
        },
        submit() {
            this.$emit("handle", this.checkUsers);
            this.$refs.selectUsers.close();
        }
    }
}
</script>

<style lang="scss" scoped>
.popup-body {
    padding: 60rpx 40rpx;
    height: 800rpx;
}

.mt {
    margin-top: 40rpx;
}

.tab-users-item {
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    .tab-users-name {
        width: 160rpx;
        height: 60rpx;
        background: #F4F4F9;
        border-radius: 8rpx;
        line-height: 60rpx;
        padding: 0 20rpx;
        display: flex;
        justify-content: space-between;
        margin-right: 16rpx;
        margin-bottom: 16rpx;
    }
}
</style>
