<template>
    <view class="back-log-list list-default" @click="handleClickItem">
        <view class="list-top">
            <text>{{items.title}}</text>
        </view>
        <view class="list-date">
            <view class="list-apply-date">
                <view class="list-lable">{{$t('home.applyDate')}}</view>
                <text>{{$options.filters['forDateTime'](items.taskStartDate) || $options.filters['forDateTime'](items.applyDate)}}</text>
            </view>
            <view class="list-apply-date">
                <view class="list-lable">{{$t('home.applyUserName1')}}</view>
                <text>{{items.applyUserName}}</text>
            </view>
            <view class="list-apply-date">
                <view class="list-lable">{{$t('home.procOrderNo')}}</view>
                <text>{{items.procOrderNo}}</text>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    name: "backlogList",
    props:{
        items: {
            type: Object,
            default: () => {}
        }
    },
    data() {
        return {

        }
    },
    methods: {
        handleClickItem() {
            this.$emit("handle")
        }
    }
}
</script>

<style lang="scss" scoped>
.back-log-list {
    .list-top {
        font-size: 28rpx;
        font-weight: bold;
        color: #333333;
        line-height: 26rpx;
    }
    .list-date {
        margin-top: 32rpx;
        margin-bottom: -24rpx;
        font-size: 24rpx;
        font-weight: 500;
        color: #888888;
        .list-apply-date {
            display: flex;
            .list-lable {
                width: 120rpx;
                margin-bottom: 24rpx;
                margin-right: 16rpx;
            }
        }
    }
}
</style>
