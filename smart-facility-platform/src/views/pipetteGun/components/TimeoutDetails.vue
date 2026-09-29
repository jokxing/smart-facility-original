<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        :title="$t('labDevice.historyUseLog')"
        :visible.sync="dialogVisible"
        append-to-body
        destroy-on-close
        width="45%">
        <div v-loading="loading">
            <Table :data="list" :tableData="tableData" v-loading="loading">
                <template v-slot="data">
                    <div>
                        {{ data.data.pipetteGunUser || $t('labDevice.unregistered') }}
                    </div>
                </template>
            </Table>
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
    import Pagination from "@c/Pagination/index";
    import { postGunDetailsTimeoutDetails } from "@/api/gun";
    export default {
        components: {
            Table,
            Pagination
        },
        props: {
            no: {
                type: String,
                default: ""
            },
        },
        data() {
            const _this = this;
            return {
                dialogVisible: false,
                loading: false,
                tableData: [
                    {
                        label: "#",
                        type: "index",
                        width: "60"
                    },
                    {
                        label: _this.$t('labDevice.gunName'),
                        prop: "name",
                    },
                    {
                        label: _this.$t('labDevice.gunNo'),
                        prop: "no"
                    },
                    {
                        label: _this.$t('labDevice.placeGun'),
                        prop: "gunRackName",
                    },
                    {
                        label: _this.$t('common.principal'),
                        prop: "headUser",
                    },
                    {
                        label: _this.$t('common.owningDepartment'),
                        prop: "departmentName",
                    },
                    {
                        label: _this.$t('labDevice.lastUse'),
                        prop: "endUserName",
                        width: "80"
                    },
                ],
                list: [],
                items: {
                    no: "",
                    pageNum: 1,
                    pageSize: 10,
                    type: null,
                    statisticsTimeCommon: {}
                },
                total: 0,
            }
        },
        methods: {
            open(type,no,common) {
                this.dialogVisible = true;
                this.items.no = no;
                this.items.type = type;
                this.items.statisticsTimeCommon = common;
                this.getList()
            },
            getList() {
                this.loading = true;
                postGunDetailsTimeoutDetails(this.items).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.list = res.items.list;
                    }
                })
            },
            handleClose() {
                this.dialogVisible = false
            }
        },
    }
</script>