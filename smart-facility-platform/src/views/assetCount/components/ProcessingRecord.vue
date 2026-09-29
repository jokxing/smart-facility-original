<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        :title="$t('labDevice.disposeLog')"
        :visible.sync="dialogVisible"
        append-to-body
        destroy-on-close
        width="900px">
        <Table :tableData="tableData" :data="list" v-loading="loading"></Table>
        <div class="paging">
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
    import { postPropertyPositionHandleRecord } from "@/api/property"
    export default {
        components: {
            Table,
            Pagination
        },
        data() {
            const _this = this;
            return {
                dialogVisible: false,
                loading: false,
                items: {
                    movePropertyId: null,
                    pageSize: 10,
                    pageNum: 1,
                },
                total: 0,
                tableData: [
                    {
                        label: "#",
                        type: "index",
                        width: "60"
                    },
                    {
                        label: _this.$t('labDevice.labDeviceName'),
                        prop: "instrumentName"
                    },
                    {
                        label: _this.$t('labDevice.labDeviceNo'),
                        prop: "instrumentNo"
                    },
                    {
                        label: _this.$t('hardware.assetTag'),
                        prop: "labelNo"
                    },
                    {
                        label: _this.$t('labDevice.disposeBefore'),
                        prop: "frontPositionName",
                        minWidth: "90"
                    },
                    {
                        label: _this.$t('labDevice.disposeAfter'),
                        prop: "afterPositionName",
                        minWidth: "90"
                    },
                    {
                        label: _this.$t('hardware.processUsername'),
                        prop: "createUserName"
                    },
                    {
                        label: _this.$t('common.owningDepartment'),
                        prop: "departmentName"
                    },
                    {
                        label: _this.$t('hardware.disposeTime'),
                        prop: "createDate",
                        width: "160"
                    },
                ],
                list: []
            }
        },
        methods: {
            open(row){
                this.dialogVisible = true;
                this.items.movePropertyId = row.id;
                this.getList()
            },
            getList() {
                this.loading = true;
                postPropertyPositionHandleRecord(this.items).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.list = res.items.list;
                        this.total = res.items.total;
                    }
                })
            },
            handleClose() {
                this.dialogVisible = false
            }
        },
    }
</script>