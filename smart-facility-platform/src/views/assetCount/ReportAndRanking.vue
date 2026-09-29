<template>
    <div class="asset-count">
        <el-row class="session-small" type="flex" justify="space-between">
            <el-col :span="12">
                <AssetTotalReport @handle="handleDeviceMoveData(1,$event)" />
            </el-col>
            <el-col :span="12">
                <AssetMoveNumRanking @handle="handleDeviceMoveData(2,$event)" />
            </el-col>
        </el-row>

        <DeviceMoveData ref="deviceMoveData" />
    </div>
</template>

<script>
    import AssetTotalReport from "./components/AssetTotalReport";
    import AssetMoveNumRanking from "./components/AssetMoveNumRanking";
    import DeviceMoveData from "./components/DeviceMoveData";
    export default {
        components: {
            AssetTotalReport,
            AssetMoveNumRanking,
            DeviceMoveData
        },
        methods: {
            handleDeviceMoveData(index,item) {
                this.$refs.deviceMoveData.open(index,item)
            }
        }
    }
</script>

<style lang="less" scoped>
    @import "./AssetCount.less";
</style>