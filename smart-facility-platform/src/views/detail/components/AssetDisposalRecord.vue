<template>
    <el-dialog
        title="资产处理记录"
        :visible.sync="dialogVisible"
        width="60%"
        :before-close="handleClose"
        destroy-on-close
        :close-on-click-modal="false"
        :modal-append-to-body="false"
        custom-class="asset-detail-dialog">
        <div class="asset-disposal-record">
            <div class="form">
                <span>处理类型</span>
                <el-select v-model="items.type" placeholder="请选择处理类型">
                    <el-option label="全部" value="all"></el-option>
                    <el-option label="1" value="1"></el-option>
                </el-select>
                <el-date-picker
                    v-model="date"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期">
                </el-date-picker>
            </div>

            <Table :tableData="tableData" />

            <pagination
                v-show="total > 10"
                :limit.sync="items.pageSize"
                :page.sync="items.pageNum"
                :total="total"
                @pagination="getList"/>
        </div>
    </el-dialog>
</template>

<script>
    import Table from "@c/Tables";
    import Pagination from "@/components/Pagination/index";
    export default {
        components: {
            Table,
            Pagination
        },
        data() {
            return {
                dialogVisible: false,
                items: {
                    type: "all",
                    pageSize: 1,
                    pageNum: 10
                },
                total: 0,
                date: "",
                tableData: [
                    {
                        label: "处理内容",
                        prop: ""
                    },
                    {
                        label: "处理类型",
                        prop: ""
                    },
                    {
                        label: "创建时间",
                        prop: ""
                    },
                    {
                        label: "处理时间",
                        prop: ""
                    },
                    {
                        label: "处理人",
                        prop: ""
                    },
                    {
                        label: "关联单据",
                        prop: ""
                    },
                ]
            }
        },
        methods: {
            open(){
                this.dialogVisible = true;
            },
            getList() {

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

    .asset-disposal-record{
        .form{
            margin-bottom: 20px;
            span,
            .el-select{
                margin-right: 10px;
            }
        }
    }
</style>