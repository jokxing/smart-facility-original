<template>
    <el-dialog
        :title="$t('labDevice.overTimeNotReturnData')"
        :before-close="handleClose"
        :visible.sync="dialogVisible"
        width="45%"
        top="8vh">
        <div v-loading="loading">
            <el-row class="overtime-notReturned-data">
                <el-button 
                    v-for="item in overtimes" 
                    :key="item.value" 
                    :type="items.hour === item.value ? 'primary' : ''"
                    @click="handleOvertime(item.value)">
                    {{ item.label }}
                </el-button>
                <div class="num">
                    <span>{{ $t('common.custom') }}</span>
                    <el-input-number v-model="items.hour" :min="0" :precision="1" @change="handleHour"></el-input-number>
                    <span>{{ $t('labDevice.host') }}</span>
                </div>
            </el-row>

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
    import { postGunPipetteNoHomingList } from "@/api/gun";
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
                overtimes: [
                    {
                        value: 0,
                        label: _this.$t('common.all')
                    },
                    {
                        value: 1,
                        label: _this.$t('labDevice.overTime1host')
                    },
                    {
                        value: 2,
                        label: _this.$t('labDevice.overTime2host')
                    },
                    {
                        value: 3,
                        label: _this.$t('labDevice.overTime3host')
                    },
                ],
                items: {
                    hour: 0,
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
                        prop: "gunRackName"
                    },
                    {
                        label: _this.$t('common.principal'),
                        prop: "headUser",
                        width: "80"
                    },
                    {
                        label: _this.$t('common.owningDepartment'),
                        prop: "departmentName"
                    },
                    {
                        label: _this.$t('labDevice.lastUse'),
                        prop: "endUserName",
                        width: "80"
                    },
                ],
                list: []
            }
        },
        methods: {
            open() {
                this.dialogVisible = true;
                this.getList()
            },
            getList() {
                this.loading = true;
                postGunPipetteNoHomingList(this.items).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.list = res.items.list;
                        this.total = res.items.total
                    }
                })
            },
            handleHour() {
                var hour = this.items.hour + "";
                var num = hour.toString().split('.')[1];
                if(num < 5) {
                    this.items.hour = hour.toString().split('.')[0] + '.5'
                }
                if(num > 5){
                    this.$nextTick(() => {
                        this.items.hour = Math.round(this.items.hour)
                    })
                }
                this.getList()
            },
            handleOvertime(value) {
                this.items.hour = value;
                this.getList()
            },
            handleClose() {
                this.dialogVisible = false;
                this.items = {
                    hour: 0,
                    pageSize: 10,
                    pageNum: 1,
                }
            }
        },
    }
</script>

<style lang="less" scoped>
    .overtime-notReturned-data{
        margin-bottom: 20px;
        .num{
            display: inline-block;
            span{
                margin: 0 6px;
            }
            /deep/ .el-input-number--medium{
                width: 150px;
            }
        }
    }
</style>