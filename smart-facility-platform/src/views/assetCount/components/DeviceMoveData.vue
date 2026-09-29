<template>
    <el-dialog
        :before-close="handleClose"
        :close-on-click-modal="false"
        :title="$t('labDevice.assetMoveData')"
        :visible.sync="dialogVisible"
        append-to-body
        destroy-on-close
        width="800px"
        top="6vh"
        class="device-move-mata">
        <div class="tab" v-if="isTab">
            <el-button 
                v-for="item in tabs" 
                :key="item.value" 
                :type="item.value === active ? 'primary' : ''"
                @click="handleTab(item.value)">
                    {{ item.text }}
            </el-button>
        </div>
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
    import { postPropertyEquipmentStatistics } from "@/api/property";
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
                tabs: [
                    {
                        text: _this.$t('labDevice.notMoveAsset'),
                        value: 1
                    },
                    {
                        text: _this.$t('labDevice.moveAsset'),
                        value: 2
                    }
                ],
                active: 1,
                items: {
                    type: null,
                    yearMonth: "",
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
                        prop: "name"
                    },
                    {
                        label: _this.$t('labDevice.labDeviceNo'),
                        prop: "no"
                    },
                    {
                        label: _this.$t('hardware.assetTag'),
                        prop: "labelName"
                    },
                    {
                        label: _this.$t('labDevice.labDeviceType'),
                        prop: "types",
                        field: "types",
                        class: {
                            1: {
                                text: _this.$t('route.watchlabdevice')
                            },
                            2: {
                                text: _this.$t('route.administration')
                            },
                            3: {
                                text: _this.$t('route.unwatchlabdevice')
                            }
                        }
                    },
                    {
                        label: _this.$t('labDevice.moveNum'),
                        prop: "moveNum",
                        width: "90"
                    },
                ],
                list: [],
                isTab: true
            }
        },
        methods: {
            open(index, item){
                this.dialogVisible = true;
                this.active = 1;
                this.items.yearMonth = item;
                // 1资产统计报告，2资产移动次数排行
                if(index === 1){
                    this.isTab = true;
                    this.items.type = 1
                }else{
                    this.isTab = false;
                    this.items.type = 2
                }

                this.getList()
            },
            getList() {
                this.list = [];
                this.loading = true;
                postPropertyEquipmentStatistics(this.items).then(res => {
                    this.loading = false;
                    if(res.code === 1){
                        this.list = res.items.list;
                        this.total = res.items.total;
                    }
                })
            },
            handleTab(val){
                this.active = val;
                this.items.type = val;
                this.getList()
            },
            handleClose() {
                this.dialogVisible = false
            }
        },
    }
</script>

<style lang="less" scoped>
    .device-move-mata{
        .tab{
            margin-bottom: 10px;
        }
    }
</style>