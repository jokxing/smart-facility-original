<template>
    <view class="asset-card list-default">
        <view class="asset-img">
            <image mode="widthFix" :src="items['logoUrl'] ? baseUrl + items.logoUrl : ''"></image>
        </view>
        <view class="asset-message">
            <view class="h2-title">{{items.instrumentName}}</view>
            <view class="list-apply-date">
                <view class="list-lable">{{$t('home.no')}}：</view>
                <text>{{items.instrumentNo}}</text>
            </view>
            <view class="list-apply-date">
                <view class="list-lable">{{$t('home.model')}}：</view>
                <text>{{items.instrumentModel}}</text>
            </view>
            <view class="list-apply-date">
                <view class="list-lable">{{$t('home.storageLocation')}}：</view>
                <text>{{items.storageLocation}}</text>
            </view>
            <view class="list-apply-date">
                <view class="list-lable">{{$t('home.manageUserName')}}：</view>
                <text>{{items.manageUserName}}</text>
            </view>
            <view class="list-apply-date">
                <view class="list-lable">{{$t('home.assetCategoryName')}}：</view>
                <text>{{items.assetCategoryName}}</text>
            </view>
            <view class="list-apply-date">
                <view class="list-lable">{{$t('home.owningDepartemnt')}}：</view>
                <text>{{items.departmentName}}</text>
            </view>
        </view>
    </view>
</template>

<script>
import baseUrl from "@/utils/config.js"
export default {
    name: "AssetCard",
    props: {
        items: {
            type: Object,
            default: () => {}
        }
    },
    data() {
        return {
            baseUrl: baseUrl + "/api/file/picUrl?fileName="
        };
    }
}
</script>

<style lang="scss" scoped>
.asset-card {
    display: flex;
    margin-top: 20rpx;
    .asset-img {
        width: 160rpx;
        height: 160rpx;
        background: #F5F5F5;
        border-radius: 10rpx;
        margin-right: 40rpx;
        image {
            width: 100%;
        }
    }
    .asset-message {
        .h2-title {
            margin-top: 0;
        }
        .list-apply-date {
            display: flex;
            font-size: 24rpx;
            font-weight: 500;
            line-height: 1.5;
            color: #888888;

            .list-lable {
                margin-right: 16rpx;
            }
        }
    }
}
</style>
