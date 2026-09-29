<template>
    <el-dialog
        title="资产详情"
        :visible.sync="dialogVisible"
        width="65%"
        :before-close="handleClose"
        destroy-on-close
        :close-on-click-modal="false"
        :modal-append-to-body="false"
        custom-class="asset-detail-dialog">
        <div class="asset-detail">
            <el-descriptions title="基本信息" :column="2">
                <el-descriptions-item label="名称">
                    单机版温湿度记录仪001
                </el-descriptions-item>
                <el-descriptions-item label="编号">
                    CDEWS0112
                </el-descriptions-item>
                <el-descriptions-item label="分类">
                    默认分类
                </el-descriptions-item>
                <el-descriptions-item label="规格型号">
                    海尔生物医用冰箱
                </el-descriptions-item>
                <el-descriptions-item label="品牌">
                    haier
                </el-descriptions-item>
                <el-descriptions-item label="图片">
                    <img src="../../../assets/dataV/bg-three.png">
                </el-descriptions-item>
            </el-descriptions>
            
            <el-descriptions title="安装部门信息" :column="2">
                <el-descriptions-item label="存放地点">
                    光谷园区/1号楼/3层/302房间
                </el-descriptions-item>
                <el-descriptions-item label="安装部门">
                    设备一部
                </el-descriptions-item>
                <el-descriptions-item label="责任人">
                    张闻天
                </el-descriptions-item>
                <el-descriptions-item label="安装时间">
                    2022-01-25
                </el-descriptions-item>
            </el-descriptions>

            <el-descriptions title="使用信息" :column="2">
                <el-descriptions-item label="使用部门">
                    生产一部
                </el-descriptions-item>
                <el-descriptions-item label="管理人">
                    张闻天
                </el-descriptions-item>
                <el-descriptions-item label="是否计量">
                    是
                </el-descriptions-item>
                <el-descriptions-item label="校验日期">
                    2022-01-25
                </el-descriptions-item>
                <el-descriptions-item label="验证情况">
                    需要
                </el-descriptions-item>
                <el-descriptions-item label="SOP情况">
                    需要
                </el-descriptions-item>
            </el-descriptions>

            <el-descriptions title="资产信息" :column="2">
                <el-descriptions-item label="采购日期">
                    2022-04-15
                </el-descriptions-item>
                <el-descriptions-item label="合同编号">
                    wiu0214455
                </el-descriptions-item>
                <el-descriptions-item label="含税金额">
                    15423元
                </el-descriptions-item>
                <el-descriptions-item label="资产编号">
                    0212154478
                </el-descriptions-item>
            </el-descriptions>

            <el-descriptions title="电气参数" :column="2">
                <el-descriptions-item label="电压">
                    220V
                </el-descriptions-item>
                <el-descriptions-item label="额定功率">
                    3000W
                </el-descriptions-item>
            </el-descriptions>

            <el-descriptions title="厂家" :column="2">
                <el-descriptions-item label="联系人">
                    刘传峰
                </el-descriptions-item>
                <el-descriptions-item label="电话">
                    021-2541532
                </el-descriptions-item>
                <el-descriptions-item label="制造商">
                    刘传峰
                </el-descriptions-item>
                <el-descriptions-item label="供应商">
                    刘传峰
                </el-descriptions-item>
            </el-descriptions>

            <el-descriptions title="其他信息" :column="2">
                <el-descriptions-item label="资产标签编号">
                    23234234
                </el-descriptions-item>
                <el-descriptions-item label="标签电量">
                    4V
                </el-descriptions-item>
            </el-descriptions>
        </div>
    </el-dialog>
</template>

<script>
    export default {
        data() {
            return {
                dialogVisible: false
            }
        },
        methods: {
            open(){
                this.dialogVisible = true;
            },
            handleClose() {
                this.dialogVisible = false
            }
        },
    }
</script>

<style lang="less" scoped>
    /deep/ .asset-detail-dialog{
        .el-dialog__body{
            padding-top: 10px;
        }
    }
    .asset-detail{
        padding: 0 10px;
        /deep/ .el-descriptions-item__label:not(.is-bordered-label){
            text-align: right;
            padding-right: 10px;
        }
        /deep/ .el-descriptions__header{
            margin-bottom: 10px;
        }
        img{
            width: 80px;
        }
    }
</style>