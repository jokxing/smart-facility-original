<template>
    <el-dialog
        :before-close="handleModalClose"
        :title="$t('labDevice.overTimeNotReturnData')"
        :visible.sync="dialogVisible"
        width="45%"
        top="8vh">
         <div v-loading="loading">
            <Table :tableData="tableData" :data="list" />

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
    import { postTimeoutFrequencyDetails } from "@/api/gun";
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
                items: {
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
                        label: _this.$t('labDevice.gunName'),
                        prop: "name",
                        width: "100"
                    },
                    {
                        label: _this.$t('labDevice.gunNo'),
                        prop: "no"
                    },
                    {
                        label: _this.$t('labDevice.placeGun'),
                        prop: "gunRackName",
                        width: "100"
                    },
                    {
                        label: _this.$t('common.principal'),
                        prop: "headUser",
                    },
                    {
                        label: _this.$t('common.owningRoom'),
                        prop: "departmentName",
                        width: "80"
                    },
                    {
                        label: _this.$t('labDevice.lastUse'),
                        prop: "endUserName",
                        width: "80"
                    },
                ],
                list: [],
                obj: {}
            }
        },
        methods: {
            open(type,data) {
                this.dialogVisible = true;
                this.obj = {
                    type: type,
                    pageNum: this.items.pageNum,
                    pageSize: this.items.pageSize,
                    ...data
                }
                this.getList()
            },
            getList() {
                this.obj.pageNum = this.items.pageNum;
                this.obj.pageSize = this.items.pageSize;
                this.loading = true;
                postTimeoutFrequencyDetails(this.obj).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.list = res.items.list;
                        this.total = res.items.total
                    }
                })
            },
            handleModalClose() {
                this.dialogVisible = false;
                this.list = [];
                this.items = {
                    pageSize: 10,
                    pageNum: 1,
                }
            }
        },
    }
</script>