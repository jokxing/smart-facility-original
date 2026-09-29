<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        :title="$t('labDevice.moveLog')"
        :visible.sync="dialogVisible"
        append-to-body
        destroy-on-close
        width="800px"
        top="10vh">
        <div v-loading="loading">
            <div style="margin-bottom: 20px">
                <el-date-picker
                    v-model="date"
                    type="datetimerange"
                    :range-separator="$t('common.most')"
                    :start-placeholder="$t('common.startDate')"
                    :end-placeholder="$t('common.endDate')"
                    @change="handleDate">
                </el-date-picker>
            </div>
            <Table :tableData="tableData" :data="list"></Table>
            <div class="paging">
                <pagination
                    v-show="total > 10"
                    :limit.sync="items.pageSize"
                    :page.sync="items.pageNum"
                    :total="total"
                    @pagination="getList"/>
            </div>
        </div>
    </el-dialog>
</template>

<script>
    import Table from "@c/Tables";
    import Pagination from "@/components/Pagination/index";
    import { postPropertyMove } from "@/api/property";
    import moment from "moment";
    export default {
        components: {
            Table,
            Pagination
        },
        data() {
            const _this = this;
            return {
                loading: false,
                dialogVisible: false,
                date: "",
                items: {
                    pageSize: 10,
                    pageNum: 1,
                    startDate: "",
                    endDate: ""
                },
                total: 0,
                tableData: [
                    {
                        label: "#",
                        type: "index",
                        width: "60"
                    },
                    {
                        label: _this.$t('hardware.labelNo'),
                        prop: "labelNo"
                    },
                    {
                        label: _this.$t('labDevice.moveDevice'),
                        prop: "instrumentName",
                        width: "160"
                    },
                    {
                        label: _this.$t('labDevice.beforeMoveDevice'),
                        prop: "lastGatewayName"
                    },
                    {
                        label: _this.$t('labDevice.beforeMoveDevice'),
                        prop: "currentGatewayName"
                    },
                    {
                        label: _this.$t('labDevice.recordTime'),
                        prop: "createDate",
                        width: "160"
                    },
                ],
                list: []
            }
        },
        methods: {
            open(){
                this.dialogVisible = true;
                this.getList()
            },
            getList() {
                this.loading = true;
                postPropertyMove(this.items).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.list = res.items.list;
                        this.total = res.items.total
                    }
                })
            },
            handleDate(e){
                this.items.startDate = moment(e[0]).format("YYYY-MM-DD HH:mm:ss");
                this.items.endDate = moment(e[1]).format("YYYY-MM-DD HH:mm:ss");
                this.getList()
            },
            handleClose() {
                this.dialogVisible = false
            }
        },
    }
</script>