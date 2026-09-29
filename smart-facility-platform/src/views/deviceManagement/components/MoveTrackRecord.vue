<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        title="移动轨迹记录"
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
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
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
                        label: "序号",
                        type: "index",
                        width: "60"
                    },
                    {
                        label: "标签编号",
                        prop: "labelNo"
                    },
                    {
                        label: "移动设备",
                        prop: "instrumentName",
                        width: "160"
                    },
                    {
                        label: "移动前网关",
                        prop: "lastGatewayName"
                    },
                    {
                        label: "移动后网关",
                        prop: "currentGatewayName"
                    },
                    {
                        label: "记录时间",
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